/**
 * QR Alarm App — サウンドカタログ
 * カテゴリ別プリセットサウンド定義
 */

export type SoundCategory = 'gentle' | 'nature' | 'digital' | 'loud';

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
];

export const SOUND_CATALOG: SoundDefinition[] = [
  // Gentle
  { id: 'gentle', category: 'gentle', asset: require('../assets/sounds/gentle.wav') },

  // Nature
  { id: 'nature', category: 'nature', asset: require('../assets/sounds/nature.wav') },

  // Digital
  { id: 'digital', category: 'digital', asset: require('../assets/sounds/digital.wav') },

  // Loud
  { id: 'urgent', category: 'loud', asset: require('../assets/sounds/urgent.wav') },
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
