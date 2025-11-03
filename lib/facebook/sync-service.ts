/**
 * Facebook Sync Service
 * Orchestrates fetching Facebook/Instagram metrics and saving to database
 */

import { createAdminClient } from '@/lib/supabase/server'
import { facebookClient } from './client'
import { incrementApiCalls } from '@/lib/api/rate-limit'

export interface SyncResult {
  agentId: string
  agentName: string
  success: boolean
  error?: string
  facebookMetrics?: {
    followers: number
    impressions: number
    engagement: number
    postsAnalyzed: number
  }
  instagramMetrics?: {
    followers: number
    impressions: number
    reach: number
    mediaAnalyzed: number
  }
  apiCallsUsed: number
}

export interface AgentData {
  id: string
  user_id: string | null
  name: string
  facebook_page_id: string | null
  facebook_access_token: string | null
  instagram_account_id: string | null
  instagram_access_token: string | null
}

/**
 * Sync a single agent's Facebook and Instagram data
 */
export async function syncAgentMetrics(agentId: string): Promise<SyncResult> {
  const supabase = createAdminClient()
  let apiCallsUsed = 0

  try {
    // 1. Fetch agent data
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id, name, facebook_page_id, facebook_access_token, instagram_account_id, instagram_access_token')
      .eq('id', agentId)
      .maybeSingle()

    if (agentError || !agentData) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    const agent = agentData as AgentData

    const result: SyncResult = {
      agentId: agent.id,
      agentName: agent.name,
      success: false,
      apiCallsUsed: 0,
    }

    // Calculate date range (last 24 hours)
    const until = new Date()
    const since = new Date()
    since.setDate(since.getDate() - 1)

    let facebookFollowers = 0
    let facebookImpressions = 0
    let facebookEngagement = 0
    let facebookPostsCount = 0

    let instagramFollowers = 0
    let instagramImpressions = 0
    let instagramReach = 0
    let instagramMediaCount = 0

    // 2. Fetch Facebook metrics if available
    if (agent.facebook_page_id && agent.facebook_access_token) {
      try {
        // Fetch page metrics (1 API call)
        const pageMetrics = await facebookClient.getPageMetrics(
          agent.facebook_page_id,
          agent.facebook_access_token,
          since,
          until
        )
        apiCallsUsed += 1

        facebookFollowers = pageMetrics.followers_count
        facebookImpressions = pageMetrics.page_impressions
        facebookEngagement = pageMetrics.page_post_engagements

        // Fetch recent posts (1 API call)
        const posts = await facebookClient.getPagePosts(
          agent.facebook_page_id,
          agent.facebook_access_token,
          25
        )
        apiCallsUsed += 1

        facebookPostsCount = posts.length

        result.facebookMetrics = {
          followers: facebookFollowers,
          impressions: facebookImpressions,
          engagement: facebookEngagement,
          postsAnalyzed: facebookPostsCount,
        }
      } catch (error) {
        console.error(`Facebook sync error for agent ${agent.id}:`, error)
        result.error = `Facebook error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    // 3. Fetch Instagram metrics if available
    if (agent.instagram_account_id && agent.instagram_access_token) {
      try {
        // Fetch Instagram account metrics (1 API call)
        const igMetrics = await facebookClient.getInstagramMetrics(
          agent.instagram_account_id,
          agent.instagram_access_token,
          since,
          until
        )
        apiCallsUsed += 1

        instagramFollowers = igMetrics.followers_count
        instagramImpressions = igMetrics.impressions
        instagramReach = igMetrics.reach

        // Fetch recent media (1 API call)
        const media = await facebookClient.getInstagramMedia(
          agent.instagram_account_id,
          agent.instagram_access_token,
          25
        )
        apiCallsUsed += 1

        instagramMediaCount = media.length

        result.instagramMetrics = {
          followers: instagramFollowers,
          impressions: instagramImpressions,
          reach: instagramReach,
          mediaAnalyzed: instagramMediaCount,
        }
      } catch (error) {
        console.error(`Instagram sync error for agent ${agent.id}:`, error)
        if (!result.error) {
          result.error = `Instagram error: ${error instanceof Error ? error.message : 'Unknown error'}`
        } else {
          result.error += ` | Instagram error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    }

    // 4. Save metrics to database
    if (result.facebookMetrics || result.instagramMetrics) {
      const metricDate = new Date()
      metricDate.setHours(0, 0, 0, 0) // Start of day

      const { error: insertError } = await supabase
        .from('facebook_metrics_daily')
        .upsert({
          agent_id: agent.id,
          metric_date: metricDate.toISOString().split('T')[0],
          // Facebook metrics
          fb_followers_count: facebookFollowers || 0,
          fb_page_impressions: facebookImpressions || 0,
          fb_page_reach: 0, // Not available in current implementation
          fb_page_engaged_users: facebookEngagement || 0,
          fb_post_engagements: facebookEngagement || 0,
          fb_posts_count: facebookPostsCount || 0,
          // Instagram metrics
          ig_followers_count: instagramFollowers || 0,
          ig_impressions: instagramImpressions || 0,
          ig_reach: instagramReach || 0,
          ig_profile_views: 0, // Available but not used yet
          ig_website_clicks: 0, // Available but not used yet
          ig_media_count: instagramMediaCount || 0,
          // Aggregated metrics
          total_followers: (facebookFollowers || 0) + (instagramFollowers || 0),
          total_impressions: (facebookImpressions || 0) + (instagramImpressions || 0),
          total_engagement: facebookEngagement || 0,
          total_posts: (facebookPostsCount || 0) + (instagramMediaCount || 0),
        }, {
          onConflict: 'agent_id,metric_date'
        })

      if (insertError) {
        throw new Error(`Failed to save metrics: ${insertError.message}`)
      }

      // Update agent's last sync timestamp
      await supabase
        .from('agents')
        .update({
          last_successful_sync: new Date().toISOString(),
          last_sync_status: 'success',
          last_sync_error: null,
        })
        .eq('id', agent.id)

      result.success = true
    } else {
      result.error = result.error || 'No Facebook or Instagram accounts connected'
    }

    // 5. Increment API call counter
    if (apiCallsUsed > 0) {
      await incrementApiCalls(apiCallsUsed)
    }

    result.apiCallsUsed = apiCallsUsed

    return result
  } catch (error) {
    // Track API calls even on failure
    if (apiCallsUsed > 0) {
      await incrementApiCalls(apiCallsUsed)
    }

    // Update agent's sync status
    await supabase
      .from('agents')
      .update({
        last_sync_status: 'failed',
        last_sync_error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', agentId)

    throw error
  }
}

/**
 * Sync all agents (typically for admin-triggered sync)
 */
export async function syncAllAgents(): Promise<{
  totalAgents: number
  successfulSyncs: number
  failedSyncs: number
  results: SyncResult[]
  totalApiCalls: number
}> {
  const supabase = createAdminClient()

  // Fetch all agents with connected accounts
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name')
    .or('facebook_page_id.not.is.null,instagram_account_id.not.is.null')

  if (agentsError) {
    throw new Error(`Failed to fetch agents: ${agentsError.message}`)
  }

  const results: SyncResult[] = []
  let successfulSyncs = 0
  let failedSyncs = 0
  let totalApiCalls = 0

  // Sync each agent sequentially to avoid rate limiting
  for (const agent of agents || []) {
    try {
      const result = await syncAgentMetrics(agent.id)
      results.push(result)

      if (result.success) {
        successfulSyncs++
      } else {
        failedSyncs++
      }

      totalApiCalls += result.apiCallsUsed

      // Add a small delay between agents to be gentle on the API
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      failedSyncs++
      results.push({
        agentId: agent.id,
        agentName: agent.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        apiCallsUsed: 0,
      })
    }
  }

  return {
    totalAgents: (agents || []).length,
    successfulSyncs,
    failedSyncs,
    results,
    totalApiCalls,
  }
}
