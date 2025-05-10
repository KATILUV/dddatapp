import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import theme from '../theme';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const Header = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  animatedValue,
  style
}) => {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(transparent ? 0 : 1);
  const scale = useSharedValue(1);
  
  // Animation for button press
  const handleButtonPressIn = () => {
    scale.value = withTiming(0.92, { duration: 100 });
  };
  
  const handleButtonPressOut = () => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 200, easing: Easing.elastic(1.5) })
    );
  };
  
  // For scroll-based animation when animatedValue is provided
  const blurAnimatedStyle = useAnimatedStyle(() => {
    if (animatedValue) {
      const scrollOpacity = animatedValue.value > 20 
        ? Math.min((animatedValue.value - 20) / 80, 1) 
        : 0;
      return { opacity: scrollOpacity };
    }
    return { opacity: opacity.value };
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      {!transparent && (
        <AnimatedBlurView 
          intensity={40} 
          tint="dark" 
          style={[StyleSheet.absoluteFill, styles.blur, blurAnimatedStyle]} 
        />
      )}
      
      <View style={styles.content}>
        {leftIcon ? (
          <Animated.View style={[styles.iconContainer, buttonAnimatedStyle]}>
            <TouchableOpacity
              onPress={onLeftPress}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              style={styles.iconButton}
            >
              {typeof leftIcon === 'string' ? (
                <Feather name={leftIcon} size={24} color={theme.colors.text.primary} />
              ) : (
                leftIcon
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        {rightIcon ? (
          <Animated.View style={[styles.iconContainer, buttonAnimatedStyle]}>
            <TouchableOpacity
              onPress={onRightPress}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              style={styles.iconButton}
            >
              {typeof rightIcon === 'string' ? (
                <Feather name={rightIcon} size={24} color={theme.colors.text.primary} />
              ) : (
                rightIcon
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
      
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blur: {
    backgroundColor: 'rgba(11, 11, 35, 0.5)',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
  },
  title: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 40,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
  },
});

export default Header;
