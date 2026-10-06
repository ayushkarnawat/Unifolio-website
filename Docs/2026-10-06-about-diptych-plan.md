# About Section — Diptych Refinement Plan

Scope: same `id="about"` in-page section as
`Docs/2026-10-06-about-section-redesign-plan.md` (the envelope-removal /
editorial-spread redesign, committed in `b130c67`). This plan is a follow-up
refinement to that work, not a restart — everything settled in the original
plan (cream background, ink-on-cream type, no dark backdrop, existing copy
verbatim, green accent only, no scroll-pinning) still holds. This is a
planning document only; Claude does not implement the visual work below —
anti-gravity does, per `2026-10-06-about-diptych-anti-gravity-execution-prompt.md`.

## Current state (verified live, after `b130c67`)

Beat 1 (the problem) and Beat 2 (the resolution) are two large typographic
blocks stacked vertically inside one `flex flex-col` column
(`AboutEnvelopeSlot` in `components/blueprint/scenes/AboutScene.tsx`), each
preceded by generous vertical gap (`gap-28 sm:gap-36 lg:gap-44` between them).
Beat 2 does correctly right-align via `lg:ml-auto` against the `max-w-6xl`
content container (confirmed via screenshot — not a layout bug), and Beat 1
left-aligns via `lg:mr-auto` — so there is real asymmetry already. The actual
issue raised is structural, not alignment: the two beats are sequential. On
a normal desktop viewport you see Beat 1 alone, have to scroll, then see
Beat 2 alone. The "editorial spread" concept (two facing pages of a
magazine, read together) isn't actually delivered — it reads as two
stacked slides instead.

The 26 background collage fragments (`ABOUT_COLLAGE_FRAGMENTS`) are placed by
`xPct`/`yPct` across one tall column, in three named bands: a transition
zone near the top (y 2–20%, bridging from Security), a "Beat 1 zone" (y
22–50%), a mid gap zone (y 52–66%), and a "Beat 2 zone" (y 68–96%). This
banding assumes the current tall, sequential layout and will need to be
recalibrated against whatever shorter, side-by-side geometry replaces it.

There is also an existing diagonal green swoosh/line asset used once, purely
decoratively, bridging About's end into the FAQ heading — not currently tied
to the About copy's own meaning.

## Why this plan exists (discussion trail)

Brought to the user after `b130c67` was already live: the two-beat sequence
is "almost there" but scrolling down to reveal Beat 2 as a separate screen
undercuts the "editorial spread" idea. Three directions were brainstormed:

1. **True diptych, single viewport** — stop stacking vertically; lay Problem
   and Resolution out as two facing columns, both legible together without
   scrolling between them.
2. **Compress into one dense screen (kicker + headline)** — shrink Problem
   to a small deck line above a dominant Resolution headline.
3. **Visual metaphor tied to the copy** — fragments scattered/messy near
   Problem, tidying up/aligning near Resolution, with the existing diagonal
   swoosh reused as the literal "closing the gap" thread between them.

User's call, confirmed: **#1 for the structural fix, #3 for the creative
lift** — a true side-by-side diptych makes #2 unnecessary (the one-viewport
problem is already solved by #1), so #2 is dropped.

## Finalized direction

**1. Side-by-side diptych at desktop widths.** Beat 1 and Beat 2 become two
columns in one row, not two blocks in one column — read together like
facing pages, no scroll required between them. Problem stays the smaller/
quieter left page; Resolution stays the bigger/louder right page (keeping
the existing "build toward the why" weighting from the original plan). The
brand eyebrow bar (ring mark + "About Us" + "01—02") stays full-width above
both columns, acting as the shared masthead/spine the two pages sit under.

**2. Pick the breakpoint by what actually fits, not by habit.** The two
headlines are large (currently up to `70–76px`); side-by-side at a narrow
desktop width will wrap badly or force a type-scale that's too timid to
carry the "confident" quality the original plan called for. Use whichever
breakpoint (likely `xl:` 1280px, confirm by testing — do not assume `lg:`
1024px works) actually gives each column enough width to carry a strong
headline without excessive wrapping. Below that breakpoint, fall back to
today's stacked sequence (already acceptable — this plan does not require
the diptych to exist on tablet/mobile).

**3. Retune scale/spacing so the full diptych fits a typical desktop
viewport without needing to scroll from Problem to Resolution.** The current
`gap-28/36/44` vertical rhythm was sized for a tall sequential layout and
mostly goes away once the beats sit side by side (replaced by a horizontal
column gap instead). Headline sizes may need modest reduction from current
values — a craft call for execution, not a fixed spec — but should still
read as confidently oversized type, not shrink to something timid. Target
fit: both beats' headline + supporting copy + closing line, fully visible
together, at common desktop viewport heights (roughly 800–1080px tall,
1280–1920px wide) without scrolling within the section.

**4. Collage fragments become part of the "closing the gap" metaphor, not
just texture.** Recalibrate `ABOUT_COLLAGE_FRAGMENTS`' zones to the new
side-by-side geometry (left cluster biased toward the Problem column, right
cluster biased toward the Resolution column, transition-zone fragments from
Security still ramping in above/behind both). Then differentiate the two
clusters visually:
   - **Problem-side cluster:** keep (or slightly increase) the current
     scattered, varied-rotation, desaturated look — reads as fragmented,
     many disconnected things.
   - **Resolution-side cluster:** rotation flattens toward 0°, fragments
     read tidier/more aligned, and gain a touch more contrast/opacity (or a
     subtle green-tinted border) — reads as resolved, brought under one
     picture. This should read as a visual echo of "Unifolio exists to close
     that gap," not a separate decorative choice — the fragments themselves
     visibly go from scattered to orderly left-to-right.

**5. Reuse the existing diagonal green swoosh as the literal connective
thread.** Instead of (or in addition to) its current one-time use before
FAQ, bring the same motif in behind/between the two columns as the visual
line connecting Problem to Resolution — reinforcing "closing the gap" as an
actual line being drawn, not just a metaphor in the copy. Reveal it via a
simple scroll-into-view draw-in (e.g. a stroke-dashoffset or scaleX reveal
timed off the same trigger as the beat fade-ins) — **not** scroll-scrubbed
or pinned; keep it a one-shot reveal like everything else in this section
(scroll-hijacking was deliberately removed earlier in this project — see
`project_task_6_scroll_hijacking_removal` memory — nothing in this plan
should reintroduce it).

## Explicitly out of scope / unchanged

- Background color, dark-mode treatment, new accent colors — all settled by
  the original plan, unchanged here.
- Copy — unchanged, verbatim, same as the original plan.
- FAQ, Contact, the standalone `/about` route — untouched.
- Any scroll-pinning, scroll-scrubbing, or scroll-hijacking mechanism.
- The eyebrow/brand-signature content itself (ring mark, "About Us" label) —
  stays, just now sits above the two-column row instead of above a single
  stacked column.
