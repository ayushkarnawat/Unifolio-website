Unifolio — Animation Cohesion & UI Refinement Plan
====================================================
Date: 2026-09-18
Author: Senior UX/UI review pass on top of the anti-gravity/Gemini draft plan
Status: Ready for review → execution by anti-gravity

---

## 0. How this plan differs from the anti-gravity draft

The draft plan (10 components) was directionally correct on *what* needs fixing but wrong or
incomplete on *how* in four places that matter. These are called out inline below, but the
headline corrections are:

1. **Speed changes must come from ONE shared multiplier, not per-animation guesses.**
   The draft proposed different % increases for each animation (vault open +38%, vault close
   +64%, text reveal +40%, card flip **+164%**). The user was explicit: *"not by a lot... we do
   not want to go back to the old slow version."* A +164% duration increase on the card flip
   directly contradicts that. Inconsistent per-animation multipliers also produce the opposite
   of "cohesive" — every transition would feel like it has its own tempo again. Section 1 below
   replaces this with a single shared timing constant applied uniformly via GSAP `timeScale()`.

2. **Manually editing `duration` values on these timelines is risky and will desync them.**
   Verified in code: these timelines schedule tweens at hardcoded absolute positions (e.g.
   `tl.to(headlineRef.current, {...}, 0.72)`, `tl.to(ctaRef.current, {...}, 0.80)` in the card
   flip timeline; `masterTl.to(mainBase, {...}, 0.20)` in the intro logo timeline). If anti-gravity
   only edits the named `duration` constants and leaves these absolute position numbers alone,
   later tweens will start too early relative to newly-slower earlier tweens, causing new overlap
   glitches. `timeline.timeScale()` scales durations *and* position offsets together, guaranteeing
   everything stays in sync — this is the correct, low-risk mechanism and is specified in Section 1.

3. **The load-screen "drop" bug has a precise, different root cause than the draft describes.**
   It is not a docking-coordinate calculation bug. See Section 3 — the fix is a one-line CSS change,
   not a re-implementation of the target-position math.

4. **The trackpad multi-skip bug exists in a second, separate timeline the draft missed.**
   The draft only targeted the vault open/close constants. The per-scroll state-to-state text swap
   (what actually fires on every single scroll tick while browsing the 7 security states) is a
   *different, faster* timeline with its own hardcoded durations, and the gesture-lock fix must gate
   the correct ref. See Section 6.

5. **Bento Tile 1's empty space is a layout problem, not just a font-size problem.**
   See Section 8 — `justify-between` on 4 short items in a tall card is what creates the big empty
   pockets in the screenshot; a font bump alone won't fully resolve it.

Everything else in the draft (nav icons, FAQ glow removal, contact orb removal, subtext removal,
product centering) was accurate and is carried forward with tightened specifics below.

---

## 1. Global animation tempo — the foundation for every "too fast" complaint

**Principle:** one shared constant, applied the same way everywhere, so the whole site keeps one
tempo. This resolves the hero↔product↔security↔about transitions, the vault open/close, the
security per-state text swap, the card flip, and the intro logo flight — all from a single lever
that's easy to A/B tune after the fact.

**Mechanism:** add one exported constant and call `.timeScale()` on each cinematic timeline right
before it's returned/played. Do **not** hand-edit the individual `duration:` numbers scattered
through the 1,000+ lines these timelines span — that's what risks desync (see §0.2).

```ts
// top of components/blueprint/BlueprintHero.tsx
const CINEMATIC_TIMESCALE = 0.85; // 1 / 0.85 ≈ 18% slower, uniformly, everywhere
```

Apply `tl.timeScale(CINEMATIC_TIMESCALE)` immediately before `return tl;` (or before `.play()`,
whichever the surrounding function does) in **every** one of these timeline factories in
`components/blueprint/BlueprintHero.tsx` — verified locations:

| Function | Line | Governs |
|---|---|---|
| `createHeroToProductTimeline` | 989 | Hero → Product cards (includes the card flip, §7) |
| `createRestingToBentoTimeline` | 1375 | Product resting → Bento grid |
| `createProductToRingTimeline` | 1739 | Product → Security (vault door **open**, §5) |
| `goToSecurityState` | 5892 | Per-scroll state-to-state text swap inside Security (§6) |
| `consolidateRingToStack` | 4275 | Security exit → About consolidation (§5) |
| `restoreStackToRing` | 5379 | About → back into Security (reverse) |
| `flipDocToPage` | 3827 | About page flip |

