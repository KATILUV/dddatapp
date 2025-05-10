const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// For all other routes, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web build server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});