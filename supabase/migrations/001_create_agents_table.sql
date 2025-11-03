-- Create agents table
-- Stores agent information and Facebook connection status

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Facebook connection info
  facebook_page_id VARCHAR(255),
  facebook_access_token TEXT, -- Will be encrypted by Supabase
  facebook_page_name VARCHAR(255),
  instagram_account_id VARCHAR(255),
  instagram_username VARCHAR(255),

  -- Connection status
  is_facebook_connected BOOLEAN DEFAULT FALSE,
  facebook_connected_at TIMESTAMP WITH TIME ZONE,
  facebook_token_expires_at TIMESTAMP WITH TIME ZONE,

  -- Sync tracking
  last_successful_sync TIMESTAMP WITH TIME ZONE,
  last_sync_attempt TIMESTAMP WITH TIME ZONE,
  consecutive_sync_failures INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_facebook_page_id ON agents(facebook_page_id);
CREATE INDEX idx_agents_last_sync ON agents(last_successful_sync DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE agents IS 'Stores RE/MAX agent information and Facebook/Instagram connection details';
COMMENT ON COLUMN agents.facebook_access_token IS 'Encrypted Facebook page access token (long-lived, 60 days)';
COMMENT ON COLUMN agents.consecutive_sync_failures IS 'Counter for consecutive failed syncs, reset on success';
