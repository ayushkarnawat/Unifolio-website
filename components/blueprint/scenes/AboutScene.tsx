"use client";

import {
  forwardRef,
  useImperativeHandle,
  type MutableRefObject,
} from "react";
import { gsap, ScrollTrigger, smoothScrollTo } from "@/lib/gsap";
import { getComposedViewport } from "@/lib/viewport";
import type { SceneEngine } from "../hero-engine/useSceneEngine";
import { CINEMATIC_TIMESCALE } from "../BlueprintHero";

/**
 * Task 8 — the fourth and last scene extraction in the BlueprintHero
 * file-split plan.
 *
 * Same architecture as Task 7's SecurityVaultScene, for the same reasons:
 *
 * 1. NO `useRef()` instances move here. Every DOM/value/timeline ref this
 *    scene's logic touches is still declared (and owned) in BlueprintHero.tsx
 *    — `sceneCtx`/`resetToState` (hero-engine/sceneTransitions.ts) reads and
 *    writes these exact same ref objects (`aboutContentRef`,
 *    `unifiedEnvelopeRef`, `envelopeTopFlapRef`, `philosophyDocRef`,
 *    `docFlipperRef`, `aboutOrbitTweenRef`, ...) for instant state jumps, so
 *    this file receives them all as one flat `refs` prop bag instead of
 *    creating its own copies.
 *
 * 2. Both pieces of About's DOM were ALREADY being rendered through slot
 *    props before this task started: the "About cinematic background" layer
 *    (`aboutContentRef`) is Task 5's `productWorldBeforeHeader` slot content
 *    on HeroScene, and the unified envelope/document UI (`unifiedEnvelopeRef`
 *    and its children) is Task 6's `aboutEnvelopeSlot` content on
 *    ProductBentoScene. Neither is a free top-level sibling anywhere in the
 *    tree, so — same reasoning as Task 7 — this file exports two plain
 *    presentational components, `AboutBackgroundSlot` and
 *    `AboutEnvelopeSlot`, that BlueprintHero.tsx mounts DIRECTLY as those
 *    slot values. `AboutScene` itself (the forwardRef component below) owns
 *    none of that DOM — it renders `null` — and exists purely to hold the
 *    scroll/reset logic and expose it imperatively (`flipDocToPage`,
 *    `exitAboutToFaq`, `jumpToAboutState`, `computeEnvelopeParams`) to
 *    BlueprintHero.tsx's `dispatchSceneAction` and to Security's own
 *    ring<->about handoff.
 *
 * 3. Bidirectional bridging with SecurityVaultScene (already set up by
 *    Task 7, this task just moves the About side of it to point through
 *    `aboutSceneRef` instead of local closures): Security's
 *    `consolidateRingToStack`/`exitSecurityToAbout` call
 *    `shared.current.computeEnvelopeParams()`/`shared.current.jumpToAboutState()`
 *    — BlueprintHero.tsx populates `securitySharedRef.current` with functions
 *    that call through `aboutSceneRef.current`. Conversely, this scene's own
 *    `jumpToAboutState` needs to call Security's `consolidateRingToStack`
 *    when it fires from the "ring" state — bridged the same way, via this
 *    file's own `shared` prop (`AboutSceneShared`), which BlueprintHero.tsx
 *    populates with a function that calls through `securitySceneRef.current`.
 *
 * Note: the brief's own text additionally mentioned "typo*" refs
 * (`typoEyesRef`, `typoEyesTlRef`, etc.) as something to check — those turned
 * out to belong to Security's own "read-only-eyes" sub-state flourish, and
 * Task 7 already moved them into SecurityVaultScene.tsx. They are NOT part
 * of this file; this is a plan-writing-time miscategorization in the
 * original brief, not something this task needed to act on.
 */

/**
 * Every DOM/value/timeline ref this scene's own logic touches, still
 * declared (and owned) in BlueprintHero.tsx — see header comment above.
 */
