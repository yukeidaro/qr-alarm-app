/**
 * Settings — Light grey + orange design
 * Matches design exactly from screens-app.jsx SettingsScreen.
 * Custom SVG icons, custom toggle, no Ionicons.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Linking,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { getSoundLabel } from '../../services/audioService';
import { clearPendingSound, getPendingSound } from '../../services/soundSelectionStore';
import { getRegisteredQRs } from '../../services/storageService';
import { loadSnoozeMinutes, setSnoozeMinutes, type SnoozeIntervalMinutes } from '../../services/snoozeIntervalStore';
import { useTheme } from '../../theme';

/* ─── Design Tokens ─── */
import { useC, type AppPalette, LIGHT_PALETTE } from '../../constants/palette';
const C = LIGHT_PALETTE;

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/* ─── Storage Keys ─── */
const NAME_KEY = '@qralarm/user_name';
const SOUND_OUTPUT_KEY = '@qralarm/sound_output';
const DEFAULT_SOUND_KEY = '@qralarm/default_sound';
const APP_VERSION = '1.0.0';

export type SoundOutputMode = 'device' | 'bluetooth' | 'auto';

/* ─── Sound output label helper ─── */
const soundOutputLabels: Record<SoundOutputMode, string> = {
  device: 'このiPhone',
  bluetooth: 'Bluetooth',
  auto: '自動',
};

/* ─── Custom Toggle (View-based, 44x26 track, 22px knob) ─── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: on ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [on]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.ink4, C.orange],
  });

  const knobLeft = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20], // (26 - 22) / 2 = 2, 44 - 22 - 2 = 20
  });

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(
          on
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium,
        );
        onToggle();
      }}
      activeOpacity={0.8}
    >
      <Animated.View
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          backgroundColor: trackColor,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            left: knobLeft,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#FFFFFF',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              },
              android: { elevation: 2 },
            }),
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ─── Chevron Right SVG ─── */
function ChevronRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path
        d="M1 1l5 5-5 5"
        stroke={C.ink4}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ─── SVG Icon helpers ─── */
