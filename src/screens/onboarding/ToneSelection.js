/**
 * Onboarding screen for selecting preferred communication style
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import OptionSelector from '../../components/OptionSelector';
import Button from '../../components/Button';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

/**
 * Communication style selection screen in onboarding flow
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
  
  // Communication style options
  const toneOptions = [
    {
      id: 'analytical',
      title: 'Analytical',
      description: 'Data-driven insights with precision and clarity',
      icon: 'analytics',
    },
    {
      id: 'direct',
      title: 'Direct',
      description: 'Straightforward communication with actionable feedback',
      icon: 'arrow-forward-circle',
    },
    {
      id: 'balanced',
      title: 'Balanced',
      description: 'Thoughtful analysis with contextual perspective',
      icon: 'infinite',
    },
    {
      id: 'nuanced',
      title: 'Nuanced',
      description: 'Sophisticated interpretation with layered meaning',
      icon: 'prism',
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
        Communication Style
      </Animated.Text>
      
      <Animated.Text style={[styles.subtitle, subtitleAnim]}>
        Select how Voa will analyze and present your data
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
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  subtitle: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    letterSpacing: theme.typography.letterSpacing.normal,
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