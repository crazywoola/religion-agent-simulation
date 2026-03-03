import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_FOLLOWERS_PER_RELIGION,
  RELIGION_DOCTRINES
} from './data/religion-doctrines.js';
import { GLOBAL_SOCIAL_BASELINE, WORLD_REGIONS } from './data/world-context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const SUPPORTED_LOCALES = ['en', 'zh-CN', 'ja'];
const DEFAULT_LOCALE = 'en';

function normalizeLocale(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_LOCALE;
  }
  if (SUPPORTED_LOCALES.includes(input)) {
    return input;
  }
  const low = input.toLowerCase();
  if (low.startsWith('zh')) {
    return 'zh-CN';
  }
  if (low.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

function localeName(locale) {
  if (locale === 'zh-CN') {
    return 'Simplified Chinese';
  }
  if (locale === 'ja') {
    return 'Japanese';
  }
  return 'English';
}

function randomIn(min, max) {
  return min + (max - min) * Math.random();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeMetric(metrics = {}) {
  return {
    zeal: clamp(Number(metrics.zeal || 0.55), 0.2, 0.95),
    persuasion: clamp(Number(metrics.persuasion || 0.55), 0.2, 0.95),
    openness: clamp(Number(metrics.openness || 0.45), 0.05, 0.95),
    retention: clamp(Number(metrics.retention || 0.72), 0.2, 0.98)
  };
}

function normalizeTraits(traits = {}) {
  return {
    communityService: clamp(Number(traits.communityService || 0.55), 0.1, 0.98),
    digitalMission: clamp(Number(traits.digitalMission || 0.55), 0.1, 0.98),
    ritualDepth: clamp(Number(traits.ritualDepth || 0.55), 0.1, 0.98),
    intellectualDialog: clamp(Number(traits.intellectualDialog || 0.55), 0.1, 0.98),
    youthAppeal: clamp(Number(traits.youthAppeal || 0.55), 0.1, 0.98),
    identityBond: clamp(Number(traits.identityBond || 0.55), 0.1, 0.98),
    institutionCapacity: clamp(Number(traits.institutionCapacity || 0.55), 0.1, 0.98)
  };
}

function normalizeClassics(classics, fallback = []) {
  if (!Array.isArray(classics)) {
    return fallback;
  }
  const clean = classics
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
  return clean.length ? clean : fallback;
}

function normalizeLongDescription(text, fallback = '') {
  if (typeof text !== 'string') {
    return fallback;
  }
  const clean = text.trim();
  if (clean.length < 40) {
    return fallback;
  }
  return clean;
}

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

function localActionText(agent, transfer, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);

  if (lang === 'zh-CN') {
    const movement = transfer.net >= 0 ? '净流入' : '净流出';
    const moves = [
      '发起公开讲座与社群问答',
      '强化基层社群互助和探访',
      '围绕核心教义开展线上传播',
      '通过公益项目提升可见度',
      '针对青年群体进行价值沟通'
    ];
    const pick = moves[Math.floor(Math.random() * moves.length)];
    return `${pick}，本轮${movement}${Math.abs(transfer.net)}人。`;
  }

  if (lang === 'ja') {
    const movement = transfer.net >= 0 ? '純流入' : '純流出';
    const moves = [
      '公開講座とコミュニティQ&Aを実施',
      '地域相互扶助と訪問活動を強化',
      '教義コアを中心にオンライン発信を展開',
      '公益プロジェクトで可視性を向上',
      '若年層向けに価値対話を実施'
    ];
    const pick = moves[Math.floor(Math.random() * moves.length)];
    return `${pick}。このラウンドの${movement}は${Math.abs(transfer.net)}人。`;
  }

  const movement = transfer.net >= 0 ? 'net inflow' : 'net outflow';
  const moves = [
    'Hosted public talks and community Q&A sessions',
    'Strengthened local mutual-aid and outreach visits',
    'Launched online campaigns around core doctrines',
    'Improved visibility through public service initiatives',
    'Focused value-dialogue activities for youth groups'
  ];
  const pick = moves[Math.floor(Math.random() * moves.length)];
  return `${pick}. ${movement}: ${Math.abs(transfer.net)} followers this round.`;
}

function localizedReasonLabel(reasonKey, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const labels = {
    digital_spread: {
      en: 'Digital outreach expansion',
      'zh-CN': '数字化传播扩散',
      ja: 'デジタル発信の拡張'
    },
    community_service: {
      en: 'Community service attraction',
      'zh-CN': '社群服务吸引',
      ja: '地域奉仕による吸引'
    },
    identity_shift: {
      en: 'Identity realignment',
      'zh-CN': '身份认同重组',
      ja: 'アイデンティティ再編'
    },
    meaning_search: {
      en: 'Growing search for meaning',
      'zh-CN': '意义感寻求增强',
      ja: '意味追求の高まり'
    },
    youth_resonance: {
      en: 'Youth issue resonance',
      'zh-CN': '青年议题共鸣',
      ja: '若年層課題との共鳴'
    },
    institutional_pull: {
      en: 'Institutional network pull',
      'zh-CN': '制度型组织吸纳',
      ja: '制度ネットワークの吸引'
    }
  };
  return labels[reasonKey]?.[lang] || labels[reasonKey]?.en || reasonKey;
}

function allocateByScore(total, scoredItems) {
  if (total <= 0 || scoredItems.length === 0) {
    return new Map();
  }

  const sum = scoredItems.reduce((acc, item) => acc + item.score, 0);
  if (sum <= 0) {
    return new Map();
  }

  const plan = new Map();
  let allocated = 0;

  for (const item of scoredItems) {
    const raw = (total * item.score) / sum;
    const base = Math.floor(raw);
    plan.set(item.key, base);
    allocated += base;
  }

  let remainder = total - allocated;
  if (remainder > 0) {
    const withFrac = scoredItems
      .map((item) => {
        const raw = (total * item.score) / sum;
        return {
          key: item.key,
          frac: raw - Math.floor(raw)
        };
      })
      .sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < withFrac.length && remainder > 0; i += 1) {
      const current = plan.get(withFrac[i].key) || 0;
      plan.set(withFrac[i].key, current + 1);
      remainder -= 1;
    }
  }

  return plan;
}

