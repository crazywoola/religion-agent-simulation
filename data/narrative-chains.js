export const NARRATIVE_CHAIN_LIBRARY = {
  religious_scandal: {
    delay: 2,
    title: { en: 'Aftershock Hearing', 'zh-CN': '余震听证', ja: '余震ヒアリング' },
    options: [
      {
        id: 'community_council',
        label: { en: 'Community Council', 'zh-CN': '社区议会', ja: 'コミュニティ評議会' },
        desc: {
          en: 'Open plural dialogues to reduce long-tail trust erosion.',
          'zh-CN': '开放多元对话，降低长期信任流失。',
          ja: '多元対話を開き、長期的な信頼低下を抑制。'
        },
        deltas: { legalPluralism: 0.05, institutionalTrust: 0.04, mediaPolarization: -0.03 }
      },
      {
        id: 'strict_compliance',
        label: { en: 'Strict Compliance', 'zh-CN': '刚性合规', ja: '厳格コンプライアンス' },
        desc: {
          en: 'Fast stabilization with stronger regulation costs.',
          'zh-CN': '快速止损，但监管成本上升。',
          ja: '即時安定化するが規制コスト増。'
        },
        deltas: { stateRegulation: 0.06, institutionalTrust: 0.02, legalPluralism: -0.04 }
      }
    ]
  },
  migration_wave: {
    delay: 1,
    title: { en: 'Corridor Referendum', 'zh-CN': '走廊公投', ja: '回廊レファレンダム' },
    options: [
      {
        id: 'open_corridors',
        label: { en: 'Open Corridors', 'zh-CN': '开放走廊', ja: '回廊開放' },
        desc: {
          en: 'Improve integration and digital collaboration.',
          'zh-CN': '提升融合与数字协作。',
          ja: '統合とデジタル協働を強化。'
        },
        deltas: { migration: 0.05, legalPluralism: 0.04, socialFragmentation: -0.04 }
      },
      {
        id: 'quota_lock',
        label: { en: 'Quota Lock', 'zh-CN': '配额锁定', ja: '枠固定' },
        desc: {
          en: 'Reduce migration volatility but increase identity tensions.',
          'zh-CN': '降低迁移波动，但提高身份紧张。',
          ja: '移動変動は抑えるが、アイデンティティ対立が増加。'
        },
        deltas: { migration: -0.06, identityPolitics: 0.05, stateRegulation: 0.03 }
      }
    ]
  },
  digital_revival: {
    delay: 2,
    title: { en: 'Platform Governance Summit', 'zh-CN': '平台治理峰会', ja: 'プラットフォーム統治サミット' },
    options: [
      {
        id: 'decentralized_moderation',
        label: { en: 'Decentralized Moderation', 'zh-CN': '去中心化审核', ja: '分散型モデレーション' },
        desc: {
          en: 'Empower community-driven content review, boosting pluralism with fragmentation risk.',
          'zh-CN': '赋权社区驱动的内容审核，增强多元性但存在碎片化风险。',
          ja: 'コミュニティ主導のレビューを推進し、多元性を強化するが断片化リスクあり。'
        },
        deltas: { legalPluralism: 0.05, digitalization: 0.04, socialFragmentation: 0.03 }
      },
      {
        id: 'centralized_oversight',
        label: { en: 'Centralized Oversight', 'zh-CN': '集中监管', ja: '集中監督' },
        desc: {
          en: 'Institutional control over digital discourse reduces noise but increases regulation.',
          'zh-CN': '机构化管控数字话语降低噪声但增加监管。',
          ja: 'デジタル言説の制度的管理によりノイズは減るが規制が増す。'
        },
        deltas: { stateRegulation: 0.05, mediaPolarization: -0.04, digitalization: -0.02 }
      }
    ]
  },
  political_persecution: {
    delay: 3,
    title: { en: 'Amnesty Tribunal', 'zh-CN': '特赦法庭', ja: '恩赦法廷' },
    options: [
      {
        id: 'international_advocacy',
        label: { en: 'International Advocacy', 'zh-CN': '国际声援', ja: '国際アドボカシー' },
        desc: {
          en: 'Leverage external pressure to push reform, but risk sovereignty backlash.',
          'zh-CN': '利用外部压力推动改革，但可能引发主权反弹。',
          ja: '外圧を利用して改革を促すが、主権反発のリスクがある。'
        },
        deltas: { legalPluralism: 0.06, stateRegulation: -0.03, identityPolitics: 0.04 }
      },
      {
        id: 'internal_resilience',
        label: { en: 'Internal Resilience', 'zh-CN': '内部韧性', ja: '内部レジリエンス' },
        desc: {
          en: 'Strengthen underground networks and community bonds under pressure.',
          'zh-CN': '在压力下强化地下网络与社区纽带。',
          ja: '圧力下で地下ネットワークとコミュニティの絆を強化。'
        },
        deltas: { institutionalTrust: 0.04, identityPolitics: -0.03, socialFragmentation: -0.03 }
      }
    ]
  },
  economic_crisis: {
    delay: 2,
    title: { en: 'Recovery Framework', 'zh-CN': '复苏框架', ja: '復興フレームワーク' },
    options: [
      {
        id: 'solidarity_fund',
        label: { en: 'Solidarity Fund', 'zh-CN': '团结基金', ja: '連帯基金' },
        desc: {
          en: 'Community mutual aid networks reduce economic stress but slow institutional reform.',
          'zh-CN': '社区互助网络降低经济压力但减缓制度改革。',
          ja: 'コミュニティ互助が経済ストレスを緩和するが制度改革は鈍化。'
        },
        deltas: { economicStress: -0.06, socialFragmentation: -0.03, stateRegulation: 0.02 }
      },
      {
        id: 'austerity_protocol',
        label: { en: 'Austerity Protocol', 'zh-CN': '紧缩方案', ja: '緊縮プロトコル' },
        desc: {
          en: 'Institutional restructuring stabilizes long-term but increases short-term pressure.',
          'zh-CN': '制度重组实现长期稳定但加大短期压力。',
          ja: '制度再構築で長期安定を図るが短期圧力が増大。'
        },
        deltas: { institutionalTrust: 0.05, economicStress: 0.03, youthPressure: 0.03 }
      }
    ]
  },
  youth_awakening: {
    delay: 1,
    title: { en: 'Youth Congress', 'zh-CN': '青年大会', ja: 'ユース会議' },
    options: [
      {
        id: 'youth_council',
        label: { en: 'Youth Council', 'zh-CN': '青年理事会', ja: 'ユース評議会' },
        desc: {
          en: 'Institutionalize youth voice in governance, channeling energy into reform.',
          'zh-CN': '将青年声音制度化，将能量引导至改革。',
          ja: '若者の声をガバナンスに制度化し、エネルギーを改革へ導く。'
        },
        deltas: { youthPressure: -0.04, institutionalTrust: 0.04, digitalization: 0.03 }
      },
      {
        id: 'mentorship_networks',
        label: { en: 'Mentorship Networks', 'zh-CN': '导师网络', ja: 'メンターネットワーク' },
        desc: {
          en: 'Channel youth through traditional mentorship, preserving continuity but limiting innovation.',
          'zh-CN': '通过传统导师制引导青年，保持连续性但限制创新。',
          ja: '伝統的なメンター制度で若者を導き、継続性を保つが革新は制約。'
        },
        deltas: { meaningSearch: 0.04, youthPressure: -0.03, socialFragmentation: -0.03 }
      }
    ]
  },
  polarization_spike: {
    delay: 2,
    title: { en: 'De-escalation Summit', 'zh-CN': '降温峰会', ja: '沈静化サミット' },
    options: [
      {
        id: 'media_literacy_drive',
        label: { en: 'Media Literacy Drive', 'zh-CN': '媒体素养运动', ja: 'メディアリテラシー推進' },
        desc: {
          en: 'Education-based approach to reduce polarization, slow but lasting.',
          'zh-CN': '以教育手段降低极化，见效慢但持久。',
          ja: '教育ベースで分極化を抑制、遅いが持続的。'
        },
        deltas: { mediaPolarization: -0.05, youthPressure: -0.02, meaningSearch: 0.03 }
      },
      {
        id: 'narrative_ceasefire',
        label: { en: 'Narrative Ceasefire', 'zh-CN': '叙事停火', ja: 'ナラティブ停戦' },
        desc: {
          en: 'Mutual restraint agreement cools immediate tension but reduces discourse freedom.',
          'zh-CN': '互相克制协议迅速降温，但限制话语自由。',
          ja: '相互抑制合意で即座に沈静化するが、言論の自由は制約。'
        },
        deltas: { mediaPolarization: -0.06, legalPluralism: -0.03, stateRegulation: 0.03 }
      }
    ]
  },
  pluralism_wave: {
    delay: 2,
    title: { en: 'Coexistence Charter', 'zh-CN': '共存宪章', ja: '共存憲章' },
    options: [
      {
        id: 'mutual_recognition_pact',
        label: { en: 'Mutual Recognition Pact', 'zh-CN': '互认协约', ja: '相互承認協定' },
        desc: {
          en: 'Formalize pluralistic protections, strengthening legal frameworks.',
          'zh-CN': '正式化多元保护机制，强化法律框架。',
          ja: '多元的保護を公式化し、法的枠組みを強化。'
        },
        deltas: { legalPluralism: 0.05, institutionalTrust: 0.04, identityPolitics: -0.03 }
      },
      {
        id: 'cultural_preservation',
        label: { en: 'Cultural Preservation', 'zh-CN': '文化存续', ja: '文化保全' },
        desc: {
          en: 'Protect traditions within pluralism, reducing secularization pressure.',
          'zh-CN': '在多元框架中保护传统，降低世俗化压力。',
          ja: '多元主義の中で伝統を守り、世俗化圧力を軽減。'
        },
        deltas: { secularization: -0.04, meaningSearch: 0.04, socialFragmentation: -0.02 }
      }
    ]
  },
  climate_anxiety: {
    delay: 1,
    title: { en: 'Eco-Faith Assembly', 'zh-CN': '生态信仰大会', ja: 'エコ・フェイス集会' },
    options: [
      {
        id: 'green_covenant',
        label: { en: 'Green Covenant', 'zh-CN': '绿色盟约', ja: 'グリーン・コヴェナント' },
        desc: {
          en: 'Interfaith environmental action builds bridges but increases youth activism.',
          'zh-CN': '跨信仰环保行动搭建桥梁但增加青年行动主义。',
          ja: '宗教横断の環境行動が橋を架けるが、若者の活動主義が増す。'
        },
        deltas: { socialFragmentation: -0.04, institutionalTrust: 0.03, youthPressure: 0.03 }
      },
      {
        id: 'spiritual_resilience',
        label: { en: 'Spiritual Resilience', 'zh-CN': '精神韧性', ja: 'スピリチュアル・レジリエンス' },
        desc: {
          en: 'Focus on meaning-making over activism, calming anxiety but slowing mobilization.',
          'zh-CN': '聚焦意义建构而非行动主义，缓解焦虑但减缓动员。',
          ja: '行動主義より意味形成に注力し、不安を和らげるが動員は鈍化。'
        },
        deltas: { meaningSearch: 0.05, youthPressure: -0.04, economicStress: -0.02 }
      }
    ]
  },
  institutional_reform: {
    delay: 3,
    title: { en: 'Governance Review Board', 'zh-CN': '治理审查委员会', ja: 'ガバナンス審査委員会' },
    options: [
      {
        id: 'transparency_charter',
        label: { en: 'Transparency Charter', 'zh-CN': '透明宪章', ja: '透明性憲章' },
        desc: {
          en: 'Open governance builds trust but exposes vulnerabilities to polarized media.',
          'zh-CN': '开放治理建立信任但暴露弱点给极化媒体。',
          ja: 'オープンガバナンスが信頼を構築するが、分極化メディアに脆弱性を露呈。'
        },
        deltas: { institutionalTrust: 0.06, mediaPolarization: 0.03, stateRegulation: -0.03 }
      },
      {
        id: 'incremental_adjustment',
        label: { en: 'Incremental Adjustment', 'zh-CN': '渐进调整', ja: '漸進的調整' },
        desc: {
          en: 'Conservative reform preserves stability but delays deeper structural change.',
          'zh-CN': '保守改革维持稳定但延迟深层结构变革。',
          ja: '保守的改革が安定を維持するが、構造的変革は遅れる。'
        },
        deltas: { stateRegulation: -0.02, socialFragmentation: -0.03, legalPluralism: 0.02 }
      }
    ]
  },
  ai_doctrine_leak: {
    delay: 2,
    title: { en: 'Digital Ethics Inquiry', 'zh-CN': '数字伦理调查', ja: 'デジタル倫理調査' },
    options: [
      {
        id: 'open_audit',
        label: { en: 'Open Audit', 'zh-CN': '公开审计', ja: 'オープン監査' },
        desc: {
          en: 'Transparent investigation restores trust but temporarily amplifies media attention.',
          'zh-CN': '透明调查恢复信任但暂时放大媒体关注。',
          ja: '透明な調査が信頼を回復するが、一時的にメディアの注目を増幅。'
        },
        deltas: { institutionalTrust: 0.05, mediaPolarization: 0.03, digitalization: -0.02 }
      },
      {
        id: 'containment_protocol',
        label: { en: 'Containment Protocol', 'zh-CN': '控制协议', ja: '封じ込めプロトコル' },
        desc: {
          en: 'Limit exposure to prevent panic but risk eroding long-term digital openness.',
          'zh-CN': '限制曝光以防恐慌但可能侵蚀长期数字开放性。',
          ja: '露出を制限してパニックを防ぐが、長期的なデジタル開放性を損なうリスク。'
        },
        deltas: { mediaPolarization: -0.04, stateRegulation: 0.04, digitalization: -0.03 }
      }
    ]
  },
  grassroots_relief_network: {
    delay: 1,
    title: { en: 'Network Expansion Vote', 'zh-CN': '网络扩展投票', ja: 'ネットワーク拡張投票' },
    options: [
      {
        id: 'scale_up',
        label: { en: 'Scale Up', 'zh-CN': '规模扩张', ja: 'スケールアップ' },
        desc: {
          en: 'Expand relief networks further, increasing reach but stretching resources thin.',
          'zh-CN': '进一步扩大援助网络，增加覆盖面但资源趋紧。',
          ja: '支援ネットワークをさらに拡大し、到達範囲を広げるがリソースは逼迫。'
        },
        deltas: { institutionalTrust: 0.04, economicStress: -0.03, socialFragmentation: 0.02 }
      },
      {
        id: 'consolidate',
        label: { en: 'Consolidate', 'zh-CN': '巩固深化', ja: '統合強化' },
        desc: {
          en: 'Deepen existing roots for lasting impact, sacrificing immediate expansion.',
          'zh-CN': '深化现有根基以获得持久影响，牺牲即时扩张。',
          ja: '既存の基盤を深化させ持続的効果を得るが、即時拡大は犠牲に。'
        },
        deltas: { socialFragmentation: -0.04, meaningSearch: 0.03, migration: -0.02 }
      }
    ]
  },
  interfaith_education_reform: {
    delay: 2,
    title: { en: 'Curriculum Board', 'zh-CN': '课程委员会', ja: 'カリキュラム委員会' },
    options: [
      {
        id: 'inclusive_syllabus',
        label: { en: 'Inclusive Syllabus', 'zh-CN': '包容性课程', ja: 'インクルーシブ・シラバス' },
        desc: {
          en: 'Broad religious literacy fosters understanding but can dilute traditional identity.',
          'zh-CN': '广泛宗教素养促进理解但可能稀释传统身份。',
          ja: '幅広い宗教リテラシーが理解を促すが、伝統的アイデンティティが希薄化する恐れ。'
        },
        deltas: { legalPluralism: 0.05, secularization: 0.03, identityPolitics: -0.03 }
      },
      {
        id: 'heritage_focus',
        label: { en: 'Heritage Focus', 'zh-CN': '传承教育', ja: '伝承重視' },
        desc: {
          en: 'Preserve traditional education to strengthen roots, but limit cross-faith exposure.',
          'zh-CN': '保护传统教育以巩固根基，但限制跨信仰接触。',
          ja: '伝統教育を守り根を強化するが、異宗教間の接触は制限。'
        },
        deltas: { meaningSearch: 0.04, identityPolitics: 0.02, secularization: -0.04 }
      }
    ]
  },
  algorithmic_echo_burst: {
    delay: 1,
    title: { en: 'Algorithm Review Panel', 'zh-CN': '算法审查小组', ja: 'アルゴリズム審査パネル' },
    options: [
      {
        id: 'algorithmic_transparency',
        label: { en: 'Algorithmic Transparency', 'zh-CN': '算法透明', ja: 'アルゴリズム透明性' },
        desc: {
          en: 'Force platform openness to break echo chambers, but slow content velocity.',
          'zh-CN': '强制平台开放以打破回音室，但减缓内容传播速度。',
          ja: 'プラットフォーム開放でエコーチェンバーを壊すが、コンテンツ速度は低下。'
        },
        deltas: { mediaPolarization: -0.05, digitalization: -0.02, legalPluralism: 0.04 }
      },
      {
        id: 'platform_self_regulation',
        label: { en: 'Platform Self-Regulation', 'zh-CN': '平台自律', ja: 'プラットフォーム自主規制' },
        desc: {
          en: 'Industry-led standards maintain speed but enforcement is uneven.',
          'zh-CN': '行业自律标准保持速度但执行不均衡。',
          ja: '業界主導の基準が速度を維持するが、施行にムラがある。'
        },
        deltas: { digitalization: 0.03, identityPolitics: -0.03, stateRegulation: 0.02 }
      }
    ]
  }
};

