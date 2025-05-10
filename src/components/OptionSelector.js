import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import theme from '../theme';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OptionSelector = ({
  options,
  selectedOption,
  onSelect,
  style
}) => {
  // Animation values for each option
  const animations = options.map(() => ({
    scale: useSharedValue(1),
    glow: useSharedValue(0)
  }));
  
  const handlePress = (option, index) => {
    // Animate the selected option
    animations[index].scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 200, easing: Easing.elastic(1.2) })
    );
    
    animations[index].glow.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 1500 })
    );
    
    onSelect(option);
  };
  
  // Generate animated styles for each option
  const getAnimatedStyles = (index) => {
    const scaleStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: animations[index].scale.value }]
      };
    });
    
    const glowStyle = useAnimatedStyle(() => {
      return {
        opacity: animations[index].glow.value,
      };
    });
    
    return { scaleStyle, glowStyle };
  };
  
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedOption;
        const { scaleStyle, glowStyle } = getAnimatedStyles(index);
        
        return (
          <AnimatedTouchable
            key={option.value}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
              scaleStyle
            ]}
            onPress={() => handlePress(option.value, index)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isSelected 
                ? ['rgba(168, 148, 255, 0.3)', 'rgba(168, 148, 255, 0.1)']
                : ['rgba(35, 35, 60, 0.6)', 'rgba(20, 20, 40, 0.4)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <BlurView intensity={10} style={StyleSheet.absoluteFill} />
            
            {isSelected && (
              <Animated.View style={[styles.glow, glowStyle]}>
                <BlurView intensity={30} style={StyleSheet.absoluteFill} />
              </Animated.View>
            )}
            
            {option.icon && (
              <View style={styles.iconContainer}>
                {option.icon}
              </View>
            )}
            
            <Text style={[
              styles.optionText,
              isSelected && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
            
            {option.description && (
              <Text style={styles.descriptionText}>
                {option.description}
              </Text>
            )}
          </AnimatedTouchable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - theme.spacing.xl * 2,
    alignSelf: 'center',
  },
  option: {
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(168, 148, 255, 0.2)',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: theme.colors.accent.primary,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.accent.primary,
    opacity: 0,
  },
  iconContainer: {
    marginBottom: theme.spacing.s,
  },
  optionText: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  selectedOptionText: {
    color: theme.colors.text.primary,
  },
  descriptionText: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.bodySmall,
  },
});

export default OptionSelector;
