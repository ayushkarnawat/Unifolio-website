# Scroll & Animation Glitch Root-Cause Report

**Date:** 2026-09-22
**Scope:** Read-only investigation of the 8 glitches reported on the live homepage, plus a broader pass over the same code for anything else likely to misbehave. **No code was changed.** Every finding below was confirmed by directly reading the cited lines (not just inferred) unless explicitly marked "suspected."

---

## 0. The architecture behind almost every glitch

`app/page.tsx` renders, in order: `HeroIntroLogo` → `BlueprintNav` → `BlueprintHero` → `BlueprintAboutMetrics` → `BlueprintFaq` → `BlueprintContact`.

**`components/blueprint/BlueprintHero.tsx` is ~9,990 lines** and single-handedly renders the Hero, the Product "bento" grid, *and* the Security vault as one component. Instead of using GSAP ScrollTrigger's built-in `pin`/`snap`/`scrub`, it hand-rolls its own scroll-hijacking engine:

- `document.documentElement`/`body` `overflow` is forced to `"hidden"` and `overscrollBehavior` to `"none"` for the entire Hero→Product→Security stretch (first set at `BlueprintHero.tsx:644-647`, on mount, unconditionally).
- Real `window.scrollY` is pinned near 0 (`lockScrollYRef`, repeated `window.scrollTo`).
- `wheel`/`touchmove`/`keydown` are intercepted globally (`{ passive: false, capture: true }`) and `preventDefault()`-ed almost unconditionally while inside this stretch.
- A `stateRef` string machine (`"hero" → "product-resting" → "product" → "sculpting" → "ring" → "about" → "faq"`) tracks the current slide; a second index, `currentSecurityStateRef` (0–7), tracks the sub-state inside the Security ("ring") section.
- Every transition between states is a **separately hand-authored GSAP timeline**, gated by boolean refs (`transitionAnimatingRef`, `isSecurityTransitioningRef`, `isNavigatingRef`, `hasTriggeredThisGestureRef`, …) that block further input while `true`.
- Alongside the "organic" (scroll-driven) transition for each state pair, there is a **separate "instant jump" function** (`instantShowSecurity`, `instantShowAbout`, `instantResetHero`, …) used by nav-pill clicks and "Back to Top." These duplicate a subset of what the organic transition resets — and don't always duplicate all of it.

**This is the root architectural cause behind nearly every glitch below.** A single component managing three "worlds" through 50+ refs and dozens of independent imperative `gsap.set`/`.kill()` call sites means every new transition function has to remember to reset *everything* some other transition function might have left behind — position, rotation, visibility, busy-flags — and nothing enforces that those resets are exhaustive. That's the shape of bug that recurs eight different times below, in eight different places.

---

## 1. Vault position shifts left when scrolling back up into Security

**Two distinct, independently-real causes — confirmed by reading.**

**1a — stale measurement before reset, in the "jump straight to Security" path.**
The vault's on-screen position comes from `computeDockLayout()` (`BlueprintHero.tsx:1691-1813`), which measures `cardsClusterRef.current.getBoundingClientRect()` **live** (`:1699-1701`) to compute `clusterCenterX`, which then feeds `targetRingX`/`targetLeftX` (`:1773-1774`) — the vault's dock X.

`instantShowSecurity()` (the function that runs when scroll or a nav click brings the user back to Security from About/Contact) calls `computeDockLayout()` at **line 7249** — but only resets `cardsClusterRef`'s transform to identity (`x:0, y:0, rotateX:0…`) **afterward**, at **lines 7297-7310**. If the user arrived here after visiting About (which leaves `cardsClusterRef` offset/rotated via `consolidateRingToStack`), `computeDockLayout()` reads that stale, still-offset rect *before* it's cleared, and derives the wrong `targetLeftX` — the vault docks to a different X than it did the first time.

**1b — the dock math itself isn't fully viewport-clamped.**
Inside the same `computeDockLayout()`, `viewportCenterX`/`viewportCenterY` (`:1725-1726`) are computed from **raw, unclamped** `window.innerWidth`/`innerHeight` — not from `getComposedViewport()`, which is used two lines above (`:1693`) for every *other* value in this function and which is exactly the helper the project already built to keep layout consistent across screen sizes (see §8). So on any viewport wider than the 1440px reference, the vault's horizontal center keeps drifting with real window width while the values it's combined with (`leftShift`, etc.) are frozen — an inconsistency that compounds with 1a.

