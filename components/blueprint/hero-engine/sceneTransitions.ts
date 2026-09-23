"use client";

import type { MutableRefObject } from "react";
import { gsap, ScrollTrigger, smoothScrollTo } from "@/lib/gsap";
import { getComposedViewport } from "@/lib/viewport";
import type { SceneState } from "./types";

// =============================================================================
// sceneTransitions.ts — the ONE canonical "jump directly to macro state X".
//
// Replaces the six independently hand-maintained instant-jump functions that used
// to live in BlueprintHero.tsx (`instantResetHero`, `instantShowProduct`,
// `instantShowSecurity`, `instantShowAbout`, `instantShowFaq`,
// `instantShowContact`) plus `navigateToSection`'s branching between them.
//
// Root-cause report §0/§2b/§3/§7: those six each reset a *different subset* of the
// same shared visual + busy-flag state, so whichever entry path the user took
// decided which leftovers they got. `resetToState` closes that class of bug by
// making the kill/flag-clear preamble unconditional and identical for every
// target, and by giving each macro state exactly one reset body.
// =============================================================================

// Covariant, structural ref shapes. The real refs in BlueprintHero.tsx are
// `MutableRefObject<HTMLDivElement | null>` (and a few HTMLHeading/Paragraph/Anchor
// variants); declaring `current` readonly here keeps them all assignable without
// this file needing to know each element's concrete tag type. Every DOM ref below
// is read-only from this file's point of view — it only ever reads `.current`.
type ElRef = { readonly current: HTMLElement | null };
type ElListRef = { readonly current: (HTMLElement | null)[] };
type TlRef = MutableRefObject<gsap.core.Timeline | null>;
type TweenRef = MutableRefObject<gsap.core.Tween | null>;
type TimeoutRef = MutableRefObject<ReturnType<typeof setTimeout> | null>;
type BoolRef = MutableRefObject<boolean>;

/** Structural subset of `SafeVault3DRef` that the reset paths use. */
interface SafeVaultHandle {
  setOpenProgress?: (progress: number) => void;
  setCardsProgress?: (progress: number) => void;
  resetRim?: () => void;
  resetToClosed?: () => void;
  pauseAmbient?: (reset?: boolean) => void;
  resumeAmbient?: () => void;
}

/** Structural subset of `computeDockLayout()`'s return value. */
interface DockLayout {
  targetLeftX: number;
  targetRingY: number;
  rightShiftX: number;
  stackTargetX: number;
  stackTargetY: number;
  securityHeadingY: number;
}

/** Structural subset of `PRODUCT_CARDS` entries used by the hero reset. */
interface ProductCardRest {
  restY: number;
  restZ: number;
  restRotateY: number;
  restRotateZ: number;
}

/**
 * The six macro states a caller can jump to.
 *
 * `SceneState` has no `"contact"` member (Contact is not a distinct pinned scene —
 * it is native-scroll territory that shares `stateRef.current === "faq"`), so this
 * alias widens `SceneState` by exactly that one nav destination. It stays a
 * superset of `SceneState`, so anything typed `SceneState` is still a valid target.
 */
export type SceneResetTarget = SceneState | "contact";

/**
 * Everything the six migrated reset bodies touch, gathered into one bag.
 *
 * Tasks 5-8 depend on this exact shape: a scene file that wants to jump the page to
 * another macro state calls `resetToState(target, ctx)` with the same object
 * BlueprintHero.tsx builds today.
 */
export interface SceneTransitionContext {
  // --- engine state / busy flags -------------------------------------------
  stateRef: MutableRefObject<SceneState>;
  currentSecurityStateRef: MutableRefObject<number>;
  setIsAperturePaused: (paused: boolean) => void;
  productCompleteRef: BoolRef;
  isHoldingProductRef: BoolRef;
  transitionStartedRef: BoolRef;
  transitionAnimatingRef: BoolRef;
  transitionCompleteRef: BoolRef;
  isSecurityTransitioningRef: BoolRef;
  isNavigatingRef: BoolRef;
  hasTriggeredThisGestureRef: BoolRef;
  wheelGestureActiveRef: BoolRef;
  isFlippingDocRef: BoolRef;
  isRingConsolidatedRef: BoolRef;
  aboutDocPageRef: MutableRefObject<1 | 2>;
  lastSecurityScrollTimeRef: MutableRefObject<number>;
  lockScrollYRef: MutableRefObject<number>;
  targetNavSectionRef: MutableRefObject<string | null>;
  pendingNavSectionRef: MutableRefObject<string | null>;
  arrivalIdleTimeoutRef: TimeoutRef;
  momentumDrainTimeoutRef: TimeoutRef;
  /** Task 3's safety valve — disarmed for every busy flag this reset clears. */
  disarmBusySafetyValve: (flagRef: BoolRef) => void;

  // --- every scene's in-flight timeline (all killed unconditionally) --------
  heroToProductTlRef: TlRef;
  restingToBentoTlRef: TlRef;
  productToRingTlRef: TlRef;
  consolidationTlRef: TlRef;
  securityStateTransitionTlRef: TlRef;
  typoEyesTlRef: TlRef;
  pwdMaskTlRef: TlRef;
  lockAnimTlRef: TlRef;
  connectionAnimTlRef: TlRef;
  indiaAnimTlRef: TlRef;
  moneyAnimTlRef: TlRef;
  sellAnimTlRef: TlRef;
  closingExitTlRef: TlRef;
  ringRotateTweenRef: TweenRef;
  aboutOrbitTweenRef: TweenRef;

