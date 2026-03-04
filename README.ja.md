<div align="center">

# 宗教エージェント・シミュレーション

社会的圧力の下で宗教がどのように競争・共存・進化するかを探る、インタラクティブなマルチエージェント・シミュレーションゲーム。

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

## これは何？

ブラウザベースの戦略シミュレーションゲームです。9つの宗教（世俗運動を含む）が7つの世界地域で信徒を巡って競い合います。各宗教は独自の特性、統治ルール、パッシブ能力を持ち、社会の風景を繊細に形作ります。プレイヤーは特定の宗教を操作するのではなく、イベント決定、戦略カード、シグナル調整、リスクベットを通じて世界に影響を与えます。

![全体スクリーンショット](./assets/full-game-screenshot.png)

## AI の役割

シミュレーションには2つのモードがあります：

- **ルールのみモード**（APIキー不要）：すべての信徒移動は、宗教特性・統治パラメータ・社会シグナル・地域要因に基づく数理モデルで計算されます。行動ログはローカライズされたテンプレートから生成。このモードだけで完全に動作します。

- **AI強化モード**（APIキーが必要）：大規模言語モデルが各ラウンドの宗教ごとに豊かな文脈対応のナラティブを生成し、転化回廊を提案し、学術スタイルのPDF分析レポートを作成できます。AIはルールエンジンの上にあるクリエイティブレイヤーで、体験を豊かにしますがシミュレーションの数理を上書きすることはありません。

**OpenAI互換**のAPIプロバイダなら何でも利用可能：OpenAI、Moonshot/Kimi、Ollama、LM Studio、または `/v1/chat/completions` エンドポイントを提供するサービス。

## 主な機能

- **9つの宗教** — 仏教、ヒンドゥー教、道教、イスラム教、プロテスタント、空飛ぶスパゲッティ・モンスター教、カトリック、神道、世俗 — それぞれ独自のメトリクス、特性、統治機構、教義、パッシブ能力を保有
- **7つの世界地域** — 北米、中南米、ヨーロッパ、中東・アフリカ、南アジア、東アジア、オンラインコミュニティ — 各地域に固有の社会要因プロファイル
- **14種のランダムイベント** — 宗教スキャンダルからAI教義リークまで、すべてにナラティブチェーンとプレイヤー決定オプション付き
- **戦略デッキ** — 即時効果、条件付き（閾値超過で倍増）、持続（2-3ラウンド継続）の3タイプ15枚
- **宗教審判システム** — 高い正統性を持つ宗教は審判手続きで改宗を遮断可能、理由別のログ記述付き
- **Boss危機** — リアルタイムの通過/失敗条件表示を備えた多段フェーズレイド
- **領域支配** — 地域所有権、連続支配、領域ボーナスが保持率と布教力に影響
- **リスクベットとコンボ** — 5種のベット、回廊コンボチェーン、ゴースト比較システム
- **3D可視化** — Three.jsインタラクティブマップ、アニメーション付きアントライン転化回廊、地域ノード、イベントオーバーレイ
- **豊富なログシステム** — 布教、審判、イベント、パッシブ、領域の5種ログ、文脈対応テキストとフィルター機能
- **多言語対応** — 英語、簡体字中国語、日本語をランタイムで切替

## クイックスタート

**Node.js 24+** が必要です。

```bash
npm install
cp .env.example .env
# オプション：AI強化モード用にAI_API_KEYを設定
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 設定

| 変数 | 目的 | 既定値 |
| --- | --- | --- |
| `AI_PROVIDER` | AIプロバイダ（`openai` or `moonshot`） | `openai` |
| `AI_API_KEY` | APIキー（空欄ならルールのみモード） | — |
| `AI_MODEL` | モデル名の上書き | プロバイダ既定 |
| `PORT` | サーバーポート | `3000` |

タイムアウト、リトライ、プロキシ、ログなどの詳細設定は [`.env.example`](.env.example) を参照してください。

## 免責事項

本プロジェクトは技術検証と可視化デモを目的とし、現実の宗教統計や価値判断を示すものではありません。
