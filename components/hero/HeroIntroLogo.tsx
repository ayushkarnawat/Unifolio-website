"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface HeroIntroLogoProps {
  onComplete?: () => void;
}

export function HeroIntroLogo({ onComplete }: HeroIntroLogoProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const movingLogoRef = useRef<HTMLDivElement | null>(null);
  const unifWrapperRef = useRef<HTMLDivElement | null>(null);
  const unifInnerRef = useRef<HTMLDivElement | null>(null);
  const ringWrapperRef = useRef<HTMLDivElement | null>(null);
  const ringHaloRef = useRef<HTMLDivElement | null>(null);
  const solidRingRef = useRef<HTMLDivElement | null>(null);
  const mainBaseRef = useRef<HTMLDivElement | null>(null);
  const segmentRef = useRef<HTMLDivElement | null>(null);
  const finalRingRef = useRef<HTMLDivElement | null>(null);
  const lioWrapperRef = useRef<HTMLDivElement | null>(null);
  const lioInnerRef = useRef<HTMLDivElement | null>(null);

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Clear any previous session flag so intro plays reliably on page load
    try {
      sessionStorage.removeItem("unifolio_intro_played");
    } catch {
      // Ignore in strict privacy/incognito environments
    }

    // If user prefers reduced motion, skip straight to completion
    if (prefersReducedMotion()) {
      setIsVisible(false);
      window.dispatchEvent(new CustomEvent("unifolio-intro-complete"));
      if (onComplete) onComplete();
      return;
    }

    const overlay = overlayRef.current;
    const movingLogo = movingLogoRef.current;
    const unifWrapper = unifWrapperRef.current;
    const unifInner = unifInnerRef.current;
    const ringWrapper = ringWrapperRef.current;
    const ringHalo = ringHaloRef.current;
    const solidRing = solidRingRef.current;
    const mainBase = mainBaseRef.current;
    const segment = segmentRef.current;
    const finalRing = finalRingRef.current;
    const lioWrapper = lioWrapperRef.current;
    const lioInner = lioInnerRef.current;

    if (
      !overlay ||
      !movingLogo ||
      !unifWrapper ||
      !unifInner ||
      !ringWrapper ||
      !lioWrapper ||
      !lioInner
    )
      return;

    // Proportions:
    // Total master width: 2041px, height: 463px.
    // UNIF: 1050px (51.44537%)
    // RING (O): 380px (18.61832%)
    // LIO: 611px (29.93631%)
    // Center of the ring is at: 1050 + 190 = 1240px from left.
    // Container center is at: 2041 / 2 = 1020.5px.
    // Ring center offset ratio = (1240 / 2041) - 0.5 = ~0.1075453 (10.75453%)
    // Shifting movingLogo by -initialCenterX aligns the ring at the exact horizontal center of the viewport.
    const logoWidth = movingLogo.offsetWidth;
    const ringCenterOffsetRatio = 1240 / 2041 - 0.5; // ~0.1075453
    const initialCenterX = -logoWidth * ringCenterOffsetRatio;

    // Master timeline:
    // 1. Complete solid black ring in center
    // 2. Top-right segment physically separates/pulls out along circular path, turns #22C55E, settles into exact Unifolio logo
    // 3. Letters emerge from behind the ring (expanding outward horizontally) - EXACT existing expansion animation
    // 4. Hold on the completed centered logo (~1.1s)
    // 5. Deliberate flight to top-left navbar (~1.95s)
    const masterTl = gsap.timeline();

    // Initial setup in GSAP (guaranteeing exact alignment with DOM styles)
    gsap.set(overlay, { opacity: 1 });
    gsap.set(movingLogo, { x: initialCenterX, y: 0, scale: 1, transformOrigin: "50% 50%" });

    // Step 1: Ring alone is already visible in the center
    gsap.set(ringWrapper, { scale: 1, opacity: 1, filter: "blur(0px)" });

    const isDarkMode =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");

    // Complete solid ring at start: 100% visible, matching the final logo in geometry, size, position
    if (solidRing) gsap.set(solidRing, { opacity: 1 });
    if (mainBase) gsap.set(mainBase, { opacity: 1 });
    if (finalRing) gsap.set(finalRing, { opacity: 0 });
    if (ringHalo) gsap.set(ringHalo, { opacity: 0, scale: 1 });

    // Top-right segment starts nested inside the solid black ring along its circular path
    if (segment) {
      gsap.set(segment, {
        x: -6,
        y: 8.5,
        rotation: -2.5,
        filter: isDarkMode ? "brightness(0) invert(1)" : "brightness(0)",
        opacity: 1,
      });
    }

    // UNIF clipPath inset completely from left (hidden against ring)
    gsap.set(unifWrapper, {
      clipPath: "inset(0% 0% 0% 100%)",
      opacity: 0,
    });
    gsap.set(unifInner, { x: 70 });

    // LIO clipPath inset completely from right (hidden against ring)
    gsap.set(lioWrapper, {
      clipPath: "inset(0% 100% 0% 0%)",
      opacity: 0,
    });
    gsap.set(lioInner, { x: -50 });

    // 1. Start with a complete solid black ring: initial resting hold (0.0s -> 0.35s)
    masterTl.to({}, { duration: 0.35 });

    // 2. The top-right segment physically separates/pulls out from the black ring along its circular path (0.35s -> 1.20s)
    // As it moves into position, solidRing fades out to reveal the two open gaps
    if (solidRing) {
      masterTl.to(
        solidRing,
        {
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
        },
        0.35
      );
    }

    // Segment physically pulls out along its circular path into exact logo position
    if (segment) {
      masterTl.to(
        segment,
        {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.85,
          ease: "power2.out",
        },
        0.35
      );

      // As it moves into position, it changes to #22C55E
      masterTl.to(
        segment,
        {
          filter: "brightness(1) invert(0)",
          duration: 0.70,
          ease: "power2.out",
        },
        0.40
      );
    }

    // Subtle emerald halo emerges as the green energy activates
    if (ringHalo) {
      masterTl.to(
        ringHalo,
        {
          opacity: isDarkMode ? 0.8 : 0.5,
          scale: 1.15,
          duration: 0.65,
          ease: "sine.out",
        },
        0.45
      );
    }

    // 3. Settles into the exact existing Unifolio logo shown in the reference image (1.20s)
    masterTl.call(
      () => {
        if (finalRing) gsap.set(finalRing, { opacity: 1 });
        if (segment) gsap.set(segment, { opacity: 0 });
        if (solidRing) gsap.set(solidRing, { opacity: 0 });
      },
      [],
      1.20
    );

    // Brief settling beat on the completed, formed logo (1.20s -> 1.45s)
    masterTl.to({}, { duration: 0.25 });

    // 4. CRITICAL: Existing logo expansion animation continues EXACTLY as it does now!
    // No change to timing, trajectory, scale, motion, easing, or subsequent hero animations.
    const expandTime = 1.45;
    const expandDuration = 1.05;

    // Smoothly shift the whole logo to true viewport center (x: 0) as letters expand outward
    masterTl.to(
      movingLogo,
      {
        x: 0,
        duration: expandDuration,
        ease: "power3.out",
      },
      expandTime
    );


    // UNIF: reveals smoothly towards the left
    masterTl.to(
      unifWrapper,
      {
        opacity: 1,
        duration: 0.18,
        ease: "power2.out",
      },
      expandTime
    );
    masterTl.to(
      unifWrapper,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: expandDuration,
        ease: "power3.out",
      },
      expandTime
    );
    masterTl.to(
      unifInner,
      {
        x: 0,
        duration: expandDuration,
        ease: "power3.out",
      },
      expandTime
    );

    // LIO: reveals smoothly towards the right
    masterTl.to(
      lioWrapper,
      {
        opacity: 1,
        duration: 0.18,
        ease: "power2.out",
      },
      expandTime
    );
    masterTl.to(
      lioWrapper,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: expandDuration,
        ease: "power3.out",
      },
      expandTime
    );
    masterTl.to(
      lioInner,
      {
        x: 0,
        duration: expandDuration,
        ease: "power3.out",
      },
      expandTime
    );

    // Ring halo pulses softly as energy expands outward
    if (ringHalo) {
      masterTl.to(
        ringHalo,
        {
          scale: 1.3,
          opacity: 1,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        expandTime
      );
    }

    // 3. Hold this large, monumental logo moment for deep visual impact (1.80s -> 2.90s)
    masterTl.to({}, { duration: 1.1 });

    // 4. Deliberate, cinematic flight: gradually travels and scales down simultaneously into the navbar position
    const flightDuration = 1.95;

    masterTl.call(() => {
      // Find navbar brand logo
      const navLink = document.querySelector("#navbar-brand-logo") as HTMLElement | null;
      let navImg: HTMLElement | null = null;
      if (navLink) {
        const imgs = Array.from(navLink.querySelectorAll("img"));
        navImg = imgs.find((img) => img.getBoundingClientRect().width > 0) || null;
      }

      const targetRect = (navImg && navImg.getBoundingClientRect().width > 0)
        ? navImg.getBoundingClientRect()
        : (navLink && navLink.getBoundingClientRect().width > 0)
        ? navLink.getBoundingClientRect()
        : null;

      const currentRect = movingLogo.getBoundingClientRect();

      let targetLeft = 32;
      let targetTop = 20;
      let targetWidth = 120;
      let targetHeight = 27;

      if (targetRect && targetRect.width > 0) {
        targetLeft = targetRect.left;
        targetTop = targetRect.top;
        targetWidth = targetRect.width;
        targetHeight = targetRect.height;
      } else {
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 1024;
        targetLeft = isMobile ? 24 : isTablet ? 40 : 64;
        targetTop = 20;
        targetHeight = isMobile ? 24 : 28;
        targetWidth = targetHeight * (2041 / 463);
      }

      // Calculate uniform scale factor based on width
      const targetScale = targetWidth / currentRect.width;

      // Keep transformOrigin at center (50% 50%) for perfectly balanced scaling & flight
      gsap.set(movingLogo, { transformOrigin: "50% 50%" });

      // Calculate center-to-center movement
      const currentCenterX = currentRect.left + currentRect.width / 2;
      const currentCenterY = currentRect.top + currentRect.height / 2;
      const targetCenterX = targetLeft + targetWidth / 2;
      const targetCenterY = targetTop + targetHeight / 2;

      const currentGsapX = (gsap.getProperty(movingLogo, "x") as number) || 0;
      const currentGsapY = (gsap.getProperty(movingLogo, "y") as number) || 0;

      const finalX = currentGsapX + (targetCenterX - currentCenterX);
      const finalY = currentGsapY + (targetCenterY - currentCenterY);

      // Continuous, visible transformation: moves diagonally and elegantly reduces in scale across space
      gsap.to(movingLogo, {
        x: finalX,
        y: finalY,
        scale: targetScale,
        duration: flightDuration,
        ease: "power2.inOut",
        onComplete: () => {
          // Logo has reached top-left navbar position!
          window.dispatchEvent(new CustomEvent("unifolio-logo-docked"));

          // Now fade out the intro backdrop overlay cleanly
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => {
              setIsVisible(false);
              window.dispatchEvent(new CustomEvent("unifolio-intro-complete"));
              if (onComplete) onComplete();
            },
          });
        },
      });
    });

    // Allow flight duration and overlay fade to finish
    masterTl.to({}, { duration: flightDuration + 0.6 });

    return () => {
      masterTl.kill();
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF8F5] dark:bg-[#000000] pointer-events-none select-none overflow-hidden"
    >
      {/* Moving Brand Container: Cinematic monumental centerpiece scale */}
      <div
        ref={movingLogoRef}
        style={{
          transform: "translate3d(-10.7545%, 0, 0)",
          transformOrigin: "50% 50%",
        }}
        className="relative flex flex-row items-center justify-center will-change-transform aspect-[2041/463] w-[340px] sm:w-[500px] md:w-[640px] lg:w-[760px] xl:w-[840px] max-w-[88vw]"
      >
        {/* Left Letters: UNIF (emerges expanding towards the left - completely hidden at initial load) */}
        <div
          ref={unifWrapperRef}
          style={{
            width: "51.44537%",
            height: "100%",
            opacity: 0,
            clipPath: "inset(0% 0% 0% 100%)",
            WebkitClipPath: "inset(0% 0% 0% 100%)",
          }}
          className="relative h-full overflow-hidden shrink-0 z-10 pointer-events-none opacity-0"
        >
          <div
            ref={unifInnerRef}
            style={{ transform: "translate3d(35px, 0, 0)" }}
            className="w-full h-full flex items-center justify-end will-change-transform"
          >
            {/* Black UNIF for Light Mode */}
            <Image
              src="/Logo/logo-unif-dark.png"
              alt="Unif"
              width={1050}
              height={463}
              priority
              className="w-full h-full object-contain select-none block dark:hidden"
            />
            {/* White UNIF for Dark Mode */}
            <Image
              src="/Logo/logo-unif-white.png"
              alt="Unif"
              width={1050}
              height={463}
              priority
              className="w-full h-full object-contain select-none hidden dark:block"
            />
          </div>
        </div>

        {/* Center: The Stationary Ring (ONLY element visible at initial page load) */}
        <div
          ref={ringWrapperRef}
          style={{ width: "18.61832%", height: "100%", opacity: 1 }}
          className="relative h-full shrink-0 z-20 flex items-center justify-center pointer-events-none opacity-100"
        >
          {/* Subtle Emerald Ambient Glow */}
          <div
            ref={ringHaloRef}
            className="absolute inset-[-15%] rounded-full bg-[#22C55E]/15 dark:bg-[#22C55E]/30 blur-lg opacity-0 pointer-events-none"
          />

          {/* Stationary Base Arc (from 3 o'clock around clockwise to 12 o'clock) */}
          <div ref={mainBaseRef} className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
            <Image
              src="/Logo/logo-ring-main-black.png"
              alt="Unifolio Ring Base"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none block dark:hidden drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            />
            <Image
              src="/Logo/logo-ring-main-white.png"
              alt="Unifolio Ring Base"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none hidden dark:block drop-shadow-[0_0_22px_rgba(34,197,94,0.45)]"
            />
          </div>

          {/* Complete Solid Ring at start (matching final logo exactly in size, position, thickness, and geometry) */}
          <div ref={solidRingRef} className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
            <Image
              src="/Logo/complete-solid-black-ring.png"
              alt="Complete Solid Ring"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none block dark:hidden drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            />
            <Image
              src="/Logo/complete-solid-white-ring.png"
              alt="Complete Solid Ring"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none hidden dark:block drop-shadow-[0_0_22px_rgba(34,197,94,0.45)]"
            />
          </div>

          {/* Top-right segment that physically separates/pulls out along its circular path */}
          <div
            ref={segmentRef}
            style={{
              transformOrigin: "49.7368% 59.0713%",
            }}
            className="absolute inset-0 w-full h-full will-change-transform pointer-events-none"
          >
            <Image
              src="/Logo/logo-ring-segment.png"
              alt="Unifolio Ring Segment"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none drop-shadow-[0_0_16px_rgba(34,197,94,0.35)]"
            />
          </div>

          {/* Final settled ring: exact existing Unifolio logo shown in the reference image */}
          <div ref={finalRingRef} className="absolute inset-0 w-full h-full opacity-0 pointer-events-none">
            {/* Black Ring for Light Mode (Full black ring body + green arc) */}
            <Image
              src="/Logo/logo-ring-dark.png"
              alt="Unifolio Ring"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none block dark:hidden drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            />
            {/* White Ring for Dark Mode (Full white ring body + green arc) */}
            <Image
              src="/Logo/logo-ring-white.png"
              alt="Unifolio Ring"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none hidden dark:block drop-shadow-[0_0_22px_rgba(34,197,94,0.45)]"
            />
          </div>
        </div>


        {/* Right Letters: LIO (emerges expanding towards the right - completely hidden at initial load) */}
        <div
          ref={lioWrapperRef}
          style={{
            width: "29.93631%",
            height: "100%",
            opacity: 0,
            clipPath: "inset(0% 100% 0% 0%)",
            WebkitClipPath: "inset(0% 100% 0% 0%)",
          }}
          className="relative h-full overflow-hidden shrink-0 z-10 pointer-events-none opacity-0"
        >
          <div
            ref={lioInnerRef}
            style={{ transform: "translate3d(-25px, 0, 0)" }}
            className="w-full h-full flex items-center justify-start will-change-transform"
          >
            {/* Black LIO for Light Mode */}
            <Image
              src="/Logo/logo-lio-dark.png"
              alt="lio"
              width={611}
              height={463}
              priority
              className="w-full h-full object-contain select-none block dark:hidden"
            />
            {/* White LIO for Dark Mode */}
            <Image
              src="/Logo/logo-lio-white.png"
              alt="lio"
              width={611}
              height={463}
              priority
              className="w-full h-full object-contain select-none hidden dark:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
