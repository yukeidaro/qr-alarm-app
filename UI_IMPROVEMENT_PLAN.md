# QRコードアラームアプリ — UI/UX改善リサーチ & 戦略

## 📋 現状の課題(as of 20260320)

### アプリの技術スタック
- **Expo** (~54.0.0) + **React Native** (0.81.5) + **React** (19.1.0)
- **Expo Router** (6.0.23) — ファイルベースルーティング
- **TypeScript** — 厳格モード
- フォント: **Klee One** (Google Fonts)
- ダークモードのみ（ハードコード）

### UI/UXの主な問題点

| 分類          | 問題                                   | 影響度    |
| ----------- | ------------------------------------ | ------ |
| デザインシステム不在  | 200+箇所にハードコードされたカラー値（`#D4A574`が15+回） | 🔴 致命的 |
| コンポーネント化不足  | 再利用コンポーネントは HandwrittenText の1つだけ    | 🔴 致命的 |
| スタイルの重複     | 各画面に50〜200行のインラインStyleSheet          | 🔴 致命的 |
| タイポグラフィ未体系化 | フォント名60+回ハードコード、サイズ10〜128pxまで散在      | 🟠 重大  |
| マジックナンバー多数  | スペーシング・アニメーション時間がバラバラ                | 🟠 重大  |
| モーダルの重複実装   | 3つのモーダルが類似パターンで個別実装                  | 🟡 中程度 |
| アクセシビリティ欠如  | accessible/accessibilityLabel未設定     | 🟡 中程度 |
| レスポンシブ非対応   | 画面サイズハードコード                          | 🟡 中程度 |

---

## 🛠️ AI × MCP を活用したUI構築戦略

### 戦略A: Figma MCP（推奨 ⭐）

**概要**: Figmaでデザインを作成 → Figma MCP Serverで構造データをAIに渡す → AIがReact Nativeコードを生成

**ワークフロー**:
1. Figmaでアラームアプリの各画面をデザイン（4画面: Home, Edit, Scan, Ringing）
2. Figma Dev Mode MCP Serverを有効化（`http://127.0.0.1:3845/mcp`）
3. Copilot CLI / Claude Code にMCPサーバーを接続
4. 画面ごとに「このフレームをReact Nativeコンポーネントに変換」と指示

**セットアップ**:
```
# Figma Desktop → Menu → Preferences → Enable Dev Mode MCP Server
# VS Code: Cmd+Shift+P → MCP: Add Server → http://127.0.0.1:3845/mcp
# Claude Code: claude mcp add --transport sse figma-dev-mode-mcp-server http://127.0.0.1:3845/sse
```

**メリット**:
- デザイントークン（色、フォント、スペーシング）が自動的にコードに反映
- コンポーネント構造がFigmaの階層から正確に再現
- デザイン変更時に差分だけAIに再生成させられる

**デメリット**:
- Figmaでのデザイン作成が前提（デザインスキル or テンプレートが必要）
- Dev Mode（有料プラン）が必要

---

### 戦略B: AIネイティブUIジェネレーター + MCPなし

**概要**: テキストプロンプトでUIを直接生成させるアプローチ

**推奨ツール**:

| ツール | 特徴 | 用途 |
|--------|------|------|
| **RapidNative** | テキスト→React Native UI生成。NativeWind対応 | プロトタイピング |
| **Copilot CLI (frontend-design skill)** | 高品質なフロントエンドUI生成 | コンポーネント構築 |
| **v0.dev** | テキスト→UIコンポーネント生成（Vercel） | インスピレーション |

**ワークフロー**:
1. 参考となるアプリUIのスクリーンショットを集める
2. AIに「このデザインに近いReact Nativeコンポーネントを作って」と指示
3. デザインシステム（colors, typography, spacing）を最初に定義
4. 各画面を順次リファクタリング

---

### 戦略C: ハイブリッド（最もバランス良い ⭐⭐）

**概要**: デザインシステムをAIで先に構築 → Figma MCPで個別画面を洗練

**ステップ**:
1. **Phase 1 — デザインシステム構築**（MCPなし、AI直接生成）
   - `constants/colors.ts` — カラーパレット定義
   - `constants/typography.ts` — フォントスケール
   - `constants/spacing.ts` — 8ptグリッドベースのスペーシング
   - `theme/ThemeProvider.tsx` — React Contextベースのテーマ

2. **Phase 2 — 共通コンポーネント抽出**（AI + frontend-design skill）
   - `Button` — Primary / Secondary / Danger / Ghost
   - `Card` — SwipeableAlarmCard
   - `Modal` — 共通BottomSheet
   - `Typography` — H1, H2, Body, Label, Caption
   - `Input` — TextInput, Switch, TimePicker wrapper

3. **Phase 3 — 画面リデザイン**（Figma MCP連携）
   - Figmaで理想のUIをデザイン
   - MCP経由でAIにデザインデータを渡す
   - コンポーネントベースでコード生成
   - アニメーション・マイクロインタラクション追加

---

## 🔥 バズっているUI/UXのトレンド（2025-2026）

### デザイントレンド
- **ニューモーフィズム** — 柔らかい影とハイライトで立体感
- **グラスモーフィズム** — 半透明＋ぼかし効果（`blur`）
- **グラデーション** — 微妙な色変化で奥行き感
- **マイクロインタラクション** — ボタン押下、画面遷移のなめらかなアニメーション
- **ダークモード + 暖色アクセント** — 現在のアプリの方向性に合致

