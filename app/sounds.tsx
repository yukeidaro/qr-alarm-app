/**
 * SoundsScreen — Light grey + orange design
 * Matches design from screens-app.jsx SoundPickerScreen.
 * SubShell nav + volume slider + theme-pill tabs + grouped card with play/pause circles + name/desc + check.
 * Preserves: preview play/stop, custom upload, delete custom, all categories.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Paths, Directory, File as FSFile } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect } from 'react-native-svg';
import { previewSound } from '../services/audioService';
import {
  getCustomSounds,
  saveCustomSound,
  deleteCustomSound,
  CustomSound,
} from '../services/storageService';
import { setPendingSound } from '../services/soundSelectionStore';
import {
  SOUND_CATEGORIES,
  getSoundsByCategory,
  SoundCategory,
  SoundDefinition,
} from '../constants/sounds';
import { t } from '../i18n';

import { useC, type AppPalette, LIGHT_PALETTE } from '../constants/palette';

const C = LIGHT_PALETTE;

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const CUSTOM_KEY = 'custom' as const;
type TabKey = SoundCategory | typeof CUSTOM_KEY;

function BackArrow() {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15" fill="none">
      <Path d="M8 1L2 7.5 8 14" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function VolumeLowIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
      <Path d="M2 6h2l4-4v12l-4-4H2V6z" stroke={C.ink3} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}

function VolumeHighIcon() {
  return (
    <Svg width={16} height={14} viewBox="0 0 18 16" fill="none">
      <Path d="M2 5h2l4-4v12l-4-4H2V5z" stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M12 4c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4" stroke={C.ink} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function PlayIcon({ color }: { color: string }) {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
      <Path d="M1 1l8 5-8 5V1z" fill={color} />
    </Svg>
  );
}

function PauseIcon({ color }: { color: string }) {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
      <Rect x={0.5} y={0.5} width={3} height={11} rx={1} fill={color} />
      <Rect x={6.5} y={0.5} width={3} height={11} rx={1} fill={color} />
    </Svg>
  );
}

function CheckMark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M3 8l4 4 6-7" stroke={C.orange} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M7 1v12M1 7h12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function getSoundDisplayName(item: SoundDefinition | CustomSound): string {
  if ('uri' in item) return item.name;
  return t.sounds[item.id] || item.id;
}

function getSoundDesc(item: SoundDefinition | CustomSound): string {
  if ('uri' in item) return 'マイサウンド';
  return (t.soundDescriptions && t.soundDescriptions[item.id]) || '';
}

function getCategoryLabel(key: TabKey): string {
  if (key === CUSTOM_KEY) return t.soundBrowser.customSection;
  return (t.soundBrowser.categories as Record<string, string>)[key] || key;
}

export default function SoundsScreen() {
  const router = useRouter();
  const { currentSoundId } = useLocalSearchParams<{ currentSoundId?: string }>();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [selectedSoundId, setSelectedSoundId] = useState<string>(currentSoundId || 'gentle');
  const [activeTab, setActiveTab] = useState<TabKey>(SOUND_CATEGORIES[0].key);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const [volume, setVolume] = useState(0.72);
  const previewRef = useRef<any>(null);

  // Scroll-driven theme tracking
  const listScrollRef = useRef<ScrollView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const tabOffsets = useRef<Record<string, number>>({});
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    getCustomSounds().then(setCustomSounds);
    return () => {
      if (previewRef.current) {
        try { previewRef.current.stopAsync(); previewRef.current.unloadAsync(); } catch {}
        previewRef.current = null;
      }
    };
  }, []);

  const stopPreview = async () => {
    if (previewRef.current) {
      try { await previewRef.current.stopAsync(); await previewRef.current.unloadAsync(); } catch {}
      previewRef.current = null;
    }
    setPlayingSoundId(null);
  };

  const handlePreview = async (item: SoundDefinition | CustomSound) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isCustom = 'uri' in item;

    // Always select the sound on tap
    setSelectedSoundId(item.id);

    // Toggle off if same sound is playing
    if (playingSoundId === item.id) {
      await stopPreview();
      return;
    }

    await stopPreview();
    setPlayingSoundId(item.id);
    const sound = await previewSound(item.id, isCustom ? (item as CustomSound).uri : undefined);
    if (sound) {
      previewRef.current = sound;
      await sound.setVolumeAsync(volume);
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          if (status.isLooping) {
            sound.replayAsync().catch(() => {});
          } else {
            try { await sound.stopAsync(); await sound.unloadAsync(); } catch {}
            if (previewRef.current === sound) {
              previewRef.current = null;
              setPlayingSoundId((prev) => (prev === item.id ? null : prev));
            }
          }
        }
      });
    }
  };

  const handleVolumeChange = async (val: number) => {
    setVolume(val);
    if (previewRef.current) {
      try { await previewRef.current.setVolumeAsync(val); } catch {}
    }
  };

  const handleSelectAndBack = async (id: string) => {
    Haptics.selectionAsync();
    setSelectedSoundId(id);
    await stopPreview();
    setPendingSound(id);
    router.back();
  };

  const handleAddCustom = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const destDir = new Directory(Paths.document, 'custom_sounds/');
      if (!destDir.exists) destDir.create();
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
    } catch {}
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

  // Compute current list (per-section)
  const tabs: TabKey[] = [
    ...SOUND_CATEGORIES.map((c) => c.key as TabKey),
    CUSTOM_KEY,
  ];

  const itemsForTab = (key: TabKey): (SoundDefinition | CustomSound)[] =>
    key === CUSTOM_KEY
      ? customSounds
      : getSoundsByCategory(key as SoundCategory);

  // When user taps a tab pill -> scroll list to that section
  const handleTabPress = useCallback((key: TabKey) => {
    Haptics.selectionAsync();
    setActiveTab(key);
    const y = sectionOffsets.current[key];
    if (y !== undefined && listScrollRef.current) {
      isProgrammaticScroll.current = true;
      listScrollRef.current.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 450);
    }
  }, []);

  // When list scrolls -> auto-highlight matching tab + scroll tab strip into view
  const handleListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const y = e.nativeEvent.contentOffset.y;
    // Find the section whose offset is closest above y + small threshold
    let current: TabKey = tabs[0];
    for (const key of tabs) {
      const off = sectionOffsets.current[key];
      if (off === undefined) continue;
      if (y + 60 >= off) current = key;
    }
    if (current !== activeTab) {
      setActiveTab(current);
      Haptics.selectionAsync();
      const tx = tabOffsets.current[current];
      if (tx !== undefined && tabsScrollRef.current) {
        tabsScrollRef.current.scrollTo({ x: Math.max(0, tx - 16), animated: true });
      }
    }
  }, [activeTab, tabs]);

  return (
    <View style={styles.root}>
      {/* SubShell nav: back + title */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} style={styles.navLeft}>
          <BackArrow />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t.soundBrowser.title}</Text>
        <View style={styles.navRight} />
      </View>

      {/* Volume slider card */}
      <View style={styles.volumeCard}>
        <View style={styles.volumeRow}>
          <VolumeLowIcon />
          <View style={styles.sliderWrap}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={C.orange}
              maximumTrackTintColor={C.line}
              thumbTintColor="#FFFFFF"
            />
          </View>
          <VolumeHighIcon />
        </View>
      </View>

      {/* Theme tabs (horizontal scroll, pill style) */}
      <View style={styles.tabsBar}>
        <ScrollView
          ref={tabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={styles.tabsScroll}
        >
          {tabs.map((key) => {
            const isActive = key === activeTab;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleTabPress(key)}
                activeOpacity={0.8}
                onLayout={(e: LayoutChangeEvent) => {
                  tabOffsets.current[key] = e.nativeEvent.layout.x;
                }}
                style={[
                  styles.tabPill,
                  isActive ? styles.tabPillActive : styles.tabPillInactive,
                ]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {getCategoryLabel(key)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={listScrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleListScroll}
        scrollEventThrottle={16}
      >
        {tabs.map((tabKey) => {
          const items = itemsForTab(tabKey);
          return (
            <View
              key={tabKey}
              onLayout={(e: LayoutChangeEvent) => {
                sectionOffsets.current[tabKey] = e.nativeEvent.layout.y;
              }}
              style={styles.section}
            >
              <Text style={styles.sectionHeader}>{getCategoryLabel(tabKey)}</Text>

              {tabKey === CUSTOM_KEY && (
                <TouchableOpacity style={styles.addCta} onPress={handleAddCustom} activeOpacity={0.8}>
                  <PlusIcon color={C.orange} />
                  <Text style={styles.addCtaText}>{t.soundBrowser.addCustom}</Text>
                </TouchableOpacity>
              )}

              {items.length === 0 ? (
                <Text style={styles.emptyText}>
                  {tabKey === CUSTOM_KEY ? 'サウンドがありません' : '—'}
                </Text>
              ) : (
                <View style={styles.listCard}>
                  {items.map((item, idx) => {
                    const isSelected = item.id === selectedSoundId;
                    const isPlaying = item.id === playingSoundId;
                    const isCustom = 'uri' in item;
                    return (
                      <View key={item.id}>
                        <TouchableOpacity
                          style={[styles.row, isSelected && styles.rowSelected]}
                          onPress={() => handleSelectAndBack(item.id)}
                          onLongPress={isCustom ? () => handleDeleteCustom(item as CustomSound) : undefined}
                          activeOpacity={0.85}
                        >
                          <TouchableOpacity
                            onPress={() => handlePreview(item)}
                            activeOpacity={0.7}
                            style={[
                              styles.playCircle,
                              isSelected ? styles.playCircleSelected : styles.playCircleNormal,
                            ]}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            {isPlaying ? (
                              <PauseIcon color={isSelected ? '#FFFFFF' : C.ink3} />
                            ) : (
                              <PlayIcon color={isSelected ? '#FFFFFF' : C.ink3} />
                            )}
                          </TouchableOpacity>
                          <View style={styles.col}>
                            <Text
                              style={[styles.name, isSelected && styles.nameSelected]}
                              numberOfLines={1}
                            >
                              {getSoundDisplayName(item)}
                            </Text>
                            {!!getSoundDesc(item) && (
                              <Text style={styles.desc} numberOfLines={1}>
                                {getSoundDesc(item)}
                              </Text>
                            )}
                          </View>
                          {isSelected && <CheckMark />}
                        </TouchableOpacity>
                        {idx < items.length - 1 && <View style={styles.divider} />}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = makeStyles(C);
function makeStyles(C: AppPalette) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    ...Platform.select({ ios: { paddingTop: 50 }, android: { paddingTop: 28 } }),
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  navRight: { width: 80, alignItems: 'flex-end' as const },
  backText: { color: C.orange, fontSize: 16, fontFamily: F.semi, marginLeft: 2 },
  doneText: { color: C.orange, fontSize: 16, fontFamily: F.bold },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: F.bold,
    color: C.ink,
    letterSpacing: -0.3,
  },

  /* Volume slider card */
  volumeCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sliderWrap: { flex: 1 },
  slider: { width: '100%', height: 20 },

  tabsBar: {
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: C.bg,
  },
  tabsScroll: { maxHeight: 56 },
  tabsRow: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 8,
    alignItems: 'center',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontFamily: F.semi,
    fontSize: 13,
    color: C.ink3,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabPillActive: { backgroundColor: C.ink, borderColor: C.ink },
  tabPillInactive: { backgroundColor: C.surface, borderColor: C.line },
  tabText: { fontSize: 13, fontFamily: F.semi, color: C.ink2 },
  tabTextActive: { color: '#FFFFFF' },

  content: { paddingBottom: 60 },

  addCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed' as const,
    borderColor: C.orange,
    backgroundColor: C.orangeDim,
  },
  addCtaText: { fontSize: 14, fontFamily: F.bold, color: C.orange },

  emptyText: {
    textAlign: 'center',
    color: C.ink3,
    fontSize: 13,
    paddingTop: 40,
    fontFamily: F.regular,
  },

  listCard: {
    marginHorizontal: 20,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowSelected: { backgroundColor: C.orangeDim },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  playCircleNormal: { backgroundColor: C.surfaceAlt, borderColor: C.line },
  playCircleSelected: { backgroundColor: C.orange, borderColor: C.orange },
  col: { flex: 1 },
  name: {
    fontSize: 15,
    fontFamily: F.medium,
    color: C.ink,
    letterSpacing: -0.2,
  },
  nameSelected: { fontFamily: F.bold },
  desc: {
    fontSize: 12,
    color: C.ink3,
    marginTop: 2,
    fontFamily: F.regular,
  },
  divider: { height: 1, backgroundColor: C.lineSoft, marginLeft: 64 },
});
}
