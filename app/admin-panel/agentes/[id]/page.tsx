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
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChevronLeft, Instagram, Facebook, BarChart3, Share2, TrendingUp as TrendingUpIcon, User, ExternalLink, Home } from "lucide-react"
import { getAgentById } from "@/lib/data/mock-agents"
import { getPropertiesByAgentId } from "@/lib/data/mock-properties"
import { PropertiesTable } from "@/components/properties-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  const agent = getAgentById(agentId)
  const properties = getPropertiesByAgentId(agentId)

  const [clientesMetric, setClientesMetric] = useState<"contactados" | "activos" | "cerrados">("cerrados")
  const [contenidoMetric, setContenidoMetric] = useState<"publicaciones" | "alcance">("publicaciones")
  const [timeFilter, setTimeFilter] = useState<"dia" | "semana" | "mes" | "año">("mes")

  // Generate performance data based on time filter
  const performanceHistory = useMemo(() => {
    if (!agent) return []

    const basePerformanceHistory = agent.performanceHistory || []

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
  }, [agent, timeFilter])

  // Generate alcance history (memoized to prevent regeneration on unrelated state changes)
  const contentHistory = useMemo(() =>
    performanceHistory.map((month) => ({
      month: month.month,
      publicaciones: month.publicaciones || 0,
      alcance: Math.floor((month.publicaciones || 0) * 1500 + Math.random() * 3000),
    })),
    [performanceHistory]
  )

  if (!agent) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader
            breadcrumb={
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => router.push("/dashboard")}
                      className="cursor-pointer"
                    >
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Agente no encontrado</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            }
          />
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
                  <BreadcrumbLink
                    onClick={() => router.push("/dashboard")}
                    className="cursor-pointer"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{agent.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-1.5 rounded-full shadow-sm bg-primary hover:bg-primary/90"
            >
              <ChevronLeft className="size-4" />
              Volver
            </Button>
          }
        />

        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
          {/* Agent Header */}
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <User className="size-8 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{agent.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={() => window.open(`https://wa.me/${agent.phone?.replace(/\D/g, '')}`, '_blank')}
                >
                  <ExternalLink className="size-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{agent.email}</p>
            </div>
          </div>

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
                <TabsTrigger value="propiedades" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
                  <Home className="size-4" />
                  Propiedades
                </TabsTrigger>
              </TabsList>

              <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as "dia" | "semana" | "mes" | "año")}>
                <SelectTrigger className="w-[140px] h-9 border-border/50 shadow-sm">
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
                          onValueChange={(value) => setClientesMetric(value as "contactados" | "activos" | "cerrados")}
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
                    <CardContent className="px-1 sm:px-2 lg:px-3 pt-0 pb-4 sm:pb-6">
                      <ChartContainer config={clientesChartConfig} className="h-[180px] sm:h-[200px] lg:h-[240px] w-full">
                        <LineChart
                          accessibilityLayer
                          data={performanceHistory}
                          margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10 }} className="text-[9px] sm:text-[10px]" />
                          <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={{ fontSize: 10 }} width={28} className="text-[9px] sm:text-[10px]" />
                          <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={<ChartTooltipContent className="text-xs" />} />
                          <Line
                            key={`clientes-${clientesMetric}`}
                            dataKey={clientesMetric}
                            type="monotone"
                            stroke={`var(--color-${clientesMetric})`}
                            strokeWidth={2}
                            dot={{ fill: `var(--color-${clientesMetric})`, strokeWidth: 1.5, r: 3, stroke: "hsl(var(--background))" }}
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
                          onValueChange={(value) => setContenidoMetric(value as "publicaciones" | "alcance")}
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
                    <CardContent className="px-1 sm:px-2 lg:px-3 pt-0 pb-4 sm:pb-6">
                      <ChartContainer config={contenidoChartConfig} className="h-[180px] sm:h-[200px] lg:h-[240px] w-full">
                        <LineChart
                          accessibilityLayer
                          data={contentHistory}
                          margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10 }} className="text-[9px] sm:text-[10px]" />
                          <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={{ fontSize: 10 }} width={28} className="text-[9px] sm:text-[10px]" />
                          <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={<ChartTooltipContent className="text-xs" />} />
                          <Line
                            key={`contenido-${contenidoMetric}`}
                            dataKey={contenidoMetric}
                            type="monotone"
                            stroke={`var(--color-${contenidoMetric})`}
                            strokeWidth={2}
                            dot={{ fill: `var(--color-${contenidoMetric})`, strokeWidth: 1.5, r: 3, stroke: "hsl(var(--background))" }}
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
            <TabsContent value="redes" className="mt-6 space-y-6">
              {/* Social Media Metrics */}
              <div className="grid gap-3 md:grid-cols-4">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Seguidores Totales
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{agent.monthlyMetrics.followers.toLocaleString()}</span>
                      <span className="text-xs text-emerald-600 font-medium">+{agent.monthlyMetrics.followerGrowth}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Posts
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{agent.monthlyMetrics.posts}</span>
                      <span className="text-xs text-muted-foreground">{getTimeLabel()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Alcance
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{agent.monthlyMetrics.reach.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{getTimeLabel()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Engagement
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{agent.monthlyMetrics.engagementRate}%</span>
                      <span className="text-xs text-muted-foreground">tasa</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Followers Growth Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Crecimiento de Seguidores</CardTitle>
                    <CardDescription className="text-xs">
                      Evolución {getChartPeriodLabel()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pt-0 pb-6">
                    <ChartContainer
                      config={{
                        seguidores: {
                          label: "Seguidores",
                          color: "#0b49e9",
                        },
                      }}
                      className="h-[240px] w-full"
                    >
                      <LineChart
                        accessibilityLayer
                        data={performanceHistory.map((month, i) => ({
                          month: month.month,
                          seguidores: Math.floor(agent.monthlyMetrics.followers * (0.85 + i * 0.03)),
                        }))}
                        margin={{ left: 12, right: 12, top: 16, bottom: 16 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} width={40} />
                        <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={<ChartTooltipContent />} />
                        <Line
                          dataKey="seguidores"
                          type="monotone"
                          stroke="var(--color-seguidores)"
                          strokeWidth={2.5}
                          dot={{ fill: "var(--color-seguidores)", strokeWidth: 2, r: 4, stroke: "hsl(var(--background))" }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Engagement & Reach Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Alcance y Engagement</CardTitle>
                    <CardDescription className="text-xs">
                      Evolución {getChartPeriodLabel()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pt-0 pb-6">
                    <ChartContainer
                      config={{
                        alcance: {
                          label: "Alcance",
                          color: "#0b49e9",
                        },
                        engagement: {
                          label: "Engagement",
                          color: "#7c3aed",
                        },
                      }}
                      className="h-[240px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={performanceHistory.map((month) => ({
                          month: month.month,
                          alcance: Math.floor((month.publicaciones || 0) * 1200 + Math.random() * 2000),
                          engagement: Math.floor(150 + Math.random() * 100),
                        }))}
                        margin={{ left: 12, right: 12, top: 16, bottom: 16 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} width={40} />
                        <ChartTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} content={<ChartTooltipContent />} />
                        <Bar dataKey="alcance" fill="var(--color-alcance)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Social Media Breakdown */}
              {agent.socialMediaBreakdown && agent.socialMediaBreakdown.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {agent.socialMediaBreakdown.map((social) => (
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
                        <div className="grid gap-3 grid-cols-2">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Seguidores
                            </p>
                            <p className="mt-1 text-xl font-bold">{social.followers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Posts
                            </p>
                            <p className="mt-1 text-xl font-bold">{social.posts}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Alcance
                            </p>
                            <p className="mt-1 text-xl font-bold">{social.reach.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Engagement
                            </p>
                            <p className="mt-1 text-xl font-bold">{social.engagementRate}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Ventas Tab */}
            <TabsContent value="ventas" className="mt-6 space-y-6">
              {/* Sales Metrics */}
              <div className="grid gap-3 md:grid-cols-4">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Ingresos Totales
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">₲{salesMetrics.totalRevenue.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{getTimeLabel()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Valor Promedio
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">₲{salesMetrics.avgDealValue.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">por venta</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Tasa de Conversión
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{salesMetrics.conversionRate}%</span>
                      <Progress value={salesMetrics.conversionRate} className="h-1.5 w-16" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="px-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Propiedades
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{agent.totalProperties}</span>
                      <span className="text-xs text-muted-foreground">gestionadas</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Evolución de Ingresos</CardTitle>
                    <CardDescription className="text-xs">
                      Ingresos {getChartPeriodLabel()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pt-0 pb-6">
                    <ChartContainer
                      config={{
                        ingresos: {
                          label: "Ingresos",
                          color: "#0b49e9",
                        },
                      }}
                      className="h-[240px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={performanceHistory.map((month) => ({
                          month: month.month,
                          ingresos: Math.floor((month.cerrados || 0) * salesMetrics.avgDealValue * (0.9 + Math.random() * 0.2)),
                        }))}
                        margin={{ left: 12, right: 12, top: 16, bottom: 16 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12 }}
                          width={70}
                          tickFormatter={(value) => `₲${value.toLocaleString()}`}
                        />
                        <ChartTooltip
                          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                          content={<ChartTooltipContent
                            formatter={(value) => `₲${Number(value).toLocaleString()}`}
                          />}
                        />
                        <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Conversion Funnel Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Embudo de Conversión</CardTitle>
                    <CardDescription className="text-xs">
                      Progreso {getTimeLabel()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pt-0 pb-6">
                    <ChartContainer
                      config={{
                        contactados: {
                          label: "Contactados",
                          color: "#0b49e9",
                        },
                        activos: {
                          label: "Activos",
                          color: "#7c3aed",
                        },
                        cerrados: {
                          label: "Cerrados",
                          color: "#10b981",
                        },
                      }}
                      className="h-[240px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={[
                          { stage: "Contactados", value: salesMetrics.contacted },
                          { stage: "Activos", value: salesMetrics.active },
                          { stage: "Cerrados", value: salesMetrics.closed },
                        ]}
                        margin={{ left: 12, right: 12, top: 16, bottom: 16 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} width={80} />
                        <ChartTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#0b49e9" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Propiedades Tab */}
            <TabsContent value="propiedades" className="mt-6">
              {properties.length > 0 ? (
                <PropertiesTable properties={properties} />
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Home className="mx-auto size-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No hay propiedades</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Este agente no tiene propiedades asignadas
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
