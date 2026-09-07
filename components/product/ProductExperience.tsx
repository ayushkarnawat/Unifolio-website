"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, Flip, Observer, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import { CardSculpture, type CardSculptureHandle } from "@/components/product/CardSculpture";
import { PRINCIPLES } from "@/components/security/SecurityExperience";

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
  const cardIllustrationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const companionCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const COMPANION_COUNT = 21;

  // 3D Card Sculpture & Transition Elements
  const sculptureHandleRef = useRef<CardSculptureHandle | null>(null);
  const productToSecurityTlRef = useRef<gsap.core.Timeline | null>(null);
  const ambientRingTweenRef = useRef<gsap.core.Tween | null>(null);

  // Security Narrative In-Place Elements
  const securityStepRef = useRef<number>(0);
  const securityContainerRef = useRef<HTMLDivElement | null>(null);
  const securityHeroRef = useRef<HTMLDivElement | null>(null);
  const securityPrincipleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const securityClosingRef = useRef<HTMLDivElement | null>(null);
  const isTransitioningSecurityRef = useRef<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerProductToSecurityRef = useRef<(() => void) | null>(null);
  const triggerSecurityToProductRef = useRef<(() => void) | null>(null);

  const goToSecurityStep = (targetStep: number, direction: 1 | -1) => {
    if (stateRef.current !== "security" || isTransitioningSecurityRef.current) return;
    const clamped = Math.max(0, Math.min(7, targetStep));
    const prev = securityStepRef.current;
    if (clamped === prev) return;

    // Immediately lock all further scroll transitions until this transition and its gesture settle
    isTransitioningSecurityRef.current = true;
    lastWheelTimeRef.current = Date.now();
    securityStepRef.current = clamped;

    if (unlockTimeoutRef.current) {
      clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = null;
    }
    if (maxLockTimeoutRef.current) {
      clearTimeout(maxLockTimeoutRef.current);
      maxLockTimeoutRef.current = null;
    }

    const getEl = (step: number) => {
      if (step === 0) return securityHeroRef.current;
      if (step >= 1 && step <= 6) return securityPrincipleRefs.current[step - 1];
      if (step === 7) return securityClosingRef.current;
      return null;
    };

    const outEl = getEl(prev);
    const inEl = getEl(clamped);

    const outY = direction > 0 ? -20 : 20;
    const inStartY = direction > 0 ? 24 : -24;

    const checkSettleAndUnlock = () => {
      const QUIET_WINDOW_MS = 100;
      const timeSinceLastEvent = Date.now() - lastWheelTimeRef.current;

      if (timeSinceLastEvent >= QUIET_WINDOW_MS) {
        // Stream of wheel/trackpad events has been quiet for at least 100ms.
        // Gesture and any inertial momentum have completely settled!
        isTransitioningSecurityRef.current = false;
        if (unlockTimeoutRef.current) {
          clearTimeout(unlockTimeoutRef.current);
          unlockTimeoutRef.current = null;
        }
        if (maxLockTimeoutRef.current) {
          clearTimeout(maxLockTimeoutRef.current);
          maxLockTimeoutRef.current = null;
        }
      } else {
        // Trailing momentum events are still firing from this gesture.
        // Re-check after the remaining quiet window.
        const waitTime = Math.max(25, QUIET_WINDOW_MS - timeSinceLastEvent);
        unlockTimeoutRef.current = setTimeout(checkSettleAndUnlock, waitTime);
      }
    };

    const tl = gsap.timeline({
      onComplete: checkSettleAndUnlock,
    });

    if (outEl) {
      tl.to(
        outEl,
        {
          opacity: 0,
          y: outY,
          duration: 0.18,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(outEl, { pointerEvents: "none", y: 0 });
          },
        },
        0
      );
    }

    if (inEl) {
      gsap.set(inEl, { pointerEvents: "auto", y: 0 });
      const heading = inEl.querySelector("h2, h3");
      const paragraph = inEl.querySelector("p");

      tl.fromTo(
        inEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.05 },
        0.06
      );

      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: inStartY },
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: "power3.out",
          },
          0.08
        );
      }

      if (paragraph) {
        tl.fromTo(
          paragraph,
          { opacity: 0, y: inStartY * 0.75 },
          {
            opacity: 1,
            y: 0,
            duration: 0.30,
            ease: "power3.out",
          },
          0.10
        );
      }
    }

    // Safety watchdog ceiling: guarantee unlock after 700ms maximum,
    // in case continuous trackpad drag or stuck browser event loop keeps firing
    maxLockTimeoutRef.current = setTimeout(() => {
      isTransitioningSecurityRef.current = false;
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = null;
      }
    }, 700);
  };

  const handleNextSecurityStep = () => {
    if (isTransitioningSecurityRef.current) return;
    if (securityStepRef.current < 7) {
      goToSecurityStep(securityStepRef.current + 1, 1);
    } else {
      // At State 7 (Closing line):
      // The user is ALREADY on the closing line and has performed a NEW deliberate downward scroll gesture.
      // Only now is the page allowed to release to the next section (#about).
      const aboutEl = document.getElementById("about");
      if (aboutEl) {
        stateRef.current = "releasing";
        isTransitioningSecurityRef.current = true;
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        smoothScrollTo(aboutEl.offsetTop, {
          duration: 1.1,
          ease: "power2.inOut",
          onComplete: () => {
            stateRef.current = "product";
            isTransitioningSecurityRef.current = false;
          },
        });
      }
    }
  };

  const handlePrevSecurityStep = () => {
    if (isTransitioningSecurityRef.current) return;
    if (securityStepRef.current > 0) {
      goToSecurityStep(securityStepRef.current - 1, -1);
    } else {
      // At State 0 (Hero):
      // The user is ALREADY on the first state (Hero) and has performed a NEW deliberate upward scroll gesture.
      // Only now is the page allowed to reverse back to the Product section.
      triggerSecurityToProductRef.current?.();
    }
  };

  const getDomCardRects = () => {
    return cardWrapperRefs.current.map((el) =>
      el ? el.getBoundingClientRect() : new DOMRect()
    );
  };

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

  // State management: 'hero' | 'transitioning' | 'product' | 'sculpting' | 'security' | 'releasing'
  const stateRef = useRef<"hero" | "transitioning" | "product" | "sculpting" | "security" | "releasing">("hero");

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
    const expandedWidth = isDesktop ? 385 : isTablet ? 325 : 280;
    const compressedWidth = isDesktop ? 185 : isTablet ? 162 : 148;

    // 1. Cleanly kill all in-progress or delayed tweens on all cards before starting new state
    PRODUCT_CARDS.forEach((_, i) => {
      const wrapper = cardWrapperRefs.current[i];
      const defaultEl = cardDefaultRefs.current[i];
      const hoverEl = cardHoverRefs.current[i];
      const front = cardFrontRefs.current[i];
      const illus = cardIllustrationRefs.current[i];

      if (wrapper) gsap.killTweensOf(wrapper);
      if (defaultEl) gsap.killTweensOf(defaultEl);
      if (hoverEl) gsap.killTweensOf(hoverEl);
      if (front) gsap.killTweensOf(front);
      if (illus) gsap.killTweensOf(illus);
    });

    // 2. Smoothly animate all cards toward their precise destination
    PRODUCT_CARDS.forEach((card, i) => {
      const wrapper = cardWrapperRefs.current[i];
      const defaultEl = cardDefaultRefs.current[i];
      const hoverEl = cardHoverRefs.current[i];
      const front = cardFrontRefs.current[i];
      const illusEl = cardIllustrationRefs.current[i];
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

        if (illusEl) {
          // 2D sketch restored to prominent, crisp resting appearance
          gsap.to(illusEl, {
            opacity: 0.88,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power2.out",
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

        if (illusEl) {
          // Remove sketch completely on hover
          gsap.to(illusEl, {
            opacity: 0,
            scale: 0.95,
            duration: 0.28,
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

        if (illusEl) {
          gsap.to(illusEl, {
            opacity: 0.65,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power2.out",
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

  // Robust, dynamic card hit-tester based on actual live DOM bounding rects.
  // Determines which card clientX belongs to with zero dead zones or fallthrough bugs.
  const getHoverBandIndex = (clientX: number): number | null => {
    const cluster = cardsClusterRef.current;
    if (!cluster) return null;
    const clusterRect = cluster.getBoundingClientRect();
    if (clientX < clusterRect.left - 15 || clientX > clusterRect.right + 15) return null;

    const cards = cardWrapperRefs.current;
    let closestIdx: number | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const el = cards[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // If cursor is directly inside this card's rendered horizontal boundary
      if (clientX >= rect.left && clientX <= rect.right) {
        return i;
      }
      // If cursor is in the gap between cards, track distance to nearest card center
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(clientX - center);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    return closestIdx;
  };

  // Public hover entry point: responds instantly (10ms) on entering any card,
  // with a comfortable 70ms buffer when moving out so transitions never flicker.
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
      if (!sectionRef.current || !stageRef.current) return;

      function showProductRestingState() {
        stateRef.current = "product";
        masterTl.pause(masterTl.duration());
        gsap.set(blackOverlayRef.current, { display: "none", opacity: 0 });
        gsap.set(headlineRef.current, { opacity: 1, y: 0 });
        gsap.set(subheadRef.current, { opacity: 1, y: 0 });
        gsap.set(ctaRef.current, { opacity: 1, scale: 1, y: 0 });
        gsap.set(cardsClusterRef.current, { scaleX: 1, scaleY: 1, opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });
        if (securityContainerRef.current) {
          gsap.set(securityContainerRef.current, { opacity: 0, pointerEvents: "none" });
        }
        if (securityHeroRef.current) {
          gsap.set(securityHeroRef.current, { opacity: 1, y: 0, pointerEvents: "auto" });
        }
        securityPrincipleRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, y: 0, pointerEvents: "none" });
        });
        if (securityClosingRef.current) {
          gsap.set(securityClosingRef.current, { opacity: 0, y: 0, pointerEvents: "none" });
        }
        securityStepRef.current = 0;
        if (unlockTimeoutRef.current) {
          clearTimeout(unlockTimeoutRef.current);
          unlockTimeoutRef.current = null;
        }
        if (maxLockTimeoutRef.current) {
          clearTimeout(maxLockTimeoutRef.current);
          maxLockTimeoutRef.current = null;
        }
        isTransitioningSecurityRef.current = false;
        ambientRingTweenRef.current?.kill();
        ambientRingTweenRef.current = null;
        sculptureHandleRef.current?.resetToRestInstant();
        sculptureHandleRef.current?.setOpacity(0);

        // Reset companion cards
        companionCardRefs.current.forEach((compEl) => {
          if (compEl) {
            gsap.set(compEl, { opacity: 0, visibility: "hidden", x: 0, y: 0, z: 0, scale: 0.70 });
          }
        });

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
              borderRadius: "20px",
              borderColor: "rgba(255, 255, 255, 0.20)",
              boxShadow:
                "inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.75), " +
                "inset 1px 0 1px 0 rgba(255, 255, 255, 0.35), " +
                "inset 0 -1.5px 2px 0 rgba(34, 197, 94, 0.65), " +
                "inset -1px 0 1.5px 0 rgba(34, 197, 94, 0.40), " +
                "0 14px 32px -6px rgba(0, 0, 0, 0.45), " +
                "0 2px 8px -2px rgba(2, 18, 11, 0.35), " +
                "0 0 1px 1px rgba(34, 197, 94, 0.20)",
            });
          }
          if (back) gsap.set(back, { borderRadius: "20px" });
          if (flipper) gsap.set(flipper, { rotateY: 0 });
          if (defaultEl) gsap.set(defaultEl, { opacity: 1, scale: 1, y: 0 });
          if (hoverEl) gsap.set(hoverEl, { opacity: 0, y: 8 });
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { opacity: 0.88, scale: 1, filter: "blur(0px)" });
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
        gsap.set(cardsClusterRef.current, { scaleX: 1.35, scaleY: 1.8, opacity: 0, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });
        if (securityContainerRef.current) {
          gsap.set(securityContainerRef.current, { opacity: 0, pointerEvents: "none" });
        }
        if (securityHeroRef.current) {
          gsap.set(securityHeroRef.current, { opacity: 1, y: 0, pointerEvents: "auto" });
        }
        securityPrincipleRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0, y: 0, pointerEvents: "none" });
        });
        if (securityClosingRef.current) {
          gsap.set(securityClosingRef.current, { opacity: 0, y: 0, pointerEvents: "none" });
        }
        securityStepRef.current = 0;
        if (unlockTimeoutRef.current) {
          clearTimeout(unlockTimeoutRef.current);
          unlockTimeoutRef.current = null;
        }
        if (maxLockTimeoutRef.current) {
          clearTimeout(maxLockTimeoutRef.current);
          maxLockTimeoutRef.current = null;
        }
        isTransitioningSecurityRef.current = false;
        ambientRingTweenRef.current?.kill();
        ambientRingTweenRef.current = null;
        sculptureHandleRef.current?.resetToRestInstant();
        sculptureHandleRef.current?.setOpacity(0);

        companionCardRefs.current.forEach((compEl) => {
          if (compEl) {
            gsap.set(compEl, { opacity: 0, visibility: "hidden", x: 0, y: 0, z: 0, scale: 0.70 });
          }
        });

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
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { opacity: 0.88, scale: 1, filter: "blur(0px)" });
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

      // -----------------------------------------------------------------------
      // PRODUCT -> SECURITY TRANSITION & AMBIENT SCULPTURE SYSTEM
      // Single-gesture locked-autoplay master timeline:
      // Drives the 3D vortex swirl in CardSculpture over 4.8s,
      // docks to the left side, starts ambient revolution, and reverses cleanly.
      // -----------------------------------------------------------------------



      const triggerProductToSecurity = () => {
        if (stateRef.current !== "product") return;
        stateRef.current = "sculpting";

        // Lock scroll immediately
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        // Enforce Product section alignment — ZERO vertical displacement
        const productTop = sectionRef.current?.offsetTop || 0;
        window.scrollTo({ top: productTop, behavior: "instant" });

        // Reset hover state cleanly
        commitCardHover(null);

        if (productToSecurityTlRef.current) {
          productToSecurityTlRef.current.kill();
        }

        const clusterEl = cardsClusterRef.current;
        if (!clusterEl) return;
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

        // Compute the 26 ring slots matching 'Cards ring.png'
        const TOTAL_RING_CARDS = 26;
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        // Comfortable radius so ring has generous negative space and never gets cut off
        const ringRadius = Math.min(Math.max(vh * 0.22, 160), 215);
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
          // Foreground cards (Cards 01-05 on left and lower cards) pop closer in +Z
          const z = 65 * Math.sin(((alphaDeg - 45) * Math.PI) / 180);
          // Tangent orientation with slinky fanning
          const tangentDeg = (Math.atan2(-Math.cos(rad), Math.sin(rad)) * 180) / Math.PI;

          ringSlots.push({
            x,
            y,
            z: 50 * Math.sin(((alphaDeg - 45) * Math.PI) / 180),
            rotX: 14,
            rotY: -18,
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

        // Master GSAP Timeline: Uninterrupted transformation from resting cards to the final ring
        const tl = gsap.timeline({
          paused: true,
          onComplete: () => {
            stateRef.current = "security";
            securityStepRef.current = 0;
            if (securityHeroRef.current) {
              gsap.set(securityHeroRef.current, { opacity: 1, y: 0, pointerEvents: "auto" });
            }
            securityPrincipleRefs.current.forEach((el) => {
              if (el) gsap.set(el, { opacity: 0, y: 0, pointerEvents: "none" });
            });
            if (securityClosingRef.current) {
              gsap.set(securityClosingRef.current, { opacity: 0, y: 0, pointerEvents: "none" });
            }
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            if (sectionRef.current) {
              window.scrollTo({
                top: sectionRef.current.offsetTop,
                behavior: "instant" as ScrollBehavior,
              });
            }
            // Subtle ambient living 3D sculpture slow rotation once docked on the left
            ambientRingTweenRef.current?.kill();
            ambientRingTweenRef.current = gsap.to(clusterEl, {
              rotateZ: "+=360",
              duration: 40,
              repeat: -1,
              ease: "none",
            });
            // Cooldown so any residual scroll from entering Security doesn't bleed into State 1
            isTransitioningSecurityRef.current = true;
            lastWheelTimeRef.current = Date.now();
            if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
            if (maxLockTimeoutRef.current) clearTimeout(maxLockTimeoutRef.current);
            unlockTimeoutRef.current = setTimeout(() => {
              isTransitioningSecurityRef.current = false;
            }, 300);
          },
          onReverseComplete: () => {
            showProductRestingState();
            stateRef.current = "product";
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
          },
        });

        productToSecurityTlRef.current = tl;

        // -------------------------------------------------------------------------
        // PHASE 0: Product header text and CTA smoothly fade away (0.0s -> 0.22s)
        // -------------------------------------------------------------------------
        tl.to(
          [headlineRef.current, subheadRef.current, ctaRef.current],
          {
            opacity: 0,
            y: -22,
            duration: 0.22,
            ease: "power2.in",
            stagger: 0.02,
          },
          0.0
        );

        // Subtly dim product card text down to subtle translucent watermark so the glass sculpture takes center stage
        cardDefaultRefs.current.forEach((el) => {
          if (el) {
            tl.to(el, { opacity: 0.22, duration: 0.25, ease: "power2.inOut" }, 0.0);
          }
        });

        // -------------------------------------------------------------------------
        // PHASE 1: STACK LEFT TO RIGHT (Card 01 -> Card 02 -> Card 03 -> Card 04 -> Card 05)
        // Starts immediately at 0.0s with crisp, intentional cascade gathering into Card 05
        // -------------------------------------------------------------------------
        const STACK_ROTX = 38;
        const STACK_ROTY = -22;
        const STACK_ROTZ = -24;

        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          // Cascade slide: Card 01 starts instantly, sweeps rightward gathering into 05
          const stackStart = i * 0.05;
          const destX = (stackTargetX - origCenters[i].x) - (4 - i) * 2.5;
          const destY = (stackTargetY - origCenters[i].y) + (4 - i) * 1.5;
          const destZ = (i - 4) * 4; // Card 01 is on top (0px), Card 05 at base (-16px)

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
              duration: 0.30,
              ease: "power2.inOut",
            },
            stackStart
          );
        });

        // Viewport centering offset: positions the ring so it sits naturally centered vertically alongside security content
        const viewportCenterY = (typeof window !== "undefined" ? window.innerHeight : 900) / 2;
        const viewportCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
        const targetRingY = Math.round(viewportCenterY - clusterCenterY + 18);
        const targetRingX = Math.round(viewportCenterX - clusterCenterX);

        // Left docked X position for Phase 4: travels toward the left side of the viewport exactly like security reference video
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1440;
        const dockedLeftX = Math.round(
          targetRingX - (isDesktop ? Math.min(screenW * 0.25, 380) : isTablet ? screenW * 0.20 : 0)
        );

        // Reposition ring upward to visually center in viewport and apply pronounced 3D diagonal tilt
        // Formation stands upright and sculptural, angled in 3D space toward the bottom-right (+Z)
        tl.to(
          clusterEl,
          {
            x: targetRingX,
            y: targetRingY,
            rotateX: 22,
            rotateY: -24,
            rotateZ: -18,
            duration: 0.95,
            ease: "power2.out",
          },
          0.48
        );

        // -------------------------------------------------------------------------
        // PHASE 2 & 3: UNFURL INTO THE RING ALONG THE CURVED TRAJECTORY
        // Cards 01-05 lead out of the stack, companion cards propagate sequentially
        // -------------------------------------------------------------------------
        const unfurlBase = 0.50;

        // 2A. The 5 Original Product Cards lead the unfurling into slots 0 to 4 (Left Arc)
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const slot = ringSlots[i];
          const startTime = unfurlBase + i * 0.042;
          const origX = origCenters[i].x;
          const origY = origCenters[i].y;

          // Intermediate waypoint pulling along the downward curved trajectory
          const midX = (stackTargetX + slot.x) * 0.48;
          const midY = Math.max(stackTargetY, slot.y) + 65;
          const midZ = slot.z * 0.5;
          const midRotZ = STACK_ROTZ * 0.35 + slot.rotZ * 0.65;

          // Set zIndex cleanly once on start to prevent per-frame layer invalidation
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
                  rotateY: -24,
                  rotateZ: midRotZ,
                  scale: finalCardScale,
                  duration: 0.30,
                  ease: "power1.in",
                },
                {
                  x: slot.x - origX,
                  y: slot.y - origY,
                  z: slot.z,
                  rotateX: slot.rotX,
                  rotateY: slot.rotY,
                  rotateZ: slot.rotZ,
                  scale: slot.scale,
                  duration: 0.34,
                  ease: "power1.out",
                },
              ],
              ease: "none",
              force3D: true,
            },
            startTime
          );
        });

        // 2B. 21 Companion Cards propagate naturally from within the moving stack to create density
        companionCardRefs.current.forEach((compEl, cIdx) => {
          if (!compEl) return;

          const slotIdx = 5 + cIdx;
          const slot = ringSlots[slotIdx];
          const startTime = unfurlBase + 5 * 0.042 + cIdx * 0.033;

          const midX = (stackTargetX + slot.x) * 0.48;
          const midY = Math.max(stackTargetY, slot.y) + 65;
          const midZ = slot.z * 0.5;
          const midRotZ = STACK_ROTZ * 0.35 + slot.rotZ * 0.65;

          // Set static properties once without dirtying the GPU transform tween
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
                  rotateY: -24,
                  rotateZ: midRotZ,
                  scale: finalCardScale,
                  duration: 0.30,
                  ease: "power1.in",
                },
                {
                  x: slot.x,
                  y: slot.y,
                  z: slot.z,
                  rotateX: slot.rotX,
                  rotateY: slot.rotY,
                  rotateZ: slot.rotZ,
                  scale: slot.scale,
                  duration: 0.34,
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
        // PHASE 4: SIMULTANEOUS ROTATION & TRAVEL TOWARD LEFT DOCK
        // As soon as the ring formation completes, the ring immediately begins
        // travelling toward its final position on the left while simultaneously rotating.
        // Rotation and horizontal glide are combined into one continuous, cohesive motion.
        // -------------------------------------------------------------------------
        const travelStart = 2.05;
        const travelDuration = 1.35;

        // Simultaneous full 360° rotation (rotateZ: -18 -> 342) while travelling
        tl.to(
          clusterEl,
          {
            rotateZ: 342,
            duration: travelDuration,
            ease: "power2.inOut",
            force3D: true,
          },
          travelStart
        );

        // Simultaneous glide toward the left side of the viewport
        tl.to(
          clusterEl,
          {
            x: dockedLeftX,
            duration: travelDuration,
            ease: "power2.inOut",
            force3D: true,
          },
          travelStart
        );

        // Smoothly fade in security narrative container on the right as ring approaches left dock
        if (securityContainerRef.current) {
          tl.to(
            securityContainerRef.current,
            {
              opacity: 1,
              duration: 0.65,
              ease: "power2.out",
            },
            travelStart + 0.40
          );
          tl.set(securityContainerRef.current, { pointerEvents: "auto" }, travelStart + travelDuration);
        }

        tl.play(0);
      };

      const triggerSecurityToProduct = () => {
        if (stateRef.current !== "security") return;
        stateRef.current = "sculpting";

        // Kill ambient rotation and restore rotateZ to the timeline end state (342)
        ambientRingTweenRef.current?.kill();
        ambientRingTweenRef.current = null;
        if (cardsClusterRef.current) {
          gsap.set(cardsClusterRef.current, { rotateZ: 342 });
        }

        sculptureHandleRef.current?.setAmbient(false);

        // Lock scroll and snap back to Product top
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        if (sectionRef.current) {
          window.scrollTo({
            top: sectionRef.current.offsetTop,
            behavior: "instant" as ScrollBehavior,
          });
        }

        // Fade out security container
        if (securityContainerRef.current) {
          gsap.to(securityContainerRef.current, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
          });
        }

        // Genuine .reverse() on the master timeline per §3, §9.2
        if (productToSecurityTlRef.current) {
          productToSecurityTlRef.current.reverse();
        }
      };

      triggerProductToSecurityRef.current = triggerProductToSecurity;
      triggerSecurityToProductRef.current = triggerSecurityToProduct;

      // Native wheel listener: completely block scroll events during transition!
      const handleWheel = (e: WheelEvent) => {
        if (stateRef.current === "transitioning" || stateRef.current === "sculpting") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (stateRef.current === "releasing") {
          return;
        }

        const scrollY = window.scrollY;
        const productTop = sectionRef.current?.offsetTop || 0;

        // 1. User is on Hero and initiates ONE downward scroll
        if (stateRef.current === "hero" && scrollY <= 80 && e.deltaY > 5) {
          e.preventDefault();
          triggerHeroToProduct();
        }
        // 2. User is at Product and initiates ONE upward scroll back to Hero
        else if (
          stateRef.current === "product" &&
          scrollY <= productTop + 25 &&
          e.deltaY < -15
        ) {
          e.preventDefault();
          triggerProductToHero();
        }
        // 3. User is at Product and initiates ONE downward scroll to Security
        else if (
          stateRef.current === "product" &&
          scrollY >= productTop - 30 &&
          scrollY <= productTop + 40 &&
          e.deltaY > 6
        ) {
          e.preventDefault();
          triggerProductToSecurity();
        }
        // 4. User is at Security (Pinned storytelling experience: viewport remains strictly fixed)
        else if (stateRef.current === "security") {
          e.preventDefault();
          e.stopImmediatePropagation();

          if (sectionRef.current) {
            const productTop = sectionRef.current.offsetTop;
            if (Math.abs(window.scrollY - productTop) > 0.5) {
              window.scrollTo({ top: productTop, behavior: "instant" });
            }
          }

          // If locked, record timestamp to track gesture momentum, and discard immediately without queueing
          if (isTransitioningSecurityRef.current) {
            lastWheelTimeRef.current = Date.now();
            return;
          }

          // Direction-based threshold: filter out tiny sub-pixel electrical jitter (< 4px)
          if (Math.abs(e.deltaY) < 4) {
            return;
          }

          // Strictly one discrete state transition per intentional gesture
          if (e.deltaY > 0) {
            handleNextSecurityStep();
          } else if (e.deltaY < 0) {
            handlePrevSecurityStep();
          }
        }
      };

      // Touch listener for mobile devices
      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (stateRef.current === "transitioning" || stateRef.current === "sculpting") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (stateRef.current === "releasing") {
          return;
        }

        const touchDeltaY = touchStartY - e.touches[0].clientY;
        const scrollY = window.scrollY;
        const productTop = sectionRef.current?.offsetTop || 0;

        if (stateRef.current === "hero" && scrollY <= 80 && touchDeltaY > 15) {
          e.preventDefault();
          triggerHeroToProduct();
        } else if (
          stateRef.current === "product" &&
          scrollY <= productTop + 25 &&
          touchDeltaY < -20
        ) {
          e.preventDefault();
          triggerProductToHero();
        } else if (
          stateRef.current === "product" &&
          scrollY >= productTop - 30 &&
          scrollY <= productTop + 40 &&
          touchDeltaY > 15
        ) {
          e.preventDefault();
          triggerProductToSecurity();
        } else if (stateRef.current === "security") {
          e.preventDefault();
          e.stopImmediatePropagation();

          if (sectionRef.current) {
            const productTop = sectionRef.current.offsetTop;
            if (Math.abs(window.scrollY - productTop) > 0.5) {
              window.scrollTo({ top: productTop, behavior: "instant" });
            }
          }

          if (isTransitioningSecurityRef.current) {
            lastWheelTimeRef.current = Date.now();
            return;
          }

          if (touchDeltaY > 16) {
            touchStartY = e.touches[0].clientY;
            handleNextSecurityStep();
          } else if (touchDeltaY < -16) {
            touchStartY = e.touches[0].clientY;
            handlePrevSecurityStep();
          }
        }
      };

      // Keyboard listener (ArrowDown, PageDown, ArrowUp, PageUp, Space)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (stateRef.current === "transitioning" || stateRef.current === "sculpting") {
          e.preventDefault();
          return;
        }
        if (stateRef.current === "releasing") {
          return;
        }
        if (stateRef.current === "hero" && ["ArrowDown", "PageDown", " "].includes(e.key)) {
          e.preventDefault();
          triggerHeroToProduct();
        } else if (stateRef.current === "product" && ["ArrowDown", "PageDown"].includes(e.key)) {
          e.preventDefault();
          triggerProductToSecurity();
        } else if (stateRef.current === "product" && ["ArrowUp", "PageUp"].includes(e.key)) {
          e.preventDefault();
          triggerProductToHero();
        } else if (stateRef.current === "security") {
          if (["ArrowDown", "PageDown", "ArrowRight", " "].includes(e.key)) {
            e.preventDefault();
            if (isTransitioningSecurityRef.current) return;
            handleNextSecurityStep();
          } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
            e.preventDefault();
            if (isTransitioningSecurityRef.current) return;
            handlePrevSecurityStep();
          }
        }
      };

      // Continuous lock on window scroll during transitions and pinned Security state
      const handleScroll = () => {
        if (sectionRef.current) {
          const productTop = sectionRef.current.offsetTop;
          if (
            (stateRef.current === "transitioning" ||
              stateRef.current === "sculpting" ||
              stateRef.current === "security") &&
            Math.abs(window.scrollY - productTop) > 0.5
          ) {
            window.scrollTo({ top: productTop, behavior: "instant" });
          }
        }
      };

      // Visibility gating for ambient rotation per §9 and §10
      const securityVisibilityTrigger = ScrollTrigger.create({
        trigger: "#security",
        start: "top top",
        end: "bottom top",
        onEnter: () => {
          sculptureHandleRef.current?.setAmbient(true);
        },
        onLeave: () => {
          sculptureHandleRef.current?.setAmbient(false);
        },
        onEnterBack: () => {
          sculptureHandleRef.current?.setAmbient(true);
        },
        onLeaveBack: () => {
          sculptureHandleRef.current?.setAmbient(false);
        },
      });

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("scroll", handleScroll, { passive: false });
      window.addEventListener("unifolio-show-product", showProductRestingState);
      window.addEventListener("unifolio-show-security", triggerProductToSecurity);
      window.addEventListener("unifolio-reset-hero", resetToHeroState);

      const handleHashChange = () => {
        if (window.location.hash === "#product") {
          showProductRestingState();
        } else if (window.location.hash === "#security") {
          triggerProductToSecurity();
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
        window.removeEventListener("unifolio-show-security", triggerProductToSecurity);
        window.removeEventListener("unifolio-reset-hero", resetToHeroState);
        window.removeEventListener("hashchange", handleHashChange);
        scrollTriggerInstance.kill();
        securityVisibilityTrigger.kill();
        sculptureHandleRef.current?.setAmbient(false);
        productToSecurityTlRef.current?.kill();
        if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
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
          className="w-full max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mt-1 sm:mt-2 px-2"
        >
          {/* Main Headline */}
          <h2
            ref={headlineRef}
            className="font-sans font-black text-2xl sm:text-3xl md:text-[40px] lg:text-[48px] xl:text-[54px] 2xl:text-[60px] tracking-[-0.035em] leading-[1.08] text-neutral-950 dark:text-white transition-colors duration-500 will-change-transform md:whitespace-nowrap"
          >
            Understand your wealth.{" "}
            <span
              className="font-black text-[#22C55E]"
              style={{ color: "#22C55E" }}
            >
              Not just see it.
            </span>
          </h2>

          {/* Supporting Text */}
          <p
            ref={subheadRef}
            className="mt-4 sm:mt-5 md:mt-6 max-w-2xl lg:max-w-3xl text-sm sm:text-base md:text-lg lg:text-[19px] text-neutral-700 dark:text-neutral-300 font-medium md:font-semibold leading-relaxed transition-colors duration-500 will-change-transform"
          >
            Every account, every fund, every rupee, in one place, finally clear.
          </p>

          {/* CTA Pill Button matching other buttons & CTAs */}
          <div className="mt-4 sm:mt-5 md:mt-6">
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
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
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
            className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-3.5 xl:gap-4 w-full max-w-[1340px] mx-auto overflow-visible py-1.5 px-2 no-scrollbar will-change-transform"
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
                  onPointerMove={() => handleCardHover(idx)}
                  className="relative shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[310px] sm:h-[330px] md:h-[350px] lg:h-[365px] xl:h-[380px] 2xl:h-[395px] cursor-pointer will-change-transform"
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
                      className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden will-change-transform flex flex-col justify-between"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        background:
                          "linear-gradient(140deg, rgba(6, 34, 21, 0.54) 0%, rgba(3, 20, 12, 0.65) 45%, rgba(1, 10, 6, 0.76) 100%)",
                        backdropFilter: "blur(6px) saturate(135%)",
                        WebkitBackdropFilter: "blur(6px) saturate(135%)",
                        border: "1px solid rgba(255, 255, 255, 0.20)",
                        boxShadow:
                          "inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.75), " +
                          "inset 1px 0 1px 0 rgba(255, 255, 255, 0.35), " +
                          "inset 0 -1.5px 2px 0 rgba(34, 197, 94, 0.65), " +
                          "inset -1px 0 1.5px 0 rgba(34, 197, 94, 0.40), " +
                          "0 14px 32px -6px rgba(0, 0, 0, 0.45), " +
                          "0 2px 8px -2px rgba(2, 18, 11, 0.35), " +
                          "0 0 1px 1px rgba(34, 197, 94, 0.20)",
                      }}
                    >
                      {/* Internal volumetric emerald light / caustic beam travelling through the glass */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[20px]"
                        style={{
                          background:
                            "radial-gradient(ellipse 80% 65% at 24% 20%, rgba(34, 197, 94, 0.28) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 72%), " +
                            "radial-gradient(ellipse 75% 55% at 78% 82%, rgba(34, 197, 94, 0.36) 0%, rgba(74, 222, 128, 0.16) 42%, transparent 70%)",
                        }}
                      />
                      {/* Realistic diagonal studio glass reflection / sheen */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[20px] z-[5]"
                        style={{
                          background:
                            "linear-gradient(120deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 22%, transparent 48%, rgba(34, 197, 94, 0.12) 80%, rgba(74, 222, 128, 0.25) 100%)",
                        }}
                      />
                      {/* Razor-fine top specular rim line */}
                      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-emerald-300/60 pointer-events-none rounded-t-[20px] z-[6]" />
                      {/* Left edge glass specular highlight */}
                      <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/75 via-white/20 to-transparent pointer-events-none rounded-l-[20px] z-[6]" />
                      {/* Bottom edge emerald caustic rim refraction */}
                      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-emerald-500/25 via-[#22C55E] to-emerald-300/80 pointer-events-none rounded-b-[20px] z-[6]" />

                      {/* Translucent ambient tint maintaining crystal clarity */}
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/15 via-transparent to-black/35 pointer-events-none rounded-[20px] z-[6]" />

                      {/* 2D Sketch Companion Illustration (Centered) */}
                      <div
                        ref={(el) => {
                          cardIllustrationRefs.current[idx] = el;
                        }}
                        className="absolute inset-x-0 mx-auto bottom-3 sm:bottom-4 md:bottom-5 w-[132px] sm:w-[145px] md:w-[158px] lg:w-[168px] xl:w-[178px] h-[145px] sm:h-[160px] md:h-[174px] lg:h-[188px] xl:h-[198px] pointer-events-none select-none z-[8] flex items-center justify-center will-change-transform"
                        style={{
                          transformOrigin: "center center",
                        }}
                      >
                        <img
                          src={card.illustration}
                          alt=""
                          className="w-full h-full object-contain object-center pointer-events-none select-none"
                          loading="eager"
                        />
                      </div>

                      {/* ===================================================== */}
                      {/* 1. DEFAULT RESTING CONTENT: Top-Left Number + Heading */}
                      {/* ===================================================== */}
                      <div
                        ref={(el) => {
                          cardDefaultRefs.current[idx] = el;
                        }}
                        className="absolute inset-0 z-20 flex flex-col justify-start p-5 sm:p-5.5 md:p-6 text-left pointer-events-none select-none will-change-transform"
                      >
                        <span className="text-[#22c55e] font-mono font-black text-sm sm:text-base tracking-widest mb-1.5 sm:mb-2">
                          {card.num}
                        </span>
                        <h3 className="font-sans font-black text-base sm:text-lg lg:text-xl xl:text-[22px] text-white leading-[1.18] tracking-tight max-w-[195px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                          {card.title}
                        </h3>
                      </div>

                      {/* ===================================================== */}
                      {/* 2. EXPANDED HOVER CONTENT: Editorial Reading Layout  */}
                      {/* ===================================================== */}
                      <div
                        ref={(el) => {
                          cardHoverRefs.current[idx] = el;
                        }}
                        className="absolute inset-0 z-30 flex flex-col justify-between p-5 sm:p-5.5 md:p-6 text-center pointer-events-none will-change-transform overflow-hidden"
                        style={{
                          opacity: 0,
                          transform: "translateY(8px)",
                        }}
                      >
                        {/* Main Editorial Content: Centered in the card canvas */}
                        <div className="flex flex-col justify-center items-center text-center my-auto flex-1 min-h-0 w-full px-1 sm:px-2">
                          <span className="text-[#22C55E] font-mono font-black text-xs sm:text-sm tracking-widest mb-2">
                            {card.num}
                          </span>
                          <h3 className="font-sans font-extrabold text-xl sm:text-[22px] lg:text-[24px] xl:text-[25px] text-white leading-[1.12] tracking-[-0.035em] mb-2.5 sm:mb-3 shrink-0 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                            {card.title}
                          </h3>

                          {card.hoverType === "paragraph" ? (
                            <p className="text-[13.5px] sm:text-[14px] lg:text-[14.5px] text-neutral-100 font-semibold leading-[1.46] max-w-sm mx-auto text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                              {card.hoverParagraph}
                            </p>
                          ) : (
                            <div className="space-y-2 sm:space-y-2.5 overflow-visible max-w-sm mx-auto text-center">
                              {card.hoverBullets?.map((bullet, bIdx) => (
                                <div key={bIdx} className="text-[12px] sm:text-[12.5px] lg:text-[13px] leading-[1.38] text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                                  <span className="font-extrabold text-[#34d399] mr-1.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                    {bullet.label}
                                  </span>
                                  <span className="text-neutral-100 font-semibold">
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
                          {`UNIFOLIO // ${card.num}`}
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

            {/* 21 Companion Cards for the Ring Formation (matching 'Cards ring.png') */}
            {Array.from({ length: COMPANION_COUNT }).map((_, cIdx) => {
              const slotK = 5 + cIdx;
              const angleNorm = (slotK / 26) * 2 * Math.PI;
              // Procedural lighting variation across the 3D ring:
              // Cards facing the viewer/light (bottom-right) catch more specular rim reflection
              // Cards in the back recede into deeper emerald shadow
              const baseOpacity = 0.52 + 0.10 * Math.sin(angleNorm);
              const specularTop = 0.75 + 0.20 * Math.cos(angleNorm);
              const emeraldRefract = 0.28 + 0.12 * Math.sin(angleNorm + Math.PI / 3);

              return (
                <div
                  key={`comp-card-${cIdx}`}
                  ref={(el) => {
                    companionCardRefs.current[cIdx] = el;
                  }}
                  className="absolute shrink-0 w-[175px] sm:w-[190px] md:w-[205px] lg:w-[215px] xl:w-[225px] 2xl:w-[235px] h-[310px] sm:h-[330px] md:h-[350px] lg:h-[365px] xl:h-[380px] 2xl:h-[395px] pointer-events-none rounded-[20px] will-change-transform overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    opacity: 0,
                    visibility: "hidden",
                    left: "50%",
                    top: "50%",
                    background: `linear-gradient(140deg, rgba(6, 34, 21, ${baseOpacity.toFixed(2)}) 0%, rgba(3, 20, 12, ${(baseOpacity + 0.10).toFixed(2)}) 45%, rgba(1, 10, 6, ${(baseOpacity + 0.18).toFixed(2)}) 100%)`,
                    backdropFilter: "blur(6px) saturate(135%)",
                    WebkitBackdropFilter: "blur(6px) saturate(135%)",
                    border: "1px solid rgba(255, 255, 255, 0.20)",
                    boxShadow:
                      `inset 0 1.5px 1px 0 rgba(255, 255, 255, ${specularTop.toFixed(2)}), ` +
                      "inset 1px 0 1px 0 rgba(255, 255, 255, 0.35), " +
                      `inset 0 -1.5px 2px 0 rgba(34, 197, 94, ${(emeraldRefract * 2).toFixed(2)}), ` +
                      "inset -1px 0 1.5px 0 rgba(34, 197, 94, 0.40), " +
                      "0 14px 32px -6px rgba(0, 0, 0, 0.45), " +
                      "0 2px 8px -2px rgba(2, 18, 11, 0.35), " +
                      "0 0 1px 1px rgba(34, 197, 94, 0.20)",
                  }}
                >
                  {/* Internal volumetric emerald light / caustic beam travelling through the glass */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-[20px]"
                    style={{
                      background:
                        `radial-gradient(ellipse 80% 65% at 24% 20%, rgba(34, 197, 94, ${(emeraldRefract * 0.9).toFixed(2)}) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 72%), ` +
                        `radial-gradient(ellipse 75% 55% at 78% 82%, rgba(34, 197, 94, ${(emeraldRefract * 1.1).toFixed(2)}) 0%, rgba(74, 222, 128, 0.14) 42%, transparent 70%)`,
                    }}
                  />
                  {/* Realistic diagonal studio glass reflection / sheen */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-[20px]"
                    style={{
                      background:
                        "linear-gradient(120deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 22%, transparent 48%, rgba(34, 197, 94, 0.12) 80%, rgba(74, 222, 128, 0.25) 100%)",
                    }}
                  />
                  {/* Razor-fine top specular rim line */}
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-emerald-300/60 pointer-events-none rounded-t-[20px]" />
                  {/* Left edge glass specular highlight */}
                  <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/75 via-white/20 to-transparent pointer-events-none rounded-l-[20px]" />
                  {/* Bottom edge emerald caustic rim refraction */}
                  <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-emerald-500/25 via-[#22C55E] to-emerald-300/80 pointer-events-none rounded-b-[20px]" />

                  {/* Subtle luxury monogram watermark */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-15 pointer-events-none select-none">
                    <div className="w-14 h-14 rounded-full border border-emerald-400/30 flex items-center justify-center">
                      <span className="text-[11px] font-mono font-semibold text-emerald-400 tracking-widest">U</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ambient Floor Reflection Line */}
        <div className="w-full max-w-2xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent shrink-0 opacity-50 z-20" />

        {/* ================================================================= */}
        {/* IN-PLACE SECURITY NARRATIVE (Occupies Right Side When Ring is Left) */}
        {/* ================================================================= */}
        <div
          ref={securityContainerRef}
          id="security"
          className="absolute inset-0 z-40 w-full h-full pointer-events-none opacity-0 flex items-center justify-end px-6 sm:px-10 lg:px-16 xl:px-24 select-none"
        >
          {/* Right Side Column (Occupies right side of stage; 3D Ring is docked on left) */}
          <div className="w-full lg:w-[54%] xl:w-[52%] max-w-2xl 2xl:max-w-3xl flex flex-col justify-center pointer-events-auto relative py-8">
            {/* Typography Content Stage (Min-height to prevent vertical reflows) */}
            <div className="relative min-h-[300px] sm:min-h-[350px] lg:min-h-[380px] xl:min-h-[420px] flex items-center">
              {/* 1. HERO STATEMENT */}
              <div
                ref={securityHeroRef}
                className="absolute inset-0 flex flex-col justify-center text-left will-change-transform"
              >
                <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-[46px] xl:text-[54px] 2xl:text-[62px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[1.02] sm:leading-[0.98]">
                  We take your data <br />
                  <span className="text-[#22C55E]">as seriously as you</span> <br />
                  take your money.
                </h2>
                <p className="mt-5 sm:mt-7 text-sm sm:text-base lg:text-lg xl:text-xl text-[#5A685D] dark:text-[#9BA89F] font-normal leading-relaxed max-w-xl">
                  India&apos;s RBI-regulated Account Aggregator framework guarantees that your wealth intelligence runs on your terms, with zero compromise.
                </p>
              </div>

              {/* 2. THE 6 PRINCIPLES */}
              {PRINCIPLES.map((principle: { id: string; title: string; body: string }, idx: number) => (
                <div
                  key={principle.id}
                  ref={(el) => {
                    securityPrincipleRefs.current[idx] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center text-left opacity-0 pointer-events-none will-change-transform"
                >
                  <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[46px] xl:text-[54px] 2xl:text-[62px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[1.02] sm:leading-[0.98] mb-4 sm:mb-6">
                    {principle.title}
                  </h3>
                  <p className="font-sans text-base sm:text-lg lg:text-xl xl:text-2xl text-[#5A685D] dark:text-[#9BA89F] font-light leading-relaxed max-w-xl">
                    {principle.body}
                  </p>
                </div>
              ))}

              {/* 3. CLOSING STATEMENT */}
              <div
                ref={securityClosingRef}
                className="absolute inset-0 flex flex-col justify-center text-left opacity-0 pointer-events-none will-change-transform"
              >
                <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[46px] xl:text-[54px] 2xl:text-[62px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[1.02] sm:leading-[0.98]">
                  Security isn&apos;t a feature here. <br />
                  <span className="text-[#22C55E]">
                    It&apos;s the baseline everything else is built on.
                  </span>
                </h3>
                <p className="mt-5 sm:mt-7 text-sm sm:text-base lg:text-lg xl:text-xl text-[#5A685D] dark:text-[#9BA89F] font-normal leading-relaxed max-w-xl">
                  Built from the ground up for bank-grade protection, complete transparency, and personal privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CardSculpture disabled in favor of pure uninterrupted DOM card-to-ring animation */}
      {/* <CardSculpture
        ref={sculptureHandleRef}
        getDomCardRects={getDomCardRects}
      /> */}
    </section>
  );
}
