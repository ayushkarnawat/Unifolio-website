"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { LinkButton } from "@/components/ui/Button";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";
import { ArrowRight, Sparkles } from "lucide-react";

interface ProductCardData {
  id: string;
  num: string;
  tag: string;
  title: string;
  description: string;
  image: string;
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
    tag: "CONVERSATIONAL INTELLIGENCE",
    title: "Skip the dashboards. Just ask.",
    description:
      "The fastest way to understand your money isn't a chart, it's a question.",
    image: "/product-cards/card-1.jpg",
    accent: "#22c55e",
    restRotateY: 16,
    restRotateZ: -2.2,
    restY: 16,
    restZ: -35,
  },
  {
    id: "card-see",
    num: "02",
    tag: "MULTI-PAN AGGREGATION",
    title: "See everything",
    description:
      "Every asset and liability, across your family, in one accurate picture.",
    image: "/product-cards/card-2.jpg",
    accent: "#10b981",
    restRotateY: 8,
    restRotateZ: -1.1,
    restY: 4,
    restZ: -12,
  },
  {
    id: "card-understand",
    num: "03",
    tag: "DEEP PORTFOLIO DISSECTION",
    title: "Understand what you own",
    description:
      "Find overlaps, hidden fees, concentration risks, and understand performance in context.",
    image: "/product-cards/card-3.jpg",
    accent: "#34d399",
    restRotateY: 0,
    restRotateZ: 0,
    restY: 0,
    restZ: 0,
  },
  {
    id: "card-risk",
    num: "04",
    tag: "VULNERABILITY ENGINE",
    title: "Know your risk",
    description:
      "Understand your family's runway, safety cushion, sleeping money, and financial vulnerabilities.",
    image: "/product-cards/card-4.jpg",
    accent: "#059669",
    restRotateY: -8,
    restRotateZ: 1.1,
    restY: 4,
    restZ: -12,
  },
  {
    id: "card-plan",
    num: "05",
    tag: "SCENARIO MODELLING",
    title: "Plan ahead",
    description:
      "Stress test decisions, model scenarios, track goals, and understand your financial future.",
    image: "/product-cards/card-5.jpg",
    accent: "#10b981",
    restRotateY: -16,
    restRotateZ: 2.2,
    restY: 16,
    restZ: -35,
  },
];

