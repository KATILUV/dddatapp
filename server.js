const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from web-build
app.use(express.static(path.join(__dirname, 'web-build')));

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    hasOpenAiKey: !!process.env.OPENAI_API_KEY
  });
});

// Mock user data storage
let userData = {
  preferences: {
    theme: 'dark',
    notifications: true,
    dataRetention: 90 // days
  },
  dataSources: [
    { 
      id: 1, 
      name: 'Daily Journal', 
      type: 'journal',
      connected: true,
      lastSync: new Date().toISOString()
    },
    { 
      id: 2, 
      name: 'Health Metrics', 
      type: 'health',
      connected: true,
      lastSync: new Date().toISOString()
    },
    { 
      id: 3, 
      name: 'Social Media', 
      type: 'social',
      connected: false,
      lastSync: null
    }
  ],
  insights: [
    {
      id: 1,
      title: 'Weekly Reflection',
      content: 'Your journaling was more consistent this week compared to last week.',
      timestamp: new Date().toISOString(),
      source: 'journal',
      type: 'pattern'
    },
    {
      id: 2,
      title: 'Health Insight',
      content: 'There appears to be a correlation between your exercise routine and improved sleep quality.',
      timestamp: new Date().toISOString(),
      source: 'health',
      type: 'correlation'
    }
  ]
};

// User preferences endpoints
app.get('/api/preferences', (req, res) => {
  res.json(userData.preferences);
});

app.post('/api/preferences', (req, res) => {
  userData.preferences = { ...userData.preferences, ...req.body };
  res.json(userData.preferences);
});

// Data sources endpoints
app.get('/api/data-sources', (req, res) => {
  res.json(userData.dataSources);
});

app.post('/api/data-sources', (req, res) => {
  const { id } = req.body;
  
  // Check if source already exists
  const existingSource = userData.dataSources.find(source => source.id === id);
  if (existingSource) {
    return res.status(409).json({ 
      error: 'Data source already exists', 
      source: existingSource 
    });
  }
  
  const newSource = {
    ...req.body,
    connected: req.body.connected || false,
    lastSync: req.body.lastSync || new Date().toISOString()
  };
  
  userData.dataSources.push(newSource);
  res.status(201).json(newSource);
});

app.put('/api/data-sources/:id', (req, res) => {
  const id = req.params.id;
  const index = userData.dataSources.findIndex(source => source.id === id);
  
  if (index !== -1) {
    userData.dataSources[index] = { ...userData.dataSources[index], ...req.body };
    res.json(userData.dataSources[index]);
  } else {
    res.status(404).json({ error: 'Data source not found' });
  }
});

app.delete('/api/data-sources/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = userData.dataSources.length;
  userData.dataSources = userData.dataSources.filter(source => source.id !== id);
  
  if (userData.dataSources.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Data source not found' });
  }
});

