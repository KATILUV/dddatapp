/**
 * Chat Screen
 * Screen for interacting with the AI assistant
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GradientBackground from '../components/GradientBackground';
import ChatInterface from '../components/Chat/ChatInterface';
import GlassmorphicCard from '../components/GlassmorphicCard';
import dataSourceManager from '../services/dataSources/dataSourceManager';
import chatService from '../services/chatService';
import { useAuth } from '../hooks/useAuth';

// Storage key for chat history
const CHAT_HISTORY_KEY = 'solstice_chat_history';

/**
 * ChatScreen component
 * @returns {React.ReactElement} - Rendered component
 */
export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [connectedSources, setConnectedSources] = useState([]);
  
  // Load chat history and data sources on mount
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        setIsLoading(true);
        
        // Initialize data source manager
        await dataSourceManager.initialize();
        setConnectedSources(dataSourceManager.getConnectedSources());
        
        // Load chat history from storage
        const history = await loadChatHistory();
        if (history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error('Error initializing chat screen:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeScreen();
    
    // Check if we should show tips (first time user)
    const checkShowTips = async () => {
      try {
        const tipsShown = await AsyncStorage.getItem('solstice_tips_shown');
        if (!tipsShown) {
          setShowTips(true);
          await AsyncStorage.setItem('solstice_tips_shown', 'true');
        }
      } catch (error) {
        console.error('Error checking tips status:', error);
      }
    };
    
    checkShowTips();
  }, []);
  
  // Load chat history from storage
  const loadChatHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (historyJson) {
        return JSON.parse(historyJson);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  };
  
  // Save chat history to storage
  const saveChatHistory = async (updatedMessages) => {
    try {
      // Only keep the last 50 messages to avoid storage limits
      const messagesToSave = updatedMessages.slice(-50);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };
  
  // Handle new message from the chat interface
  const handleNewMessage = (message) => {
    setMessages(prev => {
      const updated = [...prev, message];
      saveChatHistory(updated);
      return updated;
    });
  };
  
  // Handle errors from the chat interface
  const handleError = (error) => {
    console.error('Chat error:', error);
    
    // If error is due to no data sources, prompt to add them
    if (connectedSources.length === 0) {
      Alert.alert(
        'No Data Sources Connected',
        'For personalized insights, connect data sources in the Data Sources tab.',
        [
          { text: 'Later' },
          { 
            text: 'Connect Now', 
            onPress: () => navigation.navigate('DataConnection') 
          }
        ]
      );
    }
  };
  
  // Clear chat history
  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear your conversation history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
              chatService.clearCache(); // Clear data cache too
              setMessages([]);
            } catch (error) {
              console.error('Error clearing chat history:', error);
            }
          }
        }
      ]
    );
  };
  
  // Render chat tips for first-time users
  const renderTipsModal = () => (
    <Modal
      visible={showTips}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTips(false)}
    >
      <View style={styles.modalContainer}>
        <GlassmorphicCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsTitle}>Chat with SOLSTICE</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTips(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.tipsContent}>
            <Text style={styles.tipsSectionTitle}>What can you ask?</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="analytics-outline" size={20} color="#A388FF" />
              <Text style={styles.tipText}>
                "What patterns do you notice in my sleep data?"
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="calendar-outline" size={20} color="#A388FF" />
              <Text style={styles.tipText}>
                "How has my productivity changed this month?"
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="musical-notes-outline" size={20} color="#A388FF" />
              <Text style={styles.tipText}>
                "What are my most listened to artists this week?"
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="fitness-outline" size={20} color="#A388FF" />
              <Text style={styles.tipText}>
                "How does my exercise affect my mood?"
              </Text>
            </View>
            
            <Text style={styles.tipsSectionTitle}>Pro Tips</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="link-outline" size={20} color="#A388FF" />
              <Text style={styles.tipText}>
                Connect more data sources for more personalized insights
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="information-circle-outline" size={20} color="#A388FF" />
              <Text style={styles.tipText}>
                Tap the "Using data from..." text to see which sources were used
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowTips(false)}
          >
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>
        </GlassmorphicCard>
      </View>
    </Modal>
  );
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Chat</Text>
            <Text style={styles.subtitle}>
              Ask questions about your data
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearChat}
          >
            <Ionicons name="trash-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
        
        {/* Chat interface */}
        <View style={styles.chatContainer}>
          <ChatInterface
            initialMessages={messages}
            onNewMessage={handleNewMessage}
            onError={handleError}
          />
        </View>
        
        {/* Tips modal for first-time users */}
        {renderTipsModal()}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  tipsCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
  },
  tipsHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  tipsContent: {
    padding: 20,
  },
  tipsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 10,
  },
  tipText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#7B61FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});