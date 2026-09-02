"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function EditorialDecompression() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bgCurtainRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const orbitalRingRef = useRef<SVGCircleElement | null>(null);
  const baselineRef = useRef<SVGLineElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      // Pinned Decompression Timeline across scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=160%",
          pin: stageRef.current,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // 1. Initial Hold in Dark Atmosphere (0% to 20% scroll)
      // Subtle expansion of orbital ring inherited from hero
      tl.to(
        orbitalRingRef.current,
        {
          scale: 2.2,
          opacity: 0,
          ease: "power1.inOut",
        },
        0
      );

      // 2. Smooth Tonal Decompression Shift: Black (#000000) -> Warm Alabaster (#FAF8F5)
      tl.to(
        bgCurtainRef.current,
        {
          opacity: 1,
          ease: "power2.inOut",
        },
        0.15
      );

      // 3. Typography Color Shift from Alabaster to Deep Ink (#1C241E)
      tl.to(
        headlineRef.current,
        {
          color: "#1C241E",
          yPercent: -15,
          ease: "power1.out",
        },
        0.2
      );

      // 4. Hairline Flattening into Tranquil Baseline
      tl.fromTo(
        baselineRef.current,
        { strokeDashoffset: 800, strokeDasharray: 800, stroke: "#8CD49E" },
        { strokeDashoffset: 0, stroke: "#2E7D4E", ease: "power2.out" },
        0.35
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#000000] select-none"
      style={{ height: "240vh" }}
    >
      {/* Pinned Decompression Viewport Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#000000] flex flex-col justify-between p-8 sm:p-16 lg:p-24"
      >
        {/* Warm Alabaster Paper Curtain Layer (#FAF8F5) */}
        <div
          ref={bgCurtainRef}
          className="pointer-events-none absolute inset-0 bg-[#FAF8F5] opacity-0 transition-opacity"
        />

        {/* Fading Hero Orbital Ring Metaphor */}
        <svg
          viewBox="0 0 1000 600"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          fill="none"
        >
          <circle
            ref={orbitalRingRef}
            cx="500"
            cy="300"
            r="160"
            stroke="#8CD49E"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
            className="origin-center"
          />
        </svg>

        {/* Top Minimalist Chapter Marker */}
        <div className="relative z-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[#8E9B91]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D4E]" />
            <span>01 · THE DECOMPRESSION</span>
          </span>
          <span className="hidden sm:inline">ZERO STORAGE · CLIENT-SIDE INGESTION</span>
        </div>

        {/* Spacious, Monumental Editorial Typography (Primary Focus) */}
        <div className="relative z-10 my-auto max-w-4xl">
          <h2
            ref={headlineRef}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#FAF8F5] leading-[1.08] transition-colors"
          >
            All forty-four fund houses. <br />
            Every scattered statement. <br />
            <span className="italic font-normal text-[#2E7D4E]">
              Resolved into one quiet truth.
            </span>
          </h2>
        </div>

        {/* Bottom Tranquil Baseline Transition */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#1C241E]/10 pt-6">
          <svg
            viewBox="0 0 800 20"
            className="pointer-events-none absolute inset-x-0 -top-px w-full h-5 overflow-visible"
            fill="none"
          >
            <line
              ref={baselineRef}
              x1="0"
              y1="0"
              x2="800"
              y2="0"
              stroke="#2E7D4E"
              strokeWidth="1.5"
            />
          </svg>

          <p className="font-sans text-xs sm:text-sm text-[#525E55] max-w-md leading-relaxed">
            No broker toll. No recurring subscription gates. Your entire net worth in pure, uncompromised clarity.
          </p>

          <span className="font-mono text-xs text-[#8E9B91] tracking-wider">
            SCROLL FOR PORTFOLIO EQUILIBRIUM ↓
          </span>
        </div>
      </div>
    </div>
  );
}
