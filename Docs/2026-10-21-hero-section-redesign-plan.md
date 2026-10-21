# Hero section redesign: plan

Approved prototype: `Docs/reference/hero-section-prototype.html` (open in a browser; Desktop / Tablet / Phone switch, and a Highlight switch that holds any one of the six states). Its `<script>` holds the six highlight visuals and the cycling logic, its `<style>` holds the sizes and keyframes. Source: `Unifolio Website Redesign.pdf` pages 3 (design), 4 (copy) and 5 (the six highlight states).

## What changes (copy and the highlight block ONLY)
Everything else in the hero stays exactly as it is: the storyboard canvas (`HeroStoryboardVisual`), the layout and positioning in `components/blueprint/scenes/HeroScene.tsx` (desktop two columns, tablet full-height with the sketch in the upper part and the text block at the bottom, phone with the sketch on top), the Join the waitlist button, and the current position of the highlight block (under the button, `lg:translate-y-16`, `lg:w-[calc(100%+96px)]`, `max-sm:mt-4` plus the block's own `mt-7`).

1. Headline (replaces "See everything you own. Understand what it means."): `Your family's wealth,` / `understood.` on two lines, "understood." in green #22C55E. Keep the current h1 classes (sizes, weight, tracking); the two lines stay `whitespace-nowrap`.
2. Line under it (replaces "Track. Understand. Act with confidence."): `All your family's investments. Deeper insights. Smarter decisions.` Style A, approved by the user: bigger and bold and dark. Prototype values: font-weight 800, colour #26332B, letter-spacing -0.015em, line-height 1.35, size about 21px on desktop (`clamp(16px, ..., 21px)` in the prototype; use the existing responsive size ladder but one step larger, for example `text-base sm:text-lg md:text-xl lg:text-[21px]`), `max-w-[30ch]`.
3. The highlight block: replace the three "Locked" states with SIX states, each with a small animation, a heading and a line with green underlined key words. Same mechanics as today (slide in 320 ms, key-word underline draws, slide out 170 ms, pauses when the tab is hidden, off screen, or the aperture is paused), EXCEPT: every state stays exactly 3000 ms on desktop, tablet and phone (no underline-driven hold). Reduced motion: show state 1 fully drawn, no cycling.

### The six states (copy is final)
| # | Heading | Line (key words are the green underlined ones) |
|---|---|---|
| 1 | Your family's wealth, together. | Bring your family's investments into **one consolidated view**. |
| 2 | Protected at every step. | **TLS encryption** protects your data in transit, while **AES-256 encryption** safeguards it when stored. |
| 3 | Know how your wealth is performing. | See portfolio performance **in context**, not just the numbers. |
| 4 | Your data, under your control | You control how your financial accounts are connected and can manage access. Built for **India's DPDP Act**. |
| 5 | See the risks you might miss | Spot **overlapping investments**, concentrated exposure and potential portfolio blind spots. |
| 6 | Make your next move with clarity | Explore **financial scenarios** and understand how today's choices could shape your family's future. |

Key-word underlines: the i-th underline on a state starts 500 + i x 650 ms after the state appears and takes 700 ms (see `.kw` in the prototype and `.trust-kw` in `app/globals.css`).

### The six visuals (port from the prototype, same look and timing; all green is #22C55E, ink #111613)
1. Three small account chips (bars, line, bank) curve into one ring; the ring's green arc fills a quarter more on each arrival, then pulses with a ripple. Loop 4.2 s.
2. A phone box, a line with two green packets and a lock in the middle, and a store box whose small lock badge turns green with a ripple. Loop 3.8 s (packets 2.4 s).
3. A dashed benchmark line, a green performance line that draws (a dot rides it via SMIL `animateMotion`), a soft green area under it fading in, and a `+12.4% vs index` pill popping in. Loop 3.8 s.
4. A toggle that switches from on to off with "Access on" fading to "Access stopped". NO badge, NO DPDP pill (the user removed it). Loop 3.8 s.
5. Five small holding tiles (pie, bars, line, bars, building) with a glowing green rounded-square highlighter that hops along them one by one, rests on the last, fades and repeats. Scan only: no matching, no arc, no equals sign. Loop 6.4 s.
6. Five stepping stones (white with ink outline) and a small marker that hops from stone to stone with a little arc; each stone it lands on turns green; on the last stone a flag rises and waves with a ring. Loop 6.4 s.
Motion is deliberately calm (the user asked for subtle). Keyframes cannot be expressed in Tailwind: add them to `app/globals.css` with a `hero-hl-` prefix (follow the `trust-*` and `product-ill-*` blocks) and turn them off under `prefers-reduced-motion`.

### Sizes and spacing (match the current block)
Visual row: height 30px, `-translate-y-3`, scaled 1.2 (origin left on lg, centre below). Heading: 24px on phone, 27px otherwise, weight 800, tracking -0.035em, `mt-3`. Line: 16px (18px from md), weight 700, colour #3A473E, `mt-1.5`, `max-w` about 44ch (lines now wrap to two or three; the block must have a FIXED min-height so nothing jumps when states change: about 178px on desktop, 196px tablet, 214px phone, tune against the longest state). Centred on tablet and phone, left aligned on lg. Check that the taller block does not push the hero content off screen or overlap the sketch on desktop (the user wants the headline, line and button to stay where they were).

## Files
- New: `components/hero/HeroHighlights.tsx` (the six-state block; do NOT edit `HeroTrustHighlights.tsx`, it is still used by the Security section with its own three states), `lib/heroHighlights.ts` (states data, timing constants, key-word schedule; pure) and `lib/heroHighlights.test.ts` (vitest: six states, copy exactly as in the table, timing constants, key-word schedule).
- Edit: `components/blueprint/scenes/HeroScene.tsx` (headline, line, swap `HeroTrustHighlights` for `HeroHighlights` with the same wrapper classes and the `isPaused` prop), `app/globals.css` (keyframes).
- Do not touch: `HeroTrustHighlights.tsx`, `lib/trustHighlights.ts`, the Security section, the Product section, `HeroStoryboardVisual.tsx`.

## Constraints
- Preserve CRLF where files use it; small edits; no new dependencies; fonts and colours as on the site (Manrope headings via `font-heading`, DM Sans body).
- Check `content/site.ts`, `lib/schema.ts`, `public/llms.txt`, `public/agents.txt` and page metadata for the old hero wording ("See everything you own", "Track. Understand. Act with confidence") and REPORT any hit; do not edit SEO files.
- Accessibility: keep a visually hidden list of all six states (heading + plain line) like `HeroTrustHighlights` does, and `aria-hidden` on the animated copy.

## Verification (no screenshots, no full build)
`npx vitest run`, `npm run lint`, `npx tsc --noEmit`. Do not commit.
