You are making two changes to the Unifolio marketing site (Next.js 14, Tailwind, React 18, vitest). Both designs were already approved by the user as interactive prototypes, and everything you need from those prototypes has been copied into this repo. Do not redesign anything.

**Read first, in this order:**
1. `Docs/2026-10-15-hero-storyboard-contact-orbits-plan.md` (the full plan, decisions, acceptance criteria. Follow it.)
2. `public/hero-storyboard/README.md` and `public/hero-storyboard/manifest.json` (the artwork layers and their geometry. They are already in the repo. Do not regenerate or edit the images.)
3. `Docs/reference/hero-storyboard-reference.js` (the approved drawing code and timing for the hero loop, verbatim from the prototype. Its header says what to replace and what to drop.)
4. `Docs/reference/contact-orbits-reference.html` (the approved Contact orbits design as SVG + CSS. Open it in a browser.)
5. `Docs/2026-10-12-mobile-tablet-viewport-optimization-plan.md` (hero section only, so the mobile change stays consistent.)

**Change 1: Hero.** Replace the hero video with a canvas-drawn animated illustration.
- It is the "Your storyboard" concept: a near-black ring with a green segment that pops out past the ring (already baked into `ring.webp`, official logo colours `#0F0F0F` and `#12B047`), surrounded by floating app cards, on the site's cream `#FAF8F5`.
- Loop **only storyboard states 04 to 07** (Everything connects, Processing and analysis, Key insights emerge, Settle into hero). It starts fully assembled and the loop must be seamless: loop length 11.6 s and the last frame equals the first.
- Build it as `components/hero/HeroStoryboardVisual.tsx`, backed by pure, unit-tested helpers in `lib/heroStoryboard.ts` (placement math and timeline envelopes, with `lib/heroStoryboard.test.ts`, including a test that the loop is seamless). Port `story4` from the reference file to TypeScript. Keep its timing, motion table and positions. Drop its review caption pill and `BEATS` array.
- Wire it into `components/blueprint/scenes/HeroScene.tsx` in place of `HeroApertureVisual`, keeping the `isPaused` prop (pass `isAperturePaused`), the existing refs, and a `#hero-ring-portal` anchor positioned at the real ring centre. Do **not** touch `BlueprintHero.tsx` unless the single mobile wrapper change in the plan (section 5.5, item 4) is truly required.
- Mobile (below `md`): the illustration goes on top and the headline, sub line and CTA below it, fitting one screen at 390 x 844. Desktop and tablet keep the visual behind and to the right of the text, with no overlap between artwork and text. Hero copy stays exactly as it is.
- Add the Caveat font (weights 600 and 700, CSS variable `--font-caveat`) in `app/layout.tsx` via `next/font/google`, and read the real family names at runtime for the canvas. See plan section 5.2.
- Loading: paint `poster.webp` first, then switch to the layered render when all layers have loaded. Respect `prefers-reduced-motion` (one still frame), pause when hidden, off-screen or `isPaused`, cap devicePixelRatio at 2, and clean up everything on unmount.
- Leave `components/hero/HeroApertureVisual.tsx` and all `.mp4` files in place (another component still uses them).

**Change 2: Contact orbits.** Add a faint orbits background to the `id="contact"` section in `components/blueprint/BlueprintContact.tsx`.
- New component `components/blueprint/ContactOrbits.tsx`: pure SVG + CSS, no JavaScript, copy the numbers from the reference HTML and plan section 6. **Only faint rings** (stroke `#111613` at 0.07 opacity), very faint ticks, a soft green glow, and six tiny dots circling slowly. **No green arc and no dark arc.**
- Desktop (1024px and wider): ring centre at 80% across and 50% down the section, bleeding off the right edge. Mobile and tablet (below 1024px): ring centre in the **bottom-right corner** (86% across, 86% down).
- Render `<ContactOrbits />` right after the dot-grid wrapper and before the `introViewRef` content div, at `z-0`, `pointer-events-none`, clipped by its own `overflow-hidden` wrapper. Change nothing else in the contact section (copy, spacing, handlers, the interactive "Let's connect" flow). Add the keyframes and the reduced-motion rule to `app/globals.css`.

**Hard rules:**
- The working tree has many uncommitted changes by the user. Never run `git add -A`, `git checkout`, `git restore`, `git stash` or `git reset`. Edit only the files named in plan section 4. Preserve each file's existing line endings and formatting; do not reformat whole files. Do not commit.
- The site is single-theme light. No dark-mode variants. Keep the site accent green `#22C55E` for buttons and links. Use `#12B047` only for the illustration and orbits.
- No scroll pinning, scrubbing or hijacking. Do not revive or remove the inert iris-portal code in `BlueprintHero.tsx`.
- Do not repaint or regenerate the artwork. If something about it is wrong, report it.
- If something in the plan is ambiguous or conflicts with the code, make the smallest reasonable choice, note it in your report, and keep going. Do not stop to ask unless it is a blocker.

**Verify before reporting:** run `npm test`, `npm run lint` and `npm run build`. Run `npm run dev` and check every acceptance criterion in plan section 7 with real screenshots at 390 x 844, 768 x 1024, 1024 x 768, 1440 x 900 and 1920 x 1080 (hero and contact section), including: no video requests, seamless loop over two full loops, no overlap with the headline, mobile order (illustration then text), reduced motion, pause when hidden, readable contact text, nothing else changed.

**Final report must list:** files created and modified; the exact placement constants you ended up with; any deviation from the plan and why; test, lint and build results (and which of them already failed before your change, if any); the known artwork issues from plan section 3 (resolution, the two cards with garbled text, the small notch, the flatter recoloured ring); and the open questions in plan section 10 (hero copy, higher-resolution source artwork, pop-out size).
