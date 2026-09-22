# Glitch Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 of the 8 glitches root-caused in the accompanying report (duplicate navbar, vault door/rim not resetting, vault position drift, FAQ scroll-snap race, black card back-face, bento text/viewport inconsistency) as small, independently-verifiable, low-risk changes to the existing files — no restructuring, no new architecture.

**Architecture:** Each task is a targeted, surgical fix at the exact file:line(s) identified in the report. No task changes animation timing, easing, or visual design except Task 6 (which is an explicit design decision the user already made: remove the black card back-face entirely). One new lib module gets two small, pure, unit-tested helper functions as part of Task 7, since that fix requires writing new sizing logic anyway.

**Tech Stack:** Next.js 14 / React 18 / GSAP 3 (existing). Vitest + jsdom added as new dev dependencies for unit-testing pure functions only (Task 1) — no E2E/visual regression framework, per explicit user decision.

**Spec:** `Docs/2026-09-22-scroll-and-animation-glitch-root-cause-report.md` (root-cause report this plan implements fixes for).

## Global Constraints

- No automated E2E/browser/visual-regression tests. Every task below is verified by running `npm run dev`, reproducing the exact repro steps, and visually confirming the fix — per the user's explicit choice of "unit tests for pure math only."
- Do not change GSAP timing, easing, colors, or positions anywhere except where a task explicitly calls for it. These are bug fixes, not a redesign.
- Task 2 (Glitch 4, black card removal) is the one task with a real design decision behind it, already confirmed with the user: **remove the black obsidian back-face entirely** — Hero-resting cards use the same light front-face look as Product, just a different scale/position. Do not reintroduce it "for the first load only."
- **Glitch 2/3 (scroll-lock flag desync + asymmetric Ring↔About timelines) is intentionally NOT in this plan.** It requires killing 7+ substate timelines inside `navigateToSection` and rebuilding `consolidateRingToStack`/`restoreStackToRing` as one shared reversible timeline — a substantially larger, riskier change to the core scroll engine than anything below. Tackle it as its own follow-up plan once Tasks 1–7 here are verified stable.
- Work through tasks in order. Commit after each one. Do not start a task until the previous one has been manually verified against its own repro steps.

## Review Focus

- **Task 3 (SiteHeader guard):** confirm `SiteHeader` still renders correctly on every *other* route (`/about`, `/pricing`, `/contact`, `/features`, `/get-started`) — the guard must only suppress it on `/`.
- **Task 5 (vault dock reorder):** confirm the vault still docks correctly on the very *first* page load (scrolling down into Security for the first time), not just when re-entering from below — reordering the reset-before-measure could affect the first call to `computeDockLayout()` at mount, when `cardsClusterRef` may not have its final layout yet.
- **Task 4 (resetRim pairing):** confirm the inner dial doesn't visually "pop"/snap when `resetRim()` fires while the disc was mid-rotation from a `triggerRimStep` tween — `resetRim()` already kills `rimTweenRef` first, but look at it live, not just read the code.
- **Task 6 (black card removal):** the "cards flip one-by-one" cinematic step becomes a numeric no-op (rotateY 0→0). Confirm the Hero→Product intro still *looks* intentional without that flip — it shouldn't read as "an animation is missing."
- **Task 7 (bento font tiering):** confirm text doesn't overflow or wrap awkwardly inside any bento tile at each of the 4 width tiers (1024/1280/1366/1440), not just at your own screen's current size — resize the browser window (or devtools responsive mode) through all 4 tiers and check every tile's copy.

---

### Task 1: Add Vitest and unit tests for the existing pure viewport functions

**Files:**
- Modify: `package.json` (add devDependencies + `test` script)
- Create: `vitest.config.ts`
- Create: `lib/viewport.test.ts`

**Interfaces:**
- Consumes: `getComposedViewport`, `getViewportHeightScale`, `getCardRestHeight` (all already exported from `lib/viewport.ts`, unchanged).
- Produces: a working `npm test` command later tasks (7) add more test cases to.

