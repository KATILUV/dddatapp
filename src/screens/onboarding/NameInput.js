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

const NameInput = ({ onNext, isActive, onboardingData }) => {
  const [name, setName] = useState(onboardingData.name || 'Voa');
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
  
  const handleNameChange = (text) => {
    setName(text);
  };
  
  const handleContinue = () => {
    Keyboard.dismiss();
    onNext({ name: name.trim() || 'Voa' });
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>Name your companion</Text>
        <Text style={styles.subtitle}>
          Your AI companion's default name is Voa, but you can change it if you'd like.
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.content, contentStyle]}>
        <InputField
          ref={inputRef}
          label="Name"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Enter a name"
          autoCapitalize="words"
          maxLength={20}
          autoFocus={isActive}
          style={styles.input}
          onSubmitEditing={handleContinue}
        />
        
        <Text style={styles.helpText}>
          This name will be used throughout your conversations.
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <Button
          title="Continue"
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

export default NameInput;
