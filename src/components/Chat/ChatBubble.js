/**
 * Chat Bubble component for displaying messages in the chat interface
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Format timestamp to display time in 12-hour format
 * @param {string} isoString - ISO timestamp string
 * @returns {string} - Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (isoString) => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * ChatBubble component for displaying individual chat messages
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object
 * @param {boolean} props.isUser - Whether message is from user
 * @param {Function} props.onRetry - Callback for retry button
 * @param {Function} props.onContextInfo - Callback to show context info
 * @returns {React.ReactElement} - Rendered component
 */
export default function ChatBubble({ 
  message, 
  isUser,
  onRetry,
  onContextInfo 
}) {
  // Handle errors
  const hasError = message.error;
  
  // Determine if this message used context data
  const hasContext = message.contextData && message.contextData.length > 0;
  
  // Render message content
  const renderContent = () => {
    if (hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
          <Text style={styles.errorText}>{message.error}</Text>
          
          {onRetry && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => onRetry(message)}
            >
              <Ionicons name="refresh-outline" size={16} color="#A388FF" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <Text style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {message.text}
      </Text>
    );
  };
  
  // Render context data indicator
  const renderContextIndicator = () => {
    if (!hasContext || isUser) return null;
    
    return (
      <TouchableOpacity 
        style={styles.contextButton}
        onPress={() => onContextInfo && onContextInfo(message)}
      >
        <Ionicons name="information-circle-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
        <Text style={styles.contextText}>
          Using data from {message.contextData.length} source{message.contextData.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      {/* Bubble content */}
      {isUser ? (
        <View style={[styles.bubble, styles.userBubble]}>
          {renderContent()}
        </View>
      ) : (
        <LinearGradient
          colors={['rgba(30, 15, 60, 0.7)', 'rgba(17, 9, 32, 0.7)']}
          style={[styles.bubble, styles.assistantBubble]}
        >
          {renderContent()}
        </LinearGradient>
      )}
      
      {/* Timestamp and context info */}
      <View style={[
        styles.messageInfo,
        isUser ? styles.userMessageInfo : styles.assistantMessageInfo
      ]}>
        <Text style={styles.timestamp}>
          {formatTime(message.timestamp)}
        </Text>
        
        {renderContextIndicator()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#7B61FF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  messageInfo: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  userMessageInfo: {
    justifyContent: 'flex-end',
  },
  assistantMessageInfo: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  contextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  contextText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 3,
  },
  errorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(163, 136, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  retryText: {
    color: '#A388FF',
    fontSize: 14,
    marginLeft: 4,
  },
});