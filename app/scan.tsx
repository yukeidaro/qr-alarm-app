import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  saveRegisteredQR,
  getRegisteredQR,
  resetSnoozeCount,
  clearSnoozeTime,
} from '../services/storageService';
import { stopAlarm } from '../services/audioService';
import Button from '../components/Button';
import {
  BG_PRIMARY, BG_SECONDARY, ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, ERROR,
  WARM_GLOW_STRONG, OVERLAY, BG_TERTIARY,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ACTIVE_OPACITY, TIMER, ANIMATION } from '../constants/spacing';
import { t } from '../i18n';

type ScanMode = 'register' | 'dismiss';

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; alarmId?: string }>();
  const mode: ScanMode = (params.mode as ScanMode) || 'register';
  const alarmId = params.alarmId;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [statusText, setStatusText] = useState<string>(
    mode === 'register' ? t.scan.registerPrompt : t.scan.dismissPrompt
  );
  const [countdown, setCountdown] = useState<number>(TIMER.dismissTimeout);
  const [dismissed, setDismissed] = useState(false);
  const dismissedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Corner pulse animation
  const cornerPulse = useRef(new Animated.Value(0.6)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(cornerPulse, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Stop alarm when entering scan-to-dismiss
  useEffect(() => {
    if (mode === 'dismiss') {
      stopAlarm();
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'dismiss') return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!dismissedRef.current) router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    if (mode === 'register') {
      await saveRegisteredQR(data);
      setStatusText(t.scan.registered);
      setTimeout(() => router.back(), 800);
    } else {
      const registeredQR = await getRegisteredQR();
      if (registeredQR && data === registeredQR) {
        dismissedRef.current = true;
        setDismissed(true);
        if (timerRef.current) clearInterval(timerRef.current);
        await stopAlarm();
        if (alarmId) {
          await resetSnoozeCount(alarmId);
          await clearSnoozeTime(alarmId);
        }
        setStatusText(t.scan.dismissed);
        setTimeout(() => router.dismissAll(), 600);
      } else {
        setStatusText(t.scan.mismatch);
        setTimeout(() => setScanned(false), 1500);
        setTimeout(() => setStatusText(t.scan.dismissPrompt), 1500);
      }
    }
  };

  const progress = mode === 'dismiss' ? Math.max(0, 1 - countdown / TIMER.dismissTimeout) : 0;

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{t.scan.cameraChecking}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Text style={styles.message}>{t.scan.cameraRequired}</Text>
          <Button title={t.scan.allowCamera} onPress={requestPermission} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'codabar', 'itf14'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Scan frame with animated corners */}
          <View style={styles.scanFrame}>
            <Animated.View style={[styles.corner, styles.cornerTL, { opacity: cornerPulse }]} />
            <Animated.View style={[styles.corner, styles.cornerTR, { opacity: cornerPulse }]} />
            <Animated.View style={[styles.corner, styles.cornerBL, { opacity: cornerPulse }]} />
            <Animated.View style={[styles.corner, styles.cornerBR, { opacity: cornerPulse }]} />

            {/* Center guide dot */}
            <View style={styles.centerDot} />
          </View>

          {/* Mode label */}
          <Text style={styles.modeLabel}>
            {mode === 'register' ? 'REGISTER' : 'SCAN'}
          </Text>
        </View>
      </CameraView>

      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusPill, dismissed && styles.statusPillSuccess]}>
          <View style={[styles.statusDot, dismissed && styles.statusDotSuccess]} />
          <Text style={[styles.statusText, dismissed && styles.statusTextSuccess]}>{statusText}</Text>
        </View>

        {/* Countdown progress bar */}
        {mode === 'dismiss' && countdown > 0 && !dismissed && (
          <View style={styles.countdownSection}>
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
                progress > 0.7 && styles.progressFillUrgent,
              ]} />
            </View>
            <Text style={[styles.countdownText, progress > 0.7 && styles.countdownTextUrgent]}>
              {t.scan.countdown(countdown)}
            </Text>
          </View>
        )}
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: OVERLAY.black40,
  },
  scanFrame: {
    width: SIZE.scanFrame,
    height: SIZE.scanFrame,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: ACCENT_PRIMARY,
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: RADIUS.xl },
  cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: RADIUS.xl },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: RADIUS.xl },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: RADIUS.xl },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_PRIMARY,
    opacity: 0.3,
  },
  modeLabel: {
    fontSize: FONT_SIZE.micro,
    color: ACCENT_PRIMARY,
    fontFamily: FONT_FAMILY.semiBold,
    letterSpacing: 3,
    marginTop: SPACING.xxl,
    opacity: 0.6,
  },
  statusBar: {
    position: 'absolute',
    bottom: SCREEN_PADDING.bottom,
    left: SCREEN_PADDING.horizontal,
    right: SCREEN_PADDING.horizontal,
    alignItems: 'center',
    gap: SPACING.base,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
    backgroundColor: BG_SECONDARY,
    gap: SPACING.sm,
  },
  statusPillSuccess: {
    backgroundColor: OVERLAY.accent10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEXT_MUTED,
  },
  statusDotSuccess: {
    backgroundColor: ACCENT_PRIMARY,
  },
  statusText: {
    fontSize: FONT_SIZE.bodySmall,
    color: TEXT_PRIMARY,
    fontFamily: FONT_FAMILY.regular,
  },
  statusTextSuccess: {
    color: ACCENT_PRIMARY,
  },

  // ─── Countdown with progress bar ───
  countdownSection: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: ACCENT_PRIMARY,
  },
  progressFillUrgent: {
    backgroundColor: ERROR,
  },
  countdownText: {
    fontSize: FONT_SIZE.caption,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.medium,
  },
  countdownTextUrgent: {
    color: ERROR,
  },

  closeButton: {
    position: 'absolute',
    top: SCREEN_PADDING.top,
    right: SCREEN_PADDING.horizontal,
    width: SIZE.closeButton,
    height: SIZE.closeButton,
    borderRadius: RADIUS.full,
    backgroundColor: BG_SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: FONT_SIZE.heading3,
    color: TEXT_SECONDARY,
  },
  message: {
    fontSize: FONT_SIZE.body,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontFamily: FONT_FAMILY.regular,
  },
  permissionCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING['5xl'],
  },
});
