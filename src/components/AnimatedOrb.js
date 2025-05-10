/**
 * Enhanced 3D animated floating orb component that serves as a visual focal point
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * Enhanced 3D animated orb with advanced lighting and animation effects
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the orb ('small', 'medium', 'large')
 * @param {Array} props.colors - Gradient colors array (optional, uses theme default)
 * @param {Object} props.style - Additional styles for the orb container
 * @param {boolean} props.pulse - Whether to animate with pulsing effect
 * @param {boolean} props.float - Whether to animate with floating effect
 * @param {boolean} props.glow - Whether to add a glow effect
 * @param {boolean} props.enhanced3d - Whether to use enhanced 3D effects
 * @returns {React.ReactElement} - Rendered component
 */
const AnimatedOrb = ({
  size = 'medium',
  colors,
  style,
  pulse = true,
  float = true,
  glow = true,
  enhanced3d = true,
}) => {
  // Size presets
  const sizeMap = {
    small: 40,
    medium: 80,
    large: 160,
  };
  
  const orbSize = sizeMap[size] || sizeMap.medium;
  const orbColors = colors || theme.colors.gradients.accent;
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const rotateYAnim = useRef(new Animated.Value(0)).current;
  const rotateZAnim = useRef(new Animated.Value(0)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0.5)).current;
  
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
    
    // Create 3D rotation animation for X, Y, and Z axes
    const rotateXAnimation = Animated.loop(
      Animated.timing(rotateXAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    const rotateYAnimation = Animated.loop(
      Animated.timing(rotateYAnim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    const rotateZAnimation = Animated.loop(
      Animated.timing(rotateZAnim, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    // Create glow pulsing animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacityAnim, {
          toValue: 0.8,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacityAnim, {
          toValue: 0.3,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    // Start animations based on props
    if (pulse) pulseAnimation.start();
    if (float) floatAnimation.start();
    if (enhanced3d) {
      rotateXAnimation.start();
      rotateYAnimation.start();
      rotateZAnimation.start();
    }
    if (glow) glowAnimation.start();
    
    // Clean up animations on unmount
    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
      rotateXAnimation.stop();
      rotateYAnimation.stop();
      rotateZAnimation.stop();
      glowAnimation.stop();
    };
  }, [
    scaleAnim, 
    translateYAnim, 
    translateXAnim, 
    rotateXAnim, 
    rotateYAnim, 
    rotateZAnim, 
    glowOpacityAnim,
    pulse, 
    float, 
    glow, 
    enhanced3d
  ]);
  
  // Interpolate rotation animations
  const rotateX = rotateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const rotateY = rotateYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const rotateZ = rotateZAnim.interpolate({
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
            { rotateX: enhanced3d ? rotateX : '0deg' },
            { rotateY: enhanced3d ? rotateY : '0deg' },
            { rotateZ: enhanced3d ? rotateZ : '0deg' },
          ],
        },
      ]}
    >
      {/* Outer glow effect */}
      {glow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: orbSize * 1.8,
              height: orbSize * 1.8,
              borderRadius: orbSize,
              backgroundColor: orbColors[0],
              opacity: glowOpacityAnim,
              shadowColor: orbColors[0],
              shadowRadius: orbSize * 0.5,
            },
          ]}
        />
      )}
      
      {/* Middle glow layer */}
      {glow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: orbSize * 1.4,
              height: orbSize * 1.4,
              borderRadius: orbSize,
              backgroundColor: orbColors[0],
              opacity: Animated.multiply(glowOpacityAnim, 1.4),
            },
          ]}
        />
      )}
      
      {/* Inner glow layer */}
      {glow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: orbSize * 1.1,
              height: orbSize * 1.1,
              borderRadius: orbSize,
              backgroundColor: orbColors[0],
              opacity: Animated.multiply(glowOpacityAnim, 1.8),
            },
          ]}
        />
      )}
      
      {/* Simplified face-like shape similar to the reference logo */}
      <View style={styles.orbContainer}>
        <View style={[
          styles.outlineShape,
          {
            width: orbSize * 0.7,
            height: orbSize,
            borderRadius: orbSize / 2,
            borderWidth: 2,
            borderColor: theme.colors.accent.primary,
          }
        ]}>
          {/* Left eye */}
          <View style={[
            styles.eyeShape,
            {
              width: orbSize * 0.12,
              height: orbSize * 0.12,
              borderRadius: orbSize * 0.06,
              top: orbSize * 0.25,
              left: orbSize * 0.18,
            }
          ]} />
          
          {/* Right eye */}
          <View style={[
            styles.eyeShape,
            {
              width: orbSize * 0.12,
              height: orbSize * 0.12,
              borderRadius: orbSize * 0.06,
              top: orbSize * 0.25,
              right: orbSize * 0.18,
            }
          ]} />
          
          {/* Smile */}
          <View style={[
            styles.smileShape,
            {
              width: orbSize * 0.35,
              height: orbSize * 0.3,
              borderBottomLeftRadius: orbSize * 0.3,
              borderBottomRightRadius: orbSize * 0.3,
              bottom: orbSize * 0.25,
              alignSelf: 'center',
            }
          ]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    perspective: 1000, // Adds perspective for 3D effect
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: -1,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.accent.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  orbContainer: {
    shadowColor: theme.colors.accent.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineShape: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeShape: {
    position: 'absolute',
    backgroundColor: theme.colors.accent.primary,
    borderRadius: 5,
  },
  smileShape: {
    position: 'absolute',
    borderTopWidth: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.colors.accent.primary,
    backgroundColor: 'transparent',
  },
});

export default AnimatedOrb;