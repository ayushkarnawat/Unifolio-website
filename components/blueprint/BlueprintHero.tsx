"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

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

interface SecurityStateItem {
  type: "hero" | "principle" | "closing";
  headline?: string;
  body?: string;
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
    body: "Unifolio can see your accounts. It can never move your money.",
  },
  // State 3
  {
    type: "principle",
    headline: "We never save your passwords",
    body: "Your bank login stays with your bank. We connect through India's RBI-regulated Account Aggregator framework, so your credentials never reach us, by design.",
  },
  // State 4
  {
    type: "principle",
    headline: "Locked down, everywhere",
    body: "Your data is encrypted with AES-256 at rest and TLS in transit, the same standard banks use.",
  },
  // State 5
  {
    type: "principle",
    headline: "You control the connection",
    body: "Every account you link is approved by you and revocable anytime. Revoke it, and data sharing stops instantly.",
  },
  // State 6
  {
    type: "principle",
    headline: "Stored in India",
    body: "Your data stays on secure infrastructure based in India, meeting RBI's data localization requirements.",
  },
  // State 7
  {
    type: "principle",
    headline: "We don't sell your data",
    body: "It's used only to show you your own financial picture, never sold, never used for advertising, only ever with your consent, in line with India's DPDP Act.",
  },
  // State 8 — Closing
  {
    type: "closing",
    headline: "Security isn't a feature here. It's the baseline everything else is built on.",
  },
];

const PASSWORD_LETTERS = ["p", "a", "s", "s", "w", "o", "r", "d", "s"];
const LOCKED_LETTERS = ["L", "o", "c", "k", "e", "d"];
const CONNECTION_LETTERS = ["c", "o", "n", "n", "e", "c", "t", "i", "o", "n"];
const INDIA_LETTERS = ["I", "n", "d", "i", "a"];
const MONEY_LETTERS = ["m", "o", "n", "e", "y"];
const SELL_LETTERS = ["s", "e", "l", "l"];
const CLOSING_BLACK_WORDS = ["Security", "isn't", "a", "feature", "here."];
const CLOSING_GREEN_WORDS = ["It's", "the", "baseline", "everything", "else", "is", "built", "on."];

const ABOUT_PARA_1_WORDS = [
  "In", "most", "families,", "someone", "ends", "up", "in", "charge", "of", "the", "money,",
  "not", "because", "they", "trained", "for", "it,", "but", "because", "someone", "has", "to.",
  "Their", "financial", "data", "lives", "across", "a", "dozen", "apps", "and", "statements,",
  "and", "having", "it", "all", "in", "one", "place", "is", "not", "the", "same", "as", "understanding", "it."
];

const ABOUT_PARA_2_WORDS = [
  "Unifolio", "exists", "to", "close", "that", "gap,", "to", "give", "that", "person", "the", "same", "clarity",
  "a", "wealth", "manager", "gives", "their", "wealthiest", "clients,", "whether", "they", "hold", "₹5", "lakh",
  "or", "₹5", "crore,", "whether", "they've", "studied", "finance", "or", "never", "touched", "a", "balance", "sheet."
];

