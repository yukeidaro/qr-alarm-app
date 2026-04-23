/**
 * QR Alarm App — カラーパレット
 * ウォームベージュ・ライトテーマ + ダークモード
 */

// ─── ブランド / アクセント（共通） ───
export const ACCENT_PRIMARY = '#F85A3E';   // オレンジ (Claude Design)
export const ACCENT_PRIMARY_TEXT = '#FFFFFF';
export const ACCENT_WARM = '#FF8C6B';
export const ACCENT_SUBTLE = '#FDE9E4';

// ─── 温もりレイヤー ───
export const WARM_GLOW = 'rgba(248, 90, 62, 0.06)';
export const WARM_GLOW_STRONG = 'rgba(248, 90, 62, 0.22)';

// ─── 背景（ライトテーマ デフォルト export） ───
export const BG_PRIMARY = '#F4F4F5';       // ニュートラルグレー
export const BG_SECONDARY = '#FFFFFF';      // ホワイトカード
export const BG_TERTIARY = '#F8F8F9';       // セクション区切り
export const BG_ELEVATED = '#FFFFFF';
export const BG_MODAL = '#FFFFFF';
export const BG_MODAL_ALT = '#F8F8F9';
export const BG_DARK_ALT = '#EDEDEF';
export const BG_WARM_CARD = '#FDE9E4';      // アクセントカード (orangeDim)

// 緊急度別背景（Ringing画面）
export const BG_URGENCY_1 = '#FDE9E4';
export const BG_URGENCY_2 = '#FCD5CC';

// ─── テキスト ───
export const TEXT_PRIMARY = '#18181B';
export const TEXT_SECONDARY = '#52525B';
export const TEXT_MUTED = '#A1A1AA';
export const TEXT_CONTRAST = '#FFFFFF';

// ─── セマンティック ───
export const ERROR = '#EF4444';
export const ERROR_BG = '#FEE2E2';
export const DELETE_ACTION_BG = '#DC2626';  // Swipe delete — Tailwind red-600

// ─── オーバーレイ (RGBA) ───
export const OVERLAY = {
  accent10: 'rgba(248, 90, 62, 0.10)',
  accent12: 'rgba(248, 90, 62, 0.12)',
  accent30: 'rgba(248, 90, 62, 0.30)',
  brown15: 'rgba(0, 0, 0, 0.04)',
  black35: 'rgba(0, 0, 0, 0.35)',
  black40: 'rgba(0, 0, 0, 0.40)',
  black70: 'rgba(0, 0, 0, 0.70)',
  black80: 'rgba(0, 0, 0, 0.80)',
  black95: 'rgba(0, 0, 0, 0.95)',
  dark95: 'rgba(244, 244, 245, 0.95)',
} as const;

// ─── テーマオブジェクト ───
export const Colors = {
  light: {
    accent: ACCENT_PRIMARY,
    accentText: ACCENT_PRIMARY_TEXT,
    accentWarm: ACCENT_WARM,
    accentSubtle: ACCENT_SUBTLE,
    warmGlow: WARM_GLOW,
    warmGlowStrong: WARM_GLOW_STRONG,
    bgPrimary: BG_PRIMARY,
    bgSecondary: BG_SECONDARY,
    bgTertiary: BG_TERTIARY,
    bgElevated: BG_ELEVATED,
    bgModal: BG_MODAL,
    bgModalAlt: BG_MODAL_ALT,
    bgDarkAlt: BG_DARK_ALT,
    bgWarmCard: BG_WARM_CARD,
    bgUrgency1: BG_URGENCY_1,
    bgUrgency2: BG_URGENCY_2,
    textPrimary: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    textMuted: TEXT_MUTED,
    textContrast: TEXT_CONTRAST,
    error: ERROR,
    errorBg: ERROR_BG,
    overlay: OVERLAY,
  },
  dark: {
    accent: '#E8A838',
    accentText: '#4A3200',
    accentWarm: '#F2C56B',
    accentSubtle: '#B88A2E',
    warmGlow: 'rgba(232, 168, 56, 0.08)',
    warmGlowStrong: 'rgba(232, 168, 56, 0.20)',
    bgPrimary: '#1A1816',       // Warm charcoal — 温かみのあるダーク
    bgSecondary: '#252220',     // Warm dark card surface
    bgTertiary: '#1F1D1A',      // Section divider / grouped bg
    bgElevated: '#2A2725',      // Elevated surface (modals, sheets)
    bgModal: '#2A2725',
    bgModalAlt: '#201E1B',
    bgDarkAlt: '#161412',       // Deepest surface variant
    bgWarmCard: '#2D2518',      // Accent card — warm gold tint
    bgUrgency1: '#2D2215',
    bgUrgency2: '#3A2A14',
    textPrimary: '#F0EBE5',     // Warm off-white (harsh blue glareを回避)
    textSecondary: '#B5AFA8',   // Warm medium gray
    textMuted: '#706B65',       // Warm dark gray
    textContrast: '#1A1A1A',
    error: '#E85454',           // Brightened for dark bg (WCAG AA)
    errorBg: '#3D1C1C',
    overlay: {
      accent10: 'rgba(232, 168, 56, 0.12)',
      accent12: 'rgba(232, 168, 56, 0.15)',
      accent30: 'rgba(232, 168, 56, 0.30)',
      brown15: 'rgba(200, 190, 175, 0.06)',  // Lighter base for warm tint on dark
      black35: 'rgba(0, 0, 0, 0.50)',
      black40: 'rgba(0, 0, 0, 0.55)',
      black70: 'rgba(0, 0, 0, 0.80)',
      black80: 'rgba(0, 0, 0, 0.88)',
      black95: 'rgba(0, 0, 0, 0.97)',
      dark95: 'rgba(26, 24, 22, 0.95)',      // Uses warm dark base
    },
  },
} as const;

// ─── Glass Surface トークン（Liquid Glass 用） ───
export const GLASS = {
  light: {
    surface1: 'rgba(255, 255, 255, 0.80)',
    surface2: 'rgba(255, 255, 255, 0.60)',
    tint: 'rgba(248, 90, 62, 0.06)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderActive: 'rgba(248, 90, 62, 0.40)',
    shadow: 'rgba(0, 0, 0, 0.06)',
    shadowAccent: 'rgba(248, 90, 62, 0.22)',
    separator: 'rgba(0, 0, 0, 0.06)',
  },
  dark: {
    surface1: 'rgba(42, 39, 37, 0.75)',      // Warm charcoal with warm undertone
    surface2: 'rgba(42, 39, 37, 0.55)',
    tint: 'rgba(232, 168, 56, 0.12)',
    border: 'rgba(240, 235, 229, 0.10)',     // Warm off-white border
    borderActive: 'rgba(232, 168, 56, 0.50)',
    shadow: 'rgba(0, 0, 0, 0.35)',
    shadowAccent: 'rgba(232, 168, 56, 0.25)',
    separator: 'rgba(240, 235, 229, 0.08)',  // Warm separator
  },
} as const;

export type GlassTokens = {
  [K in keyof typeof GLASS.light]: string;
};

export type ThemeColors = {
  [K in keyof typeof Colors.light]: (typeof Colors.light)[K] extends object
    ? { [SK in keyof (typeof Colors.light)[K]]: string }
    : string;
};
