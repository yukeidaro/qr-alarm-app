/**
 * Ringing Screen — AI OS design
 * フルスクリーン純黒 + crimson radial glow + 巨大Inter Bold clock + scan/snooze CTAs.
 */
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
import { Ionicons } from '@expo/vector-icons';
import {
  Alarm,
  getAlarms,
  getRegisteredQR,
  getRingingBackground,
  getSnoozeCount,
  incrementSnoozeCount,
  saveSnoozeTime,
} from '../services/storageService';
import { playAlarm, stopAlarm, getSoundOutputMode } from '../services/audioService';
import { scheduleSnooze } from '../services/alarmService';
import { useRewardedAd, AD_UNIT_IDS } from '../services/adService';
import AdBanner from '../components/AdBanner';
import {
  AI_CANVAS,
  AI_TEXT,
  AI_YELLOW,
  AI_FONTS,
  AI_RADIUS,
  AI_ACCENTS,
} from '../constants/aiOS';
import { PixelClock, PillCTA } from '../components/AiPrimitives';
import { TIMER } from '../constants/spacing';
import { t } from '../i18n';

const MAX_FREE_SNOOZE = 2;

export default function RingingScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const { showAd: showRewardedAd, isLoaded: rewardedLoaded } = useRewardedAd();

  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [alarmReady, setAlarmReady] = useState(!alarmId);
  const [hasQR, setHasQR] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(0);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const clockPulse = useRef(new Animated.Value(1)).current;

  // Use crimson glow always for ringing (matches Behance reference)
  const ringingAccent = AI_ACCENTS.crimson;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1, duration: 700, useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.4, duration: 2400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      if (!alarmReady) return;
      const soundId = alarm?.soundId || 'gentle';
      const volume = alarm?.volume ?? 1.0;
      const useFadeIn = alarm?.fadeIn ?? false;
      getSoundOutputMode().then((mode) => {
        playAlarm(soundId, undefined, volume, useFadeIn, mode).catch((e) => {
          console.warn('[ringing] playAlarm failed', e);
        });
      });
      // Stop sound when leaving (e.g., when navigating to scan screen)
      // It will resume on refocus because this effect re-runs.
      return () => { stopAlarm(); };
    }, [alarm, alarmReady]),
  );

  // Pulse the clock when snooze count >= 2 (urgency)
  useEffect(() => {
    if (snoozeCount < 2) {
      clockPulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(clockPulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(clockPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [snoozeCount]);

  const navigateToSnooze = () => {
    router.replace({ pathname: '/snooze', params: { alarmId: alarmId || 'default' } });
  };

  const doSnooze = async () => {
    await stopAlarm();
    const effectiveId = alarmId || 'default';
    await incrementSnoozeCount(effectiveId);
    if (alarm) await scheduleSnooze(alarm);
    await saveSnoozeTime(effectiveId, Date.now() + TIMER.snoozeDuration);
    navigateToSnooze();
  };

  const handleSnooze = async () => {
    if (snoozeCount >= MAX_FREE_SNOOZE) {
      if (rewardedLoaded) {
        const earned = await showRewardedAd();
        if (earned) await doSnooze();
        else Alert.alert(t.ringing.adRequired, t.ringing.adRequiredMessage);
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

  const content = (
    <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
      {/* Top ad */}
      <View style={styles.topAd}>
        <AdBanner unitId={AD_UNIT_IDS.bannerRinging} />
      </View>

      {/* Snooze count badge */}
      {snoozeCount > 0 && (
        <View
          style={[
            styles.snoozeBadge,
            snoozeCount >= 2 && { backgroundColor: 'rgba(255,42,42,0.18)' },
          ]}
        >
          <Text
            style={[
              styles.snoozeBadgeText,
              snoozeCount >= 2 && { color: ringingAccent.hex, fontFamily: AI_FONTS.uiSemi },
            ]}
          >
            {t.ringing.snoozeBadge(snoozeCount)}
          </Text>
        </View>
      )}

      {/* Hero: pulsing radial glow + huge LED clock */}
      <View style={styles.clockBlock}>
        <Animated.View
          style={[
            styles.glowOrb,
            {
              opacity: glowPulse,
              transform: [{
                scale: glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.1] }),
              }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: clockPulse }] }}>
          <PixelClock
            time={displayTime}
            size={108}
            color={ringingAccent.hex}
            glow={ringingAccent.hex}
          />
        </Animated.View>
        <Text style={styles.greeting}>{t.ringing.greeting}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.bottomAd}>
          <AdBanner unitId={AD_UNIT_IDS.bannerRinging} />
        </View>

        <PillCTA onPress={handleScanQR} style={styles.scanPill}>
          <View style={styles.scanInner}>
            <Ionicons name="scan-outline" size={18} color={AI_YELLOW.onYellow} />
            <Text style={styles.scanText}>{t.ringing.scanToDismiss}</Text>
          </View>
        </PillCTA>

        <View style={styles.bottomChrome}>
          {(alarm?.snoozeEnabled ?? true) && (
            <TouchableOpacity onPress={handleSnooze} style={styles.snoozeBtn} activeOpacity={0.7}>
              <Text style={styles.snoozeText}>{snoozeLabel}</Text>
            </TouchableOpacity>
          )}
        </View>

        {!hasQR && <Text style={styles.noQrHint}>{t.ringing.noQrHint}</Text>}
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
  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AI_CANVAS.bgBlack,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  bgOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  topAd: {
    width: '100%',
    alignItems: 'center',
  },
  snoozeBadge: {
    backgroundColor: AI_CANVAS.bgTile,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: AI_RADIUS.pill,
    borderWidth: 1,
    borderColor: AI_CANVAS.hairline,
    marginTop: 16,
  },
  snoozeBadgeText: {
    fontSize: 11,
    color: AI_TEXT.secondary,
    fontFamily: AI_FONTS.uiMedium,
    letterSpacing: 1,
  },
  clockBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  glowOrb: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,42,42,0.18)',
    shadowColor: '#FF2A2A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
  },
  greeting: {
    color: AI_TEXT.secondary,
    fontFamily: AI_FONTS.uiMedium,
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 24,
    textTransform: 'uppercase',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  bottomAd: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  scanPill: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  scanInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanText: {
    color: AI_YELLOW.onYellow,
    fontFamily: AI_FONTS.uiSemi,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  bottomChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  snoozeBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: AI_RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: AI_CANVAS.hairline,
  },
  snoozeText: {
    color: AI_TEXT.secondary,
    fontFamily: AI_FONTS.uiMedium,
    fontSize: 13,
  },
  noQrHint: {
    color: AI_TEXT.muted,
    fontSize: 11,
    fontFamily: AI_FONTS.ui,
    textAlign: 'center',
    marginTop: 8,
  },
});
