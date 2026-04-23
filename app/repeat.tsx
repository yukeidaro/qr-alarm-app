/**
 * RepeatScreen — Light grey + orange design
 * Matches design from screens-app.jsx RepeatScreen.
 * Quick presets + day picker + summary banner.
 *
 * Receives initial selection via param `days` (comma-joined indexes).
 * Returns updated selection via repeatSelectionStore.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { setPendingRepeatDays } from '../services/repeatSelectionStore';
import { getDayNames } from '../i18n';
import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';

const C = { ...LIGHT_PALETTE, orangeInk: '#A8341E' };
type RepeatPalette = AppPalette & { orangeInk: string };
const toRepeatPalette = (c: AppPalette): RepeatPalette => ({
  ...c,
  orangeInk: c === LIGHT_PALETTE ? '#A8341E' : '#F4A48F',
});

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// 0=Sun … 6=Sat (matches existing repeatDays)
const DAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRESETS: { key: string; label: string; days: number[] }[] = [
  { key: 'every', label: '毎日', days: [0, 1, 2, 3, 4, 5, 6] },
  { key: 'weekday', label: '平日', days: [1, 2, 3, 4, 5] },
  { key: 'weekend', label: '週末', days: [0, 6] },
  { key: 'none', label: 'なし', days: [] },
];

function BackArrow() {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15" fill="none">
      <Path d="M8 1L2 7.5 8 14" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ListIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M3 6h12M3 9h8M3 12h5" stroke={C.orange} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function parseDaysParam(p?: string): number[] {
  if (!p) return [];
  return p
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const as = [...a].sort();
  const bs = [...b].sort();
  return as.every((v, i) => v === bs[i]);
}

function buildSummary(days: number[]): { label: string; sub: string } {
  if (days.length === 0) return { label: 'なし', sub: '繰り返さない' };
  if (days.length === 7) return { label: '毎日', sub: '週7回' };
  const names = getDayNames(); // ['日','月',...]
  const sorted = [...days].sort();
  if (arraysEqual(sorted, [1, 2, 3, 4, 5])) {
    return { label: '月・火・水・木・金', sub: '週5回 · 平日' };
  }
  if (arraysEqual(sorted, [0, 6])) {
    return { label: '土・日', sub: '週2回 · 週末' };
  }
  return {
    label: sorted.map((d) => names[d]).join('・'),
    sub: `週${sorted.length}回`,
  };
}

export default function RepeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ days?: string }>();
  const baseC = useC();
  const C = useMemo(() => toRepeatPalette(baseC), [baseC]);
  const styles = useMemo(() => makeStyles(C), [C]);
  const initial = useMemo(() => parseDaysParam(params.days), [params.days]);
  const [days, setDays] = useState<number[]>(initial);
  const dayNames = getDayNames();

  // Persist selection on every change so callers receive latest
  useEffect(() => {
    setPendingRepeatDays(days);
  }, [days]);

  const toggleDay = (d: number) => {
    Haptics.selectionAsync();
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  };

  const applyPreset = (presetDays: number[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDays([...presetDays].sort());
  };

  const activePresetKey = useMemo(() => {
    const sorted = [...days].sort();
    const found = PRESETS.find((p) => arraysEqual([...p.days].sort(), sorted));
    return found?.key ?? null;
  }, [days]);

  const summary = buildSummary(days);

  return (
    <View style={styles.root}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} style={styles.navLeft}>
          <BackArrow />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>繰り返し</Text>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick presets */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>クイック設定</Text>
          <View style={styles.presetRow}>
            {PRESETS.map((p) => {
              const isActive = activePresetKey === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.presetBtn,
                    isActive ? styles.presetBtnActive : styles.presetBtnInactive,
                  ]}
                  onPress={() => applyPreset(p.days)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: isActive ? '#FFFFFF' : C.ink2 },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Day picker card */}
        <View style={styles.dayCard}>
          <Text style={styles.sectionLabel}>曜日を選ぶ</Text>
          <View style={styles.dayRow}>
            {dayNames.map((label, i) => {
              const on = days.includes(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.dayCol}
                  onPress={() => toggleDay(i)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      on ? styles.dayCircleOn : styles.dayCircleOff,
                    ]}
                  >
                    <Text style={[styles.dayCircleText, { color: on ? '#FFFFFF' : C.ink3 }]}>
                      {label}
                    </Text>
                  </View>
                  <Text style={[styles.dayEn, { color: on ? C.orange : C.ink4 }]}>
                    {DAY_EN[i]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <ListIcon />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel} numberOfLines={1}>
              {summary.label}
            </Text>
            <Text style={styles.summarySub}>{summary.sub}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = makeStyles(C);
function makeStyles(C: RepeatPalette) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    ...Platform.select({ ios: { paddingTop: 50 }, android: { paddingTop: 28 } }),
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  navRight: { width: 80 },
  backText: { color: C.orange, fontSize: 16, fontFamily: F.semi, marginLeft: 2 },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: F.bold,
    color: C.ink,
    letterSpacing: -0.3,
  },
  content: { paddingTop: 16, paddingBottom: 60 },

  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: F.bold,
    letterSpacing: 0.8,
    color: C.ink3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  presetBtnActive: { backgroundColor: C.ink, borderColor: C.ink },
  presetBtnInactive: { backgroundColor: C.surface, borderColor: C.line },
  presetText: { fontSize: 13, fontFamily: F.semi },

  dayCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6, flex: 1 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dayCircleOn: {
    backgroundColor: C.orange,
    borderColor: C.orange,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  dayCircleOff: { backgroundColor: C.surfaceAlt, borderColor: C.line },
  dayCircleText: { fontSize: 13, fontFamily: F.bold },
  dayEn: { fontSize: 9, fontFamily: F.semi, letterSpacing: 0.5 },

  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: C.orangeDim,
    borderColor: 'rgba(248,90,62,0.15)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: { fontSize: 13, fontFamily: F.bold, color: C.orangeInk },
  summarySub: { fontSize: 11, fontFamily: F.medium, color: C.orange, marginTop: 2 },
});
}
