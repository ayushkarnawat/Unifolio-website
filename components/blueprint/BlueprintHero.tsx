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

      // Hardware acceleration initialization
      gsap.set(cardEls, {
        transformOrigin: "center center",
        force3D: true,
        opacity: 0,
      });

      // =========================================================================
      // 0. CONTINUOUS ORGANIC AMBIENT MOTION (Existing Wave Lines in Hero Visual)
      // Slow, smooth, seamless GSAP interpolation driving organic wave flow
      // =========================================================================
      const turbEl = document.getElementById("heroWaveTurbulence");
      if (turbEl) {
        const waveFlowState = { freqX: 0.0035, freqY: 0.0055 };
        gsap.to(waveFlowState, {
          freqX: 0.0050,
          freqY: 0.0078,
          duration: 22,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onUpdate: () => {
            turbEl.setAttribute(
              "baseFrequency",
              `${waveFlowState.freqX} ${waveFlowState.freqY}`
            );
          },
        });
      }

      // SINGLE COORDINATED MASTER GSAP TIMELINE TIED TO SCROLL TRIGGER
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=440%",
          pin: stageRef.current,
          scrub: 1.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // =========================================================================
      // 1. HERO APERTURE EXPANSION (t: 0.0 -> 0.22)
      // =========================================================================
      tl.fromTo(
        heroVisualRef.current,
        { scale: 1, opacity: 1 },
        { scale: 8.5, opacity: 0, ease: "power2.inOut", duration: 0.22 },
        0
      );

      tl.fromTo(
        heroGlowRef.current,
        { opacity: 0, scale: 1 },
        {
          keyframes: [
            { opacity: 1, scale: 1.5, duration: 0.11, ease: "sine.inOut" },
            { opacity: 0, scale: 2.2, duration: 0.11, ease: "power1.out" },
          ],
        },
        0
      );

      // Ambient Laser Stream in background
      tl.fromTo(
        lasersRef.current,
        { x: 300, opacity: 0 },
        { x: -160, opacity: 1, duration: 0.55, ease: "sine.inOut" },
        0.06
      );

      // =========================================================================
      // 2. BUTTERY-SMOOTH NATIVE GSAP ORBITAL-TO-STACK CHOREOGRAPHY (t: 0.06 -> 0.62)
      // Native GSAP timeline tweens for hardware-accelerated GPU matrix interpolation
      // Zero CSS conflicts, zero snapping, continuous natural momentum
      // =========================================================================
      const wrapWidth = cardsWrapRef.current?.clientWidth || 640;
      const stepX = Math.min(44, wrapWidth * 0.082);

      const orbitCenterX = Math.min(120, wrapWidth * 0.20);
      const orbitCenterY = 0;
      const Rx = Math.min(320, wrapWidth * 0.50);
      const Ry = 175;

      cardEls.forEach((card, i) => {
        // Harmonic 60-degree orbital constellation distribution
        const theta = i * ((2 * Math.PI) / 6) - Math.PI / 3.5;

        const orbX = orbitCenterX + Math.cos(theta) * Rx;
        const orbY = orbitCenterY + Math.sin(theta) * Ry;

        const depthNorm = (Math.sin(theta) + 1) / 2;
        const orbScale = 0.68 + 0.36 * depthNorm;
        const orbRotZ = Math.sin(theta) * 16 + Math.cos(theta) * 5;
        const orbRotY = Math.cos(theta) * 16;
        const orbRotX = Math.sin(theta) * 8;

        const stackX = i * stepX;
        const stackY = 0;
        const stackScale = 1.0 - i * 0.04;

        // Hardware accelerated initial state at aperture core
        gsap.set(card, {
          x: orbitCenterX,
          y: orbitCenterY,
          scale: 0.25,
          rotationZ: orbRotZ * 1.5,
          rotationY: orbRotY * 1.5,
          rotationX: orbRotX,
          opacity: 0,
          force3D: true,
          transformPerspective: 1000,
        });

        // Phase 1: Smooth continuous emergence into 3D orbital constellation
        tl.to(
          card,
          {
            x: orbX,
            y: orbY,
            scale: orbScale,
            rotationZ: orbRotZ,
            rotationY: orbRotY,
            rotationX: orbRotX,
            opacity: 1,
            duration: 0.28,
            ease: "power2.out",
          },
          0.06 + i * 0.016
        );

        // Phase 2: Smooth continuous glide into cascading stacked deck
        tl.to(
          card,
          {
            x: stackX,
            y: stackY,
            scale: stackScale,
            rotationZ: 0,
            rotationY: 0,
            rotationX: 0,
            opacity: 1,
            duration: 0.28,
            ease: "power3.inOut",
          },
          0.34 + i * 0.014
        );
      });

      // Dedicated Holding Window (t: 0.62 -> 0.80): Cards rest steadily for comfortable reading
      tl.to({}, { duration: 0.18 }, 0.62);

      // =========================================================================
      // 3. SEAMLESS VISUAL HANDOFF & STATEMENT REVEAL (t: 0.80 -> 1.0)
      // Stacked cards recede gently -> Statement reveals and settles -> Soft handoff
      // =========================================================================
      tl.to(
        cardsWrapRef.current,
        {
          scale: 0.94,
          x: 45,
          opacity: 0.25,
          filter: "blur(4px)",
          ease: "power2.inOut",
          duration: 0.16,
        },
        0.80
      );

      // Large Statement smoothly expands and commands the stage
      tl.fromTo(
        textWrapRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.96,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1.0,
          filter: "blur(0px)",
          duration: 0.18,
          ease: "power2.out",
        },
        0.80
      );

      // Extended holding interval (t: 0.80 -> 0.92) ensures user comfortably reads the full statement
      // Gentle resolution & drift (t: 0.92 -> 1.00) softly prepares handoff into next section
      tl.to(
        textWrapRef.current,
        {
          opacity: 0.35,
          y: -25,
          filter: "blur(4px)",
          ease: "power2.inOut",
          duration: 0.08,
        },
        0.92
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] select-none"
      style={{ height: "540vh" }}
    >
      {/* Anchor for Section 2 Nav Link */}
      <div id="statement" className="absolute top-[35%] pointer-events-none" />

      {/* Single Pinned Master Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF8F5] flex flex-col justify-between p-6 sm:p-10 lg:p-16"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_61%_48%,rgba(30,107,62,0.08)_0%,rgba(250,248,245,0.5)_50%,#FAF8F5_100%)] z-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_60%,rgba(30,107,62,0.05)_0%,transparent_60%)] z-0" />

        {/* Master Hero Visual Layer (Zooms and dissolves into the aperture void) */}
        <div
          ref={heroVisualRef}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none"
          style={{ transformOrigin: "60.5% 47.8%" }}
        >
          <div
            className="relative w-full h-full pointer-events-none"
            style={{ filter: "url(#heroWaveFlowFilter) invert(0.96) hue-rotate(160deg) contrast(1.1)" }}
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
                  baseFrequency="0.0035 0.0055"
                  numOctaves="2"
                  result="noise"
                  seed="4"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="4.5"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          {/* Dynamic Luminous Green Flare Bloom Centered Over the Aperture */}
          <div
            ref={heroGlowRef}
            className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#1E6B3E]/0 via-[#1E6B3E]/20 to-[#86EFAC]/30 blur-3xl opacity-0"
            style={{ left: "calc(60.5% - 210px)", top: "calc(47.8% - 210px)" }}
          />
        </div>

        {/* Ambient Laser Stream (Revealed during orbital card phase) */}
        <div
          ref={lasersRef}
          className="pointer-events-none absolute inset-0 overflow-hidden flex flex-col justify-center gap-12 opacity-0 z-0"
        >
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1E6B3E]/25 to-transparent translate-x-12" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1E6B3E]/30 to-transparent -translate-x-24" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#16A34A]/25 to-transparent translate-x-36" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1E6B3E]/25 to-transparent -translate-x-16" />
        </div>

        {/* Top Spacer */}
        <div className="relative z-10 h-10 sm:h-12" />

        {/* Main Stage Arena: Left Text + Right Layered Stepped Glass Cards */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto w-full max-w-7xl mx-auto">
          {/* Left Column: Monumental Headline & Narrative Copy */}
          <div
            ref={textWrapRef}
            className="lg:col-span-5 xl:col-span-5 space-y-5 opacity-0 will-change-transform"
          >
            {/* Luminous Green Monospace Kicker */}
            <div className="space-y-1">
              <span className="font-mono text-xs sm:text-sm text-[#1E6B3E] uppercase tracking-[0.25em] font-semibold block">
                ONE PLATFORM.
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#1E6B3E] uppercase tracking-[0.25em] font-semibold block">
                TOTAL PICTURE.
              </span>
            </div>

            {/* Impactful Condensed Headline (Matching Hero Typography) */}
            <h2 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] text-[#121915] tracking-[-0.04em] uppercase leading-[0.92]">
              SEE THE WHOLE. <br />
              EVERY ASSET. <br />
              ONE VIEW.
            </h2>

            {/* Subtle Divider */}
            <div className="w-10 h-[1px] bg-[#1E6B3E]/40 my-3" />

            {/* Narrative Editorial Copy */}
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#525E56] max-w-sm leading-relaxed font-normal">
              Unifolio connects every fragment of your financial life — across assets, accounts, and institutions — into one intelligent view. No more gaps. No more guesswork. Just clarity.
            </p>
          </div>

          {/* Right Column: 6 Layered Stepped Glass Financial Artifacts */}
          <div
            ref={cardsWrapRef}
            className="lg:col-span-7 xl:col-span-7 relative h-[340px] sm:h-[380px] md:h-[420px] flex items-center justify-start lg:justify-center overflow-visible will-change-transform"
          >
            <div className="relative w-full h-full flex items-center">
              {/* Card 0: Scattered Data Funnel / Stacked Spatial Strata */}
              <div
                key="glass-card-0"
                className="portfolio-card absolute top-2 sm:top-3 md:top-4 left-0 w-[235px] sm:w-[265px] md:w-[290px] h-[315px] sm:h-[355px] md:h-[390px] rounded-3xl select-none origin-center overflow-hidden bg-gradient-to-tr from-[#FFFFFF]/95 via-[#F7F5F0]/90 to-[#EAE6DD]/90 border border-[#1E6B3E]/40 shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.95),0_0_30px_rgba(30,107,62,0.08)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ zIndex: 30 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.8] via-transparent to-transparent opacity-90" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#1E6B3E]/30 to-transparent" />

                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <div className="font-mono text-[9px] text-[#1E6B3E] tracking-[0.2em] font-semibold">01</div>
                  <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#121915] uppercase tracking-[-0.01em] leading-tight">
                    SCATTERED DATA.<br />ONE UNIFIED VIEW.
                  </h3>
                  <div className="w-6 h-[1px] bg-[#1E6B3E]/40 mt-1" />
                </div>

                {/* Center SVG Artwork: Ingestion Funnel & Strata */}
                <div className="flex items-center justify-center my-auto py-1 relative z-10">
                  <svg viewBox="0 0 200 150" className="w-full h-28 sm:h-32 overflow-visible">
                    <defs>
                      <linearGradient id="funnelBeam0" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.05" />
                        <stop offset="70%" stopColor="#1E6B3E" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="planeGrad0" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#1E6B3E" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    
                    {/* Base Foundation Plate */}
                    <polygon points="35,125 165,125 135,142 5,142" fill="url(#planeGrad0)" stroke="#1E6B3E" strokeWidth="0.6" strokeOpacity="0.4" />
                    <circle cx="85" cy="133" r="14" stroke="#1E6B3E" strokeWidth="0.5" strokeDasharray="2 3" strokeOpacity="0.4" fill="none" />
                    <circle cx="85" cy="133" r="5" stroke="#1E6B3E" strokeWidth="0.8" strokeOpacity="0.7" fill="none" />
                    <circle cx="85" cy="133" r="2.5" fill="#1E6B3E" filter="drop-shadow(0 0 4px rgba(30,107,62,0.4))" />

                    {/* Funnel Light Fiber Stream */}
                    <path d="M 45 35 Q 75 105 85 133 M 80 35 Q 82 100 85 133 M 120 35 Q 95 105 85 133 M 155 35 Q 110 110 85 133" stroke="url(#funnelBeam0)" strokeWidth="0.8" fill="none" />
                    <path d="M 30 60 Q 65 110 85 133 M 65 60 Q 78 108 85 133 M 135 60 Q 100 110 85 133 M 170 60 Q 115 115 85 133" stroke="url(#funnelBeam0)" strokeWidth="0.6" fill="none" />

                    {/* Strata Layers */}
                    <polygon points="50,12 150,12 130,30 30,30" fill="url(#planeGrad0)" stroke="#1E6B3E" strokeWidth="0.7" strokeOpacity="0.5" />
                    <circle cx="65" cy="18" r="1.5" fill="#1E6B3E" />
                    <circle cx="115" cy="22" r="1.5" fill="#1E6B3E" />
                    <circle cx="90" cy="26" r="1.5" fill="#1E6B3E" />

                    <polygon points="40,36 160,36 135,58 15,58" fill="url(#planeGrad0)" stroke="#1E6B3E" strokeWidth="0.7" strokeOpacity="0.6" />
                    <circle cx="50" cy="46" r="1.5" fill="#1E6B3E" />
                    <circle cx="100" cy="42" r="1.5" fill="#1E6B3E" />
                    <circle cx="125" cy="52" r="1.5" fill="#1E6B3E" />

                    <polygon points="45,64 155,64 130,86 20,86" fill="url(#planeGrad0)" stroke="#1E6B3E" strokeWidth="0.7" strokeOpacity="0.7" />
                    <circle cx="60" cy="74" r="1.5" fill="#1E6B3E" />
                    <circle cx="110" cy="77" r="1.5" fill="#1E6B3E" />
                    <circle cx="85" cy="82" r="1.5" fill="#1E6B3E" />

                    <circle cx="85" cy="133" r="3.5" fill="#1E6B3E" />
                  </svg>
                </div>

                {/* Narrative Footer */}
                <p className="font-sans text-[9px] sm:text-[10px] text-[#525E56] leading-relaxed relative z-10">
                  We consolidate your entire financial world—across accounts, asset classes, and platforms—into one clarity-first view.
                </p>
              </div>

              {/* Card 1: Stepped Translucent Data Planes / Structured Intelligence */}
              <div
                key="glass-card-1"
                className="portfolio-card absolute top-2 sm:top-3 md:top-4 left-0 w-[235px] sm:w-[265px] md:w-[290px] h-[315px] sm:h-[355px] md:h-[390px] rounded-3xl select-none origin-center overflow-hidden bg-gradient-to-tr from-[#FFFFFF]/95 via-[#F7F5F0]/90 to-[#EAE6DD]/90 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ zIndex: 26 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.8] via-transparent to-transparent opacity-90" />
                
                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <div className="font-mono text-[9px] text-[#1E6B3E] tracking-[0.2em] font-semibold">02</div>
                  <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#121915] uppercase tracking-[-0.01em] leading-tight">
                    COMPLEXITY, STRUCTURED<br />WITH INTELLIGENCE.
                  </h3>
                  <div className="w-6 h-[1px] bg-[#1E6B3E]/40 mt-1" />
                </div>

                {/* Center SVG Artwork: Receding Translucent Slabs & Lasers */}
                <div className="flex items-center justify-center my-auto py-1 relative z-10">
                  <svg viewBox="0 0 200 150" className="w-full h-28 sm:h-32 overflow-visible">
                    <defs>
                      <linearGradient id="planeGrad1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#1E6B3E" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Fluid wave particle stream on left */}
                    <path d="M 5 35 Q 25 65 10 98 T 25 135" stroke="#1E6B3E" strokeWidth="0.75" strokeDasharray="1 3" strokeOpacity="0.5" fill="none" />
                    <path d="M 12 25 Q 32 55 18 90 T 32 125" stroke="#1E6B3E" strokeWidth="0.5" strokeDasharray="2 3" strokeOpacity="0.4" fill="none" />

                    {/* Slabs in 3D Perspective (Back to Front) */}
                    <polygon points="95,12 165,26 145,108 75,94" fill="url(#planeGrad1)" stroke="#1E6B3E" strokeWidth="0.5" strokeOpacity="0.3" />
                    <text x="120" y="27" fill="#525E56" fontSize="5.5" fontFamily="monospace" textAnchor="middle">RELATIONSHIPS</text>

                    <polygon points="80,22 150,36 130,118 60,104" fill="url(#planeGrad1)" stroke="#1E6B3E" strokeWidth="0.6" strokeOpacity="0.4" />
                    <text x="105" y="37" fill="#525E56" fontSize="5.5" fontFamily="monospace" textAnchor="middle">TRANSACTIONS</text>

                    <polygon points="65,32 135,46 115,128 45,114" fill="url(#planeGrad1)" stroke="#1E6B3E" strokeWidth="0.7" strokeOpacity="0.5" />
                    <text x="90" y="47" fill="#1E6B3E" fontSize="5.5" fontFamily="monospace" textAnchor="middle">HOLDINGS</text>

                    <polygon points="50,42 120,56 100,138 30,124" fill="url(#planeGrad1)" stroke="#1E6B3E" strokeWidth="0.9" strokeOpacity="0.8" />
                    <text x="75" y="57" fill="#121915" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ASSETS</text>
                    
                    {/* Horizontal Laser Data Streams */}
                    <line x1="20" y1="70" x2="185" y2="70" stroke="#1E6B3E" strokeWidth="0.8" strokeOpacity="0.6" />
                    <circle cx="185" cy="70" r="2" fill="#1E6B3E" />

                    <line x1="35" y1="90" x2="175" y2="90" stroke="#1E6B3E" strokeWidth="0.6" strokeOpacity="0.5" />
                    <circle cx="175" cy="90" r="1.8" fill="#1E6B3E" />

                    <line x1="25" y1="110" x2="190" y2="110" stroke="#1E6B3E" strokeWidth="0.7" strokeOpacity="0.6" />
                    <circle cx="190" cy="110" r="2" fill="#1E6B3E" />
                  </svg>
                </div>

                {/* Narrative Footer */}
                <p className="font-sans text-[9px] sm:text-[10px] text-[#525E56] leading-relaxed relative z-10">
                  Our system intelligently organizes what matters—so you can understand the full picture, not just pieces of it.
                </p>
              </div>

              {/* Card 2: See Relationships / Connected Nexus */}
              <div
                key="glass-card-2"
                className="portfolio-card absolute top-2 sm:top-3 md:top-4 left-0 w-[235px] sm:w-[265px] md:w-[290px] h-[315px] sm:h-[355px] md:h-[390px] rounded-3xl select-none origin-center overflow-hidden bg-gradient-to-tr from-[#FFFFFF]/95 via-[#F7F5F0]/90 to-[#EAE6DD]/90 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ zIndex: 22 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.8] via-transparent to-transparent opacity-90" />
                
                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <div className="font-mono text-[9px] text-[#1E6B3E] tracking-[0.2em] font-semibold">03</div>
                  <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#121915] uppercase tracking-[-0.01em] leading-tight">
                    SEE RELATIONSHIPS.<br />SEE WHAT MATTERS.
                  </h3>
                  <div className="w-6 h-[1px] bg-[#1E6B3E]/40 mt-1" />
                </div>

                {/* Center SVG Artwork: Constellation Graph */}
                <div className="flex items-center justify-center my-auto py-1 relative z-10">
                  <svg viewBox="0 0 200 150" className="w-full h-28 sm:h-32 overflow-visible">
                    <circle cx="100" cy="75" r="54" stroke="#1E6B3E" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
                    <circle cx="100" cy="75" r="35" stroke="#1E6B3E" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 3" fill="none" />
                    <ellipse cx="100" cy="75" rx="68" ry="38" stroke="#1E6B3E" strokeWidth="0.5" strokeOpacity="0.2" fill="none" transform="rotate(-15 100 75)" />

                    {/* Constellation Web */}
                    <polygon
                      points="100,25 152,58 132,122 68,122 48,58"
                      fill="#1E6B3E"
                      fillOpacity="0.06"
                      stroke="#1E6B3E"
                      strokeWidth="0.8"
                      strokeOpacity="0.5"
                    />
                    <line x1="100" y1="75" x2="100" y2="25" stroke="#1E6B3E" strokeWidth="0.75" strokeOpacity="0.6" />
                    <line x1="100" y1="75" x2="152" y2="58" stroke="#1E6B3E" strokeWidth="0.75" strokeOpacity="0.6" />
                    <line x1="100" y1="75" x2="132" y2="122" stroke="#1E6B3E" strokeWidth="0.75" strokeOpacity="0.6" />
                    <line x1="100" y1="75" x2="68" y2="122" stroke="#1E6B3E" strokeWidth="0.75" strokeOpacity="0.6" />
                    <line x1="100" y1="75" x2="48" y2="58" stroke="#1E6B3E" strokeWidth="0.75" strokeOpacity="0.6" />

                    {/* Central Portfolio Node */}
                    <circle cx="100" cy="75" r="15" fill="#EAE6DD" stroke="#1E6B3E" strokeWidth="1" />
                    <circle cx="100" cy="75" r="2.5" fill="#1E6B3E" />
                    <text x="100" y="78" fill="#121915" fontSize="4.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PORTFOLIO</text>

                    {/* Peripheral Asset Nodes */}
                    <circle cx="100" cy="25" r="2.5" fill="#1E6B3E" />
                    <text x="100" y="19" fill="#1E6B3E" fontSize="5.5" fontFamily="monospace" textAnchor="middle">EQUITIES</text>

                    <circle cx="152" cy="58" r="2.5" fill="#1E6B3E" />
                    <text x="174" y="61" fill="#1E6B3E" fontSize="5.5" fontFamily="monospace" textAnchor="middle">REAL ESTATE</text>

                    <circle cx="132" cy="122" r="2.5" fill="#1E6B3E" />
                    <text x="132" y="131" fill="#1E6B3E" fontSize="5.5" fontFamily="monospace" textAnchor="middle">CASH</text>

                    <circle cx="68" cy="122" r="2.5" fill="#1E6B3E" />
                    <text x="68" y="131" fill="#1E6B3E" fontSize="5.5" fontFamily="monospace" textAnchor="middle">FIXED INCOME</text>

                    <circle cx="48" cy="58" r="2.5" fill="#1E6B3E" />
                    <text x="24" y="61" fill="#1E6B3E" fontSize="5.5" fontFamily="monospace" textAnchor="middle">PRIVATE EQ</text>
                  </svg>
                </div>

                {/* Narrative Footer */}
                <p className="font-sans text-[9px] sm:text-[10px] text-[#525E56] leading-relaxed relative z-10">
                  Unifolio reveals the connections behind your wealth—helping you spot overlap, exposure, and opportunities.
                </p>
              </div>

              {/* Card 3: Clarity That Drives Confident Decisions / Topographic Surface */}
              <div
                key="glass-card-3"
                className="portfolio-card absolute top-2 sm:top-3 md:top-4 left-0 w-[235px] sm:w-[265px] md:w-[290px] h-[315px] sm:h-[355px] md:h-[390px] rounded-3xl select-none origin-center overflow-hidden bg-gradient-to-tr from-[#FFFFFF]/95 via-[#F7F5F0]/90 to-[#EAE6DD]/90 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ zIndex: 18 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.8] via-transparent to-transparent opacity-90" />
                
                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <div className="font-mono text-[9px] text-[#1E6B3E] tracking-[0.2em] font-semibold">04</div>
                  <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#121915] uppercase tracking-[-0.01em] leading-tight">
                    CLARITY THAT DRIVES<br />CONFIDENT DECISIONS.
                  </h3>
                  <div className="w-6 h-[1px] bg-[#1E6B3E]/40 mt-1" />
                </div>

                {/* Center SVG Artwork: Topological Wave Surface */}
                <div className="flex items-center justify-center my-auto py-1 relative z-10">
                  <svg viewBox="0 0 200 150" className="w-full h-28 sm:h-32 overflow-visible">
                    <defs>
                      <linearGradient id="waveFill3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#1E6B3E" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Isometric Screen Plate */}
                    <polygon points="30,18 170,18 150,135 10,135" fill="#F0EDE6" stroke="#1E6B3E" strokeWidth="0.6" strokeOpacity="0.3" />
                    
                    {/* Grid Horizon Lines */}
                    <line x1="25" y1="46" x2="165" y2="46" stroke="#1E6B3E" strokeWidth="0.4" strokeOpacity="0.2" />
                    <line x1="20" y1="74" x2="160" y2="74" stroke="#1E6B3E" strokeWidth="0.4" strokeOpacity="0.2" />
                    <line x1="15" y1="102" x2="155" y2="102" stroke="#1E6B3E" strokeWidth="0.4" strokeOpacity="0.2" />

                    {/* Glowing Spline Wave Area */}
                    <path d="M 20 84 Q 55 98 85 65 T 135 40 T 160 55 L 150 105 L 20 105 Z" fill="url(#waveFill3)" />
                    <path d="M 20 84 Q 55 98 85 65 T 135 40 T 160 55" stroke="#1E6B3E" strokeWidth="1.6" fill="none" />

                    {/* Apex Luminous Pulse Node */}
                    <circle cx="135" cy="40" r="3.5" fill="#1E6B3E" />
                    <circle cx="135" cy="40" r="1.5" fill="#FFFFFF" />

                    {/* Translucent Data Row Bars beneath */}
                    <rect x="25" y="112" width="28" height="4" rx="1.5" fill="#1E6B3E" fillOpacity="0.4" />
                    <rect x="60" y="112" width="45" height="4" rx="1.5" fill="black" fillOpacity="0.08" />
                    <rect x="112" y="112" width="30" height="4" rx="1.5" fill="black" fillOpacity="0.08" />

                    <rect x="22" y="122" width="35" height="4" rx="1.5" fill="#1E6B3E" fillOpacity="0.4" />
                    <rect x="64" y="122" width="50" height="4" rx="1.5" fill="black" fillOpacity="0.08" />
                    <rect x="120" y="122" width="22" height="4" rx="1.5" fill="black" fillOpacity="0.08" />
                  </svg>
                </div>

                {/* Narrative Footer */}
                <p className="font-sans text-[9px] sm:text-[10px] text-[#525E56] leading-relaxed relative z-10">
                  With clarity comes confidence. Make smarter decisions with a complete, real-time understanding of your finances.
                </p>
              </div>

              {/* Card 4: Cross-Layer Audit / Optical Matrix */}
              <div
                key="glass-card-4"
                className="portfolio-card absolute top-2 sm:top-3 md:top-4 left-0 w-[235px] sm:w-[265px] md:w-[290px] h-[315px] sm:h-[355px] md:h-[390px] rounded-3xl select-none origin-center overflow-hidden bg-gradient-to-tr from-[#FFFFFF]/95 via-[#F7F5F0]/90 to-[#EAE6DD]/90 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ zIndex: 14 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.8] via-transparent to-transparent opacity-90" />
                
                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <div className="font-mono text-[9px] text-[#1E6B3E] tracking-[0.2em] font-semibold">05</div>
                  <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#121915] uppercase tracking-[-0.01em] leading-tight">
                    CROSS-LAYER AUDIT.<br />ZERO BLIND SPOTS.
                  </h3>
                  <div className="w-6 h-[1px] bg-[#1E6B3E]/40 mt-1" />
                </div>

                {/* Center SVG Artwork: Concentric Reticle & Scanning Beams */}
                <div className="flex items-center justify-center my-auto py-1 relative z-10">
                  <svg viewBox="0 0 200 150" className="w-full h-28 sm:h-32 overflow-visible">
                    <circle cx="100" cy="75" r="50" stroke="#1E6B3E" strokeWidth="0.6" strokeOpacity="0.25" fill="none" />
                    <circle cx="100" cy="75" r="34" stroke="#1E6B3E" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 4" fill="none" />
                    <circle cx="100" cy="75" r="16" stroke="#1E6B3E" strokeWidth="1" strokeOpacity="0.6" fill="none" />
                    <circle cx="100" cy="75" r="2.5" fill="#1E6B3E" />

                    <line x1="100" y1="18" x2="100" y2="132" stroke="#1E6B3E" strokeWidth="0.5" strokeOpacity="0.3" />
                    <line x1="42" y1="75" x2="158" y2="75" stroke="#1E6B3E" strokeWidth="0.5" strokeOpacity="0.3" />

                    <polygon points="100,32 138,54 138,96 100,118 62,96 62,54" stroke="#1E6B3E" strokeWidth="0.6" strokeOpacity="0.3" fill="none" />

                    <path d="M 100 25 A 50 50 0 0 1 150 75" stroke="#1E6B3E" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
                    <circle cx="150" cy="75" r="2.5" fill="#121915" />

                    <text x="100" y="14" fill="#525E56" fontSize="5.5" fontFamily="monospace" textAnchor="middle">0° SCAN</text>
                    <text x="175" y="77" fill="#525E56" fontSize="5.5" fontFamily="monospace" textAnchor="middle">90° TER</text>
                    <text x="100" y="142" fill="#525E56" fontSize="5.5" fontFamily="monospace" textAnchor="middle">180° DRAG</text>
                    <text x="25" y="77" fill="#525E56" fontSize="5.5" fontFamily="monospace" textAnchor="middle">270° TAX</text>
                  </svg>
                </div>

                {/* Narrative Footer */}
                <p className="font-sans text-[9px] sm:text-[10px] text-[#525E56] leading-relaxed relative z-10">
                  Autonomous diagnostics scan every portfolio layer—uncovering drag, fees, and uncompensated risk automatically.
                </p>
              </div>

              {/* Card 5: Institutional Integrity / Cryptographic Sync */}
              <div
                key="glass-card-5"
                className="portfolio-card absolute top-2 sm:top-3 md:top-4 left-0 w-[235px] sm:w-[265px] md:w-[290px] h-[315px] sm:h-[355px] md:h-[390px] rounded-3xl select-none origin-center overflow-hidden bg-gradient-to-tr from-[#FFFFFF]/95 via-[#F7F5F0]/90 to-[#EAE6DD]/90 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ zIndex: 10 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.8] via-transparent to-transparent opacity-90" />
                
                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <div className="font-mono text-[9px] text-[#1E6B3E] tracking-[0.2em] font-semibold">06</div>
                  <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#121915] uppercase tracking-[-0.01em] leading-tight">
                    INSTITUTIONAL SYNC.<br />END-TO-END CERTAINTY.
                  </h3>
                  <div className="w-6 h-[1px] bg-[#1E6B3E]/40 mt-1" />
                </div>

                {/* Center SVG Artwork: Custodial Security Lattice */}
                <div className="flex items-center justify-center my-auto py-1 relative z-10">
                  <svg viewBox="0 0 200 150" className="w-full h-28 sm:h-32 overflow-visible">
                    <polygon points="100,16 160,50 160,100 100,134 40,100 40,50" stroke="#1E6B3E" strokeWidth="0.8" strokeOpacity="0.35" fill="#EDEAE2" fillOpacity="0.7" />
                    <polygon points="100,30 146,56 146,94 100,120 54,94 54,56" stroke="#1E6B3E" strokeWidth="0.5" strokeDasharray="2 3" strokeOpacity="0.4" fill="none" />

                    <rect x="64" y="42" width="30" height="22" rx="4" fill="#FFFFFF" stroke="#1E6B3E" strokeWidth="0.7" />
                    <text x="79" y="53" fill="#121915" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CAMS</text>
                    <text x="79" y="60" fill="#1E6B3E" fontSize="4" fontFamily="monospace" textAnchor="middle">SYNCED</text>

                    <rect x="106" y="42" width="30" height="22" rx="4" fill="#FFFFFF" stroke="#1E6B3E" strokeWidth="0.7" />
                    <text x="121" y="53" fill="#121915" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">KFIN</text>
                    <text x="121" y="60" fill="#1E6B3E" fontSize="4" fontFamily="monospace" textAnchor="middle">SYNCED</text>

                    <rect x="64" y="82" width="30" height="22" rx="4" fill="#FFFFFF" stroke="#1E6B3E" strokeWidth="0.7" />
                    <text x="79" y="93" fill="#121915" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CDSL</text>
                    <text x="79" y="100" fill="#1E6B3E" fontSize="4" fontFamily="monospace" textAnchor="middle">VERIFIED</text>

                    <rect x="106" y="82" width="30" height="22" rx="4" fill="#FFFFFF" stroke="#1E6B3E" strokeWidth="0.7" />
                    <text x="121" y="93" fill="#121915" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">NSDL</text>
                    <text x="121" y="100" fill="#1E6B3E" fontSize="4" fontFamily="monospace" textAnchor="middle">VERIFIED</text>

                    <circle cx="100" cy="73" r="3.5" fill="#1E6B3E" />
                    <circle cx="100" cy="73" r="1.5" fill="#FFFFFF" />
                  </svg>
                </div>

                {/* Narrative Footer */}
                <p className="font-sans text-[9px] sm:text-[10px] text-[#525E56] leading-relaxed relative z-10">
                  Direct depository synchronization with zero-knowledge encryption ensures your data remains sovereign and secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seamless Bottom Section Blend Handoff */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5F3EE]/80 to-transparent z-10" />
      </div>
    </section>
  );
}
