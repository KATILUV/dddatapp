/**
 * Login screen for user authentication
 */
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import AnimatedOrb from '../components/AnimatedOrb';
import theme from '../theme';
import { useAuth } from '../hooks/useAuth';
import { fadeInUp } from '../utils/animations';

/**
 * Login screen component
 * @returns {React.ReactElement} - Rendered component
 */
const LoginScreen = ({ navigation }) => {
  const { signIn, loading, error } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Animation styles
  const logoAnim = fadeInUp(200);
  const cardAnim = fadeInUp(400);
  const buttonAnim = fadeInUp(600);
  
  // Handle login with Replit
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      Keyboard.dismiss();
      await signIn();
      // The user will be redirected to Replit's auth page
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoggingIn(false);
    }
  };
  
  return (
    <GradientBackground>
      <Animated.View style={[styles.logoContainer, logoAnim]}>
        <AnimatedOrb size="large" enhanced3d glow float />
        <Text style={styles.logoText}>SOLSTICE</Text>
        <Text style={styles.tagline}>Own your data. Understand yourself.</Text>
      </Animated.View>
      
      <Animated.View style={[styles.cardContainer, cardAnim]}>
        <GlassmorphicCard style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardDescription}>
            Log in to access your personal insights and manage your connected data sources.
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.status.error} />
              <Text style={styles.errorText}>
                {typeof error === 'string' ? error : 'Failed to log in. Please try again.'}
              </Text>
            </View>
          )}
          
          <Animated.View style={[styles.buttonContainer, buttonAnim]}>
            <Button
              title="Log in with Replit"
              onPress={handleLogin}
              variant="primary"
              size="large"
              iconLeft="log-in-outline"
              isLoading={isLoggingIn || loading}
              style={styles.loginButton}
            />
            
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </GlassmorphicCard>
      </Animated.View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15%',
    marginBottom: '10%',
  },
  logoText: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    letterSpacing: theme.typography.letterSpacing.extraWide,
  },
  tagline: {
    ...theme.typography.styles.subtitle,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  cardContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  cardDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight: theme.lineHeights.body * 1.1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.status.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    ...theme.typography.styles.buttonRegular,
    color: theme.colors.text.secondary,
  },
});

export default LoginScreen;