export interface AboutSceneRefs {
  // --- About's own DOM/tween refs ------------------------------------------
  aboutContentRef: MutableRefObject<HTMLDivElement | null>;
  unifiedEnvelopeRef: MutableRefObject<HTMLDivElement | null>;
  envelopeTopFlapRef: MutableRefObject<HTMLDivElement | null>;
  envelopeSealRef: MutableRefObject<HTMLDivElement | null>;
  docCavityWrapperRef: MutableRefObject<HTMLDivElement | null>;
  philosophyDocRef: MutableRefObject<HTMLDivElement | null>;
  docPaperSheetRef: MutableRefObject<HTMLDivElement | null>;
  docInkCopyRef: MutableRefObject<HTMLDivElement | null>;
  docFlipperRef: MutableRefObject<HTMLDivElement | null>;
  aboutOrbitTweenRef: MutableRefObject<gsap.core.Tween | null>;
  // --- cross-scene DOM this scene's reset/jump logic also touches ----------
  stageRef: MutableRefObject<HTMLDivElement | null>;
  irisPortalRef: MutableRefObject<HTMLDivElement | null>;
  headerRef: MutableRefObject<HTMLDivElement | null>;
  productWorldRef: MutableRefObject<HTMLDivElement | null>;
  cardsStageRef: MutableRefObject<HTMLDivElement | null>;
  cardsClusterRef: MutableRefObject<HTMLDivElement | null>;
  cardWrapperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  companionCardRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  securityStageRef: MutableRefObject<HTMLDivElement | null>;
  securityStateRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  safeContainerRef: MutableRefObject<HTMLDivElement | null>;
  safeVault3DRef: MutableRefObject<{ pauseAmbient?: (reset?: boolean) => void } | null>;
}

export interface AboutSceneShared {
  dispatchActiveSection: (section: string) => void;
  consolidateRingToStack: () => void;
}

/**
 * Exposed imperatively because `dispatchSceneAction`'s "about"-scene cases
 * (still owned by BlueprintHero.tsx, same as Tasks 6/7's pattern) and
 * Security's ring<->about handoff (still calling through `shared`) must
 * invoke these.
 */
export interface AboutSceneHandle {
  computeEnvelopeParams: () => {
    isDesk: boolean;
    isTab: boolean;
    envScale: number;
    scatterSlots: {
      x: number; y: number; z: number; rotZ: number; rotX: number; rotY: number; scale: number;
    }[];
  };
  flipDocToPage: (targetPage: 1 | 2) => void;
  exitAboutToFaq: () => void;
  jumpToAboutState: (targetPage?: 1 | 2) => void;
}

interface AboutSceneProps {
  engine: SceneEngine;
  refs: AboutSceneRefs;
  shared: MutableRefObject<AboutSceneShared>;
}

export const AboutScene = forwardRef<AboutSceneHandle, AboutSceneProps>(
  function AboutScene({ engine, refs, shared }, forwardedRef) {
    const {
      stateRef,
      isSecurityTransitioningRef,
      isNavigatingRef,
      lastSecurityScrollTimeRef,
      lockScrollYRef,
      aboutDocPageRef,
      isFlippingDocRef,
      isRingConsolidatedRef,
      setIsAperturePaused,
      productCompleteRef,
    } = engine;

    const {
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
      productWorldRef,
      cardsStageRef,
      cardsClusterRef,
      cardWrapperRefs,
      companionCardRefs,
      securityStageRef,
      securityStateRefs,
      safeContainerRef,
      safeVault3DRef,
    } = refs;

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
      flipTl.timeScale(CINEMATIC_TIMESCALE);

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
      // Safety valve (Task 3 / final-review fix): guarantees this busy-flag can
      // never stay stuck true forever if a killed timeline never fires the
      // completion callback that would normally clear it. 10390ms = the
      // longest real transition (consolidateRingToStack, ~9.89s) + 500ms margin.
      engine.armBusySafetyValve(isSecurityTransitioningRef, 10390);
      lastSecurityScrollTimeRef.current = Date.now();

      if (aboutOrbitTweenRef.current) {
        aboutOrbitTweenRef.current.kill();
        aboutOrbitTweenRef.current = null;
      }

      gsap.to([cardsClusterRef.current, aboutContentRef.current], {
        y: -getComposedViewport().vh * 0.45,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          stateRef.current = "faq";
          lockScrollYRef.current = -1;
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          document.documentElement.style.removeProperty("overflow");
          document.body.style.removeProperty("overflow");
          document.documentElement.style.removeProperty("overscroll-behavior");
          document.body.style.removeProperty("overscroll-behavior");

          if (stageRef.current) {
            stageRef.current.style.position = "";
            stageRef.current.style.top = "";
            stageRef.current.style.left = "";
            stageRef.current.style.width = "";
            stageRef.current.style.height = "";
            stageRef.current.style.zIndex = "";
          }
          // Unpinning here changes total document height; downstream
          // ScrollTriggers (FAQ/Contact reveals) cache pixel offsets that go
          // stale the instant this layout shifts, so resync them now.
          ScrollTrigger.refresh();
          isSecurityTransitioningRef.current = false;

          const faqEl = document.getElementById("faq");
          if (faqEl) {
            isNavigatingRef.current = true;
            engine.armBusySafetyValve(isNavigatingRef, 10390);
            smoothScrollTo(faqEl, {
              duration: 0.40,
              ease: "power2.out",
              onComplete: () => {
                isNavigatingRef.current = false;
              },
            });
          }
          shared.current.dispatchActiveSection("faq");
        },
      });
    };

    const jumpToAboutState = (targetPage: 1 | 2 = 1) => {
      if (stateRef.current === "about") return;
      if (stateRef.current === "ring") {
        shared.current.consolidateRingToStack();
        return;
      }

      isSecurityTransitioningRef.current = true;
      engine.armBusySafetyValve(isSecurityTransitioningRef, 10390);
      stateRef.current = "about";
      setIsAperturePaused(true);
      productCompleteRef.current = true;

      gsap.killTweensOf(window);
      lockScrollYRef.current = 0;
      window.scrollTo(0, 0);

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
      document.body.style.overscrollBehavior = "none";

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
      if (safeContainerRef.current) {
        gsap.set(safeContainerRef.current, { opacity: 0, visibility: "hidden" });
        safeVault3DRef.current?.pauseAmbient?.();
      }
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
      const { vh: vhVal } = getComposedViewport(1440, 900);
      const stackCardScale = isDesk ? 0.60 : isTab ? 0.56 : 0.52;
      const targetEnvelopeY = isDesk ? 90 : isTab ? 70 : 50;
      void vhVal;

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
        gsap.set(docCavityWrapperRef.current, {
          zIndex: 35,
          visibility: "visible",
          opacity: 1,
          autoAlpha: 1,
          clipPath: "none",
          WebkitClipPath: "none",
        });
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
            y: -getComposedViewport().vh * 0.45,
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
              shared.current.dispatchActiveSection("about");
            },
          }
        );
      } else {
        isSecurityTransitioningRef.current = false;
        shared.current.dispatchActiveSection("about");
      }
    };

    useImperativeHandle(
      forwardedRef,
      () => ({
        computeEnvelopeParams,
        flipDocToPage,
        exitAboutToFaq,
        jumpToAboutState,
      }),
      []
    );

    return null;
  }
);

