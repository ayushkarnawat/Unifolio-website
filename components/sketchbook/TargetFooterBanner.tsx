"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LivingSecurityRibbonIllustration } from "@/components/illustrations/living/LivingSecurityRibbonIllustration";

export function TargetFooterBanner() {
  return (
    <section className="relative mx-auto max-w-content px-6 pt-10 pb-20 sm:px-8 sm:pb-28">
      {/* Living Security Wandering Ribbon (Flowing Horizontally) */}
      <div className="mb-14 overflow-hidden">
        <LivingSecurityRibbonIllustration />
      </div>

      {/* Hand-Drawn Pale Green Framed Finale Banner */}
      <div className="relative rounded-[32px] border-[1.8px] border-[#1C241E] bg-[#EDF7EF] p-8 sm:p-14 lg:p-16 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Column: Heading */}
          <div className="lg:col-span-6 text-left space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-3 py-1 font-sans text-xs font-semibold text-[#2E7D4E]">
              <Sparkles className="h-3 w-3" />
              <span>THE HONEST TRACKER</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-5xl lg:text-[3.2rem] font-bold tracking-tight text-[#1C241E] leading-[1.08]">
              Your financial life, <br />
              <span className="font-normal italic text-[#2E7D4E]">finally in focus.</span>
            </h3>

            <p className="font-sans text-sm sm:text-base text-[#525E55] max-w-md leading-relaxed">
              Join investors and advisors across India who trust Unifolio for true clarity, zero broker kickbacks, and absolute data privacy.
            </p>
          </div>

          {/* Right Column: Early Access Button & Handwritten Sparkles */}
          <div className="lg:col-span-6 flex flex-col items-start lg:items-end justify-center space-y-4 text-left lg:text-right">
            <div className="relative">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#8CD49E] px-8 py-4 font-sans text-sm font-semibold text-[#1C241E] border border-[#1C241E] shadow-sm hover:bg-[#79C68C] hover:shadow-md transition-all active:scale-95"
              >
                <span>Get early access — Free forever</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex items-center gap-4 text-xs font-sans text-[#525E55]">
              <span>No credit card required</span>
              <span>·</span>
              <span>Unlimited CAS imports</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
