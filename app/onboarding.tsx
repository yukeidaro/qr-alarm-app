import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../theme';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t } from '../i18n';

const ONBOARDING_KEY = '@qralarm/onboarding_done';
const NAME_KEY = '@qralarm/user_name';

type Step = 'welcome' | 'permissions' | 'ready';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [notifGranted, setNotifGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const goToStep = (next: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(next);
      animateIn();
    });
  };

  const handleNameDone = async () => {
    if (name.trim()) {
      await AsyncStorage.setItem(NAME_KEY, name.trim());
    }
    goToStep('permissions');
  };

  const handleRequestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setNotifGranted(granted);
    Haptics.notificationAsync(
      granted ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  const handleSkipToHome = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  const renderWelcome = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepEmoji}>{'  '}</Text>
      <Text style={styles.title}>{t.onboardingFlow.welcomeTitle}</Text>
      <Text style={styles.subtitle}>{t.onboardingFlow.welcomeSubtitle}</Text>

      {/* App description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>{t.onboardingFlow.appDescription}</Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>{t.onboardingFlow.nameLabel}</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder={t.onboardingFlow.namePlaceholder}
          placeholderTextColor={colors.textMuted}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleNameDone}
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNameDone} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.primaryButtonText}>{t.onboardingFlow.next}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => goToStep('permissions')} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.skipText}>{t.onboardingFlow.skip}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPermissions = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepEmoji}>{'  '}</Text>
      <Text style={styles.title}>{t.onboardingFlow.permissionsTitle}</Text>
      <Text style={styles.subtitle}>{t.onboardingFlow.permissionsSubtitle}</Text>

      {/* Notification permission */}
      <View style={styles.permissionCard}>
        <View style={styles.permissionRow}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>{t.onboardingFlow.notificationTitle}</Text>
            <Text style={styles.permissionDesc}>{t.onboardingFlow.notificationDesc}</Text>
          </View>
          {notifGranted ? (
            <View style={styles.grantedBadge}>
              <Text style={styles.grantedText}>OK</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.grantButton} onPress={handleRequestNotifications} activeOpacity={ACTIVE_OPACITY.default}>
              <Text style={styles.grantButtonText}>{t.onboardingFlow.allow}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sound settings tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>{t.onboardingFlow.soundTipTitle}</Text>
        <Text style={styles.tipDesc}>{t.onboardingFlow.soundTipDesc}</Text>
        {Platform.OS === 'android' && (
          <TouchableOpacity onPress={handleOpenSettings} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.tipLink}>{t.onboardingFlow.openSettings}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Focus Mode tip (iOS only) */}
      {Platform.OS === 'ios' && (
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>{t.onboardingFlow.focusModeTitle}</Text>
          <Text style={styles.tipDesc}>{t.onboardingFlow.focusModeDesc}</Text>
          <TouchableOpacity onPress={() => Linking.openSettings()} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.tipLink}>{t.onboardingFlow.focusModeButton}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={() => goToStep('ready')} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.primaryButtonText}>{t.onboardingFlow.next}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderReady = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepEmoji}>{'  '}</Text>
      <Text style={styles.title}>{t.onboardingFlow.readyTitle}</Text>
      <Text style={styles.subtitle}>
        {name.trim()
          ? t.onboardingFlow.readySubtitleName(name.trim())
          : t.onboardingFlow.readySubtitle}
      </Text>

      <View style={styles.checklistCard}>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>{'*'}</Text>
          <Text style={styles.checkText}>{t.onboardingFlow.tipQr}</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>{'*'}</Text>
          <Text style={styles.checkText}>{t.onboardingFlow.tipSound}</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>{'*'}</Text>
          <Text style={styles.checkText}>{t.onboardingFlow.tipSnooze}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleFinish} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.primaryButtonText}>{t.onboardingFlow.start}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Step indicator
  const steps: Step[] = ['welcome', 'permissions', 'ready'];
  const currentIndex = steps.indexOf(step);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkipToHome} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.skipButtonText}>{t.onboardingFlow.skip}</Text>
      </TouchableOpacity>

      {/* Step dots */}
      <View style={styles.dotsRow}>
        {steps.map((s, i) => (
          <View key={s} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Content */}
      {step === 'welcome' && renderWelcome()}
      {step === 'permissions' && renderPermissions()}
      {step === 'ready' && renderReady()}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.bgPrimary,
  },

  // Skip
  skipButton: {
    position: 'absolute',
    top: SPACING['7xl'],
    right: SCREEN_PADDING.horizontal,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipButtonText: {
    fontSize: FONT_SIZE.bodySmall,
    color: c.textMuted,
    fontFamily: FONT_FAMILY.medium,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING['7xl'],
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.bgTertiary,
  },
  dotActive: {
    backgroundColor: c.accent,
    width: 24,
  },

  // Step
  stepContainer: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    alignItems: 'center',
    paddingTop: SPACING['5xl'],
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.heading2,
    fontFamily: FONT_FAMILY.bold,
    color: c.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  subtitle: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  descriptionCard: {
    width: '100%',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    padding: SPACING.lg,
    marginBottom: SPACING['4xl'],
  },
  descriptionText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Name input
  inputCard: {
    width: '100%',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  inputLabel: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.medium,
    color: c.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  textInput: {
    fontSize: FONT_SIZE.heading3,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: c.accent,
  },

  // Buttons
  primaryButton: {
    width: '100%',
    backgroundColor: c.accent,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accentText,
  },
  skipText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    paddingVertical: SPACING.sm,
  },

  // Permission card
  permissionCard: {
    width: '100%',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  permissionTitle: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
    marginBottom: SPACING.xxs,
  },
  permissionDesc: {
    fontSize: FONT_SIZE.label,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    lineHeight: 18,
  },
  grantButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: c.accent,
  },
  grantButtonText: {
    fontSize: FONT_SIZE.label,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accentText,
  },
  grantedBadge: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: c.overlay.accent10,
  },
  grantedText: {
    fontSize: FONT_SIZE.label,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accentSubtle,
  },

  // Tip card
  tipCard: {
    width: '100%',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  tipTitle: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
    marginBottom: SPACING.xs,
  },
  tipDesc: {
    fontSize: FONT_SIZE.label,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    lineHeight: 18,
  },
  tipLink: {
    fontSize: FONT_SIZE.label,
    fontFamily: FONT_FAMILY.medium,
    color: c.accentSubtle,
    marginTop: SPACING.sm,
  },

  // Checklist
  checklistCard: {
    width: '100%',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.base,
  },
  checkIcon: {
    fontSize: FONT_SIZE.bodySmall,
    color: c.accent,
    fontFamily: FONT_FAMILY.bold,
    marginTop: 1,
  },
  checkText: {
    flex: 1,
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textSecondary,
    lineHeight: 22,
  },
});
