# BlueprintHero.tsx File-Split Design

**Date:** 2026-09-22
**Status:** Design only — no code changed by this document. This is the architecture we discussed (split by *responsibility*, not just by cutting the file into three chunks of JSX), written up in full so it can be turned into an execution plan once reviewed.
**Depends on:** `Docs/2026-09-22-scroll-and-animation-glitch-root-cause-report.md` (root causes) and `Docs/2026-09-22-glitch-fixes-implementation-plan.md` (the 7 in-place fixes — do those first; this split is the *next* project, not a replacement for them).

---

## 0. Why split, and why *this* split

Recap from our discussion: splitting the file by itself fixes nothing. What fixes the bugs is that today, three unrelated concerns are tangled together in every one of ~9 duplicated functions in `BlueprintHero.tsx`:

1. **Scene content** — what a section looks like and how it animates (Hero's ring, the bento tiles, the vault, About's envelope).
2. **The state machine** — which section is "current," whether an animation is in flight, whether input is allowed right now.
3. **Shared layout math** — where things sit on screen (the vault's dock position, the bento grid's geometry).

Because concern #2 and #3 are copy-pasted into every "instant jump" function that touches concern #1, there's no single place that guarantees a reset is exhaustive — which is the direct cause of Glitches 1, 2, 3, 4, and 7 in the report. **The split below separates these three concerns into three kinds of module, so each one has exactly one owner.** That's what actually prevents the bug class from recurring — the file boundaries are just where that separation becomes visible and enforced.

---

## 1. The new file layout

```
lib/
  viewport.ts                        (existing, unchanged)
  dockLayout.ts                      (NEW — pure layout math)

components/blueprint/
  BlueprintHero.tsx                  (existing file — becomes a thin orchestrator, ~200-400 lines)
  hero-engine/
    types.ts                        (NEW — shared TS types for the engine + scenes)
    useSceneEngine.ts                (NEW — the state machine + input handling)
    sceneTransitions.ts              (NEW — the ONE canonical reset/jump function)
  scenes/
    HeroScene.tsx                    (NEW)
    ProductBentoScene.tsx             (NEW)
    SecurityVaultScene.tsx            (NEW)
    AboutScene.tsx                    (NEW)

  SafeVault3D.tsx                    (existing, unchanged — already its own file, already clean)
```

Nothing outside `components/blueprint/` changes. `app/page.tsx` still just renders `<BlueprintHero />` — this is an internal reorganization, not a change to the page structure.

---

## 2. What each new file owns

### `lib/dockLayout.ts` — pure geometry, no refs, no GSAP

**Owns:** the math that decides *where things sit* — today's `computeDockLayout()` and `computeBentoLayout()`, extracted as pure functions.

```ts
export interface DockLayoutInput {
  liveW: number;              // from getComposedViewport() — already clamped
  liveH: number;
  clusterCenterX: number;     // from cardsClusterRef.getBoundingClientRect() — measured by the caller
  clusterCenterY: number;
  clusterW: number;
  clusterH: number;
}

export interface DockLayout {
  targetLeftX: number;
  targetRingY: number;
  rightShiftX: number;
  heroShiftX: number;
  securityHeadingY: number;
  stackTargetX: number;
  stackTargetY: number;
  effectiveVaultW: number;
  // ...the rest of today's computeDockLayout() return value
}

export function computeDockLayout(input: DockLayoutInput): DockLayout { /* ... */ }
export function computeBentoLayout(vw: number, vh: number): BentoLayout { /* ... */ }
```

**Why pure:** today's `computeDockLayout()` reads `cardsClusterRef.current.getBoundingClientRect()` itself, which is exactly how Glitch 1a happened (it measured a stale rect because the caller hadn't reset the cluster's transform yet). Making it a pure function forces the *caller* to do the DOM measurement and pass in plain numbers — there's no way to accidentally call it before a reset again, because reset-then-measure now has to happen at the call site, in plain sight, instead of being hidden inside the function.

