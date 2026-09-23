"use client";

import {
  forwardRef,
  useImperativeHandle,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getComposedViewport } from "@/lib/viewport";
import { computeDockGeometry, type BentoGeometry } from "@/lib/dockLayout";
import { SafeVault3D, type SafeVault3DRef } from "@/components/blueprint/SafeVault3D";
import type { SceneEngine } from "../hero-engine/useSceneEngine";
import {
  CINEMATIC_TIMESCALE,
  PRODUCT_CARDS,
  STACK_RANK_MAP,
  SECURITY_STATES,
  PASSWORD_LETTERS,
  LOCKED_LETTERS,
  CONNECTION_LETTERS,
  INDIA_LETTERS,
  MONEY_LETTERS,
  SELL_LETTERS,
  CLOSING_BLACK_WORDS,
  CLOSING_GREEN_WORDS,
} from "../BlueprintHero";

/**
 * Task 7 — the largest single extraction in the BlueprintHero file-split plan.
 * Owns Security's own vault (SafeVault3D dock), all 8 security sub-states
 * (hero money-word / read-only-eyes / password-mask / lock-morph / connection /
 * India-map / sell-shield / closing-statement), the Product<->Ring<->About
 * handoff timelines, and their layout math (`computeDockLayout`).
 *
 * Architecture notes (see task-7-report.md for the full write-up):
 *
 * 1. NO `useRef()` instances move here. Every DOM/value/timeline ref this
 *    scene's logic touches is still declared (and owned) in BlueprintHero.tsx,
 *    exactly like HeroScene.tsx/ProductBentoScene.tsx before it —
 *    `sceneCtx`/`resetToState` (hero-engine/sceneTransitions.ts) reads/writes
 *    these exact same ref objects for instant state jumps, and BlueprintHero's
 *    own cleanup effect and `window.__biDebug` harness read several of them
 *    too. This file receives them all as one flat `refs` prop bag.
 *
 * 2. Both pieces of Security's DOM were ALREADY being rendered through slot
 *    props before this task started (Task 5's `productWorldAfterFloorLine`
 *    slot on HeroScene for the sub-state panels, Task 6's `securityVaultSlot`
 *    slot on ProductBentoScene for the vault) — neither piece is a free
 *    top-level sibling anywhere in the tree. Since a slot ReactNode must be
 *    ready THE SAME RENDER PASS BlueprintHero.tsx builds it (it's handed
 *    straight into another scene's props, not resolved later via a ref), it
 *    cannot be produced by reaching into this component's `useImperativeHandle`
 *    after mount (refs populate after commit, too late for that render).
 *    So instead of one mounted `<SecurityVaultScene>` owning that JSX
 *    directly, this file exports two plain presentational components,
 *    `SecurityVaultSlot` and `SecurityStageSlot`, that BlueprintHero.tsx
 *    mounts DIRECTLY as the value of `securityVaultSlot`/
 *    `productWorldAfterFloorLine` — Security's JSX still lives and is
 *    authored in this file, it's just consumed as ordinary child elements
 *    (which render at the correct DOM position immediately) rather than via
 *    the ref/handle mechanism used for imperative trigger calls.
 *    `SecurityVaultScene` itself (the forwardRef component below) owns none
 *    of that DOM — it renders `null` — and exists purely to hold the
 *    timeline/layout logic and expose it imperatively (`triggerProductToRing`,
 *    `goToSecurityState`, etc.) to BlueprintHero.tsx's `dispatchSceneAction`
 *    and `jumpToAboutState`, the same way ProductBentoScene exposes
 *    `triggerRestingToBento`/`triggerBentoToResting`.
 *
 * 3. `computeBentoLayout` (Product's tile geometry) and `dispatchActiveSection`
 *    (shared across every scene) stay resident in BlueprintHero.tsx exactly as
 *    Task 6 left them, bridged in here via the `shared` ref-prop — same
 *    technique as `HeroSceneShared`/`ProductBentoSceneShared`.
 *    `computeEnvelopeParams` and `jumpToAboutState` are About's own helpers
 *    (Task 8's territory, still resident in BlueprintHero.tsx) that Security's
 *    ring<->about handoff (`consolidateRingToStack`/`exitSecurityToAbout`)
 *    calls into — bridged the same way, added to `shared` alongside the two
 *    Task 6 fields. Conversely, About's `jumpToAboutState` (still in
 *    BlueprintHero.tsx) calls INTO this scene's `consolidateRingToStack` when
 *    it fires from the "ring" state — BlueprintHero.tsx routes that through
 *    `securitySceneRef.current?.consolidateRingToStack()`, same as
 *    `dispatchSceneAction` does.
 */

/**
 * Every DOM/value/timeline ref this scene's own logic touches, still declared
 * (and owned) in BlueprintHero.tsx — see header comment above.
 */
export interface SecurityVaultSceneRefs {
  // --- stage / hero / product DOM shared with other scenes -----------------
  stageRef: MutableRefObject<HTMLDivElement | null>;
  headerRef: MutableRefObject<HTMLDivElement | null>;
  headlineRef: MutableRefObject<HTMLHeadingElement | null>;
  ctaRef: MutableRefObject<HTMLAnchorElement | null>;
  floorLineRef: MutableRefObject<HTMLDivElement | null>;
  cardsStageRef: MutableRefObject<HTMLDivElement | null>;
  cardsClusterRef: MutableRefObject<HTMLDivElement | null>;
  cardWrapperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardFrontRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardBackRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardDefaultRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardHoverRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardIllustrationRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardGradientBgRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardGlassOverlayRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  bentoTileContentRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  /** DOM lives in ProductBentoScene.tsx (Task 6); this scene's timelines drive
   * their paper -> ink choreography during the ring<->stack handoff — the
   * companion-card split-brain from Task 6 is resolved by threading the same
   * instances down here as props, exactly like every other cross-scene ref. */
  companionCardRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  cardInkRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  companionPaperRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  companionInkRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  currentHoverRef: MutableRefObject<number | null>;
  hoverCommitTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;

  // --- security / vault ------------------------------------------------------
  securityStageRef: MutableRefObject<HTMLDivElement | null>;
  securityStateRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  securityHeroRibbonRef: MutableRefObject<HTMLDivElement | null>;
  securityStateTransitionTlRef: MutableRefObject<gsap.core.Timeline | null>;
  safeContainerRef: MutableRefObject<HTMLDivElement | null>;
  safeVault3DRef: MutableRefObject<SafeVault3DRef | null>;
  productToRingTlRef: MutableRefObject<gsap.core.Timeline | null>;
  ringRotateTweenRef: MutableRefObject<gsap.core.Tween | null>;
  consolidationTlRef: MutableRefObject<gsap.core.Timeline | null>;
  closingBlackTextRef: MutableRefObject<HTMLDivElement | null>;
  closingGreenTextRef: MutableRefObject<HTMLDivElement | null>;
  closingBlackWordRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  closingGreenWordRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  origCentersRef: MutableRefObject<{ x: number; y: number }[]>;
  targetLeftXRef: MutableRefObject<number>;
  targetRingYRef: MutableRefObject<number>;
  heroShiftXRef: MutableRefObject<number>;
  rightShiftXRef: MutableRefObject<number>;
  securityHeadingYRef: MutableRefObject<number>;
  stackTargetXRef: MutableRefObject<number>;
  stackTargetYRef: MutableRefObject<number>;
  cardsToSafeDeltaXRef: MutableRefObject<number>;
  cardsToSafeDeltaYRef: MutableRefObject<number>;
  onProductToRingCompletedRef: MutableRefObject<(() => void) | null>;
  onRingToProductCompletedRef: MutableRefObject<(() => void) | null>;
  onConsolidateCompletedRef: MutableRefObject<(() => void) | null>;
  onRestoreStackCompletedRef: MutableRefObject<(() => void) | null>;

