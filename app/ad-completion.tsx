import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { ThemeColors } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t } from '../i18n';

export default function AdCompletionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissAll();
  };

  return (
    <View style={styles.container}>
      {/* Ad placeholder — replace with real ad SDK integration */}
      <View style={styles.adContainer}>
        <Text style={styles.adLabel}>{t.adCompletion.adLabel}</Text>
      </View>

      {/* Close button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Text style={styles.closeText}>{t.adCompletion.close}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  adContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_PADDING.top,
  },
  adLabel: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
  },
  footer: {
    width: '100%',
    paddingBottom: SCREEN_PADDING.bottom,
    paddingTop: SPACING.xl,
  },
  closeButton: {
    width: '100%',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.base,
    backgroundColor: c.bgSecondary,
    alignItems: 'center',
  },
  closeText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
  },
});
