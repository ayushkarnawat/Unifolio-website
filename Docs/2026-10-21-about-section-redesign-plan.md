# About section redesign: plan

Approved prototype: `Docs/reference/about-section-prototype.html` (open in a browser; Desktop / Tablet / Phone switch). Its `<script>` holds the illustration canvas and the one-line text fitting, its `<style>` the layout. Source: `Unifolio Website Redesign.pdf` pages 11 (design) and 12 (copy). The illustration is NOT the PDF's: it is the user's own sketch (four family members around a shared dashboard), cut into layers in `public/about-illustration/`.

## What changes
The scroll-driven `#about` section in `components/blueprint/BlueprintHero.tsx` (tall `h-[150vh]/[175vh]/[220vh]` section with a sticky viewport, `AboutBackgroundSlot`, `AboutEnvelopeSlot`, the envelope that unfolds into editorial text, driven by `AboutScene.tsx`) is replaced by ONE static section with no scroll choreography.

### Content (page 12 copy, final)
1. Headline, two lines: `Your family's wealth is connected.` (ink) / `Your understanding should be, too.` (green #22C55E).
2. Line under it: `Unifolio brings your family's finance together, helping you see the bigger picture.`
3. The illustration (see below).
4. Closing statement, centred below, joined to the illustration by a short dotted vertical line (1.5px dotted #9AA59D): heading `Better clarity.` (ink) `Smarter decisions.` (green), line `Understand what you own, what's working, and what comes next.`, and a green hand-drawn underline (SVG path, stroke #22C55E 2.4px) that draws in once when the block scrolls into view (1.1 s, 0.2 s delay).
No small label ("THE BIGGER PICTURE") and no other text.

### One-line rule (user requirement)
The line under the headline and the line under "Better clarity. Smarter decisions." should each stay on ONE line wherever possible on desktop, tablet and phone: shrink the font to fit the available width down to a minimum (14px for the first, 11px for the second), and only wrap if it would go below the minimum (see `fit()` in the prototype: measure with `scrollWidth`, `white-space:nowrap`, reset on resize and after fonts load). Implement with a small hook and ResizeObserver. On tablet (container 641 to 900px) the headline size is `4.8cqw`-equivalent so BOTH headline lines, including "Your understanding should be, too.", stay on one line (use a ResizeObserver-measured size or `vw` units; the prototype uses container units).

### Layout (match the prototype)
- Desktop (container >= 900px): grid with columns .82fr / 1.18fr; left: headline (bottom aligned) over the line; right: the illustration (about 112% of its column, margin-left -2%, aspect 1330/800, vertically centred across both rows); closing statement spans below, centred. Headline size `clamp(26px, 3.7vw, 46px)`, weight 800, tracking -0.04em, line-height 1.08, `font-heading`.
- Tablet (640 to 900px): everything stacked and centred: headline, the line, the illustration (max width 700px), closing statement.
- Phone (below 640px): same stacked order; headline `clamp(28px, 6.4vw, 44px)`.
- Section padding modest, like Product and Security (`pt-[clamp(40px,4.5vw,72px)]`, `scroll-mt-14 sm:scroll-mt-12`), background #FAF8F5, no overflow clipping of the illustration glow.

## Illustration (port from the prototype)
Assets in `public/about-illustration/` (`manifest.json` lists each layer's x, y, w, h in picture coordinates; view box x100 y120 w1330 h800): `person-p1.webp` (man with phone), `person-p2.webp` (woman with laptop), `person-p3.webp` (man with house), `person-p4.webp` (woman with goals checklist), `dashboard.webp` (centre). Each is drawn with `globalCompositeOperation = 'multiply'` so its paper-white blends into the page.
Canvas animation, calm (the user approved this level): intro stagger (dashboard first, then people, 0.16 s apart, 0.9 s ease); each layer floats with small sine motion and tiny rotation (MOT table in prototype); breathing green glow behind the dashboard; four dashed dark-green curves (STR) flowing from each person to the dashboard with a travelling white/green dot; a soft green ellipse ring on the dashboard when a dot arrives; a green arc highlight circling the dashboard's donut at (722, 492) r 47; a small expanding ping at each person's device (DEV). Draw order and constants are in the prototype script. Follow `components/product/ProductStoryboardVisual.tsx` and `lib/productStoryboard.ts` (pure helpers in `lib/`, canvas in a component, vitest for pure maths, DPR capped at 2, ResizeObserver, IntersectionObserver pause, hidden-tab pause, reduced motion draws one settled frame, canvas has `role="img"` and an `aria-label`).

## Files
- New: `components/about/AboutSection.tsx` (section, headline, line, closing statement, fit hook), `components/about/AboutIllustration.tsx` (canvas), `lib/aboutIllustration.ts` + `lib/aboutIllustration.test.ts` (geometry matches the manifest, bezier points, easing, motion table), `lib/aboutCopy.ts` (all copy in one place).
- Edit: `components/blueprint/BlueprintHero.tsx` (render `<AboutSection />` in `#about`, remove the old tall sticky markup and imports), `app/globals.css` only if a keyframe is needed (the underline can be a CSS transition class or inline SVG animation).

## Constraints and risks (read carefully)
- `AboutScene.tsx`, `AboutEnvelopeSlot`, `AboutBackgroundSlot` and the engine files (`sceneTransitions.ts`, `useSceneEngine.ts`) are wired into `BlueprintHero.tsx`'s setup (resize reflow, scene bridges, `unifolio-show-about` navigation, refs such as `unifiedEnvelopeRef`, `philosophyDocRef`, `aboutContentRef`, `cardsClusterRef`). Do NOT delete or rewrite them. Stop rendering the old About visuals and keep mounted-but-hidden (`hidden` + `aria-hidden`) only what other code still reads, exactly as done for Product and Security (see their plans). Grep before hiding and report what you kept and why.
- Find and remove (or confirm inert) any scroll lock, pin, ScrollTrigger scrub, or wheel/touch handler that belongs to the About section. Report what you found.
- The sticky/tall section may be relied on by the navbar active-section logic or the footer; verify the `#about` id, nav link, `unifolio-show-about` event and any `href="#about"` keep working with a normal-height section. The old section was 150 to 220vh tall: check nothing else measures it.
- Keep `scroll-mt` so the navbar does not cover the headline when jumping to `#about`.
- Nothing else changes: hero, product, security, FAQ, contact, navbar, waitlist. `MobileProductCarousel.tsx` and other files with uncommitted user edits stay on disk untouched.
- Check `content/site.ts`, `lib/schema.ts`, `public/llms.txt`, `public/agents.txt` for the old About wording and REPORT hits; do not edit SEO files.
- No new dependencies. Preserve CRLF where files use it; small edits.

## Verification (no screenshots, no full build)
`npx vitest run`, `npm run lint`, `npx tsc --noEmit`. Do not commit.
