/**
 * QRManageScreen — Light grey + orange design
 * Matches design from screens-app.jsx QRManageScreen.
 * Dashed orange "Add" CTA + grouped card with mini QR thumbnails + tip card.
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  RegisteredQR,
  getRegisteredQRs,
  deleteRegisteredQR,
  renameRegisteredQR,
} from '../services/storageService';
import { setPendingQR } from '../services/qrSelectionStore';
import { t } from '../i18n';
import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';

const C = LIGHT_PALETTE;

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

function BackArrow() {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15" fill="none">
      <Path d="M8 1L2 7.5 8 14" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke={C.ink4} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M8 2v12M2 8h12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function MiniQR({ color }: { color: string }) {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Rect x={3} y={3} width={10} height={10} rx={2} stroke={color} strokeWidth={1.5} />
      <Rect x={23} y={3} width={10} height={10} rx={2} stroke={color} strokeWidth={1.5} />
      <Rect x={3} y={23} width={10} height={10} rx={2} stroke={color} strokeWidth={1.5} />
      <Rect x={5.5} y={5.5} width={5} height={5} rx={0.8} fill={color} />
      <Rect x={25.5} y={5.5} width={5} height={5} rx={0.8} fill={color} />
      <Rect x={5.5} y={25.5} width={5} height={5} rx={0.8} fill={color} />
      <Rect x={23} y={23} width={4} height={4} rx={0.8} fill={color} />
      <Rect x={29} y={23} width={4} height={4} rx={0.8} fill={color} />
      <Rect x={23} y={29} width={4} height={4} rx={0.8} fill={color} />
    </Svg>
  );
}

/** 1D barcode icon — vertical lines of varying widths. */
function MiniBarcode({ color }: { color: string }) {
  // Deterministic line pattern (x, width) — total width fits into 36px viewBox.
  const lines: Array<[number, number]> = [
    [3, 1.4], [5.2, 2.4], [8.4, 1.4], [10.6, 1.4], [12.8, 2.8],
    [16.6, 1.4], [18.8, 2.4], [22, 1.4], [24.2, 2.8], [28, 1.4],
    [30.2, 1.4], [32.4, 1.6],
  ];
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      {lines.map(([x, w], i) => (
        <Rect key={i} x={x} y={6} width={w} height={24} fill={color} rx={0.4} />
      ))}
    </Svg>
  );
}




