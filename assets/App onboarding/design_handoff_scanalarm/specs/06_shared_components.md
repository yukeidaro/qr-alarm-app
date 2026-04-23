# 06 · Shared Components / Atoms

> Source: `_source/screens.jsx`（オンボーディング共通）+ `_source/ios-frame.jsx`（iOS デバイス枠）+ `_source/screens-app.jsx`（アプリ共通）

これらは **デザインリファレンス用** の React コンポーネントとして書かれている。実装側（React Native / Swift）では同等の振る舞いを持つ部品として再構築する。

---

## PillCTA

主要 CTA ボタン。

### 通常
```
height: 56, borderRadius: 9999, background: #F85A3E
display: flex, center
fontSize: 17, fontWeight: 600, color: #fff, letter-spacing: -0.2
boxShadow: 0 6px 16px rgba(248,90,62,0.22)
```

### glow バリアント（Ready 画面の最終 CTA）
```
boxShadow: 0 12px 32px rgba(248,90,62,0.22), 0 0 0 6px rgba(248,90,62,0.08)
```

### ghost バリアント（セカンダリ）
```
background: transparent
border: 1px solid #E5E5E7
color: #18181B
（同じ height / radius / font）
```

---

## Dots（オンボーディングのページネーション）

- ドット数: `n`（デフォルト 4）
- アクティブインデックス: `i`
- 各ドット: H=6px, R=6px
- アクティブ: W=22, bg orange
- 非アクティブ: W=6, bg `#D4D4D8`
- transition: all 200ms

---

## BottomArea（オンボーディング共通フッター）

```
padding: 16px 24px 34px
flex column, gap 18

[Dots — 中央]
[PillCTA "Continue"]
[Skip — 14px / 500 / #A1A1AA, center]
```

---

## PhoneShell（プロトタイプ用デバイス枠）

`IOSDevice` をラップした 340×736 の枠。実装時は不要。
- 背景: `#F4F4F5`（dark = `#0E0E10`）
- 上部 paddingTop 54（ステータスバー分）

---

## SubShell（アプリ内のサブ画面ヘッダ）

戻るボタン付きのサブ画面（Sound Picker、Repeat、QR Manage、Snooze Interval、QR Name 等で共通）。

```
[← 戻る (orange) | タイトル (中央, ink, 17px / 600) | 右ボタン (任意)]
[コンテンツ]
```

- 戻るボタン: orange `#F85A3E` 文字 + ← アイコン
- タイトル: 中央配置、ink、17px / 600
- 高さ: ~44px、下に 1px line ボーダー（任意）

---

## IOSDevice（プロトタイプ用、参考）

実装側では **不要**（実機の SafeArea を使う）。仕様参照のみ。

- 標準: 402 × 874、R=48、bg `#F2F2F7`
- ScanAlarm 用: 340 × 736
- Dynamic Island: 126×37、top 11、R=24、bg `#000`、z=50
- Home Indicator: 139×5、R=100、bg `rgba(0,0,0,0.25)`、bottom 8px

---

## IOSStatusBar

- padding: 21px 24px 19px
- 時刻 17px / 590（SF Pro）
- 右側: signal bars (4本) + WiFi + battery

---

## IOSGlassPill / IOSNavBar

iOS 26 (Liquid Glass) スタイル。
- `backdrop-filter: blur(12px) saturate(180%)`
- 内側に shine: `inset 1.5px 1.5px 1px rgba(255,255,255,0.7)`
- border: 0.5px `rgba(0,0,0,0.06)`
- light/dark 両対応

実装側では React Native の `BlurView` で代替可。

---

## IOSList / IOSListRow（参考）

iOS の Grouped List。ScanAlarm では Settings / QR Manage で類似スタイル。
- リストカード: bg surface, R=26, margin 0 16
- 行: H=52, padding 0 16, fontSize 17, letter-spacing -0.43
- アイコン箱: 30×30, R=7
- 区切り線: 0.5px `rgba(60,60,67,0.12)`、icon 有時は left=58、無時は left=16

---

## AlarmCard（ホーム画面）

```
bg: #FFFFFF, border: 1px #E5E5E7, R: 18, padding: 14 16
flex row, align center, gap 12
opacity: 1.0（ON） / 0.45（OFF）, transition 200ms

[時刻 30/700/-1.2/tabular] [AM/PM 13/500/ink3] [曜日 11/mono/ink4] [QRバッジ?] [Toggle 50×30]
```

QR バッジ: orange `#F85A3E`, 11px, padding 4px 9px, R=999

---

## ToggleSwitch

### アラームカード用
- 50 × 30, knob 26
- ON: bg orange / OFF: bg `#D4D4D8`
- transition 200ms

### Permissions 用
- 44 × 26, knob 22
- ON: bg orange / OFF: bg `#D4D4D8`
- knob shadow: `0 1px 3px rgba(0,0,0,0.18)`

---

## OptionRow（Edit / Settings 共通）

- H=52, padding 13 16
- アイコン箱（任意）32×32, R=8, bg `#FDE9E4`
- ラベル: 15 / 500 / ink
- 詳細: 14 / `#A1A1AA`
- 右: 矢印 or トグル
- 区切り線: 0.5px `#EDEDEF` (最終行を除く)

---

## DayChip（Repeat 画面）

- 32 × 32, R=32
- 選択中: bg orange, border 2px orange, white text, shadow `0 4px 10px rgba(248,90,62,0.22)`
- 非選択: bg `#F8F8F9`, border 2px `#E5E5E7`, ink3 text
- 13px / 700

---

## SnoozeOptionCard

- R=16
- 選択中: bg ink, border 1px ink
- 非選択: bg surface, border 1px line
- 数字 28 / 700 / `tabular-nums`
- 選択中マーク: orange 円 20×20 + 白チェック

---

## ScanFrame（QR Scan / ValueProp2）

- 220×220 のビューファインダー
- 4 隅にコーナーブラケット (orange, 28×28, border 3px, R=3)
- スキャンライン（横幅 ≒ 内部全体, H=2, orange + glow）
- 成功時オーバーレイ: 円 (緑 or orange) + 白チェック + 拡大リング
