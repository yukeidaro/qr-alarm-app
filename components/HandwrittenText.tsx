import { useEffect, useRef, useState, useCallback } from 'react';
import { Text, Animated, StyleSheet, TextStyle } from 'react-native';
import { FONT_FAMILY } from '../constants/typography';
import { ANIMATION } from '../constants/spacing';

interface HandwrittenTextProps {
  text: string;
  style?: TextStyle;
  speed?: number; // ms per character
  delay?: number; // ms before starting
  onComplete?: () => void;
}

export default function HandwrittenText({
  text,
  style,
  speed = 80,
  delay = 300,
  onComplete,
}: HandwrittenTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;

  // Stabilize onComplete reference to avoid re-triggering animation
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayedText('');
    opacity.setValue(0);

    // Handle empty string — no animation needed
    if (!text || text.length === 0) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startTimeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.duration.fast,
        useNativeDriver: true,
      }).start();

      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          onCompleteRef.current?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return (
    <Animated.Text
      style={[
        styles.base,
        style,
        { opacity },
      ]}
    >
      {displayedText}
      {displayedText.length < text.length && (
        <Text style={styles.cursor}>|</Text>
      )}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FONT_FAMILY.regular,
  },
  cursor: {
    opacity: 0.4,
    fontWeight: '100',
  },
});
