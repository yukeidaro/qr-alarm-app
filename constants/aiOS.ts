/**
 * AI OS Design Tokens
 * Behance "AI for iOS" by Slava Kornilov から抽出したカラー・タイポ・モーション定数
 * Source: https://www.behance.net/gallery/246572931/AI-for-iOS
 */

// ─── Canvas (Dark) ───
export const AI_CANVAS = {
  bgBlack: '#111113',      // 柔らかいダーク (純黒ではない)
  bgSurface: '#18181B',    // 浮かせたパネル
  bgTile: '#1C1C20',       // カード基底
  bgTileLift: '#222228',   // 軽く明るい内部層
  hairline: '#2A2A30',     // 境界線
  hairlineSoft: 'rgba(255,255,255,0.06)',
} as const;

// ─── Canvas (Light) ───
export const AI_CANVAS_LIGHT = {
  bgBlack: '#F4F4F5',      // 温かみのあるライトグレー
  bgSurface: '#EAEAEC',
  bgTile: '#FFFFFF',        // 白カード
  bgTileLift: '#F8F8FA',
  hairline: '#E0E0E4',
  hairlineSoft: 'rgba(0,0,0,0.04)',
} as const;

// ─── Text (Dark) ───
export const AI_TEXT = {
  primary: '#FFFFFF',
  secondary: '#A0A3A8',
  muted: '#6A6D72',
  ghost: 'rgba(255,255,255,0.35)',
} as const;

// ─── Text (Light) ───
export const AI_TEXT_LIGHT = {
  primary: '#1A1A1A',
  secondary: '#5A5A60',
  muted: '#9A9AA0',
  ghost: 'rgba(0,0,0,0.30)',
} as const;

// ─── Theme helper ───
export function getAiCanvas(isDark: boolean) {
  return isDark ? AI_CANVAS : AI_CANVAS_LIGHT;
}
export function getAiText(isDark: boolean) {
  return isDark ? AI_TEXT : AI_TEXT_LIGHT;
}

// ─── Primary CTA (オレンジ) ───
export const AI_YELLOW = {
  base: '#F85A3E',        // ピル、CTA (メインアクションカラー)
  dim: 'rgba(248,90,62,0.35)',
  glow: 'rgba(248,90,62,0.30)',
  onYellow: '#FFFFFF',    // オレンジ上のテキスト (白に変更)
  active: '#FF6A4A',      // アクティブインジケーター (少し明るめ)
} as const;

// ─── Per-card Accent Glows ───
// 各アラームテーマのメイン放射色。黒キャンバス上のラジアル用。
export type AiAccentKey =
  | 'crimson'   // アラーム (赤)
  | 'emerald'   // 分析・睡眠 (緑)
  | 'rose'      // ムード (ピンク)
  | 'cobalt'    // 天気・風 (青)
  | 'aurora'    // 音楽 (紫)
  | 'sunrise'   // 月・日 (橙)
  | 'yellow';   // アシッドイエロー

export interface AiAccent {
  key: AiAccentKey;
  label: string;
  hex: string;          // glow 中心色
  edge: string;         // glow 外縁 (通常 transparent alpha)
  swatch: string;       // ピッカー表示用
  onAccent: string;     // accentの上に置くテキスト色
}

export const AI_ACCENTS: Record<AiAccentKey, AiAccent> = {
  crimson: {
    key: 'crimson', label: 'Crimson',
    hex: '#FF2A2A', edge: 'rgba(255,42,42,0)',
    swatch: '#FF2A2A', onAccent: '#FFFFFF',
  },
  emerald: {
    key: 'emerald', label: 'Emerald',
    hex: '#00E39A', edge: 'rgba(0,227,154,0)',
    swatch: '#00E39A', onAccent: '#000000',
  },
  rose: {
    key: 'rose', label: 'Rose',
    hex: '#FF4B8A', edge: 'rgba(255,75,138,0)',
    swatch: '#FF4B8A', onAccent: '#FFFFFF',
  },
  cobalt: {
    key: 'cobalt', label: 'Cobalt',
    hex: '#1E58FF', edge: 'rgba(30,88,255,0)',
    swatch: '#1E58FF', onAccent: '#FFFFFF',
  },
  aurora: {
    key: 'aurora', label: 'Aurora',
    hex: '#9B3CFF', edge: 'rgba(155,60,255,0)',
    swatch: '#9B3CFF', onAccent: '#FFFFFF',
  },
  sunrise: {
    key: 'sunrise', label: 'Sunrise',
    hex: '#FF7A2A', edge: 'rgba(255,122,42,0)',
    swatch: '#FF7A2A', onAccent: '#000000',
  },
  yellow: {
    key: 'yellow', label: 'Acid',
    hex: '#F85A3E', edge: 'rgba(248,90,62,0)',
    swatch: '#F85A3E', onAccent: '#FFFFFF',
  },
};

export const AI_ACCENT_ORDER: AiAccentKey[] = [
  'crimson', 'emerald', 'rose', 'cobalt', 'aurora', 'sunrise', 'yellow',
];

export function getAccent(key?: string): AiAccent {
  if (!key || !(key in AI_ACCENTS)) return AI_ACCENTS.crimson;
  return AI_ACCENTS[key as AiAccentKey];
}

// ─── Fonts ───
// 2フォント体系: ピクセル/LED + モダンgrotesque
export const AI_FONTS = {
  // 時刻・数値表示 (LED/pixel)
  pixel: 'VT323_400Regular',
  mono: 'ShareTechMono_400Regular',
  // UIテキスト (grotesque)
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemi: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
} as const;

export const AI_SIZE = {
  // Pixel/LED display
  clockHero: 96,
  clockLarge: 72,
  clockMid: 48,
  clockSmall: 32,

  // UI
  sectionTitle: 24,
  cardLabel: 13,
  body: 15,
  caption: 11,
  chip: 12,
} as const;

// ─── Motion ───
export const AI_MOTION = {
  cardSpring: { damping: 20, stiffness: 180 },
  pillPress: { duration: 80 },
  glowPulse: { duration: 1800, loop: true, autoreverse: true },
  transition: { duration: 300 },
} as const;

// ─── Radius ───
export const AI_RADIUS = {
  card: 22,
  tile: 18,
  pill: 9999,
  orb: 9999,
} as const;
