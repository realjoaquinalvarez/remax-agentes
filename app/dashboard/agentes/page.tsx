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
import { BarChart3, Share2 } from "lucide-react"
import { mockAgents } from "@/lib/data/mock-agents"
import { AgentsTable } from "@/components/agents-table"

export default function AgentsPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
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
        />
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agentes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rendimiento y métricas de todos los agentes
            </p>
          </div>

          <Tabs defaultValue="redes" className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1">
              <TabsTrigger value="redes" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                <Share2 className="size-4" />
                Redes Sociales
              </TabsTrigger>
              <TabsTrigger value="ventas" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                <BarChart3 className="size-4" />
                Ventas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="redes" className="mt-6">
              <AgentsTable agents={mockAgents} type="social" />
            </TabsContent>

            <TabsContent value="ventas" className="mt-6">
              <AgentsTable agents={mockAgents} type="sales" />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
