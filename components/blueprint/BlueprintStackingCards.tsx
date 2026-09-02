"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

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

      // SINGLE COORDINATED TIMELINE FOR HORIZONTAL STORYTELLING WITH CINEMATIC IN/OUT DISSOLVE
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${Math.max(2000, (track.scrollWidth - window.innerWidth) * 1.6 + 1000)}`,
          pin: stageRef.current,
          scrub: 1.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // 1. Smooth Cinematic Entrance: Fade & Drift In from Previous Section (0.0 -> 0.12)
      tl.fromTo(
        track,
        {
          opacity: 0,
          y: 20,
          filter: "blur(4px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.14,
          ease: "power2.out",
        },
        0
      );

      // 2. Continuous Horizontal Translation across the Pinned Viewport (0.08 -> 0.88)
      tl.to(
        track,
        {
          x: getScrollAmount,
          duration: 0.80,
          ease: "power1.inOut",
        },
        0.08
      );

      // 3. Smooth Cinematic Exit: Soft Dissolve & Drift Out into Next Section (0.86 -> 1.0)
      tl.to(
        track,
        {
          opacity: 0,
          y: -20,
          filter: "blur(3px)",
          duration: 0.14,
          ease: "power2.in",
        },
        0.86
      );
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
      {/* Seamless Top Gradient Handoff from Hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#040705] via-[#0E1310]/80 to-transparent z-10" />

      {/* Pinned Fullscreen Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center bg-[#0E1310]"
      >
        {/* Subtle Ambient Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(74,222,128,0.04)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(74,222,128,0.03)_0%,transparent_60%)]" />

        {/* Continuous Horizontal Panoramic Ribbon */}
        <div
          ref={trackRef}
          className="flex items-center gap-20 sm:gap-32 md:gap-40 px-12 sm:px-20 md:px-32 w-max whitespace-nowrap will-change-transform"
        >
          {/* =========================================================================
              PROLOGUE: Monumental Editorial Statement
             ========================================================================= */}
          <div className="flex flex-col justify-center shrink-0 pr-12 sm:pr-20 max-w-[560px] sm:max-w-[700px] whitespace-normal">
            <h2 className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-8xl text-white tracking-[-0.035em] uppercase leading-[0.92]">
              BUILT TO UNIFY. <br />
              <span className="text-[#4ADE80]">DESIGNED TO CLARIFY.</span>
            </h2>
          </div>

          {/* =========================================================================
              CHAPTER 1: ONE VIEW. NOTHING HIDDEN. + Flowing Atmospheric Convergence
             ========================================================================= */}
          <div className="flex items-center gap-12 sm:gap-20 shrink-0">
            {/* Primary Editorial Heading */}
            <div className="flex flex-col justify-center shrink-0 whitespace-normal">
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.035em] uppercase leading-[0.95]">
                ONE VIEW. <br />
                <span className="text-[#8E9B91]/80">NOTHING HIDDEN.</span>
              </h3>
            </div>

            {/* Abstract Atmospheric Visual: Layered Flowing Streams & Converging Nodes */}
            <div className="w-[280px] sm:w-[380px] md:w-[440px] h-[260px] sm:h-[320px] relative flex items-center justify-center shrink-0">
              <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-[#4ADE80]/10 via-transparent to-transparent blur-2xl" />
              <svg viewBox="0 0 320 240" fill="none" className="w-full h-full overflow-visible opacity-90">
                <defs>
                  <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#22C55E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="flowGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#15803D" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Ambient Flow Ribbons */}
                <path d="M 20 190 C 80 160, 100 60, 180 80 C 240 95, 270 40, 300 50" stroke="url(#flowGrad1)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 20 210 C 90 180, 110 90, 190 110 C 250 125, 280 70, 300 75" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4 6" />
                <path d="M 20 140 C 70 120, 120 180, 200 130 C 260 90, 280 130, 300 110" stroke="url(#flowGrad2)" strokeWidth="1.8" strokeOpacity="0.75" />
                <path d="M 40 70 C 100 40, 140 140, 220 100 C 270 75, 290 90, 300 85" stroke="#86EFAC" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="6 4" />

                {/* Translucent Morphing Flow Facets */}
                <path d="M 60 170 Q 140 100 220 120 Q 280 80 300 70 L 300 120 Q 220 160 140 140 Z" fill="rgba(74,222,128,0.05)" />
                <path d="M 30 150 Q 110 80 190 100 Q 250 60 280 50 L 280 90 Q 190 130 110 120 Z" fill="rgba(134,239,172,0.04)" />

                {/* Illuminated System Nodes */}
                <circle cx="180" cy="80" r="4.5" fill="#4ADE80" filter="drop-shadow(0 0 10px #4ADE80)" />
                <circle cx="180" cy="80" r="2" fill="#FFFFFF" />
                <circle cx="200" cy="130" r="3.5" fill="#86EFAC" filter="drop-shadow(0 0 8px #86EFAC)" />
                <circle cx="100" cy="140" r="3" fill="#4ADE80" stroke="#0E1310" strokeWidth="1" />
                <circle cx="270" cy="60" r="2.5" fill="#86EFAC" />
              </svg>
            </div>
          </div>

          {/* =========================================================================
              CHAPTER 2: SEE WHAT YOUR MONEY LEAVES BEHIND. + Harmonic Wave Field
             ========================================================================= */}
          <div className="flex items-center gap-12 sm:gap-20 shrink-0">
            {/* Primary Editorial Heading */}
            <div className="flex flex-col justify-center shrink-0 whitespace-normal">
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.035em] uppercase leading-[0.95]">
                SEE WHAT <br />
                <span className="text-[#4ADE80]">YOUR MONEY</span> <br />
                LEAVES BEHIND.
              </h3>
            </div>

            {/* Abstract Atmospheric Visual: Undulating Density Waves & Radiating Contours */}
            <div className="w-[280px] sm:w-[380px] md:w-[440px] h-[260px] sm:h-[320px] relative flex items-center justify-center shrink-0">
              <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-[#4ADE80]/12 via-transparent to-transparent blur-3xl" />
              <svg viewBox="0 0 320 240" fill="none" className="w-full h-full overflow-visible opacity-90">
                <defs>
                  <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.2" />
                    <stop offset="60%" stopColor="#22C55E" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#0E1310" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Soft Glowing Atmosphere Field */}
                <ellipse cx="160" cy="120" rx="120" ry="70" fill="url(#auraGrad)" />

                {/* Precision Contour Frequency Lines */}
                <path d="M 20 180 C 80 170, 110 80, 160 80 C 210 80, 240 170, 300 160" stroke="#4ADE80" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 20 160 C 80 150, 110 95, 160 95 C 210 95, 240 150, 300 140" stroke="#86EFAC" strokeWidth="1.5" strokeOpacity="0.75" />
                <path d="M 20 140 C 80 130, 110 110, 160 110 C 210 110, 240 130, 300 120" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 4" />
                <path d="M 20 120 C 80 115, 110 120, 160 120 C 210 120, 240 115, 300 100" stroke="#86EFAC" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="5 5" />
                
                {/* Horizontal Horizon Beam */}
                <line x1="20" y1="80" x2="300" y2="80" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="2 4" />
                
                {/* Focal Crest Anchor Points */}
                <circle cx="160" cy="80" r="5" fill="#4ADE80" filter="drop-shadow(0 0 12px #4ADE80)" />
                <circle cx="160" cy="80" r="2" fill="#FFFFFF" />
                <circle cx="110" cy="95" r="3" fill="#86EFAC" />
                <circle cx="210" cy="95" r="3" fill="#86EFAC" />
              </svg>
            </div>
          </div>

          {/* =========================================================================
              CHAPTER 3: MANY INVESTMENTS. ONE SYSTEM. + Multi-Dimensional Lattice
             ========================================================================= */}
          <div className="flex items-center gap-12 sm:gap-20 shrink-0">
            {/* Primary Editorial Heading */}
            <div className="flex flex-col justify-center shrink-0 whitespace-normal">
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.035em] uppercase leading-[0.95]">
                MANY INVESTMENTS. <br />
                <span className="text-[#8E9B91]/80">ONE SYSTEM.</span>
              </h3>
            </div>

            {/* Abstract Atmospheric Visual: Connected Geometric Lattice & Relational Planes */}
            <div className="w-[280px] sm:w-[380px] md:w-[440px] h-[260px] sm:h-[320px] relative flex items-center justify-center shrink-0">
              <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-[#4ADE80]/10 via-transparent to-transparent blur-2xl" />
              <svg viewBox="0 0 320 240" fill="none" className="w-full h-full overflow-visible opacity-90">
                {/* Faceted Translucent Polygons */}
                <polygon points="60,60 160,30 130,140 40,110" fill="rgba(74,222,128,0.06)" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.5" />
                <polygon points="160,30 260,50 220,150 130,140" fill="rgba(134,239,172,0.08)" stroke="#86EFAC" strokeWidth="1.2" strokeOpacity="0.7" />
                <polygon points="130,140 220,150 170,210 90,190" fill="rgba(34,197,94,0.05)" stroke="#22C55E" strokeWidth="0.9" strokeOpacity="0.4" />
                <polygon points="40,110 130,140 90,190 20,160" fill="rgba(74,222,128,0.04)" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.3" />

                {/* Internal Luminous Connectors */}
                <line x1="160" y1="30" x2="130" y2="140" stroke="#86EFAC" strokeWidth="1.6" strokeOpacity="0.85" />
                <line x1="130" y1="140" x2="220" y2="150" stroke="#4ADE80" strokeWidth="1.4" strokeOpacity="0.75" />
                <line x1="60" y1="60" x2="260" y2="50" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 4" />

                {/* Radiant Constellation Nodes */}
                <circle cx="160" cy="30" r="4" fill="#4ADE80" filter="drop-shadow(0 0 8px #4ADE80)" />
                <circle cx="160" cy="30" r="1.8" fill="#FFFFFF" />
                <circle cx="130" cy="140" r="5" fill="#86EFAC" filter="drop-shadow(0 0 10px #86EFAC)" />
                <circle cx="130" cy="140" r="2.2" fill="#FFFFFF" />
                <circle cx="220" cy="150" r="3.5" fill="#4ADE80" />
                <circle cx="260" cy="50" r="3" fill="#8E9B91" />
                <circle cx="60" cy="60" r="3" fill="#8E9B91" />
                <circle cx="170" cy="210" r="3" fill="#8E9B91" />
              </svg>
            </div>
          </div>

          {/* =========================================================================
              EPILOGUE: Final Resonant Editorial Statement
             ========================================================================= */}
          <div className="flex flex-col justify-center shrink-0 pl-8 pr-28 max-w-[540px] sm:max-w-[680px] whitespace-normal">
            <h2 className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-8xl text-white tracking-[-0.035em] uppercase leading-[0.92]">
              TOTAL SOVEREIGNTY. <br />
              <span className="text-[#4ADE80]">ZERO COMPROMISE.</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Seamless Bottom Blend into About */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0E1310] via-[#0E1310]/80 to-transparent z-10" />
    </section>
  );
}
