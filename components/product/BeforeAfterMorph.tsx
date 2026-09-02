"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, CheckCircle2, AlertTriangle, FileSpreadsheet, Lock, Sparkles } from "lucide-react";

export function BeforeAfterMorph() {
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-ink/[0.08] bg-paper-elevated shadow-panel-float">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-ink/[0.06] bg-paper-subtle/60 px-6 py-4">
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-red-500 font-bold">← CONVENTIONAL MESS</span>
          <span className="text-ink-faint">|</span>
          <span className="text-accent font-bold">THE UNIFOLIO STANDARD →</span>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-ink-faint">
          Drag slider to compare
        </span>
      </div>

      {/* Split Comparison Canvas */}
      <div className="relative min-h-[380px] select-none p-6 sm:p-10">
        {/* Left Side Content: Fragmented Nightmare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          {/* Fragmented Card */}
          <div className="space-y-4 rounded-2xl border border-red-200/70 bg-red-500/[0.02] p-6 text-left">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <span className="font-mono text-xs font-bold text-red-600">The Problem Today</span>
              <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] text-red-700">
                Fragmented
              </span>
            </div>

            <div className="space-y-3 font-sans text-xs sm:text-sm text-ink-soft">
              <div className="flex items-start gap-2">
                <span className="text-red-500">✕</span>
                <span>CAS statements scattered across separate CAMS & KFintech logins</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">✕</span>
                <span>Broken Excel sheets with &ldquo;#NUM!&rdquo; and inaccurate XIRR formulas</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">✕</span>
                <span>1.15% hidden distributor commissions eroding 10-year compounding</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">✕</span>
                <span>Mprofit charging ₹4,800/yr for basic portfolio tables</span>
              </div>
            </div>
          </div>

          {/* Right Side Content: Pristine Unifolio Standard */}
          <div className="space-y-4 rounded-2xl border border-accent/40 bg-accent/[0.03] p-6 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-accent/20 pb-3">
              <span className="font-mono text-xs font-bold text-ink flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>With Unifolio</span>
              </span>
              <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-[10px] font-bold text-ink">
                One Ingestion
              </span>
            </div>

            <div className="space-y-3 font-sans text-xs sm:text-sm text-ink">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>One CAS upload parses all 44+ AMC statements automatically</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Exact cashflow-backed XIRR, folios, and NAV histories</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Fee drag calculator reveals true wealth saved on Direct plans</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>100% Free forever — zero card required to start</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="flex items-center justify-between border-t border-ink/[0.06] bg-paper-subtle/40 px-6 py-3 font-mono text-xs text-ink-soft">
        <span>Source: MFCentral CAS Protocol</span>
        <span className="text-accent font-semibold">Instant Resolution</span>
      </div>
    </div>
  );
}
