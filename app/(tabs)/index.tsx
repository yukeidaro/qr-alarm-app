import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
} from '../../services/storageService';
import { scheduleAlarm, cancelAlarm } from '../../services/alarmService';
import AlarmCard from '../../components/AlarmCard';
import Button from '../../components/Button';
import AppModal from '../../components/AppModal';
import HandwrittenText from '../../components/HandwrittenText';
import { Heading, Caption, Label } from '../../components/Typography';
import { useTheme } from '../../theme';
import { ThemeColors } from '../../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../constants/typography';
import { SPACING, RADIUS, ACTIVE_OPACITY, ANIMATION } from '../../constants/spacing';
import { t, getDayNames, formatDate, formatNextAlarm, formatSnoozeBanner } from '../../i18n';

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

    if (alarm.repeatDays.length > 0) {
      const today = now.getDay();
      if (diff > 0 && alarm.repeatDays.includes(today)) {
        // Today, still ahead
      } else {
        // Find next repeat day
        let daysAhead = 0;
        for (let d = 0; d <= 7; d++) {
          const checkDay = (today + (diff <= 0 ? d + 1 : d)) % 7;
          if (d === 0 && diff > 0) {
            if (alarm.repeatDays.includes(today)) { daysAhead = 0; break; }
          }
          if (alarm.repeatDays.includes(checkDay)) {
            daysAhead = diff <= 0 ? d + 1 : d;
            break;
          }
        }
        diff = daysAhead * 24 * 60 + alarmMinutes - nowMinutes;
      }
    } else {
      if (diff <= 0) diff += 24 * 60;
    }

    if (diff < minDiff) minDiff = diff;
  }

  if (minDiff === Infinity || minDiff <= 0) return null;
  const hours = Math.floor(minDiff / 60);
  const minutes = minDiff % 60;
  return formatNextAlarm(hours, minutes);
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

  // Greeting animation state (Item 19)
  const [greetingPhase, setGreetingPhase] = useState<'typing' | 'shrinking' | 'done'>('typing');
  const greetingScale = useRef(new Animated.Value(1)).current;
  const greetingTranslateY = useRef(new Animated.Value(0)).current;
  const timeOpacity = useRef(new Animated.Value(0)).current;
  const hasPlayedGreeting = useRef(false);

  useEffect(() => {
    Animated.timing(heroFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // If greeting already played this session, skip to done phase
  useEffect(() => {
    if (hasPlayedGreeting.current) {
      setGreetingPhase('done');
      greetingScale.setValue(0.55);
      greetingTranslateY.setValue(-50);
      timeOpacity.setValue(1);
    }
  }, []);

  const handleTypingComplete = useCallback(() => {
    if (hasPlayedGreeting.current) return;
    hasPlayedGreeting.current = true;
    setTimeout(() => {
      setGreetingPhase('shrinking');
      Animated.parallel([
        Animated.spring(greetingScale, { toValue: 0.55, useNativeDriver: true, friction: 8 }),
        Animated.timing(greetingTranslateY, { toValue: -50, duration: 600, useNativeDriver: true }),
        Animated.timing(timeOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
      ]).start(() => setGreetingPhase('done'));
    }, 500);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      // Also refresh the next-alarm countdown text
      setNextAlarmText(getNextAlarmText(alarms));
    };
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [alarms]);

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
    router.push('/qr-manage');
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

        {/* Time — hidden during typing phase, fades in after shrink */}
        <Animated.Text style={[styles.heroTime, { opacity: greetingPhase === 'typing' ? timeOpacity : 1 }]}>
          {currentTime}
        </Animated.Text>

        {greeting ? (
          <Animated.View
            style={[
              greetingPhase === 'typing' ? styles.greetingTypingContainer : undefined,
              {
                transform: [
                  { scale: greetingScale },
                  { translateY: greetingTranslateY },
                ],
              },
            ]}
          >
            <HandwrittenText
              text={greeting}
              style={greetingPhase === 'done' ? styles.heroGreeting : styles.greetingTyping}
              speed={60}
              delay={400}
              onComplete={handleTypingComplete}
            />
          </Animated.View>
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
  },

  // ─── Top Bar ───
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: SPACING['7xl'],
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xs,
  },
  qrButton: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.full,
    backgroundColor: c.bgSecondary,
  },
  qrButtonRegistered: {
    backgroundColor: c.overlay.accent10,
  },
  qrButtonText: {
    fontSize: FONT_SIZE.labelSmall,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.medium,
  },
  qrButtonTextActive: {
    color: c.accentSubtle,
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
    color: c.textMuted,
    letterSpacing: 2,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  heroTime: {
    fontSize: 72,
    fontFamily: FONT_FAMILY.bold,
    color: c.textPrimary,
    letterSpacing: 2,
    lineHeight: 80,
  },
  heroGreeting: {
    fontSize: FONT_SIZE.bodySmall,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.regular,
    marginTop: SPACING.base,
  },
  greetingTypingContainer: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
  },
  greetingTyping: {
    fontSize: 36,
    color: c.textPrimary,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
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
    backgroundColor: c.bgSecondary,
    gap: SPACING.s,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.accent,
  },
  nextAlarmText: {
    fontSize: FONT_SIZE.labelSmall,
    color: c.accentSubtle,
    fontFamily: FONT_FAMILY.medium,
  },
  snoozeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgSecondary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  snoozeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.accent,
    marginRight: SPACING.s,
  },
  snoozeText: {
    fontSize: FONT_SIZE.labelSmall,
    color: c.accentSubtle,
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
    color: c.textPrimary,
    fontFamily: FONT_FAMILY.semiBold,
  },
  countText: {
    fontSize: FONT_SIZE.labelSmall,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.regular,
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
    borderColor: c.bgTertiary,
    borderStyle: 'dashed',
    paddingVertical: SPACING['6xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.bgSecondary,
  },
  emptyIcon: {
    fontSize: FONT_SIZE.title3,
    color: c.accent,
    fontWeight: '300',
    marginBottom: SPACING.base,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.body,
    color: c.textSecondary,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: SPACING.xs,
  },
  emptyHint: {
    fontSize: FONT_SIZE.label,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.regular,
  },

  // ─── FAB ───
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: FONT_SIZE.heading1,
    color: c.accentText,
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
