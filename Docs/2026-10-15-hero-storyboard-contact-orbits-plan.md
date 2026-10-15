# Hero Storyboard Loop + Contact Orbits — Plan

Two changes, both already designed and approved by the user as interactive prototypes:

1. **Hero:** replace the looping hero video (`Final Hero Apeture Light.mp4`) with a canvas-drawn animated
   illustration, the "Your storyboard" idea, in its refined form (loops storyboard states 04 to 07 only,
   uses the official logo colours).
2. **Contact Us:** add a faint "orbits" background (large thin rings) to the `id="contact"` section, towards the
   right on desktop and in the bottom-right corner on mobile.

This is a planning document only. Claude does not implement it. Anti Gravity does, using
`2026-10-15-hero-storyboard-contact-orbits-anti-gravity-execution-prompt.md`.

The prototype page ("Unifolio Hero Concepts", a private claude.ai artifact) is where the user saw and approved both
designs. Anti Gravity cannot open it, so everything needed from it has been copied into this repo:
the artwork layers, a manifest, and verbatim reference code (see "Assets and references").

---

## 1. Decisions (all settled by the user, do not reopen)

### Hero

| # | Decision |
|---|---|
| H1 | Use the **"Your storyboard"** concept. It is a pencil-sketch illustration of a black ring with a green segment, surrounded by app cards (Mutual Funds, Insurance, Demat, Credit Cards, EPF and so on), drawn on the site's cream background. |
| H2 | **Keep the animation from states 04 to 07 only** of the original 8-state storyboard: 04 Everything connects, 05 Processing and analysis, 06 Key insights emerge, 07 Settle into hero. States 01 to 03 (clean start, cards appear, data flows in) are dropped. The animation starts fully assembled and loops with no visible jump. |
| H3 | **Logo colours.** The ring is the official near-black (`#0F0F0F`) with the official green (`#12B047`), taken from the files in `public/Logo`. The green segment **pops out**: it is slightly bigger than the black ring and sticks out past its outer edge, with a thin gap at each end, exactly like the real logo. This is already baked into `ring.webp`. The streams, scan arc, halo and insight accents in code use the same `#12B047`. The site accent `#22C55E` (buttons, links) is a different green and must not change. |
| H4 | The background is the site's own cream `#FAF8F5`. The artwork must blend in with no visible box or edge. This is already handled by colour-matched assets plus a soft edge fade. |
| H5 | The story is **digital, not paper**: app cards, data streams, live insights. (The old video had flying paper.) Nothing paper-like may be introduced. |
| H6 | **Mobile:** the illustration goes on top and the headline, sub line and CTA sit below it (the opposite of today, where the video sits behind the text). |
| H7 | Hero copy (headline, sub line, CTA) stays exactly as it is now. See open question Q1. |

### Contact orbits

| # | Decision |
|---|---|
| C1 | Add the orbits as a **background of the Contact Us section** (`id="contact"` in `BlueprintContact.tsx`), which includes the footer bar at its bottom. Not in the hero. |
| C2 | **Only faint rings.** No green arc and no dark arc. Six very faint thin rings, very light tick marks on one ring, a soft green glow in the middle and six tiny dots circling slowly. |
| C3 | **Desktop (viewport 1024px and wider):** the ring centre sits at 80% across and 50% down the section, so the rings bleed off the right edge. |
| C4 | **Mobile and tablet (below 1024px):** the ring centre sits in the **bottom-right corner** (86% across, 86% down) and the rings bleed off the edges. |
| C5 | It must never hurt readability of the headline, button, email, location, social links or footer text, and it must not be interactive. |

Everything else in the prototype (the other ten-plus concepts, the other tabs) is **out of scope**.

---

## 2. Current state (verified against the repo)

### Hero

