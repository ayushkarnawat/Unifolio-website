"use client";

import { motion } from "framer-motion";
import type { homeContent } from "@/content/home";
import { ShieldCheck, Cpu, Database, FileCheck } from "lucide-react";

export function TrustBar({ content }: { content: (typeof homeContent)["trustBar"] }) {
  return (
    <section className="border-y border-ink/[0.08] bg-paper-subtle/60 py-10">
      <div className="mx-auto max-w-content px-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Trust Statement */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 font-mono text-[11px] uppercase tracking-widest text-ink font-semibold">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Institutional Grade Ingestion</span>
            </div>
            <p className="mt-1 font-display text-base sm:text-lg font-bold text-ink">
              {content.claim}
            </p>
            <p className="mt-0.5 font-mono text-xs text-ink-faint">
              44+ AMCs supported · CAMS & KFintech interoperability
            </p>
          </div>

          {/* Trust Highlights Grid */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-xs text-ink-soft">
            <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-paper px-3.5 py-2 shadow-panel-sm">
              <Database className="h-4 w-4 text-accent" />
              <span>MFCentral API Protocol</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-paper px-3.5 py-2 shadow-panel-sm">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Client-Side AES-256</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-paper px-3.5 py-2 shadow-panel-sm">
              <FileCheck className="h-4 w-4 text-accent" />
              <span>Zero-Storage Retention</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
