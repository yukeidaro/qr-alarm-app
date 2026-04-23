import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Alarm,
  getAlarms,
  saveAlarm,
  createAlarm,
  getRegisteredQR,
  getRegisteredQRs,
  RegisteredQR,
  getCustomSounds,
  CustomSound,
} from '../services/storageService';
import { getSoundLabel } from '../services/audioService';
import { scheduleAlarm } from '../services/alarmService';
import { getPendingSound, clearPendingSound } from '../services/soundSelectionStore';
import { getPendingRepeatDays, clearPendingRepeatDays } from '../services/repeatSelectionStore';
import { getPendingQR, clearPendingQR } from '../services/qrSelectionStore';
import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';

const C = LIGHT_PALETTE;
const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

function BackArrow({ color = C.orange }: { color?: string }) {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15" fill="none">
      <Path d="M8 1L2 7.5 8 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Chevron({ color }: { color: string }) {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SoundIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M3 8l2 6 2.5-3.5L10 14l2-6" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 3h12" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function SnoozeIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={5.5} stroke={color} strokeWidth={1.5} />
      <Path d="M8 5v3l2 1.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function RepeatIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M3 5h10M3 8h6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={12} cy={11} r={2.5} stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}

function QRIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Rect x={1} y={1} width={4} height={4} rx={1} stroke={color} strokeWidth={1.2} />
      <Rect x={11} y={1} width={4} height={4} rx={1} stroke={color} strokeWidth={1.2} />
      <Rect x={1} y={11} width={4} height={4} rx={1} stroke={color} strokeWidth={1.2} />
      <Rect x={12.5} y={12.5} width={2} height={2} rx={0.4} fill={color} />
    </Svg>
  );
}

