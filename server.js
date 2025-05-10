const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'web-build')));

// For GET requests to the root, send back index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'web-build', 'index.html'));
});

// Add a simple API endpoint to test the server
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});