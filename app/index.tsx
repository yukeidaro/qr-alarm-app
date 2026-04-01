import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alarm,
  getAlarms,
  saveAlarm,
  deleteAlarm,
  getRegisteredQR,
  getAllSnoozeAlarmIds,
  getSnoozeTime,
  clearSnoozeTime,
} from '../services/storageService';
import { scheduleAlarm, cancelAlarm } from '../services/alarmService';
import AlarmCard from '../components/AlarmCard';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import HandwrittenText from '../components/HandwrittenText';
import { Heading, Caption, Label } from '../components/Typography';
import {
  BG_PRIMARY, BG_SECONDARY, ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, OVERLAY,
  WARM_GLOW, WARM_GLOW_STRONG, ACCENT_SUBTLE, BG_TERTIARY,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, RADIUS, ACTIVE_OPACITY, ANIMATION } from '../constants/spacing';
import { t, getDayNames, formatDate, formatNextAlarm, formatSnoozeBanner } from '../i18n';

const ONBOARDING_KEY = '@qralarm/onboarding_done';
const NAME_KEY = '@qralarm/user_name';

function getGreeting(name: string | null): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return name ? t.greetingMorningName(name) : t.greetingMorning;
  if (hour >= 11 && hour < 17) return name ? t.greetingAfternoonName(name) : t.greetingAfternoon;
  if (hour >= 17 && hour < 22) return name ? t.greetingEveningName(name) : t.greetingEvening;
  return name ? t.greetingNightName(name) : t.greetingNight;
}

function getDateString(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dow = getDayNames()[now.getDay()];
  return formatDate(month, day, dow);
}

function getNextAlarmText(alarms: Alarm[]): string | null {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let minDiff = Infinity;

  for (const alarm of enabled) {
    const alarmMinutes = alarm.hour * 60 + alarm.minute;
    let diff = alarmMinutes - nowMinutes;
    if (diff <= 0) diff += 24 * 60;
    if (diff < minDiff) minDiff = diff;
  }

  if (minDiff === Infinity) return null;
  const hours = Math.floor(minDiff / 60);
  const minutes = minDiff % 60;
  return formatNextAlarm(hours, minutes);
}

