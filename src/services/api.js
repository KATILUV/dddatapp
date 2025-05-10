/**
 * API service for connecting to the backend
 */
import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  }
});

// API service object
const api = {
  /**
   * Get server status
   * @returns {Promise} Promise with status information
   */
  getStatus: async () => {
    try {
      const response = await axiosInstance.get('/api/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching API status:', error);
      throw error;
    }
  },

  /**
   * Get user data sources
   * @returns {Promise} Promise with data sources
   */
  getDataSources: async () => {
    try {
      const response = await axiosInstance.get('/api/data-sources');
      return response.data;
    } catch (error) {
      console.error('Error fetching data sources:', error);
      throw error;
    }
  },

  /**
   * Add a new data source
   * @param {Object} dataSource - Data source object to add
   * @returns {Promise} Promise with created data source
   */
  addDataSource: async (dataSource) => {
    try {
      const response = await axiosInstance.post('/api/data-sources', dataSource);
      return response.data;
    } catch (error) {
      console.error('Error adding data source:', error);
      throw error;
    }
  },

  /**
   * Update a data source
   * @param {number} id - Data source ID
   * @param {Object} dataSource - Updated data source object
   * @returns {Promise} Promise with updated data source
   */
  updateDataSource: async (id, dataSource) => {
    try {
      const response = await axiosInstance.put(`/api/data-sources/${id}`, dataSource);
      return response.data;
    } catch (error) {
      console.error('Error updating data source:', error);
      throw error;
    }
  },

  /**
   * Remove a data source
   * @param {number} id - Data source ID to remove
   * @returns {Promise} Promise with success status
   */
  removeDataSource: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/data-sources/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error removing data source:', error);
      throw error;
    }
  },

  /**
   * Get user insights
   * @returns {Promise} Promise with insights
   */
  getInsights: async () => {
    try {
      const response = await axiosInstance.get('/api/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  },

  /**
   * Get a specific insight by ID
   * @param {number} id - Insight ID
   * @returns {Promise} Promise with insight details
   */
  getInsightById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/insights/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching insight:', error);
      throw error;
    }
  },

  /**
   * Get user preferences
   * @returns {Promise} Promise with user preferences
   */
  getUserPreferences: async () => {
    try {
      const response = await axiosInstance.get('/api/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Return default preferences if there's an error
      return {
        theme: 'dark',
        communicationStyle: 'supportive',
        notificationsEnabled: true,
        dataProcessingEnabled: true,
        enhancedProfilingEnabled: false,
      };
    }
  },

  /**
   * Update user preferences
   * @param {Object} preferences - Updated preferences object
   * @returns {Promise} Promise with updated preferences
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await axiosInstance.post('/api/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  /**
   * Get the current user
   * @returns {Promise} Promise with user information
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/api/auth/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
};

export default api;