* `components/blueprint/BlueprintHero.tsx` renders `<section id="hero" className="relative w-full h-screen min-h-screen bg-[#FAF8F5] select-none overflow-hidden flex flex-col justify-center">` containing `<HeroScene ... />` (around line 1393).
* `components/blueprint/scenes/HeroScene.tsx` has two absolutely positioned layers:
  1. `heroVisualRef` div (`absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform`, inline `transformOrigin: "62.87% 49.12%"`) that renders `<HeroApertureVisual isPaused={isAperturePaused} />`.
  2. `heroIntroRef` div (`absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-20 pb-8 max-w-7xl mx-auto ...`) with the `<h1>`, the sub line and the "Join the waitlist" button. The text block uses negative translate classes (`-translate-x-6 ... xl:-translate-x-24`).
* `components/hero/HeroApertureVisual.tsx` is the video component: two stacked `<video>` elements with a crossfade, plus an invisible anchor `<div id="hero-ring-portal">` at `left: 62.87%; top: 49.12%`. It is **also used by `components/hero-product/HeroProductExperience.tsx`**, so the file must stay.
* Scroll choreography was removed earlier in the project (see `Docs/2026-10-01-full-scroll-choreography-removal-plan.md`). The hero to product "iris portal" code in `BlueprintHero.tsx` (`portalState` at 62.87 / 49.12, `applyPortalClip`, `irisPortalRef`) is now **inert** (the portal elements are set to `autoAlpha: 0` and nothing scrubs them). Do not revive it. Do not remove it either; it is out of scope.
* `useSceneEngine` still exposes `isAperturePaused` (state). Keep passing it through as a pause flag.
* The site is single-theme light (`<html className="light ...">`, body `bg-[#FAF8F5] text-[#111613]`). Do not add dark-mode variants.
* Fonts come from `next/font/google` in `app/layout.tsx`: Manrope (`--font-manrope`) and DM Sans (`--font-dm-sans`). Tailwind `font-sans` is DM Sans.
* `lib/gsap.ts` exports `prefersReducedMotion`. `vitest.config.ts` runs `lib/**/*.test.ts` in jsdom.

### Contact

* `components/blueprint/BlueprintContact.tsx` (the `BlueprintContact` component, `return (` around line 369) renders `<section id="contact" ... className="relative w-full flex flex-col pt-8 sm:pt-10 lg:pt-20 pb-8 ... bg-[#FAF8F5] text-[#111613] select-none border-t border-black/[0.08]">`.
* Its first child is a pointer-events-none dot-grid wrapper (`z-0`, contains `parallaxBgRef`). Its second child is the `introViewRef` content wrapper (`relative z-10`) holding the headline "Ask us anything.", the "Let's connect" button, the Email / Location / Follow us column, and the footer bar (copyright, Privacy Policy, Terms of Service, Back to Top).
* The desktop layout switches to two columns at `lg:` (1024px), so `lg` is the breakpoint to use for the orbits too.
* The full-screen conversational mode (`mode === "interactive"`) is a separate fixed overlay below the section and is **not touched**.

### Working tree warning

The repo has **many uncommitted modifications by the user** (docs, `app/robots.ts`, `app/sitemap.ts`, `BlueprintContact.tsx`, `HeroScene.tsx`, `AboutScene.tsx`, `WaitlistForm.tsx`, and more). `HeroScene.tsx` shows as fully rewritten in `git diff` (most likely line endings). Therefore:

* Never run `git add -A`, `git checkout`, `git restore`, `git stash` or `git reset`.
* Edit only the files listed in section 6. Preserve each file's existing line endings and formatting. Do not run a formatter over whole files.
* Do not commit unless the user asks. Leave the changes in the working tree.

---

## 3. Assets and references (already added to the repo, do not regenerate)

### `public/hero-storyboard/` (artwork, ready to use)

Read `public/hero-storyboard/README.md` first. Summary:

