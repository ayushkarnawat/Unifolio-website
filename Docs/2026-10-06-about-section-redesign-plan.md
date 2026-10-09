# About Section Redesign — Plan (v2, finalized through discussion)

Scope: the in-page "About" section of the single-scroll blueprint experience
(`id="about"` in `components/blueprint/BlueprintHero.tsx`, rendered via
`AboutBackgroundSlot` + `AboutEnvelopeSlot` in
`components/blueprint/scenes/AboutScene.tsx`). This is **not** the standalone
`/about` route (`content/about.ts`, `components/sections/FounderStory.tsx`) —
that page is untouched by this plan.

This supersedes the original `2026-10-06-about-section-redesign-plan.md`
draft, which was written before the direction was actually discussed with the
user. The direction below was settled through back-and-forth, not decided
unilaterally — see the open questions and answers at the end for the
reasoning trail. This is a planning document only. Claude does not implement
any of the visual redesign below — anti-gravity does. The companion file
`2026-10-06-about-section-redesign-anti-gravity-execution-prompt.md` is the
sequenced handoff brief.

## Current state (verified by reading the code)

The section sits between Security and FAQ, all three sharing the identical
`bg-[#FAF8F5]` cream background in plain in-flow stacking (no pinning —
that machinery was already removed; see
`project_task_6_scroll_hijacking_removal` memory).

Today, `AboutEnvelopeSlot` is a literal 3D-illustrated dark emerald envelope
(SVG polygon flaps, gradients, drop-shadow filters, a circular seal/clasp
glyph) that plays a one-time GSAP entrance on scroll: the seal dissolves, the
flap hinges open, a cream "document" rises out holding serif copy, with a
real 3D `rotateY` click-to-flip between two pages. `AboutBackgroundSlot` is a
cinematic ambient layer (sage-green radial washes, god-ray light shafts, a
light cone, a backlight halo, caustic ribbons, dust motes, film grain) behind
it, plus 26 small translucent UI-mockup-style scattered cards (reusing
`PRODUCT_CARDS` data).

Copy, verbatim, currently on the two beats (unchanged by this plan):
- Beat 1 (the problem): "In most families, someone ends up in charge of the
  money. Not because they trained for it. **Because someone has to.**" /
  "Their financial data lives across a dozen apps and statements. There's a
  gap between seeing it all and actually understanding it."
- Beat 2 (the resolution): "Unifolio exists to close that gap." / "The same
  clarity a wealth manager gives their wealthiest clients, now available to
  anyone. Whether they hold ₹5 lakh or ₹5 crore. Whether they've studied
  finance or never touched a balance sheet." / "Seeing your money isn't the
  same as **understanding it.**"

## Finalized direction

The references (Hatton Labs, 08sircus) share one thing worth borrowing: the
copy itself is the graphic — no illustrated container, just scale, mixed
type-weight, and asymmetric placement carrying the confidence. Everything
else about them (dark backdrop, mockup framing) is specific to their brand,
not to this site, and was explicitly discussed and dropped.

**1. Drop the envelope and the reveal entirely.** No opening animation, no
paper panel, no page-flip interaction. About becomes a tall asymmetric
editorial spread, present on normal scroll-fade-in like any other section —
not a special one-time entrance sequence.

**2. Stay on the same cream, `#FAF8F5`, as every other section.** Explicitly
decided against a dark backdrop — the site's identity is light throughout,
and the confidence the references have should come from scale/weight/
placement, not from a color break. Zero new background work needed.

**3. Type is ink-on-cream, not light-on-dark.** Huge, near-black, asymmetric
(off-center, not centered) headline type carries the "confident" quality —
mixed weights within a line (e.g. a heavy serif cut against a thin italic for
an emphasis phrase), the way 08sircus mixes case/weight within one headline.
The existing green accent color stays as the one color pop on emphasis
phrases (keep the current palette — no new accent colors).

**4. Two beats as one continuous asymmetric spread, not a flip.** Beat 1
(the problem) and Beat 2 (the resolution) are two distinct typographic
blocks stacked in one tall composition. Recommended (not mandatory): let
Beat 2 hit bigger/louder than Beat 1 — a build toward the "why," not two
equal chapters — since the emotional weight of the section sits in the
resolution. Exact scale balance is a craft call for execution, not a fixed
spec.

**5. Scattered cards become a quiet monochrome collage.** Restyle the 26
existing scattered-card elements away from translucent glassy UI-mockup
rectangles toward small flat monochrome fragments/corner marks — desaturated,
low-contrast, more like clippings in a collage than floating app screenshots.
Still reads as "many small things," just quieter and fitting the editorial
mood.

**6. `AboutBackgroundSlot`'s cinematic effects (god rays, dust motes, grain,
caustics) are retired**, not re-themed — they were built to support the
envelope-reveal moment and a cinematic dark mood neither of which this
direction uses. The monochrome scattered-card collage is the section's only
background texture now. (Flag to anti-gravity as a confirmation point in
case any of these effects are worth keeping subtly — but the default is they
go.)

## Security → About transition (finalized)

Since both sections share the same cream background, there is no color seam
to solve — the actual discontinuity is a *scale and mode* jump (Security
ends on a small, centered vault glyph; About begins as huge asymmetric type).

**Decided: hybrid approach, kept tight (no inserted whitespace gap).** The
monochrome scattered-card fragments (item 5 above) begin appearing sparsely
near the bottom of the Security section — faint, low-density, barely
noticeable behind/around the vault — and increase in density through a
*compact* transition zone into About, where they settle into their full
collage density behind the big type. This reuses the "many small things
becoming one" continuity device as the connective tissue across the seam,
without adding generous empty vertical space between the two sections (that
was explicitly rejected in favor of keeping the sections close together) —
the fragments and the scale jump itself carry the transition, not spacing.

## Explicitly out of scope / do not touch

- FAQ and Contact — stay on cream, untouched by this plan.
- The standalone `/about` route and its copy — separate page.
- Actual copy changes — not requested; keep existing paragraphs unless
  anti-gravity/the user decide new copy serves the layout better, which is a
  separate explicit decision to flag back to the user.
- The site's broader light-first visual identity — no dark sections
  introduced anywhere by this plan.

## Discussion trail (for reference — how this direction was settled)

This replaces a first-pass draft that proposed a dark backdrop and a
restyled-but-kept envelope reveal, written before discussing options with the
user. Through back-and-forth, the user:
- Rejected a dark backdrop outright — site should stay light throughout.
- Chose "drop the reveal, go full editorial spread" over "reskin the
  envelope" or "reduce the reveal to one small gesture."
- Confirmed ink-on-cream type leaning on scale/weight/asymmetry (not color
  contrast) as the right translation of the references' confidence, keeping
  the existing green accent palette.
- Left the Beat 1 vs Beat 2 scale balance to feel/execution rather than
  specifying it rigidly.
- Confirmed the monochrome-collage direction for scattered cards.
- For the Security→About seam, explicitly wanted a hybrid of "bridge via the
  scattered-card motif" and "don't over-engineer it" — landing on: keep the
  fragment-bridge idea, but reject the generous-whitespace-gap part of the
  simpler option, keeping the sections close together.
