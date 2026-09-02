"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function BlueprintHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroGlowRef = useRef<HTMLDivElement | null>(null);
  const lasersRef = useRef<HTMLDivElement | null>(null);
  const cardsWrapRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      const cardEls = gsap.utils.toArray<HTMLElement>(".portfolio-card");

      // Initial hardware-accelerated transforms (No CSS transform collision)
      gsap.set(cardEls, {
        transformOrigin: "center center",
        force3D: true,
        opacity: 0,
      });

      // =========================================================================
      // 0. CONTINUOUS ORGANIC AMBIENT MOTION (Liquid Wave Strata in Hero Visual)
      // =========================================================================
      const turbEl = document.getElementById("heroWaveTurbulence");
      const dispEl = document.getElementById("heroWaveDisplacement");
      if (turbEl) {
        const waveFlowState = { freqX: 0.0045, freqY: 0.009, scale: 13 };
        // feTurbulence/feDisplacementMap recompute is one of the most expensive
        // things a browser can paint each frame. The ambient drift is slow and
        // subtle, so sampling it at ~20fps (every 3rd rAF tick) instead of 60fps
        // is visually indistinguishable while cutting filter recompute cost by ~2/3.
        let frameSkip = 0;
        const waveTween = gsap.to(waveFlowState, {
          freqX: 0.0068,
          freqY: 0.0125,
          scale: 17,
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onUpdate: () => {
            frameSkip = (frameSkip + 1) % 3;
            if (frameSkip !== 0) return;
            turbEl.setAttribute(
              "baseFrequency",
              `${waveFlowState.freqX} ${waveFlowState.freqY}`
            );
            if (dispEl) {
              dispEl.setAttribute("scale", `${waveFlowState.scale}`);
            }
          },
        });

        // Only pay the filter-recompute cost while the hero is actually
        // on screen; pause it entirely once the user has scrolled past.
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => waveTween.play(),
          onEnterBack: () => waveTween.play(),
          onLeave: () => waveTween.pause(),
          onLeaveBack: () => waveTween.pause(),
        });
      }

      // Cache the layout read the orbital choreography needs instead of
      // querying clientWidth on every single scrub tick. Only recomputed when
      // ScrollTrigger actually re-measures the page (resize/orientation change).
      let cachedWrapWidth = cardsWrapRef.current?.clientWidth || 640;

      // SINGLE COORDINATED MASTER GSAP TIMELINE TIED TO SCROLL TRIGGER
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=420%",
          pin: stageRef.current,
          scrub: 1.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            cachedWrapWidth = cardsWrapRef.current?.clientWidth || 640;
          },
        },
      });

      // =========================================================================
      // 1. HERO APERTURE EXPANSION & OVERLAPPING HANDOFF (t: 0.0 -> 0.28)
      // =========================================================================
      tl.fromTo(
        heroVisualRef.current,
        { scale: 1, opacity: 1 },
        { scale: 8.5, opacity: 0, ease: "power2.out", duration: 0.28 },
        0
      );

      tl.fromTo(
        heroGlowRef.current,
        { opacity: 0, scale: 1 },
        {
          keyframes: [
            { opacity: 1, scale: 1.4, duration: 0.14, ease: "sine.out" },
            { opacity: 0, scale: 2.1, duration: 0.14, ease: "power1.out" },
          ],
        },
        0
      );

      // Ambient Laser Stream in background
      tl.fromTo(
        lasersRef.current,
        { x: 260, opacity: 0 },
        { x: -140, opacity: 1, duration: 0.6, ease: "sine.inOut" },
        0.06
      );

      // =========================================================================
      // 2. STAGGERED 3D ORBITAL CONSTELLATION CHOREOGRAPHY (t: 0.06 -> 0.54)
      // Master coordinated timeline with cascading quintic smootherstep docking
      // =========================================================================
      const choreographyState = { progress: 0 };

      tl.to(
        choreographyState,
        {
          progress: 1,
          ease: "none",
          duration: 0.48,
          onUpdate: () => {
            const p = choreographyState.progress; // Master timeline progress (0.0 to 1.0)

            const wrapWidth = cachedWrapWidth;
            const stepX = Math.min(68, wrapWidth * 0.125);

            // Orbit focal center & radii (shared across formation)
            const orbitCenterX = Math.min(140, wrapWidth * 0.22);
            const orbitCenterY = 0;
            const Rx = Math.min(330, wrapWidth * 0.52);
            const Ry = 185;

            // Global orbital sweep angle (~280° of continuous rotation)
            const constellationAngle = p * (1.55 * Math.PI);

            cardEls.forEach((card, i) => {
              // 60° harmonic angular spacing
              const baseAngle = i * ((2 * Math.PI) / 6);
              const theta = baseAngle + constellationAngle;

              // Orbital coordinates
              const orbX = orbitCenterX + Math.cos(theta) * Rx;
              const orbY = orbitCenterY + Math.sin(theta) * Ry;

              // 3D perspective depth normalization along orbit (0 = rear, 1 = front)
              const depthNorm = (Math.sin(theta) + 1) / 2;
              const orbScale = 0.72 + 0.38 * depthNorm;
              const orbRotZ = Math.sin(theta) * 18 + Math.cos(theta) * 5;
              const orbRotY = Math.cos(theta) * 16;
              const orbRotX = Math.sin(theta) * 8;

              // Staggered emergence from aperture core (Back cards emerge first)
              const staggerEmergence = Math.max(0, Math.min(1, (p - (5 - i) * 0.02) * 5.0));
              const currentScaleBase = orbScale * (0.35 + 0.65 * staggerEmergence);
              const currentOpacity = staggerEmergence;

              // Target docked composition
              const targetX = i * stepX;
              const targetY = 0;
              const targetScale = 1 - i * 0.045;
              const targetRot = 0;

              // Cascading staggered docking threshold: Card 5 docks first, followed in wave to Card 0
              const dockLag = (5 - i) * 0.025;
              const cardOrbitEnd = 0.44 + dockLag;
              const cardDockEnd = 0.82 + dockLag;

              let finalX = orbX;
              let finalY = orbY;
              let finalScale = currentScaleBase;
              let finalRotZ = orbRotZ;
              let finalRotY = orbRotY;
              let finalRotX = orbRotX;

              // Quintic Smootherstep blending (Zero 1st & 2nd derivative acceleration at docking edges)
              if (p > cardOrbitEnd) {
                const rawBlend = (p - cardOrbitEnd) / (cardDockEnd - cardOrbitEnd);
                const t = Math.min(1, Math.max(0, rawBlend));
                // 6t^5 - 15t^4 + 10t^3
                const smoothBlend = t * t * t * (t * (t * 6 - 15) + 10);

                finalX = orbX * (1 - smoothBlend) + targetX * smoothBlend;
                finalY = orbY * (1 - smoothBlend) + targetY * smoothBlend;
                finalScale = currentScaleBase * (1 - smoothBlend) + targetScale * smoothBlend;
                finalRotZ = orbRotZ * (1 - smoothBlend) + targetRot * smoothBlend;
                finalRotY = orbRotY * (1 - smoothBlend) + targetRot * smoothBlend;
                finalRotX = orbRotX * (1 - smoothBlend) + targetRot * smoothBlend;
              }

              gsap.set(card, {
                x: finalX,
                y: finalY,
                scale: finalScale,
                rotationZ: finalRotZ,
                rotationY: finalRotY,
                rotationX: finalRotX,
                opacity: currentOpacity,
                force3D: true,
              });
            });
          },
        },
        0.06
      );

      // =========================================================================
      // 3. SEAMLESS VISUAL HANDOFF & STATEMENT REVEAL (t: 0.56 -> 1.0)
      // Cards recede smoothly -> Statement reveals and settles -> Reading pause -> Gentle resolve into next section
      // =========================================================================
      tl.to(
        cardsWrapRef.current,
        {
          scale: 0.95,
          x: 35,
          opacity: 0.22,
          filter: "blur(3px)",
          ease: "power2.inOut",
          duration: 0.18,
        },
        0.56
      );

      // Large Statement smoothly expands and commands the stage
      tl.fromTo(
        textWrapRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.98,
          filter: "blur(4px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1.0,
          filter: "blur(0px)",
          duration: 0.20,
          ease: "power2.out",
        },
        0.60
      );

      // Extended holding interval (t: 0.78 -> 0.88) ensures user comfortably reads the full statement
      tl.to({}, { duration: 0.10 }, 0.78);

      // Gentle, continuous resolution into the incoming horizontal narrative (t: 0.88 -> 1.0).
      // Fully resolves to transparent (rather than lingering at low opacity) so the handoff
      // into Stacking Cards' own entrance reads as one continuous motion instead of a
      // hero "ghost" still faintly visible under the next section's fade-in.
      tl.to(
        [textWrapRef.current, cardsWrapRef.current],
        {
          opacity: 0,
          y: -16,
          scale: 0.98,
          filter: "blur(2px)",
          ease: "power1.inOut",
          duration: 0.12,
        },
        0.88
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#040705] select-none"
      // Height must equal the ScrollTrigger's pin distance (end: "+=420%" = 420vh).
      // A larger authored height than the actual pin distance leaves a dead,
      // unpinned scroll gap after the pin releases and before the next
      // section's own pin engages, which reads as an abrupt stall.
      style={{ height: "420vh" }}
    >
      {/* Anchor for Section 2 Nav Link */}
      <div id="statement" className="absolute top-[35%] pointer-events-none" />

      {/* Single Pinned Master Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#040705] flex flex-col justify-between p-6 sm:p-10 lg:p-16"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_61%_48%,rgba(34,197,94,0.14)_0%,rgba(4,7,5,0.4)_50%,#040705_100%)] z-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_60%,rgba(34,197,94,0.08)_0%,transparent_60%)] z-0" />

        {/* Master Hero Visual Layer (Zooms and dissolves into the aperture void) */}
        <div
          ref={heroVisualRef}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none"
          style={{ transformOrigin: "60.5% 47.8%" }}
        >
          <div
            className="relative w-full h-full pointer-events-none"
            style={{ filter: "url(#heroWaveFlowFilter)" }}
          >
            <Image
              src="/New Hero visual.png"
              alt="Unifolio — See What You Actually Own"
              fill
              priority
              className="object-cover object-center w-full h-full pointer-events-none"
              quality={100}
            />
          </div>

          {/* Seamless Organic Displacement Filter for Existing Hero Wave Lines */}
          <svg className="pointer-events-none absolute w-0 h-0" aria-hidden="true">
            <defs>
              <filter id="heroWaveFlowFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  id="heroWaveTurbulence"
                  type="fractalNoise"
                  baseFrequency="0.004 0.008"
                  numOctaves="2"
                  result="noise"
                  seed="4"
                />
                <feDisplacementMap
                  id="heroWaveDisplacement"
                  in="SourceGraphic"
                  in2="noise"
                  scale="16"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          {/* Dynamic Luminous Green Flare Bloom Centered Over the Aperture */}
          <div
            ref={heroGlowRef}
            className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#22C55E]/0 via-[#4ADE80]/40 to-[#86EFAC]/50 blur-3xl opacity-0"
            style={{ left: "calc(60.5% - 210px)", top: "calc(47.8% - 210px)" }}
          />
        </div>

        {/* Ambient Laser Stream (Revealed during orbital card phase) */}
        <div
          ref={lasersRef}
          className="pointer-events-none absolute inset-0 overflow-hidden flex flex-col justify-center gap-12 opacity-0 z-0"
        >
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4ADE80]/35 to-transparent translate-x-12" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent -translate-x-24" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#86EFAC]/30 to-transparent translate-x-36" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4ADE80]/35 to-transparent -translate-x-16" />
        </div>

        {/* Top Spacer */}
        <div className="relative z-10 h-10 sm:h-12" />

        {/* Main Stage Arena: Left Text + Right Layered Stepped Glass Cards */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto w-full max-w-7xl mx-auto">
          {/* Left Column: Monumental Headline */}
          <div
            ref={textWrapRef}
            className="lg:col-span-5 xl:col-span-5 space-y-4 opacity-0 will-change-transform"
          >
            {/* Impactful Condensed Headline (Matching Hero Typography) */}
            <h2 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] text-[#FAF8F5] tracking-[-0.04em] uppercase leading-[0.92]">
              SEE THE WHOLE. <br />
              EVERY ASSET. <br />
              ONE VIEW.
            </h2>
          </div>

          {/* Right Column: 6 Abstract Financial Intelligence Motion Graphics Cards */}
          <div
            ref={cardsWrapRef}
            className="lg:col-span-7 xl:col-span-7 relative h-[360px] sm:h-[400px] md:h-[440px] flex items-center justify-start lg:justify-center overflow-visible will-change-transform"
          >
            <div className="relative w-full h-full flex items-center justify-start">
              
              {/* Card 0: Scattered Data. One Unified View. (5 Layered Sheets + Fiber-Optic Funnel to Singularity) */}
              <div
                key="glass-card-0"
                className="portfolio-card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden bg-[#061009]/95 border border-[#4ADE80]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(74,222,128,0.16),inset_0_1px_1px_0_rgba(74,222,128,0.4)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7"
                style={{ zIndex: 30 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    SCATTERED DATA. <br />
                    ONE UNIFIED VIEW.
                  </h3>
                </div>

                {/* Abstract Artwork: 5 Stacked 3D Sheets + Glowing Fiber-Optic Funnel */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full">
                  <svg viewBox="0 0 200 130" fill="none" className="w-full h-28 overflow-visible">
                    <defs>
                      <linearGradient id="sheetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#15803D" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* 5 Stacked Hovering Translucent 3D Planes */}
                    {/* Plane 1 (Top) */}
                    <polygon points="40,15 160,15 135,35 15,35" fill="url(#sheetGrad)" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.4" />
                    <circle cx="85" cy="25" r="1.5" fill="#86EFAC" />
                    <circle cx="120" cy="22" r="1.5" fill="#4ADE80" />

                    {/* Plane 2 */}
                    <polygon points="45,28 165,28 140,48 20,48" fill="url(#sheetGrad)" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.45" />
                    <circle cx="65" cy="38" r="1.5" fill="#4ADE80" />
                    <circle cx="105" cy="36" r="1.5" fill="#86EFAC" />

                    {/* Plane 3 */}
                    <polygon points="50,42 170,42 145,62 25,62" fill="url(#sheetGrad)" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.55" />
                    <circle cx="90" cy="52" r="1.8" fill="#FFFFFF" />
                    <circle cx="135" cy="50" r="1.5" fill="#4ADE80" />

                    {/* Plane 4 */}
                    <polygon points="55,56 175,56 150,76 30,76" fill="url(#sheetGrad)" stroke="#86EFAC" strokeWidth="0.85" strokeOpacity="0.65" />
                    <circle cx="75" cy="66" r="1.5" fill="#86EFAC" />
                    <circle cx="125" cy="64" r="1.5" fill="#4ADE80" />

                    {/* Fiber-Optic Funnel Curves */}
                    <path d="M 40 76 C 60 90, 95 105, 100 115" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.5" />
                    <path d="M 75 76 C 85 92, 98 106, 100 115" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.7" />
                    <path d="M 125 76 C 115 92, 102 106, 100 115" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.7" />
                    <path d="M 160 76 C 140 90, 105 105, 100 115" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.5" />

                    {/* Base Anchor Plane & Singular Luminous Glow Point */}
                    <polygon points="60,105 140,105 125,125 45,125" fill="rgba(74,222,128,0.06)" stroke="#4ADE80" strokeWidth="0.7" strokeOpacity="0.3" strokeDasharray="3 3" />
                    <circle cx="100" cy="115" r="4.5" fill="#4ADE80" filter="drop-shadow(0 0 10px #4ADE80)" />
                    <circle cx="100" cy="115" r="2" fill="#FFFFFF" />
                  </svg>
                </div>
              </div>

              {/* Card 1: Complexity, Structured with Intelligence (Cascading Document Sheets + Data Stream) */}
              <div
                key="glass-card-1"
                className="portfolio-card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7"
                style={{ zIndex: 26 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    COMPLEXITY, STRUCTURED <br />
                    WITH INTELLIGENCE.
                  </h3>
                </div>

                {/* Abstract Artwork: Angled Translucent Vertical Panels with Horizontal Connectors */}
                <div className="my-auto py-1 flex items-center justify-center w-full">
                  <svg viewBox="0 0 200 130" fill="none" className="w-full h-28 overflow-visible">
                    {/* Sheet 4 (Back) */}
                    <g transform="skewY(-10) translate(95, 20)">
                      <rect x="0" y="0" width="45" height="75" rx="4" fill="rgba(74,222,128,0.03)" stroke="#4ADE80" strokeWidth="0.7" strokeOpacity="0.25" />
                      <line x1="6" y1="12" x2="30" y2="12" stroke="#4ADE80" strokeWidth="0.7" strokeOpacity="0.3" />
                    </g>

                    {/* Sheet 3 */}
                    <g transform="skewY(-10) translate(75, 25)">
                      <rect x="0" y="0" width="48" height="80" rx="4" fill="rgba(74,222,128,0.05)" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.4" />
                      <line x1="6" y1="12" x2="32" y2="12" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.4" />
                    </g>

                    {/* Sheet 2 */}
                    <g transform="skewY(-10) translate(55, 30)">
                      <rect x="0" y="0" width="52" height="85" rx="5" fill="rgba(74,222,128,0.08)" stroke="#86EFAC" strokeWidth="0.9" strokeOpacity="0.6" />
                      <line x1="8" y1="15" x2="35" y2="15" stroke="#86EFAC" strokeWidth="0.9" strokeOpacity="0.7" />
                      <line x1="8" y1="28" x2="40" y2="28" stroke="#4ADE80" strokeWidth="0.7" strokeOpacity="0.3" />
                    </g>

                    {/* Sheet 1 (Front Active Sheet with Labels) */}
                    <g transform="skewY(-10) translate(30, 35)">
                      <rect x="0" y="0" width="60" height="92" rx="6" fill="rgba(6,16,9,0.85)" stroke="#4ADE80" strokeWidth="1.2" strokeOpacity="0.9" />
                      <text x="8" y="16" fill="#86EFAC" fontSize="6.5" fontFamily="monospace" fontWeight="600" letterSpacing="0.05em">ASSETS</text>
                      <text x="8" y="32" fill="#8E9B91" fontSize="5.5" fontFamily="monospace">HOLDINGS</text>
                      <text x="8" y="48" fill="#8E9B91" fontSize="5.5" fontFamily="monospace">TRANSACTIONS</text>
                      <text x="8" y="64" fill="#8E9B91" fontSize="5.5" fontFamily="monospace">FEES</text>
                      <text x="8" y="80" fill="#4ADE80" fontSize="5.5" fontFamily="monospace">RELATIONSHIPS</text>
                    </g>

                    {/* Horizontal Data Beams Piercing Through */}
                    <line x1="10" y1="58" x2="185" y2="58" stroke="#4ADE80" strokeWidth="1.2" strokeOpacity="0.75" />
                    <line x1="10" y1="78" x2="185" y2="78" stroke="#86EFAC" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 3" />
                    <circle cx="160" cy="58" r="2.5" fill="#4ADE80" filter="drop-shadow(0 0 6px #4ADE80)" />
                    <circle cx="175" cy="78" r="2" fill="#86EFAC" />
                  </svg>
                </div>
              </div>

              {/* Card 2: See Relationships. See What Matters. (Interconnected Radar Constellation) */}
              <div
                key="glass-card-2"
                className="portfolio-card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7"
                style={{ zIndex: 22 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    SEE RELATIONSHIPS. <br />
                    SEE WHAT MATTERS.
                  </h3>
                </div>

                {/* Abstract Artwork: Pentagonal Radar Constellation & Linked Asset Nodes */}
                <div className="my-auto py-1 flex items-center justify-center w-full">
                  <svg viewBox="0 0 200 130" fill="none" className="w-full h-28 overflow-visible">
                    {/* Concentric Background Orbital Rings */}
                    <circle cx="100" cy="65" r="52" stroke="#4ADE80" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="3 4" />
                    <circle cx="100" cy="65" r="34" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.25" />

                    {/* Pentagonal Connected Network Lines */}
                    <polygon points="100,20 155,52 135,105 65,105 45,52" stroke="#86EFAC" strokeWidth="1.2" strokeOpacity="0.6" fill="rgba(74,222,128,0.06)" />

                    {/* Internal Radial Spokes to Center */}
                    <line x1="100" y1="65" x2="100" y2="20" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.8" />
                    <line x1="100" y1="65" x2="155" y2="52" stroke="#4ADE80" strokeWidth="0.9" strokeOpacity="0.6" />
                    <line x1="100" y1="65" x2="135" y2="105" stroke="#4ADE80" strokeWidth="0.9" strokeOpacity="0.6" />
                    <line x1="100" y1="65" x2="65" y2="105" stroke="#4ADE80" strokeWidth="0.9" strokeOpacity="0.6" />
                    <line x1="100" y1="65" x2="45" y2="52" stroke="#4ADE80" strokeWidth="0.9" strokeOpacity="0.6" />

                    {/* Center Luminous Core: YOUR PORTFOLIO */}
                    <circle cx="100" cy="65" r="16" fill="rgba(6,16,9,0.9)" stroke="#4ADE80" strokeWidth="1.2" />
                    <circle cx="100" cy="65" r="3" fill="#4ADE80" filter="drop-shadow(0 0 6px #4ADE80)" />
                    <text x="100" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontFamily="monospace" fontWeight="600" letterSpacing="0.04em">PORTFOLIO</text>

                    {/* Peripheral Asset Nodes with Glow Points */}
                    <circle cx="100" cy="20" r="3" fill="#86EFAC" />
                    <text x="100" y="12" textAnchor="middle" fill="#86EFAC" fontSize="5.5" fontFamily="monospace">EQUITIES</text>

                    <circle cx="155" cy="52" r="3" fill="#4ADE80" />
                    <text x="162" y="55" fill="#8E9B91" fontSize="5" fontFamily="monospace">REAL ESTATE</text>

                    <circle cx="135" cy="105" r="3" fill="#4ADE80" />
                    <text x="140" y="116" fill="#8E9B91" fontSize="5" fontFamily="monospace">CASH</text>

                    <circle cx="65" cy="105" r="3" fill="#4ADE80" />
                    <text x="35" y="116" fill="#8E9B91" fontSize="5" fontFamily="monospace">FIXED INCOME</text>

                    <circle cx="45" cy="52" r="3" fill="#4ADE80" />
                    <text x="15" y="55" fill="#8E9B91" fontSize="5" fontFamily="monospace">PVT EQUITY</text>
                  </svg>
                </div>
              </div>

              {/* Card 3: Clarity That Drives Confident Decisions (3D Glass Tablet + Floating Glowing Spline) */}
              <div
                key="glass-card-3"
                className="portfolio-card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7"
                style={{ zIndex: 18 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    CLARITY THAT DRIVES <br />
                    CONFIDENT DECISIONS.
                  </h3>
                </div>

                {/* Abstract Artwork: 3D Perspective Glass Tablet with Floating Glowing Curve */}
                <div className="my-auto py-1 flex items-center justify-center w-full">
                  <svg viewBox="0 0 200 130" fill="none" className="w-full h-28 overflow-visible">
                    {/* 3D Angled Glass Base Tablet */}
                    <g transform="skewX(-6) translate(15, 0)">
                      <rect x="25" y="15" width="135" height="100" rx="10" fill="rgba(6,16,9,0.75)" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.4" />
                      
                      {/* Internal Precision Grid Lines */}
                      <line x1="35" y1="35" x2="150" y2="35" stroke="#4ADE80" strokeWidth="0.5" strokeOpacity="0.15" />
                      <line x1="35" y1="55" x2="150" y2="55" stroke="#4ADE80" strokeWidth="0.5" strokeOpacity="0.15" />
                      <line x1="35" y1="75" x2="150" y2="75" stroke="#4ADE80" strokeWidth="0.5" strokeOpacity="0.15" />

                      {/* Floating Smooth Neon Green Spline Wave */}
                      <path d="M 35 60 C 55 75, 75 35, 105 50 C 125 60, 135 25, 150 40" stroke="#4ADE80" strokeWidth="2.2" strokeLinecap="round" filter="drop-shadow(0 0 8px rgba(74,222,128,0.5))" />
                      <path d="M 35 60 C 55 75, 75 35, 105 50 C 125 60, 135 25, 150 40 L 150 85 L 35 85 Z" fill="url(#waveFillGrad)" opacity="0.4" />

                      {/* Glowing Peak Apex Node */}
                      <circle cx="105" cy="50" r="3.5" fill="#86EFAC" filter="drop-shadow(0 0 8px #4ADE80)" />
                      <circle cx="105" cy="50" r="1.5" fill="#FFFFFF" />
                      <circle cx="145" cy="35" r="2.5" fill="#4ADE80" />

                      {/* Minimal Metric Registers Below */}
                      <rect x="35" y="90" width="30" height="4" rx="2" fill="#8E9B91" opacity="0.4" />
                      <rect x="75" y="90" width="45" height="4" rx="2" fill="#4ADE80" opacity="0.6" />
                      <rect x="130" y="90" width="20" height="4" rx="2" fill="#86EFAC" opacity="0.5" />
                      <rect x="35" y="100" width="45" height="4" rx="2" fill="#8E9B91" opacity="0.3" />
                      <rect x="90" y="100" width="30" height="4" rx="2" fill="#4ADE80" opacity="0.5" />
                    </g>
                    <defs>
                      <linearGradient id="waveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Card 4: Direct Pathways. Zero Friction. (Sovereign Direct Pipeline & Vector Rails) */}
              <div
                key="glass-card-4"
                className="portfolio-card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7"
                style={{ zIndex: 14 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    DIRECT PATHWAYS. <br />
                    ZERO FRICTION.
                  </h3>
                </div>

                {/* Abstract Artwork: Direct Vector Pipeline & Luminous Data Particles */}
                <div className="my-auto py-1 flex items-center justify-center w-full">
                  <svg viewBox="0 0 200 130" fill="none" className="w-full h-28 overflow-visible">
                    {/* Converging Corridor Perspective Rails */}
                    <line x1="20" y1="25" x2="180" y2="25" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="4 4" />
                    <line x1="20" y1="105" x2="180" y2="105" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="4 4" />

                    {/* Central High-Speed Laser Rails */}
                    <line x1="20" y1="52" x2="180" y2="52" stroke="#22C55E" strokeWidth="1.4" strokeOpacity="0.7" />
                    <line x1="20" y1="78" x2="180" y2="78" stroke="#22C55E" strokeWidth="1.4" strokeOpacity="0.7" />
                    <line x1="20" y1="65" x2="180" y2="65" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />

                    {/* Translucent Gate Calibrations */}
                    <rect x="55" y="40" width="12" height="50" rx="3" fill="rgba(74,222,128,0.12)" stroke="#4ADE80" strokeWidth="0.9" />
                    <rect x="135" y="40" width="12" height="50" rx="3" fill="rgba(134,239,172,0.15)" stroke="#86EFAC" strokeWidth="1.1" />

                    {/* Moving Particle Pulses */}
                    <circle cx="61" cy="65" r="3" fill="#4ADE80" />
                    <circle cx="100" cy="65" r="4.5" fill="#86EFAC" filter="drop-shadow(0 0 8px #4ADE80)" />
                    <circle cx="100" cy="65" r="2" fill="#FFFFFF" />
                    <circle cx="141" cy="65" r="3" fill="#4ADE80" />
                  </svg>
                </div>
              </div>

              {/* Card 5: Sovereign Control. Uncompromised Security. (Concentric Cryptographic Vault Shields) */}
              <div
                key="glass-card-5"
                className="portfolio-card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7"
                style={{ zIndex: 10 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    SOVEREIGN CONTROL. <br />
                    UNCOMPROMISED SECURITY.
                  </h3>
                </div>

                {/* Abstract Artwork: Concentric Cryptographic Vault Shields & Protected Core */}
                <div className="my-auto py-1 flex items-center justify-center w-full">
                  <svg viewBox="0 0 200 130" fill="none" className="w-full h-28 overflow-visible">
                    {/* Outer Cryptographic Hexagonal Shield */}
                    <polygon points="100,15 150,38 150,92 100,115 50,92 50,38" fill="rgba(74,222,128,0.04)" stroke="#4ADE80" strokeWidth="0.85" strokeOpacity="0.3" strokeDasharray="6 4" />
                    
                    {/* Concentric Precision Rings */}
                    <circle cx="100" cy="65" r="36" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.45" />
                    <circle cx="100" cy="65" r="24" stroke="#86EFAC" strokeWidth="1.4" strokeOpacity="0.75" strokeDasharray="20 8" />
                    
                    {/* Vault Core Singularity */}
                    <circle cx="100" cy="65" r="10" fill="#061208" stroke="#4ADE80" strokeWidth="1.8" />
                    <circle cx="100" cy="65" r="3.5" fill="#4ADE80" filter="drop-shadow(0 0 8px #4ADE80)" />
                    <circle cx="100" cy="65" r="1.5" fill="#FFFFFF" />

                    {/* Cardinal Security Perimeter Nodes */}
                    <circle cx="100" cy="29" r="2" fill="#86EFAC" />
                    <circle cx="100" cy="101" r="2" fill="#86EFAC" />
                    <circle cx="64" cy="65" r="2" fill="#86EFAC" />
                    <circle cx="136" cy="65" r="2" fill="#86EFAC" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Seamless Bottom Section Blend Handoff into Horizontal Narrative */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0E1310] via-[#0E1310]/70 to-transparent z-30" />
      </div>
    </section>
  );
}
