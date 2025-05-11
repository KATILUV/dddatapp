/**
 * Sync Manager utility
 * Handles background data synchronization and manages sync schedules
 */
import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Task names
const SYNC_TASK_NAME = 'background-sync-task';
const SYNC_SCHEDULE_KEY = 'solstice_sync_schedule';

// Define the background task
TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  try {
    // Check network status first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('Skipping background sync - not connected');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Import the network manager to use its syncOfflineActions function
    // We import it here to avoid circular dependencies
    const { syncOfflineActions } = require('../services/networkManager');
    
    // Perform sync
    const result = await syncOfflineActions();
    
    console.log('Background sync completed:', result);
    
    if (result.synced > 0) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register background sync task
 * @param {string} interval - 'minimum', 'hourly', 'daily'
 * @returns {Promise<boolean>} - Success status
 */
export async function registerBackgroundSync(interval = 'hourly') {
  if (Platform.OS === 'web') {
    console.log('Background sync not supported on web');
    return false;
  }
  
  try {
    // Convert interval string to minutes
    let intervalMinutes = 60; // Default hourly
    
    switch (interval) {
      case 'minimum':
        intervalMinutes = 15;
        break;
      case 'hourly':
        intervalMinutes = 60;
        break;
      case 'daily':
        intervalMinutes = 24 * 60;
        break;
      default:
        intervalMinutes = 60;
    }
    
    // Register the task
    await BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
      minimumInterval: intervalMinutes * 60, // Convert to seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    // Save the sync schedule
    await AsyncStorage.setItem(SYNC_SCHEDULE_KEY, interval);
    
    return true;
  } catch (error) {
    console.error('Failed to register background sync:', error);
    return false;
  }
}

/**
 * Unregister background sync task
 * @returns {Promise<boolean>} - Success status
 */
export async function unregisterBackgroundSync() {
  if (Platform.OS === 'web') {
    return false;
  }
  
  try {
    await BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME);
    await AsyncStorage.removeItem(SYNC_SCHEDULE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to unregister background sync:', error);
    return false;
  }
}

/**
 * Get current sync schedule
 * @returns {Promise<string>} - Current schedule interval
 */
export async function getSyncSchedule() {
  try {
    const schedule = await AsyncStorage.getItem(SYNC_SCHEDULE_KEY);
    return schedule || 'hourly'; // Default to hourly if not set
  } catch (error) {
    console.error('Failed to get sync schedule:', error);
    return 'hourly';
  }
}

/**
 * Check if background sync is registered
 * @returns {Promise<boolean>} - Whether sync is registered
 */
export async function isBackgroundSyncRegistered() {
  if (Platform.OS === 'web') {
    return false;
  }
  
  try {
    const status = await BackgroundFetch.getStatusAsync();
    return status === BackgroundFetch.BackgroundFetchStatus.Available;
  } catch (error) {
    console.error('Failed to check background sync status:', error);
    return false;
  }
}

/**
 * Trigger immediate sync
 * @returns {Promise<boolean>} - Success status
 */
export async function triggerSync() {
  // We import here to avoid circular dependencies
  const { syncOfflineActions } = require('../services/networkManager');
  
  try {
    // Check network status first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('Skipping sync - not connected');
      return false;
    }
    
    // Perform sync
    const result = await syncOfflineActions();
    return result.success;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}