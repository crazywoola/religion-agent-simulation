export const GAME_LAB_TAB_LIBRARY = [
  {
    id: 'mission',
    label: {
      en: 'Mission',
      'zh-CN': '任务',
      ja: '任務'
    }
  },
  {
    id: 'strategy',
    label: {
      en: 'Strategy',
      'zh-CN': '策略',
      ja: '戦略'
    }
  },
  {
    id: 'meta',
    label: {
      en: 'Meta',
      'zh-CN': '成长',
      ja: '成長'
    }
  }
];

export const BET_OPTION_LIBRARY = [
  {
    id: 'dominant_hold',
    short: { en: 'Hold', 'zh-CN': '守擂', ja: '防衛' },
    label: {
      en: 'Dominant religion keeps lead',
      'zh-CN': '主导宗教保持领先',
      ja: '優勢宗教が首位維持'
    },
    description: {
      en: 'Win if the current top religion remains on top after 3 rounds.',
      'zh-CN': '若当前第一宗教在 3 回合后仍第一则获胜。',
      ja: '現在の首位宗教が 3 ラウンド後も首位なら勝利。'
    }
  },
  {
    id: 'fragmentation_drop',
    short: { en: 'Drop', 'zh-CN': '降噪', ja: '低下' },
    label: {
      en: 'Fragmentation drops',
      'zh-CN': '碎片化下降',
      ja: '分断率が低下'
    },
    description: {
      en: 'Win if social fragmentation is lower than the baseline after 3 rounds.',
      'zh-CN': '若 3 回合后社会碎片化低于下注基线则获胜。',
      ja: '3 ラウンド後に社会分断がベースラインより低ければ勝利。'
    }
  },
  {
    id: 'lines_growth',
    short: { en: 'Grow', 'zh-CN': '扩链', ja: '増線' },
    label: {
      en: 'Active lines increase',
      'zh-CN': '活跃链路增长',
      ja: 'アクティブ線が増加'
    },
    description: {
      en: 'Win if active corridors increase by at least 2 after 3 rounds.',
      'zh-CN': '若 3 回合后活跃链路至少增加 2 条则获胜。',
      ja: '3 ラウンド後にアクティブ線が 2 本以上増えれば勝利。'
    }
  }
];

