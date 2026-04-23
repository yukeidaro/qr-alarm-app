/**
 * ScanAlarm — Tab Layout
 * Uses MaterialTopTabNavigator (react-native-pager-view under the hood) so
 * users can finger-track swipe between Alarm and Settings. The visible tab
 * UI is a custom floating "Liquid Glass" pill rendered at the BOTTOM
 * (the navigator's own top tab bar is hidden via `tabBar={() => null}` and
 * we render our pill as a sibling overlay).
 */
import React from 'react';
import { Platform, View, StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import type { MaterialTopTabNavigationEventMap } from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { PagerSwipeLockProvider, usePagerSwipeLock } from '../../contexts/PagerSwipeLock';

const ACTIVE = '#F85A3E';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext<
  any,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

// Custom tab icons — match screens-app.jsx AppTabBar exactly.
function ClockTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={7} stroke={color} strokeWidth={2} />
      <Path d="M12 10v3.5l2 1.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 6l2.5-2M19 6l-2.5-2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function GearTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Path
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

type TabRoute = { key: string; name: string };

/**
 * Floating bottom tab bar — visual replica of the original liquid-glass pill.
 * Rendered absolutely, so the pager-view fills the screen behind it.
 */
function FloatingBottomBar({
  state,
  navigation,
  isDark,
}: {
  state: TabNavigationState<ParamListBase>;
  navigation: any;
  isDark: boolean;
}) {
  const tint = isDark ? 'rgba(37,34,32,0.55)' : 'rgba(255,255,255,0.55)';
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,15,15,0.06)';
  const inactive = isDark ? '#A29B92' : '#9A9A9F';
  const sheen = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)';

  const items: { route: TabRoute; label: string; Icon: typeof ClockTabIcon }[] = state.routes.map(
    (route) => ({
      route,
      label: route.name === 'index' ? 'アラーム' : '設定',
      Icon: route.name === 'index' ? ClockTabIcon : GearTabIcon,
    }),
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.barContainer,
        { bottom: Platform.OS === 'ios' ? 24 : 16 },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            shadowOpacity: isDark ? 0.45 : 0.18,
          },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, styles.glassWrap]}>
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={Platform.OS === 'ios' ? 60 : 40}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
          <View style={[styles.borderOverlay, { borderColor: border }]} />
          <View style={[styles.sheen, { backgroundColor: sheen }]} />
        </View>

        {items.map(({ route, label, Icon }, i) => {
          const focused = state.index === i;
          const color = focused ? ACTIVE : inactive;
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                if (!focused) {
                  Haptics.selectionAsync();
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tabItem}
              hitSlop={8}
            >
              <Icon color={color} size={22} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <PagerSwipeLockProvider>
      <TabsInner />
    </PagerSwipeLockProvider>
  );
}

function TabsInner() {
  const { isDark } = useTheme();
  const { locked } = usePagerSwipeLock();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      initialLayout={{ width: Dimensions.get('window').width }}
      tabBar={(props) => (
        <FloatingBottomBar
          state={props.state}
          navigation={props.navigation}
          isDark={isDark}
        />
      )}
      screenOptions={{
        swipeEnabled: !locked,
        animationEnabled: true,
        lazy: false,
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'アラーム' }} />
      <MaterialTopTabs.Screen name="settings" options={{ title: '設定' }} />
    </MaterialTopTabs>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
  },
  glassWrap: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: StyleSheet.hairlineWidth,
  },
  tabItem: {
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
