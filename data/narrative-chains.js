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
  ]
};
