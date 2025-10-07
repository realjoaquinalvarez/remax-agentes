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
import { ArrowLeft, Instagram, Facebook, BarChart3, Share2, TrendingUp as TrendingUpIcon } from "lucide-react"
import { getAgentById } from "@/lib/data/mock-agents"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  const agent = getAgentById(agentId)

  const [clientesMetric, setClientesMetric] = useState<"contactados" | "activos" | "cerrados">("cerrados")
  const [contenidoMetric, setContenidoMetric] = useState<"publicaciones" | "alcance">("publicaciones")
  const [timeFilter, setTimeFilter] = useState<"dia" | "semana" | "mes" | "año">("mes")

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

  // Calculate metrics based on time filter
  const getTimeFilteredMetrics = () => {
    const baseMetrics = agent.salesMetrics || {
      contacted: (agent.monthlyMetrics.leads || 0) * 3,
      active: Math.floor((agent.monthlyMetrics.leads || 0) * 0.5),
      closed: agent.monthlyMetrics.leads || 0,
      conversionRate: 33.3,
      avgDealValue: 250000,
      totalRevenue: (agent.monthlyMetrics.leads || 0) * 250000,
    }

    const multipliers = {
      dia: 0.033,
      semana: 0.25,
      mes: 1,
      año: 12,
    }

    const multiplier = multipliers[timeFilter]

    return {
      contacted: Math.floor(baseMetrics.contacted * multiplier),
      active: Math.floor(baseMetrics.active * multiplier),
      closed: Math.floor(baseMetrics.closed * multiplier),
      posts: Math.floor(agent.monthlyMetrics.posts * multiplier),
      conversionRate: baseMetrics.conversionRate,
      avgDealValue: baseMetrics.avgDealValue,
      totalRevenue: Math.floor(baseMetrics.totalRevenue * multiplier),
    }
  }

  const salesMetrics = getTimeFilteredMetrics()

  const getTimeLabel = () => {
    const labels = {
      dia: "hoy",
      semana: "esta semana",
      mes: "este mes",
      año: "este año",
    }
    return labels[timeFilter]
  }

  const getChartPeriodLabel = () => {
    const labels = {
      dia: "últimas 24 horas",
      semana: "últimas 4 semanas",
      mes: "últimos 6 meses",
      año: "últimos 12 meses",
    }
    return labels[timeFilter]
  }

  const basePerformanceHistory = agent.performanceHistory || []

  // Generate performance data based on time filter
  const performanceHistory = useMemo(() => {
    if (basePerformanceHistory.length === 0) return []

    const baseData = basePerformanceHistory[basePerformanceHistory.length - 1]

    if (timeFilter === "dia") {
      // Last 24 hours (hourly data)
      return Array.from({ length: 24 }, (_, i) => ({
        month: `${i}h`,
        contactados: Math.floor((baseData.contactados || 0) / 30 + Math.random() * 5),
        activos: Math.floor((baseData.activos || 0) / 30 + Math.random() * 2),
        cerrados: Math.floor((baseData.cerrados || 0) / 30 + Math.random() * 2),
        publicaciones: Math.floor((baseData.publicaciones || 0) / 30 + Math.random() * 2),
      }))
    } else if (timeFilter === "semana") {
      // Last 4 weeks (weekly data)
      return Array.from({ length: 4 }, (_, i) => ({
        month: `S${i + 1}`,
        contactados: Math.floor((baseData.contactados || 0) / 4 + Math.random() * 10),
        activos: Math.floor((baseData.activos || 0) / 4 + Math.random() * 5),
        cerrados: Math.floor((baseData.cerrados || 0) / 4 + Math.random() * 3),
        publicaciones: Math.floor((baseData.publicaciones || 0) / 4 + Math.random() * 3),
      }))
    } else if (timeFilter === "año") {
      // Last 12 months
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      return months.map((month, i) => {
        const isCurrentMonth = i === months.length - 1
        return {
          month,
          contactados: isCurrentMonth ? (baseData.contactados || 0) : Math.floor((baseData.contactados || 0) * (0.8 + Math.random() * 0.4)),
          activos: isCurrentMonth ? (baseData.activos || 0) : Math.floor((baseData.activos || 0) * (0.8 + Math.random() * 0.4)),
          cerrados: isCurrentMonth ? (baseData.cerrados || 0) : Math.floor((baseData.cerrados || 0) * (0.8 + Math.random() * 0.4)),
          publicaciones: isCurrentMonth ? (baseData.publicaciones || 0) : Math.floor((baseData.publicaciones || 0) * (0.8 + Math.random() * 0.4)),
        }
      })
    }

    // Default: mes (last 6 months)
    return basePerformanceHistory
  }, [basePerformanceHistory, timeFilter])

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

  // Generate alcance history (memoized to prevent regeneration on unrelated state changes)
  const contentHistory = useMemo(() =>
    performanceHistory.map((month) => ({
      month: month.month,
      publicaciones: month.publicaciones || 0,
      alcance: Math.floor((month.publicaciones || 0) * 1500 + Math.random() * 3000),
    })),
    [performanceHistory]
  )

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
            <div className="flex items-center justify-between gap-4">
              <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1">
                <TabsTrigger value="resumen" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                  <BarChart3 className="size-4" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="redes" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                  <Share2 className="size-4" />
                  Redes Sociales
                </TabsTrigger>
                <TabsTrigger value="ventas" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                  <TrendingUpIcon className="size-4" />
                  Ventas
                </TabsTrigger>
              </TabsList>

              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Día</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                  <SelectItem value="año">Año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resumen Tab */}
            <TabsContent value="resumen" className="mt-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Contactados
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{salesMetrics.contacted}</span>
                      <span className="text-xs text-muted-foreground">{getTimeLabel()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Activos
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{salesMetrics.active}</span>
                      <span className="text-xs text-muted-foreground">en proceso</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Cerrados
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{salesMetrics.closed}</span>
                      <span className="text-xs text-muted-foreground">{getTimeLabel()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Publicaciones
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{salesMetrics.posts}</span>
                      <span className="text-xs text-muted-foreground">{getTimeLabel()}</span>
                    </div>
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
                            Evolución {getChartPeriodLabel()}
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
                            Evolución {getChartPeriodLabel()}
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
                    <p className="mt-1 text-xs text-muted-foreground">{getTimeLabel()}</p>
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
