import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alarm,
  getAlarms,
  getRegisteredQR,
  getRingingBackground,
  getSnoozeCount,
  incrementSnoozeCount,
  resetSnoozeCount,
  saveSnoozeTime,
} from '../services/storageService';
import { playAlarm, stopAlarm } from '../services/audioService';
import { scheduleSnooze } from '../services/alarmService';
import { useRewardedAd, AD_UNIT_IDS } from '../services/adService';
import AdBanner from '../components/AdBanner';
import {
  BG_PRIMARY, BG_SECONDARY, BG_URGENCY_1, BG_URGENCY_2,
  ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT,
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SECONDARY, ERROR, OVERLAY,
  WARM_GLOW, WARM_GLOW_STRONG,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ANIMATION, TIMER, ACTIVE_OPACITY } from '../constants/spacing';
import { t } from '../i18n';

const MAX_FREE_SNOOZE = 2;

export default function RingingScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const { showAd: showRewardedAd, isLoaded: rewardedLoaded } = useRewardedAd();

  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [alarmReady, setAlarmReady] = useState(!alarmId); // ready immediately if no alarmId
  const [hasQR, setHasQR] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in the screen
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Breathing glow
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 3000, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);

  // Load alarm data on mount
  useEffect(() => {
    const init = async () => {
      const qr = await getRegisteredQR();
      setHasQR(!!qr);
      const bg = await getRingingBackground();
      setBgUri(bg);
      const effectiveId = alarmId || 'default';
      const count = await getSnoozeCount(effectiveId);
      setSnoozeCount(count);

      if (alarmId) {
        const alarms = await getAlarms();
        const found = alarms.find((a) => a.id === alarmId);
        if (found) setAlarm(found);
        setAlarmReady(true);
      }
    };
    init();
    return () => { stopAlarm(); };
  }, [alarmId]);

  // Play alarm on focus (initial + returning from scan screen)
  useFocusEffect(
    useCallback(() => {
      if (!alarmReady) return;
      const soundId = alarm?.soundId || 'gentle';
      const volume = alarm?.volume ?? 1.0;
      const fadeIn = alarm?.fadeIn ?? false;
      playAlarm(soundId, undefined, volume, fadeIn);
      return () => { /* stopAlarm handled by scan screen or unmount */ };
    }, [alarm, alarmReady])
  );

  useEffect(() => {
    const duration = snoozeCount >= 2 ? ANIMATION.duration.pulseUrgent : ANIMATION.duration.pulseNormal;
    const scale = snoozeCount >= 2 ? ANIMATION.pulseScale.urgent : ANIMATION.pulseScale.normal;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: scale, duration, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [snoozeCount]);

  const navigateToSnooze = () => {
    router.replace({ pathname: '/snooze', params: { alarmId: alarmId || 'default' } });
  };

  const doSnooze = async () => {
    await stopAlarm();
    const effectiveId = alarmId || 'default';
    await incrementSnoozeCount(effectiveId);
    if (alarm) {
      await scheduleSnooze(alarm);
      await saveSnoozeTime(effectiveId, Date.now() + TIMER.snoozeDuration);
    }
    navigateToSnooze();
  };

  const handleSnooze = async () => {
    if (snoozeCount >= MAX_FREE_SNOOZE) {
      if (rewardedLoaded) {
        const earned = await showRewardedAd();
        if (earned) {
          await doSnooze();
        } else {
          Alert.alert(t.ringing.adRequired, t.ringing.adRequiredMessage);
        }
      } else {
        Alert.alert(t.ringing.adNotReady, t.ringing.adWait);
      }
      return;
    }
    await doSnooze();
  };

  const handleScanQR = () => {
    router.push({ pathname: '/scan', params: { mode: 'dismiss', alarmId: alarmId || '' } });
  };

  const now = new Date();
  const displayTime = alarm
    ? `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`
    : `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const snoozeLabel = snoozeCount >= MAX_FREE_SNOOZE
    ? t.ringing.snoozeWithAd
    : snoozeCount > 0
      ? t.ringing.snoozeCount(snoozeCount, MAX_FREE_SNOOZE)
      : t.ringing.snooze;

  // Dynamic background based on urgency
  const urgencyBg = snoozeCount >= 2 ? BG_URGENCY_2 : snoozeCount >= 1 ? BG_URGENCY_1 : BG_PRIMARY;

  const content = (
    <Animated.View style={[styles.innerContainer, { opacity: fadeIn }]}>
      {/* Top banner ad */}
      <View style={styles.topAd}>
        <AdBanner unitId={AD_UNIT_IDS.bannerRinging} />
      </View>

      {/* Warm glow behind time */}
      <Animated.View style={[styles.timeGlow, { opacity: glowAnim }]} />

      {/* Snooze count badge */}
      {snoozeCount > 0 && (
        <View style={[styles.snoozeBadge, snoozeCount >= 2 && styles.snoozeBadgeUrgent]}>
          <Text style={[styles.snoozeBadgeText, snoozeCount >= 2 && styles.snoozeBadgeTextUrgent]}>
            {t.ringing.snoozeBadge(snoozeCount)}
          </Text>
        </View>
      )}

      {/* Time */}
      <Animated.Text style={[styles.time, { transform: [{ scale: pulseAnim }] }]}>
        {displayTime}
      </Animated.Text>

      {/* Greeting */}
      <Text style={styles.greeting}>{t.ringing.greeting}</Text>

      {/* Urgency message */}
      {snoozeCount >= 2 && (
        <View style={styles.urgencyBadge}>
          <Text style={styles.urgencyText}>{t.ringing.urgency}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <AdBanner unitId={AD_UNIT_IDS.bannerRinging} />

        {/* Main CTA — scan to dismiss */}
        <TouchableOpacity style={styles.mainButton} onPress={handleScanQR} activeOpacity={0.8}>
          <View style={styles.mainButtonGlow} />
          <Text style={styles.mainButtonText}>{t.ringing.scanToDismiss}</Text>
        </TouchableOpacity>

        {/* Snooze — intentionally subdued, hidden if snooze disabled */}
        {(alarm?.snoozeEnabled ?? true) && (
          <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.snoozeText}>{snoozeLabel}</Text>
          </TouchableOpacity>
        )}

        {!hasQR && (
          <Text style={styles.noQrHint}>{t.ringing.noQrHint}</Text>
        )}
      </View>
    </Animated.View>
  );

  if (bgUri) {
    return (
      <ImageBackground source={{ uri: bgUri }} style={styles.container} resizeMode="cover">
        <View style={styles.bgOverlay}>{content}</View>
      </ImageBackground>
    );
  }

  return <View style={[styles.container, { backgroundColor: urgencyBg }]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  bgOverlay: {
    flex: 1,
    backgroundColor: OVERLAY.black35,
  },
  topAd: {
    position: 'absolute',
    top: SPACING['7xl'],
    left: 0,
    right: 0,
  },
  timeGlow: {
    position: 'absolute',
    width: 300,
    height: 200,
    borderRadius: 150,
    backgroundColor: WARM_GLOW_STRONG,
    top: '30%',
  },
  snoozeBadge: {
    backgroundColor: BG_SECONDARY,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xxl,
  },
  snoozeBadgeUrgent: {
    backgroundColor: 'rgba(240, 149, 148, 0.12)',
  },
  snoozeBadgeText: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
  },
  snoozeBadgeTextUrgent: {
    color: ERROR,
    fontFamily: FONT_FAMILY.medium,
  },
  time: {
    fontSize: FONT_SIZE.display,
    fontFamily: FONT_FAMILY.bold,
    color: TEXT_PRIMARY,
    letterSpacing: 4,
  },
  greeting: {
    fontSize: FONT_SIZE.subheading,
    color: TEXT_MUTED,
    marginTop: SPACING.xl,
    fontFamily: FONT_FAMILY.regular,
  },
  urgencyBadge: {
    marginTop: SPACING.base,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(240, 149, 148, 0.10)',
  },
  urgencyText: {
    fontSize: FONT_SIZE.bodySmall,
    color: ERROR,
    fontFamily: FONT_FAMILY.semiBold,
  },
  actions: {
    position: 'absolute',
    bottom: SCREEN_PADDING.bottom,
    left: SCREEN_PADDING.horizontal,
    right: SCREEN_PADDING.horizontal,
    alignItems: 'center',
    gap: SPACING.base,
  },
  mainButton: {
    width: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: ACCENT_PRIMARY,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainButtonGlow: {
    position: 'absolute',
    top: -10,
    width: '60%',
    height: 20,
    borderRadius: 10,
    backgroundColor: WARM_GLOW_STRONG,
    alignSelf: 'center',
  },
  mainButtonText: {
    fontSize: FONT_SIZE.body,
    color: ACCENT_PRIMARY_TEXT,
    fontFamily: FONT_FAMILY.semiBold,
  },
  snoozeButton: {
    width: '100%',
    backgroundColor: BG_SECONDARY,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  snoozeText: {
    fontSize: FONT_SIZE.caption,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
  },
  noQrHint: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