function formatErrorDetail(err) {
  const parts = [];
  if (err?.message) {
    parts.push(err.message);
  }
  if (err?.cause?.code) {
    parts.push(`code=${err.cause.code}`);
  } else if (err?.cause?.message) {
    parts.push(`cause=${err.cause.message}`);
  }
  return parts.join(' | ') || 'unknown_error';
}

function truncateText(text, maxLen = 600) {
  if (typeof text !== 'string') {
    return '';
  }
  if (text.length <= maxLen) {
    return text;
  }
  return `${text.slice(0, maxLen)}...(truncated)`;
}

function normalizeInteger(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.max(0, Math.floor(n));
}

class OpenAIClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.enabled = Boolean(this.apiKey);
    this.logEnabled = process.env.OPENAI_API_LOG !== '0';
    this.logPayload = process.env.OPENAI_API_LOG_PAYLOAD === '1';
    this.transferAgentEnabled = process.env.OPENAI_TRANSFER_AGENT !== '0';
    this.requestSeq = 0;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled && this.apiKey);
  }

  log(event, payload) {
    if (!this.logEnabled) {
      return;
    }
    console.log(`[OpenAI][${event}] ${JSON.stringify(payload)}`);
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

    this.log('request.start', {
      callId,
      trace,
      method: 'POST',
      url,
      model: requestBody.model,
      messageCount: messages.length,
      temperature: requestBody.temperature,
      maxTokens: requestBody.max_tokens
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

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
    } catch (err) {
      this.log('request.network_error', {
        callId,
        trace,
        durationMs: Date.now() - startedAt,
        error: formatErrorDetail(err)
      });
      throw new Error(`OpenAI network failure: ${formatErrorDetail(err)}`);
    }

    if (!response.ok) {
      const detail = await response.text();
      this.log('request.http_error', {
        callId,
        trace,
        durationMs: Date.now() - startedAt,
        status: response.status,
        requestId: response.headers.get('x-request-id') || null,
        detail: truncateText(detail, 1000)
      });
      throw new Error(`OpenAI API failed ${response.status}: ${detail}`);
    }

    const payload = await response.json();
    this.log('request.success', {
      callId,
      trace,
      durationMs: Date.now() - startedAt,
      status: response.status,
      requestId: response.headers.get('x-request-id') || null,
      responseId: payload?.id || null,
      usage: payload?.usage || null,
      choiceCount: Array.isArray(payload?.choices) ? payload.choices.length : 0
    });
    return payload?.choices?.[0]?.message?.content || null;
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
      console.warn('OpenAI profile generation fallback:', formatErrorDetail(err));
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
        style: a.style
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
      console.warn('OpenAI round action fallback:', formatErrorDetail(err));
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
      persuasion: a.metrics.persuasion
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
      console.warn('OpenAI transfer structure fallback:', formatErrorDetail(err));
      return null;
    }
  }
}

