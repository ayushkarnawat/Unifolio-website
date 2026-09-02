"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArcMark } from "@/components/ui/ArcMark";
import {
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowUpRight,
  PieChart,
  SlidersHorizontal,
  Download,
} from "lucide-react";

interface PortfolioTerminalProps {
  interactive?: boolean;
  compact?: boolean;
  className?: string;
}

const holdingsData = [
  {
    name: "Parag Parikh Flexi Cap Fund",
    plan: "Direct · Growth",
    folio: "1084920/41",
    rta: "CAMS",
    invested: "₹18,50,000",
    current: "₹27,84,320",
    gain: "+₹9,34,320",
    gainPct: "+50.5%",
    xirr: "21.4%",
    ter: "0.68%",
    status: "Synced",
  },
  {
    name: "Nippon India Small Cap Fund",
    plan: "Direct · Growth",
    folio: "9102488/19",
    rta: "KFintech",
    invested: "₹12,00,000",
    current: "₹18,92,400",
    gain: "+₹6,92,400",
    gainPct: "+57.7%",
    xirr: "26.8%",
    ter: "0.74%",
    status: "Synced",
  },
  {
    name: "HDFC Flexi Cap Fund",
    plan: "Direct · Growth",
    folio: "8472911/02",
    rta: "CAMS",
    invested: "₹15,00,000",
    current: "₹21,12,180",
    gain: "+₹6,12,180",
    gainPct: "+40.8%",
    xirr: "18.2%",
    ter: "0.78%",
    status: "Synced",
  },
  {
    name: "ICICI Prudential Liquid Fund",
    plan: "Direct · Growth",
    folio: "7392015/88",
    rta: "CAMS",
    invested: "₹14,00,000",
    current: "₹16,40,550",
    gain: "+₹2,40,550",
    gainPct: "+17.1%",
    xirr: "7.1%",
    ter: "0.18%",
    status: "Synced",
  },
];

