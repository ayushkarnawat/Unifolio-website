# BlueprintHero.tsx File-Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `components/blueprint/BlueprintHero.tsx` (~9,900 lines) into a pure layout-math module, a state-machine "engine" hook, a single canonical scene-reset module, and four per-scene component files — exactly the architecture in the design doc — without changing any animation timing, easing, or visual behavior along the way.

**Architecture:** Nine tasks, ordered safest-first per the design doc's own extraction order: pure math first (zero behavioral risk), then the state machine (mechanical move), then new safety behavior (the one deliberately new thing), then the canonical reset function (the actual fix for Glitches 2/3), then the four scenes one at a time, then a final slim-down of the orchestrator. Each task leaves the app fully working — this is a sequence of shippable milestones, not one big bang.

**Tech Stack:** Next.js 14 / React 18 / GSAP 3 (existing, unchanged). Vitest (already set up by the prior glitch-fixes plan) for the new pure functions in `lib/dockLayout.ts`.

**Spec:** `Docs/2026-09-22-blueprinthero-file-split-design.md` (the architecture this plan implements) and `Docs/2026-09-22-scroll-and-animation-glitch-root-cause-report.md` (why each module boundary exists — cited per task below).

## Global Constraints

- No task changes GSAP timing, easing, colors, or positions. This is a structural move, not a redesign — the one exception is Task 4 (canonical `resetToState`), which is explicitly allowed to change *when/how* resets happen (that's its whole purpose, per the design doc), never *what* the reset values are.
- Every ref, function, and constant this plan moves is named and line-ranged against the CURRENT state of `components/blueprint/BlueprintHero.tsx` as of this plan's writing (9,899 lines). **Re-locate every target by function/const name via grep before editing** — prior work in this repo has already shown line numbers drift between sessions (including from the file owner's own manual edits), and a stale line number silently editing the wrong code is worse than no line number at all.
- No git commits unless the user's session has git identity configured and explicitly asks for commits (this repo had no `user.name`/`user.email` configured as of the last plan run — check `git config user.name` before assuming commits are possible).
- Do not assume `computeBentoLayout`/`computeDockLayout` are currently pure — verified by reading: both read `cardsClusterRef.current` (a live DOM ref) directly inside themselves today. Task 1 fixes this as part of the extraction (see its Interfaces block), it is not already true.
- **The Task 4 fix-plan's own correction to `viewportCenterX`/`viewportCenterY`** (use the clamped `vWidth`/`vHeight`, not raw `liveW`/`liveH` — see root-cause report §1b) **is not currently present in the file** — a fresh read shows `liveW`/`liveH` at that spot again, along with different vault-sizing constants than the fix-plan session last saw. This plan does not silently reintroduce that fix. Task 1's extraction step explicitly asks the implementer to re-check this specific line against the root-cause report and flag/ask before assuming either version is "right," since it may reflect the user's own intentional follow-up edit.

## Review Focus

1. **`computeBentoLayout`'s live DOM read** (`cardsClusterRef.current.offsetTop`, used to compute `clusterViewportTop`): confirm the extracted pure version takes this as a parameter and every call site still measures it correctly, rather than silently dropping the measurement and using a wrong fallback constant every time.
2. **`computeDockLayout`'s three side effects** (writes `safeContainerRef.current.style.width/height`; writes `origCentersRef.current`; writes 9 other refs) must all still happen exactly where they used to, from the *caller* after Task 1, not get lost when the math itself moves to `lib/dockLayout.ts`.
3. **Busy-flag audit for Task 2's engine extraction**: every `.kill()` call site the report's §2b identified (8+ locations) must still exist and still fire after the mechanical move — a botched extraction that silently drops one of these re-introduces the exact "permanently stuck scroll" bug this whole project exists to fix.
4. **Task 4's migration must not skip a state**: `resetToState` needs one call site per macro state (`hero`, `product`, `ring`/security, `about`, `faq`, `contact`) migrated from the corresponding `instantShowX`/`instantResetHero` function — a state left un-migrated means two different reset code paths coexist silently, reintroducing the exact duplication bug this project exists to remove.
5. **Cross-scene refs**: several refs (`cardsClusterRef`, `safeContainerRef`, `stateRef` and its siblings) are read by *more than one* scene file after the split (e.g. both `ProductBentoScene` and `SecurityVaultScene` touch `cardsClusterRef`). Confirm the plan's ownership assignment for each shared ref (Task 2's Interfaces block) is followed consistently — a ref accidentally duplicated into two files' local `useRef` calls instead of passed down from one owner is a silent, hard-to-debug divergence bug.

---

### Task 1: Extract pure layout math into `lib/dockLayout.ts`

**Spec:** design doc §2 (`lib/dockLayout.ts`), root-cause report §1a/§1b/§8.

**Files:**
- Create: `lib/dockLayout.ts`
- Create: `lib/dockLayout.test.ts`
- Modify: `components/blueprint/BlueprintHero.tsx` (the `computeBentoLayout`/`computeDockLayout` definitions — currently at whatever lines `grep -n "const computeBentoLayout = \|const computeDockLayout = " components/blueprint/BlueprintHero.tsx` reports; **do not trust this plan's own line numbers without re-running that grep first**, since line 751/1585 are this plan-writing session's numbers and the file has already been shown to drift from manual edits between sessions)

