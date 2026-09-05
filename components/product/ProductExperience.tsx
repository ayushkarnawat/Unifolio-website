"use client";

import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

interface ProductCardData {
  id: string;
  num: string;
  title: string;
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
    hoverType: "bullets",
    hoverBullets: [
      {
        label: "Overlap Check.",
        text: 'See if a "diversified" set of funds is secretly one concentrated bet on the same handful of companies.',
      },
      {
        label: "Performance, in context.",
        text: "How your funds, stocks and your portfolio as a whole, are actually doing against what matters, not just a raw return.",
      },
      {
        label: "Hidden Fee Finder.",
        text: "What you're quietly losing to expense ratios, and what a cheaper option looks like.",
      },
      {
        label: "Peer Benchmarking.",
        text: "See how your portfolio compares to others with a similar profile, not just a generic market index.",
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

export function ProductExperience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Full-Screen Black Surface Overlay (takes over viewport directly over Hero)
  const blackOverlayRef = useRef<HTMLDivElement | null>(null);

  // Top Product Header Elements
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  // 3D Cards Expansion / Splitting Elements
  const cardsStageRef = useRef<HTMLDivElement | null>(null);
  const cardsClusterRef = useRef<HTMLDivElement | null>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFlipperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardDefaultRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardHoverRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Hover tracking ref to prevent duplicate or conflicting animation triggers
  const currentHoverRef = useRef<number | null>(null);
  // Debounces raw enter/leave events before they're committed to an actual
  // animation. The cards' widths are animated on hover (see below), which
  // means the flex row genuinely reflows and sibling card edges shift
  // slightly under a stationary cursor mid-transition; moving smoothly from
  // one card to the next also briefly crosses the small flex `gap` between
  // them. Both cases fire a raw mouseenter/mouseleave that don't reflect a
  // real change of intent - committing them immediately is what caused
  // cards to flicker/rapidly toggle. A short async settle window absorbs
  // that noise without adding perceptible input lag (the resulting tween
  // itself already runs 350-450ms).
  const hoverCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverCommitTimeoutRef.current) clearTimeout(hoverCommitTimeoutRef.current);
    };
  }, []);

  // State management: 'hero' | 'transitioning' | 'product'
  const stateRef = useRef<"hero" | "transitioning" | "product">("hero");

  // GSAP Interactive Card Hover Choreography: Unified, reversible, zero-glitch controller
  const commitCardHover = (idx: number | null) => {
    // Only active after all cards have reached their final resting state
    if (stateRef.current !== "product") return;
    if (currentHoverRef.current === idx) return;
    currentHoverRef.current = idx;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;

    // Width calculations guarantee constant cluster width (no flex jumps or layout thrash)
    // Desktop: 225 * 5 = 1125px; Hovered: 365 + (190 * 4) = 1125px
    // Tablet:  195 * 5 = 975px;  Hovered: 315 + (165 * 4) = 975px
    const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;
    const expandedWidth = isDesktop ? 365 : isTablet ? 315 : 280;
    const compressedWidth = isDesktop ? 190 : isTablet ? 165 : 148;

    // 1. Cleanly kill all in-progress or delayed tweens on all cards before starting new state
    PRODUCT_CARDS.forEach((_, i) => {
      const wrapper = cardWrapperRefs.current[i];
      const defaultEl = cardDefaultRefs.current[i];
      const hoverEl = cardHoverRefs.current[i];
      const front = cardFrontRefs.current[i];

      if (wrapper) gsap.killTweensOf(wrapper);
      if (defaultEl) gsap.killTweensOf(defaultEl);
      if (hoverEl) gsap.killTweensOf(hoverEl);
      if (front) gsap.killTweensOf(front);
    });

    // 2. Smoothly animate all cards toward their precise destination
    PRODUCT_CARDS.forEach((card, i) => {
      const wrapper = cardWrapperRefs.current[i];
      const defaultEl = cardDefaultRefs.current[i];
      const hoverEl = cardHoverRefs.current[i];
      const front = cardFrontRefs.current[i];
      if (!wrapper) return;

      if (idx === null) {
        // --- RESTING STATE: Every card collapses smoothly to its default centered composition ---
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
          duration: 0.45,
          ease: "power2.out",
        });

        if (defaultEl) {
          gsap.to(defaultEl, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          });
        }

        if (hoverEl) {
          gsap.to(hoverEl, {
            opacity: 0,
            y: 8,
            duration: 0.20,
            ease: "power2.in",
          });
        }

        if (front) {
          gsap.to(front, {
            boxShadow:
              "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            duration: 0.35,
            ease: "power2.out",
          });
        }
      } else if (i === idx) {
        // --- EXPANDED STATE: Hovered card smoothly expands and elevates toward user ---
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
          duration: 0.45,
          ease: "power2.out",
        });

        if (defaultEl) {
          // Fade out centered default content cleanly
          gsap.to(defaultEl, {
            opacity: 0,
            scale: 0.94,
            y: -6,
            duration: 0.22,
            ease: "power2.inOut",
          });
        }

        if (hoverEl) {
          // Reveal reading layout content with slight delay so expansion breathes
          gsap.to(hoverEl, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            delay: 0.08,
            ease: "power2.out",
          });
        }

        if (front) {
          gsap.to(front, {
            boxShadow:
              "0 25px 50px -12px rgba(16, 185, 129, 0.35), 0 0 0 1px rgba(16, 185, 129, 0.5)",
            borderColor: "rgba(16, 185, 129, 0.5)",
            duration: 0.35,
            ease: "power2.out",
          });
        }
      } else {
        // --- COMPRESSED STATE: Non-hovered cards compress without collisions or jumps ---
        gsap.to(wrapper, {
          width: compressedWidth,
          scale: 0.98,
          x: 0,
          y: card.restY + 2,
          z: card.restZ - 8,
          rotateY: card.restRotateY,
          rotateZ: card.restRotateZ,
          opacity: 0.70,
          zIndex: 10,
          duration: 0.45,
          ease: "power2.out",
        });

        if (defaultEl) {
          // Centered default content gently dims
          gsap.to(defaultEl, {
            opacity: 0.65,
            scale: 0.96,
            y: 0,
            duration: 0.30,
            ease: "power2.out",
          });
        }

        if (hoverEl) {
          gsap.to(hoverEl, {
            opacity: 0,
            y: 8,
            duration: 0.18,
            ease: "power2.in",
          });
        }

        if (front) {
          gsap.to(front, {
            boxShadow:
              "0 15px 30px -10px rgba(0, 0, 0, 0.7), 0 4px 10px -4px rgba(0, 0, 0, 0.5)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            duration: 0.35,
            ease: "power2.out",
          });
        }
      }
    });
  };

  // Determine which card a pointer X position belongs to using the row's
  // own intended layout (its resting/expanded/compressed slot widths plus
  // its actual flex `gap`), rather than hit-testing the cards' own DOM
  // boxes. The cards sit in a tilted 3D "amphitheater" arc (rotateY/rotateZ/
  // z, with center cards on top via zIndex) which makes their rendered
  // surfaces overlap on screen - hit-testing an individual card's box means
  // whichever card is painted on top there wins, silently stealing most of
  // an outer card's hoverable area (verified: only its outer sliver away
  // from center is ever actually reachable). Computing a stable left-to-right
  // band per card from the cluster's own untransformed rect sidesteps that
  // overlap entirely and gives every card an equal, predictable target.
  const getHoverBandIndex = (clientX: number): number | null => {
    const cluster = cardsClusterRef.current;
    if (!cluster) return null;
    const rect = cluster.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right) return null;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
    const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;
    const expandedWidth = isDesktop ? 365 : isTablet ? 315 : 280;
    const compressedWidth = isDesktop ? 190 : isTablet ? 165 : 148;

    const hovered = currentHoverRef.current;
    const widths = PRODUCT_CARDS.map((_, i) =>
      hovered === null ? restingWidth : i === hovered ? expandedWidth : compressedWidth
    );

    const gap = parseFloat(window.getComputedStyle(cluster).columnGap || "0") || 0;
    const totalWidth = widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);

    // Cards are horizontally centered within the cluster (justify-content: center)
    let bandStart = rect.left + (rect.width - totalWidth) / 2;
    for (let i = 0; i < widths.length; i++) {
      const bandEnd = bandStart + widths[i];
      if (clientX >= bandStart && clientX < bandEnd) return i;
      bandStart = bandEnd + gap;
    }
    return clientX < rect.left + rect.width / 2 ? 0 : widths.length - 1;
  };

  // Public hover entry point used by the JSX below. Coalesces bursts of
  // enter/leave noise into a single committed target: entering a card
  // commits almost immediately (imperceptible delay), while collapsing back
  // to resting waits slightly longer so a same-tick re-entry (a different
  // band, or the same one after a reflow blip) can cancel the collapse
  // instead of visibly snapping shut and reopening.
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
    const delay = idx === null ? 90 : 20;
    hoverCommitTimeoutRef.current = setTimeout(() => {
      hoverCommitTimeoutRef.current = null;
      commitCardHover(idx);
    }, delay);
  };

  useGSAP(
    () => {
      if (!sectionRef.current || !stageRef.current) return;

      function showProductRestingState() {
        stateRef.current = "product";
        masterTl.pause(masterTl.duration());
        gsap.set(blackOverlayRef.current, { display: "none", opacity: 0 });
        gsap.set(headlineRef.current, { opacity: 1, y: 0 });
        gsap.set(subheadRef.current, { opacity: 1, y: 0 });
        gsap.set(ctaRef.current, { opacity: 1, scale: 1, y: 0 });
        gsap.set(cardsClusterRef.current, { scaleX: 1, scaleY: 1, opacity: 1 });

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const flipper = cardFlipperRefs.current[i];
          const front = cardFrontRefs.current[i];
          const back = cardBackRefs.current[i];
          const defaultEl = cardDefaultRefs.current[i];
          const hoverEl = cardHoverRefs.current[i];
          if (wrapper) {
            gsap.set(wrapper, {
              x: 0,
              y: card.restY,
              z: card.restZ,
              rotateY: card.restRotateY,
              rotateZ: card.restRotateZ,
              opacity: 1,
              zIndex: 10 + (2 - Math.abs(i - 2)),
            });
          }
          if (front) {
            gsap.set(front, {
              borderRadius: "20px",
              borderColor: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
            });
          }
          if (back) gsap.set(back, { borderRadius: "20px" });
          if (flipper) gsap.set(flipper, { rotateY: 0 });
          if (defaultEl) gsap.set(defaultEl, { opacity: 1, scale: 1, y: 0 });
          if (hoverEl) gsap.set(hoverEl, { opacity: 0, y: 8 });
        });
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }

      function resetToHeroState() {
        masterTl.pause(0);
        stateRef.current = "hero";
        gsap.set(blackOverlayRef.current, { opacity: 0, display: "none" });
        gsap.set(headlineRef.current, { opacity: 0, y: -30 });
        gsap.set(subheadRef.current, { opacity: 0, y: -18 });
        gsap.set(ctaRef.current, { opacity: 0, y: -12, scale: 0.92 });
        gsap.set(cardsClusterRef.current, { scaleX: 1.35, scaleY: 1.8, opacity: 0 });

        PRODUCT_CARDS.forEach((_, i) => {
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
              y: 0,
              z: 0,
              rotateY: 0,
              rotateZ: 0,
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
          if (flipper) gsap.set(flipper, { rotateY: 180 });
          if (defaultEl) gsap.set(defaultEl, { opacity: 1, scale: 1, y: 0 });
          if (hoverEl) gsap.set(hoverEl, { opacity: 0, y: 8 });
        });
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }

      // =======================================================================
      // MASTER GSAP TIMELINE: DELIBERATE LEFT-TO-RIGHT SEQUENTIAL REVEAL
      // Expansion → Solid Black Surface → Split into 5 Cards → Left-to-Right Flips
      // =======================================================================
      const masterTl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          showProductRestingState();
          // FINAL RESTING STATE: Ensure viewport is locked precisely at Product top
          if (sectionRef.current) {
            window.scrollTo({
              top: sectionRef.current.offsetTop,
              behavior: "instant" as ScrollBehavior,
            });
          }
        },
      });

      const isStandalone = typeof window !== "undefined" && window.location.pathname === "/product";
      const isHashProduct = typeof window !== "undefined" && window.location.hash === "#product";
      const isScrolledPastHero = typeof window !== "undefined" && window.scrollY > (window.innerHeight * 0.35);
      const reduced = prefersReducedMotion();

      // Initialize state based on initial conditions (refresh, direct link, or top landing)
      if (isStandalone || reduced || isHashProduct || isScrolledPastHero) {
        showProductRestingState();
      } else {
        resetToHeroState();
      }

      // -----------------------------------------------------------------------
      // STAGE 1: BLACK OVERLAY TAKES OVER HERO (0.00s -> 0.45s)
      // Rapid takeover directly over the Hero composition (no empty black pause)
      // -----------------------------------------------------------------------
      masterTl.set(blackOverlayRef.current, { display: "block" }, 0.0);
      masterTl.to(
        blackOverlayRef.current,
        {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
        },
        0.0
      );

      // Instant programmatic jump to Product section while full-screen black overlay is at 100% opacity
      masterTl.call(() => {
        if (sectionRef.current) {
          window.scrollTo({
            top: sectionRef.current.offsetTop,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }, [], 0.45);

      // Reveal the solid black card cluster seamlessly behind the overlay
      masterTl.set(cardsClusterRef.current, { opacity: 1 }, 0.45);

      // -----------------------------------------------------------------------
      // STAGE 2: SURFACE COMPRESSES & DIVIDES INTO 5 PIECES/CARDS (0.45s -> 1.05s)
      // Continuous motion: full-screen black surface → shrinks → splits into 5 cards
      // -----------------------------------------------------------------------
      masterTl.to(
        blackOverlayRef.current,
        {
          opacity: 0,
          duration: 0.32,
          ease: "power1.out",
          onComplete: () => {
            gsap.set(blackOverlayRef.current, { display: "none" });
          },
        },
        0.48
      );

      // -----------------------------------------------------------------------
      // STAGE 2B: PRODUCT TEXT & CTA FULLY REVEAL IMMEDIATELY AFTER BLACK SCREEN
      // (0.50s -> 0.90s)
      // As the black screen clears, the headline, supporting text, and CTA
      // are immediately 100% visible in the viewport so the user sees the
      // complete landing composition while the cards are splitting and flipping!
      // -----------------------------------------------------------------------
      masterTl.to(
        headlineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        0.50
      );

      masterTl.to(
        subheadRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        0.58
      );

      masterTl.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.2)",
        },
        0.65
      );

      // Single black surface shrinks/compresses into card amphitheater bounds
      masterTl.to(
        cardsClusterRef.current,
        {
          scaleX: 1,
          scaleY: 1,
          duration: 0.60,
          ease: "power3.inOut",
        },
        0.45
      );

      // Divisions appear: gaps open up and corners round from 0 to 20px
      PRODUCT_CARDS.forEach((_, i) => {
        const wrapper = cardWrapperRefs.current[i];
        const front = cardFrontRefs.current[i];
        const back = cardBackRefs.current[i];

        if (wrapper) {
          masterTl.to(
            wrapper,
            {
              x: 0,
              duration: 0.55,
              ease: "power3.out",
            },
            0.48
          );
        }

        if (front) {
          masterTl.to(
            front,
            {
              borderRadius: "20px",
              duration: 0.48,
              ease: "power2.out",
            },
            0.52
          );
        }

        if (back) {
          masterTl.to(
            back,
            {
              borderRadius: "20px",
              borderColor: "rgba(255,255,255,0.12)",
              duration: 0.48,
              ease: "power2.out",
            },
            0.52
          );
        }
      });

      // -----------------------------------------------------------------------
      // STAGE 3: CARDS MOVE INTO 3D ARC AND SETTLE (0.95s -> 1.55s)
      // Cards move into their curved 3D positions with solid black backplates
      // -----------------------------------------------------------------------
      PRODUCT_CARDS.forEach((card, i) => {
        const wrapper = cardWrapperRefs.current[i];
        if (!wrapper) return;

        masterTl.to(
          wrapper,
          {
            y: card.restY,
            z: card.restZ,
            rotateY: card.restRotateY,
            rotateZ: card.restRotateZ,
            duration: 0.60,
            ease: "power3.out",
          },
          0.95 + i * 0.02
        );
      });

      // -----------------------------------------------------------------------
      // STAGE 4: SEQUENTIAL LEFT-TO-RIGHT FLIPS (1.60s -> 4.20s)
      // Once the cards have split from the shrinking surface and moved into their positions,
      // flip them one by one, from left to right.
      // Card 1 flips → settles → Card 2 flips → settles → Card 3 flips → settles → Card 4 flips → settles → Card 5 flips → settles.
      // Deliberate pacing with subtle overlap so the progression is crystal clear.
      // All other contents (headline, subhead, CTA) remain completely visible in the viewport!
      // -----------------------------------------------------------------------
      const flipDuration = 0.56;
      const flipInterval = 0.50; // subtle overlap: next card begins right as previous card reaches ~90% and settles
      const flipBaseStart = 1.60;

      PRODUCT_CARDS.forEach((_, i) => {
        const flipper = cardFlipperRefs.current[i];
        if (!flipper) return;

        const startTime = flipBaseStart + i * flipInterval;

        masterTl.to(
          flipper,
          {
            rotateY: 0,
            duration: flipDuration,
            ease: "power2.inOut",
          },
          startTime
        );
      });

      // Brief hold for final card settle (Card 5 completes at 1.60 + 4*0.50 + 0.56 = 4.16s)
      masterTl.to({}, { duration: 0.25 }, 4.16);

      // Enforce zero scroll drift throughout the flipping sequence
      [0.60, 1.00, 1.50, 2.00, 2.50, 3.00, 3.50, 4.00].forEach((t) => {
        masterTl.call(() => {
          if (sectionRef.current && stateRef.current === "transitioning") {
            window.scrollTo({
              top: sectionRef.current.offsetTop,
              behavior: "instant" as ScrollBehavior,
            });
          }
        }, [], t);
      });

      // =======================================================================
      // SCROLL BEHAVIOR: DETECT SCROLL INTENT ONCE & LOCK SCROLLING
      // A single scroll gesture triggers the complete sequence automatically
      // =======================================================================
      const triggerHeroToProduct = () => {
        if (stateRef.current !== "hero") return;
        stateRef.current = "transitioning";

        // Prevent erratic user scroll input from interrupting the animation
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        masterTl.play(0);
      };

      const triggerProductToHero = () => {
        if (stateRef.current !== "product") return;
        stateRef.current = "transitioning";

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        gsap.set(blackOverlayRef.current, { display: "block" });
        gsap.to(blackOverlayRef.current, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            window.scrollTo({ top: 0, behavior: "instant" });
            masterTl.pause(0);
            gsap.to(blackOverlayRef.current, {
              opacity: 0,
              duration: 0.35,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(blackOverlayRef.current, { display: "none" });
                stateRef.current = "hero";
                document.documentElement.style.overflow = "";
                document.body.style.overflow = "";
              },
            });
          },
        });
      };

      // Native wheel listener: completely block scroll events during transition!
      const handleWheel = (e: WheelEvent) => {
        if (stateRef.current === "transitioning") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        const scrollY = window.scrollY;
        const productTop = sectionRef.current?.offsetTop || window.innerHeight;

        // 1. User is on Hero and initiates ONE downward scroll
        if (stateRef.current === "hero" && scrollY <= 80 && e.deltaY > 5) {
          e.preventDefault();
          triggerHeroToProduct();
        }
        // 2. User is at Product and initiates ONE upward scroll back to Hero
        else if (
          stateRef.current === "product" &&
          scrollY <= productTop + 20 &&
          e.deltaY < -15
        ) {
          e.preventDefault();
          triggerProductToHero();
        }
      };

      // Touch listener for mobile devices
      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (stateRef.current === "transitioning") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        const touchDeltaY = touchStartY - e.touches[0].clientY;
        const scrollY = window.scrollY;
        const productTop = sectionRef.current?.offsetTop || window.innerHeight;

        if (stateRef.current === "hero" && scrollY <= 80 && touchDeltaY > 15) {
          e.preventDefault();
          triggerHeroToProduct();
        } else if (
          stateRef.current === "product" &&
          scrollY <= productTop + 20 &&
          touchDeltaY < -20
        ) {
          e.preventDefault();
          triggerProductToHero();
        }
      };

      // Keyboard listener (ArrowDown, PageDown, Space)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (stateRef.current === "transitioning") {
          e.preventDefault();
          return;
        }
        if (stateRef.current === "hero" && ["ArrowDown", "PageDown", " "].includes(e.key)) {
          e.preventDefault();
          triggerHeroToProduct();
        }
      };

      // Continuous lock on window scroll during transition
      const handleScroll = () => {
        if (stateRef.current === "transitioning" && sectionRef.current) {
          const productTop = sectionRef.current.offsetTop;
          if (Math.abs(window.scrollY - productTop) > 2) {
            window.scrollTo({ top: productTop, behavior: "instant" });
          }
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("scroll", handleScroll, { passive: false });
      window.addEventListener("unifolio-show-product", showProductRestingState);
      window.addEventListener("unifolio-reset-hero", resetToHeroState);

      const handleHashChange = () => {
        if (window.location.hash === "#product") {
          showProductRestingState();
        } else if (window.location.hash === "#hero" || window.location.hash === "") {
          resetToHeroState();
        }
      };
      window.addEventListener("hashchange", handleHashChange);

      // ScrollTrigger fallback for trackpad scrolling, scrollbar drag, or fast scrolling
      const scrollTriggerInstance = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        onEnter: () => {
          if (stateRef.current === "hero") {
            showProductRestingState();
          }
        },
        onLeaveBack: () => {
          if (window.scrollY < 80) {
            resetToHeroState();
          }
        },
      });

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("unifolio-show-product", showProductRestingState);
        window.removeEventListener("unifolio-reset-hero", resetToHeroState);
        window.removeEventListener("hashchange", handleHashChange);
        scrollTriggerInstance.kill();
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        masterTl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative w-full h-screen min-h-screen bg-[#FAF8F5] dark:bg-[#000000] text-neutral-900 dark:text-white transition-colors duration-500 overflow-hidden"
    >
      {/* =================================================================== */}
      {/* FULL-SCREEN BLACK SURFACE OVERLAY (Takes over Hero on 1st scroll)   */}
      {/* =================================================================== */}
      <div
        ref={blackOverlayRef}
        className="fixed inset-0 w-full h-full bg-[#000000] pointer-events-none z-50 opacity-0 will-change-opacity hidden"
      />

      {/* Main Viewport Stage: Sized precisely to fit comfortably within 100vh */}
      <div
        ref={stageRef}
        className="relative h-screen max-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22 md:pt-24 lg:pt-26 pb-3 sm:pb-4 overflow-hidden select-none bg-[#FAF8F5] dark:bg-[#000000]"
      >
        {/* Ambient Glow for Product Stage */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* ================================================================= */}
        {/* TOP HEADER: Headline, Supporting Text, CTA (Spacious & Balanced)  */}
        {/* ================================================================= */}
        <div
          ref={headerRef}
          className="w-full max-w-3xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mt-1 sm:mt-2"
        >
          {/* Main Headline */}
          <h2
            ref={headlineRef}
            className="font-sans font-black text-2xl sm:text-3xl md:text-[36px] lg:text-[40px] xl:text-[44px] tracking-[-0.03em] leading-[1.12] text-neutral-950 dark:text-white transition-colors duration-500 will-change-transform"
          >
            Understand your wealth.{" "}
            <span
              className="font-medium text-[#22C55E]"
              style={{ color: "#22C55E" }}
            >
              Not just see it.
            </span>
          </h2>

          {/* Supporting Text */}
          <p
            ref={subheadRef}
            className="mt-2 sm:mt-2.5 max-w-lg text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-snug sm:leading-relaxed transition-colors duration-500 will-change-transform"
          >
            Every account, every fund, every rupee, in one place, finally clear.
          </p>

          {/* CTA Pill Button matching other buttons & CTAs */}
          <div className="mt-3 sm:mt-3.5">
            <LinkButton
              ref={ctaRef}
              href="#contact"
              size="sm"
              variant="primary"
              className="shadow-sm shadow-emerald-500/10"
              onClick={(e) => {
                const target = document.getElementById("contact");
                if (target) {
                  e.preventDefault();
                  smoothScrollTo(target.offsetTop, { duration: 1.1, ease: "power2.inOut" });
                }
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E] group-hover:scale-125 transition-transform" />
              <span>Join the waitlist</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-neutral-500 dark:text-neutral-400" />
            </LinkButton>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3D PERSPECTIVE CARDS AMPHITHEATER STAGE (Fits in 100vh Viewport)  */}
        {/* ================================================================= */}
        <div
          ref={cardsStageRef}
          className="w-full flex-1 flex items-center justify-center my-auto relative z-25 py-2"
          style={{ perspective: "1400px" }}
          onMouseLeave={() => handleCardHover(null)}
          onPointerMove={(e) => {
            // When moving over stage background outside any card, return cards to resting state
            if (e.target === cardsStageRef.current) {
              handleCardHover(null);
            }
          }}
        >
          {/* Transforming Cluster Wrapper */}
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
                  className="relative shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[285px] sm:h-[310px] md:h-[330px] lg:h-[345px] xl:h-[360px] 2xl:h-[375px] cursor-pointer will-change-transform"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Flipper container (3D rotation around Y) */}
                  <div
                    ref={(el) => {
                      cardFlipperRefs.current[idx] = el;
                    }}
                    className="relative w-full h-full will-change-transform"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* ======================================================= */}
                    {/* CARD FRONT FACE (revealed after single 180° flip) */}
                    {/* ======================================================= */}
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
                      {/* Unified Panoramic Continuous Flowing Gradient Layer */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[20px]">
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
                        {/* Dark minimal vignette to guarantee 100% crystal clear contrast for text */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90 pointer-events-none" />
                        {/* Subtle specular rim highlight */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                      </div>

                      {/* ===================================================== */}
                      {/* 1. DEFAULT RESTING CONTENT: Centered H & V            */}
                      {/* ===================================================== */}
                      <div
                        ref={(el) => {
                          cardDefaultRefs.current[idx] = el;
                        }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 sm:p-6 text-center pointer-events-none select-none will-change-transform"
                      >
                        {/* Centered Heading */}
                        <h3 className="font-sans font-bold text-sm sm:text-base xl:text-[17px] text-white leading-snug tracking-tight max-w-[200px]">
                          {card.title}
                        </h3>
                      </div>

                      {/* ===================================================== */}
                      {/* 2. EXPANDED HOVER CONTENT: Reading Layout             */}
                      {/* ===================================================== */}
                      <div
                        ref={(el) => {
                          cardHoverRefs.current[idx] = el;
                        }}
                        className="absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-6 text-left pointer-events-none will-change-transform"
                        style={{
                          opacity: 0,
                          transform: "translateY(8px)",
                        }}
                      >
                        {/* Bottom Reading Area: Heading + Extended Copy */}
                        <div className="flex flex-col justify-end space-y-2.5">
                          <h3 className="font-sans font-bold text-sm sm:text-base xl:text-[16px] text-white leading-tight tracking-tight">
                            {card.title}
                          </h3>

                          {card.hoverType === "paragraph" ? (
                            <p className="text-[11px] sm:text-xs text-neutral-300 font-normal leading-relaxed">
                              {card.hoverParagraph}
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-1 no-scrollbar pointer-events-auto">
                              {card.hoverBullets?.map((bullet, bIdx) => (
                                <div key={bIdx} className="text-[10.5px] sm:text-[11px] leading-snug">
                                  <span className="font-semibold text-emerald-300 mr-1">
                                    {bullet.label}
                                  </span>
                                  <span className="text-neutral-300 font-normal">
                                    {bullet.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ======================================================= */}
                    {/* CARD BACK FACE (PLAIN SOLID BLACK - NO GRIDS) */}
                    {/* Clean, minimalist solid black matching reference video */}
                    {/* ======================================================= */}
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
                      {/* Top Header of Plain Black Card Back */}
                      <div className="flex items-center justify-between z-10">
                        <span className="font-mono text-[11px] text-neutral-500 tracking-widest">
                          UNIFOLIO // {card.num}
                        </span>
                        <Sparkles className="w-3 h-3 text-neutral-600" />
                      </div>

                      {/* Center Luxury Monogram */}
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

                      {/* Bottom Minimal Wordmark */}
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
          </div>
        </div>

        {/* Ambient Floor Reflection Line */}
        <div className="w-full max-w-2xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent shrink-0 opacity-50 z-20" />
      </div>
    </section>
  );
}
