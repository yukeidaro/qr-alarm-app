/**
 * スヌーズ間隔設定のストレージ + 同期キャッシュ
 * デフォルト 5 分。設定可能値: 5 / 10 / 15 / 30 分
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SNOOZE_INTERVAL_KEY = '@qralarm/snooze_interval';
export const SNOOZE_INTERVAL_OPTIONS = [3, 5, 10, 15] as const;
export type SnoozeIntervalMinutes = (typeof SNOOZE_INTERVAL_OPTIONS)[number];
export const DEFAULT_SNOOZE_MINUTES: SnoozeIntervalMinutes = 5;

let cached: SnoozeIntervalMinutes = DEFAULT_SNOOZE_MINUTES;
let initialized = false;

export async function loadSnoozeMinutes(): Promise<SnoozeIntervalMinutes> {
  try {
    const v = await AsyncStorage.getItem(SNOOZE_INTERVAL_KEY);
    const n = v ? parseInt(v, 10) : NaN;
    if (SNOOZE_INTERVAL_OPTIONS.includes(n as SnoozeIntervalMinutes)) {
      cached = n as SnoozeIntervalMinutes;
    }
  } catch {}
  initialized = true;
  return cached;
}

export function getSnoozeMinutesSync(): SnoozeIntervalMinutes {
  return cached;
}

export function isSnoozeInitialized(): boolean {
  return initialized;
}

export async function setSnoozeMinutes(minutes: SnoozeIntervalMinutes): Promise<void> {
  cached = minutes;
  await AsyncStorage.setItem(SNOOZE_INTERVAL_KEY, String(minutes));
}
