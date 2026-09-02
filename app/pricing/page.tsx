import type { Metadata } from "next";
import { PricingTable } from "@/components/sections/PricingTable";
import { LivingSecurityRibbonIllustration } from "@/components/illustrations/living/LivingSecurityRibbonIllustration";
import { pricingContent } from "@/content/pricing";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Pricing — Free Forever Core",
  description: "Unifolio is free, forever. No card required. See how it compares to Mprofit.",
};

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24 bg-[#FAF8F5]">
      {/* Background Subtle Grid Texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-40" />

      <div className="mx-auto max-w-content px-4 text-center sm:px-8">
        <SectionLabel>Transparent Economics</SectionLabel>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.02]">
          {pricingContent.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-sans text-base sm:text-xl text-ink-soft leading-relaxed">
          {pricingContent.subhead}
        </p>

        <div className="mt-12 text-left">
          <PricingTable rows={pricingContent.comparisonRows} comingSoon={pricingContent.comingSoon} />
        </div>

        {/* Continuous Security & Zero-Toll Ribbon */}
        <div className="mt-16 overflow-hidden">
          <LivingSecurityRibbonIllustration />
        </div>
      </div>
    </div>
  );
}
