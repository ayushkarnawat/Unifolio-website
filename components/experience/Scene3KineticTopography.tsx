"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { Mountain, Sparkles } from "lucide-react";

export function Scene3KineticTopography({
  progress, // 0.38 to 0.65 (active in Act 3)
}: {
  progress: MotionValue<number>;
}) {
  const [hoverNode, setHoverNode] = useState<{ x: number; y: number } | null>(null);
  const [activeElevation, setActiveElevation] = useState<"growth" | "stability" | "liquidity">("growth");

  // Opacity & scale transforms for Scene 3
  const opacity = useTransform(progress, [0.38, 0.44, 0.58, 0.65], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0.38, 0.44, 0.58, 0.65], [0.9, 1, 1, 1.1]);

  // Generate 8 kinetic undulating contour layers
  const layers = [
    { id: 1, y: 50, amp: 25, color: "#2E7D4E", label: "Frontier Alpha Ridge" },
    { id: 2, y: 90, amp: 35, color: "#2E7D4E", label: "Large Cap Compounding" },
    { id: 3, y: 130, amp: 20, color: "#8CD49E", label: "Flexi-Cap Allocation" },
    { id: 4, y: 170, amp: 15, color: "#8CD49E", label: "Sovereign Debt Floor" },
    { id: 5, y: 210, amp: 28, color: "#D4AF37", label: "Physical Gold Buffer" },
    { id: 6, y: 250, amp: 10, color: "#525E55", label: "Liquid Emergency Basin" },
  ];

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 flex flex-col items-center justify-center select-none overflow-hidden px-6"
    >
      {/* Background Subtle Gradient Wash */}
      <div className="absolute inset-0 bg-radial from-[#8CD49E]/10 via-transparent to-transparent pointer-events-none" />

      {/* Act Header */}
      <div className="text-center mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#2E7D4E]">
          <Mountain className="h-3.5 w-3.5" />
          <span>ACT 03 · THE KINETIC TOPOGRAPHY</span>
        </div>
        <h2 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C241E] leading-[1.04]">
          A living elevation <br />
          <span className="text-[#2E7D4E] italic font-normal">of dynamic balance.</span>
        </h2>
        <p className="mt-2 font-sans text-sm sm:text-base text-[#525E55]">
          Not static pie charts. An undulating financial landscape that shifts organically between high-altitude growth peaks and calm liquidity basins.
        </p>
      </div>

      {/* Kinetic 3D Wireframe Elevation Canvas */}
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoverNode({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseLeave={() => setHoverNode(null)}
        className="relative w-full max-w-4xl h-[280px] sm:h-[340px] flex items-center justify-center cursor-crosshair"
      >
        <svg
          viewBox="0 0 800 320"
          className="w-full h-full overflow-visible"
          fill="none"
        >
          {/* Topographical Contour Elevation Lines */}
          {layers.map((l, idx) => (
            <g key={l.id}>
              {/* Elevation Layer Wave */}
              <motion.path
                d={`
                  M 40 ${l.y + 20}
                  C 160 ${l.y - l.amp + (hoverNode ? Math.sin(idx) * 15 : 0)},
                    280 ${l.y + l.amp + (hoverNode ? Math.cos(idx) * 20 : 0)},
                    400 ${l.y - l.amp * 1.3}
                  C 520 ${l.y + l.amp},
                    640 ${l.y - l.amp * 0.8},
                    760 ${l.y + 15}
                `}
                stroke={l.color}
                strokeWidth={idx === 0 || idx === 1 ? "2.5" : "1.6"}
                strokeOpacity={idx === 0 ? 1 : 0.75}
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: [
                    `M 40 ${l.y + 20} C 160 ${l.y - l.amp}, 280 ${l.y + l.amp}, 400 ${l.y - l.amp * 1.3} C 520 ${l.y + l.amp}, 640 ${l.y - l.amp * 0.8}, 760 ${l.y + 15}`,
                    `M 40 ${l.y + 20} C 160 ${l.y + l.amp * 0.8}, 280 ${l.y - l.amp * 1.2}, 400 ${l.y + l.amp} C 520 ${l.y - l.amp}, 640 ${l.y + l.amp * 0.7}, 760 ${l.y + 15}`,
                    `M 40 ${l.y + 20} C 160 ${l.y - l.amp}, 280 ${l.y + l.amp}, 400 ${l.y - l.amp * 1.3} C 520 ${l.y + l.amp}, 640 ${l.y - l.amp * 0.8}, 760 ${l.y + 15}`,
                  ],
                }}
                transition={{
                  duration: 6 + idx * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Shading fill under top peak */}
              {idx === 1 && (
                <path
                  d="M 160 55 C 280 150, 400 30, 520 150 L 520 280 L 160 280 Z"
                  fill="#8CD49E"
                  fillOpacity="0.15"
                />
              )}
            </g>
          ))}

          {/* Interactive Ripple Anchor when Hovered */}
          {hoverNode && (
            <g transform={`translate(${hoverNode.x * 0.8}, ${hoverNode.y * 0.8})`}>
              <circle cx="0" cy="0" r="16" stroke="#2E7D4E" strokeWidth="1.2" strokeDasharray="3 3" className="animate-ping" />
              <circle cx="0" cy="0" r="6" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.6" />
              <circle cx="0" cy="0" r="2.5" fill="#2E7D4E" />
            </g>
          )}

          {/* Peak Milestone Beacon 1 (Growth Ridge) */}
          <g transform="translate(400, 35)">
            <circle cx="0" cy="0" r="7" fill="#FAF8F5" stroke="#2E7D4E" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="3" fill="#2E7D4E" />
            <line x1="0" y1="7" x2="0" y2="40" stroke="#2E7D4E" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* Basin Milestone Beacon 2 (Stability Basin) */}
          <g transform="translate(640, 230)">
            <circle cx="0" cy="0" r="6" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#8CD49E" />
          </g>
        </svg>

        {/* Handwritten Landscape Annotation */}
        <div className="absolute top-4 left-6 pointer-events-none hidden sm:block">
          <span className="font-handwriting text-xl text-[#2E7D4E] rotate-[-3deg] block">
            Growth ridges meet liquid basins ↗
          </span>
        </div>
      </div>

      {/* Layer Focus Switcher */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveElevation("growth")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs transition-all border ${
            activeElevation === "growth"
              ? "bg-[#1C241E] text-white border-[#1C241E] shadow-sm font-semibold"
              : "bg-[#FAF8F5] text-[#525E55] border-[#1C241E]/15 hover:border-[#1C241E]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#2E7D4E]" />
          <span>EQUITY GROWTH (68%)</span>
        </button>

        <button
          onClick={() => setActiveElevation("stability")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs transition-all border ${
            activeElevation === "stability"
              ? "bg-[#1C241E] text-white border-[#1C241E] shadow-sm font-semibold"
              : "bg-[#FAF8F5] text-[#525E55] border-[#1C241E]/15 hover:border-[#1C241E]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#8CD49E]" />
          <span>DEBT & SOVEREIGN (22%)</span>
        </button>

        <button
          onClick={() => setActiveElevation("liquidity")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs transition-all border ${
            activeElevation === "liquidity"
              ? "bg-[#1C241E] text-white border-[#1C241E] shadow-sm font-semibold"
              : "bg-[#FAF8F5] text-[#525E55] border-[#1C241E]/15 hover:border-[#1C241E]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
          <span>GOLD & BUFFER (10%)</span>
        </button>
      </div>
    </motion.div>
  );
}
