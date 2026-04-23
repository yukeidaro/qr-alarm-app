# ScanAlarm — Dark Mode & Tab Bar Design Spec

## 1. Dark Mode Color Palette

Design rationale:
- **Warm charcoal** base (#1A1816) keeps the cozy, warm personality of the light theme
- **Gold accent** (#E8A838) pops dramatically against dark surfaces — higher contrast than light mode
- **Text uses warm off-whites** (#F0EBE5) instead of pure #FFFFFF to avoid harsh blue-tinted glare
- **Overlays boosted 2-3%** opacity to compensate for reduced contrast on dark surfaces
- **Error brightened** from #D94040 to #E85454 — WCAG AA against dark backgrounds

### TypeScript — `Colors.dark`

```typescript
dark: {
  // ─── Brand / Accent ───
  accent: '#E8A838',              // Gold — unchanged, pops against dark
  accentText: '#4A3200',          // Dark brown on gold buttons — unchanged
  accentWarm: '#F2C56B',          // Lighter gold — unchanged
  accentSubtle: '#B88A2E',        // Muted gold for subtle elements on dark

  // ─── Warm Glow ───
  warmGlow: 'rgba(232, 168, 56, 0.08)',       // +2% vs light (subtle glow needs boost)
  warmGlowStrong: 'rgba(232, 168, 56, 0.20)', // +5% vs light

  // ─── Backgrounds ───
  bgPrimary: '#1A1816',           // Deep warm charcoal (main canvas)
  bgSecondary: '#252220',         // Warm dark card surface
  bgTertiary: '#1F1D1A',          // Section divider / grouped bg
  bgElevated: '#2A2725',          // Elevated surface (modals, sheets)
  bgModal: '#2A2725',             // Modal background
  bgModalAlt: '#201E1B',          // Alternative modal (slightly deeper)
  bgDarkAlt: '#161412',           // Deepest surface variant
  bgWarmCard: '#2D2518',          // Accent card — warm gold tint on dark

  // ─── Urgency Backgrounds (Ringing screen) ───
  bgUrgency1: '#2D2215',          // Warm amber glow — stage 1
  bgUrgency2: '#3A2A14',          // Intensified amber glow — stage 2

  // ─── Text ───
  textPrimary: '#F0EBE5',         // Warm off-white (primary body text)
  textSecondary: '#B5AFA8',       // Warm medium gray (supporting text)
  textMuted: '#706B65',           // Warm dark gray (placeholders, hints)
  textContrast: '#1A1A1A',        // Dark text on bright accent surfaces

  // ─── Semantic ───
  error: '#E85454',               // Brightened red for dark bg readability
  errorBg: '#3D1C1C',             // Deep red-tinted card

  // ─── Overlays ───
  overlay: {
    accent10: 'rgba(232, 168, 56, 0.12)',   // +2% — accent tint
    accent12: 'rgba(232, 168, 56, 0.15)',   // +3% — accent hover
    accent30: 'rgba(232, 168, 56, 0.30)',   // unchanged — accent strong
    brown15: 'rgba(200, 190, 175, 0.06)',   // Lighter base for warm tint on dark
    black35: 'rgba(0, 0, 0, 0.50)',         // +15% — darken still uses black
    black40: 'rgba(0, 0, 0, 0.55)',         // +15%
    black70: 'rgba(0, 0, 0, 0.80)',         // +10%
    black80: 'rgba(0, 0, 0, 0.88)',         // +8%
    black95: 'rgba(0, 0, 0, 0.97)',         // near-opaque
    dark95: 'rgba(26, 24, 22, 0.95)',       // Scrim — now uses dark base
  },
},
```

### TypeScript — `Colors.light` (rename from current `Colors.dark`)

```typescript
light: {
  accent: '#E8A838',
  accentText: '#4A3200',
  accentWarm: '#F2C56B',
  accentSubtle: '#C49030',
  warmGlow: 'rgba(232, 168, 56, 0.06)',
  warmGlowStrong: 'rgba(232, 168, 56, 0.15)',
  bgPrimary: '#F5F0EB',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#EDE8E3',
  bgElevated: '#FFFFFF',
  bgModal: '#FFFFFF',
  bgModalAlt: '#FAF7F4',
  bgDarkAlt: '#F0EBE5',
  bgWarmCard: '#FFF8EE',
  bgUrgency1: '#FFF3E0',
  bgUrgency2: '#FFECCC',
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#9B9590',
  textContrast: '#FFFFFF',
  error: '#D94040',
  errorBg: '#FEE8E8',
  overlay: {
    accent10: 'rgba(232, 168, 56, 0.10)',
    accent12: 'rgba(232, 168, 56, 0.12)',
    accent30: 'rgba(232, 168, 56, 0.30)',
    brown15: 'rgba(80, 69, 59, 0.08)',
    black35: 'rgba(0, 0, 0, 0.35)',
    black40: 'rgba(0, 0, 0, 0.40)',
    black70: 'rgba(0, 0, 0, 0.70)',
    black80: 'rgba(0, 0, 0, 0.80)',
    black95: 'rgba(0, 0, 0, 0.95)',
    dark95: 'rgba(245, 240, 235, 0.95)',
  },
},
```

---

## 2. Color Contrast Check (Key Pairs)

| Pair                              | Ratio  | WCAG AA |
|-----------------------------------|--------|---------|
| textPrimary (#F0EBE5) on bgPrimary (#1A1816) | ~14.5:1 | Pass |
| textSecondary (#B5AFA8) on bgPrimary (#1A1816) | ~8.2:1 | Pass |
| textMuted (#706B65) on bgPrimary (#1A1816)    | ~3.8:1 | Pass (large text) |
| accent (#E8A838) on bgPrimary (#1A1816)       | ~7.8:1 | Pass |
| accent (#E8A838) on bgSecondary (#252220)     | ~6.3:1 | Pass |
| accentText (#4A3200) on accent (#E8A838)      | ~4.6:1 | Pass |
| error (#E85454) on bgPrimary (#1A1816)        | ~5.2:1 | Pass |

---

## 3. Tab Bar Design Spec

### Layout Decision: **Icon + Small Label**

Rationale: With only 2 tabs, icon-only works visually but small labels cost zero
extra height and help with accessibility / first-time discoverability. The labels
disappear into the background when users are familiar — no cognitive overhead.

### Tab Configuration

```typescript
export const TAB_BAR_CONFIG = {
  tabs: [
    {
      name: 'index',               // Route name (expo-router)
      label: 'Alarm',
      iconActive: 'alarm',         // Ionicons — filled
      iconInactive: 'alarm-outline',
    },
    {
      name: 'settings',
      label: 'Settings',
      iconActive: 'settings',      // Ionicons — filled
      iconInactive: 'settings-outline',
    },
  ],
} as const;
```

### Tab Bar Style Spec

```typescript
export const TAB_BAR_STYLE = {
  // ─── Colors (resolved per theme) ───
  colors: {
    light: {
      background: '#FFFFFF',          // BG_SECONDARY
      activeIcon: '#E8A838',          // ACCENT_PRIMARY
      activeLabel: '#E8A838',
      inactiveIcon: '#9B9590',        // TEXT_MUTED
      inactiveLabel: '#9B9590',
      borderTop: 'rgba(80, 69, 59, 0.08)', // OVERLAY.brown15
    },
    dark: {
      background: '#252220',          // bgSecondary (dark)
      activeIcon: '#E8A838',          // ACCENT_PRIMARY — same gold
      activeLabel: '#E8A838',
      inactiveIcon: '#706B65',        // textMuted (dark)
      inactiveLabel: '#706B65',
      borderTop: 'rgba(200, 190, 175, 0.06)', // overlay.brown15 (dark)
    },
  },

  // ─── Layout ───
  height: 56,                         // Compact — 2 tabs don't need 64+
  paddingBottom: 0,                   // Adjusted by SafeAreaView at runtime
  iconSize: 24,
  labelFontSize: 10,
  labelFontFamily: 'PlusJakartaSans_500Medium',
  labelMarginTop: 2,                  // Gap between icon and label

  // ─── Top Border ───
  borderTopWidth: 0.5,                // Hairline — subtle separation

  // ─── Shadow (iOS) ───
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  // ─── Elevation (Android) ───
  elevation: 8,

  // ─── Active Indicator (optional glow dot) ───
  activeIndicator: {
    enabled: true,
    type: 'dot',                      // 'dot' | 'pill' | 'none'
    size: 4,
    color: '#E8A838',
    marginTop: 4,                     // Below label
  },
} as const;
```

### Visual Reference

```
Light mode:
┌─────────────────────────────────┐
│                                 │
│         (screen content)        │
│                                 │
├─────────────────────────────────┤  ← 0.5px warm border
│                                 │
│    🔔            ⚙️             │  ← 24px icons
│   Alarm       Settings          │  ← 10px labels
│    ●                            │  ← 4px active dot
│                                 │
│  #FFFFFF background             │
└─────────────────────────────────┘

Dark mode:
┌─────────────────────────────────┐
│                                 │
│         (screen content)        │
│                                 │
├─────────────────────────────────┤  ← 0.5px subtle border
│                                 │
│    🔔            ⚙️             │  ← gold active, muted inactive
│   Alarm       Settings          │
│    ●                            │
│                                 │
│  #252220 background             │
└─────────────────────────────────┘

Active tab:  icon filled + gold (#E8A838) + dot indicator
Inactive tab: icon outline + muted gray + no dot
```

---

## 4. Implementation Notes

### Migration Path (colors.ts)

1. Rename `Colors.dark` → `Colors.light` (it's actually the light theme)
2. Add new `Colors.dark` with the dark palette above
3. Update `ThemeColors` type: `typeof Colors.light` (same shape)
4. Update `theme/index.tsx` to read system color scheme via `useColorScheme()`

### Tab Bar Migration Path

1. Convert `app/_layout.tsx` from `Stack` to `Tabs` (expo-router)
2. Move current `index.tsx` content into tab structure
3. Create `app/(tabs)/_layout.tsx` for tab navigator
4. Create `app/(tabs)/settings.tsx` for settings screen
5. Keep `ringing`, `scan`, `snooze`, `edit`, `sounds` as Stack screens above tabs

### StatusBar

- Light mode: `<StatusBar style="dark" />`
- Dark mode: `<StatusBar style="light" />`
- Dynamic: `<StatusBar style={isDark ? 'light' : 'dark'} />`

---

## 5. Video Reference: Alarm App Inspiration (2026-04-16)

Source: [video-design-spec.md](video-design-spec.md) -- Threads投稿 @slava7118 "Vibe Code Fully Working Apps" から抽出

### 採用候補コンポーネント

#### 5a. Barcode Decoration（新規追加提案）

QRコードスキャンアプリとの親和性が高い装飾要素。

```typescript
// constants/barcode-decoration.ts
export const BARCODE_CONFIG = {
  lineCount: 24,               // 縦線の本数
  lineWidthRange: [1, 4],      // 太さのレンジ (px)
  height: 48,                  // 装飾の高さ
  accentLineIndex: 'random',   // 1本だけアクセントカラー
  colors: {
    light: {
      lines: '#D5D0CB',        // ライトグレー
      accent: '#E8A838',       // ゴールド（既存accent）
    },
    dark: {
      lines: '#3A3735',        // ダークグレー
      accent: '#E8A838',       // ゴールド
    },
  },
} as const;
```

配置案: アラームカードの装飾、または時刻表示の下

#### 5b. Dot Matrix Animation（Nothing Clock拡張）

既存のNothing Phone風ドットスタイルと完全に合致するアニメーション。

```typescript
// アニメーション仕様
export const DOT_MATRIX_ANIMATION = {
  dotSize: 5,                  // px
  gridGap: 2,                  // px
  fps: 10,                     // レトロ感のある低fps
  colors: {
    light: {
      grid: '#EDE8E3',         // bgTertiary
      active: '#1A1A1A',       // textPrimary
    },
    dark: {
      grid: '#252220',         // bgSecondary
      active: '#F0EBE5',       // textPrimary
    },
  },
} as const;
```

用途: アラーム待機画面のアンビエント、作成中のフィードバック

#### 5c. Floating Info Card

```typescript
export const FLOATING_CARD_STYLE = {
  borderRadius: 14,
  padding: 16,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  animation: {
    type: 'spring',
    damping: 0.7,
    stiffness: 300,
    duration: 350,             // ms fallback
  },
} as const;
```

#### 5d. Dynamic Theme Color (将来検討)

動画ではカラーピッカーで5テーマ切替。ScanAlarmではlight/darkの2テーマだが、
アクセントカラー選択（ゴールド以外にも選べる）として導入可能。

```typescript
// 将来実装時の型定義
type AccentPreset = 'gold' | 'coral' | 'sage' | 'lavender' | 'sky';
```

### 参照先

- 詳細なデザイン抽出: [video-design-spec.md](video-design-spec.md)
- 抽出元フレーム: `assets/screenshots/frames/`