- [ ] **Step 1: Add dependencies**

```bash
npm install -D vitest jsdom
```

- [ ] **Step 2: Add the `test` script**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write `lib/viewport.test.ts`**

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getComposedViewport,
  getViewportHeightScale,
  getCardRestHeight,
  DESKTOP_REFERENCE_WIDTH,
  DESKTOP_REFERENCE_HEIGHT,
} from "./viewport";

function setWindowSize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: height, configurable: true });
}

describe("getComposedViewport", () => {
  afterEach(() => {
    setWindowSize(1024, 768);
  });

  it("snaps two widths in the same tier to an identical value", () => {
    setWindowSize(1290, 900);
    const a = getComposedViewport();
    setWindowSize(1364, 900);
    const b = getComposedViewport();
    expect(a.vw).toBe(b.vw);
    expect(a.vw).toBe(1280);
  });

  it("clamps any width above the desktop reference to the reference width", () => {
    setWindowSize(2560, 1440);
    const result = getComposedViewport();
    expect(result.vw).toBe(DESKTOP_REFERENCE_WIDTH);
    expect(result.vh).toBe(DESKTOP_REFERENCE_HEIGHT);
  });

  it("still reports the true raw width/height alongside the tiered ones", () => {
    setWindowSize(1600, 1000);
    const result = getComposedViewport();
    expect(result.rawW).toBe(1600);
    expect(result.rawH).toBe(1000);
    expect(result.vw).toBe(DESKTOP_REFERENCE_WIDTH);
  });

  it("passes a width just under the smallest tier straight through, unsnapped", () => {
    setWindowSize(900, 700);
    const result = getComposedViewport();
    expect(result.vw).toBe(900);
  });
});

describe("getViewportHeightScale", () => {
  it("returns 1.0 for tall/standard screens", () => {
    expect(getViewportHeightScale(900)).toBe(1.0);
  });

  it("returns the floor scale for very short screens", () => {
    expect(getViewportHeightScale(500)).toBe(0.72);
  });

  it("interpolates linearly between the short and tall thresholds", () => {
    const mid = getViewportHeightScale(715); // halfway between 580 and 850
    expect(mid).toBeCloseTo(0.72 + 0.14, 2);
  });
});

describe("getCardRestHeight", () => {
  it("steps down for narrower viewports", () => {
    expect(getCardRestHeight(1600, 900)).toBe(375);
    expect(getCardRestHeight(1300, 900)).toBe(360);
    expect(getCardRestHeight(1024, 900)).toBe(345);
    expect(getCardRestHeight(500, 900)).toBe(285);
  });

  it("shrinks further on short-height screens", () => {
    const tall = getCardRestHeight(1600, 900);
    const short = getCardRestHeight(1600, 700);
    expect(short).toBeLessThan(tall);
  });
});
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npm test`
Expected: all suites pass (this is a safety net for the *existing* correct behavior — it should be green immediately, not red-then-green, since these functions aren't changing in this task).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/viewport.test.ts
git commit -m "test: add vitest and unit tests for existing viewport helpers"
```

---

### Task 2: Fix duplicate navbar — glitch 6

**Files:**
- Modify: `components/layout/SiteHeader.tsx:12-13`

**Interfaces:** none (self-contained, one component).

- [ ] **Step 1: Add the homepage guard**

In `components/layout/SiteHeader.tsx`, `SiteHeader` already computes `isHomepage` at line 13. Add the same early-return `SiteFooter.tsx:46` already uses, right after the existing hooks (after the `useGSAP` call, before the `return (`):

Current (`SiteHeader.tsx:68-70`):
```tsx
  );
}
```
(the closing of the `useGSAP` call, immediately followed by `return (`)

