/**
 * Custom animation utility functions using React Native's Animated API
 */

import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Creates a fade-in animation style
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts in ms
 * @param {function} callback - Optional callback to run when animation completes
 * @returns {object} - Animated style
 */
export const fadeIn = (duration = 500, delay = 0, callback) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(({ finished }) => {
      if (finished && callback) {
        callback();
      }
    });
    
    return () => opacity.stopAnimation();
  }, [opacity, duration, delay, callback]);
  
  return { opacity };
};

/**
 * Creates a fade-out animation style
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts in ms
 * @param {function} callback - Optional callback to run when animation completes
 * @returns {object} - Animated style
 */
export const fadeOut = (duration = 500, delay = 0, callback) => {
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(({ finished }) => {
      if (finished && callback) {
        callback();
      }
    });
    
    return () => opacity.stopAnimation();
  }, [opacity, duration, delay, callback]);
  
  return { opacity };
};

/**
 * Creates a fade-in with upward translation animation
 * @param {number} delay - Delay before animation starts in ms
 * @param {number} distance - Distance to translate from in pixels
 * @returns {object} - Animated style
 */
export const fadeInUp = (delay = 0, distance = 20) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    
    return () => {
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [opacity, translateY, delay, distance]);
  
  return { opacity, transform: [{ translateY }] };
};

/**
 * Creates a fade-in with downward translation animation
 * @param {number} delay - Delay before animation starts in ms
 * @param {number} distance - Distance to translate from in pixels
 * @returns {object} - Animated style
 */
export const fadeInDown = (delay = 0, distance = 20) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-distance)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    
    return () => {
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [opacity, translateY, delay, distance]);
  
  return { opacity, transform: [{ translateY }] };
};

/**
 * Creates a scale animation style
 * @param {number} from - Initial scale value
 * @param {number} to - Target scale value
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts in ms
 * @returns {object} - Animated style
 */
export const scale = (from = 0.9, to = 1, duration = 500, delay = 0) => {
  const scaleValue = useRef(new Animated.Value(from)).current;
  
  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: to,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
    
    return () => scaleValue.stopAnimation();
  }, [scaleValue, from, to, duration, delay]);
  
  return { transform: [{ scale: scaleValue }] };
};

/**
 * Creates a pulsing animation style
 * @param {number} intensity - Pulse intensity (0-1)
 * @param {number} duration - Animation duration in ms for one cycle
 * @returns {object} - Animated style
 */
export const pulse = (intensity = 0.1, duration = 1500) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1 + intensity,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
    
    return () => scaleValue.stopAnimation();
  }, [scaleValue, intensity, duration]);
  
  return { transform: [{ scale: scaleValue }] };
};

/**
 * Creates a floating animation style (subtle up and down movement)
 * @param {number} intensity - Float intensity in pixels
 * @param {number} duration - Animation duration in ms for one cycle
 * @returns {object} - Animated style
 */
export const float = (intensity = 5, duration = 3000) => {
  const translateY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -intensity,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
    
    return () => translateY.stopAnimation();
  }, [translateY, intensity, duration]);
  
  return { transform: [{ translateY }] };
};

/**
 * Creates a press animation with scale feedback
 * @param {number} pressedScale - Scale when pressed
 * @param {number} duration - Animation duration
 * @returns {object} - Handlers and animated style
 */
export const usePressAnimation = (pressedScale = 0.95, duration = 100) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: pressedScale,
      duration,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  };
  
  return {
    pressHandlers: {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
    },
    style: {
      transform: [{ scale: scaleValue }],
    },
  };
};

/**
 * Creates a staggered animation for a list of items
 * @param {number} itemCount - Number of items
 * @param {number} staggerDelay - Delay between each item animation
 * @param {number} initialDelay - Initial delay before first animation
 * @returns {Array} - Array of animated styles
 */
export const useStaggeredAnimations = (itemCount, staggerDelay = 50, initialDelay = 0) => {
  const animatedValues = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;
  
  useEffect(() => {
    const animations = animatedValues.map((values, index) => {
      const delay = initialDelay + index * staggerDelay;
      
      return Animated.parallel([
        Animated.timing(values.opacity, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(values.translateY, {
          toValue: 0,
          duration: 500,
          delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]);
    });
    
    Animated.stagger(staggerDelay, animations).start();
    
    return () => {
      animatedValues.forEach((values) => {
        values.opacity.stopAnimation();
        values.translateY.stopAnimation();
      });
    };
  }, [animatedValues, itemCount, staggerDelay, initialDelay]);
  
  return animatedValues.map((values) => ({
    opacity: values.opacity,
    transform: [{ translateY: values.translateY }],
  }));
};