  // --- flourish sub-state refs (one group per security state) ---------------
  typoEyesRef: MutableRefObject<HTMLSpanElement | null>;
  typoLeftWordRef: MutableRefObject<HTMLSpanElement | null>;
  typoRightWordRef: MutableRefObject<HTMLSpanElement | null>;
  typoPupilsRef: MutableRefObject<(HTMLSpanElement | null)[]>;
  typoEyelidsRef: MutableRefObject<(HTMLSpanElement | null)[]>;
  typoEyesTlRef: MutableRefObject<gsap.core.Timeline | null>;
  pwdLetterRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  pwdMaskRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  pwdMaskTlRef: MutableRefObject<gsap.core.Timeline | null>;
  lockCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  lockIconWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  lockShackleRef: MutableRefObject<SVGPathElement | null>;
  lockBodyRef: MutableRefObject<SVGRectElement | null>;
  lockAnimTlRef: MutableRefObject<gsap.core.Timeline | null>;
  lockAnimPlayedRef: MutableRefObject<boolean>;
  connectionCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  connectionWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  connectionAnimTlRef: MutableRefObject<gsap.core.Timeline | null>;
  indiaCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  indiaMapWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  indiaMapPathRef: MutableRefObject<SVGPathElement | null>;
  indiaAnimTlRef: MutableRefObject<gsap.core.Timeline | null>;
  moneyCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  moneyWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  moneyBill1Ref: MutableRefObject<SVGGElement | null>;
  moneyBill2Ref: MutableRefObject<SVGGElement | null>;
  moneyAnimTlRef: MutableRefObject<gsap.core.Timeline | null>;
  sellCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  sellShieldWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  sellShieldIconRef: MutableRefObject<SVGSVGElement | null>;
  sellAnimTlRef: MutableRefObject<gsap.core.Timeline | null>;

  // --- about (still authored in BlueprintHero.tsx until Task 8) -------------
  aboutContentRef: MutableRefObject<HTMLDivElement | null>;
  unifiedEnvelopeRef: MutableRefObject<HTMLDivElement | null>;
  envelopeTopFlapRef: MutableRefObject<HTMLDivElement | null>;
  envelopeSealRef: MutableRefObject<HTMLDivElement | null>;
  docCavityWrapperRef: MutableRefObject<HTMLDivElement | null>;
  docFlipperRef: MutableRefObject<HTMLDivElement | null>;
  philosophyDocRef: MutableRefObject<HTMLDivElement | null>;
  docPaperSheetRef: MutableRefObject<HTMLDivElement | null>;
  docInkCopyRef: MutableRefObject<HTMLDivElement | null>;
}

/**
 * BlueprintHero-resident helpers this scene's logic calls into that live
 * inside BlueprintHero.tsx's own mount effect (not at component-body scope),
 * so they can't be read directly during this component's render — same
 * bridging technique as `HeroSceneShared`/`ProductBentoSceneShared`.
 * `computeEnvelopeParams`/`jumpToAboutState` are About's own helpers
 * (Task 8's territory); Security's ring->about handoff calls into them.
 */
export interface SecurityVaultSceneShared {
  computeBentoLayout: (vw: number, vh: number) => BentoGeometry;
  dispatchActiveSection: (section: string) => void;
  computeEnvelopeParams: () => {
    isDesk: boolean;
    isTab: boolean;
    envScale: number;
    scatterSlots: {
      x: number; y: number; z: number; rotZ: number; rotX: number; rotY: number; scale: number;
    }[];
  };
  jumpToAboutState: (targetPage?: 1 | 2) => void;
}

/**
 * Exposed imperatively because `dispatchSceneAction`'s "ring"-scene cases
 * (still owned by BlueprintHero.tsx, same as Task 6's ProductBentoScene
 * pattern) and About's `jumpToAboutState` (still in BlueprintHero.tsx until
 * Task 8) must invoke these. `computeDockLayout`/`playMoneyAnimation` are
 * additionally called through thin BlueprintHero.tsx-resident shims from
 * `sceneCtx` (hero-engine/sceneTransitions.ts's `resetToState`) and
 * `reflowCurrentLayout`'s resize handler.
 */
export interface SecurityVaultSceneHandle {
  computeDockLayout: () => {
    clusterEl: HTMLDivElement | null;
    vWidth: number;
    vHeight: number;
    bento: BentoGeometry;
    stackTargetX: number;
    stackTargetY: number;
    stackCardScale: number;
    targetLeftX: number;
    targetRingY: number;
    rightShiftX: number;
    heroShiftX: number;
    securityHeadingY: number;
    targetCardLeft: number;
    targetCardTop: number;
    restingWidth: number;
    hRest: number;
  };
  playMoneyAnimation: () => void;
  triggerProductToRing: () => void;
  triggerRingToProduct: () => void;
  goToSecurityState: (nextIdx: number, direction: 1 | -1) => void;
  consolidateRingToStack: () => void;
  restoreStackToRing: () => void;
  exitSecurityToAbout: () => void;
}

interface SecurityVaultSceneProps {
  engine: SceneEngine;
  refs: SecurityVaultSceneRefs;
  shared: MutableRefObject<SecurityVaultSceneShared>;
}

