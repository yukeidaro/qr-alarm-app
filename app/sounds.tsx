import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { Paths, Directory, File as FSFile } from 'expo-file-system';
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
import { useTheme } from '../theme';
import { GlassCard } from '../components/GlassCard';
import { ThemeColors } from '../constants/colors';
import { FONT_FAMILY, FONT_SIZE } from '../constants/typography';
import { SPACING, SCREEN_PADDING, RADIUS, SIZE, ACTIVE_OPACITY, ANIMATION } from '../constants/spacing';
import { t } from '../i18n';

type SectionData = {
  category: SoundCategory;
  data: (SoundDefinition | CustomSound)[];
};

const VIEWABILITY_CONFIG = {
  viewAreaCoveragePercentThreshold: 50,
};

export default function SoundsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { currentSoundId } = useLocalSearchParams<{ currentSoundId?: string }>();

  const [selectedSoundId, setSelectedSoundId] = useState(currentSoundId || 'gentle');
  const [activeCategory, setActiveCategory] = useState<SoundCategory | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const [visibleCategory, setVisibleCategory] = useState<SoundCategory | null>(null);
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
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          if (status.isLooping) {
            // Fallback: replay if native looping failed
            sound.replayAsync().catch(() => {});
          } else {
            try { await sound.stopAsync(); await sound.unloadAsync(); } catch {}
            if (previewRef.current === sound) {
              previewRef.current = null;
              setPlayingSoundId((prev) => (prev === soundId ? null : prev));
            }
          }
        }
      });
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
    setVisibleCategory(null);
  };

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ section?: SectionData }> }) => {
      if (activeCategory) return;
      const firstVisible = viewableItems.find(item => item.section);
      if (firstVisible?.section) {
        setVisibleCategory(firstVisible.section.category);
      }
    },
    [activeCategory]
  );

  const handleAddCustom = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      const destDir = new Directory(Paths.document, 'custom_sounds/');
      if (!destDir.exists) {
        destDir.create();
      }

      const destFile = new FSFile(destDir, `${Date.now()}_${file.name}`);
      const srcFile = new FSFile(file.uri);
      srcFile.copy(destFile);

      const newSound: CustomSound = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        uri: destFile.uri,
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
            try { const f = new FSFile(sound.uri); if (f.exists) f.delete(); } catch {}
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
      <GlassCard
        active={isSelected}
        style={styles.soundRow}
        borderRadius={RADIUS.base}
      >
        <TouchableOpacity
          style={styles.soundRowInner}
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
      </GlassCard>
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
            style={[styles.chip, !activeCategory && !visibleCategory && styles.chipActive]}
            onPress={() => { handleChipPress(null); }}
            activeOpacity={ACTIVE_OPACITY.default}
          >
            <Text style={[styles.chipText, !activeCategory && !visibleCategory && styles.chipTextActive]}>
              {t.soundBrowser.all}
            </Text>
          </TouchableOpacity>
          {SOUND_CATEGORIES.map(({ key, labelKey }) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, (activeCategory === key || (!activeCategory && visibleCategory === key)) && styles.chipActive]}
              onPress={() => handleChipPress(activeCategory === key ? null : key)}
              activeOpacity={ACTIVE_OPACITY.default}
            >
              <Text style={[styles.chipText, (activeCategory === key || (!activeCategory && visibleCategory === key)) && styles.chipTextActive]}>
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
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bgPrimary },
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
  backText: { fontSize: FONT_SIZE.bodySmall, color: c.textMuted, fontFamily: FONT_FAMILY.medium },
  headerTitle: { fontSize: FONT_SIZE.body, color: c.textPrimary, fontFamily: FONT_FAMILY.semiBold },

  // Chips
  chipScroll: { maxHeight: 56, marginBottom: SPACING.lg },
  chipRow: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.full,
    backgroundColor: c.bgTertiary,
    minHeight: 36,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  chipActive: {
    backgroundColor: c.accent,
  },
  chipText: {
    fontSize: FONT_SIZE.bodySmall,
    fontFamily: FONT_FAMILY.medium,
    color: c.textMuted,
    lineHeight: Math.round(FONT_SIZE.bodySmall * 1.2),
    includeFontPadding: false,
  },
  chipTextActive: {
    color: c.accentText,
    fontFamily: FONT_FAMILY.semiBold,
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
    color: c.textMuted,
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
    marginBottom: SPACING.sm,
  },
  soundRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    minHeight: 56,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: {
    borderColor: c.accent,
    backgroundColor: 'rgba(232, 168, 56, 0.10)',
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: c.accent,
  },
  soundLabel: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.regular,
    color: c.textMuted,
  },
  soundLabelActive: {
    color: c.textPrimary,
    fontFamily: FONT_FAMILY.medium,
  },
  playingIcon: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.bold,
    color: c.accent,
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
    backgroundColor: c.bgPrimary,
  },
  doneButton: {
    backgroundColor: c.accent,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  doneText: {
    fontSize: FONT_SIZE.body,
    fontFamily: FONT_FAMILY.semiBold,
    color: c.accentText,
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
    backgroundColor: c.bgSecondary,
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
    color: c.accent,
    marginTop: -1,
  },
  importText: {
    fontSize: FONT_SIZE.caption,
    fontFamily: FONT_FAMILY.medium,
    color: c.textPrimary,
  },
});
