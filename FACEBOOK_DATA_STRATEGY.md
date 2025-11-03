# Facebook Data Management Strategy
## RE/MAX Agents Dashboard

**Last Updated:** November 2, 2025

---

## Executive Summary

This document outlines a comprehensive strategy for managing Facebook API data integration for approximately 20 RE/MAX agents, considering API rate limits, data freshness requirements, and optimal user experience.

### Key Challenges
- **API Rate Limits**: 200 calls per hour × number of users
- **Data Freshness**: Need daily updates + on-demand refresh
- **Scale**: ~20 agents initially, potentially growing
- **Cost Efficiency**: Minimize unnecessary API calls
- **User Experience**: Fast filtering without API delays

### Solution Approach
**Manual Sync Strategy:** Store metrics in database + manual refresh by admin + database-driven filtering (no automated cron jobs)

---

## System Architecture Overview

### 1. Database Tables (Supabase)

#### **agents**
**Purpose:** Store agent information and Facebook connection status

**Key Fields:**
- User authentication reference
- Facebook page ID and access token (encrypted)
- Instagram account ID
- Connection status (active, inactive, disconnected)
- Last successful sync timestamp

**Indexes:** Primary key on ID, unique on email

---

#### **facebook_metrics_daily**
**Purpose:** Store daily metrics snapshot for each agent

**Key Fields:**
- **Page Metrics:** followers, impressions, reach, engaged users
- **Post Metrics:** post count, reactions, comments, shares
- **Click Metrics:** link clicks (including WhatsApp)
- **Calculated:** engagement rate

**Structure:**
- One row per agent per day
- Unique constraint on (agent_id, date)
- Indexes on agent_id + date DESC for fast queries

**Data Retention:** Keep all historical data (no automatic deletion)

---

#### **sync_jobs**
**Purpose:** Track synchronization operations for monitoring

**Key Fields:**
- Sync type (daily_auto, manual_all, manual_single)
- Status (pending, running, completed, failed)
- Agent ID (NULL for bulk syncs)
- Timestamps (started, completed)
- Success counters (total, synced, failed)
- Error messages

**Usage:** Monitoring dashboard, debugging, audit trail

---

#### **api_rate_limits**
**Purpose:** Track API usage per hour window

**Key Fields:**
- Hour window timestamp
- Calls made in that hour
- Maximum allowed calls (configurable)

**Structure:** One row per hour, unique constraint on hour_window

---

## Data Synchronization Strategy

### 2.1 Manual Sync - All Agents (Admin Panel)

**Trigger:** Button in admin panel header "Actualizar Datos"

**Primary Use Case:** Main method to keep data fresh (admin updates daily when entering panel)

**Additional Use Cases:**
- Need immediate fresh data for analysis
- Troubleshooting specific metrics
- After Facebook API changes
- Regular daily maintenance by admin

**Throttling Rules:**
- Minimum 12 hours between bulk syncs (encourage daily pattern)
- Show countdown timer until next allowed sync
- Display last sync time prominently: "Última actualización: hace 8 horas"
- Warn user before triggering if data is already fresh (<12 hours)

**User Experience:**
- Show progress bar: "Sincronizando 5/20 agentes..."
- Real-time status updates
- Estimated completion time
- Success/failure count at end

**Process Flow:**
1. Check last bulk sync time (enforce 1-hour minimum)
2. Create sync_job record (status: pending)
3. Check current hour's rate limit usage
4. Process agents in batches of 10
5. 5-second delay between batches
6. Update UI with real-time progress
7. Mark sync_job complete with results

**Rate Limit Protection:**
- Check before each batch
- If limit reached, pause until next hour
- Continue automatically when limit resets

---

### 2.2 Manual Sync - Individual Agent

**Trigger:** Button in individual agent detail view

**Use Cases:**
- Agent just connected Facebook
- Specific agent's data seems incorrect
- Agent requests immediate update

**Throttling Rules:**
- Minimum 30 minutes between syncs for same agent
- Show last sync time
- Countdown to next available sync

