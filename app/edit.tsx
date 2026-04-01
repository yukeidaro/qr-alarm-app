import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import {
  Alarm,
  getAlarms,
  saveAlarm,
  deleteAlarm,
  createAlarm,
  getRegisteredQR,
  getRingingBackground,
  saveRingingBackground,
  clearRingingBackground,
} from '../services/storageService';
import { scheduleAlarm, cancelAlarm } from '../services/alarmService';
import { getSoundLabel } from '../services/audioService';
import { getPendingSound, clearPendingSound } from '../services/soundSelectionStore';
import Button from '../components/Button';
import {
  BG_PRIMARY, BG_SECONDARY, BG_TERTIARY,
  ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT, TEXT_PRIMARY,
  TEXT_MUTED, ERROR, OVERLAY, ACCENT_SUBTLE,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ACTIVE_OPACITY, ANIMATION } from '../constants/spacing';
import { t, getDayNames } from '../i18n';

const DAYS = getDayNames();

function useToast() {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setMessage(text);
      setVisible(true);
      translateY.setValue(100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: ANIMATION.duration.normal, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: ANIMATION.duration.normal, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: ANIMATION.duration.slow, useNativeDriver: true }).start(() => {
            setVisible(false);
            resolve();
          });
        }, ANIMATION.duration.display);
      });
    });
  };

  const ToastView = visible ? (
    <Animated.View style={[toastStyles.container, { transform: [{ translateY }], opacity }]} pointerEvents="none">
      <View style={toastStyles.accentDot} />
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  ) : null;

  return { show, ToastView };
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT_PRIMARY,
  },
  text: {
    fontSize: FONT_SIZE.bodySmall,
    color: TEXT_PRIMARY,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
});

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id;

  const [alarm, setAlarm] = useState<Alarm>(createAlarm());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [hasGlobalQR, setHasGlobalQR] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const { show: showToast, ToastView } = useToast();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
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
    getRingingBackground().then(setBgUri);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      getRegisteredQR().then((qr) => setHasGlobalQR(!!qr));
      if (id) {
        getAlarms().then((alarms) => {
          const found = alarms.find((a) => a.id === id);
          if (found) setAlarm(found);
        });
      }
      // Check for sound selection from sounds screen
      const pending = getPendingSound();
      if (pending) {
        setAlarm((prev) => ({ ...prev, soundId: pending }));
        clearPendingSound();
      }
    }, [id])
  );

  const handlePickBackground = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 19],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await saveRingingBackground(result.assets[0].uri);
      setBgUri(result.assets[0].uri);
    }
  };

  const handleClearBackground = async () => {
    await clearRingingBackground();
    setBgUri(null);
  };

  const handleSave = async () => {
    await saveAlarm(alarm);
    if (alarm.enabled) await scheduleAlarm(alarm);
    else await cancelAlarm(alarm.id);
    const msgs = t.toast.saved;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    await showToast(msg);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(t.edit.deleteAlarmTitle, t.edit.deleteAlarmMessage, [
      { text: t.edit.cancel, style: 'cancel' },
      {
        text: t.edit.delete,
        style: 'destructive',
        onPress: async () => {
          await cancelAlarm(alarm.id);
          await deleteAlarm(alarm.id);
          await showToast(t.toast.deleted);
          router.back();
        },
      },
    ]);
  };

  const toggleDay = (day: number) => {
    setAlarm((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day].sort(),
    }));
  };

  const handleTimeChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) setAlarm((prev) => ({ ...prev, hour: date.getHours(), minute: date.getMinutes() }));
  };

  const timeDate = new Date();
  timeDate.setHours(alarm.hour, alarm.minute, 0, 0);

  return (
    <View style={{ flex: 1, backgroundColor: BG_PRIMARY }}>
      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={ACTIVE_OPACITY.default} style={styles.backButton}>
            <Text style={styles.backText}>{t.edit.back}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isNew ? t.edit.newAlarm : t.edit.editAlarm}</Text>
          <View style={{ width: 56 }} />
        </View>

        {/* Time Picker */}
        <View style={styles.timeSection}>
          {Platform.OS === 'android' && !showPicker && (
            <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={ACTIVE_OPACITY.default}>
              <Text style={styles.timeDisplay}>
                {alarm.hour.toString().padStart(2, '0')}:{alarm.minute.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          )}
          {showPicker && (
            <DateTimePicker
              value={timeDate}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              textColor={TEXT_PRIMARY}
              themeVariant="light"
            />
          )}
        </View>

        {/* Settings Card */}
        <View style={styles.settingsCard}>
          {/* Repeat */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.edit.repeat}</Text>
            <View style={styles.daysRow}>
              {DAYS.map((label, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayButton, alarm.repeatDays.includes(i) && styles.dayActive]}
                  onPress={() => toggleDay(i)}
                  activeOpacity={ACTIVE_OPACITY.default}
                >
                  <Text style={[styles.dayText, alarm.repeatDays.includes(i) && styles.dayTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Sound */}
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push({ pathname: '/sounds', params: { currentSoundId: alarm.soundId } })} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.settingLabel}>{t.edit.sound}</Text>
            <View style={styles.settingValueRow}>
              <Text style={styles.settingValue}>{getSoundLabel(alarm.soundId)}</Text>
              <Text style={styles.chevron}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* QR status */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t.edit.qrBarcode}</Text>
            <View style={[styles.statusChip, hasGlobalQR && styles.statusChipActive]}>
              <Text style={[styles.statusChipText, hasGlobalQR && styles.statusChipTextActive]}>
                {hasGlobalQR ? t.edit.qrRegistered : t.edit.qrNotRegistered}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Background */}
          <TouchableOpacity style={styles.settingRow} onPress={handlePickBackground} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.settingLabel}>{t.edit.ringingBackground}</Text>
            <View style={styles.settingValueRow}>
              <Text style={[styles.settingValue, bgUri && styles.settingValueAccent]}>
                {bgUri ? t.edit.bgSet : t.edit.bgDefault}
              </Text>
            </View>
          </TouchableOpacity>
          {bgUri && (
            <TouchableOpacity style={styles.bgClearButton} onPress={handleClearBackground} activeOpacity={ACTIVE_OPACITY.default}>
              <Text style={styles.bgClearText}>{t.edit.bgReset}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Snooze toggle */}
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>{t.edit.snooze}</Text>
              {!(alarm.snoozeEnabled ?? true) && (
                <Text style={styles.settingHint}>{t.edit.snoozeOffHint}</Text>
              )}
            </View>
            <Switch
              value={alarm.snoozeEnabled ?? true}
              onValueChange={(val) => setAlarm((prev) => ({ ...prev, snoozeEnabled: val }))}
              trackColor={{ false: BG_TERTIARY, true: ACCENT_PRIMARY }}
              thumbColor={BG_SECONDARY}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button title={t.edit.save} onPress={handleSave} fullWidth />
          {!isNew && (
            <Button title={t.edit.delete} onPress={handleDelete} variant="ghost" fullWidth
              textStyle={{ color: ERROR }}
              style={{ marginTop: SPACING.sm }}
            />
          )}
        </View>
      </Animated.ScrollView>
      {ToastView}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_PRIMARY },
  content: { paddingTop: SPACING['7xl'], paddingHorizontal: SCREEN_PADDING.horizontal, paddingBottom: SCREEN_PADDING.bottom },

  // ─── Header ───
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  backButton: { paddingVertical: SPACING.xs, paddingRight: SPACING.lg },
  backText: { fontSize: FONT_SIZE.bodySmall, color: ACCENT_SUBTLE, fontFamily: FONT_FAMILY.medium },
  headerTitle: { fontSize: FONT_SIZE.body, color: TEXT_PRIMARY, fontFamily: FONT_FAMILY.semiBold },

  // ─── Time ───
  timeSection: { alignItems: 'center', marginBottom: SPACING['4xl'], paddingVertical: SPACING.xl },
  timeDisplay: { fontSize: FONT_SIZE.hero, fontFamily: FONT_FAMILY.bold, color: TEXT_PRIMARY, letterSpacing: 4 },

  // ─── Settings Card ───
  settingsCard: { backgroundColor: BG_SECONDARY, borderRadius: RADIUS.base, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xs, marginBottom: SPACING.xxl },
  section: { paddingVertical: SPACING.lg },
  sectionLabel: { fontSize: FONT_SIZE.labelSmall, color: TEXT_MUTED, letterSpacing: 1, fontFamily: FONT_FAMILY.medium, textTransform: 'uppercase', marginBottom: SPACING.base },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: BG_TERTIARY },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayButton: { width: SIZE.dayButton, height: SIZE.dayButton, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: BG_TERTIARY },
  dayActive: { backgroundColor: ACCENT_PRIMARY },
  dayText: { fontSize: FONT_SIZE.label, color: TEXT_MUTED, fontFamily: FONT_FAMILY.medium },
  dayTextActive: { color: ACCENT_PRIMARY_TEXT, fontFamily: FONT_FAMILY.semiBold },

  // ─── Setting Rows ───
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
  settingLabel: { fontSize: FONT_SIZE.bodySmall, color: TEXT_PRIMARY, fontFamily: FONT_FAMILY.regular },
  settingValueRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  settingValue: { fontSize: FONT_SIZE.bodySmall, color: TEXT_MUTED, fontFamily: FONT_FAMILY.regular },
  settingValueAccent: { color: ACCENT_SUBTLE },
  chevron: { fontSize: FONT_SIZE.label, color: TEXT_MUTED, fontFamily: FONT_FAMILY.regular, opacity: 0.5 } as const,
  statusChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xxs, borderRadius: RADIUS.full, backgroundColor: BG_TERTIARY },
  statusChipActive: { backgroundColor: OVERLAY.accent10 },
  statusChipText: { fontSize: FONT_SIZE.labelSmall, color: TEXT_MUTED, fontFamily: FONT_FAMILY.regular },
  statusChipTextActive: { color: ACCENT_SUBTLE },
  bgClearButton: { paddingBottom: SPACING.sm },
  bgClearText: { fontSize: FONT_SIZE.label, color: ERROR, fontFamily: FONT_FAMILY.regular },
  settingHint: { fontSize: FONT_SIZE.labelSmall, color: TEXT_MUTED, fontFamily: FONT_FAMILY.regular, marginTop: SPACING.xxs },

  // ─── Actions ───
  actionsSection: { marginTop: SPACING.xl },
});
