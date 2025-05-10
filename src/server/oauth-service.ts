import { Request, Response } from 'express';
import { storage } from './storage';
import axios from 'axios';

// OAuth configuration for different providers
const oauthConfigs = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.readonly'],
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  twitter: {
    authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    scopes: ['tweet.read', 'users.read'],
    userInfoUrl: 'https://api.twitter.com/2/users/me'
  },
  spotify: {
    authorizeUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    scopes: ['user-read-private', 'user-read-email', 'user-top-read', 'user-read-recently-played'],
    userInfoUrl: 'https://api.spotify.com/v1/me'
  },
  // Add more providers as needed
};

// Generate OAuth authorization URL
export function getAuthorizationUrl(provider: string, userId: string, redirectUri: string): string {
  const config = oauthConfigs[provider];
  if (!config || !config.clientId) {
    throw new Error(`Provider '${provider}' not configured or missing client ID`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: Buffer.from(JSON.stringify({ provider, userId })).toString('base64'),
  });

  return `${config.authorizeUrl}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleOAuthCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }
    
    // Decode state
    const stateData = JSON.parse(Buffer.from(state.toString(), 'base64').toString());
    const { provider, userId } = stateData;
    
    // Get provider config
    const config = oauthConfigs[provider];
    if (!config) {
      throw new Error(`Provider '${provider}' not configured`);
    }
    
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      config.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/callback`,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Get user info from provider
    const userInfoResponse = await axios.get(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
      },
    });
    
    // Extract provider-specific user ID and display name
    let sourceId: string;
    let displayName: string;
    
    switch (provider) {
      case 'google':
        sourceId = userInfoResponse.data.sub;
        displayName = userInfoResponse.data.name || userInfoResponse.data.email;
        break;
      case 'twitter':
        sourceId = userInfoResponse.data.data.id;
        displayName = userInfoResponse.data.data.name || 'Twitter Account';
        break;
      case 'spotify':
        sourceId = userInfoResponse.data.id;
        displayName = userInfoResponse.data.display_name || userInfoResponse.data.id;
        break;
      default:
        sourceId = 'unknown';
        displayName = 'Connected Account';
    }
    
    // Create or update data source
    const dataSource = await storage.addDataSource({
      userId,
      sourceType: provider,
      sourceId,
      displayName,
      connected: true,
      lastSynced: new Date()
    });
    
    // Save OAuth token
    await storage.saveOAuthToken({
      dataSourceId: dataSource.id,
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      tokenType: tokenResponse.data.token_type || 'Bearer',
      scope: tokenResponse.data.scope,
      expiresAt: tokenResponse.data.expires_in 
        ? new Date(Date.now() + tokenResponse.data.expires_in * 1000) 
        : undefined
    });
    
    // Redirect to success page
    res.redirect(`/data-connection?success=true&provider=${provider}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/data-connection?error=auth_failed');
  }
}

// Refresh an expired token
export async function refreshToken(dataSourceId: number): Promise<string> {
  try {
    // Get the stored token
    const storedToken = await storage.getOAuthToken(dataSourceId);
    if (!storedToken || !storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Get the data source
    const [dataSource] = await storage.getUserDataSources(dataSourceId.toString());
    if (!dataSource) {
      throw new Error('Data source not found');
    }
    
    // Get provider config
    const config = oauthConfigs[dataSource.sourceType];
    if (!config) {
      throw new Error(`Provider '${dataSource.sourceType}' not configured`);
    }
    
    // Exchange refresh token for new access token
    const tokenResponse = await axios.post(
      config.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: storedToken.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Update the stored token
    await storage.updateOAuthToken(storedToken.id, {
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token || storedToken.refreshToken,
      expiresAt: tokenResponse.data.expires_in 
        ? new Date(Date.now() + tokenResponse.data.expires_in * 1000) 
        : undefined
    });
    
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}