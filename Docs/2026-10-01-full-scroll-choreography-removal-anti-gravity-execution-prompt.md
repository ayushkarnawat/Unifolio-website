You are implementing a full removal of cross-section scroll choreography on the Unifolio marketing
site. Full diagnosis, exact code excerpts/line references, and reasoning live in
`Docs/2026-10-01-full-scroll-choreography-removal-plan.md` — read it in full before touching any
code. This prompt is just the sequenced checklist.

**Ground rules — read before starting:**
- This is a deletion-and-simplification pass, not a re-design. Do not invent new transition effects
  to replace the ones being removed — the target is plain native scroll with each section showing
  its finished resting state, per §1 of the plan doc. When in doubt, do less, not more.
- Do not change any section's copy/content, nor the visual art/geometry of `SafeVault3D.tsx`, nor
  anything in `BlueprintStackingCards.tsx` (explicitly out of scope — see plan §2h).
- Work through the plan's §4 execution order: make each section's DOM render its final resting state
  unconditionally first, verify it looks right on its own, *then* delete that section's hand-off/
  stepping logic, section by section (Hero, Product, Security, About) — don't big-bang delete
  everything in the engine first.
- Kill and fully restart the dev server after every meaningful edit before trusting what you see —
  this repo is on WSL `/mnt/d`, where file-watching/HMR does not reliably propagate.
- Resolve the two open content decisions in the plan's §5 using your own best visual/UX judgment
  (document whichever way you decide, briefly, in your summary) — these are legitimate design calls,
  not something to block on.
- When done, go through the full acceptance checklist in the plan's §7 yourself before handing back
  for review, and report which items pass.

---

**Step 1 — Hero section.** Make Hero a plain static in-flow section (no iris-portal zoom, no scroll-
scrubbed timeline). Delete `createHeroToProductTimeline`/`triggerProductToHero`/
`ensureHeroToProductTimeline` in `HeroScene.tsx` once Hero's own static resting visual is confirmed
correct.

**Step 2 — Product section.** Render the full bento grid directly, no "resting cards" intermediate
layout. Delete `createRestingToBentoTimeline`/`triggerRestingToBento`/`triggerBentoToResting` in
`ProductBentoScene.tsx`.

**Step 3 — Security section.** Render the vault in its static closed pose and all 8 sub-state content
blocks as plain stacked sub-sections in fixed order (see plan §2e for exactly which 8 and what to do
with their typing/masking flourishes). Delete `createProductToRingTimeline`, `goToSecurityState`'s
discrete-stepping mechanism, `triggerProductToRing`/`triggerRingToProduct`/
`ensureProductToRingTimeline`, `exitSecurityToAbout`, and every `setOpenProgress`/`setCardsProgress`
call tied to any of those, in `SecurityVaultScene.tsx`.

**Step 4 — About section.** Render the envelope with all 26+5 cards already in their final
`scatterSlots` positions (static JSX/CSS, no hidden→revealed `gsap.set` sequence). Decide and
implement the philosophy-document "page 2" interaction per plan §2g/§5. Delete `jumpToAboutState`'s
assembly animation, `flipDocToPage`'s scroll-gesture wiring, `consolidateRingToStack`/
`restoreStackToRing` in `SecurityVaultScene.tsx`, and `exitAboutToFaq` in `AboutScene.tsx`.

**Step 5 — Engine teardown.** Once no section dispatches a `SceneAction` anymore, delete
`dispatchSceneAction` and all `registerScene` calls in `BlueprintHero.tsx`; delete
`useSceneEngine.ts`'s hijack listeners/busy-flag refs/safety valve/`registerScene` API (investigate
first whether `BlueprintNav.tsx`'s active-section highlighting needs anything from this file — if so,
replace that one need with a plain `IntersectionObserver`, don't keep the rest of the engine around
for it); delete `pinStage`/`unpinStage`/`lockNativeScroll`/`releaseNativeScroll`/the 6-branch
`resetToState` body in `sceneTransitions.ts`, replacing nav-pill click handling with a plain
scroll-to-section per plan §6. Remove the now-dead `.scene-transition-scrollbar-hidden` CSS rule in
`app/globals.css`.

**Step 6 — Full regression pass.** Go through every item in the plan's §7 checklist manually
(mouse wheel both directions, scrollbar-thumb drag, deep link, nav-pill clicks, keyboard, touch,
resize-mid-scroll). Grep for the ref/function names listed at the bottom of §7 to confirm nothing
was left behind.

When done, summarize what was deleted/kept per step (same format as prior rounds), call out the two
content decisions you made from §5, and report the §7 checklist pass/fail per item so the user and
Claude can do a joint review pass.
