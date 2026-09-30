export type SceneState = "hero" | "product-resting" | "product" | "sculpting" | "ring" | "about" | "faq";

// Describes, without referencing any scene-specific function directly, which single
// scene-specific action a gesture/keystroke resolved to inside useSceneEngine's
// gating logic. The engine hands the resolved action to the current scene's
// registered `trigger` (forward gesture) or `reverse` (backward gesture) handler —
// see `SceneHandlers` in useSceneEngine.ts. Resolving in the engine and carrying the
// result in the payload is what lets a two-handler-per-scene API cover the scenes
// whose forward/backward gesture maps to more than one possible action (ring's
// sub-state stepping vs. its consolidation; about's doc-flip vs. its section exit)
// without any gating/routing logic being re-derived in a scene file.
//
// Note these are the *organic, scroll-driven* micro-transitions. The "jump directly
// to macro state X" family is a separate concern owned by `resetToState` in
// sceneTransitions.ts, which nav clicks, "Back to Top" and scroll-drift recovery use.
export type SceneAction =
  | { type: "heroToProduct" }
  | { type: "productToHero" }
  | { type: "productToRing" }
  | { type: "bentoToResting" }
  | { type: "restingToBento" }
  | { type: "ringToProduct" }
  | { type: "goToSecurityState"; index: number; direction: 1 | -1 }
  | { type: "consolidateRingToStack" }
  | { type: "restoreStackToRing" }
  | { type: "flipDocToPage"; page: 1 | 2 }
  | { type: "exitAboutToFaq" }
  | { type: "jumpToAboutState"; page: 1 | 2 };
