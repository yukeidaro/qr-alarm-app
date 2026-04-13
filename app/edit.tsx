import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import Slider from '@react-native-community/slider';
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
import { useTheme } from '../theme';
import { ThemeColors } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ACTIVE_OPACITY, ANIMATION } from '../constants/spacing';
import { t, getDayNames } from '../i18n';

const DAYS = getDayNames();

function useToast(colors: ThemeColors) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const toastStyles = useMemo(() => makeToastStyles(colors), [colors]);

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

const makeToastStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgSecondary,
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
    backgroundColor: c.accent,
  },
  text: {
    fontSize: FONT_SIZE.bodySmall,
    color: c.textPrimary,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
});

export default function EditScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id;

  const [alarm, setAlarm] = useState<Alarm>(createAlarm());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [hasGlobalQR, setHasGlobalQR] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const { show: showToast, ToastView } = useToast(colors);
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
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
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
              textColor={colors.textPrimary}
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

          {/* Volume */}
          <View style={styles.section}>
            <View style={styles.volumeHeader}>
              <Text style={styles.settingLabel}>{t.edit.volume}</Text>
              <Text style={styles.volumeValue}>{Math.round((alarm.volume ?? 1.0) * 100)}%</Text>
            </View>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0.05}
              maximumValue={1}
              step={0.05}
              value={alarm.volume ?? 1.0}
              onValueChange={(val: number) => setAlarm((prev) => ({ ...prev, volume: val }))}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.bgTertiary}
              thumbTintColor={colors.accent}
            />
            <View style={styles.fadeInRow}>
              <View>
                <Text style={styles.settingLabel}>{t.edit.fadeIn}</Text>
                <Text style={styles.settingHint}>{t.edit.fadeInHint}</Text>
              </View>
              <Switch
                value={alarm.fadeIn ?? false}
                onValueChange={(val) => setAlarm((prev) => ({ ...prev, fadeIn: val }))}
                trackColor={{ false: colors.bgTertiary, true: colors.accent }}
                thumbColor={colors.bgSecondary}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* QR status — tap to manage */}
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/qr-manage')} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.settingLabel}>{t.edit.qrBarcode}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusChip, hasGlobalQR && styles.statusChipActive]}>
                <Text style={[styles.statusChipText, hasGlobalQR && styles.statusChipTextActive]}>
                  {hasGlobalQR ? t.edit.qrRegistered : t.edit.qrNotRegistered}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 18, marginLeft: 8 }}>›</Text>
            </View>
          </TouchableOpacity>

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
              trackColor={{ false: colors.bgTertiary, true: colors.accent }}
              thumbColor={colors.bgSecondary}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button title={t.edit.save} onPress={handleSave} fullWidth />
          {!isNew && (
            <Button title={t.edit.delete} onPress={handleDelete} variant="ghost" fullWidth
              textStyle={{ color: colors.error }}
              style={{ marginTop: SPACING.sm }}
            />
          )}
        </View>
      </Animated.ScrollView>
      {ToastView}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bgPrimary },
  content: { paddingTop: SPACING['7xl'], paddingHorizontal: SCREEN_PADDING.horizontal, paddingBottom: SCREEN_PADDING.bottom },

  // ─── Header ───
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  backButton: { paddingVertical: SPACING.xs, paddingRight: SPACING.lg },
  backText: { fontSize: FONT_SIZE.bodySmall, color: c.accentSubtle, fontFamily: FONT_FAMILY.medium },
  headerTitle: { fontSize: FONT_SIZE.body, color: c.textPrimary, fontFamily: FONT_FAMILY.semiBold },

  // ─── Time ───
  timeSection: { alignItems: 'center', marginBottom: SPACING['4xl'], paddingVertical: SPACING.xl },
  timeDisplay: { fontSize: FONT_SIZE.hero, fontFamily: FONT_FAMILY.bold, color: c.textPrimary, letterSpacing: 4 },

  // ─── Settings Card ───
  settingsCard: { backgroundColor: c.bgSecondary, borderRadius: RADIUS.base, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xs, marginBottom: SPACING.xxl },
  section: { paddingVertical: SPACING.lg },
  sectionLabel: { fontSize: FONT_SIZE.labelSmall, color: c.textMuted, letterSpacing: 1, fontFamily: FONT_FAMILY.medium, textTransform: 'uppercase', marginBottom: SPACING.base },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.bgTertiary },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayButton: { width: SIZE.dayButton, height: SIZE.dayButton, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgTertiary },
  dayActive: { backgroundColor: c.accent },
  dayText: { fontSize: FONT_SIZE.label, color: c.textMuted, fontFamily: FONT_FAMILY.medium },
  dayTextActive: { color: c.accentText, fontFamily: FONT_FAMILY.semiBold },

  // ─── Setting Rows ───
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
  settingLabel: { fontSize: FONT_SIZE.bodySmall, color: c.textPrimary, fontFamily: FONT_FAMILY.regular },
  settingValueRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  settingValue: { fontSize: FONT_SIZE.bodySmall, color: c.textMuted, fontFamily: FONT_FAMILY.regular },
  settingValueAccent: { color: c.accentSubtle },
  chevron: { fontSize: FONT_SIZE.label, color: c.textMuted, fontFamily: FONT_FAMILY.regular, opacity: 0.5 } as const,
  statusChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xxs, borderRadius: RADIUS.full, backgroundColor: c.bgTertiary },
  statusChipActive: { backgroundColor: c.overlay.accent10 },
  statusChipText: { fontSize: FONT_SIZE.labelSmall, color: c.textMuted, fontFamily: FONT_FAMILY.regular },
  statusChipTextActive: { color: c.accentSubtle },
  bgClearButton: { paddingBottom: SPACING.sm },
  bgClearText: { fontSize: FONT_SIZE.label, color: c.error, fontFamily: FONT_FAMILY.regular },
  settingHint: { fontSize: FONT_SIZE.labelSmall, color: c.textMuted, fontFamily: FONT_FAMILY.regular, marginTop: SPACING.xxs },

  // ─── Volume ───
  volumeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  volumeValue: { fontSize: FONT_SIZE.bodySmall, color: c.accentSubtle, fontFamily: FONT_FAMILY.semiBold },
  volumeSlider: { width: '100%', height: 40, marginTop: SPACING.xs },
  fadeInRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },

  // ─── Actions ───
  actionsSection: { marginTop: SPACING.xl },
});
