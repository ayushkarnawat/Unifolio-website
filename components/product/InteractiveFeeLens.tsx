"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, TrendingUp, Sparkles, AlertCircle } from "lucide-react";

export function InteractiveFeeLens() {
  // directPercentage: 0 = 100% Regular, 100 = 100% Direct
  const [directPct, setDirectPct] = useState<number>(100);

  // Math models based on ₹25,000 monthly SIP compounding over 10 years at 14% gross return
  const currentTer = (1.75 - (directPct / 100) * 1.1).toFixed(2);
  const distributorFee = (1.1 - (directPct / 100) * 1.1).toFixed(2);
  const netXirr = (16.2 + (directPct / 100) * 2.22).toFixed(2);

  // Wealth at 10 years: from ~55.84L (Regular) to ~64.29L (Direct)
  const baseWealth = 5584300;
  const maxSavings = 844600;
  const currentWealth = Math.round(baseWealth + (directPct / 100) * maxSavings);
  const savedAmount = Math.round((directPct / 100) * maxSavings);

  const formattedWealth = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(currentWealth);

  const formattedSaved = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(savedAmount);

  return (
    <div className="relative mx-auto max-w-2xl rounded-3xl border border-ink/[0.08] bg-paper-elevated p-6 sm:p-10 shadow-panel-float">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/[0.06] pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-ink font-semibold">
          <Sliders className="h-3.5 w-3.5 text-accent" />
          <span className="uppercase tracking-wider">Fee Drag & Compounding Simulator</span>
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-ink">
          Interactive Lens
        </span>
      </div>

      {/* Main Metric Spotlight */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:items-center">
        <div>
          <span className="font-mono text-xs text-ink-faint uppercase">
            10-Year Projected Wealth
          </span>
          <div className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-ink">
            {formattedWealth}
          </div>
          <div className="mt-2 flex items-center gap-2 font-mono text-xs">
            <span className="text-ink-soft">Net XIRR:</span>
            <span className="font-bold text-accent">+{netXirr}%</span>
            <span className="text-ink-faint">· TER: {currentTer}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-left">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Wealth Unlocked via Direct</span>
          </span>
          <div className="mt-1 font-display text-2xl font-extrabold text-accent">
            +{formattedSaved}
          </div>
          <p className="mt-1 font-sans text-xs text-ink-soft leading-tight">
            Direct plans eliminate {distributorFee}% annual distributor kickbacks.
          </p>
        </div>
      </div>

      {/* Interactive Slider Controller */}
      <div className="mt-8 rounded-2xl border border-ink/[0.08] bg-paper-subtle/50 p-6">
        <div className="flex items-center justify-between text-xs font-mono text-ink font-semibold mb-2">
          <span>PORTFOLIO DIRECT PLAN RATIO</span>
          <span className="text-accent">{directPct}% Direct</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={directPct}
          onChange={(e) => setDirectPct(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-accent focus:outline-none"
        />

        <div className="mt-3 flex justify-between font-mono text-[11px] text-ink-faint">
          <span>0% (Regular / Distributor Drag)</span>
          <span>100% (Unifolio Direct Standard)</span>
        </div>
      </div>

      {/* Dynamic Compounding Wave Curve Visualizer */}
      <div className="mt-6 relative h-28 w-full overflow-hidden rounded-xl border border-ink/[0.06] bg-paper-subtle/30 p-2">
        <svg viewBox="0 0 400 100" className="h-full w-full overflow-visible" preserveAspectRatio="none">
          {/* Baseline Curve (Regular Plan) */}
          <path
            d="M 0 90 Q 200 70, 400 50"
            fill="none"
            stroke="rgba(17, 17, 17, 0.2)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Dynamic Direct Plan Alpha Curve */}
          <motion.path
            d={`M 0 90 Q 200 ${70 - (directPct / 100) * 35}, 400 ${50 - (directPct / 100) * 40}`}
            fill="none"
            stroke="#22C55E"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute right-4 top-3 font-mono text-[10px] text-accent font-bold">
          Alpha Trajectory Curve
        </div>
      </div>
    </div>
  );
}
