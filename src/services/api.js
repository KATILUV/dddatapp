/**
 * API service for the Solstice app
 * Handles communication with the backend server
 */
import axios from 'axios';
import { getData } from '../utils/storage';

// Create axios instance for API calls
const api = axios.create({
  baseURL: '/', // Using relative path for API endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get the current user ID
 * @returns {Promise<string>} - User ID or null if not found
 */
const getUserId = async () => {
  try {
    const userData = await getData('userData');
    return userData?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * User related API calls
 */
export const userApi = {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  getProfile: async (userId) => {
    const id = userId || await getUserId();
    if (!id) throw new Error('User ID not found');
    
    const response = await api.get(`/api/user/${id}`);
    return response.data;
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - User profile data
   * @returns {Promise<Object>} - Updated user profile
   */
  updateProfile: async (profileData) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.put(`/api/user/${userId}`, profileData);
    return response.data;
  },
  
  /**
   * Get user preferences
   * @returns {Promise<Object>} - User preferences
   */
  getPreferences: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.get(`/api/user/${userId}/preferences`);
    return response.data;
  },
  
  /**
   * Update user preferences
   * @param {Object} preferences - User preferences data
   * @returns {Promise<Object>} - Updated preferences
   */
  updatePreferences: async (preferences) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.post(`/api/user/${userId}/preferences`, preferences);
    return response.data;
  },
};

/**
 * Data sources related API calls
 */
export const dataSourcesApi = {
  /**
   * Get all user data sources
   * @returns {Promise<Array>} - Array of data sources
   */
  getAll: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.get(`/api/user/${userId}/data-sources`);
    return response.data;
  },
  
  /**
   * Add a new data source
   * @param {Object} dataSource - Data source object
   * @returns {Promise<Object>} - Added data source
   */
  add: async (dataSource) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.post(`/api/user/${userId}/data-sources`, dataSource);
    return response.data;
  },
  
  /**
   * Remove a data source
   * @param {number} id - Data source ID
   * @returns {Promise<Object>} - Response data
   */
  remove: async (id) => {
    const response = await api.delete(`/api/data-sources/${id}`);
    return response.data;
  },
  
  /**
   * Get OAuth authorization URL
   * @param {string} provider - Provider name (google, twitter, etc.)
   * @returns {Promise<string>} - Authorization URL
   */
  getOAuthUrl: async (provider) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.get(`/api/oauth/authorize/${provider}`, {
      params: { userId }
    });
    
    return response.data.authUrl;
  },
  
  /**
   * Start OAuth flow by redirecting to provider's authorization page
   * @param {string} provider - Provider name (google, twitter, etc.)
   */
  startOAuthFlow: async (provider) => {
    const authUrl = await dataSourcesApi.getOAuthUrl(provider);
    
    // Open the URL in the current window
    window.location.href = authUrl;
  },
};

/**
 * Insights related API calls
 */
export const insightsApi = {
  /**
   * Get all insights for the current user
   * @returns {Promise<Array>} - Array of insights
   */
  getAll: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.get(`/api/user/${userId}/insights`);
    return response.data;
  },
  
  /**
   * Get a specific insight by ID
   * @param {number} id - Insight ID
   * @returns {Promise<Object>} - Insight data
   */
  getById: async (id) => {
    const response = await api.get(`/api/insights/${id}`);
    return response.data;
  },
  
  /**
   * Create a new insight
   * @param {Object} insight - Insight data
   * @returns {Promise<Object>} - Created insight
   */
  create: async (insight) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User ID not found');
    
    const response = await api.post(`/api/user/${userId}/insights`, insight);
    return response.data;
  },
  
  /**
   * Remove an insight
   * @param {number} id - Insight ID
   * @returns {Promise<Object>} - Response data
   */
  remove: async (id) => {
    const response = await api.delete(`/api/insights/${id}`);
    return response.data;
  },
};

export default {
  user: userApi,
  dataSources: dataSourcesApi,
  insights: insightsApi,
};