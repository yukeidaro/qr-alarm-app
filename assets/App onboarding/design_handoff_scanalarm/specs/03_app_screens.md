# 03 · App Screens (9)

> Source: `_source/screens-app.jsx` の `HomeScreen` 〜 `QRAddNameScreen`
> 旧 `README.md` を画面別に整理し直したもの。

---

## 01 · Home（AlarmListView）

**目的**: アラーム一覧の確認・オン/オフ・新規追加。

### レイアウト
```
[StatusBar]
[Greeting text — 明朝体 20px]
[Next alarm countdown — 13px orange]
[AlarmCard × n — flex column, gap 10px]
[Spacer flex: 1]
[FloatingAddButton — center]
[TabBar]
```

### グリーティング
- フォント: **Shippori Mincho**, 20px / 600, color `#18181B`
- 時間帯別メッセージ（日本語、各 3 パターン、分 % 3 でランダム）
  - 0–4:  「まだ起きてますか、○○さん。寝る前にアラームをセットしましょう。」
  - 5–8:  「おはようございます、○○さん。」
  - 9–11: 「おはようございます、○○さん。」
  - 12–16:「こんにちは、○○さん。」
  - 17–20:「お疲れさまです、○○さん。そろそろ一息つきましょう。」
  - 21–23:「遅くなりましたね、○○さん。アラームをセットして休みましょう。」

### 次のアラームまで
- 時計 SVG (13×13) + 「次のアラームまで○時間○分」
- 13px / 600 / orange `#F85A3E`
- 有効アラームがない場合は非表示

### AlarmCard
- height auto, R=18, bg `#FFFFFF`, border 1px `#E5E5E7`, padding 14px 16px
- flex row, align center, gap 12px
- opacity: ON=1.0 / OFF=0.45（200ms transition）
- 時刻: 30px / 700 / `letter-spacing: -1.2` / `tabular-nums`
- AM/PM: 13px / 500 / `#A1A1AA`
- 曜日: 11px / monospace / `#D4D4D8`
- QR バッジ（QR 設定時のみ）: orange / 11px / padding 4px 9px / R=999
- トグル右端: W=50 H=30, knob 26, transition 200ms

### FAB
- 56×56, R=56, bg orange
- shadow `0 8px 20px rgba(248,90,62,0.22), 0 0 0 6px rgba(248,90,62,0.08)`
- 配置: タブバー直上、中央

---

## 02 · Alarm Edit（AlarmEditView）

**目的**: 時刻・サウンド・スヌーズ・繰り返し・コード設定（必須）。

### レイアウト
```
[NavBar: キャンセル | アラームを編集 | 保存]
[WheelTimePicker]
[OptionRow × 5]
[QR必須バナー]
```

### WheelTimePicker
- 時・分の 2 列ホイール、bg `#D9D9DC`
- 中央 76px / 700、上下 56/44/32/24px、opacity 0.65/0.40/0.25/0.15
- AM/PM 切替: 右側縦並び、active = ink 背景 + 白文字
- コロン (`:`) 52px / 700

### オプション行（各 H=52）
| ラベル | 右側 |
|---|---|
| ラベル | テキスト + 右矢印 |
| サウンド | 値 + 右矢印 |
| スヌーズ | トグル |
| 繰り返し | 値 + 右矢印 |
| QR・バーコードで解除 | トグル（必須） |

### QR コード選択エリア（トグル ON 時表示）
- タイトル「解除QRコード」
- カード横 3 列（冷蔵庫・洗面所・玄関 など）
- 選択中: orange 枠 + `orangeDim` 背景

### 必須バナー
- bg `#FDE9E4`, border 1px `rgba(248,90,62,0.2)`, R=12, padding 10px 14px
- text 12px / 600 / `#7A2512`: 「QR・バーコードを設定しないとアラームは機能しません」

---

## 03 · Settings（SettingsView）

**目的**: アプリ全体設定。

### セクション
1. **プロフィール** — orange 円アバター（イニシャル）+ 名前
2. **アラーム** — サウンド / スヌーズ間隔 / QR・バーコード管理
3. **通知・表示** — プッシュ通知（トグル）/ テーマ / デフォルトデバイス
4. **その他** — レビューを書く / ヘルプ・サポート / お問い合わせ

### 行スタイル
- H ≈ 52px, padding 13px 16px
- アイコン箱: 32×32, R=8, bg `#FDE9E4`（または セクション別色）
- ラベル: 15px / 500 / `#18181B`
- 詳細テキスト: 14px / `#A1A1AA`
- 右矢印 or トグル
- 区切り線: 0.5px / `#EDEDEF`（最終行なし）