Do the equivalent in `components/hero/HeroIntroLogo.tsx`'s `masterTl` (created ~line 88) — same
constant value, kept in sync so the intro doesn't feel like a different tempo than the rest of
the site (§4).

Leave hover/focus **CSS transitions** (buttons, nav pill highlight, input focus glows) untouched —
those are micro-interactions the user did not complain about; scaling them would make the UI feel
sluggish on hover, which is a different (and unwanted) problem.

**Tuning:** start at `0.85`. If a specific transition still feels too quick after this lands, do
**not** give it a separate large bump (that's the mistake in §0.1) — first try nudging the shared
constant to `0.82`–`0.83` and re-test the whole site, since the goal is one consistent tempo. Only
consider a per-animation override after the shared constant has been tried and rejected.

---

## 2. Navbar icons — 3D PNGs → sketch SVGs

**File:** `components/blueprint/BlueprintNav.tsx` (`NAV_ITEMS` array, lines 16–22; icon `<img>` at
line 240).

- Replace the 5 raster PNGs (`/navbar/product.png`, `security.png`, `about.png`, `faq.png`,
  `contact.png`) with inline SVG (or `next/image` pointing at new `/public/navbar-sketch/*.svg`)
  hand-drawn line icons matching the ink-sketch language already used for the vault
  (`/sketch-vault-frame.png`, `/sketch-vault-disc.png`) and the bento illustrations
  (`/bento-icons/*.png`, `/product-cards/card-2d-*.png`).
- Icon direction per item (kept from the draft, it was sound):
  - **Product** — layered/stacked sheets sketch (echoes the bento "Understand what you own" icon
    style already in `/bento-icons/stacked-sheets.png`).
  - **Security** — vault dial/lock sketch, directly reusing the vault's visual language.
  - **About** — compass or orbit sketch (there's already an orbit motif on the "See everything"
    card — reuse that visual vocabulary rather than inventing a new one).
  - **FAQ** — hand-drawn speech bubble, matching `/product-cards/card-2d-1.png`'s bubble style.
  - **Contact** — sketched envelope/mail fold.
- Stroke weight ~1.3–1.5px, brand green (`#22C55E`) on active/hover, neutral ink (`#111613` or
  `neutral-950`) at rest — matching the existing active-state green glow logic already coded at
  lines 230–236 (`isHovered`/`isActive` classes) so no behavioral logic needs to change, only the
  visual asset swapped in.
- If real hand-drawn sketches exist (ask the user first — they offered to provide references),
  use those instead of generating new ones; visual consistency with the vault matters more than
  which of us drew it.
- Test at the existing render sizes (`h-[28px] sm:h-[30px]`, line 243) across mobile/tablet/desktop
  — SVGs should be viewBox-based so they stay crisp at all of them, unlike the current PNGs.

---

## 3. Load screen — fix the navbar "drop", not the docking math

**Files:** `components/hero/HeroIntroLogo.tsx`, `components/blueprint/BlueprintNav.tsx`.

**Root cause (verified, different from the draft's diagnosis):** `HeroIntroLogo`'s flight
animation already computes its landing target from the *live* navbar logo's
`getBoundingClientRect()` (lines 282–314) — that part is correct and precise.

The actual bug: the flight's target rect is measured **before** the navbar has "docked" (the
`unifolio-logo-docked` event only fires in the flight's `onComplete`, i.e. after the target was
already captured). At that moment, `BlueprintNav`'s `<nav>` element still has its pre-dock classes
(`opacity-0 -translate-y-2`, line 152–158 in `BlueprintNav.tsx`) — an 8px upward CSS transform.
The intro logo flies to that (already-shifted-up-by-8px) position perfectly. Then, the instant the
`unifolio-logo-docked` event fires, `BlueprintNav` sets `isLogoDocked = true`, its own
`transition-all duration-500` kicks in, and the nav visibly slides down 8px from
`-translate-y-2` → `translate-y-0` — which is exactly the "comes a little bit down" the user is
seeing. It's a second, independent animation stacking on top of the first, not a miscalculated
target.

**Fix:** remove the vertical offset from the navbar's docking transition so there's nothing left
to animate after the logo lands — dock should only be an opacity/visibility change, not a position
change.

- In `BlueprintNav.tsx` line 152–158, change the `<nav>` container's non-scrolled state from
  `"opacity-0 -translate-y-2 pointer-events-none"` to `"opacity-0 pointer-events-none"` (drop the
  `-translate-y-2` / `translate-y-0` pair entirely — keep the opacity fade only).
- Do the same for the center nav pill (lines 196–198) and the right-side actions block
  (lines 275–277), which have the identical `-translate-y-2 → translate-y-0` pattern.
- Leave the intro's own flight/target math untouched — it's already correct once the destination
  stops moving after it arrives.

**Speed:** apply `CINEMATIC_TIMESCALE` (§1) to `masterTl` — do not hand-tune the intro's individual
segment durations (0.20s ring hold, 0.50s segment pull, 0.60s expand, 0.45s hold, 1.05s flight);
timeScale keeps this multi-stage sequence's internal choreography intact while uniformly slowing it
~18%, consistent with the rest of the site.

---

## 4. Hero video — seamless loop

**File:** `components/hero/HeroApertureVisual.tsx`.

Confirmed: currently a single `<video autoPlay loop muted playsInline>` (lines 55–69). The native
`loop` attribute is doing a hard cut back to frame 0 — there's no crossfade, which is why it reads
as "stop, cut, restart" rather than a loop. The draft's dual-buffer crossfade approach is the right
fix; specifics:

- Render two `<video>` elements (`videoARef`, `videoBRef`) stacked absolutely, same source
  (`/Final Hero Apeture Light.mp4`), both `muted playsInline preload="auto"`, neither using the
  native `loop` attribute (loop is now handled manually).
- Track `video.duration` once metadata loads. When the active video's `currentTime` reaches
  `duration - 0.6s`, start playing the *inactive* video from `0` and crossfade opacity
  (`0 → 1` over ~0.5–0.6s, `power1.inOut` or a plain CSS transition) while the previously-active
  video fades `1 → 0` over the same window, then pause/reset the one that just faded out to `0`
  so it's ready for its next turn.
- Continue alternating on every cycle. This removes the black-frame/restart seam entirely.
- Keep the existing `isPaused` prop behavior (lines 39–49) — pause both videos when hidden, resume
  the currently-active one when visible again.
- If the source video's first and last frames are visually dissimilar (hard cut in content, not
  just playback), the crossfade will mask it, but ask the user if a re-exported/trimmed version
  with matching first/last frames exists — that would make the loop even more seamless than
  crossfading alone can achieve.