export const DECISION_OPTION_LIBRARY = {
  religious_scandal: [
    {
      id: 'transparent_reform',
      label: { en: 'Transparent Reform', 'zh-CN': '透明改革', ja: '透明改革' },
      desc: {
        en: 'Raise trust with institutional reforms, but increase short-term polarization.',
        'zh-CN': '以制度改革提升信任，但短期内会加剧极化。',
        ja: '制度改革で信頼を回復するが、短期的には分極化が高まる。'
      },
      deltas: { institutionalTrust: 0.08, mediaPolarization: 0.04, stateRegulation: 0.02 }
    },
    {
      id: 'contain_narrative',
      label: { en: 'Contain Narrative', 'zh-CN': '舆论压制', ja: '言説統制' },
      desc: {
        en: 'Reduce polarization quickly at the cost of legal pluralism.',
        'zh-CN': '快速降低极化，但会损害法律多元。',
        ja: '分極化を即時抑えるが、法的多元性を損なう。'
      },
      deltas: { mediaPolarization: -0.05, legalPluralism: -0.04, stateRegulation: 0.04 }
    }
  ],
  digital_revival: [
    {
      id: 'open_platform',
      label: { en: 'Open Platform', 'zh-CN': '开放平台', ja: 'オープンプラットフォーム' },
      desc: {
        en: 'Boost digital mission and youth engagement, with slight fragmentation risk.',
        'zh-CN': '强化数字传播和青年参与，但有轻微碎片化风险。',
        ja: 'デジタル布教と若年層参加を強化するが、断片化リスクがある。'
      },
      deltas: { digitalization: 0.08, youthPressure: 0.05, socialFragmentation: 0.02 }
    },
    {
      id: 'institutional_filter',
      label: { en: 'Institutional Filter', 'zh-CN': '制度筛选', ja: '制度フィルタ' },
      desc: {
        en: 'Stabilize discourse quality while slowing diffusion speed.',
        'zh-CN': '稳定传播质量，但会减缓扩散速度。',
        ja: '言説品質を安定化するが、拡散速度は低下する。'
      },
      deltas: { institutionalTrust: 0.06, digitalization: -0.03, stateRegulation: 0.03 }
    }
  ],
  migration_wave: [
    {
      id: 'integration_push',
      label: { en: 'Integration Push', 'zh-CN': '融合推动', ja: '統合推進' },
      desc: {
        en: 'Invest in social integration to reduce conflict.',
        'zh-CN': '加大社会融合投入，降低冲突。',
        ja: '社会統合に投資し、対立を緩和する。'
      },
      deltas: { socialFragmentation: -0.06, legalPluralism: 0.05, economicStress: 0.03 }
    },
    {
      id: 'border_hardening',
      label: { en: 'Border Hardening', 'zh-CN': '边界收紧', ja: '境界強化' },
      desc: {
        en: 'Lower migration pressure, but raise regulation and identity conflict.',
        'zh-CN': '缓解迁移压力，但提高监管和身份冲突。',
        ja: '移動圧力は下がるが、規制とアイデンティティ対立が強まる。'
      },
      deltas: { migration: -0.08, stateRegulation: 0.05, identityPolitics: 0.04 }
    }
  ],
  global_crisis: [
    {
      id: 'coordinated_response',
      label: { en: 'Coordinated Response', 'zh-CN': '协同应对', ja: '協調対応' },
      desc: {
        en: 'Cross-region coordination boosts trust and pluralism.',
        'zh-CN': '跨区域协同提升信任与多元。',
        ja: '地域横断の協調で信頼と多元性を強化。'
      },
      deltas: { institutionalTrust: 0.08, legalPluralism: 0.06, socialFragmentation: -0.05 }
    },
    {
      id: 'emergency_control',
      label: { en: 'Emergency Control', 'zh-CN': '紧急管制', ja: '緊急統制' },
      desc: {
        en: 'Rapid short-term stabilization with long-term social cost.',
        'zh-CN': '短期快速稳定，但长期社会代价更高。',
        ja: '短期安定は得られるが、長期の社会コストが増す。'
      },
      deltas: { stateRegulation: 0.08, mediaPolarization: 0.05, legalPluralism: -0.07 }
    }
  ],
  political_persecution: [
    {
      id: 'diaspora_solidarity',
      label: { en: 'Diaspora Solidarity', 'zh-CN': '离散团结', ja: 'ディアスポラ連帯' },
      desc: {
        en: 'Rally international communities to pressure reform; risks sovereignty backlash.',
        'zh-CN': '动员国际社群施压改革；有主权反弹风险。',
        ja: '国際コミュニティを結集し改革を迫るが、主権反発のリスクあり。'
      },
      deltas: { legalPluralism: 0.07, identityPolitics: 0.04, stateRegulation: -0.03 }
    },
    {
      id: 'quiet_endurance',
      label: { en: 'Quiet Endurance', 'zh-CN': '默默承受', ja: '静かな忍耐' },
      desc: {
        en: 'Absorb the shock internally to avoid escalation; slower recovery but less backlash.',
        'zh-CN': '内部消化冲击以避免升级；恢复较慢但反弹较小。',
        ja: 'エスカレート回避のため内部で衝撃を吸収; 回復は遅いが反発は少ない。'
      },
      deltas: { institutionalTrust: 0.04, socialFragmentation: -0.04, stateRegulation: 0.02 }
    }
  ],
  economic_crisis: [
    {
      id: 'faith_based_relief',
      label: { en: 'Faith-Based Relief', 'zh-CN': '信仰互助', ja: '信仰ベースの救済' },
      desc: {
        en: 'Religious networks distribute aid, boosting trust but deepening identity bonds.',
        'zh-CN': '宗教网络分发援助，提升信任但加深身份纽带。',
        ja: '宗教ネットワークが援助を分配し信頼を高めるが、帰属意識も深まる。'
      },
      deltas: { economicStress: -0.07, institutionalTrust: 0.05, identityPolitics: 0.03 }
    },
    {
      id: 'secular_stimulus',
      label: { en: 'Secular Stimulus', 'zh-CN': '世俗刺激', ja: '世俗的景気刺激' },
      desc: {
        en: 'State-led recovery reduces stress but increases secularization and regulation.',
        'zh-CN': '国家主导复苏降低压力但增加世俗化和监管。',
        ja: '国家主導の復興がストレスを緩和するが、世俗化と規制が増す。'
      },
      deltas: { economicStress: -0.08, secularization: 0.05, stateRegulation: 0.04 }
    }
  ],
  youth_awakening: [
    {
      id: 'empower_voices',
      label: { en: 'Empower Voices', 'zh-CN': '赋能发声', ja: '声を力に' },
      desc: {
        en: 'Amplify youth platforms and digital outreach; high energy but volatile.',
        'zh-CN': '放大青年平台与数字传播；活力高但波动大。',
        ja: '若者のプラットフォームとデジタル発信を増幅; 活力は高いが不安定。'
      },
      deltas: { youthPressure: 0.04, digitalization: 0.06, socialFragmentation: 0.03 }
    },
    {
      id: 'structured_mentorship',
      label: { en: 'Structured Mentorship', 'zh-CN': '系统化导师制', ja: '体系的メンター制度' },
      desc: {
        en: 'Channel youth energy through tradition-linked mentorship; stable but slower.',
        'zh-CN': '通过传统导师制引导青年活力；稳定但较慢。',
        ja: '伝統的メンター制度で若者のエネルギーを誘導; 安定だが遅い。'
      },
      deltas: { meaningSearch: 0.06, youthPressure: -0.04, institutionalTrust: 0.03 }
    }
  ],
  polarization_spike: [
    {
      id: 'bridge_initiative',
      label: { en: 'Bridge Initiative', 'zh-CN': '桥梁倡议', ja: 'ブリッジ・イニシアチブ' },
      desc: {
        en: 'Cross-community dialogue reduces polarization but takes time to show results.',
        'zh-CN': '跨社区对话降低极化但需要时间见效。',
        ja: '越境対話で分極化を緩和するが、効果が出るまで時間がかかる。'
      },
      deltas: { mediaPolarization: -0.06, legalPluralism: 0.04, socialFragmentation: -0.02 }
    },
    {
      id: 'information_quarantine',
      label: { en: 'Information Quarantine', 'zh-CN': '信息隔离', ja: '情報隔離' },
      desc: {
        en: 'Suppress inflammatory content rapidly; effective but erodes digital freedom.',
        'zh-CN': '迅速压制煽动性内容；有效但侵蚀数字自由。',
        ja: '扇動的コンテンツを迅速に抑制; 効果的だがデジタル自由を侵食。'
      },
      deltas: { mediaPolarization: -0.08, digitalization: -0.04, stateRegulation: 0.05 }
    }
  ],
  pluralism_wave: [
    {
      id: 'pluralism_charter',
      label: { en: 'Pluralism Charter', 'zh-CN': '多元宪章', ja: '多元主義憲章' },
      desc: {
        en: 'Enshrine pluralistic rights in law; strong protection but can trigger traditionalist resistance.',
        'zh-CN': '将多元权利写入法律；保护力强但可能引发传统主义抵制。',
        ja: '多元的権利を法に明記; 強い保護だが伝統主義者の反発を招く恐れ。'
      },
      deltas: { legalPluralism: 0.07, identityPolitics: 0.04, stateRegulation: 0.02 }
    },
    {
      id: 'organic_coexistence',
      label: { en: 'Organic Coexistence', 'zh-CN': '自然共存', ja: '有機的共存' },
      desc: {
        en: 'Let pluralism develop naturally through community contact; slower but less backlash.',
        'zh-CN': '让多元主义通过社区接触自然发展；较慢但反弹较小。',
        ja: 'コミュニティの接触で多元主義を自然に育む; 遅いが反発は少ない。'
      },
      deltas: { socialFragmentation: -0.04, meaningSearch: 0.03, secularization: 0.02 }
    }
  ],
  climate_anxiety: [
    {
      id: 'interfaith_green_action',
      label: { en: 'Interfaith Green Action', 'zh-CN': '跨信仰绿色行动', ja: '宗教横断グリーンアクション' },
      desc: {
        en: 'Unite faiths around environmental stewardship; builds bridges but increases activism.',
        'zh-CN': '围绕环境守护团结各信仰；搭建桥梁但增加行动主义。',
        ja: '環境保全を軸に信仰を結束; 橋を架けるが活動主義も増す。'
      },
      deltas: { socialFragmentation: -0.05, youthPressure: 0.04, meaningSearch: 0.04 }
    },
    {
      id: 'contemplative_response',
      label: { en: 'Contemplative Response', 'zh-CN': '冥想回应', ja: '瞑想的応答' },
      desc: {
        en: 'Address anxiety through spiritual practice and inner resilience programs.',
        'zh-CN': '通过灵性修行与内在韧性项目应对焦虑。',
        ja: 'スピリチュアルな実践と内面のレジリエンスプログラムで不安に対処。'
      },
      deltas: { meaningSearch: 0.07, economicStress: -0.03, youthPressure: -0.03 }
    }
  ],
  institutional_reform: [
    {
      id: 'radical_overhaul',
      label: { en: 'Radical Overhaul', 'zh-CN': '彻底改革', ja: '抜本的改革' },
      desc: {
        en: 'Deep structural reform rebuilds trust but causes short-term institutional turbulence.',
        'zh-CN': '深层结构改革重建信任但导致短期制度动荡。',
        ja: '深層構造改革で信頼を再構築するが、短期的に制度が混乱。'
      },
      deltas: { institutionalTrust: 0.08, socialFragmentation: 0.03, stateRegulation: -0.05 }
    },
    {
      id: 'gradual_reform',
      label: { en: 'Gradual Reform', 'zh-CN': '渐进改良', ja: '漸進的改良' },
      desc: {
        en: 'Incremental changes preserve stability while slowly building better governance.',
        'zh-CN': '渐进变革维持稳定的同时逐步改善治理。',
        ja: '漸進的変革で安定を維持しつつ、徐々にガバナンスを改善。'
      },
      deltas: { institutionalTrust: 0.04, legalPluralism: 0.03, socialFragmentation: -0.03 }
    }
  ],
  ai_doctrine_leak: [
    {
      id: 'public_disclosure',
      label: { en: 'Public Disclosure', 'zh-CN': '公开披露', ja: '情報公開' },
      desc: {
        en: 'Full transparency about the leak restores trust but feeds media frenzy.',
        'zh-CN': '全面透明化恢复信任但助长媒体狂潮。',
        ja: 'リーク情報を全面公開し信頼を回復するが、メディアの狂騒を助長。'
      },
      deltas: { institutionalTrust: 0.06, mediaPolarization: 0.05, digitalization: 0.02 }
    },
    {
      id: 'controlled_release',
      label: { en: 'Controlled Release', 'zh-CN': '受控发布', ja: '統制公開' },
      desc: {
        en: 'Managed information release prevents panic but reduces digital openness.',
        'zh-CN': '管控信息发布防止恐慌但降低数字开放性。',
        ja: '情報公開を管理してパニックを防ぐが、デジタル開放性は低下。'
      },
      deltas: { mediaPolarization: -0.04, digitalization: -0.04, stateRegulation: 0.04 }
    }
  ],
  grassroots_relief_network: [
    {
      id: 'network_federation',
      label: { en: 'Network Federation', 'zh-CN': '网络联盟', ja: 'ネットワーク連盟' },
      desc: {
        en: 'Federate relief networks for broader impact; more resilient but harder to coordinate.',
        'zh-CN': '联合援助网络以扩大影响；更有韧性但更难协调。',
        ja: '支援ネットワークを連合しインパクトを拡大; レジリエントだが調整は困難。'
      },
      deltas: { institutionalTrust: 0.05, socialFragmentation: -0.04, economicStress: -0.03 }
    },
    {
      id: 'local_deepening',
      label: { en: 'Local Deepening', 'zh-CN': '本地深耕', ja: 'ローカル深化' },
      desc: {
        en: 'Strengthen local roots for lasting community trust; narrower reach but deeper bonds.',
        'zh-CN': '深化本地根基以建立持久社区信任；范围窄但纽带深。',
        ja: 'ローカルな基盤を深め持続的な信頼を構築; 範囲は狭いが絆は深い。'
      },
      deltas: { meaningSearch: 0.04, socialFragmentation: -0.03, migration: -0.02 }
    }
  ],
  interfaith_education_reform: [
    {
      id: 'universal_curriculum',
      label: { en: 'Universal Curriculum', 'zh-CN': '通用课程', ja: 'ユニバーサルカリキュラム' },
      desc: {
        en: 'Standardize interfaith education broadly; promotes understanding but homogenizes identity.',
        'zh-CN': '广泛标准化跨信仰教育；促进理解但同质化身份。',
        ja: '異宗教間教育を広く標準化; 理解を促すがアイデンティティが均質化。'
      },
      deltas: { legalPluralism: 0.06, secularization: 0.04, identityPolitics: -0.04 }
    },
    {
      id: 'tradition_track',
      label: { en: 'Tradition Track', 'zh-CN': '传统路径', ja: '伝統トラック' },
      desc: {
        en: 'Let each tradition teach its own heritage alongside shared ethics.',
        'zh-CN': '让各传统自主传承并辅以共享伦理教育。',
        ja: '各伝統が独自の遺産を教え、共有倫理と並行させる。'
      },
      deltas: { meaningSearch: 0.05, identityPolitics: 0.02, socialFragmentation: -0.03 }
    }
  ],
  algorithmic_echo_burst: [
    {
      id: 'open_algorithm_mandate',
      label: { en: 'Open Algorithm Mandate', 'zh-CN': '算法公开令', ja: 'アルゴリズム開示命令' },
      desc: {
        en: 'Mandate transparency in recommendation systems; disrupts echo chambers but slows platforms.',
        'zh-CN': '要求推荐系统透明；打破回音室但减缓平台效率。',
        ja: 'レコメンドシステムの透明性を義務化; エコーチェンバーを打破するがプラットフォームは減速。'
      },
      deltas: { mediaPolarization: -0.07, digitalization: -0.03, legalPluralism: 0.04 }
    },
    {
      id: 'counter_narrative_injection',
      label: { en: 'Counter-Narrative Injection', 'zh-CN': '反叙事注入', ja: 'カウンターナラティブ注入' },
      desc: {
        en: 'Inject diverse viewpoints into algorithmic feeds; maintains speed but adds noise.',
        'zh-CN': '向算法推送注入多元视角；保持速度但增加噪声。',
        ja: 'アルゴリズムフィードに多様な視点を注入; 速度は維持するが雑音が増す。'
      },
      deltas: { mediaPolarization: -0.04, socialFragmentation: 0.02, digitalization: 0.03 }
    }
  ]
};
