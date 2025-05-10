/**
 * Chat screen for interacting with the AI assistant
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import GradientBackground from '../components/GradientBackground';
import MessageBubble from '../components/MessageBubble';
import { getData, storeMessages } from '../utils/storage';
import openaiService from '../services/openai';
import theme from '../theme';
import { fadeIn } from '../utils/animations';

/**
 * Chat screen component for conversing with the AI
 * @returns {React.ReactElement} - Rendered component
 */
const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const [userData, setUserData] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Load messages and user data
    const loadData = async () => {
      try {
        const storedMessages = await getData('messages');
        if (storedMessages && storedMessages.length > 0) {
          setMessages(storedMessages);
        } else {
          // Add a welcome message if there are no messages
          const welcomeMessage = createWelcomeMessage();
          setMessages([welcomeMessage]);
          await storeMessages([welcomeMessage]);
        }
        
        const userData = await getData('userData');
        if (userData) {
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };
    
    loadData();
  }, [fadeAnim]);
  
  const createWelcomeMessage = () => {
    return {
      id: 'welcome-1',
      text: "Welcome to Voa. I'm here to help you gain insights from your personal data. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };
  };
  
  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    // Create and add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Save messages
    await storeMessages(updatedMessages);
    
    // In a real app, we would send the message to an API
    // For now, simulate a response
    setTimeout(() => {
      respondToMessage(userMessage.text, updatedMessages);
    }, 1500);
  };
  
  const respondToMessage = async (userText, currentMessages) => {
    try {
      // Prepare conversation context by formatting messages for OpenAI API
      // We'll take the last few messages for context
      const recentMessages = currentMessages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add system message at the beginning for context
      const messages = [
        {
          role: 'system',
          content: `You are Voa, a personal AI assistant focused on helping users analyze their personal data to gain insights 
          about themselves. Your tone should be ${userData?.tone || 'balanced'}, professional, and focused on data analysis. 
          The user's name is ${userData?.name || 'the user'}. 
          Focus on helping the user understand patterns in their data, digital behavior, and personal insights.`
        },
        ...recentMessages
      ];
      
      let responseText = '';
      
      try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('API key not available');
        }
        
        // Get response from OpenAI
        const response = await openaiService.getChatCompletion(messages);
        responseText = response.choices[0].message.content;
      } catch (error) {
        console.error('Error calling OpenAI:', error);
        
        // Fallback responses if API call fails
        const lowerText = userText.toLowerCase();
        
        if (lowerText.includes('hello') || lowerText.includes('hi')) {
          responseText = `Hello${userData?.name ? ` ${userData.name}` : ''}! How can I help you today?`;
        } else if (lowerText.includes('data') || lowerText.includes('upload')) {
          responseText = "You can upload your data from the Data Connection screen. I can analyze various sources like social media exports, notes, journals, and more.";
        } else if (lowerText.includes('insight') || lowerText.includes('analyze')) {
          responseText = "I can generate insights about your digital behavior, content preferences, and personal patterns. The more data you provide, the more personalized insights I can offer.";
        } else if (lowerText.includes('help') || lowerText.includes('how')) {
          responseText = "I'm here to help you understand your digital presence. You can ask me questions about your data, request specific analyses, or explore insights I've already generated.";
        } else {
          responseText = "I'm having trouble connecting to my knowledge base. Please check your internet connection or API configuration.";
        }
        
        // Alert the user if API key is missing
        if (error.message === 'API key not available') {
          Alert.alert(
            "OpenAI API Key Missing",
            "Please add your OpenAI API key in the app settings to enable AI responses.",
            [{ text: "OK" }]
          );
        }
      }
      
      // Create AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      
      // Add AI message to state
      const updatedMessages = [...currentMessages, aiMessage];
      setMessages(updatedMessages);
      setIsTyping(false);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Save messages
      await storeMessages(updatedMessages);
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };
  
  const renderMessage = ({ item }) => {
    return (
      <MessageBubble
        message={item}
        isUser={item.sender === 'user'}
      />
    );
  };
  
  const renderChatEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Animated.View style={[styles.emptyContent, { opacity: fadeAnim }]}>
          <Text style={styles.emptyTitle}>Start a conversation</Text>
          <Text style={styles.emptyText}>
            Ask me anything about your data, digital behavior, or request insights
          </Text>
          
          <View style={styles.suggestions}>
            <TouchableOpacity
              style={styles.suggestionChip}
              onPress={() => setInputText("What insights can you provide?")}
            >
              <Text style={styles.suggestionText}>What insights can you provide?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.suggestionChip}
              onPress={() => setInputText("How do I upload my data?")}
            >
              <Text style={styles.suggestionText}>How do I upload my data?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.suggestionChip}
              onPress={() => setInputText("Tell me about my digital behavior")}
            >
              <Text style={styles.suggestionText}>Tell me about my digital behavior</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };
  
  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CHAT</Text>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          ListEmptyComponent={renderChatEmpty}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingContent}>
              <Text style={styles.typingText}>Voa is typing</Text>
              <ActivityIndicator size="small" color={theme.colors.accent.primary} />
            </View>
          </View>
        )}
        
        <BlurView intensity={30} tint="dark" style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim()
                    ? theme.colors.background.primary
                    : 'rgba(255, 255, 255, 0.5)'
                }
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fonts.primary.medium,
    textTransform: 'uppercase',
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  suggestions: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  suggestionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(168, 148, 255, 0.15)',
    borderRadius: 20,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 148, 255, 0.3)',
  },
  suggestionText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.primary,
  },
  typingContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.sm,
  },
  typingText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.xs : 0,
  },
  textInput: {
    flex: 1,
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(168, 148, 255, 0.3)',
  },
});

export default ChatScreen;