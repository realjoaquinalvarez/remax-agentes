"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Area, AreaChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Facebook, BarChart3, FileText, User, ExternalLink, Info, Activity, Eye, MessageCircle, Share2, ThumbsUp, Heart, MousePointerClick, PlayCircle, Target, InfoIcon, Link2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getAgentById } from "@/lib/data/mock-agents"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

interface FacebookPost {
  id: string
  message?: string
  created_time: string
  permalink_url: string
  reach?: number
  engagement?: number
  post_clicks?: number
  impressions?: number
  likes?: number
  comments?: number
  shares?: number
  reactions_total?: number
  impressions_organic?: number
  impressions_paid?: number
  post_clicks_by_type?: Record<string, number>
  post_activity_by_action_type?: Record<string, number>
  video_views?: number
  video_views_organic?: number
  video_views_paid?: number
  call_to_action?: { type: string }
}

interface FacebookMetrics {
  totalReach: number
  totalImpressions: number
  totalPosts: number
  totalLinkClicks: number
  avgEngagementRate: string
  timelineData: Array<{ date: string; reach: number; engagement: number; posts: number }>
  filteredPosts: FacebookPost[]
  topByReach: FacebookPost[]
  topByEngagement: FacebookPost[]
  topByClicks: FacebookPost[]
  clickTypes: Record<string, number>
}

interface FacebookData {
  user?: {
    name?: string
    email?: string
  }
  pages?: Array<{
    id: string
    name: string
    link?: string
    posts?: FacebookPost[]
  }>
}

