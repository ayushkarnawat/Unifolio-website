You are restoring three in-section animations that got deleted along with the cross-section scroll
choreography in the previous pass. Full reasoning, exact file/line references (including where the
original, pre-removal code still lives), and guardrails are in
`Docs/2026-10-01-restore-in-section-animations-addendum.md` — read it in full before touching any
code. This prompt is just the sequenced checklist.

**Ground rules:**
- The cross-section removal from the previous pass is correct and stays as-is. Do not reintroduce any
  cross-section hand-off (cards into/out of the vault, vault door opening/closing, Hero's iris-portal
  zoom, Security→About consolidation). See addendum §4 for the explicit do-not-restore list.
- Before writing anything new, run `git show 64d2c8d:<path>` (or `git diff -- <path>`) to recover the
  original tween values — and for Security/About, read the still-present `_unused*` dead functions in
  the current working tree directly (addendum §0 has exact file/line pointers) — rather than guessing
  at durations/easings from scratch.
- Each restored animation must be a self-contained, section-scoped `ScrollTrigger` ("play once as my
  own content enters the viewport"), never `preventDefault`/block native scroll, never pin a stage,
  never reach into another section's refs.
- Kill and fully restart the dev server after meaningful edits before trusting what you see (WSL
  `/mnt/d` HMR is unreliable).

---

**Step 1 — Product bento formation.** Recover `createRestingToBentoTimeline` from
`git show 64d2c8d:components/blueprint/scenes/ProductBentoScene.tsx`. Re-trigger it via a `ScrollTrigger`
scoped to the Product section, playing once on entering view. See addendum §1.

**Step 2 — Security rim rotation + per-sub-state reveal.** Reuse
`_unusedGoToSecurityState` (`SecurityVaultScene.tsx:4075`) as the base. Strip all busy-flag/safety-valve
gating. Wire 8 independent `ScrollTrigger`s, one per `securityStateRefs.current[idx]`, each playing
that state's flourish-in tween and calling `triggerRimStep` on enter, running the existing cleanup on
exit. See addendum §2.

**Step 3 — About envelope opening.** Reuse the envelope/flap/document-reveal portion of
`_unusedJumpToAboutState` (`AboutScene.tsx:393`, roughly lines 488-551) — explicitly excluding the
scroll-reset, stage-pin, and card-fly-in portions of that same function (addendum §3 lists exactly
what to leave out). Re-trigger via a single `ScrollTrigger` scoped to the About section, playing once
on entering view.

**Step 4 — Regression pass.** Re-run the full §7 acceptance checklist from
`Docs/2026-10-01-full-scroll-choreography-removal-plan.md` (mouse wheel both directions, scrollbar-
thumb drag, deep link directly into the middle of Security, nav-pill clicks, keyboard/touch, resize
mid-scroll) — pay particular attention to deep-linking straight into a mid-list Security sub-state or
directly into About: confirm the entrance animation either has already played or doesn't play broken/
half-finished on first paint.

**Step 5 — Flag, don't guess.** The addendum's §5 notes one open question (whether "the about us page
animation" refers to the About *section* already covered in Step 3, or the separate `/about` route
page). Implement Steps 1-3 regardless; surface that question back to the user rather than guessing at
`/about`'s own page.

When done, summarize what was restored per step, confirm the §4 do-not-restore list is still
respected (grep for `createProductToRingTimeline`, `consolidateRingToStack`, `restoreStackToRing`,
`createHeroToProductTimeline` — none should be reconnected to any live call site), and report the
regression-pass results so the user and Claude can review together.
