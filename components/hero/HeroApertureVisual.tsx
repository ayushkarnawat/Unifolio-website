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
  const videoDarkRef = useRef<HTMLVideoElement | null>(null);
  const ringAnchorRef = useRef<HTMLDivElement | null>(null);

  // Inform parent of ring anchor position for pixel-perfect zoom tracking
  useEffect(() => {
    if (ringAnchorRef.current && onRingMounted) {
      onRingMounted(ringAnchorRef.current);
    }
  }, [onRingMounted]);

  // Ensure both videos are strictly muted and play continuously
  useEffect(() => {
    const vLight = videoLightRef.current;
    const vDark = videoDarkRef.current;

    const initVideo = (video: HTMLVideoElement | null) => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (video) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    };

    initVideo(vLight);
    initVideo(vDark);

    // Keep playheads synchronized so switching themes is completely seamless
    const syncVideos = () => {
      if (vLight && vDark) {
        if (Math.abs(vLight.currentTime - vDark.currentTime) > 0.15) {
          vDark.currentTime = vLight.currentTime;
        }
      }
    };

    if (vLight) {
      vLight.addEventListener("timeupdate", syncVideos);
    }

    return () => {
      if (vLight) {
        vLight.removeEventListener("timeupdate", syncVideos);
      }
    };
  }, []);

  // Pause playback when hero transition completes to save GPU / CPU
  useEffect(() => {
    const vLight = videoLightRef.current;
    const vDark = videoDarkRef.current;

    const setPause = (video: HTMLVideoElement | null) => {
      if (!video) return;
      if (isPaused) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    setPause(vLight);
    setPause(vDark);
  }, [isPaused]);

  return (
    <div className="relative w-full h-full select-none pointer-events-none overflow-hidden flex items-center justify-center bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500">
      {/* Video Visual Container: Seamless full bleed shifted right */}
      <div className="relative w-full h-full flex items-center justify-center translate-x-[6%]">
        {/* Light Mode Video Asset (White background blended into #FAF8F5 alabaster) */}
        <div className="absolute inset-0 w-full h-full transition-opacity duration-700 opacity-100 dark:opacity-0 pointer-events-none [mask-image:radial-gradient(ellipse_90%_88%_at_66.5%_48%,black_52%,rgba(0,0,0,0.85)_75%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_90%_88%_at_66.5%_48%,black_52%,rgba(0,0,0,0.85)_75%,transparent_100%)]">
          <video
            ref={videoLightRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-[66%_48%] select-none pointer-events-none"
          >
            <source src="/hero-aperture.mp4" type="video/mp4" />
            <source src="/HERO%20Apeture.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dark Mode Video Asset (True Black Background with Enhanced Obsidian Sculptural Ring) */}
        <div className="absolute inset-0 w-full h-full transition-opacity duration-700 opacity-0 dark:opacity-100 pointer-events-none">
          <video
            ref={videoDarkRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-[66%_48%] select-none pointer-events-none"
          >
            <source src="/hero-aperture-dark.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Ring Aperture Center Anchor for GSAP Zoom (Scale 1 -> 8.5) */}
      <div
        ref={ringAnchorRef}
        id="hero-ring-portal"
        className="absolute pointer-events-none w-2 h-2"
        style={{
          left: "66.5%",
          top: "48.0%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Edge Blending Overlays for Light Mode: Fades video edges into #FAF8F5; completely hidden in Dark Mode where environment is true black */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent dark:opacity-0 z-10 transition-opacity duration-500" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/60 to-transparent dark:opacity-0 z-10 transition-opacity duration-500" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent dark:opacity-0 z-10 transition-opacity duration-500" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/50 to-transparent dark:opacity-0 z-10 transition-opacity duration-500" />
    </div>
  );
}
