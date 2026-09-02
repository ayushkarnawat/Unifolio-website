"use client";

import { motion } from "framer-motion";
import { ArcMark } from "@/components/ui/ArcMark";
import { ShieldCheck, Info, CheckCircle2 } from "lucide-react";

export function ScoreGaugeCard() {
  const scorePillars = [
    {
      name: "Cost Efficiency (TER)",
      weight: "30%",
      score: "96/100",
      detail: "100% Direct plans with low expense ratios across all folios",
      status: "Excellent",
    },
    {
      name: "Folio Overlap Minimization",
      weight: "25%",
      score: "92/100",
      detail: "<12% overlap between Flexi Cap and Small Cap allocations",
      status: "Optimal",
    },
    {
      name: "Cashflow & SIP Consistency",
      weight: "25%",
      score: "94/100",
      detail: "Unbroken SIP discipline spanning 36 consecutive months",
      status: "Exceptional",
    },
    {
      name: "Category Benchmark Alpha",
      weight: "20%",
      score: "88/100",
      detail: "+3.8% rolling 3-year outperformance over Nifty 500 TRI",
      status: "Strong",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-ink/[0.08] bg-paper-elevated p-6 sm:p-10 shadow-panel-lg">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Animated Gauge Visual */}
        <div className="flex flex-col items-center justify-center text-center lg:col-span-5 lg:border-r lg:border-ink/[0.06] lg:pr-8">
          <div className="relative flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56 overflow-visible">
              {/* Background Arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#111111"
                strokeOpacity="0.08"
                strokeWidth="14"
                strokeDasharray="377"
                strokeDashoffset="125"
                strokeLinecap="round"
                transform="rotate(150 100 100)"
              />
              {/* Animated Foreground Arc */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#22C55E"
                strokeWidth="14"
                strokeDasharray="377"
                initial={{ strokeDashoffset: 377 }}
                whileInView={{ strokeDashoffset: 148 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                transform="rotate(150 100 100)"
              />
            </svg>

            {/* Inner Score Badge */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-xs text-ink-faint uppercase tracking-widest">
                Overall Score
              </span>
              <div className="flex items-baseline">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-ink">92</span>
                <span className="font-mono text-base text-ink-faint">/100</span>
              </div>
              <span className="mt-1 rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                Grade: Institutional A+
              </span>
            </div>
          </div>

          <p className="mt-4 font-sans text-xs text-ink-soft max-w-xs leading-relaxed">
            An explainable diagnostic based on your actual CAS cashflows, cost drag, and folio diversification.
          </p>
        </div>

        {/* Right Column: 4 Explainable Pillars */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-ink font-bold">
              Score Diagnostic Breakdown
            </span>
            <span className="font-mono text-[11px] text-ink-faint">100% Deterministic</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {scorePillars.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-ink/[0.08] bg-paper-subtle/40 p-4 transition-all hover:border-ink/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-faint">Weight: {p.weight}</span>
                  <span className="font-mono text-xs font-bold text-accent">{p.score}</span>
                </div>
                <p className="mt-1 font-display text-sm font-bold text-ink">{p.name}</p>
                <p className="mt-1 font-sans text-[11px] text-ink-soft leading-tight">{p.detail}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-paper-subtle p-3 text-[11px] font-mono text-ink-soft flex items-center gap-2 border border-ink/[0.06]">
            <Info className="h-4 w-4 text-accent shrink-0" />
            <span>Unlike opaque black-box AI ratings, every point in the Unifolio Score is mathematically verifiable.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
