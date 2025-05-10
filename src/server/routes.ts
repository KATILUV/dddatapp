import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences endpoints
  app.get('/api/user/:userId/preferences', isAuthenticated, async (req: any, res) => {
    try {
      // Ensure user can only access their own data
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { userId } = req.params;
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.json({ userId }); // Return empty preferences object
      }
      
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ message: 'Failed to fetch preferences' });
    }
  });

  app.post('/api/user/:userId/preferences', isAuthenticated, async (req: any, res) => {
    try {
      // Ensure user can only access their own data
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
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
  app.get('/api/user/:userId/data-sources', isAuthenticated, async (req: any, res) => {
    try {
      // Ensure user can only access their own data
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { userId } = req.params;
      const dataSources = await storage.getUserDataSources(userId);
      
      res.json(dataSources);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      res.status(500).json({ message: 'Failed to fetch data sources' });
    }
  });

  app.post('/api/user/:userId/data-sources', isAuthenticated, async (req: any, res) => {
    try {
      // Ensure user can only access their own data
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
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

  app.delete('/api/data-sources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const dataSourceId = parseInt(id);
      
      // Check if the data source belongs to the current user
      const [dataSource] = await storage.getUserDataSources(req.user.claims.sub);
      if (!dataSource) {
        return res.status(404).json({ message: 'Data source not found' });
      }
      
      await storage.removeDataSource(dataSourceId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing data source:', error);
      res.status(500).json({ message: 'Failed to remove data source' });
    }
  });

  // OAuth endpoints for third-party data connections
  app.get('/api/oauth/authorize/:provider', isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.params;
      const userId = (req as any).user.claims.sub;
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/callback`;
      
      // Use the OAuth service from our server/oauth-service.ts
      const authUrl = await import('./oauth-service').then(module => 
        module.getAuthorizationUrl(provider, userId, redirectUri)
      );
      
      res.json({ authUrl });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({ message: 'Failed to generate auth URL' });
    }
  });

  app.get('/api/oauth/callback', async (req, res) => {
    try {
      // Use the OAuth callback handler from our server/oauth-service.ts
      await import('./oauth-service').then(module => 
        module.handleOAuthCallback(req, res)
      );
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      res.redirect('/?error=auth_failed');
    }
  });

  // Insights endpoints
  app.get('/api/user/:userId/insights', isAuthenticated, async (req: any, res) => {
    try {
      // Ensure user can only access their own data
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { userId } = req.params;
      const insights = await storage.getUserInsights(userId);
      
      res.json(insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ message: 'Failed to fetch insights' });
    }
  });

  app.get('/api/insights/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const insight = await storage.getInsightById(parseInt(id));
      
      if (!insight) {
        return res.status(404).json({ message: 'Insight not found' });
      }
      
      // Ensure user can only access their own data
      if (req.user.claims.sub !== insight.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(insight);
    } catch (error) {
      console.error('Error fetching insight:', error);
      res.status(500).json({ message: 'Failed to fetch insight' });
    }
  });

  app.post('/api/user/:userId/insights', isAuthenticated, async (req: any, res) => {
    try {
      // Ensure user can only access their own data
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
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

  app.delete('/api/insights/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const insightId = parseInt(id);
      
      // Check if the insight belongs to the current user
      const insight = await storage.getInsightById(insightId);
      if (!insight) {
        return res.status(404).json({ message: 'Insight not found' });
      }
      
      if (req.user.claims.sub !== insight.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.removeInsight(insightId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing insight:', error);
      res.status(500).json({ message: 'Failed to remove insight' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}