  // --- stage / hero DOM -----------------------------------------------------
  stageRef: ElRef;
  cardsStageRef: ElRef;
  cardsClusterRef: ElRef;
  headerRef: ElRef;
  headlineRef: ElRef;
  subheadRef: ElRef;
  ctaRef: ElRef;
  floorLineRef: ElRef;
  heroIntroRef: ElRef;
  heroVisualRef: ElRef;
  irisPortalRef: ElRef;
  portalRimRef: ElRef;
  portalRippleRef: ElRef;
  productWorldRef: ElRef;

  // --- cards ----------------------------------------------------------------
  cardWrapperRefs: ElListRef;
  cardFlipperRefs: ElListRef;
  cardFrontRefs: ElListRef;
  cardBackRefs: ElListRef;
  cardDefaultRefs: ElListRef;
  cardHoverRefs: ElListRef;
  cardIllustrationRefs: ElListRef;
  cardGradientBgRefs: ElListRef;
  cardGlassOverlayRefs: ElListRef;
  bentoTileContentRefs: ElListRef;
  companionCardRefs: ElListRef;

  // --- security / vault -----------------------------------------------------
  securityStageRef: ElRef;
  securityStateRefs: ElListRef;
  securityHeroRibbonRef: ElRef;
  safeContainerRef: ElRef;
  safeVault3DRef: { readonly current: SafeVaultHandle | null };
  closingBlackTextRef: ElRef;
  closingGreenTextRef: ElRef;
  origCentersRef: MutableRefObject<{ x: number; y: number }[]>;
  stackTargetXRef: MutableRefObject<number>;
  stackTargetYRef: MutableRefObject<number>;
  cardsToSafeDeltaXRef: MutableRefObject<number>;
  cardsToSafeDeltaYRef: MutableRefObject<number>;

  // --- about ----------------------------------------------------------------
  aboutContentRef: ElRef;
  unifiedEnvelopeRef: ElRef;
  envelopeTopFlapRef: ElRef;
  envelopeSealRef: ElRef;
  docCavityWrapperRef: ElRef;
  docFlipperRef: ElRef;
  philosophyDocRef: ElRef;
  docPaperSheetRef: ElRef;
  docInkCopyRef: ElRef;

  // --- helpers / constants owned by BlueprintHero ---------------------------
  computeDockLayout: () => DockLayout;
  applyPortalClip: (r: number, x: number, y: number) => void;
  applyBentoLayoutToCards: (vw: number, vh: number) => void;
  dispatchActiveSection: (section: string) => void;
  playMoneyAnimation: () => void;
  portalState: { radius: number; x: number; y: number };
  initialRadiusPx: number;
  maxRadiusPx: number;
  productCards: readonly ProductCardRest[];
}

/** Pin the stage as a fixed 100vh slide (hero / product / ring / about). */
function pinStage(ctx: SceneTransitionContext) {
  const stage = ctx.stageRef.current;
  if (stage) {
    stage.style.position = "fixed";
    stage.style.top = "0px";
    stage.style.left = "0px";
    stage.style.width = "100%";
    stage.style.height = "100vh";
    stage.style.zIndex = "40";
  }
}

/** Release the stage back to normal document flow (faq / contact). */
function unpinStage(ctx: SceneTransitionContext) {
  const stage = ctx.stageRef.current;
  if (stage) {
    stage.style.position = "";
    stage.style.top = "";
    stage.style.left = "";
    stage.style.width = "";
    stage.style.height = "";
    stage.style.zIndex = "";
  }
}

function lockNativeScroll() {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.documentElement.style.overscrollBehavior = "none";
  document.body.style.overscrollBehavior = "none";
}

function releaseNativeScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overscroll-behavior");
  document.body.style.removeProperty("overscroll-behavior");
}

/** Hide the About envelope/document UI so it can't bleed through another scene. */
function hideAboutSurfaces(ctx: SceneTransitionContext) {
  if (ctx.aboutContentRef.current) {
    gsap.set(ctx.aboutContentRef.current, { opacity: 0, visibility: "hidden" });
  }
  if (ctx.unifiedEnvelopeRef.current) {
    gsap.set(ctx.unifiedEnvelopeRef.current, { opacity: 0, visibility: "hidden" });
  }
}

/**
 * Hide the Security stage + every sub-state heading. State 7 carries the About
 * "closing statement" copy, so leaving these visible bleeds text through Hero /
 * Product / FAQ.
 */
function hideSecuritySurfaces(ctx: SceneTransitionContext) {
  if (ctx.securityStageRef.current) {
    gsap.set(ctx.securityStageRef.current, { opacity: 0, visibility: "hidden" });
  }
  ctx.securityStateRefs.current.forEach((el) => {
    if (el) gsap.set(el, { opacity: 0, visibility: "hidden" });
  });
}

/**
 * Jump the page directly to a macro state, from any other macro state, with no
 * animation. This is the single entry point for nav-pill clicks, "Back to Top",
 * the About scroll-drift recovery, and any future history/deep-link handler.
 */
