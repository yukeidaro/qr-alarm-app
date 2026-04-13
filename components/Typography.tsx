/**
 * QR Alarm App — Typographyコンポーネント群
 * テキストスタイルのプリセットを提供する。
 */
import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';

interface TypographyProps extends TextProps {
  color?: string;
}

function createTypography(
  defaultStyle: TextStyle,
  getDefaultColor: (colors: ReturnType<typeof useTheme>['colors']) => string,
) {
  return function TypographyComponent({ style, color, children, ...props }: TypographyProps) {
    const { colors } = useTheme();
    return (
      <Text style={[defaultStyle, { color: color ?? getDefaultColor(colors) }, style]} {...props}>
        {children}
      </Text>
    );
  };
}

/** 画面タイトル — 20px SemiBold */
export const Heading = createTypography(
  { fontSize: FONT_SIZE.heading3, fontFamily: FONT_FAMILY.semiBold },
  (c) => c.textPrimary,
);

/** セクションタイトル — 17px SemiBold */
export const Subheading = createTypography(
  { fontSize: FONT_SIZE.body, fontFamily: FONT_FAMILY.semiBold },
  (c) => c.textPrimary,
);

/** 本文 — 17px Regular */
export const Body = createTypography(
  { fontSize: FONT_SIZE.body, fontFamily: FONT_FAMILY.regular },
  (c) => c.textSecondary,
);

/** 本文（小） — 15px Regular */
export const BodySmall = createTypography(
  { fontSize: FONT_SIZE.bodySmall, fontFamily: FONT_FAMILY.regular },
  (c) => c.textSecondary,
);

/** キャプション — 14px Regular */
export const Caption = createTypography(
  { fontSize: FONT_SIZE.caption, fontFamily: FONT_FAMILY.regular },
  (c) => c.textMuted,
);

/** ラベル — 13px Regular */
export const Label = createTypography(
  { fontSize: FONT_SIZE.label, fontFamily: FONT_FAMILY.regular },
  (c) => c.textMuted,
);

/** 小ラベル — 12px Regular */
export const LabelSmall = createTypography(
  { fontSize: FONT_SIZE.labelSmall, fontFamily: FONT_FAMILY.regular },
  (c) => c.textMuted,
);

/** 大きな時刻表示 — 56px（Homeアラームカード用） */
export const TimeDisplay = createTypography(
  { fontSize: FONT_SIZE.title1, fontFamily: FONT_FAMILY.semiBold, letterSpacing: 1 },
  (c) => c.textPrimary,
);

/** 超大型時刻表示 — 128px（Ringing画面用） */
export const TimeDisplayLarge = createTypography(
  { fontSize: FONT_SIZE.display, fontFamily: FONT_FAMILY.bold },
  (c) => c.textPrimary,
);

/** アクセントテキスト — 13px（QRボタン等） */
export const AccentLabel = createTypography(
  { fontSize: FONT_SIZE.label, fontFamily: FONT_FAMILY.regular, letterSpacing: 1 },
  (c) => c.accent,
);
