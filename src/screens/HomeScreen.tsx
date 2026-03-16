import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeScreenProps } from '../navigation/AppNavigator';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  DIMENSIONS,
  ELEVATION,
} from '../utils/constants';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>ClearRead</Text>
        <Text style={styles.tagline}>The physical world, made readable</Text>

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={() => navigation.navigate('Camera')}
          accessibilityLabel="Scan text with camera"
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>Scan Text</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    width: '100%',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.appTitle,
    color: COLORS.primary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.itemGap,
  },
  ctaButton: {
    width: '80%',
    height: DIMENSIONS.ctaHeight,
    backgroundColor: COLORS.primary,
    borderRadius: DIMENSIONS.ctaRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sectionGap,
    ...ELEVATION.small,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.button,
    color: COLORS.textWhite,
  },
});