export const DECK_CARD_LIBRARY = [
  {
    id: 'bridge_dialogue',
    title: { en: 'Bridge Dialogue', 'zh-CN': '跨域对话', ja: '越境対話' },
    desc: {
      en: '+Pluralism, -Polarization',
      'zh-CN': '+法律多元，-舆论极化',
      ja: '法的多元 + / 分極化 -'
    },
    detail: {
      en: 'Host cross-faith dialogue assemblies and reduce narrative hostility in contested regions.',
      'zh-CN': '在争议区域组织跨信仰协商，降低叙事对抗强度。',
      ja: '競合地域で宗教横断の対話会を行い、敵対的ナラティブを抑制。'
    },
    archetype: {
      en: 'Civic Diplomacy',
      'zh-CN': '公共外交',
      ja: '公共外交'
    },
    rarity: {
      en: 'Strategic',
      'zh-CN': '战略',
      ja: '戦略'
    },
    timing: {
      en: 'Immediate',
      'zh-CN': '即时生效',
      ja: '即時発動'
    },
    tip: {
      en: 'Great against polarization bursts and tribunal pressure.',
      'zh-CN': '适合应对极化激增与审判压力。',
      ja: '分極化急騰や審判圧力への対抗に有効。'
    },
    cost: 4,
    deltas: { legalPluralism: 0.06, mediaPolarization: -0.05 }
  },
  {
    id: 'trust_grant',
    title: { en: 'Trust Grant', 'zh-CN': '信任补助', ja: '信頼助成' },
    desc: {
      en: '+Trust, -Fragmentation',
      'zh-CN': '+制度信任，-社会碎片化',
      ja: '制度信頼 + / 社会分断 -'
    },
    detail: {
      en: 'Inject institutional transparency initiatives and stabilize trust-sensitive communities.',
      'zh-CN': '注入制度透明项目，稳定对信任敏感的人群。',
      ja: '制度透明化施策を注入し、信頼に敏感な層を安定化。'
    },
    archetype: {
      en: 'Governance Support',
      'zh-CN': '治理支援',
      ja: '統治支援'
    },
    rarity: {
      en: 'Anchor',
      'zh-CN': '锚定',
      ja: 'アンカー'
    },
    timing: {
      en: 'Immediate',
      'zh-CN': '即时生效',
      ja: '即時発動'
    },
    tip: {
      en: 'Use before boss checks to reduce failure probability.',
      'zh-CN': '建议在 Boss 阶段判定前使用，降低失败风险。',
      ja: 'Boss 判定前に使うと失敗確率を下げやすい。'
    },
    cost: 5,
    deltas: { institutionalTrust: 0.07, socialFragmentation: -0.04 }
  },
  {
    id: 'youth_festival',
    title: { en: 'Youth Festival', 'zh-CN': '青年节拍', ja: 'ユース祭典' },
    desc: {
      en: '+Youth, +Digital, +Volatility',
      'zh-CN': '+青年压力，+数字化，+波动',
      ja: '若年圧力 + / デジタル化 + / 変動 +'
    },
    detail: {
      en: 'Launch youth-facing campaigns and online events to accelerate participation velocity.',
      'zh-CN': '发起面向青年的线上活动，加速参与扩散速度。',
      ja: '若年層向けキャンペーンを展開し、参加拡散速度を引き上げる。'
    },
    archetype: {
      en: 'Audience Expansion',
      'zh-CN': '受众扩张',
      ja: 'オーディエンス拡張'
    },
    rarity: {
      en: 'Aggressive',
      'zh-CN': '激进',
      ja: 'アグレッシブ'
    },
    timing: {
      en: 'Immediate',
      'zh-CN': '即时生效',
      ja: '即時発動'
    },
    tip: {
      en: 'High upside for combo rounds, but can increase social noise.',
      'zh-CN': '在连击回合收益很高，但可能放大社会噪声。',
      ja: 'コンボ回で高期待値だが、社会ノイズも増えやすい。'
    },
    cost: 4,
    deltas: { youthPressure: 0.06, digitalization: 0.05, socialFragmentation: 0.02 }
  },
  {
    id: 'ethics_audit',
    title: { en: 'Ethics Audit', 'zh-CN': '伦理审计', ja: '倫理監査' },
    desc: {
      en: '-Judgment pressure, +Due space',
      'zh-CN': '-审判压力，+公共空间',
      ja: '審判圧力 - / 公共空間 +'
    },
    detail: {
      en: 'Run accountability audits to cool coercive enforcement and recover procedural legitimacy.',
      'zh-CN': '推进问责审计，降低强制执法温度并恢复程序合法性。',
      ja: '説明責任監査を行い、強制的執行を抑えて手続的正統性を回復。'
    },
    archetype: {
      en: 'Institutional Reset',
      'zh-CN': '制度重置',
      ja: '制度リセット'
    },
    rarity: {
      en: 'Control',
      'zh-CN': '控制',
      ja: 'コントロール'
    },
    timing: {
      en: 'Immediate',
      'zh-CN': '即时生效',
      ja: '即時発動'
    },
    tip: {
      en: 'Best when legal pluralism is low and regulation is overheating.',
      'zh-CN': '适合法律多元偏低、监管过热时使用。',
      ja: '法的多元性が低く、規制過熱時に最適。'
    },
    cost: 6,
    deltas: { stateRegulation: -0.04, legalPluralism: 0.04, mediaPolarization: -0.02 }
  },
  {
    id: 'migration_corridor',
    title: { en: 'Migration Corridor', 'zh-CN': '迁徙走廊', ja: '移動コリドー' },
    desc: {
      en: '+Mobility, +Integration',
      'zh-CN': '+人口迁移，+社会融合',
      ja: '人口移動 + / 社会統合 +'
    },
    detail: {
      en: 'Open regulated mobility channels to improve integration and lower conflict friction.',
      'zh-CN': '开放可监管迁移通道，提升融合并降低冲突摩擦。',
      ja: '管理可能な移動回廊を開き、統合を高めつつ衝突摩擦を軽減。'
    },
    archetype: {
      en: 'Mobility Policy',
      'zh-CN': '迁移政策',
      ja: '移動政策'
    },
    rarity: {
      en: 'Adaptive',
      'zh-CN': '适配',
      ja: '適応'
    },
    timing: {
      en: 'Immediate',
      'zh-CN': '即时生效',
      ja: '即時発動'
    },
    tip: {
      en: 'Pairs well with trust cards when identity pressure is rising.',
      'zh-CN': '身份压力升高时，可与信任类卡联动。',
      ja: 'アイデンティティ圧力上昇時は信頼系カードとの併用が有効。'
    },
    cost: 5,
    deltas: { migration: 0.06, socialFragmentation: -0.03, legalPluralism: 0.03 }
  },
  {
    id: 'calm_media',
    title: { en: 'Calm Media', 'zh-CN': '媒体冷却', ja: 'メディア冷却' },
    desc: {
      en: '-Polarization, -Identity heat',
      'zh-CN': '-舆论极化，-身份冲突',
      ja: '分極化 - / アイデンティティ対立 -'
    },
    detail: {
      en: 'Deploy fact-check and moderation bundles to cool amplification loops in media spaces.',
      'zh-CN': '部署核验与节流组合，降低媒体放大回路的过热。',
      ja: 'ファクトチェックと節流施策で、メディア増幅ループを冷却。'
    },
    archetype: {
      en: 'Narrative Cooling',
      'zh-CN': '叙事降温',
      ja: 'ナラティブ冷却'
    },
    rarity: {
      en: 'Stability',
      'zh-CN': '稳态',
      ja: '安定'
    },
    timing: {
      en: 'Immediate',
      'zh-CN': '即时生效',
      ja: '即時発動'
    },
    tip: {
      en: 'Use in crisis windows to suppress spillover cascades.',
      'zh-CN': '在危机窗口使用，可抑制外溢级联。',
      ja: '危機ウィンドウで使うと外溢れ連鎖の抑制に有効。'
    },
    cost: 4,
    deltas: { mediaPolarization: -0.06, identityPolitics: -0.04 }
  }
];

