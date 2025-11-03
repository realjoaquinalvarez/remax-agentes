/**
 * Sync Job Logger
 * Functions to create and update sync job records
 */

import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type SyncType = Database['public']['Tables']['sync_jobs']['Row']['sync_type']
type SyncStatus = Database['public']['Tables']['sync_jobs']['Row']['status']

export interface SyncJobData {
  id: string
  sync_type: SyncType
  status: SyncStatus
  agent_id?: string
  triggered_by_user_id?: string
  total_agents: number
  agents_synced: number
  agents_failed: number
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  error_message?: string
  api_calls_made: number
}

/**
 * Create a new sync job record
 */
export async function createSyncJob(params: {
  syncType: SyncType
  agentId?: string
  triggeredByUserId?: string
  totalAgents?: number
}): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('sync_jobs')
    .insert({
      sync_type: params.syncType,
      status: 'pending',
      agent_id: params.agentId || null,
      triggered_by_user_id: params.triggeredByUserId || null,
      total_agents: params.totalAgents || 0,
      agents_synced: 0,
      agents_failed: 0,
      api_calls_made: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating sync job:', error)
    throw new Error('Failed to create sync job')
  }

  return data.id
}

/**
 * Update sync job status to running
 */
export async function startSyncJob(jobId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('sync_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}

/**
 * Update sync job progress
 */
export async function updateSyncJobProgress(params: {
  jobId: string
  agentsSynced?: number
  agentsFailed?: number
  apiCallsMade?: number
}): Promise<void> {
  const supabase = createAdminClient()

  const updateData: Partial<Database['public']['Tables']['sync_jobs']['Update']> = {}

  if (params.agentsSynced !== undefined) {
    updateData.agents_synced = params.agentsSynced
  }
  if (params.agentsFailed !== undefined) {
    updateData.agents_failed = params.agentsFailed
  }
  if (params.apiCallsMade !== undefined) {
    updateData.api_calls_made = params.apiCallsMade
  }

  await supabase.from('sync_jobs').update(updateData).eq('id', params.jobId)
}

/**
 * Complete sync job
 */
export async function completeSyncJob(params: {
  jobId: string
  status: 'completed' | 'failed' | 'partial'
  errorMessage?: string
  failedAgentIds?: string[]
}): Promise<void> {
  const supabase = createAdminClient()

  const completedAt = new Date().toISOString()

  // Get started_at to calculate duration
  const { data: job } = await supabase
    .from('sync_jobs')
    .select('started_at')
    .eq('id', params.jobId)
    .single()

  let durationSeconds: number | null = null

  if (job?.started_at) {
    const startTime = new Date(job.started_at).getTime()
    const endTime = new Date(completedAt).getTime()
    durationSeconds = Math.floor((endTime - startTime) / 1000)
  }

  await supabase
    .from('sync_jobs')
    .update({
      status: params.status,
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      error_message: params.errorMessage || null,
      failed_agent_ids: params.failedAgentIds || null,
    })
    .eq('id', params.jobId)
}

/**
 * Get recent sync jobs
 */
export async function getRecentSyncJobs(limit: number = 10): Promise<SyncJobData[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sync jobs:', error)
    return []
  }

  return data as SyncJobData[]
}

/**
 * Get last successful sync time
 */
export async function getLastSyncTime(): Promise<string | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('sync_jobs')
    .select('completed_at')
    .eq('status', 'completed')
    .eq('sync_type', 'manual_all')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  return data?.completed_at || null
}

/**
 * Check if we can sync (12 hour minimum between syncs)
 */
export async function canSyncNow(): Promise<{
  canSync: boolean
  lastSyncTime: string | null
  hoursUntilNext: number
}> {
  const lastSync = await getLastSyncTime()

  if (!lastSync) {
    return {
      canSync: true,
      lastSyncTime: null,
      hoursUntilNext: 0,
    }
  }

  const lastSyncDate = new Date(lastSync)
  const now = new Date()
  const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60)
  const minimumHours = 12

  return {
    canSync: hoursSinceLastSync >= minimumHours,
    lastSyncTime: lastSync,
    hoursUntilNext: Math.max(0, minimumHours - hoursSinceLastSync),
  }
}
