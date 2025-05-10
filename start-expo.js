const { spawn } = require('child_process');
const fs = require('fs');

// Print a start message
console.log('Starting Expo tunnel...');
console.log('This script will attempt to start Expo with legacy dependency handling');

// Set the environment to bypass TypeScript prompts
process.env.EXPO_NO_TYPESCRIPT_SETUP = 'true';

// Create a child process for Expo
const expo = spawn('npx', ['expo', 'start', '--tunnel'], {
  env: { ...process.env, EXPO_NO_TYPESCRIPT_SETUP: 'true' },
  shell: true,
  stdio: 'inherit'
});

// Handle the process events
expo.on('error', (error) => {
  console.error('Failed to start Expo process:', error);
});

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
});

// Keep the main process running
process.stdin.resume();

console.log('Expo process started! Look for a QR code above to scan with Expo Go');
console.log('If you don\'t see a QR code, you may need to run this process locally');