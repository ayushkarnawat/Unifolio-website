"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function ScatteredToCoherenceMetaphor({
  className = "w-full max-w-[560px] min-h-[420px]",
}: {
  className?: string;
}) {
  const [isOrganized, setIsOrganized] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Positions when scattered vs when organized into harmony
  const elements = [
    {
      id: "crystal",
      label: "Equity Holdings",
      tag: "18 Folios Unified",
      scattered: { x: -140, y: -90, rotate: -28, scale: 0.9 },
      organized: { x: -45, y: -20, rotate: 0, scale: 1 },
      render: (
        <g>
          {/* Hand-drawn multi-faceted crystal with pencil hatching */}
          <path
            d="M 20 45 L 55 15 L 85 45 L 55 85 Z"
            fill="#EAF5ED"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 20 45 L 55 52 L 85 45"
            stroke="#1C241E"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M 55 52 L 55 85"
            stroke="#1C241E"
            strokeWidth="1.4"
          />
          {/* Dense organic pencil hatching on side facet */}
          <path
            d="M 28 47 L 50 53 M 32 54 L 52 61 M 36 62 L 52 70 M 42 71 L 52 78"
            stroke="#2E7D4E"
            strokeWidth="1.1"
            strokeOpacity="0.75"
          />
        </g>
      ),
    },
    {
      id: "bank-token",
      label: "Direct Mutual Funds",
      tag: "44 AMCs Consolidated",
      scattered: { x: 150, y: -110, rotate: 34, scale: 0.85 },
      organized: { x: 50, y: -25, rotate: 0, scale: 1 },
      render: (
        <g>
          {/* Intersecting rings / bank glyph with mint fill */}
          <circle cx="50" cy="50" r="30" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.8" />
          <circle cx="50" cy="50" r="18" fill="#8CD49E" fillOpacity="0.35" stroke="#2E7D4E" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="6" fill="#1C241E" />
          {/* Hatching accents */}
          <path d="M 38 42 L 44 48 M 56 42 L 62 48" stroke="#1C241E" strokeWidth="1.2" strokeOpacity="0.5" />
        </g>
      ),
    },
    {
      id: "sprout",
      label: "Compounding Alpha",
      tag: "Zero Broker Commission",
      scattered: { x: -160, y: 85, rotate: 42, scale: 0.85 },
      organized: { x: -70, y: 55, rotate: -6, scale: 1 },
      render: (
        <g>
          {/* Organic sprouting leaf branch */}
          <path
            d="M 30 75 Q 45 45, 65 30"
            stroke="#1C241E"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Leaf 1 */}
          <path
            d="M 65 30 C 78 18, 92 25, 88 40 C 78 45, 68 38, 65 30 Z"
            fill="#8CD49E"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M 68 32 Q 78 32, 85 36" stroke="#2E7D4E" strokeWidth="1.2" strokeLinecap="round" />
          {/* Leaf 2 */}
          <path
            d="M 45 45 C 32 35, 25 45, 30 55 C 38 58, 44 52, 45 45 Z"
            fill="#EAF5ED"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </g>
      ),
    },
    {
      id: "pillar",
      label: "Sovereign Debt & Gold",
      tag: "True Net Valuation",
      scattered: { x: 140, y: 95, rotate: -35, scale: 0.9 },
      organized: { x: 40, y: 60, rotate: 4, scale: 1 },
      render: (
        <g>
          {/* Geometric foundation block */}
          <path
            d="M 25 35 L 55 20 L 85 35 L 55 50 Z"
            fill="#FAF8F5"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 25 35 L 25 70 L 55 85 L 55 50 Z"
            fill="#FFFFFF"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 55 50 L 55 85 L 85 70 L 85 35 Z"
            fill="#EAF5ED"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Fine architectural line shading */}
          <path
            d="M 30 42 L 50 52 M 30 50 L 50 60 M 30 58 L 50 68 M 30 66 L 50 76"
            stroke="#2E7D4E"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
        </g>
      ),
    },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Subtle Mint Aura Glow */}
      <div className="absolute inset-0 bg-[#EAF5ED]/60 rounded-[32px] blur-2xl pointer-events-none" />

      {/* Main Composition Framing Card (Editorial Texture) */}
      <div className="relative w-full rounded-[28px] border-[1.8px] border-[#1C241E] bg-[#FAF8F5] p-6 sm:p-8 shadow-[3px_5px_0px_rgba(28,36,30,0.06)] overflow-hidden">
        {/* Editorial Top Bar with State Toggle */}
        <div className="flex items-center justify-between border-b border-[#1C241E]/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2E7D4E] animate-pulse" />
            <span className="font-serif text-sm font-semibold tracking-wide text-[#1C241E]">
              The Consolidation Metaphor
            </span>
          </div>

          {/* Interactive State Toggle: Fragmented vs Unified */}
          <div className="flex items-center rounded-full border border-[#1C241E]/20 bg-[#FFFFFF] p-0.5 text-[11px] font-sans">
            <button
              onClick={() => setIsOrganized(false)}
              className={`rounded-full px-3 py-1 font-medium transition-all ${
                !isOrganized
                  ? "bg-[#1C241E] text-white shadow-xs"
                  : "text-[#525E55] hover:text-[#1C241E]"
              }`}
            >
              Scattered
            </button>
            <button
              onClick={() => setIsOrganized(true)}
              className={`rounded-full px-3 py-1 font-medium transition-all ${
                isOrganized
                  ? "bg-[#2E7D4E] text-white shadow-xs"
                  : "text-[#525E55] hover:text-[#1C241E]"
              }`}
            >
              Organized
            </button>
          </div>
        </div>

        {/* Central Kinetic Canvas Area */}
        <div className="relative h-[260px] sm:h-[280px] w-full flex items-center justify-center">
          {/* Subtle Hand-Drawn Connecting Web Lines (Emerge when Organized) */}
          <svg
            viewBox="0 0 400 260"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            fill="none"
          >
            <motion.path
              d="M 155 110 C 185 100, 215 100, 250 110 C 270 150, 240 180, 240 190 C 190 200, 150 180, 130 190 C 120 150, 140 120, 155 110"
              stroke="#2E7D4E"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              animate={{
                pathLength: isOrganized ? 1 : 0,
                opacity: isOrganized ? 0.6 : 0,
              }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
            {/* Center Golden Core Focus Ring */}
            <motion.circle
              cx="200"
              cy="140"
              r="38"
              stroke="#8CD49E"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              animate={{
                scale: isOrganized ? 1 : 0.4,
                opacity: isOrganized ? 0.7 : 0,
              }}
              transition={{ duration: 0.8 }}
            />
          </svg>

          {/* Central 'u' Signature Seal (Focal Anchor) */}
          <motion.div
            animate={{
              scale: isOrganized ? 1 : 0.8,
              opacity: isOrganized ? 1 : 0.4,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full border-[1.6px] border-[#1C241E] bg-[#FFFFFF] shadow-sm"
          >
            <span className="font-serif text-2xl font-bold text-[#2E7D4E]">u</span>
          </motion.div>

          {/* Kinetic Elements Group */}
          {elements.map((el) => {
            const target = isOrganized ? el.organized : el.scattered;
            return (
              <motion.div
                key={el.id}
                animate={{
                  x: target.x,
                  y: target.y,
                  rotate: target.rotate,
                  scale: target.scale,
                }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 16,
                  mass: 0.8,
                }}
                onMouseEnter={() => setHoveredNode(el.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute z-20 cursor-pointer"
              >
                <div className="relative group w-24 h-24 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {el.render}
                  </svg>

                  {/* Sparse Tactile Micro-Glimpse Tooltip on Hover */}
                  {hoveredNode === el.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#1C241E] bg-[#1C241E] px-3 py-1 text-[10px] font-sans font-medium text-white shadow-md z-30"
                    >
                      <span>{el.tag}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Floating Hand-Drawn Annotation Script */}
          <motion.div
            animate={{
              opacity: isOrganized ? 1 : 0.3,
              y: isOrganized ? 0 : 5,
            }}
            transition={{ duration: 0.6 }}
            className="absolute top-2 right-4 pointer-events-none hidden sm:block"
          >
            <span className="font-handwriting text-xl text-[#1C241E] -rotate-3 block">
              Every fragment in its place ↗
            </span>
          </motion.div>
        </div>

        {/* Bottom Editorial Narrative Caption & Sparse Micro-Insight */}
        <div className="mt-2 pt-3 border-t border-[#1C241E]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#525E55]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D4E] shrink-0" />
            <span>
              {isOrganized
                ? "Scattered statements assemble automatically into a coherent whole."
                : "Accounts scattered across multiple portals, apps, and broker logins."}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#2E7D4E] bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#8CD49E]/40">
            <Sparkles className="h-3 w-3" />
            <span>Instant CAS Reconcile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