function getRepeatLabel(days: number[]): string {
  if (days.length === 0) return 'なし';
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return '毎日';
  const same = (arr: number[]) => arr.length === sorted.length && arr.every((d, i) => sorted[i] === d);
  if (same([1, 2, 3, 4, 5])) return '平日';
  if (same([0, 6])) return '週末';
  const jp = ['日', '月', '火', '水', '木', '金', '土'];
  return sorted.map((d) => jp[d]).join('・');
}

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [alarm, setAlarm] = useState<Alarm>(createAlarm());
  const [hasGlobalQR, setHasGlobalQR] = useState(false);
  const [qrName, setQrName] = useState<string>('');
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);

  useEffect(() => {
    if (!id) return;
    getAlarms().then((alarms) => {
      const found = alarms.find((a) => a.id === id);
      if (found) setAlarm(found);
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      getRegisteredQR().then((qr) => setHasGlobalQR(!!qr));
      getCustomSounds().then(setCustomSounds);

      const pendingSound = getPendingSound();
      const pendingDays = getPendingRepeatDays();
      const pendingQR = getPendingQR();

      const applyPending = (base: Alarm): Alarm => {
        let next = base;
        if (pendingSound) next = { ...next, soundId: pendingSound };
        if (pendingDays) next = { ...next, repeatDays: pendingDays };
        if (pendingQR) next = { ...next, qrCodeData: pendingQR.data };
        return next;
      };

      const syncQrName = (resolved: Alarm) => {
        getRegisteredQRs().then((qrs: RegisteredQR[]) => {
          if (!resolved.qrCodeData) {
            setQrName('');
            return;
          }
          const matched = qrs.find((q) => q.data === resolved.qrCodeData);
          setQrName(matched ? matched.name : '');
        });
      };

      if (id) {
        getAlarms().then((alarms) => {
          const found = alarms.find((a) => a.id === id);
          const resolved = applyPending(found ?? createAlarm());
          setAlarm(resolved);
          syncQrName(resolved);
        });
      } else {
        setAlarm((prev) => {
          const next = applyPending(prev);
          syncQrName(next);
          return next;
        });
      }

      if (pendingSound) clearPendingSound();
      if (pendingDays) clearPendingRepeatDays();
      if (pendingQR) clearPendingQR();
    }, [id]),
  );

  const soundLabel = (() => {
    if (alarm.soundId.startsWith('custom_')) {
      const s = customSounds.find((c) => c.id === alarm.soundId);
      return s ? s.name : 'カスタム';
    }
    return getSoundLabel(alarm.soundId);
  })();

  const handleSave = async () => {
    try {
      const updated = { ...alarm, enabled: true };
      await saveAlarm(updated);
      await scheduleAlarm(updated);
      router.back();
    } catch {
      Alert.alert('エラー', 'アラームの保存に失敗しました。もう一度お試しください。');
    }
  };

  const renderOptionRow = (
    icon: ReactElement,
    label: string,
    value: string,
    onPress: () => void,
    isLast = false,
  ) => (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      <Chevron color={C.ink4} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.navSide}>
          <BackArrow color={C.orange} />
          <Text style={styles.navSideText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{id ? 'アラームを編集' : 'アラームを追加'}</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={[styles.navSide, styles.navRight]}>
          <Text style={styles.navSave}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerWrap}>
        <DateTimePicker
          value={(() => {
            const d = new Date();
            d.setHours(alarm.hour, alarm.minute, 0, 0);
            return d;
          })()}
          mode="time"
          display="spinner"
          is24Hour
          locale="ja-JP"
          themeVariant={C.bg === '#F4F4F5' ? 'light' : 'dark'}
          textColor={C.ink}
          style={styles.spinner}
          onChange={(_e, date) => {
            if (!date) return;
            setAlarm((p) => ({ ...p, hour: date.getHours(), minute: date.getMinutes() }));
          }}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          {renderOptionRow(
            <RepeatIcon color={C.orange} />,
            '繰り返し',
            getRepeatLabel(alarm.repeatDays),
            () => router.push({ pathname: '/repeat', params: { days: alarm.repeatDays.join(',') } }),
          )}
          {renderOptionRow(
            <SoundIcon color={C.orange} />,
            'サウンド',
            soundLabel,
            () => router.push({ pathname: '/sounds', params: { currentSoundId: alarm.soundId } }),
          )}
          {renderOptionRow(
            <SnoozeIcon color={C.orange} />,
            'スヌーズ',
            alarm.snoozeEnabled ? 'オン' : 'オフ',
            () => router.push('/snooze-interval'),
          )}
          {renderOptionRow(
            <QRIcon color={C.orange} />,
            'コード設定',
            qrName || '未設定',
            () => router.push({ pathname: '/qr-manage', params: { mode: 'select' } }),
            true,
          )}
        </View>

        {!hasGlobalQR && (
          <View style={styles.warning}>
            <Text style={styles.warningTitle}>QRコード未設定</Text>
            <Text style={styles.warningText}>コード設定を選んで解除用QR/Barcodeを設定してください。</Text>
          </View>
        )}
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
      paddingBottom: 6,
    },
    navSide: {
      width: 96,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    navRight: {
      justifyContent: 'flex-end',
    },
    navSideText: {
      color: C.orange,
      fontSize: 16,
      fontFamily: F.semi,
    },
    navSave: {
      color: C.orange,
      fontSize: 16,
      fontFamily: F.bold,
    },
    navTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      color: C.ink,
      letterSpacing: -0.3,
      fontFamily: F.bold,
    },
    pickerWrap: {
      height: 240,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: C.line,
      paddingHorizontal: 12,
    },
    spinner: {
      width: '100%',
      height: 240,
    },
    content: {
      flex: 1,
    },
    contentInner: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 28,
    },
    sectionCard: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.line,
      borderRadius: 18,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: C.lineSoft,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: C.orangeDim,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      color: C.ink,
      letterSpacing: -0.2,
      fontFamily: F.medium,
    },
    rowValue: {
      maxWidth: 140,
      textAlign: 'right',
      fontSize: 14,
      color: C.ink3,
      fontFamily: F.medium,
      marginRight: 2,
    },
    warning: {
      marginTop: 14,
      backgroundColor: C.warnBg,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    warningTitle: {
      color: C.warnInk,
      fontSize: 12,
      fontFamily: F.bold,
      marginBottom: 4,
      letterSpacing: 0.1,
    },
    warningText: {
      color: C.warnInk,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: F.medium,
    },
  });
}