**Interfaces:**
- Produces: `computeBentoGeometry(input: BentoGeometryInput): BentoGeometry` and `computeDockGeometry(input: DockGeometryInput): DockGeometry` — pure functions, no DOM reads, no refs, no side effects. Every later task that needs layout math imports these two functions and `lib/viewport.ts`'s existing `getComposedViewport`/`getCardRestHeight`/`getBentoVwTierPx` — nothing else in this codebase should compute bento or dock geometry any other way after this task.
- Consumes: nothing from other tasks (this is the first task).

- [ ] **Step 1: Re-locate the current exact bodies**

```bash
grep -n "const computeBentoLayout = \|const computeDockLayout = \|const createProductToRingTimeline = " components/blueprint/BlueprintHero.tsx
```

Read both function bodies in full at whatever lines that reports (the third match, `createProductToRingTimeline`, marks where `computeDockLayout` ends). Confirm for yourself, by reading:
- `computeBentoLayout` reads `cardsClusterRef.current.offsetTop`/`offsetParent` to compute a `liveTop`/`clusterViewportTop` value (search the body for `clusterViewportTop`) — note the exact fallback formula used when there's no live measurement (the ternary keyed on `vWidth >= 1024 ? 5 : ...`), you'll need it verbatim in Step 2.
- `computeDockLayout` reads `cardsClusterRef.current.getBoundingClientRect()` (for `clusterCenterX`/`clusterCenterY`) and `.offsetWidth`/`.offsetHeight` (for `clusterW`/`clusterH`), writes `safeContainerRef.current.style.width/height`, writes `origCentersRef.current`, and writes 9 refs at the end (`targetLeftXRef`, `targetRingYRef`, `heroShiftXRef`, `rightShiftXRef`, `securityHeadingYRef`, `stackTargetXRef`, `stackTargetYRef`, `cardsToSafeDeltaXRef`, `cardsToSafeDeltaYRef`).
- **Check `viewportCenterX`/`viewportCenterY`'s current right-hand side** (search for `const viewportCenterY = `). If it reads `liveH / 2` / `liveW / 2` (raw, unclamped), this contradicts the root-cause report's §1b fix and the prior glitch-fixes plan's Task 4 — **stop and ask the user which is intended** before writing Step 2's pure function (do not silently pick one). If it already reads `vHeight / 2` / `vWidth / 2` (clamped), proceed using those names.

- [ ] **Step 2: Write `lib/dockLayout.ts`**

Use the exact formulas you just read in Step 1 for every constant below — the sketch here preserves the *shape* of both functions (params in, plain object out, zero DOM/refs) but you must transcribe the real current arithmetic, not re-derive it:

```ts
import { getComposedViewport, getCardRestHeight, DESKTOP_REFERENCE_WIDTH } from "./viewport";

export interface BentoGeometryInput {
  vWidth: number;
  vHeight: number;
  /** cardsClusterRef's top-edge viewport Y, measured by the caller via
   * offsetParent.getBoundingClientRect().top + offsetTop (or its own
   * getBoundingClientRect().top as a fallback) — undefined when the
   * cluster isn't mounted/measurable yet, in which case this function
   * uses the same breakpoint-keyed constant the original inline version
   * fell back to. */
  clusterViewportTop?: number;
}

export interface BentoGeometry {
  bentoW: number;
  bentoH: number;
  gapX: number;
  gapY: number;
  tileWidths: number[];
  tileHeights: number[];
  tileLefts: number[];
  tileTops: number[];
}

export function computeBentoGeometry(input: BentoGeometryInput): BentoGeometry {
  const { vWidth, vHeight, clusterViewportTop } = input;
  // ... transcribe computeBentoLayout's body verbatim here, replacing its
  // internal `cardsClusterRef.current` read with `clusterViewportTop` from
  // the input (falling back to the same breakpoint-keyed constant the
  // original used when clusterViewportTop is undefined) ...
}

export interface DockGeometryInput {
  vWidth: number;
  vHeight: number;
  clusterCenterX: number;
  clusterCenterY: number;
  clusterW: number;
  clusterH: number;
  bento: BentoGeometry;
}

export interface DockGeometry {
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
  finalVaultW: number;
}

export function computeDockGeometry(input: DockGeometryInput): DockGeometry {
  const { vWidth, vHeight, clusterCenterX, clusterCenterY, clusterW, clusterH, bento } = input;
  // ... transcribe computeDockLayout's body verbatim here, using vWidth/vHeight
  // in place of whatever the original used for viewportCenterX/Y (per Step 1's
  // finding), and RETURNING finalVaultW/targetLeftX/etc. instead of writing
  // them into refs or safeContainerRef.current.style — the caller does that ...
}
```

- [ ] **Step 2: Write `lib/dockLayout.test.ts`**

Write real tests pinning the specific behaviors the root-cause report flags as previously buggy — these are regression tests, not just coverage:

