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
              'UI boards refresh with latest round snapshot and gameplay overlays.'
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
              ['Scenario', 'Enum', '4 presets', 'Sets baseline social-signal targets.'],
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
              ['Religious Judgment', 'Governance filter', 'Per round', 'Blocks part of transfer flow.'],
              ['Event Shock', 'Stochastic + boss', 'Every N rounds', 'Perturbs social signals and decisions.'],
              ['Region Control', 'Territory model', 'Per round', 'Determines ownership, contest status, streak.'],
              ['Boss Crisis', 'Multi-phase raid', 'Triggered conditions', 'Adds phase objectives + hard rules.'],
              ['Ant Links', 'Visual corridor graph', 'Per round', 'Route intensity/speed/friction on map.']
            ]
          },
          {
            title: 'Reading Tips',
            kind: 'list',
            items: [
              'Check roundMetrics.judgmentRatio to see institutional pressure.',
              'Compare totalFlow with ghost milestones for quality pacing.',
              'Use regionControl streak + contested flag to detect front-line instability.'
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
              ['Intel', 'Resource', 'From rounds/combo/events', 'Used by forecast unlock, cards, and bets.'],
              ['Forecast Unlock', 'Action', 'Dynamic Intel cost', 'Reveal hidden forecast corridors.'],
              ['Risk Bet', 'Action', '5 Intel, resolves after 3 rounds', 'High return if prediction is correct.'],
              ['Strategy Deck', 'Action card', 'Card-specific Intel cost', 'Immediate signal delta effects.'],
              ['Secret Agenda', 'Hidden mission', 'Auto-evaluated', 'Bonus Intel when fulfilled.'],
              ['Stage Goals', 'Objective set', 'Per run', 'Up to 3 stars for run evaluation.'],
              ['Achievements', 'Meta unlock', 'Condition-based', 'Permanent profile badges.']
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
              ['chainMultiplier', 'Float', '1 + (chainLength-1)*0.08', 'Scales combo/intel gains from chain system.'],
              ['forecastCost', 'Integer', 'max(7, 12 - perk + ironmanTax)', 'Intel required for each forecast reveal.'],
              ['dailyMultiplier', 'Float', '1.25-1.45 (seeded)', 'Run score multiplier in Daily Challenge.'],
              ['ironmanCap', 'Integer', '24 rounds', 'Auto-settle boundary in Ironman mode.'],
              ['betResolveRound', 'Integer', 'startRound + 3', 'Round index when a bet settles.']
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
              ['bossCrisis.phase/roundsLeft', 'Integer', 'Boss raid stage progression and timer.']
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
              'Daily Challenge: deterministic seed (scenario + signal patch + multiplier).',
              'Ironman: no manual pause loop, stricter pressure and automatic settlement.',
              'Ghost Comparison: compare current run against previous archived run.'
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
              ['Guide book', 'In-app docs', 'Operational and parameter explanations.']
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
              '所有面板会基于最新快照同步刷新。'
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
              ['Scenario', '枚举', '4 个预设', '设定社会信号的场景基线。'],
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
              ['宗教审判', '治理过滤', '每轮', '按制度条件拦截部分转化流。'],
              ['事件冲击', '随机 + Boss', '每 N 轮', '扰动社会信号并触发决策。'],
              ['区域控制', '领地模型', '每轮', '输出归属、争夺态与连控信息。'],
              ['Boss 危机', '多阶段 Raid', '条件触发', '引入阶段目标和硬规则。'],
              ['蚂蚁线链路', '可视图结构', '每轮', '地图上展示强度/速度/摩擦。']
            ]
          },
          {
            title: '阅读建议',
            kind: 'list',
            items: [
              '先看 roundMetrics.judgmentRatio 判断制度压力。',
              '用 totalFlow 与 Ghost 里程碑对比节奏质量。',
              '结合 regionControl.streak 与 contested 识别前线风险。'
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
              ['情报 Intel', '资源', '回合/连击/事件获得', '用于预测解锁、卡牌与下注。'],
              ['预测解锁', '主动操作', '动态 Intel 消耗', '揭示隐藏预测链路。'],
              ['风险下注', '主动操作', '5 Intel，3 轮后结算', '命中可获得高收益。'],
              ['策略卡组', '主动卡牌', '按卡牌消耗 Intel', '立即改变信号参数。'],
              ['秘密议程', '隐藏任务', '自动判定', '达成后奖励额外情报。'],
              ['关卡目标', '目标集', '每局', '最多 3 星，用于局内评级。'],
              ['成就', '元进度', '条件解锁', '永久保留称号与记录。']
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
              ['chainMultiplier', '浮点', '1 + (chainLength-1)*0.08', '放大连锁体系的连击/情报收益。'],
              ['forecastCost', '整数', 'max(7, 12 - perk + ironmanTax)', '每次解锁预测所需情报。'],
              ['dailyMultiplier', '浮点', '1.25-1.45（种子确定）', '每日挑战局分数倍率。'],
              ['ironmanCap', '整数', '24 轮', '铁人模式自动结算上限。'],
              ['betResolveRound', '整数', 'startRound + 3', '下注结算回合。']
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
              ['bossCrisis.phase/roundsLeft', '整数', 'Boss 阶段进度与剩余回合。']
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
              '每日挑战：固定随机种子（场景 + 信号补丁 + 倍率）。',
              '铁人模式：不允许手动暂停、压力更高、自动结算。',
              'Ghost 对照：和上一局归档快照做阶段对比。'
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
              ['指南手册', '内置文档', '操作、类型、参数解释。']
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
              '全ボードは最新スナップショットで再描画されます。'
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
              ['Scenario', '列挙', '4プリセット', '社会シグナルの基準値を設定。'],
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
              ['宗教審判', 'ガバナンスフィルタ', '毎ラウンド', '転化流量の一部を遮断。'],
              ['イベント衝撃', '確率 + Boss', 'Nラウンド毎', 'シグナル揺らぎと意思決定を発生。'],
              ['地域支配', '領域モデル', '毎ラウンド', '所有者・競合・連続支配を出力。'],
              ['Boss危機', '多段レイド', '条件トリガー', '段階目標と強制ルールを追加。'],
              ['アントリンク', '可視化グラフ', '毎ラウンド', '強度/速度/摩擦の地図表示。']
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
              ['情報 Intel', '資源', 'ラウンド/イベント/コンボ', '予測解放・カード・賭けで使用。'],
              ['予測解放', '能動', '動的Intelコスト', '隠れ予測リンクを表示。'],
              ['リスクベット', '能動', '5 Intel・3ラウンド後精算', '命中で高リターン。'],
              ['戦略デッキ', 'カード', 'カード別Intelコスト', 'シグナルへ即時反映。'],
              ['秘密議題', '隠しミッション', '自動判定', '達成時に追加報酬。'],
              ['ステージ目標', '目標セット', '各ラン', '最大3スター評価。'],
              ['実績', 'メタ進行', '条件解除', '恒久バッジを保存。']
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
              ['chainMultiplier', 'Float', '1 + (chainLength-1)*0.08', '連鎖による報酬倍率。'],
              ['forecastCost', 'Integer', 'max(7, 12 - perk + ironmanTax)', '予測解放ごとの必要情報量。'],
              ['dailyMultiplier', 'Float', '1.25-1.45（seed固定）', 'デイリーのスコア倍率。'],
              ['ironmanCap', 'Integer', '24', 'Ironman 自動精算上限。'],
              ['betResolveRound', 'Integer', 'startRound + 3', '賭けの精算ラウンド。']
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
              ['bossCrisis.phase/roundsLeft', 'Integer', 'Boss 段階と残ターン。']
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
              'デイリーチャレンジ：固定seedで条件再現可能。',
              'Ironman：手動停止不可、圧力強化、自動精算。',
              'Ghost比較：前回ランとの里程標比較。'
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
              ['ガイドブック', 'アプリ内文書', '操作・型・パラメータ解説。']
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
