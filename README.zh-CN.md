<div align="center">

# 宗教 Agent 地图模拟器

基于 OpenAI 兼容模型与 Three.js 的多宗教同化传播仿真系统。

[![Node.js](https://img.shields.io/badge/Node.js-24%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Map-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![OpenAI Compatible](https://img.shields.io/badge/LLM-OpenAI%20Compatible-10A37F?style=for-the-badge)](https://platform.openai.com/docs/api-reference)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/issues)
[![Last commit](https://img.shields.io/github/last-commit/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/commits/main)

[English](./README.md) | 简体中文 | [日本語](./README.ja.md)

</div>

## 项目概览
本项目模拟不同宗教 Agent 在社会信号、区域环境、制度约束与突发事件影响下的信徒迁移过程，并保持总信徒数恒定。

## 全局截图
![Full game screenshot](./assets/full-game-screenshot.png)

## 功能亮点
- **仿真引擎**：8 个宗教 Agent，包含教义、治理参数、特征参数、区域亲和度和历史轨迹。
- **场景与事件**：支持 `balanced`、`high_regulation`、`high_secularization`、`high_polarization`，并带动态冲击事件。
- **区域动态**：输出领地控制（`regionControl`）与迁移路径摩擦（`structureOutput.antLinks[].friction`）。
- **玩法系统**：连击走廊、情报点、预测线解锁、事件决策卡、Timing Burst、Boss 面板、Ghost 时间线对照。
- **3D 可视化**：Three.js 地图地标、方向蚂蚁线、HUD 图例与事件特效。
- **报告导出**：`/api/simulation/report` 可导出学术风格 PDF，并支持 Markdown 表格渲染。
- **多语言**：内置 `en`、`zh-CN`、`ja` 运行时切换。

## 软件结构
```text
.
├── server.js                  # 服务启动入口（监听端口与启动日志）
├── src/
│   ├── server/
│   │   └── create-app.js      # Express 应用与路由组装
│   ├── simulation/
│   │   └── religion-simulation.js
│   ├── ai/
│   │   ├── openai-client.js
│   │   └── providers.js
│   ├── report/
│   │   └── pdf-report.js
│   ├── config/
│   │   ├── runtime.js
│   │   └── scenario.js
│   ├── domain/
│   │   ├── localization.js
│   │   ├── normalization.js
│   │   └── strategy.js
│   └── utils/
│       ├── common.js
│       └── math.js
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
需要 `Node.js 24+`。

```bash
npm install
cp .env.example .env
# 填写 AI_API_KEY（纯规则模式可不启用 AI）
npm run dev
```

访问：`http://localhost:3000`

## 环境变量
| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `AI_PROVIDER` | 模型提供商（`openai` / `moonshot`） | `openai` |
| `AI_API_KEY` | 提供商 API Key | 空 |
| `AI_MODEL` | 覆盖模型名 | 提供商默认 |
| `AI_API_BASE` | 覆盖接口地址 | 提供商默认 |
| `AI_API_LOG` | 是否记录 API 日志（`1`/`0`） | `1` |
| `AI_API_LOG_PAYLOAD` | 是否记录完整 payload | `0` |
| `AI_TRANSFER_AGENT` | 是否启用 AI 转移代理 | `1` |
| `AI_API_TIMEOUT_MS` | 请求超时毫秒 | `25000` |
| `AI_API_MAX_RETRIES` | 最大重试次数 | `2` |
| `AI_API_RETRY_BASE_DELAY_MS` | 重试基础延迟 | `350` |
| `NODE_USE_ENV_PROXY` | 是否使用系统代理环境变量 | `1` |
| `PORT` | 服务端口 | `3000` |
| `HOST` | 服务监听地址 | `0.0.0.0` |

Provider 默认值：
- `openai`：`gpt-4o-mini`，`https://api.openai.com/v1`
- `moonshot`：`kimi-k2-turbo-preview`，`https://api.moonshot.cn/v1`

## API 参考
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 服务健康状态与运行时信息 |
| `POST` | `/api/simulation/start` | 启动或重置仿真 |
| `POST` | `/api/simulation/tick` | 推进一轮 |
| `GET` | `/api/simulation/state` | 获取当前快照 |
| `GET` | `/api/simulation/scenarios` | 场景列表与配置版本 |
| `POST` | `/api/simulation/signals` | 手动覆盖社会信号 |
| `POST` | `/api/simulation/report` | 导出学术风格 PDF 报告 |

请求示例：

```json
POST /api/simulation/start
{
  "useAI": true,
  "provider": "openai",
  "locale": "zh-CN",
  "scenario": "balanced"
}
```

```json
POST /api/simulation/tick
{
  "locale": "zh-CN",
  "scenario": "high_regulation"
}
```

```json
POST /api/simulation/signals
{
  "overrides": {
    "digitalization": 0.8,
    "mediaPolarization": 0.6
  }
}
```

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
