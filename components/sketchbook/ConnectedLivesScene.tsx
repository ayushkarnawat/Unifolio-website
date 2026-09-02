"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LivingFamilyContourIllustration } from "@/components/illustrations/living/LivingFamilyContourIllustration";

export function ConnectedLivesScene() {
  return (
    <section className="relative mx-auto max-w-content px-6 py-20 sm:px-8 sm:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Column: Unboxed Living Family Contour Illustration */}
        <div className="lg:col-span-7 relative flex items-center justify-center order-2 lg:order-1">
          <LivingFamilyContourIllustration />
        </div>

        {/* Right Column: Editorial Copy */}
        <div className="lg:col-span-5 space-y-5 text-left order-1 lg:order-2">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#2E7D4E]">
            ACT 03 · HOUSEHOLD JOURNEY
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-normal tracking-tight text-[#1C241E] leading-[1.08]">
            One place for your <br />
            entire financial <br />
            journey <span className="italic text-[#2E7D4E] font-normal">together.</span>
          </h2>

          <p className="max-w-md font-sans text-base text-[#525E55] leading-relaxed">
            Financial lives are shared. Unifolio unifies multiple PAN statements across family members, joint goals, and advisor oversight into one seamless continuous contour.
          </p>

          <div className="pt-2">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#2E7D4E] hover:text-[#1C241E] transition-colors group"
            >
              <span>Explore household folio tracking</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
