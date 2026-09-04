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
    // 1. Ring alone in center
    // 2. Letters emerge from behind the ring (expanding outward horizontally)
    // 3. Brief hold on the completed centered logo (~0.85s)
    // 4. Smooth, deliberate, slower transition to top-left navbar (~1.45s)
    const masterTl = gsap.timeline();

    // Initial setup in GSAP (guaranteeing exact alignment with DOM styles)
    gsap.set(overlay, { opacity: 1 });
    gsap.set(movingLogo, { x: initialCenterX, y: 0, scale: 1, transformOrigin: "50% 50%" });

    // Step 1: Ring alone is already visible in the center (no full logo flash)
    gsap.set(ringWrapper, { scale: 1, opacity: 1, filter: "blur(0px)" });
    if (ringHalo) gsap.set(ringHalo, { opacity: 0.75, scale: 1 });

    // UNIF clipPath inset completely from left (hidden against ring)
    gsap.set(unifWrapper, {
      clipPath: "inset(0% 0% 0% 100%)",
      opacity: 0,
    });
    gsap.set(unifInner, { x: 35 });

    // LIO clipPath inset completely from right (hidden against ring)
    gsap.set(lioWrapper, {
      clipPath: "inset(0% 100% 0% 0%)",
      opacity: 0,
    });
    gsap.set(lioInner, { x: -25 });

    // 1. Ring alone in center: subtle living emerald pulse (0.0s -> 0.75s)
    if (ringHalo) {
      masterTl.to(
        ringHalo,
        {
          scale: 1.15,
          opacity: 0.95,
          duration: 0.38,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        0
      );
    }
    // Brief hold on ring alone before expansion
    masterTl.to({}, { duration: 0.75 });

    // 2. Expand outward: letters emerge from behind the stationary ring (0.75s -> 1.70s)
    const expandTime = 0.75;
    const expandDuration = 0.95;

    // UNIF: reveals smoothly towards the left
    masterTl.to(
      unifWrapper,
      {
        opacity: 1,
        duration: 0.15,
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
        duration: 0.15,
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
          scale: 1.25,
          opacity: 1,
          duration: 0.45,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        expandTime
      );
    }

    // 3. Brief hold on the completed centered logo (1.70s -> 2.55s)
    masterTl.to({}, { duration: 0.85 });

    // 4. Slowly moves and scales down into the top-left navbar position (2.55s -> 4.0s)
    const flightDuration = 1.45;

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

      // Slower, smoother, more deliberate gliding tween: move diagonally + scale down simultaneously
      gsap.to(movingLogo, {
        x: finalX,
        y: finalY,
        scale: targetScale,
        duration: flightDuration,
        ease: "power3.inOut",
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
      {/* Moving Brand Container: Refined balanced size with breathing room */}
      <div
        ref={movingLogoRef}
        style={{
          transform: "translate3d(-10.7545%, 0, 0)",
          transformOrigin: "50% 50%",
        }}
        className="relative flex flex-row items-center justify-center will-change-transform aspect-[2041/463] w-[230px] sm:w-[280px] md:w-[325px]"
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
            className="absolute inset-[-15%] rounded-full bg-[#22C55E]/15 dark:bg-[#22C55E]/30 blur-lg opacity-50 dark:opacity-80 pointer-events-none"
          />

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