export default function QRManageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSelectMode = params.mode === 'select';
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [qrs, setQrs] = useState<RegisteredQR[]>([]);

  // Toast
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = () => {
    setToastVisible(true);
    toastOpacity.setValue(0);
    toastTranslateY.setValue(20);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(toastTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start(() => setToastVisible(false));
    }, 1500);
  };

  const loadQRs = useCallback(async () => {
    const items = await getRegisteredQRs();
    setQrs(items);
  }, []);

  useFocusEffect(useCallback(() => { loadQRs(); }, [loadQRs]));

  const handleDelete = (qr: RegisteredQR) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.qrManage.deleteTitle,
      t.qrManage.deleteMessage(qr.name),
      [
        { text: t.qrManage.cancel, style: 'cancel' },
        {
          text: t.qrManage.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteRegisteredQR(qr.id);
            await loadQRs();
            showToast();
          },
        },
      ],
    );
  };

  const handleAdd = () => {
    router.push({ pathname: '/scan', params: { mode: 'register' } });
  };

  const handleSelect = (qr: RegisteredQR) => {
    if (!isSelectMode) return;
    Haptics.selectionAsync();
    setPendingQR({ id: qr.id, name: qr.name, data: qr.data });
    router.back();
  };

  // Rename modal state
  const [renamingQR, setRenamingQR] = useState<RegisteredQR | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const openRename = (qr: RegisteredQR) => {
    Haptics.selectionAsync();
    setRenamingQR(qr);
    setRenameInput(qr.name);
  };

  const closeRename = () => {
    setRenamingQR(null);
    setRenameInput('');
  };

  const submitRename = async () => {
    if (!renamingQR) return;
    const next = renameInput.trim();
    if (!next || next === renamingQR.name) {
      closeRename();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await renameRegisteredQR(renamingQR.id, next);
    closeRename();
    await loadQRs();
  };

  const handleRowPress = (qr: RegisteredQR) => {
    if (isSelectMode) {
      handleSelect(qr);
    } else {
      openRename(qr);
    }
  };

  return (
    <View style={styles.root}>
      {/* SubShell header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} style={styles.navLeft}>
          <BackArrow />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add CTA */}
        <View style={styles.addWrap}>
          <TouchableOpacity style={styles.addCta} activeOpacity={0.8} onPress={handleAdd}>
            <PlusIcon color={C.orange} />
            <Text style={styles.addText}>コードを追加</Text>
          </TouchableOpacity>
        </View>

        {/* List card */}
        {qrs.length > 0 && (
          <View style={styles.listCard}>
            {qrs.map((qr, idx) => {
              const renderRightActions = () => (
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDelete(qr)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.deleteText}>{t.qrManage.delete}</Text>
                </TouchableOpacity>
              );

              return (
                <View key={qr.id}>
                  <Swipeable
                    renderRightActions={renderRightActions}
                    overshootRight={false}
                    friction={2}
                  >
                    <TouchableOpacity
                      style={styles.row}
                      activeOpacity={0.7}
                      onPress={() => handleRowPress(qr)}
                      onLongPress={() => handleDelete(qr)}
                    >
                      <View style={styles.thumb}>
                        {qr.kind === 'barcode' ? (
                          <MiniBarcode color={C.orange} />
                        ) : (
                          <MiniQR color={C.orange} />
                        )}
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.name}>{qr.name}</Text>
                        {qr.kind === 'barcode' && (
                          <Text style={styles.barcodeDigits} numberOfLines={1}>
                            {qr.data}
                          </Text>
                        )}
                        {isSelectMode ? (
                          <Text style={styles.selectHint}>タップして選択</Text>
                        ) : (
                          <Text style={styles.hint}>タップで名前を編集 / 左にスワイプで削除</Text>
                        )}
                      </View>
                      <ChevronRight />
                    </TouchableOpacity>
                  </Swipeable>
                  {idx < qrs.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        )}

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            ヒント: ベッドから離れた場所にあるものを登録するのがコツです。冷蔵庫・洗面所のアイテム、トイレの芳香剤のバーコードなど、起き上がって移動しないとスキャンできない場所がおすすめです。
          </Text>
        </View>
      </ScrollView>

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] },
          ]}
        >
          <Text style={styles.toastText}>{t.qrManage.deleted}</Text>
        </Animated.View>
      )}

      {/* Rename modal */}
      <Modal
        visible={!!renamingQR}
        transparent
        animationType="fade"
        onRequestClose={closeRename}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeRename}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>名前を変更</Text>
            <TextInput
              style={styles.modalInput}
              value={renameInput}
              onChangeText={setRenameInput}
              placeholder="QRコードの名前"
              placeholderTextColor={C.ink4}
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={submitRename}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={closeRename}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnGhostText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={submitRename}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnPrimaryText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = makeStyles(C);
function makeStyles(C: AppPalette) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    ...Platform.select({ ios: { paddingTop: 50 }, android: { paddingTop: 28 } }),
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  navRight: { width: 80 },
  backText: { color: C.orange, fontSize: 16, fontFamily: F.semi, marginLeft: 2 },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: F.bold,
    color: C.ink,
    letterSpacing: -0.3,
  },
  content: { paddingTop: 16, paddingBottom: 60 },

  addWrap: { marginHorizontal: 20, marginBottom: 16 },
  addCta: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.orange,
    backgroundColor: C.orangeDim,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: { fontSize: 15, fontFamily: F.bold, color: C.orange },

  listCard: {
    marginHorizontal: 20,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(248,90,62,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  col: { flex: 1 },
  name: { fontSize: 15, fontFamily: F.bold, color: C.ink, letterSpacing: -0.2 },
  barcodeDigits: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    color: C.ink2,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  selectHint: { fontSize: 11, fontFamily: F.medium, color: C.orange, marginTop: 4 },
  hint: { fontSize: 11, fontFamily: F.regular, color: C.ink3, marginTop: 4 },
  divider: { height: 1, backgroundColor: C.lineSoft, marginLeft: 78 },

  deleteAction: {
    backgroundColor: '#E5484D',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
  },
  deleteText: {
    color: '#FFFFFF',
    fontFamily: F.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: F.bold,
    color: C.ink,
    letterSpacing: -0.3,
    marginBottom: 14,
    textAlign: 'center',
  },
  modalInput: {
    fontSize: 15,
    fontFamily: F.medium,
    color: C.ink,
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnGhost: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.line,
  },
  modalBtnGhostText: {
    fontSize: 15,
    fontFamily: F.semi,
    color: C.ink,
  },
  modalBtnPrimary: {
    backgroundColor: C.orange,
  },
  modalBtnPrimaryText: {
    fontSize: 15,
    fontFamily: F.bold,
    color: '#FFFFFF',
  },

  tipCard: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.line,
  },
  tipText: { fontSize: 12, color: C.ink3, lineHeight: 19, fontFamily: F.regular },

  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: C.ink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontFamily: F.semi },
});
}
