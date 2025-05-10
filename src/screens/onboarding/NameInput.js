/**
 * First onboarding screen to collect user's name
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useFonts } from 'expo-font';

import InputField from '../../components/InputField';
import Button from '../../components/Button';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

/**
 * First onboarding screen for name input
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data object
 * @param {Function} props.onNext - Function to move to next screen
 * @returns {React.ReactElement} - Rendered component
 */
const NameInput = ({ userData, onNext }) => {
  const [name, setName] = useState(userData.name || '');
  const [isValid, setIsValid] = useState(false);
  
  // Animation styles
  const titleAnim = fadeInUp(100);
  const subtitleAnim = fadeInUp(200);
  const cardAnim = fadeInUp(300);
  const buttonAnim = fadeInUp(400);
  
  // Validate name
  useEffect(() => {
    setIsValid(name.trim().length > 0);
  }, [name]);
  
  const handleNext = () => {
    if (isValid) {
      onNext('name', name);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Title and subtitle */}
      <Animated.Text style={[styles.title, titleAnim]}>
        Own your data.{'\n'}
        Understand yourself.
      </Animated.Text>
      
      <Animated.Text style={[styles.subtitle, subtitleAnim]}>
        Other apps sell your data or keep it hidden.{'\n'}
        Voa gives you full control over your digital history, 
        unlocking personalized insights to help you grow.
      </Animated.Text>
      
      {/* Name input card */}
      <Animated.View style={cardAnim}>
        <GlassmorphicCard style={styles.card}>
          <Text style={styles.cardTitle}>Let's start with your name</Text>
          <InputField
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />
          <Text style={styles.privacyNote}>
            Your data stays private on your device
          </Text>
        </GlassmorphicCard>
      </Animated.View>
      
      {/* Continue button */}
      <Animated.View style={[styles.buttonContainer, buttonAnim]}>
        <Button 
          title="Continue" 
          onPress={handleNext} 
          disabled={!isValid}
          iconRight="arrow-forward"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeights.body,
  },
  card: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  cardTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  privacyNote: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
});

export default NameInput;