| File | Purpose |
|---|---|
| `manifest.json` | Source size **904 x 412**, ring centre **(413, 229)**, ring outer radius **113**, edge feather (44, 36), and each layer's `id, file, kind, group, x, y, w, h` in source pixels, plus `drawOrder`. |
| `plate.webp` | Background plate (orbit lines, grid, dots, floor scribble). Opaque. Colour-matched to `#FAF8F5`. |
| `ring.webp` | The logo-coloured ring with the popped-out green segment. Transparent. |
| `card-mutual-funds.webp`, `card-insurance.webp`, `card-demat-right.webp`, `card-credit-cards.webp`, `card-epf.webp`, `card-demat-left.webp` | The six cards. Transparent. |
| `tile-1..4.webp`, `sphere-1..2.webp` | Small icon tiles and glass spheres. Transparent. |
| `poster.webp` | The settled composition with edge fade baked in. Used for first paint, reduced motion, and while layers load. |

Layer ids in `manifest.json`: `ring, mf, ins, dmr, cc, epf, dml, t1, t2, t3, t4, s1, s2`. The `ring`, `epf` and `dml` layers
belong to the `"ring-group"` and must move together (see section 5.4).

### `Docs/reference/hero-storyboard-reference.js`

The prototype's drawing code, extracted verbatim. It contains the easing helpers, the stroke/handwriting helpers, the layer
constants (`SRC`, `SCARD`, `SORD`, `SGRP`, `SMOT`, `SINS`) and `story4(c, w, h, t)`, the whole loop. **It is the source of
truth for timing, motion amounts and positions.** Port it to TypeScript; do not redesign it. Its header lists exactly what
to replace (colours, pointer, fonts, image loading) and what to drop (the review caption pill and the `BEATS` array).

### `Docs/reference/contact-orbits-reference.html`

Open it in a browser. It is the approved orbits design as pure SVG + CSS, with the desktop and mobile positioning rules and
every number already computed. Port it to a React component.

### Official logo files (for colour reference only)

`public/Logo/Unifolio Ring Logo.png`, `logo-ring-segment-green.png`, `logo-ring-solid-complete.png`. Measured colours:
black `#0F0F0F`, green `#12B047`. The green segment spans 12 to 3 o'clock, is about 2.8% larger in outer radius than the black ring,
and has a gap of about 0.05 rad at both ends. No change to these files.

### Known artwork issues (tell the user in the final report, do not silently fix)

1. The source is about 900 px wide, so it is soft on high-density or very large screens.
2. The AI-generated source has **garbled text on two cards**: `card-insurance.webp` reads "Insuraoce" and `card-demat-right.webp`
   reads "Dmat" or "Dnat". Both are baked into the pixels. Recommend replacing those two images (or covering the labels with live
   canvas text) before launch. Do not attempt to repaint them.
3. A tiny light notch where the ring meets the left demat card. Cosmetic.
4. The ring was recoloured in the image, so it is a little flatter than a rendered black ring.

---

## 4. Architecture

```
lib/heroStoryboard.ts            pure functions: placement math + timeline envelopes (unit tested)
lib/heroStoryboard.test.ts       vitest tests (seamless loop, placement, ring centre)
components/hero/HeroStoryboardVisual.tsx   client component: canvas, image loading, rAF loop, pause rules
components/blueprint/scenes/HeroScene.tsx  swap the visual, restructure mobile layout
components/blueprint/ContactOrbits.tsx     static SVG + CSS orbits, no JS
components/blueprint/BlueprintContact.tsx  render <ContactOrbits />
app/layout.tsx                              add the Caveat font (handwriting) via next/font/google
app/globals.css                             orbit keyframes + reduced-motion rule
```

`HeroApertureVisual.tsx` and the `.mp4` files are **left in place** (still used by `HeroProductExperience.tsx`).

---

## 5. Part A: Hero

### 5.1 `lib/heroStoryboard.ts` (pure, testable)

Export constants and two functions. No DOM access.