// Data source data retrieval endpoint
app.get('/api/data-sources/:id/data', (req, res) => {
  const { id } = req.params;
  const { dataType, startDate, endDate } = req.query;
  
  const source = userData.dataSources.find(source => source.id === id);
  if (!source) {
    return res.status(404).json({ error: 'Data source not found' });
  }
  
  if (!source.connected) {
    return res.status(400).json({ error: 'Data source is not connected' });
  }
  
  // In a real implementation, this would fetch data from the external service
  // For now, return mock data based on the source and data type
  try {
    // Generate the mock data
    const mockData = generateMockData(source, dataType, { startDate, endDate });
    
    // Update last sync time
    const index = userData.dataSources.findIndex(s => s.id === id);
    if (index !== -1) {
      userData.dataSources[index].lastSync = new Date().toISOString();
    }
    
    res.json({
      source: source.id,
      dataType,
      timestamp: new Date().toISOString(),
      data: mockData
    });
  } catch (error) {
    console.error(`Error fetching data from source ${id}:`, error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});

// OAuth connection endpoint
app.post('/api/oauth/connect', (req, res) => {
  const { sourceId, redirectUrl } = req.body;
  
  const source = userData.dataSources.find(source => source.id === sourceId);
  if (!source) {
    return res.status(404).json({ error: 'Data source not found' });
  }
  
  // In a real implementation, this would initiate the OAuth flow
  // For now, simulate a successful connection
  res.json({
    status: 'connected',
    token: {
      access_token: `mock_access_token_${sourceId}`,
      refresh_token: `mock_refresh_token_${sourceId}`,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    }
  });
});

// Helper function to generate mock data for testing
function generateMockData(source, dataType, options = {}) {
  // This would be replaced with real data in a production environment
  const types = {
    'activity': [
      { timestamp: new Date().toISOString(), type: 'walking', duration: 30, distance: 2.5, calories: 120 },
      { timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'running', duration: 45, distance: 5, calories: 350 },
      { timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'yoga', duration: 60, calories: 200 }
    ],
    'sleep': [
      { date: new Date().toISOString().split('T')[0], duration: 7.5, quality: 0.8, deepSleep: 2.1, remSleep: 1.8 },
      { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], duration: 6.2, quality: 0.7, deepSleep: 1.5, remSleep: 1.2 },
      { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], duration: 8.0, quality: 0.9, deepSleep: 2.4, remSleep: 2.0 }
    ],
    'vitals': [
      { timestamp: new Date().toISOString(), heartRate: 68, bloodPressure: { systolic: 120, diastolic: 80 }, temperature: 98.6 },
      { timestamp: new Date(Date.now() - 86400000).toISOString(), heartRate: 72, bloodPressure: { systolic: 122, diastolic: 82 }, temperature: 98.4 },
      { timestamp: new Date(Date.now() - 172800000).toISOString(), heartRate: 65, bloodPressure: { systolic: 118, diastolic: 78 }, temperature: 98.7 }
    ],
    'nutrition': [
      { timestamp: new Date().toISOString(), meal: 'breakfast', calories: 450, protein: 22, carbs: 55, fat: 15 },
      { timestamp: new Date().toISOString(), meal: 'lunch', calories: 650, protein: 35, carbs: 70, fat: 20 },
      { timestamp: new Date().toISOString(), meal: 'dinner', calories: 550, protein: 30, carbs: 60, fat: 18 }
    ],
    'listening-history': [
      { timestamp: new Date().toISOString(), track: 'Shape of You', artist: 'Ed Sheeran', album: 'Divide', duration: 3.54 },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), track: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 3.22 },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), track: 'Dance Monkey', artist: 'Tones and I', album: 'The Kids Are Coming', duration: 3.29 }
    ],
    'favorites': [
      { track: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', addedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
      { track: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', addedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
      { track: 'Imagine', artist: 'John Lennon', album: 'Imagine', addedAt: new Date(Date.now() - 90 * 86400000).toISOString() }
    ],
    'pages': [
      { id: 'page1', title: 'Project Plan', lastEdited: new Date().toISOString() },
      { id: 'page2', title: 'Meeting Notes', lastEdited: new Date(Date.now() - 86400000).toISOString() },
      { id: 'page3', title: 'Ideas', lastEdited: new Date(Date.now() - 172800000).toISOString() }
    ],
    'tasks': [
      { id: 'task1', title: 'Complete project', status: 'in_progress', dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
      { id: 'task2', title: 'Review documentation', status: 'completed', completedAt: new Date().toISOString() },
      { id: 'task3', title: 'Schedule meeting', status: 'not_started', dueDate: new Date(Date.now() + 2 * 86400000).toISOString() }
    ],
    'tweets': [
      { id: 'tweet1', text: 'Just announced our new product!', createdAt: new Date().toISOString(), likes: 42, retweets: 12 },
      { id: 'tweet2', text: 'Excited to share my latest project.', createdAt: new Date(Date.now() - 86400000).toISOString(), likes: 23, retweets: 5 },
      { id: 'tweet3', text: 'Great workshop today.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), likes: 15, retweets: 2 }
    ],
    'locations': [
      { timestamp: new Date().toISOString(), latitude: 37.7749, longitude: -122.4194, name: 'San Francisco', duration: 120 },
      { timestamp: new Date(Date.now() - 86400000).toISOString(), latitude: 40.7128, longitude: -74.0060, name: 'New York', duration: 180 },
      { timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), latitude: 34.0522, longitude: -118.2437, name: 'Los Angeles', duration: 240 }
    ]
  };
  
  return types[dataType] || [];
}

// Insight endpoints
app.get('/api/insights', (req, res) => {
  res.json(userData.insights);
});

app.get('/api/insights/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const insight = userData.insights.find(item => item.id === id);
  
  if (insight) {
    res.json(insight);
  } else {
    res.status(404).json({ error: 'Insight not found' });
  }
});

