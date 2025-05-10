/**
 * OpenAI service for generating AI insights
 */

import axios from 'axios';
import { api } from './api';

// Cache of previously generated responses to minimize API usage
const responseCache = new Map();

/**
 * Generate an AI insight based on a template and user data
 * @param {string} systemPrompt - System prompt defining AI behavior
 * @param {string} userPrompt - User prompt with data incorporated
 * @param {string} format - Desired output format (markdown, json, structured)
 * @returns {Promise<string>} Generated insight text
 */
export async function generateInsight(systemPrompt, userPrompt, format = 'markdown') {
  try {
    // Create a cache key from the prompts
    const cacheKey = `${systemPrompt}:${userPrompt}:${format}`;
    
    // Check cache first
    if (responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey);
    }
    
    // Make API request through our server (proxy)
    const response = await api.post('/generate-insight', {
      systemPrompt,
      userPrompt,
      format
    });
    
    const result = response.data.result;
    
    // Cache the response
    responseCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error generating insight:', error);
    throw new Error('Failed to generate insight: ' + (error.response?.data?.error || error.message));
  }
}

/**
 * Direct method for interacting with OpenAI API (for development/testing)
 * This would typically be used server-side, not in the client
 * @param {string} systemPrompt - System prompt defining AI behavior
 * @param {string} userPrompt - User prompt with data incorporated
 * @param {string} format - Desired output format
 * @returns {Promise<string>} Generated text
 */
export async function generateWithOpenAI(systemPrompt, userPrompt, format = 'markdown') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required');
  }
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: format === 'json' ? { type: 'json_object' } : undefined
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate with OpenAI: ' + (error.response?.data?.error?.message || error.message));
  }
}

/**
 * Generate an insight based on multiple data sources
 * @param {Object} dataSources - Object containing data from various sources
 * @param {string} templateId - ID of the template to use
 * @returns {Promise<Object>} Generated insight
 */
export async function generateMultiSourceInsight(dataSources, templateId) {
  try {
    const response = await api.post('/multi-source-insight', {
      dataSources,
      templateId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating multi-source insight:', error);
    throw new Error('Failed to generate insight: ' + (error.response?.data?.error || error.message));
  }
}