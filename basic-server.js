const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // In-memory data store (reset on server restart)
  const dataSources = [
    {
      id: 1,
      name: 'Google',
      sourceType: 'google',
      status: 'connected',
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      dataSize: 15000
    },
    {
      id: 2,
      name: 'Twitter',
      sourceType: 'twitter',
      status: 'disconnected',
      lastSynced: null,
      createdAt: new Date().toISOString(),
      dataSize: 0
    },
    {
      id: 3,
      name: 'Spotify',
      sourceType: 'spotify',
      status: 'connected',
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      dataSize: 8500
    }
  ];
  
  // Helper to parse JSON from requests
  const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    });
  };

  // Handle API requests
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Solstice API is running',
      version: '1.0.0'
    }));
    return;
  }
  
  // GET data sources
  if (req.url === '/api/data-sources' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dataSources));
    return;
  }
  
  // POST new data source
  if (req.url === '/api/data-sources' && req.method === 'POST') {
    getRequestBody(req)
      .then(data => {
        const newId = dataSources.length > 0 ? Math.max(...dataSources.map(s => s.id)) + 1 : 1;
        const newSource = {
          id: newId,
          name: data.name || 'Unnamed Source',
          sourceType: data.sourceType || 'unknown',
          status: data.status || 'connected',
          lastSynced: data.lastSynced || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          dataSize: data.dataSize || 0
        };
        
        dataSources.push(newSource);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newSource));
      })
      .catch(error => {
        console.error('Error parsing request body:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      });
    return;
  }
  
  // DELETE data source
  if (req.url.match(/^\/api\/data-sources\/\d+$/) && req.method === 'DELETE') {
    const id = parseInt(req.url.split('/').pop());
    const index = dataSources.findIndex(s => s.id === id);
    
    if (index !== -1) {
      const deleted = dataSources.splice(index, 1)[0];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deleted }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Data source not found' }));
    }
    return;
  }
  
  if (req.url === '/api/insights') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
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
    ]));
    return;
  }
  
  // User authentication endpoints
  if (req.url === '/api/auth/user') {
    // For simplicity, always return a mock user
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: '1',
      username: 'demouser',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      profileImageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=a894ff&color=fff'
    }));
    return;
  }
  
  // Handle root requests
  if (req.url === '/' || req.url === '/index.html') {
    // Try to serve the index.html file
    const filePath = path.join(__dirname, 'web-build', 'index.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // If index.html doesn't exist, send a basic HTML page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Solstice - Own your data. Understand yourself.</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #1a1a2e;
                  color: #fff;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  text-align: center;
                }
                .container {
                  max-width: 800px;
                  padding: 40px;
                  background-color: rgba(42, 42, 68, 0.8);
                  border-radius: 16px;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                  backdrop-filter: blur(10px);
                }
                h1 {
                  font-size: 48px;
                  margin-bottom: 20px;
                  color: #a894ff;
                }
                p {
                  font-size: 18px;
                  line-height: 1.6;
                  margin-bottom: 30px;
                }
                .api-link {
                  display: inline-block;
                  background-color: #a894ff;
                  color: #1a1a2e;
                  padding: 12px 24px;
                  border-radius: 30px;
                  text-decoration: none;
                  font-weight: bold;
                  margin: 10px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>SOLSTICE</h1>
                <p>Own your data. Understand yourself.</p>
                <p>The server is running. Try these API endpoints:</p>
                <a href="/api/status" class="api-link">API Status</a>
                <a href="/api/data-sources" class="api-link">Data Sources</a>
                <a href="/api/insights" class="api-link">Insights</a>
              </div>
            </body>
          </html>
        `);
      } else {
        // If index.html exists, serve it
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
    return;
  }
  
  // Check if the request is for a static file
  if (req.url.startsWith('/static/') || req.url.includes('.')) {
    const filePath = path.join(__dirname, 'web-build', req.url);
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // If file doesn't exist, return 404
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Determine content type based on file extension
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        
        switch (ext) {
          case '.html':
            contentType = 'text/html';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.js':
            contentType = 'text/javascript';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
    return;
  }
  
  // If no route matches, return 404
  res.writeHead(404);
  res.end('Not found');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});