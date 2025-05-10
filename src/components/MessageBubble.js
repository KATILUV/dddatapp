import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  Easing,
  withTiming
} from 'react-native-reanimated';
import theme from '../theme';

const MessageBubble = ({
  message,
  isUser = false,
  timestamp,
  isTyping = false,
  animate = true,
  style
}) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const typing = useSharedValue(isTyping ? 1 : 0);
  
  React.useEffect(() => {
    if (animate) {
      translateY.value = withSpring(0, { damping: 12, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      scale.value = withDelay(
        50, 
        withSpring(1, { damping: 12, stiffness: 120 })
      );
    } else {
      translateY.value = 0;
      opacity.value = 1;
      scale.value = 1;
    }
    
    typing.value = withTiming(isTyping ? 1 : 0, { duration: 300 });
  }, [isTyping]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });
  
  const renderTypingIndicator = () => {
    return (
      <View style={styles.typingContainer}>
        <Animated.View style={[styles.dot, {
          opacity: withDelay(0, withRepeat(withTiming(0.4, { duration: 600 }), -1, true))
        }]} />
        <Animated.View style={[styles.dot, {
          opacity: withDelay(200, withRepeat(withTiming(0.4, { duration: 600 }), -1, true))
        }]} />
        <Animated.View style={[styles.dot, {
          opacity: withDelay(400, withRepeat(withTiming(0.4, { duration: 600 }), -1, true))
        }]} />
      </View>
    );
  };
  
  return (
    <Animated.View style={[
      styles.container,
      isUser ? styles.userContainer : styles.aiContainer,
      animatedStyle,
      style
    ]}>
      {isUser ? (
        <View style={[styles.bubble, styles.userBubble]}>
          <LinearGradient
            colors={['rgba(168, 148, 255, 0.3)', 'rgba(168, 148, 255, 0.1)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={[styles.message, styles.userMessage]}>
            {message}
          </Text>
        </View>
      ) : (
        <View style={[styles.bubble, styles.aiBubble]}>
          <BlurView intensity={10} style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['rgba(35, 35, 60, 0.6)', 'rgba(20, 20, 40, 0.4)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </BlurView>
          {isTyping ? (
            renderTypingIndicator()
          ) : (
            <Text style={[styles.message, styles.aiMessage]}>
              {message}
            </Text>
          )}
        </View>
      )}
      
      {timestamp && (
        <Text style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.aiTimestamp,
        ]}>
          {timestamp}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.s,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: theme.spacing.m,
  },
  aiContainer: {
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.m,
  },
  bubble: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    minHeight: 36,
  },
  userBubble: {
    backgroundColor: 'rgba(168, 148, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 148, 255, 0.3)',
  },
  aiBubble: {
    backgroundColor: 'rgba(25, 25, 50, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(248, 233, 180, 0.15)',
  },
  message: {
    padding: theme.spacing.m,
    fontSize: theme.typography.sizes.body,
  },
  userMessage: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.serif.regular,
  },
  aiMessage: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.serif.regular,
    lineHeight: theme.typography.lineHeights.body,
  },
  timestamp: {
    fontSize: theme.typography.sizes.tiny,
    marginTop: theme.spacing.xs,
    marginHorizontal: theme.spacing.s,
  },
  userTimestamp: {
    alignSelf: 'flex-end',
    color: theme.colors.text.muted,
  },
  aiTimestamp: {
    alignSelf: 'flex-start',
    color: theme.colors.text.muted,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.m,
    height: 36,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.primary,
    marginHorizontal: 3,
  },
});

export default MessageBubble;
