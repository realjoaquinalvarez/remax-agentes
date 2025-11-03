"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { useSync } from "@/hooks/use-sync"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SyncButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  showProgress?: boolean
}

export function SyncButton({
  className,
  variant = "default",
  showProgress = true
}: SyncButtonProps) {
  const { isSyncing, progress, syncAll } = useSync()
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const handleSync = async () => {
    const result = await syncAll()
    if (result.success) {
      setLastSyncTime(new Date())
    }
  }

  const getProgressText = () => {
    if (!progress) return null
    if (progress.total === 0) return "Iniciando..."
    return `${progress.completed}/${progress.total}`
  }

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin" />
    }
    if (progress && progress.failed > 0) {
      return <AlertCircle className="w-4 h-4" />
    }
    if (lastSyncTime) {
      return <CheckCircle2 className="w-4 h-4" />
    }
    return <RefreshCw className="w-4 h-4" />
  }

  const getButtonText = () => {
    if (isSyncing) {
      const progressText = getProgressText()
      return progressText ? `Sincronizando ${progressText}` : "Sincronizando..."
    }
    return "Actualizar Datos"
  }

  const getTooltipText = () => {
    if (isSyncing) return "Sincronización en progreso..."
    if (lastSyncTime) {
      return `Última sincronización: ${lastSyncTime.toLocaleTimeString()}`
    }
    return "Sincronizar datos de Facebook e Instagram"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant={variant}
            className={cn(
              "gap-2",
              isSyncing && "cursor-wait",
              className
            )}
          >
            {getStatusIcon()}
            <span>{getButtonText()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
