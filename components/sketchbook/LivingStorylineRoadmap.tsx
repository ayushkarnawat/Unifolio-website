"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface Milestone {
  id: string;
  label: string;
  progress: number;
  description: string;
}

const MILESTONES: Milestone[] = [
  { id: "hero", label: "01 · GENESIS", progress: 0.08, description: "Scattered Holdings" },
  { id: "convergence", label: "02 · CONVERGENCE", progress: 0.32, description: "Every Broker Unfolded" },
  { id: "performance", label: "03 · PERFORMANCE", progress: 0.54, description: "True Net XIRR & Alpha" },
  { id: "insights", label: "04 · DECISION FORK", progress: 0.74, description: "Smart Folio Alerts" },
  { id: "target", label: "05 · IN FOCUS", progress: 0.94, description: "Financial Clarity Target" },
];

export function LivingStorylineRoadmap() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [tracerPos, setTracerPos] = useState<{ x: number; y: number; angle: number }>({
    x: 1080,
    y: 260,
    angle: 0,
  });
  const [currentChapter, setCurrentChapter] = useState(MILESTONES[0]);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // SVG coordinates space is 1440 x 3600
  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      if (!pathRef.current) return;

      try {
        const totalLength = pathRef.current.getTotalLength();
        const currentLength = Math.min(Math.max(latest * totalLength, 0), totalLength);
        const point = pathRef.current.getPointAtLength(currentLength);

        // Calculate tangent angle for arrowhead / motion feel
        const nextPoint = pathRef.current.getPointAtLength(Math.min(currentLength + 2, totalLength));
        const dx = nextPoint.x - point.x;
        const dy = nextPoint.y - point.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        setTracerPos({ x: point.x, y: point.y, angle });

        // Update active milestone
        const active = [...MILESTONES]
          .reverse()
          .find((m) => latest >= m.progress - 0.08) || MILESTONES[0];
        setCurrentChapter(active);
      } catch {
        // Fallback for SSR or non-rendered SVG
      }
    });
  }, [smoothProgress]);

  // SVG Main Narrative Storyline Path
  // Scene 1 (Hero: 0 - 800) -> Scene 2 (Box: 800 - 1500) -> Scene 3 (Performance: 1500 - 2250) -> Scene 4 (Insights: 2250 - 2950) -> Scene 5 (Target: 2950 - 3500)
  const storylinePath = `
    M 1040 260
    C 1200 340, 1260 480, 1140 600
    C 980 720, 780 720, 680 840
    C 560 960, 480 1050, 450 1140
    C 420 1230, 490 1280, 570 1290
    C 680 1300, 840 1260, 940 1340
    C 1020 1420, 920 1560, 720 1660
    C 520 1760, 360 1820, 320 1960
    C 280 2080, 420 2160, 580 2200
    C 740 2240, 860 2340, 840 2480
    C 820 2600, 680 2660, 620 2740
    C 560 2820, 640 2920, 780 2980
    C 920 3040, 980 3160, 860 3280
    C 760 3380, 700 3420, 660 3450
  `;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-10"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 3600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMin slice"
      >
        {/* ======================================================== */}
        {/* 1. FAINT UPCOMING ROADMAP GUIDELINE                      */}
        {/* ======================================================== */}
        <path
          d={storylinePath}
          stroke="#1C241E"
          strokeWidth="1.6"
          strokeDasharray="6 6"
          strokeOpacity="0.14"
          strokeLinecap="round"
        />

        {/* ======================================================== */}
        {/* 2. SCENE 2 FRAGMENTED BRANCHING PATHS (SPROUTING)        */}
        {/* ======================================================== */}
        {/* Branch A: Bank Account Tendril */}
        <motion.path
          d="M 560 960 C 420 980, 340 1060, 440 1140"
          stroke="#2E7D4E"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        {/* Branch B: Exchange/Broker Tendril */}
        <motion.path
          d="M 560 960 C 500 1020, 360 1120, 450 1180"
          stroke="#2E7D4E"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        {/* Branch C: Gold & Mutual Fund Tendril */}
        <motion.path
          d="M 560 960 C 620 1040, 520 1120, 460 1200"
          stroke="#2E7D4E"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />

        {/* Convergence Vortex Indicator Circle at the 'u' Box */}
        <g transform="translate(480, 1260)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="#2E7D4E" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
        </g>

        {/* ======================================================== */}
        {/* 3. SCENE 3 PERFORMANCE ASCENDING STEP-TICKS              */}
        {/* ======================================================== */}
        <g transform="translate(320, 1960)">
          {/* Mini financial ascent step lines */}
          <line x1="-15" y1="20" x2="15" y2="20" stroke="#2E7D4E" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="0" y1="40" x2="30" y2="40" stroke="#2E7D4E" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="20" y1="60" x2="50" y2="60" stroke="#2E7D4E" strokeWidth="1.2" strokeOpacity="0.4" />
        </g>

        {/* ======================================================== */}
        {/* 4. SCENE 4 DECISION FORK SPLIT LOOP                      */}
        {/* ======================================================== */}
        <motion.path
          d="M 840 2480 C 940 2520, 960 2620, 880 2700 C 800 2760, 680 2720, 620 2740"
          stroke="#8CD49E"
          strokeWidth="1.6"
          strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
        />

        {/* ======================================================== */}
        {/* 5. ACTIVE PROGRESSIVE DRAWN INK PATH (MAIN ROADMAP)      */}
        {/* ======================================================== */}
        {/* Invisible reference path for SVG coordinate calculations */}
        <path ref={pathRef} d={storylinePath} fill="none" stroke="transparent" />

        {/* Soft mint aura glow behind drawn line */}
        <motion.path
          d={storylinePath}
          stroke="#8CD49E"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.3"
          style={{ pathLength: smoothProgress }}
        />

        {/* Primary hand-drawn ink stroke drawn by scroll */}
        <motion.path
          d={storylinePath}
          stroke="#2E7D4E"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: smoothProgress }}
        />

        {/* ======================================================== */}
        {/* 6. MILESTONE CHECKPOINT BEACONS                          */}
        {/* ======================================================== */}
        {/* Checkpoint 1: Genesis */}
        <g transform="translate(1040, 260)">
          <circle cx="0" cy="0" r="10" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.6" />
          <circle cx="0" cy="0" r="4.5" fill="#2E7D4E" />
        </g>

        {/* Checkpoint 2: Convergence Box */}
        <g transform="translate(570, 1290)">
          <circle cx="0" cy="0" r="12" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="5" fill="#8CD49E" stroke="#2E7D4E" strokeWidth="1.2" />
        </g>

        {/* Checkpoint 3: Performance Peak */}
        <g transform="translate(320, 1960)">
          <circle cx="0" cy="0" r="12" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="5" fill="#2E7D4E" />
        </g>

        {/* Checkpoint 4: Decision Node */}
        <g transform="translate(840, 2480)">
          <circle cx="0" cy="0" r="12" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="5" fill="#8CD49E" />
        </g>

        {/* Checkpoint 5: Clarity Bullseye Landing */}
        <g transform="translate(660, 3450)">
          <circle cx="0" cy="0" r="14" fill="#FAF8F5" stroke="#2E7D4E" strokeWidth="2" />
          <circle cx="0" cy="0" r="7" fill="#2E7D4E" />
        </g>

        {/* ======================================================== */}
        {/* 7. ACTIVE TRAVELING TRACER NODE (LIVING PEN HEAD)        */}
        {/* ======================================================== */}
        <g transform={`translate(${tracerPos.x}, ${tracerPos.y})`}>
          {/* Pulsing Outer Mint Wash Ring */}
          <motion.circle
            cx="0"
            cy="0"
            r="16"
            fill="#8CD49E"
            fillOpacity="0.4"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Tracer Marker Base */}
          <circle cx="0" cy="0" r="8" fill="#FAF8F5" stroke="#1C241E" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#2E7D4E" />

          {/* Active Ink Directional Arrowhead */}
          <g transform={`rotate(${tracerPos.angle})`}>
            <path
              d="M 6 0 L -2 -3.5 L 0 0 L -2 3.5 Z"
              fill="#2E7D4E"
            />
          </g>

          {/* Little Floating Pencil Star on the Tracer */}
          <g transform="translate(10, -10)">
            <path d="M 0 -4 V 4 M -4 0 H 4" stroke="#2E7D4E" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </g>
      </svg>

      {/* Floating Bottom-Right Active Story Telemetry HUD */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 rounded-full border-[1.5px] border-[#1C241E] bg-[#FAF8F5]/95 px-4 py-2 shadow-sm backdrop-blur-md">
        <div className="flex h-2.5 w-2.5 items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-[#2E7D4E] animate-ping" />
        </div>
        <div className="font-sans text-xs">
          <span className="font-bold text-[#1C241E]">{currentChapter.label}</span>
          <span className="text-[#8E9B91] mx-1.5">·</span>
          <span className="text-[#525E55]">{currentChapter.description}</span>
        </div>
      </div>
    </div>
  );
}
