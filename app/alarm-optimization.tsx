/**
 * ScanAlarm — Alarm Optimization Screen
 * Guides user through Focus Mode and Screen Time settings
 * to ensure alarms ring reliably.
 */
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ThemeColors } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t } from '../i18n';

function AccordionSection({
  title,
  icon,
  steps,
  colors,
  settingsUrl,
  buttonLabel,
}: {
  title: string;
  icon: string;
  steps: string[];
  colors: ThemeColors;
  settingsUrl?: string;
  buttonLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const openSettings = async () => {
    if (Platform.OS === 'ios' && settingsUrl) {
      const canOpen = await Linking.canOpenURL(settingsUrl);
      if (canOpen) {
        Linking.openURL(settingsUrl);
        return;
      }
    }
    // Fallback to app settings
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={ACTIVE_OPACITY.default}
      >
        <View style={styles.accordionLeft}>
          <Ionicons name={icon as any} size={22} color={colors.accent} style={styles.accordionIcon} />
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.accordionBody}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openSettings}
            activeOpacity={ACTIVE_OPACITY.default}
          >
            <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            <Text style={styles.settingsButtonText}>{buttonLabel || t.alarmOptimization.goToSettings}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function AlarmOptimizationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.accent} />
          <Text style={styles.heroTitle}>{t.alarmOptimization.title}</Text>
          <Text style={styles.heroSubtitle}>{t.alarmOptimization.subtitle}</Text>
        </View>

        {/* Section 1: Focus Mode */}
        <AccordionSection
          title={t.alarmOptimization.focusModeTitle}
          icon="moon-outline"
          steps={[
            t.alarmOptimization.focusStep1,
            t.alarmOptimization.focusStep2,
            t.alarmOptimization.focusStep3,
            t.alarmOptimization.focusStep4,
          ]}
          colors={colors}
          settingsUrl="app-settings:"
          buttonLabel={t.alarmOptimization.goToFocusSettings}
        />

        {/* Section 2: Screen Time / Downtime */}
        <AccordionSection
          title={t.alarmOptimization.downtimeTitle}
          icon="hourglass-outline"
          steps={[
            t.alarmOptimization.downtimeStep1,
            t.alarmOptimization.downtimeStep2,
            t.alarmOptimization.downtimeStep3,
          ]}
          colors={colors}
          settingsUrl="App-Prefs:SCREEN_TIME"
          buttonLabel={t.alarmOptimization.goToScreenTimeSettings}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
  },
  header: {
    paddingTop: SPACING['7xl'],
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZE.heading2,
    fontFamily: FONT_FAMILY.bold,
    color: c.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },

  // Accordion
  accordionContainer: {
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionIcon: {
    marginRight: SPACING.base,
  },
  accordionTitle: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
    flex: 1,
  },
  accordionBody: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.bgTertiary,
    paddingTop: SPACING.lg,
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.overlay.accent10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accent,
  },
  stepText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textPrimary,
    flex: 1,
    lineHeight: 22,
  },

  // Go to Settings button
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.accent,
    borderRadius: RADIUS.base,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  settingsButtonText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#FFFFFF',
  },

  bottomSpacer: {
    height: SPACING['5xl'],
  },
});
