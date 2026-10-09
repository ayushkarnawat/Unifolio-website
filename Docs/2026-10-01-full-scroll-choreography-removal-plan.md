# Full Removal of Cross-Section Scroll Choreography — Ground-Up Reset

**Status:** Ready for anti-gravity execution. Claude authored this plan from direct code reading
(every file/line reference below was verified in the repo on 2026-10-01); Claude did **not**
implement any of it. Per explicit user instruction, this is a plan-only handoff — anti-gravity
executes, Claude reviews the result afterward against this doc.

## 0. Why this doc exists

Two prior attempts (Hero→Product and Product→Security boundaries) were converted from discrete
scroll-hijacking to `ScrollTrigger` scrub, declared "fixed and verified," and still produced visible
breakage and — more importantly — **kept the exact cinematic the user had already asked to have
removed** (cards flying into the vault, vault door closing, then the Security section "starting").
The user's own words:

> "Still facing a lot of issues, including still seeing that car[d] transition where the cards move
> inside the vault and the vault closes to then start the security section. Whereas I told you to
> remove that and just straight up just go into the security section with the vault already there
> and then start from there. No opening closing vault had to be removed. That was not done. [...]
> remove all the transition state: the cards moving in, the vault opening, vault closing, wall
> opening, wall closing, cards moving out, about section work coming down, opening card, whatever,
> whatever, and all the plans that you have made."

This plan treats that instruction as total and literal: **every** scroll-driven, multi-second,
choreographed hand-off or reveal animation between and within Hero / Product / Security / About is
deleted — not re-platformed, not re-timed, not simplified-but-kept. Replacement is the plainest
possible thing: a normal, natively-scrollable one-page site where each section simply shows its
finished, resting design the moment it's in the viewport.

## 1. Target end state (non-negotiable spec)

- Every section (Hero, Product, Security, About, FAQ, Contact) is an ordinary in-flow `<section>`
  block, stacked top to bottom, with real document height. No section is ever `position: fixed`,
  pinned, or has its own hijacked scroll range.
- The browser's native scroll is the **only** input mechanism. No `wheel`/`touchmove`/`keydown`
  listener anywhere intercepts, gates, or redirects scroll. No `window.scrollTo` is ever called to
  fight or correct the user's own scroll position (nav-link clicks are the one exception — see §6).
- Each section's content renders in its **final, fully-resolved visual state** as soon as it mounts.
  Scrolling to a section does not trigger a multi-second animation sequence that has to "finish
  playing" before the section looks right. Nothing "waits" for a vault to open, a card to fly, an
  envelope to unfold, or a ring to expand before the content underneath is usable/visible.
- Optional, and only if anti-gravity judges it improves the feel: a single, lightweight,
  non-blocking entrance treatment per section — e.g. a basic fade/slide-up of `0.3–0.5s` the first
  time a section's own container crosses into the viewport (the same category of effect the FAQ/
  Contact/Testimonials sections likely already use, since those were never part of the hijacked
  engine). This must **never** be scroll-scrubbed (no `scrub: true`), never cross-fade one section
  into another, never be gated by a busy-flag, and must be skippable/instant for
  `prefers-reduced-motion`. If in doubt, prefer no entrance animation at all over inventing a new
  one — the point of this pass is to stop having scroll-coupled choreography, not to replace one
  flavor of it with a smaller one.
- No section's visual state depends on which direction the user is scrolling, how fast they
  scrolled, or what the previous section's exit animation reached. Reloading the page with the
  scroll position already at e.g. the About section must render About correctly with zero setup —
  there is no "arm this state by replaying the hand-off" step anymore.

## 2. Verified current-state inventory — everything in scope for deletion

All line numbers verified by direct `Read`/`grep` on 2026-10-01 against the `redesign` branch.

### 2a. Engine-level hijacking infrastructure (the mechanism that makes all of the below possible)

