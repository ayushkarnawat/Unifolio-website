"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

export function PhaseConnection({
  progress, // 0.28 to 0.72 (Phase 2)
}: {
  progress: MotionValue<number>;
}) {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Alignment factor (0 = starting convergence, 1 = perfectly registered)
  const alignment = useTransform(progress, [0.28, 0.52], [0, 1]);
  const opacity = useTransform(progress, [0.26, 0.35, 0.65, 0.74], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0.26, 0.35, 0.65, 0.74], [0.85, 1, 1, 1.15]);

  return (
    <motion.div
      style={{ opacity, scale }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      className="absolute inset-0 flex flex-col justify-between select-none overflow-hidden p-8 sm:p-16"
    >
      {/* Background Harmonized Converging Ribbons */}
      <svg
        viewBox="0 0 1200 800"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        {/* Stream 1: Ingestion & Reconciliation */}
        <motion.path
          d={`
            M 60 ${240 + mousePos.y * 30}
            C 300 ${220 + mousePos.y * 20},
              500 ${360 + mousePos.y * 40},
              800 ${260}
            C 950 ${200},
              1050 ${280},
              1140 ${260}
          `}
          stroke="#2E7D4E"
          strokeWidth={activeLayer === 0 ? "4" : "2.4"}
          strokeLinecap="round"
          style={{
            pathLength: useTransform(alignment, [0, 0.8], [0.2, 1]),
            strokeOpacity: activeLayer === 0 ? 1 : 0.85,
          }}
        />

        {/* Stream 2: Fee Dissection & Compounding Alpha */}
        <motion.path
          d={`
            M 60 ${320 + mousePos.y * 20}
            C 280 ${360 + mousePos.y * 30},
              520 ${240 + mousePos.y * 10},
              780 ${300}
            C 920 ${340},
              1040 ${260},
              1140 ${260}
          `}
          stroke="#8CD49E"
          strokeWidth={activeLayer === 1 ? "4" : "2"}
          strokeLinecap="round"
          style={{
            pathLength: useTransform(alignment, [0.1, 0.9], [0.2, 1]),
            strokeOpacity: activeLayer === 1 ? 1 : 0.75,
          }}
        />

        {/* Stream 3: Multi-PAN Household Alignment */}
        <motion.path
          d={`
            M 60 ${400 + mousePos.y * 40}
            C 320 ${420 + mousePos.y * 20},
              480 ${300 + mousePos.y * 20},
              820 ${340}
            C 960 ${360},
              1060 ${300},
              1140 ${260}
          `}
          stroke="#D4AF37"
          strokeWidth={activeLayer === 2 ? "3.5" : "1.8"}
          strokeDasharray="6 5"
          strokeLinecap="round"
          style={{
            pathLength: useTransform(alignment, [0.2, 1.0], [0.2, 1]),
            strokeOpacity: activeLayer === 2 ? 1 : 0.7,
          }}
        />

        {/* Convergent Focus Nexus Node at (1140, 260) */}
        <g transform="translate(1140, 260)">
          <circle cx="0" cy="0" r="16" fill="#FAF8F5" stroke="#1C241E" strokeWidth="2" />
          <circle cx="0" cy="0" r="8" fill="#8CD49E" stroke="#2E7D4E" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3.5" fill="#1C241E" />
        </g>
      </svg>

      {/* Narrative Section Header */}
      <div className="relative z-10 max-w-2xl pt-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#2E7D4E] block mb-3 font-semibold">
          [ 02 · GRAVITATIONAL CONNECTION ]
        </span>

        <h2 className="font-serif text-4xl sm:text-6xl lg:text-[5.2rem] font-normal tracking-tight text-[#1C241E] leading-[1.02]">
          Everything finds <br />
          <span className="italic text-[#2E7D4E] font-normal">relationship.</span>
        </h2>
      </div>

      {/* Connected Registered Principles Sliding Onto Magnetic Baselines */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 my-auto py-8">
        {/* Connection Axis 1 */}
        <motion.div
          onMouseEnter={() => setActiveLayer(0)}
          onMouseLeave={() => setActiveLayer(null)}
          style={{
            y: useTransform(alignment, [0, 1], [60, 0]),
            opacity: useTransform(alignment, [0, 0.6], [0, 1]),
          }}
          className="border-t border-[#1C241E]/20 pt-4 space-y-2 cursor-pointer group"
        >
          <span className="font-mono text-xs text-[#2E7D4E] font-bold">01 / CONSOLIDATION</span>
          <p className="font-serif text-2xl text-[#1C241E] group-hover:text-[#2E7D4E] transition-colors">
            44 AMCs into one ledger.
          </p>
          <p className="font-sans text-xs text-[#525E55] leading-relaxed">
            All transaction history, XIRR benchmarks, and folios automatically aligned from a single CAS upload.
          </p>
        </motion.div>

        {/* Connection Axis 2 */}
        <motion.div
          onMouseEnter={() => setActiveLayer(1)}
          onMouseLeave={() => setActiveLayer(null)}
          style={{
            y: useTransform(alignment, [0.15, 1], [60, 0]),
            opacity: useTransform(alignment, [0.15, 0.75], [0, 1]),
          }}
          className="border-t border-[#1C241E]/20 pt-4 space-y-2 cursor-pointer group"
        >
          <span className="font-mono text-xs text-[#8CD49E] font-bold">02 / DISSECTION</span>
          <p className="font-serif text-2xl text-[#1C241E] group-hover:text-[#2E7D4E] transition-colors">
            Commissions reclaimed.
          </p>
          <p className="font-sans text-xs text-[#525E55] leading-relaxed">
            Distributor drag unmasked into compounding returns. Direct mutual funds with zero friction.
          </p>
        </motion.div>

        {/* Connection Axis 3 */}
        <motion.div
          onMouseEnter={() => setActiveLayer(2)}
          onMouseLeave={() => setActiveLayer(null)}
          style={{
            y: useTransform(alignment, [0.3, 1], [60, 0]),
            opacity: useTransform(alignment, [0.3, 0.9], [0, 1]),
          }}
          className="border-t border-[#1C241E]/20 pt-4 space-y-2 cursor-pointer group"
        >
          <span className="font-mono text-xs text-[#D4AF37] font-bold">03 / MULTI-PAN</span>
          <p className="font-serif text-2xl text-[#1C241E] group-hover:text-[#2E7D4E] transition-colors">
            Connected household.
          </p>
          <p className="font-sans text-xs text-[#525E55] leading-relaxed">
            Partner folios, family trust holdings, and advisor fiduciary co-piloting flowing together in registration.
          </p>
        </motion.div>
      </div>

      {/* Bottom Telemetry Note */}
      <div className="relative z-10 flex items-center justify-between font-mono text-xs text-[#8E9B91] pt-6 border-t border-[#1C241E]/10">
        <span>MAGNETIC ALIGNMENT</span>
        <span className="animate-pulse text-[#2E7D4E] font-medium">
          SCROLL TO RESOLVE INTO MONUMENTAL CLARITY ↓
        </span>
      </div>
    </motion.div>
  );
}