export default function PanelGeneralPage() {
  const router = useRouter()
  const agentId = "2"
  const agent = getAgentById(agentId)

  const [facebookData, setFacebookData] = useState<FacebookData | null>(null)
  const [postFilter, setPostFilter] = useState<"all" | "week" | "month">("all")

  // Translation helper for click types
  const translateClickType = (type: string): string => {
    const translations: { [key: string]: string } = {
      'other clicks': 'Otros clicks',
      'photo view': 'Ver foto',
      'link clicks': 'Clicks en enlaces',
      'post link clicks': 'Clicks en enlaces', // New API name
      'video play': 'Reproducción de video',
      'other': 'Otros',
    }
    return translations[type.toLowerCase()] || type
  }

  // Helper to get link clicks from a post (includes WhatsApp links)
  const getLinkClicks = (post: FacebookPost): number => {
    if (!post.post_clicks_by_type) return 0

    // Sum all link-related clicks (both old and new API format)
    let linkClicks = 0
    Object.entries(post.post_clicks_by_type).forEach(([type, count]) => {
      const typeLower = type.toLowerCase()
      if (typeLower.includes('link')) {
        linkClicks += count
      }
    })

    return linkClicks
  }

  // Load Facebook data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('facebook_connection_data')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setFacebookData(data)
      } catch (e) {
        console.error('Error parsing Facebook data:', e)
      }
    }
  }, [])

  // Calculate metrics from Facebook data
  const facebookMetrics = useMemo((): FacebookMetrics | null => {
    if (!facebookData || !facebookData.pages || facebookData.pages.length === 0) {
      return null
    }

    const page = facebookData.pages[0]
    const posts = (page.posts || []) as FacebookPost[]

    const totalReach = posts.reduce((sum: number, post: FacebookPost) => sum + (post.reach || 0), 0)
    const totalImpressions = posts.reduce((sum: number, post: FacebookPost) => sum + (post.impressions || 0), 0)
    const totalEngagement = posts.reduce((sum: number, post: FacebookPost) => sum + (post.engagement || 0), 0)
    const totalLinkClicks = posts.reduce((sum: number, post: FacebookPost) => sum + getLinkClicks(post), 0)
    const avgEngagementRate = posts.length > 0 ? (totalEngagement / posts.length).toFixed(1) : "0.0"

    // Filter posts by date
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const filteredPosts = posts.filter((post: FacebookPost) => {
      if (postFilter === "all") return true
      const postDate = new Date(post.created_time)
      if (postFilter === "week") return postDate >= oneWeekAgo
      if (postFilter === "month") return postDate >= oneMonthAgo
      return true
    })

    // Top posts
    const topByReach = [...posts].sort((a: FacebookPost, b: FacebookPost) => (b.reach || 0) - (a.reach || 0)).slice(0, 5)
    const topByEngagement = [...posts].sort((a: FacebookPost, b: FacebookPost) => (b.engagement || 0) - (a.engagement || 0)).slice(0, 5)
    const topByClicks = [...posts].sort((a: FacebookPost, b: FacebookPost) => (b.post_clicks || 0) - (a.post_clicks || 0)).slice(0, 5)

    // Click breakdown
    const clickTypes: Record<string, number> = {}
    posts.forEach((post: FacebookPost) => {
      if (post.post_clicks_by_type) {
        Object.entries(post.post_clicks_by_type).forEach(([type, count]) => {
          clickTypes[type] = (clickTypes[type] || 0) + count
        })
      }
    })

    // Posts over time (group by date)
    const postsOverTime: Record<string, { date: string; posts: number; engagement: number; reach: number }> = {}
    posts.forEach((post: FacebookPost) => {
      const date = new Date(post.created_time).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
      if (!postsOverTime[date]) {
        postsOverTime[date] = { date, posts: 0, engagement: 0, reach: 0 }
      }
      postsOverTime[date].posts += 1
      postsOverTime[date].engagement += post.engagement || 0
      postsOverTime[date].reach += post.reach || 0
    })

    const timelineData = Object.values(postsOverTime).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number)
      const [dayB, monthB] = b.date.split('/').map(Number)
      return monthA === monthB ? dayA - dayB : monthA - monthB
    })

    return {
      totalPosts: posts.length,
      totalReach,
      totalImpressions,
      totalLinkClicks,
      avgEngagementRate,
      filteredPosts,
      topByReach,
      topByEngagement,
      topByClicks,
      clickTypes,
      timelineData,
    }
  }, [facebookData, postFilter])

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
              <Button onClick={() => router.push("/admin-panel")} className="mt-4">
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
            <Breadcrumb className="-ml-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                    ¡Hola de nuevo, {facebookData?.user?.name || agent.name}!
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          actions={
            <Button
              onClick={() => {
                window.location.href = '/api/auth/instagram';
              }}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-4"
              size="sm"
            >
              <Facebook className="size-3.5 sm:size-4" />
              <span className="hidden xs:inline">Conectar Facebook</span>
              <span className="xs:hidden">Facebook</span>
            </Button>
          }
        />

        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
          {/* Agent Header */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex size-12 sm:size-14 lg:size-16 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <User className="size-6 sm:size-7 lg:size-8 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight truncate">
                  {facebookData?.pages?.[0]?.name || "Panel General"}
                </h1>
                {facebookData?.pages?.[0]?.link && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 sm:size-6 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => window.open(facebookData.pages![0].link!, '_blank')}
                  >
                    <ExternalLink className="size-3 sm:size-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {facebookData?.user?.email || agent.email}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="rendimiento" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10 rounded-lg bg-muted p-1">
              <TabsTrigger value="rendimiento" className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md text-xs sm:text-sm font-medium data-[state=active]:bg-background">
                <BarChart3 className="size-3.5 sm:size-4" />
                <span className="hidden xs:inline">Rendimiento</span>
              </TabsTrigger>
              <TabsTrigger value="publicaciones" className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md text-xs sm:text-sm font-medium data-[state=active]:bg-background">
                <FileText className="size-3.5 sm:size-4" />
                <span className="hidden xs:inline">Publicaciones</span>
              </TabsTrigger>
              <TabsTrigger value="estadisticas" className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md text-xs sm:text-sm font-medium data-[state=active]:bg-background">
                <Activity className="size-3.5 sm:size-4" />
                <span className="hidden xs:inline">Estadísticas</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Rendimiento */}
            <TabsContent value="rendimiento" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              {facebookMetrics ? (
                <>
                  {/* Summary Metrics */}
                  <div className="grid gap-2.5 grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
                    <Card className="border-border/50 shadow-sm">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                          Total Publicaciones
                        </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{facebookMetrics.totalPosts}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                          Impresiones Totales
                        </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{facebookMetrics.totalImpressions.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                          Alcance Total
                        </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{facebookMetrics.totalReach.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 sm:mb-1.5">
                          Tasa de Engagement
                        </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{facebookMetrics.avgEngagementRate}</span>
                          <span className="text-[9px] sm:text-xs text-muted-foreground">prom.</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm bg-gradient-to-br from-green-500/5 to-transparent col-span-2 md:col-span-1">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wide text-green-700 mb-1 sm:mb-1.5 flex items-center gap-0.5 sm:gap-1">
                          <Link2 className="size-2.5 sm:size-3" />
                          Clicks en Links
                        </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-green-700">{facebookMetrics.totalLinkClicks.toLocaleString()}</span>
                        </div>
                        <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-green-600/70 mt-1">Incluye WhatsApp y otros</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                    {/* Reach Chart */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base font-semibold">Alcance en el Tiempo</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">
                          Últimos 30 días
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-1 sm:px-2 lg:px-3 pt-0 pb-4 sm:pb-6">
                        <ChartContainer
                          config={{
                            reach: {
                              label: "Alcance",
                              color: "#7c3aed",
                            },
                          }}
                          className="h-[180px] sm:h-[200px] lg:h-[240px] w-full"
                        >
                          <LineChart
                            accessibilityLayer
                            data={facebookMetrics.timelineData.slice(-30)}
                            margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10 }} className="text-[9px] sm:text-[10px]" />
                            <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={{ fontSize: 10 }} width={28} className="text-[9px] sm:text-[10px]" />
                            <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} content={<ChartTooltipContent className="text-xs" />} />
                            <Line
                              dataKey="reach"
                              type="monotone"
                              stroke="var(--color-reach)"
                              strokeWidth={2}
                              dot={{ fill: "var(--color-reach)", strokeWidth: 1.5, r: 3, stroke: "hsl(var(--background))" }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Timeline Chart */}
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base font-semibold">Frecuencia de Publicación</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">
                          Últimos 30 días
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-1 sm:px-2 lg:px-3 pt-0 pb-4 sm:pb-6">
                        <ChartContainer
                          config={{
                            posts: {
                              label: "Publicaciones",
                              color: "#10b981",
                            },
                          }}
                          className="h-[180px] sm:h-[200px] lg:h-[240px] w-full"
                        >
                          <AreaChart
                            accessibilityLayer
                            data={facebookMetrics.timelineData.slice(-30)}
                            margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                          >
                            <defs>
                              <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-posts)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-posts)" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={6}
                              tick={{ fontSize: 10 }}
                              className="text-[9px] sm:text-[10px]"
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={4}
                              tick={{ fontSize: 10 }}
                              width={24}
                              allowDecimals={false}
                              className="text-[9px] sm:text-[10px]"
                            />
                            <ChartTooltip
                              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                              content={<ChartTooltipContent
                                className="text-xs"
                                labelFormatter={(value) => `Fecha: ${value}`}
                                formatter={(value) => [`${value} publicaciones`, "Total"]}
                              />}
                            />
                            <Area
                              dataKey="posts"
                              type="monotone"
                              fill="url(#fillPosts)"
                              fillOpacity={0.4}
                              stroke="var(--color-posts)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card className="w-full border-border/50">
                  <CardContent className="p-12 text-center">
                    <Facebook className="mx-auto size-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No hay datos disponibles</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Conecta Facebook para ver el rendimiento
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Publicaciones */}
            <TabsContent value="publicaciones" className="mt-6 space-y-6">
              {facebookMetrics ? (
                <>
                  {/* Filter */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Publicaciones</h3>
                    <Select value={postFilter} onValueChange={(value: string) => setPostFilter(value as "all" | "week" | "month")}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {facebookMetrics.filteredPosts.map((post: FacebookPost) => (
                      <Card key={post.id} className="border-border/50 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-sm font-medium line-clamp-2 max-w-[200px]">
                              {post.message || (
                                <span className="inline-flex items-center gap-1">
                                  Publicación sin título
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <InfoIcon className="size-3.5 text-muted-foreground shrink-0 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="text-xs">
                                        Esta publicación no tiene título porque puede ser una foto/video sin texto,
                                        una publicación compartida de otra página, o contenido sin descripción.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </span>
                              )}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                              onClick={() => window.open(post.permalink_url, '_blank')}
                            >
                              <ExternalLink className="size-4" />
                            </Button>
                          </div>
                          <CardDescription className="text-xs flex items-center gap-1.5">
                            <Activity className="size-3" />
                            {new Date(post.created_time).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 p-2.5 rounded-md bg-blue-500/5">
                              <div className="flex items-center gap-1.5">
                                <Eye className="size-3.5 text-blue-600" />
                                <p className="text-xs font-medium text-blue-600">Alcance</p>
                              </div>
                              <p className="text-lg font-bold">{post.reach?.toLocaleString() || 0}</p>
                            </div>
                            <div className="space-y-1 p-2.5 rounded-md bg-green-500/5">
                              <div className="flex items-center gap-1">
                                <Link2 className="size-3.5 text-green-600" />
                                <p className="text-xs font-medium text-green-600">Clicks en Links</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="size-3 text-green-600/60 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs">
                                      Incluye clicks en enlaces a WhatsApp, sitios web externos,
                                      links en la descripción y otros enlaces de la publicación.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-lg font-bold">{getLinkClicks(post).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1 p-2.5 rounded-md bg-purple-500/5">
                              <div className="flex items-center gap-1.5">
                                <Heart className="size-3.5 text-purple-600" />
                                <p className="text-xs font-medium text-purple-600">Engagement</p>
                              </div>
                              <p className="text-lg font-bold">{post.engagement?.toLocaleString() || 0}</p>
                            </div>
                            <div className="space-y-1 p-2.5 rounded-md bg-orange-500/5">
                              <div className="flex items-center gap-1.5">
                                <BarChart3 className="size-3.5 text-orange-600" />
                                <p className="text-xs font-medium text-orange-600">Impresiones</p>
                              </div>
                              <p className="text-lg font-bold">{post.impressions?.toLocaleString() || 0}</p>
                            </div>
                          </div>

                          {/* More Info Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full mt-2 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                                <Info className="size-4 mr-2" />
                                Ver más información
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-border/50 rounded-xl">
                              <DialogHeader className="border-b border-border/50 pb-3">
                                <DialogTitle className="text-sm font-normal pr-8 leading-snug">
                                  {post.message ? (
                                    post.message
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5">
                                      <span>Publicación sin título</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <InfoIcon className="size-4 text-muted-foreground shrink-0 cursor-help inline-block" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p className="text-xs">
                                            Esta publicación no tiene título porque puede ser una foto/video sin texto,
                                            una publicación compartida de otra página, o contenido sin descripción.
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </span>
                                  )}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-1.5 text-xs mt-1.5">
                                  <Activity className="size-3" />
                                  {new Date(post.created_time).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-3 mt-4">
                                {/* Main Metrics */}
                                <div className="bg-gradient-to-br from-primary/5 to-transparent p-3 rounded-xl border-border/50 border">
                                  <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                    <BarChart3 className="size-3.5 text-primary" />
                                    Métricas Principales
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-0.5 p-2.5 rounded-lg bg-blue-500/5">
                                      <div className="flex items-center gap-1.5">
                                        <Eye className="size-3.5 text-blue-600" />
                                        <p className="text-xs font-medium text-blue-600">Alcance</p>
                                      </div>
                                      <p className="text-xl font-bold">{post.reach?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="space-y-0.5 p-2.5 rounded-lg bg-green-500/5">
                                      <div className="flex items-center gap-1">
                                        <Link2 className="size-3.5 text-green-600" />
                                        <p className="text-xs font-medium text-green-600">Clicks en Links</p>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <InfoIcon className="size-3 text-green-600/60 cursor-help" />
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <p className="text-xs">
                                              Incluye clicks en enlaces a WhatsApp, sitios web externos,
                                              links en la descripción y otros enlaces de la publicación.
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                      <p className="text-xl font-bold">{getLinkClicks(post).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-0.5 p-2.5 rounded-lg bg-purple-500/5">
                                      <div className="flex items-center gap-1.5">
                                        <Heart className="size-3.5 text-purple-600" />
                                        <p className="text-xs font-medium text-purple-600">Engagement</p>
                                      </div>
                                      <p className="text-xl font-bold">{post.engagement?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="space-y-0.5 p-2.5 rounded-lg bg-orange-500/5">
                                      <div className="flex items-center gap-1.5">
                                        <BarChart3 className="size-3.5 text-orange-600" />
                                        <p className="text-xs font-medium text-orange-600">Impresiones</p>
                                      </div>
                                      <p className="text-xl font-bold">{post.impressions?.toLocaleString() || 0}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Interactions */}
                                <div className="p-3 rounded-xl border-border/50 border bg-card">
                                  <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                    <Heart className="size-3.5 text-primary" />
                                    Interacciones
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="text-center p-2 rounded-lg bg-pink-500/5">
                                      <ThumbsUp className="size-4 text-pink-600 mx-auto mb-1.5" />
                                      <p className="text-xs text-muted-foreground mb-0.5">Likes</p>
                                      <p className="text-base font-bold">{post.likes?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-blue-500/5">
                                      <MessageCircle className="size-4 text-blue-600 mx-auto mb-1.5" />
                                      <p className="text-xs text-muted-foreground mb-0.5">Comentarios</p>
                                      <p className="text-base font-bold">{post.comments?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-green-500/5">
                                      <Share2 className="size-4 text-green-600 mx-auto mb-1.5" />
                                      <p className="text-xs text-muted-foreground mb-0.5">Compartidos</p>
                                      <p className="text-base font-bold">{post.shares?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-purple-500/5">
                                      <Heart className="size-4 text-purple-600 mx-auto mb-1.5" />
                                      <p className="text-xs text-muted-foreground mb-0.5">Reacciones</p>
                                      <p className="text-base font-bold">{post.reactions_total?.toLocaleString() || 0}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Impressions Detail */}
                                <div className="p-3 rounded-xl border-border/50 border bg-card">
                                  <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                    <Eye className="size-3.5 text-primary" />
                                    Impresiones Detalladas
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-2.5 rounded-lg bg-green-500/5">
                                      <p className="text-xs text-green-700 font-medium mb-0.5">Impresiones Orgánicas</p>
                                      <p className="text-lg font-bold">{post.impressions_organic?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-blue-500/5">
                                      <p className="text-xs text-blue-700 font-medium mb-0.5">Impresiones Pagadas</p>
                                      <p className="text-lg font-bold">{post.impressions_paid?.toLocaleString() || 0}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Clicks Detail */}
                                {post.post_clicks_by_type && Object.keys(post.post_clicks_by_type).length > 0 && (
                                  <div className="p-3 rounded-xl border-border/50 border bg-card">
                                    <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                      <MousePointerClick className="size-3.5 text-primary" />
                                      Desglose de Clicks
                                    </h4>
                                    <div className="space-y-1.5">
                                      {Object.entries(post.post_clicks_by_type).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                          <span className="text-xs font-medium">{translateClickType(type)}</span>
                                          <Badge variant="secondary" className="text-xs">{(count as number).toLocaleString()}</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Activity by Action Type (WhatsApp, etc) */}
                                {post.post_activity_by_action_type && Object.keys(post.post_activity_by_action_type).length > 0 && (
                                  <div className="p-3 rounded-xl border-border/50 border bg-gradient-to-br from-green-500/5 to-transparent">
                                    <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                      <MessageCircle className="size-3.5 text-green-600" />
                                      Actividad por Acción (WhatsApp y otros)
                                    </h4>
                                    <div className="space-y-1.5">
                                      {Object.entries(post.post_activity_by_action_type).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                          <span className="text-xs font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                                          <Badge variant="secondary" className="text-xs bg-green-600/10 text-green-700">{(count as number).toLocaleString()}</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Video Views */}
                                {(post.video_views || post.video_views_organic || post.video_views_paid) && (
                                  <div className="p-3 rounded-xl border-border/50 border bg-card">
                                    <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                      <PlayCircle className="size-3.5 text-primary" />
                                      Visualizaciones de Video
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2.5">
                                      <div className="text-center p-2 rounded-lg bg-red-500/5">
                                        <PlayCircle className="size-4 text-red-600 mx-auto mb-1.5" />
                                        <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                                        <p className="text-base font-bold">{post.video_views?.toLocaleString() || 0}</p>
                                      </div>
                                      <div className="text-center p-2 rounded-lg bg-green-500/5">
                                        <p className="text-xs text-muted-foreground mb-0.5">Orgánicas</p>
                                        <p className="text-base font-bold">{post.video_views_organic?.toLocaleString() || 0}</p>
                                      </div>
                                      <div className="text-center p-2 rounded-lg bg-blue-500/5">
                                        <p className="text-xs text-muted-foreground mb-0.5">Pagadas</p>
                                        <p className="text-base font-bold">{post.video_views_paid?.toLocaleString() || 0}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Call to Action */}
                                {post.call_to_action && (
                                  <div className="p-3 rounded-xl border-border/50 border bg-card">
                                    <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                                      <Target className="size-3.5 text-primary" />
                                      Call to Action
                                    </h4>
                                    <Badge variant="secondary" className="text-xs py-1 px-2.5">
                                      <Target className="size-3 mr-1" />
                                      {post.call_to_action.type}
                                    </Badge>
                                  </div>
                                )}

                                {/* Link to Post */}
                                <div className="sticky bottom-0 -mx-6 -mb-6 mt-2 pt-8 pb-0 px-6 bg-gradient-to-t from-background via-background to-transparent">
                                  <Button
                                    onClick={() => window.open(post.permalink_url, '_blank')}
                                    className="w-full"
                                    variant="default"
                                  >
                                    <Facebook className="size-4 mr-2" />
                                    Ver publicación en Facebook
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Top Posts */}
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs sm:text-sm">Top 3 por Alcance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3">
                        {facebookMetrics.topByReach.slice(0, 3).map((post: FacebookPost, index: number) => (
                          <div key={post.id} className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 border-border/50">{index + 1}</Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {post.message || 'Publicación sin título'}
                              </p>
                              <p className="text-sm font-semibold">{post.reach?.toLocaleString()} alcance</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs sm:text-sm">Top 3 por Engagement</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3">
                        {facebookMetrics.topByEngagement.slice(0, 3).map((post: FacebookPost, index: number) => (
                          <div key={post.id} className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 border-border/50">{index + 1}</Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {post.message || 'Publicación sin título'}
                              </p>
                              <p className="text-sm font-semibold">{post.engagement?.toLocaleString()} engagement</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 sm:col-span-2 lg:col-span-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs sm:text-sm">Top 3 por Clicks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3">
                        {facebookMetrics.topByClicks.slice(0, 3).map((post: FacebookPost, index: number) => (
                          <div key={post.id} className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 border-border/50">{index + 1}</Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {post.message || 'Publicación sin título'}
                              </p>
                              <p className="text-sm font-semibold">{post.post_clicks?.toLocaleString()} clicks</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card className="w-full border-border/50">
                  <CardContent className="p-12 text-center">
                    <FileText className="mx-auto size-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No hay publicaciones</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Conecta Facebook para ver tus publicaciones
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Estadísticas */}
            <TabsContent value="estadisticas" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              {facebookMetrics ? (
                <>
                  {/* Click Breakdown */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold">Desglose de Clicks</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">
                        Distribución por tipo de click
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        {Object.entries(facebookMetrics.clickTypes).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary shrink-0" />
                              <span className="text-xs sm:text-sm font-medium">{translateClickType(type)}</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold">{(count as number).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Timeline */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base font-semibold">Frecuencia de Publicación</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">
                        Últimos 30 días
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-1 sm:px-2 lg:px-3 pt-0 pb-4 sm:pb-6">
                      <ChartContainer
                        config={{
                          posts: {
                            label: "Posts",
                            color: "#10b981",
                          },
                        }}
                        className="h-[160px] sm:h-[180px] lg:h-[200px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={facebookMetrics.timelineData.slice(-30)}
                          margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10 }} className="text-[9px] sm:text-[10px]" />
                          <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={{ fontSize: 10 }} width={24} className="text-[9px] sm:text-[10px]" />
                          <ChartTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} content={<ChartTooltipContent className="text-xs" />} />
                          <Bar dataKey="posts" fill="var(--color-posts)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="w-full border-border/50">
                  <CardContent className="p-12 text-center">
                    <Activity className="mx-auto size-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No hay estadísticas</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Conecta Facebook para ver estadísticas detalladas
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