| Piece | File | What it does today |
|---|---|---|
| `wheel`/`touchstart`/`touchmove`/`touchend`/`keydown`/`scroll` capture-phase listeners, all with `preventDefault()`/`stopImmediatePropagation()` | `components/blueprint/hero-engine/useSceneEngine.ts` (listeners registered ~line 620-625) | Hijacks every scroll input while `stateRef.current` is `hero/product-resting/product/ring/about`, translates it into a resolved `SceneAction` instead of letting the browser scroll natively. |
| Busy-flag refs: `transitionAnimatingRef`, `isHoldingProductRef`, `isSecurityTransitioningRef`, `isNavigatingRef`, `hasTriggeredThisGestureRef`, `wheelGestureActiveRef`, `touchGestureActiveRef`, `isRingConsolidatedRef`, `isFlippingDocRef` | `useSceneEngine.ts` (declared ~lines 46-82) | Gate the hijack handlers so only one "gesture" resolves at a time; the entire reason the "permanent freeze" class of bug exists. |
| `handleScrollLock` | `useSceneEngine.ts` | Force-snaps `window.scrollY` back to a locked value while a state is pinned, fighting any scroll that leaks through. |
| `registerScene(name, { trigger, reverse, onScrollDrift })` / `sceneHandlersRef` | `useSceneEngine.ts` (~line 84-86) | Per-scene registration API scenes use to plug into the gesture resolver. |
| `armBusySafetyValve`/`disarmBusySafetyValve` | `useSceneEngine.ts` | Timeout-based mitigation for busy-flags getting stuck `true` forever — a symptom of the hijack architecture, not a feature. |
| `apertureScrollTriggerRef` | `useSceneEngine.ts` (~line 65) | Dead ref, never assigned a real `ScrollTrigger`. Delete outright. |
| `pinStage`/`unpinStage` | `components/blueprint/hero-engine/sceneTransitions.ts` | Manual CSS pin (`position: fixed; height: 100vh`) applied to the mega-stage. |
| `lockNativeScroll`/`releaseNativeScroll` | `sceneTransitions.ts` | Toggle `overflow: hidden` on `<html>`/`<body>` (plus, as of 2026-10-01, a scrollbar-hiding class) to stop native scroll while a transition plays. |
| `resetToState()` + its 6 target bodies (`resetToHero`/`resetToProduct`/`resetToRing`/`resetToAbout`/`resetToNativeScrollSection` ×2) | `sceneTransitions.ts` | Nav-click / deep-link "jump directly to section X" path — kills every in-flight timeline and busy flag, then snaps into a target section's pinned-or-native state. |
| `dispatchSceneAction` + the 11 `SceneAction` cases it switches on (`productToHero`, `productToRing`, `bentoToResting`, `restingToBento`, `ringToProduct`, `goToSecurityState`, `consolidateRingToStack`, `restoreStackToRing`, `flipDocToPage`, `exitAboutToFaq`, `jumpToAboutState`) | `components/blueprint/BlueprintHero.tsx` (~line 1199-1233) | Central router from a resolved gesture to the one scene-owned function that handles it. |
| 5 `engine.registerScene(...)` calls for `product-resting`/`product`/`ring`/`about`/`faq` | `BlueprintHero.tsx` (~line 1250-1269) | Wires the above into the hijack engine. |

**Disposition: delete all of the above in full.** Nothing here survives in any form once every
section is plain native scroll — this is the literal hijacking mechanism, not a per-transition
effect.

### 2b. Hero → Product

| Piece | File | What it does today |
|---|---|---|
| `createHeroToProductTimeline` | `components/blueprint/scenes/HeroScene.tsx:148` | A `ScrollTrigger({ scrub: 1 })`-driven timeline (already converted from discrete-trigger to scrub in a prior pass) that: pulls the hero intro text toward a vanishing point and fades it, zooms the hero video/ring to `scale: 5.5` into an "iris portal" clip-path that expands across the whole viewport, pulses a concentric ripple, then — once the portal set-up completes — presumably flips/settles the product cards into their resting amphitheater arrangement and finally glides them into the bento grid. This is the literal "circular graphic in various states" the user's screenshots showed. |
| `triggerProductToHero` / `ensureHeroToProductTimeline` | `HeroScene.tsx:593`, `:585` | Reverse-direction entry points for the same timeline, invoked via `dispatchSceneAction`'s `"productToHero"` case. |

