/**
 * Network Manager
 * Handles network connectivity detection and synchronization
 */
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing offline data
const PENDING_ACTIONS_KEY = 'solstice_pending_actions';
const LAST_SYNC_KEY = 'solstice_last_sync';

/**
 * Initialize network monitoring
 * @param {Function} onNetworkChange - Callback for network status changes
 * @returns {Function} - Function to unsubscribe from network events
 */
export function initNetworkMonitoring(onNetworkChange) {
  // Subscribe to network changes
  const unsubscribe = NetInfo.addEventListener(state => {
    onNetworkChange(state.isConnected);
  });
  
  return unsubscribe;
}

/**
 * Check current network status
 * @returns {Promise<boolean>} - Whether device is connected
 */
export async function checkNetworkStatus() {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
}

/**
 * Add action to pending queue
 * @param {Object} action - The action to queue
 * @returns {Promise<number>} - Number of pending actions
 */
export async function queueOfflineAction(action) {
  try {
    // Get existing pending actions
    const actionsString = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    const actions = actionsString ? JSON.parse(actionsString) : [];
    
    // Add new action with timestamp
    const actionWithTimestamp = {
      ...action,
      timestamp: Date.now(),
      id: Date.now() + Math.random().toString(36).substring(2, 9)
    };
    
    actions.push(actionWithTimestamp);
    
    // Save updated queue
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
    
    return actions.length;
  } catch (error) {
    console.error('Failed to queue offline action:', error);
    return 0;
  }
}

/**
 * Get number of pending actions
 * @returns {Promise<number>} - Number of pending actions
 */
export async function getPendingActionsCount() {
  try {
    const actionsString = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    if (!actionsString) return 0;
    
    const actions = JSON.parse(actionsString);
    return actions.length;
  } catch (error) {
    console.error('Failed to get pending actions count:', error);
    return 0;
  }
}

/**
 * Get all pending actions
 * @returns {Promise<Array>} - Array of pending actions
 */
export async function getPendingActions() {
  try {
    const actionsString = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    if (!actionsString) return [];
    
    return JSON.parse(actionsString);
  } catch (error) {
    console.error('Failed to get pending actions:', error);
    return [];
  }
}

/**
 * Process a specific pending action
 * @param {Object} action - The action to process
 * @returns {Promise<boolean>} - Whether action was processed successfully
 */
async function processAction(action) {
  try {
    // Process based on action type
    switch (action.type) {
      case 'UPDATE_USER_PREFERENCES':
        // Call API to update user preferences
        await fetch('/api/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'ADD_DATA_SOURCE':
        // Call API to add data source
        await fetch('/api/data-sources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'UPDATE_DATA_SOURCE':
        // Call API to update data source
        await fetch(`/api/data-sources/${action.data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'DELETE_DATA_SOURCE':
        // Call API to delete data source
        await fetch(`/api/data-sources/${action.data.id}`, {
          method: 'DELETE',
        });
        break;
        
      case 'STAR_INSIGHT':
        // Call API to star/unstar insight
        await fetch(`/api/insights/${action.data.id}/star`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ starred: action.data.starred }),
        });
        break;
        
      case 'ARCHIVE_INSIGHT':
        // Call API to archive/unarchive insight
        await fetch(`/api/insights/${action.data.id}/archive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ archived: action.data.archived }),
        });
        break;
        
      case 'EXPORT_INSIGHT':
        // Call API to track insight export
        await fetch(`/api/insights/${action.data.id}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ destination: action.data.destination }),
        });
        break;
        
      default:
        console.warn('Unknown action type:', action.type);
        return true; // Skip unknown actions
    }
    
    return true;
  } catch (error) {
    console.error('Failed to process action:', error);
    return false;
  }
}

/**
 * Synchronize all pending offline actions
 * @returns {Promise<Object>} - Sync results
 */
export async function syncOfflineActions() {
  try {
    // Check network status
    const isConnected = await checkNetworkStatus();
    if (!isConnected) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: 'No network connection'
      };
    }
    
    // Get pending actions
    const actions = await getPendingActions();
    if (actions.length === 0) {
      // Update last sync time even if no actions
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      
      return {
        success: true,
        synced: 0,
        failed: 0,
        message: 'No pending actions'
      };
    }
    
    // Process each action
    let synced = 0;
    let failed = 0;
    const remainingActions = [];
    
    for (const action of actions) {
      const success = await processAction(action);
      
      if (success) {
        synced++;
      } else {
        failed++;
        remainingActions.push(action);
      }
    }
    
    // Update pending actions with remaining ones
    await AsyncStorage.setItem(
      PENDING_ACTIONS_KEY, 
      JSON.stringify(remainingActions)
    );
    
    // Update last sync time
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    
    return {
      success: true,
      synced,
      failed,
      remaining: remainingActions.length,
      message: `Synced ${synced} actions, ${failed} failed`
    };
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
    
    return {
      success: false,
      synced: 0,
      failed: 0,
      message: error.message
    };
  }
}

/**
 * Get the timestamp of the last sync
 * @returns {Promise<number|null>} - Timestamp of last sync or null
 */
export async function getLastSyncTime() {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Failed to get last sync time:', error);
    return null;
  }
}

/**
 * Clear all pending actions
 * @returns {Promise<boolean>} - Whether clearing was successful
 */
export async function clearPendingActions() {
  try {
    await AsyncStorage.removeItem(PENDING_ACTIONS_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear pending actions:', error);
    return false;
  }
}