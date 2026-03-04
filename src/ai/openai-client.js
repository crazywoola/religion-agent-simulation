import { DEFAULT_LOCALE, localeName, normalizeLocale } from '../config/runtime.js';
import {
  normalizeClassics,
  normalizeLongDescription,
  normalizeMetric
} from '../domain/normalization.js';
import { clamp } from '../utils/math.js';
import {
  formatErrorDetail,
  normalizeInteger,
  sleep,
  truncateText
} from '../utils/common.js';
import {
  DEFAULT_AI_PROVIDER,
  firstNonEmptyEnv,
  listAvailableProviders,
  normalizeProvider,
  resolveProviderPreset
} from './providers.js';

function parseJsonPayload(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return null;
  }

  const trimmed = rawContent.trim();
  const tryParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const direct = tryParse(trimmed);
  if (direct) {
    return direct;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const parsed = tryParse(fenced[1].trim());
    if (parsed) {
      return parsed;
    }
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const parsed = tryParse(trimmed.slice(firstBrace, lastBrace + 1));
    if (parsed) {
      return parsed;
    }
  }

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return tryParse(trimmed.slice(firstBracket, lastBracket + 1));
  }

  return null;
}

export class OpenAIClient {
  constructor() {
    const defaultPreset = resolveProviderPreset(DEFAULT_AI_PROVIDER);
    this.provider = DEFAULT_AI_PROVIDER;
    this.providerLabel = defaultPreset.label;
    this.apiKey = '';
    this.baseUrl = defaultPreset.defaultBaseUrl;
    this.model = defaultPreset.defaultModel;
    this.enabled = false;
    this.setProvider(process.env.AI_PROVIDER || process.env.OPENAI_PROVIDER || DEFAULT_AI_PROVIDER);
    this.enabled = Boolean(this.apiKey);

    this.logEnabled = (process.env.AI_API_LOG ?? process.env.OPENAI_API_LOG ?? '1') !== '0';
    this.logPayload = (process.env.AI_API_LOG_PAYLOAD ?? process.env.OPENAI_API_LOG_PAYLOAD) === '1';
    this.transferAgentEnabled =
      (process.env.AI_TRANSFER_AGENT ?? process.env.OPENAI_TRANSFER_AGENT ?? '1') !== '0';
    this.timeoutMs = clamp(
      normalizeInteger(process.env.AI_API_TIMEOUT_MS ?? process.env.OPENAI_API_TIMEOUT_MS, 25000),
      1000,
      120000
    );
    this.maxRetries = clamp(
      normalizeInteger(process.env.AI_API_MAX_RETRIES ?? process.env.OPENAI_API_MAX_RETRIES, 2),
      0,
      8
    );
    this.retryBaseDelayMs = clamp(
      normalizeInteger(
        process.env.AI_API_RETRY_BASE_DELAY_MS ?? process.env.OPENAI_API_RETRY_BASE_DELAY_MS,
        350
      ),
      50,
      30000
    );
    this.requestSeq = 0;
  }