**Disposition: delete entirely**, including the iris-portal clip-path mechanism
(`irisPortalRef`/`portalRimRef`/`portalRippleRef`/`applyPortalClip`/`portalState`) if nothing else in
the codebase still needs it after this timeline is gone (confirm via grep before deleting the DOM/CSS
for it — likely needed only by this timeline and About's `jumpToAboutState`, which is also being
deleted, see §2e).

**Replacement:** Hero is a plain in-flow hero section (headline, CTA, hero visual/video in its
normal resting pose, no zoom/clip-path state machine). Product follows immediately below it in
document flow, already showing its full bento-grid layout (see §2c) — the user simply scrolls from
one to the other.

### 2c. Within Product (resting cards → bento grid)

| Piece | File | What it does today |
|---|---|---|
| `createRestingToBentoTimeline` | `components/blueprint/scenes/ProductBentoScene.tsx:154` | Animates the 5 product cards from a "resting amphitheater" arrangement into the full bento-tile grid layout. |
| `triggerRestingToBento` / `triggerBentoToResting` | `ProductBentoScene.tsx:385`, `:398` | Forward/reverse entry points, invoked via `dispatchSceneAction`'s `"restingToBento"`/`"bentoToResting"` cases. |

**Disposition: delete.** There is no "resting" intermediate state anymore — Product renders directly
as the finished bento grid, full stop. (Note: the prior Task 6 plan, `Docs/2026-09-30-task-6-scroll-
hijacking-removal-plan.md`, recommended re-platforming this onto a scoped `ScrollTrigger({ scrub:
true })` rather than deleting it. That recommendation is **superseded** by the user's current
instruction — do not build a scrubbed version of this, just show the grid.)

### 2d. Product → Security ("cards move into the vault, vault closes")