export function PortfolioTerminal({
  interactive = true,
  compact = false,
  className = "",
}: PortfolioTerminalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "cams" | "kfintech">("all");
  const [selectedFundIndex, setSelectedFundIndex] = useState<number>(0);

  const filteredHoldings =
    activeTab === "all"
      ? holdingsData
      : holdingsData.filter((h) => h.rta.toLowerCase() === activeTab);

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border border-ink/[0.08] bg-paper-elevated shadow-panel-lg sm:shadow-panel-float overflow-hidden ${className}`}
    >
      {/* Top Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] bg-paper-subtle/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-ink/10" />
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            <ArcMark className="h-3.5 w-3.5" />
            <span className="font-bold text-ink">UNIFOLIO TERMINAL</span>
            <span className="hidden sm:inline text-ink-faint">/ v2.4 (LIVE)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 font-mono text-[10px] font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>MFCentral Stream Active</span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-ink-faint">
            14 Folios Synced
          </span>
        </div>
      </div>

      {/* Main Terminal Grid Header */}
      <div className="border-b border-ink/[0.06] bg-paper px-4 py-5 sm:px-8 sm:py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Consolidated Net Worth
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                ₹84,29,450
              </span>
              <span className="font-mono text-xs font-semibold text-accent flex items-center">
                <ArrowUpRight className="h-3 w-3 inline" /> +18.4% XIRR
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-ink-soft">Invested: ₹59,50,000</p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Total Realized + Unrealized
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-accent-dim">
                +₹24,79,450
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-accent flex items-center gap-1">
              <span>+41.67% absolute return</span>
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Fee Drag Saved (Direct Plans)
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                ₹1,12,400<span className="text-xs font-mono text-ink-faint">/yr</span>
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-accent">0.85% avg commission bypassed</p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Unifolio Score
            </p>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                92<span className="text-sm font-mono text-ink-faint">/100</span>
              </span>
              <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] font-bold text-paper">
                Optimal
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-ink-soft">Zero folio overlap detected</p>
          </div>
        </div>

        {/* Portfolio Asset Allocation Gauge Bar */}
        <div className="mt-6 pt-5 border-t border-ink/[0.06]">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-soft mb-2">
            <span>Asset Allocation Distribution</span>
            <span className="text-ink font-semibold">100% Categorized</span>
          </div>
          <div className="h-2 w-full rounded-full bg-ink/[0.06] overflow-hidden flex gap-0.5">
            <div className="h-full bg-ink w-[34%]" title="Large Cap: 34%" />
            <div className="h-full bg-ink/70 w-[28%]" title="Mid Cap: 28%" />
            <div className="h-full bg-accent w-[26%]" title="Small/Flexi: 26%" />
            <div className="h-full bg-ink/20 w-[12%]" title="Liquid: 12%" />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] text-ink-soft">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-ink" /> Large Cap (34%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-ink/70" /> Mid Cap (28%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-accent" /> Small & Flexi Cap (26%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-ink/20" /> Liquid & Debt (12%)
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] bg-paper-subtle/50 px-4 py-2.5 sm:px-8">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => interactive && setActiveTab("all")}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
              activeTab === "all"
                ? "bg-ink text-paper font-semibold shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            All Statements (14)
          </button>
          <button
            type="button"
            onClick={() => interactive && setActiveTab("cams")}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
              activeTab === "cams"
                ? "bg-ink text-paper font-semibold shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            CAMS (9)
          </button>
          <button
            type="button"
            onClick={() => interactive && setActiveTab("kfintech")}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
              activeTab === "kfintech"
                ? "bg-ink text-paper font-semibold shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            KFintech (5)
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-ink-faint">
          <span className="hidden sm:inline">Source: Single CAS Upload</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-ink-soft">Verified Data</span>
        </div>
      </div>

      {/* Holdings Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-ink/[0.06] bg-paper-subtle/30 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3 sm:px-8">Fund / Folio</th>
              <th className="px-4 py-3">RTA</th>
              <th className="px-4 py-3">Invested</th>
              <th className="px-4 py-3">Current Value</th>
              <th className="px-4 py-3">Gain / XIRR</th>
              <th className="px-4 py-3 text-right sm:pr-8">TER / Drag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.04] font-sans text-xs">
            {filteredHoldings.map((item, idx) => (
              <tr
                key={item.folio}
                onClick={() => interactive && setSelectedFundIndex(idx)}
                className={`transition-colors cursor-pointer ${
                  selectedFundIndex === idx
                    ? "bg-accent/[0.04]"
                    : "hover:bg-paper-subtle/70"
                }`}
              >
                <td className="px-4 py-3.5 sm:px-8">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <div>
                      <p className="font-display font-bold text-ink text-sm sm:text-base leading-tight">
                        {item.name}
                      </p>
                      <p className="font-mono text-[11px] text-ink-soft mt-0.5">
                        {item.plan} · Folio {item.folio}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded border border-ink/10 bg-paper-subtle px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                    {item.rta}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-ink-soft">{item.invested}</td>
                <td className="px-4 py-3.5">
                  <p className="font-mono font-bold text-ink">{item.current}</p>
                  <p className="font-mono text-[10px] text-ink-faint">{item.gainPct}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-accent text-xs">
                    {item.xirr} XIRR
                  </span>
                  <p className="font-mono text-[10px] text-ink-soft">{item.gain}</p>
                </td>
                <td className="px-4 py-3.5 text-right sm:pr-8">
                  <span className="font-mono text-xs font-semibold text-ink">{item.ter}</span>
                  <p className="font-mono text-[10px] text-accent">0% Broker Kickback</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Bottom Ledger Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/[0.06] bg-paper-subtle/80 px-4 py-3 sm:px-8 text-ink-soft font-mono text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>AES-256 Client-side CAS Parsing — Zero Data Retention</span>
        </div>
        <div className="flex items-center gap-4 text-ink-faint text-[11px]">
          <span>Synced with MFCentral Engine</span>
          <span>•</span>
          <span className="text-ink font-semibold">100% Free · No Card</span>
        </div>
      </div>
    </div>
  );
}
