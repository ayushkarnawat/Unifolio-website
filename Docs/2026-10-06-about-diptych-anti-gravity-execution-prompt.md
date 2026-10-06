You are refining the in-page "About" section of the Unifolio marketing
site's single-scroll blueprint experience. This is a follow-up to the
envelope-removal/editorial-spread redesign already committed in `b130c67` —
that work is done and should not be redone. Full reasoning and the
discussion trail behind this round live in
`Docs/2026-10-06-about-diptych-plan.md` — read it first. The original
redesign plan/prompt (`Docs/2026-10-06-about-section-redesign-plan.md` and
its execution-prompt sibling) are still useful background on what's already
settled (cream background, ink-on-cream type, existing copy verbatim, green
accent only, no scroll-pinning).

**Scope:** `id="about"` in `components/blueprint/BlueprintHero.tsx`
(~line 1577), rendered via `AboutBackgroundSlot` and `AboutEnvelopeSlot` in
`components/blueprint/scenes/AboutScene.tsx`. Not the standalone `/about`
route — do not touch `content/about.ts` or `FounderStory.tsx`. Not FAQ or
Contact — leave untouched.

**The problem being fixed:** Beat 1 (the problem) and Beat 2 (the
resolution) currently stack vertically with a large gap between them
(`AboutEnvelopeSlot`'s `gap-28 sm:gap-36 lg:gap-44` column), so a user sees
Beat 1, has to scroll, then sees Beat 2 — two sequential slides, not the
"facing pages of a spread" feeling the copy and asymmetry are going for.

**Direction, settled with the user (do not deviate without checking back):**
- Turn the two beats into a genuine side-by-side diptych at desktop widths —
  both fully visible and readable together, no scroll required between
  them — rather than stacked blocks. Problem is the smaller/quieter left
  page; Resolution is the bigger/louder right page (keep that weighting —
  it was intentional in the original redesign).
- Pick whichever breakpoint actually gives each column enough width to
  carry a large headline without ugly wrapping — test it, don't assume
  `lg:` (1024px) is wide enough; `xl:` (1280px) or higher may be needed.
  Below that breakpoint, keep the current stacked sequence (acceptable,
  not in scope to rebuild for tablet/mobile).
- Keep existing copy verbatim. Keep the green accent color only (no new
  accent colors). Keep the eyebrow/brand-signature bar (ring mark, "About
  Us", "01—02") full-width above the two columns.
- No scroll-pinning, scroll-scrubbing, or scroll-hijacking anywhere in this
  work — any reveals must be simple one-shot scroll-into-view fades/draws,
  matching how the rest of this section already behaves.

**Task 1 — Restructure the two beats into a side-by-side row at desktop**
File: `components/blueprint/scenes/AboutScene.tsx`, `AboutEnvelopeSlot`.
Change the `beat1Ref`/`beat2Ref` wrapper from a stacked `flex flex-col` with
large vertical gap into a two-column layout (e.g. `lg:flex-row` or a
`grid-cols-2`, confirm which breakpoint actually works by testing) at the
chosen desktop breakpoint, with the eyebrow bar remaining full-width above
both. Below that breakpoint, keep the current stacked behavior. Verify no
column overlap and no premature text wrapping at the breakpoint's lower
edge.

**Task 2 — Retune type scale and spacing to fit one viewport**
Same component. The current `gap-28/36/44` vertical rhythm was sized for a
tall sequential layout and is largely unnecessary once the beats sit side by
side (replace with a horizontal column gap instead, e.g. `lg:gap-12
xl:gap-16`). Adjust headline sizes (currently up to `lg:text-[54px]` /
`xl:text-[76px]`) and internal margins (`mt-8/10/12`, closing-statement
`mt-12/16/20`) as needed so the full composition — eyebrow bar + both
columns' headline + supporting copy + closing line — fits within a typical
desktop viewport (roughly 800–1080px tall, 1280–1920px wide) without needing
to scroll within the section. This is a craft call — keep the type
confidently large, don't shrink it into timidity to force the fit; iterate
on actual rendered screenshots at each target size rather than guessing
numbers.

**Task 3 — Add a visual divider/spine between the two columns**
Same component. Add something that reinforces "two facing pages" — a thin
vertical rule between columns is the minimum; see Task 5 for a stronger
option (the reused swoosh motif) that can serve this purpose instead of or
in addition to a plain rule.

**Task 4 — Recalibrate collage fragment zones to the new geometry**
File: `components/blueprint/scenes/AboutScene.tsx`, `ABOUT_COLLAGE_FRAGMENTS`
(currently ~lines 55-89) and `AboutBackgroundSlot` that renders them. The
`xPct`/`yPct` values are currently banded for a tall single-column layout
(transition zone, Beat 1 zone, mid gap, Beat 2 zone from y 2% to 96%).
Recalibrate so fragments cluster left (near the Problem column) and right
(near the Resolution column) to match the new shorter, wider diptych
geometry, with the Security-transition fragments still ramping in from
above. Confirm against the actual rendered section height after Tasks 1–2
land (it will be shorter than today).

**Task 5 — "Scattered → tidy" visual metaphor + reused swoosh thread**
Same files. Differentiate the two fragment clusters to visually echo the
copy ("Unifolio exists to close that gap"):
- Problem-side cluster: keep/slightly increase the current scattered,
  varied-rotation, desaturated look.
- Resolution-side cluster: flatten rotation toward 0°, tighten the
  fragments' positions so they read more aligned/orderly, and raise opacity/
  contrast slightly (a subtle green-tinted border is a reasonable option,
  not a requirement) — reads as "brought under one picture."
Then bring the existing diagonal green swoosh/line asset (currently used
once, before FAQ) in behind/between the two columns as the literal thread
connecting Problem to Resolution — reuse the asset/motif rather than
building a new one. Reveal it with a simple scroll-into-view draw-in
(stroke-dashoffset or scaleX, one-shot, same trigger style as the existing
beat fade-ins) — not scroll-scrubbed or pinned.

**Task 6 — Verify the stacked (non-diptych) fallback still reads well**
After Tasks 1–2's spacing/scale changes, re-check the stacked sequence below
the diptych breakpoint (tablet/mobile) still reads cleanly — no regressions
from the spacing/scale changes made for the desktop diptych.

---

**Test across 1920×1080, 1440×900, 1280×800 (or whatever breakpoint you
land on), 1024×768, and 390×844:**
- At diptych widths: both beats fully visible and readable together without
  scrolling within the section; no column overlap, no ugly mid-word
  wrapping, divider/thread reads intentionally, fragment clusters visibly
  differ (scattered left vs. tidy right).
- Below the diptych breakpoint: clean stacked sequence, no regressions.
- No scroll-pinning/scrubbing anywhere — reveals are simple one-shot
  scroll-into-view fades/draws only.

When done, summarize what changed per task so the user can do a manual
pass. Do not proceed to redesigning anything outside this section (FAQ,
Contact, the standalone `/about` route) without the user explicitly asking.
