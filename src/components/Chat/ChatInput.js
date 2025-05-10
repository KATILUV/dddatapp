/**
 * Chat Input component for entering messages
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

/**
 * ChatInput component for entering and sending messages
 * @param {Object} props - Component props
 * @param {Function} props.onSend - Function called when message is sent
 * @param {boolean} props.isSending - Whether a message is currently being sent
 * @param {Function} props.onTyping - Function called when user is typing
 * @param {Object} props.style - Additional style for component
 * @returns {React.ReactElement} - Rendered component
 */
export default function ChatInput({
  onSend,
  isSending = false,
  onTyping,
  style,
}) {
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const inputRef = useRef(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  
  // Animated button press effect
  const animateButton = (active) => {
    Animated.spring(sendButtonScale, {
      toValue: active ? 0.9 : 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  // Focus the input when the component mounts
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  }, []);
  
  // Handle send button press
  const handleSendPress = () => {
    if (message.trim() && !isSending) {
      onSend(message.trim());
      setMessage('');
      setInputHeight(40); // Reset height
      
      // Dismiss keyboard on iOS
      if (Platform.OS === 'ios') {
        Keyboard.dismiss();
      }
    }
  };
  
  // Handle text input change
  const handleChangeText = (text) => {
    setMessage(text);
    if (onTyping) {
      onTyping(text);
    }
  };
  
  // Handle input content size change for autogrow
  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(40, height), 120); // Min 40, max 120
    setInputHeight(newHeight);
  };
  
  return (
    <BlurView intensity={30} style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[styles.input, { height: inputHeight }]}
          placeholder="Type a message..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={message}
          onChangeText={handleChangeText}
          multiline={true}
          maxLength={1000}
          onContentSizeChange={handleContentSizeChange}
          selectionColor="#A388FF"
        />
        
        {/* Send button */}
        <Animated.View
          style={[
            styles.sendButtonContainer,
            { transform: [{ scale: sendButtonScale }] }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSendPress}
            disabled={!message.trim() || isSending}
            onPressIn={() => animateButton(true)}
            onPressOut={() => animateButton(false)}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={message.trim() ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)"}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(10, 5, 30, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align to bottom for multiline
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 120,
  },
  sendButtonContainer: {
    marginLeft: 8,
    marginBottom: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#7B61FF',
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(123, 97, 255, 0.3)',
  },
});