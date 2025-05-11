/**
 * Network manager service for handling online/offline status and connectivity changes
 */
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { 
  getPendingOfflineActions, 
  removeFromSyncQueue,
  isCacheStale,
  updateLastSyncTimestamp
} from './offlineStorage';
import { Alert } from 'react-native';

// Subscribers to network state changes
const subscribers = [];

// Current network state
let isConnected = true;
let connectionType = 'unknown';
let isConnectionExpensive = false;

/**
 * Initialize the network manager
 */
export function initNetworkManager() {
  // Subscribe to network info updates
  const unsubscribe = NetInfo.addEventListener(state => {
    const wasConnected = isConnected;
    isConnected = state.isConnected;
    connectionType = state.type;
    isConnectionExpensive = state.details?.isConnectionExpensive || false;
    
    // Notify subscribers of change
    if (wasConnected !== isConnected) {
      notifySubscribers(isConnected);
      
      // Try to sync when connection is restored
      if (isConnected && !wasConnected) {
        syncOfflineActions();
      }
    }
  });
  
  // Initial network check
  checkNetworkStatus();
  
  return unsubscribe;
}

/**
 * Check current network status
 * @returns {Promise<Object>} Current network state
 */
export async function checkNetworkStatus() {
  try {
    const state = await NetInfo.fetch();
    isConnected = state.isConnected;
    connectionType = state.type;
    isConnectionExpensive = state.details?.isConnectionExpensive || false;
    return { isConnected, connectionType, isConnectionExpensive };
  } catch (error) {
    console.error('Failed to check network status:', error);
    return { isConnected: false, connectionType: 'unknown', isConnectionExpensive: false };
  }
}

/**
 * Subscribe to network state changes
 * @param {Function} callback Function to call on network state change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNetworkChanges(callback) {
  subscribers.push(callback);
  
  // Call immediately with current state
  callback(isConnected);
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
}

/**
 * Notify all subscribers of network state change
 * @param {boolean} connected Current connection state
 */
function notifySubscribers(connected) {
  subscribers.forEach(callback => {
    try {
      callback(connected);
    } catch (error) {
      console.error('Error in network change subscriber:', error);
    }
  });
}

/**
 * Attempt to sync pending offline actions
 * @returns {Promise<{success: boolean, synced: number, failed: number}>}
 */
export async function syncOfflineActions() {
  // Skip if not connected
  if (!isConnected) {
    return { success: false, synced: 0, failed: 0 };
  }
  
  try {
    const pendingActions = await getPendingOfflineActions();
    if (pendingActions.length === 0) {
      return { success: true, synced: 0, failed: 0 };
    }
    
    let synced = 0;
    let failed = 0;
    
    // Process each pending action
    for (const action of pendingActions) {
      try {
        let success = false;
        
        // Handle different resource types and actions
        switch (action.resourceType) {
          case 'insight':
            success = await syncInsightAction(action);
            break;
          case 'dataSource':
            success = await syncDataSourceAction(action);
            break;
          case 'preference':
            success = await syncPreferenceAction(action);
            break;
          default:
            console.warn(`Unknown resource type: ${action.resourceType}`);
            success = false;
        }
        
        // Remove from queue if successful
        if (success) {
          await removeFromSyncQueue(action.id);
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Error syncing action:', error, action);
        failed++;
      }
    }
    
    // Show notification if actions were synced
    if (synced > 0 && Platform.OS !== 'web') {
      Alert.alert(
        'Sync Complete',
        `${synced} changes synchronized with the server.`,
        [{ text: 'OK' }]
      );
    }
    
    // Update sync timestamp
    await updateLastSyncTimestamp();
    
    return { success: true, synced, failed };
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
    return { success: false, synced: 0, failed: 0 };
  }
}

/**
 * Sync insight-related action
 * @param {Object} action Action to sync
 * @returns {Promise<boolean>} Success status
 */
async function syncInsightAction(action) {
  const { action: actionType, data } = action;
  
  try {
    let response;
    
    switch (actionType) {
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
      default:
        console.warn(`Unknown action type for insight: ${actionType}`);
        return false;
    }
    
    return response && response.ok;
  } catch (error) {
    console.error('Failed to sync insight action:', error);
    return false;
  }
}

/**
 * Sync data source-related action
 * @param {Object} action Action to sync
 * @returns {Promise<boolean>} Success status
 */
async function syncDataSourceAction(action) {
  const { action: actionType, data } = action;
  
  try {
    let response;
    
    switch (actionType) {
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
      default:
        console.warn(`Unknown action type for data source: ${actionType}`);
        return false;
    }
    
    return response && response.ok;
  } catch (error) {
    console.error('Failed to sync data source action:', error);
    return false;
  }
}

/**
 * Sync preference-related action
 * @param {Object} action Action to sync
 * @returns {Promise<boolean>} Success status
 */
async function syncPreferenceAction(action) {
  const { data } = action;
  
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return response && response.ok;
  } catch (error) {
    console.error('Failed to sync preference action:', error);
    return false;
  }
}

/**
 * Check if the app has fresh data or needs to refresh
 * @returns {Promise<boolean>} True if data needs refresh
 */
export async function needsDataRefresh() {
  if (!isConnected) {
    return false; // Can't refresh if offline
  }
  
  return await isCacheStale();
}

/**
 * Get current connection details
 * @returns {Object} Connection details object
 */
export function getConnectionInfo() {
  return {
    isConnected,
    connectionType,
    isConnectionExpensive
  };
}