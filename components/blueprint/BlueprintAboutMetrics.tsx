"use client";

import { useRef, useEffect } from "react";
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

  const currentStep = useRef<number>(0);
  const isAnimating = useRef<boolean>(false);
  const lastStepTime = useRef<number>(0);

  // Controlled, discrete step animator
  const animateToStep = (targetStep: number) => {
    isAnimating.current = true;
    lastStepTime.current = Date.now();
    currentStep.current = targetStep;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      },
    });

    if (targetStep === 0) {
      // State 0: Intro ("About us" & "Creating clarity...")
      tl.to(
        beaconRef.current,
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.95,
          duration: 0.55,
          ease: "power2.inOut",
        },
        0
      );
      tl.to(
        state1Ref.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        0
      );
      tl.to(
        state2Ref.current,
        {
          opacity: 0,
          x: 40,
          y: 0,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        state3Ref.current,
        {
          opacity: 0,
          y: 40,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        contourLayerRef.current,
        {
          opacity: 0,
          duration: 0.35,
        },
        0
      );
    } else if (targetStep === 1) {
      // State 1: Mission statement & Philosophy
      tl.to(
        beaconRef.current,
        {
          x: -280,
          y: -20,
          scale: 0.88,
          opacity: 1,
          duration: 0.55,
          ease: "power2.inOut",
        },
        0
      );
      tl.to(
        state1Ref.current,
        {
          opacity: 0,
          y: -30,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        state2Ref.current,
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        0.1
      );
      tl.to(
        state3Ref.current,
        {
          opacity: 0,
          y: 40,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        contourLayerRef.current,
        {
          opacity: 0,
          duration: 0.35,
        },
        0
      );
    } else if (targetStep === 2) {
      // State 2: 3 Capability Pillar Cards & Contours
      tl.to(
        beaconRef.current,
        {
          x: -120,
          y: 60,
          scale: 1.1,
          opacity: 0.15,
          duration: 0.55,
          ease: "power2.inOut",
        },
        0
      );
      tl.to(
        state1Ref.current,
        {
          opacity: 0,
          y: -30,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        state2Ref.current,
        {
          opacity: 0,
          x: 0,
          y: -40,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        state3Ref.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.1
      );
      tl.to(
        contourLayerRef.current,
        {
          opacity: 1,
          y: -25,
          x: 15,
          duration: 0.55,
          ease: "power2.out",
        },
        0.1
      );
    }
  };

  // Pinned viewport stage setup
  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=260%",
        pin: stageRef.current,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => {
          if (currentStep.current !== 0) {
            animateToStep(0);
          }
        },
        onEnterBack: () => {
          if (currentStep.current !== 2) {
            animateToStep(2);
          }
        },
      });
    },
    { scope: containerRef }
  );

  // Wheel & Trackpad gesture normalization & step clamp
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const sectionEl = containerRef.current;
    if (!sectionEl) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = sectionEl.getBoundingClientRect();
      const inView = rect.top <= 10 && rect.bottom >= window.innerHeight - 10;
      if (!inView) return;

      const now = Date.now();
      const delta = e.deltaY;

      if (Math.abs(delta) < 15) return;

      // Intercept and clamp gesture during transition or active lock
      if (isAnimating.current || now - lastStepTime.current < 650) {
        e.preventDefault();
        return;
      }

      if (delta > 0) {
        // Forward scroll: advance exactly one state
        if (currentStep.current < 2) {
          e.preventDefault();
          animateToStep(currentStep.current + 1);
        }
        // At final step (2), allow natural downward scroll into FAQ
      } else {
        // Backward scroll: retreat exactly one state
        if (currentStep.current > 0) {
          e.preventDefault();
          animateToStep(currentStep.current - 1);
        }
        // At initial step (0), allow natural upward scroll into Offerings
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = sectionEl.getBoundingClientRect();
      const inView = rect.top <= 10 && rect.bottom >= window.innerHeight - 10;
      if (!inView) return;

      const touchY = e.touches[0].clientY;
      const delta = touchStartY - touchY;
      const now = Date.now();

      if (Math.abs(delta) < 25) return;

      if (isAnimating.current || now - lastStepTime.current < 650) {
        e.preventDefault();
        return;
      }

      if (delta > 0) {
        if (currentStep.current < 2) {
          e.preventDefault();
          touchStartY = touchY;
          animateToStep(currentStep.current + 1);
        }
      } else {
        if (currentStep.current > 0) {
          e.preventDefault();
          touchStartY = touchY;
          animateToStep(currentStep.current - 1);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full bg-[#000000] select-none"
      style={{ height: "360vh" }}
    >
      {/* Fullscreen Pinned Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#000000] flex items-center justify-center p-6 sm:p-12 lg:p-20 text-[#FAF8F5]"
      >
        {/* Ambient Top & Bottom Grid Hairlines */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
            <h2 className="font-sans font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white">
              About us
            </h2>
          </div>

          <div className="flex items-end justify-end pb-4">
            <div className="max-w-md text-left sm:text-right space-y-1">
              <p className="font-sans font-light text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F5] leading-tight tracking-tight">
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
          <div className="max-w-2xl lg:max-w-3xl space-y-6 text-left">
            <h3 className="font-sans font-light text-3xl sm:text-5xl lg:text-6xl text-[#FAF8F5] tracking-tight leading-[1.18]">
              Our mission is to build absolute transparency and sovereign clarity across every folio, fund, and asset.
            </h3>
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
          <div className="relative w-full rounded-[40px] overflow-hidden border border-white/[0.08] bg-[#000000] shadow-[0_24px_60px_rgba(0,0,0,0.95)] pointer-events-auto">
            
            {/* ABSTRACT ILLUMINATED TOPOGRAPHIC & AMBIENT FIELD (Harmonized System Aura) */}
            <div
              ref={contourLayerRef}
              className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden will-change-transform z-0 opacity-0"
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
                    <feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.77  0 0 0 0 0.37  0 0 0 0.04 0" result="coloredGrain" />
                    <feComposite in="coloredGrain" in2="SourceGraphic" operator="in" />
                  </filter>

                  {/* Soft Restrained Rim Glow Filter */}
                  <filter id="subtleSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blurMid" />
                    <feGaussianBlur stdDeviation="16" result="blurWide" />
                    <feMerge>
                      <feMergeNode in="blurWide" />
                      <feMergeNode in="blurMid" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* LEFT CARD: Soft Ambient Glow Gradient */}
                  <radialGradient id="leftSurfaceGrad" cx="120" cy="480" r="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.14" />
                    <stop offset="50%" stopColor="#22C55E" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>

                  {/* MIDDLE CARD: Central Ambient Whisper */}
                  <radialGradient id="midAmbientGrad" cx="600" cy="520" r="280" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.12" />
                    <stop offset="50%" stopColor="#22C55E" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>

                  {/* RIGHT CARD: Soft Ambient Glow Gradient */}
                  <radialGradient id="rightBottomSurfaceGrad" cx="1080" cy="480" r="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.14" />
                    <stop offset="50%" stopColor="#22C55E" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Soft diffused background glows across all three columns */}
                <ellipse cx="160" cy="500" rx="260" ry="180" fill="url(#leftSurfaceGrad)" />
                <ellipse cx="600" cy="500" rx="240" ry="160" fill="url(#midAmbientGrad)" />
                <ellipse cx="1040" cy="500" rx="260" ry="180" fill="url(#rightBottomSurfaceGrad)" />

                {/* Harmonized continuous horizon contour line spanning the bottom */}
                <path
                  d="M 20 480 C 180 430, 320 510, 480 460 C 640 410, 780 490, 960 450 C 1080 420, 1140 460, 1180 440"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="0.85"
                  strokeOpacity="0.30"
                  filter="url(#subtleSoftGlow)"
                />
              </svg>
            </div>

            {/* 3 CAPABILITY PANELS WITH MINIMAL EDITORIAL REFINEMENT */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] p-6 sm:p-10 lg:p-12">
              
              {/* Panel 1: Autonomous Ledger */}
              <div className="group p-6 sm:p-8 lg:p-10 space-y-12 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] rounded-2xl hover:bg-white/[0.02] transition-colors duration-300">
                <div>
                  <h4 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight group-hover:text-[#22C55E] transition-colors">
                    Autonomous Ledger
                  </h4>
                </div>

                <div className="pt-6 border-t border-white/[0.06] font-mono text-3xl sm:text-4xl text-white font-bold tracking-tight">
                  ₹420Cr+ <span className="text-xs font-normal text-[#8E9B91] block uppercase tracking-wider mt-1">Tracked Asset Base</span>
                </div>
              </div>

              {/* Panel 2: Fee Dissection */}
              <div className="group p-6 sm:p-8 lg:p-10 space-y-12 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] rounded-2xl hover:bg-white/[0.02] transition-colors duration-300">
                <div>
                  <h4 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight group-hover:text-[#22C55E] transition-colors">
                    Fee Dissection
                  </h4>
                </div>

                <div className="pt-6 border-t border-white/[0.06] font-mono text-3xl sm:text-4xl text-white font-bold tracking-tight">
                  100% <span className="text-xs font-normal text-[#8E9B91] block uppercase tracking-wider mt-1">TER Transparency</span>
                </div>
              </div>

              {/* Panel 3: Household Wealth */}
              <div className="group p-6 sm:p-8 lg:p-10 space-y-12 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] rounded-2xl hover:bg-white/[0.02] transition-colors duration-300">
                <div>
                  <h4 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight group-hover:text-[#22C55E] transition-colors">
                    Household Wealth
                  </h4>
                </div>

                <div className="pt-6 border-t border-white/[0.06] font-mono text-3xl sm:text-4xl text-white font-bold tracking-tight">
                  18,000+ <span className="text-xs font-normal text-[#8E9B91] block uppercase tracking-wider mt-1">Active Families</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Seamless Bottom Section Blend into FAQ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#000000] to-transparent z-10" />
    </section>
  );
}
