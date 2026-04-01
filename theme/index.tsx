/**
 * QR Alarm App — テーマプロバイダー
 * React Contextベースのテーマシステム。
 * 将来のライトモード対応にも拡張可能。
 */
import React, { createContext, useContext, useMemo } from 'react';
import { Colors, type ThemeColors } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE, TEXT_STYLE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ANIMATION, ACTIVE_OPACITY, TIMER } from '../constants/spacing';

export interface Theme {
  colors: ThemeColors;
  fonts: typeof FONT_FAMILY;
  fontSize: typeof FONT_SIZE;
  textStyle: typeof TEXT_STYLE;
  spacing: typeof SPACING;
  screenPadding: typeof SCREEN_PADDING;
  radius: typeof RADIUS;
  size: typeof SIZE;
  animation: typeof ANIMATION;
  activeOpacity: typeof ACTIVE_OPACITY;
  timer: typeof TIMER;
}

const darkTheme: Theme = {
  colors: Colors.dark,
  fonts: FONT_FAMILY,
  fontSize: FONT_SIZE,
  textStyle: TEXT_STYLE,
  spacing: SPACING,
  screenPadding: SCREEN_PADDING,
  radius: RADIUS,
  size: SIZE,
  animation: ANIMATION,
  activeOpacity: ACTIVE_OPACITY,
  timer: TIMER,
};

const ThemeContext = createContext<Theme>(darkTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useMemo(() => darkTheme, []);
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

// 個別エクスポート（直接インポート用）
export { Colors, FONT_FAMILY, FONT_SIZE, TEXT_STYLE, SPACING, SCREEN_PADDING, RADIUS, SIZE, ANIMATION, ACTIVE_OPACITY, TIMER };