```ts
export const ART_W = 904;
export const ART_H = 412;
export const RING_CENTER: [number, number] = [413, 229];
export const LOOP_SECONDS = 11.6;
export const LOOP_OFFSET = 6.4;   // p = q + 6.4 maps the loop onto beats 04-07 of the original timeline
export const LOGO_GREEN = "#12B047";
export const LOGO_GREEN_DEEP = "#0E8C3A";

export type Placement = { sc: number; x0: number; y0: number; ringX: number; ringY: number; ringPctX: number; ringPctY: number };
export function computePlacement(w: number, h: number): Placement;
export function timeline(t: number): Timeline;
```

**`computePlacement(w, h)`** (w, h = CSS size of the visual container):

* **Wide mode** when `w >= 768`: `sc = min(w * 0.58 / ART_W, h * 0.98 / ART_H)`, `x0 = w - ART_W * sc - w * 0.015`, `y0 = (h - ART_H * sc) / 2`.
* **Stacked mode** when `w < 768`: `sc = (w * 1.12) / ART_W` (a small overscan so the art is not tiny on phones; the plate and poster already fade at the edges), `x0 = (w - ART_W * sc) / 2`, `y0 = (h - ART_H * sc) / 2`.
* `ringX = x0 + 413 * sc`, `ringY = y0 + 229 * sc`, `ringPctX = ringX / w * 100`, `ringPctY = ringY / h * 100`.

These are starting values from the prototype. Anti Gravity must tune them with screenshots (see acceptance criteria) but keep the function pure.

**`timeline(t)`** returns the envelope values used by the draw loop. Derive them from `story4` in the reference file, using
`q = t % LOOP_SECONDS` and `p = q + LOOP_OFFSET`:

| Value | Formula (from the reference) |
|---|---|
| `intro` | `clamp(t / 0.5)`, a one-time 0.5 s fade-in of the whole canvas (uses raw `t`, not `q`) |
| `dim` | `clamp(1 - .78*ease(clamp((p-11.4)/.9)) + .78*ease(clamp((p-15.2)/1)))` (cards fade back for the insights, then return) |
| `streamAlpha` | `lerp(.25, 1, ease(clamp(q/.8))) * (1 - .75*ease(clamp((p-11.4)/.8)))` |
| `dotAlpha` | `clamp((p-6.4)/.6) * (1 - clamp((p-11.4)/.6))` |
| `halo` | `clamp((p-6.4)/1) * (1 - clamp((p-12)/1.2))` |
| `scan` | `fio(p, 9, 11.8, .6)` where `fio(p,a,b,f) = clamp((p-a)/f) * clamp((b-p)/f)` |
| `insight[k]` k = 0..3 | alpha `ease(clamp((p-11.8-k*.5)/.8)) * (1 - ease(clamp((p-15.2)/.8)))`, progress `clamp((p-11.8-k*.5)/1.3)` |

**The loop must be seamless.** Add tests that `timeline(0)` and `timeline(LOOP_SECONDS - 1e-6)` agree (within 1e-3) on
`dim`, `streamAlpha`, `dotAlpha`, `halo`, `scan` and all four insight alphas (`dim` = 1, `streamAlpha` = 0.25, the others = 0).
Also test `computePlacement` for 1440 x 900, 1920 x 1080, 1024 x 768 and 390 x 240 (finite numbers, ring inside the container,
`ringPct` values between 0 and 100).

### 5.2 Fonts

The insight numbers are handwritten ("Caveat"). Add it in `app/layout.tsx`:

```ts
import { Manrope, DM_Sans, Caveat } from "next/font/google";
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });
// add `${caveat.variable}` to the <html> className next to manrope.variable and dmSans.variable
```

In the canvas component read the real family strings at runtime (next/font generates hashed family names):

```ts
const cs = getComputedStyle(document.documentElement);
const hand = cs.getPropertyValue("--font-caveat").trim() || "cursive";
const sans = cs.getPropertyValue("--font-manrope").trim() || "system-ui, sans-serif"; // the prototype drew the small insight labels in Manrope
```

