"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Sparkles } from "lucide-react";

export function EquilibriumBalanceMetaphor({
  className = "w-full max-w-[560px]",
}: {
  className?: string;
}) {
  const [balanceTilt, setBalanceTilt] = useState<number>(0);
  const [activeShape, setActiveShape] = useState<string | null>(null);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Mint Halo */}
      <div className="absolute inset-0 bg-[#EAF5ED]/50 rounded-[32px] blur-2xl pointer-events-none" />

      {/* Main Editorial Card Container */}
      <div className="relative w-full rounded-[28px] border-[1.8px] border-[#1C241E] bg-[#FFFFFF] p-6 sm:p-8 shadow-[3px_5px_0px_rgba(28,36,30,0.05)] overflow-hidden">
        {/* Header with Editorial Subtitle */}
        <div className="flex items-center justify-between border-b border-[#1C241E]/10 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#2E7D4E]" />
            <span className="font-serif text-sm font-semibold tracking-wide text-[#1C241E]">
              Dynamic Equilibrium
            </span>
          </div>

          <span className="font-handwriting text-base text-[#2E7D4E]">
            Balance over static percentages
          </span>
        </div>

        {/* Hand-Drawn Sculptural Balance Stage */}
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width; // 0 to 1
            setBalanceTilt((relX - 0.5) * 8); // -4 to +4 deg
          }}
          onMouseLeave={() => setBalanceTilt(0)}
          className="relative h-[250px] sm:h-[270px] w-full flex items-center justify-center cursor-ew-resize"
        >
          {/* Subtle Guidelines / Orbit Arc */}
          <svg
            viewBox="0 0 400 240"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            fill="none"
          >
            {/* Upper Harmonic Balance Arc */}
            <path
              d="M 50 180 C 120 70, 280 70, 350 180"
              stroke="#2E7D4E"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeOpacity="0.35"
            />
            {/* Vertical plumb line */}
            <line
              x1="200"
              y1="40"
              x2="200"
              y2="190"
              stroke="#1C241E"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.2"
            />
          </svg>

          {/* Central Fulcrum Stand (Hand-Drawn Tripod / Arch) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <svg viewBox="0 0 100 80" className="w-24 h-20 overflow-visible" fill="none">
              {/* Triangular Stone Base with Hatching */}
              <path
                d="M 50 15 L 20 75 L 80 75 Z"
                fill="#FAF8F5"
                stroke="#1C241E"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M 30 75 L 35 65 M 40 75 L 45 65 M 50 75 L 55 65 M 60 75 L 65 65 M 70 75 L 75 65"
                stroke="#1C241E"
                strokeWidth="1.2"
                strokeOpacity="0.4"
              />
              {/* Fulcrum Pivot Dot */}
              <circle cx="50" cy="15" r="4.5" fill="#2E7D4E" stroke="#1C241E" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Tilting Balance Beam and Sculptural Shapes */}
          <motion.div
            animate={{ rotate: balanceTilt }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            className="absolute top-[82px] w-[340px] sm:w-[380px] origin-center flex items-center justify-between"
          >
            {/* The Main Hand-Drawn Balance Beam */}
            <svg
              viewBox="0 0 380 20"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              fill="none"
            >
              <path
                d="M 10 10 L 370 10"
                stroke="#1C241E"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Central beam notch */}
              <circle cx="190" cy="10" r="3.5" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.6" />
            </svg>

            {/* Left Balance Cluster (Equity / Growth Shapes) */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              onMouseEnter={() => setActiveShape("growth")}
              onMouseLeave={() => setActiveShape(null)}
              className="relative -mt-16 -ml-2 cursor-pointer flex flex-col items-center"
            >
              <svg viewBox="0 0 100 110" className="w-24 h-24 overflow-visible" fill="none">
                {/* Large Sculptural Pebble Stone */}
                <path
                  d="M 50 15 C 75 15, 88 35, 85 65 C 80 90, 35 95, 20 70 C 10 45, 25 15, 50 15 Z"
                  fill="#8CD49E"
                  fillOpacity="0.4"
                  stroke="#1C241E"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                {/* Top Crystal facet */}
                <path
                  d="M 50 25 L 70 45 L 45 60 L 25 40 Z"
                  fill="#FAF8F5"
                  stroke="#1C241E"
                  strokeWidth="1.4"
                />
                {/* Pencil hatch textures */}
                <path
                  d="M 32 45 L 42 55 M 36 50 L 44 58"
                  stroke="#2E7D4E"
                  strokeWidth="1.2"
                />
                {/* Golden ratio leaf flourish */}
                <path
                  d="M 75 35 C 90 25, 95 40, 85 50"
                  stroke="#2E7D4E"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>

              {/* Minimalist Micro-Label */}
              <span className="font-sans text-[10px] font-semibold text-[#1C241E] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#1C241E]/20 mt-[-6px]">
                Growth Vector
              </span>
            </motion.div>

            {/* Right Balance Cluster (Stability / Cashflow / Gold Shapes) */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              onMouseEnter={() => setActiveShape("stability")}
              onMouseLeave={() => setActiveShape(null)}
              className="relative -mt-16 -mr-2 cursor-pointer flex flex-col items-center"
            >
              <svg viewBox="0 0 100 110" className="w-24 h-24 overflow-visible" fill="none">
                {/* Geometrical Hexagonal Prism Pillar */}
                <path
                  d="M 30 20 L 70 20 L 85 50 L 70 80 L 30 80 L 15 50 Z"
                  fill="#EAF5ED"
                  stroke="#1C241E"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 30 20 L 50 50 L 70 20 M 50 50 L 50 80"
                  stroke="#1C241E"
                  strokeWidth="1.4"
                />
                {/* Dense vertical architectural hatching on right flank */}
                <path
                  d="M 55 52 L 68 28 M 58 58 L 74 38 M 62 66 L 78 50 M 64 74 L 72 65"
                  stroke="#2E7D4E"
                  strokeWidth="1.1"
                  strokeOpacity="0.7"
                />
                {/* Floating Gold Pearl Token on top */}
                <circle cx="50" cy="12" r="7" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.5" />
                <circle cx="50" cy="12" r="3.5" fill="#2E7D4E" />
              </svg>

              {/* Minimalist Micro-Label */}
              <span className="font-sans text-[10px] font-semibold text-[#1C241E] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#1C241E]/20 mt-[-6px]">
                Preservation Pillar
              </span>
            </motion.div>
          </motion.div>

          {/* Interactive Tilt Hint Annotation */}
          <div className="absolute top-2 left-6 pointer-events-none hidden sm:block">
            <span className="font-handwriting text-lg text-[#525E55] rotate-[-2deg] block">
              ← Hover to feel dynamic balance →
            </span>
          </div>
        </div>

        {/* Bottom Glimpse & Editorial Takeaway */}
        <div className="mt-1 pt-3 border-t border-[#1C241E]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#525E55]">
          <p className="leading-relaxed">
            {activeShape === "growth"
              ? "Long-term equity engines calibrated to outpace inflation without excess volatility."
              : activeShape === "stability"
              ? "Hedging buffers and liquid reserves anchoring your family’s risk envelope."
              : "Not rigid pie charts—a living, self-adjusting allocation that moves with life."}
          </p>

          <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#2E7D4E] bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#8CD49E]/40 shrink-0">
            <Sparkles className="h-3 w-3" />
            <span>Holistic Equilibrium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
