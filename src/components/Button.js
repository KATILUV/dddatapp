/**
 * Custom button component with various styles
 */
import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePressAnimation } from '../utils/animations';
import theme from '../theme';

/**
 * Custom button component with multiple variants
 * @param {Object} props - Component props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Callback function when button is pressed
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.variant - Button style variant ('primary', 'secondary', 'outline', 'text')
 * @param {string} props.size - Button size ('small', 'medium', 'large')
 * @param {boolean} props.isLoading - Whether to show loading indicator
 * @param {string} props.iconLeft - Name of icon to display on left side
 * @param {string} props.iconRight - Name of icon to display on right side
 * @param {Object} props.style - Additional styles for the button
 * @returns {React.ReactElement} - Rendered component
 */
const Button = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  iconLeft,
  iconRight,
  style,
}) => {
  // Get animation handlers and styles
  const { pressHandlers, style: animatedStyle } = usePressAnimation();
  
  // Determine button height based on size
  const buttonHeight = {
    small: theme.heights.button.sm,
    medium: theme.heights.button.md,
    large: theme.heights.button.lg,
  }[size];
  
  // Determine icon size based on button size
  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];
  
  // Common touchable props
  const touchableProps = {
    onPress: disabled || isLoading ? null : onPress,
    activeOpacity: 0.8,
    disabled,
    ...pressHandlers,
  };
  
  // Determine content color based on variant
  const getContentColor = () => {
    if (disabled) return theme.colors.text.disabled;
    
    switch (variant) {
      case 'primary':
        return theme.colors.text.inverse;
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
        return theme.colors.accent.primary;
      case 'text':
        return theme.colors.accent.primary;
      default:
        return theme.colors.text.primary;
    }
  };
  
  // Render button content with icons
  const renderContent = () => {
    const contentColor = getContentColor();
    
    return (
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator 
            color={contentColor} 
            size="small" 
          />
        ) : (
          <>
            {iconLeft && (
              <Ionicons 
                name={iconLeft} 
                size={iconSize} 
                color={contentColor} 
                style={styles.iconLeft} 
              />
            )}
            
            <Text 
              style={[
                styles.buttonText,
                { 
                  color: contentColor,
                  fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
                },
              ]}
            >
              {title}
            </Text>
            
            {iconRight && (
              <Ionicons 
                name={iconRight} 
                size={iconSize} 
                color={contentColor} 
                style={styles.iconRight} 
              />
            )}
          </>
        )}
      </View>
    );
  };
  
  // Render button based on variant
  const renderButton = () => {
    const gradientColors = disabled 
      ? ['rgba(100, 100, 100, 0.2)', 'rgba(80, 80, 80, 0.3)'] 
      : theme.colors.gradients.accent;
      
    switch (variant) {
      case 'primary':
        return (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              styles.primaryButton,
              { height: buttonHeight },
              style,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        );
        
      case 'secondary':
        return (
          <View
            style={[
              styles.button,
              styles.secondaryButton,
              { height: buttonHeight },
              style,
            ]}
          >
            {renderContent()}
          </View>
        );
        
      case 'outline':
        return (
          <View
            style={[
              styles.button,
              styles.outlineButton,
              { height: buttonHeight },
              disabled && styles.disabledOutlineButton,
              style,
            ]}
          >
            {renderContent()}
          </View>
        );
        
      case 'text':
        return (
          <View
            style={[
              styles.button,
              styles.textButton,
              { height: buttonHeight },
              style,
            ]}
          >
            {renderContent()}
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <TouchableOpacity 
      {...touchableProps}
      style={[animatedStyle, styles.touchable]}
    >
      {renderButton()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 120,
  },
  primaryButton: {
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.accent.glow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent.primary,
  },
  disabledOutlineButton: {
    borderColor: theme.colors.text.disabled,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.sm,
    minWidth: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.typography.styles.bodyRegular,
    fontFamily: theme.typography.fonts.primary.medium,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});

export default Button;