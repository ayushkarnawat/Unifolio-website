"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";

interface HeroTransformationPortalProps {
  onRingMounted?: (element: HTMLElement) => void;
  isPaused?: boolean;
}

// Fragment types reflecting real financial data
type FragmentType =
  | "cas"
  | "chart_statement"
  | "stocks_trade"
  | "insurance_policy"
  | "fd_receipt"
  | "property_photo"
  | "gold_coin"
  | "data_chit"
  | "micro_shard";

interface DataFragment {
  id: string;
  type: FragmentType;
  title?: string;
  badge?: string;
  value?: string;
  // Trajectory parameters (normalized to container width & portal center)
  startXPercent: number; // e.g. -15% to 25%
  startYOffset: number; // -240px to +230px from ring center
  ctrlXPercent: number; // bezier control point X
  ctrlYOffset: number; // bezier control point Y
  speed: number;
  initialProgress: number; // 0 to 1
  rotZ: number; // initial resting tilt
  rotX: number;
  scale: number;
  depthTier: 0 | 1 | 2 | 3; // 0: foreground blurred, 1: sharp midground, 2: background, 3: deep micro
  passBehindRing: boolean;
}

interface OutgoingPanel {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  iconType: "portfolio" | "investments" | "insurance" | "assets" | "goals" | "analytics";
}

