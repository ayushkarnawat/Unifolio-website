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
const YOU_LETTERS = ["Y", "o", "u"];
const INDIA_LETTERS = ["I", "n", "d", "i", "a"];
const MONEY_LETTERS = ["m", "o", "n", "e", "y"];
const SELL_LETTERS = ["s", "e", "l", "l"];

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
  const currentSecurityStateRef = useRef<number>(0);
  const isSecurityTransitioningRef = useRef<boolean>(false);
  const lastSecurityScrollTimeRef = useRef<number>(0);

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

  // Handshake Typography Transformation Interaction ("You control the connection")
  const youCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const handshakeWrapperRef = useRef<HTMLSpanElement | null>(null);
  const handLeftGroupRef = useRef<SVGGElement | null>(null);
  const handRightGroupRef = useRef<SVGGElement | null>(null);
  const handshakeSparksRef = useRef<SVGGElement | null>(null);
  const handshakeAnimTlRef = useRef<gsap.core.Timeline | null>(null);

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
  const stateRef = useRef<"hero" | "product" | "sculpting" | "ring">("hero");
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

  useEffect(() => {
    return () => {
      if (hoverCommitTimeoutRef.current) clearTimeout(hoverCommitTimeoutRef.current);
      if (arrivalIdleTimeoutRef.current) clearTimeout(arrivalIdleTimeoutRef.current);
      if (momentumDrainTimeoutRef.current) clearTimeout(momentumDrainTimeoutRef.current);
      if (ringRotateTweenRef.current) {
        ringRotateTweenRef.current.kill();
        ringRotateTweenRef.current = null;
      }
    };
  }, []);

  // GSAP Interactive Card Hover Choreography: Unified, reversible, zero-glitch controller
  const commitCardHover = (idx: number | null) => {
    if (stateRef.current !== "product") return;
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
    if (stateRef.current !== "product") return;
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
      // UNIFIED APERTURE TRANSITION TIMELINE (CONCEPT 1 ZOOM + CONCEPT 2 REVEAL)
      // Pinned across 200vh of scroll for spaciousness, dwell, and hover comfort
      // =======================================================================
      if (!reduced) {
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

        if (isDesktop) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "+=200%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              onUpdate: (self) => {
                // Low-end GPU optimization: pause video decode once fully engulfed
                const shouldPause = self.progress > 0.55;
                setIsAperturePaused(shouldPause);

                // Enable interactive hover once cards are flipped and resting
                if (self.progress >= 0.78) {
                  if (stateRef.current !== "sculpting" && stateRef.current !== "ring") {
                    stateRef.current = "product";
                  }
                  productCompleteRef.current = true;

                  // Stop and hold on completed Product state:
                  // Only after the arrival gesture settles (~140ms idle) do we arm the hold state
                  // so that the next intentional downward scroll triggers the transition.
                  if (!isHoldingProductRef.current && !transitionStartedRef.current) {
                    if (arrivalIdleTimeoutRef.current) clearTimeout(arrivalIdleTimeoutRef.current);
                    arrivalIdleTimeoutRef.current = setTimeout(() => {
                      arrivalIdleTimeoutRef.current = null;
                      if (!transitionStartedRef.current && stateRef.current === "product") {
                        isHoldingProductRef.current = true;
                      }
                    }, 140);
                  }
                } else if (self.progress < 0.70) {
                  if (stateRef.current === "product") {
                    stateRef.current = "hero";
                    if (currentHoverRef.current !== null) {
                      commitCardHover(null);
                    }
                  }
                  productCompleteRef.current = false;
                  isHoldingProductRef.current = false;
                  transitionStartedRef.current = false;
                  if (arrivalIdleTimeoutRef.current) {
                    clearTimeout(arrivalIdleTimeoutRef.current);
                    arrivalIdleTimeoutRef.current = null;
                  }
                }
              },
            },
          });

          // 1. OPTION 2: Inward Pull Phase - Hero text gravitationally pulled toward singularity (0.00 -> 0.22)
          // Headline pulls rightward and upward directly toward (57.0%, 48.5%) void with accelerating curve
          tl.to(
            heroIntroRef.current,
            {
              autoAlpha: 0,
              x: 75,
              y: -18,
              scale: 0.85,
              duration: 0.22,
              ease: "power2.in",
            },
            0.0
          );

          // 2. CONCEPT 1 + OPTION 2: Orbital Camera Dive (0.00 -> 0.55)
          // Scales 5.5x with exponential orbital pull curve into optical center void
          tl.to(
            heroVisualRef.current,
            {
              scale: 5.5,
              xPercent: -7.0,
              yPercent: 1.5,
              duration: 0.55,
              ease: "power3.inOut",
            },
            0.0
          );

          // 3. OPTION 2: The Event Horizon & Luminous Concentric Ripple (0.03 -> 0.40)
          tl.to(
            [irisPortalRef.current, portalRimRef.current],
            {
              autoAlpha: 1,
              duration: 0.10,
              ease: "power1.out",
            },
            0.03
          );

          // Secondary emerald gravitational ripple pulse ring
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
              duration: 0.18,
              ease: "power2.out",
            },
            0.22
          );

          // Numeric GSAP tween drives pixel radius from initial hole to full screen (100% CPU-safe, zero GPU)
          tl.to(
            portalState,
            {
              radius: maxRadiusPx,
              x: 50.0,
              y: 50.0,
              duration: 0.52,
              ease: "power2.inOut",
              onUpdate: () => {
                applyPortalClip(portalState.radius, portalState.x, portalState.y);
              },
            },
            0.03
          );

          // 4. OPTION 2: Atmospheric Stretch & Slingshot
          // Stage stays compressed through singularity (0.03 -> 0.20), then slingshots outward (0.20 -> 0.55)
          tl.to(
            productWorldRef.current,
            {
              scale: 0.42,
              scaleX: 0.48,
              scaleY: 0.36,
              opacity: 0.55,
              xPercent: 4.5,
              yPercent: -0.8,
              duration: 0.18,
              ease: "power2.in",
            },
            0.03
          );

          tl.to(
            productWorldRef.current,
            {
              scale: 1.0,
              scaleX: 1.0,
              scaleY: 1.0,
              xPercent: 0,
              yPercent: 0,
              opacity: 1.0,
              duration: 0.34,
              ease: "power3.out", // Gravitational slingshot expansion
            },
            0.21
          );

          // Luminous event horizon rim dissolves as the opening expands beyond the screen
          tl.to(
            portalRimRef.current,
            {
              autoAlpha: 0,
              duration: 0.10,
              ease: "power1.in",
            },
            0.38
          );

          // 4. Hero Video Ring dissolves smoothly once iris expansion covers screen (0.45 -> 0.55)
          tl.to(
            heroVisualRef.current,
            {
              opacity: 0,
              duration: 0.10,
              ease: "power1.in",
            },
            0.45
          );

          // 5. Product Header illuminates (Headline, Subhead, CTA) (0.48 -> 0.60)
          tl.to(
            headlineRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.18,
              ease: "power2.out",
            },
            0.48
          );

          tl.to(
            subheadRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.18,
              ease: "power2.out",
            },
            0.52
          );

          tl.to(
            ctaRef.current,
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.20,
              ease: "back.out(1.2)",
            },
            0.56
          );

          // 6. Cards Cluster Divides: unbunches to 5 individual cards, corners round to 20px (0.50 -> 0.65)
          tl.to(
            cardsClusterRef.current,
            {
              scaleX: 1,
              scaleY: 1,
              duration: 0.20,
              ease: "power2.out",
            },
            0.50
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
                  duration: 0.20,
                  ease: "power3.out",
                },
                0.50
              );
            }

            if (front) {
              tl.to(
                front,
                {
                  borderRadius: "20px",
                  duration: 0.16,
                  ease: "power2.out",
                },
                0.52
              );
            }

            if (back) {
              tl.to(
                back,
                {
                  borderRadius: "20px",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  duration: 0.16,
                  ease: "power2.out",
                },
                0.52
              );
            }
          });

          // 7. SEQUENTIAL LEFT-TO-RIGHT FLIPS (Cards 1 → 2 → 3 → 4 → 5)
          // The intern's signature core animation: each card turns over to show the heading!
          const flipDuration = 0.12;
          const flipInterval = 0.032;
          const flipBaseStart = 0.60;

          PRODUCT_CARDS.forEach((_, i) => {
            const flipper = cardFlipperRefs.current[i];
            if (!flipper) return;

            const startTime = flipBaseStart + i * flipInterval;

            tl.to(
              flipper,
              {
                rotateY: 0, // Rotates to front face
                duration: flipDuration,
                ease: "power2.inOut",
              },
              startTime
            );
          });

          // Generous dwell window (0.78 -> 1.00) for comfortable reading, hovering, and interacting
          tl.to({}, { duration: 0.22 }, flipBaseStart + 4 * flipInterval + flipDuration);
          apertureScrollTriggerRef.current = tl.scrollTrigger ?? null;
        } else {
          // Mobile fallback
          const mobileTl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "+=120%",
              scrub: 0.8,
              onUpdate: (self) => {
                if (self.progress >= 0.78) {
                  if (stateRef.current !== "sculpting" && stateRef.current !== "ring") {
                    stateRef.current = "product";
                  }
                  productCompleteRef.current = true;
                  if (!isHoldingProductRef.current && !transitionStartedRef.current) {
                    if (arrivalIdleTimeoutRef.current) clearTimeout(arrivalIdleTimeoutRef.current);
                    arrivalIdleTimeoutRef.current = setTimeout(() => {
                      arrivalIdleTimeoutRef.current = null;
                      if (!transitionStartedRef.current && stateRef.current === "product") {
                        isHoldingProductRef.current = true;
                      }
                    }, 140);
                  }
                } else if (self.progress < 0.70) {
                  productCompleteRef.current = false;
                  isHoldingProductRef.current = false;
                  transitionStartedRef.current = false;
                  if (arrivalIdleTimeoutRef.current) {
                    clearTimeout(arrivalIdleTimeoutRef.current);
                    arrivalIdleTimeoutRef.current = null;
                  }
                }
              },
            },
          });

          mobileTl.to(heroIntroRef.current, { opacity: 0, x: 30, y: -15, scale: 0.9, duration: 0.25 }, 0.0);
          mobileTl.to(heroVisualRef.current, { scale: 3.5, opacity: 0, duration: 0.5 }, 0.0);
          mobileTl.to(irisPortalRef.current, { autoAlpha: 1, duration: 0.15 }, 0.05);
          mobileTl.to(
            portalState,
            {
              radius: maxRadiusPx,
              x: 50.0,
              y: 50.0,
              duration: 0.55,
              onUpdate: () => applyPortalClip(portalState.radius, portalState.x, portalState.y),
            },
            0.05
          );
          mobileTl.to(productWorldRef.current, { scale: 1, scaleX: 1, scaleY: 1, xPercent: 0, yPercent: 0, opacity: 1, duration: 0.55 }, 0.05);
          mobileTl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.25 }, 0.45);
          mobileTl.to(subheadRef.current, { opacity: 1, y: 0, duration: 0.25 }, 0.50);
          mobileTl.to(ctaRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.25 }, 0.55);

          PRODUCT_CARDS.forEach((_, i) => {
            const flipper = cardFlipperRefs.current[i];
            if (flipper) {
              mobileTl.to(flipper, { rotateY: 0, duration: 0.18 }, 0.55 + i * 0.04);
            }
          });
          apertureScrollTriggerRef.current = mobileTl.scrollTrigger ?? null;
        }
      }

      // =======================================================================
      // PRODUCT -> RING TRANSITION (RECREATED EXACTLY FROM recreate.mp4)
      // =======================================================================
      const createProductToRingTimeline = () => {
        const clusterEl = cardsClusterRef.current;
        if (!clusterEl) return gsap.timeline();

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
        const rightShiftX = isDesktop
          ? Math.round(viewportCenterX * 0.42)
          : isTablet
          ? Math.round(viewportCenterX * 0.30)
          : Math.round(viewportCenterX * 0.16);

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            stateRef.current = "sculpting";
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            commitCardHover(null);
          },
          onComplete: () => {
            stateRef.current = "ring";
            transitionAnimatingRef.current = false;
            transitionCompleteRef.current = true;
            isHoldingProductRef.current = false;
            currentSecurityStateRef.current = 0;
            isSecurityTransitioningRef.current = false;
            lastSecurityScrollTimeRef.current = Date.now();

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
                  gsap.set(el, { opacity: 0, visibility: "hidden", x: 0, y: 0, scale: 1, clipPath: "inset(0% 100% 0% 0%)" });
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
            PRODUCT_CARDS.forEach((card, i) => {
              const wrapper = cardWrapperRefs.current[i];
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
                  opacity: 1,
                  zIndex: 10 + (2 - Math.abs(i - 2)),
                });
              }
              if (front) {
                gsap.set(front, {
                  background: "",
                  backgroundColor: "#070908",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
                });
              }
            });
            cardGradientBgRefs.current.forEach((el) => {
              if (el) gsap.set(el, { opacity: 1 });
            });
            cardIllustrationRefs.current.forEach((el) => {
              if (el) gsap.set(el, { opacity: 0.88 });
            });
            cardDefaultRefs.current.forEach((el) => {
              if (el) gsap.set(el, { opacity: 1, autoAlpha: 1 });
            });
            cardGlassOverlayRefs.current.forEach((el) => {
              if (el) gsap.set(el, { opacity: 0 });
            });
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
          if (el) tl.set(el, { opacity: 0.88 }, 0);
        });
        cardBackRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 0 }, 0);
        });
        cardGlassOverlayRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 0 }, 0);
        });
        cardDefaultRefs.current.forEach((el) => {
          if (el) tl.set(el, { opacity: 1, autoAlpha: 1 }, 0);
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
            if (idx === 0) {
              tl.set(el, { autoAlpha: 1, opacity: 1, visibility: "visible", x: 0, y: 0, scale: 1, clipPath: "inset(0% 100% 0% 0%)" }, 0);
            } else {
              tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: rightShiftX, y: 0 }, 0);
            }
          }
        });

        // -------------------------------------------------------------------------
        // UNIFIED SIMULTANEOUS TRANSITION (0.0s -> 0.76s)
        // All three actions start at the exact same time (0.0s):
        // 1. Product hero content exits: visible -> gone
        // 2. 5 Product cards consolidate horizontally into moving stack: spread -> stacked
        // 3. Security hero text uncovered from left to right as moving cards pass across it: hidden -> revealed
        // -------------------------------------------------------------------------
        const transitionDuration = 0.76;

        // 1. Product hero content exits smoothly
        tl.to(
          [headerRef.current, headlineRef.current, subheadRef.current, ctaRef.current, floorLineRef.current],
          {
            autoAlpha: 0,
            opacity: 0,
            y: 16,
            duration: 0.55,
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

        // 2. Cards consolidate horizontally into stack at Card 05
        const STACK_ROTX = 38;
        const STACK_ROTY = -22;
        const STACK_ROTZ = -24;

        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const stackStart = i * 0.03;
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

        // Fast, subtle fade out of card text, illustrations, and background gradients
        // (~200ms) as the cards finish consolidating into the stack, leaving clean card surfaces
        const contentFadeDuration = 0.20;
        const contentFadeStart = transitionDuration - contentFadeDuration; // 0.56s

        cardDefaultRefs.current.forEach((el) => {
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
              { opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardGradientBgRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardBackRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { opacity: 0, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });
        cardGlassOverlayRefs.current.forEach((el) => {
          if (el) {
            tl.to(
              el,
              { opacity: 1, duration: contentFadeDuration, ease: "power2.out" },
              contentFadeStart
            );
          }
        });

        // Card front surfaces smoothly crystallize into clean smoked emerald translucent glass
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

        // 3. Security hero text progressively uncovered from left to right as cards sweep across
        const state0El = securityStateRefs.current[0];
        if (state0El) {
          tl.to(
            state0El,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: transitionDuration,
              ease: "power2.inOut",
            },
            0.0
          );
        }

        // -------------------------------------------------------------------------
        // PHASE 2 & 3: ZERO-PAUSE CONTINUATION INTO THE RING (0.76s -> 2.26s)
        // Stacking immediately continues along the curved trajectory to form the ring.
        // Zero dead time or stationary hold.
        // -------------------------------------------------------------------------
        const unfurlBase = transitionDuration; // 0.76s - immediate, uninterrupted continuation

        // Center cluster container with subtle 3D perspective tilt
        tl.to(
          clusterEl,
          {
            x: targetRingX,
            y: targetRingY,
            rotateX: 18,
            rotateY: 20,
            rotateZ: 16,
            duration: 0.85,
            ease: "power2.out",
          },
          unfurlBase
        );

        // 2A. The 5 Original Product Cards lead the unfurling into slots 0 to 4 (Left Arc)
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const slot = ringSlots[i];
          const startTime = unfurlBase + i * 0.016;
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
                  duration: 0.24,
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
                  duration: 0.28,
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
          const startTime = unfurlBase + 0.05 + cIdx * 0.014;

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
                  duration: 0.24,
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
                  duration: 0.28,
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
        // PHASE 4: IMMEDIATE SIMULTANEOUS GLIDE & ROTATION TOWARD LEFT
        // Ring moves from center toward its final left position, completing exactly
        // one full 360° rotation in perfect synchronization.
        // Simultaneously, the Security hero text glides smoothly from center to right.
        // Once reaching the left position, it transitions seamlessly into the continuous
        // slow ambient rotation with zero pause or jump.
        // -------------------------------------------------------------------------
        const ringFormedTime = 1.65; // Ring silhouette established; seamlessly transitions into left glide
        const glideDuration = 2.10; // Unified cinematic travel & rotation to the left side
        const ringSettleTime = ringFormedTime + glideDuration; // 3.75s

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

        // 3. Security hero text glides smoothly from center to right column position
        if (state0El) {
          tl.to(
            state0El,
            {
              x: rightShiftX,
              duration: glideDuration,
              ease: "power2.inOut",
              force3D: true,
            },
            ringFormedTime
          );
        }

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
        gsap.set(wrapper, { opacity: 0, scale: 0.35 });
        if (bill1) gsap.set(bill1, { x: 0, y: 0, rotate: 0 });
        if (bill2) gsap.set(bill2, { x: 0, y: 0, rotate: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(wrapper, { opacity: 0, scale: 0.35 });
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

        // 2. The 5 letters deconstruct into the banknote elements
        if (chars[0]) {
          tl.to(chars[0], { x: -28, y: 10, scale: 0.2, rotate: -15, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle);
        }
        if (chars[1]) {
          tl.to(chars[1], { x: -10, y: -18, scale: 0.25, rotate: 10, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[2]) {
          tl.to(chars[2], { x: 0, y: -22, scale: 0.25, rotate: -8, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle + 0.01);
        }
        if (chars[3]) {
          tl.to(chars[3], { x: 12, y: -16, scale: 0.25, rotate: 12, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[4]) {
          tl.to(chars[4], { x: 28, y: 12, scale: 0.2, rotate: 18, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle);
        }

        // 3. Banknote SVG scales and blooms into position directly over "money"
        const tBillEnter = tSettle + 0.12;
        tl.to(
          wrapper,
          {
            opacity: 1,
            scale: 1,
            duration: 0.32,
            ease: "back.out(1.8)",
          },
          tBillEnter
        );

        // 4. The 2 bills fan out gently at the exact position of the removed bill
        const tFanOut = tBillEnter + 0.24;
        if (bill1) {
          tl.to(
            bill1,
            {
              x: 3,
              y: 2,
              rotate: 5,
              duration: 0.34,
              ease: "back.out(1.8)",
            },
            tFanOut
          );
        }
        if (bill2) {
          tl.to(
            bill2,
            {
              x: -4,
              y: -2,
              rotate: -8,
              duration: 0.38,
              ease: "back.out(2.0)",
            },
            tFanOut + 0.02
          );
        }

        // 5. Subtle playful bounce/flutter on the front bill
        const tFlutter = tFanOut + 0.40;
        if (bill2) {
          tl.to(
            bill2,
            {
              rotate: -5,
              y: -1,
              duration: 0.16,
              yoyo: true,
              repeat: 1,
              ease: "sine.inOut",
            },
            tFlutter
          );
        }

        // 6. Proud hold of the cash fan
        const tHoldEnd = tFlutter + 0.32 + 0.75;

        // 7. Collapse the bills back together into 1 banknote
        const tCollapse = tHoldEnd;
        if (bill1 || bill2) {
          tl.to(
            [bill1, bill2].filter(Boolean),
            {
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.28,
              ease: "power2.inOut",
            },
            tCollapse
          );
        }

        // 8. Banknote contracts & dissolves
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.35,
            duration: 0.25,
            ease: "power2.in",
          },
          tCollapse + 0.20
        );

        // 9. All 5 letters spring outward back into their exact typographical positions
        const tRestore = tCollapse + 0.26;
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

        // Dynamic push distance based on screen width
        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        const isTablet = typeof window !== "undefined" && window.innerWidth < 1024;
        const pushDistance = isMobile ? 32 : isTablet ? 44 : 54;

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
              x: -12,
              duration: 0.28,
              ease: "power1.out",
            },
            0.15
          );
          tl.to(
            rightWord,
            {
              x: 12,
              duration: 0.28,
              ease: "power1.out",
            },
            0.15
          );

          // Micro-tension / resistance stutter (words fight back momentarily)
          tl.to(
            leftWord,
            {
              x: -9,
              duration: 0.10,
              ease: "sine.inOut",
            },
            0.43
          );
          tl.to(
            rightWord,
            {
              x: 9,
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
      // HANDSHAKE TRANSFORMATION INTERACTION: "You control the connection"
      // Triggers typography transformation animation into a handshake illustration
      // inspired directly by handshake.mp4 in the public folder.
      // 1. Full line "You control the connection" appears normally and settles.
      // 2. Left words ("You control") & right words ("the connection") deconstruct
      //    and converge into two hands reaching out towards each other from left and right.
      // 3. The hands meet in the center and clasp firmly into a warm handshake,
      //    complete with a rhythmic pump recoil and floating celebration sparkles!
      // 4. Hold clasped handshake proudly for a beat.
      // 5. Reverse transformation: hands unclasp and dissolve, reconstructing
      //    back into the exact typographical sentence.
      // 6. Scrolling unlocks once text is fully restored!
      // Plays every time the user enters this state.
      // -------------------------------------------------------------------------
      const playHandshakeAnimation = () => {
        const chars = youCharRefs.current.filter(Boolean) as HTMLElement[];
        const wrapper = handshakeWrapperRef.current;
        const leftHand = handLeftGroupRef.current;
        const rightHand = handRightGroupRef.current;
        const sparks = handshakeSparksRef.current;

        if (chars.length === 0 || !wrapper || !leftHand || !rightHand) {
          isSecurityTransitioningRef.current = false;
          return;
        }

        if (handshakeAnimTlRef.current) {
          handshakeAnimTlRef.current.kill();
        }

        // Reset elements to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.35 });
        gsap.set(leftHand, { x: -60, opacity: 0, y: 0 });
        gsap.set(rightHand, { x: 60, opacity: 0, y: 0 });
        if (sparks) gsap.set(sparks, { opacity: 0, scale: 0.4 });

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

        handshakeAnimTlRef.current = tl;

        // 1. Brief settle so user reads "You control the connection" normally
        const tSettle = 0.40;

        // 2. The 3 letters of "You" (Y-o-u) deconstruct and converge inward
        if (chars[0]) tl.to(chars[0], { x: 22, y: 2, scale: 0.25, rotate: 10, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle);
        if (chars[1]) tl.to(chars[1], { scale: 0.2, y: -2, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.02);
        if (chars[2]) tl.to(chars[2], { x: -22, y: 2, scale: 0.25, rotate: -10, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle);

        // 3. Handshake illustration blooms directly over the word "You"
        const tHandsEnter = tSettle + 0.18;
        tl.to(
          wrapper,
          {
            opacity: 1,
            scale: 1,
            duration: 0.32,
            ease: "back.out(1.8)",
          },
          tHandsEnter
        );

        tl.to(
          leftHand,
          {
            x: 0,
            opacity: 1,
            duration: 0.34,
            ease: "power3.out",
          },
          tHandsEnter
        );
        tl.to(
          rightHand,
          {
            x: 0,
            opacity: 1,
            duration: 0.34,
            ease: "power3.out",
          },
          tHandsEnter
        );

        // 4. Clasp moment & Handshake pump recoil (inspired by handshake.mp4)
        const tClasp = tHandsEnter + 0.30;

        // Downward shake pump
        tl.to(
          [leftHand, rightHand],
          {
            y: 8,
            duration: 0.10,
            ease: "power2.out",
          },
          tClasp
        );
        // Upward recoil
        tl.to(
          [leftHand, rightHand],
          {
            y: -9,
            duration: 0.14,
            ease: "power2.inOut",
          },
          tClasp + 0.10
        );
        // Secondary soft bounce
        tl.to(
          [leftHand, rightHand],
          {
            y: 3.5,
            duration: 0.10,
            ease: "power2.inOut",
          },
          tClasp + 0.24
        );
        // Settle to rest
        tl.to(
          [leftHand, rightHand],
          {
            y: 0,
            duration: 0.18,
            ease: "elastic.out(1.4, 0.4)",
          },
          tClasp + 0.34
        );

        // Sparkles pop at clasp moment
        if (sparks) {
          tl.to(
            sparks,
            {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              ease: "back.out(2.0)",
            },
            tClasp + 0.04
          );
          tl.to(
            sparks,
            {
              opacity: 0,
              scale: 1.25,
              duration: 0.45,
              ease: "power2.out",
            },
            tClasp + 0.32
          );
        }

        // 5. Proud hold in clasped handshake
        const tHoldEnd = tClasp + 0.34 + 0.75;

        // 6. Reverse transformation: hands unclasp & letters burst back into "control"
        tl.to(
          leftHand,
          {
            x: -60,
            opacity: 0,
            duration: 0.26,
            ease: "power2.in",
          },
          tHoldEnd
        );
        tl.to(
          rightHand,
          {
            x: 60,
            opacity: 0,
            duration: 0.26,
            ease: "power2.in",
          },
          tHoldEnd
        );
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.35,
            duration: 0.24,
            ease: "power2.in",
          },
          tHoldEnd + 0.06
        );

        // All 7 letters of "control" spring outward from center into exact original positions
        const tRestore = tHoldEnd + 0.10;
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

        // 2. The 5 letters deconstruct and fly outward to cardinal nodes of India (shifting rightwards towards the map)
        if (chars[0]) {
          tl.to(chars[0], { x: 12, y: -34, scale: 0.2, rotate: -6, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle);
        }
        if (chars[1]) {
          tl.to(chars[1], { x: 8, y: 8, scale: 0.25, rotate: -4, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[2]) {
          tl.to(chars[2], { x: 32, y: 44, scale: 0.2, rotate: 2, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.03);
        }
        if (chars[3]) {
          tl.to(chars[3], { x: 56, y: 16, scale: 0.25, rotate: 8, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[4]) {
          tl.to(chars[4], { x: 64, y: -24, scale: 0.2, rotate: 12, opacity: 0, duration: 0.32, ease: "power2.in" }, tSettle);
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
      // 2. The 4 letters (s-e-l-l) deconstruct and disperse gracefully outward.
      // 3. The 3D Security Shield Badge blooms into view at the exact position of "sell".
      // 4. Performs the 3D perspective swivel (right tilt, smooth glide to left tilt, return center).
      // 5. Holds the proud defense shield posture with subtle radiant green atmosphere.
      // 6. Smoothly contracts & dissolves back into the readable word "sell".
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

        // Reset elements to initial clean typography state
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.35 });
        if (icon) gsap.set(icon, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
            gsap.set(wrapper, { opacity: 0, scale: 0.35 });
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

        // 2. The 4 letters deconstruct and fly outward
        if (chars[0]) {
          tl.to(chars[0], { x: -16, y: -10, scale: 0.2, rotate: -12, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle);
        }
        if (chars[1]) {
          tl.to(chars[1], { x: -6, y: 12, scale: 0.25, rotate: -6, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[2]) {
          tl.to(chars[2], { x: 8, y: -12, scale: 0.25, rotate: 6, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle + 0.02);
        }
        if (chars[3]) {
          tl.to(chars[3], { x: 18, y: 10, scale: 0.2, rotate: 12, opacity: 0, duration: 0.30, ease: "power2.in" }, tSettle);
        }

        // 3. Shield Badge scales & blooms in with elastic overshoot matching sell.mp4
        const tShieldEnter = tSettle + 0.12;
        tl.to(
          wrapper,
          {
            opacity: 1,
            scale: 1,
            duration: 0.36,
            ease: "back.out(1.8)",
          },
          tShieldEnter
        );

        // 4. Exact 3D motion language from sell.mp4:
        // - Tilt right (Frames 10-18: rotateY: 16, rotateZ: 2)
        // - Smooth glide to left (Frames 20-36: rotateY: -16, rotateZ: -2)
        // - Return to center (Frames 36-52: rotateY: 0, rotateZ: 0)
        const tSwivel = tShieldEnter + 0.24;
        if (icon) {
          tl.to(
            icon,
            {
              rotateY: 16,
              rotateZ: 2,
              x: 2,
              y: -2,
              duration: 0.36,
              ease: "power1.inOut",
            },
            tSwivel
          );
          tl.to(
            icon,
            {
              rotateY: -16,
              rotateZ: -2,
              x: -2,
              y: 1,
              duration: 0.52,
              ease: "power1.inOut",
            },
            tSwivel + 0.36
          );
          tl.to(
            icon,
            {
              rotateY: 0,
              rotateZ: 0,
              x: 0,
              y: 0,
              duration: 0.40,
              ease: "power2.out",
            },
            tSwivel + 0.88
          );
        }

        // 5. Proud hold of the defense shield
        const tHoldEnd = tSwivel + 1.28 + 0.45;

        // 6. Shield contracts and dissolves back into nothingness
        tl.to(
          wrapper,
          {
            opacity: 0,
            scale: 0.35,
            duration: 0.26,
            ease: "power2.in",
          },
          tHoldEnd
        );

        // 7. All 4 letters spring outward back into their exact typographical positions
        const tRestore = tHoldEnd + 0.18;
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

      const goToSecurityState = (nextIdx: number, direction: 1 | -1) => {
        if (isSecurityTransitioningRef.current) return;
        if (nextIdx < 0 || nextIdx >= SECURITY_STATES.length) return;

        const prevIdx = currentSecurityStateRef.current;
        if (prevIdx === nextIdx) return;

        isSecurityTransitioningRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();
        currentSecurityStateRef.current = nextIdx;

        // Clean up money animation if leaving state 0
        if (prevIdx === 0) {
          if (moneyAnimTlRef.current) {
            moneyAnimTlRef.current.kill();
            moneyAnimTlRef.current = null;
          }
          const chars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (moneyWrapperRef.current) gsap.set(moneyWrapperRef.current, { opacity: 0, scale: 0.35 });
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

        // Clean up handshake animation if leaving state 4
        if (prevIdx === 4) {
          if (handshakeAnimTlRef.current) {
            handshakeAnimTlRef.current.kill();
            handshakeAnimTlRef.current = null;
          }
          const chars = youCharRefs.current.filter(Boolean) as HTMLElement[];
          if (chars.length > 0) gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          if (handshakeWrapperRef.current) gsap.set(handshakeWrapperRef.current, { opacity: 0, scale: 0.35 });
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
          if (sellShieldWrapperRef.current) gsap.set(sellShieldWrapperRef.current, { opacity: 0, scale: 0.35 });
          if (sellShieldIconRef.current) gsap.set(sellShieldIconRef.current, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });
        }

        const prevEl = securityStateRefs.current[prevIdx];
        const nextEl = securityStateRefs.current[nextIdx];

        const tl = gsap.timeline({
          onComplete: () => {
            if (nextIdx === 0) {
              playMoneyAnimation();
            } else if (nextIdx === 1) {
              playTypoEyesAnimation();
            } else if (nextIdx === 2) {
              playPasswordMaskAnimation();
            } else if (nextIdx === 3) {
              playLockMorphAnimation();
            } else if (nextIdx === 4) {
              playHandshakeAnimation();
            } else if (nextIdx === 5) {
              playIndiaAnimation();
            } else if (nextIdx === 6) {
              playSellAnimation();
            } else {
              isSecurityTransitioningRef.current = false;
            }
          },
        });

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
        const shiftX = isDesk
          ? Math.round(vCenterX * 0.42)
          : isTab
          ? Math.round(vCenterX * 0.30)
          : Math.round(vCenterX * 0.16);

        // 2. New text smoothly enters with a slight directional movement & subtle stagger
        if (nextEl) {
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
        isSecurityTransitioningRef.current = true;
        lastSecurityScrollTimeRef.current = Date.now();

        // Release locked stage so page can scroll naturally
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

        // Notify Navbar to update active item to "about"
        window.dispatchEvent(
          new CustomEvent("unifolio-active-section", { detail: { section: "about" } })
        );

        const aboutEl = document.getElementById("about");
        if (aboutEl) {
          smoothScrollTo(aboutEl.offsetTop, { duration: 1.0, ease: "power2.inOut" });
        }

        setTimeout(() => {
          isSecurityTransitioningRef.current = false;
        }, 1000);
      };

      const triggerProductToRing = () => {
        if (stateRef.current !== "product") return;
        stateRef.current = "sculpting";
        isHoldingProductRef.current = false;
        commitCardHover(null);

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

        // Clean up handshake animation if active
        if (handshakeAnimTlRef.current) {
          handshakeAnimTlRef.current.kill();
          handshakeAnimTlRef.current = null;
        }
        const youChars = youCharRefs.current.filter(Boolean) as HTMLElement[];
        if (youChars.length > 0) gsap.set(youChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (handshakeWrapperRef.current) gsap.set(handshakeWrapperRef.current, { opacity: 0, scale: 0.35 });

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
        if (sellShieldWrapperRef.current) gsap.set(sellShieldWrapperRef.current, { opacity: 0, scale: 0.35 });
        if (sellShieldIconRef.current) gsap.set(sellShieldIconRef.current, { rotateY: 0, rotateZ: 0, x: 0, y: 0 });

        // Clean up money animation if active
        if (moneyAnimTlRef.current) {
          moneyAnimTlRef.current.kill();
          moneyAnimTlRef.current = null;
        }
        const moneyChars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
        if (moneyChars.length > 0) gsap.set(moneyChars, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
        if (moneyWrapperRef.current) gsap.set(moneyWrapperRef.current, { opacity: 0, scale: 0.35 });
        if (moneyBill1Ref.current) gsap.set(moneyBill1Ref.current, { x: 0, y: 0, rotate: 0 });
        if (moneyBill2Ref.current) gsap.set(moneyBill2Ref.current, { x: 0, y: 0, rotate: 0 });

        // 1. Immediately stop continuous ambient rotation so it cannot fight the reverse timeline
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }

        // 2. Reset any advanced security states back to State 0 before reversing
        if (currentSecurityStateRef.current > 0) {
          const activeEl = securityStateRefs.current[currentSecurityStateRef.current];
          if (activeEl) gsap.set(activeEl, { opacity: 0, visibility: "hidden" });
          const state0El = securityStateRefs.current[0];
          const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
          const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
          const vCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
          const shiftX = isDesk ? Math.round(vCenterX * 0.42) : isTab ? Math.round(vCenterX * 0.30) : Math.round(vCenterX * 0.16);
          if (state0El) gsap.set(state0El, { opacity: 1, visibility: "visible", x: shiftX, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" });
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

          if (isSecurityTransitioningRef.current) return;
          if (wheelGestureActiveRef.current) return;
          if (Date.now() - lastSecurityScrollTimeRef.current < 500) return;

          if (e.deltaY > 12) {
            wheelGestureActiveRef.current = true;
            lastSecurityScrollTimeRef.current = Date.now();
            // One intentional downward scroll = exactly one next state
            if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
              goToSecurityState(currentSecurityStateRef.current + 1, 1);
            } else {
              // At State 8 Closing line -> next intentional downward scroll proceeds to About
              exitSecurityToAbout();
            }
            return;
          } else if (e.deltaY < -12) {
            wheelGestureActiveRef.current = true;
            lastSecurityScrollTimeRef.current = Date.now();
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

        // 3. If in HOLD state on completed Product section:
        // Wait for user to intentionally scroll down. Only on that next downward scroll:
        // Immediately intercept the scroll, prevent the viewport from moving, and trigger transition.
        if (isHoldingProductRef.current && !transitionStartedRef.current) {
          if (e.deltaY > 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            isHoldingProductRef.current = false;
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            triggerProductToRing();
            return;
          } else if (e.deltaY < 0) {
            // User scrolled upward towards hero: exit hold so GSAP scrubs backward
            isHoldingProductRef.current = false;
            return;
          }
        }

        // 4. If arriving at Product section from hero (flip sequence completing):
        if (stateRef.current === "product" && !transitionStartedRef.current) {
          const pinEnd = apertureScrollTriggerRef.current?.end ?? 0;
          const isAtPinEnd = pinEnd > 0 && window.scrollY >= pinEnd - 4;

          // Absorb any residual downward momentum at bottom of pin so viewport never slips past
          if (isAtPinEnd && e.deltaY > 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (arrivalIdleTimeoutRef.current) clearTimeout(arrivalIdleTimeoutRef.current);
            arrivalIdleTimeoutRef.current = setTimeout(() => {
              arrivalIdleTimeoutRef.current = null;
              if (!transitionStartedRef.current && stateRef.current === "product") {
                isHoldingProductRef.current = true;
              }
            }, 120);
            return;
          }
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

        if (stateRef.current === "ring" && transitionCompleteRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();

          if (isSecurityTransitioningRef.current) return;
          if (touchGestureActiveRef.current) return;
          if (Date.now() - lastSecurityScrollTimeRef.current < 500) return;

          const touchDeltaY = touchStartY - e.touches[0].clientY;
          if (touchDeltaY > 24) {
            touchGestureActiveRef.current = true;
            lastSecurityScrollTimeRef.current = Date.now();
            touchStartY = e.touches[0].clientY;
            if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
              goToSecurityState(currentSecurityStateRef.current + 1, 1);
            } else {
              exitSecurityToAbout();
            }
            return;
          } else if (touchDeltaY < -24) {
            touchGestureActiveRef.current = true;
            lastSecurityScrollTimeRef.current = Date.now();
            touchStartY = e.touches[0].clientY;
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

        if (isHoldingProductRef.current && !transitionStartedRef.current) {
          if (touchDeltaY > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            isHoldingProductRef.current = false;
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            triggerProductToRing();
            return;
          } else if (touchDeltaY < -8) {
            isHoldingProductRef.current = false;
            return;
          }
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (transitionAnimatingRef.current) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (stateRef.current === "ring" && transitionCompleteRef.current) {
          if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (isSecurityTransitioningRef.current) return;
            if (Date.now() - lastSecurityScrollTimeRef.current < 350) return;

            if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
              goToSecurityState(currentSecurityStateRef.current + 1, 1);
            } else {
              exitSecurityToAbout();
            }
            return;
          } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (isSecurityTransitioningRef.current) return;
            if (Date.now() - lastSecurityScrollTimeRef.current < 350) return;

            if (currentSecurityStateRef.current > 0) {
              goToSecurityState(currentSecurityStateRef.current - 1, -1);
            } else {
              triggerRingToProduct();
            }
            return;
          }
        }

        if (
          isHoldingProductRef.current &&
          !transitionStartedRef.current &&
          ["ArrowDown", "PageDown", " "].includes(e.key)
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
          isHoldingProductRef.current = false;
          transitionStartedRef.current = true;
          transitionAnimatingRef.current = true;
          triggerProductToRing();
          return;
        }
      };

      const handleScrollLock = () => {
        if (
          transitionAnimatingRef.current ||
          (stateRef.current === "ring" && transitionCompleteRef.current)
        ) {
          if (lockScrollYRef.current > 0 && Math.abs(window.scrollY - lockScrollYRef.current) > 1) {
            window.scrollTo(0, lockScrollYRef.current);
          }
        }
      };

      window.addEventListener("scroll", handleScrollLock, { passive: false, capture: true });
      window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("keydown", handleKeyDown, { capture: true });

      // Navbar Navigation Event Listeners
      const handleShowProduct = () => {
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
          if (back) gsap.set(back, { opacity: 1 });
          const grad = cardGradientBgRefs.current[i];
          if (grad) gsap.set(grad, { opacity: 1 });
          const glass = cardGlassOverlayRefs.current[i];
          if (glass) gsap.set(glass, { opacity: 0 });
          if (flipper) gsap.set(flipper, { rotateY: 0 });
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { opacity: 0.88, scale: 1, filter: "blur(0px)" });
          const defEl = cardDefaultRefs.current[i];
          if (defEl) gsap.set(defEl, { opacity: 1, autoAlpha: 1 });
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
          if (defEl) gsap.set(defEl, { opacity: 1, autoAlpha: 1 });
        });
      };

      window.addEventListener("unifolio-show-product", handleShowProduct);
      window.addEventListener("unifolio-reset-hero", handleResetHero);

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
        if (handshakeAnimTlRef.current) {
          handshakeAnimTlRef.current.kill();
          handshakeAnimTlRef.current = null;
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
            {/* 3D Perspective Cards Amphitheater Stage - Prominently in upper/middle viewport */}
            <div
              ref={cardsStageRef}
              className="w-full flex items-center justify-center relative z-25 shrink-0 pt-1 sm:pt-2 pb-1"
              style={{ perspective: "1400px" }}
              onMouseLeave={() => handleCardHover(null)}
              onPointerMove={(e) => {
                if (e.target === cardsStageRef.current) {
                  handleCardHover(null);
                }
              }}
            >
              <div
                ref={cardsClusterRef}
                className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-3.5 xl:gap-4 w-full max-w-[1340px] mx-auto overflow-x-auto lg:overflow-visible py-1.5 px-2 no-scrollbar will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
                onMouseMove={(e) => {
                  const band = getHoverBandIndex(e.clientX);
                  handleCardHover(band);
                }}
                onMouseLeave={() => handleCardHover(null)}
              >
                {PRODUCT_CARDS.map((card, idx) => {
                  return (
                    <div
                      key={card.id}
                      ref={(el) => {
                        cardWrapperRefs.current[idx] = el;
                      }}
                      onPointerEnter={() => handleCardHover(idx)}
                      onClick={() => handleCardHover(idx)}
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

                          {/* Smoked Emerald Translucent Glass Overlay (Matching 'Cards ring.png') */}
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
                                  "radial-gradient(ellipse 75% 60% at 22% 20%, rgba(34, 197, 94, 0.10) 0%, rgba(16, 185, 129, 0.02) 40%, transparent 68%), " +
                                  "radial-gradient(ellipse 75% 55% at 80% 82%, rgba(34, 197, 94, 0.14) 0%, rgba(74, 222, 128, 0.03) 38%, transparent 65%)",
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
                            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-emerald-300/50 pointer-events-none rounded-t-[20px]" />
                            {/* Left Specular Bevel Catch Line */}
                            <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/70 via-white/15 to-transparent pointer-events-none rounded-l-[20px]" />
                            {/* Bottom Emerald Light-Piping Line */}
                            <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-emerald-500/20 via-[#22C55E]/80 to-emerald-300/60 pointer-events-none rounded-b-[20px]" />
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
                            className="absolute inset-0 z-15 flex flex-col items-start justify-start pt-7 sm:pt-8 px-6 text-left pointer-events-none select-none will-change-transform"
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
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-3.5 sm:px-4.5 py-4 sm:py-5 text-center pointer-events-none will-change-transform"
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
                          className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden bg-[#000000] border border-white/12 shadow-2xl p-4 sm:p-5 flex flex-col justify-between will-change-transform"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
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
                    className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full ${
                      item.type === "hero"
                        ? "max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl px-4 sm:px-6 text-center"
                        : idx === 2 || idx === 3 || idx === 4 || idx === 5 || idx === 6
                        ? "max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl px-6 md:pl-16 lg:pl-28 xl:pl-36 text-left"
                        : "max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl px-6 text-left"
                    } will-change-transform pointer-events-none`}
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                    }}
                  >
                    {item.type === "hero" ? (
                      <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] 2xl:text-[68px] text-neutral-950 dark:text-white tracking-[-0.035em] uppercase leading-[1.04] text-center select-none">
                        We take your data <br />
                        as <span className="text-[#22C55E] font-black">seriously</span> as you <br />
                        take your{" "}
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

                          {/* Morphed Cash Banknote Stack Animation SVG (Centered directly over "money") */}
                          <span
                            ref={moneyWrapperRef}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                            style={{ opacity: 0, transform: "scale(0.35)" }}
                            aria-hidden="true"
                          >
                            <svg
                              viewBox="0 0 160 110"
                              className="w-[2.4em] h-[1.65em] sm:w-[2.7em] sm:h-[1.85em] md:w-[3.0em] md:h-[2.05em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)] dark:drop-shadow-[0_6px_20px_rgba(34,197,94,0.45)]"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <defs>
                                <g id="unifolio-money-bill">
                                  {/* Main Banknote Body */}
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
                              <g ref={moneyBill1Ref} transform="translate(80, 68)" style={{ transformOrigin: "80px 68px" }}>
                                <use href="#unifolio-money-bill" />
                              </g>

                              {/* Top Pair: Front Bill */}
                              <g ref={moneyBill2Ref} transform="translate(80, 68)" style={{ transformOrigin: "80px 68px" }}>
                                <use href="#unifolio-money-bill" />
                              </g>
                            </svg>
                          </span>
                        </span>
                        .
                      </h2>
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
                                className="absolute -top-[28px] sm:-top-[36px] md:-top-[44px] left-1/2 -translate-x-1/2 pointer-events-none select-none inline-flex items-center gap-2 sm:gap-2.5 md:gap-3 px-2 py-1 z-20"
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
                          // State 5: "You control the connection" - Typography Transformation into Handshake on "You"
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
                            {/* The word "You" transforms into the handshake */}
                            <span className="relative inline-flex items-center justify-center align-baseline">
                              {/* The 3 letters of "You" in Unifolio green */}
                              <span className="inline-flex items-baseline text-[#22C55E] font-black">
                                {YOU_LETTERS.map((char, charIdx) => (
                                  <span
                                    key={charIdx}
                                    ref={(el) => {
                                      youCharRefs.current[charIdx] = el;
                                    }}
                                    className="inline-block will-change-transform"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </span>

                              {/* Morphed Handshake SVG Icon (Centered directly over the word "You") */}
                              <span
                                ref={handshakeWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                style={{ opacity: 0, transform: "scale(0.35)" }}
                                aria-hidden="true"
                              >
                                <svg
                                  viewBox="0 0 220 130"
                                  className="w-[2.8em] h-[1.7em] sm:w-[2.9em] sm:h-[1.75em] overflow-visible drop-shadow-[0_6px_22px_rgba(34,197,94,0.5)]"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <defs>
                                    <linearGradient id="cuffGreenLeft" x1="32" y1="38" x2="74" y2="86" gradientUnits="userSpaceOnUse">
                                      <stop offset="0%" stopColor="#4ADE80" />
                                      <stop offset="60%" stopColor="#22C55E" />
                                      <stop offset="100%" stopColor="#16A34A" />
                                    </linearGradient>
                                    <linearGradient id="cuffGreenRight" x1="144" y1="38" x2="188" y2="86" gradientUnits="userSpaceOnUse">
                                      <stop offset="0%" stopColor="#4ADE80" />
                                      <stop offset="60%" stopColor="#22C55E" />
                                      <stop offset="100%" stopColor="#15803D" />
                                    </linearGradient>
                                  </defs>

                                  {/* Handshake Sparks & Celebration Stars (burst upon clasp) */}
                                  <g ref={handshakeSparksRef} className="will-change-transform origin-center" style={{ opacity: 0 }}>
                                    {/* Top Left Emerald Star */}
                                    <path
                                      d="M 82 20 Q 82 27 75 27 Q 82 27 82 34 Q 82 27 89 27 Q 82 27 82 20 Z"
                                      fill="#10B981"
                                    />
                                    {/* Top Right Golden Star */}
                                    <path
                                      d="M 140 18 Q 140 25 133 25 Q 140 25 140 32 Q 140 25 147 25 Q 140 25 140 18 Z"
                                      fill="#FBBF24"
                                    />
                                    {/* Bottom Left Mint Star */}
                                    <path
                                      d="M 68 96 Q 68 102 62 102 Q 68 102 68 108 Q 68 102 74 102 Q 68 102 68 96 Z"
                                      fill="#34D399"
                                    />
                                    {/* Bottom Right Lime Star */}
                                    <path
                                      d="M 148 94 Q 148 100 142 100 Q 148 100 148 106 Q 148 100 154 100 Q 148 100 148 94 Z"
                                      fill="#A3E635"
                                    />
                                  </g>

                                  {/* Left Hand Group (reaching right) */}
                                  <g ref={handLeftGroupRef} className="will-change-transform">
                                    {/* Left Sleeve / Cuff (Unifolio Green #22C55E) */}
                                    <path
                                      d="M 52 38 L 74 48 C 76 49 77 52 76 54 L 62 84 C 61 86 58 87 56 86 L 34 76 C 32 75 31 72 32 70 L 46 40 C 47 38 50 37 52 38 Z"
                                      fill="url(#cuffGreenLeft)"
                                    />
                                    {/* White Cuff Button */}
                                    <circle cx="48" cy="74" r="3.6" fill="#FFFFFF" />
                                    {/* Star highlight on sleeve */}
                                    <path
                                      d="M 58 48 Q 58 44 58 42 Q 58 44 60 45 Q 58 46 58 50 Q 58 46 56 45 Q 58 44 58 42 Z"
                                      fill="#FFFFFF"
                                    />

                                    {/* Left Hand / Palm & Fingers */}
                                    <path
                                      d="M 68 52 C 78 50 86 44 94 42 C 99 41 104 43 103 48 C 101 54 94 57 88 60 L 118 70 C 122 71 123 76 120 79 C 117 82 112 82 108 80 L 86 72 L 114 82 C 117 83 118 88 115 91 C 112 94 107 94 103 92 L 80 82 L 102 93 C 105 94 106 99 103 102 C 100 105 95 105 91 103 L 64 86 C 58 82 56 74 58 68 Z"
                                      fill="#FDA4AF"
                                    />
                                    {/* Finger Creases */}
                                    <path d="M 88 68 L 114 77" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                                    <path d="M 84 78 L 108 87" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                                    <path d="M 80 87 L 98 96" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                                  </g>

                                  {/* Right Hand Group (reaching left) */}
                                  <g ref={handRightGroupRef} className="will-change-transform">
                                    {/* Right Sleeve / Cuff (Unifolio Green #22C55E) */}
                                    <path
                                      d="M 168 38 C 170 37 173 38 174 40 L 188 70 C 189 72 188 75 186 76 L 164 86 C 162 87 159 86 158 84 L 144 54 C 143 52 144 49 146 48 Z"
                                      fill="url(#cuffGreenRight)"
                                    />
                                    {/* White Cuff Button */}
                                    <circle cx="172" cy="74" r="3.6" fill="#FFFFFF" />
                                    {/* Curved Highlight */}
                                    <path
                                      d="M 160 46 C 164 44 169 46 172 50 C 171 52 168 50 164 51 Z"
                                      fill="#FFFFFF"
                                    />

                                    {/* Right Hand Palm & Thumb */}
                                    <path
                                      d="M 152 52 C 142 50 134 44 122 43 C 114 42 108 46 110 52 C 113 58 122 62 130 65 L 148 76 C 153 79 156 74 156 68 Z"
                                      fill="#FED7AA"
                                    />
                                    {/* Curled Fingertips visible under clasp */}
                                    <rect x="74" y="80" width="14" height="22" rx="7" transform="rotate(-20 74 80)" fill="#FDBA74" />
                                    <rect x="88" y="86" width="14" height="22" rx="7" transform="rotate(-20 88 86)" fill="#FDBA74" />
                                    <rect x="102" y="91" width="13" height="20" rx="6.5" transform="rotate(-20 102 91)" fill="#FDBA74" />
                                    {/* Thumb Crease */}
                                    <path d="M 124 50 C 120 54 122 58 128 62" stroke="#15803D" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                                  </g>
                                </svg>
                              </span>
                            </span>

                            <span> control the connection</span>
                          </h3>
                        ) : idx === 5 ? (
                          // State 6: "Stored in India" - Typography Transformation into Minimal India Map Outline
                          <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.06] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
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

                              {/* Morphed Minimal India Map Outline SVG (Shifted right so it does NOT overlap the word "in") */}
                              <span
                                ref={indiaMapWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                style={{ opacity: 0, transform: "scale(0.35)" }}
                                aria-hidden="true"
                              >
                                <span className="inline-flex items-center justify-center translate-x-8 sm:translate-x-10 md:translate-x-12">
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

                              {/* Morphed Security Shield Badge SVG (Centered directly over the word "sell") */}
                              <span
                                ref={sellShieldWrapperRef}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10"
                                style={{ opacity: 0, transform: "scale(0.35)", perspective: "800px" }}
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
                      <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] text-neutral-950 dark:text-white tracking-[-0.035em] uppercase leading-[1.04]">
                        Security isn&apos;t a feature here. <br />
                        <span className="text-[#22C55E]">
                          It&apos;s the baseline everything else is built on.
                        </span>
                      </h2>
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
