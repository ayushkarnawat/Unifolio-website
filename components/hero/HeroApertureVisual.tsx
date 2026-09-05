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

  // Which theme's video is actually decoding right now. Only one video ever
  // plays at a time - the other stays paused (but fully buffered via
  // preload="auto") until a theme swap needs it. Playing both continuously
  // forces the browser to decode two full streams at once, which is what
  // caused the in-browser stutter even though each file plays smoothly on
  // its own.
  const activeThemeRef = useRef<"light" | "dark">("light");
  const isPausedRef = useRef(isPaused);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inform parent of ring anchor position for pixel-perfect zoom tracking
  useEffect(() => {
    if (ringAnchorRef.current && onRingMounted) {
      onRingMounted(ringAnchorRef.current);
    }
  }, [onRingMounted]);

  useEffect(() => {
    const vLight = videoLightRef.current;
    const vDark = videoDarkRef.current;
    if (!vLight || !vDark) return;

    [vLight, vDark].forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
    });

    // The blocking theme script in <head> already applied the persisted
    // theme class before hydration, so this reflects the real state.
    const isDark = document.documentElement.classList.contains("dark");
    activeThemeRef.current = isDark ? "dark" : "light";

    const active = isDark ? vDark : vLight;
    const inactive = isDark ? vLight : vDark;

    if (!isPausedRef.current) {
      active.play().catch(() => {});
    }
    inactive.pause();

    // Swap which video is decoding whenever the theme actually changes,
    // instead of resyncing currentTime on a repeating timer. A single seek
    // at the moment of the swap is cheap; the previous approach re-seeked
    // the hidden video on every timeupdate tick, and those repeated seeks
    // were competing with the visible video for decode resources.
    const handleThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<{ theme?: "light" | "dark" }>).detail;
      const nextTheme =
        detail?.theme ?? (document.documentElement.classList.contains("dark") ? "dark" : "light");

      if (nextTheme === activeThemeRef.current) return;

      const outgoing = activeThemeRef.current === "dark" ? vDark : vLight;
      const incoming = nextTheme === "dark" ? vDark : vLight;
      activeThemeRef.current = nextTheme;

      try {
        incoming.currentTime = outgoing.currentTime;
      } catch {
        // Ignore seeks attempted before the incoming video's metadata is ready
      }

      if (!isPausedRef.current) {
        incoming.play().catch(() => {});
      }

      // Keep the outgoing video playing until the CSS opacity crossfade
      // (duration-700) finishes so the swap stays visually seamless, then
      // pause it to free up decode resources.
      if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
      swapTimeoutRef.current = setTimeout(() => {
        outgoing.pause();
      }, 750);
    };

    window.addEventListener("unifolio-theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("unifolio-theme-change", handleThemeChange);
      if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
    };
  }, []);

  // Pause playback when hero transition completes to save GPU / CPU; only
  // ever resume the currently active (visible) video, never both.
  useEffect(() => {
    isPausedRef.current = isPaused;

    const vLight = videoLightRef.current;
    const vDark = videoDarkRef.current;
    if (!vLight || !vDark) return;

    if (isPaused) {
      vLight.pause();
      vDark.pause();
    } else {
      const active = activeThemeRef.current === "dark" ? vDark : vLight;
      active.play().catch(() => {});
    }
  }, [isPaused]);

  return (
    <div className="relative w-full h-full select-none pointer-events-none overflow-hidden flex items-center justify-center bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500">
      {/* Video Visual Container: Seamless full bleed shifted right */}
      <div className="relative w-full h-full flex items-center justify-center translate-x-[6%]">
        {/* Light Mode Video Asset (White background blended into #FAF8F5 alabaster) */}
        <div className="absolute inset-0 w-full h-full transition-opacity duration-700 opacity-100 dark:opacity-0 pointer-events-none transform-gpu will-change-[opacity] [mask-image:radial-gradient(ellipse_90%_88%_at_66.5%_48%,black_52%,rgba(0,0,0,0.85)_75%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_90%_88%_at_66.5%_48%,black_52%,rgba(0,0,0,0.85)_75%,transparent_100%)]">
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

        {/* Dark Mode Video Asset (True Black Background with Enhanced Obsidian Sculptural Ring) */}
        <div className="absolute inset-0 w-full h-full transition-opacity duration-700 opacity-0 dark:opacity-100 pointer-events-none transform-gpu will-change-[opacity] [mask-image:radial-gradient(ellipse_94%_92%_at_66.5%_48%,black_65%,rgba(0,0,0,0.92)_85%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_94%_92%_at_66.5%_48%,black_65%,rgba(0,0,0,0.92)_85%,transparent_100%)]">
          <video
            ref={videoDarkRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-[66%_48%] select-none pointer-events-none"
          >
            <source src="/Final%20Hero%20Apeture%20Dark.mp4" type="video/mp4" />
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
