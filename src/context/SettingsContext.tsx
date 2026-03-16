import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, STORAGE_KEYS, COLORS } from '../utils/constants';

// ============================================================================
// INTERFACES
// ============================================================================

interface Settings {
  fontSize: number;
  backgroundColor: string;
  readingSpeed: number;
}

interface SettingsContextValue {
  settings: Settings;
  updateFontSize: (size: number) => void;
  updateBackgroundColor: (color: string) => void;
  updateReadingSpeed: (speed: number) => void;
  isLoaded: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>({
    fontSize: DEFAULT_SETTINGS.fontSize,
    backgroundColor: DEFAULT_SETTINGS.backgroundColor,
    readingSpeed: DEFAULT_SETTINGS.readingSpeed,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted settings from AsyncStorage on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const [fontSizeRaw, backgroundColorRaw, readingSpeedRaw] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.fontSize),
            AsyncStorage.getItem(STORAGE_KEYS.backgroundColor),
            AsyncStorage.getItem(STORAGE_KEYS.readingSpeed),
          ]);

        setSettings({
          fontSize: fontSizeRaw !== null
            ? parseFloat(fontSizeRaw)
            : DEFAULT_SETTINGS.fontSize,
          backgroundColor: backgroundColorRaw !== null
            ? backgroundColorRaw
            : DEFAULT_SETTINGS.backgroundColor,
          readingSpeed: readingSpeedRaw !== null
            ? parseFloat(readingSpeedRaw)
            : DEFAULT_SETTINGS.readingSpeed,
        });
      } catch {
        // Any read failure — keep defaults, still mark as loaded
      } finally {
        setIsLoaded(true);
      }
    }

    loadSettings();
  }, []);

  // Update functions: update state immediately, persist fire-and-forget
  const updateFontSize = (size: number) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
    AsyncStorage.setItem(STORAGE_KEYS.fontSize, String(size));
  };

  const updateBackgroundColor = (color: string) => {
    setSettings(prev => ({ ...prev, backgroundColor: color }));
    AsyncStorage.setItem(STORAGE_KEYS.backgroundColor, color);
  };

  const updateReadingSpeed = (speed: number) => {
    setSettings(prev => ({ ...prev, readingSpeed: speed }));
    AsyncStorage.setItem(STORAGE_KEYS.readingSpeed, String(speed));
  };

  // Block render until settings are loaded from storage
  if (!isLoaded) {
    return <View style={styles.loadingView} />;
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateFontSize, updateBackgroundColor, updateReadingSpeed, isLoaded }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },
});
