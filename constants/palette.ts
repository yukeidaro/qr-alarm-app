/**
 * 共通パレット — light / dark 用の色テーブル
 * 各画面で `const C = useC();` で取得して動的にダーク対応する
 */
import { useMemo } from 'react';
import { useTheme } from '../theme';

export interface AppPalette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  line: string;
  lineSoft: string;
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  orange: string;
  orangeDim: string;
  orangeGlow: string;
  warnBg: string;
  warnInk: string;
}

const LIGHT: AppPalette = {
  bg: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8F9',
  line: '#E5E5E7',
  lineSoft: '#EDEDEF',
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#A1A1AA',
  ink4: '#D4D4D8',
  orange: '#F85A3E',
  orangeDim: '#FDE9E4',
  orangeGlow: 'rgba(248,90,62,0.22)',
  warnBg: '#FEEEE9',
  warnInk: '#A8341E',
};

const DARK: AppPalette = {
  bg: '#1A1816',
  surface: '#252220',
  surfaceAlt: '#2A2725',
  line: '#3A3633',
  lineSoft: '#2F2C2A',
  ink: '#F0EBE5',
  ink2: '#B5AFA8',
  ink3: '#827C75',
  ink4: '#5A5550',
  orange: '#F85A3E',
  orangeDim: '#3D2520',
  orangeGlow: 'rgba(248,90,62,0.30)',
  warnBg: '#3D2520',
  warnInk: '#F4A48F',
};

export function useC(): AppPalette {
  const { isDark } = useTheme();
  return useMemo(() => (isDark ? DARK : LIGHT), [isDark]);
}

export { LIGHT as LIGHT_PALETTE, DARK as DARK_PALETTE };
