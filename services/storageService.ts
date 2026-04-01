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
const CUSTOM_SOUNDS_KEY = '@qralarm/custom_sounds';
const RINGING_BG_KEY = '@qralarm/ringing_bg';
const SNOOZE_COUNT_KEY = '@qralarm/snooze_count';

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

export async function getRegisteredQR(): Promise<string | null> {
  return AsyncStorage.getItem(QR_KEY);
}

export async function saveRegisteredQR(data: string): Promise<void> {
  await AsyncStorage.setItem(QR_KEY, data);
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
