"use client";

import { useRef } from "react";
import { Play } from "lucide-react";
import { motion, useInView } from "framer-motion";

export function VideoSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });

  const videoRef = useRef(null);
  const videoInView = useInView(videoRef, { once: true, margin: "-100px" });

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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ver para creer
          </h2>
          <p className="text-lg text-gray-600">
            Descubre cómo la plataforma RE/MAX Agentes puede transformar tu negocio
          </p>
        </motion.div>

        <motion.div
          ref={videoRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={videoInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Video placeholder */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            {/* Thumbnail */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm mb-4 cursor-pointer transition-all hover:scale-110 hover:bg-white group">
                    <Play className="w-8 h-8 text-[#e11b22] fill-[#e11b22] ml-1 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-white text-xl font-semibold">
                    Ver Demo de la Plataforma
                  </div>
                  <div className="text-white/60 text-sm mt-2">
                    3:42 minutos
                  </div>
                </div>
              </div>

              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
                <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full" />
              </div>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#e11b22]/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
