import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { SOUND_CATALOG } from '../constants/sounds';

let currentSound: Audio.Sound | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;

// Preset sound map - derived from sound catalog
const PRESET_SOUNDS: Record<string, any> = Object.fromEntries(
  SOUND_CATALOG.map((s) => [s.id, s.asset])
);

export async function configureAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
  });
}

export async function playAlarm(soundId: string = 'gentle', customUri?: string): Promise<void> {
  await configureAudio();
  await stopAlarm();

  const source = customUri
    ? { uri: customUri }
    : PRESET_SOUNDS[soundId] || PRESET_SOUNDS.gentle;

  const { sound } = await Audio.Sound.createAsync(source, {
    isLooping: true,
    volume: 1.0,
    shouldPlay: true,
  });

  currentSound = sound;
  startVibration();
}

export async function stopAlarm(): Promise<void> {
  stopVibration();
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

export async function previewSound(soundId: string, customUri?: string): Promise<Audio.Sound | null> {
  await configureAudio();
  const source = customUri
    ? { uri: customUri }
    : PRESET_SOUNDS[soundId] || PRESET_SOUNDS.gentle;

  if (!source) return null;

  const { sound } = await Audio.Sound.createAsync(source, {
    shouldPlay: true,
    volume: 0.5,
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