export const SecurityVaultScene = forwardRef<SecurityVaultSceneHandle, SecurityVaultSceneProps>(
  function SecurityVaultScene({ engine, refs, shared }, forwardedRef) {
    const {
      stateRef,
      currentSecurityStateRef,
      productCompleteRef,
      isHoldingProductRef,
      transitionStartedRef,
      transitionAnimatingRef,
      transitionCompleteRef,
      isSecurityTransitioningRef,
      hasTriggeredThisGestureRef,
      wheelGestureActiveRef,
      wheelGestureEndTimerRef,
      lastSecurityScrollTimeRef,
      lockScrollYRef,
      apertureScrollTriggerRef,
      aboutDocPageRef,
      isFlippingDocRef,
      isRingConsolidatedRef,
    } = engine;

    const {
      stageRef,
      headerRef,
      headlineRef,
      ctaRef,
      floorLineRef,
      cardsStageRef,
      cardsClusterRef,
      cardWrapperRefs,
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
      currentHoverRef,
      hoverCommitTimeoutRef,
      securityStageRef,
      securityStateRefs,
      securityHeroRibbonRef,
      securityStateTransitionTlRef,
      safeContainerRef,
      safeVault3DRef,
      productToRingTlRef,
      ringRotateTweenRef,
      consolidationTlRef,
      closingBlackTextRef,
      closingGreenTextRef,
      closingBlackWordRefs,
      closingGreenWordRefs,
      origCentersRef,
      targetLeftXRef,
      targetRingYRef,
      heroShiftXRef,
      rightShiftXRef,
      securityHeadingYRef,
      stackTargetXRef,
      stackTargetYRef,
      cardsToSafeDeltaXRef,
      cardsToSafeDeltaYRef,
      onProductToRingCompletedRef,
      onRingToProductCompletedRef,
      onConsolidateCompletedRef,
      onRestoreStackCompletedRef,
      typoEyesRef,
      typoLeftWordRef,
      typoRightWordRef,
      typoPupilsRef,
      typoEyelidsRef,
      typoEyesTlRef,
      pwdLetterRefs,
      pwdMaskRefs,
      pwdMaskTlRef,
      lockCharRefs,
      lockIconWrapperRef,
      lockShackleRef,
      lockBodyRef,
      lockAnimTlRef,
      lockAnimPlayedRef,
      connectionCharRefs,
      connectionWrapperRef,
      connectionAnimTlRef,
      indiaCharRefs,
      indiaMapWrapperRef,
      indiaMapPathRef,
      indiaAnimTlRef,
      moneyCharRefs,
      moneyWrapperRef,
      moneyBill1Ref,
      moneyBill2Ref,
      moneyAnimTlRef,
      sellCharRefs,
      sellShieldWrapperRef,
      sellShieldIconRef,
      sellAnimTlRef,
      aboutContentRef,
      unifiedEnvelopeRef,
      envelopeTopFlapRef,
      envelopeSealRef,
      docCavityWrapperRef,
      docFlipperRef,
      philosophyDocRef,
      docPaperSheetRef,
      docInkCopyRef,
    } = refs;

      // =======================================================================
      // =======================================================================
      // PRODUCT (BENTO) -> SECURITY (COLLAPSE & RING) TRANSITION
      // The 5 bento tiles physically converge into the "Skip the dashboards. Just ask." card,
      // and from that stack point, seamlessly hand off to the existing ring/spiral formation,
      // Security text reveal, and docking animation.
      // =======================================================================
      // Computes the resting "docked" layout (safe/vault position, security heading
      // shift, bento stack target) from the CURRENT live viewport + cluster position,
      // and caches the results into refs (targetLeftXRef, targetRingYRef, etc.) so
      // other call sites (resetToState's Security branch, reverse transitions) can
      // read them.
      // Pure and idempotent — safe to call again any time the viewport changes (see
      // handleResizeLines) to refresh a previously-cached layout, not just once
      // when the forward scroll transition first fires.
      const computeDockLayout = () => {
        const clusterEl = cardsClusterRef.current;
        const { vw: vWidth, vh: vHeight, rawW, rawH } = getComposedViewport(1440, 800);
        const liveW = rawW || vWidth;
        const liveH = rawH || vHeight;

        const clusterRect = clusterEl ? clusterEl.getBoundingClientRect() : null;
        const clusterCenterX = clusterRect ? clusterRect.left + clusterRect.width / 2 : liveW / 2;
        const clusterCenterY = clusterRect ? clusterRect.top + clusterRect.height / 2 : liveH / 2;
        const clusterW = clusterEl?.offsetWidth || Math.min(liveW, 1340);
        const clusterH = clusterEl?.offsetHeight || 370;

        // Current Bento layout coordinates
        const bento = shared.current.computeBentoLayout(liveW, liveH);

        const dock = computeDockGeometry({
          vWidth: liveW,
          vHeight: liveH,
          clusterCenterX,
          clusterCenterY,
          clusterW,
          clusterH,
          bento,
        });

        origCentersRef.current = PRODUCT_CARDS.map(() => ({
          x: dock.stackTargetX,
          y: dock.stackTargetY,
        }));

        // Ensure safeContainerRef has its width & height explicitly synced with finalVaultW
        if (safeContainerRef.current) {
          safeContainerRef.current.style.width = `${dock.finalVaultW}px`;
          safeContainerRef.current.style.height = `${dock.finalVaultW}px`;
        }

        targetLeftXRef.current = dock.targetLeftX;
        targetRingYRef.current = dock.targetRingY;
        heroShiftXRef.current = dock.heroShiftX;
        rightShiftXRef.current = dock.rightShiftX;
        securityHeadingYRef.current = dock.securityHeadingY;
        stackTargetXRef.current = dock.stackTargetX;
        stackTargetYRef.current = dock.stackTargetY;
        cardsToSafeDeltaXRef.current = dock.targetLeftX - dock.stackTargetX;
        cardsToSafeDeltaYRef.current = dock.targetRingY - dock.stackTargetY;

        return {
          clusterEl,
          vWidth: liveW,
          vHeight: liveH,
          bento,
          stackTargetX: dock.stackTargetX,
          stackTargetY: dock.stackTargetY,
          stackCardScale: dock.stackCardScale,
          targetLeftX: dock.targetLeftX,
          targetRingY: dock.targetRingY,
          rightShiftX: dock.rightShiftX,
          heroShiftX: dock.heroShiftX,
          securityHeadingY: dock.securityHeadingY,
          targetCardLeft: dock.targetCardLeft,
          targetCardTop: dock.targetCardTop,
          restingWidth: dock.restingWidth,
          hRest: dock.hRest,
        };
      };

      const createProductToRingTimeline = () => {
        const clusterEl = cardsClusterRef.current;
        if (!clusterEl) return gsap.timeline();

        const {
          vWidth,
          vHeight,
          bento,
          stackTargetX,
          stackTargetY,
          stackCardScale,
          targetLeftX,
          targetRingY,
          rightShiftX,
          heroShiftX,
          targetCardLeft,
          targetCardTop,
          restingWidth,
          hRest,
        } = computeDockLayout();

        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            stateRef.current = "sculpting";
            transitionStartedRef.current = true;
            transitionAnimatingRef.current = true;
            // Safety valve (Task 3 / final-review fix) — see AboutScene.tsx for
            // the full rationale; 10390ms = longest real transition + 500ms margin.
            engine.armBusySafetyValve(transitionAnimatingRef, 10390);
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

            shared.current.dispatchActiveSection("security");

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
            safeVault3DRef.current?.resetToClosed?.();
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.pauseAmbient?.();

            if (securityStageRef.current) {
              gsap.set(securityStageRef.current, { opacity: 0, visibility: "hidden", zIndex: 15 });
            }
            securityStateRefs.current.forEach((el) => {
              if (el) {
                gsap.set(el, { opacity: 0, visibility: "hidden", x: rightShiftX, y: securityHeadingYRef.current || 0, xPercent: -50, yPercent: -50, scale: 1, clipPath: "none" });
              }
            });
            if (securityHeroRibbonRef.current) {
              gsap.set(securityHeroRibbonRef.current, {
                x: 0,
                opacity: 1,
                clipPath: "inset(-15% 100% -15% 0%)",
                WebkitClipPath: "inset(-15% 100% -15% 0%)",
              });
            }

            if (stageRef.current) {
              stageRef.current.style.position = "fixed";
              stageRef.current.style.top = "0px";
              stageRef.current.style.left = "0px";
              stageRef.current.style.width = "100%";
              stageRef.current.style.height = "100vh";
              stageRef.current.style.zIndex = "40";
            }
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            document.documentElement.style.overscrollBehavior = "none";
            document.body.style.overscrollBehavior = "none";
            lockScrollYRef.current = 0;
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            // Restore all 5 cards in clean Bento state
            const currentBento = shared.current.computeBentoLayout(vWidth, vHeight);
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
                  backdropFilter: "blur(16px)",
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

            shared.current.dispatchActiveSection("product");

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
          [headerRef.current, headlineRef.current, ctaRef.current, floorLineRef.current],
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
              safeVault3DRef.current?.resetToClosed?.();
              safeVault3DRef.current?.setCardsProgress?.(0);
              safeVault3DRef.current?.pauseAmbient?.();
            },
          },
          0
        );

        // Security Stage positioned & ready behind cards layer (z-15) from the beginning
        tl.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 15 }, 0);
        securityStateRefs.current.forEach((el) => {
          if (el) {
            tl.set(el, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: rightShiftX, y: securityHeadingYRef.current || 0, xPercent: -50, yPercent: -50, clipPath: "none" }, 0);
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
            { opacity: 0, scale: 0.88, xPercent: -50, yPercent: -50, x: targetLeftX, y: targetRingY },
            { opacity: 1, scale: 1.0, xPercent: -50, yPercent: -50, x: targetLeftX, y: targetRingY, duration: 0.38, ease: "power2.out" },
            0.12
          );
          tl.call(() => safeVault3DRef.current?.pauseAmbient?.(true), [], 0.12);
        }

        // Safe opens toward the LEFT (0.16s -> 0.72s)
        const safeOpenStart = 0.16;
        const safeOpenDuration = 0.56;
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
        // PHASE 2: FAST, CRISP TRAVEL OF CARDS INTO VAULT (0.44s -> 0.88s)
        // -------------------------------------------------------------------------
        const cardEnterStart = 0.44;
        const cardsToSafeDeltaX = targetLeftX - stackTargetX;
        const cardsToSafeDeltaY = targetRingY - stackTargetY;

        // Ensure companion duplicate cards remain hidden
        companionCardRefs.current.forEach((compEl) => {
          if (compEl) {
            tl.set(compEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" }, 0);
          }
        });

        // 1. Lead product cards: Fast glide into vault
        PRODUCT_CARDS.forEach((_, i) => {
          const wrapper = cardWrapperRefs.current[i];
          const paper = cardFrontRefs.current[i];
          const ink = cardInkRefs.current[i];
          if (!wrapper) return;

          const rank = STACK_RANK_MAP[i] ?? i;
          const cardStart = cardEnterStart + rank * 0.015;

          // Target coordinates at vault mouth and inside chamber
          const mouthX = cardsToSafeDeltaX + (4 - rank) * -0.4;
          const mouthY = cardsToSafeDeltaY + (4 - rank) * 0.4;
          const mouthZ = 35 - rank * 2.0;

          const chamberX = cardsToSafeDeltaX;
          const chamberY = cardsToSafeDeltaY;
          const chamberZ = -200;

          // Ensure paper face is visible and ink layer initialized at start
          if (paper) tl.set(paper, { opacity: 1, visibility: "visible" }, 0);
          if (ink) tl.set(ink, { opacity: 0, visibility: "visible" }, 0);

          // Fast travel toward vault
          const travelDuration = 0.42;

          tl.to(
            wrapper,
            {
              x: mouthX,
              y: mouthY,
              z: mouthZ,
              rotateX: 14,
              rotateY: -12,
              rotateZ: -10 + rank * 2.5,
              duration: travelDuration,
              ease: "power2.inOut",
            },
            cardStart
          );

          tl.fromTo(
            wrapper,
            { scale: stackCardScale },
            {
              scale: stackCardScale * 0.30,
              duration: travelDuration,
              ease: "power2.inOut",
            },
            cardStart
          );

          if (paper && ink) {
            const morphStart = cardStart + 0.12;
            tl.fromTo(
              ink,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.28,
                ease: "power1.inOut",
              },
              morphStart
            );

            tl.fromTo(
              paper,
              { opacity: 1 },
              {
                opacity: 0,
                duration: 0.25,
                ease: "power1.inOut",
              },
              morphStart + 0.10
            );
          }

          const enterVaultStart = cardStart + travelDuration;
          const enterVaultDuration = 0.18;

          tl.to(
            wrapper,
            {
              x: chamberX,
              y: chamberY,
              z: chamberZ,
              scale: stackCardScale * 0.12,
              duration: enterVaultDuration,
              ease: "power2.in",
            },
            enterVaultStart
          );

          if (ink) {
            tl.to(
              ink,
              {
                opacity: 0,
                duration: 0.14,
                ease: "power2.in",
              },
              enterVaultStart + 0.04
            );
          }

          tl.set(
            wrapper,
            {
              opacity: 0,
              autoAlpha: 0,
              visibility: "hidden",
            },
            enterVaultStart + enterVaultDuration + 0.02
          );
        });

        safeVault3DRef.current?.setCardsProgress?.(0);

        // -------------------------------------------------------------------------
        // PHASE 3: REVEAL SECURITY HERO TEXT WHILE CARDS ENTER (0.68s -> 1.13s)
        // -------------------------------------------------------------------------
        const textRevealStart = 0.68;
        const textRevealDuration = 0.45;
        const state0El = securityStateRefs.current[0];
        const ribbonEl = securityHeroRibbonRef.current;

        if (state0El && ribbonEl) {
          tl.set(state0El, { autoAlpha: 0, opacity: 0, visibility: "hidden", x: rightShiftX, y: securityHeadingYRef.current || 0, xPercent: -50, yPercent: -50, clipPath: "none" }, 0);
          tl.set(
            ribbonEl,
            {
              x: 0,
              opacity: 1,
              clipPath: "inset(-15% 100% -15% 0%)",
              WebkitClipPath: "inset(-15% 100% -15% 0%)",
            },
            0
          );

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

          // Reveal progressive left -> right: right inset expands from 100% to 0%
          tl.fromTo(
            ribbonEl,
            {
              clipPath: "inset(-15% 100% -15% 0%)",
              WebkitClipPath: "inset(-15% 100% -15% 0%)",
            },
            {
              clipPath: "inset(-15% 0% -15% 0%)",
              WebkitClipPath: "inset(-15% 0% -15% 0%)",
              duration: textRevealDuration,
              ease: "power2.out",
            },
            textRevealStart
          );

          tl.set(
            ribbonEl,
            { clipPath: "none", WebkitClipPath: "none" },
            textRevealStart + textRevealDuration
          );
        }

        // -------------------------------------------------------------------------
        // PHASE 4: VAULT DOOR CLOSES IMMEDIATELY AFTER CARDS ENTER (0.98s -> 1.52s)
        // -------------------------------------------------------------------------
        const safeCloseStart = 0.98;
        const safeCloseDuration = 0.54;

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
        tl.call(
          () => safeVault3DRef.current?.resumeAmbient?.(),
          [],
          safeCloseStart + safeCloseDuration
        );

        tl.timeScale(CINEMATIC_TIMESCALE);
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
        tl.timeScale(1.6);

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
        tl.timeScale(1.5);

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
        tl.timeScale(1.5);

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
        tl.timeScale(1.6);

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
        tl.timeScale(1.5);

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
        tl.timeScale(1.5);

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
        tl.timeScale(1.6);

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
        const { vh } = getComposedViewport(1440, 800);

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

      const consolidateRingToStack = () => {
        if (!cardsClusterRef.current) return;
        if (isSecurityTransitioningRef.current) return;
        if (isRingConsolidatedRef.current) return;

        const clusterEl = cardsClusterRef.current;
        isSecurityTransitioningRef.current = true;
        engine.armBusySafetyValve(isSecurityTransitioningRef, 10390);

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
        const { vw: vwVal, vh: vhVal } = getComposedViewport(1440, 900);
        const stackCardScale = isDesktop ? 0.60 : isTablet ? 0.56 : 0.52;
        const targetEnvelopeY = isDesktop ? 90 : isTablet ? 70 : 50;

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];
        const ringSlots = computeRingSlots();

        // Target: cards consolidate into tight horizontal stack matching reference attachment
        const frontX = 35;

        // Maintain the exact docked horizontal and vertical position from computeDockLayout
        // so the closing text remains locked to the exact same position throughout the transition
        const vCenterX = vwVal / 2;
        const shiftX = rightShiftXRef.current ?? (isDesktop
          ? Math.round(vCenterX * 0.35)
          : isTablet
          ? Math.round(vCenterX * 0.24)
          : Math.round(vCenterX * 0.14));
        const headingY = securityHeadingYRef.current || 0;

        // Ensure security stage and closing line (State 7) are active and measurable behind cards (zIndex: 20 < 30)
        if (securityStageRef.current) {
          gsap.set(securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 20 });
        }
        if (securityStateRefs.current[7]) {
          gsap.set(securityStateRefs.current[7], { autoAlpha: 1, opacity: 1, visibility: "visible", x: shiftX, y: headingY, xPercent: -50, yPercent: -50 });
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

        const { vw, vh } = getComposedViewport(1440, 900);
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
          shared.current.computeEnvelopeParams();

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
            if (closingBlackTextRef.current && blackRect) {
              const bWidth = blackRect.width || 1;
              if (time >= 1.50 + exitDelta || (blackRect.width > 0 && wipeRightX >= blackRect.right)) {
                closingBlackTextRef.current.style.clipPath = "inset(0 0 0 100%)";
                (closingBlackTextRef.current.style as any).webkitClipPath = "inset(0 0 0 100%)";
              } else {
                const bProgress = Math.max(0, Math.min(bWidth, wipeRightX - blackRect.left));
                closingBlackTextRef.current.style.clipPath = `inset(0 0 0 ${bProgress}px)`;
                (closingBlackTextRef.current.style as any).webkitClipPath = `inset(0 0 0 ${bProgress}px)`;
              }
            }

            // 3. Spatial erasure of Green Line (swept Right -> Left return)
            if (closingGreenTextRef.current && greenRect) {
              const gWidth = greenRect.width || 1;
              if (time < 1.76 + exitDelta) {
                closingGreenTextRef.current.style.clipPath = "none";
                (closingGreenTextRef.current.style as any).webkitClipPath = "none";
              } else if (time >= 2.32 + exitDelta || (greenRect.width > 0 && wipeLeftX <= greenRect.left)) {
                closingGreenTextRef.current.style.clipPath = "inset(0 100% 0 0)";
                (closingGreenTextRef.current.style as any).webkitClipPath = "inset(0 100% 0 0)";
              } else {
                const gRightClip = Math.max(0, Math.min(gWidth, greenRect.right - wipeLeftX));
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
            shared.current.dispatchActiveSection("about");

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
                xPercent: -50,
                yPercent: -50,
                x: targetLeftXRef.current,
                y: targetRingYRef.current,
              });
            }
            safeVault3DRef.current?.resetToClosed?.();
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.pauseAmbient?.(true);

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
                y: headingY,
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

            shared.current.dispatchActiveSection("security");
          },
        });
        consolidationTlRef.current = tl;
        tl.timeScale(CINEMATIC_TIMESCALE);

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
              y: headingY,
              xPercent: -50,
              yPercent: -50,
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
              x: cardsToSafeDeltaX + (4 - rank) * -0.4,
              y: cardsToSafeDeltaY + (4 - rank) * 0.4,
              z: -180,
              scale: stackCardScale * 0.12,
              rotateX: 14,
              rotateY: -12,
              rotateZ: -10 + rank * 2.5,
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
              xPercent: -50,
              yPercent: -50,
              x: targetLeftXRef.current,
              y: targetRingYRef.current,
            },
            0
          );
          tl.call(() => safeVault3DRef.current?.pauseAmbient?.(true), [], 0);
        }

        safeVault3DRef.current?.setCardsProgress?.(0);

        // STEP 1: VAULT OPENS (0.00s -> 0.72s)
        // Door opens with majestic weighted inertia matching entry animation (0.72s)
        const safeOpenProxy = { p: 0 };
        const safeOpenDuration = 0.72;
        tl.fromTo(
          safeOpenProxy,
          { p: 0 },
          {
            p: 1.0,
            duration: safeOpenDuration,
            ease: "power2.inOut",
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(safeOpenProxy.p);
            },
          },
          0
        );

        // -------------------------------------------------------------------------
        // STEP 2: CONTINUOUS "SKETCH -> LARGER -> PAPER" TRANSFORMATION & EXIT
        // Progression (Exact reverse of entry):
        // 1. Start as small sketches: Emerge through vault opening (~30% size, 0.46s -> 0.98s).
        // 2. Gradually increase in size: ~30% -> ~40% -> ~60% -> ~80% -> 100% as they travel away.
        // 3. Simultaneously transform Ink -> Paper:
        //    - Sketch lines progressively gain filled paper surfaces in mid-flight (~60% scale).
        //    - Ink lines dissolve into solid paper as cards reach ~80% - 100% size.
        // 4. Return to normal card size: Fully solid 100% paper cards upon reaching launch trajectory.
        // -------------------------------------------------------------------------
        const cardExitStart = 0.46;
        const cardEmergeDuration = 0.44;

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

          const mouthX = cardsToSafeDeltaX + (4 - rank) * -0.4;
          const mouthY = cardsToSafeDeltaY + (4 - rank) * 0.4;
          const mouthZ = 35 - rank * 2.0;

          // 1. VISIBLY EMERGE THROUGH VAULT OPENING AS SMALL SKETCH CARDS (~30% size)
          // Moves straight forward along +Z from inside chamber (-180) to vault mouth (35)
          tl.to(
            wrapper,
            {
              x: mouthX,
              y: mouthY,
              z: mouthZ,
              scale: stackCardScale * 0.30,
              rotateX: 14,
              rotateY: -12,
              rotateZ: -10 + rank * 2.5,
              opacity: 1,
              autoAlpha: 1,
              duration: cardEmergeDuration,
              ease: "power2.out",
              force3D: true,
            },
            exitStart
          );

          // 2. CONTINUOUS TRAVEL AWAY FROM VAULT WHILE SCALING UP & MORPHING INK -> PAPER
          // Trajectory from vault mouth to consolidated launch position (0.90s -> 1.95s)
          const flightStart = exitStart + cardEmergeDuration;
          const flightDuration = 1.95 - flightStart;

          // Continuous flight away from vault to destination
          tl.to(
            wrapper,
            {
              x: destX - origX,
              y: destY - origY,
              z: destZ,
              duration: flightDuration,
              ease: "power2.inOut",
              force3D: true,
            },
            flightStart
          );

          // Continuous scale up from ~30% (small sketch) to 100% (stackCardScale) along the trajectory
          tl.to(
            wrapper,
            {
              scale: stackCardScale,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              duration: flightDuration,
              ease: "power1.inOut",
              force3D: true,
            },
            flightStart
          );

          // Simultaneous Ink -> Paper progressive transformation along outward trajectory:
          if (paper && ink) {
            // Paper begins emerging under ink lines as scale increases (~40% scale, t ~ 1.05s)
            tl.fromTo(
              paper,
              { opacity: 0 },
              {
                opacity: 1.0,
                duration: 0.65,
                ease: "power1.inOut",
              },
              flightStart + 0.12
            );

            // Ink lines dissolve into the solid paper surface as scale reaches ~75% - 100% (t ~ 1.50s)
            tl.fromTo(
              ink,
              { opacity: 1 },
              {
                opacity: 0,
                duration: 0.35,
                ease: "power1.inOut",
              },
              flightStart + 0.55
            );
          }
        });

        // STEP 2B: VAULT DOOR CLOSES AFTER CARDS HAVE FULLY CLEARED THE OPENING (1.38s -> 1.82s)
        // Cards have completely cleared the opening and are in mid-flight to the right by 1.38s.
        // The door closes with the exact same 0.54s duration as entry vault!
        const safeExitCloseStart = 1.38;
        const safeExitCloseDuration = 0.54;

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

        // STEP 3: VAULT DISAPPEARS - Fades out ONLY AFTER vault is closed & paper cards are fully formed (1.85s -> 2.15s)
        if (safeContainerRef.current) {
          tl.to(
            safeContainerRef.current,
            {
              opacity: 0,
              scale: 0.92,
              duration: 0.30,
              ease: "power2.inOut",
            },
            1.85
          );
          tl.set(
            safeContainerRef.current,
            {
              visibility: "hidden",
              autoAlpha: 0,
              onComplete: () => {
                safeVault3DRef.current?.resetToClosed?.();
                safeVault3DRef.current?.setCardsProgress?.(0);
                safeVault3DRef.current?.pauseAmbient?.();
              },
            },
            2.15
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

        // Downward arrival: Security closing text fades out smoothly in place without drifting
        tl.to(
          securityStateRefs.current[7],
          {
            opacity: 0,
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
        engine.armBusySafetyValve(isSecurityTransitioningRef, 10390);
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

        // Reset cluster transform to identity before computing dock layout so measurement is pristine
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

        const dockLayout = computeDockLayout();
        const targetLeftX = dockLayout.targetLeftX;
        const targetRingY = dockLayout.targetRingY;
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTablet = typeof window !== "undefined" && window.innerWidth >= 768;
        const stackCardScale = isDesktop ? 0.60 : isTablet ? 0.56 : 0.52;
        const targetEnvelopeY = isDesktop ? 90 : isTablet ? 70 : 50;
        const frontX = 35;

        const allProductCards = cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
        const allCompanionCards = companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
        const allCards = [...allProductCards, ...allCompanionCards];
        const shiftX = dockLayout.rightShiftX;
        const headingY = dockLayout.securityHeadingY;

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
            safeVault3DRef.current?.resetToClosed?.();
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.resumeAmbient?.();
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
                y: headingY,
                xPercent: -50,
                yPercent: -50,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
              });
            }

            shared.current.dispatchActiveSection("security");

            if (onRestoreStackCompletedRef.current) {
              const cb = onRestoreStackCompletedRef.current;
              onRestoreStackCompletedRef.current = null;
              cb();
            }
          },
        });

        // -------------------------------------------------------------------------
        // REVERSE STEP 1: DOCUMENT DIRECTLY RETRACTS BACK INTO ENVELOPE (0.00s -> 0.22s)
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
              duration: 0.22,
              ease: "power2.in",
              force3D: true,
            },
            0
          );
          revTl.set(philosophyDocRef.current, { visibility: "hidden", opacity: 0 }, 0.22);
        }

        // Lift envelope back up from downward emergence displacement
        if (cardsClusterRef.current) {
          revTl.to(
            cardsClusterRef.current,
            {
              y: targetEnvelopeY,
              duration: 0.22,
              ease: "power2.out",
            },
            0.02
          );
        }

        // -------------------------------------------------------------------------
        // REVERSE STEP 2: ENVELOPE TOP FLAP AUTOMATICALLY CLOSES (0.20s -> 0.36s)
        // -------------------------------------------------------------------------
        if (envelopeTopFlapRef.current) {
          revTl.set(envelopeTopFlapRef.current, { zIndex: 30, opacity: 1 }, 0.20);
          revTl.to(
            envelopeTopFlapRef.current,
            {
              rotateX: 0,
              duration: 0.16,
              ease: "power2.inOut",
              force3D: true,
            },
            0.20
          );
        }
        if (envelopeSealRef.current) {
          revTl.set(envelopeSealRef.current, { visibility: "visible" }, 0.20);
          revTl.to(
            envelopeSealRef.current,
            {
              opacity: 1,
              scale: 1,
              duration: 0.12,
              ease: "power2.out",
            },
            0.24
          );
        }

        // Ensure all cards remain hidden inside the vault (no glitchy popping)
        allCards.forEach((cardEl) => {
          revTl.set(cardEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" }, 0);
        });

        // -------------------------------------------------------------------------
        // REVERSE STEP 3: ENVELOPE DISSOLVES AS DOCKED VAULT & SECURITY TEXT EMERGE (0.34s -> 0.58s)
        // -------------------------------------------------------------------------
        if (unifiedEnvelopeRef.current) {
          revTl.to(
            unifiedEnvelopeRef.current,
            {
              scaleX: 0.60,
              scaleY: 0.75,
              opacity: 0,
              duration: 0.20,
              ease: "power2.in",
            },
            0.34
          );
          revTl.set(unifiedEnvelopeRef.current, { visibility: "hidden" }, 0.54);
        }

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
              duration: 0.26,
              ease: "power2.out",
              force3D: true,
            },
            0.34
          );
        }

        if (safeContainerRef.current) {
          revTl.set(
            safeContainerRef.current,
            {
              visibility: "visible",
              autoAlpha: 0,
              opacity: 0,
              scale: 0.90,
              xPercent: -50,
              yPercent: -50,
              x: targetLeftX,
              y: targetRingY,
            },
            0.34
          );
          revTl.to(
            safeContainerRef.current,
            {
              autoAlpha: 1,
              opacity: 1,
              scale: 1,
              duration: 0.24,
              ease: "power2.out",
            },
            0.34
          );
          revTl.call(() => safeVault3DRef.current?.resumeAmbient?.(), [], 0.36);
        }

        if (aboutContentRef.current) {
          revTl.to(
            aboutContentRef.current,
            {
              opacity: 0,
              duration: 0.22,
              ease: "power2.inOut",
            },
            0.32
          );
          revTl.set(aboutContentRef.current, { visibility: "hidden" }, 0.54);
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
              y: headingY + 16,
              xPercent: -50,
              yPercent: -50,
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
              y: headingY,
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
        engine.armBusySafetyValve(isSecurityTransitioningRef, 10390);
        lastSecurityScrollTimeRef.current = Date.now();
        currentSecurityStateRef.current = nextIdx;

        // Subtle vault interaction: rotate outer locking rim smoothly between Security states while door remains closed
        if (nextIdx === 0) {
          safeVault3DRef.current?.resetToClosed?.();
        } else {
          safeVault3DRef.current?.triggerRimStep?.(direction, nextIdx);
        }

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
            hasTriggeredThisGestureRef.current = false;
            wheelGestureActiveRef.current = false;
            if (nextIdx === 0) {
              if (nextEl) gsap.set(nextEl, { clipPath: "none" });
              safeVault3DRef.current?.resetToClosed?.();
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
              y: direction === 1 ? -12 : 12,
              duration: 0.14,
              ease: "power2.in",
            },
            0
          );
          tl.set(prevEl, { visibility: "hidden" }, 0.14);
        }

        const isDesk = typeof window !== "undefined" && window.innerWidth >= 1024;
        const isTab = typeof window !== "undefined" && window.innerWidth >= 768;
        const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
        const vCenterX = getComposedViewport().vw / 2;
        const shiftX = rightShiftXRef.current ?? 0;
        const headingY = securityHeadingYRef.current ?? 0;

        // 2. New text smoothly enters with a slight directional movement & subtle stagger
        if (nextEl) {
          if (nextIdx === 0 && securityHeroRibbonRef.current) {
            gsap.set(securityHeroRibbonRef.current, { x: 0, clipPath: "none", WebkitClipPath: "none" });
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
              y: (direction === 1 ? 16 : -16) + headingY,
              xPercent: -50,
              yPercent: -50,
            },
            0.10
          );

          const heading = nextEl.querySelector("h2, h3");
          const body = nextEl.querySelector("p");

          if (heading && body) {
            tl.fromTo(
              heading,
              { opacity: 0, y: direction === 1 ? 10 : -10 },
              { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" },
              0.06
            );
            tl.fromTo(
              body,
              { opacity: 0, y: direction === 1 ? 10 : -10 },
              { opacity: 1, y: 0, duration: 0.20, ease: "power2.out" },
              0.08
            );
            tl.to(nextEl, { opacity: 1, y: headingY, xPercent: -50, yPercent: -50, duration: 0.20, ease: "power2.out" }, 0.06);
          } else {
            tl.to(
              nextEl,
              {
                opacity: 1,
                y: headingY,
                xPercent: -50,
                yPercent: -50,
                duration: 0.20,
                ease: "power2.out",
              },
              0.06
            );
          }
        }
        tl.timeScale(CINEMATIC_TIMESCALE);
      };

      const exitSecurityToAbout = () => {
        shared.current.jumpToAboutState();
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
        engine.armBusySafetyValve(transitionAnimatingRef, 10390);
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

        // 2. Lock document overflow and disable overscroll bouncing
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.documentElement.style.overscrollBehavior = "none";
        document.body.style.overscrollBehavior = "none";

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
        engine.armBusySafetyValve(transitionAnimatingRef, 10390);
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
          const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
          const vCenterX = getComposedViewport().vw / 2;
          const shiftX = rightShiftXRef.current ?? 0;
          const headingY = securityHeadingYRef.current ?? 0;
          if (state0El) gsap.set(state0El, { opacity: 1, visibility: "visible", x: shiftX, y: headingY, xPercent: -50, yPercent: -50, scale: 1, clipPath: "none" });
          currentSecurityStateRef.current = 0;
          safeVault3DRef.current?.resetToClosed?.();
        }


        const pinEnd = apertureScrollTriggerRef.current?.end ?? window.scrollY;
        lockScrollYRef.current = pinEnd;
        window.scrollTo(0, pinEnd);

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

    useImperativeHandle(
      forwardedRef,
      () => ({
        computeDockLayout,
        playMoneyAnimation,
        triggerProductToRing,
        triggerRingToProduct,
        goToSecurityState,
        consolidateRingToStack,
        restoreStackToRing,
        exitSecurityToAbout,
      }),
      []
    );

    // One-time mount warm-up: seed the dock-layout refs (targetLeftXRef,
    // rightShiftXRef, securityHeadingYRef, ...) and the safe container's
    // width/height style, exactly like BlueprintHero.tsx's own mount effect
    // used to do synchronously right after `computeDockLayout`'s old inline
    // definition (pre-Task-7). Runs as this component's own mount effect
    // (not BlueprintHero.tsx's) because React commits/runs child effects
    // before the parent's — by the time BlueprintHero.tsx's own `useGSAP`
    // body runs, this has already executed, so nothing there needs to poke
    // `securitySceneRef.current` synchronously during its own render/mount.
    useGSAP(() => {
      computeDockLayout();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
  }
);

