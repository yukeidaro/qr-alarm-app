import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Alarm } from './storageService';
import { t } from '../i18n';

const SNOOZE_MINUTES = 5;
const isWeb = Platform.OS === 'web';

export function setupNotifications(): void {
  if (isWeb) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (isWeb) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  if (isWeb) return '';
  await cancelAlarm(alarm.id);
  if (!alarm.enabled) return '';

  const content = {
    title: t.notification.title,
    body: t.notification.body,
    data: { alarmId: alarm.id, soundId: alarm.soundId },
  };

  if (alarm.repeatDays.length > 0) {
    // Schedule one notification per repeat day
    let firstId = '';
    for (let i = 0; i < alarm.repeatDays.length; i++) {
      const identifier = i === 0 ? alarm.id : `${alarm.id}_day${alarm.repeatDays[i]}`;
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: alarm.repeatDays[i] + 1, // expo uses 1=Sun..7=Sat
          hour: alarm.hour,
          minute: alarm.minute,
        },
        identifier,
      });
      if (i === 0) firstId = id;
    }
    return firstId;
  }

  // No repeat days → daily trigger
  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: alarm.hour,
      minute: alarm.minute,
    },
    identifier: alarm.id,
  });
  return id;
}

export async function scheduleSnooze(alarm: Alarm): Promise<string> {
  if (isWeb) return '';
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t.notification.snoozeTitle,
      body: t.notification.snoozeBody,
      data: { alarmId: alarm.id, soundId: alarm.soundId, isSnooze: true },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SNOOZE_MINUTES * 60,
    },
  });
  return id;
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  if (isWeb) return;
  await Notifications.cancelScheduledNotificationAsync(alarmId);
  for (let day = 0; day < 7; day++) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`${alarmId}_day${day}`);
    } catch {
      // May not exist
    }
  }
}

export async function scheduleTestAlarm(): Promise<string> {
  if (isWeb) return '';
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t.notification.testTitle,
      body: t.notification.testBody,
      data: { alarmId: 'test', soundId: 'gentle' },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });
  return id;
}
