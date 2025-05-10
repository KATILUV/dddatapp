import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useDerivedValue
} from 'react-native-reanimated';
import theme from '../theme';

const { width } = Dimensions.get('window');

const ProgressDots = ({
  steps,
  currentStep,
  style
}) => {
  // Create an array of animated values for each dot
  const dots = React.useMemo(() => 
    Array.from({ length: steps }).map((_, index) => {
      // Derived value for dot color and scale based on current step
      const progress = useDerivedValue(() => {
        if (index < currentStep) return 1; // completed
        if (index === currentStep) return 0.5; // current
        return 0; // upcoming
      }, [currentStep]);
      
      // Animated style for each dot
      const dotStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
          progress.value,
          [0, 0.5, 1],
          [
            'rgba(168, 148, 255, 0.3)', // upcoming
            theme.colors.accent.primary, // current
            theme.colors.accent.primary, // completed
          ]
        );
        
        const scale = withTiming(
          index === currentStep ? 1.2 : 1,
          { duration: 300 }
        );
        
        const opacity = withTiming(
          index < currentStep ? 1 : (index === currentStep ? 1 : 0.5),
          { duration: 300 }
        );
        
        return {
          backgroundColor,
          transform: [{ scale }],
          opacity,
        };
      }, [currentStep]);
      
      return { progress, dotStyle };
    }), [steps, currentStep]);
  
  return (
    <View style={[styles.container, style]}>
      {dots.map((dot, index) => (
        <Animated.View key={index} style={[styles.dot, dot.dotStyle]} />
      ))}
      
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.6,
    height: 40,
    alignSelf: 'center',
    position: 'relative',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent.primary,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 148, 255, 0.4)',
  },
  line: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(168, 148, 255, 0.3)',
    left: 20,
    right: 20,
    zIndex: -1,
  },
});

export default ProgressDots;
