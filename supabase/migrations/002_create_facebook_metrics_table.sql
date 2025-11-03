-- Create facebook_metrics_daily table
-- Stores daily snapshot of Facebook metrics for each agent

CREATE TABLE IF NOT EXISTS facebook_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,

  -- Page metrics
  followers INTEGER DEFAULT 0,
  follower_growth_rate DECIMAL(5,2) DEFAULT 0, -- Percentage

  -- Post metrics (aggregated for the day/period)
  posts_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  impressions_organic INTEGER DEFAULT 0,
  impressions_paid INTEGER DEFAULT 0,

  -- Engagement metrics
  total_engagements INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0, -- Percentage

  -- Click metrics (including WhatsApp)
  link_clicks INTEGER DEFAULT 0,
  post_clicks INTEGER DEFAULT 0,

  -- Lead tracking
  leads_estimated INTEGER DEFAULT 0,

  -- Platform breakdown (optional, can be null if not broken down)
  instagram_followers INTEGER,
  facebook_followers INTEGER,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one record per agent per day
  CONSTRAINT unique_agent_date UNIQUE (agent_id, metric_date)
);

-- Create indexes for fast queries
CREATE INDEX idx_fb_metrics_agent_id ON facebook_metrics_daily(agent_id);
CREATE INDEX idx_fb_metrics_date ON facebook_metrics_daily(metric_date DESC);
CREATE INDEX idx_fb_metrics_agent_date ON facebook_metrics_daily(agent_id, metric_date DESC);

-- Create updated_at trigger
CREATE TRIGGER update_fb_metrics_updated_at
  BEFORE UPDATE ON facebook_metrics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE facebook_metrics_daily IS 'Daily snapshot of Facebook/Instagram metrics per agent';
COMMENT ON COLUMN facebook_metrics_daily.engagement_rate IS 'Calculated as (total_engagements / impressions) * 100';
COMMENT ON COLUMN facebook_metrics_daily.link_clicks IS 'Total clicks on links including WhatsApp buttons';
COMMENT ON COLUMN facebook_metrics_daily.leads_estimated IS 'Estimated leads based on engagement patterns';
