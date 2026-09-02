"use client";

import { useState, useRef } from "react";
import { useAudience } from "@/components/sections/InvestorAdvisorToggle";
import { LiveIngestionDemo } from "@/components/product/LiveIngestionDemo";
import { PortfolioTerminal } from "@/components/product/PortfolioTerminal";
import { InteractiveFeeLens } from "@/components/product/InteractiveFeeLens";
import { InteractiveScoreDial } from "@/components/product/InteractiveScoreDial";
import { LivingHeroInvestmentsIllustration } from "@/components/illustrations/living/LivingHeroInvestmentsIllustration";
import { LivingBalanceZenIllustration } from "@/components/illustrations/living/LivingBalanceZenIllustration";
import { LivingGrowthTrajectoryIllustration } from "@/components/illustrations/living/LivingGrowthTrajectoryIllustration";
import { LivingInsightMagnifierIllustration } from "@/components/illustrations/living/LivingInsightMagnifierIllustration";
import type { FeatureBeatContent } from "@/content/features";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { Sparkles, Eye } from "lucide-react";

export function FeatureBeat({ beat, index }: { beat: FeatureBeatContent; index: number }) {
  const audience = useAudience();
  const note = audience === "investor" ? beat.investorNote : beat.advisorNote;
  const [showProductProof, setShowProductProof] = useState(false);
  const beatRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !beatRef.current) return;

      // Subtle parallax between story column and visual column
      gsap.from(".story-col", {
        scrollTrigger: {
          trigger: beatRef.current,
          start: "top 80%",
        },
        y: 25,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".visual-col", {
        scrollTrigger: {
          trigger: beatRef.current,
          start: "top 75%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: beatRef }
  );

  const renderArtwork = () => {
    switch (index) {
      case 0:
        return <LivingHeroInvestmentsIllustration className="w-full h-[360px]" />;
      case 1:
        return <LivingBalanceZenIllustration className="w-full h-[360px]" />;
      case 2:
        return <LivingGrowthTrajectoryIllustration className="w-full h-[360px]" />;
      case 3:
        return <LivingInsightMagnifierIllustration className="w-full h-[360px]" />;
      default:
        return <LivingHeroInvestmentsIllustration className="w-full h-[360px]" />;
    }
  };

  const renderProductProof = () => {
    switch (index) {
      case 0:
        return <LiveIngestionDemo />;
      case 1:
        return <PortfolioTerminal compact />;
      case 2:
        return <InteractiveFeeLens />;
      case 3:
        return <InteractiveScoreDial />;
      default:
        return <PortfolioTerminal compact />;
    }
  };

  return (
    <div
      ref={beatRef}
      className="border-t border-ink/[0.08] py-16 sm:py-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        {/* Text Story Column */}
        <div className="story-col lg:col-span-5 space-y-5">
          <div className="flex items-center gap-2 font-mono text-xs text-accent font-semibold">
            <span>0{index + 1}</span>
            <span>·</span>
            <span className="uppercase tracking-widest">{beat.step}</span>
          </div>

          <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink leading-[1.05]">
            {beat.headline}
          </h3>

          <p className="font-sans text-base sm:text-lg text-ink-soft leading-relaxed">
            {beat.claim}
          </p>

          <div className="rounded-2xl border border-accent/25 bg-accent/[0.04] p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>{audience === "investor" ? "Investor Perspective" : "Advisor / RIA Perspective"}</span>
            </div>
            <p className="mt-2 font-sans text-sm font-medium text-ink leading-snug">
              {note}
            </p>
          </div>

          {/* Toggle between Living Metaphor & Interactive UI Glimpse */}
          <div className="pt-2">
            <button
              onClick={() => setShowProductProof(!showProductProof)}
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#2E7D4E] hover:text-[#1C241E] transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{showProductProof ? "← View living illustration" : "Interact with product UI proof →"}</span>
            </button>
          </div>
        </div>

        {/* Visual Column: Living Artwork with Optional Interactive Glimpse */}
        <div className="visual-col lg:col-span-7">
          <div className="relative flex items-center justify-center">
            {showProductProof ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                {renderProductProof()}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                {renderArtwork()}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
