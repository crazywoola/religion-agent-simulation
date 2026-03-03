<div align="center">

# Religion Agent Map Simulation

AI-driven multi-agent simulation for religious conversion dynamics with OpenAI-compatible providers + Three.js.

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

## Welcome
This project simulates how multiple religion agents influence each other over time while preserving a constant total population. The backend combines rule-based constraints with AI-generated structured transfer links, and the frontend visualizes conversion flows as animated ant-path lines on a 3D world map.

## Key Features
- Multi-agent simulation for 8 religions (including Shinto).
- Constant-total followers invariant (`sum followers` stays fixed each round).
- Built-in i18n UI (`en`, `zh-CN`, `ja`) with runtime language switch.
- Hybrid transfer engine:
  - Rule engine computes baseline transfers.
  - AI transfer agent outputs `structureOutput.links` with structured quantities.
- Three.js map UI with:
  - Regional dominance towers.
  - Dynamic conversion ant-path lines.
  - Transfer source labels (`AI` / `Rule`).
- Rich doctrine model per religion:
  - Short doctrine, long description, classic texts.
  - Social traits and regional affinity vectors.

## Architecture
- Backend: Express + OpenAI-compatible API clients (OpenAI, Moonshot/Kimi)
- Frontend: Vanilla JS + Three.js
- Data models:
  - `data/religion-doctrines.js`
  - `data/world-context.js`

```text
AI Provider (OpenAI / Moonshot Kimi)
                |
                v
        server.js simulation core
     (rule + AI hybrid transfer plan)
                |
                v
      /api/simulation/* snapshot JSON
                |
                v
      Three.js world map + ant links
```

## Quick Start
```bash
npm install
cp .env.example .env
# fill AI_API_KEY (and optional AI_PROVIDER) in .env
npm run dev
```

Open: `http://localhost:3000`

## Environment Variables
See `.env.example`:
- `AI_PROVIDER` (`openai` | `moonshot`)
- `AI_API_KEY`
- `AI_MODEL`
- `AI_API_BASE`
- `MOONSHOT_API_KEY` / `MOONSHOT_MODEL` / `MOONSHOT_API_BASE` (optional shortcuts)
- `AI_API_LOG`
- `AI_API_LOG_PAYLOAD`
- `AI_TRANSFER_AGENT`
- `AI_API_TIMEOUT_MS`
- `AI_API_MAX_RETRIES`
- `AI_API_RETRY_BASE_DELAY_MS`
- `NODE_USE_ENV_PROXY`
- `PORT`

If you see frequent `fetch failed | code=ECONNRESET`, increase `AI_API_TIMEOUT_MS` and `AI_API_MAX_RETRIES`, and make sure `AI_API_BASE` / proxy settings are reachable.

## API
- `POST /api/simulation/start`
  - body: `{ "useAI": true | false, "provider": "openai|moonshot", "locale": "en|zh-CN|ja" }`
- `POST /api/simulation/tick`
  - body: `{ "locale": "en|zh-CN|ja" }`
- `GET /api/simulation/state`
- `GET /api/health`

Structured output example:

```json
{
  "transferEngine": "ai|hybrid|rule",
  "structureOutput": {
    "antLinks": [
      {
        "fromReligionId": "buddhism",
        "toReligionId": "shinto",
        "fromRegionId": "south_asia",
        "toRegionId": "east_asia",
        "amount": 128,
        "reason": "digital outreach"
      }
    ]
  }
}
```

## Security Notes
- Secrets are excluded from git via `.gitignore` (`.env`, `.env.*`).
- Keep real keys only in local `.env`.
- Use `.env.example` for shared templates.

## Disclaimer
This is a technical simulation demo for agent systems and visualization. It does not represent real-world religious statistics, truth claims, or value judgments.
