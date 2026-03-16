import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BACKGROUND_OPTIONS, COLORS, DIMENSIONS, FONTS, FONT_SIZES, SPACING } from '../utils/constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      {BACKGROUND_OPTIONS.map((option) => {
        const isSelected = selectedColor === option.hex;
        return (
          <Pressable
            key={option.key}
            onPress={() => onColorChange(option.hex)}
            style={styles.swatchWrapper}
            accessibilityRole="button"
            accessibilityLabel={`Set background to ${option.label}`}
          >
            <View
              style={[
                styles.swatch,
                { backgroundColor: option.hex },
                isSelected ? styles.swatchSelected : styles.swatchUnselected,
              ]}
            />
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default ColorPicker;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.itemGap,
  },
  swatchWrapper: {
    alignItems: 'center',
    gap: SPACING.smallGap,
  },
  swatch: {
    width: DIMENSIONS.colorSwatchSize,
    height: DIMENSIONS.colorSwatchSize,
    borderRadius: DIMENSIONS.colorSwatchSize / 2,
  },
  swatchSelected: {
    borderWidth: DIMENSIONS.colorSwatchBorderSelected,
    borderColor: COLORS.primary,
  },
  swatchUnselected: {
    borderWidth: DIMENSIONS.colorSwatchBorderUnselected,
    borderColor: COLORS.border,
  },
  label: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
