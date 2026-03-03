<div align="center">

# 宗教 Agent 地图模拟器

基于 OpenAI 兼容提供商 + Three.js 的多宗教同化传播仿真系统。

[English](./README.md) | 简体中文 | [日本語](./README.ja.md)

</div>

## 项目简介
本项目用于模拟多个宗教 Agent 在社会变量影响下的同化转化过程。系统保持总信徒数恒定，并将关键转化链路以 Three.js 蚂蚁线路动态展示在地图上。

## 核心能力
- 覆盖 8 个宗教（含日本神道教）。
- 总人数恒定约束（每轮只发生宗教间迁移）。
- 内置 i18n（`en`、`zh-CN`、`ja`），支持运行时切换语言。
- 混合转化引擎：
  - 规则引擎生成基准链路。
  - AI Agent 输出结构化转化数量。
- 3D 可视化：
  - 区域主导宗教柱体。
  - 关键同化蚂蚁线路（方向与强度可视）。
- 丰富教义模型：
  - 短教义、长描述、经典著作。
  - 社会特征参数、区域亲和度。

## 快速开始
```bash
npm install
cp .env.example .env
# 在 .env 填写 AI_API_KEY（可选设置 AI_PROVIDER）
npm run dev
```

访问：`http://localhost:3000`

## 环境变量
参考 `.env.example`：
- `AI_PROVIDER`（`openai` | `moonshot`）
- `AI_API_KEY`
- `AI_MODEL`
- `AI_API_BASE`
- `MOONSHOT_API_KEY` / `MOONSHOT_MODEL` / `MOONSHOT_API_BASE`（可选）
- `AI_API_LOG`
- `AI_API_LOG_PAYLOAD`
- `AI_TRANSFER_AGENT`
- `AI_API_TIMEOUT_MS`
- `AI_API_MAX_RETRIES`
- `AI_API_RETRY_BASE_DELAY_MS`
- `NODE_USE_ENV_PROXY`
- `PORT`

若频繁出现 `fetch failed | code=ECONNRESET`，可适当增大 `AI_API_TIMEOUT_MS` 与 `AI_API_MAX_RETRIES`，并确认 `AI_API_BASE` / 代理网络可达。

## API
- `POST /api/simulation/start` body: `{ "useAI": true | false, "provider": "openai|moonshot", "locale": "en|zh-CN|ja" }`
- `POST /api/simulation/tick` body: `{ "locale": "en|zh-CN|ja" }`
- `GET /api/simulation/state`
- `GET /api/health`

## 安全说明
- `.env`、`.env.*` 已加入 `.gitignore`，不会进入版本库。
- 请仅在本地 `.env` 存放真实密钥。
- 协作请使用 `.env.example`。

## 免责声明
本项目仅用于技术演示，不代表现实宗教统计、信仰判断或价值立场。