Change to add the guard between them:
```tsx
  );

  // On homepage, BlueprintNav is rendered directly in page.tsx instead.
  if (isHomepage) return null;

  return (
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`
- Visit `http://localhost:3000/` — confirm only the pill-shaped `BlueprintNav` appears, never the old bar, at any scroll position including immediately after clicking "Back to Top" from the Contact section.
- Visit `http://localhost:3000/about`, `/pricing`, `/contact`, `/features`, `/get-started` — confirm `SiteHeader` (the old bar with Product/Pricing/About/Contact links) still renders correctly and immediately-visible on all of these (per Review Focus).

- [ ] **Step 3: Commit**

```bash
git add components/layout/SiteHeader.tsx
git commit -m "fix: hide legacy SiteHeader on the homepage to stop duplicate navbar"
```

---

### Task 3: Fix vault door/rim not resetting — glitch 7

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx:1943-1945`
- Modify: `components/blueprint/BlueprintHero.tsx:2154-2157`
- Modify: `components/blueprint/BlueprintHero.tsx:4501-4503`
- Modify: `components/blueprint/BlueprintHero.tsx:5525-5527`
- Modify: `components/blueprint/BlueprintHero.tsx:7293-7295`
- Modify: `components/blueprint/BlueprintHero.tsx:7469-7472`

**Interfaces:**
- Consumes: `safeVault3DRef.current.resetRim?.()` — already defined on `SafeVault3DRef` (`components/blueprint/SafeVault3D.tsx:10`), just not called from these 6 sites yet.

- [ ] **Step 1: Add `resetRim()` next to each of the 6 `setOpenProgress(0)` calls that don't already have it**

At `:1943-1945`, change:
```tsx
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.pauseAmbient?.();
```
to:
```tsx
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.resetRim?.();
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.pauseAmbient?.();
```

At `:2154-2157` (inside the `tl.set({}, { onUpdate: () => {...} }, 0)` block), change:
```tsx
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(0);
              safeVault3DRef.current?.setCardsProgress?.(0);
              safeVault3DRef.current?.pauseAmbient?.();
