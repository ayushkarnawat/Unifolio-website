"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { prefersReducedMotion } from "@/lib/gsap";

export function CinematicVideoHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion()) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <section
      className="relative w-full min-h-screen bg-[#000000] overflow-hidden flex items-center justify-center select-none"
      aria-label="Hero Section"
    >
      {/* ========================================================================= */}
      {/* LAYER 1 & 2: HERO CONTAINER & NATIVE ASPECT-RATIO VIDEO CANVAS             */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-[1764px] max-h-screen aspect-[1176/784] flex items-center justify-center bg-[#000000]">
        <video
          ref={videoRef}
          src="/Hero Animation.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-contain pointer-events-none"
          style={{
            backgroundColor: "#000000",
            imageRendering: "auto",
          }}
        />

        {/* ========================================================================= */}
        {/* LAYER 3: TRANSPARENT FUNCTIONAL INTERACTION & NAVIGATION HIT-AREAS         */}
        {/* Coordinated directly over the visually rendered links in the video        */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 pointer-events-auto">
          {/* Top-Left: UNIFOLIO Brand Link */}
          <Link
            href="/"
            className="absolute top-[2.8%] left-[3.2%] w-[12%] h-[6%] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
            aria-label="Unifolio Home"
            title="Unifolio Home"
          />

          {/* Top Navigation Links */}
          <nav className="absolute top-[2.8%] left-[36%] w-[38%] h-[6%] flex items-center justify-between" aria-label="Main Navigation">
            <Link
              href="/features"
              className="w-[22%] h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
              aria-label="Product"
              title="Product"
            />
            <Link
              href="/about"
              className="w-[24%] h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
              aria-label="Approach"
              title="Approach"
            />
            <Link
              href="/about"
              className="w-[20%] h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
              aria-label="About"
              title="About"
            />
            <Link
              href="/features"
              className="w-[22%] h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
              aria-label="Insights"
              title="Insights"
            />
          </nav>

          {/* Top-Right: REQUEST ACCESS • */}
          <Link
            href="/get-started"
            className="absolute top-[2.8%] right-[3.2%] w-[16%] h-[6%] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
            aria-label="Request Access"
            title="Request Access"
          />

          {/* Bottom-Left: REQUEST ACCESS ↗ */}
          <Link
            href="/get-started"
            className="absolute bottom-[3.2%] left-[3.2%] w-[18%] h-[7%] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8CD49E]/50 rounded-sm"
            aria-label="Request Access"
            title="Request Access"
          />
        </div>
      </div>
    </section>
  );
}
