import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReaderScreenProps } from '../navigation/AppNavigator';
import { useSettings } from '../context/SettingsContext';
import { WordHighlighter } from '../components/WordHighlighter';
import {
  buildTimeline,
  startHighlighting,
  type HighlightControls,
} from '../utils/ttsEngine';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  DIMENSIONS,
  ELEVATION,
} from '../utils/constants';

export function ReaderScreen({ navigation, route }: ReaderScreenProps) {
  const { extractedText } = route.params;
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();

  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const highlightControlsRef = useRef<HighlightControls | null>(null);
  // Keep a stable ref to currentWordIndex for use inside callbacks
  const currentWordIndexRef = useRef(-1);
  currentWordIndexRef.current = currentWordIndex;

  const words = useMemo(
    () => extractedText.split(/\s+/).filter(Boolean),
    [extractedText]
  );

  const lineHeight = settings.fontSize * SPACING.lineHeightMultiplier;

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      Speech.stop();
      highlightControlsRef.current?.stop();
    };
  }, []);

  // ── TTS handlers ──────────────────────────────────────────────────────────

  const resetState = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  };

  const handlePlay = () => {
    if (words.length === 0) return;

    const timeline = buildTimeline(words, settings.readingSpeed);
    const controls = startHighlighting(timeline, setCurrentWordIndex, resetState);
    highlightControlsRef.current = controls;

    Speech.speak(extractedText, {
      rate: settings.readingSpeed,
      language: 'en-US',
      onDone: () => {
        controls.stop();
        resetState();
      },
      onStopped: () => {
        controls.stop();
        resetState();
      },
      onError: () => {
        controls.stop();
        resetState();
      },
    });

    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    // Use stop-and-restart fallback — Speech.pause() unreliable on Android
    Speech.stop();
    highlightControlsRef.current?.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    const resumeIndex = currentWordIndexRef.current;
    if (resumeIndex >= words.length) {
      handleStop();
      return;
    }

    const remainingWords = words.slice(resumeIndex);
    const remainingText = remainingWords.join(' ');
    const remainingTimeline = buildTimeline(remainingWords, settings.readingSpeed);

    const controls = startHighlighting(
      remainingTimeline,
      (relativeIndex) => setCurrentWordIndex(resumeIndex + relativeIndex),
      resetState
    );
    highlightControlsRef.current = controls;

    Speech.speak(remainingText, {
      rate: settings.readingSpeed,
      language: 'en-US',
      onDone: () => {
        controls.stop();
        resetState();
      },
      onStopped: () => {
        controls.stop();
        resetState();
      },
      onError: () => {
        controls.stop();
        resetState();
      },
    });

    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    try {
      Speech.stop();
      highlightControlsRef.current?.stop();
    } catch {
      // ignore
    }
    resetState();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.headerWrapper, { backgroundColor: settings.backgroundColor, paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => { handleStop(); navigation.goBack(); }}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Go back to camera"
          >
            <Text style={styles.headerButtonText}>{'< Back'}</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text style={styles.headerButtonText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Main content ───────────────────────────────────────────────── */}
      {words.length > 0 ? (
        <>
          <ScrollView
            style={[styles.scrollView, { backgroundColor: settings.backgroundColor }]}
            contentContainerStyle={styles.scrollContent}
          >
            <WordHighlighter
              words={words}
              currentWordIndex={currentWordIndex}
              fontSize={settings.fontSize}
              letterSpacing={SPACING.letterSpacing}
              lineHeight={lineHeight}
              highlightColor={COLORS.highlight}
              textColor={COLORS.textDark}
            />
          </ScrollView>

          {/* ── TTS controls bar ───────────────────────────────────────── */}
          <View style={[styles.ttsBar, { paddingBottom: insets.bottom }]}>
            {/* Play — shown when idle */}
            {!isPlaying && !isPaused && (
              <Pressable
                style={styles.ttsButton}
                onPress={handlePlay}
                accessibilityRole="button"
                accessibilityLabel="Play"
              >
                <Text style={styles.ttsButtonText}>▶</Text>
              </Pressable>
            )}

            {/* Pause — shown while playing */}
            {isPlaying && !isPaused && (
              <Pressable
                style={styles.ttsButton}
                onPress={handlePause}
                accessibilityRole="button"
                accessibilityLabel="Pause"
              >
                <Text style={styles.ttsButtonText}>⏸</Text>
              </Pressable>
            )}

            {/* Resume — shown while paused */}
            {isPaused && (
              <Pressable
                style={styles.ttsButton}
                onPress={handleResume}
                accessibilityRole="button"
                accessibilityLabel="Resume"
              >
                <Text style={styles.ttsButtonText}>▶</Text>
              </Pressable>
            )}

            {/* Stop — shown while playing or paused */}
            {(isPlaying || isPaused) && (
              <Pressable
                style={[styles.ttsButton, styles.ttsStopButton]}
                onPress={handleStop}
                accessibilityRole="button"
                accessibilityLabel="Stop"
              >
                <Text style={styles.ttsButtonText}>⏹</Text>
              </Pressable>
            )}
          </View>
        </>
      ) : (
        /* ── Empty state ───────────────────────────────────────────────── */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No text detected.</Text>
          <Text style={styles.emptyMessage}>
            Try holding your phone closer or improving the lighting.
          </Text>
          <Pressable
            style={styles.tryAgainButton}
            onPress={() => navigation.navigate('Camera')}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default ReaderScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },
  // Header
  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: SPACING.screenPadding,
  },
  headerButton: {
    minWidth: DIMENSIONS.minTouchTarget,
    minHeight: DIMENSIONS.minTouchTarget,
    justifyContent: 'center',
  },
  headerButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  // Text content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.itemGap,
  },
  // TTS controls
  ttsBar: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.itemGap,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surfaceWhite,
  },
  ttsButton: {
    width: DIMENSIONS.ttsControlSize,
    height: DIMENSIONS.ttsControlSize,
    borderRadius: DIMENSIONS.ttsControlRadius,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.small,
  },
  ttsStopButton: {
    backgroundColor: COLORS.textMuted,
  },
  ttsButtonText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textWhite,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCream,
    paddingHorizontal: SPACING.screenPadding,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.itemGap,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.screenTitle,
    color: COLORS.textDark,
    marginBottom: SPACING.smallGap,
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: FONT_SIZES.body * 1.5,
    marginBottom: SPACING.sectionGap,
  },
  tryAgainButton: {
    width: '80%',
    height: DIMENSIONS.ctaHeight,
    backgroundColor: COLORS.primary,
    borderRadius: DIMENSIONS.ctaRadius,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.small,
  },
  tryAgainText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.button,
    color: COLORS.textWhite,
  },
});
