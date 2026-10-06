"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { SceneEngine } from "../hero-engine/useSceneEngine";

export const SCATTER_SLOTS = [
  { x: -160, y: -45, z: 8,  rotZ: -14, rotX: -4, rotY: 6,   scale: 0.65 },
  { x: 145,  y: 35,  z: 12, rotZ: 12,  rotX: 5,  rotY: -7,  scale: 0.66 },
  { x: -75,  y: 65,  z: 16, rotZ: -8,  rotX: 3,  rotY: 4,   scale: 0.68 },
  { x: 95,   y: -55, z: 10, rotZ: 15,  rotX: -5, rotY: -5,  scale: 0.65 },
  { x: -190, y: 20,  z: 6,  rotZ: -12, rotX: 2,  rotY: 8,   scale: 0.62 },
  { x: 180,  y: -25, z: 14, rotZ: 10,  rotX: -3, rotY: -8,  scale: 0.63 },
  { x: -40,  y: -75, z: 18, rotZ: 7,   rotX: -6, rotY: 3,   scale: 0.67 },
  { x: 50,   y: 80,  z: 15, rotZ: -11, rotX: 6,  rotY: -4,  scale: 0.66 },
  { x: -125, y: -80, z: 9,  rotZ: -16, rotX: -4, rotY: 7,   scale: 0.64 },
  { x: 130,  y: 85,  z: 11, rotZ: 13,  rotX: 4,  rotY: -6,  scale: 0.65 },
  { x: -105, y: 35,  z: 17, rotZ: -6,  rotX: 2,  rotY: 5,   scale: 0.68 },
  { x: 110,  y: -30, z: 13, rotZ: 9,   rotX: -3, rotY: -5,  scale: 0.66 },
  { x: -15,  y: 45,  z: 22, rotZ: 5,   rotX: 4,  rotY: 2,   scale: 0.70 },
  { x: 25,   y: -40, z: 20, rotZ: -7,  rotX: -4, rotY: -3,  scale: 0.69 },
  { x: -215, y: -20, z: 5,  rotZ: -15, rotX: -2, rotY: 9,   scale: 0.61 },
  { x: 210,  y: 30,  z: 7,  rotZ: 16,  rotX: 3,  rotY: -9,  scale: 0.61 },
  { x: -65,  y: -40, z: 19, rotZ: 8,   rotX: -3, rotY: 4,   scale: 0.68 },
  { x: 75,   y: 45,  z: 16, rotZ: -9,  rotX: 4,  rotY: -4,  scale: 0.67 },
  { x: -145, y: 70,  z: 8,  rotZ: 11,  rotX: 5,  rotY: 6,   scale: 0.63 },
  { x: 155,  y: -70, z: 10, rotZ: -13, rotX: -5, rotY: -7,  scale: 0.63 },
  { x: -30,  y: 90,  z: 21, rotZ: -5,  rotX: 6,  rotY: 2,   scale: 0.69 },
  { x: 35,   y: -85, z: 19, rotZ: 6,   rotX: -6, rotY: -2,  scale: 0.69 },
  { x: -85,  y: 10,  z: 23, rotZ: 4,   rotX: 1,  rotY: 3,   scale: 0.71 },
  { x: 80,   y: -10, z: 24, rotZ: -4,  rotX: -1, rotY: -3,  scale: 0.71 },
  { x: -10,  y: -15, z: 26, rotZ: 2,   rotX: -2, rotY: 1,   scale: 0.72 },
  { x: 10,   y: 15,  z: 27, rotZ: -2,  rotX: 2,  rotY: -1,  scale: 0.72 },
];

export interface CollageSnippet {
  id: string;
  category: string;
  code: string;
  primary: string;
  meta: string;
  xPct: number;
  yPct: number;
  rotZ: number;
  scale: number;
  opacity: number;
}

