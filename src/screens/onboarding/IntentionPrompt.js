/**
 * Onboarding screen for setting user's intention with the app
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated, ScrollView } from 'react-native';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

/**
 * Intention prompt screen for onboarding
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data object
 * @param {Function} props.onNext - Function to move to next screen
 * @returns {React.ReactElement} - Rendered component
 */
const IntentionPrompt = ({ userData, onNext }) => {
  const [intention, setIntention] = useState(userData.intention || '');
  const [isValid, setIsValid] = useState(false);
  
  // Animation styles
  const titleAnim = fadeInUp(100);
  const subtitleAnim = fadeInUp(200);
  const cardAnim = fadeInUp(300);
  const suggestionsAnim = fadeInUp(400);
  const buttonAnim = fadeInUp(500);

  // Suggestion examples
  const suggestions = [
    "Understand my online behavior patterns",
    "Get insights about my digital well-being",
    "Discover meaningful connections in my data",
    "Find balance in my digital life",
  ];

  // Validate intention
  useEffect(() => {
    setIsValid(intention.trim().length > 10);
  }, [intention]);

  const handleNext = () => {
    if (isValid) {
      onNext('intention', intention);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setIntention(suggestion);
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.Text style={[styles.title, titleAnim]}>
        What's your intention?
      </Animated.Text>
      
      <Animated.Text style={[styles.subtitle, subtitleAnim]}>
        Voa works best when it understands what you hope to achieve.
        What do you want to learn about yourself?
      </Animated.Text>
      
      <Animated.View style={cardAnim}>
        <GlassmorphicCard style={styles.card}>
          <InputField
            placeholder="Your intention with Voa..."
            value={intention}
            onChangeText={setIntention}
            multiline
            numberOfLines={4}
            style={styles.inputField}
            inputStyle={styles.input}
          />
          <Text style={styles.inputHint}>
            {intention.length > 0 ? `${intention.length} characters` : 'Min 10 characters'}
          </Text>
        </GlassmorphicCard>
      </Animated.View>
      
      <Animated.View style={suggestionsAnim}>
        <Text style={styles.suggestionsTitle}>
          Or try one of these:
        </Text>
        
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              title={suggestion}
              variant="outline"
              size="small"
              onPress={() => handleSuggestionPress(suggestion)}
              style={styles.suggestionButton}
            />
          ))}
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, buttonAnim]}>
        <Button 
          title="Start your journey" 
          onPress={handleNext} 
          disabled={!isValid}
          iconRight="arrow-forward"
        />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
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
    lineHeight: theme.typography.lineHeights.body,
  },
  card: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  inputField: {
    marginBottom: 0,
  },
  input: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  suggestionsTitle: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xl,
  },
  suggestionButton: {
    margin: theme.spacing.xs,
  },
  buttonContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
});

export default IntentionPrompt;