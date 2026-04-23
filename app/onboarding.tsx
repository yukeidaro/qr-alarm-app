import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  Linking,
  AppState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { useCameraPermissions } from 'expo-camera';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { ACTIVE_OPACITY } from '../constants/spacing';
import { createAlarm, saveAlarm } from '../services/storageService';
import { scheduleAlarm } from '../services/alarmService';

// ─── Color Palette (Light theme) ───
const C = {
  bg: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8F9',
  line: '#E5E5E7',
  lineSoft: '#EDEDEF',
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#A1A1AA',
  ink4: '#D4D4D8',
  orange: '#F85A3E',
  orangeDim: '#FDE9E4',
  orangeGlow: 'rgba(248,90,62,0.22)',
  pickerBg: '#D9D9DC',
} as const;

// ─── Font Tokens (Inter family) ───
const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const ONBOARDING_KEY = '@qralarm/onboarding_done';
const NAME_KEY = '@qralarm/user_name';

type Step = 'splash' | 'value1' | 'value2' | 'permissions' | 'firstAlarm' | 'ready';

const ALL_STEPS: Step[] = ['splash', 'value1', 'value2', 'permissions', 'firstAlarm', 'ready'];

// ─────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────

/** Progress dots */
function Dots({ current, total }: { current: number; total: number }) {
  return (
    <View style={s.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            i === current ? s.dotActive : null,
          ]}
        />
      ))}
    </View>
  );
}

/** Orange pill CTA */
function PillCTA({
  label,
  onPress,
  ghost = false,
}: {
  label: string;
  onPress: () => void;
  ghost?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.pill, ghost && s.pillGhost]}
      onPress={onPress}
      activeOpacity={ACTIVE_OPACITY.default}
    >
      <Text style={[s.pillText, ghost && s.pillGhostText]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Skip link */
function SkipLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={ACTIVE_OPACITY.default}>
      <Text style={s.skipText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// Illustrations
// ─────────────────────────────────────────────

/** App icon: orange square with clock + QR finder */
function AppIcon() {
  return (
    <View style={s.appIconWrap}>
      <View style={s.appIconOuter}>
        <Svg width={48} height={48} viewBox="0 0 48 48">
          {/* Clock circle */}
          <Circle cx={24} cy={22} r={14} stroke="#FFF" strokeWidth={2.5} fill="none" />
          {/* Hour hand */}
          <Line x1={24} y1={22} x2={24} y2={14} stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" />
          {/* Minute hand */}
          <Line x1={24} y1={22} x2={30} y2={22} stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" />
          {/* QR finder — top-left */}
          <Path d="M6 14 L6 6 L14 6" stroke="#FFF" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* QR finder — top-right */}
          <Path d="M34 6 L42 6 L42 14" stroke="#FFF" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* QR finder — bottom-left */}
          <Path d="M6 34 L6 42 L14 42" stroke="#FFF" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* QR finder — bottom-right */}
          <Path d="M34 42 L42 42 L42 34" stroke="#FFF" strokeWidth={2} fill="none" strokeLinecap="round" />
        </Svg>
      </View>
    </View>
  );
}

const VALUE1_MEDIA = require('../assets/onboarding/wake-up-card.png');
const VALUE2_MEDIA = require('../assets/onboarding/scan-dismiss-card.png');

function OnboardingMediaCard({
  source,
  label,
}: {
  source: ImageSourcePropType;
  label: string;
}) {
  return (
    <View style={s.illustrationCard}>
      <Image
        source={source}
        style={s.illustrationImage}
        resizeMode="cover"
        accessibilityLabel={label}
      />
    </View>
  );
}

