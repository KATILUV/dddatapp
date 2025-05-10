const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Import authentication and API functions are loaded dynamically
// since we're using TypeScript and need to compile first

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'web-build')));

// Set up routes (this will include authentication setup when built)
async function startServer() {
  try {
    // Simple direct server for now
    // We'll integrate the TypeScript routes once built
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to view the app`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// For any request that doesn't match a static file or API route, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'web-build', 'index.html'));
});

// Start the server
startServer().catch(console.error);