---

## 5. Hero → Product card flip

**File:** `components/blueprint/BlueprintHero.tsx`, `createHeroToProductTimeline` (line 989),
flip block at lines 1283–1301 (`flipDuration = 0.22`, `flipStagger = 0.08`, `flipBaseStart = 0.64`).

Per §0.1: **do not** independently bump `flipDuration` to 0.58s (+164%) as the draft proposed —
that goes directly against the user's "don't dramatically reduce speed more" note and would make
the flip feel disconnected from every other transition's new tempo.

- Apply `CINEMATIC_TIMESCALE` (§1) to this timeline only — since `flipDuration`, `flipStagger`,
  and the absolute anchors (`0.42`, `0.70`, `0.72`, `0.76`, `0.80`) that schedule the headline/CTA
  entrance overlapping the flip all live in this *same* timeline/function, timeScale slows the
  flip and its overlapping text entrance together, proportionally, automatically.
- Ship this, then have the user re-test. If the flip specifically still feels like it's lost its
  "essence" after the global tempo change, come back for a small, isolated second pass on just
  `flipDuration`/`flipStagger` (e.g. +15–20% on top of the timeScale, not +164%) rather than
  guessing a large number upfront.

---

## 6. Security section — vault speed + scroll sensitivity

**File:** `components/blueprint/BlueprintHero.tsx`.

There are **two distinct timelines** the user is describing, both need the fix — the draft only
addressed the first:

**(a) Vault door open/close (entry/exit of the whole Security section):**
Lives in `createProductToRingTimeline` (line 1739): `safeOpenDuration = 0.76` (line 2244),
`safeCloseDuration = 0.44` (line 2481), `textRevealDuration = 0.75` (line 2424, the first state's
text reveal on entry). Covered automatically by `CINEMATIC_TIMESCALE` applied to this timeline
per §1 — no manual number changes needed.

**(b) Per-scroll state-to-state text swap (fires on every scroll tick while browsing the 7 states):**
This is `goToSecurityState` (line 5892) — a **separate, already much faster** timeline
(`0.14s` fade-out at line 5923, `~0.18s` heading/body fade-in at lines 5977–5981) that the draft
never identified. This is what's actually running most of the time a user is on this section, so
it needs `CINEMATIC_TIMESCALE` applied too, or the "grittiness" the user describes on scroll will
persist even after the door-open fix lands.

