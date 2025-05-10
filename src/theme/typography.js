/**
 * Typography definitions for the Voa app
 * Uses Space Grotesk as primary font and IBM Plex Mono as secondary font
 */

import { Platform, PixelRatio, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale font size based on screen width
export function normalize(size) {
  const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

const typography = {
  /**
   * Font families
   */
  fonts: {
    primary: {
      regular: 'SpaceGrotesk-Regular',
      medium: 'SpaceGrotesk-Medium',
      bold: 'SpaceGrotesk-Bold',
    },
    secondary: {
      regular: 'IBMPlexMono-Regular',
      medium: 'IBMPlexMono-Medium',
    },
  },
  
  /**
   * Font sizes for different purposes
   */
  sizes: {
    heading1: normalize(42),
    heading2: normalize(32),
    heading3: normalize(24),
    heading4: normalize(18),
    body: normalize(16),
    bodySmall: normalize(14),
    caption: normalize(12),
    tiny: normalize(10),
  },
  
  /**
   * Line heights
   */
  lineHeights: {
    heading1: normalize(48),
    heading2: normalize(38),
    heading3: normalize(30),
    heading4: normalize(24),
    body: normalize(22),
    bodySmall: normalize(20),
    caption: normalize(16),
    tiny: normalize(14),
  },
  
  /**
   * Letter spacing
   */
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    extraWide: 1.0,
  },
  
  /**
   * Font weights (although we're using custom fonts, these are useful for styled-components)
   */
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  
  /**
   * Pre-defined text styles for common use cases
   */
  styles: {
    // Will be populated in the theme index based on the above definitions
  }
};

// Populate the pre-defined text styles
typography.styles = {
  h1: {
    fontFamily: typography.fonts.primary.bold,
    fontSize: typography.sizes.heading1,
    lineHeight: typography.lineHeights.heading1,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fonts.primary.bold,
    fontSize: typography.sizes.heading2,
    lineHeight: typography.lineHeights.heading2,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fonts.primary.medium,
    fontSize: typography.sizes.heading3,
    lineHeight: typography.lineHeights.heading3,
    letterSpacing: typography.letterSpacing.normal,
  },
  h4: {
    fontFamily: typography.fonts.primary.medium,
    fontSize: typography.sizes.heading4,
    lineHeight: typography.lineHeights.heading4,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyLarge: {
    fontFamily: typography.fonts.primary.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyRegular: {
    fontFamily: typography.fonts.primary.regular,
    fontSize: typography.sizes.bodySmall,
    lineHeight: typography.lineHeights.bodySmall,
    letterSpacing: typography.letterSpacing.normal,
  },
  mono: {
    fontFamily: typography.fonts.secondary.regular,
    fontSize: typography.sizes.bodySmall,
    lineHeight: typography.lineHeights.bodySmall,
    letterSpacing: typography.letterSpacing.normal,
  },
  monoMedium: {
    fontFamily: typography.fonts.secondary.medium,
    fontSize: typography.sizes.bodySmall,
    lineHeight: typography.lineHeights.bodySmall,
    letterSpacing: typography.letterSpacing.normal,
  },
  caption: {
    fontFamily: typography.fonts.primary.regular,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    letterSpacing: typography.letterSpacing.wide,
  },
  tiny: {
    fontFamily: typography.fonts.primary.medium,
    fontSize: typography.sizes.tiny,
    lineHeight: typography.lineHeights.tiny,
    letterSpacing: typography.letterSpacing.wide,
  },
};

export default typography;