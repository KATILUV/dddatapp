/**
 * Connect Data screen for the onboarding flow
 */
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import Button from '../../components/Button';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

const ConnectDataScreen = ({ navigation }) => {
  const [selectedSources, setSelectedSources] = useState([]);
  
  // Animation styles
  const titleAnim = fadeInUp(200);
  const cardsAnim = fadeInUp(400);
  const buttonAnim = fadeInUp(600);
  
  // Available data sources
  const dataSources = [
    {
      id: 'google',
      name: 'Google',
      icon: 'logo-google',
      description: 'Search history, Gmail, Calendar, and more',
      color: '#DB4437'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      description: 'Photos, comments, likes and interactions',
      color: '#E1306C'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'logo-twitter',
      description: 'Tweets, likes, follows and interests',
      color: '#1DA1F2'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: 'musical-notes',
      description: 'Music preferences, playlists and listening habits',
      color: '#1DB954'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'logo-facebook',
      description: 'Posts, friends, events and interactions',
      color: '#4267B2'
    }
  ];
  
  // Toggle selection of a data source
  const toggleSource = (sourceId) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };
  
  // Handle connection flow
  const connectSources = () => {
    if (selectedSources.length === 0) {
      Alert.alert(
        'No Sources Selected',
        'Please select at least one data source to connect',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // In a real app, we would initiate OAuth flows for each service
    // For now, let's simulate a successful connection
    Alert.alert(
      'Connect Data Sources',
      'Would you like to connect to the selected data sources? This would normally launch OAuth flows.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Connect', 
          onPress: () => {
            // Mock successful connection
            setTimeout(() => {
              navigation.navigate('PersonalizationPreferences');
            }, 1500);
          }
        }
      ]
    );
  };
  
  // Render each data source card
  const renderDataSourceCard = (source) => {
    const isSelected = selectedSources.includes(source.id);
    
    return (
      <TouchableOpacity
        key={source.id}
        onPress={() => toggleSource(source.id)}
        style={styles.cardWrapper}
      >
        <GlassmorphicCard 
          style={[
            styles.dataSourceCard,
            isSelected && styles.selectedCard
          ]}
          useBorder={isSelected}
          isActive={isSelected}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: source.color }]}>
              <Ionicons name={source.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{source.name}</Text>
              <Text style={styles.cardDescription}>{source.description}</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.text.primary} />
                )}
              </View>
            </View>
          </View>
        </GlassmorphicCard>
      </TouchableOpacity>
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
          <Text style={styles.title}>Connect Your Data</Text>
          <Text style={styles.subtitle}>
            Select the services you'd like to connect to generate personalized insights.
            Solstice requires access to analyze your data but never shares it.
          </Text>
        </Animated.View>
        
        <Animated.View style={[styles.dataSourcesContainer, cardsAnim]}>
          {dataSources.map(renderDataSourceCard)}
        </Animated.View>
        
        <Animated.View style={[styles.buttonsContainer, buttonAnim]}>
          <Button
            title="Continue"
            onPress={connectSources}
            variant="primary"
            size="large"
          />
          <Button
            title="Skip for Now"
            onPress={() => navigation.navigate('PersonalizationPreferences')}
            variant="text"
            size="medium"
            style={styles.skipButton}
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
  dataSourcesContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  dataSourceCard: {
    padding: theme.spacing.md,
  },
  selectedCard: {
    borderColor: theme.colors.accent.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
  },
  checkboxContainer: {
    paddingLeft: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  skipButton: {
    marginTop: theme.spacing.md,
  },
});

export default ConnectDataScreen;