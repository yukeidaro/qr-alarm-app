/**
 * QR Alarm App — タイポグラフィスケール
 * Plus Jakarta Sans — モダンジオメトリック・サンセリフ
 */

// ─── フォントファミリー ───
export const FONT_FAMILY = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// ─── フォントサイズスケール ───
export const FONT_SIZE = {
  /** 128px — Ringing画面の時刻表示 */
  display: 128,
  /** 64px — Edit画面の時刻、空状態アイコン */
  hero: 64,
  /** 56px — Home画面のアラームカード時刻 */
  title1: 56,
  /** 48px — オンボーディングアイコン */
  title2: 48,
  /** 32px — 広告プレースホルダー */
  title3: 32,
  /** 28px — FABアイコン、挨拶テキスト */
  heading1: 28,
  /** 24px — 矢印/シェブロン */
  heading2: 24,
  /** 20px — モーダルタイトル */
  heading3: 20,
  /** 18px — スキャンラベル */
  subheading: 18,
  /** 17px — ボタンテキスト、入力値、CTA */
  body: 17,
  /** 15px — セカンダリボタン、トースト */
  bodySmall: 15,
  /** 14px — スヌーズテキスト、カウントダウン */
  caption: 14,
  /** 13px — セクションタイトル、曜日ラベル */
  label: 13,
  /** 12px — バッジテキスト */
  labelSmall: 12,
  /** 11px — Ringing画面ラベル（大文字） */
  micro: 11,
  /** 10px — スキャン中ラベル（大文字） */
  nano: 10,
} as const;

// ─── テキストスタイルプリセット ───
export const TEXT_STYLE = {
  displayTime: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.display,
  },
  heroTime: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.hero,
  },
  alarmTime: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.title1,
  },
  heading: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.heading3,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
  },
  bodySemiBold: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.body,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.bodySmall,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.caption,
  },
  label: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.label,
  },
  labelSmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.labelSmall,
  },
  micro: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.micro,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;
