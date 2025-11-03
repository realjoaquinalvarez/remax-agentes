/**
 * Custom hook for fetching and managing agents data from Supabase
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AgentMetrics {
  // Page metrics
  followers: number
  follower_growth_rate: number

  // Post metrics
  posts_count: number
  reach: number
  impressions: number
  impressions_organic: number
  impressions_paid: number

  // Engagement metrics
  total_engagements: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number

  // Click metrics
  link_clicks: number
  post_clicks: number

  // Leads
  leads_estimated: number

  // Platform breakdown
  instagram_followers: number | null
  facebook_followers: number | null

  metric_date: string
}

export interface Agent {
  id: string
  user_id: string | null
  name: string
  email: string
  avatar_url: string | null
  phone: string | null
  status: 'active' | 'inactive' | 'pending'
  join_date: string

  // Facebook connection
  facebook_page_id: string | null
  facebook_page_name: string | null
  instagram_account_id: string | null
  instagram_username: string | null
  is_facebook_connected: boolean
  facebook_connected_at: string | null

  // Sync tracking
  last_successful_sync: string | null
  last_sync_attempt: string | null
  consecutive_sync_failures: number

  // Timestamps
  created_at: string
  updated_at: string

  // Latest metrics (joined from facebook_metrics_daily)
  latestMetrics?: AgentMetrics
}

interface UseAgentsResult {
  agents: Agent[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAgents(): UseAgentsResult {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true })

      if (agentsError) {
        throw new Error(`Failed to fetch agents: ${agentsError.message}`)
      }

      // Fetch latest metrics for each agent
      const agentsWithMetrics = await Promise.all(
        (agentsData || []).map(async (agent) => {
          const { data: metricsData } = await supabase
            .from('facebook_metrics_daily')
            .select('*')
            .eq('agent_id', agent.id)
            .order('metric_date', { ascending: false })
            .limit(1)
            .maybeSingle()

          return {
            ...agent,
            latestMetrics: metricsData || undefined,
          } as Agent
        })
      )

      setAgents(agentsWithMetrics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching agents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
  }
}

/**
 * Hook to fetch a single agent by ID
 */
export function useAgent(agentId: string | null) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgent = useCallback(async () => {
    if (!agentId) {
      setAgent(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .maybeSingle()

      if (agentError) {
        throw new Error(`Failed to fetch agent: ${agentError.message}`)
      }

      if (!agentData) {
        throw new Error('Agent not found')
      }

      // Fetch latest metrics
      const { data: metricsData } = await supabase
        .from('facebook_metrics_daily')
        .select('*')
        .eq('agent_id', agentId)
        .order('metric_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      setAgent({
        ...agentData,
        latestMetrics: metricsData || undefined,
      } as Agent)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching agent:', err)
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  return {
    agent,
    loading,
    error,
    refetch: fetchAgent,
  }
}
