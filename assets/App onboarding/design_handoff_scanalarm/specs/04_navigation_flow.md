# 04 · Navigation Flow

## オンボーディング (8 画面、1 本道)

```
Splash
 └─→ Value Prop 1 (Wake up)
      └─→ Value Prop 2 (Scan to dismiss)
           └─→ Value Prop 3 (Smart routines)
                └─→ Sign up（任意）
                     └─→ Permissions
                          └─→ First Alarm
                               └─→ Ready
                                    └─→ App / Home
```

### トランジション仕様
| From → To | Transition | Duration |
|---|---|---|
| Splash → ValueProp1 | Crossfade + scale 0.95→1.0 | 300ms |
| ValueProp 1 ↔ 2 ↔ 3 | Horizontal slide (spring) | damping 20, stiffness 180 |
| ValueProp3 → SignUp | Push forward (spring) | 320ms |
| SignUp → Permissions | Slide-up bounce | friction 8 |
| Permissions → FirstAlarm | Push forward (spring) | — |
| FirstAlarm → Ready | Push forward (spring) | — |
| Ready → Home | Crossfade exit | 300ms |

---

## アプリ本編

```
TabBar「アラーム」 → Home
  ├── + ボタン               → Alarm Edit (新規)
  ├── アラームカードタップ    → Alarm Edit (編集)
  └── TabBar「設定」         → Settings

Alarm Edit
  ├── 「サウンド」行           → Sound Picker
  ├── 「繰り返し」行           → Repeat
  └── 「QR・バーコードで解除」 → QR Manage

Settings
  ├── 「スヌーズ間隔」行       → Snooze Interval
  └── 「QR・バーコード管理」行 → QR Manage

QR Manage
  └── 「コードを追加」         → QR Scan
                                 └─→ (scan success) → QR Name
```

### モーダル / シート扱い
- Alarm Edit: フルスクリーンプッシュ（NavBar 左キャンセル / 右保存）
- Sound / Repeat / QR Manage / Snooze Interval: SubShell（戻るボタン付き）
- QR Scan: フルスクリーン、ダーク背景。閉じるは右上の ✕

---

## 戻るインタラクション
- iOS の左端スワイプで戻る対応（react-navigation の gesture）
- SubNavBar 左の ← ボタン: orange 文字で「戻る」
- アラーム保存 / 削除後はホームに戻る（pop）
