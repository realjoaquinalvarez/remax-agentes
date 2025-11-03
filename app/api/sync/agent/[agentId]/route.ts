/**
 * POST /api/sync/agent/[agentId]
 * Sync single agent's Facebook data
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSyncJob, startSyncJob, completeSyncJob } from '@/lib/api/sync-logger'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { syncAgentMetrics } from '@/lib/facebook/sync-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params

    // 1. Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // 2. Verify agent exists and user has access
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id, last_successful_sync')
      .eq('id', agentId)
      .maybeSingle()

    if (agentError || !agentData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 }
      )
    }

    type AgentData = {
      id: string
      user_id: string | null
      last_successful_sync: string | null
    }

    const agent = agentData as AgentData

    // Check if user has permission (own agent or admin)
    const isAdmin = user.user_metadata?.role === 'admin'
    const isOwnAgent = agent.user_id === user.id

    if (!isAdmin && !isOwnAgent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    // 3. Check if last sync was less than 30 minutes ago
    if (agent.last_successful_sync) {
      const lastSync = new Date(agent.last_successful_sync)
      const now = new Date()
      const minutesSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60)

      if (minutesSinceSync < 30) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too soon',
            message: `Debes esperar ${Math.ceil(30 - minutesSinceSync)} minutos más antes de sincronizar este agente`,
            minutesUntilNext: 30 - minutesSinceSync,
          },
          { status: 429 }
        )
      }
    }

    // 4. Check rate limit
    const rateLimit = await checkRateLimit(3) // Single agent needs ~2-3 calls

    if (!rateLimit.canProceed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Límite de API alcanzado. Intenta en la próxima hora.',
          rateLimitDetails: rateLimit,
        },
        { status: 429 }
      )
    }

    // 5. Create sync job
    const jobId = await createSyncJob({
      syncType: 'manual_single',
      agentId: agentId,
      triggeredByUserId: user.id,
      totalAgents: 1,
    })

    // 6. Start sync job
    await startSyncJob(jobId)

    // 7. Execute sync for the agent
    let syncResult
    try {
      syncResult = await syncAgentMetrics(agentId)

      // 8. Complete sync job with results
      await completeSyncJob({
        jobId,
        status: syncResult.success ? 'completed' : 'failed',
        agentsProcessed: 1,
        agentsSucceeded: syncResult.success ? 1 : 0,
        agentsFailed: syncResult.success ? 0 : 1,
        apiCallsUsed: syncResult.apiCallsUsed,
        errorMessage: syncResult.error,
      })

      if (!syncResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: syncResult.error || 'Sync failed',
            jobId,
            agentId,
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Agente ${syncResult.agentName} sincronizado exitosamente`,
        jobId,
        agentId,
        results: {
          agentName: syncResult.agentName,
          facebookMetrics: syncResult.facebookMetrics,
          instagramMetrics: syncResult.instagramMetrics,
          apiCallsUsed: syncResult.apiCallsUsed,
        },
      })
    } catch (syncError) {
      // Complete job as failed
      await completeSyncJob({
        jobId,
        status: 'failed',
        agentsProcessed: 1,
        agentsFailed: 1,
        errorMessage: syncError instanceof Error ? syncError.message : 'Unknown sync error',
      })

      throw syncError
    }
  } catch (error) {
    console.error('Error in sync agent:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync agent',
      },
      { status: 500 }
    )
  }
}
