Prompt for anti-gravity — paste as-is
=======================================
(Companion execution prompt for `2026-09-18-animation-polish-and-ui-refinement-plan.md`)

---

You are implementing 11 verified, code-referenced changes to the Unifolio marketing site
(`d:\Unifolio-website`). The full plan with exact file paths, line numbers, and current values is
in `Docs/2026-09-18-animation-polish-and-ui-refinement-plan.md` — read that file in full before
starting, it is the source of truth, not this prompt. This prompt is just the execution checklist
and sequencing.

**Ground rules:**
- Every duration/timing number in this codebase must stay proportionally in sync. Where the plan
  says to use `.timeScale()` on a GSAP timeline, do exactly that — do NOT go through the timeline
  and manually edit individual `duration:` fields or the absolute time-offset arguments
  (e.g. the `0.72`, `0.80` position arguments in `tl.to(el, {...}, 0.72)`). Hand-editing those will
  desync overlapping tweens. `timeScale()` is mandatory wherever the plan specifies it.
- Do not apply the new `CINEMATIC_TIMESCALE` constant to CSS hover/focus transitions (buttons, nav
  pill, input focus glow) — only to the GSAP timelines explicitly listed.
- Work through the sections in the order below — later items build on earlier ones being correct
  (e.g. don't tune the security scroll-lock timing until the timeScale change has landed, since
  slower transitions change how much momentum-tail time needs to be absorbed).
- After each numbered section, do a quick manual pass in the browser before moving to the next —
  don't batch all 11 changes into one untested diff.

---

### Step 1 — Global tempo constant (do this first, it underpins sections 3, 5, 6, 7)
In `components/blueprint/BlueprintHero.tsx`, add:
```ts
const CINEMATIC_TIMESCALE = 0.85;
```
Apply `tl.timeScale(CINEMATIC_TIMESCALE)` (or the correct timeline variable name) right before each
timeline is returned/played, in exactly these functions:
- `createHeroToProductTimeline` (~line 989)
- `createRestingToBentoTimeline` (~line 1375)
- `createProductToRingTimeline` (~line 1739)
- `goToSecurityState` (~line 5892)
- `consolidateRingToStack` (~line 4275)
- `restoreStackToRing` (~line 5379)
- `flipDocToPage` (~line 3827)

In `components/hero/HeroIntroLogo.tsx`, apply the same `0.85` value to `masterTl` the same way.

Test: click through hero → product → security (scroll through all 7 states) → about → faq →
contact and back. Everything should feel like one consistent, slightly-slower-than-before tempo —
not "some things slow, some things still fast."

### Step 2 — Load screen drop fix
In `components/blueprint/BlueprintNav.tsx`:
- Line ~152–158: remove `-translate-y-2` from the `<nav>` container's undocked state (keep the
  opacity fade, drop the transform).
- Line ~196–198: same removal on the center nav pill.
- Line ~275–277: same removal on the right-side Login/Sign Up block.

Do NOT touch `HeroIntroLogo.tsx`'s flight/target-position logic — it's already correct; this is a
navbar-only fix.

Test: hard-refresh the homepage 5+ times. The logo should fly in and land in the navbar with zero
visible secondary shift/drop after it arrives.

### Step 3 — Hero video seamless loop
In `components/hero/HeroApertureVisual.tsx`: implement the dual-video crossfade buffer described
in the plan's §4 — two stacked `<video>` elements, manual loop (no native `loop` attr), crossfade
opacity ~0.5–0.6s before each video's natural end, alternating which one is "active."

Test: watch at least 3 full loop cycles back to back — no black frame, no visible restart cut.

### Step 4 — Navbar sketch icons
In `components/blueprint/BlueprintNav.tsx` (`NAV_ITEMS` array + icon render at ~line 240): replace
the 5 PNG icons with sketch-style SVGs matching the vault's ink-sketch aesthetic (see plan §2 for
per-icon direction). If the user has provided real sketch assets, use those; otherwise design new
ones in the same visual language as `/sketch-vault-frame.png` and the bento illustrations.

Test: check all 5 icons at mobile/tablet/desktop nav widths, confirm hover/active green highlight
still works (that logic is unchanged, only the icon asset swaps).

### Step 5 — Card flip (relies on Step 1 already being live)
No separate numeric changes — confirm `createHeroToProductTimeline`'s `timeScale()` from Step 1 is
already slowing the flip block (lines ~1283–1301) proportionally with its overlapping headline/CTA
entrance. Do not add an additional standalone duration bump here without checking with the user
first — see plan §5 for why.

Test: hero → product transition — the flip should feel weighted, not broken/rushed, and the
headline/CTA should still enter in sync with it (no gap or overlap glitch).

### Step 6 — Security: scroll gesture lock (independent of Step 1, but ship together)
In `components/blueprint/BlueprintHero.tsx`, `handleWheel`'s security (`"ring"`) branch
(~lines 6252–6303):
- Extend `wheelGestureEndTimerRef`'s timeout from `100` to `~400`ms (~line 6260–6262).
- Add a gesture-lock flag (reuse `wheelGestureActiveRef` or add a new
  `hasTriggeredThisGestureRef`): set `true` the instant any of `goToSecurityState(...)`,
  `consolidateRingToStack()`, or `restoreStackToRing()` fire from this branch (lines ~6276, 6281,
  6290, 6295, 6298). While it's `true`, ignore all further wheel ticks in this branch — regardless
  of `isSecurityTransitioningRef` or the existing 120ms cooldown — until the extended decay timer
  clears it (i.e., until wheel events have stopped arriving for the full ~400ms, not just until the
  current transition animation happens to finish).