**(c) Scroll sensitivity / trackpad multi-skip — the actual bug (verified in `handleWheel`, security
branch at lines 6252–6303):**

Current guard against re-triggering mid-gesture is only:
```
if (isSecurityTransitioningRef.current) return;              // blocks only while animating
if (Date.now() - lastSecurityScrollTimeRef.current < 120) return; // 120ms cooldown
```
Neither of these accounts for trackpad **momentum** — after a physical flick, trackpads keep
firing wheel events with decaying `deltaY` for 300–1000ms. Once the state transition's animation
finishes (`isSecurityTransitioningRef.current` flips to `false` in the timeline's `onComplete`,
line 5895) and 120ms has passed, the *very next still-arriving momentum tick* — from the same
original flick — immediately triggers another `goToSecurityState`, and this repeats for as long
as momentum ticks keep exceeding the `deltaY > 8` threshold. That's the "one scroll advances
3–4 sections" bug. Slowing the transitions down (§1) will make this **worse**, not better, since
longer transitions give momentum more time to queue up extra triggers — so this fix must ship
together with the speed change, not after it.

There's already a partially-built mechanism for this that isn't being used to gate anything:
`wheelGestureActiveRef` / `wheelGestureEndTimerRef` (declared lines 423–424, refreshed on every
wheel tick with only a 100ms timeout at lines 6256–6262) — currently these are set but never
*read* to block a trigger. Fix:

- Extend the decay window from 100ms to ~400ms (long enough to span typical trackpad momentum
  tails).
- Add a `hasTriggeredThisGestureRef` (or reuse `wheelGestureActiveRef` for this purpose): set it
  `true` the instant a trigger fires (`goToSecurityState(...)` / `consolidateRingToStack()` /
  `restoreStackToRing()` calls at lines 6276, 6281, 6290, 6295, 6298).
- In the `handleWheel` security branch, add a guard: if `hasTriggeredThisGestureRef.current` is
  `true`, ignore all wheel ticks (regardless of `isSecurityTransitioningRef` or the 120ms cooldown)
  until the extended decay timer fires and clears it — i.e., until wheel events have genuinely
  stopped arriving for ~400ms, not just until the current animation happens to finish.
- Net effect: exactly one state advance per physical flick, no matter how long the (now-slower)
  transition animation takes or how long the trackpad's momentum tail is.
- Apply the identical pattern to the FAQ-section upward re-entry check (lines 6240–6246) and the
  About page-flip check (lines 6211–6227), which use the same thin `140`/`150`ms-only guards and
  are vulnerable to the same class of bug, just less noticeably (fewer discrete states to skip
  through).

---

## 7. Security → About transition

**File:** `components/blueprint/BlueprintHero.tsx`, `consolidateRingToStack` (line 4275) and
`restoreStackToRing` (line 5379).

Apply `CINEMATIC_TIMESCALE` (§1) to both timelines — this is a long, dynamically-computed sequence
(ring → horizontal stack → envelope fold → document reveal, with viewport-dependent waypoints
computed from live `getBoundingClientRect()` calls, lines 4215–4241) so manually re-deriving each
offset by hand is impractical and error-prone; `timeScale()` is the only safe way to slow this one
down without breaking its dynamic waypoint math.

---

## 8. Product section — spacing, centering, subtext removal

**File:** `components/blueprint/BlueprintHero.tsx`, `productWorldRef` container (line 7793–7794).

Confirmed: `className="... flex flex-col justify-start items-center px-4 sm:px-6 lg:px-8 pt-14
sm:pt-16 md:pt-18 lg:pt-20 pb-4 sm:pb-6 ..."` — `justify-start` + asymmetric top padding is exactly
why shorter-viewport laptops (e.g. 13"/14" MacBook, ~900px tall browser viewport) show the cards
hugging the top with dead space below.

- Change `justify-start` → `justify-center` on `productWorldRef` (line 7794).
- Remove the fixed `pt-14 sm:pt-16 md:pt-18 lg:pt-20` top padding (or reduce it to a small,
  symmetric value matching `pb-4 sm:pb-6`) now that centering handles vertical balance — a large
  one-sided top offset would fight the centering and just re-create the imbalance from the other
  side.
- Remove the subtext paragraph entirely (lines 9129–9134, `<p ref={subheadRef}>Every account,
  every fund, every rupee, in one place, finally clear.</p>`) and its wrapping `<p>` tag.
