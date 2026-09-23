"use client";

import { forwardRef, useImperativeHandle, type MutableRefObject, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import type { SceneEngine } from "../hero-engine/useSceneEngine";
import { CINEMATIC_TIMESCALE, PRODUCT_CARDS } from "../BlueprintHero";

/**
 * Every DOM ref Hero's own transition logic/JSX touches. All of these `useRef`
 * instances are still declared (and owned) in `BlueprintHero.tsx`, NOT here —
 * see this file's header comment for why: `sceneCtx`/`resetToState`
 * (hero-engine/sceneTransitions.ts) also read/write these exact same ref
 * objects for instant state jumps (nav clicks, "Back to Top", scroll-drift
 * recovery), so they must stay the same shared instances rather than being
 * re-created locally here. HeroScene receives them as props purely to keep
 * this file's JSX/logic textually self-contained.
 */
export interface HeroSceneRefs {
  headerRef: MutableRefObject<HTMLDivElement | null>;
  headlineRef: MutableRefObject<HTMLHeadingElement | null>;
  subheadRef: MutableRefObject<HTMLParagraphElement | null>;
  ctaRef: MutableRefObject<HTMLAnchorElement | null>;
  floorLineRef: MutableRefObject<HTMLDivElement | null>;
  heroVisualRef: MutableRefObject<HTMLDivElement | null>;
  heroIntroRef: MutableRefObject<HTMLDivElement | null>;
  irisPortalRef: MutableRefObject<HTMLDivElement | null>;
  portalRimRef: MutableRefObject<HTMLDivElement | null>;
  portalRippleRef: MutableRefObject<HTMLDivElement | null>;
  productWorldRef: MutableRefObject<HTMLDivElement | null>;
  heroToProductTlRef: MutableRefObject<gsap.core.Timeline | null>;
  cardsStageRef: MutableRefObject<HTMLDivElement | null>;
  cardsClusterRef: MutableRefObject<HTMLDivElement | null>;
  cardWrapperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardFlipperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardFrontRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardBackRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardDefaultRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardHoverRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardIllustrationRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardGradientBgRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardGlassOverlayRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  bentoTileContentRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  onHeroToProductCompletedRef: MutableRefObject<(() => void) | null>;
  onProductToHeroCompletedRef: MutableRefObject<(() => void) | null>;
}

/**
 * The handful of BlueprintHero-owned helpers/values `createHeroToProductTimeline`
 * needs that live inside BlueprintHero.tsx's own one-time mount effect (not at
 * component-body scope), so they can't be read directly during HeroScene's
 * render. BlueprintHero.tsx creates one stable `useRef<HeroSceneShared>` and
 * populates its `.current` fields the moment it creates the real
 * implementations (same effect, same call order as before this split) — see
 * BlueprintHero.tsx around where `portalState`/`applyPortalClip`/
 * `dispatchActiveSection` are defined. `portalState` in particular must stay
 * the exact same mutable object `resetToState`'s hero/product branches
 * read/write, or an instant nav-triggered reset and a scroll-triggered
 * timeline would drift out of sync.
 */
export interface HeroSceneShared {
  dispatchActiveSection: (section: string) => void;
  portalState: { radius: number; x: number; y: number };
  applyPortalClip: (r: number, x: number, y: number) => void;
}

/**
 * `triggerProductToHero` is exposed imperatively because, per the engine's
 * registration ground truth (see registerScene call below), the reverse
 * (Product -> Hero) gesture fires while the CURRENT scene is
 * "product-resting", not "hero" — so it's "product-resting"'s registration
 * (still owned by BlueprintHero.tsx until Task 6's ProductBentoScene exists)
 * that must invoke it, not this file's own registerScene("hero", ...) call.
 */
export interface HeroSceneHandle {
  triggerProductToHero: () => void;
}

interface HeroSceneProps {
  engine: SceneEngine;
  refs: HeroSceneRefs;
  shared: MutableRefObject<HeroSceneShared>;
  /** Everything that renders inside `productWorldRef` before Hero's own header block (About's cinematic background layer + the Product cards amphitheater, which also nests Security's vault and About's envelope — still authored in BlueprintHero.tsx until Tasks 6-8). */
  productWorldBeforeHeader: ReactNode;
  /** Everything that renders inside `productWorldRef` after Hero's own floor-line (Security's narrative-state panels — still authored in BlueprintHero.tsx until Task 7). */
  productWorldAfterFloorLine: ReactNode;
}

export const HeroScene = forwardRef<HeroSceneHandle, HeroSceneProps>(function HeroScene(
  { engine, refs, shared, productWorldBeforeHeader, productWorldAfterFloorLine },
  forwardedRef
) {
  const {
    headerRef,
    headlineRef,
    ctaRef,
    floorLineRef,
    heroVisualRef,
    heroIntroRef,
    irisPortalRef,
    portalRimRef,
    portalRippleRef,
    productWorldRef,
    heroToProductTlRef,
    cardsStageRef,
    cardsClusterRef,
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
    onHeroToProductCompletedRef,
    onProductToHeroCompletedRef,
  } = refs;

  const {
    stateRef,
    transitionAnimatingRef,
    isHoldingProductRef,
    productCompleteRef,
    setIsAperturePaused,
    isAperturePaused,
  } = engine;

  // =======================================================================
  // HERO -> PRODUCT SINGLE-TRIGGER CINEMATIC TRANSITION
  // Sequence: Ring expands -> Cards emerge -> Cards flip one-by-one ->
  // Settle into current resting amphitheater positions ->
  // WAIT ~1 SECOND -> Cards gracefully glide & resize directly into Bento formation!
  // =======================================================================
  const createHeroToProductTimeline = () => {
    const { portalState, applyPortalClip, dispatchActiveSection } = shared.current;

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
        // Safety valve (Task 3 / final-review fix) — see AboutScene.tsx for the
        // full rationale; 10390ms = longest real transition + 500ms margin.
        engine.armBusySafetyValve(transitionAnimatingRef, 10390);
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
        PRODUCT_CARDS.forEach((_, i) => {
          const defEl = cardDefaultRefs.current[i];
          const illus = cardIllustrationRefs.current[i];
          const grad = cardGradientBgRefs.current[i];
          const glass = cardGlassOverlayRefs.current[i];
          const hoverEl = cardHoverRefs.current[i];
          const bentoContent = bentoTileContentRefs.current[i];
          const front = cardFrontRefs.current[i];
          if (front) {
            front.style.background = "";
          }
          if (defEl) {
            gsap.set(defEl, { display: "flex", autoAlpha: 1, opacity: 1, visibility: "visible", y: 0, scale: 1 });
          }
          if (illus) {
            gsap.set(illus, { display: "flex", autoAlpha: 1, opacity: 0.88, visibility: "visible", scale: 1, filter: "blur(0px)" });
          }
          if (grad) {
            gsap.set(grad, { display: "block", autoAlpha: 1, opacity: 1, visibility: "visible" });
          }
          if (glass) {
            gsap.set(glass, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
          }
          if (hoverEl) {
            gsap.set(hoverEl, { display: "flex", autoAlpha: 0, opacity: 0, visibility: "hidden", y: 8 });
          }
          if (bentoContent) {
            gsap.set(bentoContent, { autoAlpha: 0, opacity: 0, y: 14, visibility: "hidden" });
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
        PRODUCT_CARDS.forEach((_, i) => {
          const defEl = cardDefaultRefs.current[i];
          const illus = cardIllustrationRefs.current[i];
          const grad = cardGradientBgRefs.current[i];
          if (defEl) gsap.set(defEl, { display: "flex", autoAlpha: 1, opacity: 1, visibility: "visible" });
          if (illus) gsap.set(illus, { display: "flex", autoAlpha: 1, opacity: 0.88, visibility: "visible" });
          if (grad) gsap.set(grad, { display: "block", autoAlpha: 1, opacity: 1, visibility: "visible" });
        });
        gsap.set(
          [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
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
          [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
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

    // Ensure Product Header (headline, CTA) and floor line start hidden at t = 0
    tl.set(
      [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
      { autoAlpha: 0, opacity: 0, visibility: "hidden" },
      0.0
    );
    tl.set(headlineRef.current, { y: 20 }, 0.0);
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
        xPercent: -12.87,
        yPercent: 0.88,
        duration: 0.65,
        ease: "power2.inOut",
      },
      0.0
    );

    // - Event Horizon & Iris Mask Portal Window expands numeric pixel radius
    tl.to(
      [irisPortalRef.current, portalRimRef.current],
      {
        autoAlpha: 1,
        duration: 0.10,
        ease: "power1.out",
      },
      0.0
    );

    // - Concentric ripple pulse
    tl.to(
      portalRippleRef.current,
      {
        autoAlpha: 0.75,
        duration: 0.10,
        ease: "power1.out",
      },
      0.02
    );
    tl.to(
      portalRippleRef.current,
      {
        autoAlpha: 0,
        duration: 0.20,
        ease: "power2.out",
      },
      0.14
    );

    // - Numeric clip path radius expands across the entire viewport
    // Synchronized with heroVisualRef: exact same start (0.0), duration (0.65), and power2.inOut easing
    tl.to(
      portalState,
      {
        radius: maxRadiusPx,
        x: 50.0,
        y: 50.0,
        duration: 0.65,
        ease: "power2.inOut",
        onUpdate: () => {
          applyPortalClip(portalState.radius, portalState.x, portalState.y);
        },
      },
      0.0
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

    // 4. Hero headline and CTA enter during the card flip:
    // Shortly after the flip begins (0.70s), hero text starts entering so animations overlap naturally
    tl.set(
      [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
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

    tl.timeScale(CINEMATIC_TIMESCALE);
    return tl;
  };

  const triggerHeroToProduct = () => {
    if (transitionAnimatingRef.current || stateRef.current !== "hero") return;
    transitionAnimatingRef.current = true;
    engine.armBusySafetyValve(transitionAnimatingRef, 10390);
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
    if (
      transitionAnimatingRef.current ||
      (stateRef.current !== "product-resting" && stateRef.current !== "product")
    )
      return;
    transitionAnimatingRef.current = true;
    engine.armBusySafetyValve(transitionAnimatingRef, 10390);
    stateRef.current = "sculpting";
    isHoldingProductRef.current = false;
    productCompleteRef.current = false;

    if (!heroToProductTlRef.current) {
      heroToProductTlRef.current = createHeroToProductTimeline();
      heroToProductTlRef.current.progress(1);
    }
    heroToProductTlRef.current.reverse();
  };

  useImperativeHandle(forwardedRef, () => ({ triggerProductToHero }), []);

  // Per Task 4's registerScene ground truth: "hero" only ever needs a forward
  // `trigger` (you can't scroll backward INTO hero from any earlier state —
  // it's the very first state). The reverse (Product -> Hero) gesture fires
  // while the engine's CURRENT state is "product-resting", so it's that
  // state's own registration (still in BlueprintHero.tsx until Task 6) that
  // must call `triggerProductToHero` — exposed above via the imperative handle.
  useGSAP(() => {
    engine.registerScene("hero", {
      trigger: triggerHeroToProduct,
    });
  }, { scope: headerRef, dependencies: [] });

  return (
    <>
      {/* =================================================================== */}
      {/* LAYER 1 (z-10): MASTER HERO VISUAL (Aperture Video Ring)            */}
      {/* Centered optically at 62.87% X, 49.12% Y                            */}
      {/* =================================================================== */}
      <div
        ref={heroVisualRef}
        className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform"
        style={{
          transformOrigin: "62.87% 49.12%",
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
          className="relative w-full h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden select-none will-change-transform"
        >
          {productWorldBeforeHeader}

          {/* Product Hero Content (Headline, CTA) - Positioned underneath cards */}
          <div
            ref={headerRef}
            className="w-full max-w-5xl mx-auto flex flex-col items-center text-center z-30 shrink-0 mt-6 sm:mt-7 md:mt-8 lg:mt-9 xl:mt-10 mb-2 px-2 will-change-transform"
          >
            <h2
              ref={headlineRef}
              className="font-sans font-black text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] xl:text-[46px] tracking-[-0.03em] leading-tight sm:whitespace-nowrap text-neutral-950"
            >
              Don&apos;t just see your wealth.{" "}
              <span
                className="font-black text-[#22C55E]"
                style={{ color: "#22C55E" }}
              >
                Understand it.
              </span>
            </h2>

            <div className="mt-10 sm:mt-11 md:mt-12">
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

          {productWorldAfterFloorLine}
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
          left: "62.87%",
          top: "49.12%",
        }}
      />

      {/* LAYER 2C (z-24): OPTION 2 CONCENTRIC GRAVITATIONAL PULSE RIPPLE      */}
      <div
        ref={portalRippleRef}
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40 shadow-[0_0_60px_rgba(16,185,129,0.3)] z-24 opacity-0 will-change-[width,height,left,top,opacity]"
        style={{
          width: 0,
          height: 0,
          left: "62.87%",
          top: "49.12%",
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
        <div className="flex-1 flex flex-col justify-center max-w-lg sm:max-w-xl lg:max-w-[490px] xl:max-w-[530px] -translate-x-6 sm:-translate-x-10 md:-translate-x-14 lg:-translate-x-20 xl:-translate-x-24 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
          <h1 className="font-sans font-black text-[26px] sm:text-[33px] md:text-[38px] lg:text-[42px] xl:text-[47px] text-neutral-950 tracking-[-0.035em] leading-[1.15] select-none flex flex-col gap-2.5 sm:gap-3 lg:gap-3.5">
            <span className="whitespace-nowrap">
              See everything you <span className="text-[#22C55E]" style={{ color: "#22C55E" }}>own.</span>
            </span>
            <span className="whitespace-nowrap">
              Understand what it <span className="text-[#22C55E]" style={{ color: "#22C55E" }}>means.</span>
            </span>
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg lg:text-[19px] text-[#5A685D] font-medium tracking-tight leading-relaxed select-none">
            Track. Understand. Act with confidence.
          </p>
        </div>
      </div>
    </>
  );
});
