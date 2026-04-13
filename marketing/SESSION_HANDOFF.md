# Session Handoff — ScanAlarm Marketing Research

**Date**: 2026-04-07 (UPDATED — 実視聴+テンプレ刷新まで完了)
**Status**: Phase 2 完了。次は Value Asset の動画化と初投稿

## Phase 2 完了サマリ (2026-04-07 後半セッション)

### 1. @thebranding.ai 10本 実視聴完了
- レポート: `12-qr-alarm-app/marketing/research/thebranding-ai-reels-analysis.md`
- 最大の発見: **複数Reelで同じ末尾Save-bait画面（8 Hookリスト）を使い回している**
- スクリーンショット: `.playwright-mcp/reel*.jpg`

### 2. TikTok アラームニッチ実視聴完了
- レポート: `12-qr-alarm-app/marketing/research/tiktok-alarm-niche-analysis.md`
- 最大の発見: **@alarmy_official top動画は7秒・Save 27.6%・サウンドベイト**
- ハンドオフの誤情報を訂正: alarmy 832K → 70.4K、Marlon Grandyアカウント存在せず

### 3. Value Asset 確定
- 新規ファイル: `content-templates/00-VALUE-ASSET.md`
- ScanAlarm版「8 Heavy-Sleeper Hooks」リストを言語化済み
- 次タスク: これを 720x1280縦の10秒スクロール動画にする

### 4. Content Templates 01-10 全て更新済み
- 01-pov.md は完全刷新（Wayk + Alarmy ハイブリッド構造）
- 02-10 は実視聴データの update note 追加
- 全テンプレで `00-VALUE-ASSET.md` を末尾10秒に貼る方針に統一

---

## 次セッションのタスク（Phase 3）

### 優先度1: Value Asset 動画化
`content-templates/00-VALUE-ASSET.md` の8 Hooks リストを実際の動画にする:
- 720x1280縦
- 黒背景・白Helvetica太字・3列レイアウト
- 下から上に10秒でスクロール
- 出力: `12-qr-alarm-app/marketing/assets/value-asset-v1.mp4`

ツール候補: ffmpeg + 静的画像、または CapCut / Canva

### 優先度2: 初投稿動画の脚本化
`content-templates/01-pov.md` の Instagram バージョン構造に沿って、最初の Reel 1本の絵コンテを作る:
- フック動画素材（友人/家族の寝坊シーン録画）
- pivotスライドのテキスト
- ScanAlarm 実演カット
- 末尾 value-asset-v1.mp4 結合

### 優先度3: TikTokシリーズ "diabolical scan locations" pt 1 撮影
- pt 1 = kitchen freezer
- 7-15秒
- iPhone 1ショット
- キャプション: `location: 'kitchen freezer' in scanalarm`

### 優先度4: アカウント開設
- Instagram: @scanalarm.app
- TikTok: @scanalarm

### 優先度5: 計測ダッシュボード
- 投稿後、Save / Share / Comment / Like / View / Reach を毎日記録
- @thebranding.ai Reel #1 (33Kいいね、269.7万再生) をベンチマーク

---

## 元の Phase 1 セッションメモ（参考用）

---

## このセッションで完了したこと

### 1. 初版テンプレート作成（→イケてないと判明、刷新済み）
- 最初に15ファイル作成したが、実際のバズコンテンツを見ずに教科書的なフォーマットだった
- Yuさんから「フォーマットもダサい、フックも弱い、解像度が低い」とフィードバック

### 2. リサーチ完了（3本並行）
保存先:
- `12-qr-alarm-app/marketing/research/viral-tiktok-research-2026-04.md` — Wayk事例、Alarmy戦略、2026アルゴリズム
- `12-qr-alarm-app/marketing/research/short-form-video-frameworks-2025-2026.md` — 10フレームワーク（Brain Rot、Edutainment、Rage Bait等）
- `4-frog-instagram/research-thebranding-ai.md` — @thebranding.aiの心理学フレームワーク

**核心発見**:
- **Wayk**: 3人の23歳が30日で25M views、100K DL。iPhone無編集raw映像のみ。"My alarm won't turn off until I [mission]"フォーマット
- **Lo-fi > ポリッシュ**: 制作クオリティが高いほど逆効果、lo-fiが40%多くview獲得
- **2026アルゴリズム**: シェア(3x) > セーブ(2x) > コメント(1x) > いいね(0.5x)
- **70%完了率**が必要（2025の50%から上昇）
- **@thebranding.ai**: 複合フック（心理トリガー2つ以上）で完了率234%UP
- **Character > Product**: Duolingoモデル（アラームをunhingedキャラ化）

### 3. リサーチベースでテンプレート全面刷新
刷新した全ファイル:
- `12-qr-alarm-app/marketing/STRATEGY.md`
- `12-qr-alarm-app/marketing/calendar.md`
- `12-qr-alarm-app/marketing/content-templates/01-pov.md` 〜 `10-feature-deep-dive.md`

---

## 次のセッションでやること（再起動後）

### 優先度1: @thebranding.aiのトップ動画を実データで分析

Yuさんの指摘:
> 「実際にちゃんと動画を見ていますかね？Playwrightで実際に動画を見れる」

これが正しい。フレームワークを文字情報だけで理解しても手触りがない。トップパフォーマーを実際に視聴して、フック・構成・キャプション文体を実例で確認する。

**ブラウザ状態**: Instagramにログイン済み（Yuさんが完了）。Playwrightセッションが切れたため再起動必要。

**分析対象（再生数順）**:

