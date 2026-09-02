"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { LivingHeroInvestmentsIllustration } from "@/components/illustrations/living/LivingHeroInvestmentsIllustration";

export function HeroSketchScene() {
  return (
    <section className="relative mx-auto max-w-content px-6 pt-12 pb-16 sm:px-8 lg:pt-20 lg:pb-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Subtle Hand-Drawn Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-3.5 py-1 text-xs font-sans text-[#1C241E]">
            <Sparkles className="h-3.5 w-3.5 text-[#2E7D4E]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Direct Mutual Funds · Zero Broker Toll
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-normal tracking-tight text-[#1C241E] leading-[1.04]">
            All your <br />
            <span className="font-bold">investments,</span> <br />
            <span className="italic text-[#2E7D4E] font-normal">finally together.</span>
          </h1>

          <p className="max-w-md font-sans text-base sm:text-lg text-[#525E55] leading-relaxed">
            Unifolio transforms scattered statements into a single, living picture of your wealth. No spreadsheets, no broker commissions, no data fatigue.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#8CD49E] px-7 py-3.5 font-sans text-sm font-semibold text-[#1C241E] border border-[#1C241E] shadow-sm hover:bg-[#79C68C] hover:shadow-md transition-all active:scale-95"
            >
              <span>Get early access</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1C241E]/20 bg-[#FFFFFF] px-6 py-3.5 font-sans text-sm font-semibold text-[#1C241E] hover:border-[#1C241E] transition-all"
            >
              <span>See how it works</span>
            </Link>
          </div>

          {/* Privacy & Scroll Hint */}
          <div className="pt-4 flex items-center gap-4 font-sans text-xs text-[#525E55]">
            <span className="flex items-center gap-1.5 font-medium text-[#1C241E]">
              <ShieldCheck className="h-4 w-4 text-[#2E7D4E]" />
              <span>Zero-Storage Client-Side Security</span>
            </span>
            <span>·</span>
            <div className="flex items-center gap-2 text-[#8E9B91]">
              <div className="flex h-6 w-3.5 items-start justify-center rounded-full border border-[#1C241E]/40 p-0.5">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1 w-0.5 rounded-full bg-[#2E7D4E]"
                />
              </div>
              <span>Scroll to explore</span>
            </div>
          </div>
        </div>

        {/* Right Column: Unboxed Living Vector Artwork */}
        <div className="lg:col-span-7 relative flex items-center justify-center">
          <LivingHeroInvestmentsIllustration />
        </div>
      </div>
    </section>
  );
}
