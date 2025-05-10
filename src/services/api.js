/**
 * API service
 * A wrapper around axios for making API requests
 */

import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // You could add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Data sources API functions
 */
export const dataSources = {
  /**
   * Get all data sources
   * @returns {Promise<Array>} Array of data sources
   */
  getAll: async () => {
    const response = await api.get('/api/data-sources');
    return response.data;
  },

  /**
   * Add a new data source
   * @param {Object} source - Data source object
   * @returns {Promise<Object>} Added data source
   */
  add: async (source) => {
    const response = await api.post('/api/data-sources', source);
    return response.data;
  },

  /**
   * Update a data source
   * @param {string} id - Data source ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated data source
   */
  update: async (id, updates) => {
    const response = await api.put(`/api/data-sources/${id}`, updates);
    return response.data;
  },

  /**
   * Remove a data source
   * @param {string} id - Data source ID
   * @returns {Promise<Object>} Success response
   */
  remove: async (id) => {
    const response = await api.delete(`/api/data-sources/${id}`);
    return response.data;
  },

  /**
   * Get data from a source
   * @param {string} id - Data source ID
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} The fetched data
   */
  getData: async (id, dataType, options = {}) => {
    const response = await api.get(`/api/data-sources/${id}/data`, {
      params: {
        dataType,
        ...options
      }
    });
    return response.data;
  },

  /**
   * Connect to a data source using OAuth
   * @param {string} sourceId - Data source ID
   * @param {string} redirectUrl - OAuth redirect URL
   * @returns {Promise<Object>} Connection response
   */
  connectOAuth: async (sourceId, redirectUrl) => {
    const response = await api.post('/api/oauth/connect', {
      sourceId,
      redirectUrl
    });
    return response.data;
  }
};

/**
 * Insights API functions
 */
export const insights = {
  /**
   * Get all insights
   * @returns {Promise<Array>} Array of insights
   */
  getAll: async () => {
    const response = await api.get('/api/insights');
    return response.data;
  },

  /**
   * Get a specific insight
   * @param {number} id - Insight ID
   * @returns {Promise<Object>} The insight
   */
  getById: async (id) => {
    const response = await api.get(`/api/insights/${id}`);
    return response.data;
  },

  /**
   * Generate a new insight
   * @param {string} systemPrompt - System prompt for the AI
   * @param {string} userPrompt - User prompt with data
   * @param {string} format - Output format (markdown, json)
   * @returns {Promise<Object>} Generated insight
   */
  generate: async (systemPrompt, userPrompt, format = 'markdown') => {
    const response = await api.post('/api/generate-insight', {
      systemPrompt,
      userPrompt,
      format
    });
    return response.data;
  },

  /**
   * Generate an insight from multiple data sources
   * @param {Object} dataSources - Data from various sources
   * @param {string} templateId - Template ID to use
   * @returns {Promise<Object>} Generated insight
   */
  generateMultiSource: async (dataSources, templateId) => {
    const response = await api.post('/api/multi-source-insight', {
      dataSources,
      templateId
    });
    return response.data;
  }
};

/**
 * User preferences API functions
 */
export const preferences = {
  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences
   */
  get: async () => {
    const response = await api.get('/api/preferences');
    return response.data;
  },

  /**
   * Update user preferences
   * @param {Object} updates - Preference updates
   * @returns {Promise<Object>} Updated preferences
   */
  update: async (updates) => {
    const response = await api.post('/api/preferences', updates);
    return response.data;
  }
};

/**
 * Server status API functions
 */
export const status = {
  /**
   * Get server status
   * @returns {Promise<Object>} Server status
   */
  get: async () => {
    const response = await api.get('/api/status');
    return response.data;
  }
};