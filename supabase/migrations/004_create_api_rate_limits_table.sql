-- Create api_rate_limits table
-- Tracks API usage per hour window to prevent hitting Facebook rate limits

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hour window (rounded to start of hour)
  hour_window TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Usage tracking
  calls_made INTEGER DEFAULT 0,
  max_calls_allowed INTEGER DEFAULT 200, -- Base limit per hour

  -- Details
  last_call_at TIMESTAMP WITH TIME ZONE,
  sync_job_id UUID REFERENCES sync_jobs(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one record per hour window
  CONSTRAINT unique_hour_window UNIQUE (hour_window)
);

-- Create indexes
CREATE INDEX idx_rate_limits_hour ON api_rate_limits(hour_window DESC);
CREATE INDEX idx_rate_limits_sync_job ON api_rate_limits(sync_job_id);

-- Create updated_at trigger
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get current hour window
CREATE OR REPLACE FUNCTION get_current_hour_window()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN date_trunc('hour', NOW());
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if we can make API calls
CREATE OR REPLACE FUNCTION can_make_api_calls(calls_needed INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_hour TIMESTAMP WITH TIME ZONE;
  current_usage INTEGER;
  max_allowed INTEGER;
BEGIN
  current_hour := get_current_hour_window();

  -- Get current usage for this hour
  SELECT
    COALESCE(calls_made, 0),
    COALESCE(max_calls_allowed, 200)
  INTO current_usage, max_allowed
  FROM api_rate_limits
  WHERE hour_window = current_hour;

  -- If no record exists, we can make calls
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;

  -- Check if we have budget
  RETURN (current_usage + calls_needed) <= max_allowed;
END;
$$ LANGUAGE plpgsql;

-- Helper function to increment API call counter
CREATE OR REPLACE FUNCTION increment_api_calls(calls_made_count INTEGER DEFAULT 1)
RETURNS VOID AS $$
DECLARE
  current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  current_hour := get_current_hour_window();

  INSERT INTO api_rate_limits (hour_window, calls_made, last_call_at)
  VALUES (current_hour, calls_made_count, NOW())
  ON CONFLICT (hour_window)
  DO UPDATE SET
    calls_made = api_rate_limits.calls_made + calls_made_count,
    last_call_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE api_rate_limits IS 'Tracks Facebook Graph API usage per hour to prevent rate limit violations';
COMMENT ON COLUMN api_rate_limits.hour_window IS 'Hour window rounded to start (e.g., 2025-01-02 14:00:00)';
COMMENT ON COLUMN api_rate_limits.max_calls_allowed IS 'Usually 200 × number of app users';
COMMENT ON FUNCTION can_make_api_calls IS 'Check if we have budget for API calls. Returns true if budget available.';
COMMENT ON FUNCTION increment_api_calls IS 'Increment API call counter for current hour window';
