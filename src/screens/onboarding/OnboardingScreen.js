/**
 * Main onboarding screen that handles the flow between onboarding steps
 */
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import GradientBackground from '../../components/GradientBackground';
import ProgressDots from '../../components/ProgressDots';
import AnimatedOrb from '../../components/AnimatedOrb';
import { fadeIn } from '../../utils/animations';

// Import onboarding screens
import NameInput from './NameInput';
import ToneSelection from './ToneSelection';
import IntentionPrompt from './IntentionPrompt';

/**
 * Main onboarding component that manages the flow between onboarding steps
 * @returns {React.ReactElement} - Rendered component
 */
const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    tone: '',
    intention: '',
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const animatedStyle = fadeIn(500);
  
  // Steps in the onboarding process
  const steps = [
    {
      id: 'name',
      component: NameInput,
    },
    {
      id: 'tone',
      component: ToneSelection,
    },
    {
      id: 'intention',
      component: IntentionPrompt,
    },
  ];
  
  /**
   * Handles moving to the next step in the onboarding process
   * @param {string} field - Field name to update
   * @param {any} value - Value to store for the field
   */
  const handleNext = (field, value) => {
    // Update user data
    if (field) {
      setUserData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Animate transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // If at the last step, complete onboarding
      if (currentStep >= steps.length - 1) {
        // Save user data and navigate to main app
        completeOnboarding();
      } else {
        // Otherwise, move to next step
        setCurrentStep(currentStep + 1);
        // Fade back in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  };
  
  /**
   * Complete the onboarding process and navigate to the main app
   */
  const completeOnboarding = async () => {
    try {
      // In a real app, we would store this in AsyncStorage
      // For now, we'll just navigate to the main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  // Current step component
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Floating orb */}
        <View style={styles.orbContainer}>
          <AnimatedOrb size="large" float glow />
        </View>
        
        {/* Current step content */}
        <Animated.View 
          style={[
            styles.contentContainer,
            { opacity: fadeAnim }
          ]}
        >
          <CurrentStepComponent 
            userData={userData} 
            onNext={handleNext} 
          />
        </Animated.View>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <ProgressDots 
            totalSteps={steps.length} 
            currentStep={currentStep} 
          />
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbContainer: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    zIndex: -1,
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 60,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
});

export default OnboardingScreen;