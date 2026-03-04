export const DEFAULT_SCENARIO = 'balanced';

export const SIMULATION_SCENARIOS = {
  balanced: {
    id: 'balanced',
    label: { en: 'Balanced', 'zh-CN': '平衡场景', ja: 'バランス' },
    description: {
      en: 'No signal bias. All social factors start near global baseline, letting emergent dynamics shape the run.',
      'zh-CN': '无信号偏置。所有社会因子从全球基线附近开始，让涌现动态塑造对局走向。',
      ja: 'シグナル偏りなし。全因子がグローバル基準値付近から開始し、創発ダイナミクスで展開。'
    },
    difficulty: 'normal',
    signalOverrides: {}
  },
  high_regulation: {
    id: 'high_regulation',
    label: { en: 'High Regulation', 'zh-CN': '高监管场景', ja: '高規制' },
    description: {
      en: 'State regulation is elevated and legal pluralism suppressed. Religions with high institutional capacity thrive; fragile groups face churn.',
      'zh-CN': '国家监管提升，法律多元压缩。制度能力强的宗教占优；脆弱群体面临流失。',
      ja: '国家規制が強化され法的多元性が抑制。制度力の高い宗教が有利、脆弱なグループは離脱増。'
    },
    difficulty: 'hard',
    signalOverrides: {
      stateRegulation: 0.16,
      legalPluralism: -0.14,
      mediaPolarization: 0.08,
      socialFragmentation: 0.06
    }
  },
  high_secularization: {
    id: 'high_secularization',
    label: { en: 'High Secularization', 'zh-CN': '高世俗化场景', ja: '高世俗化' },
    description: {
      en: 'Secularization accelerates while meaning search declines. Secular gains a natural advantage; traditional religions must compete harder.',
      'zh-CN': '世俗化加速，意义追寻衰退。世俗主义获得天然优势；传统宗教需加倍竞争。',
      ja: '世俗化が加速し意味追求が後退。世俗に自然な優位が生じ、伝統宗教は競争を強いられる。'
    },
    difficulty: 'hard',
    signalOverrides: {
      secularization: 0.2,
      meaningSearch: -0.1,
      legalPluralism: 0.06,
      stateRegulation: -0.04
    }
  },
  high_polarization: {
    id: 'high_polarization',
    label: { en: 'High Polarization', 'zh-CN': '高极化场景', ja: '高分極化' },
    description: {
      en: 'Media polarization and identity politics are high. Transfer volatility increases and judgment pressure escalates across factions.',
      'zh-CN': '舆论极化与身份政治走高。转化波动加大，审判压力在各派系间升级。',
      ja: 'メディア分極化とアイデンティティ政治が高い。転化の変動が増し、審判圧力が各勢力に波及。'
    },
    difficulty: 'expert',
    signalOverrides: {
      mediaPolarization: 0.18,
      identityPolitics: 0.12,
      socialFragmentation: 0.1,
      legalPluralism: -0.06
    }
  }
};

