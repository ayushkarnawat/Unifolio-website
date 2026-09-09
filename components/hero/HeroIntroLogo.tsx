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
  const solidRingRef = useRef<HTMLDivElement | null>(null);
  const mainBaseRef = useRef<HTMLDivElement | null>(null);
  const segmentRef = useRef<HTMLDivElement | null>(null);
  const segmentBlackRef = useRef<HTMLDivElement | null>(null);
  const segmentGreenRef = useRef<HTMLDivElement | null>(null);
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
    const solidRing = solidRingRef.current;
    const mainBase = mainBaseRef.current;
    const segment = segmentRef.current;
    const segmentBlack = segmentBlackRef.current;
    const segmentGreen = segmentGreenRef.current;
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
    // 1. Complete solid black ring in center (no green, no gaps, flat and clean)
    // 2. Top-right segment physically pulls/separates out along circular path, turns #22C55E, settles into exact Unifolio logo
    // 3. Letters emerge from behind the ring (expanding outward horizontally) - EXACT existing expansion animation
    // 4. Hold on the completed centered logo (~1.1s)
    // 5. Deliberate flight to top-left navbar (~1.95s)
    const masterTl = gsap.timeline();

    // Initial setup in GSAP (guaranteeing exact alignment with DOM styles)
    gsap.set(overlay, { opacity: 1 });
    gsap.set(movingLogo, { x: initialCenterX, y: 0, scale: 1, transformOrigin: "50% 50%" });

    // Step 1: Ring alone is already visible in the center
    gsap.set(ringWrapper, { scale: 1, opacity: 1, filter: "blur(0px)" });

    // Complete solid ring at start: THE ONLY visible element, matching the final logo in geometry, size, position
    if (solidRing) gsap.set(solidRing, { opacity: 1 });
    if (mainBase) gsap.set(mainBase, { opacity: 0 });
    if (finalRing) gsap.set(finalRing, { opacity: 0 });
    if (segment) {
      gsap.set(segment, {
        opacity: 0,
        scale: 0.955,
        rotation: -3.0,
        transformOrigin: "49.0% 59.935%",
      });
    }
    if (segmentBlack) gsap.set(segmentBlack, { opacity: 1 });
    if (segmentGreen) gsap.set(segmentGreen, { opacity: 0 });

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

    // 1. Initial State: COMPLETE SOLID BLACK RING — seamless part of ring itself, no green and no gaps (0.0s -> 0.45s)
    masterTl.to({}, { duration: 0.45 });

    // 2. Top-right section physically pulls apart from the ring and expands into final position (0.45s -> 1.30s)
    // Reveal stationary base black arc
    if (mainBase) {
      masterTl.to(mainBase, { opacity: 1, duration: 0.15 }, 0.45);
    }

    // Fade out complete solid ring overlay to cleanly open the two gaps as the segment pulls away
    if (solidRing) {
      masterTl.to(
        solidRing,
        {
          opacity: 0,
          duration: 0.22,
          ease: "power2.inOut",
        },
        0.45
      );
    }

    // Top-right section physically pulls apart from the ring contour
    if (segment) {
      masterTl.set(segment, { opacity: 1 }, 0.45);
      masterTl.to(
        segment,
        {
          scale: 1,
          rotation: 0,
          duration: 0.85,
          ease: "power2.out",
        },
        0.45
      );
    }

    // As it moves into position, that section turns #22C55E
    if (segmentGreen && segmentBlack) {
      masterTl.to(
        segmentGreen,
        {
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
        },
        0.55
      );
      masterTl.to(
        segmentBlack,
        {
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
        },
        0.55
      );
    }

    // 3. Settles into the exact final Unifolio ring logo with the two gaps (1.30s)
    masterTl.call(
      () => {
        if (finalRing) gsap.set(finalRing, { opacity: 1 });
        if (segment) gsap.set(segment, { opacity: 0 });
        if (mainBase) gsap.set(mainBase, { opacity: 0 });
        if (solidRing) gsap.set(solidRing, { opacity: 0 });
      },
      [],
      1.30
    );

    // Brief settling beat on the completed, final logo before expansion begins (1.30s -> 1.55s)
    masterTl.to({}, { duration: 0.25 });

    // 4. CRITICAL: Existing logo expansion animation continues EXACTLY as it does now!
    // No change to timing, trajectory, scale, motion, easing, or subsequent hero animations.
    const expandTime = 1.55;
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF8F5] pointer-events-none select-none overflow-hidden"
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
              className="w-full h-full object-contain select-none block"
            />
          </div>
        </div>

        {/* Center: The Stationary Ring (ONLY element visible at initial page load) */}
        <div
          ref={ringWrapperRef}
          style={{ width: "18.61832%", height: "100%", opacity: 1 }}
          className="relative h-full shrink-0 z-20 flex items-center justify-center pointer-events-none opacity-100"
        >
          {/* Stationary Base Arc (from 3 o'clock around clockwise to 12 o'clock) */}
          <div
            ref={mainBaseRef}
            style={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <Image
              src="/Logo/logo-ring-main-black.png"
              alt="Unifolio Ring Base"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none block"
            />
          </div>

          {/* Complete Solid Ring at start: THE ONLY element visible initially (no green, no gaps, flat and clean) */}
          <div
            ref={solidRingRef}
            style={{ opacity: 1 }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <Image
              src="/Logo/logo-ring-solid-black.png"
              alt="Complete Solid Ring"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none block"
            />
          </div>

          {/* Top-right segment that physically separates/pulls out along its circular path */}
          <div
            ref={segmentRef}
            style={{
              opacity: 0,
              transformOrigin: "49.0% 59.935%",
            }}
            className="absolute inset-0 w-full h-full will-change-transform pointer-events-none"
          >
            {/* Black Segment */}
            <div
              ref={segmentBlackRef}
              style={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src="/Logo/logo-ring-segment-black.png"
                alt="Unifolio Ring Segment Black"
                width={380}
                height={463}
                priority
                className="w-full h-full object-contain select-none block"
              />
            </div>
            {/* Green Segment (#22C55E) */}
            <div
              ref={segmentGreenRef}
              style={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src="/Logo/logo-ring-segment-green.png"
                alt="Unifolio Ring Segment Green"
                width={380}
                height={463}
                priority
                className="w-full h-full object-contain select-none"
              />
            </div>
          </div>

          {/* Final settled ring: exact existing Unifolio logo shown in the reference image */}
          <div
            ref={finalRingRef}
            style={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Black Ring for Light Mode (Full black ring body + green arc) */}
            <Image
              src="/Logo/logo-ring-dark.png"
              alt="Unifolio Ring"
              width={380}
              height={463}
              priority
              className="w-full h-full object-contain select-none block"
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
              className="w-full h-full object-contain select-none block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
