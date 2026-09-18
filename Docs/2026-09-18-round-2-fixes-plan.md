# Round 2 Fixes — Post-Implementation Regression & Polish Plan

> **SUPERSEDED (Round 3, 2026-09-18):** items 3 and 4's fix (`getBoundingClientRect()` live measurement)
> was itself wrong — it measures the *rendered* (post-transform) position, which is contaminated by
> whatever GSAP transform (x/y/rotateZ) is active on the element when the code runs. This caused a
> `ReferenceError: clusterEl is not defined` crash in `restoreStackToRing` (no local `clusterEl` there,
> unlike the other two copies) that wedged the site's scroll entirely, plus a separate "About content
> pushed too low" regression. The corrected fix (already applied directly to the code, not via this
> doc) uses `element.offsetTop` + `offsetParent.getBoundingClientRect().top` instead, which is immune to
> `transform`. See `project_animation_polish_plan.md` memory (Round 3) for the full writeup. Do not
> re-apply the `getBoundingClientRect()`-based snippets below.

**Date:** 2026-09-18
**Context:** Anti-gravity executed all 11 items from `2026-09-18-animation-polish-and-ui-refinement-plan.md` faithfully. Manual QA surfaced 7 new issues — 3 are genuine regressions introduced as a side effect of that round's layout change, 2 are "shared timescale overshot on one already-long segment," 1 is a residual/partial fix, 1 is a subjective design-quality miss. This doc diagnoses each against the current code (verified 2026-09-18, post-Round-1) and gives a scoped fix. **Do not touch anything not listed here** — several things the user explicitly confirmed now look correct (vault door open/close pacing, FAQ solid-line direction, bento tile content).

---

## Root cause shared by items 3, 4, 5 (read this first)

Round 1's product-spacing fix (`productWorldRef`: `justify-start` + asymmetric top padding → `justify-center` + symmetric padding, `BlueprintHero.tsx` ~line 7788) was correct in isolation, but it moved the natural/rest screen position of `cardsClusterRef` (and everything else inside `productWorldRef`, including the About content). Two other pieces of code encode assumptions about that rest position as **hardcoded numbers** rather than **live measurements**, and nobody updated them when the parent layout changed:

1. `computeBentoLayout()` (~line 838-921) computes `clusterViewportTop` from a hardcoded `ptRem`-based formula whose comment literally says `// productWorldRef pt (80px...) + stage pt (8px) + cluster py (6px)` — describing the *old* layout.
2. `targetEnvelopeY` is computed independently in **three separate places** (`consolidateRingToStack` ~line 4158, a snap/jump variant ~line 4002, and `restoreStackToRing` ~line 5355) as a tuned magic-number `y` transform offset, not derived from a live rect. It was tuned against the old rest position too.

Both are instances of the same mistake: baking a screen-position assumption into a constant instead of measuring it live. Fix both the same way — replace the hardcoded assumption with a `getBoundingClientRect()` read of the actual element, taken at a moment when the element is known to be at rest (i.e., before any transform for that transition has started).

---

## 1. Hero video — residual loop jitter

**File:** `components/hero/HeroApertureVisual.tsx`
**Current state (confirmed):** dual-video crossfade exists and mostly works. The bug: the opacity ramp toward the inactive video starts in the *same tick* as `inactive.currentTime = 0; inactive.play()`. `play()` is asynchronous — there's real seek/decode-startup latency before the browser is actually rendering live frames from position 0. For a brief window, opacity is ramping up on a video element that's still on a stale frame (or black), which reads as a jitter/hiccup at the loop point. There's also a small mismatch: the CSS transition is `duration-500` but the JS swap-over happens after `600`ms.

**Fix:**
```js
isCrossfadingRef.current = true;
inactive.currentTime = 0;

const startCrossfade = () => {
  if (activeVideoRef.current === "A") { setOpacityA(0); setOpacityB(1); }
  else { setOpacityA(1); setOpacityB(0); }

  setTimeout(() => {
    active.pause();
    active.currentTime = 0;
    activeVideoRef.current = activeVideoRef.current === "A" ? "B" : "A";
    isCrossfadingRef.current = false;
  }, 500); // match the CSS duration-500 exactly
};

const playPromise = inactive.play();
if (playPromise && typeof playPromise.then === "function") {
  playPromise.then(startCrossfade).catch(startCrossfade);
} else {
  startCrossfade();
}
```
Only begin the opacity ramp once the browser confirms playback has actually started (the `play()` promise resolving is the standard signal for this). Also bump `CROSSFADE_TRIGGER_BEFORE_END` from `0.6` to `0.8` to give more buffer margin for that latency without risking the outgoing video visibly freezing at its last frame before the swap completes.

**Test:** Watch the hero video loop for at least 3 full cycles at normal speed and while scrubbing browser dev tools' CPU throttling (4x slowdown) to make latency more visible — should be seamless in both.

