import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import theme from '../theme';

const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'text'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  
  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
    glowOpacity.value = withTiming(1, { duration: 200 });
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.elastic(1) });
    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withDelay(50, withTiming(0, { duration: 300 }))
    );
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });
  
  const getButtonStyles = () => {
    let buttonStyles = [styles.button, styles[`${size}Button`]];
    let textStyles = [styles.text, styles[`${size}Text`]];
    let gradientColors = [];
    
    switch (variant) {
      case 'primary':
        buttonStyles.push(styles.primaryButton);
        textStyles.push(styles.primaryText);
        gradientColors = theme.colors.gradients.accent;
        break;
      case 'secondary':
        buttonStyles.push(styles.secondaryButton);
        textStyles.push(styles.secondaryText);
        gradientColors = ['rgba(168, 148, 255, 0.2)', 'rgba(168, 148, 255, 0.1)'];
        break;
      case 'outline':
        buttonStyles.push(styles.outlineButton);
        textStyles.push(styles.outlineText);
        gradientColors = ['transparent', 'transparent'];
        break;
      case 'text':
        buttonStyles.push(styles.textButton);
        textStyles.push(styles.textOnlyText);
        gradientColors = ['transparent', 'transparent'];
        break;
    }
    
    if (fullWidth) {
      buttonStyles.push(styles.fullWidth);
    }
    
    if (disabled) {
      buttonStyles.push(styles.disabledButton);
      textStyles.push(styles.disabledText);
      gradientColors = ['rgba(168, 148, 255, 0.1)', 'rgba(168, 148, 255, 0.05)'];
    }
    
    return { buttonStyles, textStyles, gradientColors };
  };
  
  const { buttonStyles, textStyles, gradientColors } = getButtonStyles();
  
  const renderButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? theme.colors.text.primary : theme.colors.accent.primary} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[...textStyles]}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </>
  );
  
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, ...buttonStyles, style]}
      activeOpacity={0.9}
    >
      {variant !== 'text' && (
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {variant === 'primary' && (
        <Animated.View style={[styles.glow, glowStyle]}>
          <BlurView intensity={25} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      
      {renderButtonContent()}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 148, 255, 0.3)',
  },
  smallButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
  },
  secondaryButton: {
    backgroundColor: 'rgba(11, 11, 35, 0.5)',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: theme.spacing.s,
  },
  fullWidth: {
    width: width - theme.spacing.xl * 2,
    alignSelf: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontFamily: theme.typography.fonts.mono.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.typography.sizes.bodySmall,
  },
  mediumText: {
    fontSize: theme.typography.sizes.body,
  },
  largeText: {
    fontSize: theme.typography.sizes.heading4,
  },
  primaryText: {
    color: theme.colors.text.primary,
  },
  secondaryText: {
    color: theme.colors.text.primary,
  },
  outlineText: {
    color: theme.colors.accent.primary,
  },
  textOnlyText: {
    color: theme.colors.accent.primary,
  },
  disabledText: {
    color: theme.colors.text.muted,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: theme.colors.accent.primary,
    opacity: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.s,
  },
  iconRight: {
    marginLeft: theme.spacing.s,
  },
});

export default Button;
