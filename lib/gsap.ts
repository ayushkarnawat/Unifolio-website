"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

// Register GSAP plugins safely on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip);

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
}

/**
 * Check if the user has requested reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

export { gsap, ScrollTrigger, Flip };
