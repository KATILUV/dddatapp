const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();

// Serve static content
app.use(express.static(path.join(__dirname, 'public')));

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
          <li>Tap <span class="highlight">"Scan QR Code"</span> in the app</li>
          <li>Scan the QR code below</li>
          <li>Wait for the app to download and start</li>
        </ol>
      </div>
      
      <div class="status">
        Starting Expo server... <br>
        This may take a minute while the JavaScript bundles are prepared.
      </div>
      
      <div class="note">
        Note: The QR code will appear here automatically when the Expo server is ready.<br>
        Please wait a moment while it loads...
      </div>
      
      <a href="https://expo.dev/client" class="expo-link" target="_blank">Don't have Expo Go? Get it here</a>
    </div>
    
    <script>
      // Simple script to refresh the page every 10 seconds to check for the QR code
      setTimeout(() => {
        window.location.reload();
      }, 10000);
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
  
  // Start Expo in the background
  console.log('Starting Expo with tunneling enabled...');
  const expoProcess = exec('npx expo start --tunnel --non-interactive', (error, stdout, stderr) => {
    if (error) {
      console.error(`Expo error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Expo stderr: ${stderr}`);
      return;
    }
    console.log(`Expo stdout: ${stdout}`);
  });
  
  // Capture the output to look for the QR code or URL
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });
});