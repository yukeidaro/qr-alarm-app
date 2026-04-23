/**
 * AiPrimitives — small visual primitives used by the ringing screen.
 *
 *  - PixelClock: large clock display (Inter Bold, tabular numerals, soft glow)
 *  - PillCTA: pressable pill button with subtle scale-down on press
 */
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AI_FONTS, AI_YELLOW } from '../constants/aiOS';

// ───────────────────────────────────────────────────────── PixelClock

type PixelClockProps = {
  /** Pre-formatted clock string, e.g. "07:30". */
  time: string;
  /** Logical size; the rendered fontSize equals this. */
  size?: number;
  /** Glyph color. */
  color?: string;
  /** Soft glow color (textShadow). Pass undefined to disable. */
  glow?: string;
};

export function PixelClock({
  time,
  size = 120,
  color = '#FFFFFF',
  glow,
}: PixelClockProps) {
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.5}
      style={[
        styles.pixelClock,
        {
          fontSize: size,
          lineHeight: size * 1.05,
          letterSpacing: -size * 0.04,
          color,
          textShadowColor: glow ?? 'transparent',
          textShadowRadius: glow ? 24 : 0,
        },
      ]}
    >
      {time}
    </Text>
  );
}

// ───────────────────────────────────────────────────────── PillCTA

type PillCTAProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function PillCTA({ onPress, children, style, disabled }: PillCTAProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 220,
      friction: 14,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 220,
      friction: 12,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.pill,
          { transform: [{ scale }], opacity: disabled ? 0.55 : 1 },
          style,
        ]}
      >
        {typeof children === 'string' ? (
          <Text style={styles.pillText}>{children}</Text>
        ) : (
          <View style={styles.pillContent}>{children}</View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pixelClock: {
    fontFamily: AI_FONTS.uiBold,
    textAlign: 'center',
    includeFontPadding: false,
    textShadowOffset: { width: 0, height: 0 },
    fontVariant: ['tabular-nums'],
  },
  pill: {
    backgroundColor: AI_YELLOW.base,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AI_YELLOW.glow,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pillContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: AI_FONTS.uiSemi,
    fontSize: 16,
    color: AI_YELLOW.onYellow,
    letterSpacing: 0.3,
  },
});
