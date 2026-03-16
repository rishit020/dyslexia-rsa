import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SettingsScreenProps } from '../navigation/AppNavigator';
import { useSettings } from '../context/SettingsContext';
import { FontSizeSlider } from '../components/FontSizeSlider';
import { ColorPicker } from '../components/ColorPicker';
import { SpeedSelector } from '../components/SpeedSelector';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  DIMENSIONS,
} from '../utils/constants';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { settings, updateFontSize, updateBackgroundColor, updateReadingSpeed } = useSettings();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.headerBackText}>{'< Back'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          {/* Spacer to balance the back button */}
          <View style={styles.headerBackButton} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.sectionGap }]}
      >
        {/* ── Font Size ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Font Size</Text>
          <FontSizeSlider
            value={settings.fontSize}
            onValueChange={updateFontSize}
          />
        </View>

        {/* ── Background Color ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Background Color</Text>
          <ColorPicker
            selectedColor={settings.backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </View>

        {/* ── Reading Speed ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reading Speed</Text>
          <SpeedSelector
            selectedSpeed={settings.readingSpeed}
            onSpeedChange={updateReadingSpeed}
          />
        </View>

        {/* ── Preview ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preview</Text>
          <View style={[styles.previewBox, { backgroundColor: settings.backgroundColor }]}>
            <Text
              style={[
                styles.previewText,
                {
                  fontSize: settings.fontSize,
                  letterSpacing: SPACING.letterSpacing,
                  lineHeight: settings.fontSize * SPACING.lineHeightMultiplier,
                },
              ]}
            >
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surfaceWhite,
  },
  // Header
  headerWrapper: {
    backgroundColor: COLORS.surfaceWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: SPACING.screenPadding,
  },
  headerBackButton: {
    minWidth: DIMENSIONS.minTouchTarget,
    minHeight: DIMENSIONS.minTouchTarget,
    justifyContent: 'center',
  },
  headerBackText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.screenTitle,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sectionGap,
  },
  section: {
    marginBottom: SPACING.sectionGap,
    gap: SPACING.itemGap,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  // Preview
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.itemGap,
  },
  previewText: {
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
  },
});
