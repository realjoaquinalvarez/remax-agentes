"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Mejores resultados. Más rápido.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a más de 500 oficinas RE/MAX que ya están transformando sus resultados con analytics avanzados
          </p>
          <Button asChild size="lg" className="text-lg px-8 h-14">
            <Link href="/dashboard">
              Solicitar Demo
              <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
