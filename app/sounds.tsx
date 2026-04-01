import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SectionList,
  Animated,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { previewSound } from '../services/audioService';
import { getCustomSounds, saveCustomSound, deleteCustomSound, CustomSound } from '../services/storageService';
import { setPendingSound } from '../services/soundSelectionStore';
import {
  SOUND_CATEGORIES,
  SOUND_CATALOG,
  getAllSoundsGrouped,
  getSoundsByCategory,
  SoundCategory,
  SoundDefinition,
} from '../constants/sounds';
import {
  BG_PRIMARY, BG_SECONDARY, BG_TERTIARY,
  ACCENT_PRIMARY, ACCENT_PRIMARY_TEXT, TEXT_PRIMARY,
  TEXT_SECONDARY, TEXT_MUTED, OVERLAY, TEXT_CONTRAST,
} from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ACTIVE_OPACITY, ANIMATION } from '../constants/spacing';
import { t } from '../i18n';

type SectionData = {
  category: SoundCategory;
  data: (SoundDefinition | CustomSound)[];
};

export default function SoundsScreen() {
  const router = useRouter();
  const { currentSoundId } = useLocalSearchParams<{ currentSoundId?: string }>();

  const [selectedSoundId, setSelectedSoundId] = useState(currentSoundId || 'gentle');
  const [activeCategory, setActiveCategory] = useState<SoundCategory | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const previewRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    getCustomSounds().then(setCustomSounds);
  }, []);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        try { previewRef.current.stopAsync(); previewRef.current.unloadAsync(); } catch {}
        previewRef.current = null;
      }
    };
  }, []);

  const handlePreview = async (soundId: string, customUri?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Stop current preview
    if (previewRef.current) {
      try { await previewRef.current.stopAsync(); await previewRef.current.unloadAsync(); } catch {}
      previewRef.current = null;
    }

    // If tapping the same sound that's playing, just stop
    if (playingSoundId === soundId) {
      setPlayingSoundId(null);
      return;
    }

    setSelectedSoundId(soundId);
    setPlayingSoundId(soundId);

    const sound = await previewSound(soundId, customUri);
    if (sound) {
      previewRef.current = sound;
      setTimeout(async () => {
        try { await sound.stopAsync(); await sound.unloadAsync(); } catch {}
        if (previewRef.current === sound) {
          previewRef.current = null;
          setPlayingSoundId((prev) => (prev === soundId ? null : prev));
        }
      }, 2000);
    }
  };

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Stop any playing preview
    if (previewRef.current) {
      try { await previewRef.current.stopAsync(); await previewRef.current.unloadAsync(); } catch {}
      previewRef.current = null;
    }
    setPendingSound(selectedSoundId);
    router.back();
  };

  const handleChipPress = (category: SoundCategory | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(category);
  };

  const handleAddCustom = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      const destDir = `${FileSystem.documentDirectory}custom_sounds/`;
      const dirInfo = await FileSystem.getInfoAsync(destDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
      }

      const destUri = `${destDir}${Date.now()}_${file.name}`;
      await FileSystem.copyAsync({ from: file.uri, to: destUri });

      const newSound: CustomSound = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        uri: destUri,
      };
      await saveCustomSound(newSound);
      setCustomSounds((prev) => [...prev, newSound]);
    } catch {
      // User cancelled or error
    }
  };

  const handleDeleteCustom = (sound: CustomSound) => {
    Alert.alert(
      t.soundBrowser.deleteCustom,
      t.soundBrowser.deleteConfirm,
      [
        { text: t.edit.cancel, style: 'cancel' },
        {
          text: t.edit.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteCustomSound(sound.id);
            try { await FileSystem.deleteAsync(sound.uri, { idempotent: true }); } catch {}
            setCustomSounds((prev) => prev.filter((s) => s.id !== sound.id));
            if (selectedSoundId === sound.id) setSelectedSoundId('gentle');
          },
        },
      ],
    );
  };

  const getSoundLabel = (item: SoundDefinition | CustomSound): string => {
    if ('uri' in item) return item.name;
    return t.sounds[item.id] || item.id;
  };

  const getCategoryLabel = (key: SoundCategory): string => {
    return (t.soundBrowser.categories as Record<string, string>)[key] || key;
  };

  // Build sections
  const buildSections = (): SectionData[] => {
    if (activeCategory) {
      const presets = getSoundsByCategory(activeCategory);
      const sections: SectionData[] = [{
        category: activeCategory,
        data: presets,
      }];
      return sections;
    }

    const grouped = getAllSoundsGrouped();
    const sections: SectionData[] = grouped.map(({ category, data }) => ({
      category,
      data: data as (SoundDefinition | CustomSound)[],
    }));

    // Add custom sounds section
    if (customSounds.length > 0) {
      sections.push({
        category: 'custom' as any,
        data: customSounds,
      });
    }

    return sections;
  };

  const sections = buildSections();

  const renderSectionHeader = ({ section }: { section: SectionData }) => {
    const label = section.category === ('custom' as any)
      ? t.soundBrowser.customSection
      : getCategoryLabel(section.category);
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: SoundDefinition | CustomSound }) => {
    const isCustom = 'uri' in item;
    const isSelected = selectedSoundId === item.id;
    const isPlaying = playingSoundId === item.id;

    return (
      <TouchableOpacity
        style={[styles.soundRow, isSelected && styles.soundRowActive]}
        onPress={() => handlePreview(item.id, isCustom ? (item as CustomSound).uri : undefined)}
        onLongPress={isCustom ? () => handleDeleteCustom(item as CustomSound) : undefined}
        activeOpacity={ACTIVE_OPACITY.default}
      >
        {/* Radio button */}
        <View style={[styles.radio, isSelected && styles.radioActive]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>

        {/* Label */}
        <Text style={[styles.soundLabel, isSelected && styles.soundLabelActive]} numberOfLines={1}>
          {getSoundLabel(item)}
        </Text>

        {/* Playing indicator */}
        {isPlaying && (
          <Text style={styles.playingIcon}>|||</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={ACTIVE_OPACITY.default} style={styles.backButton}>
            <Text style={styles.backText}>{t.edit.back}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.soundBrowser.title}</Text>
          <View style={{ width: 56 }} />
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          <TouchableOpacity
            style={[styles.chip, !activeCategory && styles.chipActive]}
            onPress={() => handleChipPress(null)}
            activeOpacity={ACTIVE_OPACITY.default}
          >
            <Text style={[styles.chipText, !activeCategory && styles.chipTextActive]}>
              {t.soundBrowser.all}
            </Text>
          </TouchableOpacity>
          {SOUND_CATEGORIES.map(({ key, labelKey }) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, activeCategory === key && styles.chipActive]}
              onPress={() => handleChipPress(activeCategory === key ? null : key)}
              activeOpacity={ACTIVE_OPACITY.default}
            >
              <Text style={[styles.chipText, activeCategory === key && styles.chipTextActive]}>
                {getCategoryLabel(key)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sound List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {/* Done Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={ACTIVE_OPACITY.default}>
            <Text style={styles.doneText}>{t.soundBrowser.done}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Import custom sound button */}
      <TouchableOpacity style={styles.importButton} onPress={handleAddCustom} activeOpacity={ACTIVE_OPACITY.default}>
        <Text style={styles.importIcon}>+</Text>
        <Text style={styles.importText}>{t.soundBrowser.importSound}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG_PRIMARY },
  container: { flex: 1 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING['7xl'],
    paddingHorizontal: SCREEN_PADDING.horizontal,
    marginBottom: SPACING.lg,
  },
  backButton: { paddingVertical: SPACING.xs, paddingRight: SPACING.lg },
  backText: { fontSize: FONT_SIZE.bodySmall, color: TEXT_MUTED, fontFamily: FONT_FAMILY.medium },
  headerTitle: { fontSize: FONT_SIZE.body, color: TEXT_PRIMARY, fontFamily: FONT_FAMILY.semiBold },

  // Chips
  chipScroll: { maxHeight: 48, marginBottom: SPACING.lg },
  chipRow: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: BG_TERTIARY,
  },
  chipActive: {
    backgroundColor: ACCENT_PRIMARY,
  },
  chipText: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.medium,
    color: TEXT_MUTED,
  },
  chipTextActive: {
    color: ACCENT_PRIMARY_TEXT,
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  sectionHeaderText: {
    fontSize: FONT_SIZE.labelSmall,
    fontFamily: FONT_FAMILY.medium,
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // List
  listContent: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingBottom: 140,
  },

  // Sound row
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_SECONDARY,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.base,
    marginBottom: SPACING.sm,
  },
  soundRowActive: {
    borderWidth: 1,
    borderColor: ACCENT_PRIMARY,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BG_TERTIARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  radioActive: {
    borderColor: ACCENT_PRIMARY,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACCENT_PRIMARY,
  },
  soundLabel: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.regular,
    color: TEXT_MUTED,
  },
  soundLabelActive: {
    color: TEXT_PRIMARY,
    fontFamily: FONT_FAMILY.medium,
  },
  playingIcon: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.bold,
    color: ACCENT_PRIMARY,
    letterSpacing: -1,
    marginLeft: SPACING.sm,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingBottom: SPACING['5xl'],
    paddingTop: SPACING.lg,
    backgroundColor: BG_PRIMARY,
  },
  doneButton: {
    backgroundColor: ACCENT_PRIMARY,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  doneText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: ACCENT_PRIMARY_TEXT,
  },

  // Import button
  importButton: {
    position: 'absolute',
    bottom: 100,
    right: SCREEN_PADDING.horizontal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
    backgroundColor: BG_SECONDARY,
    gap: SPACING.xs,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  importIcon: {
    fontSize: FONT_SIZE.heading3,
    fontFamily: FONT_FAMILY.regular,
    color: ACCENT_PRIMARY,
    marginTop: -1,
  },
  importText: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.medium,
    color: TEXT_PRIMARY,
  },
});
