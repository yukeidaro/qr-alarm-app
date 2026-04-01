/**
 * QR Alarm App — AlarmCard
 * フラットカード。スワイプで削除。温もりのある視覚階層。
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Animated,
  StyleSheet,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import type { Alarm } from '../services/storageService';
import {
  BG_PRIMARY, BG_SECONDARY, ACCENT_PRIMARY,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, TEXT_CONTRAST,
  ERROR_BG, WARM_GLOW, BG_WARM_CARD,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, RADIUS, ACTIVE_OPACITY } from '../constants/spacing';
import { t, getDayNames } from '../i18n';

const DAY_LABELS = getDayNames();

export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (alarm: Alarm) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (alarm: Alarm) => void;
}

export default function AlarmCard({ alarm, onToggle, onPress, onDelete }: AlarmCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(alarm);
        }}
        activeOpacity={ACTIVE_OPACITY.default}
      >
        <Animated.Text style={[styles.deleteActionText, { transform: [{ scale }] }]}>
{t.edit.delete}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
      <TouchableOpacity
        style={[styles.card, !alarm.enabled && styles.cardDisabled]}
        onPress={() => onPress(alarm)}
        activeOpacity={ACTIVE_OPACITY.soft}
      >
        {/* Left accent bar — warm indicator */}
        {alarm.enabled && (
          <View style={styles.accentBar}>
            <View style={styles.accentBarGlow} />
          </View>
        )}

        <View style={styles.content}>
          {/* Time — large, thin, breathing */}
          <View style={styles.timeRow}>
            <Text style={[styles.time, !alarm.enabled && styles.dimmed]}>
              {formatTime(alarm.hour, alarm.minute)}
            </Text>
          </View>

          {/* Repeat days or one-time label */}
          {alarm.repeatDays.length > 0 ? (
            <View style={styles.repeatRow}>
              {DAY_LABELS.map((label, i) => {
                const active = alarm.repeatDays.includes(i);
                return (
                  <View key={i} style={[styles.dayChip, active && styles.dayChipActive]}>
                    <Text
                      style={[
                        styles.repeatDay,
                        active && styles.repeatDayActive,
                        !alarm.enabled && styles.dimmed,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.oneTime, !alarm.enabled && styles.dimmed]}>{t.edit.oneTime}</Text>
          )}
        </View>

        <Switch
          value={alarm.enabled}
          onValueChange={() => onToggle(alarm)}
          trackColor={{ false: '#DDD8D3', true: ACCENT_PRIMARY }}
          thumbColor={'#FFFFFF'}
          style={styles.toggle}
        />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    borderRadius: RADIUS.base,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardDisabled: {
    backgroundColor: BG_PRIMARY,
    opacity: 0.7,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: ACCENT_PRIMARY,
  },
  accentBarGlow: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 8,
    backgroundColor: WARM_GLOW,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingLeft: SPACING.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  time: {
    fontSize: FONT_SIZE.title1,
    fontFamily: FONT_FAMILY.semiBold,
    color: TEXT_PRIMARY,
    letterSpacing: 1,
  },
  dimmed: {
    opacity: ACTIVE_OPACITY.dimmed,
  },
  repeatRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  dayChip: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  dayChipActive: {
    backgroundColor: 'rgba(232, 168, 56, 0.12)',
  },
  repeatDay: {
    fontSize: FONT_SIZE.nano,
    color: TEXT_MUTED,
    fontFamily: FONT_FAMILY.regular,
    opacity: 0.3,
  },
  repeatDayActive: {
    color: ACCENT_PRIMARY,
    opacity: 1,
    fontFamily: FONT_FAMILY.semiBold,
  },
  oneTime: {
    fontSize: FONT_SIZE.labelSmall,
    color: TEXT_MUTED,
    marginTop: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
  },
  toggle: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  deleteAction: {
    backgroundColor: ERROR_BG,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: SPACING.md,
    borderTopRightRadius: RADIUS.base,
    borderBottomRightRadius: RADIUS.base,
  },
  deleteActionText: {
    color: TEXT_CONTRAST,
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.regular,
  },
});
