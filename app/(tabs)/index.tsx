/**
 * HomeScreen — Light Grey + Orange design
 * Faithfully translated from design JSX (screens-app.jsx HomeScreen).
 */
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
  Alarm,
  getAlarms,
  saveAlarm,
  saveAlarms,
  deleteAlarm,
  getRegisteredQR,
  getRegisteredQRs,
  type RegisteredQRKind,
} from '../../services/storageService';
import { scheduleAlarm, cancelAlarm } from '../../services/alarmService';
import ThemePickerSheet from '../../components/ThemePickerSheet';
import SwipeToDelete from '../../components/SwipeToDelete';
import { t, getDayNames } from '../../i18n';
import { SPACING } from '../../constants/spacing';
import { useTheme } from '../../theme';
import { useC, type AppPalette, LIGHT_PALETTE } from '../../constants/palette';
import type { AiAccentKey } from '../../constants/aiOS';

// ─── Color Palette (light palette used for module-level subcomponents/icons) ───
const C = LIGHT_PALETTE;

// ─── Font Families ───
const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Greeting (serif) — design uses Shippori Mincho for the daily greeting line
  greeting: 'ShipporiMincho_600SemiBold',
} as const;

const ONBOARDING_KEY = '@qralarm/onboarding_done';
const NAME_KEY = '@qralarm/user_name';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // legacy fallback (unused after i18n switch)
// Map: JS getDay() indices [0=Sun..6=Sat] → display order [Mon..Sun]
const DAY_INDEX_MAP = [6, 0, 1, 2, 3, 4, 5]; // Sun=6, Mon=0, ...

// ─── Time-aware greeting — FULL pool of ~18 messages from design ───
function getGreeting(name: string | null): string {
  const hour = new Date().getHours();
  const displayName = name || '';

  const pools: Record<string, string[]> = {
    night: [
      `まだ起きてますか、${displayName}さん。寝る前にアラームをセットしましょう。`,
      `深夜ですね、${displayName}さん。ゆっくり休んでください。`,
      `夜更かしですか？しっかり寝てくださいね、${displayName}さん。`,
    ],
    earlyMorning: [
      `おはようございます、${displayName}さん。`,
      `早起きですね、${displayName}さん。いい一日を。`,
      `今日も朝から頑張りますね、${displayName}さん。`,
    ],
    morning: [
      `おはようございます、${displayName}さん。`,
      `朝が過ぎていきますね、${displayName}さん。`,
      `今日も良い一日になりますように、${displayName}さん。`,
    ],
    afternoon: [
      `こんにちは、${displayName}さん。`,
      `午後も頑張りましょう、${displayName}さん。`,
      `お昼はゆっくりできましたか、${displayName}さん。`,
    ],
    evening: [
      `お疲れさまです、${displayName}さん。そろそろ一息つきましょう。`,
      `今日も一日お疲れさまでした、${displayName}さん。`,
      `こんばんは、${displayName}さん。明日のアラームはもう設定しましたか？`,
    ],
    lateNight: [
      `遅くなりましたね、${displayName}さん。アラームをセットして休みましょう。`,
      `そろそろ寝る時間ですよ、${displayName}さん。`,
      `夜遅いですね。しっかり休んでください、${displayName}さん。`,
    ],
  };

  let pool: string[];
  if (hour < 5) pool = pools.night;
  else if (hour < 9) pool = pools.earlyMorning;
  else if (hour < 12) pool = pools.morning;
  else if (hour < 17) pool = pools.afternoon;
  else if (hour < 21) pool = pools.evening;
  else pool = pools.lateNight;

  // If no name set, strip "、さん" patterns
  if (!displayName) {
    return pool[new Date().getMinutes() % pool.length]
      .replace(/、さん/g, '')
      .replace(/さん。/g, '。')
      .replace(/さん？/g, '？');
  }
  return pool[new Date().getMinutes() % pool.length];
}

