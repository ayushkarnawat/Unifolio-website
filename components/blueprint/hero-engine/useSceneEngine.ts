"use client";

import { useRef, useState, useEffect, type MutableRefObject } from "react";
import type { SceneState, SceneAction } from "./types";
import type { ScrollTrigger } from "@/lib/gsap";
import { SECURITY_STATES } from "../BlueprintHero";

/**
 * Per-scene gesture registration (Task 4, Step 0 — replaces Task 2's temporary
 * `registerHandlers` seam).
 *
 * Handlers are registered **against the scene the gesture originates in**, which is
 * exactly how this hook's handleWheel/handleTouchMove/handleKeyDown are already
 * structured: every leaf call site lives inside a `stateRef.current === "<scene>"`
 * branch. So the hook looks up `sceneHandlersRef.current.get(stateRef.current)` and
 * calls `trigger` for a forward gesture (wheel down / swipe up / ArrowDown-PageDown-
 * Space) or `reverse` for a backward one (wheel up / swipe down / ArrowUp-PageUp-
 * Shift+Space).
 *
 * `trigger`/`reverse` receive the `SceneAction` the hook's own gating already
 * resolved to. This is the reconciliation between the brief's two-field
 * `{ trigger, reverse }` shape and what Task 2 actually built: a forward gesture in
 * `ring` is not one fixed action — depending on `currentSecurityStateRef` and
 * `isRingConsolidatedRef` it is `goToSecurityState(+1)` *or* `consolidateRingToStack`,
 * and a backward gesture in `about` is `flipDocToPage(1)` *or* `restoreStackToRing`.
 * Passing the resolved action keeps 100% of that gating inside this hook (nothing is
 * re-derived by the scene) while still giving scene files the exact two field names
 * the plan binds for Tasks 5-8: `engine.registerScene("hero", { trigger, reverse })`.
 * A scene whose forward/backward gesture maps to a single action can simply ignore
 * the parameter.
 *
 * `onScrollDrift` is not a gesture: it is the "user's real scrollY drifted above the
 * About pin" recovery path from handleScrollLock, which resets the page back to the
 * Security scene. Only the `about` scene registers it.
 */
export interface SceneHandlers {
  /** Forward gesture while this scene is the current scene. */
  trigger?: (action: SceneAction) => void;
  /** Backward gesture while this scene is the current scene. */
  reverse?: (action: SceneAction) => void;
  /** Native scroll drifted out of this scene's pinned range — force a reset. */
  onScrollDrift?: () => void;
}

