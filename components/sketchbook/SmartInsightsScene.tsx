"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LivingInsightMagnifierIllustration } from "@/components/illustrations/living/LivingInsightMagnifierIllustration";

export function SmartInsightsScene() {
  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#EDF7EF]/40">
      {/* Background Subtle Watercolor Edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#FAF8F5] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FAF8F5] to-transparent" />

      <div className="relative mx-auto max-w-content px-6 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#2E7D4E]">
              ACT 04 · CONFIDENT DECISIONS
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-normal tracking-tight text-[#1C241E] leading-[1.08]">
              Insights that help <br />
              you make <br />
              <span className="italic text-[#2E7D4E] font-normal">confident decisions.</span>
            </h2>

            <p className="max-w-md font-sans text-base text-[#525E55] leading-relaxed">
              Personalized insight spotlights that inspect your actual holdings—revealing high expense ratios, portfolio overlap, and rebalancing opportunities without alert noise.
            </p>

            <div className="pt-2">
              <Link
                href="/features"
                className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#2E7D4E] hover:text-[#1C241E] transition-colors group"
              >
                <span>Explore insight spotlights</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Unboxed Living Insight Magnifier Illustration */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <LivingInsightMagnifierIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
