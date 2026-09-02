"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, RefreshCw, Zap, Shield, Sparkles } from "lucide-react";

export function LiveIngestionDemo() {
  const [parsing, setParsing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayValue, setDisplayValue] = useState(8429450);
  const [displayFolios, setDisplayFolios] = useState(14);
  const [displayXirr, setDisplayXirr] = useState(18.42);

  const startSimulation = () => {
    if (parsing) return;
    setParsing(true);
    setCompleted(false);
    setProgress(0);
    setDisplayValue(0);
    setDisplayFolios(0);
    setDisplayXirr(0);
  };

  useEffect(() => {
    if (!parsing) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setParsing(false);
          setCompleted(true);
          return 100;
        }
        const next = prev + 4;
        // Incrementally rollup figures
        setDisplayValue(Math.round((next / 100) * 8429450));
        setDisplayFolios(Math.round((next / 100) * 14));
        setDisplayXirr(Number(((next / 100) * 18.42).toFixed(2)));
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [parsing]);

  const formattedValue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(displayValue);

  return (
    <div className="relative mx-auto max-w-2xl rounded-3xl border border-ink/[0.08] bg-paper-elevated p-6 sm:p-10 shadow-panel-float">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-ink/[0.06] pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-ink font-semibold">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="uppercase tracking-wider">CAS Ingestion Simulator</span>
        </div>
        <button
          type="button"
          onClick={startSimulation}
          disabled={parsing}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-subtle px-3 py-1 font-mono text-[11px] text-ink-soft transition-all hover:text-ink hover:border-ink/30 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${parsing ? "animate-spin text-accent" : ""}`} />
          <span>{parsing ? "Parsing…" : "Replay Parse"}</span>
        </button>
      </div>

      {/* Main Interactive Drop/Status Zone */}
      <div
        onClick={startSimulation}
        className={`relative mt-6 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all ${
          parsing
            ? "border-accent bg-accent/[0.03]"
            : completed
            ? "border-accent/40 bg-paper-subtle/50"
            : "border-ink/15 hover:border-accent/60 bg-paper-subtle/30"
        }`}
      >
        {/* Laser Scanning Line during parsing */}
        {parsing && (
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent shadow-glow-accent"
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-paper">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">
                {parsing
                  ? "Parsing Consolidated CAS Statement…"
                  : completed
                  ? "CAS Synchronized Successfully"
                  : "CAMS_KFIN_Consolidated_CAS.pdf"}
              </p>
              <p className="font-mono text-xs text-ink-soft mt-0.5">
                {parsing
                  ? `Extraction progress: ${progress}%`
                  : completed
                  ? "All 14 folios extracted across 44 AMCs"
                  : "Click anywhere to simulate live statement parsing"}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                completed
                  ? "bg-accent/15 text-ink"
                  : parsing
                  ? "bg-amber-100 text-amber-800"
                  : "bg-ink/5 text-ink-soft"
              }`}
            >
              {completed && <CheckCircle2 className="h-3 w-3 text-accent" />}
              {completed ? "Ready" : parsing ? `${progress}%` : "Click to Start"}
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Live Rollup Counter Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/[0.06] bg-paper-subtle/40 p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Total Net Worth
          </span>
          <div className="mt-1 font-display text-2xl font-extrabold text-ink">
            {formattedValue}
          </div>
          <span className="font-mono text-[10px] text-accent">100% Direct Plans</span>
        </div>

        <div className="rounded-2xl border border-ink/[0.06] bg-paper-subtle/40 p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Folios Parsed
          </span>
          <div className="mt-1 font-display text-2xl font-extrabold text-ink">
            {displayFolios} <span className="text-xs font-mono text-ink-faint">/ 14</span>
          </div>
          <span className="font-mono text-[10px] text-ink-soft">CAMS + KFintech</span>
        </div>

        <div className="rounded-2xl border border-ink/[0.06] bg-paper-subtle/40 p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            True Net XIRR
          </span>
          <div className="mt-1 font-display text-2xl font-extrabold text-accent">
            +{displayXirr}%
          </div>
          <span className="font-mono text-[10px] text-ink-soft">Exact cashflow dates</span>
        </div>
      </div>

      {/* Security & Client-side guarantee */}
      <div className="mt-6 flex items-center justify-between border-t border-ink/[0.06] pt-4 font-mono text-[11px] text-ink-faint">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span>AES-256 in-memory parsing · No data leaves device</span>
        </div>
        <span className="text-ink font-semibold">100% Free</span>
      </div>
    </div>
  );
}
