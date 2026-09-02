"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function KineticTypographyBridge1() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const track1Ref = useRef<HTMLDivElement | null>(null);
  const track2Ref = useRef<HTMLDivElement | null>(null);
  const track3Ref = useRef<HTMLDivElement | null>(null);
  const hairlineRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Track 1: Massive condensed text slides from Left to Right (partially cropped)
      tl.fromTo(
        track1Ref.current,
        { xPercent: -35, opacity: 0.8 },
        { xPercent: 25, opacity: 1, ease: "none" },
        0
      );

      // Track 2: Chartreuse italic text slides from Right to Left (counter-direction)
      tl.fromTo(
        track2Ref.current,
        { xPercent: 35, opacity: 0.9 },
        { xPercent: -25, opacity: 1, ease: "none" },
        0
      );

      // Track 3: Scale expansion & vertical float
      tl.fromTo(
        track3Ref.current,
        { scale: 0.85, yPercent: 40, opacity: 0.3 },
        { scale: 1.25, yPercent: -30, opacity: 1, ease: "power1.out" },
        0.1
      );

      // Living chartreuse punctuation hairline draw
      tl.fromTo(
        hairlineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, ease: "power2.inOut" },
        0.2
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full py-20 sm:py-32 bg-[#0E1310] overflow-hidden select-none"
    >
      {/* Background Soft Chartreuse Aura */}
      <div className="absolute inset-0 bg-radial from-[#8CD49E]/10 via-transparent to-transparent pointer-events-none" />

      {/* Track 1: FORTY-FOUR FUND HOUSES (Massive Serif, Left to Right) */}
      <div
        ref={track1Ref}
        className="whitespace-nowrap font-serif font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-[#FAF8F5] leading-none tracking-[-0.04em] opacity-90"
      >
        <span>FORTY-FOUR FUND HOUSES · CAMS · KFINTECH ·</span>
      </div>

      {/* Kinetic Dividing Hairline */}
      <div className="relative my-4 sm:my-8 px-6 max-w-7xl mx-auto">
        <div
          ref={hairlineRef}
          className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#8CD49E] to-transparent origin-left"
        />
      </div>

      {/* Track 2: ONE QUIET HORIZON (Chartreuse Italic, Right to Left) */}
      <div
        ref={track2Ref}
        className="whitespace-nowrap font-serif italic text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] text-[#8CD49E] leading-none tracking-tight font-light"
      >
        <span>· ONE QUIET HORIZON · ZERO DISTRIBUTOR CUT ·</span>
      </div>

      {/* Track 3: Technical Micro-Telemetry Punctuation */}
      <div
        ref={track3Ref}
        className="mt-8 flex items-center justify-center gap-6 font-mono text-xs sm:text-sm text-[#FAF8F5]/60 uppercase tracking-widest"
      >
        <span className="h-2 w-2 rounded-full bg-[#8CD49E] animate-ping" />
        <span>| CONSOLIDATION COMPLETE | 100% CLIENT-SIDE PARSED</span>
        <span className="h-2 w-2 rounded-full bg-[#8CD49E] animate-ping" />
      </div>
    </div>
  );
}
