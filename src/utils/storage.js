/**
 * Storage utility functions for saving and retrieving data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Store key-value pair in AsyncStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON.stringified)
 * @returns {Promise<void>}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<any>} - Parsed value or null if not found
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

/**
 * Remove an item from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

/**
 * Store chat messages in AsyncStorage
 * @param {Array} messages - Array of message objects
 * @returns {Promise<void>}
 */
export const storeMessages = async (messages) => {
  try {
    await storeData('messages', messages);
  } catch (error) {
    console.error('Error storing messages:', error);
    throw error;
  }
};

/**
 * Load chat messages from AsyncStorage
 * @returns {Promise<Array>} - Array of message objects or empty array
 */
export const loadMessages = async () => {
  try {
    const messages = await getData('messages');
    return messages || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

/**
 * Store a file in app's document directory
 * @param {string} fileName - Name of the file
 * @param {string} content - Content to write
 * @param {string} directory - Optional subdirectory
 * @returns {Promise<string>} - URI of the stored file
 */
export const storeFile = async (fileName, content, directory = '') => {
  try {
    const dirPath = directory 
      ? `${FileSystem.documentDirectory}${directory}/`
      : FileSystem.documentDirectory;
      
    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
    
    const fileUri = `${dirPath}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, content);
    return fileUri;
  } catch (error) {
    console.error('Error storing file:', error);
    throw error;
  }
};

/**
 * Read a file from app's document directory
 * @param {string} fileName - Name of the file
 * @param {string} directory - Optional subdirectory
 * @returns {Promise<string>} - Content of the file
 */
export const readFile = async (fileName, directory = '') => {
  try {
    const dirPath = directory 
      ? `${FileSystem.documentDirectory}${directory}/`
      : FileSystem.documentDirectory;
    
    const fileUri = `${dirPath}${fileName}`;
    return await FileSystem.readAsStringAsync(fileUri);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

/**
 * Delete a file from app's document directory
 * @param {string} fileName - Name of the file
 * @param {string} directory - Optional subdirectory
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileName, directory = '') => {
  try {
    const dirPath = directory 
      ? `${FileSystem.documentDirectory}${directory}/`
      : FileSystem.documentDirectory;
    
    const fileUri = `${dirPath}${fileName}`;
    await FileSystem.deleteAsync(fileUri);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Check if a file exists
 * @param {string} fileName - Name of the file
 * @param {string} directory - Optional subdirectory
 * @returns {Promise<boolean>} - True if file exists
 */
export const fileExists = async (fileName, directory = '') => {
  try {
    const dirPath = directory 
      ? `${FileSystem.documentDirectory}${directory}/`
      : FileSystem.documentDirectory;
    
    const fileUri = `${dirPath}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
};