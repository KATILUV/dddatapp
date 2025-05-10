import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import theme from '../../theme';

/**
 * Custom icon component that provides both Feather icons and custom SVG icons
 * with consistent styling
 * 
 * @param {string} name - Icon name (from Feather or custom)
 * @param {number} size - Icon size
 * @param {string} color - Icon color
 * @param {object} style - Additional styles
 */
export const Icon = ({ name, size = 24, color = theme.colors.text.primary, style }) => {
  // First check if it's a Feather icon
  if (Object.keys(FeatherIconList).includes(name)) {
    return (
      <View style={[styles.iconContainer, style]}>
        <Feather name={name} size={size} color={color} />
      </View>
    );
  }
  
  // Then check if it's a custom icon
  if (CustomIcons[name]) {
    const CustomIcon = CustomIcons[name];
    return (
      <View style={[styles.iconContainer, style]}>
        <CustomIcon size={size} color={color} />
      </View>
    );
  }
  
  // Default to a placeholder if icon not found
  console.warn(`Icon "${name}" not found`);
  return (
    <View style={[styles.iconContainer, style]}>
      <Feather name="help-circle" size={size} color={color} />
    </View>
  );
};

// Commonly used Feather icons in the app for reference
const FeatherIconList = {
  // Navigation
  'home': true,
  'settings': true,
  'message-circle': true,
  'bar-chart-2': true,
  'arrow-left': true,
  'menu': true,
  
  // Actions
  'plus': true,
  'trash-2': true,
  'edit': true,
  'save': true,
  'copy': true,
  'share': true,
  'upload': true,
  'download': true,
  'link': true,
  'search': true,
  'send': true,
  
  // UI
  'check': true,
  'x': true,
  'info': true,
  'alert-circle': true,
  'check-circle': true,
  'chevron-right': true,
  'chevron-left': true,
  'chevron-up': true,
  'chevron-down': true,
  
  // Data sources
  'file-text': true,
  'image': true,
  'video': true,
  'music': true,
  'mic': true,
  'globe': true,
  'cloud': true,
  
  // Topics
  'heart': true,
  'star': true,
  'book': true,
  'calendar': true,
  'clock': true,
  'trending-up': true,
  'activity': true,
  'feather': true,
  'sun': true,
  'moon': true,
  'shield': true,
  'bell': true,
  'repeat': true,
};

// Custom SVG icons
const CustomIcons = {
  // Orb icon - represents the AI assistant
  'orb': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="orbGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={theme.colors.accent.primary} />
          <Stop offset="1" stopColor={theme.colors.accent.secondary} />
        </LinearGradient>
      </Defs>
      <Circle cx="12" cy="12" r="10" stroke="url(#orbGradient)" strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="5" fill="url(#orbGradient)" fillOpacity="0.5" />
    </Svg>
  ),
  
  // Insight icon - for data insights
  'insight': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Path 
        d="M12 7V12L15 15" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M7 17L17 7" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
    </Svg>
  ),
  
  // Connection icon - for data connections
  'connection': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="6" r="3" stroke={color} strokeWidth="1.5" />
      <Circle cx="18" cy="18" r="3" stroke={color} strokeWidth="1.5" />
      <Path 
        d="M8.5 8.5L15.5 15.5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
    </Svg>
  ),
  
  // Pattern icon - for behavior patterns
  'pattern': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="6" r="2" fill={color} />
      <Circle cx="6" cy="12" r="2" fill={color} />
      <Circle cx="6" cy="18" r="2" fill={color} />
      <Circle cx="12" cy="6" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="18" r="2" fill={color} />
      <Circle cx="18" cy="6" r="2" fill={color} />
      <Circle cx="18" cy="12" r="2" fill={color} />
      <Circle cx="18" cy="18" r="2" fill={color} />
    </Svg>
  ),
  
  // Emotion icon - for emotional analysis
  'emotion': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path 
        d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <Circle cx="8" cy="9" r="1" fill={color} />
      <Circle cx="16" cy="9" r="1" fill={color} />
    </Svg>
  ),
  
  // Privacy icon - for privacy settings
  'privacy': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 2L3 7V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V7L12 2Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M12 11V15" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  ),
  
  // Logo icon - for app logo
  'logo': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={theme.colors.accent.primary} />
          <Stop offset="1" stopColor={theme.colors.accent.secondary} />
        </LinearGradient>
      </Defs>
      <Circle cx="12" cy="12" r="10" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" />
      <Path 
        d="M7 14L12 7L17 14M9 11H15" 
        stroke="url(#logoGradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  ),
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Icon;
