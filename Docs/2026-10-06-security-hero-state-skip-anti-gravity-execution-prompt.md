## Update (2026-10-06, third pass) — reframing: this is three related problems, not one

User feedback after the second pass (quoting directly): the hero state still
reads as "a flash" before "Read-only, always" appears, reviewers who were
shown the site said the whole sequence "feels very back to back" with no
breathing room between states, and — a new, separate requirement — **you
should not be able to keep scrolling once the last state is fully shown
while the vault just sits there with nothing happening; the vault and the
last text should scroll away together, right at the end of the section, with
no dead scroll zone after it.**

The user's own read of the skip bug also disagrees with the second pass's
Playwright trace (they perceive state 0 itself skipping straight to "Read-only,
always", not state 1 being swallowed after state 0 shows). Don't trust either
account blind — **before changing anything, add temporary `console.log`
instrumentation inside `setActive`** (log `prevIdx`, `idx`, `direction`,
`window.scrollY`, and the vault's live `getBoundingClientRect().top`) and
reconcile against a real manual mouse-wheel/trackpad scroll in the browser,
not just a synthetic `scrollTo` sweep — momentum scrolling moves in larger,
uneven jumps than a frame-by-frame script, and the "flash" complaint suggests
a state may be becoming briefly visible mid-crossfade and getting overwritten
before the fade-in finishes, which a discrete index trace alone won't show.
Remove the instrumentation once everything below is verified.

**These three complaints share one root cause, and it's architectural, not a
one-line bug:** today every state's "entry offset" relative to the vault
(where it visually lands when it first becomes active) and how long it stays
active are the *same lever* — the physical gap between consecutive state
blocks in the flex-column stack (`lg:gap-8` in `SecurityStageSlot`,
~line 4938). Reducing that gap (done in `5b2aa46`) tightened alignment but
also compressed per-state scroll distance, making transitions feel rushed.
Increasing it back for "breathing room" directly reintroduces the alignment
bias this session already spent a long cycle fixing — same math, opposite
complaint. And the end-of-section dead zone is `lg:pb-[28rem]` (448px) on
that same stack, added only to keep the CSS-sticky vault column (`lg:sticky
lg:top-36` in `BlueprintHero.tsx` ~line 1490) from releasing before the last
state's dwell finished — sticky's natural un-stick point is purely "when the
flex row runs out of height," so that padding directly *is* the dead zone the
user is now objecting to.

**Recommended direction: decouple "which state is active" and "how long it
stays active" from the stack's literal DOM layout, instead of continuing to
tune gap/padding numbers against each other.**

1. **Pacing — add a minimum-dwell gate, not more layout gap.** In
   `computeActiveIndex`/`setActive`'s closure, track the scroll position (or
   timestamp) of the last index change, and refuse to switch to a newly
   "nearest" index until a minimum scroll distance (or time) has passed since
   the last switch — e.g. don't let `activeIdx` change again until `|scrollY -
   lastSwitchScrollY| > MIN_DWELL_PX` (start around 150-250px, tune by feel).
   This creates real breathing room between transitions without touching
   `lg:gap-8` or any DOM position, so it does not reintroduce the alignment
   bias by itself. **However:** because this delays *when* a state is
   revealed relative to its own physical position sliding past the vault, it
   will shift that state's entry offset by some amount once added — re-run
   the same offset verification done for `5b2aa46` (settled-opacity /
   entry-offset Playwright sweep) after adding the gate, rather than assuming
   it's still centered. Don't guess the interaction blind; measure it.

2. **End-of-section — make the vault's un-stick point track the last
   state's actual dwell end, not a fixed padding guess.** `lg:pb-[28rem]` is
   very likely overshot (it was tuned empirically during the alignment fix,
   not derived from a real measurement of the minimum needed). Two options,
   in order of preference:
   - **Lower-risk:** reduce the padding value and re-test empirically
     (scroll to the very end, confirm the vault is still visible through the
     entire time the last state is shown, then confirm it starts moving away
     within a small margin after) — tune down until the dead zone is gone,
     nudge back up only as far as needed to keep the vault visible for the
     full last-state dwell. This is a tuning pass, not a redesign — budget a
     real Playwright measurement loop for it rather than eyeballing one
     value.
   - **More robust (bigger change, only if the padding-tuning pass doesn't
     get clean results):** replace the CSS-sticky + padding-bottom mechanism
     with an explicit GSAP `ScrollTrigger` `pin: true` on the vault column,
     with `start`/`end` driven by the exact same `firstEl`/`lastEl` span
     already used for the state-selection trigger (~line 4785) — so pin
     release is mathematically tied to the same endpoint as the last state's
     own dwell window, with zero slack by construction, instead of two
     independently-tuned mechanisms (flex height vs. trigger range) that
     have to be kept in sync by hand. Note for context: this is a
     *self-contained, in-section* pin, not a reintroduction of the
     cross-section scroll-hijacking that was deliberately removed elsewhere
     in this project — those are different things; don't conflate them.

3. **The remaining state-skip bug** — once instrumentation (above) confirms
   exactly which index is actually being swallowed and under what real
   scroll gesture, apply whichever of the two previous passes' diagnoses
   actually matches the live data: either the "second pass" rect-stability
   detection below (if it's still a vault-rect-timing issue), or something
   new if the live trace shows a different mechanism (e.g. a crossfade
   overlap from the "flash" symptom). Don't assume the second pass's fix is
   still the right one without checking it against this pass's
   instrumentation first — the user's own perception disagreed with the
   previous trace, which is itself a signal something about the previous
   measurement didn't capture the real-scroll behavior.

**Test (all three, together, before calling this done):** a real manual
mouse-wheel scroll (not just a scripted one) through the entire Security
section, forward and backward: all 8 states appear in order with no skips
and no double-visible flashes; each state is comfortably readable (not
instant); the sequence ends with the vault and the final state scrolling
away together, no extra blank scroll distance after the last text is fully
shown. Then re-confirm the existing alignment fix (states roughly centered
against the vault bolt) is still intact — this is the one property all three
fixes above must not quietly break.

---

## Update (2026-10-06, second pass) — the `a749ecf` fix is a real improvement but incomplete

Verified against the committed fix (`a749ecf`, production build, Playwright,
3px-step scroll sweep at 1440×900): **state 0 (hero) now activates
correctly**, but **state 1 ("Read-only, always") is still being skipped** —
the active-state trace jumps directly from idx=0 to idx=2, with idx=1 never
appearing, at any sampling granularity down to 3px steps (so this isn't a
sampling artifact, it's a real gap).

**Root cause of the remaining skip:** the committed guard —
```ts
const vaultIsOnScreen = vaultRect && vaultRect.top > -50 && vaultRect.top < window.innerHeight;
```
treats the vault as "on screen" (and therefore trusts its live rect for
`focusY`) the moment *any sliver* of it scrolls within the viewport bounds —
but at that point the vault is still sliding into place in normal document
flow, nowhere near its final locked sticky position. Measured directly: at
the exact scroll offset where the skip happens, `vaultRect.top = 866` against
a 900px-tall viewport — technically "on screen" by the guard's definition,
but far from the vault's actual steady resting top once truly stuck (which
settles much higher, e.g. the `vaultCenter≈439` constant observed in earlier
verification once states 2+ are showing). So `focusY` switches to the
vault-anchored formula too early, during the transitional slide-in, and
that's what still swallows state 1's narrow activation window.

**Why a tighter fixed threshold (e.g. `< window.innerHeight * 0.5`) is the
wrong fix:** it would work at this one viewport size but is fragile — the
right threshold depends on the vault's actual sticky resting position, which
varies with viewport height/the dock layout, not a fixed fraction.

**Recommended fix: detect "stuck" by rect stability, not by a position
threshold.** A sticky element's `getBoundingClientRect().top` stops changing
once it's pinned, no matter how far you keep scrolling past that point —
while an element still in normal flow has a `rect.top` that changes on every
scroll tick. Track the previous frame's vault top in a ref/closure variable
local to the same effect that already holds `activeIdx`, and only trust the
live vault rect once it's been observed unchanged across consecutive calls:

```ts
// declare alongside `let activeIdx = -1;` in the same closure scope
let prevVaultTop: number | null = null;
let vaultStuck = false;

const computeActiveIndex = () => {
  const vaultRect = safeContainerRef.current?.getBoundingClientRect();
  if (vaultRect) {
    if (prevVaultTop !== null && Math.abs(vaultRect.top - prevVaultTop) < 0.5) {
      vaultStuck = true;
    }
    prevVaultTop = vaultRect.top;
  }
  const focusY = vaultStuck && vaultRect
    ? vaultRect.top + vaultRect.height / 2
    : window.innerHeight * 0.5;
  // ...unchanged below
```

(`vaultStuck` is one-way — once the vault is confirmed stuck it stays
trusted for the rest of the sequence, which matches observed behavior:
once pinned it doesn't un-stick until the whole section's scroll range
ends.) This generalizes across viewport sizes/dock offsets since it doesn't
hardcode any pixel threshold — it directly detects the sticky lock instead
of guessing where it happens.

**Test:** same as before — scroll into Security from well above the
section, slowly, through all 8 states forward and backward, at a couple of
different viewport sizes if easy to check (the previous threshold-based fix
could easily be viewport-size-dependent). All 8 states must appear in order,
including states 0 and 1. Re-confirm the alignment fix (states 2-7 reading
roughly centered against the vault) is still intact.

---

## Original write-up (2026-10-06, first pass — state 0 is now fixed by this; kept for context)

You are fixing a regression in the Security section's scroll-driven text
reveal: the first two states (the hero intro, "We take your data as
seriously as you take your money," and the first principle state, "Read-only,
always") never appear — scrolling into Security now lands directly on the
third state ("Stored in...").

**Root cause (confirmed via Playwright, logging `idx` + the vault's live
`getBoundingClientRect()` at 15px scroll steps):** `computeActiveIndex` in
`components/blueprint/scenes/SecurityVaultScene.tsx` (~line 4695) was
recently changed to anchor its "nearest state" focus line on the vault's own
live rendered center (`safeContainerRef.current.getBoundingClientRect()`)
instead of a fixed `window.innerHeight * 0.5`, to fix a separate alignment
bug (entry text sitting off-center from the vault bolt — that part is
correct and should stay). The problem: **before the vault's sticky parent
actually locks it into its pinned position, the vault is still in normal
document flow**, so its rect can be far down/off-screen (measured
`vaultCenter` values of 1160-1415px while states 0-1 should be active).
"Nearest state to that point" then picks a much later state, skipping 0 and
1 entirely the instant the master `ScrollTrigger` first fires.

This is a standalone, scoped bug fix — not part of the About section
redesign work (see the separate `2026-10-06-about-section-redesign-*`
files, which are a separate, finalized, parallel track).
