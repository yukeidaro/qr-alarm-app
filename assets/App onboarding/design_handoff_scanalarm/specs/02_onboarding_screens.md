# 02 · Onboarding Screens (8)

> Source: `_source/screens.jsx` の `SplashScreen` 〜 `ReadyScreen`
> Device frame: 340 × 736 (`PhoneShell`)。実機は 390×844 でスケール調整。
> 共通: 画面下部 `BottomArea` = ドット (`Dots`) + `PillCTA` + 「Skip」テキスト。

---

## 01 · Splash

**目的**: 起動直後 1〜2 秒のロゴ表示。

### レイアウト
- 中央配置、`flex: 1` で縦中央
- App icon: `96×96`, R=22, `bg: orange`, シャドウ `0 18px 40px rgba(248,90,62,0.22), 0 0 0 8px rgba(248,90,62,0.06)`
- アイコン内部: 4 種のロゴ SVG（時計 + QR ファインダー組み合わせ。プロトタイプは `__splashLogo` で切替可、デフォルト V1）
- アプリ名: 「ScanAlarm」 28px / 700 / `letter-spacing: -0.6` / `#18181B`
- タグライン: 「Wake up. For real.」 14px / 500 / `#A1A1AA`
- 下部 48px 上に 3 ドット（中央のみ orange）

### 推奨実装
- 起動時のみ表示、自動で ValueProp1 へクロスフェード（300ms）

---

## 02 · Value Prop 1 — Wake up. For real.

**目的**: 「スヌーズで終わらず本当に起きられる」価値訴求。

### レイアウト
```
[Hero card – flex 1, m: 24px, R=22, surface, border line]
  [Scene 1: ベッドで寝てる人がアラームをスヌーズ → ✕（赤）]
  [Scene 2: 起き上がってドアの QR をスキャン → ✓（緑）]
  ※ 2 シーンを 8 秒ループでクロスフェード
[Copy area – padding: 28px 28px 8px, center]
  Headline: "Wake up.<br/>For real." 28px/700/-0.6
  Body:     "No more serial snoozing..." 15px/-0.1, color ink2
[BottomArea step=0 of 4]
```

### アニメーション
- 全体ループ: 8s, ease-in-out, infinite
- Scene 1 (0-45%): アラームシェイク → 手スラップ → zzz → ✕ バッジ
- Scene 2 (50-95%): 歩行 (leg swing 0.5s) → QR appear → scan flash → ✓ バッジ

詳細キーフレームは `_source/screens.jsx` L209-302 を参照。

---

## 03 · Value Prop 2 — Scan to dismiss

**目的**: バーコード/QR スキャンの仕組みを示す。

### レイアウト
- Hero card 内中央に `180×180` のスキャンフレーム
- バーコード（28本のラインと 13 桁の数字「4 901234 567894」、`SF Mono` 11px）
- 4 隅にオレンジのコーナーブラケット（`20×20`, border 3px, R=3）
  - Pulse animation: スキャン成功時 0.7s 間 green (`#27A862`)
- スキャンライン: 横幅いっぱい、高さ 2px、orange、glow `0 0 16px orange`、4 秒ループで縦移動
- 成功時オーバーレイ: `72×72` 緑円 + 白チェック + 拡大リング

### コピー
- Headline: 「Scan to dismiss」
- Body: "Any barcode works — the one on your toothpaste, cereal box, shampoo bottle, or a QR taped to the fridge..."
- BottomArea step=1 of 4

---

## 04 · Value Prop 3 — Smart routines

**目的**: 睡眠学習機能の訴求。

### レイアウト
- Hero card 内に 14 本のバーチャート（睡眠波形）
  - `width: 8px each, gap: 6px, height: %, R=4`
  - インデックス 4-9 が orange + glow、それ以外は `ink4`
- 左上ラベル: 「SLEEP — LAST 7D」 11px/600/letter-spacing 1.2、ink3
- 右下ラベル: 「DEEP · 6h 42m」 同フォント、orange
- Headline: 「Smart routines」
- Body: "Learns your sleep patterns and suggests better wake-up times over time."
- BottomArea step=2 of 4

---

## 05 · Sign up（任意）

