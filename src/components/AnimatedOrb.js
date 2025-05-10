/**
 * Animated floating orb component that serves as a visual focal point
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * Animated orb with pulsing and floating animation
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the orb ('small', 'medium', 'large')
 * @param {Array} props.colors - Gradient colors array (optional, uses theme default)
 * @param {Object} props.style - Additional styles for the orb container
 * @param {boolean} props.pulse - Whether to animate with pulsing effect
 * @param {boolean} props.float - Whether to animate with floating effect
 * @param {boolean} props.glow - Whether to add a glow effect
 * @returns {React.ReactElement} - Rendered component
 */
const AnimatedOrb = ({
  size = 'medium',
  colors,
  style,
  pulse = true,
  float = true,
  glow = true,
}) => {
  // Size presets
  const sizeMap = {
    small: 50,
    medium: 100,
    large: 200,
  };
  
  const orbSize = sizeMap[size] || sizeMap.medium;
  const orbColors = colors || theme.colors.gradients.accent;
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    // Create floating animation
    const floatAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateYAnim, {
            toValue: -10,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 10,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateXAnim, {
            toValue: -5,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: 5,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    
    // Create rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    // Start animations based on props
    if (pulse) pulseAnimation.start();
    if (float) floatAnimation.start();
    rotateAnimation.start();
    
    // Clean up animations on unmount
    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, [scaleAnim, translateYAnim, translateXAnim, rotateAnim, pulse, float]);
  
  // Interpolate rotation animation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          width: orbSize,
          height: orbSize,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
            { translateX: translateXAnim },
            { rotate: spin },
          ],
        },
      ]}
    >
      {/* Glow effect */}
      {glow && (
        <View
          style={[
            styles.glow,
            {
              width: orbSize * 1.5,
              height: orbSize * 1.5,
              borderRadius: orbSize,
              backgroundColor: orbColors[0],
              opacity: 0.2,
            },
          ]}
        />
      )}
      
      {/* Inner glow */}
      {glow && (
        <View
          style={[
            styles.glow,
            {
              width: orbSize * 1.2,
              height: orbSize * 1.2,
              borderRadius: orbSize,
              backgroundColor: orbColors[0],
              opacity: 0.4,
            },
          ]}
        />
      )}
      
      {/* Main orb */}
      <LinearGradient
        colors={orbColors}
        style={[
          styles.orb,
          {
            width: orbSize,
            height: orbSize,
            borderRadius: orbSize / 2,
          },
        ]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
      >
        {/* Inner highlight */}
        <View
          style={[
            styles.innerHighlight,
            {
              width: orbSize * 0.4,
              height: orbSize * 0.4,
              borderRadius: orbSize * 0.2,
              top: orbSize * 0.15,
              left: orbSize * 0.15,
            },
          ]}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    opacity: 0.3,
    zIndex: -1,
  },
  orb: {
    position: 'relative',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default AnimatedOrb;