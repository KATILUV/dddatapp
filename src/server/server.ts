import express from 'express';
import { json, urlencoded } from 'body-parser';
import path from 'path';
import cors from 'cors';
import { getAuthorizationUrl, handleOAuthCallback } from './oauth-service';
import { storage } from './storage';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../web-build')));

// API Routes
const apiRouter = express.Router();

// User endpoints
apiRouter.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// User preferences endpoints
apiRouter.get('/api/user/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found' });
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Failed to fetch preferences' });
  }
});

apiRouter.post('/api/user/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    const savedPreferences = await storage.setUserPreferences({
      userId,
      ...preferences
    });
    
    res.json(savedPreferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Failed to save preferences' });
  }
});

// Data source endpoints
apiRouter.get('/api/user/:userId/data-sources', async (req, res) => {
  try {
    const { userId } = req.params;
    const dataSources = await storage.getUserDataSources(userId);
    
    res.json(dataSources);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    res.status(500).json({ message: 'Failed to fetch data sources' });
  }
});

apiRouter.post('/api/user/:userId/data-sources', async (req, res) => {
  try {
    const { userId } = req.params;
    const dataSource = req.body;
    
    const savedDataSource = await storage.addDataSource({
      userId,
      ...dataSource
    });
    
    res.json(savedDataSource);
  } catch (error) {
    console.error('Error adding data source:', error);
    res.status(500).json({ message: 'Failed to add data source' });
  }
});

apiRouter.delete('/api/data-sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.removeDataSource(parseInt(id));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing data source:', error);
    res.status(500).json({ message: 'Failed to remove data source' });
  }
});

// OAuth endpoints
apiRouter.get('/api/oauth/authorize/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'Missing user ID' });
    }
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/callback`;
    const authUrl = getAuthorizationUrl(provider, userId.toString(), redirectUri);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to generate auth URL' });
  }
});

apiRouter.get('/api/oauth/callback', handleOAuthCallback);

// Insights endpoints
apiRouter.get('/api/user/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;
    const insights = await storage.getUserInsights(userId);
    
    res.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
});

apiRouter.get('/api/insights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const insight = await storage.getInsightById(parseInt(id));
    
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    res.json(insight);
  } catch (error) {
    console.error('Error fetching insight:', error);
    res.status(500).json({ message: 'Failed to fetch insight' });
  }
});

apiRouter.post('/api/user/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;
    const insight = req.body;
    
    const savedInsight = await storage.saveInsight({
      userId,
      ...insight
    });
    
    res.json(savedInsight);
  } catch (error) {
    console.error('Error saving insight:', error);
    res.status(500).json({ message: 'Failed to save insight' });
  }
});

apiRouter.delete('/api/insights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.removeInsight(parseInt(id));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing insight:', error);
    res.status(500).json({ message: 'Failed to remove insight' });
  }
});

// Register API routes
app.use(apiRouter);

// For any other request, send back the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web-build/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});

export default app;