/**
 * Data Source Manager
 * Manages the registration, authorization, and data fetching from external data sources
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

// Storage keys
const CONNECTED_SOURCES_KEY = 'solstice_connected_sources';

/**
 * Supported data source types
 */
export const DATA_SOURCE_TYPES = {
  HEALTH: 'health',
  FITNESS: 'fitness',
  MUSIC: 'music',
  PRODUCTIVITY: 'productivity',
  SOCIAL: 'social',
  LOCATION: 'location',
  FINANCE: 'finance',
  CUSTOM: 'custom',
};

/**
 * Data Source Manager class
 * Handles registration, connection, and data retrieval from external services
 */
class DataSourceManager {
  constructor() {
    this.sources = new Map();
    this.connectedSources = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the data source manager
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load connected sources from storage
      const connectedSourcesJson = await AsyncStorage.getItem(CONNECTED_SOURCES_KEY);
      if (connectedSourcesJson) {
        const parsedSources = JSON.parse(connectedSourcesJson);
        Object.entries(parsedSources).forEach(([id, source]) => {
          this.connectedSources.set(id, source);
        });
      }
      
      // Register built-in data sources
      this.registerBuiltInSources();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize data source manager:', error);
    }
  }

  /**
   * Register built-in data sources
   */
  registerBuiltInSources() {
    // Health data sources
    this.registerSource({
      id: 'apple-health',
      name: 'Apple Health',
      description: 'Connect to Apple Health to import health, fitness, and activity data',
      type: DATA_SOURCE_TYPES.HEALTH,
      icon: 'ios-heart',
      color: '#FF2D55',
      platforms: ['ios'],
      requiresOAuth: false,
      dataTypes: ['activity', 'sleep', 'vitals', 'nutrition'],
      connectHandler: this.connectAppleHealth,
      fetchHandler: this.fetchAppleHealthData,
    });
    
    this.registerSource({
      id: 'google-fit',
      name: 'Google Fit',
      description: 'Connect to Google Fit to import health, fitness, and activity data',
      type: DATA_SOURCE_TYPES.HEALTH,
      icon: 'ios-fitness',
      color: '#4285F4',
      platforms: ['android', 'web'],
      requiresOAuth: true,
      oauthConfig: {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: '', // Would be set from environment
        scopes: ['https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.body.read'],
        redirectUrl: 'com.solstice.app:/oauth2callback',
      },
      dataTypes: ['activity', 'sleep', 'vitals'],
      connectHandler: this.connectOAuthSource,
      fetchHandler: this.fetchGoogleFitData,
    });
    
    // Music data sources
    this.registerSource({
      id: 'spotify',
      name: 'Spotify',
      description: 'Connect to Spotify to analyze your music listening patterns',
      type: DATA_SOURCE_TYPES.MUSIC,
      icon: 'ios-musical-notes',
      color: '#1DB954',
      platforms: ['ios', 'android', 'web'],
      requiresOAuth: true,
      oauthConfig: {
        authUrl: 'https://accounts.spotify.com/authorize',
        tokenUrl: 'https://accounts.spotify.com/api/token',
        clientId: '', // Would be set from environment
        scopes: ['user-read-recently-played', 'user-top-read', 'user-read-playback-state'],
        redirectUrl: 'com.solstice.app:/oauth2callback',
      },
      dataTypes: ['listening-history', 'favorites', 'playlists'],
      connectHandler: this.connectOAuthSource,
      fetchHandler: this.fetchSpotifyData,
    });
    
    // Productivity data sources
    this.registerSource({
      id: 'notion',
      name: 'Notion',
      description: 'Connect to Notion to analyze your notes, tasks, and documents',
      type: DATA_SOURCE_TYPES.PRODUCTIVITY,
      icon: 'ios-document',
      color: '#000000',
      platforms: ['ios', 'android', 'web'],
      requiresOAuth: true,
      oauthConfig: {
        authUrl: 'https://api.notion.com/v1/oauth/authorize',
        tokenUrl: 'https://api.notion.com/v1/oauth/token',
        clientId: '', // Would be set from environment
        scopes: [],
        redirectUrl: 'com.solstice.app:/oauth2callback',
      },
      dataTypes: ['pages', 'databases', 'tasks'],
      connectHandler: this.connectOAuthSource,
      fetchHandler: this.fetchNotionData,
    });
    
    // Social data sources
    this.registerSource({
      id: 'twitter',
      name: 'Twitter',
      description: 'Connect to Twitter to analyze your posts and social interactions',
      type: DATA_SOURCE_TYPES.SOCIAL,
      icon: 'logo-twitter',
      color: '#1DA1F2',
      platforms: ['ios', 'android', 'web'],
      requiresOAuth: true,
      oauthConfig: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        clientId: '', // Would be set from environment
        scopes: ['tweet.read', 'users.read', 'follows.read'],
        redirectUrl: 'com.solstice.app:/oauth2callback',
      },
      dataTypes: ['tweets', 'followers', 'interactions'],
      connectHandler: this.connectOAuthSource,
      fetchHandler: this.fetchTwitterData,
    });
    
    // Location data sources
    this.registerSource({
      id: 'location-history',
      name: 'Location History',
      description: 'Analyze your location history and movement patterns',
      type: DATA_SOURCE_TYPES.LOCATION,
      icon: 'ios-navigate',
      color: '#5856D6',
      platforms: ['ios', 'android'],
      requiresOAuth: false,
      dataTypes: ['locations', 'places', 'trips'],
      connectHandler: this.connectLocationHistory,
      fetchHandler: this.fetchLocationData,
    });
  }

  /**
   * Register a new data source
   * @param {Object} source - Data source configuration
   */
  registerSource(source) {
    if (!source || !source.id) {
      throw new Error('Data source must have an ID');
    }
    
    this.sources.set(source.id, source);
  }

  /**
   * Get all available data sources
   * @param {string} platform - Optional platform filter (ios, android, web)
   * @returns {Array} Array of data source objects
   */
  getAvailableSources(platform = null) {
    let sources = Array.from(this.sources.values());
    
    // Filter by platform if specified
    if (platform) {
      sources = sources.filter(source => 
        !source.platforms || source.platforms.includes(platform)
      );
    }
    
    return sources;
  }

  /**
   * Get sources by type
   * @param {string} type - Data source type
   * @returns {Array} Array of data sources of the specified type
   */
  getSourcesByType(type) {
    return Array.from(this.sources.values())
      .filter(source => source.type === type);
  }

  /**
   * Get a data source by ID
   * @param {string} id - Data source ID
   * @returns {Object|null} Data source object or null if not found
   */
  getSource(id) {
    return this.sources.get(id) || null;
  }

  /**
   * Get all connected data sources
   * @returns {Array} Array of connected data source objects
   */
  getConnectedSources() {
    return Array.from(this.connectedSources.values());
  }

  /**
   * Check if a data source is connected
   * @param {string} id - Data source ID
   * @returns {boolean} True if connected, false otherwise
   */
  isSourceConnected(id) {
    return this.connectedSources.has(id);
  }

  /**
   * Connect to a data source
   * @param {string} id - Data source ID
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connected source object
   */
  async connectSource(id, options = {}) {
    const source = this.getSource(id);
    if (!source) {
      throw new Error(`Data source with ID ${id} not found`);
    }
    
    try {
      // Call the source-specific connect handler
      if (source.connectHandler) {
        const connectionResult = await source.connectHandler(source, options);
        
        // Store connection info
        const connectedSource = {
          ...source,
          connected: true,
          connectedAt: new Date().toISOString(),
          connectionInfo: connectionResult,
        };
        
        this.connectedSources.set(id, connectedSource);
        
        // Save to storage
        await this.saveConnectedSources();
        
        // Sync with server
        await this.syncSourceWithServer(connectedSource);
        
        return connectedSource;
      } else {
        throw new Error(`Data source ${id} does not have a connect handler`);
      }
    } catch (error) {
      console.error(`Failed to connect to data source ${id}:`, error);
      throw new Error(`Failed to connect to ${source.name}: ${error.message}`);
    }
  }

  /**
   * Disconnect from a data source
   * @param {string} id - Data source ID
   * @returns {Promise<boolean>} Success status
   */
  async disconnectSource(id) {
    const source = this.connectedSources.get(id);
    if (!source) {
      return false;
    }
    
    try {
      // Remove from connected sources
      this.connectedSources.delete(id);
      
      // Save to storage
      await this.saveConnectedSources();
      
      // Sync with server
      await api.delete(`/api/data-sources/${id}`);
      
      return true;
    } catch (error) {
      console.error(`Failed to disconnect data source ${id}:`, error);
      throw new Error(`Failed to disconnect from ${source.name}: ${error.message}`);
    }
  }

  /**
   * Fetch data from a connected source
   * @param {string} id - Data source ID
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options (time range, filters, etc.)
   * @returns {Promise<Object>} Fetched data
   */
  async fetchData(id, dataType, options = {}) {
    const source = this.connectedSources.get(id);
    if (!source) {
      throw new Error(`Data source ${id} is not connected`);
    }
    
    if (!source.dataTypes.includes(dataType)) {
      throw new Error(`Data source ${id} does not support data type ${dataType}`);
    }
    
    try {
      // Call the source-specific fetch handler
      if (source.fetchHandler) {
        return await source.fetchHandler(source, dataType, options);
      } else {
        throw new Error(`Data source ${id} does not have a fetch handler`);
      }
    } catch (error) {
      console.error(`Failed to fetch data from source ${id}:`, error);
      throw new Error(`Failed to fetch data from ${source.name}: ${error.message}`);
    }
  }

  /**
   * Save connected sources to storage
   */
  async saveConnectedSources() {
    const connectedSourcesObj = {};
    this.connectedSources.forEach((source, id) => {
      connectedSourcesObj[id] = source;
    });
    
    await AsyncStorage.setItem(
      CONNECTED_SOURCES_KEY,
      JSON.stringify(connectedSourcesObj)
    );
  }

  /**
   * Sync a data source with the server
   * @param {Object} source - Data source object
   */
  async syncSourceWithServer(source) {
    try {
      // Check if the source exists on the server
      const response = await api.get(`/api/data-sources`);
      const existingSources = response.data;
      const existingSource = existingSources.find(s => s.id === source.id);
      
      if (existingSource) {
        // Update existing source
        await api.put(`/api/data-sources/${source.id}`, {
          name: source.name,
          type: source.type,
          connected: true,
          lastSync: new Date().toISOString()
        });
      } else {
        // Create new source
        await api.post('/api/data-sources', {
          id: source.id,
          name: source.name,
          type: source.type,
          connected: true,
          lastSync: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to sync data source with server:', error);
      // Continue even if server sync fails
    }
  }

  // Source-specific connect handlers
  
  /**
   * Connect to Apple Health
   * @param {Object} source - Data source configuration
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connection info
   */
  async connectAppleHealth(source, options) {
    // This would use React Native Health Kit in a real implementation
    // For now, just return mock connection info
    return {
      status: 'connected',
      permissions: ['activity', 'sleep', 'vitals', 'nutrition'],
    };
  }
  
  /**
   * Connect to an OAuth-based source
   * @param {Object} source - Data source configuration
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connection info
   */
  async connectOAuthSource(source, options) {
    if (!source.requiresOAuth || !source.oauthConfig) {
      throw new Error(`Source ${source.id} is not configured for OAuth`);
    }
    
    try {
      // This would initiate the OAuth flow in a real implementation
      // For now, proxy to the server which would handle the OAuth flow
      const response = await api.post('/api/oauth/connect', {
        sourceId: source.id,
        redirectUrl: source.oauthConfig.redirectUrl,
      });
      
      return response.data;
    } catch (error) {
      console.error(`OAuth connection failed for ${source.id}:`, error);
      throw new Error(`Failed to authenticate with ${source.name}`);
    }
  }
  
  /**
   * Connect to location history
   * @param {Object} source - Data source configuration
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connection info
   */
  async connectLocationHistory(source, options) {
    // This would request location permissions in a real implementation
    // For now, just return mock connection info
    return {
      status: 'connected',
      permissions: ['always'],
    };
  }
  
  // Source-specific fetch handlers
  
  /**
   * Fetch data from Apple Health
   * @param {Object} source - Connected source
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Fetched data
   */
  async fetchAppleHealthData(source, dataType, options) {
    // This would use React Native Health Kit in a real implementation
    // For now, make a server request
    try {
      const response = await api.get(`/api/data-sources/${source.id}/data`, {
        params: {
          dataType,
          ...options,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${dataType} data from Apple Health:`, error);
      throw new Error(`Could not retrieve ${dataType} data from Apple Health`);
    }
  }
  
  /**
   * Fetch data from Google Fit
   * @param {Object} source - Connected source
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Fetched data
   */
  async fetchGoogleFitData(source, dataType, options) {
    // Make a server request to fetch data
    try {
      const response = await api.get(`/api/data-sources/${source.id}/data`, {
        params: {
          dataType,
          ...options,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${dataType} data from Google Fit:`, error);
      throw new Error(`Could not retrieve ${dataType} data from Google Fit`);
    }
  }
  
  /**
   * Fetch data from Spotify
   * @param {Object} source - Connected source
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Fetched data
   */
  async fetchSpotifyData(source, dataType, options) {
    // Make a server request to fetch data
    try {
      const response = await api.get(`/api/data-sources/${source.id}/data`, {
        params: {
          dataType,
          ...options,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${dataType} data from Spotify:`, error);
      throw new Error(`Could not retrieve ${dataType} data from Spotify`);
    }
  }
  
  /**
   * Fetch data from Notion
   * @param {Object} source - Connected source
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Fetched data
   */
  async fetchNotionData(source, dataType, options) {
    // Make a server request to fetch data
    try {
      const response = await api.get(`/api/data-sources/${source.id}/data`, {
        params: {
          dataType,
          ...options,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${dataType} data from Notion:`, error);
      throw new Error(`Could not retrieve ${dataType} data from Notion`);
    }
  }
  
  /**
   * Fetch data from Twitter
   * @param {Object} source - Connected source
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Fetched data
   */
  async fetchTwitterData(source, dataType, options) {
    // Make a server request to fetch data
    try {
      const response = await api.get(`/api/data-sources/${source.id}/data`, {
        params: {
          dataType,
          ...options,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${dataType} data from Twitter:`, error);
      throw new Error(`Could not retrieve ${dataType} data from Twitter`);
    }
  }
  
  /**
   * Fetch location data
   * @param {Object} source - Connected source
   * @param {string} dataType - Type of data to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Fetched data
   */
  async fetchLocationData(source, dataType, options) {
    // This would use location APIs in a real implementation
    // For now, make a server request
    try {
      const response = await api.get(`/api/data-sources/${source.id}/data`, {
        params: {
          dataType,
          ...options,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${dataType} location data:`, error);
      throw new Error(`Could not retrieve ${dataType} location data`);
    }
  }
}

// Create and export singleton instance
const dataSourceManager = new DataSourceManager();
export default dataSourceManager;