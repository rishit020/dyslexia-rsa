import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { COLORS, DIMENSIONS } from '../utils/constants';

interface CaptureButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function CaptureButton({ onPress, disabled }: CaptureButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      accessibilityLabel="Capture photo of text"
      accessibilityRole="button"
    >
      <View style={styles.inner} />
    </Pressable>
  );
}

export default CaptureButton;

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: DIMENSIONS.captureButtonBottom,
    alignSelf: 'center',
    width: DIMENSIONS.captureButtonOuter,
    height: DIMENSIONS.captureButtonOuter,
    borderRadius: DIMENSIONS.captureButtonOuter / 2,
    backgroundColor: COLORS.textWhite,
    borderWidth: DIMENSIONS.captureButtonBorder,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: DIMENSIONS.captureButtonInner,
    height: DIMENSIONS.captureButtonInner,
    borderRadius: DIMENSIONS.captureButtonInner / 2,
    backgroundColor: COLORS.textWhite,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.93 }],
  },
});
