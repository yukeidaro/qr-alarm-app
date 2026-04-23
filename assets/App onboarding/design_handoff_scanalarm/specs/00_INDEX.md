# ScanAlarm — Design Handoff Spec (Index)

> **Status**: HTML/JSX プロトタイプを Markdown 仕様書化したもの。
> オリジナルの React プロトタイプは [`../_source/`](../_source/) に保管（ブラウザで開けば動作プレビュー可）。

## このパッケージの構成

| File | 内容 |
|------|------|
| [`01_design_tokens.md`](./01_design_tokens.md) | カラー / タイポ / スペーシング / シャドウ / ラジアス |
| [`02_onboarding_screens.md`](./02_onboarding_screens.md) | オンボーディング 8 画面（Splash → Ready） |
| [`03_app_screens.md`](./03_app_screens.md) | メインアプリ 9 画面（Home → QR Name） |
| [`04_navigation_flow.md`](./04_navigation_flow.md) | 画面遷移とトランジション |
| [`05_motion_spec.md`](./05_motion_spec.md) | アニメーション仕様（spring, easing, duration） |
| [`06_shared_components.md`](./06_shared_components.md) | 共通アトム（PillCTA, PhoneShell, IOSDevice, etc.） |

## 概要

ScanAlarm は「QR/バーコードをスキャンしないとアラームを解除できない」iOS アラームアプリ。
**配色は Light Grey + Single Orange**（`#F85A3E`）の 2 色構成。Inter 全画面、グリーティングのみ Shippori Mincho。

## Fidelity

**High-fidelity** — ピクセル単位での再現を想定。色・余白・アニメーションは Markdown 内の数値を正とする。
不明点は `../_source/` の JSX を参照（`screens.jsx`, `screens-app.jsx`, `ios-frame.jsx`）。

## 実装マッピング（React Native / Expo）

| 仕様画面 | 実装ファイル |
|---|---|
| Onboarding 全般 | `app/onboarding.tsx` |
| Home | `app/(tabs)/index.tsx` |
| Settings | `app/(tabs)/settings.tsx` |
| Alarm Edit | `app/edit.tsx` |
| Sound Picker | `app/sounds.tsx` |
| Repeat | `app/repeat.tsx` |
| Snooze Interval | `app/snooze-interval.tsx` |
| QR Manage | `app/qr-manage.tsx` |
| QR Scan | `app/scan.tsx` |
| QR Name (post-scan) | `app/scan.tsx` 内の状態遷移 |
| Ringing (out of scope) | `app/ringing.tsx` |
