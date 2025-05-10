import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { registerRoutes } from './routes';
import { db } from './db';

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
    const httpServer = await registerRoutes(app);

    // Get port from environment or use default
    const PORT = process.env.PORT || 5000;

    // Start the server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to view the app`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();