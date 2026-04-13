/**
 * ScanAlarm — Sound Output Screen
 * Radio-button selection for audio output mode.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ThemeColors } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t } from '../i18n';

const SOUND_OUTPUT_KEY = '@qralarm/sound_output';
type SoundOutputMode = 'device' | 'bluetooth' | 'auto';

interface OutputOption {
  key: SoundOutputMode;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function SoundOutputScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selected, setSelected] = useState<SoundOutputMode>('device');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(SOUND_OUTPUT_KEY);
      if (saved) setSelected(saved as SoundOutputMode);
    })();
  }, []);

  const handleSelect = async (mode: SoundOutputMode) => {
    setSelected(mode);
    await AsyncStorage.setItem(SOUND_OUTPUT_KEY, mode);
  };

  const options: OutputOption[] = [
    {
      key: 'device',
      label: t.settings.soundOutputDevice,
      desc: t.soundOutput?.deviceDesc ?? 'Play through the built-in speaker',
      icon: 'phone-portrait-outline',
    },
    {
      key: 'bluetooth',
      label: t.settings.soundOutputBluetooth,
      desc: t.soundOutput?.bluetoothDesc ?? 'Play through connected Bluetooth device',
      icon: 'bluetooth-outline',
    },
    {
      key: 'auto',
      label: t.settings.soundOutputAuto,
      desc: t.soundOutput?.autoDesc ?? 'Automatically select the best output',
      icon: 'swap-horizontal-outline',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={ACTIVE_OPACITY.default}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings.soundOutput}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Options */}
      <View style={styles.optionsCard}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionRow, idx < options.length - 1 && styles.optionBorder]}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={ACTIVE_OPACITY.default}
          >
            <Ionicons name={opt.icon} size={22} color={colors.textPrimary} style={styles.optionIcon} />
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <View style={[styles.radio, selected === opt.key && styles.radioSelected]}>
              {selected === opt.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Note */}
      <Text style={styles.note}>
        {t.soundOutput?.note ?? 'Bluetooth routing depends on your device OS settings. If Bluetooth is not connected, the alarm will play through the device speaker.'}
      </Text>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgPrimary,
      paddingTop: 60,
      paddingHorizontal: SCREEN_PADDING.horizontal,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xxl,
    },
    headerTitle: {
      fontSize: FONT_SIZE.heading3,
      fontFamily: FONT_FAMILY.bold,
      color: c.textPrimary,
    },
    optionsCard: {
      backgroundColor: c.bgSecondary,
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.lg,
    },
    optionBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.bgTertiary,
    },
    optionIcon: {
      marginRight: SPACING.base,
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: FONT_SIZE.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: c.textPrimary,
    },
    optionDesc: {
      fontSize: FONT_SIZE.caption,
      fontFamily: FONT_FAMILY.regular,
      color: c.textMuted,
      marginTop: 2,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: SPACING.base,
    },
    radioSelected: {
      borderColor: c.accent,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: c.accent,
    },
    note: {
      fontSize: FONT_SIZE.caption,
      fontFamily: FONT_FAMILY.regular,
      color: c.textMuted,
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.sm,
      lineHeight: FONT_SIZE.caption * 1.6,
    },
  });
