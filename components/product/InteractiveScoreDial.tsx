"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Percent, Layers, Calendar, BarChart2 } from "lucide-react";

const factors = [
  {
    id: "cost",
    name: "Cost Efficiency",
    score: 96,
    weight: "30%",
    icon: Percent,
    description: "100% Direct growth folios bypassing distributor commissions across all 44 AMCs.",
    strokeOffset: 120,
  },
  {
    id: "overlap",
    name: "Folio Overlap",
    score: 92,
    weight: "25%",
    icon: Layers,
    description: "Less than 12% overlapping stock holdings across Flexi Cap and Small Cap allocations.",
    strokeOffset: 140,
  },
  {
    id: "sip",
    name: "SIP Discipline",
    score: 94,
    weight: "25%",
    icon: Calendar,
    description: "Zero missed cashflow dates over 36 consecutive compounding cycles.",
    strokeOffset: 130,
  },
  {
    id: "alpha",
    name: "Category Alpha",
    score: 88,
    weight: "20%",
    icon: BarChart2,
    description: "+3.8% rolling 3-year outperformance over blended Nifty 500 TRI benchmark.",
    strokeOffset: 155,
  },
];

export function InteractiveScoreDial() {
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number>(0);
  const active = factors[selectedFactorIndex];
  const Icon = active.icon;

  return (
    <div className="relative mx-auto max-w-2xl rounded-3xl border border-ink/[0.08] bg-paper-elevated p-6 sm:p-10 shadow-panel-float">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/[0.06] pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-ink font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <span className="uppercase tracking-wider">The Unifolio Score Model</span>
        </div>
        <span className="font-mono text-[11px] text-ink-faint">Explainable Algorithm</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left: Sculptural SVG Arc Ring */}
        <div className="flex flex-col items-center justify-center text-center lg:col-span-6">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="h-44 w-44 sm:h-52 sm:w-52 overflow-visible">
              {/* Background Ring */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#111111"
                strokeOpacity="0.06"
                strokeWidth="12"
              />

              {/* Dynamic Animated Green Arc */}
              <motion.circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#22C55E"
                strokeWidth="12"
                strokeDasharray="490"
                animate={{ strokeDashoffset: active.strokeOffset }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>

            {/* Centered Readout */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] uppercase text-ink-faint">Overall Score</span>
              <div className="flex items-baseline">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-ink">92</span>
                <span className="font-mono text-sm text-ink-faint">/100</span>
              </div>
              <span className="mt-0.5 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[9px] font-bold text-ink">
                Optimal Tier
              </span>
            </div>
          </div>

          <p className="mt-4 font-mono text-xs text-ink-soft">
            Click factors below to explore inputs
          </p>
        </div>

        {/* Right: Interactive 4-Pillar Selector */}
        <div className="space-y-3 lg:col-span-6">
          {factors.map((f, idx) => {
            const isSelected = selectedFactorIndex === idx;
            const FIcon = f.icon;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFactorIndex(idx)}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-accent/40 bg-accent/[0.04] shadow-sm ring-1 ring-accent/20"
                    : "border-ink/[0.06] bg-paper-subtle/40 hover:bg-paper-subtle hover:border-ink/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isSelected ? "bg-accent text-paper" : "bg-ink/[0.05] text-ink-soft"
                    }`}
                  >
                    <FIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-display text-xs sm:text-sm font-bold text-ink">{f.name}</p>
                    <p className="font-mono text-[10px] text-ink-faint">Weight: {f.weight}</p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-accent">{f.score}/100</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Active Factor Detail Readout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-6 rounded-2xl border border-ink/[0.06] bg-paper-subtle p-4 font-sans text-xs text-ink-soft leading-relaxed"
        >
          <div className="flex items-center gap-2 font-mono text-[11px] text-ink font-semibold mb-1">
            <Icon className="h-3.5 w-3.5 text-accent" />
            <span>{active.name} Factor Analysis</span>
          </div>
          {active.description}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