- Apply the same pattern to the About page-flip branch (~lines 6206–6229) and the FAQ upward
  re-entry check (~lines 6237–6246), which have the same thin single-cooldown vulnerability.

Test: on a trackpad (this is the critical device — mouse wheels won't reproduce it), do 10
separate single flicks through the security states, including fast repeated flicking. Every flick
should advance exactly one state. Then verify slow, deliberate single scrolls still work normally
(no added lag or missed input).

### Step 7 — Security → About transition speed
Confirm `consolidateRingToStack` and `restoreStackToRing`'s `timeScale()` from Step 1 is producing
a visibly slower, more deliberate consolidation/reveal. No manual duration edits needed — this
timeline's offsets are dynamically computed from live element measurements, so timeScale is the
only safe way to slow it.

### Step 8 — Product section spacing + subtext removal
In `components/blueprint/BlueprintHero.tsx`:
- `productWorldRef` (~line 7793–7794): change `justify-start` → `justify-center`; remove or reduce
  the asymmetric `pt-14 sm:pt-16 md:pt-18 lg:pt-20` top padding to something symmetric with the
  existing `pb-4 sm:pb-6`.
- Delete the subtext `<p ref={subheadRef}>...</p>` block (~lines 9129–9134).
- Remove the now-dangling `subheadRef` entry from the `tl.set([...], ...)` array (~line 1306) and
  the `tl.to(subheadRef.current, {...})` block (~line 1323) inside `createHeroToProductTimeline` —
  the ref no longer exists in the DOM, so animating it will silently no-op or error.
- Tune `headerRef`'s top margin (~line 9114, `mt-10 sm:mt-12 md:mt-14 lg:mt-16 xl:mt-20`) down
  slightly to use the space freed by the subtext removal — adjust visually in-browser.

Test: at browser viewport heights matching 14" MacBook (1512×982), 16" MacBook (1728×1117), and
1920×1080 — cards + heading + CTA should read as vertically centered with balanced top/bottom
space at all three. Confirm no console error from the removed `subheadRef`.

### Step 9 — Bento box: Tile 1 spacing + Tile 2 graphic sizing
In `components/blueprint/BlueprintHero.tsx` (~lines 8204–8320):
- Tile 1 (`idx === 0`, ~line 8213): change the info-rows container's `justify-between` →
  `justify-start`, increase `gap-3.5 sm:gap-4.5` → a larger fixed gap (e.g. `gap-6 sm:gap-8`).
  Also bump body text (~lines 8221, 8234, 8247, 8260) from `text-[13px] sm:text-[14px]
  lg:text-[15px]` to `text-[15px] sm:text-[16px] lg:text-[17px]` with `leading-[1.55]`, and icon
  size (~lines 8219, 8232, 8245, 8258) from `w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]` to
  `w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]`.
- Tile 2 (`idx === 1`, ~line 8280–8285): rebalance the `/product-cards/card-2d-1.png` illustration's
  `max-h-[...]`/`scale-[...]` values against the text column's `max-w-[...]` so neither crowds the
  other — tune directly in-browser at each breakpoint since the right numbers depend on the source
  image's proportions.

Test: Tile 1 should no longer show large empty vertical gaps between the 4 rows. Tile 2's
illustration and copy should look proportionate at mobile, tablet, and desktop.

### Step 10 — FAQ: solid green curved line + bold single-line heading
In `components/blueprint/BlueprintFaq.tsx`:
- Delete the `<ellipse fill="url(#topRightArcGlow)">` (~lines 219–226) and the two blurred
  `<path filter="url(#crescentSoftGlow)">` elements (~lines 228–244).
- Keep only the remaining crisp `<path>` (~lines 246–252); set `strokeOpacity="1"`, bump
  `strokeWidth` from `1.2` to `~1.5–1.8`.
- Remove the now-unused `crescentSoftGlow` filter and `topRightArcGlow` gradient defs
  (~lines 196–216) once nothing references them.
- Heading (~lines 292–294): remove the `<br />`, add `whitespace-nowrap`, change
  `text-[#111613]` → `text-[#22C55E]`, change `font-light md:font-normal` → `font-bold`, size up
  moderately (e.g. `text-4xl sm:text-5xl lg:text-[54px]`).

Test: curved line should be a clean solid brand-green stroke, no blur/halo. Heading should read on
one line, bold, brand green, at desktop AND the smallest supported width — no wrap, no clipping.

### Step 11 — Footer: remove green ambient tinting
In `components/blueprint/BlueprintContact.tsx`:
- Remove the 4 background orb `<div>`s: the `340px` radial orb (~line 421), and inside
  `orbLayerRef` (~line 428) the `520–1020px` orb (~line 433), the `580px` green orb (~line 436),
  and the `480px` cyan orb (~line 437).
- Check whether `orbLayerRef` and its GSAP animations (~lines 266–268, 317–319) exist solely to
  drive these orbs — if so, remove the ref and those effects too rather than leaving dead code
  animating nothing.
- Leave all other brand-green accents in this component (buttons, hover states, focus glows,
  social icons) untouched.

Test: "Ask us anything" section should show a clean, flat background with no green/cyan tint or
pulsing orb, while the brand-green accents on buttons/links/inputs remain exactly as before.

---

### Final full-site pass
Once all 11 steps are done, run through the entire verification checklist at the bottom of
`Docs/2026-09-18-animation-polish-and-ui-refinement-plan.md` in order, on both a trackpad-equipped
laptop and a standard mouse, before calling this done.
