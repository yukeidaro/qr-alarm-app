/**
 * QR Alarm App — 共通モーダルコンポーネント
 * オーバーレイ付きモーダル。Center / BottomSheet の2レイアウト。
 */
import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { BG_MODAL, OVERLAY } from '../constants/colors';
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
  overlayOpacity = OVERLAY.black40,
  children,
  contentStyle,
}: AppModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: overlayOpacity }]}>
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
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['4xl'],
  },
  content: {
    backgroundColor: BG_MODAL,
    width: '100%',
    padding: SPACING['4xl'],
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
