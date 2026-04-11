import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  saveRegisteredQRItem,
  getRegisteredQR,
  getRegisteredQRs,
  getRegisteredQRById,
  resetSnoozeCount,
  getSnoozeCount,
  clearSnoozeTime,
  recordDismiss,
  RegisteredQR,
} from '../services/storageService';
import { stopAlarm } from '../services/audioService';
import Button from '../components/Button';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../theme';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ACTIVE_OPACITY, TIMER } from '../constants/spacing';
import { t } from '../i18n';

type ScanMode = 'register' | 'dismiss';

const BARCODE_TYPES_FULL = [
  'qr', 'ean13', 'ean8', 'upc_a', 'code128',
] as const;

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; alarmId?: string; qrId?: string }>();
  const mode: ScanMode = (params.mode as ScanMode) || 'register';
  const alarmId = params.alarmId;
  const qrId = params.qrId; // specific QR to match against
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [statusText, setStatusText] = useState<string>(
    mode === 'register' ? t.scan.registerPrompt : t.scan.dismissPrompt
  );
  const [countdown, setCountdown] = useState<number>(TIMER.dismissTimeout);
  const [dismissed, setDismissed] = useState(false);
  const [torch, setTorch] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [dismissStreak, setDismissStreak] = useState(0);

  // Name input state (register mode)
  const [pendingData, setPendingData] = useState<string | null>(null);
  const [qrName, setQrName] = useState('');

  const dismissedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScannedRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  const cornerPulse = useRef(new Animated.Value(0.6)).current;
  const scanScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Completion animation values
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const msgOpacity = useRef(new Animated.Value(0)).current;

  const playCompletionAnimation = () => {
    // Phase 1: Checkmark appears
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Phase 2: Message fade in (500ms later)
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.timing(msgOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Phase 3: Navigate to ad completion screen (3s later)
    setTimeout(() => {
      router.replace('/ad-completion');
    }, 3000);
  };

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const breathe = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(cornerPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(cornerPulse, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scanScale, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, []);

  useEffect(() => {
    if (mode === 'dismiss') stopAlarm();
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

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || pendingData) return;

    const now = Date.now();
    if (data === lastScannedRef.current && now - lastScannedTimeRef.current < 500) return;
    lastScannedRef.current = data;
    lastScannedTimeRef.current = now;

    if (mode === 'register') {
      // Show name input
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(scanScale, { toValue: 1.12, duration: 150, useNativeDriver: true }),
        Animated.timing(scanScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setPendingData(data);
      setStatusText(t.scan.scannedNamePrompt);
    } else {
      // Dismiss mode: check against specific QR or all registered QRs
      let matched = false;
      if (qrId) {
        const qr = await getRegisteredQRById(qrId);
        matched = !!qr && qr.data === data;
      } else {
        const qrs = await getRegisteredQRs();
        matched = qrs.some((q) => q.data === data);
      }

      if (matched) {
        setScanned(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Bounce effect on scan frame
        Animated.sequence([
          Animated.timing(scanScale, { toValue: 1.12, duration: 150, useNativeDriver: true }),
          Animated.timing(scanScale, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
        dismissedRef.current = true;
        setDismissed(true);
        if (timerRef.current) clearInterval(timerRef.current);
        await stopAlarm();
        if (alarmId) {
          await resetSnoozeCount(alarmId);
          await clearSnoozeTime(alarmId);
        }
        // Record streak and pick context-aware message
        const streak = await recordDismiss();
        const snoozeCount = alarmId ? await getSnoozeCount(alarmId) : 0;
        const msgs = t.dismissMessages;
        let msg: string;
        if (snoozeCount === 0 && Math.random() < 0.3) {
          // No snooze used - pick from noSnooze messages
          const pool = msgs.noSnooze;
          msg = pool[Math.floor(Math.random() * pool.length)];
        } else if (streak >= 2 && Math.random() < 0.5) {
          const streakMsgs = msgs.streak(streak);
          msg = streakMsgs[Math.floor(Math.random() * streakMsgs.length)];
        } else if (snoozeCount >= 2) {
          // Heavy snooze - pick from snoozed messages
          const pool = msgs.snoozed;
          msg = pool[Math.floor(Math.random() * pool.length)];
        } else {
          msg = msgs.general[Math.floor(Math.random() * msgs.general.length)];
        }
        setCelebrationMsg(msg);
        setDismissStreak(streak);
        setStatusText(t.scan.dismissed);
        playCompletionAnimation();
      } else {
        setStatusText(t.scan.mismatch);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => {
          if (!dismissedRef.current) setStatusText(t.scan.dismissPrompt);
        }, 400);
      }
    }
  };

  const handleSaveName = async () => {
    if (!pendingData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newQR: RegisteredQR = {
      id: `qr_${Date.now()}`,
      name: qrName.trim() || 'QR',
      data: pendingData,
    };
    await saveRegisteredQRItem(newQR);
    setScanned(true);
    setStatusText(t.scan.registered);
    setTimeout(() => router.back(), 800);
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
        facing="back"
        zoom={0.02}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES_FULL] }}
        onBarcodeScanned={(scanned || pendingData) ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.scanFrame, { transform: [{ scale: scanScale }] }]}>
            <Animated.View style={[styles.corner, styles.cornerTL, { opacity: cornerPulse }]} />
            <Animated.View style={[styles.corner, styles.cornerTR, { opacity: cornerPulse }]} />
            <Animated.View style={[styles.corner, styles.cornerBL, { opacity: cornerPulse }]} />
            <Animated.View style={[styles.corner, styles.cornerBR, { opacity: cornerPulse }]} />
            <View style={styles.centerDot} />
          </Animated.View>

          <Text style={styles.modeLabel}>
            {mode === 'register' ? 'REGISTER' : 'SCAN'}
          </Text>
        </View>
      </CameraView>

      {/* Name input overlay (register mode, after scan) */}
      {pendingData && (
        <KeyboardAvoidingView
          style={styles.nameOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.nameCard}>
            <Text style={styles.nameTitle}>{t.scan.nameTitle}</Text>
            <Text style={styles.nameDesc}>{t.scan.nameDesc}</Text>
            <TextInput
              style={styles.nameInput}
              value={qrName}
              onChangeText={setQrName}
              placeholder={t.scan.namePlaceholder}
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveName} activeOpacity={ACTIVE_OPACITY.default}>
              <Text style={styles.saveButtonText}>{t.scan.save}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Status bar — only shown in dismiss mode */}
      {mode === 'dismiss' && (
        <View style={styles.statusBar}>
          <View style={[styles.statusPill, dismissed && styles.statusPillSuccess]}>
            <View style={[styles.statusDot, dismissed && styles.statusDotSuccess]} />
            <Text style={[styles.statusText, dismissed && styles.statusTextSuccess]}>{statusText}</Text>
          </View>

          {countdown > 0 && !dismissed && (
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
      )}

      {/* Completion overlay on dismiss */}
      {dismissed && celebrationMsg && (
        <View style={styles.completionOverlay}>
          <Animated.View style={[styles.checkCircle, {
            transform: [{ scale: checkScale }],
            opacity: checkOpacity,
          }]}>
            <Ionicons name="checkmark" size={64} color="#FFFFFF" />
          </Animated.View>

          <Animated.Text style={[styles.completionMsg, { opacity: msgOpacity }]}>
            {celebrationMsg}
          </Animated.Text>

          {dismissStreak >= 2 && (
            <Animated.Text style={[styles.streakText, { opacity: msgOpacity }]}>
              {t.scan.streakLabel(dismissStreak)}
            </Animated.Text>
          )}

          <Animated.Text style={[styles.completionTime, { opacity: msgOpacity }]}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Animated.Text>
        </View>
      )}

      {/* Torch button (top left) */}
      <TouchableOpacity
        style={[styles.torchButton, torch && styles.torchButtonActive]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTorch(!torch); }}
        activeOpacity={ACTIVE_OPACITY.default}
      >
        <Text style={styles.torchIcon}>{'\u{1F526}'}</Text>
      </TouchableOpacity>

      {/* Back button (top right, register mode only) */}
      {mode === 'register' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Text style={styles.backButtonText}>{'\u2715'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const SCAN_FRAME_SIZE = 320;

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: c.overlay.black40,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: c.accent,
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: RADIUS.xl },
  cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: RADIUS.xl },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: RADIUS.xl },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: RADIUS.xl },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.accent,
    opacity: 0.3,
  },
  modeLabel: {
    fontSize: FONT_SIZE.micro,
    color: c.accent,
    fontFamily: FONT_FAMILY.semiBold,
    letterSpacing: 3,
    marginTop: SPACING.xxl,
    opacity: 0.6,
  },

  // Status bar
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
    backgroundColor: c.bgSecondary,
    gap: SPACING.sm,
  },
  statusPillSuccess: { backgroundColor: c.overlay.accent10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.textMuted },
  statusDotSuccess: { backgroundColor: c.accent },
  statusText: { fontSize: FONT_SIZE.bodySmall, color: c.textPrimary, fontFamily: FONT_FAMILY.regular },
  statusTextSuccess: { color: c.accent },

  // Countdown
  countdownSection: { width: '100%', alignItems: 'center', gap: SPACING.sm },
  progressTrack: { width: '100%', height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: c.accent },
  progressFillUrgent: { backgroundColor: c.error },
  countdownText: { fontSize: FONT_SIZE.caption, color: c.textMuted, fontFamily: FONT_FAMILY.medium },
  countdownTextUrgent: { color: c.error },

  // Completion overlay
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 120, 69, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  completionMsg: {
    fontSize: FONT_SIZE.heading2,
    fontFamily: FONT_FAMILY.bold,
    color: '#FFFFFF',
    marginTop: SPACING.xxl,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  streakText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.base,
  },
  completionTime: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.regular,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: SPACING.xl,
  },

  // Torch
  torchButton: {
    position: 'absolute',
    top: SCREEN_PADDING.top,
    left: SCREEN_PADDING.horizontal,
    width: SIZE.closeButton,
    height: SIZE.closeButton,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchButtonActive: {
    backgroundColor: c.accent,
  },
  torchIcon: {
    fontSize: 20,
  },
  torchIconActive: {
    fontSize: 20,
  },

  // Back button
  backButton: {
    position: 'absolute',
    top: SCREEN_PADDING.top,
    right: SCREEN_PADDING.horizontal,
    width: SIZE.closeButton,
    height: SIZE.closeButton,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: c.textContrast,
    fontFamily: FONT_FAMILY.medium,
  },

  // Name input overlay
  nameOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: c.overlay.black70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  nameCard: {
    width: '100%',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    padding: SPACING.xxl,
  },
  nameTitle: {
    fontSize: FONT_SIZE.heading3,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
    marginBottom: SPACING.xs,
  },
  nameDesc: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  nameInput: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.medium,
    color: c.textPrimary,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    backgroundColor: c.bgPrimary,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  saveButton: {
    backgroundColor: c.accent,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accentText,
  },

  message: {
    fontSize: FONT_SIZE.body,
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontFamily: FONT_FAMILY.regular,
  },
  permissionCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING['5xl'],
  },
});
