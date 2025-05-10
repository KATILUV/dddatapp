import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GlassmorphicCard from '../components/GlassmorphicCard';
import AnimatedOrb from '../components/AnimatedOrb';
import Button from '../components/Button';
import theme from '../theme';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState({ name: 'Voa' });
  
  // Animated values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.5);
  const cardTranslateY = useSharedValue(100);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  
  useEffect(() => {
    // Load user data from AsyncStorage
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('onboardingData');
        if (data) {
          setUserData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
    
    // Start entrance animations
    const animationSequence = () => {
      // Orb animation
      orbScale.value = withSpring(1, { damping: 14, stiffness: 100 });
      
      // Header fade in
      headerOpacity.value = withDelay(
        300, 
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
      
      // Content fade in and slide up
      contentOpacity.value = withDelay(
        600, 
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
      
      cardTranslateY.value = withDelay(
        600,
        withSpring(0, { damping: 12, stiffness: 100 })
      );
      
      // Buttons fade in and slide up
      buttonOpacity.value = withDelay(
        900,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      
      buttonTranslateY.value = withDelay(
        900,
        withSpring(0, { damping: 12, stiffness: 100 })
      );
    };
    
    animationSequence();
  }, []);
  
  // Animated styles
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });
  
  const orbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: orbScale.value }],
    };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cardTranslateY.value }],
    };
  });
  
  const buttonContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ translateY: buttonTranslateY.value }],
    };
  });
  
  // Navigation handlers
  const navigateToChat = () => {
    navigation.navigate('Chat');
  };
  
  const navigateToDataConnection = () => {
    navigation.navigate('DataConnection');
  };
  
  const navigateToInsights = () => {
    navigation.navigate('InsightsDashboard');
  };
  
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };
  
  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello</Text>
          <TouchableOpacity onPress={navigateToSettings} style={styles.settingsButton}>
            <Feather name="settings" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Orb */}
      <Animated.View style={[styles.orbContainer, orbStyle]}>
        <AnimatedOrb size={160} intensity={1.2} />
      </Animated.View>
      
      {/* Main content */}
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.agentName}>{userData.name || 'Voa'}</Text>
        <Text style={styles.subtitle}>Your personal AI companion</Text>
      </Animated.View>
      
      {/* Intro card */}
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <GlassmorphicCard style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to Your Journey</Text>
          <Text style={styles.cardText}>
            Own your data. Understand yourself. Big tech collects your data to manipulate you. 
            {userData.name || 'Voa'} helps you reclaim it—to see who you are, how you change, and what you need.
          </Text>
        </GlassmorphicCard>
      </Animated.View>
      
      {/* Action buttons */}
      <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
        <Button
          title="Start a Conversation"
          onPress={navigateToChat}
          variant="primary"
          size="large"
          fullWidth
          leftIcon={<Feather name="message-circle" size={20} color={theme.colors.text.primary} />}
          style={styles.button}
        />
        
        <Button
          title="Connect Your Data"
          onPress={navigateToDataConnection}
          variant="secondary"
          size="large"
          fullWidth
          leftIcon={<Feather name="link" size={20} color={theme.colors.text.primary} />}
          style={styles.button}
        />
        
        <Button
          title="View Your Insights"
          onPress={navigateToInsights}
          variant="secondary"
          size="large"
          fullWidth
          leftIcon={<Feather name="bar-chart-2" size={20} color={theme.colors.text.primary} />}
          style={styles.button}
        />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.m,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading3,
    color: theme.colors.text.primary,
  },
  settingsButton: {
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.circle,
  },
  orbContainer: {
    marginVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  agentName: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.mono.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.l,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.m,
  },
  cardTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.m,
  },
  cardText: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.body,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.m,
  },
  button: {
    marginBottom: theme.spacing.m,
  },
});

export default HomeScreen;
