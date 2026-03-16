import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, DIMENSIONS, SPACING } from '../utils/constants';

interface FontSizeSliderProps {
  value: number;
  onValueChange: (size: number) => void;
}

export function FontSizeSlider({ value, onValueChange }: FontSizeSliderProps) {
  const decrement = () => {
    if (value > FONT_SIZES.readerMin) onValueChange(value - 1);
  };
  const increment = () => {
    if (value < FONT_SIZES.readerMax) onValueChange(value + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.rangeLabel}>{FONT_SIZES.readerMin}</Text>

      <Pressable
        onPress={decrement}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Decrease font size"
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>

      <Text style={styles.currentValue}>{value}</Text>

      <Pressable
        onPress={increment}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Increase font size"
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>

      <Text style={styles.rangeLabel}>{FONT_SIZES.readerMax}</Text>
    </View>
  );
}

export default FontSizeSlider;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.smallGap,
  },
  rangeLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    width: 24,
    textAlign: 'center',
  },
  button: {
    width: DIMENSIONS.minTouchTarget,
    height: DIMENSIONS.minTouchTarget,
    borderRadius: DIMENSIONS.minTouchTarget / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.screenTitle,
    color: COLORS.textWhite,
    lineHeight: FONT_SIZES.screenTitle * 1.2,
  },
  currentValue: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.screenTitle,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
