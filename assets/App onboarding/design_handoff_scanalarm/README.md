# ScanAlarm — Design Handoff

> **2026-04 リファクタ**: HTML/JSX プロトタイプを Markdown 仕様書化しました。
> 詳細仕様は [`specs/`](./specs/) を、動作プレビュー（React 実装）は [`_source/`](./_source/) を参照してください。

## クイックリンク

| | |
|---|---|
| 📑 仕様書一覧 | [`specs/00_INDEX.md`](./specs/00_INDEX.md) |
| 🎨 デザイントークン | [`specs/01_design_tokens.md`](./specs/01_design_tokens.md) |
| 📱 オンボーディング 8 画面 | [`specs/02_onboarding_screens.md`](./specs/02_onboarding_screens.md) |
| 📲 アプリ本編 9 画面 | [`specs/03_app_screens.md`](./specs/03_app_screens.md) |
| 🔄 画面遷移 | [`specs/04_navigation_flow.md`](./specs/04_navigation_flow.md) |
| 🎬 アニメーション仕様 | [`specs/05_motion_spec.md`](./specs/05_motion_spec.md) |
| 🧩 共通アトム | [`specs/06_shared_components.md`](./specs/06_shared_components.md) |

## プロトタイプを開く

`_source/` の HTML をダブルクリックでブラウザに開けば、React 実装が動作します。

- `_source/ScanAlarm Onboarding.html` — オンボーディング 6 画面のプロトタイプ
- `_source/ScanAlarm App Screens.html` — アプリ本編 9 画面のプロトタイプ

## 概要

ScanAlarm は「QR/バーコードをスキャンしないとアラームを解除できない」iOS アラームアプリ。
**Light Grey + Single Orange** (`#F85A3E`) の 2 色構成。Inter 全画面、グリーティングのみ Shippori Mincho。

実装は React Native (Expo)。仕様 → 実装の対応表は [`specs/00_INDEX.md`](./specs/00_INDEX.md#実装マッピングreact-native--expo) を参照。