class ReligionSimulation {
  constructor(openaiClient) {
    this.openaiClient = openaiClient;
    this.state = null;
    this.totalFollowers = RELIGION_DOCTRINES.length * INITIAL_FOLLOWERS_PER_RELIGION;
  }

  buildSeedAgents() {
    return RELIGION_DOCTRINES.map((seed) => ({
      id: seed.id,
      name: seed.name,
      color: seed.color,
      doctrine: seed.doctrine,
      doctrineLong: seed.doctrineLong,
      classics: normalizeClassics(seed.classics, []),
      style: seed.style,
      metrics: normalizeMetric(seed.metrics),
      traits: normalizeTraits(seed.traits),
      regionalAffinity: seed.regionalAffinity
    }));
  }

  driftSocialSignals(current) {
    const next = {};
    for (const [key, value] of Object.entries(current)) {
      const jitter = key === 'socialFragmentation' ? 0.017 : 0.025;
      next[key] = clamp(value + randomIn(-jitter, jitter), 0.2, 0.95);
    }
    return next;
  }

  sourcePullScore(source, target, socialSignals) {
    const src = source.traits;
    const tgt = target.traits;
    const signal = socialSignals;

    const outreachPower =
      source.metrics.zeal * 0.23 +
      source.metrics.persuasion * 0.23 +
      src.communityService * (0.05 + signal.economicStress * 0.11) +
      src.digitalMission * (0.05 + signal.digitalization * 0.13) +
      src.ritualDepth * (0.04 + signal.meaningSearch * 0.1) +
      src.intellectualDialog * (0.04 + (1 - signal.socialFragmentation) * 0.08) +
      src.youthAppeal * (0.04 + signal.youthPressure * 0.1) +
      src.institutionCapacity * (0.04 + signal.institutionalTrust * 0.1) +
      src.identityBond * (0.03 + signal.identityPolitics * 0.08);

    const targetLock =
      target.metrics.retention * 0.45 +
      tgt.identityBond * 0.25 +
      tgt.ritualDepth * 0.15 +
      tgt.institutionCapacity * 0.15;

    const susceptibility = clamp((1 - targetLock) * 0.65 + target.metrics.openness * 0.35, 0.05, 0.95);

    const bridge = clamp(
      0.45 +
        (source.metrics.openness + target.metrics.openness) * 0.22 +
        src.intellectualDialog * 0.16 -
        Math.abs(src.ritualDepth - tgt.ritualDepth) * 0.14,
      0.08,
      1
    );

    const momentum = clamp(source.followers / this.totalFollowers, 0.03, 0.5);

    return outreachPower * susceptibility * bridge * momentum * randomIn(0.86, 1.16);
  }

