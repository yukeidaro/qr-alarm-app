/**
 * スヌーズ待機画面
 * スヌーズ後にここに遷移し、QRスキャンでのみ解除可能。
 * カウントダウンが0になると通知で再びringing画面に遷移する。
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  getSnoozeTime,
  getRegisteredQR,
  getSnoozeCount,
} from '../services/storageService';
import { AD_UNIT_IDS } from '../services/adService';
import AdBanner from '../components/AdBanner';
import {
  BG_PRIMARY, BG_SECONDARY, ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT,
  TEXT_PRIMARY, TEXT_MUTED, WARM_GLOW, WARM_GLOW_STRONG, ACCENT_SUBTLE,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t, formatCountdownLabel } from '../i18n';

export default function SnoozeScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const effectiveId = alarmId || 'default';

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [hasQR, setHasQR] = useState(false);

  const breatheAnim = useRef(new Animated.Value(0.4)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Block Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Fade in + breathing animation
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 0.4, duration: 4000, useNativeDriver: true }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, []);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      const qr = await getRegisteredQR();
      setHasQR(!!qr);
      const count = await getSnoozeCount(effectiveId);
      setSnoozeCount(count);
    };
    load();
  }, [effectiveId]);

  // Countdown timer
  useEffect(() => {
    const updateRemaining = async () => {
      const targetTime = await getSnoozeTime(effectiveId);
      if (targetTime) {
        const diff = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
        setRemainingSeconds(diff);
      } else {
        setRemainingSeconds(0);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [effectiveId]);

  const handleScanQR = () => {
    router.push({
      pathname: '/scan',
      params: { mode: 'dismiss', alarmId: effectiveId },
    });
  };

  const formatRemaining = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalSnooze = 5 * 60; // 5 minutes in seconds
  const progress = remainingSeconds !== null ? Math.max(0, 1 - remainingSeconds / totalSnooze) : 0;

  return (
    <View style={styles.container}>
      {/* Banner ad */}
      <View style={styles.topAd}>
        <AdBanner unitId={AD_UNIT_IDS.bannerSnooze} />
      </View>

      <Animated.View style={[styles.centerContent, { opacity: fadeIn }]}>
        {/* Breathing warm glow */}
        <Animated.View style={[styles.warmGlow, { opacity: breatheAnim }]} />

        {/* Snooze count */}
        {snoozeCount > 0 && (
          <View style={styles.countBadge}>
            <View style={styles.countBadgeDot} />
            <Text style={styles.countBadgeText}>{t.snooze.countBadge(snoozeCount)}</Text>
          </View>
        )}

        {/* Countdown */}
        {remainingSeconds !== null && remainingSeconds > 0 ? (
          <>
            <Text style={styles.countdown}>{formatRemaining(remainingSeconds)}</Text>
            <Text style={styles.label}>{t.snooze.alarmInLabel}</Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.countdown}>0:00</Text>
            <Text style={styles.labelUrgent}>{t.snooze.alarmSoonLabel}</Text>
          </>
        )}
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <AdBanner unitId={AD_UNIT_IDS.bannerSnooze} />

        <TouchableOpacity style={styles.scanButton} onPress={handleScanQR} activeOpacity={0.8}>
          <Text style={styles.scanButtonText}>
            {hasQR ? t.snooze.scanToDismiss : t.snooze.registerQr}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {hasQR ? t.snooze.hintQr : t.snooze.hintNoQr}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },
  topAd: {
    position: 'absolute',
    top: SPACING['7xl'],
    left: 0,
    right: 0,
    zIndex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  warmGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: WARM_GLOW_STRONG,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  countBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ACCENT_PRIMARY,
    opacity: 0.6,
  },
  countBadgeText: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
  },
  countdown: {
    fontSize: 88,
    fontFamily: FONT_FAMILY.bold,
    color: TEXT_PRIMARY,
    letterSpacing: 4,
  },
  label: {
    fontSize: FONT_SIZE.body,
    color: ACCENT_SUBTLE,
    fontFamily: FONT_FAMILY.regular,
    marginTop: SPACING.base,
  },
  labelUrgent: {
    fontSize: FONT_SIZE.body,
    color: ACCENT_PRIMARY,
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: SPACING.base,
  },
  progressTrack: {
    width: 120,
    height: 2,
    borderRadius: 1,
    backgroundColor: BG_SECONDARY,
    marginTop: SPACING.xxl,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: ACCENT_PRIMARY,
  },
  actions: {
    position: 'absolute',
    bottom: SCREEN_PADDING.bottom,
    left: SCREEN_PADDING.horizontal,
    right: SCREEN_PADDING.horizontal,
    alignItems: 'center',
    gap: SPACING.base,
  },
  scanButton: {
    width: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: ACCENT_PRIMARY,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: FONT_SIZE.body,
    color: ACCENT_PRIMARY_TEXT,
    fontFamily: FONT_FAMILY.semiBold,
  },
  hint: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
});
