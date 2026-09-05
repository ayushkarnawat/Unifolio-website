"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";

export function BlueprintHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !stageRef.current) return;

      const reduced = prefersReducedMotion();

      // Ensure Hero text and visual are immediately visible and prominent
      gsap.set(heroIntroRef.current, { opacity: 1, y: 0 });
      gsap.set(heroVisualRef.current, { opacity: 1, scale: 1 });

      const revealHeroAfterDocked = () => {
        if (heroIntroRef.current) {
          gsap.to(heroIntroRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }
        if (heroVisualRef.current) {
          gsap.to(heroVisualRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      };

      // Listen for logo docked events
      window.addEventListener("unifolio-logo-docked", revealHeroAfterDocked);
      window.addEventListener("unifolio-intro-complete", revealHeroAfterDocked);

      // Hero exit animation as user scrolls down into Product
      if (!reduced) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        // Hero text dissolves upward smoothly
        tl.to(
          heroIntroRef.current,
          {
            opacity: 0,
            yPercent: -15,
            duration: 0.4,
            ease: "power2.inOut",
          },
          0.05
        );

        // Hero aperture visual contracts gently downward to guide eye into Product
        tl.to(
          heroVisualRef.current,
          {
            scale: 0.9,
            opacity: 0.2,
            duration: 0.5,
            ease: "power2.inOut",
          },
          0.1
        );
      }

      return () => {
        window.removeEventListener("unifolio-logo-docked", revealHeroAfterDocked);
        window.removeEventListener("unifolio-intro-complete", revealHeroAfterDocked);
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] dark:bg-[#000000] select-none transition-colors duration-500 overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Master Viewport Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#000000] flex flex-col justify-center p-6 sm:p-10 lg:p-16 transition-colors duration-500"
      >
        {/* Landing State Hero Intro Content: Headline */}
        <div
          ref={heroIntroRef}
          className="absolute inset-0 z-30 flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-20 pb-8 max-w-7xl mx-auto w-full pointer-events-none will-change-transform"
        >
          <div className="flex-1 flex flex-col justify-center max-w-lg -translate-x-6 sm:-translate-x-10 lg:-translate-x-14 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] text-neutral-950 dark:text-white tracking-[-0.03em] uppercase leading-[0.92] transition-colors duration-500 select-none">
              SEE WHAT <br />
              YOU ACTUALLY <br />
              OWN.
            </h1>
          </div>
        </div>

        {/* Master Hero Visual Layer: Aperture Video */}
        <div
          ref={heroVisualRef}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform"
        >
          <HeroApertureVisual />
        </div>
      </div>
    </section>
  );
}