---

## 2. Navbar icons — too thin/weak, doesn't read as "bold sketch"

**File:** `components/blueprint/BlueprintNav.tsx`, `NavSketchIcon` (lines ~23-130)
**Current state (confirmed):** all 5 icons render at `23px`/`25px (sm)`, primary `strokeWidth="1.35"`, with several secondary decorative elements pushed to `opacity 0.5-0.8` and `strokeDasharray`. At that render size, a 1.35 stroke on a 28-unit viewBox reads as hairline-thin, and the faded/dashed secondary paths add visual clutter without adding weight — this is why it reads as "randomly there" instead of bold, versus the previous 3D PNGs.

**Fix, applied to all 5 icon definitions:**
- Increase render size: `w-[26px] h-[26px] sm:w-[28px] sm:h-[28px]` (verify no nav overflow/collision at the smallest supported breakpoint before finalizing).
- Increase primary `strokeWidth` from `1.35` → `2` (and bump any secondary strokes that were `1.1`/`1.25` proportionally to `~1.6`).
- Drop the low-opacity decorative dashed elements that don't define the icon's core silhouette (e.g. the dashed `strokeDasharray="2 2" opacity="0.55"` path in the product icon, the dashed orbit rings in `security`/`about`) — keep one bold primary shape + at most one accent per icon so it reads clearly at nav size.
- Increase the small accent dot/fill radius (`circle r="0.75"`/`r="0.8"`/`r="1"`/`r="1.3"`) by roughly 40% so it doesn't disappear against the bolder strokes.

**Test:** Compare against the pre-Round-1 3D PNG icons side by side (git show the old commit if needed) for visual weight parity; check active/hover green state still reads clearly.

---

## 3. Bento box — white space above, tiles cut off/half-visible, disappears on further scroll

**File:** `components/blueprint/BlueprintHero.tsx`, `computeBentoLayout()` (~line 838-921) and its two call sites (initial seed ~line 955-971, and inside `createRestingToBentoTimeline` ~line 1436)

**Root cause:** see shared section above — `clusterViewportTop` is a stale hardcoded formula.

**Fix:**
```js
// Replace the hardcoded ptRem/clusterViewportTop formula with a live measurement
// of the actual cluster element, taken while it is still at its CSS rest position
// (i.e. before any bento-transition transform has been applied).
const liveTop = cardsClusterRef.current?.getBoundingClientRect().top;
const clusterViewportTop = liveTop !== undefined
  ? liveTop
  : (vWidth >= 1024 ? 5 : vWidth >= 768 ? 4.5 : vWidth >= 640 ? 4 : 3.5) * 16 + 8 + 6; // SSR/pre-mount fallback only
```
Apply this at **both** call sites — the one-time init seed and the one inside `createRestingToBentoTimeline`. At the timeline call site specifically, make sure this measurement happens at timeline-build time (before any `gsap.set`/tween in that same timeline has moved `cardsClusterRef`), so the rect read reflects true rest position, not a mid-transition value.

**Test:** Scroll into the bento grid from the resting product-cards state at 1440×900, 1280×800 (MacBook), 1920×1080, and a mobile viewport (390×844). Confirm no white space above the grid, all tiles fully visible, and the grid doesn't visually collapse/disappear on continued scroll.

---

## 4. Security→About transition — white space above, content appears below the fold

**Files:** `components/blueprint/BlueprintHero.tsx` — `consolidateRingToStack` (~line 4158), the snap/jump variant (~line 4002), `restoreStackToRing` (~line 5355)

**Root cause:** see shared section above — `targetEnvelopeY` in all three places is a tuned relative `y`-transform offset calibrated against the old `productWorldRef` rest position.

**Fix:** Convert each of the three `targetEnvelopeY` definitions from a tuned magic-number offset into a value derived from where the cluster currently sits, the same way the rest of `consolidateRingToStack`'s waypoint math already does it (see `dx1 = curX + (px1 - clusterCenterX)` pattern a few lines below it in the same function):
```js
// Instead of a hand-tuned constant, express the target as an absolute
// viewport-relative Y, then convert to a gsap `y` delta against the
// cluster's live current position:
const targetAbsoluteY = /* existing vhVal-based clamp formula, kept as-is */;
const clusterRectNow = clusterEl.getBoundingClientRect();
const targetEnvelopeY = curY + (targetAbsoluteY - clusterRectNow.top);
```
Since all three copies of this logic must move in lockstep (forward consolidate, instant jump, and reverse restore), apply the identical conversion to all three — do not fix only one, or forward/reverse will diverge again exactly like before.

**Test:** Enter security from product, scroll through all 7 ring states into About, and reverse (scroll back up from About into ring) — confirm no white-space bar above and no content appearing clipped below the viewport fold in either direction, across the same 4 viewports as item 3.

---

## 5. About→FAQ transition — white space above / wrong section flashes briefly

