"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { getComposedViewport, getCardRestHeight, DESKTOP_REFERENCE_WIDTH } from "@/lib/viewport";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";
import { LinkButton } from "@/components/ui/Button";
import { SafeVault3D, SafeVault3DRef } from "@/components/blueprint/SafeVault3D";
import {
  ArrowRight,
  Sparkles,
  Search,
  Users,
  Layers,
  TrendingUp,
  Activity,
  CheckCircle2,
  HelpCircle,
  Coins,
  Shield,
} from "lucide-react";

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

const PRODUCT_CARDS: ProductCardData[] = [
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

const STACK_RANK_MAP: Record<number, number> = {
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

const SECURITY_STATES: SecurityStateItem[] = [
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

const PASSWORD_LETTERS = ["p", "a", "s", "s", "w", "o", "r", "d", "s"];
const LOCKED_LETTERS = ["L", "o", "c", "k", "e", "d"];
const CONNECTION_LETTERS = ["c", "o", "n", "n", "e", "c", "t", "i", "o", "n"];
const INDIA_LETTERS = ["I", "n", "d", "i", "a"];
const MONEY_LETTERS = ["m", "o", "n", "e", "y"];
const SELL_LETTERS = ["s", "e", "l", "l"];
const CLOSING_BLACK_WORDS = ["Security", "isn't", "just", "a", "feature", "here,"];
const CLOSING_GREEN_WORDS = ["It's", "the", "baseline", "everything", "else", "is", "built", "on."];

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);
  const [isAperturePaused, setIsAperturePaused] = useState(false);

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
  const currentSecurityStateRef = useRef<number>(0);
  const isSecurityTransitioningRef = useRef<boolean>(false);
  const lastSecurityScrollTimeRef = useRef<number>(0);
  const securityStateTransitionTlRef = useRef<gsap.core.Timeline | null>(null);

  // About Section Envelope & Philosophy Document Refs
  const unifiedEnvelopeRef = useRef<HTMLDivElement | null>(null);
  const envelopeTopFlapRef = useRef<HTMLDivElement | null>(null);
  const docCavityWrapperRef = useRef<HTMLDivElement | null>(null);
  const philosophyDocRef = useRef<HTMLDivElement | null>(null);
  const docPaperSheetRef = useRef<HTMLDivElement | null>(null);
  const docInkCopyRef = useRef<HTMLDivElement | null>(null);
  const docFlipperRef = useRef<HTMLDivElement | null>(null);
  const aboutDocPageRef = useRef<1 | 2>(1);
  const isFlippingDocRef = useRef<boolean>(false);
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
  const isRingConsolidatedRef = useRef<boolean>(false);
  const consolidationTlRef = useRef<gsap.core.Timeline | null>(null);
  const origCentersRef = useRef<{ x: number; y: number }[]>([]);
  const targetLeftXRef = useRef<number>(0);
  const targetRingYRef = useRef<number>(0);
  const heroShiftXRef = useRef<number>(0);
  const rightShiftXRef = useRef<number>(0);
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

  // Wheel & gesture isolation refs to prevent skipping states
  const wheelGestureActiveRef = useRef<boolean>(false);
  const wheelGestureEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchGestureActiveRef = useRef<boolean>(false);

  // State management & transition guards
  const stateRef = useRef<"hero" | "product-resting" | "product" | "sculpting" | "ring" | "about" | "faq">("hero");
  const productCompleteRef = useRef<boolean>(false);
  const isHoldingProductRef = useRef<boolean>(false);
  const transitionStartedRef = useRef<boolean>(false);
  const transitionAnimatingRef = useRef<boolean>(false);
  const transitionCompleteRef = useRef<boolean>(false);
  const arrivalIdleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apertureScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lockScrollYRef = useRef<number>(0);
  const momentumDrainTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHoverRef = useRef<number | null>(null);
  const hoverCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroToProductTlRef = useRef<gsap.core.Timeline | null>(null);
  const restingToBentoTlRef = useRef<gsap.core.Timeline | null>(null);

  // Unified Navbar Navigation Coordination Refs
  const isNavigatingRef = useRef<boolean>(false);
  const targetNavSectionRef = useRef<string | null>(null);
  const onHeroToProductCompletedRef = useRef<(() => void) | null>(null);
  const onProductToHeroCompletedRef = useRef<(() => void) | null>(null);
  const onProductToRingCompletedRef = useRef<(() => void) | null>(null);
  const onRingToProductCompletedRef = useRef<(() => void) | null>(null);
  const onConsolidateCompletedRef = useRef<(() => void) | null>(null);
  const onRestoreStackCompletedRef = useRef<(() => void) | null>(null);
  const pendingNavSectionRef = useRef<string | null>(null);

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

  // Synchronous force-reset of all 5 cards to pristine base/default state.
  // Kills all active hover tweens, clears hover timeouts, and synchronously applies base transforms & styles.
  const forceResetAllCardsToBase = () => {
    if (hoverCommitTimeoutRef.current) {
      clearTimeout(hoverCommitTimeoutRef.current);
      hoverCommitTimeoutRef.current = null;
    }
    currentHoverRef.current = null;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
    const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;

    PRODUCT_CARDS.forEach((card, i) => {
      const wrapper = cardWrapperRefs.current[i];
      const defaultEl = cardDefaultRefs.current[i];
      const hoverEl = cardHoverRefs.current[i];
      const front = cardFrontRefs.current[i];
      const illus = cardIllustrationRefs.current[i];

      if (wrapper) {
        gsap.killTweensOf(wrapper);
        gsap.set(wrapper, {
          width: restingWidth,
          scale: 1,
          x: 0,
          y: card.restY,
          z: card.restZ,
          rotateX: 0,
          rotateY: card.restRotateY,
          rotateZ: card.restRotateZ,
          opacity: 1,
          zIndex: 10 + (2 - Math.abs(i - 2)),
          clearProps: "transformOrigin",
        });
      }

      if (defaultEl) {
        gsap.killTweensOf(defaultEl);
        gsap.set(defaultEl, {
          display: "flex",
          autoAlpha: 1,
          opacity: 1,
          scale: 1,
          y: 0,
          visibility: "visible",
        });
      }

      if (hoverEl) {
        gsap.killTweensOf(hoverEl);
        gsap.set(hoverEl, {
          display: "flex",
          autoAlpha: 0,
          opacity: 0,
          scale: 1,
          y: 8,
          visibility: "hidden",
        });
      }

      if (illus) {
        gsap.killTweensOf(illus);
        gsap.set(illus, {
          autoAlpha: 1,
          opacity: 0.88,
          scale: 1,
          filter: "blur(0px)",
          visibility: "visible",
        });
      }

      const grad = cardGradientBgRefs.current[i];
      if (grad) {
        gsap.killTweensOf(grad);
        gsap.set(grad, { autoAlpha: 1, opacity: 1, visibility: "visible" });
      }

      const glass = cardGlassOverlayRefs.current[i];
      if (glass) {
        gsap.killTweensOf(glass);
        gsap.set(glass, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
      }

      const back = cardBackRefs.current[i];
      if (back) {
        gsap.killTweensOf(back);
        gsap.set(back, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
      }

      if (front) {
        gsap.killTweensOf(front);
        gsap.set(front, {
          background: "",
          backgroundColor: "#070908",
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow:
            "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
        });
      }

      const bentoContent = bentoTileContentRefs.current[i];
      if (bentoContent) {
        gsap.killTweensOf(bentoContent);
        gsap.set(bentoContent, { autoAlpha: 0, y: 14 });
      }
    });
  };

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
        transformOrigin: "57.0% 48.5%",
      });

      // Calibrated aperture hole center at 57.0% X, 48.5% Y
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
        x: 57.0,
        y: 48.5,
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

      // CRITICAL: At rest (y = 0), autoAlpha is 0 so there is NO stale image or patch over the video.
      // The video ring plays cleanly in its pure native state.
      gsap.set(irisPortalRef.current, { autoAlpha: 0 });
      gsap.set(portalRimRef.current, { autoAlpha: 0 });
      gsap.set(portalRippleRef.current, { autoAlpha: 0 });
      applyPortalClip(initialRadiusPx, 57.0, 48.5);

      // Hero Intro initial state
      gsap.set(heroIntroRef.current, { opacity: 0, autoAlpha: 1, x: 0, y: 16, scale: 1 });
      gsap.set(heroVisualRef.current, {
        opacity: 1,
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        transformOrigin: "57.0% 48.5%",
      });

      // OPTION 2: Atmospheric Stretch - Product world starts compressed in singularity void
      // Crossing through the singularity slingshots it outward into the amphitheater formation
      gsap.set(productWorldRef.current, {
        scale: 0.24,
        scaleX: 0.30,
        scaleY: 0.20,
        xPercent: 7.0,  // Aligns stage center with 57.0% X hole
        yPercent: -1.5, // Aligns stage center with 48.5% Y hole
        opacity: 0.25,
      });

      // Product Header & Floor Line initially hidden
      gsap.set(
        [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
        { autoAlpha: 0, opacity: 0, visibility: "hidden" }
      );
      if (headlineRef.current) gsap.set(headlineRef.current, { y: 20 });
      if (subheadRef.current) gsap.set(subheadRef.current, { y: 16 });
      if (ctaRef.current) gsap.set(ctaRef.current, { y: 14, scale: 0.94 });

      // Cards cluster initially clustered together facing away (back face forward)
      gsap.set(cardsClusterRef.current, {
        scaleX: 1.25,
        scaleY: 1.4,
      });

      PRODUCT_CARDS.forEach((card, i) => {
        const wrapper = cardWrapperRefs.current[i];
        const flipper = cardFlipperRefs.current[i];
        const front = cardFrontRefs.current[i];
        const back = cardBackRefs.current[i];
        const defaultEl = cardDefaultRefs.current[i];
        const hoverEl = cardHoverRefs.current[i];

        if (wrapper) {
          const initialXOffset = (i - 2) * -16;
          gsap.set(wrapper, {
            x: initialXOffset,
            y: card.restY,
            z: card.restZ,
            rotateY: card.restRotateY,
            rotateZ: card.restRotateZ,
            zIndex: 10 + (2 - Math.abs(i - 2)),
          });
        }

        if (front) {
          gsap.set(front, {
            borderRadius: "0px",
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
          });
        }
        if (back) gsap.set(back, { borderRadius: "0px", borderColor: "transparent" });
        if (flipper) gsap.set(flipper, { rotateY: 180 }); // Back face forward initially
        if (defaultEl) gsap.set(defaultEl, { autoAlpha: 1, scale: 1, y: 0 });
        if (hoverEl) gsap.set(hoverEl, { autoAlpha: 0, y: 8 });
        const illus = cardIllustrationRefs.current[i];
        if (illus) gsap.set(illus, { opacity: 0.88, scale: 1, filter: "blur(0px)" });
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
        // Fixed navbar height + safe clearances to ensure tiles never touch navbar or bottom edge
        const NAVBAR_HEIGHT = 80;
        const TOP_CLEARANCE = 14;
        const BOTTOM_CLEARANCE = 18;

        const usableTop = NAVBAR_HEIGHT + TOP_CLEARANCE;
        const usableBottom = vHeight - BOTTOM_CLEARANCE;
        const usableHeight = Math.max(380, usableBottom - usableTop);
        const usableCenterY = usableTop + usableHeight / 2;

        // Balanced widescreen bento aspect ratio (~1.82:1) giving comfortable vertical height to all rows
        const targetAspect = 1.82;

        // Generously expanded bounding box size so bento fills the page comfortably without overflowing.
        // The box's own size is clamped to the reference desktop width so it stays a stable size on
        // large monitors (recentering via bentoViewportLeft below, which still uses the real vWidth)
        // instead of continuing to grow the whole grid past what it looks like on a laptop.
        const composedW = Math.min(vWidth, DESKTOP_REFERENCE_WIDTH);
        const maxBentoW = Math.min(composedW * 0.92, 1540);
        const maxBentoH = Math.min(usableHeight * 0.95, 750);

        let bentoW = maxBentoW;
        let bentoH = bentoW / targetAspect;

        if (bentoH > maxBentoH) {
          bentoH = maxBentoH;
          bentoW = bentoH * targetAspect;
        }
        if (bentoW > maxBentoW) {
          bentoW = maxBentoW;
          bentoH = bentoW / targetAspect;
        }

        // Substantially increased spacing between boxes
        const gapX = Math.max(18, Math.min(32, Math.round(bentoW * 0.022)));
        const gapY = Math.max(16, Math.min(26, Math.round(bentoH * 0.036)));

        // Column 1 (Left Tall Card - Card 0):
        // Spans full height of the bento composition (~29.5% width)
        const w0 = Math.round((bentoW - gapX * 2) * 0.295);
        const h0 = bentoH;

        // Remaining width for Columns 2 & 3:
        const remW = bentoW - w0 - gapX;
        const availRowW = remW - gapX;

        // Asymmetric Row Heights:
        // Row 1 (Cards 1 & 2 have minimal concise copy) gets ~43% height (~260px - 285px)
        // Row 2 (Cards 3 & 4 have 4 & 5 detailed scenario clusters) gets ~57% height (~345px - 380px)
        const hRow1 = Math.round((bentoH - gapY) * 0.43);
        const hRow2 = bentoH - gapY - hRow1;

        // Row 1 (Top):
        // Card 1 (Skip the dashboards. Just ask.) is wider (~61%), Card 2 (See everything) is narrower (~39%)
        const w1 = availRowW - Math.round(availRowW * 0.39);
        const h1 = hRow1;
        const w2 = availRowW - w1;
        const h2 = hRow1;

        // Row 2 (Bottom):
        // Card 3 (Know your risk) gets ~49% width, Card 4 (Plan Ahead, 5 items) gets ~51% width
        const w3 = Math.round(availRowW * 0.49);
        const h3 = hRow2;
        const w4 = availRowW - w3;
        const h4 = hRow2;

        const tileWidths = [w0, w1, w2, w3, w4];
        const tileHeights = [h0, h1, h2, h3, h4];

        // Known vertical offset of cardsClusterRef top edge within the viewport when settled:
        // productWorldRef pt (80px on desktop lg, 72px on md, 64px on sm, 56px on mobile) + stage pt (8px) + cluster py (6px)
        const ptRem = vWidth >= 1024 ? 5 : vWidth >= 768 ? 4.5 : vWidth >= 640 ? 4 : 3.5;
        const clusterViewportTop = ptRem * 16 + 8 + 6;

        const clusterViewportLeft = vWidth > 1340 ? (vWidth - 1340) / 2 : 0;

        // Single Bounding Box position in viewport coordinates:
        const bentoViewportLeft = (vWidth - bentoW) / 2;
        const bentoViewportTop = usableCenterY - bentoH / 2;

        // Convert bounding box origin to coordinates relative to cardsClusterRef:
        const bentoClusterLeft = bentoViewportLeft - clusterViewportLeft;
        const bentoClusterTop = bentoViewportTop - clusterViewportTop;

        const rightColLeft = bentoClusterLeft + w0 + gapX;

        // Absolute left coordinates of the 5 tiles relative to cardsClusterRef:
        const tileLefts = [
          bentoClusterLeft,             // Card 0 (Left Tall Tile)
          rightColLeft,                 // Card 1 (Row 1 Left)
          rightColLeft + w1 + gapX,     // Card 2 (Row 1 Right)
          rightColLeft,                 // Card 3 (Row 2 Left)
          rightColLeft + w3 + gapX,     // Card 4 (Row 2 Right)
        ];

        // Absolute top coordinates of the 5 tiles relative to cardsClusterRef:
        const tileTops = [
          bentoClusterTop,              // Card 0
          bentoClusterTop,              // Card 1
          bentoClusterTop,              // Card 2
          bentoClusterTop + hRow1 + gapY,// Card 3 (Row 2 starts after Row 1)
          bentoClusterTop + hRow1 + gapY,// Card 4 (Row 2 starts after Row 1)
        ];

        return {
          bentoW,
          bentoH,
          gapX,
          gapY,
          tileWidths,
          tileHeights,
          tileLefts,
          tileTops,
        };
      };

      const initVw = typeof window !== "undefined" ? window.innerWidth : 1440;
      const initVh = typeof window !== "undefined" ? window.innerHeight : 800;
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

      // =======================================================================
      // HERO -> PRODUCT SINGLE-TRIGGER CINEMATIC TRANSITION
      // Sequence: Ring expands -> Cards emerge -> Cards flip one-by-one ->
      // Settle into current resting amphitheater positions ->
      // WAIT ~1 SECOND -> Cards gracefully glide & resize directly into Bento formation!
      // =======================================================================
      const createHeroToProductTimeline = () => {
        const vWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
        const vHeight = typeof window !== "undefined" ? window.innerHeight : 800;

        const holeCenterX = vWidth * 0.57;
        const holeCenterY = vHeight * 0.485;
        const dTL = Math.hypot(holeCenterX, holeCenterY);
        const dTR = Math.hypot(vWidth - holeCenterX, holeCenterY);
        const dBL = Math.hypot(holeCenterX, vHeight - holeCenterY);
        const dBR = Math.hypot(vWidth - holeCenterX, vHeight - holeCenterY);
        const maxRadiusPx = Math.ceil(Math.max(dTL, dTR, dBL, dBR)) + 20;

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            stateRef.current = "sculpting";
            transitionAnimatingRef.current = true;
            isHoldingProductRef.current = false;
            productCompleteRef.current = false;
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "none";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "none";
            cardWrapperRefs.current.forEach((el) => {
              if (el) {
                el.style.position = "";
                el.style.left = "";
                el.style.top = "";
                el.style.width = "";
                el.style.height = "";
              }
            });
          },
          onComplete: () => {
            stateRef.current = "product-resting";
            productCompleteRef.current = true;
            isHoldingProductRef.current = true;
            transitionAnimatingRef.current = false;
            setIsAperturePaused(true);
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "";
            gsap.set(
              [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
              { autoAlpha: 1, opacity: 1, visibility: "visible" }
            );
            dispatchActiveSection("product");
            if (onHeroToProductCompletedRef.current) {
              const cb = onHeroToProductCompletedRef.current;
              onHeroToProductCompletedRef.current = null;
              cb();
            }
          },
          onReverseComplete: () => {
            stateRef.current = "hero";
            productCompleteRef.current = false;
            isHoldingProductRef.current = false;
            transitionAnimatingRef.current = false;
            setIsAperturePaused(false);
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "none";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "none";
            gsap.set(
              [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
              { autoAlpha: 0, opacity: 0, visibility: "hidden" }
            );
            cardWrapperRefs.current.forEach((el) => {
              if (el) {
                el.style.position = "";
                el.style.left = "";
                el.style.top = "";
                el.style.width = "";
                el.style.height = "";
              }
            });
            dispatchActiveSection("hero");
            if (onProductToHeroCompletedRef.current) {
              const cb = onProductToHeroCompletedRef.current;
              onProductToHeroCompletedRef.current = null;
              cb();
            }
          },
        });

        // Ensure Product Header (headline, subhead, CTA) and floor line start hidden at t = 0
        tl.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          { autoAlpha: 0, opacity: 0, visibility: "hidden" },
          0.0
        );
        tl.set(headlineRef.current, { y: 20 }, 0.0);
        tl.set(subheadRef.current, { y: 16 }, 0.0);
        tl.set(ctaRef.current, { y: 14, scale: 0.94 }, 0.0);

        // 1. Ring Expands:
        // - Hero Intro Text pulls toward singularity and fades
        tl.to(
          heroIntroRef.current,
          {
            autoAlpha: 0,
            x: 60,
            y: -14,
            scale: 0.88,
            duration: 0.28,
            ease: "power2.in",
          },
          0.0
        );

        // - Hero Visual (Video Ring) zooms into optical center void
        tl.to(
          heroVisualRef.current,
          {
            scale: 5.5,
            xPercent: -7.0,
            yPercent: 1.5,
            duration: 0.65,
            ease: "power3.inOut",
          },
          0.0
        );

        // - Event Horizon & Iris Mask Portal Window expands numeric pixel radius
        tl.to(
          [irisPortalRef.current, portalRimRef.current],
          {
            autoAlpha: 1,
            duration: 0.12,
            ease: "power1.out",
          },
          0.04
        );

        // - Concentric ripple pulse
        tl.to(
          portalRippleRef.current,
          {
            autoAlpha: 0.75,
            duration: 0.10,
            ease: "power1.out",
          },
          0.05
        );
        tl.to(
          portalRippleRef.current,
          {
            autoAlpha: 0,
            duration: 0.20,
            ease: "power2.out",
          },
          0.18
        );

        // - Numeric clip path radius expands across the entire viewport
        tl.to(
          portalState,
          {
            radius: maxRadiusPx,
            x: 50.0,
            y: 50.0,
            duration: 0.62,
            ease: "power2.inOut",
            onUpdate: () => {
              applyPortalClip(portalState.radius, portalState.x, portalState.y);
            },
          },
          0.04
        );

        tl.to(
          portalRimRef.current,
          {
            autoAlpha: 0,
            duration: 0.14,
            ease: "power1.in",
          },
          0.46
        );

        tl.to(
          heroVisualRef.current,
          {
            opacity: 0,
            duration: 0.14,
            ease: "power1.in",
          },
          0.50
        );

        // 2. Cards emerge / become visible:
        // - Product World scales up from singularity
        tl.to(
          productWorldRef.current,
          {
            scale: 1.0,
            scaleX: 1.0,
            scaleY: 1.0,
            xPercent: 0,
            yPercent: 0,
            opacity: 1.0,
            duration: 0.44,
            ease: "power3.out",
          },
          0.28
        );


        // - Cards Cluster divides and expands into 5 individual cards
        tl.to(
          cardsClusterRef.current,
          {
            scaleX: 1,
            scaleY: 1,
            duration: 0.35,
            ease: "power2.out",
          },
          0.36
        );

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const front = cardFrontRefs.current[i];
          const back = cardBackRefs.current[i];

          if (wrapper) {
            tl.to(
              wrapper,
              {
                x: 0,
                y: card.restY,
                z: card.restZ,
                rotateY: card.restRotateY,
                rotateZ: card.restRotateZ,
                duration: 0.38,
                ease: "power3.out",
              },
              0.36
            );
          }

          if (front) {
            tl.to(
              front,
              {
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.74)",
                borderColor: "rgba(255, 255, 255, 0.75)",
                boxShadow:
                  "0 20px 45px -12px rgba(16, 44, 28, 0.08), 0 8px 18px -6px rgba(0, 0, 0, 0.04), 0 0 20px -4px rgba(34, 197, 94, 0.08), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95), inset 0 0.5px 0.5px 0 rgba(255, 255, 255, 0.8), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.06)",
                backdropFilter: "blur(24px)",
                duration: 0.24,
                ease: "power2.out",
              },
              0.42
            );
          }

          if (back) {
            tl.to(
              back,
              {
                borderRadius: "20px",
                borderColor: "rgba(255, 255, 255, 0.12)",
                duration: 0.24,
                ease: "power2.out",
              },
              0.42
            );
          }
        });

        // 3. Cards flip one by one in sequence (left to right):
        const flipDuration = 0.22;
        const flipStagger = 0.08;
        const flipBaseStart = 0.64;

        PRODUCT_CARDS.forEach((_, i) => {
          const flipper = cardFlipperRefs.current[i];
          if (!flipper) return;
          const startTime = flipBaseStart + i * flipStagger;
          tl.to(
            flipper,
            {
              rotateY: 0,
              duration: flipDuration,
              ease: "power2.inOut",
            },
            startTime
          );
        });

        // 4. Hero headline, supporting text and CTA enter during the card flip:
        // Shortly after the flip begins (0.70s), hero text starts entering so animations overlap naturally
        tl.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          { autoAlpha: 1, visibility: "visible" },
          0.70
        );

        tl.to(
          headlineRef.current,
          {
            autoAlpha: 1,
            opacity: 1,
            y: 0,
            duration: 0.30,
            ease: "power2.out",
          },
          0.72
        );

        tl.to(
          subheadRef.current,
          {
            autoAlpha: 1,
            opacity: 1,
            y: 0,
            duration: 0.30,
            ease: "power2.out",
          },
          0.76
        );

        tl.to(
          ctaRef.current,
          {
            autoAlpha: 1,
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.32,
            ease: "back.out(1.2)",
          },
          0.80
        );

        tl.to(
          floorLineRef.current,
          {
            autoAlpha: 1,
            opacity: 0.75,
            duration: 0.30,
            ease: "power2.out",
          },
          0.80
        );

        // Buffer at end before settling
        // Buffer at end before settling into amphitheater resting state
        const settleBuffer = 0.08;
        tl.to({}, { duration: settleBuffer }, flipBaseStart + 4 * flipStagger + flipDuration);

        return tl;
      };

      // =======================================================================
      // SCROLL-TRIGGERED BENTO TRANSFORMATION
      // Directly animates the 5 resting cards into the reference bento geometry
      // when the user scrolls down from the resting amphitheater state.
      // =======================================================================
      const createRestingToBentoTimeline = () => {
        const vWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
        const vHeight = typeof window !== "undefined" ? window.innerHeight : 800;

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            stateRef.current = "sculpting";
            transitionAnimatingRef.current = true;
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "none";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "none";
          },
          onComplete: () => {
            stateRef.current = "product";
            transitionAnimatingRef.current = false;
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "";
            dispatchActiveSection("product");
          },
          onReverseComplete: () => {
            stateRef.current = "product-resting";
            transitionAnimatingRef.current = false;
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "";
            gsap.set(
              [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
              { autoAlpha: 1, opacity: 1, y: 0, scale: 1, visibility: "visible" }
            );
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
            dispatchActiveSection("product");
          },
        });

        // 1. Smoothly fade out the headline, subhead, CTA, and floor reflection line before cards disperse
        const heroFadeDuration = 0.28;
        tl.to(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          {
            autoAlpha: 0,
            y: 12,
            duration: heroFadeDuration,
            ease: "power2.inOut",
          },
          0.0
        );

        tl.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          {
            autoAlpha: 0,
            opacity: 0,
            visibility: "hidden",
          },
          heroFadeDuration
        );

        // 2. Physical Card-to-Bento Direct Movement
        const bento = computeBentoLayout(vWidth, vHeight);
        const clusterEl = cardsClusterRef.current;
        const clusterW = clusterEl?.offsetWidth || Math.min(vWidth, 1340);
        const clusterH = clusterEl?.offsetHeight || 370;

        const wRest = vWidth >= 1536 ? 235 : vWidth >= 1280 ? 225 : vWidth >= 1024 ? 215 : vWidth >= 768 ? 205 : vWidth >= 640 ? 190 : 175;
        const hRest = getCardRestHeight(vWidth);
        const gapRest = vWidth >= 1280 ? 16 : vWidth >= 768 ? 14 : vWidth >= 640 ? 12 : 10;

        const bentoCardStartTime = 0.08;

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const targetL = Math.round(bento.tileLefts[i]);
          const targetT = Math.round(bento.tileTops[i]);
          const targetW = bento.tileWidths[i];
          const targetH = bento.tileHeights[i];

          const startL = Math.round((clusterW / 2) + (i - 2) * (wRest + gapRest) - wRest / 2);
          const startT = Math.round((clusterH / 2) - hRest / 2);

          tl.set(
            wrapper,
            {
              position: "absolute",
              left: startL,
              top: startT,
              width: wRest,
              height: hRest,
              transformOrigin: "center center",
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              scaleX: 1,
              scaleY: 1,
              scaleZ: 1,
              zIndex: 20 + i,
            },
            bentoCardStartTime
          );

          tl.to(
            wrapper,
            {
              left: targetL,
              top: targetT,
              width: targetW,
              height: targetH,
              x: 0,
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              duration: 1.15,
              ease: "power3.inOut",
            },
            bentoCardStartTime + i * 0.035
          );

          // 1. Smoothly fade out initial dark-card text, dark gradient, and centered amphitheater illustration
          const defContent = cardDefaultRefs.current[i];
          const gradBg = cardGradientBgRefs.current[i];
          const glassOverlay = cardGlassOverlayRefs.current[i];
          const centerIllu = cardIllustrationRefs.current[i];
          const frontFace = cardFrontRefs.current[i];
          const bentoContent = bentoTileContentRefs.current[i];

          if (defContent) {
            tl.to(defContent, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, bentoCardStartTime + 0.15);
          }
          if (gradBg) {
            tl.to(gradBg, { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" }, bentoCardStartTime + 0.15);
          }
          if (glassOverlay) {
            tl.to(glassOverlay, { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" }, bentoCardStartTime + 0.15);
          }
          if (centerIllu) {
            tl.to(centerIllu, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, bentoCardStartTime + 0.15);
          }

          // 2. Transition card surface into slightly darker frosted glass bento
          if (frontFace) {
            tl.to(
              frontFace,
              {
                backgroundColor: "rgba(220, 235, 226, 0.74)",
                borderColor: "rgba(255, 255, 255, 0.60)",
                boxShadow:
                  "0 28px 56px -14px rgba(12, 38, 24, 0.14), 0 10px 24px -8px rgba(34, 197, 94, 0.12), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.08)",
                borderRadius: "24px",
                backdropFilter: "blur(28px)",
                duration: 0.85,
                ease: "power2.inOut",
              },
              bentoCardStartTime + 0.25
            );
          }

          // 3. Smoothly fade in rich designed bento tile content
          if (bentoContent) {
            tl.fromTo(
              bentoContent,
              { autoAlpha: 0, y: 14 },
              { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
              bentoCardStartTime + 0.55 + i * 0.05
            );
          }
        });

        tl.to({}, { duration: 0.1 }, bentoCardStartTime + 1.30);

        return tl;
      };

      const triggerHeroToProduct = () => {
        if (transitionAnimatingRef.current || stateRef.current !== "hero") return;
        transitionAnimatingRef.current = true;
        stateRef.current = "sculpting";
        isHoldingProductRef.current = false;
        productCompleteRef.current = false;

        if (heroToProductTlRef.current) {
          heroToProductTlRef.current.kill();
        }
        heroToProductTlRef.current = createHeroToProductTimeline();
        heroToProductTlRef.current.play(0);
      };

      const triggerRestingToBento = () => {
        if (transitionAnimatingRef.current || stateRef.current !== "product-resting") return;
        transitionAnimatingRef.current = true;
        stateRef.current = "sculpting";

        if (restingToBentoTlRef.current) {
          restingToBentoTlRef.current.kill();
        }
        restingToBentoTlRef.current = createRestingToBentoTimeline();
        restingToBentoTlRef.current.play(0);
      };

      const triggerBentoToResting = () => {
        if (transitionAnimatingRef.current || stateRef.current !== "product") return;
        transitionAnimatingRef.current = true;
        stateRef.current = "sculpting";

        if (!restingToBentoTlRef.current) {
          restingToBentoTlRef.current = createRestingToBentoTimeline();
          restingToBentoTlRef.current.progress(1);
        }
        restingToBentoTlRef.current.timeScale(1.3).reverse();
      };

      const triggerProductToHero = () => {
        if (
          transitionAnimatingRef.current ||
          (stateRef.current !== "product-resting" && stateRef.current !== "product")
        )
          return;
        transitionAnimatingRef.current = true;
        stateRef.current = "sculpting";
        isHoldingProductRef.current = false;
        productCompleteRef.current = false;

        if (!heroToProductTlRef.current) {
          heroToProductTlRef.current = createHeroToProductTimeline();
          heroToProductTlRef.current.progress(1);
        }
        heroToProductTlRef.current.timeScale(1.3).reverse();
      };


      // =======================================================================
      // =======================================================================
      // PRODUCT (BENTO) -> SECURITY (COLLAPSE & RING) TRANSITION
      // The 5 bento tiles physically converge into the "Skip the dashboards. Just ask." card,
      // and from that stack point, seamlessly hand off to the existing ring/spiral formation,
      // Security text reveal, and docking animation.
      // =======================================================================
      const createProductToRingTimeline = () => {
        const clusterEl = cardsClusterRef.current;
        if (!clusterEl) return gsap.timeline();

        const vWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
        const vHeight = typeof window !== "undefined" ? window.innerHeight : 800;
        const isDesktop = vWidth >= 1024;
        const isTablet = vWidth >= 768;

        const clusterRect = clusterEl.getBoundingClientRect();
        const clusterCenterX = clusterRect.left + clusterRect.width / 2;
        const clusterCenterY = clusterRect.top + clusterRect.height / 2;
        const clusterW = clusterEl.offsetWidth || Math.min(vWidth, 1340);
        const clusterH = clusterEl.offsetHeight || 370;

        const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;
        const hRest = getCardRestHeight(vWidth);

        // Current Bento layout coordinates
        const bento = computeBentoLayout(vWidth, vHeight);

        // Destination stack point for Phase 1: Card 03 ("See Everything", idx === 2)
        const targetCardLeft = Math.round(bento.tileLefts[2] + (bento.tileWidths[2] - restingWidth) / 2);
        const targetCardTop = Math.round(bento.tileTops[2] + (bento.tileHeights[2] - hRest) / 2);
        const stackTargetX = Math.round(targetCardLeft + restingWidth / 2 - clusterW / 2);
        const stackTargetY = Math.round(targetCardTop + hRest / 2 - clusterH / 2);

        origCentersRef.current = PRODUCT_CARDS.map(() => ({
          x: stackTargetX,
          y: stackTargetY,
        }));

        const stackCardScale = isDesktop ? 0.62 : isTablet ? 0.58 : 0.54;

        // Viewport centering offset: positions the safe docked on the left side of the viewport
        const viewportCenterY = (typeof window !== "undefined" ? window.innerHeight : 900) / 2;
        const viewportCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
        // Clamped separately from viewportCenterX: the shift amounts below should stay
        // proportioned to the reference desktop width, while viewportCenterX itself must
        // keep tracking the real viewport center for the cluster-centering math.
        const composedCenterX = Math.min(typeof window !== "undefined" ? window.innerWidth : 1440, DESKTOP_REFERENCE_WIDTH) / 2;
        const targetRingX = Math.round(viewportCenterX - clusterCenterX);
        const leftShift = isDesktop
          ? Math.round(composedCenterX * 0.44)
          : isTablet
          ? Math.round(composedCenterX * 0.32)
          : Math.round(composedCenterX * 0.20);
        const targetLeftX = targetRingX - leftShift;
        const targetRingY = Math.round(viewportCenterY - clusterCenterY + 18);
        const rightShiftX = isDesktop
          ? Math.round(composedCenterX * 0.42)
          : isTablet
          ? Math.round(composedCenterX * 0.30)
          : Math.round(composedCenterX * 0.16);
        const heroShiftX = rightShiftX;

        targetLeftXRef.current = targetLeftX;
        targetRingYRef.current = targetRingY;
        heroShiftXRef.current = heroShiftX;
        rightShiftXRef.current = rightShiftX;
        stackTargetXRef.current = stackTargetX;
        stackTargetYRef.current = stackTargetY;
        cardsToSafeDeltaXRef.current = targetLeftX - stackTargetX;
        cardsToSafeDeltaYRef.current = targetRingY - stackTargetY;

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            stateRef.current = "sculpting";
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
          },
          onComplete: () => {
            stateRef.current = "ring";
            transitionAnimatingRef.current = false;
            transitionCompleteRef.current = true;
            isHoldingProductRef.current = false;
            currentSecurityStateRef.current = 0;
            isSecurityTransitioningRef.current = false;

            // Ensure no text, illustration, or background gradient is visible on any cards in the safe
            cardDefaultRefs.current.forEach((el) => {
              if (el) gsap.set(el, { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" });
            });
            cardHoverRefs.current.forEach((el) => {
              if (el) gsap.set(el, { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" });
            });
            cardIllustrationRefs.current.forEach((el) => {
              if (el) gsap.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
            });
            cardGradientBgRefs.current.forEach((el) => {
              if (el) gsap.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
            });
            cardBackRefs.current.forEach((el) => {
              if (el) gsap.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
            });
            bentoTileContentRefs.current.forEach((el) => {
              if (el) gsap.set(el, { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" });
            });
            cardGlassOverlayRefs.current.forEach((el) => {
              if (el) gsap.set(el, { autoAlpha: 1, opacity: 1, visibility: "visible" });
            });
            PRODUCT_CARDS.forEach((_, i) => {
              const front = cardFrontRefs.current[i];
              if (front) gsap.set(front, { backgroundColor: "transparent" });
            });

            if (cardsClusterRef.current) {
              cardsClusterRef.current.style.pointerEvents = "";
            }
            if (cardsStageRef.current) {
              cardsStageRef.current.style.pointerEvents = "";
            }

            playMoneyAnimation();

            dispatchActiveSection("security");

            if (onProductToRingCompletedRef.current) {
              const cb = onProductToRingCompletedRef.current;
              onProductToRingCompletedRef.current = null;
              cb();
            }
          },
          onReverseComplete: () => {
            stateRef.current = "product";
            transitionAnimatingRef.current = false;
            transitionStartedRef.current = false;
            transitionCompleteRef.current = false;
            productCompleteRef.current = true;
            isHoldingProductRef.current = true;
            currentSecurityStateRef.current = 0;
            isSecurityTransitioningRef.current = false;

            if (cardsClusterRef.current) {
              cardsClusterRef.current.style.pointerEvents = "";
            }
            if (cardsStageRef.current) {
              cardsStageRef.current.style.pointerEvents = "";
            }

            if (moneyAnimTlRef.current) {
              moneyAnimTlRef.current.kill();
              moneyAnimTlRef.current = null;
            }
            const moneyChars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
            if (moneyChars.length > 0) gsap.set(moneyChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            if (moneyWrapperRef.current) gsap.set(moneyWrapperRef.current, { opacity: 0, scale: 0.35 });
            if (moneyBill1Ref.current) gsap.set(moneyBill1Ref.current, { x: 0, y: 0, rotate: 0 });
            if (moneyBill2Ref.current) gsap.set(moneyBill2Ref.current, { x: 0, y: 0, rotate: 0 });

            if (ringRotateTweenRef.current) {
              ringRotateTweenRef.current.kill();
              ringRotateTweenRef.current = null;
            }
            if (cardsClusterRef.current) {
              gsap.set(cardsClusterRef.current, { rotateZ: 0, x: 0, y: 0, rotateX: 0, rotateY: 0 });
            }

            if (safeContainerRef.current) {
              gsap.set(safeContainerRef.current, {
                opacity: 0,
                visibility: "hidden",
                xPercent: -50,
                yPercent: -50,
                x: targetLeftX,
                y: targetRingY,
              });
            }
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.setCardsProgress?.(0);

            if (securityStageRef.current) {
              gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden", zIndex: 15 });
            }
            securityStateRefs.current.forEach((el) => {
              if (el) {
                gsap.set(el, { opacity: 0, visibility: "hidden", x: rightShiftX, y: 0, scale: 1, clipPath: "none" });
              }
            });

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
            if (lockScrollYRef.current > 0) {
              window.scrollTo(0, lockScrollYRef.current);
            }

            // Restore all 5 cards in clean Bento state
            const currentBento = computeBentoLayout(vWidth, vHeight);
            PRODUCT_CARDS.forEach((_, i) => {
              const wrapper = cardWrapperRefs.current[i];
              const front = cardFrontRefs.current[i];
              const bentoContent = bentoTileContentRefs.current[i];
              if (wrapper) {
                gsap.set(wrapper, {
                  position: "absolute",
                  left: Math.round(currentBento.tileLefts[i]),
                  top: Math.round(currentBento.tileTops[i]),
                  width: currentBento.tileWidths[i],
                  height: currentBento.tileHeights[i],
                  x: 0,
                  y: 0,
                  z: 0,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                  scale: 1,
                  opacity: 1,
                  zIndex: 20 + i,
                });
              }
              if (front) {
                gsap.set(front, {
                  backgroundColor: "rgba(220, 235, 226, 0.74)",
                  borderColor: "rgba(255, 255, 255, 0.60)",
                  boxShadow:
                    "0 28px 56px -14px rgba(12, 38, 24, 0.14), 0 10px 24px -8px rgba(34, 197, 94, 0.12), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.08)",
                  borderRadius: "24px",
                  backdropFilter: "blur(28px)",
                });
              }
              if (bentoContent) {
                gsap.set(bentoContent, {
                  display: "flex",
                  autoAlpha: 1,
                  opacity: 1,
                  visibility: "visible",
                  y: 0,
                });
              }
            });

            companionCardRefs.current.forEach((compEl) => {
              if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
            });

            dispatchActiveSection("product");

            if (onRingToProductCompletedRef.current) {
              const cb = onRingToProductCompletedRef.current;
              onRingToProductCompletedRef.current = null;
              cb();
            }
          },
        });

        // -------------------------------------------------------------------------
        // INITIAL TIMELINE STATE (t = 0.0s): Bento State
        // -------------------------------------------------------------------------
        tl.set(clusterEl, { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 }, 0);

        // Initialize cards in clean Bento formation
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const front = cardFrontRefs.current[i];
          if (wrapper) {
            tl.set(
              wrapper,
              {
                position: "absolute",
                left: Math.round(bento.tileLefts[i]),
                top: Math.round(bento.tileTops[i]),
                width: bento.tileWidths[i],
                height: bento.tileHeights[i],
                x: 0,
                y: 0,
                z: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
                opacity: 1,
                zIndex: i === 2 ? 35 : (i === 1 ? 25 : 20 + i),
              },
              0
            );
          }
          if (front) {
            tl.set(
              front,
              {
                backgroundColor: "rgba(255, 255, 255, 0.72)",
                borderColor: "rgba(255, 255, 255, 0.85)",
                boxShadow:
                  "0 24px 48px -12px rgba(12, 36, 22, 0.08), 0 4px 14px -3px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                backdropFilter: "blur(20px)",
              },
              0
            );
          }
        });

        // Bento tile content visible at t = 0
        bentoTileContentRefs.current.forEach((el) => {
          if (el) tl.set(el, { display: "flex", autoAlpha: 1, opacity: 1, visibility: "visible", y: 0 }, 0);
        });

        // Hide resting dark content elements
        cardDefaultRefs.current.forEach((el) => {
          if (el) tl.set(el, { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" }, 0);
        });
        cardHoverRefs.current.forEach((el) => {
          if (el) tl.set(el, { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" }, 0);
        });
        cardIllustrationRefs.current.forEach((el) => {
          if (el) tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden" }, 0);
        });
        cardGradientBgRefs.current.forEach((el) => {
          if (el) tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden" }, 0);
        });
        cardBackRefs.current.forEach((el) => {
          if (el) tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden" }, 0);
        });
        cardGlassOverlayRefs.current.forEach((el) => {
          if (el) tl.set(el, { autoAlpha: 0, opacity: 0 }, 0);
        });

        tl.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          { autoAlpha: 0, opacity: 0, visibility: "hidden" },
          0
        );

        // Pre-position companion cards as hidden (ring formation removed)
        companionCardRefs.current.forEach((compEl) => {
          if (!compEl) return;
          tl.set(compEl, { opacity: 0, visibility: "hidden" }, 0);
        });

        // Ensure ink sketch layers are hidden and paper layers visible at t = 0
        cardInkRefs.current.forEach((inkEl) => {
          if (inkEl) tl.set(inkEl, { opacity: 0, visibility: "hidden" }, 0);
        });
        companionInkRefs.current.forEach((inkEl) => {
          if (inkEl) tl.set(inkEl, { opacity: 0, visibility: "hidden" }, 0);
        });
        companionPaperRefs.current.forEach((pEl) => {
          if (pEl) tl.set(pEl, { opacity: 1, visibility: "visible" }, 0);
        });

        // Safe pre-positioned on the left side of the viewport
        if (safeContainerRef.current) {
          tl.set(
            safeContainerRef.current,
            {
              xPercent: -50,
              yPercent: -50,
              x: targetLeftX,
              y: targetRingY,
              scale: 0.94,
              opacity: 0,
              visibility: "hidden",
            },
            0
          );
        }
        tl.set(
          {},
          {
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(0);
              safeVault3DRef.current?.setCardsProgress?.(0);
            },
          },
          0
        );

        // Security Stage positioned & ready behind cards layer (z-15) from the beginning
        tl.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 15 }, 0);
        securityStateRefs.current.forEach((el) => {
          if (el) {
            tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: rightShiftX, y: 0, clipPath: "none" }, 0);
          }
        });
        if (securityHeroRibbonRef.current) {
          tl.set(securityHeroRibbonRef.current, { x: 0 }, 0);
        }

        // -------------------------------------------------------------------------
        // PHASE 1: BENTO CARDS COLLAPSE INTO "See Everything" CARD
        // (0.0s -> 0.72s)
        // All 5 bento cards gracefully and intentionally converge into the
        // "See Everything" tile at its location, forming the 3D stack.
        // -------------------------------------------------------------------------
        const STACK_ROTX = 38;
        const STACK_ROTY = -22;
        const STACK_ROTZ = -24;
        const collapseDuration = 0.72;

        // Stack hierarchy from front to back:
        // Card 2 ("See Everything") is at front (rank 0).
        // Card 1, 4, 3, 0 stack neatly behind it based on proximity.
        const stackRankMap: Record<number, number> = {
          2: 0,
          1: 1,
          4: 2,
          3: 3,
          0: 4,
        };

        const stackDelayMap: Record<number, number> = {
          2: 0,
          1: 0.015 * 1,
          4: 0.015 * 2,
          3: 0.015 * 3,
          0: 0.015 * 4,
        };

        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const rank = stackRankMap[i] ?? i;
          // Card 2 ("See Everything") stays at front of the stack (destZ = 0)
          // Other cards layer neatly behind it with subtle depth stratification
          const destZ = -8 * rank;
          const startDelay = stackDelayMap[i] ?? 0.015 * i;

          tl.to(
            wrapper,
            {
              left: targetCardLeft,
              top: targetCardTop,
              width: restingWidth,
              height: hRest,
              x: (4 - rank) * -1.5,
              y: (4 - rank) * 1.5,
              z: destZ,
              rotateX: STACK_ROTX,
              rotateY: STACK_ROTY,
              rotateZ: STACK_ROTZ,
              scale: stackCardScale,
              duration: collapseDuration - startDelay,
              ease: "power2.inOut",
            },
            startDelay
          );
        });

        // Fade out content on converging cards (0, 1, 3, 4) as they slide and disappear behind Card 2
        [0, 1, 3, 4].forEach((i) => {
          const content = bentoTileContentRefs.current[i];
          if (content) {
            tl.to(
              content,
              { autoAlpha: 0, opacity: 0, duration: 0.34, ease: "power2.in" },
              0.18
            );
          }
        });

        // Card 2 ("See Everything") retains its content throughout the convergence,
        // and smoothly dissolves right as the stack settles into position
        const card2Content = bentoTileContentRefs.current[2];
        if (card2Content) {
          tl.to(
            card2Content,
            { autoAlpha: 0, opacity: 0, duration: 0.22, ease: "power2.out" },
            collapseDuration - 0.22
          );
        }

        // Card front surfaces smoothly crystallize into clean smoked emerald translucent glass
        PRODUCT_CARDS.forEach((_, i) => {
          const front = cardFrontRefs.current[i];
          const slotK = i;
          const angleNorm = (slotK / 26) * 2 * Math.PI;
          const cosA = Math.cos(angleNorm);

          const baseAlpha = 0.26 + 0.08 * cosA;
          const specularTop = Math.min(Math.max(0.55 + 0.30 * cosA, 0.20), 0.88);
          const emeraldRefract = 0.20 + 0.10 * Math.sin(angleNorm + Math.PI / 3);
          const borderAlpha = Math.min(Math.max(0.14 + 0.08 * cosA, 0.09), 0.26);

          if (front) {
            tl.to(
              front,
              {
                backgroundColor: "transparent",
                background: `linear-gradient(140deg, rgba(6, 28, 18, ${baseAlpha.toFixed(2)}) 0%, rgba(3, 18, 11, ${(baseAlpha + 0.07).toFixed(2)}) 50%, rgba(1, 10, 6, ${(baseAlpha + 0.14).toFixed(2)}) 100%)`,
                borderColor: `rgba(255, 255, 255, ${borderAlpha.toFixed(2)})`,
                boxShadow:
                  `inset 0 1.5px 1px 0 rgba(255, 255, 255, ${(specularTop * 0.55).toFixed(2)}), ` +
                  "inset 1px 0 1px 0 rgba(255, 255, 255, 0.20), " +
                  `inset 0 -1.5px 2px 0 rgba(34, 197, 94, ${(emeraldRefract * 1.1).toFixed(2)}), ` +
                  "inset -1px 0 1.5px 0 rgba(34, 197, 94, 0.20), " +
                  "0 12px 26px -6px rgba(0, 0, 0, 0.36), " +
                  "0 2px 6px -1px rgba(2, 16, 9, 0.22)",
                borderRadius: "20px",
                duration: 0.30,
                ease: "power2.out",
              },
              collapseDuration - 0.30
            );
          }
        });

        // Exact point cards complete collapse into stack: ensure zero text persists
        tl.set(
          [
            ...cardDefaultRefs.current.filter(Boolean),
            ...cardHoverRefs.current.filter(Boolean),
            ...cardIllustrationRefs.current.filter(Boolean),
            ...cardGradientBgRefs.current.filter(Boolean),
            ...cardBackRefs.current.filter(Boolean),
            ...bentoTileContentRefs.current.filter(Boolean),
          ],
          { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" },
          collapseDuration
        );

        if (clusterEl) {
          const textNodes = clusterEl.querySelectorAll('[data-card-text="true"], .product-card-text');
          if (textNodes.length > 0) {
            tl.set(textNodes, { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" }, collapseDuration);
          }
        }

        // -------------------------------------------------------------------------
        // PHASE 1B: ROUND 3D LUXURY SAFE APPEARS ON THE LEFT (Matching "Safe Movement")
        // Sequence: Cards begin collapsing -> safe appears -> safe opens -> safe remains open -> safe closes
        // (Cards do NOT enter the safe yet; existing card collapse is untouched)
        // -------------------------------------------------------------------------
        if (safeContainerRef.current) {
          tl.set(
            safeContainerRef.current,
            {
              autoAlpha: 1,
              visibility: "visible",
              xPercent: -50,
              yPercent: -50,
              x: targetLeftX,
              y: targetRingY,
            },
            0.12
          );
          tl.fromTo(
            safeContainerRef.current,
            { opacity: 0, scale: 0.88 },
            { opacity: 1, scale: 1.0, duration: 0.38, ease: "power2.out" },
            0.12
          );
        }

        // Safe opens toward the LEFT (0.26s -> 1.02s)
        // 1. Outer rim/bolts rotate counter-clockwise to unlock
        // 2. Unlocked door pops outward (+Z) to clear rebate
        // 3. Heavy door swings to the LEFT with deliberate, weighted inertia
        const safeOpenStart = 0.26;
        const safeOpenDuration = 0.76;
        const safeMotionProxy = { p: 0 };

        tl.fromTo(
          safeMotionProxy,
          { p: 0 },
          {
            p: 1.0,
            duration: safeOpenDuration,
            ease: "power2.inOut",
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(safeMotionProxy.p);
            },
          },
          safeOpenStart
        );

        // -------------------------------------------------------------------------
        // PHASE 2: "PAPER -> INK" CARD TRANSFORMATION & ABSORPTION
        // Progression:
        // 1. NORMAL CARD STACK: Stack travels along intended trajectory toward the vault.
        // 2. BRIEFLY HOLDS NEAR VAULT: Recognizable physical card stack arrives and pauses.
        // 3. PROGRESSIVE PAPER -> INK MORPH:
        //    - Fine hand-drawn ink lines etch onto cards while paper is still solid (both coexist!).
        //    - Solid paper structure progressively dissolves into those ink lines.
        //    - Pure hand-drawn ink linework holds recognizably.
        // 4. INK ABSORPTION: Ink outlines are pulled inward into vault chamber and dissolve.
        // 5. VAULT CLOSES: Only once ink is inside, the vault door closes smoothly.
        // -------------------------------------------------------------------------
        const cardEnterStart = 1.05;
        const cardApproachDuration = 0.80;
        const cardsToSafeDeltaX = targetLeftX - stackTargetX;
        const cardsToSafeDeltaY = targetRingY - stackTargetY;

        // 1. Lead product cards: Approach as Paper -> Hold -> Morph to Ink (both coexist) -> Pull into Center
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const paper = cardFrontRefs.current[i];
          const ink = cardInkRefs.current[i];
          if (!wrapper) return;

          const rank = STACK_RANK_MAP[i] ?? i;
          const cardStart = cardEnterStart + rank * 0.02;

          // 1. Trajectory toward the vault opening: Arrives as solid, recognizable physical cards in front of vault!
          tl.to(
            wrapper,
            {
              x: cardsToSafeDeltaX + (4 - rank) * -0.4,
              y: cardsToSafeDeltaY + (4 - rank) * 0.4,
              z: 40 - rank * 2.0,
              rotateX: 14,
              rotateY: -12,
              rotateZ: -10 + rank * 2.5,
              duration: cardApproachDuration,
              ease: "power2.out",
            },
            cardStart
          );

          // 2. Hold briefly in front of the open vault, then progressive Paper -> Ink morph
          const morphStart = cardStart + cardApproachDuration + 0.16;
          if (paper && ink) {
            tl.set(ink, { opacity: 0, visibility: "visible" }, 0);

            // Substep A: Hand-drawn ink lines etch sharply onto the physical card surface
            tl.to(
              ink,
              {
                opacity: 1,
                duration: 0.48,
                ease: "power1.inOut",
              },
              morphStart
            );

            // Substep B: Progressive dissolution of the physical paper structure into the ink lines
            // (Begins 0.22s after ink starts etching — both visibly coexist during this window!)
            tl.to(
              paper,
              {
                opacity: 0,
                duration: 0.60,
                ease: "power1.inOut",
              },
              morphStart + 0.22
            );
          }

          // 3. Absorption: Resulting pure ink outlines are drawn inward into the vault chamber
          const pullStart = morphStart + 0.82;
          const pullDuration = 0.38;

          tl.to(
            wrapper,
            {
              x: cardsToSafeDeltaX,
              y: cardsToSafeDeltaY,
              z: -220,
              scale: 0.03,
              duration: pullDuration,
              ease: "power2.in",
            },
            pullStart
          );

          // Fine ink lines dissolve as they vanish into the vault center
          if (ink) {
            tl.to(
              ink,
              {
                opacity: 0,
                duration: 0.26,
                ease: "power2.in",
              },
              pullStart + 0.06
            );
          }

          tl.set(
            wrapper,
            {
              opacity: 0,
              autoAlpha: 0,
              visibility: "hidden",
            },
            pullStart + pullDuration + 0.02
          );
        });

        // 2. Trailing duplicate cards follow the same Paper -> Ink stream sequentially
        const enterCompanionCards = companionCardRefs.current.slice(0, 15).filter(Boolean) as HTMLElement[];
        enterCompanionCards.forEach((compEl, cIdx) => {
          const leadIdx = cIdx % 5;
          const leadRank = STACK_RANK_MAP[leadIdx] ?? leadIdx;
          const trailTier = Math.floor(cIdx / 5); // 0, 1, 2
          const trailDelay = cardEnterStart + leadRank * 0.02 + (trailTier + 1) * 0.010;
          const trailDur = cardApproachDuration * 0.95;
          const paperEl = companionPaperRefs.current[cIdx];
          const inkEl = companionInkRefs.current[cIdx];

          tl.set(
            compEl,
            {
              left: targetCardLeft,
              top: targetCardTop,
              width: restingWidth,
              height: hRest,
              x: 0,
              y: 0,
              z: -(cIdx + 5) * 4,
              scale: stackCardScale * (0.92 - trailTier * 0.12),
              opacity: 0,
              visibility: "visible",
            },
            cardEnterStart
          );

          // Fade in trail card as solid paper
          tl.to(
            compEl,
            {
              opacity: 0.75 - trailTier * 0.18,
              duration: 0.12,
              ease: "power1.out",
            },
            trailDelay
          );

          // Move toward vault as paper
          tl.to(
            compEl,
            {
              x: cardsToSafeDeltaX,
              y: cardsToSafeDeltaY,
              z: 20 - trailTier * 10,
              rotateX: 14,
              rotateY: -12,
              rotateZ: -12,
              duration: trailDur,
              ease: "power2.out",
            },
            trailDelay + 0.02
          );

          // Progressive Paper -> Ink conversion for trail card
          const trailMorphStart = trailDelay + trailDur + 0.14;
          if (paperEl && inkEl) {
            tl.set(inkEl, { opacity: 0, visibility: "visible" }, 0);
            tl.to(
              inkEl,
              {
                opacity: 0.90 - trailTier * 0.15,
                duration: 0.46,
                ease: "power1.inOut",
              },
              trailMorphStart
            );
            tl.to(
              paperEl,
              {
                opacity: 0,
                duration: 0.55,
                ease: "power1.inOut",
              },
              trailMorphStart + 0.20
            );
          }

          // Ink collapses into vault center
          const trailPullStart = trailMorphStart + 0.76;
          tl.to(
            compEl,
            {
              x: cardsToSafeDeltaX,
              y: cardsToSafeDeltaY,
              z: -240,
              scale: 0.02,
              duration: 0.36,
              ease: "power2.in",
            },
            trailPullStart
          );

          if (inkEl) {
            tl.to(
              inkEl,
              {
                opacity: 0,
                duration: 0.26,
                ease: "power2.in",
              },
              trailPullStart + 0.06
            );
          }

          tl.set(
            compEl,
            {
              opacity: 0,
              visibility: "hidden",
            },
            trailPullStart + 0.38
          );
        });

        safeVault3DRef.current?.setCardsProgress?.(0);

        // -------------------------------------------------------------------------
        // PHASE 3: REVEAL SECURITY HERO TEXT WHILE CARDS ENTER (1.25s -> 2.00s)
        // -------------------------------------------------------------------------
        const textRevealStart = 1.25;
        const textRevealDuration = 0.75;
        const state0El = securityStateRefs.current[0];
        const ribbonEl = securityHeroRibbonRef.current;

        if (state0El && ribbonEl) {
          const stackLocalCenterX = stackTargetX - rightShiftX;
          const enterOffset = Math.max(Math.min(stackLocalCenterX, 140), 60);

          tl.set(state0El, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: rightShiftX, y: 0, clipPath: "none" }, 0);
          tl.set(ribbonEl, { x: enterOffset, opacity: 0 }, 0);

          tl.set(
            state0El,
            {
              autoAlpha: 1,
              opacity: 1,
              visibility: "visible",
              clipPath: "none",
            },
            textRevealStart
          );

          tl.fromTo(
            ribbonEl,
            { x: enterOffset, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: textRevealDuration,
              ease: "power2.out",
            },
            textRevealStart
          );

          tl.set(state0El, { clipPath: "none" }, textRevealStart + textRevealDuration);
        }

        // -------------------------------------------------------------------------
        // PHASE 4: VAULT DOOR CLOSES IMMEDIATELY AFTER CARDS ENTER (3.28s -> 3.72s)
        // Door closes immediately as cards finish disappearing into the vault chamber.
        // Zero dead pause, zero idle gap!
        // -------------------------------------------------------------------------
        const safeCloseStart = 3.28;
        const safeCloseDuration = 0.44;

        tl.to(
          safeMotionProxy,
          {
            p: 0.0,
            duration: safeCloseDuration,
            ease: "power2.inOut",
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(safeMotionProxy.p);
            },
          },
          safeCloseStart
        );

        tl.set(securityStageRef.current, { zIndex: 35 }, safeCloseStart + safeCloseDuration);

        return tl;
      };

      // -------------------------------------------------------------------------
      // MONEY TYPOGRAPHY TRANSFORMATION INTERACTION: "take your money."
      // Smoothly morphs the word "money" into the animated cash banknote stack from money.mp4
      // 1. Text settles briefly after sliding into the right-side Security layout.
      // 2. The 5 letters (m-o-n-e-y) deconstruct and fly/contract into the banknote shape.
      // 3. The crisp cash banknote scales into position directly over the word.
      // 4. Two additional banknotes fan up from behind to form the 3-bill cash fan.
      // 5. Subtle playful bounce/flutter matching the reference video.
      // 6. Banknotes hold their fan formation proudly.
      // 7. Bills collapse smoothly back into a single banknote.
      // 8. Banknote contracts/dissolves, and the 5 letters reconstruct outward
      //    into the exact original word "money".
      // 9. Scrolling unlocks once word is restored!
      // -------------------------------------------------------------------------
      const playMoneyAnimation = () => {
        const chars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
        const wrapper = moneyWrapperRef.current;
        const bill1 = moneyBill1Ref.current;
        const bill2 = moneyBill2Ref.current;

        if (chars.length === 0 || !wrapper) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (moneyAnimTlRef.current) {
          moneyAnimTlRef.current.kill();
        }

        // Reset elements to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.85 });
        if (bill1) gsap.set(bill1, { x: 0, y: 0, rotate: 0 });
        if (bill2) gsap.set(bill2, { x: 0, y: 0, rotate: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(wrapper, { opacity: 0, scale: 0.85 });
            if (bill1) gsap.set(bill1, { x: 0, y: 0, rotate: 0 });
            if (bill2) gsap.set(bill2, { x: 0, y: 0, rotate: 0 });
            isSecurityTransitioningRef.current = false;
            lastSecurityScrollTimeRef.current = Date.now();
            wheelGestureActiveRef.current = true;
            if (wheelGestureEndTimerRef.current) clearTimeout(wheelGestureEndTimerRef.current);
            wheelGestureEndTimerRef.current = setTimeout(() => {
              wheelGestureActiveRef.current = false;
            }, 250);
          },
        });

        moneyAnimTlRef.current = tl;

        // 1. Brief settle so user can read the settled headline
        const tSettle = 0.30;

        // 2. The 5 letters contract seamlessly in-place into the banknote shape
        chars.forEach((char, i) => {
          const offsetX = (i - 2) * 5;
          tl.to(
            char,
            {
              x: offsetX,
              y: 0,
              scale: 0.35,
              opacity: 0,
              duration: 0.25,
              ease: "power2.in",
            },
            tSettle + i * 0.015
          );
        });

        // 3. Banknote SVG blooms directly in place over the bounding box of "money"
        const tBillEnter = tSettle + 0.12;
        tl.fromTo(
          wrapper,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: "back.out(1.8)",
          },
          tBillEnter
        );

        // 4. Two banknotes fan out gently directly within the bounding area
        const tFanOut = tBillEnter + 0.22;
        if (bill1) {
          tl.to(
            bill1,
            {
              x: 2.5,
              y: -1.2,
              rotate: 4.5,
              duration: 0.32,
              ease: "back.out(1.8)",
            },
            tFanOut
          );
        }
        if (bill2) {
          tl.to(
            bill2,
            {
              x: -2.5,
              y: 1.0,
              rotate: -5.5,
              duration: 0.34,
              ease: "back.out(2.0)",
            },
            tFanOut + 0.02
          );
        }

        // 5. Subtle playful bounce/flutter on the front bill
        const tFlutter = tFanOut + 0.38;
        if (bill2) {
          tl.to(
            bill2,
            {
              rotate: -3.5,
              duration: 0.16,
              yoyo: true,
              repeat: 1,
              ease: "sine.inOut",
            },
            tFlutter
          );
        }

        // 6. Proud hold of the cash fan
        const tHoldEnd = tFlutter + 0.32 + 0.70;

        // 7. Collapse the bills back together into 1 banknote
        const tCollapse = tHoldEnd;
        if (bill1 || bill2) {
          tl.to(
            [bill1, bill2].filter(Boolean),
            {
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.26,
              ease: "power2.inOut",
            },
            tCollapse
          );
        }

        // 8. Banknote contracts & dissolves in-place
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.85,
            duration: 0.22,
            ease: "power2.in",
          },
          tCollapse + 0.16
        );

        // 9. All 5 letters reconstruct outward back into their exact typographical positions
        const tRestore = tCollapse + 0.22;
        chars.forEach((char, i) => {
          tl.fromTo(
            char,
            { opacity: 0, scale: 0.35, x: (i - 2) * 5, y: 0, rotate: 0 },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.30,
              ease: "back.out(2.0)",
            },
            tRestore + i * 0.02
          );
        });
      };

      // -------------------------------------------------------------------------
      // TYPOGRAPHIC EYES EASTER EGG: "Read-only, always"
      // Subtly peeks out from within the headline typography (above/around the comma),
      // looks around curiously, blinks naturally, then gracefully retreats.
      // -------------------------------------------------------------------------
      // TYPOGRAPHIC EYES EASTER EGG: "Read-only, always"
      // DRAMATIC PHYSICAL INTERACTION:
      // Eyes struggle and force their way out from behind the headline typography,
      // physically pushing "Read-only," and "always" apart against subtle resistance,
      // looking around with curiosity, blinking naturally, and then sinking back down
      // while the two parts of the headline seamlessly slide back together.
      // -------------------------------------------------------------------------
      const playTypoEyesAnimation = () => {
        const eyesEl = typoEyesRef.current;
        const leftWord = typoLeftWordRef.current;
        const rightWord = typoRightWordRef.current;
        if (!eyesEl) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        const pupils = typoPupilsRef.current.filter(Boolean) as HTMLElement[];
        const eyelids = typoEyelidsRef.current.filter(Boolean) as HTMLElement[];

        // Dynamic push distance based on screen width - generous spacing so composition feels spacious and unclustered
        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        const isTablet = typeof window !== "undefined" && window.innerWidth < 1024;
        const pushDistance = isMobile ? 38 : isTablet ? 52 : 66;

        // Reset initial state: words closed at rest, eyes compressed tightly behind
        gsap.set(eyesEl, {
          y: 28,
          opacity: 0,
          scaleX: 0.55,
          scaleY: 1.35,
          visibility: "visible",
        });
        if (leftWord) gsap.set(leftWord, { x: 0 });
        if (rightWord) gsap.set(rightWord, { x: 0 });
        if (eyelids.length > 0) gsap.set(eyelids, { scaleY: 0 });
        if (pupils.length > 0) gsap.set(pupils, { x: 0, y: 0 });

        if (typoEyesTlRef.current) {
          typoEyesTlRef.current.kill();
        }

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(eyesEl, { opacity: 0, visibility: "hidden" });
            if (leftWord) gsap.set(leftWord, { x: 0 });
            if (rightWord) gsap.set(rightWord, { x: 0 });
            isSecurityTransitioningRef.current = false;
          },
        });

        typoEyesTlRef.current = tl;

        // --- STAGE 1: STRAINED AWAKENING & INITIAL RESISTANCE ---
        // The eyes start pushing up into the seam between the words; words push apart slightly and resist
        tl.to(
          eyesEl,
          {
            y: 12,
            opacity: 0.85,
            scaleX: 0.70,
            scaleY: 1.25,
            duration: 0.28,
            ease: "power1.out",
          },
          0.15
        );

        if (leftWord && rightWord) {
          tl.to(
            leftWord,
            {
              x: -15,
              duration: 0.28,
              ease: "power1.out",
            },
            0.15
          );
          tl.to(
            rightWord,
            {
              x: 15,
              duration: 0.28,
              ease: "power1.out",
            },
            0.15
          );

          // Micro-tension / resistance stutter (words fight back momentarily)
          tl.to(
            leftWord,
            {
              x: -11,
              duration: 0.10,
              ease: "sine.inOut",
            },
            0.43
          );
          tl.to(
            rightWord,
            {
              x: 11,
              duration: 0.10,
              ease: "sine.inOut",
            },
            0.43
          );
        }

        tl.to(
          eyesEl,
          {
            scaleX: 0.62,
            scaleY: 1.30,
            y: 10,
            duration: 0.10,
            ease: "sine.inOut",
          },
          0.43
        );

        // --- STAGE 2: THE BREAKTHROUGH & SQUASH-STRETCH POP ---
        // The eyes force through the resistance; words snap wide open; eyes pop and settle
        if (leftWord && rightWord) {
          tl.to(
            leftWord,
            {
              x: -pushDistance,
              duration: 0.44,
              ease: "back.out(1.5)",
            },
            0.53
          );
          tl.to(
            rightWord,
            {
              x: pushDistance,
              duration: 0.44,
              ease: "back.out(1.5)",
            },
            0.53
          );
        }

        tl.to(
          eyesEl,
          {
            y: 0,
            opacity: 1,
            scaleX: 1.15,
            scaleY: 0.88,
            duration: 0.35,
            ease: "power2.out",
          },
          0.53
        );

        // Settle from squash/stretch back to perfect 1.0 circle
        tl.to(
          eyesEl,
          {
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 0.25,
            ease: "elastic.out(1.2, 0.4)",
          },
          0.85
        );

        // --- STAGE 3: DRAMATIC LOOK AROUND ---
        // Curious glance left
        if (pupils[0]) {
          tl.to(pupils[0], { x: -7.5, y: -2.0, duration: 0.28, ease: "power2.inOut" }, 1.05);
        }
        if (pupils[1]) {
          tl.to(pupils[1], { x: -6.5, y: -1.8, duration: 0.28, ease: "power2.inOut" }, 1.05);
        }

        // Broad sweep across to the right
        if (pupils[0]) {
          tl.to(pupils[0], { x: 8.0, y: 1.8, duration: 0.44, ease: "power2.inOut" }, 1.45);
        }
        if (pupils[1]) {
          tl.to(pupils[1], { x: 8.5, y: 2.0, duration: 0.44, ease: "power2.inOut" }, 1.45);
        }

        // --- STAGE 4: NATURAL BLINKING ---
        // First crisp blink
        if (eyelids.length > 0) {
          tl.to(eyelids, { scaleY: 1, duration: 0.08, ease: "power2.in" }, 2.00);
          tl.to(eyelids, { scaleY: 0, duration: 0.12, ease: "power2.out" }, 2.08);
        }

        // Pupils snap directly back to center
        if (pupils.length > 0) {
          tl.to(pupils, { x: 0, y: 0, duration: 0.22, ease: "power2.out" }, 2.10);
        }

        // Playful secondary micro-blink
        if (eyelids.length > 0) {
          tl.to(eyelids, { scaleY: 0.80, duration: 0.06, ease: "power1.in" }, 2.45);
          tl.to(eyelids, { scaleY: 0, duration: 0.09, ease: "power1.out" }, 2.51);
        }

        // --- STAGE 5: RETREAT & WORDS SLIDING BACK TOGETHER ---
        // Eyes stretch vertically and sink back down into the gap
        tl.to(
          eyesEl,
          {
            y: 28,
            scaleX: 0.60,
            scaleY: 1.30,
            opacity: 0,
            duration: 0.38,
            ease: "power2.in",
          },
          2.80
        );

        // Words smoothly and magnetically slide back to 0
        if (leftWord && rightWord) {
          tl.to(
            [leftWord, rightWord],
            {
              x: 0,
              duration: 0.40,
              ease: "power3.inOut",
            },
            2.88
          );
        }
      };

      // -------------------------------------------------------------------------
      // PASSWORD MASKING INTERACTION: "We never save your passwords"
      // Shows "passwords" normally for a brief moment, then replaces letters
      // with asterisks (*) one character at a time (passwords -> *asswords -> ... -> *********).
      // Immediately reverses in reverse order restoring letters one by one (* -> s, * -> d, etc.).
      // Word layout is rock-solid with zero width jumping, text shifting, or reflow.
      // -------------------------------------------------------------------------
      const playPasswordMaskAnimation = () => {
        const letters = pwdLetterRefs.current.filter(Boolean) as HTMLElement[];
        const masks = pwdMaskRefs.current.filter(Boolean) as HTMLElement[];
        if (letters.length === 0 || masks.length === 0) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (pwdMaskTlRef.current) {
          pwdMaskTlRef.current.kill();
        }

        // Reset to initial clean state: letters visible, masks hidden
        gsap.set(letters, { opacity: 1, scale: 1, y: 0 });
        gsap.set(masks, { opacity: 0, scale: 0.35, y: 0 });

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 2.4,
        });

        pwdMaskTlRef.current = tl;

        // 1. Brief hold so user reads the full word "passwords" normally
        const initialHold = 0.45;
        const charDuration = 0.11;

        // 2. Sequential masking: replace letters with asterisks one-by-one (0 to 8)
        letters.forEach((letter, i) => {
          const t = initialHold + i * charDuration;
          const mask = masks[i];

          // Letter pops down and fades out
          tl.to(
            letter,
            {
              opacity: 0,
              scale: 0.35,
              duration: 0.13,
              ease: "power2.in",
            },
            t
          );

          // Asterisk pops in with a crisp, satisfying micro-spring
          if (mask) {
            tl.to(
              mask,
              {
                opacity: 1,
                scale: 1,
                duration: 0.20,
                ease: "back.out(2.4)",
              },
              t + 0.04
            );
          }
        });

        // 3. As soon as final letter becomes an asterisk, reverse immediately in reverse order
        const fullMaskTime = initialHold + (letters.length - 1) * charDuration + 0.20;
        const unmaskStart = fullMaskTime + 0.18;

        // 4. Reverse unmasking: restore original letters one-by-one from right to left (8 down to 0)
        let passCompleteTime = unmaskStart;
        for (let j = letters.length - 1; j >= 0; j--) {
          const stepIndex = (letters.length - 1) - j;
          const t = unmaskStart + stepIndex * charDuration;
          const letter = letters[j];
          const mask = masks[j];

          // Asterisk disappears
          if (mask) {
            tl.to(
              mask,
              {
                opacity: 0,
                scale: 0.35,
                duration: 0.13,
                ease: "power2.in",
              },
              t
            );
          }

          // Letter pops back in
          tl.to(
            letter,
            {
              opacity: 1,
              scale: 1,
              duration: 0.20,
              ease: "back.out(2.0)",
            },
            t + 0.04
          );

          passCompleteTime = Math.max(passCompleteTime, t + 0.24);
        }

        // 5. As soon as one pass completes (all letters are restored back to "passwords"),
        // unlock scrolling so the user can freely scroll to the next state,
        // while allowing the animation to continue looping continuously.
        tl.call(
          () => {
            isSecurityTransitioningRef.current = false;
          },
          undefined,
          passCompleteTime
        );
      };

      // -------------------------------------------------------------------------
      // LOCK TYPOGRAPHY TRANSFORMATION: "Locked down, everywhere"
      // Triggers a one-time typography transformation animation on the word "Locked".
      // Settle briefly -> Letters L, o, c, k morph inward into a golden padlock
      // -> Shackle snaps shut with punchy recoil (inspired by Lock.mp4)
      // -> Brief proud hold -> Reverse morph: shackle unlocks, lock dissolves,
      // letters spring back cleanly into original word "Locked" -> Scrolling unlocked!
      // -------------------------------------------------------------------------
      // -------------------------------------------------------------------------
      // LOCK TYPOGRAPHY TRANSFORMATION: "Locked down, everywhere"
      // Triggers typography transformation animation on the whole word "Locked".
      // Settle briefly -> All 6 letters L, o, c, k, e, d morph inward into a golden padlock
      // -> Shackle snaps shut with punchy recoil (inspired by Lock.mp4)
      // -> Brief proud hold -> Reverse morph: shackle unlocks, lock dissolves,
      // all 6 letters spring back cleanly into original word "Locked" -> Scrolling unlocked!
      // Plays every time the user enters this state (including when scrolling back up and down).
      // -------------------------------------------------------------------------
      const playLockMorphAnimation = () => {
        const chars = lockCharRefs.current.filter(Boolean) as HTMLElement[];
        const iconWrapper = lockIconWrapperRef.current;
        const shackle = lockShackleRef.current;
        const body = lockBodyRef.current;

        if (chars.length < 6 || !iconWrapper || !shackle || !body) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (lockAnimTlRef.current) {
          lockAnimTlRef.current.kill();
        }

        // Reset to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(iconWrapper, { opacity: 0, scale: 0.35, rotate: 0 });
        gsap.set(shackle, { y: -14 });
        gsap.set(body, { scale: 1, y: 0, rotate: 0, transformOrigin: "center center" });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(iconWrapper, { opacity: 0, scale: 0.35 });
            isSecurityTransitioningRef.current = false;
            lastSecurityScrollTimeRef.current = Date.now();
            wheelGestureActiveRef.current = true;
            if (wheelGestureEndTimerRef.current) clearTimeout(wheelGestureEndTimerRef.current);
            wheelGestureEndTimerRef.current = setTimeout(() => {
              wheelGestureActiveRef.current = false;
            }, 250);
          },
        });

        lockAnimTlRef.current = tl;

        // 1. Brief settle so user reads "Locked down, everywhere" normally
        const tSettle = 0.38;

        // 2. The whole word "Locked" (all 6 letters) morphs and converges inward into the padlock
        // Far left: 'L' vertical stroke rises and moves right into left shackle leg
        tl.to(
          chars[0],
          {
            x: 42,
            y: -12,
            scaleY: 1.3,
            scaleX: 0.6,
            opacity: 0,
            duration: 0.38,
            ease: "power2.in",
          },
          tSettle
        );
        // Mid left: 'o' rises and moves right into top shackle arch
        tl.to(
          chars[1],
          {
            x: 24,
            y: -16,
            scale: 1.35,
            opacity: 0,
            duration: 0.36,
            ease: "power2.in",
          },
          tSettle + 0.02
        );
        // Near left: 'c' curves into upper shoulder
        tl.to(
          chars[2],
          {
            x: 10,
            y: -8,
            scale: 1.15,
            opacity: 0,
            duration: 0.36,
            ease: "power2.in",
          },
          tSettle + 0.03
        );
        // Near right: 'k' collapses into center lock core
        tl.to(
          chars[3],
          {
            x: -8,
            y: -4,
            scale: 0.5,
            opacity: 0,
            duration: 0.36,
            ease: "power2.in",
          },
          tSettle + 0.03
        );
        // Mid right: 'e' curves into right shackle shoulder
        tl.to(
          chars[4],
          {
            x: -24,
            y: -14,
            scale: 1.2,
            rotate: -16,
            opacity: 0,
            duration: 0.36,
            ease: "power2.in",
          },
          tSettle + 0.02
        );
        // Far right: 'd' sweeps left into right shackle leg and lock body
        tl.to(
          chars[5],
          {
            x: -42,
            y: -10,
            scaleY: 1.25,
            opacity: 0,
            duration: 0.38,
            ease: "power2.in",
          },
          tSettle
        );

        // The golden padlock blooms directly out of the converged word center
        const tLockAppear = tSettle + 0.22;
        tl.to(
          iconWrapper,
          {
            opacity: 1,
            scale: 1,
            duration: 0.32,
            ease: "back.out(1.8)",
          },
          tLockAppear
        );

        // 3. Shackle plunges down and snaps shut into the lock body (Lock.mp4)
        const tSnap = tLockAppear + 0.28;
        tl.to(
          shackle,
          {
            y: 0,
            duration: 0.16,
            ease: "power4.in",
          },
          tSnap
        );

        // Impact recoil: lock body dips, wobbles slightly and squashes on snap
        tl.to(
          body,
          {
            y: 3.5,
            scaleX: 1.08,
            scaleY: 0.92,
            rotate: -3.5,
            duration: 0.08,
            ease: "power2.out",
          },
          tSnap + 0.14
        );
        tl.to(
          body,
          {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotate: 0,
            duration: 0.26,
            ease: "elastic.out(1.4, 0.35)",
          },
          tSnap + 0.22
        );

        // 4. Brief proud hold in locked form
        const tHoldEnd = tSnap + 0.22 + 0.72;

        // 5. Reverse morph: shackle unlocks, lock dissolves, ALL 6 letters burst back into "Locked"
        // Shackle pops back up
        tl.to(
          shackle,
          {
            y: -14,
            duration: 0.18,
            ease: "back.out(2.2)",
          },
          tHoldEnd
        );

        // Lock icon dissolves back into center
        tl.to(
          iconWrapper,
          {
            opacity: 0,
            scale: 0.35,
            duration: 0.26,
            ease: "power2.in",
          },
          tHoldEnd + 0.08
        );

        // All 6 letters L, o, c, k, e, d spring outward from center into original typographical positions
        const tRestore = tHoldEnd + 0.12;
        chars.forEach((char, i) => {
          tl.to(
            char,
            {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.32,
              ease: "back.out(2.0)",
            },
            tRestore + i * 0.03
          );
        });
      };

      // -------------------------------------------------------------------------
      // CONNECTION TYPOGRAPHY TRANSFORMATION INTERACTION: "You control the connection"
      // 1. Full line "You control the connection" appears normally and settles.
      // 2. The 10 letters of "connection" (c-o-n-n-e-c-t-i-o-n) disperse gracefully outward.
      // 3. The animated "connection" SVG appears directly over the word "connection",
      //    playing its vibrant Unifolio green (#22C55E) animated connecting cards and sparkles.
      // 4. Smooth resolution: after playing, the SVG dissolves, and the letters of
      //    "connection" spring back outward into their clean typographical positions.
      // 5. Scrolling unlocks once text is fully restored!
      // Plays every time the user enters this state.
      // -------------------------------------------------------------------------
      const playConnectionAnimation = () => {
        const chars = connectionCharRefs.current.filter(Boolean) as HTMLElement[];
        const wrapper = connectionWrapperRef.current;

        if (chars.length === 0 || !wrapper) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (connectionAnimTlRef.current) {
          connectionAnimTlRef.current.kill();
        }

        // Reset elements to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.35 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(wrapper, { opacity: 0, scale: 0.35 });
            isSecurityTransitioningRef.current = false;
            lastSecurityScrollTimeRef.current = Date.now();
            wheelGestureActiveRef.current = true;
            if (wheelGestureEndTimerRef.current) clearTimeout(wheelGestureEndTimerRef.current);
            wheelGestureEndTimerRef.current = setTimeout(() => {
              wheelGestureActiveRef.current = false;
            }, 250);
          },
        });

        connectionAnimTlRef.current = tl;

        // 1. Brief settle so user reads "You control the connection" normally
        const tSettle = 0.35;

        // 2. The 10 letters of "connection" deconstruct and disperse gracefully
        const letterOffsets = [
          { x: -36, y: -18, rot: -10 },
          { x: -26, y: 16, rot: -6 },
          { x: -18, y: -22, rot: -4 },
          { x: -10, y: 14, rot: -2 },
          { x: -4, y: -16, rot: 3 },
          { x: 4, y: 18, rot: -3 },
          { x: 12, y: -14, rot: 4 },
          { x: 20, y: 20, rot: 6 },
          { x: 28, y: -18, rot: 8 },
          { x: 38, y: 16, rot: 12 },
        ];

        chars.forEach((char, i) => {
          const off = letterOffsets[i] || { x: 0, y: 0, rot: 0 };
          tl.to(
            char,
            {
              x: off.x,
              y: off.y,
              scale: 0.2,
              rotate: off.rot,
              opacity: 0,
              duration: 0.30,
              ease: "power2.in",
            },
            tSettle + i * 0.015
          );
        });

        // 3. The connection SVG animation blooms directly over the word "connection"
        const tSvgEnter = tSettle + 0.16;
        tl.to(
          wrapper,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: "back.out(1.8)",
          },
          tSvgEnter
        );

        // 4. Hold to let the animated connection SVG play its full loop
        const tHoldEnd = tSvgEnter + 2.15;

        // 5. Reverse transformation: connection SVG dissolves, letters spring back
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.40,
            duration: 0.26,
            ease: "power2.in",
          },
          tHoldEnd
        );

        // All 10 letters spring outward back into their exact typographical positions
        const tRestore = tHoldEnd + 0.08;
        chars.forEach((char, i) => {
          tl.to(
            char,
            {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.32,
              ease: "back.out(2.0)",
            },
            tRestore + i * 0.02
          );
        });
      };

      // -------------------------------------------------------------------------
      // INDIA TYPOGRAPHY TRANSFORMATION INTERACTION: "Stored in India"
      // Smoothly morphs the word "India" into a minimal line-outline map of India.
      // 1. Full line "Stored in India" appears normally and settles.
      // 2. The 5 letters (I-n-d-i-a) deconstruct and fly outward to cardinal regions:
      //    'I' -> North (Kashmir)
      //    'n' -> West (Gujarat)
      //    'd' -> South (Kanyakumari)
      //    'i' -> East (Bay of Bengal)
      //    'a' -> Northeast (Arunachal / Assam)
      // 3. The minimal green line outline of India draws and blooms smoothly into view.
      // 4. Hold the elegant outline map proudly for ~0.80s.
      // 5. Reverse transformation: map outline dissolves, letters spring back
      //    outward from their positions into the exact word "India".
      // 6. Scrolling unlocks once text is fully restored!
      // Plays every time the user enters this state.
      // -------------------------------------------------------------------------
      const playIndiaAnimation = () => {
        const chars = indiaCharRefs.current.filter(Boolean) as HTMLElement[];
        const wrapper = indiaMapWrapperRef.current;
        const path = indiaMapPathRef.current;

        if (chars.length === 0 || !wrapper) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (indiaAnimTlRef.current) {
          indiaAnimTlRef.current.kill();
        }

        // Reset elements to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.35 });
        if (path) {
          const pathLen = path.getTotalLength ? path.getTotalLength() : 800;
          gsap.set(path, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
        }

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(wrapper, { opacity: 0, scale: 0.35 });
            isSecurityTransitioningRef.current = false;
            lastSecurityScrollTimeRef.current = Date.now();
            wheelGestureActiveRef.current = true;
            if (wheelGestureEndTimerRef.current) clearTimeout(wheelGestureEndTimerRef.current);
            wheelGestureEndTimerRef.current = setTimeout(() => {
              wheelGestureActiveRef.current = false;
            }, 250);
          },
        });

        indiaAnimTlRef.current = tl;

        // 1. Brief settle so user reads "Stored in India" normally
        const tSettle = 0.35;

        // 2. The 5 letters deconstruct and fly outward to cardinal nodes of India (elevated to match map)
        if (chars[0]) {
          tl.to(chars[0], { x: 12, y: -72, scale: 0.2, rotate: -6, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle);
        }
        if (chars[1]) {
          tl.to(chars[1], { x: 8, y: -30, scale: 0.25, rotate: -4, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[2]) {
          tl.to(chars[2], { x: 32, y: 0, scale: 0.2, rotate: 2, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.03);
        }
        if (chars[3]) {
          tl.to(chars[3], { x: 56, y: -24, scale: 0.25, rotate: 8, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[4]) {
          tl.to(chars[4], { x: 64, y: -62, scale: 0.2, rotate: 12, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle);
        }

        // 3. The India map outline wrapper appears centered over "India"
        const tMapEnter = tSettle + 0.12;
        tl.to(
          wrapper,
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: "power2.out",
          },
          tMapEnter
        );

        // 4. Form the India perimeter outline at a deliberate, observable pace
        // Traces clockwise from Kashmir across Himalayas, East coast, Kanyakumari, West coast, back to Kashmir
        if (path) {
          tl.to(
            path,
            {
              strokeDashoffset: 0,
              duration: 1.05,
              ease: "power1.inOut",
            },
            tMapEnter + 0.02
          );
        }

        // 5. Hold the completed elegant outline
        const tHoldEnd = tMapEnter + 0.02 + 1.05 + 0.65;

        // 6. Reverse transformation: outline dissolves, letters reconstruct back
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.40,
            duration: 0.26,
            ease: "power2.in",
          },
          tHoldEnd
        );

        // All 5 letters spring outward back into their exact typographical positions
        const tRestore = tHoldEnd + 0.08;
        chars.forEach((char, i) => {
          tl.to(
            char,
            {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.32,
              ease: "back.out(2.0)",
            },
            tRestore + i * 0.025
          );
        });
      };

      // -------------------------------------------------------------------------
      // SELL TYPOGRAPHY TRANSFORMATION INTERACTION: "We don't sell your data"
      // Recreates the exact motion language and animation style from sell.mp4:
      // 1. Text settles briefly so user reads "We don't sell your data" normally.
      // 2. The word "sell" detaches from the hero line and floats upward.
      // 3. At this elevated position (a little upward from the hero line), it pops up
      //    into the 3D Security Shield Badge.
      // 4. Performs the 3D perspective swivel (tilt right, smooth glide left, return center).
      // 5. Holds proud defense shield posture.
      // 6. Shield contracts and descends, with the word "sell" descending back
      //    into its exact original position on the hero baseline.
      // 7. Scrolling unlocks once text is fully restored!
      // -------------------------------------------------------------------------
      const playSellAnimation = () => {
        const chars = sellCharRefs.current.filter(Boolean) as HTMLElement[];
        const wrapper = sellShieldWrapperRef.current;
        const icon = sellShieldIconRef.current;

        if (chars.length === 0 || !wrapper) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (sellAnimTlRef.current) {
          sellAnimTlRef.current.kill();
        }

        // Responsive upward detachment offset (floats comfortably above the hero line)
        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
        const targetUpY = isDesk ? -62 : isSmall ? -46 : -56;

        // Reset elements to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.35, y: 0, x: 0 });
        if (icon) gsap.set(icon, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(wrapper, { opacity: 0, scale: 0.35, y: 0, x: 0 });
            if (icon) gsap.set(icon, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });
            isSecurityTransitioningRef.current = false;
            lastSecurityScrollTimeRef.current = Date.now();
            wheelGestureActiveRef.current = true;
            if (wheelGestureEndTimerRef.current) clearTimeout(wheelGestureEndTimerRef.current);
            wheelGestureEndTimerRef.current = setTimeout(() => {
              wheelGestureActiveRef.current = false;
            }, 250);
          },
        });

        sellAnimTlRef.current = tl;

        // 1. Brief settle so user reads "We don't sell your data" normally
        const tSettle = 0.35;

        // 2. The word "sell" detaches from the hero line and floats upward together
        chars.forEach((char, i) => {
          tl.to(
            char,
            {
              y: targetUpY,
              x: (i - 1.5) * 5,
              scale: 0.85,
              opacity: 0,
              duration: 0.36,
              ease: "power2.out",
            },
            tSettle + i * 0.015
          );
        });

        // 3. Shield Badge pops open directly at the elevated upward position as "sell" arrives
        const tShieldEnter = tSettle + 0.16;
        tl.fromTo(
          wrapper,
          {
            opacity: 0,
            scale: 0.35,
            y: targetUpY + 18,
          },
          {
            opacity: 1,
            scale: 1,
            y: targetUpY,
            duration: 0.40,
            ease: "back.out(1.8)",
          },
          tShieldEnter
        );

        // 4. Exact 3D motion language from sell.mp4 at the elevated upward position:
        // - Tilt right (Frames 10-18: rotateY: 18, rotateZ: 2)
        // - Smooth glide to left (Frames 20-36: rotateY: -18, rotateZ: -2)
        // - Return to center (Frames 36-52: rotateY: 0, rotateZ: 0)
        const tSwivel = tShieldEnter + 0.28;
        if (icon) {
          tl.to(
            icon,
            {
              rotateY: 18,
              rotateZ: 2,
              x: 3,
              y: -3,
              duration: 0.40,
              ease: "power1.inOut",
            },
            tSwivel
          );
          tl.to(
            icon,
            {
              rotateY: -18,
              rotateZ: -2,
              x: -3,
              y: 2,
              duration: 0.54,
              ease: "power1.inOut",
            },
            tSwivel + 0.40
          );
          tl.to(
            icon,
            {
              rotateY: 0,
              rotateZ: 0,
              x: 0,
              y: 0,
              duration: 0.42,
              ease: "power2.out",
            },
            tSwivel + 0.94
          );
        }

        // 5. Proud hold of the defense shield
        const tHoldEnd = tSwivel + 1.36 + 0.45;

        // 6. Shield contracts & begins descending back toward the hero line
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.35,
            y: targetUpY + 28,
            duration: 0.28,
            ease: "power2.in",
          },
          tHoldEnd
        );

        // 7. The word "sell" descends from above and snaps right back into its original position on the hero line
        const tRestore = tHoldEnd + 0.10;
        chars.forEach((char, i) => {
          tl.fromTo(
            char,
            {
              y: targetUpY + 22,
              x: (i - 1.5) * 4,
              scale: 0.65,
              opacity: 0,
              rotate: (i - 1.5) * 3,
            },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.38,
              ease: "back.out(2.0)",
            },
            tRestore + i * 0.02
          );
        });
      };

      interface RingSlot {
        x: number;
        y: number;
        z: number;
        rotX: number;
        rotY: number;
        rotZ: number;
        scale: number;
        zIndex: number;
      }

      const computeRingSlots = (): RingSlot[] => {
        const TOTAL_RING_CARDS = 26;
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;

        const ringRadius = Math.min(Math.max(vh * 0.22, 160), 220);
        const finalCardScale = isDesktop ? 0.52 : isTablet ? 0.48 : 0.44;
        const START_ALPHA = 225; // Top-Left (Card 01)
        const ANGLE_STEP = 360.0 / TOTAL_RING_CARDS;

        const slots: RingSlot[] = [];
        for (let k = 0; k < TOTAL_RING_CARDS; k++) {
          const alphaDeg = (START_ALPHA - k * ANGLE_STEP) % 360;
          const rad = (alphaDeg * Math.PI) / 180;
          const x = ringRadius * Math.cos(rad);
          const y = ringRadius * Math.sin(rad);
          const z = 55 * Math.sin(((alphaDeg - 45) * Math.PI) / 180);
          const tangentDeg = (Math.atan2(-Math.cos(rad), Math.sin(rad)) * 180) / Math.PI;

          slots.push({
            x,
            y,
            z,
            rotX: 18,
            rotY: 20,
            rotZ: tangentDeg,
            scale: finalCardScale,
            zIndex: 100 - k,
          });
        }
        return slots;
      };

      const computeEnvelopeParams = () => {
        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
        const envScale = isDesk ? 0.72 : isTab ? 0.60 : 0.50;

        // Dynamic organic scatter slots of all 26 cards as they hit the About surface:
        // Realistic physical dispersal, rotational offsets (-16deg to +16deg), 3D pitch/yaw, and depth
        const scatterSlots = [
          { x: -160, y: -45, z: 8,  rotZ: -14, rotX: -4, rotY: 6,   scale: envScale * 0.95 },
          { x: 145,  y: 35,  z: 12, rotZ: 12,  rotX: 5,  rotY: -7,  scale: envScale * 0.96 },
          { x: -75,  y: 65,  z: 16, rotZ: -8,  rotX: 3,  rotY: 4,   scale: envScale * 0.98 },
          { x: 95,   y: -55, z: 10, rotZ: 15,  rotX: -5, rotY: -5,  scale: envScale * 0.95 },
          { x: -190, y: 20,  z: 6,  rotZ: -12, rotX: 2,  rotY: 8,   scale: envScale * 0.92 },
          { x: 180,  y: -25, z: 14, rotZ: 10,  rotX: -3, rotY: -8,  scale: envScale * 0.93 },
          { x: -40,  y: -75, z: 18, rotZ: 7,   rotX: -6, rotY: 3,   scale: envScale * 0.97 },
          { x: 50,   y: 80,  z: 15, rotZ: -11, rotX: 6,  rotY: -4,  scale: envScale * 0.96 },
          { x: -125, y: -80, z: 9,  rotZ: -16, rotX: -4, rotY: 7,   scale: envScale * 0.94 },
          { x: 130,  y: 85,  z: 11, rotZ: 13,  rotX: 4,  rotY: -6,  scale: envScale * 0.95 },
          { x: -105, y: 35,  z: 17, rotZ: -6,  rotX: 2,  rotY: 5,   scale: envScale * 0.98 },
          { x: 110,  y: -30, z: 13, rotZ: 9,   rotX: -3, rotY: -5,  scale: envScale * 0.96 },
          { x: -15,  y: 45,  z: 22, rotZ: 5,   rotX: 4,  rotY: 2,   scale: envScale * 1.00 },
          { x: 25,   y: -40, z: 20, rotZ: -7,  rotX: -4, rotY: -3,  scale: envScale * 0.99 },
          { x: -215, y: -20, z: 5,  rotZ: -15, rotX: -2, rotY: 9,   scale: envScale * 0.91 },
          { x: 210,  y: 30,  z: 7,  rotZ: 16,  rotX: 3,  rotY: -9,  scale: envScale * 0.91 },
          { x: -65,  y: -40, z: 19, rotZ: 8,   rotX: -3, rotY: 4,   scale: envScale * 0.98 },
          { x: 75,   y: 45,  z: 16, rotZ: -9,  rotX: 4,  rotY: -4,  scale: envScale * 0.97 },
          { x: -145, y: 70,  z: 8,  rotZ: 11,  rotX: 5,  rotY: 6,   scale: envScale * 0.93 },
          { x: 155,  y: -70, z: 10, rotZ: -13, rotX: -5, rotY: -7,  scale: envScale * 0.93 },
          { x: -30,  y: 90,  z: 21, rotZ: -5,  rotX: 6,  rotY: 2,   scale: envScale * 0.99 },
          { x: 35,   y: -85, z: 19, rotZ: 6,   rotX: -6, rotY: -2,  scale: envScale * 0.99 },
          { x: -85,  y: 10,  z: 23, rotZ: 4,   rotX: 1,  rotY: 3,   scale: envScale * 1.01 },
          { x: 80,   y: -10, z: 24, rotZ: -4,  rotX: -1, rotY: -3,  scale: envScale * 1.01 },
          { x: -10,  y: -15, z: 26, rotZ: 2,   rotX: -2, rotY: 1,   scale: envScale * 1.02 },
          { x: 10,   y: 15,  z: 27, rotZ: -2,  rotX: 2,  rotY: -1,  scale: envScale * 1.02 },
        ];

        return {
          isDesk,
          isTab,
          envScale,
          scatterSlots,
        };
      };

      const flipDocToPage = (targetPage: 1 | 2) => {
        if (isFlippingDocRef.current) return;
        if (!docFlipperRef.current) return;
        if (aboutDocPageRef.current === targetPage) return;

        isFlippingDocRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();

        const flipper = docFlipperRef.current;
        const docContainer = philosophyDocRef.current;

        const isForward = targetPage === 2;
        const targetRotY = isForward ? -180 : 0;
        const startRotY = isForward ? 0 : -180;

        // Single continuous gesture: realistic 3D paper page turn
        const flipTl = gsap.timeline({
          onComplete: () => {
            aboutDocPageRef.current = targetPage;
            isFlippingDocRef.current = false;
          },
        });

        // 1. Smooth 3D page turn around vertical axis
        flipTl.fromTo(
          flipper,
          { rotateY: startRotY },
          {
            rotateY: targetRotY,
            duration: 0.95,
            ease: "power2.inOut",
            force3D: true,
          },
          0
        );

        // 2. Physical 3D paper lift & momentum (z-lift during mid-flip)
        flipTl.to(
          flipper,
          {
            z: 75,
            duration: 0.45,
            ease: "power2.out",
          },
          0
        );
        flipTl.to(
          flipper,
          {
            z: 0,
            duration: 0.50,
            ease: "power2.in",
          },
          0.45
        );

        // 3. Subtle aerodynamic paper curl & momentum along the edge
        if (docContainer) {
          const baseRotZ = -2.8;
          const peakRotZ = isForward ? -5.4 : -0.6;
          flipTl.to(
            docContainer,
            {
              rotateZ: peakRotZ,
              duration: 0.45,
              ease: "sine.out",
            },
            0
          );
          flipTl.to(
            docContainer,
            {
              rotateZ: baseRotZ,
              duration: 0.50,
              ease: "sine.inOut",
            },
            0.45
          );
        }
      };

      const exitAboutToFaq = () => {
        if (isSecurityTransitioningRef.current) return;
        isSecurityTransitioningRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();

        if (aboutOrbitTweenRef.current) {
          aboutOrbitTweenRef.current.kill();
          aboutOrbitTweenRef.current = null;
        }

        gsap.to([cardsClusterRef.current, aboutContentRef.current], {
          y: -window.innerHeight * 0.45,
          opacity: 0,
          duration: 0.38,
          ease: "power2.in",
          onComplete: () => {
            stateRef.current = "faq";
            lockScrollYRef.current = -1;
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.documentElement.style.removeProperty("overflow");
            document.body.style.removeProperty("overflow");

            if (stageRef.current) {
              stageRef.current.style.position = "";
              stageRef.current.style.top = "";
              stageRef.current.style.left = "";
              stageRef.current.style.width = "";
              stageRef.current.style.height = "";
              stageRef.current.style.zIndex = "";
            }
            isSecurityTransitioningRef.current = false;

            requestAnimationFrame(() => {
              const faqEl = document.getElementById("faq");
              if (faqEl) {
                smoothScrollTo(faqEl, { duration: 0.58, ease: "power2.out" });
              }
              dispatchActiveSection("faq");
            });
          },
        });
      };

      const jumpToAboutState = (targetPage: 1 | 2 = 1) => {
        if (stateRef.current === "about") return;
        if (stateRef.current === "ring") {
          consolidateRingToStack();
          return;
        }

        isSecurityTransitioningRef.current = true;
        stateRef.current = "about";
        setIsAperturePaused(true);
        productCompleteRef.current = true;

        gsap.killTweensOf(window);
        lockScrollYRef.current = 0;
        window.scrollTo(0, 0);

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        if (stageRef.current) {
          stageRef.current.style.position = "fixed";
          stageRef.current.style.top = "0px";
          stageRef.current.style.left = "0px";
          stageRef.current.style.width = "100%";
          stageRef.current.style.height = "100vh";
          stageRef.current.style.zIndex = "40";
          gsap.set(stageRef.current, { scale: 1, scaleX: 1, scaleY: 1, x: 0, y: 0 });
        }

        if (irisPortalRef.current) gsap.set(irisPortalRef.current, { opacity: 1, clipPath: "circle(150% at 50% 50%)" });
        if (headerRef.current) gsap.set(headerRef.current, { opacity: 0 });
        if (securityStageRef.current) gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden" });
        securityStateRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, visibility: "hidden" });
        });

        if (productWorldRef.current) {
          gsap.set(productWorldRef.current, {
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            xPercent: 0,
            yPercent: 0,
            x: 0,
            y: 0,
            opacity: 1,
            visibility: "visible",
          });
        }

        if (cardsStageRef.current) {
          gsap.set(cardsStageRef.current, {
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
            perspective: "1400px",
          });
        }

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];

        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
        const vhVal = typeof window !== "undefined" ? window.innerHeight : 900;
        const stackCardScale = isDesk ? 0.60 : isTab ? 0.56 : 0.52;
        const targetEnvelopeY = isDesk
          ? Math.round(Math.max(255, Math.min(290, vhVal * 0.29)))
          : isTab
          ? Math.round(Math.max(210, Math.min(245, vhVal * 0.25)))
          : Math.round(Math.max(175, Math.min(205, vhVal * 0.21)));

        // Hide all 26 individual cards — morph into single physical envelope is complete
        allCards.forEach((cardEl) => {
          if (cardEl) gsap.set(cardEl, { opacity: 0, visibility: "hidden" });
        });

        // Show single physical envelope centered in viewport with flap open and emerged document
        if (unifiedEnvelopeRef.current) {
          gsap.set(unifiedEnvelopeRef.current, {
            opacity: 1,
            visibility: "visible",
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
          });
        }

        if (envelopeTopFlapRef.current) {
          gsap.set(envelopeTopFlapRef.current, { rotateX: -175, zIndex: 0, opacity: 0 });
        }

        if (envelopeSealRef.current) {
          gsap.set(envelopeSealRef.current, { opacity: 0, visibility: "hidden" });
        }

        if (docCavityWrapperRef.current) {
          gsap.set(docCavityWrapperRef.current, { zIndex: 35, clipPath: "none", WebkitClipPath: "none" });
        }
        if (philosophyDocRef.current) {
          gsap.set(philosophyDocRef.current, {
            opacity: 1,
            visibility: "visible",
            y: -375,
            rotateZ: -2.8,
            rotateX: 2.0,
            rotateY: 2.2,
            z: 55,
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            transformOrigin: "50% 0%",
          });
        }

        if (docPaperSheetRef.current) {
          gsap.set(docPaperSheetRef.current, { height: 930, scale: 1, scaleX: 1, scaleY: 1 });
        }

        if (docInkCopyRef.current) {
          gsap.set(docInkCopyRef.current, {
            clipPath: "inset(0 0 0% 0)",
            WebkitClipPath: "inset(0 0 0% 0)",
            opacity: 1,
            visibility: "visible",
            filter: "none",
          });
        }

        aboutDocPageRef.current = targetPage;
        isFlippingDocRef.current = false;
        if (docFlipperRef.current) {
          gsap.set(docFlipperRef.current, { rotateY: targetPage === 2 ? -180 : 0, z: 0 });
        }

        if (cardsClusterRef.current) {
          gsap.fromTo(
            cardsClusterRef.current,
            {
              x: 0,
              y: -window.innerHeight * 0.45,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: stackCardScale,
              scaleX: stackCardScale,
              scaleY: stackCardScale,
              opacity: 0,
            },
            {
              x: 0,
              y: targetEnvelopeY + 140,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: stackCardScale,
              scaleX: stackCardScale,
              scaleY: stackCardScale,
              opacity: 1,
              duration: 0.55,
              ease: "power2.out",
            }
          );
        }

        isRingConsolidatedRef.current = true;

        if (aboutContentRef.current) {
          gsap.fromTo(
            aboutContentRef.current,
            { opacity: 0, y: -40, scale: 1, scaleX: 1, scaleY: 1 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              scaleX: 1,
              scaleY: 1,
              visibility: "visible",
              duration: 0.55,
              ease: "power2.out",
              onComplete: () => {
                isSecurityTransitioningRef.current = false;
                dispatchActiveSection("about");
              },
            }
          );
        } else {
          isSecurityTransitioningRef.current = false;
          dispatchActiveSection("about");
        }
      };

      const consolidateRingToStack = () => {
        if (!cardsClusterRef.current) return;
        if (isSecurityTransitioningRef.current) return;
        if (isRingConsolidatedRef.current) return;

        const clusterEl = cardsClusterRef.current;
        isSecurityTransitioningRef.current = true;

        if (consolidationTlRef.current) {
          consolidationTlRef.current.kill();
          consolidationTlRef.current = null;
        }

        // 1. Capture current ambient rotation angle and pause ambient tween
        const currentRot = Number(gsap.getProperty(clusterEl, "rotateZ")) || 0;
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }

        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const vhVal = typeof window !== "undefined" ? window.innerHeight : 900;
        const stackCardScale = isDesktop ? 0.60 : isTablet ? 0.56 : 0.52;
        const targetEnvelopeY = isDesktop
          ? Math.round(Math.max(255, Math.min(290, vhVal * 0.29)))
          : isTablet
          ? Math.round(Math.max(210, Math.min(245, vhVal * 0.25)))
          : Math.round(Math.max(175, Math.min(205, vhVal * 0.21)));

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];
        const ringSlots = computeRingSlots();

        // Target: cards consolidate into tight horizontal stack matching reference attachment
        const frontX = 35;

        const vwVal = typeof window !== "undefined" ? window.innerWidth : 1440;
        // Clamped so the consolidation shift stays proportioned to the reference desktop
        // width instead of pushing the stack further from center on very wide monitors.
        const vCenterX = Math.min(vwVal, DESKTOP_REFERENCE_WIDTH) / 2;
        const shiftX = isDesktop
          ? Math.round(vCenterX * 0.42)
          : isTablet
          ? Math.round(vCenterX * 0.30)
          : Math.round(vCenterX * 0.16);

        // Ensure security stage and closing line (State 7) are active and measurable behind cards (zIndex: 20 < 30)
        if (securityStageRef.current) {
          gsap.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 20 });
        }
        if (securityStateRefs.current[7]) {
          gsap.set(securityStateRefs.current[7], { autoAlpha: 1, opacity: 1, visibility: "visible", x: shiftX, y: 0 });
        }
        if (closingBlackTextRef.current) {
          closingBlackTextRef.current.style.clipPath = "none";
          (closingBlackTextRef.current.style as any).webkitClipPath = "none";
          closingBlackTextRef.current.style.opacity = "1";
          closingBlackTextRef.current.style.visibility = "visible";
        }
        if (closingGreenTextRef.current) {
          closingGreenTextRef.current.style.clipPath = "none";
          (closingGreenTextRef.current.style as any).webkitClipPath = "none";
          closingGreenTextRef.current.style.opacity = "1";
          closingGreenTextRef.current.style.visibility = "visible";
        }
        closingBlackWordRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0 });
        });
        closingGreenWordRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0 });
        });

        // Measure live bounding rects to anchor trajectory dynamically
        const blackRect = closingBlackTextRef.current?.getBoundingClientRect();
        const greenRect = closingGreenTextRef.current?.getBoundingClientRect();
        const clusterRect = clusterEl.getBoundingClientRect();
        const clusterCenterX = clusterRect.left + clusterRect.width / 2;
        const clusterCenterY = clusterRect.top + clusterRect.height / 2;

        const curX = (gsap.getProperty(clusterEl, "x") as number) || 0;
        const curY = (gsap.getProperty(clusterEl, "y") as number) || 0;

        const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
        const vh = typeof window !== "undefined" ? window.innerHeight : 900;
        const bLeft = blackRect?.left ?? vw * 0.28;
        const bRight = blackRect?.right ?? vw * 0.82;
        const bTop = blackRect?.top ?? vh * 0.38;
        const bBottom = blackRect?.bottom ?? bTop + 54;
        const bCenterY = (bTop + bBottom) / 2;

        const gLeft = greenRect?.left ?? bLeft;
        const gRight = greenRect?.right ?? vw * 0.80;
        const gTop = greenRect?.top ?? bBottom + 8;
        const gBottom = greenRect?.bottom ?? gTop + 54;
        const gCenterY = (gTop + gBottom) / 2;

        // Continuous trajectory coordinates:
        // Waypoint 1: Stack passes right edge of black statement (moving left -> right)
        const px1 = bRight + 65;
        const py1 = bCenterY;
        const dx1 = curX + (px1 - clusterCenterX);
        const dy1 = curY + (py1 - clusterCenterY);

        // Waypoint 2: Curved turn apex around right perimeter between both lines
        const px2 = Math.max(bRight, gRight) + 85;
        const py2 = (bCenterY + gCenterY) / 2;
        const dx2 = curX + (px2 - clusterCenterX);
        const dy2 = curY + (py2 - clusterCenterY);

        // Waypoint 3: End of green return sweep past left edge of green statement (moving right -> left)
        const px3 = gLeft - 45;
        const py3 = gCenterY;
        const dx3 = curX + (px3 - clusterCenterX);
        const dy3 = curY + (py3 - clusterCenterY);

        // Waypoint 4A: Overshoot past final text with horizontal momentum & subtle anticipation lift
        const pxOvershoot = gLeft - 105;
        const pyOvershoot = gCenterY - 5;
        const dxOvershoot = curX + (pxOvershoot - clusterCenterX);
        const dyOvershoot = curY + (pyOvershoot - clusterCenterY);

        // Waypoint 4B: Fluid downward arc curving naturally into the descent
        const pxArc = gLeft - 75;
        const pyArc = gBottom + 115;
        const dxArc = curX + (pxArc - clusterCenterX);
        const dyArc = curY + (pyArc - clusterCenterY);

        const { isDesk, envScale, scatterSlots } =
          computeEnvelopeParams();

        const exitHandoffTime = 2.45;
        const exitDelta = exitHandoffTime - 0.96;

        const tl = gsap.timeline({
          onUpdate: () => {
            const time = tl.time();
            // During consolidation (< exitHandoffTime), both statement lines remain 100% visible and untouched
            if (time < exitHandoffTime) {
              if (closingBlackTextRef.current) {
                closingBlackTextRef.current.style.clipPath = "none";
                (closingBlackTextRef.current.style as any).webkitClipPath = "none";
              }
              if (closingGreenTextRef.current) {
                closingGreenTextRef.current.style.clipPath = "none";
                (closingGreenTextRef.current.style as any).webkitClipPath = "none";
              }
              return;
            }

            // 1. Compute physical bounds of solid cards in the stack
            let maxCardRight = -Infinity;
            let minCardLeft = Infinity;
            allProductCards.forEach((c) => {
              if (!c) return;
              const r = c.getBoundingClientRect();
              if (r.right > maxCardRight) maxCardRight = r.right;
              if (r.left < minCardLeft) minCardLeft = r.left;
            });
            if (!isFinite(maxCardRight) || !isFinite(minCardLeft)) {
              const cR = clusterEl.getBoundingClientRect();
              maxCardRight = cR.left + cR.width * 0.72;
              minCardLeft = cR.left + cR.width * 0.28;
            }

            // Eraser cut lines: 24px inside the leading edge under the solid body of cards
            const wipeRightX = maxCardRight - 24;
            const wipeLeftX = minCardLeft + 24;

            // 2. Spatial erasure of Black Line (swept Left -> Right)
            if (closingBlackTextRef.current) {
              const bCurRect = closingBlackTextRef.current.getBoundingClientRect();
              const bWidth = bCurRect.width || 1;
              if (time >= 1.50 + exitDelta || (bCurRect.width > 0 && wipeRightX >= bCurRect.right)) {
                closingBlackTextRef.current.style.clipPath = "inset(0 0 0 100%)";
                (closingBlackTextRef.current.style as any).webkitClipPath = "inset(0 0 0 100%)";
              } else {
                const bProgress = Math.max(0, Math.min(bWidth, wipeRightX - bCurRect.left));
                closingBlackTextRef.current.style.clipPath = `inset(0 0 0 ${bProgress}px)`;
                (closingBlackTextRef.current.style as any).webkitClipPath = `inset(0 0 0 ${bProgress}px)`;
              }
            }

            // 3. Spatial erasure of Green Line (swept Right -> Left return)
            if (closingGreenTextRef.current) {
              const gCurRect = closingGreenTextRef.current.getBoundingClientRect();
              const gWidth = gCurRect.width || 1;
              if (time < 1.76 + exitDelta) {
                closingGreenTextRef.current.style.clipPath = "none";
                (closingGreenTextRef.current.style as any).webkitClipPath = "none";
              } else if (time >= 2.32 + exitDelta || (gCurRect.width > 0 && wipeLeftX <= gCurRect.left)) {
                closingGreenTextRef.current.style.clipPath = "inset(0 100% 0 0)";
                (closingGreenTextRef.current.style as any).webkitClipPath = "inset(0 100% 0 0)";
              } else {
                const gRightClip = Math.max(0, Math.min(gWidth, gCurRect.right - wipeLeftX));
                closingGreenTextRef.current.style.clipPath = `inset(0 ${gRightClip}px 0 0)`;
                (closingGreenTextRef.current.style as any).webkitClipPath = `inset(0 ${gRightClip}px 0 0)`;
              }
            }
          },
          onComplete: () => {
            isRingConsolidatedRef.current = true;
            isSecurityTransitioningRef.current = false;
            stateRef.current = "about";
            aboutDocPageRef.current = 1;
            isFlippingDocRef.current = false;

            if (securityStageRef.current) {
              gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden" });
            }
            if (securityStateRefs.current[7]) {
              gsap.set(securityStateRefs.current[7], { opacity: 0, visibility: "hidden" });
            }

            // Update Navbar
            dispatchActiveSection("about");

            if (onConsolidateCompletedRef.current) {
              const cb = onConsolidateCompletedRef.current;
              onConsolidateCompletedRef.current = null;
              cb();
            }
          },
          onReverseComplete: () => {
            isSecurityTransitioningRef.current = false;
            isRingConsolidatedRef.current = false;
            stateRef.current = "ring";
            aboutDocPageRef.current = 1;
            isFlippingDocRef.current = false;
            if (docFlipperRef.current) gsap.set(docFlipperRef.current, { rotateY: 0, z: 0 });

            if (unifiedEnvelopeRef.current) {
              gsap.set(unifiedEnvelopeRef.current, { opacity: 0, visibility: "hidden" });
            }
            if (envelopeTopFlapRef.current) {
              gsap.set(envelopeTopFlapRef.current, { rotateX: 0, zIndex: 30, opacity: 1 });
            }
            if (envelopeSealRef.current) {
              gsap.set(envelopeSealRef.current, { opacity: 1, scale: 1 });
            }
            if (docCavityWrapperRef.current) {
              gsap.set(docCavityWrapperRef.current, {
                zIndex: 10,
                clipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
                WebkitClipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
              });
            }
            if (philosophyDocRef.current) {
              gsap.set(philosophyDocRef.current, { opacity: 1, visibility: "visible", y: 220, rotateX: 0, rotateY: 0, rotateZ: 0, z: 0, scale: 1 });
            }
            if (docPaperSheetRef.current) {
              gsap.set(docPaperSheetRef.current, { height: 320 });
            }
            if (docInkCopyRef.current) {
              gsap.set(docInkCopyRef.current, {
                clipPath: "inset(0 0 100% 0)",
                WebkitClipPath: "inset(0 0 100% 0)",
                opacity: 0,
                visibility: "hidden",
                filter: "contrast(1.25) brightness(0.85)",
              });
            }

            allCards.forEach((cardEl) => {
              if (cardEl) {
                gsap.set(cardEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
              }
            });

            if (safeContainerRef.current) {
              gsap.set(safeContainerRef.current, {
                opacity: 1,
                autoAlpha: 1,
                visibility: "visible",
                scale: 1,
              });
            }
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.setCardsProgress?.(0);

            if (aboutContentRef.current) {
              gsap.set(aboutContentRef.current, { opacity: 0, visibility: "hidden" });
            }

            if (closingBlackTextRef.current) {
              closingBlackTextRef.current.style.clipPath = "none";
              (closingBlackTextRef.current.style as any).webkitClipPath = "none";
            }
            if (closingGreenTextRef.current) {
              closingGreenTextRef.current.style.clipPath = "none";
              (closingGreenTextRef.current.style as any).webkitClipPath = "none";
            }
            if (securityStateRefs.current[7]) {
              gsap.set(securityStateRefs.current[7], {
                autoAlpha: 1,
                opacity: 1,
                visibility: "visible",
                x: shiftX,
                y: 0,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
              });
            }

            // Kill obsolete ring rotation tween
            if (ringRotateTweenRef.current) {
              ringRotateTweenRef.current.kill();
              ringRotateTweenRef.current = null;
            }

            if (clusterEl) {
              gsap.set(clusterEl, {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
                scaleX: 1,
                scaleY: 1,
              });
            }

            dispatchActiveSection("security");
          },
        });
        consolidationTlRef.current = tl;

        // Initialize About cinematic atmosphere to hidden at time 0
        if (aboutContentRef.current) {
          tl.set(aboutContentRef.current, { visibility: "hidden", opacity: 0 }, 0);
        }

        // Restore Security closing text visibility behind cards (zIndex: 20 < 30)
        // Cards stage is at zIndex: 30, so cards travel directly over the text and wipe it away.
        if (securityStageRef.current) {
          tl.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 20 }, 0);
        }
        securityStateRefs.current.forEach((el, idx) => {
          if (el && idx !== 7) tl.set(el, { opacity: 0, visibility: "hidden" }, 0);
        });
        if (securityStateRefs.current[7]) {
          tl.set(
            securityStateRefs.current[7],
            {
              autoAlpha: 1,
              opacity: 1,
              visibility: "visible",
              x: shiftX,
              y: 0,
            },
            0
          );
        }
        if (closingBlackTextRef.current) {
          tl.set(closingBlackTextRef.current, { opacity: 1, visibility: "visible", clipPath: "none" }, 0);
        }
        if (closingGreenTextRef.current) {
          tl.set(closingGreenTextRef.current, { opacity: 1, visibility: "visible", clipPath: "none" }, 0);
        }

        // -------------------------------------------------------------------------
        // VAULT EXIT SEQUENCE:
        // 1. VAULT OPENS:
        //    Open the vault using existing door animation (0.00s -> 0.42s).
        // 2. CARDS EXIT:
        //    3D cards emerge from deep inside the chamber (0.38s -> 0.68s).
        //    DOM cards cross-dissolve at the mouth, emerge past the front rim,
        //    scale up and reverse back to the consolidated stack position (0.48s -> 0.94s).
        // 3. VAULT DISAPPEARS:
        //    Smoothly fades out and disappears before cards begin their S-curve sweep (0.68s -> 0.94s).
        // 4. CONTINUOUS HANDOFF (0.96s):
        //    Cards seamlessly continue with their existing trajectory across closing text into About!
        // -------------------------------------------------------------------------
        const cardsToSafeDeltaX = cardsToSafeDeltaXRef.current || (targetLeftXRef.current ? targetLeftXRef.current - (stackTargetXRef.current || 0) : -180);
        const cardsToSafeDeltaY = cardsToSafeDeltaYRef.current || (targetRingYRef.current ? targetRingYRef.current - (stackTargetYRef.current || 0) : 18);

        // Pre-position cluster upright and neutral
        tl.set(clusterEl, { rotateZ: 0, rotateX: 0, rotateY: 0, scale: 1.0 }, 0);

        // Pre-position product cards at the vault mouth (matching entry state)
        allProductCards.forEach((wrapper, i) => {
          const rank = STACK_RANK_MAP[i] ?? i;
          const origX = origCentersRef.current[i]?.x ?? 0;
          const origY = origCentersRef.current[i]?.y ?? 0;
          const destX = frontX - rank * 2.8;
          const destY = 0;
          const destZ = -rank * 2.2;

          const paper = cardFrontRefs.current[i];
          const ink = cardInkRefs.current[i];

          // Pre-position lead cards as ink lines deep inside vault chamber directly at aperture center
          tl.set(
            wrapper,
            {
              x: (destX - origX) + cardsToSafeDeltaX,
              y: (destY - origY) + cardsToSafeDeltaY,
              z: -160,
              scale: 0.12,
              rotateX: 12,
              rotateY: -10,
              rotateZ: -8,
              opacity: 1,
              autoAlpha: 1,
              visibility: "visible",
              zIndex: 100 - rank,
            },
            0
          );
          if (paper) tl.set(paper, { opacity: 0 }, 0);
          if (ink) tl.set(ink, { opacity: 1, visibility: "visible" }, 0);
        });

        // Ensure companion duplicate cards remain hidden (only ONE stack of cards exits the vault)
        allCompanionCards.forEach((compEl) => {
          tl.set(compEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" }, 0);
        });

        // Ensure safe container is visible & positioned on the left at start of exit
        if (safeContainerRef.current) {
          tl.set(
            safeContainerRef.current,
            {
              opacity: 1,
              autoAlpha: 1,
              visibility: "visible",
              scale: 1.0,
            },
            0
          );
        }

        safeVault3DRef.current?.setCardsProgress?.(0);

        // STEP 1: VAULT OPENS (0.00s -> 0.44s)
        // Door opens to reveal the open sketch chamber
        const safeOpenProxy = { p: 0 };
        tl.fromTo(
          safeOpenProxy,
          { p: 0 },
          {
            p: 1.0,
            duration: 0.44,
            ease: "power2.inOut",
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(safeOpenProxy.p);
            },
          },
          0
        );

        // STEP 2A: "INK" SINGLE CARD STACK EMERGES STRAIGHT FORWARD THROUGH OPENING (0.32s -> 0.86s)
        // Moves along +Z from inside chamber (-160) straight forward into the foreground (+55),
        // unmistakably crossing the vault's front plane and rendering IN FRONT OF the vault!
        const cardExitStart = 0.32;
        const cardEmergeDuration = 0.54;

        allProductCards.forEach((wrapper, i) => {
          const rank = STACK_RANK_MAP[i] ?? i;
          const origX = origCentersRef.current[i]?.x ?? 0;
          const origY = origCentersRef.current[i]?.y ?? 0;
          const destX = frontX - rank * 2.8;
          const destY = 0;
          const destZ = -rank * 2.2;
          const paper = cardFrontRefs.current[i];
          const ink = cardInkRefs.current[i];
          const exitStart = cardExitStart + rank * 0.02;

          // 1. Emerge straight through opening into positive Z foreground (+55) in front of vault
          tl.to(
            wrapper,
            {
              x: (destX - origX) + cardsToSafeDeltaX,
              y: (destY - origY) + cardsToSafeDeltaY,
              z: 55 - rank * 2.5,
              scale: stackCardScale,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              opacity: 1,
              autoAlpha: 1,
              duration: cardEmergeDuration,
              ease: "power2.out",
              force3D: true,
            },
            exitStart
          );

          // 2. Ink -> Paper progressive morph: in the foreground in front of the vault
          const morphStart = 0.88 + rank * 0.015;
          if (paper && ink) {
            tl.to(
              paper,
              {
                opacity: 0.55,
                duration: 0.40,
                ease: "power1.inOut",
              },
              morphStart
            );
            // Substep B: Paper solidifies into opaque card, ink dissolves into card surface
            tl.to(
              paper,
              {
                opacity: 1.0,
                duration: 0.42,
                ease: "power1.out",
              },
              morphStart + 0.36
            );
            tl.to(
              ink,
              {
                opacity: 0.0,
                duration: 0.42,
                ease: "power1.inOut",
              },
              morphStart + 0.36
            );
          }

          // 3. Move outward along trajectory from vault to launch position
          tl.to(
            wrapper,
            {
              x: destX - origX,
              y: destY - origY,
              z: destZ,
              duration: 0.68,
              ease: "power2.inOut",
              force3D: true,
            },
            1.72 + rank * 0.015
          );
        });

        // STEP 2B: VAULT DOOR CLOSES IMMEDIATELY AFTER CARDS CLEAR THE OPENING (0.88s -> 1.32s)
        // Cards reach z: +55 in front of the vault by ~0.86s, clearing the opening completely.
        // The door begins closing immediately at 0.88s with zero idle pause!
        const safeExitCloseStart = 0.88;
        const safeExitCloseDuration = 0.44;

        tl.to(
          safeOpenProxy,
          {
            p: 0.0,
            duration: safeExitCloseDuration,
            ease: "power2.inOut",
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(safeOpenProxy.p);
            },
          },
          safeExitCloseStart
        );

        // STEP 3: VAULT DISAPPEARS - Fades out ONLY AFTER vault is closed & paper cards are fully formed (1.80s -> 2.10s)
        if (safeContainerRef.current) {
          tl.to(
            safeContainerRef.current,
            {
              opacity: 0,
              scale: 0.92,
              duration: 0.30,
              ease: "power2.inOut",
            },
            1.80
          );
          tl.set(
            safeContainerRef.current,
            {
              visibility: "hidden",
              autoAlpha: 0,
              onComplete: () => {
                safeVault3DRef.current?.setOpenProgress(0);
                safeVault3DRef.current?.setCardsProgress?.(0);
              },
            },
            2.10
          );
        }

        // Settled beat as the stack locks in place before the sweep
        tl.to(
          clusterEl,
          {
            scale: 1.015,
            duration: 0.02,
            ease: "power1.out",
          },
          exitHandoffTime - 0.02
        );
        tl.to(
          clusterEl,
          {
            scale: 1.0,
            duration: 0.02,
            ease: "power1.in",
          },
          exitHandoffTime
        );

        // =========================================================================
        // PHASE 2: CONTINUOUS CINEMATIC S-CURVE TRAJECTORY & DESCENT INTO ABOUT
        // Sweep across black text -> turn apex -> sweep across green text ->
        // overshoot with momentum -> fluid downward arc -> downward arrival into About
        // =========================================================================
        tl.to(
          clusterEl,
          {
            keyframes: [
              // 1. Leg 1: Sweep left -> right across black statement
              {
                x: dx1,
                y: dy1,
                rotateZ: 3.5,
                rotateX: 4,
                rotateY: -3,
                duration: 0.52,
                ease: "power1.in",
              },
              // 2. Curved turn apex around right perimeter
              {
                x: dx2,
                y: dy2,
                rotateZ: 14,
                rotateX: 7,
                rotateY: 6,
                duration: 0.28,
                ease: "sine.inOut",
              },
              // 3. Leg 2: Return sweep right -> left across green statement
              {
                x: dx3,
                y: dy3,
                rotateZ: -5,
                rotateX: -2,
                rotateY: -6,
                duration: 0.54,
                ease: "power1.inOut",
              },
              // 4A. Overshoot & Anticipation
              {
                x: dxOvershoot,
                y: dyOvershoot,
                rotateZ: -8,
                rotateX: -3,
                rotateY: -8,
                duration: 0.28,
                ease: "power1.out",
              },
              // 4B. Fluid Downward Arc
              {
                x: dxArc,
                y: dyArc,
                rotateZ: 14,
                rotateX: 14,
                rotateY: 4,
                duration: 0.32,
                ease: "power1.inOut",
              },
              // 5. Downward Descent & Arrival into About Center
              {
                x: 0,
                y: -20,
                rotateZ: 0,
                rotateX: 0,
                rotateY: 0,
                scale: stackCardScale,
                duration: 0.60,
                ease: "power2.out",
              },
            ],
            force3D: true,
          },
          exitHandoffTime
        );

        // Dynamic aerodynamic trailing on rear cards (3 & 4) adapting to trajectory
        [allProductCards[3], allProductCards[4]].forEach((el, lagIdx) => {
          if (!el) return;
          const k = lagIdx + 1;
          // Leg 1: aerodynamic lag to left during rightward travel
          tl.to(
            el,
            {
              x: `-=${k * 14}`,
              y: `+=${k * 2.5}`,
              rotateZ: `-=${k * 2.5}`,
              duration: 0.44,
              ease: "power1.out",
            },
            1.02 + exitDelta + lagIdx * 0.04
          );
          // Turn apex: cards swing outward smoothly with centrifugal bank
          tl.to(
            el,
            {
              x: `+=${k * 8}`,
              y: `+=${k * 4}`,
              rotateZ: `+=${k * 3.5}`,
              duration: 0.28,
              ease: "sine.inOut",
            },
            1.48 + exitDelta + lagIdx * 0.03
          );
          // Leg 2: aerodynamic lag to right during leftward return travel
          tl.to(
            el,
            {
              x: `+=${k * 16}`,
              y: `-=${k * 2}`,
              rotateZ: `+=${k * 2}`,
              duration: 0.50,
              ease: "sine.inOut",
            },
            1.78 + exitDelta + lagIdx * 0.03
          );
          // Overshoot & Anticipation
          tl.to(
            el,
            {
              x: `+=${k * 10}`,
              y: `-=${k * 1.5}`,
              rotateZ: `+=${k * 1.5}`,
              duration: 0.28,
              ease: "power1.out",
            },
            2.30 + exitDelta + lagIdx * 0.03
          );
          // Curve and dive lag
          tl.to(
            el,
            {
              x: `-=${k * 6}`,
              y: `-=${k * 12}`,
              rotateZ: `-=${k * 2}`,
              duration: 0.40,
              ease: "power2.in",
            },
            2.58 + exitDelta + lagIdx * 0.03
          );
          // Return to flat stack alignment upon arrival
          const origX = origCentersRef.current[lagIdx + 3]?.x ?? 0;
          const origY = origCentersRef.current[lagIdx + 3]?.y ?? 0;
          tl.to(
            el,
            {
              x: frontX - (lagIdx + 3) * 2.8 - origX,
              y: -origY,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              duration: 0.32,
              ease: "power2.out",
            },
            2.95 + exitDelta + lagIdx * 0.03
          );
        });

        // Downward arrival: Security closing text fades out smoothly
        tl.to(
          securityStateRefs.current[7],
          {
            opacity: 0,
            y: -36,
            duration: 0.45,
            ease: "power1.out",
          },
          2.60 + exitDelta
        );
        if (securityStageRef.current) {
          tl.set(securityStageRef.current, { opacity: 0, visibility: "hidden" }, 3.05 + exitDelta);
        }
        if (securityStateRefs.current[7]) {
          tl.set(securityStateRefs.current[7], { opacity: 0, visibility: "hidden" }, 3.05 + exitDelta);
        }

        // Continuous Cinematic Background Transition:
        // As the cards initiate their downward drop from Security into About (2.40s + exitDelta),
        // smoothly transition the background from clean/light into the cinematic dark forest-green atmosphere.
        if (aboutContentRef.current) {
          tl.set(aboutContentRef.current, { visibility: "visible" }, 2.40 + exitDelta);
          tl.fromTo(
            aboutContentRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.05,
              ease: "power2.inOut",
            },
            2.40 + exitDelta
          );
        }

        // =========================================================================
        // DIRECT MORPH: DROPPED CARDS MORPH DIRECTLY INTO ENVELOPE
        // Cards drop and immediately fold & expand outward into the envelope geometry.
        // Cluster glides to dead-center, cards flatten radii & merge surfaces,
        // and the single unified physical envelope emerges at screen center.
        // =========================================================================
        // Glide cluster smoothly from drop landing (-20) downwards toward targetEnvelopeY
        tl.to(
          cardsClusterRef.current,
          {
            y: targetEnvelopeY,
            duration: 0.82,
            ease: "power2.out",
          },
          3.15 + exitDelta
        );

        // 5 cards: Scatter -> Gather/Compress -> Flatten into continuous envelope
        allProductCards.forEach((cardEl, idx) => {
          const slot = scatterSlots[idx];
          const origX = origCentersRef.current[idx]?.x ?? 0;
          const origY = origCentersRef.current[idx]?.y ?? 0;
          const stagger = idx * 0.015;

          // STEP 1: SCATTER on landing with authentic physical dispersion and angular offsets
          tl.to(
            cardEl,
            {
              x: slot.x - origX,
              y: slot.y - origY,
              z: slot.z,
              rotateZ: slot.rotZ,
              rotateX: slot.rotX,
              rotateY: slot.rotY,
              scale: slot.scale,
              duration: 0.36,
              ease: "power2.out",
              force3D: true,
            },
            3.15 + exitDelta + stagger
          );

          // STEP 2: GATHER / COMPRESS inward into a single dense, unified rectangular pack
          tl.to(
            cardEl,
            {
              x: 0 - origX,
              y: 0 - origY,
              z: (idx - 2) * 1.5,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: envScale,
              borderRadius: "16px",
              duration: 0.34,
              ease: "power3.inOut",
              force3D: true,
            },
            3.54 + exitDelta + stagger * 0.4
          );

          // STEP 3: MORPH / FLATTEN: The compressed card pack flattens and broadens into
          // the continuous envelope surface as its origami seams solidify
          tl.to(
            cardEl,
            {
              scaleX: envScale * 1.85,
              scaleY: envScale * 1.35,
              opacity: 0,
              duration: 0.28,
              ease: "power2.inOut",
            },
            3.88 + exitDelta + idx * 0.015
          );
          tl.set(cardEl, { visibility: "hidden" }, 4.22 + exitDelta);
        });

        // Unified physical envelope emerges directly from the core of the compressed cards,
        // expanding and solidifying its creases in perfect physical unison
        if (unifiedEnvelopeRef.current) {
          tl.set(
            unifiedEnvelopeRef.current,
            {
              visibility: "visible",
              opacity: 0.25,
              scaleX: 0.54,
              scaleY: 0.74,
            },
            3.86 + exitDelta
          );
          tl.to(
            unifiedEnvelopeRef.current,
            {
              opacity: 1,
              scaleX: 1.0,
              scaleY: 1.0,
              duration: 0.26,
              ease: "power2.out",
            },
            3.88 + exitDelta
          );
        }

        // Settle envelope with subtle tactile weight directly at screen center
        tl.to(
          cardsClusterRef.current,
          {
            y: "+=4",
            duration: 0.18,
            ease: "power1.out",
          },
          4.15 + exitDelta
        );
        tl.to(
          cardsClusterRef.current,
          {
            y: "-=4",
            duration: 0.20,
            ease: "sine.inOut",
          },
          4.33 + exitDelta
        );

        // =========================================================================
        // NEXT STEP: ENVELOPE -> OPEN FLAP -> DOCUMENT EMERGENCE -> PRINTED COPY
        // =========================================================================
        // 1. Initial positions before flap opens
        if (envelopeTopFlapRef.current) {
          tl.set(envelopeTopFlapRef.current, { rotateX: 0, zIndex: 30 }, 0);
        }
        if (envelopeSealRef.current) {
          tl.set(envelopeSealRef.current, { opacity: 1, scale: 1 }, 0);
        }
        // Document starts deep inside pocket cavity
        if (docCavityWrapperRef.current) {
          tl.set(
            docCavityWrapperRef.current,
            {
              zIndex: 10,
              visibility: "hidden",
              opacity: 0,
              clipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
              WebkitClipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
            },
            0
          );
        }
        if (philosophyDocRef.current) {
          tl.set(
            philosophyDocRef.current,
            {
              visibility: "hidden",
              opacity: 0,
              y: 220,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              z: 0,
              scale: 1,
              transformOrigin: "50% 0%",
            },
            0
          );
        }
        if (docPaperSheetRef.current) {
          tl.set(docPaperSheetRef.current, { height: 320, scale: 1 }, 0);
        }
        if (docInkCopyRef.current) {
          tl.set(
            docInkCopyRef.current,
            {
              clipPath: "inset(0 0 100% 0)",
              WebkitClipPath: "inset(0 0 100% 0)",
              opacity: 0,
              visibility: "hidden",
              filter: "contrast(1.25) brightness(0.85)",
            },
            0
          );
        }

        // 2. Unifolio Ring Seal unlocks: subtle pulse & dissolve as seal breaks
        if (envelopeSealRef.current) {
          tl.to(
            envelopeSealRef.current,
            {
              scale: 1.16,
              opacity: 0,
              duration: 0.20,
              ease: "power2.out",
            },
            4.60 + exitDelta
          );
        }

        // 3. Top Flap hinges open naturally along its fold line (rotateX: 0 -> -175deg)
        if (envelopeTopFlapRef.current) {
          tl.to(
            envelopeTopFlapRef.current,
            {
              rotateX: -175,
              duration: 0.57,
              ease: "power2.inOut",
              force3D: true,
            },
            4.68 + exitDelta
          );
          // Halfway through rotation (-90deg), switch zIndex behind the backplate
          tl.set(envelopeTopFlapRef.current, { zIndex: 0 }, 4.95 + exitDelta);
        }

        // 4. PHYSICAL EMERGENCE CHOREOGRAPHY (Strictly Sequential):
        // 4A. Simultaneous: Once flap opens, envelope moves downward & document emerges
        if (cardsClusterRef.current) {
          tl.to(
            cardsClusterRef.current,
            {
              y: targetEnvelopeY + 140,
              duration: 1.20,
              ease: "power2.inOut",
            },
            5.25 + exitDelta
          );
        }

        // Seamlessly dissolve open flap as document clears so flap line is never visible above document
        if (envelopeTopFlapRef.current) {
          tl.to(
            envelopeTopFlapRef.current,
            {
              opacity: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            5.45 + exitDelta
          );
        }

        if (docCavityWrapperRef.current) {
          tl.set(docCavityWrapperRef.current, { visibility: "visible", opacity: 1 }, 5.25 + exitDelta);
        }
        if (philosophyDocRef.current) {
          tl.set(philosophyDocRef.current, { visibility: "visible", opacity: 1 }, 5.25 + exitDelta);
          tl.to(
            philosophyDocRef.current,
            {
              y: -490,
              rotateX: 14,
              rotateY: 1.2,
              z: 40,
              duration: 1.10,
              ease: "power2.out",
              force3D: true,
            },
            5.25 + exitDelta
          );
        }

        // 4B. Document rises substantially and bottom edge clears envelope mouth:
        if (docCavityWrapperRef.current) {
          tl.set(
            docCavityWrapperRef.current,
            {
              zIndex: 35,
              clipPath: "none",
              WebkitClipPath: "none",
            },
            6.35 + exitDelta
          );
        }
        if (docPaperSheetRef.current) {
          tl.to(
            docPaperSheetRef.current,
            {
              height: 930,
              duration: 0.85,
              ease: "power2.inOut",
            },
            6.35 + exitDelta
          );
        }
        if (philosophyDocRef.current) {
          // Document unfurls with momentum and counter-curl flex
          tl.to(
            philosophyDocRef.current,
            {
              rotateX: -3.5,
              duration: 0.45,
              ease: "sine.inOut",
              force3D: true,
            },
            6.35 + exitDelta
          );

          // 4C. Document settles into the final reference composition
          tl.to(
            philosophyDocRef.current,
            {
              y: -375,
              rotateZ: -2.8,
              rotateX: 2.0,
              rotateY: 2.2,
              z: 55,
              duration: 0.65,
              ease: "power2.out",
              force3D: true,
            },
            6.80 + exitDelta
          );
        }

        // 5. Reveal the About copy via high-contrast letterpress printing ink sweep
        if (docInkCopyRef.current) {
          tl.set(docInkCopyRef.current, { visibility: "visible" }, 7.25 + exitDelta);
          tl.fromTo(
            docInkCopyRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.35,
              ease: "power1.in",
            },
            7.25 + exitDelta
          );
          tl.fromTo(
            docInkCopyRef.current,
            {
              clipPath: "inset(0 0 100% 0)",
            },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.15,
              ease: "power2.inOut",
            },
            7.25 + exitDelta
          );
          tl.fromTo(
            docInkCopyRef.current,
            {
              filter: "contrast(1.25) brightness(0.85)",
            },
            {
              filter: "contrast(1) brightness(1)",
              duration: 1.15,
              ease: "power2.out",
            },
            7.25 + exitDelta
          );
        }
      };

      const restoreStackToRing = () => {
        if (isSecurityTransitioningRef.current) return;
        if (stateRef.current !== "about" && !isRingConsolidatedRef.current) return;

        isSecurityTransitioningRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();

        // Kill forward timeline if active
        if (consolidationTlRef.current) {
          consolidationTlRef.current.kill();
          consolidationTlRef.current = null;
        }

        aboutDocPageRef.current = 1;
        isFlippingDocRef.current = false;
        if (docFlipperRef.current) {
          gsap.set(docFlipperRef.current, { rotateY: 0, z: 0 });
        }

        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
        const viewportCenterY = vh / 2;
        const viewportCenterX = vw / 2;
        // Clamped separately from viewportCenterX: the shift amounts below should stay
        // proportioned to the reference desktop width, while viewportCenterX itself must
        // keep tracking the real viewport center for the cluster-centering math above.
        const composedCenterX = Math.min(vw, DESKTOP_REFERENCE_WIDTH) / 2;
        const clusterRect = cardsClusterRef.current?.getBoundingClientRect();
        const clusterCenterX = clusterRect ? (clusterRect.left + clusterRect.width / 2) : viewportCenterX;
        const clusterCenterY = clusterRect ? (clusterRect.top + clusterRect.height / 2) : viewportCenterY;
        const fallbackTargetRingY = Math.round(viewportCenterY - clusterCenterY + 18);
        const fallbackTargetRingX = Math.round(viewportCenterX - clusterCenterX);
        const leftShift = isDesktop
          ? Math.round(composedCenterX * 0.44)
          : isTablet
          ? Math.round(composedCenterX * 0.32)
          : Math.round(composedCenterX * 0.20);
        const fallbackTargetLeftX = fallbackTargetRingX - leftShift;

        const targetLeftX = targetLeftXRef.current ?? fallbackTargetLeftX;
        const targetRingY = targetRingYRef.current ?? fallbackTargetRingY;

        const vhVal = typeof window !== "undefined" ? window.innerHeight : 900;
        const stackCardScale = isDesktop ? 0.60 : isTablet ? 0.56 : 0.52;
        const targetEnvelopeY = isDesktop
          ? Math.round(Math.max(255, Math.min(290, vhVal * 0.29)))
          : isTablet
          ? Math.round(Math.max(210, Math.min(245, vhVal * 0.25)))
          : Math.round(Math.max(175, Math.min(205, vhVal * 0.21)));
        const frontX = 35;

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];
        const shiftX = isDesktop
          ? Math.round(composedCenterX * 0.42)
          : isTablet
          ? Math.round(composedCenterX * 0.30)
          : Math.round(composedCenterX * 0.16);

        const revTl = gsap.timeline({
          onComplete: () => {
            isSecurityTransitioningRef.current = false;
            isRingConsolidatedRef.current = false;
            stateRef.current = "ring";
            transitionCompleteRef.current = true;
            transitionStartedRef.current = true;
            currentSecurityStateRef.current = 7;
            if (cardsStageRef.current) {
              cardsStageRef.current.style.pointerEvents = "";
            }
            if (securityStageRef.current) {
              gsap.set(securityStageRef.current, {
                autoAlpha: 1,
                opacity: 1,
                visibility: "visible",
                zIndex: 35,
                x: 0,
                y: 0,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
              });
            }

            // Kill obsolete ring rotation tween
            if (ringRotateTweenRef.current) {
              ringRotateTweenRef.current.kill();
              ringRotateTweenRef.current = null;
            }

            if (cardsClusterRef.current) {
              gsap.set(cardsClusterRef.current, {
                x: 0,
                y: 0,
                scale: 1.0,
                scaleX: 1.0,
                scaleY: 1.0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
              });
            }

            if (safeContainerRef.current) {
              gsap.set(safeContainerRef.current, {
                opacity: 1,
                autoAlpha: 1,
                visibility: "visible",
                scale: 1,
                xPercent: -50,
                yPercent: -50,
                x: targetLeftX,
                y: targetRingY,
              });
            }
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.setCardsProgress?.(0);
            allProductCards.forEach((wrapper) => {
              gsap.set(wrapper, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
            });
            allCompanionCards.forEach((compEl) => {
              if (compEl) gsap.set(compEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
            });

            if (securityStateRefs.current[7]) {
              gsap.set(securityStateRefs.current[7], {
                autoAlpha: 1,
                opacity: 1,
                visibility: "visible",
                x: shiftX,
                y: 0,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
              });
            }

            dispatchActiveSection("security");

            if (onRestoreStackCompletedRef.current) {
              const cb = onRestoreStackCompletedRef.current;
              onRestoreStackCompletedRef.current = null;
              cb();
            }
          },
        });

        // -------------------------------------------------------------------------
        // REVERSE STEP 1: DOCUMENT DIRECTLY RETRACTS BACK INTO ENVELOPE (0.00s -> 0.32s)
        // No text fade-out! The document glides straight back down inside the cavity.
        // -------------------------------------------------------------------------
        if (docCavityWrapperRef.current) {
          gsap.set(docCavityWrapperRef.current, {
            zIndex: 10,
            clipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
            WebkitClipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
          });
        }
        if (envelopeTopFlapRef.current) {
          gsap.set(envelopeTopFlapRef.current, { opacity: 1, rotateX: -175, zIndex: 0 });
        }
        if (philosophyDocRef.current) {
          revTl.to(
            philosophyDocRef.current,
            {
              y: 220,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              z: 0,
              duration: 0.32,
              ease: "power2.in",
              force3D: true,
            },
            0
          );
          revTl.set(philosophyDocRef.current, { visibility: "hidden", opacity: 0 }, 0.32);
        }

        // Lift envelope back up from downward emergence displacement
        if (cardsClusterRef.current) {
          revTl.to(
            cardsClusterRef.current,
            {
              y: targetEnvelopeY,
              duration: 0.28,
              ease: "power2.out",
            },
            0.04
          );
        }

        // -------------------------------------------------------------------------
        // REVERSE STEP 2: ENVELOPE TOP FLAP AUTOMATICALLY CLOSES (0.32s -> 0.52s)
        // No waiting for additional scroll input! Immediately snaps shut and seals.
        // -------------------------------------------------------------------------
        if (envelopeTopFlapRef.current) {
          revTl.set(envelopeTopFlapRef.current, { zIndex: 30, opacity: 1 }, 0.32);
          revTl.to(
            envelopeTopFlapRef.current,
            {
              rotateX: 0,
              duration: 0.20,
              ease: "power2.inOut",
              force3D: true,
            },
            0.32
          );
        }
        if (envelopeSealRef.current) {
          revTl.set(envelopeSealRef.current, { visibility: "visible" }, 0.32);
          revTl.to(
            envelopeSealRef.current,
            {
              opacity: 1,
              scale: 1,
              duration: 0.16,
              ease: "power2.out",
            },
            0.36
          );
        }

        // -------------------------------------------------------------------------
        // REVERSE STEP 3: ENVELOPE DIRECTLY MORPHS INTO CARD STACK (0.52s -> 0.76s)
        // No card scattering or reassembly! The closed envelope directly contracts into
        // the pristine 26-card stack at the center.
        // -------------------------------------------------------------------------
        allCards.forEach((cardEl, idx) => {
          const origX = idx < 5 ? (origCentersRef.current[idx]?.x ?? 0) : 0;
          const origY = idx < 5 ? (origCentersRef.current[idx]?.y ?? 0) : 0;
          const destX = frontX - idx * 2.8 - origX;
          const destY = -origY;
          const destZ = -idx * 2.2;

          revTl.set(
            cardEl,
            {
              x: destX,
              y: destY,
              z: destZ,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: stackCardScale,
              borderRadius: "20px",
              opacity: 0,
              visibility: "visible",
            },
            0.52
          );

          revTl.to(
            cardEl,
            {
              opacity: 1,
              duration: 0.20,
              ease: "power2.out",
            },
            0.54
          );
        });

        if (unifiedEnvelopeRef.current) {
          revTl.to(
            unifiedEnvelopeRef.current,
            {
              scaleX: 0.54,
              scaleY: 0.74,
              opacity: 0,
              duration: 0.22,
              ease: "power2.in",
            },
            0.52
          );
          revTl.set(unifiedEnvelopeRef.current, { visibility: "hidden" }, 0.75);
        }

        // -------------------------------------------------------------------------
        // REVERSE STEP 4: REVEAL VAULT & RESTORE SECURITY TEXT DIRECTLY (0.76s -> 1.25s)
        // The safe vault is restored at its static docked position on the left,
        // and the Security text directly returns to its natural position with zero rotation.
        // No circular/orbital movement. All legacy ring transforms removed.
        // -------------------------------------------------------------------------
        if (cardsClusterRef.current) {
          revTl.to(
            cardsClusterRef.current,
            {
              x: 0,
              y: 0,
              scale: 1.0,
              scaleX: 1.0,
              scaleY: 1.0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              duration: 0.44,
              ease: "power2.out",
              force3D: true,
            },
            0.76
          );
        }

        if (safeContainerRef.current) {
          revTl.set(
            safeContainerRef.current,
            {
              visibility: "visible",
              autoAlpha: 1,
              opacity: 1,
              scale: 1,
              xPercent: -50,
              yPercent: -50,
              x: targetLeftX,
              y: targetRingY,
            },
            0.76
          );
        }

        // Cards smoothly retract/fade into the closed vault
        allCards.forEach((cardEl) => {
          revTl.to(
            cardEl,
            {
              opacity: 0,
              duration: 0.26,
              ease: "power2.in",
            },
            0.76
          );
          revTl.set(cardEl, { visibility: "hidden", autoAlpha: 0 }, 1.02);
        });

        if (aboutContentRef.current) {
          revTl.to(
            aboutContentRef.current,
            {
              opacity: 0,
              duration: 0.40,
              ease: "power2.inOut",
            },
            0.76
          );
          revTl.set(aboutContentRef.current, { visibility: "hidden" }, 1.18);
        }

        if (securityStageRef.current) {
          revTl.set(
            securityStageRef.current,
            {
              autoAlpha: 1,
              opacity: 1,
              visibility: "visible",
              zIndex: 35,
              x: 0,
              y: 0,
              rotate: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
            },
            0.76
          );
        }
        securityStateRefs.current.forEach((el, idx) => {
          if (el && idx !== 7) {
            revTl.set(el, { opacity: 0, visibility: "hidden", autoAlpha: 0 }, 0.76);
          }
        });

        if (closingBlackTextRef.current) {
          closingBlackTextRef.current.style.clipPath = "none";
          (closingBlackTextRef.current.style as any).webkitClipPath = "none";
          closingBlackTextRef.current.style.opacity = "1";
          closingBlackTextRef.current.style.visibility = "visible";
        }
        if (closingGreenTextRef.current) {
          closingGreenTextRef.current.style.clipPath = "none";
          (closingGreenTextRef.current.style as any).webkitClipPath = "none";
          closingGreenTextRef.current.style.opacity = "1";
          closingGreenTextRef.current.style.visibility = "visible";
        }
        closingBlackWordRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        });
        closingGreenWordRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        });

        if (securityStateRefs.current[7]) {
          revTl.set(
            securityStateRefs.current[7],
            {
              visibility: "visible",
              autoAlpha: 0,
              opacity: 0,
              x: shiftX,
              y: 16,
              rotate: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              scale: 1.0,
            },
            0.76
          );
          revTl.to(
            securityStateRefs.current[7],
            {
              autoAlpha: 1,
              opacity: 1,
              y: 0,
              x: shiftX,
              rotate: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              scale: 1.0,
              duration: 0.38,
              ease: "power2.out",
            },
            0.80
          );
        }
      };

      const goToSecurityState = (nextIdx: number, direction: 1 | -1) => {
        if (nextIdx < 0 || nextIdx >= SECURITY_STATES.length) return;
        if (isSecurityTransitioningRef.current) return;

        const prevIdx = currentSecurityStateRef.current;
        if (prevIdx === nextIdx) return;

        isSecurityTransitioningRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();
        currentSecurityStateRef.current = nextIdx;

        // Subtle vault interaction: rotate outer locking rim smoothly between Security states while door remains closed
        safeVault3DRef.current?.triggerRimStep?.(direction, nextIdx);

        // Cancel previous state transition timeline if running
        if (securityStateTransitionTlRef.current) {
          securityStateTransitionTlRef.current.kill();
          securityStateTransitionTlRef.current = null;
        }

        // Clean up money animation if leaving state 0
        if (prevIdx === 0) {
          if (moneyAnimTlRef.current) {
            moneyAnimTlRef.current.kill();
            moneyAnimTlRef.current = null;
          }
          const chars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (moneyWrapperRef.current) gsap.set(moneyWrapperRef.current, { opacity: 0, scale: 0.85 });
          if (moneyBill1Ref.current) gsap.set(moneyBill1Ref.current, { x: 0, y: 0, rotate: 0 });
          if (moneyBill2Ref.current) gsap.set(moneyBill2Ref.current, { x: 0, y: 0, rotate: 0 });
        }

        // Clean up typo eyes animation if leaving state 1 mid-animation
        if (prevIdx === 1 && typoEyesTlRef.current?.isActive()) {
          typoEyesTlRef.current.kill();
          typoEyesTlRef.current = null;
          if (typoEyesRef.current) {
            gsap.set(typoEyesRef.current, { opacity: 0, visibility: "hidden" });
          }
          if (typoLeftWordRef.current) {
            gsap.set(typoLeftWordRef.current, { x: 0 });
          }
          if (typoRightWordRef.current) {
            gsap.set(typoRightWordRef.current, { x: 0 });
          }
        }

        // Clean up password mask animation if leaving state 2
        if (prevIdx === 2 && pwdMaskTlRef.current) {
          pwdMaskTlRef.current.kill();
          pwdMaskTlRef.current = null;
          const letters = pwdLetterRefs.current.filter(Boolean) as HTMLElement[];
          const masks = pwdMaskRefs.current.filter(Boolean) as HTMLElement[];
          if (letters.length > 0) gsap.set(letters, { opacity: 1, scale: 1, y: 0 });
          if (masks.length > 0) gsap.set(masks, { opacity: 0, scale: 0.35 });
        }

        // Clean up lock animation if leaving state 3
        if (prevIdx === 3) {
          if (lockAnimTlRef.current) {
            lockAnimTlRef.current.kill();
            lockAnimTlRef.current = null;
          }
          const chars = lockCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (lockIconWrapperRef.current) gsap.set(lockIconWrapperRef.current, { opacity: 0, scale: 0.35 });
        }

        // Clean up connection animation if leaving state 4
        if (prevIdx === 4) {
          if (connectionAnimTlRef.current) {
            connectionAnimTlRef.current.kill();
            connectionAnimTlRef.current = null;
          }
          const chars = connectionCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (connectionWrapperRef.current) gsap.set(connectionWrapperRef.current, { opacity: 0, scale: 0.35 });
        }

        // Clean up India animation if leaving state 5
        if (prevIdx === 5) {
          if (indiaAnimTlRef.current) {
            indiaAnimTlRef.current.kill();
            indiaAnimTlRef.current = null;
          }
          const chars = indiaCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (indiaMapWrapperRef.current) gsap.set(indiaMapWrapperRef.current, { opacity: 0, scale: 0.35 });
        }

        // Clean up sell animation if leaving state 6
        if (prevIdx === 6) {
          if (sellAnimTlRef.current) {
            sellAnimTlRef.current.kill();
            sellAnimTlRef.current = null;
          }
          const chars = sellCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (sellShieldWrapperRef.current) gsap.set(sellShieldWrapperRef.current, { opacity: 0, scale: 0.35, y: 0, x: 0 });
          if (sellShieldIconRef.current) gsap.set(sellShieldIconRef.current, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });
        }

        // Clean up closing consolidation if leaving state 7
        if (prevIdx === 7 || nextIdx !== 7) {
          if (consolidationTlRef.current) {
            consolidationTlRef.current.kill();
            consolidationTlRef.current = null;
          }
          isRingConsolidatedRef.current = false;
          closingBlackWordRefs.current.forEach((el) => {
            if (el) gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0 });
          });
          closingGreenWordRefs.current.forEach((el) => {
            if (el) gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0 });
          });
          if (closingBlackTextRef.current) {
            closingBlackTextRef.current.style.clipPath = "none";
            (closingBlackTextRef.current.style as any).webkitClipPath = "none";
            closingBlackTextRef.current.style.opacity = "1";
            closingBlackTextRef.current.style.visibility = "visible";
          }
          if (closingGreenTextRef.current) {
            closingGreenTextRef.current.style.clipPath = "none";
            (closingGreenTextRef.current.style as any).webkitClipPath = "none";
            closingGreenTextRef.current.style.opacity = "1";
            closingGreenTextRef.current.style.visibility = "visible";
          }
        }

        // Hide all inactive states immediately
        securityStateRefs.current.forEach((el, idx) => {
          if (el && idx !== nextIdx && idx !== prevIdx) {
            gsap.set(el, { opacity: 0, visibility: "hidden" });
          }
        });

        const prevEl = securityStateRefs.current[prevIdx];
        const nextEl = securityStateRefs.current[nextIdx];

        const tl = gsap.timeline({
          onComplete: () => {
            securityStateTransitionTlRef.current = null;
            isSecurityTransitioningRef.current = false;
            if (nextIdx === 0) {
              if (nextEl) gsap.set(nextEl, { clipPath: "none" });
              playMoneyAnimation();
            } else if (nextIdx === 1) {
              playTypoEyesAnimation();
            } else if (nextIdx === 2) {
              playPasswordMaskAnimation();
            } else if (nextIdx === 3) {
              playLockMorphAnimation();
            } else if (nextIdx === 4) {
              playConnectionAnimation();
            } else if (nextIdx === 5) {
              playIndiaAnimation();
            } else if (nextIdx === 6) {
              playSellAnimation();
            }
          },
        });
        securityStateTransitionTlRef.current = tl;

        // 1. Current text smoothly fades and moves out subtly
        if (prevEl) {
          tl.to(
            prevEl,
            {
              opacity: 0,
              y: direction === 1 ? -16 : 16,
              duration: 0.20,
              ease: "power2.in",
            },
            0
          );
          tl.set(prevEl, { visibility: "hidden" }, 0.20);
        }

        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
        const vCenterX = Math.min(typeof window !== "undefined" ? window.innerWidth : 1440, DESKTOP_REFERENCE_WIDTH) / 2;
        const shiftX = isDesk
          ? Math.round(vCenterX * 0.42)
          : isTab
          ? Math.round(vCenterX * 0.30)
          : Math.round(vCenterX * 0.16);

        // 2. New text smoothly enters with a slight directional movement & subtle stagger
        if (nextEl) {
          if (nextIdx === 0 && securityHeroRibbonRef.current) {
            gsap.set(securityHeroRibbonRef.current, { x: 0 });
            gsap.set(nextEl, { clipPath: "none" });
          }
          if (nextIdx === 7) {
            if (closingBlackTextRef.current) {
              closingBlackTextRef.current.style.clipPath = "none";
              (closingBlackTextRef.current.style as any).webkitClipPath = "none";
            }
            if (closingGreenTextRef.current) {
              closingGreenTextRef.current.style.clipPath = "none";
              (closingGreenTextRef.current.style as any).webkitClipPath = "none";
            }
          }
          tl.set(
            nextEl,
            {
              visibility: "visible",
              opacity: 0,
              x: shiftX,
              y: direction === 1 ? 16 : -16,
            },
            0.10
          );

          const heading = nextEl.querySelector("h2, h3");
          const body = nextEl.querySelector("p");

          if (heading && body) {
            tl.fromTo(
              heading,
              { opacity: 0, y: direction === 1 ? 14 : -14 },
              { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
              0.12
            );
            tl.fromTo(
              body,
              { opacity: 0, y: direction === 1 ? 14 : -14 },
              { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
              0.16
            );
            tl.to(nextEl, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, 0.12);
          } else {
            tl.to(
              nextEl,
              {
                opacity: 1,
                y: 0,
                duration: 0.32,
                ease: "power2.out",
              },
              0.12
            );
          }
        }
      };

      const exitSecurityToAbout = () => {
        jumpToAboutState();
      };

      const triggerProductToRing = () => {
        if (stateRef.current !== "product") return;
        if (hoverCommitTimeoutRef.current) {
          clearTimeout(hoverCommitTimeoutRef.current);
          hoverCommitTimeoutRef.current = null;
        }
        currentHoverRef.current = null;
        stateRef.current = "sculpting";
        transitionStartedRef.current = true;
        transitionAnimatingRef.current = true;
        isHoldingProductRef.current = false;

        // 2. Disable/ignore hover interactions for cards during transition
        if (cardsClusterRef.current) {
          cardsClusterRef.current.style.pointerEvents = "none";
        }
        if (cardsStageRef.current) {
          cardsStageRef.current.style.pointerEvents = "none";
        }

        // 1. Snapshot and snap the exact pinned scroll position so no shift occurs
        const pinEnd = apertureScrollTriggerRef.current?.end ?? window.scrollY;
        lockScrollYRef.current = pinEnd;
        window.scrollTo(0, pinEnd);

        // 2. Lock document overflow
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        // 3. Physically lock the stage element fixed to the viewport:
        // Guarantees zero vertical displacement, completely preventing next section peek
        if (stageRef.current) {
          stageRef.current.style.position = "fixed";
          stageRef.current.style.top = "0px";
          stageRef.current.style.left = "0px";
          stageRef.current.style.width = "100%";
          stageRef.current.style.height = "100vh";
          stageRef.current.style.zIndex = "40";
        }

        // 4. Create and start timeline
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }
        if (productToRingTlRef.current) {
          productToRingTlRef.current.kill();
        }
        productToRingTlRef.current = createProductToRingTimeline();
        productToRingTlRef.current.play(0);
      };

      const triggerRingToProduct = () => {
        if (!transitionCompleteRef.current || transitionAnimatingRef.current) return;
        stateRef.current = "sculpting";
        transitionAnimatingRef.current = true;
        transitionCompleteRef.current = false;
        transitionStartedRef.current = false;
        isHoldingProductRef.current = false;
        isSecurityTransitioningRef.current = false;

        // Clean up typo eyes animation if active
        if (typoEyesTlRef.current) {
          typoEyesTlRef.current.kill();
          typoEyesTlRef.current = null;
        }
        if (typoEyesRef.current) {
          gsap.set(typoEyesRef.current, { opacity: 0, visibility: "hidden" });
        }
        if (typoLeftWordRef.current) gsap.set(typoLeftWordRef.current, { x: 0 });
        if (typoRightWordRef.current) gsap.set(typoRightWordRef.current, { x: 0 });

        // Clean up password mask animation if active
        if (pwdMaskTlRef.current) {
          pwdMaskTlRef.current.kill();
          pwdMaskTlRef.current = null;
        }
        const pwdLetters = pwdLetterRefs.current.filter(Boolean) as HTMLElement[];
        const pwdMasks = pwdMaskRefs.current.filter(Boolean) as HTMLElement[];
        if (pwdLetters.length > 0) gsap.set(pwdLetters, { opacity: 1, scale: 1, y: 0 });
        if (pwdMasks.length > 0) gsap.set(pwdMasks, { opacity: 0, scale: 0.35 });

        // Clean up lock animation if active
        if (lockAnimTlRef.current) {
          lockAnimTlRef.current.kill();
          lockAnimTlRef.current = null;
        }
        lockAnimPlayedRef.current = false;
        const lockChars = lockCharRefs.current.filter(Boolean) as HTMLElement[];
        if (lockChars.length > 0) gsap.set(lockChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (lockIconWrapperRef.current) gsap.set(lockIconWrapperRef.current, { opacity: 0, scale: 0.35 });

        // Clean up connection animation if active
        if (connectionAnimTlRef.current) {
          connectionAnimTlRef.current.kill();
          connectionAnimTlRef.current = null;
        }
        const connChars = connectionCharRefs.current.filter(Boolean) as HTMLElement[];
        if (connChars.length > 0) gsap.set(connChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (connectionWrapperRef.current) gsap.set(connectionWrapperRef.current, { opacity: 0, scale: 0.35 });

        // Clean up India animation if active
        if (indiaAnimTlRef.current) {
          indiaAnimTlRef.current.kill();
          indiaAnimTlRef.current = null;
        }
        const indiaChars = indiaCharRefs.current.filter(Boolean) as HTMLElement[];
        if (indiaChars.length > 0) gsap.set(indiaChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (indiaMapWrapperRef.current) gsap.set(indiaMapWrapperRef.current, { opacity: 0, scale: 0.35 });

        // Clean up sell animation if active
        if (sellAnimTlRef.current) {
          sellAnimTlRef.current.kill();
          sellAnimTlRef.current = null;
        }
        const sellChars = sellCharRefs.current.filter(Boolean) as HTMLElement[];
        if (sellChars.length > 0) gsap.set(sellChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (sellShieldWrapperRef.current) gsap.set(sellShieldWrapperRef.current, { opacity: 0, scale: 0.35, y: 0, x: 0 });
        if (sellShieldIconRef.current) gsap.set(sellShieldIconRef.current, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });

        // Clean up money animation if active
        if (moneyAnimTlRef.current) {
          moneyAnimTlRef.current.kill();
          moneyAnimTlRef.current = null;
        }
        const moneyChars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
        if (moneyChars.length > 0) gsap.set(moneyChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (moneyWrapperRef.current) gsap.set(moneyWrapperRef.current, { opacity: 0, scale: 0.85 });
        if (moneyBill1Ref.current) gsap.set(moneyBill1Ref.current, { x: 0, y: 0, rotate: 0 });
        if (moneyBill2Ref.current) gsap.set(moneyBill2Ref.current, { x: 0, y: 0, rotate: 0 });

        // 1. Immediately stop continuous ambient rotation so it cannot fight the reverse timeline
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }

        // Clean up consolidation timeline if active
        if (consolidationTlRef.current) {
          consolidationTlRef.current.kill();
          consolidationTlRef.current = null;
        }
        isRingConsolidatedRef.current = false;

        // 2. Reset any advanced security states back to State 0 before reversing
        if (currentSecurityStateRef.current > 0) {
          const activeEl = securityStateRefs.current[currentSecurityStateRef.current];
          if (activeEl) gsap.set(activeEl, { opacity: 0, visibility: "hidden" });
          const state0El = securityStateRefs.current[0];
          const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
          const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
          const vCenterX = Math.min(typeof window !== "undefined" ? window.innerWidth : 1440, DESKTOP_REFERENCE_WIDTH) / 2;
          const shiftX = isDesk ? Math.round(vCenterX * 0.42) : isTab ? Math.round(vCenterX * 0.30) : Math.round(vCenterX * 0.16);
          if (state0El) gsap.set(state0El, { opacity: 1, visibility: "visible", x: shiftX, y: 0, scale: 1, clipPath: "none" });
          currentSecurityStateRef.current = 0;
          safeVault3DRef.current?.resetRim?.();
        }


        const pinEnd = apertureScrollTriggerRef.current?.end ?? window.scrollY;
        lockScrollYRef.current = pinEnd;
        window.scrollTo(0, pinEnd);

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        if (stageRef.current) {
          stageRef.current.style.position = "fixed";
          stageRef.current.style.top = "0px";
          stageRef.current.style.left = "0px";
          stageRef.current.style.width = "100%";
          stageRef.current.style.height = "100vh";
          stageRef.current.style.zIndex = "40";
        }

        // 4. Exact backward sequence:
        // The master GSAP timeline plays in reverse along the exact same trajectory:
        // Security text recedes -> safe door opens to the left -> cards retrace curved trajectory
        // backward out of the safe -> cards return to stacked position -> safe fades -> cards return to Bento.
        const startReverseTimeline = () => {
          if (!productToRingTlRef.current) {
            productToRingTlRef.current = createProductToRingTimeline();
          }
          productToRingTlRef.current.seek(productToRingTlRef.current.duration(), false);
          productToRingTlRef.current.reverse();
        };

        startReverseTimeline();
      };

      const handleWheel = (e: WheelEvent) => {
        // 1. Block all wheel inputs while transition is animating or navbar navigation is in progress
        if (transitionAnimatingRef.current || isNavigatingRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        // 1b. If in About section: scroll-driven 3D physical page flip
        if (stateRef.current === "about") {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;

          if (e.deltaY > 8) {
            if (Date.now() - lastSecurityScrollTimeRef.current < 280) return;
            if (aboutDocPageRef.current === 1) {
              flipDocToPage(2);
            } else {
              exitAboutToFaq();
            }
            return;
          } else if (e.deltaY < -8) {
            if (Date.now() - lastSecurityScrollTimeRef.current < 280) return;
            if (aboutDocPageRef.current === 2) {
              flipDocToPage(1);
            } else {
              restoreStackToRing();
            }
            return;
          }
          return;
        }

        // 1c. If in FAQ / content sections:
        if (stateRef.current === "faq") {
          // Downward scroll: native smooth scroll through FAQ, Contact, and footer
          if (e.deltaY > 0) {
            return;
          }
          // Upward scroll at or near the top of FAQ: gracefully re-enter About
          const faqEl = document.getElementById("faq");
          const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
          if (e.deltaY < -10 && window.scrollY <= faqTop + 30) {
            if (Date.now() - lastSecurityScrollTimeRef.current < 300) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            jumpToAboutState(2);
            return;
          }
          return;
        }

        // 2. While in Ring state with Security Content experience active:
        // The viewport/page must remain fixed while progressing through discrete states
        if (stateRef.current === "ring" && transitionCompleteRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();

          // Refresh gesture timer on every wheel tick in security mode
          if (wheelGestureEndTimerRef.current) {
            clearTimeout(wheelGestureEndTimerRef.current);
          }
          wheelGestureEndTimerRef.current = setTimeout(() => {
            wheelGestureActiveRef.current = false;
          }, 180);

          // A state transition (or ring consolidation) is already animating:
          // ignore every extra wheel tick from this gesture so one scroll
          // — regardless of intensity — only ever advances a single state.
          if (isSecurityTransitioningRef.current) return;

          // Allow responsive scrolling up and down between animations (220ms cadence)
          if (Date.now() - lastSecurityScrollTimeRef.current < 220) return;

          if (e.deltaY > 8) {
            lastSecurityScrollTimeRef.current = Date.now();
            // One intentional downward scroll = exactly one next state
            if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
              goToSecurityState(currentSecurityStateRef.current + 1, 1);
            } else {
              // At final security state (State 7):
              // First downward scroll triggers consolidation of the ring into the horizontal stack
              if (!isRingConsolidatedRef.current) {
                consolidateRingToStack();
              }
              // Once consolidated, hold in place — do not begin next movement yet
            }
            return;
          } else if (e.deltaY < -8) {
            lastSecurityScrollTimeRef.current = Date.now();
            // If at final state and stack is consolidated, scroll up reverses consolidation and restores ring
            if (currentSecurityStateRef.current === SECURITY_STATES.length - 1 && isRingConsolidatedRef.current) {
              restoreStackToRing();
              return;
            }
            // One intentional upward scroll = exactly one previous state
            if (currentSecurityStateRef.current > 0) {
              goToSecurityState(currentSecurityStateRef.current - 1, -1);
            } else {
              // At State 1 Hero -> scroll up returns to Product cards
              triggerRingToProduct();
            }
            return;
          }
          return;
        }

        // 3. If in Product section (Bento):
        if (stateRef.current === "product") {
          if (e.deltaY > 8) {
            // User scrolled downward: transition to Security!
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToRing();
            return;
          } else if (e.deltaY < -8 && window.scrollY <= 10) {
            // User scrolled upward: return to resting amphitheater state
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerBentoToResting();
            return;
          }
          return;
        }

        // 3b. If in Product Resting section (Amphitheater with Hero content):
        if (stateRef.current === "product-resting") {
          if (e.deltaY > 8) {
            // User scrolled downward: trigger bento transformation!
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerRestingToBento();
            return;
          } else if (e.deltaY < -8) {
            // User scrolled upward: return to Hero section
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToHero();
            return;
          }
          return;
        }

        // 4. If in Hero section: first downward scroll gesture acts as single trigger
        if (stateRef.current === "hero") {
          if (e.deltaY > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerHeroToProduct();
            return;
          } else if (e.deltaY < -8) {
            e.preventDefault();
            return;
          }
          return;
        }
      };

      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
        touchGestureActiveRef.current = false;
      };

      const handleTouchEnd = () => {
        touchGestureActiveRef.current = false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (transitionAnimatingRef.current || isNavigatingRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (stateRef.current === "about") {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;

          const touchY = e.touches[0].clientY;
          const touchDeltaY = touchStartY - touchY;

          if (touchDeltaY > 12) {
            touchStartY = touchY;
            if (Date.now() - lastSecurityScrollTimeRef.current < 300) return;
            if (aboutDocPageRef.current === 1) {
              flipDocToPage(2);
            } else {
              exitAboutToFaq();
            }
            return;
          } else if (touchDeltaY < -12) {
            touchStartY = touchY;
            if (Date.now() - lastSecurityScrollTimeRef.current < 300) return;
            if (aboutDocPageRef.current === 2) {
              flipDocToPage(1);
            } else {
              restoreStackToRing();
            }
            return;
          }
          return;
        }

        if (stateRef.current === "faq") {
          const touchY = e.touches[0].clientY;
          const touchDeltaY = touchStartY - touchY;
          if (touchDeltaY > 0) {
            return;
          }
          const faqEl = document.getElementById("faq");
          const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
          if (touchDeltaY < -12 && window.scrollY <= faqTop + 30) {
            touchStartY = touchY;
            if (Date.now() - lastSecurityScrollTimeRef.current < 300) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            jumpToAboutState(2);
            return;
          }
          return;
        }

        if (stateRef.current === "ring" && transitionCompleteRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();

          if (Date.now() - lastSecurityScrollTimeRef.current < 220) return;

          const touchDeltaY = touchStartY - e.touches[0].clientY;
          if (touchDeltaY > 16) {
            lastSecurityScrollTimeRef.current = Date.now();
            touchStartY = e.touches[0].clientY;
            if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
              goToSecurityState(currentSecurityStateRef.current + 1, 1);
            } else {
              if (!isRingConsolidatedRef.current) {
                consolidateRingToStack();
              }
            }
            return;
          } else if (touchDeltaY < -16) {
            lastSecurityScrollTimeRef.current = Date.now();
            touchStartY = e.touches[0].clientY;
            if (currentSecurityStateRef.current === SECURITY_STATES.length - 1 && isRingConsolidatedRef.current) {
              restoreStackToRing();
              return;
            }
            if (currentSecurityStateRef.current > 0) {
              goToSecurityState(currentSecurityStateRef.current - 1, -1);
            } else {
              triggerRingToProduct();
            }
            return;
          }
          return;
        }

        const touchDeltaY = touchStartY - e.touches[0].clientY;

        if (stateRef.current === "product") {
          if (touchDeltaY > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToRing();
            return;
          } else if (touchDeltaY < -8 && window.scrollY <= 10) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerBentoToResting();
            return;
          }
          return;
        }

        if (stateRef.current === "product-resting") {
          if (touchDeltaY > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerRestingToBento();
            return;
          } else if (touchDeltaY < -8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToHero();
            return;
          }
          return;
        }

        if (stateRef.current === "hero") {
          if (touchDeltaY > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerHeroToProduct();
            return;
          } else if (touchDeltaY < -8) {
            e.preventDefault();
            return;
          }
          return;
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (transitionAnimatingRef.current || isNavigatingRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (stateRef.current === "hero") {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerHeroToProduct();
            return;
          }
          return;
        }

        if (stateRef.current === "about") {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;
            if (Date.now() - lastSecurityScrollTimeRef.current < 250) return;
            if (aboutDocPageRef.current === 1) {
              flipDocToPage(2);
            } else {
              exitAboutToFaq();
            }
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;
            if (Date.now() - lastSecurityScrollTimeRef.current < 250) return;
            if (aboutDocPageRef.current === 2) {
              flipDocToPage(1);
            } else {
              restoreStackToRing();
            }
            return;
          }
        }

        if (stateRef.current === "ring" && transitionCompleteRef.current) {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (Date.now() - lastSecurityScrollTimeRef.current < 220) return;

            if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
              goToSecurityState(currentSecurityStateRef.current + 1, 1);
            } else {
              if (!isRingConsolidatedRef.current) {
                consolidateRingToStack();
              }
            }
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (Date.now() - lastSecurityScrollTimeRef.current < 220) return;

            if (currentSecurityStateRef.current === SECURITY_STATES.length - 1 && isRingConsolidatedRef.current) {
              restoreStackToRing();
              return;
            }
            if (currentSecurityStateRef.current > 0) {
              goToSecurityState(currentSecurityStateRef.current - 1, -1);
            } else {
              triggerRingToProduct();
            }
            return;
          }
        }

        if (stateRef.current === "product-resting") {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerRestingToBento();
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToHero();
            return;
          }
          return;
        }

        if (stateRef.current === "product") {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToRing();
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            if (window.scrollY <= 10) {
              e.preventDefault();
              e.stopImmediatePropagation();
              triggerBentoToResting();
              return;
            }
          }
          return;
        }

        if (stateRef.current === "faq") {
          if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            const faqEl = document.getElementById("faq");
            const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
            if (window.scrollY <= faqTop + 30) {
              e.preventDefault();
              e.stopImmediatePropagation();
              jumpToAboutState(2);
              return;
            }
          }
          return;
        }
      };

      const handleScrollLock = () => {
        if (isNavigatingRef.current || stateRef.current === "faq") return;
        if (
          transitionAnimatingRef.current ||
          stateRef.current === "hero" ||
          stateRef.current === "product-resting" ||
          stateRef.current === "product" ||
          (stateRef.current === "ring" && transitionCompleteRef.current)
        ) {
          if (lockScrollYRef.current >= 0 && Math.abs(window.scrollY - lockScrollYRef.current) > 1) {
            window.scrollTo(0, lockScrollYRef.current);
          }
        } else if (stateRef.current === "about") {
          const pinEnd = lockScrollYRef.current || 0;
          if (pinEnd > 0 && window.scrollY < pinEnd - 20) {
            instantShowSecurity();
          }
        }
      };

      window.addEventListener("scroll", handleScrollLock, { passive: false, capture: true });
      window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("keydown", handleKeyDown, { capture: true });

      const handleResizeLines = () => {
        // No-op
      };
      window.addEventListener("resize", handleResizeLines);

      // Instant State Initializers (used when jumping back from FAQ / Contact)
      const instantShowProduct = () => {
        smoothScrollTo(0, { duration: 0.85, ease: "power2.inOut" });
        stateRef.current = "product";
        setIsAperturePaused(true);
        productCompleteRef.current = true;
        isHoldingProductRef.current = true;
        transitionStartedRef.current = false;
        transitionAnimatingRef.current = false;
        transitionCompleteRef.current = false;
        dispatchActiveSection("product");
        if (arrivalIdleTimeoutRef.current) {
          clearTimeout(arrivalIdleTimeoutRef.current);
          arrivalIdleTimeoutRef.current = null;
        }
        if (momentumDrainTimeoutRef.current) {
          clearTimeout(momentumDrainTimeoutRef.current);
          momentumDrainTimeoutRef.current = null;
        }
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
        if (productToRingTlRef.current) {
          productToRingTlRef.current.kill();
          productToRingTlRef.current = null;
        }
        companionCardRefs.current.forEach((compEl) => {
          if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
        });
        // Product has no Security content — clear any state (incl. state 7, which
        // carries the About "closing statement" text) left visible from a prior
        // visit to Security/About, so it can't bleed through behind the bento grid.
        if (securityStageRef.current) {
          gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden" });
        }
        securityStateRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, visibility: "hidden" });
        });
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
        applyPortalClip(maxRadiusPx, 50.0, 50.0);
        if (irisPortalRef.current) gsap.set(irisPortalRef.current, { autoAlpha: 1 });
        if (portalRimRef.current) gsap.set(portalRimRef.current, { autoAlpha: 0 });
        if (portalRippleRef.current) gsap.set(portalRippleRef.current, { autoAlpha: 0 });
        if (productWorldRef.current) {
          gsap.set(productWorldRef.current, {
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
          });
        }
        if (heroIntroRef.current) gsap.set(heroIntroRef.current, { autoAlpha: 0 });
        if (heroVisualRef.current) gsap.set(heroVisualRef.current, { opacity: 0, scale: 5.5, xPercent: -7.0, yPercent: 1.5 });
        if (headerRef.current) gsap.set(headerRef.current, { autoAlpha: 0 });
        if (headlineRef.current) gsap.set(headlineRef.current, { opacity: 0 });
        if (subheadRef.current) gsap.set(subheadRef.current, { opacity: 0 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, scale: 0.9 });
        if (cardsClusterRef.current) gsap.set(cardsClusterRef.current, { scaleX: 1, scaleY: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });

        const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const bento = computeBentoLayout(vw, vh);

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const flipper = cardFlipperRefs.current[i];
          const front = cardFrontRefs.current[i];
          if (wrapper) {
            const targetL = Math.round(bento.tileLefts[i]);
            const targetT = Math.round(bento.tileTops[i]);
            const targetW = bento.tileWidths[i];
            const targetH = bento.tileHeights[i];
            gsap.set(wrapper, {
              position: "absolute",
              left: targetL,
              top: targetT,
              width: targetW,
              height: targetH,
              x: 0,
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              scale: 1,
              zIndex: 10 + i,
            });
          }
          if (front) {
            gsap.set(front, {
              borderRadius: "24px",
              background: "",
              backgroundColor: "rgba(220, 235, 226, 0.74)",
              borderColor: "rgba(255, 255, 255, 0.60)",
              boxShadow:
                "0 28px 56px -14px rgba(12, 38, 24, 0.14), 0 10px 24px -8px rgba(34, 197, 94, 0.12), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.08)",
              backdropFilter: "blur(28px)",
            });
          }
          if (bentoTileContentRefs.current[i]) {
            gsap.set(bentoTileContentRefs.current[i], { autoAlpha: 1, y: 0 });
          }
          const back = cardBackRefs.current[i];
          if (back) gsap.set(back, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
          const grad = cardGradientBgRefs.current[i];
          if (grad) gsap.set(grad, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
          const glass = cardGlassOverlayRefs.current[i];
          if (glass) gsap.set(glass, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
          if (flipper) gsap.set(flipper, { rotateY: 0 });
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { autoAlpha: 0, visibility: "hidden" });
          const defEl = cardDefaultRefs.current[i];
          if (defEl) gsap.set(defEl, { autoAlpha: 0, visibility: "hidden" });
          const hoverEl = cardHoverRefs.current[i];
          if (hoverEl) gsap.set(hoverEl, { autoAlpha: 0, visibility: "hidden" });
        });

        companionCardRefs.current.forEach((compEl) => {
          if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
        });
      };

      const instantResetHero = () => {
        smoothScrollTo(0, { duration: 0.6, ease: "power2.inOut" });
        stateRef.current = "hero";
        setIsAperturePaused(false);
        productCompleteRef.current = false;
        isHoldingProductRef.current = false;
        transitionStartedRef.current = false;
        transitionAnimatingRef.current = false;
        transitionCompleteRef.current = false;
        dispatchActiveSection("hero");
        if (heroToProductTlRef.current) {
          heroToProductTlRef.current.kill();
          heroToProductTlRef.current = null;
        }
        if (restingToBentoTlRef.current) {
          restingToBentoTlRef.current.kill();
          restingToBentoTlRef.current = null;
        }
        if (arrivalIdleTimeoutRef.current) {
          clearTimeout(arrivalIdleTimeoutRef.current);
          arrivalIdleTimeoutRef.current = null;
        }
        if (momentumDrainTimeoutRef.current) {
          clearTimeout(momentumDrainTimeoutRef.current);
          momentumDrainTimeoutRef.current = null;
        }
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }
        if (productToRingTlRef.current) {
          productToRingTlRef.current.kill();
          productToRingTlRef.current = null;
        }
        companionCardRefs.current.forEach((compEl) => {
          if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
        });
        // Hero has no Security content — clear any state (incl. state 7, which
        // carries the About "closing statement" text) left visible from a prior
        // visit to Security/About, so it can't bleed through behind Hero/Product.
        if (securityStageRef.current) {
          gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden" });
        }
        securityStateRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, visibility: "hidden" });
        });
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
        portalState.radius = initialRadiusPx;
        portalState.x = 57.0;
        portalState.y = 48.5;
        applyPortalClip(initialRadiusPx, 57.0, 48.5);
        if (irisPortalRef.current) gsap.set(irisPortalRef.current, { autoAlpha: 0 });
        if (portalRimRef.current) gsap.set(portalRimRef.current, { autoAlpha: 0 });
        if (portalRippleRef.current) gsap.set(portalRippleRef.current, { autoAlpha: 0 });
        if (productWorldRef.current) {
          gsap.set(productWorldRef.current, {
            scale: 0.24,
            scaleX: 0.30,
            scaleY: 0.20,
            xPercent: 7.0,
            yPercent: -1.5,
            opacity: 0.25,
          });
        }
        if (heroIntroRef.current) gsap.set(heroIntroRef.current, { autoAlpha: 1, opacity: 1, x: 0, y: 0, scale: 1 });
        if (heroVisualRef.current) gsap.set(heroVisualRef.current, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 });
        if (headerRef.current) gsap.set(headerRef.current, { autoAlpha: 0, visibility: "hidden" });
        if (headlineRef.current) gsap.set(headlineRef.current, { opacity: 0, y: -25 });
        if (subheadRef.current) gsap.set(subheadRef.current, { opacity: 0, y: -15 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, scale: 0.9, y: -10 });
        if (floorLineRef.current) gsap.set(floorLineRef.current, { autoAlpha: 0, opacity: 0 });
        if (cardsClusterRef.current) {
          gsap.set(cardsClusterRef.current, { scaleX: 1.25, scaleY: 1.4, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });
        }

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const flipper = cardFlipperRefs.current[i];
          const front = cardFrontRefs.current[i];
          const bentoContent = bentoTileContentRefs.current[i];
          if (bentoContent) gsap.set(bentoContent, { autoAlpha: 0, y: 14 });
          if (wrapper) {
            const initialXOffset = (i - 2) * -16;
            wrapper.style.position = "";
            wrapper.style.left = "";
            wrapper.style.top = "";
            wrapper.style.width = "";
            wrapper.style.height = "";
            gsap.set(wrapper, {
              x: initialXOffset,
              y: card.restY,
              z: card.restZ,
              rotateX: 0,
              rotateY: card.restRotateY,
              rotateZ: card.restRotateZ,
              scale: 1,
            });
          }
          if (flipper) gsap.set(flipper, { rotateY: 180 });
          if (front) {
            gsap.set(front, {
              borderRadius: "0px",
              background: "",
              backgroundColor: "#070908",
              borderColor: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
            });
          }
          const back = cardBackRefs.current[i];
          if (back) gsap.set(back, { opacity: 1 });
          const grad = cardGradientBgRefs.current[i];
          if (grad) gsap.set(grad, { opacity: 1 });
          const glass = cardGlassOverlayRefs.current[i];
          if (glass) gsap.set(glass, { opacity: 0 });
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { opacity: 0.88, scale: 1, filter: "blur(0px)" });
          const defEl = cardDefaultRefs.current[i];
          if (defEl) gsap.set(defEl, { display: "flex", opacity: 1, autoAlpha: 1 });
        });
      };


      const instantShowSecurity = () => {
        if (aboutOrbitTweenRef.current) {
          aboutOrbitTweenRef.current.kill();
          aboutOrbitTweenRef.current = null;
        }
        if (aboutContentRef.current) {
          gsap.set(aboutContentRef.current, { opacity: 0, visibility: "hidden" });
        }

        if (consolidationTlRef.current) {
          consolidationTlRef.current.kill();
          consolidationTlRef.current = null;
        }
        isRingConsolidatedRef.current = false;

        if (typoEyesTlRef.current) { typoEyesTlRef.current.kill(); typoEyesTlRef.current = null; }
        if (pwdMaskTlRef.current) { pwdMaskTlRef.current.kill(); pwdMaskTlRef.current = null; }
        if (lockAnimTlRef.current) { lockAnimTlRef.current.kill(); lockAnimTlRef.current = null; }
        if (connectionAnimTlRef.current) { connectionAnimTlRef.current.kill(); connectionAnimTlRef.current = null; }
        if (indiaAnimTlRef.current) { indiaAnimTlRef.current.kill(); indiaAnimTlRef.current = null; }
        if (sellAnimTlRef.current) { sellAnimTlRef.current.kill(); sellAnimTlRef.current = null; }
        if (moneyAnimTlRef.current) { moneyAnimTlRef.current.kill(); moneyAnimTlRef.current = null; }

        stateRef.current = "ring";
        transitionStartedRef.current = true;
        transitionAnimatingRef.current = false;
        transitionCompleteRef.current = true;
        currentSecurityStateRef.current = 0;
        isHoldingProductRef.current = false;
        isSecurityTransitioningRef.current = false;
        lastSecurityScrollTimeRef.current = Date.now();

        const pinEnd = apertureScrollTriggerRef.current?.end ?? window.scrollY;
        lockScrollYRef.current = pinEnd;
        window.scrollTo(0, pinEnd);

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        if (stageRef.current) {
          stageRef.current.style.position = "fixed";
          stageRef.current.style.top = "0px";
          stageRef.current.style.left = "0px";
          stageRef.current.style.width = "100%";
          stageRef.current.style.height = "100vh";
          stageRef.current.style.zIndex = "40";
          gsap.set(stageRef.current, { opacity: 1, visibility: "visible" });
        }

        // Hide Hero elements
        gsap.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          { autoAlpha: 0, opacity: 0, visibility: "hidden" }
        );

        // Layout measurements
        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
        const vCenterX = Math.min(typeof window !== "undefined" ? window.innerWidth : 1440, DESKTOP_REFERENCE_WIDTH) / 2;
        const vhVal = typeof window !== "undefined" ? window.innerHeight : 800;
        const rRadius = Math.min(Math.max(vhVal * 0.22, 160), 220);
        const lShift = isDesk ? Math.round(vCenterX * 0.44) : isTab ? Math.round(vCenterX * 0.32) : Math.round(vCenterX * 0.20);
        const rightShift = rightShiftXRef.current || (isDesk ? Math.round(vCenterX * 0.42) : isTab ? Math.round(vCenterX * 0.30) : Math.round(vCenterX * 0.16));
        const shiftX = rightShift;

        const vwVal = typeof window !== "undefined" ? window.innerWidth : 1440;
        const restingWidth = isDesk ? 225 : isTab ? 195 : 175;
        const hRest = getCardRestHeight(vwVal);
        const clusterW = cardsClusterRef.current?.offsetWidth || Math.min(vwVal, 1340);
        const clusterH = cardsClusterRef.current?.offsetHeight || 370;
        const bento = computeBentoLayout(vwVal, vhVal);
        const targetCardLeft = Math.round(bento.tileLefts[2] + (bento.tileWidths[2] - restingWidth) / 2);
        const targetCardTop = Math.round(bento.tileTops[2] + (bento.tileHeights[2] - hRest) / 2);
        const stackTargetX = Math.round(targetCardLeft + restingWidth / 2 - clusterW / 2);
        const stackTargetY = Math.round(targetCardTop + hRest / 2 - clusterH / 2);

        origCentersRef.current = PRODUCT_CARDS.map(() => ({
          x: stackTargetX,
          y: stackTargetY,
        }));

        // Cards safely stored inside safe (hidden behind closed safe door)
        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        allProductCards.forEach((wrapper) => {
          gsap.set(wrapper, {
            opacity: 0,
            autoAlpha: 0,
            visibility: "hidden",
          });
        });

        companionCardRefs.current.forEach((compEl) => {
          if (compEl) gsap.set(compEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });

        // Dock safe to left side of viewport
        const fallbackX = isDesk ? -Math.round(vCenterX * 0.44) : -Math.round(vCenterX * 0.32);
        const leftX = targetLeftXRef.current !== 0 ? targetLeftXRef.current : fallbackX;
        const ringY = targetRingYRef.current !== 0 ? targetRingYRef.current : 18;
        stackTargetXRef.current = stackTargetX;
        stackTargetYRef.current = stackTargetY;
        cardsToSafeDeltaXRef.current = leftX - stackTargetX;
        cardsToSafeDeltaYRef.current = ringY - stackTargetY;

        if (safeContainerRef.current) {
          gsap.set(safeContainerRef.current, {
            xPercent: -50,
            yPercent: -50,
            x: leftX,
            y: ringY,
            opacity: 1,
            scale: 1,
            autoAlpha: 1,
            visibility: "visible",
          });
        }
        safeVault3DRef.current?.setOpenProgress(0);
        safeVault3DRef.current?.setCardsProgress?.(0);

        const clusterEl = cardsClusterRef.current;
        if (clusterEl) {
          gsap.set(clusterEl, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
          });
        }

        if (securityStageRef.current) {
          gsap.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 35 });
        }

        // Reset closing statements clip-paths
        if (closingBlackTextRef.current) {
          closingBlackTextRef.current.style.clipPath = "none";
          (closingBlackTextRef.current.style as any).webkitClipPath = "none";
        }
        if (closingGreenTextRef.current) {
          closingGreenTextRef.current.style.clipPath = "none";
          (closingGreenTextRef.current.style as any).webkitClipPath = "none";
        }

        // Show State 0 and hide all other states
        securityStateRefs.current.forEach((el, idx) => {
          if (el) {
            if (idx === 0) {
              gsap.set(el, {
                autoAlpha: 1,
                opacity: 1,
                visibility: "visible",
                x: shiftX,
                y: 0,
                scale: 1,
                clipPath: "none",
              });
            } else {
              gsap.set(el, {
                autoAlpha: 0,
                opacity: 0,
                visibility: "hidden",
                x: rightShift,
                y: 0,
              });
            }
          }
        });

        if (securityHeroRibbonRef.current) {
          gsap.set(securityHeroRibbonRef.current, { x: 0, opacity: 1 });
        }

        playMoneyAnimation();
        dispatchActiveSection("security");
      };

      // =======================================================================
      // UNIFIED NAVBAR NAVIGATION COORDINATOR
      // Seamlessly routes between all sections and internal states using existing
      // animations and ensuring intended initial state at each destination.
      // =======================================================================
      const navigateToSection = (targetSection: string) => {
        // Re-entrancy guard: a transition (nav-driven or scroll-driven) is already
        // in flight. Starting a second one here would fall through every branch
        // below unhandled (none of them account for a "sculpting" origin) and
        // permanently strand isNavigatingRef at true, which in turn permanently
        // blocks all scroll/wheel/touch/keyboard input site-wide. Instead, queue
        // this click and replay it the moment the in-flight transition lands on a
        // stable section — dispatchActiveSection flushes the queue on every such
        // landing, whether reached by scroll or by a previous nav click.
        if (
          isNavigatingRef.current ||
          transitionAnimatingRef.current ||
          isSecurityTransitioningRef.current ||
          stateRef.current === "sculpting"
        ) {
          pendingNavSectionRef.current = targetSection;
          return;
        }

        targetNavSectionRef.current = targetSection;

        // ---------------------------------------------------------------------
        // Destination: FAQ or Contact
        // ---------------------------------------------------------------------
        if (targetSection === "faq" || targetSection === "contact") {
          // If in Hero: per requirement, play Hero -> Product ring-enlargement transition first
          if (stateRef.current === "hero") {
            isNavigatingRef.current = true;
            onHeroToProductCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
              stateRef.current = "faq";
              lockScrollYRef.current = -1;
              document.documentElement.style.overflow = "";
              document.body.style.overflow = "";
              if (stageRef.current) {
                stageRef.current.style.position = "";
                stageRef.current.style.top = "";
                stageRef.current.style.left = "";
                stageRef.current.style.width = "";
                stageRef.current.style.height = "";
                stageRef.current.style.zIndex = "";
              }
              const targetEl = document.getElementById(targetSection);
              if (targetEl) {
                smoothScrollTo(targetEl, { offset: 75, duration: 0.9, ease: "power2.inOut" });
              }
            };
            triggerHeroToProduct();
            return;
          }

          if (stateRef.current === "about") {
            exitAboutToFaq();
            if (targetSection === "contact") {
              setTimeout(() => {
                const contactEl = document.getElementById("contact");
                if (contactEl) {
                  smoothScrollTo(contactEl, { offset: 75, duration: 0.9, ease: "power2.inOut" });
                }
              }, 450);
            }
            return;
          }

          stateRef.current = "faq";
          lockScrollYRef.current = -1;
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          if (stageRef.current) {
            stageRef.current.style.position = "";
            stageRef.current.style.top = "";
            stageRef.current.style.left = "";
            stageRef.current.style.width = "";
            stageRef.current.style.height = "";
            stageRef.current.style.zIndex = "";
          }
          const targetEl = document.getElementById(targetSection);
          if (targetEl) {
            smoothScrollTo(targetEl, { offset: 75, duration: 0.9, ease: "power2.inOut" });
          }
          return;
        }

        // ---------------------------------------------------------------------
        // If currently in FAQ/Contact territory (scrollY > 120 or state === "faq"):
        // Smooth scroll back to top 0, then enter destination in intended initial state
        // ---------------------------------------------------------------------
        if (stateRef.current === "faq" || (typeof window !== "undefined" && window.scrollY > 120)) {
          smoothScrollTo(0, {
            duration: 0.7,
            ease: "power2.inOut",
            onComplete: () => {
              if (targetSection === "hero") {
                instantResetHero();
              } else if (targetSection === "product") {
                instantShowProduct();
              } else if (targetSection === "security") {
                instantShowSecurity();
              } else if (targetSection === "about") {
                jumpToAboutState(1);
              }
            },
          });
          return;
        }

        // ---------------------------------------------------------------------
        // Destination: HERO
        // ---------------------------------------------------------------------
        if (targetSection === "hero") {
          if (stateRef.current === "hero") return;

          isNavigatingRef.current = true;
          if (stateRef.current === "about") {
            onRestoreStackCompletedRef.current = () => {
              onRingToProductCompletedRef.current = () => {
                onProductToHeroCompletedRef.current = () => {
                  isNavigatingRef.current = false;
                  targetNavSectionRef.current = null;
                };
                triggerProductToHero();
              };
              triggerRingToProduct();
            };
            restoreStackToRing();
            return;
          }

          if (stateRef.current === "ring") {
            onRingToProductCompletedRef.current = () => {
              onProductToHeroCompletedRef.current = () => {
                isNavigatingRef.current = false;
                targetNavSectionRef.current = null;
              };
              triggerProductToHero();
            };
            triggerRingToProduct();
            return;
          }

          if (stateRef.current === "product") {
            if (restingToBentoTlRef.current) {
              restingToBentoTlRef.current.kill();
              restingToBentoTlRef.current = null;
            }
            PRODUCT_CARDS.forEach((card, i) => {
              const wrapper = cardWrapperRefs.current[i];
              const flipper = cardFlipperRefs.current[i];
              const front = cardFrontRefs.current[i];
              const bentoContent = bentoTileContentRefs.current[i];
              if (bentoContent) gsap.set(bentoContent, { autoAlpha: 0, y: 14 });
              if (wrapper) {
                wrapper.style.position = "";
                wrapper.style.left = "";
                wrapper.style.top = "";
                wrapper.style.width = "";
                wrapper.style.height = "";
                gsap.set(wrapper, {
                  x: (i - 2) * -16,
                  y: card.restY,
                  z: card.restZ,
                  rotateX: 0,
                  rotateY: card.restRotateY,
                  rotateZ: card.restRotateZ,
                  scale: 1,
                });
              }
              if (flipper) gsap.set(flipper, { rotateY: 180 });
              if (front) {
                gsap.set(front, {
                  borderRadius: "0px",
                  backgroundColor: "#070908",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                });
              }
            });
            stateRef.current = "product-resting";
          }

          if (stateRef.current === "product-resting") {
            onProductToHeroCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
            };
            triggerProductToHero();
            return;
          }
        }

        // ---------------------------------------------------------------------
        // Destination: PRODUCT
        // ---------------------------------------------------------------------
        if (targetSection === "product") {
          if (stateRef.current === "product") {
            dispatchActiveSection("product");
            return;
          }

          // "product-resting" is only the teaser row reached mid-scroll from Hero —
          // the actual Product section content is the full bento grid. Play the
          // existing resting -> bento reveal so Product always opens fully, not
          // half-rendered.
          if (stateRef.current === "product-resting") {
            triggerRestingToBento();
            return;
          }

          isNavigatingRef.current = true;
          if (stateRef.current === "hero") {
            onHeroToProductCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
              triggerRestingToBento();
            };
            triggerHeroToProduct();
            return;
          }

          if (stateRef.current === "ring") {
            onRingToProductCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
            };
            triggerRingToProduct();
            return;
          }

          if (stateRef.current === "about") {
            onRestoreStackCompletedRef.current = () => {
              onRingToProductCompletedRef.current = () => {
                isNavigatingRef.current = false;
                targetNavSectionRef.current = null;
              };
              triggerRingToProduct();
            };
            restoreStackToRing();
            return;
          }
        }

        // ---------------------------------------------------------------------
        // Destination: SECURITY
        // ---------------------------------------------------------------------
        if (targetSection === "security") {
          if (stateRef.current === "ring") {
            if (currentSecurityStateRef.current > 0) {
              securityStateRefs.current.forEach((el, idx) => {
                if (el) gsap.set(el, { opacity: idx === 0 ? 1 : 0, visibility: idx === 0 ? "visible" : "hidden" });
              });
              currentSecurityStateRef.current = 0;
            }
            dispatchActiveSection("security");
            return;
          }

          isNavigatingRef.current = true;
          if (stateRef.current === "hero") {
            onHeroToProductCompletedRef.current = () => {
              if (restingToBentoTlRef.current) restingToBentoTlRef.current.kill();
              restingToBentoTlRef.current = createRestingToBentoTimeline();
              restingToBentoTlRef.current.progress(1);
              stateRef.current = "product";
              onProductToRingCompletedRef.current = () => {
                isNavigatingRef.current = false;
                targetNavSectionRef.current = null;
              };
              triggerProductToRing();
            };
            triggerHeroToProduct();
            return;
          }

          if (stateRef.current === "product-resting") {
            if (restingToBentoTlRef.current) restingToBentoTlRef.current.kill();
            restingToBentoTlRef.current = createRestingToBentoTimeline();
            restingToBentoTlRef.current.progress(1);
            stateRef.current = "product";
            onProductToRingCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
            };
            triggerProductToRing();
            return;
          }

          if (stateRef.current === "product") {
            onProductToRingCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
            };
            triggerProductToRing();
            return;
          }

          if (stateRef.current === "about") {
            onRestoreStackCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
            };
            restoreStackToRing();
            return;
          }
        }

        // ---------------------------------------------------------------------
        // Destination: ABOUT
        // ---------------------------------------------------------------------
        if (targetSection === "about") {
          if (stateRef.current === "about") {
            if (aboutDocPageRef.current !== 1) {
              if (docFlipperRef.current) gsap.to(docFlipperRef.current, { rotateY: 0, duration: 0.4, ease: "power2.inOut" });
              aboutDocPageRef.current = 1;
            }
            dispatchActiveSection("about");
            return;
          }

          isNavigatingRef.current = true;
          if (stateRef.current === "hero") {
            onHeroToProductCompletedRef.current = () => {
              if (restingToBentoTlRef.current) restingToBentoTlRef.current.kill();
              restingToBentoTlRef.current = createRestingToBentoTimeline();
              restingToBentoTlRef.current.progress(1);
              stateRef.current = "product";
              onProductToRingCompletedRef.current = () => {
                onConsolidateCompletedRef.current = () => {
                  isNavigatingRef.current = false;
                  targetNavSectionRef.current = null;
                };
                consolidateRingToStack();
              };
              triggerProductToRing();
            };
            triggerHeroToProduct();
            return;
          }

          if (stateRef.current === "product-resting") {
            if (restingToBentoTlRef.current) restingToBentoTlRef.current.kill();
            restingToBentoTlRef.current = createRestingToBentoTimeline();
            restingToBentoTlRef.current.progress(1);
            stateRef.current = "product";
            onProductToRingCompletedRef.current = () => {
              onConsolidateCompletedRef.current = () => {
                isNavigatingRef.current = false;
                targetNavSectionRef.current = null;
              };
              consolidateRingToStack();
            };
            triggerProductToRing();
            return;
          }

          if (stateRef.current === "product") {
            onProductToRingCompletedRef.current = () => {
              onConsolidateCompletedRef.current = () => {
                isNavigatingRef.current = false;
                targetNavSectionRef.current = null;
              };
              consolidateRingToStack();
            };
            triggerProductToRing();
            return;
          }

          if (stateRef.current === "ring") {
            if (currentSecurityStateRef.current > 0) {
              securityStateRefs.current.forEach((el, idx) => {
                if (el) gsap.set(el, { opacity: idx === 0 ? 1 : 0, visibility: idx === 0 ? "visible" : "hidden" });
              });
              currentSecurityStateRef.current = 0;
            }
            onConsolidateCompletedRef.current = () => {
              isNavigatingRef.current = false;
              targetNavSectionRef.current = null;
            };
            consolidateRingToStack();
            return;
          }
        }
      };

      const handleShowProduct = () => navigateToSection("product");
      const handleResetHero = () => navigateToSection("hero");
      const handleShowAbout = () => navigateToSection("about");
      const handleShowSecurity = () => navigateToSection("security");
      const handleShowFaq = () => navigateToSection("faq");

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

      return () => {
        window.removeEventListener("scroll", handleScrollLock, { capture: true });
        window.removeEventListener("wheel", handleWheel, { capture: true });
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove, { capture: true });
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("keydown", handleKeyDown, { capture: true });
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
        window.removeEventListener("resize", handleResizeLines);
        if (wheelGestureEndTimerRef.current) {
          clearTimeout(wheelGestureEndTimerRef.current);
          wheelGestureEndTimerRef.current = null;
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
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] select-none overflow-hidden"
    >
      {/* Anchor for Navbar #product navigation */}
      <div id="product" className="absolute top-[80vh] pointer-events-none" />
      {/* Anchor for Navbar #about navigation */}
      <div id="about" className="absolute top-[200vh] pointer-events-none" />

      {/* Master Viewport Stage: Fixed/Pinned at 100vh */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF8F5] flex flex-col justify-center"
      >
        {/* =================================================================== */}
        {/* LAYER 1 (z-10): MASTER HERO VISUAL (Aperture Video Ring)            */}
        {/* Centered optically at 57.0% X, 48.0% Y                              */}
        {/* =================================================================== */}
        <div
          ref={heroVisualRef}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform"
          style={{
            transformOrigin: "57.0% 48.5%",
          }}
        >
          <HeroApertureVisual isPaused={isAperturePaused} />
        </div>

        {/* =================================================================== */}
        {/* LAYER 2 (z-20): THE IRIS MASK PORTAL WINDOW                         */}
        {/* Controlled dynamically via numeric pixel clipping (zero GPU)        */}
        {/* =================================================================== */}
        <div
          ref={irisPortalRef}
          className="absolute inset-0 z-20 w-full h-full overflow-hidden pointer-events-auto bg-[#FAF8F5] will-change-[clip-path,opacity]"
          style={{
            opacity: 0,
          }}
        >
          {/* Transforming Product Scene Container */}
          <div
            ref={productWorldRef}
            className="relative w-full h-full flex flex-col justify-start items-center px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 md:pt-18 lg:pt-20 pb-4 sm:pb-6 overflow-hidden select-none will-change-transform"
          >
            {/* =================================================================== */}
            {/* LAYER: ABOUT SECTION CINEMATIC BACKGROUND & VOLUMETRIC ATMOSPHERE   */}
            {/* Strictly background layer positioned behind envelope and document   */}
            {/* =================================================================== */}
            <div
              ref={aboutContentRef}
              className="absolute inset-0 pointer-events-none overflow-hidden will-change-[opacity]"
              style={{ opacity: 0, visibility: "hidden", zIndex: 0 }}
            >
              {/* 1. Lighter, subtle, luminous ambient sage-green wash over clean base */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 120% 90% at 50% 18%, rgba(228, 242, 234, 0.85) 0%, rgba(220, 238, 227, 0.60) 35%, rgba(235, 246, 240, 0.35) 70%, transparent 100%)",
                }}
              />

              {/* 2. Soft, ultra-delicate peripheral light falloff (very subtle, non-intrusive) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 95% 85% at 50% 50%, transparent 60%, rgba(12, 38, 24, 0.04) 85%, rgba(6, 22, 14, 0.09) 100%)",
                }}
              />

              {/* 3. Volumetric God Ray 1: Soft, translucent shaft from top-left */}
              <div
                className="absolute -top-24 -left-20 w-[60vw] max-w-[864px] h-[120vh] pointer-events-none -rotate-[22deg] origin-top-left opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(34, 197, 94, 0.12) 0%, rgba(74, 222, 128, 0.05) 25%, rgba(16, 185, 129, 0.01) 55%, transparent 75%)",
                  filter: "blur(35px)",
                }}
              />

              {/* 4. Volumetric God Ray 2: Soft, translucent shaft from top-right */}
              <div
                className="absolute -top-24 -right-20 w-[55vw] max-w-[792px] h-[120vh] pointer-events-none rotate-[25deg] origin-top-right opacity-50"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(52, 211, 153, 0.10) 0%, rgba(34, 197, 94, 0.04) 25%, rgba(16, 185, 129, 0.01) 50%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />

              {/* 5. Overhead Central Luminous Light Cone */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[75vw] max-w-[1000px] h-[50vh] pointer-events-none opacity-60"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(34, 197, 94, 0.13) 0%, rgba(74, 222, 128, 0.05) 35%, transparent 75%)",
                  filter: "blur(30px)",
                }}
              />

              {/* 6. Atmospheric Backlight Halo behind Envelope for pristine edge definition */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[900px] h-[420px] pointer-events-none opacity-70"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(34, 197, 94, 0.10) 0%, rgba(74, 222, 128, 0.03) 40%, transparent 75%)",
                  filter: "blur(45px)",
                }}
              />

              {/* 7. Subtle Ethereal Ribbon Waves (Delicate translucent emerald caustics) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-20 overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 1440 900"
              >
                <defs>
                  <linearGradient id="causticRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(74, 222, 128, 0)" />
                    <stop offset="25%" stopColor="rgba(74, 222, 128, 0.22)" />
                    <stop offset="50%" stopColor="rgba(34, 197, 94, 0.30)" />
                    <stop offset="75%" stopColor="rgba(34, 197, 94, 0.12)" />
                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                  </linearGradient>
                  <linearGradient id="causticRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(52, 211, 153, 0)" />
                    <stop offset="30%" stopColor="rgba(52, 211, 153, 0.18)" />
                    <stop offset="60%" stopColor="rgba(34, 197, 94, 0.22)" />
                    <stop offset="85%" stopColor="rgba(34, 197, 94, 0.08)" />
                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                  </linearGradient>
                  <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="12" />
                  </filter>
                </defs>
                <path
                  d="M -100 520 C 320 680, 600 320, 960 460 C 1200 560, 1400 420, 1600 480"
                  fill="none"
                  stroke="url(#causticRibbon1)"
                  strokeWidth="3.5"
                  filter="url(#ribbonGlow)"
                />
                <path
                  d="M -80 380 C 260 260, 580 540, 920 380 C 1180 260, 1380 440, 1560 360"
                  fill="none"
                  stroke="url(#causticRibbon2)"
                  strokeWidth="2.8"
                  filter="url(#ribbonGlow)"
                />
              </svg>

              {/* 8. Restrained Floating Atmospheric Dust Motes */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[
                  { left: "18%", top: "22%", size: 2.2, delay: "0s", dur: "10s", op: 0.25 },
                  { left: "26%", top: "34%", size: 1.8, delay: "2.5s", dur: "12s", op: 0.20 },
                  { left: "35%", top: "18%", size: 2.0, delay: "1.2s", dur: "9s", op: 0.28 },
                  { left: "42%", top: "28%", size: 1.5, delay: "4.1s", dur: "14s", op: 0.16 },
                  { left: "55%", top: "15%", size: 2.0, delay: "0.8s", dur: "11s", op: 0.26 },
                  { left: "64%", top: "25%", size: 1.6, delay: "3.2s", dur: "13s", op: 0.20 },
                  { left: "72%", top: "19%", size: 2.2, delay: "1.8s", dur: "10s", op: 0.30 },
                  { left: "80%", top: "32%", size: 1.7, delay: "5.0s", dur: "12s", op: 0.18 },
                  { left: "22%", top: "58%", size: 1.8, delay: "2.1s", dur: "11s", op: 0.22 },
                  { left: "78%", top: "54%", size: 2.0, delay: "3.8s", dur: "13s", op: 0.24 },
                  { left: "85%", top: "42%", size: 1.5, delay: "1.5s", dur: "15s", op: 0.15 },
                  { left: "14%", top: "40%", size: 1.8, delay: "4.7s", dur: "12s", op: 0.18 },
                ].map((mote, mIdx) => (
                  <div
                    key={mIdx}
                    className="absolute rounded-full pointer-events-none will-change-transform"
                    style={{
                      left: mote.left,
                      top: mote.top,
                      width: `${mote.size}px`,
                      height: `${mote.size}px`,
                      backgroundColor: "rgba(34, 197, 94, 0.75)",
                      boxShadow: "0 0 5px rgba(74, 222, 128, 0.5)",
                      opacity: mote.op,
                      animation: `dustDrift ${mote.dur} ease-in-out infinite alternate`,
                      animationDelay: mote.delay,
                    }}
                  />
                ))}
              </div>

              {/* 9. Delicate Analog Cinematic Grain Texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
              />

              {/* Ambient Top and Bottom Hairlines */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
            </div>

            {/* 3D Perspective Cards Amphitheater Stage - Prominently in upper/middle viewport */}
            <div
              ref={cardsStageRef}
              className="w-full flex items-center justify-center relative shrink-0 pt-1 sm:pt-2 pb-1"
              style={{ perspective: "1400px", zIndex: 30 }}
            >
              <div
                ref={cardsClusterRef}
                className="relative flex items-center justify-center gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-3.5 xl:gap-4 w-full max-w-[1340px] mx-auto overflow-visible py-1.5 px-2 no-scrollbar will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                {PRODUCT_CARDS.map((card, idx) => {
                  const slotK = idx;
                  const angleNorm = (slotK / 26) * 2 * Math.PI;
                  const cosA = Math.cos(angleNorm);
                  const sinA = Math.sin(angleNorm);
                  const specularTop = Math.min(Math.max(0.55 + 0.30 * cosA, 0.20), 0.88);
                  const specularLeft = Math.min(Math.max(0.40 + 0.25 * sinA, 0.15), 0.70);
                  const emeraldRefract = 0.20 + 0.10 * Math.sin(angleNorm + Math.PI / 3);

                  return (
                    <div
                      key={card.id}
                      ref={(el) => {
                        cardWrapperRefs.current[idx] = el;
                      }}
                      className="relative shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[285px] sm:h-[310px] md:h-[330px] lg:h-[345px] xl:h-[360px] 2xl:h-[375px] cursor-default will-change-transform"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div
                        ref={(el) => {
                          cardFlipperRefs.current[idx] = el;
                        }}
                        className="relative w-full h-full will-change-transform"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* CARD FRONT FACE (Light Frosted Architectural Glass) */}
                        <div
                          ref={(el) => {
                            cardFrontRefs.current[idx] = el;
                          }}
                          className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden will-change-transform flex flex-col justify-between"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            backgroundColor: "rgba(255, 255, 255, 0.74)",
                            border: "1px solid rgba(255, 255, 255, 0.75)",
                            boxShadow:
                              "0 20px 45px -12px rgba(16, 44, 28, 0.08), 0 8px 18px -6px rgba(0, 0, 0, 0.04), 0 0 20px -4px rgba(34, 197, 94, 0.08), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95), inset 0 0.5px 0.5px 0 rgba(255, 255, 255, 0.8), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.06)",
                          }}
                        >
                          {/* Multi-Tone Organic Frosted Glass Gradient (Warm ivory -> Faint mint -> Cool translucent) */}
                          <div
                            ref={(el) => {
                              cardGradientBgRefs.current[idx] = el;
                            }}
                            className="absolute inset-0 overflow-hidden pointer-events-none rounded-[20px] will-change-[opacity]"
                          >
                            {/* Layer 1: Soft Multi-Tone Diagonal Wash */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  "linear-gradient(155deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 253, 250, 0.72) 35%, rgba(240, 249, 244, 0.62) 70%, rgba(232, 246, 238, 0.55) 100%)",
                              }}
                            />
                            {/* Layer 2: Subtle Organic Atmospheric Mint & Unifolio Green Aura */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  idx === 0
                                    ? "radial-gradient(ellipse 90% 75% at 85% 85%, rgba(34, 197, 94, 0.16) 0%, rgba(16, 185, 129, 0.06) 40%, transparent 75%), radial-gradient(ellipse 70% 50% at 15% 15%, rgba(255, 255, 255, 0.95) 0%, transparent 65%)"
                                    : idx === 1
                                    ? "radial-gradient(ellipse 85% 70% at 50% 90%, rgba(34, 197, 94, 0.13) 0%, rgba(20, 184, 166, 0.05) 45%, transparent 70%), radial-gradient(ellipse 75% 55% at 20% 12%, rgba(255, 255, 255, 0.95) 0%, transparent 65%)"
                                    : idx === 2
                                    ? "radial-gradient(ellipse 80% 70% at 50% 85%, rgba(34, 197, 94, 0.14) 0%, rgba(16, 185, 129, 0.05) 45%, transparent 70%), radial-gradient(ellipse 70% 50% at 50% 15%, rgba(255, 255, 255, 0.95) 0%, transparent 65%)"
                                    : idx === 3
                                    ? "radial-gradient(ellipse 85% 70% at 20% 85%, rgba(34, 197, 94, 0.14) 0%, rgba(5, 150, 105, 0.05) 45%, transparent 70%), radial-gradient(ellipse 75% 55% at 80% 15%, rgba(255, 255, 255, 0.95) 0%, transparent 65%)"
                                    : "radial-gradient(ellipse 90% 75% at 85% 25%, rgba(34, 197, 94, 0.15) 0%, rgba(74, 222, 128, 0.06) 40%, transparent 75%), radial-gradient(ellipse 70% 50% at 15% 85%, rgba(255, 255, 255, 0.95) 0%, transparent 65%)",
                              }}
                            />
                            {/* Layer 3: Top Specular Bevel Highlight Line */}
                            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none" />
                          </div>

                          {/* Smoked Emerald Translucent Glass Overlay (Matching Companion Cards & 'Cards ring.png') */}
                          <div
                            ref={(el) => {
                              cardGlassOverlayRefs.current[idx] = el;
                            }}
                            className="absolute inset-0 pointer-events-none rounded-[20px] overflow-hidden will-change-[opacity]"
                            style={{ opacity: 0 }}
                          >
                            {/* Internal Volume Refraction Radial Lights */}
                            <div
                              className="absolute inset-0 pointer-events-none rounded-[20px]"
                              style={{
                                background:
                                  `radial-gradient(ellipse 75% 60% at 22% 20%, rgba(34, 197, 94, ${(emeraldRefract * 0.35).toFixed(2)}) 0%, rgba(16, 185, 129, 0.03) 40%, transparent 68%), ` +
                                  `radial-gradient(ellipse 75% 55% at 80% 82%, rgba(34, 197, 94, ${(emeraldRefract * 0.45).toFixed(2)}) 0%, rgba(74, 222, 128, 0.04) 38%, transparent 65%)`,
                              }}
                            />
                            {/* Diagonal Glass Sheen */}
                            <div
                              className="absolute inset-0 pointer-events-none rounded-[20px]"
                              style={{
                                background:
                                  "linear-gradient(125deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.01) 25%, transparent 50%, rgba(34, 197, 94, 0.04) 80%, rgba(74, 222, 128, 0.10) 100%)",
                              }}
                            />
                            {/* Top Specular Bevel Highlight Line */}
                            <div
                              className="absolute inset-x-0 top-0 h-[1.5px] pointer-events-none rounded-t-[20px]"
                              style={{
                                background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, ${specularTop.toFixed(2)}) 20%, rgba(74, 222, 128, ${(specularTop * 0.7).toFixed(2)}) 65%, transparent 100%)`,
                              }}
                            />
                            {/* Left Specular Bevel Catch Line */}
                            <div
                              className="absolute inset-y-0 left-0 w-[1.5px] pointer-events-none rounded-l-[20px]"
                              style={{
                                background: `linear-gradient(180deg, rgba(255, 255, 255, ${specularLeft.toFixed(2)}) 0%, rgba(34, 197, 94, ${(specularLeft * 0.6).toFixed(2)}) 45%, transparent 100%)`,
                              }}
                            />
                            {/* Bottom Emerald Light-Piping Line */}
                            <div
                              className="absolute inset-x-0 bottom-0 h-[1.5px] pointer-events-none rounded-b-[20px]"
                              style={{
                                background: "linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.65) 50%, rgba(74, 222, 128, 0.45) 100%)",
                              }}
                            />
                          </div>

                          {/* 2D Sketch Illustration Asset (Centered, Clean 2D Linework) */}
                          <div
                            ref={(el) => {
                              cardIllustrationRefs.current[idx] = el;
                            }}
                            className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col items-center justify-end pb-3 sm:pb-4 will-change-[opacity,transform,filter]"
                            style={{ opacity: 0.88 }}
                          >
                            <div
                              className={`relative ${
                                idx === 0
                                  ? "w-[136px] sm:w-[145px] md:w-[155px] lg:w-[160px] h-[175px] sm:h-[185px] md:h-[195px] mb-2"
                                  : idx === 1
                                  ? "w-[168px] sm:w-[178px] md:w-[188px] lg:w-[195px] h-[165px] sm:h-[175px] md:h-[185px] mb-2"
                                  : idx === 2
                                  ? "w-[138px] sm:w-[146px] md:w-[156px] lg:w-[162px] h-[175px] sm:h-[185px] md:h-[195px] mb-2"
                                  : idx === 3
                                  ? "w-[158px] sm:w-[168px] md:w-[178px] lg:w-[185px] h-[165px] sm:h-[175px] md:h-[185px] mb-2"
                                  : "w-[136px] sm:w-[145px] md:w-[155px] lg:w-[160px] h-[175px] sm:h-[185px] md:h-[195px] mb-2"
                              }`}
                            >
                              <img
                                src={card.illustration}
                                alt={card.title}
                                className="w-full h-full object-contain object-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                                draggable={false}
                              />
                            </div>
                          </div>

                          {/* Default Resting Centered Content */}
                          <div
                            ref={(el) => {
                              cardDefaultRefs.current[idx] = el;
                            }}
                            data-card-text="true"
                            className="product-card-text absolute inset-0 z-15 flex flex-col items-start justify-start pt-7 sm:pt-8 px-6 text-left pointer-events-none select-none will-change-transform"
                          >
                            <span className="font-mono text-[10px] sm:text-xs font-black text-[#22c55e] tracking-widest uppercase mb-1.5">
                              {card.num}
                            </span>
                            <h3 className="font-sans font-black text-sm sm:text-base md:text-lg lg:text-xl xl:text-[21px] text-[#0C140E] leading-[1.20] tracking-tight max-w-[190px]">
                              {card.title}
                            </h3>
                          </div>

                          {/* Expanded Hover Reading Content */}
                          <div
                            ref={(el) => {
                              cardHoverRefs.current[idx] = el;
                            }}
                            data-card-text="true"
                            className="product-card-text absolute inset-0 z-20 flex flex-col items-center justify-center px-3.5 sm:px-4.5 py-4 sm:py-5 text-center pointer-events-none will-change-transform"
                            style={{
                              opacity: 0,
                              transform: "translateY(8px)",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center w-full h-full space-y-1.5 sm:space-y-2">
                              <span className="font-mono text-[10px] sm:text-xs font-black text-[#22c55e] tracking-widest uppercase">
                                {card.num}
                              </span>
                              <h3 className="font-sans font-extrabold text-sm sm:text-base md:text-lg lg:text-[19px] xl:text-[20px] text-[#0C140E] leading-tight tracking-[-0.03em] text-center">
                                {card.title}
                              </h3>

                              {card.hoverType === "paragraph" ? (
                                <p className="text-xs sm:text-[13px] md:text-sm text-neutral-700 font-medium leading-[1.46] text-center max-w-[280px]">
                                  {card.hoverParagraph}
                                </p>
                              ) : (
                                <div className="space-y-1 sm:space-y-1.5 text-center w-full flex-1 flex flex-col justify-center">
                                  {card.hoverBullets?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="text-[10px] sm:text-[11px] md:text-[11.5px] text-neutral-700 font-medium leading-[1.32] sm:leading-[1.35]">
                                      <span className="font-bold text-[#059669] mr-1">
                                        {bullet.label}
                                      </span>
                                      <span className="text-neutral-700 font-medium">
                                        {bullet.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* =================================================================== */}
                          {/* BENTO TILE RICH GLASS CONTENT (Activated during Bento State)        */}
                          {/* =================================================================== */}
                          <div
                            ref={(el) => {
                              bentoTileContentRefs.current[idx] = el;
                            }}
                            className="absolute inset-0 z-30 px-5 py-4 sm:px-6 sm:py-4.5 lg:px-6.5 lg:py-5 flex flex-col justify-between pointer-events-auto opacity-0 will-change-[opacity,transform] overflow-hidden select-text text-neutral-900"
                          >
                            {/* Bento Subtle Deeper Glass Atmospheric Gradient Layer */}
                            <div
                              className="absolute inset-0 pointer-events-none rounded-[24px] -z-10"
                              style={{
                                background:
                                  "linear-gradient(150deg, rgba(232, 243, 236, 0.62) 0%, rgba(214, 232, 221, 0.50) 50%, rgba(196, 222, 209, 0.42) 100%), " +
                                  (idx === 0
                                    ? "radial-gradient(ellipse 85% 70% at 85% 85%, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 75%)"
                                    : idx === 1
                                    ? "radial-gradient(ellipse 80% 70% at 85% 85%, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.09) 45%, transparent 75%)"
                                    : idx === 2
                                    ? "radial-gradient(ellipse 85% 70% at 50% 90%, rgba(34, 197, 94, 0.20) 0%, rgba(20, 184, 166, 0.08) 45%, transparent 75%)"
                                    : idx === 3
                                    ? "radial-gradient(ellipse 85% 70% at 15% 85%, rgba(34, 197, 94, 0.20) 0%, rgba(5, 150, 105, 0.08) 45%, transparent 75%)"
                                    : "radial-gradient(ellipse 90% 75% at 85% 85%, rgba(34, 197, 94, 0.22) 0%, rgba(74, 222, 128, 0.09) 45%, transparent 75%)"),
                              }}
                            />
                            {/* Bento Top Specular Bevel Highlight Line */}
                            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none -z-10" />
                            {idx === 0 ? (
                              // TILE 01: Understand what you own
                              <div className="flex flex-col h-full justify-between">
                                <div>
                                  <h3 className="font-sans font-black text-2xl sm:text-3xl lg:text-[32px] tracking-[-0.035em] text-neutral-950 leading-[1.12]">
                                    <span className="text-[#22C55E]">Understand</span> what you own
                                  </h3>
                                </div>

                                {/* Vertical Floating Information Layout */}
                                <div className="flex flex-col justify-between flex-1 mt-5 sm:mt-6 gap-3.5 sm:gap-4.5">
                                  {/* Item 1: Overlap Check */}
                                  <div className="flex items-start gap-2.5 sm:gap-3">
                                    <img
                                      src="/bento-icons/stacked-sheets.png"
                                      alt="Overlap Check"
                                      className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-neutral-700 font-medium leading-[1.44] sm:leading-[1.48]">
                                      <strong className="font-bold text-neutral-950">Overlap Check.</strong>{" "}
                                      Spot when &quot;diversified&quot; funds are secretly the same bet.
                                    </p>
                                  </div>

                                  {/* Item 2: Performance, in Context */}
                                  <div className="flex items-start gap-2.5 sm:gap-3">
                                    <img
                                      src="/bento-icons/rising-graph.png"
                                      alt="Performance, in Context"
                                      className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-neutral-700 font-medium leading-[1.44] sm:leading-[1.48]">
                                      <strong className="font-bold text-neutral-950">Performance, in Context.</strong>{" "}
                                      Real returns, measured against what matters.
                                    </p>
                                  </div>

                                  {/* Item 3: Hidden Fee Finder */}
                                  <div className="flex items-start gap-2.5 sm:gap-3">
                                    <img
                                      src="/bento-icons/rupee-coin.png"
                                      alt="Hidden Fee Finder"
                                      className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-neutral-700 font-medium leading-[1.44] sm:leading-[1.48]">
                                      <strong className="font-bold text-neutral-950">Hidden Fee Finder.</strong>{" "}
                                      What expense ratios are quietly costing you.
                                    </p>
                                  </div>

                                  {/* Item 4: Peer Benchmarking */}
                                  <div className="flex items-start gap-2.5 sm:gap-3">
                                    <img
                                      src="/bento-icons/people-group.png"
                                      alt="Peer Benchmarking"
                                      className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-neutral-700 font-medium leading-[1.44] sm:leading-[1.48]">
                                      <strong className="font-bold text-neutral-950">Peer Benchmarking.</strong>{" "}
                                      Compared against people like you, not a generic index.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : idx === 1 ? (
                              // TILE 02: Skip the dashboards. Just ask
                              <div className="flex h-full items-center justify-between gap-3 sm:gap-4">
                                <div className="max-w-[260px] sm:max-w-[290px] lg:max-w-[315px] flex flex-col justify-start shrink-0">
                                  <h3 className="font-sans font-black text-xl sm:text-2xl lg:text-[26px] tracking-[-0.03em] text-neutral-950 leading-tight">
                                    Skip the dashboards. <span className="text-[#22C55E]">Just ask</span>
                                  </h3>
                                  <p className="mt-2.5 text-[13px] sm:text-[14px] lg:text-[14.5px] text-neutral-700 font-medium leading-[1.48]">
                                    Not a chart. A question. Ask what&apos;s dragging your returns, whether you&apos;re overexposed, or if a decision makes sense, and get an answer from your own portfolio.
                                  </p>
                                </div>

                                {/* Hand-drawn Speech Bubbles Sketch - Bigger & prominent */}
                                <div className="relative flex-1 h-full min-h-0 flex items-center justify-center sm:justify-end pointer-events-none -my-1 sm:-my-2 translate-x-0.5 sm:translate-x-1.5 lg:translate-x-2">
                                  <img
                                    src="/product-cards/card-2d-1.png"
                                    alt="Conversational Question Intelligence"
                                    className="w-auto h-full max-h-[250px] sm:max-h-[275px] lg:max-h-[295px] object-contain drop-shadow-sm scale-[1.28] sm:scale-[1.34] lg:scale-[1.38] origin-center sm:origin-right"
                                  />
                                </div>
                              </div>
                            ) : idx === 2 ? (
                              // TILE 03: See everything
                              <div className="flex flex-col h-full justify-start">
                                <h3 className="font-sans font-black text-2xl sm:text-3xl lg:text-[32px] tracking-[-0.035em] text-neutral-950 leading-[1.12]">
                                  See <span className="text-[#22C55E]">everything</span>
                                </h3>
                                <p className="mt-3 sm:mt-3.5 text-[13.5px] sm:text-[14.5px] lg:text-[15.5px] text-neutral-700 font-medium leading-relaxed">
                                  Mutual funds, stocks, bank accounts, loans, credit cards, real estate. Every asset and liability, aggregated into one accurate number.
                                </p>
                              </div>
                            ) : idx === 3 ? (
                              // TILE 04: Know your risk
                              <div className="relative flex flex-col h-full justify-start">
                                <h3 className="font-sans font-black text-xl sm:text-2xl lg:text-[25px] tracking-[-0.03em] text-neutral-950 leading-tight mb-3 sm:mb-3.5 relative z-10">
                                  Know your <span className="text-[#22C55E]">risk</span>
                                </h3>

                                {/* 2 × 2 Floating Information Layout (No sub-cards, no borders, no backgrounds) */}
                                <div className="grid grid-cols-2 gap-x-5 sm:gap-x-7 gap-y-3 sm:gap-y-3.5 flex-1 relative z-10">
                                  {/* Item 1: Family Runway */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/pulse-line.png"
                                      alt="Family Runway"
                                      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                      <strong className="font-bold text-neutral-950">Family Runway.</strong>{" "}
                                      How long your family&apos;s savings would actually last.
                                    </p>
                                  </div>

                                  {/* Item 2: Real Safety Cushion */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/shield.png"
                                      alt="Real Safety Cushion"
                                      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                      <strong className="font-bold text-neutral-950">Real Safety Cushion.</strong>{" "}
                                      Built from your real numbers, not a generic rule of thumb.
                                    </p>
                                  </div>

                                  {/* Item 3: Sleeping Money */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/stacked-coins.png"
                                      alt="Sleeping Money"
                                      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                      <strong className="font-bold text-neutral-950">Sleeping Money.</strong>{" "}
                                      Surplus cash sitting idle.
                                    </p>
                                  </div>

                                  {/* Item 4: Family Risk Map */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/people-group-alt.png"
                                      alt="Family Risk Map"
                                      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                      <strong className="font-bold text-neutral-950">Family Risk Map.</strong>{" "}
                                      Where your family is financially exposed.
                                    </p>
                                  </div>
                                </div>

                              </div>
                            ) : (
                              // TILE 05: Plan Ahead
                              <div className="relative flex flex-col h-full justify-start">
                                <h3 className="font-sans font-black text-xl sm:text-2xl lg:text-[25px] tracking-[-0.03em] text-neutral-950 leading-tight mb-2.5 sm:mb-3 relative z-10">
                                  <span className="text-[#22C55E]">Plan</span> Ahead
                                </h3>

                                {/* 5 Floating Information Clusters */}
                                <div className="flex flex-col justify-start flex-1 relative z-10">
                                  {/* Featured Anchor Item 1: Financial Snapshot */}
                                  <div className="flex items-start gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
                                    <img
                                      src="/bento-icons/rising-graph.png"
                                      alt="Financial Snapshot"
                                      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                      <strong className="font-bold text-neutral-950">Financial Snapshot.</strong>{" "}
                                      Always know where you stand.
                                    </p>
                                  </div>

                                  {/* 2 × 2 Balanced Floating Grid for the 4 Scenarios */}
                                  <div className="grid grid-cols-2 gap-x-5 sm:gap-x-7 gap-y-2 sm:gap-y-2.5">
                                    {/* Item 2: Stress Test */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/target.png"
                                        alt="Stress Test"
                                        className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                        <strong className="font-bold text-neutral-950">Stress Test.</strong>{" "}
                                        See how you&apos;d hold up in a crash.
                                      </p>
                                    </div>

                                    {/* Item 3: "What if I..." */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/question-bubble.png"
                                        alt="What if I..."
                                        className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                        <strong className="font-bold text-neutral-950">&quot;What if I...&quot;.</strong>{" "}
                                        Model a decision before you make it.
                                      </p>
                                    </div>

                                    {/* Item 4: Goal Readiness Score */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/flag.png"
                                        alt="Goal Readiness Score"
                                        className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                        <strong className="font-bold text-neutral-950">Goal Readiness Score.</strong>{" "}
                                        Every goal, tracked as one score.
                                      </p>
                                    </div>

                                    {/* Item 5: Succession Readiness */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/ascending-steps.png"
                                        alt="Succession Readiness"
                                        className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p className="text-[12.5px] sm:text-[13.5px] lg:text-[14px] text-neutral-700 font-medium leading-[1.38] sm:leading-[1.4]">
                                        <strong className="font-bold text-neutral-950">Succession Readiness.</strong>{" "}
                                        Is your family prepared without you.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            )}
                          </div>
                        </div>

                        {/* CARD BACK FACE (Minimalist Solid Black Obsidian) */}
                        <div
                          ref={(el) => {
                            cardBackRefs.current[idx] = el;
                          }}
                          data-card-text="true"
                          className="product-card-text absolute inset-0 w-full h-full rounded-[20px] overflow-hidden bg-[#000000] border border-white/12 shadow-2xl p-4 sm:p-5 flex flex-col justify-between will-change-transform"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            opacity: 0,
                            visibility: "hidden",
                          }}
                        >
                          <div className="flex items-center justify-between z-10">
                            <span className="font-mono text-[11px] text-neutral-500 tracking-widest">
                              UNIFOLIO // {card.num}
                            </span>
                            <Sparkles className="w-3 h-3 text-neutral-600" />
                          </div>

                          <div className="flex flex-col items-center justify-center my-auto z-10">
                            <div className="relative w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950">
                              <div className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-neutral-400" />
                              </div>
                            </div>
                            <span className="mt-3 font-mono text-[8px] tracking-[0.25em] text-neutral-600 uppercase">
                              INTELLIGENCE
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-neutral-900 pt-2.5 z-10">
                            <span className="font-sans font-bold text-[10px] tracking-wider text-neutral-400 uppercase">
                              UNIFOLIO
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          </div>
                        </div>

                        {/* INK / SKETCH LAYER: Architectural drafting style matching sketch vault */}
                        <div
                          ref={(el) => {
                            cardInkRefs.current[idx] = el;
                          }}
                          className="absolute inset-0 w-full h-full rounded-[20px] pointer-events-none will-change-[opacity,transform] overflow-hidden"
                          style={{
                            opacity: 0,
                            transformStyle: "preserve-3d",
                          }}
                        >
                          {/* Outer Fine Drafting Pen Border */}
                          <div
                            className="absolute inset-0 rounded-[20px] pointer-events-none"
                            style={{
                              border: "1.2px solid rgba(42, 50, 46, 0.85)",
                              boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.25)",
                            }}
                          />

                          {/* Inner Technical Border Guideline */}
                          <div
                            className="absolute inset-[6px] rounded-[15px] pointer-events-none"
                            style={{
                              border: "0.8px dashed rgba(60, 72, 66, 0.45)",
                            }}
                          />

                          {/* Technical Crosshairs at Corners */}
                          <div className="absolute top-0 left-4 w-3.5 h-[1px] bg-neutral-700/60" />
                          <div className="absolute top-4 left-0 w-[1px] h-3.5 bg-neutral-700/60" />
                          <div className="absolute bottom-0 right-4 w-3.5 h-[1px] bg-neutral-700/60" />
                          <div className="absolute bottom-4 right-0 w-[1px] h-3.5 bg-neutral-700/60" />

                          {/* Ink Content: Monospace metadata & technical lineart */}
                          <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-800 font-semibold">
                                INK // {card.num}
                              </span>
                              <div className="w-3.5 h-3.5 rounded-full border border-neutral-700/75 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                              </div>
                            </div>

                            {/* Center Blueprint Emblem: Concentric circles with crosshairs like vault dial */}
                            <div className="flex flex-col items-center justify-center my-auto">
                              <div className="relative w-12 h-12 rounded-full border border-neutral-700/75 flex items-center justify-center">
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[0.8px] bg-neutral-700/55" />
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[0.8px] bg-neutral-700/55" />
                                <div className="w-6 h-6 rounded-full border border-neutral-600/60 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full border border-[#16a34a] bg-[#22c55e]/20" />
                                </div>
                              </div>
                              <span className="mt-2.5 font-mono text-[8.5px] tracking-[0.22em] text-neutral-700 uppercase font-semibold">
                                {card.title}
                              </span>
                            </div>

                            {/* Bottom Technical Line */}
                            <div className="flex items-center justify-between border-t border-neutral-700/50 pt-2">
                              <span className="font-mono text-[9px] tracking-wider text-neutral-700 font-bold uppercase">
                                UNIFOLIO
                              </span>
                              <span className="font-mono text-[8px] text-neutral-500">
                                SEC.CAD // 0{idx + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* DUPLICATED TRAIL CARDS FOR PAPER -> INK CHOREOGRAPHY */}
                {Array.from({ length: COMPANION_COUNT }).map((_, cIdx) => {
                  const cardIdx = cIdx % 5;
                  const card = PRODUCT_CARDS[cardIdx];
                  return (
                    <div
                      key={`companion-trail-${cIdx}`}
                      ref={(el) => {
                        companionCardRefs.current[cIdx] = el;
                      }}
                      className="absolute shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[285px] sm:h-[310px] md:h-[330px] lg:h-[345px] xl:h-[360px] 2xl:h-[375px] rounded-[20px] overflow-hidden pointer-events-none will-change-transform"
                      style={{
                        transformStyle: "preserve-3d",
                        opacity: 0,
                        visibility: "hidden",
                      }}
                    >
                      {/* Trail Card Paper Layer */}
                      <div
                        ref={(el) => {
                          companionPaperRefs.current[cIdx] = el;
                        }}
                        className="absolute inset-0 rounded-[20px] overflow-hidden will-change-[opacity]"
                        style={{
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          backgroundColor: "rgba(255, 255, 255, 0.72)",
                          border: "1px solid rgba(255, 255, 255, 0.75)",
                          boxShadow: "0 18px 40px -10px rgba(16, 44, 28, 0.08), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-emerald-50/40 to-white/60 pointer-events-none" />
                        <div className="relative z-10 p-5 flex flex-col justify-between h-full opacity-60">
                          <span className="font-mono text-[11px] text-neutral-400">UNIFOLIO // {card.num}</span>
                          <span className="font-sans font-bold text-xs tracking-wider text-neutral-500 uppercase">{card.title}</span>
                        </div>
                      </div>

                      {/* Trail Card Ink Sketch Layer */}
                      <div
                        ref={(el) => {
                          companionInkRefs.current[cIdx] = el;
                        }}
                        className="absolute inset-0 rounded-[20px] pointer-events-none will-change-[opacity]"
                        style={{
                          opacity: 0,
                          border: "1.2px solid rgba(42, 50, 46, 0.85)",
                        }}
                      >
                        <div className="absolute inset-[6px] rounded-[15px] border border-dashed border-neutral-700/40" />
                        <div className="relative z-10 p-5 flex flex-col justify-between h-full opacity-70">
                          <span className="font-mono text-[10px] text-neutral-800 font-semibold tracking-wider">INK // {card.num}</span>
                          <div className="w-8 h-8 mx-auto rounded-full border border-neutral-700/60 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#22c55e]/40" />
                          </div>
                          <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider">{card.title}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* LUXURY ROUND 3D SAFE (Matching "Safe Movement") */}
                <div
                  ref={safeContainerRef}
                  className="absolute pointer-events-none select-none will-change-transform flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: "50%",
                    top: "50%",
                    transformStyle: "preserve-3d",
                    opacity: 0,
                    visibility: "hidden",
                    zIndex: 25,
                  }}
                >
                  {/* Subtle Ambient Soft Shadow Underneath (Reinforces Floating Effect) */}
                  <div
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[270px] sm:w-[330px] lg:w-[390px] h-[45px] sm:h-[55px] rounded-[100%] pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse 65% 35% at 50% 50%, rgba(18, 26, 22, 0.16) 0%, rgba(34, 197, 94, 0.05) 35%, transparent 70%)",
                      filter: "blur(18px)",
                    }}
                  />

                  {/* 3D Round Chrome/Gold Vault Safe (Exact replica of Reference Image & "Safe Movement") */}
                  <SafeVault3D
                    ref={safeVault3DRef}
                    className="w-[270px] sm:w-[330px] lg:w-[390px] xl:w-[430px] h-[270px] sm:h-[330px] lg:h-[390px] xl:h-[430px]"
                  />
                </div>

                {/* Unified Physical Envelope (Morphed Single Object) */}
                <div
                  ref={unifiedEnvelopeRef}
                  className="absolute pointer-events-none will-change-transform flex items-center justify-center"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0,
                    visibility: "hidden",
                    zIndex: 30,
                  }}
                >
                  <div
                    className="relative w-[94vw] max-w-[760px] sm:max-w-[840px] md:max-w-[900px] lg:max-w-[960px] h-[420px] sm:h-[480px] md:h-[520px] lg:h-[550px] rounded-[16px] sm:rounded-[22px]"
                    style={{
                      perspective: "1400px",
                      transformStyle: "preserve-3d",
                      boxShadow:
                        "0 40px 90px -15px rgba(0, 0, 0, 0.80), 0 20px 40px -8px rgba(0, 0, 0, 0.60)",
                    }}
                  >
                    {/* LAYER 1 (z-1): Envelope Backplate / Back Wall */}
                    <div
                      className="absolute inset-0 rounded-[16px] sm:rounded-[22px] overflow-hidden"
                      style={{
                        zIndex: 1,
                        background:
                          "linear-gradient(145deg, rgba(8, 32, 21, 0.98) 0%, rgba(4, 20, 13, 0.99) 55%, rgba(1, 10, 6, 1.0) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                      }}
                    >
                      {/* Deep Cavity Shadow & Ambient Glow */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-50"
                        style={{
                          background:
                            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34, 197, 94, 0.15), transparent 70%)",
                        }}
                      />
                      {/* Interior Top Shadow */}
                      <div
                        className="absolute inset-x-0 top-0 h-28 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, transparent 100%)",
                        }}
                      />
                    </div>

                    {/* LAYER 2 (z-10 -> z-35): Editorial Document (Emerges from inside envelope cavity) */}
                    {/* Cavity clipping wrapper: strictly occludes document within envelope bottom and sides, open at top */}
                    <div
                      ref={docCavityWrapperRef}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        zIndex: 10,
                        visibility: "hidden",
                        opacity: 0,
                        clipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
                        WebkitClipPath: "inset(-2000px 0px 0px 0px round 0 0 22px 22px)",
                      }}
                    >
                      <div
                        ref={philosophyDocRef}
                        className="absolute left-1/2 -translate-x-1/2 pointer-events-none will-change-transform"
                        style={{
                          top: "20px",
                          opacity: 0,
                          visibility: "hidden",
                          transformOrigin: "50% 0%",
                        }}
                      >
                      <div
                        ref={docPaperSheetRef}
                        className="relative w-[95vw] max-w-[620px] sm:max-w-[700px] md:max-w-[780px] lg:max-w-[860px] xl:max-w-[920px] will-change-[height,transform]"
                        style={{
                          height: "320px",
                          perspective: "2500px",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {/* 3D Double-Sided Flipping Paper Sheet */}
                        <div
                          ref={docFlipperRef}
                          className="relative w-full h-full will-change-transform"
                          style={{
                            transformStyle: "preserve-3d",
                            transformOrigin: "50% 50%",
                          }}
                        >
                          {/* ============================================================ */}
                          {/* FRONT FACE: PAGE 1 (First Paragraph Only)                    */}
                          {/* ============================================================ */}
                          <div
                            className="absolute inset-0 w-full h-full rounded-[18px] sm:rounded-[24px] p-7 sm:p-10 md:p-12 lg:p-14 overflow-hidden flex flex-col justify-between"
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(0deg) translateZ(0.5px)",
                              background:
                                "linear-gradient(168deg, #FCFAF6 0%, #F7F2E8 42%, #ECE3D4 100%)",
                              boxShadow:
                                "0 45px 110px -20px rgba(0, 0, 0, 0.75), 0 20px 45px -10px rgba(0, 0, 0, 0.45), 0 0 0 1.5px rgba(215, 205, 190, 0.85), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(0, 0, 0, 0.06)",
                              clipPath: "polygon(46px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 46px)",
                              WebkitClipPath: "polygon(46px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 46px)",
                            }}
                          >
                            {/* Folded Paper Dog-Ear Flap (Top Left, Matching Original Document) */}
                            <div className="absolute top-0 left-0 w-[46px] h-[46px] pointer-events-none z-30">
                              <svg className="w-full h-full" viewBox="0 0 46 46" fill="none">
                                <defs>
                                  <filter id="dogEarShadowFront" x="-30%" y="-30%" width="160%" height="160%">
                                    <feDropShadow dx="2" dy="2.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.30" />
                                  </filter>
                                  <linearGradient id="dogEarGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#EDE3D2" />
                                    <stop offset="50%" stopColor="#F5EFE3" />
                                    <stop offset="100%" stopColor="#FAF7F0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M 0 46 L 46 0 L 46 46 Z"
                                  fill="url(#dogEarGradFront)"
                                  filter="url(#dogEarShadowFront)"
                                />
                                <line x1="0" y1="46" x2="46" y2="0" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="1.2" />
                                <line x1="1" y1="46" x2="46" y2="1" stroke="rgba(180, 168, 148, 0.40)" strokeWidth="0.8" />
                              </svg>
                            </div>

                            {/* Tactile Fine Paper Texture & Soft 3D Lighting Gradient */}
                            <div
                              className="absolute inset-0 pointer-events-none opacity-55"
                              style={{
                                background:
                                  "linear-gradient(105deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.15) 30%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0.06) 100%)",
                              }}
                            />

                            {/* Top Subtle Emerald Watermark Accent Line */}
                            <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#22C55E]/70 to-transparent opacity-75" />

                            {/* Top Editorial Pre-Header & Unifolio Ring Logo */}
                            <div className="relative flex items-center justify-between w-full pointer-events-none">
                              <span className="font-sans text-[16px] sm:text-[18px] font-semibold tracking-[0.06em] text-neutral-950 leading-tight">
                                About Us
                              </span>

                              <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center shrink-0">
                                <img
                                  src="/Logo/unifolio-ring-transparent.png"
                                  alt="Unifolio Ring"
                                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                                />
                              </div>
                            </div>

                            {/* Subtle Hairline Watermark Divider */}
                            <div className="w-full h-[1px] bg-neutral-300/80 my-3 sm:my-5" />

                            {/* Printed Ink Copy: FIRST PARAGRAPH (Large, Bold, Editorial, Premium) */}
                            <div
                              ref={docInkCopyRef}
                              className="relative z-10 flex-1 flex flex-col justify-center select-text pointer-events-auto will-change-[clip-path,opacity,filter] py-4 sm:py-6"
                              style={{
                                clipPath: "inset(0 0 100% 0)",
                                WebkitClipPath: "inset(0 0 100% 0)",
                                opacity: 0,
                              }}
                            >
                              {/* Dominant Editorial Opening Statement - Unified Single Paragraph */}
                              <h2 className="font-serif font-bold text-[28px] sm:text-[36px] md:text-[44px] lg:text-[50px] xl:text-[54px] text-neutral-950 leading-[1.16] tracking-tight text-left">
                                In most families, someone ends up in charge of the <span className="text-[#22C55E]">money</span>. Not because they trained for it. Because someone has to.
                              </h2>

                              {/* Supporting sentence (Small text) */}
                              <p className="mt-8 sm:mt-10 md:mt-12 font-serif font-semibold text-[18px] sm:text-[22px] md:text-[25px] lg:text-[28px] text-neutral-800 leading-[1.4] max-w-[720px] text-left">
                                Their financial data lives across a dozen apps and statements. There&apos;s a gap between seeing it all and actually understanding it.
                              </p>
                            </div>

                            {/* Footer Indicator on Page 1 */}
                            <div className="pt-3 sm:pt-4 flex items-center justify-between border-t border-neutral-300/80 text-neutral-700">
                              <span className="font-mono text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-neutral-700">
                                01 / 02
                              </span>
                              <span className="font-sans text-[10.5px] sm:text-[12px] font-bold tracking-[0.16em] uppercase flex items-center gap-1.5 text-neutral-900">
                                SCROLL DOWN TO TURN PAGE &rarr;
                              </span>
                            </div>
                          </div>

                          {/* ============================================================ */}
                          {/* REVERSE FACE: PAGE 2 (Second Paragraph Only)                  */}
                          {/* Physically attached reverse side of the same sheet            */}
                          {/* ============================================================ */}
                          <div
                            className="absolute inset-0 w-full h-full rounded-[18px] sm:rounded-[24px] p-7 sm:p-10 md:p-12 lg:p-14 overflow-hidden flex flex-col justify-between"
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(180deg) translateZ(0.5px)",
                              background:
                                "linear-gradient(168deg, #FAF7F2 0%, #F5EFE3 42%, #E9DFC9 100%)",
                              boxShadow:
                                "0 45px 110px -20px rgba(0, 0, 0, 0.75), 0 20px 45px -10px rgba(0, 0, 0, 0.45), 0 0 0 1.5px rgba(215, 205, 190, 0.85), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(0, 0, 0, 0.06)",
                              clipPath: "polygon(0% 0%, calc(100% - 46px) 0%, 100% 46px, 100% 100%, 0% 100%)",
                              WebkitClipPath: "polygon(0% 0%, calc(100% - 46px) 0%, 100% 46px, 100% 100%, 0% 100%)",
                            }}
                          >
                            {/* Folded Paper Dog-Ear Flap (Top Right from back view) */}
                            <div className="absolute top-0 right-0 w-[46px] h-[46px] pointer-events-none z-30 -scale-x-100">
                              <svg className="w-full h-full" viewBox="0 0 46 46" fill="none">
                                <defs>
                                  <filter id="dogEarShadowBack" x="-30%" y="-30%" width="160%" height="160%">
                                    <feDropShadow dx="2" dy="2.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.30" />
                                  </filter>
                                  <linearGradient id="dogEarGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#EDE3D2" />
                                    <stop offset="50%" stopColor="#F5EFE3" />
                                    <stop offset="100%" stopColor="#FAF7F0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M 0 46 L 46 0 L 46 46 Z"
                                  fill="url(#dogEarGradBack)"
                                  filter="url(#dogEarShadowBack)"
                                />
                                <line x1="0" y1="46" x2="46" y2="0" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="1.2" />
                                <line x1="1" y1="46" x2="46" y2="1" stroke="rgba(180, 168, 148, 0.40)" strokeWidth="0.8" />
                              </svg>
                            </div>

                            {/* Tactile Fine Paper Texture & Soft 3D Lighting Gradient */}
                            <div
                              className="absolute inset-0 pointer-events-none opacity-55"
                              style={{
                                background:
                                  "linear-gradient(105deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.15) 30%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0.06) 100%)",
                              }}
                            />

                            {/* Top Subtle Emerald Watermark Accent Line */}
                            <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#22C55E]/70 to-transparent opacity-75" />

                            {/* Top Editorial Pre-Header & Unifolio Ring Logo */}
                            {/* Top Editorial Pre-Header & Unifolio Ring Logo */}
                            <div className="relative flex items-center justify-between w-full pointer-events-none">
                              <span className="font-sans text-[16px] sm:text-[18px] font-semibold tracking-[0.06em] text-neutral-950 leading-tight">
                                About Us
                              </span>

                              <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center shrink-0">
                                <img
                                  src="/Logo/unifolio-ring-transparent.png"
                                  alt="Unifolio Ring"
                                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                                />
                              </div>
                            </div>

                            {/* Subtle Hairline Watermark Divider */}
                            <div className="w-full h-[1px] bg-neutral-300/80 my-3 sm:my-5" />

                            {/* Printed Ink Copy: SECOND PARAGRAPH (Large, Bold, Premium, Editorial) */}
                            <div className="relative z-10 flex-1 flex flex-col justify-start select-text pointer-events-auto pt-3 sm:pt-5 md:pt-7">
                              {/* Dominant Large Editorial Statement */}
                              <h2 className="font-serif font-bold text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] text-neutral-950 leading-[1.08] tracking-tight text-left">
                                Unifolio exists<br />
                                to close that gap.
                              </h2>

                              {/* Supporting sentence beneath it (Enlarged size, positioned further down) */}
                              <p className="mt-10 sm:mt-14 md:mt-18 lg:mt-20 font-serif font-semibold text-[19px] sm:text-[23px] md:text-[26px] lg:text-[28px] text-neutral-900 leading-[1.38] max-w-[700px] text-left">
                                The same clarity a wealth manager gives their wealthiest clients, now available to anyone. Whether they hold ₹5 lakh or ₹5 crore. Whether they&apos;ve studied finance or never touched a balance sheet.
                              </p>

                              {/* Thin hairline divider rule between supporting sentence and closing statement (Centered with equal spacing) */}
                              <div className="w-full h-[1px] bg-neutral-300/70 my-5 sm:my-7 md:my-9 lg:my-10" />

                              {/* Closing Statement (Evenly spaced) */}
                              <div className="space-y-1.5 sm:space-y-2 text-left">
                                <p className="font-serif font-semibold text-[20px] sm:text-[25px] md:text-[29px] text-neutral-950 leading-snug">
                                  Seeing your money isn&apos;t the same as
                                </p>
                                <p className="font-serif font-bold text-[32px] sm:text-[40px] md:text-[48px] lg:text-[54px] text-[#22C55E] tracking-tight leading-[1.08]">
                                  understanding it.
                                </p>
                              </div>
                            </div>

                            {/* Footer Indicator on Page 2 */}
                            <div className="pt-3 sm:pt-4 flex items-center justify-between border-t border-neutral-300/80 text-neutral-700">
                              <span className="font-mono text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-neutral-700">
                                02 / 02
                              </span>
                              <span />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* LAYER 3 (z-20): Front Pocket & Side Triangular Flaps */}
                    {/* This sits in front of the document so the document emerges out of the cavity */}
                    <div
                      className="absolute inset-0 pointer-events-none rounded-[16px] sm:rounded-[22px] overflow-hidden"
                      style={{ zIndex: 20 }}
                    >
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                        viewBox="0 0 960 550"
                      >
                        <defs>
                          <filter id="pocketCreaseShadow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="-3" stdDeviation="4" floodColor="#000000" floodOpacity="0.70" />
                          </filter>
                          <linearGradient id="pocketSeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.40)" />
                            <stop offset="45%" stopColor="rgba(34, 197, 94, 0.65)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.20)" />
                          </linearGradient>
                          <linearGradient id="pocketBodyGradient" x1="50%" y1="100%" x2="50%" y2="0%">
                            <stop offset="0%" stopColor="rgba(8, 30, 20, 0.98)" />
                            <stop offset="100%" stopColor="rgba(3, 16, 11, 0.99)" />
                          </linearGradient>
                        </defs>

                        {/* Side Left Flap Polygon */}
                        <polygon
                          points="0,0 0,550 480,275"
                          fill="rgba(4, 18, 12, 0.98)"
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth="1"
                        />

                        {/* Side Right Flap Polygon */}
                        <polygon
                          points="960,0 960,550 480,275"
                          fill="rgba(6, 24, 16, 0.98)"
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth="1"
                        />

                        {/* Bottom Front Pocket Polygon (Upward Triangle) */}
                        <polygon
                          points="0,550 960,550 480,270"
                          fill="url(#pocketBodyGradient)"
                          filter="url(#pocketCreaseShadow)"
                          stroke="url(#pocketSeamGradient)"
                          strokeWidth="1.2"
                        />

                        {/* Bottom diagonal seams */}
                        <line x1="0" y1="550" x2="480" y2="270" stroke="rgba(34, 197, 94, 0.40)" strokeWidth="1" />
                        <line x1="960" y1="550" x2="480" y2="270" stroke="rgba(34, 197, 94, 0.40)" strokeWidth="1" />
                      </svg>

                      {/* Front Pocket Center Unifolio Aperture Ring Clasp (Matching Reference Image) */}
                      <div
                        className="absolute left-1/2 top-[49%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ zIndex: 25 }}
                      >
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#051F14] border border-[#22C55E]/80 shadow-[0_0_26px_rgba(34,197,94,0.65),inset_0_1px_2px_rgba(255,255,255,0.45)] flex items-center justify-center">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#22C55E] relative flex items-center justify-center">
                            <div className="absolute -top-1 w-1.5 h-1 bg-[#051F14]" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Specular Highlight */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-[1.5px] pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.85) 50%, rgba(34, 197, 94, 0.2) 100%)",
                        }}
                      />
                    </div>

                    {/* LAYER 4 (z-30): 3D Hinged Top Flap with Seal Clasp */}
                    {/* Hinged exactly at the top fold line (top: 0, transformOrigin: "50% 0%") */}
                    <div
                      ref={envelopeTopFlapRef}
                      className="absolute inset-x-0 top-0 pointer-events-none will-change-transform"
                      style={{
                        zIndex: 30,
                        height: "54%",
                        transformOrigin: "50% 0%",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <svg
                        className="w-full h-full pointer-events-none overflow-visible"
                        preserveAspectRatio="none"
                        viewBox="0 0 960 297"
                      >
                        <defs>
                          <filter id="flapShadow" x="-10%" y="-10%" width="120%" height="135%">
                            <feDropShadow dx="0" dy="4.5" stdDeviation="5.5" floodColor="#000000" floodOpacity="0.75" />
                          </filter>
                          <linearGradient id="flapGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" stopColor="rgba(14, 52, 34, 0.98)" />
                            <stop offset="100%" stopColor="rgba(5, 22, 14, 0.99)" />
                          </linearGradient>
                          <linearGradient id="flapSeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                            <stop offset="50%" stopColor="rgba(34, 197, 94, 0.65)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
                          </linearGradient>
                        </defs>

                        {/* Closed Top Triangular Flap Polygon */}
                        <polygon
                          points="0,0 960,0 480,295"
                          fill="url(#flapGradient)"
                          filter="url(#flapShadow)"
                          stroke="url(#flapSeamGradient)"
                          strokeWidth="1.4"
                        />

                        {/* Crisp Diagonal Bevel Highlights on Flap Edges */}
                        <line x1="0" y1="0" x2="480" y2="295" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" />
                        <line x1="960" y1="0" x2="480" y2="295" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" />
                      </svg>

                      {/* Top Fold Specular Rim Highlight */}
                      <div
                        className="absolute inset-x-0 top-0 h-[1.5px] pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.1) 100%)",
                        }}
                      />

                      {/* Center Clasp Unifolio Aperture Ring Seal (Mounted at apex of flap) */}
                      <div
                        ref={envelopeSealRef}
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none will-change-transform"
                        style={{ top: "100%", zIndex: 30 }}
                      >
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#051F14] border border-[#22C55E]/80 shadow-[0_0_26px_rgba(34,197,94,0.65),inset_0_1px_2px_rgba(255,255,255,0.45)] flex items-center justify-center">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#22C55E] relative flex items-center justify-center">
                            <div className="absolute -top-1 w-1.5 h-1 bg-[#051F14]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Hero Content (Headline, Supporting Text, CTA) - Positioned underneath cards */}
            <div
              ref={headerRef}
              className="w-full max-w-5xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mt-10 sm:mt-12 md:mt-14 lg:mt-16 xl:mt-20 mb-2 px-2 will-change-transform"
            >
              <h2
                ref={headlineRef}
                className="font-sans font-black text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] xl:text-[46px] tracking-[-0.03em] leading-tight sm:whitespace-nowrap text-neutral-950 will-change-transform"
              >
                Understand your wealth.{" "}
                <span
                  className="font-black text-[#22C55E]"
                  style={{ color: "#22C55E" }}
                >
                  Not just see it.
                </span>
              </h2>

              <p
                ref={subheadRef}
                className="mt-2 sm:mt-2.5 max-w-xl text-xs sm:text-sm md:text-base text-neutral-600 font-medium leading-snug sm:leading-relaxed will-change-transform"
              >
                Every account, every fund, every rupee, in one place, finally clear.
              </p>

              <div className="mt-3 sm:mt-4">
                <LinkButton
                  ref={ctaRef}
                  href="#contact"
                  size="md"
                  variant="primary"
                  className="shadow-md shadow-emerald-500/15"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(
                      new CustomEvent("unifolio-nav-click", { detail: { section: "contact" } })
                    );
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E] group-hover:scale-125 transition-transform" />
                  <span className="font-bold text-sm sm:text-base tracking-tight">Join the waitlist</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-neutral-600 stroke-[2.5]" />
                </LinkButton>
              </div>
            </div>

            {/* Ambient Floor Reflection Line */}
            <div
              ref={floorLineRef}
              className="hidden"
            />

            {/* Minimal Editorial Security Content Experience */}
            <div
              ref={securityStageRef}
              id="security"
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-15 select-none"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {SECURITY_STATES.map((item, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      securityStateRefs.current[idx] = el;
                    }}
                    className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl px-6 md:pl-16 lg:pl-28 xl:pl-36 text-left will-change-transform pointer-events-none"
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                    }}
                  >
                    {item.type === "hero" ? (
                      <div
                        ref={securityHeroRibbonRef}
                        className="relative will-change-transform select-none flex flex-col items-start text-left"
                      >
                        <h2 className="font-sans font-black text-xl sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[42px] 2xl:text-[46px] text-neutral-950 tracking-[-0.03em] select-none flex flex-col items-start gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4 leading-[1.12] text-left">
                          {/* Line 1: We take your data as seriously */}
                          <div className="whitespace-nowrap flex items-baseline gap-[0.24em]">
                            <span ref={(el) => { securityHeroWordRefs.current[0] = el; }} className="inline-block will-change-transform">We</span>
                            <span ref={(el) => { securityHeroWordRefs.current[1] = el; }} className="inline-block will-change-transform">take</span>
                            <span ref={(el) => { securityHeroWordRefs.current[2] = el; }} className="inline-block will-change-transform">your</span>
                            <span ref={(el) => { securityHeroWordRefs.current[3] = el; }} className="inline-block will-change-transform">data</span>
                            <span ref={(el) => { securityHeroWordRefs.current[4] = el; }} className="inline-block will-change-transform">as</span>
                            <span ref={(el) => { securityHeroWordRefs.current[5] = el; }} className="inline-block text-[#22C55E] font-black will-change-transform">seriously</span>
                          </div>

                          {/* Line 2: as you take your money. */}
                          <div className="whitespace-nowrap flex items-baseline gap-[0.24em]">
                            <span ref={(el) => { securityHeroWordRefs.current[6] = el; }} className="inline-block will-change-transform">as</span>
                            <span ref={(el) => { securityHeroWordRefs.current[7] = el; }} className="inline-block will-change-transform">you</span>
                            <span ref={(el) => { securityHeroWordRefs.current[8] = el; }} className="inline-block will-change-transform">take</span>
                            <span ref={(el) => { securityHeroWordRefs.current[9] = el; }} className="inline-block will-change-transform">your</span>
                            <span ref={(el) => { securityHeroWordRefs.current[10] = el; }} className="inline-block will-change-transform">
                              <span className="relative inline-flex items-center justify-center align-baseline">
                                {/* The 5 letters of "money" in black */}
                                <span className="inline-flex items-baseline text-neutral-950 font-black">
                                  {MONEY_LETTERS.map((char, charIdx) => (
                                    <span
                                      key={charIdx}
                                      ref={(el) => {
                                        moneyCharRefs.current[charIdx] = el;
                                      }}
                                      className="inline-block will-change-transform"
                                    >
                                      {char}
                                    </span>
                                  ))}
                                </span>

                                {/* Morphed Cash Banknote Stack Animation SVG (Centered directly within the bounding box of "MONEY") */}
                                <span
                                  ref={moneyWrapperRef}
                                  className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                  style={{ opacity: 0, transform: "scale(0.85)" }}
                                  aria-hidden="true"
                                >
                                  <svg
                                    viewBox="-56 -28 112 56"
                                    className="w-full h-full max-h-[1.15em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)]"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <defs>
                                      <g id="unifolio-money-bill">
                                        {/* Main Banknote Body centered at (0, 0) */}
                                        <rect
                                          x="-48"
                                          y="-25"
                                          width="96"
                                          height="50"
                                          rx="5"
                                          fill="#4ADE80"
                                          stroke="#15803D"
                                          strokeWidth="2.8"
                                        />
                                        {/* 4 Corner Tabs */}
                                        <path d="M -48 -14 A 11 11 0 0 1 -37 -25 L -48 -25 Z" fill="#15803D" />
                                        <path d="M 48 -14 A 11 11 0 0 0 37 -25 L 48 -25 Z" fill="#15803D" />
                                        <path d="M -48 14 A 11 11 0 0 0 -37 25 L -48 25 Z" fill="#15803D" />
                                        <path d="M 48 14 A 11 11 0 0 1 37 25 L 48 25 Z" fill="#15803D" />
                                        {/* Side Circles */}
                                        <circle cx="-27" cy="0" r="5" fill="#15803D" />
                                        <circle cx="27" cy="0" r="5" fill="#15803D" />
                                        {/* Center Circle */}
                                        <circle cx="0" cy="0" r="15" fill="#15803D" />
                                        {/* Center Rupee Sign */}
                                        <text
                                          x="0"
                                          y="6.5"
                                          fontFamily="system-ui, -apple-system, sans-serif"
                                          fontSize="19"
                                          fontWeight="900"
                                          fill="#4ADE80"
                                          textAnchor="middle"
                                          className="select-none"
                                        >
                                          ₹
                                        </text>
                                      </g>
                                    </defs>

                                    {/* Top Pair: Back Bill */}
                                    <g ref={moneyBill1Ref} transform="translate(0, 0)" style={{ transformOrigin: "0px 0px" }}>
                                      <use href="#unifolio-money-bill" />
                                    </g>

                                    {/* Top Pair: Front Bill */}
                                    <g ref={moneyBill2Ref} transform="translate(0, 0)" style={{ transformOrigin: "0px 0px" }}>
                                      <use href="#unifolio-money-bill" />
                                    </g>
                                  </svg>
                                </span>
                              </span>
                              .
                            </span>
                          </div>
                        </h2>
                      </div>
                    ) : item.type === "principle" ? (
                      <div className="flex flex-col items-start text-left">
                        {idx === 1 ? (
                          // State 2: "Read-only, always" - focal point, bigger and bolder typography with embedded eyes Easter egg
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] text-neutral-950 tracking-[-0.035em] leading-[1.05] mb-4 sm:mb-5 select-none relative inline-flex flex-wrap items-baseline">
                            {/* Left Word Segment: "Read-only," */}
                            <span
                              ref={typoLeftWordRef}
                              className="inline-block will-change-transform"
                            >
                              Read-only,
                            </span>

                            {/* Center Anchor for the Trapped Living Eyes */}
                            <span className="relative inline-flex items-center justify-center w-[0.3em] overflow-visible align-baseline">
                              {/* The Living Eyes - Trapped behind the words, forcing their way out */}
                              <span
                                ref={typoEyesRef}
                                className="absolute -top-[38px] sm:-top-[48px] md:-top-[58px] left-1/2 -translate-x-1/2 pointer-events-none select-none inline-flex items-center gap-2 sm:gap-2.5 md:gap-3 px-2 py-1 z-20"
                                style={{
                                  opacity: 0,
                                  visibility: "hidden",
                                  transformOrigin: "center bottom",
                                }}
                                aria-hidden="true"
                              >
                                {/* Radiant ambient emerald aura behind the eyes */}
                                <span className="absolute inset-0 -m-3 sm:-m-4 bg-emerald-500/35 rounded-full blur-xl -z-10 pointer-events-none" />

                                {/* Left Eye */}
                                <span className="relative w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] md:w-[54px] md:h-[54px] rounded-full overflow-hidden flex items-center justify-center border-2 border-white/50 shadow-[0_6px_20px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(0,0,0,0.25)] shrink-0">
                                  {/* Sclera 3D sphere gradient */}
                                  <span
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    style={{
                                      background:
                                        "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 55%, #94A3B8 100%)",
                                    }}
                                  />
                                  {/* Pupil & Iris */}
                                  <span
                                    ref={(el) => {
                                      typoPupilsRef.current[0] = el;
                                    }}
                                    className="relative w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] md:w-[28px] md:h-[28px] rounded-full bg-[#020603] flex items-center justify-center will-change-transform shadow-[0_0_0_2px_rgba(34,197,94,0.95),0_2px_8px_rgba(0,0,0,0.8)]"
                                  >
                                    <span
                                      className="absolute inset-0 rounded-full pointer-events-none"
                                      style={{
                                        background:
                                          "radial-gradient(circle at 68% 75%, rgba(34, 197, 94, 0.95) 0%, rgba(16, 185, 129, 0.35) 50%, transparent 75%)",
                                      }}
                                    />
                                    <span className="absolute top-[3px] left-[4px] w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full bg-white shadow-[0_0_4px_white]" />
                                    <span className="absolute bottom-[3px] right-[3px] w-[2.5px] h-[2.5px] sm:w-[3px] sm:h-[3px] rounded-full bg-white/85" />
                                  </span>
                                  {/* Eyelid for natural blinking */}
                                  <span
                                    ref={(el) => {
                                      typoEyelidsRef.current[0] = el;
                                    }}
                                    className="absolute inset-0 bg-[#06180e] rounded-full pointer-events-none origin-top will-change-transform"
                                    style={{
                                      transform: "scaleY(0)",
                                      boxShadow: "inset 0 -3px 6px rgba(34, 197, 94, 0.45)",
                                    }}
                                  />
                                </span>

                                {/* Right Eye */}
                                <span className="relative w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] md:w-[54px] md:h-[54px] rounded-full overflow-hidden flex items-center justify-center border-2 border-white/50 shadow-[0_6px_20px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(0,0,0,0.25)] shrink-0">
                                  {/* Sclera 3D sphere gradient */}
                                  <span
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    style={{
                                      background:
                                        "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 55%, #94A3B8 100%)",
                                    }}
                                  />
                                  {/* Pupil & Iris */}
                                  <span
                                    ref={(el) => {
                                      typoPupilsRef.current[1] = el;
                                    }}
                                    className="relative w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] md:w-[28px] md:h-[28px] rounded-full bg-[#020603] flex items-center justify-center will-change-transform shadow-[0_0_0_2px_rgba(34,197,94,0.95),0_2px_8px_rgba(0,0,0,0.8)]"
                                  >
                                    <span
                                      className="absolute inset-0 rounded-full pointer-events-none"
                                      style={{
                                        background:
                                          "radial-gradient(circle at 68% 75%, rgba(34, 197, 94, 0.95) 0%, rgba(16, 185, 129, 0.35) 50%, transparent 75%)",
                                      }}
                                    />
                                    <span className="absolute top-[3px] left-[4px] w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full bg-white shadow-[0_0_4px_white]" />
                                    <span className="absolute bottom-[3px] right-[3px] w-[2.5px] h-[2.5px] sm:w-[3px] sm:h-[3px] rounded-full bg-white/85" />
                                  </span>
                                  {/* Eyelid for natural blinking */}
                                  <span
                                    ref={(el) => {
                                      typoEyelidsRef.current[1] = el;
                                    }}
                                    className="absolute inset-0 bg-[#06180e] rounded-full pointer-events-none origin-top will-change-transform"
                                    style={{
                                      transform: "scaleY(0)",
                                      boxShadow: "inset 0 -3px 6px rgba(34, 197, 94, 0.45)",
                                    }}
                                  />
                                </span>
                              </span>
                            </span>

                            {/* Right Word Segment: "always" in Green */}
                            <span
                              ref={typoRightWordRef}
                              className="inline-block text-[#22C55E] will-change-transform"
                            >
                              always
                            </span>
                          </h3>
                        ) : idx === 2 ? (
                          // State 3: "We never save your passwords" - Password Masking Interaction
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[52px] text-neutral-950 tracking-[-0.035em] leading-[1.08] whitespace-nowrap mb-4 sm:mb-5 select-none">
                            <span>We never save your </span>
                            <span className="text-[#22C55E] inline-flex items-baseline font-black">
                              {PASSWORD_LETTERS.map((char, charIdx) => (
                                <span
                                  key={charIdx}
                                  className="relative inline-block text-center align-baseline"
                                >
                                  {/* Natural character defining the exact slot width */}
                                  <span
                                    ref={(el) => {
                                      pwdLetterRefs.current[charIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {char}
                                  </span>
                                  {/* Masking asterisk centered exactly over the character slot */}
                                  <span
                                    ref={(el) => {
                                      pwdMaskRefs.current[charIdx] = el;
                                    }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform text-[1.15em] font-black leading-none text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.45)]"
                                    style={{ opacity: 0, transform: "scale(0.35)" }}
                                    aria-hidden="true"
                                  >
                                    *
                                  </span>
                                </span>
                              ))}
                            </span>
                          </h3>
                        ) : idx === 3 ? (
                          // State 4: "Locked down, everywhere" - Typography Transformation Animation
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] text-neutral-950 tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal sm:whitespace-nowrap">
                            {/* The entire word "Locked" transforms into the lock */}
                            <span className="relative inline-flex items-center justify-center align-baseline">
                              {/* The 6 letters of "Locked" */}
                              <span className="inline-flex items-baseline">
                                {LOCKED_LETTERS.map((char, charIdx) => (
                                  <span
                                    key={charIdx}
                                    ref={(el) => {
                                      lockCharRefs.current[charIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </span>

                              {/* Morphed Lock SVG Icon (Centered directly over the entire word "Locked") */}
                              <span
                                ref={lockIconWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
                                style={{ opacity: 0, transform: "scale(0.35)" }}
                                aria-hidden="true"
                              >
                                <svg
                                  viewBox="0 0 44 48"
                                  className="w-[1.2em] h-[1.3em] overflow-visible drop-shadow-[0_6px_16px_rgba(34,197,94,0.5)]"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <defs>
                                    <linearGradient id="unifolioLockGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#4ADE80" />
                                      <stop offset="45%" stopColor="#22C55E" />
                                      <stop offset="100%" stopColor="#16A34A" />
                                    </linearGradient>
                                  </defs>

                                  {/* Shackle (arched steel bar) */}
                                  <path
                                    ref={lockShackleRef}
                                    d="M 13 21 V 13 C 13 7.5 17 3.5 22 3.5 C 27 3.5 31 7.5 31 13 V 21"
                                    stroke="currentColor"
                                    strokeWidth="4.8"
                                    strokeLinecap="round"
                                    className="text-neutral-900 will-change-transform"
                                  />

                                  {/* Lock Body (Unifolio green rounded squircle) */}
                                  <rect
                                    ref={lockBodyRef}
                                    x="6"
                                    y="18"
                                    width="32"
                                    height="26"
                                    rx="7.5"
                                    ry="7.5"
                                    fill="url(#unifolioLockGreen)"
                                    className="will-change-transform"
                                  />

                                  {/* Keyhole */}
                                  <circle cx="22" cy="28" r="2.8" fill="#18181B" />
                                  <path d="M 20.6 28.5 L 19.8 36 L 24.2 36 L 23.4 28.5 Z" fill="#18181B" />
                                </svg>
                              </span>
                            </span>

                            <span> down, </span>

                            <span className="text-[#22C55E] inline-block font-black">
                              everywhere
                            </span>
                          </h3>
                        ) : idx === 4 ? (
                          // State 5: "You control the connection" - Typography Transformation on "connection"
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
                            <span>You control the </span>

                            {/* The word "connection" in Unifolio green transforms into the animated connection SVG */}
                            <span className="relative inline-flex items-center justify-center align-baseline">
                              {/* The 10 letters of "connection" in Unifolio green #22C55E */}
                              <span className="inline-flex items-baseline text-[#22C55E] font-black">
                                {CONNECTION_LETTERS.map((char, charIdx) => (
                                  <span
                                    key={charIdx}
                                    ref={(el) => {
                                      connectionCharRefs.current[charIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </span>

                              {/* Morphed Connection SVG Animation (Centered directly over the word "connection") */}
                              <span
                                ref={connectionWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                style={{ opacity: 0, transform: "scale(0.35)" }}
                                aria-hidden="true"
                              >
                                <span className="inline-flex items-center justify-center -translate-y-2 sm:-translate-y-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src="/connection.svg"
                                    alt="Connection animation"
                                    className="w-[3.4em] h-[3.4em] sm:w-[3.8em] sm:h-[3.8em] md:w-[4.2em] md:h-[4.2em] object-contain drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)] select-none pointer-events-none"
                                  />
                                </span>
                              </span>
                            </span>
                          </h3>
                        ) : idx === 5 ? (
                          // State 6: "Stored in India" - Typography Transformation into Minimal India Map Outline
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 tracking-[-0.035em] leading-[1.06] mb-5 sm:mb-6 md:mb-7 select-none whitespace-normal lg:whitespace-nowrap">
                            <span>Stored in </span>

                            {/* The word "India" transforms into the minimal outline map */}
                            <span className="relative inline-flex items-center justify-center align-baseline">
                              {/* The 5 letters of "India" in Unifolio green */}
                              <span className="inline-flex items-baseline text-[#22C55E] font-black">
                                {INDIA_LETTERS.map((char, charIdx) => (
                                  <span
                                    key={charIdx}
                                    ref={(el) => {
                                      indiaCharRefs.current[charIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </span>

                              {/* Morphed Minimal India Map Outline SVG (Shifted right so it does NOT overlap the word "in", and upward for vertical balance) */}
                              <span
                                ref={indiaMapWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                style={{ opacity: 0, transform: "scale(0.35)" }}
                                aria-hidden="true"
                              >
                                <span className="inline-flex items-center justify-center translate-x-8 sm:translate-x-10 md:translate-x-12 -translate-y-9 sm:-translate-y-12 md:-translate-y-15">
                                  <svg
                                    viewBox="0 0 200 200"
                                    className="w-[2.8em] h-[2.8em] sm:w-[3.2em] sm:h-[3.2em] md:w-[3.6em] md:h-[3.6em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)]"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    {/* Smooth India silhouette perimeter outline from India.mp4 */}
                                    <path
                                      ref={indiaMapPathRef}
                                      d="M 59.2 13.0 C 61.8 12.9 65.5 12.6 68.7 14.1 C 71.9 15.6 75.5 21.1 78.3 22.0 C 81.0 23.0 82.9 20.3 85.2 19.9 C 87.4 19.6 89.6 19.5 91.5 19.9 C 93.5 20.4 97.2 20.5 96.8 22.6 C 96.5 24.6 90.6 30.1 89.4 32.1 C 88.2 34.2 89.0 33.8 89.4 34.8 C 89.7 35.7 91.2 36.9 91.5 38.0 C 91.8 39.0 92.1 40.1 91.0 41.1 C 89.8 42.2 83.3 42.1 84.6 44.3 C 85.9 46.5 96.5 52.4 98.9 54.4 C 101.4 56.3 99.8 54.7 99.5 56.0 C 99.1 57.2 95.5 59.8 96.8 61.8 C 98.1 63.9 103.3 66.4 107.4 68.2 C 111.6 69.9 117.7 71.6 121.7 72.4 C 125.8 73.2 129.5 73.3 131.8 73.0 C 134.1 72.6 134.5 72.0 135.5 70.3 C 136.6 68.6 137.2 64.5 138.2 62.9 C 139.2 61.3 139.0 59.6 141.4 60.8 C 143.8 61.9 149.9 68.2 152.5 69.8 C 155.1 71.4 155.2 70.8 156.7 70.3 C 158.3 69.8 159.7 69.2 162.0 66.6 C 164.4 63.9 168.9 56.8 171.1 54.4 C 173.3 52.0 173.8 52.6 175.3 52.3 C 176.8 51.9 178.7 51.9 180.1 52.3 C 181.5 52.6 182.6 52.9 183.8 54.4 C 185.0 55.9 187.1 59.3 187.5 61.3 C 187.9 63.2 187.6 64.8 186.4 66.1 C 185.3 67.3 182.1 67.7 180.6 68.7 C 179.1 69.8 178.8 69.7 177.4 72.4 C 176.1 75.2 173.5 80.8 172.7 85.2 C 171.8 89.5 173.7 96.6 172.1 98.4 C 170.5 100.3 165.3 97.4 163.1 96.3 C 160.9 95.1 159.6 93.1 158.9 91.5 C 158.2 89.9 158.1 88.3 158.9 86.7 C 159.7 85.2 162.8 83.2 163.6 82.0 C 164.4 80.7 165.5 79.4 163.6 79.3 C 161.8 79.2 155.9 79.9 152.5 81.4 C 149.1 82.9 144.6 86.5 143.0 88.3 C 141.3 90.2 141.5 90.1 142.4 92.6 C 143.4 95.1 149.0 101.2 148.8 103.2 C 148.6 105.1 143.3 103.7 141.4 104.2 C 139.4 104.8 139.5 103.5 137.1 106.4 C 134.7 109.2 130.0 117.4 127.0 121.2 C 124.1 125.0 123.1 126.6 119.6 129.2 C 116.2 131.7 109.4 134.6 106.4 136.6 C 103.4 138.5 102.7 139.2 101.6 140.8 C 100.4 142.5 99.9 143.2 99.5 146.7 C 99.0 150.1 99.6 156.8 98.9 161.5 C 98.2 166.2 96.5 171.4 95.2 174.8 C 94.0 178.1 93.3 179.6 91.5 181.7 C 89.7 183.7 86.4 186.3 84.6 187.0 C 82.9 187.7 82.5 187.3 80.9 185.9 C 79.3 184.5 78.3 184.1 75.1 178.5 C 71.9 172.8 65.3 159.5 61.8 152.0 C 58.4 144.5 56.1 139.7 54.4 133.4 C 52.7 127.1 52.4 117.7 51.7 114.3 C 51.1 111.0 52.9 111.8 50.7 113.3 C 48.5 114.7 41.5 121.2 38.5 122.8 C 35.5 124.4 34.2 123.1 32.7 122.8 C 31.1 122.5 30.8 122.6 28.9 121.2 C 27.1 119.8 21.2 116.0 21.5 114.3 C 21.9 112.6 28.9 112.2 31.1 111.1 C 33.3 110.1 33.7 109.3 34.8 108.0 C 35.8 106.6 39.1 104.2 37.4 103.2 C 35.7 102.2 27.5 102.7 24.7 102.1 C 21.9 101.6 22.5 101.9 20.5 100.0 C 18.4 98.1 13.6 92.9 12.5 91.0 C 11.4 89.0 12.6 89.1 13.6 88.3 C 14.5 87.5 14.7 86.9 18.3 86.2 C 22.0 85.5 32.2 84.7 35.3 84.1 C 38.4 83.5 37.1 84.1 36.9 82.5 C 36.7 80.9 34.5 76.8 34.2 74.5 C 34.0 72.3 34.7 70.6 35.3 69.2 C 35.9 67.9 37.1 67.0 38.0 66.6 C 38.8 66.1 39.3 66.1 40.6 66.6 C 41.9 67.1 41.5 73.8 45.9 69.8 C 50.3 65.8 63.9 47.9 67.1 42.7 C 70.4 37.6 67.1 40.5 65.5 39.0 C 63.9 37.5 58.5 35.9 57.6 33.7 C 56.6 31.5 60.8 28.2 59.7 25.8 C 58.6 23.3 52.4 20.6 51.2 18.9 C 50.1 17.1 51.5 16.1 52.8 15.2 C 54.1 14.2 56.5 13.2 59.2 13.0 Z"
                                      fill="none"
                                      stroke="#22C55E"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="will-change-transform"
                                    />
                                  </svg>
                                </span>
                              </span>
                            </span>
                          </h3>
                        ) : idx === 6 ? (
                          // State 7: "We don't sell your data" - Typography Transformation into Security Shield Badge
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
                            <span>We don&apos;t </span>

                            {/* The word "sell" in Unifolio green transforms into the animated Security Shield Badge */}
                            <span className="relative inline-flex items-center justify-center align-baseline">
                              {/* The 4 letters of "sell" in Unifolio green #22C55E */}
                              <span className="inline-flex items-baseline text-[#22C55E] font-black">
                                {SELL_LETTERS.map((char, charIdx) => (
                                  <span
                                    key={charIdx}
                                    ref={(el) => {
                                      sellCharRefs.current[charIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </span>

                              {/* Morphed Security Shield Badge SVG (Elevated smoothly over the word "sell") */}
                              <span
                                ref={sellShieldWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                style={{ opacity: 0, perspective: "800px" }}
                                aria-hidden="true"
                              >
                                <svg
                                  ref={sellShieldIconRef}
                                  viewBox="0 0 100 100"
                                  className="w-[2.4em] h-[2.4em] sm:w-[2.7em] sm:h-[2.7em] md:w-[3.0em] md:h-[3.0em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.40)] will-change-transform"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transformStyle: "preserve-3d" }}
                                >
                                  {/* Outer Shield Outline */}
                                  <path
                                    d="M 26 13 L 74 13 C 78 13 83 17 85 22 C 86.5 25 86 48 86 52 C 86 68 70 82 50 89 C 30 82 14 68 14 52 C 14 48 13.5 25 15 22 C 17 17 22 13 26 13 Z"
                                    fill="rgba(34, 197, 94, 0.08)"
                                    stroke="#22C55E"
                                    strokeWidth="3.2"
                                    strokeLinejoin="round"
                                  />
                                  {/* Inner Shield Bevel Rim */}
                                  <path
                                    d="M 33 21 L 67 21 C 70 21 74 24 76 28 C 77 32 76.5 48 76.5 51 C 76.5 63 64 73.5 50 79 C 36 73.5 23.5 63 23.5 51 C 23.5 48 23 32 24 28 C 26 24 30 21 33 21 Z"
                                    fill="none"
                                    stroke="#22C55E"
                                    strokeWidth="2.0"
                                    strokeLinejoin="round"
                                    opacity="0.85"
                                  />
                                  {/* 3D Bevel Corner Lines */}
                                  <path d="M 26 13 L 33 21" stroke="#22C55E" strokeWidth="2.0" strokeLinecap="round" opacity="0.75" />
                                  <path d="M 74 13 L 67 21" stroke="#22C55E" strokeWidth="2.0" strokeLinecap="round" opacity="0.75" />
                                  <path d="M 15 22 L 24 28" stroke="#22C55E" strokeWidth="2.0" strokeLinecap="round" opacity="0.75" />
                                  <path d="M 85 22 L 76 28" stroke="#22C55E" strokeWidth="2.0" strokeLinecap="round" opacity="0.75" />
                                  <path d="M 50 79 L 50 89" stroke="#22C55E" strokeWidth="2.0" strokeLinecap="round" opacity="0.75" />
                                  {/* Center Circle */}
                                  <circle
                                    cx="50"
                                    cy="49"
                                    r="18"
                                    fill="rgba(34, 197, 94, 0.12)"
                                    stroke="#22C55E"
                                    strokeWidth="2.6"
                                  />
                                  {/* Center 5-Pointed Star */}
                                  <path
                                    d="M 50.0 37.0 L 53.1 44.8 L 61.4 45.3 L 54.9 50.6 L 57.1 58.7 L 50.0 54.2 L 42.9 58.7 L 45.1 50.6 L 38.6 45.3 L 46.9 44.8 Z"
                                    fill="#22C55E"
                                    stroke="#22C55E"
                                    strokeWidth="1.2"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </span>

                            <span> your data</span>
                          </h3>
                        ) : (
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] text-neutral-950 tracking-[-0.03em] leading-[1.08] mb-3 sm:mb-4">
                            {item.headline}
                          </h3>
                        )}
                        <p className="font-sans text-base sm:text-lg md:text-xl lg:text-[21px] text-neutral-600 font-normal leading-relaxed max-w-xl lg:max-w-3xl">
                          {item.body}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start text-left gap-2.5 sm:gap-3.5 md:gap-4 select-none relative">
                        {/* Black text portion: "Security isn't just a feature here," */}
                        <div
                          ref={closingBlackTextRef}
                          className="will-change-[clip-path,opacity]"
                        >
                          <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] text-neutral-950 tracking-[-0.035em] leading-[1.15] flex items-baseline gap-x-[0.26em] whitespace-nowrap">
                            {CLOSING_BLACK_WORDS.map((word, wIdx) => (
                              <span
                                key={wIdx}
                                ref={(el) => {
                                  closingBlackWordRefs.current[wIdx] = el;
                                }}
                                className="inline-block will-change-transform"
                              >
                                {word}
                              </span>
                            ))}
                          </h2>
                        </div>

                        {/* Green text portion: "It's the baseline everything else is built on." */}
                        <div
                          ref={closingGreenTextRef}
                          className="will-change-[clip-path,opacity]"
                        >
                          <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] text-[#22C55E] tracking-[-0.035em] leading-[1.15] flex flex-col items-start gap-y-2.5 sm:gap-y-3.5 md:gap-y-4">
                            {/* Line 1: It's the baseline everything */}
                            <div className="flex items-baseline gap-x-[0.26em] whitespace-nowrap">
                              {CLOSING_GREEN_WORDS.slice(0, 4).map((word, wIdx) => (
                                <span
                                  key={wIdx}
                                  ref={(el) => {
                                    closingGreenWordRefs.current[wIdx] = el;
                                  }}
                                  className="inline-block will-change-transform"
                                >
                                  {word}
                                </span>
                              ))}
                            </div>
                            {/* Line 2: else is built on. */}
                            <div className="flex items-baseline gap-x-[0.26em] whitespace-nowrap">
                              {CLOSING_GREEN_WORDS.slice(4).map((word, sliceIdx) => {
                                const wIdx = sliceIdx + 4;
                                return (
                                  <span
                                    key={wIdx}
                                    ref={(el) => {
                                      closingGreenWordRefs.current[wIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {word}
                                  </span>
                                );
                              })}
                            </div>
                          </h2>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* LAYER 2B (z-25): LUMINOUS EVENT HORIZON PORTAL RIM (Zero GPU / DOM) */}
        {/* Frames the opening boundary during suction; dissolves as hole expands */}
        {/* =================================================================== */}
        <div
          ref={portalRimRef}
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/70 shadow-[0_0_45px_rgba(16,185,129,0.5),inset_0_0_25px_rgba(16,185,129,0.3)] z-25 opacity-0 will-change-[width,height,left,top,opacity]"
          style={{
            width: 0,
            height: 0,
            left: "57.0%",
            top: "48.5%",
          }}
        />

        {/* LAYER 2C (z-24): OPTION 2 CONCENTRIC GRAVITATIONAL PULSE RIPPLE      */}
        <div
          ref={portalRippleRef}
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40 shadow-[0_0_60px_rgba(16,185,129,0.3)] z-24 opacity-0 will-change-[width,height,left,top,opacity]"
          style={{
            width: 0,
            height: 0,
            left: "57.0%",
            top: "48.5%",
          }}
        />

        {/* =================================================================== */}
        {/* LAYER 1B (z-10): HERO HEADLINE & SUBTEXT                            */}
        {/* Positioned behind Iris Portal (z-20) so expanding iris covers it     */}
        {/* =================================================================== */}
        <div
          ref={heroIntroRef}
          className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-20 pb-8 max-w-7xl mx-auto w-full pointer-events-none will-change-transform"
        >
          <div className="flex-1 flex flex-col justify-center max-w-lg sm:max-w-xl lg:max-w-[580px] xl:max-w-[640px] -translate-x-8 sm:-translate-x-16 md:-translate-x-24 lg:-translate-x-32 xl:-translate-x-40 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
            <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-[42px] lg:text-[46px] xl:text-[52px] text-neutral-950 tracking-[-0.035em] leading-[1.15] select-none flex flex-col gap-3 sm:gap-3.5 lg:gap-4.5">
              <span>
                See everything you <span className="text-[#22C55E]" style={{ color: "#22C55E" }}>own.</span>
              </span>
              <span>
                Understand what it <span className="text-[#22C55E]" style={{ color: "#22C55E" }}>means.</span>
              </span>
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-[21px] text-[#5A685D] font-medium tracking-tight leading-relaxed select-none">
              Track. Understand. Act with confidence.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
