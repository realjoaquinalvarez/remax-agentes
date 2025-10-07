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

export default function DashboardPage() {
  const router = useRouter()
  const [topPerformersFilter, setTopPerformersFilter] = React.useState<"dia" | "semana" | "mes" | "año">("mes")

  // Calculate summary metrics
  const totalContacted = mockAgents.reduce((sum, agent) => {
    return sum + (agent.monthlyMetrics.leads || 0) * 3 // Simulating contacted clients (3x closed)
  }, 0)

  const totalClosed = mockAgents.reduce((sum, agent) => {
    return sum + (agent.monthlyMetrics.leads || 0)
  }, 0)

  const totalPosts = mockAgents.reduce((sum, agent) => {
    return sum + agent.monthlyMetrics.posts
  }, 0)

  const totalReach = mockAgents.reduce((sum, agent) => {
    return sum + agent.monthlyMetrics.reach
  }, 0)

  // Get time-filtered leads for top performers
  const getFilteredLeads = (monthlyLeads: number) => {
    const multipliers = {
      dia: 0.033,
      semana: 0.25,
      mes: 1,
      año: 12,
    }
    return Math.floor(monthlyLeads * multipliers[topPerformersFilter])
  }

  const getTimeLabel = () => {
    const labels = {
      dia: "hoy",
      semana: "esta semana",
      mes: "este mes",
      año: "este año",
    }
    return labels[topPerformersFilter]
  }

  // Chart data for monthly trends (simulated last 6 months)
  const chartData = [
    { month: "Ene", cerrados: 186, publicaciones: 138 },
    { month: "Feb", cerrados: 198, publicaciones: 145 },
    { month: "Mar", cerrados: 192, publicaciones: 149 },
    { month: "Abr", cerrados: 215, publicaciones: 154 },
    { month: "May", cerrados: 208, publicaciones: 152 },
    { month: "Jun", cerrados: totalClosed, publicaciones: totalPosts },
  ]

  const chartConfig = {
    cerrados: {
      label: "Clientes Cerrados",
      color: "#0b49e9",
    },
    publicaciones: {
      label: "Publicaciones",
      color: "#7c3aed",
    },
  } satisfies ChartConfig

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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
        />
        <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8">
          {/* Main Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Clientes Contactados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-4xl font-bold tracking-tight">{totalContacted}</div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-3" />
                    15%
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  este mes
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Clientes Cerrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-4xl font-bold tracking-tight">
                    {totalClosed}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-3" />
                    12%
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  este mes
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Publicaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-4xl font-bold tracking-tight">{totalPosts}</div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-3" />
                    8%
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  este mes
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Alcance Total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-4xl font-bold tracking-tight">
                    {totalReach.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <IconArrowUpRight className="size-3" />
                    10%
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  personas alcanzadas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Top Performers */}
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="border-border/50 shadow-sm lg:col-span-4 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Tendencia Mensual</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      Clientes cerrados y publicaciones últimos 6 meses
                    </CardDescription>
                  </div>
                  <IconTrendingUp className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="px-3 pt-0 pb-6 flex-1">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 16,
                      bottom: 16,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12 }}
                      width={40}
                    />
                    <ChartTooltip
                      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                      content={<ChartTooltipContent />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      dataKey="cerrados"
                      type="monotone"
                      stroke="var(--color-cerrados)"
                      strokeWidth={2.5}
                      dot={{
                        fill: "var(--color-cerrados)",
                        strokeWidth: 2,
                        r: 5,
                        stroke: "hsl(var(--background))",
                      }}
                      activeDot={{
                        r: 7,
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      dataKey="publicaciones"
                      type="monotone"
                      stroke="var(--color-publicaciones)"
                      strokeWidth={2.5}
                      dot={{
                        fill: "var(--color-publicaciones)",
                        strokeWidth: 2,
                        r: 5,
                        stroke: "hsl(var(--background))",
                      }}
                      activeDot={{
                        r: 7,
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm lg:col-span-3 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-semibold">Mejores Agentes</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      Clientes conseguidos {getTimeLabel()}
                    </CardDescription>
                  </div>
                  <Select value={topPerformersFilter} onValueChange={(value: any) => setTopPerformersFilter(value)}>
                    <SelectTrigger className="h-8 w-[110px] text-xs">
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
              <CardContent className="space-y-2 px-4 flex-1">
                {mockAgents
                  .map((agent) => ({
                    ...agent,
                    filteredLeads: getFilteredLeads(agent.monthlyMetrics.leads || 0)
                  }))
                  .sort((a, b) => b.filteredLeads - a.filteredLeads)
                  .slice(0, 4)
                  .map((agent) => {
                    const sortedAgents = mockAgents
                      .map((a) => ({
                        ...a,
                        filteredLeads: getFilteredLeads(a.monthlyMetrics.leads || 0)
                      }))
                      .sort((a, b) => b.filteredLeads - a.filteredLeads)
                    const maxLeads = sortedAgents[0]?.filteredLeads || 1
                    const percentage = (agent.filteredLeads / maxLeads) * 100

                    return (
                      <div
                        key={agent.id}
                        onClick={() => router.push(`/dashboard/agentes/${agent.id}`)}
                        className="group relative overflow-hidden rounded-xl border border-border/40 bg-card p-3 transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {/* User Icon */}
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <User className="size-4 text-primary" />
                          </div>

                          {/* Name */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {agent.name}
                            </p>
                          </div>

                          {/* Client Count */}
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-semibold text-primary">
                              {agent.filteredLeads}
                            </div>
                            <div className="text-[9px] font-medium text-muted-foreground">
                              clientes
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <Progress value={percentage} className="h-1" />
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
