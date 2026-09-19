# Performance & Jitter De-Escalation Plan (Site-Wide)

**Date:** 2026-09-18
**Scope:** No design/layout/structure changes. Pure performance refactor — same visuals, same timing, less jank, more consistent across GPUs (integrated Intel vs. discrete NVIDIA) and more consistent between localhost and Vercel.
**Status:** Reviewed and corrected by Claude against the real codebase. Original 6-point plan authored by anti-gravity/Gemini; every file path, line number, and claim below has been re-verified against current code (not assumed).

## Framing note before anti-gravity starts

The user's brief says "nothing should be GPU accelerated." Read literally that would make things *slower*, not more consistent — modern browsers already composite `transform`/`opacity` animations on the GPU because that's the fast path, and turning that off isn't possible or desirable. What actually causes "works fine on my NVIDIA laptop, jitters on Intel integrated graphics" is:
- Too many elements permanently promoted to their own compositor layer (`will-change: transform` applied statically instead of only while animating) — this eats GPU/VRAM bandwidth, and integrated GPUs share that bandwidth with system RAM, so they run out first.
- Expensive per-frame GPU work (`backdrop-filter: blur()` at large radii, especially on elements also being transformed) — blur cost scales with GPU fill-rate, which varies wildly between GPUs.
- Forced synchronous layout (reading `getBoundingClientRect()` and writing styles interleaved in the same animation frame) — this is pure CPU-bound jank and affects every device, not just weak GPUs.
- Infinite RAF loops / GSAP `repeat: -1` tweens that never pause when their element is invisible — wastes cycles indefinitely, more visible on weaker hardware.
- Competing event listeners fighting for control of the same scroll/wheel gesture.

So the real goal — "every laptop behaves the same" — is achieved by *doing less unnecessary GPU/CPU work*, not by disabling acceleration. The 6 items below all serve that goal. Do not add `will-change: auto !important` globally or strip `transform`-based animations in favor of top/left — that would be a regression, not a fix.

---

## 1. Remove `ScrollTrigger.normalizeScroll(true)`

**File:** `lib/gsap.ts`, line 39 (guarded by `if (!prefersReducedMotion())`, lines 33-39).

**Corrected justification:** the code comment above this call claims it's needed for "every pinned ScrollTrigger section (Hero, Stacking Cards, About Metrics)." That's stale — grep confirms `pin: true` / `.pin(` is used **nowhere** in the codebase. `BlueprintHero.tsx`'s hero→product→security→about→faq sequence is not a GSAP-pinned ScrollTrigger; it's a fully custom state machine that manually sets `stageRef.current.style.position = "fixed"` and intercepts `wheel`/`touchmove`/`scroll` itself (see item 6 below, and `handleWheel` at `BlueprintHero.tsx:6211`, registered at `6672`).

`normalizeScroll` works by installing its own document-level scroll/touch normalization layer. Since `BlueprintHero.tsx` *also* installs capturing `wheel`/`touchmove`/`scroll` listeners with `preventDefault()` + `stopImmediatePropagation()` on the same events, these two systems are fighting for control of the same gestures — a plausible direct cause of the reported jitter/glitches, especially since the behavior would differ depending on browser-specific event timing (which lines up with "works differently across devices").

**Action:** delete the `ScrollTrigger.normalizeScroll(true)` call and its now-stale comment entirely. Do not replace it with anything — `SiteHeader.tsx`'s two `ScrollTrigger.create(...)` calls (header reveal, logo scale) are plain scroll-position triggers with no pinning, and don't need it.

**Risk / what to watch:** `normalizeScroll` also smooths mobile touch-scroll rubber-banding in some browsers. Since `BlueprintHero.tsx` already has its own `touchstart`/`touchmove`/`touchend` handlers, this should be covered, but test scroll feel on an actual mobile device (or Chrome DevTools device emulation with touch) after removing it, on both the homepage sequence and a plain-scroll page (e.g. `/about`). This is a one-line, trivially revertible change if something feels off.

---

## 2. Fix forced synchronous layout in `consolidateRingToStack`'s `onUpdate`

**File:** `components/blueprint/BlueprintHero.tsx`, function `consolidateRingToStack` (starts at line 4162), `onUpdate` callback at lines 4292-4356.

