"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { LinkButton } from "@/components/ui/Button";
import { ArcMark } from "@/components/ui/ArcMark";
import type { pricingContent } from "@/content/pricing";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { Check, ArrowRight, Sparkles, Clock } from "lucide-react";

export function PricingTable({
  rows,
  comingSoon,
}: {
  rows: (typeof pricingContent)["comparisonRows"];
  comingSoon: (typeof pricingContent)["comingSoon"];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      // Tier overview cards entrance
      gsap.from(".pricing-tier-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      // Comparison table rows staggered entrance
      gsap.from(".comparison-row", {
        scrollTrigger: {
          trigger: ".comparison-table-wrap",
          start: "top 85%",
        },
        y: 15,
        opacity: 0,
        stagger: 0.04,
        duration: 0.5,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="mx-auto max-w-content px-4 py-8 sm:px-8">
      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-12">
        {/* Unifolio Core Tier Card */}
        <div className="pricing-tier-card relative rounded-3xl border border-[#2E7D4E]/40 bg-[#FFFFFF] p-8 sm:p-10 shadow-sm ring-1 ring-[#2E7D4E]/20">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF5ED] px-3 py-1 font-mono text-[11px] font-bold text-[#1C241E]">
              <ArcMark className="h-3.5 w-3.5" score={100} animated />
              <span>CORE PLATFORM</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#2E7D4E]">Active Now</span>
          </div>

          <h3 className="mt-6 font-serif text-3xl font-extrabold text-[#1C241E]">Individual DIY</h3>
          <p className="mt-2 font-sans text-sm text-[#525E55]">
            For retail mutual fund investors who want pure portfolio clarity without recurring subscription gatekeeping.
          </p>

          <div className="mt-6 flex items-baseline gap-2 border-y border-[#1C241E]/10 py-5">
            <span className="font-serif text-4xl sm:text-5xl font-extrabold text-[#1C241E]">₹0</span>
            <span className="font-mono text-xs text-[#8E9B91]">/ free forever · no credit card</span>
          </div>

          <div className="mt-6 space-y-3 font-sans text-sm">
            <div className="flex items-center gap-2.5 text-[#1C241E]">
              <Check className="h-4 w-4 text-[#2E7D4E] shrink-0" />
              <span>Consolidated CAS upload (CAMS + KFintech)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#1C241E]">
              <Check className="h-4 w-4 text-[#2E7D4E] shrink-0" />
              <span>Real XIRR, absolute gains, and NAV history</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#1C241E]">
              <Check className="h-4 w-4 text-[#2E7D4E] shrink-0" />
              <span>Fee drag & distributor commission calculator</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#1C241E]">
              <Check className="h-4 w-4 text-[#2E7D4E] shrink-0" />
              <span>Unifolio Score portfolio health diagnostic</span>
            </div>
          </div>

          <div className="mt-8">
            <LinkButton href="/get-started" variant="primary" className="w-full">
              <span>Start Free Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </LinkButton>
          </div>
        </div>

        {/* Pro / Advisor Tier Card (Coming Soon) */}
        <div className="pricing-tier-card relative rounded-3xl border border-[#1C241E]/10 bg-[#FAF8F5] p-8 sm:p-10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#1C241E]/10 bg-[#FFFFFF] px-3 py-1 font-mono text-[11px] font-semibold text-[#8E9B91]">
                ADVISOR & RIA
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-[#8E9B91]">
                <Clock className="h-3.5 w-3.5" /> Coming Soon
              </span>
            </div>

            <h3 className="mt-6 font-serif text-3xl font-extrabold text-[#525E55]">Pro / Household</h3>
            <p className="mt-2 font-sans text-sm text-[#525E55]">
              For Registered Investment Advisors (RIAs) managing multi-client folios and aggregated household accounts.
            </p>

            <div className="mt-6 flex items-baseline gap-2 border-y border-[#1C241E]/10 py-5">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#525E55]">In Development</span>
            </div>

            <div className="mt-6 space-y-3 font-sans text-sm text-[#525E55]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#8E9B91] shrink-0" />
                <span>Multi-member household aggregation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#8E9B91] shrink-0" />
                <span>White-label client presentation reports</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#8E9B91] shrink-0" />
                <span>Direct client invitation & permissioned view</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <LinkButton href="/contact" variant="ghost" className="w-full">
              <span>Join Advisor Waitlist</span>
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Sourced Comparison Matrix */}
      <div className="comparison-table-wrap rounded-3xl border border-[#1C241E]/10 bg-[#FFFFFF] p-6 sm:p-10 shadow-sm overflow-hidden">
        <div className="border-b border-[#1C241E]/10 pb-5">
          <h4 className="font-serif text-xl font-bold text-[#1C241E]">
            Feature Comparison: Table Stakes vs Gatekeeping
          </h4>
          <p className="mt-1 font-sans text-xs sm:text-sm text-[#525E55]">
            Why pay annual subscriptions for basic portfolio math that should be table stakes?
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1C241E]/10 font-mono text-[11px] uppercase tracking-wider text-[#8E9B91]">
                <th className="py-4 px-4 sm:px-6">Capability</th>
                <th className="py-4 px-4 sm:px-6 text-[#2E7D4E]">Unifolio (Free)</th>
                <th className="py-4 px-4 sm:px-6 text-[#525E55]">Traditional Tools (Mprofit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C241E]/5 font-sans text-sm">
              {rows.map((row) => (
                <tr key={row.feature} className="comparison-row hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-medium text-[#1C241E]">{row.feature}</td>
                  <td className="py-4 px-4 sm:px-6 font-mono text-xs font-bold text-[#2E7D4E]">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-[#2E7D4E]" />
                      <span>{row.unifolio}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono text-xs text-[#525E55]">
                    {row.mprofit}
                  </td>
                </tr>
              ))}
              <tr className="comparison-row bg-[#FAF8F5]/80">
                <td className="py-4 px-4 sm:px-6 font-medium text-[#1C241E]">{comingSoon.label}</td>
                <td className="py-4 px-4 sm:px-6 font-mono text-xs text-[#2E7D4E] font-semibold">
                  In Roadmap
                </td>
                <td className="py-4 px-4 sm:px-6 font-mono text-xs text-[#525E55]">
                  {comingSoon.description}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