  transferReason(source, target, socialSignals, locale = DEFAULT_LOCALE) {
    const reasons = [
      {
        key: 'digital_spread',
        value: source.traits.digitalMission * socialSignals.digitalization
      },
      {
        key: 'community_service',
        value: source.traits.communityService * socialSignals.economicStress
      },
      {
        key: 'identity_shift',
        value: source.traits.identityBond * socialSignals.identityPolitics
      },
      {
        key: 'meaning_search',
        value: source.traits.ritualDepth * socialSignals.meaningSearch
      },
      {
        key: 'youth_resonance',
        value: source.traits.youthAppeal * socialSignals.youthPressure
      },
      {
        key: 'institutional_pull',
        value: source.traits.institutionCapacity * socialSignals.institutionalTrust
      }
    ].sort((a, b) => b.value - a.value);

    return localizedReasonLabel(reasons[0].key, locale);
  }

  computeTransferPlan(agents, socialSignals, locale = DEFAULT_LOCALE) {
    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    const events = [];

    for (const target of agents) {
      const minReserve = 700;
      const available = Math.max(0, target.followers - minReserve);
      if (available <= 0) {
        continue;
      }

      const churnRate =
        0.003 +
        (1 - target.metrics.retention) * 0.02 +
        target.metrics.openness * 0.012 +
        socialSignals.socialFragmentation * 0.005 +
        socialSignals.migration * 0.005;

      const outBudgetRaw = Math.floor(target.followers * churnRate * randomIn(0.86, 1.14));
      const outBudget = clamp(outBudgetRaw, 0, Math.min(available, Math.floor(target.followers * 0.08)));
      if (outBudget <= 0) {
        continue;
      }

      const candidates = agents
        .filter((source) => source.id !== target.id)
        .map((source) => ({
          source,
          score: this.sourcePullScore(source, target, socialSignals)
        }))
        .filter((item) => item.score > 0.0001);

      if (candidates.length === 0) {
        continue;
      }

      const allocations = allocateByScore(
        outBudget,
        candidates.map((item) => ({ key: item.source.id, score: item.score }))
      );

      for (const item of candidates) {
        const amount = allocations.get(item.source.id) || 0;
        if (amount <= 0) {
          continue;
        }

        deltas.set(target.id, deltas.get(target.id) - amount);
        deltas.set(item.source.id, deltas.get(item.source.id) + amount);
        events.push({
          fromId: target.id,
          fromName: target.name,
          toId: item.source.id,
          toName: item.source.name,
          amount,
          reason: this.transferReason(item.source, target, socialSignals, locale)
        });
      }
    }

    events.sort((a, b) => b.amount - a.amount);
    return { deltas, events };
  }

  buildOutBudgets(agents, socialSignals) {
    const budgets = new Map();
    for (const agent of agents) {
      const minReserve = 700;
      const available = Math.max(0, agent.followers - minReserve);
      if (available <= 0) {
        budgets.set(agent.id, 0);
        continue;
      }

      const churnRate =
        0.003 +
        (1 - agent.metrics.retention) * 0.02 +
        agent.metrics.openness * 0.012 +
        socialSignals.socialFragmentation * 0.005 +
        socialSignals.migration * 0.005;
      const outBudgetRaw = Math.floor(agent.followers * churnRate * randomIn(0.88, 1.12));
      const outBudget = clamp(outBudgetRaw, 0, Math.min(available, Math.floor(agent.followers * 0.08)));
      budgets.set(agent.id, outBudget);
    }
    return budgets;
  }