| 順位 | URL | 再生数 |
|---|---|---|
| 1 | https://www.instagram.com/thebranding.ai/reel/DWTsiMEDLYt/ | **269.7万** |
| 2 | https://www.instagram.com/thebranding.ai/reel/DWY1Y0gjCQV/ | 11万 |
| 3 | https://www.instagram.com/thebranding.ai/reel/DWjMHOWDFys/ | 9.6万 |
| 4 | https://www.instagram.com/thebranding.ai/reel/DWRNw4HDBXe/ | 7.5万 |
| 5 | https://www.instagram.com/thebranding.ai/reel/DWEZne-CdSm/ | 6.9万 |
| 6 | https://www.instagram.com/thebranding.ai/reel/DWJiyBvDHOr/ | 6.4万 |
| 7 | https://www.instagram.com/thebranding.ai/reel/DWOp1P6DJOp/ | 6.2万 |
| 8 | https://www.instagram.com/thebranding.ai/reel/DWq4OqUjLkO/ | 5.8万 |
| 9 | https://www.instagram.com/thebranding.ai/reel/DWWPZV4jJk1/ | 5.7万 |
| 10 | https://www.instagram.com/thebranding.ai/reel/DWC2AackzlW/ | 5.3万 |

**各動画で抽出する情報**:
1. 最初の1-3秒のフック（テキストオーバーレイ + ビジュアル）
2. 3パート構造の実例（Hook / Value / CTA）
3. 使われている心理トリガー（@thebranding.aiの6トリガー: Curiosity/Fear/Desire/Authority/Social Proof/Urgency）
4. 動画の長さ、テンポ、カット数
5. キャプション文体（口調、長さ、ハッシュタグ）
6. CTAの方法

**出力先**: `12-qr-alarm-app/marketing/research/thebranding-ai-reels-analysis.md`

### 優先度2: TikTokのバズ投稿も実視聴

Yuさんの本来の指摘は「TikTokトレンド調査」。アラームアプリ/朝のルーティン関連で実際にバズってるTikTok動画も見るべき。

**検索クエリ**:
- "alarm app" TikTok
- "heavy sleeper" TikTok
- "morning routine" TikTok
- "Alarmy" TikTok
- @alarmy_official（832K followers）のトップ投稿
- Waykアプリの投稿（founder Marlon Grandy）

**出力先**: `12-qr-alarm-app/marketing/research/tiktok-alarm-niche-analysis.md`

### 優先度3: 実データをテンプレートに反映（再々刷新）

トップ動画の実視聴で得た具体的パターンを、`content-templates/01-10` に反映。特に:
- 実例ベースの「こう撮る」指示
- 実際のキャプション文体の再現
- 実際のフックの翻訳/適応版

### 優先度4: Marketing Research Skillの設計

`.claude/skills/marketing-research.md` として定型化:
- トリガー: 「マーケリサーチ」「トレンド調査」「競合分析」
- Playwright MCPでInstagram/TikTokを巡回
- トップN動画の自動分析
- レポート生成

---

## 技術的注意事項

### Playwright MCPの問題
- Edge processプロセスが残るとロックファイルで次回起動失敗
- `C:\Users\yuasano\AppData\Local\ms-playwright\mcp-msedge-7d170e8` のロックに注意
- 解決策: セッション終了時に明示的に `browser_close` を呼ぶ

### Instagram アクセス
- ログインしないとReel個別ページで壁が出る
- Yuさんのアカウントでログイン済み
- 再起動後はクッキーが残っていれば継続使用可能（要確認）

---

## KPIリマインダー

**Goal: 30日で10,000フォロワー**
- Week 1 (Day 1-7): フォーマット探し、2-3投稿/日
- Week 2 (Day 8-14): 1,000フォロワー
- Week 3 (Day 15-21): 5,000フォロワー
- Week 4 (Day 22-30): **10,000フォロワー**

---

## ファイル構成現状

```
12-qr-alarm-app/marketing/
├── SESSION_HANDOFF.md              ← このファイル
├── STRATEGY.md                     ← 刷新済み（raw > polished原則）
├── calendar.md                     ← 刷新済み（30日スプリント）
├── tools-setup.md
├── content-templates/              ← 全10ファイル刷新済み（要実データ反映）
│   ├── 01-pov.md                   ← Raw Morning POV (Wayk formula)
│   ├── 02-before-after.md          ← Micro-Transformation
│   ├── 03-lifehack.md              ← "This Feels Illegal to Know"
│   ├── 04-challenge.md             ← Day X Series
│   ├── 05-rage-bait.md             ← Polarization Machine
│   ├── 06-tutorial.md              ← Speed Tutorial
│   ├── 07-duet-stitch.md           ← Stitch/Duet Hijack
│   ├── 08-trending-audio.md        ← Trending Audio Hijack
│   ├── 09-avatar-review.md         ← AI Avatar Review
│   └── 10-feature-deep-dive.md     ← Villain Character (Duolingo model)
└── research/
    ├── viral-tiktok-research-2026-04.md         ← 確定
    ├── short-form-video-frameworks-2025-2026.md ← 確定
    ├── thebranding-ai-reels-analysis.md         ← 未作成（次回タスク）
    └── tiktok-alarm-niche-analysis.md           ← 未作成（次回タスク）
```

---

## 再起動後の最初のアクション

このハンドオフファイルを読んだら、以下を実行:

1. Playwright MCP再接続確認
2. Instagram ログイン状態確認（`https://www.instagram.com/thebranding.ai/` にアクセス）
3. トップ10 Reelsを順に視聴・分析
4. `research/thebranding-ai-reels-analysis.md` に結果を保存
5. 分析結果をもとに `content-templates/` を再々刷新
