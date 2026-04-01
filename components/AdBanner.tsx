/**
 * バナー広告コンポーネント
 * Expo Goではレンダリングしない（ネイティブモジュール非対応）。
 */
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { isAdAvailable } from '../services/adService';

interface AdBannerProps {
  unitId: string;
}

export default function AdBanner({ unitId }: AdBannerProps) {
  const [loaded, setLoaded] = useState(false);

  if (!isAdAvailable || Platform.OS === 'web') return null;

  // Dynamic require to avoid crash in Expo Go / Web
  const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');

  return (
    <View style={[styles.container, !loaded && styles.hidden]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
