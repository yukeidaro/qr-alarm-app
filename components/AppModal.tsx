/**
 * QR Alarm App — 共通モーダルコンポーネント
 * オーバーレイ付きモーダル。Center / BottomSheet の2レイアウト。
 */
import React, { useMemo } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';
import { type ThemeColors, type GlassTokens } from '../constants/colors';
import { RADIUS, SPACING, ACTIVE_OPACITY } from '../constants/spacing';

type ModalLayout = 'center' | 'bottom';

interface AppModalProps {
  visible: boolean;
  onClose?: () => void;
  layout?: ModalLayout;
  overlayOpacity?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export default function AppModal({
  visible,
  onClose,
  layout = 'center',
  overlayOpacity,
  children,
  contentStyle,
}: AppModalProps) {
  const { colors, glass, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, glass), [colors, glass]);
  const overlayBg = overlayOpacity ?? colors.overlay.black40;
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        {onClose && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={ACTIVE_OPACITY.default}
          />
        )}
        <View
          style={[
            styles.content,
            layout === 'bottom' ? styles.bottomContent : styles.centerContent,
            Platform.OS !== 'ios' && { backgroundColor: colors.bgModal },
            contentStyle,
          ]}
        >
          {Platform.OS === 'ios' && (
            <>
              <BlurView
                intensity={isDark ? 35 : 25}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.surface2 }]} />
            </>
          )}
          <View style={{ position: 'relative' }}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const makeStyles = (c: ThemeColors, g: GlassTokens) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['4xl'],
  },
  content: {
    width: '100%',
    padding: SPACING['4xl'],
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: g.border,
  },
  centerContent: {
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  bottomContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: SPACING['5xl'],
  },
});
