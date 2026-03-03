export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'ja'];
export const DEFAULT_LOCALE = 'en';

const DICTIONARY = {
  en: {
    app: {
      title: 'OpenAI Multi-Religion Agent Simulator',
      header: 'Religion Agent Simulation',
      hint:
        'Each religion starts with 10,000 followers. The system simulates only assimilation/loss across religions, while the total population remains constant.'
    },
    controls: {
      start: 'Start Simulation',
      stop: 'Pause',
      polling: 'Tick Interval (ms)',
      useOpenAI: 'Use OpenAI API for doctrine/action generation',
      language: 'Language'
    },
    section: {
      religions: 'Religion Profiles',
      insights: 'Map Insights',
      regions: 'Regional Landscape',
      transfers: 'Key Assimilation Links',
      logs: 'Mission Logs'
    },
    status: {
      notStarted: 'Status: Not started',
      initializing: 'Status: Initializing...',
      running:
        'Status: Running (Round {round}) | Followers {total} / {target} ({invariant}) | Engine: {engine} | OpenAI: {openai}',
      pausedRound: 'Status: Paused (at round {round})',
      paused: 'Status: Paused',
      error: 'Status: Error - {message}',
      startFailed: 'Status: Startup failed - {message}',
      invariantFixed: 'constant',
      invariantAbnormal: 'abnormal'
    },
    engine: {
      ai: 'AI',
      hybrid: 'Hybrid',
      rule: 'Rule'
    },
    common: {
      on: 'On',
      off: 'Off',
      none: 'N/A'
    },
    card: {
      inOut: 'Assimilation In/Out',
      doctrine: 'Doctrine',
      doctrineLong: 'Long Description',
      classics: 'Classic Texts',
      action: 'This Round Action'
    },
    region: {
      summary: 'Scale: {total}, Competition: {intensity}%'
    },
    transfer: {
      empty: 'No transfer links yet',
      ai: 'AI',
      rule: 'Rule',
      corridor: 'Corridor',
      intensity: 'Intensity',
      speed: 'Speed'
    },
    insight: {
      totalFlow: 'Total Transfer Volume',
      aiShare: 'AI Contribution',
      strongestCorridor: 'Strongest Corridor',
      dominantReligion: 'Global Dominant Religion',
      mostCompetitiveRegion: 'Most Competitive Region',
      lineCount: 'Active Lines',
      engine: 'Transfer Engine',
      judgmentCount: 'Religious Judgments',
      noData: 'Not enough data'
    },
    hud: {
      round: 'Round',
      totalFollowers: 'Total Followers',
      activeLines: 'Active Lines',
      topSignal: 'Top Signal'
    },
    signal: {
      digitalization: 'Digitalization',
      economicStress: 'Economic Stress',
      migration: 'Migration',
      institutionalTrust: 'Institutional Trust',
      identityPolitics: 'Identity Politics',
      youthPressure: 'Youth Pressure',
      meaningSearch: 'Meaning Search',
      socialFragmentation: 'Social Fragmentation',
      secularization: 'Secularization',
      legalPluralism: 'Legal Pluralism',
      mediaPolarization: 'Media Polarization',
      stateRegulation: 'State Regulation'
    },
    log: {
      header: 'Round {round} · {time} · {name}',
      net: 'Net: {delta} (In {inflow} / Out {outflow})',
      judgment: 'Judgment Record'
    },
    religionNames: {
      buddhism: 'Buddhism',
      hinduism: 'Hinduism',
      taoism: 'Taoism',
      shinto: 'Shinto',
      islam: 'Islam',
      protestant: 'Christianity (Protestant)',
      pastafarianism: 'Pastafarianism',
      catholicism: 'Catholicism'
    },
    regionNames: {
      north_america: 'North America',
      latin_america: 'Latin America',
      europe: 'Europe',
      middle_east_africa: 'Middle East / Africa',
      south_asia: 'South Asia',
      east_asia: 'East Asia',
      global_online: 'Online Communities'
    }
  },
  'zh-CN': {
    app: {
      title: 'OpenAI 多宗教 Agent 模拟器',
      header: '宗教 Agent 模拟',
      hint:
        '每个宗教初始 10000 信徒。系统仅模拟宗教间同化/流失，且总信徒恒定不变。'
    },
    controls: {
      start: '开始模拟',
      stop: '暂停',
      polling: '轮询间隔(ms)',
      useOpenAI: '使用 OpenAI API 生成教义/传教日志',
      language: '语言'
    },
    section: {
      religions: '宗教信息',
      insights: '地图洞察',
      regions: '区域格局',
      transfers: '关键同化链路',
      logs: '传教日志'
    },
    status: {
      notStarted: '状态：未开始',
      initializing: '状态：初始化中...',
      running:
        '状态：运行中（第 {round} 轮） | 总信徒 {total} / {target}（{invariant}） | 转化引擎：{engine} | OpenAI：{openai}',
      pausedRound: '状态：已暂停（停在第 {round} 轮）',
      paused: '状态：已暂停',
      error: '状态：错误 - {message}',
      startFailed: '状态：启动失败 - {message}',
      invariantFixed: '恒定',
      invariantAbnormal: '异常'
    },
    engine: {
      ai: 'AI',
      hybrid: '混合',
      rule: '规则'
    },
    common: {
      on: '开启',
      off: '关闭',
      none: '暂无'
    },
    card: {
      inOut: '同化流入/流出',
      doctrine: '教义',
      doctrineLong: '长描述',
      classics: '经典著作',
      action: '本轮行为'
    },
    region: {
      summary: '区域规模：{total}，竞争强度：{intensity}%'
    },
    transfer: {
      empty: '暂无转移链路',
      ai: 'AI',
      rule: '规则',
      corridor: '走廊',
      intensity: '强度',
      speed: '速度'
    },
    insight: {
      totalFlow: '总转化流量',
      aiShare: 'AI 贡献占比',
      strongestCorridor: '最强转化走廊',
      dominantReligion: '全局主导宗教',
      mostCompetitiveRegion: '竞争最激烈区域',
      lineCount: '活跃链路数',
      engine: '转化引擎',
      judgmentCount: '宗教审判次数',
      noData: '暂无足够数据'
    },
    hud: {
      round: '轮次',
      totalFollowers: '总信徒',
      activeLines: '活跃链路',
      topSignal: '主导社会信号'
    },
    signal: {
      digitalization: '数字化',
      economicStress: '经济压力',
      migration: '迁移流动',
      institutionalTrust: '制度信任',
      identityPolitics: '身份政治',
      youthPressure: '青年压力',
      meaningSearch: '意义追寻',
      socialFragmentation: '社会碎片化',
      secularization: '世俗化',
      legalPluralism: '法律多元',
      mediaPolarization: '舆论极化',
      stateRegulation: '国家监管'
    },
    log: {
      header: '第 {round} 轮 · {time} · {name}',
      net: '净变化：{delta}（流入 {inflow} / 流出 {outflow}）',
      judgment: '宗教审判记录'
    },
    religionNames: {
      buddhism: '佛教',
      hinduism: '印度教',
      taoism: '道教',
      shinto: '日本神道教',
      islam: '伊斯兰教',
      protestant: '基督教',
      pastafarianism: '飞天面条神教',
      catholicism: '天主教'
    },
    regionNames: {
      north_america: '北美',
      latin_america: '拉美',
      europe: '欧洲',
      middle_east_africa: '中东/非洲',
      south_asia: '南亚',
      east_asia: '东亚',
      global_online: '线上社群'
    }
  },
  ja: {
    app: {
      title: 'OpenAI 宗教エージェント・シミュレーター',
      header: '宗教エージェント・シミュレーション',
      hint:
        '各宗教は1万人から開始します。宗教間の同化・流出のみをシミュレーションし、総信徒数は一定です。'
    },
    controls: {
      start: 'シミュレーション開始',
      stop: '一時停止',
      polling: 'ティック間隔(ms)',
      useOpenAI: '教義/行動ログ生成に OpenAI API を使用',
      language: '言語'
    },
    section: {
      religions: '宗教プロファイル',
      insights: 'マップ洞察',
      regions: '地域勢力図',
      transfers: '主要同化リンク',
      logs: '布教ログ'
    },
    status: {
      notStarted: '状態：未開始',
      initializing: '状態：初期化中...',
      running:
        '状態：実行中（ラウンド {round}） | 信徒総数 {total} / {target}（{invariant}） | エンジン：{engine} | OpenAI：{openai}',
      pausedRound: '状態：一時停止（ラウンド {round}）',
      paused: '状態：一時停止',
      error: '状態：エラー - {message}',
      startFailed: '状態：起動失敗 - {message}',
      invariantFixed: '一定',
      invariantAbnormal: '異常'
    },
    engine: {
      ai: 'AI',
      hybrid: 'ハイブリッド',
      rule: 'ルール'
    },
    common: {
      on: 'オン',
      off: 'オフ',
      none: 'なし'
    },
    card: {
      inOut: '同化流入/流出',
      doctrine: '教義',
      doctrineLong: '長文説明',
      classics: '代表経典',
      action: 'このラウンドの行動'
    },
    region: {
      summary: '地域規模：{total}、競争強度：{intensity}%'
    },
    transfer: {
      empty: '転化リンクはまだありません',
      ai: 'AI',
      rule: 'ルール',
      corridor: 'コリドー',
      intensity: '強度',
      speed: '速度'
    },
    insight: {
      totalFlow: '総転化フロー量',
      aiShare: 'AI 寄与率',
      strongestCorridor: '最強コリドー',
      dominantReligion: '全体優勢宗教',
      mostCompetitiveRegion: '最激戦地域',
      lineCount: 'アクティブ線数',
      engine: '転化エンジン',
      judgmentCount: '宗教審判件数',
      noData: '十分なデータがありません'
    },
    hud: {
      round: 'ラウンド',
      totalFollowers: '信徒総数',
      activeLines: 'アクティブ線',
      topSignal: '主要社会シグナル'
    },
    signal: {
      digitalization: 'デジタル化',
      economicStress: '経済ストレス',
      migration: '移動・流入',
      institutionalTrust: '制度信頼',
      identityPolitics: 'アイデンティティ政治',
      youthPressure: '若年層圧力',
      meaningSearch: '意味追求',
      socialFragmentation: '社会分断',
      secularization: '世俗化',
      legalPluralism: '法的多元性',
      mediaPolarization: 'メディア分極化',
      stateRegulation: '国家規制'
    },
    log: {
      header: 'ラウンド {round} · {time} · {name}',
      net: '純変化：{delta}（流入 {inflow} / 流出 {outflow}）',
      judgment: '宗教審判ログ'
    },
    religionNames: {
      buddhism: '仏教',
      hinduism: 'ヒンドゥー教',
      taoism: '道教',
      shinto: '神道',
      islam: 'イスラム教',
      protestant: 'キリスト教（プロテスタント）',
      pastafarianism: '空飛ぶスパゲッティ・モンスター教',
      catholicism: 'カトリック'
    },
    regionNames: {
      north_america: '北米',
      latin_america: '中南米',
      europe: 'ヨーロッパ',
      middle_east_africa: '中東・アフリカ',
      south_asia: '南アジア',
      east_asia: '東アジア',
      global_online: 'オンラインコミュニティ'
    }
  }
};

