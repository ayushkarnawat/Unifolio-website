"use client";

import { useRef, useEffect } from "react";

interface HeroApertureVisualProps {
  onRingMounted?: (element: HTMLElement) => void;
  isPaused?: boolean;
}

export function HeroApertureVisual({
  onRingMounted,
  isPaused = false,
}: HeroApertureVisualProps) {
  const videoLightRef = useRef<HTMLVideoElement | null>(null);
  const ringAnchorRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(isPaused);

  // Inform parent of ring anchor position for pixel-perfect zoom tracking
  useEffect(() => {
    if (ringAnchorRef.current && onRingMounted) {
      onRingMounted(ringAnchorRef.current);
    }
  }, [onRingMounted]);

  useEffect(() => {
    const vLight = videoLightRef.current;
    if (!vLight) return;

    vLight.muted = true;
    vLight.defaultMuted = true;
    vLight.volume = 0;

    if (!isPausedRef.current) {
      vLight.play().catch(() => {});
    }
  }, []);

  // Pause playback when hero transition completes to save GPU / CPU
  useEffect(() => {
    isPausedRef.current = isPaused;
    const vLight = videoLightRef.current;
    if (!vLight) return;

    if (isPaused) {
      vLight.pause();
    } else {
      vLight.play().catch(() => {});
    }
  }, [isPaused]);

  return (
    <div className="relative w-full h-full select-none pointer-events-none overflow-hidden flex items-center justify-center bg-[#FAF8F5]">
      {/* Video Visual Container: Seamless full bleed positioned so ring center aligns precisely with 57.0% X without exposing any video borders */}
      <div className="absolute inset-y-0 w-[116%] -left-[1.57%] flex items-center justify-center pointer-events-none">
        <video
          ref={videoLightRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-[57%_48%] select-none pointer-events-none"
        >
          <source src="/Final%20Hero%20Apeture%20Light.mp4?v=3" type="video/mp4" />
        </video>
      </div>

      {/* Ring Aperture Center Anchor for GSAP Zoom (Scale 1 -> 8.5) */}
      <div
        ref={ringAnchorRef}
        id="hero-ring-portal"
        className="absolute pointer-events-none w-2 h-2"
        style={{
          left: "57.0%",
          top: "48.0%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Edge Blending Overlays for Light Mode: Fades video edges smoothly into #FAF8F5 (top, bottom, right only; left document entry path completely clean and unmasked) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/50 to-transparent z-10" />
    </div>
  );
}
