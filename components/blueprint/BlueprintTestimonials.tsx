"use client";

import { useState, useRef } from "react";
import { CharacterIllustration } from "./CharacterIllustration";
import { ArrowLeft, ArrowRight } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    tag: "Individual Investor",
    quote:
      "Working with Unifolio has been an absolute revelation. The clarity, fee unmasking, and instant CAS consolidation revealed ₹3.4L in distributor drag that we immediately re-routed into direct compounding.",
    author: "Michelle Castro",
    role: "DIY Investor & Long-Term SIP Builder",
  },
  {
    id: 2,
    tag: "Registered Investment Advisor",
    quote:
      "The multi-PAN family aggregation is seamless. Being able to audit 44 AMCs in one client dashboard without manual spreadsheet updates has saved our advisory practice over 20 hours each week.",
    author: "Arjun Mehta",
    role: "SEBI Registered Investment Advisor (RIA)",
  },
  {
    id: 3,
    tag: "HNI Family Office",
    quote:
      "Unifolio delivers the standard that should have existed years ago: zero commission gatekeeping, 100% client-side privacy, and straight answers on true XIRR.",
    author: "Rohan & Priyamvada",
    role: "Household Wealth Portfolio",
  },
];

export function BlueprintTestimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => setActiveIdx((prev) => (prev + 1) % REVIEWS.length);
  const prev = () => setActiveIdx((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);

  const current = REVIEWS[activeIdx];

  return (
    <section className="relative w-full bg-[#FAF8F5] py-24 sm:py-36 px-6 sm:px-12 select-none overflow-hidden text-black">
      <div className="max-w-4xl mx-auto relative">
        {/* Layered Background Card Stacks (Visual Stack Effect) */}
        <div className="absolute inset-0 translate-y-4 translate-x-3 rounded-[40px] bg-[#E11D48] border-4 border-black" />
        <div className="absolute inset-0 translate-y-2 translate-x-1.5 rounded-[40px] bg-[#7DD3FC] border-4 border-black" />

        {/* Top Active Card */}
        <div className="relative rounded-[40px] border-4 border-black bg-[#FFFBEB] p-8 sm:p-14 lg:p-16 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          <div className="max-w-lg space-y-6 text-left">
            <div className="inline-block font-sans font-black text-xs uppercase tracking-wider px-3.5 py-1 bg-[#22C55E] border-2 border-black rounded-full">
              {current.tag}
            </div>

            <p className="font-sans font-extrabold text-xl sm:text-2xl lg:text-3xl leading-snug text-black">
              &ldquo;{current.quote}&rdquo;
            </p>

            <div className="pt-2 border-t-2 border-black/10">
              <div className="font-sans font-black text-lg text-black">{current.author}</div>
              <div className="font-sans text-xs font-semibold text-black/60">{current.role}</div>
            </div>
          </div>

          {/* Right Peeking Character */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 overflow-hidden flex items-center justify-center">
              <CharacterIllustration className="w-full h-full scale-125" />
            </div>
          </div>
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4 z-20 relative">
          <button
            type="button"
            onClick={prev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white hover:bg-[#E11D48] transition-colors shadow-md active:scale-95"
            aria-label="Previous Review"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white hover:bg-[#E11D48] transition-colors shadow-md active:scale-95"
            aria-label="Next Review"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