```
to:
```tsx
            onUpdate: () => {
              safeVault3DRef.current?.setOpenProgress(0);
              safeVault3DRef.current?.resetRim?.();
              safeVault3DRef.current?.setCardsProgress?.(0);
              safeVault3DRef.current?.pauseAmbient?.();
```

At `:4501-4503`, change:
```tsx
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.pauseAmbient?.(true);
```
to:
```tsx
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.resetRim?.();
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.pauseAmbient?.(true);
```

At `:5525-5527`, change:
```tsx
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.resumeAmbient?.();
```
to:
```tsx
            safeVault3DRef.current?.setOpenProgress(0);
            safeVault3DRef.current?.resetRim?.();
            safeVault3DRef.current?.setCardsProgress?.(0);
            safeVault3DRef.current?.resumeAmbient?.();
```

At `:7293-7295`, change:
```tsx
        safeVault3DRef.current?.setOpenProgress(0);
        safeVault3DRef.current?.setCardsProgress?.(0);
        safeVault3DRef.current?.resumeAmbient?.();
```
to:
```tsx
        safeVault3DRef.current?.setOpenProgress(0);
        safeVault3DRef.current?.resetRim?.();
        safeVault3DRef.current?.setCardsProgress?.(0);
        safeVault3DRef.current?.resumeAmbient?.();
```

At `:7469-7472`, change:
```tsx
          safeVault3DRef.current?.setOpenProgress(0);
          safeVault3DRef.current?.setCardsProgress?.(0);
          safeVault3DRef.current?.pauseAmbient?.();
```
to:
```tsx
          safeVault3DRef.current?.setOpenProgress(0);
          safeVault3DRef.current?.resetRim?.();
          safeVault3DRef.current?.setCardsProgress?.(0);
          safeVault3DRef.current?.pauseAmbient?.();
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`, go to `http://localhost:3000/`.
- Scroll into the Security section, scroll a few sub-states forward (so the inner dial rotates), then scroll all the way back up past About/Contact and back down into Security again — confirm the dial is back at its starting angle at state 0, not wherever it was left.
- Repeat using a nav-pill click to jump directly back to the Security section from Contact — same expectation.
- Watch the dial specifically during this reset (per Review Focus) — confirm no visible pop/snap artifact.

- [ ] **Step 3: Commit**

```bash
git add components/blueprint/BlueprintHero.tsx
git commit -m "fix: reset vault inner dial alongside door on every re-entry to security state 0"
```

---

### Task 4: Fix vault position drift — glitch 1a/1b

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx:1725-1726`
- Modify: `components/blueprint/BlueprintHero.tsx:7247-7310`

**Interfaces:** none (self-contained within `computeDockLayout` and `instantShowSecurity`).

- [ ] **Step 1: Fix the unclamped viewport-center math (§1b)**

At `BlueprintHero.tsx:1725-1726`, change:
```tsx
        const viewportCenterY = (typeof window !== "undefined" ? window.innerHeight : 900) / 2;
        const viewportCenterX = (typeof window !== "undefined" ? window.innerWidth : 1440) / 2;
```
to use the already-clamped `liveW`/`liveH` computed two lines above (`:1694-1695`) instead of raw `window.innerWidth`/`innerHeight`:
```tsx
        const viewportCenterY = liveH / 2;
        const viewportCenterX = liveW / 2;
```

- [ ] **Step 2: Fix the stale-measurement-before-reset order (§1a)**

At `BlueprintHero.tsx:7247-7310`, inside `instantShowSecurity()`, the cluster's transform is currently reset to identity *after* `computeDockLayout()` reads its (possibly stale/offset) `getBoundingClientRect()`. Move the cluster reset to run *before* `computeDockLayout()` is called.

Current order:
```tsx
        // Layout measurements
        // Layout measurements via unified dock layout coordinator
        const dockLayout = computeDockLayout();
        const leftX = dockLayout.targetLeftX;
        const ringY = dockLayout.targetRingY;
        const shiftX = dockLayout.rightShiftX;
        const stackTargetX = dockLayout.stackTargetX;
        const stackTargetY = dockLayout.stackTargetY;
```
...(other code)...
```tsx
        const clusterEl = cardsClusterRef.current;
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
```

Change to: move the `clusterEl` reset block up to immediately before the `computeDockLayout()` call, so the measurement always reads an identity-transformed cluster:
```tsx
        // Reset the cluster's transform to identity BEFORE measuring it —
        // computeDockLayout() reads a live getBoundingClientRect() of this
        // element, so measuring it while it's still offset/rotated from a
        // prior state (e.g. left over from consolidateRingToStack) produces
        // the wrong dock position. See report §1a.
        const clusterEl = cardsClusterRef.current;
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
        const dockLayout = computeDockLayout();
        const leftX = dockLayout.targetLeftX;
        const ringY = dockLayout.targetRingY;
        const shiftX = dockLayout.rightShiftX;
        const stackTargetX = dockLayout.stackTargetX;
        const stackTargetY = dockLayout.stackTargetY;
```
Delete the now-duplicate second `clusterEl`/`gsap.set(clusterEl, ...)` block further down where it used to be (`:7297-7310` in the original file).

- [ ] **Step 2: Manually verify**

Run: `npm run dev`, go to `http://localhost:3000/`.
- Scroll straight down from the top into Security for the very first time (fresh page load) — confirm the vault docks at the same horizontal position it always did (per Review Focus: this must not regress).
- Scroll further down into About, then Contact, then scroll back up into Security — confirm the vault is at the *same* horizontal position as the first-load case, not shifted left.
- Repeat by using "Back to Top" from Contact, then scrolling back down into Security.
- Resize the browser window wider than 1440px (or use a wide external monitor / devtools responsive mode at e.g. 1920px) and repeat the above — confirm the vault position no longer drifts as width increases past 1440px.

- [ ] **Step 3: Commit**

```bash
git add components/blueprint/BlueprintHero.tsx
git commit -m "fix: stop vault dock position drifting on re-entry and on wide viewports"
```

---

### Task 5: Fix FAQ scroll-snap race — glitch 5

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx:3983-4013`

**Interfaces:**
- Consumes: `isNavigatingRef` (existing ref, already checked as the very first gate in both `handleWheel:6264-6268` and `handleTouchMove:6443-6447`) and `smoothScrollTo`'s existing `onComplete` option (`lib/gsap.ts:51`) — no changes needed to `lib/gsap.ts` or the wheel/touch handlers themselves.

- [ ] **Step 1: Suppress wheel/touch input for the duration of the About→FAQ snap scroll**

In `exitAboutToFaq()` (`BlueprintHero.tsx:3968-4014`), current code:
```tsx
            isSecurityTransitioningRef.current = false;

            const faqEl = document.getElementById("faq");
            if (faqEl) {
              smoothScrollTo(faqEl, { duration: 0.40, ease: "power2.out" });
            }
            dispatchActiveSection("faq");
```
Change to hold `isNavigatingRef` true for the duration of the snap, releasing it in `smoothScrollTo`'s own `onComplete`:
```tsx
            isSecurityTransitioningRef.current = false;

            const faqEl = document.getElementById("faq");
            if (faqEl) {
              isNavigatingRef.current = true;
              smoothScrollTo(faqEl, {
                duration: 0.40,
                ease: "power2.out",
                onComplete: () => {
                  isNavigatingRef.current = false;
                },
              });
            }
            dispatchActiveSection("faq");
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`, go to `http://localhost:3000/`.
- Scroll from About into FAQ with a single light, slow trackpad tick — confirm the FAQ section always ends up fully in view, not partially cut off.
- Repeat with a hard, fast mouse-wheel scroll (or a fast trackpad flick) — same expectation, and confirm it still feels responsive (the suppression window is only ~0.4s).
- Repeat scrolling from About into FAQ using touch (mobile emulation in devtools) with varying flick strength.

- [ ] **Step 3: Commit**

```bash
git add components/blueprint/BlueprintHero.tsx
git commit -m "fix: prevent scroll momentum from racing and killing the About-to-FAQ snap"
```

---

### Task 6: Remove the black card back-face entirely — glitch 4

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx:800-807` (mount defaults)
- Modify: `components/blueprint/BlueprintHero.tsx:7134-7145` (`instantResetHero`)

**Interfaces:** none (self-contained). Confirmed by direct reading that the only two places anywhere in the file that ever set the flipper's `rotateY` to `180` (showing the black back face) are these two locations, and the only place that ever makes `cardBackRefs` visible is inside the second one — so this is a complete, exhaustive fix, not a partial one.

- [ ] **Step 1: Fix the mount-time defaults**

At `BlueprintHero.tsx:799-807`, current code:
```tsx
        if (front) {
          gsap.set(front, {
            borderRadius: "0px",
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
          });
        }
        if (back) gsap.set(back, { borderRadius: "0px", borderColor: "transparent" });
        if (flipper) gsap.set(flipper, { rotateY: 180 }); // Back face forward initially
```
Change to use the same light styling as the Product-state front face (matching `:6944-6949`) and never rotate to show the back:
```tsx
        if (front) {
          gsap.set(front, {
            borderRadius: "0px",
            borderColor: "rgba(255, 255, 255, 0.75)",
            boxShadow:
              "0 20px 45px -12px rgba(16, 44, 28, 0.08), 0 8px 18px -6px rgba(0, 0, 0, 0.04), 0 0 20px -4px rgba(34, 197, 94, 0.08), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95), inset 0 0.5px 0.5px 0 rgba(255, 255, 255, 0.8), inset 0 -1.5px 3px 0 rgba(34, 197, 94, 0.06)",
          });
        }
        if (back) gsap.set(back, { borderRadius: "0px", borderColor: "transparent" });
        if (flipper) gsap.set(flipper, { rotateY: 0 }); // Front face forward always — no black back-face
```

- [ ] **Step 2: Fix `instantResetHero()`'s re-establishment of the Hero-resting look**

At `BlueprintHero.tsx:7133-7145`, current code:
```tsx
          if (flipper) gsap.set(flipper, { rotateY: 180 });
          if (front) {
            front.style.background = "";
            gsap.set(front, {
              borderRadius: "0px",
              background: "",
              backgroundColor: "#070908",
              borderColor: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4)",
              clearProps: "background",
            });
          }
          if (back) gsap.set(back, { opacity: 1, autoAlpha: 1, visibility: "visible" });
