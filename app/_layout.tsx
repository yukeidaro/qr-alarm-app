import { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { setupNotifications, rescheduleAllAlarms } from '../services/alarmService';
import { getAlarms, Alarm } from '../services/storageService';
import { isAdAvailable, initializeAdMob } from '../services/adService';
import { ThemeProvider, useTheme } from '../theme';

SplashScreen.preventAutoHideAsync();

// Guard against double navigation to ringing screen
const alarmTriggerTimes = new Map<string, number>();

function shouldTriggerAlarm(alarmId: string): boolean {
  const last = alarmTriggerTimes.get(alarmId);
  if (last && Date.now() - last < 90000) return false; // 90s cooldown
  alarmTriggerTimes.set(alarmId, Date.now());
  return true;
}

export default function RootLayout() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>(null);
  const notificationListener = useRef<Notifications.Subscription>(null);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Initialize AdMob SDK (only in development/production builds, not Expo Go)
  useEffect(() => {
    initializeAdMob();
  }, []);

  useEffect(() => {
    setupNotifications();

    // Re-schedule all alarms on every app launch.
    // iOS clears pending notifications after app updates / force-quit / reboot.
    rescheduleAllAlarms();

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data as {
          alarmId?: string;
          soundId?: string;
        };
        const alarmId = data.alarmId || '';
        const actionId = response.actionIdentifier;

        // Handle notification action buttons
        if (actionId === 'dismiss') {
          // User tapped Dismiss on the notification — go to scan screen
          router.push({
            pathname: '/scan',
            params: { mode: 'dismiss', alarmId },
          });
          return;
        }

        if (actionId === 'snooze') {
          // User tapped Snooze on the notification
          if (alarmId) {
            const { getAlarms, incrementSnoozeCount, saveSnoozeTime } = await import('../services/storageService');
            const { scheduleSnooze: doSnooze } = await import('../services/alarmService');
            const alarms = await getAlarms();
            const alarm = alarms.find((a) => a.id === alarmId);
            if (alarm) {
              await incrementSnoozeCount(alarmId);
              await doSnooze(alarm);
              await saveSnoozeTime(alarmId, Date.now() + 5 * 60 * 1000);
            }
          }
          router.push({
            pathname: '/snooze',
            params: { alarmId: alarmId || 'default' },
          });
          return;
        }

        // Default: user tapped notification body → go to ringing
        if (!shouldTriggerAlarm(alarmId || 'notif_response')) return;
        router.push({
          pathname: '/ringing',
          params: { alarmId },
        });
      }
    );

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as {
          alarmId?: string;
        };
        const alarmId = data.alarmId || '';
        if (!shouldTriggerAlarm(alarmId || 'notif_received')) return;
        router.push({
          pathname: '/ringing',
          params: { alarmId },
        });
      }
    );

    return () => {
      responseListener.current?.remove();
      notificationListener.current?.remove();
    };
  }, []);

  // Foreground alarm time check — reliable fallback when notifications don't fire
  useEffect(() => {
    const checkAlarmTime = async () => {
      try {
        const alarms: Alarm[] = await getAlarms();
        const now = new Date();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();

        for (const alarm of alarms) {
          if (!alarm.enabled) continue;
          if (alarm.hour !== nowHour || alarm.minute !== nowMinute) continue;

          // Check repeat days
          if (alarm.repeatDays.length > 0) {
            const today = now.getDay(); // 0=Sun..6=Sat
            if (!alarm.repeatDays.includes(today)) continue;
          }

          if (!shouldTriggerAlarm(alarm.id)) continue;

          router.push({ pathname: '/ringing', params: { alarmId: alarm.id } });
          return; // one alarm at a time
        }
      } catch {
        // Silently ignore — don't crash the app
      }
    };

    const interval = setInterval(checkAlarmTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutInner onLayout={onLayoutRootView} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutInner({ onLayout }: { onLayout: () => void }) {
  const { isDark, colors } = useTheme();

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alarm-optimization" />
        <Stack.Screen name="qr-manage" />
        <Stack.Screen name="snooze" options={{ gestureEnabled: false }} />
        <Stack.Screen name="ringing" options={{ gestureEnabled: false }} />
      </Stack>
    </View>
  );
}
