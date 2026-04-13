/**
 * ScanAlarm — QR Code Management Screen
 * View, delete, and add registered QR codes / barcodes.
 */
import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  RegisteredQR,
  getRegisteredQRs,
  deleteRegisteredQR,
} from '../services/storageService';
import { DELETE_ACTION_BG, ThemeColors } from '../constants/colors';
import { useTheme } from '../theme';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t } from '../i18n';

export default function QRManageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [qrs, setQrs] = useState<RegisteredQR[]>([]);

  // Toast
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = () => {
    setToastVisible(true);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  const loadQRs = useCallback(async () => {
    const items = await getRegisteredQRs();
    setQrs(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQRs();
    }, [loadQRs])
  );

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
      ]
    );
  };

  const handleAdd = () => {
    router.push({ pathname: '/scan', params: { mode: 'register' } });
  };

  const renderItem = ({ item }: { item: RegisteredQR }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.qrIconContainer}>
          <Ionicons name="qr-code" size={20} color={colors.accent} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardData} numberOfLines={1}>{item.data}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
        activeOpacity={ACTIVE_OPACITY.default}
      >
        <Ionicons name="trash-outline" size={18} color={DELETE_ACTION_BG} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.qrManage.title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          activeOpacity={ACTIVE_OPACITY.default}
        >
          <Text style={styles.addButtonText}>{t.qrManage.add}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {qrs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="qr-code-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>{t.qrManage.empty}</Text>
          <Text style={styles.emptyHint}>{t.qrManage.emptyHint}</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={handleAdd}
            activeOpacity={ACTIVE_OPACITY.default}
          >
            <Ionicons name="add" size={20} color={colors.accentText} />
            <Text style={styles.emptyAddText}>{t.qrManage.add}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={qrs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{t.qrManage.deleted}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SCREEN_PADDING.top,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.heading3,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
  },
  addButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: c.overlay.accent10,
  },
  addButtonText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accent,
  },

  // List
  list: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING['5xl'],
  },
  separator: {
    height: SPACING.sm,
  },

  // Card
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.bgSecondary,
    borderRadius: RADIUS.base,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qrIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: c.overlay.accent10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.textPrimary,
  },
  cardData: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['5xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: c.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.medium,
    color: c.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyHint: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: c.accent,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
  },
  emptyAddText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accentText,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: SPACING['9xl'],
    alignSelf: 'center',
    backgroundColor: c.bgSecondary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.medium,
    color: c.textPrimary,
  },
});
