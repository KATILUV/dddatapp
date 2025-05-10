import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Keyboard, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing
} from 'react-native-reanimated';

import InputField from '../../components/InputField';
import Button from '../../components/Button';
import theme from '../../theme';

const { width } = Dimensions.get('window');

const IntentionPrompt = ({ onNext, isActive, onboardingData }) => {
  const [intention, setIntention] = useState(onboardingData.intention || '');
  const inputRef = useRef(null);
  
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);
  
  useEffect(() => {
    if (isActive) {
      // Focus input after a short delay
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 600);
      
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
      
      buttonTranslateY.value = withSequence(
        withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }))
      );
      
      return () => clearTimeout(timer);
    } else {
      // Reset animations when not active
      titleOpacity.value = 0;
      titleTranslateY.value = 30;
      contentOpacity.value = 0;
      buttonOpacity.value = 0;
      buttonTranslateY.value = 20;
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
      transform: [{ translateY: buttonTranslateY.value }]
    };
  });
  
  const handleIntentionChange = (text) => {
    setIntention(text);
  };
  
  const handleContinue = () => {
    Keyboard.dismiss();
    onNext({ intention: intention.trim() });
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>What's your intention?</Text>
        <Text style={styles.subtitle}>
          What do you want {onboardingData.name || 'Voa'} to help you understand about yourself?
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.content, contentStyle]}>
        <InputField
          ref={inputRef}
          label="Your intention"
          value={intention}
          onChangeText={handleIntentionChange}
          placeholder="I want to understand my creative patterns..."
          multiline
          maxLength={200}
          autoFocus={isActive}
          style={styles.input}
        />
        
        <Text style={styles.helpText}>
          This helps {onboardingData.name || 'Voa'} provide more personalized insights from your data.
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <Button
          title="Begin Journey"
          onPress={handleContinue}
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
  input: {
    marginBottom: theme.spacing.l,
  },
  helpText: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
  },
});

export default IntentionPrompt;
