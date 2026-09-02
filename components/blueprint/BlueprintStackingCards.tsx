"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function BlueprintStackingCards() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !trackRef.current || !stageRef.current) return;

      const track = trackRef.current;

      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        return -(trackWidth - viewportWidth + 80);
      };

      // SINGLE COORDINATED TIMELINE FOR HORIZONTAL STORYTELLING (Calibrated for comfortable reading pacing)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${Math.max(1600, (track.scrollWidth - window.innerWidth) * 1.5 + 800)}`,
          pin: stageRef.current,
          scrub: 1.4,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // 1. Continuous horizontal translation across the pinned viewport
      tl.to(track, {
        x: getScrollAmount,
        ease: "none",
      });

      // 2. Parallax micro-rotations on colorful sticker badges
      const badges = gsap.utils.toArray<HTMLElement>(".floating-badge");
      badges.forEach((badge, idx) => {
        tl.to(
          badge,
          {
            rotation: (idx % 2 === 0 ? 1 : -1) * (6 + idx * 2),
            y: idx % 2 === 0 ? -14 : 14,
            ease: "none",
          },
          0
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="offerings"
      ref={containerRef}
      className="relative w-full bg-[#0E1310] select-none"
      style={{ height: "480vh" }}
    >
      {/* Seamless Top Blend from Hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#040705] to-transparent z-10" />

      {/* Pinned Fullscreen Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center bg-[#0E1310]"
      >
        {/* Subtle Ambient Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(34,197,94,0.06)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(56,189,248,0.05)_0%,transparent_60%)]" />

        {/* Continuous Horizontal Panoramic Ribbon */}
        <div
          ref={trackRef}
          className="flex items-center gap-12 sm:gap-20 md:gap-28 px-8 sm:px-16 md:px-24 w-max whitespace-nowrap will-change-transform"
        >
          {/* =========================================================================
              PROLOGUE: Monumental Section Intro
             ========================================================================= */}
          <div className="flex flex-col justify-center space-y-4 shrink-0 pr-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]" />
              <span className="font-mono text-xs sm:text-sm text-[#4ADE80] uppercase tracking-[0.25em] font-bold">
                [ 03 / CAPABILITY SUITE ]
              </span>
            </div>
            <h2 className="font-sans font-black text-5xl sm:text-7xl lg:text-8xl text-[#FAF8F5] tracking-[-0.04em] uppercase leading-[0.9]">
              ENGINEERED FOR <br />
              <span className="inline-flex items-center gap-3 mt-2">
                <span>TOTAL</span>
                <span className="floating-badge px-4 sm:px-6 py-1 sm:py-2 rounded-2xl bg-[#4ADE80] text-black font-mono text-2xl sm:text-4xl font-extrabold shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-[-3deg] inline-block">
                  PRECISION
                </span>
              </span>
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#8E9B91] tracking-wider uppercase">
              SCROLL HORIZONTALLY TO EXPLORE THE ENGINE →
            </p>
          </div>

          {/* =========================================================================
              CHAPTER 1: Consolidated Ledger
             ========================================================================= */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Story Headline Phrase */}
            <div className="flex items-center gap-4 text-4xl sm:text-6xl lg:text-7xl font-sans font-black text-[#FAF8F5] tracking-tight uppercase">
              <span>CONSOLIDATED</span>
              <span className="floating-badge px-5 py-2 rounded-2xl bg-[#FBCFE8] text-black font-extrabold text-3xl sm:text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-3 inline-block">
                LEDGER
              </span>
            </div>

            {/* Feature Story Card 1 */}
            <div className="group w-[380px] sm:w-[460px] md:w-[520px] rounded-[36px] bg-[#141C17]/95 border-2 border-white/15 hover:border-white/30 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(74,222,128,0.08)] transition-all duration-300 flex flex-col justify-between whitespace-normal shrink-0 gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#4ADE80] tracking-widest uppercase">
                  [ 01 / 03 ] • MASTER AGGREGATION
                </span>
                <span className="px-3 py-1 rounded-full bg-[#4ADE80]/20 text-[#4ADE80] font-mono text-xs font-bold">
                  44+ AMCs
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight group-hover:text-[#4ADE80] transition-colors">
                  Single Source of Truth
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#8E9B91] leading-relaxed">
                  Building clarity from scattered statements across 44+ AMCs, depositories & brokerages into a unified, resolved ledger.
                </p>
              </div>

              {/* Card Graphic / Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBCFE8] border-2 border-black flex items-center justify-center font-mono text-black font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    MF
                  </div>
                  <span className="font-mono text-xs text-white/80">CAMS + KFintech Auto-Sync</span>
                </div>
                <span className="font-mono text-xs text-[#4ADE80] font-bold">100% RESOLVED</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              INTERLUDE 1: Connecting Banner
             ========================================================================= */}
          <div className="flex items-center gap-4 text-3xl sm:text-5xl lg:text-6xl font-sans font-black text-[#8E9B91]/60 tracking-tight uppercase shrink-0 px-4">
            <span>EVERY</span>
            <span className="floating-badge px-4 py-1.5 rounded-2xl bg-[#7DD3FC] text-black font-mono text-xl sm:text-3xl font-extrabold shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-3 inline-block">
              FEE UNMASKED
            </span>
            <span>DOWN TO 1 BPS</span>
          </div>

          {/* =========================================================================
              CHAPTER 2: Fee Dissection
             ========================================================================= */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Story Headline Phrase */}
            <div className="flex items-center gap-4 text-4xl sm:text-6xl lg:text-7xl font-sans font-black text-[#FAF8F5] tracking-tight uppercase">
              <span>FEE</span>
              <span className="floating-badge px-5 py-2 rounded-2xl bg-[#F472B6] text-black font-extrabold text-3xl sm:text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-[-4deg] inline-block">
                DISSECTION
              </span>
            </div>

            {/* Feature Story Card 2 */}
            <div className="group w-[380px] sm:w-[460px] md:w-[520px] rounded-[36px] bg-[#141C17]/95 border-2 border-white/15 hover:border-white/30 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(244,114,182,0.08)] transition-all duration-300 flex flex-col justify-between whitespace-normal shrink-0 gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#F472B6] tracking-widest uppercase">
                  [ 02 / 03 ] • COST TRANSPARENCY
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F472B6]/20 text-[#F472B6] font-mono text-xs font-bold">
                  TER AUDIT
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight group-hover:text-[#F472B6] transition-colors">
                  Protect Your Compounding
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#8E9B91] leading-relaxed">
                  Keeping wealth compounding, whether it&apos;s unmasking a 15bps expense ratio or a 1.5% regular plan trail commission eating your returns.
                </p>
              </div>

              {/* Card Graphic / Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F472B6] border-2 border-black flex items-center justify-center font-mono text-black font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    ₹
                  </div>
                  <span className="font-mono text-xs text-white/80">Direct vs Regular Delta</span>
                </div>
                <span className="font-mono text-xs text-[#F472B6] font-bold">₹4.2L RECLAIMED</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              INTERLUDE 2: Connecting Banner
             ========================================================================= */}
          <div className="flex items-center gap-4 text-3xl sm:text-5xl lg:text-6xl font-sans font-black text-[#8E9B91]/60 tracking-tight uppercase shrink-0 px-4">
            <span>MULTI-PAN</span>
            <span className="floating-badge px-4 py-1.5 rounded-2xl bg-[#FACC15] text-black font-mono text-xl sm:text-3xl font-extrabold shadow-[4px_4px_0px_rgba(0,0,0,1)] rotate-2 inline-block">
              SYNCHRONIZED
            </span>
            <span>FOR FAMILIES</span>
          </div>

          {/* =========================================================================
              CHAPTER 3: Household Wealth
             ========================================================================= */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Story Headline Phrase */}
            <div className="flex items-center gap-4 text-4xl sm:text-6xl lg:text-7xl font-sans font-black text-[#FAF8F5] tracking-tight uppercase">
              <span>HOUSEHOLD</span>
              <span className="floating-badge px-5 py-2 rounded-2xl bg-[#E11D48] text-white font-extrabold text-3xl sm:text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-3 inline-block">
                WEALTH
              </span>
            </div>

            {/* Feature Story Card 3 */}
            <div className="group w-[380px] sm:w-[460px] md:w-[520px] rounded-[36px] bg-[#141C17]/95 border-2 border-white/15 hover:border-white/30 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(225,29,72,0.08)] transition-all duration-300 flex flex-col justify-between whitespace-normal shrink-0 gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#E11D48] tracking-widest uppercase">
                  [ 03 / 03 ] • MULTI-ENTITY
                </span>
                <span className="px-3 py-1 rounded-full bg-[#E11D48]/20 text-[#E11D48] font-mono text-xs font-bold">
                  FAMILY VIEW
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight group-hover:text-[#E11D48] transition-colors">
                  Unified Family Portfolios
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#8E9B91] leading-relaxed">
                  If you&apos;re enjoying tracking your own folios, you&apos;re going to love unifying your family&apos;s PAN entities with cross-asset asset allocation.
                </p>
              </div>

              {/* Card Graphic / Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E11D48] border-2 border-black flex items-center justify-center font-mono text-white font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    PAN
                  </div>
                  <span className="font-mono text-xs text-white/80">Cross-Entity Wealth View</span>
                </div>
                <span className="font-mono text-xs text-[#E11D48] font-bold">MULTI-TIERED</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              EPILOGUE: Final Release Banner
             ========================================================================= */}
          <div className="flex items-center gap-6 text-4xl sm:text-6xl lg:text-7xl font-sans font-black text-white uppercase tracking-tight shrink-0 pl-8 pr-16">
            <span>NO GAPS.</span>
            <span className="floating-badge px-6 py-2 rounded-2xl bg-[#4ADE80] text-black font-mono text-3xl sm:text-5xl font-extrabold shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-[-2deg] inline-block">
              JUST CLARITY.
            </span>
          </div>
        </div>
      </div>

      {/* Seamless Bottom Blend into About */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#030604] to-transparent z-10" />
    </section>
  );
}
