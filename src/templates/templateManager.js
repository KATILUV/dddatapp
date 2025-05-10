/**
 * Template manager
 * Manages the loading, storage, and application of templates
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateTemplate, TEMPLATE_TYPES } from './templateSchema';

// Storage keys
const TEMPLATE_STORAGE_PREFIX = 'solstice_template_';
const ACTIVE_TEMPLATES_KEY = 'solstice_active_templates';

/**
 * Template manager class for handling templates
 */
class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.activeTemplates = {};
    this.initialized = false;
  }

  /**
   * Initialize the template manager
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load active templates
      const activeTemplatesJson = await AsyncStorage.getItem(ACTIVE_TEMPLATES_KEY);
      this.activeTemplates = activeTemplatesJson ? JSON.parse(activeTemplatesJson) : {};
      
      // Load all stored templates
      const keys = await AsyncStorage.getAllKeys();
      const templateKeys = keys.filter(key => key.startsWith(TEMPLATE_STORAGE_PREFIX));
      
      if (templateKeys.length > 0) {
        const templateItems = await AsyncStorage.multiGet(templateKeys);
        templateItems.forEach(([key, value]) => {
          if (value) {
            const templateId = key.replace(TEMPLATE_STORAGE_PREFIX, '');
            const template = JSON.parse(value);
            this.templates.set(templateId, template);
          }
        });
      }
      
      // Load default templates if no templates exist
      if (this.templates.size === 0) {
        await this.loadDefaultTemplates();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize template manager:', error);
      // Fallback to defaults
      await this.loadDefaultTemplates();
      this.initialized = true;
    }
  }

  /**
   * Load default templates
   */
  async loadDefaultTemplates() {
    try {
      // Import default templates
      const defaultInsightTemplates = require('./insights/defaults');
      
      // Add defaults to storage
      for (const template of defaultInsightTemplates) {
        await this.saveTemplate(template);
        
        // Set as active if it's a default template
        if (template.isDefault && !this.activeTemplates[template.type]) {
          this.activeTemplates[template.type] = template.id;
        }
      }
      
      // Save active templates
      await AsyncStorage.setItem(ACTIVE_TEMPLATES_KEY, JSON.stringify(this.activeTemplates));
    } catch (error) {
      console.error('Failed to load default templates:', error);
    }
  }

  /**
   * Get all templates
   * @param {string} type - Optional template type filter
   * @returns {Array} Array of templates
   */
  getTemplates(type = null) {
    const templates = Array.from(this.templates.values());
    return type ? templates.filter(template => template.type === type) : templates;
  }

  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} The template or null if not found
   */
  getTemplate(id) {
    return this.templates.get(id) || null;
  }

  /**
   * Get the active template for a type
   * @param {string} type - Template type
   * @returns {Object|null} The active template or null
   */
  getActiveTemplate(type) {
    const activeId = this.activeTemplates[type];
    return activeId ? this.getTemplate(activeId) : null;
  }

  /**
   * Set the active template for a type
   * @param {string} type - Template type
   * @param {string} id - Template ID
   */
  async setActiveTemplate(type, id) {
    // Ensure the template exists
    const template = this.getTemplate(id);
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    if (template.type !== type) {
      throw new Error(`Template with ID ${id} is not of type ${type}`);
    }
    
    this.activeTemplates[type] = id;
    await AsyncStorage.setItem(ACTIVE_TEMPLATES_KEY, JSON.stringify(this.activeTemplates));
  }

  /**
   * Save a template
   * @param {Object} template - Template object
   * @returns {Object} The saved template
   */
  async saveTemplate(template) {
    // Validate the template
    const validation = validateTemplate(template);
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
    }
    
    // Update the last modified date
    template.lastModified = new Date().toISOString();
    
    // Save to storage
    this.templates.set(template.id, template);
    await AsyncStorage.setItem(
      `${TEMPLATE_STORAGE_PREFIX}${template.id}`,
      JSON.stringify(template)
    );
    
    return template;
  }

  /**
   * Delete a template
   * @param {string} id - Template ID
   * @returns {boolean} Success status
   */
  async deleteTemplate(id) {
    const template = this.getTemplate(id);
    if (!template) {
      return false;
    }
    
    // Don't delete default templates
    if (template.isDefault) {
      throw new Error('Cannot delete default templates');
    }
    
    // Remove from active templates if needed
    if (this.activeTemplates[template.type] === id) {
      delete this.activeTemplates[template.type];
      await AsyncStorage.setItem(ACTIVE_TEMPLATES_KEY, JSON.stringify(this.activeTemplates));
    }
    
    // Remove from storage
    this.templates.delete(id);
    await AsyncStorage.removeItem(`${TEMPLATE_STORAGE_PREFIX}${id}`);
    
    return true;
  }

  /**
   * Apply a template to generate content
   * @param {string} templateId - Template ID
   * @param {Object} data - Data to use with the template
   * @returns {Promise<Object>} The generated content
   */
  async applyTemplate(templateId, data) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Implement template-specific application based on type
    switch (template.type) {
      case TEMPLATE_TYPES.INSIGHT:
        return this.applyInsightTemplate(template, data);
      // Handle other template types here
      default:
        throw new Error(`Unsupported template type: ${template.type}`);
    }
  }

  /**
   * Apply an insight template
   * @param {Object} template - Insight template
   * @param {Object} data - User data
   * @returns {Promise<Object>} Generated insight
   */
  async applyInsightTemplate(template, data) {
    // Check for required data fields
    const { requiredDataFields = [] } = template.template;
    const missingFields = requiredDataFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required data fields: ${missingFields.join(', ')}`);
    }
    
    // In a real implementation, this would call the OpenAI service
    // For now, we're just demonstrating the structure
    try {
      // Build the prompt by replacing placeholders in the template
      let prompt = template.template.promptTemplate;
      
      // Replace placeholders
      Object.entries(data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        if (prompt.includes(placeholder)) {
          prompt = prompt.replace(
            new RegExp(placeholder, 'g'),
            typeof value === 'object' ? JSON.stringify(value) : value
          );
        }
      });
      
      // This would be the call to OpenAI or other AI service
      // const response = await openaiService.generateInsight(
      //   template.template.systemPrompt,
      //   prompt,
      //   template.template.outputFormat
      // );
      
      // Return placeholder response during development
      return {
        templateId: template.id,
        templateName: template.name,
        promptUsed: prompt,
        systemPrompt: template.template.systemPrompt,
        result: "AI-generated insight would appear here based on your data.",
        outputFormat: template.template.outputFormat,
        renderingStyle: template.template.renderingStyle,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error applying insight template:', error);
      throw new Error(`Failed to generate insight: ${error.message}`);
    }
  }
}

// Create singleton instance
const templateManager = new TemplateManager();

export default templateManager;