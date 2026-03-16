import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, SPEED } from '../utils/constants';

interface SpeedOption {
  label: string;
  value: number;
}

const SPEED_OPTIONS: SpeedOption[] = [
  { label: 'Slow', value: SPEED.slow },
  { label: 'Normal', value: SPEED.normal },
  { label: 'Fast', value: SPEED.fast },
];

interface SpeedSelectorProps {
  selectedSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function SpeedSelector({ selectedSpeed, onSpeedChange }: SpeedSelectorProps) {
  return (
    <View style={styles.container}>
      {SPEED_OPTIONS.map((option) => {
        const isSelected = selectedSpeed === option.value;
        return (
          <Pressable
            key={option.label}
            onPress={() => onSpeedChange(option.value)}
            style={[styles.button, isSelected ? styles.buttonSelected : styles.buttonUnselected]}
            accessibilityRole="button"
            accessibilityLabel={`Set reading speed to ${option.label}`}
          >
            <Text style={[styles.buttonText, isSelected ? styles.textSelected : styles.textUnselected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default SpeedSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.smallGap,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonUnselected: {
    backgroundColor: COLORS.surfaceWhite,
    borderColor: COLORS.border,
  },
  buttonText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
  },
  textSelected: {
    color: COLORS.textWhite,
  },
  textUnselected: {
    color: COLORS.textDark,
  },
});
