"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, TrendingDown, Check, ArrowRight, ShieldAlert } from "lucide-react";

export function AnalyticsDeepDive() {
  const [selectedPlan, setSelectedPlan] = useState<"direct" | "regular">("direct");

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-ink/[0.08] bg-paper-elevated p-6 sm:p-8 shadow-panel-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            Fee & Drag Intelligence
          </span>
          <h4 className="font-display text-lg font-bold text-ink">
            Direct Plan Alpha vs Regular Plan Drag
          </h4>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper-subtle p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setSelectedPlan("direct")}
            className={`rounded-full px-3 py-1 transition-all ${
              selectedPlan === "direct"
                ? "bg-ink text-paper font-semibold shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Direct Plan (Unifolio)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan("regular")}
            className={`rounded-full px-3 py-1 transition-all ${
              selectedPlan === "regular"
                ? "bg-ink text-paper font-semibold shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Regular Plan (Distributor)
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Card: 10-Year Compounding Comparison */}
        <div className="rounded-xl border border-ink/[0.08] bg-paper-subtle/40 p-5">
          <p className="font-mono text-xs text-ink-faint uppercase">10-Year Compounding Impact</p>
          <p className="font-sans text-xs text-ink-soft mt-1">
            ₹25,000 monthly SIP compounding at 14% gross return
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-ink font-semibold">Direct Plan (0.65% TER)</span>
                <span className="text-accent font-bold">₹64,28,900</span>
              </div>
              <div className="h-3 w-full rounded-full bg-ink/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "94%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-accent"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-ink-soft">Regular Plan (1.75% TER)</span>
                <span className="text-ink-soft font-medium">₹55,84,300</span>
              </div>
              <div className="h-3 w-full rounded-full bg-ink/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "79%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-ink/30"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-3.5 flex items-center justify-between">
            <span className="font-mono text-xs text-ink font-medium">Wealth Saved via Direct Plan</span>
            <span className="font-display text-base font-extrabold text-accent">+₹8,44,600</span>
          </div>
        </div>

        {/* Right Card: Hidden Cost Breakdown */}
        <div className="rounded-xl border border-ink/[0.08] bg-paper-subtle/40 p-5 flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs text-ink-faint uppercase">Expense Breakdown Analysis</p>
            <p className="font-sans text-xs text-ink-soft mt-1">
              What traditional broker apps don&apos;t display on your monthly statements
            </p>

            <div className="mt-4 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-ink/[0.06]">
                <span className="text-ink-soft">Fund Management Fee</span>
                <span className="font-mono text-ink font-medium">0.45%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-ink/[0.06]">
                <span className="text-ink-soft">GST & Statutory Levies</span>
                <span className="font-mono text-ink font-medium">0.18%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-ink/[0.06]">
                <span className="text-ink-soft">Distributor / Trail Commission</span>
                <span className="font-mono font-bold text-accent">0.00% (Direct)</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-ink font-semibold">Net Total Expense Ratio</span>
                <span className="font-mono font-bold text-ink text-sm">0.63%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-ink px-4 py-2.5 font-mono text-[11px] text-paper flex items-center justify-between">
            <span>True Net XIRR After All Fees</span>
            <span className="text-accent font-bold">18.42%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
