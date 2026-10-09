# Addendum — Restore In-Section Animations (Cross-Section Removal Stays)

**Status:** Ready for anti-gravity. This is an addendum to, not a reversal of,
`Docs/2026-10-01-full-scroll-choreography-removal-plan.md`. That pass is confirmed correct and
should **not** be undone — the cross-section hand-offs (vault cards flying in/out, vault door
opening/closing between sections, envelope assembly on Security→About hand-off, Hero's iris-portal
zoom) are gone and should stay gone. The user's own words after reviewing the result:

> "It almost did what I wanted to do but what it lost was the core animations which are inside the
> sections... all these core core animations are also removed along with transition — specifically
> bring them back. Other than that everything looks fine for now."

So the correction is narrow: **three specific animations that live and complete entirely within one
section** were deleted along with the cross-section hijacking, and need to come back — reconnected as
local, scroll-into-view-triggered animations scoped to their own section, never reaching across into
another section's state and never blocking/intercepting native scroll.

## 0. Critical implementation shortcut — the original code is still recoverable

The full-removal pass was never committed (`git log` confirms the working tree is still sitting on
top of commit `64d2c8d`, uncommitted). Two consequences anti-gravity should use directly instead of
reconstructing anything from scratch or from this doc's prose:

1. **`git show 64d2c8d:<path>`** (or `git diff -- <path>`) recovers the exact pre-removal
   implementation of every deleted timeline — exact tween values, easings, durations — for any file,
   including `components/blueprint/scenes/ProductBentoScene.tsx`'s original
   `createRestingToBentoTimeline`.
