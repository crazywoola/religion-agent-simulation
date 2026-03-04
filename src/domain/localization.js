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

const CHANNEL_ACTION_PHRASES = {
  digital: {
    en: ['Amplified reach through digital platforms and viral content', 'Launched targeted online campaigns across social media'],
    'zh-CN': ['通过数字平台与病毒式内容扩大影响力', '在社交媒体上发起精准线上传播'],
    ja: ['デジタルプラットフォームとバイラルコンテンツで到達範囲を拡大', 'SNS全域でターゲット型オンラインキャンペーンを展開']
  },
  service: {
    en: ['Expanded community aid programs and relief networks', 'Drew followers through grassroots social outreach'],
    'zh-CN': ['扩展社区援助项目与互助网络', '通过基层社会服务吸引新信众'],
    ja: ['コミュニティ支援プログラムと救済ネットワークを拡充', '草の根の社会活動で信徒を引き付けた']
  },
  ritual: {
    en: ['Deepened ritual engagement and ceremonial traditions', 'Strengthened devotional practices attracting the spiritually curious'],
    'zh-CN': ['深化仪式参与与典礼传统', '强化灵性修持吸引求道者'],
    ja: ['儀礼への参加と祭典の伝統を深化', '霊性実践を強化し探求者を引き付けた']
  },
  intellectual: {
    en: ['Hosted interfaith dialogues and public intellectual forums', 'Engaged in philosophical discourse and open debates'],
    'zh-CN': ['举办跨信仰对话与公共知识论坛', '参与哲学讨论与公开辩论'],
    ja: ['宗教間対話と公共知識フォーラムを開催', '哲学的議論とオープンディベートに参加']
  },
  youth: {
    en: ['Organized youth-facing events and campus outreach', 'Connected with younger demographics through cultural events'],
    'zh-CN': ['组织面向青年的活动与校园传播', '通过文化活动联结年轻群体'],
    ja: ['若者向けイベントとキャンパス活動を組織', '文化イベントで若年層とつながりを構築']
  },
  identity: {
    en: ['Reinforced communal identity bonds and heritage narratives', 'Consolidated group cohesion through shared identity markers'],
    'zh-CN': ['强化社群身份认同与传承叙事', '通过共同身份标识巩固群体凝聚'],
    ja: ['共同体のアイデンティティの絆と継承物語を強化', '共有のアイデンティティ標識でグループの結束を強化']
  },
  institution: {
    en: ['Leveraged institutional networks for structured outreach', 'Mobilized organizational capacity for systematic expansion'],
    'zh-CN': ['借助制度化网络实施结构化传播', '动员组织能力进行系统性拓展'],
    ja: ['制度的ネットワークを活用した体系的布教', '組織能力を動員して計画的な拡張を推進']
  }
};

const GROWTH_PHRASES = {
  en: ['Gained ground as social conditions favored expansion', 'Attracted new followers amid shifting social dynamics', 'Capitalized on favorable conditions to grow community'],
  'zh-CN': ['社会条件有利时扩大了影响范围', '在社会动态变化中吸引了新信众', '抓住有利条件壮大社群'],
  ja: ['社会条件が有利な中で勢力圏を拡大', '社会ダイナミクスの変化の中で新たな信徒を獲得', '有利な条件を活かしてコミュニティを成長させた']
};

const DECLINE_PHRASES = {
  en: ['Lost followers amid rising social pressures', 'Faced outflow as competing narratives gained traction', 'Struggled to retain members under shifting conditions'],
  'zh-CN': ['在社会压力上升中流失了信众', '竞争叙事占据优势导致人员外流', '在变化的环境下保持成员变得困难'],
  ja: ['社会的圧力の高まりの中で信徒を失った', '競合するナラティブが勢いを増す中で流出が発生', '変化する状況下でのメンバー維持に苦戦']
};

const STABLE_PHRASES = {
  en: ['Maintained equilibrium through steady institutional presence', 'Held ground with consistent community engagement'],
  'zh-CN': ['凭借稳定的制度化存在维持了均势', '通过持续的社群参与稳住了阵地'],
  ja: ['安定した制度的存在感で均衡を維持', '継続的なコミュニティ参加で陣地を堅持']
};

