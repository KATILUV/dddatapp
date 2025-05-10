import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import theme from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import GradientBackground from './src/components/GradientBackground';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Regular': require('./assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('./assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.ttf'),
    'IBMPlexMono-Regular': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
    'IBMPlexMono-Medium': require('./assets/fonts/IBMPlexMono-Medium.ttf'),
  });

  useEffect(() => {
    // Check if it's the first launch
    async function checkFirstLaunch() {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    }
    
    checkFirstLaunch();
  }, []);

  // Wait for fonts to load and first launch check to complete
  if (!fontsLoaded || isFirstLaunch === null) {
    return <AppLoading />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <GradientBackground>
            <StatusBar style="light" />
            <AppNavigator isFirstLaunch={isFirstLaunch} />
          </GradientBackground>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