  setProvider(providerId) {
    const provider = normalizeProvider(providerId);
    const preset = resolveProviderPreset(provider);
    const wasEnabled = this.enabled;

    this.provider = provider;
    this.providerLabel = preset.label;
    this.apiKey = firstNonEmptyEnv(...preset.apiKeyEnvKeys);
    this.baseUrl =
      (firstNonEmptyEnv(...preset.baseUrlEnvKeys) || preset.defaultBaseUrl).replace(/\/+$/, '');
    this.model = firstNonEmptyEnv(...preset.modelEnvKeys) || preset.defaultModel;
    this.enabled = Boolean(wasEnabled && this.apiKey);
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled && this.apiKey);
  }

  log(event, payload) {
    if (!this.logEnabled) {
      return;
    }
    console.log(`[AI:${this.provider}][${event}] ${JSON.stringify(payload)}`);
  }

  isRetryableNetworkError(err) {
    const code = String(err?.code || err?.cause?.code || '').toUpperCase();
    if (
      [
        'ECONNRESET',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'EHOSTUNREACH',
        'ENETUNREACH',
        'UND_ERR_CONNECT_TIMEOUT',
        'UND_ERR_HEADERS_TIMEOUT',
        'UND_ERR_SOCKET',
        'ABORT_ERR'
      ].includes(code)
    ) {
      return true;
    }

    if (err?.name === 'AbortError') {
      return true;
    }

    const message = `${err?.message || ''} ${err?.cause?.message || ''}`.toLowerCase();
    return (
      message.includes('fetch failed') ||
      message.includes('network') ||
      message.includes('socket') ||
      message.includes('timed out') ||
      message.includes('connection reset')
    );
  }

  isRetryableHttpStatus(status) {
    return [408, 409, 425, 429, 500, 502, 503, 504].includes(status);
  }

  parseRetryAfterMs(headerValue) {
    const trimmed = typeof headerValue === 'string' ? headerValue.trim() : '';
    if (!trimmed) {
      return null;
    }
    const asSeconds = Number(trimmed);
    if (Number.isFinite(asSeconds) && asSeconds >= 0) {
      return clamp(Math.round(asSeconds * 1000), 0, 120000);
    }

    const asDate = Date.parse(trimmed);
    if (!Number.isFinite(asDate)) {
      return null;
    }
    return clamp(asDate - Date.now(), 0, 120000);
  }

  computeRetryDelayMs(attempt, retryAfterMs = null) {
    const exponential = this.retryBaseDelayMs * 2 ** Math.max(0, attempt - 1);
    const jitter = Math.floor(Math.random() * this.retryBaseDelayMs);
    const computed = clamp(exponential + jitter, this.retryBaseDelayMs, 120000);
    if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
      return Math.max(computed, retryAfterMs);
    }
    return computed;
  }

  async waitBeforeRetry({ callId, trace, attempt, maxAttempts, reason, retryAfterMs = null }) {
    const delayMs = this.computeRetryDelayMs(attempt, retryAfterMs);
    this.log('request.retry_wait', {
      callId,
      trace,
      attempt,
      maxAttempts,
      reason,
      delayMs
    });
    await sleep(delayMs);
  }

  async chat(messages, options = {}) {
    if (!this.enabled) {
      return null;
    }

    const trace = options.trace || 'chat';
    const callId = `${Date.now()}-${++this.requestSeq}`;
    const startedAt = Date.now();
    const url = `${this.baseUrl}/chat/completions`;
    const requestBody = {
      model: this.model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500,
      messages
    };
    const maxAttempts = this.maxRetries + 1;
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;

    this.log('request.start', {
      callId,
      trace,
      provider: this.provider,
      method: 'POST',
      url,
      model: requestBody.model,
      messageCount: messages.length,
      temperature: requestBody.temperature,
      maxTokens: requestBody.max_tokens,
      timeoutMs,
      maxAttempts
    });

    if (this.logPayload) {
      this.log('request.payload', {
        callId,
        trace,
        messages: messages.map((msg, index) => ({
          index,
          role: msg.role,
          contentPreview: truncateText(msg.content, 500)
        }))
      });
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response;
      let timeoutHandle = null;
      const controller = new AbortController();
      try {
        timeoutHandle = setTimeout(() => {
          controller.abort();
        }, timeoutMs);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
      } catch (err) {
        const retryable = this.isRetryableNetworkError(err);
        this.log('request.network_error', {
          callId,
          trace,
          durationMs: Date.now() - startedAt,
          attempt,
          maxAttempts,
          error: formatErrorDetail(err),
          retryable
        });

        if (retryable && attempt < maxAttempts) {
          await this.waitBeforeRetry({
            callId,
            trace,
            attempt,
            maxAttempts,
            reason: 'network'
          });
          continue;
        }

        throw new Error(`AI network failure (${this.providerLabel}): ${formatErrorDetail(err)}`);
      } finally {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
      }

      if (!response.ok) {
        const detail = await response.text();
        const retryable = this.isRetryableHttpStatus(response.status);
        const retryAfterMs = this.parseRetryAfterMs(response.headers.get('retry-after'));
        this.log('request.http_error', {
          callId,
          trace,
          durationMs: Date.now() - startedAt,
          attempt,
          maxAttempts,
          status: response.status,
          requestId: response.headers.get('x-request-id') || null,
          retryAfterMs,
          retryable,
          detail: truncateText(detail, 1000)
        });

        if (retryable && attempt < maxAttempts) {
          await this.waitBeforeRetry({
            callId,
            trace,
            attempt,
            maxAttempts,
            reason: `http_${response.status}`,
            retryAfterMs
          });
          continue;
        }

        throw new Error(
          `AI provider failed (${this.providerLabel}) ${response.status}: ${truncateText(detail, 1000)}`
        );
      }

      const payload = await response.json();
      this.log('request.success', {
        callId,
        trace,
        durationMs: Date.now() - startedAt,
        attempt,
        maxAttempts,
        status: response.status,
        requestId: response.headers.get('x-request-id') || null,
        responseId: payload?.id || null,
        usage: payload?.usage || null,
        choiceCount: Array.isArray(payload?.choices) ? payload.choices.length : 0
      });
      return payload?.choices?.[0]?.message?.content || null;
    }

    throw new Error(`AI request exhausted all retries (${this.providerLabel})`);
  }

  async generateProfiles(seedAgents) {
    if (!this.enabled) {
      return seedAgents;
    }

    const prompt = `你正在构建“宗教间同化转移”模拟器。请输出严格 JSON（不要 markdown），格式：\n{\n  "religions": [\n    {\n      "name": "宗教名",\n      "doctrine": "一句话教义（中文）",\n      "doctrineLong": "80~140字的较长教义描述（中文）",\n      "classics": ["经典著作1", "经典著作2"],\n      "style": "一句话传教方式（中文）",\n      "metrics": {"zeal": 0-1, "persuasion": 0-1, "openness": 0-1, "retention": 0-1}\n    }\n  ]\n}\n\n约束：\n1) 仅返回以下宗教：${seedAgents.map((r) => r.name).join('、')}\n2) 文本保持中立、尊重\n3) 每个宗教 classics 提供 2~5 项\n4) 指标不要极端。`;

    try {
      const content = await this.chat(
        [
          {
            role: 'system',
            content: '你是严谨的数据建模助手，只输出合法 JSON。'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.45, maxTokens: 1400, trace: 'profile_generation' }
      );

      const parsed = parseJsonPayload(content);
      const list = Array.isArray(parsed?.religions) ? parsed.religions : null;
      if (!list) {
        return seedAgents;
      }

      const byName = new Map(list.map((item) => [item.name, item]));
      return seedAgents.map((seed) => {
        const hit = byName.get(seed.name);
        if (!hit) {
          return seed;
        }
        return {
          ...seed,
          doctrine: typeof hit.doctrine === 'string' ? hit.doctrine : seed.doctrine,
          doctrineLong: normalizeLongDescription(hit.doctrineLong, seed.doctrineLong),
          classics: normalizeClassics(hit.classics, seed.classics),
          style: typeof hit.style === 'string' ? hit.style : seed.style,
          metrics: normalizeMetric(hit.metrics || seed.metrics)
        };
      });
    } catch (err) {
      console.warn('AI profile generation fallback:', formatErrorDetail(err));
      return seedAgents;
    }
  }

  async generateRoundActions(round, agents, socialSignals, topTransfers, locale = DEFAULT_LOCALE) {
    if (!this.enabled) {
      return null;
    }

    const lang = normalizeLocale(locale);
    const prompt = `Round ${round} in religion assimilation simulation.\nReturn strict JSON array only (no markdown).\n\nSchema:\n[\n  {"name":"religion name","action":"one short sentence"}\n]\n\nRequirements:\n1) Use exactly these religion names: ${agents.map((a) => a.name).join(', ')}\n2) Write action text in ${localeName(lang)}\n3) Keep neutral and respectful tone\n\nsocialSignals=${JSON.stringify(socialSignals)}\nkeyTransfers=${JSON.stringify(topTransfers.slice(0, 6))}\nreligionState=${JSON.stringify(
      agents.map((a) => ({
        name: a.name,
        followers: a.followers,
        delta: a.delta,
        transferIn: a.transferIn,
        transferOut: a.transferOut,
        doctrine: a.doctrine,
        style: a.style,
        strategyFocus: a.strategyFocus || [],
        strategy: a.strategy
          ? {
              tempo: a.strategy.tempo,
              fatigue: a.strategy.fatigue,
              defensiveFocus: a.strategy.defensiveFocus
            }
          : null
      }))
    )}`;

    try {
      const content = await this.chat(
        [
          {
            role: 'system',
            content:
              'You are a simulation log generator. Return valid JSON only, no prose, no markdown.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.75, maxTokens: 1000, trace: `round_actions_${round}` }
      );

      const parsed = parseJsonPayload(content);
      if (!Array.isArray(parsed)) {
        return null;
      }

      const actionMap = new Map();
      for (const item of parsed) {
        if (item && typeof item.name === 'string' && typeof item.action === 'string') {
          actionMap.set(item.name, item.action.trim());
        }
      }
      return actionMap;
    } catch (err) {
      console.warn('AI round action fallback:', formatErrorDetail(err));
      return null;
    }
  }

  async generateTransferStructure(
    round,
    agents,
    socialSignals,
    baselineTransfers,
    locale = DEFAULT_LOCALE
  ) {
    if (!this.enabled || !this.transferAgentEnabled) {
      return null;
    }

    const lang = normalizeLocale(locale);
    const religionNames = agents.map((a) => a.name).join(', ');
    const agentState = agents.map((a) => ({
      name: a.name,
      followers: a.followers,
      openness: a.metrics.openness,
      retention: a.metrics.retention,
      zeal: a.metrics.zeal,
      persuasion: a.metrics.persuasion,
      strategyFocus: a.strategyFocus || [],
      strategy: a.strategy
        ? {
            tempo: a.strategy.tempo,
            fatigue: a.strategy.fatigue,
            momentum: a.strategy.momentum,
            defensiveFocus: a.strategy.defensiveFocus
          }
        : null
    }));
    const prompt = `Return strict JSON only. No markdown.

Schema:
{
  "structureOutput": {
    "links": [
      {
        "from": "source religion name (losing followers)",
        "to": "target religion name (gaining followers)",
        "amount": 123,
        "reason": "short reason"
      }
    ]
  }
}

Rules:
1) Allowed religions: ${religionNames}
2) from must not equal to
3) amount must be positive integer, recommended 20-420
4) Return 10-18 links
5) Use social signals and baseline links as priors
6) reason must be in ${localeName(lang)}
7) Keep flows realistic: avoid one-sided extreme concentration, and keep link amounts consistent with retention/openness/strategy signals

socialSignals=${JSON.stringify(socialSignals)}
baselineLinks=${JSON.stringify(baselineTransfers.slice(0, 12))}
religionState=${JSON.stringify(agentState)}`;

    try {
      const content = await this.chat(
        [
          {
            role: 'system',
            content:
              'You are a strict data agent. Return valid JSON only. No prose, no markdown.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.55, maxTokens: 1400, trace: `round_transfer_structure_${round}` }
      );

      const parsed = parseJsonPayload(content);
      const rawLinks = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.links)
          ? parsed.links
          : Array.isArray(parsed?.structureOutput?.links)
            ? parsed.structureOutput.links
            : null;
      if (!rawLinks) {
        return null;
      }

      const links = rawLinks
        .map((item) => ({
          from: typeof item?.from === 'string' ? item.from.trim() : '',
          to: typeof item?.to === 'string' ? item.to.trim() : '',
          amount: normalizeInteger(item?.amount, 0),
          reason: typeof item?.reason === 'string' ? item.reason.trim() : 'AI transfer estimate'
        }))
        .filter((item) => item.from && item.to && item.from !== item.to && item.amount > 0);

      return links.length ? links : null;
    } catch (err) {
      console.warn('AI transfer structure fallback:', formatErrorDetail(err));
      return null;
    }
  }

  async generateReport(snapshot) {
    if (!this.enabled) {
      return null;
    }

    const religionSummary = snapshot.religions.map((r) => ({
      name: r.name,
      followers: r.followers,
      delta: r.delta,
      transferIn: r.transferIn,
      transferOut: r.transferOut,
      exitBarrier: r.exitBarrier,
      doctrine: r.doctrine,
      doctrineLong: r.doctrineLong,
      classics: r.classics,
      metrics: r.metrics,
      traits: r.traits,
      governance: r.governance,
      strategyFocus: r.strategyFocus,
      strategy: r.strategy,
      historyTrend: r.history
        ? `start=${r.history[0]}, current=${r.history[r.history.length - 1]}, min=${Math.min(...r.history)}, max=${Math.max(...r.history)}, rounds=${r.history.length}`
        : 'N/A'
    }));

    const systemPrompt = `You are an interdisciplinary academic writing committee (religious studies, history, and philosophy).

Write in formal academic English and output strict Markdown only.

Hard requirements:
1) Use this section order exactly:
   - # Title
   - ## Abstract
   - ## Keywords
   - ## 1. Introduction
   - ## 2. Methodology and Data
   - ## 3. Empirical Findings
   - ## 4. Discussion
   - ## 5. Conclusion
   - ## References
   - ## Appendix A. Supplementary Tables
2) In "Empirical Findings", include at least 3 explicit claims. For each claim, add one line beginning with "Evidence:" and cite data with bracket citations like [1], [2].
3) Include at least one Markdown table in Methodology/Data and at least one in Appendix.
4) The References section must be a numbered list using bracket format (e.g., [1] ...), and each citation used in the text must appear in References.
5) Keep all interpretations grounded in provided simulation data; avoid theological value judgments.
6) Do not output code fences.`;

    const userPrompt = `Based on the following multi-agent religion simulation data (Round ${snapshot.round}, Scenario: ${snapshot.scenario}), produce a comprehensive academic report.

## Simulation Parameters

**Social Signals (Global Environment):**
${JSON.stringify(snapshot.socialSignals, null, 2)}

**Transfer Engine:** ${snapshot.transferEngine}
**Total Followers (Invariant):** ${snapshot.totalFollowers}

## Religion States
${JSON.stringify(religionSummary, null, 2)}

## Key Transfer Events (Recent)
${JSON.stringify((snapshot.topTransfers || []).slice(0, 15), null, 2)}

## Religious Judgment Records (Blocking/Tribunal Actions)
${JSON.stringify((snapshot.judgmentRecords || []).slice(0, 20), null, 2)}

## Event History (Random Shocks)
${JSON.stringify((snapshot.eventHistory || []).slice(0, 20), null, 2)}

## Recent Mission Logs
${JSON.stringify((snapshot.logs || []).slice(-30), null, 2)}

---

Formatting and argument requirements:
- Use one title line at top.
- Abstract length: 180-260 words.
- Keywords: 5-8 terms.
- Methodology/Data section must explain indicator definitions and include a comparative table across religions.
- Empirical Findings section must contain at least 3 numbered claims, each followed by:
  - "Argument:" (interpretive statement)
  - "Evidence:" (specific numeric evidence from provided data with citations)
- Discussion should integrate religious studies, historical, and philosophical interpretations.
- Conclusion should include limitations and future research directions.
- References must cite simulation data sources from this prompt (e.g., religion states, transfer events, judgment records, event history, logs).
- Appendix must include at least one table with supplementary metrics used in argumentation.`;

    try {
      const content = await this.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          temperature: 0.7,
          maxTokens: 8000,
          timeoutMs: 120000,
          trace: `report_round_${snapshot.round}`
        }
      );
      return content;
    } catch (err) {
      console.warn('AI report generation failed:', formatErrorDetail(err));
      return null;
    }
  }
}

export { listAvailableProviders, normalizeProvider };
