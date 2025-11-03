/**
 * Rate Limit Helpers
 * Functions to check and manage Facebook API rate limits
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface RateLimitStatus {
  canProceed: boolean
  currentUsage: number
  maxAllowed: number
  hourWindow: string
  callsRemaining: number
  percentageUsed: number
}

/**
 * Check if we can make API calls
 */
export async function checkRateLimit(
  callsNeeded: number = 1
): Promise<RateLimitStatus> {
  const supabase = createAdminClient()

  // Get current hour window
  // @ts-expect-error - Supabase RPC types not fully inferred
  const { data: canMakeCall } = await supabase.rpc('can_make_api_calls', {
    calls_needed: callsNeeded,
  })

  // Get current hour stats
  const hourWindow = new Date()
  hourWindow.setMinutes(0, 0, 0)

  const { data: rateLimitData } = await supabase
    .from('api_rate_limits')
    .select('*')
    .eq('hour_window', hourWindow.toISOString())
    .maybeSingle()

  const currentUsage = (rateLimitData as any)?.calls_made || 0
  const maxAllowed = (rateLimitData as any)?.max_calls_allowed || 200

  return {
    canProceed: canMakeCall || false,
    currentUsage,
    maxAllowed,
    hourWindow: hourWindow.toISOString(),
    callsRemaining: Math.max(0, maxAllowed - currentUsage),
    percentageUsed: Math.min(100, (currentUsage / maxAllowed) * 100),
  }
}

/**
 * Increment API call counter
 */
export async function incrementApiCalls(callsMade: number = 1): Promise<void> {
  const supabase = createAdminClient()

  // @ts-expect-error - Supabase RPC types not fully inferred
  await supabase.rpc('increment_api_calls', {
    calls_made_count: callsMade,
  })
}

/**
 * Get rate limit status for display
 */
export async function getRateLimitStatus(): Promise<{
  status: 'safe' | 'warning' | 'critical' | 'blocked'
  message: string
  details: RateLimitStatus
}> {
  const details = await checkRateLimit(1)

  let status: 'safe' | 'warning' | 'critical' | 'blocked'
  let message: string

  if (details.percentageUsed >= 100) {
    status = 'blocked'
    message = 'Límite de API alcanzado. Espera hasta la próxima hora.'
  } else if (details.percentageUsed >= 90) {
    status = 'critical'
    message = `API usage crítico: ${Math.floor(details.percentageUsed)}% usado`
  } else if (details.percentageUsed >= 50) {
    status = 'warning'
    message = `API usage moderado: ${Math.floor(details.percentageUsed)}% usado`
  } else {
    status = 'safe'
    message = `API usage bajo: ${Math.floor(details.percentageUsed)}% usado`
  }

  return { status, message, details }
}