  computeTransferPlanFromStructure(
    agents,
    socialSignals,
    aiLinks,
    fallbackEvents,
    locale = DEFAULT_LOCALE
  ) {
    const budgets = this.buildOutBudgets(agents, socialSignals);
    const agentById = new Map(agents.map((a) => [a.id, a]));
    const nameToAgent = new Map(agents.map((a) => [a.name, a]));
    const merged = new Map();
    let aiAppliedAmount = 0;

    const addEvent = (fromAgent, toAgent, requestedAmount, reason, sourceTag) => {
      if (!fromAgent || !toAgent || fromAgent.id === toAgent.id) {
        return 0;
      }
      const left = budgets.get(fromAgent.id) || 0;
      if (left <= 0) {
        return 0;
      }

      const pairCap = Math.max(10, Math.floor(fromAgent.followers * 0.035));
      const amount = clamp(normalizeInteger(requestedAmount, 0), 0, Math.min(left, pairCap));
      if (amount <= 0) {
        return 0;
      }

      budgets.set(fromAgent.id, left - amount);
      const key = `${fromAgent.id}->${toAgent.id}`;
      const hit = merged.get(key);
      if (hit) {
        hit.amount += amount;
        if (sourceTag === 'ai') {
          hit.source = 'ai';
          hit.reason = reason || hit.reason;
        }
      } else {
        merged.set(key, {
          fromId: fromAgent.id,
          fromName: fromAgent.name,
          toId: toAgent.id,
          toName: toAgent.name,
          amount,
          reason: reason || localizedReasonLabel('digital_spread', locale),
          source: sourceTag
        });
      }

      if (sourceTag === 'ai') {
        aiAppliedAmount += amount;
      }
      return amount;
    };

    if (Array.isArray(aiLinks)) {
      const sortedAi = [...aiLinks].sort((a, b) => b.amount - a.amount);
      for (const link of sortedAi) {
        const fromAgent = nameToAgent.get(link.from);
        const toAgent = nameToAgent.get(link.to);
        addEvent(fromAgent, toAgent, link.amount, link.reason, 'ai');
      }
    }

    for (const event of fallbackEvents) {
      const fromAgent = agentById.get(event.fromId);
      const toAgent = agentById.get(event.toId);
      addEvent(fromAgent, toAgent, event.amount, event.reason, 'rule');
    }

    const events = [...merged.values()].sort((a, b) => b.amount - a.amount);
    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    for (const event of events) {
      deltas.set(event.fromId, (deltas.get(event.fromId) || 0) - event.amount);
      deltas.set(event.toId, (deltas.get(event.toId) || 0) + event.amount);
    }

    let engine = 'rule';
    if (aiAppliedAmount > 0 && events.some((e) => e.source === 'rule')) {
      engine = 'hybrid';
    } else if (aiAppliedAmount > 0) {
      engine = 'ai';
    }

    return { deltas, events, engine, aiAppliedAmount };
  }

  reconcileInvariant(agents) {
    let total = agents.reduce((sum, agent) => sum + agent.followers, 0);
    let diff = this.totalFollowers - total;

    if (diff === 0) {
      return;
    }

    if (diff > 0) {
      const richest = [...agents].sort((a, b) => b.followers - a.followers)[0];
      richest.followers += diff;
      return;
    }

    const sorted = [...agents].sort((a, b) => b.followers - a.followers);
    for (const agent of sorted) {
      if (diff === 0) {
        break;
      }
      const canLose = Math.max(0, agent.followers - 500);
      if (canLose <= 0) {
        continue;
      }
      const take = Math.min(canLose, Math.abs(diff));
      agent.followers -= take;
      diff += take;
    }
  }

  summarizeTransfers(events, agents) {
    const inflow = new Map(agents.map((a) => [a.id, 0]));
    const outflow = new Map(agents.map((a) => [a.id, 0]));
    const inFrom = new Map(agents.map((a) => [a.id, new Map()]));
    const outTo = new Map(agents.map((a) => [a.id, new Map()]));

    for (const event of events) {
      inflow.set(event.toId, inflow.get(event.toId) + event.amount);
      outflow.set(event.fromId, outflow.get(event.fromId) + event.amount);

      const fromMap = inFrom.get(event.toId);
      fromMap.set(event.fromName, (fromMap.get(event.fromName) || 0) + event.amount);

      const toMap = outTo.get(event.fromId);
      toMap.set(event.toName, (toMap.get(event.toName) || 0) + event.amount);
    }

    const byReligion = new Map();
    for (const agent of agents) {
      const fromMap = inFrom.get(agent.id);
      const toMap = outTo.get(agent.id);

      const topFrom = [...fromMap.entries()].sort((a, b) => b[1] - a[1])[0] || null;
      const topTo = [...toMap.entries()].sort((a, b) => b[1] - a[1])[0] || null;

      byReligion.set(agent.id, {
        inflow: inflow.get(agent.id),
        outflow: outflow.get(agent.id),
        net: inflow.get(agent.id) - outflow.get(agent.id),
        topFrom: topFrom ? { name: topFrom[0], amount: topFrom[1] } : null,
        topTo: topTo ? { name: topTo[0], amount: topTo[1] } : null
      });
    }

    const topPairs = events.slice(0, 12).map((event) => ({
      fromId: event.fromId,
      from: event.fromName,
      toId: event.toId,
      to: event.toName,
      amount: event.amount,
      reason: event.reason,
      source: event.source || 'rule'
    }));

    return { byReligion, topPairs };
  }

