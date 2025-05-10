"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const db = require('./db');
// Initialize Express app
const app = express();
// Middleware
app.use(bodyParser.json());
app.use(cors());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../web-build')));
async function startServer() {
    try {
        // Register routes and get HTTP server instance
        const httpServer = await routes.registerRoutes(app);
        // Get port from environment or use default
        const PORT = process.env.PORT || 5000;
        // Start the server
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT} to view the app`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Start the server
startServer();