Before the first draw that shows insights, call `document.fonts.load('700 30px ' + hand)` and `document.fonts.load('600 12px ' + sans)`
(use the first family in each stack if the whole stack does not load). Draw insights with the fallback until the promise resolves;
redraw when it does. Do not block the first paint on fonts.

### 5.3 `components/hero/HeroStoryboardVisual.tsx`

`"use client"`. Props: `{ isPaused?: boolean; onRingMounted?: (el: HTMLElement) => void }` (same shape as the old component).

Renders:

```tsx
<div className="relative w-full h-full select-none pointer-events-none overflow-hidden bg-[#FAF8F5]" ref={wrapRef}>
  <canvas ref={canvasRef} aria-hidden="true" role="presentation" className="absolute inset-0 w-full h-full" />
  {/* keep the portal anchor, now at the real ring centre */}
  <div ref={ringAnchorRef} id="hero-ring-portal" className="absolute pointer-events-none w-2 h-2" style={{ left: `${ringPctX}%`, top: `${ringPctY}%`, transform: "translate(-50%, -50%)" }} />
</div>
```

Behaviour:

1. **Loading.** Fetch `/hero-storyboard/manifest.json`, then create `Image` objects for `plate.webp`, `poster.webp` and every layer. Load `poster.webp` first and paint it immediately (it equals the settled composition, so there is no jump when layers take over). When every layer has loaded (`decode()` where available), start the layered render. If anything fails to load, keep showing the poster and do not throw.
2. **Sizing.** `ResizeObserver` on the wrapper. Canvas backing size = CSS size x `min(devicePixelRatio, 2)`; `ctx.setTransform(dpr,0,0,dpr,0,0)`. On resize recompute placement, re-position the anchor (`ringPctX/Y`), and redraw.
3. **Drawing.** Port `story4` from the reference to TypeScript, using `computePlacement` and `timeline`. Keep: the feathered plate (built once on an offscreen canvas with `destination-in` linear gradients using the manifest `feather` values), layer motion table `SMOT`, the ring-group moving as one piece (`ring`, `epf`, `dml` share one transform pivoting on the ring centre), streams (dashed quadratic curves from each card to the ring edge), travelling dots, halo, scan arc, four insights, pointer parallax. Replace the prototype's `C` with: ink `#111613`, muted `#5A685D`, card `#FFFFFF`, green `LOGO_GREEN`, deep `LOGO_GREEN_DEEP`. **Drop** the caption pill and the `BEATS` array.
4. **Time source.** Use `requestAnimationFrame`, accumulate elapsed seconds in a ref (so pause and resume do not jump), pass it as `t`.
5. **Pointer parallax.** The wrapper is `pointer-events-none`, so listen on `window` for `pointermove` (passive). Normalise to -1..1 relative to the canvas rectangle, smooth with the same 0.06 factor as the reference, and set active only while the pointer is inside the hero section. Disable on touch (`pointerType === "touch"`). Reduce amplitude to zero when reduced motion is on.
6. **Pausing.** Stop the rAF loop and keep the last frame when: `isPaused` is true; the document is hidden (`visibilitychange`); the hero is not intersecting (`IntersectionObserver`, threshold 0). Resume without a time jump.
7. **Reduced motion.** If `prefers-reduced-motion: reduce` (use `prefersReducedMotion` from `@/lib/gsap` or `matchMedia`), do not run the loop: draw one settled frame (`t = 10.4`, which is the "Settle into hero" state) and redraw only on resize.
8. **Cleanup.** Cancel rAF, disconnect observers, remove listeners on unmount.
9. **Accessibility.** The canvas is decorative (`aria-hidden`). The hero text already carries the meaning.
10. Call `onRingMounted(ringAnchorRef.current)` once, as the old component did.

### 5.4 Ring group and motion rules (do not change)

