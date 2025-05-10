/**
 * Progress indicator dots for multi-step flows
 */
import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import theme from '../theme';

/**
 * Renders a series of dots to indicate progress through a multi-step flow
 * @param {Object} props - Component props
 * @param {number} props.totalSteps - Total number of steps
 * @param {number} props.currentStep - Current active step (0-indexed)
 * @param {Object} props.style - Additional styles
 * @returns {React.ReactElement} - Rendered component
 */
const ProgressDots = ({ totalSteps, currentStep, style }) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;
        
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isPast && styles.pastDot,
              isActive && styles.activeDot,
            ]}
          >
            {isActive && (
              <View style={styles.activeDotInner} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastDot: {
    backgroundColor: theme.colors.accent.secondary,
    opacity: 0.6,
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
  },
  activeDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent.primary,
  },
});

export default ProgressDots;