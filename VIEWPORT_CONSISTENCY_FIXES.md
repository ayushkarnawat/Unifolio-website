# Viewport Consistency Fix Brief

**Read this whole document before making any changes.** It's a handoff from a prior Claude Code session that spent significant time diagnosing why this site (Next.js + GSAP + Three.js, branch `dark-mode`) looks visually different across desktop/laptop screen widths (1280px–2560px+), and applying fixes. Some fixes are already in place; one concrete fix is still outstanding; a couple of items were deliberately deferred. Your job is to verify the existing fixes are intact, implement the outstanding fix, and re-scan for anything new.

## IMPORTANT FIRST STEP: check for concurrent edits

Before touching anything, run `git status` and `git diff` on the files listed below. **Another AI coding session may have been actively editing this exact repo** (same working directory) in parallel with the session that wrote this brief. Read the current state of every file fresh — do not assume line numbers or exact code below still match. Search for the described patterns/snippets instead of trusting line numbers.

---

## The core problem (context, already understood — don't re-derive it)

This codebase computes a lot of absolute pixel positions/sizes for GSAP-animated elements directly from `window.innerWidth` / `window.innerHeight`, with no upper bound. Two patterns cause visible inconsistency across desktop widths:

1. **Unbounded scaling**: formulas like `radius = vh * 0.22` or `bentoWidth = vw * 0.92` grow forever as the viewport grows, so the same UI element is dramatically bigger/more spread out on a 2560px monitor than on a 1280px laptop.
2. **Flat 2-bucket breakpoints**: `isDesktop = window.innerWidth >= 1024` treats everything from 1024px to 2560px+ as one bucket, so a 1280px laptop and a 2560px monitor get identical fixed pixel constants, which can look right at one width and wrong at the other.

The whole codebase's own SSR fallbacks (`typeof window !== "undefined" ? window.innerWidth : 1440`, sprinkled everywhere) is a strong signal that **1440px was the actual design reference width** this was built against. The fix strategy has been: clamp anything that scales with raw viewport dimensions to a `1440×900` reference frame, so:
- Below 1440px width, behavior is **completely unchanged** (still scales down for smaller laptops, exactly as before).
- Above 1440px, the element **stops growing/shifting further** and instead just re-centers within the extra space — same absolute composition, bigger margins.

This preserves the "current desktop" look as the source of truth while staying genuinely responsive down to smaller screens.

A shared helper already exists for this — **do not duplicate it, reuse it**:

```ts
// lib/viewport.ts
export const DESKTOP_REFERENCE_WIDTH = 1440;
export const DESKTOP_REFERENCE_HEIGHT = 900;

export function getComposedViewport(fallbackWidth = DESKTOP_REFERENCE_WIDTH, fallbackHeight = DESKTOP_REFERENCE_HEIGHT) {
  const rawW = typeof window !== "undefined" ? window.innerWidth : fallbackWidth;
  const rawH = typeof window !== "undefined" ? window.innerHeight : fallbackHeight;
  return {
    vw: Math.min(rawW, DESKTOP_REFERENCE_WIDTH),
    vh: Math.min(rawH, DESKTOP_REFERENCE_HEIGHT),
  };
}

export function getCardRestHeight(vWidth: number): number {
  return vWidth >= 1536 ? 375 : vWidth >= 1280 ? 360 : vWidth >= 1024 ? 345 : vWidth >= 768 ? 330 : vWidth >= 640 ? 310 : 285;
}
```

**Rule of thumb for every fix below**: clamp values used for *sizing* (radii, widths, scale multipliers) and for *shift/offset amounts* to the reference. Do **not** clamp values used to find the *true center of the real viewport* (e.g. `window.innerWidth / 2` used to center something) — those must keep tracking the real viewport so elements stay centered as the screen gets wider, not drift to one side. Getting this distinction right is the crux of nearly every fix here.

---

## Part A — Fixes already applied (verify these are present; do not revert or duplicate)

Search each file for these patterns to confirm they're intact. If a concurrent session removed or altered any of these, restore the clamping behavior (exact implementation doesn't need to match verbatim, but the *effect* — clamped to 1440/900 reference — must hold).

### 1. `lib/viewport.ts`
The helper file shown above should exist. If missing, recreate it.

