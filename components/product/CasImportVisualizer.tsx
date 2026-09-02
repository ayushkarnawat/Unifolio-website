"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, ArrowRight, Sparkles, Database, Lock, Cpu } from "lucide-react";

export function CasImportVisualizer() {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: "Consolidated CAS PDF Detected",
      detail: "CAMS_KFIN_Consolidated_2026.pdf (1.8 MB)",
      tag: "Source: MFCentral / CAMS",
    },
    {
      title: "Multi-RTA Folio Dissection",
      detail: "14 Folios Extracted · 44 AMCs Scanned · Zero manual entry",
      tag: "Automated Regex Engine",
    },
    {
      title: "Cashflow & XIRR Reconstruction",
      detail: "182 Historical Transactions · Exact NAV & Dividend Dates",
      tag: "Pure XIRR Algorithm",
    },
    {
      title: "Unified Master Dashboard Ready",
      detail: "₹84,29,450 Net Worth · All Gains & Hidden Fees Unveiled",
      tag: "100% Parsed & Private",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-ink/[0.08] bg-paper-elevated p-6 sm:p-8 shadow-panel-lg">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-ink/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-wider text-ink font-bold">
            CAS Ingestion Pipeline
          </span>
        </div>
        <span className="rounded-full bg-ink/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-ink-soft">
          Single CAS Import
        </span>
      </div>

      {/* Interactive Ingestion Flow */}
      <div className="mt-6 space-y-4">
        {steps.map((s, idx) => {
          const isCurrent = step === idx;
          const isPast = step > idx;

          return (
            <motion.div
              key={s.title}
              animate={{
                opacity: isCurrent ? 1 : isPast ? 0.7 : 0.35,
                scale: isCurrent ? 1.01 : 1,
              }}
              transition={{ duration: 0.4 }}
              className={`rounded-xl border p-4 transition-colors ${
                isCurrent
                  ? "border-accent/40 bg-accent/[0.03] shadow-sm"
                  : isPast
                  ? "border-ink/10 bg-paper-subtle/50"
                  : "border-ink/[0.06] bg-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                      isCurrent
                        ? "bg-ink text-paper font-bold"
                        : isPast
                        ? "bg-accent text-paper font-bold"
                        : "bg-ink/10 text-ink-faint"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-3.5 w-3.5 text-paper" /> : `0${idx + 1}`}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{s.title}</p>
                    <p className="mt-0.5 font-sans text-xs text-ink-soft">{s.detail}</p>
                  </div>
                </div>

                <span className="hidden sm:inline font-mono text-[10px] text-ink-faint">{s.tag}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security & Client-side guarantee badge */}
      <div className="mt-6 flex items-center justify-between border-t border-ink/[0.06] pt-4 font-mono text-[11px] text-ink-soft">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-accent" />
          <span>Local client-side parsing · Password never transmitted</span>
        </div>
        <span className="text-accent font-semibold">Zero-Knowledge</span>
      </div>
    </div>
  );
}
