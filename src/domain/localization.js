import { DEFAULT_LOCALE, normalizeLocale } from '../config/runtime.js';
import { clamp } from '../utils/math.js';

function localizedLabel(labels, key, lang) {
  return labels[key]?.[lang] || labels[key]?.en || key;
}

const STRATEGY_CHANNEL_LABELS = {
  digital: { en: 'digital', 'zh-CN': '数字传播', ja: 'デジタル発信' },
  service: { en: 'community service', 'zh-CN': '社群服务', ja: '地域奉仕' },
  ritual: { en: 'ritual practice', 'zh-CN': '仪式实践', ja: '儀礼実践' },
  intellectual: { en: 'public dialogue', 'zh-CN': '公共对话', ja: '公共対話' },
  youth: { en: 'youth engagement', 'zh-CN': '青年触达', ja: '若年層接点' },
  identity: { en: 'identity bonding', 'zh-CN': '身份凝聚', ja: 'アイデンティティ結束' },
  institution: { en: 'institutional network', 'zh-CN': '组织网络', ja: '制度ネットワーク' }
};

export function localizedStrategyChannel(channel, locale = DEFAULT_LOCALE) {
  return localizedLabel(STRATEGY_CHANNEL_LABELS, channel, normalizeLocale(locale));
}

export function localActionText(agent, transfer, locale = DEFAULT_LOCALE) {
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

const REASON_LABELS = {
  digital_spread: { en: 'Digital outreach expansion', 'zh-CN': '数字化传播扩散', ja: 'デジタル発信の拡張' },
  community_service: { en: 'Community service attraction', 'zh-CN': '社群服务吸引', ja: '地域奉仕による吸引' },
  identity_shift: { en: 'Identity realignment', 'zh-CN': '身份认同重组', ja: 'アイデンティティ再編' },
  meaning_search: { en: 'Growing search for meaning', 'zh-CN': '意义感寻求增强', ja: '意味追求の高まり' },
  youth_resonance: { en: 'Youth issue resonance', 'zh-CN': '青年议题共鸣', ja: '若年層課題との共鳴' },
  institutional_pull: { en: 'Institutional network pull', 'zh-CN': '制度型组织吸纳', ja: '制度ネットワークの吸引' },
  secular_shift: { en: 'Secular value drift', 'zh-CN': '世俗价值迁移', ja: '世俗価値への移行' },
  polarization_alignment: { en: 'Polarized identity alignment', 'zh-CN': '极化身份趋同', ja: '分極化した同一性への整合' },
  pluralism_dialogue: { en: 'Pluralism-driven dialogue', 'zh-CN': '多元对话吸引', ja: '多元対話による吸引' }
};

const JUDGMENT_REASON_LABELS = {
  orthodoxy_enforcement: { en: 'Orthodoxy enforcement', 'zh-CN': '教义正统性执法', ja: '教義正統性の執行' },
  anti_proselytization_guard: { en: 'Anti-proselytization guard', 'zh-CN': '反传教防护', ja: '改宗勧誘の抑制' },
  identity_conflict: { en: 'Identity conflict control', 'zh-CN': '身份冲突管控', ja: 'アイデンティティ衝突の抑制' },
  legal_restriction: { en: 'Regulatory restriction', 'zh-CN': '监管限制', ja: '規制制限' }
};

export function localizedReasonLabel(reasonKey, locale = DEFAULT_LOCALE) {
  return localizedLabel(REASON_LABELS, reasonKey, normalizeLocale(locale));
}

export function localizedJudgmentReasonLabel(reasonKey, locale = DEFAULT_LOCALE) {
  return localizedLabel(JUDGMENT_REASON_LABELS, reasonKey, normalizeLocale(locale));
}

export function localJudgmentText(record, locale = DEFAULT_LOCALE) {
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
