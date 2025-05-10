"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const oauth_service_1 = require("./oauth-service");
const storage_1 = require("./storage");
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
app.use((0, body_parser_1.urlencoded)({ extended: true }));
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../web-build')));
// API Routes
const apiRouter = express_1.default.Router();
// User endpoints
apiRouter.get('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await storage_1.storage.getUser(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});
// User preferences endpoints
apiRouter.get('/api/user/:userId/preferences', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = await storage_1.storage.getUserPreferences(userId);
        if (!preferences) {
            return res.status(404).json({ message: 'Preferences not found' });
        }
        res.json(preferences);
    }
    catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: 'Failed to fetch preferences' });
    }
});
apiRouter.post('/api/user/:userId/preferences', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;
        const savedPreferences = await storage_1.storage.setUserPreferences({
            userId,
            ...preferences
        });
        res.json(savedPreferences);
    }
    catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ message: 'Failed to save preferences' });
    }
});
// Data source endpoints
apiRouter.get('/api/user/:userId/data-sources', async (req, res) => {
    try {
        const { userId } = req.params;
        const dataSources = await storage_1.storage.getUserDataSources(userId);
        res.json(dataSources);
    }
    catch (error) {
        console.error('Error fetching data sources:', error);
        res.status(500).json({ message: 'Failed to fetch data sources' });
    }
});
apiRouter.post('/api/user/:userId/data-sources', async (req, res) => {
    try {
        const { userId } = req.params;
        const dataSource = req.body;
        const savedDataSource = await storage_1.storage.addDataSource({
            userId,
            ...dataSource
        });
        res.json(savedDataSource);
    }
    catch (error) {
        console.error('Error adding data source:', error);
        res.status(500).json({ message: 'Failed to add data source' });
    }
});
apiRouter.delete('/api/data-sources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await storage_1.storage.removeDataSource(parseInt(id));
        res.json({ success: true });
    }
    catch (error) {
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
        const authUrl = (0, oauth_service_1.getAuthorizationUrl)(provider, userId.toString(), redirectUri);
        res.json({ authUrl });
    }
    catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ message: error.message || 'Failed to generate auth URL' });
    }
});
apiRouter.get('/api/oauth/callback', oauth_service_1.handleOAuthCallback);
// Insights endpoints
apiRouter.get('/api/user/:userId/insights', async (req, res) => {
    try {
        const { userId } = req.params;
        const insights = await storage_1.storage.getUserInsights(userId);
        res.json(insights);
    }
    catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({ message: 'Failed to fetch insights' });
    }
});
apiRouter.get('/api/insights/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const insight = await storage_1.storage.getInsightById(parseInt(id));
        if (!insight) {
            return res.status(404).json({ message: 'Insight not found' });
        }
        res.json(insight);
    }
    catch (error) {
        console.error('Error fetching insight:', error);
        res.status(500).json({ message: 'Failed to fetch insight' });
    }
});
apiRouter.post('/api/user/:userId/insights', async (req, res) => {
    try {
        const { userId } = req.params;
        const insight = req.body;
        const savedInsight = await storage_1.storage.saveInsight({
            userId,
            ...insight
        });
        res.json(savedInsight);
    }
    catch (error) {
        console.error('Error saving insight:', error);
        res.status(500).json({ message: 'Failed to save insight' });
    }
});
apiRouter.delete('/api/insights/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await storage_1.storage.removeInsight(parseInt(id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error removing insight:', error);
        res.status(500).json({ message: 'Failed to remove insight' });
    }
});
// Register API routes
app.use(apiRouter);
// For any other request, send back the React app
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../web-build/index.html'));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
});
exports.default = app;
