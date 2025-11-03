/**
 * POST /api/sync/all
 * Sync all agents' Facebook data
 * ADMIN ONLY
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canSyncNow, createSyncJob, startSyncJob, completeSyncJob } from '@/lib/api/sync-logger'
import { checkRateLimit } from '@/lib/api/rate-limit'

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

    // TODO Phase 2: Implement actual Facebook sync logic here
    // For now, just complete immediately as a placeholder

    await completeSyncJob({
      jobId,
      status: 'completed',
    })

    return NextResponse.json({
      success: true,
      message: 'Sincronización iniciada (placeholder - Phase 2 implementará la lógica real)',
      jobId,
    })
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
