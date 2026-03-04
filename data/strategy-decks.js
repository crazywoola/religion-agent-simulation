// 20 pre-built strategy deck presets, each with 15 curated cards from the 108-card pool.
// Players can select a preset deck, or use a random 36-card draw.

export const STRATEGY_DECK_PRESETS = [
  {
    id: 'iron_wall',
    label: { en: 'Iron Wall', 'zh-CN': '铁壁防线', ja: '鉄壁防衛' },
    description: {
      en: 'Maximum defense and stability. Heavy on trust, cooling, and governance cards.',
      'zh-CN': '最大化防御与稳定。大量信任、降温与治理卡。',
      ja: '防御と安定を最大化。信頼・冷却・統治カードが中心。'
    },
    icon: '🛡️',
    difficulty: 'normal',
    recommendedFor: ['guardian', 'warden', 'inquisitor', 'architect', 'shepherd', 'inquisitor_minor'],
    cards: [
      'trust_grant', 'calm_media', 'ethics_audit', 'narrative_shield', 'community_watch',
      'trust_fund', 'peace_accord', 'governance_reform', 'healing_circle', 'elder_council',
      'crisis_pivot', 'trust_restoration', 'fragmentation_repair', 'silent_diplomacy', 'monitoring_mission'
    ]
  },
  {
    id: 'blitzkrieg',
    label: { en: 'Blitzkrieg', 'zh-CN': '闪电战', ja: '電撃戦' },
    description: {
      en: 'All-out aggressive expansion. High risk, high reward tempo cards.',
      'zh-CN': '全面激进扩张。高风险高回报的节奏卡。',
      ja: '全面的攻撃拡張。ハイリスク・ハイリターンのテンポカード。'
    },
    icon: '⚡',
    difficulty: 'hard',
    recommendedFor: ['warlord', 'zealot', 'evangelist', 'commander', 'pioneer', 'missionary'],
    cards: [
      'youth_festival', 'viral_campaign', 'media_blitz', 'street_preaching', 'conversion_sprint',
      'tent_revival', 'outreach_surge', 'diaspora_rally', 'campus_mission', 'digital_crusade',
      'propaganda_wave', 'holy_war', 'revival_tour', 'territory_campaign', 'identity_forge'
    ]
  },
  {
    id: 'peace_weaver',
    label: { en: 'Peace Weaver', 'zh-CN': '和平编织者', ja: '平和の織り手' },
    description: {
      en: 'Diplomacy and mediation focused. Reduces conflict across all dimensions.',
      'zh-CN': '聚焦外交与调解。全方位降低冲突。',
      ja: '外交と調停に特化。あらゆる次元の対立を低減。'
    },
    icon: '🕊️',
    difficulty: 'normal',
    recommendedFor: ['diplomat', 'diplomat_senior', 'peacemaker', 'envoy', 'healer_king', 'confessor'],
    cards: [
      'bridge_dialogue', 'civic_mediation_lab', 'interfaith_council', 'peace_accord', 'ceasefire_pact',
      'conflict_resolution', 'mediation_summit', 'amnesty_program', 'cultural_festival', 'prayer_vigil',
      'identity_bridge', 'silent_diplomacy', 'peace_process', 'cultural_exchange', 'truth_commission'
    ]
  },
  {
    id: 'digital_dominion',
    label: { en: 'Digital Dominion', 'zh-CN': '数字帝国', ja: 'デジタル帝国' },
    description: {
      en: 'Master the digital space. Heavy on tech, platforms, and online outreach.',
      'zh-CN': '掌控数字空间。大量技术、平台与线上传播卡。',
      ja: 'デジタル空間を制覇。テック・プラットフォーム・オンライン布教が中心。'
    },
    icon: '💻',
    difficulty: 'normal',
    recommendedFor: ['technomancer', 'visionary', 'heretik', 'oracle_tech', 'evangelist'],
    cards: [
      'open_data_pulpit', 'podcast_network', 'viral_campaign', 'prayer_app', 'media_blitz',
      'campus_mission', 'digital_fast', 'digital_crusade', 'digital_empire', 'media_network',
      'sacred_art', 'social_enterprise', 'narrative_shield', 'counter_intelligence', 'youth_festival'
    ]
  },
  {
    id: 'holy_crusade',
    label: { en: 'Holy Crusade', 'zh-CN': '圣战', ja: '聖戦' },
    description: {
      en: 'Identity warfare and territorial dominance. Polarizing but powerful.',
      'zh-CN': '身份战争与领地统治。极化但强力。',
      ja: 'アイデンティティ戦争と領域支配。分極化するが強力。'
    },
    icon: '⚔️',
    difficulty: 'expert',
    recommendedFor: ['warlord', 'templar', 'zealot', 'martyr', 'avenger', 'commander'],
    cards: [
      'holy_war', 'holy_alliance', 'martyrdom_narrative', 'schism_exploit', 'underground_network',
      'identity_surge', 'polarization_weapon', 'regime_change', 'diaspora_rally', 'tent_revival',
      'street_preaching', 'identity_forge', 'territory_campaign', 'counter_secular', 'apocalypse_preaching'
    ]
  },
  {
    id: 'welfare_state',
    label: { en: 'Welfare State', 'zh-CN': '福利国家', ja: '福祉国家' },
    description: {
      en: 'Economic relief and community service. Builds trust through material aid.',
      'zh-CN': '经济救济与社区服务。通过物质援助建立信任。',
      ja: '経済救済とコミュニティサービス。物質的支援で信頼を構築。'
    },
    icon: '🏥',
    difficulty: 'normal',
    recommendedFor: ['healer', 'medic', 'merchant', 'saint', 'confessor', 'reformer'],
    cards: [
      'solidarity_surge', 'charity_blitz', 'economic_mission', 'food_bank', 'relief_network',
      'water_sharing', 'trust_fund', 'social_enterprise', 'grassroots_network', 'economic_network',
      'liberation_theology', 'eco_stewardship', 'economic_leverage', 'anti_corruption_drive', 'prosperity_gospel'
    ]
  },
  {
    id: 'ivory_tower',
    label: { en: 'Ivory Tower', 'zh-CN': '象牙塔', ja: '象牙の塔' },
    description: {
      en: 'Intellectual discourse and education. High Intel generation, deep analysis.',
      'zh-CN': '知性对话与教育。高情报产出，深度分析。',
      ja: '知的対話と教育。高Intel生成、深い分析。'
    },
    icon: '🎓',
    difficulty: 'normal',
    recommendedFor: ['scholar', 'architect', 'deacon', 'sage', 'healer_king', 'chronicler', 'scribe'],
    cards: [
      'bridge_dialogue', 'open_data_pulpit', 'ethics_audit', 'scholarship_fund', 'education_offensive',
      'faith_academy', 'interfaith_council', 'memorial_project', 'heritage_preservation', 'due_process_reform',
      'judicial_oversight', 'transparency_act', 'training_pipeline', 'mentorship_program', 'cultural_exchange'
    ]
  },
  {
    id: 'shadow_ops',
    label: { en: 'Shadow Ops', 'zh-CN': '暗影行动', ja: 'シャドウ作戦' },
    description: {
      en: 'Covert operations and information warfare. Sneaky but effective.',
      'zh-CN': '隐蔽行动与信息战。隐秘但有效。',
      ja: '秘密作戦と情報戦。隠密だが効果的。'
    },
    icon: '🕵️',
    difficulty: 'hard',
    recommendedFor: ['spy', 'oracle', 'strategist', 'inquisitor', 'rebel'],
    cards: [
      'counter_intelligence', 'sabotage', 'schism_exploit', 'underground_network', 'propaganda_wave',
      'silent_diplomacy', 'narrative_shield', 'digital_fast', 'regime_change', 'monitoring_mission',
      'resource_raid', 'media_network', 'counter_secular', 'exile_network', 'deradicalization'
    ]
  },
  {
    id: 'spiritual_revival',
    label: { en: 'Spiritual Revival', 'zh-CN': '灵性复兴', ja: '霊性復興' },
    description: {
      en: 'Deep meaning, ritual renewal, and spiritual transformation.',
      'zh-CN': '深层意义、仪式更新与灵性转化。',
      ja: '深い意味、儀礼刷新、霊性変容。'
    },
    icon: '✨',
    difficulty: 'normal',
    recommendedFor: ['mystic', 'monk', 'hermit', 'ascetic', 'pilgrim', 'curator'],
    cards: [
      'meaning_retreat', 'ritual_renewal', 'prayer_vigil', 'heritage_preservation', 'pilgrimage_route',
      'night_vigil', 'tent_revival', 'cultural_festival', 'anxiety_response', 'meaning_crisis',
      'healing_circle', 'eco_stewardship', 'sacred_art', 'revival_tour', 'mentorship_program'
    ]
  },
  {
    id: 'youth_revolution',
    label: { en: 'Youth Revolution', 'zh-CN': '青年革命', ja: '若者革命' },
    description: {
      en: 'Mobilize the next generation. Youth-focused expansion and digital outreach.',
      'zh-CN': '动员下一代。青年导向的扩张与数字传播。',
      ja: '次世代を動員。若者中心の拡張とデジタル布教。'
    },
    icon: '🔥',
    difficulty: 'normal',
    recommendedFor: ['evangelist', 'bard', 'artist', 'rebel', 'populist', 'zealot'],
    cards: [
      'youth_festival', 'campus_mission', 'music_worship', 'prayer_app', 'interfaith_sport',
      'youth_dialogue', 'mentorship_program', 'education_offensive', 'viral_campaign', 'digital_crusade',
      'emotional_release', 'deradicalization', 'liberation_theology', 'scholarship_fund', 'digital_empire'
    ]
  },
  {
    id: 'legal_fortress',
    label: { en: 'Legal Fortress', 'zh-CN': '法律堡垒', ja: '法の要塞' },
    description: {
      en: 'Build an unbreakable legal framework. Pluralism and due process maximized.',
      'zh-CN': '构建不可撼动的法律框架。多元与正当程序最大化。',
      ja: '揺るぎない法的枠組みを構築。多元性と適正手続きを最大化。'
    },
    icon: '⚖️',
    difficulty: 'normal',
    recommendedFor: ['judge', 'diplomat', 'liberator', 'inquisitor', 'reformer', 'healer_king'],
    cards: [
      'legal_aid_caravan', 'due_process_reform', 'judicial_oversight', 'transparency_act', 'amnesty_program',
      'social_contract', 'pluralism_shield', 'regulation_relief', 'ethics_audit', 'sanctuary_city',
      'interfaith_council', 'monitoring_mission', 'governance_reform', 'truth_commission', 'civic_mediation_lab'
    ]
  },
  {
    id: 'migration_tide',
    label: { en: 'Migration Tide', 'zh-CN': '迁移浪潮', ja: '移動の潮流' },
    description: {
      en: 'Ride the wave of population movement. Migration and diaspora focused.',
      'zh-CN': '驾驭人口流动浪潮。聚焦迁移与侨民。',
      ja: '人口移動の波に乗る。移動とディアスポラに焦点。'
    },
    icon: '🌊',
    difficulty: 'hard',
    recommendedFor: ['pilgrim', 'nomad', 'missionary', 'pioneer', 'wanderer', 'envoy'],
    cards: [
      'migration_corridor', 'diaspora_rally', 'exile_network', 'outreach_surge', 'frontier_mission',
      'sanctuary_city', 'street_preaching', 'pilgrimage_route', 'migration_surge', 'conversion_sprint',
      'economic_mission', 'food_bank', 'solidarity_surge', 'grassroots_network', 'territory_campaign'
    ]
  },
  {
    id: 'crisis_manager',
    label: { en: 'Crisis Manager', 'zh-CN': '危机管理者', ja: '危機管理者' },
    description: {
      en: 'Thrive in chaos. Loaded with conditional cards that double in crises.',
      'zh-CN': '在混乱中繁荣。大量在危机中翻倍的条件卡。',
      ja: '混乱の中で繁栄。危機時に倍増する条件カード満載。'
    },
    icon: '🚨',
    difficulty: 'expert',
    recommendedFor: ['alchemist', 'oracle', 'reformer', 'strategist', 'prophet', 'witch'],
    cards: [
      'crisis_pivot', 'solidarity_surge', 'trust_restoration', 'identity_bridge', 'regulation_relief',
      'anxiety_response', 'fragmentation_repair', 'youth_dialogue', 'pluralism_shield', 'digital_fast',
      'meaning_crisis', 'economic_leverage', 'polarization_weapon', 'counter_secular', 'calm_media'
    ]
  },
  {
    id: 'slow_burn',
    label: { en: 'Slow Burn', 'zh-CN': '慢火煮', ja: 'スロー・バーン' },
    description: {
      en: 'Patient long-game strategy. Loaded with sustained cards that compound over rounds.',
      'zh-CN': '耐心的长线策略。大量多轮持续生效的复利卡。',
      ja: '忍耐のロングゲーム戦略。複数ラウンド持続する複利カード満載。'
    },
    icon: '🕰️',
    difficulty: 'hard',
    recommendedFor: ['merchant', 'builder', 'architect', 'scholar', 'diplomat', 'strategist', 'elder'],
    cards: [
      'silent_diplomacy', 'grassroots_network', 'peace_process', 'mentorship_program', 'healing_circle',
      'governance_reform', 'cultural_exchange', 'monitoring_mission', 'scholarship_fund', 'revival_tour',
      'digital_empire', 'education_offensive', 'economic_network', 'training_pipeline', 'identity_forge'
    ]
  },
  {
    id: 'populist_wave',
    label: { en: 'Populist Wave', 'zh-CN': '民粹浪潮', ja: 'ポピュリストの波' },
    description: {
      en: 'Amplify identity and emotion. Polarizing but massively popular.',
      'zh-CN': '放大身份与情感。极化但极受欢迎。',
      ja: 'アイデンティティと感情を増幅。分極化するが大人気。'
    },
    icon: '📣',
    difficulty: 'hard',
    recommendedFor: ['populist', 'zealot', 'martyr', 'bard', 'warlord', 'rebel'],
    cards: [
      'tent_revival', 'martyrdom_narrative', 'apocalypse_preaching', 'music_worship', 'prosperity_gospel',
      'holy_alliance', 'diaspora_rally', 'identity_surge', 'night_vigil', 'faith_tax',
      'street_preaching', 'youth_festival', 'media_blitz', 'resource_raid', 'identity_forge'
    ]
  },
  {
    id: 'balanced_portfolio',
    label: { en: 'Balanced Portfolio', 'zh-CN': '均衡组合', ja: 'バランス型' },
    description: {
      en: 'A little of everything. Versatile toolkit for any situation.',
      'zh-CN': '面面俱到。任何场景都适用的万能工具箱。',
      ja: '万能ツールキット。あらゆる状況に対応。'
    },
    icon: '🎯',
    difficulty: 'normal',
    recommendedFor: ['diplomat', 'reformer', 'sage', 'scholar', 'nomad', 'alchemist'],
    cards: [
      'bridge_dialogue', 'trust_grant', 'youth_festival', 'calm_media', 'migration_corridor',
      'crisis_pivot', 'solidarity_surge', 'silent_diplomacy', 'digital_fast', 'ethics_audit',
      'grassroots_network', 'meaning_retreat', 'legal_aid_caravan', 'open_data_pulpit', 'charity_blitz'
    ]
  },
  {
    id: 'eco_warrior',
    label: { en: 'Eco Warrior', 'zh-CN': '生态战士', ja: 'エコ・ウォリアー' },
    description: {
      en: 'Environmental stewardship meets spiritual meaning. Green faith in action.',
      'zh-CN': '环保管理与灵性意义结合。绿色信仰行动。',
      ja: '環境管理とスピリチュアルな意味の融合。グリーン信仰の実践。'
    },
    icon: '🌿',
    difficulty: 'normal',
    recommendedFor: ['mystic', 'artist', 'monk', 'hermit', 'healer', 'saint', 'matriarch'],
    cards: [
      'eco_stewardship', 'meaning_retreat', 'water_sharing', 'cultural_festival', 'community_watch',
      'ritual_renewal', 'healing_circle', 'grassroots_network', 'anxiety_response', 'solidarity_surge',
      'relief_network', 'mentorship_program', 'interfaith_sport', 'prayer_vigil', 'sacred_art'
    ]
  },
  {
    id: 'theocracy',
    label: { en: 'Theocracy', 'zh-CN': '神权政治', ja: '神権政治' },
    description: {
      en: 'State power meets religious authority. Regulation and control maximized.',
      'zh-CN': '国家权力与宗教权威结合。最大化监管与控制。',
      ja: '国家権力と宗教権威の融合。規制と制御を最大化。'
    },
    icon: '👑',
    difficulty: 'expert',
    recommendedFor: ['templar', 'warlord', 'inquisitor', 'commander', 'warden', 'zealot'],
    cards: [
      'faith_tax', 'holy_alliance', 'regime_change', 'underground_network', 'counter_secular',
      'identity_surge', 'holy_war', 'education_offensive', 'training_pipeline', 'media_network',
      'propaganda_wave', 'sabotage', 'economic_leverage', 'territory_campaign', 'martyrdom_narrative'
    ]
  },
  {
    id: 'humanitarian',
    label: { en: 'Humanitarian', 'zh-CN': '人道主义', ja: 'ヒューマニタリアン' },
    description: {
      en: 'Pure compassion. Focus on relief, healing, and human dignity.',
      'zh-CN': '纯粹慈悲。聚焦救济、愈合与人类尊严。',
      ja: '純粋な慈悲。救済・癒し・人間の尊厳に焦点。'
    },
    icon: '❤️',
    difficulty: 'normal',
    recommendedFor: ['healer', 'medic', 'saint', 'confessor', 'diplomat', 'peacemaker'],
    cards: [
      'food_bank', 'relief_network', 'water_sharing', 'sanctuary_city', 'amnesty_program',
      'healing_circle', 'emotional_release', 'deradicalization', 'memorial_project', 'conflict_resolution',
      'eco_stewardship', 'truth_commission', 'grassroots_network', 'solidarity_surge', 'community_watch'
    ]
  },
  {
    id: 'chaos_agent',
    label: { en: 'Chaos Agent', 'zh-CN': '混沌特工', ja: 'カオス・エージェント' },
    description: {
      en: 'Watch the world burn. Maximum disruption and volatility for unpredictable outcomes.',
      'zh-CN': '看着世界燃烧。最大化混乱与波动以制造不可预测的结果。',
      ja: '世界が燃えるのを見守る。最大限の混乱と変動で予測不能な結果を。'
    },
    icon: '🃏',
    difficulty: 'expert',
    recommendedFor: ['rebel', 'heretik', 'alchemist', 'spy', 'nomad', 'avenger', 'witch'],
    cards: [
      'holy_war', 'propaganda_wave', 'sabotage', 'schism_exploit', 'apocalypse_preaching',
      'media_blitz', 'regime_change', 'resource_raid', 'polarization_weapon', 'prosperity_gospel',
      'migration_surge', 'digital_crusade', 'meaning_crisis', 'viral_campaign', 'identity_surge'
    ]
  }
];
