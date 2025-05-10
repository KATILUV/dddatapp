import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './shared/schema';

async function pushSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log('Creating database schema...');
    
    // Create sessions table first
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create user_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR DEFAULT 'dark',
        communication_style VARCHAR,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        data_processing_enabled BOOLEAN DEFAULT TRUE,
        enhanced_profiling_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create data_sources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS data_sources (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        source_type VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'disconnected',
        last_synced TIMESTAMP,
        data_size INTEGER,
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create oauth_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        id SERIAL PRIMARY KEY,
        data_source_id INTEGER NOT NULL UNIQUE REFERENCES data_sources(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        token_type VARCHAR DEFAULT 'Bearer',
        scope VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create insights table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS insights (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR NOT NULL,
        title VARCHAR NOT NULL,
        summary TEXT NOT NULL,
        details JSONB,
        confidence INTEGER,
        sources JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

pushSchema().catch((err) => {
  console.error('Failed to push schema:', err);
  process.exit(1);
});