interface AboutBackgroundSlotProps {
  aboutContentRef: MutableRefObject<HTMLDivElement | null>;
}

export function AboutBackgroundSlot({ aboutContentRef }: AboutBackgroundSlotProps) {
  return (
    <>
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
          filter: "blur(22px)",
        }}
      />

      {/* 4. Volumetric God Ray 2: Soft, translucent shaft from top-right */}
      <div
        className="absolute -top-24 -right-20 w-[55vw] max-w-[792px] h-[120vh] pointer-events-none rotate-[25deg] origin-top-right opacity-50"
        style={{
          background:
            "linear-gradient(180deg, rgba(52, 211, 153, 0.10) 0%, rgba(34, 197, 94, 0.04) 25%, rgba(16, 185, 129, 0.01) 50%, transparent 70%)",
          filter: "blur(22px)",
        }}
      />

      {/* 5. Overhead Central Luminous Light Cone */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[75vw] max-w-[1000px] h-[50vh] pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(34, 197, 94, 0.13) 0%, rgba(74, 222, 128, 0.05) 35%, transparent 75%)",
          filter: "blur(20px)",
        }}
      />

      {/* 6. Atmospheric Backlight Halo behind Envelope for pristine edge definition */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[900px] h-[420px] pointer-events-none opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(34, 197, 94, 0.10) 0%, rgba(74, 222, 128, 0.03) 40%, transparent 75%)",
          filter: "blur(24px)",
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
    </>
  );
}

interface AboutEnvelopeSlotProps {
  unifiedEnvelopeRef: MutableRefObject<HTMLDivElement | null>;
  docCavityWrapperRef: MutableRefObject<HTMLDivElement | null>;
  philosophyDocRef: MutableRefObject<HTMLDivElement | null>;
  docPaperSheetRef: MutableRefObject<HTMLDivElement | null>;
  docFlipperRef: MutableRefObject<HTMLDivElement | null>;
  docInkCopyRef: MutableRefObject<HTMLDivElement | null>;
  envelopeTopFlapRef: MutableRefObject<HTMLDivElement | null>;
  envelopeSealRef: MutableRefObject<HTMLDivElement | null>;
}

export function AboutEnvelopeSlot({
  unifiedEnvelopeRef,
  docCavityWrapperRef,
  philosophyDocRef,
  docPaperSheetRef,
  docFlipperRef,
  docInkCopyRef,
  envelopeTopFlapRef,
  envelopeSealRef,
}: AboutEnvelopeSlotProps) {
  return (
                <>
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
                    className="relative w-[94vw] max-w-[760px] sm:max-w-[840px] md:max-w-[900px] lg:max-w-[960px] h-[360px] sm:h-[440px] md:h-[490px] lg:h-[540px] max-h-[62vh] rounded-[16px] sm:rounded-[22px]"
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
                                In most families, someone ends up in charge of the money.
                                <br />
                                Not because they trained for it.{" "}
                                <span className="text-[#22C55E]">Because someone has to.</span>
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
                </>
  );
}
