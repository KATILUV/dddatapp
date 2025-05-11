-- Add new columns to data_sources table
ALTER TABLE data_sources 
ADD COLUMN IF NOT EXISTS next_sync_due TIMESTAMP,
ADD COLUMN IF NOT EXISTS sync_frequency VARCHAR DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS data_freshness INTEGER,
ADD COLUMN IF NOT EXISTS permission_scope JSONB,
ADD COLUMN IF NOT EXISTS error_message TEXT;