export const ABOUT_COLLAGE_FRAGMENTS: CollageSnippet[] = [
  // Upper zone: Transition from Security (y: 2% - 20%)
  { id: "c1", category: "MUTUAL FUNDS", code: "CAMS // CAS-01", primary: "Consolidated Statement", meta: "14 Folios Verified", xPct: 6, yPct: 4, rotZ: -6, scale: 0.95, opacity: 0.32 },
  { id: "c2", category: "REGULATOR", code: "RBI // AA-LINK", primary: "Account Aggregator", meta: "Consent ID: #7741", xPct: 84, yPct: 6, rotZ: 5, scale: 0.92, opacity: 0.30 },
  { id: "c3", category: "EQUITY", code: "NSDL // DP-92", primary: "Holding Statement", meta: "ISIN: INE002A01018", xPct: 18, yPct: 14, rotZ: 4, scale: 0.88, opacity: 0.36 },
  { id: "c4", category: "TAXATION", code: "ITD // AIS-26AS", primary: "Annual Info Statement", meta: "FY2024-25 Reconciled", xPct: 76, yPct: 16, rotZ: -4, scale: 0.90, opacity: 0.34 },
  { id: "c5", category: "PENSION", code: "EPFO // UAN-41", primary: "Provident Fund Passbook", meta: "Monthly Accrual Active", xPct: 48, yPct: 10, rotZ: -2, scale: 0.85, opacity: 0.28 },

  // Beat 1 Zone: Flanking the Problem (y: 22% - 50%)
  { id: "c6", category: "DEPOSITS", code: "HDFC // FD-882", primary: "Fixed Deposit Receipt", meta: "7.40% • Compounded Qtr", xPct: 82, yPct: 24, rotZ: 7, scale: 0.96, opacity: 0.44 },
  { id: "c7", category: "MUTUAL FUNDS", code: "KFIN // FOL-12", primary: "Systematic Investment", meta: "Auto-Debit: ₹25,000", xPct: 68, yPct: 32, rotZ: -8, scale: 0.92, opacity: 0.40 },
  { id: "c8", category: "GOLD", code: "RBI // SGB-IV", primary: "Sovereign Gold Bond", meta: "Issue 2023-24 Series IV", xPct: 88, yPct: 38, rotZ: 3, scale: 0.88, opacity: 0.42 },
  { id: "c9", category: "CAPITAL GAINS", code: "TAX // 112A-CG", primary: "LTCG Ledger Summary", meta: "Grandfathered NAV Stmt", xPct: 4, yPct: 30, rotZ: 5, scale: 0.94, opacity: 0.38 },
  { id: "c10", category: "EQUITY", code: "CDSL // CAS-58", primary: "Demat Pool Allocation", meta: "Total Scrips: 28", xPct: 12, yPct: 42, rotZ: -5, scale: 0.90, opacity: 0.42 },
  { id: "c11", category: "BENCHMARK", code: "TRI // NIFTY50", primary: "Total Return Benchmark", meta: "Relative Drift: +3.2%", xPct: 74, yPct: 46, rotZ: -3, scale: 0.86, opacity: 0.40 },
  { id: "c12", category: "PENSION", code: "PFRDA // PRAN", primary: "Tier-1 Auto Choice", meta: "Allocation: E50/C30/G20", xPct: 2, yPct: 48, rotZ: 8, scale: 0.88, opacity: 0.36 },

  // Mid Transition Gap Zone (y: 52% - 66%)
  { id: "c13", category: "BONDS", code: "CRISIL // AAA", primary: "PSU Corporate Debt", meta: "8.15% Maturing 2029", xPct: 24, yPct: 54, rotZ: -7, scale: 0.92, opacity: 0.44 },
  { id: "c14", category: "TAX", code: "SEC // 80C-D", primary: "Deductions Certificate", meta: "Cap ₹1,50,000 Exhausted", xPct: 85, yPct: 56, rotZ: 6, scale: 0.90, opacity: 0.42 },
  { id: "c15", category: "RETURNS", code: "PERF // XIRR", primary: "Portfolio Realized Rate", meta: "Aggregated: 15.4% p.a.", xPct: 8, yPct: 62, rotZ: -4, scale: 0.94, opacity: 0.46 },
  { id: "c16", category: "INSURANCE", code: "HEALTH // 80D", primary: "Term & Health Ledger", meta: "Sum Insured: ₹1.00 Cr", xPct: 78, yPct: 64, rotZ: 4, scale: 0.88, opacity: 0.40 },

  // Beat 2 Zone: Flanking the Resolution (y: 68% - 96%)
  { id: "c17", category: "ASSETS", code: "SPLIT // 60-30", primary: "Asset Class Allocation", meta: "Equity 62% • Debt 28%", xPct: 5, yPct: 70, rotZ: 6, scale: 0.98, opacity: 0.48 },
  { id: "c18", category: "SAVINGS", code: "PPF // A/C-09", primary: "Public Provident Fund", meta: "Tax-Exempt Yield: 7.1%", xPct: 18, yPct: 76, rotZ: -8, scale: 0.92, opacity: 0.44 },
  { id: "c19", category: "DIVIDENDS", code: "CASH // YIELD", primary: "Corporate Actions Log", meta: "Net Payout Credited", xPct: 88, yPct: 72, rotZ: -5, scale: 0.95, opacity: 0.46 },
  { id: "c20", category: "FEES", code: "DIRECT // TER", primary: "Expense Ratio Audit", meta: "Savings vs Regular: 0.8%", xPct: 82, yPct: 80, rotZ: 7, scale: 0.90, opacity: 0.45 },
  { id: "c21", category: "REBALANCE", code: "DRIFT // 04", primary: "Asset Weight Review", meta: "Equity Variance: +2.1%", xPct: 6, yPct: 84, rotZ: -3, scale: 0.94, opacity: 0.46 },
  { id: "c22", category: "LIQUIDITY", code: "EMERGENCY", primary: "Six Months Buffer Fund", meta: "Insta-Redeemable Liquid", xPct: 22, yPct: 88, rotZ: 5, scale: 0.88, opacity: 0.42 },
  { id: "c23", category: "VALUATION", code: "NAV // DAILY", primary: "Consolidated Net Worth", meta: "Updated at 11:30 PM", xPct: 75, yPct: 88, rotZ: -6, scale: 0.96, opacity: 0.48 },
  { id: "c24", category: "REPORTS", code: "UNIFOLIO // CAS", primary: "Multi-Asset Ledger", meta: "Bank + Broker + Pension", xPct: 88, yPct: 94, rotZ: 4, scale: 0.92, opacity: 0.44 },
  { id: "c25", category: "AUDIT", code: "SECURITY // 256", primary: "Read-Only Encryption", meta: "Zero Credentials Held", xPct: 14, yPct: 94, rotZ: -7, scale: 0.90, opacity: 0.40 },
  { id: "c26", category: "CLARITY", code: "UNIFOLIO // 01", primary: "Family Wealth Summary", meta: "One Unified Picture", xPct: 45, yPct: 96, rotZ: 2, scale: 1.0, opacity: 0.50 },
];