export function localActionText(agent, transfer, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const focus = Array.isArray(agent.strategyFocus)
    ? agent.strategyFocus.slice(0, 2).map((item) => localizedStrategyChannel(item, lang))
    : [];
  const topChannel = Array.isArray(agent.strategyFocus) && agent.strategyFocus.length > 0
    ? agent.strategyFocus[0]
    : null;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let actionPhrase;
  const channelPhrases = topChannel && CHANNEL_ACTION_PHRASES[topChannel];
  if (channelPhrases && channelPhrases[lang]) {
    actionPhrase = pick(channelPhrases[lang]);
  } else if (transfer.net > 30) {
    actionPhrase = pick(GROWTH_PHRASES[lang] || GROWTH_PHRASES.en);
  } else if (transfer.net < -30) {
    actionPhrase = pick(DECLINE_PHRASES[lang] || DECLINE_PHRASES.en);
  } else {
    actionPhrase = pick(STABLE_PHRASES[lang] || STABLE_PHRASES.en);
  }

  if (lang === 'zh-CN') {
    const movement = transfer.net >= 0 ? '净流入' : '净流出';
    const focusText = focus.length ? `。策略重点：${focus.join('、')}` : '';
    return `${actionPhrase}${focusText}。本轮${movement} ${Math.abs(transfer.net)} 人。`;
  }

  if (lang === 'ja') {
    const movement = transfer.net >= 0 ? '純流入' : '純流出';
    const focusText = focus.length ? `。重点戦略: ${focus.join('・')}` : '';
    return `${actionPhrase}${focusText}。このラウンドの${movement}: ${Math.abs(transfer.net)}人。`;
  }

  const movement = transfer.net >= 0 ? 'net inflow' : 'net outflow';
  const focusText = focus.length ? ` Focus: ${focus.join(' / ')}.` : '';
  return `${actionPhrase}.${focusText} ${movement}: ${Math.abs(transfer.net)} followers this round.`;
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
  const high = level >= 50;
  const key = record.reasonKey || 'orthodoxy_enforcement';

  if (lang === 'zh-CN') {
    const templates = {
      orthodoxy_enforcement: high
        ? `${record.religionName}召开正统教义法庭，裁定${record.targetReligionName}的传教行为构成异端偏离，强制拦截 ${record.blocked} 人（强度 ${level}%）。`
        : `${record.religionName}以教义合规为由向${record.targetReligionName}发出警告，阻止了 ${record.blocked} 人转入（强度 ${level}%）。`,
      anti_proselytization_guard: high
        ? `${record.religionName}启动反传教禁令，全面封锁${record.targetReligionName}的劝诱渠道，拦截 ${record.blocked} 人（强度 ${level}%）。`
        : `${record.religionName}对${record.targetReligionName}的传教活动施加限制令，阻止了 ${record.blocked} 人外流（强度 ${level}%）。`,
      identity_conflict: high
        ? `${record.religionName}援引身份保护法令，宣布${record.targetReligionName}的扩张威胁社群认同，拦截 ${record.blocked} 人（强度 ${level}%）。`
        : `${record.religionName}以身份冲突为由限制了${record.targetReligionName}的渗透，阻止了 ${record.blocked} 人（强度 ${level}%）。`,
      legal_restriction: high
        ? `${record.religionName}配合国家监管强制执法，以法律手段压制${record.targetReligionName}的传教行为，拦截 ${record.blocked} 人（强度 ${level}%）。`
        : `${record.religionName}援引宗教监管条例限制${record.targetReligionName}的活动范围，阻止了 ${record.blocked} 人（强度 ${level}%）。`
    };
    return templates[key] || templates.orthodoxy_enforcement;
  }

  if (lang === 'ja') {
    const templates = {
      orthodoxy_enforcement: high
        ? `${record.religionName}は正統教義法廷を召集し、${record.targetReligionName}の布教を異端逸脱と裁定。${record.blocked}人を強制遮断（強度${level}%）。`
        : `${record.religionName}は教義コンプライアンスを理由に${record.targetReligionName}へ警告を発し、${record.blocked}人の流入を阻止（強度${level}%）。`,
      anti_proselytization_guard: high
        ? `${record.religionName}は改宗禁止令を発動し、${record.targetReligionName}の勧誘チャネルを全面封鎖。${record.blocked}人を遮断（強度${level}%）。`
        : `${record.religionName}は${record.targetReligionName}の布教活動に制限令を適用し、${record.blocked}人の流出を阻止（強度${level}%）。`,
      identity_conflict: high
        ? `${record.religionName}はアイデンティティ保護法令を援用し、${record.targetReligionName}の拡張がコミュニティの同一性を脅かすと宣言。${record.blocked}人を遮断（強度${level}%）。`
        : `${record.religionName}はアイデンティティ対立を理由に${record.targetReligionName}の浸透を制限し、${record.blocked}人を阻止（強度${level}%）。`,
      legal_restriction: high
        ? `${record.religionName}は国家規制と連携し、法的手段で${record.targetReligionName}の布教を抑圧。${record.blocked}人を遮断（強度${level}%）。`
        : `${record.religionName}は宗教規制条項を援用し${record.targetReligionName}の活動範囲を制限。${record.blocked}人を阻止（強度${level}%）。`
    };
    return templates[key] || templates.orthodoxy_enforcement;
  }

  const templates = {
    orthodoxy_enforcement: high
      ? `${record.religionName} convened an orthodoxy tribunal, ruling ${record.targetReligionName}'s proselytization as doctrinal deviation. ${record.blocked} followers blocked (intensity ${level}%).`
      : `${record.religionName} issued a doctrinal compliance warning to ${record.targetReligionName}, blocking ${record.blocked} followers (intensity ${level}%).`,
    anti_proselytization_guard: high
      ? `${record.religionName} activated anti-proselytization decrees, shutting down ${record.targetReligionName}'s conversion channels. ${record.blocked} blocked (intensity ${level}%).`
      : `${record.religionName} imposed proselytization restrictions on ${record.targetReligionName}, preventing ${record.blocked} from leaving (intensity ${level}%).`,
    identity_conflict: high
      ? `${record.religionName} invoked identity protection decrees, declaring ${record.targetReligionName}'s expansion a threat to communal identity. ${record.blocked} blocked (intensity ${level}%).`
      : `${record.religionName} restricted ${record.targetReligionName}'s outreach on identity conflict grounds, blocking ${record.blocked} followers (intensity ${level}%).`,
    legal_restriction: high
      ? `${record.religionName} enforced state-backed religious regulation, legally suppressing ${record.targetReligionName}'s missionary activity. ${record.blocked} blocked (intensity ${level}%).`
      : `${record.religionName} cited regulatory statutes to limit ${record.targetReligionName}'s operational scope, blocking ${record.blocked} followers (intensity ${level}%).`
  };
  return templates[key] || templates.orthodoxy_enforcement;
}