| Piece | File | What it does today |
|---|---|---|
| `createProductToRingTimeline` | `components/blueprint/scenes/SecurityVaultScene.tsx:467` | The exact animation the user flagged by name: product cards cluster and fly from their bento/resting position into the vault dock, the vault door (`SafeVault3D`'s `setOpenProgress`, animated via a `safeMotionProxy.p` tween at `SecurityVaultScene.tsx:1019`/`:1225`) opens then closes around them, after which the Security section's content is considered "arrived." |
| `triggerProductToRing` / `triggerRingToProduct` / `ensureProductToRingTimeline` | `SecurityVaultScene.tsx:4355`, `:4404`, `:4347` | Forward/reverse/lazy-init entry points, invoked via `dispatchSceneAction`'s `"productToRing"`/`"ringToProduct"` cases. |

**Disposition: delete entirely**, including every `safeVault3DRef.current?.setOpenProgress(...)` call
tied to this timeline.

**Replacement:** scrolling from Product into Security shows the Security section already in its
finished resting appearance — vault **closed** (this is verified as the codebase's own existing
"resting" pose: every security sub-state's setup/cleanup code calls
`safeVault3DRef.current?.resetToClosed()` — see `SecurityVaultScene.tsx` lines 617-618, 820-821,
2783-2784, 3119-3120, 3800-3801, 4092, 4231, 4510 — the open-door motion only ever happens
*during* a hand-off that is being deleted). No cards fly, no door swings, no "stage arrival" gating.

### 2e. Within Security (8 sub-state "dial" stepping)

| Piece | File | What it does today |
|---|---|---|
| `goToSecurityState` | `SecurityVaultScene.tsx:4078` | Steps through 8 content sub-states (hero money-word, read-only-eyes, password-mask, lock-morph, connection, India-map, sell-shield, closing-statement) one discrete gesture at a time, each gated by its own busy flag, each with its own enter/exit flourish timeline (typing/masking/morphing character animations) and a `triggerRimStep` call that rotates the vault's dial/rim per step. |
| `exitSecurityToAbout` | `SecurityVaultScene.tsx:4336` | Thin wrapper that hands off from the last sub-state into `consolidateRingToStack` (see §2f). |

**Disposition: delete the discrete-gesture stepping mechanism** (the busy-flag-gated, one-
sub-state-per-wheel-tick pattern). The 8 content blocks themselves are real content (the user hasn't
asked to cut any copy) — they become **plain stacked sub-sections inside the Security section**,
each its own natural scroll height, in a fixed vertical order, so scrolling through Security just
scrolls past all 8 in sequence like any other long page content. The per-character typing/masking/
morphing flourishes tied to the old discrete-step gating (`pwdMaskTlRef`, `lockAnimTlRef`,
`connectionAnimTlRef`, `indiaAnimTlRef`, `moneyAnimTlRef`, `sellAnimTlRef`, `typoEyesTlRef`) should
be cut back to, at most, the same lightweight per-section entrance treatment described in §1 — not
kept as scroll-gesture-triggered sequences. The vault's rim/dial rotation (`triggerRimStep`) was only
ever meaningful as a side-effect of the discrete stepping gesture; since stepping is gone, stop
calling it — the vault sits in one static closed pose throughout the whole Security section unless
anti-gravity has a concrete lighter-weight idea (e.g. a purely decorative idle rotation unconnected
to scroll position) worth proposing separately.

### 2f. Security ↔ About ("vault opens", "cards move out")

| Piece | File | What it does today |
|---|---|---|
| `consolidateRingToStack` | `SecurityVaultScene.tsx:2507` | The Security→About hand-off: opens the vault (`setOpenProgress` tweened via `safeOpenProxy.p`, `SecurityVaultScene.tsx:2965`/`:3095`), consolidates/stacks cards, and morphs them toward the About envelope's scatter positions, ending with a "closing statement" text sequence (`CLOSING_BLACK_WORDS`/`CLOSING_GREEN_WORDS`). |
| `restoreStackToRing` | `SecurityVaultScene.tsx:3691` | The reverse: About → back into Security, the literal "cards moving out" the user named — un-scatters the cards off the envelope and flies them back into the vault/dock arrangement, vault closes again behind them. |

**Disposition: delete both entirely**, including all associated `setOpenProgress`/`setCardsProgress`
tweens.

**Replacement:** scrolling from Security to About (either direction) is plain native scroll between
two independent, fully-resolved sections. About already shows its envelope with cards in their final
scattered arrangement (see §2g) the instant it's in view — nothing "assembles" it.

### 2g. Within About ("work coming down", "opening card")

| Piece | File | What it does today |
|---|---|---|
| `computeEnvelopeParams`'s 26-entry `scatterSlots` array | `components/blueprint/scenes/AboutScene.tsx:176-218` | Defines the final resting x/y/z/rotation/scale for all 26 cards once they've landed on the envelope — this geometry itself is **not** an animation and can stay as the static final layout. |
| `jumpToAboutState` | `AboutScene.tsx:360` | The "work coming down" assembly: forces `window.scrollTo(0, 0)`, fixes the stage, hides/shows a long list of elements via `gsap.set`, and (not fully shown above, but implied by its role as the ring→about / nav-click entry point) animates all 26+5 cards from hidden into their `scatterSlots` positions on the envelope. Also the thing that currently hardcodes `window.scrollTo(0, 0)` and `lockScrollYRef.current = 0` — i.e. it unconditionally resets scroll position, which is itself a form of hijacking. |
| `flipDocToPage` | `AboutScene.tsx:220` | The "opening card" effect — a 3D page-turn (`rotateY` sweep plus a z-lift/curl flourish) of the philosophy document between page 1 and page 2, currently triggered by a scroll gesture while in the `about` state. |
| `exitAboutToFaq` | `AboutScene.tsx:303` | About → FAQ hand-off: fades `cardsClusterRef`/`aboutContentRef` out and up, then unpins the stage and smooth-scrolls to the FAQ element. |

**Disposition:**
- `jumpToAboutState`'s role as an **animated assembly sequence** is deleted. Its role as "the function
  nav clicks/deep-links use to land on About" is replaced by nothing more than a plain scroll-to-
  section (see §6) — About's envelope and all 26 cards render directly in their final `scatterSlots`
  positions as static JSX/CSS, with no `gsap.set`/hidden-then-revealed intermediate state at all.
- `flipDocToPage`'s role as a **scroll-gesture-triggered** transition is deleted. If the document is
  meant to still support viewing "page 2," that becomes a plain click/tap interaction scoped entirely
  to the About section (e.g. a simple button or card flip on click) — not something that fires off a
  scroll tick and is not gated by any busy flag tied to scroll position. If the user/anti-gravity
  decide page 2 isn't worth keeping as an interaction at all, cutting it to a single static page is
  also acceptable — flagging this as the one open content decision in this doc (see §7).
- `exitAboutToFaq`'s fade-and-fly-up hand-off is deleted. About → FAQ is plain native scroll between
  two sections, same as every other boundary.

### 2h. Explicitly out of scope — do not touch

- `components/blueprint/BlueprintStackingCards.tsx` — has its own self-contained `pin`/`scrub`
  `ScrollTrigger` (lines ~58-70), but it is a standalone testimonials-style stacking-cards component,
  not part of the Hero/Product/Security/About hijacking engine, and the user's complaints were never
  about it. Leave it exactly as-is unless a future, separate request calls it out by name.
- `app/*`, `content/*`, copy/text content anywhere, nav/footer components, `CharacterIllustration.tsx`,
  the visual design of `SafeVault3D.tsx` itself (its closed-door geometry/art), and all non-transition
  layout/styling. This plan is about deleting *scroll-coupled choreography*, not changing what
  anything looks like in its resting state or rewriting copy.

## 3. Per-file disposition summary

| File | Disposition |
|---|---|
| `hero-engine/useSceneEngine.ts` | Delete entirely, or reduce to nothing beyond whatever (if anything) `BlueprintNav.tsx`'s active-section-highlight-on-scroll needs — investigate whether that can become a plain `IntersectionObserver` instead before assuming any part of this file survives. |
| `hero-engine/sceneTransitions.ts` | Delete `pinStage`/`unpinStage`/`lockNativeScroll`/`releaseNativeScroll`/the 6-branch `resetToState` internals. What remains, if anything, is a single "smooth-scroll the viewport to section X" helper for nav clicks — likely collapses to a ~10-line file or gets inlined into `BlueprintNav.tsx`. |
| `scenes/HeroScene.tsx` | Delete `createHeroToProductTimeline` and its iris-portal apparatus. Hero keeps only its own static resting visual/content and (optionally) a simple entrance fade. |
| `scenes/ProductBentoScene.tsx` | Delete `createRestingToBentoTimeline`/`triggerRestingToBento`/`triggerBentoToResting`. Product renders the finished bento grid directly. |
| `scenes/SecurityVaultScene.tsx` | Delete `createProductToRingTimeline`, `consolidateRingToStack`, `restoreStackToRing`, the discrete-gesture `goToSecurityState` stepping mechanism, `exitSecurityToAbout`, and every `setOpenProgress`/`setCardsProgress` call tied to any of those. Keep the 8 sub-states' copy/content and the vault's static closed-pose rendering. This file is ~5,300 lines today largely because of this choreography — expect it to shrink dramatically. |
| `scenes/AboutScene.tsx` | Delete `jumpToAboutState`'s assembly animation, `flipDocToPage`'s scroll-gesture wiring, `exitAboutToFaq`. Keep `computeEnvelopeParams`'s `scatterSlots` geometry as static layout data. |
| `BlueprintHero.tsx` | Delete `dispatchSceneAction` and all `registerScene` calls once nothing dispatches `SceneAction`s anymore. `navigateToSection` (nav-pill click handling) stays, simplified to a plain scroll-into-view. |
| `components/blueprint/SafeVault3D.tsx` | Keep the component and its art/geometry. Stop calling `setOpenProgress`/`setCardsProgress`/`triggerRimStep` from anywhere except (optionally) once on mount to lock in the closed resting pose. |
| `app/globals.css` | Remove the `.scene-transition-scrollbar-hidden` rule once `lockNativeScroll`/`releaseNativeScroll` (its only callers) are deleted. |

## 4. Execution order (for anti-gravity; reduces risk even though this is a "from scratch" pass)

1. Convert each section to plain in-flow layout first, with its DOM rendering the final resting
   state unconditionally (no `gsap.set`-driven hidden/visible toggling tied to scroll state). Do this
   section-by-section (Hero, Product, Security, About) so each is independently checkable.
2. Once a section's resting DOM is confirmed correct on its own (view it directly, e.g. by
   temporarily scrolling the page to it, independent of any transition logic), delete that section's
   hand-off timeline(s) and discrete-gesture stepping.
