"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

export function EvolvingLineMetaphor({
  className = "w-full max-w-[560px]",
}: {
  className?: string;
}) {
  const [scrubPoint, setScrubPoint] = useState<number>(0.85); // 0 (start/friction) to 1 (clear alpha)
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);

  const milestones = [
    {
      id: "friction",
      x: 65,
      y: 175,
      label: "Fragmented Chaos",
      desc: "4 apps, hidden 1.5% regular commissions, manual spreadsheets.",
    },
    {
      id: "clarity",
      x: 200,
      y: 110,
      label: "One Clean CAS Ingestion",
      desc: "Instant consolidation with complete transaction history.",
    },
    {
      id: "alpha",
      x: 340,
      y: 35,
      label: "Pure Net Compounding",
      desc: "True XIRR calculated after all taxes, fees, and friction.",
    },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Mint Wash Aura */}
      <div className="absolute inset-0 bg-[#EAF5ED]/50 rounded-[32px] blur-2xl pointer-events-none" />

      {/* Main Editorial Card */}
      <div className="relative w-full rounded-[28px] border-[1.8px] border-[#1C241E] bg-[#FAF8F5] p-6 sm:p-8 shadow-[3px_5px_0px_rgba(28,36,30,0.05)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1C241E]/10 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#2E7D4E]" />
            <span className="font-serif text-sm font-semibold tracking-wide text-[#1C241E]">
              The Trajectory of Growth
            </span>
          </div>

          <span className="font-handwriting text-base text-[#2E7D4E]">
            From friction to momentum
          </span>
        </div>

        {/* The Living Hand-Drawn Curve Canvas */}
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setScrubPoint(relX);
          }}
          className="relative h-[250px] sm:h-[270px] w-full flex items-center justify-center cursor-crosshair"
        >
          <svg
            viewBox="0 0 400 240"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            {/* Background Texture: Faint Grid & Compass Ticks */}
            <g opacity="0.25">
              <line x1="40" y1="200" x2="360" y2="200" stroke="#1C241E" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="360" y2="120" stroke="#1C241E" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="40" x2="360" y2="40" stroke="#1C241E" strokeWidth="1" strokeDasharray="3 3" />
            </g>

            {/* Gradient Green Wash under the ascending curve */}
            <path
              d="M 30 190 C 70 195, 110 180, 160 145 C 220 100, 280 65, 360 25 L 360 210 L 30 210 Z"
              fill="#EAF5ED"
              fillOpacity="0.8"
            />

            {/* Frictional Tangled Loops at the Origin (Hidden Broker Drag) */}
            <g opacity="0.4">
              <path
                d="M 30 190 C 45 165, 35 155, 55 170 C 75 185, 60 205, 80 190 C 95 175, 85 160, 105 175"
                stroke="#525E55"
                strokeWidth="1.4"
                strokeDasharray="2 2"
              />
              <path
                d="M 40 180 L 48 186 M 55 178 L 63 184"
                stroke="#525E55"
                strokeWidth="1"
              />
            </g>

            {/* The Main Hand-Drawn Ascending Path */}
            <motion.path
              d="M 30 190 C 80 190, 120 165, 170 135 C 230 95, 290 60, 360 25"
              stroke="#2E7D4E"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />

            {/* Accent Shadow Stroke */}
            <path
              d="M 30 192 C 80 192, 120 167, 170 137 C 230 97, 290 62, 360 27"
              stroke="#8CD49E"
              strokeWidth="6"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />

            {/* Milestone Checkpoint Nodes along the path */}
            {milestones.map((m) => (
              <g
                key={m.id}
                onMouseEnter={() => setHoveredMilestone(m.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
                className="cursor-pointer"
              >
                {/* Checkpoint Halo */}
                <circle
                  cx={m.x}
                  cy={m.y}
                  r="12"
                  fill="#FAF8F5"
                  stroke="#1C241E"
                  strokeWidth="1.6"
                />
                <circle cx={m.x} cy={m.y} r="5" fill="#2E7D4E" />

                {/* Stippled Pencil Sparkles around Alpha Point */}
                {m.id === "alpha" && (
                  <g>
                    <circle cx="365" cy="18" r="1.5" fill="#2E7D4E" />
                    <circle cx="345" cy="12" r="1.5" fill="#2E7D4E" />
                    <circle cx="370" cy="35" r="1.5" fill="#1C241E" />
                    {/* Tiny pencil star */}
                    <path d="M 360 8 V 16 M 356 12 H 364" stroke="#2E7D4E" strokeWidth="1.2" />
                  </g>
                )}
              </g>
            ))}

            {/* Living Pen Stylus Head (Positioned dynamically along scrub or at end) */}
            <g transform={`translate(${30 + scrubPoint * 330}, ${190 - scrubPoint * 165})`}>
              <circle cx="0" cy="0" r="14" fill="#8CD49E" fillOpacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="6" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.8" />
              <circle cx="0" cy="0" r="3" fill="#2E7D4E" />
            </g>
          </svg>

          {/* Floating Handwritten Callouts */}
          <div className="absolute bottom-6 left-8 pointer-events-none hidden sm:block">
            <span className="font-handwriting text-lg text-[#525E55] rotate-[-4deg] block">
              Tangled noise & drag
            </span>
          </div>

          <div className="absolute top-4 right-10 pointer-events-none hidden sm:block">
            <span className="font-handwriting text-xl text-[#2E7D4E] rotate-[3deg] block">
              Pure compound trajectory ↗
            </span>
          </div>
        </div>

        {/* Interactive Scrub Detail / Micro-Glimpse Callout */}
        <div className="mt-1 pt-3 border-t border-[#1C241E]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#525E55]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1C241E]">
              {hoveredMilestone === "friction"
                ? "Frictional Drag:"
                : hoveredMilestone === "clarity"
                ? "Consolidated Flow:"
                : hoveredMilestone === "alpha"
                ? "True Net Alpha:"
                : "Real Growth Metaphor:"}
            </span>
            <span>
              {hoveredMilestone === "friction"
                ? "Tangled regular broker cuts and unverified records."
                : hoveredMilestone === "clarity"
                ? "All transactions aligned without manual re-entry."
                : hoveredMilestone === "alpha"
                ? "Zero kickbacks, true XIRR compounding unhindered."
                : "Move your cursor along the curve to trace momentum."}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#2E7D4E] bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#8CD49E]/40 shrink-0">
            <Sparkles className="h-3 w-3" />
            <span>Alpha Unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
