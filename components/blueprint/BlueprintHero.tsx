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
  const productToRingTlRef = useRef<gsap.core.Timeline | null>(null);
  const ringRotateTweenRef = useRef<gsap.core.Tween | null>(null);

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

            // Seamlessly continue the slow rotation indefinitely at constant speed
            if (ringRotateTweenRef.current) ringRotateTweenRef.current.kill();
            ringRotateTweenRef.current = gsap.to(clusterEl, {
              rotateZ: "+=360",
              duration: 26,
              repeat: -1,
              ease: "none",
              force3D: true,
            });

            // Drain residual scroll momentum from trackpad/mousewheel before unlocking
            if (momentumDrainTimeoutRef.current) clearTimeout(momentumDrainTimeoutRef.current);
            momentumDrainTimeoutRef.current = setTimeout(() => {
              momentumDrainTimeoutRef.current = null;
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
            }, 100);
          },
          onReverseComplete: () => {
            stateRef.current = "product";
            transitionAnimatingRef.current = false;
            transitionStartedRef.current = false;
            transitionCompleteRef.current = false;
            productCompleteRef.current = true;
            isHoldingProductRef.current = true;
            if (ringRotateTweenRef.current) {
              ringRotateTweenRef.current.kill();
              ringRotateTweenRef.current = null;
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
            if (lockScrollYRef.current > 0) {
              window.scrollTo(0, lockScrollYRef.current);
            }
            PRODUCT_CARDS.forEach((card, i) => {
              const wrapper = cardWrapperRefs.current[i];
              if (wrapper) {
                gsap.set(wrapper, { zIndex: 10 + (2 - Math.abs(i - 2)) });
              }
            });
            companionCardRefs.current.forEach((compEl) => {
              if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
            });
          },
        });

        // -------------------------------------------------------------------------
        // PHASE 0: Product header text & CTA smoothly fade away (0.0s -> 0.22s)
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

        // Subtly dim product card sketches and text watermark during ring mode
        cardIllustrationRefs.current.forEach((el) => {
          if (el) {
            tl.to(el, { opacity: 0.15, duration: 0.25, ease: "power2.inOut" }, 0.0);
          }
        });
        cardDefaultRefs.current.forEach((el) => {
          if (el) {
            tl.to(el, { opacity: 0.22, duration: 0.25, ease: "power2.inOut" }, 0.0);
          }
        });

        // -------------------------------------------------------------------------
        // PHASE 1: STACK LEFT TO RIGHT INTO CARD 05 (0.0s -> 0.45s)
        // -------------------------------------------------------------------------
        const STACK_ROTX = 38;
        const STACK_ROTY = -22;
        const STACK_ROTZ = -24;

        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const stackStart = i * 0.04;
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
              duration: 0.32,
              ease: "power2.inOut",
            },
            stackStart
          );
        });

        // Center cluster container with subtle 3D perspective tilt
        const unfurlBase = 0.46;
        tl.to(
          clusterEl,
          {
            x: targetRingX,
            y: targetRingY,
            rotateX: 18,
            rotateY: 20,
            rotateZ: 16,
            duration: 1.10,
            ease: "power2.out",
          },
          unfurlBase
        );

        // -------------------------------------------------------------------------
        // PHASE 2 & 3: UNFURL INTO THE RING ALONG THE CURVED TRAJECTORY
        // -------------------------------------------------------------------------
        // 2A. The 5 Original Product Cards lead the unfurling into slots 0 to 4 (Left Arc)
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const slot = ringSlots[i];
          const startTime = unfurlBase + i * 0.038;
          const origX = origCenters[i].x;
          const origY = origCenters[i].y;

          const midX = (stackTargetX + slot.x) * 0.48;
          const midY = Math.max(stackTargetY, slot.y) + 65;
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

        // 2B. 21 Companion Cards propagate sequentially from within the moving stack
        companionCardRefs.current.forEach((compEl, cIdx) => {
          if (!compEl) return;

          const slotIdx = 5 + cIdx;
          const slot = ringSlots[slotIdx];
          const startTime = unfurlBase + 5 * 0.038 + cIdx * 0.032;

          const midX = (stackTargetX + slot.x) * 0.48;
          const midY = Math.max(stackTargetY, slot.y) + 65;
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
        // PHASE 4: SIMULTANEOUS RING ROTATION + SMOOTH TRANSLATION TO THE LEFT
        // Begins seamlessly right as cards complete formation with zero dead pause
        // -------------------------------------------------------------------------
        const ringFormedTime = unfurlBase + 5 * 0.038 + (COMPANION_COUNT - 1) * 0.032 + 0.16; // ~1.45s (seamless handoff)
        const glideDuration = 1.25; // Responsive, smooth, and cinematic
        const glideRotDeg = 24; // Noticeable, natural rotation during the translation

        // 1. Smoothly translate the entire ring towards the left side of the viewport
        tl.to(
          clusterEl,
          {
            x: targetLeftX,
            duration: glideDuration,
            ease: "power2.out",
            force3D: true,
          },
          ringFormedTime
        );

        // 2. Simultaneously begin rotation in the plane of the ring as one unified object
        tl.to(
          clusterEl,
          {
            rotateZ: 16 + glideRotDeg,
            duration: glideDuration,
            ease: "power1.out",
            force3D: true,
          },
          ringFormedTime
        );

        return tl;
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
        if (!transitionCompleteRef.current) return;
        stateRef.current = "sculpting";
        transitionAnimatingRef.current = true;
        transitionCompleteRef.current = false;
        transitionStartedRef.current = false;
        isHoldingProductRef.current = false;

        // Stop continuous rotation before reversing timeline back to product
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }

        // Notify Navbar IMMEDIATELY that we are returning to Product
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

        productToRingTlRef.current?.reverse();
      };

      const handleWheel = (e: WheelEvent) => {
        // 1. Block all wheel inputs while transition is animating or during post-animation momentum drain
        if (transitionAnimatingRef.current || momentumDrainTimeoutRef.current !== null) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        // 2. Reversal from ring formation back to Product section
        if (transitionCompleteRef.current && e.deltaY < -8) {
          e.preventDefault();
          e.stopImmediatePropagation();
          triggerRingToProduct();
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
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (transitionAnimatingRef.current || momentumDrainTimeoutRef.current !== null) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        const touchDeltaY = touchStartY - e.touches[0].clientY;

        if (transitionCompleteRef.current && touchDeltaY < -15) {
          e.preventDefault();
          e.stopImmediatePropagation();
          triggerRingToProduct();
          return;
        }

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
        if (transitionAnimatingRef.current || momentumDrainTimeoutRef.current !== null) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (transitionCompleteRef.current && ["ArrowUp", "PageUp"].includes(e.key)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          triggerRingToProduct();
          return;
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
        if (transitionAnimatingRef.current || momentumDrainTimeoutRef.current !== null) {
          if (lockScrollYRef.current > 0 && Math.abs(window.scrollY - lockScrollYRef.current) > 1) {
            window.scrollTo(0, lockScrollYRef.current);
          }
        }
      };

      window.addEventListener("scroll", handleScrollLock, { passive: false, capture: true });
      window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
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
          if (front) gsap.set(front, { borderRadius: "20px" });
          if (flipper) gsap.set(flipper, { rotateY: 0 });
          const illus = cardIllustrationRefs.current[i];
          if (illus) gsap.set(illus, { opacity: 0.88, scale: 1, filter: "blur(0px)" });
          const defEl = cardDefaultRefs.current[i];
          if (defEl) gsap.set(defEl, { opacity: 1, autoAlpha: 1 });
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
        window.removeEventListener("keydown", handleKeyDown, { capture: true });
        window.removeEventListener("unifolio-logo-docked", revealHeroAfterDocked);
        window.removeEventListener("unifolio-intro-complete", revealHeroAfterDocked);
        window.removeEventListener("unifolio-show-product", handleShowProduct);
        window.removeEventListener("unifolio-reset-hero", handleResetHero);
        if (ringRotateTweenRef.current) {
          ringRotateTweenRef.current.kill();
          ringRotateTweenRef.current = null;
        }
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
            className="relative w-full h-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22 md:pt-24 lg:pt-26 pb-3 sm:pb-4 overflow-hidden select-none will-change-transform"
          >
            {/* Emerald Ambient Glow for Product Stage */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/[0.12] dark:bg-emerald-500/[0.18] rounded-full blur-[140px] pointer-events-none -z-10" />

            {/* Core Intense Emerald Portal Light (vibrant inside ring void at rest) */}
            <div className="absolute top-[49%] left-[57%] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-emerald-400/[0.30] dark:bg-emerald-400/[0.45] rounded-full blur-[50px] pointer-events-none -z-10" />

            {/* Top Product Header (Headline, Subhead, CTA) */}
            <div
              ref={headerRef}
              className="w-full max-w-3xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mt-1 sm:mt-2"
            >
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

              <p
                ref={subheadRef}
                className="mt-2 sm:mt-2.5 max-w-lg text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-snug sm:leading-relaxed transition-colors duration-500 will-change-transform"
              >
                Every account, every fund, every rupee, in one place, finally clear.
              </p>

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

            {/* 3D Perspective Cards Amphitheater Stage */}
            <div
              ref={cardsStageRef}
              className="w-full flex-1 flex items-center justify-center my-auto relative z-25 py-2"
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
                          {/* Flowing Emerald Panoramic Gradient */}
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
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90 pointer-events-none" />
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
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
                            className="absolute inset-0 z-15 flex flex-col items-center justify-start pt-7 sm:pt-8 px-4 text-center pointer-events-none select-none will-change-transform"
                          >
                            <span className="font-mono text-[10px] sm:text-xs font-black text-[#22c55e] tracking-widest uppercase mb-2">
                              {card.num}
                            </span>
                            <h3 className="font-sans font-black text-sm sm:text-base md:text-lg lg:text-xl xl:text-[22px] text-white leading-[1.18] tracking-tight max-w-[195px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                              {card.title}
                            </h3>
                          </div>

                          {/* Expanded Hover Reading Content */}
                          <div
                            ref={(el) => {
                              cardHoverRefs.current[idx] = el;
                            }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 sm:p-6 sm:px-7 text-center pointer-events-none will-change-transform"
                            style={{
                              opacity: 0,
                              transform: "translateY(8px)",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center w-full space-y-2.5 sm:space-y-3">
                              <span className="font-mono text-[10px] sm:text-xs font-black text-[#22c55e] tracking-widest uppercase">
                                {card.num}
                              </span>
                              <h3 className="font-sans font-extrabold text-base sm:text-lg md:text-xl lg:text-[22px] xl:text-[24px] text-white leading-[1.14] tracking-[-0.035em] text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                {card.title}
                              </h3>

                              {card.hoverType === "paragraph" ? (
                                <p className="text-xs sm:text-[13px] md:text-sm text-neutral-100 font-semibold leading-[1.46] text-center max-w-[280px]">
                                  {card.hoverParagraph}
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 no-scrollbar pointer-events-auto text-center w-full">
                                  {card.hoverBullets?.map((bullet, bIdx) => (
                                    <div key={bIdx} className="text-[11px] sm:text-xs text-neutral-100 font-semibold leading-[1.38]">
                                      <span className="font-extrabold text-[#34d399] mr-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
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
                  const baseOpacity = 0.52 + 0.10 * Math.sin(angleNorm);
                  const specularTop = 0.75 + 0.20 * Math.cos(angleNorm);
                  const emeraldRefract = 0.28 + 0.12 * Math.sin(angleNorm + Math.PI / 3);

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
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[20px]"
                        style={{
                          background:
                            `radial-gradient(ellipse 80% 65% at 24% 20%, rgba(34, 197, 94, ${(emeraldRefract * 0.9).toFixed(2)}) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 72%), ` +
                            `radial-gradient(ellipse 75% 55% at 78% 82%, rgba(34, 197, 94, ${(emeraldRefract * 1.1).toFixed(2)}) 0%, rgba(74, 222, 128, 0.14) 42%, transparent 70%)`,
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[20px]"
                        style={{
                          background:
                            "linear-gradient(120deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 22%, transparent 48%, rgba(34, 197, 94, 0.12) 80%, rgba(74, 222, 128, 0.25) 100%)",
                        }}
                      />
                      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-emerald-300/60 pointer-events-none rounded-t-[20px]" />
                      <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/75 via-white/20 to-transparent pointer-events-none rounded-l-[20px]" />
                      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-emerald-500/25 via-[#22C55E] to-emerald-300/80 pointer-events-none rounded-b-[20px]" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ambient Floor Reflection Line */}
            <div className="w-full max-w-2xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent shrink-0 opacity-50 z-20" />
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
