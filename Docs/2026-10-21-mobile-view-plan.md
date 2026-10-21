# Mobile view (phone) changes: plan

Approved prototype: `Docs/reference/mobile-view-prototype.html` (open in a browser: for each section it shows the mobile PDF mockup and our adjusted design, live, in a phone-width frame; read the injected CSS in `build`-time variants by inspecting the page source, search for `hero_css`-style blocks: each iframe's srcdoc has an extra `<style>` after the base CSS). Source: `Unifolio website mobile view.pdf` (pages 3 hero, 4 product, 5 security "discussed with Ayush" = no design, 6 about). PHONE ONLY: container/viewport below 640px (Tailwind `max-sm`). Desktop and tablet must not change at all.

## 1. Hero (phone only: reorder, nothing else)
File: `components/blueprint/scenes/HeroScene.tsx` (and `components/hero/HeroStoryboardVisual.tsx` / `lib/heroStoryboard.ts` only if the picture's placement maths must change; its phone placement currently puts the artwork at the TOP of the hero via `PHONE_TOP_PX` and the text block starts at `max-sm:pt-[calc(144px+49.2vw)]`).
New phone order, top to bottom: headline, line under it, Join the waitlist button, the sketch (storyboard canvas), then the six-state highlight block (`HeroHighlights`) centred below the sketch. Today the sketch is first and the text below it.
- Keep every size, font, copy, timing and the highlight block's look unchanged. No arrows, no progress bars, no row layout.
- Prototype values: headline `clamp(25px,7.2vw,32px)` centred with about 30px top padding, line centred with 10px top margin and 24px side padding, button 16px below the line, sketch area about 300px tall with about -26px top and -34px bottom margin (the canvas draws its artwork centred inside a 300px box), highlight block about 6px below the sketch, centred, 20px side padding.
- The hero is `max-sm:h-auto`: it is as tall as its content on phone. The sketch must stay clear of the fixed navbar (headline now sits right under it: keep enough top padding, about 96 to 108px total from the top of the hero).
- The canvas placement for phones is computed in `computePlacement` (`PHONE_MAX_WIDTH`, `PHONE_TOP_PX`): the artwork's absolute position is currently anchored near the top of the hero container. Change it so the artwork sits in its new slot between the button and the highlight block (for example make the canvas a normal-flow block on phone instead of `absolute inset-0`, with a fixed 300px height) and update `lib/heroStoryboard.ts` + its test accordingly. Wide and tablet placements must not change.

## 2. Product (phone only: no cards, no carousel)
File: `components/product/ProductSection.tsx` (+ `app/globals.css` if needed). Below 640px:
- Order: headline, the laptop sketch (`ProductStoryboardVisual`), then the three items stacked in ONE column, no carousel, no arrows, no pills, no auto-advance on phone.
- Each item is a plain row, NO card (no white background, border, shadow or radius): picture on the left (70px wide, vertically centred), then tag (`01 TRACK`), title (18px, green emphasis kept), body (13px). Row padding 18px 0, a thin divider (`border-top: 1px solid rgba(17,22,19,.09)`) between rows (none above the first), 76px picture column + 14px gap, side padding 20px. No chevron.
- Remove the phone-only carousel code (the rAF/interval loop, refs, `scroll-snap`, pills, arrows) from this component, or gate it so it is not rendered and not running on phone, but keep desktop and tablet exactly as they are (three cards in a row with their hover lift). If the carousel hook/pure helpers in `lib/productStoryboard.ts` become unused, leave them and their tests (do not break `lib/productStoryboard.test.ts`).

## 3. Security and About: no change on phone.

## Constraints
- Do not touch `HeroHighlights.tsx`, `TrustHighlights.tsx`, the Security and About components, the navbar, the waitlist, or SEO files. Preserve CRLF where files use it, small edits, no new dependencies, never run destructive git commands (`add -A`, `checkout`, `restore`, `stash`, `reset`) and do not commit; the tree has many uncommitted user changes.
- Verify with `npx vitest run`, `npm run lint`, `npx tsc --noEmit`. No screenshots, no `next build`. Report files changed, what you could not verify, and any risk to desktop/tablet.
