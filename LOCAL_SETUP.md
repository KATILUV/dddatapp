# Local Development Setup Guide

This guide will help you set up the Solstice project for local development.

## Step 1: Download the Project

There are two ways to get the project files:

### Option 1: Run the Download Script (Recommended)

1. In Replit, run the download script to create a ZIP file:
   ```bash
   node download-project.js
   ```

2. Download the created ZIP file from the `output` directory in the Files panel

3. Extract the ZIP file to your preferred location

### Option 2: Manual Download

1. Download each important file manually from the Replit Files panel
2. Make sure to maintain the directory structure

## Step 2: Setup Local Environment

1. Navigate to the project directory in your terminal

2. Rename the package.json file:
   ```bash
   # Backup the original package.json just in case
   mv package.json package.json.replit
   
   # Use the local version
   mv package.json.local package.json
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual values
   # - Add your OpenAI API key
   # - Update the database connection string
   ```

## Step 3: Database Setup

1. Make sure you have PostgreSQL installed and running on your machine

2. Create a new database:
   ```sql
   CREATE DATABASE solstice;
   ```

3. Update the DATABASE_URL in your .env file with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/solstice
   ```

4. Initialize the database schema:
   ```bash
   npm run db:push
   ```

## Step 4: Start the Application

You can run the API server and Expo development server separately or together:

### Option 1: Run Everything Together (Recommended)

```bash
# Install concurrently if not already installed
npm install --save-dev concurrently

# Run both servers
npm run dev
```

### Option 2: Run Servers Separately

In one terminal:
```bash
npm run server
```

In another terminal:
```bash
npm start
```

## Step 5: Connect with Expo Go

1. Download the Expo Go app on your mobile device if you haven't already

2. Make sure your mobile device and computer are on the same WiFi network

3. Use one of these methods to connect:
   - Scan the QR code displayed in your terminal with your phone's camera (iOS) or Expo Go app (Android)
   - Press `w` to open in web browser
   - Press `a` to open in Android emulator (if installed)
   - Press `i` to open in iOS simulator (if on macOS with Xcode installed)

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript errors, try installing the specific React types version:
```bash
npm install --save-dev @types/react@18.0.38
```

### Metro Bundler Issues

If the bundler gets stuck or has issues:
```bash
# Clear cache and restart
npx expo start --clear
```

### Database Connection Issues

If you can't connect to the database:
1. Make sure PostgreSQL is running
2. Verify your DATABASE_URL is correct
3. Check that your PostgreSQL user has permission to create tables

### Network Issues

If your mobile device can't connect to the Expo server:
1. Make sure both devices are on the same WiFi network
2. Try using an Expo tunnel:
   ```bash
   npx expo start --tunnel
   ```

## Additional Commands

- Generate a fresh build: `npx expo export:web`
- Run TypeScript checks: `npx tsc --noEmit`
- Clean node modules (if needed): `rm -rf node_modules && npm install`