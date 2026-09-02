"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function KineticTypographyBridge2() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const word1Ref = useRef<HTMLDivElement | null>(null);
  const word2Ref = useRef<HTMLDivElement | null>(null);
  const slashRef = useRef<HTMLDivElement | null>(null);

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

      // Word 1: COMPOUNDING scales dramatically while sweeping from Left
      tl.fromTo(
        word1Ref.current,
        { xPercent: -20, scale: 0.8, opacity: 0.4 },
        { xPercent: 15, scale: 1.6, opacity: 1, ease: "power1.inOut" },
        0
      );

      // Word 2: MULTI-GENERATIONAL sweeps across from Right, crossing behind Word 1
      tl.fromTo(
        word2Ref.current,
        { xPercent: 30, scale: 1.4, opacity: 0.3 },
        { xPercent: -20, scale: 0.9, opacity: 0.9, ease: "power1.inOut" },
        0
      );

      // Kinetic Slash Punctuation rotation
      tl.fromTo(
        slashRef.current,
        { rotateZ: -45, scale: 0.5, opacity: 0 },
        { rotateZ: 45, scale: 1.5, opacity: 1, ease: "power2.out" },
        0.2
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full py-24 sm:py-36 bg-[#FAF8F5] overflow-hidden select-none border-y border-[#1C241E]/10"
    >
      {/* Word 1: COMPOUNDING ALPHA (Deep Forest Ink) */}
      <div
        ref={word1Ref}
        className="whitespace-nowrap font-serif font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] text-[#1C241E] leading-none tracking-[-0.04em] origin-left"
      >
        <span>COMPOUNDING ALPHA</span>
      </div>

      {/* Kinetic Slanted Punctuation Bar */}
      <div className="flex items-center justify-center my-6">
        <div
          ref={slashRef}
          className="h-2 w-32 bg-[#2E7D4E] rounded-full origin-center"
        />
      </div>

      {/* Word 2: MULTI-PAN HOUSEHOLD (Electric Chartreuse Italic) */}
      <div
        ref={word2Ref}
        className="whitespace-nowrap font-serif italic text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] text-[#2E7D4E] leading-none tracking-tight font-light origin-right"
      >
        <span>· MULTI-PAN HOUSEHOLD ·</span>
      </div>
    </div>
  );
}
