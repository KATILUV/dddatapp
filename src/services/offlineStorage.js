/**
 * Offline storage service for the Solstice app
 * Handles caching of insights, data sources, and user preferences for offline access
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Cache keys
const CACHE_KEYS = {
  INSIGHTS: 'solstice_cached_insights',
  DATA_SOURCES: 'solstice_cached_data_sources',
  USER_PREFERENCES: 'solstice_cached_user_preferences',
  LAST_SYNC: 'solstice_last_sync_timestamp',
  SYNC_QUEUE: 'solstice_sync_queue'
};

// Max cache age in milliseconds (default: 7 days)
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Save insights to offline storage
 * @param {Array} insights - Array of insight objects to cache
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheInsights(insights) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.INSIGHTS, JSON.stringify(insights));
    await updateLastSyncTimestamp();
    return true;
  } catch (error) {
    console.error('Failed to cache insights:', error);
    return false;
  }
}

/**
 * Retrieve cached insights from offline storage
 * @returns {Promise<Array>} - Array of cached insight objects
 */
export async function getCachedInsights() {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.INSIGHTS);
    return cachedData ? JSON.parse(cachedData) : [];
  } catch (error) {
    console.error('Failed to retrieve cached insights:', error);
    return [];
  }
}

/**
 * Save data sources to offline storage
 * @param {Array} dataSources - Array of data source objects to cache
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheDataSources(dataSources) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.DATA_SOURCES, JSON.stringify(dataSources));
    await updateLastSyncTimestamp();
    return true;
  } catch (error) {
    console.error('Failed to cache data sources:', error);
    return false;
  }
}

/**
 * Retrieve cached data sources from offline storage
 * @returns {Promise<Array>} - Array of cached data source objects
 */
export async function getCachedDataSources() {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.DATA_SOURCES);
    return cachedData ? JSON.parse(cachedData) : [];
  } catch (error) {
    console.error('Failed to retrieve cached data sources:', error);
    return [];
  }
}

/**
 * Save user preferences to offline storage
 * @param {Object} preferences - User preferences object to cache
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheUserPreferences(preferences) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to cache user preferences:', error);
    return false;
  }
}

/**
 * Retrieve cached user preferences from offline storage
 * @returns {Promise<Object|null>} - Cached user preferences object
 */
export async function getCachedUserPreferences() {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.USER_PREFERENCES);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Failed to retrieve cached user preferences:', error);
    return null;
  }
}

/**
 * Update the last sync timestamp
 * @returns {Promise<void>}
 */
export async function updateLastSyncTimestamp() {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, JSON.stringify(Date.now()));
  } catch (error) {
    console.error('Failed to update last sync timestamp:', error);
  }
}

/**
 * Check if the cache is stale (older than MAX_CACHE_AGE)
 * @returns {Promise<boolean>} - True if cache is stale
 */
export async function isCacheStale() {
  try {
    const lastSyncString = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    if (!lastSyncString) return true;
    
    const lastSync = JSON.parse(lastSyncString);
    const now = Date.now();
    
    return (now - lastSync) > MAX_CACHE_AGE;
  } catch (error) {
    console.error('Failed to check cache staleness:', error);
    return true;
  }
}

/**
 * Calculate the total cache size
 * @returns {Promise<number>} - Size in bytes
 */
export async function getCacheSize() {
  try {
    let totalSize = 0;
    const keys = Object.values(CACHE_KEYS);
    
    for (const key of keys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        totalSize += data.length * 2; // Approximate size in bytes (UTF-16 characters)
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

/**
 * Clear all cached data
 * @returns {Promise<boolean>} - Success status
 */
export async function clearCache() {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

/**
 * Queue an action to be performed when back online
 * @param {string} action - Action type ('add', 'update', 'delete')
 * @param {string} resourceType - Resource type ('insight', 'dataSource', 'preference')
 * @param {Object} data - Data to be synced
 * @returns {Promise<boolean>} - Success status
 */
export async function queueOfflineAction(action, resourceType, data) {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
    const queue = queueString ? JSON.parse(queueString) : [];
    
    // Add new action to queue
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      action,
      resourceType,
      data,
      timestamp: Date.now()
    });
    
    // Save updated queue
    await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Failed to queue offline action:', error);
    return false;
  }
}

/**
 * Get all pending offline actions
 * @returns {Promise<Array>} - Array of queued actions
 */
export async function getPendingOfflineActions() {
  try {
    const queueString = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
    return queueString ? JSON.parse(queueString) : [];
  } catch (error) {
    console.error('Failed to retrieve offline action queue:', error);
    return [];
  }
}

/**
 * Remove an action from the sync queue
 * @param {string} actionId - ID of the action to remove
 * @returns {Promise<boolean>} - Success status
 */
export async function removeFromSyncQueue(actionId) {
  try {
    const queueString = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
    if (!queueString) return true;
    
    const queue = JSON.parse(queueString);
    const updatedQueue = queue.filter(action => action.id !== actionId);
    
    await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
    return true;
  } catch (error) {
    console.error('Failed to remove action from sync queue:', error);
    return false;
  }
}

/**
 * Cache a file for offline access (images, etc.)
 * @param {string} uri - Remote URI of the file
 * @param {string} filename - Name to save the file as
 * @returns {Promise<string|null>} - Local URI of the cached file
 */
export async function cacheFile(uri, filename) {
  // Skip if not on a device or web
  if (Platform.OS === 'web') {
    return uri;
  }
  
  try {
    const cacheDir = `${FileSystem.cacheDirectory}solstice/`;
    const fileUri = `${cacheDir}${filename}`;
    
    // Create cache directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }
    
    // Download and cache the file
    const downloadResult = await FileSystem.downloadAsync(uri, fileUri);
    
    if (downloadResult.status === 200) {
      return fileUri;
    }
    return null;
  } catch (error) {
    console.error('Failed to cache file:', error);
    return null;
  }
}