2. For Security and About specifically, the removal pass didn't even delete the original function
   bodies — it stubbed the live entry point to a no-op and **renamed the original, fully-intact body
   to a dead `_unused*` sibling in the same file**:
   - `components/blueprint/scenes/SecurityVaultScene.tsx:4075` — `_unusedGoToSecurityState` (the
     original per-sub-state stepping logic: cleanup of the previous state's flourish, the vault rim
     rotation call, and each state's enter animation).
   - `components/blueprint/scenes/AboutScene.tsx:393` — `_unusedJumpToAboutState` (the original
     envelope/flap/document-reveal logic, among other things it did that should *not* come back — see
     §3c).
   - `components/blueprint/scenes/AboutScene.tsx:251` — `_unusedFlipDocToPage` (already correctly
     reconnected as a click handler per the prior pass's §5 decision — not part of this addendum).
   - `components/blueprint/scenes/AboutScene.tsx:335` — `_unusedExitAboutToFaq` (cross-section
     hand-off — stays dead, not part of this addendum).

   Use these `_unused*` bodies as the starting point for each restoration below: strip out the
   busy-flag/safety-valve/stage-pin/cross-section parts, keep the actual visual tweening, and
   re-trigger it from a section-scoped `ScrollTrigger` instead of the old discrete wheel-gesture
   dispatch.

## 1. Product — resting row → bento grid formation

**Restore:** the animation that morphs the 5 product cards from a resting/stacked arrangement into
the full bento-tile grid. Recover the original tween values from
`git show 64d2c8d:components/blueprint/scenes/ProductBentoScene.tsx` (`createRestingToBentoTimeline`,
originally ~line 154).

**How to re-trigger it (local to Product only):** a single `ScrollTrigger` scoped to the `#product`
section element (or its own track/first-card element), `start: "top 70%"` (tune to taste), firing the
timeline forward **once** when Product's own content scrolls into view —
`toggleActions: "play none none none"` (or `once: true` equivalent), not `scrub`. This was originally
a discrete, finished-in-under-a-second settle animation, not something that should track scroll
position continuously back and forth — a one-shot "play on enter" reads closer to the original intent
than a scrub. If anti-gravity's visual judgment says scrub reads better, that's an acceptable
deviation — just confirm it doesn't reintroduce any pin/busy-flag/native-scroll-blocking behavior.

**Do not restore:** anything related to the cards arriving *from* Hero (no iris-portal, no card-flip
choreography tied to the Hero→Product boundary) — Product's own entrance into view is the only trigger.

## 2. Security — vault rim rotation + per-sub-state text/flourish reveal

**Restore:** as each of the 8 stacked sub-state blocks (`securityStateRefs.current[0..7]`, rendered by
`SecurityStageSlot`, `SecurityVaultScene.tsx:4661`) scrolls into view in the right column, play that
state's own enter flourish (the money-bill morph, read-only-eyes, password mask, lock morph,
connection, India map, sell-shield, closing-statement word reveals — all still fully defined in the
JSX and in `_unusedGoToSecurityState`'s cleanup/setup logic) **and** rotate the vault's dial via
`safeVault3DRef.current?.triggerRimStep?.(direction, idx)` (left column, sticky) to match. This is the
"vault rotates while on the right the text shifts down" effect the user named.

**How to re-trigger it (local to Security only):** 8 independent `ScrollTrigger`s, one per
`securityStateRefs.current[idx]`, each `start: "top 65%"` (tune to taste) within the Security
section's own (now real, native-scroll) height. On entering a state's trigger:
1. Play that state's specific flourish-in tween (reuse `_unusedGoToSecurityState`'s per-`nextIdx`
   branch bodies — the money/eyes/password/lock/connection/india/sell/closing blocks already present
   lines ~4100-4400 of that function).
2. Call `safeVault3DRef.current?.triggerRimStep?.(direction, idx)` with `direction` derived from
   scroll direction (forward = `1`, backward = `-1`) so the dial visually tracks whichever way the
   user is scrolling through the list.
3. On leaving a state's trigger (scrolling past it in either direction), run that state's existing
   cleanup (already present in `_unusedGoToSecurityState`, e.g. resetting `moneyWrapperRef`/
   `lockIconWrapperRef`/etc. back to `opacity: 0`) so re-entering it later replays cleanly.

Explicitly drop from `_unusedGoToSecurityState`: `isSecurityTransitioningRef`/
`armBusySafetyValve`/any gating that would block or delay native scroll — none of that belongs in a
scroll-into-view trigger. The vault itself stays in its closed pose the whole time (only the rim/dial
rotates) — door-open/close tweens stay deleted per the original plan.

## 3. About — envelope flap opens, document emerges

**Restore:** the moment the About section's envelope first scrolls into view, play the flap-opening
and document-emerging flourish — `envelopeTopFlapRef` sweeping open and `docCavityWrapperRef`/
`philosophyDocRef` revealing the document rising out of the envelope cavity. This is the "opening the
envelope and then the card coming out" the user named. The relevant tweening is inside
`_unusedJumpToAboutState` (`AboutScene.tsx:393`, roughly lines 488-551 for the envelope/flap/cavity/
document reveal specifically).

**How to re-trigger it (local to About only):** a single `ScrollTrigger` scoped to the `#about`
section (or `unifiedEnvelopeRef` itself), `start: "top 60%"`, playing the flap/document reveal
**once** forward on entering view — same one-shot pattern as §1, not scrub, not reversible-on-scroll-
up unless that reads better on review.

**Do not restore, from the same `_unusedJumpToAboutState` body:**
- The `window.scrollTo(0, 0)` / `lockScrollYRef` / `stageRef` fixed-positioning / iris-portal-clip
  block at the top of that function — that's the old cross-section "jump" mechanism, stays deleted.
- The `cardsClusterRef`/`aboutContentRef` fly-in-from-above tweens tied to arriving *from* the ring/
  stack consolidation — that's the Security→About hand-off, stays deleted. The 26 scatter cards stay
  exactly as they are now: statically positioned per `SCATTER_SLOTS`, already in place when About
  scrolls into view, no fly-in.
- Anything that calls into `shared.current.consolidateRingToStack()` or references the Security scene.

Only the self-contained "envelope flap opens, document emerges from the cavity" piece belongs to
About alone and should come back.

## 4. Guardrails (unchanged from the original plan, restated because it's easy to blur the line)

- None of the three restorations above may call `preventDefault()`/`stopImmediatePropagation()` on
  any scroll/wheel/touch/key event, set `position: fixed` on any section's stage, reintroduce a
  busy-flag that blocks or delays native scroll, or reach across into another section's refs/state.
  Each is a self-contained "play this once as my own content enters the viewport" `ScrollTrigger`,
  nothing more.
- Re-run the full §7 acceptance checklist from the original plan doc after wiring these back in
  (mouse wheel both directions, scrollbar-thumb drag, deep link, nav-pill clicks, keyboard/touch,
  resize mid-scroll) — adding `ScrollTrigger` instances is low-risk but should still be re-verified,
  especially deep-linking straight into the middle of the Security section (does sub-state 5's
  flourish correctly play/skip-to-played-state on first paint, rather than appearing mid-flourish or
  not at all?).
- Explicitly confirmed still correctly deleted and **not** part of this addendum: `createProductToRingTimeline`
  (cards into vault + door close), `consolidateRingToStack`/`restoreStackToRing` (vault open on
  Security→About, cards moving out on About→Security), `createHeroToProductTimeline` (iris-portal
  zoom), `exitAboutToFaq`, `exitSecurityToAbout`. If any of §1-3's restoration work ends up
  accidentally re-coupling to one of these, that's a bug in the restoration, not a sign these should
  come back too.

## 5. One open question for the user, not yet resolved by this doc

The request also mentioned "the about us page animation" as a fourth item, separate from "the opening
the envelope and then the card coming out" (About *section*, on the one-page scroll site). It's
unclear whether this is the same item restated, or refers to the separate `/about` route
(`app/about/page.tsx`, a different page entirely, unrelated to `BlueprintHero.tsx`'s scene engine and
untouched by the removal pass). Recommend anti-gravity implement §1-3 now (unambiguous) and confirm
with the user directly whether `/about`'s own page needs anything before touching that file.
