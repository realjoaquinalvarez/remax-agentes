"use client"

import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DataFreshnessBadgeProps {
  lastSyncDate: Date | string | null
  className?: string
}

export function DataFreshnessBadge({
  lastSyncDate,
  className
}: DataFreshnessBadgeProps) {
  if (!lastSyncDate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("gap-1.5", className)}>
              <XCircle className="w-3 h-3 text-muted-foreground" />
              <span>Sin datos</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>No se han sincronizado datos todavía</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const syncDate = typeof lastSyncDate === 'string'
    ? new Date(lastSyncDate)
    : lastSyncDate

  const now = new Date()
  const hoursSinceSync = (now.getTime() - syncDate.getTime()) / (1000 * 60 * 60)

  // Determine freshness status
  let status: 'fresh' | 'stale' | 'very-stale'
  let icon: React.ReactNode
  let label: string
  let description: string
  let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "outline"

  if (hoursSinceSync < 24) {
    status = 'fresh'
    icon = <CheckCircle className="w-3 h-3 text-green-600" />
    label = "Actualizado"
    description = `Actualizado hace ${Math.floor(hoursSinceSync)} horas`
    badgeVariant = "default"
  } else if (hoursSinceSync < 72) {
    status = 'stale'
    icon = <AlertTriangle className="w-3 h-3 text-yellow-600" />
    label = "Desactualizado"
    description = `Actualizado hace ${Math.floor(hoursSinceSync / 24)} días`
    badgeVariant = "secondary"
  } else {
    status = 'very-stale'
    icon = <Clock className="w-3 h-3 text-red-600" />
    label = "Muy desactualizado"
    description = `Actualizado hace ${Math.floor(hoursSinceSync / 24)} días`
    badgeVariant = "destructive"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={badgeVariant}
            className={cn("gap-1.5", className)}
          >
            {icon}
            <span>{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {syncDate.toLocaleString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface SyncStatusIndicatorProps {
  lastSyncDate: Date | string | null
  syncStatus?: 'success' | 'failed' | 'in_progress' | null
  className?: string
}

export function SyncStatusIndicator({
  lastSyncDate,
  syncStatus,
  className
}: SyncStatusIndicatorProps) {
  const getSyncStatusBadge = () => {
    if (syncStatus === 'in_progress') {
      return (
        <Badge variant="outline" className={cn("gap-1.5", className)}>
          <Clock className="w-3 h-3 animate-spin" />
          <span>Sincronizando...</span>
        </Badge>
      )
    }

    if (syncStatus === 'failed') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className={cn("gap-1.5", className)}>
                <XCircle className="w-3 h-3" />
                <span>Error en sincronización</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>La última sincronización falló</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return <DataFreshnessBadge lastSyncDate={lastSyncDate} className={className} />
  }

  return getSyncStatusBadge()
}
