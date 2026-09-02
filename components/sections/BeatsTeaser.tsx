"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LiveIngestionDemo } from "@/components/product/LiveIngestionDemo";
import { PortfolioTerminal } from "@/components/product/PortfolioTerminal";
import { InteractiveFeeLens } from "@/components/product/InteractiveFeeLens";
import type { homeContent } from "@/content/home";
import { ArrowRight, Sparkles, Eye, Sliders } from "lucide-react";

export function BeatsTeaser({ content }: { content: (typeof homeContent)["beatsTeaser"] }) {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: "import",
      title: "01 · Ingest",
      headline: "One CAS upload parses all AMCs automatically.",
      description: "Drop your consolidated CAMS or KFintech statement once. Every holding and transaction is parsed client-side with zero manual entry.",
      icon: Sparkles,
    },
    {
      id: "see",
      title: "02 · See",
      headline: "Every holding and folio in one single terminal.",
      description: "Consolidates all 44+ AMCs into one crystal-clear reading with live categorized asset distribution.",
      icon: Eye,
    },
    {
      id: "understand",
      title: "03 · Understand",
      headline: "The number behind the number.",
      description: "Exposes hidden distributor kickbacks and calculates true net wealth compounding on Direct plans.",
      icon: Sliders,
    },
  ];

  return (
    <section className="relative mx-auto max-w-wide px-4 py-24 sm:px-8 sm:py-36">
      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <SectionLabel>{content.label}</SectionLabel>
        <h2 className="mt-3 font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink">
          {content.heading}
        </h2>
        <p className="mt-4 font-sans text-base sm:text-lg text-ink-soft">
          Three living product moments. Experience how Unifolio transforms your tracking.
        </p>
      </div>

      {/* Tactile Step Pill Switcher */}
      <div className="flex justify-center mb-14">
        <div className="inline-flex rounded-full border border-ink/[0.08] bg-paper-subtle p-1.5 shadow-panel-sm">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs font-semibold transition-all ${
                  isActive
                    ? "text-ink font-bold"
                    : "text-ink-soft hover:text-ink hover:bg-ink/[0.02]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-ink-faint"}`} />
                <span>{s.title}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeBeatMorphPill"
                    className="absolute inset-0 rounded-full bg-paper-elevated border border-ink/[0.08] shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Living Product Demonstration Canvas */}
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                {steps[activeStep].headline}
              </h3>
              <p className="max-w-xl mx-auto font-sans text-sm sm:text-base text-ink-soft">
                {steps[activeStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Interactive Component Mount */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="demo-ingest"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <LiveIngestionDemo />
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="demo-terminal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <PortfolioTerminal compact />
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="demo-fee"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <InteractiveFeeLens />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center">
          <LinkButton href={content.cta.href} variant="ghost">
            <span>{content.cta.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
