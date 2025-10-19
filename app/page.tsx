"use client";

import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { FeatureBanner } from "@/components/landing/feature-banner";
import { SuccessMetrics } from "@/components/landing/success-metrics";
import { FeaturesShowcase } from "@/components/landing/features-showcase";
import { ResourcesSection } from "@/components/landing/resources-section";
import { VideoSection } from "@/components/landing/video-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { BadgesSection } from "@/components/landing/badges-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <Hero />
      <LogoStrip />
      <FeatureBanner />
      <SuccessMetrics />
      <FeaturesShowcase />
      <ResourcesSection />
      <VideoSection />
      <BenefitsSection />
      <BadgesSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
