"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const footerLinks = {
  platform: {
    title: "Plataforma",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Agentes", href: "/dashboard/agentes" },
      { label: "Conexiones", href: "/dashboard/conexiones" },
      { label: "Analytics", href: "#analytics" },
      { label: "Integraciones", href: "#integrations" },
    ],
  },
  useCases: {
    title: "Casos de Uso",
    links: [
      { label: "Equipos de Ventas", href: "#sales" },
      { label: "Marketing Digital", href: "#marketing" },
      { label: "Gerencia", href: "#management" },
      { label: "Oficinas RE/MAX", href: "#offices" },
    ],
  },
  resources: {
    title: "Recursos",
    links: [
      { label: "Blog", href: "#blog" },
      { label: "Centro de Ayuda", href: "#help" },
      { label: "Casos de Éxito", href: "#success-stories" },
      { label: "Documentación", href: "#docs" },
      { label: "Comunidad", href: "#community" },
    ],
  },
  company: {
    title: "Compañía",
    links: [
      { label: "Acerca de", href: "#about" },
      { label: "Contacto", href: "#contact" },
      { label: "Carreras", href: "#careers" },
      { label: "Privacidad", href: "/privacy" },
      { label: "Términos", href: "/terms" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and copyright */}
          <div className="flex items-center gap-4">
            <div className="bg-[#e11b22] text-white font-bold px-3 py-1.5 text-lg">
              RE/MAX
            </div>
            <span className="text-muted-foreground text-sm">
              © 2025 RE/MAX Agentes. Todos los derechos reservados.
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <Link
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
