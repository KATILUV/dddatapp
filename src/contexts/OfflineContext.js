/**
 * Offline context provider for managing offline state and data synchronization
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  initNetworkManager, 
  subscribeToNetworkChanges, 
  syncOfflineActions,
  getConnectionInfo,
  needsDataRefresh
} from '../services/networkManager';
import {
  cacheInsights,
  getCachedInsights,
  cacheDataSources,
  getCachedDataSources,
  cacheUserPreferences,
  getCachedUserPreferences,
  queueOfflineAction,
  clearCache,
  getPendingOfflineActions
} from '../services/offlineStorage';

// Create context
const OfflineContext = createContext({
  isOnline: true,
  isLoading: false,
  isSyncing: false,
  connectionType: 'unknown',
  pendingActions: 0,
  lastSyncTime: null,
  
  // Methods
  syncNow: async () => {},
  fetchWithOfflineSupport: async () => {},
  performOfflineAction: async () => {},
  clearOfflineCache: async () => {}
});

/**
 * Offline context provider component
 */
export function OfflineProvider({ children }) {
  // State
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');
  const [pendingActions, setPendingActions] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Initialize network manager
  useEffect(() => {
    const unsubscribe = initNetworkManager();
    
    const networkSubscription = subscribeToNetworkChanges((connected) => {
      setIsOnline(connected);
      
      // Update connection info
      const connectionInfo = getConnectionInfo();
      setConnectionType(connectionInfo.connectionType);
      
      if (connected) {
        // Auto-sync when coming back online
        syncOfflineData();
      }
    });
    
    // Initial data
    setupInitialData();
    
    // Cleanup
    return () => {
      unsubscribe();
      networkSubscription();
    };
  }, []);
  
  /**
   * Setup initial data loading
   */
  const setupInitialData = async () => {
    setIsLoading(true);
    
    try {
      // Check if we need to refresh data from server
      const shouldRefresh = await needsDataRefresh();
      
      // Load cached data first
      const insights = await getCachedInsights();
      const dataSources = await getCachedDataSources();
      const preferences = await getCachedUserPreferences();
      
      // Set last sync time
      const connectionInfo = getConnectionInfo();
      setIsOnline(connectionInfo.isConnected);
      setConnectionType(connectionInfo.connectionType);
      
      // If online and refresh needed, sync data
      if (connectionInfo.isConnected && shouldRefresh) {
        await syncOfflineData();
      }
    } catch (error) {
      console.error('Failed to setup offline mode:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Sync offline data with server
   */
  const syncOfflineData = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Sync pending actions first
      const syncResult = await syncOfflineActions();
      
      // Only proceed if we're still online
      if (isOnline) {
        // Fetch fresh data
        await fetchAndCacheInsights();
        await fetchAndCacheDataSources();
        await fetchAndCacheUserPreferences();
        
        // Update last sync time
        setLastSyncTime(new Date());
      }
      
      // Update pending actions count
      updatePendingActionsCount();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  /**
   * Fetch and cache insights
   */
  const fetchAndCacheInsights = async () => {
    try {
      const response = await fetch('/api/insights');
      if (response.ok) {
        const insights = await response.json();
        await cacheInsights(insights);
        return insights;
      }
    } catch (error) {
      console.error('Failed to fetch and cache insights:', error);
    }
    return null;
  };
  
  /**
   * Fetch and cache data sources
   */
  const fetchAndCacheDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources');
      if (response.ok) {
        const dataSources = await response.json();
        await cacheDataSources(dataSources);
        return dataSources;
      }
    } catch (error) {
      console.error('Failed to fetch and cache data sources:', error);
    }
    return null;
  };
  
  /**
   * Fetch and cache user preferences
   */
  const fetchAndCacheUserPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const preferences = await response.json();
        await cacheUserPreferences(preferences);
        return preferences;
      }
    } catch (error) {
      console.error('Failed to fetch and cache user preferences:', error);
    }
    return null;
  };
  
  /**
   * Update the count of pending actions
   */
  const updatePendingActionsCount = async () => {
    try {
      const pendingActions = await getPendingOfflineActions();
      setPendingActions(pendingActions.length);
    } catch (error) {
      console.error('Failed to update pending actions count:', error);
    }
  };
  
  /**
   * Fetch data with offline support
   * @param {string} url API URL to fetch from
   * @param {Object} options Fetch options
   * @param {string} cacheType Type of data ('insights', 'dataSources', 'preferences')
   */
  const fetchWithOfflineSupport = async (url, options = {}, cacheType) => {
    // Try online fetch first
    if (isOnline) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          const data = await response.json();
          
          // Cache based on type
          switch(cacheType) {
            case 'insights':
              await cacheInsights(data);
              break;
            case 'dataSources':
              await cacheDataSources(data);
              break;
            case 'preferences':
              await cacheUserPreferences(data);
              break;
          }
          
          return { data, source: 'network' };
        }
      } catch (error) {
        console.warn('Network fetch failed, falling back to cache:', error);
        // Fall through to cached data
      }
    }
    
    // Fallback to cached data
    try {
      let cachedData = null;
      
      switch(cacheType) {
        case 'insights':
          cachedData = await getCachedInsights();
          break;
        case 'dataSources':
          cachedData = await getCachedDataSources();
          break;
        case 'preferences':
          cachedData = await getCachedUserPreferences();
          break;
      }
      
      return { data: cachedData, source: 'cache' };
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      throw new Error('Unable to fetch data - offline and no cache available');
    }
  };
  
  /**
   * Perform an action with offline support
   * @param {string} action Action type ('add', 'update', 'delete', etc.)
   * @param {string} resourceType Resource type ('insight', 'dataSource', 'preference')
   * @param {Object} data Data for the action
   */
  const performOfflineAction = async (action, resourceType, data) => {
    // If online, try to perform the action immediately
    if (isOnline) {
      try {
        // Call the appropriate API based on action and resource type
        let success = false;
        
        switch (resourceType) {
          case 'insight':
            success = await performInsightAction(action, data);
            break;
          case 'dataSource':
            success = await performDataSourceAction(action, data);
            break;
          case 'preference':
            success = await performPreferenceAction(action, data);
            break;
        }
        
        if (success) {
          // Refresh cached data
          await syncOfflineData();
          return { success: true, offline: false };
        }
      } catch (error) {
        console.warn('Online action failed, queuing for later:', error);
        // Fall through to offline queue
      }
    }
    
    // Queue for offline sync
    try {
      const success = await queueOfflineAction(action, resourceType, data);
      if (success) {
        await updatePendingActionsCount();
        return { success: true, offline: true };
      }
      return { success: false, offline: true };
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      return { success: false, offline: true };
    }
  };
  
  /**
   * Perform insight-related action
   */
  const performInsightAction = async (action, data) => {
    try {
      let response;
      
      switch (action) {
        case 'add':
          response = await fetch('/api/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          break;
        case 'update':
          response = await fetch(`/api/insights/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          break;
        case 'delete':
          response = await fetch(`/api/insights/${data.id}`, {
            method: 'DELETE'
          });
          break;
        case 'star':
          response = await fetch(`/api/insights/${data.id}/star`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ starred: data.starred })
          });
          break;
        case 'archive':
          response = await fetch(`/api/insights/${data.id}/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archived: data.archived })
          });
          break;
      }
      
      return response && response.ok;
    } catch (error) {
      console.error('Failed to perform insight action:', error);
      return false;
    }
  };
  
  /**
   * Perform data source-related action
   */
  const performDataSourceAction = async (action, data) => {
    try {
      let response;
      
      switch (action) {
        case 'add':
          response = await fetch('/api/data-sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          break;
        case 'update':
          response = await fetch(`/api/data-sources/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          break;
        case 'delete':
          response = await fetch(`/api/data-sources/${data.id}`, {
            method: 'DELETE'
          });
          break;
        case 'refresh':
          response = await fetch(`/api/data-sources/${data.id}/refresh`, {
            method: 'POST'
          });
          break;
        case 'schedule':
          response = await fetch(`/api/data-sources/${data.id}/schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frequency: data.frequency })
          });
          break;
      }
      
      return response && response.ok;
    } catch (error) {
      console.error('Failed to perform data source action:', error);
      return false;
    }
  };
  
  /**
   * Perform preference-related action
   */
  const performPreferenceAction = async (action, data) => {
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return response && response.ok;
    } catch (error) {
      console.error('Failed to perform preference action:', error);
      return false;
    }
  };
  
  /**
   * Clear the offline cache
   */
  const clearOfflineCache = async () => {
    try {
      const success = await clearCache();
      if (success) {
        // Reload data from server if online
        if (isOnline) {
          await syncOfflineData();
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to clear offline cache:', error);
      return false;
    }
  };
  
  // Context value
  const contextValue = {
    isOnline,
    isLoading,
    isSyncing,
    connectionType,
    pendingActions,
    lastSyncTime,
    
    // Methods
    syncNow: syncOfflineData,
    fetchWithOfflineSupport,
    performOfflineAction,
    clearOfflineCache
  };
  
  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

/**
 * Custom hook for using the offline context
 */
export function useOffline() {
  return useContext(OfflineContext);
}