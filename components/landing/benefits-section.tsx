"use client";

import { Puzzle, LineChart, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Puzzle,
    title: "Integraciones en todo el stack",
    description:
      "Más de 100 integraciones aseguran que puedas entregar la información correcta a los clientes correctos en el momento correcto de su recorrido. Conecta con Facebook, Instagram, CRMs, herramientas de email marketing y más.",
    link: "#integrations",
    linkText: "Conoce nuestras integraciones",
  },
  {
    icon: LineChart,
    title: "Dirección sobre inversiones clave",
    description:
      "Las herramientas de analytics te muestran las rutas alternativas que toman los usuarios, el esfuerzo que les toma completar cualquier flujo, y los eventos que más se correlacionan con conversión y retención. Automáticamente. No hay otra solución en el mercado que brinde esta visión sobre qué arreglar y cómo.",
    link: "#analytics",
    linkText: "Explora nuestros analytics",
  },
  {
    icon: Zap,
    title: "Una plataforma única para decisiones basadas en datos",
    description:
      "Otras soluciones te dan herramientas cuantitativas O cualitativas. Nuestra plataforma integra ambas, dándote visibilidad completa sobre todo lo que hacen tus agentes. Es un nuevo paradigma para la toma de decisiones basada en datos.",
    link: "#platform",
    linkText: "Descubre la plataforma completa",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Velocidad de Insight = Velocidad de Éxito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            RE/MAX Agentes es la única solución que te muestra cada acción de cada agente en tu organización,
            y luego proporciona dirección sobre las mejoras que más impactarán tu negocio.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="relative bg-card rounded-xl p-8 h-full shadow-sm transition-all hover:shadow-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {benefit.title}
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {benefit.description}
                  </p>

                  <Link
                    href={benefit.link}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {benefit.linkText}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
