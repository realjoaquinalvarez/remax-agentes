/**
 * POST /api/sync/all
 * Sync all agents' Facebook data
 * ADMIN ONLY
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canSyncNow, createSyncJob, startSyncJob, completeSyncJob } from '@/lib/api/sync-logger'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { syncAllAgents } from '@/lib/facebook/sync-service'

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated and is admin
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

    // Check if user is admin
    const { data: userData } = await supabase.auth.getUser()
    const isAdmin = userData.user?.user_metadata?.role === 'admin'

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Admin access required',
        },
        { status: 403 }
      )
    }

    // 2. Check if we can sync now (12 hour throttle)
    const syncCheck = await canSyncNow()

    if (!syncCheck.canSync) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too soon',
          message: `Debes esperar ${Math.ceil(syncCheck.hoursUntilNext)} horas más antes de sincronizar`,
          lastSyncTime: syncCheck.lastSyncTime,
          hoursUntilNext: syncCheck.hoursUntilNext,
        },
        { status: 429 }
      )
    }

    // 3. Check rate limit
    const rateLimit = await checkRateLimit(10) // Estimate 10 calls initially

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

    // 4. Create sync job
    const jobId = await createSyncJob({
      syncType: 'manual_all',
      triggeredByUserId: user.id,
    })

    // 5. Start sync job
    await startSyncJob(jobId)

    // 6. Execute sync for all agents
    let syncResults
    try {
      syncResults = await syncAllAgents()

      // 7. Complete sync job with results
      await completeSyncJob({
        jobId,
        status: syncResults.failedSyncs === 0 ? 'completed' : 'completed_with_errors',
        agentsProcessed: syncResults.totalAgents,
        agentsSucceeded: syncResults.successfulSyncs,
        agentsFailed: syncResults.failedSyncs,
        apiCallsUsed: syncResults.totalApiCalls,
      })

      return NextResponse.json({
        success: true,
        message: `Sincronización completada: ${syncResults.successfulSyncs}/${syncResults.totalAgents} agentes sincronizados exitosamente`,
        jobId,
        results: {
          totalAgents: syncResults.totalAgents,
          successfulSyncs: syncResults.successfulSyncs,
          failedSyncs: syncResults.failedSyncs,
          totalApiCalls: syncResults.totalApiCalls,
          details: syncResults.results,
        },
      })
    } catch (syncError) {
      // Complete job as failed
      await completeSyncJob({
        jobId,
        status: 'failed',
        errorMessage: syncError instanceof Error ? syncError.message : 'Unknown sync error',
      })

      throw syncError
    }
  } catch (error) {
    console.error('Error in sync all:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync agents',
      },
      { status: 500 }
    )
  }
}
