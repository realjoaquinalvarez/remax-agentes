"use client";

import { useRef } from "react";
import { Award, Star, TrendingUp, Users, Sparkles, Trophy } from "lucide-react";
import { motion, useInView } from "framer-motion";

const badges = [
  {
    icon: Award,
    title: "Top PropTech Platform",
    organization: "Real Estate Tech Awards",
  },
  {
    icon: Star,
    title: "Mejor Producto 2024",
    organization: "RE/MAX International",
  },
  {
    icon: TrendingUp,
    title: "Líder en Analytics",
    organization: "G2 Awards",
  },
  {
    icon: Users,
    title: "Mejor Valorado",
    organization: "TrustRadius",
  },
  {
    icon: Sparkles,
    title: "Más Innovador",
    organization: "PropTech Summit",
  },
  {
    icon: Trophy,
    title: "Mejor Implementación",
    organization: "RE/MAX Network",
  },
];

export function BadgesSection() {
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Reconocidos en Todas Partes
          </h2>
          <p className="text-lg text-muted-foreground">
            Nuestros clientes confían en RE/MAX Agentes para sus analytics
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <BadgeCard
                key={index}
                badge={badge}
                Icon={Icon}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BadgeCard({ badge, Icon, index }: { badge: typeof badges[0], Icon: React.ComponentType<{ className?: string }>, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/50 shadow-sm transition-all hover:shadow-md hover:scale-105"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e11b22]/10 to-[#c41019]/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#e11b22]" />
      </div>
      <div className="text-sm font-bold text-foreground text-center mb-1">
        {badge.title}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {badge.organization}
      </div>
    </motion.div>
  );
}
