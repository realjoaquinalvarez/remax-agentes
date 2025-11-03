-- Create sync_jobs table
-- Tracks synchronization operations for monitoring and debugging

CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job details
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('manual_all', 'manual_single', 'manual_admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),

  -- Agent reference (NULL for bulk syncs)
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Triggered by
  triggered_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Progress tracking
  total_agents INTEGER DEFAULT 0,
  agents_synced INTEGER DEFAULT 0,
  agents_failed INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  failed_agent_ids UUID[],

  -- API usage
  api_calls_made INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_type ON sync_jobs(sync_type);
CREATE INDEX idx_sync_jobs_agent ON sync_jobs(agent_id);
CREATE INDEX idx_sync_jobs_created ON sync_jobs(created_at DESC);
CREATE INDEX idx_sync_jobs_triggered_by ON sync_jobs(triggered_by_user_id);

-- Create updated_at trigger
CREATE TRIGGER update_sync_jobs_updated_at
  BEFORE UPDATE ON sync_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE sync_jobs IS 'Tracks all Facebook data synchronization jobs for monitoring and audit';
COMMENT ON COLUMN sync_jobs.sync_type IS 'manual_all: Admin syncs all agents, manual_single: Single agent sync, manual_admin: Admin-triggered';
COMMENT ON COLUMN sync_jobs.status IS 'partial: Some agents succeeded, some failed';
COMMENT ON COLUMN sync_jobs.duration_seconds IS 'Auto-calculated from started_at and completed_at';