- `subheadRef` is also referenced inside the hero→product timeline (line ~1323, fading it in
  alongside the headline/CTA) — since the element is being removed, also delete that
  `tl.to(subheadRef.current, {...})` block (and its entry in the `tl.set([...], {autoAlpha: 1,
  visibility: "visible"}, 0.70)` array at line 1306) so there's no dangling animation targeting a
  removed ref.
- After removal, tighten `headerRef`'s `mt-10 sm:mt-12 md:mt-14 lg:mt-16 xl:mt-20` (line 9114) down
  slightly (subtext removal frees up space the heading/CTA block can now use for breathing room
  instead) — verify visually rather than picking a number blind; this is a one-line Tailwind edit
  to iterate on directly in-browser.
- Verify on real 13"/14"/16" MacBook viewport heights (900–1117px) plus a standard 1080p desktop
  and one ultrawide — confirm equal-feeling top/bottom margins around the card+heading+CTA block
  at each.

---

## 9. Bento box — Tile 1 spacing, Tile 2 graphic sizing

**File:** `components/blueprint/BlueprintHero.tsx`, tile content around lines 8203–8320.

**Tile 1 ("Understand what you own", lines 8204–8266) — the real cause of the dead space in the
screenshot is layout, not just text size:**
The 4 info rows sit in `<div className="flex flex-col justify-between flex-1 mt-5 sm:mt-6 gap-3.5
sm:gap-4.5">` (line 8213). `justify-between` stretches 4 short (1–2 line) items evenly across the
*entire* remaining card height — on a tall vertical card with only 4 short items, that's what
produces the big empty valleys visible in the screenshot, independent of font size.

- Change `justify-between` → `justify-start` (line 8213) and increase `gap` to a larger fixed value
  (e.g. `gap-6 sm:gap-8` instead of `gap-3.5 sm:gap-4.5`) so items sit as a naturally-spaced group
  rather than being stretched to the card's full height.
- Also increase body text (lines 8221, 8234, 8247, 8260) from `text-[13px] sm:text-[14px]
  lg:text-[15px]` to `text-[15px] sm:text-[16px] lg:text-[17px]` with `leading-[1.55]`, and bump
  the icon size (lines 8219, 8232, 8245, 8258) from `w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]` to
  `w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]` — both changes still matter even with the layout fix,
  since they make each row read as more substantial rather than sparse.
- Do both together (layout + type/icon size), then check visually — layout alone might already
  solve most of it, in which case the type bump can stay modest.

**Tile 2 ("Skip the dashboards. Just ask", lines 8267–8287):**
- Illustration is `/product-cards/card-2d-1.png` at `max-h-[250px] sm:max-h-[275px]
  lg:max-h-[295px] ... scale-[1.28] sm:scale-[1.34] lg:scale-[1.38]` (line 8284) inside a
  `flex-1 h-full` container (line 8280) next to a text column capped at `max-w-[260px] sm:max-w-
  [290px] lg:max-w-[315px]` (line 8270).
- Rebalance per the draft's direction: adjust the `max-h` / `scale` pairing so the speech-bubble
  graphic doesn't crowd or dwarf the copy at any breakpoint — since this illustration's aspect
  ratio and the exact visual result depend on the source PNG, tune these two values directly in
  the browser at each breakpoint rather than picking numbers blind; verify the text column and
  graphic both feel intentionally sized relative to each other, not competing.

---

## 10. FAQ section — solid curved line, bold single-line heading

**File:** `components/blueprint/BlueprintFaq.tsx`.

Confirmed structure (lines 195–253): a radial `topRightArcGlow` gradient ellipse, two blurred
stroke paths using `filter="url(#crescentSoftGlow)"` (a double-Gaussian-blur `feMerge` filter,
lines 208–216), and one crisp unblurred path already at the bottom (`strokeOpacity="0.5"`, line
250).

- Delete the `<ellipse fill="url(#topRightArcGlow)">` (lines 219–226) and the two blurred
  `<path>` elements using `filter="url(#crescentSoftGlow)"` (lines 228–244) — these three
  elements together *are* the glow.
- Keep only the crisp path (lines 246–252); set `strokeOpacity="1"` and bump `strokeWidth` slightly
  (e.g. `1.5`–`1.8`) so it reads as a clean, confident solid brand-green line rather than a faint
  hairline once the glow it was layered against is gone.
- The `crescentSoftGlow` `<filter>` def and `topRightArcGlow` gradient def (lines 196–216) can be
  removed entirely once nothing references them.
