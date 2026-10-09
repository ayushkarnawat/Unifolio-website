You are redesigning the in-page "About" section of the Unifolio marketing
site's single-scroll blueprint experience. Full diagnosis, reasoning, and the
discussion trail behind every decision below live in
`Docs/2026-10-06-about-section-redesign-plan.md` (v2, finalized through
discussion with the user, superseding an earlier premature draft of the same
filename) — read it first.

**Scope:** `id="about"` in `components/blueprint/BlueprintHero.tsx`
(~line 1537), rendered via `AboutBackgroundSlot` and `AboutEnvelopeSlot` in
`components/blueprint/scenes/AboutScene.tsx`. This is **not** the standalone
`/about` route — do not touch `content/about.ts` or `FounderStory.tsx`.

**Direction, settled with the user (do not deviate without checking back):**
- No dark backdrop. Stay on the same cream `#FAF8F5` as every other section.
- No envelope illustration and no one-time reveal entrance. No page-flip
  interaction. This is a normal-scroll editorial spread, not a special
  triggered animation.
- Confidence comes from scale, mixed type-weight, and asymmetric (not
  centered) placement — ink-on-cream, not light-on-dark.
- Keep the existing green accent color on emphasis phrases; no new accent
  colors.
- Keep the existing two-beat copy verbatim (both paragraphs, listed in the
  plan doc) unless you have a specific reason to propose new copy — if so,
  flag that back as a separate decision rather than changing it silently.
- Keep an "About Us" eyebrow + the Unifolio ring mark somewhere in the
  layout as a brand signature.
- FAQ and Contact must stay on their current cream background, untouched.

**Task 1 — Remove the envelope/reveal mechanism entirely**
File: `components/blueprint/scenes/AboutScene.tsx`, `AboutEnvelopeSlot`.
Delete the SVG envelope illustration (flaps, pocket, seal, gradients,
drop-shadow filters), the one-time `ScrollTrigger` entrance timeline
(`playEnvelopeEmergence`), and the `rotateY` page-flip mechanism
(`docFlipperRef`, `activePage` state, flip click handlers). Also delete the
already-dead `_unused*`-prefixed functions in this file if they only existed
to support the old reveal (confirm first — don't delete anything still
referenced elsewhere).

**Task 2 — Build the asymmetric editorial spread**
Same file. Replace what Task 1 removed with a tall, asymmetric, two-beat
typographic composition:
- Beat 1 (the problem copy) as a large, off-center headline block — mixed
  weights within the line (e.g. a heavy serif cut against a thin italic on
  the emphasis phrase "Because someone has to"), ink-colored type on the
  cream background.
- Beat 2 (the resolution copy) as its own large asymmetric block further
  down the spread. Recommended: let this beat read bigger/louder than Beat 1
  — a build, not two equal chapters — since the emotional weight sits in the
  resolution ("Seeing your money isn't the same as understanding it."). This
  is a craft call, not a rigid spec — use your judgment on exact scale.
- Both beats appear via normal scroll-position fade/reveal (standard
  in-viewport fade-in is fine) — no scroll-scrubbing, no pinning, no special
  one-time timeline.
- Keep the "About Us" eyebrow and the Unifolio ring mark (`unifolio-ring-
  transparent.png`) somewhere in the composition, flat — no 3D bezel/shadow
  treatment.
Test: scroll into About at 1920×1080, 1440×900, 1024×768, 390×844 — reads as
a confident, asymmetric editorial spread on cream, not a centered card; no
overlap/clipping at any breakpoint.

**Task 3 — Restyle the scattered cards as a monochrome collage**
Same file, the `SCATTER_SLOTS` render block (currently ~lines 1068-1098,
confirm against current line numbers after Task 1's deletions). Restyle the
26 scattered cards away from translucent glassy UI-mockup rectangles toward
small flat monochrome fragments or corner marks — desaturated, low-contrast,
like clippings in a magazine collage, sitting quietly behind the type without
competing with it.

**Task 4 — Retire `AboutBackgroundSlot`'s cinematic effects**
Same file, `AboutBackgroundSlot` (~lines 634-798, confirm current line
numbers). Remove the sage-green radial washes, god-ray light shafts, light
cone, backlight halo, caustic ribbon paths, dust motes, and film grain — they
supported the old envelope-reveal mood and aren't part of this direction. The
monochrome scattered-card collage (Task 3) is the section's only background
texture now. If you think any one of these effects is worth keeping in a
much quieter form, flag that back to the user rather than deciding silently —
default assumption is they all go.

**Task 5 — Security → About transition**
Files: `components/blueprint/BlueprintHero.tsx` (`id="security"` /
`id="about"` boundary, ~lines 1484-1539) and the scattered-card logic from
Task 3. Since both sections share the same cream background, there's no
color seam to solve — the transition is about scale/mode, not color. Make
the monochrome scattered-card fragments begin appearing sparsely near the
bottom of the Security section (low density, faint, around/behind the vault)
and increase in density through a **compact** zone into About, settling into
full collage density behind the editorial type. Do not add generous empty
vertical space between the two sections to engineer this — keep them close;
the fragment density ramp and the scale jump itself should carry the
transition.
Test: scroll slowly through the Security→About boundary — the handoff reads
as a deliberate, connected beat (fragments already appearing before About's
type arrives), not an abrupt cut, and without an obvious empty gap between
the sections.

---

When done, summarize what changed per task so the user can do a manual pass.
Do not proceed to redesigning anything outside this section (FAQ, Contact,
the standalone `/about` route) without the user explicitly asking.