export const SECRET_AGENDA_LIBRARY = [
  {
    id: 'combo_director',
    label: { en: 'Combo Director', 'zh-CN': '连锁导演', ja: 'コンボ演出家' },
    description: {
      en: 'Reach Combo streak 4+ once before round 14.',
      'zh-CN': '第 14 轮前至少触发一次 4 连击。',
      ja: 'ラウンド14までにコンボ4以上を1回達成。'
    },
    reward: 8
  },
  {
    id: 'quiet_court',
    label: { en: 'Quiet Court', 'zh-CN': '静默法庭', ja: '静かな法廷' },
    description: {
      en: 'Keep judgment ratio under 30% at round 10+.',
      'zh-CN': '第 10 轮后保持审判比低于 30%。',
      ja: 'ラウンド10以降で審判比率30%未満を維持。'
    },
    reward: 10
  },
  {
    id: 'ghost_slayer',
    label: { en: 'Ghost Slayer', 'zh-CN': '影子猎手', ja: 'ゴースト撃破' },
    description: {
      en: 'Lead the ghost comparison by +800 at round 12+.',
      'zh-CN': '第 12 轮后 Ghost 对照领先 +800。',
      ja: 'ラウンド12以降でゴースト比 +800 を達成。'
    },
    reward: 9
  }
];

export const OBJECTIVE_LIBRARY = [
  {
    id: 'round_advance',
    label: { en: 'Reach round 12', 'zh-CN': '到达第 12 轮', ja: 'ラウンド12到達' }
  },
  {
    id: 'stability_window',
    label: {
      en: 'Keep fragmentation below 78%',
      'zh-CN': '社会碎片化低于 78%',
      ja: '社会分断を 78% 未満に維持'
    }
  },
  {
    id: 'region_chain',
    label: {
      en: 'Build a region chain of 3+',
      'zh-CN': '形成 3 连区域控制链',
      ja: '地域連鎖 3 以上'
    }
  }
];

export const ACHIEVEMENT_LIBRARY = [
  { id: 'combo_king', label: { en: 'Combo King', 'zh-CN': '连击之王', ja: 'コンボ王' } },
  { id: 'raid_stable', label: { en: 'Raid Stabilizer', 'zh-CN': '危机稳态者', ja: '危機安定者' } },
  { id: 'oracle', label: { en: 'Bet Oracle', 'zh-CN': '预判先知', ja: '予測の賢者' } },
  { id: 'deck_scholar', label: { en: 'Deck Scholar', 'zh-CN': '卡组学者', ja: 'デッキ学者' } },
  { id: 'iron_legend', label: { en: 'Iron Legend', 'zh-CN': '铁人传说', ja: '鉄人伝説' } }
];