**Priority:** Lower than bulk sync
- If bulk sync is running, queue individual sync after
- Don't interrupt bulk operations

**Process Flow:**
1. Validate agent isn't currently syncing
2. Check rate limit budget (need 2-3 calls available)
3. Fetch only this agent's metrics
4. Update database
5. Show success confirmation

---

## Query & Filtering Strategy

### 3.1 Time Range Filtering (NO API Calls Required)

**Key Principle:** All filters work on pre-stored database data

**Filter Options:**
- Hoy (1 day)
- Última semana (7 days)
- Último mes (30 days)
- Últimos 6 meses (180 days)

**Query Strategy:**
- Calculate start date based on filter
- Query `facebook_metrics_daily` table
- Filter by date range
- Aggregate metrics (SUM, AVG)
- Return results immediately

**Performance:**
- Indexed queries = sub-100ms response
- No waiting for Facebook API
- Works even if Facebook API is down

---

### 3.2 Admin Panel Aggregation

**Data Needed:**
- Total metrics across all agents
- Individual agent performance
- Top performers ranking

**Aggregation Method:**
1. Query all agents' metrics for date range
2. Group by agent
3. Calculate totals and averages
4. Sort by composite performance score
5. Cache results for 5 minutes

**Performance Score Calculation:**
- Posts × 10 points
- Impressions ÷ 1,000 points
- Reach ÷ 500 points
- Link clicks × 5 points
- Total = weighted sum

---

## Rate Limit Management

### 4.1 Tracking Strategy

**Per-Hour Tracking:**
- Track calls made in current hour window
- Hour window: rounded to start of hour
- Reset counter at start of each hour

**Available Budget Calculation:**
- Base limit: 200 calls per hour
- User multiplier: × number of app users
- Current usage: tracked in database
- Available = (200 × users) - current usage

**Visual Indicators:**
- Green: < 50% used
- Yellow: 50-80% used
- Red: > 80% used
- Blocked: 100% used

---

### 4.2 Rate Limit Enforcement

**Before Each API Call:**
1. Query current hour's usage
2. Check if budget available
3. If not, calculate wait time
4. If yes, increment counter and proceed

**Batch Processing:**
- Process agents in small batches (10 at a time)
- Check rate limit before each batch
- If limit reached mid-batch, pause
- Auto-resume when new hour begins
- 5-second delay between batches (prevent burst)

**Emergency Handling:**
- If approaching limit (>90%), pause all syncs
- Send admin notification
- Resume in next hour automatically

---

## Data Freshness Indicators

### 5.1 Visual Status Indicators

**Status Categories:**
- ✅ **Fresh** (< 12 hours): Green badge, "Actualizado recientemente"
- ⚠️ **Acceptable** (12-24 hours): Yellow badge, "Actualizado hoy"
- ⚠️ **Stale** (24-48 hours): Orange badge, "Actualizado ayer"
- ❌ **Outdated** (> 48 hours): Red badge, "Requiere actualización"

**Display Locations:**
- Admin panel header
- Individual agent cards
- Next to each metric section

**Format:** "Última actualización: hace 3 horas"

---

### 5.2 Sync Status Messages

**During Sync:**
- "Sincronizando datos..."
- Progress percentage
- Current agent being synced
- Estimated time remaining

**After Sync:**
- "Datos actualizados exitosamente"
- Success/failure count
- Any errors encountered
- Next scheduled sync time

---

## Error Handling & Resilience

### 6.1 Retry Strategy

**Retry Rules:**
- Max 3 attempts per agent
- Exponential backoff: 1s, 2s, 4s
- Log each failure attempt
- After 3 failures, mark as failed and continue

**Retriable Errors:**
- Network timeouts
- Rate limit hit (wait and retry)
- Temporary Facebook API errors (500, 503)

**Non-Retriable Errors:**
- Invalid access token (mark agent as disconnected)
- Page not found (mark as disconnected)
- Permission denied (mark as needs reconnection)

