"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { InteractiveScoreDial } from "@/components/product/InteractiveScoreDial";
import type { featuresContent } from "@/content/features";

export function ScoringMethodology({
  content,
}: {
  content: (typeof featuresContent)["scoring"];
}) {
  return (
    <section className="border-t border-ink/[0.08] pt-24 pb-16">
      <div className="max-w-3xl mb-12">
        <SectionLabel>{content.eyebrow}</SectionLabel>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-ink leading-tight">
          {content.heading}
        </h2>
        <p className="mt-4 font-sans text-base sm:text-lg text-ink-soft leading-relaxed">
          The Unifolio Score diagnoses your portfolio across four deterministic, mathematically audited pillars:
          Expense Drag, Overlap Concentration, SIP Discipline, and Category Alpha.
        </p>
      </div>

      <div className="mt-8">
        <InteractiveScoreDial />
      </div>
    </section>
  );
}
