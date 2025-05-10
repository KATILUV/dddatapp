import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, BackHandler } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProgressDots from '../../components/ProgressDots';
import ToneSelection from './ToneSelection';
import NameInput from './NameInput';
import IntentionPrompt from './IntentionPrompt';
import AnimatedOrb from '../../components/AnimatedOrb';
import theme from '../../theme';

const { width, height } = Dimensions.get('window');

const STEPS = [
  { id: 'tone', component: ToneSelection },
  { id: 'name', component: NameInput },
  { id: 'intention', component: IntentionPrompt },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    tone: null,
    name: 'Voa',
    intention: '',
  });
  
  const slidePosition = useSharedValue(0);
  const opacity = useSharedValue(1);
  const orbSize = useSharedValue(120);
  
  // Handle back button press
  useEffect(() => {
    const handleBackPress = () => {
      if (currentStepIndex > 0) {
        handlePreviousStep();
        return true;
      }
      return false;
    };
    
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [currentStepIndex]);
  
  // Save data for the current step and go to next step
  const handleNextStep = async (stepData) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);
    
    // If we're on the last step, finish onboarding
    if (currentStepIndex === STEPS.length - 1) {
      try {
        await AsyncStorage.setItem('onboardingData', JSON.stringify(updatedData));
        
        // Animate before navigating away
        opacity.value = withTiming(0, { duration: 400 }, () => {
          runOnJS(navigation.replace)('Home');
        });
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    } else {
      // Animate to next step
      slidePosition.value = withTiming(
        -width * (currentStepIndex + 1),
        { duration: 400, easing: Easing.out(Easing.cubic) },
        () => {
          runOnJS(setCurrentStepIndex)(currentStepIndex + 1);
        }
      );
      
      // Animate orb size based on step
      orbSize.value = withSpring(
        currentStepIndex === 0 ? 150 : 180,
        { damping: 12, stiffness: 90 }
      );
    }
  };
  
  // Go to previous step
  const handlePreviousStep = () => {
    slidePosition.value = withTiming(
      -width * (currentStepIndex - 1),
      { duration: 400, easing: Easing.out(Easing.cubic) },
      () => {
        runOnJS(setCurrentStepIndex)(currentStepIndex - 1);
      }
    );
    
    // Animate orb size based on step
    orbSize.value = withSpring(
      currentStepIndex === 2 ? 150 : 120,
      { damping: 12, stiffness: 90 }
    );
  };
  
  // Animated style for the slider
  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slidePosition.value }],
      opacity: opacity.value,
    };
  });
  
  // Animated style for the orb
  const orbStyle = useAnimatedStyle(() => {
    return {
      width: orbSize.value,
      height: orbSize.value,
    };
  });
  
  // Render the steps horizontally
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orbContainer, orbStyle]}>
        <AnimatedOrb size={orbSize.value} />
      </Animated.View>
      
      <Animated.View style={[styles.sliderContainer, sliderStyle]}>
        {STEPS.map((step, index) => {
          const StepComponent = step.component;
          return (
            <View key={step.id} style={styles.stepContainer}>
              <StepComponent
                onNext={handleNextStep}
                onboardingData={onboardingData}
                isActive={currentStepIndex === index}
              />
            </View>
          );
        })}
      </Animated.View>
      
      <View style={styles.footer}>
        <ProgressDots
          steps={STEPS.length}
          currentStep={currentStepIndex}
          style={styles.progressDots}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  sliderContainer: {
    flexDirection: 'row',
    width: width * STEPS.length,
    height: height,
  },
  stepContainer: {
    width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: height * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressDots: {
    marginBottom: theme.spacing.xl,
  },
});

export default OnboardingScreen;