3. Only after all four sections are plain, static, in-flow content should `useSceneEngine.ts`'s
   listeners/busy-flags and `sceneTransitions.ts`'s pin/lock helpers be deleted — they have no
   remaining callers at that point.
4. Rewire nav-pill clicks (`navigateToSection`) to plain `scrollIntoView`/`window.scrollTo` against
   each section's element, since `resetToState`'s pinned-state-aware branches no longer apply.
5. Full regression pass per §8 below.

## 5. Open content decisions (flagging, not deciding — these are visual/UX calls for anti-gravity, not mechanical ones)

- Whether the About philosophy document keeps a click-triggered "page 2" at all, or becomes a single
  static page (see §2g).
- Whether any section gets the optional lightweight entrance fade from §1, or none do at all. Default
  recommendation: start with **no** entrance animation anywhere, ship that, and only add a fade back
  in per-section if the static cut feels too abrupt on review.
- Whether the vault's rim/dial gets a purely decorative, scroll-independent idle motion (e.g. a slow
  continuous rotation unrelated to which sub-state is in view) or stays completely static. Default
  recommendation: completely static until asked otherwise.

## 6. What nav-pill / deep-link clicks become

Today, clicking a nav pill calls `navigateToSection` → `resetToState`, which has to know how to
unwind whatever pinned/hijacked state the page is currently in before jumping to the target. Once
every section is plain native-scroll content, this collapses to the same thing `resetToNativeScrollSection`
already does for FAQ/Contact today: find the target section's element and
`element.scrollIntoView({ behavior: "smooth" })` (or the existing `smoothScrollTo` GSAP helper, for
consistent easing/duration with the rest of the site). No busy-flag clearing, no timeline killing, no
pin/unpin — there is nothing left to unwind.

