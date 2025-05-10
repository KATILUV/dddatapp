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
  // Configure blur intensity based on level - more subtle for minimalist UI
  const blurIntensity = {
    low: 10,
    medium: 25,
    high: 40,
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
    borderRadius: 20, // Slightly larger, smoother radius like in reference
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadows.light,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderRadius: 20,
    margin: -0.5, // Thinner, more subtle border
    zIndex: -1,
    opacity: 0.7, // More subtle border
  },
  blur: {
    overflow: 'hidden',
    borderRadius: 20,
    margin: 0.5, // Subtler border
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: theme.spacing.lg, // More padding for cleaner look
  },
});

export default GlassmorphicCard;