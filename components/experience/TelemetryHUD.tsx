"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Compass, Sparkles } from "lucide-react";

export interface Chapter {
  index: string;
  title: string;
  subtitle: string;
}

const CHAPTERS: Chapter[] = [
  { index: "01", title: "DISPERSION", subtitle: "Kinetic Gravitational Assembly" },
  { index: "02", title: "OPTICAL RETICLE", subtitle: "Microscopic Fee Dissection" },
  { index: "03", title: "TOPOGRAPHY", subtitle: "Dynamic Living Equilibrium" },
  { index: "04", title: "POLYPHONIC NEXUS", subtitle: "Braided Connected Lives" },
  { index: "05", title: "THE ABSOLUTE ZERO", subtitle: "Zero-Toll Direct Ingestion" },
];

export function TelemetryHUD({
  currentProgress,
  activeChapterIndex,
  onNavigateChapter,
}: {
  currentProgress: number; // 0 to 1
  activeChapterIndex: number; // 0 to 4
  onNavigateChapter?: (index: number) => void;
}) {
  const currentChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  return (
    <>
      {/* Top Floating Spatial Bar */}
      <div className="fixed top-5 inset-x-0 z-50 pointer-events-none px-6 sm:px-10 flex items-center justify-between font-mono text-[11px] select-none">
        {/* Brand & Coordinate Axis */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5]/85 px-4 py-2 backdrop-blur-md shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[#2E7D4E] animate-pulse" />
          <span className="font-serif text-xs font-bold tracking-wider text-[#1C241E]">
            UNIFOLIO
          </span>
          <span className="text-[#8E9B91]">/</span>
          <span className="text-[#525E55] hidden sm:inline font-sans">
            Spatial Experience Stage
          </span>
        </div>

        {/* Live Scroll Telemetry Ring */}
        <div className="pointer-events-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5]/85 px-3.5 py-1.5 backdrop-blur-md text-[#525E55]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2E7D4E]" />
            <span className="font-sans text-[11px] font-medium">AES-256 Client-Side Zero Storage</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5]/85 px-3.5 py-1.5 backdrop-blur-md">
            <span className="text-[#8E9B91]">PROGRESS</span>
            <span className="font-bold text-[#1C241E] w-9 text-right font-mono">
              {Math.round(currentProgress * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-Right Chapter Navigation Dial */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto hidden sm:flex flex-col items-end gap-2 font-mono text-[11px] select-none">
        {/* Chapter Indicator Pill */}
        <div className="flex items-center gap-3 rounded-full border border-[#1C241E]/20 bg-[#1C241E] text-white px-4 py-2.5 shadow-lg backdrop-blur-md">
          <div className="flex h-4 w-4 items-center justify-center">
            <Compass className="h-3.5 w-3.5 text-[#8CD49E] animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8CD49E]">{currentChapter.index}</span>
            <span className="text-white/40">·</span>
            <span className="tracking-wider uppercase font-semibold">{currentChapter.title}</span>
          </div>
        </div>

        {/* Scene Navigation Ticks */}
        <div className="flex items-center gap-1.5 pr-2 pt-1">
          {CHAPTERS.map((ch, idx) => (
            <button
              key={ch.index}
              onClick={() => onNavigateChapter?.(idx)}
              title={ch.title}
              className={`h-1.5 transition-all rounded-full ${
                activeChapterIndex === idx
                  ? "w-7 bg-[#2E7D4E]"
                  : "w-2 bg-[#1C241E]/25 hover:bg-[#1C241E]/60"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