**File:** `components/blueprint/BlueprintHero.tsx`, `exitAboutToFaq` (~line 3885-3931)

**Root cause — two compounding issues:**
1. Shares item 4's `targetEnvelopeY` drift (About content's rest position is affected by the same stale assumption), so fixing item 4 should resolve part of this.
2. A distinct timing bug: the stage unlock (`stageRef.current.style.position = ""`, removing `position: fixed`) happens synchronously inside the `gsap.to(...).onComplete`, but the corrective `smoothScrollTo(faqEl, ...)` call is deferred by one `requestAnimationFrame`. Between those two moments there's a real paint frame where the page is back in normal (unpinned) document flow at the old frozen scroll position — visible as a flash of blank space or the wrong section.

**Fix for issue 2:** don't leave a gap between unlocking and correcting scroll. Either:
- **Preferred:** compute the FAQ element's target scroll offset and call `smoothScrollTo` in the same synchronous block as the unlock (right after `ScrollTrigger.refresh()`), removing the `requestAnimationFrame` wrapper, so there is no frame where the unpinned layout is visible at the wrong scroll position; or
- If `ScrollTrigger.refresh()` genuinely needs a frame to settle new offsets first, keep `stageRef.current` visually fixed/opaque (delay only the *unlock*, not the corrective scroll) for that one frame instead of the other way around, so nothing incorrect is ever painted.

**Test:** Scroll from About into FAQ repeatedly (including a fast/aggressive scroll) — confirm no flash of blank space or wrong section content at any point.

---

## 6. Security vault — card travel into/out of vault too slow (2-3s wait)

**File:** `components/blueprint/BlueprintHero.tsx`, `createProductToRingTimeline` (~line 1739-2515)

**Confirmed via duration audit:** `travelDuration = 1.70` (~line 2304, the cards' physical travel phase after collapsing) is by far the largest single segment in this timeline — every other named duration (`collapseDuration = 0.72`, `safeOpenDuration = 0.76`, `enterVaultDuration = 0.40`, `textRevealDuration = 0.75`, `safeCloseDuration = 0.44`) is well under half of it. Under `CINEMATIC_TIMESCALE = 0.85` (which *slows* playback, since timeScale < 1 stretches duration), `travelDuration` alone plays at ≈1.70 / 0.85 ≈ **2.0 seconds**, which lines up with the user's "wait like two, three seconds" complaint.

The user explicitly confirmed the **collapse/collect** phase and the **vault door open/close** pacing now feel right — do not touch `collapseDuration`, `safeOpenDuration`, `safeCloseDuration`, or `textRevealDuration`.

**Fix:** trim `travelDuration` from `1.70` to `~1.15` (→ ≈1.35s effective under the shared timescale). `enterVaultStart = cardStart + travelDuration` is already a derived formula, so it shifts automatically — no other offset needs manual adjustment.

**Both directions covered by one change:** confirmed `triggerRingToProduct` calls `productToRingTlRef.current.reverse()` on the *same* timeline instance (line 6184) rather than building a separate reverse timeline, so trimming `travelDuration` once fixes both the entering and exiting direction the user described.

**Test:** Trigger product→security entry and security→product exit several times in a row; confirm the card travel feels snappy while the door open/close and text reveal still feel identical to what was just approved.

---

## 7. FAQ arc line — needs to be bolder

**File:** `components/blueprint/BlueprintFaq.tsx`, line ~198
**Current state (confirmed):** `<path d="M 220 100 C 450 140, 680 340, 780 620" stroke="#22C55E" strokeWidth="1.6" ... />` inside a `viewBox="0 0 800 800"` SVG rendered up to 850px wide — effective on-screen stroke is only ≈1.7px, thin for a deliberate brand statement line.

**Fix:** increase `strokeWidth` from `1.6` to `6` (renders at ≈6.4px on screen at the largest breakpoint — bold and clearly intentional without looking cartoonish). Leave color, opacity, path, and everything else in this SVG untouched — the direction was already confirmed correct, only weight needs to change.

**Test:** Check the arc at all 3 breakpoints (`w-[500px]`/`w-[700px]`/`w-[850px]`) for consistent visual boldness relative to the "Frequently Asked Questions" heading weight.

---

## Ground rules for this round

- Items 3 and 4 must both land together — they share a root cause, and fixing only one while leaving the other's stale constant in place risks new inconsistency between the bento and about-section positioning.
- Do not re-touch `CINEMATIC_TIMESCALE`, the vault door open/close durations, the FAQ heading/line direction, the bento tile content sizing, the product spacing, the footer, or the trackpad gesture lock — all confirmed correct by the user in this round.
- After any change to `computeBentoLayout` or `targetEnvelopeY`, test at minimum: 1440×900, 1280×800, 1920×1080, and a mobile width (390×844), since the user explicitly flagged this as a multi-viewport bug.
