/**
 * ThemePickerSheet — Light theme color picker
 * Pick accent color for alarm card glow.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import {
  AI_ACCENTS,
  AI_ACCENT_ORDER,
  type AiAccentKey,
} from '../constants/aiOS';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#FFFFFF',
  border: '#E5E5E7',
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#A1A1AA',
  orange: '#F85A3E',
  orangeGlow: 'rgba(248,90,62,0.22)',
};

interface ThemePickerSheetProps {
  visible: boolean;
  currentTheme?: string;
  onSelect: (themeKey: AiAccentKey) => void;
  onClose: () => void;
}

export default function ThemePickerSheet({
  visible,
  currentTheme,
  onSelect,
  onClose,
}: ThemePickerSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>カラーを変更</Text>
          <Text style={styles.subtitle}>アラームのテーマを選んでください</Text>

          <View style={styles.swatchRow}>
            {AI_ACCENT_ORDER.map((key) => {
              const accent = AI_ACCENTS[key];
              const selected = currentTheme === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    onSelect(key);
                    onClose();
                  }}
                  activeOpacity={0.8}
                  style={styles.swatchBtn}
                >
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: accent.swatch,
                        borderColor: selected ? C.orange : 'transparent',
                        shadowColor: accent.hex,
                      },
                    ]}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={22} color={accent.onAccent} />
                    )}
                  </View>
                  <Text style={styles.swatchLabel}>{accent.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={styles.doneBtn}
          >
            <Text style={styles.doneText}>完了</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.ink3,
    opacity: 0.4,
    marginBottom: 18,
  },
  title: {
    color: C.ink,
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    color: C.ink2,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginBottom: 28,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  swatchBtn: {
    alignItems: 'center',
    width: 72,
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  swatchLabel: {
    marginTop: 10,
    color: C.ink2,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  doneBtn: {
    backgroundColor: C.orange,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  doneText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
