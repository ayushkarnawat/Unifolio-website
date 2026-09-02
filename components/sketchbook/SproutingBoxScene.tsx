"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LivingBalanceZenIllustration } from "@/components/illustrations/living/LivingBalanceZenIllustration";

export function SproutingBoxScene() {
  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#EDF7EF]/40">
      {/* Background Subtle Watercolor Edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#FAF8F5] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FAF8F5] to-transparent" />

      <div className="relative mx-auto max-w-content px-6 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left: Editorial Copy */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#2E7D4E]">
              ACT 01 · ASSET EQUILIBRIUM
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-normal tracking-tight text-[#1C241E] leading-[1.08]">
              See everything that <br />
              fits together <br />
              <span className="italic text-[#2E7D4E] font-normal">in balance.</span>
            </h2>

            <p className="max-w-md font-sans text-base text-[#525E55] leading-relaxed">
              All your assets across every account and platform—consolidated, organized, and balanced in living harmony rather than static pie charts.
            </p>

            <div className="pt-2">
              <Link
                href="/features"
                className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#2E7D4E] hover:text-[#1C241E] transition-colors group"
              >
                <span>Explore portfolio balance</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: Unboxed Zen Balance Living Illustration */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <LivingBalanceZenIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
