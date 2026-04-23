# Video Design Reference: Alarm App (Vibe Code Showcase)

Source: `12-qr-alarm-app/assets/screenshots/MicrosoftTeams-video.mp4`
Origin: Threads投稿 by @slava7118 -- "Vibe Code Fully Working Apps"
Extracted: 2026-04-16
Skill: video-to-design (ffmpeg frame extraction + Claude Vision)

---

## ScanAlarmへの適用マッピング

動画から抽出した要素を、ScanAlarmの既存デザインシステム（design-spec.md）との対応で整理する。

### 採用候補 (高優先)

| 要素 | 動画での実装 | ScanAlarmでの適用案 | 既存との整合性 |
|------|------------|-------------------|---------------|
| **バーコード装飾** | 時刻表示下に縦線パターン | QRコードスキャンアプリとの親和性が高い。アラーム画面の装飾として | Nothing Phoneドットスタイルの派生として自然 |
| **ドットマトリクスアニメーション** | "Creating Alarm"画面で踊る人物 | アラーム作成中のローディング/フィードバック | 既存のNothing Clock風ドットスタイルと完全合致 |
| **動的カラーテーマ** | カラーピッカーで5色切替 | Settings画面にテーマカラー選択を追加 | 既存のlight/darkに加え、アクセントカラー選択として |
| **フローティングカード** | アラーム情報を軽いシャドウのカードで表示 | 次アラーム情報の表示に活用 | 既存bgElevatedスタイルで実装可能 |

### 採用候補 (中優先)

| 要素 | 動画での実装 | ScanAlarmでの適用案 |
|------|------------|-------------------|
| **フィッシュアイ時間ピッカー** | 中央拡大のスクロールホイール | 標準ピッカーの代替。実装コスト高 |
| **音声入力アラーム作成** | "Create Alarm to 9:45 AM Today to Morning Run" | 将来機能として検討 |
| **メディアコントロール風ボタン** | 前/一時停止/次のスキップUI | Snooze画面での操作UIに |

### 不採用 (ScanAlarmの方向性と合わない)

| 要素 | 理由 |
|------|------|
| 赤/ピンク/黄テーマのビビッドカラー | ScanAlarmはウォームベージュ+ゴールドの落ち着いた世界観 |
| アナログ時計フェイス | ScanAlarmはデジタル表示が基本 |
| ゲーム選択画面 | ScanAlarmはQRスキャンに特化 |

---

## 抽出デザイン要素（詳細）

### Color System（動画から5テーマ確認）

#### Theme: Red/Crimson
| Role | HEX (推定) |
|------|------------|
| Primary BG | #E53935 |
| Secondary BG | #C62828 |
| Text Primary | #FFFFFF |
| Barcode decoration | #B71C1C |

#### Theme: Yellow
| Role | HEX (推定) |
|------|------------|
| Primary BG | #FFD600 |
| Text Primary | #1A1A1A |
| Barcode decoration | #827717 |

#### Theme: Pink
| Role | HEX (推定) |
|------|------------|
| Primary BG | #F8BBD0 |
| Text Primary | #1A1A1A |

#### Theme: Light/Warm White
| Role | HEX (推定) |
|------|------------|
| Primary BG | #F5F0EB |
| Secondary BG | #FFFFFF |
| Text Primary | #1A1A1A |
| Dot grid | #D5D0CB |

#### Theme: Dark
| Role | HEX (推定) |
|------|------------|
| Primary BG | #000000 |
| Secondary BG | #1C1C1E |
| Accent | テーマ色（動的） |