  regionFitScore(agent, region, socialSignals) {
    const traits = agent.traits;
    const factors = region.factors;
    const affinity = Number(agent.regionalAffinity?.[region.id] || 0.3);

    const score =
      affinity * 0.36 +
      traits.communityService * (0.03 + factors.economicStress * 0.08) +
      traits.digitalMission * (0.03 + factors.digitalization * 0.09) +
      traits.ritualDepth * (0.03 + factors.meaningSearch * 0.09) +
      traits.intellectualDialog * (0.02 + (1 - socialSignals.socialFragmentation) * 0.06) +
      traits.youthAppeal * (0.02 + factors.youthPressure * 0.07) +
      traits.identityBond * (0.02 + factors.identityPolitics * 0.07) +
      traits.institutionCapacity * (0.02 + factors.institutionalTrust * 0.07);

    return clamp(score, 0.001, 2.5);
  }

  buildRegionalLandscape(agents, socialSignals) {
    const totalFollowers = agents.reduce((sum, agent) => sum + agent.followers, 0);

    return WORLD_REGIONS.map((region) => {
      const regionTotal = Math.max(1200, Math.round(totalFollowers * region.populationWeight));
      const scores = agents.map((agent) => {
        const globalShare = agent.followers / totalFollowers;
        const fit = this.regionFitScore(agent, region, socialSignals);
        const score = Math.max(0.0001, globalShare * fit);
        return {
          id: agent.id,
          name: agent.name,
          color: agent.color,
          score
        };
      });

      const allocations = allocateByScore(
        regionTotal,
        scores.map((item) => ({ key: item.id, score: item.score }))
      );

      const distribution = scores
        .map((item) => {
          const followers = allocations.get(item.id) || 0;
          return {
            id: item.id,
            name: item.name,
            color: item.color,
            followers,
            share: followers / regionTotal
          };
        })
        .sort((a, b) => b.followers - a.followers);

      const dominant = distribution[0];
      const second = distribution[1];
      const competitionIndex = clamp(1 - (dominant.share - second.share), 0, 1);

      return {
        id: region.id,
        name: region.name,
        position: region.position,
        populationWeight: region.populationWeight,
        totalFollowers: regionTotal,
        competitionIndex,
        dominantReligionId: dominant.id,
        dominantReligionName: dominant.name,
        distribution
      };
    });
  }

  findDominantRegionByReligion(regions) {
    const result = new Map();
    for (const region of regions) {
      for (const item of region.distribution) {
        const hit = result.get(item.id);
        if (!hit || item.followers > hit.followers) {
          result.set(item.id, {
            regionId: region.id,
            regionName: region.name,
            position: region.position,
            followers: item.followers
          });
        }
      }
    }
    return result;
  }