**目的**: アカウント作成（メール / Apple / Google）。アカウント不要設計でもオンボーディングフローに含めて良い。

### レイアウト
- 上部余白 40px、横 24px
- Headline 28px/700/-0.6: "Create your<br/>account"
- Sub: "Sync alarms and QR codes across devices." 15px/ink2
- Email input: H=56, R=9999, surface, border line, padding 0 22px, ink3 placeholder
- Primary CTA: PillCTA "Continue with email" (orange)
- "OR" 区切り線 (両側 `line` 1px、中央 12px ink3 letter-spacing 0.5)
- AuthBtn × 2:
  - Apple: H=54, R=9999, bg ink, fg #fff, Apple SVG
  - Google: H=54, R=9999, bg surface, border line, fg ink, multi-color G SVG
- 下部: "By continuing you agree to Terms & Privacy" 12px/ink3

---

## 06 · Permissions

**目的**: 通知 + カメラの許可取得。

### レイアウト
- 上部余白 40px、横 24px
- Headline: "A couple<br/>permissions" 28px/700
- Sub: "So alarms can ring and you can scan QR codes."
- PermCard × 2 (gap 12px):
  - 各カード: surface / border line / R=22 / padding 18 / flex row gap 14
  - Icon box 44×44, R=12, `orangeDim` 背景、内部 22px orange ストロークアイコン
  - Title 16px/600 + Body 13px/ink2 line-height 1.4
  - Toggle: 44×26, R=999, knob 22px, default = granted (orange)
- フッター CTA: PillCTA "Allow & Continue" + 14px/ink3 "Not now"

---

## 07 · First Alarm（編集風 / オンボーディング版）

**目的**: 初回アラーム設定。実アプリの編集画面と類似。

### レイアウト
- 全体背景: `#D9D9DC`（編集画面と同じ）
- Wheel area (flex 1):
  - 左右 2 列の **オーバル形ホイール**（中央が膨らんだベジェ曲線）
  - 9 個の数字を曲線に沿って配置
  - 中央 76px / 700 weight、外に向かって 56→44→32→24px、opacity 1→0.65→0.40→0.25→0.15
  - 中央以外 weight 400、letter-spacing -1（中央 -2）
  - フォント: Inter / `tabular-nums`
  - 中央のオレンジ括弧：左 `M 145 0 C 168 200 168 400 145 600`、右 `M 195 0 C 172 200 172 400 195 600`、stroke orange opacity 0.65
- Action row (4 列):
  - Sound / Snooze / Repeat: 32px line アイコン + 13px/600/ink ラベル
  - **コード設定（必須）**: orange アイコン + orange ラベル + 右上に 8px ドット (orange + glow)
  - Border-top `rgba(24,24,27,0.08)`
- 必須バナー:
  - Margin 0 20 12, padding 10 14, R=12, `orangeDim` 背景, border `rgba(248,90,62,0.2)`
  - i アイコン (orange) + 「QRコードを設定しないとアラームは機能しません」12px/600/orangeInk
- ボトムバー:
  - 左: ✕ アイコン (40×40, ink2)
  - 中央: 「Choose time」14px/500/ink2
  - 右: ✓ ボタン (44×44, R=44, bg ink, white check, シャドウ)

---

## 08 · Ready

**目的**: オンボーディング完了。

### レイアウト
- 中央配置 (gap 30, padding 24)
- 完了マーク: `108×108` 円, bg orange
  - シャドウ多重リング: `0 20px 48px rgba(248,90,62,0.22), 0 0 0 10px rgba(248,90,62,0.08), 0 0 0 20px rgba(248,90,62,0.04)`
  - 内側に白チェック (50×50, stroke 5)
- Headline: "You're all set" 30px/700/-0.6
- Body: "Your first alarm is ready for **tomorrow at 7:45 AM**. Sweet dreams." 15px/ink2、最大幅 260
  - 太字部分は `color: ink, fontWeight: 600`
- フッター: PillCTA glow "Let's go →" (padding 0 24 40)

### アニメーション
- チェックマーク: stroke draw + scale 0.6→1.1→1.0 (spring)
- 多重リング: ループパルス（任意）
