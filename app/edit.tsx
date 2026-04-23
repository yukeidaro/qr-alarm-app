/**
 * Edit Screen — Strict PPTX-canonical layout (slide 02 / アラーム編集).
 *
 *   ┌─────────────────────────┐
 *   │                         │
 *   │   FULLSCREEN WHEEL      │  ← time picker fills upper region
 *   │   ┌─── 10 : 34 ───┐     │
 *   │                         │
 *   ├─────────────────────────┤
 *   │  ♪    ⏰    ⇄    ▦      │  ← horizontal action bar
 *   │ Sound Snooze Repeat コード │     (コード設定 has red dot if QR not set)
 *   ├─────────────────────────┤
 *   │ ⓘ QRコードを設定しないと… │  ← warning banner (only if QR not set)
 *   ├─────────────────────────┤
 *   │ ✕      時刻を選択      ⬤✓ │  ← bottom bar (cancel / label / save)
 *   └─────────────────────────┘
 *
 * Sub-screens are accessed via the action-bar icons:
 *   - Sound        → /sounds
 *   - Snooze       → /snooze-interval
 *   - Repeat       → /repeat
 *   - コード設定   → /qr-manage
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
import {
  getPendingSound,
  clearPendingSound,
} from '../services/soundSelectionStore';
import {
  getPendingRepeatDays,
  clearPendingRepeatDays,
} from '../services/repeatSelectionStore';
import { getPendingQR, clearPendingQR } from '../services/qrSelectionStore';
import DateTimePicker from '@react-native-community/datetimepicker';

/* ── Color Palette ── */
import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';
const C = LIGHT_PALETTE;

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

