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
import { setupNotifications } from '../services/alarmService';
import { isAdAvailable, initializeAdMob } from '../services/adService';
import { ThemeProvider } from '../theme';
import { BG_PRIMARY } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

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

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          alarmId?: string;
          soundId?: string;
        };
        router.push({
          pathname: '/ringing',
          params: { alarmId: data.alarmId || '' },
        });
      }
    );

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as {
          alarmId?: string;
        };
        router.push({
          pathname: '/ringing',
          params: { alarmId: data.alarmId || '' },
        });
      }
    );

    return () => {
      responseListener.current?.remove();
      notificationListener.current?.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: BG_PRIMARY },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="snooze" options={{ gestureEnabled: false }} />
            <Stack.Screen name="ringing" options={{ gestureEnabled: false }} />
          </Stack>
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
