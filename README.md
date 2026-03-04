<div align="center">

# Religion Agent Map Simulation

AI-driven multi-agent simulation for religious conversion dynamics with OpenAI-compatible providers and Three.js.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
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

## Current Feature Set
- 8 religion agents with doctrine, governance, traits, regional affinity, and transfer history.
- Constant-total population invariant across rounds.
- Scenario system (`balanced`, `high_regulation`, `high_secularization`, `high_polarization`).
- Dynamic event system + active shock decay.
- Territory control model (`regionControl`) and route friction in transfer corridors.
- Boss crisis arc (`global_crisis`) with phase goals and pass/fail logs.
- Canvas gameplay layer:
  - Combo corridors and intel points.
  - Forecast link reveal (fog-of-war style unlock).
  - Event decision card (signal intervention choices).
  - Timing burst interaction and boss status panel.
  - Ghost timeline overlay (compare with previous run).
- Three.js map visualization:
  - 3D region landmarks and dominance cues.
  - Animated ant-line transfer corridors with friction-aware speed/intensity.
  - HUD stats, legend, and event/canvas visual effects.
- AI report export (`/api/simulation/report`) to academic-style PDF with Markdown table parsing.
- i18n UI for `en`, `zh-CN`, `ja`.

## Software Structure
```text
.
├── server.js                  # Express API + simulation core + AI client + PDF report renderer
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
```bash
npm install
cp .env.example .env
# Fill AI_API_KEY (optional for rule-only mode)
npm run dev
```

Open: `http://localhost:3000`

## Environment Variables
See `.env.example`:
- `AI_PROVIDER` (`openai` | `moonshot`)
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

Provider defaults:
- `openai`: model `gpt-4o-mini`, base `https://api.openai.com/v1`
- `moonshot`: model `kimi-k2-turbo-preview`, base `https://api.moonshot.cn/v1`

## API
- `GET /api/health`
  - Returns runtime health, provider/model, available providers, and AI key status.
- `POST /api/simulation/start`
  - Body: `{ "useAI": true|false, "provider": "openai|moonshot", "locale": "en|zh-CN|ja", "scenario": "balanced|high_regulation|high_secularization|high_polarization" }`
- `POST /api/simulation/tick`
  - Body: `{ "locale": "en|zh-CN|ja", "scenario": "..." }`
- `GET /api/simulation/state`
  - Current snapshot.
- `GET /api/simulation/scenarios`
  - Available scenarios and config version.
- `POST /api/simulation/signals`
  - Body: `{ "overrides": { "digitalization": 0.8, ... } }`
- `POST /api/simulation/report`
  - Exports a PDF report; requires AI configured and at least one completed round.

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
