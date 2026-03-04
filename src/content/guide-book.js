export const GUIDE_BOOK = {
  en: {
    title: 'Simulation Field Guide',
    subtitle: 'Operations, systems, and parameters explained.',
    prev: '← Prev',
    next: 'Next →',
    chapters: [
      {
        id: 'quick_start',
        label: '1. Quick Start',
        intro: 'A standard run starts with character and deck selection, then advances automatically.',
        sections: [
          {
            title: 'Game Start Flow',
            kind: 'list',
            items: [
              'Press Start — a character selection screen appears with 5 randomly generated characters.',
              'Each character pairs a religion (from 14) with a role archetype (from 59), giving unique cards, Intel, and a win objective.',
              'After picking a character, choose one of 20 strategy deck presets or a random 36-card draw from the 108-card pool.',
              'The game begins: each tick applies signal drift, events, transfers, and judgments.',
              'You gain +1 Intel per round automatically, plus bonus from combos, events, and bets.'
            ]
          },
          {
            title: 'Control Panel',
            kind: 'table',
            headers: ['Control', 'Type', 'Range', 'Explanation'],
            rows: [
              ['Start', 'Action', 'One-shot', 'Character select → deck select → begin.'],
              ['Pause', 'Action', 'One-shot', 'Stop loop and settle score (except Ironman).'],
              ['Tick Interval', 'Number', '800-10000 ms', 'Controls simulation speed.'],
              ['Use AI', 'Toggle', 'On/Off', 'Enable AI-enhanced action logs and transfer proposals.'],
              ['Scenario', 'Enum', '4 presets', 'Balanced / High Regulation / High Secularization / High Polarization.'],
              ['Signal Sliders', 'Float', '0.10-0.98', 'Manual one-round signal overrides.']
            ]
          }
        ]
      },
      {
        id: 'systems',
        label: '2. Simulation Systems',
        intro: 'The model combines rule dynamics, optional AI, governance constraints, and religion-specific abilities.',
        sections: [
          {
            title: 'Core Systems',
            kind: 'table',
            headers: ['System', 'Type', 'Updated', 'What it means'],
            rows: [
              ['Transfer Engine', 'Rule/AI/Hybrid', 'Per round', 'Source of assimilation corridor proposals.'],
              ['Religious Judgment', 'Governance filter', 'Per round', 'Blocks transfers via orthodoxy tribunals, injunctions, or state regulation.'],
              ['Event Shock', 'Stochastic + boss', 'Every 3 rounds', '14 event types with narrative chains and player decisions.'],
              ['Region Control', 'Territory model', 'Per round', 'Ownership, contest status, streak, territory bonuses.'],
              ['Boss Crisis', 'Multi-phase raid', 'R6+ trigger', '3 phases with real-time pass/fail condition display.'],
              ['Religion Passives', 'Per-religion effect', 'Per round', 'Each of 14 religions has a unique passive that shifts one signal.'],
              ['Underdog Bonus', 'Auto boost', 'Per round', 'Religions below 15% share get churn reduction; below 12% get pull boost.'],
              ['Event-Religion Coupling', 'Trait-targeted', 'On event fire', 'Events boost religions with matching trait above 0.5.'],
              ['Character System', 'Role-based', 'Per game', '59 roles × 14 religions with unique goals and starter decks.']
            ]
          },
          {
            title: 'Religion Passive Abilities (14 religions)',
            kind: 'table',
            headers: ['Religion', 'Passive Name', 'Signal', 'Direction'],
            rows: [
              ['Buddhism', 'Mindful Calm', 'Media Polarization', '↓'],
              ['Hinduism', 'Festival Bond', 'Social Fragmentation', '↓'],
              ['Taoism', 'Way of Nature', 'Meaning Search', '↑'],
              ['Islam', 'Ummah Solidarity', 'Identity Politics', '↓'],
              ['Protestant', 'Digital Mission', 'Digitalization', '↑'],
              ['Pastafarianism', 'Viral Meme Wave', 'Youth Pressure', '↓'],
              ['Catholicism', 'Parish Network', 'Institutional Trust', '↑'],
              ['Shinto', 'Shrine Harmony', 'State Regulation', '↓'],
              ['Secular', 'Rational Tide', 'Secularization', '↑'],
              ['Judaism', 'Covenant Resilience', 'Economic Stress', '↓'],
              ['Sikhism', 'Langar Unity', 'Social Fragmentation', '↓'],
              ['Eastern Orthodox', 'Liturgical Anchor', 'Migration', '↓'],
              ['Zoroastrianism', 'Sacred Flame', 'Institutional Trust', '↑'],
              ["Baha'i", 'Unity Vision', 'Legal Pluralism', '↑']
            ]
          },
          {
            title: 'Reading Tips',
            kind: 'list',
            items: [
              'Check roundMetrics.judgmentRatio to see institutional pressure.',
              'Compare totalFlow with ghost milestones for quality pacing.',
              'Open the Judgment subtab in the drawer to see tribunal blocks with reasons.',
              'Hover over the follower trend chart for per-religion values; vertical lines mark events.',
              'Filter logs by type: Mission, Judgment, Event, Territory.'
            ]
          }
        ]
      },
      {
        id: 'gameplay',
        label: '3. Gameplay Layer',
        intro: 'Game systems reward planning, timing, and risk management on top of simulation.',
        sections: [
          {
            title: 'Mechanics Overview',
            kind: 'table',
            headers: ['Mechanic', 'Type', 'Cost / Trigger', 'Result'],
            rows: [
              ['Character', 'Role selection', 'Game start', '59 roles × 14 religions, unique goal + starter deck + Intel bonus.'],
              ['Strategy Deck', '108-card pool', '36 per game, hand of 5', '20 preset decks or random draw. 3 card types.'],
              ['Combo Corridor', 'Passive score', 'High-flow links in sequence', 'Builds combo and Intel gain.'],
              ['Intel', 'Resource', '+1/round + combo/events/bets', 'Used by forecast unlock, cards, and bets.'],
              ['Risk Bet', 'Action', '5 Intel, resolves after 3 rounds', '5 bet types available.'],
              ['Secret Agenda', 'Hidden mission', 'Auto-evaluated', 'Bonus Intel when fulfilled. 5 agenda types.'],
              ['Character Goal', 'Role objective', 'Per round evaluation', '+10 Intel + 15 combo on completion.'],
              ['Boss Crisis', 'Multi-phase raid', 'Triggered at R6+', 'Cards/forecast locked during phases.']
            ]
          },
          {
            title: 'Card System (108 cards, 2 decks)',
            kind: 'table',
            headers: ['Type', 'Count', 'Mechanic', 'Examples'],
            rows: [
              ['Immediate', '73', 'One-shot signal deltas', 'Bridge Dialogue, Calm Media, Youth Festival, Holy War'],
              ['Conditional', '17', 'Effect doubles when signal threshold met', 'Crisis Pivot (pol > 60%), Trust Restoration (trust < 35%), Counter-Secular (sec > 70%)'],
              ['Sustained', '18', 'Re-applied for 2-3 rounds', 'Silent Diplomacy (2R), Peace Process (3R), Digital Empire (3R)']
            ]
          },
          {
            title: 'Deck A: Diplomacy & Stability (54 cards)',
            kind: 'list',
            items: [
              '18 Trust & Governance cards: build institutional trust, legal pluralism, and due process.',
              '18 Cooling & Defense cards: reduce polarization, fragmentation, and identity conflict.',
              '9 Conditional cards: emergency response that doubles in crisis conditions.',
              '9 Sustained cards: multi-round diplomatic and governance reforms.'
            ]
          },
          {
            title: 'Deck B: Expansion & Disruption (54 cards)',
            kind: 'list',
            items: [
              '18 Expansion & Tempo cards: migration, youth, digital outreach, and aggressive growth.',
              '18 Disruption & Risk cards: propaganda, sabotage, identity warfare, and regime change.',
              '8 Conditional cards: exploit crises for aggressive expansion.',
              '9 Sustained cards: multi-round territory campaigns and network building.',
              '1 additional immediate card for frontier missions.'
            ]
          },
          {
            title: 'Strategy Deck Presets (20 presets)',
            kind: 'table',
            headers: ['Preset', 'Theme', 'Difficulty', 'Play Style'],
            rows: [
              ['Iron Wall 🛡️', 'Defense & Stability', 'Normal', 'Trust + cooling + governance cards'],
              ['Blitzkrieg ⚡', 'Aggressive Expansion', 'Hard', 'All tempo + outreach cards'],
              ['Peace Weaver 🕊️', 'Diplomacy & Mediation', 'Normal', 'Dialogue + conflict resolution'],
              ['Digital Dominion 💻', 'Technology & Platforms', 'Normal', 'Digital + media + apps'],
              ['Holy Crusade ⚔️', 'Identity Warfare', 'Expert', 'Identity + territorial dominance'],
              ['Crisis Manager 🚨', 'All Conditional Cards', 'Expert', 'Doubles in every crisis'],
              ['Slow Burn 🕰️', 'All Sustained Cards', 'Hard', 'Compound value over rounds'],
              ['Chaos Agent 🃏', 'Maximum Disruption', 'Expert', 'Watch the world burn'],
              ['...and 12 more', '', '', 'Welfare, Scholar, Shadow, Revival, Youth, Legal, Migration, Populist, Balanced, Eco, Theocracy, Humanitarian']
            ]
          },
          {
            title: 'Event Response Checklist',
            kind: 'list',
            items: [
              'All 14 random events offer decision options — always check the event decision card.',
              'If polarization events trigger, prioritize Deck A cooling cards within 1-2 rounds.',
              'If trust shocks occur, preserve Intel for conditional trust restoration cards.',
              'Migration + youth pressure rising? Pair Deck B mobility cards with Deck A fragmentation control.',
              'Legal pluralism below 0.35: use Legal Fortress preset or reserve law-oriented emergency cards.',
              'Events also boost religions with matching traits (e.g. digital_revival + high digitalMission).'
            ]
          }
        ]
      },
      {
        id: 'characters',
        label: '4. Character & Role System',
        intro: '59 character roles across 14 religions provide unique gameplay each run.',
        sections: [
          {
            title: 'How Characters Work',
            kind: 'list',
            items: [
              'At game start, 5 characters are randomly generated: each pairs a religion with a role.',
              'Each role has: icon, preferred cards (guaranteed in deck), starter Intel (1-6), and a unique win objective.',
              'Character goal is evaluated each round. Completion grants +10 Intel and +15 combo score.',
              'A character badge in the HUD shows your active role and turns green when goal is achieved.',
              'After choosing a character, you select a strategy deck preset (20 options) or random draw.'
            ]
          },
          {
            title: 'Role Archetypes (sample)',
            kind: 'table',
            headers: ['Role', 'Icon', 'Intel', 'Goal Type'],
            rows: [
              ['Diplomat', '🕊️', '4', 'Keep pluralism above threshold for N rounds'],
              ['Evangelist', '📢', '2', 'Reach high total transfer flow in one round'],
              ['Inquisitor', '⚖️', '3', 'Maintain judgment ratio above threshold'],
              ['Warlord', '⚔️', '1', 'Control 5+ regions simultaneously'],
              ['Scholar', '📚', '5', 'Play 6+ strategy cards in a run'],
              ['Prophet', '👁️', '4', 'Win 3 consecutive bets'],
              ['Spy', '🕵️', '6', 'Hold 25+ Intel at round 10'],
              ['Saint', '😇', '2', 'Complete all 3 stage objectives'],
              ['...and 51 more', '', '', 'Healer, Guardian, Monk, Rebel, Sage, Templar, Witch, Technomancer, etc.']
            ]
          }
        ]
      },
      {
        id: 'parameters',
        label: '5. Parameter Reference',
        intro: 'Most values are normalized for easy tuning and interpretation.',
        sections: [
          {
            title: 'Key Parameters',
            kind: 'table',
            headers: ['Parameter', 'Type', 'Range', 'Effect'],
            rows: [
              ['socialSignals.*', 'Float', '0.10-0.98', 'Directly changes transfer and judgment dynamics.'],
              ['exitBarrierWeight', 'Float', '0.68', 'How much exitBarrier reduces churn.'],
              ['secularBuff', 'Float', '1.55', 'Secularism bonus in high-secularization environments.'],
              ['underdogBoost', 'Float', '0-0.25 / 1.0-1.35', 'Comeback mechanic for low-share religions.'],
              ['scenarioBlendRate', 'Float', '0.16', 'Signal drift speed toward scenario targets.'],
              ['events.checkEveryNRounds', 'Int', '3', 'Random event check frequency.'],
              ['events.maxPerCheck', 'Int', '2', 'Max concurrent events per check.']
            ]
          },
          {
            title: 'Boss Phase Conditions',
            kind: 'table',
            headers: ['Phase', 'Condition 1', 'Condition 2', 'Condition 3'],
            rows: [
              ['Phase 1', 'Fragmentation < 0.74', 'Trust > 0.36', '—'],
              ['Phase 2', 'Stable regions >= 4', 'Contested <= 2', 'Polarization < 0.80'],
              ['Phase 3', 'Judgment ratio < 0.50', 'Pluralism > 0.44', 'Fragmentation < 0.78']
            ]
          }
        ]
      },
      {
        id: 'advanced_modes',
        label: '6. Advanced Modes',
        intro: 'Modes change strategy constraints and scoring expectations.',
        sections: [
          {
            title: 'Mode Explanations',
            kind: 'list',
            items: [
              'Daily Challenge: deterministic seed. Consistent across all players on the same day.',
              'Ironman: no pause, auto-settlement at round 24, stricter pressure.',
              'Ghost Comparison: compare against previous run. Seed ghost provided for first-time players.',
              'Hover "Vs Ghost" in HUD for explanation.'
            ]
          },
          {
            title: 'Boss Phase Rules',
            kind: 'table',
            headers: ['Phase', 'Locked', 'Implication'],
            rows: [
              ['Phase 1', 'Strategy cards disabled', 'Rely on baseline systems.'],
              ['Phase 2', 'Forecast disabled', 'Use observed corridors.'],
              ['Phase 3', 'Extra pressure/round', 'Stability resources critical.']
            ]
          },
          {
            title: 'Drawer Panels',
            kind: 'table',
            headers: ['Panel', 'Subtab', 'Content'],
            rows: [
              ['Insights', 'Assimilation', 'Flow, judgment ratio, corridors, engine.'],
              ['Insights', 'Regions', 'Control, competition, ownership.'],
              ['Insights', 'Events', 'Event feed with shock details.'],
              ['Insights', 'Judgment', 'Recent tribunal blocks with reasons.'],
              ['Logs', 'All/Mission/Judgment/Event/Territory', 'Filtered mission logs.']
            ]
          }
        ]
      }
    ]
  },
  'zh-CN': {
    title: '模拟作战手册',
    subtitle: '覆盖操作、系统与参数的完整说明。',
    prev: '← 上一页',
    next: '下一页 →',
    chapters: [
      {
        id: 'quick_start',
        label: '1. 快速开始',
        intro: '标准对局从角色选择和卡组选择开始，然后自动推进。',
        sections: [
          {
            title: '开局流程',
            kind: 'list',
            items: [
              '点击 Start — 弹出角色选择界面，显示 5 个随机生成的角色。',
              '每个角色将一个宗教（14 种）与一个职能（59 种）配对，提供独特卡牌、情报和胜利目标。',
              '选择角色后，从 20 套策略卡组预设中选择一套，或随机抽取 36 张卡（来自 108 张卡池）。',
              '游戏开始：每轮处理信号漂移、事件、转化和审判。',
              '每回合自动获得 +1 Intel，额外 Intel 来自连击、事件和下注。'
            ]
          },
          {
            title: '控制面板',
            kind: 'table',
            headers: ['控件', '类型', '范围', '说明'],
            rows: [
              ['Start', '操作', '单次', '角色选择 → 卡组选择 → 开始。'],
              ['Pause', '操作', '单次', '停止并结算（铁人模式除外）。'],
              ['Tick Interval', '数值', '800-10000 ms', '模拟推进速度。'],
              ['Use AI', '开关', 'On/Off', '启用 AI 增强行动日志和转化提案。'],
              ['Scenario', '枚举', '4 预设', '平衡/高监管/高世俗化/高极化。'],
              ['信号滑条', '浮点', '0.10-0.98', '单轮手动信号覆盖。']
            ]
          }
        ]
      },
      {
        id: 'systems',
        label: '2. 模拟系统',
        intro: '模型融合规则、可选 AI、治理约束与宗教专属能力。',
        sections: [
          {
            title: '核心系统',
            kind: 'table',
            headers: ['系统', '类型', '更新', '含义'],
            rows: [
              ['转化引擎', 'Rule/AI/Hybrid', '每轮', '同化走廊提案来源。'],
              ['宗教审判', '治理过滤', '每轮', '通过正统法庭、禁令或国家监管拦截转化。'],
              ['事件冲击', '随机+Boss', '每 3 轮', '14 种事件类型，带叙事链和玩家决策。'],
              ['区域控制', '领地模型', '每轮', '归属、争夺、连控与加成。'],
              ['Boss 危机', '多阶段 Raid', 'R6+ 触发', '3 阶段实时通过/失败条件显示。'],
              ['宗教被动', '各教特效', '每轮', '14 个宗教各有独特被动调整一项信号。'],
              ['弱势补偿', '自动加成', '每轮', '份额 <15% 减少流失；<12% 获拉力加成。'],
              ['事件-宗教耦合', '特质联动', '事件触发时', '事件为匹配特质 >0.5 的宗教加成。'],
              ['角色系统', '职能选择', '每局', '59 职能 × 14 宗教，独特目标与初始卡组。']
            ]
          },
          {
            title: '宗教被动能力（14 个宗教）',
            kind: 'table',
            headers: ['宗教', '被动', '信号', '方向'],
            rows: [
              ['佛教', '正念沉静', '舆论极化', '↓'],
              ['印度教', '节庆纽带', '社会碎片化', '↓'],
              ['道教', '道法自然', '意义追寻', '↑'],
              ['伊斯兰教', '乌玛团结', '身份政治', '↓'],
              ['基督教', '数字布道', '数字化', '↑'],
              ['飞天面条神教', '梗潮传播', '青年压力', '↓'],
              ['天主教', '教区网络', '制度信任', '↑'],
              ['神道教', '神社和谐', '国家监管', '↓'],
              ['世俗主义', '理性潮流', '世俗化', '↑'],
              ['犹太教', '盟约韧性', '经济压力', '↓'],
              ['锡克教', '共食团结', '社会碎片化', '↓'],
              ['东正教', '礼仪之锚', '人口迁移', '↓'],
              ['琐罗亚斯德教', '圣火传承', '制度信任', '↑'],
              ['巴哈伊教', '合一愿景', '法律多元', '↑']
            ]
          },
          {
            title: '阅读建议',
            kind: 'list',
            items: [
              '查看 judgmentRatio 了解制度压力。',
              '与 Ghost 里程碑对比节奏质量。',
              '打开抽屉"宗教审判"子标签查看拦截记录。',
              '悬停在趋势图上查看各宗教数据；竖线标记事件。',
              '按类型过滤日志：传教/审判/事件/领地。'
            ]
          }
        ]
      },
      {
        id: 'gameplay',
        label: '3. 玩法系统',
        intro: '玩法层在模拟基础上加入策略、风险与资源管理。',
        sections: [
          {
            title: '机制概览',
            kind: 'table',
            headers: ['机制', '类型', '成本/触发', '效果'],
            rows: [
              ['角色', '职能选择', '开局', '59 职能 × 14 宗教，独特目标 + 初始卡组 + Intel 加成。'],
              ['策略卡组', '108 卡池', '每局 36 张，手牌 5', '20 套预设卡组或随机抽取。3 种卡牌类型。'],
              ['连锁走廊', '被动计分', '高流量链路连续', '提升连击与 Intel 收益。'],
              ['情报 Intel', '资源', '每轮 +1 + 连击/事件/下注', '用于预测解锁、卡牌和下注。'],
              ['风险下注', '主动', '5 Intel，3 轮后结算', '5 种下注类型。'],
              ['秘密议程', '隐藏任务', '自动判定', '达成后奖励 Intel。5 种。'],
              ['角色目标', '职能目标', '每轮评估', '完成奖励 +10 Intel + 15 连击分。'],
              ['Boss 危机', '多阶段 Raid', 'R6+ 触发', '阶段中卡牌/预测被锁定。']
            ]
          },
          {
            title: '卡牌系统（108 张，2 副牌）',
            kind: 'table',
            headers: ['类型', '数量', '机制', '示例'],
            rows: [
              ['即时', '73', '一次性信号修正', '跨域对话、媒体冷却、青年节拍、圣战'],
              ['条件', '17', '信号超阈值时效果翻倍', '危机转向（极化>60%）、信任修复（信任<35%）、反世俗化（世俗化>70%）'],
              ['持续', '18', '自动重复 2-3 轮', '静默外交（2轮）、和平进程（3轮）、数字帝国（3轮）']
            ]
          },
          {
            title: 'A 副：外交与稳定（54 张）',
            kind: 'list',
            items: [
              '18 张信任与治理卡：建设信任、法律多元与正当程序。',
              '18 张降温与防御卡：降低极化、碎片化与身份冲突。',
              '9 张条件卡：危机条件下翻倍的紧急应对。',
              '9 张持续卡：多轮外交与治理改革。'
            ]
          },
          {
            title: 'B 副：扩张与颠覆（54 张）',
            kind: 'list',
            items: [
              '18 张扩张与节奏卡：迁移、青年、数字传播与激进增长。',
              '18 张颠覆与风险卡：宣传、破坏、身份战争与政权更迭。',
              '8 张条件卡：利用危机进行激进扩张。',
              '9 张持续卡：多轮领地攻势与网络建设。',
              '1 张额外即时前线传教卡。'
            ]
          },
          {
            title: '策略卡组预设（20 套）',
            kind: 'table',
            headers: ['预设', '主题', '难度', '风格'],
            rows: [
              ['铁壁防线 🛡️', '防御与稳定', '普通', '信任 + 降温 + 治理'],
              ['闪电战 ⚡', '激进扩张', '困难', '全节奏 + 传播卡'],
              ['和平编织者 🕊️', '外交与调解', '普通', '对话 + 冲突解决'],
              ['数字帝国 💻', '技术与平台', '普通', '数字 + 媒体 + 应用'],
              ['圣战 ⚔️', '身份战争', '专家', '身份 + 领地统治'],
              ['危机管理者 🚨', '全条件卡', '专家', '每次危机翻倍'],
              ['慢火煮 🕰️', '全持续卡', '困难', '多轮复利价值'],
              ['混沌特工 🃏', '最大破坏', '专家', '看着世界燃烧'],
              ['...另外 12 套', '', '', '福利、学者、暗影、复兴、青年、法律、迁移、民粹、均衡、生态、神权、人道']
            ]
          },
          {
            title: '事件应对清单',
            kind: 'list',
            items: [
              '全部 14 个随机事件均有决策选项——务必查看事件决策卡。',
              '极化事件触发后，1-2 轮内优先使用 A 副降温卡。',
              '信任冲击事件后，保留 Intel 给条件信任修复卡。',
              '迁移+青年压力同升？用 B 副迁移卡搭配 A 副碎片化控制。',
              '法律多元低于 0.35：使用"法律堡垒"预设或保留法治紧急卡。',
              '事件还会为匹配特质的宗教加成（如 digital_revival 加成高数字布道宗教）。'
            ]
          }
        ]
      },
      {
        id: 'characters',
        label: '4. 角色与职能系统',
        intro: '59 种角色职能跨越 14 个宗教，每局提供独特玩法。',
        sections: [
          {
            title: '角色机制',
            kind: 'list',
            items: [
              '开局随机生成 5 个角色：每个将一个宗教与一个职能配对。',
              '每个职能有：图标、偏好卡牌（保证入库）、初始 Intel（1-6）和独特胜利目标。',
              '角色目标每轮评估。完成后获得 +10 Intel 和 +15 连击分。',
              'HUD 中的角色徽章显示当前职能，目标达成后变绿。',
              '选择角色后，再选择策略卡组预设（20 种）或随机抽取。'
            ]
          },
          {
            title: '职能类型（示例）',
            kind: 'table',
            headers: ['职能', '图标', 'Intel', '目标类型'],
            rows: [
              ['外交官', '🕊️', '4', '保持多元性高于阈值 N 轮'],
              ['布道者', '📢', '2', '单轮高转化流量'],
              ['审判官', '⚖️', '3', '维持高审判比'],
              ['战争领主', '⚔️', '1', '同时控制 5+ 区域'],
              ['学者', '📚', '5', '使用 6+ 策略卡'],
              ['先知', '👁️', '4', '连续赢得 3 次下注'],
              ['间谍', '🕵️', '6', '第 10 轮时持有 25+ Intel'],
              ['圣者', '😇', '2', '完成全部 3 个阶段目标'],
              ['...另外 51 种', '', '', '治愈者、守护者、僧侣、叛逆者、智者、圣殿骑士、巫师、技术法师等']
            ]
          }
        ]
      },
      {
        id: 'parameters',
        label: '5. 参数说明',
        intro: '大部分参数归一化，便于理解。',
        sections: [
          {
            title: '关键参数',
            kind: 'table',
            headers: ['参数', '类型', '范围', '影响'],
            rows: [
              ['socialSignals.*', '浮点', '0.10-0.98', '直接影响转化与审判。'],
              ['exitBarrierWeight', '浮点', '0.68', 'exitBarrier 对流失率的影响系数。'],
              ['secularBuff', '浮点', '1.55', '高世俗化环境下世俗主义额外吸引力。'],
              ['underdogBoost', '浮点', '0-0.25 / 1.0-1.35', '弱势宗教的逆袭机制。'],
              ['scenarioBlendRate', '浮点', '0.16', '信号向场景目标漂移速度。'],
              ['events.checkEveryNRounds', '整数', '3', '随机事件检查频率。'],
              ['events.maxPerCheck', '整数', '2', '单次检查最大并发事件数。']
            ]
          },
          {
            title: 'Boss 阶段条件',
            kind: 'table',
            headers: ['阶段', '条件 1', '条件 2', '条件 3'],
            rows: [
              ['Phase 1', '碎片化 < 0.74', '信任 > 0.36', '—'],
              ['Phase 2', '稳定区域 >= 4', '争夺区域 <= 2', '极化 < 0.80'],
              ['Phase 3', '审判比 < 0.50', '多元 > 0.44', '碎片化 < 0.78']
            ]
          }
        ]
      },
      {
        id: 'advanced_modes',
        label: '6. 高阶模式',
        intro: '高阶模式改变约束条件和评分策略。',
        sections: [
          {
            title: '模式说明',
            kind: 'list',
            items: [
              '每日挑战：固定种子，同一天全球一致。',
              '铁人模式：不可暂停，第 24 轮自动结算，压力更高。',
              'Ghost 对照：与上一局归档对比。首次提供内置种子 Ghost。',
              '悬停 HUD 的"对比上局"查看说明。'
            ]
          },
          {
            title: 'Boss 阶段规则',
            kind: 'table',
            headers: ['阶段', '封锁', '含义'],
            rows: [
              ['Phase 1', '禁用策略卡', '依靠基础系统。'],
              ['Phase 2', '禁用预测解锁', '依赖观测链路。'],
              ['Phase 3', '每轮追加压制', '稳定资源至关重要。']
            ]
          },
          {
            title: '抽屉面板',
            kind: 'table',
            headers: ['面板', '子标签', '内容'],
            rows: [
              ['洞察', '同化', '流量、审判比、走廊、引擎。'],
              ['洞察', '区域', '控制、竞争、归属。'],
              ['洞察', '事件', '事件流及冲击详情。'],
              ['洞察', '审判', '拦截记录及原因。'],
              ['日志', '全部/传教/审判/事件/领地', '按类型过滤的日志。']
            ]
          }
        ]
      }
    ]
  },
  ja: {
    title: 'シミュレーション攻略書',
    subtitle: '操作・システム・パラメータを解説。',
    prev: '← 前へ',
    next: '次へ →',
    chapters: [
      {
        id: 'quick_start',
        label: '1. クイックスタート',
        intro: '通常ランはキャラクター選択とデッキ選択から始まり、自動進行します。',
        sections: [
          {
            title: 'ゲーム開始フロー',
            kind: 'list',
            items: [
              'Start → キャラクター選択画面にランダム生成された5人が表示。',
              '各キャラクターは宗教(14種)と役割(59種)を組み合わせ、固有のカード・Intel・勝利目標を提供。',
              'キャラクター選択後、20種の戦略デッキプリセットまたはランダム36枚(108枚プールから)を選択。',
              'ゲーム開始: 各ラウンドでシグナル変動・イベント・転化・審判を適用。',
              '毎ラウンド自動で+1 Intel。追加はコンボ・イベント・賭けから。'
            ]
          },
          {
            title: '操作パネル',
            kind: 'table',
            headers: ['操作', 'タイプ', '範囲', '説明'],
            rows: [
              ['Start', 'アクション', '単発', 'キャラ選択→デッキ選択→開始。'],
              ['Pause', 'アクション', '単発', 'ループ停止と精算(Ironman除く)。'],
              ['Tick Interval', '数値', '800-10000 ms', '進行速度制御。'],
              ['Use AI', 'トグル', 'On/Off', 'AI強化アクションログと転化提案を有効化。'],
              ['Scenario', '列挙', '4プリセット', 'バランス/高規制/高世俗化/高分極化。'],
              ['シグナルスライダー', '浮動小数', '0.10-0.98', '次ラウンド手動上書き。']
            ]
          }
        ]
      },
      {
        id: 'systems',
        label: '2. シミュレーション構造',
        intro: 'ルール・AI・制度制約・宗教固有能力を組み合わせたモデル。',
        sections: [
          {
            title: '主要システム',
            kind: 'table',
            headers: ['システム', 'タイプ', '更新', '意味'],
            rows: [
              ['転化エンジン', 'Rule/AI/Hybrid', '毎ラウンド', '同化回廊の提案源。'],
              ['宗教審判', 'ガバナンスフィルタ', '毎ラウンド', '正統法廷・禁止令・国家規制で転化を遮断。'],
              ['イベント衝撃', '確率+Boss', '3ラウンド毎', '14種イベント、ナラティブチェーンとプレイヤー決定付き。'],
              ['地域支配', '領域モデル', '毎ラウンド', '所有者・競合・連続支配・ボーナス。'],
              ['Boss危機', '多段レイド', 'R6+発動', '3段階、リアルタイム条件表示。'],
              ['宗教パッシブ', '宗教固有', '毎ラウンド', '14宗教それぞれが1つのシグナルを微調整。'],
              ['弱者ボーナス', '自動', '毎ラウンド', 'シェア<15%で離脱減少、<12%で引力ブースト。'],
              ['イベント-宗教連動', '特性連動', 'イベント発火時', 'マッチ特性>0.5の宗教にボーナス。'],
              ['キャラクターシステム', '役割選択', '各ゲーム', '59役割×14宗教、固有目標とデッキ。']
            ]
          },
          {
            title: '宗教パッシブ能力(14宗教)',
            kind: 'table',
            headers: ['宗教', 'パッシブ', 'シグナル', '方向'],
            rows: [
              ['仏教', '正念の静寂', 'メディア分極化', '↓'],
              ['ヒンドゥー教', '祭典の絆', '社会分断', '↓'],
              ['道教', '道の導き', '意味追求', '↑'],
              ['イスラム教', 'ウンマの連帯', 'ID政治', '↓'],
              ['プロテスタント', 'デジタル布教', 'デジタル化', '↑'],
              ['スパゲッティ教', 'ミーム・ウェーブ', '若年圧力', '↓'],
              ['カトリック', '教区ネットワーク', '制度信頼', '↑'],
              ['神道', '神社の調和', '国家規制', '↓'],
              ['世俗', '理性の潮流', '世俗化', '↑'],
              ['ユダヤ教', '契約のレジリエンス', '経済ストレス', '↓'],
              ['シク教', 'ランガルの結束', '社会分断', '↓'],
              ['東方正教会', '典礼のアンカー', '人口移動', '↓'],
              ['ゾロアスター教', '聖火の継承', '制度信頼', '↑'],
              ['バハイ教', '統一のビジョン', '法的多元性', '↑']
            ]
          },
          {
            title: '読み方のヒント',
            kind: 'list',
            items: [
              'judgmentRatioで制度圧力を確認。',
              'Ghostマイルストーンと比較してペースを把握。',
              'ドロワーの「宗教審判」で遮断記録を確認。',
              'トレンドチャートにホバーで各宗教データ確認、縦線はイベント。',
              'ログフィルター: 布教/審判/イベント/領域。'
            ]
          }
        ]
      },
      {
        id: 'gameplay',
        label: '3. ゲームプレイ層',
        intro: 'シミュレーション上に戦略・リスク・資源管理を重ねます。',
        sections: [
          {
            title: 'メカニクス概要',
            kind: 'table',
            headers: ['要素', 'タイプ', 'コスト/条件', '効果'],
            rows: [
              ['キャラクター', '役割選択', 'ゲーム開始', '59役割×14宗教、固有目標+デッキ+Intelボーナス。'],
              ['戦略デッキ', '108枚プール', '1ゲーム36枚、手札5', '20プリセットまたはランダム。3カードタイプ。'],
              ['コンボ回廊', '受動', '高流量リンク連続', 'コンボとIntel獲得。'],
              ['Intel', '資源', '毎ラウンド+1+コンボ/イベント/賭け', '予測・カード・賭けに使用。'],
              ['リスクベット', '能動', '5 Intel・3ラウンド後精算', '5種のベット。'],
              ['秘密議題', '隠しミッション', '自動判定', '達成でIntel報酬。5種。'],
              ['キャラ目標', '役割目標', '毎ラウンド評価', '達成で+10 Intel + 15コンボ。'],
              ['Boss危機', '多段レイド', 'R6+発動', 'フェーズ中カード/予測が制限。']
            ]
          },
          {
            title: 'カードシステム（108枚・2デッキ）',
            kind: 'table',
            headers: ['タイプ', '枚数', 'メカニクス', '例'],
            rows: [
              ['即時', '73', '即座のシグナル変更', '越境対話、メディア冷却、ユース祭典、聖戦'],
              ['条件付き', '17', '閾値超過で効果倍増', '危機ピボット(分極化>60%)、信頼修復(信頼<35%)、反世俗化(世俗化>70%)'],
              ['持続', '18', '2-3ラウンド自動再適用', '沈黙外交(2R)、和平プロセス(3R)、デジタル帝国(3R)']
            ]
          },
          {
            title: 'デッキA: 外交と安定 (54枚)',
            kind: 'list',
            items: [
              '18枚の信頼・統治カード: 制度信頼、法的多元性、適正手続きを構築。',
              '18枚の冷却・防衛カード: 分極化、分断、ID対立を低減。',
              '9枚の条件カード: 危機時に倍増する緊急対応。',
              '9枚の持続カード: 複数ラウンドの外交・統治改革。'
            ]
          },
          {
            title: 'デッキB: 拡張と攪乱 (54枚)',
            kind: 'list',
            items: [
              '18枚の拡張・テンポカード: 移動、若者、デジタル布教、攻撃的成長。',
              '18枚の攪乱・リスクカード: プロパガンダ、妨害、ID戦争、体制変革。',
              '8枚の条件カード: 危機を利用した攻撃的拡張。',
              '9枚の持続カード: 複数ラウンドの領域キャンペーンとネットワーク構築。',
              '1枚の追加即時フロンティア伝道カード。'
            ]
          },
          {
            title: '戦略デッキプリセット（20種）',
            kind: 'table',
            headers: ['プリセット', 'テーマ', '難度', 'スタイル'],
            rows: [
              ['鉄壁防衛 🛡️', '防御と安定', '普通', '信頼+冷却+統治'],
              ['電撃戦 ⚡', '攻撃的拡張', '難しい', 'テンポ+布教カード'],
              ['平和の織り手 🕊️', '外交と調停', '普通', '対話+紛争解決'],
              ['デジタル帝国 💻', 'テクノロジー', '普通', 'デジタル+メディア+アプリ'],
              ['聖戦 ⚔️', 'ID戦争', 'エキスパート', 'ID+領域支配'],
              ['危機管理者 🚨', '全条件カード', 'エキスパート', '全危機で倍増'],
              ['スロー・バーン 🕰️', '全持続カード', '難しい', '複数ラウンド複利'],
              ['カオス・エージェント 🃏', '最大攪乱', 'エキスパート', '世界が燃えるのを見守る'],
              ['...他12種', '', '', '福祉、学者、シャドウ、復興、若者、法律、移動、ポピュリスト、バランス、エコ、神権、人道']
            ]
          },
          {
            title: 'イベント対応チェック',
            kind: 'list',
            items: [
              '全14ランダムイベントに決定オプション搭載——必ず確認。',
              '分極化イベント後は1-2ラウンド内にデッキAの冷却カードを優先。',
              '信頼ショック時は条件付き信頼修復カード用にIntelを確保。',
              '移動+若年圧力同時上昇? デッキBの移動カード+デッキAの分断制御を併用。',
              '法的多元性0.35未満: 「法の要塞」プリセットか法治系緊急カードを温存。',
              'イベントはマッチ特性の宗教にもボーナス（例: digital_revival → digitalMission高い宗教）。'
            ]
          }
        ]
      },
      {
        id: 'characters',
        label: '4. キャラクター・役割システム',
        intro: '59の役割×14宗教で毎回ユニークなゲームプレイを提供。',
        sections: [
          {
            title: 'キャラクターの仕組み',
            kind: 'list',
            items: [
              'ゲーム開始時にランダム生成された5人のキャラクターが表示。',
              '各役割には: アイコン、推奨カード(デッキに確保)、初期Intel(1-6)、固有勝利目標。',
              'キャラ目標は毎ラウンド評価。達成で+10 Intel、+15コンボスコア。',
              'HUDのキャラバッジが現在の役割を表示、目標達成で緑に変化。',
              'キャラ選択後、デッキプリセット(20種)またはランダムを選択。'
            ]
          },
          {
            title: '役割アーキタイプ（サンプル）',
            kind: 'table',
            headers: ['役割', 'アイコン', 'Intel', '目標タイプ'],
            rows: [
              ['外交官', '🕊️', '4', '多元性を閾値以上でNラウンド維持'],
              ['伝道師', '📢', '2', '1ラウンドで高転化フロー達成'],
              ['審問官', '⚖️', '3', '審判比率を閾値以上に維持'],
              ['戦争領主', '⚔️', '1', '5地域以上を同時支配'],
              ['学者', '📚', '5', '1ランで戦略カード6枚以上使用'],
              ['預言者', '👁️', '4', '3連続ベット勝利'],
              ['スパイ', '🕵️', '6', 'ラウンド10でIntel 25以上保有'],
              ['聖者', '😇', '2', '3目標全て達成'],
              ['...他51種', '', '', 'ヒーラー、守護者、修道士、反逆者、賢者、テンプル騎士、魔女、テクノマンサー等']
            ]
          }
        ]
      },
      {
        id: 'parameters',
        label: '5. パラメータ解説',
        intro: '主要パラメータは正規化されています。',
        sections: [
          {
            title: '重要パラメータ',
            kind: 'table',
            headers: ['パラメータ', '型', '範囲', '影響'],
            rows: [
              ['socialSignals.*', 'Float', '0.10-0.98', '転化と審判を直接変更。'],
              ['exitBarrierWeight', 'Float', '0.68', 'exitBarrierの離脱率への係数。'],
              ['secularBuff', 'Float', '1.55', '高世俗化での世俗の追加魅力。'],
              ['underdogBoost', 'Float', '0-0.25/1.0-1.35', '弱者の逆転メカニクス。'],
              ['scenarioBlendRate', 'Float', '0.16', 'シナリオ目標への漂流速度。'],
              ['events.checkEveryNRounds', 'Int', '3', 'イベント判定頻度。'],
              ['events.maxPerCheck', 'Int', '2', '同時発生イベント上限。']
            ]
          },
          {
            title: 'Bossフェーズ条件',
            kind: 'table',
            headers: ['フェーズ', '条件1', '条件2', '条件3'],
            rows: [
              ['Phase 1', '分断 < 0.74', '信頼 > 0.36', '—'],
              ['Phase 2', '安定地域 >= 4', '競合 <= 2', '分極化 < 0.80'],
              ['Phase 3', '審判比 < 0.50', '多元性 > 0.44', '分断 < 0.78']
            ]
          }
        ]
      },
      {
        id: 'advanced_modes',
        label: '6. 上級モード',
        intro: 'モードにより制約と得点設計が変わります。',
        sections: [
          {
            title: 'モード説明',
            kind: 'list',
            items: [
              'デイリーチャレンジ: 固定seedで全プレイヤー同一条件。',
              'Ironman: 手動停止不可、ラウンド24で自動精算。',
              'Ghost比較: 前回ランと比較。初回はseedゴーストを提供。',
              'HUDの「前回比較」にホバーで説明表示。'
            ]
          },
          {
            title: 'Bossフェーズルール',
            kind: 'table',
            headers: ['フェーズ', '制限', '含意'],
            rows: [
              ['Phase 1', '戦略カード禁止', '基礎システムに依存。'],
              ['Phase 2', '予測解放禁止', '観測ベースで判断。'],
              ['Phase 3', '毎ラウンド追加圧力', '安定化資源が重要。']
            ]
          },
          {
            title: 'ドロワーパネル',
            kind: 'table',
            headers: ['パネル', 'サブタブ', '内容'],
            rows: [
              ['インサイト', '同化', 'フロー、審判比率、回廊、エンジン。'],
              ['インサイト', '地域', '支配・競合・所有者。'],
              ['インサイト', 'イベント', 'イベントフィード（衝撃詳細付き）。'],
              ['インサイト', '審判', '遮断記録と理由。'],
              ['ログ', '全部/布教/審判/イベント/領域', 'タイプ別フィルターログ。']
            ]
          }
        ]
      }
    ]
  }
};
