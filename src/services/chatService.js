/**
 * Chat Service
 * Handles interactions with the AI assistant through OpenAI
 */

import { api } from './api';
import dataSourceManager from './dataSources/dataSourceManager';

// Default system message that defines the AI's behavior
const DEFAULT_SYSTEM_MESSAGE = 
  'You are SOLSTICE, a personal AI assistant that helps users understand their data and personal patterns. ' +
  'Your responses should be helpful, conversational, and personalized based on the data sources the user has connected. ' +
  'Focus on finding meaningful insights and connections between different aspects of the user\'s life. ' +
  'Be supportive and empathetic, while respecting the user\'s privacy and agency. ' +
  'When you don\'t have enough information to answer a question, suggest what data sources the user could connect to get better insights.';

// Cache of recent data to avoid redundant fetching
let dataCache = {
  timestamp: null,
  data: {},
  expiryTime: 5 * 60 * 1000, // 5 minutes
};

/**
 * The Chat Service for interacting with the AI assistant
 */
const chatService = {
  /**
   * Send a message to the AI assistant
   * @param {string} message - User's message
   * @param {Array} history - Chat history
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Assistant's response
   */
  sendMessage: async (message, history = [], options = {}) => {
    try {
      // Fetch relevant data from connected sources if needed
      const contextData = await chatService.getRelevantData(message);
      
      // Create the prompt with context
      const prompt = chatService.createPromptWithContext(message, contextData);
      
      // Build the messages array for the API
      const messages = [
        { role: 'system', content: options.systemMessage || DEFAULT_SYSTEM_MESSAGE },
        ...history.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: prompt }
      ];
      
      // Call the API
      const response = await api.post('/api/chat', {
        messages,
        options: {
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 800
        }
      });
      
      return {
        text: response.data.response,
        timestamp: new Date().toISOString(),
        contextData: Object.keys(contextData)
      };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error(`Failed to get a response: ${error.message}`);
    }
  },
  
  /**
   * Get data relevant to the user's query
   * @param {string} query - User's message
   * @returns {Promise<Object>} Relevant data from connected sources
   */
  getRelevantData: async (query) => {
    // Check if cache is still valid
    const now = Date.now();
    if (dataCache.timestamp && (now - dataCache.timestamp < dataCache.expiryTime)) {
      return dataCache.data;
    }
    
    // Get connected sources
    const connectedSources = dataSourceManager.getConnectedSources();
    if (connectedSources.length === 0) {
      return {};
    }
    
    // Determine which data types are relevant to the query
    const relevantTypes = chatService.determineRelevantDataTypes(query);
    
    // Fetch data from relevant sources
    const data = {};
    
    for (const source of connectedSources) {
      const sourceData = {};
      let hasData = false;
      
      // Get data for each relevant type
      for (const type of relevantTypes) {
        // Only request if the source supports this data type
        if (source.dataTypes && source.dataTypes.includes(type)) {
          try {
            const result = await dataSourceManager.fetchData(source.id, type, {
              limit: 10, // Limit the amount of data
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
            });
            
            if (result && result.data && result.data.length > 0) {
              sourceData[type] = result.data;
              hasData = true;
            }
          } catch (error) {
            console.error(`Error fetching ${type} data from ${source.name}:`, error);
            // Continue with other data types even if one fails
          }
        }
      }
      
      // Only add sources that actually returned data
      if (hasData) {
        data[source.id] = {
          name: source.name,
          type: source.type,
          data: sourceData
        };
      }
    }
    
    // Update cache
    dataCache = {
      timestamp: now,
      data,
      expiryTime: dataCache.expiryTime
    };
    
    return data;
  },
  
  /**
   * Determine which data types are relevant to the user's query
   * @param {string} query - User's message
   * @returns {Array<string>} Array of relevant data types
   */
  determineRelevantDataTypes: (query) => {
    // Simple keyword-based relevance determination
    // In a production app, this could use NLP or more sophisticated techniques
    const query_lower = query.toLowerCase();
    
    const typeKeywords = {
      'activity': ['activity', 'exercise', 'workout', 'walk', 'run', 'steps', 'move'],
      'sleep': ['sleep', 'bed', 'tired', 'rest', 'nap', 'dream'],
      'vitals': ['heart', 'blood pressure', 'temperature', 'vital', 'health'],
      'nutrition': ['food', 'eat', 'meal', 'diet', 'nutrition', 'calorie'],
      'listening-history': ['music', 'song', 'listen', 'spotify', 'artist', 'album', 'playlist'],
      'locations': ['location', 'place', 'visit', 'travel', 'went', 'city', 'trip'],
      'tasks': ['task', 'todo', 'project', 'work', 'complete', 'finish', 'productivity']
    };
    
    // Find matching data types
    const relevantTypes = [];
    
    Object.entries(typeKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query_lower.includes(keyword))) {
        relevantTypes.push(type);
      }
    });
    
    // If no specific types are found, return a default set
    if (relevantTypes.length === 0) {
      return ['activity', 'sleep', 'listening-history', 'tasks'];
    }
    
    return relevantTypes;
  },
  
  /**
   * Create a prompt with context data for better responses
   * @param {string} message - User's message
   * @param {Object} contextData - Data from connected sources
   * @returns {string} Enhanced prompt with context
   */
  createPromptWithContext: (message, contextData) => {
    if (Object.keys(contextData).length === 0) {
      return message;
    }
    
    // Create a context section for the AI
    let contextSection = 'Here is relevant information from the user\'s connected data sources:\n\n';
    
    Object.entries(contextData).forEach(([sourceId, source]) => {
      contextSection += `### ${source.name} (${source.type})\n`;
      
      Object.entries(source.data).forEach(([dataType, data]) => {
        contextSection += `${dataType.replace(/-/g, ' ')} (${data.length} items):\n`;
        
        // Format based on data type
        if (Array.isArray(data) && data.length > 0) {
          // Only include a sample of the data to avoid overloading the prompt
          const sample = data.slice(0, 3);
          
          // Different formatting based on what properties are available
          if (data[0].timestamp || data[0].date) {
            sample.forEach(item => {
              const date = item.timestamp || item.date;
              contextSection += `- [${date}]: ${JSON.stringify(item)}\n`;
            });
          } else {
            sample.forEach(item => {
              contextSection += `- ${JSON.stringify(item)}\n`;
            });
          }
          
          if (data.length > 3) {
            contextSection += `- (${data.length - 3} more items not shown)\n`;
          }
        }
        
        contextSection += '\n';
      });
    });
    
    contextSection += `\nUser question: ${message}\n\n`;
    contextSection += 'Please provide a thoughtful response based on the data above. If relevant data is missing, suggest what information might help provide a better answer.';
    
    return contextSection;
  },
  
  /**
   * Clear the data cache
   */
  clearCache: () => {
    dataCache = {
      timestamp: null,
      data: {},
      expiryTime: dataCache.expiryTime
    };
  }
};

export default chatService;