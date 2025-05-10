import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import OptionSelector from '../../components/OptionSelector';
import Button from '../../components/Button';
import theme from '../../theme';

const { width } = Dimensions.get('window');

const toneOptions = [
  {
    label: 'Soft',
    value: 'soft',
    description: 'Gentle and nurturing, focuses on emotional well-being and personal growth',
    icon: <Feather name="sun" size={24} color={theme.colors.text.primary} />
  },
  {
    label: 'Honest',
    value: 'honest',
    description: 'Direct and straightforward, offers clear perspectives without sugar-coating',
    icon: <Feather name="check-circle" size={24} color={theme.colors.text.primary} />
  },
  {
    label: 'Poetic',
    value: 'poetic',
    description: 'Imaginative and metaphorical, helps you see patterns through creative lenses',
    icon: <Feather name="feather" size={24} color={theme.colors.text.primary} />
  },
  {
    label: 'Neutral',
    value: 'neutral',
    description: 'Balanced and objective, presents information and insights without bias',
    icon: <Feather name="circle" size={24} color={theme.colors.text.primary} />
  }
];

const ToneSelection = ({ onNext, isActive, onboardingData }) => {
  const [selectedTone, setSelectedTone] = useState(onboardingData.tone);
  
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (isActive) {
      // Staggered animation for elements
      titleOpacity.value = withDelay(
        100, 
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      
      titleTranslateY.value = withDelay(
        100, 
        withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      
      contentOpacity.value = withDelay(
        300, 
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      
      buttonOpacity.value = withDelay(
        500, 
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
    } else {
      // Reset animations when not active
      titleOpacity.value = 0;
      titleTranslateY.value = 30;
      contentOpacity.value = 0;
      buttonOpacity.value = 0;
    }
  }, [isActive]);
  
  const titleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }]
    };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  
  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ 
        translateY: withTiming(selectedTone ? 0 : 20, { duration: 300 }) 
      }]
    };
  });
  
  const handleSelectTone = (value) => {
    setSelectedTone(value);
  };
  
  const handleContinue = () => {
    if (selectedTone) {
      onNext({ tone: selectedTone });
    }
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>Select a tone</Text>
        <Text style={styles.subtitle}>
          How would you like Voa to communicate with you?
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.content, contentStyle]}>
        <OptionSelector
          options={toneOptions}
          selectedOption={selectedTone}
          onSelect={handleSelectTone}
        />
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedTone}
          variant="primary"
          size="large"
          fullWidth
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  content: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
  },
});

export default ToneSelection;