export function resetToState(target: SceneResetTarget, ctx: SceneTransitionContext) {
  // -------------------------------------------------------------------------
  // 1. Busy flags: disarm their safety valves and clear them, synchronously and
  //    unconditionally. Report §2b — a flag whose only reset lived in a
  //    timeline's onComplete stays `true` forever once that timeline is killed,
  //    which is the "scroll permanently locks up" bug.
  // -------------------------------------------------------------------------
  ctx.disarmBusySafetyValve(ctx.transitionAnimatingRef);
  ctx.disarmBusySafetyValve(ctx.isSecurityTransitioningRef);
  ctx.disarmBusySafetyValve(ctx.isNavigatingRef);
  ctx.transitionAnimatingRef.current = false;
  ctx.isSecurityTransitioningRef.current = false;
  ctx.isNavigatingRef.current = false;
  ctx.wheelGestureActiveRef.current = false;
  ctx.hasTriggeredThisGestureRef.current = false;
  ctx.pendingNavSectionRef.current = null;
  ctx.targetNavSectionRef.current = null;

  // -------------------------------------------------------------------------
  // 2. Kill EVERY scene's in-flight timeline, regardless of `target`. Report
  //    §2b/§3: `navigateToSection` used to leave the seven per-substate content
  //    timelines running, so they kept mutating the same opacity/x/y properties
  //    the instant-jump had just set. Killing an already-finished timeline is a
  //    GSAP no-op, so doing this for every target is free and leaves no path
  //    that can forget one.
  // -------------------------------------------------------------------------
  const allTimelines: TlRef[] = [
    ctx.heroToProductTlRef,
    ctx.restingToBentoTlRef,
    ctx.productToRingTlRef,
    ctx.consolidationTlRef,
    ctx.securityStateTransitionTlRef,
    ctx.typoEyesTlRef,
    ctx.pwdMaskTlRef,
    ctx.lockAnimTlRef,
    ctx.connectionAnimTlRef,
    ctx.indiaAnimTlRef,
    ctx.moneyAnimTlRef,
    ctx.sellAnimTlRef,
    ctx.closingExitTlRef,
  ];
  allTimelines.forEach((tlRef) => {
    tlRef.current?.kill();
    tlRef.current = null;
  });

  const allTweens: TweenRef[] = [ctx.ringRotateTweenRef, ctx.aboutOrbitTweenRef];
  allTweens.forEach((tweenRef) => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  });

  // Any in-flight programmatic window scroll (smoothScrollTo) would fight the
  // hard scroll position each branch sets below.
  gsap.killTweensOf(window);

  // -------------------------------------------------------------------------
  // 3. Target-specific canonical "at rest" state. Each macro state owns exactly
  //    one reset body, extracted below so this function stays a thin dispatcher.
  // -------------------------------------------------------------------------
  switch (target) {
    case "ring":
      resetToRing(ctx);
      return;
    case "product":
      resetToProduct(ctx);
      return;
    case "hero":
      resetToHero(ctx);
      return;
    case "about":
      resetToAbout(ctx);
      return;
    case "faq":
      resetToNativeScrollSection(ctx, "faq", "faq");
      return;
    case "contact":
      // Contact shares the FAQ macro state (`stateRef.current === "faq"`); only the
      // scroll destination and the active-section name differ.
      resetToNativeScrollSection(ctx, "contact", "contact");
      return;
    default:
      // "product-resting" / "sculpting" are transient sub-phases, never reset
      // targets: the unconditional preamble above has already run, which is all
      // a caller can meaningfully ask for.
      return;
  }
}

/**
 * Security (the `ring` macro state) — migrated verbatim from `instantShowSecurity`.
 */