/**
 * Security's vault (`safeContainerRef` + `SafeVault3D`) — rendered directly by
 * BlueprintHero.tsx as the value of ProductBentoScene's `securityVaultSlot`
 * prop, so it mounts as a direct child of `cardsClusterRef`, in the exact same
 * DOM position it occupied before this split (see header comment above for
 * why this is a plain component rather than something reached through
 * `SecurityVaultScene`'s ref).
 */
interface SecurityVaultSlotProps {
  safeContainerRef: MutableRefObject<HTMLDivElement | null>;
  safeVault3DRef: MutableRefObject<SafeVault3DRef | null>;
}

export function SecurityVaultSlot({
  safeContainerRef,
  safeVault3DRef,
}: SecurityVaultSlotProps) {
  return (
    <>
                {/* LUXURY ROUND 3D SAFE (Matching "Safe Movement") */}
                <div
                  ref={safeContainerRef}
                  className="absolute pointer-events-none select-none will-change-transform flex items-center justify-center -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] xl:w-[420px] 2xl:w-[480px] h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px] xl:h-[420px] 2xl:h-[480px] max-h-[48vh] max-w-[48vh] lg:max-w-[32vw]"
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
                    className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-[32px] sm:h-[42px] rounded-[100%] pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse 65% 35% at 50% 50%, rgba(18, 26, 22, 0.16) 0%, rgba(34, 197, 94, 0.05) 35%, transparent 70%)",
                      filter: "blur(18px)",
                    }}
                  />

                  {/* 3D Round Chrome/Gold Vault Safe (Exact replica of Reference Image & "Safe Movement") */}
                  <SafeVault3D
                    ref={safeVault3DRef}
                    className="w-full h-full max-w-full max-h-full"
                  />
                </div>
    </>
  );
}

