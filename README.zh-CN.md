<div align="center">

# 宗教 Agent 地图模拟器

基于 OpenAI 兼容模型与 Three.js 的多宗教同化传播仿真系统。

[English](./README.md) | 简体中文 | [日本語](./README.ja.md)

</div>

## 项目概览
本项目模拟不同宗教 Agent 在社会信号、区域环境、制度约束与突发事件影响下的信徒迁移过程，并保持总信徒数恒定。

## 全局截图
![Full game screenshot](./assets/full-game-screenshot.png)

## 当前功能
- 8 个宗教 Agent（含教义、治理参数、特征参数、区域亲和度、历史轨迹）。
- 总人数恒定约束（跨宗教迁移，不增减总量）。
- 场景系统：`balanced`、`high_regulation`、`high_secularization`、`high_polarization`。
- 动态事件系统（含持续冲击与衰减）。
- 领地控制模型（`regionControl`）与迁移路径摩擦（`friction`）。
- Boss 危机弧线（`global_crisis`），包含分阶段目标与通过/失败日志。
- Canvas 玩法层：
  - 连击走廊（Combo）与情报点（Intel）。
  - 预测线解锁（迷雾逐步揭示）。
  - 事件决策卡（即时信号干预选项）。
  - Timing Burst 交互与危机状态面板。
  - Ghost 时间线对照（与上一局比较）。
- Three.js 地图可视化：
  - 区域地标与主导宗教可视提示。
  - 随摩擦动态变化的蚂蚁线速度/强度。
  - HUD 统计、图例与事件特效。
- AI 报告导出（`/api/simulation/report`）：生成学术风格 PDF，支持 Markdown 表格渲染。
- 内置 i18n：`en`、`zh-CN`、`ja`。

## 软件结构
```text
.
├── server.js                  # Express API + 仿真核心 + AI 客户端 + PDF 报告渲染
├── data/
│   ├── religion-doctrines.js  # 宗教种子、教义、特征、治理参数、区域亲和
│   ├── world-context.js       # 世界区域与基础社会信号
│   └── simulation-config.js   # 场景、事件池、迁移/裁决参数
├── public/
│   ├── index.html             # 页面结构（控制区、地图舞台、玩法 HUD、抽屉、模态框）
│   ├── main.js                # Three.js 渲染、玩法交互、前后端通信
│   ├── style.css              # 响应式样式与玩法视觉层
│   └── i18n.js                # 多语言文案与切换逻辑
├── assets/
│   └── full-game-screenshot.png
├── .env.example
├── package.json
└── README*.md
```

## 快速开始
```bash
npm install
cp .env.example .env
# 填写 AI_API_KEY（纯规则模式可不启用 AI）
npm run dev
```

访问：`http://localhost:3000`

## 环境变量
参考 `.env.example`：
- `AI_PROVIDER`（`openai` | `moonshot`）
- `AI_API_KEY`
- `AI_MODEL`
- `AI_API_BASE`
- `AI_API_LOG`
- `AI_API_LOG_PAYLOAD`
- `AI_TRANSFER_AGENT`
- `AI_API_TIMEOUT_MS`
- `AI_API_MAX_RETRIES`
- `AI_API_RETRY_BASE_DELAY_MS`
- `NODE_USE_ENV_PROXY`
- `PORT`
- `HOST`

Provider 默认值：
- `openai`：`gpt-4o-mini`，`https://api.openai.com/v1`
- `moonshot`：`kimi-k2-turbo-preview`，`https://api.moonshot.cn/v1`

## API
- `GET /api/health`
  - 返回健康状态、模型提供商、模型名、可用 provider、AI 配置状态。
- `POST /api/simulation/start`
  - Body: `{ "useAI": true|false, "provider": "openai|moonshot", "locale": "en|zh-CN|ja", "scenario": "balanced|high_regulation|high_secularization|high_polarization" }`
- `POST /api/simulation/tick`
  - Body: `{ "locale": "en|zh-CN|ja", "scenario": "..." }`
- `GET /api/simulation/state`
  - 获取当前快照。
- `GET /api/simulation/scenarios`
  - 获取场景列表和配置版本。
- `POST /api/simulation/signals`
  - Body: `{ "overrides": { "digitalization": 0.8, ... } }`
- `POST /api/simulation/report`
  - 导出 PDF 报告（需已配置 AI，且至少完成 1 轮）。

快照关键字段：
- `regionControl`
- `bossCrisis`
- `structureOutput.antLinks[].friction`

## 安全说明
- `.env`、`.env.*` 已通过 `.gitignore` 排除。
- 真正密钥仅放本地 `.env`。
- 协作共享请使用 `.env.example`。

## 免责声明
本项目仅用于技术仿真与可视化演示，不构成现实宗教统计、信仰主张或价值判断。
