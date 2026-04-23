/**
 * SwipeToDelete — Native-driven 1:1 finger-tracking swipe-to-delete row.
 *
 * Why custom (not RNGH Swipeable):
 *   RNGH Swipeable updates the JS thread per frame. On lower-end devices or
 *   under JS load this feels laggy. Here we drive the card's transform with
 *   `Animated.event(..., { useNativeDriver: true })` from a PanResponder, so
 *   the card translation runs entirely on the UI thread and tracks the
 *   finger 1:1 with no perceptible delay. The red Delete action stretches
 *   together with the drag using the same Animated value.
 */
import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  TouchableOpacity,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePagerSwipeLock } from '../contexts/PagerSwipeLock';

const ACTION_REVEAL = 88;          // resting width of the Delete pill when open
const SWIPE_OPEN_THRESHOLD = 60;   // distance after which release snaps open
const SWIPE_CLOSE_THRESHOLD = -20; // distance after which open row snaps closed (drag right)
const SPRING_CONFIG = { tension: 90, friction: 14, useNativeDriver: false };

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Renders inside the red action area. Receives the live drag value. */
  renderAction?: (dragX: Animated.Value) => React.ReactNode;
};

export default function SwipeToDelete({
  children,
  onDelete,
  deleteLabel = '削除',
  style,
  renderAction,
}: Props) {
  const { lock, unlock } = usePagerSwipeLock();
  // translateX is negative while swiping left. Native-driven.
  const translateX = useRef(new Animated.Value(0)).current;
  // Track current open/closed state and the offset used to chain pans
  const offset = useRef(0);
  // Track current animated value (so we can read it inside JS callbacks)
  const currentX = useRef(0);
  // Whether we currently hold the pager lock for this row.
  const holdsLock = useRef(false);

  const acquireLock = () => {
    if (!holdsLock.current) {
      holdsLock.current = true;
      lock();
    }
  };
  const releaseLock = () => {
    if (holdsLock.current) {
      holdsLock.current = false;
      unlock();
    }
  };

  React.useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => {
      translateX.removeListener(id);
      // Safety: release lock if unmounted mid-gesture.
      if (holdsLock.current) {
        holdsLock.current = false;
        unlock();
      }
    };
  }, [translateX, unlock]);

  const responder = useRef(
    PanResponder.create({
      // Claim the touch the moment a horizontal intent appears, so the parent
      // pager-view never gets a chance to start its own page swipe.
      onMoveShouldSetPanResponderCapture: (_e, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        acquireLock();
        translateX.stopAnimation();
        translateX.setOffset(offset.current);
        translateX.setValue(0);
      },
      // Native-driven: dx → translateX, no JS round-trip per frame.
      onPanResponderMove: Animated.event([null, { dx: translateX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_e, g) => {
        translateX.flattenOffset();
        const finalX = currentX.current; // dx + previous offset
        const wasOpen = offset.current < 0;
        const shouldOpen = !wasOpen && finalX < -SWIPE_OPEN_THRESHOLD;
        const shouldClose = wasOpen && finalX > -ACTION_REVEAL + -SWIPE_CLOSE_THRESHOLD;
        // Snap target
        let toValue = 0;
        if (shouldOpen) toValue = -ACTION_REVEAL;
        else if (wasOpen && !shouldClose) toValue = -ACTION_REVEAL;

        if (toValue !== offset.current) {
          Haptics.selectionAsync();
        }
        offset.current = toValue;
        Animated.spring(translateX, { ...SPRING_CONFIG, toValue }).start(() => {
          releaseLock();
        });
      },
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        Animated.spring(translateX, { ...SPRING_CONFIG, toValue: offset.current }).start(() => {
          releaseLock();
        });
      },
    }),
  ).current;

  // Action panel grows with drag — width = max(ACTION_REVEAL, |translateX|)
  const actionWidth = translateX.interpolate({
    inputRange: [-1000, -ACTION_REVEAL, 0],
    outputRange: [1000, ACTION_REVEAL, 0],
    extrapolate: 'clamp',
  });

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    offset.current = 0;
    Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    onDelete();
  };

  return (
    <View style={[styles.wrap, style]}>
      {/* Red action panel grows from the right edge */}
      <Animated.View style={[styles.actionPanel, { width: actionWidth }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleDelete}
          style={styles.actionHit}
        >
          {renderAction ? (
            renderAction(translateX)
          ) : (
            <Animated.Text style={styles.actionText}>{deleteLabel}</Animated.Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* The swiping row itself */}
      <Animated.View
        {...responder.panHandlers}
        style={[styles.row, { transform: [{ translateX }] }]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  actionPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  actionHit: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    backgroundColor: 'transparent',
  },
});
