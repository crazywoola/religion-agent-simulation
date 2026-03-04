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
        intro: 'A standard run starts from round 0 and advances automatically by tick interval.',
        sections: [
          {
            title: 'Round Loop',
            kind: 'list',
            items: [
              'Press Start to initialize religions, regions, and strategy states.',
              'Each tick applies social-signal drift, events, transfer plans, and judgments.',
              'UI boards refresh with latest round snapshot and gameplay overlays.',
              'You gain +1 Intel per round automatically, plus bonus from combos, events, and bets.'
            ]
          },
          {
            title: 'Control Panel Operations',
            kind: 'table',
            headers: ['Control', 'Type', 'Range', 'Explanation'],
            rows: [
              ['Start', 'Action', 'One-shot', 'Start/reset a run and begin loop.'],
              ['Pause', 'Action', 'One-shot', 'Stop loop and settle run score (except Ironman).'],
              ['Tick Interval', 'Number', '800-10000 ms', 'Controls simulation speed.'],
              ['Use AI', 'Toggle', 'On/Off', 'Enable/disable AI contribution in transfer/action generation.'],
              ['Scenario', 'Enum', '4 presets', 'Sets baseline social-signal targets (Balanced / High Regulation / High Secularization / High Polarization).'],
              ['Language', 'Enum', 'en / zh-CN / ja', 'Runtime locale switching.'],
              ['Signal Sliders', 'Float', '0.10-0.98', 'Manual one-round signal overrides.']
            ]
          }
        ]
      },
      {
        id: 'systems',
        label: '2. Simulation Systems',
        intro: 'The model combines rule dynamics, optional AI structure, and governance constraints.',
        sections: [
          {
            title: 'Core Systems',
            kind: 'table',
            headers: ['System', 'Type', 'Updated', 'What it means'],
            rows: [
              ['Transfer Engine', 'Rule/AI/Hybrid', 'Per round', 'Source of assimilation corridor proposals.'],
              ['Religious Judgment', 'Governance filter', 'Per round', 'Blocks part of transfer flow based on governance, orthodoxy, and regime pressure.'],
              ['Event Shock', 'Stochastic + boss', 'Every 3 rounds', 'Perturbs social signals; all 14 events have narrative chains and decision options.'],
              ['Region Control', 'Territory model', 'Per round', 'Determines ownership, contest status, streak, and territory bonuses.'],
              ['Boss Crisis', 'Multi-phase raid', 'Triggered at R6+', '3-phase challenge with pass/fail thresholds shown in real-time progress display.'],
              ['Ant Links', 'Visual corridor graph', 'Per round', 'Route intensity/speed/friction on map.'],
              ['Religion Passives', 'Per-religion effect', 'Per round', 'Each religion has a unique passive ability that subtly shifts one social signal.'],
              ['Underdog Bonus', 'Automatic boost', 'Per round', 'Religions below 15% share get reduced churn; below 12% get a pull score boost.'],
              ['Event-Religion Coupling', 'Trait-targeted', 'On event fire', 'Events give temporary outreach bonuses to religions with matching traits above 0.5.']
            ]
          },
          {
            title: 'Religion Passive Abilities',
            kind: 'table',
            headers: ['Religion', 'Passive Name', 'Signal Affected', 'Effect Direction'],
            rows: [
              ['Buddhism', 'Mindful Calm', 'Media Polarization', 'Reduces'],
              ['Hinduism', 'Festival Bond', 'Social Fragmentation', 'Reduces'],
              ['Taoism', 'Way of Nature', 'Meaning Search', 'Increases'],
              ['Islam', 'Ummah Solidarity', 'Identity Politics', 'Reduces'],
              ['Protestant', 'Digital Mission', 'Digitalization', 'Increases'],
              ['Pastafarianism', 'Viral Meme Wave', 'Youth Pressure', 'Reduces'],
              ['Catholicism', 'Parish Network', 'Institutional Trust', 'Increases'],
              ['Shinto', 'Shrine Harmony', 'State Regulation', 'Reduces'],
              ['Secular', 'Rational Tide', 'Secularization', 'Increases']
            ]
          },
          {
            title: 'Reading Tips',
            kind: 'list',
            items: [
              'Check roundMetrics.judgmentRatio to see institutional pressure.',
              'Compare totalFlow with ghost milestones for quality pacing.',
              'Use regionControl streak + contested flag to detect front-line instability.',
              'Open the Judgment subtab in the drawer to see recent tribunal blocks with reasons.',
              'Hover over the follower trend chart to see per-religion values at each round; vertical lines mark event fires.'
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
            title: 'Mechanics',
            kind: 'table',
            headers: ['Mechanic', 'Type', 'Cost / Trigger', 'Result'],
            rows: [
              ['Combo Corridor', 'Passive score', 'High-flow links in sequence', 'Builds combo and Intel gain.'],
              ['Intel', 'Resource', '+1/round base + combo/events/bets', 'Used by forecast unlock, cards, and bets.'],
              ['Forecast Unlock', 'Action', 'Dynamic Intel cost', 'Reveal hidden forecast corridors.'],
              ['Risk Bet', 'Action', '5 Intel, resolves after 3 rounds', 'High return if prediction is correct. 5 bet types available.'],
              ['Strategy Deck', 'Action card', 'Card-specific Intel cost (4-6)', '15 cards total: 10 immediate, 3 conditional, 2 sustained.'],
              ['Secret Agenda', 'Hidden mission', 'Auto-evaluated', 'Bonus Intel when fulfilled. 5 agenda types.'],
              ['Stage Goals', 'Objective set', 'Per run', 'Up to 3 stars for run evaluation.'],
              ['Achievements', 'Meta unlock', 'Condition-based', '5 permanent profile badges with descriptions.']
            ]
          },
          {
            title: 'Card Types',
            kind: 'table',
            headers: ['Type', 'Count', 'Mechanic', 'Examples'],
            rows: [
              ['Immediate', '10', 'One-shot signal deltas applied instantly', 'Bridge Dialogue, Trust Grant, Calm Media'],
              ['Conditional', '3', 'Effect doubles when a signal threshold is met', 'Crisis Pivot (polarization > 60%), Solidarity Surge (economic stress > 50%), Digital Fast (digitalization > 70%)'],
              ['Sustained', '2', 'Deltas re-applied automatically for 2-3 rounds', 'Silent Diplomacy (2 rounds), Grassroots Network (3 rounds)']
            ]
          },
          {
            title: 'Deck Archetype Playbook',
            kind: 'table',
            headers: ['Archetype', 'Typical card line', 'Best timing', 'Trade-off'],
            rows: [
              ['Cooling/Control', 'Calm Media / Ethics Audit / Legal Aid Caravan', 'Before boss checks or after polarization spikes', 'Lower volatility but slower expansion.'],
              ['Trust Stabilizer', 'Trust Grant / Open Data Pulpit / Civic Mediation Lab', 'When judgment ratio rises above 0.30', 'Costs more Intel, requires timing discipline.'],
              ['Tempo Expansion', 'Youth Festival / Migration Corridor / Meaning Retreat', 'When your combo chain is already active', 'Can amplify noise if no follow-up cooling card.'],
              ['Conditional Plays', 'Crisis Pivot / Solidarity Surge / Digital Fast', 'Wait for signal to exceed threshold before playing', 'Wastes hand slot if condition never triggers.'],
              ['Sustained Value', 'Silent Diplomacy / Grassroots Network', 'Before boss phases for multi-round stabilization', 'High Intel cost (6), slow immediate impact.']
            ]
          },
          {
            title: 'Event Response Checklist',
            kind: 'list',
            items: [
              'All 14 random events now offer decision options — always check the event decision card.',
              'If algorithmic/polarization events trigger, prioritize cooling cards within 1-2 rounds.',
              'If trust shock events trigger, preserve Intel for trust stabilizers before betting.',
              'If migration and youth pressure rise together, pair mobility cards with fragmentation control.',
              'When legal pluralism drops below 0.35, reserve one law-oriented card for emergency recovery.',
              'Events also give trait-targeted bonuses: e.g. digital_revival boosts religions with high digitalMission.'
            ]
          }
        ]
      },
      {
        id: 'parameters',
        label: '4. Parameter Reference',
        intro: 'Most values are normalized for easy tuning and interpretation.',
        sections: [
          {
            title: 'Important Parameters',
            kind: 'table',
            headers: ['Parameter', 'Type', 'Range / Formula', 'Effect'],
            rows: [
              ['socialSignals.*', 'Float', '0.10-0.98', 'Directly changes transfer and judgment dynamics.'],
              ['exitBarrierWeight', 'Float', 'Default 0.68', 'Coefficient for how much exitBarrier reduces churn.'],
              ['secularBuff', 'Float', 'Default 1.55', 'Extra attractiveness multiplier for secularism in high-secularization environments.'],
              ['underdogChurnReduction', 'Float', '0-0.25', 'Religions below 15% share get reduced churn (automatic comeback mechanic).'],
              ['underdogPullBoost', 'Float', '1.0-1.35', 'Religions below 12% share get up to 35% pull score bonus.'],
              ['chainMultiplier', 'Float', '1 + (chainLength-1)*0.08', 'Scales combo/intel gains from chain system.'],
              ['forecastCost', 'Integer', 'max(7, 12 - perk + ironmanTax)', 'Intel required for each forecast reveal.'],
              ['dailyMultiplier', 'Float', '1.25-1.45 (seeded)', 'Run score multiplier in Daily Challenge.'],
              ['ironmanCap', 'Integer', '24 rounds', 'Auto-settle boundary in Ironman mode.'],
              ['betResolveRound', 'Integer', 'startRound + 3', 'Round index when a bet settles.'],
              ['events.checkEveryNRounds', 'Integer', 'Default 3', 'Frequency of random event checks.'],
              ['events.decayPerRound', 'Float', 'Default 0.18', 'How fast event shocks fade each round.'],
              ['events.maxPerCheck', 'Integer', 'Default 2', 'Upper bound of concurrent random events.'],
              ['scenarioBlendRate', 'Float', 'Default 0.16', 'Speed at which signals drift toward scenario targets.']
            ]
          },
          {
            title: 'Boss Phase Pass Conditions',
            kind: 'table',
            headers: ['Phase', 'Condition 1', 'Condition 2', 'Condition 3'],
            rows: [
              ['Phase 1', 'socialFragmentation < 0.74', 'institutionalTrust > 0.36', '—'],
              ['Phase 2', 'stableRegions >= 4', 'contestedRegions <= 2', 'mediaPolarization < 0.80'],
              ['Phase 3', 'judgmentRatio < 0.50', 'legalPluralism > 0.44', 'socialFragmentation < 0.78']
            ]
          },
          {
            title: 'Snapshot Fields to Watch',
            kind: 'table',
            headers: ['Field', 'Type', 'Interpretation'],
            rows: [
              ['roundMetrics.totalFlow', 'Integer', 'Total successful transfer amount this round.'],
              ['roundMetrics.judgmentRatio', 'Float', 'Share of flow blocked by judgments.'],
              ['structureOutput.antLinks[].friction', 'Float', 'Route resistance between regions.'],
              ['regionControl[].control', 'Float', 'Current ownership strength in region.'],
              ['bossCrisis.phase/roundsLeft', 'Integer', 'Boss raid stage progression and timer.'],
              ['bossCrisis.phaseProgress', 'Object', 'Real-time pass/fail status for each boss condition.'],
              ['religions[].passive', 'Object', 'The passive ability and its signal effect for each religion.']
            ]
          }
        ]
      },
      {
        id: 'advanced_modes',
        label: '5. Advanced Modes',
        intro: 'Modes change strategy constraints and scoring expectations.',
        sections: [
          {
            title: 'Mode Explanations',
            kind: 'list',
            items: [
              'Daily Challenge: deterministic seed (scenario + signal patch + multiplier). Consistent across all players on the same day.',
              'Ironman: no manual pause loop, stricter pressure and automatic settlement at round 24.',
              'Ghost Comparison: compare current run against previous archived run. A seed ghost run is provided for first-time players.',
              'Hover over "Vs Ghost" in the HUD for an explanation of how ghost comparison works.'
            ]
          },
          {
            title: 'Boss Raid Phase Rules',
            kind: 'table',
            headers: ['Phase', 'Locked Operation', 'Strategic implication'],
            rows: [
              ['Phase 1', 'Strategy cards disabled', 'Rely on baseline systems and event choices.'],
              ['Phase 2', 'Forecast unlock disabled', 'Use observed corridors instead of revealed forecasts.'],
              ['Phase 3', 'Extra pressure each round', 'Stability resources become critical.']
            ]
          },
          {
            title: 'Drawer Panels',
            kind: 'table',
            headers: ['Panel', 'Subtab', 'What it shows'],
            rows: [
              ['Insights', 'Assimilation', 'Map insights: scenario, flow, judgment ratio, corridors, engine.'],
              ['Insights', 'Regions', 'Regional landscape: control, competition, ownership.'],
              ['Insights', 'Events', 'Breaking events feed with shock details.'],
              ['Insights', 'Judgment', 'Recent tribunal blocks with from/to religion, blocked amount, reasons.'],
              ['Logs', 'All/Mission/Judgment', 'Mission logs filtered by type.']
            ]
          }
        ]
      },
      {
        id: 'settings_data',
        label: '6. Settings & Data',
        intro: 'Use in-game settings and local archive tools to manage each run.',
        sections: [
          {
            title: 'Interface Actions',
            kind: 'table',
            headers: ['Action', 'Type', 'Output'],
            rows: [
              ['Screenshot button', 'Canvas export', 'PNG file named by round.'],
              ['Report button', 'Document export', 'Academic-style PDF report.'],
              ['Guide book', 'In-app docs', 'Operational and parameter explanations.'],
              ['Chart hover', 'Interactive', 'Tooltip showing per-religion follower values at any point on the timeline.']
            ]
          },
          {
            title: 'Settings & Storage',
            kind: 'table',
            headers: ['Item', 'Type', 'Explanation'],
            rows: [
              ['Game Settings', 'Panel', 'Language, AI usage, simulation speed, and scenario controls.'],
              ['Restart button', 'Action', 'Start a fresh run while preserving archived records.'],
              ['Run Storage', 'IndexedDB', 'Store run records and round snapshots on this device.'],
              ['Clear Saved Data', 'Action', 'Remove local run data, snapshots, and meta progression.']
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
        intro: '标准对局从第 0 轮开始，按照轮询间隔自动推进。',
        sections: [
          {
            title: '回合循环',
            kind: 'list',
            items: [
              '点击 Start 初始化宗教、区域和策略状态。',
              '每一轮依次处理信号漂移、事件冲击、转化计划与宗教审判。',
              '所有面板会基于最新快照同步刷新。',
              '每回合自动获得 +1 Intel，额外 Intel 来自连击、事件和下注。'
            ]
          },
          {
            title: '控制区操作说明',
            kind: 'table',
            headers: ['控件', '类型', '范围', '解释'],
            rows: [
              ['Start', '操作按钮', '单次触发', '启动/重置对局并进入循环。'],
              ['Pause', '操作按钮', '单次触发', '停止循环并结算当前局（铁人模式除外）。'],
              ['Tick Interval', '数值参数', '800-10000 ms', '控制模拟推进速度。'],
              ['Use AI', '布尔开关', 'On/Off', '是否启用 AI 对转化与行动生成的贡献。'],
              ['Scenario', '枚举', '4 个预设', '设定社会信号的场景基线（平衡/高监管/高世俗化/高极化）。'],
              ['Language', '枚举', 'en / zh-CN / ja', '运行时切换界面语言。'],
              ['信号滑条', '浮点参数', '0.10-0.98', '对下一轮信号进行手动覆盖。']
            ]
          }
        ]
      },
      {
        id: 'systems',
        label: '2. 模拟系统',
        intro: '模型融合规则驱动、可选 AI 结构与制度治理约束。',
        sections: [
          {
            title: '核心系统类型',
            kind: 'table',
            headers: ['系统', '类型', '更新频率', '含义'],
            rows: [
              ['转化引擎', 'Rule/AI/Hybrid', '每轮', '决定同化走廊的来源。'],
              ['宗教审判', '治理过滤', '每轮', '根据治理、正统性和政权压力拦截转化流。'],
              ['事件冲击', '随机 + Boss', '每 3 轮', '扰动社会信号；全部 14 个事件均有叙事链和决策选项。'],
              ['区域控制', '领地模型', '每轮', '输出归属、争夺态、连控与领地加成。'],
              ['Boss 危机', '多阶段 Raid', 'R6+ 触发', '3 阶段挑战，通过/失败条件实时显示进度。'],
              ['蚂蚁线链路', '可视图结构', '每轮', '地图上展示强度/速度/摩擦。'],
              ['宗教被动', '各教特效', '每轮', '每个宗教拥有独特被动能力，微调一项社会信号。'],
              ['弱势补偿', '自动加成', '每轮', '份额低于 15% 的宗教减少流失；低于 12% 获得拉力加成。'],
              ['事件-宗教耦合', '特质联动', '事件触发时', '事件为匹配特质超 0.5 的宗教提供临时传播加成。']
            ]
          },
          {
            title: '宗教被动能力',
            kind: 'table',
            headers: ['宗教', '被动名称', '影响信号', '方向'],
            rows: [
              ['佛教', '正念沉静', '舆论极化', '降低'],
              ['印度教', '节庆纽带', '社会碎片化', '降低'],
              ['道教', '道法自然', '意义追寻', '提升'],
              ['伊斯兰教', '乌玛团结', '身份政治', '降低'],
              ['基督教', '数字布道', '数字化', '提升'],
              ['飞天面条神教', '梗潮传播', '青年压力', '降低'],
              ['天主教', '教区网络', '制度信任', '提升'],
              ['神道教', '神社和谐', '国家监管', '降低'],
              ['世俗主义', '理性潮流', '世俗化', '提升']
            ]
          },
          {
            title: '阅读建议',
            kind: 'list',
            items: [
              '先看 roundMetrics.judgmentRatio 判断制度压力。',
              '用 totalFlow 与 Ghost 里程碑对比节奏质量。',
              '结合 regionControl.streak 与 contested 识别前线风险。',
              '打开抽屉面板的"宗教审判"子标签，查看最近拦截记录和原因。',
              '将鼠标悬停在信众趋势图上可查看各宗教数据；竖线标记事件触发时刻。'
            ]
          }
        ]
      },
      {
        id: 'gameplay',
        label: '3. 玩法系统',
        intro: '玩法层在模拟基础上加入节奏、风险与资源管理。',
        sections: [
          {
            title: '玩法机制与效果',
            kind: 'table',
            headers: ['机制', '类型', '成本/触发', '效果'],
            rows: [
              ['连锁走廊', '被动计分', '高流量链路连续命中', '提升连击并增加情报收益。'],
              ['情报 Intel', '资源', '每轮 +1 基础 + 连击/事件/下注', '用于预测解锁、卡牌与下注。'],
              ['预测解锁', '主动操作', '动态 Intel 消耗', '揭示隐藏预测链路。'],
              ['风险下注', '主动操作', '5 Intel，3 轮后结算', '命中可获得高收益。5 种下注类型。'],
              ['策略卡组', '主动卡牌', '按卡牌消耗 Intel（4-6）', '共 15 张：10 即时、3 条件、2 持续。'],
              ['秘密议程', '隐藏任务', '自动判定', '达成后奖励额外情报。5 种议程。'],
              ['关卡目标', '目标集', '每局', '最多 3 星，用于局内评级。'],
              ['成就', '元进度', '条件解锁', '5 个永久称号，含描述。']
            ]
          },
          {
            title: '卡牌类型',
            kind: 'table',
            headers: ['类型', '数量', '机制', '示例'],
            rows: [
              ['即时', '10', '一次性信号修正立即生效', '跨域对话、信任补助、媒体冷却'],
              ['条件', '3', '信号超过阈值时效果翻倍', '危机转向（极化 > 60%）、团结浪潮（经济压力 > 50%）、数字斋戒（数字化 > 70%）'],
              ['持续', '2', '效果自动重复施加 2-3 轮', '静默外交（2 轮）、草根网络（3 轮）']
            ]
          },
          {
            title: '卡组流派与时机',
            kind: 'table',
            headers: ['流派', '代表卡线', '最佳时机', '代价'],
            rows: [
              ['降温控制', '媒体冷却 / 伦理审计 / 巡回法援', 'Boss 判定前或极化事件后', '扩张速度放缓。'],
              ['信任稳态', '信任补助 / 开放数据讲坛 / 调解实验室', '审判比超过 30% 时', 'Intel 消耗较高。'],
              ['节奏扩张', '青年节拍 / 迁徙走廊 / 意义共修营', '连击已成型的中盘', '若无后续降温会放大噪声。'],
              ['条件打法', '危机转向 / 团结浪潮 / 数字斋戒', '等信号超过阈值后再打出', '若条件未达成则浪费手牌位。'],
              ['持续价值', '静默外交 / 草根网络', 'Boss 前打出获取多轮稳定效果', 'Intel 成本高（6），即时效果弱。']
            ]
          },
          {
            title: '事件应对清单',
            kind: 'list',
            items: [
              '全部 14 个随机事件现均提供决策选项——务必关注事件决策卡。',
              '触发算法/极化事件后，建议 1-2 轮内优先打出降温卡。',
              '若出现信任负面冲击，先保留 Intel 打稳态卡，再考虑下注。',
              '当迁移与青年压力同步上升时，优先联动迁移卡与碎片化控制卡。',
              '法律多元低于 0.35 时，保留至少一张法治向卡做紧急修复。',
              '事件还会给特质匹配的宗教带来临时传播加成，如 digital_revival 加成高数字布道的宗教。'
            ]
          }
        ]
      },
      {
        id: 'parameters',
        label: '4. 参数说明',
        intro: '大部分参数归一化，便于理解和调参。',
        sections: [
          {
            title: '关键参数',
            kind: 'table',
            headers: ['参数', '类型', '范围 / 公式', '影响'],
            rows: [
              ['socialSignals.*', '浮点', '0.10-0.98', '直接影响转化与审判强度。'],
              ['exitBarrierWeight', '浮点', '默认 0.68', 'exitBarrier 对流失率的影响系数。'],
              ['secularBuff', '浮点', '默认 1.55', '高世俗化环境下世俗主义的额外吸引力倍率。'],
              ['underdogChurnReduction', '浮点', '0-0.25', '份额低于 15% 的宗教流失率自动减少（逆袭机制）。'],
              ['underdogPullBoost', '浮点', '1.0-1.35', '份额低于 12% 的宗教获得最高 35% 的拉力加成。'],
              ['chainMultiplier', '浮点', '1 + (chainLength-1)*0.08', '放大连锁体系的连击/情报收益。'],
              ['forecastCost', '整数', 'max(7, 12 - perk + ironmanTax)', '每次解锁预测所需情报。'],
              ['dailyMultiplier', '浮点', '1.25-1.45（种子确定）', '每日挑战局分数倍率。'],
              ['ironmanCap', '整数', '24 轮', '铁人模式自动结算上限。'],
              ['betResolveRound', '整数', 'startRound + 3', '下注结算回合。'],
              ['events.checkEveryNRounds', '整数', '默认 3', '随机事件的检查频率。'],
              ['events.decayPerRound', '浮点', '默认 0.18', '事件冲击每轮衰减速度。'],
              ['events.maxPerCheck', '整数', '默认 2', '单次检查可并发触发的事件上限。'],
              ['scenarioBlendRate', '浮点', '默认 0.16', '信号向场景目标漂移的速度。']
            ]
          },
          {
            title: 'Boss 阶段通过条件',
            kind: 'table',
            headers: ['阶段', '条件 1', '条件 2', '条件 3'],
            rows: [
              ['Phase 1', 'socialFragmentation < 0.74', 'institutionalTrust > 0.36', '—'],
              ['Phase 2', '稳定区域 >= 4', '争夺区域 <= 2', 'mediaPolarization < 0.80'],
              ['Phase 3', '审判比 < 0.50', 'legalPluralism > 0.44', 'socialFragmentation < 0.78']
            ]
          },
          {
            title: '建议重点观察字段',
            kind: 'table',
            headers: ['字段', '类型', '解释'],
            rows: [
              ['roundMetrics.totalFlow', '整数', '本轮成功转化总量。'],
              ['roundMetrics.judgmentRatio', '浮点', '本轮被审判拦截的流量占比。'],
              ['structureOutput.antLinks[].friction', '浮点', '区域间迁移路径摩擦。'],
              ['regionControl[].control', '浮点', '区域控制强度。'],
              ['bossCrisis.phase/roundsLeft', '整数', 'Boss 阶段进度与剩余回合。'],
              ['bossCrisis.phaseProgress', '对象', 'Boss 每个条件的实时通过/失败状态。'],
              ['religions[].passive', '对象', '每个宗教的被动能力及其信号效果。']
            ]
          }
        ]
      },
      {
        id: 'advanced_modes',
        label: '5. 高阶模式',
        intro: '高阶模式会改变约束条件和评分策略。',
        sections: [
          {
            title: '模式说明',
            kind: 'list',
            items: [
              '每日挑战：固定随机种子（场景 + 信号补丁 + 倍率），同一天全球一致。',
              '铁人模式：不允许手动暂停、压力更高、第 24 轮自动结算。',
              'Ghost 对照：和上一局归档快照做阶段对比。首次游戏提供内置种子 Ghost 数据。',
              '将鼠标悬停在 HUD 的"对比上局"上可查看 Ghost 机制说明。'
            ]
          },
          {
            title: 'Boss 阶段规则',
            kind: 'table',
            headers: ['阶段', '封锁操作', '策略含义'],
            rows: [
              ['Phase 1', '禁用策略卡', '依靠基础系统和事件抉择过渡。'],
              ['Phase 2', '禁用预测解锁', '依赖实时观测链路而非提前揭示。'],
              ['Phase 3', '每轮追加压制', '稳定性资源和节奏控制更关键。']
            ]
          },
          {
            title: '抽屉面板一览',
            kind: 'table',
            headers: ['面板', '子标签', '显示内容'],
            rows: [
              ['洞察', '同化链路', '地图洞察：场景、流量、审判比、走廊、引擎。'],
              ['洞察', '区域格局', '区域格局：控制、竞争、归属。'],
              ['洞察', '突发事件', '突发事件流，含冲击详情。'],
              ['洞察', '宗教审判', '最近审判拦截记录：来源/目标宗教、拦截量、原因。'],
              ['日志', '全部/传教/审判', '按类型过滤的任务日志。']
            ]
          }
        ]
      },
      {
        id: 'settings_data',
        label: '6. 设置与存档',
        intro: '通过游戏设置与本地存档管理不同对局和快照。',
        sections: [
          {
            title: '界面操作',
            kind: 'table',
            headers: ['操作', '类型', '输出'],
            rows: [
              ['截图按钮', 'Canvas 导出', '以回合命名的 PNG 文件。'],
              ['报告按钮', '文档导出', '学术风格 PDF 报告。'],
              ['指南手册', '内置文档', '操作、类型、参数解释。'],
              ['图表悬停', '交互功能', '在趋势图任意位置显示各宗教信众数值。']
            ]
          },
          {
            title: '设置与数据',
            kind: 'table',
            headers: ['项目', '类型', '说明'],
            rows: [
              ['游戏设置', '设置面板', '集中管理语言、AI 开关、速度与场景配置。'],
              ['Restart 按钮', '操作按钮', '立刻重开新局，并保留历史对局记录。'],
              ['对局存档', 'IndexedDB', '在本地保存不同对局与每轮快照。'],
              ['清除数据', '操作按钮', '一键清除本地对局存档、快照与成长数据。']
            ]
          }
        ]
      }
    ]
  },
  ja: {
    title: 'シミュレーション攻略書',
    subtitle: '操作・システム・パラメータを多言語で解説。',
    prev: '← 前へ',
    next: '次へ →',
    chapters: [
      {
        id: 'quick_start',
        label: '1. クイックスタート',
        intro: '通常ランはラウンド 0 から開始し、ティック間隔で自動進行します。',
        sections: [
          {
            title: 'ラウンド進行',
            kind: 'list',
            items: [
              'Start で宗教・地域・戦略状態を初期化。',
              '各ラウンドでシグナル変動、イベント、転化計画、審判を適用。',
              '全ボードは最新スナップショットで再描画されます。',
              '毎ラウンド自動で +1 Intel を獲得。追加はコンボ・イベント・賭けから。'
            ]
          },
          {
            title: '操作パネル',
            kind: 'table',
            headers: ['操作', 'タイプ', '範囲', '説明'],
            rows: [
              ['Start', 'アクション', '単発', 'ラン開始/リセット。'],
              ['Pause', 'アクション', '単発', 'ループ停止とラン精算（Ironman除く）。'],
              ['Tick Interval', '数値', '800-10000 ms', '進行速度を制御。'],
              ['Use AI', 'トグル', 'On/Off', 'AI寄与の有効/無効。'],
              ['Scenario', '列挙', '4プリセット', '社会シグナルの基準値を設定（バランス/高規制/高世俗化/高分極化）。'],
              ['Language', '列挙', 'en / zh-CN / ja', '実行中にUI言語切替。'],
              ['シグナルスライダー', '浮動小数', '0.10-0.98', '次ラウンド用の手動上書き。']
            ]
          }
        ]
      },
      {
        id: 'systems',
        label: '2. シミュレーション構造',
        intro: 'ルール計算、AI構造、制度フィルタを組み合わせたモデルです。',
        sections: [
          {
            title: '主要システム',
            kind: 'table',
            headers: ['システム', 'タイプ', '更新', '意味'],
            rows: [
              ['転化エンジン', 'Rule/AI/Hybrid', '毎ラウンド', '同化回廊の提案源。'],
              ['宗教審判', 'ガバナンスフィルタ', '毎ラウンド', '治理・正統性・政権圧力により転化流量を遮断。'],
              ['イベント衝撃', '確率 + Boss', '3ラウンド毎', 'シグナル揺らぎ; 14イベント全てにナラティブチェーンと決定オプション付き。'],
              ['地域支配', '領域モデル', '毎ラウンド', '所有者・競合・連続支配・領域ボーナスを出力。'],
              ['Boss危機', '多段レイド', 'R6+で発動', '3段階チャレンジ; 通過/失敗条件をリアルタイム進捗表示。'],
              ['アントリンク', '可視化グラフ', '毎ラウンド', '強度/速度/摩擦の地図表示。'],
              ['宗教パッシブ', '宗教固有効果', '毎ラウンド', '各宗教が固有のパッシブ能力で1つの社会シグナルを微調整。'],
              ['弱者ボーナス', '自動ブースト', '毎ラウンド', 'シェア15%未満で離脱減少; 12%未満で引力ブースト。'],
              ['イベント-宗教連動', '特性連動', 'イベント発火時', 'マッチする特性0.5超の宗教に一時的な布教ボーナスを付与。']
            ]
          },
          {
            title: '宗教パッシブ能力',
            kind: 'table',
            headers: ['宗教', 'パッシブ名', '影響シグナル', '方向'],
            rows: [
              ['仏教', '正念の静寂', 'メディア分極化', '低下'],
              ['ヒンドゥー教', '祭典の絆', '社会分断', '低下'],
              ['道教', '道の導き', '意味追求', '上昇'],
              ['イスラム教', 'ウンマの連帯', 'アイデンティティ政治', '低下'],
              ['プロテスタント', 'デジタル布教', 'デジタル化', '上昇'],
              ['スパゲッティ教', 'ミーム・ウェーブ', '若年層圧力', '低下'],
              ['カトリック', '教区ネットワーク', '制度信頼', '上昇'],
              ['神道', '神社の調和', '国家規制', '低下'],
              ['世俗', '理性の潮流', '世俗化', '上昇']
            ]
          },
          {
            title: '読み方のヒント',
            kind: 'list',
            items: [
              'roundMetrics.judgmentRatio で制度圧力を確認。',
              'totalFlow と Ghost マイルストーンで進行ペースを比較。',
              'regionControl の streak と contested で前線の不安定さを検知。',
              'ドロワーの「宗教審判」サブタブで最近の遮断記録と理由を確認。',
              '信徒トレンドチャートにマウスを合わせると各宗教の数値を確認可能; 縦線はイベント発生タイミング。'
            ]
          }
        ]
      },
      {
        id: 'gameplay',
        label: '3. ゲームプレイ層',
        intro: 'シミュレーション上にタイミング・リスク・資源管理を重ねます。',
        sections: [
          {
            title: '主要メカニクス',
            kind: 'table',
            headers: ['要素', 'タイプ', 'コスト/条件', '効果'],
            rows: [
              ['コンボ回廊', '受動', '高流量リンク連続', 'コンボと情報獲得が増加。'],
              ['情報 Intel', '資源', '毎ラウンド+1基本 + コンボ/イベント/賭け', '予測解放・カード・賭けで使用。'],
              ['予測解放', '能動', '動的Intelコスト', '隠れ予測リンクを表示。'],
              ['リスクベット', '能動', '5 Intel・3ラウンド後精算', '命中で高リターン。5種類。'],
              ['戦略デッキ', 'カード', 'カード別Intel(4-6)', '計15枚: 即時10・条件3・持続2。'],
              ['秘密議題', '隠しミッション', '自動判定', '達成時に追加報酬。5種類。'],
              ['ステージ目標', '目標セット', '各ラン', '最大3スター評価。'],
              ['実績', 'メタ進行', '条件解除', '5つの恒久バッジ（説明付き）。']
            ]
          },
          {
            title: 'カードタイプ',
            kind: 'table',
            headers: ['タイプ', '枚数', 'メカニクス', '例'],
            rows: [
              ['即時', '10', '即座にシグナルを変更', '越境対話、信頼助成、メディア冷却'],
              ['条件付き', '3', 'シグナル閾値超過で効果倍増', '危機ピボット(分極化>60%)、連帯サージ(経済ストレス>50%)、デジタル断食(デジタル化>70%)'],
              ['持続', '2', '2-3ラウンド自動でデルタ再適用', '沈黙外交(2ラウンド)、草の根ネットワーク(3ラウンド)']
            ]
          },
          {
            title: 'デッキ型と運用タイミング',
            kind: 'table',
            headers: ['型', '代表カード列', '最適タイミング', 'トレードオフ'],
            rows: [
              ['冷却/制御', 'メディア冷却 / 倫理監査 / 移動リーガル支援隊', 'Boss判定前・分極化イベント後', '拡張速度は落ちる。'],
              ['信頼安定', '信頼助成 / オープンデータ講壇 / 市民調停ラボ', '審判比率が30%超の局面', 'Intel消費が重い。'],
              ['テンポ拡張', 'ユース祭典 / 移動コリドー / 意味リトリート', '中盤でコンボが伸びた時', '冷却札が無いとノイズ増幅。'],
              ['条件プレイ', '危機ピボット / 連帯サージ / デジタル断食', 'シグナルが閾値を超えてから使用', '条件未達なら手札枠の無駄。'],
              ['持続価値', '沈黙外交 / 草の根ネットワーク', 'Bossフェーズ前に複数ラウンド安定化', 'Intelコスト高(6)、即時効果は弱い。']
            ]
          },
          {
            title: 'イベント対応チェック',
            kind: 'list',
            items: [
              '全14ランダムイベントに決定オプション搭載——イベント決定カードを必ず確認。',
              'アルゴリズム反響・分極化イベント後は1-2ラウンド内に冷却カードを優先。',
              '信頼ショック発生時は賭けより先に安定化カードへIntelを確保。',
              '移動と若年圧力が同時上昇したら、移動カードと分断抑制を同時運用。',
              '法的多元性が0.35未満なら、法治系カードを1枚温存。',
              'イベントは特性マッチの宗教にも一時的な布教ボーナスを付与（例: digital_revivalはdigitalMissionの高い宗教を強化）。'
            ]
          }
        ]
      },
      {
        id: 'parameters',
        label: '4. パラメータ解説',
        intro: '主要パラメータは正規化され、比較しやすく設計されています。',
        sections: [
          {
            title: '重要パラメータ',
            kind: 'table',
            headers: ['パラメータ', '型', '範囲 / 式', '影響'],
            rows: [
              ['socialSignals.*', 'Float', '0.10-0.98', '転化と審判の強度を直接変更。'],
              ['exitBarrierWeight', 'Float', '既定 0.68', 'exitBarrierの離脱率への影響係数。'],
              ['secularBuff', 'Float', '既定 1.55', '高世俗化環境での世俗主義の追加魅力倍率。'],
              ['underdogChurnReduction', 'Float', '0-0.25', 'シェア15%未満の宗教の離脱率自動減少（逆転メカニクス）。'],
              ['underdogPullBoost', 'Float', '1.0-1.35', 'シェア12%未満の宗教に最大35%の引力ブースト。'],
              ['chainMultiplier', 'Float', '1 + (chainLength-1)*0.08', '連鎖による報酬倍率。'],
              ['forecastCost', 'Integer', 'max(7, 12 - perk + ironmanTax)', '予測解放ごとの必要情報量。'],
              ['dailyMultiplier', 'Float', '1.25-1.45（seed固定）', 'デイリーのスコア倍率。'],
              ['ironmanCap', 'Integer', '24', 'Ironman 自動精算上限。'],
              ['betResolveRound', 'Integer', 'startRound + 3', '賭けの精算ラウンド。'],
              ['events.checkEveryNRounds', 'Integer', '既定 3', 'ランダムイベント判定の頻度。'],
              ['events.decayPerRound', 'Float', '既定 0.18', 'イベント衝撃のラウンド減衰率。'],
              ['events.maxPerCheck', 'Integer', '既定 2', '同時発生イベント数の上限。'],
              ['scenarioBlendRate', 'Float', '既定 0.16', 'シグナルがシナリオ目標へ漂流する速度。']
            ]
          },
          {
            title: 'Bossフェーズ通過条件',
            kind: 'table',
            headers: ['フェーズ', '条件1', '条件2', '条件3'],
            rows: [
              ['Phase 1', 'socialFragmentation < 0.74', 'institutionalTrust > 0.36', '—'],
              ['Phase 2', '安定地域 >= 4', '競合地域 <= 2', 'mediaPolarization < 0.80'],
              ['Phase 3', '審判比 < 0.50', 'legalPluralism > 0.44', 'socialFragmentation < 0.78']
            ]
          },
          {
            title: '監視推奨フィールド',
            kind: 'table',
            headers: ['フィールド', '型', '解釈'],
            rows: [
              ['roundMetrics.totalFlow', 'Integer', '当ラウンド成功転化量。'],
              ['roundMetrics.judgmentRatio', 'Float', '審判で遮断された比率。'],
              ['structureOutput.antLinks[].friction', 'Float', '地域間経路摩擦。'],
              ['regionControl[].control', 'Float', '地域支配強度。'],
              ['bossCrisis.phase/roundsLeft', 'Integer', 'Boss 段階と残ターン。'],
              ['bossCrisis.phaseProgress', 'Object', 'Boss各条件のリアルタイム通過/失敗状態。'],
              ['religions[].passive', 'Object', '各宗教のパッシブ能力とシグナル効果。']
            ]
          }
        ]
      },
      {
        id: 'advanced_modes',
        label: '5. 上級モード',
        intro: 'モードにより制約と得点設計が変わります。',
        sections: [
          {
            title: 'モード説明',
            kind: 'list',
            items: [
              'デイリーチャレンジ：固定seedで条件再現可能。同日なら全プレイヤー同一条件。',
              'Ironman：手動停止不可、圧力強化、ラウンド24で自動精算。',
              'Ghost比較：前回ランとの里程標比較。初回プレイヤーには組み込みseedゴーストを提供。',
              'HUDの「前回比較」にマウスを合わせるとゴースト機能の説明を表示。'
            ]
          },
          {
            title: 'Boss フェーズルール',
            kind: 'table',
            headers: ['フェーズ', '制限操作', '戦術含意'],
            rows: [
              ['Phase 1', '戦略カード禁止', '基礎システム運用が中心。'],
              ['Phase 2', '予測解放禁止', '観測ベースで判断する必要。'],
              ['Phase 3', '毎ラウンド追加圧力', '安定化資源の管理が重要。']
            ]
          },
          {
            title: 'ドロワーパネル一覧',
            kind: 'table',
            headers: ['パネル', 'サブタブ', '表示内容'],
            rows: [
              ['インサイト', '同化', 'マップ洞察: シナリオ、フロー、審判比率、回廊、エンジン。'],
              ['インサイト', '地域', '地域勢力図: 支配・競合・所有者。'],
              ['インサイト', 'イベント', '突発イベントフィード（衝撃詳細付き）。'],
              ['インサイト', '宗教審判', '最近の審判遮断記録: 発信/対象宗教、遮断量、理由。'],
              ['ログ', 'すべて/布教/審判', 'タイプ別にフィルターされたミッションログ。']
            ]
          }
        ]
      },
      {
        id: 'settings_data',
        label: '6. 設定と保存',
        intro: 'ゲーム設定とローカル保存でラン履歴とスナップショットを管理します。',
        sections: [
          {
            title: '画面アクション',
            kind: 'table',
            headers: ['操作', 'タイプ', '出力'],
            rows: [
              ['スクリーンショット', 'Canvas出力', 'ラウンド名付き PNG。'],
              ['レポート', '文書出力', '学術スタイル PDF。'],
              ['ガイドブック', 'アプリ内文書', '操作・型・パラメータ解説。'],
              ['チャートホバー', 'インタラクティブ', 'トレンドチャート上で各宗教の信徒数値を表示。']
            ]
          },
          {
            title: '設定とデータ',
            kind: 'table',
            headers: ['項目', 'タイプ', '説明'],
            rows: [
              ['ゲーム設定', 'パネル', '言語、AI、速度、シナリオなどを管理。'],
              ['Restart ボタン', 'アクション', '履歴を保持しつつ新しいランを開始。'],
              ['ラン保存', 'IndexedDB', 'ローカルに対局履歴と各ラウンドの快照を保存。'],
              ['データ消去', 'アクション', 'ローカル保存データと進行キャッシュを削除。']
            ]
          }
        ]
      }
    ]
  }
};