function resetToRing(ctx: SceneTransitionContext) {
  // Two corrections from the earlier glitch-fixes project are preserved and
  // re-verified here:
  //   • report §1a — the cards cluster's transform is reset to identity
  //     BEFORE computeDockLayout() measures it live, so a cluster left
  //     offset/rotated by consolidateRingToStack can't skew the vault's dock X.
  //   • report §7 — the vault's door progress and its accumulating rim/dial
  //     angle are reset together. `safeVault3DRef.resetToClosed()` IS that
  //     pairing: SafeVault3D.tsx:181-195 zeroes `animProgressRef` +
  //     `updateDoorMotion(0)` (the setOpenProgress(0) half) AND kills
  //     `rimTweenRef` + zeroes `rimSecurityAngleRef` + snaps the disc to
  //     rotate:0 (the resetRim() half) in one call.
  hideAboutSurfaces(ctx);
  ctx.isRingConsolidatedRef.current = false;

  ctx.stateRef.current = "ring";
  ctx.transitionStartedRef.current = true;
  ctx.transitionCompleteRef.current = true;
  ctx.currentSecurityStateRef.current = 0;
  ctx.isHoldingProductRef.current = false;
  ctx.lastSecurityScrollTimeRef.current = Date.now();

  ctx.lockScrollYRef.current = 0;
  window.scrollTo(0, 0);

  lockNativeScroll();

  pinStage(ctx);
  if (ctx.stageRef.current) {
    gsap.set(ctx.stageRef.current, { opacity: 1, visibility: "visible" });
  }

  // Hide Hero elements
  gsap.set(
    [ctx.headerRef.current, ctx.headlineRef.current, ctx.ctaRef.current, ctx.floorLineRef.current],
    { autoAlpha: 0, opacity: 0, visibility: "hidden" }
  );
  ctx.applyPortalClip(ctx.maxRadiusPx, 50.0, 50.0);
  if (ctx.irisPortalRef.current) {
    gsap.set(ctx.irisPortalRef.current, { autoAlpha: 1, opacity: 1, clipPath: "circle(150% at 50% 50%)" });
  }
  if (ctx.portalRimRef.current) gsap.set(ctx.portalRimRef.current, { autoAlpha: 0 });
  if (ctx.portalRippleRef.current) gsap.set(ctx.portalRippleRef.current, { autoAlpha: 0 });
  if (ctx.productWorldRef.current) {
    gsap.set(ctx.productWorldRef.current, {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      xPercent: 0,
      yPercent: 0,
      opacity: 1,
    });
  }
  if (ctx.heroIntroRef.current) {
    gsap.set(ctx.heroIntroRef.current, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
  }
  if (ctx.heroVisualRef.current) {
    gsap.set(ctx.heroVisualRef.current, { opacity: 0, scale: 5.5, xPercent: -12.87, yPercent: 0.88 });
  }

  // Reset the cluster's transform to identity BEFORE measuring it —
  // computeDockLayout() reads a live getBoundingClientRect() of this
  // element, so measuring it while it's still offset/rotated from a
  // prior state (e.g. left over from consolidateRingToStack) produces
  // the wrong dock position. See report §1a.
  const clusterEl = ctx.cardsClusterRef.current;
  if (clusterEl) {
    gsap.set(clusterEl, {
      opacity: 1,
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scaleX: 1,
      scaleY: 1,
      scale: 1,
    });
  }

  // Layout measurements via unified dock layout coordinator
  const dockLayout = ctx.computeDockLayout();
  const leftX = dockLayout.targetLeftX;
  const ringY = dockLayout.targetRingY;
  const shiftX = dockLayout.rightShiftX;
  const stackTargetX = dockLayout.stackTargetX;
  const stackTargetY = dockLayout.stackTargetY;

  ctx.origCentersRef.current = ctx.productCards.map(() => ({
    x: stackTargetX,
    y: stackTargetY,
  }));

  // Cards safely stored inside safe (hidden behind closed safe door)
  const allProductCards = ctx.cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
  allProductCards.forEach((wrapper) => {
    gsap.set(wrapper, {
      opacity: 0,
      autoAlpha: 0,
      visibility: "hidden",
    });
  });

  ctx.companionCardRefs.current.forEach((compEl) => {
    if (compEl) gsap.set(compEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
  });

  // Dock safe to left side of viewport
  ctx.stackTargetXRef.current = stackTargetX;
  ctx.stackTargetYRef.current = stackTargetY;
  ctx.cardsToSafeDeltaXRef.current = leftX - stackTargetX;
  ctx.cardsToSafeDeltaYRef.current = ringY - stackTargetY;

  if (ctx.safeContainerRef.current) {
    gsap.set(ctx.safeContainerRef.current, {
      xPercent: -50,
      yPercent: -50,
      x: leftX,
      y: ringY,
      opacity: 1,
      scale: 1,
      autoAlpha: 1,
      visibility: "visible",
    });
  }
  ctx.safeVault3DRef.current?.resetToClosed?.();
  ctx.safeVault3DRef.current?.setCardsProgress?.(0);
  ctx.safeVault3DRef.current?.resumeAmbient?.();

  if (ctx.securityStageRef.current) {
    gsap.set(ctx.securityStageRef.current, { autoAlpha: 1, opacity: 1, visibility: "visible", zIndex: 35 });
  }

  // Reset closing statements clip-paths
  if (ctx.closingBlackTextRef.current) {
    ctx.closingBlackTextRef.current.style.clipPath = "none";
    (ctx.closingBlackTextRef.current.style as any).webkitClipPath = "none";
  }
  if (ctx.closingGreenTextRef.current) {
    ctx.closingGreenTextRef.current.style.clipPath = "none";
    (ctx.closingGreenTextRef.current.style as any).webkitClipPath = "none";
  }

  // Show State 0 and hide all other states
  ctx.securityStateRefs.current.forEach((el, idx) => {
    if (el) {
      if (idx === 0) {
        gsap.set(el, {
          autoAlpha: 1,
          opacity: 1,
          visibility: "visible",
          x: shiftX,
          y: dockLayout.securityHeadingY,
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          clipPath: "none",
        });
      } else {
        gsap.set(el, {
          autoAlpha: 0,
          opacity: 0,
          visibility: "hidden",
          x: shiftX,
          y: dockLayout.securityHeadingY,
          xPercent: -50,
          yPercent: -50,
        });
      }
    }
  });

  if (ctx.securityHeroRibbonRef.current) {
    gsap.set(ctx.securityHeroRibbonRef.current, { x: 0, opacity: 1, clipPath: "none", WebkitClipPath: "none" });
  }

  ctx.playMoneyAnimation();
  ctx.dispatchActiveSection("security");
}

/**
 * Product bento grid — migrated verbatim from `instantShowProduct`.
 */
function resetToProduct(ctx: SceneTransitionContext) {
  ctx.lockScrollYRef.current = 0;
  window.scrollTo(0, 0);
  ctx.stateRef.current = "product";
  ctx.setIsAperturePaused(true);
  ctx.productCompleteRef.current = true;
  ctx.isHoldingProductRef.current = true;
  ctx.transitionStartedRef.current = false;
  ctx.transitionCompleteRef.current = false;
  ctx.dispatchActiveSection("product");

  if (ctx.arrivalIdleTimeoutRef.current) {
    clearTimeout(ctx.arrivalIdleTimeoutRef.current);
    ctx.arrivalIdleTimeoutRef.current = null;
  }
  if (ctx.momentumDrainTimeoutRef.current) {
    clearTimeout(ctx.momentumDrainTimeoutRef.current);
    ctx.momentumDrainTimeoutRef.current = null;
  }

  ctx.companionCardRefs.current.forEach((compEl) => {
    if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
  });
  // Product has no Security content — clear any state (incl. state 7, which
  // carries the About "closing statement" text) left visible from a prior
  // visit to Security/About, so it can't bleed through behind the bento grid.
  hideSecuritySurfaces(ctx);

  pinStage(ctx);
  lockNativeScroll();
  ScrollTrigger.refresh();

  ctx.applyPortalClip(ctx.maxRadiusPx, 50.0, 50.0);
  if (ctx.irisPortalRef.current) gsap.set(ctx.irisPortalRef.current, { autoAlpha: 1 });
  if (ctx.portalRimRef.current) gsap.set(ctx.portalRimRef.current, { autoAlpha: 0 });
  if (ctx.portalRippleRef.current) gsap.set(ctx.portalRippleRef.current, { autoAlpha: 0 });
  if (ctx.productWorldRef.current) {
    gsap.set(ctx.productWorldRef.current, {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      xPercent: 0,
      yPercent: 0,
      opacity: 1,
    });
  }
  if (ctx.heroIntroRef.current) gsap.set(ctx.heroIntroRef.current, { autoAlpha: 0 });
  if (ctx.heroVisualRef.current) {
    gsap.set(ctx.heroVisualRef.current, { opacity: 0, scale: 5.5, xPercent: -12.87, yPercent: 0.88 });
  }
  if (ctx.headerRef.current) gsap.set(ctx.headerRef.current, { autoAlpha: 0 });
  if (ctx.headlineRef.current) gsap.set(ctx.headlineRef.current, { opacity: 0 });
  if (ctx.subheadRef.current) gsap.set(ctx.subheadRef.current, { opacity: 0 });
  if (ctx.ctaRef.current) gsap.set(ctx.ctaRef.current, { opacity: 0, scale: 0.9 });
  if (ctx.cardsClusterRef.current) {
    gsap.set(ctx.cardsClusterRef.current, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
    });
  }
  // Product has no About content — clear the envelope/document UI left
  // visible from a prior visit to About, so it can't bleed through on
  // top of the bento grid.
  hideAboutSurfaces(ctx);
  if (ctx.safeContainerRef.current) {
    gsap.set(ctx.safeContainerRef.current, { opacity: 0, visibility: "hidden" });
    ctx.safeVault3DRef.current?.pauseAmbient?.();
  }

  const { vw, vh } = getComposedViewport(1440, 800);
  ctx.applyBentoLayoutToCards(vw, vh);

  ctx.productCards.forEach((_card, i) => {
    const wrapper = ctx.cardWrapperRefs.current[i];
    const flipper = ctx.cardFlipperRefs.current[i];
    const front = ctx.cardFrontRefs.current[i];
    if (wrapper) {
      gsap.set(wrapper, {
        position: "absolute",
        opacity: 1,
        visibility: "visible",
        x: 0,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
        zIndex: 10 + i,
      });
    }
    if (front) {
      gsap.set(front, {
        borderRadius: "24px",
        background: "",
        backgroundColor: "rgba(220, 235, 226, 0.74)",
        borderColor: "rgba(255, 255, 255, 0.60)",
        boxShadow:
          "0 28px 56px -14px rgba(12, 38, 24, 0.14), 0 10px 24px -8px rgba(34, 197, 94, 0.12), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.08)",
        backdropFilter: "blur(16px)",
      });
    }
    if (ctx.bentoTileContentRefs.current[i]) {
      gsap.set(ctx.bentoTileContentRefs.current[i], { display: "flex", autoAlpha: 1, y: 0 });
    }
    const back = ctx.cardBackRefs.current[i];
    if (back) gsap.set(back, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
    const grad = ctx.cardGradientBgRefs.current[i];
    if (grad) gsap.set(grad, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
    const glass = ctx.cardGlassOverlayRefs.current[i];
    if (glass) gsap.set(glass, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
    if (flipper) gsap.set(flipper, { rotateY: 0 });
    const illus = ctx.cardIllustrationRefs.current[i];
    if (illus) gsap.set(illus, { autoAlpha: 0, visibility: "hidden" });
    const defEl = ctx.cardDefaultRefs.current[i];
    if (defEl) gsap.set(defEl, { autoAlpha: 0, visibility: "hidden" });
    const hoverEl = ctx.cardHoverRefs.current[i];
    if (hoverEl) gsap.set(hoverEl, { autoAlpha: 0, visibility: "hidden" });
  });

  ctx.companionCardRefs.current.forEach((compEl) => {
    if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
  });
}

/**
 * Hero — migrated verbatim from `instantResetHero`.
 */
function resetToHero(ctx: SceneTransitionContext) {
  // Note the card faces: `flipper` is set to `rotateY: 0` and every
  // `cardBackRefs` entry is hidden, i.e. the black obsidian back face is
  // never re-exposed by a reset (report §4 /
  // glitch-fixes Task 6). Preserved exactly — do not reintroduce rotateY: 180.
  ctx.lockScrollYRef.current = 0;
  window.scrollTo(0, 0);
  ctx.stateRef.current = "hero";
  ctx.setIsAperturePaused(false);
  ctx.productCompleteRef.current = false;
  ctx.isHoldingProductRef.current = false;
  ctx.transitionStartedRef.current = false;
  ctx.transitionCompleteRef.current = false;
  ctx.dispatchActiveSection("hero");

  if (ctx.arrivalIdleTimeoutRef.current) {
    clearTimeout(ctx.arrivalIdleTimeoutRef.current);
    ctx.arrivalIdleTimeoutRef.current = null;
  }
  if (ctx.momentumDrainTimeoutRef.current) {
    clearTimeout(ctx.momentumDrainTimeoutRef.current);
    ctx.momentumDrainTimeoutRef.current = null;
  }

  ctx.companionCardRefs.current.forEach((compEl) => {
    if (compEl) gsap.set(compEl, { opacity: 0, visibility: "hidden" });
  });
  // Hero has no Security content — clear any state (incl. state 7, which
  // carries the About "closing statement" text) left visible from a prior
  // visit to Security/About, so it can't bleed through behind Hero/Product.
  // Hero also has no About content — clear the envelope/document UI too.
  hideAboutSurfaces(ctx);
  if (ctx.safeContainerRef.current) {
    gsap.set(ctx.safeContainerRef.current, { opacity: 0, visibility: "hidden" });
    ctx.safeVault3DRef.current?.pauseAmbient?.();
  }
  hideSecuritySurfaces(ctx);

  pinStage(ctx);
  lockNativeScroll();
  ScrollTrigger.refresh();

  ctx.portalState.radius = ctx.initialRadiusPx;
  ctx.portalState.x = 62.87;
  ctx.portalState.y = 49.12;
  ctx.applyPortalClip(ctx.initialRadiusPx, 62.87, 49.12);
  if (ctx.irisPortalRef.current) gsap.set(ctx.irisPortalRef.current, { autoAlpha: 0 });
  if (ctx.portalRimRef.current) gsap.set(ctx.portalRimRef.current, { autoAlpha: 0 });
  if (ctx.portalRippleRef.current) gsap.set(ctx.portalRippleRef.current, { autoAlpha: 0 });
  if (ctx.productWorldRef.current) {
    gsap.set(ctx.productWorldRef.current, {
      scale: 0.24,
      scaleX: 0.30,
      scaleY: 0.20,
      xPercent: 12.87,
      yPercent: -0.88,
      opacity: 0.25,
    });
  }
  if (ctx.heroIntroRef.current) {
    gsap.set(ctx.heroIntroRef.current, { autoAlpha: 1, opacity: 1, x: 0, y: 0, scale: 1 });
  }
  if (ctx.heroVisualRef.current) {
    gsap.set(ctx.heroVisualRef.current, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 });
  }
  if (ctx.headerRef.current) gsap.set(ctx.headerRef.current, { autoAlpha: 0, visibility: "hidden" });
  if (ctx.headlineRef.current) gsap.set(ctx.headlineRef.current, { opacity: 0, y: -25 });
  if (ctx.subheadRef.current) gsap.set(ctx.subheadRef.current, { opacity: 0, y: -15 });
  if (ctx.ctaRef.current) gsap.set(ctx.ctaRef.current, { opacity: 0, scale: 0.9, y: -10 });
  if (ctx.floorLineRef.current) gsap.set(ctx.floorLineRef.current, { autoAlpha: 0, opacity: 0 });
  if (ctx.cardsClusterRef.current) {
    gsap.set(ctx.cardsClusterRef.current, {
      opacity: 1,
      scaleX: 1.25,
      scaleY: 1.4,
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
    });
  }

  ctx.productCards.forEach((card, i) => {
    const wrapper = ctx.cardWrapperRefs.current[i];
    const flipper = ctx.cardFlipperRefs.current[i];
    const front = ctx.cardFrontRefs.current[i];
    const bentoContent = ctx.bentoTileContentRefs.current[i];
    const defEl = ctx.cardDefaultRefs.current[i];
    const hoverEl = ctx.cardHoverRefs.current[i];
    const illus = ctx.cardIllustrationRefs.current[i];
    const grad = ctx.cardGradientBgRefs.current[i];
    const glass = ctx.cardGlassOverlayRefs.current[i];
    const back = ctx.cardBackRefs.current[i];

    if (wrapper) gsap.killTweensOf(wrapper);
    if (flipper) gsap.killTweensOf(flipper);
    if (front) gsap.killTweensOf(front);
    if (bentoContent) gsap.killTweensOf(bentoContent);
    if (defEl) gsap.killTweensOf(defEl);
    if (hoverEl) gsap.killTweensOf(hoverEl);
    if (illus) gsap.killTweensOf(illus);
    if (grad) gsap.killTweensOf(grad);
    if (glass) gsap.killTweensOf(glass);
    if (back) gsap.killTweensOf(back);

    if (bentoContent) gsap.set(bentoContent, { autoAlpha: 0, opacity: 0, y: 14, visibility: "hidden" });
    if (wrapper) {
      const initialXOffset = (i - 2) * -16;
      wrapper.style.position = "";
      wrapper.style.left = "";
      wrapper.style.top = "";
      wrapper.style.width = "";
      wrapper.style.height = "";
      gsap.set(wrapper, {
        opacity: 1,
        visibility: "visible",
        x: initialXOffset,
        y: card.restY,
        z: card.restZ,
        rotateX: 0,
        rotateY: card.restRotateY,
        rotateZ: card.restRotateZ,
        scale: 1,
      });
    }
    if (flipper) gsap.set(flipper, { rotateY: 0 }); // Front face forward always — no black back-face
    if (front) {
      front.style.background = "";
      gsap.set(front, {
        borderRadius: "0px",
        background: "",
        backgroundColor: "rgba(255, 255, 255, 0.74)",
        borderColor: "rgba(255, 255, 255, 0.75)",
        boxShadow:
          "0 20px 45px -12px rgba(16, 44, 28, 0.08), 0 8px 18px -6px rgba(0, 0, 0, 0.04), 0 0 20px -4px rgba(34, 197, 94, 0.08), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95), inset 0 0.5px 0.5px 0 rgba(255, 255, 255, 0.8), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.06)",
        clearProps: "background",
      });
    }
    if (back) gsap.set(back, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
    if (grad) gsap.set(grad, { opacity: 1, autoAlpha: 1, visibility: "visible", display: "block" });
    if (glass) gsap.set(glass, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
    if (illus)
      gsap.set(illus, {
        display: "flex",
        opacity: 0.88,
        autoAlpha: 1,
        visibility: "visible",
        scale: 1,
        filter: "blur(0px)",
      });
    if (defEl) gsap.set(defEl, { display: "flex", opacity: 1, autoAlpha: 1, visibility: "visible", scale: 1, y: 0 });
    if (hoverEl) gsap.set(hoverEl, { display: "flex", opacity: 0, autoAlpha: 0, visibility: "hidden", scale: 1, y: 8 });
  });
}

/**
 * About — migrated verbatim from `instantShowAbout`.
 */
function resetToAbout(ctx: SceneTransitionContext) {
  ctx.isRingConsolidatedRef.current = true;
  ctx.isHoldingProductRef.current = false;
  ctx.productCompleteRef.current = true;
  ctx.transitionStartedRef.current = true;
  ctx.transitionCompleteRef.current = true;
  ctx.stateRef.current = "about";
  ctx.lastSecurityScrollTimeRef.current = Date.now();

  // Pin stage & lock scroll at top 0
  ctx.lockScrollYRef.current = 0;
  window.scrollTo(0, 0);
  lockNativeScroll();

  pinStage(ctx);
  if (ctx.stageRef.current) {
    gsap.set(ctx.stageRef.current, {
      opacity: 1,
      visibility: "visible",
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
    });
  }

  // Hide Hero, Product, Safe Vault, and Security elements
  gsap.set(
    [ctx.headerRef.current, ctx.headlineRef.current, ctx.ctaRef.current, ctx.floorLineRef.current],
    { autoAlpha: 0, opacity: 0, visibility: "hidden" }
  );
  ctx.applyPortalClip(ctx.maxRadiusPx, 50.0, 50.0);
  if (ctx.irisPortalRef.current) {
    gsap.set(ctx.irisPortalRef.current, { autoAlpha: 1, opacity: 1, clipPath: "circle(150% at 50% 50%)" });
  }
  if (ctx.portalRimRef.current) gsap.set(ctx.portalRimRef.current, { autoAlpha: 0 });
  if (ctx.portalRippleRef.current) gsap.set(ctx.portalRippleRef.current, { autoAlpha: 0 });
  if (ctx.productWorldRef.current) {
    gsap.set(ctx.productWorldRef.current, {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      xPercent: 0,
      yPercent: 0,
      opacity: 1,
    });
  }
  if (ctx.heroIntroRef.current) {
    gsap.set(ctx.heroIntroRef.current, { autoAlpha: 0, opacity: 0, visibility: "hidden" });
  }
  if (ctx.heroVisualRef.current) {
    gsap.set(ctx.heroVisualRef.current, { opacity: 0, scale: 5.5, xPercent: -12.87, yPercent: 0.88 });
  }

  hideSecuritySurfaces(ctx);

  if (ctx.safeContainerRef.current) {
    gsap.set(ctx.safeContainerRef.current, { opacity: 0, visibility: "hidden" });
    // report §7 — door progress + accumulating rim angle reset together.
    ctx.safeVault3DRef.current?.resetToClosed?.();
    ctx.safeVault3DRef.current?.setCardsProgress?.(0);
    ctx.safeVault3DRef.current?.pauseAmbient?.();
  }

  // Hide all 26 product and companion cards
  const allProductCardsAbout = ctx.cardWrapperRefs.current.slice(0, 5).filter(Boolean) as HTMLElement[];
  const allCompanionCardsAbout = ctx.companionCardRefs.current.slice(0, 21).filter(Boolean) as HTMLElement[];
  [...allProductCardsAbout, ...allCompanionCardsAbout].forEach((cardEl) => {
    if (cardEl) gsap.set(cardEl, { opacity: 0, autoAlpha: 0, visibility: "hidden" });
  });

  if (ctx.cardsStageRef.current) {
    ctx.cardsStageRef.current.style.pointerEvents = "";
    gsap.set(ctx.cardsStageRef.current, {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
      perspective: "1400px",
    });
  }

  // Setup About Page 1 elements in settled state
  const isDeskAbout = typeof window !== "undefined" && window.innerWidth >= 1024;
  const isTabAbout = typeof window !== "undefined" && window.innerWidth >= 768;
  const stackCardScale = isDeskAbout ? 0.60 : isTabAbout ? 0.56 : 0.52;
  const targetEnvelopeY = isDeskAbout ? 90 : isTabAbout ? 70 : 50;

  if (ctx.unifiedEnvelopeRef.current) {
    gsap.set(ctx.unifiedEnvelopeRef.current, {
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

  if (ctx.envelopeTopFlapRef.current) {
    gsap.set(ctx.envelopeTopFlapRef.current, { rotateX: -175, zIndex: 0, opacity: 0 });
  }
  if (ctx.envelopeSealRef.current) {
    gsap.set(ctx.envelopeSealRef.current, { opacity: 0, visibility: "hidden" });
  }
  if (ctx.docCavityWrapperRef.current) {
    gsap.set(ctx.docCavityWrapperRef.current, {
      zIndex: 35,
      visibility: "visible",
      opacity: 1,
      autoAlpha: 1,
      clipPath: "none",
      WebkitClipPath: "none",
    });
  }
  if (ctx.philosophyDocRef.current) {
    gsap.set(ctx.philosophyDocRef.current, {
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
  if (ctx.docPaperSheetRef.current) {
    gsap.set(ctx.docPaperSheetRef.current, { height: 930, scale: 1, scaleX: 1, scaleY: 1 });
  }
  if (ctx.docInkCopyRef.current) {
    gsap.set(ctx.docInkCopyRef.current, {
      clipPath: "inset(0 0 0% 0)",
      WebkitClipPath: "inset(0 0 0% 0)",
      opacity: 1,
      visibility: "visible",
      filter: "none",
    });
  }

  ctx.aboutDocPageRef.current = 1;
  ctx.isFlippingDocRef.current = false;
  if (ctx.docFlipperRef.current) {
    gsap.set(ctx.docFlipperRef.current, { rotateY: 0, z: 0 });
  }

  if (ctx.cardsClusterRef.current) {
    gsap.set(ctx.cardsClusterRef.current, {
      x: 0,
      y: targetEnvelopeY + 140,
      rotateZ: 0,
      rotateX: 0,
      rotateY: 0,
      scale: stackCardScale,
      scaleX: stackCardScale,
      scaleY: stackCardScale,
      opacity: 1,
    });
  }

  if (ctx.aboutContentRef.current) {
    gsap.set(ctx.aboutContentRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      visibility: "visible",
    });
  }

  ctx.dispatchActiveSection("about");
}

/**
 * Shared body for the two native-scroll destinations (FAQ and Contact). Both
 * previously lived as `instantShowFaq` / `instantShowContact`, two functions whose
 * bodies were byte-identical apart from the element id and the active-section name
 * — exactly the duplication this task exists to remove.
 *
 * Both park the engine in `stateRef.current === "faq"` (Contact is not its own
 * pinned scene; it is further down the same native-scroll region), release the
 * overflow lock, unpin the stage, and smooth-scroll to the target element.
 */
function resetToNativeScrollSection(
  ctx: SceneTransitionContext,
  elementId: string,
  activeSection: string
) {
  ctx.stateRef.current = "faq";
  ctx.lockScrollYRef.current = -1;

  releaseNativeScroll();
  unpinStage(ctx);

  hideAboutSurfaces(ctx);
  // Deliberate widening vs. the old instantShowFaq/instantShowContact, which hid
  // only `securityStageRef` and left the individual sub-state headings alone:
  // hiding both is what the other four states already do, and sub-state 7 carries
  // the About "closing statement" copy that report §0/§3 describes bleeding into
  // later sections.
  hideSecuritySurfaces(ctx);
  if (ctx.safeContainerRef.current) {
    gsap.set(ctx.safeContainerRef.current, { opacity: 0, visibility: "hidden" });
    ctx.safeVault3DRef.current?.pauseAmbient?.();
  }

  ScrollTrigger.refresh();

  const el = document.getElementById(elementId);
  if (el) {
    smoothScrollTo(el, { offset: 70, duration: 0.5, ease: "power2.out" });
  }
  ctx.dispatchActiveSection(activeSection);
}
