/**
 * QR Alarm App — 共通ボタンコンポーネント
 * Primary / Secondary / Danger / Ghost の4バリアント
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
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

export default function Button({
  title,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, glass, isDark } = useTheme();

  const variantStyles: Record<ButtonVariant, { bg: string; text: string }> = {
    primary: { bg: colors.accent, text: colors.accentText },
    secondary: {
      bg: Platform.OS === 'ios' ? glass.surface2 : colors.bgTertiary,
      text: colors.textPrimary,
    },
    danger: { bg: colors.errorBg, text: colors.textContrast },
    ghost: {
      bg: 'transparent',
      text: colors.textMuted,
    },
  };

  const v = variantStyles[variant];

  const glassAccent: ViewStyle = variant === 'primary' ? {
    shadowColor: glass.shadowAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
  } : {};

  const glassBorder: ViewStyle =
    variant === 'secondary' || variant === 'ghost'
      ? { borderWidth: 0.5, borderColor: glass.border }
      : {};

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: v.bg },
        glassAccent,
        glassBorder,
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