export function useSceneEngine() {
  const stateRef = useRef<SceneState>("hero");
  const currentSecurityStateRef = useRef<number>(0);
  const [isAperturePaused, setIsAperturePaused] = useState(false);
  const productCompleteRef = useRef<boolean>(false);
  const isHoldingProductRef = useRef<boolean>(false);
  const transitionStartedRef = useRef<boolean>(false);
  const transitionAnimatingRef = useRef<boolean>(false);
  const transitionCompleteRef = useRef<boolean>(false);
  const isSecurityTransitioningRef = useRef<boolean>(false);
  const isNavigatingRef = useRef<boolean>(false);
  const hasTriggeredThisGestureRef = useRef<boolean>(false);
  const wheelGestureActiveRef = useRef<boolean>(false);
  const wheelGestureEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchGestureActiveRef = useRef<boolean>(false);
  const lastSecurityScrollTimeRef = useRef<number>(0);
  const lockScrollYRef = useRef<number>(0);
  const resizeReflowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const momentumDrainTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrivalIdleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apertureScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const targetNavSectionRef = useRef<string | null>(null);
  const pendingNavSectionRef = useRef<string | null>(null);

  // Added per controller ruling on Task 2 gaps (see task-2-report.md):
  // - touchStartYRef: was a plain `let touchStartY` shared by handleTouchStart/
  //   handleTouchMove/handleTouchEnd, all three of which move here together as one
  //   cohesive touch-gesture unit. Promoted to a ref so it can be shared the same
  //   way across the three closures now that they live in the hook.
  // - aboutDocPageRef / isFlippingDocRef / isRingConsolidatedRef: busy-flag-shaped
  //   refs read directly in the moved handlers' gating logic. Only the refs move
  //   here; the About/Ring scene functions that also read/write them stay in
  //   BlueprintHero.tsx until Tasks 7/8 migrate those scenes, writing via
  //   `engine.aboutDocPageRef.current = ...` etc. in the meantime.
  const touchStartYRef = useRef<number>(0);
  const aboutDocPageRef = useRef<1 | 2>(1);
  const isFlippingDocRef = useRef<boolean>(false);
  const isRingConsolidatedRef = useRef<boolean>(false);

  const sceneHandlersRef = useRef<Map<SceneState, SceneHandlers>>(new Map());

  function registerScene(name: SceneState, handlers: SceneHandlers) {
    sceneHandlersRef.current.set(name, handlers);
  }

  // Safety valve: guards against a busy-flag (transitionAnimatingRef,
  // isSecurityTransitioningRef, isNavigatingRef) getting stuck `true` forever
  // if the GSAP timeline that was supposed to flip it back to `false` gets
  // killed (e.g. via .kill() on rapid re-entry, or a thrown error mid-callback)
  // without its normal onComplete/onReverseComplete firing. Root cause of a
  // real reported bug: scroll permanently locking up. Callers arm this with a
  // generous per-transition ceiling right after setting a flag true, and
  // disarm it the moment the flag is legitimately cleared; if disarm never
  // happens, the timer force-clears the flag so wheel/touch/key input is
  // never blocked forever.
  const safetyValveTimersRef = useRef<Map<MutableRefObject<boolean>, ReturnType<typeof setTimeout>>>(new Map());

  function armBusySafetyValve(flagRef: MutableRefObject<boolean>, maxMs: number) {
    const existing = safetyValveTimersRef.current.get(flagRef);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      flagRef.current = false;
      safetyValveTimersRef.current.delete(flagRef);
    }, maxMs);
    safetyValveTimersRef.current.set(flagRef, timer);
  }

  function disarmBusySafetyValve(flagRef: MutableRefObject<boolean>) {
    const existing = safetyValveTimersRef.current.get(flagRef);
    if (existing) {
      clearTimeout(existing);
      safetyValveTimersRef.current.delete(flagRef);
    }
  }

  useEffect(() => {
    // Route a resolved SceneAction to the currently-active scene's registered
    // forward/backward handler. All gating/debouncing has already happened by the
    // time these are called — they are pure delivery.
    const emitForward = (action: SceneAction) => {
      sceneHandlersRef.current.get(stateRef.current)?.trigger?.(action);
    };
    const emitBackward = (action: SceneAction) => {
      sceneHandlersRef.current.get(stateRef.current)?.reverse?.(action);
    };

    const handleWheel = (e: WheelEvent) => {
      // Refresh gesture timer on every wheel tick to isolate discrete physical swipes (400ms decay window)
      if (wheelGestureEndTimerRef.current) {
        clearTimeout(wheelGestureEndTimerRef.current);
      }
      wheelGestureEndTimerRef.current = setTimeout(() => {
        wheelGestureActiveRef.current = false;
        hasTriggeredThisGestureRef.current = false;
      }, 180);

      // 1. Block all wheel inputs while transition is animating or navbar navigation is in progress
      if (transitionAnimatingRef.current || isNavigatingRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      // Unconditionally prevent native window scrolling during all fixed slide states
      // (hero, product-resting, product, ring, about). This completely stops trackpad
      // micro-ticks (<8px) and inertia deltas from initiating compositor scroll fighting.
      if (stateRef.current !== "faq") {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      // 1b. If in About section: scroll-driven 3D physical page flip
      if (stateRef.current === "about") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (hasTriggeredThisGestureRef.current) {
          if (!isSecurityTransitioningRef.current && !isFlippingDocRef.current && Date.now() - lastSecurityScrollTimeRef.current >= 280) {
            hasTriggeredThisGestureRef.current = false;
          } else {
            return;
          }
        }
        if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;

        if (e.deltaY > 8) {
          if (Date.now() - lastSecurityScrollTimeRef.current < 140) return;
          hasTriggeredThisGestureRef.current = true;
          lastSecurityScrollTimeRef.current = Date.now();
          if (aboutDocPageRef.current === 1) {
            emitForward({ type: "flipDocToPage", page: 2 });
          } else {
            emitForward({ type: "exitAboutToFaq" });
          }
          return;
        } else if (e.deltaY < -8) {
          if (Date.now() - lastSecurityScrollTimeRef.current < 140) return;
          hasTriggeredThisGestureRef.current = true;
          lastSecurityScrollTimeRef.current = Date.now();
          if (aboutDocPageRef.current === 2) {
            emitBackward({ type: "flipDocToPage", page: 1 });
          } else {
            emitBackward({ type: "restoreStackToRing" });
          }
          return;
        }
        return;
      }

      // 1c. If in FAQ / content sections:
      if (stateRef.current === "faq") {
        // Downward scroll: native smooth scroll through FAQ, Contact, and footer
        if (e.deltaY > 0) {
          return;
        }
        // Upward scroll at or near the top of FAQ: gracefully re-enter About
        const faqEl = document.getElementById("faq");
        const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
        if (e.deltaY < -10 && window.scrollY <= Math.max(100, faqTop - 50)) {
          if (hasTriggeredThisGestureRef.current) return;
          if (Date.now() - lastSecurityScrollTimeRef.current < 150) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          hasTriggeredThisGestureRef.current = true;
          lastSecurityScrollTimeRef.current = Date.now();
          emitBackward({ type: "jumpToAboutState", page: 2 });
          return;
        }
        return;
      }

      // 2. While in Ring state with Security Content experience active:
      // The viewport/page must remain fixed while progressing through discrete states
      if (stateRef.current === "ring" && transitionCompleteRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // A state transition is already animating or gesture is locked:
        // ignore every extra wheel tick from this gesture so one trackpad swipe
        // — regardless of velocity or momentum duration — only ever advances a single state.
        if (hasTriggeredThisGestureRef.current) {
          if (!isSecurityTransitioningRef.current && Date.now() - lastSecurityScrollTimeRef.current >= 240) {
            hasTriggeredThisGestureRef.current = false;
          } else {
            return;
          }
        }
        if (isSecurityTransitioningRef.current) return;

        // Responsive scrolling cadence between states
        if (Date.now() - lastSecurityScrollTimeRef.current < 120) return;

        if (e.deltaY > 8) {
          hasTriggeredThisGestureRef.current = true;
          lastSecurityScrollTimeRef.current = Date.now();
          // One intentional downward scroll = exactly one next state
          if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
            emitForward({
              type: "goToSecurityState",
              index: currentSecurityStateRef.current + 1,
              direction: 1,
            });
          } else {
            // At final security state (State 7):
            // First downward scroll triggers consolidation of the ring into the horizontal stack
            if (!isRingConsolidatedRef.current) {
              emitForward({ type: "consolidateRingToStack" });
            }
            // Once consolidated, hold in place — do not begin next movement yet
          }
          return;
        } else if (e.deltaY < -8) {
          hasTriggeredThisGestureRef.current = true;
          lastSecurityScrollTimeRef.current = Date.now();
          // If at final state and stack is consolidated, scroll up reverses consolidation and restores ring
          if (currentSecurityStateRef.current === SECURITY_STATES.length - 1 && isRingConsolidatedRef.current) {
            emitBackward({ type: "restoreStackToRing" });
            return;
          }
          // One intentional upward scroll = exactly one previous state
          if (currentSecurityStateRef.current > 0) {
            emitBackward({
              type: "goToSecurityState",
              index: currentSecurityStateRef.current - 1,
              direction: -1,
            });
          } else {
            // At State 1 Hero -> scroll up returns to Product cards
            emitBackward({ type: "ringToProduct" });
          }
          return;
        }
        return;
      }

      // 3. If in Product section (Bento):
      if (stateRef.current === "product") {
        if (e.deltaY > 8) {
          // User scrolled downward: transition to Security!
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "productToRing" });
          return;
        } else if (e.deltaY < -8 && window.scrollY <= 10) {
          // User scrolled upward: return to resting amphitheater state
          e.preventDefault();
          e.stopImmediatePropagation();
          emitBackward({ type: "bentoToResting" });
          return;
        }
        return;
      }

      // 3b. If in Product Resting section (Amphitheater with Hero content):
      if (stateRef.current === "product-resting") {
        if (e.deltaY > 8) {
          // User scrolled downward: trigger bento transformation!
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "restingToBento" });
          return;
        } else if (e.deltaY < -8) {
          // User scrolled upward: return to Hero section
          e.preventDefault();
          e.stopImmediatePropagation();
          emitBackward({ type: "productToHero" });
          return;
        }
        return;
      }

      // 4. If in Hero section: first downward scroll gesture acts as single trigger
      if (stateRef.current === "hero") {
        if (e.deltaY > 8) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "heroToProduct" });
          return;
        } else if (e.deltaY < -8) {
          e.preventDefault();
          return;
        }
        return;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchGestureActiveRef.current = false;
    };

    const handleTouchEnd = () => {
      touchGestureActiveRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (transitionAnimatingRef.current || isNavigatingRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (stateRef.current === "about") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;

        const touchY = e.touches[0].clientY;
        const touchDeltaY = touchStartYRef.current - touchY;

        if (touchDeltaY > 12) {
          touchStartYRef.current = touchY;
          if (Date.now() - lastSecurityScrollTimeRef.current < 150) return;
          if (aboutDocPageRef.current === 1) {
            emitForward({ type: "flipDocToPage", page: 2 });
          } else {
            emitForward({ type: "exitAboutToFaq" });
          }
          return;
        } else if (touchDeltaY < -12) {
          touchStartYRef.current = touchY;
          if (Date.now() - lastSecurityScrollTimeRef.current < 150) return;
          if (aboutDocPageRef.current === 2) {
            emitBackward({ type: "flipDocToPage", page: 1 });
          } else {
            emitBackward({ type: "restoreStackToRing" });
          }
          return;
        }
        return;
      }

      if (stateRef.current === "faq") {
        const touchY = e.touches[0].clientY;
        const touchDeltaY = touchStartYRef.current - touchY;
        if (touchDeltaY > 0) {
          return;
        }
        const faqEl = document.getElementById("faq");
        const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
        if (touchDeltaY < -12 && window.scrollY <= faqTop + 30) {
          touchStartYRef.current = touchY;
          if (Date.now() - lastSecurityScrollTimeRef.current < 150) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          emitBackward({ type: "jumpToAboutState", page: 2 });
          return;
        }
        return;
      }

      if (stateRef.current === "ring" && transitionCompleteRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (Date.now() - lastSecurityScrollTimeRef.current < 120) return;

        const touchDeltaY = touchStartYRef.current - e.touches[0].clientY;
        if (touchDeltaY > 16) {
          lastSecurityScrollTimeRef.current = Date.now();
          touchStartYRef.current = e.touches[0].clientY;
          if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
            emitForward({
              type: "goToSecurityState",
              index: currentSecurityStateRef.current + 1,
              direction: 1,
            });
          } else {
            if (!isRingConsolidatedRef.current) {
              emitForward({ type: "consolidateRingToStack" });
            }
          }
          return;
        } else if (touchDeltaY < -16) {
          lastSecurityScrollTimeRef.current = Date.now();
          touchStartYRef.current = e.touches[0].clientY;
          if (currentSecurityStateRef.current === SECURITY_STATES.length - 1 && isRingConsolidatedRef.current) {
            emitBackward({ type: "restoreStackToRing" });
            return;
          }
          if (currentSecurityStateRef.current > 0) {
            emitBackward({
              type: "goToSecurityState",
              index: currentSecurityStateRef.current - 1,
              direction: -1,
            });
          } else {
            emitBackward({ type: "ringToProduct" });
          }
          return;
        }
        return;
      }

      // Unconditionally prevent touch dragging from scrolling window in non-faq states
      e.preventDefault();
      e.stopImmediatePropagation();

      const touchDeltaY = touchStartYRef.current - e.touches[0].clientY;

      if (stateRef.current === "product") {
        if (touchDeltaY > 8) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "productToRing" });
          return;
        } else if (touchDeltaY < -8 && window.scrollY <= 10) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitBackward({ type: "bentoToResting" });
          return;
        }
        return;
      }

      if (stateRef.current === "product-resting") {
        if (touchDeltaY > 8) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "restingToBento" });
          return;
        } else if (touchDeltaY < -8) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitBackward({ type: "productToHero" });
          return;
        }
        return;
      }

      if (stateRef.current === "hero") {
        if (touchDeltaY > 8) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "heroToProduct" });
          return;
        } else if (touchDeltaY < -8) {
          e.preventDefault();
          return;
        }
        return;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (transitionAnimatingRef.current || isNavigatingRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (stateRef.current === "hero") {
        if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "heroToProduct" });
          return;
        }
        return;
      }

      if (stateRef.current === "about") {
        if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;
          if (Date.now() - lastSecurityScrollTimeRef.current < 250) return;
          if (aboutDocPageRef.current === 1) {
            emitForward({ type: "flipDocToPage", page: 2 });
          } else {
            emitForward({ type: "exitAboutToFaq" });
          }
          return;
        } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (isSecurityTransitioningRef.current || isFlippingDocRef.current) return;
          if (Date.now() - lastSecurityScrollTimeRef.current < 250) return;
          if (aboutDocPageRef.current === 2) {
            emitBackward({ type: "flipDocToPage", page: 1 });
          } else {
            emitBackward({ type: "restoreStackToRing" });
          }
          return;
        }
      }

      if (stateRef.current === "ring" && transitionCompleteRef.current) {
        if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (Date.now() - lastSecurityScrollTimeRef.current < 220) return;

          if (currentSecurityStateRef.current < SECURITY_STATES.length - 1) {
            emitForward({
              type: "goToSecurityState",
              index: currentSecurityStateRef.current + 1,
              direction: 1,
            });
          } else {
            if (!isRingConsolidatedRef.current) {
              emitForward({ type: "consolidateRingToStack" });
            }
          }
          return;
        } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (Date.now() - lastSecurityScrollTimeRef.current < 220) return;

          if (currentSecurityStateRef.current === SECURITY_STATES.length - 1 && isRingConsolidatedRef.current) {
            emitBackward({ type: "restoreStackToRing" });
            return;
          }
          if (currentSecurityStateRef.current > 0) {
            emitBackward({
              type: "goToSecurityState",
              index: currentSecurityStateRef.current - 1,
              direction: -1,
            });
          } else {
            emitBackward({ type: "ringToProduct" });
          }
          return;
        }
      }

      if (stateRef.current === "product-resting") {
        if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "restingToBento" });
          return;
        } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitBackward({ type: "productToHero" });
          return;
        }
        return;
      }

      if (stateRef.current === "product") {
        if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          emitForward({ type: "productToRing" });
          return;
        } else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
          if (window.scrollY <= 10) {
            e.preventDefault();
            e.stopImmediatePropagation();
            emitBackward({ type: "bentoToResting" });
            return;
          }
        }
        return;
      }

      if (stateRef.current === "faq") {
        if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
          const faqEl = document.getElementById("faq");
          const faqTop = faqEl ? faqEl.offsetTop : window.innerHeight;
          if (window.scrollY <= faqTop + 30) {
            e.preventDefault();
            e.stopImmediatePropagation();
            emitBackward({ type: "jumpToAboutState", page: 2 });
            return;
          }
        }
        return;
      }
    };

    const handleScrollLock = () => {
      if (isNavigatingRef.current || stateRef.current === "faq") return;
      if (
        transitionAnimatingRef.current ||
        stateRef.current === "hero" ||
        stateRef.current === "product-resting" ||
        stateRef.current === "product" ||
        (stateRef.current === "ring" && transitionCompleteRef.current)
      ) {
        if (lockScrollYRef.current >= 0 && Math.abs(window.scrollY - lockScrollYRef.current) > 1) {
          window.scrollTo(0, lockScrollYRef.current);
        }
      } else if (stateRef.current === "about") {
        const pinEnd = lockScrollYRef.current || 0;
        if (pinEnd > 0 && window.scrollY < pinEnd - 20) {
          sceneHandlersRef.current.get("about")?.onScrollDrift?.();
        }
      }
    };

    window.addEventListener("scroll", handleScrollLock, { passive: true, capture: true });
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("scroll", handleScrollLock, { capture: true } as EventListenerOptions);
      window.removeEventListener("wheel", handleWheel, { capture: true } as EventListenerOptions);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove, { capture: true } as EventListenerOptions);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as EventListenerOptions);
      if (wheelGestureEndTimerRef.current) {
        clearTimeout(wheelGestureEndTimerRef.current);
        wheelGestureEndTimerRef.current = null;
      }
      // Clear any still-armed safety-valve timers so they don't fire (and touch
      // a stale flagRef) after this hook instance has unmounted.
      safetyValveTimersRef.current.forEach((timer) => clearTimeout(timer));
      safetyValveTimersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stateRef,
    currentSecurityStateRef,
    isAperturePaused,
    setIsAperturePaused,
    productCompleteRef,
    isHoldingProductRef,
    transitionStartedRef,
    transitionAnimatingRef,
    transitionCompleteRef,
    isSecurityTransitioningRef,
    isNavigatingRef,
    hasTriggeredThisGestureRef,
    wheelGestureActiveRef,
    wheelGestureEndTimerRef,
    touchGestureActiveRef,
    lastSecurityScrollTimeRef,
    lockScrollYRef,
    resizeReflowTimeoutRef,
    momentumDrainTimeoutRef,
    arrivalIdleTimeoutRef,
    apertureScrollTriggerRef,
    targetNavSectionRef,
    pendingNavSectionRef,
    touchStartYRef,
    aboutDocPageRef,
    isFlippingDocRef,
    isRingConsolidatedRef,
    registerScene,
    armBusySafetyValve,
    disarmBusySafetyValve,
  };
}

export type SceneEngine = ReturnType<typeof useSceneEngine>;