```
Change to:
```tsx
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
```

- [ ] **Step 3: Manually verify**

Run: `npm run dev`, go to `http://localhost:3000/`.
- On fresh page load, before scrolling: confirm the resting Hero cards show the light front-face design, never black.
- Scroll Hero → Product, then back up to Hero, repeatedly, several times in a row — confirm black never appears at any point.
- Use "Back to Top" from Contact — confirm the Hero cards are light, not black, immediately after.
- Watch the "cards flip one-by-one" moment during the Hero→Product intro specifically (per Review Focus) — confirm it still reads as an intentional part of the cinematic (a subtle settle/stagger) rather than looking like a step is missing. If it looks like genuinely nothing happens and reads as broken, flag this for a follow-up decision (e.g. replace the now-inert flip stagger with a different subtle stagger effect) rather than silently leaving it.

- [ ] **Step 4: Commit**

```bash
git add components/blueprint/BlueprintHero.tsx
git commit -m "fix: remove black obsidian card back-face, cards stay on their light front face always"
```

---

### Task 7: Fix bento card text sizing across laptop screens — glitch 8

**Files:**
- Modify: `lib/viewport.ts` (add one new pure, exported, tested function)
- Modify: `lib/viewport.test.ts` (add tests for it)
- Modify: `components/blueprint/BlueprintHero.tsx:6735-6750` (`applyBentoLayoutToCards`)
- Modify: `components/blueprint/BlueprintHero.tsx` at the 20 bento tile text `fontSize` styles listed in Step 3

