/**
 * Offline Storage Service
 * Manages local data storage for offline mode
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Storage keys
const USER_DATA_KEY = 'solstice_user_data';
const USER_PREFS_KEY = 'solstice_user_preferences';
const DATA_SOURCES_KEY = 'solstice_data_sources';
const INSIGHTS_KEY = 'solstice_insights';
const CACHE_MANIFEST_KEY = 'solstice_cache_manifest';

// Cache directory
const CACHE_DIR = `${FileSystem.cacheDirectory}solstice_cache/`;

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  if (Platform.OS === 'web') return;
  
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

/**
 * Save user data to local storage
 * @param {Object} userData - User data to save
 * @returns {Promise<boolean>} - Whether operation was successful
 */
export async function saveUserData(userData) {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Failed to save user data:', error);
    return false;
  }
}

/**
 * Get user data from local storage
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserData() {
  try {
    const dataString = await AsyncStorage.getItem(USER_DATA_KEY);
    return dataString ? JSON.parse(dataString) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
}

/**
 * Save user preferences to local storage
 * @param {Object} preferences - User preferences to save
 * @returns {Promise<boolean>} - Whether operation was successful
 */
export async function saveUserPreferences(preferences) {
  try {
    await AsyncStorage.setItem(USER_PREFS_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    return false;
  }
}

/**
 * Get user preferences from local storage
 * @returns {Promise<Object|null>} - User preferences or null if not found
 */
export async function getUserPreferences() {
  try {
    const prefsString = await AsyncStorage.getItem(USER_PREFS_KEY);
    return prefsString ? JSON.parse(prefsString) : null;
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    return null;
  }
}

/**
 * Save data sources to local storage
 * @param {Array} dataSources - Data sources to save
 * @returns {Promise<boolean>} - Whether operation was successful
 */
export async function saveDataSources(dataSources) {
  try {
    await AsyncStorage.setItem(DATA_SOURCES_KEY, JSON.stringify(dataSources));
    return true;
  } catch (error) {
    console.error('Failed to save data sources:', error);
    return false;
  }
}

/**
 * Get data sources from local storage
 * @returns {Promise<Array|null>} - Data sources or null if not found
 */
export async function getDataSources() {
  try {
    const sourcesString = await AsyncStorage.getItem(DATA_SOURCES_KEY);
    return sourcesString ? JSON.parse(sourcesString) : null;
  } catch (error) {
    console.error('Failed to get data sources:', error);
    return null;
  }
}

/**
 * Save insights to local storage
 * @param {Array} insights - Insights to save
 * @returns {Promise<boolean>} - Whether operation was successful
 */
export async function saveInsights(insights) {
  try {
    await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
    return true;
  } catch (error) {
    console.error('Failed to save insights:', error);
    return false;
  }
}

/**
 * Get insights from local storage
 * @returns {Promise<Array|null>} - Insights or null if not found
 */
export async function getInsights() {
  try {
    const insightsString = await AsyncStorage.getItem(INSIGHTS_KEY);
    return insightsString ? JSON.parse(insightsString) : null;
  } catch (error) {
    console.error('Failed to get insights:', error);
    return null;
  }
}

/**
 * Save file to cache
 * @param {string} fileUri - URI of file to save
 * @param {string} fileId - Unique ID for the file
 * @returns {Promise<string|null>} - Local URI of cached file or null if failed
 */
export async function cacheFile(fileUri, fileId) {
  if (Platform.OS === 'web') return fileUri;
  
  try {
    await ensureCacheDir();
    
    // Get file extension
    const extension = fileUri.split('.').pop() || 'dat';
    const localFilePath = `${CACHE_DIR}${fileId}.${extension}`;
    
    // Download file
    const downloadResult = await FileSystem.downloadAsync(
      fileUri,
      localFilePath
    );
    
    if (downloadResult.status === 200) {
      // Update cache manifest
      await addToManifest(fileId, localFilePath, fileUri);
      return localFilePath;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to cache file:', error);
    return null;
  }
}

/**
 * Get cached file URI
 * @param {string} fileId - ID of file to retrieve
 * @returns {Promise<string|null>} - Local URI of cached file or null if not found
 */
export async function getCachedFile(fileId) {
  if (Platform.OS === 'web') return null;
  
  try {
    // Get manifest
    const manifest = await getCacheManifest();
    const fileEntry = manifest[fileId];
    
    if (!fileEntry) return null;
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileEntry.localPath);
    if (fileInfo.exists) {
      return fileEntry.localPath;
    }
    
    // If file doesn't exist, try to re-download
    return await cacheFile(fileEntry.originalUri, fileId);
  } catch (error) {
    console.error('Failed to get cached file:', error);
    return null;
  }
}

/**
 * Add file to cache manifest
 * @param {string} fileId - ID of the file
 * @param {string} localPath - Local path of cached file
 * @param {string} originalUri - Original URI of the file
 * @returns {Promise<boolean>} - Whether operation was successful
 */
async function addToManifest(fileId, localPath, originalUri) {
  try {
    const manifest = await getCacheManifest();
    
    manifest[fileId] = {
      localPath,
      originalUri,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(CACHE_MANIFEST_KEY, JSON.stringify(manifest));
    return true;
  } catch (error) {
    console.error('Failed to update cache manifest:', error);
    return false;
  }
}

/**
 * Get cache manifest
 * @returns {Promise<Object>} - Cache manifest
 */
async function getCacheManifest() {
  try {
    const manifestString = await AsyncStorage.getItem(CACHE_MANIFEST_KEY);
    return manifestString ? JSON.parse(manifestString) : {};
  } catch (error) {
    console.error('Failed to get cache manifest:', error);
    return {};
  }
}

/**
 * Clear all cached files
 * @returns {Promise<boolean>} - Whether operation was successful
 */
export async function clearCache() {
  try {
    // Clear manifest
    await AsyncStorage.removeItem(CACHE_MANIFEST_KEY);
    
    // Delete cache directory
    if (Platform.OS !== 'web') {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

/**
 * Calculate size of cache
 * @returns {Promise<number>} - Size in bytes
 */
export async function getCacheSize() {
  if (Platform.OS === 'web') return 0;
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) return 0;
    
    // On some platforms, we can get size directly
    if (dirInfo.size !== undefined) {
      return dirInfo.size;
    }
    
    // Otherwise, get manifest and sum up sizes
    const manifest = await getCacheManifest();
    
    let totalSize = 0;
    for (const fileId in manifest) {
      const fileInfo = await FileSystem.getInfoAsync(manifest[fileId].localPath);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

/**
 * Clear all offline data
 * @returns {Promise<boolean>} - Whether operation was successful
 */
export async function clearOfflineData() {
  try {
    // Clear cache files
    await clearCache();
    
    // Clear stored data
    const keys = [
      USER_DATA_KEY,
      USER_PREFS_KEY,
      DATA_SOURCES_KEY,
      INSIGHTS_KEY
    ];
    
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
    
    return true;
  } catch (error) {
    console.error('Failed to clear offline data:', error);
    return false;
  }
}