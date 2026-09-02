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
          end: () => `+=${Math.max(2000, (track.scrollWidth - window.innerWidth) * 2.0 + 1000)}`,
          pin: stageRef.current,
          scrub: 1.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // 1. Gentle cinematic entrance (t: 0.0 -> 0.14)
      tl.fromTo(
        track,
        {
          opacity: 0.15,
          filter: "blur(6px)",
          scale: 0.98,
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1.0,
          duration: 0.14,
          ease: "power2.out",
        },
        0
      );

      // 2. Continuous horizontal translation across the pinned viewport (t: 0.0 -> 1.0)
      tl.to(
        track,
        {
          x: getScrollAmount,
          ease: "none",
          duration: 1.0,
        },
        0
      );

      // 3. Gentle cinematic exit dissolve (t: 0.86 -> 1.00)
      tl.to(
        track,
        {
          opacity: 0.15,
          scale: 0.97,
          y: -20,
          filter: "blur(6px)",
          ease: "power2.inOut",
          duration: 0.14,
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
      className="relative w-full bg-[#F5F3EE] select-none"
      style={{ height: "580vh" }}
    >
      {/* Seamless Top Blend from Hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/60 to-transparent z-10" />

      {/* Pinned Fullscreen Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center bg-[#F5F3EE]"
      >
        {/* Subtle Ambient Background Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_45%,rgba(30,107,62,0.06)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_55%,rgba(30,107,62,0.04)_0%,transparent_60%)]" />

        {/* Continuous Horizontal Panoramic Ribbon */}
        <div
          ref={trackRef}
          className="flex items-center gap-24 sm:gap-36 lg:gap-48 px-12 sm:px-20 lg:px-32 w-max whitespace-nowrap will-change-transform"
        >
          {/* =========================================================================
              PROLOGUE: Bold Section Opening Statement
             ========================================================================= */}
          <div className="flex flex-col justify-center shrink-0 pr-12">
            <h2 className="font-sans font-black text-6xl sm:text-8xl lg:text-[104px] text-[#121915] tracking-[-0.04em] uppercase leading-[0.90]">
              ENGINEERED <br />
              FOR TOTAL <br />
              <span className="text-[#1E6B3E]">CLARITY.</span>
            </h2>
          </div>

          {/* =========================================================================
              CHAPTER 1: One View. Nothing Hidden.
             ========================================================================= */}
          <div className="flex items-center gap-14 sm:gap-20 shrink-0">
            {/* Editorial Statement */}
            <div className="flex flex-col justify-center shrink-0">
              <h3 className="font-sans font-black text-5xl sm:text-7xl lg:text-[84px] text-[#121915] tracking-[-0.035em] uppercase leading-[0.92]">
                ONE VIEW. <br />
                <span className="text-[#1E6B3E]">NOTHING HIDDEN.</span>
              </h3>
            </div>

            {/* Abstract Atmospheric Visual 1: Converging Concentric Singularity */}
            <div className="w-[300px] sm:w-[380px] lg:w-[440px] h-[300px] sm:h-[380px] lg:h-[440px] relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6B3E]/10 via-transparent to-transparent rounded-full blur-3xl opacity-60" />
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10 drop-shadow-[0_4px_20px_rgba(30,107,62,0.12)]"
              >
                <defs>
                  <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#2E7D4E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="streamGrad1" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0" />
                    <stop offset="50%" stopColor="#1E6B3E" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1E6B3E" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="coreGlow1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#2E7D4E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F5F3EE" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Concentric Elliptical Resonances */}
                <ellipse cx="200" cy="200" rx="170" ry="110" stroke="url(#orbitGrad1)" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.4" />
                <ellipse cx="200" cy="200" rx="130" ry="160" stroke="url(#orbitGrad1)" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" transform="rotate(-25 200 200)" />
                <ellipse cx="200" cy="200" rx="90" ry="90" stroke="#1E6B3E" strokeWidth="1.2" strokeOpacity="0.5" />
                <ellipse cx="200" cy="200" rx="45" ry="45" stroke="#1E6B3E" strokeWidth="1.8" strokeOpacity="0.8" />

                {/* Radiating Precision Laser Axes */}
                <line x1="20" y1="200" x2="380" y2="200" stroke="url(#streamGrad1)" strokeWidth="1" opacity="0.5" />
                <line x1="200" y1="20" x2="200" y2="380" stroke="url(#streamGrad1)" strokeWidth="1" opacity="0.5" />
                <line x1="70" y1="70" x2="330" y2="330" stroke="url(#streamGrad1)" strokeWidth="0.8" opacity="0.3" />

                {/* Central Luminous Singularity */}
                <circle cx="200" cy="200" r="32" fill="url(#coreGlow1)" />
                <circle cx="200" cy="200" r="4.5" fill="#121915" />

                {/* Orbital Beacon Nodes */}
                <circle cx="318" cy="132" r="3.5" fill="#1E6B3E" />
                <circle cx="82" cy="268" r="3.5" fill="#1E6B3E" />
                <circle cx="200" cy="40" r="3" fill="#121915" opacity="0.8" />
                <circle cx="200" cy="360" r="3" fill="#121915" opacity="0.8" />
              </svg>
            </div>
          </div>

          {/* =========================================================================
              CHAPTER 2: See What Your Money Leaves Behind.
             ========================================================================= */}
          <div className="flex items-center gap-14 sm:gap-20 shrink-0">
            {/* Editorial Statement */}
            <div className="flex flex-col justify-center shrink-0">
              <h3 className="font-sans font-black text-5xl sm:text-7xl lg:text-[84px] text-[#121915] tracking-[-0.035em] uppercase leading-[0.92]">
                SEE WHAT YOUR <br />
                MONEY <span className="text-[#1E6B3E]">LEAVES BEHIND.</span>
              </h3>
            </div>

            {/* Abstract Atmospheric Visual 2: Flowing Harmonic Refraction Strata */}
            <div className="w-[300px] sm:w-[380px] lg:w-[440px] h-[300px] sm:h-[380px] lg:h-[440px] relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E6B3E]/10 via-[#0284C7]/08 to-transparent rounded-full blur-3xl opacity-60" />
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10 drop-shadow-[0_4px_20px_rgba(30,107,62,0.12)]"
              >
                <defs>
                  <linearGradient id="waveGradA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#1E6B3E" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="waveGradB" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#1E6B3E" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1E6B3E" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Layered Flowing Ribbon Strata */}
                <path
                  d="M 30 280 C 110 320, 160 140, 240 180 C 300 210, 340 120, 370 100"
                  stroke="url(#waveGradA)"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 30 250 C 110 290, 160 110, 240 150 C 300 180, 340 90, 370 70"
                  stroke="url(#waveGradA)"
                  strokeWidth="1.2"
                  strokeDasharray="6 6"
                  opacity="0.6"
                  fill="none"
                />
                <path
                  d="M 30 210 C 120 160, 170 270, 250 230 C 310 200, 330 260, 370 280"
                  stroke="url(#waveGradB)"
                  strokeWidth="1.6"
                  fill="none"
                />
                <path
                  d="M 30 170 C 120 120, 170 230, 250 190 C 310 160, 330 220, 370 240"
                  stroke="url(#waveGradB)"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                  opacity="0.4"
                  fill="none"
                />

                {/* Topographic Vertical Field Splines */}
                {[80, 140, 200, 260, 320].map((x, idx) => (
                  <line
                    key={idx}
                    x1={x}
                    y1="60"
                    x2={x}
                    y2="340"
                    stroke="#1E6B3E"
                    strokeWidth="0.8"
                    strokeDasharray="2 6"
                    opacity={0.15 + (idx % 2) * 0.15}
                  />
                ))}

                {/* Harmonic Crest Point Beacons */}
                <circle cx="240" cy="180" r="4" fill="#1E6B3E" />
                <circle cx="160" cy="140" r="3" fill="#121915" />
                <circle cx="250" cy="230" r="3.5" fill="#0284C7" />
              </svg>
            </div>
          </div>

          {/* =========================================================================
              CHAPTER 3: Many Investments. One System.
             ========================================================================= */}
          <div className="flex items-center gap-14 sm:gap-20 shrink-0">
            {/* Editorial Statement */}
            <div className="flex flex-col justify-center shrink-0">
              <h3 className="font-sans font-black text-5xl sm:text-7xl lg:text-[84px] text-[#121915] tracking-[-0.035em] uppercase leading-[0.92]">
                MANY INVESTMENTS. <br />
                <span className="text-[#1E6B3E]">ONE SYSTEM.</span>
              </h3>
            </div>

            {/* Abstract Atmospheric Visual 3: Interconnected Geodesic Wealth Matrix */}
            <div className="w-[300px] sm:w-[380px] lg:w-[440px] h-[300px] sm:h-[380px] lg:h-[440px] relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tl from-[#1E6B3E]/10 via-transparent to-transparent rounded-full blur-3xl opacity-60" />
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10 drop-shadow-[0_4px_20px_rgba(30,107,62,0.12)]"
              >
                <defs>
                  <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#2E7D4E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Interlinked Geodesic Polygon Matrix */}
                <polygon
                  points="200,60 320,130 320,270 200,340 80,270 80,130"
                  stroke="url(#polyGrad)"
                  strokeWidth="1.4"
                  fill="none"
                />
                <polygon
                  points="200,110 280,160 280,240 200,290 120,240 120,160"
                  stroke="#1E6B3E"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                  fill="none"
                />

                {/* Internal Cross-Linking Chords */}
                <line x1="200" y1="60" x2="200" y2="340" stroke="#1E6B3E" strokeWidth="0.8" opacity="0.3" />
                <line x1="80" y1="130" x2="320" y2="270" stroke="#1E6B3E" strokeWidth="0.8" opacity="0.3" />
                <line x1="80" y1="270" x2="320" y2="130" stroke="#1E6B3E" strokeWidth="0.8" opacity="0.3" />

                {/* Interconnected Node Beacons */}
                <circle cx="200" cy="60" r="4.5" fill="#1E6B3E" />
                <circle cx="320" cy="130" r="4.5" fill="#1E6B3E" />
                <circle cx="320" cy="270" r="4.5" fill="#1E6B3E" />
                <circle cx="200" cy="340" r="4.5" fill="#1E6B3E" />
                <circle cx="80" cy="270" r="4.5" fill="#1E6B3E" />
                <circle cx="80" cy="130" r="4.5" fill="#1E6B3E" />

                {/* Center Nexus Beacon */}
                <circle cx="200" cy="200" r="7" fill="#1E6B3E" fillOpacity="0.15" stroke="#1E6B3E" strokeWidth="1.5" />
                <circle cx="200" cy="200" r="2.5" fill="#121915" />
              </svg>
            </div>
          </div>

          {/* =========================================================================
              EPILOGUE: Final Confident Statement
             ========================================================================= */}
          <div className="flex flex-col justify-center shrink-0 pl-12 pr-28">
            <h3 className="font-sans font-black text-6xl sm:text-8xl lg:text-[104px] text-[#121915] uppercase tracking-[-0.04em] leading-[0.90]">
              NO GAPS. <br />
              <span className="text-[#1E6B3E]">JUST CLARITY.</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Seamless Bottom Blend into About */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/60 to-transparent z-10" />
    </section>
  );
}