---

### 6.2 Partial Failure Handling

**Philosophy:** Don't let one agent's failure block others

**Implementation:**
- Process agents independently
- Catch and log each failure
- Continue to next agent
- Provide detailed failure report at end

**Admin Notification:**
- If > 5 agents fail: Send urgent notification
- If 1-4 agents fail: Log only, show in dashboard
- Include specific error messages
- Suggest remediation steps

---

### 6.3 Graceful Degradation

**If Facebook API Unavailable:**
- Show last successful data with staleness indicator
- Display error message: "Datos temporalmente no disponibles"
- Disable manual sync button
- Auto-retry in background

**If Database Unavailable:**
- Show error state
- Don't attempt any operations
- Log to external monitoring
- Alert developers immediately

---

## Security Considerations

### 7.1 Token Management

**Storage:**
- Encrypt Facebook access tokens before storing
- Use Supabase built-in encryption
- Never expose tokens in client-side code
- Store only on server side

**Access Control:**
- Row Level Security (RLS) policies in Supabase
- Agents can only see their own data
- Admins can see all data
- No public access to raw metrics

**Token Refresh:**
- Long-lived tokens valid for 60 days
- Implement refresh mechanism at 50 days
- Notify agent if token invalid
- Guide through reconnection flow

---

### 7.2 API Security

**Authentication:**
- Protect cron endpoints with secret token
- Verify Vercel cron headers
- Use Supabase auth for user operations
- API routes require valid session

**Data Validation:**
- Validate all Facebook API responses
- Sanitize before database insertion
- Check for unexpected data types
- Log anomalies for review

---

## Monitoring & Alerts

### 8.1 Key Metrics to Track

**Sync Health:**
- Daily sync success rate (target: >95%)
- Average sync duration (target: <5 minutes)
- Individual agent success rate
- Consecutive failure count per agent

**API Usage:**
- Hourly rate limit utilization
- Daily total calls
- Calls per agent per day
- Rate limit hits per day (target: 0)

**Data Freshness:**
- Agents with data >24 hours old
- Agents with data >48 hours old
- Average data age across all agents

**System Performance:**
- Database query response times
- API route response times
- Error rates by type
- User-triggered sync frequency

---

### 8.2 Alert Configuration

**Critical Alerts (Immediate Action):**
- Daily sync failed completely
- >10 agents failed to sync
- Rate limit consistently hit (3+ times/day)
- Database connection issues

**Warning Alerts (Review Within 24h):**
- 5-10 agents failed to sync
- Sync duration >10 minutes
- Rate limit utilization >90%
- >5 agents with stale data (>48h)

**Info Notifications:**
- Daily sync completion summary
- Weekly performance report
- Monthly usage statistics

**Alert Channels:**
- Email for critical and warnings
- Dashboard notifications for all
- Slack integration (future)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up core infrastructure

**Tasks:**
- Set up Supabase project
- Create all database tables
- Configure RLS policies
- Set up authentication
- Create basic API routes structure

**Deliverable:** Database ready, basic CRUD operations working

---

### Phase 2: Core Sync Functionality (Week 3-4)
**Goal:** Implement synchronization logic

**Tasks:**
- Build Facebook Graph API integration
- Implement manual sync logic (all agents)
- Implement individual agent sync
- Add rate limit tracking
- Build sync progress indicators

**Deliverable:** Functional sync system, data flowing to database

**Note:** No cron job implementation needed (manual sync only)

---

### Phase 3: UI Integration (Week 5)
**Goal:** Connect frontend to backend

**Tasks:**
- Add sync button to admin panel
- Create sync status indicators
- Build progress UI
- Add error display
- Implement data freshness badges

**Deliverable:** Full user experience for syncing

---

### Phase 4: Optimization (Week 6)
**Goal:** Improve performance and reliability

**Tasks:**
- Implement batch processing
- Add retry logic
- Optimize database queries
- Add query result caching
- Improve error handling

