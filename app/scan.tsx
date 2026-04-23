import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  TextInput, KeyboardAvoidingView, Platform, Linking,
  Easing, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  saveRegisteredQRItem,
  getRegisteredQRs,
  getRegisteredQRById,
  resetSnoozeCount,
  getSnoozeCount,
  clearSnoozeTime,
  recordDismiss,
  getAlarms,
  saveAlarm,
  RegisteredQR,
} from '../services/storageService';
import { stopAlarm } from '../services/audioService';
import { cancelAlarm } from '../services/alarmService';
import { t } from '../i18n';
import { useC } from '../constants/palette';

type ScanMode = 'register' | 'dismiss';

// ─── Inline constants (no theme imports) ───
const C = {
  orange: '#F85A3E',
  orangeGlow: 'rgba(248,90,62,0.22)',
  orangeDim: '#FDE9E4',
  orangeInk: '#7A2512',
  green: '#27A862',
  greenDim: '#27A86220',
  dark: '#0A0A0A',
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#A1A1AA',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8F9',
  line: '#E5E5E7',
  bg: '#F4F4F5',
  white: '#FFFFFF',
  error: '#EF4444',
} as const;

const BARCODE_TYPES_FULL = [
  'qr', 'ean13', 'ean8', 'upc_a', 'code128',
] as const;

const SCAN_FRAME_SIZE = 220;
const CORNER_SIZE = 28;
const CORNER_STROKE = 3;
const CORNER_RADIUS = 6;

