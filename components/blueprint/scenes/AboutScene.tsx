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
  { x: -160, y: -45, z: 8, rotZ: -14, rotX: -4, rotY: 6, scale: 0.65 },
  { x: 145, y: 35, z: 12, rotZ: 12, rotX: 5, rotY: -7, scale: 0.66 },
  { x: -75, y: 65, z: 16, rotZ: -8, rotX: 3, rotY: 4, scale: 0.68 },
  { x: 95, y: -55, z: 10, rotZ: 15, rotX: -5, rotY: -5, scale: 0.65 },
  { x: -190, y: 20, z: 6, rotZ: -12, rotX: 2, rotY: 8, scale: 0.62 },
  { x: 180, y: -25, z: 14, rotZ: 10, rotX: -3, rotY: -8, scale: 0.63 },
  { x: -40, y: -75, z: 18, rotZ: 7, rotX: -6, rotY: 3, scale: 0.67 },
  { x: 50, y: 80, z: 15, rotZ: -11, rotX: 6, rotY: -4, scale: 0.66 },
  { x: -125, y: -80, z: 9, rotZ: -16, rotX: -4, rotY: 7, scale: 0.64 },
  { x: 130, y: 85, z: 11, rotZ: 13, rotX: 4, rotY: -6, scale: 0.65 },
  { x: -105, y: 35, z: 17, rotZ: -6, rotX: 2, rotY: 5, scale: 0.68 },
  { x: 110, y: -30, z: 13, rotZ: 9, rotX: -3, rotY: -5, scale: 0.66 },
  { x: -15, y: 45, z: 22, rotZ: 5, rotX: 4, rotY: 2, scale: 0.70 },
  { x: 25, y: -40, z: 20, rotZ: -7, rotX: -4, rotY: -3, scale: 0.69 },
  { x: -215, y: -20, z: 5, rotZ: -15, rotX: -2, rotY: 9, scale: 0.61 },
  { x: 210, y: 30, z: 7, rotZ: 16, rotX: 3, rotY: -9, scale: 0.61 },
  { x: -65, y: -40, z: 19, rotZ: 8, rotX: -3, rotY: 4, scale: 0.68 },
  { x: 75, y: 45, z: 16, rotZ: -9, rotX: 4, rotY: -4, scale: 0.67 },
  { x: -145, y: 70, z: 8, rotZ: 11, rotX: 5, rotY: 6, scale: 0.63 },
  { x: 155, y: -70, z: 10, rotZ: -13, rotX: -5, rotY: -7, scale: 0.63 },
  { x: -30, y: 90, z: 21, rotZ: -5, rotX: 6, rotY: 2, scale: 0.69 },
  { x: 35, y: -85, z: 19, rotZ: 6, rotX: -6, rotY: -2, scale: 0.69 },
  { x: -85, y: 10, z: 23, rotZ: 4, rotX: 1, rotY: 3, scale: 0.71 },
  { x: 80, y: -10, z: 24, rotZ: -4, rotX: -1, rotY: -3, scale: 0.71 },
  { x: -10, y: -15, z: 26, rotZ: 2, rotX: -2, rotY: 1, scale: 0.72 },
  { x: 10, y: 15, z: 27, rotZ: -2, rotX: 2, rotY: -1, scale: 0.72 },
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
  // Upper zone: Transition from Security (y: 2% - 14%)
  { id: "c1", category: "MUTUAL FUNDS", code: "CAMS // CAS-01", primary: "Consolidated Statement", meta: "14 Folios Verified", xPct: 6, yPct: 4, rotZ: -6, scale: 0.95, opacity: 0.30 },
  { id: "c2", category: "REGULATOR", code: "RBI // AA-LINK", primary: "Account Aggregator", meta: "Consent ID: #7741", xPct: 88, yPct: 5, rotZ: 5, scale: 0.92, opacity: 0.30 },
  { id: "c3", category: "EQUITY", code: "NSDL // DP-92", primary: "Holding Statement", meta: "ISIN: INE002A01018", xPct: 18, yPct: 10, rotZ: 4, scale: 0.88, opacity: 0.32 },
  { id: "c4", category: "TAXATION", code: "ITD // AIS-26AS", primary: "Annual Info Statement", meta: "FY2024-25 Reconciled", xPct: 80, yPct: 11, rotZ: -4, scale: 0.90, opacity: 0.32 },
  { id: "c5", category: "PENSION", code: "EPFO // UAN-41", primary: "Provident Fund Passbook", meta: "Monthly Accrual Active", xPct: 48, yPct: 6, rotZ: -2, scale: 0.85, opacity: 0.25 },

  // Left Gutter (x: 4% - 8%, y: 18% - 78%) - completely clear of central text
  { id: "c6", category: "DEPOSITS", code: "HDFC // FD-882", primary: "Fixed Deposit Receipt", meta: "7.40% • Compounded Qtr", xPct: 5, yPct: 18, rotZ: 7, scale: 0.92, opacity: 0.34 },
  { id: "c7", category: "MUTUAL FUNDS", code: "KFIN // FOL-12", primary: "Systematic Investment", meta: "Auto-Debit: ₹25,000", xPct: 8, yPct: 28, rotZ: -7, scale: 0.90, opacity: 0.34 },
  { id: "c8", category: "GOLD", code: "RBI // SGB-IV", primary: "Sovereign Gold Bond", meta: "Issue 2023-24 Series IV", xPct: 4, yPct: 38, rotZ: 4, scale: 0.88, opacity: 0.32 },
  { id: "c9", category: "CAPITAL GAINS", code: "TAX // 112A-CG", primary: "LTCG Ledger Summary", meta: "Grandfathered NAV Stmt", xPct: 7, yPct: 48, rotZ: 6, scale: 0.92, opacity: 0.34 },
  { id: "c10", category: "EQUITY", code: "CDSL // CAS-58", primary: "Demat Pool Allocation", meta: "Total Scrips: 28", xPct: 4, yPct: 58, rotZ: -5, scale: 0.90, opacity: 0.34 },
  { id: "c11", category: "BENCHMARK", code: "TRI // NIFTY50", primary: "Total Return Benchmark", meta: "Relative Drift: +3.2%", xPct: 8, yPct: 68, rotZ: -4, scale: 0.86, opacity: 0.32 },
  { id: "c12", category: "PENSION", code: "PFRDA // PRAN", primary: "Tier-1 Auto Choice", meta: "Allocation: E50/C30/G20", xPct: 5, yPct: 78, rotZ: 6, scale: 0.88, opacity: 0.30 },

  // Right Gutter (x: 88% - 93%, y: 18% - 78%) - completely clear of central text
  { id: "c13", category: "BONDS", code: "CRISIL // AAA", primary: "PSU Corporate Debt", meta: "8.15% Maturing 2029", xPct: 91, yPct: 18, rotZ: -6, scale: 0.92, opacity: 0.34 },
  { id: "c14", category: "TAX", code: "SEC // 80C-D", primary: "Deductions Certificate", meta: "Cap ₹1,50,000 Exhausted", xPct: 88, yPct: 28, rotZ: 5, scale: 0.90, opacity: 0.34 },
  { id: "c15", category: "RETURNS", code: "PERF // XIRR", primary: "Portfolio Realized Rate", meta: "Aggregated: 15.4% p.a.", xPct: 93, yPct: 38, rotZ: -5, scale: 0.92, opacity: 0.36 },
  { id: "c16", category: "INSURANCE", code: "HEALTH // 80D", primary: "Term & Health Ledger", meta: "Sum Insured: ₹1.00 Cr", xPct: 89, yPct: 48, rotZ: 4, scale: 0.88, opacity: 0.34 },
  { id: "c17", category: "ASSETS", code: "SPLIT // 60-30", primary: "Asset Class Allocation", meta: "Equity 62% • Debt 28%", xPct: 92, yPct: 58, rotZ: 6, scale: 0.94, opacity: 0.36 },
  { id: "c18", category: "SAVINGS", code: "PPF // A/C-09", primary: "Public Provident Fund", meta: "Tax-Exempt Yield: 7.1%", xPct: 89, yPct: 68, rotZ: -6, scale: 0.90, opacity: 0.34 },
  { id: "c19", category: "DIVIDENDS", code: "CASH // YIELD", primary: "Corporate Actions Log", meta: "Net Payout Credited", xPct: 92, yPct: 78, rotZ: -4, scale: 0.92, opacity: 0.36 },

  // Lower zone: Bottom Gutter (y: 88% - 97%) - below central text
  { id: "c20", category: "FEES", code: "DIRECT // TER", primary: "Expense Ratio Audit", meta: "Savings vs Regular: 0.8%", xPct: 6, yPct: 88, rotZ: 5, scale: 0.90, opacity: 0.32 },
  { id: "c21", category: "REBALANCE", code: "DRIFT // 04", primary: "Asset Weight Review", meta: "Equity Variance: +2.1%", xPct: 20, yPct: 94, rotZ: -3, scale: 0.92, opacity: 0.32 },
  { id: "c22", category: "LIQUIDITY", code: "EMERGENCY", primary: "Six Months Buffer Fund", meta: "Insta-Redeemable Liquid", xPct: 36, yPct: 96, rotZ: 4, scale: 0.88, opacity: 0.30 },
  { id: "c23", category: "VALUATION", code: "NAV // DAILY", primary: "Consolidated Net Worth", meta: "Updated at 11:30 PM", xPct: 64, yPct: 96, rotZ: -4, scale: 0.92, opacity: 0.32 },
  { id: "c24", category: "REPORTS", code: "UNIFOLIO // CAS", primary: "Multi-Asset Ledger", meta: "Bank + Broker + Pension", xPct: 80, yPct: 94, rotZ: 3, scale: 0.90, opacity: 0.32 },
  { id: "c25", category: "AUDIT", code: "SECURITY // 256", primary: "Read-Only Encryption", meta: "Zero Credentials Held", xPct: 93, yPct: 88, rotZ: -5, scale: 0.90, opacity: 0.32 },
  { id: "c26", category: "CLARITY", code: "UNIFOLIO // 01", primary: "Family Wealth Summary", meta: "One Unified Picture", xPct: 50, yPct: 97, rotZ: 0, scale: 0.95, opacity: 0.36 },
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

    const flipDocToPage = (_targetPage: 1 | 2) => { };
    const exitAboutToFaq = () => { };
    const jumpToAboutState = (_targetPage: 1 | 2 = 1) => { };

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
      {/* Quiet Monochrome Collage — 26 Desaturated Editorial Fragments that align on morph */}
      <div className="absolute inset-0 pointer-events-none">
        {ABOUT_COLLAGE_FRAGMENTS.map((item) => (
          <div
            key={item.id}
            data-initial-rot={item.rotZ}
            className="about-collage-card absolute pointer-events-none select-none hidden md:block rounded-[6px] border border-neutral-300/50 bg-[#F5F1E8]/85 p-2 sm:p-2.5 shadow-[0_1px_3px_rgba(28,36,30,0.02)] transition-opacity"
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beat1Ref = useRef<HTMLDivElement | null>(null);
  const beat2Ref = useRef<HTMLDivElement | null>(null);
  const swooshRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const beat1 = beat1Ref.current;
    const beat2 = beat2Ref.current;
    const container = containerRef.current;
    if (!beat1 || !beat2 || !container) return;

    // Track is the enclosing #about section
    const track = container.closest("#about") || container;

    const ctx = gsap.context(() => {
      // Calculate swoosh path length safely
      let swooshLength = 600;
      if (swooshRef.current) {
        try {
          swooshLength = swooshRef.current.getTotalLength() || 600;
          gsap.set(swooshRef.current, {
            strokeDasharray: swooshLength,
            strokeDashoffset: swooshLength,
            opacity: 0,
          });
        } catch (_) {}
      }

      // Initial state of the two beats
      gsap.set(beat1, { opacity: 1, y: 0, pointerEvents: "auto" });
      gsap.set(beat2, { opacity: 0, y: 32, pointerEvents: "none" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // TIMELINE CHOREOGRAPHY IN SINGLE VIEWPORT:
      // 0.00 -> 0.22: Dwell on Beat 1 (Problem)
      // 0.22 -> 0.44: Beat 1 lifts up and fades out
      tl.to(
        beat1,
        {
          opacity: 0,
          y: -28,
          pointerEvents: "none",
          duration: 0.22,
          ease: "power2.in",
        },
        0.22
      );

      // 0.35 -> 0.65: Collage fragments smoothly rotate to 0deg (Scattered -> Tidy)
      const collageCards = document.querySelectorAll<HTMLElement>(".about-collage-card");
      if (collageCards.length > 0) {
        tl.to(
          collageCards,
          {
            rotation: 0,
            stagger: 0.004,
            duration: 0.28,
            ease: "power2.inOut",
          },
          0.35
        );
      }

      // 0.48 -> 0.72: Beat 2 enters and locks into focus
      tl.to(
        beat2,
        {
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          duration: 0.24,
          ease: "power2.out",
        },
        0.48
      );

      // Connective green flourish underline draws under "actually understand them."
      if (swooshRef.current) {
        tl.to(
          swooshRef.current,
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.22,
            ease: "power1.inOut",
          },
          0.52
        );
      }

      // 0.72 -> 1.00: Dwell on Beat 2 (Resolution)
      tl.to({}, { duration: 0.28 }, 0.72);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (unifiedEnvelopeRef) {
          unifiedEnvelopeRef.current = el;
        }
      }}
      className="relative w-full h-full flex flex-col items-center justify-center select-none"
      style={{ zIndex: 10 }}
    >
      {/* Center Stage: Single Viewport In-Place Focus */}
      <div className="relative w-full flex-1 flex items-center justify-center my-auto min-h-[360px] sm:min-h-[440px]">
        {/* BEAT 1: The Problem (Active on initial entry) */}
        <div
          ref={beat1Ref}
          className="absolute inset-x-0 flex flex-col justify-center max-w-3xl lg:max-w-4xl lg:mr-auto pl-0 lg:pl-2 text-left z-10"
        >
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] text-neutral-950 leading-[1.12] tracking-[-0.025em]">
            In most families, someone ends up in charge of the money.
            <span className="block mt-3 sm:mt-4 font-normal text-neutral-700">
              Not because they trained for it.{" "}
              <span className="font-serif italic font-medium text-[#22C55E] tracking-normal">
                Because someone has to.
              </span>
            </span>
          </h2>
        </div>

        {/* BEAT 2: The Resolution (Reveals in place as user scrolls) */}
        <div
          ref={beat2Ref}
          className="absolute inset-x-0 flex flex-col justify-center max-w-3xl lg:max-w-4xl lg:ml-auto pr-0 lg:pr-2 text-left z-10"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <h3 className="font-serif font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] text-neutral-950 leading-[1.12] tracking-[-0.025em]">
            Unifolio brings the whole family&apos;s finances <br className="hidden sm:inline" />
            into one place,{" "}
            <span className="block mt-3 sm:mt-4 font-normal text-neutral-800">
              and helps you{" "}
              <span className="font-serif italic font-light text-neutral-900">
                actually{" "}
              </span>
              <span className="font-serif italic font-semibold text-[#22C55E] tracking-normal">
                understand them.
              </span>
            </span>
          </h3>

          {/* Connective Green Swoosh Flourish — Cleanly positioned below "actually understand them.", 100% collision-free */}
          <div className="relative w-56 sm:w-72 h-6 sm:h-7 mt-3 mb-2 pointer-events-none overflow-visible">
            <svg
              viewBox="0 0 260 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                ref={swooshRef}
                d="M 4 16 C 70 24, 175 22, 252 6"
                stroke="#22C55E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="252" cy="6" r="3.5" fill="#22C55E" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
