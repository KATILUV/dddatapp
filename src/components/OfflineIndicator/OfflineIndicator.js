/**
 * Offline Indicator Component
 * Displays a banner when the app is offline
 */
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../../contexts/OfflineContext';
import theme from '../../theme';

const OfflineIndicator = () => {
  const { isOnline, pendingActions, lastSyncTime } = useOffline();
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animate on network status change
  useEffect(() => {
    if (!isOnline) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
      
      // Start pulse animation
      startPulseAnimation();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
      
      // Stop pulse animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isOnline]);
  
  // Pulse animation for the icon
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  // Translation based on animation value
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });
  
  // Don't render if online
  if (isOnline) return null;
  
  // Format last sync time
  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const syncTime = new Date(lastSyncTime);
    const diffMs = now - syncTime;
    
    // Convert to minutes, hours, days
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons 
            name="cloud-offline" 
            size={20} 
            color={theme.colors.text.primary} 
          />
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>You're offline</Text>
          <Text style={styles.subtitle}>
            {pendingActions > 0 
              ? `${pendingActions} action${pendingActions > 1 ? 's' : ''} pending • Last sync: ${getLastSyncText()}`
              : `Data synced ${getLastSyncText()}`
            }
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: theme.colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  subtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
});

export default OfflineIndicator;