```ts
import { describe, it, expect } from "vitest";
import { computeBentoGeometry, computeDockGeometry } from "./dockLayout";

describe("computeBentoGeometry", () => {
  it("gives two viewports in the same tiered width the same tile geometry", () => {
    const a = computeBentoGeometry({ vWidth: 1290, vHeight: 900, clusterViewportTop: 80 });
    const b = computeBentoGeometry({ vWidth: 1290, vHeight: 900, clusterViewportTop: 80 });
    expect(a).toEqual(b);
  });

  it("falls back to the breakpoint-keyed constant when clusterViewportTop is unmeasured", () => {
    const withMeasurement = computeBentoGeometry({ vWidth: 1440, vHeight: 900, clusterViewportTop: 100 });
    const withoutMeasurement = computeBentoGeometry({ vWidth: 1440, vHeight: 900 });
    // tileTops shift with clusterViewportTop, so these should differ
    expect(withoutMeasurement.tileTops).not.toEqual(withMeasurement.tileTops);
  });
});

describe("computeDockGeometry", () => {
  it("centers on the given clamped vWidth/vHeight, not any other value", () => {
    const bento = computeBentoGeometry({ vWidth: 1440, vHeight: 900, clusterViewportTop: 80 });
    const narrow = computeDockGeometry({
      vWidth: 1440, vHeight: 900, clusterCenterX: 720, clusterCenterY: 450, clusterW: 400, clusterH: 370, bento,
    });
    const wide = computeDockGeometry({
      vWidth: 1440, vHeight: 900, clusterCenterX: 960, clusterCenterY: 450, clusterW: 400, clusterH: 370, bento,
    });
    // moving clusterCenterX right should move targetLeftX left by the same delta
    expect(wide.targetLeftX - narrow.targetLeftX).toBeCloseTo(-(960 - 720), 0);
  });

  it("never reads window.innerWidth/innerHeight directly (regression guard for report §1b)", () => {
    const source = require("fs").readFileSync(require.resolve("./dockLayout.ts"), "utf-8");
    expect(source).not.toMatch(/window\.innerWidth|window\.innerHeight/);
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `npm test`
Expected: all suites pass, including the new `dockLayout.test.ts` file.

- [ ] **Step 4: Wire `BlueprintHero.tsx`'s existing functions to call the new pure functions**

Replace the bodies of `computeBentoLayout`/`computeDockLayout` (found in Step 1) so they:
1. Do the DOM measurement (`cardsClusterRef.current.getBoundingClientRect()`, `.offsetWidth`, `.offsetHeight`, `.offsetTop`) themselves, exactly as before.
2. Call `computeBentoGeometry`/`computeDockGeometry` from `lib/dockLayout.ts` with those measured values.
3. Perform the three side effects (write `safeContainerRef.current.style.width/height`, write `origCentersRef.current`, write the 9 refs) using the returned geometry's fields, exactly as before.
4. Return the same shape callers already destructure (`bento.tileLefts`, `dockLayout.targetLeftX`, etc.) so no call site elsewhere in `BlueprintHero.tsx` needs to change in this task.

Add the import: `import { computeBentoGeometry, computeDockGeometry } from "@/lib/dockLayout";` near the top of `BlueprintHero.tsx`.

- [ ] **Step 5: Manually verify**

Run `npm run dev` (kill any stale instance first — `ps aux | grep "next dev"` — and clear `.next` if you suspect file-watching isn't picking up changes, a known issue on this WSL2 checkout's `/mnt/c/...` path). Confirm:
- The Product bento grid still renders in the same positions as before this task.
- Scrolling into Security still docks the vault in the same place as before this task (this task is a pure refactor — if the vault's position visibly changes from what it was right before this task, the extraction has a bug, not a fix, since Task 1 doesn't touch the "what" of the math, only where it lives).

- [ ] **Step 6: Commit** (only if git identity is configured — see Global Constraints)

```bash
git add lib/dockLayout.ts lib/dockLayout.test.ts components/blueprint/BlueprintHero.tsx
git commit -m "refactor: extract pure bento/dock layout math into lib/dockLayout.ts"
```

---

### Task 2: Extract the state machine into `hero-engine/useSceneEngine.ts`

**Spec:** design doc §2 (`useSceneEngine.ts`), root-cause report §2/§3.

**Files:**
- Create: `components/blueprint/hero-engine/types.ts`
- Create: `components/blueprint/hero-engine/useSceneEngine.ts`
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:**
- Produces: a `useSceneEngine()` hook returning `{ stateRef, currentSecurityStateRef, isBusy, /* the busy-flags below, as refs */ }` plus the wheel/touch/keydown listener setup as a `useEffect` inside the hook itself. Later tasks (3, 4) extend this file; scene files (5-8) import `stateRef`/busy-flags from whatever this task's return shape ends up being — **whatever field names Step 1 below settles on are the names every later task must use verbatim.**
- Consumes: nothing new — this is a mechanical move of state already in `BlueprintHero.tsx`.

- [ ] **Step 1: Re-locate every ref/state this task moves**

```bash
grep -n "= useRef<" components/blueprint/BlueprintHero.tsx
```

From that output, this task moves exactly these (re-identify by variable name, not by line number, since Task 1 already shifted every line after it):
`stateRef`, `currentSecurityStateRef`, `productCompleteRef`, `isHoldingProductRef`, `transitionStartedRef`, `transitionAnimatingRef`, `transitionCompleteRef`, `isSecurityTransitioningRef`, `isNavigatingRef`, `hasTriggeredThisGestureRef`, `wheelGestureActiveRef`, `wheelGestureEndTimerRef`, `touchGestureActiveRef`, `lastSecurityScrollTimeRef`, `lockScrollYRef`, `resizeReflowTimeoutRef`, `momentumDrainTimeoutRef`, `arrivalIdleTimeoutRef`, `apertureScrollTriggerRef`, `targetNavSectionRef`, `pendingNavSectionRef`, plus the `isAperturePaused` `useState`.

Do **not** move: any `*TlRef`/`*TweenRef` (timeline/tween instances — those belong to the scene that builds that timeline, per Task 4-8), any DOM element ref (`containerRef`, `stageRef`, etc. — those stay with whichever scene renders that element), or the six `on*CompletedRef` callback refs (those are cross-scene handoff callbacks — leave them in `BlueprintHero.tsx` for now; Task 9 decides their final home once all scenes exist).

Also re-locate and read in full: `handleWheel`, `handleTouchMove`, `handleKeyDown`, `handleScrollLock` (`grep -n "const handleWheel = \|const handleTouchMove = \|const handleKeyDown = \|const handleScrollLock = "`).

- [ ] **Step 2: Write `components/blueprint/hero-engine/types.ts`**

```ts
export type SceneState = "hero" | "product-resting" | "product" | "sculpting" | "ring" | "about" | "faq";
```

- [ ] **Step 3: Write `components/blueprint/hero-engine/useSceneEngine.ts`**

```ts
"use client";

