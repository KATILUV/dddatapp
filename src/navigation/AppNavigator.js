/**
 * Main navigation configuration
 */
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import DataConnectionScreen from '../screens/DataConnectionScreen';
import InsightsDashboardScreen from '../screens/InsightsDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { 
  WelcomeScreen,
  ConnectDataScreen,
  AboutSolsticeScreen,
  PersonalizationPreferencesScreen
} from '../screens/OnboardingFlow';

import theme from '../theme';
import { getData } from '../utils/storage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Common navigation options for stack screens
 */
const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.background.primary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: theme.colors.text.primary,
  headerTitleStyle: {
    ...theme.typography.styles.h4,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  headerBackTitleVisible: false,
  cardStyle: {
    backgroundColor: 'transparent',
  },
};

/**
 * Main tab navigator displayed after onboarding
 */
const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'DataConnection') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView 
            intensity={30} 
            tint="dark" 
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarLabelStyle: {
          ...theme.typography.styles.caption,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen 
        name="DataConnection" 
        component={DataConnectionScreen}
        options={{
          tabBarLabel: 'Data',
        }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsDashboardScreen}
        options={{
          tabBarLabel: 'Insights',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
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
  const [initialRoute, setInitialRoute] = useState(
    isFirstLaunch ? 'Onboarding' : 'Main'
  );
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          ...screenOptions,
          headerShown: false,
          presentation: 'transparentModal',
        }}
      >
        {/* Onboarding */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        
        {/* Main app */}
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    height: 60,
    elevation: 0,
  },
});

export default AppNavigator;