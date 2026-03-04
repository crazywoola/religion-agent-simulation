<div align="center">

# 宗教エージェント・マップシミュレーション

OpenAI 互換プロバイダと Three.js による、複数宗教エージェントの同化ダイナミクス・シミュレーション。

[English](./README.md) | [简体中文](./README.zh-CN.md) | 日本語

</div>

## 概要
本プロジェクトは、社会シグナル・地域文脈・制度制約・突発イベントの影響下で、宗教間の信徒移動をシミュレーションします。総信徒数は常に一定です。

## 全体スクリーンショット
![Full game screenshot](./assets/full-game-screenshot.png)

## 現在の機能
- 8宗教エージェント（教義、統治パラメータ、特性、地域親和性、履歴を保持）。
- 総人口一定の制約。
- シナリオ切替：`balanced`、`high_regulation`、`high_secularization`、`high_polarization`。
- 動的イベントシステム（継続ショックと減衰を含む）。
- 領域支配モデル（`regionControl`）と移動経路摩擦（`friction`）。
- Boss危機アーク（`global_crisis`）の段階目標と成功/失敗ログ。
- Canvasゲームプレイ層：
  - コンボ回廊とインテルポイント。
  - 予測リンク解放（フォグ解除型）。
  - イベント意思決定カード（即時シグナル介入）。
  - Timing Burst インタラクションと危機パネル。
  - Ghostタイムライン比較（前回ランとの比較）。
- Three.js マップ可視化：
  - 地域ランドマークと優勢宗教の可視化。
  - 摩擦に応じて速度/強度が変わるアントライン。
  - HUD統計、凡例、イベント視覚効果。
- AIレポート出力（`/api/simulation/report`）：学術スタイルPDFを生成し、Markdown表を描画。
- i18n対応：`en`、`zh-CN`、`ja`。

## ソフトウェア構成
```text
.
├── server.js                  # Express API + シミュレーション本体 + AIクライアント + PDF生成
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
```bash
npm install
cp .env.example .env
# AI_API_KEY を設定（ルールのみ運転なら AI 無効でも可）
npm run dev
```

アクセス: `http://localhost:3000`

## 環境変数
`.env.example` を参照：
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

既定値：
- `openai`：`gpt-4o-mini`、`https://api.openai.com/v1`
- `moonshot`：`kimi-k2-turbo-preview`、`https://api.moonshot.cn/v1`

## API
- `GET /api/health`
  - ヘルス状態、プロバイダ、モデル、利用可能プロバイダ、AI設定状態を返す。
- `POST /api/simulation/start`
  - Body: `{ "useAI": true|false, "provider": "openai|moonshot", "locale": "en|zh-CN|ja", "scenario": "balanced|high_regulation|high_secularization|high_polarization" }`
- `POST /api/simulation/tick`
  - Body: `{ "locale": "en|zh-CN|ja", "scenario": "..." }`
- `GET /api/simulation/state`
  - 現在スナップショット。
- `GET /api/simulation/scenarios`
  - シナリオ一覧と設定バージョン。
- `POST /api/simulation/signals`
  - Body: `{ "overrides": { "digitalization": 0.8, ... } }`
- `POST /api/simulation/report`
  - PDFレポート出力（AI設定済みかつ1ラウンド以上進行が必要）。

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