/* ── Icons ── */
function CloseIcon({ color = C.ink2, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5l14 14M19 5L5 19" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l5 5 9-11" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SoundActionIcon({ color }: { color: string }) {
  // Music note (♪)
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18V6l11-2v12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={6.5} cy={18} r={2.5} stroke={color} strokeWidth={1.8} />
      <Circle cx={17.5} cy={16} r={2.5} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function SnoozeActionIcon({ color }: { color: string }) {
  // Alarm clock
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={1.8} />
      <Path d="M12 9v4l3 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 5l-2 2M19 5l2 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function RepeatActionIcon({ color }: { color: string }) {
  // Two opposed arrows ⇄
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8h13l-3-3M20 16H7l3 3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function QRActionIcon({ color }: { color: string }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <Rect x={14} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <Rect x={3} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <Rect x={14} y={14} width={3} height={3} rx={0.5} fill={color} />
      <Rect x={18} y={14} width={3} height={3} rx={0.5} fill={color} />
      <Rect x={14} y={18} width={3} height={3} rx={0.5} fill={color} />
      <Rect x={18} y={18} width={3} height={3} rx={0.5} fill={color} />
    </Svg>
  );
}

function WarnIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={7} stroke={C.orange} strokeWidth={1.6} />
      <Path d="M8 4.5v4.5M8 11.2v.6" stroke={C.orange} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/* ── Action card (icon + label + value/custom right side) ── */
function ActionCard({
  icon,
  label,
  value,
  rightExtra,
  onPress,
  active = false,
  dot = false,
}: {
  icon: (color: string) => React.ReactNode;
  label: string;
  value?: string;
  rightExtra?: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  dot?: boolean;
}) {
  const iconColor = active ? C.orange : C.ink2;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        <View style={styles.cardIconWrap}>
          {icon(iconColor)}
          {dot && <View style={styles.dot} />}
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <View style={styles.cardRight}>
        {rightExtra ? (
          rightExtra
        ) : (
          <Text
            style={[styles.cardValue, active && { color: C.orange }]}
            numberOfLines={1}
          >
            {value ?? ''}
          </Text>
        )}
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

/* ── Day pills (S M T W T F S) for Repeat card ── */
function DayPills({ days }: { days: number[] }) {
  // Order: Sun, Mon, Tue, Wed, Thu, Fri, Sat (matches storage 0..6)
  const labels = ['日', '月', '火', '水', '木', '金', '土'];
  const set = new Set(days);
  return (
    <View style={styles.pillsRow}>
      {labels.map((l, i) => {
        const on = set.has(i);
        return (
          <View
            key={i}
            style={[styles.pill, on ? styles.pillOn : styles.pillOff]}
          >
            <Text style={[styles.pillText, on ? styles.pillTextOn : styles.pillTextOff]}>
              {l}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/* ── Main Screen ── */
export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [alarm, setAlarm] = useState<Alarm>(createAlarm());
  const [hasGlobalQR, setHasGlobalQR] = useState(false);
  const [qrName, setQrName] = useState<string>('');
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (id) {
      getAlarms().then((alarms) => {
        const found = alarms.find((a) => a.id === id);
        if (found) setAlarm(found);
      });
    }
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

      const finalize = (resolved: Alarm) => {
        // Resolve QR name from current alarm.qrCodeData (or first registered as fallback)
        getRegisteredQRs().then((qrs: RegisteredQR[]) => {
          if (resolved.qrCodeData) {
            const matched = qrs.find((q) => q.data === resolved.qrCodeData);
            setQrName(matched ? matched.name : '');
          } else if (qrs.length > 0) {
            // No explicit selection — show empty so user knows to pick
            setQrName('');
          } else {
            setQrName('');
          }
        });
      };

      if (id) {
        getAlarms().then((alarms) => {
          const found = alarms.find((a) => a.id === id);
          const resolved = found ? applyPending(found) : applyPending(alarm);
          setAlarm(resolved);
          finalize(resolved);
          if (pendingSound) clearPendingSound();
          if (pendingDays) clearPendingRepeatDays();
          if (pendingQR) clearPendingQR();
        });
      } else {
        setAlarm((prev) => {
          const next = applyPending(prev);
          finalize(next);
          return next;
        });
        if (pendingSound) clearPendingSound();
        if (pendingDays) clearPendingRepeatDays();
        if (pendingQR) clearPendingQR();
      }
    }, [id]),
  );

  /* ── Display helpers for action sub-labels ── */
  const soundLabel = (() => {
    if (alarm.soundId.startsWith('custom_')) {
      const s = customSounds.find((c) => c.id === alarm.soundId);
      return s ? s.name : 'カスタム';
    }
    return getSoundLabel(alarm.soundId);
  })();

  const qrLabel = qrName || '未設定';

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

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      {/* ── Apple-style native time spinner (fills available space) ── */}
      <View style={styles.pickerArea}>
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
          themeVariant="light"
          textColor={C.ink}
          style={styles.spinner}
          onChange={(_e, date) => {
            if (!date) return;
            setAlarm((p) => ({ ...p, hour: date.getHours(), minute: date.getMinutes() }));
          }}
        />
      </View>

      {/* ── Action List (rich rows) ── */}
      <View style={styles.actionList}>
        <ActionCard
          icon={(c) => <RepeatActionIcon color={c} />}
          label="繰り返し"
          rightExtra={<DayPills days={alarm.repeatDays} />}
          onPress={() =>
            router.push({ pathname: '/repeat', params: { days: alarm.repeatDays.join(',') } })
          }
        />
        <ActionCard
          icon={(c) => <SoundActionIcon color={c} />}
          label="サウンド"
          value={soundLabel}
          onPress={() =>
            router.push({ pathname: '/sounds', params: { currentSoundId: alarm.soundId } })
          }
        />
        <ActionCard
          icon={(c) => <SnoozeActionIcon color={c} />}
          label="スヌーズ"
          value={alarm.snoozeEnabled ? 'オン' : 'オフ'}
          onPress={() => router.push('/snooze-interval')}
        />
        <ActionCard
          icon={(c) => <QRActionIcon color={c} />}
          label="コード設定"
          value={qrLabel}
          active={hasGlobalQR}
          dot={!hasGlobalQR}
          onPress={() => router.push({ pathname: '/qr-manage', params: { mode: 'select' } })}
        />
      </View>

      {/* ── Warning Banner (when QR not set) ── */}
      {!hasGlobalQR && (
        <View style={styles.warning}>
          <WarnIcon />
          <Text style={styles.warningText}>
            QRコードを設定しないとアラームは機能しません
          </Text>
        </View>
      )}

      {/* ── Bottom Bar (cancel left; large orange save FAB centered) ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.bottomClose}
          activeOpacity={0.6}
        >
          <CloseIcon />
        </TouchableOpacity>

        <View style={styles.bottomCenter}>
          <View style={styles.fabGlowRing}>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.checkBtn}
              activeOpacity={0.85}
            >
              <CheckIcon size={26} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/* ── Styles ── */
const styles = makeStyles(C);
function makeStyles(C: AppPalette) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    ...Platform.select({ ios: { paddingTop: 50 }, android: { paddingTop: 28 } }),
  },

  /* Native spinner picker area — fixed-ish height so cards have room */
  pickerArea: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  spinner: {
    width: '100%',
    height: 240,
  },

  /* Action List (rich row cards) */
  actionList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: C.bg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.lineSoft,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    marginLeft: 12,
  },
  cardIconWrap: {
    position: 'relative',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 15,
    color: C.ink,
    fontFamily: F.semi,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 14,
    color: C.ink2,
    fontFamily: F.medium,
    fontWeight: '500',
    maxWidth: 180,
    textAlign: 'right',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
    borderWidth: 1.5,
    borderColor: C.surface,
  },

  /* Day pills inside Repeat card */
  pillsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  pill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOn: {
    backgroundColor: C.orange,
  },
  pillOff: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.line,
  },
  pillText: {
    fontSize: 10,
    fontFamily: F.bold,
    fontWeight: '700',
  },
  pillTextOn: {
    color: '#FFFFFF',
  },
  pillTextOff: {
    color: C.ink3,
  },

  /* Warning Banner */
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.warnBg,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: C.warnInk,
    fontFamily: F.semi,
    fontWeight: '600',
    lineHeight: 17,
  },

  /* Bottom Bar */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 52 : 40,
    backgroundColor: C.bg,
  },
  bottomClose: {
    position: 'absolute',
    left: 16,
    bottom: Platform.OS === 'ios' ? 52 : 40,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlowRing: {
    borderRadius: 999,
    padding: 6,
    backgroundColor: 'rgba(248,90,62,0.08)',
  },
  checkBtn: {
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
});
}