// OpenAI integration for template-based insights
app.post('/api/generate-insight', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, format = 'markdown' } = req.body;
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'System prompt and user prompt are required' });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is missing' });
    }
    
    // Call OpenAI API
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
    
    // Extract a title from the content using a simple heuristic
    let title = 'AI Generated Insight';
    const content = response.data.choices[0].message.content;
    
    // Try to extract a title from markdown/text
    const firstLineMatch = content.match(/^#\s+(.+)$/) || content.match(/^(.+?)\n/);
    if (firstLineMatch) {
      title = firstLineMatch[1].trim().replace(/^#+\s+/, '');
      // Limit title length
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
    }
    
    // Save the generated insight
    const newInsight = {
      id: Date.now(),
      title,
      content,
      timestamp: new Date().toISOString(),
      source: 'ai-template',
      type: 'generated'
    };
    
    userData.insights.push(newInsight);
    
    // Return the result
    res.json({
      result: content,
      insight: newInsight
    });
  } catch (error) {
    console.error('Error generating insight:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate insight', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// Chat API endpoint for conversational interface
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, options = {} } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is missing' });
    }
    
    // Set up request parameters
    const requestParams = {
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 800
    };
    
    if (options.responseFormat) {
      requestParams.response_format = options.responseFormat;
    }
    
    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestParams,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    // Extract the response content
    const assistantResponse = response.data.choices[0].message.content;
    
    // Log the conversation for debugging/analytics
    if (messages.length >= 2) {
      const userMessage = messages[messages.length - 1].content;
      console.log(`Chat: User asked "${userMessage.substring(0, 50)}..." and received response.`);
    }
    
    // Return the result
    res.json({
      response: assistantResponse,
      model: response.data.model,
      usage: response.data.usage
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get chat response', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// Multi-source insight generation
app.post('/api/multi-source-insight', async (req, res) => {
  try {
    const { dataSources, templateId } = req.body;
    
    if (!dataSources || !templateId) {
      return res.status(400).json({ error: 'Data sources and template ID are required' });
    }
    
    // Fetch data from sources and format for the template
    // This is a simplified implementation
    const formattedData = {};
    
    // Format the data for the template
    // In a real implementation, this would process the data from each source
    Object.entries(dataSources).forEach(([key, value]) => {
      formattedData[key] = value;
    });
    
    // Use a placeholder for now
    // In a real implementation, we would load the template and apply it
    
    const newInsight = {
      id: Date.now(),
      title: 'Multi-Source Insight',
      content: `This insight was generated using template ${templateId} with data from ${Object.keys(dataSources).length} sources.`,
      timestamp: new Date().toISOString(),
      source: 'multi-source',
      type: 'complex',
      templateId
    };
    
    userData.insights.push(newInsight);
    
    res.json(newInsight);
  } catch (error) {
    console.error('Error generating multi-source insight:', error);
    res.status(500).json({ 
      error: 'Failed to generate multi-source insight', 
      details: error.message 
    });
  }
});

// For all other routes, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});