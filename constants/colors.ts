/**
 * QR Alarm App — カラーパレット
 * ウォームベージュ・ライトテーマ
 */

// ─── ブランド / アクセント ───
export const ACCENT_PRIMARY = '#E8A838';   // ゴールドイエロー
export const ACCENT_PRIMARY_TEXT = '#4A3200';
export const ACCENT_WARM = '#F2C56B';
export const ACCENT_SUBTLE = '#C49030';

// ─── 温もりレイヤー ───
export const WARM_GLOW = 'rgba(232, 168, 56, 0.06)';
export const WARM_GLOW_STRONG = 'rgba(232, 168, 56, 0.15)';

// ─── 背景 ───
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
  dark: {
    accent: ACCENT_PRIMARY,
    accentText: ACCENT_PRIMARY_TEXT,
    accentWarm: ACCENT_WARM,
    bgPrimary: BG_PRIMARY,
    bgSecondary: BG_SECONDARY,
    bgTertiary: BG_TERTIARY,
    bgElevated: BG_ELEVATED,
    bgModal: BG_MODAL,
    bgModalAlt: BG_MODAL_ALT,
    bgDarkAlt: BG_DARK_ALT,
    bgWarmCard: BG_WARM_CARD,
    warmGlow: WARM_GLOW,
    warmGlowStrong: WARM_GLOW_STRONG,
    accentSubtle: ACCENT_SUBTLE,
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
} as const;

export type ThemeColors = typeof Colors.dark;