/**
 * Security's 8 narrative sub-state panels (hero money-word / read-only-eyes /
 * password-mask / lock-morph / connection / India-map / sell-shield /
 * closing-statement) — rendered directly by BlueprintHero.tsx as the value of
 * HeroScene's `productWorldAfterFloorLine` prop, so it mounts nested inside
 * `productWorldRef`, in the exact same DOM position it occupied before this
 * split (see header comment above for why this is a plain component rather
 * than something reached through `SecurityVaultScene`'s ref).
 */
interface SecurityStageSlotProps {
  securityStageRef: MutableRefObject<HTMLDivElement | null>;
  securityStateRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  securityHeroRibbonRef: MutableRefObject<HTMLDivElement | null>;
  securityHeroWordRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  typoEyesRef: MutableRefObject<HTMLSpanElement | null>;
  typoLeftWordRef: MutableRefObject<HTMLSpanElement | null>;
  typoRightWordRef: MutableRefObject<HTMLSpanElement | null>;
  typoPupilsRef: MutableRefObject<(HTMLSpanElement | null)[]>;
  typoEyelidsRef: MutableRefObject<(HTMLSpanElement | null)[]>;
  pwdLetterRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  pwdMaskRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  lockCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  lockIconWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  lockShackleRef: MutableRefObject<SVGPathElement | null>;
  lockBodyRef: MutableRefObject<SVGRectElement | null>;
  connectionCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  connectionWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  indiaCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  indiaMapWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  indiaMapPathRef: MutableRefObject<SVGPathElement | null>;
  moneyCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  moneyWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  moneyBill1Ref: MutableRefObject<SVGGElement | null>;
  moneyBill2Ref: MutableRefObject<SVGGElement | null>;
  sellCharRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  sellShieldWrapperRef: MutableRefObject<HTMLSpanElement | null>;
  sellShieldIconRef: MutableRefObject<SVGSVGElement | null>;
  closingBlackTextRef: MutableRefObject<HTMLDivElement | null>;
  closingGreenTextRef: MutableRefObject<HTMLDivElement | null>;
  closingBlackWordRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
  closingGreenWordRefs: MutableRefObject<(HTMLSpanElement | null)[]>;
}