**Confirmed real, but the fix is narrower than "remove all the reads."** Every frame, this callback currently does `getBoundingClientRect()` on:
- 5 product cards (`allProductCards`) — **these are genuinely animating every frame during this tween.** Their reads cannot simply be deleted; the wipe-clip-path math depends on their live positions. Do not attempt to replace these with a derived/mathematical formula instead of measuring — that exact shortcut (deriving a live position analytically instead of measuring it) caused a hard crash and a visual regression in an earlier round of this project (see prior `targetEnvelopeY` incident). Leave the 5-card reads alone.
- `closingBlackTextRef` and `closingGreenTextRef` — **these two elements are geometrically static during this tween** (confirmed: within `consolidateRingToStack` they only ever receive `clipPath`/`opacity`/`visibility` writes, never a transform/position change). Re-measuring their `getBoundingClientRect()` every single frame is pure waste, **and** the function already computes `blackRect`/`greenRect` once, earlier in the same function, right before the tween starts (~line 4232-4233: `const blackRect = closingBlackTextRef.current?.getBoundingClientRect(); const greenRect = closingGreenTextRef.current?.getBoundingClientRect();`).

**Action:** inside `onUpdate`, replace `closingBlackTextRef.current.getBoundingClientRect()` and `closingGreenTextRef.current.getBoundingClientRect()` with the already-captured `blackRect` / `greenRect` variables from earlier in the same function (they're in scope via closure — no new variables needed, just stop re-reading). Leave every other read in the callback (the 5-card loop, and the `clusterEl` fallback) exactly as-is.

This turns 2 of the ~7 layout reads per frame into cached values, removing the redundant read/write interleaving for the two elements that don't need live measurement, without touching the parts that do.

---

## 3. `will-change: transform` cleanup — corrected file list + criteria (not a line-by-line list)

**Corrected counts** (verified via grep, current as of this plan):

| File | Count | Live route? |
|---|---|---|
| `components/blueprint/BlueprintHero.tsx` | 58 | Yes — homepage |
| `components/product/ProductExperience.tsx` | 14 | Yes — `/product` |
| `components/blueprint/BlueprintContact.tsx` | 12 | Yes — homepage (**missing from original plan**) |
| `components/hero-product/HeroProductExperience.tsx` | 9 | **Not referenced anywhere in `app/` — appears orphaned/dead code. Skip.** |
| `components/blueprint/BlueprintFaq.tsx` | 7 | Yes — homepage (**missing from original plan**) |
| `components/ui/Button.tsx` | 4 | Yes — shared component, used site-wide |
| `components/security/SecurityExperience.tsx` | 4 | **Not referenced anywhere in `app/` — appears orphaned/dead code. Skip.** |
| `components/hero/HeroIntroLogo.tsx` | 4 | Yes — homepage intro |
| `components/hero/HeroTransformationPortal.tsx` | 3 | Verify route before touching |
| `components/blueprint/SafeVault3D.tsx` | 2 | Yes — homepage |
| `components/canvas/InteractiveFluidBackground.tsx` | 1 | Yes — global (in root layout) |
| `components/blueprint/BlueprintStackingCards.tsx` | 1 | Verify route before touching |

Before spending time on `HeroProductExperience.tsx` or `SecurityExperience.tsx`, confirm with `grep -rn "HeroProductExperience\|SecurityExperience" app/` that they're truly unused — if still orphaned, deprioritize entirely (dead code has zero runtime performance impact regardless of how many `will-change` occurrences it has).

**Also in scope but absent from the original plan entirely:** `app/about/page.tsx`, `app/features/page.tsx`, and `app/pricing/page.tsx` render `FeatureBeat`, `FounderStory`, `EditorialDecompression`, and `PricingTable` respectively — all live routes using ScrollTrigger-driven animation that weren't audited by the original plan. Do a `grep -rn "will-change\|willChange" components/<component>.tsx` pass on each before deciding whether they need the same treatment. Do not assume they're fine just because they weren't flagged — they were never checked.

**Criteria for the actual fix (apply file-by-file, don't blanket-remove):**
1. If the element already gets a GSAP tween on `transform`/`x`/`y`/`scale`/`rotate`, prefer GSAP's own `force3D: "auto"` (default in most GSAP tweens) over a static `will-change: transform` class — GSAP promotes the element to a compositor layer only while the tween is active and releases it when the tween completes, instead of pinning a layer permanently.
2. If `will-change: transform` is applied via a Tailwind class (`will-change-transform`) directly in JSX with no conditional logic, it is permanently promoting that element for the component's entire lifetime, whether or not it's currently animating. Prefer toggling the class (or setting the inline style) only for the duration of the animation — add it just before the animation starts, remove it in the tween's `onComplete`.
3. Do not remove `will-change` from elements that animate continuously/frequently while visible (e.g. ambient hover effects, marquees) — the promotion cost there is amortized and removing it would cause a re-promotion cost on every trigger instead. Only target elements that are promoted once and then sit static for long periods, or that are off-screen/hidden most of the time.

---

## 4. Kill infinite RAF/tween loops that ignore visibility

**4a. `components/hero/HeroApertureVisual.tsx` — confirmed, RAF loop never stops.**

Lines 48-90: the `checkTime` RAF loop gates its *internal crossfade logic* on `isPausedRef.current` (line 49), but the reschedule itself — `rafId = requestAnimationFrame(checkTime)` at line 87 — is unconditional. So even when `isPaused` is `true` (hero transition complete, per the comment at line 97: "Pause playback when hero transition completes to save GPU/CPU"), the RAF loop keeps firing every frame forever, doing nothing but rescheduling itself.

**Fix:** in the `checkTime` function, don't reschedule when paused — cancel instead, and restart the loop from the other `useEffect` (lines 98-111) when `isPaused` flips back to `false`. Concretely: extract the RAF-scheduling into a small helper that the pause-toggling `useEffect` can call, guard the `requestAnimationFrame(checkTime)` reschedule at line 87 with `if (!isPausedRef.current)`, and in the `isPaused` effect, when transitioning from `true` → `false`, kick the loop off again (`rafId = requestAnimationFrame(checkTime)`) since it will have fully stopped.

**4b. `components/blueprint/SafeVault3D.tsx` — confirmed, ambient tweens run forever regardless of container visibility.**

Lines 173-187: `floatTweenRef` and `rockTweenRef` are `gsap.to(..., { repeat: -1, yoyo: true })`, created once in a mount-only `useEffect(() => {...}, [])`, only killed on component unmount. `SafeVault3D` is mounted exactly once for the entire page and its *container* visibility is toggled dozens of times via `gsap.set(safeContainerRef.current, { opacity/visibility })` from `BlueprintHero.tsx` — but the component has no awareness of this, so the float/rock ambient tweens keep running (and compositing) even while fully invisible (`opacity: 0` / `visibility: hidden`).

**Fix:** the `SafeVault3DRef` interface (`SafeVault3D.tsx` lines 6-11) currently exposes `setOpenProgress`, `setCardsProgress`, `triggerRimStep`, `resetRim`. Add two new methods, `pauseAmbient()` / `resumeAmbient()`, that call `.pause()` / `.play()` on `floatTweenRef.current` and `rockTweenRef.current`. Then in `BlueprintHero.tsx`, wherever `safeContainerRef` is set to `opacity: 0, visibility: "hidden"`, also call `safeVaultRef.current?.pauseAmbient()`; wherever it's set back to visible, call `safeVaultRef.current?.resumeAmbient()`. Grep `gsap.set(safeContainerRef.current` in `BlueprintHero.tsx` to find every call site (there are dozens) — pair each opacity/visibility toggle with the matching pause/resume call rather than guessing which ones matter.

**4c. `components/ui/Button.tsx` — confirmed, unconditional spin animation.**

Lines 54-59 and 65-68: a `will-change-transform` + `animate-iridescent-spin` (Tailwind, presumably an infinite CSS `@keyframes` rotation) is applied to decorative conic-gradient divs unconditionally — the spin runs continuously regardless of hover/focus state, only its *opacity* is conditional.

**Fix:** this is a CSS animation, not a GSAP tween, so gate it with `animation-play-state` instead of touching the will-change: apply `animation-play-state: paused` by default and `animation-play-state: running` only on `:hover`/`:focus-visible` (or whatever state currently drives the opacity toggle — check the surrounding Tailwind classes to match). This keeps the visual effect identical (it was already invisible via opacity when not hovered) while stopping the wasted compositing work when idle. Every `Button` instance on every page currently pays this cost at all times, so this is a broad, low-risk win.

---

## 5. Reduce `backdrop-filter: blur()` cost — corrected values, plus new findings

**Corrected:** the original plan claimed all 7 flagged lines in `BlueprintHero.tsx` use `backdropFilter: "blur(28px)"`. Verified actual values:

| Line | Value | Corrected? |
|---|---|---|
| 1275 | `blur(24px)` | plan said 28px — wrong |
| 1563 | `blur(28px)` | correct as stated |
| 1937 | `blur(28px)` | correct as stated |
| 2005 | `blur(20px)` | plan said 28px — wrong |
| 6863 | `blur(28px)` | correct as stated |
| 8023 | `blur(24px)` | plan said 28px — wrong |
| 8610 | `blur(20px)` | plan said 28px — wrong |

Only 3 of the 7 (1563, 1937, 6863 — all three are the bento card front-face background, applied during the card entry/settle animation) are actually the heaviest 28px value. **Action:** reduce those 3 to `blur(16px)` — visually, blur softening past ~16-18px is hard to distinguish on this UI's card-glass effect, but GPU fill-rate cost keeps scaling linearly with radius, so this is a real saving for no visible loss. Leave lines 1275, 2005, 8023, 8610 alone (20-24px) unless post-change testing still shows jank around those elements — they're already lighter than the plan assumed.

**New finding, not in the original plan — higher priority than the backdropFilter items above:** `BlueprintHero.tsx` also has 5 plain `filter: blur()` instances (not `backdropFilter`) at heavier radii than anything the original plan flagged:

| Line | Value |
|---|---|
| 7855 | `blur(35px)` |
| 7865 | `blur(40px)` |
| 7875 | `blur(30px)` |
| 7885 | `blur(45px)` |
| 8667 | `blur(18px)` |

`filter: blur()` (as opposed to `backdropFilter`) blurs the element itself (and its children), which is generally cheaper than `backdropFilter` (which has to sample and blur everything *behind* the element every frame it's visible), but 30-45px is still a heavy radius. **Action:** read the surrounding ~20 lines of each of these 5 to confirm what they're decorating (likely ambient glow/blob shapes) before changing — if they're static decorative background blobs that never move, reducing to 20-24px should be visually safe. If any of them are attached to something actively animating (transform/position) every frame at the same time as the blur, treat those as highest priority — animating + blurring the same element simultaneously is the most expensive combination on this page.

---

## 6. Non-passive `scroll` listener — confirmed dead weight, safe fix

**File:** `BlueprintHero.tsx`, line 6671: `window.addEventListener("scroll", handleScrollLock, { passive: false, capture: true });`

**Confirmed, and more clear-cut than the original plan stated:** read the full body of `handleScrollLock` (lines 6651-6669) — it only ever calls `window.scrollTo(...)` or `instantShowSecurity()`. It **never calls `preventDefault()`**. Native `scroll` events aren't cancelable at all (`event.cancelable` is always `false` per spec), so `preventDefault()` on a `scroll` listener is always a no-op anyway — but this handler doesn't even attempt it. `passive: false` here is providing zero benefit while forcing the browser to block on JS execution before it can proceed with scroll-related work, on every single scroll event, for the entire time this listener is attached.

**Action:** change to `{ passive: true, capture: true }`. Zero behavior risk — nothing in the handler depends on being able to block the default action.

(Note: `handleWheel` on line 6672, and `handleTouchmove` on line 6674, are a different matter — both `wheel` and `touchmove` events *are* cancelable, and grep confirms `handleWheel` does call `preventDefault()`/`stopImmediatePropagation()` in several branches, so `passive: false` is genuinely required there. Do not change those two.)

---

## Suggested execution order

1. Item 6 (scroll passive fix) — trivial, zero risk, do first.
2. Item 1 (remove normalizeScroll) — one line, but test scroll feel afterward (see risk note).
3. Item 2 (consolidateRingToStack caching) — small, well-scoped, already validated.
4. Item 4a/4b/4c (RAF + tween pausing) — three separate, independent fixes; can be done in any order.
5. Item 5 (blur reduction) — do the 3 confirmed 28px→16px reductions first, then investigate the 5 new heavy `filter: blur()` findings.
6. Item 3 (will-change cleanup) — largest surface area, do last, one file at a time, visually spot-check each file after its changes (screenshot or manual scroll-through) before moving to the next.

After each item, run `npx tsc --noEmit` to confirm no type errors, and do a manual smoke-test of the homepage scroll sequence (hero → product → ring → about → faq) before moving to the next item — several of these touch the same shared animation state machine, so catching a regression early (rather than after all 6 items) will make it much easier to isolate which change caused it.
