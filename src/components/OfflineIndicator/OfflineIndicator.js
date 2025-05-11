/**
 * Offline status indicator component
 * Shows a banner when the app is offline and provides sync controls
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../../contexts/OfflineContext';

const OfflineIndicator = () => {
  const {
    isOnline,
    isSyncing,
    pendingActions,
    connectionType,
    syncNow
  } = useOffline();
  
  // Animation for showing/hiding the indicator
  const [animation] = useState(new Animated.Value(0));
  const [showFullDetails, setShowFullDetails] = useState(false);
  
  // Animate when connection status changes
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [isOnline]);
  
  // Handle manual sync
  const handleSync = () => {
    if (!isSyncing) {
      syncNow();
    }
  };
  
  // Toggle details visibility
  const toggleDetails = () => {
    setShowFullDetails(!showFullDetails);
  };
  
  // Only render if offline or syncing
  if (isOnline && !pendingActions && !isSyncing) {
    return null;
  }
  
  // Label and icon for connection type
  const getConnectionInfo = () => {
    if (!isOnline) {
      return {
        label: 'Offline',
        icon: 'cloud-offline-outline'
      };
    }
    
    if (isSyncing) {
      return {
        label: 'Syncing...',
        icon: 'sync-outline'
      };
    }
    
    if (pendingActions > 0) {
      return {
        label: `${pendingActions} pending action${pendingActions > 1 ? 's' : ''}`,
        icon: 'time-outline'
      };
    }
    
    return {
      label: 'Connected',
      icon: 'cloud-done-outline'
    };
  };
  
  const connectionInfo = getConnectionInfo();
  
  // Animation styles
  const containerStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-60, 0]
        })
      }
    ]
  };
  
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={90} style={styles.blurContainer}>
        <TouchableOpacity
          style={styles.contentContainer}
          onPress={toggleDetails}
          activeOpacity={0.7}
        >
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={connectionInfo.icon}
                size={18}
                color={isOnline ? '#2ecc71' : '#e74c3c'}
              />
            </View>
            <Text style={styles.statusText}>{connectionInfo.label}</Text>
          </View>
          
          {pendingActions > 0 && !isSyncing && isOnline && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleSync}
              disabled={isSyncing}
            >
              <Text style={styles.syncText}>Sync</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        {showFullDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>
              Connection: {connectionType}
            </Text>
            {pendingActions > 0 && (
              <Text style={styles.detailsText}>
                {pendingActions} action{pendingActions > 1 ? 's' : ''} waiting to sync
              </Text>
            )}
            <Text style={styles.detailsText}>
              {isOnline 
                ? 'Your data will sync automatically'
                : 'Changes will sync when you reconnect'
              }
            </Text>
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999
  },
  blurContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  syncButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6
  },
  syncText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  detailsContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  detailsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 6
  }
});

export default OfflineIndicator;