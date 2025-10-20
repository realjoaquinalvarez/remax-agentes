"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

export function FeatureBanner() {
  const leftRef = useRef(null);
  const leftInView = useInView(leftRef, { once: true, margin: "-100px" });

  const rightRef = useRef(null);
  const rightInView = useInView(rightRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, y: 20 }}
            animate={leftInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Nuevo
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Descubre Analytics con IA para Agentes
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Nuestra inteligencia artificial analiza automáticamente el comportamiento de tus agentes,
              identifica oportunidades de mejora y te sugiere acciones concretas para aumentar las ventas.
              Todo sin necesidad de configuración.
            </p>

            <Button asChild size="lg">
              <Link href="#ai-features">
                Conoce más sobre IA
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Right content - Illustration */}
          <motion.div
            ref={rightRef}
            initial={{ opacity: 0, y: 20 }}
            animate={rightInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-muted/50 rounded-xl p-8 shadow-sm">
              <div className="space-y-4">
                {/* AI Insight cards */}
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        Oportunidad detectada
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Los agentes que publican 3+ veces por semana tienen 45% más conversiones
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        Sugerencia de acción
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Aumentar presencia en Instagram Stories puede mejorar engagement en 28%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        Predicción IA
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Basado en tendencias actuales, se esperan 12 cierres adicionales este mes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
