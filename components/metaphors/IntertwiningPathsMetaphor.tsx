"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";

export function IntertwiningPathsMetaphor({
  className = "w-full max-w-[560px]",
}: {
  className?: string;
}) {
  const [activeStream, setActiveStream] = useState<string | null>(null);

  const streams = [
    {
      id: "personal",
      label: "Individual Goals",
      color: "#2E7D4E",
      desc: "Retirement equity, ESOP liquidation, and tax-loss harvesting.",
    },
    {
      id: "family",
      label: "Family Household",
      color: "#8CD49E",
      desc: "Spouse folios, child education corpus, and shared real estate buffers.",
    },
    {
      id: "trust",
      label: "Advisor / RIA Co-Pilot",
      color: "#D4AF37",
      desc: "Independent fiduciary oversight with shared holistic visibility.",
    },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[#EAF5ED]/50 rounded-[32px] blur-2xl pointer-events-none" />

      {/* Main Editorial Container */}
      <div className="relative w-full rounded-[28px] border-[1.8px] border-[#1C241E] bg-[#FFFFFF] p-6 sm:p-8 shadow-[3px_5px_0px_rgba(28,36,30,0.05)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C241E]/10 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#2E7D4E]" />
            <span className="font-serif text-sm font-semibold tracking-wide text-[#1C241E]">
              Connected Financial Lives
            </span>
          </div>

          <span className="font-handwriting text-base text-[#2E7D4E]">
            Intertwined, never tangled
          </span>
        </div>

        {/* Interactive Intertwining Ribbon Canvas */}
        <div className="relative h-[250px] sm:h-[270px] w-full flex items-center justify-center">
          <svg
            viewBox="0 0 400 240"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            {/* Background Texture Guideline Arc */}
            <path
              d="M 20 120 C 120 120, 280 120, 380 120"
              stroke="#1C241E"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.15"
            />

            {/* Ribbon 1: Individual Core (Deep Forest Green) */}
            <motion.path
              d="M 30 70 C 100 40, 160 160, 240 100 C 300 50, 340 110, 370 120"
              stroke="#2E7D4E"
              strokeWidth={activeStream === "personal" ? "4.5" : "2.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={activeStream && activeStream !== "personal" ? 0.3 : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, ease: "easeInOut" }}
            />

            {/* Ribbon 2: Family / Household (Bright Mint) */}
            <motion.path
              d="M 30 140 C 90 180, 150 70, 220 140 C 290 200, 330 130, 370 120"
              stroke="#8CD49E"
              strokeWidth={activeStream === "family" ? "4.5" : "3"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={activeStream && activeStream !== "family" ? 0.3 : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.1, ease: "easeInOut" }}
            />

            {/* Ribbon 3: Advisor / RIA Fiduciary (Warm Gold Accent) */}
            <motion.path
              d="M 30 200 C 110 190, 180 120, 250 140 C 310 160, 340 130, 370 120"
              stroke="#D4AF37"
              strokeWidth={activeStream === "trust" ? "4" : "2.2"}
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeOpacity={activeStream && activeStream !== "trust" ? 0.3 : 0.85}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />

            {/* Shared Convergence Nexus Point (Right Anchor) */}
            <g transform="translate(370, 120)">
              {/* Converged Bullseye / Target Knot */}
              <circle cx="0" cy="0" r="16" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.8" />
              <circle cx="0" cy="0" r="8" fill="#8CD49E" stroke="#2E7D4E" strokeWidth="1.4" />
              <circle cx="0" cy="0" r="3.5" fill="#1C241E" />
              {/* Radiating Sparkles */}
              <path d="M 0 -20 V -14 M 0 20 V 14 M -20 0 H -14 M 20 0 H 14" stroke="#2E7D4E" strokeWidth="1.4" strokeLinecap="round" />
            </g>

            {/* Mid-Journey Intersecting Nodes */}
            <g transform="translate(240, 100)" className="cursor-pointer">
              <circle cx="0" cy="0" r="6" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
              <circle cx="0" cy="0" r="2.5" fill="#2E7D4E" />
            </g>

            <g transform="translate(220, 140)" className="cursor-pointer">
              <circle cx="0" cy="0" r="6" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
              <circle cx="0" cy="0" r="2.5" fill="#8CD49E" />
            </g>
          </svg>

          {/* Handwritten Annotation Notes */}
          <div className="absolute top-3 left-6 pointer-events-none hidden sm:block">
            <span className="font-handwriting text-lg text-[#1C241E] rotate-[-2deg] block">
              Distinct journeys ↗
            </span>
          </div>

          <div className="absolute bottom-4 right-16 pointer-events-none hidden sm:block">
            <span className="font-handwriting text-lg text-[#2E7D4E] rotate-[2deg] block">
              One shared horizon ★
            </span>
          </div>
        </div>

        {/* Interactive Stream Selector Tabs & Explanatory Micro-Copy */}
        <div className="mt-1 pt-3 border-t border-[#1C241E]/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {streams.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStream(activeStream === s.id ? null : s.id)}
                  onMouseEnter={() => setActiveStream(s.id)}
                  onMouseLeave={() => setActiveStream(null)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-sans transition-all border ${
                    activeStream === s.id
                      ? "border-[#1C241E] bg-[#1C241E] text-white shadow-xs"
                      : "border-[#1C241E]/15 bg-[#FAF8F5] text-[#525E55] hover:border-[#1C241E]"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#2E7D4E] bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#8CD49E]/40 shrink-0">
              <Sparkles className="h-3 w-3" />
              <span>Multi-PAN Unified</span>
            </div>
          </div>

          <p className="mt-2 text-xs font-sans text-[#525E55] leading-relaxed">
            {activeStream === "personal"
              ? streams[0].desc
              : activeStream === "family"
              ? streams[1].desc
              : activeStream === "trust"
              ? streams[2].desc
              : "Multiple accounts and life goals flow together without cross-contamination or spreadsheet chaos."}
          </p>
        </div>
      </div>
    </div>
  );
}
