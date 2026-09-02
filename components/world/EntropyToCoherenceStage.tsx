"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { ArcMark } from "@/components/ui/ArcMark";
import { SketchbookRibbonStream } from "@/components/canvas/SketchbookRibbonStream";
import { HeroBloomIllustration } from "@/components/illustrations/HeroBloomIllustration";
import { ScatteredToOrderedIllustration } from "@/components/illustrations/ScatteredToOrderedIllustration";
import { WindingJourneyIllustration } from "@/components/illustrations/WindingJourneyIllustration";
import { SketchFolderIllustration } from "@/components/illustrations/SketchFolderIllustration";
import {
  HandDrawnUnderline,
  HandDrawnCircle,
  HandDrawnArrow,
  HandDrawnSparkle,
  HandDrawnBadgeIcon,
} from "@/components/illustrations/HandDrawnAnnotations";
import { PortfolioTerminal } from "@/components/product/PortfolioTerminal";
import { InteractiveFeeLens } from "@/components/product/InteractiveFeeLens";
import { InteractiveScoreDial } from "@/components/product/InteractiveScoreDial";
import { FaqSection } from "@/components/sections/FaqSection";
import { homeContent } from "@/content/home";
import { faqContent } from "@/content/faq";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function EntropyToCoherenceStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [alignment, setAlignment] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track scroll progression smoothly
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.1) {
        setAlignment(0);
      } else if (latest > 0.4) {
        setAlignment(1);
      } else {
        setAlignment((latest - 0.1) / 0.3);
      }
    });
  }, [scrollYProgress]);

  // Stage Transitions
  // Epoch I (Hero): 0.0 -> 0.22
  const heroOpacity = useTransform(scrollYProgress, [0, 0.16, 0.24], [1, 1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.24], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.24], [0, -40]);

  // Epoch II (Convergence): 0.22 -> 0.48
  const convergeOpacity = useTransform(scrollYProgress, [0.2, 0.28, 0.45, 0.52], [0, 1, 1, 0]);
  const convergeScale = useTransform(scrollYProgress, [0.2, 0.28, 0.45, 0.52], [0.94, 1, 1, 0.94]);

  // Epoch III (Fee Dissection): 0.48 -> 0.74
  const feeOpacity = useTransform(scrollYProgress, [0.48, 0.55, 0.7, 0.76], [0, 1, 1, 0]);
  const feeScale = useTransform(scrollYProgress, [0.48, 0.55, 0.7, 0.76], [0.94, 1, 1, 0.94]);

  // Epoch IV (Score Monolith): 0.74 -> 1.0
  const scoreOpacity = useTransform(scrollYProgress, [0.74, 0.8, 1], [0, 1, 1]);
  const scoreScale = useTransform(scrollYProgress, [0.74, 0.82], [0.94, 1]);

  return (
    <div ref={containerRef} className="relative h-[380vh] sm:h-[430vh]">
      {/* Sticky Interactive Viewport World */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-paper px-4 sm:px-8 py-5 sm:py-6 select-none">
        {/* Living Sketchbook Ribbon Stream */}
        <SketchbookRibbonStream progress={alignment} className="opacity-90" />

        {/* Top Minimalist Editorial Telemetry Bar */}
        <div className="relative z-20 flex items-center justify-between border-b border-ink/[0.07] pb-3 font-sans text-xs text-ink-soft">
          <div className="flex items-center gap-2.5">
            <ArcMark className="h-5 w-5" score={alignment * 100 || 45} animated />
            <span className="font-bold text-ink">UNIFOLIO</span>
            <span className="text-ink-faint">·</span>
            <span className="hidden sm:inline font-medium text-ink-soft">India&apos;s Honest Mutual Fund Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="hidden md:inline text-ink-faint">44+ AMCs · CAMS & KFintech</span>
            <span className="rounded-full bg-mint-100 border border-mint-200 px-2.5 py-0.5 font-bold text-accent-dark">
              100% FREE
            </span>
          </div>
        </div>

        {/* Central Spatial Stage */}
        <div className="relative z-20 mx-auto my-auto w-full max-w-wide">
          {/* ======================================================== */}
          {/* EPOCH I: THE LIVING HERO (BLOOM & SKETCH IDENTITY)       */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: heroOpacity,
              scale: heroScale,
              y: heroY,
              pointerEvents: alignment > 0.2 ? "none" : "auto",
            }}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 max-w-6xl mx-auto"
          >
            {/* Left Column: Bold Headline & Editorial Storytelling */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-mint-300 bg-mint-50/90 px-4 py-1.5 shadow-sm backdrop-blur-md">
                <HandDrawnSparkle className="h-4 w-4 text-accent" />
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-accent-dark">
                  Zero Broker Toll · Direct Mutual Funds
                </span>
              </div>

              {/* Bold App-Matching Headline */}
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-ink leading-[1.02]">
                <span className="text-accent block">Scattered</span>
                holdings, one clear picture<span className="text-accent">.</span>
              </h1>

              {/* Editorial Subhead */}
              <p className="max-w-xl font-sans text-base sm:text-lg text-ink-soft leading-relaxed">
                Import your consolidated CAS statement from CAMS or KFintech. Unifolio parses every folio, calculates true XIRR, and strips away distributor commission drag.
              </p>

              {/* Actions & Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <LinkButton href="/get-started" variant="primary" className="text-base px-7 py-3.5 shadow-sketch-btn">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>

                <LinkButton href="/features" variant="ghost" className="text-base px-6 py-3.5">
                  <span>See How It Works</span>
                </LinkButton>
              </div>

              {/* Subtle Hand-Drawn Note & Trust Elements */}
              <div className="pt-2 flex items-center gap-4 font-sans text-xs text-ink-faint">
                <span className="flex items-center gap-1.5 text-ink-soft">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>AES-256 Client-Side Zero Storage</span>
                </span>
                <span>•</span>
                <span>Scroll to see the sketch unfold ↓</span>
              </div>
            </div>

            {/* Right Column: Hand-Drawn Hero Bloom Illustration */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <HeroBloomIllustration className="w-full max-w-[420px] h-[460px]" />
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* EPOCH II: THE CONVERGENCE (BROKERS UNIFIED INTO LEDGER)  */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: convergeOpacity,
              scale: convergeScale,
              pointerEvents: alignment < 0.2 || alignment > 0.52 ? "none" : "auto",
            }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <div className="text-center max-w-3xl mx-auto mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-mint-300 bg-mint-50 px-3.5 py-1 font-sans text-xs font-bold text-accent-dark mb-2">
                <HandDrawnSparkle className="h-3.5 w-3.5" />
                <span>EPOCH 01 · CONVERGENCE</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
                Every broker folios become <HandDrawnCircle color="#22C55E">one</HandDrawnCircle>.
              </h2>
              <p className="mt-2 font-sans text-sm sm:text-base text-ink-soft">
                Zerodha, Groww, Kuvera, CAMS, and KFintech seamlessly organized into one clean ledger.
              </p>
            </div>

            <div className="mx-auto max-w-4xl w-full">
              <PortfolioTerminal compact />
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* EPOCH III: THE FEE DISSECTION (DISTRIBUTOR DRAG)         */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: feeOpacity,
              scale: feeScale,
              pointerEvents: alignment < 0.48 || alignment > 0.76 ? "none" : "auto",
            }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <div className="text-center max-w-2xl mx-auto mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-mint-300 bg-mint-50 px-3.5 py-1 font-sans text-xs font-bold text-accent-dark mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                <span>EPOCH 02 · OPTICAL DISSECTION</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
                Peel back the <span className="text-accent">hidden commission</span>.
              </h2>
              <p className="mt-2 font-sans text-sm sm:text-base text-ink-soft">
                Drag the interactive lens to see distributor trail commissions burn into compounding alpha.
              </p>
            </div>

            <div className="mx-auto max-w-3xl w-full">
              <InteractiveFeeLens />
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* EPOCH IV: THE SCORE MONOLITH (PORTFOLIO HEALTH RING)     */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: scoreOpacity,
              scale: scoreScale,
              pointerEvents: alignment < 0.74 ? "none" : "auto",
            }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <div className="text-center max-w-2xl mx-auto mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-mint-300 bg-mint-50 px-3.5 py-1 font-sans text-xs font-bold text-accent-dark mb-2">
                <ArcMark className="h-3.5 w-3.5" score={100} animated />
                <span>EPOCH 03 · THE DIAGNOSTIC MONOLITH</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
                Honest, explainable clarity.
              </h2>
              <p className="mt-2 font-sans text-sm sm:text-base text-ink-soft">
                An instant health check based on real cashflows, folio overlap, and direct cost ratio.
              </p>
            </div>

            <div className="mx-auto max-w-3xl w-full">
              <InteractiveScoreDial />
            </div>
          </motion.div>
        </div>

        {/* Bottom Interactive Epoch Progress Tracker */}
        <div className="relative z-20 flex items-center justify-between border-t border-ink/[0.07] pt-3 font-sans text-xs text-ink-soft">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-ink font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Zero-Storage Client-Side Security</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-ink-faint">CHAPTER:</span>
            <span className="font-bold text-accent">
              {alignment < 0.2
                ? "01 / SCATTERED TO BLOOM"
                : alignment < 0.52
                ? "02 / CONVERGENCE LEDGER"
                : alignment < 0.76
                ? "03 / FEE DISSECTION"
                : "04 / PORTFOLIO SCORE"}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION V: EDITORIAL SKETCH FEATURES & THE ZERO-TOLL     */}
      {/* ======================================================== */}
      <div className="relative z-30 bg-paper pt-24 pb-20">
        <div className="mx-auto max-w-wide px-4 sm:px-8 space-y-24">
          {/* Editorial Feature Showcase Grid (Hand-Drawn Sketches) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Scattered to Ordered */}
            <div className="sketch-panel p-8 flex flex-col justify-between hover:border-mint-400 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <HandDrawnBadgeIcon type="gauge" />
                  <span className="font-mono text-xs text-ink-faint">01 / TRACKING</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink">
                  Consolidated View
                </h3>
                <p className="mt-2 font-sans text-sm text-ink-soft leading-relaxed">
                  Every mutual fund across CAMS, KFintech, and all 44+ AMCs synced in one clean ledger.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <ScatteredToOrderedIllustration className="w-full h-48" />
              </div>
            </div>

            {/* Card 2: Winding Journey */}
            <div className="sketch-panel p-8 flex flex-col justify-between hover:border-mint-400 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <HandDrawnBadgeIcon type="lens" />
                  <span className="font-mono text-xs text-ink-faint">02 / INSIGHTS</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink">
                  True Net XIRR
                </h3>
                <p className="mt-2 font-sans text-sm text-ink-soft leading-relaxed">
                  Calculate real internal rate of return after accounting for all dividends, taxes, and fees.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <WindingJourneyIllustration className="w-full h-48" />
              </div>
            </div>

            {/* Card 3: Folder & Family Wealth */}
            <div className="sketch-panel p-8 flex flex-col justify-between hover:border-mint-400 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <HandDrawnBadgeIcon type="folder" />
                  <span className="font-mono text-xs text-ink-faint">03 / FAMILY</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink">
                  Household Folios
                </h3>
                <p className="mt-2 font-sans text-sm text-ink-soft leading-relaxed">
                  Organize multiple PAN statements under one master view for family wealth oversight.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <SketchFolderIllustration className="w-full h-48" />
              </div>
            </div>
          </div>

          {/* Zero-Toll Philosophy Card */}
          <div className="sketch-panel-mint p-8 sm:p-14 lg:p-16 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-12 -top-12 font-display text-[16rem] font-extrabold text-accent/[0.04] select-none leading-none">
              ₹0
            </div>

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-mint-300 bg-mint-100/90 px-4 py-1.5 font-sans text-xs font-bold text-accent-dark">
                  <HandDrawnSparkle className="h-4 w-4 text-accent" />
                  <span>THE ZERO-TOLL PHILOSOPHY</span>
                </div>

                <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-[1.02]">
                  Free forever. <br />
                  <span className="italic font-light text-ink-soft">No credit card required.</span>
                </h2>

                <p className="max-w-xl font-sans text-base sm:text-lg text-ink-soft leading-relaxed">
                  {homeContent.pricingTeaser.body}
                </p>

                <div className="flex flex-wrap items-center gap-6 font-sans text-xs text-ink font-medium pt-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>Unlimited CAS Imports</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>All 44+ AMCs Included</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>True XIRR & Alpha Analytics</span>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
                <div className="w-full max-w-sm rounded-3xl border border-mint-300 bg-white p-8 shadow-sketch-card text-center">
                  <div className="flex items-center justify-between border-b border-ink/[0.06] pb-3 font-sans text-xs text-ink-soft">
                    <span className="font-bold text-ink">INDIVIDUAL CORE</span>
                    <span className="rounded-full bg-mint-100 px-2 py-0.5 font-bold text-accent-dark">
                      100% FREE
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-center gap-1.5">
                    <span className="font-display text-5xl font-extrabold text-ink">₹0</span>
                    <span className="font-mono text-xs text-ink-faint">/ lifetime</span>
                  </div>

                  <p className="mt-2 font-sans text-xs text-ink-soft leading-tight">
                    No credit card. Unlimited CAS uploads and complete portfolio analytics.
                  </p>

                  <div className="mt-6">
                    <LinkButton href="/get-started" variant="primary" className="w-full shadow-sketch-btn">
                      <span>Start Free</span>
                      <ArrowRight className="h-4 w-4" />
                    </LinkButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist FAQ Section */}
          <div className="mt-20">
            <FaqSection items={faqContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