/**
 * Every DOM/value/timeline ref this scene's own logic touches, still
 * declared (and owned) in BlueprintHero.tsx.
 */
export interface AboutSceneRefs {
  aboutContentRef: MutableRefObject<HTMLDivElement | null>;
  unifiedEnvelopeRef: MutableRefObject<HTMLDivElement | null>;
  envelopeTopFlapRef: MutableRefObject<HTMLDivElement | null>;
  envelopeSealRef: MutableRefObject<HTMLDivElement | null>;
  docCavityWrapperRef: MutableRefObject<HTMLDivElement | null>;
  philosophyDocRef: MutableRefObject<HTMLDivElement | null>;
  docPaperSheetRef: MutableRefObject<HTMLDivElement | null>;
  docInkCopyRef: MutableRefObject<HTMLDivElement | null>;
  docFlipperRef: MutableRefObject<HTMLDivElement | null>;
  aboutOrbitTweenRef: MutableRefObject<gsap.core.Tween | null>;
  stageRef: MutableRefObject<HTMLDivElement | null>;
  irisPortalRef: MutableRefObject<HTMLDivElement | null>;
  headerRef: MutableRefObject<HTMLDivElement | null>;
  heroIntroRef: MutableRefObject<HTMLDivElement | null>;
  heroVisualRef: MutableRefObject<HTMLDivElement | null>;
  portalRimRef: MutableRefObject<HTMLDivElement | null>;
  portalRippleRef: MutableRefObject<HTMLDivElement | null>;
  productWorldRef: MutableRefObject<HTMLDivElement | null>;
  cardsStageRef: MutableRefObject<HTMLDivElement | null>;
  cardsClusterRef: MutableRefObject<HTMLDivElement | null>;
  cardWrapperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  companionCardRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  securityStageRef: MutableRefObject<HTMLDivElement | null>;
  securityStateRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  safeContainerRef: MutableRefObject<HTMLDivElement | null>;
  safeVault3DRef: MutableRefObject<{ pauseAmbient?: (reset?: boolean) => void } | null>;
}