## 7. Acceptance checklist for the post-execution review pass

- [ ] Scrolling from top to bottom of the entire page, slowly, with a mouse wheel: every section's
      content is immediately legible the moment it enters the viewport — nothing is blank, mid-flight,
      half-hidden, or waiting on an animation to catch up.
- [ ] Scrolling back up through the whole page: same as above, no direction-dependent broken states.
- [ ] Dragging the scrollbar thumb directly to an arbitrary position (e.g. straight to the About
      section): the destination section renders correctly with zero setup lag or visual glitch.
- [ ] Loading the page with a deep link / hash directly at a lower section (e.g. `/#security`):
      renders correctly on first paint, no flash of an earlier section's state.
- [ ] Every nav-pill click smooth-scrolls to the correct section correctly, from every current
      scroll position (above and below the target).
- [ ] Keyboard scrolling (arrow keys, Page Up/Down, Space) and touch-swipe scrolling on mobile both
      behave like ordinary page scroll — no interception, no snapping back.
- [ ] Resizing the window mid-scroll does not break any section's layout.
- [ ] No busy-flag/transition-animating refs remain anywhere in the codebase (grep for
      `transitionAnimatingRef`, `isSecurityTransitioningRef`, `isRingConsolidatedRef`,
      `isFlippingDocRef`, `lockNativeScroll`, `pinStage` — all should be gone).
- [ ] `prefers-reduced-motion` is respected for whatever entrance treatment (if any) was kept per §5.

## 8. Handoff note

This plan is being handed to anti-gravity for full implementation, per explicit user instruction.
Claude's role for this pass is limited to having written this plan and will resume with reviewing the
actual resulting diff/behavior against the checklist in §7 once anti-gravity has executed it — not
implementing any part of it directly.
