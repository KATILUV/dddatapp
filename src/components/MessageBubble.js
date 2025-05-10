/**
 * Message bubble component for chat interface
 */
import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

/**
 * Message bubble component for displaying chat messages
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object with text, sender, timestamp
 * @param {boolean} props.isUser - Whether the message is from the user
 * @returns {React.ReactElement} - Rendered component
 */
const MessageBubble = ({ message, isUser }) => {
  const formattedTime = formatTime(message.timestamp);
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.aiContainer
    ]}>
      {isUser ? (
        <View style={styles.userBubble}>
          <Text style={styles.messageText}>{message.text}</Text>
          <Text style={styles.timestamp}>{formattedTime}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={['rgba(168, 148, 255, 0.15)', 'rgba(168, 148, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiBubble}
        >
          <Text style={styles.messageText}>{message.text}</Text>
          <Text style={styles.timestamp}>{formattedTime}</Text>
        </LinearGradient>
      )}
    </View>
  );
};

/**
 * Format timestamp to display time in 12-hour format
 * @param {string} isoString - ISO timestamp string
 * @returns {string} - Formatted time string (e.g., "2:30 PM")
 */
const formatTime = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginLeft: '15%',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    marginRight: '15%',
  },
  userBubble: {
    backgroundColor: theme.colors.accent.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  messageText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
  },
  timestamp: {
    ...theme.typography.styles.caption,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-end',
  },
});

export default MessageBubble;