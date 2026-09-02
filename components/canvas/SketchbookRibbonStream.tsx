"use client";

import { motion } from "framer-motion";

interface SketchbookRibbonStreamProps {
  progress: number; // 0.0 to 1.0
  className?: string;
}

export function SketchbookRibbonStream({
  progress = 0,
  className = "",
}: {
  progress?: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Soft mint aura backdrop path */}
        <motion.path
          d="M-50 180 C320 220 540 80 720 180 C920 280 1140 120 1500 240"
          stroke="#DCFCE7"
          strokeWidth="28"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        {/* Wavy primary hand-drawn dashed path */}
        <motion.path
          d="M-50 180 C320 220 540 80 720 180 C920 280 1140 120 1500 240"
          stroke="#86EFAC"
          strokeWidth="2.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
        />

        {/* Solid animated green ink line drawn based on scroll progress */}
        <motion.path
          d="M-50 180 C320 220 540 80 720 180 C920 280 1140 120 1500 240"
          stroke="#22C55E"
          strokeWidth="3.2"
          strokeLinecap="round"
          style={{
            pathLength: progress,
          }}
        />

        {/* Milestone Node 1: Origin */}
        <g transform="translate(180, 195)">
          <circle cx="0" cy="0" r="12" fill="#FFFFFF" stroke="#11181C" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="5" fill="#22C55E" />
        </g>

        {/* Milestone Node 2: Convergence */}
        <g transform="translate(540, 115)">
          <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke={progress > 0.25 ? "#22C55E" : "#11181C"} strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill={progress > 0.25 ? "#22C55E" : "#DCFCE7"} />
          <path d="M-4 0 H4 M0 -4 V4" stroke="#11181C" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Milestone Node 3: Dissection */}
        <g transform="translate(920, 240)">
          <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke={progress > 0.5 ? "#22C55E" : "#11181C"} strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill={progress > 0.5 ? "#22C55E" : "#DCFCE7"} />
        </g>

        {/* Milestone Node 4: Truth */}
        <g transform="translate(1260, 160)">
          <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke={progress > 0.75 ? "#22C55E" : "#11181C"} strokeWidth="2" />
          <circle cx="0" cy="0" r="8" fill={progress > 0.75 ? "#22C55E" : "#DCFCE7"} />
          <circle cx="0" cy="0" r="3" fill="#11181C" />
        </g>

        {/* Floating Pencil Sparkles along the ribbon */}
        <g transform="translate(360, 140)">
          <path d="M0 -8 V8 M-8 0 H8" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <g transform="translate(740, 210)">
          <path d="M0 -6 V6 M-6 0 H6" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <g transform="translate(1100, 190)">
          <path d="M0 -8 V8 M-8 0 H8" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
