import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  SchedulableTriggerInputTypes,
  AndroidImportance,
  AndroidAudioUsage,
  AndroidAudioContentType,
  AndroidNotificationVisibility,
} from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Alarm } from './storageService';
import { t } from '../i18n';

export const SNOOZE_MINUTES = 5;
const isWeb = Platform.OS === 'web';
const ALARM_CHANNEL_ID = 'alarm';
const ALARM_SOUND = 'gentle.wav';

// Background notification task name
export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Register background task for handling notifications when app is killed/background
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) return;
  // The notification has been received in the background.
  // On Android with MAX importance + USE_FULL_SCREEN_INTENT, the OS
  // will display the notification as a full-screen intent on the lock screen.
  // We don't need to do anything here — the notification itself handles
  // sound + vibration. When the user taps, the app opens and navigates to ringing.
});

export async function setupNotifications(): Promise<void> {
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

  // Register background notification task
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  } catch {
    // May fail in Expo Go or if native module not linked — non-fatal
  }

  // Set notification categories with actions (Snooze button on notification)
  try {
    await Notifications.setNotificationCategoryAsync('alarm', [
      {
        identifier: 'snooze',
        buttonTitle: t.notification.snoozeAction,
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: t.notification.dismissAction,
        options: { opensAppToForeground: true },
      },
    ]);
  } catch {
    // Non-fatal — notifications still work without action buttons
  }

  // Create high-priority alarm channel (Android)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: 'Alarm',
      importance: AndroidImportance.MAX,
      sound: ALARM_SOUND,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableLights: true,
      enableVibrate: true,
      audioAttributes: {
        usage: AndroidAudioUsage.ALARM,
        contentType: AndroidAudioContentType.SONIFICATION,
        flags: {
          enforceAudibility: true,
          requestHardwareAudioVideoSynchronization: false,
        },
      },
    });
  }
}

export async function requestPermissions(): Promise<boolean> {
  if (isWeb) return false;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      provideAppNotificationSettings: true,
    },
  });

  return status === 'granted';
}

export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  if (isWeb) return '';
  await cancelAlarm(alarm.id);
  if (!alarm.enabled) return '';

  const content: Notifications.NotificationContentInput = {
    title: t.notification.title,
    body: t.notification.body,
    data: { alarmId: alarm.id, soundId: alarm.soundId },
    sound: ALARM_SOUND,
    categoryIdentifier: 'alarm',
    sticky: true, // Keep notification visible until user interacts
    ...(Platform.OS === 'ios' && { interruptionLevel: 'timeSensitive' }),
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
          channelId: ALARM_CHANNEL_ID,
        },
        identifier,
      });
      if (i === 0) firstId = id;
    }
    return firstId;
  }

  // No repeat days → one-time trigger at specific date
  const now = new Date();
  const target = new Date();
  target.setHours(alarm.hour, alarm.minute, 0, 0);
  // If the target time has already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: target,
      channelId: ALARM_CHANNEL_ID,
    },
    identifier: alarm.id,
  });
  return id;
}

export async function scheduleSnooze(alarm: Alarm): Promise<string> {
  if (isWeb) return '';

  const snoozeId = `${alarm.id}_snooze`;
  // Cancel any existing snooze notification first
  try { await Notifications.cancelScheduledNotificationAsync(snoozeId); } catch {}

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t.notification.snoozeTitle,
      body: t.notification.snoozeBody,
      data: { alarmId: alarm.id, soundId: alarm.soundId, isSnooze: true },
      sound: ALARM_SOUND,
      categoryIdentifier: 'alarm',
      sticky: true,
      ...(Platform.OS === 'ios' && { interruptionLevel: 'timeSensitive' }),
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SNOOZE_MINUTES * 60,
      channelId: ALARM_CHANNEL_ID,
    },
    identifier: snoozeId,
  });
  return id;
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  if (isWeb) return;

  // Cancel main alarm notification
  await Notifications.cancelScheduledNotificationAsync(alarmId);
  // Cancel any pending snooze notification
  try {
    await Notifications.cancelScheduledNotificationAsync(`${alarmId}_snooze`);
  } catch {}
  // Cancel day-specific repeat notifications
  for (let day = 0; day < 7; day++) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`${alarmId}_day${day}`);
    } catch {
      // May not exist
    }
  }
}

/**
 * Re-schedule ALL enabled alarms.
 * Must be called on every app startup — iOS clears pending notifications
 * after app updates, force-quit, or device restart.
 */
export async function rescheduleAllAlarms(): Promise<void> {
  if (isWeb) return;
  try {
    const { getAlarms } = require('./storageService');
    const alarms: Alarm[] = await getAlarms();
    const enabled = alarms.filter((a) => a.enabled);

    // Cancel all existing scheduled notifications first to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Re-schedule each enabled alarm (scheduleAlarm calls cancelAlarm internally,
    // but that's a harmless no-op since we just cancelled everything)
    for (const alarm of enabled) {
      try {
        await scheduleAlarm(alarm);
      } catch {
        // Non-fatal — continue with other alarms
      }
    }

    // Verify: log how many notifications are now scheduled
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[AlarmService] Re-scheduled ${enabled.length} alarms (${scheduled.length} notifications pending)`);
  } catch (e) {
    console.error('[AlarmService] Failed to reschedule alarms:', e);
  }
}

export async function scheduleTestAlarm(): Promise<string> {
  if (isWeb) return '';
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t.notification.testTitle,
      body: t.notification.testBody,
      data: { alarmId: 'test', soundId: 'gentle' },
      sound: ALARM_SOUND,
      categoryIdentifier: 'alarm',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: ALARM_CHANNEL_ID,
    },
  });
  return id;
}