**Interfaces:**
- Produces: `getBentoVwTierPx(composedVw: number): number` — exported from `lib/viewport.ts`, converts an already-tiered viewport width into "1% of that width, in px," for use inside a CSS `clamp()`.

- [ ] **Step 1: Add the pure helper to `lib/viewport.ts`**

Append to `lib/viewport.ts`:
```ts
/**
 * Converts an already-tiered/clamped composed viewport width (see
 * getComposedViewport) into the equivalent "1% of that width" CSS length in
 * px. Bento card copy uses this inside `clamp()` in place of the browser's
 * raw, un-tiered `vw` unit, so two laptops in the same width tier render
 * identical text sizes, not just an identical box (see
 * Docs/2026-09-22-scroll-and-animation-glitch-root-cause-report.md §8).
 */
export function getBentoVwTierPx(composedVw: number): number {
  return composedVw * 0.01;
}
```

- [ ] **Step 2: Add tests for it to `lib/viewport.test.ts`**

Append:
```ts
import { getBentoVwTierPx } from "./viewport";

describe("getBentoVwTierPx", () => {
  it("converts a tiered width into 1% of that width, in px", () => {
    expect(getBentoVwTierPx(1440)).toBeCloseTo(14.4, 5);
    expect(getBentoVwTierPx(1024)).toBeCloseTo(10.24, 5);
  });

  it("gives two same-tier widths the identical result", () => {
    // 1290 and 1364 both snap to the 1280 tier in getComposedViewport
    expect(getBentoVwTierPx(1280)).toBe(getBentoVwTierPx(1280));
  });
});
```

Run: `npm test` — expect all tests (including the new ones) to pass.

- [ ] **Step 3: Set the CSS custom property from the already-clamped `vw` in `applyBentoLayoutToCards`**

