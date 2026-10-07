"use client";

import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { getComposedViewport } from "@/lib/viewport";
import { computeBentoGeometry } from "@/lib/dockLayout";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { useSceneEngine } from "@/components/blueprint/hero-engine/useSceneEngine";
import type { SceneAction } from "@/components/blueprint/hero-engine/types";
import {
  resetToState,
  type SceneResetTarget,
  type SceneTransitionContext,
} from "@/components/blueprint/hero-engine/sceneTransitions";
import type { SafeVault3DRef } from "@/components/blueprint/SafeVault3D";
import { HeroScene, type HeroSceneHandle, type HeroSceneShared } from "@/components/blueprint/scenes/HeroScene";
import {
  ProductBentoScene,
  type ProductBentoSceneHandle,
  type ProductBentoSceneShared,
} from "@/components/blueprint/scenes/ProductBentoScene";
import {
  SecurityVaultScene,
  SecurityVaultSlot,
  SecurityStageSlot,
  type SecurityVaultSceneHandle,
  type SecurityVaultSceneShared,
} from "@/components/blueprint/scenes/SecurityVaultScene";
import {
  AboutScene,
  AboutBackgroundSlot,
  AboutEnvelopeSlot,
  type AboutSceneHandle,
  type AboutSceneShared,
} from "@/components/blueprint/scenes/AboutScene";

interface ProductCardData {
  id: string;
  num: string;
  title: string;
  illustration: string;
  hoverType: "paragraph" | "bullets";
  hoverParagraph?: string;
  hoverBullets?: { label: string; text: string }[];
  accent: string;
  restRotateY: number;
  restRotateZ: number;
  restY: number;
  restZ: number;
}

export const CINEMATIC_TIMESCALE = 0.85;

export const PRODUCT_CARDS: ProductCardData[] = [
  {
    id: "card-ask",
    num: "01",
    title: "Skip the dashboards. Just ask.",
    illustration: "/product-cards/card-2d-1.png",
    hoverType: "paragraph",
    hoverParagraph:
      "The fastest way to understand your money isn't a chart, it's a question. Ask what's dragging your returns, whether you're overexposed, or if a decision makes sense, and get an answer based on your portfolio.",
    accent: "#10b981",
    restRotateY: 10,
    restRotateZ: -2.0,
    restY: 10,
    restZ: -12,
  },
  {
    id: "card-see",
    num: "02",
    title: "See Everything",
    illustration: "/product-cards/card-2d-2.png",
    hoverType: "paragraph",
    hoverParagraph:
      "From mutual funds and stocks to bank accounts, loans, credit cards, and real estate, every asset and liability you and your family hold, aggregated into a number that's actually accurate.",
    accent: "#34d399",
    restRotateY: 5,
    restRotateZ: -1.0,
    restY: 3,
    restZ: -4,
  },
  {
    id: "card-understand",
    num: "03",
    title: "Understand What You Own",
    illustration: "/product-cards/card-2d-3.png",
    hoverType: "bullets",
    hoverBullets: [
      {
        label: "Overlap Check.",
        text: 'Spot if "diversified" funds secretly concentrate into the same handful of stocks.',
      },
      {
        label: "Performance, in context.",
        text: "How your funds and portfolio actually perform against real goals, not raw indices.",
      },
      {
        label: "Hidden Fee Finder.",
        text: "What you quietly lose to expense ratios, and what cheaper direct options look like.",
      },
      {
        label: "Peer Benchmarking.",
        text: "See how your portfolio compares to similar investor profiles, not generic averages.",
      },
    ],
    accent: "#059669",
    restRotateY: 0,
    restRotateZ: 0,
    restY: 0,
    restZ: 0,
  },
  {
    id: "card-risk",
    num: "04",
    title: "Know Your Risk",
    illustration: "/product-cards/card-2d-4.png",
    hoverType: "bullets",
    hoverBullets: [
      {
        label: "Family Runway.",
        text: "How long your family could cover expenses on liquid assets alone, pooled across everyone.",
      },
      {
        label: "Real Safety Cushion.",
        text: "Built from your real expenses and income stability, not a generic rule of thumb.",
      },
      {
        label: "Sleeping Money.",
        text: "Surplus cash doing nothing for you.",
      },
      {
        label: "Family Risk Map.",
        text: "Where a single income, missing cover, or too many dependents leaves your family exposed.",
      },
    ],
    accent: "#6ee7b7",
    restRotateY: -5,
    restRotateZ: 1.0,
    restY: 3,
    restZ: -4,
  },
  {
    id: "card-plan",
    num: "05",
    title: "Plan Ahead",
    illustration: "/product-cards/card-2d-5.png",
    hoverType: "bullets",
    hoverBullets: [
      {
        label: "Financial Snapshot.",
        text: "A single view of how your finances are trending, so you always know where you stand.",
      },
      {
        label: "Stress test.",
        text: "See how your actual portfolio would hold up against a market crash.",
      },
      {
        label: '"What if I..."',
        text: "Model a job change, a loan, an early exit, before you act.",
      },
      {
        label: "Goal Readiness Score.",
        text: "Retirement, house, education, tracked together, one score.",
      },
      {
        label: "Succession Readiness.",
        text: "Is your family prepared without you.",
      },
    ],
    accent: "#10b981",
    restRotateY: -10,
    restRotateZ: 2.0,
    restY: 10,
    restZ: -12,
  },
];

// Exported so components/blueprint/scenes/SecurityVaultScene.tsx (Task 7) can
// read this shared constant (same rationale as SECURITY_STATES above).
export const STACK_RANK_MAP: Record<number, number> = {
  2: 0,
  1: 1,
  4: 2,
  3: 3,
  0: 4,
};

interface SecurityStateItem {
  type: "hero" | "principle" | "closing";
  headline?: string;
  body?: React.ReactNode;
}

// Exported (Task 2) so hero-engine/useSceneEngine.ts can read SECURITY_STATES.length
// for its ring/security scroll-state gating logic without duplicating this data.
export const SECURITY_STATES: SecurityStateItem[] = [
  // State 1: Hero
  {
    type: "hero",
    headline: "We take your data as seriously as you take your money.",
  },
  // State 2
  {
    type: "principle",
    headline: "Read-only, always",
    body: (
      <>
        Unifolio can see your accounts. <br />
        It can never move your money.
      </>
    ),
  },
  // State 3
  {
    type: "principle",
    headline: "We never save your passwords",
    body: (
      <>
        Your bank login stays with your bank. <br />
        <span className="sm:whitespace-nowrap">We connect through India&apos;s RBI-regulated Account Aggregator framework,</span> <br />
        so your credentials never reach us.
      </>
    ),
  },
  // State 4
  {
    type: "principle",
    headline: "Locked down, everywhere",
    body: (
      <>
        <span className="sm:whitespace-nowrap">Your data is encrypted with AES-256 at rest and TLS in transit.</span> <br />
        The same standard banks use.
      </>
    ),
  },
  // State 5
  {
    type: "principle",
    headline: "You control the connection",
    body: (
      <>
        <span className="sm:whitespace-nowrap">Every account you link is approved by you and revocable anytime.</span> <br />
        Revoke it, and data sharing stops instantly.
      </>
    ),
  },
  // State 6
  {
    type: "principle",
    headline: "Stored in India",
    body: (
      <>
        <span className="sm:whitespace-nowrap">Your data stays on secure infrastructure based in India,</span> <br />
        meeting RBI&apos;s data localization requirements.
      </>
    ),
  },
  // State 7
  {
    type: "principle",
    headline: "We don't sell your data",
    body: (
      <>
        <span className="sm:whitespace-nowrap">It&apos;s used only to show you your own financial picture, never sold,</span> <br />
        never used for advertising, in line with India&apos;s DPDP Act.
      </>
    ),
  },
  // State 8 — Closing
  {
    type: "closing",
    headline: "Security isn't just a feature here, It's the baseline everything else is built on.",
  },
];

