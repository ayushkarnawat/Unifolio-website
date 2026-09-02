import type { Metadata } from "next";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { InvestorAdvisorToggle } from "@/components/sections/InvestorAdvisorToggle";
import { FeatureBeat } from "@/components/sections/FeatureBeat";
import { ScoringMethodology } from "@/components/sections/ScoringMethodology";
import { featuresContent } from "@/content/features";

export const metadata: Metadata = {
  title: "Features — The Product Architecture",
  description:
    "How Unifolio works: import your CAS, see every holding, understand what it costs, and track it over time.",
};

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Subtle Grid Texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-40" />

      <div className="mx-auto max-w-content px-4 sm:px-8">
        {/* Editorial Page Header */}
        <div className="max-w-3xl">
          <SectionLabel>{featuresContent.intro.eyebrow}</SectionLabel>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.02]">
            {featuresContent.intro.heading}
          </h1>
          <p className="mt-6 font-sans text-lg sm:text-xl text-ink-soft leading-relaxed">
            {featuresContent.intro.subhead}
          </p>
        </div>

        {/* Dual Audience Context Switcher & Choreographed Beats */}
        <div className="mt-8">
          <InvestorAdvisorToggle>
            <div className="mt-4">
              {featuresContent.beats.map((beat, index) => (
                <FeatureBeat key={beat.step} beat={beat} index={index} />
              ))}
            </div>
          </InvestorAdvisorToggle>
        </div>

        {/* Scoring Methodology Deep Dive */}
        <ScoringMethodology content={featuresContent.scoring} />
      </div>
    </div>
  );
}