**Fix direction:**
- 1a: reset `cardsClusterRef`'s transform to identity *before* calling `computeDockLayout()` in `instantShowSecurity()`, or don't re-derive from a live rect at all — reuse the cached `targetLeftXRef.current` (already used correctly elsewhere, e.g. `:4501`, `:5525`) for any "return to docked position" case.
- 1b: replace the two raw `window.innerWidth/innerHeight` reads at `:1725-1726` with the already-clamped `vWidth`/`vHeight` from `getComposedViewport()` computed at `:1693`.

---

## 2 & 3. Can't scroll mid-animation; scroll randomly locks; scrolling up shows incomplete content

These three symptoms share one architecture and are best explained together.

**2a — "Can't scroll mid-animation" is intentional, but has no ceiling on how long it feels stuck.**
`handleWheel` (`:6253+`) calls `preventDefault()`/`stopImmediatePropagation()` for virtually every wheel tick while `stateRef.current !== "faq"` (`:6264-6268`), by design: one physical scroll gesture should only ever advance one state. A 180ms decay timer (`wheelGestureEndTimerRef`, `:6255-6261`) is the only thing that clears the "gesture in progress" flag, and it's re-armed by every ignored tick. Trackpad/mouse momentum commonly keeps emitting ticks well past a transition's own ~0.3–0.6s duration, so responsiveness doesn't return until momentum fully dies out — which reads as "scroll is locked" even though nothing is actually broken, just silent.

**2b — the real "randomly stuck" bug: busy-flags are only cleared by `onComplete`, but timelines are routinely `.kill()`-ed instead.**
`isSecurityTransitioningRef` (and the equivalent flags for other transitions) is reset to `false` in exactly one place per transition: that transition's own `onComplete`/`onReverseComplete` callback (e.g. `goToSecurityState`'s timeline, `:5943-5946`). GSAP's `.kill()` **does not fire `onComplete`**. These same timelines are killed from many other entry points — confirmed at `:4234-4237`, `:5417-5419`, `:5908-5910`, `:6197-6199`, `:7178-7180`, `:7370-7372`, `:7596`, `:7648`. `navigateToSection` (the nav-pill/"Back to Top" handler, `:7703+`) does defensively force-reset the boolean flags themselves (`:7706-7710`) — but it does **not** kill the seven per-substate content timelines (`moneyAnimTlRef`, `typoEyesTlRef`, `pwdMaskTlRef`, `lockAnimTlRef`, `connectionAnimTlRef`, `indiaAnimTlRef`, `sellAnimTlRef`) or `consolidationTlRef` before hard-jumping to a destination state. If any of those is mid-flight when a nav click/back-to-top fires, it keeps mutating the same `opacity`/`x`/`y` properties the instant-jump function just set — for the rest of its own duration — leaving the DOM in a state the flags and bookkeeping no longer agree with. The next wheel gesture then computes its next step against that desynced state, which is consistent with scroll intermittently doing nothing at specific, hard-to-reproduce points, and with visuals occasionally looking wrong afterward.

**3 — scrolling up shows incomplete content, because the up path is a separately hand-written timeline, not a mirror of the down path.**
Compare two section handoffs:
- Product ↔ Ring (`createProductToRingTimeline`, `:1818+`): **one** timeline, played forward and reversed on the same instance (`.play()`/`.reverse()` on the same ref, `:6242-6250`) — forward and backward are mirrors *by construction*.
- Ring ↔ About: **two independently hand-written timelines** — `consolidateRingToStack` (`:4226+`) for forward, `restoreStackToRing` (`:5409+`) for backward. Nothing guarantees these stay symmetric; any property the forward timeline sets that the backward one forgets (or sets differently) simply never gets corrected when scrolling up. This is the most direct explanation for "text visible but cards/vault or their copy missing," specifically on the up direction.

A secondary contributor: decorative per-state flourishes (`playMoneyAnimation` etc.) fire from `goToSecurityState`'s `onComplete` (`:5944-5963`) — **after** `isSecurityTransitioningRef` has already been cleared (`:5946`). Nothing re-locks input while the flourish itself is still animating, so a fast next scroll can interrupt/kill it mid-flight, leaving its target parked at a partial opacity/position — a plausible source of "copy inside a card not visible."