**Testable exactly like `lib/viewport.ts` already is** (Task 1/7 of the fix plan already set up Vitest for this reason) — every one of Glitch 1's and Glitch 8's regressions is a unit test here (`computeDockLayout` given a wide clamped `liveW` shouldn't drift; two same-tier `computeBentoLayout` calls should be pixel-identical).

---

### `components/blueprint/hero-engine/useSceneEngine.ts` — the state machine, no visuals

**Owns:** everything that decides *whether* something happens right now, never *what* happens. This is the single piece of code responsible for fixing Glitches 2 and 3 for good.

- The state machine itself: `stateRef` (`"hero" | "product-resting" | "product" | "sculpting" | "ring" | "about" | "faq"`) and `currentSecurityStateRef`.
- All busy-flags: `transitionAnimatingRef`, `isSecurityTransitioningRef`, `isNavigatingRef`, `hasTriggeredThisGestureRef`, `wheelGestureActiveRef`, `wheelGestureEndTimerRef`, `lockScrollYRef`.
- The `wheel`/`touchmove`/`keydown` listeners and their shared gesture-debounce logic (today duplicated between `handleWheel` and `handleKeyDown` — this is where that duplication gets merged into one).
- Scroll locking: `document.documentElement/body.style.overflow`, `stageRef`'s fixed positioning.
- A **safety-valve timeout** alongside every busy-flag: whenever a flag is set `true`, a `setTimeout` is armed to force it back to `false` after a generous max-plausible-transition-duration; normal completion clears the timeout early. This is new behavior (not in the fix plan, since it's specifically an engine-level architectural guarantee) that makes "scroll permanently stuck" structurally impossible even if a future scene forgets to clean up after itself.

**Exposes**, roughly:
```ts
export interface SceneEngine {
  state: SceneState;                    // read-only, current macro state
  securityStateIndex: number;
  isBusy: boolean;                      // true while any transition/animation is in flight
  goTo: (target: SceneState, opts?: { instant?: boolean }) => void;
  registerScene: (name: SceneState, handlers: SceneHandlers) => void;
}

export interface SceneHandlers {
  buildForwardTimeline?: () => gsap.core.Timeline;   // organic scroll-driven entry
  onEnter?: () => void;                              // instant/direct entry (nav click, jump)
  onExit?: () => void;
}
```

Each scene module (§below) calls `registerScene("security", { buildForwardTimeline, onEnter, onExit })` once on mount. The engine is the only thing that ever calls `.kill()` on a scene's timeline, and it does so through one shared helper that *always* clears the matching busy-flag in the same breath — eliminating the "timeline killed from 8 different places, only 1 of them remembers to reset the flag" bug class from the report's §2b.

---

### `components/blueprint/hero-engine/sceneTransitions.ts` — the one canonical reset

**Owns:** the "instant jump to state X" logic — today's `instantResetHero`, `instantShowSecurity`, `instantShowAbout`, `instantShowFaq`, `instantShowContact`, and `navigateToSection`. This is the single biggest fix for Glitches 1, 4, and 7: instead of 6-9 independently hand-maintained functions that each reset a different subset of shared visual state, there is **one function**:

```ts
export function resetToState(target: SceneState, ctx: SceneTransitionContext): void {
  // 1. Kill every in-flight timeline for every scene (not just the current one)
  // 2. Reset every busy-flag to false, synchronously, unconditionally
  // 3. Reset shared visual state to target's canonical "at rest" values:
  //    - vault: setOpenProgress(0) + resetRim() together, always
  //    - card faces: front, always (see fix-plan Task 6 — this file inherits
  //      that fix, it doesn't reintroduce the old duplicated behavior)
  //    - scroll position + overflow lock/unlock for the target state
  // 4. Call the target scene's onEnter()
}
```

Because this is the *only* function that ever performs a "jump directly to state X," there is no longer a way for one entry path to reset the vault's rim and another to forget — there's exactly one reset, and every caller (wheel-driven completion, a nav-pill click, "Back to Top," a future browser back/forward handler) goes through it.

---

### `components/blueprint/scenes/*.tsx` — one file per screen, visuals only

This is the "one file for each screen" the user originally asked about — but each one is now allowed to be simple, because it no longer needs to know about busy-flags, scroll locking, or dock math.

- **`HeroScene.tsx`** — the ring/aperture visual, headline, CTA, floor line. Builds its own forward timeline (`createHeroToProductTimeline`, moved here) and registers it with the engine.
- **`ProductBentoScene.tsx`** — the 5 bento cards, their content, and (per the fix plan) their single light front face. Builds `createRestingToBentoTimeline`/`createProductToRingTimeline`. Consumes `computeBentoLayout`/`computeDockLayout` from `lib/dockLayout.ts` for positioning — never computes its own layout math.
- **`SecurityVaultScene.tsx`** — renders `<SafeVault3D />`, owns `safeVault3DRef`, the 8 security sub-states' content and their flourish timelines (money/lock/connection/India-map/sell-shield/doc-flip). This is the only file that ever calls `setOpenProgress`/`resetRim` directly — via `sceneTransitions.ts`, never ad hoc.
- **`AboutScene.tsx`** — the envelope/document UI and orbit animation, and the About→FAQ handoff (`exitAboutToFaq`, including the fix-plan's Task 5 suppression window).

Each scene file:
- Owns only the refs to its *own* DOM elements.
- Never touches `document.body.style.overflow`, `stateRef`, or any busy-flag directly — it asks the engine to do it.
- Never duplicates another scene's reset logic — if two scenes need the same reset, that reset belongs in `sceneTransitions.ts`, not copy-pasted into both.

---

### `BlueprintHero.tsx` (after the split) — thin orchestrator

What's left: mount the engine hook, mount the four scene components, wire the engine's `goTo`/gesture callbacks to the right scene, render `<BlueprintNav>`-adjacent shared chrome (stage container, portal clip). Estimated final size: a few hundred lines, not ten thousand — small enough to read start-to-finish in one sitting, which is the actual point of doing this.

---

## 3. How this maps back to each glitch

| Glitch | Fixed by the fix-plan already? | What the split adds |
|---|---|---|
| 1 — vault drift | Yes (Task 4, in place) | `dockLayout.ts` makes the reset-then-measure order structurally required (you can't call the pure function without passing in numbers you measured yourself), not just correct-by-convention. |
| 2/3 — scroll lock / asymmetric reveals | **No — intentionally deferred** | This is the split's main justification. `useSceneEngine.ts` owning every busy-flag + a safety-valve timeout, and `sceneTransitions.ts` being the only place that kills/resets timelines, directly closes this class of bug. This is *why* Glitch 2/3 was deferred to "after the split," not before it. |
| 4 — black cards | Yes (Task 6, in place) | `ProductBentoScene.tsx` is the only file that can ever touch card-face state, so the fix can't regress via a duplicated reset elsewhere. |
| 5 — FAQ snap | Yes (Task 5, in place) | Lives cleanly in `AboutScene.tsx` instead of buried in a 10,000-line file. |
| 6 — duplicate navbar | Yes (Task 2, in place) | Unrelated to this split — `SiteHeader.tsx` fix stands alone. |
| 7 — vault rim reset | Yes (Task 3, in place) | `sceneTransitions.ts`'s single `resetToState` is the only place `setOpenProgress`/`resetRim` are called together — six scattered call sites become one. |
| 8 — bento/viewport text | Yes (Task 7, in place) | `dockLayout.ts` + `lib/viewport.ts` are the only sizing sources `ProductBentoScene.tsx` is allowed to consume — no way to reintroduce a raw `vw` read elsewhere later. |

---

## 4. Data flow between the engine and the scenes

Given the codebase's existing style is entirely imperative/ref-driven GSAP (not React state/re-renders), the split keeps that same style rather than introducing React Context or state-driven re-renders, which would fight GSAP's own rendering the same way native `scroll-behavior: smooth` already does per `lib/gsap.ts`'s own comment. Concretely:

- `useSceneEngine()` returns a stable object (refs + functions), not state that changes identity on every transition — scenes read `engine.state`/`engine.isBusy` through a ref, the same way the rest of this codebase already reads `stateRef.current` rather than a `useState`.
- Each scene calls `engine.registerScene(name, handlers)` once, in its own `useGSAP`/`useEffect`, mirroring how GSAP context scoping already works in this codebase (`useGSAP(() => {...}, { scope: ... })`).
- No prop-drilling of the 50+ refs: `BlueprintHero.tsx` passes each scene *only* the DOM container ref it needs to render into and the `engine` object — a scene never receives another scene's refs.

---

## 5. Suggested extraction order (safest first)

Mirrors how we approached the fix plan: smallest blast radius first, verify, then move to the next.

1. **`lib/dockLayout.ts`** — pure math, already correct after fix-plan Task 4, zero behavior change, just relocated and made independently testable. Lowest risk possible.
2. **`hero-engine/useSceneEngine.ts`** — move the state machine + input handlers out, but keep `BlueprintHero.tsx` calling into it exactly as before (mechanical extraction, no new safety-valve timeout yet). Verify nothing regressed before adding new behavior.
3. **Add the safety-valve timeout** to the now-isolated engine, as its own follow-up step — this is genuinely new behavior (not just a move), so it gets its own verification pass, separate from the mechanical extraction in step 2.
4. **`hero-engine/sceneTransitions.ts`** — build the single `resetToState`, replacing the 6-9 duplicated instant-jump functions one state at a time (e.g. migrate `instantShowSecurity` first, verify, then `instantShowAbout`, etc.) rather than all at once.
5. **Scene files, one at a time** — `HeroScene.tsx` first (smallest, fewest cross-scene dependencies), then `ProductBentoScene.tsx`, then `SecurityVaultScene.tsx` (largest, most sub-states), then `AboutScene.tsx`. Verify each scene's own repro steps before starting the next.
6. **Slim `BlueprintHero.tsx` down** to the orchestrator once all four scenes and both engine files are extracted.

Each numbered step above is sized to become its own task (or small set of tasks) in a `superpowers:writing-plans`-style execution plan, the same way the fix plan was structured — I haven't written that yet since this document is the design to review first.

---

## 6. Open decisions worth confirming before turning this into an execution plan

1. **File extension for `useSceneEngine`/`sceneTransitions`:** proposed as `.ts` (no JSX), since they're pure logic/hooks. Confirm that's fine, or whether you'd rather colocate more inline with `BlueprintHero.tsx` for a smaller diff.
2. **Safety-valve timeout duration:** needs a concrete number (e.g. "longest transition is ~1.2s, so arm a 2.5s fallback") — worth pulling the actual longest timeline duration from the code before picking this.
3. **Whether `navigateToSection` (nav-pill click routing) lives inside `useSceneEngine.ts` or `sceneTransitions.ts`:** it's really "which target state does this nav item map to, then call resetToState" — leaning toward `sceneTransitions.ts` since it's a caller of `resetToState`, not the engine itself, but flagging it since it currently also contains re-entrancy guarding logic that's arguably engine-owned.

---

## 7. What this document is not

This is not yet a `superpowers:writing-plans` execution plan — there are no bite-sized checkbox steps, no exact line numbers to edit, and no test-first sequencing here. That's deliberate: this is the architecture to agree on first. Once you've reviewed it (and the three open decisions above), the next step is writing that execution plan the same way we did for the bug fixes — after Tasks 1–7 from the fix plan are merged and stable, per this project's own ordering rule.