### バズった事例
- **RapidNative** のデモ投稿: テキストプロンプトだけで美しいダッシュボードUIを生成
- **react-native-ai** (dabit3): LLM統合チャットUIを10分で構築
- **Figma → Code** Before/After 投稿: デザインとコードの一致度を示すコンテンツ
- **NativeWind** を使ったTailwind CSSベースの美しいRN UI

### 参考UIライブラリ（Expo/RN対応）
| ライブラリ | 特徴 |
|-----------|------|
| **Gluestack UI v2** | アクセシブル、テーマ対応、NativeWind統合 |
| **NativeWind** | Tailwind CSS for React Native |
| **React Native Reanimated** | 60fps高性能アニメーション |
| **react-native-skia** | カスタム描画（グラデーション、ブラーなど） |
| **Moti** | Reanimatedベースの宣言的アニメーション |

---

## 🗺️ 実施計画

### Phase 1: 基盤整備（デザインシステム） ✅ 完了
- [x] カラーパレット定数化 (`constants/colors.ts`)
- [x] タイポグラフィスケール定義 (`constants/typography.ts`)
- [x] スペーシングスケール定義 (`constants/spacing.ts`)
- [x] テーマプロバイダー作成 (`theme/index.tsx`)

### Phase 2: コンポーネントライブラリ ✅ 完了
- [x] Button コンポーネント（4バリアント）
- [x] Card / AlarmCard コンポーネント
- [x] Modal / AppModal コンポーネント
- [x] Typography コンポーネント群

### Phase 3: 画面リファクタリング ✅ 完了
- [x] _layout.tsx — ThemeProvider統合
- [x] Home画面（index.tsx） — 全定数化 + コンポーネント適用
- [x] Edit画面（edit.tsx） — 全定数化 + AppModal適用
- [x] Ringing画面（ringing.tsx） — 全定数化
- [x] Scan画面（scan.tsx） — 全定数化
- [x] HandwrittenText — 定数化 + useEffect依存配列バグ修正

### Phase 4: Figma MCP連携 ✅ 完了（frontend-designベース）
Figma MCPが未接続のため、直接コード改善アプローチで実施。
Figmaでの微調整は後日対応可能な構造を維持。

**完了内容**:
- [x] `expo-linear-gradient` 導入
- [x] Home画面リデザイン（グラデーション背景、改善FAB、アクセント付きセクション）
- [x] AlarmCard改善（有効時グラデーント背景、曜日別ハイライト、左アクセントバー強化）
- [x] Edit画面リデザイン（カードベースセクション、グラデーション曜日セレクター、保存ボタン）
- [x] Ringing画面リデザイン（緊急度グラデーション背景、グラデーションCTAボタン）
- [x] Scan画面改善（角マーカー付きスキャンフレーム、グラデーションステータスピル）

### Phase 5: UI簡素化 ✅ 完了 (2026-03-27)
- [x] 全画面からLinearGradient装飾を除去 → フラットでクリーンなダークUIに統一
- [x] HandwrittenTextアニメーション廃止 → 普通のTextに
- [x] FAB/ボタンのグラデーション除去 → ソリッドカラー
- [x] AlarmCardのグラデーション背景除去 → BG_SECONDARYソリッド

### Phase 6: スヌーズUX改善 ✅ 完了 (2026-03-27)
- [x] `app/snooze.tsx` 新規作成 — スヌーズ待機画面（カウントダウン + スキャン解除のみ）
- [x] スヌーズ後にホーム画面ではなくスヌーズ画面に遷移（QRバイパス防止）
- [x] ホーム画面からスヌーズ画面への自動リダイレクト
- [x] Android戻るボタン + iOSスワイプバック無効化
- [x] Ringing画面から非QR解除ボタン削除 → スキャンのみ

### Phase 7: AdMob広告統合 ✅ 完了 (2026-03-27)
**ライブラリ**: `react-native-google-mobile-ads` (Invertase)
**状態**: TestIds使用中。本番リリース前にAdMobコンソールのAd Unit IDに差し替え。

- [x] `react-native-google-mobile-ads`, `expo-tracking-transparency`, `expo-build-properties` インストール
- [x] `app.json` にAdMob plugin設定追加
- [x] `eas.json` 作成（development/preview/production プロファイル）
- [x] `_layout.tsx` でAdMob SDK初期化 + iOS ATTプロンプト
- [x] `services/adService.ts` 作成 — Ad Unit ID管理 + useRewardedAdフック
- [x] `components/AdBanner.tsx` 作成 — バナー広告コンポーネント
- [x] `app/ringing.tsx` にバナー広告（上部 + ボタン上）追加
- [x] `app/ringing.tsx` のスヌーズ3回目をリワード広告に差し替え（自前プレースホルダー削除）
- [x] `app/snooze.tsx` にバナー広告（上部 + ボタン上）追加

**広告配置**:
| 画面 | 広告タイプ | 位置 |
|------|-----------|------|
| Ringing | バナー | 上部スペース + ボタン上 |
| Snooze待機 | バナー | 上部 + ボタン上 |
| Ringing (3回目スヌーズ) | リワード | フルスクリーン（視聴完了でスヌーズ付与） |

### Phase 8: TestFlight / ストア配信準備
- [x] Apple Developer Program 登録済み
- [ ] `npx testflight` でiOS TestFlight配信
- [ ] Google Play Console 登録 + Internal Testing配信
- [ ] AdMobアカウント作成 + Ad Unit ID取得 → adService.tsのIDを差し替え
- [ ] EAS Update設定（OTAアップデート用）

---

## リサーチドキュメント
- `output/research_admob_expo.md` — AdMob統合リサーチ（ライブラリ、ポリシー、収益見込み）
- `output/research_latest.md` — TestFlight / Google Play配信リサーチ（手順、タイムライン）
