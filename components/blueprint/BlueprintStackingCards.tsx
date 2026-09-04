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
        return -(trackWidth - viewportWidth + 60);
      };

      const getEndDistance = () =>
        Math.max(2400, (track.scrollWidth - window.innerWidth) * 1.35);

      // Keep section height in sync with exact pin distance
      const syncContainerHeight = () => {
        container.style.height = `${getEndDistance() + window.innerHeight}px`;
      };
      syncContainerHeight();

      // 1. Smooth Cinematic Entrance from Product: fades in as section enters viewport
      gsap.fromTo(
        track,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            end: "top top",
            scrub: 0.8,
          },
        }
      );

      // 2. Pinned Horizontal Storytelling Ribbon: begins immediately on first scroll at top top
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getEndDistance()}`,
          pin: stageRef.current,
          scrub: 1.0,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onRefreshInit: syncContainerHeight,
        },
      });

      // Horizontal translation begins immediately at 0.0 with no dead delay
      tl.to(
        track,
        {
          x: getScrollAmount,
          duration: 0.86,
          ease: "power1.inOut",
        },
        0
      );

      // Generous Intentional End Dwell Pause (0.86 -> 0.94): Final panel remains fully visible

      // Smooth Cinematic Exit into About Us (0.94 -> 1.00)
      tl.to(
        track,
        {
          opacity: 0,
          y: -20,
          duration: 0.06,
          ease: "power1.inOut",
        },
        0.94
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="offerings"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] dark:bg-[#000000] select-none transition-colors duration-500"
      // Pre-hydration fallback only; useGSAP overwrites this with the exact
      // pin distance (getEndDistance + one viewport height) once mounted.
      style={{ height: "640vh" }}
    >
      {/* Seamless Top Gradient Handoff from Hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/70 dark:from-[#000000] dark:via-[#000000]/70 to-transparent z-10 transition-colors duration-500" />

      {/* Pinned Fullscreen Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500"
      >
        {/* Subtle Horizon Strata */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.04] to-transparent" />

        {/* Continuous Horizontal Panoramic Ribbon */}
        <div
          ref={trackRef}
          className="flex items-center gap-28 sm:gap-40 md:gap-52 px-16 sm:px-28 md:px-44 w-max whitespace-nowrap will-change-transform"
        >
          {/* =========================================================================
              PROLOGUE: Monumental Editorial Statement
             ========================================================================= */}
          <div className="flex flex-col justify-center shrink-0 pr-12 sm:pr-24 max-w-[580px] sm:max-w-[720px] whitespace-normal">
            <h2 className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-[84px] text-[#111613] dark:text-white tracking-[-0.04em] uppercase leading-[0.92]">
              BUILT TO UNIFY. <br />
              <span className="text-[#22C55E]">DESIGNED TO CLARIFY.</span>
            </h2>
          </div>

          {/* =========================================================================
              CHAPTER 1: ONE VIEW. NOTHING HIDDEN. + Horizontal Section Illustration
             ========================================================================= */}
          <div className="flex items-center gap-16 sm:gap-24 shrink-0">
            {/* Primary Editorial Heading */}
            <div className="flex flex-col justify-center shrink-0 whitespace-normal max-w-[480px]">
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.95]">
                ONE VIEW. <br />
                <span className="text-[#5A685D] dark:text-[#8E9B91]/80">NOTHING HIDDEN.</span>
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
              <h3 className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.95]">
                SEE WHAT <br />
                <span className="text-[#22C55E]">YOUR MONEY</span> <br />
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/80 dark:from-[#000000] dark:via-[#000000]/80 to-transparent z-10 transition-colors duration-500" />
    </section>
  );
}
