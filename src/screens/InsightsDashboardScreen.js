/**
 * Insights Dashboard screen to display user data insights and analytics
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import AnimatedOrb from '../components/AnimatedOrb';
import EmotionalTrendChart from '../components/EmotionalTrendChart';
import CreativeThemesChart from '../components/CreativeThemesChart';
import BehavioralLoopsChart from '../components/BehavioralLoopsChart';
import theme from '../theme';
import { fadeInUp } from '../utils/animations';
import { getData } from '../utils/storage';
import openaiService from '../services/openai';

/**
 * Insights Dashboard screen component
 * @returns {React.ReactElement} - Rendered component
 */
const InsightsDashboardScreen = ({ navigation }) => {
  const [insights, setInsights] = useState([]);
  const [hasData, setHasData] = useState(false);
  
  // Animation styles
  const headerAnim = fadeInUp(100);
  const contentAnim = fadeInUp(300);
  
  // State for loading indicator
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Analyze data sources using OpenAI
  const analyzeDataSources = async (dataSources) => {
    try {
      setIsAnalyzing(true);
      
      // Placeholder for actual data processing
      // In a real app, we would extract and format data from the sources
      const processedData = dataSources.map(source => ({
        type: source.sourceType,
        fileName: source.fileName,
        uploadDate: source.uploadDate,
        // This would contain actual content in a real app
        sampleContent: `Sample content from ${source.fileName} for demonstration purposes.`
      }));
      
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        // Use default insights if no API key
        return [
          {
            id: 'insight-1',
            title: 'Digital Wellness',
            description: 'Your screen time has decreased by 22% compared to last month.',
            category: 'wellness',
            date: new Date().toISOString(),
            icon: 'trending-down',
            color: theme.colors.success.default,
            emotionalData: [] // Would be populated with real data in production
          },
          {
            id: 'insight-2',
            title: 'Content Preferences',
            description: 'You engage 3x more with creative content than news content.',
            category: 'preferences',
            date: new Date().toISOString(),
            icon: 'star',
            color: theme.colors.warning.default,
            themesData: [] // Would be populated with real data in production
          },
          {
            id: 'insight-3',
            title: 'Communication Patterns',
            description: 'Your most active communication hours are between 2-4 PM.',
            category: 'communication',
            date: new Date().toISOString(),
            icon: 'chatbubbles',
            color: theme.colors.accent.primary,
            patternsData: [] // Would be populated with real data in production
          },
        ];
      }
      
      try {
        // Try to get insights from OpenAI
        // This would be fully implemented with real data in production
        
        // Get emotional trends analysis
        // const emotionalAnalysis = await openaiService.analyzeEmotionalTrends(processedData);
        
        // Get creative themes analysis
        // const themesAnalysis = await openaiService.identifyCreativeThemes(processedData);
        
        // Get behavioral patterns analysis
        // const patternsAnalysis = await openaiService.detectBehavioralPatterns(processedData);
        
        // For now, use the default insights but in production would use OpenAI results
        return [
          {
            id: 'insight-1',
            title: 'Digital Wellness',
            description: 'Your screen time has decreased by 22% compared to last month.',
            category: 'wellness',
            date: new Date().toISOString(),
            icon: 'trending-down',
            color: theme.colors.success.default,
            emotionalData: [] // Would come from emotionalAnalysis in production
          },
          {
            id: 'insight-2',
            title: 'Content Preferences',
            description: 'You engage 3x more with creative content than news content.',
            category: 'preferences',
            date: new Date().toISOString(),
            icon: 'star',
            color: theme.colors.warning.default,
            themesData: [] // Would come from themesAnalysis in production
          },
          {
            id: 'insight-3',
            title: 'Communication Patterns',
            description: 'Your most active communication hours are between 2-4 PM.',
            category: 'communication',
            date: new Date().toISOString(),
            icon: 'chatbubbles',
            color: theme.colors.accent.primary,
            patternsData: [] // Would come from patternsAnalysis in production
          },
        ];
      } catch (error) {
        console.error('Error analyzing data with OpenAI:', error);
        Alert.alert(
          "Analysis Error",
          "There was an error analyzing your data. Please check your internet connection and API configuration.",
          [{ text: "OK" }]
        );
        
        // Return default insights if OpenAI analysis fails
        return [
          {
            id: 'insight-1',
            title: 'Digital Wellness',
            description: 'Your screen time has decreased by 22% compared to last month.',
            category: 'wellness',
            date: new Date().toISOString(),
            icon: 'trending-down',
            color: theme.colors.success.default,
          },
          {
            id: 'insight-2',
            title: 'Content Preferences',
            description: 'You engage 3x more with creative content than news content.',
            category: 'preferences',
            date: new Date().toISOString(),
            icon: 'star',
            color: theme.colors.warning.default,
          },
          {
            id: 'insight-3',
            title: 'Communication Patterns',
            description: 'Your most active communication hours are between 2-4 PM.',
            category: 'communication',
            date: new Date().toISOString(),
            icon: 'chatbubbles',
            color: theme.colors.accent.primary,
          },
        ];
      }
    } catch (error) {
      console.error('Error analyzing data sources:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Check if user has uploaded any data
    const checkData = async () => {
      try {
        const dataSources = await getData('dataSources');
        const hasDataSources = dataSources && dataSources.length > 0;
        setHasData(hasDataSources);
        
        if (hasDataSources) {
          // Analyze data sources to generate insights
          const generatedInsights = await analyzeDataSources(dataSources);
          setInsights(generatedInsights);
        }
      } catch (error) {
        console.error('Error checking data sources:', error);
      }
    };
    
    checkData();
  }, []);
  
  const renderPlaceholder = () => (
    <Animated.View style={[styles.placeholder, contentAnim]}>
      <AnimatedOrb size="small" enhanced3d glow />
      <Text style={styles.placeholderTitle}>No Insights Yet</Text>
      <Text style={styles.placeholderText}>
        Upload your data from social media, notes, or other sources to see personalized insights.
      </Text>
      <Button
        title="Add Data"
        onPress={() => navigation.navigate('DataConnection')}
        variant="primary"
        iconRight="cloud-upload"
        style={styles.placeholderButton}
      />
    </Animated.View>
  );
  
  // Track which insights are expanded
  const [expandedInsights, setExpandedInsights] = useState({});
  
  // Handle expanding/collapsing an insight
  const toggleInsightExpanded = (insightId) => {
    setExpandedInsights(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };
  
  // Render an insight card with expandable detailed visualizations
  const renderInsightCard = (insight) => {
    const isExpanded = expandedInsights[insight.id] || false;
    
    return (
      <GlassmorphicCard key={insight.id} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
            <Ionicons name={insight.icon} size={22} color={insight.color} />
          </View>
          <Text style={styles.insightCategory}>{insight.category.toUpperCase()}</Text>
        </View>
        
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightDescription}>{insight.description}</Text>
        
        <View style={styles.insightFooter}>
          <TouchableOpacity 
            style={styles.insightActionButton}
            onPress={() => toggleInsightExpanded(insight.id)}
          >
            <Text style={styles.insightActionText}>
              {isExpanded ? 'Show Less' : 'Explore Further'}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-forward"} 
              size={16} 
              color={theme.colors.accent.primary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Expanded visualization section */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {insight.category === 'wellness' && (
              <EmotionalTrendChart 
                primaryEmotion="joy"
                // In a real app, we would pass actual emotional data here
              />
            )}
            
            {insight.category === 'preferences' && (
              <CreativeThemesChart 
                // In a real app, we would pass actual theme data here
              />
            )}
            
            {insight.category === 'communication' && (
              <BehavioralLoopsChart 
                // In a real app, we would pass actual behavioral data here
              />
            )}
          </View>
        )}
      </GlassmorphicCard>
    );
  };
  
  const renderCategories = () => (
    <View style={styles.categoriesRow}>
      <TouchableOpacity style={styles.categoryChip}>
        <Text style={styles.categoryChipText}>All</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.categoryChip, styles.categoryChipInactive]}>
        <Text style={styles.categoryChipTextInactive}>Wellness</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.categoryChip, styles.categoryChipInactive]}>
        <Text style={styles.categoryChipTextInactive}>Preferences</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.categoryChip, styles.categoryChipInactive]}>
        <Text style={styles.categoryChipTextInactive}>More</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.header, headerAnim]}>
          <Text style={styles.headerTitle}>INSIGHTS</Text>
        </Animated.View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <AnimatedOrb size="small" enhanced3d glow pulse />
              <Text style={styles.loadingText}>
                Analyzing your data for insights...
              </Text>
            </View>
          ) : hasData ? (
            <Animated.View style={contentAnim}>
              <Text style={styles.introText}>
                Personalized analytics based on your data
              </Text>
              
              {renderCategories()}
              
              <View style={styles.insightsContainer}>
                {insights.map(renderInsightCard)}
              </View>
              
              <View style={styles.suggestionSection}>
                <Text style={styles.sectionTitle}>SUGGESTED ACTIONS</Text>
                
                <GlassmorphicCard style={styles.suggestionCard}>
                  <View style={styles.suggestionContent}>
                    <Ionicons name="add-circle" size={22} color={theme.colors.accent.primary} />
                    <Text style={styles.suggestionText}>Upload more data for deeper insights</Text>
                  </View>
                  <Button
                    title="Add Data"
                    onPress={() => navigation.navigate('DataConnection')}
                    variant="outline"
                    size="small"
                  />
                </GlassmorphicCard>
                
                <GlassmorphicCard style={styles.suggestionCard}>
                  <View style={styles.suggestionContent}>
                    <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.accent.primary} />
                    <Text style={styles.suggestionText}>Ask Voa about these insights</Text>
                  </View>
                  <Button
                    title="Chat"
                    onPress={() => navigation.navigate('Chat')}
                    variant="outline"
                    size="small"
                  />
                </GlassmorphicCard>
              </View>
            </Animated.View>
          ) : renderPlaceholder()}
        </ScrollView>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  introText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: 'rgba(168, 148, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.accent.primary,
  },
  categoryChipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipText: {
    ...theme.typography.styles.caption,
    color: theme.colors.accent.primary,
  },
  categoryChipTextInactive: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  insightsContainer: {
    marginBottom: theme.spacing.xl,
  },
  insightCard: {
    marginBottom: theme.spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  insightCategory: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  insightTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  insightDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  insightFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: theme.spacing.sm,
  },
  insightActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightActionText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.accent.primary,
    marginRight: theme.spacing.xs,
  },
  expandedContent: {
    marginTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.sm,
  },
  suggestionSection: {
    marginTop: theme.spacing.lg,
  },
  suggestionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  placeholderTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  placeholderButton: {
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
});

export default InsightsDashboardScreen;