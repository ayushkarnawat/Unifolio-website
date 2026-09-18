"use client";

import { useRef, useEffect, useState } from "react";

interface HeroApertureVisualProps {
  onRingMounted?: (element: HTMLElement) => void;
  isPaused?: boolean;
}

export function HeroApertureVisual({
  onRingMounted,
  isPaused = false,
}: HeroApertureVisualProps) {
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const ringAnchorRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(isPaused);
  const activeVideoRef = useRef<"A" | "B">("A");
  const isCrossfadingRef = useRef(false);
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);

  // Inform parent of ring anchor position for pixel-perfect zoom tracking
  useEffect(() => {
    if (ringAnchorRef.current && onRingMounted) {
      onRingMounted(ringAnchorRef.current);
    }
  }, [onRingMounted]);

  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    [vA, vB].forEach((v) => {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
    });

    if (!isPausedRef.current) {
      vA.play().catch(() => {});
    }

    let rafId: number;
    const CROSSFADE_TRIGGER_BEFORE_END = 0.8;

    const checkTime = () => {
      if (!isPausedRef.current) {
        const active = activeVideoRef.current === "A" ? vA : vB;
        const inactive = activeVideoRef.current === "A" ? vB : vA;

        if (
          active.duration &&
          !isNaN(active.duration) &&
          active.currentTime >= active.duration - CROSSFADE_TRIGGER_BEFORE_END &&
          !isCrossfadingRef.current
        ) {
          isCrossfadingRef.current = true;
          inactive.currentTime = 0;

          const startCrossfade = () => {
            if (activeVideoRef.current === "A") {
              setOpacityA(0);
              setOpacityB(1);
            } else {
              setOpacityA(1);
              setOpacityB(0);
            }

            setTimeout(() => {
              active.pause();
              active.currentTime = 0;
              activeVideoRef.current = activeVideoRef.current === "A" ? "B" : "A";
              isCrossfadingRef.current = false;
            }, 500); // match the CSS duration-500 exactly
          };

          const playPromise = inactive.play();
          if (playPromise && typeof playPromise.then === "function") {
            playPromise.then(startCrossfade).catch(startCrossfade);
          } else {
            startCrossfade();
          }
        }
      }
      rafId = requestAnimationFrame(checkTime);
    };

    rafId = requestAnimationFrame(checkTime);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Pause playback when hero transition completes to save GPU / CPU
  useEffect(() => {
    isPausedRef.current = isPaused;
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    if (isPaused) {
      vA.pause();
      vB.pause();
    } else {
      const active = activeVideoRef.current === "A" ? vA : vB;
      active.play().catch(() => {});
    }
  }, [isPaused]);

  return (
    <div className="relative w-full h-full select-none pointer-events-none overflow-hidden flex items-center justify-center bg-[#FAF8F5]">
      {/* Video Visual Container: Seamless dual-buffered crossfade loop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <video
          ref={videoARef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500 ease-in-out"
          style={{
            transform: "scale(1.28) translateX(11vw)",
            transformOrigin: "center center",
            opacity: opacityA,
          }}
        >
          <source src="/Final%20Hero%20Apeture%20Light.mp4?v=3" type="video/mp4" />
        </video>

        <video
          ref={videoBRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500 ease-in-out"
          style={{
            transform: "scale(1.28) translateX(11vw)",
            transformOrigin: "center center",
            opacity: opacityB,
          }}
        >
          <source src="/Final%20Hero%20Apeture%20Light.mp4?v=3" type="video/mp4" />
        </video>
      </div>

      {/* Ring Aperture Center Anchor for GSAP Zoom */}
      <div
        ref={ringAnchorRef}
        id="hero-ring-portal"
        className="absolute pointer-events-none w-2 h-2"
        style={{
          left: "62.87%",
          top: "49.12%",
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
