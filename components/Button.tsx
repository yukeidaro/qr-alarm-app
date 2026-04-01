/**
 * QR Alarm App — 共通ボタンコンポーネント
 * Primary / Secondary / Danger / Ghost の4バリアント
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT, BG_TERTIARY, TEXT_PRIMARY, TEXT_MUTED, ERROR_BG, TEXT_CONTRAST } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { RADIUS, SPACING, ACTIVE_OPACITY } from '../constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string }> = {
  primary: { bg: ACCENT_PRIMARY, text: ACCENT_PRIMARY_TEXT },
  secondary: { bg: BG_TERTIARY, text: TEXT_PRIMARY },
  danger: { bg: ERROR_BG, text: TEXT_CONTRAST },
  ghost: { bg: 'transparent', text: TEXT_MUTED },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: v.bg },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={ACTIVE_OPACITY.default}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          { color: v.text },
          variant === 'ghost' && styles.ghostText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
  },
  ghostText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
  },
});
