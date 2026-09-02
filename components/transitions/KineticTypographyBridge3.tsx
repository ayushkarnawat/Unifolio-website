"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function KineticTypographyBridge3() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftWordRef = useRef<HTMLDivElement | null>(null);
  const rightWordRef = useRef<HTMLDivElement | null>(null);
  const beaconRef = useRef<HTMLDivElement | null>(null);

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

      // Left Word: ZERO slides leftward and scales up
      tl.fromTo(
        leftWordRef.current,
        { xPercent: 10, scale: 0.9, opacity: 0.5 },
        { xPercent: -30, scale: 1.35, opacity: 1, ease: "power1.inOut" },
        0
      );

      // Right Word: TOLL slides rightward and scales up
      tl.fromTo(
        rightWordRef.current,
        { xPercent: -10, scale: 0.9, opacity: 0.5 },
        { xPercent: 30, scale: 1.35, opacity: 1, ease: "power1.inOut" },
        0
      );

      // Center Focal Beacon pulse
      tl.fromTo(
        beaconRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1.8, opacity: 1, ease: "back.out(2)" },
        0.2
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full py-28 sm:py-44 bg-[#0E1310] overflow-hidden select-none"
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-radial from-[#8CD49E]/15 via-transparent to-transparent pointer-events-none" />

      {/* Massive Split Monolith Typography: ZERO + [FOCAL BEACON] + TOLL */}
      <div className="flex items-center justify-between px-4 sm:px-12 w-full">
        {/* ZERO */}
        <div
          ref={leftWordRef}
          className="font-serif font-black text-7xl sm:text-9xl md:text-[12rem] lg:text-[15rem] text-[#FAF8F5] leading-none tracking-[-0.05em] origin-right"
        >
          <span>ZERO</span>
        </div>

        {/* Center Kinetic Beacon */}
        <div
          ref={beaconRef}
          className="flex flex-col items-center justify-center mx-4 sm:mx-8"
        >
          <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-full border-2 border-[#8CD49E] bg-[#8CD49E]/20 flex items-center justify-center shadow-lg">
            <div className="h-3 w-3 sm:h-5 sm:w-5 rounded-full bg-[#8CD49E] animate-ping" />
          </div>
          <span className="mt-3 font-mono text-[9px] sm:text-xs text-[#8CD49E] uppercase tracking-widest font-bold text-center">
            FREE FOREVER
          </span>
        </div>

        {/* TOLL */}
        <div
          ref={rightWordRef}
          className="font-serif font-black text-7xl sm:text-9xl md:text-[12rem] lg:text-[15rem] text-[#8CD49E] leading-none tracking-[-0.05em] origin-left"
        >
          <span>TOLL</span>
        </div>
      </div>

      {/* Bottom Architectural Spine Telemetry */}
      <div className="mt-12 flex items-center justify-center gap-8 font-mono text-xs text-[#FAF8F5]/50 uppercase tracking-widest text-center px-4">
        <span>NO DISTRIBUTOR COMMISSIONS</span>
        <span className="text-[#8CD49E]">·</span>
        <span>NO SUBSCRIPTION GATING</span>
        <span className="text-[#8CD49E]">·</span>
        <span>CLIENT-SIDE AES-256</span>
      </div>
    </div>
  );
}
