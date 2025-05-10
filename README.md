# Solstice - AI Data Insights Companion

Solstice is a mobile AI companion that helps you collect, store, and reflect on your personal data to generate meaningful insights. It's designed to help users understand themselves better through their data, offering a private alternative to big tech companies' data collection practices.

## Features

- 🧠 AI-powered data analysis and insights
- 🔒 Privacy-focused data management
- 📊 Comprehensive data visualization tools
- 🎨 Modern glassmorphic design
- 📱 Mobile-first experience with React Native
- 📷 QR code generation for easy sharing

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app installed on your mobile device

### Installation

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd solstice
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

4. Run the development server:
   ```bash
   npx expo start
   ```

5. Connect with Expo Go:
   - Scan the QR code with your mobile device's camera (iOS) or Expo Go app (Android)
   - Or press `w` to open in web browser
   - Or press `a` to open in Android emulator (if installed)
   - Or press `i` to open in iOS simulator (if on macOS with Xcode installed)

### Troubleshooting

If you encounter issues with running Expo Go:

1. Try clearing the Metro bundler cache:
   ```bash
   npx expo start --clear
   ```

2. Make sure your mobile device and laptop are on the same WiFi network

3. If you see TypeScript errors, you can install the correct version:
   ```bash
   npm install --save-dev @types/react@18.0.38
   ```

4. If you encounter database connection issues, make sure your PostgreSQL instance is running and the connection string in your `.env` file is correct.

## Project Structure

```
solstice/
├── assets/              # Static assets (images, fonts)
├── server/              # Backend server files
│   ├── db.ts            # Database configuration
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage implementation
│   └── server.ts        # Main server file
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema definitions
├── src/                 # Frontend React Native code
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   └── services/        # API clients and services
├── App.js               # Main app entry point
├── app.json             # Expo configuration
└── package.json         # Project dependencies
```

## Working with the API

The app includes a simple API server that handles data management and AI-powered insights:

- `GET /api/insights` - Fetches all insights
- `GET /api/insights/:id` - Fetches a specific insight
- `GET /api/preferences` - Fetches user preferences
- `POST /api/preferences` - Updates user preferences
- `GET /api/data-sources` - Fetches all data sources
- `POST /api/data-sources` - Adds a new data source
- `PUT /api/data-sources/:id` - Updates a data source
- `DELETE /api/data-sources/:id` - Removes a data source

To start both the API server and Expo together:

1. Start the API server:
   ```bash
   node server.js
   ```

2. In a separate terminal, start Expo:
   ```bash
   npx expo start
   ```

## Database Setup

The app uses PostgreSQL for data storage. To set up the database locally:

1. Make sure PostgreSQL is installed and running on your machine
2. Set the DATABASE_URL environment variable in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/solstice
   ```
3. Initialize the database schema:
   ```bash
   npm run db:push
   ```

## Technologies Used

- **Frontend**: React Native, Expo, React Navigation
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI API
- **Authentication**: Replit Auth (for online version)

## License

[MIT License](LICENSE)