function getByPath(obj, key) {
  return key.split('.').reduce((acc, part) => (acc && part in acc ? acc[part] : undefined), obj);
}

export function normalizeLocale(input) {
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

export function getPreferredLocale() {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }
  return normalizeLocale(navigator.language || DEFAULT_LOCALE);
}

export function getLocaleLabel(locale) {
  const map = {
    en: 'English',
    'zh-CN': '简体中文',
    ja: '日本語'
  };
  return map[normalizeLocale(locale)] || map.en;
}

export function createI18n(initialLocale) {
  const state = {
    locale: normalizeLocale(initialLocale)
  };

  const t = (key, vars = {}) => {
    const langDict = DICTIONARY[state.locale] || DICTIONARY[DEFAULT_LOCALE];
    const fallbackDict = DICTIONARY[DEFAULT_LOCALE];
    const raw = getByPath(langDict, key) ?? getByPath(fallbackDict, key) ?? key;
    if (typeof raw !== 'string') {
      return key;
    }

    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  };

  return {
    get locale() {
      return state.locale;
    },
    setLocale(locale) {
      state.locale = normalizeLocale(locale);
    },
    t,
    religionName(id, fallbackName) {
      return t(`religionNames.${id}`) || fallbackName || id;
    },
    regionName(id, fallbackName) {
      return t(`regionNames.${id}`) || fallbackName || id;
    },
    number(value) {
      return new Intl.NumberFormat(state.locale).format(value);
    },
    time(value) {
      return new Intl.DateTimeFormat(state.locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date(value));
    }
  };
}
