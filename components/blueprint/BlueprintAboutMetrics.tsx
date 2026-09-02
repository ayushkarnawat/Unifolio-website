"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function BlueprintAboutMetrics() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const beaconRef = useRef<HTMLDivElement | null>(null);
  const state1Ref = useRef<HTMLDivElement | null>(null);
  const state2Ref = useRef<HTMLDivElement | null>(null);
  const state3Ref = useRef<HTMLDivElement | null>(null);
  const contourLayerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=460%",
          pin: stageRef.current,
          scrub: 1.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // =========================================================================
      // 1. BEACON SPATIAL MORPHING & TRANSLATION (Harmonized with 3 distinct states)
      // Center (Phase 1) -> Left anchor (Phase 2) -> Fades softly as 3-panel landscape rises
      // =========================================================================
      tl.fromTo(
        beaconRef.current,
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.95,
        },
        {
          keyframes: [
            // Phase 1 -> Phase 2: Glide to the left
            {
              x: -280,
              y: -20,
              scale: 0.88,
              opacity: 1,
              duration: 0.42,
              ease: "power2.inOut",
            },
            // Phase 2 -> Phase 3: Fades softly as the 3-panel landscape rises
            {
              x: -120,
              y: 60,
              scale: 1.1,
              opacity: 0.15,
              duration: 0.58,
              ease: "power2.inOut",
            },
          ],
        },
        0
      );

      // =========================================================================
      // 2. STATE 1: INTRO (About us + Our Mission + Subtitle)
      // Gently emerges (t: 0.0 -> 0.08), holds steadily (t: 0.08 -> 0.24), then glides up (t: 0.24 -> 0.34)
      // =========================================================================
      tl.fromTo(
        state1Ref.current,
        { opacity: 0.15, filter: "blur(6px)", y: 25 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.08, ease: "power2.out" },
        0
      );

      tl.to(
        state1Ref.current,
        {
          opacity: 0,
          y: -40,
          filter: "blur(4px)",
          duration: 0.10,
          ease: "power2.inOut",
        },
        0.24
      );

      // =========================================================================
      // 3. STATE 2: MISSION STATEMENT & PHILOSOPHY
      // Glides into center-right (t: 0.30 -> 0.42), generous reading pause (t: 0.42 -> 0.68), then recedes
      // =========================================================================
      tl.fromTo(
        state2Ref.current,
        {
          opacity: 0,
          x: 60,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 0.12,
          ease: "power2.out",
        },
        0.30
      );

      tl.to(
        state2Ref.current,
        {
          opacity: 0,
          y: -50,
          filter: "blur(6px)",
          duration: 0.10,
          ease: "power2.in",
        },
        0.68
      );

      // =========================================================================
      // 4. STATE 3: 3-PILLAR PANELS & TOPOGRAPHIC CONTOUR PARALLAX
      // Glides in smoothly (t: 0.74 -> 0.86), generous review pause (t: 0.86 -> 1.00)
      // =========================================================================
      tl.fromTo(
        state3Ref.current,
        {
          opacity: 0,
          y: 60,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.12,
          ease: "power2.out",
        },
        0.74
      );

      // Subtle slow parallax shift across the flowing organic contour landscape
      tl.fromTo(
        contourLayerRef.current,
        { y: 40, x: -15, opacity: 0 },
        { y: -25, x: 15, opacity: 1, duration: 0.26, ease: "none" },
        0.72
      );

      // Final extended holding interval for reading all 3 panels comfortably
      tl.to({}, { duration: 0.14 }, 0.86);
    },
    { scope: containerRef }
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] select-none"
      style={{ height: "560vh" }}
    >
      {/* Fullscreen Pinned Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF8F5] flex items-center justify-center p-6 sm:p-12 lg:p-20 text-[#121915]"
      >
        {/* Subtle Ambient Dark Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,107,62,0.06)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(30,107,62,0.04)_0%,transparent_60%)]" />

        {/* Ambient Top & Bottom Grid Hairlines */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        {/* =========================================================================
            THE LUMINOUS ORGANIC EMERALD BEACON (Central Atmospheric Core)
           ========================================================================= */}
        <div
          ref={beaconRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 will-change-transform"
        >
          <div className="relative w-[340px] sm:w-[460px] md:w-[540px] h-[340px] sm:h-[460px] md:h-[540px] flex items-center justify-center">
            <Image
              src="/About Us Illustration.png"
              alt="About Us Illustration"
              fill
              priority
              className="object-contain pointer-events-none"
              style={{ filter: "invert(0.96) hue-rotate(160deg) contrast(1.1)" }}
              quality={100}
            />
          </div>
        </div>

        {/* =========================================================================
            STATE 1: INTRO SCREEN (Large Elegant "About us" + Corner Editorial Copy)
           ========================================================================= */}
        <div
          ref={state1Ref}
          className="absolute inset-0 p-8 sm:p-14 lg:p-20 flex flex-col justify-between z-10 pointer-events-none will-change-transform max-w-7xl mx-auto"
        >
          <div className="space-y-2">
            <h2 className="font-sans font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#121915]">
              About us
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#1E6B3E] shadow-[0_0_6px_rgba(30,107,62,0.6)]" />
              <span className="font-mono text-xs sm:text-sm text-[#525E56] uppercase tracking-[0.25em] font-medium">
                Our Mission
              </span>
            </div>

            <div className="max-w-md sm:text-right space-y-1">
              <p className="font-sans font-light text-2xl sm:text-3xl lg:text-4xl text-[#121915] leading-tight tracking-tight">
                Creating clarity <br />
                with sovereign intelligence
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STATE 2: MISSION STATEMENT & PHILOSOPHY (Centered Editorial Focus)
           ========================================================================= */}
        <div
          ref={state2Ref}
          className="absolute inset-0 p-8 sm:p-14 lg:p-20 flex items-center justify-end z-10 pointer-events-none opacity-0 will-change-transform max-w-7xl mx-auto"
        >
          <div className="max-w-2xl lg:max-w-3xl space-y-8 text-left">
            <h3 className="font-sans font-light text-3xl sm:text-5xl lg:text-6xl text-[#121915] tracking-tight leading-[1.15]">
              Our mission is to build absolute transparency and sovereign clarity across every folio, fund, and asset.
            </h3>

            <p className="font-sans font-normal text-sm sm:text-base lg:text-lg text-[#525E56] leading-relaxed max-w-2xl">
              By unmasking hidden distribution fees, consolidating multi-PAN structures, and automating direct migration, we empower families and institutions to see what they truly own.
            </p>
          </div>
        </div>

        {/* =========================================================================
            STATE 3: 3 CAPABILITY PANELS WITH ABSTRACT ILLUMINATED ORGANIC SURFACES
           ========================================================================= */}
        <div
          ref={state3Ref}
          className="absolute inset-0 p-6 sm:p-12 lg:p-20 flex items-center justify-center z-10 pointer-events-none opacity-0 will-change-transform max-w-7xl mx-auto"
        >
          {/* Panoramic Container Holding the 3 Panels */}
          <div className="relative w-full rounded-[40px] overflow-hidden border border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.9)] pointer-events-auto">
            
            {/* ABSTRACT ILLUMINATED TOPOGRAPHIC / CELLULAR SURFACES (Cinematic Art Direction) */}
            <div
              ref={contourLayerRef}
              className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden will-change-transform z-0"
            >
              <svg
                viewBox="0 0 1200 600"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  {/* Subtle Organic Film Grain Filter */}
                  <filter id="subtleSurfaceGrain" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="noise" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.7  0 0 0 0 0.3  0 0 0 0.04 0" result="coloredGrain" />
                    <feComposite in="coloredGrain" in2="SourceGraphic" operator="in" />
                  </filter>

                  {/* Soft Restrained Rim Glow Filter */}
                  <filter id="subtleSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blurMid" />
                    <feGaussianBlur stdDeviation="10" result="blurWide" />
                    <feMerge>
                      <feMergeNode in="blurWide" />
                      <feMergeNode in="blurMid" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Deep Atmospheric Haze Filter for Middle Card Ambient */}
                  <filter id="deepAmbientHaze" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="24" />
                  </filter>

                  {/* LEFT CARD: Soft Inward-Diffusing Organic Surface Gradient */}
                  <radialGradient id="leftSurfaceGrad" cx="-20" cy="170" r="240" fx="70" fy="170" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.18" />
                    <stop offset="40%" stopColor="#1E6B3E" stopOpacity="0.08" />
                    <stop offset="75%" stopColor="#1E6B3E" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>

                  {/* MIDDLE CARD: Barely-there ambient atmospheric whisper */}
                  <radialGradient id="midAmbientGrad" cx="580" cy="620" r="260" fx="580" fy="580" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#1E6B3E" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>

                  {/* RIGHT CARD: Large Bottom-Right Topographic Surface Gradient */}
                  <radialGradient id="rightBottomSurfaceGrad" cx="1200" cy="600" r="380" fx="1060" fy="440" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.20" />
                    <stop offset="38%" stopColor="#1E6B3E" stopOpacity="0.10" />
                    <stop offset="78%" stopColor="#1E6B3E" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>

                  {/* RIGHT CARD: Subtle Upper-Right Organic Horizon Gradient */}
                  <radialGradient id="rightTopSurfaceGrad" cx="1220" cy="-20" r="260" fx="1120" fy="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.14" />
                    <stop offset="45%" stopColor="#1E6B3E" stopOpacity="0.05" />
                    <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* =========================================================================
                    1. LEFT CARD: LARGE AMORPHOUS ILLUMINATED SURFACE (Autonomous Ledger)
                   ========================================================================= */}
                <path
                  d="M -120 -80 C -40 20, 110 80, 110 170 C 110 260, 20 330, -80 390 L -120 390 Z"
                  fill="url(#leftSurfaceGrad)"
                />
                <path
                  d="M -120 -80 C -40 20, 110 80, 110 170 C 110 260, 20 330, -80 390 L -120 390 Z"
                  fill="url(#leftSurfaceGrad)"
                  filter="url(#subtleSurfaceGrain)"
                  opacity="0.75"
                />
                <path
                  d="M -40 20 C 60 75, 110 125, 110 170 C 110 225, 60 290, -40 350"
                  fill="none"
                  stroke="#1E6B3E"
                  strokeWidth="3.5"
                  strokeOpacity="0.12"
                  filter="url(#subtleSoftGlow)"
                />
                <path
                  d="M -40 20 C 60 75, 110 125, 110 170 C 110 225, 60 290, -40 350"
                  fill="none"
                  stroke="#1E6B3E"
                  strokeWidth="0.85"
                  strokeOpacity="0.4"
                />

                {/* =========================================================================
                    2. MIDDLE CARD: PURE NEGATIVE SPACE WITH FAINT AMBIENT WHISPER
                   ========================================================================= */}
                <ellipse
                  cx="580"
                  cy="610"
                  rx="180"
                  ry="90"
                  fill="url(#midAmbientGrad)"
                  filter="url(#deepAmbientHaze)"
                />

                {/* =========================================================================
                    3. RIGHT CARD: LARGE SOFT ORGANIC SURFACE (Household Wealth)
                   ========================================================================= */}
                <path
                  d="M 980 -50 C 1010 40, 1070 90, 1240 110 L 1240 -50 Z"
                  fill="url(#rightTopSurfaceGrad)"
                />
                <path
                  d="M 1000 -20 C 1030 45, 1080 85, 1220 105"
                  fill="none"
                  stroke="#1E6B3E"
                  strokeWidth="0.75"
                  strokeOpacity="0.25"
                  filter="url(#subtleSoftGlow)"
                />

                <path
                  d="M 820 640 C 900 540, 990 430, 1060 420 C 1130 410, 1190 425, 1240 440 L 1240 640 Z"
                  fill="url(#rightBottomSurfaceGrad)"
                />
                <path
                  d="M 820 640 C 900 540, 990 430, 1060 420 C 1130 410, 1190 425, 1240 440 L 1240 640 Z"
                  fill="url(#rightBottomSurfaceGrad)"
                  filter="url(#subtleSurfaceGrain)"
                  opacity="0.8"
                />
                <path
                  d="M 860 610 C 930 510, 1000 425, 1060 420 C 1130 410, 1190 425, 1240 440"
                  fill="none"
                  stroke="#1E6B3E"
                  strokeWidth="4"
                  strokeOpacity="0.15"
                  filter="url(#subtleSoftGlow)"
                />
                <path
                  d="M 860 610 C 930 510, 1000 425, 1060 420 C 1130 410, 1190 425, 1240 440"
                  fill="none"
                  stroke="#1E6B3E"
                  strokeWidth="0.9"
                  strokeOpacity="0.45"
                />
              </svg>
            </div>

            {/* 3 CAPABILITY PANELS WITH VERY SUBTLE THIN DIVIDING LINES */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/[0.06] p-6 sm:p-10 lg:p-12">
              
              {/* Panel 1: Autonomous Ledger */}
              <div className="group p-5 sm:p-6 lg:p-8 space-y-8 flex flex-col justify-between min-h-[360px] sm:min-h-[420px] rounded-2xl hover:bg-black/[0.02] transition-colors duration-300">
                <div className="space-y-3">
                  <div className="font-mono text-xs text-[#1E6B3E] font-semibold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B3E] shadow-[0_0_6px_rgba(30,107,62,0.6)] group-hover:scale-125 transition-transform" />
                    44+ AMCs Unified
                  </div>
                  <h4 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#121915] tracking-tight leading-tight group-hover:text-[#1E6B3E] transition-colors">
                    Autonomous Ledger
                  </h4>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#525E56] leading-relaxed max-w-xs group-hover:text-[#121915] transition-colors">
                  Building clarity from scattered statements across 44+ AMCs, depositories & brokerages into a single resolved master ledger.
                </p>

                <div className="pt-4 border-t border-black/[0.06] font-mono text-2xl sm:text-3xl text-[#121915] font-bold tracking-tight">
                  ₹420Cr+ <span className="text-[11px] font-normal text-[#525E56] block uppercase tracking-wider mt-0.5">Tracked Asset Base</span>
                </div>
              </div>

              {/* Panel 2: Fee Dissection */}
              <div className="group p-5 sm:p-6 lg:p-8 space-y-8 flex flex-col justify-between min-h-[360px] sm:min-h-[420px] rounded-2xl hover:bg-black/[0.02] transition-colors duration-300">
                <div className="space-y-3">
                  <div className="font-mono text-xs text-[#1E6B3E] font-semibold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B3E] shadow-[0_0_6px_rgba(30,107,62,0.6)] group-hover:scale-125 transition-transform" />
                    Expense Ratio Audit
                  </div>
                  <h4 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#121915] tracking-tight leading-tight group-hover:text-[#1E6B3E] transition-colors">
                    Fee Dissection
                  </h4>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#525E56] leading-relaxed max-w-xs group-hover:text-[#121915] transition-colors">
                  Keeping wealth compounding by unmasking 15bps expense ratios and 1.5% regular plan trail commissions eating returns.
                </p>

                <div className="pt-4 border-t border-black/[0.06] font-mono text-2xl sm:text-3xl text-[#121915] font-bold tracking-tight">
                  100% <span className="text-[11px] font-normal text-[#525E56] block uppercase tracking-wider mt-0.5">TER Transparency</span>
                </div>
              </div>

              {/* Panel 3: Household Wealth */}
              <div className="group p-5 sm:p-6 lg:p-8 space-y-8 flex flex-col justify-between min-h-[360px] sm:min-h-[420px] rounded-2xl hover:bg-black/[0.02] transition-colors duration-300">
                <div className="space-y-3">
                  <div className="font-mono text-xs text-[#1E6B3E] font-semibold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B3E] shadow-[0_0_6px_rgba(30,107,62,0.6)] group-hover:scale-125 transition-transform" />
                    Multi-PAN Architecture
                  </div>
                  <h4 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-[#121915] tracking-tight leading-tight group-hover:text-[#1E6B3E] transition-colors">
                    Household Wealth
                  </h4>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#525E56] leading-relaxed max-w-xs group-hover:text-[#121915] transition-colors">
                  Unifying multi-generation family portfolios across all entities into one intelligent, tax-optimized view.
                </p>

                <div className="pt-4 border-t border-black/[0.06] font-mono text-2xl sm:text-3xl text-[#121915] font-bold tracking-tight">
                  18,000+ <span className="text-[11px] font-normal text-[#525E56] block uppercase tracking-wider mt-0.5">Active Families</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Seamless Bottom Section Blend into FAQ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5F3EE] to-transparent z-10" />
    </section>
  );
}