const ABOUT_PUNCHLINE_WORDS = [
  "Not", "just", "where", "their", "money", "is,", "but", "what", "it", "means."
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
  const companionCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const COMPANION_COUNT = 21;
  const productToRingTlRef = useRef<gsap.core.Timeline | null>(null);
  const ringRotateTweenRef = useRef<gsap.core.Tween | null>(null);

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
  const stateRef = useRef<"hero" | "product" | "sculpting" | "ring" | "about" | "faq">("hero");
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

  useEffect(() => {
    return () => {
      if (hoverCommitTimeoutRef.current) clearTimeout(hoverCommitTimeoutRef.current);
      if (arrivalIdleTimeoutRef.current) clearTimeout(arrivalIdleTimeoutRef.current);
      if (momentumDrainTimeoutRef.current) clearTimeout(momentumDrainTimeoutRef.current);
      if (heroToProductTlRef.current) {
        heroToProductTlRef.current.kill();
        heroToProductTlRef.current = null;
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
    });
  };

  // GSAP Interactive Card Hover Choreography: Unified, reversible, zero-glitch controller
  const commitCardHover = (idx: number | null) => {
    if (
      stateRef.current !== "product" ||
      transitionStartedRef.current ||
      transitionAnimatingRef.current ||
      isSecurityTransitioningRef.current
    ) {
      return;
    }
    isHoldingProductRef.current = true;
    productCompleteRef.current = true;
    if (currentHoverRef.current === idx) return;
    currentHoverRef.current = idx;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;

    const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;
    const expandedWidth = isDesktop ? 365 : isTablet ? 315 : 280;
    const compressedWidth = isDesktop ? 190 : isTablet ? 165 : 148;

    PRODUCT_CARDS.forEach((card, i) => {
      const wrapper = cardWrapperRefs.current[i];
      const defaultEl = cardDefaultRefs.current[i];
      const hoverEl = cardHoverRefs.current[i];
      const front = cardFrontRefs.current[i];
      const illus = cardIllustrationRefs.current[i];
      if (!wrapper) return;

      if (idx === null) {
        gsap.to(wrapper, {
          width: restingWidth,
          scale: 1,
          x: 0,
          y: card.restY,
          z: card.restZ,
          rotateY: card.restRotateY,
          rotateZ: card.restRotateZ,
          opacity: 1,
          zIndex: 10 + (2 - Math.abs(i - 2)),
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });

        if (defaultEl) {
          gsap.to(defaultEl, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (hoverEl) {
          gsap.to(hoverEl, {
            autoAlpha: 0,
            y: 8,
            duration: 0.12,
            ease: "power2.in",
            overwrite: "auto",
          });
        }

        if (illus) {
          gsap.to(illus, {
            opacity: 0.88,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (front) {
          gsap.to(front, {
            boxShadow:
              "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else if (i === idx) {
        gsap.to(wrapper, {
          width: expandedWidth,
          scale: 1.02,
          x: 0,
          y: card.restY - 6,
          z: card.restZ + 35,
          rotateY: 0,
          rotateZ: 0,
          opacity: 1,
          zIndex: 30,
          duration: 0.38,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Immediately fade out default centered heading so it NEVER overlaps reading copy
        if (defaultEl) {
          gsap.to(defaultEl, {
            autoAlpha: 0,
            scale: 0.94,
            y: -6,
            duration: 0.12,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        // Cleanly reveal expanded reading layout (title + bullets / paragraph)
        if (hoverEl) {
          gsap.to(hoverEl, {
            autoAlpha: 1,
            y: 0,
            duration: 0.25,
            delay: 0.04,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        // Remove sketch completely on hover to avoid cluttering reading layout
        if (illus) {
          gsap.to(illus, {
            opacity: 0,
            scale: 0.95,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (front) {
          gsap.to(front, {
            boxShadow:
              "0 25px 50px -12px rgba(16, 185, 129, 0.35), 0 0 0 1px rgba(16, 185, 129, 0.5)",
            borderColor: "rgba(16, 185, 129, 0.5)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else {
        gsap.to(wrapper, {
          width: compressedWidth,
          scale: 0.98,
          x: 0,
          y: card.restY + 2,
          z: card.restZ - 8,
          rotateY: card.restRotateY,
          rotateZ: card.restRotateZ,
          opacity: 0.7,
          zIndex: 10,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });

        if (defaultEl) {
          gsap.to(defaultEl, {
            autoAlpha: 0.65,
            scale: 0.96,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        // Ensure non-hovered cards have their reading layout hidden with no delay
        if (hoverEl) {
          gsap.to(hoverEl, {
            autoAlpha: 0,
            y: 8,
            duration: 0.12,
            ease: "power2.in",
            overwrite: "auto",
          });
        }

        if (illus) {
          gsap.to(illus, {
            opacity: 0.65,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (front) {
          gsap.to(front, {
            boxShadow:
              "0 15px 30px -10px rgba(0, 0, 0, 0.7), 0 4px 10px -4px rgba(0, 0, 0, 0.5)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    });
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

  const handleCardHover = (idx: number | null) => {
    if (
      stateRef.current !== "product" ||
      transitionStartedRef.current ||
      transitionAnimatingRef.current ||
      isSecurityTransitioningRef.current
    ) {
      if (hoverCommitTimeoutRef.current) {
        clearTimeout(hoverCommitTimeoutRef.current);
        hoverCommitTimeoutRef.current = null;
      }
      return;
    }
    if (idx === currentHoverRef.current) {
      if (hoverCommitTimeoutRef.current) {
        clearTimeout(hoverCommitTimeoutRef.current);
        hoverCommitTimeoutRef.current = null;
      }
      return;
    }
    if (hoverCommitTimeoutRef.current) {
      clearTimeout(hoverCommitTimeoutRef.current);
      hoverCommitTimeoutRef.current = null;
    }
    const delay = idx === null ? 70 : 10;
    hoverCommitTimeoutRef.current = setTimeout(() => {
      hoverCommitTimeoutRef.current = null;
      commitCardHover(idx);
    }, delay);
  };

  useGSAP(
    () => {
      if (!containerRef.current || !stageRef.current) return;

      const reduced = prefersReducedMotion();

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
        return Math.max(145, Math.round(Math.min(window.innerWidth * 0.115, window.innerHeight * 0.22)));
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
      gsap.set(heroIntroRef.current, { opacity: 1, x: 0, y: 0, scale: 1 });

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

      // Product Header initially hidden
      gsap.set(headlineRef.current, { opacity: 0, y: -25 });
      gsap.set(subheadRef.current, { opacity: 0, y: -15 });
      gsap.set(ctaRef.current, { opacity: 0, scale: 0.9, y: -10 });

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
      };

      window.addEventListener("unifolio-logo-docked", revealHeroAfterDocked);
      window.addEventListener("unifolio-intro-complete", revealHeroAfterDocked);

      // =======================================================================
      // HERO -> PRODUCT SINGLE-TRIGGER CINEMATIC TRANSITION
      // Plays automatically at controlled speed upon first downward scroll gesture
      // Sequence: Ring expands -> Cards emerge -> Cards flip one-by-one -> Product lands
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
          },
          onComplete: () => {
            stateRef.current = "product";
            productCompleteRef.current = true;
            isHoldingProductRef.current = true;
            transitionAnimatingRef.current = false;
            setIsAperturePaused(true);
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "";
            forceResetAllCardsToBase();
            window.dispatchEvent(
              new CustomEvent("unifolio-active-section", { detail: { section: "product" } })
            );
          },
          onReverseComplete: () => {
            stateRef.current = "hero";
            productCompleteRef.current = false;
            isHoldingProductRef.current = false;
            transitionAnimatingRef.current = false;
            setIsAperturePaused(false);
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "none";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "none";
            window.dispatchEvent(
              new CustomEvent("unifolio-active-section", { detail: { section: "hero" } })
            );
          },
        });

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

        // - Product Header illuminates
        tl.to(
          headlineRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.26,
            ease: "power2.out",
          },
          0.42
        );

        tl.to(
          subheadRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.26,
            ease: "power2.out",
          },
          0.46
        );

        tl.to(
          ctaRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.28,
            ease: "back.out(1.2)",
          },
          0.50
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

        // Buffer at end before settling
        tl.to({}, { duration: 0.08 }, flipBaseStart + 4 * flipStagger + flipDuration);

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

      const triggerProductToHero = () => {
        if (transitionAnimatingRef.current || stateRef.current !== "product") return;
        transitionAnimatingRef.current = true;
        stateRef.current = "sculpting";
        isHoldingProductRef.current = false;
        productCompleteRef.current = false;

        if (heroToProductTlRef.current) {
          heroToProductTlRef.current.timeScale(1.3).reverse();
        } else {
          handleResetHero();
        }
      };

      // =======================================================================
      // PRODUCT -> RING TRANSITION (RECREATED EXACTLY FROM recreate.mp4)
      // =======================================================================
      const createProductToRingTimeline = () => {
        const clusterEl = cardsClusterRef.current;
        if (!clusterEl) return gsap.timeline();

        // Ensure every card is synchronously at pristine base/default state before measuring bounds and centers
        forceResetAllCardsToBase();

        const clusterRect = clusterEl.getBoundingClientRect();
        const clusterCenterX = clusterRect.left + clusterRect.width / 2;
        const clusterCenterY = clusterRect.top + clusterRect.height / 2;

        // Measure initial center of each of the 5 original cards relative to cluster center
        const origCenters = PRODUCT_CARDS.map((_, i) => {
          const el = cardWrapperRefs.current[i];
          if (!el) return { x: 0, y: 0 };
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - clusterCenterX,
            y: r.top + r.height / 2 - clusterCenterY,
          };
        });
        origCentersRef.current = origCenters;

        // Destination center for Phase 1 stacking: Card 05's current horizontal position
        const stackTargetX = origCenters[4].x;
        const stackTargetY = origCenters[4].y + PRODUCT_CARDS[4].restY;

        // Compute the 26 ring slots matching 'Cards ring.png' and recreate.mp4
        const TOTAL_RING_CARDS = 26;
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;

        // Comfortable radius so ring has generous negative space and matches frame 180 (hole ~350px)
        const ringRadius = Math.min(Math.max(vh * 0.22, 160), 220);
        const finalCardScale = isDesktop ? 0.52 : isTablet ? 0.48 : 0.44;
        const stackCardScale = isDesktop ? 0.62 : isTablet ? 0.58 : 0.54;
        const START_ALPHA = 225; // Top-Left (Card 01) in screen angles
        const ANGLE_STEP = 360.0 / TOTAL_RING_CARDS; // ~13.846 deg

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

        const ringSlots: RingSlot[] = [];
        for (let k = 0; k < TOTAL_RING_CARDS; k++) {
          const alphaDeg = (START_ALPHA - k * ANGLE_STEP) % 360;
          const rad = (alphaDeg * Math.PI) / 180;
          const x = ringRadius * Math.cos(rad);
          const y = ringRadius * Math.sin(rad);
          // Foreground cards (Cards 01-05 on left) pop closer in +Z
          const z = 55 * Math.sin(((alphaDeg - 45) * Math.PI) / 180);
          // Tangent orientation radiating around the ring
          const tangentDeg = (Math.atan2(-Math.cos(rad), Math.sin(rad)) * 180) / Math.PI;

          ringSlots.push({
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

        // Pre-position companion cards at Card 05's stack position underneath Card 05
        companionCardRefs.current.forEach((compEl, cIdx) => {
          if (!compEl) return;
          gsap.set(compEl, {
            xPercent: -50,
            yPercent: -50,
            x: stackTargetX,
            y: stackTargetY,
            z: -20 - cIdx * 3,
            rotateX: 38,
            rotateY: -22,
            rotateZ: -24,
            scale: stackCardScale,
            opacity: 0,
            visibility: "hidden",
          });
        });

        // Viewport centering offset: positions the ring centered in the viewport
        const viewportCenterY = (typeof window !== "undefined" ? window.innerHeight : 900) / 2;
        const viewportCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
        const targetRingY = Math.round(viewportCenterY - clusterCenterY + 18);
        const targetRingX = Math.round(viewportCenterX - clusterCenterX);
        const leftShift = isDesktop
          ? Math.round(viewportCenterX * 0.44)
          : isTablet
          ? Math.round(viewportCenterX * 0.32)
          : Math.round(viewportCenterX * 0.20);
        const targetLeftX = targetRingX - leftShift;
        const ringRightEdgeRelX = -leftShift + ringRadius + 55;
        const rightShiftX = isDesktop
          ? Math.round(viewportCenterX * 0.42)
          : isTablet
          ? Math.round(viewportCenterX * 0.30)
          : Math.round(viewportCenterX * 0.16);
        const heroShiftX = isDesktop
          ? Math.round(ringRightEdgeRelX + 40)
          : isTablet
          ? Math.round(ringRightEdgeRelX + 30)
          : 0;

        targetLeftXRef.current = targetLeftX;
        targetRingYRef.current = targetRingY;
        heroShiftXRef.current = heroShiftX;
        rightShiftXRef.current = rightShiftX;

        const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;

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
            // Ensure no text, illustration, or background gradient is visible on any cards in the ring
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
            cardGlassOverlayRefs.current.forEach((el) => {
              if (el) gsap.set(el, { autoAlpha: 1, opacity: 1, visibility: "visible" });
            });
            PRODUCT_CARDS.forEach((_, i) => {
              const front = cardFrontRefs.current[i];
              if (front) gsap.set(front, { backgroundColor: "transparent" });
            });

            // Re-enable pointer events now that ring formation has settled completely
            if (cardsClusterRef.current) {
              cardsClusterRef.current.style.pointerEvents = "";
            }
            if (cardsStageRef.current) {
              cardsStageRef.current.style.pointerEvents = "";
            }

            // Seamlessly continue the slow rotation indefinitely at constant speed (if not already running)
            // Uses explicit absolute range from 376° to 736° (+360°) with repeat to prevent transform accumulation and drift
            if (!ringRotateTweenRef.current || !ringRotateTweenRef.current.isActive()) {
              ringRotateTweenRef.current = gsap.fromTo(
                clusterEl,
                { rotateZ: 376 },
                {
                  rotateZ: 736,
                  duration: 26,
                  repeat: -1,
                  ease: "none",
                  force3D: true,
                }
              );
            }

            // The viewport and stage REMAIN strictly locked and fixed!
            // stageRef.current stays position: fixed, width: 100%, height: 100vh, zIndex: 40
            // document overflow stays hidden
            // Discrete scroll gestures now control Security States 1 to 8!

            // Trigger money transformation animation once hero text has settled in right-side Security layout
            playMoneyAnimation();
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

            if (securityStageRef.current) {
              gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden", zIndex: 15 });
            }
            securityStateRefs.current.forEach((el, idx) => {
              if (el) {
                if (idx === 0) {
                  gsap.set(el, { opacity: 0, visibility: "hidden", x: heroShiftX, y: 0, scale: 1, clipPath: "none" });
                } else {
                  gsap.set(el, { opacity: 0, visibility: "hidden", x: rightShiftX, y: 0 });
                }
              }
            });

            gsap.set(
              [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
              {
                autoAlpha: 1,
                opacity: 1,
                y: 0,
                visibility: "visible",
              }
            );

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

            // Force all cards to base state cleanly on return to product
            forceResetAllCardsToBase();

            companionCardRefs.current.forEach((compEl) => {
              if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
            });
          },
        });

        // Ensure cards cluster starts cleanly at time 0 with absolute initial transforms
        tl.set(clusterEl, { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 }, 0);

        // Deterministic initial transform and style states for all 5 product cards at time 0
        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const front = cardFrontRefs.current[i];
          if (wrapper) {
            tl.set(
              wrapper,
              {
                width: restingWidth,
                x: 0,
                y: card.restY,
                z: card.restZ,
                rotateX: 0,
                rotateY: card.restRotateY,
                rotateZ: card.restRotateZ,
                scale: 1,
                opacity: 1,
                zIndex: 10 + (2 - Math.abs(i - 2)),
              },
              0
            );
          }
          if (front) {
            tl.set(
              front,
              {
                background: "",
                backgroundColor: "#070908",
                borderColor: "rgba(255, 255, 255, 0.12)",
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
              },
              0
            );
          }
        });

        // Deterministic initial hidden stack state for all 21 companion cards at time 0
        companionCardRefs.current.forEach((compEl, cIdx) => {
          if (!compEl) return;
          tl.set(
            compEl,
            {
              xPercent: -50,
              yPercent: -50,
              x: stackTargetX,
              y: stackTargetY,
              z: -20 - cIdx * 3,
              rotateX: 38,
              rotateY: -22,
              rotateZ: -24,
              scale: stackCardScale,
              opacity: 0,
              visibility: "hidden",
            },
            0
          );
        });

        cardGradientBgRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 1 }, 0);
        });
        cardIllustrationRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 0.88, scale: 1, filter: "blur(0px)" }, 0);
        });
        cardBackRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 0 }, 0);
        });
        cardGlassOverlayRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 0 }, 0);
        });
        cardDefaultRefs.current.forEach((el) => {
          if (el) tl.set(el, { display: "flex", opacity: 1, autoAlpha: 1, scale: 1, y: 0, visibility: "visible" }, 0);
        });
        cardHoverRefs.current.forEach((el) => {
          if (el) tl.set(el, { display: "flex", opacity: 0, autoAlpha: 0, scale: 1, y: 8, visibility: "hidden" }, 0);
        });
        tl.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          { autoAlpha: 1, opacity: 1, y: 0, visibility: "visible" },
          0
        );

        // Security Stage positioned & ready behind cards layer (z-15) from the beginning
        tl.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 15 }, 0);
        securityStateRefs.current.forEach((el, idx) => {
          if (el) {
            const sX = idx === 0 ? heroShiftX : rightShiftX;
            tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: sX, y: 0, clipPath: "none" }, 0);
          }
        });
        if (securityHeroRibbonRef.current) {
          tl.set(securityHeroRibbonRef.current, { x: 0 }, 0);
        }

        // -------------------------------------------------------------------------
        // PHASE 1: CARDS CONSOLIDATE HORIZONTALLY (0.0s -> 0.52s)
        // Cards consolidate slightly faster into horizontal stack at Card 05.
        // The Security hero text is NOT revealed during this movement.
        // -------------------------------------------------------------------------
        const transitionDuration = 0.52;

        // 1. Product hero content exits smoothly
        tl.to(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          {
            autoAlpha: 0,
            opacity: 0,
            y: 16,
            duration: 0.44,
            ease: "power2.out",
            stagger: 0.01,
          },
          0.0
        );
        tl.set(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          { autoAlpha: 0, opacity: 0, visibility: "hidden" },
          transitionDuration
        );

        // 2. Cards consolidate horizontally into stack at Card 05 (slightly faster)
        const STACK_ROTX = 38;
        const STACK_ROTY = -22;
        const STACK_ROTZ = -24;

        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const stackStart = i * 0.024;
          const destX = (stackTargetX - origCenters[i].x) - (4 - i) * 3.0;
          const destY = (stackTargetY - origCenters[i].y) + (4 - i) * 2.0;
          const destZ = (i - 4) * 4;

          tl.to(
            wrapper,
            {
              x: destX,
              y: destY,
              z: destZ,
              rotateX: STACK_ROTX,
              rotateY: STACK_ROTY,
              rotateZ: STACK_ROTZ,
              scale: stackCardScale,
              duration: transitionDuration - stackStart,
              ease: "power2.inOut",
            },
            stackStart
          );
        });

        // Keep text, illustrations, and gradients visible while cards slide from left to right,
        // and fade them out smoothly as cards arrive into the stack, so that as soon as the cards
        // are done sliding and forming the stack (at transitionDuration = 0.52s), ALL text is completely gone.
        const contentFadeStart = 0.34;
        const contentFadeDuration = 0.18; // Finishes precisely at 0.52s (transitionDuration)

        cardDefaultRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { autoAlpha: 0, opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardHoverRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { autoAlpha: 0, opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardIllustrationRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { autoAlpha: 0, opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardGradientBgRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { autoAlpha: 0, opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardBackRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { autoAlpha: 0, opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardGlassOverlayRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { autoAlpha: 1, opacity: 1, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });

        // Exact point the cards are done sliding and form the stack (transitionDuration = 0.52s):
        // Remove that text at that point itself! Set display: "none" so GPU textures never leak into 3D ring.
        tl.set(
          [
            ...cardDefaultRefs.current.filter(Boolean),
            ...cardHoverRefs.current.filter(Boolean),
            ...cardIllustrationRefs.current.filter(Boolean),
            ...cardGradientBgRefs.current.filter(Boolean),
            ...cardBackRefs.current.filter(Boolean),
          ],
          { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" },
          transitionDuration
        );

        if (clusterEl) {
          const textNodes = clusterEl.querySelectorAll('[data-card-text="true"], .product-card-text');
          if (textNodes.length > 0) {
            tl.to(
              textNodes,
              { autoAlpha: 0, opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
            tl.set(
              textNodes,
              { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" },
              transitionDuration
            );
          }
        }

        // Card front surfaces smoothly crystallize into clean smoked emerald translucent glass (matching companion cards)
        PRODUCT_CARDS.forEach((_, i) => {
          const front = cardFrontRefs.current[i];
          const slotK = i; // slots 0 to 4
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
                duration: contentFadeDuration,
                ease: "power2.out",
              },
              contentFadeStart
            );
          }
        });

        // -------------------------------------------------------------------------
        // PHASE 2: ZERO-PAUSE CONTINUATION INTO THE RING FORMATION (0.52s -> 1.88s)
        // Stacking immediately continues without pause along the curved trajectory to form the ring.
        // Ring formation is slightly slowed down so the progressive text reveal feels cinematic.
        // -------------------------------------------------------------------------
        const unfurlBase = transitionDuration; // 0.52s - immediate continuation, no pause

        // Guarantee zero text persists on any card as the stack leaves and moves to form the ring
        tl.set(
          [
            ...cardDefaultRefs.current.filter(Boolean),
            ...cardHoverRefs.current.filter(Boolean),
            ...cardBackRefs.current.filter(Boolean),
          ],
          { display: "none", autoAlpha: 0, opacity: 0, visibility: "hidden" },
          unfurlBase
        );

        // Center cluster container with subtle 3D perspective tilt
        tl.to(
          clusterEl,
          {
            x: targetRingX,
            y: targetRingY,
            rotateX: 18,
            rotateY: 20,
            rotateZ: 16,
            duration: 1.25,
            ease: "power2.out",
          },
          unfurlBase
        );

        // 2A. The 5 Original Product Cards lead the unfurling into slots 0 to 4 (Left Arc)
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const slot = ringSlots[i];
          const startTime = unfurlBase + i * 0.022;
          const origX = origCenters[i].x;
          const origY = origCenters[i].y;

          const midX = (stackTargetX + slot.x) * 0.48;
          const midY = (stackTargetY + slot.y) * 0.5 + 20;
          const midZ = slot.z * 0.5;
          const midRotZ = STACK_ROTZ * 0.35 + slot.rotZ * 0.65;

          tl.set(wrapper, { zIndex: slot.zIndex }, startTime);

          tl.to(
            wrapper,
            {
              keyframes: [
                {
                  x: midX - origX,
                  y: midY - origY,
                  z: midZ,
                  rotateX: 28,
                  rotateY: 22,
                  rotateZ: midRotZ,
                  scale: finalCardScale,
                  duration: 0.36,
                  ease: "power1.inOut",
                },
                {
                  x: slot.x - origX,
                  y: slot.y - origY,
                  z: slot.z,
                  rotateX: slot.rotX,
                  rotateY: slot.rotY,
                  rotateZ: slot.rotZ,
                  scale: slot.scale,
                  duration: 0.44,
                  ease: "power1.out",
                },
              ],
              ease: "none",
              force3D: true,
            },
            startTime
          );
        });

        // 2B. 21 Companion Cards propagate in overlapping cascade from within moving stack
        companionCardRefs.current.forEach((compEl, cIdx) => {
          if (!compEl) return;

          const slotIdx = 5 + cIdx;
          const slot = ringSlots[slotIdx];
          const startTime = unfurlBase + 0.06 + cIdx * 0.020;

          const midX = (stackTargetX + slot.x) * 0.48;
          const midY = (stackTargetY + slot.y) * 0.5 + 20;
          const midZ = slot.z * 0.5;
          const midRotZ = STACK_ROTZ * 0.35 + slot.rotZ * 0.65;

          tl.set(
            compEl,
            {
              opacity: 1,
              visibility: "visible",
              zIndex: slot.zIndex,
            },
            startTime
          );

          tl.to(
            compEl,
            {
              keyframes: [
                {
                  x: midX,
                  y: midY,
                  z: midZ,
                  rotateX: 28,
                  rotateY: 22,
                  rotateZ: midRotZ,
                  scale: finalCardScale,
                  duration: 0.36,
                  ease: "power1.inOut",
                },
                {
                  x: slot.x,
                  y: slot.y,
                  z: slot.z,
                  rotateX: slot.rotX,
                  rotateY: slot.rotY,
                  rotateZ: slot.rotZ,
                  scale: slot.scale,
                  duration: 0.44,
                  ease: "power1.out",
                },
              ],
              ease: "none",
              force3D: true,
            },
            startTime
          );
        });

        // -------------------------------------------------------------------------
        // STATE 0 SECURITY HERO TEXT REVEAL: SMOOTH CARD-TRAIN ATTACHMENT
        // Synchronized with departing cards from the stack at Card 05.
        // CARDS LEAD -> TEXT FOLLOWS DIRECTLY BEHIND -> SETTLES IN RESTING POSITION
        // Clean, uncut two-line typography with locked line breaks.
        // -------------------------------------------------------------------------
        const state0El = securityStateRefs.current[0];
        const ribbonEl = securityHeroRibbonRef.current;

        if (state0El && ribbonEl) {
          // In state0El local coordinates (where 0 is center of state0El at heroShiftX):
          // Stack center relative to state0El center:
          const stackLocalCenterX = stackTargetX - heroShiftX;
          // Smooth entrance offset tucked behind the card stack:
          const enterOffset = Math.max(Math.min(stackLocalCenterX, 140), 60);

          // Phase 1 (0.0s): Completely hidden behind the stack
          tl.set(state0El, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: heroShiftX, y: 0, clipPath: "none" }, 0);
          tl.set(ribbonEl, { x: enterOffset, opacity: 0 }, 0);

          // Phase 2: As cards depart from stack (unfurlBase = 0.52s):
          // Make container visible with clipPath strictly 'none' so no text is ever cut
          tl.set(
            state0El,
            {
              autoAlpha: 1,
              opacity: 1,
              visibility: "visible",
              clipPath: "none",
            },
            unfurlBase
          );

          // As Card 01 leads and pulls away leftward toward the ring:
          // The headline emerges smoothly from behind the departing cards, following them into resting position
          const ribbonPullStart = unfurlBase + 0.04; // 0.56s - cards visibly lead the motion
          const ribbonPullDuration = 1.10; // 0.56s -> 1.66s (settles smoothly as ring forms)

          tl.fromTo(
            ribbonEl,
            { x: enterOffset, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: ribbonPullDuration,
              ease: "power2.out",
            },
            ribbonPullStart
          );

          // Ensure clipPath remains none
          tl.set(state0El, { clipPath: "none" }, ribbonPullStart + ribbonPullDuration);
        }

        // -------------------------------------------------------------------------
        // PHASE 3: RING ROTATES & DOCKS TO LEFT (1.88s -> 3.98s)
        // Ring moves from center toward its final left position, completing exactly
        // one full 360° rotation in perfect synchronization.
        // The Security hero text is already settled in its right-side column position!
        // -------------------------------------------------------------------------
        const ringFormedTime = 1.88; // Ring formation complete; seamlessly rolls into left position
        const glideDuration = 2.10; // Unified cinematic travel & rotation to the left side
        const ringSettleTime = ringFormedTime + glideDuration; // 3.98s

        // 1. Smoothly translate the entire ring towards the left side of the viewport
        tl.to(
          clusterEl,
          {
            x: targetLeftX,
            duration: glideDuration,
            ease: "power2.inOut",
            force3D: true,
          },
          ringFormedTime
        );

        // 2. Simultaneously rotate the ring while travelling left (exactly one full 360° rotation)
        // Perfectly synchronized with horizontal translation: identical start, duration, and ease
        tl.to(
          clusterEl,
          {
            rotateZ: 16 + 360,
            duration: glideDuration,
            ease: "power2.inOut",
            force3D: true,
          },
          ringFormedTime
        );

        // 4. Elevate Security Stage z-index to 35 once docked on the left
        tl.set(securityStageRef.current, { zIndex: 35 }, ringSettleTime);

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

      const exitAboutToFaq = () => {
        if (isSecurityTransitioningRef.current) return;
        isSecurityTransitioningRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();

        if (aboutOrbitTweenRef.current) {
          aboutOrbitTweenRef.current.kill();
          aboutOrbitTweenRef.current = null;
        }

        gsap.to([cardsClusterRef.current, aboutContentRef.current], {
          y: -window.innerHeight * 0.65,
          opacity: 0,
          duration: 0.50,
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
                smoothScrollTo(faqEl, { duration: 0.85, ease: "power2.inOut" });
              }
              window.dispatchEvent(
                new CustomEvent("unifolio-active-section", { detail: { section: "faq" } })
              );
            });
          },
        });
      };

      const jumpToAboutState = () => {
        if (stateRef.current === "about") return;
        if (stateRef.current === "ring") {
          consolidateRingToStack();
          return;
        }

        isSecurityTransitioningRef.current = true;
        stateRef.current = "about";
        setIsAperturePaused(true);
        productCompleteRef.current = true;

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
        }

        if (irisPortalRef.current) gsap.set(irisPortalRef.current, { opacity: 1, clipPath: "circle(150% at 50% 50%)" });
        if (headerRef.current) gsap.set(headerRef.current, { opacity: 0 });
        if (securityStageRef.current) gsap.set(securityStageRef.current, { opacity: 0 });
        securityStateRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, visibility: "hidden" });
        });

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];

        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
        const targetEnvelopeY = isDesk ? 95 : isTab ? 80 : 65;

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
          });
        }

        if (docPaperSheetRef.current) {
          gsap.set(docPaperSheetRef.current, { height: 930 });
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

        if (cardsClusterRef.current) {
          gsap.fromTo(
            cardsClusterRef.current,
            {
              x: 0,
              y: -window.innerHeight * 0.45,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: 0.95,
              opacity: 0,
            },
            {
              x: 0,
              y: targetEnvelopeY + 140,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
              duration: 0.55,
              ease: "power2.out",
            }
          );
        }

        if (aboutContentRef.current) {
          gsap.fromTo(
            aboutContentRef.current,
            { opacity: 0, y: -40 },
            {
              opacity: 1,
              y: 0,
              visibility: "visible",
              duration: 0.55,
              ease: "power2.out",
              onComplete: () => {
                isSecurityTransitioningRef.current = false;
              },
            }
          );
        } else {
          isSecurityTransitioningRef.current = false;
        }

        isRingConsolidatedRef.current = true;
        window.dispatchEvent(
          new CustomEvent("unifolio-active-section", { detail: { section: "about" } })
        );
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
        const currentRot = Number(gsap.getProperty(clusterEl, "rotateZ")) || 376;
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }

        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const stackCardScale = isDesktop ? 0.60 : isTablet ? 0.56 : 0.52;
        const targetEnvelopeY = isDesktop ? 95 : isTablet ? 80 : 65;

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];
        const ringSlots = computeRingSlots();

        // Target: cards consolidate into tight horizontal stack matching reference attachment
        const frontX = 35;

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

        const tl = gsap.timeline({
          onUpdate: () => {
            const time = tl.time();
            // During consolidation (< 0.96s), both statement lines remain 100% visible and untouched
            if (time < 0.96) {
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

            // 2. Spatial erasure of Black Line (swept Left -> Right, 0.96s -> 1.48s)
            if (closingBlackTextRef.current) {
              const bCurRect = closingBlackTextRef.current.getBoundingClientRect();
              if (time >= 1.50 || wipeRightX >= bCurRect.right) {
                closingBlackTextRef.current.style.clipPath = `inset(0 0 0 ${bCurRect.width}px)`;
                (closingBlackTextRef.current.style as any).webkitClipPath = `inset(0 0 0 ${bCurRect.width}px)`;
              } else {
                const bProgress = Math.max(0, Math.min(bCurRect.width, wipeRightX - bCurRect.left));
                closingBlackTextRef.current.style.clipPath = `inset(0 0 0 ${bProgress}px)`;
                (closingBlackTextRef.current.style as any).webkitClipPath = `inset(0 0 0 ${bProgress}px)`;
              }
            }

            // 3. Spatial erasure of Green Line (swept Right -> Left return, 1.76s -> 2.30s)
            if (closingGreenTextRef.current) {
              const gCurRect = closingGreenTextRef.current.getBoundingClientRect();
              if (time < 1.76) {
                closingGreenTextRef.current.style.clipPath = "none";
                (closingGreenTextRef.current.style as any).webkitClipPath = "none";
              } else if (time >= 2.32 || wipeLeftX <= gCurRect.left) {
                closingGreenTextRef.current.style.clipPath = `inset(0 ${gCurRect.width}px 0 0)`;
                (closingGreenTextRef.current.style as any).webkitClipPath = `inset(0 ${gCurRect.width}px 0 0)`;
              } else {
                const gRightClip = Math.max(0, Math.min(gCurRect.width, gCurRect.right - wipeLeftX));
                closingGreenTextRef.current.style.clipPath = `inset(0 ${gRightClip}px 0 0)`;
                (closingGreenTextRef.current.style as any).webkitClipPath = `inset(0 ${gRightClip}px 0 0)`;
              }
            }
          },
          onComplete: () => {
            isRingConsolidatedRef.current = true;
            isSecurityTransitioningRef.current = false;
            stateRef.current = "about";

            // Update Navbar
            window.dispatchEvent(
              new CustomEvent("unifolio-active-section", { detail: { section: "about" } })
            );
          },
          onReverseComplete: () => {
            isSecurityTransitioningRef.current = false;
            isRingConsolidatedRef.current = false;
            stateRef.current = "ring";

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
                gsap.set(cardEl, { opacity: 1, visibility: "visible", borderRadius: "20px" });
              }
            });

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
              gsap.set(securityStateRefs.current[7], { opacity: 1, y: 0 });
            }

            // Restore ambient ring rotation seamlessly
            if (!ringRotateTweenRef.current || !ringRotateTweenRef.current.isActive()) {
              ringRotateTweenRef.current = gsap.fromTo(
                clusterEl,
                { rotateZ: currentRot },
                {
                  rotateZ: currentRot + 360,
                  duration: 26,
                  repeat: -1,
                  ease: "none",
                  force3D: true,
                }
              );
            }
            window.dispatchEvent(
              new CustomEvent("unifolio-active-section", { detail: { section: "security" } })
            );
          },
        });
        consolidationTlRef.current = tl;

        // Initialize About cinematic atmosphere to hidden at time 0
        if (aboutContentRef.current) {
          tl.set(aboutContentRef.current, { visibility: "hidden", opacity: 0 }, 0);
        }

        // Cluster counter-rotates backward along the unwind, settling to neutral upright orientation
        tl.to(
          clusterEl,
          {
            rotateZ: currentRot - 80,
            rotateX: 0,
            rotateY: 0,
            duration: 0.88,
            ease: "power2.inOut",
          },
          0
        );

        // 2A. Product Cards 0..4 consolidate sequentially into the horizontal stack
        allProductCards.forEach((wrapper, i) => {
          const slot = ringSlots[i];
          const kDelay = i * 0.018;
          const origX = origCentersRef.current[i]?.x ?? 0;
          const origY = origCentersRef.current[i]?.y ?? 0;

          const destX = frontX - i * 2.8;
          const destY = 0;
          const destZ = -i * 2.2;

          const midX = slot.x * 0.45 + destX * 0.55;
          const midY = slot.y * 0.45 + destY * 0.55;
          const midZ = slot.z * 0.4 + destZ * 0.6 + 12;
          const midRotZ = slot.rotZ * 0.35;
          const midRotX = slot.rotX * 0.4;
          const midRotY = slot.rotY * 0.4;
          const midScale = slot.scale * 0.45 + stackCardScale * 0.55;

          tl.set(wrapper, { zIndex: 100 - i }, kDelay);

          tl.to(
            wrapper,
            {
              keyframes: [
                {
                  x: midX - origX,
                  y: midY - origY,
                  z: midZ,
                  rotateX: midRotX,
                  rotateY: midRotY,
                  rotateZ: midRotZ,
                  scale: midScale,
                  duration: 0.26,
                  ease: "power1.inOut",
                },
                {
                  x: destX - origX,
                  y: destY - origY,
                  z: destZ,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                  scale: stackCardScale,
                  duration: 0.34,
                  ease: "power2.out",
                },
              ],
              force3D: true,
            },
            kDelay
          );
        });

        // 2B. Companion Cards 5..25 consolidate sequentially behind the product cards
        allCompanionCards.forEach((compEl, cIdx) => {
          const k = 5 + cIdx;
          const slot = ringSlots[k];
          const kDelay = k * 0.016;

          const destX = frontX - k * 2.8;
          const destY = 0;
          const destZ = -k * 2.2;

          const midX = slot.x * 0.45 + destX * 0.55;
          const midY = slot.y * 0.45 + destY * 0.55;
          const midZ = slot.z * 0.4 + destZ * 0.6 + 10;
          const midRotZ = slot.rotZ * 0.35;
          const midRotX = slot.rotX * 0.4;
          const midRotY = slot.rotY * 0.4;
          const midScale = slot.scale * 0.45 + stackCardScale * 0.55;

          tl.set(compEl, { zIndex: 100 - k, visibility: "visible" }, kDelay);

          tl.to(
            compEl,
            {
              keyframes: [
                {
                  x: midX,
                  y: midY,
                  z: midZ,
                  rotateX: midRotX,
                  rotateY: midRotY,
                  rotateZ: midRotZ,
                  scale: midScale,
                  duration: 0.26,
                  ease: "power1.inOut",
                },
                {
                  x: destX,
                  y: destY,
                  z: destZ,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                  scale: stackCardScale,
                  duration: 0.34,
                  ease: "power2.out",
                },
              ],
              force3D: true,
            },
            kDelay
          );
        });

        // 3. Settled beat as the stack locks in place
        tl.to(
          clusterEl,
          {
            scale: 1.015,
            duration: 0.06,
            ease: "power1.out",
          },
          0.94
        );
        tl.to(
          clusterEl,
          {
            scale: 1.0,
            duration: 0.06,
            ease: "power1.in",
          },
          1.00
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
          0.96
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
            1.02 + lagIdx * 0.04
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
            1.48 + lagIdx * 0.03
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
            1.78 + lagIdx * 0.03
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
            2.30 + lagIdx * 0.03
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
            2.58 + lagIdx * 0.03
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
            2.95 + lagIdx * 0.03
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
          2.60
        );

        // Continuous Cinematic Background Transition:
        // As the cards initiate their downward drop from Security into About (2.40s),
        // smoothly transition the background from clean/light into the cinematic dark forest-green atmosphere.
        // Fully established by 3.45s as the cards land and begin morphing into the envelope.
        if (aboutContentRef.current) {
          tl.set(aboutContentRef.current, { visibility: "visible" }, 2.40);
          tl.fromTo(
            aboutContentRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.05,
              ease: "power2.inOut",
            },
            2.40
          );
        }

        // =========================================================================
        // DIRECT MORPH: DROPPED CARDS MORPH DIRECTLY INTO ENVELOPE (3.25s -> 4.55s)
        // Cards drop and immediately fold & expand outward into the envelope geometry.
        // Cluster glides to dead-center, cards flatten radii & merge surfaces,
        // and the single unified physical envelope emerges at screen center.
        // =========================================================================
        // =========================================================================
        // PHYSICAL TRANSFORMATION: CARDS DROP -> SCATTER -> GATHER/COMPRESS -> MORPH
        // 1. CARDS DROP & SCATTER (3.15s -> 3.52s):
        //    Cards land and organically scatter across the surface with physical momentum,
        //    angular variance (-16deg to +16deg), 3D pitch/yaw, and realistic depth.
        // 2. GATHER / COMPRESS (3.54s -> 3.88s):
        //    Scattered cards magnetically draw inward and compress into a tight, dense,
        //    solid rectangular pack at the exact center (borderRadius: 20px -> 16px).
        // 3. MORPH INTO A SINGLE REAL ENVELOPE (3.88s -> 4.22s):
        //    The compressed cards progressively flatten and broaden into the continuous
        //    envelope surface, while the envelope's origami creases unfold and solidify in unison.
        //    No separate card collage, no fade-out, no cut, no sudden appearance.
        // =========================================================================

        // Glide cluster smoothly from drop landing (-20) downwards toward targetEnvelopeY
        tl.to(
          cardsClusterRef.current,
          {
            y: targetEnvelopeY,
            duration: 0.82,
            ease: "power2.out",
          },
          3.15
        );

        // 26 cards: Scatter -> Gather/Compress -> Flatten into continuous envelope
        allCards.forEach((cardEl, idx) => {
          const slot = scatterSlots[idx];
          const origX = idx < 5 ? (origCentersRef.current[idx]?.x ?? 0) : 0;
          const origY = idx < 5 ? (origCentersRef.current[idx]?.y ?? 0) : 0;
          const stagger = (idx % 6) * 0.012;

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
            3.15 + stagger
          );

          // STEP 2: GATHER / COMPRESS inward into a single dense, unified rectangular pack
          tl.to(
            cardEl,
            {
              x: 0 - origX,
              y: 0 - origY,
              z: (idx - 13) * 0.5,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              scale: envScale,
              borderRadius: "16px",
              duration: 0.34,
              ease: "power3.inOut",
              force3D: true,
            },
            3.54 + stagger * 0.4
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
            3.88 + (idx % 4) * 0.012
          );
          tl.set(cardEl, { visibility: "hidden" }, 4.22);
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
            3.86
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
            3.88
          );
        }

        // Settle envelope with subtle tactile weight directly at screen center (settled by 4.53s)
        tl.to(
          cardsClusterRef.current,
          {
            y: "+=4",
            duration: 0.18,
            ease: "power1.out",
          },
          4.15
        );
        tl.to(
          cardsClusterRef.current,
          {
            y: "-=4",
            duration: 0.20,
            ease: "sine.inOut",
          },
          4.33
        );

        // =========================================================================
        // NEXT STEP: ENVELOPE -> OPEN FLAP -> DOCUMENT EMERGENCE -> PRINTED COPY
        // Matching reference storyboard (Panels 01 - 08):
        // 1. Envelope flap hinges open in authentic 3D perspective (-175°)
        // 2. Document peeks out from the pocket opening (Panel 03)
        // 3. Document is pulled upward and 3D unfurls (Panel 04)
        // 4. Document settles flat in front of envelope (Panel 06 & 08)
        // 5. About copy reveals via printed ink press treatment (Pan        // =========================================================================
        // PHYSICAL EMERGENCE CHOREOGRAPHY:
        // 1. Envelope flap finishes opening completely (4.68s -> 5.30s)
        // 2. Document is physically occluded deep inside pocket (y: 200, height: 260)
        //    Once flap opens, only its top edge (220px to 275px) is exposed at the mouth.
        // 3. Document pulls upward 540px (y: 200 -> -340) with 3D paper bend (5.30s -> 6.20s).
        //    Envelope stays COMPLETELY stationary. Document visibly clears the envelope.
        // 4. Once completely outside, wrapper switches zIndex: 35 in front, document
        //    unfurls and expands into final 640px form (6.20s -> 7.00s).
        // 5. Once settled flat, About copy reveals via printed ink sweep (7.05s -> 8.20s).
        // =========================================================================

        // 1. Initial positions before flap opens (envelope is fully settled at 4.55s)
        if (envelopeTopFlapRef.current) {
          tl.set(envelopeTopFlapRef.current, { rotateX: 0, zIndex: 30 }, 0);
        }
        if (envelopeSealRef.current) {
          tl.set(envelopeSealRef.current, { opacity: 1, scale: 1 }, 0);
        }
        // Document starts deep inside pocket cavity (y: 220, height: 320)
        // Strictly hidden until top flap opens! (0.0s -> 5.25s)
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
            4.60
          );
        }

        // 3. Top Flap hinges open naturally along its fold line (rotateX: 0 -> -175deg)
        // Flap finishes opening completely (4.68s -> 5.25s)
        if (envelopeTopFlapRef.current) {
          tl.to(
            envelopeTopFlapRef.current,
            {
              rotateX: -175,
              duration: 0.57,
              ease: "power2.inOut",
              force3D: true,
            },
            4.68
          );
          // Halfway through rotation (-90deg), switch zIndex behind the backplate
          tl.set(envelopeTopFlapRef.current, { zIndex: 0 }, 4.95);
        }

        // 4. PHYSICAL EMERGENCE CHOREOGRAPHY (Strictly Sequential):
        // flap opens → envelope moves down+document emerges from inside envelope (simultaneous)
        // → document rises substantially → document unfurls → document settles into final reference composition.

        // 4A. Simultaneous: Once flap opens (5.25s), envelope moves downward
        // AND document begins emerging from inside the envelope cavity!
        if (cardsClusterRef.current) {
          tl.to(
            cardsClusterRef.current,
            {
              y: targetEnvelopeY + 140,
              duration: 1.20,
              ease: "power2.inOut",
            },
            5.25
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
            5.45
          );
        }

        if (docCavityWrapperRef.current) {
          tl.set(docCavityWrapperRef.current, { visibility: "visible", opacity: 1 }, 5.25);
        }
        if (philosophyDocRef.current) {
          tl.set(philosophyDocRef.current, { visibility: "visible", opacity: 1 }, 5.25);
          // Document physically rises out of the envelope cavity (y: 220 -> -490),
          // with realistic 3D paper pitch (rotateX: 14deg, rotateY: 1.2deg, z: 40px)
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
            5.25
          );
        }

        // 4B. Document rises substantially and bottom edge clears envelope mouth (6.35s):
        // Promote wrapper in front of envelope (zIndex: 35), remove bottom cavity clipping,
        // and unfurl & expand into dramatic full-page financial document!
        if (docCavityWrapperRef.current) {
          tl.set(
            docCavityWrapperRef.current,
            {
              zIndex: 35,
              clipPath: "none",
              WebkitClipPath: "none",
            },
            6.35
          );
        }
        if (docPaperSheetRef.current) {
          tl.to(
            docPaperSheetRef.current,
            {
              height: 930,
              boxShadow:
                "0 45px 110px -20px rgba(0, 0, 0, 0.75), 0 20px 45px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(215, 205, 190, 0.8), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(0, 0, 0, 0.06)",
              duration: 0.85,
              ease: "power2.inOut",
            },
            6.35
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
            6.35
          );

          // 4C. Document settles into the final reference composition (6.80s -> 7.25s)
          // Positioned higher in viewport (y: -375) placed cleanly above envelope,
          // tilted counter-clockwise (-2.8deg), slight 3D dimensional yaw (2.2deg)
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
            6.80
          );
        }

        // 5. Reveal the About copy via high-contrast letterpress printing ink sweep (7.25s -> 8.40s)
        if (docInkCopyRef.current) {
          tl.set(docInkCopyRef.current, { visibility: "visible" }, 7.25);
          tl.fromTo(
            docInkCopyRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.35,
              ease: "power1.in",
            },
            7.25
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
            7.25
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
            7.25
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

        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
        const viewportCenterY = vh / 2;
        const viewportCenterX = vw / 2;
        const clusterRect = cardsClusterRef.current?.getBoundingClientRect();
        const clusterCenterX = clusterRect ? (clusterRect.left + clusterRect.width / 2) : viewportCenterX;
        const clusterCenterY = clusterRect ? (clusterRect.top + clusterRect.height / 2) : viewportCenterY;
        const fallbackTargetRingY = Math.round(viewportCenterY - clusterCenterY + 18);
        const fallbackTargetRingX = Math.round(viewportCenterX - clusterCenterX);
        const leftShift = isDesktop
          ? Math.round(viewportCenterX * 0.44)
          : isTablet
          ? Math.round(viewportCenterX * 0.32)
          : Math.round(viewportCenterX * 0.20);
        const fallbackTargetLeftX = fallbackTargetRingX - leftShift;

        const targetLeftX = targetLeftXRef.current ?? fallbackTargetLeftX;
        const targetRingY = targetRingYRef.current ?? fallbackTargetRingY;

        const stackCardScale = isDesktop ? 0.60 : isTablet ? 0.56 : 0.52;
        const targetEnvelopeY = isDesktop ? 95 : isTablet ? 80 : 65;
        const frontX = 35;

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];
        const ringSlots = computeRingSlots();

        const revTl = gsap.timeline({
          onComplete: () => {
            isSecurityTransitioningRef.current = false;
            isRingConsolidatedRef.current = false;
            stateRef.current = "ring";
            currentSecurityStateRef.current = 7;

            // Restore ambient ring rotation seamlessly
            if (cardsClusterRef.current && (!ringRotateTweenRef.current || !ringRotateTweenRef.current.isActive())) {
              const curRot = Number(gsap.getProperty(cardsClusterRef.current, "rotateZ")) || 376;
              ringRotateTweenRef.current = gsap.fromTo(
                cardsClusterRef.current,
                { rotateZ: curRot },
                {
                  rotateZ: curRot + 360,
                  duration: 26,
                  repeat: -1,
                  ease: "none",
                  force3D: true,
                }
              );
            }

            window.dispatchEvent(
              new CustomEvent("unifolio-active-section", { detail: { section: "security" } })
            );
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
        // REVERSE STEP 4: CARD RING TRAVELS UP & DOCKS TO ORIGINAL LEFT POSITION (0.76s -> 1.25s)
        // The card ring smoothly returns to its original position (left side of the screen)
        // AND original size (scale: 1.0, scaleX: 1.0, scaleY: 1.0) in the Security section.
        // -------------------------------------------------------------------------
        if (cardsClusterRef.current) {
          revTl.to(
            cardsClusterRef.current,
            {
              x: targetLeftX,
              y: targetRingY,
              scale: 1.0,
              scaleX: 1.0,
              scaleY: 1.0,
              rotateX: 18,
              rotateY: 20,
              rotateZ: 376,
              duration: 0.48,
              ease: "power2.out",
              force3D: true,
            },
            0.76
          );
        }

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

        if (closingBlackTextRef.current) {
          closingBlackTextRef.current.style.clipPath = "none";
          (closingBlackTextRef.current.style as any).webkitClipPath = "none";
        }
        if (closingGreenTextRef.current) {
          closingGreenTextRef.current.style.clipPath = "none";
          (closingGreenTextRef.current.style as any).webkitClipPath = "none";
        }
        if (securityStateRefs.current[7]) {
          revTl.set(securityStateRefs.current[7], { visibility: "visible" }, 0.76);
          revTl.to(
            securityStateRefs.current[7],
            {
              opacity: 1,
              y: 0,
              duration: 0.38,
              ease: "power2.out",
            },
            0.80
          );
        }

        // Unwind cards from stack smoothly into the ring at its exact original scale and layout
        allCards.forEach((cardEl, idx) => {
          const slot = ringSlots[idx];
          const origX = idx < 5 ? (origCentersRef.current[idx]?.x ?? 0) : 0;
          const origY = idx < 5 ? (origCentersRef.current[idx]?.y ?? 0) : 0;

          revTl.to(
            cardEl,
            {
              x: slot.x - origX,
              y: slot.y - origY,
              z: slot.z,
              rotateX: slot.rotX,
              rotateY: slot.rotY,
              rotateZ: slot.rotZ,
              scale: slot.scale,
              scaleX: slot.scale,
              scaleY: slot.scale,
              duration: 0.38,
              ease: "power2.out",
              force3D: true,
            },
            0.86 + (idx % 6) * 0.012
          );
        });
      };

      const goToSecurityState = (nextIdx: number, direction: 1 | -1) => {
        if (nextIdx < 0 || nextIdx >= SECURITY_STATES.length) return;

        const prevIdx = currentSecurityStateRef.current;
        if (prevIdx === nextIdx) return;

        lastSecurityScrollTimeRef.current = Date.now();
        currentSecurityStateRef.current = nextIdx;

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
        const vCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
        const vhVal = typeof window !== "undefined" ? window.innerHeight : 800;
        const rRadius = Math.min(Math.max(vhVal * 0.22, 160), 220);
        const lShift = isDesk ? Math.round(vCenterX * 0.44) : isTab ? Math.round(vCenterX * 0.32) : Math.round(vCenterX * 0.20);
        const ringEdgeRel = -lShift + rRadius + 55;
        const heroShift = isDesk ? Math.round(ringEdgeRel + 40) : isTab ? Math.round(ringEdgeRel + 30) : 0;
        const shiftX = nextIdx === 0
          ? heroShift
          : (isDesk ? Math.round(vCenterX * 0.42) : isTab ? Math.round(vCenterX * 0.30) : Math.round(vCenterX * 0.16));

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
        // 1. Force-reset every card to its default/base state synchronously before any transition starts
        forceResetAllCardsToBase();
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

        // Notify Navbar IMMEDIATELY to transition active indicator from Product to Security
        window.dispatchEvent(
          new CustomEvent("unifolio-active-section", { detail: { section: "security" } })
        );

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
          const vCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
          const vhVal = typeof window !== "undefined" ? window.innerHeight : 800;
          const rRadius = Math.min(Math.max(vhVal * 0.22, 160), 220);
          const lShift = isDesk ? Math.round(vCenterX * 0.44) : isTab ? Math.round(vCenterX * 0.32) : Math.round(vCenterX * 0.20);
          const ringEdgeRel = -lShift + rRadius + 55;
          const shiftX = isDesk ? Math.round(ringEdgeRel + 40) : isTab ? Math.round(ringEdgeRel + 30) : 0;
          if (state0El) gsap.set(state0El, { opacity: 1, visibility: "visible", x: shiftX, y: 0, scale: 1, clipPath: "none" });
          currentSecurityStateRef.current = 0;
        }

        // 3. Notify Navbar IMMEDIATELY that we are returning to Product
        window.dispatchEvent(
          new CustomEvent("unifolio-active-section", { detail: { section: "product" } })
        );

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
        // Ring slowly stops its ambient rotation and settles to its exact docked rotation (376° = 16° + 360°),
        // then the master GSAP timeline plays in reverse along the exact same trajectory:
        // ring moves back toward center while reversing its rotation (376° -> 16°) -> ring unforms ->
        // cards retrace curved trajectory backward -> cards return to stacked and product resting positions.
        const clusterEl = cardsClusterRef.current;
        const currentRot = clusterEl ? Number(gsap.getProperty(clusterEl, "rotateZ")) || 376 : 376;
        const angleDelta = ((currentRot - 376) % 360 + 360) % 360;

        const startReverseTimeline = () => {
          if (cardsClusterRef.current) {
            gsap.set(cardsClusterRef.current, { rotateZ: 376 });
          }
          if (productToRingTlRef.current) {
            productToRingTlRef.current.seek(productToRingTlRef.current.duration(), false);
            productToRingTlRef.current.reverse();
          }
        };

        if (clusterEl && angleDelta > 0.5) {
          const stopDuration = Math.min(Math.max((angleDelta / 360) * 0.45, 0.18), 0.38);
          gsap.to(clusterEl, {
            rotateZ: 376,
            duration: stopDuration,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: startReverseTimeline,
          });
        } else {
          startReverseTimeline();
        }
      };

      const handleWheel = (e: WheelEvent) => {
        // 1. Block all wheel inputs while transition is animating
        if (transitionAnimatingRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        // 1b. If in About section: scroll-driven moving mask text reveal (matching reference video)
        if (stateRef.current === "about") {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (isSecurityTransitioningRef.current) return;

          if (e.deltaY > 8) {
            if (Date.now() - lastSecurityScrollTimeRef.current < 280) return;
            exitAboutToFaq();
            return;
          } else if (e.deltaY < -8) {
            if (Date.now() - lastSecurityScrollTimeRef.current < 280) return;
            restoreStackToRing();
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
            jumpToAboutState();
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

        // 3. If in Product section:
        if (stateRef.current === "product") {
          if (e.deltaY > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            isHoldingProductRef.current = false;
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            triggerProductToRing();
            return;
          } else if (e.deltaY < -8) {
            // User scrolled upward: return to hero cinematically
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
        if (transitionAnimatingRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (stateRef.current === "about") {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (isSecurityTransitioningRef.current) return;

          const touchY = e.touches[0].clientY;
          const touchDeltaY = touchStartY - touchY;

          if (touchDeltaY > 12) {
            touchStartY = touchY;
            if (Date.now() - lastSecurityScrollTimeRef.current < 300) return;
            exitAboutToFaq();
            return;
          } else if (touchDeltaY < -12) {
            touchStartY = touchY;
            if (Date.now() - lastSecurityScrollTimeRef.current < 300) return;
            restoreStackToRing();
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
            jumpToAboutState();
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
            isHoldingProductRef.current = false;
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            triggerProductToRing();
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
        if (transitionAnimatingRef.current) {
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
            if (isSecurityTransitioningRef.current) return;
            if (Date.now() - lastSecurityScrollTimeRef.current < 250) return;
            exitAboutToFaq();
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (isSecurityTransitioningRef.current) return;
            if (Date.now() - lastSecurityScrollTimeRef.current < 250) return;
            restoreStackToRing();
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

        if (stateRef.current === "product") {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            isHoldingProductRef.current = false;
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            triggerProductToRing();
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerProductToHero();
            return;
          }
        }

        if (stateRef.current === "faq") {
          if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            const faqEl = document.getElementById("faq");
            const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
            if (window.scrollY <= faqTop + 30) {
              e.preventDefault();
              e.stopImmediatePropagation();
              jumpToAboutState();
              return;
            }
          }
          return;
        }
      };

      const handleScrollLock = () => {
        if (stateRef.current === "faq") return;
        if (
          transitionAnimatingRef.current ||
          stateRef.current === "hero" ||
          stateRef.current === "product" ||
          (stateRef.current === "ring" && transitionCompleteRef.current)
        ) {
          if (lockScrollYRef.current >= 0 && Math.abs(window.scrollY - lockScrollYRef.current) > 1) {
            window.scrollTo(0, lockScrollYRef.current);
          }
        } else if (stateRef.current === "about") {
          const pinEnd = lockScrollYRef.current || 0;
          if (pinEnd > 0 && window.scrollY < pinEnd - 20) {
            handleShowSecurity();
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

      // Navbar Navigation Event Listeners
      const handleShowProduct = () => {
        smoothScrollTo(0, { duration: 0.85, ease: "power2.inOut" });
        stateRef.current = "product";
        setIsAperturePaused(true);
        productCompleteRef.current = true;
        isHoldingProductRef.current = true;
        transitionStartedRef.current = false;
        transitionAnimatingRef.current = false;
        transitionCompleteRef.current = false;
        window.dispatchEvent(new CustomEvent("unifolio-active-section", { detail: { section: "product" } }));
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
        if (headlineRef.current) gsap.set(headlineRef.current, { opacity: 1, y: 0 });
        if (subheadRef.current) gsap.set(subheadRef.current, { opacity: 1, y: 0 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 1, scale: 1, y: 0 });
        if (cardsClusterRef.current) gsap.set(cardsClusterRef.current, { scaleX: 1, scaleY: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const flipper = cardFlipperRefs.current[i];
          const front = cardFrontRefs.current[i];
          if (wrapper) {
            gsap.set(wrapper, {
              x: 0,
              y: card.restY,
              z: card.restZ,
              rotateX: 0,
              rotateY: card.restRotateY,
              rotateZ: card.restRotateZ,
              scale: 1,
              zIndex: 10 + (2 - Math.abs(i - 2)),
            });
          }
          if (front) {
            gsap.set(front, {
              borderRadius: "20px",
              background: "",
              backgroundColor: "#070908",
              borderColor: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
            });
          }
          const back = cardBackRefs.current[i];
          if (back) gsap.set(back, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
          const grad = cardGradientBgRefs.current[i];
          if (grad) gsap.set(grad, { opacity: 1, autoAlpha: 1, visibility: "visible" });
          const glass = cardGlassOverlayRefs.current[i];
          if (glass) gsap.set(glass, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
          if (flipper) gsap.set(flipper, { rotateY: 0 });
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { opacity: 0.88, autoAlpha: 1, scale: 1, filter: "blur(0px)", visibility: "visible" });
          const defEl = cardDefaultRefs.current[i];
          if (defEl) gsap.set(defEl, { display: "flex", opacity: 1, autoAlpha: 1, visibility: "visible" });
          const hoverEl = cardHoverRefs.current[i];
          if (hoverEl) gsap.set(hoverEl, { display: "flex", opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });

        companionCardRefs.current.forEach((compEl) => {
          if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
        });
      };

      const handleResetHero = () => {
        stateRef.current = "hero";
        setIsAperturePaused(false);
        productCompleteRef.current = false;
        isHoldingProductRef.current = false;
        transitionStartedRef.current = false;
        transitionAnimatingRef.current = false;
        transitionCompleteRef.current = false;
        window.dispatchEvent(new CustomEvent("unifolio-active-section", { detail: { section: "hero" } }));
        if (heroToProductTlRef.current) {
          heroToProductTlRef.current.kill();
          heroToProductTlRef.current = null;
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
        if (heroIntroRef.current) gsap.set(heroIntroRef.current, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        if (heroVisualRef.current) gsap.set(heroVisualRef.current, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 });
        if (headlineRef.current) gsap.set(headlineRef.current, { opacity: 0, y: -25 });
        if (subheadRef.current) gsap.set(subheadRef.current, { opacity: 0, y: -15 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, scale: 0.9, y: -10 });
        if (cardsClusterRef.current) gsap.set(cardsClusterRef.current, { scaleX: 1.25, scaleY: 1.4, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const flipper = cardFlipperRefs.current[i];
          const front = cardFrontRefs.current[i];
          if (wrapper) {
            const initialXOffset = (i - 2) * -16;
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

      const handleShowAbout = () => {
        exitSecurityToAbout();
      };

      const handleShowSecurity = () => {
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
        const vCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
        const vhVal = typeof window !== "undefined" ? window.innerHeight : 800;
        const rRadius = Math.min(Math.max(vhVal * 0.22, 160), 220);
        const lShift = isDesk ? Math.round(vCenterX * 0.44) : isTab ? Math.round(vCenterX * 0.32) : Math.round(vCenterX * 0.20);
        const ringEdgeRel = -lShift + rRadius + 55;
        const heroShift = isDesk ? Math.round(ringEdgeRel + 40) : isTab ? Math.round(ringEdgeRel + 30) : 0;
        const shiftX = heroShiftXRef.current || heroShift;
        const rightShift = rightShiftXRef.current || (isDesk ? Math.round(vCenterX * 0.42) : isTab ? Math.round(vCenterX * 0.30) : Math.round(vCenterX * 0.16));

        // Reconstruct 3D ring cards
        const ringSlots = computeRingSlots();
        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        allProductCards.forEach((wrapper, i) => {
          const slot = ringSlots[i];
          const origX = origCentersRef.current[i]?.x ?? 0;
          const origY = origCentersRef.current[i]?.y ?? 0;
          gsap.set(wrapper, {
            x: slot.x - origX,
            y: slot.y - origY,
            z: slot.z,
            rotateX: slot.rotX,
            rotateY: slot.rotY,
            rotateZ: slot.rotZ,
            scale: slot.scale,
            opacity: 1,
            visibility: "visible",
            zIndex: slot.zIndex,
            force3D: true,
          });

          const front = cardFrontRefs.current[i];
          const angleNorm = (i / 26) * 2 * Math.PI;
          const cosA = Math.cos(angleNorm);
          const baseAlpha = 0.26 + 0.08 * cosA;
          const specularTop = Math.min(Math.max(0.55 + 0.30 * cosA, 0.20), 0.88);
          const emeraldRefract = 0.20 + 0.10 * Math.sin(angleNorm + Math.PI / 3);
          const borderAlpha = Math.min(Math.max(0.14 + 0.08 * cosA, 0.09), 0.26);
          if (front) {
            gsap.set(front, {
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
            });
          }
        });

        cardDefaultRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });
        cardHoverRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });
        cardIllustrationRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });
        cardGradientBgRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });
        cardBackRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
        });
        cardGlassOverlayRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, autoAlpha: 1, visibility: "visible" });
        });

        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        allCompanionCards.forEach((compEl, cIdx) => {
          const slot = ringSlots[5 + cIdx];
          gsap.set(compEl, {
            xPercent: -50,
            yPercent: -50,
            x: slot.x,
            y: slot.y,
            z: slot.z,
            rotateX: slot.rotX,
            rotateY: slot.rotY,
            rotateZ: slot.rotZ,
            scale: slot.scale,
            opacity: 1,
            visibility: "visible",
            zIndex: slot.zIndex,
            force3D: true,
          });
        });

        // Dock cluster to left and restart ambient ring rotation
        const clusterEl = cardsClusterRef.current;
        if (clusterEl) {
          const fallbackX = isDesk ? -Math.round(vCenterX * 0.44) : -Math.round(vCenterX * 0.32);
          const leftX = targetLeftXRef.current !== 0 ? targetLeftXRef.current : fallbackX;
          const ringY = targetRingYRef.current !== 0 ? targetRingYRef.current : 18;

          gsap.set(clusterEl, {
            x: leftX,
            y: ringY,
            rotateX: 18,
            rotateY: 20,
            rotateZ: 376,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
          });

          if (ringRotateTweenRef.current) {
            ringRotateTweenRef.current.kill();
            ringRotateTweenRef.current = null;
          }
          ringRotateTweenRef.current = gsap.fromTo(
            clusterEl,
            { rotateZ: 376 },
            {
              rotateZ: 736,
              duration: 26,
              repeat: -1,
              ease: "none",
              force3D: true,
            }
          );
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
        window.dispatchEvent(new CustomEvent("unifolio-active-section", { detail: { section: "security" } }));
      };

      window.addEventListener("unifolio-show-product", handleShowProduct);
      window.addEventListener("unifolio-reset-hero", handleResetHero);
      window.addEventListener("unifolio-show-about", handleShowAbout);
      window.addEventListener("unifolio-show-security", handleShowSecurity);

      return () => {
        window.removeEventListener("scroll", handleScrollLock, { capture: true });
        window.removeEventListener("wheel", handleWheel, { capture: true });
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove, { capture: true });
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("keydown", handleKeyDown, { capture: true });
        window.removeEventListener("unifolio-logo-docked", revealHeroAfterDocked);
        window.removeEventListener("unifolio-intro-complete", revealHeroAfterDocked);
        window.removeEventListener("unifolio-show-product", handleShowProduct);
        window.removeEventListener("unifolio-reset-hero", handleResetHero);
        window.removeEventListener("unifolio-show-about", handleShowAbout);
        window.removeEventListener("unifolio-show-security", handleShowSecurity);
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
      className="relative w-full bg-[#FAF8F5] dark:bg-[#000000] select-none transition-colors duration-500 overflow-hidden"
    >
      {/* Anchor for Navbar #product navigation */}
      <div id="product" className="absolute top-[80vh] pointer-events-none" />
      {/* Anchor for Navbar #about navigation */}
      <div id="about" className="absolute top-[200vh] pointer-events-none" />

      {/* Master Viewport Stage: Fixed/Pinned at 100vh */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#000000] flex flex-col justify-center transition-colors duration-500"
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
          className="absolute inset-0 z-20 w-full h-full overflow-hidden pointer-events-auto bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500 will-change-[clip-path,opacity]"
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
                className="absolute -top-24 -left-20 w-[60vw] h-[120vh] pointer-events-none -rotate-[22deg] origin-top-left opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(34, 197, 94, 0.12) 0%, rgba(74, 222, 128, 0.05) 25%, rgba(16, 185, 129, 0.01) 55%, transparent 75%)",
                  filter: "blur(35px)",
                }}
              />

              {/* 4. Volumetric God Ray 2: Soft, translucent shaft from top-right */}
              <div
                className="absolute -top-24 -right-20 w-[55vw] h-[120vh] pointer-events-none rotate-[25deg] origin-top-right opacity-50"
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
              onMouseLeave={() => {
                if (stateRef.current === "product" && !transitionStartedRef.current && !transitionAnimatingRef.current && !isSecurityTransitioningRef.current) {
                  handleCardHover(null);
                }
              }}
              onPointerMove={(e) => {
                if (e.target === cardsStageRef.current) {
                  if (stateRef.current === "product" && !transitionStartedRef.current && !transitionAnimatingRef.current && !isSecurityTransitioningRef.current) {
                    handleCardHover(null);
                  }
                }
              }}
            >
              <div
                ref={cardsClusterRef}
                className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-3.5 xl:gap-4 w-full max-w-[1340px] mx-auto overflow-x-auto lg:overflow-visible py-1.5 px-2 no-scrollbar will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
                onMouseMove={(e) => {
                  if (stateRef.current === "product" && !transitionStartedRef.current && !transitionAnimatingRef.current && !isSecurityTransitioningRef.current) {
                    const band = getHoverBandIndex(e.clientX);
                    handleCardHover(band);
                  }
                }}
                onMouseLeave={() => {
                  if (stateRef.current === "product" && !transitionStartedRef.current && !transitionAnimatingRef.current && !isSecurityTransitioningRef.current) {
                    handleCardHover(null);
                  }
                }}
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
                      onPointerEnter={() => {
                        if (stateRef.current === "product" && !transitionStartedRef.current && !transitionAnimatingRef.current && !isSecurityTransitioningRef.current) {
                          handleCardHover(idx);
                        }
                      }}
                      onClick={() => {
                        if (stateRef.current === "product" && !transitionStartedRef.current && !transitionAnimatingRef.current && !isSecurityTransitioningRef.current) {
                          handleCardHover(idx);
                        }
                      }}
                      className="relative shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[285px] sm:h-[310px] md:h-[330px] lg:h-[345px] xl:h-[360px] 2xl:h-[375px] cursor-pointer will-change-transform"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div
                        ref={(el) => {
                          cardFlipperRefs.current[idx] = el;
                        }}
                        className="relative w-full h-full will-change-transform"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* CARD FRONT FACE */}
                        <div
                          ref={(el) => {
                            cardFrontRefs.current[idx] = el;
                          }}
                          className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden bg-[#070908] border border-white/12 shadow-2xl will-change-transform flex flex-col justify-between"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                          }}
                        >
                          {/* Flowing Emerald Panoramic Gradient (Active during Product Section) */}
                          <div
                            ref={(el) => {
                              cardGradientBgRefs.current[idx] = el;
                            }}
                            className="absolute inset-0 overflow-hidden pointer-events-none rounded-[20px] will-change-[opacity]"
                          >
                            <div
                              className="absolute top-0 bottom-0 h-full will-change-transform unifolio-flowing-gradient"
                              style={{
                                width: "500%",
                                left: `-${idx * 100}%`,
                                background:
                                  "radial-gradient(ellipse 65% 55% at 18% 30%, rgba(16, 185, 129, 0.25) 0%, transparent 60%), " +
                                  "radial-gradient(ellipse 55% 65% at 50% 70%, rgba(5, 150, 105, 0.20) 0%, transparent 60%), " +
                                  "radial-gradient(ellipse 65% 55% at 82% 35%, rgba(20, 184, 166, 0.25) 0%, transparent 60%), " +
                                  "radial-gradient(ellipse 50% 50% at 35% 82%, rgba(4, 120, 87, 0.26) 0%, transparent 60%), " +
                                  "radial-gradient(ellipse 50% 50% at 68% 18%, rgba(52, 211, 153, 0.18) 0%, transparent 60%), " +
                                  "linear-gradient(135deg, #050807 0%, #080f0c 25%, #050d0a 50%, #07130f 75%, #040806 100%)",
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90 pointer-events-none" />
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
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
                                className="w-full h-full object-contain object-bottom drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
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
                            <span className="font-mono text-[10px] sm:text-xs font-black text-[#22c55e] tracking-widest uppercase mb-1.5 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                              {card.num}
                            </span>
                            <h3 className="font-sans font-black text-sm sm:text-base md:text-lg lg:text-xl xl:text-[21px] text-white leading-[1.20] tracking-tight max-w-[190px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
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
                              <h3 className="font-sans font-extrabold text-sm sm:text-base md:text-lg lg:text-[19px] xl:text-[20px] text-white leading-tight tracking-[-0.03em] text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                {card.title}
                              </h3>

                              {card.hoverType === "paragraph" ? (
                                <p className="text-xs sm:text-[13px] md:text-sm text-neutral-100 font-semibold leading-[1.46] text-center max-w-[280px]">
                                  {card.hoverParagraph}
                                </p>
                              ) : (
                                <div className="space-y-1 sm:space-y-1.5 text-center w-full flex-1 flex flex-col justify-center">
                                  {card.hoverBullets?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="text-[10px] sm:text-[11px] md:text-[11.5px] text-neutral-100 font-medium leading-[1.32] sm:leading-[1.35]">
                                      <span className="font-bold text-[#34d399] mr-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                        {bullet.label}
                                      </span>
                                      <span className="text-neutral-100 font-medium">
                                        {bullet.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
                      </div>
                    </div>
                  );
                })}

                {/* 21 Companion Cards for the Ring Formation (matching 'Cards ring.png' and recreate.mp4) */}
                {Array.from({ length: COMPANION_COUNT }).map((_, cIdx) => {
                  const slotK = 5 + cIdx;
                  const angleNorm = (slotK / 26) * 2 * Math.PI;
                  const cosA = Math.cos(angleNorm);
                  const sinA = Math.sin(angleNorm);

                  // Calibrated translucency: clear visibility of overlapping cards behind each other
                  const baseAlpha = 0.26 + 0.08 * cosA;
                  const specularTop = Math.min(Math.max(0.55 + 0.30 * cosA, 0.20), 0.88);
                  const specularLeft = Math.min(Math.max(0.40 + 0.25 * sinA, 0.15), 0.70);
                  const emeraldRefract = 0.20 + 0.10 * Math.sin(angleNorm + Math.PI / 3);
                  const borderAlpha = Math.min(Math.max(0.14 + 0.08 * cosA, 0.09), 0.26);

                  return (
                    <div
                      key={`comp-card-${cIdx}`}
                      ref={(el) => {
                        companionCardRefs.current[cIdx] = el;
                      }}
                      className="absolute shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[285px] sm:h-[310px] md:h-[330px] lg:h-[345px] xl:h-[360px] 2xl:h-[375px] pointer-events-none rounded-[20px] will-change-transform overflow-hidden"
                      style={{
                        transformStyle: "preserve-3d",
                        opacity: 0,
                        visibility: "hidden",
                        left: "50%",
                        top: "50%",
                        background: `linear-gradient(140deg, rgba(6, 28, 18, ${baseAlpha.toFixed(2)}) 0%, rgba(3, 18, 11, ${(baseAlpha + 0.07).toFixed(2)}) 50%, rgba(1, 10, 6, ${(baseAlpha + 0.14).toFixed(2)}) 100%)`,
                        border: `1px solid rgba(255, 255, 255, ${borderAlpha.toFixed(2)})`,
                        boxShadow:
                          `inset 0 1.5px 1px 0 rgba(255, 255, 255, ${(specularTop * 0.55).toFixed(2)}), ` +
                          "inset 1px 0 1px 0 rgba(255, 255, 255, 0.20), " +
                          `inset 0 -1.5px 2px 0 rgba(34, 197, 94, ${(emeraldRefract * 1.1).toFixed(2)}), ` +
                          "inset -1px 0 1.5px 0 rgba(34, 197, 94, 0.20), " +
                          "0 12px 26px -6px rgba(0, 0, 0, 0.36), " +
                          "0 2px 6px -1px rgba(2, 16, 9, 0.22)",
                      }}
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
                          background: `linear-gradient(90deg, rgba(34, 197, 94, ${(emeraldRefract * 0.4).toFixed(2)}) 0%, rgba(34, 197, 94, ${(emeraldRefract * 1.4).toFixed(2)}) 40%, rgba(74, 222, 128, ${(emeraldRefract * 0.6).toFixed(2)}) 100%)`,
                        }}
                      />
                    </div>
                  );
                })}

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
                        className="relative w-[95vw] max-w-[620px] sm:max-w-[700px] md:max-w-[780px] lg:max-w-[860px] xl:max-w-[920px] rounded-[18px] sm:rounded-[24px] p-7 sm:p-10 md:p-12 lg:p-14 overflow-hidden will-change-[height,transform]"
                        style={{
                          height: "320px",
                          background:
                            "linear-gradient(168deg, #FCFAF6 0%, #F7F2E8 42%, #ECE3D4 100%)",
                          boxShadow:
                            "0 45px 110px -20px rgba(0, 0, 0, 0.75), 0 20px 45px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(215, 205, 190, 0.8), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(0, 0, 0, 0.06)",
                          clipPath: "polygon(46px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 46px)",
                          WebkitClipPath: "polygon(46px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 46px)",
                        }}
                      >
                        {/* Folded Paper Dog-Ear Flap (Top Left, Matching Reference Image) */}
                        <div className="absolute top-0 left-0 w-[46px] h-[46px] pointer-events-none z-30">
                          <svg className="w-full h-full" viewBox="0 0 46 46" fill="none">
                            <defs>
                              <filter id="dogEarShadow" x="-30%" y="-30%" width="160%" height="160%">
                                <feDropShadow dx="2" dy="2.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.30" />
                              </filter>
                              <linearGradient id="dogEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#EDE3D2" />
                                <stop offset="50%" stopColor="#F5EFE3" />
                                <stop offset="100%" stopColor="#FAF7F0" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 0 46 L 46 0 L 46 46 Z"
                              fill="url(#dogEarGrad)"
                              filter="url(#dogEarShadow)"
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
                        <div className="relative flex items-start justify-between w-full mb-6 sm:mb-8 pointer-events-none">
                          <div className="flex flex-col space-y-0.5 text-left">
                            <span className="font-sans text-[13px] sm:text-[15px] font-black tracking-[0.26em] uppercase text-neutral-950 leading-tight">
                              UNIFOLIO
                            </span>
                            <span className="font-sans text-[11px] sm:text-[12px] font-bold tracking-[0.22em] uppercase text-neutral-700 leading-tight">
                              THE PHILOSOPHY
                            </span>
                          </div>

                          <div className="flex items-center space-x-3.5 sm:space-x-4">
                            <div className="flex flex-col space-y-0.5 text-right">
                              <span className="font-sans text-[12px] sm:text-[13.5px] font-black tracking-[0.24em] uppercase text-neutral-950 leading-tight">
                                A CLEARER
                              </span>
                              <span className="font-sans text-[12px] sm:text-[13.5px] font-black tracking-[0.24em] uppercase text-neutral-950 leading-tight">
                                FINANCIAL
                              </span>
                              <span className="font-sans text-[12px] sm:text-[13.5px] font-black tracking-[0.24em] uppercase text-neutral-950 leading-tight">
                                TOMORROW
                              </span>
                            </div>

                            {/* Official Unifolio Ring Logo */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center shrink-0">
                              <img
                                src="/Logo/unifolio-ring-transparent.png"
                                alt="Unifolio Ring"
                                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Printed Ink Copy Container (Revealed via Printing Press Ink Sweep) */}
                        <div
                          ref={docInkCopyRef}
                          className="relative z-10 space-y-6 sm:space-y-8 select-text pointer-events-auto will-change-[clip-path,opacity,filter]"
                          style={{
                            clipPath: "inset(0 0 100% 0)",
                            WebkitClipPath: "inset(0 0 100% 0)",
                            opacity: 0,
                          }}
                        >
                          {/* First Stanza: Human Reality & Overwhelm */}
                          <div className="space-y-2.5 sm:space-y-3.5 text-left">
                            <p className="font-serif text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] font-black leading-[1.18] tracking-tight text-neutral-950">
                              In most families, someone ends up in charge of the money,
                            </p>
                            <p className="font-serif italic text-[20px] sm:text-[23px] md:text-[26px] text-neutral-800 font-bold leading-snug">
                              not because they trained for it, but because someone has to.
                            </p>
                            <p className="font-sans text-[16px] sm:text-[17.5px] md:text-[19px] font-semibold text-neutral-800 leading-relaxed pt-1 max-w-3xl">
                              Their financial data lives across a dozen apps and statements, and having it all in one place is not the same as understanding it.
                            </p>
                          </div>

                          {/* Subtle Hairline Watermark Divider */}
                          <div className="w-full h-[1.5px] bg-neutral-300/90 my-5 sm:my-7" />

                          {/* Second Stanza: Unifolio Purpose */}
                          <div className="space-y-2.5 sm:space-y-3.5 text-left">
                            <p className="font-serif text-[26px] sm:text-[31px] md:text-[35px] lg:text-[38px] font-black text-neutral-950 tracking-tight leading-snug">
                              Unifolio exists to close that gap,
                            </p>
                            <p className="font-sans text-[16px] sm:text-[17.5px] md:text-[19px] font-semibold text-neutral-800 leading-relaxed max-w-3xl">
                              to give that person the same clarity a wealth manager gives their wealthiest clients, whether they hold ₹5 lakh or ₹5 crore, whether they've studied finance or never touched a balance sheet.
                            </p>
                          </div>

                          {/* Third Stanza: Punchline */}
                          <div className="space-y-1.5 sm:space-y-2 text-left pt-2">
                            <p className="font-serif text-[22px] sm:text-[25px] md:text-[28px] font-black text-neutral-950 leading-tight">
                              Not just where their money is,
                            </p>
                            <p className="font-serif text-[32px] sm:text-[38px] md:text-[44px] lg:text-[48px] font-black italic text-[#22C55E] tracking-tight mt-1.5 drop-shadow-[0_1px_2px_rgba(34,197,94,0.25)]">
                              but what it means.
                            </p>
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
              className="w-full max-w-5xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mt-7 sm:mt-8 md:mt-10 lg:mt-12 mb-2 px-2"
            >
              <h2
                ref={headlineRef}
                className="font-sans font-black text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] xl:text-[46px] tracking-[-0.03em] leading-tight sm:whitespace-nowrap text-neutral-950 dark:text-white transition-colors duration-500 will-change-transform"
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
                className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-snug sm:leading-relaxed transition-colors duration-500 will-change-transform"
              >
                Every account, every fund, every rupee, in one place, finally clear.
              </p>

              <div className="mt-4 sm:mt-5">
                <LinkButton
                  ref={ctaRef}
                  href="#contact"
                  size="md"
                  variant="primary"
                  className="shadow-md shadow-emerald-500/15"
                  onClick={(e) => {
                    const target = document.getElementById("contact");
                    if (target) {
                      e.preventDefault();
                      smoothScrollTo(target.offsetTop, { duration: 1.1, ease: "power2.inOut" });
                    }
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E] group-hover:scale-125 transition-transform" />
                  <span className="font-bold text-sm sm:text-base tracking-tight">Join the waitlist</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-neutral-600 dark:text-neutral-300 stroke-[2.5]" />
                </LinkButton>
              </div>
            </div>

            {/* Ambient Floor Reflection Line */}
            <div
              ref={floorLineRef}
              className="w-full max-w-xl mx-auto h-[1.5px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shrink-0 z-20 mt-5 sm:mt-6 md:mt-7 opacity-75 dark:opacity-85"
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
                    className={
                      item.type === "hero"
                        ? "absolute top-1/2 left-1/2 -translate-y-1/2 w-auto max-w-none whitespace-nowrap overflow-visible will-change-transform pointer-events-none"
                        : `absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full ${
                            idx === 2 || idx === 3 || idx === 4 || idx === 5 || idx === 6
                              ? "max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl px-6 md:pl-16 lg:pl-28 xl:pl-36 text-left"
                              : "max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl px-6 text-left"
                          } will-change-transform pointer-events-none`
                    }
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                    }}
                  >
                    {item.type === "hero" ? (
                      <div
                        ref={securityHeroRibbonRef}
                        className="relative will-change-transform select-none inline-block"
                      >
                        <h2 className="font-sans font-black text-xl sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[42px] 2xl:text-[46px] text-neutral-950 dark:text-white tracking-[-0.03em] uppercase select-none flex flex-col items-start gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4 leading-[1.12]">
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
                                <span className="inline-flex items-baseline text-neutral-950 dark:text-white font-black">
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
                                    className="w-full h-full max-h-[1.15em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)] dark:drop-shadow-[0_6px_20px_rgba(34,197,94,0.45)]"
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
                                        {/* Center Dollar Sign */}
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
                                          $
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
                      <div className="flex flex-col">
                        {idx === 1 ? (
                          // State 2: "Read-only, always" - focal point, bigger and bolder typography with embedded eyes Easter egg
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.05] mb-4 sm:mb-5 select-none relative inline-flex flex-wrap items-baseline">
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
                                <span className="relative w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] md:w-[54px] md:h-[54px] rounded-full overflow-hidden flex items-center justify-center border-2 border-white/50 dark:border-white/25 shadow-[0_6px_20px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(0,0,0,0.25)] shrink-0">
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
                                    className="absolute inset-0 bg-[#06180e] dark:bg-[#000000] rounded-full pointer-events-none origin-top will-change-transform"
                                    style={{
                                      transform: "scaleY(0)",
                                      boxShadow: "inset 0 -3px 6px rgba(34, 197, 94, 0.45)",
                                    }}
                                  />
                                </span>

                                {/* Right Eye */}
                                <span className="relative w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] md:w-[54px] md:h-[54px] rounded-full overflow-hidden flex items-center justify-center border-2 border-white/50 dark:border-white/25 shadow-[0_6px_20px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(0,0,0,0.25)] shrink-0">
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
                                    className="absolute inset-0 bg-[#06180e] dark:bg-[#000000] rounded-full pointer-events-none origin-top will-change-transform"
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
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[52px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.08] whitespace-nowrap mb-4 sm:mb-5 select-none">
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
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal sm:whitespace-nowrap">
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
                                    className="text-neutral-900 dark:text-neutral-100 will-change-transform"
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
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
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
                                    className="w-[3.4em] h-[3.4em] sm:w-[3.8em] sm:h-[3.8em] md:w-[4.2em] md:h-[4.2em] object-contain drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)] dark:drop-shadow-[0_6px_20px_rgba(34,197,94,0.45)] select-none pointer-events-none"
                                  />
                                </span>
                              </span>
                            </span>
                          </h3>
                        ) : idx === 5 ? (
                          // State 6: "Stored in India" - Typography Transformation into Minimal India Map Outline
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.06] mb-5 sm:mb-6 md:mb-7 select-none whitespace-normal lg:whitespace-nowrap">
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
                                    className="w-[2.8em] h-[2.8em] sm:w-[3.2em] sm:h-[3.2em] md:w-[3.6em] md:h-[3.6em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)] dark:drop-shadow-[0_6px_20px_rgba(34,197,94,0.45)]"
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
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
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
                                  className="w-[2.4em] h-[2.4em] sm:w-[2.7em] sm:h-[2.7em] md:w-[3.0em] md:h-[3.0em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.40)] dark:drop-shadow-[0_6px_22px_rgba(34,197,94,0.55)] will-change-transform"
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
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] text-neutral-950 dark:text-white tracking-[-0.03em] leading-[1.08] mb-3 sm:mb-4">
                            {item.headline}
                          </h3>
                        )}
                        <p className="font-sans text-base sm:text-lg md:text-xl lg:text-[21px] text-neutral-600 dark:text-[#94A3B8] font-normal leading-relaxed max-w-xl">
                          {item.body}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 sm:gap-1.5 select-none relative">
                        {/* Black text portion: "Security isn't a feature here." */}
                        <div
                          ref={closingBlackTextRef}
                          className="will-change-[clip-path,opacity]"
                        >
                          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] uppercase leading-[1.04] flex flex-wrap gap-x-[0.26em] gap-y-0.5">
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
                          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-[#22C55E] tracking-[-0.035em] uppercase leading-[1.04] flex flex-wrap gap-x-[0.26em] gap-y-0.5">
                            {CLOSING_GREEN_WORDS.map((word, wIdx) => (
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
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/70 dark:border-emerald-400/80 shadow-[0_0_45px_rgba(16,185,129,0.5),inset_0_0_25px_rgba(16,185,129,0.3)] z-25 opacity-0 will-change-[width,height,left,top,opacity]"
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
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40 dark:border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.3)] z-24 opacity-0 will-change-[width,height,left,top,opacity]"
          style={{
            width: 0,
            height: 0,
            left: "57.0%",
            top: "48.5%",
          }}
        />

        {/* =================================================================== */}
        {/* LAYER 1B (z-10): HERO HEADLINE ("SEE WHAT YOU ACTUALLY OWN.")       */}
        {/* Positioned behind Iris Portal (z-20) so expanding iris covers it     */}
        {/* =================================================================== */}
        <div
          ref={heroIntroRef}
          className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-20 pb-8 max-w-7xl mx-auto w-full pointer-events-none will-change-transform"
        >
          <div className="flex-1 flex flex-col justify-center max-w-lg -translate-x-6 sm:-translate-x-10 lg:-translate-x-14 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] text-neutral-950 dark:text-white tracking-[-0.03em] uppercase leading-[0.92] transition-colors duration-500 select-none">
              SEE WHAT <br />
              YOU ACTUALLY <br />
              OWN.
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
