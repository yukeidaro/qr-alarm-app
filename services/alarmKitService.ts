import { Platform } from 'react-native';
import {
  configure,
  requestAuthorization,
  scheduleAlarm,
  scheduleRepeatingAlarm,
  cancelAlarm as cancelAlarmKit,
  getLaunchPayload,
  generateUUID,
  type ScheduleAlarmOptions,
  type ScheduleRepeatingAlarmOptions,
} from 'expo-alarm-kit';
import { Alarm } from './storageService';
import { t } from '../i18n';

const APP_GROUP_ID = 'group.com.yuasano.qralarm';
const SNOOZE_MINUTES = 5;

let isConfigured = false;

/** Check if AlarmKit is available (iOS 26+) */
export function isAlarmKitAvailable(): boolean {
  return Platform.OS === 'ios';
}

/** Initialize AlarmKit — call once on app start */
export function initAlarmKit(): boolean {
  if (!isAlarmKitAvailable()) return false;
  try {
    isConfigured = configure(APP_GROUP_ID);
    return isConfigured;
  } catch {
    isConfigured = false;
    return false;
  }
}

/** Request AlarmKit authorization from user */
export async function requestAlarmKitPermission(): Promise<boolean> {
  if (!isAlarmKitAvailable() || !isConfigured) return false;
  try {
    const status = await requestAuthorization();
    return status === 'authorized';
  } catch {
    return false;
  }
}

/** Build common alarm options shared by one-time and repeating */
function buildAlarmOptions(alarm: Alarm) {
  return {
    title: t.notification.title,
    soundName: undefined as string | undefined, // use system default for now
    launchAppOnDismiss: true,
    doSnoozeIntent: alarm.snoozeEnabled,
    launchAppOnSnooze: alarm.snoozeEnabled,
    dismissPayload: JSON.stringify({ alarmId: alarm.id, action: 'dismiss' }),
    snoozePayload: alarm.snoozeEnabled
      ? JSON.stringify({ alarmId: alarm.id, action: 'snooze' })
      : undefined,
    stopButtonLabel: t.ringing.dismiss,
    snoozeButtonLabel: alarm.snoozeEnabled ? t.notification.snoozeAction : undefined,
    tintColor: '#6C5CE7',
    snoozeDuration: SNOOZE_MINUTES * 60,
  };
}

/** Schedule an alarm via AlarmKit */
export async function scheduleAlarmWithKit(alarm: Alarm): Promise<boolean> {
  if (!isAlarmKitAvailable() || !isConfigured) return false;

  // Cancel any existing alarm first
  await cancelAlarmWithKit(alarm.id);
  if (!alarm.enabled) return true;

  const commonOpts = buildAlarmOptions(alarm);

  try {
    if (alarm.repeatDays.length > 0) {
      // Convert app weekday format (0=Sun..6=Sat) to AlarmKit (1=Sun..7=Sat)
      const weekdays = alarm.repeatDays.map((d) => d + 1);

      const opts: ScheduleRepeatingAlarmOptions = {
        id: alarm.id,
        hour: alarm.hour,
        minute: alarm.minute,
        weekdays,
        ...commonOpts,
      };
      return await scheduleRepeatingAlarm(opts);
    }

    // One-time alarm: calculate target date
    const now = new Date();
    const target = new Date();
    target.setHours(alarm.hour, alarm.minute, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const opts: ScheduleAlarmOptions = {
      id: alarm.id,
      date: target,
      ...commonOpts,
    };
    return await scheduleAlarm(opts);
  } catch (e) {
    console.warn('[AlarmKit] Schedule failed:', e);
    return false;
  }
}

/** Schedule a snooze via AlarmKit */
export async function scheduleSnoozeWithKit(alarm: Alarm): Promise<boolean> {
  if (!isAlarmKitAvailable() || !isConfigured) return false;

  try {
    const snoozeId = `${alarm.id}_snooze`;
    const snoozeDate = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);

    const opts: ScheduleAlarmOptions = {
      id: snoozeId,
      date: snoozeDate,
      title: t.notification.snoozeTitle,
      launchAppOnDismiss: true,
      doSnoozeIntent: false,
      dismissPayload: JSON.stringify({ alarmId: alarm.id, action: 'dismiss', isSnooze: true }),
      stopButtonLabel: t.ringing.dismiss,
      tintColor: '#6C5CE7',
    };
    return await scheduleAlarm(opts);
  } catch (e) {
    console.warn('[AlarmKit] Snooze schedule failed:', e);
    return false;
  }
}

/** Cancel an alarm from AlarmKit */
export async function cancelAlarmWithKit(alarmId: string): Promise<void> {
  if (!isAlarmKitAvailable() || !isConfigured) return;
  try {
    await cancelAlarmKit(alarmId);
    // Also cancel snooze variant
    await cancelAlarmKit(`${alarmId}_snooze`);
  } catch {
    // Non-fatal
  }
}

/** Check if app was launched from an AlarmKit dismiss/snooze action */
export function checkAlarmKitLaunchPayload(): {
  alarmId: string;
  action: 'dismiss' | 'snooze';
  isSnooze?: boolean;
} | null {
  if (!isAlarmKitAvailable() || !isConfigured) return null;
  try {
    const payload = getLaunchPayload();
    if (!payload) return null;
    const data = payload.payload ? JSON.parse(payload.payload) : { alarmId: payload.alarmId };
    return {
      alarmId: data.alarmId || payload.alarmId,
      action: data.action || 'dismiss',
      isSnooze: data.isSnooze,
    };
  } catch {
    return null;
  }
}
