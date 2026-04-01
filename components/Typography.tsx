/**
 * QR Alarm App — Typographyコンポーネント群
 * テキストスタイルのプリセットを提供する。
 */
import React from 'react';
import { Text, type TextProps, type TextStyle, StyleSheet } from 'react-native';
import { TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, ACCENT_PRIMARY } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';

interface TypographyProps extends TextProps {
  color?: string;
}

function createTypography(
  defaultStyle: TextStyle,
  defaultColor: string,
) {
  return function TypographyComponent({ style, color, children, ...props }: TypographyProps) {
    return (
      <Text style={[defaultStyle, { color: color ?? defaultColor }, style]} {...props}>
        {children}
      </Text>
    );
  };
}

/** 画面タイトル — 20px SemiBold */
export const Heading = createTypography(
  { fontSize: FONT_SIZE.heading3, fontFamily: FONT_FAMILY.semiBold },
  TEXT_PRIMARY,
);

/** セクションタイトル — 17px SemiBold */
export const Subheading = createTypography(
  { fontSize: FONT_SIZE.body, fontFamily: FONT_FAMILY.semiBold },
  TEXT_PRIMARY,
);

/** 本文 — 17px Regular */
export const Body = createTypography(
  { fontSize: FONT_SIZE.body, fontFamily: FONT_FAMILY.regular },
  TEXT_SECONDARY,
);

/** 本文（小） — 15px Regular */
export const BodySmall = createTypography(
  { fontSize: FONT_SIZE.bodySmall, fontFamily: FONT_FAMILY.regular },
  TEXT_SECONDARY,
);

/** キャプション — 14px Regular */
export const Caption = createTypography(
  { fontSize: FONT_SIZE.caption, fontFamily: FONT_FAMILY.regular },
  TEXT_MUTED,
);

/** ラベル — 13px Regular */
export const Label = createTypography(
  { fontSize: FONT_SIZE.label, fontFamily: FONT_FAMILY.regular },
  TEXT_MUTED,
);

/** 小ラベル — 12px Regular */
export const LabelSmall = createTypography(
  { fontSize: FONT_SIZE.labelSmall, fontFamily: FONT_FAMILY.regular },
  TEXT_MUTED,
);

/** 大きな時刻表示 — 56px（Homeアラームカード用） */
export const TimeDisplay = createTypography(
  { fontSize: FONT_SIZE.title1, fontFamily: FONT_FAMILY.semiBold, letterSpacing: 1 },
  TEXT_PRIMARY,
);

/** 超大型時刻表示 — 128px（Ringing画面用） */
export const TimeDisplayLarge = createTypography(
  { fontSize: FONT_SIZE.display, fontFamily: FONT_FAMILY.bold },
  TEXT_PRIMARY,
);

/** アクセントテキスト — 13px（QRボタン等） */
export const AccentLabel = createTypography(
  { fontSize: FONT_SIZE.label, fontFamily: FONT_FAMILY.regular, letterSpacing: 1 },
  ACCENT_PRIMARY,
);
