/**
 * Main home screen that serves as the central hub of the app
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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import AnimatedOrb from '../components/AnimatedOrb';
import Button from '../components/Button';
import { getData } from '../utils/storage';
import { fadeInUp, fadeIn } from '../utils/animations';
import theme from '../theme';

/**
 * Home screen component
 * @returns {React.ReactElement} - Rendered component
 */
const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [activityStats, setActivityStats] = useState({
    dataPoints: 0,
    insights: 0,
    lastActive: null
  });
  
  // Animation styles
  const headerAnim = fadeIn(500);
  const statsAnim = fadeInUp(200);
  const insightsAnim = fadeInUp(400);
  const actionsAnim = fadeInUp(600);
  
  // Load user data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          const userData = await getData('userData');
          if (userData) {
            setUserData(userData);
          }
          
          // In a real app, we would load actual stats
          // For now, using placeholder values just for UI
          setActivityStats({
            dataPoints: 184,
            insights: 7,
            lastActive: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      
      loadUserData();
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  
  // Format date to show "Today" or relative days
  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = userData?.name || 'there';
    
    if (hour < 12) {
      return `Good morning, ${name}`;
    } else if (hour < 18) {
      return `Good afternoon, ${name}`;
    } else {
      return `Good evening, ${name}`;
    }
  };
  
  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim]}>
        <View style={styles.headerContent}>
          <View style={styles.headerOrb}>
            <AnimatedOrb 
              size="small" 
              enhanced3d 
              float 
              glow 
            />
          </View>
          
          <Text style={styles.appName}>SOLSTICE</Text>
        </View>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Activity Stats */}
        <Animated.View style={statsAnim}>
          <View style={styles.mainHeadingContainer}>
            <Text style={styles.mainHeading}>Own your data.</Text>
            <Text style={styles.mainHeading}>Understand yourself.</Text>
            
            <Text style={styles.subHeading}>
              Other companies sell your data or keep it hidden. 
              Solstice gives you full control over your digital history, 
              unlocking personalized insights to help you grow.
            </Text>
            
            <View style={styles.actionButtonsContainer}>
              <GlassmorphicCard style={styles.actionButton} onPress={() => navigation.navigate('DataConnection')}>
                <Text style={styles.actionButtonText}>Connect accounts</Text>
              </GlassmorphicCard>
              
              <GlassmorphicCard style={styles.actionButton} onPress={() => navigation.navigate('InsightsDashboard')}>
                <Text style={styles.actionButtonText}>Learn more</Text>
              </GlassmorphicCard>
            </View>
          </View>
        </Animated.View>
        
        {/* Recent Insights */}
        <Animated.View style={insightsAnim}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT INSIGHTS</Text>
            <TouchableOpacity 
              style={styles.sectionAction}
              onPress={() => navigation.navigate('InsightsDashboard')}
            >
              <Text style={styles.sectionActionText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.accent.primary} />
            </TouchableOpacity>
          </View>
          
          <GlassmorphicCard style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="trending-up" size={24} color={theme.colors.success.default} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Digital Wellness Score</Text>
              <Text style={styles.insightDescription}>
                Your screen time has decreased by 22% this week.
              </Text>
            </View>
          </GlassmorphicCard>
          
          <GlassmorphicCard style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="bulb" size={24} color={theme.colors.warning.default} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Content Discovery</Text>
              <Text style={styles.insightDescription}>
                You've been exploring 3 new topic areas this month.
              </Text>
            </View>
          </GlassmorphicCard>
        </Animated.View>
        
        {/* Quick Actions */}
        <Animated.View style={[styles.quickActions, actionsAnim]}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="chatbubble" size={22} color={theme.colors.accent.primary} />
              </View>
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('DataConnection')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="cloud-upload" size={22} color={theme.colors.accent.primary} />
              </View>
              <Text style={styles.actionText}>Add Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('InsightsDashboard')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="analytics" size={22} color={theme.colors.accent.primary} />
              </View>
              <Text style={styles.actionText}>Insights</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Data Categories (from reference) */}
        <Animated.View style={[styles.dataCategories, actionsAnim]}>
          <View style={styles.dataCategoryItem}>
            <Ionicons name="time-outline" size={22} color={theme.colors.accent.primary} />
            <Text style={styles.dataCategoryText}>Sites you visit</Text>
          </View>
          
          <View style={styles.dataCategoryItem}>
            <Ionicons name="chatbubble-outline" size={22} color={theme.colors.accent.primary} />
            <Text style={styles.dataCategoryText}>Topics you care about</Text>
          </View>
          
          <View style={styles.dataCategoryItem}>
            <Ionicons name="people-outline" size={22} color={theme.colors.accent.primary} />
            <Text style={styles.dataCategoryText}>Social connections</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.secondary,
    letterSpacing: theme.typography.letterSpacing.extraWide,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  headerOrb: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  mainHeadingContainer: {
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  mainHeading: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  subHeading: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.lineHeights.body * 1.1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    width: '48%',
    padding: 0,
    marginVertical: 0,
  },
  actionButtonText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    ...theme.typography.styles.caption,
    color: theme.colors.accent.primary,
  },
  insightCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    marginTop: -20,
  },
  insightContent: {
    marginLeft: 56,
    paddingVertical: theme.spacing.sm,
  },
  insightTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  insightDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
  },
  quickActions: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(115, 83, 186, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(115, 83, 186, 0.12)',
  },
  actionText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});

export default HomeScreen;