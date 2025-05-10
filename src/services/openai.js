/**
 * OpenAI integration service for Voa
 * Handles communication with OpenAI API for chat and analysis
 */
import OpenAI from 'openai';

/**
 * Initialize OpenAI client
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // For client-side use
});

/**
 * Get chat completion from OpenAI
 * @param {Array} messages - Array of message objects with role and content properties
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - Response from OpenAI
 */
export const getChatCompletion = async (messages, options = {}) => {
  try {
    // Ensure API key is available
    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Default parameters
    const defaultOptions = {
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature: 0.7,
      max_tokens: 1000,
    };

    // Merge options
    const requestOptions = { ...defaultOptions, ...options };

    // Request completion
    const response = await openai.chat.completions.create({
      ...requestOptions,
      messages,
    });

    return response;
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
};

/**
 * Get JSON response from OpenAI
 * @param {Array} messages - Array of message objects with role and content properties
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const getJSONResponse = async (messages, options = {}) => {
  try {
    // Ensure API key is available
    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Default parameters
    const defaultOptions = {
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature: 0.2, // Lower temperature for more deterministic outputs
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    };

    // Merge options
    const requestOptions = { ...defaultOptions, ...options };

    // Request completion
    const response = await openai.chat.completions.create({
      ...requestOptions,
      messages,
    });

    // Parse JSON response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error getting JSON response:', error);
    throw error;
  }
};

/**
 * Analyze emotional trends from user data
 * @param {Array} dataPoints - Array of data points to analyze
 * @returns {Promise<Object>} - Emotional trend analysis
 */
export const analyzeEmotionalTrends = async (dataPoints) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are an expert at analyzing emotional patterns in text data. 
        Analyze the provided data and identify emotional trends and patterns.
        Provide your response as JSON with the following structure:
        {
          "primary_emotion": string,
          "emotion_distribution": { emotion: percentage },
          "trends": [{ period: string, dominant_emotion: string, intensity: number }],
          "insights": [string]
        }`
      },
      {
        role: 'user',
        content: `Analyze the following data points for emotional trends: ${JSON.stringify(dataPoints)}`
      }
    ];

    return await getJSONResponse(messages);
  } catch (error) {
    console.error('Error analyzing emotional trends:', error);
    throw error;
  }
};

/**
 * Identify creative themes in user content
 * @param {Array} contentItems - Array of content items to analyze
 * @returns {Promise<Object>} - Creative themes analysis
 */
export const identifyCreativeThemes = async (contentItems) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are an expert at identifying themes and patterns in creative content.
        Analyze the provided content and identify recurring themes, topics, and motifs.
        Provide your response as JSON with the following structure:
        {
          "themes": [{ name: string, frequency: number, examples: [string] }],
          "keywords": [{ word: string, count: number }],
          "style_patterns": [string],
          "recommendations": [string]
        }`
      },
      {
        role: 'user',
        content: `Analyze the following content items for creative themes: ${JSON.stringify(contentItems)}`
      }
    ];

    return await getJSONResponse(messages);
  } catch (error) {
    console.error('Error identifying creative themes:', error);
    throw error;
  }
};

/**
 * Detect behavioral patterns from user data
 * @param {Array} behaviors - Array of behavior data points to analyze
 * @returns {Promise<Object>} - Behavioral patterns analysis
 */
export const detectBehavioralPatterns = async (behaviors) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are an expert at identifying behavioral patterns and habits from data.
        Analyze the provided data and identify recurring patterns, habits, and potential loops.
        Provide your response as JSON with the following structure:
        {
          "patterns": [{ name: string, frequency: number, trigger: string, response: string }],
          "habits": [{ activity: string, context: string, regularity: string }],
          "loops": [{ trigger: string, action: string, reward: string, frequency: string }],
          "insights": [string]
        }`
      },
      {
        role: 'user',
        content: `Analyze the following behavior data for patterns: ${JSON.stringify(behaviors)}`
      }
    ];

    return await getJSONResponse(messages);
  } catch (error) {
    console.error('Error detecting behavioral patterns:', error);
    throw error;
  }
};

export default {
  getChatCompletion,
  getJSONResponse,
  analyzeEmotionalTrends,
  identifyCreativeThemes,
  detectBehavioralPatterns,
};