---

## 04 · Sound Picker（SoundPickerView）

**目的**: テーマ別サウンド選択。

### レイアウト
```
[SubNavBar: ← 戻る | サウンド]
[音量スライダー]
[テーマタブ（横スクロール）]
[サウンドリスト]
```

### テーマタブ
- 「ナチュラル」「クラシック」「ミニマル」「エナジー」
- Active: bg ink + 白文字 / Inactive: 白 + ink3
- R=999、横スクロール可

### サウンド行
- 再生ボタン 34×34 円: 選択中 → orange 背景 + 一時停止アイコン
- 選択中の行: bg `#FDE9E4`
- チェック (選択中のみ): orange、右端

---

## 05 · Repeat（RepeatView）

**目的**: 繰り返し曜日設定。

### レイアウト
```
[SubNavBar]
[クイック設定（毎日/平日/週末/なし）横 4 列]
[曜日選択（日〜土 7 つの丸ボタン）]
[サマリーカード（オレンジ薄背景）]
```

### 曜日ボタン
- 32×32, R=32
- 選択中: bg orange, border 2px orange, white text, shadow `0 4px 10px rgba(248,90,62,0.22)`
- 非選択: bg `#F8F8F9`, border 2px `#E5E5E7`, ink3 text
- 13px / 700

---

## 06 · Snooze Interval（SnoozeIntervalView）

**目的**: スヌーズ間隔（3 / 5 / 10 / 15 分）。

### レイアウト
- 説明テキスト 13px / ink3
- 2 列グリッド × 4 オプション

### オプションカード
- R=16
- 選択中: bg ink, border 1px ink
- 非選択: bg surface, border 1px line
- 数字 28px / 700 / `tabular-nums`
- 選択中: orange 丸 (20×20) のチェックアイコン

---

## 07 · QR Code Manage（QRCodeManageView）

**目的**: 登録済みコード一覧 + 新規追加。

### レイアウト
```
[SubNavBar]
[追加ボタン（破線オレンジ枠）]
[コードリスト]
[ヒントカード]
```

### 追加ボタン
- H=50, R=16
- border 1.5px dashed orange, bg `#FDE9E4`
- text「コードを追加」 15px / 700 / orange

### コード行
- アイコン 48×48, R=12, orangeDim 背景
- 名前 15px / 700
- 件数バッジ「アラーム○件」 orange / 11px
- 右矢印

### ヒントカード
- bg `#F8F8F9`, 12px text
- 「ベッドから離れた場所にあるものを登録するのがコツです...」

---

## 08 · QR Scan（QRScanView）

**目的**: バーコード/QR をカメラでスキャン。

### レイアウト
- ダーク背景 `#0A0A0A`
- ビューファインダー: 220×220, 角ブラケット (orange, 28×28, 3px 太さ)
- スキャンライン: orange, 上下ループ (2.4s サイクル)

### 成功時の状態変化
1. スキャンライン消失
2. ✓ がオレンジ円にスプリング展開（scale 0.6→1.1→1.0、400ms spring）
3. パルスリング（外側へ広がって消える、1.2s ループ）
4. テキスト「スキャン成功！」（orange）
5. 下部「次へ → 名前をつける」 orange ボタン出現

### キーフレーム
```css
@keyframes scan {
  0%   { top: 8%; opacity: 0; }
  8%   { opacity: 1; }
  88%  { top: 88%; opacity: 1; }
  95%  { opacity: 0; }
}
animation: 2.4s ease-in-out infinite

@keyframes ring {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
animation: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards

/* SVG check */
stroke-dasharray: 40;
stroke-dashoffset: 40 → 0;
animation: 0.5s 0.3s ease-out forwards
```

---

## 09 · QR Name（QRNameView）

**目的**: スキャン済みコードに名前付けて保存。

### レイアウト
```
[SubNavBar]
[スキャン成功カード（QRプレビュー＋成功バッジ）]
[名前入力フィールド]
[候補チップス]
[「このコードを保存」CTAボタン]
```

### 名前入力
- H=52, R=14, bg surface
- border 2px orange（focus 状態）
- 16px / 500
- カーソル: 2×20px のオレンジ縦棒

### 候補チップ
- 「冷蔵庫」「洗面所」「トイレ」「玄関」「キッチン」「リビング」
- 選択中: orange 枠 + `orangeDim` 背景 + orange 文字
- 非選択: ink4 枠 + `surfaceAlt` 背景
