# ScanAlarm Design System

シングルデザイン（Light grey + Orange）に統一済み。Warm Glass / AI OS のデュアル系は廃止。

## 配色トークン（実装は各画面の `const C` に展開）

| Token | Hex | 用途 |
|---|---|---|
| `bg` | `#F4F4F5` | 画面背景 |
| `surface` | `#FFFFFF` | カード背景 |
| `surfaceAlt` | `#F8F8F9` | サブカード・トラック |
| `line` | `#E5E5E7` | カード境界線 |
| `lineSoft` | `#EDEDEF` | カード内行区切り |
| `ink` | `#18181B` | 主要テキスト・選択中ピル |
| `ink2` | `#52525B` | 副テキスト |
| `ink3` | `#A1A1AA` | 弱いテキスト・補足 |
| `ink4` | `#D4D4D8` | アイコン・シェブロン |
| `orange` | `#F85A3E` | アクセント／選択／戻るリンク |
| `orangeDim` | `#FDE9E4` | 選択行背景／アイコン箱 |
| `orangeInk` | `#A8341E` | 強調テキスト（プレビュー枠など） |

## タイポグラフィ

- フォント: Inter (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`)
- 数値表示は `fontVariant: ['tabular-nums']`
- アラーム時刻など見出し: `letterSpacing: -1` 〜 `-0.3`

## レイアウト原則

- 画面ヘッダ: **SubShell** パターン (`戻る + タイトル + 右ボタン`)
- リストカード: `borderRadius: 16〜18` / `borderWidth: 1` / `borderColor: line`
- リスト内行区切り: 高さ1pxの `lineSoft` を `marginLeft 44〜78` で
- 行アイコン: 32〜36 角丸 8〜12 / `orangeDim` 背景
- iOS 上余白: `paddingTop: 50`、Android: `paddingTop: 28`

## 画面マップ → 実装ファイル

| デザイン画面 | 実装 |
|---|---|
| Home | `app/(tabs)/index.tsx` |
| Alarm Edit | `app/edit.tsx` |
| Settings | `app/(tabs)/settings.tsx` |
| Sound Picker | `app/sounds.tsx` |
| Repeat Days | `app/repeat.tsx` |
| Snooze Interval | `app/snooze-interval.tsx` |
| Sound Output | `app/sound-output.tsx` |
| QR Manage | `app/qr-manage.tsx` |
| QR Scan | `app/scan.tsx` |
| Ringing | `app/ringing.tsx`（暗背景・スコープ外） |
| Snooze Wait | `app/snooze.tsx`（暗背景・スコープ外） |

## ソースオブトゥルース

**2026-04 更新**: HTML/JSX プロトタイプを Markdown 仕様書化しました。
**実装時はまず仕様書を参照**してください。

📑 **新しい正本**: [`assets/App onboarding/design_handoff_scanalarm/specs/`](../assets/App%20onboarding/design_handoff_scanalarm/specs/00_INDEX.md)

| ドキュメント | 内容 |
|---|---|
| `01_design_tokens.md` | カラー / タイポ / スペーシング / シャドウ |
| `02_onboarding_screens.md` | オンボーディング 8 画面 |
| `03_app_screens.md` | アプリ本編 9 画面 |
| `04_navigation_flow.md` | 画面遷移とトランジション |
| `05_motion_spec.md` | アニメーション仕様 |
| `06_shared_components.md` | 共通アトム |

ピクセル単位の詳細は React プロトタイプ（`assets/App onboarding/design_handoff_scanalarm/_source/screens-app.jsx` 等）も参照可能。
ブラウザで `_source/ScanAlarm App Screens.html` を開けば動作確認できます。

`design-system/claude-design-source/` は旧コピー（参照のみ。今後は更新しない）。

## レガシー扱い

`constants/colors.ts` は旧 Warm Glass トークンを残しているが、現在は `theme/index.tsx` の `useTheme` 経由で `app/scan.tsx`, `app/snooze.tsx`, `app/ringing.tsx`, `app/ad-completion.tsx`, `app/alarm-optimization.tsx` のみが利用。リファクタ完了後に削除予定。

## 旧ファイル削除済み（過去セッション）

- `assets/App onboarding.zip`, `assets/App_onboarding_extracted/`
- `archive/`, `screenshots/reference/`, `screenshots/frames/`
- `assets/sounds/*_backup.wav`, `_backup_short/`
- `components/{AlarmCard,AppModal,BarcodeDecoration,DotMatrixBG,GlowCard,HandwrittenText,Typography}.tsx`
- `constants/{alarmThemes,index}.ts`
- `design-system/{components,tokens}/`, `design-system/screens.md`
- `design-system/{claude-design-prompt,prompt-cylinder-picker}.md`
