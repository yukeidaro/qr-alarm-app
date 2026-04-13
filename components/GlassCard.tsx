/**
 * GlassCard — Liquid Glass デザインコンポーネント
 * iOS: BlurView ベースの半透明グラス効果
 * Android: 半透明ソリッド背景 + ソフトシャドウ
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';
import { RADIUS } from '../constants/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** 'surface1' = primary card, 'surface2' = secondary/modal */
  level?: 'surface1' | 'surface2';
  /** Show accent-tinted border */
  active?: boolean;
  /** Border radius override */
  borderRadius?: number;
}

export function GlassCard({
  children,
  style,
  level = 'surface1',
  active = false,
  borderRadius = RADIUS.base,
}: GlassCardProps) {
  const { glass, isDark, colors } = useTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const sub = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );
    return () => sub.remove();
  }, []);

  const blurIntensity = isDark ? 30 : 20;
  const surfaceBg = glass[level];
  const borderColor = active ? glass.borderActive : glass.border;

  const containerStyle: ViewStyle = {
    borderRadius,
    borderWidth: 0.5,
    borderColor,
    overflow: 'hidden',
    shadowColor: active ? glass.shadowAccent : glass.shadow,
    shadowOffset: { width: 0, height: active ? 0 : 2 },
    shadowOpacity: active ? 0.3 : 1,
    shadowRadius: active ? 8 : 6,
    elevation: active ? 3 : 2,
    ...(style as object),
  };

  if (Platform.OS === 'ios' && !reduceTransparency) {
    return (
      <View style={containerStyle}>
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: surfaceBg }]} />
        {active && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tint }]} />
        )}
        <View style={{ position: 'relative' }}>
          {children}
        </View>
      </View>
    );
  }

  // Android or Reduce Transparency: solid background fallback
  return (
    <View style={[containerStyle, { backgroundColor: reduceTransparency ? colors.bgSecondary : surfaceBg }]}>
      {active && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tint, borderRadius }]} />
      )}
      {children}
    </View>
  );
}

/**
 * GlassSeparator — Apple HIG separator for glass surfaces
 */
export function GlassSeparator({ style }: { style?: ViewStyle }) {
  const { glass } = useTheme();
  return (
    <View
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: glass.separator },
        style,
      ]}
    />
  );
}