export interface AboutSceneShared {
  dispatchActiveSection: (section: string) => void;
  consolidateRingToStack: () => void;
  applyPortalClip?: (r: number, x: number, y: number) => void;
  maxRadiusPx?: number;
}

export interface AboutSceneHandle {
  computeEnvelopeParams: () => {
    isDesk: boolean;
    isTab: boolean;
    envScale: number;
    scatterSlots: {
      x: number; y: number; z: number; rotZ: number; rotX: number; rotY: number; scale: number;
    }[];
  };
  flipDocToPage: (targetPage: 1 | 2) => void;
  exitAboutToFaq: () => void;
  jumpToAboutState: (targetPage?: 1 | 2) => void;
}

interface AboutSceneProps {
  engine: SceneEngine;
  refs: AboutSceneRefs;
  shared: MutableRefObject<AboutSceneShared>;
}

export const AboutScene = forwardRef<AboutSceneHandle, AboutSceneProps>(
  function AboutScene({ engine: _engine, refs: _refs, shared: _shared }, forwardedRef) {
    const computeEnvelopeParams = () => {
      const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
      const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
      const envScale = isDesk ? 0.72 : isTab ? 0.60 : 0.50;

      const scatterSlots = SCATTER_SLOTS.map((slot) => ({
        ...slot,
        scale: envScale * slot.scale,
      }));

      return {
        isDesk,
        isTab,
        envScale,
        scatterSlots,
      };
    };

    const flipDocToPage = (_targetPage: 1 | 2) => {};
    const exitAboutToFaq = () => {};
    const jumpToAboutState = (_targetPage: 1 | 2 = 1) => {};

    useImperativeHandle(
      forwardedRef,
      () => ({
        computeEnvelopeParams,
        flipDocToPage,
        exitAboutToFaq,
        jumpToAboutState,
      }),
      []
    );

    return null;
  }
);

interface AboutBackgroundSlotProps {
  aboutContentRef: MutableRefObject<HTMLDivElement | null>;
}

