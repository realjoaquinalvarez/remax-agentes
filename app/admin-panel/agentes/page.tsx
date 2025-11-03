"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Share2, Loader2 } from "lucide-react"
import { AgentsTableSimple } from "@/components/agents-table-simple"
import { SyncButton } from "@/components/sync-button"
import { useAgents } from "@/hooks/use-agents"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AgentsPage() {
  const { agents, loading, error, refetch } = useAgents()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Agentes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          actions={<SyncButton variant="outline" />}
        />
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agentes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rendimiento y métricas de todos los agentes conectados
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-sm text-muted-foreground">Cargando agentes...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="destructive">
              <AlertTitle>Error al cargar agentes</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && agents.length === 0 && (
            <Alert>
              <AlertTitle>No hay agentes conectados</AlertTitle>
              <AlertDescription>
                Los agentes aparecerán aquí cuando se conecten mediante OAuth de Facebook.
              </AlertDescription>
            </Alert>
          )}

          {/* Agents List */}
          {!loading && !error && agents.length > 0 && (
            <Tabs defaultValue="redes" className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1">
                <TabsTrigger value="redes" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                  <Share2 className="size-4" />
                  Redes Sociales ({agents.filter(a => a.is_facebook_connected).length})
                </TabsTrigger>
                <TabsTrigger value="todos" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                  <BarChart3 className="size-4" />
                  Todos ({agents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="redes" className="mt-6">
                <AgentsTableSimple
                  agents={agents.filter(a => a.is_facebook_connected)}
                />
              </TabsContent>

              <TabsContent value="todos" className="mt-6">
                <AgentsTableSimple
                  agents={agents}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
