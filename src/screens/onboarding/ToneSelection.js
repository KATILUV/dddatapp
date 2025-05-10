/**
 * Onboarding screen for selecting preferred tone of conversation
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import OptionSelector from '../../components/OptionSelector';
import Button from '../../components/Button';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

/**
 * Tone selection screen in onboarding flow
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data object
 * @param {Function} props.onNext - Function to move to next screen
 * @returns {React.ReactElement} - Rendered component
 */
const ToneSelection = ({ userData, onNext }) => {
  const [selectedTone, setSelectedTone] = useState(userData.tone || null);
  
  // Animation styles
  const titleAnim = fadeInUp(100);
  const subtitleAnim = fadeInUp(200);
  const optionsAnim = fadeInUp(300);
  const buttonAnim = fadeInUp(500);
  
  // Tone options
  const toneOptions = [
    {
      id: 'poetic',
      title: 'Poetic',
      description: 'Using metaphors and rich imagery to convey ideas',
      icon: 'book',
    },
    {
      id: 'honest',
      title: 'Honest',
      description: 'Direct and straightforward, even when the truth is tough',
      icon: 'hand-right',
    },
    {
      id: 'soft',
      title: 'Soft',
      description: 'Gentle and encouraging, with an empathetic approach',
      icon: 'heart',
    },
    {
      id: 'neutral',
      title: 'Neutral',
      description: 'Balanced and objective, focusing on the facts',
      icon: 'sparkles',
    },
  ];
  
  const handleSelect = (tone) => {
    setSelectedTone(tone);
  };
  
  const handleNext = () => {
    if (selectedTone) {
      onNext('tone', selectedTone);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, titleAnim]}>
        Choose a tone
      </Animated.Text>
      
      <Animated.Text style={[styles.subtitle, subtitleAnim]}>
        How would you like Voa to communicate with you?
      </Animated.Text>
      
      <Animated.View style={optionsAnim}>
        <View style={styles.optionsContainer}>
          {toneOptions.map((option) => (
            <OptionSelector
              key={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              selected={selectedTone === option.id}
              onSelect={() => handleSelect(option.id)}
              style={styles.option}
            />
          ))}
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, buttonAnim]}>
        <Button 
          title="Continue" 
          onPress={handleNext} 
          disabled={!selectedTone}
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
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  option: {
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
});

export default ToneSelection;