import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/context/SettingsContext';
import { COLORS, FONTS } from './src/utils/constants';

// Keep splash screen visible while we're loading resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // If splash screen is already hidden, ignore the error
});

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load OpenDyslexic fonts
        await Font.loadAsync({
          [FONTS.regular]: require('./assets/fonts/OpenDyslexic-Regular.otf'),
          [FONTS.bold]: require('./assets/fonts/OpenDyslexic-Bold.otf'),
        });
      } catch (e) {
        console.warn('Font loading error:', e);
        // Continue anyway - fonts may not be available but app should still work
      } finally {
        // Tell the splash screen to hide after we've done our initialization
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCream,
  },
});
