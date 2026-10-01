# Task 6 — Remove Cross-Section Scroll-Hijacking (detailed sub-plan)

This supersedes the Task 6 section of `Docs/2026-09-30-frontend-redesign-pass-plan.md`, which was
written against the pre-refactor monolithic `BlueprintHero.tsx`. That file has since been split into
an engine + per-scene architecture (see recent commits: `feat: add BlueprintHero component with GSAP
animations and interactive sections`, `Reapply "feat: add viewport utility functions..."`). This plan
is written against that current code, verified by reading it directly rather than trusting the old
doc's descriptions.

## 1. What "scroll-hijacking" actually is, in the current code

There is **no ScrollTrigger-driven pin/scrub anywhere in this system today.** `ScrollTrigger` is
imported in a few files but only ever used for `.refresh()` calls; `ScrollTrigger.create()` does
not appear once in `BlueprintHero.tsx`, `hero-engine/*.ts`, or `scenes/*.tsx`. There's even a fully
wired but dead ref, `apertureScrollTriggerRef` (declared in `useSceneEngine.ts:65`, threaded through
`BlueprintHero.tsx` and `SecurityVaultScene.tsx`), that is never assigned a `ScrollTrigger` instance
— it's always `null`. **This corrects the original plan doc's claim that "the Security dial already
uses ScrollTrigger scrub" — it doesn't.** Verified directly: `goToSecurityState`
(`SecurityVaultScene.tsx:4053`) is a discrete step function gated by a busy-flag
(`isSecurityTransitioningRef`), invoked once per resolved gesture — the exact same mechanism as every
other cross-section transition, not an independent scrub timeline. Any "re-platform onto the
mechanism the dial already uses" language needs to be dropped; there is no existing scrub precedent
to reuse. We would be building the first one.

What actually exists is a **manual scroll-hijacking engine**, cleanly isolated in one file:

- **`components/blueprint/hero-engine/useSceneEngine.ts`** (706 lines) owns:
  - Every busy-flag ref (`transitionAnimatingRef`, `isHoldingProductRef`, `isSecurityTransitioningRef`,
    `isNavigatingRef`, `hasTriggeredThisGestureRef`, `wheelGestureActiveRef`, `touchGestureActiveRef`,
    `isRingConsolidatedRef`, `isFlippingDocRef`, etc.) and `stateRef`, a `SceneState` machine with
    values `hero | product-resting | product | ring | about | faq`.
  - `window.addEventListener("wheel"/"touchstart"/"touchmove"/"touchend"/"keydown", ..., { passive:
    false, capture: true })` with pervasive `preventDefault()`/`stopImmediatePropagation()` — this is
    the literal hijacking: as long as `stateRef.current` is one of `hero/product-resting/product/ring/
    about`, native scroll is fully intercepted and translated into a resolved `SceneAction` dispatched
    to whichever scene registered for that state.
  - `handleScrollLock`, which forcibly calls `window.scrollTo` back to a locked Y during pinned
    states (fighting any native scroll that leaks through), or fires a registered `onScrollDrift`
    callback for `about`.
  - `registerScene(name, { trigger, reverse, onScrollDrift })` — the per-scene registration API each
    scene file uses to plug into the gesture resolver.
  - `armBusySafetyValve`/`disarmBusySafetyValve` — a documented mitigation for a **real shipped bug**
    ("scroll permanently locking up") where a busy-flag's only reset lived inside a timeline's
    `onComplete`, so killing that timeline early left the flag stuck `true` forever. This is
    band-aiding a structural problem: busy-flags gating raw event listeners is inherently fragile.
    Removing the hijacking removes the entire class of bug this valve exists to patch.

