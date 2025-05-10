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
  const newSource = {
    id: Date.now(), // Simple ID generation
    ...req.body,
    connected: false,
    lastSync: null
  };
  userData.dataSources.push(newSource);
  res.status(201).json(newSource);
});

app.put('/api/data-sources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = userData.dataSources.findIndex(source => source.id === id);
  
  if (index !== -1) {
    userData.dataSources[index] = { ...userData.dataSources[index], ...req.body };
    res.json(userData.dataSources[index]);
  } else {
    res.status(404).json({ error: 'Data source not found' });
  }
});

app.delete('/api/data-sources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = userData.dataSources.length;
  userData.dataSources = userData.dataSources.filter(source => source.id !== id);
  
  if (userData.dataSources.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Data source not found' });
  }
});

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