// Exported so components/blueprint/scenes/SecurityVaultScene.tsx (Task 7) can
// render the sub-state letter-by-letter flourish JSX without duplicating this
// data (same rationale as SECURITY_STATES above).
export const PASSWORD_LETTERS = ["p", "a", "s", "s", "w", "o", "r", "d", "s"];
export const LOCKED_LETTERS = ["L", "o", "c", "k", "e", "d"];
export const CONNECTION_LETTERS = ["c", "o", "n", "n", "e", "c", "t", "i", "o", "n"];
export const INDIA_LETTERS = ["I", "n", "d", "i", "a"];
export const MONEY_LETTERS = ["m", "o", "n", "e", "y"];
export const SELL_LETTERS = ["s", "e", "l", "l"];
export const CLOSING_BLACK_WORDS = ["Security", "isn't", "just", "a", "feature", "here,"];
export const CLOSING_GREEN_WORDS = ["It's", "the", "baseline", "everything", "else", "is", "built", "on."];

const ABOUT_PARA_1_WORDS = [
  "In", "most", "families,", "someone", "ends", "up", "in", "charge", "of", "the", "money.",
  "Not", "because", "they", "trained", "for", "it.", "Because", "someone", "has", "to.",
  "Their", "financial", "data", "lives", "across", "a", "dozen", "apps", "and", "statements.",
  "There's", "a", "gap", "between", "seeing", "it", "all", "and", "actually", "understanding", "it."
];

const ABOUT_PARA_2_WORDS = [
  "Unifolio", "exists", "to", "close", "that", "gap.",
  "The", "same", "clarity", "a", "wealth", "manager", "gives", "their", "wealthiest", "clients,",
  "now", "available", "to", "anyone.", "Whether", "they", "hold", "₹5", "lakh", "or", "₹5", "crore.",
  "Whether", "they've", "studied", "finance", "or", "never", "touched", "a", "balance", "sheet."
];

const ABOUT_PUNCHLINE_WORDS = [
  "Seeing", "your", "money", "isn't", "the", "same", "as", "understanding", "it."
];