  buildStructureOutput(round, topTransfers, regions, transferEngine) {
    const dominantRegionByReligion = this.findDominantRegionByReligion(regions);
    const maxAmount = Math.max(...topTransfers.map((item) => item.amount), 1);

    const antLinks = topTransfers
      .slice(0, 12)
      .map((item, index) => {
        const fromRegion = dominantRegionByReligion.get(item.fromId);
        const toRegion = dominantRegionByReligion.get(item.toId);
        if (!fromRegion || !toRegion) {
          return null;
        }

        const intensity = clamp(item.amount / maxAmount, 0.12, 1);
        const curve = (index % 2 === 0 ? 1 : -1) * (0.6 + intensity * 1.2);
        return {
          id: `${round}-${index}-${item.fromId}-${item.toId}`,
          fromReligionId: item.fromId,
          fromReligionName: item.from,
          toReligionId: item.toId,
          toReligionName: item.to,
          fromRegionId: fromRegion.regionId,
          fromRegionName: fromRegion.regionName,
          toRegionId: toRegion.regionId,
          toRegionName: toRegion.regionName,
          amount: item.amount,
          reason: item.reason,
          source: item.source || 'rule',
          intensity,
          speed: 0.18 + intensity * 0.65,
          ants: 3 + Math.round(intensity * 5),
          curve,
          fromPosition: fromRegion.position,
          toPosition: toRegion.position
        };
      })
      .filter(Boolean);

    return {
      round,
      transferEngine,
      antLinks
    };
  }

  async start({ useOpenAI = true, locale = DEFAULT_LOCALE } = {}) {
    this.openaiClient.setEnabled(useOpenAI);
    const resolvedLocale = normalizeLocale(locale);
    const initPrefix =
      resolvedLocale === 'zh-CN'
        ? '初始化：'
        : resolvedLocale === 'ja'
          ? '初期化：'
          : 'Initialized: ';
    const initialActionTemplate =
      resolvedLocale === 'zh-CN'
        ? '{name}建立传播策略，并围绕核心教义组织社群。'
        : resolvedLocale === 'ja'
          ? '{name}は布教戦略を策定し、教義の核に沿ってコミュニティ活動を開始した。'
          : '{name} established a mission strategy aligned with its core doctrines.';

    const seeds = this.buildSeedAgents();
    const generated = await this.openaiClient.generateProfiles(seeds);

    const agents = generated.map((item) => ({
      ...item,
      followers: INITIAL_FOLLOWERS_PER_RELIGION,
      delta: 0,
      transferIn: 0,
      transferOut: 0,
      topFrom: null,
      topTo: null,
      history: [INITIAL_FOLLOWERS_PER_RELIGION],
      lastAction: initialActionTemplate.replace('{name}', item.name)
    }));

    const startedAt = new Date().toISOString();
    const socialSignals = { ...GLOBAL_SOCIAL_BASELINE };
    const regions = this.buildRegionalLandscape(agents, socialSignals);
    const transferEngine = 'rule';
    const structureOutput = this.buildStructureOutput(0, [], regions, transferEngine);

    this.state = {
      round: 0,
      startedAt,
      updatedAt: startedAt,
      locale: resolvedLocale,
      socialSignals,
      agents,
      regions,
      transferEngine,
      structureOutput,
      topTransfers: [],
      logs: agents.map((agent) => ({
        round: 0,
        time: startedAt,
        religionId: agent.id,
        name: agent.name,
        action: `${initPrefix}${agent.style}`,
        delta: 0,
        transferIn: 0,
        transferOut: 0,
        followers: agent.followers
      }))
    };

    return this.snapshot();
  }

  ensureState() {
    if (!this.state) {
      throw new Error('Simulation has not started. Call /api/simulation/start first.');
    }
    return this.state;
  }