**Deliverable:** Fast, reliable system

---

### Phase 5: Monitoring (Week 7-8)
**Goal:** Add observability

**Tasks:**
- Set up monitoring dashboard
- Configure alert rules
- Add detailed logging
- Create admin reports
- Build analytics views

**Deliverable:** Full visibility into system health

---

### Phase 6: Polish (Week 9-10)
**Goal:** Production-ready

**Tasks:**
- Security audit
- Performance testing
- User acceptance testing
- Documentation
- Deployment to production

**Deliverable:** Production-ready system

---

## Cost Estimation

### Supabase Costs

**Free Tier:**
- 500MB database storage
- 50,000 monthly active users
- 2GB egress bandwidth
- No credit card required

**Pro Tier - $25/month:**
- 8GB database storage
- 100,000 monthly active users
- 50GB egress bandwidth
- Daily automated backups
- Point-in-time recovery
- 99.9% SLA

**Recommendation:** Start with Pro for production reliability

**Storage Estimation (20 agents):**
- 20 agents × 365 days × 500 bytes/row = ~3.5MB/year
- Very comfortable within 8GB limit
- Can store 10+ years of data

---

### Vercel Costs

**Hobby Plan - Free:**
- Unlimited deployments
- 100GB bandwidth
- Serverless functions
- Manual API routes

**Recommendation:** Hobby (Free) is sufficient

**Why Free Tier Works:**
- No cron jobs needed (manual sync only)
- API routes for sync triggered manually
- Well within bandwidth limits
- Sufficient for ~20-50 agents

---

### Total Initial Costs

**Recommended Production Stack:**
- Supabase Free: $0/month (or Pro: $25/month for production reliability)
- Vercel Hobby: $0/month
- **Total: $0/month (Free tier) or $25/month (with Supabase Pro)**

**Cost per Agent:** $0 (Free) or $1.25/month (Supabase Pro)

**Recommendation:** Start with free tier, upgrade Supabase to Pro when ready for production

---

### Scaling Costs (100 agents)

**Database:**
- 100 agents × 365 days × 500 bytes = ~18MB/year
- Still well within 8GB Supabase Pro

**API Calls:**
- Manual syncs only: 1-2 per day
- 100 agents × 3 calls × 1 sync = 300 calls/day
- Well within rate limits

**Costs:**
- Supabase Pro: $25/month (recommended for 100 agents)
- Vercel: $0/month (Hobby still sufficient)
- **Total: $25/month**

**Cost per Agent:** $0.25/month

---

## API Call Budget Analysis

### Manual Sync Pattern (20 agents)

**Expected Usage:**
- Admin syncs all agents: 1 time per day
- Calls per sync: 20 agents × 2-3 calls = 40-60 calls
- **Daily calls:** 40-60
- **Monthly calls:** 1,200-1,800

**Occasional Additional Syncs:**
- Extra admin sync: ~2-3 times per week = 200-300 calls/month
- Individual agent syncs: ~10 per month = 20-30 calls/month
- **Total monthly:** ~1,500-2,100 calls

### Total Budget
- **Monthly API calls:** ~1,500-2,100
- **Daily rate limit:** 200 calls/hour × 24 hours = 4,800 calls/day
- **Monthly limit (theoretical):** 144,000 calls
- **Utilization:** 1-2% of monthly capacity

### Key Advantage
- **Very low API usage** (manual sync only)
- **Zero cost** for API calls
- **Well within free tier limits**

### Scaling Analysis (100 agents)
- **Daily sync:** 100 agents × 3 calls = 300 calls
- **Monthly calls:** ~9,000-12,000
- **Utilization:** 6-8% of monthly capacity
- **Conclusion:** Still very comfortable margin

---

## Alternative Approaches Considered

### 1. Real-time Sync on Every Page Load
**Rejected Because:**
- Too many API calls (unsustainable)
- Slow page load times (bad UX)
- High rate limit risk
- Expensive at scale

---