export function BlueprintHero() {
  // Scroll-hijack state machine (busy-flags, gesture debounce, wheel/touch/keydown
  // listeners) lives in useSceneEngine (Task 2 extraction). See hero-engine/useSceneEngine.ts.
  const engine = useSceneEngine();
  const {
    stateRef,
    currentSecurityStateRef,
    isAperturePaused,
    setIsAperturePaused,
    productCompleteRef,
    isHoldingProductRef,
    transitionStartedRef,
    transitionAnimatingRef,
    transitionCompleteRef,
    isSecurityTransitioningRef,
    isNavigatingRef,
    hasTriggeredThisGestureRef,
    wheelGestureActiveRef,
    wheelGestureEndTimerRef,
    touchGestureActiveRef,
    lastSecurityScrollTimeRef,
    lockScrollYRef,
    resizeReflowTimeoutRef,
    momentumDrainTimeoutRef,
    arrivalIdleTimeoutRef,
    apertureScrollTriggerRef,
    targetNavSectionRef,
    pendingNavSectionRef,
    touchStartYRef,
    aboutDocPageRef,
    isFlippingDocRef,
    isRingConsolidatedRef,
  } = engine;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Task 6: dedicated real-height element whose scroll distance drives the
  // Hero->Product crossfade's ScrollTrigger scrub. The stage itself can't be
  // the trigger/pinned element (it hosts the entire downstream mega-stage, so
  // GSAP's own pin/unpin lifecycle for it would conflict with the stage
  // staying manually fixed through every later state) — see HeroScene.tsx's
  // createHeroToProductTimeline.
  const heroScrollTrackRef = useRef<HTMLDivElement | null>(null);
  // Task 6: same pattern as heroScrollTrackRef, for the Product->Security
  // crossfade — rendered immediately after it in document flow (see
  // SecurityVaultScene.tsx's createProductToRingTimeline).
  const productScrollTrackRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);

  // Aperture Portal Transition: Iris Mask Layer, Event Horizon Rim & Ripple (Zero GPU / DOM)
  const irisPortalRef = useRef<HTMLDivElement | null>(null);
  const portalRimRef = useRef<HTMLDivElement | null>(null);
  const portalRippleRef = useRef<HTMLDivElement | null>(null);
  const productWorldRef = useRef<HTMLDivElement | null>(null);

  // Product Stage Elements (Header & Cards)
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const floorLineRef = useRef<HTMLDivElement | null>(null);

  // Security Pinned Content Stage & Step Refs
  const securityStageRef = useRef<HTMLDivElement | null>(null);
  const securityStateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const securityHeroWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const securityHeroRibbonRef = useRef<HTMLDivElement | null>(null);
  const securityStateTransitionTlRef = useRef<gsap.core.Timeline | null>(null);

  // About Section Envelope & Philosophy Document Refs
  const unifiedEnvelopeRef = useRef<HTMLDivElement | null>(null);
  const envelopeTopFlapRef = useRef<HTMLDivElement | null>(null);
  const docCavityWrapperRef = useRef<HTMLDivElement | null>(null);
  const philosophyDocRef = useRef<HTMLDivElement | null>(null);
  const docPaperSheetRef = useRef<HTMLDivElement | null>(null);
  const docInkCopyRef = useRef<HTMLDivElement | null>(null);
  const docFlipperRef = useRef<HTMLDivElement | null>(null);
  const envelopeSealRef = useRef<HTMLDivElement | null>(null);
  const aboutOrbitTweenRef = useRef<gsap.core.Tween | null>(null);

  const cardsStageRef = useRef<HTMLDivElement | null>(null);
  const cardsClusterRef = useRef<HTMLDivElement | null>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFlipperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardDefaultRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardHoverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardIllustrationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardGradientBgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardGlassOverlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bentoTileContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const companionCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const COMPANION_COUNT = 21;
  const cardInkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const companionPaperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const companionInkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const productToRingTlRef = useRef<gsap.core.Timeline | null>(null);
  const ringRotateTweenRef = useRef<gsap.core.Tween | null>(null);

  // Luxury Round Safe Animation Refs (Matching "Safe" and "Safe Movement")
  const safeContainerRef = useRef<HTMLDivElement | null>(null);
  const safeVault3DRef = useRef<SafeVault3DRef | null>(null);
  const safeDoorRef = useRef<HTMLDivElement | null>(null);
  const safeDialRef = useRef<HTMLDivElement | null>(null);
  const safeInteriorGlowRef = useRef<HTMLDivElement | null>(null);
  const safeFloorGlowRef = useRef<HTMLDivElement | null>(null);

  // Closing Exit Transition ("Security isn't a feature here...")
  const closingBlackTextRef = useRef<HTMLDivElement | null>(null);
  const closingGreenTextRef = useRef<HTMLDivElement | null>(null);
  const closingBlackWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const closingGreenWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const closingExitTlRef = useRef<gsap.core.Timeline | null>(null);
  const consolidationTlRef = useRef<gsap.core.Timeline | null>(null);
  const origCentersRef = useRef<{ x: number; y: number }[]>([]);
  const targetLeftXRef = useRef<number>(0);
  const targetRingYRef = useRef<number>(0);
  const heroShiftXRef = useRef<number>(0);
  const rightShiftXRef = useRef<number>(0);
  const securityHeadingYRef = useRef<number>(0);
  const stackTargetXRef = useRef<number>(0);
  const stackTargetYRef = useRef<number>(0);
  const cardsToSafeDeltaXRef = useRef<number>(0);
  const cardsToSafeDeltaYRef = useRef<number>(0);

  // About Section Continuum Refs
  const aboutContentRef = useRef<HTMLDivElement | null>(null);

  // Typographic Eyes Easter Egg ("Read-only, always")
  const typoEyesRef = useRef<HTMLSpanElement | null>(null);
  const typoLeftWordRef = useRef<HTMLSpanElement | null>(null);
  const typoRightWordRef = useRef<HTMLSpanElement | null>(null);
  const typoPupilsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const typoEyelidsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const typoEyesTlRef = useRef<gsap.core.Timeline | null>(null);

  // Password Masking Interaction ("We never save your passwords")
  const pwdLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pwdMaskRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pwdMaskTlRef = useRef<gsap.core.Timeline | null>(null);

  // Lock Typography Transformation Interaction ("Locked down, everywhere")
  const lockCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lockIconWrapperRef = useRef<HTMLSpanElement | null>(null);
  const lockShackleRef = useRef<SVGPathElement | null>(null);
  const lockBodyRef = useRef<SVGRectElement | null>(null);
  const lockAnimTlRef = useRef<gsap.core.Timeline | null>(null);
  const lockAnimPlayedRef = useRef<boolean>(false);

  // Connection Typography Transformation Interaction ("You control the connection")
  const connectionCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const connectionWrapperRef = useRef<HTMLSpanElement | null>(null);
  const connectionAnimTlRef = useRef<gsap.core.Timeline | null>(null);

  // India Typography Transformation Interaction ("Stored in India")
  const indiaCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indiaMapWrapperRef = useRef<HTMLSpanElement | null>(null);
  const indiaMapPathRef = useRef<SVGPathElement | null>(null);
  const indiaAnimTlRef = useRef<gsap.core.Timeline | null>(null);

  // Money Typography Transformation Interaction ("take your money.")
  const moneyCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moneyWrapperRef = useRef<HTMLSpanElement | null>(null);
  const moneyBill1Ref = useRef<SVGGElement | null>(null);
  const moneyBill2Ref = useRef<SVGGElement | null>(null);
  const moneyAnimTlRef = useRef<gsap.core.Timeline | null>(null);

  // Sell Typography Transformation Interaction ("We don't sell your data")
  const sellCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sellShieldWrapperRef = useRef<HTMLSpanElement | null>(null);
  const sellShieldIconRef = useRef<SVGSVGElement | null>(null);
  const sellAnimTlRef = useRef<gsap.core.Timeline | null>(null);

  const currentHoverRef = useRef<number | null>(null);
  const hoverCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroToProductTlRef = useRef<gsap.core.Timeline | null>(null);
  const restingToBentoTlRef = useRef<gsap.core.Timeline | null>(null);

  // Unified Navbar Navigation Coordination Refs
  const onHeroToProductCompletedRef = useRef<(() => void) | null>(null);
  const onProductToHeroCompletedRef = useRef<(() => void) | null>(null);
  const heroSceneRef = useRef<HeroSceneHandle>(null);
  const heroSharedRef = useRef<HeroSceneShared>({
    dispatchActiveSection: () => { },
    portalState: { radius: 175, x: 62.87, y: 49.12 },
    applyPortalClip: () => { },
  });
  const productSceneRef = useRef<ProductBentoSceneHandle>(null);
  const productSharedRef = useRef<ProductBentoSceneShared>({
    computeBentoLayout: () => ({
      bentoW: 0,
      bentoH: 0,
      gapX: 0,
      gapY: 0,
      tileWidths: [0, 0, 0, 0, 0],
      tileHeights: [0, 0, 0, 0, 0],
      tileLefts: [0, 0, 0, 0, 0],
      tileTops: [0, 0, 0, 0, 0],
    }),
    dispatchActiveSection: () => { },
  });
  const securitySceneRef = useRef<SecurityVaultSceneHandle>(null);
  const securitySharedRef = useRef<SecurityVaultSceneShared>({
    computeBentoLayout: () => ({
      bentoW: 0,
      bentoH: 0,
      gapX: 0,
      gapY: 0,
      tileWidths: [0, 0, 0, 0, 0],
      tileHeights: [0, 0, 0, 0, 0],
      tileLefts: [0, 0, 0, 0, 0],
      tileTops: [0, 0, 0, 0, 0],
    }),
    dispatchActiveSection: () => { },
    computeEnvelopeParams: () => ({ isDesk: false, isTab: false, envScale: 1, scatterSlots: [] }),
    jumpToAboutState: () => { },
  });
  const aboutSceneRef = useRef<AboutSceneHandle>(null);
  const aboutSharedRef = useRef<AboutSceneShared>({
    dispatchActiveSection: () => { },
    consolidateRingToStack: () => { },
    applyPortalClip: () => { },
    maxRadiusPx: 2500,
  });
  const onProductToRingCompletedRef = useRef<(() => void) | null>(null);
  const onRingToProductCompletedRef = useRef<(() => void) | null>(null);
  const onConsolidateCompletedRef = useRef<(() => void) | null>(null);
  const onRestoreStackCompletedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (hoverCommitTimeoutRef.current) clearTimeout(hoverCommitTimeoutRef.current);
      if (arrivalIdleTimeoutRef.current) clearTimeout(arrivalIdleTimeoutRef.current);
      if (momentumDrainTimeoutRef.current) clearTimeout(momentumDrainTimeoutRef.current);
      if (heroToProductTlRef.current) {
        heroToProductTlRef.current.kill();
        heroToProductTlRef.current = null;
      }
      if (restingToBentoTlRef.current) {
        restingToBentoTlRef.current.kill();
        restingToBentoTlRef.current = null;
      }
      if (ringRotateTweenRef.current) {
        ringRotateTweenRef.current.kill();
        ringRotateTweenRef.current = null;
      }
      if (closingExitTlRef.current) {
        closingExitTlRef.current.kill();
        closingExitTlRef.current = null;
      }
      if (aboutOrbitTweenRef.current) {
        aboutOrbitTweenRef.current.kill();
        aboutOrbitTweenRef.current = null;
      }
    };
  }, []);



  // Card Hover logic disabled per requirement (nothing should happen on hover)
  const commitCardHover = (_idx: number | null) => {
    return;
  };

  const getHoverBandIndex = (clientX: number): number | null => {
    if (
      stateRef.current !== "product" ||
      transitionStartedRef.current ||
      transitionAnimatingRef.current ||
      isSecurityTransitioningRef.current
    ) {
      return null;
    }
    const cardRects = cardWrapperRefs.current.map((el) => el?.getBoundingClientRect());
    for (let i = 0; i < cardRects.length; i++) {
      const cr = cardRects[i];
      if (cr && clientX >= cr.left && clientX <= cr.right) {
        return i;
      }
    }
    // Across flex gaps, find the nearest card center
    let closestIdx = 0;
    let minDistance = Infinity;
    cardRects.forEach((cr, i) => {
      if (!cr) return;
      const center = cr.left + cr.width / 2;
      const dist = Math.abs(clientX - center);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });
    return closestIdx;
  };

  const handleCardHover = (_idx: number | null) => {
    return;
  };

  useGSAP(
    () => {
      if (!containerRef.current || !stageRef.current) return;

      // Task 6: Hero's crossfade is now driven by real native scroll, scrubbed
      // off a dedicated track element (heroScrollTrackRef) rather than a GSAP
      // pin on the stage itself — the stage must stay manually fixed from
      // mount exactly like every other state (see pinStage in
      // sceneTransitions.ts), so only the scroll HOLD is released here.
      // `lockScrollYRef.current = -1` is the existing "unlocked" sentinel (see
      // sceneTransitions.ts's resetToHero) so handleScrollLock's
      // product-resting-onward hijack doesn't misfire before Hero's
      // transition has handed off control to it.
      lockScrollYRef.current = -1;

      const reduced = prefersReducedMotion();

      // Single choke point for announcing the landed section to the navbar dots.
      // Every call site marks a genuinely settled, stable state (never mid-animation),
      // so this is also the correct moment to flush any navbar click that arrived
      // while a transition was in flight (see navigateToSection's re-entrancy guard).
      const dispatchActiveSection = (section: string) => {
        window.dispatchEvent(new CustomEvent("unifolio-active-section", { detail: { section } }));
        // Defer the queue check to the next frame: some completion callbacks dispatch
        // here and only clear isNavigatingRef a few lines later in the same synchronous
        // callback (e.g. restoreStackToRing's onComplete). Checking on the next frame
        // guarantees that later, still-synchronous cleanup has already run.
        requestAnimationFrame(() => {
          if (isNavigatingRef.current || stateRef.current === "sculpting") return;
          const pending = pendingNavSectionRef.current;
          if (pending) {
            pendingNavSectionRef.current = null;
            navigateToSection(pending);
          }
        });
      };

      // Ensure Hero text and visual are immediately visible
      gsap.set(heroIntroRef.current, { opacity: 1, y: 0 });
      gsap.set(heroVisualRef.current, {
        opacity: 1,
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        transformOrigin: "62.87% 49.12%",
      });

      // Calibrated aperture hole center at 62.87% X, 49.12% Y
      // Dynamic pixel calculation perfectly matches the video ring void across all screens
      const getInitialRadiusPx = () => {
        if (typeof window === "undefined") return 175;
        const { vw, vh } = getComposedViewport();
        return Math.max(145, Math.round(Math.min(vw * 0.115, vh * 0.22)));
      };

      const getMaxRadiusPx = () => {
        if (typeof window === "undefined") return 2400;
        return Math.round(Math.hypot(window.innerWidth, window.innerHeight) * 1.15);
      };

      const initialRadiusPx = getInitialRadiusPx();
      const maxRadiusPx = getMaxRadiusPx();

      // Pure numeric state object for GSAP - avoids fragile browser CSS string unit parsing (zero GPU)
      const portalState = {
        radius: initialRadiusPx,
        x: 62.87,
        y: 49.12,
      };

      const applyPortalClip = (r: number, x: number, y: number) => {
        const roundedR = Math.round(r);
        const clip = `circle(${roundedR}px at ${x.toFixed(1)}% ${y.toFixed(1)}%)`;
        if (irisPortalRef.current) {
          irisPortalRef.current.style.clipPath = clip;
          irisPortalRef.current.style.setProperty("-webkit-clip-path", clip);
        }
        if (portalRimRef.current) {
          portalRimRef.current.style.width = `${roundedR * 2}px`;
          portalRimRef.current.style.height = `${roundedR * 2}px`;
          portalRimRef.current.style.left = `${x.toFixed(1)}%`;
          portalRimRef.current.style.top = `${y.toFixed(1)}%`;
        }
        if (portalRippleRef.current) {
          const rippleR = Math.round(roundedR * 1.15);
          portalRippleRef.current.style.width = `${rippleR * 2}px`;
          portalRippleRef.current.style.height = `${rippleR * 2}px`;
          portalRippleRef.current.style.left = `${x.toFixed(1)}%`;
          portalRippleRef.current.style.top = `${y.toFixed(1)}%`;
        }
      };
      heroSharedRef.current.dispatchActiveSection = dispatchActiveSection;
      heroSharedRef.current.portalState = portalState;
      heroSharedRef.current.applyPortalClip = applyPortalClip;

      // CRITICAL: At rest (y = 0), autoAlpha is 0 so there is NO stale image or patch over the video.
      // The video ring plays cleanly in its pure native state.
      gsap.set(irisPortalRef.current, { autoAlpha: 0 });
      gsap.set(portalRimRef.current, { autoAlpha: 0 });
      gsap.set(portalRippleRef.current, { autoAlpha: 0 });
      applyPortalClip(initialRadiusPx, 62.87, 49.12);

      // Hero Intro initial state - immediately visible for direct landing
      gsap.set(heroIntroRef.current, { opacity: 1, autoAlpha: 1, x: 0, y: 0, scale: 1 });
      gsap.set(heroVisualRef.current, {
        opacity: 1,
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        transformOrigin: "62.87% 49.12%",
      });

      // Product section resting state
      gsap.set(productWorldRef.current, {
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        xPercent: 0,
        yPercent: 0,
        opacity: 1,
      });

      gsap.set(
        [headerRef.current, headlineRef.current, ctaRef.current],
        { autoAlpha: 1, opacity: 1, visibility: "visible", y: 0, scale: 1 }
      );

      gsap.set(cardsClusterRef.current, {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      });

      const revealHeroAfterDocked = () => {
        if (heroIntroRef.current) {
          gsap.to(heroIntroRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }
        if (heroVisualRef.current) {
          gsap.to(heroVisualRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      };

      window.addEventListener("unifolio-logo-docked", revealHeroAfterDocked);
      window.addEventListener("unifolio-intro-complete", revealHeroAfterDocked);

      if (typeof window !== "undefined" && (window as any).__unifolio_logo_docked) {
        revealHeroAfterDocked();
      }

      const heroRevealFallbackTimer = setTimeout(() => {
        revealHeroAfterDocked();
      }, 3500);


      // =======================================================================
      // BENTO GRID BOUNDING BOX & GEOMETRY CALCULATOR
      // Calculates the single bounding box for the entire bento composition,
      // positioning it comfortably centered inside the usable viewport area
      // (accounting for fixed navbar height and safe clearances).
      // Matches the exact spatial layout of reference image (media_1789027747685.png):
      // - Card 0 (Left): Full-height tall card spanning rows 1 & 2 (~28.5% width)
      // - Card 1 (Top-Middle): "Save Time" narrower card (~38% of remaining row)
      // - Card 2 (Top-Right): "Buy And Sell Seamlessly" wider card (~62% of remaining row)
      // - Card 3 (Bottom-Middle): "Instant Trade Alerts" wider card (~55% of remaining row)
      // - Card 4 (Bottom-Right): "Cost Management" narrower card (~45% of remaining row)
      // =======================================================================
      const computeBentoLayout = (vWidth: number, vHeight: number) => {
        // Live vertical offset of cardsClusterRef top edge within the viewport when settled.
        // Uses offsetTop (layout box position) instead of getBoundingClientRect() because
        // cardsClusterRef frequently has an active GSAP transform (x/y/rotateZ, e.g. mid-ring
        // formation) applied to it when this runs — getBoundingClientRect() includes that
        // transform and gives a wildly wrong "rest" position, while offsetTop is purely a
        // CSS-flow layout value and is unaffected by `transform`.
        let liveTop: number | undefined;
        const clusterElForMeasure = cardsClusterRef.current;
        if (clusterElForMeasure) {
          const offsetParentEl = clusterElForMeasure.offsetParent as HTMLElement | null;
          liveTop = offsetParentEl
            ? offsetParentEl.getBoundingClientRect().top + clusterElForMeasure.offsetTop
            : clusterElForMeasure.getBoundingClientRect().top;
        }

        return computeBentoGeometry({ vWidth, vHeight, clusterViewportTop: liveTop });
      };

      // Populate ProductBentoScene's shared bridge as soon as both helpers it
      // needs exist — same technique/timing as heroSharedRef above. Must happen
      // before ProductBentoScene's own effect runs (child effects run before
      // parent effects, so this assignment executes first regardless).
      productSharedRef.current.computeBentoLayout = computeBentoLayout;
      productSharedRef.current.dispatchActiveSection = dispatchActiveSection;
      // Same bridging for SecurityVaultScene (Task 7) — computeEnvelopeParams/
      // jumpToAboutState (About's own helpers, now in AboutScene.tsx per
      // Task 8) are populated further below, once aboutSceneRef exists.
      securitySharedRef.current.computeBentoLayout = computeBentoLayout;
      securitySharedRef.current.dispatchActiveSection = dispatchActiveSection;
      aboutSharedRef.current.dispatchActiveSection = dispatchActiveSection;
      aboutSharedRef.current.consolidateRingToStack = () => securitySceneRef.current?.consolidateRingToStack();
      aboutSharedRef.current.applyPortalClip = applyPortalClip;
      aboutSharedRef.current.maxRadiusPx = maxRadiusPx;
      // Re-run SecurityVaultScene's own mount-time computeDockLayout() warm-up
      // now that the bridge above is populated with the REAL computeBentoLayout.
      // SecurityVaultScene is a child, so its own useGSAP mount effect (which
      // does this same warm-up call) fires BEFORE this parent useGSAP body runs
      // — at that point `shared.current.computeBentoLayout` was still this
      // ref's placeholder default (`bentoW: 0`, all-zero tile arrays), so the
      // very first cached dock-layout numbers (stackTargetX/Y,
      // cardsToSafeDeltaX/Y, targetCardLeft/Top — everything computeDockLayout
      // derives from `bento`) were wrong until the first REAL transition
      // recomputed them. Calling it again here, synchronously, right after the
      // bridge is populated (and still before any user interaction is
      // possible), closes that gap.
      securitySceneRef.current?.computeDockLayout();

      const { vw: initVw, vh: initVh } = getComposedViewport(1440, 800);
      const initDesk = initVw >= 1024;
      const initTab = initVw >= 768;
      const initRestW = initDesk ? 225 : initTab ? 195 : 175;
      const initHRest = initVw >= 1536 ? 375 : initVw >= 1280 ? 360 : initVw >= 1024 ? 345 : initVw >= 768 ? 330 : initVw >= 640 ? 310 : 285;
      const initClusterW = cardsClusterRef.current?.offsetWidth || Math.min(initVw, 1340);
      const initClusterH = cardsClusterRef.current?.offsetHeight || 370;
      const initBento = computeBentoLayout(initVw, initVh);
      const initTargetCardLeft = Math.round(initBento.tileLefts[2] + (initBento.tileWidths[2] - initRestW) / 2);
      const initTargetCardTop = Math.round(initBento.tileTops[2] + (initBento.tileHeights[2] - initHRest) / 2);
      const initStackTargetX = Math.round(initTargetCardLeft + initRestW / 2 - initClusterW / 2);
      const initStackTargetY = Math.round(initTargetCardTop + initHRest / 2 - initClusterH / 2);

      origCentersRef.current = PRODUCT_CARDS.map(() => ({
        x: initStackTargetX,
        y: initStackTargetY,
      }));


      // createRestingToBentoTimeline / triggerRestingToBento / triggerBentoToResting
      // moved verbatim to components/blueprint/scenes/ProductBentoScene.tsx (Task 6).
      // Exposed back to this file via `productSceneRef` (ProductBentoSceneHandle),
      // invoked from dispatchSceneAction's "restingToBento"/"bentoToResting" cases below.



      // =======================================================================
      // PRODUCT (BENTO) -> SECURITY (COLLAPSE & RING) TRANSITION
      // computeDockLayout / createProductToRingTimeline / the 7 play*Animation
      // flourish functions / computeRingSlots all moved verbatim to
      // components/blueprint/scenes/SecurityVaultScene.tsx (Task 7), exposed back
      // to this file via `securitySceneRef` (SecurityVaultSceneHandle).
      // =======================================================================

      // computeEnvelopeParams / flipDocToPage / exitAboutToFaq / jumpToAboutState
      // all moved verbatim to components/blueprint/scenes/AboutScene.tsx (Task 8),
      // exposed back to this file via `aboutSceneRef` (AboutSceneHandle).
      // Security's own bridge (populated above at securitySharedRef.current)
      // now calls through that handle instead of a local closure.
      securitySharedRef.current.computeEnvelopeParams = () => aboutSceneRef.current!.computeEnvelopeParams();
      securitySharedRef.current.jumpToAboutState = (page) => aboutSceneRef.current!.jumpToAboutState(page);

      // consolidateRingToStack / restoreStackToRing / goToSecurityState /
      // exitSecurityToAbout / triggerProductToRing / triggerRingToProduct all moved
      // verbatim to components/blueprint/scenes/SecurityVaultScene.tsx (Task 7),
      // exposed back to this file via `securitySceneRef` (SecurityVaultSceneHandle).

      // applyBentoLayoutToCards moved verbatim to
      // components/blueprint/scenes/ProductBentoScene.tsx (Task 6), exposed back
      // to this file via `productSceneRef` (ProductBentoSceneHandle) — called
      // below (reflowCurrentLayout) and from `sceneCtx.applyBentoLayoutToCards`.
      const applyBentoLayoutToCards = (vw: number, vh: number) => {
        productSceneRef.current?.applyBentoLayoutToCards(vw, vh);
      };

      // computeDockLayout / playMoneyAnimation moved verbatim to
      // components/blueprint/scenes/SecurityVaultScene.tsx (Task 7), exposed back
      // to this file via `securitySceneRef` — called below (reflowCurrentLayout)
      // and from `sceneCtx.computeDockLayout`/`sceneCtx.playMoneyAnimation`.
      const computeDockLayout = () => securitySceneRef.current!.computeDockLayout();
      const playMoneyAnimation = () => securitySceneRef.current?.playMoneyAnimation();

      // Re-derives and re-applies whatever layout is relevant to the CURRENTLY
      // active visual state. Every position/size elsewhere in this file is
      // computed once inside a scroll-triggered callback and cached into a ref —
      // nothing re-ran when the viewport changed size afterward (a plain window
      // resize, or opening/closing devtools' responsive toolbar), so a live
      // viewport change left the page visually "stuck" at whatever size it was
      // originally computed for. This re-invokes the SAME already-clamped
      // formulas (see lib/viewport.ts) fresh, via gsap.set (an instant snap, not
      // an animated .to — resizing the window should never play a transition).
      const reflowCurrentLayout = () => {
        if (stateRef.current === "hero") {
          applyPortalClip(getInitialRadiusPx(), 62.87, 49.12);
        }

        if (stateRef.current === "product") {
          const { vw, vh } = getComposedViewport(1440, 800);
          applyBentoLayoutToCards(vw, vh);
        } else if (stateRef.current === "product-resting") {
          cardWrapperRefs.current.forEach((el, i) => {
            if (el) {
              el.style.position = "";
              el.style.left = "";
              el.style.top = "";
              el.style.width = "";
              el.style.height = "";
              gsap.set(el, {
                x: 0,
                y: PRODUCT_CARDS[i].restY,
                z: PRODUCT_CARDS[i].restZ,
                rotateX: 0,
                rotateY: PRODUCT_CARDS[i].restRotateY,
                rotateZ: PRODUCT_CARDS[i].restRotateZ,
                scale: 1,
                opacity: 1,
              });
            }
          });
        }

        // Safe/vault + security heading dock position: cheap to recompute and a
        // visual no-op when these elements are currently hidden, so this always
        // runs regardless of the exact macro state above (covers the "ring"
        // state, which is shared by the card-ring formation AND the security
        // reveal — see computeDockLayout).
        const layout = computeDockLayout();
        if (safeContainerRef.current) {
          gsap.set(safeContainerRef.current, { x: layout.targetLeftX, y: layout.targetRingY });
        }
        const activeSecurityEl = securityStateRefs.current[currentSecurityStateRef.current];
        if (activeSecurityEl) {
          gsap.set(activeSecurityEl, { x: layout.rightShiftX, y: layout.securityHeadingY, xPercent: -50, yPercent: -50 });
        }

        ScrollTrigger.refresh();
      };

      const handleResizeLines = () => {
        if (resizeReflowTimeoutRef.current) {
          clearTimeout(resizeReflowTimeoutRef.current);
        }
        resizeReflowTimeoutRef.current = setTimeout(() => {
          resizeReflowTimeoutRef.current = null;
          reflowCurrentLayout();
        }, 180);
      };
      window.addEventListener("resize", handleResizeLines);


      // =======================================================================
      // The single bag of refs/helpers `resetToState` (hero-engine/
      // sceneTransitions.ts) needs. Built once here because every member is
      // stable for the lifetime of this effect: engine refs come from
      // useSceneEngine, DOM refs from this component, and the helper closures
      // (computeDockLayout / applyPortalClip / ...) are defined above.
      // =======================================================================
      const sceneCtx: SceneTransitionContext = {
        stateRef,
        currentSecurityStateRef,
        setIsAperturePaused,
        productCompleteRef,
        isHoldingProductRef,
        transitionStartedRef,
        transitionAnimatingRef,
        transitionCompleteRef,
        isSecurityTransitioningRef,
        isNavigatingRef,
        hasTriggeredThisGestureRef,
        wheelGestureActiveRef,
        isFlippingDocRef,
        isRingConsolidatedRef,
        aboutDocPageRef,
        lastSecurityScrollTimeRef,
        lockScrollYRef,
        targetNavSectionRef,
        pendingNavSectionRef,
        arrivalIdleTimeoutRef,
        momentumDrainTimeoutRef,
        disarmBusySafetyValve: engine.disarmBusySafetyValve,

        heroToProductTlRef,
        restingToBentoTlRef,
        productToRingTlRef,
        consolidationTlRef,
        securityStateTransitionTlRef,
        typoEyesTlRef,
        pwdMaskTlRef,
        lockAnimTlRef,
        connectionAnimTlRef,
        indiaAnimTlRef,
        moneyAnimTlRef,
        sellAnimTlRef,
        closingExitTlRef,
        ringRotateTweenRef,
        aboutOrbitTweenRef,

        stageRef,
        productScrollTrackRef,
        cardsStageRef,
        cardsClusterRef,
        headerRef,
        headlineRef,
        subheadRef,
        ctaRef,
        floorLineRef,
        heroIntroRef,
        heroVisualRef,
        irisPortalRef,
        portalRimRef,
        portalRippleRef,
        productWorldRef,

        cardWrapperRefs,
        cardFlipperRefs,
        cardFrontRefs,
        cardBackRefs,
        cardDefaultRefs,
        cardHoverRefs,
        cardIllustrationRefs,
        cardGradientBgRefs,
        cardGlassOverlayRefs,
        bentoTileContentRefs,
        companionCardRefs,

        securityStageRef,
        securityStateRefs,
        securityHeroRibbonRef,
        safeContainerRef,
        safeVault3DRef,
        closingBlackTextRef,
        closingGreenTextRef,
        origCentersRef,
        stackTargetXRef,
        stackTargetYRef,
        cardsToSafeDeltaXRef,
        cardsToSafeDeltaYRef,

        aboutContentRef,
        unifiedEnvelopeRef,
        envelopeTopFlapRef,
        envelopeSealRef,
        docCavityWrapperRef,
        docFlipperRef,
        philosophyDocRef,
        docPaperSheetRef,
        docInkCopyRef,

        computeDockLayout,
        applyPortalClip,
        applyBentoLayoutToCards,
        dispatchActiveSection,
        playMoneyAnimation,
        portalState,
        initialRadiusPx,
        maxRadiusPx,
        productCards: PRODUCT_CARDS,
      };

      // Instant State Initializers (used when jumping back from FAQ / Contact or direct navbar routing)




      // Instant State Initializer for About section

      // =======================================================================
      // DIRECT INSTANT NAVBAR NAVIGATION COORDINATOR
      // Instantly routes directly to the requested destination without delays
      // or multi-step animation chains, ensuring clean natural scrolling
      // both upwards and downwards after arrival.
      //
      // Every destination now goes through the ONE canonical reset in
      // hero-engine/sceneTransitions.ts. The defensive flag-clearing and
      // timeline-killing this function used to do itself is `resetToState`'s
      // unconditional preamble, so it is not repeated here.
      // =======================================================================
      // DIRECT NATIVE NAVBAR NAVIGATION COORDINATOR
      // Smoothly scrolls directly to the requested destination element.
      // =======================================================================
      const navigateToSection = (targetSection: string) => {
        if (targetSection === "hero") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        window.dispatchEvent(new CustomEvent("unifolio-logo-docked"));

        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };

      const handleShowProduct = () => navigateToSection("product");
      const handleResetHero = () => navigateToSection("hero");
      const handleShowAbout = () => navigateToSection("about");
      const handleShowSecurity = () => navigateToSection("security");
      const handleShowFaq = () => navigateToSection("faq");
      const handleShowContact = () => navigateToSection("contact");

      const handleNavClick = (e: Event) => {
        const ce = e as CustomEvent<{ section: string }>;
        if (ce.detail?.section) {
          navigateToSection(ce.detail.section);
        }
      };

      window.addEventListener("unifolio-nav-click", handleNavClick);
      window.addEventListener("unifolio-show-product", handleShowProduct);
      window.addEventListener("unifolio-reset-hero", handleResetHero);
      window.addEventListener("unifolio-show-about", handleShowAbout);
      window.addEventListener("unifolio-show-security", handleShowSecurity);
      window.addEventListener("unifolio-show-faq", handleShowFaq);
      window.addEventListener("unifolio-show-contact", handleShowContact);

      if (typeof window !== "undefined") {
        (window as any).__biDebug = {
          stateRef,
          currentSecurityStateRef,
          isRingConsolidatedRef,
          aboutDocPageRef,
          transitionAnimatingRef,
          isSecurityTransitioningRef,
          isNavigatingRef,
          targetLeftXRef,
          targetRingYRef,
          rightShiftXRef,
          heroShiftXRef,
          stackTargetXRef,
          stackTargetYRef,
          cardsToSafeDeltaXRef,
          cardsToSafeDeltaYRef,
          safeContainerRef,
          securityStateRefs,
          securityHeroRibbonRef,
          cardWrapperRefs,
          aboutContentRef,
          unifiedEnvelopeRef,
          heroIntroRef,
          navigateToSection,
          resetToState: (target: SceneResetTarget) => resetToState(target, sceneCtx),
          armBusySafetyValve: engine.armBusySafetyValve,
          disarmBusySafetyValve: engine.disarmBusySafetyValve,
        };
      }

      return () => {
        if (typeof window !== "undefined") {
          delete (window as any).__biDebug;
        }
        window.removeEventListener("unifolio-logo-docked", revealHeroAfterDocked);
        window.removeEventListener("unifolio-intro-complete", revealHeroAfterDocked);
        if (heroRevealFallbackTimer) {
          clearTimeout(heroRevealFallbackTimer);
        }
        window.removeEventListener("unifolio-nav-click", handleNavClick);
        window.removeEventListener("unifolio-show-product", handleShowProduct);
        window.removeEventListener("unifolio-reset-hero", handleResetHero);
        window.removeEventListener("unifolio-show-about", handleShowAbout);
        window.removeEventListener("unifolio-show-security", handleShowSecurity);
        window.removeEventListener("unifolio-show-faq", handleShowFaq);
        window.removeEventListener("unifolio-show-contact", handleShowContact);
        window.removeEventListener("resize", handleResizeLines);
        if (resizeReflowTimeoutRef.current) {
          clearTimeout(resizeReflowTimeoutRef.current);
          resizeReflowTimeoutRef.current = null;
        }
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }
        if (typoEyesTlRef.current) {
          typoEyesTlRef.current.kill();
          typoEyesTlRef.current = null;
        }
        if (pwdMaskTlRef.current) {
          pwdMaskTlRef.current.kill();
          pwdMaskTlRef.current = null;
        }
        if (lockAnimTlRef.current) {
          lockAnimTlRef.current.kill();
          lockAnimTlRef.current = null;
        }
        if (connectionAnimTlRef.current) {
          connectionAnimTlRef.current.kill();
          connectionAnimTlRef.current = null;
        }
        if (indiaAnimTlRef.current) {
          indiaAnimTlRef.current.kill();
          indiaAnimTlRef.current = null;
        }
        if (sellAnimTlRef.current) {
          sellAnimTlRef.current.kill();
          sellAnimTlRef.current = null;
        }
        if (moneyAnimTlRef.current) {
          moneyAnimTlRef.current.kill();
          moneyAnimTlRef.current = null;
        }
        if (typoLeftWordRef.current) gsap.set(typoLeftWordRef.current, { x: 0 });
        if (typoRightWordRef.current) gsap.set(typoRightWordRef.current, { x: 0 });
        if (productToRingTlRef.current) {
          productToRingTlRef.current.kill();
        }
        if (stageRef.current) {
          stageRef.current.style.position = "";
          stageRef.current.style.top = "";
          stageRef.current.style.left = "";
          stageRef.current.style.width = "";
          stageRef.current.style.height = "";
          stageRef.current.style.zIndex = "";
        }
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.documentElement.style.removeProperty("overflow");
        document.body.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("overscroll-behavior");
        document.body.style.removeProperty("overscroll-behavior");
        ScrollTrigger.refresh();
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] select-none"
    >
      <div ref={heroScrollTrackRef} className="hidden" aria-hidden="true" />
      <div ref={productScrollTrackRef} className="hidden" aria-hidden="true" />

      {/* Master Viewport Stage: in natural document flow */}
      <div
        ref={stageRef}
        className="relative w-full bg-[#FAF8F5] flex flex-col"
      >
        {/* Renders no DOM of its own (returns null) — owns Security's
            timeline/layout logic only. Security's actual JSX is rendered by
            the SecurityVaultSlot/SecurityStageSlot components mounted below,
            inside ProductBentoScene's/HeroScene's own trees (see
            SecurityVaultScene.tsx's header comment for why). */}
        <SecurityVaultScene
          ref={securitySceneRef}
          engine={engine}
          refs={{
            stageRef,
            productScrollTrackRef,
            headerRef,
            headlineRef,
            ctaRef,
            floorLineRef,
            heroIntroRef,
            heroVisualRef,
            cardsStageRef,
            cardsClusterRef,
            cardWrapperRefs,
            cardFrontRefs,
            cardBackRefs,
            cardDefaultRefs,
            cardHoverRefs,
            cardIllustrationRefs,
            cardGradientBgRefs,
            cardGlassOverlayRefs,
            bentoTileContentRefs,
            companionCardRefs,
            cardInkRefs,
            companionPaperRefs,
            companionInkRefs,
            currentHoverRef,
            hoverCommitTimeoutRef,
            securityStageRef,
            securityStateRefs,
            securityHeroRibbonRef,
            securityStateTransitionTlRef,
            safeContainerRef,
            safeVault3DRef,
            productToRingTlRef,
            ringRotateTweenRef,
            consolidationTlRef,
            closingBlackTextRef,
            closingGreenTextRef,
            closingBlackWordRefs,
            closingGreenWordRefs,
            origCentersRef,
            targetLeftXRef,
            targetRingYRef,
            heroShiftXRef,
            rightShiftXRef,
            securityHeadingYRef,
            stackTargetXRef,
            stackTargetYRef,
            cardsToSafeDeltaXRef,
            cardsToSafeDeltaYRef,
            onProductToRingCompletedRef,
            onRingToProductCompletedRef,
            onConsolidateCompletedRef,
            onRestoreStackCompletedRef,
            typoEyesRef,
            typoLeftWordRef,
            typoRightWordRef,
            typoPupilsRef,
            typoEyelidsRef,
            typoEyesTlRef,
            pwdLetterRefs,
            pwdMaskRefs,
            pwdMaskTlRef,
            lockCharRefs,
            lockIconWrapperRef,
            lockShackleRef,
            lockBodyRef,
            lockAnimTlRef,
            lockAnimPlayedRef,
            connectionCharRefs,
            connectionWrapperRef,
            connectionAnimTlRef,
            indiaCharRefs,
            indiaMapWrapperRef,
            indiaMapPathRef,
            indiaAnimTlRef,
            moneyCharRefs,
            moneyWrapperRef,
            moneyBill1Ref,
            moneyBill2Ref,
            moneyAnimTlRef,
            sellCharRefs,
            sellShieldWrapperRef,
            sellShieldIconRef,
            sellAnimTlRef,
            aboutContentRef,
            unifiedEnvelopeRef,
            envelopeTopFlapRef,
            envelopeSealRef,
            docCavityWrapperRef,
            docFlipperRef,
            philosophyDocRef,
            docPaperSheetRef,
            docInkCopyRef,
          }}
          shared={securitySharedRef}
        />
        <AboutScene
          ref={aboutSceneRef}
          engine={engine}
          refs={{
            aboutContentRef,
            unifiedEnvelopeRef,
            envelopeTopFlapRef,
            envelopeSealRef,
            docCavityWrapperRef,
            philosophyDocRef,
            docPaperSheetRef,
            docInkCopyRef,
            docFlipperRef,
            aboutOrbitTweenRef,
            stageRef,
            irisPortalRef,
            headerRef,
            heroIntroRef,
            heroVisualRef,
            portalRimRef,
            portalRippleRef,
            productWorldRef,
            cardsStageRef,
            cardsClusterRef,
            cardWrapperRefs,
            companionCardRefs,
            securityStageRef,
            securityStateRefs,
            safeContainerRef,
            safeVault3DRef,
          }}
          shared={aboutSharedRef}
        />
        {/* SECTION 1: HERO */}
        <section id="hero" className="relative w-full h-screen min-h-screen bg-[#FAF8F5] select-none overflow-hidden flex flex-col justify-center">
          <HeroScene
            ref={heroSceneRef}
            engine={engine}
            refs={{
              heroVisualRef,
              heroIntroRef,
            }}
            shared={heroSharedRef}
          />
        </section>

        {/* SECTION 2: PRODUCT WORLD */}
        <section
          id="product"
          ref={productWorldRef}
          className="relative w-full min-h-screen bg-[#FAF8F5] flex flex-col justify-start items-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-hidden select-none"
        >
          {/* Product Hero Content (Headline) */}
          <div
            ref={headerRef}
            className="w-full max-w-5xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mb-8 sm:mb-12 px-2 will-change-transform pt-10 sm:pt-14 md:pt-16"
          >
            <h2
              ref={headlineRef}
              className="font-sans font-black text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] xl:text-[46px] tracking-[-0.035em] leading-tight sm:whitespace-nowrap text-neutral-950"
            >
              Don&apos;t just see your wealth.{" "}
              <span
                className="font-black text-[#22C55E]"
                style={{ color: "#22C55E" }}
              >
                Understand it.
              </span>
            </h2>
          </div>

          {/* Product Bento Grid */}
          <ProductBentoScene
            ref={productSceneRef}
            engine={engine}
            refs={{
              cardsStageRef,
              cardsClusterRef,
              headerRef,
              headlineRef,
              ctaRef,
              floorLineRef,
              cardWrapperRefs,
              cardFlipperRefs,
              cardFrontRefs,
              cardBackRefs,
              cardDefaultRefs,
              cardHoverRefs,
              cardIllustrationRefs,
              cardGradientBgRefs,
              cardGlassOverlayRefs,
              bentoTileContentRefs,
              companionCardRefs,
              cardInkRefs,
              companionPaperRefs,
              companionInkRefs,
              restingToBentoTlRef,
            }}
            shared={productSharedRef}
            securityVaultSlot={null}
            aboutEnvelopeSlot={null}
          />

          <div ref={floorLineRef} className="hidden" />
        </section>

        {/* SECTION 3: SECURITY */}
        <section
          id="security"
          className="relative w-full bg-[#FAF8F5] pt-24 sm:pt-28 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-12 select-none"
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-16">
            {/* Left Column: Sticky Vault */}
            <div className="w-full lg:w-5/12 flex items-center justify-center lg:sticky lg:top-36 shrink-0 py-4">
              <SecurityVaultSlot
                safeContainerRef={safeContainerRef}
                safeVault3DRef={safeVault3DRef}
              />
            </div>

            {/* Right Column: Stacked Narrative Sub-states */}
            <div className="w-full lg:w-7/12 flex flex-col justify-start">
              <SecurityStageSlot
                securityStageRef={securityStageRef}
                securityStateRefs={securityStateRefs}
                securityHeroRibbonRef={securityHeroRibbonRef}
                securityHeroWordRefs={securityHeroWordRefs}
                typoEyesRef={typoEyesRef}
                typoLeftWordRef={typoLeftWordRef}
                typoRightWordRef={typoRightWordRef}
                typoPupilsRef={typoPupilsRef}
                typoEyelidsRef={typoEyelidsRef}
                pwdLetterRefs={pwdLetterRefs}
                pwdMaskRefs={pwdMaskRefs}
                lockCharRefs={lockCharRefs}
                lockIconWrapperRef={lockIconWrapperRef}
                lockShackleRef={lockShackleRef}
                lockBodyRef={lockBodyRef}
                connectionCharRefs={connectionCharRefs}
                connectionWrapperRef={connectionWrapperRef}
                indiaCharRefs={indiaCharRefs}
                indiaMapWrapperRef={indiaMapWrapperRef}
                indiaMapPathRef={indiaMapPathRef}
                moneyCharRefs={moneyCharRefs}
                moneyWrapperRef={moneyWrapperRef}
                moneyBill1Ref={moneyBill1Ref}
                moneyBill2Ref={moneyBill2Ref}
                sellCharRefs={sellCharRefs}
                sellShieldWrapperRef={sellShieldWrapperRef}
                sellShieldIconRef={sellShieldIconRef}
                closingBlackTextRef={closingBlackTextRef}
                closingGreenTextRef={closingGreenTextRef}
                closingBlackWordRefs={closingBlackWordRefs}
                closingGreenWordRefs={closingGreenWordRefs}
              />
            </div>
          </div>

          {/* Sparse transition fragments bridging Security into About */}
          <div className="absolute inset-x-0 bottom-2 pointer-events-none overflow-hidden select-none hidden md:block h-32">
            <div className="max-w-6xl mx-auto h-full relative">
              <div
                className="absolute left-[6%] bottom-4 rounded-[6px] border border-neutral-300/40 bg-[#F5F1E8]/70 p-2 shadow-[0_1px_2px_rgba(28,36,30,0.02)] -rotate-6 scale-90 opacity-20 pointer-events-none"
                style={{ width: "140px" }}
              >
                <div className="flex items-center justify-between border-b border-neutral-300/30 pb-0.5 mb-1">
                  <span className="font-mono text-[7.5px] font-bold text-neutral-400 uppercase">REGULATOR</span>
                  <span className="font-mono text-[7.5px] text-neutral-400">RBI // AA</span>
                </div>
                <p className="font-sans text-[9.5px] font-semibold text-neutral-600 truncate">Account Aggregator</p>
                <p className="font-mono text-[7.5px] text-neutral-400 mt-0.5 truncate">Consent Verified</p>
              </div>

              <div
                className="absolute right-[10%] bottom-8 rounded-[6px] border border-neutral-300/40 bg-[#F5F1E8]/70 p-2 shadow-[0_1px_2px_rgba(28,36,30,0.02)] rotate-4 scale-85 opacity-22 pointer-events-none"
                style={{ width: "135px" }}
              >
                <div className="flex items-center justify-between border-b border-neutral-300/30 pb-0.5 mb-1">
                  <span className="font-mono text-[7.5px] font-bold text-neutral-400 uppercase">MUTUAL FUNDS</span>
                  <span className="font-mono text-[7.5px] text-neutral-400">CAS // CAMS</span>
                </div>
                <p className="font-sans text-[9.5px] font-semibold text-neutral-600 truncate">Folio Statements</p>
                <p className="font-mono text-[7.5px] text-neutral-400 mt-0.5 truncate">Encrypted Transit</p>
              </div>

              <div
                className="absolute left-[36%] bottom-2 rounded-[6px] border border-neutral-300/30 bg-[#F5F1E8]/60 p-2 shadow-[0_1px_2px_rgba(28,36,30,0.02)] rotate-2 scale-80 opacity-18 pointer-events-none"
                style={{ width: "130px" }}
              >
                <div className="flex items-center justify-between border-b border-neutral-300/30 pb-0.5 mb-1">
                  <span className="font-mono text-[7.5px] font-bold text-neutral-400 uppercase">EQUITY</span>
                  <span className="font-mono text-[7.5px] text-neutral-400">CDSL // DEMAT</span>
                </div>
                <p className="font-sans text-[9.5px] font-semibold text-neutral-600 truncate">Holding Summary</p>
                <p className="font-mono text-[7.5px] text-neutral-400 mt-0.5 truncate">Read-Only Link</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: ABOUT (Option 1: Single-Viewport In-Place Editorial Morph) */}
        <section
          id="about"
          className="relative w-full bg-[#FAF8F5] h-[220vh] select-none"
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-8 sm:pt-10 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
            <AboutBackgroundSlot aboutContentRef={aboutContentRef} />

            <div className="relative z-10 max-w-5xl xl:max-w-6xl mx-auto w-full h-full flex flex-col justify-between">
              <AboutEnvelopeSlot
                unifiedEnvelopeRef={unifiedEnvelopeRef}
                docCavityWrapperRef={docCavityWrapperRef}
                philosophyDocRef={philosophyDocRef}
                docPaperSheetRef={docPaperSheetRef}
                docFlipperRef={docFlipperRef}
                docInkCopyRef={docInkCopyRef}
                envelopeTopFlapRef={envelopeTopFlapRef}
                envelopeSealRef={envelopeSealRef}
              />
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
