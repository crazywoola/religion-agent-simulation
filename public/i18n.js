export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'ja'];
export const DEFAULT_LOCALE = 'en';

const DICTIONARY = {
  en: {
    app: {
      title: 'AI Multi-Religion Agent Simulator',
      header: 'Religion Agent Simulation',
      hint:
        'Each religion starts with 10,000 followers. The system simulates only assimilation/loss across religions, while the total population remains constant.'
    },
    controls: {
      start: 'Start',
      stop: 'Pause',
      restart: 'Restart',
      polling: 'Tick Interval (ms)',
      useAI: 'Use AI API for doctrine/action generation',
      language: 'Language',
      scenario: 'Scenario',
      provider: 'AI Provider',
      logFilter: 'Log Filter',
      screenshot: 'Screenshot',
      gameGuide: 'Game Guide',
      exportReport: 'Export AI Analysis Report',
      generatingReport: 'AI is generating report...',
      reportFailed: 'Report generation failed',
      drawerToggle: 'Insights & Logs',
      signalReset: 'Reset Signals',
      dailyChallenge: 'Daily Challenge',
      ironman: 'Ironman',
      settings: 'Game Settings',
      runStorage: 'Run Storage',
      clearData: 'Clear Saved Data',
      collapse: 'Collapse',
      expand: 'Expand'
    },
    drawer: {
      insights: 'Insights',
      logs: 'Logs'
    },
    section: {
      religions: 'Religion Profiles',
      insights: 'Map Insights',
      regions: 'Regional Landscape',
      transfers: 'Key Assimilation Links',
      logs: 'Mission Logs',
      events: 'Breaking Events',
      signals: 'Signal Control',
      history: 'Follower Trend',
      gameLab: 'Game Lab',
      subtabAssimilation: 'Assimilation',
      subtabRegions: 'Regions',
      subtabEvents: 'Events'
    },
    modal: {
      traits: 'Trait Radar',
      strategy: 'Strategy Channels',
      governance: 'Governance',
      exitBarrier: 'Exit Barrier',
      followers: 'Followers',
      close: 'Close'
    },
    event: {
      religious_scandal: 'Religious Scandal',
      digital_revival: 'Digital Revival',
      political_persecution: 'Political Persecution',
      migration_wave: 'Migration Wave',
      economic_crisis: 'Economic Crisis',
      youth_awakening: 'Youth Awakening',
      polarization_spike: 'Polarization Spike',
      pluralism_wave: 'Pluralism Wave',
      climate_anxiety: 'Climate Anxiety',
      institutional_reform: 'Institutional Reform',
      global_crisis: 'Global Crisis'
    },
    status: {
      notStarted: 'Status: Not started',
      initializing: 'Status: Initializing...',
      running:
        'Status: Running (Round {round}) | Followers {total} / {target} ({invariant}) | Engine: {engine} | AI: {ai} | Provider: {provider}',
      pausedRound: 'Status: Paused (at round {round})',
      paused: 'Status: Paused',
      dataCleared: 'Status: Saved run data has been cleared',
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
    provider: {
      openai: 'OpenAI',
      moonshot: 'Moonshot / Kimi'
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
      speed: 'Speed',
      factors: 'Top factors'
    },
    insight: {
      scenario: 'Scenario',
      totalFlow: 'Total Transfer Volume',
      judgmentRatio: 'Judgment Ratio',
      conversionEfficiency: 'Net Conversion Efficiency',
      regionalVolatility: 'Regional Volatility',
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
      judgment: 'Judgment Record',
      deck: 'Strategy Deck',
      empty: 'No logs for current filter'
    },
    logFilter: {
      all: 'All',
      mission: 'Mission',
      judgment: 'Judgment'
    },
    scenario: {
      balanced: 'Balanced',
      high_regulation: 'High Regulation',
      high_secularization: 'High Secularization',
      high_polarization: 'High Polarization'
    },
    religionNames: {
      buddhism: 'Buddhism',
      hinduism: 'Hinduism',
      taoism: 'Taoism',
      shinto: 'Shinto',
      islam: 'Islam',
      protestant: 'Christianity (Protestant)',
      pastafarianism: 'Pastafarianism',
      catholicism: 'Catholicism',
      secular: 'Secular / No Religion'
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
      title: 'AI 多宗教 Agent 模拟器',
      header: '宗教 Agent 模拟',
      hint:
        '每个宗教初始 10000 信徒。系统仅模拟宗教间同化/流失，且总信徒恒定不变。'
    },
    controls: {
      start: '开始模拟',
      stop: '暂停',
      restart: '重新开始',
      polling: '轮询间隔(ms)',
      useAI: '使用 AI API 生成教义/传教日志',
      language: '语言',
      scenario: '场景',
      provider: 'AI 提供商',
      logFilter: '日志筛选',
      screenshot: '截图',
      gameGuide: '游戏指南',
      exportReport: '导出 AI 分析报告',
      generatingReport: 'AI 正在生成报告...',
      reportFailed: '报告生成失败',
      drawerToggle: '洞察与日志',
      signalReset: '重置信号',
      dailyChallenge: '每日挑战',
      ironman: '铁人模式',
      settings: '游戏设置',
      runStorage: '对局存档',
      clearData: '清除已存数据',
      collapse: '收起',
      expand: '展开'
    },
    drawer: {
      insights: '洞察',
      logs: '日志'
    },
    section: {
      religions: '宗教信息',
      insights: '地图洞察',
      regions: '区域格局',
      transfers: '关键同化链路',
      logs: '传教日志',
      events: '突发事件',
      signals: '信号调控',
      history: '信众趋势',
      gameLab: '游戏实验室',
      subtabAssimilation: '同化链路',
      subtabRegions: '区域格局',
      subtabEvents: '突发事件'
    },
    modal: {
      traits: '特质雷达',
      strategy: '策略通道',
      governance: '治理机制',
      exitBarrier: '离教壁垒',
      followers: '信众数',
      close: '关闭'
    },
    event: {
      religious_scandal: '宗教丑闻',
      digital_revival: '数字复兴',
      political_persecution: '政治迫害',
      migration_wave: '移民潮',
      economic_crisis: '经济危机',
      youth_awakening: '青年觉醒',
      polarization_spike: '极化激增',
      pluralism_wave: '多元化浪潮',
      climate_anxiety: '气候焦虑',
      institutional_reform: '制度改革',
      global_crisis: '全球危机'
    },
    status: {
      notStarted: '状态：未开始',
      initializing: '状态：初始化中...',
      running:
        '状态：运行中（第 {round} 轮） | 总信徒 {total} / {target}（{invariant}） | 转化引擎：{engine} | AI：{ai} | 提供商：{provider}',
      pausedRound: '状态：已暂停（停在第 {round} 轮）',
      paused: '状态：已暂停',
      dataCleared: '状态：已清除本地对局数据',
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
    provider: {
      openai: 'OpenAI',
      moonshot: 'Moonshot / Kimi'
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
      speed: '速度',
      factors: '主因子'
    },
    insight: {
      scenario: '场景',
      totalFlow: '总转化流量',
      judgmentRatio: '审判拦截率',
      conversionEfficiency: '净转化效率',
      regionalVolatility: '区域波动性',
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
      migration: '人口迁移',
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
      judgment: '宗教审判记录',
      deck: '策略卡组',
      empty: '当前筛选条件下暂无日志'
    },
    logFilter: {
      all: '全部',
      mission: '传教',
      judgment: '审判'
    },
    scenario: {
      balanced: '平衡场景',
      high_regulation: '高监管场景',
      high_secularization: '高世俗化场景',
      high_polarization: '高极化场景'
    },
    religionNames: {
      buddhism: '佛教',
      hinduism: '印度教',
      taoism: '道教',
      shinto: '日本神道教',
      islam: '伊斯兰教',
      protestant: '基督教',
      pastafarianism: '飞天面条神教',
      catholicism: '天主教',
      secular: '无宗教/世俗主义'
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
      title: 'AI 宗教エージェント・シミュレーター',
      header: '宗教エージェント・シミュレーション',
      hint:
        '各宗教は1万人から開始します。宗教間の同化・流出のみをシミュレーションし、総信徒数は一定です。'
    },
    controls: {
      start: 'Start',
      stop: '一時停止',
      restart: 'リスタート',
      polling: 'ティック間隔(ms)',
      useAI: '教義/行動ログ生成に AI API を使用',
      language: '言語',
      scenario: 'シナリオ',
      provider: 'AI プロバイダ',
      logFilter: 'ログフィルター',
      screenshot: 'スクリーンショット',
      gameGuide: 'ゲームガイド',
      exportReport: 'AI分析レポートをエクスポート',
      generatingReport: 'AIがレポートを生成中...',
      reportFailed: 'レポート生成に失敗しました',
      drawerToggle: 'インサイトとログ',
      signalReset: 'シグナルリセット',
      dailyChallenge: 'デイリーチャレンジ',
      ironman: 'アイアンマン',
      settings: 'ゲーム設定',
      runStorage: 'ラン保存',
      clearData: '保存データを消去',
      collapse: '折りたたむ',
      expand: '展開'
    },
    drawer: {
      insights: 'インサイト',
      logs: 'ログ'
    },
    section: {
      religions: '宗教プロファイル',
      insights: 'マップ洞察',
      regions: '地域勢力図',
      transfers: '主要同化リンク',
      logs: '布教ログ',
      events: '突発イベント',
      signals: 'シグナル操作',
      history: '信徒トレンド',
      gameLab: 'ゲームラボ',
      subtabAssimilation: '同化',
      subtabRegions: '地域',
      subtabEvents: 'イベント'
    },
    modal: {
      traits: '特性レーダー',
      strategy: '戦略チャンネル',
      governance: 'ガバナンス',
      exitBarrier: '離脱障壁',
      followers: '信徒数',
      close: '閉じる'
    },
    event: {
      religious_scandal: '宗教スキャンダル',
      digital_revival: 'デジタル復興',
      political_persecution: '政治的迫害',
      migration_wave: '移民の波',
      economic_crisis: '経済危機',
      youth_awakening: '若者の覚醒',
      polarization_spike: '分極化の急増',
      pluralism_wave: '多元主義の波',
      climate_anxiety: '気候不安',
      institutional_reform: '制度改革',
      global_crisis: 'グローバル危機'
    },
    status: {
      notStarted: '状態：未開始',
      initializing: '状態：初期化中...',
      running:
        '状態：実行中（ラウンド {round}） | 信徒総数 {total} / {target}（{invariant}） | エンジン：{engine} | AI：{ai} | プロバイダ：{provider}',
      pausedRound: '状態：一時停止（ラウンド {round}）',
      paused: '状態：一時停止',
      dataCleared: '状態：保存済みランデータを消去しました',
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
    provider: {
      openai: 'OpenAI',
      moonshot: 'Moonshot / Kimi'
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
      speed: '速度',
      factors: '主要因子'
    },
    insight: {
      scenario: 'シナリオ',
      totalFlow: '総転化フロー量',
      judgmentRatio: '審判遮断率',
      conversionEfficiency: '純転化効率',
      regionalVolatility: '地域ボラティリティ',
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
      migration: '人口移動',
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
      judgment: '宗教審判ログ',
      deck: '戦略デッキ',
      empty: '現在のフィルターにログがありません'
    },
    logFilter: {
      all: 'すべて',
      mission: '布教',
      judgment: '審判'
    },
    scenario: {
      balanced: 'バランス',
      high_regulation: '高規制',
      high_secularization: '高世俗化',
      high_polarization: '高分極化'
    },
    religionNames: {
      buddhism: '仏教',
      hinduism: 'ヒンドゥー教',
      taoism: '道教',
      shinto: '神道',
      islam: 'イスラム教',
      protestant: 'キリスト教（プロテスタント）',
      pastafarianism: '空飛ぶスパゲッティ・モンスター教',
      catholicism: 'カトリック',
      secular: '無宗教・世俗主義'
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