### 2. `components/blueprint/BlueprintHero.tsx`
- Imports `getComposedViewport`, `getCardRestHeight`, `DESKTOP_REFERENCE_WIDTH` from `@/lib/viewport`.
- `getInitialRadiusPx()` (hero portal ring radius, search for `Math.max(145, Math.round(Math.min(` near the top of the file): uses `getComposedViewport()` instead of raw `window.innerWidth`/`innerHeight`.
- `computeBentoLayout(vWidth, vHeight)` (the 5-card bento grid layout function, search for `maxBentoW`): the box's own *size* (`maxBentoW`) is computed from `Math.min(vWidth, DESKTOP_REFERENCE_WIDTH)`, NOT raw `vWidth` — but the box's *position* (`bentoViewportLeft = (vWidth - bentoW) / 2`, `clusterViewportLeft`) still uses the real `vWidth`, so it correctly re-centers in the real viewport.
- Every `vCenterX` / `composedCenterX` / `viewportCenterX`-derived **shift amount** (search for `* 0.42`, `* 0.44`, `* 0.30`, `* 0.32`, `* 0.16`, `* 0.20` — these are the ring/card "consolidation" horizontal shift multipliers, there are ~8 call sites) is computed from a width **clamped to `DESKTOP_REFERENCE_WIDTH`**, e.g. `Math.min(vwVal, DESKTOP_REFERENCE_WIDTH) / 2`. The *true-center* variables used elsewhere for actual centering math (e.g. `fallbackTargetRingX = viewportCenterX - clusterCenterX`) are correctly left unclamped.
- `hRest` (resting card height when docking back into the grid) calls the shared `getCardRestHeight(vWidth)` helper instead of a locally duplicated lookup table (there were 3 duplicated copies before the fix — should now be 1 shared function, 3 call sites).
- Two decorative "god ray" background divs (search for `w-[60vw]` and `w-[55vw]`) have `max-w-[864px]` / `max-w-[792px]` caps added.
- The already-correct pattern to model new fixes on: ring radius elsewhere in this file already used `Math.min(Math.max(vh * 0.22, 160), 220)` — a floor AND a ceiling — before any of this work started. That's the target shape for any raw `vw`/`vh` formula: floor, ceiling, or reference-clamp.

### 3. `components/blueprint/BlueprintStackingCards.tsx`
- Imports `getComposedViewport` from `@/lib/viewport`.
- `getScrollAmount()` and `getEndDistance()` (the pinned horizontal-scroll-track math) use `getComposedViewport().vw` instead of raw `window.innerWidth`, with a `Math.max(..., 0)` floor so scroll distance can never go to zero or invert on wide screens.
- Note: as of the last audit, this component was **not imported/rendered by any page** (dead code). Worth a quick check whether that's still true — if it's now wired up somewhere, this fix matters a lot more.

### 4. `components/product/ProductExperience.tsx`
- Imports `DESKTOP_REFERENCE_WIDTH` from `@/lib/viewport`.
- `dockedLeftX` (search for `composedScreenW`): the ring's "dock left" offset used to plateau at a flat 380px past 1520px width; now computed as `Math.min(screenW, DESKTOP_REFERENCE_WIDTH) * 0.25` for the desktop branch, consistent with the 1440 reference used everywhere else.
- `ringRadius` in this file was already correctly bounded (`Math.min(Math.max(vh * 0.22, 160), 215)`) — no change needed there.

### 5. `components/blueprint/SafeVault3D.tsx`
This file was **completely rewritten** (from a ~2000-line Three.js/WebGL component to a ~274-line pure-CSS/DOM component using `%`-relative sizing and `transformStyle: preserve-3d`) by whoever made the "past few days" changes referenced below. As last audited, it contains **zero** `window.innerWidth`/`innerHeight` reads — it's purely relative to its parent container, so it can't itself cause width-dependent drift. If it's been changed further, re-check for any new raw viewport reads.

---

## Part B — Outstanding fix (not yet implemented — this is the main task)

### The bug, as reported by the user with screenshots

On the **security section's first reveal state** — the moment showing the vault graphic + heading "We take your data as seriously as you take your money." — the composition (vault illustration + heading text) is **not staying together as one consistent unit** as viewport width changes. At larger widths it visually drifts — vault and text don't hold their relative position/spacing to each other, and the whole group doesn't behave like a single fixed-size block that simply re-centers in extra space (which is the target behavior, same as the bento grid and ring already achieve).

