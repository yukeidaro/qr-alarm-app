/**
 * SnoozeIntervalScreen — Light grey + orange design
 * Matches design from screens-app.jsx SnoozeIntervalScreen.
 * SubShell nav + description + 2x2 grid; ink-black selected card with orange checkmark.
 * Saves to AsyncStorage '@qralarm/snooze_interval' and navigates back on selection.
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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  SNOOZE_INTERVAL_OPTIONS,
  type SnoozeIntervalMinutes,
  loadSnoozeMinutes,
  setSnoozeMinutes,
} from '../services/snoozeIntervalStore';

import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';

const C = LIGHT_PALETTE;

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

function BackArrow() {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15" fill="none">
      <Path d="M8 1L2 7.5 8 14" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckBadge() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={9} fill={C.orange} />
      <Path d="M6 10l3 3 5-6" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SnoozeIntervalScreen() {
  const router = useRouter();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [selected, setSelected] = useState<SnoozeIntervalMinutes>(5);

  useEffect(() => {
    loadSnoozeMinutes().then(setSelected);
  }, []);

  const handleSelect = async (min: SnoozeIntervalMinutes) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(min);
    await setSnoozeMinutes(min);
    router.back();
  };

  return (
    <View style={styles.root}>
      {/* SubShell nav: back + title */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} style={styles.navLeft}>
          <BackArrow />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>スヌーズ間隔</Text>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.helperText}>
          スヌーズボタンを押してから、次にアラームが鳴るまでの時間です。
        </Text>

        <View style={styles.grid}>
          {SNOOZE_INTERVAL_OPTIONS.map((min) => {
            const isSelected = min === selected;
            return (
              <TouchableOpacity
                key={min}
                style={[styles.card, isSelected ? styles.cardSelected : styles.cardUnselected]}
                onPress={() => handleSelect(min)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={[styles.bigNum, { color: isSelected ? C.bg : C.ink }]}>
                    {min}
                  </Text>
                  <Text style={[styles.unit, { color: C.ink3 }]}>
                    分
                  </Text>
                </View>
                {isSelected && <CheckBadge />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = makeStyles(C);
function makeStyles(C: AppPalette) {
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
  helperText: {
    fontSize: 13,
    color: C.ink3,
    lineHeight: 19,
    paddingHorizontal: 24,
    fontFamily: F.regular,
    marginBottom: 16,
  },
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  cardSelected: { backgroundColor: C.ink, borderColor: C.ink },
  cardUnselected: { backgroundColor: C.surface, borderColor: C.line },
  bigNum: {
    fontSize: 28,
    fontFamily: F.bold,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    fontFamily: F.medium,
    marginTop: 2,
  },
});
}
