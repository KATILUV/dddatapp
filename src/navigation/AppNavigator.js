/**
 * Main navigation configuration
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import DataConnectionScreen from '../screens/DataConnectionScreen';
import InsightsDashboardScreen from '../screens/InsightsDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import theme
import theme from '../theme';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main tab navigator displayed after onboarding
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
        ),
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Data"
        component={DataConnectionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main navigator component with conditional rendering based on onboarding status
 * @param {Object} props - Component props
 * @param {boolean} props.isFirstLaunch - Whether this is the first app launch
 * @returns {React.ReactElement} - Rendered navigator
 */
const AppNavigator = ({ isFirstLaunch }) => {
  // Define our navigation structure
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        // Fade transition for screens
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      {isFirstLaunch ? (
        // Show onboarding flow for first launch
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // Show main app screens
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: theme.heights.tabBar,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    paddingBottom: 20, // Extra padding at bottom
  },
  tabBarLabel: {
    fontFamily: theme.typography.fonts.primary.medium,
    fontSize: 12,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});

export default AppNavigator;