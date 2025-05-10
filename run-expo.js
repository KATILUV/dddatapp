const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const app = express();

// Global variables to store Expo information
let expoUrl = '';
let expoUrlLastUpdated = null;
let expoStatus = 'Starting...';
let expoLogs = [];
const MAX_LOGS = 100; // Maximum number of log lines to keep

// Serve static content
app.use(express.static(path.join(__dirname, 'public')));

// Create a directory for temporary files if it doesn't exist
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// Create a public directory for static assets
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Route to serve QR code image
app.get('/qr-code', async (req, res) => {
  if (!expoUrl) {
    return res.status(404).send('Expo URL not available yet');
  }
  
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(expoUrl, { 
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Extract base64 data
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    
    // Send the image
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Error generating QR code');
  }
});

// Create a route that displays the QR code and instructions
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solstice - Expo QR Code</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #0B0B23;
        color: #FFFFFF;
        margin: 0;
        padding: 30px;
        line-height: 1.6;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 90vh;
      }
      .container {
        max-width: 800px;
        text-align: center;
      }
      h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
        letter-spacing: 6px;
        background: linear-gradient(135deg, #7928CA, #FF0080);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .tagline {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.8;
      }
      .steps {
        background: rgba(255,255,255,0.05);
        border-radius: 16px;
        padding: 30px;
        margin-bottom: 30px;
        text-align: left;
      }
      .steps h2 {
        margin-top: 0;
        font-weight: 500;
      }
      .steps ol {
        margin-bottom: 0;
      }
      .steps li {
        margin-bottom: 15px;
      }
      .steps li:last-child {
        margin-bottom: 0;
      }
      .expo-link {
        display: inline-block;
        background: #fff;
        color: #0B0B23;
        padding: 12px 24px;
        border-radius: 30px;
        text-decoration: none;
        font-weight: 500;
        margin-top: 20px;
        transition: transform 0.2s ease;
      }
      .expo-link:hover {
        transform: translateY(-2px);
      }
      .note {
        margin-top: 30px;
        font-size: 0.9rem;
        opacity: 0.7;
      }
      .qr-code {
        margin: 30px 0;
        padding: 20px;
        background: white;
        border-radius: 10px;
        display: inline-block;
      }
      .qr-code img {
        width: 250px;
        height: 250px;
      }
      .status {
        margin-top: 20px;
        padding: 15px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
      }
      .highlight {
        color: #FF0080;
        font-weight: 500;
      }
      .url-box {
        background: rgba(255,255,255,0.1);
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        word-break: break-all;
      }
      .manual-option {
        margin-top: 40px;
        padding: 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 16px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>SOLSTICE</h1>
      <div class="tagline">Own your data. Understand yourself.</div>
      
      <div class="steps">
        <h2>To view the app on your device:</h2>
        <ol>
          <li>Open <span class="highlight">Expo Go</span> on your device</li>
          <li>Tap <span class="highlight">"Enter URL manually"</span> in the app</li>
          <li>Enter the URL below</li>
          <li>Alternately, set up a development build by scanning the QR code when available</li>
        </ol>
      </div>
      
      <div class="status">
        ${expoStatus} <br>
        ${expoUrlLastUpdated ? `Last updated: ${new Date(expoUrlLastUpdated).toLocaleTimeString()}` : ''}
        <a href="/logs" style="display:block; margin-top:10px; color:#FF0080; text-decoration:underline;">View Expo Logs</a>
      </div>
      
      ${expoUrl ? `
        <div class="manual-option">
          <h3>Enter this URL in Expo Go:</h3>
          <div class="url-box">${expoUrl}</div>
          <p>Copy this URL and enter it manually in the Expo Go app.</p>
          
          <h3>Or scan this QR code:</h3>
          <div class="qr-code">
            <img src="/qr-code?t=${Date.now()}" alt="QR Code for Expo URL" />
          </div>
          <p>Open Expo Go and scan this QR code to connect to the app.</p>
        </div>
      ` : `
        <div class="note">
          Waiting for Expo to generate the URL...<br>
          This may take a minute while the JavaScript bundles are prepared.
        </div>
      `}
      
      <a href="https://expo.dev/client" class="expo-link" target="_blank">Don't have Expo Go? Get it here</a>
    </div>
    
    <script>
      // Refresh the page every 10 seconds to check for updates
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Start the server
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Expo helper server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the QR code when it's ready`);
  
  // Create a route to get current status via API
  app.get('/api/status', (req, res) => {
    res.json({
      expoUrl,
      expoStatus,
      lastUpdated: expoUrlLastUpdated
    });
  });
  
  // Create a route to view all Expo logs
  app.get('/logs', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Expo Logs</title>
      <style>
        body {
          font-family: monospace;
          background-color: #1a1a1a;
          color: #f0f0f0;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
        }
        .log-container {
          background-color: #121212;
          border-radius: 4px;
          padding: 15px;
          overflow-x: auto;
        }
        .log-line {
          margin: 5px 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        h1 {
          margin-top: 0;
          color: #e0e0e0;
        }
        .url {
          background-color: #2a2a2a;
          color: #90ee90;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
          word-break: break-all;
        }
        .back-link {
          display: inline-block;
          margin-top: 20px;
          color: #90ee90;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .refresh {
          background-color: #333;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        .refresh:hover {
          background-color: #444;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Expo Logs</h1>
        <button class="refresh" onclick="location.reload()">Refresh Logs</button>
      </div>
      
      ${expoUrl ? `<div class="url">Expo URL: ${expoUrl}</div>` : ''}
      
      <div class="log-container">
        ${expoLogs.map(log => `<div class="log-line">${log}</div>`).join('')}
      </div>
      
      <a href="/" class="back-link">← Back to QR Code</a>
      
      <script>
        // Auto-refresh logs every 5 seconds
        setTimeout(() => {
          location.reload();
        }, 5000);
      </script>
    </body>
    </html>
    `;
    
    res.send(html);
  });
  
  // Start Expo in the background using spawn to better capture output
  console.log('Starting Expo with tunneling enabled...');
  expoStatus = 'Starting Expo server...';
  
  // Set environment variable for non-interactive mode
  const env = {
    ...process.env,
    CI: '1',
    EXPO_NO_TYPESCRIPT_SETUP: 'true',
    EXPO_TUNNEL_AUTOINSTALL: 'true'
  };
  
  const expoProcess = spawn('npx', ['expo', 'start', '--tunnel'], { env });
  
  // Capture the output to look for the QR code or URL
  expoProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Expo: ${output}`);
    
    // Store logs
    output.split('\n').filter(line => line.trim() !== '').forEach(line => {
      expoLogs.unshift(`${new Date().toLocaleTimeString()}: ${line}`);
      // Keep log size manageable
      if (expoLogs.length > MAX_LOGS) {
        expoLogs.pop();
      }
    });
    
    // Look for any URL in the output - be more permissive to catch all possible formats
    const tunnelUrlMatch = output.match(/https:\/\/[a-z0-9-]+\.expo\.dev\/[a-z0-9\-_\/]+/i) || 
                         output.match(/https:\/\/[a-z0-9-]+\.expo\.dev/i) || 
                         output.match(/exp:\/\/[a-z0-9.-]+\.exp\.dev/i) ||
                         output.match(/exp:\/\/\d+\.\d+\.\d+\.\d+:\d+/i) ||
                         output.match(/exp:\/\/[a-z0-9\-_.]+/i) ||
                         output.match(/http:\/\/localhost:19000/i);
    
    if (tunnelUrlMatch) {
      expoUrl = tunnelUrlMatch[0];
      expoUrlLastUpdated = Date.now();
      expoStatus = 'Expo tunnel ready!';
      console.log(`Found Expo URL: ${expoUrl}`);
      
      // Generate a QR code and save it to the public directory
      try {
        QRCode.toFile(path.join(publicDir, 'expo-qr.png'), expoUrl, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 300
        });
        console.log('QR code generated successfully');
      } catch (err) {
        console.error('Error generating QR code file:', err);
      }
    }
    
    // Update status based on output indicators
    if (output.includes('Starting Metro Bundler')) {
      expoStatus = 'Metro Bundler starting...';
    } else if (output.includes('Tunnel connected')) {
      expoStatus = 'Tunnel connected, preparing app...';
    } else if (output.includes('Tunnel ready')) {
      expoStatus = 'Tunnel ready! Waiting for JS bundle...';
    }
  });
  
  expoProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.error(`Expo error: ${errorOutput}`);
    
    // Store error logs with error indicator
    errorOutput.split('\n').filter(line => line.trim() !== '').forEach(line => {
      expoLogs.unshift(`${new Date().toLocaleTimeString()}: [ERROR] ${line}`);
      // Keep log size manageable
      if (expoLogs.length > MAX_LOGS) {
        expoLogs.pop();
      }
    });
    
    if (errorOutput.includes('--non-interactive is not supported')) {
      // That's fine, we're handling it with CI=1
    } else {
      expoStatus = `Error: ${errorOutput.slice(0, 100)}...`;
    }
  });
  
  expoProcess.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
    expoStatus = `Expo process exited with code ${code}. Please restart.`;
  });
});