function IconPath({ color, d }: { color: string; d: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d={d}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconQR({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Rect x={1} y={1} width={4} height={4} rx={1} stroke={color} strokeWidth={1.2} />
      <Rect x={11} y={1} width={4} height={4} rx={1} stroke={color} strokeWidth={1.2} />
      <Rect x={1} y={11} width={4} height={4} rx={1} stroke={color} strokeWidth={1.2} />
      <Rect x={12.5} y={12.5} width={2} height={2} rx={0.4} fill={color} />
    </Svg>
  );
}

function IconDevice({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Rect x={2} y={4} width={12} height={9} rx={1.5} stroke={color} strokeWidth={1.4} />
      <Path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M8 13v2M5 15h6" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Section component ─── */
function Section({
  title,
  children,
  styles: s,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={s.sectionHeader}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  );
}

/* ─── Row component ─── */
function Row({
  iconBg,
  icon,
  label,
  detail,
  toggle,
  onToggle,
  isLast,
  onPress,
  styles: s,
}: {
  iconBg?: string;
  icon: React.ReactNode;
  label: string;
  detail?: string;
  toggle?: boolean;
  onToggle?: () => void;
  isLast?: boolean;
  onPress?: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const inner = (
    <View
      style={[
        s.row,
        !isLast && s.rowBorder,
      ]}
    >
      <View style={[s.iconBox, iconBg ? { backgroundColor: iconBg } : null]}>
        {icon}
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={s.rowRight}>
        {detail != null && <Text style={s.rowDetail}>{detail}</Text>}
        {toggle !== undefined ? (
          <Toggle on={toggle} onToggle={onToggle ?? (() => {})} />
        ) : (
          <ChevronRight />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

/* ─── Main Screen ─── */
const themeModeLabels: Record<string, string> = {
  light: 'ライト',
  dark: 'ダーク',
  system: 'システム',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  // In dark mode, replace the light pastel icon backgrounds (FDE9E4 / F5E8E8 / E5E5E7)
  // with a neutral surface tone so the icon "tiles" don't appear stark white.
  const notifIconBg = isDark ? C.surfaceAlt : '#FDE9E4';
  const reviewIconBg = isDark ? C.surfaceAlt : '#F5E8E8';
  const grayIconBg = isDark ? C.surfaceAlt : '#E5E5E7';
  const notifIconColor = isDark ? C.orange : '#F85A3E';
  const reviewIconColor = isDark ? C.orange : '#D94F4F';
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [defaultSound, setDefaultSound] = useState('gentle');
  const [qrCount, setQrCount] = useState(0);
  const [soundOutput, setSoundOutput] = useState<SoundOutputMode>('device');
  const [snoozeInterval, setSnoozeInterval] = useState(5);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [themePickerVisible, setThemePickerVisible] = useState(false);

  // Toast
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(toastTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 1500);
  };

  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY).then((v) => v && setName(v));
    AsyncStorage.getItem(DEFAULT_SOUND_KEY).then((v) => v && setDefaultSound(v));
    AsyncStorage.getItem(SOUND_OUTPUT_KEY).then((v) => {
      if (v === 'device' || v === 'bluetooth' || v === 'auto') setSoundOutput(v);
    });
    loadSnoozeMinutes().then(setSnoozeInterval);
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPushEnabled(status === 'granted');
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      getRegisteredQRs().then((qrs) => setQrCount(qrs.length));
      // Re-pull snooze interval in case user edited it on the dedicated screen
      loadSnoozeMinutes().then(setSnoozeInterval);
      AsyncStorage.getItem(SOUND_OUTPUT_KEY).then((v) => {
        if (v === 'device' || v === 'bluetooth' || v === 'auto') setSoundOutput(v);
      });
      const pending = getPendingSound();
      if (pending) {
        AsyncStorage.setItem(DEFAULT_SOUND_KEY, pending);
        setDefaultSound(pending);
        clearPendingSound();
        showToast('Default sound updated');
      }
    }, []),
  );

  const handleSaveName = async () => {
    await AsyncStorage.setItem(NAME_KEY, name);
    setEditingName(false);
    showToast('Saved');
  };

  const handleSelectSoundOutput = async (mode: SoundOutputMode) => {
    setSoundOutput(mode);
    await AsyncStorage.setItem(SOUND_OUTPUT_KEY, mode);
    showToast('Output updated');
  };

  const handleSelectSnoozeInterval = async (minutes: SnoozeIntervalMinutes) => {
    setSnoozeInterval(minutes);
    await setSnoozeMinutes(minutes);
    showToast('Snooze updated');
  };

  const handleManageQR = () => router.push('/qr-manage');
  const handlePickSound = () =>
    router.push({
      pathname: '/sounds',
      params: { currentSoundId: defaultSound, returnTo: '/settings' },
    });

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>設定</Text>

        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => setEditingName(true)}
          activeOpacity={0.6}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {editingName ? (
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
                onSubmitEditing={handleSaveName}
                onBlur={handleSaveName}
                placeholderTextColor={C.ink3}
                placeholder="Your name"
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{name || 'Your Name'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ALARM section */}
        <Section styles={styles} title="アラーム">
          <Row
            styles={styles}
            icon={
              <IconPath
                color={C.orange}
                d="M3 6h2l3-2.5v9L5 10H3V6zM11 5.5a3.2 3.2 0 010 5M13 3.5a6 6 0 010 9"
              />
            }
            label="サウンド"
            detail={getSoundLabel(defaultSound)}
            onPress={handlePickSound}
          />
          <Row
            styles={styles}
            icon={
              <IconPath
                color={C.orange}
                d="M8 2a6 6 0 100 12 6 6 0 000-12zM8 5v3.2l2 1.8"
              />
            }
            label="スヌーズ間隔"
            detail={`${snoozeInterval}分`}
            onPress={() => router.push('/snooze-interval')}
          />
          <Row
            styles={styles}
            icon={<IconQR color={C.orange} />}
            label="QR・バーコード管理"
            isLast
            onPress={handleManageQR}
          />
        </Section>

        {/* NOTIFICATIONS section */}
        <Section styles={styles} title="通知・表示">
          <Row
            styles={styles}
            iconBg={notifIconBg}
            icon={
              <IconPath
                color={notifIconColor}
                d="M8 2a4 4 0 014 4v3l1.5 2.5H2.5L4 9V6a4 4 0 014-4zM6 13a2 2 0 004 0"
              />
            }
            label="プッシュ通知"
            toggle={pushEnabled}
            onToggle={async () => {
              if (pushEnabled) {
                Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();
              } else {
                const { status } = await Notifications.requestPermissionsAsync();
                setPushEnabled(status === 'granted');
              }
            }}
          />
          <Row
            styles={styles}
            iconBg={notifIconBg}
            icon={
              <IconPath
                color={notifIconColor}
                d="M8 5a3 3 0 100 6 3 3 0 000-6zM8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3"
              />
            }
            label="テーマ"
            detail={themeModeLabels[themeMode] ?? 'ライト'}
            onPress={() => {
              Haptics.selectionAsync();
              setThemePickerVisible(true);
            }}
          />
          <Row
            styles={styles}
            iconBg={notifIconBg}
            icon={<IconDevice color={notifIconColor} />}
            label="デフォルトデバイス"
            detail={soundOutputLabels[soundOutput]}
            isLast
            onPress={() => router.push('/sound-output')}
          />
        </Section>

        {/* ACCOUNT section */}
        <Section styles={styles} title="アカウント・その他">
          <Row
            styles={styles}
            iconBg={reviewIconBg}
            icon={
              <IconPath
                color={reviewIconColor}
                d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5 4.3 12.6l.7-4.1L2 5.6l4.2-.9z"
              />
            }
            label="レビューを書く"
            onPress={() =>
              Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com'
                  : 'https://play.google.com',
              )
            }
          />
          <Row
            styles={styles}
            iconBg={grayIconBg}
            icon={
              <IconPath
                color={C.ink3}
                d="M8 7v4M8 4v.5M2 8a6 6 0 1012 0A6 6 0 002 8z"
              />
            }
            label="ヘルプ・サポート"
            onPress={() => Linking.openURL('https://github.com/anthropics/claude-code/issues')}
          />
          <Row
            styles={styles}
            iconBg={grayIconBg}
            icon={
              <IconPath
                color={C.ink3}
                d="M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zM1 6l7 4 7-4"
              />
            }
            label="お問い合わせ"
            isLast
            onPress={() => Linking.openURL('mailto:support@scanalarm.app')}
          />
        </Section>

        {/* Footer */}
        <Text style={styles.footer}>ScanAlarm v{APP_VERSION} · build 42</Text>
      </ScrollView>

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.toastDot} />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      {/* Theme picker sheet — uses app palette so it stays grey in dark mode */}
      <Modal
        visible={themePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.themeBackdrop}
          activeOpacity={1}
          onPress={() => setThemePickerVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.themeSheet}>
            <Text style={styles.themeTitle}>テーマ</Text>
            <Text style={styles.themeSubtitle}>表示モードを選択してください</Text>
            {(['light', 'dark', 'system'] as const).map((mode, idx, arr) => {
              const selected = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOption,
                    idx < arr.length - 1 && styles.themeOptionBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setThemeMode(mode);
                    setThemePickerVisible(false);
                  }}
                >
                  <Text style={[styles.themeOptionLabel, selected && styles.themeOptionLabelSelected]}>
                    {themeModeLabels[mode]}
                  </Text>
                  {selected && (
                    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                      <Path d="M3 8.5l3 3 7-7" stroke={C.orange} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.themeCancel}
              activeOpacity={0.7}
              onPress={() => setThemePickerVisible(false)}
            >
              <Text style={styles.themeCancelText}>キャンセル</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ─── Styles ─── */
const styles = makeStyles(C);
function makeStyles(C: AppPalette) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  /* Header */
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 30,
    color: C.ink,
    letterSpacing: -0.8,
    marginBottom: 24,
  },

  /* Profile card */
  profileCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: F.bold,
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  profileName: {
    fontFamily: F.bold,
    fontSize: 16,
    color: C.ink,
    letterSpacing: -0.3,
  },
  nameInput: {
    fontFamily: F.semi,
    fontSize: 16,
    color: C.ink,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
  },

  /* Section headers */
  sectionHeader: {
    fontFamily: F.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: C.ink3,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 6,
  },

  /* Card */
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.lineSoft,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.orangeDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: F.medium,
    fontSize: 15,
    color: C.ink,
    letterSpacing: -0.2,
    flex: 1,
  },
  rowDetail: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.ink3,
  },

  /* Footer */
  footer: {
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 11,
    color: C.ink4,
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  /* Toast */
  toast: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 8,
    borderWidth: 1,
    borderColor: C.line,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  toastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.orange,
  },
  toastText: {
    fontSize: 14,
    color: C.ink,
    fontFamily: F.medium,
  },

  /* Theme picker modal */
  themeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  themeSheet: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingTop: 22,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  themeTitle: {
    fontSize: 17,
    fontFamily: F.bold,
    color: C.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  themeSubtitle: {
    fontSize: 13,
    fontFamily: F.regular,
    color: C.ink3,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  themeOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.lineSoft,
  },
  themeOptionLabel: {
    fontSize: 15,
    fontFamily: F.medium,
    color: C.ink,
  },
  themeOptionLabelSelected: {
    color: C.orange,
    fontFamily: F.semi,
  },
  themeCancel: {
    marginTop: 6,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
  themeCancelText: {
    fontSize: 15,
    fontFamily: F.semi,
    color: C.ink2,
  },
});
}
