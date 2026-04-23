# ScanAlarm UI 設計監査レポート

`assets/App onboarding.zip` の HTML/JSX デザイン仕様と現行実装の照合結果。

## デザインシステム（zip からの正本）

- アクセント: 単一オレンジ `#F85A3E`（ハロー `rgba(248,90,62,0.22)` / dim `#FDE9E4`）
- ニュートラル: `bg #F4F4F5` / `surface #FFFFFF` / `line #E5E5E7` / `lineSoft #EDEDEF`
- インク: `ink #18181B` / `ink2 #52525B` / `ink3 #A1A1AA` / `ink4 #D4D4D8`
- フォント: Inter（本文 / UI）+ Shippori Mincho（ホーム挨拶のみ）+ Menlo / SF Mono（small caps ラベル）
- 半径: カード 22 / アラームカード 18 / ピル 9999

---

## 適合状況

| 画面 | デザイン定義 | 現行ファイル | 状態 |
|---|---|---|---|
| ホーム | `screens-app.jsx` HomeScreen | `app/(tabs)/index.tsx` | **OK（修正済）** |
| アラーム編集 | `screens-app.jsx` AlarmEditScreen | `app/edit.tsx` | **OK** |
| 設定 | `screens-app.jsx` SettingsScreen | `app/(tabs)/settings.tsx` | **OK** |
| タブバー | `screens-app.jsx` AppTabBar | `app/(tabs)/_layout.tsx` | **OK（修正済）** |
| オンボーディング 8 画面 | `screens.jsx` | `app/onboarding.tsx` | **OK** |
| サウンド選択 | `screens-app.jsx` SoundPickerScreen | `app/sounds.tsx` | **未移行** |
| QR 管理 | `screens-app.jsx` QRManageScreen | `app/qr-manage.tsx` | **未移行** |
| QR スキャン | `screens-app.jsx` QRAddScanScreen | `app/scan.tsx` | **未移行** |
| スヌーズ待機 | （仕様外） | `app/snooze.tsx` | デザイン仕様なし |
| 鳴動中 | （仕様外） | `app/ringing.tsx` | AI OS（意図的） |
| 音声出力先 | （仕様外） | `app/sound-output.tsx` | 旧テーマ |
| 広告完了 | （仕様外） | `app/ad-completion.tsx` | 旧テーマ |
| アラーム最適化 | （仕様外） | `app/alarm-optimization.tsx` | 旧テーマ |

---

## 今回の修正（このセッションで適用）

1. **ホーム画面の挨拶フォント** — `Inter_600SemiBold` → `ShipporiMincho_600SemiBold`
   デザインの `fontFamily: '"Shippori Mincho", "Georgia", serif'` に一致。
   - `app/_layout.tsx` で Shippori Mincho 500/600 をロード
   - `package.json` に `@expo-google-fonts/shippori-mincho` 追加

2. **タブバーアイコン** — Ionicons の汎用アラーム/歯車 → デザインのカスタム SVG
   - 時計（円 + 針 + 上部の耳のような線）
   - 歯車（外周円 + 8 方向の刻み）
   - `app/(tabs)/_layout.tsx`

3. **曜日ラベル表示** — ハードコード英語 → i18n + デザインのスマートグルーピング
   - 全 7 日 → `毎日`
   - 月〜金（5 日）→ `月〜金`
   - 土日 → `土 日`
   - その他 → ロケール曜日を半角スペース 1 個で結合
   - 日本語ロケール検出して切替（英語の場合 `Mon-Fri` / `Sat Sun`）

4. **tsconfig** — `assets/App_onboarding_extracted` を exclude に追加（解凍した参考資料が型チェック対象に入らないように）

`npx tsc --noEmit` クリーン通過を確認。

---

## 残課題（次セッション以降の推奨）

### 高優先（デザイン仕様あり、未移行）

- **`app/sounds.tsx`** → SoundPickerScreen に合わせて再設計
  カテゴリチップ（ピル）、行ごとの再生 ▶︎ ボタン（30×30 オレンジ円）、選択時オレンジドット（16×16）。
- **`app/qr-manage.tsx`** → QRManageScreen に合わせて再設計
  カードに 56×56 サムネイル + チェック付与済バッジ + 削除アイコン、ヘッダーは「戻る + 中央タイトル」。
- **`app/scan.tsx`** → QRAddScanScreen に合わせて再設計
  暗背景 + オレンジ角コーナー（24×24, 4px）、上部に 32×32 半透明 close 円。

### 中優先（仕様外）

- `snooze.tsx`, `ringing.tsx`, `sound-output.tsx`, `ad-completion.tsx`, `alarm-optimization.tsx`
  デザインに該当画面なし。現行のままでも整合性は崩れないが、`useTheme` + 旧 `colors.ts` 経由なので将来的に置換推奨。

### クリーンアップ

- `design-system/tokens/colors.ts` と `design-system/README.md` は旧 "Warm Glass" / "AI OS" 二系統前提。実装は単色オレンジに移行済なのでドキュメントも更新が必要（影響範囲が広いので別途）。
