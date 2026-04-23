/**
 * スヌーズ待機画面
 * スヌーズ後にここに遷移し、QRスキャンでのみ解除可能。
 * カウントダウンが0になると通知で再びringing画面に遷移する。
 */
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  getSnoozeTime,
  getRegisteredQR,
  getSnoozeCount,
} from '../services/storageService';
import { SNOOZE_MINUTES } from '../services/alarmService';
import { getSnoozeMinutesSync, loadSnoozeMinutes } from '../services/snoozeIntervalStore';
import { AD_UNIT_IDS } from '../services/adService';
import AdBanner from '../components/AdBanner';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../theme';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t, formatCountdownLabel } from '../i18n';

export default function SnoozeScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const effectiveId = alarmId || 'default';
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [hasQR, setHasQR] = useState(false);

  const breatheAnim = useRef(new Animated.Value(0.4)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const urgentGlow = useRef(new Animated.Value(0)).current;

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

  // Urgent pulse when countdown reaches 0
  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds <= 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(urgentGlow, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(urgentGlow, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      glow.start();
      return () => { pulse.stop(); glow.stop(); };
    } else {
      pulseScale.setValue(1);
      urgentGlow.setValue(0);
    }
  }, [remainingSeconds]);

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

  // Countdown timer — read target time once, then count down in memory
  const targetTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Load target time once
    getSnoozeTime(effectiveId).then(t => {
      targetTimeRef.current = t;
    });

    const interval = setInterval(() => {
      if (targetTimeRef.current) {
        const diff = Math.max(0, Math.ceil((targetTimeRef.current - Date.now()) / 1000));
        setRemainingSeconds(diff);
      } else {
        setRemainingSeconds(0);
      }
    }, 1000);
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

  const totalSnooze = getSnoozeMinutesSync() * 60;
  const progress = remainingSeconds !== null ? Math.max(0, 1 - remainingSeconds / totalSnooze) : 0;

  return (
    <View style={styles.container}>
      {/* Banner ad */}
      <View style={styles.topAd}>
        <AdBanner unitId={AD_UNIT_IDS.bannerSnooze} />
      </View>

      <Animated.View style={[styles.centerContent, { opacity: fadeIn }]}>
        {/* Breathing warm glow */}
        <Animated.View style={[
          styles.warmGlow,
          remainingSeconds !== null && remainingSeconds <= 0
            ? { opacity: urgentGlow, backgroundColor: 'rgba(232, 168, 56, 0.25)' }
            : { opacity: breatheAnim },
        ]} />

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
        ) : remainingSeconds !== null && remainingSeconds <= 0 ? (
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: pulseScale }] }}>
            <Text style={styles.countdownUrgent}>0:00</Text>
            <Text style={styles.labelUrgent}>{t.snooze.alarmRinging}</Text>
          </Animated.View>
        ) : null}
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
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
    backgroundColor: c.warmGlowStrong,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgSecondary,
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
    backgroundColor: c.accent,
    opacity: 0.6,
  },
  countBadgeText: {
    fontSize: FONT_SIZE.labelSmall,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.regular,
  },
  countdown: {
    fontSize: 88,
    fontFamily: FONT_FAMILY.bold,
    color: c.textPrimary,
    letterSpacing: 4,
  },
  countdownUrgent: {
    fontSize: 88,
    fontFamily: FONT_FAMILY.bold,
    color: c.accent,
    letterSpacing: 4,
  },
  label: {
    fontSize: FONT_SIZE.body,
    color: c.accentSubtle,
    fontFamily: FONT_FAMILY.regular,
    marginTop: SPACING.base,
  },
  labelUrgent: {
    fontSize: FONT_SIZE.body,
    color: c.accent,
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: SPACING.base,
  },
  progressTrack: {
    width: 120,
    height: 2,
    borderRadius: 1,
    backgroundColor: c.bgSecondary,
    marginTop: SPACING.xxl,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: c.accent,
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
    backgroundColor: c.accent,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: FONT_SIZE.body,
    color: c.accentText,
    fontFamily: FONT_FAMILY.semiBold,
  },
  hint: {
    fontSize: FONT_SIZE.labelSmall,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
});
