"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap } from "@/lib/gsap";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  // Persistent track and knob references for GSAP animation
  const knobRef = useRef<HTMLDivElement | null>(null);
  const sunGroupRef = useRef<SVGGElement | null>(null);
  const sunRaysRef = useRef<SVGGElement | null>(null);
  const moonPathRef = useRef<SVGPathElement | null>(null);
  const lightTextRef = useRef<HTMLSpanElement | null>(null);
  const darkTextRef = useRef<HTMLSpanElement | null>(null);
  const lightBgRef = useRef<HTMLDivElement | null>(null);
  const darkBgRef = useRef<HTMLDivElement | null>(null);

  const initialRender = useRef(true);

  // Exact moon crescent path extracted from reference video
  const MOON_PATH =
    "M 13.17,6.29 L 12.69,6.23 L 12.01,6.44 L 11.24,6.85 L 10.45,7.38 L 9.74,7.95 L 9.14,8.53 L 8.62,9.12 L 8.16,9.74 L 7.76,10.38 L 7.4,11.04 L 7.09,11.75 L 6.84,12.48 L 6.64,13.25 L 6.49,14.04 L 6.39,14.85 L 6.36,15.67 L 6.38,16.49 L 6.46,17.3 L 6.61,18.1 L 6.82,18.88 L 7.09,19.63 L 7.42,20.34 L 7.81,21.02 L 8.26,21.67 L 8.76,22.27 L 9.3,22.83 L 9.89,23.36 L 10.51,23.84 L 11.17,24.27 L 11.86,24.66 L 12.57,25.0 L 13.31,25.29 L 14.07,25.53 L 14.84,25.71 L 15.62,25.84 L 16.41,25.92 L 17.21,25.94 L 18.0,25.89 L 18.78,25.79 L 19.56,25.62 L 20.33,25.39 L 21.08,25.08 L 21.81,24.71 L 22.51,24.26 L 23.18,23.73 L 23.82,23.12 L 24.39,22.46 L 24.83,21.81 L 25.07,21.23 L 25.04,20.78 L 24.68,20.52 L 24.04,20.43 L 23.22,20.43 L 22.32,20.45 L 21.46,20.43 L 20.65,20.33 L 19.88,20.17 L 19.14,19.94 L 18.43,19.64 L 17.74,19.26 L 17.07,18.83 L 16.43,18.34 L 15.84,17.79 L 15.28,17.2 L 14.77,16.57 L 14.31,15.9 L 13.91,15.2 L 13.57,14.48 L 13.31,13.74 L 13.11,12.99 L 12.99,12.23 L 12.95,11.46 L 12.98,10.68 L 13.06,9.86 L 13.19,9.01 L 13.34,8.14 L 13.44,7.33 L 13.41,6.68 L 13.17,6.29 Z";

  // 8 radial sun rays angles (at 45deg increments)
  const SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

  // GSAP Driven Physics & State Transitions
  useEffect(() => {
    if (!knobRef.current) return;

    const dark = theme === "dark";

    if (initialRender.current) {
      initialRender.current = false;
      // Immediate setup for initial state (default to Light = knob at left, x: 0)
      gsap.set(knobRef.current, { x: dark ? 42 : 0, scale: 1 });

      if (sunGroupRef.current) {
        gsap.set(sunGroupRef.current, {
          scale: dark ? 0.2 : 1,
          opacity: dark ? 0 : 1,
        });
      }
      if (sunRaysRef.current) {
        gsap.set(sunRaysRef.current, {
          scale: dark ? 0 : 1,
          opacity: dark ? 0 : 1,
          rotation: dark ? 45 : 0,
        });
      }
      if (moonPathRef.current) {
        gsap.set(moonPathRef.current, {
          scale: dark ? 1 : 0.2,
          opacity: dark ? 1 : 0,
          rotation: dark ? 0 : -45,
        });
      }
      if (lightBgRef.current) {
        gsap.set(lightBgRef.current, { opacity: dark ? 0 : 1 });
      }
      if (darkBgRef.current) {
        gsap.set(darkBgRef.current, { opacity: dark ? 1 : 0 });
      }
      if (lightTextRef.current) {
        gsap.set(lightTextRef.current, {
          opacity: dark ? 0 : 1,
          x: dark ? 5 : 0,
        });
      }
      if (darkTextRef.current) {
        gsap.set(darkTextRef.current, {
          opacity: dark ? 1 : 0,
          x: dark ? 0 : -5,
        });
      }
      return;
    }

    const duration = 0.36;
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    if (dark) {
      // Transition from LIGHT to DARK
      // Knob slides smoothly to the right (42px) with subtle elastic stretch
      tl.to(
        knobRef.current,
        {
          x: 42,
          duration,
          ease: "power2.inOut",
        },
        0
      );
      tl.to(
        knobRef.current,
        {
          scaleX: 1.07,
          scaleY: 0.94,
          duration: duration * 0.5,
          ease: "power1.out",
          yoyo: true,
          repeat: 1,
        },
        0
      );

      // Sun icon contracts, rotates clockwise and dissolves
      if (sunGroupRef.current) {
        tl.to(
          sunGroupRef.current,
          {
            scale: 0.2,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          },
          0
        );
      }
      if (sunRaysRef.current) {
        tl.to(
          sunRaysRef.current,
          {
            scale: 0,
            opacity: 0,
            rotation: 45,
            duration: 0.18,
            ease: "power2.in",
          },
          0
        );
      }

      // Moon icon rotates in from -45deg and scales up with slight spring settle
      if (moonPathRef.current) {
        tl.fromTo(
          moonPathRef.current,
          { scale: 0.2, opacity: 0, rotation: -45 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.35,
            ease: "back.out(1.5)",
          },
          0.08
        );
      }

      // Ambient track glow and backdrop crossfade
      if (lightBgRef.current && darkBgRef.current) {
        tl.to(lightBgRef.current, { opacity: 0, duration: 0.32 }, 0);
        tl.to(darkBgRef.current, { opacity: 1, duration: 0.32 }, 0);
      }

      // Crossfade text: "light" exits right, "Dark" enters from left
      if (lightTextRef.current) {
        tl.to(lightTextRef.current, { opacity: 0, x: 5, duration: 0.18 }, 0);
      }
      if (darkTextRef.current) {
        tl.fromTo(
          darkTextRef.current,
          { opacity: 0, x: -5 },
          { opacity: 1, x: 0, duration: 0.26, ease: "power2.out" },
          0.09
        );
      }
    } else {
      // Transition from DARK to LIGHT
      // Knob slides smoothly to the left (0px) with subtle elastic stretch
      tl.to(
        knobRef.current,
        {
          x: 0,
          duration,
          ease: "power2.inOut",
        },
        0
      );
      tl.to(
        knobRef.current,
        {
          scaleX: 1.07,
          scaleY: 0.94,
          duration: duration * 0.5,
          ease: "power1.out",
          yoyo: true,
          repeat: 1,
        },
        0
      );

      // Moon icon shrinks and rotates back out
      if (moonPathRef.current) {
        tl.to(
          moonPathRef.current,
          {
            scale: 0.2,
            opacity: 0,
            rotation: -45,
            duration: 0.18,
            ease: "power2.in",
          },
          0
        );
      }

      // Sun icon expands with rays radiating outward with spring pop
      if (sunGroupRef.current) {
        tl.fromTo(
          sunGroupRef.current,
          { scale: 0.3, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.4)",
          },
          0.08
        );
      }
      if (sunRaysRef.current) {
        tl.fromTo(
          sunRaysRef.current,
          { scale: 0, opacity: 0, rotation: 45 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.36,
            ease: "back.out(1.8)",
          },
          0.09
        );
      }

      // Ambient track glow and backdrop crossfade
      if (lightBgRef.current && darkBgRef.current) {
        tl.to(darkBgRef.current, { opacity: 0, duration: 0.32 }, 0);
        tl.to(lightBgRef.current, { opacity: 1, duration: 0.32 }, 0);
      }

      // Crossfade text: "Dark" exits left, "light" enters from right
      if (darkTextRef.current) {
        tl.to(darkTextRef.current, { opacity: 0, x: -5, duration: 0.18 }, 0);
      }
      if (lightTextRef.current) {
        tl.fromTo(
          lightTextRef.current,
          { opacity: 0, x: 5 },
          { opacity: 1, x: 0, duration: 0.26, ease: "power2.out" },
          0.09
        );
      }
    }
  }, [theme]);

  // Default theme is light before client hydration
  const activeDark = mounted ? isDark : false;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${activeDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={activeDark}
      className={`relative group inline-block select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#22C55E] active:scale-[0.96] transition-transform duration-150 ${className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Outer Pill Track (68px width x 26px height) */}
      <div className="relative w-[68px] h-[26px] rounded-full">
        {/* Track Layer A: Light Mode Vibrant Emerald Green Backlight & #22C55E Glow */}
        <div
          ref={lightBgRef}
          className="absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)",
            boxShadow:
              "0 0 16px rgba(34, 197, 94, 0.45), 0 2px 6px rgba(22, 163, 74, 0.3), inset 0 1px 1.5px rgba(255, 255, 255, 0.6), inset 0 -1px 2px rgba(0, 0, 0, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.45)",
            opacity: activeDark ? 0 : 1,
          }}
        />

        {/* Track Layer B: Dark Mode Deep Emerald Obsidian Backlight & #22C55E Glow */}
        <div
          ref={darkBgRef}
          className="absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #092e15 100%)",
            boxShadow:
              "0 0 18px rgba(34, 197, 94, 0.55), 0 2px 6px rgba(22, 163, 74, 0.4), inset 0 1px 1.5px rgba(255, 255, 255, 0.35), inset 0 -1px 2px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
            opacity: activeDark ? 1 : 0,
          }}
        />

        {/* Text Labels inside Track */}
        {/* "Dark" Label on Left Half */}
        <span
          ref={darkTextRef}
          className="absolute left-[10px] top-1/2 -translate-y-1/2 font-sans font-medium text-[10.5px] text-white tracking-wide pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          style={{ opacity: activeDark ? 1 : 0 }}
        >
          Dark
        </span>

        {/* "light" Label on Right Half */}
        <span
          ref={lightTextRef}
          className="absolute right-[9px] top-1/2 -translate-y-1/2 font-sans font-medium text-[10.5px] text-white tracking-wide pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          style={{ opacity: activeDark ? 0 : 1 }}
        >
          light
        </span>

        {/* Circular Convex Glass Lens Knob (Overlapping 30px diameter disk on 26px track) */}
        <div
          ref={knobRef}
          className="absolute top-[-2px] left-[-2px] w-[30px] h-[30px] rounded-full pointer-events-none will-change-transform"
          style={{
            transform: activeDark ? "translate3d(42px, 0, 0)" : "translate3d(0, 0, 0)",
            background:
              "radial-gradient(120% 120% at 30% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.14) 55%, rgba(255, 255, 255, 0.04) 100%)",
            backdropFilter: "blur(8px) brightness(1.15) saturate(1.15)",
            WebkitBackdropFilter: "blur(8px) brightness(1.15) saturate(1.15)",
            border: "1.5px solid rgba(255, 255, 255, 0.82)",
            boxShadow:
              "0 3px 10px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 1.5px 2.5px rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Specular Curved Highlight on Upper Rim of Glass Lens */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 35% 20%, rgba(255, 255, 255, 0.7) 0%, transparent 60%)",
            }}
          />

          {/* Internal Specular Bevel Line */}
          <div className="absolute inset-[1px] rounded-full border border-white/20 pointer-events-none" />

          {/* Center Icon Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* SVG Canvas for Sun and Moon Icons */}
            <svg
              viewBox="0 0 32 32"
              className="w-[18px] h-[18px] overflow-visible"
              aria-hidden="true"
            >
              {/* Sun Icon Group (Light Mode) */}
              <g
                ref={sunGroupRef}
                style={{
                  transformOrigin: "16px 16px",
                  opacity: activeDark ? 0 : 1,
                  transform: activeDark ? "scale(0.2)" : "scale(1)",
                }}
              >
                {/* Sun Core Disc */}
                <circle cx="16" cy="16" r="5.2" fill="#ffffff" />

                {/* 8 Radial Pill Rays */}
                <g
                  ref={sunRaysRef}
                  style={{
                    transformOrigin: "16px 16px",
                    opacity: activeDark ? 0 : 1,
                    transform: activeDark ? "rotate(45deg) scale(0)" : "rotate(0deg) scale(1)",
                  }}
                >
                  {SUN_RAY_ANGLES.map((angle) => (
                    <line
                      key={angle}
                      x1="16"
                      y1="4.6"
                      x2="16"
                      y2="8.4"
                      stroke="#ffffff"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      transform={`rotate(${angle} 16 16)`}
                    />
                  ))}
                </g>
              </g>

              {/* Moon Crescent Icon (Dark Mode) */}
              <path
                ref={moonPathRef}
                d={MOON_PATH}
                fill="#ffffff"
                style={{
                  transformOrigin: "16px 16px",
                  opacity: activeDark ? 1 : 0,
                  transform: activeDark ? "rotate(0deg) scale(1)" : "rotate(-45deg) scale(0.2)",
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
