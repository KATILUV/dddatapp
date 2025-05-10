/**
 * Default insight templates
 * These templates are bundled with the application and provide the base functionality
 */

import { TEMPLATE_TYPES } from '../templateSchema';

// Helper function to create a template with consistent structure
const createTemplate = (id, name, description, template, icon) => ({
  id,
  name,
  description,
  type: TEMPLATE_TYPES.INSIGHT,
  tags: ['default'],
  author: 'Solstice',
  version: '1.0.0',
  dateCreated: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  isDefault: true,
  icon,
  template,
});

const defaultTemplates = [
  // Daily Reflection Template
  createTemplate(
    'daily-reflection',
    'Daily Reflection',
    'Analyze your day and identify patterns in activities, mood, and energy levels',
    {
      systemPrompt: 
        'You are a perceptive and empathetic AI companion helping users understand patterns in their daily activities, mood, and energy levels. ' +
        'Focus on identifying connections between behaviors and outcomes, highlighting potential areas for optimization. ' +
        'Be supportive and encouraging, offering practical suggestions while respecting the user\'s autonomy. ' +
        'Write in a conversational, friendly tone as if you were a caring friend.',
      
      promptTemplate: 
        'Based on the following daily data, please provide a thoughtful reflection about patterns, insights, and gentle suggestions:\n\n' +
        'Activities: {{activities}}\n' +
        'Mood: {{mood}}\n' +
        'Energy Level: {{energyLevel}}\n' +
        'Sleep: {{sleep}}\n' +
        'Notes: {{notes}}\n\n' +
        'Please identify: 1) Activity-mood correlations, 2) Energy patterns, 3) One small suggestion for improvement',
      
      requiredDataFields: ['activities', 'mood', 'energyLevel'],
      
      outputFormat: 'markdown',
      
      renderingStyle: {
        cardStyle: 'detailed',
        includeVisualizations: true,
        highlightKeyPoints: true,
      },
    },
    'ios-sunny-outline'
  ),
  
  // Health Patterns Template
  createTemplate(
    'health-patterns',
    'Health Patterns',
    'Analyze health data to identify patterns and potential improvements',
    {
      systemPrompt: 
        'You are a knowledgeable health insights companion helping users understand patterns in their health data. ' +
        'Focus on correlations between different health metrics, lifestyle choices, and outcomes. ' +
        'Provide evidence-based observations and suggestions, but be clear that you are not providing medical advice. ' +
        'Use a balanced, informative tone that empowers the user to make their own health decisions.',
      
      promptTemplate: 
        'Based on the following health data, please analyze patterns and provide gentle insights:\n\n' +
        'Exercise: {{exercise}}\n' +
        'Nutrition: {{nutrition}}\n' +
        'Sleep: {{sleep}}\n' +
        'Vitals: {{vitals}}\n' +
        'Symptoms: {{symptoms}}\n\n' +
        'Please identify: 1) Notable patterns, 2) Potential correlations between different metrics, ' +
        '3) General well-being observations, and 4) Areas that might benefit from attention',
      
      requiredDataFields: ['exercise', 'nutrition', 'sleep'],
      
      outputFormat: 'markdown',
      
      renderingStyle: {
        cardStyle: 'detailed',
        includeVisualizations: true,
        highlightKeyPoints: true,
      },
    },
    'ios-fitness-outline'
  ),
  
  // Creative Themes Template
  createTemplate(
    'creative-themes',
    'Creative Themes',
    'Identify recurring themes and patterns in your creative work',
    {
      systemPrompt: 
        'You are an insightful creative analyst helping users identify themes, motifs, and patterns in their creative work. ' +
        'Focus on drawing connections between different pieces, highlighting evolving interests, and noting unique stylistic elements. ' +
        'Be encouraging and constructive, emphasizing the user\'s creative strengths while gently suggesting areas for exploration. ' +
        'Write in an inspired, thoughtful tone that sparks further creativity.',
      
      promptTemplate: 
        'Based on the following creative work, please analyze the recurring themes, motifs, and stylistic elements:\n\n' +
        'Work Samples: {{samples}}\n' +
        'Medium/Format: {{medium}}\n' +
        'Time Period: {{timePeriod}}\n' +
        'Artist\'s Notes: {{notes}}\n\n' +
        'Please identify: 1) Recurring themes or subjects, 2) Stylistic patterns and evolution, ' +
        '3) Unique strengths, and 4) Potential directions for exploration',
      
      requiredDataFields: ['samples', 'medium'],
      
      outputFormat: 'markdown',
      
      renderingStyle: {
        cardStyle: 'detailed',
        includeVisualizations: false,
        highlightKeyPoints: true,
      },
    },
    'ios-color-palette-outline'
  ),
  
  // Productivity Insights Template
  createTemplate(
    'productivity-insights',
    'Productivity Insights',
    'Analyze your work patterns to optimize focus and efficiency',
    {
      systemPrompt: 
        'You are a perceptive productivity assistant helping users understand their work patterns, focus periods, and efficiency. ' +
        'Focus on identifying optimal working conditions, potential distractions, and strategies for improved productivity. ' +
        'Be practical and constructive, offering actionable suggestions tailored to the user\'s specific data. ' +
        'Write in a clear, direct tone that respects the user\'s time and goals.',
      
      promptTemplate: 
        'Based on the following productivity data, please provide insights and practical suggestions:\n\n' +
        'Tasks Completed: {{tasksCompleted}}\n' +
        'Work Sessions: {{workSessions}}\n' +
        'Focus Scores: {{focusScores}}\n' +
        'Environment: {{environment}}\n' +
        'Goals: {{goals}}\n\n' +
        'Please identify: 1) Peak productivity patterns, 2) Potential focus disruptors, ' +
        '3) Task efficiency insights, and 4) Specific, actionable suggestions for improvement',
      
      requiredDataFields: ['tasksCompleted', 'workSessions', 'focusScores'],
      
      outputFormat: 'markdown',
      
      renderingStyle: {
        cardStyle: 'detailed',
        includeVisualizations: true,
        highlightKeyPoints: true,
      },
    },
    'ios-trending-up-outline'
  ),
  
  // Social Interaction Patterns Template
  createTemplate(
    'social-patterns',
    'Social Interaction Patterns',
    'Analyze patterns in your social interactions and communications',
    {
      systemPrompt: 
        'You are an observant social insights companion helping users understand patterns in their social interactions and communications. ' +
        'Focus on identifying meaningful connection patterns, communication styles, and relationship dynamics. ' +
        'Be thoughtful and nuanced, acknowledging the complexity of human relationships. ' +
        'Write in a warm, considerate tone that respects the user\'s privacy and social preferences.',
      
      promptTemplate: 
        'Based on the following social interaction data, please provide thoughtful insights:\n\n' +
        'Communications: {{communications}}\n' +
        'Social Events: {{socialEvents}}\n' +
        'Relationship Notes: {{relationshipNotes}}\n' +
        'Energy Levels After Interactions: {{energyLevels}}\n\n' +
        'Please identify: 1) Patterns in social engagement, 2) Communication preferences and tendencies, ' +
        '3) Relationship dynamics, and 4) Potential insights for more fulfilling connections',
      
      requiredDataFields: ['communications', 'socialEvents'],
      
      outputFormat: 'markdown',
      
      renderingStyle: {
        cardStyle: 'detailed',
        includeVisualizations: false,
        highlightKeyPoints: true,
      },
    },
    'ios-people-outline'
  ),
];

module.exports = defaultTemplates;