/**
 * QR Alarm App — カラーパレット
 * ウォームベージュ・ライトテーマ + ダークモード
 */

// ─── ブランド / アクセント（共通） ───
export const ACCENT_PRIMARY = '#E8A838';   // ゴールドイエロー
export const ACCENT_PRIMARY_TEXT = '#4A3200';
export const ACCENT_WARM = '#F2C56B';
export const ACCENT_SUBTLE = '#C49030';

// ─── 温もりレイヤー ───
export const WARM_GLOW = 'rgba(232, 168, 56, 0.06)';
export const WARM_GLOW_STRONG = 'rgba(232, 168, 56, 0.15)';

// ─── 背景（ライトテーマ デフォルト export） ───
export const BG_PRIMARY = '#F5F0EB';       // ウォームベージュ
export const BG_SECONDARY = '#FFFFFF';      // ホワイトカード
export const BG_TERTIARY = '#EDE8E3';       // セクション区切り
export const BG_ELEVATED = '#FFFFFF';
export const BG_MODAL = '#FFFFFF';
export const BG_MODAL_ALT = '#FAF7F4';
export const BG_DARK_ALT = '#F0EBE5';
export const BG_WARM_CARD = '#FFF8EE';      // アクセントカード

// 緊急度別背景（Ringing画面）
export const BG_URGENCY_1 = '#FFF3E0';
export const BG_URGENCY_2 = '#FFECCC';

// ─── テキスト ───
export const TEXT_PRIMARY = '#1A1A1A';
export const TEXT_SECONDARY = '#4A4A4A';
export const TEXT_MUTED = '#9B9590';
export const TEXT_CONTRAST = '#FFFFFF';

// ─── セマンティック ───
export const ERROR = '#D94040';
export const ERROR_BG = '#FEE8E8';
export const DELETE_ACTION_BG = '#DC2626';  // Swipe delete — Tailwind red-600

// ─── オーバーレイ (RGBA) ───
export const OVERLAY = {
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
    bgPrimary: '#000000',
    bgSecondary: '#1C1C1E',
    bgTertiary: '#2C2C2E',
    bgElevated: '#2C2C2E',
    bgModal: '#2C2C2E',
    bgModalAlt: '#1C1C1E',
    bgDarkAlt: '#000000',
    bgWarmCard: '#2C2C2E',
    bgUrgency1: '#2D2215',
    bgUrgency2: '#3A2A14',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(235, 235, 245, 0.60)',
    textMuted: 'rgba(235, 235, 245, 0.30)',
    textContrast: '#000000',
    error: '#FF453A',
    errorBg: '#3D1C1C',
    overlay: {
      accent10: 'rgba(232, 168, 56, 0.12)',
      accent12: 'rgba(232, 168, 56, 0.15)',
      accent30: 'rgba(232, 168, 56, 0.30)',
      brown15: 'rgba(84, 84, 88, 0.36)',
      black35: 'rgba(0, 0, 0, 0.50)',
      black40: 'rgba(0, 0, 0, 0.55)',
      black70: 'rgba(0, 0, 0, 0.80)',
      black80: 'rgba(0, 0, 0, 0.88)',
      black95: 'rgba(0, 0, 0, 0.97)',
      dark95: 'rgba(0, 0, 0, 0.95)',
    },
  },
} as const;

// ─── Glass Surface トークン（Liquid Glass 用） ───
export const GLASS = {
  light: {
    surface1: 'rgba(255, 255, 255, 0.60)',
    surface2: 'rgba(255, 255, 255, 0.40)',
    tint: 'rgba(232, 168, 56, 0.08)',
    border: 'rgba(255, 255, 255, 0.50)',
    borderActive: 'rgba(232, 168, 56, 0.40)',
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowAccent: 'rgba(232, 168, 56, 0.15)',
    separator: 'rgba(0, 0, 0, 0.06)',
  },
  dark: {
    surface1: 'rgba(44, 44, 46, 0.70)',
    surface2: 'rgba(44, 44, 46, 0.50)',
    tint: 'rgba(232, 168, 56, 0.12)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderActive: 'rgba(232, 168, 56, 0.50)',
    shadow: 'rgba(0, 0, 0, 0.30)',
    shadowAccent: 'rgba(232, 168, 56, 0.25)',
    separator: 'rgba(255, 255, 255, 0.08)',
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