Confirmed via direct measurement (using this codebase's own debug hook, see below) at 1440 / 1920 / 2490px widths:

- The `targetLeftX` ref (the absolute pixel shift applied to the vault/safe container) is **already constant at -317px regardless of width** — that part is fixed correctly (see Part A, item 2/4).
- BUT the vault's position **as a percentage of viewport width** still drifts (~28% → ~34% → ~37% of width, roughly, across 1440/1920/2490) because that fixed `-317px` shift is subtracted from `viewportCenterX = window.innerWidth / 2`, which itself grows with the real viewport. A fixed pixel offset from a width-scaling center is mathematically guaranteed to produce a width-dependent result.
- The heading text block is positioned by a **separate** mechanism (its own `left-1/2 -translate-x-1/2` centering plus responsive Tailwind padding classes like `md:pl-16 lg:pl-26 xl:pl-32`), independent of the vault's GSAP-driven position. Because they're two independently-computed positions, they don't stay glued together as a single composition as width changes.

### Where to look

- **File**: `components/blueprint/BlueprintHero.tsx`
- **The vault/safe container**: search for `safeContainerRef` (defined near the top with `useRef`, rendered around a JSX block containing `<SafeVault3D`, with className `w-[270px] sm:w-[330px] lg:w-[390px] xl:w-[430px] h-[270px] sm:h-[330px] lg:h-[390px] xl:h-[430px]`). Its GSAP `x`/`y` position comes from `targetLeftXRef.current` / `targetRingYRef.current`, which are set in a block computing `targetRingX = Math.round(viewportCenterX - clusterCenterX)`, `leftShift` (already clamped, see Part A), `targetLeftX = targetRingX - leftShift`. There are multiple call sites that read `targetLeftXRef.current` to actually apply the position via `gsap.set`/`gsap.to` on `safeContainerRef.current` (search for `safeContainerRef.current,\n            gsap.set` / `gsap.to` and for the comment `// Dock safe to left side of viewport`).
- **The heading text block**: search for `SECURITY_STATES.map` — renders one `<div>` per state with class `absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl px-5 sm:px-6 ${idx === 0 ? "md:pl-16 lg:pl-26 xl:pl-32 md:pr-4" : "md:pl-16 lg:pl-28 xl:pl-36"}`. The `idx === 0` state (search for `item.type === "hero"`, and `securityHeroRibbonRef`) is the one containing the "We take your data as seriously..." headline and the money-icon animation (search for `MONEY_LETTERS`).
- **Debug tool available in the running app**: this codebase exposes `window.__biDebug` (search for `__biDebug` in `BlueprintHero.tsx`) with live refs including `stateRef` (current macro state name), `targetLeftXRef`, `targetRingYRef`. You can read these directly in a headless browser (`page.evaluate(() => window.__biDebug.targetLeftXRef.current)`) to verify a fix numerically instead of only screenshotting.

### Recommended fix approach

Treat "vault + heading" as **one fixed-size composition block**, the same philosophy already applied to the bento grid (Part A, item 2):

1. Compute a single reference point for the whole composition — e.g. clamp `viewportCenterX` itself to `Math.min(window.innerWidth, DESKTOP_REFERENCE_WIDTH) / 2` **for this specific composition's positioning math** (both the vault's target X and the heading block's effective horizontal position), rather than letting the vault use a fixed-pixel-offset-from-real-center while the heading uses independent CSS centering.
2. Concretely: rather than `targetLeftX = (real center) - (clamped shift)`, prefer something like `targetLeftX = (clamped center) - (clamped shift)` so that above 1440px width, the vault's absolute pixel position stops changing entirely (matching how the bento grid and ring freeze in place and just get more margin around them).
3. For the heading block: since it's centered via CSS (`left-1/2 -translate-x-1/2`) rather than GSAP, achieving "moves in lockstep with the vault, frozen above 1440px" likely means either (a) giving its wrapping container the same GSAP-driven `x` treatment as the vault (tying both to one shared computed offset), or (b) capping the *outer wrapping container's* effective width/position so the CSS centering itself resolves to a frozen pixel position above 1440px, similar in spirit to how `computeBentoLayout` clamps `maxBentoW` while still centering via real `vWidth`. Whichever approach you take, the acceptance test below is what matters, not the specific mechanism.
4. Do **not** touch the mobile/tablet code paths (anything gated behind `isTablet`/`isMobile`/`< 1024`/`< 768` checks) — only the desktop (`isDesktop`/`≥ 1024`) branch needs this treatment, exactly as every other fix in this document has been scoped.

### Acceptance test for this fix

At each of 1280 / 1440 / 1920 / 2560 / 2880px viewport width (same height, e.g. 900), with the app scrolled/wheel-advanced into this exact security state:
- Below 1440px: behavior must be pixel-identical to before this fix (nothing here should change for smaller screens).
- At/above 1440px: the **absolute pixel position** of the vault graphic and the **absolute pixel position** of the heading text relative to each other should be **constant** (not just the shift amount — the actual rendered `getBoundingClientRect()` of both elements, measured relative to each other, e.g. `headingRect.x - vaultRect.right`, should not change as width grows past 1440). The whole block should simply sit with growing, roughly-equal empty margin on both left and right as the viewport widens, the same way the bento grid already behaves.

---

## Part C — Deliberately deferred (do NOT attempt without user visual sign-off)

### Three.js dock offsets in `components/product/CardSculpture.tsx` and `components/hero/HeroCanvas3D.tsx`

Both files position 3D ring/card objects using **fixed world-unit offsets** (e.g. `targetDockX = isMobile ? 0 : -2.75` in `CardSculpture.tsx`, world-unit `.position.set(...)` calls in `HeroCanvas3D.tsx`) combined with a camera that has a fixed FOV/distance. Because pixel-size of world content depends only on render *height* (not width) with this camera setup, but the offset is a flat world-unit constant, the composition can drift relative to DOM text as the viewport's *aspect ratio* changes (not just its width) — e.g. a 16:10 laptop (1440×900) vs a 16:9 monitor (1920×1080, 2560×1440) have different aspect ratios even when "reference width" matches.

**Why this was deferred**: the correct fix requires knowing which aspect ratio the animator actually eyeballed the composition against when tuning these numbers by hand. Guessing and applying an aspect-based correction risks making the composition worse in a way that's only verifiable by a human looking at it, not by measuring numbers. If you attempt this, do it interactively with the user watching a live preview, adjusting the correction factor until it looks right at 2-3 different aspect ratios, rather than computing a "correct" value analytically.

### `components/blueprint/BlueprintFaq.tsx` and `components/hero/HeroIntroLogo.tsx`

Both were investigated and found to be **already correctly bounded** — no fix needed:
- `BlueprintFaq.tsx`'s carousel sits inside an outer `max-w-7xl mx-auto` wrapper, so its desktop-bucket flat pixel widths are already effectively capped by that wrapper.
- `HeroIntroLogo.tsx`'s intro logo has a flat `xl:w-[840px]` above the `xl` breakpoint, centered via flexbox in a `fixed inset-0` overlay — a flat width that stays centered as viewport grows *is* the correct target behavior, not a bug.

---

## Methodology notes for re-scanning

If you want to check for any *other* instances of this same class of bug beyond what's listed above (e.g. if the concurrent session added new animated sections), grep the codebase for:

```
grep -rn "innerWidth \*\|innerHeight \*\|vw \*\|vh \*\|screenW \*\|vwVal \*\|vhVal \*\|viewportWidth \*\|viewportCenterX \*\|vCenterX \*" --include="*.tsx" --include="*.ts" app components lib
```

For each hit, check whether it's already piped through `getComposedViewport()` / clamped to `DESKTOP_REFERENCE_WIDTH` / already has a floor-and-ceiling clamp like `Math.min(Math.max(x, floor), ceiling)`. If not, and it's used for *sizing or shift-amount* math (not for finding a true viewport center to center something), apply the same reference-clamp treatment.

Also distinguish real bugs from **intentionally flat/bounded desktop values** — these are fine as-is and should not be "fixed" further:
- Any flat Tailwind width/height above a breakpoint (e.g. `xl:w-[430px]`) that's centered via flexbox or `left-1/2 -translate-x-1/2` — a fixed size that recenters IS the correct target behavior.
- `isDesktop`/`isTablet`/`isMobile` boundary checks themselves (the `< 640` / `< 1024` thresholds) — these are legitimate mobile-vs-desktop breakpoints, not part of this bug class.
- `prefers-reduced-motion` handling — unrelated.

## Validation plan

Test at minimum: 1280×800, 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440, and one ultrawide (3440×1440) if possible. For animated/scroll-driven sections, don't just check the resting/loaded state — scroll or wheel-advance into each major story beat (hero ring, bento grid, security vault reveal, docked/consolidated states) at each width and compare.

A practical way to drive this without a real mouse: Puppeteer/Playwright with `page.mouse.wheel({ deltaY })` in a loop (many of these sections use scroll-jacking that doesn't respond to `window.scrollTo`, only real wheel events) — and where available, read this app's own `window.__biDebug` refs directly for exact numbers instead of only comparing screenshots.

Run `npx tsc --noEmit`, `npx next lint`, and `npm run build` after changes — all three passed clean after the Part A fixes and should continue to.
