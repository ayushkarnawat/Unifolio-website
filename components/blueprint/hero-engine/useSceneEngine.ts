"use client";

import { useRef, useState, type MutableRefObject } from "react";
import type { SceneState, SceneAction } from "./types";
import type { ScrollTrigger } from "@/lib/gsap";

export interface SceneHandlers {
  /** Forward gesture while this scene is the current scene. */
  trigger?: (action: SceneAction) => void;
  /** Backward gesture while this scene is the current scene. */
  reverse?: (action: SceneAction) => void;
  /** Native scroll drifted out of this scene's pinned range — force a reset. */
  onScrollDrift?: () => void;
}

/**
 * useSceneEngine — completely passive state container after cross-section scroll
 * choreography removal.
 *
 * All wheel, touch, keydown, and scroll hijacking listeners, busy-flag debounce loops,
 * and safety valve timers are completely deleted. The browser now handles all scrolling
 * natively.
 */
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
  const touchStartYRef = useRef<number>(0);
  const aboutDocPageRef = useRef<1 | 2>(1);
  const isFlippingDocRef = useRef<boolean>(false);
  const isRingConsolidatedRef = useRef<boolean>(false);

  function registerScene(_name: SceneState, _handlers: SceneHandlers) {}
  function armBusySafetyValve(_flagRef: MutableRefObject<boolean>, _maxMs: number) {
    return () => {};
  }
  function disarmBusySafetyValve(_flagRef: MutableRefObject<boolean>) {}

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