import { useRef, useState, useEffect } from "react";
import type { SceneState } from "./types";
import type { ScrollTrigger } from "@/lib/gsap";

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

  // handleWheel / handleTouchMove / handleKeyDown / handleScrollLock and their
  // window.addEventListener/removeEventListener setup move here from
  // BlueprintHero.tsx VERBATIM in this step — same bodies, same dependency on
  // the refs above (which now live in this closure instead), same cleanup.
  // This step is a pure relocation: do not change any gating logic, timing,
  // or condition while moving it. Any bug found while reading it during the
  // move is a finding for a SEPARATE follow-up task, not something to fix
  // silently here (Task 4 is where reset/kill behavior is deliberately
  // changed, not this one).

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
  };
}

export type SceneEngine = ReturnType<typeof useSceneEngine>;
```
Every later task (5-8) that imports `SceneEngine` imports this exact exported type — do not redefine it locally in a scene file.

Note: `handleWheel`/`handleTouchMove`/`handleKeyDown`/`handleScrollLock` reference many scene-specific functions too (`triggerHeroToProduct`, `goToSecurityState`, `exitAboutToFaq`, etc.) that don't exist in this hook. Since those scene functions don't move until Tasks 5-8, **this task cannot fully relocate the listener bodies yet without a temporary seam.** Add this to the hook, right after the refs and before the `return`:
```ts
interface TemporaryHandlerSeam {
  onWheel?: (e: WheelEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onScrollLock?: () => void;
}
const registeredHandlersRef = useRef<TemporaryHandlerSeam>({});
function registerHandlers(handlers: TemporaryHandlerSeam) {
  registeredHandlersRef.current = handlers;
}
```
Add `registerHandlers` to the returned object. Inside the moved `handleWheel`/etc. bodies, wherever the original code called a scene-specific function directly (e.g. `triggerHeroToProduct()`), call `registeredHandlersRef.current.onWheel?.(e)` (etc.) instead, and have `BlueprintHero.tsx` call `engine.registerHandlers({ onWheel: handleWheel, ... })` once, passing its still-local scene functions wrapped in its own small dispatcher — the busy-flag gating/gesture-debounce logic itself stays inside the hook's `handleWheel`, only the scene-specific *action* a gesture triggers is call-through. **This is explicitly temporary** — Task 4, Step 0 replaces it with real per-scene registration (`registerScene`/`SceneHandlers`) once scene functions start migrating for real, and Task 9 confirms `registerHandlers` was fully removed.

- [ ] **Step 4: Wire `BlueprintHero.tsx` to use the hook**

Replace the moved `useRef`/`useState` declarations and the `handleWheel`/`handleTouchMove`/`handleKeyDown`/`handleScrollLock` bodies with:
```tsx
const engine = useSceneEngine();
const { stateRef, currentSecurityStateRef, /* ...every other field Step 3 returns... */ } = engine;
```
at the top of the component, and register the handlers via `engine.registerHandlers({ ... })` inside the existing `useGSAP` effect, in place of the old inline listener bodies.

- [ ] **Step 5: Manually verify**

Run `npm run dev`. Confirm: scrolling through Hero → Product → Security → About → FAQ still works exactly as before this task — every gesture-driven transition, nav-pill click, and "Back to Top" still functions. This task must be behaviorally invisible; if anything scrolls differently than it did right before this task, the extraction introduced a bug (most likely: a busy-flag or timer that got duplicated instead of shared, or a `.kill()` call site the move dropped — cross-check against Review Focus item 3).

- [ ] **Step 6: Commit** (if git identity configured)

```bash
git add components/blueprint/hero-engine/ components/blueprint/BlueprintHero.tsx
git commit -m "refactor: extract scroll-hijack state machine into useSceneEngine hook"
```

---

### Task 3: Add the safety-valve timeout to the engine

**Spec:** design doc §2 (`useSceneEngine.ts`'s safety-valve paragraph), root-cause report §2b.

**Files:**
- Modify: `components/blueprint/hero-engine/useSceneEngine.ts`

**Interfaces:**
- Consumes: `transitionAnimatingRef`, `isSecurityTransitioningRef`, `isNavigatingRef` (from Task 2).
- Produces: `armBusySafetyValve(flagRef: MutableRefObject<boolean>, maxMs: number): void` and `disarmBusySafetyValve(flagRef): void` — Task 4's `resetToState` calls `disarmBusySafetyValve` as part of every reset, so name these exactly this way.

This is the one deliberately NEW behavior in this plan (everything else is a pure move). Before writing it, find the longest single transition duration in the codebase so the timeout has a real, justified number instead of a guess:

- [ ] **Step 1: Find the longest transition duration**

```bash
grep -n "duration: [0-9.]*" components/blueprint/BlueprintHero.tsx | grep -oE "duration: [0-9.]+" | sort -t: -k2 -n -r | head -5
```

Also check `consolidateRingToStack`/`restoreStackToRing` specifically (search by name) for their total timeline length (sum of their internal position offsets, e.g. the `exitHandoffTime`/`cardExitStart` constants visible when you read them) — these are likely the longest single transitions in the file. Use `(longest total transition duration) + 500ms` as `maxMs`'s value at each call site in Task 4 — a concrete, derived number, not a round guess.

- [ ] **Step 2: Write the safety valve**

```ts
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
```
Add both to the hook's return object. Add a cleanup in the hook's own `useEffect` return that clears every timer still in `safetyValveTimersRef.current` on unmount.

- [ ] **Step 3: Manually verify (this is genuinely new behavior — test it deliberately, not just "does the page still work")**

Run `npm run dev`. In the browser devtools console, while the page is loaded, manually set a busy-flag stuck (e.g. temporarily add a debug line that never clears `transitionAnimatingRef.current` after a scroll, reload, scroll once, then remove the debug line) — confirm scrolling resumes on its own after the armed timeout elapses, without needing a page reload. Remove the debug line before moving on.

- [ ] **Step 4: Commit** (if git identity configured)

```bash
git add components/blueprint/hero-engine/useSceneEngine.ts
git commit -m "feat: add safety-valve timeout so a killed timeline can never permanently lock scroll"
```

---

### Task 4: Build the canonical `resetToState` in `hero-engine/sceneTransitions.ts`

**Spec:** design doc §2 (`sceneTransitions.ts`), root-cause report §1, §2, §3, §4, §7 (this task is the actual fix for the duplicated-reset bug class those sections describe).

**Files:**
- Create: `components/blueprint/hero-engine/sceneTransitions.ts`
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:**
- Consumes: `armBusySafetyValve`/`disarmBusySafetyValve` (Task 3), every busy-flag ref (Task 2), Task 2's temporary `registerHandlers` seam (this task replaces it — see Step 0).
- Produces: `resetToState(target: SceneState, ctx: SceneTransitionContext): void` — every later scene file (Tasks 5-8) and every nav-click/"Back to Top" handler calls this instead of calling `instantShowX()` functions directly. `SceneTransitionContext` is whatever bag of refs/functions Step 1 below determines each `instantShowX` actually needs — write that interface down explicitly in this file since Tasks 5-8 depend on its exact shape.
- Also produces: `registerScene(name: SceneState, handlers: SceneHandlers) => void` and the `SceneHandlers` type (`{ buildForwardTimeline?: () => gsap.core.Timeline; onEnter?: () => void; onExit?: () => void }`), added to `useSceneEngine.ts`'s return object in Step 0 below. **This is the exact name Task 5 (`HeroScene.tsx`) calls as `engine.registerScene("hero", { trigger, reverse })` — use these same two field names, `trigger`/`reverse` (not `onEnter`/`onExit`) if you change this shape while implementing Step 0, and update this paragraph plus every scene task (5-8) consistently before moving on. Whichever names Step 0 settles on are binding for every later task.**

This task migrates one macro state at a time — do not attempt all six in one step.

- [ ] **Step 0: Replace Task 2's temporary `registerHandlers` seam with real scene registration**

In `components/blueprint/hero-engine/useSceneEngine.ts`, add:
```ts
export interface SceneHandlers {
  trigger?: () => void;   // called when a forward gesture/nav-click enters this scene
  reverse?: () => void;   // called when a backward gesture/nav-click leaves this scene
}

const sceneHandlersRef = useRef<Map<SceneState, SceneHandlers>>(new Map());

function registerScene(name: SceneState, handlers: SceneHandlers) {
  sceneHandlersRef.current.set(name, handlers);
}
```
Add `registerScene` to the hook's returned object. Update the wheel/touch/keydown handlers (moved into this hook in Task 2) so that wherever they previously called the temporary `registerHandlers`-provided callback for a given scene transition, they now look up `sceneHandlersRef.current.get(targetState)?.trigger?.()` (or `.reverse?.()`) instead. Remove `registerHandlers` once nothing calls it (`grep -rn "registerHandlers" components/blueprint/`).

- [ ] **Step 1: Re-locate and read all six "instant" functions in full**

```bash
grep -n "const instantResetHero = \|const instantShowProduct = \|const instantShowSecurity = \|const instantShowAbout = \|const instantShowFaq = \|const instantShowContact = \|const navigateToSection = " components/blueprint/BlueprintHero.tsx
```

For each, list every ref/function it touches (you already have the vault-specific ones catalogued in the glitch-fixes ledger: `setOpenProgress`/`resetRim` pairing, `cardBackRefs` visibility, `cardsClusterRef` transform reset order). Build one `SceneTransitionContext` type covering the union of everything all six need — this becomes the single param `resetToState` takes.

- [ ] **Step 2: Migrate Security first (it has the most report findings tied to it — §1, §4, §7 — so getting its consolidation right first de-risks the rest)**

```ts
export function resetToState(target: SceneState, ctx: SceneTransitionContext) {
  disarmBusySafetyValve(ctx.transitionAnimatingRef);
  disarmBusySafetyValve(ctx.isSecurityTransitioningRef);
  disarmBusySafetyValve(ctx.isNavigatingRef);
  ctx.transitionAnimatingRef.current = false;
  ctx.isSecurityTransitioningRef.current = false;
  ctx.isNavigatingRef.current = false;
  // Kill every scene's in-flight timeline unconditionally — this is the
  // direct fix for report §2b/§3 (a timeline .kill()'d without its flag
  // being reset elsewhere). List every *TlRef the codebase has (grep
  // "TlRef = useRef" across the file) and .kill() each defensively here;
  // killing an already-finished timeline is a no-op in GSAP, so this is
  // safe even for timelines unrelated to `target`.
  [
    ctx.heroToProductTlRef, ctx.restingToBentoTlRef, ctx.productToRingTlRef,
    ctx.consolidationTlRef, ctx.securityStateTransitionTlRef, ctx.typoEyesTlRef,
    ctx.pwdMaskTlRef, ctx.lockAnimTlRef, ctx.connectionAnimTlRef, ctx.indiaAnimTlRef,
    ctx.moneyAnimTlRef, ctx.sellAnimTlRef, ctx.closingExitTlRef,
  ].forEach((tlRef) => { tlRef.current?.kill(); tlRef.current = null; });

  if (target === "ring") {
    // Move instantShowSecurity's full body here verbatim (it already has
    // the glitch-fixes plan's Task 3/Task 4 corrections: cluster reset
    // BEFORE computeDockLayout, and resetRim() paired with every
    // setOpenProgress(0)) — re-verify both are still present when you
    // relocate this body, per this plan's Global Constraints note that
    // the file has drifted from that plan's state before.
  }
  // ... one `if (target === "...")` block per remaining state, each
  // migrated in its own commit before moving to the next ...
}
```

- [ ] **Step 3: Replace `instantShowSecurity()`'s call sites**

```bash
grep -n "instantShowSecurity()" components/blueprint/BlueprintHero.tsx
```
Replace each with `resetToState("ring", ctx)` where `ctx` is built from the engine + whatever local refs that call site has access to. Leave the other five `instantShowX` functions and their call sites untouched in this step.

- [ ] **Step 4: Manually verify Security specifically**

Run `npm run dev`. Repeat the exact repro steps from the glitch-fixes plan's Task 3 and Task 4 (scroll into Security, forward a few sub-states, scroll up past About/Contact and back down; nav-pill jump from Contact to Security) — confirm the vault position and dial reset are still correct after this migration, not just "the page loads."

- [ ] **Step 5: Commit, then repeat Steps 2-4 for each remaining state** (`product`, `hero`, `about`, `faq`, `contact`) — one state, one commit, one manual verify, before starting the next. Do not batch multiple states into one commit; per Review Focus item 4, a partially-migrated set of states is the exact bug this task exists to prevent, and small commits make it obvious which state's migration to revert if one breaks something.

- [ ] **Step 6: Delete the now-empty `instantShowX`/`instantResetHero` functions and update `navigateToSection`** to call `resetToState` for every target instead of branching to the old functions.

- [ ] **Step 7: Final manual verify**

Run `npm run dev`. Walk every nav-pill link, "Back to Top", and a full forward scroll through every section, in one session, without a page reload. Confirm nothing regressed across the whole page, not just the last state you migrated.

---

### Task 5: Extract `scenes/HeroScene.tsx`

**Spec:** design doc §2 (`HeroScene.tsx`).

**Files:**
- Create: `components/blueprint/scenes/HeroScene.tsx`
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:**
- Consumes: `engine` (Task 2's return shape), `resetToState` (Task 4).
- Produces: `<HeroScene engine={engine} />` — a component `BlueprintHero.tsx` renders in place of the Hero JSX it used to render inline. Exposes no other public API; `triggerHeroToProduct`/`triggerProductToHero`/`createHeroToProductTimeline` become this file's own internal functions, not exported.

- [ ] **Step 1: Re-locate this scene's exact boundaries**

```bash
grep -n "const createHeroToProductTimeline = \|const triggerHeroToProduct = \|const triggerProductToHero = " components/blueprint/BlueprintHero.tsx
```
Also find the Hero JSX block in the `return (` at the bottom of the file (search for the ref names `headerRef`, `headlineRef`, `ctaRef`, `floorLineRef`, `heroVisualRef`, `heroIntroRef`, `irisPortalRef` inside JSX, not inside `useRef` declarations).

- [ ] **Step 2: Write `HeroScene.tsx`'s skeleton, then move the real content into it**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";
import type { SceneEngine } from "../hero-engine/useSceneEngine";

interface HeroSceneProps {
  engine: SceneEngine;
}

export function HeroScene({ engine }: HeroSceneProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const floorLineRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);
  const irisPortalRef = useRef<HTMLDivElement | null>(null);
  const portalRimRef = useRef<HTMLDivElement | null>(null);
  const portalRippleRef = useRef<HTMLDivElement | null>(null);
  const heroToProductTlRef = useRef<gsap.core.Timeline | null>(null);

  // Move createHeroToProductTimeline, triggerHeroToProduct, and
  // triggerProductToHero here verbatim (Step 1's line numbers), updating
  // their internal ref reads to the local refs above and to `engine.*`
  // for stateRef/transitionAnimatingRef/etc.

  useGSAP(() => {
    engine.registerScene("hero", {
      trigger: triggerHeroToProduct,
      reverse: triggerProductToHero,
    });
  }, { scope: headerRef, dependencies: [] });

  return (
    // Move the Hero JSX block here verbatim, replacing each ref prop with
    // the local refs declared above.
  );
}
```

- [ ] **Step 3: Wire `BlueprintHero.tsx`** to render `<HeroScene engine={engine} />` in place of the old inline Hero JSX, and delete the moved functions/refs/JSX from `BlueprintHero.tsx`.

- [ ] **Step 4: Manually verify**

Run `npm run dev`. Confirm the Hero section renders identically and the Hero↔Product transition (forward and reverse) still animates exactly as before — this includes re-checking the glitch-fixes plan's Task 6 black-card-removal fix is still intact (search `HeroScene.tsx` for `rotateY: 0` and confirm no `rotateY: 180` was reintroduced by the move).

- [ ] **Step 5: Commit** (if git identity configured)

```bash
git add components/blueprint/scenes/HeroScene.tsx components/blueprint/BlueprintHero.tsx
git commit -m "refactor: extract Hero scene into its own component"
```

---

### Task 6: Extract `scenes/ProductBentoScene.tsx`

**Spec:** design doc §2 (`ProductBentoScene.tsx`), root-cause report §4, §8.

**Files:**
- Create: `components/blueprint/scenes/ProductBentoScene.tsx`
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:**
- Consumes: `engine`, `resetToState`, `computeBentoGeometry`/`computeDockGeometry` (Task 1).
- Produces: `<ProductBentoScene engine={engine} cardsClusterRef={...} />`. **`cardsClusterRef` is created here and passed UP to `BlueprintHero.tsx`** (not down from it), because `SecurityVaultScene` (Task 7) also needs to read it for `computeDockGeometry`'s cluster measurement — per this plan's Review Focus item 5, `BlueprintHero.tsx` owns this one ref and passes it into both scenes, neither scene creates its own copy.

- [ ] **Step 1: Re-locate this scene's boundaries**

```bash
grep -n "const createRestingToBentoTimeline = \|const triggerRestingToBento = \|const triggerBentoToResting = \|const applyBentoLayoutToCards = \|const instantShowProduct = " components/blueprint/BlueprintHero.tsx
```
Also locate every `card*Refs` array (`cardWrapperRefs`, `cardFlipperRefs`, `cardFrontRefs`, `cardBackRefs`, `cardDefaultRefs`, `cardHoverRefs`, `cardIllustrationRefs`, `cardGradientBgRefs`, `cardGlassOverlayRefs`, `bentoTileContentRefs`, `companionCardRefs`, `cardInkRefs`, `companionPaperRefs`, `companionInkRefs`) and the bento tile JSX (search for `cardsStageRef`, `cardsClusterRef` inside the `return (` block).

- [ ] **Step 2: Write `ProductBentoScene.tsx`**, moving every ref/function/JSX block from Step 1 verbatim, following the same pattern as Task 5's `HeroScene.tsx` (props: `engine`; own `cardsClusterRef` created here via `useRef` and returned/lifted per the Interfaces note above — e.g. via a `ref` forwarding prop or a callback prop `onClusterRef`, whichever this codebase's existing patterns favor; check how `SafeVault3D`'s `forwardRef` is used elsewhere in this file for the established convention before choosing).

- [ ] **Step 3: Manually verify**

Run `npm run dev`. Confirm: the bento grid renders and sizes identically across at least two different browser widths (re-run the glitch-fixes plan's Task 7 verification: resize through the 1024/1280/1366/1440 tiers, confirm card text still matches the box per glitch-fixes Task 7's fix — search this file for `--bento-vw-tier` to confirm that fix moved over intact).

- [ ] **Step 4: Commit** (if git identity configured)

---

### Task 7: Extract `scenes/SecurityVaultScene.tsx`

**Spec:** design doc §2 (`SecurityVaultScene.tsx`), root-cause report §1, §2, §3, §7 (this is the scene most of the reported glitches lived in — extract carefully).

**Files:**
- Create: `components/blueprint/scenes/SecurityVaultScene.tsx`
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:**
- Consumes: `engine`, `resetToState`, `cardsClusterRef` (lifted from Task 6's `ProductBentoScene`), `computeDockGeometry` (Task 1).
- Produces: `<SecurityVaultScene engine={engine} cardsClusterRef={...} />`, owning `safeVault3DRef` and every security-sub-state ref/flourish timeline.

This is the largest single extraction in this plan (the security sub-states span roughly 2,500 source lines as of this plan's writing, per the `-------` section-comment markers between `createProductToRingTimeline` and `exitAboutToFaq`). Do not attempt it in one step.

- [ ] **Step 1: Re-locate every function this scene owns**

```bash
grep -n "const createProductToRingTimeline = \|const consolidateRingToStack = \|const restoreStackToRing = \|const goToSecurityState = \|const exitSecurityToAbout = \|const triggerProductToRing = \|const triggerRingToProduct = " components/blueprint/BlueprintHero.tsx
```
Also locate the six flourish functions by searching for their `*AnimTlRef`/`*TlRef` siblings (`typoEyesTlRef`, `pwdMaskTlRef`, `lockAnimTlRef`, `connectionAnimTlRef`, `indiaAnimTlRef`, `moneyAnimTlRef`, `sellAnimTlRef`) to find each `playXAnimation`-style function, and every `security*Ref`/`safe*Ref` declared near the top of the file.

- [ ] **Step 2: Move refs and the `<SafeVault3D>` JSX + security sub-state JSX first**, as a standalone step, before moving any of the timeline-building functions — this gets the file skeleton and its render output correct while the logic is still calling back into `BlueprintHero.tsx`'s old functions via props, which is easier to debug than moving everything at once.

- [ ] **Step 3: Move `createProductToRingTimeline`, `consolidateRingToStack`, `restoreStackToRing`, `goToSecurityState`, `exitSecurityToAbout`, `triggerProductToRing`, `triggerRingToProduct`, and the six flourish functions** into the scene file, one function at a time, re-running `npm run dev` and re-testing that specific function's own repro path after each move (e.g. after moving `goToSecurityState`, specifically re-test scrolling between security sub-states before moving `consolidateRingToStack` next).

- [ ] **Step 4: Manually verify the whole scene**

Run `npm run dev`. Repeat every Security-related repro step from the glitch-fixes plan (Tasks 3, 4, 5) in sequence, in one browser session: vault position on first load and on re-entry, dial reset, sub-state scrolling, the About handoff.

- [ ] **Step 5: Commit** (if git identity configured) — consider one commit per function moved in Step 3 rather than one giant commit, so a regression can be bisected to the specific function whose move caused it.

---

### Task 8: Extract `scenes/AboutScene.tsx`

**Spec:** design doc §2 (`AboutScene.tsx`), root-cause report §5.

**Files:**
- Create: `components/blueprint/scenes/AboutScene.tsx`
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:**
- Consumes: `engine`, `resetToState`.
- Produces: `<AboutScene engine={engine} />`, owning the envelope/document UI, `exitAboutToFaq` (including the glitch-fixes plan's Task 5 `isNavigatingRef` suppression fix — verify it's still present after the move), and `jumpToAboutState`.

- [ ] **Step 1: Re-locate this scene's boundaries**

```bash
grep -n "const exitAboutToFaq = \|const jumpToAboutState = " components/blueprint/BlueprintHero.tsx
```
Also locate every `envelope*`/`doc*`/`typo*`/`aboutContentRef`/`aboutOrbitTweenRef` ref.

- [ ] **Step 2: Write `AboutScene.tsx`**, following the same pattern as Tasks 5-7.

- [ ] **Step 3: Manually verify**

Run `npm run dev`. Confirm the About section's envelope/orbit animation and the About→FAQ handoff still work, specifically re-testing the glitch-fixes plan's Task 5 repro (light slow scroll vs. hard fast scroll from About into FAQ — the whole FAQ section should still fully reveal either way).

- [ ] **Step 4: Commit** (if git identity configured)

---

### Task 9: Slim `BlueprintHero.tsx` down to the orchestrator

**Spec:** design doc §2 (`BlueprintHero.tsx` after the split) and §4 (data flow).

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx`

**Interfaces:** none new — this task only removes now-dead code and confirms every temporary seam from earlier tasks was actually closed.

- [ ] **Step 1: Confirm Task 2's temporary `registerHandlers` seam was fully replaced**

By this point every scene owns its own trigger functions directly; `useSceneEngine`'s wheel/touch/keydown handlers should call scene-registered functions via `engine.registerScene(...)` (Task 4's pattern), not the old `registerHandlers` call-through. Remove `registerHandlers` from `useSceneEngine.ts` if nothing calls it anymore — confirm with `grep -rn "registerHandlers" components/` returning zero results before deleting it.

- [ ] **Step 2: Remove now-unused imports, refs, and the six `on*CompletedRef` callbacks** if no scene still needs them (check via `grep -rn "onHeroToProductCompletedRef\|onProductToHeroCompletedRef\|onProductToRingCompletedRef\|onRingToProductCompletedRef\|onConsolidateCompletedRef\|onRestoreStackCompletedRef" components/blueprint/`).

- [ ] **Step 3: Confirm the file's final line count and responsibility**

`wc -l components/blueprint/BlueprintHero.tsx` — should be a few hundred lines: the engine hook call, four scene component renders, shared chrome (stage container, portal clip element), and nothing else. If a function or ref that clearly belongs to one scene is still here, move it before calling this task done.

- [ ] **Step 4: Full manual regression pass**

Run `npm run dev`. Walk the entire page top to bottom in one session: Hero → Product → Security (all sub-states, forward and backward) → About → FAQ → Contact → "Back to Top", plus every nav-pill link. Re-run every repro step from both the root-cause report and the glitch-fixes plan's Review Focus section once more, now against the fully split codebase.

- [ ] **Step 5: Commit** (if git identity configured)

```bash
git add components/blueprint/BlueprintHero.tsx components/blueprint/hero-engine/ components/blueprint/scenes/
git commit -m "refactor: slim BlueprintHero.tsx down to scene orchestrator"
```

---

## After this plan

Glitches 2 and 3 (scroll-lock desync, asymmetric Ring↔About reveals) — deliberately deferred by the glitch-fixes plan specifically until this split existed — should now be re-audited against the new `sceneTransitions.ts`/`useSceneEngine.ts` structure. If Task 4's `resetToState` migration was done faithfully, both should already be substantially fixed as a side effect of no longer having 6-9 independently-duplicated reset paths; confirm this by re-running the root-cause report's original repro steps for those two glitches specifically, and only write a further fix plan if something still reproduces.