export function HeroProductExperience() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Scene 1: Hero Elements
  const heroSceneRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);

  // Plain Black Full-Screen Expansion Surface (Reference Video Style)
  const blackSurfaceRef = useRef<HTMLDivElement | null>(null);

  // Scene 2: Product Elements
  const productHeaderRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  // Cards Splitting / Transformation Stage
  const cardsStageRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFlipperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Interactive 3D hover state when settled
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Master timeline ref for trigger-by-one-scroll
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  const currentSceneRef = useRef<"hero" | "product">("hero");
  const isAnimatingRef = useRef<boolean>(false);

  useGSAP(
    () => {
      if (!containerRef.current || !stageRef.current) return;

      const reduced = prefersReducedMotion();

      // Ensure Hero text is immediately visible and prominent
      gsap.set(heroIntroRef.current, { opacity: 1, y: 0 });
      gsap.set(heroVisualRef.current, { opacity: 1, scale: 1 });

      if (reduced) {
        gsap.set(blackSurfaceRef.current, { opacity: 0 });
        gsap.set(headlineRef.current, { opacity: 1, y: 0 });
        gsap.set(subheadRef.current, { opacity: 1, y: 0 });
        gsap.set(ctaRef.current, { opacity: 1, scale: 1 });
        gsap.set(cardsContainerRef.current, { opacity: 1, scale: 1 });
        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const flipper = cardFlipperRefs.current[i];
          if (wrapper) {
            gsap.set(wrapper, {
              x: 0,
              y: card.restY,
              z: card.restZ,
              rotateY: card.restRotateY,
              rotateZ: card.restRotateZ,
            });
          }
          if (flipper) gsap.set(flipper, { rotateY: 0 });
        });
        return;
      }

      // =======================================================================
      // MASTER CHOREOGRAPHED TIMELINE (HERO → PLAIN BLACK → SPLIT INTO 5 CARDS)
      // Triggered by ONE scroll gesture, runs automatically through all stages
      // =======================================================================
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          currentSceneRef.current = "product";
        },
        onReverseComplete: () => {
          isAnimatingRef.current = false;
          currentSceneRef.current = "hero";
        },
      });

      masterTlRef.current = tl;

      // 1. Initial State Setup
      gsap.set(blackSurfaceRef.current, { opacity: 0 });
      gsap.set(headlineRef.current, { opacity: 0, y: -45 });
      gsap.set(subheadRef.current, { opacity: 0, y: -25 });
      gsap.set(ctaRef.current, { opacity: 0, y: -15, scale: 0.88 });

      // Cards container initially represents the unified monolithic plane
      gsap.set(cardsContainerRef.current, {
        opacity: 0,
        scaleX: 1.35,
        scaleY: 1.8,
      });

      PRODUCT_CARDS.forEach((_, i) => {
        const wrapper = cardWrapperRefs.current[i];
        const flipper = cardFlipperRefs.current[i];
        const front = cardFrontRefs.current[i];
        const back = cardBackRefs.current[i];

        if (wrapper) {
          // Compressed tightly edge-to-edge with 0 gap
          const initialXOffset = (i - 2) * -18;
          gsap.set(wrapper, {
            x: initialXOffset,
            y: 0,
            z: 0,
            rotateY: 0,
            rotateZ: 0,
          });
        }

        // Clean plain black surface: 0px border radius, no borders
        if (front) {
          gsap.set(front, { borderRadius: "0px" });
        }
        if (back) {
          gsap.set(back, { borderRadius: "0px", borderColor: "transparent" });
        }

        if (flipper) {
          // Plain black backplates face forward
          gsap.set(flipper, { rotateY: 180 });
        }
      });

      // -----------------------------------------------------------------------
      // STAGE 1: EXPANSION → PLAIN BLACK FULL-SCREEN SURFACE (0.00s -> 0.45s)
      // -----------------------------------------------------------------------
      // Hero headline dissolves upward
      tl.to(
        heroIntroRef.current,
        {
          opacity: 0,
          y: -40,
          duration: 0.35,
          ease: "power2.inOut",
        },
        0.0
      );

      // Hero aperture visual expands & fades into the plain black screen
      tl.to(
        heroVisualRef.current,
        {
          scale: 1.1,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        },
        0.05
      );

      // Plain black full-screen surface expands across viewport
      tl.to(
        blackSurfaceRef.current,
        {
          opacity: 1,
          duration: 0.35,
          ease: "power1.inOut",
        },
        0.1
      );

      // -----------------------------------------------------------------------
      // STAGE 2: FULL-SCREEN BLACK SURFACE DIVIDES/SPLITS INTO CARDS (0.45s -> 0.95s)
      // Exactly like reference: surface separates into 5 distinct cards
      // -----------------------------------------------------------------------
      // Reveal the seamless black card layers
      tl.set(
        cardsContainerRef.current,
        {
          opacity: 1,
        },
        0.42
      );

      // Fade out solid surface overlay as cards physically separate
      tl.to(
        blackSurfaceRef.current,
        {
          opacity: 0,
          duration: 0.25,
          ease: "power1.out",
        },
        0.45
      );

      // Container scales down from full-screen to card amphitheater bounds
      tl.to(
        cardsContainerRef.current,
        {
          scaleX: 1,
          scaleY: 1,
          duration: 0.48,
          ease: "power3.inOut",
        },
        0.45
      );

      // Cards physically divide: gaps open up and corners round from 0 to 24px
      PRODUCT_CARDS.forEach((card, i) => {
        const wrapper = cardWrapperRefs.current[i];
        const front = cardFrontRefs.current[i];
        const back = cardBackRefs.current[i];

        if (wrapper) {
          tl.to(
            wrapper,
            {
              x: 0,
              duration: 0.45,
              ease: "power3.out",
            },
            0.48
          );
        }

        if (front) {
          tl.to(
            front,
            {
              borderRadius: "24px",
              duration: 0.4,
              ease: "power2.out",
            },
            0.5
          );
        }

        if (back) {
          tl.to(
            back,
            {
              borderRadius: "24px",
              borderColor: "rgba(255,255,255,0.12)",
              duration: 0.4,
              ease: "power2.out",
            },
            0.5
          );
        }
      });

      // -----------------------------------------------------------------------
      // STAGE 3: 3D PERSPECTIVE ARC FAN-OUT & FLIP ANIMATIONS (0.85s -> 1.55s)
      // -----------------------------------------------------------------------
      // Cards tilt into 3D amphitheater perspective
      PRODUCT_CARDS.forEach((card, i) => {
        const wrapper = cardWrapperRefs.current[i];
        if (!wrapper) return;

        tl.to(
          wrapper,
          {
            y: card.restY,
            z: card.restZ,
            rotateY: card.restRotateY,
            rotateZ: card.restRotateZ,
            duration: 0.55,
            ease: "power3.out",
          },
          0.82 + i * 0.03
        );
      });

      // Cascading 180° flips revealing front artwork and typography
      PRODUCT_CARDS.forEach((_, i) => {
        const flipper = cardFlipperRefs.current[i];
        if (!flipper) return;

        const flipStartTime = 0.95 + i * 0.1;
        tl.to(
          flipper,
          {
            rotateY: 0,
            duration: 0.42,
            ease: "power2.inOut",
          },
          flipStartTime
        );
      });

      // -----------------------------------------------------------------------
      // STAGE 4: PRODUCT HERO TEXT & CTA ENTRANCE (1.25s -> 1.85s)
      // -----------------------------------------------------------------------
      tl.to(
        headlineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        1.25
      );

      tl.to(
        subheadRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        1.35
      );

      tl.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.4)",
        },
        1.45
      );

      // Brief hold to complete settle
      tl.to({}, { duration: 0.2 }, 1.85);

      // =======================================================================
      // SCROLL TRIGGER: PIN STAGE & TRIGGER AUTOMATICALLY ON ONE SCROLL GESTURE
      // =======================================================================
      const triggerForward = () => {
        if (currentSceneRef.current === "hero" && !isAnimatingRef.current) {
          isAnimatingRef.current = true;
          currentSceneRef.current = "product";
          tl.play();
        }
      };

      const triggerReverse = () => {
        if (currentSceneRef.current === "product" && !isAnimatingRef.current) {
          isAnimatingRef.current = true;
          currentSceneRef.current = "hero";
          tl.reverse();
        }
      };

      // Normalize deltaY across input devices: trackpads report pixel deltas
      // (deltaMode 0) while a physical mouse wheel commonly reports line deltas
      // (deltaMode 1, e.g. deltaY of just 1-3), which would never clear a
      // pixel-tuned threshold. Converting line/page units to an equivalent
      // pixel value keeps the existing trackpad-tuned threshold intact while
      // letting a single, even slow, mouse-wheel notch trigger reliably.
      const PIXELS_PER_LINE = 16;
      const normalizeWheelDelta = (e: WheelEvent) => {
        if (e.deltaMode === 1) return e.deltaY * PIXELS_PER_LINE; // DOM_DELTA_LINE
        if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // DOM_DELTA_PAGE
        return e.deltaY; // DOM_DELTA_PIXEL
      };

      // Native Wheel listener: ONE scroll gesture triggers the full choreographed timeline!
      const handleWheel = (e: WheelEvent) => {
        const scrollY = window.scrollY;
        const containerTop = containerRef.current?.offsetTop || 0;
        const delta = normalizeWheelDelta(e);

        // When user is near the hero (top of page) and scrolls down
        if (scrollY <= containerTop + 50 && delta > 15) {
          if (currentSceneRef.current === "hero") {
            triggerForward();
          }
        }
        // When user is at the product section and scrolls back up
        else if (scrollY <= containerTop + window.innerHeight + 50 && delta < -15) {
          if (currentSceneRef.current === "product") {
            triggerReverse();
          }
        }
      };

      // Touch gesture support for mobile/tablet
      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };
      const handleTouchMove = (e: TouchEvent) => {
        const touchDeltaY = touchStartY - e.touches[0].clientY;
        const scrollY = window.scrollY;
        const containerTop = containerRef.current?.offsetTop || 0;

        if (scrollY <= containerTop + 50 && touchDeltaY > 30) {
          if (currentSceneRef.current === "hero") {
            triggerForward();
          }
        } else if (scrollY <= containerTop + window.innerHeight + 50 && touchDeltaY < -30) {
          if (currentSceneRef.current === "product") {
            triggerReverse();
          }
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });

      // ScrollTrigger to pin stage during the interactive experience
      const st = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=120%",
          pin: stageRef.current,
          onEnter: () => {
            triggerForward();
          },
          onLeaveBack: () => {
            triggerReverse();
          },
        },
      });

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        st.kill();
        tl.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] dark:bg-[#000000] text-neutral-900 dark:text-white transition-colors duration-500 overflow-hidden"
      style={{ height: "220vh" }}
    >
      {/* Navigation Anchors for Smooth In-Page Linking */}
      <div id="hero" className="absolute top-0 left-0 w-px h-px pointer-events-none" />
      <div id="product" className="absolute top-[45%] left-0 w-px h-px pointer-events-none" />

      {/* Single Unified Pinned Stage: Contains Scene 1 (Hero) & Scene 2 (Product) */}
      <div
        ref={stageRef}
        className="relative h-screen w-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden select-none"
      >
        {/* ================================================================= */}
        {/* SCENE 1: HERO LANDING VIEW (Aperture Visual + Master Headline) */}
        {/* ================================================================= */}
        <div
          ref={heroSceneRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-hidden"
        >
          {/* Main Hero Headline: Permanently visible on load with high contrast */}
          <div
            ref={heroIntroRef}
            className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-20 pb-8 max-w-7xl mx-auto w-full z-40 will-change-transform"
          >
            <div className="flex-1 flex flex-col justify-center max-w-lg -translate-x-6 sm:-translate-x-10 lg:-translate-x-14 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
              <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] text-neutral-950 dark:text-white tracking-[-0.03em] uppercase leading-[0.92] transition-colors duration-500">
                SEE WHAT <br />
                YOU ACTUALLY <br />
                OWN.
              </h1>
            </div>
          </div>

          {/* Cinematic Hero Aperture Visual */}
          <div
            ref={heroVisualRef}
            className="absolute inset-0 w-full h-full flex items-center justify-center z-20 will-change-transform"
          >
            <HeroApertureVisual />
          </div>
        </div>

        {/* ================================================================= */}
        {/* PLAIN BLACK FULL-SCREEN EXPANSION SURFACE (Reference Video Visual) */}
        {/* ================================================================= */}
        <div
          ref={blackSurfaceRef}
          className="absolute inset-0 w-full h-full bg-[#000000] z-25 pointer-events-none opacity-0 will-change-opacity"
        />

        {/* Ambient Glow for Product Scene */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07] rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* ================================================================= */}
        {/* SCENE 2: TOP PRODUCT HEADER (Headline, Supporting Text, CTA) */}
        {/* ================================================================= */}
        <div
          ref={productHeaderRef}
          className="w-full max-w-4xl mx-auto flex flex-col items-center text-center z-30 shrink-0"
        >
          {/* Main Product Headline */}
          <h2
            ref={headlineRef}
            className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] tracking-[-0.03em] leading-[1.08] text-neutral-950 dark:text-white transition-colors duration-500 will-change-transform"
          >
            Understand your wealth.{" "}
            <span
              className="font-medium text-[#22C55E]"
              style={{ color: "#22C55E" }}
            >
              Not just see it.
            </span>
          </h2>

          {/* Supporting Subhead */}
          <p
            ref={subheadRef}
            className="mt-3 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed transition-colors duration-500 will-change-transform"
          >
            Every account, every fund, every rupee, in one place, finally clear.
          </p>

          {/* CTA Pill Button matching other buttons & CTAs */}
          <div className="mt-4 sm:mt-5">
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
        {/* SCENE 2: 3D CARDS COMPRESSION & AMPHITHEATER PERSPECTIVE STAGE */}
        {/* Full-Screen Plain Black Sheet → Splits into 5 Distinct Cards → 180° Flips */}
        {/* ================================================================= */}
        <div
          ref={cardsStageRef}
          className="w-full flex-1 flex items-center justify-center my-auto relative z-25"
          style={{ perspective: "1500px" }}
        >
          {/* Transforming Cluster Wrapper */}
          <div
            ref={cardsContainerRef}
            className="flex items-center justify-center gap-3 md:gap-4 lg:gap-3 xl:gap-5 w-full max-w-[1400px] mx-auto overflow-x-auto lg:overflow-visible py-4 px-2 no-scrollbar will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {PRODUCT_CARDS.map((card, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={card.id}
                  ref={(el) => {
                    cardWrapperRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative shrink-0 w-[200px] sm:w-[220px] md:w-[230px] lg:w-[210px] xl:w-[235px] 2xl:w-[250px] h-[340px] sm:h-[370px] md:h-[390px] lg:h-[370px] xl:h-[400px] 2xl:h-[430px] cursor-pointer will-change-transform transition-all duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isHovered
                      ? `translateY(${card.restY - 12}px) translateZ(${card.restZ + 45}px) scale(1.04) rotateY(${card.restRotateY}deg) rotateZ(${card.restRotateZ}deg)`
                      : undefined,
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
                    {/* CARD FRONT FACE (revealed after flip) */}
                    {/* ======================================================= */}
                    <div
                      ref={(el) => {
                        cardFrontRefs.current[idx] = el;
                      }}
                      className="absolute inset-0 w-full h-full rounded-[24px] overflow-hidden bg-neutral-950 border border-neutral-300/40 dark:border-white/15 shadow-2xl transition-all duration-500 will-change-transform"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        boxShadow: isHovered
                          ? "0 30px 60px -15px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.4)"
                          : "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 10px 20px -5px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {/* Background Visual Asset */}
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 768px) 220px, 260px"
                        className="object-cover object-center transition-transform duration-700 ease-out"
                        style={{
                          transform: isHovered ? "scale(1.06)" : "scale(1)",
                        }}
                      />

                      {/* Glass Sheen Top Layer */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/90 pointer-events-none" />

                      {/* Deep Bottom Vignette for crystal clear typography */}
                      <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none" />

                      {/* Top Index Badge */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-emerald-400 font-semibold">
                          {card.num}
                        </span>
                        <div
                          className="w-2 h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: card.accent,
                            boxShadow: `0 0 8px ${card.accent}`,
                          }}
                        />
                      </div>

                      {/* Bottom-Anchored Typography */}
                      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-5 xl:p-6 z-10 flex flex-col justify-end">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400/90 font-semibold mb-1">
                          {card.tag}
                        </span>
                        <h3 className="font-sans font-bold text-base sm:text-lg xl:text-xl text-white leading-snug tracking-tight">
                          {card.title}
                        </h3>
                        <p className="mt-1.5 text-xs xl:text-[13px] text-neutral-300 font-normal leading-relaxed line-clamp-3">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* ======================================================= */}
                    {/* CARD BACK FACE (PLAIN BLACK - NO GRIDS OR TEXTURES) */}
                    {/* Clean, minimalist solid black matching reference video */}
                    {/* ======================================================= */}
                    <div
                      ref={(el) => {
                        cardBackRefs.current[idx] = el;
                      }}
                      className="absolute inset-0 w-full h-full rounded-[24px] overflow-hidden bg-[#000000] border border-white/12 shadow-2xl p-6 flex flex-col justify-between will-change-transform"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      {/* Top Header of Plain Black Card Back */}
                      <div className="flex items-center justify-between z-10">
                        <span className="font-mono text-xs text-neutral-500 tracking-widest">
                          UNIFOLIO // {card.num}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                      </div>

                      {/* Center Luxury Monogram */}
                      <div className="flex flex-col items-center justify-center my-auto z-10">
                        <div className="relative w-14 h-14 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950">
                          <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                          </div>
                        </div>
                        <span className="mt-3.5 font-mono text-[9px] tracking-[0.25em] text-neutral-600 uppercase">
                          INTELLIGENCE
                        </span>
                      </div>

                      {/* Bottom Minimal Wordmark */}
                      <div className="flex items-center justify-between border-t border-neutral-900 pt-3 z-10">
                        <span className="font-sans font-bold text-[11px] tracking-wider text-neutral-400 uppercase">
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
        <div className="w-full max-w-3xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent shrink-0 opacity-60 z-20" />
      </div>
    </section>
  );
}