**A third, more localized mechanism (suspected, not fully runtime-verified) affects the Product↔Ring boundary specifically.** Inside `createProductToRingTimeline` (the timeline reused via `.reverse()` for Product↔Ring, see §4 below), a `tl.set(...)` near the end of the forward timeline (`:2293-2304`, `collapseDuration` position) sets `display: "none"` on `cardIllustrationRefs`, `cardGradientBgRefs`, `cardBackRefs`, and any `[data-card-text="true"]` text nodes, alongside `autoAlpha`/`opacity`/`visibility`. Unlike `bentoTileContentRefs` — which *does* have a matching `tl.set(..., { display: "flex" }, 0)` earlier in the same timeline (`:2088`) for GSAP to return to when reversed — `cardIllustrationRefs`/`cardGradientBgRefs`/`cardBackRefs` have no equivalent `display` value set anywhere earlier in this same timeline (only `autoAlpha`/`opacity`/`visibility` at `:2098-2103`). `display` is not an interpolated property; a `.set()` with nothing earlier in the same timeline for GSAP to revert to will not necessarily restore it when the timeline is scrubbed backward via `.reverse()`. If this holds at runtime, it would explain "the card container reappears but specific pieces of copy/illustration inside it stay invisible" specifically when reversing out of the Ring state back toward Product. Worth a quick live check (inspect computed `display` on these elements after scrolling Product→Ring→Product) before fixing.

**Fix direction:**
1. Reset every busy-flag at the same call site that kills its timeline, not only inside that timeline's own completion callback — the flag's lifecycle shouldn't depend on a specific timeline instance reaching completion.
2. In `navigateToSection`, kill all seven substate timelines (plus `consolidationTlRef`) before invoking any `instantShowX()`, the same way it already resets the boolean flags.
3. Refactor `consolidateRingToStack`/`restoreStackToRing` into one shared timeline built once and driven with `.play()`/`.reverse()`, matching the pattern already used for Product↔Ring.
4. Keep the transitioning flag `true` until a flourish's own completion, not just its parent timeline's.
5. (UX, not a bug) Consider giving swallowed wheel ticks *some* feedback (e.g. a queued single step) so a gesture mid-transition doesn't read as a dead page.

---

## 4. Previously-used black cards show up sometimes

**Confirmed, precise mechanism.**

Each product card is a literal 3D flip card with two faces: a light "Front Face" (current design) and a **"CARD BACK FACE (Minimalist Solid Black Obsidian)"** (`BlueprintHero.tsx:8616` — the label is a comment in the code itself, confirming this is explicitly the old design, not a copy-paste accident).

At page load this is intentional: cards start flipped to their black back (`instantResetHero`, `:7133` sets `flipper` `rotateY: 180`, `:7145` sets the back face visible) and flip to the front as part of the opening cinematic, played once via `createHeroToProductTimeline()` (`:1010`, played at `:1628-1629`).

**The bug:** when the user scrolls back up from Product to Hero, the code doesn't build a new reverse transition — it replays the *same* intro timeline backward:

```
BlueprintHero.tsx:1669-1673
if (!heroToProductTlRef.current) {
  heroToProductTlRef.current = createHeroToProductTimeline();
  heroToProductTlRef.current.progress(1);
}
heroToProductTlRef.current.reverse();
```

Reversing this timeline plays the card-flip in reverse — rotating every card from its light front back through edge-on to the **black obsidian back face** — every single time the user scrolls up past Product. What was designed to be a one-time cinematic reveal replays as "the old black cards flashing" on every scroll-up, because a symmetric reverse was applied to an animation that only makes sense playing forward once.

*(Related, not itself a symptom: `forceResetAllCardsToBase`, `:491`, resets cards to an even older dark style and is never called anywhere in the file — confirmed via grep. Dead code, safe to delete once verified unused.)*

**Fix direction:** don't reuse the intro flip timeline for the reverse-to-hero transition. Build a distinct (lighter) reverse-to-hero transition that doesn't re-expose the black back face, or switch the reverse direction to an opacity/scale transition instead of a 3D flip.

---

## 5. Scrolling from About to FAQ doesn't always fully reveal the FAQ section

**Confirmed — this is a real gap, not an edge case.**

