<div align="center">

# Religion Agent Map Simulation

AI-driven multi-agent simulation for religious conversion dynamics with OpenAI-compatible providers and Three.js.

[![Node.js](https://img.shields.io/badge/Node.js-24%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Map-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![OpenAI Compatible](https://img.shields.io/badge/LLM-OpenAI%20Compatible-10A37F?style=for-the-badge)](https://platform.openai.com/docs/api-reference)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/issues)
[![Last commit](https://img.shields.io/github/last-commit/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/commits/main)

English | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

## Overview
This project simulates conversion flow between religion agents under social signals, regional context, governance constraints, and event shocks while keeping total population constant.

## Full Game Screenshot
![Full game screenshot](./assets/full-game-screenshot.png)

## Feature Highlights
- **Simulation Engine**: 8 religion agents with doctrine, governance, trait vectors, regional affinity, and per-round history.
- **Scenario & Event Model**: Scenarios (`balanced`, `high_regulation`, `high_secularization`, `high_polarization`) and dynamic shock events.
- **Region Dynamics**: Territory control output (`regionControl`) and transfer route friction (`structureOutput.antLinks[].friction`).
- **Gameplay Layer**: Combo corridors, intel points, forecast unlock, event decision card, timing burst, boss crisis panel, and ghost timeline.
- **3D Visualization**: Three.js map landmarks, directional ant-line corridors, HUD legends, and canvas event effects.
- **Report Export**: AI-generated academic-style PDF report (`/api/simulation/report`) with Markdown table rendering.
- **Localization**: Runtime i18n for `en`, `zh-CN`, `ja`.

## Software Structure
```text
.
├── server.js                  # server bootstrap (listen + startup logs)
├── src/
│   ├── server/
│   │   └── create-app.js      # express app + route wiring
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
│   ├── religion-doctrines.js  # religion seeds, doctrine, traits, governance, regional affinity
│   ├── world-context.js       # world regions + baseline social signals
│   └── simulation-config.js   # scenarios, event pool, transfer/judgment tuning
├── public/
│   ├── index.html             # UI layout (panels, map stage, gameplay HUD, cards/modals)
│   ├── main.js                # Three.js scene, rendering, gameplay interaction, API calls
│   ├── style.css              # responsive UI and gameplay overlay styles
│   └── i18n.js                # localization strings and runtime locale helpers
├── assets/
│   └── full-game-screenshot.png
├── .env.example
├── package.json
└── README*.md
```

## Quick Start
Requires `Node.js 24+`.

```bash
npm install
cp .env.example .env
# Fill AI_API_KEY (optional for rule-only mode)
npm run dev
```

Open: `http://localhost:3000`

## Environment Variables
| Variable | Purpose | Default |
| --- | --- | --- |
| `AI_PROVIDER` | AI provider (`openai` or `moonshot`) | `openai` |
| `AI_API_KEY` | API key for selected provider | empty |
| `AI_MODEL` | Override model name | provider default |
| `AI_API_BASE` | Override API base URL | provider default |
| `AI_API_LOG` | Enable API logs (`1`/`0`) | `1` |
| `AI_API_LOG_PAYLOAD` | Log full payloads (`1`/`0`) | `0` |
| `AI_TRANSFER_AGENT` | Enable AI transfer agent (`1`/`0`) | `1` |
| `AI_API_TIMEOUT_MS` | Request timeout | `25000` |
| `AI_API_MAX_RETRIES` | Max retry count | `2` |
| `AI_API_RETRY_BASE_DELAY_MS` | Base retry delay | `350` |
| `NODE_USE_ENV_PROXY` | Respect system proxy env | `1` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |

Provider defaults:
- `openai`: model `gpt-4o-mini`, base `https://api.openai.com/v1`
- `moonshot`: model `kimi-k2-turbo-preview`, base `https://api.moonshot.cn/v1`

## API Reference
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health and provider/runtime info |
| `POST` | `/api/simulation/start` | Start or reset simulation |
| `POST` | `/api/simulation/tick` | Advance one round |
| `GET` | `/api/simulation/state` | Get current snapshot |
| `GET` | `/api/simulation/scenarios` | List scenarios + config version |
| `POST` | `/api/simulation/signals` | Apply manual signal overrides |
| `POST` | `/api/simulation/report` | Export academic-style PDF report |

Request examples:

```json
POST /api/simulation/start
{
  "useAI": true,
  "provider": "openai",
  "locale": "en",
  "scenario": "balanced"
}
```

```json
POST /api/simulation/tick
{
  "locale": "en",
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

Snapshot highlights:
- `regionControl`
- `bossCrisis`
- `structureOutput.antLinks[].friction`

## Security Notes
- Secrets are excluded from git via `.gitignore` (`.env`, `.env.*`).
- Keep real keys only in local `.env`.
- Share only `.env.example`.

## Disclaimer
This project is a technical simulation and visualization demo. It does not represent real-world religious statistics, truth claims, or value judgments.