// 次のアラームまでの時間を計算 — design format: "8時間12分"
function getNextAlarmLabel(alarms: Alarm[]): string | null {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;
  const now = new Date();
  let minDiff = Infinity;
  for (const alarm of enabled) {
    const target = new Date();
    target.setHours(alarm.hour, alarm.minute, 0, 0);
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - now.getTime();
    if (diff < minDiff) minDiff = diff;
  }
  if (minDiff === Infinity) return null;
  const totalMin = Math.round(minDiff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}分`;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

function formatTime12(h: number, m: number): { time: string; period: string } {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return {
    time: `${h12}:${m.toString().padStart(2, '0')}`,
    period,
  };
}

// Smart day-label formatter — mirrors design HomeScreen ("月〜金" / "土 日" / "毎日").
// JS getDay() index: 0=Sun..6=Sat
function getActiveDayLabels(repeatDays: number[]): string {
  if (repeatDays.length === 0) return '';
  const set = new Set(repeatDays);
  const isJa = (getDayNames()[0] || '').length === 1; // ['日','月',...] heuristic
  if (set.size === 7) return isJa ? '毎日' : 'Every day';
  // Weekdays only (Mon..Fri)
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) {
    return isJa ? '月〜金' : 'Mon-Fri';
  }
  // Weekends only (Sat & Sun)
  if (set.size === 2 && set.has(0) && set.has(6)) {
    return isJa ? '土 日' : 'Sat Sun';
  }
  // General case: Mon..Sun ordering, single-space joined
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = getDayNames(); // ['日','月',...] or ['Sun','Mon',...]
  return order.filter((d) => set.has(d)).map((d) => names[d]).join(' ');
}

// ─── Custom SVG Icons (from design) ───

/** Clock icon: 13x13, circle r=5.5 + clock hands */
function ClockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <Circle cx={6.5} cy={6.5} r={5.5} stroke={C.orange} strokeWidth={1.4} />
      <Path
        d="M6.5 4v2.8l1.8 1.2"
        stroke={C.orange}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** QR mini icon: 11x11, three corner squares + bottom-right fill */
function QRIcon({ color = C.orange }: { color?: string }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      <Rect x={0.5} y={0.5} width={3.5} height={3.5} rx={0.8} stroke={color} strokeWidth={1} />
      <Rect x={7} y={0.5} width={3.5} height={3.5} rx={0.8} stroke={color} strokeWidth={1} />
      <Rect x={0.5} y={7} width={3.5} height={3.5} rx={0.8} stroke={color} strokeWidth={1} />
      <Rect x={7.8} y={7.8} width={2} height={2} rx={0.4} fill={color} />
    </Svg>
  );
}

/** 1D barcode mini icon: vertical lines, sized to match QRIcon (11x11). */
function BarcodeIcon({ color = C.orange }: { color?: string }) {
  const lines: Array<[number, number]> = [
    [0.5, 0.7], [1.7, 1.0], [3.2, 0.7], [4.4, 1.4], [6.4, 0.7],
    [7.6, 1.0], [9.1, 0.7], [10.3, 0.7],
  ];
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      {lines.map(([x, w], i) => (
        <Rect key={i} x={x} y={1} width={w} height={9} fill={color} rx={0.2} />
      ))}
    </Svg>
  );
}

/** Trash icon — iOS-style outline trash for swipe-to-delete action. */
function TrashIcon({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13M10 11v7M14 11v7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Plus icon for FAB: 22x22, strokeWidth 2.6 */
function PlusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 3v16M3 11h16"
        stroke="#fff"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Soft fade-in + lift animation for list items (staggered) */
function FadeInUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        friction: 11,
        tension: 36,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const modalStyles = useMemo(() => makeModalStyles(C), [C]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  // Map of registered QR data → kind ('qr' | 'barcode'). Used to display a barcode-style pill on alarm cards.
  const [qrKindMap, setQrKindMap] = useState<Record<string, RegisteredQRKind>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [themePickerAlarm, setThemePickerAlarm] = useState<Alarm | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const fabScale = useRef(new Animated.Value(1)).current;
  // Greeting fade-in
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Greeting animation
    Animated.parallel([
      Animated.timing(greetingOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(greetingTranslateY, {
        toValue: 0,
        friction: 12,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAlarms = useCallback(async () => {
    const loaded = await getAlarms();
    const sorted = loaded.sort(
      (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
    );
    // Refresh QR kind map so alarm cards show the correct icon (QR vs barcode).
    const qrs = await getRegisteredQRs();
    const map: Record<string, RegisteredQRKind> = {};
    qrs.forEach((q) => { map[q.data] = q.kind ?? 'qr'; });
    setQrKindMap(map);

    // Auto-assign the first registered QR to alarms missing qrCodeData.
    // No re-schedule needed: notifications carry only alarmId/soundId; the
    // ringing screen re-reads the latest alarm (and its qrCodeData) from
    // storage when it mounts.
    const defaultQr = qrs[0]?.data ?? null;
    if (defaultQr) {
      const patched = sorted.map((a) =>
        a.qrCodeData == null ? { ...a, qrCodeData: defaultQr } : a,
      );
      const changed = patched.some((a, i) => a.qrCodeData !== sorted[i].qrCodeData);
      if (changed) {
        await saveAlarms(patched);
        setAlarms(patched);
        return;
      }
    }
    setAlarms(sorted);
  }, []);

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
      // Reload user name in case it was just updated in settings
      AsyncStorage.getItem(NAME_KEY).then(setUserName);
    }, [loadAlarms]),
  );

  const handleToggle = async (alarm: Alarm) => {
    try {
      Haptics.impactAsync(
        alarm.enabled
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      );
      const updated = { ...alarm, enabled: !alarm.enabled };
      await saveAlarm(updated);
      if (updated.enabled) await scheduleAlarm(updated);
      else await cancelAlarm(updated.id);
      loadAlarms();
    } catch {
      loadAlarms(); // reload to show actual state
    }
  };

  const handleDelete = async (alarm: Alarm) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteAlarm(alarm.id);
    await cancelAlarm(alarm.id);
    loadAlarms();
  };

  const handlePress = (alarm: Alarm) => {
    Haptics.selectionAsync();
    router.push({ pathname: '/edit', params: { id: alarm.id } });
  };

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.94, useNativeDriver: true, friction: 6,
      }),
      Animated.spring(fabScale, {
        toValue: 1, useNativeDriver: true, friction: 5,
      }),
    ]).start();
    router.push('/edit');
  };

  const handleSelectTheme = async (key: AiAccentKey) => {
    if (!themePickerAlarm) return;
    const updated = { ...(themePickerAlarm as any), theme: key };
    await saveAlarm(updated as any);
    loadAlarms();
  };

  const handleOnboardingRegister = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    router.push({ pathname: '/scan', params: { mode: 'register' } });
  };

  const nextAlarmLabel = getNextAlarmLabel(alarms);

  const renderAlarmCard = ({ item: alarm, index }: { item: Alarm; index: number }) => {
    const { time, period } = formatTime12(alarm.hour, alarm.minute);
    const dayText = getActiveDayLabels(alarm.repeatDays);
    const hasQR = !!(alarm as any).qrCodeData;
    const isBarcode = hasQR && qrKindMap[(alarm as any).qrCodeData] === 'barcode';

    return (
      <FadeInUp delay={index * 70}>
        <SwipeToDelete
          onDelete={() => handleDelete(alarm)}
          renderAction={(dragX) => {
            const opacity = dragX.interpolate({
              inputRange: [-80, -40, 0],
              outputRange: [1, 0.6, 0],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View style={[styles.deleteContent, { opacity }]}>
                <TrashIcon color="#FFFFFF" size={22} />
                <Animated.Text style={styles.deleteText}>{t.edit.delete}</Animated.Text>
              </Animated.View>
            );
          }}
        >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handlePress(alarm)}
          style={[
            styles.alarmCard,
            !alarm.enabled && { opacity: 0.45 },
          ]}
        >
          <View style={styles.cardContent}>
            {/* Left side: time, days, QR badge */}
            <View style={styles.cardLeft}>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{time}</Text>
                <Text style={styles.periodText}>{period}</Text>
              </View>
              {dayText ? (
                <Text style={styles.dayText}>{dayText}</Text>
              ) : (
                <Text style={styles.dayText}>
                  {alarm.repeatDays.length === 0 ? t.edit.oneTime : ''}
                </Text>
              )}
              {hasQR ? (
                <View style={styles.qrBadge}>
                  {isBarcode ? <BarcodeIcon color={C.orange} /> : <QRIcon color={C.orange} />}
                  <Text style={styles.qrBadgeText}>{isBarcode ? 'バーコード' : 'QR'}</Text>
                </View>
              ) : (
                <View style={styles.qrBadgeWarn}>
                  <Text style={styles.qrBadgeWarnText}>{t.home.qrNotSet}</Text>
                </View>
              )}
            </View>

            {/* Right side: custom toggle switch */}
            <View style={styles.cardRight}>
              <TouchableOpacity
                onPress={(e) => {
                  if (e?.stopPropagation) e.stopPropagation();
                  handleToggle(alarm);
                }}
                activeOpacity={0.7}
                hitSlop={12}
              >
                <View
                  style={[
                    styles.toggleTrack,
                    alarm.enabled
                      ? { backgroundColor: C.orange }
                      : { backgroundColor: C.ink4 },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      alarm.enabled
                        ? { transform: [{ translateX: 20 }] }
                        : { transform: [{ translateX: 0 }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </SwipeToDelete>
      </FadeInUp>
    );
  };

  return (
    <View style={styles.container}>
      {/* ─── Greeting Area ─── */}
      <Animated.View
        style={[
          styles.greeting,
          {
            opacity: greetingOpacity,
            transform: [{ translateY: greetingTranslateY }],
          },
        ]}
      >
        <Text style={styles.greetingText}>{getGreeting(userName)}</Text>
        {nextAlarmLabel && (
          <View style={styles.nextAlarmRow}>
            <ClockIcon />
            <Text style={styles.nextAlarmText}>
              次のアラームまで{nextAlarmLabel}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ─── Alarm List ─── */}
      {alarms.length === 0 ? (
        <TouchableOpacity style={styles.empty} onPress={handleAdd} activeOpacity={0.8}>
          <View style={styles.emptyInner}>
            <Text style={styles.emptyPlus}>+</Text>
            <Text style={styles.emptyTitle}>Create your first alarm</Text>
            <Text style={styles.emptyHint}>Tap to start</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarmCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─── FAB: New Alarm ─── */}
      <Animated.View
        style={[styles.fabWrap, { transform: [{ scale: fabScale }] }]}
        pointerEvents="box-none"
      >
        <View style={styles.fabGlowRing}>
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.85}
            style={styles.fab}
          >
            <PlusIcon />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── Onboarding Modal ─── */}
      <Modal
        visible={showOnboarding}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>{t.onboarding.title}</Text>
            <Text style={modalStyles.description}>{t.onboarding.description}</Text>
            <TouchableOpacity
              style={modalStyles.primaryBtn}
              onPress={handleOnboardingRegister}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.primaryBtnText}>{t.onboarding.registerNow}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Theme Picker ─── */}
      <ThemePickerSheet
        visible={!!themePickerAlarm}
        currentTheme={(themePickerAlarm as any)?.theme}
        onSelect={handleSelectTheme}
        onClose={() => setThemePickerAlarm(null)}
      />
    </View>
  );
}

const styles = makeStyles(C);
function makeStyles(C: AppPalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ─── Greeting (centered, with top space for banner ad) ───
  greeting: {
    paddingTop: 110,
    paddingHorizontal: 24,
    paddingBottom: 0,
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: F.greeting,
    fontSize: 22,
    color: C.ink,
    lineHeight: 30,
    letterSpacing: -0.1,
    maxWidth: 320,
    textAlign: 'center',
  },
  nextAlarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  nextAlarmText: {
    fontFamily: F.semiBold,
    fontSize: 13,
    color: C.orange,
  },

  // ─── Alarm Cards (taller, more breathable) ───
  list: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 200,
    gap: 14,
  },
  alarmCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 20,
    paddingVertical: 22,
    minHeight: 156,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    flexShrink: 0,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  timeText: {
    fontFamily: F.bold,
    fontSize: 48,
    color: C.ink,
    letterSpacing: -1.4,
    lineHeight: 54,
  },
  periodText: {
    fontFamily: F.medium,
    fontSize: 14,
    color: C.ink3,
  },
  dayText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: C.ink3,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: `${C.orange}18`,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  qrBadgeText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.orange,
    letterSpacing: 0.2,
  },
  qrBadgeWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: C.warnBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  qrBadgeWarnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.warnInk,
    letterSpacing: 0.2,
  },

  // ─── Toggle Switch (design: 50x30 track, 26px knob) ───
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // ─── Empty State ───
  empty: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emptyInner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    borderStyle: 'dashed',
    paddingVertical: 64,
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  emptyPlus: {
    color: C.orange,
    fontFamily: F.bold,
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: C.ink2,
    fontFamily: F.semiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  emptyHint: {
    color: C.ink3,
    fontFamily: F.regular,
    fontSize: 13,
  },

  // ─── FAB (design: 56x56, glow ring 6px, boxShadow) ───
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlowRing: {
    borderRadius: 999,
    padding: 6,
    backgroundColor: 'rgba(248,90,62,0.08)',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // ─── Delete Action ───
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  deleteHit: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 18,
  },
  deleteText: {
    color: '#FFFFFF',
    fontFamily: F.semiBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },

});
}

// ─── Onboarding Modal ───
const modalStyles = makeModalStyles(C);
function makeModalStyles(C: AppPalette) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 22,
    color: C.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: F.regular,
    fontSize: 15,
    color: C.ink2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: C.orange,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  ghostBtn: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: C.ink,
  },
});
}