* `ring`, `epf` and `dml` are one rigid group: translate by `3*sin(.6t)`, `3*sin(.5t+1)` art px, rotate `.008*sin(.45t)`, scale `1 + .006*sin(.9t)`, pivot on `(413, 229)`. The cards overlap the ring in the pixels, so moving them independently shows gaps.
* All other layers float on their own using the `SMOT` table from the reference.
* Cards `mf, ins, dmr, cc` and tiles/spheres are dimmed by `dim`; the ring is never dimmed.

### 5.5 `HeroScene.tsx` changes

File: `components/blueprint/scenes/HeroScene.tsx`. Keep every exported type and ref. Keep `heroVisualRef` and `heroIntroRef`.

1. Replace `import { HeroApertureVisual }` with `import { HeroStoryboardVisual } from "@/components/hero/HeroStoryboardVisual"` and render `<HeroStoryboardVisual isPaused={isAperturePaused} />` inside `heroVisualRef`.
2. **Desktop and tablet (`md:` and up):** keep today's structure: the visual is `absolute inset-0` behind the text (`z-10`, `pointer-events-none`). Keep `transformOrigin: "62.87% 49.12%"` as is (inert; do not touch `BlueprintHero.tsx`). The art is placed on the right by `computePlacement`; it must not collide with the headline (see acceptance criteria). The negative translate classes on the text block can stay unless they cause a collision.
3. **Mobile (below `md`):** change to a vertical flow. The visual becomes a normal block on top: for example `relative w-full h-[clamp(200px,40svh,320px)] mt-16 md:absolute md:inset-0 md:h-full md:mt-0`. The text layer becomes a normal block underneath (`relative`, not absolute, `md:absolute md:inset-0`). The whole hero must still fit within one screen of `min-h-[100svh]` on a 390 x 844 phone: nav (about 64px), visual, headline, sub line and CTA. Remove `whitespace-nowrap` on the headline lines below `md` if they overflow, and remove the negative translate on mobile. Keep the same copy.
4. The section wrapper in `BlueprintHero.tsx` (`h-screen min-h-screen ... justify-center`) may need `h-auto min-h-[100svh]` on mobile. Make that single-line change only if required; note it in the report.
5. Read `Docs/2026-10-12-mobile-tablet-viewport-optimization-plan.md` (hero section) so the mobile change stays consistent with the existing mobile work. This change replaces that plan's "center the aperture ring on mobile" item for the hero visual.

---

## 6. Part B: Contact orbits

### 6.1 `components/blueprint/ContactOrbits.tsx`

A server-safe component (no hooks, no `"use client"`), pure SVG + CSS. Copy the markup and numbers from
`Docs/reference/contact-orbits-reference.html`. Structure:

```tsx
export function ContactOrbits() {
  return (
    <div aria-hidden="true" className="contact-orbits-clip pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      <div className="contact-orbits"> <svg viewBox="0 0 1000 1000" focusable="false" ...>{/* glow, 6 rings, tick group, 6 dots */}</svg> </div>
    </div>
  );
}
```

Key numbers (viewBox 1000 x 1000, centre 500, R = 270.27):

* Rings at radii `121.6, 189.2, 256.8, 324.3, 405.4, 500`, `fill="none"`, stroke `#111613` at opacity **0.07**, 1px, `vector-effect="non-scaling-stroke"` on every circle.
* Glow: radial gradient circle r = 459.5, green `#12B047` from opacity 0.10 at the centre to 0 at the edge.
* Ticks: two circles (r 326.3 / stroke 4 / dash `1.2 13.445` and r 328.8 / stroke 9 / dash `1.2 146.3`), stroke `#5A685D` opacity **0.28**, inside a group that spins once every 314 s.
* Six dots (r 2.7, opacity 0.75, alternating `#12B047` and `#111613`), each in its own group that rotates around (500, 500). Per-dot values:

