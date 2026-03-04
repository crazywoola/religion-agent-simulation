import 'dotenv/config';
import express from 'express';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import {
  INITIAL_FOLLOWERS_PER_RELIGION,
  RELIGION_DOCTRINES
} from './data/religion-doctrines.js';
import { GLOBAL_SOCIAL_BASELINE, WORLD_REGIONS } from './data/world-context.js';
import {
  DEFAULT_SCENARIO,
  SIMULATION_CONFIG,
  SIMULATION_SCENARIOS
} from './data/simulation-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const SUPPORTED_LOCALES = ['en', 'zh-CN', 'ja'];
const DEFAULT_LOCALE = 'en';
const WORLD_REGION_INDEX = new Map(WORLD_REGIONS.map((region) => [region.id, region]));

function normalizeScenario(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_SCENARIO;
  }
  return Object.hasOwn(SIMULATION_SCENARIOS, input) ? input : DEFAULT_SCENARIO;
}

function listAvailableScenarios() {
  return Object.values(SIMULATION_SCENARIOS).map((item) => ({
    id: item.id,
    signalOverrides: item.signalOverrides
  }));
}

function buildScenarioSignalTarget(scenarioId) {
  const scenario = SIMULATION_SCENARIOS[normalizeScenario(scenarioId)] || SIMULATION_SCENARIOS[DEFAULT_SCENARIO];
  const target = { ...GLOBAL_SOCIAL_BASELINE };
  for (const [key, value] of Object.entries(scenario.signalOverrides || {})) {
    target[key] = clamp((target[key] ?? 0.55) + Number(value || 0), 0.2, 0.95);
  }
  return target;
}

function blendSignalsToScenario(current, scenarioId, rate = SIMULATION_CONFIG.scenarioBlendRate) {
  const target = buildScenarioSignalTarget(scenarioId);
  const next = {};
  for (const [key, value] of Object.entries(target)) {
    const currentValue = clamp(Number(current?.[key] ?? GLOBAL_SOCIAL_BASELINE[key] ?? 0.55), 0.2, 0.95);
    next[key] = clamp(currentValue * (1 - rate) + value * rate, 0.2, 0.95);
  }
  return next;
}

function resolveListenHostUrl(host) {
  if (!host || host === '0.0.0.0' || host === '::') {
    return `http://localhost:${PORT}`;
  }
  return `http://${host}:${PORT}`;
}

function getLanUrls(port) {
  const interfaces = os.networkInterfaces();
  const urls = [];
  for (const list of Object.values(interfaces)) {
    for (const info of list || []) {
      if (info.internal || info.family !== 'IPv4') {
        continue;
      }
      urls.push(`http://${info.address}:${port}`);
    }
  }
  return urls;
}

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

function normalizeInlineMarkdown(text = '') {
  return String(text || '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function parseTableRow(line) {
  const text = String(line || '').trim();
  if (!text.includes('|')) {
    return null;
  }
  const compact = text.replace(/^\|/, '').replace(/\|$/, '');
  const cells = compact.split('|').map((cell) => normalizeInlineMarkdown(cell.trim()));
  return cells.length ? cells : null;
}

function isMarkdownTableDivider(line) {
  const text = String(line || '').trim();
  if (!text.includes('|')) {
    return false;
  }
  const compact = text.replace(/^\|/, '').replace(/\|$/, '');
  return compact.split('|').every((segment) => /^:?-{3,}:?$/.test(segment.trim()));
}

function collectMarkdownTable(lines, startIndex) {
  if (!lines[startIndex]) {
    return null;
  }
  if (!lines[startIndex].includes('|') || !isMarkdownTableDivider(lines[startIndex + 1])) {
    return null;
  }
  const header = parseTableRow(lines[startIndex]);
  if (!header) {
    return null;
  }
  const rows = [];
  let cursor = startIndex + 2;
  while (cursor < lines.length) {
    const line = lines[cursor];
    if (!line.trim() || !line.includes('|')) {
      break;
    }
    const row = parseTableRow(line);
    if (!row) {
      break;
    }
    rows.push(row);
    cursor += 1;
  }
  return { header, rows, nextIndex: cursor };
}

function ensurePdfSpace(doc, neededHeight = 24, footerReserve = 26) {
  const bottom = doc.page.height - doc.page.margins.bottom - footerReserve;
  if (doc.y + neededHeight > bottom) {
    doc.addPage();
  }
}

function drawPdfTable(doc, table, pageWidth) {
  const columnCount = Math.max(
    1,
    table.header.length,
    ...table.rows.map((row) => row.length)
  );
  const normalizeRow = (row) =>
    Array.from({ length: columnCount }, (_, index) => normalizeInlineMarkdown(row[index] || ''));

  const header = normalizeRow(table.header);
  const rows = table.rows.map((row) => normalizeRow(row));
  const maxChars = new Array(columnCount).fill(8);
  for (const row of [header, ...rows]) {
    row.forEach((cell, index) => {
      maxChars[index] = Math.max(maxChars[index], Math.min(36, cell.length));
    });
  }

  const totalChars = maxChars.reduce((sum, value) => sum + value, 0);
  const colWidths = maxChars.map((chars) => (pageWidth * chars) / totalChars);
  const startX = doc.page.margins.left;
  const cellPadX = 6;
  const cellPadY = 4;
  const minRowHeight = 18;

  const rowHeight = (row, isHeader = false) => {
    const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';
    const size = isHeader ? 10 : 9.5;
    let height = minRowHeight;
    for (let i = 0; i < row.length; i += 1) {
      const text = row[i];
      const cellWidth = Math.max(30, colWidths[i] - cellPadX * 2);
      doc.font(font).fontSize(size);
      const measured = doc.heightOfString(text || ' ', { width: cellWidth, lineGap: 1 });
      height = Math.max(height, measured + cellPadY * 2);
    }
    return height;
  };

  const drawRow = (row, isHeader = false) => {
    const height = rowHeight(row, isHeader);
    let x = startX;
    const y = doc.y;
    for (let i = 0; i < row.length; i += 1) {
      const width = colWidths[i];
      doc
        .rect(x, y, width, height)
        .fillAndStroke(isHeader ? '#e7edf9' : '#ffffff', '#8a9cb1');
      doc
        .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(isHeader ? 10 : 9.5)
        .fillColor('#1f2b3d')
        .text(row[i], x + cellPadX, y + cellPadY, {
          width: Math.max(30, width - cellPadX * 2),
          lineGap: 1
        });
      x += width;
    }
    doc.y = y + height;
    return height;
  };

  doc.moveDown(0.25);
  ensurePdfSpace(doc, rowHeight(header, true));
  drawRow(header, true);
  for (const row of rows) {
    const currentHeight = rowHeight(row, false);
    const bottom = doc.page.height - doc.page.margins.bottom - 26;
    if (doc.y + currentHeight > bottom) {
      doc.addPage();
      drawRow(header, true);
    }
    drawRow(row, false);
  }
  doc.moveDown(0.35);
}

function generatePdfBuffer(markdownText, metadata = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: metadata.title || 'Religion Simulation Analysis Report',
        Author: 'AI Multi-Agent Religion Simulation',
        Subject: 'Academic analysis of religious dynamics',
        Creator: 'Religion Agent Simulation System'
      },
      bufferPages: true
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const lines = String(markdownText || '').split(/\r?\n/);
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      const trimmed = line.trim();

      const table = collectMarkdownTable(lines, index);
      if (table) {
        drawPdfTable(doc, table, pageWidth);
        index = table.nextIndex;
        continue;
      }

      if (!trimmed) {
        doc.moveDown(0.32);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('```')) {
        const codeLines = [];
        index += 1;
        while (index < lines.length && !lines[index].trim().startsWith('```')) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length && lines[index].trim().startsWith('```')) {
          index += 1;
        }
        const blockText = codeLines.join('\n').trim() || ' ';
        ensurePdfSpace(doc, doc.heightOfString(blockText, { width: pageWidth - 24 }) + 16);
        const y = doc.y;
        const blockHeight = doc.heightOfString(blockText, { width: pageWidth - 24, lineGap: 1.5 }) + 12;
        doc.rect(doc.page.margins.left, y, pageWidth, blockHeight).fill('#f3f5f9');
        doc
          .font('Courier')
          .fontSize(9)
          .fillColor('#2f3747')
          .text(blockText, doc.page.margins.left + 12, y + 6, { width: pageWidth - 24, lineGap: 1.5 });
        doc.y = y + blockHeight + 5;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        ensurePdfSpace(doc, 36);
        doc
          .moveDown(0.45)
          .fontSize(18)
          .font('Helvetica-Bold')
          .fillColor('#13233f')
          .text(normalizeInlineMarkdown(trimmed.slice(2)), { width: pageWidth, lineGap: 2 });
        doc.moveDown(0.2);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        ensurePdfSpace(doc, 30);
        doc
          .moveDown(0.3)
          .fontSize(14.5)
          .font('Helvetica-Bold')
          .fillColor('#1a3356')
          .text(normalizeInlineMarkdown(trimmed.slice(3)), { width: pageWidth, lineGap: 2 });
        doc.moveDown(0.15);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('### ')) {
        ensurePdfSpace(doc, 24);
        doc
          .moveDown(0.2)
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#274469')
          .text(normalizeInlineMarkdown(trimmed.slice(4)), { width: pageWidth });
        doc.moveDown(0.1);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('#### ')) {
        ensurePdfSpace(doc, 20);
        doc
          .fontSize(10.8)
          .font('Helvetica-Bold')
          .fillColor('#274469')
          .text(normalizeInlineMarkdown(trimmed.slice(5)), { width: pageWidth });
        index += 1;
        continue;
      }

      if (trimmed === '---') {
        ensurePdfSpace(doc, 12);
        const y = doc.y + 2;
        doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.margins.left + pageWidth, y).strokeColor('#c4ccd9').lineWidth(0.6).stroke();
        doc.moveDown(0.4);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('>')) {
        const quote = normalizeInlineMarkdown(trimmed.replace(/^>\s?/, ''));
        const quoteHeight = doc.heightOfString(quote, { width: pageWidth - 18, lineGap: 2 }) + 10;
        ensurePdfSpace(doc, quoteHeight);
        const startY = doc.y;
        doc
          .moveTo(doc.page.margins.left + 2, startY)
          .lineTo(doc.page.margins.left + 2, startY + quoteHeight)
          .lineWidth(2)
          .strokeColor('#90a3bd')
          .stroke();
        doc
          .font('Helvetica-Oblique')
          .fontSize(10.5)
          .fillColor('#3a4a63')
          .text(quote, doc.page.margins.left + 10, startY + 2, { width: pageWidth - 16, lineGap: 2 });
        doc.y = startY + quoteHeight + 2;
        index += 1;
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const text = normalizeInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''));
        ensurePdfSpace(doc, 18);
        doc
          .fontSize(10.8)
          .font('Helvetica')
          .fillColor('#222f42')
          .text(`\u2022 ${text}`, doc.page.margins.left + 8, doc.y, { width: pageWidth - 8, lineGap: 2 });
        index += 1;
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const matched = trimmed.match(/^(\d+\.)\s+(.+)$/);
        const label = matched?.[1] || '';
        const text = normalizeInlineMarkdown(matched?.[2] || trimmed);
        ensurePdfSpace(doc, 18);
        doc
          .fontSize(10.8)
          .font('Helvetica')
          .fillColor('#222f42')
          .text(`${label} ${text}`, doc.page.margins.left + 4, doc.y, { width: pageWidth - 4, lineGap: 2 });
        index += 1;
        continue;
      }

      const paragraph = normalizeInlineMarkdown(trimmed);
      ensurePdfSpace(doc, doc.heightOfString(paragraph, { width: pageWidth, lineGap: 2 }) + 4);
      doc
        .fontSize(10.8)
        .font('Helvetica')
        .fillColor('#2a3140')
        .text(paragraph, { width: pageWidth, lineGap: 2, align: 'justify' });
      doc.moveDown(0.06);
      index += 1;
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i += 1) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#8c95a4')
        .text(
          `${metadata.title || 'Religion Simulation Report'} — Page ${i + 1} / ${pageCount}`,
          doc.page.margins.left,
          doc.page.height - 38,
          { width: pageWidth, align: 'center' }
        );
    }

    doc.end();
  });
}

