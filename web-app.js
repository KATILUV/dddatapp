const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// Create a simple HTML page that embeds images of the app
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solstice App Preview</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #0B0B23;
        color: #FFFFFF;
        margin: 0;
        padding: 20px;
        line-height: 1.6;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
      h1, h2 {
        font-weight: 300;
        letter-spacing: 2px;
      }
      h1 {
        font-size: 32px;
        margin-bottom: 40px;
        text-align: center;
      }
      h2 {
        font-size: 24px;
        margin-top: 40px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 10px;
      }
      .screens {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 30px;
        margin-top: 30px;
      }
      .screen {
        flex: 0 0 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(255,255,255,0.05);
        border-radius: 16px;
        padding: 20px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .screen:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      }
      .screen img {
        width: 100%;
        height: auto;
        border-radius: 12px;
        margin-bottom: 15px;
      }
      .screen-title {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
        text-align: center;
      }
      .section {
        margin-bottom: 60px;
      }
      .feature-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      .feature {
        background: rgba(255,255,255,0.05);
        padding: 20px;
        border-radius: 12px;
      }
      .feature h3 {
        margin-top: 0;
        font-weight: 500;
      }
      a.button {
        display: inline-block;
        background: linear-gradient(135deg, #7928CA, #FF0080);
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        text-decoration: none;
        font-weight: 500;
        margin-top: 20px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      a.button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 0, 128, 0.4);
      }
      .actions {
        display: flex;
        justify-content: center;
        margin-top: 40px;
        gap: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 60px;
      }
      .logo {
        font-size: 48px;
        font-weight: 700;
        letter-spacing: 8px;
        background: linear-gradient(135deg, #7928CA, #FF0080);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
      }
      .tagline {
        font-size: 20px;
        opacity: 0.8;
        max-width: 600px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">SOLSTICE</div>
        <div class="tagline">Own your data. Understand yourself.</div>
      </div>
      
      <section class="section">
        <h2>App Screens</h2>
        <div class="screens">
          <div class="screen">
            <img src="/images/home-screen.svg" alt="Home Screen">
            <p class="screen-title">Home</p>
          </div>
          <div class="screen">
            <img src="/images/chat-screen.svg" alt="Chat Screen">
            <p class="screen-title">Chat</p>
          </div>
          <div class="screen">
            <img src="/images/insights-screen.svg" alt="Insights Screen">
            <p class="screen-title">Insights</p>
          </div>
          <div class="screen">
            <img src="/images/data-screen.svg" alt="Data Connections">
            <p class="screen-title">Data Sources</p>
          </div>
          <div class="screen">
            <img src="/images/settings-screen.svg" alt="Settings">
            <p class="screen-title">Settings</p>
          </div>
        </div>
      </section>
      
      <section class="section">
        <h2>Onboarding Flow</h2>
        <div class="screens">
          <div class="screen">
            <img src="/images/name-input.svg" alt="Name Input">
            <p class="screen-title">Name Input</p>
          </div>
          <div class="screen">
            <img src="/images/tone-selection.svg" alt="Tone Selection">
            <p class="screen-title">Tone Selection</p>
          </div>
          <div class="screen">
            <img src="/images/intention-prompt.svg" alt="Intention Prompt">
            <p class="screen-title">Intention Setting</p>
          </div>
        </div>
      </section>
      
      <section class="section">
        <h2>Key Features</h2>
        <div class="feature-list">
          <div class="feature">
            <h3>Data Privacy</h3>
            <p>All your data stays private and secure, only used to generate insights for you.</p>
          </div>
          <div class="feature">
            <h3>AI Insights</h3>
            <p>Powered by OpenAI to generate meaningful, personalized insights from your data.</p>
          </div>
          <div class="feature">
            <h3>Multiple Data Sources</h3>
            <p>Connect various platforms to get a comprehensive view of your digital life.</p>
          </div>
          <div class="feature">
            <h3>Personalized Experience</h3>
            <p>Customize the app's tone and focus to match your preferences.</p>
          </div>
        </div>
      </section>
      
      <div class="actions">
        <a href="/test-openai" class="button">Try OpenAI Demo</a>
        <a href="/api/status" class="button">Check API Status</a>
      </div>
    </div>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web app preview running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});