/**
 * SoundOutputScreen — Light grey + orange design
 * SubShell + radio cards. Replaces the old useTheme/Ionicons version.
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';
import { configureAudio } from '../services/audioService';

const SOUND_OUTPUT_KEY = '@qralarm/sound_output';
type Mode = 'device' | 'bluetooth' | 'auto';

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

function RadioDot() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={10} stroke={C.orange} strokeWidth={1.5} />
      <Circle cx={11} cy={11} r={6} fill={C.orange} />
    </Svg>
  );
}

function RadioRing() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={10} stroke={C.line} strokeWidth={1.5} />
    </Svg>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Rect x={5} y={2} width={10} height={16} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M9 15h2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function BluetoothIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 5l6 5-6 5V5l6 5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function AutoIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3 10a7 7 0 0114 0M17 10l-2-2M17 10l2-2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M17 10a7 7 0 01-14 0"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const OPTIONS: {
  key: Mode;
  label: string;
  desc: string;
  icon: (color: string) => React.ReactNode;
}[] = [
  {
    key: 'device',
    label: 'このiPhone',
    desc: '本体スピーカーから再生します。',
    icon: (c) => <PhoneIcon color={c} />,
  },
  {
    key: 'bluetooth',
    label: 'Bluetooth',
    desc: 'Bluetoothデバイスに接続中の場合、そちらから再生します。',
    icon: (c) => <BluetoothIcon color={c} />,
  },
  {
    key: 'auto',
    label: '自動',
    desc: '接続中のデバイスを優先し、なければ本体から再生します。',
    icon: (c) => <AutoIcon color={c} />,
  },
];

export default function SoundOutputScreen() {
  const router = useRouter();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [selected, setSelected] = useState<Mode>('device');

  useEffect(() => {
    AsyncStorage.getItem(SOUND_OUTPUT_KEY).then((v) => {
      if (v === 'device' || v === 'bluetooth' || v === 'auto') setSelected(v);
    });
  }, []);

  const handleSelect = async (mode: Mode) => {
    setSelected(mode);
    await AsyncStorage.setItem(SOUND_OUTPUT_KEY, mode);
    // Re-apply the iOS audio session category immediately so the choice
    // takes effect without needing to restart the app.
    try {
      await configureAudio(mode);
    } catch {
      // Non-fatal — will be re-applied on next playAlarm/previewSound.
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} style={styles.navLeft}>
          <BackArrow />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>サウンド出力</Text>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.helperText}>
          アラーム音を再生するデバイスを選択します。
        </Text>

        <View style={styles.card}>
          {OPTIONS.map((opt, idx) => {
            const isSelected = opt.key === selected;
            const iconColor = isSelected ? C.orange : C.ink2;
            return (
              <View key={opt.key}>
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(opt.key)}
                >
                  <View style={[styles.iconBox, isSelected && { backgroundColor: C.orangeDim }]}>
                    {opt.icon(iconColor)}
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.label}>{opt.label}</Text>
                    <Text style={styles.desc}>{opt.desc}</Text>
                  </View>
                  {isSelected ? <RadioDot /> : <RadioRing />}
                </TouchableOpacity>
                {idx < OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
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
  card: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  label: {
    fontSize: 15,
    fontFamily: F.semi,
    color: C.ink,
    letterSpacing: -0.2,
  },
  desc: {
    fontSize: 12,
    fontFamily: F.regular,
    color: C.ink3,
    marginTop: 2,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: C.lineSoft,
    marginLeft: 62,
  },
});
}
