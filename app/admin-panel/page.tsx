"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { IconTrendingUp, IconArrowUpRight } from "@tabler/icons-react"
import { User } from "lucide-react"
import { mockAgents } from "@/lib/data/mock-agents"
import { SyncButton } from "@/components/sync-button"

const welcomeMessages = [
  "¡Bienvenido, Jefe! Tu equipo está brillando hoy",
  "¡Hola, Líder! Mira todo lo que has construido",
  "¡Bienvenido de vuelta! Tu equipo sigue rompiendo récords",
  "¡Qué bueno verte, Jefe! Aquí están tus números ganadores",
  "¡Bienvenido! Tu liderazgo está dando grandes frutos",
  "¡Hola, Jefe! Prepárate para ver resultados impresionantes",
  "¡De vuelta al comando! Tu equipo está imparable",
  "¡Bienvenido, Líder! Las cifras hablan por sí solas",
]

export default function AdminPanelPage() {
  const router = useRouter()
  const [topPerformersFilter, setTopPerformersFilter] = React.useState<"dia" | "semana" | "mes" | "año">("mes")
  const [timeFilter, setTimeFilter] = React.useState<"6meses" | "mes" | "semana" | "dia">("mes")
  const [chartMetric, setChartMetric] = React.useState<"alcance" | "publicaciones">("alcance")
  const [welcomeMessage] = React.useState(() =>
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  )
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Time filter multipliers
  const getTimeMultiplier = () => {
    const multipliers = {
      "6meses": 6,
      "mes": 1,
      "semana": 0.25,
      "dia": 0.033,
    }
    return multipliers[timeFilter]
  }

  const getTimeLabel = (filter: typeof timeFilter) => {
    const labels = {
      "6meses": "últimos 6 meses",
      "mes": "último mes",
      "semana": "última semana",
      "dia": "hoy",
    }
    return labels[filter]
  }

  // Calculate summary metrics from Facebook data with time filter
  const multiplier = getTimeMultiplier()

  const totalPosts = Math.floor(mockAgents.reduce((sum, agent) => {
    return sum + agent.monthlyMetrics.posts
  }, 0) * multiplier)

  const totalImpressions = Math.floor(mockAgents.reduce((sum, agent) => {
    return sum + agent.monthlyMetrics.impressions
  }, 0) * multiplier)

  const totalReach = Math.floor(mockAgents.reduce((sum, agent) => {
    return sum + agent.monthlyMetrics.reach
  }, 0) * multiplier)

  const avgEngagementRate = mockAgents.reduce((sum, agent) => {
    return sum + agent.monthlyMetrics.engagementRate
  }, 0) / mockAgents.length

  const totalLinkClicks = Math.floor(mockAgents.reduce((sum, agent) => {
    return sum + (agent.monthlyMetrics.linkClicks || 0)
  }, 0) * multiplier)

  // Calculate composite performance score for top performers
  const calculatePerformanceScore = (agent: typeof mockAgents[0]) => {
    const metrics = agent.monthlyMetrics
    // Normalize and weight different metrics
    const postsScore = metrics.posts * 10
    const impressionsScore = metrics.impressions / 1000
    const reachScore = metrics.reach / 500
    const linkClicksScore = (metrics.linkClicks || 0) * 5

    // Apply time filter multiplier
    const multipliers = {
      dia: 0.033,
      semana: 0.25,
      mes: 1,
      año: 12,
    }

    return Math.floor((postsScore + impressionsScore + reachScore + linkClicksScore) * multipliers[topPerformersFilter])
  }

  const getTopPerformersLabel = () => {
    const labels = {
      dia: "hoy",
      semana: "esta semana",
      mes: "este mes",
      año: "este año",
    }
    return labels[topPerformersFilter]
  }

  // Chart data based on time filter
  const getChartData = () => {
    const baseReach = mockAgents.reduce((sum, agent) => sum + agent.monthlyMetrics.reach, 0)
    const basePosts = mockAgents.reduce((sum, agent) => sum + agent.monthlyMetrics.posts, 0)

    if (timeFilter === "6meses") {
      return [
        { period: "Mes 1", alcance: Math.floor(baseReach * 0.7), frecuencia: Math.floor(basePosts * 0.7) },
        { period: "Mes 2", alcance: Math.floor(baseReach * 0.8), frecuencia: Math.floor(basePosts * 0.8) },
        { period: "Mes 3", alcance: Math.floor(baseReach * 0.85), frecuencia: Math.floor(basePosts * 0.85) },
        { period: "Mes 4", alcance: Math.floor(baseReach * 0.9), frecuencia: Math.floor(basePosts * 0.9) },
        { period: "Mes 5", alcance: Math.floor(baseReach * 0.95), frecuencia: Math.floor(basePosts * 0.95) },
        { period: "Mes 6", alcance: baseReach, frecuencia: basePosts },
      ]
    } else if (timeFilter === "mes") {
      return [
        { period: "Sem 1", alcance: Math.floor(baseReach * 0.2), frecuencia: Math.floor(basePosts * 0.2) },
        { period: "Sem 2", alcance: Math.floor(baseReach * 0.4), frecuencia: Math.floor(basePosts * 0.4) },
        { period: "Sem 3", alcance: Math.floor(baseReach * 0.7), frecuencia: Math.floor(basePosts * 0.7) },
        { period: "Sem 4", alcance: baseReach, frecuencia: basePosts },
      ]
    } else if (timeFilter === "semana") {
      return [
        { period: "Lun", alcance: Math.floor(baseReach * 0.14), frecuencia: Math.floor(basePosts * 0.14) },
        { period: "Mar", alcance: Math.floor(baseReach * 0.28), frecuencia: Math.floor(basePosts * 0.28) },
        { period: "Mié", alcance: Math.floor(baseReach * 0.42), frecuencia: Math.floor(basePosts * 0.42) },
        { period: "Jue", alcance: Math.floor(baseReach * 0.57), frecuencia: Math.floor(basePosts * 0.57) },
        { period: "Vie", alcance: Math.floor(baseReach * 0.71), frecuencia: Math.floor(basePosts * 0.71) },
        { period: "Sáb", alcance: Math.floor(baseReach * 0.85), frecuencia: Math.floor(basePosts * 0.85) },
        { period: "Dom", alcance: Math.floor(baseReach * 0.25), frecuencia: Math.floor(basePosts * 0.25) },
      ]
    } else { // dia
      return [
        { period: "6AM", alcance: Math.floor(baseReach * 0.033 * 0.1), frecuencia: Math.floor(basePosts * 0.033 * 0.1) },
        { period: "9AM", alcance: Math.floor(baseReach * 0.033 * 0.3), frecuencia: Math.floor(basePosts * 0.033 * 0.3) },
        { period: "12PM", alcance: Math.floor(baseReach * 0.033 * 0.5), frecuencia: Math.floor(basePosts * 0.033 * 0.5) },
        { period: "3PM", alcance: Math.floor(baseReach * 0.033 * 0.7), frecuencia: Math.floor(basePosts * 0.033 * 0.7) },
        { period: "6PM", alcance: Math.floor(baseReach * 0.033 * 0.9), frecuencia: Math.floor(basePosts * 0.033 * 0.9) },
        { period: "9PM", alcance: Math.floor(baseReach * 0.033), frecuencia: Math.floor(basePosts * 0.033) },
      ]
    }
  }

  const chartData = getChartData()

  const chartConfig = React.useMemo(() => {
    if (chartMetric === "alcance") {
      return {
        alcance: {
          label: "Alcance",
          color: "#0b49e9",
        },
      } as ChartConfig
    } else {
      return {
        frecuencia: {
          label: "Publicaciones",
          color: "#7c3aed",
        },
      } as ChartConfig
    }
  }, [chartMetric])

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
                  <BreadcrumbPage
                    className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {welcomeMessage}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          actions={
            <div className="flex items-center gap-2">
              <SyncButton variant="outline" />
              <Select
                value={timeFilter}
                onValueChange={(value) => {
                  setTimeFilter(value as typeof timeFilter)
                  // Remove focus after selection
                  setTimeout(() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur()
                    }
                  }, 0)
                }}
              >
                <SelectTrigger className="h-8 w-[130px] sm:w-[150px] text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                  <SelectItem value="mes">Último mes</SelectItem>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="dia">Hoy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:gap-8 lg:p-8">
          {/* Admin Panel Header */}
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Panel de Administrador</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Vista general de rendimiento de todos los agentes
            </p>
          </div>

          {/* Main Metrics - Facebook Statistics */}
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 sm:gap-3">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="px-3 py-0 sm:px-4 sm:py-0">
                <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                  Total Publicaciones
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{totalPosts}</div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-2.5 sm:size-3" />
                    8%
                  </div>
                </div>
                <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                  {getTimeLabel(timeFilter)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="px-3 py-0 sm:px-4 sm:py-0">
                <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                  Impresiones Totales
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    {totalImpressions.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-2.5 sm:size-3" />
                    12%
                  </div>
                </div>
                <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                  {getTimeLabel(timeFilter)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="px-3 py-0 sm:px-4 sm:py-0">
                <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                  Alcance Total
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    {totalReach.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-2.5 sm:size-3" />
                    10%
                  </div>
                </div>
                <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                  personas alcanzadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="px-3 py-0 sm:px-4 sm:py-0">
                <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                  Tasa de Engagement
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    {avgEngagementRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-2.5 sm:size-3" />
                    5%
                  </div>
                </div>
                <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                  promedio general
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="px-3 py-0 sm:px-4 sm:py-0">
                <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                  Clicks en Links
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    {totalLinkClicks.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-2.5 sm:size-3" />
                    15%
                  </div>
                </div>
                <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                  incluye WhatsApp
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Top Performers */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="border-border/50 shadow-sm lg:col-span-4 flex flex-col">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base font-semibold truncate">
                      {chartMetric === "alcance" ? "Alcance en el Tiempo" : "Frecuencia de Publicación"}
                    </CardTitle>
                    <CardDescription className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs">
                      {chartMetric === "alcance" ? "Personas alcanzadas" : "Total de publicaciones"} - {getTimeLabel(timeFilter)}
                    </CardDescription>
                  </div>
                  <Tabs value={chartMetric} onValueChange={(value) => setChartMetric(value as typeof chartMetric)}>
                    <TabsList className="h-8">
                      <TabsTrigger value="alcance" className="text-xs px-3 h-7">Alcance</TabsTrigger>
                      <TabsTrigger value="publicaciones" className="text-xs px-3 h-7">Publicaciones</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="px-1 sm:px-2 lg:px-3 pt-0 pb-4 sm:pb-6 flex-1">
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 8,
                      right: 8,
                      top: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                      tick={{ fontSize: 10 }}
                      className="text-[9px] sm:text-[10px] lg:text-xs"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      tick={{ fontSize: 10 }}
                      width={35}
                      className="text-[9px] sm:text-[10px] lg:text-xs"
                    />
                    <ChartTooltip
                      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                      content={<ChartTooltipContent className="text-xs" />}
                    />
                    <Line
                      dataKey={chartMetric === "alcance" ? "alcance" : "frecuencia"}
                      type="monotone"
                      stroke={chartMetric === "alcance" ? "var(--color-alcance)" : "var(--color-frecuencia)"}
                      strokeWidth={2}
                      dot={{
                        fill: chartMetric === "alcance" ? "var(--color-alcance)" : "var(--color-frecuencia)",
                        strokeWidth: 1.5,
                        r: 3,
                        stroke: "hsl(var(--background))",
                        className: "sm:r-4 lg:r-5"
                      }}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        className: "sm:r-6 lg:r-7"
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm lg:col-span-3 flex flex-col">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm sm:text-base font-semibold">Mejores Agentes</CardTitle>
                    <CardDescription className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs">
                      Rendimiento general {getTopPerformersLabel()}
                    </CardDescription>
                  </div>
                  <Select value={topPerformersFilter} onValueChange={(value) => setTopPerformersFilter(value as "dia" | "semana" | "mes" | "año")}>
                    <SelectTrigger className="h-7 sm:h-8 w-[90px] sm:w-[110px] text-[10px] sm:text-xs shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dia">Hoy</SelectItem>
                      <SelectItem value="semana">Semana</SelectItem>
                      <SelectItem value="mes">Mes</SelectItem>
                      <SelectItem value="año">Año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 sm:space-y-2 px-3 sm:px-4 flex-1">
                {mockAgents
                  .map((agent) => ({
                    ...agent,
                    performanceScore: calculatePerformanceScore(agent)
                  }))
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, 4)
                  .map((agent) => {
                    const sortedAgents = mockAgents
                      .map((a) => ({
                        ...a,
                        performanceScore: calculatePerformanceScore(a)
                      }))
                      .sort((a, b) => b.performanceScore - a.performanceScore)
                    const maxScore = sortedAgents[0]?.performanceScore || 1
                    const percentage = (agent.performanceScore / maxScore) * 100

                    return (
                      <div
                        key={agent.id}
                        onClick={() => router.push(`/admin-panel/agentes/${agent.id}`)}
                        className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border/40 bg-card p-2.5 sm:p-3 transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* User Icon */}
                          <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <User className="size-3.5 sm:size-4 text-primary" />
                          </div>

                          {/* Name */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs sm:text-sm font-medium">
                              {agent.name}
                            </p>
                          </div>

                          {/* Performance Score */}
                          <div className="shrink-0 text-right">
                            <div className="text-base sm:text-lg font-semibold text-primary">
                              {agent.performanceScore}
                            </div>
                            <div className="text-[8px] sm:text-[9px] font-medium text-muted-foreground">
                              puntos
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2 sm:mt-3">
                          <Progress value={percentage} className="h-0.5 sm:h-1" />
                        </div>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
