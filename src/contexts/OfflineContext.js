/**
 * Offline Context
 * Provides offline status and functionality throughout the app
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import {
  initNetworkMonitoring,
  checkNetworkStatus,
  getPendingActionsCount,
  syncOfflineActions,
  getLastSyncTime,
  clearPendingActions
} from '../services/networkManager';

import {
  saveUserData,
  getUserData,
  saveUserPreferences,
  getUserPreferences,
  saveDataSources,
  getDataSources,
  saveInsights,
  getInsights,
  cacheFile,
  getCachedFile,
  clearCache,
  clearOfflineData
} from '../services/offlineStorage';

// Create context
const OfflineContext = createContext(null);

/**
 * OfflineProvider component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const OfflineProvider = ({ children }) => {
  // State
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Initialize network monitoring
  useEffect(() => {
    // Initial network check
    const checkNetwork = async () => {
      const online = await checkNetworkStatus();
      setIsOnline(online);
    };
    
    // Get stored offline data
    const loadOfflineData = async () => {
      const pending = await getPendingActionsCount();
      setPendingActions(pending);
      
      const lastSync = await getLastSyncTime();
      setLastSyncTime(lastSync);
    };
    
    // Initialize
    checkNetwork();
    loadOfflineData();
    
    // Subscribe to network changes
    const unsubscribe = initNetworkMonitoring(async (online) => {
      console.log('Network status changed:', online ? 'online' : 'offline');
      
      // Don't trigger sync if we're just switching to offline
      const wasOffline = !isOnline;
      
      setIsOnline(online);
      
      // If we're coming back online, sync
      if (online && wasOffline && pendingActions > 0) {
        syncNow();
      }
    });
    
    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Update pending actions count when it changes
  useEffect(() => {
    // Skip this on initial render when online status hasn't been determined
    if (pendingActions > 0 && isOnline) {
      // Alert user that we have pending actions
      console.log(`${pendingActions} actions pending, waiting to sync`);
    }
  }, [pendingActions, isOnline]);
  
  /**
   * Sync data now
   * @returns {Promise<boolean>} - Whether sync was successful
   */
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      console.warn('Cannot sync while offline');
      return false;
    }
    
    if (isSyncing) {
      console.warn('Sync already in progress');
      return false;
    }
    
    try {
      setIsSyncing(true);
      
      // Sync pending actions
      const result = await syncOfflineActions();
      
      if (result.success) {
        // Update state
        setPendingActions(result.remaining || 0);
        setLastSyncTime(Date.now());
        
        console.log('Sync completed:', result.message);
      } else {
        console.error('Sync failed:', result.message);
      }
      
      return result.success;
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);
  
  /**
   * Clear offline cache
   * @returns {Promise<boolean>} - Whether clearing was successful
   */
  const clearOfflineCache = useCallback(async () => {
    try {
      return await clearCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }, []);
  
  /**
   * Clear all offline data and cache
   * @returns {Promise<boolean>} - Whether clearing was successful
   */
  const resetOfflineData = useCallback(async () => {
    try {
      // Clear pending actions
      await clearPendingActions();
      setPendingActions(0);
      
      // Clear all cached data
      return await clearOfflineData();
    } catch (error) {
      console.error('Failed to reset offline data:', error);
      return false;
    }
  }, []);
  
  // The context value
  const contextValue = {
    // Status
    isOnline,
    pendingActions,
    lastSyncTime,
    isSyncing,
    
    // Sync functions
    syncNow,
    
    // Cache management
    clearOfflineCache,
    resetOfflineData,
    
    // Storage functions
    saveUserData,
    getUserData,
    saveUserPreferences,
    getUserPreferences,
    saveDataSources,
    getDataSources,
    saveInsights,
    getInsights,
    cacheFile,
    getCachedFile,
  };
  
  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

/**
 * Custom hook to use offline context
 * @returns {Object} - Offline context
 */
export const useOffline = () => {
  const context = useContext(OfflineContext);
  
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  
  return context;
};