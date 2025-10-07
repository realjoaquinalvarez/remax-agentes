"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ArrowLeft, TrendingUp, Instagram, Facebook } from "lucide-react"
import { getAgentById } from "@/lib/data/mock-agents"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  const agent = getAgentById(agentId)

  const [clientesMetric, setClientesMetric] = useState<"contactados" | "activos" | "cerrados">("contactados")
  const [contenidoMetric, setContenidoMetric] = useState<"publicaciones" | "alcance">("publicaciones")

  if (!agent) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Agente no encontrado" />
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Agente no encontrado</h2>
              <p className="mt-2 text-muted-foreground">El agente que buscas no existe</p>
              <Button onClick={() => router.push("/dashboard")} className="mt-4">
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const salesMetrics = agent.salesMetrics || {
    contacted: (agent.monthlyMetrics.leads || 0) * 3,
    active: Math.floor((agent.monthlyMetrics.leads || 0) * 0.5),
    closed: agent.monthlyMetrics.leads || 0,
    conversionRate: 33.3,
    avgDealValue: 250000,
    totalRevenue: (agent.monthlyMetrics.leads || 0) * 250000,
  }

  const performanceHistory = agent.performanceHistory || []

  const clientesChartConfig = {
    contactados: {
      label: "Contactados",
      color: "#0b49e9",
    },
    activos: {
      label: "Activos",
      color: "#0b49e9",
    },
    cerrados: {
      label: "Cerrados",
      color: "#0b49e9",
    },
  } satisfies ChartConfig

  const contenidoChartConfig = {
    publicaciones: {
      label: "Publicaciones",
      color: "#0b49e9",
    },
    alcance: {
      label: "Alcance",
      color: "#0b49e9",
    },
  } satisfies ChartConfig

  // Generate alcance history
  const contentHistory = performanceHistory.map((month) => ({
    month: month.month,
    publicaciones: month.publicaciones || 0,
    alcance: Math.floor((month.publicaciones || 0) * 1500 + Math.random() * 3000),
  }))

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
        <SiteHeader title="">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        </SiteHeader>

        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
          {/* Agent Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">
                  {agent.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{agent.email}</p>
              </div>
            </div>
            <Badge variant={agent.status === "active" ? "default" : "secondary"}>
              {agent.status === "active" ? "Activo" : agent.status}
            </Badge>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="resumen" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="redes">Redes Sociales</TabsTrigger>
              <TabsTrigger value="ventas">Ventas</TabsTrigger>
            </TabsList>

            {/* Resumen Tab */}
            <TabsContent value="resumen" className="mt-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Contactados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{salesMetrics.contacted}</div>
                    <p className="mt-1 text-xs text-muted-foreground">este mes</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Activos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{salesMetrics.active}</div>
                    <p className="mt-1 text-xs text-muted-foreground">en proceso</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Cerrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{salesMetrics.closed}</div>
                    <p className="mt-1 text-xs text-muted-foreground">este mes</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Publicaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{agent.monthlyMetrics.posts}</div>
                    <p className="mt-1 text-xs text-muted-foreground">este mes</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {performanceHistory.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Clientes Chart */}
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base font-semibold">Rendimiento de Clientes</CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Evolución últimos 6 meses
                          </CardDescription>
                        </div>
                        <Select
                          value={clientesMetric}
                          onValueChange={(value: any) => setClientesMetric(value)}
                          key="clientes-metric-select"
                        >
                          <SelectTrigger className="w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contactados">Contactados</SelectItem>
                            <SelectItem value="activos">Activos</SelectItem>
                            <SelectItem value="cerrados">Cerrados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pt-0 pb-6">
                      <ChartContainer config={clientesChartConfig} className="h-[240px] w-full">
                        <LineChart
                          accessibilityLayer
                          data={performanceHistory}
                          margin={{ left: 12, right: 12, top: 16, bottom: 16 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} width={40} />
                          <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={<ChartTooltipContent />} />
                          <Line
                            key={`clientes-${clientesMetric}`}
                            dataKey={clientesMetric}
                            type="monotone"
                            stroke={`var(--color-${clientesMetric})`}
                            strokeWidth={2.5}
                            dot={{ fill: `var(--color-${clientesMetric})`, strokeWidth: 2, r: 4, stroke: "hsl(var(--background))" }}
                            animationDuration={300}
                            isAnimationActive={true}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Contenido Chart */}
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base font-semibold">Rendimiento de Contenido</CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Evolución últimos 6 meses
                          </CardDescription>
                        </div>
                        <Select
                          value={contenidoMetric}
                          onValueChange={(value: any) => setContenidoMetric(value)}
                          key="contenido-metric-select"
                        >
                          <SelectTrigger className="w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="publicaciones">Publicaciones</SelectItem>
                            <SelectItem value="alcance">Alcance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pt-0 pb-6">
                      <ChartContainer config={contenidoChartConfig} className="h-[240px] w-full">
                        <LineChart
                          accessibilityLayer
                          data={contentHistory}
                          margin={{ left: 12, right: 12, top: 16, bottom: 16 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} width={40} />
                          <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={<ChartTooltipContent />} />
                          <Line
                            key={`contenido-${contenidoMetric}`}
                            dataKey={contenidoMetric}
                            type="monotone"
                            stroke={`var(--color-${contenidoMetric})`}
                            strokeWidth={2.5}
                            dot={{ fill: `var(--color-${contenidoMetric})`, strokeWidth: 2, r: 4, stroke: "hsl(var(--background))" }}
                            animationDuration={300}
                            isAnimationActive={true}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Redes Sociales Tab */}
            <TabsContent value="redes" className="mt-6 space-y-4">
              {agent.socialMediaBreakdown?.map((social) => (
                <Card key={social.platform} className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {social.platform === "instagram" ? (
                        <Instagram className="size-5 text-primary" />
                      ) : (
                        <Facebook className="size-5 text-primary" />
                      )}
                      <CardTitle className="text-base font-semibold capitalize">
                        {social.platform}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Seguidores
                        </p>
                        <p className="mt-1 text-2xl font-bold">{social.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Posts
                        </p>
                        <p className="mt-1 text-2xl font-bold">{social.posts}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Alcance
                        </p>
                        <p className="mt-1 text-2xl font-bold">{social.reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Engagement
                        </p>
                        <p className="mt-1 text-2xl font-bold">{social.engagementRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    No hay datos de redes sociales disponibles
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ventas Tab */}
            <TabsContent value="ventas" className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Tasa de Conversión
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{salesMetrics.conversionRate}%</div>
                    <Progress value={salesMetrics.conversionRate} className="mt-3 h-2" />
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Valor Promedio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">
                      €{salesMetrics.avgDealValue.toLocaleString()}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">por venta</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Ingresos Totales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">
                      €{salesMetrics.totalRevenue.toLocaleString()}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">este mes</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      Propiedades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{agent.totalProperties}</div>
                    <p className="mt-1 text-xs text-muted-foreground">gestionadas</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
