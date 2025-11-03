/**
 * Custom hook for managing Facebook/Instagram data synchronization
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface SyncProgress {
  total: number
  completed: number
  failed: number
  current?: string
}

interface SyncResult {
  success: boolean
  message: string
  jobId?: string
  results?: {
    totalAgents: number
    successfulSyncs: number
    failedSyncs: number
    totalApiCalls: number
  }
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)

  /**
   * Sync all agents
   */
  const syncAll = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true)
    setProgress({ total: 0, completed: 0, failed: 0 })

    try {
      const response = await fetch('/api/sync/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('No autorizado', {
            description: 'Debes iniciar sesión para sincronizar datos',
          })
          return { success: false, message: data.error }
        }

        if (response.status === 403) {
          toast.error('Acceso denegado', {
            description: 'Solo los administradores pueden sincronizar datos',
          })
          return { success: false, message: data.error }
        }

        if (response.status === 429) {
          toast.error('Sincronización en espera', {
            description: data.message || 'Debes esperar antes de sincronizar nuevamente',
          })
          return { success: false, message: data.message }
        }

        toast.error('Error en la sincronización', {
          description: data.error || 'Ocurrió un error al sincronizar los datos',
        })
        return { success: false, message: data.error }
      }

      // Success
      if (data.results) {
        setProgress({
          total: data.results.totalAgents,
          completed: data.results.successfulSyncs,
          failed: data.results.failedSyncs,
        })

        if (data.results.failedSyncs === 0) {
          toast.success('Sincronización completada', {
            description: `${data.results.successfulSyncs} agentes sincronizados exitosamente`,
          })
        } else {
          toast.warning('Sincronización completada con errores', {
            description: `${data.results.successfulSyncs} exitosos, ${data.results.failedSyncs} fallidos`,
          })
        }
      } else {
        toast.success('Sincronización iniciada', {
          description: data.message,
        })
      }

      return {
        success: true,
        message: data.message,
        jobId: data.jobId,
        results: data.results,
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      })
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  /**
   * Sync a single agent
   */
  const syncAgent = useCallback(async (agentId: string): Promise<SyncResult> => {
    setIsSyncing(true)

    try {
      const response = await fetch(`/api/sync/agent/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('No autorizado', {
            description: 'Debes iniciar sesión para sincronizar datos',
          })
          return { success: false, message: data.error }
        }

        if (response.status === 403) {
          toast.error('Acceso denegado', {
            description: 'No tienes permiso para sincronizar este agente',
          })
          return { success: false, message: data.error }
        }

        if (response.status === 429) {
          toast.error('Sincronización en espera', {
            description: data.message || 'Debes esperar antes de sincronizar este agente',
          })
          return { success: false, message: data.message }
        }

        toast.error('Error en la sincronización', {
          description: data.error || 'Ocurrió un error al sincronizar el agente',
        })
        return { success: false, message: data.error }
      }

      // Success
      toast.success('Agente sincronizado', {
        description: data.message,
      })

      return {
        success: true,
        message: data.message,
        jobId: data.jobId,
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      })
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  /**
   * Check sync status
   */
  const checkSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sync/status')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to check sync status:', error)
      return null
    }
  }, [])

  /**
   * Check rate limit status
   */
  const checkRateLimit = useCallback(async () => {
    try {
      const response = await fetch('/api/sync/rate-limit')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to check rate limit:', error)
      return null
    }
  }, [])

  return {
    isSyncing,
    progress,
    syncAll,
    syncAgent,
    checkSyncStatus,
    checkRateLimit,
  }
}
