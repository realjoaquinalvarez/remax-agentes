/**
 * GET /api/sync/rate-limit
 * Get current API rate limit status
 */

import { NextResponse } from 'next/server'
import { getRateLimitStatus } from '@/lib/api/rate-limit'

export async function GET() {
  try {
    const rateLimitStatus = await getRateLimitStatus()

    return NextResponse.json({
      success: true,
      data: rateLimitStatus,
    })
  } catch (error) {
    console.error('Error fetching rate limit status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rate limit status',
      },
      { status: 500 }
    )
  }
}
