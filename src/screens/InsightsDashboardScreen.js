import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import AnimatedOrb from '../components/AnimatedOrb';
import { fadeInUp } from '../utils/animations';
import theme from '../theme';

const { width, height } = Dimensions.get('window');

// Mock insights data - in a real app these would be generated from user data
const mockInsightCategories = [
  {
    id: 'emotions',
    title: 'Emotional Tone Clusters',
    description: 'How your emotions have been expressed and clustered',
    icon: 'heart',
    insights: [
      { label: 'Joy', value: 25 },
      { label: 'Calm', value: 40 },
      { label: 'Anxiety', value: 15 },
      { label: 'Focus', value: 20 },
    ]
  },
  {
    id: 'topics',
    title: 'Trending Topics',
    description: 'Subjects and themes appearing in your data',
    icon: 'trending-up',
    insights: [
      { label: 'Creativity', value: 35 },
      { label: 'Work', value: 30 },
      { label: 'Relationships', value: 20 },
      { label: 'Health', value: 15 },
    ]
  },
  {
    id: 'habits',
    title: 'Creative Habits',
    description: 'Patterns in your creative activities and output',
    icon: 'edit',
    insights: [
      { label: 'Morning writing', value: 45 },
      { label: 'Evening brainstorming', value: 30 },
      { label: 'Weekend planning', value: 15 },
      { label: 'Collaborative work', value: 10 },
    ]
  },
  {
    id: 'patterns',
    title: 'Behavior Loops',
    description: 'Recurring patterns in your daily activities',
    icon: 'repeat',
    insights: [
      { label: 'Productive deep work', value: 30 },
      { label: 'Distraction cycles', value: 25 },
      { label: 'Rest and reflection', value: 25 },
      { label: 'Learning and growth', value: 20 },
    ]
  }
];

const InsightsDashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ name: 'Voa' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hasConnectedData, setHasConnectedData] = useState(false);
  
  const insets = useSafeAreaInsets();
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const categoryAnimations = mockInsightCategories.map(() => ({
    scale: useSharedValue(0.95),
    opacity: useSharedValue(0),
  }));
  
  useEffect(() => {
    // Load user data
    const loadData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('onboardingData');
        if (userDataStr) {
          setUserData(JSON.parse(userDataStr));
        }
        
        // Check if user has connected any data sources
        const connectedSourcesStr = await AsyncStorage.getItem('connectedSources');
        if (connectedSourcesStr) {
          const sources = JSON.parse(connectedSourcesStr);
          setHasConnectedData(Object.keys(sources).length > 0);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    
    // Staggered animations for categories
    categoryAnimations.forEach((anim, index) => {
      anim.opacity.value = withDelay(
        400 + (index * 100),
        withTiming(1, { duration: 800 })
      );
      
      anim.scale.value = withDelay(
        400 + (index * 100),
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
    });
  }, []);
  
  // Animated styles
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  
  const getCategoryAnimationStyle = (index) => {
    return useAnimatedStyle(() => {
      return {
        opacity: categoryAnimations[index].opacity.value,
        transform: [{ scale: categoryAnimations[index].scale.value }],
      };
    });
  };
  
  // Select a category for detailed view
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };
  
  // Go back to category list
  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };
  
  // Connect data button handler
  const handleConnectData = () => {
    navigation.navigate('DataConnection');
  };
  
  // Render a bar for visualization
  const renderBar = (item, maxValue) => {
    const percentage = (item.value / maxValue) * 100;
    
    return (
      <View key={item.label} style={styles.barContainer}>
        <Text style={styles.barLabel}>{item.label}</Text>
        <View style={styles.barWrapper}>
          <Animated.View 
            style={[
              styles.bar, 
              { width: `${percentage}%` }
            ]} 
          />
          <Text style={styles.barValue}>{item.value}%</Text>
        </View>
      </View>
    );
  };
  
  // Render a category card
  const renderCategoryCard = (category, index) => {
    return (
      <Animated.View 
        key={category.id}
        style={[styles.categoryCardContainer, getCategoryAnimationStyle(index)]}
      >
        <GlassmorphicCard 
          style={styles.categoryCard}
          hoverEffect
          onPress={() => handleSelectCategory(category)}
        >
          <View style={styles.categoryHeader}>
            <View style={styles.categoryIconContainer}>
              <Feather name={category.icon} size={24} color={theme.colors.text.primary} />
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </GlassmorphicCard>
      </Animated.View>
    );
  };
  
  // Render the detailed view of a category
  const renderCategoryDetail = (category) => {
    const maxValue = Math.max(...category.insights.map(item => item.value));
    
    return (
      <Animated.View 
        style={[styles.categoryDetailContainer, fadeInUp(0)]}
        entering={fadeInUp(0)}
      >
        <View style={styles.categoryDetailHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToCategories}
          >
            <Feather name="arrow-left" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.categoryDetailTitle}>{category.title}</Text>
        </View>
        
        <Text style={styles.categoryDetailDescription}>{category.description}</Text>
        
        <View style={styles.insightsContainer}>
          {category.insights.map(item => renderBar(item, maxValue))}
        </View>
        
        <View style={styles.insightNotesContainer}>
          <Text style={styles.insightNotesTitle}>Potential Patterns</Text>
          <Text style={styles.insightNotesText}>
            These insights are based on analysis of your connected data. The patterns shown may reveal tendencies in your behavior, thinking, or emotional states over time.
          </Text>
        </View>
      </Animated.View>
    );
  };
  
  // Render empty state when no data is connected
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <AnimatedOrb size={100} intensity={0.8} />
        <Text style={styles.emptyStateTitle}>No data yet</Text>
        <Text style={styles.emptyStateDescription}>
          Connect your data sources to start seeing personalized insights about your patterns and behaviors.
        </Text>
        <Button
          title="Connect Data Sources"
          onPress={handleConnectData}
          variant="primary"
          size="large"
          style={styles.emptyStateButton}
        />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={headerStyle}>
        <Header
          title="Your Insights"
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!hasConnectedData ? (
          renderEmptyState()
        ) : (
          <Animated.View style={[styles.content, contentStyle]}>
            {!selectedCategory ? (
              <>
                <Text style={styles.title}>Your Personal Insights</Text>
                <Text style={styles.description}>
                  Explore patterns and trends from your data to gain self-awareness and understanding.
                </Text>
                
                <View style={styles.categoriesContainer}>
                  {mockInsightCategories.map((category, index) => 
                    renderCategoryCard(category, index)
                  )}
                </View>
              </>
            ) : (
              renderCategoryDetail(selectedCategory)
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  description: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeights.body,
  },
  categoriesContainer: {
    marginTop: theme.spacing.m,
  },
  categoryCardContainer: {
    marginBottom: theme.spacing.l,
  },
  categoryCard: {
    marginVertical: theme.spacing.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 148, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  categoryTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading4,
    color: theme.colors.text.primary,
  },
  categoryDescription: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.bodySmall,
  },
  // Category detail styles
  categoryDetailContainer: {
    flex: 1,
    paddingVertical: theme.spacing.m,
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  categoryDetailTitle: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading3,
    color: theme.colors.text.primary,
  },
  categoryDetailDescription: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  insightsContainer: {
    marginVertical: theme.spacing.l,
  },
  barContainer: {
    marginBottom: theme.spacing.m,
  },
  barLabel: {
    fontFamily: theme.typography.fonts.mono.medium,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  barWrapper: {
    height: 24,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: '100%',
    backgroundColor: theme.colors.accent.primary,
    borderRadius: theme.borderRadius.small,
  },
  barValue: {
    position: 'absolute',
    right: theme.spacing.m,
    fontFamily: theme.typography.fonts.mono.medium,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.primary,
  },
  insightNotesContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.m,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.accent.primary,
  },
  insightNotesTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  insightNotesText: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.bodySmall,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: height * 0.1,
  },
  emptyStateTitle: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeights.body,
  },
  emptyStateButton: {
    marginTop: theme.spacing.l,
  },
});

export default InsightsDashboardScreen;
