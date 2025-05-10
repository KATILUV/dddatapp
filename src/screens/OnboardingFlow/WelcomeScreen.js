/**
 * Welcome screen for the onboarding flow
 */
import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import AnimatedOrb from '../../components/AnimatedOrb';
import Button from '../../components/Button';
import theme from '../../theme';
import { fadeInUp } from '../../utils/animations';

const WelcomeScreen = ({ navigation }) => {
  // Animation styles
  const titleAnim = fadeInUp(300);
  const subtitleAnim = fadeInUp(500);
  const buttonAnim = fadeInUp(700);
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <AnimatedOrb size="medium" enhanced3d glow float />
          <Text style={styles.logoText}>SOLSTICE</Text>
        </View>
        
        <Animated.View style={[styles.titleContainer, titleAnim]}>
          <Text style={styles.title}>Own your data.</Text>
          <Text style={styles.title}>Understand yourself.</Text>
        </Animated.View>
        
        <Animated.View style={[styles.subtitleContainer, subtitleAnim]}>
          <Text style={styles.subtitle}>
            Other companies sell your data or keep it hidden. Solstice gives you full control over your digital history, 
            unlocking personalized insights to help you grow.
          </Text>
        </Animated.View>
        
        <Animated.View style={[styles.buttonContainer, buttonAnim]}>
          <Button 
            title="Get Started" 
            onPress={() => navigation.navigate('ConnectData')}
            variant="primary"
            size="large"
          />
          <Button
            title="Learn More"
            onPress={() => navigation.navigate('AboutSolstice')}
            variant="outline"
            size="large"
            style={styles.secondaryButton}
          />
        </Animated.View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoText: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fonts.primary.medium,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  subtitleContainer: {
    marginBottom: theme.spacing.xxl,
  },
  subtitle: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.lineHeights.body * 1.1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
  },
});

export default WelcomeScreen;