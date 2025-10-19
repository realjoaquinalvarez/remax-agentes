"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Database, Brain, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const features = [
  {
    icon: Database,
    title: "Datos Completos, Automáticamente",
    description:
      "Conecta tus cuentas de Facebook e Instagram con un solo clic y obtén todas las métricas de rendimiento de tus agentes en tiempo real. Sin necesidad de ingeniería ni configuración compleja.",
    link: "/dashboard/conexiones",
    linkText: "Ver cómo funciona la captura de datos",
    imagePosition: "left" as const,
    visual: (
      <div className="bg-muted/50 rounded-xl p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              f
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">Facebook Conectado</div>
              <div className="text-sm text-muted-foreground">124 páginas sincronizadas</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
              IG
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">Instagram Conectado</div>
              <div className="text-sm text-muted-foreground">124 cuentas sincronizadas</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-foreground">45K</div>
              <div className="text-xs text-muted-foreground">Seguidores</div>
            </div>
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-foreground">1.2K</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-foreground">89%</div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Brain,
    title: "Analytics Avanzados que Eliminan Puntos Ciegos",
    description:
      "Nuestras capacidades de análisis de datos te alertan sobre momentos clave de fricción y oportunidad en el rendimiento de tus agentes, incluso en comportamientos que no has estado siguiendo. Es una forma única en la industria de descubrir las gemas ocultas que conducen a los mayores resultados de negocio.",
    link: "#",
    linkText: "Conoce más sobre nuestros analytics",
    imagePosition: "right" as const,
    visual: (
      <div className="bg-muted/50 rounded-xl p-8 shadow-sm">
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-xl shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary">⚡</span>
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">
                  Alerta de Oportunidad
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Agentes con actividad en Stories tienen 3x más engagement
                </div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-primary" />
            </div>
          </div>
          <div className="p-4 bg-card rounded-xl shadow-sm">
            <div className="font-semibold text-foreground text-sm mb-3">
              Tasa de Conversión por Canal
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Instagram</span>
                <span className="font-semibold text-foreground">24%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[24%] bg-primary" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Facebook</span>
                <span className="font-semibold text-foreground">18%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[18%] bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Visión Completa del Rendimiento",
    description:
      "Obtén contexto completo sobre cada acción de tus agentes con análisis integrados. La plataforma te dirige exactamente al punto que te importa, ahorrando tiempo y esfuerzo. Comprende completamente por qué tus agentes hacen lo que hacen. Ve instantáneamente cuál es la solución.",
    link: "/dashboard/agentes",
    linkText: "Explora las vistas de agentes",
    imagePosition: "left" as const,
    visual: (
      <div className="bg-muted/50 rounded-xl p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
            <div className="flex-1">
              <div className="font-semibold text-foreground">María González</div>
              <div className="text-xs text-muted-foreground">Agente RE/MAX Premium</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-primary">+32%</div>
              <div className="text-xs text-muted-foreground">vs mes anterior</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card rounded-xl">
              <div className="text-xs text-muted-foreground mb-1">Conversiones</div>
              <div className="text-xl font-bold text-foreground">12</div>
              <div className="text-xs text-primary">↑ 20%</div>
            </div>
            <div className="p-3 bg-card rounded-xl">
              <div className="text-xs text-muted-foreground mb-1">Engagement</div>
              <div className="text-xl font-bold text-foreground">89%</div>
              <div className="text-xs text-primary">↑ 5%</div>
            </div>
            <div className="p-3 bg-card rounded-xl">
              <div className="text-xs text-muted-foreground mb-1">Seguidores</div>
              <div className="text-xl font-bold text-foreground">4.2K</div>
              <div className="text-xs text-primary">↑ 450</div>
            </div>
            <div className="p-3 bg-card rounded-xl">
              <div className="text-xs text-muted-foreground mb-1">Posts</div>
              <div className="text-xl font-bold text-foreground">24</div>
              <div className="text-xs text-primary">↑ 4</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesShowcase() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Plataforma todo-en-uno para gestionar agentes exitosos
          </h2>
          <Button
            asChild
            variant="outline"
            className="mt-4"
          >
            <Link href="#platform">
              Conoce más sobre la plataforma
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLeft = feature.imagePosition === "left";

            return (
              <FeatureBlock
                key={index}
                feature={feature}
                Icon={Icon}
                isLeft={isLeft}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({ feature, Icon, isLeft }: { feature: typeof features[0], Icon: React.ComponentType<{ className?: string }>, isLeft: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`grid lg:grid-cols-2 gap-12 items-center ${
        !isLeft ? "lg:grid-flow-dense" : ""
      }`}
    >
      {/* Visual */}
      <div className={!isLeft ? "lg:col-start-2" : ""}>
        {feature.visual}
      </div>

      {/* Content */}
      <div className={!isLeft ? "lg:col-start-1 lg:row-start-1" : ""}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e11b22]/10 to-[#c41019]/10 mb-6">
          <Icon className="w-7 h-7 text-[#e11b22]" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {feature.title}
        </h3>

        <p className="text-lg text-muted-foreground mb-6">
          {feature.description}
        </p>

        <Link
          href={feature.link}
          className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          {feature.linkText}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
}
