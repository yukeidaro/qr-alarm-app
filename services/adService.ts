/**
 * AdMob広告サービス
 * Expo Goではネイティブモジュールが使えないため、全機能をno-opで提供。
 * 開発ビルド/本番ビルドでのみ広告が表示される。
 */
import { Platform } from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Expo Go / Web 判定 ───
// Webではネイティブモジュールが使えないのでスキップ
// Expo Goではネイティブモジュールが存在しないので動的にチェック
let isAdAvailable = false;
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;
let TestIds: any = { BANNER: 'test-banner', REWARDED: 'test-rewarded' };

if (Platform.OS !== 'web') {
  try {
    const admob = require('react-native-google-mobile-ads');
    RewardedAd = admob.RewardedAd;
    RewardedAdEventType = admob.RewardedAdEventType;
    AdEventType = admob.AdEventType;
    TestIds = admob.TestIds;
    isAdAvailable = true;
  } catch {
    // Expo Go — native module not available
    isAdAvailable = false;
  }
}

export { isAdAvailable };

// ─── AdMob SDK 初期化 ───
export async function initializeAdMob(): Promise<void> {
  if (!isAdAvailable) return;
  try {
    if (Platform.OS === 'ios') {
      const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
      await requestTrackingPermissionsAsync();
    }
    const admob = require('react-native-google-mobile-ads');
    await admob.default().initialize();
  } catch {
    // AdMob not available
  }
}

// ─── Ad Unit IDs ───
const AD_UNIT_IDS = {
  bannerRinging: __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-8032919792244446/3218232495',
        android: 'ca-app-pub-8032919792244446/2547419709',
      })!,

  bannerSnooze: __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-8032919792244446/5239994244',
        android: 'ca-app-pub-8032919792244446/1436480607',
      })!,

  rewardedSnooze: __DEV__
    ? TestIds.REWARDED
    : Platform.select({
        ios: 'ca-app-pub-8032919792244446/8186759199',
        android: 'ca-app-pub-8032919792244446/9123398939',
      })!,
};

export { AD_UNIT_IDS };

// ─── Rewarded Ad Hook ───
export function useRewardedAd() {
  const adRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const loadAd = useCallback(() => {
    if (!isAdAvailable || !RewardedAd) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewardedSnooze, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setIsLoaded(true),
    );

    const unsubError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      () => setIsLoaded(false),
    );

    rewarded.load();
    adRef.current = rewarded;

    cleanupRef.current = () => {
      unsubLoaded();
      unsubError();
    };
  }, []);

  useEffect(() => {
    loadAd();
    return () => { cleanupRef.current?.(); };
  }, [loadAd]);

  const showAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isAdAvailable || !isLoaded || !adRef.current) {
        resolve(false);
        return;
      }

      let earned = false;

      const unsubEarned = adRef.current.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => { earned = true; },
      );

      const unsubClosed = adRef.current.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubEarned();
          unsubClosed();
          setIsLoaded(false);
          loadAd();
          resolve(earned);
        },
      );

      adRef.current.show();
    });
  }, [isLoaded, loadAd]);

  return { showAd, isLoaded };
}