export const SIMULATION_CONFIG = {
  version: '2026.03.04',
  scenarioBlendRate: 0.16,
  explainability: {
    topFactors: 3
  },
  // exitBarrier: coefficient affecting churn rate in computeAgentOutBudget
  exitBarrierWeight: 0.68,
  // secularBuff: extra attractiveness multiplier for secularism when secularization signal is high
  secularBuff: 1.55,
  // Random event system
  events: {
    enabled: true,
    checkEveryNRounds: 3,      // check every N rounds
    maxPerCheck: 2,            // max events triggered per check
    decayPerRound: 0.18,       // signal shock decay rate per round
    pool: [
      {
        id: 'religious_scandal',
        category: 'institutional',
        prob: 0.13,
        shock: { institutionalTrust: -0.13, secularization: 0.09, mediaPolarization: 0.07 },
        duration: 4,
        flavor: { en: 'Internal misconduct surfaces, eroding public trust in religious authority.', 'zh-CN': '内部丑闻浮出水面，侵蚀公众对宗教权威的信任。', ja: '内部不正が表面化し、宗教権威への信頼を揺るがす。' }
      },
      {
        id: 'digital_revival',
        category: 'technology',
        prob: 0.11,
        shock: { digitalization: 0.11, meaningSearch: 0.07, youthPressure: 0.06 },
        duration: 3,
        flavor: { en: 'New platforms amplify faith content; digital missionaries reach unprecedented audiences.', 'zh-CN': '新平台放大信仰内容传播；数字布道者触及前所未有的受众。', ja: '新プラットフォームが信仰コンテンツを増幅、デジタル伝道が前例のない規模に。' }
      },
      {
        id: 'political_persecution',
        category: 'political',
        prob: 0.09,
        shock: { stateRegulation: 0.16, legalPluralism: -0.12, identityPolitics: 0.08 },
        duration: 5,
        flavor: { en: 'A government crackdown targets minority faiths, tightening regulation and suppressing pluralism.', 'zh-CN': '政府打压少数信仰群体，收紧监管并压缩多元空间。', ja: '政府が少数派信仰を弾圧、規制強化と多元性の抑圧が進行。' }
      },
      {
        id: 'migration_wave',
        category: 'demographic',
        prob: 0.14,
        shock: { migration: 0.18, socialFragmentation: 0.09, economicStress: 0.06 },
        duration: 4,
        flavor: { en: 'Large-scale population movement reshapes regional demographics and religious composition.', 'zh-CN': '大规模人口流动重塑区域人口结构与宗教构成。', ja: '大規模な人口移動が地域の人口構成と宗教地図を書き換える。' }
      },
      {
        id: 'economic_crisis',
        category: 'economic',
        prob: 0.10,
        shock: { economicStress: 0.20, meaningSearch: 0.12, institutionalTrust: -0.08 },
        duration: 6,
        flavor: { en: 'Financial collapse drives communities toward faith-based mutual aid and existential reflection.', 'zh-CN': '金融崩溃促使社区转向信仰互助和存在反思。', ja: '金融崩壊がコミュニティを信仰ベースの相互扶助と実存的内省へ駆り立てる。' }
      },
      {
        id: 'youth_awakening',
        category: 'demographic',
        prob: 0.10,
        shock: { youthPressure: 0.14, meaningSearch: 0.09, digitalization: 0.05 },
        duration: 3,
        flavor: { en: 'A generation questions inherited traditions and forges new spiritual paths online.', 'zh-CN': '新一代质疑传承传统，在线上开辟新的精神道路。', ja: '新世代が受け継いだ伝統を問い直し、オンラインで新たな精神の道を模索。' }
      },
      {
        id: 'polarization_spike',
        category: 'media',
        prob: 0.12,
        shock: { mediaPolarization: 0.17, identityPolitics: 0.12, legalPluralism: -0.07 },
        duration: 5,
        flavor: { en: 'Viral conflict narratives deepen factional divides and harden identity boundaries.', 'zh-CN': '病毒式冲突叙事加深派系分裂，强化身份边界。', ja: 'バイラルな対立ナラティブが派閥間の溝を深め、アイデンティティ境界を硬化。' }
      },
      {
        id: 'pluralism_wave',
        category: 'political',
        prob: 0.08,
        shock: { legalPluralism: 0.14, secularization: 0.07, stateRegulation: -0.06 },
        duration: 4,
        flavor: { en: 'Courts and legislatures expand protections for religious diversity and minority rights.', 'zh-CN': '法院和立法机构扩大对宗教多样性和少数权利的保护。', ja: '裁判所・立法機関が宗教的多様性と少数派の権利保護を拡大。' }
      },
      {
        id: 'climate_anxiety',
        category: 'existential',
        prob: 0.09,
        shock: { meaningSearch: 0.15, youthPressure: 0.10, socialFragmentation: 0.07 },
        duration: 4,
        flavor: { en: 'Climate despair drives mass spiritual seeking and intergenerational tension about values.', 'zh-CN': '气候绝望驱动大规模精神追寻和代际价值观冲突。', ja: '気候不安が大規模なスピリチュアル探求と世代間の価値観対立を駆動。' }
      },
      {
        id: 'institutional_reform',
        category: 'institutional',
        prob: 0.07,
        shock: { institutionalTrust: 0.14, stateRegulation: -0.08, legalPluralism: 0.09 },
        duration: 5,
        flavor: { en: 'Governance reforms restore trust and create space for pluralistic participation.', 'zh-CN': '治理改革恢复信任并为多元参与创造空间。', ja: 'ガバナンス改革が信頼を回復し、多元的参加の余地を創出。' }
      },
      {
        id: 'ai_doctrine_leak',
        category: 'technology',
        prob: 0.08,
        shock: { mediaPolarization: 0.09, digitalization: 0.08, institutionalTrust: -0.07 },
        duration: 4,
        flavor: { en: 'AI-generated doctrinal content leaks, blurring the line between authentic teaching and machine synthesis.', 'zh-CN': 'AI 生成的教义内容泄露，模糊了真实教导与机器合成的界限。', ja: 'AI生成の教義コンテンツが流出、本物の教えと機械的合成の境界が曖昧に。' }
      },
      {
        id: 'grassroots_relief_network',
        category: 'social',
        prob: 0.07,
        shock: { institutionalTrust: 0.1, economicStress: -0.07, socialFragmentation: -0.06 },
        duration: 4,
        flavor: { en: 'Faith-based relief networks mobilize rapidly, earning community trust through direct action.', 'zh-CN': '信仰互助网络快速动员，通过直接行动赢得社区信任。', ja: '信仰ベースの支援ネットワークが迅速に動員、直接行動でコミュニティの信頼を獲得。' }
      },
      {
        id: 'interfaith_education_reform',
        category: 'institutional',
        prob: 0.06,
        shock: { legalPluralism: 0.11, youthPressure: -0.04, meaningSearch: 0.06 },
        duration: 5,
        flavor: { en: 'Schools adopt interfaith literacy programs, fostering understanding but challenging traditional monopolies.', 'zh-CN': '学校引入跨信仰素养课程，促进理解但挑战传统垄断。', ja: '学校が宗教間リテラシー教育を導入、理解を促すが伝統的独占に挑戦。' }
      },
      {
        id: 'algorithmic_echo_burst',
        category: 'technology',
        prob: 0.08,
        shock: { digitalization: 0.09, mediaPolarization: 0.1, identityPolitics: 0.06 },
        duration: 3,
        flavor: { en: 'Recommendation algorithms amplify extreme religious content, creating self-reinforcing echo chambers.', 'zh-CN': '推荐算法放大极端宗教内容，形成自我强化的回音室。', ja: 'レコメンドアルゴリズムが極端な宗教コンテンツを増幅、自己強化型エコーチェンバーを形成。' }
      }
    ]
  },
  transfer: {
    churn: {
      base: 0.0016,
      lowRetention: 0.015,
      openness: 0.009,
      mismatch: 0.011,
      socialFragmentation: 0.004,
      migration: 0.004,
      stateRegulation: -0.0035,
      legalPluralism: 0.0024,
      mediaPolarization: 0.003,
      secularization: 0.0035,
      defensiveFocus: -0.0048,
      fatigue: 0.002
    }
  },
  judgment: {
    regime: {
      antiPluralism: 0.34,
      stateRegulation: 0.32,
      identityPolitics: 0.2,
      mediaPolarization: 0.14
    },
    enforcement: {
      tribunalCapacity: 0.42,
      institutionCapacity: 0.32,
      orthodoxy: 0.26
    },
    missionaryPush: {
      zeal: 0.35,
      persuasion: 0.31,
      digitalMission: 0.15,
      digitalization: 0.1,
      migration: 0.09
    },
    rate: {
      base: 0.3,
      antiProselytization: 0.42,
      orthodoxy: 0.24,
      pushBase: 0.7,
      pushFactor: 0.46,
      dueProcessBrake: 0.42,
      randomMin: 0.86,
      randomMax: 1.08,
      maxRate: 0.8,
      maxBlockShare: 0.82
    }
  }
};
