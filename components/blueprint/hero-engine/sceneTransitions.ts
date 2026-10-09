"use client";

import type { SceneState } from "./types";

export type SceneResetTarget = SceneState | "contact";

export interface SceneTransitionContext {
  [key: string]: any;
}

/**
 * lockNativeScroll & releaseNativeScroll:
 * Completely neutralized safe no-ops now that scroll hijacking has been removed.
 */
export function lockNativeScroll() {}
export function releaseNativeScroll() {}

/**
 * resetToState:
 * Replaces the multi-branch stage-pinning state jump with plain native smooth scroll.
 */
export function resetToState(target: SceneResetTarget, _ctx?: SceneTransitionContext) {
  if (target === "hero") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const sectionId = target === "ring" ? "security" : target;
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
