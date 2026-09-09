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
      {/* Video Visual Container: Seamless full bleed shifted right */}
      <div className="relative w-full h-full flex items-center justify-center translate-x-[6%]">
        {/* Light Mode Video Asset (White background blended into #FAF8F5 alabaster) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none transform-gpu [mask-image:radial-gradient(ellipse_90%_88%_at_66.5%_48%,black_52%,rgba(0,0,0,0.85)_75%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_90%_88%_at_66.5%_48%,black_52%,rgba(0,0,0,0.85)_75%,transparent_100%)]">
          <video
            ref={videoLightRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-[66%_48%] select-none pointer-events-none"
          >
            <source src="/Final%20Hero%20Apeture%20Light.mp4" type="video/mp4" />
          </video>
        </div>
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

      {/* Edge Blending Overlays for Light Mode: Fades video edges into #FAF8F5 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/50 to-transparent z-10" />
    </div>
  );
}