| # | cx | colour | duration | direction | animation-delay |
|---|---|---|---|---|---|
| 0 | 621.6 | `#12B047` | 20.9s | clockwise | 0s |
| 1 | 689.2 | `#111613` | 31.4s | counter-clockwise (`reverse`) | -21.9s |
| 2 | 756.8 | `#12B047` | 44.9s | clockwise | -27.1s |
| 3 | 824.3 | `#111613` | 69.8s | counter-clockwise | -6.5s |
| 4 | 905.4 | `#12B047` | 104.7s | clockwise | -21.9s |
| 5 | 1000 | `#111613` | 125.7s | counter-clockwise | -61.3s |

### 6.2 CSS (in `app/globals.css`, or a scoped style)

```css
.contact-orbits{position:absolute;left:80%;top:50%;height:192%;max-height:111vw;aspect-ratio:1/1;transform:translate(-50%,-50%)}
@media (max-width:1023px){.contact-orbits{left:86%;top:86%;height:auto;max-height:none;width:214%;max-width:1400px}}
.contact-orbits svg{display:block;width:100%;height:100%;overflow:visible}
.orb{transform-box:view-box;transform-origin:500px 500px;animation:orbit-spin linear infinite}
.orb.ccw{animation-direction:reverse}
@keyframes orbit-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.orb{animation:none}}
```

Prefix the class names if they could clash with existing ones (for example `contact-orbit-spin`); check `globals.css` first.

### 6.3 Insert into `BlueprintContact.tsx`

Import `ContactOrbits` and render `<ContactOrbits />` **immediately after the dot-grid wrapper `div` and before the `introViewRef` div** (so it sits at `z-0` under the `z-10` content). Do not change anything else in that file: no handlers, no copy, no classes on the section. The orbits clip themselves (`overflow-hidden` on their own wrapper), so the section's overflow does not change. Do not touch the interactive `mode === "interactive"` overlay.

---

## 7. Acceptance criteria

### Hero (check at 390 x 844, 768 x 1024, 1024 x 768, 1440 x 900, 1920 x 1080)

1. No `<video>` element remains in the hero. Network tab shows no `.mp4` request on the home page load.
2. The animation starts fully assembled (ring and six cards visible, green streams faint), and loops every 11.6 s with **no visible jump** at the loop point. Watch two full loops.
3. Order per loop: streams brighten and green dots flow into the ring (04), a green scan arc circles the ring (05), the cards fade back and four insights write in around the ring (06), the cards return and everything settles (07).
4. The ring is near-black with a green segment that clearly sticks out past the black ring with a gap at both ends. No silver ring anywhere.
5. No visible rectangle, seam or colour mismatch around the artwork against `#FAF8F5`.
6. **No overlap between the artwork and the headline, sub line or CTA** at any listed size. If the artwork is too large, reduce `sc`; if too small, increase it (desktop ring outer radius should be at least 8% of viewport width; on mobile the ring outer diameter at least 25% of viewport width).
7. Mobile: the illustration is on top, the headline, sub line and CTA below, the whole hero fits one screen at 390 x 844 with no horizontal scroll. Insight text rendered at 10px or larger for labels and 15px or larger for numbers (apply a minimum font size in the canvas code; if it causes overlap on mobile, reduce the sketch icons beside the numbers, do not shrink the text).
8. `prefers-reduced-motion: reduce` shows a still settled frame and no animation.
9. Switching tabs, scrolling the hero out of view, and `isPaused` all stop the loop (confirm with the Performance panel: no rAF work while hidden). On return it resumes without a time jump.
10. `#hero-ring-portal` exists and sits on the ring centre (verify visually with a temporary outline).
11. No console errors or warnings. Font swap does not cause a layout shift (canvas only).

### Contact (check at 390 x 844, 768 x 1024, 1024 x 768, 1440 x 900)