// Generate a rich, cinematic field of 36 distinct fragments matching "Hero Aperture" reference
function generateFragmentField(): DataFragment[] {
  const fragments: DataFragment[] = [
    // TIER 0: Heavy Foreground Depth-of-Field (large, blurred bokeh elements at edges)
    {
      id: "fg-cas-blur",
      type: "cas",
      title: "CAS",
      badge: "CAMS",
      startXPercent: -18,
      startYOffset: -210,
      ctrlXPercent: 20,
      ctrlYOffset: -140,
      speed: 0.085,
      initialProgress: 0.08,
      rotZ: -28,
      rotX: 20,
      scale: 1.45,
      depthTier: 0,
      passBehindRing: false,
    },
    {
      id: "fg-chart-blur",
      type: "chart_statement",
      startXPercent: -15,
      startYOffset: 230,
      ctrlXPercent: 22,
      ctrlYOffset: 160,
      speed: 0.09,
      initialProgress: 0.32,
      rotZ: 32,
      rotX: -22,
      scale: 1.5,
      depthTier: 0,
      passBehindRing: false,
    },
    {
      id: "fg-photo-blur",
      type: "property_photo",
      startXPercent: -12,
      startYOffset: -90,
      ctrlXPercent: 18,
      ctrlYOffset: -60,
      speed: 0.088,
      initialProgress: 0.58,
      rotZ: -16,
      rotX: 15,
      scale: 1.4,
      depthTier: 0,
      passBehindRing: false,
    },
    {
      id: "fg-stocks-blur",
      type: "stocks_trade",
      badge: "NSE",
      startXPercent: -14,
      startYOffset: 120,
      ctrlXPercent: 25,
      ctrlYOffset: 80,
      speed: 0.092,
      initialProgress: 0.82,
      rotZ: 24,
      rotX: -18,
      scale: 1.35,
      depthTier: 0,
      passBehindRing: false,
    },

    // TIER 1: Sharp Midground (in focus, rich documents, gold coins, photos, contracts)
    {
      id: "mg-cas-1",
      type: "cas",
      title: "Consolidated Statement",
      badge: "CAS",
      value: "₹ 24,18,000",
      startXPercent: -8,
      startYOffset: -130,
      ctrlXPercent: 32,
      ctrlYOffset: -70,
      speed: 0.1,
      initialProgress: 0.12,
      rotZ: -14,
      rotX: 10,
      scale: 1.05,
      depthTier: 1,
      passBehindRing: false,
    },
    {
      id: "mg-stocks-1",
      type: "stocks_trade",
      title: "Trade Confirmation",
      badge: "STOCKS",
      value: "42 Scrips",
      startXPercent: -6,
      startYOffset: 140,
      ctrlXPercent: 35,
      ctrlYOffset: 80,
      speed: 0.098,
      initialProgress: 0.28,
      rotZ: 22,
      rotX: -12,
      scale: 1.0,
      depthTier: 1,
      passBehindRing: false,
    },
    {
      id: "mg-chart-1",
      type: "chart_statement",
      title: "Mutual Fund NAV",
      badge: "MF",
      value: "+16.8%",
      startXPercent: 2,
      startYOffset: -45,
      ctrlXPercent: 38,
      ctrlYOffset: -20,
      speed: 0.104,
      initialProgress: 0.44,
      rotZ: -8,
      rotX: 6,
      scale: 1.02,
      depthTier: 1,
      passBehindRing: false,
    },
    {
      id: "mg-insurance-1",
      type: "insurance_policy",
      title: "Health & Life Shield",
      badge: "INSURE",
      value: "Active",
      startXPercent: 6,
      startYOffset: -160,
      ctrlXPercent: 40,
      ctrlYOffset: -85,
      speed: 0.096,
      initialProgress: 0.62,
      rotZ: 18,
      rotX: 14,
      scale: 0.95,
      depthTier: 1,
      passBehindRing: true,
    },
    {
      id: "mg-fd-1",
      type: "fd_receipt",
      title: "Bank Deposit",
      badge: "FD",
      value: "7.40%",
      startXPercent: 8,
      startYOffset: 165,
      ctrlXPercent: 42,
      ctrlYOffset: 90,
      speed: 0.102,
      initialProgress: 0.76,
      rotZ: -19,
      rotX: -15,
      scale: 0.92,
      depthTier: 1,
      passBehindRing: false,
    },
    {
      id: "mg-photo-1",
      type: "property_photo",
      title: "Asset Deed",
      badge: "ASSET",
      startXPercent: 12,
      startYOffset: 35,
      ctrlXPercent: 42,
      ctrlYOffset: 15,
      speed: 0.106,
      initialProgress: 0.9,
      rotZ: 11,
      rotX: 8,
      scale: 0.9,
      depthTier: 1,
      passBehindRing: false,
    },

    // Gold Tokens & Coins (as visible in reference image)
    {
      id: "coin-1",
      type: "gold_coin",
      startXPercent: -4,
      startYOffset: 85,
      ctrlXPercent: 30,
      ctrlYOffset: 40,
      speed: 0.11,
      initialProgress: 0.2,
      rotZ: 45,
      rotX: 30,
      scale: 0.85,
      depthTier: 1,
      passBehindRing: false,
    },
    {
      id: "coin-2",
      type: "gold_coin",
      startXPercent: 14,
      startYOffset: -80,
      ctrlXPercent: 40,
      ctrlYOffset: -35,
      speed: 0.115,
      initialProgress: 0.65,
      rotZ: -35,
      rotX: -25,
      scale: 0.75,
      depthTier: 1,
      passBehindRing: true,
    },
    {
      id: "coin-3",
      type: "gold_coin",
      startXPercent: 4,
      startYOffset: 180,
      ctrlXPercent: 36,
      ctrlYOffset: 95,
      speed: 0.108,
      initialProgress: 0.85,
      rotZ: 60,
      rotX: 40,
      scale: 0.8,
      depthTier: 1,
      passBehindRing: false,
    },

    // TIER 2: Dense Background & Semi-Distant Stream (smaller, flowing along curved laser fibers)
    {
      id: "bg-chit-1",
      type: "data_chit",
      title: "LTCG",
      value: "₹ 1.2L",
      startXPercent: -2,
      startYOffset: -185,
      ctrlXPercent: 36,
      ctrlYOffset: -100,
      speed: 0.105,
      initialProgress: 0.05,
      rotZ: -22,
      rotX: 18,
      scale: 0.75,
      depthTier: 2,
      passBehindRing: true,
    },
    {
      id: "bg-cas-2",
      type: "cas",
      badge: "KFIN",
      startXPercent: 5,
      startYOffset: 110,
      ctrlXPercent: 38,
      ctrlYOffset: 55,
      speed: 0.1,
      initialProgress: 0.25,
      rotZ: 16,
      rotX: -14,
      scale: 0.72,
      depthTier: 2,
      passBehindRing: true,
    },
    {
      id: "bg-stocks-2",
      type: "stocks_trade",
      badge: "BSE",
      startXPercent: 10,
      startYOffset: -110,
      ctrlXPercent: 42,
      ctrlYOffset: -50,
      speed: 0.11,
      initialProgress: 0.4,
      rotZ: -15,
      rotX: 12,
      scale: 0.7,
      depthTier: 2,
      passBehindRing: true,
    },
    {
      id: "bg-photo-2",
      type: "property_photo",
      startXPercent: 16,
      startYOffset: 145,
      ctrlXPercent: 44,
      ctrlYOffset: 70,
      speed: 0.102,
      initialProgress: 0.55,
      rotZ: 25,
      rotX: -16,
      scale: 0.68,
      depthTier: 2,
      passBehindRing: true,
    },
    {
      id: "bg-chit-2",
      type: "data_chit",
      title: "DIVIDEND",
      value: "₹ 8,400",
      startXPercent: 18,
      startYOffset: -65,
      ctrlXPercent: 45,
      ctrlYOffset: -30,
      speed: 0.112,
      initialProgress: 0.7,
      rotZ: -12,
      rotX: 8,
      scale: 0.65,
      depthTier: 2,
      passBehindRing: true,
    },
    {
      id: "bg-chart-2",
      type: "chart_statement",
      badge: "NAV",
      startXPercent: 22,
      startYOffset: 85,
      ctrlXPercent: 46,
      ctrlYOffset: 40,
      speed: 0.108,
      initialProgress: 0.85,
      rotZ: 18,
      rotX: -10,
      scale: 0.62,
      depthTier: 2,
      passBehindRing: true,
    },

    // TIER 3: Micro Shards & Fine Floating Data Fragments (density & particles)
    ...Array.from({ length: 12 }).map((_, i) => {
      const isTop = i % 2 === 0;
      const angle = (i / 12) * Math.PI * 2;
      return {
        id: `shard-${i}`,
        type: "micro_shard" as FragmentType,
        startXPercent: -10 + (i * 3.5),
        startYOffset: isTop ? -140 - (i * 8) : 120 + (i * 8),
        ctrlXPercent: 35 + (i * 1.5),
        ctrlYOffset: isTop ? -60 - (i * 3) : 50 + (i * 3),
        speed: 0.11 + (i % 3) * 0.008,
        initialProgress: (i * 0.08) % 1,
        rotZ: Math.sin(angle) * 35,
        rotX: Math.cos(angle) * 20,
        scale: 0.35 + (i % 4) * 0.08,
        depthTier: 3 as const,
        passBehindRing: i % 3 === 0,
      };
    }),
  ];

  return fragments;
}

