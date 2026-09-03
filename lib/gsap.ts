"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Observer } from "gsap/Observer";

/**
 * Check if the user has requested reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Register GSAP plugins safely on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, ScrollToPlugin, Observer);

  // Configure smooth default ease
  gsap.defaults({
    ease: "power3.out",
    duration: 0.8,
  });

  // Respect user preference for reduced motion
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });

  // Normalize touch/trackpad/wheel scroll deltas so every pinned ScrollTrigger
  // section (Hero, Stacking Cards, About Metrics) feels the same regardless of
  // input device, and so a fast flick can't blow through pinned content
  // uncontrollably. Skipped for reduced-motion users, who never receive pinned
  // ScrollTriggers in the first place (each section bails out early).
  if (!prefersReducedMotion()) {
    ScrollTrigger.normalizeScroll(true);
  }
}

/**
 * Smoothly scroll to an in-page anchor using GSAP's ScrollToPlugin instead of
 * native CSS smooth-scrolling. Native `scroll-behavior: smooth` runs its own
 * scroll animation outside of GSAP's ticker, which fights ScrollTrigger's pin
 * calculations (especially mid-pin) and causes visible catch-up snapping.
 * Driving the scroll through GSAP keeps it on the same rAF loop ScrollTrigger
 * already uses, so anchor navigation and pinned sections never fight.
 */
export function smoothScrollTo(
  target: string | Element | number,
  options: { offset?: number; duration?: number; ease?: string } = {}
) {
  if (typeof window === "undefined") return;
  const { offset = 0, duration = 0.85, ease = "power2.inOut" } = options;

  if (typeof target === "number") {
    if (prefersReducedMotion()) {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    gsap.to(window, {
      duration,
      ease,
      scrollTo: { y: target, autoKill: true },
      overwrite: "auto",
    });
    return;
  }

  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  if (prefersReducedMotion()) {
    el.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  gsap.to(window, {
    duration,
    ease,
    scrollTo: { y: el, offsetY: offset, autoKill: true },
    overwrite: "auto",
  });
}

/**
 * Helper to create magnetic hover physics for interactive buttons/elements
 */
export function createMagneticEffect(
  element: HTMLElement,
  options: { strength?: number; radius?: number } = {}
) {
  if (prefersReducedMotion()) return () => {};

  const { strength = 0.35, radius = 60 } = options;

  const xTo = gsap.quickTo(element, "x", { duration: 0.5, ease: "power3.out" });
  const yTo = gsap.quickTo(element, "y", { duration: 0.5, ease: "power3.out" });

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.hypot(distX, distY);

    if (distance < radius) {
      xTo(distX * strength);
      yTo(distY * strength);
    } else {
      xTo(0);
      yTo(0);
    }
  };

  const handleMouseLeave = () => {
    xTo(0);
    yTo(0);
  };

  window.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
}

export { gsap, ScrollTrigger, Flip, Observer };
