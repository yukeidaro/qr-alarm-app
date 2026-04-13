/**
 * ScanAlarm — Settings Screen
 * Profile, alarm defaults, QR management, theme, app info.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { ThemeColors } from '../../constants/colors';
import { getSoundLabel } from '../../services/audioService';
import { clearPendingSound, getPendingSound } from '../../services/soundSelectionStore';
import { getRegisteredQRs } from '../../services/storageService';
import { FONT_FAMILY, FONT_SIZE } from '../../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../../constants/spacing';
import { t } from '../../i18n';

const NAME_KEY = '@qralarm/user_name';
const SOUND_OUTPUT_KEY = '@qralarm/sound_output';
const DEFAULT_SOUND_KEY = '@qralarm/default_sound';
const APP_VERSION = '1.0.0';

export type SoundOutputMode = 'device' | 'bluetooth' | 'auto';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, setThemeMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [defaultSound, setDefaultSound] = useState('gentle');
  const [qrCount, setQrCount] = useState(0);
  const [soundOutput, setSoundOutput] = useState<SoundOutputMode>('device');

  // Toast
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastOpacity.setValue(0);
    toastTranslateY.setValue(20);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(toastTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setToastVisible(false);
      });
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const loadSettings = useCallback(async () => {
    const savedName = await AsyncStorage.getItem(NAME_KEY);
    if (savedName) setName(savedName);
    const qrs = await getRegisteredQRs();
    setQrCount(qrs.length);
    const savedOutput = await AsyncStorage.getItem(SOUND_OUTPUT_KEY);
    if (savedOutput) setSoundOutput(savedOutput as SoundOutputMode);
    const savedSound = await AsyncStorage.getItem(DEFAULT_SOUND_KEY);
    if (savedSound) setDefaultSound(savedSound);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const pending = getPendingSound();
      if (pending) {
        setDefaultSound(pending);
        AsyncStorage.setItem(DEFAULT_SOUND_KEY, pending);
        clearPendingSound();
      }
      loadSettings();
    }, [loadSettings])
  );

  const handleSaveName = async () => {
    await AsyncStorage.setItem(NAME_KEY, name.trim());
    setEditingName(false);
    showToast(t.settings.savedToast);
  };

  const handleOpenQRManage = () => {
    router.push('/qr-manage');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://yukeidaro.github.io/qr-alarm-app/privacy-policy.html');
  };

  const handleOpenSoundOutput = () => {
    router.push('/sound-output');
  };

  const soundOutputLabel = soundOutput === 'device'
    ? t.settings.soundOutputDevice
    : soundOutput === 'bluetooth'
      ? t.settings.soundOutputBluetooth
      : t.settings.soundOutputAuto;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>{t.settings.title}</Text>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.profile}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t.settings.profileName}</Text>
              {editingName ? (
                <View style={styles.nameEditRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder={t.settings.profileNamePlaceholder}
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                  />
                  <TouchableOpacity onPress={handleSaveName} activeOpacity={ACTIVE_OPACITY.default}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.rowValueTouchable}
                  onPress={() => setEditingName(true)}
                  activeOpacity={ACTIVE_OPACITY.default}
                >
                  <Text style={styles.rowValue}>{name || t.settings.profileNamePlaceholder}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Alarm Defaults Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.alarmDefaults}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/sounds')}
              activeOpacity={ACTIVE_OPACITY.default}
            >
              <Text style={styles.rowLabel}>{t.settings.defaultSound}</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{getSoundLabel(defaultSound)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* QR Code Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.qrManagement}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenQRManage}
              activeOpacity={ACTIVE_OPACITY.default}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="qr-code-outline" size={20} color={colors.textPrimary} style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>{t.settings.qrManagement}</Text>
                  <Text style={styles.rowDesc}>{t.settings.qrManagementDesc}</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                {qrCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{qrCount}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.theme}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorderBottom]}>
              <View style={styles.rowLeft}>
                <Ionicons name="moon-outline" size={20} color={colors.textPrimary} style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>{t.settings.darkMode}</Text>
                  <Text style={styles.rowDesc}>{t.settings.darkModeDesc}</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: colors.bgTertiary, true: colors.accent }}
                thumbColor="#FFFFFF"
                style={styles.toggle}
              />
            </View>
            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenSoundOutput}
              activeOpacity={ACTIVE_OPACITY.default}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="volume-high-outline" size={20} color={colors.textPrimary} style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>{t.settings.soundOutput}</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{soundOutputLabel}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Alarm Optimization Banner */}
        <TouchableOpacity
          style={styles.optimizationBanner}
          onPress={() => router.push('/alarm-optimization')}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
          <View style={styles.optimizationBannerText}>
            <Text style={styles.optimizationBannerTitle}>{t.settings.alarmOptimizationBanner}</Text>
            <Text style={styles.optimizationBannerSub}>{t.settings.alarmOptimizationBannerSub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.about}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorderBottom]}>
              <Text style={styles.rowLabel}>{t.settings.version}</Text>
              <Text style={styles.rowValueMuted}>{APP_VERSION}</Text>
            </View>
            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenPrivacy}
              activeOpacity={ACTIVE_OPACITY.default}
            >
              <Text style={styles.rowLabel}>{t.settings.privacyPolicy}</Text>
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING['7xl'],
    paddingHorizontal: SPACING.xxl,
  },
  pageTitle: {
    fontSize: FONT_SIZE.heading1,
    fontFamily: FONT_FAMILY.bold,
    color: c.textPrimary,
    marginBottom: SPACING.xxl,
  },

  // Sections
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.label,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },

  // Card
  card: {
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: 52,
  },
  rowBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.bgTertiary,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowIcon: {
    marginRight: SPACING.base,
  },
  rowLabel: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.medium,
    color: c.textPrimary,
  },
  rowDesc: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textSecondary,
  },
  rowValueMuted: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
  },
  rowValueTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  // Name edit
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.regular,
    color: c.textPrimary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: c.bgPrimary,
    borderRadius: RADIUS.sm,
    textAlign: 'right',
  },

  // Badge
  badge: {
    backgroundColor: c.overlay.accent10,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accent,
  },

  // Toggle
  toggle: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: SPACING['9xl'],
    alignSelf: 'center',
    backgroundColor: c.bgSecondary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.medium,
    color: c.textPrimary,
  },

  bottomSpacer: {
    height: SPACING['5xl'],
  },

  // Alarm Optimization Banner
  optimizationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.accent,
    borderRadius: RADIUS.base,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.xxl,
    gap: SPACING.base,
  },
  optimizationBannerText: {
    flex: 1,
  },
  optimizationBannerTitle: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#FFFFFF',
  },
  optimizationBannerSub: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
