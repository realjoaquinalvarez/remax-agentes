/**
 * GET /api/sync/status
 * Get sync status and recent sync jobs
 */

import { NextResponse } from 'next/server'
import { getRecentSyncJobs, getLastSyncTime, canSyncNow } from '@/lib/api/sync-logger'

export async function GET() {
  try {
    const [recentJobs, lastSyncTime, syncPermission] = await Promise.all([
      getRecentSyncJobs(5),
      getLastSyncTime(),
      canSyncNow(),
    ])

    // Calculate data freshness
    let dataFreshness: 'fresh' | 'acceptable' | 'stale' | 'outdated' = 'outdated'
    let freshnessMessage = 'Sin datos'

    if (lastSyncTime) {
      const hoursSinceSync = (new Date().getTime() - new Date(lastSyncTime).getTime()) / (1000 * 60 * 60)

      if (hoursSinceSync < 12) {
        dataFreshness = 'fresh'
        freshnessMessage = `Actualizado hace ${Math.floor(hoursSinceSync)} horas`
      } else if (hoursSinceSync < 24) {
        dataFreshness = 'acceptable'
        freshnessMessage = 'Actualizado hoy'
      } else if (hoursSinceSync < 48) {
        dataFreshness = 'stale'
        freshnessMessage = 'Actualizado ayer'
      } else {
        dataFreshness = 'outdated'
        freshnessMessage = `Actualizado hace ${Math.floor(hoursSinceSync / 24)} días`
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        lastSyncTime,
        canSyncNow: syncPermission.canSync,
        hoursUntilNextSync: syncPermission.hoursUntilNext,
        dataFreshness,
        freshnessMessage,
        recentJobs,
      },
    })
  } catch (error) {
    console.error('Error fetching sync status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sync status',
      },
      { status: 500 }
    )
  }
}
