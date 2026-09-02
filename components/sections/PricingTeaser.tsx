"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { ArcMark } from "@/components/ui/ArcMark";
import type { homeContent } from "@/content/home";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function PricingTeaser({ content }: { content: (typeof homeContent)["pricingTeaser"] }) {
  return (
    <section className="relative mx-auto max-w-wide px-4 py-24 sm:px-8 sm:py-36">
      <div className="rounded-3xl border border-ink/[0.08] bg-paper-elevated p-8 sm:p-16 lg:p-20 shadow-panel-lg overflow-hidden relative">
        {/* Architectural Grid Watermark */}
        <div className="pointer-events-none absolute -right-20 -top-20 font-display text-[16rem] font-extrabold text-ink/[0.02] select-none leading-none">
          ₹0
        </div>

        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-subtle px-3.5 py-1 font-mono text-[11px] font-bold text-ink">
              <ArcMark className="h-3.5 w-3.5" score={100} animated />
              <span>THE ZERO-TOLL PHILOSOPHY</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[0.96]">
              Free. Forever. <br />
              <span className="italic font-light text-ink-soft">No card required.</span>
            </h2>

            <p className="max-w-xl font-sans text-base sm:text-xl text-ink-soft leading-relaxed">
              {content.body}
            </p>

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-ink-soft pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Consolidated Multi-RTA Parser</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Zero Subscription Gates</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Institutional Privacy</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-accent/40 bg-accent/[0.03] p-8 shadow-panel-md ring-1 ring-accent/20">
              <div className="flex items-center justify-between border-b border-accent/20 pb-3 font-mono text-xs text-ink-soft">
                <span>INDIVIDUAL CORE</span>
                <span className="text-accent font-bold">100% FREE</span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold text-ink">₹0</span>
                <span className="font-mono text-xs text-ink-faint">/ lifetime</span>
              </div>

              <p className="mt-2 font-sans text-xs text-ink-soft leading-tight">
                No credit card required. Unlimited CAS uploads and full portfolio analytics.
              </p>

              <div className="mt-6">
                <LinkButton href={content.cta.href} variant="primary" className="w-full">
                  <span>{content.cta.label}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
