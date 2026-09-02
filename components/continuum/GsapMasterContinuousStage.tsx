"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { ArrowRight, ShieldCheck, Check } from "lucide-react";

export function GsapMasterContinuousStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Kinetic typography stream tracks
  const stream1Ref = useRef<HTMLDivElement | null>(null);
  const stream2Ref = useRef<HTMLDivElement | null>(null);
  const stream3Ref = useRef<HTMLDivElement | null>(null);

  // Final convergence CTA layer
  const ctaLayerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      // Master Pinned Continuous Timeline with refined pacing and choreography
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=400%",
          pin: stageRef.current,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // =========================================================================
      // SEQUENCE 1: "Forty-four fund houses" (Slides across from Right to Left)
      // =========================================================================
      tl.to(
        stream1Ref.current,
        {
          xPercent: -45,
          ease: "none",
        },
        0
      );

      // =========================================================================
      // SEQUENCE 2: "And see your true performance" (Enters counter-directionally)
      // =========================================================================
      tl.fromTo(
        stream2Ref.current,
        {
          xPercent: 40,
          opacity: 0.2,
        },
        {
          xPercent: -35,
          opacity: 1,
          ease: "none",
        },
        0.2
      );

      // =========================================================================
      // SEQUENCE 3: "Across your entire household" (Crosses over gracefully)
      // =========================================================================
      tl.fromTo(
        stream3Ref.current,
        {
          xPercent: 55,
          opacity: 0.2,
        },
        {
          xPercent: -30,
          opacity: 1,
          ease: "none",
        },
        0.45
      );

      // =========================================================================
      // SEQUENCE 4: Seamless transition to Final Resolution Layer
      // =========================================================================
      tl.to(
        [stream1Ref.current, stream2Ref.current, stream3Ref.current],
        {
          opacity: 0.08,
          scale: 0.96,
          ease: "power2.inOut",
        },
        0.75
      );

      tl.fromTo(
        ctaLayerRef.current,
        { yPercent: 30, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: "power2.out" },
        0.78
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#0E1310] select-none text-[#FAF8F5]"
      style={{ height: "480vh" }}
      aria-label="Kinetic Editorial Experience"
    >
      {/* Pinned Viewport Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#0E1310] flex flex-col justify-between p-8 sm:p-14 lg:p-20"
      >
        {/* Subtle Ambient Radial Wash */}
        <div className="pointer-events-none absolute inset-0 bg-radial from-[#8CD49E]/5 via-transparent to-transparent" />

        {/* Top Telemetry Header */}
        <div className="relative z-30 flex items-center justify-between font-mono text-[11px] text-[#8E9B91] uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8CD49E] animate-pulse" />
            <span className="font-serif text-xs font-bold tracking-wider text-[#FAF8F5]">UNIFOLIO</span>
            <span className="text-[#FAF8F5]/30">/</span>
            <span>CHAPTER 02 · THE CONVERGENCE</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[#8CD49E]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>CLIENT-SIDE PARSING</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHOREOGRAPHED EDITORIAL TYPOGRAPHY (Refined Scale & Intentional Space)     */}
        {/* ========================================================================= */}
        <div className="relative z-10 my-auto flex flex-col gap-12 sm:gap-16 overflow-visible">
          {/* STREAM 1: Forty-four fund houses */}
          <div className="relative overflow-visible">
            <div
              ref={stream1Ref}
              className="flex items-baseline gap-8 whitespace-nowrap translate-x-[8vw]"
            >
              <h2 className="font-serif font-light text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] text-[#FAF8F5] leading-none tracking-tight">
                Forty-four fund houses.
              </h2>
              <span className="font-serif italic font-light text-3xl sm:text-5xl md:text-6xl text-[#8CD49E] tracking-tight">
                Unified in one quiet ledger.
              </span>
            </div>
          </div>

          {/* STREAM 2: And see your true performance */}
          <div className="relative overflow-visible">
            <div
              ref={stream2Ref}
              className="flex items-baseline gap-8 whitespace-nowrap translate-x-[35vw]"
            >
              <h2 className="font-serif font-light text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] text-[#FAF8F5] leading-none tracking-tight">
                And see your true performance.
              </h2>
              <span className="font-serif italic font-light text-3xl sm:text-5xl md:text-6xl text-[#8CD49E] tracking-tight">
                Without distributor drag.
              </span>
            </div>
          </div>

          {/* STREAM 3: Across your entire household */}
          <div className="relative overflow-visible">
            <div
              ref={stream3Ref}
              className="flex items-baseline gap-8 whitespace-nowrap translate-x-[65vw]"
            >
              <h2 className="font-serif font-light text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] text-[#FAF8F5] leading-none tracking-tight">
                Across your entire household.
              </h2>
              <span className="font-serif italic font-light text-3xl sm:text-5xl md:text-6xl text-[#8CD49E] tracking-tight">
                All portfolios aligned.
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEQUENCE 4: CONVERGENCE DIRECT ACCESS RESOLUTION LAYER                     */}
        {/* ========================================================================= */}
        <div
          ref={ctaLayerRef}
          className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center opacity-0"
        >
          <div className="pointer-events-auto max-w-xl rounded-3xl border border-[#FAF8F5]/15 bg-[#121A15]/95 p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="font-mono text-xs text-[#8CD49E] uppercase tracking-widest font-semibold">
              [ DIRECT ACCESS GATEWAY ]
            </div>

            <h3 className="font-serif text-3xl sm:text-5xl font-light text-[#FAF8F5] leading-tight">
              All your wealth. <br />
              <span className="text-[#8CD49E] italic font-normal">Pure clarity.</span>
            </h3>

            <p className="font-sans text-sm sm:text-base text-[#8E9B91] max-w-md mx-auto leading-relaxed">
              Consolidate your entire mutual fund portfolio from a single CAS upload. Free forever. No distributor kickbacks.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8CD49E] px-8 py-4 font-sans text-sm font-bold text-[#0E1310] shadow-lg hover:bg-[#79C68C] transition-all active:scale-95"
              >
                <span>Get Instant Access</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="pt-4 border-t border-[#FAF8F5]/10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-[#8E9B91]">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#8CD49E]" />
                <span>All 44+ AMCs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#8CD49E]" />
                <span>CAMS + KFintech</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#8CD49E]" />
                <span>100% Free Core</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Spine Status Bar */}
        <div className="relative z-30 flex items-center justify-between border-t border-[#FAF8F5]/10 pt-6 font-mono text-[11px] text-[#8E9B91] uppercase tracking-widest">
          <span>CONTINUOUS EDITORIAL JOURNEY</span>
          <span className="text-[#8CD49E] font-semibold">UNIFOLIO · ZERO TOLL ARCHITECTURE</span>
        </div>
      </div>
    </section>
  );
}
