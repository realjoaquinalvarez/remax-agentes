"use client";

import { Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const offices = [
  "RE/MAX Centro",
  "RE/MAX Premium",
  "RE/MAX Elite",
  "RE/MAX Collection",
  "RE/MAX Professionals",
  "RE/MAX Signature",
  "RE/MAX Platinum",
  "RE/MAX Excellence",
];

export function LogoStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="bg-muted/30 py-12" ref={ref}>
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm text-muted-foreground mb-8 font-medium"
        >
          Más de 500 oficinas RE/MAX confían en nuestra plataforma
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {offices.map((office, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex flex-col items-center justify-center group cursor-pointer transition-all hover:scale-105"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-all">
                <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground text-center font-medium">
                {office}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