const OUTGOING_PANELS_DATA: OutgoingPanel[] = [
  {
    id: "panel-portfolio",
    title: "Your Portfolio",
    subtitle: "Consolidated Net Worth",
    tag: "+19.2% CAGR",
    iconType: "portfolio",
  },
  {
    id: "panel-investments",
    title: "Investments",
    subtitle: "Equities • MFs • Gold",
    tag: "Allocated",
    iconType: "investments",
  },
  {
    id: "panel-insurance",
    title: "Insurance",
    subtitle: "Health & Life Cover",
    tag: "Protected",
    iconType: "insurance",
  },
  {
    id: "panel-assets",
    title: "Assets",
    subtitle: "Real Estate & Physical",
    tag: "Verified",
    iconType: "assets",
  },
  {
    id: "panel-goals",
    title: "Goals",
    subtitle: "Retirement & Education",
    tag: "On Track",
    iconType: "goals",
  },
  {
    id: "panel-analytics",
    title: "Tax & Direct",
    subtitle: "Automated Switch",
    tag: "Optimized",
    iconType: "analytics",
  },
];

export function HeroTransformationPortal({
  onRingMounted,
  isPaused = false,
}: HeroTransformationPortalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const fragments = useMemo(() => generateFragmentField(), []);

  // Pass ring element to parent so aperture zoom calculates the exact center
  useEffect(() => {
    if (ringRef.current && onRingMounted) {
      onRingMounted(ringRef.current);
    }
  }, [onRingMounted]);

  // High-performance 60fps physics motion loop
  const [motionTime, setMotionTime] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      setMotionTime((prev) => prev + delta);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none pointer-events-none overflow-hidden"
      style={{ perspective: "1400px" }}
    >
      {/* 1. Curved Fiber Filament Laser Streams (SVG Bezier Conduits) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 1600 1000"
      >
        <defs>
          <linearGradient id="portalLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="60%" stopColor="rgba(34, 197, 94, 0.65)" />
            <stop offset="85%" stopColor="rgba(34, 197, 94, 0.45)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id="outgoingLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.85)" />
            <stop offset="40%" stopColor="rgba(34, 197, 94, 0.5)" />
            <stop offset="85%" stopColor="rgba(34, 197, 94, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Incoming Curved Filaments converging into Portal Center (976, 480) */}
        <g opacity="0.65" filter="url(#laserGlow)">
          <path
            d="M 120, 220 Q 550, 280 976, 480"
            fill="none"
            stroke="url(#portalLaserGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            style={{
              animation: "dashOffset 8s linear infinite",
            }}
          />
          <path
            d="M 180, 360 Q 600, 390 976, 480"
            fill="none"
            stroke="url(#portalLaserGrad)"
            strokeWidth="1.2"
          />
          <path
            d="M 140, 680 Q 580, 600 976, 480"
            fill="none"
            stroke="url(#portalLaserGrad)"
            strokeWidth="1.5"
            strokeDasharray="10 8"
          />
          <path
            d="M 220, 780 Q 640, 680 976, 480"
            fill="none"
            stroke="url(#portalLaserGrad)"
            strokeWidth="1.2"
          />
          <path
            d="M 280, 480 L 976, 480"
            fill="none"
            stroke="url(#portalLaserGrad)"
            strokeWidth="2"
            opacity="0.8"
          />
        </g>

        {/* Outgoing Horizontal Laser Rails extending from Ring to Right */}
        <g opacity="0.85" filter="url(#laserGlow)">
          <line
            x1="976"
            y1="420"
            x2="1600"
            y2="420"
            stroke="url(#outgoingLaserGrad)"
            strokeWidth="1.5"
          />
          <line
            x1="976"
            y1="480"
            x2="1600"
            y2="480"
            stroke="url(#outgoingLaserGrad)"
            strokeWidth="2"
          />
          <line
            x1="976"
            y1="540"
            x2="1600"
            y2="540"
            stroke="url(#outgoingLaserGrad)"
            strokeWidth="1.5"
          />
          <line
            x1="976"
            y1="600"
            x2="1600"
            y2="600"
            stroke="url(#outgoingLaserGrad)"
            strokeWidth="1.2"
          />
        </g>
      </svg>

      {/* 2. BACKGROUND TIER: Fragments passing BEHIND the ring */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {fragments
          .filter((f) => f.passBehindRing)
          .map((frag, idx) => (
            <RenderFragment key={frag.id} frag={frag} time={motionTime} index={idx} />
          ))}
      </div>

      {/* 3. CENTRAL HERO PORTAL: The Dominant, Large 3D Unifolio Ring */}
      <div
        ref={ringRef}
        id="hero-ring-portal"
        className="absolute z-20 pointer-events-none will-change-transform flex items-center justify-center"
        style={{
          left: "61%",
          top: "48%",
          width: "min(560px, 58vh)",
          height: "min(560px, 58vh)",
          transform: "translate(-50%, -50%) rotateY(-18deg) rotateX(6deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Core Event Horizon Glow & Light Suction Center */}
        <div
          className="absolute inset-[15%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.98) 0%, rgba(3,12,7,0.92) 50%, rgba(34,197,94,0.35) 80%, transparent 100%)",
            boxShadow:
              "inset 0 0 45px rgba(34,197,94,0.55), 0 0 65px rgba(34,197,94,0.3)",
          }}
        />

        {/* Ambient Ring Glow Flare */}
        <div
          className="absolute -inset-10 rounded-full bg-[#22C55E]/18 blur-3xl pointer-events-none"
        />

        {/* Bottom Rim Light Reflection on Floor */}
        <div
          className="absolute -bottom-16 w-3/4 h-8 rounded-full bg-[#22C55E]/35 blur-xl pointer-events-none"
        />

        {/* High-Resolution 3D Transparent Unifolio Ring */}
        <Image
          src="/Logo/unifolio-ring-transparent.png"
          alt="Unifolio Ring Portal"
          width={600}
          height={600}
          priority
          className="w-full h-full object-contain select-none block drop-shadow-[0_0_40px_rgba(34,197,94,0.55)]"
        />

        {/* High-Tech Inward Gravitational Light Dust */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { x: -140, y: -60, s: 0.6 },
            { x: -100, y: 55, s: 0.8 },
            { x: -160, y: 20, s: 0.5 },
            { x: -80, y: -90, s: 0.9 },
            { x: -120, y: 110, s: 0.7 },
          ].map((pt, i) => {
            const pullT = (motionTime * 0.45 + i * 0.2) % 1;
            const curX = pt.x * (1 - pullT);
            const curY = pt.y * (1 - pullT);
            const curOp = 1 - pullT;
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(${curX}px, ${curY}px) scale(${pt.s})`,
                  opacity: curOp,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 4. FOREGROUND TIER: Documents passing IN FRONT of the ring into portal */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {fragments
          .filter((f) => !f.passBehindRing)
          .map((frag, idx) => (
            <RenderFragment key={frag.id} frag={frag} time={motionTime} index={idx} />
          ))}
      </div>

      {/* 5. OUTGOING ORGANISED STREAM: Clean, Controlled Perspective Panels */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {OUTGOING_PANELS_DATA.map((panel, idx) => (
          <RenderOutgoingPanel
            key={panel.id}
            panel={panel}
            index={idx}
            total={OUTGOING_PANELS_DATA.length}
            time={motionTime}
          />
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: REFINED DATA / DOCUMENT FRAGMENT (CURVED GRAVITATIONAL FLIGHT)
// =========================================================================
function RenderFragment({
  frag,
  time,
  index,
}: {
  frag: DataFragment;
  time: number;
  index: number;
}) {
  const cycleTime = 8.5; // seconds per complete flight
  const progress = (frag.initialProgress + (time * frag.speed) / cycleTime) % 1;

  // Bezier Trajectory: from (startX, startY) via (ctrlX, ctrlY) to Portal Center (61%, 0)
  const targetX = 60.5;
  const p = progress;
  // Quadratic Bezier interpolation
  const currentX =
    Math.pow(1 - p, 2) * frag.startXPercent +
    2 * (1 - p) * p * frag.ctrlXPercent +
    Math.pow(p, 2) * targetX;

  const currentYOffset =
    Math.pow(1 - p, 2) * frag.startYOffset +
    2 * (1 - p) * p * frag.ctrlYOffset +
    Math.pow(p, 2) * 0; // converges to 0 at ring center

  // Natural organic flutter
  const flutter = Math.sin(time * 2 + index) * 3;
  const currentY = currentYOffset + flutter;

  // Gravitational suction rotation & compression near portal (p > 0.65)
  const isNearPortal = p > 0.65;
  const suction = isNearPortal ? Math.pow((p - 0.65) / 0.35, 2.2) : 0;

  const currentRotZ = frag.rotZ * (1 - suction * 0.8) + flutter;
  const currentRotX = frag.rotX * (1 - suction * 0.8);
  const currentScale = frag.scale * (1 - suction * 0.72);

  // Depth-of-Field Blur according to depth tier
  let blurAmount = 0;
  if (frag.depthTier === 0) {
    blurAmount = 6.5; // heavy foreground bokeh
  } else if (frag.depthTier === 2) {
    blurAmount = 1.2; // subtle background softness
  } else if (frag.depthTier === 3) {
    blurAmount = 2.0; // distant particle softness
  }

  // Opacity: fades in from left, crisp along curve, dissolves into aperture light
  let opacity = 0.95;
  if (p < 0.08) {
    opacity = p / 0.08;
  } else if (p > 0.86) {
    opacity = (1 - p) / 0.14;
  }

  return (
    <div
      className="absolute will-change-transform flex items-center justify-center pointer-events-none"
      style={{
        left: `${currentX}%`,
        top: `calc(48% + ${currentY}px)`,
        transform: `translate(-50%, -50%) rotateZ(${currentRotZ}deg) rotateX(${currentRotX}deg) scale(${currentScale})`,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      {/* 1. CAS / Statement Sheet */}
      {frag.type === "cas" && (
        <div className="w-[84px] sm:w-[94px] h-[112px] sm:h-[126px] rounded bg-[#0D1310]/95 border border-white/20 p-2 shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="font-mono text-[7px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-1 rounded">
              {frag.badge || "CAS"}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          </div>
          <div className="space-y-1 my-auto">
            <div className="h-1 w-4/5 bg-white/30 rounded" />
            <div className="h-1 w-full bg-white/15 rounded" />
            <div className="h-1 w-3/4 bg-white/15 rounded" />
          </div>
          <div className="pt-1 border-t border-white/10 flex justify-between items-center font-mono text-[7px] text-[#8E9B91]">
            <span>Folio</span>
            <span className="text-white font-medium">{frag.value || "₹18.4L"}</span>
          </div>
        </div>
      )}

      {/* 2. Chart / Mutual Fund Statement */}
      {frag.type === "chart_statement" && (
        <div className="w-[78px] sm:w-[88px] h-[106px] sm:h-[118px] rounded bg-[#0F1511]/95 border border-white/20 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center pb-1 border-b border-white/10">
            <span className="font-mono text-[7px] text-[#22C55E] font-bold">MF REPORT</span>
          </div>
          <div className="my-auto h-8 flex items-end gap-1 px-1 border-b border-white/10 pb-1">
            <div className="w-1.5 h-2.5 bg-[#22C55E]/40 rounded-t" />
            <div className="w-1.5 h-4 bg-[#22C55E]/60 rounded-t" />
            <div className="w-1.5 h-6 bg-[#22C55E] rounded-t shadow-[0_0_6px_#22C55E]" />
            <div className="w-1.5 h-5 bg-[#22C55E]/80 rounded-t" />
          </div>
          <div className="pt-0.5 flex justify-between font-mono text-[7px] text-[#8E9B91]">
            <span>NAV</span>
            <span className="text-[#22C55E]">{frag.value || "+16%"}</span>
          </div>
        </div>
      )}

      {/* 3. Stocks Trade Confirmation Note */}
      {frag.type === "stocks_trade" && (
        <div className="w-[76px] sm:w-[84px] h-[98px] sm:h-[110px] rounded bg-[#0C120F]/95 border border-white/20 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/10 pb-1">
            <span className="font-mono text-[7px] font-bold text-blue-400 bg-blue-500/15 px-1 rounded">
              STOCKS
            </span>
          </div>
          <div className="space-y-1 py-1 font-mono text-[6px] text-white/70">
            <div className="flex justify-between">
              <span>HDFC</span>
              <span className="text-[#22C55E]">+1.4%</span>
            </div>
            <div className="flex justify-between">
              <span>TCS</span>
              <span className="text-[#22C55E]">+0.8%</span>
            </div>
          </div>
          <div className="pt-0.5 border-t border-white/10 font-mono text-[6px] text-[#8E9B91] flex justify-between">
            <span>NSE/BSE</span>
            <span className="text-white">Confirmed</span>
          </div>
        </div>
      )}

      {/* 4. Insurance Policy */}
      {frag.type === "insurance_policy" && (
        <div className="w-[74px] sm:w-[82px] h-[96px] sm:h-[108px] rounded bg-[#0D1410]/95 border border-white/20 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center pb-1 border-b border-white/10">
            <span className="font-mono text-[6px] font-bold text-amber-400 uppercase">POLICY</span>
            <div className="w-1 h-1 rounded-full bg-amber-400" />
          </div>
          <div className="space-y-1 my-auto">
            <div className="h-1 w-3/4 bg-white/25 rounded" />
            <div className="h-1 w-full bg-white/15 rounded" />
          </div>
          <div className="pt-0.5 border-t border-white/10 font-mono text-[6px] text-[#22C55E]">
            Covered 100%
          </div>
        </div>
      )}

      {/* 5. Fixed Deposit Slip */}
      {frag.type === "fd_receipt" && (
        <div className="w-[72px] sm:w-[80px] h-[92px] sm:h-[102px] rounded bg-[#0E1310]/95 border border-white/20 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
          <div className="font-mono text-[6px] font-bold text-purple-400 uppercase border-b border-white/10 pb-1">
            FD RECEIPT
          </div>
          <div className="my-auto font-mono text-[9px] text-white font-bold">{frag.value}</div>
          <div className="border-t border-white/10 pt-0.5 font-mono text-[6px] text-[#8E9B91]">
            Guaranteed
          </div>
        </div>
      )}

      {/* 6. Property / Asset Photo Tile */}
      {frag.type === "property_photo" && (
        <div className="w-[82px] sm:w-[92px] h-[64px] sm:h-[72px] rounded bg-[#0A100D]/95 border border-white/20 p-1 shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div className="relative flex-1 w-full bg-gradient-to-tr from-emerald-950 via-slate-800 to-emerald-900 rounded overflow-hidden flex items-center justify-center">
            <span className="font-mono text-[6px] text-white/90 font-medium">Deed Asset</span>
          </div>
          <div className="pt-0.5 flex justify-between font-mono text-[6px] text-[#8E9B91]">
            <span>Property</span>
            <span className="text-[#22C55E]">Verified</span>
          </div>
        </div>
      )}

      {/* 7. Gold Coin / Bullion Token */}
      {frag.type === "gold_coin" && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-100 border border-amber-200/80 shadow-[0_0_15px_rgba(245,158,11,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
          <span className="font-mono text-[7px] sm:text-[8px] font-black text-amber-950">₹</span>
        </div>
      )}

      {/* 8. Data Chit / Dividend Ticket */}
      {frag.type === "data_chit" && (
        <div className="w-14 sm:w-16 h-10 sm:h-11 rounded bg-[#0D1410]/95 border border-white/20 p-1 shadow-[0_8px_18px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <span className="font-mono text-[6px] text-[#8E9B91] uppercase">{frag.title}</span>
          <span className="font-mono text-[7px] text-white font-bold">{frag.value}</span>
        </div>
      )}

      {/* 9. Micro Shard / Fragment */}
      {frag.type === "micro_shard" && (
        <div className="w-3 sm:w-4 h-4 sm:h-5 rounded-sm bg-white/25 border border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: OUTGOING ORGANISED PANEL (CONTROLLED PERSPECTIVE STREAM)
// =========================================================================
function RenderOutgoingPanel({
  panel,
  index,
  total,
  time,
}: {
  panel: OutgoingPanel;
  index: number;
  total: number;
  time: number;
}) {
  const cycleDuration = 12; // seconds per traversal
  const offset = index / total;
  const progress = (time / cycleDuration + offset) % 1;

  // X Coordinate calculation:
  // Ring right threshold is at ~64.5%.
  // Panels travel smoothly toward ~108% (fading out off right edge).
  const startX = 65.5;
  const targetX = 108;
  const currentX = startX + progress * (targetX - startX);

  // Harmonious, calm, synchronised levitation
  const levitation = Math.sin(time * 1.5 + index * 0.6) * 3;

  // Perspective receding scale (panels slightly diminish into distance)
  const perspectiveScale = 0.96 + (1 - progress) * 0.08;

  // Opacity fade in at ring rim, fade out at right edge
  let opacity = 1;
  if (progress < 0.06) {
    opacity = progress / 0.06;
  } else if (progress > 0.88) {
    opacity = (1 - progress) / 0.12;
  }

  return (
    <div
      className="absolute will-change-transform select-none"
      style={{
        left: `${currentX}%`,
        top: `calc(48% + ${levitation}px)`,
        transform: `translate(0, -50%) rotateY(-10deg) scale(${perspectiveScale})`,
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative w-[124px] sm:w-[136px] md:w-[146px] h-[180px] sm:h-[195px] md:h-[210px] rounded-2xl bg-[#09120E]/90 border border-[#22C55E]/50 shadow-[0_20px_45px_rgba(0,0,0,0.95),0_0_24px_rgba(34,197,94,0.22),inset_0_1px_1px_0_rgba(255,255,255,0.3)] backdrop-blur-xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden">
        {/* Top Glint Refraction */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/[0.14] to-transparent" />

        {/* Panel Header */}
        <div>
          <div className="flex items-center justify-between pb-0.5">
            <span className="font-sans font-bold text-xs sm:text-[13px] text-white tracking-wide truncate">
              {panel.title}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
          </div>
          <span className="font-mono text-[8px] sm:text-[9px] text-[#8E9B91] block truncate">
            {panel.subtitle}
          </span>
        </div>

        {/* Panel Visual Intelligence Core */}
        <div className="my-auto py-1 flex flex-col items-center justify-center">
          {panel.iconType === "portfolio" && (
            <div className="w-full h-11 flex items-end justify-center gap-1.5 px-2">
              <div className="w-2 h-4 bg-[#22C55E]/40 rounded-t" />
              <div className="w-2 h-6 bg-[#22C55E]/60 rounded-t" />
              <div className="w-2 h-9 bg-[#22C55E] rounded-t shadow-[0_0_12px_rgba(34,197,94,0.7)]" />
              <div className="w-2 h-7 bg-[#22C55E]/85 rounded-t" />
            </div>
          )}

          {panel.iconType === "investments" && (
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="3.5"
                  strokeDasharray="60 100"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_#22C55E]"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="3.5"
                  strokeDasharray="25 100"
                  strokeDashoffset="-65"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono text-[8px] text-white font-bold">100%</span>
            </div>
          )}

          {panel.iconType === "insurance" && (
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center shadow-[0_0_16px_rgba(34,197,94,0.3)]">
              <svg
                className="w-5 h-5 text-[#22C55E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          )}

          {panel.iconType === "assets" && (
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.12)]">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}

          {panel.iconType === "goals" && (
            <div className="w-full px-1.5 flex flex-col items-center gap-1">
              <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#22C55E] h-full rounded-full shadow-[0_0_8px_#22C55E]"
                  style={{ width: "88%" }}
                />
              </div>
              <span className="font-mono text-[8px] text-[#22C55E] font-medium">88% Achieved</span>
            </div>
          )}

          {panel.iconType === "analytics" && (
            <div className="w-full px-2 flex justify-between items-center font-mono text-[8px] text-white">
              <span>Direct Switch</span>
              <span className="text-[#22C55E]">Save 1.2%</span>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
          <span className="font-mono text-[9px] text-white font-bold">Verified</span>
          <span className="font-mono text-[7px] sm:text-[8px] text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.5 rounded border border-[#22C55E]/30">
            {panel.tag}
          </span>
        </div>
      </div>
    </div>
  );
}
