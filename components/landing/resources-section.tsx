"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const resources = [
  {
    type: "Artículo",
    icon: FileText,
    title: "Cómo RE/MAX Centro aumentó sus conversiones en 20%",
    description:
      "Descubre cómo esta oficina utilizó analytics de redes sociales para identificar oportunidades y duplicar sus resultados de ventas.",
    image: "from-primary to-primary/60",
  },
  {
    type: "Guía",
    icon: BookOpen,
    title: "La Guía Definitiva de Analytics para Agentes Inmobiliarios",
    description:
      "Todo lo que necesitas saber sobre cómo usar datos de redes sociales y ventas para hacer crecer tu negocio inmobiliario.",
    image: "from-primary to-primary/70",
  },
  {
    type: "Caso de Estudio",
    icon: Award,
    title: "RE/MAX Premium: $150K en ingresos adicionales en 3 meses",
    description:
      "Un análisis profundo de cómo la oficina Premium transformó su estrategia digital y aumentó significativamente sus ingresos.",
    image: "from-primary to-primary/80",
  },
];

export function ResourcesSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recursos para Agentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Aprende cómo otros agentes están transformando sus resultados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <ResourceCard
                key={index}
                resource={resource}
                Icon={Icon}
                index={index}
              />
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="#resources">
              Ver todos los recursos
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ resource, Icon, index }: { resource: typeof resources[0], Icon: React.ComponentType<{ className?: string }>, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href="#"
        className="group block rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:scale-105"
      >
        <div className={`h-48 bg-gradient-to-br ${resource.image} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-semibold flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {resource.type}
          </div>
        </div>
        <div className="p-6 bg-card">
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {resource.description}
          </p>
          <div className="flex items-center text-primary font-semibold text-sm">
            Leer más
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
