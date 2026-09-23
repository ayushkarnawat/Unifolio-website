"use client";

import {
  forwardRef,
  useImperativeHandle,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { gsap } from "@/lib/gsap";
import {
  getComposedViewport,
  getCardRestHeight,
  getBentoVwTierPx,
} from "@/lib/viewport";
import type { BentoGeometry } from "@/lib/dockLayout";
import { Sparkles } from "lucide-react";
import type { SceneEngine } from "../hero-engine/useSceneEngine";
import { CINEMATIC_TIMESCALE, PRODUCT_CARDS } from "../BlueprintHero";

/** Count of "duplicated trail cards" rendered for Security's paper -> ink
 * choreography — verbatim value from BlueprintHero.tsx's own `COMPANION_COUNT`
 * (not exported from there, so duplicated here; it's a fixed render count, not
 * shared mutable state, so duplication carries no drift risk). */
const COMPANION_COUNT = 21;

/**
 * Every DOM ref this scene's own bento layout/timeline logic and JSX touches.
 * All of these `useRef` instances are still declared (and owned) in
 * `BlueprintHero.tsx`, NOT here — same rationale as `HeroScene.tsx`'s
 * `HeroSceneRefs`: `sceneCtx`/`resetToState` (hero-engine/sceneTransitions.ts)
 * also read/write these exact same ref objects for instant state jumps, and
 * `HeroScene.tsx`'s own Hero->Product timeline already reads/writes
 * `cardsClusterRef`/`cardsStageRef` (toggling pointer-events, scaling the
 * cluster) — so they must stay the same shared instances, created once in
 * BlueprintHero.tsx and passed down to whichever scene needs them, rather
 * than re-created locally in more than one place.
 *
 * `cardsClusterRef` in particular is also needed by `SecurityVaultScene`
 * (Task 7) for `computeDockGeometry`'s cluster measurement — BlueprintHero.tsx
 * owns this one ref and passes it into both scenes; neither scene creates its
 * own copy.
 */
export interface ProductBentoSceneRefs {
  cardsStageRef: MutableRefObject<HTMLDivElement | null>;
  cardsClusterRef: MutableRefObject<HTMLDivElement | null>;
  headerRef: MutableRefObject<HTMLDivElement | null>;
  headlineRef: MutableRefObject<HTMLHeadingElement | null>;
  ctaRef: MutableRefObject<HTMLAnchorElement | null>;
  floorLineRef: MutableRefObject<HTMLDivElement | null>;
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
  /** "Duplicated trail cards" used by Security's paper -> ink stack choreography
   * (still authored/driven from BlueprintHero.tsx until Task 7) — the DOM for
   * them lives inside this scene's cards cluster, so their refs are created in
   * BlueprintHero.tsx and threaded through here purely so this file can render
   * the JSX; this scene's own logic never reads/writes them. */
  companionCardRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardInkRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  companionPaperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  companionInkRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  restingToBentoTlRef: MutableRefObject<gsap.core.Timeline | null>;
}

/**
 * The handful of BlueprintHero-owned helpers this scene's bento layout/timeline
 * logic needs that live inside BlueprintHero.tsx's own one-time mount effect
 * (not at component-body scope), so they can't be read directly during this
 * component's render — same bridging technique as `HeroSceneShared`.
 *
 * `computeBentoLayout` in particular stays owned by BlueprintHero.tsx (not
 * moved here) because it is also called by Security's still-inline
 * `computeDockLayout`/`createProductToRingTimeline` (Task 7's territory) —
 * moving it here would sever that shared usage before Task 7 exists.
 */
export interface ProductBentoSceneShared {
  computeBentoLayout: (vw: number, vh: number) => BentoGeometry;
  dispatchActiveSection: (section: string) => void;
}

/**
 * Both are exposed imperatively because "product-resting"/"product"'s
 * `registerScene` calls (still owned by BlueprintHero.tsx, routed through its
 * shared `dispatchSceneAction`) must invoke them, and `applyBentoLayoutToCards`
 * is also called directly from `resetToState`'s Product branch (via `ctx`) and
 * from BlueprintHero.tsx's own resize-reflow handler.
 */
export interface ProductBentoSceneHandle {
  triggerRestingToBento: () => void;
  triggerBentoToResting: () => void;
  applyBentoLayoutToCards: (vw: number, vh: number) => BentoGeometry;
}

interface ProductBentoSceneProps {
  engine: SceneEngine;
  refs: ProductBentoSceneRefs;
  shared: MutableRefObject<ProductBentoSceneShared>;
  /** Security's vault (`safeContainerRef` + `SafeVault3D`) — still authored
   * inline in BlueprintHero.tsx (Task 7 extracts `SecurityVaultScene`), passed
   * in verbatim because its DOM must render as a direct child of this scene's
   * `cardsClusterRef`, in between the card tiles and About's envelope, in the
   * exact same DOM position it occupied before this split. */
  securityVaultSlot: ReactNode;
  /** About's unified envelope/document UI (`unifiedEnvelopeRef` and
   * everything inside it) — still authored inline in BlueprintHero.tsx (Task 8
   * extracts the About scene), passed in verbatim for the same DOM-order
   * reason as `securityVaultSlot`. */
  aboutEnvelopeSlot: ReactNode;
}

export const ProductBentoScene = forwardRef<ProductBentoSceneHandle, ProductBentoSceneProps>(
  function ProductBentoScene(
    { engine, refs, shared, securityVaultSlot, aboutEnvelopeSlot },
    forwardedRef
  ) {
    const {
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
    } = refs;

    const { stateRef, transitionAnimatingRef } = engine;

    // =======================================================================
    // SCROLL-TRIGGERED BENTO TRANSFORMATION
    // Directly animates the 5 resting cards into the reference bento geometry
    // when the user scrolls down from the resting amphitheater state.
    // =======================================================================
      const createRestingToBentoTimeline = () => {
        const { vw: vWidth, vh: vHeight } = getComposedViewport(1440, 800);
        const { computeBentoLayout, dispatchActiveSection } = shared.current;

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            stateRef.current = "sculpting";
            transitionAnimatingRef.current = true;
            // Safety valve (Task 3 / final-review fix) — see AboutScene.tsx for
            // the full rationale; 10390ms = longest real transition + 500ms margin.
            engine.armBusySafetyValve(transitionAnimatingRef, 10390);
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "none";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "none";
            if (headerRef.current) headerRef.current.style.pointerEvents = "none";
          },
          onComplete: () => {
            stateRef.current = "product";
            transitionAnimatingRef.current = false;
            if (cardsClusterRef.current) cardsClusterRef.current.style.pointerEvents = "";
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "";
            if (headerRef.current) headerRef.current.style.pointerEvents = "";
            dispatchActiveSection("product");
          },
          onReverseComplete: () => {
            stateRef.current = "product-resting";
            transitionAnimatingRef.current = false;
            if (cardsClusterRef.current) {
              cardsClusterRef.current.style.pointerEvents = "";
              cardsClusterRef.current.style.minHeight = "";
            }
            if (cardsStageRef.current) cardsStageRef.current.style.pointerEvents = "";
            if (headerRef.current) headerRef.current.style.pointerEvents = "";
            gsap.set(
              [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
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

        // 1. Smoothly fade out the headline, CTA, and floor reflection line in-place
        // Finishes quickly before cards expand into bento. On reverse, headline only
        // fades back in at the very end when cards have settled into resting slots.
        const heroFadeDuration = 0.16;
        tl.to(
          [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
          {
            autoAlpha: 0,
            y: 8,
            duration: heroFadeDuration,
            ease: "power2.inOut",
          },
          0.0
        );

        tl.set(
          [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
          {
            autoAlpha: 0,
            opacity: 0,
            visibility: "hidden",
          },
          heroFadeDuration
        );

        // 2. Physical Card-to-Bento Direct Movement
        const clusterEl = cardsClusterRef.current;
        const wRest = vWidth >= 1536 ? 235 : vWidth >= 1280 ? 225 : vWidth >= 1024 ? 215 : vWidth >= 768 ? 205 : vWidth >= 640 ? 190 : 175;
        const hRest = getCardRestHeight(vWidth, vHeight);
        const gapRest = vWidth >= 1280 ? 16 : vWidth >= 768 ? 14 : vWidth >= 640 ? 12 : 10;

        const clusterW = clusterEl?.offsetWidth || Math.min(vWidth, 1340);
        const clusterH = Math.max(clusterEl?.offsetHeight || 0, hRest + 20);

        // Lock clusterEl minimum height to its current rendered height so converting in-flow
        // children to absolute positioning never collapses the container or causes layout shift.
        if (clusterEl && clusterEl.offsetHeight > 0) {
          clusterEl.style.minHeight = `${clusterEl.offsetHeight}px`;
        }

        // Measure true current resting coordinates directly from the DOM before setting absolute positioning.
        // This eliminates any subpixel/rounding jump between the flex layout and absolute coordinates.
        const restTop = Math.round((clusterH - hRest) / 2);
        const initialCardLayouts = PRODUCT_CARDS.map((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const hasMeasuredOffset = wrapper && wrapper.offsetLeft > 0 && wrapper.offsetHeight > 0;
          const fallbackL = Math.round((clusterW / 2) + (i - 2) * (wRest + gapRest) - wRest / 2);
          const fallbackT = Math.round(restTop);
          return {
            left: hasMeasuredOffset ? wrapper.offsetLeft : fallbackL,
            top: hasMeasuredOffset ? wrapper.offsetTop : fallbackT,
            width: hasMeasuredOffset ? wrapper.offsetWidth : wRest,
            height: hasMeasuredOffset ? wrapper.offsetHeight : hRest,
          };
        });

        const bento = computeBentoLayout(vWidth, vHeight);
        const bentoCardStartTime = 0.02;

        PRODUCT_CARDS.forEach((card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (!wrapper) return;

          const initial = initialCardLayouts[i];
          const targetL = Math.round(bento.tileLefts[i]);
          const targetT = Math.round(bento.tileTops[i]);
          const targetW = bento.tileWidths[i];
          const targetH = bento.tileHeights[i];

          // Lock in-place instantly at t = 0 with exact current resting position & resting transforms.
          // Zero visual delta between in-flow and absolute mode.
          tl.set(
            wrapper,
            {
              position: "absolute",
              left: initial.left,
              top: initial.top,
              width: initial.width,
              height: initial.height,
              transformOrigin: "center center",
              rotateX: 0,
              rotateY: card.restRotateY,
              rotateZ: card.restRotateZ,
              z: card.restZ,
              x: 0,
              y: card.restY,
              scaleX: 1,
              scaleY: 1,
              zIndex: 20 + i,
            },
            0.0
          );

          // Card expands seamlessly from exact resting amphitheater position into Bento grid
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
              duration: 0.70,
              ease: "power2.inOut",
            },
            bentoCardStartTime + i * 0.02
          );

          // 1. Smoothly fade out initial dark-card text, dark gradient, and centered amphitheater illustration
          const defContent = cardDefaultRefs.current[i];
          const gradBg = cardGradientBgRefs.current[i];
          const glassOverlay = cardGlassOverlayRefs.current[i];
          const centerIllu = cardIllustrationRefs.current[i];
          const frontFace = cardFrontRefs.current[i];
          const bentoContent = bentoTileContentRefs.current[i];

          if (defContent) {
            tl.to(defContent, { autoAlpha: 0, duration: 0.36, ease: "power2.inOut" }, bentoCardStartTime + 0.12);
          }
          if (gradBg) {
            tl.to(gradBg, { autoAlpha: 0, duration: 0.40, ease: "power2.inOut" }, bentoCardStartTime + 0.12);
          }
          if (glassOverlay) {
            tl.to(glassOverlay, { autoAlpha: 0, duration: 0.40, ease: "power2.inOut" }, bentoCardStartTime + 0.12);
          }
          if (centerIllu) {
            tl.to(centerIllu, { autoAlpha: 0, duration: 0.36, ease: "power2.inOut" }, bentoCardStartTime + 0.12);
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
                backdropFilter: "blur(16px)",
                duration: 0.78,
                ease: "power2.inOut",
              },
              bentoCardStartTime + 0.22
            );
          }

          // 3. Smoothly fade in rich designed bento tile content
          if (bentoContent) {
            tl.fromTo(
              bentoContent,
              { autoAlpha: 0, y: 14 },
              { autoAlpha: 1, y: 0, duration: 0.64, ease: "power2.out" },
              bentoCardStartTime + 0.50 + i * 0.04
            );
          }
        });

        tl.to({}, { duration: 0.08 }, bentoCardStartTime + 1.15);

        tl.timeScale(CINEMATIC_TIMESCALE);
        return tl;
      };


      const triggerRestingToBento = () => {
        if (transitionAnimatingRef.current || stateRef.current !== "product-resting") return;
        transitionAnimatingRef.current = true;
        engine.armBusySafetyValve(transitionAnimatingRef, 10390);
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
        engine.armBusySafetyValve(transitionAnimatingRef, 10390);
        stateRef.current = "sculpting";

        if (!restingToBentoTlRef.current) {
          restingToBentoTlRef.current = createRestingToBentoTimeline();
          restingToBentoTlRef.current.progress(1);
        } else {
          restingToBentoTlRef.current.progress(1);
        }
        restingToBentoTlRef.current.reverse();
      };

      // Applies the bento grid's computed geometry to the 5 product card wrappers.
      // Pure/idempotent — safe to call on mount, on the forward transition into the
      // grid, and again on window resize to re-layout for the new viewport.
      const applyBentoLayoutToCards = (vw: number, vh: number) => {
        const { computeBentoLayout } = shared.current;
        const bento = computeBentoLayout(vw, vh);
        if (cardsClusterRef.current) {
          cardsClusterRef.current.style.setProperty("--bento-vw-tier", `${getBentoVwTierPx(vw)}px`);
        }
        PRODUCT_CARDS.forEach((_card, i) => {
          const wrapper = cardWrapperRefs.current[i];
          if (wrapper) {
            gsap.set(wrapper, {
              position: "absolute",
              left: Math.round(bento.tileLefts[i]),
              top: Math.round(bento.tileTops[i]),
              width: bento.tileWidths[i],
              height: bento.tileHeights[i],
            });
          }
        });
        return bento;
      };

    useImperativeHandle(
      forwardedRef,
      () => ({ triggerRestingToBento, triggerBentoToResting, applyBentoLayoutToCards }),
      []
    );

    return (
      <>
            <div
              ref={cardsStageRef}
              className="w-full flex items-center justify-center relative shrink-0 pt-1 sm:pt-2 pb-1 min-h-[295px] sm:min-h-[320px] md:min-h-[340px] lg:min-h-[355px] xl:min-h-[370px] 2xl:min-h-[385px]"
              style={{ perspective: "1400px", zIndex: 30 }}
            >
              <div
                ref={cardsClusterRef}
                className="relative flex items-center justify-center gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-3.5 xl:gap-4 w-full max-w-[1340px] mx-auto overflow-visible py-1.5 px-2 no-scrollbar will-change-transform min-h-[295px] sm:min-h-[320px] md:min-h-[340px] lg:min-h-[355px] xl:min-h-[370px] 2xl:min-h-[385px]"
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
                            className="product-card-text absolute inset-0 z-15 flex flex-col items-start justify-start pt-7 sm:pt-8 px-6 text-left pointer-events-none select-none"
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
                            className="product-card-text absolute inset-0 z-20 flex flex-col items-center justify-center px-3.5 sm:px-4.5 py-4 sm:py-5 text-center pointer-events-none"
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
                              <div className="flex flex-col h-full justify-start">
                                <div>
                                  <h3
                                    className="font-sans font-black tracking-[-0.035em] text-neutral-950 leading-[1.12]"
                                    style={{ fontSize: "clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)" }}
                                  >
                                    <span className="text-[#22C55E]">Understand</span> what you own
                                  </h3>
                                </div>

                                {/* Vertical Floating Information Layout */}
                                <div className="flex flex-col justify-start flex-1 mt-3.5 sm:mt-5 lg:mt-6 gap-3 sm:gap-4 lg:gap-5">
                                  {/* Item 1: Overlap Check */}
                                  <div className="flex items-start gap-2.5 sm:gap-3">
                                    <img
                                      src="/bento-icons/stacked-sheets.png"
                                      alt="Overlap Check"
                                      className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.5]"
                                      style={{ fontSize: "clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Overlap Check.</strong><br />
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
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.5]"
                                      style={{ fontSize: "clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Performance, in Context.</strong><br />
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
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.5]"
                                      style={{ fontSize: "clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Hidden Fee Finder.</strong><br />
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
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.5]"
                                      style={{ fontSize: "clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Peer Benchmarking.</strong><br />
                                      Compared against people like you, not a generic index.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : idx === 1 ? (
                              // TILE 02: Skip the dashboards. Just ask
                              <div className="flex h-full items-center justify-between gap-3 sm:gap-4">
                                <div className="max-w-[260px] sm:max-w-[290px] lg:max-w-[315px] flex flex-col justify-start shrink-0">
                                  <h3
                                    className="font-sans font-black tracking-[-0.03em] text-neutral-950 leading-tight"
                                    style={{ fontSize: "clamp(18px, calc(1.85 * var(--bento-vw-tier, 14.4px)), 26px)" }}
                                  >
                                    Skip the Dashboards.<br />
                                    <span className="text-[#22C55E]">Just ask.</span>
                                  </h3>
                                  <p
                                    className="mt-3 text-neutral-700 font-medium leading-[1.52]"
                                    style={{ fontSize: "clamp(12.5px, calc(1.0 * var(--bento-vw-tier, 14.4px)), 15px)" }}
                                  >
                                    Not a chart. A question. Ask what&apos;s dragging your returns, whether you&apos;re overexposed, or if a decision makes sense, and get an answer from your own portfolio.
                                  </p>
                                </div>

                                {/* Hand-drawn Speech Bubbles Sketch - Proportional & balanced */}
                                <div className="relative flex-1 h-full min-h-0 flex items-center justify-center sm:justify-end pointer-events-none -my-1 sm:-my-2 translate-x-0.5 sm:translate-x-1.5 lg:translate-x-2">
                                  <img
                                    src="/product-cards/card-2d-1.png"
                                    alt="Conversational Question Intelligence"
                                    className="w-auto h-full max-h-[155px] sm:max-h-[190px] lg:max-h-[225px] object-contain drop-shadow-sm scale-[1.05] sm:scale-[1.10] lg:scale-[1.15] origin-center sm:origin-right"
                                  />
                                </div>
                              </div>
                            ) : idx === 2 ? (
                              // TILE 03: See everything
                              <div className="flex flex-col h-full justify-start">
                                <h3
                                  className="font-sans font-black tracking-[-0.035em] text-neutral-950 leading-[1.12]"
                                  style={{ fontSize: "clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)" }}
                                >
                                  See <span className="text-[#22C55E]">everything</span>
                                </h3>
                                <p
                                  className="mt-3.5 sm:mt-4 text-neutral-700 font-medium leading-[1.52]"
                                  style={{ fontSize: "clamp(13px, calc(1.05 * var(--bento-vw-tier, 14.4px)), 16px)" }}
                                >
                                  Mutual funds, stocks, bank accounts, loans, credit cards, real estate. Every asset and liability, aggregated into one accurate number.
                                </p>
                              </div>
                            ) : idx === 3 ? (
                              // TILE 04: Know your risk
                              <div className="relative flex flex-col h-full justify-start">
                                <h3
                                  className="font-sans font-black tracking-[-0.03em] text-neutral-950 leading-tight mb-3 sm:mb-4 relative z-10"
                                  style={{ fontSize: "clamp(18px, calc(1.75 * var(--bento-vw-tier, 14.4px)), 25px)" }}
                                >
                                  Know your <span className="text-[#22C55E]">risk</span>
                                </h3>

                                {/* 2 × 2 Floating Information Layout */}
                                <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5 gap-y-2 sm:gap-y-2.5 flex-1 relative z-10">
                                  {/* Item 1: Family Runway */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/pulse-line.png"
                                      alt="Family Runway"
                                      className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.4]"
                                      style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Family Runway.</strong><br />
                                      How long your family&apos;s savings would actually last.
                                    </p>
                                  </div>

                                  {/* Item 2: Real Safety Cushion */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/shield.png"
                                      alt="Real Safety Cushion"
                                      className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.4]"
                                      style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Real Safety Cushion.</strong><br />
                                      Built from your real numbers, not a generic rule of thumb.
                                    </p>
                                  </div>

                                  {/* Item 3: Sleeping Money */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/stacked-coins.png"
                                      alt="Sleeping Money"
                                      className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.4]"
                                      style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Sleeping Money.</strong><br />
                                      Surplus cash sitting idle.
                                    </p>
                                  </div>

                                  {/* Item 4: Family Risk Map */}
                                  <div className="flex items-start gap-2 sm:gap-2.5">
                                    <img
                                      src="/bento-icons/people-group-alt.png"
                                      alt="Family Risk Map"
                                      className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.4]"
                                      style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Family Risk Map.</strong><br />
                                      Where your family is financially exposed.
                                    </p>
                                  </div>
                                </div>

                              </div>
                            ) : (
                              // TILE 05: Plan Ahead
                              <div className="relative flex flex-col h-full justify-start">
                                <h3
                                  className="font-sans font-black tracking-[-0.03em] text-neutral-950 leading-tight mb-3 sm:mb-4 relative z-10"
                                  style={{ fontSize: "clamp(18px, calc(1.75 * var(--bento-vw-tier, 14.4px)), 25px)" }}
                                >
                                  <span className="text-[#22C55E]">Plan</span> Ahead
                                </h3>

                                {/* 5 Floating Information Clusters */}
                                <div className="flex flex-col justify-start flex-1 relative z-10">
                                  {/* Featured Anchor Item 1: Financial Snapshot */}
                                  <div className="flex items-start gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
                                    <img
                                      src="/bento-icons/rising-graph.png"
                                      alt="Financial Snapshot"
                                      className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                    />
                                    <p
                                      className="text-neutral-700 font-medium leading-[1.4]"
                                      style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                    >
                                      <strong className="font-bold text-neutral-950">Financial Snapshot.</strong><br />
                                      Always know where you stand.
                                    </p>
                                  </div>

                                  {/* 2 × 2 Balanced Floating Grid for the 4 Scenarios */}
                                  <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5 gap-y-2 sm:gap-y-2.5">
                                    {/* Item 2: Stress Test */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/target.png"
                                        alt="Stress Test"
                                        className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p
                                        className="text-neutral-700 font-medium leading-[1.4]"
                                        style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                      >
                                        <strong className="font-bold text-neutral-950">Stress Test.</strong><br />
                                        See how you&apos;d hold up in a crash.
                                      </p>
                                    </div>

                                    {/* Item 3: "What if I..." */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/question-bubble.png"
                                        alt="What if I..."
                                        className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p
                                        className="text-neutral-700 font-medium leading-[1.4]"
                                        style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                      >
                                        <strong className="font-bold text-neutral-950">&quot;What if I...&quot;.</strong><br />
                                        Model a decision before you make it.
                                      </p>
                                    </div>

                                    {/* Item 4: Goal Readiness Score */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/flag.png"
                                        alt="Goal Readiness Score"
                                        className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p
                                        className="text-neutral-700 font-medium leading-[1.4]"
                                        style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                      >
                                        <strong className="font-bold text-neutral-950">Goal Readiness Score.</strong><br />
                                        Every goal, tracked as one score.
                                      </p>
                                    </div>

                                    {/* Item 5: Succession Readiness */}
                                    <div className="flex items-start gap-2 sm:gap-2.5">
                                      <img
                                        src="/bento-icons/ascending-steps.png"
                                        alt="Succession Readiness"
                                        className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 mt-0.5 object-contain"
                                      />
                                      <p
                                        className="text-neutral-700 font-medium leading-[1.4]"
                                        style={{ fontSize: "clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)" }}
                                      >
                                        <strong className="font-bold text-neutral-950">Succession Readiness.</strong><br />
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
                {securityVaultSlot}
                {aboutEnvelopeSlot}
              </div>
            </div>

      </>
    );
  }
);
