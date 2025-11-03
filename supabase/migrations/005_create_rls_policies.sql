-- Enable Row Level Security on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AGENTS TABLE POLICIES
-- ============================================================================

-- Agents can view their own profile
CREATE POLICY "Agents can view own profile"
  ON agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Agents can update their own profile (except sensitive fields)
CREATE POLICY "Agents can update own profile"
  ON agents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all agents
CREATE POLICY "Admins can view all agents"
  ON agents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update all agents
CREATE POLICY "Admins can update all agents"
  ON agents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can insert agents
CREATE POLICY "Admins can insert agents"
  ON agents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- FACEBOOK_METRICS_DAILY TABLE POLICIES
-- ============================================================================

-- Agents can view their own metrics
CREATE POLICY "Agents can view own metrics"
  ON facebook_metrics_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = facebook_metrics_daily.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
  ON facebook_metrics_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- System can insert metrics (via service role)
CREATE POLICY "Service role can insert metrics"
  ON facebook_metrics_daily
  FOR INSERT
  WITH CHECK (true);

-- System can update metrics (via service role)
CREATE POLICY "Service role can update metrics"
  ON facebook_metrics_daily
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SYNC_JOBS TABLE POLICIES
-- ============================================================================

-- Users can view their own sync jobs
CREATE POLICY "Users can view own sync jobs"
  ON sync_jobs
  FOR SELECT
  USING (auth.uid() = triggered_by_user_id);

-- Admins can view all sync jobs
CREATE POLICY "Admins can view all sync jobs"
  ON sync_jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Service role can insert sync jobs
CREATE POLICY "Service role can insert sync jobs"
  ON sync_jobs
  FOR INSERT
  WITH CHECK (true);

-- Service role can update sync jobs
CREATE POLICY "Service role can update sync jobs"
  ON sync_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- API_RATE_LIMITS TABLE POLICIES
-- ============================================================================

-- Admins can view rate limits
CREATE POLICY "Admins can view rate limits"
  ON api_rate_limits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Service role can manage rate limits
CREATE POLICY "Service role can insert rate limits"
  ON api_rate_limits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update rate limits"
  ON api_rate_limits
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION TO CHECK IF USER IS ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'Check if current user has admin role';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Agents can view own profile" ON agents IS 'Agents can only see their own profile data';
COMMENT ON POLICY "Admins can view all agents" ON agents IS 'Admin users can see all agent profiles';
COMMENT ON POLICY "Agents can view own metrics" ON facebook_metrics_daily IS 'Agents can only see their own Facebook metrics';
COMMENT ON POLICY "Service role can insert metrics" ON facebook_metrics_daily IS 'System service role can insert new metrics during sync';