export default function HomeScreen() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [hasQR, setHasQR] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [dateString, setDateString] = useState('');
  const [nextAlarmText, setNextAlarmText] = useState<string | null>(null);
  const [snoozeBanner, setSnoozeBanner] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const snoozePulse = useRef(new Animated.Value(1)).current;
  const heroFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAlarms = useCallback(async () => {
    const loaded = await getAlarms();
    const sorted = loaded.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    setAlarms(sorted);
    const qr = await getRegisteredQR();
    setHasQR(!!qr);
    const name = await AsyncStorage.getItem(NAME_KEY);
    setGreeting(getGreeting(name));
    setDateString(getDateString());
    setNextAlarmText(getNextAlarmText(sorted));
  }, []);

  const checkSnooze = useCallback(async () => {
    const snoozeIds = await getAllSnoozeAlarmIds();
    let activeSnooze: string | null = null;
    let activeSnoozeAlarmId: string | null = null;

    for (const aid of snoozeIds) {
      const targetTime = await getSnoozeTime(aid);
      if (targetTime) {
        const remaining = targetTime - Date.now();
        if (remaining > 0) {
          const mins = Math.ceil(remaining / 60000);
          activeSnooze = formatSnoozeBanner(mins);
          activeSnoozeAlarmId = aid;
        } else {
          await clearSnoozeTime(aid);
        }
      }
    }
    setSnoozeBanner(activeSnooze);

    if (activeSnoozeAlarmId) {
      router.replace({ pathname: '/snooze', params: { alarmId: activeSnoozeAlarmId } });
    }
  }, [router]);

  useEffect(() => {
    if (!snoozeBanner) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(snoozePulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(snoozePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [snoozeBanner]);

  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!done) {
        router.replace('/onboarding');
        return;
      }
      const qr = await getRegisteredQR();
      if (!qr) setShowOnboarding(true);
    };
    checkOnboarding();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
      checkSnooze();
      const interval = setInterval(checkSnooze, 10000);
      return () => clearInterval(interval);
    }, [loadAlarms, checkSnooze])
  );

  const handleToggle = async (alarm: Alarm) => {
    const updated = { ...alarm, enabled: !alarm.enabled };
    await saveAlarm(updated);
    if (updated.enabled) await scheduleAlarm(updated);
    else await cancelAlarm(updated.id);
    loadAlarms();
  };

  const handleDelete = async (alarm: Alarm) => {
    await deleteAlarm(alarm.id);
    await cancelAlarm(alarm.id);
    loadAlarms();
  };

  const handlePress = (alarm: Alarm) => {
    router.push({ pathname: '/edit', params: { id: alarm.id } });
  };

  const handleAdd = () => router.push('/edit');

  const handleRegisterQR = () => {
    router.push({ pathname: '/scan', params: { mode: 'register' } });
  };

  const handleOnboardingRegister = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    router.push({ pathname: '/scan', params: { mode: 'register' } });
  };

  const handleOnboardingLater = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const enabledCount = alarms.filter(a => a.enabled).length;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.brandName}>ScanAlarm</Text>
        <TouchableOpacity
          style={[styles.qrButton, hasQR && styles.qrButtonRegistered]}
          onPress={handleRegisterQR}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Text style={[styles.qrButtonText, hasQR && styles.qrButtonTextActive]}>
            {hasQR ? t.home.qrRegistered : t.home.qrRegister}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero — Time & Greeting */}
      <Animated.View style={[styles.heroSection, { opacity: heroFade }]}>
        <Text style={styles.heroDateText}>{dateString}</Text>
        <Text style={styles.heroTime}>{currentTime}</Text>

        {greeting ? (
          <HandwrittenText
            text={greeting}
            style={styles.heroGreeting}
            speed={60}
            delay={400}
          />
        ) : null}

        {/* Status badges */}
        {(nextAlarmText || snoozeBanner) && (
          <View style={styles.heroBadges}>
            {nextAlarmText && (
              <View style={styles.nextAlarmBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.nextAlarmText}>{nextAlarmText}</Text>
              </View>
            )}
            {snoozeBanner && (
              <View style={styles.snoozeBadge}>
                <Animated.View style={[styles.snoozeDot, { opacity: snoozePulse }]} />
                <Text style={styles.snoozeText}>{snoozeBanner}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>

      {/* Alarm List */}
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{t.home.alarms}</Text>
            {alarms.length > 0 && (
              <Text style={styles.countText}>{enabledCount}/{alarms.length}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.addButtonSmall} onPress={handleAdd} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.addButtonSmallText}>{t.home.addAlarm}</Text>
          </TouchableOpacity>
        </View>

        {alarms.length === 0 ? (
          <TouchableOpacity style={styles.empty} onPress={handleAdd} activeOpacity={0.8}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>+</Text>
              <Text style={styles.emptyTitle}>{t.home.emptyTitle}</Text>
              <Text style={styles.emptyHint}>{t.home.emptyHint}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={alarms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlarmCard alarm={item} onToggle={handleToggle} onPress={handlePress} onDelete={handleDelete} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* FAB */}
      {alarms.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Onboarding Modal */}
      <AppModal visible={showOnboarding} layout="center">
        <Heading style={{ marginBottom: SPACING.base, marginTop: SPACING.lg }}>{t.onboarding.title}</Heading>
        <Caption style={styles.onboardingDesc}>{t.onboarding.description}</Caption>
        <Button title={t.onboarding.registerNow} onPress={handleOnboardingRegister} fullWidth style={{ marginBottom: SPACING.base }} />
        <Button title={t.onboarding.later} onPress={handleOnboardingLater} variant="ghost" fullWidth />
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },

  // ─── Top Bar ───
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING['7xl'],
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xs,
  },
  brandName: {
    fontSize: FONT_SIZE.body,
    color: TEXT_PRIMARY,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.semiBold,
  },
  qrButton: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.full,
    backgroundColor: BG_SECONDARY,
  },
  qrButtonRegistered: {
    backgroundColor: OVERLAY.accent10,
  },
  qrButtonText: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.medium,
  },
  qrButtonTextActive: {
    color: ACCENT_SUBTLE,
  },

  // ─── Hero ───
  heroSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['4xl'],
    paddingHorizontal: SPACING.xxl,
  },
  heroDateText: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    letterSpacing: 2,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  heroTime: {
    fontSize: 72,
    fontFamily: FONT_FAMILY.bold,
    color: TEXT_PRIMARY,
    letterSpacing: 2,
    lineHeight: 80,
  },
  heroGreeting: {
    fontSize: FONT_SIZE.bodySmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
    marginTop: SPACING.base,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  nextAlarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: BG_SECONDARY,
    gap: SPACING.s,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT_PRIMARY,
  },
  nextAlarmText: {
    fontSize: FONT_SIZE.labelSmall,
    color: ACCENT_SUBTLE,
    fontFamily: FONT_FAMILY.medium,
  },
  snoozeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  snoozeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT_PRIMARY,
    marginRight: SPACING.s,
  },
  snoozeText: {
    fontSize: FONT_SIZE.labelSmall,
    color: ACCENT_SUBTLE,
    fontFamily: FONT_FAMILY.medium,
  },

  // ─── List Section ───
  listSection: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.base,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.body,
    color: TEXT_PRIMARY,
    fontFamily: FONT_FAMILY.semiBold,
  },
  countText: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
  },
  addButtonSmall: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: BG_SECONDARY,
  },
  addButtonSmallText: {
    fontSize: FONT_SIZE.labelSmall,
    color: ACCENT_SUBTLE,
    fontFamily: FONT_FAMILY.medium,
  },
  list: {
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING['10xl'],
  },

  // ─── Empty State ───
  empty: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
  },
  emptyCard: {
    borderRadius: RADIUS.base,
    borderWidth: 1,
    borderColor: BG_TERTIARY,
    borderStyle: 'dashed',
    paddingVertical: SPACING['6xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_SECONDARY,
  },
  emptyIcon: {
    fontSize: FONT_SIZE.title3,
    color: ACCENT_PRIMARY,
    fontWeight: '300',
    marginBottom: SPACING.base,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.body,
    color: TEXT_SECONDARY,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: SPACING.xs,
  },
  emptyHint: {
    fontSize: FONT_SIZE.label,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
  },

  // ─── FAB ───
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: ACCENT_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: FONT_SIZE.heading1,
    color: ACCENT_PRIMARY_TEXT,
    fontWeight: '300',
    marginTop: -2,
  },

  // ─── Onboarding ───
  onboardingDesc: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
});
