const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'web-build')));

// Add API endpoints for data
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Solstice API is running',
    version: '1.0.0'
  });
});

app.get('/api/data-sources', (req, res) => {
  // For now, return some sample data sources
  res.json([
    {
      id: 1,
      name: 'Google',
      sourceType: 'google',
      status: 'connected',
      lastSynced: new Date(),
      dataSize: 15000
    },
    {
      id: 2,
      name: 'Twitter',
      sourceType: 'twitter',
      status: 'disconnected',
      lastSynced: null,
      dataSize: 0
    },
    {
      id: 3,
      name: 'Spotify',
      sourceType: 'spotify',
      status: 'connected',
      lastSynced: new Date(),
      dataSize: 8500
    }
  ]);
});

app.get('/api/insights', (req, res) => {
  // For now, return some sample insights
  res.json([
    {
      id: 1,
      type: 'behavioral',
      title: 'Activity Patterns',
      summary: 'You tend to be most active online between 8pm and 11pm.',
      confidence: 85
    },
    {
      id: 2,
      type: 'creative',
      title: 'Content Themes',
      summary: 'Your content shows strong interest in technology and science fiction.',
      confidence: 92
    },
    {
      id: 3,
      type: 'emotional',
      title: 'Mood Analysis',
      summary: 'Your posts generally reflect a positive outlook with occasional peaks of excitement.',
      confidence: 78
    }
  ]);
});

// For all other GET requests, return the React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'web-build', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});