  async tick({ locale } = {}) {
    const state = this.ensureState();
    state.round += 1;
    if (locale) {
      state.locale = normalizeLocale(locale);
    }
    const activeLocale = normalizeLocale(state.locale || DEFAULT_LOCALE);
    state.socialSignals = this.driftSocialSignals(state.socialSignals);

    const rulePlan = this.computeTransferPlan(state.agents, state.socialSignals, activeLocale);
    const aiLinks = await this.openaiClient.generateTransferStructure(
      state.round,
      state.agents,
      state.socialSignals,
      rulePlan.events,
      activeLocale
    );
    const { deltas, events, engine } = this.computeTransferPlanFromStructure(
      state.agents,
      state.socialSignals,
      aiLinks,
      rulePlan.events,
      activeLocale
    );
    state.transferEngine = engine;

    for (const agent of state.agents) {
      agent.delta = deltas.get(agent.id) || 0;
      agent.followers += agent.delta;
    }

    this.reconcileInvariant(state.agents);

    const transferSummary = this.summarizeTransfers(events, state.agents);
    state.topTransfers = transferSummary.topPairs;

    for (const agent of state.agents) {
      const summary = transferSummary.byReligion.get(agent.id);
      agent.transferIn = summary.inflow;
      agent.transferOut = summary.outflow;
      agent.topFrom = summary.topFrom;
      agent.topTo = summary.topTo;
      agent.delta = summary.net;
      agent.history.push(agent.followers);
      if (agent.history.length > 120) {
        agent.history.shift();
      }
    }

    const actionMap = await this.openaiClient.generateRoundActions(
      state.round,
      state.agents,
      state.socialSignals,
      state.topTransfers,
      activeLocale
    );

    const now = new Date().toISOString();
    for (const agent of state.agents) {
      const action =
        actionMap?.get(agent.name) || localActionText(agent, { net: agent.delta }, activeLocale);
      agent.lastAction = action;
      state.logs.push({
        round: state.round,
        time: now,
        religionId: agent.id,
        name: agent.name,
        action,
        delta: agent.delta,
        transferIn: agent.transferIn,
        transferOut: agent.transferOut,
        followers: agent.followers
      });
    }

    if (state.logs.length > 460) {
      state.logs = state.logs.slice(-460);
    }

    state.regions = this.buildRegionalLandscape(state.agents, state.socialSignals);
    state.structureOutput = this.buildStructureOutput(
      state.round,
      state.topTransfers,
      state.regions,
      state.transferEngine
    );
    state.updatedAt = now;
    return this.snapshot();
  }

  snapshot() {
    const state = this.ensureState();
    const totalFollowers = state.agents.reduce((sum, agent) => sum + agent.followers, 0);

    return {
      round: state.round,
      startedAt: state.startedAt,
      updatedAt: state.updatedAt,
      locale: state.locale || DEFAULT_LOCALE,
      useOpenAI: this.openaiClient.enabled,
      totalFollowers,
      invariantOk: totalFollowers === this.totalFollowers,
      targetTotalFollowers: this.totalFollowers,
      socialSignals: state.socialSignals,
      transferEngine: state.transferEngine,
      religions: state.agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        doctrine: agent.doctrine,
        doctrineLong: agent.doctrineLong,
        classics: agent.classics,
        style: agent.style,
        followers: agent.followers,
        delta: agent.delta,
        transferIn: agent.transferIn,
        transferOut: agent.transferOut,
        topFrom: agent.topFrom,
        topTo: agent.topTo,
        metrics: agent.metrics,
        traits: agent.traits,
        lastAction: agent.lastAction,
        history: agent.history
      })),
      regions: state.regions,
      topTransfers: state.topTransfers,
      structureOutput: state.structureOutput,
      logs: state.logs.slice(-160)
    };
  }
}

const app = express();
const openaiClient = new OpenAIClient();
const simulation = new ReligionSimulation(openaiClient);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    now: new Date().toISOString(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    invariant: 'religion_total_constant'
  });
});

app.post('/api/simulation/start', async (req, res) => {
  try {
    const useOpenAI = req.body?.useOpenAI !== false;
    const locale = normalizeLocale(req.body?.locale || DEFAULT_LOCALE);
    const snapshot = await simulation.start({ useOpenAI, locale });
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/simulation/tick', async (req, res) => {
  try {
    const locale = normalizeLocale(req.body?.locale || DEFAULT_LOCALE);
    const snapshot = await simulation.tick({ locale });
    res.json(snapshot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/simulation/state', (_req, res) => {
  try {
    const snapshot = simulation.snapshot();
    res.json(snapshot);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
