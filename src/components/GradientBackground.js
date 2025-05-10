/**
 * Fullscreen gradient background component
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * Fullscreen gradient background component that wraps around the app content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Array} props.colors - Gradient colors array (optional, uses theme default)
 * @param {number} props.opacity - Background opacity (0-1)
 * @returns {React.ReactElement} - Rendered component
 */
const GradientBackground = ({ children, colors, opacity = 1 }) => {
  const gradientColors = colors || theme.colors.gradients.secondary;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={[styles.gradient, { opacity }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default GradientBackground;