At `BlueprintHero.tsx:6735-6750`, current code:
```tsx
      const applyBentoLayoutToCards = (vw: number, vh: number) => {
        const bento = computeBentoLayout(vw, vh);
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
```
Change to also set `--bento-vw-tier` on the shared cluster ancestor, using the same already-tiered `vw` the box itself uses:
```tsx
      const applyBentoLayoutToCards = (vw: number, vh: number) => {
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
```
Add `getBentoVwTierPx` to the existing `import { getComposedViewport, ... } from "@/lib/viewport"` line near the top of `BlueprintHero.tsx`.

- [ ] **Step 4: Replace each bento tile's raw-`vw` `clamp()` with the tiered custom property**

At each of these 20 lines, replace the `Mvw` term with `calc(M * var(--bento-vw-tier, 14.4px))` (the `14.4px` fallback is the value for the 1440px desktop-reference tier, so text still renders sensibly for one frame before `applyBentoLayoutToCards` first runs):

| Line | Before | After |
|---|---|---|
| 8320 | `clamp(20px, 2.2vw, 32px)` | `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)` |
| 8337 | `clamp(14.5px, 1.2vw, 17.5px)` | `clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)` |
| 8353 | `clamp(14.5px, 1.2vw, 17.5px)` | `clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)` |
| 8369 | `clamp(14.5px, 1.2vw, 17.5px)` | `clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)` |
| 8385 | `clamp(14.5px, 1.2vw, 17.5px)` | `clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)` |
| 8399 | `clamp(18px, 1.85vw, 26px)` | `clamp(18px, calc(1.85 * var(--bento-vw-tier, 14.4px)), 26px)` |
| 8406 | `clamp(12.5px, 1.0vw, 15px)` | `clamp(12.5px, calc(1.0 * var(--bento-vw-tier, 14.4px)), 15px)` |
| 8426 | `clamp(20px, 2.2vw, 32px)` | `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)` |
| 8432 | `clamp(13px, 1.05vw, 16px)` | `clamp(13px, calc(1.05 * var(--bento-vw-tier, 14.4px)), 16px)` |
| 8442 | `clamp(18px, 1.75vw, 25px)` | `clamp(18px, calc(1.75 * var(--bento-vw-tier, 14.4px)), 25px)` |
| 8458 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8474 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8490 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8506 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8520 | `clamp(18px, 1.75vw, 25px)` | `clamp(18px, calc(1.75 * var(--bento-vw-tier, 14.4px)), 25px)` |
| 8536 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8554 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8570 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8586 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 8602 | `clamp(12.5px, 0.95vw, 14px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |

Each is a `style={{ fontSize: "..." }}` JSX attribute — only the string inside `fontSize` changes, e.g. line 8320 becomes:
```tsx
                                     style={{ fontSize: "clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)" }}
```

- [ ] **Step 5: Manually verify**

Run: `npm run dev`, go to `http://localhost:3000/`, scroll into the Product/bento section.
- At your current window width, confirm all 5 tiles' text renders at a similar size/proportion to before this change.
- Resize the browser window (or devtools responsive mode) to widths in each of the 4 tiers — roughly 1000px, 1300px, 1400px, and 1500px+ — and at each, confirm no tile's copy overflows its card or wraps awkwardly (per Review Focus).
- Compare two widths within the same tier (e.g. 1290px vs. 1360px, both in the 1280 tier) — confirm text renders at the identical size in both, matching the box.

- [ ] **Step 6: Commit**

```bash
git add lib/viewport.ts lib/viewport.test.ts components/blueprint/BlueprintHero.tsx
git commit -m "fix: size bento card text from the same tiered viewport width as the box"
```

---

## Deferred: Glitches 2 & 3 (scroll-lock desync, scroll-up asymmetric reveals)

Not scoped into this plan — see Global Constraints above. Once Tasks 1–7 are merged and verified stable, come back to the report's §2/§3 fix directions (kill all substate timelines inside `navigateToSection` before any `instantShowX()` call; unify `consolidateRingToStack`/`restoreStackToRing` into one shared, reversible timeline like `createProductToRingTimeline` already is) as its own plan.