- **`components/blueprint/hero-engine/sceneTransitions.ts`** (1079 lines) owns `resetToState()`, the
  **nav-click / "jump directly to section X" path** — a completely different code path from the
  gesture-driven step-by-step transitions above. This is a genuine, already-good piece of
  architecture: it replaced six duplicated `instantShowX` functions specifically to fix a
  "different subset of shared state gets reset depending on entry path" bug class (documented in the
  file's own header comment, citing a "root-cause report §0/§2b/§3/§7"). It:
  1. Unconditionally clears every busy flag and disarms every safety valve.
  2. Kills every scene's in-flight timeline/tween, unconditionally.
  3. Dispatches to one of `resetToRing`/`resetToProduct`/`resetToHero`/`resetToAbout`/
     `resetToNativeScrollSection` (used for both `faq` and `contact`).
  - **Load-bearing existing precedent**: `resetToNativeScrollSection` proves the target end-state
    already exists for 2 of 6 sections. FAQ and Contact are **not** pinned/hijacked at all today —
    they're plain in-flow content, and "jumping" to them is just `releaseNativeScroll()` +
    `unpinStage()` + `smoothScrollTo(el)`. Task 6 is extending this exact pattern to the other four
    macro states (`hero`, `product`, `ring`, `about`), not inventing a new one.
  - `pinStage`/`unpinStage` are the manual CSS pin (`position: fixed; height: 100vh`), and
    `lockNativeScroll`/`releaseNativeScroll` toggle `overflow: hidden` on `<html>`/`<body>`. These are
    the mechanical parts of "hijacking" that `resetToState` currently still has to know about (it
    calls `unpinStage`/`releaseNativeScroll` only for the two already-native targets) — once all six
    states are native-scroll, these two helpers and the fixed-position pin become dead code entirely.

- **Per-scene cross-section hand-off timelines** (the actual "scroll-jack one section into the
  next" animations, one owner each — confirmed via direct grep, not inferred):
  - `HeroScene.tsx:139` — `createHeroToProductTimeline` (Hero → Product).
  - `SecurityVaultScene.tsx:456` — `createProductToRingTimeline` (Product → Security).
  - `SecurityVaultScene.tsx:2482` / `:3666` — `consolidateRingToStack` / `restoreStackToRing`
    (Security ↔ About).
  - `AboutScene.tsx:303` — `exitAboutToFaq` (About → FAQ, hands off into the already-native FAQ).
  - All of these are invoked exclusively via `dispatchSceneAction` in `BlueprintHero.tsx:1173`, which
    is itself only ever called from a `SceneAction` resolved by `useSceneEngine`'s gesture handlers.
    Deleting the engine's dispatch removes all live call sites for these functions in one shot.

- **In-section timeline, explicitly a re-platform (not delete) candidate**:
  - `ProductBentoScene.tsx:154` — `createRestingToBentoTimeline` (cards resting → full bento grid),
    triggered by the SAME hijacked gesture path today (`"product-resting"` registration in
    `BlueprintHero.tsx:1223`), but it is a within-Product-section animation with no cross-section
    hand-off, so it's the one timeline that should become a real `ScrollTrigger({ scrub: true })`
    tied to native scroll position within the Product section, rather than being deleted.
  - The Security "dial" sub-state stepping (`goToSecurityState`, `SecurityVaultScene.tsx:4053`) is
    the same category: seven in-section sub-states, no cross-section hand-off. This is also a
    re-platform candidate (onto scrub or onto per-sub-state `ScrollTrigger` markers within the
    Security section), not a deletion.

- **Nav-click routing, unaffected in shape, simplified in mechanism**:
  - `BlueprintHero.tsx:1133` — `navigateToSection` maps a section name to a `SceneResetTarget` and
    calls `resetToState`. This stays; only `resetToState`'s internals shrink once every target is
    native-scroll (it degenerates towards all six branches looking like
    `resetToNativeScrollSection` already does).

- **Layout math, unaffected**: `computeBentoLayout` (`BlueprintHero.tsx`), `computeDockLayout`
  (`SecurityVaultScene.tsx:390`), `lib/dockLayout.ts` — pure geometry, no scroll/animation coupling,
  not in scope for this task.

## 2. Disposition inventory

| Piece | File | Disposition |
|---|---|---|
| Wheel/touch/keydown hijack listeners, `handleScrollLock`, busy-flag refs, safety valve | `hero-engine/useSceneEngine.ts` | **Delete** |
| `registerScene`/`sceneHandlersRef` dispatch pattern | `hero-engine/useSceneEngine.ts` | **Delete** (each scene becomes a plain `ScrollTrigger`-driven component instead of a gesture-action registrant) |
| `pinStage`/`unpinStage`, `lockNativeScroll`/`releaseNativeScroll` | `hero-engine/sceneTransitions.ts` | **Delete** once all 6 states are native-scroll |
| `resetToState` + its 6 target bodies | `hero-engine/sceneTransitions.ts` | **Keep, shrink.** Becomes "scroll-to-element" for every target, i.e. converges toward today's `resetToNativeScrollSection` body. Still needed for nav-pill clicks / deep links / "Back to top". |
| `createHeroToProductTimeline` | `HeroScene.tsx` | **Delete** (cross-section hand-off) |
| `createProductToRingTimeline` | `SecurityVaultScene.tsx` | **Delete** (cross-section hand-off) |
| `consolidateRingToStack` / `restoreStackToRing` | `SecurityVaultScene.tsx` | **Delete** (cross-section hand-off) |
| `exitAboutToFaq` | `AboutScene.tsx` | **Delete** (cross-section hand-off) |
| `createRestingToBentoTimeline` | `ProductBentoScene.tsx` | **Re-platform** onto `ScrollTrigger({ scrub: true })` scoped to the Product section |
| `goToSecurityState` / 7 sub-state stepping | `SecurityVaultScene.tsx` | **Re-platform** onto `ScrollTrigger` (scrub or per-marker snap) scoped to the Security section |
| `computeBentoLayout`, `computeDockLayout`, `lib/dockLayout.ts` | — | **Keep as-is**, pure geometry |
| `navigateToSection`, nav click → `resetToState` wiring | `BlueprintHero.tsx` | **Keep**, simplifies as `resetToState` shrinks |
| `resetToNativeScrollSection` pattern (`faq`/`contact`) | `hero-engine/sceneTransitions.ts` | **Keep — this is the target pattern to copy for the other 4 states** |
| `apertureScrollTriggerRef` | `useSceneEngine.ts` / threaded through 2 other files | **Delete** — dead ref, never assigned, safe to remove entirely |

## 3. Target end-state

All six macro states (`hero`, `product`, `ring`/security, `about`, `faq`, `contact`) become in-flow,
natively-scrollable page sections, each roughly `100vh`+ tall, the way `faq`/`contact` already are.
Within a section, the current in-section animation (bento formation, security sub-state stepping,
about envelope/doc flip, hero intro) becomes a `ScrollTrigger` scoped to that section's own scroll
range (`scrub: true` or discrete per-marker snaps, per-scene choice). There is no cross-section
hand-off timeline and no global wheel/touch/keydown interception — the browser's native scroll is
the only driver, and CSS `scroll-snap` (or nothing) replaces `pinStage`.

## 4. Execution order (each step independently shippable/revertable)

1. **Spike: Product section only.** Convert `ProductBentoScene.tsx`'s resting↔bento animation to a
   scoped `ScrollTrigger` scrub, with the section laid out in-flow (no `pinStage`). Keep the rest of
   the engine untouched — Hero→Product and Product→Security hand-offs still use the old hijack path
   into/out of this section. This isolates the highest-uncertainty item (does a bento-grid formation
   read well as a scrub instead of a discrete step?) before touching anything cross-section.
2. **Hero → Product hand-off removal.** Delete `createHeroToProductTimeline`; make Hero a plain
   in-flow section; Product following it in normal flow. Update `resetToState`'s `hero`/`product`
   bodies toward the `resetToNativeScrollSection` shape.
3. **Security section.** Re-platform `goToSecurityState`'s 7 sub-states onto scoped `ScrollTrigger`
   markers; delete `createProductToRingTimeline` (Product→Security hand-off).
4. **About section + Security↔About hand-off.** Delete `consolidateRingToStack`/
   `restoreStackToRing`/`exitAboutToFaq`; make About in-flow; verify About's existing
   `onScrollDrift` recovery callback (`useSceneEngine.ts` registration in `BlueprintHero.tsx:1240`)
   is no longer needed once About can't drift out of a pin (there's nothing to drift out of).
5. **Engine teardown.** Once no scene registers via `registerScene` for gesture dispatch anymore,
   delete `useSceneEngine.ts`'s listeners, busy-flag refs, safety valve, and `registerScene` API
   itself, plus the now-dead `apertureScrollTriggerRef`. Shrink `sceneTransitions.ts` to just
   "scroll to element" per target now that `pinStage`/`unpinStage`/`lockNativeScroll`/
   `releaseNativeScroll` have no remaining callers.
6. **Full regression pass**: nav-pill clicks to every section, direct deep-link/hash load, mobile
   touch scroll, keyboard (arrow/space/PageDown) scroll, browser back/forward, resize mid-scroll.

Steps 2-4 are independently the risky ones (cross-section visual continuity is exactly what the
deleted timelines were built to fake) — each should get its own before/after Playwright scroll
recording, not just a final end-to-end pass.

## 5. Open items to resolve before/during implementation (not yet answered by this plan)

- Whether the Hero→Product and Product→Security "hand-off" moments need *any* bespoke transition
  motion once cross-section, or whether adjacent-section native scroll (with each section's own
  entrance `ScrollTrigger` reveal) is visually acceptable on its own. The deleted timelines currently
  do real work (portal/iris masking, camera-move illusions) — Task 6 should decide per-hand-off
  whether that's replaced with a lighter `ScrollTrigger`-based entrance animation or dropped.
  Recommend prototyping the Hero→Product one first (step 2 above) and getting sign-off before
  committing to the same call for the other two hand-offs.
- Section height/scroll-distance budget: pinned states today occupy exactly one viewport each
  (`height: 100vh` while pinned); native-scroll sections instead need real document height per
  section (long enough to drive their internal scrub without seeming to over- or under-shoot). This
  needs per-section tuning once the browser's scroll behaves natively.
- Whether `stateRef`'s `SceneState` union / `dispatchActiveSection`-driven nav-highlight-on-scroll
  behavior (used elsewhere, e.g. `BlueprintNav.tsx`'s active-link indicator) can be swapped for a
  plain `ScrollTrigger`/`IntersectionObserver`-based "which section is in view" check once sections
  are native-scroll, or whether it should keep reading `stateRef` for compatibility. Not yet
  investigated — needs a read of how `BlueprintNav.tsx` currently consumes `unifolio-active-section`.

## 6. Verification approach

Reuse the pattern already validated for Task 7: kill and fully restart the dev server after every
edit (WSL file-watching does not propagate over `/mnt/d`, confirmed in the Task 7 pass — HMR cannot
be trusted here), then drive Playwright against each step's before/after state with screenshots at
several scroll offsets, plus a full manual keyboard/touch/mouse-wheel pass per completed section.
