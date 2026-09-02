"use client";

import { useRef } from "react";
import Image from "next/image";
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
      const container = containerRef.current;

      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        return -(trackWidth - viewportWidth + 80);
      };

      const getEndDistance = () =>
        Math.max(3600, (track.scrollWidth - window.innerWidth) * 2.2 + 2000);

      // The section's authored CSS height previously used a static "640vh"
      // guess that had no relationship to the dynamic `end` distance below
      // (which depends on actual track content width). Whenever the two
      // disagreed, the pin either released early (leaving a dead unpinned
      // scroll gap before About Us) or the section overflowed its box. Keeping
      // the real height in sync with the exact pin distance removes that gap.
      const syncContainerHeight = () => {
        container.style.height = `${getEndDistance() + window.innerHeight}px`;
      };
      syncContainerHeight();

      // SINGLE COORDINATED TIMELINE FOR HORIZONTAL STORYTELLING WITH GENEROUS FINAL DWELL PAUSE
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getEndDistance()}`,
          pin: stageRef.current,
          scrub: 1.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onRefreshInit: syncContainerHeight,
        },
      });

      // 1. Smooth Cinematic Entrance: Natural Emergence from Hero Resolution (0.0 -> 0.10)
      tl.fromTo(
        track,
        {
          opacity: 0,
          y: 16,
          filter: "blur(3px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.10,
          ease: "power2.out",
        },
        0
      );

      // 2. Continuous Horizontal Translation across the Pinned Viewport (0.05 -> 0.70)
      tl.to(
        track,
        {
          x: getScrollAmount,
          duration: 0.65,
          ease: "power1.inOut",
        },
        0.05
      );

      // 3. Generous Intentional End Dwell Pause (0.70 -> 0.90): Final panel remains fully visible & legible

      // 4. Smooth Cinematic Exit: Soft Dissolve & Drift Out into About Us (0.90 -> 1.00)
      tl.to(
        track,
        {
          opacity: 0,
          y: -16,
          filter: "blur(2px)",
          duration: 0.10,
          ease: "power1.inOut",
        },
        0.90
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="offerings"
      ref={containerRef}
      className="relative w-full bg-[#0E1310] select-none"
      // Pre-hydration fallback only; useGSAP overwrites this with the exact
      // pin distance (getEndDistance + one viewport height) once mounted.
      style={{ height: "640vh" }}
    >
      {/* Seamless Top Gradient Handoff from Hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0E1310] via-[#0E1310]/70 to-transparent z-10" />

      {/* Pinned Fullscreen Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center bg-[#0E1310]"
      >
        {/* Ambient Environmental Gradients & Horizon Strata */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(74,222,128,0.05)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(74,222,128,0.04)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

        {/* Continuous Horizontal Panoramic Ribbon */}
        <div
          ref={trackRef}
          className="flex items-center gap-28 sm:gap-40 md:gap-52 px-16 sm:px-28 md:px-44 w-max whitespace-nowrap will-change-transform"
        >
          {/* =========================================================================
              PROLOGUE: Monumental Editorial Statement
             ========================================================================= */}
          <div className="flex flex-col justify-center shrink-0 pr-12 sm:pr-24 max-w-[580px] sm:max-w-[720px] whitespace-normal">
            <h2 className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-[84px] text-white tracking-[-0.04em] uppercase leading-[0.92]">
              BUILT TO UNIFY. <br />
              <span className="text-[#4ADE80]">DESIGNED TO CLARIFY.</span>
            </h2>
          </div>

          {/* =========================================================================
              CHAPTER 1: ONE VIEW. NOTHING HIDDEN. + Horizontal Section Illustration
             ========================================================================= */}
          <div className="flex items-center gap-16 sm:gap-24 shrink-0">
            {/* Primary Editorial Heading */}
            <div className="flex flex-col justify-center shrink-0 whitespace-normal max-w-[480px]">
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.035em] uppercase leading-[0.95]">
                ONE VIEW. <br />
                <span className="text-[#8E9B91]/80">NOTHING HIDDEN.</span>
              </h3>
            </div>

            {/* Direct Replacement: Horizontal Section Illustration */}
            <div className="w-[320px] sm:w-[440px] md:w-[520px] h-[220px] sm:h-[260px] md:h-[290px] relative flex items-center justify-center shrink-0">
              <Image
                src="/horizontal section illustration.png"
                alt="Unifolio — One View. Nothing Hidden."
                fill
                className="object-contain object-center pointer-events-none"
                quality={100}
              />
            </div>
          </div>

          {/* =========================================================================
              CHAPTER 2: SEE WHAT YOUR MONEY LEAVES BEHIND. + Harmonic Wave Field
             ========================================================================= */}
          <div className="flex items-center gap-16 sm:gap-24 shrink-0">
            {/* Primary Editorial Heading */}
            <div className="flex flex-col justify-center shrink-0 whitespace-normal max-w-[500px]">
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.035em] uppercase leading-[0.95]">
                SEE WHAT <br />
                <span className="text-[#4ADE80]">YOUR MONEY</span> <br />
                LEAVES BEHIND.
              </h3>
            </div>

            {/* Second Chapter Illustration */}
            <div className="w-[320px] sm:w-[440px] md:w-[520px] h-[220px] sm:h-[260px] md:h-[290px] relative flex items-center justify-center shrink-0">
              <Image
                src="/second illustration.png"
                alt="Unifolio — See What Your Money Leaves Behind."
                fill
                className="object-contain object-center pointer-events-none"
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seamless Bottom Blend into About */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0E1310] via-[#0E1310]/80 to-transparent z-10" />
    </section>
  );
}
