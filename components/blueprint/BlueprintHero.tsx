"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const INSTITUTIONS = [
  "CAMS",
  "KFintech",
  "Zerodha",
  "Groww",
  "HDFC AMC",
  "ICICI Prudential",
  "SBI Mutual Fund",
  "Axis MF",
  "Nippon India",
  "UTI AMC",
  "Kotak Mutual Fund",
];

export function BlueprintHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroGlowRef = useRef<HTMLDivElement | null>(null);
  const lasersRef = useRef<HTMLDivElement | null>(null);
  const cardsWrapRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      const cardEls = gsap.utils.toArray<HTMLElement>(".portfolio-card");

      // Initial hardware-accelerated transforms
      gsap.set(cardEls, {
        transformOrigin: "center center",
        force3D: true,
        opacity: 0,
      });

      // =========================================================================
      // 0. CONTINUOUS ORGANIC AMBIENT MOTION (Existing Wave Lines in Hero Visual)
      // Prominent, smooth, seamless GSAP interpolation driving organic wave flow
      // =========================================================================
      const turbEl = document.getElementById("heroWaveTurbulence");
      const dispEl = document.getElementById("heroWaveDisplacement");
      if (turbEl) {
        const waveFlowState = { freqX: 0.004, freqY: 0.008, scale: 14 };
        gsap.to(waveFlowState, {
          freqX: 0.0075,
          freqY: 0.0135,
          scale: 22,
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onUpdate: () => {
            turbEl.setAttribute(
              "baseFrequency",
              `${waveFlowState.freqX} ${waveFlowState.freqY}`
            );
            if (dispEl) {
              dispEl.setAttribute("scale", `${waveFlowState.scale}`);
            }
          },
        });
      }

      // SINGLE COORDINATED MASTER GSAP TIMELINE TIED TO SCROLL TRIGGER
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=360%",
          pin: stageRef.current,
          scrub: 1.4,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // =========================================================================
      // 1. HERO APERTURE EXPANSION & OVERLAPPING HANDOFF (t: 0.0 -> 0.28)
      // =========================================================================
      tl.fromTo(
        heroVisualRef.current,
        { scale: 1, opacity: 1 },
        { scale: 8.5, opacity: 0, ease: "power2.inOut", duration: 0.28 },
        0
      );

      tl.fromTo(
        heroGlowRef.current,
        { opacity: 0, scale: 1 },
        {
          keyframes: [
            { opacity: 1, scale: 1.5, duration: 0.14, ease: "sine.inOut" },
            { opacity: 0, scale: 2.2, duration: 0.14, ease: "power1.out" },
          ],
        },
        0
      );

      // Ambient Laser Stream in background
      tl.fromTo(
        lasersRef.current,
        { x: 300, opacity: 0 },
        { x: -160, opacity: 1, duration: 0.6, ease: "sine.inOut" },
        0.08
      );

      // =========================================================================
      // 2. UNIFIED COORDINATED ORBITAL CHOREOGRAPHY (t: 0.08 -> 0.50)
      // Pure glass slabs emerge, orbit in 3D ellipse, decelerate and settle into deck
      // Followed by an intentional holding window (t: 0.50 -> 0.60)
      // =========================================================================
      const choreographyState = { progress: 0 };

      tl.to(
        choreographyState,
        {
          progress: 1,
          ease: "none",
          duration: 0.42,
          onUpdate: () => {
            const p = choreographyState.progress; // Normalized 0.0 to 1.0

            const wrapWidth = cardsWrapRef.current?.clientWidth || 640;
            const stepX = Math.min(74, wrapWidth * 0.135);

            // Orbit focal center & radii (shared across all cards)
            const orbitCenterX = Math.min(160, wrapWidth * 0.25);
            const orbitCenterY = 0;
            const Rx = Math.min(350, wrapWidth * 0.54);
            const Ry = 195;

            // Phase thresholds
            const orbitEnd = 0.55; // Orbital loop progression
            const dockEnd = 0.85; // Deceleration & docking

            // Coordinated constellation angular rotation: ~280° of smooth orbital sweep
            const constellationAngle = p * (1.55 * Math.PI);

            cardEls.forEach((card, i) => {
              // Exact 60° harmonic spacing around the circular orbit
              const baseAngle = i * ((2 * Math.PI) / 6);
              const theta = baseAngle + constellationAngle;

              // Shared orbital position
              const orbX = orbitCenterX + Math.cos(theta) * Rx;
              const orbY = orbitCenterY + Math.sin(theta) * Ry;

              // 3D perspective banking & scaling along orbital path
              const depthNorm = (Math.sin(theta) + 1) / 2; // 0 = back, 1 = front
              const orbScale = 0.70 + 0.42 * depthNorm;
              const orbRotZ = Math.sin(theta) * 22 + Math.cos(theta) * 8;
              const orbRotY = Math.cos(theta) * 20;
              const orbRotX = Math.sin(theta) * 12;

              // Smooth emergence from aperture core
              const emergenceFactor = Math.min(1, Math.max(0, p * 4.2));
              const currentScaleBase = orbScale * (0.35 + 0.65 * emergenceFactor);
              const currentOpacity = Math.min(1, p * 4.8);

              // Target docked coordinates
              const targetX = i * stepX;
              const targetY = 0;
              const targetScale = 1 - i * 0.045;
              const targetRot = 0;

              let finalX = orbX;
              let finalY = orbY;
              let finalScale = currentScaleBase;
              let finalRotZ = orbRotZ;
              let finalRotY = orbRotY;
              let finalRotX = orbRotX;

              // Continuous Hermite smoothstep blend into final docked layout
              if (p > orbitEnd) {
                const rawBlend = (p - orbitEnd) / (dockEnd - orbitEnd);
                const blendClamped = Math.min(1, Math.max(0, rawBlend));
                // Smoothstep (zero initial & final acceleration)
                const smoothBlend = blendClamped * blendClamped * (3 - 2 * blendClamped);

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
        0.08
      );

      // =========================================================================
      // 3. SEAMLESS VISUAL HANDOFF & STATEMENT REVEAL (t: 0.60 -> 1.0)
      // Cards recede smoothly -> Statement reveals and settles -> Generous reading pause
      // =========================================================================
      tl.to(
        cardsWrapRef.current,
        {
          scale: 0.94,
          x: 45,
          opacity: 0.25,
          filter: "blur(4px)",
          ease: "power2.inOut",
          duration: 0.18,
        },
        0.60
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
          duration: 0.20,
          ease: "power2.out",
        },
        0.64
      );

      // Bottom Institutional Marquee smoothly glides in alongside the statement
      tl.fromTo(
        marqueeRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.16,
          ease: "power2.out",
        },
        0.74
      );

      // Extended holding interval (t: 0.84 -> 1.0) ensures user comfortably reads the full statement
      tl.to({}, { duration: 0.16 }, 0.84);
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#040705] select-none"
      style={{ height: "460vh" }}
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
          {/* Left Column: Monumental Headline & Narrative Copy */}
          <div
            ref={textWrapRef}
            className="lg:col-span-5 xl:col-span-5 space-y-5 opacity-0 will-change-transform"
          >
            {/* Luminous Green Monospace Kicker */}
            <div className="space-y-1">
              <span className="font-mono text-xs sm:text-sm text-[#4ADE80] uppercase tracking-[0.25em] font-semibold block">
                ONE PLATFORM.
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#4ADE80] uppercase tracking-[0.25em] font-semibold block">
                TOTAL PICTURE.
              </span>
            </div>

            {/* Impactful Condensed Headline (Matching Hero Typography) */}
            <h2 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] text-[#FAF8F5] tracking-[-0.04em] uppercase leading-[0.92]">
              SEE THE WHOLE. <br />
              EVERY ASSET. <br />
              ONE VIEW.
            </h2>

            {/* Subtle Divider */}
            <div className="w-10 h-[1px] bg-[#4ADE80]/50 my-3" />

            {/* Narrative Editorial Copy */}
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#FAF8F5]/70 max-w-sm leading-relaxed font-normal">
              Unifolio connects every fragment of your financial life — across assets, accounts, and institutions — into one intelligent view. No more gaps. No more guesswork. Just clarity.
            </p>
          </div>

          {/* Right Column: 6 Pure Glassy Cards (No Internal Content) */}
          <div
            ref={cardsWrapRef}
            className="lg:col-span-7 xl:col-span-7 relative h-[340px] sm:h-[380px] md:h-[420px] flex items-center justify-start lg:justify-center overflow-visible will-change-transform"
          >
            <div className="relative w-full h-full flex items-center">
              {Array.from({ length: 6 }).map((_, idx) => {
                const zIndex = 30 - idx * 4;

                return (
                  <div
                    key={`glass-card-${idx}`}
                    className={`portfolio-card absolute top-1/2 left-0 -translate-y-1/2 w-[230px] sm:w-[260px] md:w-[285px] h-[310px] sm:h-[350px] md:h-[385px] rounded-3xl select-none origin-center overflow-hidden transition-shadow ${
                      idx === 0
                        ? "bg-gradient-to-tr from-white/[0.09] via-[#4ADE80]/[0.06] to-white/[0.03] border border-[#4ADE80]/50 shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(74,222,128,0.35),0_0_30px_rgba(74,222,128,0.15)] backdrop-blur-2xl"
                        : "bg-gradient-to-tr from-white/[0.07] via-white/[0.02] to-transparent border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl"
                    }`}
                    style={{
                      zIndex,
                    }}
                  >
                    {/* Top Specular Glass Reflection Sheen */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-transparent opacity-90" />
                    
                    {/* Subtle Glass Diagonal Light Flare */}
                    <div className="pointer-events-none absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-45" />

                    {/* Bottom Edge Reflection */}
                    <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Infinite Institution Marquee */}
        <div
          ref={marqueeRef}
          className="relative z-20 w-full overflow-hidden border-t border-white/15 pt-4 pb-2 opacity-0"
        >
          <div className="flex w-max items-center gap-12 sm:gap-16 animate-marquee whitespace-nowrap font-mono text-xs text-[#8E9B91] tracking-[0.2em] uppercase font-semibold">
            {[...INSTITUTIONS, ...INSTITUTIONS].map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-center gap-8 sm:gap-10">
                <span className="hover:text-white transition-colors cursor-default">
                  {name}
                </span>
                <span className="h-2 w-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
              </div>
            ))}
          </div>
        </div>

        {/* Seamless Bottom Section Blend Handoff */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0E1310]/80 to-transparent z-10" />
      </div>
    </section>
  );
}