- Heading (lines 292–294): currently `<h2 className="font-sans font-light md:font-normal text-3xl
  sm:text-4xl lg:text-[46px] text-[#111613] ...">Frequently <br /> Asked Questions</h2>`.
  Remove the `<br />` (single line, add `whitespace-nowrap` so it can't re-wrap on narrow
  desktop widths), change `text-[#111613]` → `text-[#22C55E]`, and change weight from
  `font-light md:font-normal` → `font-bold`, sizing up modestly (e.g. `text-4xl sm:text-5xl
  lg:text-[54px]`) since bold brand-green reads visually heavier and can carry a larger size
  cleanly.
- Double-check the heading still fits without wrapping at the smallest supported desktop width
  once `whitespace-nowrap` is added — if it clips on smaller laptop widths, drop the size one notch
  at the `sm`/`md` breakpoints rather than allowing wrap back in.

---

## 11. Footer / "Ask us anything" — remove green tinting

**File:** `components/blueprint/BlueprintContact.tsx`.

Confirmed the green/cyan wash comes from three elements: a `340px` radial orb (line 421,
`from-[#22C55E]/10 via-[#06B6D4]/6`), and inside `orbLayerRef` (line 428) two large blurred orbs —
one `520–1020px` orb at `from-[#06B6D4]/30 via-[#22C55E]/20 ... blur-[110px] sm:blur-[140px]
opacity-75 animate-pulse` (line 433) and a `580px` solid green orb at `blur-[130px] opacity-50`
(line 436), plus a `480px` cyan orb (line 437).

- Remove all four background orb `<div>`s (lines 421, 433, 436, 437) and the now-unused
  `orbLayerRef`/related refs and their GSAP references (lines 266–268, 317–319) if those tweens
  exist solely to animate this layer — check before deleting whether `orbLayerRef` is reused for
  anything else in the component; if it's dedicated to these orbs, remove the ref and its effects
  too rather than leaving dead code.
- Confirm the section's base background remains clean (`bg-[#FAF8F5]` or `#FFFFFF` per existing
  page background) with no residual gradient once the orbs are gone.
- Leave all brand-green *accents* elsewhere in this component untouched (button, focus states,
  hover colors, social icons at lines 477, 494, 522+, 781+) — the request is specifically about the
  ambient background wash, not the brand color usage throughout the section.

---

## Verification checklist

- [ ] One shared `CINEMATIC_TIMESCALE` constant exists and is applied to all 7+ timelines listed
      in §1 (plus `HeroIntroLogo`'s `masterTl`) — confirm by reading the diff, not just the demo.
- [ ] Hover/focus micro-interactions (buttons, nav pill, inputs) are unchanged in speed.
- [ ] Refresh the site from cold: logo flight lands in the navbar with **zero** secondary drop/shift
      once docked (test at least 5 times — this is timing-sensitive).
- [ ] Hero video loops with no visible cut, black frame, or stutter across at least 3 consecutive
      loop cycles.
- [ ] Hero → Product card flip feels weighted, not snappy-broken, and stays in sync with the
      headline/CTA entrance.
- [ ] On a trackpad: perform 10 consecutive single flicks through the Security states — confirm
      each flick advances exactly one state, with no skips, even on fast repeated flicking.
- [ ] Vault open (Product→Security) and close (Security→exit) both read as deliberate/mechanical,
      not robotic-fast.
- [ ] Security → About consolidation transition feels proportionally slower, matching the rest of
      the site's new tempo.
- [ ] Product section: test at 1512×982 (14" MacBook), 1728×1117 (16" MacBook), and 1920×1080 —
      cards + heading + CTA read as vertically centered with balanced top/bottom space at all three,
      and the subtext line is gone with no leftover gap or animation console errors.
- [ ] Bento Tile 1 ("Understand what you own") no longer shows large empty gaps between rows.
- [ ] Bento Tile 2 ("Skip the dashboards. Just ask") — graphic and copy read as proportionate at
      mobile, tablet, and desktop widths.
- [ ] FAQ curved line is a solid, opaque brand-green stroke with no blur/glow halo around it.
- [ ] FAQ heading reads on one line, bold, brand green, at desktop, tablet, and the smallest
      supported width (no wrap, no clipping).
- [ ] Footer "Ask us anything" section shows no green/cyan ambient tint or pulsing orb.
- [ ] Navbar icons render as sketch-style line art matching the vault's ink-sketch aesthetic, crisp
      at all breakpoints, with the existing hover/active green highlight behavior intact.
