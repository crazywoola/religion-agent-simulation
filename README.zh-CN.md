<div align="center">

# 宗教 Agent 模拟器

一款交互式多智能体模拟游戏，探索宗教如何在社会压力下竞争、共存与演化。

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

## 这是什么？

这是一款基于浏览器的策略模拟游戏。**14 个宗教**（包括世俗运动）在 **7 个世界区域**中争夺信众。每个宗教拥有独特的特质、治理规则和被动能力，会微妙地塑造社会格局。你不控制任何单一宗教——而是通过事件决策、策略卡牌、信号调控和风险下注来影响整个世界，同时模拟自行运转。每局开始前，你从 **59 种职业原型**中选择一个与宗教绑定的角色，从 **20 套策略卡组预设**（或 108 张卡池随机抽取）中选择卡组，并追求独特的胜利目标。

![全局截图](./assets/full-game-screenshot.png)

## AI 如何参与

模拟器支持两种运行模式：

- **纯规则模式**（无需 API Key）：所有信徒转化由数学模型计算，基于宗教特质、治理参数、社会信号和区域因子。行动日志由本地化模板生成。此模式完全独立可用。

- **AI 增强模式**（需要 API Key）：大语言模型为每轮每个宗教生成更丰富、更贴合上下文的行动叙述，提议转化走廊方案，并可生成学术风格的 PDF 分析报告。AI 是规则引擎之上的创意层——丰富体验但不覆盖模拟数学。

支持任何 **OpenAI 兼容** 的 API 服务商：OpenAI、Moonshot/Kimi、Ollama、LM Studio，或任何提供 `/v1/chat/completions` 端点的服务。

## 核心玩法

- **14 大宗教** — 佛教、印度教、道教、伊斯兰教、新教、飞天面条神教、天主教、神道教、世俗主义、犹太教、锡克教、东正教、祆教、巴哈伊 — 各有独特的特质指标、治理机制、教义风格和被动能力
- **7 个世界区域** — 北美、拉美、欧洲、中东/非洲、南亚、东亚、线上社群 — 各具独特的社会因子画像
- **14 种随机事件** — 从宗教丑闻到 AI 教义泄露，每个事件都有叙事链后续和玩家决策选项，会改变社会信号
- **角色与职业系统** — 59 种职业原型（外交官、战争领主、间谍、神秘主义者等）与宗教绑定；每个角色有独特胜利目标、起始情报加成和偏好卡牌池
- **108 张策略卡池** — 分为牌组 A（外交与稳定，54 张）和牌组 B（扩张与破坏，54 张）；每局从 20 套精选预设或随机 36 张中选取 15 张；卡牌分 3 类：即时、条件触发（达到阈值时翻倍）、持续（多轮生效）
- **宗教审判系统** — 高正统性宗教可通过法庭程序拦截外来转化，日志中会显示原因分类和严重程度
- **Boss 危机** — 多阶段 Raid 挑战，实时显示通过/失败条件进度；失败阶段会带来持久惩罚
- **领地控制** — 区域归属、连控加成影响留存率和传播力
- **风险下注与连击** — 5 种下注类型、走廊连击链、Ghost 对照系统
- **局外成长** — 研究点、可解锁特性、成就系统，以及记录角色与卡组选择的每日挑战榜单
- **3D 可视化** — Three.js 交互地图，带动画蚂蚁线转化走廊、区域节点和事件叠加层
- **丰富日志系统** — 传教、审判、事件、被动、领地（含角色选择与卡组选取）六类日志，带上下文相关描述和过滤选项
- **多语言** — 英语、简体中文、日语运行时切换

## 快速开始

需要 **Node.js 24+**。

```bash
npm install
cp .env.example .env
# 可选：填写 AI_API_KEY 以启用 AI 增强模式
npm run dev
```

访问 `http://localhost:3000`。

## 配置

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `AI_PROVIDER` | AI 提供商（`openai` 或 `moonshot`） | `openai` |
| `AI_API_KEY` | API Key（留空则为纯规则模式） | — |
| `AI_MODEL` | 覆盖模型名称 | 提供商默认 |
| `PORT` | 服务端口 | `3000` |

更多选项（超时、重试、代理、日志等）请参阅 [`.env.example`](.env.example)。

## 免责声明

本项目仅用于技术仿真与可视化演示，不构成现实宗教统计、信仰主张或价值判断。