export function SecurityStageSlot(props: SecurityStageSlotProps) {
  const {
    securityStageRef,
    securityStateRefs,
    securityHeroRibbonRef,
    securityHeroWordRefs,
    typoEyesRef,
    typoLeftWordRef,
    typoRightWordRef,
    typoPupilsRef,
    typoEyelidsRef,
    pwdLetterRefs,
    pwdMaskRefs,
    lockCharRefs,
    lockIconWrapperRef,
    lockShackleRef,
    lockBodyRef,
    connectionCharRefs,
    connectionWrapperRef,
    indiaCharRefs,
    indiaMapWrapperRef,
    indiaMapPathRef,
    moneyCharRefs,
    moneyWrapperRef,
    moneyBill1Ref,
    moneyBill2Ref,
    sellCharRefs,
    sellShieldWrapperRef,
    sellShieldIconRef,
    closingBlackTextRef,
    closingGreenTextRef,
    closingBlackWordRefs,
    closingGreenWordRefs,
  } = props;

  return (
    <>
            {/* Minimal Editorial Security Content Experience */}
            <div
              ref={securityStageRef}
              id="security"
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-15 select-none"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="relative w-full h-full flex items-center justify-center mx-auto">
                {SECURITY_STATES.map((item, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      securityStateRefs.current[idx] = el;
                    }}
                    className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-fit max-w-[92vw] sm:max-w-[500px] md:max-w-[520px] lg:max-w-[560px] xl:max-w-[600px] text-left will-change-transform pointer-events-none"
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                    }}
                  >
                    {item.type === "hero" ? (
                      <div
                        ref={securityHeroRibbonRef}
                        className="relative will-change-transform select-none flex flex-col items-center md:items-start text-center md:text-left w-fit max-w-full"
                      >
                        <h2 className="font-sans font-black font-[900] text-[20px] min-[380px]:text-[22px] min-[440px]:text-[24px] sm:text-[26px] md:text-[30px] lg:text-[36px] xl:text-[40px] 2xl:text-[42px] text-neutral-950 tracking-[-0.035em] select-none flex flex-col items-center md:items-start gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4 leading-[1.12] text-center md:text-left">
                          {/* Line 1: We take your data as seriously */}
                          <div className="whitespace-nowrap flex items-baseline gap-[0.24em]">
                            <span ref={(el) => { securityHeroWordRefs.current[0] = el; }} className="inline-block">We</span>
                            <span ref={(el) => { securityHeroWordRefs.current[1] = el; }} className="inline-block">take</span>
                            <span ref={(el) => { securityHeroWordRefs.current[2] = el; }} className="inline-block">your</span>
                            <span ref={(el) => { securityHeroWordRefs.current[3] = el; }} className="inline-block">data</span>
                            <span ref={(el) => { securityHeroWordRefs.current[4] = el; }} className="inline-block">as</span>
                            <span ref={(el) => { securityHeroWordRefs.current[5] = el; }} className="inline-block text-[#22C55E] font-black font-[900]">seriously</span>
                          </div>

                          {/* Line 2: as you take your money. */}
                          <div className="whitespace-nowrap flex items-baseline gap-[0.24em]">
                            <span ref={(el) => { securityHeroWordRefs.current[6] = el; }} className="inline-block">as</span>
                            <span ref={(el) => { securityHeroWordRefs.current[7] = el; }} className="inline-block">you</span>
                            <span ref={(el) => { securityHeroWordRefs.current[8] = el; }} className="inline-block">take</span>
                            <span ref={(el) => { securityHeroWordRefs.current[9] = el; }} className="inline-block">your</span>
                            <span ref={(el) => { securityHeroWordRefs.current[10] = el; }} className="inline-block">
                              <span className="relative inline-flex items-center justify-center align-baseline">
                                {/* The 5 letters of "money" in black */}
                                <span className="inline-flex items-baseline text-neutral-950 font-black font-[900]">
                                  {MONEY_LETTERS.map((char, charIdx) => (
                                    <span
                                      key={charIdx}
                                      ref={(el) => {
                                        moneyCharRefs.current[charIdx] = el;
                                      }}
                                      className="inline-block"
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
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] text-neutral-950 tracking-[-0.035em] leading-[1.08] mb-3 sm:mb-4 select-none relative inline-flex flex-wrap sm:flex-nowrap items-baseline">
                            {/* Left Word Segment: "Read-only," */}
                            <span
                              ref={typoLeftWordRef}
                              className="inline-block"
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
                              className="inline-block text-[#22C55E]"
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
                                    className="inline-block"
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
                                    className="inline-block"
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
                                    className="text-neutral-900"
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
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] text-neutral-950 tracking-[-0.035em] leading-[1.08] mb-3 sm:mb-4 select-none whitespace-normal lg:whitespace-nowrap">
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
                                    className="inline-block"
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
                                <span className="inline-flex items-center justify-center -translate-y-12 sm:-translate-y-14 md:-translate-y-16">
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
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] text-neutral-950 tracking-[-0.035em] leading-[1.08] mb-4 sm:mb-5 select-none whitespace-normal lg:whitespace-nowrap">
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
                                    className="inline-block"
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
                                    />
                                  </svg>
                                </span>
                              </span>
                            </span>
                          </h3>
                        ) : idx === 6 ? (
                          // State 7: "We don't sell your data" - Typography Transformation into Security Shield Badge
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] text-neutral-950 tracking-[-0.035em] leading-[1.08] mb-3 sm:mb-4 select-none whitespace-normal lg:whitespace-nowrap">
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
                                    className="inline-block"
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
                                  className="w-[2.4em] h-[2.4em] sm:w-[2.7em] sm:h-[2.7em] md:w-[3.0em] md:h-[3.0em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.40)]"
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
                          <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] text-neutral-950 tracking-[-0.03em] leading-[1.08] mb-3 sm:mb-4">
                            {item.headline}
                          </h3>
                        )}
                        <p className="font-sans text-sm sm:text-base md:text-lg lg:text-[19px] text-neutral-600 font-normal leading-relaxed max-w-xl lg:max-w-2xl">
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
                          <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] text-neutral-950 tracking-[-0.035em] leading-[1.15] flex items-baseline gap-x-[0.26em] whitespace-nowrap">
                            {CLOSING_BLACK_WORDS.map((word, wIdx) => (
                              <span
                                key={wIdx}
                                ref={(el) => {
                                  closingBlackWordRefs.current[wIdx] = el;
                                }}
                                className="inline-block"
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
                          <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] text-[#22C55E] tracking-[-0.035em] leading-[1.15] flex flex-col items-start gap-y-2.5 sm:gap-y-3.5 md:gap-y-4">
                            {/* Line 1: It's the baseline everything */}
                            <div className="flex items-baseline gap-x-[0.26em] whitespace-nowrap">
                              {CLOSING_GREEN_WORDS.slice(0, 4).map((word, wIdx) => (
                                <span
                                  key={wIdx}
                                  ref={(el) => {
                                    closingGreenWordRefs.current[wIdx] = el;
                                  }}
                                  className="inline-block"
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
                                    className="inline-block"
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
    </>
  );
}
