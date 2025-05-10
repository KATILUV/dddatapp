/**
 * Template schema definition
 * Defines the structure and validation rules for templates
 */

// Template types
export const TEMPLATE_TYPES = {
  INSIGHT: 'insight',
  VISUALIZATION: 'visualization',
  THEME: 'theme',
  DATA_SOURCE: 'dataSource',
  NOTIFICATION: 'notification',
};

// Template metadata validation schema
export const templateMetadataSchema = {
  id: {
    type: 'string',
    required: true,
    description: 'Unique identifier for the template',
  },
  name: {
    type: 'string',
    required: true,
    description: 'Human-readable name of the template',
  },
  description: {
    type: 'string',
    required: true,
    description: 'Description of what the template does',
  },
  type: {
    type: 'string',
    required: true,
    enum: Object.values(TEMPLATE_TYPES),
    description: 'Type of template',
  },
  tags: {
    type: 'array',
    items: 'string',
    description: 'Tags for categorizing the template',
  },
  author: {
    type: 'string',
    description: 'Creator of the template',
  },
  version: {
    type: 'string',
    default: '1.0.0',
    description: 'Version of the template',
  },
  dateCreated: {
    type: 'string',
    format: 'date-time',
    description: 'Date when the template was created',
  },
  lastModified: {
    type: 'string',
    format: 'date-time',
    description: 'Date when the template was last modified',
  },
  isDefault: {
    type: 'boolean',
    default: false,
    description: 'Whether this is a default template',
  },
  icon: {
    type: 'string',
    description: 'Icon name for the template (from Ionicons)',
  },
  previewImage: {
    type: 'string',
    description: 'URL or base64 of a preview image',
  },
};

// Insight template schema
export const insightTemplateSchema = {
  ...templateMetadataSchema,
  template: {
    type: 'object',
    required: true,
    properties: {
      // System prompt used to set the AI's behavior
      systemPrompt: {
        type: 'string',
        required: true,
      },
      // Prompt template with placeholders for data
      promptTemplate: {
        type: 'string',
        required: true,
      },
      // Data fields required by this template
      requiredDataFields: {
        type: 'array',
        items: 'string',
      },
      // Output format (markdown, json, structured)
      outputFormat: {
        type: 'string',
        enum: ['markdown', 'json', 'structured'],
        default: 'markdown',
      },
      // Style for rendering the insight
      renderingStyle: {
        type: 'object',
        properties: {
          cardStyle: {
            type: 'string',
            enum: ['minimal', 'detailed', 'interactive'],
            default: 'detailed',
          },
          includeVisualizations: {
            type: 'boolean',
            default: true,
          },
          highlightKeyPoints: {
            type: 'boolean',
            default: true,
          },
        },
      },
      // Example input data for testing
      sampleInput: {
        type: 'object',
      },
      // Example output for preview
      sampleOutput: {
        type: 'string',
      },
    },
  },
};

// Validate a template against its schema
export function validateTemplate(template, schema = insightTemplateSchema) {
  // Very simple validation for now
  const errors = [];
  
  // Check required fields
  Object.entries(schema).forEach(([key, config]) => {
    if (config.required && !template[key]) {
      errors.push(`Missing required field: ${key}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Create a new template with defaults
export function createTemplateBase(type = TEMPLATE_TYPES.INSIGHT) {
  return {
    id: `template-${Date.now()}`,
    name: 'New Template',
    description: 'Template description',
    type,
    tags: [],
    author: 'User',
    version: '1.0.0',
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isDefault: false,
  };
}