/**
 * QR Alarm App — サウンドカタログ
 * カテゴリ別プリセットサウンド定義
 */

export type SoundCategory = 'gentle' | 'nature' | 'digital' | 'loud' | 'classical' | 'motivational' | 'fun' | 'voice';

export interface SoundDefinition {
  id: string;
  category: SoundCategory;
  asset: any;
}

export interface CategoryDefinition {
  key: SoundCategory;
  labelKey: string; // i18n key under soundBrowser.categories
}

export const SOUND_CATEGORIES: CategoryDefinition[] = [
  { key: 'gentle', labelKey: 'gentle' },
  { key: 'nature', labelKey: 'nature' },
  { key: 'digital', labelKey: 'digital' },
  { key: 'loud', labelKey: 'loud' },
  { key: 'classical', labelKey: 'classical' },
  { key: 'motivational', labelKey: 'motivational' },
  { key: 'fun', labelKey: 'fun' },
  { key: 'voice', labelKey: 'voice' },
];

export const SOUND_CATALOG: SoundDefinition[] = [
  // Gentle
  { id: 'gentle', category: 'gentle', asset: require('../assets/sounds/gentle.wav') },
  { id: 'gentle_chime', category: 'gentle', asset: require('../assets/sounds/gentle_chime.mp3') },
  { id: 'gentle_harp', category: 'gentle', asset: require('../assets/sounds/gentle_harp.mp3') },
  { id: 'gentle_musicbox', category: 'gentle', asset: require('../assets/sounds/gentle_musicbox.mp3') },
  { id: 'gentle_delicate', category: 'gentle', asset: require('../assets/sounds/gentle_delicate.mp3') },
  { id: 'gentle_morning_suno', category: 'gentle', asset: require('../assets/sounds/gentle_morning_suno.mp3') },
  { id: 'gentle_soft', category: 'gentle', asset: require('../assets/sounds/gentle_soft.mp3') },

  // Nature
  { id: 'nature', category: 'nature', asset: require('../assets/sounds/nature.wav') },
  { id: 'nature_birds', category: 'nature', asset: require('../assets/sounds/nature_birds.mp3') },
  { id: 'nature_ocean', category: 'nature', asset: require('../assets/sounds/nature_ocean.mp3') },
  { id: 'nature_rain', category: 'nature', asset: require('../assets/sounds/nature_rain.mp3') },

  // Digital
  { id: 'digital', category: 'digital', asset: require('../assets/sounds/digital.wav') },
  { id: 'digital_beep', category: 'digital', asset: require('../assets/sounds/digital_beep.mp3') },
  { id: 'digital_chiptune', category: 'digital', asset: require('../assets/sounds/digital_chiptune.mp3') },
  { id: 'digital_synth', category: 'digital', asset: require('../assets/sounds/digital_synth.mp3') },
  { id: 'digital_classic_beep', category: 'digital', asset: require('../assets/sounds/digital_classic_beep.wav') },
  { id: 'digital_morning_beep', category: 'digital', asset: require('../assets/sounds/digital_morning_beep.mp3') },
  { id: 'digital_robotic', category: 'digital', asset: require('../assets/sounds/digital_robotic.mp3') },

  // Loud
  { id: 'urgent', category: 'loud', asset: require('../assets/sounds/urgent.wav') },
  { id: 'loud_alarm', category: 'loud', asset: require('../assets/sounds/loud_alarm.mp3') },
  { id: 'loud_buzzer', category: 'loud', asset: require('../assets/sounds/loud_buzzer.mp3') },
  { id: 'loud_siren', category: 'loud', asset: require('../assets/sounds/loud_siren.mp3') },
  { id: 'loud_alarm_clock', category: 'loud', asset: require('../assets/sounds/loud_alarm_clock.wav') },
  { id: 'loud_analog_clock', category: 'loud', asset: require('../assets/sounds/loud_analog_clock.wav') },
  { id: 'loud_classic_alarm', category: 'loud', asset: require('../assets/sounds/loud_classic_alarm.mp3') },
  { id: 'loud_emergency_siren', category: 'loud', asset: require('../assets/sounds/loud_emergency_siren.mp3') },
  { id: 'loud_police', category: 'loud', asset: require('../assets/sounds/loud_police.wav') },
  { id: 'loud_crowd_scream', category: 'loud', asset: require('../assets/sounds/loud_crowd_scream.mp3') },
  { id: 'loud_rock', category: 'loud', asset: require('../assets/sounds/loud_rock.mp3') },
  { id: 'loud_siren_long', category: 'loud', asset: require('../assets/sounds/loud_siren_long.wav') },

  // Classical
  { id: 'classical_orchestra', category: 'classical', asset: require('../assets/sounds/classical_orchestra.mp3') },
  { id: 'classical_piano', category: 'classical', asset: require('../assets/sounds/classical_piano.mp3') },
  { id: 'classical_violin', category: 'classical', asset: require('../assets/sounds/classical_violin.mp3') },
  { id: 'classical_symphony', category: 'classical', asset: require('../assets/sounds/classical_symphony.mp3') },

  // Motivational
  { id: 'motivational_energy', category: 'motivational', asset: require('../assets/sounds/motivational_energy.mp3') },
  { id: 'motivational_inspire', category: 'motivational', asset: require('../assets/sounds/motivational_inspire.mp3') },
  { id: 'motivational_upbeat', category: 'motivational', asset: require('../assets/sounds/motivational_upbeat.mp3') },
  { id: 'motivational_epic_cinema', category: 'motivational', asset: require('../assets/sounds/motivational_epic_cinema.mp3') },

  // Fun
  { id: 'fun_rooster', category: 'fun', asset: require('../assets/sounds/fun_rooster.wav') },
  { id: 'fun_chicken', category: 'fun', asset: require('../assets/sounds/fun_chicken.wav') },
  { id: 'fun_dog_bark', category: 'fun', asset: require('../assets/sounds/fun_dog_bark.wav') },
  { id: 'fun_dog_beg', category: 'fun', asset: require('../assets/sounds/fun_dog_beg.mp3') },

  // Voice
  { id: 'voice_akira_ja', category: 'voice', asset: require('../assets/sounds/voice_akira_ja.mp3') },
  { id: 'voice_coach_en_short', category: 'voice', asset: require('../assets/sounds/voice_coach_en_short.mp3') },
  { id: 'voice_coach_en_long', category: 'voice', asset: require('../assets/sounds/voice_coach_en_long.mp3') },
  { id: 'voice_cheerful_en_1', category: 'voice', asset: require('../assets/sounds/voice_cheerful_en_1.mp3') },
  { id: 'voice_cheerful_en_2', category: 'voice', asset: require('../assets/sounds/voice_cheerful_en_2.mp3') },
  { id: 'voice_cheerful_en_3', category: 'voice', asset: require('../assets/sounds/voice_cheerful_en_3.mp3') },
  { id: 'voice_okiro_ja', category: 'voice', asset: require('../assets/sounds/voice_okiro_ja.mp3') },
];

/** Get sounds filtered by category (or all if null) */
export function getSoundsByCategory(category: SoundCategory | null): SoundDefinition[] {
  if (!category) return SOUND_CATALOG;
  return SOUND_CATALOG.filter((s) => s.category === category);
}

/** Get all sounds grouped by category for SectionList */
export function getAllSoundsGrouped(): { category: SoundCategory; data: SoundDefinition[] }[] {
  return SOUND_CATEGORIES
    .map(({ key }) => ({
      category: key,
      data: SOUND_CATALOG.filter((s) => s.category === key),
    }))
    .filter((section) => section.data.length > 0);
}
