"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { Users, Sparkles, CheckCircle2 } from "lucide-react";

export function Scene4PolyphonicNexus({
  progress, // 0.60 to 0.84 (active in Act 4)
}: {
  progress: MotionValue<number>;
}) {
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Opacity & scale transforms for Scene 4
  const opacity = useTransform(progress, [0.6, 0.66, 0.78, 0.84], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0.6, 0.66, 0.78, 0.84], [0.9, 1, 1, 1.1]);

  return (
    <motion.div
      style={{ opacity, scale }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouseOffset({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      className="absolute inset-0 flex flex-col items-center justify-center select-none overflow-hidden px-6"
    >
      {/* Background Soft Radiance */}
      <div className="absolute inset-0 bg-radial from-[#8CD49E]/10 via-transparent to-transparent pointer-events-none" />

      {/* Act Header */}
      <div className="text-center mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#2E7D4E]">
          <Users className="h-3.5 w-3.5" />
          <span>ACT 04 · THE POLYPHONIC NEXUS</span>
        </div>
        <h2 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C241E] leading-[1.04]">
          Braided lives, <br />
          <span className="text-[#2E7D4E] italic font-normal">one shared horizon.</span>
        </h2>
        <p className="mt-2 font-sans text-sm sm:text-base text-[#525E55]">
          Multiple PAN accounts, spouse folios, children&apos;s goal buckets, and RIA fiduciary co-pilots weave together without spreadsheet entanglement.
        </p>
      </div>

      {/* The Braided Ribbon Engine Canvas */}
      <div className="relative w-full max-w-4xl h-[280px] sm:h-[340px] flex items-center justify-center">
        <svg
          viewBox="0 0 800 320"
          className="w-full h-full overflow-visible"
          fill="none"
        >
          {/* Stream 1: Personal Growth Core (Deep Emerald Green) */}
          <motion.path
            d={`
              M 40 80
              C 180 ${40 + mouseOffset.y * 30},
                320 ${200 + mouseOffset.y * 40},
                460 120
              C 580 50,
                680 180,
                760 160
            `}
            stroke="#2E7D4E"
            strokeWidth={activeStream === "personal" ? "5.5" : "3.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={activeStream && activeStream !== "personal" ? 0.3 : 1}
            animate={{
              d: [
                "M 40 80 C 180 40, 320 200, 460 120 C 580 50, 680 180, 760 160",
                "M 40 80 C 180 120, 320 60, 460 180 C 580 140, 680 80, 760 160",
                "M 40 80 C 180 40, 320 200, 460 120 C 580 50, 680 180, 760 160",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Stream 2: Family Household (Luminous Mint) */}
          <motion.path
            d={`
              M 40 160
              C 160 220,
                340 70,
                460 180
              C 580 250,
                660 110,
                760 160
            `}
            stroke="#8CD49E"
            strokeWidth={activeStream === "family" ? "5.5" : "3.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={activeStream && activeStream !== "family" ? 0.3 : 1}
            animate={{
              d: [
                "M 40 160 C 160 220, 340 70, 460 180 C 580 250, 660 110, 760 160",
                "M 40 160 C 160 80, 340 230, 460 100 C 580 60, 660 200, 760 160",
                "M 40 160 C 160 220, 340 70, 460 180 C 580 250, 660 110, 760 160",
              ],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Stream 3: Fiduciary Advisor Co-Pilot (Warm Gold Filaments) */}
          <motion.path
            d={`
              M 40 240
              C 200 250,
                300 150,
                460 140
              C 600 130,
                680 220,
                760 160
            `}
            stroke="#D4AF37"
            strokeWidth={activeStream === "trust" ? "4.5" : "2.5"}
            strokeDasharray="6 5"
            strokeLinecap="round"
            strokeOpacity={activeStream && activeStream !== "trust" ? 0.3 : 0.85}
            animate={{
              d: [
                "M 40 240 C 200 250, 300 150, 460 140 C 600 130, 680 220, 760 160",
                "M 40 240 C 200 170, 300 240, 460 130 C 600 180, 680 120, 760 160",
                "M 40 240 C 200 250, 300 150, 460 140 C 600 130, 680 220, 760 160",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Shared Convergent Nexus Bullseye at (760, 160) */}
          <g transform="translate(760, 160)">
            <circle cx="0" cy="0" r="22" fill="#FAF8F5" stroke="#1C241E" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#8CD49E" stroke="#2E7D4E" strokeWidth="1.6" />
            <circle cx="0" cy="0" r="5" fill="#1C241E" />
            {/* Radiating Sparkles */}
            <line x1="0" y1="-26" x2="0" y2="-20" stroke="#2E7D4E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="20" x2="0" y2="26" stroke="#2E7D4E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-26" y1="0" x2="-20" y2="0" stroke="#2E7D4E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="0" x2="26" y2="0" stroke="#2E7D4E" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Mid-Journey Braided Node 1 (Personal) */}
          <g
            transform="translate(460, 120)"
            onMouseEnter={() => setActiveStream("personal")}
            onMouseLeave={() => setActiveStream(null)}
            className="cursor-pointer"
          >
            <circle cx="0" cy="0" r="8" fill="#FAF8F5" stroke="#2E7D4E" strokeWidth="2" />
            <circle cx="0" cy="0" r="3.5" fill="#2E7D4E" />
          </g>

          {/* Mid-Journey Braided Node 2 (Family) */}
          <g
            transform="translate(460, 180)"
            onMouseEnter={() => setActiveStream("family")}
            onMouseLeave={() => setActiveStream(null)}
            className="cursor-pointer"
          >
            <circle cx="0" cy="0" r="8" fill="#FAF8F5" stroke="#8CD49E" strokeWidth="2" />
            <circle cx="0" cy="0" r="3.5" fill="#8CD49E" />
          </g>
        </svg>

        {/* Floating Handwritten Annotation */}
        <div className="absolute bottom-4 left-8 pointer-events-none hidden sm:block">
          <span className="font-handwriting text-xl text-[#2E7D4E] rotate-[-2deg] block">
            Independent goals. Unified horizon ★
          </span>
        </div>
      </div>

      {/* Stream Selector Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveStream(activeStream === "personal" ? null : "personal")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs transition-all border ${
            activeStream === "personal"
              ? "bg-[#1C241E] text-white border-[#1C241E] shadow-sm font-semibold"
              : "bg-[#FAF8F5] text-[#525E55] border-[#1C241E]/15 hover:border-[#1C241E]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#2E7D4E]" />
          <span>INDIVIDUAL CORE (PAN 1)</span>
        </button>

        <button
          onClick={() => setActiveStream(activeStream === "family" ? null : "family")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs transition-all border ${
            activeStream === "family"
              ? "bg-[#1C241E] text-white border-[#1C241E] shadow-sm font-semibold"
              : "bg-[#FAF8F5] text-[#525E55] border-[#1C241E]/15 hover:border-[#1C241E]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#8CD49E]" />
          <span>SPOUSE & FAMILY (PAN 2)</span>
        </button>

        <button
          onClick={() => setActiveStream(activeStream === "trust" ? null : "trust")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs transition-all border ${
            activeStream === "trust"
              ? "bg-[#1C241E] text-white border-[#1C241E] shadow-sm font-semibold"
              : "bg-[#FAF8F5] text-[#525E55] border-[#1C241E]/15 hover:border-[#1C241E]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
          <span>ADVISOR FIDUCIARY (PORTAL)</span>
        </button>
      </div>
    </motion.div>
  );
}