export function AboutBackgroundSlot({ aboutContentRef }: AboutBackgroundSlotProps) {
  return (
    <div
      ref={aboutContentRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ opacity: 1, visibility: "visible", zIndex: 0 }}
    >
      {/* Quiet Monochrome Collage — 26 Desaturated Editorial Fragments */}
      <div className="absolute inset-0 pointer-events-none">
        {ABOUT_COLLAGE_FRAGMENTS.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none select-none hidden md:block rounded-[6px] border border-neutral-300/50 bg-[#F5F1E8]/85 p-2 sm:p-2.5 shadow-[0_1px_3px_rgba(28,36,30,0.02)] transition-opacity"
            style={{
              left: `${item.xPct}%`,
              top: `${item.yPct}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotZ}deg) scale(${item.scale})`,
              opacity: item.opacity,
              width: "148px",
            }}
          >
            <div className="flex items-center justify-between gap-1.5 border-b border-neutral-300/40 pb-1 mb-1">
              <span className="font-mono text-[8px] font-bold tracking-wider text-neutral-400 uppercase truncate">
                {item.category}
              </span>
              <span className="font-mono text-[8px] text-neutral-400 shrink-0">
                {item.code}
              </span>
            </div>
            <p className="font-sans text-[10px] font-bold text-neutral-700 leading-tight truncate">
              {item.primary}
            </p>
            <p className="font-mono text-[8px] text-neutral-400 mt-0.5 leading-tight truncate">
              {item.meta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AboutEnvelopeSlotProps {
  unifiedEnvelopeRef?: MutableRefObject<HTMLDivElement | null>;
  docCavityWrapperRef?: MutableRefObject<HTMLDivElement | null>;
  philosophyDocRef?: MutableRefObject<HTMLDivElement | null>;
  docPaperSheetRef?: MutableRefObject<HTMLDivElement | null>;
  docFlipperRef?: MutableRefObject<HTMLDivElement | null>;
  docInkCopyRef?: MutableRefObject<HTMLDivElement | null>;
  envelopeTopFlapRef?: MutableRefObject<HTMLDivElement | null>;
  envelopeSealRef?: MutableRefObject<HTMLDivElement | null>;
}

export function AboutEnvelopeSlot({
  unifiedEnvelopeRef,
}: AboutEnvelopeSlotProps) {
  const beat1Ref = useRef<HTMLDivElement | null>(null);
  const beat2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const beat1 = beat1Ref.current;
    const beat2 = beat2Ref.current;
    if (!beat1 || !beat2) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        beat1,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: beat1,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        beat2,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: beat2,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={unifiedEnvelopeRef}
      className="relative w-full flex flex-col gap-28 sm:gap-36 lg:gap-44 select-none"
      style={{ zIndex: 10 }}
    >
      {/* Top Editorial Eyebrow & Brand Signature */}
      <div className="flex items-center justify-between w-full border-b border-neutral-300/60 pb-6 sm:pb-8">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 relative shrink-0">
            <img
              src="/Logo/unifolio-ring-transparent.png"
              alt="Unifolio Ring"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-neutral-900">
              About Us
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-neutral-400 tracking-wider">
              The Philosophy // Statement 04
            </span>
          </div>
        </div>

        <span className="font-mono text-xs sm:text-sm text-neutral-400 tracking-widest hidden sm:inline">
          01 &mdash; 02
        </span>
      </div>

      {/* BEAT 1: The Problem (Asymmetric, Left-Weighted) */}
      <div
        ref={beat1Ref}
        className="relative w-full max-w-3xl lg:mr-auto pl-0 lg:pl-2"
      >
        <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-400 block mb-4 sm:mb-6">
          01 / The Problem
        </span>

        <h2 className="font-serif font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-neutral-950 leading-[1.12] tracking-[-0.025em] text-left">
          In most families, someone ends up in charge of the money.
          <span className="block mt-2 sm:mt-3 font-normal text-neutral-700">
            Not because they trained for it.{" "}
            <span className="font-serif italic font-medium text-[#22C55E] tracking-normal">
              Because someone has to.
            </span>
          </span>
        </h2>

        <div className="mt-8 sm:mt-10 lg:mt-12 pl-5 sm:pl-6 border-l-2 border-neutral-300/80 max-w-xl">
          <p className="font-sans font-normal text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed text-left">
            Their financial data lives across a dozen apps and statements. There&apos;s a gap between seeing it all and actually understanding it.
          </p>
        </div>
      </div>

      {/* BEAT 2: The Resolution (Asymmetric, Right-Weighted, Louder & Bigger) */}
      <div
        ref={beat2Ref}
        className="relative w-full max-w-4xl lg:ml-auto pr-0 lg:pr-2"
      >
        <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#22C55E] block mb-4 sm:mb-6">
          02 / The Resolution
        </span>

        <h3 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl lg:text-[70px] xl:text-[76px] text-neutral-950 leading-[1.04] tracking-[-0.03em] text-left">
          Unifolio exists <br className="hidden sm:inline" />
          <span className="font-serif italic font-light text-neutral-800">
            to close{" "}
          </span>
          that gap.
        </h3>

        <p className="mt-8 sm:mt-10 lg:mt-12 font-sans font-normal text-lg sm:text-xl md:text-2xl text-neutral-700 leading-snug max-w-2xl text-left">
          The same clarity a wealth manager gives their wealthiest clients, now available to anyone. Whether they hold ₹5 lakh or ₹5 crore. Whether they&apos;ve studied finance or never touched a balance sheet.
        </p>

        {/* Closing Statement */}
        <div className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-neutral-300/70 max-w-2xl">
          <p className="font-sans text-lg sm:text-xl md:text-2xl text-neutral-800 font-medium text-left">
            Seeing your money isn&apos;t the same as{" "}
            <span className="block sm:inline font-serif italic font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#22C55E] tracking-tight">
              understanding it.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