const LOCATION_SUGGESTIONS = ['冷蔵庫', '洗面所', 'トイレ', '玄関', 'キッチン', 'リビング'];

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; alarmId?: string; qrId?: string }>();
  const mode: ScanMode = (params.mode as ScanMode) || 'register';
  const alarmId = params.alarmId;
  const qrId = params.qrId;

  const [permission, requestPermission] = useCameraPermissions();
  const D = useC();
  const [scanned, setScanned] = useState(false);
  const [statusText, setStatusText] = useState<string>(
    mode === 'register' ? t.scan.registerPrompt : t.scan.dismissPrompt
  );
  const [countdown, setCountdown] = useState<number>(20);
  const [dismissed, setDismissed] = useState(false);
  const [torch, setTorch] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [dismissStreak, setDismissStreak] = useState(0);

  // Register mode states
  const [pendingData, setPendingData] = useState<string | null>(null);
  const [pendingKind, setPendingKind] = useState<'qr' | 'barcode'>('qr');
  const [showNameOverlay, setShowNameOverlay] = useState(false);
  const [qrName, setQrName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  const dismissedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScannedRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const completionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const cornerPulse = useRef(new Animated.Value(0.4)).current;
  const scanLinePos = useRef(new Animated.Value(0)).current;
  const scanLineOpacity = useRef(new Animated.Value(0)).current;
  const scanScale = useRef(new Animated.Value(1)).current;

  // Success animations
  const successScale = useRef(new Animated.Value(0.6)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const pulseRingScale = useRef(new Animated.Value(1)).current;
  const pulseRingOpacity = useRef(new Animated.Value(0.15)).current;
  const nextButtonOpacity = useRef(new Animated.Value(0)).current;

  // Completion (dismiss mode) animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const msgOpacity = useRef(new Animated.Value(0)).current;

  // Name overlay animation
  const nameOverlayOpacity = useRef(new Animated.Value(0)).current;

  // ─── Scan line animation ───
  useEffect(() => {
    if (scanned || pendingData) return;

    const scanAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scanLinePos, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(scanLineOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        // Fade in at top
        Animated.timing(scanLineOpacity, {
          toValue: 1,
          duration: 2400 * 0.08,
          useNativeDriver: true,
        }),
        // Move down
        Animated.timing(scanLinePos, {
          toValue: 1,
          duration: 2400 * 0.80,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Fade out at bottom
        Animated.timing(scanLineOpacity, {
          toValue: 0,
          duration: 2400 * 0.07,
          useNativeDriver: true,
        }),
        // Small pause
        Animated.delay(2400 * 0.05),
      ])
    );
    scanAnim.start();
    return () => scanAnim.stop();
  }, [scanned, pendingData]);

  // ─── Corner pulse animation ───
  useEffect(() => {
    if (scanned || pendingData) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cornerPulse, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scanned, pendingData]);

  // ─── Fade in on mount ───
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      completionTimers.current.forEach(clearTimeout);
      completionTimers.current = [];
    };
  }, []);

  // ─── Register-mode auto-return (timeout 20s if user does nothing) ───
  useEffect(() => {
    if (mode !== 'register') return;
    const t = setTimeout(() => {
      // Only return if the user hasn't already scanned / advanced to name overlay
      if (!scanned && !pendingData && !showNameOverlay) {
        router.back();
      }
    }, 20000);
    return () => clearTimeout(t);
  }, [mode, scanned, pendingData, showNameOverlay]);

  // ─── Dismiss countdown ───
  useEffect(() => {
    if (mode !== 'dismiss') return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!dismissedRef.current) {
            router.replace({
              pathname: '/ringing',
              params: { alarmId: alarmId || '' },
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  // ─── Success animation (register mode) ───
  const playRegisterSuccessAnimation = useCallback(() => {
    // Success circle spring
    Animated.spring(successScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse ring loop
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseRingScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseRingScale, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseRingOpacity, { toValue: 0.15, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseRingOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    );
    pulseLoop.start();

    // Next button fade in
    Animated.timing(nextButtonOpacity, {
      toValue: 1,
      duration: 400,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // ─── Dismiss completion animation ───
  const playCompletionAnimation = useCallback(() => {
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

    completionTimers.current.push(setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.timing(msgOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 500));

    completionTimers.current.push(setTimeout(() => {
      router.replace('/ad-completion');
    }, 3000));
  }, []);

  // ─── Barcode handler ───
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || pendingData) return;

    const now = Date.now();
    if (data === lastScannedRef.current && now - lastScannedTimeRef.current < 500) return;
    lastScannedRef.current = data;
    lastScannedTimeRef.current = now;

    if (mode === 'register') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Classify scanned code: 'qr' = 2D QR, anything else (ean13/ean8/upc_a/code128) = 1D barcode.
      setPendingKind(type === 'qr' ? 'qr' : 'barcode');
      setPendingData(data);
      setScanned(true);
      setStatusText('スキャン成功！');
      playRegisterSuccessAnimation();
      // Auto-advance to name overlay so the user doesn't need to tap "次へ"
      completionTimers.current.push(setTimeout(() => {
        handleProceedToName();
      }, 900));
    } else {
      // Dismiss mode
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
        Animated.sequence([
          Animated.timing(scanScale, { toValue: 1.12, duration: 150, useNativeDriver: true }),
          Animated.timing(scanScale, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
        dismissedRef.current = true;
        setDismissed(true);
        if (timerRef.current) clearInterval(timerRef.current);
        await stopAlarm();
        const snoozeCount = alarmId ? await getSnoozeCount(alarmId) : 0;
        if (alarmId) {
          await resetSnoozeCount(alarmId);
          await clearSnoozeTime(alarmId);
          await cancelAlarm(alarmId);
          const alarms = await getAlarms();
          const dismissedAlarm = alarms.find(a => a.id === alarmId);
          if (dismissedAlarm && dismissedAlarm.repeatDays.length === 0) {
            dismissedAlarm.enabled = false;
            await saveAlarm(dismissedAlarm);
          }
        }
        const streak = await recordDismiss();
        const msgs = t.dismissMessages;
        let msg: string;
        if (snoozeCount === 0 && Math.random() < 0.3) {
          const pool = msgs.noSnooze;
          msg = pool[Math.floor(Math.random() * pool.length)];
        } else if (streak >= 2 && Math.random() < 0.5) {
          const streakMsgs = msgs.streak(streak);
          msg = streakMsgs[Math.floor(Math.random() * streakMsgs.length)];
        } else if (snoozeCount >= 2) {
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
        completionTimers.current.push(setTimeout(() => {
          if (!dismissedRef.current) setStatusText(t.scan.dismissPrompt);
        }, 400));
      }
    }
  };

  // ─── Proceed to name screen (register) ───
  const handleProceedToName = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowNameOverlay(true);
    Animated.timing(nameOverlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ─── Save name ───
  const handleSaveName = async () => {
    if (!pendingData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newQR: RegisteredQR = {
      id: `qr_${Date.now()}`,
      name: qrName.trim() || (pendingKind === 'barcode' ? 'バーコード' : 'QR'),
      data: pendingData,
      kind: pendingKind,
    };
    await saveRegisteredQRItem(newQR);
    setStatusText(t.scan.registered);
    completionTimers.current.push(setTimeout(() => router.back(), 800));
  };

  // ─── Select suggestion chip ───
  const handleSelectSuggestion = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQrName(name);
  };

  const progress = mode === 'dismiss' ? Math.max(0, 1 - countdown / 20) : 0;

  // ─── Permission: checking ───
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permMessage}>{t.scan.cameraChecking}</Text>
      </View>
    );
  }

  // ─── Permission: not granted ───
  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain ?? true;

    return (
      <View style={styles.container}>
        <View style={styles.permCard}>
          <Ionicons name="camera-outline" size={48} color={C.ink3} />

          {canAskAgain ? (
            <>
              <Text style={styles.permMessage}>{t.scan.cameraRequired}</Text>
              <Text style={styles.permHint}>{t.scan.cameraAllowHint}</Text>
              <TouchableOpacity
                style={styles.permPrimaryBtn}
                onPress={requestPermission}
                activeOpacity={0.7}
              >
                <Text style={styles.permPrimaryBtnText}>{t.scan.allowCamera}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.permMessage}>{t.scan.cameraBlocked}</Text>
              <Text style={styles.permHint}>{t.scan.cameraBlockedHint}</Text>
              <TouchableOpacity
                style={styles.permPrimaryBtn}
                onPress={() => Linking.openSettings()}
                activeOpacity={0.7}
              >
                <Text style={styles.permPrimaryBtnText}>{t.scan.openPrivacySettings}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.permSecondaryBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.permSecondaryBtnText}>{t.scan.backToHome}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Name input overlay (register mode, after "next" tap) ───
  if (showNameOverlay) {
    const isBarcode = pendingKind === 'barcode';
    return (
      <Animated.View style={[styles.nameScreen, { backgroundColor: D.bg, opacity: nameOverlayOpacity }]}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navBack}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNameOverlay(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.navBackArrow, { color: D.ink2 }]}>{'\u2039'}</Text>
            <Text style={[styles.navBackLabel, { color: D.ink2 }]}>戻る</Text>
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: D.ink }]}>名前をつける</Text>
          <View style={{ width: 56 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success card */}
          <View style={[styles.nameSuccessCard, { backgroundColor: D.surface, borderColor: D.line }]}>
            {/* Success badge */}
            <View style={styles.nameSuccessBadge}>
              <View style={styles.nameCheckCircle}>
                <Ionicons name="checkmark" size={14} color={C.green} />
              </View>
              <Text style={styles.nameSuccessLabel}>スキャン成功</Text>
            </View>

            {/* QR / barcode preview */}
            <View style={[styles.nameQrPreview, { backgroundColor: D.surfaceAlt, borderColor: D.line }]}>
              <Ionicons
                name={isBarcode ? 'barcode-outline' : 'qr-code-outline'}
                size={36}
                color={D.ink}
              />
            </View>
            <Text style={[styles.nameQrHint, { color: D.ink3 }]}>
              {isBarcode ? 'バーコード · 認識済み' : 'QR · 認識済み'}
            </Text>
            {isBarcode && pendingData && (
              <Text style={[styles.nameQrHint, { color: D.ink2, marginTop: -6 }]} numberOfLines={1}>
                {pendingData}
              </Text>
            )}
          </View>

          {/* Name input */}
          <View style={styles.nameInputSection}>
            <Text style={[styles.nameInputLabel, { color: D.ink3 }]}>名前</Text>
            <View style={[
              styles.nameInputField,
              { backgroundColor: D.surface },
              nameFocused && styles.nameInputFieldFocused,
            ]}>
              <TextInput
                style={[styles.nameInputText, { color: D.ink }]}
                value={qrName}
                onChangeText={setQrName}
                placeholder={t.scan.namePlaceholder}
                placeholderTextColor={D.ink3}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

          {/* Suggestion chips */}
          <View style={styles.nameSuggestSection}>
            <Text style={[styles.nameInputLabel, { color: D.ink3 }]}>候補（タップで入力）</Text>
            <View style={styles.nameSuggestWrap}>
              {LOCATION_SUGGESTIONS.map((place) => {
                const isSelected = qrName === place;
                return (
                  <TouchableOpacity
                    key={place}
                    style={[
                      styles.nameSuggestChip,
                      { backgroundColor: D.surfaceAlt, borderColor: D.line },
                      isSelected && styles.nameSuggestChipSelected,
                    ]}
                    onPress={() => handleSelectSuggestion(place)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.nameSuggestChipText,
                      { color: D.ink2 },
                      isSelected && styles.nameSuggestChipTextSelected,
                    ]}>
                      {place}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save CTA */}
          <View style={styles.nameSaveSection}>
            <TouchableOpacity
              style={styles.nameSaveBtn}
              onPress={handleSaveName}
              activeOpacity={0.7}
            >
              <Text style={styles.nameSaveBtnText}>このコードを保存</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ─── Main scan screen ───
  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        zoom={0.02}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES_FULL] }}
        onBarcodeScanned={(scanned || pendingData) ? undefined : handleBarCodeScanned}
      >
        {/* Dark overlay + viewfinder */}
        <View style={styles.cameraOverlay}>
          {/* Nav bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navBack}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.navBackArrow}>{'\u2039'}</Text>
              <Text style={[styles.navBackLabel, { color: 'rgba(255,255,255,0.6)' }]}>戻る</Text>
            </TouchableOpacity>
            <Text style={[styles.navTitle, { color: C.white }]}>コードをスキャン</Text>
            <View style={{ width: 56 }}>
              {/* Torch toggle */}
              <TouchableOpacity
                style={[styles.torchBtn, torch && styles.torchBtnActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTorch(!torch); }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={torch ? 'flash' : 'flash-outline'}
                  size={18}
                  color={torch ? C.dark : 'rgba(255,255,255,0.7)'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Instructions */}
          <Text style={[
            styles.instructions,
            scanned && { color: C.orange, fontWeight: '700' },
          ]}>
            {scanned ? 'スキャン成功！' : 'バーコードまたはQRコードを枠内に合わせてください'}
          </Text>

          {/* Viewfinder area */}
          <View style={styles.viewfinderArea}>
            <Animated.View style={[styles.scanFrame, { transform: [{ scale: scanScale }] }]}>
              {/* Transparent cutout background */}
              <View style={styles.scanFrameInner} />

              {/* Corner brackets */}
              <Animated.View style={[styles.corner, styles.cTL, { opacity: scanned ? 1 : cornerPulse }]} />
              <Animated.View style={[styles.corner, styles.cTR, { opacity: scanned ? 1 : cornerPulse }]} />
              <Animated.View style={[styles.corner, styles.cBL, { opacity: scanned ? 1 : cornerPulse }]} />
              <Animated.View style={[styles.corner, styles.cBR, { opacity: scanned ? 1 : cornerPulse }]} />

              {/* Scan line */}
              {!scanned && (
                <Animated.View style={[
                  styles.scanLine,
                  {
                    opacity: scanLineOpacity,
                    transform: [{
                      translateY: scanLinePos.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SCAN_FRAME_SIZE * 0.08, SCAN_FRAME_SIZE * 0.88],
                      }),
                    }],
                  },
                ]} />
              )}

              {/* Success overlay */}
              {scanned && pendingData && (
                <View style={styles.successCenter}>
                  {/* Pulse ring */}
                  <Animated.View style={[styles.pulseRing, {
                    transform: [{ scale: pulseRingScale }],
                    opacity: pulseRingOpacity,
                  }]} />
                  {/* Checkmark circle */}
                  <Animated.View style={[styles.successCircle, {
                    transform: [{ scale: successScale }],
                    opacity: successOpacity,
                  }]}>
                    <Ionicons name="checkmark" size={34} color={C.white} />
                  </Animated.View>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            {scanned && pendingData ? (
              <Animated.View style={{ opacity: nextButtonOpacity }}>
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={handleProceedToName}
                  activeOpacity={0.7}
                >
                  <Text style={styles.nextBtnText}>次へ → 名前をつける</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : !scanned && mode === 'register' ? (
              <View style={styles.hintPill}>
                <Ionicons name="add" size={16} color="rgba(255,255,255,0.5)" />
                <Text style={styles.hintPillText}>市販品のバーコードでもOK</Text>
              </View>
            ) : null}

            {/* Dismiss mode: status + countdown */}
            {mode === 'dismiss' && !dismissed && (
              <View style={styles.dismissStatusSection}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{statusText}</Text>
                </View>
                {countdown > 0 && (
                  <View style={styles.countdownSection}>
                    <View style={styles.progressTrack}>
                      <View style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` as any },
                        progress > 0.7 && { backgroundColor: C.error },
                      ]} />
                    </View>
                    <Text style={[
                      styles.countdownText,
                      progress > 0.7 && { color: C.error },
                    ]}>
                      {t.scan.countdown(countdown)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </CameraView>

      {/* Completion overlay (dismiss mode) */}
      {dismissed && celebrationMsg && (
        <View style={styles.completionOverlay}>
          <Animated.View style={[styles.completionCheck, {
            transform: [{ scale: checkScale }],
            opacity: checkOpacity,
          }]}>
            <Ionicons name="checkmark" size={64} color={C.white} />
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
    </Animated.View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.dark,
  },

  // ─── Nav bar ───
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 0,
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 56,
  },
  navBackArrow: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  navBackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.white,
    letterSpacing: -0.3,
  },

  // ─── Camera overlay ───
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  // ─── Instructions ───
  instructions: {
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 21,
    fontWeight: '400',
  },

  // ─── Viewfinder ───
  viewfinderArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
  },
  scanFrameInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },

  // ─── Corner brackets ───
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: C.orange,
  },
  cTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_STROKE,
    borderLeftWidth: CORNER_STROKE,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  cTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_STROKE,
    borderRightWidth: CORNER_STROKE,
    borderTopRightRadius: CORNER_RADIUS,
  },
  cBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_STROKE,
    borderLeftWidth: CORNER_STROKE,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  cBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_STROKE,
    borderRightWidth: CORNER_STROKE,
    borderBottomRightRadius: CORNER_RADIUS,
  },

  // ─── Scan line ───
  scanLine: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: C.orange,
    borderRadius: 2,
    // Glow shadow
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 4,
  },

  // ─── Success (register scan complete) ───
  successCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.orange,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // ─── Bottom ───
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 36,
    alignItems: 'center',
  },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: C.orange,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
    elevation: 6,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  hintPillText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  // ─── Torch ───
  torchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  torchBtnActive: {
    backgroundColor: C.orange,
  },

  // ─── Dismiss mode status ───
  dismissStatusSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.ink3,
  },
  statusText: {
    fontSize: 14,
    color: C.white,
  },

  countdownSection: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: C.orange,
  },
  countdownText: {
    fontSize: 12,
    color: C.ink3,
    fontWeight: '500',
  },

  // ─── Completion overlay (dismiss) ───
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 120, 69, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  completionCheck: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.white,
  },
  completionMsg: {
    fontSize: 22,
    fontWeight: '700',
    color: C.white,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
  },
  completionTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 20,
  },

  // ─── Permission screens ───
  permMessage: {
    fontSize: 16,
    color: C.ink3,
    textAlign: 'center',
    marginBottom: 20,
  },
  permCard: {
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  permHint: {
    fontSize: 14,
    color: C.ink3,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permPrimaryBtn: {
    width: '100%',
    backgroundColor: C.orange,
    paddingVertical: 20,
    borderRadius: 999,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  permPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.white,
  },
  permSecondaryBtn: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 999,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.ink2,
  },
  permSecondaryBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: C.ink2,
  },

  // ─── Name screen (light palette) ───
  nameScreen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  nameSuccessCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  nameSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.greenDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSuccessLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.green,
  },
  nameQrPreview: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameQrHint: {
    fontSize: 11,
    color: C.ink3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },

  // Name input
  nameInputSection: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  nameInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: C.ink3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nameInputField: {
    height: 52,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.orange,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  nameInputFieldFocused: {
    borderColor: C.orange,
  },
  nameInputText: {
    fontSize: 16,
    fontWeight: '500',
    color: C.ink,
  },

  // Suggestion chips
  nameSuggestSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  nameSuggestWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nameSuggestChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.line,
  },
  nameSuggestChipSelected: {
    backgroundColor: C.orangeDim,
    borderColor: C.orange,
  },
  nameSuggestChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.ink2,
  },
  nameSuggestChipTextSelected: {
    color: C.orange,
  },

  // Save button
  nameSaveSection: {
    marginHorizontal: 20,
  },
  nameSaveBtn: {
    backgroundColor: C.orange,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  nameSaveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
