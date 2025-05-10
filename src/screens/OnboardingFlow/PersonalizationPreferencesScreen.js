/**
 * Personalization Preferences screen for the onboarding flow
 */
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import Button from '../../components/Button';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';
import { storeData } from '../../utils/storage';

const PersonalizationPreferencesScreen = ({ navigation }) => {
  const [selectedPreferences, setSelectedPreferences] = useState({
    privacy: 'maximum',
    analysisFrequency: 'weekly',
    notificationLevel: 'moderate'
  });
  
  // Animation styles
  const titleAnim = fadeInUp(200);
  const cardsAnim = fadeInUp(400);
  const buttonAnim = fadeInUp(600);
  
  // Handle selection change
  const handleOptionSelect = (category, value) => {
    setSelectedPreferences({
      ...selectedPreferences,
      [category]: value
    });
  };
  
  // Save preferences and continue
  const savePreferences = async () => {
    try {
      // Save personalization preferences
      await storeData('userPreferences', selectedPreferences);
      
      // Save first launch status
      await storeData('hasCompletedOnboarding', true);
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your preferences. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Option card for privacy level
  const renderPrivacyOptions = () => {
    const options = [
      {
        id: 'maximum',
        title: 'Maximum Privacy',
        description: 'All data stays on your device and is never sent to our servers',
        icon: 'shield-checkmark'
      },
      {
        id: 'balanced',
        title: 'Balanced',
        description: 'Anonymized data is processed on our servers for better insights',
        icon: 'shield-half'
      },
      {
        id: 'enhanced',
        title: 'Enhanced Insights',
        description: 'Data is processed on our servers for the deepest insights possible',
        icon: 'analytics'
      }
    ];
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Privacy Level</Text>
        <Text style={styles.sectionDescription}>
          Choose how you want your data to be handled
        </Text>
        
        {options.map(option => (
          <GlassmorphicCard
            key={option.id}
            style={[
              styles.optionCard,
              selectedPreferences.privacy === option.id && styles.selectedCard
            ]}
            useBorder={selectedPreferences.privacy === option.id}
            isActive={selectedPreferences.privacy === option.id}
            onPress={() => handleOptionSelect('privacy', option.id)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon} size={24} color={theme.colors.accent.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {selectedPreferences.privacy === option.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent.primary} />
              )}
            </View>
          </GlassmorphicCard>
        ))}
      </View>
    );
  };
  
  // Option card for analysis frequency
  const renderAnalysisFrequencyOptions = () => {
    const options = [
      {
        id: 'daily',
        title: 'Daily',
        description: 'Analyze your data every day for up-to-date insights',
        icon: 'calendar'
      },
      {
        id: 'weekly',
        title: 'Weekly',
        description: 'Weekly analysis for balanced insights and battery usage',
        icon: 'calendar-outline'
      },
      {
        id: 'monthly',
        title: 'Monthly',
        description: 'Less frequent analysis with minimal battery impact',
        icon: 'calendar-clear-outline'
      }
    ];
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Analysis Frequency</Text>
        <Text style={styles.sectionDescription}>
          How often should Solstice analyze your data?
        </Text>
        
        {options.map(option => (
          <GlassmorphicCard
            key={option.id}
            style={[
              styles.optionCard,
              selectedPreferences.analysisFrequency === option.id && styles.selectedCard
            ]}
            useBorder={selectedPreferences.analysisFrequency === option.id}
            isActive={selectedPreferences.analysisFrequency === option.id}
            onPress={() => handleOptionSelect('analysisFrequency', option.id)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon} size={24} color={theme.colors.accent.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {selectedPreferences.analysisFrequency === option.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent.primary} />
              )}
            </View>
          </GlassmorphicCard>
        ))}
      </View>
    );
  };
  
  // Option card for notification preferences
  const renderNotificationOptions = () => {
    const options = [
      {
        id: 'minimal',
        title: 'Minimal',
        description: 'Only critical notifications',
        icon: 'notifications-off'
      },
      {
        id: 'moderate',
        title: 'Moderate',
        description: 'Important insights and weekly summaries',
        icon: 'notifications-outline'
      },
      {
        id: 'frequent',
        title: 'Frequent',
        description: 'Regular notifications about new insights',
        icon: 'notifications'
      }
    ];
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notification Level</Text>
        <Text style={styles.sectionDescription}>
          How often would you like to receive notifications?
        </Text>
        
        {options.map(option => (
          <GlassmorphicCard
            key={option.id}
            style={[
              styles.optionCard,
              selectedPreferences.notificationLevel === option.id && styles.selectedCard
            ]}
            useBorder={selectedPreferences.notificationLevel === option.id}
            isActive={selectedPreferences.notificationLevel === option.id}
            onPress={() => handleOptionSelect('notificationLevel', option.id)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon} size={24} color={theme.colors.accent.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {selectedPreferences.notificationLevel === option.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent.primary} />
              )}
            </View>
          </GlassmorphicCard>
        ))}
      </View>
    );
  };
  
  return (
    <GradientBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.titleContainer, titleAnim]}>
          <Text style={styles.title}>Personalize Your Experience</Text>
          <Text style={styles.subtitle}>
            Customize how Solstice works with your data and provides insights.
            You can always change these settings later.
          </Text>
        </Animated.View>
        
        <Animated.View style={[styles.optionsContainer, cardsAnim]}>
          {renderPrivacyOptions()}
          {renderAnalysisFrequencyOptions()}
          {renderNotificationOptions()}
        </Animated.View>
        
        <Animated.View style={[styles.buttonsContainer, buttonAnim]}>
          <Button
            title="Complete Setup"
            onPress={savePreferences}
            variant="primary"
            size="large"
          />
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
  },
  titleContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    lineHeight: theme.lineHeights.body * 1.1,
  },
  optionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  optionCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  selectedCard: {
    borderColor: theme.colors.accent.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(115, 83, 186, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.primary.medium,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default PersonalizationPreferencesScreen;