/** Permission toggle switch */
function ToggleSwitch({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.toggle, on && s.toggleOn]}
    >
      <View style={[s.toggleThumb, on && s.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

/** First Alarm — static fisheye time picker (matching design spec) */
function FisheyeTimePicker({ onConfirm, onClose }: { onConfirm?: () => void; onClose?: () => void }) {
  // 9 numbers per column, center at index 4
  const hourCenter = 7; // shows 03..07..11
  const minuteCenter = 45; // shows 41..45..49
  const COUNT = 9;

  // Font size / opacity profile matching design spec
  const sizes =   [24, 32, 44, 56, 76, 56, 44, 32, 24];
  const alphas =  [0.15, 0.25, 0.40, 0.65, 1, 0.65, 0.40, 0.25, 0.15];

  const renderColumn = (center: number, pad: boolean = false) => (
    <View style={s.pickerColumn}>
      {Array.from({ length: COUNT }).map((_, i) => {
        const val = center + (i - 4);
        const fontSize = sizes[i];
        const opacity = alphas[i];
        const isCenter = i === 4;
        const label = pad ? String(val).padStart(2, '0') : String(val);
        return (
          <Text
            key={i}
            style={[
              s.pickerNumber,
              {
                fontSize,
                opacity,
                lineHeight: fontSize + 8,
                fontFamily: isCenter ? F.bold : F.semiBold,
                letterSpacing: isCenter ? -2 : -1,
              },
            ]}
          >
            {label}
          </Text>
        );
      })}
    </View>
  );

  return (
    <View style={s.pickerContainer}>
      <View style={s.pickerInner}>
        {/* Hours */}
        {renderColumn(hourCenter)}

        {/* )( SVG bezier curves */}
        <View style={s.pickerCurvesWrap}>
          <Svg width={50} height={340} viewBox="0 0 50 340">
            {/* ) curve — bows right */}
            <Path
              d="M5 0 C28 113 28 227 5 340"
              stroke={C.orange}
              strokeWidth={2}
              fill="none"
              opacity={0.65}
            />
            {/* ( curve — bows left */}
            <Path
              d="M45 0 C22 113 22 227 45 340"
              stroke={C.orange}
              strokeWidth={2}
              fill="none"
              opacity={0.65}
            />
          </Svg>
        </View>

        {/* Minutes */}
        {renderColumn(minuteCenter, true)}
      </View>

      {/* Action icons row — Sound / Snooze / Repeat / QR */}
      <View style={s.pickerActionsRow}>
        <View style={s.pickerAction}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M9 18V6l10-2v12" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={6} cy={18} r={3} stroke={C.ink} strokeWidth={2} fill="none" />
            <Circle cx={16} cy={16} r={3} stroke={C.ink} strokeWidth={2} fill="none" />
          </Svg>
          <Text style={s.pickerActionLabel}>Sound</Text>
        </View>
        <View style={s.pickerAction}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Circle cx={12} cy={13} r={8} stroke={C.ink} strokeWidth={2} fill="none" />
            <Path d="M12 9v4l3 2" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M4 5l3-2M20 5l-3-2" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
          </Svg>
          <Text style={s.pickerActionLabel}>Snooze</Text>
        </View>
        <View style={s.pickerAction}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M4 7h13l-3-3M20 17H7l3 3" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={s.pickerActionLabel}>Repeat</Text>
        </View>
        {/* QR code action — required, highlighted in orange */}
        <View style={s.pickerAction}>
          <View style={{ position: 'relative' }}>
            {/* Required dot badge */}
            <View style={s.pickerQrBadge} />
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Rect x={2} y={2} width={8} height={8} rx={1.5} stroke={C.orange} strokeWidth={2} fill="none" />
              <Rect x={14} y={2} width={8} height={8} rx={1.5} stroke={C.orange} strokeWidth={2} fill="none" />
              <Rect x={2} y={14} width={8} height={8} rx={1.5} stroke={C.orange} strokeWidth={2} fill="none" />
              <Rect x={4.5} y={4.5} width={3} height={3} rx={0.5} fill={C.orange} />
              <Rect x={16.5} y={4.5} width={3} height={3} rx={0.5} fill={C.orange} />
              <Rect x={4.5} y={16.5} width={3} height={3} rx={0.5} fill={C.orange} />
              <Rect x={16.5} y={16.5} width={2} height={2} rx={0.4} fill={C.orange} />
              <Rect x={20.5} y={16.5} width={2} height={2} rx={0.4} fill={C.orange} />
              <Rect x={16.5} y={20.5} width={2} height={2} rx={0.4} fill={C.orange} />
            </Svg>
          </View>
          <Text style={[s.pickerActionLabel, { color: C.orange, fontFamily: F.bold }]}>
            {'\u30B3\u30FC\u30C9\u8A2D\u5B9A'}
          </Text>
        </View>
      </View>

      {/* QR warning banner */}
      <View style={s.pickerWarning}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Circle cx={7} cy={7} r={6} stroke={C.orange} strokeWidth={1.4} fill="none" />
          <Path d="M7 4v3.5M7 9.5v.5" stroke={C.orange} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={s.pickerWarningText}>
          QR{'\u30B3\u30FC\u30C9\u3092\u8A2D\u5B9A\u3057\u306A\u3044\u3068\u30A2\u30E9\u30FC\u30E0\u306F\u6A5F\u80FD\u3057\u307E\u305B\u3093'}
        </Text>
      </View>

      {/* Footer bar — X / Choose time / checkmark */}
      <View style={s.pickerFooter}>
        <TouchableOpacity
          style={s.pickerFooterClose}
          onPress={onClose}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Line x1={3} y1={3} x2={15} y2={15} stroke={C.ink2} strokeWidth={2} strokeLinecap="round" />
            <Line x1={15} y1={3} x2={3} y2={15} stroke={C.ink2} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={s.pickerFooterLabel}>Choose time</Text>
        <TouchableOpacity
          style={s.pickerFooterCheck}
          onPress={onConfirm}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M3 9l4 4 8-9" stroke="#FFF" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('splash');
  const [notifGranted, setNotifGranted] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraGranted = cameraPermission?.granted ?? false;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    setTimeout(() => animateIn(), 100);
    // Check existing notification permission
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status === 'granted') setNotifGranted(true);
    });

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        Notifications.getPermissionsAsync().then(({ status }) => {
          if (status === 'granted') setNotifGranted(true);
        });
      }
    });
    return () => subscription.remove();
  }, []);

  // Auto-request notifications when entering permissions step
  useEffect(() => {
    if (step !== 'permissions') return;
    const autoRequest = async () => {
      try {
        const { status: current } = await Notifications.getPermissionsAsync();
        if (current === 'granted') {
          setNotifGranted(true);
          return;
        }
        setTimeout(async () => {
          try {
            const { status } = await Notifications.requestPermissionsAsync();
            setNotifGranted(status === 'granted');
          } catch {}
        }, 600);
      } catch {}
    };
    autoRequest();
  }, [step]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const goToStep = (next: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
      setTimeout(() => animateIn(), 50);
    });
  };

  const handleRequestNotifications = async () => {
    try {
      const { status: currentStatus } = await Notifications.getPermissionsAsync();
      if (currentStatus === 'granted') {
        setNotifGranted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      if (currentStatus === 'undetermined') {
        const { status } = await Notifications.requestPermissionsAsync();
        const granted = status === 'granted';
        setNotifGranted(granted);
        Haptics.notificationAsync(
          granted ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
        );
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        Linking.openSettings();
      }
    } catch {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotifGranted(status === 'granted');
      } catch {
        if (Platform.OS === 'ios') {
          Linking.openURL('app-settings:');
        } else {
          Linking.openSettings();
        }
      }
    }
  };

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  const stepIndex = ALL_STEPS.indexOf(step);

  // Determine dot count per screen
  const getDots = (): { total: number; active: number } | null => {
    if (step === 'splash') return { total: 3, active: 0 };
    if (step === 'value1') return { total: 4, active: 0 };
    if (step === 'value2') return { total: 4, active: 1 };
    if (step === 'permissions') return { total: 4, active: 2 };
    if (step === 'firstAlarm') return { total: 4, active: 3 };
    return null; // ready has no dots
  };
  const dots = getDots();

  // ─── Render each step ───

  const renderSplash = () => (
    <Animated.View style={[s.center, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <AppIcon />
        <Text style={s.splashTitle}>ScanAlarm</Text>
        <Text style={s.splashSub}>Wake up. For real.</Text>
      </View>
      <View style={s.bottomArea}>
        {dots && <Dots current={dots.active} total={dots.total} />}
        <PillCTA label="Get started" onPress={() => goToStep('value1')} />
      </View>
    </Animated.View>
  );

  const renderValue1 = () => (
    <Animated.View style={[s.stepWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <OnboardingMediaCard source={VALUE1_MEDIA} label="Wake up onboarding card" />
      <View style={[s.copyBlock, s.valueCopyBlock]}>
        <Text style={[s.heading, s.valueHeading]}>Wake up. For real.</Text>
        <Text style={[s.body, s.valueBody]}>
          This alarm won't stop until you scan a barcode. Place it somewhere
          you have to walk to — you'll never oversleep again.
        </Text>
      </View>
      <View style={s.bottomArea}>
        {dots && <Dots current={dots.active} total={dots.total} />}
        <PillCTA label="Continue" onPress={() => goToStep('value2')} />
        <SkipLink label="Skip" onPress={() => goToStep('permissions')} />
      </View>
    </Animated.View>
  );

  const renderValue2 = () => (
    <Animated.View style={[s.stepWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <OnboardingMediaCard source={VALUE2_MEDIA} label="Scan to dismiss onboarding card" />
      <View style={[s.copyBlock, s.valueCopyBlock]}>
        <Text style={[s.heading, s.valueHeading]}>Scan to dismiss</Text>
        <Text style={[s.body, s.valueBody]}>
          Any barcode works — the one on your toothpaste, a cereal box, or a
          water bottle. No special QR code needed.
        </Text>
      </View>
      <View style={s.bottomArea}>
        {dots && <Dots current={dots.active} total={dots.total} />}
        <PillCTA label="Continue" onPress={() => goToStep('permissions')} />
        <SkipLink label="Skip" onPress={() => goToStep('permissions')} />
      </View>
    </Animated.View>
  );

  const renderPermissions = () => (
    <Animated.View style={[s.stepWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={s.copyBlock}>
        <Text style={s.heading}>A couple permissions</Text>
        <Text style={s.body}>
          So alarms can ring and you can scan QR codes.
        </Text>
      </View>

      {/* Notification permission card */}
      <View style={s.permCard}>
        <View style={s.permLeft}>
          <View style={s.permIcon}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                stroke={C.orange}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={s.permText}>
            <Text style={s.permTitle}>Notifications</Text>
            <Text style={s.permDesc}>Required for alarm to sound on time.</Text>
          </View>
        </View>
        <ToggleSwitch on={notifGranted} onPress={handleRequestNotifications} />
      </View>

      {/* Camera permission card */}
      <View style={s.permCard}>
        <View style={s.permLeft}>
          <View style={s.permIcon}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                stroke={C.orange}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={12} cy={13} r={4} stroke={C.orange} strokeWidth={2} fill="none" />
            </Svg>
          </View>
          <View style={s.permText}>
            <Text style={s.permTitle}>Camera</Text>
            <Text style={s.permDesc}>Needed to scan barcodes and QR codes.</Text>
          </View>
        </View>
        <ToggleSwitch
          on={cameraGranted}
          onPress={async () => {
            if (cameraGranted) return;
            try {
              const result = await requestCameraPermission();
              Haptics.notificationAsync(
                result.granted
                  ? Haptics.NotificationFeedbackType.Success
                  : Haptics.NotificationFeedbackType.Warning
              );
              // If denied and can't ask again, open settings
              if (!result.granted && !result.canAskAgain) {
                Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();
              }
            } catch {
              // Silently fail
            }
          }}
        />
      </View>

      <View style={s.bottomArea}>
        {dots && <Dots current={dots.active} total={dots.total} />}
        <PillCTA
          label="Allow & Continue"
          onPress={() => goToStep('firstAlarm')}
        />
        <SkipLink label="Not now" onPress={() => goToStep('firstAlarm')} />
      </View>
    </Animated.View>
  );

  const renderFirstAlarm = () => (
    <Animated.View style={[s.firstAlarmWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <FisheyeTimePicker
        onClose={() => goToStep('ready')}
        onConfirm={async () => {
          try {
            const alarm = createAlarm();
            alarm.hour = 7;
            alarm.minute = 45;
            alarm.enabled = true;
            alarm.repeatDays = [1, 2, 3, 4, 5]; // Mon-Fri
            await saveAlarm(alarm);
            await scheduleAlarm(alarm);
          } catch {}
          goToStep('ready');
        }}
      />
    </Animated.View>
  );

  const renderReady = () => (
    <Animated.View style={[s.center, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Triple-glow checkmark circle */}
        <View style={s.readyGlow3}>
          <View style={s.readyGlow2}>
            <View style={s.readyGlow1}>
              <View style={s.readyCircle}>
                <Svg width={44} height={44} viewBox="0 0 24 24">
                  <Path
                    d="M5 12l5 5L19 7"
                    stroke="#FFF"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
          </View>
        </View>
        <Text style={s.readyTitle}>You're all set</Text>
        <Text style={s.readyBody}>
          Your first alarm is ready for tomorrow at 7:45 AM.{'\n'}Sweet dreams.
        </Text>
      </View>
      <View style={s.bottomArea}>
        <PillCTA label="Let's go \u2192" onPress={handleFinish} />
      </View>
    </Animated.View>
  );

  return (
    <View style={[s.screen, step === 'firstAlarm' && { backgroundColor: C.pickerBg }]}>
      <StatusBar style="dark" />
      {step === 'splash' && renderSplash()}
      {step === 'value1' && renderValue1()}
      {step === 'value2' && renderValue2()}
      {step === 'permissions' && renderPermissions()}
      {step === 'firstAlarm' && renderFirstAlarm()}
      {step === 'ready' && renderReady()}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Layout wrappers
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 48,
  },
  stepWrap: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 48,
  },
  firstAlarmWrap: {
    flex: 1,
    paddingTop: 54,
  },

  // ─── Dots ───
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.ink4,
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.orange,
  },

  // ─── Pill CTA ───
  pill: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  pillText: {
    fontSize: 17,
    fontFamily: F.semiBold,
    color: '#FFF',
  },
  pillGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.line,
    shadowOpacity: 0,
    elevation: 0,
  },
  pillGhostText: {
    color: C.ink2,
  },

  // ─── Skip ───
  skipText: {
    fontSize: 14,
    fontFamily: F.medium,
    color: C.ink3,
    marginTop: 16,
  },

  // ─── Bottom area ───
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },

  // ─── Splash ───
  appIconWrap: {
    marginBottom: 24,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  appIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 22,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 28,
    fontFamily: F.bold,
    color: C.ink,
    marginBottom: 6,
  },
  splashSub: {
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink3,
  },

  // ─── Value props ───
  illustrationCard: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 350 / 220,
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  copyBlock: {
    marginBottom: 32,
  },
  valueCopyBlock: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 28,
  },
  heading: {
    fontSize: 28,
    fontFamily: F.bold,
    color: C.ink,
    marginBottom: 10,
  },
  valueHeading: {
    textAlign: 'left',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    fontFamily: F.regular,
    color: C.ink2,
    lineHeight: 22,
  },
  valueBody: {
    textAlign: 'left',
  },

  // ─── Permissions ───
  permCard: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.orangeDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  permText: {
    flex: 1,
  },
  permTitle: {
    fontSize: 15,
    fontFamily: F.semiBold,
    color: C.ink,
    marginBottom: 2,
  },
  permDesc: {
    fontSize: 13,
    fontFamily: F.regular,
    color: C.ink3,
    lineHeight: 17,
  },

  // Toggle
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.ink4,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: C.orange,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },

  // ─── Time Picker ───
  pickerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
  },
  pickerNumber: {
    color: C.ink,
    textAlign: 'center',
  },
  pickerCurvesWrap: {
    width: 50,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(24,24,27,0.08)',
    paddingTop: 20,
  },
  pickerAction: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pickerActionLabel: {
    fontSize: 13,
    fontFamily: F.semiBold,
    color: C.ink,
    letterSpacing: -0.2,
  },
  pickerQrBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
    zIndex: 1,
  },
  pickerWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: C.orangeDim,
    borderWidth: 1,
    borderColor: 'rgba(248,90,62,0.2)',
  },
  pickerWarningText: {
    fontSize: 12,
    fontFamily: F.semiBold,
    color: '#7A2512',
    flex: 1,
  },
  pickerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  pickerFooterClose: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerFooterLabel: {
    fontSize: 14,
    fontFamily: F.medium,
    color: C.ink2,
    letterSpacing: -0.1,
  },
  pickerFooterCheck: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  // ─── Ready ───
  readyGlow3: {
    borderRadius: 100,
    padding: 18,
    backgroundColor: 'rgba(248,90,62,0.06)',
  },
  readyGlow2: {
    borderRadius: 100,
    padding: 14,
    backgroundColor: 'rgba(248,90,62,0.10)',
  },
  readyGlow1: {
    borderRadius: 100,
    padding: 10,
    backgroundColor: 'rgba(248,90,62,0.16)',
  },
  readyCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  readyTitle: {
    fontSize: 30,
    fontFamily: F.bold,
    color: C.ink,
    marginTop: 32,
    marginBottom: 12,
  },
  readyBody: {
    fontSize: 15,
    fontFamily: F.regular,
    color: C.ink2,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
