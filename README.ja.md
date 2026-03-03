<div align="center">

# 宗教エージェント・マップシミュレーション

OpenAI 互換プロバイダ + Three.js による複数宗教エージェントの同化シミュレーション。

[English](./README.md) | [简体中文](./README.zh-CN.md) | 日本語

</div>

## 概要
このプロジェクトは、複数の宗教エージェントが社会変数の影響下でどのように信徒を獲得・流出するかを可視化します。総信徒数は常に一定で、主要な転化リンクは Three.js の「アントライン」で動的に表示されます。

## 主な機能
- 8宗教のエージェント（神道を含む）。
- 総人口一定の制約（ラウンドごとに宗教間移動のみ）。
- i18n 対応（`en`、`zh-CN`、`ja`）で実行中に言語切替可能。
- ハイブリッド転化エンジン：
  - ルールベースで基準リンク生成。
  - AI エージェントが構造化された転化量を生成。
- 3D マップ可視化：
  - 地域ごとの優勢宗教タワー。
  - 主要同化リンクのアントライン表示。
- 拡張可能な教義データ：
  - 短い教義、長文説明、代表的経典。
  - 社会特性パラメータ、地域親和性。

## クイックスタート
```bash
npm install
cp .env.example .env
# .env に AI_API_KEY（必要なら AI_PROVIDER）を設定
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

プロバイダ既定値：
- `openai`：モデル `gpt-4o-mini`、ベースURL `https://api.openai.com/v1`
- `moonshot`：モデル `kimi-k2-turbo-preview`、ベースURL `https://api.moonshot.cn/v1`

`fetch failed | code=ECONNRESET` が頻発する場合は、`AI_API_TIMEOUT_MS` と `AI_API_MAX_RETRIES` を増やし、`AI_API_BASE` / プロキシ設定の到達性を確認してください。

## API
- `POST /api/simulation/start` body: `{ "useAI": true | false, "provider": "openai|moonshot", "locale": "en|zh-CN|ja" }`
- `POST /api/simulation/tick` body: `{ "locale": "en|zh-CN|ja" }`
- `GET /api/simulation/state`
- `GET /api/health`

## セキュリティ
- `.env` と `.env.*` は `.gitignore` により除外。
- 実キーはローカル `.env` のみに保存。
- 共有には `.env.example` を使用。

## 免責事項
本プロジェクトは技術デモであり、現実の宗教統計や価値判断を示すものではありません。
