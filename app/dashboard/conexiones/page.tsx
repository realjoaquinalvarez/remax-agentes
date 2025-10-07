"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Link2, RefreshCw } from "lucide-react"

interface PagePost {
  id: string
  message: string
  created_time: string
  likes: number
  comments: number
  shares: number
  engagement: number
  reach: number | null
  impressions: number | null
}

interface PageData {
  id: string
  name: string
  fan_count: number
  followers_count: number
  link: string
  about: string
  category: string
  posts: PagePost[]
  instagram: {
    username: string
    followers_count: number
    media_count: number
  } | null
}

interface ConnectionData {
  user: {
    id: string
    name: string
    email?: string
  }
  pages: PageData[]
  timestamp: string
}

function ConexionesContent() {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [pagesConnected, setPagesConnected] = useState(0)
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const pages = searchParams.get('pages')

    if (success === 'connected') {
      setShowSuccess(true)
      setPagesConnected(parseInt(pages || '0'))

      // Load data from sessionStorage
      const storedData = sessionStorage.getItem('facebook_connection_data')
      if (storedData) {
        try {
          const data = JSON.parse(storedData) as ConnectionData
          setConnectionData(data)
        } catch (e) {
          console.error('Error parsing connection data:', e)
        }
      }

      // Auto-hide after 10 seconds
      setTimeout(() => setShowSuccess(false), 10000)
    }

    if (error) {
      setShowError(true)
      setTimeout(() => setShowError(false), 10000)
    }
  }, [searchParams])

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
                  <BreadcrumbPage>Conexiones</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
        />
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Conexiones de Redes Sociales</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Conecta tus cuentas para obtener métricas en tiempo real
            </p>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Conexión exitosa</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Se conectaron {pagesConnected} {pagesConnected === 1 ? 'página' : 'páginas'} de Facebook correctamente.
                Las métricas se sincronizarán automáticamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {showError && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error de conexión</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                No se pudo completar la conexión. Por favor, inténtalo de nuevo.
              </AlertDescription>
            </Alert>
          )}

          {/* Facebook Connection Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-600/10">
                    <svg className="size-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Facebook Pages</CardTitle>
                    <CardDescription>
                      Conecta tu página de Facebook para obtener métricas de posts, alcance y engagement
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  No conectado
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <h4 className="text-sm font-semibold mb-2">Permisos solicitados:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    Información básica de tu perfil
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    Acceso a páginas que administras
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    Métricas de engagement y alcance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    Posts y contenido publicado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    Cuenta de Instagram Business (si está conectada)
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    window.location.href = '/api/auth/instagram';
                  }}
                  className="gap-2"
                >
                  <Link2 className="size-4" />
                  Conectar Facebook
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="gap-2"
                >
                  <RefreshCw className="size-4" />
                  Reconectar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instagram Info Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                    <svg className="size-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Instagram Business</CardTitle>
                    <CardDescription>
                      Se conecta automáticamente cuando tu Instagram Business está vinculado a tu página de Facebook
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Automático
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nota importante</AlertTitle>
                <AlertDescription>
                  Para obtener métricas de Instagram, tu cuenta de Instagram debe ser una cuenta Business
                  y estar conectada a tu página de Facebook. Esto se configura desde la app de Instagram.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cuentas Conectadas</CardTitle>
              <CardDescription>
                Aquí aparecerán tus cuentas conectadas con sus métricas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!connectionData || connectionData.pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Link2 className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No hay cuentas conectadas aún
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conecta tu Facebook para ver tus páginas y métricas aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {connectionData.pages.map((page) => {
                    const totalEngagement = page.posts.reduce((sum, post) => sum + post.engagement, 0)
                    const avgEngagement = page.posts.length > 0 ? Math.round(totalEngagement / page.posts.length) : 0

                    return (
                      <div key={page.id} className="border border-border/50 rounded-lg p-4 space-y-4">
                        {/* Page Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{page.name}</h3>
                            {page.about && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{page.about}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {page.category}
                              </Badge>
                              {page.link && (
                                <a
                                  href={page.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Ver página
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Page Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Fans</p>
                            <p className="text-2xl font-bold">{page.fan_count.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Seguidores</p>
                            <p className="text-2xl font-bold">{page.followers_count.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Posts de Hoy</p>
                            <p className="text-2xl font-bold">{page.posts.length}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Engagement Promedio</p>
                            <p className="text-2xl font-bold">{avgEngagement}</p>
                          </div>
                        </div>

                        {/* Instagram Connection */}
                        {page.instagram && (
                          <div className="border-t border-border/50 pt-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                                <svg className="size-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Instagram Business Conectado</p>
                                <p className="text-xs text-muted-foreground">@{page.instagram.username}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{page.instagram.followers_count.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">seguidores</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{page.instagram.media_count}</p>
                                <p className="text-xs text-muted-foreground">posts</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Today's Posts */}
                        {page.posts.length > 0 ? (
                          <div className="border-t border-border/50 pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">Publicaciones de Hoy</h4>
                              <Badge variant="secondary" className="text-xs">
                                {page.posts.length} {page.posts.length === 1 ? 'post' : 'posts'}
                              </Badge>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {page.posts.map((post, index) => (
                                <div key={post.id} className="border border-border/30 rounded-lg p-4 space-y-3">
                                  {/* Post Message */}
                                  <p className="text-sm line-clamp-3">{post.message || 'Sin texto'}</p>

                                  {/* Engagement Metrics */}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <span>❤️</span>
                                      <span className="font-medium">{post.likes}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span>💬</span>
                                      <span className="font-medium">{post.comments}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span>🔄</span>
                                      <span className="font-medium">{post.shares}</span>
                                    </span>
                                    <div className="ml-auto flex items-center gap-3">
                                      <span className="font-semibold text-primary">
                                        Engagement: {post.engagement}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Reach Metrics */}
                                  {(post.reach !== null || post.impressions !== null) && (
                                    <div className="flex items-center gap-4 pt-2 border-t border-border/30">
                                      {post.reach !== null && (
                                        <div className="flex items-center gap-2">
                                          <div className="flex size-6 items-center justify-center rounded bg-blue-100 dark:bg-blue-950">
                                            <span className="text-xs">👁️</span>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground">Alcance Único</p>
                                            <p className="text-sm font-semibold">{post.reach.toLocaleString()}</p>
                                          </div>
                                        </div>
                                      )}
                                      {post.impressions !== null && (
                                        <div className="flex items-center gap-2">
                                          <div className="flex size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-950">
                                            <span className="text-xs">📊</span>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground">Impresiones</p>
                                            <p className="text-sm font-semibold">{post.impressions.toLocaleString()}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Timestamp */}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(post.created_time).toLocaleString('es-ES', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-border/50 pt-4">
                            <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
                              <p className="text-sm text-muted-foreground">No hay publicaciones hoy</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Los posts publicados hoy aparecerán aquí con sus métricas de alcance
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function ConexionesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConexionesContent />
    </Suspense>
  )
}
