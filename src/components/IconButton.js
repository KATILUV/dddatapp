import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const IconButton = ({
  name,
  size = 24,
  color = theme.colors.text.primary,
  variant = 'ghost', // 'filled', 'ghost', 'outline', 'accent'
  onPress,
  style,
  disabled = false,
  isActive = false,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  
  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 100 });
    glow.value = withTiming(1, { duration: 200 });
  };
  
  const handlePressOut = () => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 300, easing: Easing.elastic(1.2) })
    );
    glow.value = withTiming(0, { duration: 500 });
  };
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glow.value * 0.7,
    };
  });
  
  // Apply styles based on variant
  const getButtonStyles = () => {
    let containerStyles = [styles.container];
    let backgroundColors = [];
    let borderColor = 'transparent';
    
    switch (variant) {
      case 'filled':
        containerStyles.push(styles.filledContainer);
        backgroundColors = theme.colors.gradients.accent;
        break;
      case 'outline':
        containerStyles.push(styles.outlineContainer);
        backgroundColors = ['transparent', 'transparent'];
        borderColor = theme.colors.accent.primary;
        break;
      case 'accent':
        containerStyles.push(styles.accentContainer);
        backgroundColors = ['rgba(168, 148, 255, 0.2)', 'rgba(168, 148, 255, 0.1)'];
        break;
      case 'ghost':
      default:
        containerStyles.push(styles.ghostContainer);
        backgroundColors = ['transparent', 'transparent'];
        break;
    }
    
    if (isActive) {
      containerStyles.push(styles.activeContainer);
      backgroundColors = variant !== 'filled' 
        ? ['rgba(168, 148, 255, 0.2)', 'rgba(168, 148, 255, 0.1)'] 
        : theme.colors.gradients.accent;
    }
    
    if (disabled) {
      containerStyles.push(styles.disabledContainer);
      color = theme.colors.text.muted;
    }
    
    return { containerStyles, backgroundColors, borderColor };
  };
  
  const { containerStyles, backgroundColors, borderColor } = getButtonStyles();
  
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[buttonAnimatedStyle, ...containerStyles, { borderColor }, style]}
      activeOpacity={0.9}
    >
      {variant !== 'ghost' && (
        <AnimatedLinearGradient
          colors={backgroundColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {variant === 'filled' && (
        <Animated.View style={[styles.glow, glowAnimatedStyle]}>
          <BlurView intensity={25} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      
      <Feather name={name} size={size} color={color} />
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  filledContainer: {
    backgroundColor: theme.colors.accent.primary,
    ...theme.shadows.medium,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  accentContainer: {
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
  },
  activeContainer: {
    backgroundColor: 'rgba(168, 148, 255, 0.2)',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: theme.colors.accent.primary,
    opacity: 0,
  },
});

export default IconButton;
