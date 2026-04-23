# 01 · Design Tokens

> Source of truth: `_source/screens.jsx` の `const C = { ... }` ブロック。

## カラー

### Brand / Accent
| Token | Hex / RGBA | 用途 |
|---|---|---|
| `orange` | `#F85A3E` | 唯一のアクセント色。CTA、選択中、QR 強調 |
| `orangeDim` | `#FDE9E4` | オレンジの薄背景（選択中行、アイコン背景、必須バナー） |
| `orangeInk` | `#7A2512` | オレンジ薄背景上のテキスト |
| `orangeGlow` | `rgba(248,90,62,0.22)` | CTA / FAB のドロップシャドウ用 |

### Ink (Text)
| Token | Hex | 用途 |
|---|---|---|
| `ink` | `#18181B` | 本文 1・見出し |
| `ink2` | `#52525B` | 本文 2・サブテキスト |
| `ink3` | `#A1A1AA` | 補助・キャプション |
| `ink4` | `#D4D4D8` | 非活性・区切り線・アイコン |

### Surface
| Token | Hex | 用途 |
|---|---|---|
| `bg` | `#F4F4F5` | 画面背景（warm-neutral） |
| `surface` | `#FFFFFF` | カード・入力フィールド |
| `surfaceAlt` | `#F8F8F9` | サブカード背景 |
| `line` | `#E5E5E7` | 通常区切り線 / カードボーダー |
| `lineSoft` | `#EDEDEF` | カード内行区切り（薄め） |

### Status (Onboarding ValueProps のみ)
| Token | Hex | 用途 |
|---|---|---|
| Success Green | `#27A862` | スキャン成功時のチェック・リング |
| Danger Red | `#E54040` | スヌーズ失敗の ✕ バッジ |

> アプリ本編は **Orange が単一アクセント**。Green/Red はオンボーディングのアニメーション説明だけで使用。

---

## タイポグラフィ

### フォントファミリー
- **メインフォント**: Inter (`Inter_400Regular`, `_500Medium`, `_600SemiBold`, `_700Bold`)
- **グリーティング専用**: Shippori Mincho (`ShipporiMincho_600SemiBold`)
- フォントスムージング: `WebkitFontSmoothing: antialiased`

### スケール（実測抜粋）
| 用途 | Size | Weight | Letter-spacing | 備考 |
|---|---|---|---|---|
| Onboarding ヘッドライン | 28 | 700 | -0.6 | `line-height: 1.15` |
| Ready 完了見出し | 30 | 700 | -0.6 | |
| ホームのグリーティング | 20 | 600 | — | Shippori Mincho |
| アラーム時刻（カード） | 30 | 700 | -1.2 | `tabular-nums` |
| Edit 画面の時刻（中央） | 76 | 700 | -2 | Wheel center |
| Edit 画面の時刻（隣接） | 56 / 44 / 32 / 24 | 700/400 | -1 | 上下 |
| Settings 行ラベル | 15 | 500 | — | `#18181B` |
| 詳細テキスト（行右） | 14 | 400 | — | `#A1A1AA` |
| ボディ本文 | 15 | 400 | -0.1 | `line-height: 1.45` |
| キャプション | 13 | 500 | — | `#A1A1AA` |
| QR バッジ / モノラベル | 11 | 600 | 1.0 | uppercase |
| iOS NavBar large title | 34 | 700 | 0.4 | `line-height: 41px` |

`tabular-nums` は時刻表示・桁揃え用に `fontVariant: ['tabular-nums']`。

---

## スペーシング・サイズ

| Token | 値 | 用途 |
|---|---|---|
| 画面横パディング | 24px | 全画面共通 |
| iOS 上余白（PhoneShell） | 54px | ステータスバー直下 |
| iOS 下余白 | 26〜34px | ホームインジケータ分 |
| カード Radius (Large) | 22 / 18px | オンボーディング: 22 / アプリ: 18 |
| カード Radius (Mid) | 16px | オプションカード |
| カード Radius (Small) | 12px | バナー / 小要素 |
| Pill / Toggle Radius | 9999 | 完全な丸 |
| FAB | 56×56px, R=56 | ホーム画面 |
| Toggle Switch | 50×30, knob 26 | アラームカード |
| Toggle (Permissions) | 44×26, knob 22 | オンボーディング |
| List 行高 | 52px | 設定行・編集行 |
| AlarmCard padding | 14px 16px | |
| Section gap | 10〜18px | カード間 |

---

## シャドウ

| Token | 値 | 用途 |
|---|---|---|
| CTA 通常 | `0 6px 16px rgba(248,90,62,0.22)` | PillCTA |
| CTA glow | `0 12px 32px rgba(248,90,62,0.22), 0 0 0 6px rgba(248,90,62,0.08)` | Ready 画面の最終 CTA |
| FAB | `0 8px 20px rgba(248,90,62,0.22), 0 0 0 6px rgba(248,90,62,0.08)` | ホーム + ボタン |
| App icon glow | `0 18px 40px rgba(248,90,62,0.22), 0 0 0 8px rgba(248,90,62,0.06)` | Splash |
| iOS Device frame | `0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)` | プロトタイプ枠 |
| Scan 成功リング | `0 10px 24px rgba(39,168,98,0.35)` | ValueProp2 |
| Toggle knob | `0 1px 3px rgba(0,0,0,0.18)` | |

---

## ラジアス早見表

| 要素 | Radius |
|---|---|
| Pill / Toggle / FAB | 9999 |
| Hero card / Onboarding illustration | 22 |
| Alarm card / 大カード | 18 |
| Snooze option / Mid card | 16 |
| Input field | 14 |
| Banner / Small card | 12 |
| Icon box | 7〜12 |
| Day chip (繰り返し) | 32 (= width) |