**ScanAlarmとの比較**: Light/Warm Whiteテーマが ScanAlarm の light テーマ (#F5F0EB) とほぼ一致。同じデザイン言語圏にあるアプリ。

---

### Typography

| Element | Style | Size (推定) | Weight |
|---------|-------|------------|--------|
| Screen title | サンセリフ | 28-34pt | Bold (700) |
| Time display | サンセリフ/モノスペース | 64-80pt | Bold (700) |
| "Creating Alarm" | セリフ/ディスプレイ | 28-32pt | Bold (700) |
| Subtitle | サンセリフ | 12-14pt | Regular (400) |
| Button label | サンセリフ | 12-14pt | Medium (500) |
| Day labels | サンセリフ | 10-12pt | Medium (500) |
| Time picker numbers | サンセリフ | 24-48pt | Bold (700) |

**ScanAlarmへの示唆**: 時刻表示のletter-spacing拡大（2-4px推定）はScanAlarmでも試す価値あり。

---

### Components（ScanAlarmに適用可能なもの）

#### Barcode Decoration（新規提案）
```
実装案:
- 縦線の集合体（1-4px幅、ランダムパターン）
- 高さ: 40-60px
- テーマカラーに連動
- 1本だけアクセントカラー（ゴールド #E8A838）
- 配置: 時刻表示の下、またはカードの装飾
```

#### Dot Matrix Animation Canvas（既存拡張）
```
現在: Nothing Clock風ドットスタイルはコンセプトのみ
動画参考:
- ドットサイズ: 4-6px
- 色: ダークグレー on ライトグリッド背景
- フレームアニメーション（8-12fps、レトロ感）
- 人物・オブジェクトのドット絵を踊らせる
適用案: アラーム待機画面のアンビエントアニメーション
```

#### Floating Info Card（既存拡張）
```
動画参考:
- 角丸: 12-16px
- 白背景 + 軽いドロップシャドウ
- 内容: アラーム名 + 時刻
- アニメーション: スケール + フェードイン (spring, 300-400ms)
ScanAlarm適用: bgElevated (#FFFFFF light / #2A2725 dark) で実装可能
```

#### Weekly Day Selector
```
動画参考:
- 横一列 Mon-Sun、均等配分
- アクティブ: 色付きドットインジケーター (4px)
- 非アクティブ: テキストのみ
ScanAlarm: 既存の繰り返し曜日選択UIに類似。ドットインジケーターの追加を検討
```

#### Sound / Snooze / Repeat Buttons
```
動画参考:
- 横3列均等、アイコン + ラベル + サブテキスト
ScanAlarm: アラーム編集画面のアクションボタンに類似パターンを適用可能
```

---

### Animation & Motion

#### 1. Dot Matrix Dance
- **タイプ**: フレームアニメーション（スプライトシート式）
- **fps**: 8-12fps（レトロ感）
- **ループ**: 無限
- **ScanAlarm適用**: React Native の `Animated` API + setInterval で実装可能

#### 2. Floating Card Appearance
- **タイプ**: スケール + フェードイン
- **duration**: 300-400ms
- **easing**: spring (damping: 0.7, stiffness: 300)
- **ScanAlarm適用**: `react-native-reanimated` の `withSpring` で実装

#### 3. Color Theme Transition
- **タイプ**: 背景色クロスフェード
- **duration**: 400-500ms
- **easing**: ease-out
- **ScanAlarm適用**: テーマ切替アニメーション。`useAnimatedStyle` で色のトランジション

#### 4. Time Picker Fisheye
- **タイプ**: スケール + 不透明度の連動
- 中央: scale(1.0) opacity(1.0) → 周辺: scale(0.5) opacity(0.4)
- **ScanAlarm適用**: 実装コスト高。カスタムScrollViewが必要。将来検討

---

### Key Screens（フレーム参照）

| 画面 | 代表フレーム | 内容 |
|------|------------|------|
| Alarm Main (Red) | frames/every1s_001.jpg - 003.jpg | 大きな時刻、バーコード、曜日セレクター |
| Creating Alarm | frames/every1s_005.jpg, 007.jpg, 016-018.jpg | ドットマトリクスダンス、フローティングカード |
| Choose App | frames/every1s_007-009.jpg | アナログ時計、ドットグリッド |
| Time Picker | frames/every1s_017-020.jpg | フィッシュアイスクロールホイール |
| Create (Yellow) | frames/every1s_012-014.jpg | 黄テーマ、Sound/Snooze/Repeat |
| Alarm Main (Light) | frames/every1s_008-010.jpg | 白/ベージュ、バーコード |

フレーム保存先: `12-qr-alarm-app/assets/screenshots/frames/`
