import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import theme from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import GradientBackground from './src/components/GradientBackground';
import AnimatedOrb from './src/components/AnimatedOrb';
import { getData, storeData } from './src/utils/storage';
import { AuthProvider } from './src/hooks/useAuth';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Regular': require('./assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('./assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.ttf'),
    'IBMPlexMono-Regular': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
    'IBMPlexMono-Medium': require('./assets/fonts/IBMPlexMono-Medium.ttf'),
  });

  useEffect(() => {
    // Check if it's the first launch using our util function
    async function checkFirstLaunch() {
      try {
        // Check if user data exists
        const userData = await getData('userData');
        if (!userData) {
          // First launch check with traditional method as backup
          const value = await AsyncStorage.getItem('alreadyLaunched');
          if (value === null) {
            await AsyncStorage.setItem('alreadyLaunched', 'true');
            setIsFirstLaunch(true);
          } else {
            setIsFirstLaunch(false);
          }
        } else {
          setIsFirstLaunch(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
        setIsLoading(false);
      }
    }
    
    if (fontsLoaded) {
      checkFirstLaunch();
    }
  }, [fontsLoaded]);

  // Wait for fonts to load
  if (!fontsLoaded) {
    return <AppLoading />;
  }

  // Show loading screen while checking first launch
  if (isLoading || isFirstLaunch === null) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <AnimatedOrb size="medium" enhanced3d glow float />
          <Text style={styles.loadingText}>SOLSTICE</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <GradientBackground>
              <StatusBar style="light" />
              <AppNavigator isFirstLaunch={isFirstLaunch} />
            </GradientBackground>
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    letterSpacing: theme.typography.letterSpacing.extraWide,
    fontFamily: theme.typography.fonts.primary.medium,
  },
});
