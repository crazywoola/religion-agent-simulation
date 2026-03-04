<div align="center">

# 宗教エージェント・マップシミュレーション

OpenAI 互換プロバイダと Three.js による、複数宗教エージェントの同化ダイナミクス・シミュレーション。

[![Node.js](https://img.shields.io/badge/Node.js-24%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Map-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![OpenAI Compatible](https://img.shields.io/badge/LLM-OpenAI%20Compatible-10A37F?style=for-the-badge)](https://platform.openai.com/docs/api-reference)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/issues)
[![Last commit](https://img.shields.io/github/last-commit/crazywoola/religion-agent-simulation?style=for-the-badge)](https://github.com/crazywoola/religion-agent-simulation/commits/main)

[English](./README.md) | [简体中文](./README.zh-CN.md) | 日本語

</div>

## 概要
本プロジェクトは、社会シグナル・地域文脈・制度制約・突発イベントの影響下で、宗教間の信徒移動をシミュレーションします。総信徒数は常に一定です。

## 全体スクリーンショット
![Full game screenshot](./assets/full-game-screenshot.png)

## 機能ハイライト
- **シミュレーションエンジン**：8宗教エージェントに対し、教義・統治パラメータ・特性・地域親和性・履歴を保持。
- **シナリオとイベント**：`balanced`、`high_regulation`、`high_secularization`、`high_polarization` と動的ショックイベントを提供。
- **地域ダイナミクス**：領域支配（`regionControl`）と経路摩擦（`structureOutput.antLinks[].friction`）を出力。
- **ゲームプレイ層**：コンボ回廊、インテルポイント、予測リンク解放、意思決定カード、Timing Burst、Bossパネル、Ghost比較。
- **3D 可視化**：Three.js 地図ランドマーク、方向付きアントライン、HUD、イベント視覚効果。
- **レポート出力**：`/api/simulation/report` で学術スタイルPDFを生成し、Markdown表を描画。
- **多言語対応**：`en`、`zh-CN`、`ja` を実行中に切替可能。

## ソフトウェア構成
```text
.
├── server.js                  # サーバー起動エントリ（listen と起動ログ）
├── src/
│   ├── server/
│   │   └── create-app.js      # Express アプリとルート構成
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
│   ├── religion-doctrines.js  # 宗教データ、教義、特性、統治、地域親和
│   ├── world-context.js       # 世界地域データと基礎社会シグナル
│   └── simulation-config.js   # シナリオ、イベントプール、移動/裁定パラメータ
├── public/
│   ├── index.html             # UI構成（パネル、マップ、HUD、ドロワー、モーダル）
│   ├── main.js                # Three.js描画、ゲームプレイ、API連携
│   ├── style.css              # レスポンシブUIとオーバーレイのスタイル
│   └── i18n.js                # 多言語辞書とロケール切替
├── assets/
│   └── full-game-screenshot.png
├── .env.example
├── package.json
└── README*.md
```

## クイックスタート
`Node.js 24+` が必要です。

```bash
npm install
cp .env.example .env
# AI_API_KEY を設定（ルールのみ運転なら AI 無効でも可）
npm run dev
```

アクセス: `http://localhost:3000`

## 環境変数
| 変数 | 目的 | 既定値 |
| --- | --- | --- |
| `AI_PROVIDER` | プロバイダ指定（`openai` / `moonshot`） | `openai` |
| `AI_API_KEY` | APIキー | 空 |
| `AI_MODEL` | モデル上書き | プロバイダ既定 |
| `AI_API_BASE` | APIベースURL上書き | プロバイダ既定 |
| `AI_API_LOG` | APIログ出力（`1`/`0`） | `1` |
| `AI_API_LOG_PAYLOAD` | 詳細payloadログ（`1`/`0`） | `0` |
| `AI_TRANSFER_AGENT` | AI転移エージェント有効化 | `1` |
| `AI_API_TIMEOUT_MS` | タイムアウト(ms) | `25000` |
| `AI_API_MAX_RETRIES` | 最大リトライ回数 | `2` |
| `AI_API_RETRY_BASE_DELAY_MS` | リトライ基本遅延(ms) | `350` |
| `NODE_USE_ENV_PROXY` | システムプロキシ環境変数を使用 | `1` |
| `PORT` | サーバーポート | `3000` |
| `HOST` | サーバーホスト | `0.0.0.0` |

既定値：
- `openai`：`gpt-4o-mini`、`https://api.openai.com/v1`
- `moonshot`：`kimi-k2-turbo-preview`、`https://api.moonshot.cn/v1`

## API リファレンス
| Method | Endpoint | 説明 |
| --- | --- | --- |
| `GET` | `/api/health` | ヘルス状態とランタイム情報 |
| `POST` | `/api/simulation/start` | シミュレーション開始/リセット |
| `POST` | `/api/simulation/tick` | 1ラウンド進行 |
| `GET` | `/api/simulation/state` | 現在スナップショット取得 |
| `GET` | `/api/simulation/scenarios` | シナリオ一覧と設定バージョン |
| `POST` | `/api/simulation/signals` | 社会シグナルの手動上書き |
| `POST` | `/api/simulation/report` | 学術スタイルPDFの出力 |

リクエスト例：

```json
POST /api/simulation/start
{
  "useAI": true,
  "provider": "openai",
  "locale": "ja",
  "scenario": "balanced"
}
```

```json
POST /api/simulation/tick
{
  "locale": "ja",
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

主要スナップショット項目：
- `regionControl`
- `bossCrisis`
- `structureOutput.antLinks[].friction`

## セキュリティ
- `.env` と `.env.*` は `.gitignore` で除外。
- 実キーはローカル `.env` のみに保存。
- 共有用には `.env.example` を使用。

## 免責事項
本プロジェクトは技術検証と可視化デモを目的とし、現実の宗教統計や価値判断を示すものではありません。
