/**
 * Glassmorphic card component with blur effect
 */
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * Glassmorphic card component with blur effect and gradient border
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {function} props.onPress - Callback function when card is pressed
 * @param {Object} props.style - Additional styles for the card
 * @param {string} props.intensity - Blur intensity ('low', 'medium', 'high')
 * @param {boolean} props.useBorder - Whether to show gradient border
 * @param {boolean} props.isActive - Whether card is in active state
 * @returns {React.ReactElement} - Rendered component
 */
const GlassmorphicCard = ({
  children,
  onPress,
  style,
  intensity = 'medium',
  useBorder = true,
  isActive = false,
}) => {
  // Configure blur intensity based on level
  const blurIntensity = {
    low: 20,
    medium: 50,
    high: 80,
  }[intensity];

  // Configure border gradient colors based on active state
  const borderColors = isActive
    ? theme.colors.gradients.accent
    : [theme.colors.border.light, theme.colors.border.medium];

  // Determine background intensity
  const cardColors = theme.colors.gradients.card;
  
  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <CardWrapper {...cardProps} style={[styles.container, style]}>
      {/* Gradient border */}
      {useBorder && (
        <LinearGradient
          colors={borderColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.border}
        />
      )}
      
      {/* Blur card content */}
      <BlurView intensity={blurIntensity} style={styles.blur} tint="dark">
        <LinearGradient
          colors={cardColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      </BlurView>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadows.light,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderRadius: theme.borderRadius.lg,
    margin: -1, // Extend border beyond container
    zIndex: -1,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
    margin: 1, // Offset to show border
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: theme.spacing.md,
  },
});

export default GlassmorphicCard;