`BlueprintFaq.tsx` has zero scroll-snap or forced-reveal logic (confirmed by direct grep — no `scroll-snap`, no `ScrollTrigger`/`scrollTrigger` config tied to scroll position, only two purely decorative entrance fades at `:142-170` that animate already-visible content's opacity, never scroll position itself). The section itself is a plain `min-h-screen h-screen overflow-hidden` block (`:178`) entered via ordinary native scroll.

The actual "always finish the transition" behavior that exists *everywhere else* in this app comes from `exitAboutToFaq()` (`BlueprintHero.tsx:3968-4014`): it restores native scroll (`:3986-3991`), then calls `smoothScrollTo(faqEl, { duration: 0.40, ease: "power2.out" })` (`:4009`), which (`lib/gsap.ts:81-87`) is a `gsap.to(window, { scrollTo: {...}, autoKill: true })`. `autoKill: true` cancels this tween the instant real `scrollY` diverges from where it expects — and because `stateRef.current` is already `"faq"` by the time this runs, the wheel handler's FAQ branch (`:6310`) lets further wheel ticks pass through **natively, with no `preventDefault`**. Any leftover trackpad/mouse momentum arriving during that 0.4s window (very common right after a physical scroll gesture) races the tween and can `autoKill` it mid-flight — leaving the FAQ section only partially in view. This directly explains why it's scroll-strength-dependent: a stronger gesture produces more residual momentum ticks, raising the odds of colliding with and killing the in-flight snap.

**Fix direction:** either drop `autoKill` for this specific programmatic scroll (it isn't competing with a legitimate separate user scroll — native scroll was only just re-enabled a moment earlier), or briefly re-suppress wheel input until `smoothScrollTo`'s own `onComplete` fires.

---

## 6. An old/extra navbar appears, especially after "Back to Top" from Contact

**Confirmed — the old navbar is mounted on every page load, not just an edge case.**

`app/layout.tsx:3,89` unconditionally renders `<SiteHeader />` — the pre-redesign navbar — in the **root layout**, wrapping every route including the homepage. `BlueprintNav`, the new pill nav, is rendered separately inside `app/page.tsx`. **Both are in the DOM at the same time on the homepage.**

The sibling component already has the fix this one is missing. `components/layout/SiteFooter.tsx:46`:
```tsx
// On homepage, the BlueprintFooter is rendered directly in page.tsx
if (pathname === "/") return null;
```
`SiteHeader.tsx` has no equivalent guard, despite already computing `isHomepage` internally (`:13`) — this reads as a straightforward oversight, since the correct pattern already exists one file over.

**Why it's usually invisible, and why "Back to Top" specifically reveals it:** `SiteHeader`'s visibility is driven by its own `ScrollTrigger` on raw `window.scrollY` (`SiteHeader.tsx:19-46`, `start: "top -80%"`), entirely unaware of `BlueprintHero`'s internal state or `BlueprintNav`'s visibility. Both bars share the identical `fixed top-0 inset-x-0 z-50` (`SiteHeader.tsx:73`, `BlueprintNav.tsx:468`); while the user is inside the hijacked Hero/Product/Security stretch, real `scrollY` stays pinned near 0 so `SiteHeader` stays hidden — but once inside About/FAQ/Contact, real `scrollY` legitimately exceeds the -80% threshold and `SiteHeader` fades itself **in**, stacking behind/in front of `BlueprintNav` (which, once docked, never hides again).

The "Back to Top" link (`BlueprintContact.tsx`) dispatches a `unifolio-reset-hero` custom event, handled by `instantResetHero()` (`BlueprintHero.tsx:6974+`), which jumps `scrollY` to 0 with a bare, **non-animated** `window.scrollTo(0, 0)` (`:6977`) followed by `ScrollTrigger.refresh()` (`:7052`). Since `SiteHeader` was already toggled visible while in Contact, this instant jump crosses back below its threshold and triggers its own ~0.4s `onLeaveBack` slide-and-fade-out (`SiteHeader.tsx:38-45`) — that visible retraction, happening on top of the already-visible `BlueprintNav`, is the reported "extra navbar."

**Fix direction:** add the same `if (pathname === "/") return null;` guard to `SiteHeader.tsx` that `SiteFooter.tsx` already uses. This is the smallest, lowest-risk fix in this entire report.

---

## 7. Vault door/dial not reset when re-entering Security state 0

**Confirmed, precise mechanism.**

`SafeVault3D.tsx` has two genuinely independent pieces of animatable state:
- `setOpenProgress(p)` (`:38-123`) drives the **door panel** and is a pure function of `p` — calling it with `0` always deterministically snaps the door shut.
- `triggerRimStep(...)`/`resetRim()` (`:134-178`) drives the **inner locking disc**, via an *accumulating* ref (`rimSecurityAngleRef`) that is only ever zeroed by explicitly calling `resetRim()`. Critically, even at `p = 0` (fully closed door), the disc's rotation is computed as `rimSecurityAngleRef.current + 26 * easeU` (`:52`) — so the disc keeps whatever angle it was last left at unless `resetRim()` is *also* called.

Grepping every place `BlueprintHero.tsx` resets the vault to closed shows this pairing is inconsistent:

| Call site | `setOpenProgress(0)` | `resetRim()` |
|---|---|---|
| `:1943` / `:2154` (Product↔Ring) | ✅ | ❌ |
| `:4501` (consolidate to stack) | ✅ | ❌ |
| `:5525` (restore stack to ring) | ✅ | ❌ |
| `:6215-6216` (internal security sub-state wrap to 0) | ✅ | ✅ |
| `:7293` (`instantShowSecurity`) | ✅ | ❌ |
| `:7469` (instant reset teardown) | ✅ | ❌ |

Only **one of six** reset call sites also calls `resetRim()`. Every other path that's supposed to bring the vault back to its canonical closed state resets the door panel but leaves the inner dial at whatever angle the user last scrolled it to — exactly "the vault door is stuck at where it was left off," specifically visible in the rotating dial rather than the door panel itself.

**Fix direction:** call `safeVault3DRef.current?.resetRim?.()` next to every `setOpenProgress(0)` call that's meant to represent "state 0 / fully reset," not just the one internal wrap-around case — or merge both into a single `resetToClosed()` method so future call sites can't reset one without the other.

---

## 8. Bento box and its text look different across laptop screens

**Confirmed — the box was already fixed in a prior pass; the text inside it wasn't, and the vault's own centering math (§1b) has the same gap.**

`VIEWPORT_CONSISTENCY_FIXES.md` documents a prior fix: `lib/viewport.ts`'s `getComposedViewport()` clamps `vw`/`vh` to a 1440×900 desktop reference and snaps to discrete width/height tiers (`[1024, 1280, 1366, 1440]` / `[600, 680, 768, 800, 864, 900]`), so two real viewports in the same tier get byte-identical geometry. `computeBentoLayout()` (`BlueprintHero.tsx:857-984`) is fed through this helper at every call site (`:986, 1394, 1693, 6767`) — **the box itself is genuinely fixed and still wired up correctly.**

What's still broken:

1. **Card copy uses raw CSS `vw`, bypassing the fix entirely.** Every heading/paragraph inside the bento tiles sets its size with an inline `style={{ fontSize: "clamp(Npx, M vw, Xpx)" }}` (`BlueprintHero.tsx:8320,8337,8353,8369,8385,8399,8406,8426,8432,8442,8458,8474,8490,8506,8520,8536,8554,8570,8586,8602`) — `vw` here is the native CSS unit, resolved against the *true* live viewport width, never passing through `getComposedViewport()`. So two laptops that land in the same width **tier** (e.g. 1290px and 1370px, both snapped to 1280) get identical box geometry but different text sizes, because the text keeps resolving against 1290 vs. 1370 directly. Each `clamp()`'s own upper plateau also caps out at a slightly different width per string, so headings, body copy, and the box's own 1440px reference can all stop scaling relative to each other at different breakpoints.
2. **The vault's own dock-centering math has the identical gap** — see §1b above (`:1725-1726` using raw `window.innerWidth/innerHeight` instead of the composed/clamped values already computed two lines earlier in the same function).
3. **Secondary:** `tailwind.config.ts` defines no custom breakpoints, so any bento text still using Tailwind's responsive classes steps at the stock 640/768/1024/1280 breakpoints, which don't line up with the 1024/1280/1366/1440 tiers `computeBentoLayout` uses — a second, smaller mismatch window specifically in the 1280–1440px range.

**Fix direction:**
1. Derive bento-tile font sizes from `getComposedViewport()`'s already tier-snapped width (compute in JS and apply as an inline px value, or drive a CSS custom property from JS and reference that instead of raw `vw` inside `clamp()`).
2. Fix `computeDockLayout()`'s `viewportCenterX/Y` to use the composed/clamped `vWidth`/`vHeight` (same fix as §1b).
3. Standardize every bento text `clamp()`'s upper plateau to the same `DESKTOP_REFERENCE_WIDTH` (1440px) the box already uses.

---

## Additional issues found during the audit (not in the original list)

1. **Scroll-hijack ignores `prefers-reduced-motion`.** `lib/gsap.ts` exports `prefersReducedMotion()` and it's correctly respected by `smoothScrollTo`, `createMagneticEffect`, and `SiteHeader` — but `BlueprintHero.tsx`'s own overflow-lock and wheel/touch interception (`:644-660`) runs **unconditionally, before** the file even reads `prefersReducedMotion()` at line 660 (that value appears to only affect individual tween durations later, not whether the hijack installs at all). Users who've asked their OS/browser for reduced motion still get the full wheel-hijacked, scroll-locked experience with no bypass.
2. **"Back to Top" is an instant jump, not an animated scroll**, unlike every other in-page navigation in this app which goes through `smoothScrollTo` (confirmed bare `window.scrollTo(0, 0)` at `BlueprintHero.tsx:~6977, ~7208, ~7420`). This is also a contributing factor to Glitch 6 — an eased scroll would give `SiteHeader`'s `ScrollTrigger` a normal scroll timeline to react to instead of a discontinuous jump.
3. **Dead code, confirmed via grep (zero references outside their own file):** `components/blueprint/BlueprintStackingCards.tsx`, `BlueprintStatementMarquee.tsx`, `BlueprintTestimonials.tsx`, `CharacterIllustration.tsx` (only used by the also-dead `BlueprintTestimonials`), and `components/blueprint/BlueprintFooter.tsx`. Leftovers from an earlier design pass; safe to delete. Also `forceResetAllCardsToBase` (`BlueprintHero.tsx:491`, see §4) is defined but never called. Note: `SiteFooter.tsx:45` has a stale comment claiming "the BlueprintFooter is rendered directly in page.tsx" — it isn't; `app/page.tsx` renders no footer at all after `BlueprintContact` (which appears intentional, but the comment should be corrected so it doesn't mislead a future editor).
4. **`reactStrictMode: true`** (`next.config.mjs:3`) double-invokes effects in local `next dev` only (not in the production build). Given the single giant `useGSAP` hook mutates `document.body`/`documentElement` styles and attaches global listeners directly, double-invocation could make some of the glitches above look more or less severe in local dev than in the deployed production build — worth reproducing/re-testing against the deployed build specifically, not just `next dev`, both before and after any fix.
5. **The duplicated wheel/keydown gesture-gating logic** (the one-step-per-gesture guard described in §2a) is independently re-implemented in `handleKeyDown` rather than shared — a standing maintenance risk where a future change to one path won't automatically apply to the other.

---

## Suggested fix priority

Ordered by risk/effort vs. how many symptoms each one explains:

1. **§6 — add the missing `pathname === "/"` guard to `SiteHeader.tsx`.** One line, mirrors an existing sibling pattern, zero risk to the animation system.
2. **§7 — pair every `setOpenProgress(0)` with `resetRim()`** (or merge into one method). Small, isolated, self-contained.
3. **§1a/§1b — fix `computeDockLayout()`'s reset-order and its unclamped viewport-center math.** Small, localized.
4. **§5 — remove `autoKill` (or briefly suppress wheel input) during the About→FAQ programmatic scroll.** Small, additive, no risk to existing pinned-state logic.
5. **§4 — stop reusing the intro card-flip timeline for the reverse-to-hero transition.**
6. **§8 — route bento card text sizing through the same clamped viewport helper already used for the box.** Mechanical, touches ~20 inline styles, low risk.
7. **§2/§3 — the scroll-lock/flag and timeline-symmetry work.** Highest effort: needs (a) auditing every `.kill()` against its paired busy-flag, (b) killing all substate timelines inside `navigateToSection` before jumping, and (c) unifying `consolidateRingToStack`/`restoreStackToRing` into one reversible timeline like the Product↔Ring pair already is. Recommend tackling last, and specifically testing: rapid nav-clicks mid-gesture, a resize mid-transition, and tab refocus mid-transition, to try to reproduce a permanently-stuck flag before changing this architecture.

**Longer-term:** the umbrella cause behind items 1, 3, 4, 6, 7 (and likely 2) is that one ~10,000-line component owns three "worlds" (Hero, Product, Security) through 50+ refs and dozens of independent imperative reset call sites, with no single canonical "fully reset to state X" function that every entry path shares. Splitting `BlueprintHero.tsx` into per-section modules with one shared reset/dock-layout utility would close off this entire class of bug at the root, rather than needing a bespoke fix every time a new interruption sequence is discovered.
