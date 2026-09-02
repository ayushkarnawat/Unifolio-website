"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LivingGrowthTrajectoryIllustration } from "@/components/illustrations/living/LivingGrowthTrajectoryIllustration";

export function PerformanceCardScene() {
  return (
    <section className="relative mx-auto max-w-content px-6 py-20 sm:px-8 sm:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Column: Unboxed Living Growth Trajectory Illustration */}
        <div className="lg:col-span-7 relative flex items-center justify-center order-2 lg:order-1">
          <LivingGrowthTrajectoryIllustration />
        </div>

        {/* Right Column: Editorial Copy */}
        <div className="lg:col-span-5 space-y-5 text-left order-1 lg:order-2">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#2E7D4E]">
            ACT 02 · TRUE RETURNS
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-normal tracking-tight text-[#1C241E] leading-[1.08]">
            Clarity on how <br />
            your money <br />
            <span className="italic text-[#2E7D4E] font-normal">grows.</span>
          </h2>

          <p className="max-w-md font-sans text-base text-[#525E55] leading-relaxed">
            True returns after all distributor commissions, taxes, and transaction drag. Built for long-term clarity, not daily noise.
          </p>

          <div className="pt-2">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#2E7D4E] hover:text-[#1C241E] transition-colors group"
            >
              <span>See true net XIRR calculation</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
