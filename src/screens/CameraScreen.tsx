import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import type { CameraScreenProps } from '../navigation/AppNavigator';
import { CaptureButton } from '../components/CaptureButton';
import { extractText } from '../utils/ocrProcessor';
import { COLORS, FONTS, FONT_SIZES, SPACING, DIMENSIONS } from '../utils/constants';

export function CameraScreen({ navigation }: CameraScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    async function requestPermission() {
      const { granted } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(granted);
    }
    requestPermission();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'Camera is not ready. Please try again.');
      return;
    }
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) {
        throw new Error('No photo returned');
      }
      const text = await extractText(photo.uri);
      navigation.navigate('Reader', { extractedText: text });
    } catch {
      Alert.alert('Capture Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Permission loading ──────────────────────────────────────────────────
  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── Permission denied ───────────────────────────────────────────────────
  if (hasPermission === false) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionMessage}>
          ClearRead needs camera access to scan text. Please enable it in Settings.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={() => Linking.openSettings()}
          accessibilityRole="button"
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </Pressable>
        <Pressable
          style={styles.permissionButtonSecondary}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.permissionButtonSecondaryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // ── Camera view ─────────────────────────────────────────────────────────
  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <CaptureButton onPress={handleCapture} disabled={isProcessing} />

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.textWhite} />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

export default CameraScreen;

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCream,
    paddingHorizontal: SPACING.screenPadding,
  },
  permissionEmoji: {
    fontSize: 56,
    marginBottom: SPACING.itemGap,
  },
  permissionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.screenTitle,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: SPACING.smallGap,
  },
  permissionMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sectionGap,
    lineHeight: FONT_SIZES.body * 1.5,
  },
  permissionButton: {
    width: '100%',
    height: DIMENSIONS.ctaHeight,
    backgroundColor: COLORS.primary,
    borderRadius: DIMENSIONS.ctaRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.itemGap,
  },
  permissionButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.button,
    color: COLORS.textWhite,
  },
  permissionButtonSecondary: {
    width: '100%',
    height: DIMENSIONS.ctaHeight,
    backgroundColor: COLORS.bgCream,
    borderRadius: DIMENSIONS.ctaRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButtonSecondaryText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.button,
    color: COLORS.textDark,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: COLORS.textDark,
  },
  camera: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.textWhite,
    marginTop: SPACING.itemGap,
  },
});
