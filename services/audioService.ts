import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOUND_CATALOG } from '../constants/sounds';

export type SoundOutputMode = 'device' | 'bluetooth' | 'auto';
const SOUND_OUTPUT_KEY = '@qralarm/sound_output';

let currentSound: Audio.Sound | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;
let fadeInInterval: ReturnType<typeof setInterval> | null = null;

// Preset sound map - derived from sound catalog
const PRESET_SOUNDS: Record<string, any> = Object.fromEntries(
  SOUND_CATALOG.map((s) => [s.id, s.asset])
);

const FADE_IN_DURATION = 30000; // 30 seconds
const FADE_IN_STEP = 500; // update every 500ms

export async function getSoundOutputMode(): Promise<SoundOutputMode> {
  const val = await AsyncStorage.getItem(SOUND_OUTPUT_KEY);
  if (val === 'device' || val === 'bluetooth' || val === 'auto') return val;
  return 'auto';
}

export async function configureAudio(outputMode?: SoundOutputMode): Promise<void> {
  const mode = outputMode ?? await getSoundOutputMode();
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    // When 'device' is selected, allowsRecordingIOS can force audio to
    // the built-in speaker on some iOS versions by switching the audio
    // session category, bypassing Bluetooth output.
    allowsRecordingIOS: mode === 'device',
    playThroughEarpieceAndroid: false,
  });
  // If we used the recording trick, immediately disable it to avoid
  // side-effects on the actual audio session (no mic needed).
  if (mode === 'device') {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      allowsRecordingIOS: false,
      playThroughEarpieceAndroid: false,
    });
  }
}

export async function playAlarm(
  soundId: string = 'gentle',
  customUri?: string,
  volume: number = 1.0,
  fadeIn: boolean = false,
  outputMode?: SoundOutputMode,
): Promise<void> {
  await configureAudio(outputMode);
  await stopAlarm();

  const source = customUri
    ? { uri: customUri }
    : PRESET_SOUNDS[soundId] || PRESET_SOUNDS.gentle;

  const targetVolume = Math.max(0, Math.min(1, volume));
  const startVolume = fadeIn ? 0.05 : targetVolume;

  const { sound } = await Audio.Sound.createAsync(source, {
    isLooping: true,
    volume: startVolume,
    shouldPlay: true,
  });

  // Fallback: manually replay if isLooping fails (known expo-av issue on some devices/formats)
  sound.setOnPlaybackStatusUpdate((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish && !status.isLooping) {
      sound.replayAsync().catch(() => {});
    }
  });

  currentSound = sound;
  startVibration();

  if (fadeIn && targetVolume > startVolume) {
    startFadeIn(sound, startVolume, targetVolume);
  }
}

function startFadeIn(sound: Audio.Sound, from: number, to: number): void {
  stopFadeIn();
  const steps = FADE_IN_DURATION / FADE_IN_STEP;
  const increment = (to - from) / steps;
  let currentVolume = from;
  let stepCount = 0;

  fadeInInterval = setInterval(async () => {
    stepCount++;
    currentVolume = Math.min(to, currentVolume + increment);
    try {
      await sound.setVolumeAsync(currentVolume);
    } catch {
      // Sound may have been unloaded
    }
    if (stepCount >= steps || currentVolume >= to) {
      stopFadeIn();
    }
  }, FADE_IN_STEP);
}

function stopFadeIn(): void {
  if (fadeInInterval) {
    clearInterval(fadeInInterval);
    fadeInInterval = null;
  }
}

export async function stopAlarm(): Promise<void> {
  stopVibration();
  stopFadeIn();
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Sound may already be unloaded
    }
    currentSound = null;
  }
}

export async function previewSound(soundId: string, customUri?: string, volume?: number): Promise<Audio.Sound | null> {
  await configureAudio();
  const source = customUri
    ? { uri: customUri }
    : PRESET_SOUNDS[soundId] || PRESET_SOUNDS.gentle;

  if (!source) return null;

  const { sound } = await Audio.Sound.createAsync(source, {
    shouldPlay: true,
    isLooping: true,
    volume: volume ?? 0.5,
  });
  return sound;
}

function startVibration(): void {
  vibrationInterval = setInterval(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, 2000);
}

function stopVibration(): void {
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
}

export function getPresetSoundIds(): string[] {
  return Object.keys(PRESET_SOUNDS);
}

export function getSoundLabel(id: string): string {
  // Import dynamically to avoid circular deps
  const { t } = require('../i18n');
  return t.sounds[id] || id;
}
