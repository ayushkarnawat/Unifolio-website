"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Compass } from "lucide-react";

export function InsightSpotlightMetaphor({
  className = "w-full max-w-[560px]",
}: {
  className?: string;
}) {
  const [activeSpotlight, setActiveSpotlight] = useState<number>(0);

  const insights = [
    {
      id: 0,
      title: "Overlap Elimination",
      note: "Two large cap funds holding 64% identical underlying stocks.",
      annotation: "Identical holdings highlighted ↗",
      x: 100,
      y: 90,
    },
    {
      id: 1,
      title: "Direct Plan Alpha",
      note: "Switching 3 regular folios unlocks ₹42,000 in saved trail commissions annually.",
      annotation: "Hidden 1.2% drag revealed ★",
      x: 230,
      y: 65,
    },
    {
      id: 2,
      title: "Rebalance Opportunity",
      note: "Equity allocation drifted +8% above target threshold during recent bull run.",
      annotation: "Natural rebalance trigger ↓",
      x: 290,
      y: 160,
    },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Mint Halo */}
      <div className="absolute inset-0 bg-[#EAF5ED]/50 rounded-[32px] blur-2xl pointer-events-none" />

      {/* Main Editorial Card */}
      <div className="relative w-full rounded-[28px] border-[1.8px] border-[#1C241E] bg-[#FAF8F5] p-6 sm:p-8 shadow-[3px_5px_0px_rgba(28,36,30,0.05)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C241E]/10 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#2E7D4E]" />
            <span className="font-serif text-sm font-semibold tracking-wide text-[#1C241E]">
              Editorial Focus & Insight Spotlights
            </span>
          </div>

          <span className="font-handwriting text-base text-[#2E7D4E]">
            Marginalia revealing signal
          </span>
        </div>

        {/* The Annotated Manuscript Canvas */}
        <div className="relative h-[250px] sm:h-[270px] w-full flex items-center justify-center">
          <svg
            viewBox="0 0 400 240"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            {/* Background Editorial Script Lines (Representing Underlying Folio Ledger) */}
            <g opacity="0.15">
              <line x1="40" y1="50" x2="360" y2="50" stroke="#1C241E" strokeWidth="1.5" />
              <line x1="40" y1="85" x2="360" y2="85" stroke="#1C241E" strokeWidth="1.5" />
              <line x1="40" y1="120" x2="360" y2="120" stroke="#1C241E" strokeWidth="1.5" />
              <line x1="40" y1="155" x2="360" y2="155" stroke="#1C241E" strokeWidth="1.5" />
              <line x1="40" y1="190" x2="360" y2="190" stroke="#1C241E" strokeWidth="1.5" />
            </g>

            {/* Hand-Drawn Wavy Underline under the active zone */}
            <motion.path
              d="M 50 125 C 100 135, 150 115, 200 130 C 250 145, 300 120, 350 130"
              stroke="#8CD49E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />

            {/* Insight Spotlight Nodes */}
            {insights.map((ins, idx) => {
              const isActive = activeSpotlight === idx;
              return (
                <g
                  key={ins.id}
                  onClick={() => setActiveSpotlight(idx)}
                  className="cursor-pointer"
                >
                  {/* Spotlight Organic Ink Loop Ring */}
                  <motion.ellipse
                    cx={ins.x}
                    cy={ins.y}
                    rx={isActive ? "38" : "24"}
                    ry={isActive ? "28" : "18"}
                    stroke={isActive ? "#2E7D4E" : "#1C241E"}
                    strokeWidth={isActive ? "2.2" : "1.2"}
                    strokeDasharray={isActive ? "none" : "3 3"}
                    fill={isActive ? "#EAF5ED" : "#FFFFFF"}
                    fillOpacity={isActive ? 0.75 : 0.4}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  />

                  {/* Second outer emphasis ring when active */}
                  {isActive && (
                    <motion.ellipse
                      cx={ins.x}
                      cy={ins.y}
                      rx="46"
                      ry="34"
                      stroke="#8CD49E"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                    />
                  )}

                  {/* Center Star / Number Indicator */}
                  <circle
                    cx={ins.x}
                    cy={ins.y}
                    r={isActive ? "6" : "4"}
                    fill={isActive ? "#2E7D4E" : "#525E55"}
                  />

                  {/* Hand-Drawn Arrow pointing to Active Insight */}
                  {isActive && (
                    <g>
                      <path
                        d={`M ${ins.x - 30} ${ins.y + 40} Q ${ins.x - 15} ${ins.y + 25}, ${ins.x - 8} ${ins.y + 12}`}
                        stroke="#2E7D4E"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d={`M ${ins.x - 14} ${ins.y + 16} L ${ins.x - 8} ${ins.y + 12} L ${ins.x - 7} ${ins.y + 20}`}
                        stroke="#2E7D4E"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Dynamic Handwritten Marginal Note */}
          <motion.div
            key={activeSpotlight}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-2 right-4 pointer-events-none"
          >
            <span className="font-handwriting text-xl text-[#2E7D4E] rotate-[1.5deg] block">
              {insights[activeSpotlight].annotation}
            </span>
          </motion.div>
        </div>

        {/* Interactive Focus Selector Pills & Rich Editorial Summary */}
        <div className="mt-1 pt-3 border-t border-[#1C241E]/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {insights.map((ins, idx) => (
                <button
                  key={ins.id}
                  onClick={() => setActiveSpotlight(idx)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-sans transition-all border ${
                    activeSpotlight === idx
                      ? "border-[#1C241E] bg-[#1C241E] text-white shadow-xs font-medium"
                      : "border-[#1C241E]/15 bg-[#FAF8F5] text-[#525E55] hover:border-[#1C241E]"
                  }`}
                >
                  <Lightbulb className={`h-3 w-3 ${activeSpotlight === idx ? "text-[#8CD49E]" : "text-[#525E55]"}`} />
                  <span>{ins.title}</span>
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#2E7D4E] bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#8CD49E]/40 shrink-0">
              <Sparkles className="h-3 w-3" />
              <span>Smart Spotlights</span>
            </div>
          </div>

          <p className="mt-2 text-xs font-sans text-[#525E55] leading-relaxed">
            <strong className="text-[#1C241E]">{insights[activeSpotlight].title}: </strong>
            {insights[activeSpotlight].note}
          </p>
        </div>
      </div>
    </div>
  );
}
