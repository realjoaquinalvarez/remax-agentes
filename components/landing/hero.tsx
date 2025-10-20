"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-24 lg:pt-32 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Plataforma de Analytics para RE/MAX
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Mejores Resultados.{" "}
              <span className="text-primary">
                Más Rápido.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              La única plataforma de analytics que te da una comprensión completa del rendimiento de tus agentes,
              para que puedas mejorar rápidamente la conversión, retención y resultados de ventas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button
                asChild
                size="lg"
                className="text-base px-8 h-12"
              >
                <Link href="/dashboard">
                  Prueba Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base px-8 h-12"
              >
                <Link href="#contact">Contactar Ventas</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Sin tarjeta de crédito • Configuración en 2 minutos • Soporte en español
            </p>
          </motion.div>

          {/* Right content - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:ml-auto"
          >
            <div className="relative">
              {/* Main dashboard card */}
              <div className="relative z-10 rounded-xl shadow-2xl bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white p-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500 font-medium">
                    Dashboard de Agentes
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Metric cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                      <div className="text-xs text-blue-600 font-medium mb-1">Total Agentes</div>
                      <div className="text-2xl font-bold text-blue-900">124</div>
                      <div className="text-xs text-green-600 mt-1">↑ 12% este mes</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 shadow-sm">
                      <div className="text-xs text-green-600 font-medium mb-1">Conversiones</div>
                      <div className="text-2xl font-bold text-green-900">89</div>
                      <div className="text-xs text-green-600 mt-1">↑ 24% este mes</div>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm">
                    <div className="text-xs text-purple-600 font-medium mb-3">Rendimiento Mensual</div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-purple-500 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Social metrics */}
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 shadow-sm">
                      <div className="text-xs text-pink-600 font-medium mb-1">Instagram</div>
                      <div className="text-lg font-bold text-pink-900">45.2K</div>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                      <div className="text-xs text-blue-600 font-medium mb-1">Facebook</div>
                      <div className="text-lg font-bold text-blue-900">89.1K</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -left-4 top-20 z-20 bg-white rounded-lg shadow-xl p-3 max-w-[140px]"
              >
                <div className="text-xs text-gray-500 mb-1">Engagement</div>
                <div className="text-lg font-bold text-gray-900">+32%</div>
                <div className="text-xs text-green-600">↑ Este mes</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -right-4 bottom-20 z-20 bg-white rounded-lg shadow-xl p-3 max-w-[140px]"
              >
                <div className="text-xs text-gray-500 mb-1">Nuevos Leads</div>
                <div className="text-lg font-bold text-gray-900">+187</div>
                <div className="text-xs text-green-600">↑ Esta semana</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
