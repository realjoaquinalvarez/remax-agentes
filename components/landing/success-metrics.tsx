"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const metrics = [
  {
    value: "20%",
    label: "Aumento en Conversiones",
    office: "RE/MAX Centro",
  },
  {
    value: "30%",
    label: "Más Engagement",
    office: "RE/MAX Premium",
  },
  {
    value: "$150K+",
    label: "Ingresos Adicionales",
    office: "RE/MAX Elite",
  },
  {
    value: "40%",
    label: "Reducción de Tiempo",
    office: "RE/MAX Plus",
  },
];

export function SuccessMetrics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Más de 500 oficinas RE/MAX confían en nuestra plataforma
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ayudamos a agentes inmobiliarios a comprender el recorrido completo de sus clientes,
            mejorar la conversión y activación, aumentar la retención y ofrecer una experiencia excepcional.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href="#case-studies"
                className="group relative overflow-hidden rounded-xl bg-card p-8 shadow-sm transition-all hover:shadow-md hover:scale-105 block h-full"
              >
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.office}
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
