/**
 * AdMob広告サービス（Web版 no-op）
 * Web環境ではAdMobは使用不可なため、全機能をスタブで提供。
 */
import { useCallback } from 'react';

export const isAdAvailable = false;

export async function initializeAdMob(): Promise<void> {
  // no-op on web
}

export const AD_UNIT_IDS = {
  bannerRinging: 'web-no-op',
  bannerSnooze: 'web-no-op',
  rewardedSnooze: 'web-no-op',
};

export function useRewardedAd() {
  const showAd = useCallback((): Promise<boolean> => Promise.resolve(false), []);
  return { showAd, isLoaded: false };
}