12. At 1024px and wider the rings are centred about 80% across and 50% down the section and bleed off the right edge. Below 1024px the rings are centred in the bottom-right corner.
13. Only rings, faint ticks, the faint green glow and six small dots are visible: **no green arc and no dark arc**.
14. The rings are very faint (comparable to the outermost two rings in the reference). Headline, button, email, location, social icons and footer text are fully readable.
15. The orbits do not intercept clicks, hover or selection (`pointer-events: none`), and nothing else in the contact section changed (copy, spacing, the "Let's connect" flow still works end to end).
16. Reduced motion: dots and ticks do not move.

### Whole change

17. **Parity with the approved prototype.** Render the settled frame (reduced-motion still, or `t = 10.4`) at a 1440 x 900 viewport and compare it with `public/hero-storyboard/poster.webp`: same artwork, same ring, same card positions relative to each other, the pop-out green segment visible. Then watch one loop and confirm the four beats happen in the order and at the approximate times in section 5.1 (streams and dots 0 to 2.6 s, scan 2.6 to 5.4 s, insights 5.4 to 8.8 s, settle 8.8 to 11.6 s). Differences that come only from the container size or the missing caption pill are expected; anything else is a bug.
18. `npm run lint`, `npm test` (vitest, including the new `lib/heroStoryboard.test.ts`) and `npm run build` all pass. If any of them already failed before the change, report which and confirm no new failures.
19. Only the files in section 4 were modified or created. `git status` shows no other new changes beyond what was already modified before the task. No commit made.

---

## 8. Verification steps for the executor

1. Before starting: `git status --short` and save the output as the baseline. Take baseline screenshots of the hero and the contact section at the five widths above.
2. After each part, run `npm test` and `npm run lint`.
3. Run `npm run dev`, open the home page, and check the acceptance criteria with real screenshots. Use the browser's device emulation for the mobile sizes. Report the screenshots.
4. Run `npm run build` once at the end.
5. In the final report list: files created, files modified, the exact `computePlacement` constants used, any deviation from this plan and why, the known artwork issues (section 3), and open questions.

---

## 9. Out of scope

* Changing hero copy, nav, CTA behaviour, or any other section.
* The old hero to product iris portal code (inert; leave it).
* Deleting `HeroApertureVisual.tsx`, the `.mp4` files, or `CinematicVideoHero.tsx`.
* Dark mode, new accent colours, new fonts other than Caveat.
* Regenerating or repainting the artwork (replace later if the user supplies better source files).
* Re-introducing any scroll pinning, scrubbing or hijacking.

## 10. Open questions for the user (report, do not block on them)

* **Q1. Hero copy.** The mockups the user shared use "Understand your wealth. Not just see it." with a "See how it works" button, but the site and this plan keep "See everything you own. Understand what it means." and "Join the waitlist". Confirm which one launches.
* **Q2. Artwork source.** Is there a higher resolution original (ideally the ring, cards and tiles as separate transparent layers, with the two garbled labels fixed)? Dropping those files into `public/hero-storyboard/` and updating `manifest.json` upgrades quality with no code change.
* **Q3. Pop-out size.** The green segment sticks out about 4.5% in the ring image. Confirm it looks right against the real logo at full size.

## 11. Update after first review (2026-10-15, later)

These supersede the matching items above.

* **Colour:** the illustration's green is plain `#22C55E` everywhere (ring segment baked flat into `ring.webp`, plus the code-drawn streams, scan, halo, insights and the contact orbits). The `#12B047` in sections 1 and 3 is no longer used.
* **Ring:** a little thinner than before, still with the pop-out segment and gaps.
* **Card labels fixed in the images:** Insurance (was "Insuraoce"), Debt (was "Dmat"), Gold (was "Credit Cards"). Known artwork issue 2 is resolved. The "Gold" card still has the small credit-card icon.
* **Placement:** on wide screens the whole plate, including its faded right edge, is kept on screen with a 24 px margin (`WIDE_CONTENT_RIGHT = 904`, `WIDE_RIGHT_MARGIN = 24`).
* **Scope change by the user:** only the background changes. The text, nav bar, buttons and layout of the text are untouched, so the mobile restructure in section 5.5 (items 3 and 4) was cancelled.

