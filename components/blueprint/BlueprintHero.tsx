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
      // 0. CONTINUOUS LUXURIOUS AMBIENT WAVE MOTION
      //    (Calm, organic, slow fluid displacement & radiating signal pulses)
      // =========================================================================
      const turbEl = document.getElementById("heroWaveTurbulence");
      const dispEl = document.getElementById("heroWaveDisplacement");
      
      let waveTween: gsap.core.Tween | null = null;
      if (turbEl && dispEl) {
        // Multi-frequency organic oscillation: slow, fluid, non-mechanical
        const waveState = { phase: 0 };
        let frameSkip = 0;
        
        waveTween = gsap.to(waveState, {
          phase: Math.PI * 2,
          duration: 30, // Long, luxurious 30-second harmonic cycle
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            frameSkip = (frameSkip + 1) % 2;
            if (frameSkip !== 0) return;
            
            // Dual incommensurate harmonics (golden ratio) for non-repeating natural fluid drift
            const p1 = waveState.phase;
            const p2 = p1 * 1.618033;
            
            const fx = 0.0032 + 0.0018 * Math.sin(p1);
            const fy = 0.0068 + 0.0028 * Math.cos(p2);
            const scale = 16 + 8 * (0.6 * Math.sin(p2) + 0.4 * Math.cos(p1));
            
            turbEl.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
            dispEl.setAttribute("scale", `${scale.toFixed(1)}`);
          },
        });
      }

      // Staggered, gentle concentric energy pulses radiating through the wave strata
      const pulse1 = gsap.fromTo(
        ".hero-wave-pulse-1",
        { scale: 0.85, opacity: 0 },
        {
          scale: 1.85,
          opacity: 0.35,
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );

      const pulse2 = gsap.fromTo(
        ".hero-wave-pulse-2",
        { scale: 0.9, opacity: 0 },
        {
          scale: 2.15,
          opacity: 0.25,
          duration: 14,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 4,
        }
      );

      // Pause continuous ambient animations when hero is scrolled out of viewport
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          waveTween?.play();
          pulse1.play();
          pulse2.play();
        },
        onEnterBack: () => {
          waveTween?.play();
          pulse1.play();
          pulse2.play();
        },
        onLeave: () => {
          waveTween?.pause();
          pulse1.pause();
          pulse2.pause();
        },
        onLeaveBack: () => {
          waveTween?.pause();
          pulse1.pause();
          pulse2.pause();
        },
      });

      // Cache the layout read the orbital choreography needs instead of
      // querying clientWidth on every single scrub tick. Only recomputed when
      // ScrollTrigger actually re-measures the page (resize/orientation change).
      let cachedWrapWidth = cardsWrapRef.current?.clientWidth || 640;

      // SINGLE COORDINATED MASTER GSAP TIMELINE TIED TO SCROLL TRIGGER
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          // More scroll distance devoted to the same choreography (same
          // relative timeline fractions throughout) so a normal scroll
          // gesture no longer blows through the entrance before it can
          // be seen. Nothing about the motion itself changes — it just
          // takes more physical scrolling to get through it.
          end: "+=1000%",
          pin: stageRef.current,
          // Slightly higher scrub lag smooths out fast/uneven scroll input
          // a bit further without feeling disconnected from the scrollbar.
          scrub: 1.5,
          snap: {
            snapTo: [0, 0.30, 0.43, 0.56, 0.69, 0.82, 0.95, 1.0],
            duration: { min: 0.22, max: 0.45 },
            // 40ms was shorter than the natural gap between consecutive
            // mouse-wheel scroll events, so snap could engage *between*
            // wheel ticks during ordinary scrolling, start animating the
            // scroll position toward the nearest snap point, then get
            // interrupted by the next tick — a real fight that read as
            // jitter, and it also yanked the view away from any brief
            // pause almost instantly. A quarter-second delay only engages
            // snap once the user has genuinely stopped scrolling.
            delay: 0.25,
            ease: "power2.out",
          },
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            cachedWrapWidth = cardsWrapRef.current?.clientWidth || 640;
          },
        },
      });

      // =========================================================================
      // 1. HERO APERTURE EXPANSION & OVERLAPPING HANDOFF (t: 0.0 -> 0.18)
      // =========================================================================
      tl.fromTo(
        heroVisualRef.current,
        { scale: 1, opacity: 1 },
        { scale: 8.5, opacity: 0, ease: "power2.out", duration: 0.18 },
        0
      );

      tl.fromTo(
        heroGlowRef.current,
        { opacity: 0, scale: 1 },
        {
          keyframes: [
            { opacity: 1, scale: 1.4, duration: 0.09, ease: "sine.out" },
            { opacity: 0, scale: 2.1, duration: 0.09, ease: "power1.out" },
          ],
        },
        0
      );

      // Ambient Laser Stream in background
      tl.fromTo(
        lasersRef.current,
        { x: 260, opacity: 0 },
        { x: -140, opacity: 1, duration: 0.4, ease: "sine.inOut" },
        0.04
      );

      // =========================================================================
      // 2. STAGGERED 3D ORBITAL CONSTELLATION CHOREOGRAPHY (t: 0.04 -> 0.26)
      // Master coordinated timeline with cascading quintic smootherstep docking
      // =========================================================================
      const choreographyState = { progress: 0 };

      tl.to(
        choreographyState,
        {
          progress: 1,
          ease: "none",
          duration: 0.22,
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

              // Staggered emergence from aperture core (Back cards emerge first).
              // Eased with the same quintic smootherstep used for docking below —
              // a linear ramp here has zero velocity nowhere, so opacity/scale
              // would snap on and snap off at the edges of each card's local
              // emergence window. Smoothstepping it gives every card a true
              // zero-velocity start and handoff into the dock phase, so the
              // fade-up reads as one continuous materialize rather than a pop.
              const emergenceRaw = Math.max(0, Math.min(1, (p - (5 - i) * 0.02) * 5.0));
              const staggerEmergence =
                emergenceRaw * emergenceRaw * emergenceRaw * (emergenceRaw * (emergenceRaw * 6 - 15) + 10);
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
        0.04
      );

      // =========================================================================
      // 3. STATEMENT REVEAL & STACK COEXISTENCE (t: 0.20 -> 0.34)
      // Statement expands and settles alongside the docked cards without hiding them
      // =========================================================================
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
          duration: 0.10,
          ease: "power2.out",
        },
        0.20
      );

      // Stationary Dwell 1: Card 0 (Scattered) active in front (t: 0.26 -> 0.34) [Snap: 0.30]
      tl.to({}, { duration: 0.08 }, 0.26);

      // =========================================================================
      // 4. DISCRETE SCROLL-DRIVEN CARD PEELS (ONE SCROLL PER CARD)
      // =========================================================================

      // Step 1: Peel Card 0 (Scattered) upward -> Reveals Card 1 (Collected)
      tl.to(
        cardEls[0],
        {
          y: -950,
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.05,
        },
        0.34
      );

      // Stationary Dwell 2: Card 1 (Collected) active (t: 0.39 -> 0.47) [Snap: 0.43]
      tl.to({}, { duration: 0.08 }, 0.39);

      // Step 2: Peel Card 1 (Collected) upward -> Reveals Card 2 (Organized)
      tl.to(
        cardEls[1],
        {
          y: -950,
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.05,
        },
        0.47
      );

      // Stationary Dwell 3: Card 2 (Organized) active (t: 0.52 -> 0.60) [Snap: 0.56]
      tl.to({}, { duration: 0.08 }, 0.52);

      // Step 3: Peel Card 2 (Organized) upward -> Reveals Card 3 (Revealed)
      tl.to(
        cardEls[2],
        {
          y: -950,
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.05,
        },
        0.60
      );

      // Stationary Dwell 4: Card 3 (Revealed) active (t: 0.65 -> 0.73) [Snap: 0.69]
      tl.to({}, { duration: 0.08 }, 0.65);

      // Step 4: Peel Card 3 (Revealed) upward -> Reveals Card 4 (Connected)
      tl.to(
        cardEls[3],
        {
          y: -950,
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.05,
        },
        0.73
      );

      // Stationary Dwell 5: Card 4 (Connected) active (t: 0.78 -> 0.86) [Snap: 0.82]
      tl.to({}, { duration: 0.08 }, 0.78);

      // Step 5: Peel Card 4 (Connected) upward -> Reveals Card 5 (Clear)
      tl.to(
        cardEls[4],
        {
          y: -950,
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.05,
        },
        0.86
      );

      // Stationary Dwell 6: Card 5 (Clear) active in full clarity (t: 0.91 -> 0.97) [Snap: 0.95]
      tl.to({}, { duration: 0.06 }, 0.91);

      // =========================================================================
      // 5. GENTLE, CONTINUOUS RESOLUTION INTO NEXT CHAPTER (t: 0.97 -> 1.00)
      // =========================================================================
      tl.to(
        [textWrapRef.current, cardsWrapRef.current, lasersRef.current],
        {
          opacity: 0,
          y: -16,
          scale: 0.98,
          filter: "blur(2px)",
          ease: "power1.inOut",
          duration: 0.03,
        },
        0.97
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#040705] select-none"
      // Must match the ScrollTrigger's pin distance (end: "+=1000%" = 1000vh).
      // A mismatch here leaves a dead, unpinned scroll gap between this
      // section's pin releasing and the next section's pin engaging.
      style={{ height: "1000vh" }}
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
          {/* 1. Fluid Dynamic Wave Layer (Displacement Filter Applied to Wave Strata) */}
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

          {/* 2. Concentric Radiating Wave Energy Pulses (Flowing Signal Paths) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="hero-wave-pulse-1 pointer-events-none absolute w-[550px] h-[550px] rounded-full blur-2xl opacity-0"
              style={{
                left: "calc(60.5% - 275px)",
                top: "calc(47.8% - 275px)",
                background: "radial-gradient(circle, rgba(74,222,128,0) 38%, rgba(74,222,128,0.22) 54%, rgba(34,197,94,0) 68%)",
              }}
            />
            <div
              className="hero-wave-pulse-2 pointer-events-none absolute w-[720px] h-[720px] rounded-full blur-3xl opacity-0"
              style={{
                left: "calc(60.5% - 360px)",
                top: "calc(47.8% - 360px)",
                background: "radial-gradient(circle, rgba(74,222,128,0) 36%, rgba(74,222,128,0.16) 52%, rgba(34,197,94,0) 70%)",
              }}
            />
          </div>

          {/* 3. Static, Razor-Sharp Unifolio Central Ring Overlay (Completely Motionless & Distortion-Free) */}
          <div
            className="pointer-events-none absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] md:w-[540px] md:h-[540px] lg:w-[600px] lg:h-[600px]"
            style={{
              left: "60.5%",
              top: "47.8%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              src="/hero-static-ring.png"
              alt="Unifolio Ring Core"
              fill
              priority
              className="object-contain pointer-events-none select-none"
            />
          </div>

          {/* Seamless Organic Displacement Filter for Hero Wave Lines */}
          <svg className="pointer-events-none absolute w-0 h-0" aria-hidden="true">
            <defs>
              <filter id="heroWaveFlowFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  id="heroWaveTurbulence"
                  type="fractalNoise"
                  baseFrequency="0.0032 0.0068"
                  numOctaves="3"
                  result="noise"
                  seed="7"
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
            className="group/stack lg:col-span-7 xl:col-span-7 relative h-[360px] sm:h-[400px] md:h-[440px] flex items-center justify-start lg:justify-center overflow-visible will-change-transform"
          >
            <div className="relative w-full h-full flex items-center justify-start">
              
              {/* Card 0: 01 — Scattered (First scroll peel: Sphere on pedestal) */}
              <div
                key="glass-card-0"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#061009]/95 border border-[#4ADE80]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(74,222,128,0.16),inset_0_1px_1px_0_rgba(74,222,128,0.4)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#4ADE80]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(74,222,128,0.28)] hover:z-40"
                style={{ zIndex: 30 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    SCATTERED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Fragmented Information</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-1.png"
                      alt="Create your account visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 1: 02 — Collected (Second scroll peel: Curved glass & pill connector) */}
              <div
                key="glass-card-1"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#4ADE80]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(74,222,128,0.28)] hover:z-40"
                style={{ zIndex: 26 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    COLLECTED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Inward Convergence</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-2.png"
                      alt="Tell us about yourself visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: 03 — Organized (Third scroll peel: CAS folder & tray) */}
              <div
                key="glass-card-2"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#4ADE80]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(74,222,128,0.28)] hover:z-40"
                style={{ zIndex: 22 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    ORGANIZED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Structured Strata</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-3.png"
                      alt="Upload your CAS visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: 04 — Revealed (Fourth scroll peel: Data tiles passing through glass gate) */}
              <div
                key="glass-card-3"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#4ADE80]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(74,222,128,0.28)] hover:z-40"
                style={{ zIndex: 18 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    REVEALED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Hidden Insights</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-4.png"
                      alt="We organise your data visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: 05 — Connected (Fifth scroll peel: Golden fibers converging into torus) */}
              <div
                key="glass-card-4"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#4ADE80]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(74,222,128,0.28)] hover:z-40"
                style={{ zIndex: 14 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    CONNECTED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Synaptic Network</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-5.png"
                      alt="Everything connects visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: 06 — Clear (Sixth final state: Compass ring & marble sectors) */}
              <div
                key="glass-card-5"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#061009]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#4ADE80]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(74,222,128,0.28)] hover:z-40"
                style={{ zIndex: 10 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
                
                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    CLEAR <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Unified Clarity</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-6.png"
                      alt="See your complete portfolio visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
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
