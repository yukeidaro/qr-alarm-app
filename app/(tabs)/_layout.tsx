/**
 * ScanAlarm — Tab Layout
 * Bottom tab bar with Liquid Glass blur on iOS, solid fallback on Android.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme';

export default function TabLayout() {
  const { colors, glass, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'PlusJakartaSans_500Medium',
          marginTop: 2,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={isDark ? 30 : 20}
              tint={isDark ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, { backgroundColor: glass.surface1 }]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgSecondary }]} />
          ),
        tabBarStyle: {
          position: Platform.OS === 'ios' ? 'absolute' : ('relative' as const),
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bgSecondary,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: glass.separator,
          height: Platform.OS === 'ios' ? 84 : 56,
          paddingBottom: Platform.OS === 'ios' ? 28 : 4,
          paddingTop: 4,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alarm',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'alarm' : 'alarm-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