function ensureAcademicReportStructure(markdownText, snapshot) {
  let text = String(markdownText || '').trim();
  if (!text) {
    return text;
  }

  const topReligion = [...(snapshot.religions || [])].sort((a, b) => b.followers - a.followers)[0];
  const strongestTransfer = [...(snapshot.topTransfers || [])].sort((a, b) => b.amount - a.amount)[0];
  const share = topReligion
    ? ((topReligion.followers / Math.max(1, snapshot.totalFollowers)) * 100).toFixed(1)
    : 'N/A';
  const defaultTitle = `# Religion Dynamics Under Social Stress: Round ${snapshot.round} Analysis`;
  if (!/^#\s+/m.test(text)) {
    text = `${defaultTitle}\n\n${text}`;
  }

  const has = (pattern) => pattern.test(text);
  if (!has(/(^|\n)##\s+Abstract\b/i)) {
    text = text.replace(
      /^#\s+.+$/m,
      (title) =>
        `${title}\n\n## Abstract\nThis report analyzes simulation round ${snapshot.round} under scenario "${snapshot.scenario}", focusing on religious redistribution dynamics, institutional constraints, and event shocks. The currently dominant group is ${topReligion?.name || 'N/A'} (${share}%). Transfer evidence indicates the strongest observed corridor is ${strongestTransfer ? `${strongestTransfer.from} -> ${strongestTransfer.to}` : 'N/A'}, suggesting structured rather than random conversion pressure. Findings are interpreted through religious studies, historical sociology, and philosophy of religion, with explicit claim-evidence coupling and reproducible references to simulation records [1][2].`
    );
  }
  if (!has(/(^|\n)##\s+Keywords\b/i)) {
    text += `\n\n## Keywords\nreligion dynamics; social signals; conversion flow; institutional governance; computational simulation`;
  }
  if (!has(/(^|\n)##\s+1\.\s*Introduction\b/i)) {
    text += `\n\n## 1. Introduction\nThe simulation models inter-religious conversion with a fixed total population and dynamic social signal shocks. This section frames the analytical scope and research questions [1].`;
  }
  if (!has(/(^|\n)##\s+2\.\s*Methodology\b/i)) {
    text += `\n\n## 2. Methodology and Data\nThe analysis uses round-level state snapshots, transfer corridors, event history, and judgment records.\n\n| Indicator | Definition | Source |\n|---|---|---|\n| Followers | Current adherent count by religion | Snapshot religion state [1] |\n| Transfer Flow | Directed conversion volume | Top transfer events [2] |\n| Judgment Blocking | Tribunal-mediated blocked conversions | Judgment records [3] |`;
  }
  if (!has(/(^|\n)##\s+3\.\s*Empirical Findings\b/i)) {
    text += `\n\n## 3. Empirical Findings\n### Claim 1\nArgument: Institutional capacity and retention jointly increase stability of high-cohesion traditions.\nEvidence: Dominance and transfer concentration in this round indicate asymmetric conversion resilience [1][2].\n\n### Claim 2\nArgument: Social signal fluctuations alter channel effectiveness faster than doctrinal baselines.\nEvidence: Event shocks and signal deltas align with observed changes in corridor intensity [2][4].\n\n### Claim 3\nArgument: Legal-pluralism and regulation tension mediates conversion efficiency.\nEvidence: Judgment blocking records and net conversion efficiency metrics move in opposite directions under restrictive conditions [3].`;
  }
  if (!has(/(^|\n)##\s+4\.\s*Discussion\b/i)) {
    text += `\n\n## 4. Discussion\nThis section should synthesize religious studies, historical path dependence, and philosophical meaning-formation under modern social fragmentation [1][4].`;
  }
  if (!has(/(^|\n)##\s+5\.\s*Conclusion\b/i)) {
    text += `\n\n## 5. Conclusion\nThe model suggests that conversion pathways are structurally constrained by institutional cohesion, social shocks, and regional compatibility. Future work should add demographic cohorts and empirical calibration [1][2].`;
  }
  if (!has(/(^|\n)##\s+References\b/i)) {
    text += `\n\n## References\n1. [1] Simulation snapshot data (religion states, round ${snapshot.round}).\n2. [2] Transfer corridor records (topTransfers, structureOutput).\n3. [3] Religious judgment and blocking records.\n4. [4] Event history and social signal trajectory logs.`;
  }
  if (!has(/(^|\n)##\s+Appendix\b/i)) {
    text += `\n\n## Appendix A. Supplementary Tables\n| Metric | Value |\n|---|---|\n| Round | ${snapshot.round} |\n| Scenario | ${snapshot.scenario} |\n| Total Followers | ${snapshot.totalFollowers} |`;
  }

  return text;
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

function normalizeGovernance(governance = {}, fallback = {}) {
  return {
    orthodoxy: clamp(Number(governance.orthodoxy ?? fallback.orthodoxy ?? 0.55), 0.05, 0.98),
    antiProselytization: clamp(
      Number(governance.antiProselytization ?? fallback.antiProselytization ?? 0.55),
      0.05,
      0.98
    ),
    tribunalCapacity: clamp(
      Number(governance.tribunalCapacity ?? fallback.tribunalCapacity ?? 0.55),
      0.05,
      0.98
    ),
    dueProcess: clamp(Number(governance.dueProcess ?? fallback.dueProcess ?? 0.55), 0.05, 0.98)
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

function localizedStrategyChannel(channel, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const labels = {
    digital: { en: 'digital', 'zh-CN': '数字传播', ja: 'デジタル発信' },
    service: { en: 'community service', 'zh-CN': '社群服务', ja: '地域奉仕' },
    ritual: { en: 'ritual practice', 'zh-CN': '仪式实践', ja: '儀礼実践' },
    intellectual: { en: 'public dialogue', 'zh-CN': '公共对话', ja: '公共対話' },
    youth: { en: 'youth engagement', 'zh-CN': '青年触达', ja: '若年層接点' },
    identity: { en: 'identity bonding', 'zh-CN': '身份凝聚', ja: 'アイデンティティ結束' },
    institution: { en: 'institutional network', 'zh-CN': '组织网络', ja: '制度ネットワーク' }
  };
  return labels[channel]?.[lang] || labels[channel]?.en || channel;
}

function localActionText(agent, transfer, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const focus = Array.isArray(agent.strategyFocus)
    ? agent.strategyFocus.slice(0, 2).map((item) => localizedStrategyChannel(item, lang))
    : [];

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
    const focusText = focus.length ? `，策略重点：${focus.join('、')}` : '';
    return `${pick}${focusText}，本轮${movement}${Math.abs(transfer.net)}人。`;
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
    const focusText = focus.length ? `。重点戦略: ${focus.join('・')}` : '';
    return `${pick}${focusText}。このラウンドの${movement}は${Math.abs(transfer.net)}人。`;
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
  const focusText = focus.length ? ` Focus: ${focus.join(' / ')}.` : '';
  return `${pick}.${focusText} ${movement}: ${Math.abs(transfer.net)} followers this round.`;
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
    },
    secular_shift: {
      en: 'Secular value drift',
      'zh-CN': '世俗价值迁移',
      ja: '世俗価値への移行'
    },
    polarization_alignment: {
      en: 'Polarized identity alignment',
      'zh-CN': '极化身份趋同',
      ja: '分極化した同一性への整合'
    },
    pluralism_dialogue: {
      en: 'Pluralism-driven dialogue',
      'zh-CN': '多元对话吸引',
      ja: '多元対話による吸引'
    }
  };
  return labels[reasonKey]?.[lang] || labels[reasonKey]?.en || reasonKey;
}

function localizedJudgmentReasonLabel(reasonKey, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const labels = {
    orthodoxy_enforcement: {
      en: 'Orthodoxy enforcement',
      'zh-CN': '教义正统性执法',
      ja: '教義正統性の執行'
    },
    anti_proselytization_guard: {
      en: 'Anti-proselytization guard',
      'zh-CN': '反传教防护',
      ja: '改宗勧誘の抑制'
    },
    identity_conflict: {
      en: 'Identity conflict control',
      'zh-CN': '身份冲突管控',
      ja: 'アイデンティティ衝突の抑制'
    },
    legal_restriction: {
      en: 'Regulatory restriction',
      'zh-CN': '监管限制',
      ja: '規制制限'
    }
  };
  return labels[reasonKey]?.[lang] || labels[reasonKey]?.en || reasonKey;
}

function localJudgmentText(record, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const level = Math.round(clamp(record.severity || 0, 0, 1) * 100);

  if (lang === 'zh-CN') {
    return `${record.religionName}发起宗教审判，判定${record.targetReligionName}的传教活动存在异端风险，拦截${record.blocked}人（${record.reason}，强度${level}%）。`;
  }

  if (lang === 'ja') {
    return `${record.religionName}は宗教審判を実施し、${record.targetReligionName}からの改宗勧誘を異端リスクとして判定。${record.blocked}人を抑止した（${record.reason}、強度${level}%）。`;
  }

  return `${record.religionName} launched a religious judgment, classifying proselytization from ${record.targetReligionName} as heresy risk and blocking ${record.blocked} followers (${record.reason}, intensity ${level}%).`;
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

const AI_PROVIDER_PRESETS = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    apiKeyEnvKeys: ['AI_API_KEY', 'OPENAI_API_KEY'],
    baseUrlEnvKeys: ['AI_API_BASE', 'OPENAI_API_BASE'],
    modelEnvKeys: ['AI_MODEL', 'OPENAI_MODEL']
  },
  moonshot: {
    id: 'moonshot',
    label: 'Moonshot / Kimi',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'kimi-k2-turbo-preview',
    apiKeyEnvKeys: ['MOONSHOT_API_KEY', 'KIMI_API_KEY', 'AI_API_KEY'],
    baseUrlEnvKeys: ['MOONSHOT_API_BASE', 'KIMI_API_BASE'],
    modelEnvKeys: ['MOONSHOT_MODEL', 'KIMI_MODEL']
  }
};

const DEFAULT_AI_PROVIDER = 'openai';

function firstNonEmptyEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function normalizeProvider(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_AI_PROVIDER;
  }
  const low = input.trim().toLowerCase();
  if (!low) {
    return DEFAULT_AI_PROVIDER;
  }
  if (low === 'kimi' || low === 'moonshot/kimi' || low === 'moonshot-kimi') {
    return 'moonshot';
  }
  return Object.hasOwn(AI_PROVIDER_PRESETS, low) ? low : DEFAULT_AI_PROVIDER;
}

function resolveProviderPreset(providerId) {
  return AI_PROVIDER_PRESETS[normalizeProvider(providerId)] || AI_PROVIDER_PRESETS[DEFAULT_AI_PROVIDER];
}

function listAvailableProviders() {
  return Object.values(AI_PROVIDER_PRESETS).map((provider) => ({
    id: provider.id,
    label: provider.label
  }));
}

const STRATEGY_CHANNELS = [
  'digital',
  'service',
  'ritual',
  'intellectual',
  'youth',
  'identity',
  'institution'
];

const CHANNEL_SIGNAL_KEYS = {
  digital: 'digitalization',
  service: 'economicStress',
  ritual: 'meaningSearch',
  intellectual: 'socialFragmentation',
  youth: 'youthPressure',
  identity: 'identityPolitics',
  institution: 'institutionalTrust'
};

const CHANNEL_TRAIT_KEYS = {
  digital: 'digitalMission',
  service: 'communityService',
  ritual: 'ritualDepth',
  intellectual: 'intellectualDialog',
  youth: 'youthAppeal',
  identity: 'identityBond',
  institution: 'institutionCapacity'
};

function normalizeChannelWeights(rawWeights = {}, minWeight = 0.035) {
  const weights = {};
  let total = 0;

  for (const channel of STRATEGY_CHANNELS) {
    const value = clamp(Number(rawWeights[channel] ?? 0), 0, 2.5);
    const bounded = Math.max(minWeight, value);
    weights[channel] = bounded;
    total += bounded;
  }

  if (total <= 0) {
    const uniform = 1 / STRATEGY_CHANNELS.length;
    for (const channel of STRATEGY_CHANNELS) {
      weights[channel] = uniform;
    }
    return weights;
  }

  for (const channel of STRATEGY_CHANNELS) {
    weights[channel] = weights[channel] / total;
  }
  return weights;
}

class OpenAIClient {
  constructor() {
    this.provider = DEFAULT_AI_PROVIDER;
    this.providerLabel = resolveProviderPreset(DEFAULT_AI_PROVIDER).label;
    this.apiKey = '';
    this.baseUrl = resolveProviderPreset(DEFAULT_AI_PROVIDER).defaultBaseUrl;
    this.model = resolveProviderPreset(DEFAULT_AI_PROVIDER).defaultModel;
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
    if (!headerValue || typeof headerValue !== 'string') {
      return null;
    }
    const trimmed = headerValue.trim();
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
        { temperature: 0.7, maxTokens: 8000, timeoutMs: 120000, trace: `report_round_${snapshot.round}` }
      );
      return content;
    } catch (err) {
      console.warn('AI report generation failed:', formatErrorDetail(err));
      return null;
    }
  }
}

class ReligionSimulation {
  constructor(openaiClient) {
    this.openaiClient = openaiClient;
    this.config = SIMULATION_CONFIG;
    this.state = null;
    this.totalFollowers = RELIGION_DOCTRINES.length * INITIAL_FOLLOWERS_PER_RELIGION;
  }

  buildSeedAgents() {
    return RELIGION_DOCTRINES.map((seed) => {
      const metrics = normalizeMetric(seed.metrics);
      const traits = normalizeTraits(seed.traits);
      const governanceFallback = {
        orthodoxy: 0.24 + traits.identityBond * 0.45 + traits.ritualDepth * 0.16,
        antiProselytization: 0.2 + traits.identityBond * 0.38 + metrics.retention * 0.22,
        tribunalCapacity: 0.18 + traits.institutionCapacity * 0.58 + metrics.zeal * 0.16,
        dueProcess: 0.28 + traits.intellectualDialog * 0.44 + traits.communityService * 0.18
      };

      return {
        id: seed.id,
        name: seed.name,
        color: seed.color,
        isSecular: seed.isSecular || false,
        exitBarrier: clamp(Number(seed.exitBarrier || 0), 0, 0.95),
        doctrine: seed.doctrine,
        doctrineLong: seed.doctrineLong,
        classics: normalizeClassics(seed.classics, []),
        style: seed.style,
        metrics,
        traits,
        governance: normalizeGovernance(seed.governance, governanceFallback),
        regionalAffinity: seed.regionalAffinity
      };
    });
  }

  ensureBossState(state) {
    if (!state.bossCrisis) {
      state.bossCrisis = {
        active: false,
        phase: 0,
        totalPhases: 3,
        phaseDuration: 3,
        roundsLeft: 0,
        failedStages: 0,
        cooldown: 7,
        objective: '',
        log: [],
        startedRound: null,
        lastOutcome: null
      };
    }
    return state.bossCrisis;
  }

  assignDominantRegionToAgents(agents, regions) {
    const bestRegion = new Map();
    for (const region of regions || []) {
      for (const item of region.distribution || []) {
        const prev = bestRegion.get(item.id);
        if (!prev || item.followers > prev.followers) {
          bestRegion.set(item.id, {
            regionId: region.id,
            regionName: region.name,
            followers: item.followers
          });
        }
      }
    }
    for (const agent of agents) {
      const hit = bestRegion.get(agent.id);
      if (hit) {
        agent.dominantRegionId = hit.regionId;
        agent.dominantRegionName = hit.regionName;
        agent.dominantRegionFollowers = hit.followers;
      } else if (!agent.dominantRegionId) {
        agent.dominantRegionId = 'global_online';
      }
    }
  }

  regionMobilityFactor(fromRegionId, toRegionId, socialSignals) {
    if (!fromRegionId || !toRegionId || fromRegionId === toRegionId) {
      return 1.05;
    }
    const from = WORLD_REGION_INDEX.get(fromRegionId);
    const to = WORLD_REGION_INDEX.get(toRegionId);
    if (!from || !to) {
      return 0.92;
    }
    const dx = Number(from.position?.x || 0) - Number(to.position?.x || 0);
    const dz = Number(from.position?.z || 0) - Number(to.position?.z || 0);
    const distance = Math.sqrt(dx * dx + dz * dz);
    const distanceCost = clamp(distance / 30, 0, 1.2);
    const regGap = Math.abs((from.factors?.stateRegulation || 0.5) - (to.factors?.stateRegulation || 0.5));
    const legalGap = Math.abs((from.factors?.legalPluralism || 0.5) - (to.factors?.legalPluralism || 0.5));
    const identityGap = Math.abs((from.factors?.identityPolitics || 0.5) - (to.factors?.identityPolitics || 0.5));
    const migration = clamp(Number(socialSignals?.migration || 0.55), 0.05, 0.98);
    const digitalization = clamp(Number(socialSignals?.digitalization || 0.55), 0.05, 0.98);
    const friction =
      distanceCost * 0.34 +
      regGap * 0.24 +
      legalGap * 0.2 +
      identityGap * 0.14 +
      (1 - migration) * 0.12 +
      (1 - digitalization) * 0.08;
    return clamp(1.2 - friction, 0.58, 1.24);
  }

  initializeRegionControl(regions) {
    return this.refreshRegionControl([], regions);
  }

  refreshRegionControl(previousControl = [], regions = []) {
    const prevByRegion = new Map(
      (previousControl || []).map((item) => [item.regionId, item])
    );
    return regions.map((region) => {
      const top = region.distribution?.[0] || { id: null, share: 0, name: '' };
      const second = region.distribution?.[1] || { share: 0 };
      const lead = clamp((top.share || 0) - (second.share || 0), 0, 1);
      const targetControl = clamp(
        0.26 + (top.share || 0) * 0.86 - (region.competitionIndex || 0) * 0.18,
        0.08,
        1
      );
      const prev = prevByRegion.get(region.id);
      if (!prev) {
        return {
          regionId: region.id,
          ownerId: top.id,
          ownerName: top.name,
          control: clamp(targetControl, 0.18, 0.9),
          streak: 1,
          contested: region.competitionIndex > 0.72
        };
      }

      let ownerId = prev.ownerId;
      let ownerName = prev.ownerName || top.name;
      let control = prev.control;
      let streak = prev.streak;

      if (prev.ownerId === top.id) {
        control = clamp(prev.control * 0.66 + targetControl * 0.34 + lead * 0.2, 0.06, 1);
        streak = prev.streak + 1;
      } else {
        const decayed = clamp(prev.control * 0.62 - (region.competitionIndex || 0) * 0.12, 0.04, 1);
        if (decayed < 0.28 || (top.share || 0) > 0.53) {
          ownerId = top.id;
          ownerName = top.name;
          control = clamp(0.24 + (top.share || 0) * 0.5, 0.08, 0.92);
          streak = 1;
        } else {
          control = decayed;
          streak = Math.max(0, prev.streak - 1);
        }
      }

      return {
        regionId: region.id,
        ownerId,
        ownerName,
        control,
        streak,
        contested: region.competitionIndex > 0.72 || lead < 0.07
      };
    });
  }

  applyTerritoryBonuses(agents, regions, regionControl = []) {
    const regionById = new Map((regions || []).map((region) => [region.id, region]));
    const controlScoreByOwner = new Map();
    for (const control of regionControl || []) {
      const region = regionById.get(control.regionId);
      if (!region || !control.ownerId) {
        continue;
      }
      const weight = clamp(Number(region.populationWeight || 0), 0.01, 1);
      const stability = clamp(1 - Number(region.competitionIndex || 0) * 0.4, 0.52, 1);
      const score = clamp(Number(control.control || 0), 0, 1) * weight * stability;
      controlScoreByOwner.set(control.ownerId, (controlScoreByOwner.get(control.ownerId) || 0) + score);
    }

    for (const agent of agents) {
      const territoryScore = clamp(controlScoreByOwner.get(agent.id) || 0, 0, 1.6);
      agent.territoryBonus = {
        territoryScore,
        retentionBoost: clamp(territoryScore * 0.12, 0, 0.08),
        outreachBoost: clamp(territoryScore * 0.09, 0, 0.07),
        defenseBoost: clamp(territoryScore * 0.14, 0, 0.11)
      };
    }
  }

  bossPhaseShock(phase) {
    if (phase === 1) {
      return { socialFragmentation: 0.06, economicStress: 0.05, migration: 0.03 };
    }
    if (phase === 2) {
      return { mediaPolarization: 0.06, stateRegulation: 0.05, identityPolitics: 0.05 };
    }
    return { meaningSearch: 0.07, socialFragmentation: 0.05, institutionalTrust: -0.05 };
  }

  bossPhaseObjectiveText(phase) {
    if (phase === 1) {
      return 'Reduce social fragmentation while preserving institutional trust';
    }
    if (phase === 2) {
      return 'Stabilize contested regions and avoid extreme polarization';
    }
    return 'Contain judgment pressure and recover pluralistic balance';
  }

  evaluateBossPhase(state, phase) {
    const signals = state.socialSignals || {};
    const regions = state.regions || [];
    const stableRegions = regions.filter((region) => Number(region.competitionIndex || 0) < 0.68).length;
    const contestedRegions = regions.filter((region) => Number(region.competitionIndex || 0) > 0.76).length;
    const metrics = state.roundMetrics || {};

    if (phase === 1) {
      const passed = signals.socialFragmentation < 0.74 && signals.institutionalTrust > 0.36;
      return {
        passed,
        note: passed ? 'Fragmentation pressure moderated' : 'Fragmentation remained too high',
        reward: { socialFragmentation: -0.03, institutionalTrust: 0.03 },
        penalty: { socialFragmentation: 0.05, institutionalTrust: -0.04 }
      };
    }
    if (phase === 2) {
      const passed = stableRegions >= 4 && contestedRegions <= 2 && signals.mediaPolarization < 0.8;
      return {
        passed,
        note: passed ? 'Regional fronts stabilized' : 'Regional contestation escalated',
        reward: { mediaPolarization: -0.03, legalPluralism: 0.03, identityPolitics: -0.02 },
        penalty: { mediaPolarization: 0.05, identityPolitics: 0.05, stateRegulation: 0.04 }
      };
    }
    const passed =
      Number(metrics.judgmentRatio || 0) < 0.5 &&
      signals.legalPluralism > 0.44 &&
      signals.socialFragmentation < 0.78;
    return {
      passed,
      note: passed ? 'System contained crisis spillover' : 'Crisis spillover breached governance limits',
      reward: { legalPluralism: 0.04, institutionalTrust: 0.03, socialFragmentation: -0.04 },
      penalty: { legalPluralism: -0.05, stateRegulation: 0.04, socialFragmentation: 0.05 }
    };
  }

  triggerBossCrisis(state) {
    const boss = this.ensureBossState(state);
    boss.active = true;
    boss.phase = 1;
    boss.roundsLeft = boss.phaseDuration;
    boss.failedStages = 0;
    boss.startedRound = state.round;
    boss.objective = this.bossPhaseObjectiveText(1);
    boss.log = [];
    boss.lastOutcome = null;

    const existing = state.activeEvents.find((event) => event.id === 'global_crisis');
    if (!existing) {
      state.activeEvents.push({
        id: 'global_crisis',
        startRound: state.round,
        duration: boss.totalPhases * boss.phaseDuration,
        roundsLeft: boss.totalPhases * boss.phaseDuration,
        shock: this.bossPhaseShock(1),
        boss: true
      });
      state.eventHistory.push({
        id: 'global_crisis',
        round: state.round,
        shock: this.bossPhaseShock(1)
      });
      if (state.eventHistory.length > 80) {
        state.eventHistory = state.eventHistory.slice(-80);
      }
    }
  }

  updateBossCrisis(state) {
    const boss = this.ensureBossState(state);
    if (!boss.active) {
      boss.cooldown = Math.max(0, Number(boss.cooldown || 0) - 1);
      if (boss.cooldown <= 0 && state.round >= 6 && state.round % 9 === 0 && Math.random() < 0.46) {
        this.triggerBossCrisis(state);
      }
      return;
    }

    const crisisEvent = state.activeEvents.find((event) => event.id === 'global_crisis');
    if (crisisEvent) {
      crisisEvent.shock = this.bossPhaseShock(boss.phase);
      crisisEvent.duration = boss.totalPhases * boss.phaseDuration;
      crisisEvent.roundsLeft = Math.max(
        1,
        (boss.totalPhases - boss.phase) * boss.phaseDuration + boss.roundsLeft
      );
    }
    boss.objective = this.bossPhaseObjectiveText(boss.phase);
    boss.roundsLeft = Math.max(0, boss.roundsLeft - 1);

    if (boss.roundsLeft > 0) {
      return;
    }

    const phaseResult = this.evaluateBossPhase(state, boss.phase);
    const patch = phaseResult.passed ? phaseResult.reward : phaseResult.penalty;
    if (!phaseResult.passed) {
      boss.failedStages += 1;
    }
    for (const [key, delta] of Object.entries(patch || {})) {
      if (key in state.socialSignals) {
        state.socialSignals[key] = clamp(Number(state.socialSignals[key] || 0.55) + Number(delta || 0), 0.1, 0.98);
      }
    }
    boss.log.unshift({
      round: state.round,
      phase: boss.phase,
      passed: phaseResult.passed,
      note: phaseResult.note
    });
    boss.log = boss.log.slice(0, 12);

    if (boss.phase >= boss.totalPhases) {
      boss.active = false;
      boss.lastOutcome = boss.failedStages === 0 ? 'victory' : boss.failedStages <= 1 ? 'contained' : 'breach';
      boss.cooldown = 9 + boss.failedStages * 2;
      state.activeEvents = state.activeEvents.filter((event) => event.id !== 'global_crisis');
      return;
    }
    boss.phase += 1;
    boss.roundsLeft = boss.phaseDuration;
    boss.objective = this.bossPhaseObjectiveText(boss.phase);
  }

  // 随机事件系统：每 N 轮以概率触发事件，短期扰动社会信号
  applyEvents(state) {
    const cfg = this.config.events;
    this._decayActiveEvents(state);
    if (cfg?.enabled && state.round % cfg.checkEveryNRounds === 0) {
      const fired = [];
      for (const eventDef of cfg.pool) {
        if (fired.length >= cfg.maxPerCheck) break;
        if (Math.random() < eventDef.prob) {
          const ev = {
            id: eventDef.id,
            startRound: state.round,
            duration: eventDef.duration,
            roundsLeft: eventDef.duration,
            shock: { ...eventDef.shock }
          };
          state.activeEvents.push(ev);
          state.eventHistory.push({
            id: eventDef.id,
            round: state.round,
            shock: ev.shock
          });
          if (state.eventHistory.length > 80) {
            state.eventHistory = state.eventHistory.slice(-80);
          }
          fired.push(ev);
        }
      }
    }

    this._applyActiveEventShocks(state);
  }

  _applyActiveEventShocks(state) {
    for (const ev of state.activeEvents) {
      for (const [key, delta] of Object.entries(ev.shock)) {
        if (key in state.socialSignals) {
          const remaining = Math.max(0.1, Number(ev.roundsLeft || 1) / Math.max(1, Number(ev.duration || 1)));
          state.socialSignals[key] = clamp(
            (state.socialSignals[key] || 0.5) + delta * remaining,
            0.1,
            0.98
          );
        }
      }
    }
  }

  _decayActiveEvents(state) {
    for (const ev of state.activeEvents) {
      if (ev.id === 'global_crisis') {
        continue;
      }
      ev.roundsLeft = Math.max(0, ev.roundsLeft - 1);
    }
    state.activeEvents = state.activeEvents.filter((ev) => ev.id === 'global_crisis' || ev.roundsLeft > 0);
  }

  driftSocialSignals(current) {
    const next = {};
    for (const [key, value] of Object.entries(current)) {
      let jitter = 0.025;
      if (key === 'socialFragmentation') {
        jitter = 0.017;
      } else if (
        key === 'legalPluralism' ||
        key === 'secularization' ||
        key === 'stateRegulation'
      ) {
        jitter = 0.014;
      }
      next[key] = clamp(value + randomIn(-jitter, jitter), 0.2, 0.95);
    }
    return next;
  }

  getSignalPressureValue(socialSignals, channel) {
    const key = CHANNEL_SIGNAL_KEYS[channel];
    const raw = clamp(Number(socialSignals?.[key] || 0.55), 0.05, 0.98);
    if (channel === 'intellectual') {
      return clamp(1 - raw, 0.05, 0.95);
    }
    return raw;
  }

  getChannelTrait(agent, channel) {
    const key = CHANNEL_TRAIT_KEYS[channel];
    return clamp(Number(agent?.traits?.[key] || 0.55), 0.05, 0.98);
  }

  buildInitialStrategy(agent) {
    const rawChannels = {};
    for (const channel of STRATEGY_CHANNELS) {
      const trait = this.getChannelTrait(agent, channel);
      const zealBoost = agent.metrics.zeal * 0.16;
      const persuasionBoost = agent.metrics.persuasion * 0.13;
      const opennessBoost =
        channel === 'digital' || channel === 'youth' ? agent.metrics.openness * 0.12 : 0;
      const retentionBoost =
        channel === 'identity' || channel === 'institution' ? agent.metrics.retention * 0.08 : 0;
      rawChannels[channel] = trait * (0.68 + zealBoost + persuasionBoost) + opennessBoost + retentionBoost;
    }

    return {
      channels: normalizeChannelWeights(rawChannels),
      tempo: clamp(
        0.4 + agent.metrics.zeal * 0.32 + agent.metrics.persuasion * 0.2,
        0.16,
        0.97
      ),
      adaptation: clamp(
        0.22 + agent.metrics.openness * 0.4 + (1 - agent.metrics.retention) * 0.22,
        0.1,
        0.84
      ),
      defensiveFocus: clamp(
        0.2 + agent.metrics.retention * 0.44 + agent.traits.identityBond * 0.24,
        0.1,
        0.95
      ),
      fatigue: clamp((1 - agent.metrics.retention) * 0.22, 0.03, 0.34),
      momentum: clamp(
        0.24 +
          agent.metrics.persuasion * 0.33 +
          agent.traits.communityService * 0.2 +
          agent.traits.digitalMission * 0.12,
        0.12,
        0.88
      ),
      credibility: clamp(
        0.18 +
          agent.traits.institutionCapacity * 0.4 +
          agent.traits.communityService * 0.29 +
          agent.metrics.retention * 0.17,
        0.12,
        0.96
      ),
      inertia: clamp(
        0.24 + agent.traits.institutionCapacity * 0.34 + agent.metrics.retention * 0.24,
        0.18,
        0.92
      ),
      riskTolerance: clamp(
        0.16 + agent.metrics.openness * 0.44 + (1 - agent.metrics.retention) * 0.24,
        0.08,
        0.88
      ),
      cohesion: clamp(
        0.2 +
          agent.traits.identityBond * 0.35 +
          agent.traits.ritualDepth * 0.2 +
          agent.metrics.retention * 0.18,
        0.12,
        0.97
      ),
      recentOutcome: 0
    };
  }

  strategyFocusSummary(strategy) {
    if (!strategy?.channels) {
      return [];
    }
    return Object.entries(strategy.channels)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  }

  adaptAgentStrategies(agents, socialSignals) {
    for (const agent of agents) {
      const strategy = agent.strategy || this.buildInitialStrategy(agent);
      strategy.inertia = clamp(Number(strategy.inertia ?? 0.46), 0.18, 0.94);
      strategy.riskTolerance = clamp(Number(strategy.riskTolerance ?? 0.42), 0.06, 0.9);
      strategy.cohesion = clamp(Number(strategy.cohesion ?? 0.52), 0.1, 0.99);
      strategy.recentOutcome = clamp(Number(strategy.recentOutcome ?? 0), -0.08, 0.08);

      const outcomeRate = clamp((agent.followers > 0 ? agent.delta / agent.followers : 0) || 0, -0.06, 0.06);
      const smoothedOutcome = clamp(strategy.recentOutcome * 0.64 + outcomeRate * 0.36, -0.06, 0.06);
      strategy.recentOutcome = smoothedOutcome;
      const stress = Math.max(0, -smoothedOutcome);
      const success = Math.max(0, smoothedOutcome);

      const targetChannels = {};
      for (const channel of STRATEGY_CHANNELS) {
        const trait = this.getChannelTrait(agent, channel);
        const pressure = this.getSignalPressureValue(socialSignals, channel);
        const pressurePriority = pressure * (0.45 + trait * 0.55);
        const defensiveBias =
          channel === 'identity' || channel === 'institution'
            ? 1 + stress * (1.15 + strategy.cohesion * 0.35)
            : 1;
        const growthBias =
          channel === 'digital' || channel === 'youth'
            ? 1 + success * (0.65 + strategy.riskTolerance * 0.55)
            : 1;
        const cultureBias =
          channel === 'identity'
            ? 0.86 + socialSignals.mediaPolarization * 0.32
            : channel === 'intellectual'
              ? 0.84 + socialSignals.legalPluralism * 0.3
              : channel === 'ritual'
                ? 0.8 + (1 - socialSignals.secularization) * 0.35
                : channel === 'institution'
                  ? 0.84 + socialSignals.stateRegulation * 0.28
                  : 1;
        const cohesionBias =
          channel === 'identity' || channel === 'institution'
            ? 0.9 + strategy.cohesion * 0.34
            : 0.9 + (1 - strategy.cohesion) * 0.26;
        const riskBias =
          channel === 'digital' || channel === 'youth'
            ? 0.82 + strategy.riskTolerance * 0.42
            : 1 - strategy.riskTolerance * 0.08;
        targetChannels[channel] =
          pressurePriority * defensiveBias * growthBias * cultureBias * cohesionBias * riskBias;
      }

      const normalizedTarget = normalizeChannelWeights(targetChannels);
      const learningRate = clamp(
        strategy.adaptation *
          (0.24 + stress * 1.35 + success * 0.62) *
          (1 - strategy.inertia * 0.52),
        0.012,
        0.19
      );
      const blended = {};
      for (const channel of STRATEGY_CHANNELS) {
        blended[channel] =
          (strategy.channels[channel] || 0) * (1 - learningRate) +
          normalizedTarget[channel] * learningRate;
      }
      strategy.channels = normalizeChannelWeights(blended);

      const outreachLoad = clamp((agent.transferOut || 0) / Math.max(1, agent.followers), 0, 0.15);
      strategy.fatigue = clamp(
        strategy.fatigue +
          outreachLoad * (0.24 + strategy.tempo * 0.24) -
          success * 1.28 +
          stress * 0.28 -
          strategy.cohesion * 0.03 -
          0.01,
        0.02,
        0.64
      );
      strategy.momentum = clamp(
        strategy.momentum +
          success * 1.12 -
          stress * 0.74 -
          strategy.fatigue * 0.06 +
          (strategy.riskTolerance - 0.42) * 0.03 +
          0.012,
        0.08,
        0.98
      );
      strategy.defensiveFocus = clamp(
        strategy.defensiveFocus + stress * 0.16 + strategy.cohesion * 0.04 - success * 0.08,
        0.07,
        0.96
      );
      strategy.credibility = clamp(
        strategy.credibility +
          success * 0.44 -
          stress * 0.28 +
          (agent.traits.communityService * 0.02 + agent.traits.institutionCapacity * 0.02),
        0.1,
        0.99
      );
      strategy.tempo = clamp(
        strategy.tempo +
          (strategy.momentum - strategy.fatigue) * 0.046 +
          success * (0.09 + strategy.riskTolerance * 0.05) -
          stress * (0.06 + strategy.inertia * 0.03),
        0.14,
        0.99
      );
      strategy.riskTolerance = clamp(
        strategy.riskTolerance +
          success * 0.16 -
          stress * 0.12 +
          (agent.metrics.openness - 0.5) * 0.05,
        0.06,
        0.9
      );
      strategy.inertia = clamp(
        strategy.inertia +
          stress * 0.08 -
          success * 0.06 +
          agent.traits.institutionCapacity * 0.01 -
          strategy.adaptation * 0.01,
        0.18,
        0.94
      );
      strategy.cohesion = clamp(
        strategy.cohesion +
          strategy.defensiveFocus * 0.06 +
          stress * 0.1 -
          success * 0.08 +
          agent.metrics.retention * 0.02 -
          (1 - socialSignals.legalPluralism) * 0.02,
        0.1,
        0.99
      );

      agent.strategy = strategy;
    }
  }

  channelOutreachStrength(agent, socialSignals) {
    const strategy = agent.strategy || this.buildInitialStrategy(agent);
    let total = 0;
    for (const channel of STRATEGY_CHANNELS) {
      const pressure = this.getSignalPressureValue(socialSignals, channel);
      const trait = this.getChannelTrait(agent, channel);
      const channelWeight = Number(strategy.channels[channel] || 0);
      total += channelWeight * trait * (0.36 + pressure * 0.64);
    }
    return clamp(total, 0.08, 1.3);
  }

  doctrineDistance(source, target) {
    const src = source.traits;
    const tgt = target.traits;
    const distance =
      Math.abs(src.identityBond - tgt.identityBond) * 0.3 +
      Math.abs(src.ritualDepth - tgt.ritualDepth) * 0.25 +
      Math.abs(src.intellectualDialog - tgt.intellectualDialog) * 0.18 +
      Math.abs(src.communityService - tgt.communityService) * 0.16 +
      Math.abs(src.digitalMission - tgt.digitalMission) * 0.11;
    return clamp(distance, 0, 1);
  }

  regionalOverlap(source, target) {
    let overlap = 0;
    let span = 0;
    for (const region of WORLD_REGIONS) {
      const regionId = region.id;
      const src = clamp(Number(source.regionalAffinity?.[regionId] || 0.3), 0.01, 1);
      const tgt = clamp(Number(target.regionalAffinity?.[regionId] || 0.3), 0.01, 1);
      overlap += Math.min(src, tgt);
      span += Math.max(src, tgt);
    }
    if (span <= 0) {
      return 0.5;
    }
    return clamp(overlap / span, 0.05, 1);
  }

  targetSusceptibility(target, socialSignals) {
    const strategy = target.strategy || this.buildInitialStrategy(target);
    const lock =
      target.metrics.retention * 0.34 +
      target.traits.identityBond * 0.2 +
      target.traits.ritualDepth * 0.12 +
      target.traits.institutionCapacity * 0.15 +
      strategy.defensiveFocus * 0.19;
    const susceptibility =
      (1 - lock) * 0.58 +
      target.metrics.openness * 0.26 +
      socialSignals.socialFragmentation * 0.1 +
      socialSignals.migration * 0.06 +
      socialSignals.secularization * 0.06 +
      socialSignals.mediaPolarization * 0.04 +
      socialSignals.legalPluralism * 0.05 -
      socialSignals.stateRegulation * 0.08;
    return clamp(susceptibility, 0.03, 0.95);
  }

  estimateSocialMismatch(agent, socialSignals) {
    const strategy = agent.strategy || this.buildInitialStrategy(agent);
    let mismatch = 0;
    for (const channel of STRATEGY_CHANNELS) {
      const pressure = this.getSignalPressureValue(socialSignals, channel);
      const trait = this.getChannelTrait(agent, channel);
      const weight = 0.45 + Number(strategy.channels[channel] || 0);
      mismatch += Math.max(0, pressure - trait) * weight;
    }
    return clamp(mismatch / STRATEGY_CHANNELS.length, 0, 1);
  }

  computeAgentOutBudget(agent, socialSignals) {
    const minReserve = 700;
    const available = Math.max(0, agent.followers - minReserve);
    if (available <= 0) {
      return 0;
    }

    const strategy = agent.strategy || this.buildInitialStrategy(agent);
    const territoryBonus = agent.territoryBonus || {};
    const mismatch = this.estimateSocialMismatch(agent, socialSignals);
    const churn = this.config.transfer.churn;
    const churnRate =
      churn.base +
      (1 - agent.metrics.retention) * churn.lowRetention +
      agent.metrics.openness * churn.openness +
      mismatch * churn.mismatch +
      socialSignals.socialFragmentation * churn.socialFragmentation +
      socialSignals.migration * churn.migration +
      socialSignals.stateRegulation * churn.stateRegulation +
      socialSignals.legalPluralism * churn.legalPluralism +
      socialSignals.mediaPolarization * churn.mediaPolarization +
      socialSignals.secularization * churn.secularization +
      strategy.defensiveFocus * churn.defensiveFocus +
      strategy.fatigue * churn.fatigue;

    // exitBarrier 降低信众流失率（宗教越难离开，流失越少）
    const barrierReduction =
      1 - clamp(Number(agent.exitBarrier || 0), 0, 0.9) * (this.config.exitBarrierWeight || 0.68);
    const inertiaBrake = 1 - clamp(Number(strategy.inertia || 0), 0.1, 0.94) * 0.18;
    const cohesionBrake = 1 - clamp(Number(strategy.cohesion || 0), 0.1, 0.99) * 0.22;
    const governance = agent.governance || normalizeGovernance();
    const governanceBrake =
      1 -
      clamp(
        governance.orthodoxy * 0.08 + governance.antiProselytization * 0.14 + governance.tribunalCapacity * 0.06,
        0,
        0.28
      );
    const boundedRate = clamp(
      churnRate *
        barrierReduction *
        inertiaBrake *
        cohesionBrake *
        governanceBrake *
        (1 - clamp(Number(territoryBonus.retentionBoost || 0), 0, 0.2)),
      0.001,
      0.048
    );
    const outBudgetRaw = Math.floor(agent.followers * boundedRate * randomIn(0.9, 1.1));
    const cap = Math.floor(
      agent.followers *
        (0.041 +
          agent.metrics.openness * 0.017 +
          Number(strategy.riskTolerance || 0.4) * 0.005 +
          Number(territoryBonus.outreachBoost || 0) * 0.03)
    );
    return clamp(outBudgetRaw, 0, Math.min(available, cap));
  }

  pairTransferCap(fromAgent, toAgent) {
    const fromStrategy = fromAgent.strategy || this.buildInitialStrategy(fromAgent);
    const toStrategy = toAgent.strategy || this.buildInitialStrategy(toAgent);
    const compatibility = clamp(
      1 - this.doctrineDistance(fromAgent, toAgent) * 0.62 + this.regionalOverlap(fromAgent, toAgent) * 0.24,
      0.2,
      1.08
    );
    const opennessFactor = 0.72 + toAgent.metrics.openness * 0.7;
    const resistance =
      toAgent.metrics.retention * 0.38 +
      toStrategy.defensiveFocus * 0.28 +
      toAgent.traits.identityBond * 0.18;
    const conversionWindow = clamp(1 - resistance, 0.16, 0.98);
    const tempoFactor = clamp(0.74 + fromStrategy.tempo * 0.42 - fromStrategy.fatigue * 0.22, 0.4, 1.2);

    const base = fromAgent.followers * 0.023;
    const dynamicCap = Math.floor(base * compatibility * opennessFactor * conversionWindow * tempoFactor);
    const hardCap = Math.floor(fromAgent.followers * 0.042);
    return clamp(dynamicCap, 8, Math.max(8, hardCap));
  }

  sourcePullScore(source, target, socialSignals) {
    const sourceStrategy = source.strategy || this.buildInitialStrategy(source);
    const targetStrategy = target.strategy || this.buildInitialStrategy(target);
    const sourceTerritoryBonus = source.territoryBonus || {};
    const targetTerritoryBonus = target.territoryBonus || {};
    const sourceGovernance = source.governance || normalizeGovernance();
    const targetGovernance = target.governance || normalizeGovernance();
    const outreachStrength = this.channelOutreachStrength(source, socialSignals);
    const susceptibility = this.targetSusceptibility(target, socialSignals);
    const distance = this.doctrineDistance(source, target);
    const overlap = this.regionalOverlap(source, target);

    const bridge = clamp(
      0.28 +
        (1 - distance) * 0.46 +
        overlap * 0.16 +
        (source.metrics.openness + target.metrics.openness) * 0.12,
      0.06,
      1.08
    );

    const networkEffect = clamp(0.42 + Math.sqrt(source.followers / this.totalFollowers), 0.4, 1.18);
    const momentum = clamp(
      0.58 +
        sourceStrategy.momentum * 0.24 +
        sourceStrategy.credibility * 0.18 +
        sourceStrategy.tempo * 0.12 -
        sourceStrategy.fatigue * 0.18,
      0.25,
      1.25
    );
    const recentInboundPressure = clamp(
      (source.transferIn || 0) / Math.max(1, source.followers),
      0,
      0.14
    );
    const recentOutboundShock = clamp(
      (target.transferOut || 0) / Math.max(1, target.followers),
      0,
      0.18
    );
    const saturationPenalty = clamp(1 - recentInboundPressure * 0.9, 0.72, 1);
    const defensivePenalty = target.topTo?.name === source.name ? 0.86 : 1;
    const shockWindow = clamp(0.9 + recentOutboundShock * 0.52, 0.9, 1.08);
    const discourseWindow = clamp(
      0.76 + socialSignals.legalPluralism * 0.24 + (1 - socialSignals.mediaPolarization) * 0.1,
      0.62,
      1.16
    );
    const secularWindow = clamp(
      0.82 +
        socialSignals.secularization *
          (source.metrics.openness * 0.16 + source.traits.intellectualDialog * 0.14) +
        (1 - socialSignals.secularization) * source.traits.ritualDepth * 0.08,
      0.72,
      1.22
    );
    const regulationPenalty = clamp(
      1 -
        socialSignals.stateRegulation *
          (0.24 +
            sourceGovernance.antiProselytization * 0.2 +
            targetGovernance.antiProselytization * 0.23),
      0.55,
      1
    );

    // 世俗主义在高世俗化环境下获得额外吸引力加成
    const secularBuff = source.isSecular
      ? clamp(socialSignals.secularization * (this.config.secularBuff || 1.55), 0.6, 1.9)
      : 1;
    const sourceStability = clamp(
      0.84 +
        sourceStrategy.credibility * 0.16 +
        (1 - sourceStrategy.fatigue) * 0.08 -
        sourceStrategy.inertia * 0.07,
      0.72,
      1.18
    );
    const targetCohesionPenalty = clamp(
      1 - (targetStrategy.cohesion * 0.16 + targetStrategy.inertia * 0.08),
      0.62,
      1
    );
    const mobilityFactor = this.regionMobilityFactor(
      source.dominantRegionId,
      target.dominantRegionId,
      socialSignals
    );
    const territoryAdvantage = clamp(
      0.92 + Number(sourceTerritoryBonus.outreachBoost || 0) * 2.2,
      0.88,
      1.2
    );
    const targetTerritoryDefense = clamp(
      1 - Number(targetTerritoryBonus.defenseBoost || 0) * 1.6,
      0.72,
      1
    );

    return (
      outreachStrength *
      susceptibility *
      bridge *
      networkEffect *
      momentum *
      saturationPenalty *
      defensivePenalty *
      discourseWindow *
      secularWindow *
      regulationPenalty *
      shockWindow *
      secularBuff *
      sourceStability *
      targetCohesionPenalty *
      mobilityFactor *
      territoryAdvantage *
      targetTerritoryDefense *
      randomIn(0.93, 1.07)
    );
  }

  transferReasonDetail(source, target, socialSignals, locale = DEFAULT_LOCALE) {
    const strategy = source.strategy || this.buildInitialStrategy(source);
    const reasons = [
      {
        key: 'digital_spread',
        value:
          source.traits.digitalMission *
          socialSignals.digitalization *
          (0.55 + (strategy.channels.digital || 0))
      },
      {
        key: 'community_service',
        value:
          source.traits.communityService *
          socialSignals.economicStress *
          (0.55 + (strategy.channels.service || 0))
      },
      {
        key: 'identity_shift',
        value:
          source.traits.identityBond *
          socialSignals.identityPolitics *
          (0.55 + (strategy.channels.identity || 0)) *
          (0.72 + target.metrics.openness * 0.55)
      },
      {
        key: 'meaning_search',
        value:
          source.traits.ritualDepth *
          socialSignals.meaningSearch *
          (0.55 + (strategy.channels.ritual || 0))
      },
      {
        key: 'youth_resonance',
        value:
          source.traits.youthAppeal *
          socialSignals.youthPressure *
          (0.55 + (strategy.channels.youth || 0))
      },
      {
        key: 'institutional_pull',
        value:
          source.traits.institutionCapacity *
          socialSignals.institutionalTrust *
          (0.55 + (strategy.channels.institution || 0))
      },
      {
        key: 'secular_shift',
        value:
          source.traits.intellectualDialog *
          socialSignals.secularization *
          (0.55 + (strategy.channels.intellectual || 0))
      },
      {
        key: 'polarization_alignment',
        value:
          source.traits.identityBond *
          socialSignals.mediaPolarization *
          (0.55 + (strategy.channels.identity || 0))
      },
      {
        key: 'pluralism_dialogue',
        value:
          source.traits.intellectualDialog *
          socialSignals.legalPluralism *
          (0.55 + (strategy.channels.intellectual || 0))
      }
    ].sort((a, b) => b.value - a.value);

    const topFactors = reasons.slice(0, this.config.explainability.topFactors).map((item) => ({
      key: item.key,
      label: localizedReasonLabel(item.key, locale),
      score: Number(item.value.toFixed(4))
    }));
    return {
      reason: localizedReasonLabel(reasons[0].key, locale),
      reasonFactors: topFactors
    };
  }

  computeTransferPlan(agents, socialSignals, locale = DEFAULT_LOCALE) {
    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    const events = [];

    for (const target of agents) {
      const outBudget = this.computeAgentOutBudget(target, socialSignals);
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
        const amount = clamp(
          allocations.get(item.source.id) || 0,
          0,
          this.pairTransferCap(target, item.source)
        );
        if (amount <= 0) {
          continue;
        }

        const reasonDetail = this.transferReasonDetail(
          item.source,
          target,
          socialSignals,
          locale
        );

        deltas.set(target.id, deltas.get(target.id) - amount);
        deltas.set(item.source.id, deltas.get(item.source.id) + amount);
        events.push({
          fromId: target.id,
          fromName: target.name,
          toId: item.source.id,
          toName: item.source.name,
          amount,
          reason: reasonDetail.reason,
          reasonFactors: reasonDetail.reasonFactors
        });
      }
    }

    events.sort((a, b) => b.amount - a.amount);
    return { deltas, events };
  }

  buildOutBudgets(agents, socialSignals) {
    const budgets = new Map();
    for (const agent of agents) {
      budgets.set(agent.id, this.computeAgentOutBudget(agent, socialSignals));
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

    const addEvent = (fromAgent, toAgent, requestedAmount, reason, reasonFactors, sourceTag) => {
      if (!fromAgent || !toAgent || fromAgent.id === toAgent.id) {
        return 0;
      }
      const left = budgets.get(fromAgent.id) || 0;
      if (left <= 0) {
        return 0;
      }

      const pairCap = this.pairTransferCap(fromAgent, toAgent);
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
          hit.reasonFactors = Array.isArray(reasonFactors) ? reasonFactors : [];
        }
      } else {
        merged.set(key, {
          fromId: fromAgent.id,
          fromName: fromAgent.name,
          toId: toAgent.id,
          toName: toAgent.name,
          amount,
          reason: reason || localizedReasonLabel('digital_spread', locale),
          reasonFactors: Array.isArray(reasonFactors) ? reasonFactors : [],
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
        addEvent(fromAgent, toAgent, link.amount, link.reason, [], 'ai');
      }
    }

    for (const event of fallbackEvents) {
      const fromAgent = agentById.get(event.fromId);
      const toAgent = agentById.get(event.toId);
      addEvent(fromAgent, toAgent, event.amount, event.reason, event.reasonFactors, 'rule');
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

  judgmentReasonDetail(fromAgent, toAgent, socialSignals, locale = DEFAULT_LOCALE) {
    const governance = fromAgent.governance || normalizeGovernance();
    const scores = [
      {
        key: 'orthodoxy_enforcement',
        value:
          governance.orthodoxy * 0.52 +
          fromAgent.traits.ritualDepth * 0.2 +
          fromAgent.traits.identityBond * 0.28
      },
      {
        key: 'anti_proselytization_guard',
        value:
          governance.antiProselytization * 0.56 +
          toAgent.metrics.zeal * 0.24 +
          toAgent.metrics.persuasion * 0.2
      },
      {
        key: 'identity_conflict',
        value:
          fromAgent.traits.identityBond * 0.52 +
          socialSignals.identityPolitics * 0.34 +
          socialSignals.mediaPolarization * 0.14
      },
      {
        key: 'legal_restriction',
        value:
          socialSignals.stateRegulation * 0.56 +
          (1 - socialSignals.legalPluralism) * 0.44
      }
    ].sort((a, b) => b.value - a.value);
    const topFactors = scores.slice(0, this.config.explainability.topFactors).map((item) => ({
      key: item.key,
      label: localizedJudgmentReasonLabel(item.key, locale),
      score: Number(item.value.toFixed(4))
    }));
    return {
      reasonKey: scores[0].key,
      reason: localizedJudgmentReasonLabel(scores[0].key, locale),
      factors: topFactors
    };
  }

  applyReligiousJudgment(agents, events, socialSignals, round, locale = DEFAULT_LOCALE) {
    const moderatedEvents = [];
    const records = [];
    const agentById = new Map(agents.map((agent) => [agent.id, agent]));
    const judgmentCfg = this.config.judgment;

    for (const event of events) {
      const fromAgent = agentById.get(event.fromId);
      const toAgent = agentById.get(event.toId);
      if (!fromAgent || !toAgent) {
        continue;
      }

      // 世俗主义没有宗教法庭，不对其他宗教施加审判；其他宗教也难以通过宗教手段拦截世俗化
      if (fromAgent.isSecular || toAgent.isSecular) {
        moderatedEvents.push({ ...event, judgmentBlocked: 0 });
        continue;
      }

      const governance = fromAgent.governance || normalizeGovernance();
      const regimePressure = clamp(
        (1 - socialSignals.legalPluralism) * judgmentCfg.regime.antiPluralism +
          socialSignals.stateRegulation * judgmentCfg.regime.stateRegulation +
          socialSignals.identityPolitics * judgmentCfg.regime.identityPolitics +
          socialSignals.mediaPolarization * judgmentCfg.regime.mediaPolarization,
        0.04,
        0.96
      );
      const enforcementCapacity = clamp(
        governance.tribunalCapacity * judgmentCfg.enforcement.tribunalCapacity +
          fromAgent.traits.institutionCapacity * judgmentCfg.enforcement.institutionCapacity +
          governance.orthodoxy * judgmentCfg.enforcement.orthodoxy,
        0.08,
        0.98
      );
      const missionaryPush = clamp(
        toAgent.metrics.zeal * judgmentCfg.missionaryPush.zeal +
          toAgent.metrics.persuasion * judgmentCfg.missionaryPush.persuasion +
          toAgent.traits.digitalMission * judgmentCfg.missionaryPush.digitalMission +
          socialSignals.digitalization * judgmentCfg.missionaryPush.digitalization +
          socialSignals.migration * judgmentCfg.missionaryPush.migration,
        0.06,
        1.08
      );
      const dueProcessBrake = clamp(
        1 - governance.dueProcess * judgmentCfg.rate.dueProcessBrake,
        0.26,
        0.94
      );
      const judgmentRate = clamp(
        regimePressure *
          enforcementCapacity *
          (judgmentCfg.rate.base +
            governance.antiProselytization * judgmentCfg.rate.antiProselytization +
            governance.orthodoxy * judgmentCfg.rate.orthodoxy) *
          (judgmentCfg.rate.pushBase + missionaryPush * judgmentCfg.rate.pushFactor) *
          dueProcessBrake *
          randomIn(judgmentCfg.rate.randomMin, judgmentCfg.rate.randomMax),
        0,
        judgmentCfg.rate.maxRate
      );
      const blocked = clamp(
        Math.floor(event.amount * judgmentRate),
        0,
        Math.floor(event.amount * judgmentCfg.rate.maxBlockShare)
      );
      const remaining = event.amount - blocked;

      if (remaining > 0) {
        moderatedEvents.push({
          ...event,
          amount: remaining,
          judgmentBlocked: blocked
        });
      }

      if (blocked > 0) {
        const reasonDetail = this.judgmentReasonDetail(fromAgent, toAgent, socialSignals, locale);
        records.push({
          round,
          religionId: fromAgent.id,
          religionName: fromAgent.name,
          targetReligionId: toAgent.id,
          targetReligionName: toAgent.name,
          attempted: event.amount,
          blocked,
          severity: blocked / Math.max(1, event.amount),
          reasonKey: reasonDetail.reasonKey,
          reason: reasonDetail.reason,
          factors: reasonDetail.factors
        });
      }
    }

    moderatedEvents.sort((a, b) => b.amount - a.amount);
    records.sort((a, b) => b.blocked - a.blocked);

    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    for (const event of moderatedEvents) {
      deltas.set(event.fromId, (deltas.get(event.fromId) || 0) - event.amount);
      deltas.set(event.toId, (deltas.get(event.toId) || 0) + event.amount);
    }

    return { events: moderatedEvents, deltas, records };
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
      reasonFactors: Array.isArray(event.reasonFactors) ? event.reasonFactors : [],
      source: event.source || 'rule'
    }));

    return { byReligion, topPairs };
  }

  computeRegionalVolatility(regions) {
    if (!Array.isArray(regions) || regions.length === 0) {
      return 0;
    }
    const values = regions.map((region) => clamp(Number(region.competitionIndex || 0), 0, 1));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  buildRoundMetrics(agents, transferEvents, judgmentRecords, regions) {
    const totalFlow = transferEvents.reduce((sum, event) => sum + Number(event.amount || 0), 0);
    const blockedByJudgment = judgmentRecords.reduce(
      (sum, record) => sum + Number(record.blocked || 0),
      0
    );
    const positiveNet = agents.reduce((sum, agent) => sum + Math.max(0, Number(agent.delta || 0)), 0);
    const attemptedFlow = totalFlow + blockedByJudgment;
    return {
      totalFlow,
      blockedByJudgment,
      judgmentRatio: attemptedFlow > 0 ? blockedByJudgment / attemptedFlow : 0,
      netConversionEfficiency: totalFlow > 0 ? positiveNet / totalFlow : 0,
      regionalVolatility: this.computeRegionalVolatility(regions)
    };
  }

  regionFitScore(agent, region, socialSignals) {
    const traits = agent.traits;
    const metrics = agent.metrics;
    const governance = agent.governance || normalizeGovernance();
    const factors = region.factors;
    const affinity = clamp(Number(agent.regionalAffinity?.[region.id] || 0.3), 0.02, 1);
    const affinityAnchor = Math.pow(affinity, 1.7);

    const ritualDemand =
      factors.meaningSearch * 0.42 + (1 - factors.secularization) * 0.34 + factors.traditionalism * 0.24;
    const institutionalDemand =
      factors.institutionalTrust * 0.42 +
      factors.stateRegulation * 0.23 +
      (1 - factors.mediaPolarization) * 0.15;
    const mobilityDemand =
      factors.migration * 0.5 + socialSignals.migration * 0.3 + factors.digitalization * 0.2;

    const communityFit = traits.communityService * (0.42 + factors.economicStress * 0.44);
    const missionFit = traits.digitalMission * (0.34 + factors.digitalization * 0.5);
    const ritualFit = traits.ritualDepth * (0.28 + ritualDemand * 0.58);
    const discourseFit =
      traits.intellectualDialog *
      (0.24 + factors.legalPluralism * 0.36 + (1 - socialSignals.socialFragmentation) * 0.24);
    const youthFit = traits.youthAppeal * (0.28 + factors.youthPressure * 0.42);
    const identityFit = traits.identityBond * (0.28 + factors.identityPolitics * 0.42);
    const institutionalFit =
      traits.institutionCapacity * (0.26 + institutionalDemand * 0.56) +
      governance.tribunalCapacity * 0.08;
    const secularFit = agent.isSecular
      ? 0.82 + factors.secularization * 0.34 + factors.legalPluralism * 0.12
      : 1 - factors.secularization * 0.06;
    const resistancePenalty = clamp(
      (1 - affinity) * 0.16 +
        governance.antiProselytization * 0.06 * (1 - factors.legalPluralism) +
        governance.orthodoxy * 0.05 * factors.stateRegulation,
      0,
      0.32
    );

    const score =
      affinityAnchor * 0.48 +
      communityFit * 0.08 +
      missionFit * 0.08 +
      ritualFit * 0.09 +
      discourseFit * 0.07 +
      youthFit * 0.06 +
      identityFit * 0.07 +
      institutionalFit * 0.07 +
      metrics.retention * 0.03 +
      metrics.persuasion * 0.03 +
      mobilityDemand * metrics.openness * 0.07;

    return clamp(score * secularFit * (1 - resistancePenalty), 0.001, 3.2);
  }

  buildRegionalLandscape(agents, socialSignals, previousRegions = []) {
    const totalFollowers = agents.reduce((sum, agent) => sum + agent.followers, 0);
    const previousShareByRegion = new Map();
    for (const region of previousRegions || []) {
      const shares = new Map();
      for (const item of region.distribution || []) {
        shares.set(item.id, clamp(Number(item.share || 0), 0, 1));
      }
      previousShareByRegion.set(region.id, shares);
    }

    return WORLD_REGIONS.map((region) => {
      const regionTotal = Math.max(1200, Math.round(totalFollowers * region.populationWeight));
      const previousShares = previousShareByRegion.get(region.id) || new Map();
      const scores = agents.map((agent) => {
        const globalShare = clamp(agent.followers / Math.max(1, totalFollowers), 0.0001, 1);
        const fit = this.regionFitScore(agent, region, socialSignals);
        const affinity = clamp(Number(agent.regionalAffinity?.[region.id] || 0.3), 0.02, 1);
        const anchor = Math.pow(affinity, 2.15);
        const previousShare = clamp(Number(previousShares.get(agent.id) || 0), 0, 1);
        const inertia = previousShare > 0 ? 0.76 + Math.sqrt(previousShare) * 0.92 : 0.62 + anchor * 0.52;
        const diaspora = 0.84 + socialSignals.migration * (0.14 + Math.sqrt(globalShare) * 0.36);
        const baseMix = globalShare * 0.3 + anchor * 0.47 + fit * 0.23;
        const minorityFloor = 0.004 + anchor * 0.02;
        const score = Math.max(0.0001, baseMix * inertia * diaspora + minorityFloor);
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

  buildStructureOutput(round, topTransfers, regions, transferEngine, socialSignals = {}) {
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
        const mobility = this.regionMobilityFactor(fromRegion.regionId, toRegion.regionId, socialSignals);
        const friction = clamp(1.26 - mobility, 0.04, 0.78);
        const routeType = friction > 0.5 ? 'high_friction' : friction > 0.3 ? 'medium_friction' : 'low_friction';
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
          speed: (0.18 + intensity * 0.65) * (1 - friction * 0.42),
          ants: 3 + Math.round(intensity * 5 + (1 - friction) * 2),
          curve,
          friction,
          mobility,
          routeType,
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

  async start({
    useAI = true,
    useOpenAI,
    provider,
    locale = DEFAULT_LOCALE,
    scenario = DEFAULT_SCENARIO
  } = {}) {
    const aiEnabled = useOpenAI !== undefined ? useOpenAI !== false : useAI !== false;
    this.openaiClient.setProvider(provider || this.openaiClient.provider);
    this.openaiClient.setEnabled(aiEnabled);
    const resolvedLocale = normalizeLocale(locale);
    const resolvedScenario = normalizeScenario(scenario);
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

    const agents = generated.map((item) => {
      const strategy = this.buildInitialStrategy(item);
      return {
        ...item,
        strategy,
        strategyFocus: this.strategyFocusSummary(strategy),
        followers: INITIAL_FOLLOWERS_PER_RELIGION,
        delta: 0,
        transferIn: 0,
        transferOut: 0,
        topFrom: null,
        topTo: null,
        history: [INITIAL_FOLLOWERS_PER_RELIGION],
        lastAction: initialActionTemplate.replace('{name}', item.name)
      };
    });

    const startedAt = new Date().toISOString();
    const socialSignals = buildScenarioSignalTarget(resolvedScenario);
    const regions = this.buildRegionalLandscape(agents, socialSignals);
    this.assignDominantRegionToAgents(agents, regions);
    const regionControl = this.initializeRegionControl(regions);
    this.applyTerritoryBonuses(agents, regions, regionControl);
    const transferEngine = 'rule';
    const structureOutput = this.buildStructureOutput(0, [], regions, transferEngine, socialSignals);
    const roundMetrics = this.buildRoundMetrics(agents, [], [], regions);

    this.state = {
      round: 0,
      startedAt,
      updatedAt: startedAt,
      locale: resolvedLocale,
      scenario: resolvedScenario,
      socialSignals,
      agents,
      regions,
      transferEngine,
      structureOutput,
      roundMetrics,
      topTransfers: [],
      judgmentRecords: [],
      activeEvents: [],
      eventHistory: [],
      regionControl,
      bossCrisis: {
        active: false,
        phase: 0,
        totalPhases: 3,
        phaseDuration: 3,
        roundsLeft: 0,
        failedStages: 0,
        cooldown: 7,
        objective: '',
        log: [],
        startedRound: null,
        lastOutcome: null
      },
      manualSignalOverrides: {},
      logs: agents.map((agent) => ({
        type: 'mission',
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

  async tick({ locale, scenario } = {}) {
    const state = this.ensureState();
    state.round += 1;
    if (locale) {
      state.locale = normalizeLocale(locale);
    }
    if (scenario) {
      state.scenario = normalizeScenario(scenario);
    }
    state.scenario = normalizeScenario(state.scenario || DEFAULT_SCENARIO);
    const activeLocale = normalizeLocale(state.locale || DEFAULT_LOCALE);
    state.socialSignals = blendSignalsToScenario(state.socialSignals, state.scenario);
    state.socialSignals = this.driftSocialSignals(state.socialSignals);

    // 应用手动信号覆盖（用户通过滑块设置，单轮生效后自然衰减）
    if (state.manualSignalOverrides && Object.keys(state.manualSignalOverrides).length > 0) {
      for (const [key, val] of Object.entries(state.manualSignalOverrides)) {
        if (key in state.socialSignals) {
          state.socialSignals[key] = clamp(Number(val), 0.1, 0.98);
        }
      }
      state.manualSignalOverrides = {};
    }

    this.assignDominantRegionToAgents(state.agents, state.regions);
    state.regionControl = this.refreshRegionControl(state.regionControl || [], state.regions || []);
    this.applyTerritoryBonuses(state.agents, state.regions, state.regionControl);
    this.updateBossCrisis(state);
    // 随机事件系统
    this.applyEvents(state);
    this.adaptAgentStrategies(state.agents, state.socialSignals);
    for (const agent of state.agents) {
      agent.strategyFocus = this.strategyFocusSummary(agent.strategy);
    }

    const rulePlan = this.computeTransferPlan(state.agents, state.socialSignals, activeLocale);
    const aiLinks = await this.openaiClient.generateTransferStructure(
      state.round,
      state.agents,
      state.socialSignals,
      rulePlan.events,
      activeLocale
    );
    const structurePlan = this.computeTransferPlanFromStructure(
      state.agents,
      state.socialSignals,
      aiLinks,
      rulePlan.events,
      activeLocale
    );
    state.transferEngine = structurePlan.engine;
    const judgedPlan = this.applyReligiousJudgment(
      state.agents,
      structurePlan.events,
      state.socialSignals,
      state.round,
      activeLocale
    );
    state.judgmentRecords.push(...judgedPlan.records);
    if (state.judgmentRecords.length > 520) {
      state.judgmentRecords = state.judgmentRecords.slice(-520);
    }

    for (const agent of state.agents) {
      agent.delta = judgedPlan.deltas.get(agent.id) || 0;
      agent.followers += agent.delta;
    }

    this.reconcileInvariant(state.agents);

    const transferSummary = this.summarizeTransfers(judgedPlan.events, state.agents);
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
    for (const record of judgedPlan.records.slice(0, 18)) {
      state.logs.push({
        type: 'judgment',
        round: state.round,
        time: now,
        religionId: record.religionId,
        name: record.religionName,
        action: localJudgmentText(record, activeLocale),
        delta: 0,
        transferIn: 0,
        transferOut: record.blocked,
        followers: state.agents.find((agent) => agent.id === record.religionId)?.followers || 0,
        judgment: record
      });
    }

    for (const agent of state.agents) {
      const action =
        actionMap?.get(agent.name) || localActionText(agent, { net: agent.delta }, activeLocale);
      agent.lastAction = action;
      state.logs.push({
        type: 'mission',
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

    state.regions = this.buildRegionalLandscape(state.agents, state.socialSignals, state.regions);
    state.regionControl = this.refreshRegionControl(state.regionControl || [], state.regions || []);
    this.assignDominantRegionToAgents(state.agents, state.regions);
    this.applyTerritoryBonuses(state.agents, state.regions, state.regionControl);
    state.structureOutput = this.buildStructureOutput(
      state.round,
      state.topTransfers,
      state.regions,
      state.transferEngine,
      state.socialSignals
    );
    state.roundMetrics = this.buildRoundMetrics(
      state.agents,
      judgedPlan.events,
      judgedPlan.records,
      state.regions
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
      scenario: normalizeScenario(state.scenario || DEFAULT_SCENARIO),
      availableScenarios: listAvailableScenarios(),
      availableProviders: listAvailableProviders(),
      configVersion: this.config.version,
      useAI: this.openaiClient.enabled,
      useOpenAI: this.openaiClient.enabled,
      provider: this.openaiClient.provider,
      providerLabel: this.openaiClient.providerLabel,
      totalFollowers,
      invariantOk: totalFollowers === this.totalFollowers,
      targetTotalFollowers: this.totalFollowers,
      socialSignals: state.socialSignals,
      transferEngine: state.transferEngine,
      religions: state.agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        isSecular: agent.isSecular || false,
        exitBarrier: agent.exitBarrier || 0,
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
        strategyFocus: agent.strategyFocus,
        strategy: agent.strategy,
        metrics: agent.metrics,
        traits: agent.traits,
        governance: agent.governance,
        territoryBonus: agent.territoryBonus || {},
        dominantRegionId: agent.dominantRegionId || null,
        lastAction: agent.lastAction,
        history: agent.history
      })),
      regions: state.regions,
      regionControl: state.regionControl || [],
      topTransfers: state.topTransfers,
      judgmentRecords: state.judgmentRecords.slice(-100),
      roundMetrics: state.roundMetrics,
      structureOutput: state.structureOutput,
      logs: state.logs.slice(-160),
      activeEvents: state.activeEvents || [],
      eventHistory: (state.eventHistory || []).slice(-40),
      bossCrisis: state.bossCrisis || null
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
    provider: openaiClient.provider,
    providerLabel: openaiClient.providerLabel,
    model: openaiClient.model,
    availableProviders: listAvailableProviders(),
    aiConfigured: Boolean(openaiClient.apiKey),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    invariant: 'religion_total_constant'
  });
});

app.post('/api/simulation/start', async (req, res) => {
  try {
    const useAI = req.body?.useAI ?? req.body?.useOpenAI;
    const provider = normalizeProvider(req.body?.provider || openaiClient.provider);
    const locale = normalizeLocale(req.body?.locale || DEFAULT_LOCALE);
    const scenario = normalizeScenario(req.body?.scenario || DEFAULT_SCENARIO);
    const snapshot = await simulation.start({ useAI: useAI !== false, provider, locale, scenario });
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/simulation/tick', async (req, res) => {
  try {
    const locale = normalizeLocale(req.body?.locale || DEFAULT_LOCALE);
    const scenario = req.body?.scenario ? normalizeScenario(req.body?.scenario) : undefined;
    const snapshot = await simulation.tick({ locale, scenario });
    res.json(snapshot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/simulation/scenarios', (_req, res) => {
  res.json({
    defaultScenario: DEFAULT_SCENARIO,
    scenarios: listAvailableScenarios(),
    configVersion: SIMULATION_CONFIG.version
  });
});

app.get('/api/simulation/state', (_req, res) => {
  try {
    const snapshot = simulation.snapshot();
    res.json(snapshot);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// 手动覆盖社会信号（前端滑块控制）
app.post('/api/simulation/signals', (req, res) => {
  try {
    const state = simulation.ensureState();
    const overrides = req.body?.overrides || {};
    for (const [key, val] of Object.entries(overrides)) {
      if (key in state.socialSignals) {
        const num = Number(val);
        if (Number.isFinite(num)) {
          state.manualSignalOverrides[key] = clamp(num, 0.1, 0.98);
          // 立即应用到当前信号（让快照立即反映）
          state.socialSignals[key] = clamp(num, 0.1, 0.98);
        }
      }
    }
    res.json({ ok: true, socialSignals: state.socialSignals });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/simulation/report', async (req, res) => {
  try {
    const snapshot = simulation.snapshot();

    if (!openaiClient.enabled) {
      return res.status(400).json({ message: 'AI is not configured. Please set AI_API_KEY.' });
    }

    if (snapshot.round < 1) {
      return res.status(400).json({ message: 'Simulation has not started or no rounds completed.' });
    }

    const markdown = await openaiClient.generateReport(snapshot);
    if (!markdown) {
      return res.status(500).json({ message: 'AI failed to generate report content.' });
    }
    const academicMarkdown = ensureAcademicReportStructure(markdown, snapshot);

    const title = `Religion Dynamics Analysis Report — Round ${snapshot.round}`;

    const pdfBuffer = await generatePdfBuffer(academicMarkdown, { title });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="religion-analysis-round-${snapshot.round}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at ${resolveListenHostUrl(HOST)}`);
  if (HOST === '0.0.0.0' || HOST === '::') {
    const lanUrls = getLanUrls(PORT);
    if (lanUrls.length) {
      console.log(`Local network access:\n- ${lanUrls.join('\n- ')}`);
    }
  }
});
