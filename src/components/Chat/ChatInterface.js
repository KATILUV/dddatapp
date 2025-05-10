/**
 * Chat Interface component
 * Main component for the AI chat interaction
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import GlassmorphicCard from '../GlassmorphicCard';
import chatService from '../../services/chatService';
import dataSourceManager from '../../services/dataSources/dataSourceManager';

/**
 * Chat Interface component
 * @param {Object} props - Component props
 * @param {Array} props.initialMessages - Initial messages to display
 * @param {Function} props.onNewMessage - Callback when new message is received
 * @param {Function} props.onError - Callback when error occurs
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
export default function ChatInterface({
  initialMessages = [],
  onNewMessage,
  onError,
  style,
}) {
  const [messages, setMessages] = useState(initialMessages.length > 0 
    ? initialMessages 
    : [{
        id: 'welcome',
        text: 'Hi there! I\'m SOLSTICE, your personal AI assistant. I can help you understand patterns in your data and answer questions about your connected services. How can I help you today?',
        timestamp: new Date().toISOString(),
        isUser: false,
      }]
  );
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contextModalVisible, setContextModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [dataSourcesInfo, setDataSourcesInfo] = useState(null);
  const scrollViewRef = useRef(null);
  
  // Load data sources info when component mounts
  useEffect(() => {
    const loadDataSourcesInfo = async () => {
      try {
        await dataSourceManager.initialize();
        const sources = dataSourceManager.getConnectedSources();
        setDataSourcesInfo({
          connected: sources.length > 0,
          count: sources.length,
          sources
        });
      } catch (error) {
        console.error('Failed to load data sources info:', error);
      }
    };
    
    loadDataSourcesInfo();
  }, []);
  
  // Listen for keyboard events to adjust scroll view
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        scrollToBottom();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };
  
  // Handle message send
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toISOString(),
      isUser: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputDisabled(true);
    
    try {
      // Create history for context
      const history = messages
        .filter(msg => msg.id !== 'welcome') // Exclude welcome message
        .slice(-6) // Only use last 6 messages for context
        .map(msg => ({
          text: msg.text,
          isUser: msg.isUser
        }));
      
      // Send message to AI
      const aiResponse = await chatService.sendMessage(text, history);
      
      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: aiResponse.text,
        timestamp: aiResponse.timestamp || new Date().toISOString(),
        isUser: false,
        contextData: aiResponse.contextData,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Callback with new message
      if (onNewMessage) {
        onNewMessage(aiMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error while processing your message.',
        error: error.message || 'Something went wrong',
        timestamp: new Date().toISOString(),
        isUser: false,
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Callback with error
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      setInputDisabled(false);
    }
  };
  
  // Handle retry of failed message
  const handleRetry = (message) => {
    // Find the preceding user message
    const messageIndex = messages.findIndex(msg => msg.id === message.id);
    if (messageIndex <= 0) return;
    
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || !userMessage.isUser) return;
    
    // Remove the error message
    const updatedMessages = messages.filter(msg => msg.id !== message.id);
    setMessages(updatedMessages);
    
    // Re-send the user message
    handleSendMessage(userMessage.text);
  };
  
  // Show context information
  const handleShowContext = (message) => {
    setSelectedMessage(message);
    setContextModalVisible(true);
  };
  
  // Render context modal
  const renderContextModal = () => {
    if (!selectedMessage) return null;
    
    return (
      <Modal
        visible={contextModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setContextModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 15, 60, 0.9)', 'rgba(10, 5, 30, 0.95)']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Data Sources Used</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setContextModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.contextDescription}>
                This response was generated using data from the following sources:
              </Text>
              
              {selectedMessage.contextData && selectedMessage.contextData.map((sourceId, index) => {
                const source = dataSourcesInfo?.sources.find(s => s.id === sourceId);
                return (
                  <GlassmorphicCard key={index} style={styles.sourceCard}>
                    <Ionicons
                      name={source?.icon || 'document-outline'}
                      size={20}
                      color={source?.color || '#A388FF'}
                      style={styles.sourceIcon}
                    />
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceName}>{source?.name || sourceId}</Text>
                      <Text style={styles.sourceType}>
                        {source?.type || 'Unknown Source Type'}
                      </Text>
                    </View>
                  </GlassmorphicCard>
                );
              })}
              
              <Text style={styles.privacyNote}>
                Your data remains private and is only used to generate personalized responses.
              </Text>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setContextModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </Modal>
    );
  };
  
  // Render connection info for first-time users
  const renderDataSourcesInfo = () => {
    if (messages.length > 2 || !dataSourcesInfo) return null;
    
    return (
      <View style={styles.dataSourcesInfoContainer}>
        {dataSourcesInfo.connected ? (
          <View style={styles.connectedSourcesInfo}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.connectedText}>
              {dataSourcesInfo.count} data {dataSourcesInfo.count === 1 ? 'source' : 'sources'} connected
            </Text>
          </View>
        ) : (
          <View style={styles.noSourcesInfo}>
            <Ionicons name="information-circle" size={16} color="#A388FF" />
            <Text style={styles.noSourcesText}>
              Connect data sources for personalized insights
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages scroll view */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Data sources info for new users */}
        {renderDataSourcesInfo()}
        
        {/* Message bubbles */}
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isUser={message.isUser}
            onRetry={handleRetry}
            onContextInfo={handleShowContext}
          />
        ))}
        
        {/* Loading indicator for AI response */}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#A388FF" />
              <Text style={styles.typingText}>SOLSTICE is thinking...</Text>
            </View>
          </View>
        )}
        
        {/* Extra space at bottom for keyboard */}
        <View style={{ height: keyboardHeight > 0 ? 20 : 60 }} />
      </ScrollView>
      
      {/* Message input */}
      <ChatInput
        onSend={handleSendMessage}
        isSending={isLoading}
        disabled={inputDisabled}
      />
      
      {/* Context info modal */}
      {renderContextModal()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingTop: 20,
  },
  typingIndicator: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 15, 60, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typingText: {
    marginLeft: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  modalBody: {
    padding: 20,
  },
  contextDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
    lineHeight: 20,
  },
  sourceCard: {
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    marginRight: 10,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sourceType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  privacyNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A388FF',
  },
  dataSourcesInfoContainer: {
    marginBottom: 16,
    alignItems: 'center',
    opacity: 0.8,
  },
  connectedSourcesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  connectedText: {
    color: '#34C759',
    fontSize: 13,
    marginLeft: 5,
  },
  noSourcesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(163, 136, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  noSourcesText: {
    color: '#A388FF',
    fontSize: 13,
    marginLeft: 5,
  },
});