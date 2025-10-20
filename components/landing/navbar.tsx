"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-[#e11b22] text-white font-bold px-3 py-1.5 text-lg">
            RE/MAX
          </div>
          <span className="text-foreground font-semibold">Agentes</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {/* Plataforma */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground hover:bg-accent">
                  Plataforma
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] gap-3 p-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                        Analytics de Datos
                      </h4>
                      <ul className="space-y-2">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/dashboard"
                              className="block rounded-md p-3 hover:bg-accent transition-colors"
                            >
                              <div className="font-medium">Dashboard</div>
                              <div className="text-sm text-muted-foreground">
                                Métricas en tiempo real
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/dashboard/agentes"
                              className="block rounded-md p-3 hover:bg-accent transition-colors"
                            >
                              <div className="font-medium">Agentes</div>
                              <div className="text-sm text-muted-foreground">
                                Gestión completa de agentes
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                        Integración
                      </h4>
                      <ul className="space-y-2">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/dashboard/conexiones"
                              className="block rounded-md p-3 hover:bg-accent transition-colors"
                            >
                              <div className="font-medium">Redes Sociales</div>
                              <div className="text-sm text-muted-foreground">
                                Conecta Facebook e Instagram
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Casos de Uso */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground hover:bg-accent">
                  Casos de Uso
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className="block rounded-md p-3 hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">Equipos de Ventas</div>
                          <div className="text-sm text-muted-foreground">
                            Optimiza conversión y retención
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className="block rounded-md p-3 hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">Marketing</div>
                          <div className="text-sm text-muted-foreground">
                            Mejora rendimiento en redes sociales
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className="block rounded-md p-3 hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">Gerencia</div>
                          <div className="text-sm text-muted-foreground">
                            Decisiones basadas en datos
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Recursos */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground hover:bg-accent">
                  Recursos
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className="block rounded-md p-3 hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">Blog</div>
                          <div className="text-sm text-muted-foreground">
                            Artículos y guías
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className="block rounded-md p-3 hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">Centro de Ayuda</div>
                          <div className="text-sm text-muted-foreground">
                            Documentación y tutoriales
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className="block rounded-md p-3 hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">Casos de Éxito</div>
                          <div className="text-sm text-muted-foreground">
                            Historias de clientes
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <Button asChild variant="default">
            <Link href="/dashboard">Prueba Gratis</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#contact">Solicitar Demo</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background">
          <div className="container px-4 py-4 space-y-4">
            <div className="space-y-2">
              <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Plataforma
              </div>
              <Link
                href="/dashboard"
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/agentes"
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Agentes
              </Link>
              <Link
                href="/dashboard/conexiones"
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Redes Sociales
              </Link>
            </div>

            <div className="pt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard">Prueba Gratis</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="#contact">Solicitar Demo</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
