"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Compass } from "lucide-react";

export function ContinuumHUD({
  progress, // 0 to 1
  phase, // "fragmentation" | "connection" | "clarity"
  onJumpToPhase,
}: {
  progress: number;
  phase: "fragmentation" | "connection" | "clarity";
  onJumpToPhase?: (target: number) => void;
}) {
  const phaseLabel =
    phase === "fragmentation"
      ? "ENTROPY / FRAGMENTATION"
      : phase === "connection"
      ? "GRAVITATIONAL CONNECTION"
      : "ABSOLUTE CLARITY";

  const entropyPercent = Math.max(0, Math.min(100, Math.round((1 - progress) * 100)));

  return (
    <>
      {/* Top Subtle Telemetry Ribbon */}
      <div className="fixed top-6 inset-x-0 z-50 pointer-events-none px-6 sm:px-12 flex items-center justify-between font-mono text-[11px] select-none">
        {/* Monogram & Narrative Continuum State */}
        <div className="pointer-events-auto flex items-center gap-3">
          <span className="font-serif text-sm font-black tracking-widest text-[#1C241E]">
            UNIFOLIO
          </span>
          <span className="text-[#1C241E]/30">/</span>
          <span className="font-mono text-[10px] tracking-wider text-[#2E7D4E] uppercase font-bold">
            {phaseLabel}
          </span>
        </div>

        {/* Security & Coherence Ratio */}
        <div className="pointer-events-auto flex items-center gap-6 text-[#525E55]">
          <span className="hidden md:inline font-sans text-xs text-[#8E9B91]">
            Zero-Storage Client Ingestion
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[#8E9B91]">COHERENCE</span>
            <span className="font-bold text-[#1C241E] w-10 text-right font-mono">
              {100 - entropyPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Left Navigation Narrative Dial */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-auto hidden sm:flex items-center gap-3 font-mono text-[10px] select-none">
        <div className="flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5]/90 px-3.5 py-1.5 backdrop-blur-md text-[#1C241E]">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              phase === "clarity" ? "bg-[#2E7D4E]" : "bg-[#1C241E] animate-ping"
            }`}
          />
          <span className="uppercase font-semibold tracking-wider">
            {phase}
          </span>
        </div>

        {/* 3 State Dots */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onJumpToPhase?.(0.05)}
            className={`h-1.5 transition-all rounded-full ${
              phase === "fragmentation" ? "w-5 bg-[#1C241E]" : "w-1.5 bg-[#1C241E]/20"
            }`}
            title="Fragmentation"
          />
          <button
            onClick={() => onJumpToPhase?.(0.48)}
            className={`h-1.5 transition-all rounded-full ${
              phase === "connection" ? "w-5 bg-[#2E7D4E]" : "w-1.5 bg-[#1C241E]/20"
            }`}
            title="Connection"
          />
          <button
            onClick={() => onJumpToPhase?.(0.88)}
            className={`h-1.5 transition-all rounded-full ${
              phase === "clarity" ? "w-5 bg-[#2E7D4E]" : "w-1.5 bg-[#1C241E]/20"
            }`}
            title="Clarity"
          />
        </div>
      </div>
    </>
  );
}
