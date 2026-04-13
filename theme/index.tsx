/**
 * QR Alarm App — テーマプロバイダー
 * ライト/ダークモード対応。AsyncStorageに永続化。
 */
import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, GLASS, type ThemeColors, type GlassTokens } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE, TEXT_STYLE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ANIMATION, ACTIVE_OPACITY, TIMER } from '../constants/spacing';

const THEME_KEY = '@qralarm/theme_mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  colors: ThemeColors;
  glass: GlassTokens;
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
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const defaultTheme: Theme = {
  colors: Colors.light,
  glass: GLASS.light,
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
  isDark: false,
  themeMode: 'light',
  setThemeMode: () => {},
};

const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const isDark = themeMode === 'system'
    ? systemScheme === 'dark'
    : themeMode === 'dark';

  const theme = useMemo<Theme>(() => ({
    colors: isDark ? Colors.dark : Colors.light,
    glass: isDark ? GLASS.dark : GLASS.light,
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
    isDark,
    themeMode,
    setThemeMode,
  }), [isDark, themeMode, setThemeMode]);

  if (!loaded) return null;

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
