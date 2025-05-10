/**
 * About Solstice screen explaining the app's purpose
 */
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Animated,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import Button from '../../components/Button';
import DataChart from '../../components/DataChart';
import AnimatedOrb from '../../components/AnimatedOrb';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

const AboutSolsticeScreen = ({ navigation }) => {
  // Animation styles
  const headerAnim = fadeInUp(200);
  const cardsAnim = fadeInUp(400);
  const buttonAnim = fadeInUp(600);
  
  const renderFeatureCard = (icon, title, description) => {
    return (
      <GlassmorphicCard style={styles.featureCard}>
        <View style={styles.featureIconContainer}>
          <Ionicons name={icon} size={28} color={theme.colors.accent.primary} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </GlassmorphicCard>
    );
  };
  
  return (
    <GradientBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.headerContainer, headerAnim]}>
          <View style={styles.logoContainer}>
            <AnimatedOrb size="small" enhanced3d glow />
            <Text style={styles.logoText}>SOLSTICE</Text>
          </View>
          
          <Text style={styles.title}>Your Digital Life, Illuminated</Text>
          <Text style={styles.subtitle}>
            Solstice is a private analytics platform that helps you understand your digital life
            through secure, privacy-first insights.
          </Text>
        </Animated.View>
        
        <Animated.View style={[styles.featuresContainer, cardsAnim]}>
          <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
          
          {renderFeatureCard(
            'shield-checkmark',
            'Privacy-First Design',
            'Your data never leaves your device without your permission. All processing happens locally by default.'
          )}
          
          {renderFeatureCard(
            'analytics',
            'Personal Insights',
            'Discover patterns in your digital behavior that help you understand yourself better.'
          )}
          
          {renderFeatureCard(
            'git-merge',
            'Connect Your Services',
            'Integrate with the apps and services you already use to get a complete picture of your digital life.'
          )}
          
          <View style={styles.visualizationContainer}>
            <Text style={styles.visualizationTitle}>Powerful Visualizations</Text>
            <Text style={styles.visualizationDescription}>
              Solstice turns complex data into intuitive visualizations that help you understand patterns in your life.
            </Text>
            
            <GlassmorphicCard style={styles.chartCard}>
              <DataChart 
                dataPoints={[0.2, 0.5, 0.3, 0.7, 0.4, 0.8, 0.6]}
                style={styles.chart}
              />
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Your digital activity patterns</Text>
              </View>
            </GlassmorphicCard>
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.buttonContainer, buttonAnim]}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('ConnectData')}
            variant="primary"
            size="large"
          />
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="text"
            size="medium"
            style={styles.backButton}
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
    paddingBottom: theme.spacing.xxxl,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoText: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.lineHeights.body * 1.1,
  },
  featuresContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  featureCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(115, 83, 186, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  featureDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    lineHeight: theme.lineHeights.body * 1.1,
  },
  visualizationContainer: {
    marginVertical: theme.spacing.lg,
  },
  visualizationTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  visualizationDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  chartCard: {
    padding: theme.spacing.md,
  },
  chart: {
    height: 150,
  },
  chartLabels: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  chartLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    marginTop: theme.spacing.md,
  },
});

export default AboutSolsticeScreen;