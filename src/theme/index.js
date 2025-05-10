/**
 * Main theme configuration file that exports all theme variables
 */

import colors from './colors';
import typography from './typography';

// Spacing scale for margins, paddings, etc.
const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

// Border radius values
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 9999
};

// Animation durations
const animation = {
  fast: 200,
  medium: 300,
  slow: 500,
  veryFast: 100,
  verySlow: 800
};

// Shadows
const createShadow = (elevation, color = 'rgba(11, 11, 35, 0.2)') => ({
  elevation,
  shadowColor: color,
  shadowOffset: {
    width: 0,
    height: elevation,
  },
  shadowOpacity: 0.25,
  shadowRadius: elevation * 0.75,
});

const shadows = {
  none: createShadow(0),
  sm: createShadow(2),
  md: createShadow(4),
  lg: createShadow(8),
  xl: createShadow(16),
  glow: createShadow(12, colors.accent.glow),
};

// Element height scales
const heights = {
  input: 56,
  button: {
    sm: 36,
    md: 48,
    lg: 56
  },
  header: 60,
  tabBar: 84
};

// Merged theme object
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  animation,
  shadows,
  heights
};

export default theme;