### 2. Weekly Sync Only
**Rejected Because:**
- Data too stale for daily decision-making
- Dashboard loses value
- Agents want fresh insights
- Competitive disadvantage

---

### 3. On-Demand Sync Only (No Daily)
**Rejected Because:**
- Inconsistent data freshness across agents
- Risk of rate limit exhaustion
- Manual effort required
- Some agents may never update

---

### 4. Manual Sync Only (SELECTED)
**Why This Works:**
- **Zero infrastructure cost** (no Vercel Pro needed)
- Simple to maintain (no cron job complexity)
- Admin controls when data refreshes
- Fast filtering from database
- Scales efficiently
- **Best cost/simplicity tradeoff**
- Admin checks dashboard daily anyway

**Trade-off Accepted:**
- Requires admin to manually update daily
- Data not fresh if admin doesn't sync
- Acceptable because admin views dashboard daily

---

## Future Enhancements

### Phase 2 Features (After MVP)

**1. Predictive Sync**
- Machine learning to predict when agents need fresh data
- Sync high-activity agents more frequently
- Reduce syncs for inactive agents

**2. Differential Sync**
- Only fetch metrics that changed
- Reduce API calls by 30-50%
- Faster sync times

**3. Webhook Integration**
- Real-time updates when available from Facebook
- Eliminate polling for some metrics
- Near-instant data updates

**4. Multi-Platform Support**
- Extend to Instagram Business API
- Add TikTok for Business
- LinkedIn Company Pages
- Unified dashboard

**5. Advanced Analytics**
- Trend detection (unusual spikes/drops)
- Comparative analysis vs industry
- Predictive forecasting
- Automated insights

**6. Historical Deep Dive**
- Store 12+ months of data
- Year-over-year comparisons
- Seasonal pattern analysis
- Long-term trend visualization

**7. Anomaly Detection**
- Alert on unusual metric changes
- Detect potential data issues
- Flag suspicious activity
- Suggest investigation actions

---

## Success Criteria

### Technical Success Metrics

**Reliability:**
- 99% daily sync success rate
- <1% agent sync failures
- Zero rate limit violations
- <5 minute average sync time

**Performance:**
- <100ms query response times
- <3 second page load times
- <1 second filter application
- Real-time sync progress updates

**Data Quality:**
- 100% of agents synced within 24 hours
- <1% data inconsistencies
- Zero data loss incidents
- Accurate metric calculations

---

### Business Success Metrics

**User Adoption:**
- 90% of agents connect Facebook within first week
- <5% disconnection rate
- High dashboard engagement
- Positive user feedback

**Operational Efficiency:**
- 80% reduction in manual data entry
- Zero manual report generation
- Automated insights delivery
- Reduced admin workload

---

## Conclusion

This strategy provides a robust, scalable, and cost-effective solution for managing Facebook data for RE/MAX agents.

### Key Strengths
✅ **Extremely Cost-Effective:** $0-25/month for 20 agents (vs $45 with cron)
✅ **Simple:** No cron job complexity, pure manual control
✅ **Efficient:** Minimal API calls, fast queries
✅ **Scalable:** 100+ agents on same infrastructure
✅ **User-Friendly:** Fast filtering, clear status indicators
✅ **Resilient:** Comprehensive error handling
✅ **Maintainable:** Clear architecture, good monitoring
✅ **Zero-Cost Deployment:** Works on Vercel free tier

### Risk Mitigation
- Manual sync with clear status indicators
- Rate limit tracking prevents exhaustion
- Retry logic handles transient failures
- Database caching ensures fast UX
- Monitoring provides early warning
- Graceful degradation maintains availability

### Important Operational Note
**Admin Responsibility:** Data freshness depends on admin running daily sync. Recommended workflow:
1. Admin opens `/admin-panel` each morning
2. Checks data freshness indicator
3. Clicks "Actualizar Datos" if >12 hours old
4. Reviews updated metrics

This manual approach optimally balances **zero cost**, simplicity, and acceptable data freshness for the use case.
