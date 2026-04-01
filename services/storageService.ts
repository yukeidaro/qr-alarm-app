import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
  qrCodeData: string | null;
  repeatDays: number[]; // 0=Sun..6=Sat
  soundId: string;
  snoozeEnabled: boolean;
  snoozeUsed: boolean;
}

const ALARMS_KEY = '@qralarm/alarms';
const QR_KEY = '@qralarm/registered_qr';
const QR_LIST_KEY = '@qralarm/registered_qrs';
const CUSTOM_SOUNDS_KEY = '@qralarm/custom_sounds';
const RINGING_BG_KEY = '@qralarm/ringing_bg';
const SNOOZE_COUNT_KEY = '@qralarm/snooze_count';

export interface RegisteredQR {
  id: string;
  name: string;
  data: string; // barcode/QR raw data
}

export interface CustomSound {
  id: string;
  name: string;
  uri: string;
}

export function createAlarm(partial?: Partial<Alarm>): Alarm {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    hour: 7,
    minute: 0,
    enabled: true,
    label: '',
    qrCodeData: null,
    repeatDays: [],
    soundId: 'gentle',
    snoozeEnabled: true,
    snoozeUsed: false,
    ...partial,
  };
}

export async function getAlarms(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(ALARMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export async function saveAlarm(alarm: Alarm): Promise<void> {
  const alarms = await getAlarms();
  const idx = alarms.findIndex((a) => a.id === alarm.id);
  if (idx >= 0) {
    alarms[idx] = alarm;
  } else {
    alarms.push(alarm);
  }
  await saveAlarms(alarms);
}

export async function deleteAlarm(id: string): Promise<void> {
  const alarms = await getAlarms();
  await saveAlarms(alarms.filter((a) => a.id !== id));
}

// Legacy single QR (backward compat)
export async function getRegisteredQR(): Promise<string | null> {
  // Check new multi-QR first, fall back to legacy
  const qrs = await getRegisteredQRs();
  if (qrs.length > 0) return qrs[0].data;
  return AsyncStorage.getItem(QR_KEY);
}

export async function saveRegisteredQR(data: string): Promise<void> {
  await AsyncStorage.setItem(QR_KEY, data);
}

// Multi-QR support
export async function getRegisteredQRs(): Promise<RegisteredQR[]> {
  const raw = await AsyncStorage.getItem(QR_LIST_KEY);
  if (raw) return JSON.parse(raw);
  // Migrate legacy single QR if exists
  const legacy = await AsyncStorage.getItem(QR_KEY);
  if (legacy) {
    const migrated: RegisteredQR[] = [{ id: 'legacy', name: 'QR', data: legacy }];
    await AsyncStorage.setItem(QR_LIST_KEY, JSON.stringify(migrated));
    return migrated;
  }
  return [];
}

export async function saveRegisteredQRItem(qr: RegisteredQR): Promise<void> {
  const qrs = await getRegisteredQRs();
  qrs.push(qr);
  await AsyncStorage.setItem(QR_LIST_KEY, JSON.stringify(qrs));
  // Also update legacy key for backward compat
  await AsyncStorage.setItem(QR_KEY, qr.data);
}

export async function deleteRegisteredQR(id: string): Promise<void> {
  const qrs = await getRegisteredQRs();
  const filtered = qrs.filter((q) => q.id !== id);
  await AsyncStorage.setItem(QR_LIST_KEY, JSON.stringify(filtered));
  if (filtered.length > 0) {
    await AsyncStorage.setItem(QR_KEY, filtered[0].data);
  } else {
    await AsyncStorage.removeItem(QR_KEY);
  }
}

export async function getRegisteredQRById(id: string): Promise<RegisteredQR | null> {
  const qrs = await getRegisteredQRs();
  return qrs.find((q) => q.id === id) || null;
}

export async function getCustomSounds(): Promise<CustomSound[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_SOUNDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCustomSound(sound: CustomSound): Promise<void> {
  const sounds = await getCustomSounds();
  sounds.push(sound);
  await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(sounds));
}

export async function deleteCustomSound(id: string): Promise<void> {
  const sounds = await getCustomSounds();
  await AsyncStorage.setItem(
    CUSTOM_SOUNDS_KEY,
    JSON.stringify(sounds.filter((s) => s.id !== id))
  );
}

// Ringing background image
export async function getRingingBackground(): Promise<string | null> {
  return AsyncStorage.getItem(RINGING_BG_KEY);
}

export async function saveRingingBackground(uri: string): Promise<void> {
  await AsyncStorage.setItem(RINGING_BG_KEY, uri);
}

export async function clearRingingBackground(): Promise<void> {
  await AsyncStorage.removeItem(RINGING_BG_KEY);
}

// Dismiss streak tracking
const DISMISS_STREAK_KEY = '@qralarm/dismiss_streak';
const LAST_DISMISS_DATE_KEY = '@qralarm/last_dismiss_date';

export async function getDismissStreak(): Promise<number> {
  const raw = await AsyncStorage.getItem(DISMISS_STREAK_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function recordDismiss(): Promise<number> {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(LAST_DISMISS_DATE_KEY);

  let streak = await getDismissStreak();

  if (lastDate === today) {
    // Already dismissed today, don't increment
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastDate === yesterday.toDateString()) {
    // Consecutive day
    streak += 1;
  } else {
    // Streak broken or first dismiss
    streak = 1;
  }

  await AsyncStorage.setItem(DISMISS_STREAK_KEY, streak.toString());
  await AsyncStorage.setItem(LAST_DISMISS_DATE_KEY, today);
  return streak;
}

// Snooze count tracking (per alarm instance)
export async function getSnoozeCount(alarmId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(`${SNOOZE_COUNT_KEY}_${alarmId}`);
  return raw ? parseInt(raw, 10) : 0;
}

export async function incrementSnoozeCount(alarmId: string): Promise<number> {
  const current = await getSnoozeCount(alarmId);
  const next = current + 1;
  await AsyncStorage.setItem(`${SNOOZE_COUNT_KEY}_${alarmId}`, next.toString());
  return next;
}

export async function resetSnoozeCount(alarmId: string): Promise<void> {
  await AsyncStorage.removeItem(`${SNOOZE_COUNT_KEY}_${alarmId}`);
}

// Snooze target time tracking
const SNOOZE_TIME_KEY = '@qralarm/snooze_time';

export async function saveSnoozeTime(alarmId: string, targetTime: number): Promise<void> {
  await AsyncStorage.setItem(`${SNOOZE_TIME_KEY}_${alarmId}`, targetTime.toString());
}

export async function getSnoozeTime(alarmId: string): Promise<number | null> {
  const raw = await AsyncStorage.getItem(`${SNOOZE_TIME_KEY}_${alarmId}`);
  return raw ? parseInt(raw, 10) : null;
}

export async function clearSnoozeTime(alarmId: string): Promise<void> {
  await AsyncStorage.removeItem(`${SNOOZE_TIME_KEY}_${alarmId}`);
}

export async function getAllSnoozeAlarmIds(): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys();
  return keys
    .filter((k) => k.startsWith(SNOOZE_TIME_KEY))
    .map((k) => k.replace(`${SNOOZE_TIME_KEY}_`, ''));
}
