"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";

export function BlueprintHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);
  const heroGlowRef = useRef<HTMLDivElement | null>(null);
  const cursorBadgeRef = useRef<HTMLDivElement | null>(null);

  const [isPortalPaused, setIsPortalPaused] = useState(false);

  const updateRingAnchor = () => {
    const ringEl = document.getElementById("hero-ring-portal");
    if (!ringEl || !heroVisualRef.current) return;
    const ringRect = ringEl.getBoundingClientRect();
    const heroRect = heroVisualRef.current.getBoundingClientRect();
    if (heroRect.width > 0 && heroRect.height > 0) {
      const xPercent =
        ((ringRect.left + ringRect.width / 2 - heroRect.left) / heroRect.width) * 100;
      const yPercent =
        ((ringRect.top + ringRect.height / 2 - heroRect.top) / heroRect.height) * 100;
      heroVisualRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      if (heroGlowRef.current) {
        heroGlowRef.current.style.left = `calc(${xPercent}% - 210px)`;
        heroGlowRef.current.style.top = `calc(${yPercent}% - 210px)`;
      }
    }
  };

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      updateRingAnchor();
      window.addEventListener("resize", updateRingAnchor);

      // Sequence control flags
      let isSequenceRunning = false;
      let hasSequenceCompleted = false;

      // =========================================================================
      // CURSOR-FOLLOWING "SCROLL TO ENTER" BADGE (Active in initial hero state)
      // =========================================================================
      const hasFinePointer = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
      let isBadgeActive = hasFinePointer && !prefersReducedMotion();

      // Fluid trailing lag setters via GSAP quickTo (offset beside original cursor)
      const setBadgeX = cursorBadgeRef.current
        ? gsap.quickTo(cursorBadgeRef.current, "x", { duration: 0.14, ease: "power3.out" })
        : () => {};
      const setBadgeY = cursorBadgeRef.current
        ? gsap.quickTo(cursorBadgeRef.current, "y", { duration: 0.14, ease: "power3.out" })
        : () => {};

      let isBadgeVisible = false;
      const handleMouseMove = (e: MouseEvent) => {
        if (!isBadgeActive || isSequenceRunning || hasSequenceCompleted) return;

        // Hide when near top navbar so it doesn't collide with navigation buttons
        if (e.clientY < 65) {
          if (isBadgeVisible && cursorBadgeRef.current) {
            isBadgeVisible = false;
            gsap.to(cursorBadgeRef.current, { opacity: 0, scale: 0.85, duration: 0.15, ease: "power2.in" });
          }
          return;
        }

        // Float smoothly right beside the user's original cursor pointer
        setBadgeX(e.clientX + 18);
        setBadgeY(e.clientY + 2);

        if (!isBadgeVisible && cursorBadgeRef.current) {
          isBadgeVisible = true;
          gsap.to(cursorBadgeRef.current, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
      };

      const handleMouseLeave = () => {
        if (cursorBadgeRef.current) {
          isBadgeVisible = false;
          gsap.to(cursorBadgeRef.current, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" });
        }
      };

      if (isBadgeActive) {
        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
      }

      const disableBadge = () => {
        isBadgeActive = false;
        if (cursorBadgeRef.current) {
          gsap.to(cursorBadgeRef.current, {
            opacity: 0,
            scale: 0.7,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
              if (cursorBadgeRef.current) {
                gsap.set(cursorBadgeRef.current, { display: "none" });
              }
            },
          });
        }
      };

      // Initially hide hero text ("SEE WHAT YOU ACTUALLY OWN") and hero aperture video
      // until the logo has completely slid to its docked position at the top-left
      let isHeroRevealed = prefersReducedMotion();
      if (!isHeroRevealed) {
        gsap.set(heroIntroRef.current, { opacity: 0, y: 20 });
        gsap.set(heroVisualRef.current, { opacity: 0, scale: 0.96 });
      }

      const revealHeroAfterDocked = () => {
        if (isHeroRevealed) return;
        isHeroRevealed = true;

        if (heroIntroRef.current) {
          gsap.to(heroIntroRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
          });
        }

        if (heroVisualRef.current) {
          gsap.to(heroVisualRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.95,
            ease: "power2.out",
          });
        }
      };

      window.addEventListener("unifolio-logo-docked", revealHeroAfterDocked);
      window.addEventListener("unifolio-intro-complete", revealHeroAfterDocked);

      // Scroll locking helpers for the cinematic enlargement window
      const lockScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        ScrollTrigger.normalizeScroll(false);
      };

      const unlockScroll = () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        if (!prefersReducedMotion()) {
          ScrollTrigger.normalizeScroll(true);
        }
      };

      // =========================================================================
      // MASTER UNIFOLIO RING ENLARGEMENT TIMELINE
      // =========================================================================
      const masterTl = gsap.timeline({
        paused: true,
        onStart: () => {
          isSequenceRunning = true;
          setIsPortalPaused(true);
        },
        onComplete: () => {
          isSequenceRunning = false;
          hasSequenceCompleted = true;
          unlockScroll();

          // Immediately and seamlessly transition into the Financial Landscape product section
          smoothScrollTo("#product", { duration: 0.55, ease: "power2.out" });
        },
      });

      // 0. HERO INTRO TYPOGRAPHY FADEOUT (0.8s)
      masterTl.to(
        heroIntroRef.current,
        {
          opacity: 0,
          y: -25,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0
      );

      // Instantly dismiss cursor-following badge
      if (cursorBadgeRef.current) {
        masterTl.to(
          cursorBadgeRef.current,
          {
            opacity: 0,
            scale: 0.7,
            duration: 0.25,
            ease: "power2.in",
          },
          0
        );
      }

      // 1. HERO APERTURE EXPANSION & CENTRAL VOID DISSOLVE (1.4s, scale: 1 -> 8.5)
      masterTl.fromTo(
        heroVisualRef.current,
        { scale: 1, opacity: 1 },
        { scale: 8.5, opacity: 0, ease: "power2.inOut", duration: 1.4 },
        0
      );

      // 2. Dynamic Luminous Green Flare Bloom Centered Over the Aperture
      masterTl.fromTo(
        heroGlowRef.current,
        { opacity: 0, scale: 1 },
        {
          keyframes: [
            { opacity: 1, scale: 1.4, duration: 0.6, ease: "sine.out" },
            { opacity: 0, scale: 2.2, duration: 0.8, ease: "power1.out" },
          ],
        },
        0
      );

      // =========================================================================
      // SCROLL INTERACTION & STATE RESET HANDLERS
      // =========================================================================
      const triggerAutoplay = () => {
        if (!hasSequenceCompleted && !isSequenceRunning) {
          lockScroll();
          disableBadge();
          masterTl.play();
        }
      };

      const returnToHero = () => {
        if (isSequenceRunning || !hasSequenceCompleted) return;
        const productEl = document.getElementById("product");
        const productTop = productEl ? productEl.offsetTop : window.innerHeight;
        if (window.scrollY > productTop * 0.45) return;

        isSequenceRunning = true;
        lockScroll();

        const returnTl = gsap.timeline({
          onComplete: () => {
            isSequenceRunning = false;
            hasSequenceCompleted = false;
            setIsPortalPaused(false);
            unlockScroll();
            masterTl.pause(0);
            gsap.set(heroIntroRef.current, { opacity: 1, y: 0, clearProps: "all" });
            gsap.set(heroVisualRef.current, { scale: 1, opacity: 1, clearProps: "all" });
            gsap.set(heroGlowRef.current, { scale: 1, opacity: 0 });

            // Restore badge for initial hero state
            if (hasFinePointer && !prefersReducedMotion()) {
              isBadgeActive = true;
              if (cursorBadgeRef.current) {
                gsap.set(cursorBadgeRef.current, { display: "block", opacity: 0 });
              }
            }
          },
        });

        // Smoothly return scroll position to 0
        smoothScrollTo(0, { duration: 0.6, ease: "power2.out" });

        // Bring back hero visual & aperture ring
        returnTl.fromTo(
          heroVisualRef.current,
          { scale: 2.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" },
          0.15
        );

        // Bring back hero intro text ("SEE WHAT YOU ACTUALLY OWN")
        returnTl.fromTo(
          heroIntroRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.25
        );
      };

      const resetHeroState = () => {
        masterTl.pause(0);
        isSequenceRunning = false;
        hasSequenceCompleted = false;
        setIsPortalPaused(false);
        unlockScroll();

        if (hasFinePointer && !prefersReducedMotion()) {
          isBadgeActive = true;
          if (cursorBadgeRef.current) {
            gsap.set(cursorBadgeRef.current, { display: "block", opacity: 0 });
          }
        }

        gsap.set(heroIntroRef.current, { opacity: 1, y: 0, clearProps: "all" });
        gsap.set(heroVisualRef.current, { scale: 1, opacity: 1, clearProps: "all" });
        gsap.set(heroGlowRef.current, { scale: 1, opacity: 0 });
      };

      const handleWheel = (e: WheelEvent) => {
        if (isSequenceRunning) {
          e.preventDefault();
          return;
        }
        if (window.scrollY < 80 && e.deltaY > 0 && !hasSequenceCompleted) {
          e.preventDefault();
          triggerAutoplay();
        } else if (window.scrollY <= window.innerHeight * 0.4 && e.deltaY < 0 && hasSequenceCompleted) {
          e.preventDefault();
          returnToHero();
        }
      };

      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (isSequenceRunning) {
          e.preventDefault();
          return;
        }
        const touchCurrentY = e.touches[0].clientY;
        const deltaY = touchStartY - touchCurrentY;

        if (window.scrollY < 80 && deltaY > 20 && !hasSequenceCompleted) {
          e.preventDefault();
          triggerAutoplay();
        } else if (window.scrollY <= window.innerHeight * 0.4 && deltaY < -20 && hasSequenceCompleted) {
          e.preventDefault();
          returnToHero();
        }
      };

      // Custom Event listener for Home navigation and Hero reset
      window.addEventListener("unifolio-reset-hero", resetHeroState);
      window.addEventListener("unifolio-trigger-hero", triggerAutoplay);

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });

      // Fallback trigger if user triggers a scroll jump into hero
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top+=10 top",
        onEnter: () => {
          triggerAutoplay();
        },
      });

      return () => {
        window.removeEventListener("unifolio-logo-docked", revealHeroAfterDocked);
        window.removeEventListener("unifolio-intro-complete", revealHeroAfterDocked);
        window.removeEventListener("unifolio-reset-hero", resetHeroState);
        window.removeEventListener("unifolio-trigger-hero", triggerAutoplay);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("resize", updateRingAnchor);

        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen bg-[#FAF8F5] dark:bg-[#000000] select-none transition-colors duration-500 overflow-hidden"
    >
      {/* Floating Badge: Tracks beside the user's original cursor in initial hero state */}
      <div
        ref={cursorBadgeRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 opacity-0 select-none will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div className="flex items-center px-3.5 py-1.5 rounded-full bg-[#3F4245]/95 text-white border border-white/10 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <span className="font-sans text-[12px] sm:text-[13px] font-medium tracking-tight text-white whitespace-nowrap">
            Scroll to enter
          </span>
        </div>
      </div>

      {/* Anchor for Section 2 Nav Link */}
      <div id="statement" className="absolute top-[35%] pointer-events-none" />

      {/* Single Pinned Master Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#000000] flex flex-col justify-center p-6 sm:p-10 lg:p-16 transition-colors duration-500"
      >
        {/* Landing State Hero Intro Content */}
        <div
          ref={heroIntroRef}
          className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-20 pb-8 max-w-7xl mx-auto w-full pointer-events-none"
        >
          {/* Main Headline aligned naturally with the central axis of the aperture illustration */}
          <div className="flex-1 flex flex-col justify-center max-w-lg -translate-x-6 sm:-translate-x-10 lg:-translate-x-14 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] text-black dark:text-white tracking-[-0.03em] uppercase leading-[0.92] transition-colors duration-500">
              SEE WHAT <br />
              YOU ACTUALLY <br />
              OWN.
            </h1>
          </div>
        </div>

        {/* Master Hero Visual Layer (Zooms and dissolves into the aperture void) */}
        <div
          ref={heroVisualRef}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform"
          style={{ transformOrigin: "66.5% 48.0%" }}
        >
          {/* Cinematic Hero Aperture Video Visual (Seamless Transformation Horizon) */}
          <HeroApertureVisual
            isPaused={isPortalPaused}
            onRingMounted={updateRingAnchor}
          />

          {/* Dynamic Luminous Green Flare Bloom Centered Over the Aperture */}
          <div
            ref={heroGlowRef}
            className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#22C55E]/0 via-[#22C55E]/30 to-[#22C55E]/50 blur-3xl opacity-0 z-20 will-change-transform"
            style={{ left: "calc(66.5% - 210px)", top: "calc(48.0% - 210px)" }}
          />
        </div>
      </div>
    </section>
  );
}
