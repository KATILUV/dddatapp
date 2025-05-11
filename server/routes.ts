const http = require('http');
const path = require('path');
const storage = require('./storage').storage;
const auth = require('./replitAuth');

async function registerRoutes(app) {
  // Auth middleware
  await auth.setupAuth(app);

  // API Routes
  
  // Authentication routes
  app.get('/api/auth/user', auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences routes
  app.get('/api/preferences', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || { userId });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.setUserPreferences({
        userId,
        ...req.body
      });
      res.json(preferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      res.status(500).json({ message: "Failed to save preferences" });
    }
  });

  // Data sources routes
  app.get('/api/data-sources', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const sources = await storage.getUserDataSources(userId);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.post('/api/data-sources', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const source = await storage.addDataSource({
        userId,
        ...req.body
      });
      res.json(source);
    } catch (error) {
      console.error("Error adding data source:", error);
      res.status(500).json({ message: "Failed to add data source" });
    }
  });

  app.put('/api/data-sources/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const sourceId = parseInt(req.params.id);
      const source = await storage.updateDataSource(sourceId, req.body);
      res.json(source);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  app.delete('/api/data-sources/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const sourceId = parseInt(req.params.id);
      
      // Verify ownership
      const source = await storage.getDataSourceById(sourceId);
      if (!source || source.userId !== userId) {
        return res.status(404).json({ message: "Data source not found" });
      }
      
      await storage.removeDataSource(sourceId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing data source:", error);
      res.status(500).json({ message: "Failed to remove data source" });
    }
  });
  
  // Get data source by ID
  app.get('/api/data-sources/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const sourceId = parseInt(req.params.id);
      
      // Get the data source
      const source = await storage.getDataSourceById(sourceId);
      
      // Verify ownership
      if (!source || source.userId !== userId) {
        return res.status(404).json({ message: "Data source not found" });
      }
      
      res.json(source);
    } catch (error) {
      console.error("Error fetching data source:", error);
      res.status(500).json({ message: "Failed to fetch data source" });
    }
  });
  
  // Refresh a data source (trigger a sync)
  app.post('/api/data-sources/:id/refresh', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const sourceId = parseInt(req.params.id);
      
      // Verify ownership
      const source = await storage.getDataSourceById(sourceId);
      if (!source || source.userId !== userId) {
        return res.status(404).json({ message: "Data source not found" });
      }
      
      const refreshedSource = await storage.refreshDataSource(sourceId);
      res.json(refreshedSource);
    } catch (error) {
      console.error("Error refreshing data source:", error);
      res.status(500).json({ message: "Failed to refresh data source" });
    }
  });
  
  // Schedule data source sync
  app.post('/api/data-sources/:id/schedule', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const sourceId = parseInt(req.params.id);
      const { frequency } = req.body;
      
      if (!frequency || !['hourly', 'daily', 'weekly', 'monthly'].includes(frequency)) {
        return res.status(400).json({ message: "Invalid frequency. Must be one of: hourly, daily, weekly, monthly" });
      }
      
      // Verify ownership
      const source = await storage.getDataSourceById(sourceId);
      if (!source || source.userId !== userId) {
        return res.status(404).json({ message: "Data source not found" });
      }
      
      const updatedSource = await storage.scheduleDataSourceSync(sourceId, frequency);
      res.json(updatedSource);
    } catch (error) {
      console.error("Error scheduling data source sync:", error);
      res.status(500).json({ message: "Failed to schedule data source sync" });
    }
  });
  
  // Get data sources by type
  app.get('/api/data-sources/type/:type', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const sourceType = req.params.type;
      
      const sources = await storage.getDataSourcesByType(userId, sourceType);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching data sources by type:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  // Insights routes
  app.get('/api/insights', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await storage.getUserInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.get('/api/insights/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const insightId = parseInt(req.params.id);
      const insight = await storage.getInsightById(insightId);
      if (!insight) {
        return res.status(404).json({ message: "Insight not found" });
      }
      res.json(insight);
    } catch (error) {
      console.error("Error fetching insight:", error);
      res.status(500).json({ message: "Failed to fetch insight" });
    }
  });

  // Status endpoint
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      message: 'Solstice API is running',
      version: '1.0.0'
    });
  });

  // For all other requests, serve the React app
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../web-build', 'index.html'));
  });

  const httpServer = createServer(app);
  return httpServer;
}