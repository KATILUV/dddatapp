import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList, 
  TouchableOpacity,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import MessageBubble from '../components/MessageBubble';
import AnimatedOrb from '../components/AnimatedOrb';
import { storeMessages, loadMessages } from '../utils/storage';
import { fadeInUp } from '../utils/animations';
import theme from '../theme';

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({ name: 'Voa' });
  
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  // Animation values
  const inputContainerHeight = useSharedValue(60);
  const orbScale = useSharedValue(0);
  const orbOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Load user data and previous messages
    const loadData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('onboardingData');
        if (userDataStr) {
          const data = JSON.parse(userDataStr);
          setUserData(data);
        }
        
        const savedMessages = await loadMessages();
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // Add welcome message if no previous messages
          const welcomeMessage = {
            id: Date.now().toString(),
            text: `Hello! I'm ${userData.name || 'Voa'}, your personal AI companion. How can I help you understand yourself better today?`,
            isUser: false,
            timestamp: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
          storeMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    orbScale.value = withDelay(300, withTiming(1, { duration: 800 }));
    orbOpacity.value = withDelay(300, withTiming(0.8, { duration: 800 }));
    
    return () => {
      // Save messages when leaving the screen
      if (messages.length > 0) {
        storeMessages(messages);
      }
    };
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    Keyboard.dismiss();
    
    // Show AI is typing indicator
    setIsTyping(true);
    
    // Simulate AI response (would connect to actual API in production)
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputText, userData.tone || 'neutral'),
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setIsTyping(false);
      setMessages([...updatedMessages, aiResponse]);
      storeMessages([...updatedMessages, aiResponse]);
    }, 1500);
  };
  
  // Animate input box height when typing
  const handleInputFocus = () => {
    inputContainerHeight.value = withTiming(80, { duration: 200 });
  };
  
  const handleInputBlur = () => {
    inputContainerHeight.value = withTiming(60, { duration: 200 });
  };
  
  // Helper to format timestamp for display
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Animated styles
  const orbContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: orbOpacity.value,
      transform: [{ scale: orbScale.value }],
    };
  });
  
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });
  
  const inputContainerStyle = useAnimatedStyle(() => {
    return {
      height: inputContainerHeight.value,
    };
  });
  
  // Empty state - if no messages yet
  if (messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
      </View>
    );
  }
  
  // Temporary AI response generator - would be replaced with actual API
  const generateAIResponse = (userInput, tone) => {
    const responses = {
      soft: [
        "I understand how you feel. Looking at your patterns, I notice you tend to express yourself more creatively in the evenings.",
        "That's a thoughtful question. When I look at your data, I see a gentle rhythm to how you process information.",
        "I'm here to support you. Your recent activities suggest you're exploring new perspectives, which is wonderful to see."
      ],
      honest: [
        "Looking directly at your data, I can see you've been inconsistent with your stated goals. Let's address that.",
        "Your question reveals an interesting pattern. You tend to overthink decisions on Tuesdays and Wednesdays.",
        "The data shows clear evidence that you perform better when you start early. No ambiguity there."
      ],
      poetic: [
        "Like stars forming constellations, your thoughts seem to cluster around themes of growth and transformation.",
        "The river of your words flows strongest at dawn and dusk, carrying deeper currents of meaning beneath.",
        "In the garden of your data, certain ideas bloom repeatedly - a pattern as beautiful as it is revealing."
      ],
      neutral: [
        "Based on the available information, there appears to be a correlation between your productivity and your morning routine.",
        "The data indicates several recurring patterns in how you approach problems and express ideas.",
        "When analyzing your recent activities, I notice consistent themes emerging around specific topics."
      ]
    };
    
    const selectedTone = responses[tone] || responses.neutral;
    return selectedTone[Math.floor(Math.random() * selectedTone.length)];
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Animated.View style={headerStyle}>
        <Header
          title={`Chat with ${userData.name || 'Voa'}`}
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
      </Animated.View>
      
      <Animated.View style={[styles.orbContainer, orbContainerStyle]}>
        <AnimatedOrb size={60} intensity={1} />
      </Animated.View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesContainer,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item.text}
            isUser={item.isUser}
            timestamp={formatMessageTime(item.timestamp)}
            animate={index === messages.length - 1}
          />
        )}
        ListFooterComponent={
          isTyping && (
            <MessageBubble
              isTyping={true}
              isUser={false}
            />
          )
        }
      />
      
      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask ${userData.name || 'Voa'} about your patterns...`}
            placeholderTextColor={theme.colors.text.muted}
            multiline
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Feather
              name="send"
              size={20}
              color={inputText.trim() ? theme.colors.text.primary : theme.colors.text.muted}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.xl,
  },
  orbContainer: {
    position: 'absolute',
    top: 70,
    left: '50%',
    marginLeft: -30,
    zIndex: 1,
    opacity: 0.8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 148, 255, 0.2)',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 11, 35, 0.7)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 25, 50, 0.4)',
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    paddingVertical: theme.spacing.m,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 148, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(168, 148, 255, 0.05)',
  },
});

export default ChatScreen;
