# Product section redesign: plan

Approved prototype: `Docs/reference/product-section-prototype.html` (open in a browser; the page is the artifact the user approved). Its `<script>` holds the canvas animation and the carousel logic, its `<style>` the layout. Source design: `Unifolio Website Redesign.pdf` pages 6 and 7.

## What changes

The `#product` section in `components/blueprint/BlueprintHero.tsx` (headline "Don't just see your wealth. Understand it." plus the five-card bento in `components/blueprint/scenes/ProductBentoScene.tsx` and the mobile `MobileProductCarousel.tsx`) is replaced by a new, lighter section:

1. Headline only: `From seeing your wealth to <green>understanding it.</green>` No small label, no subline.
2. An animated illustration (canvas), cut from the PDF mockup: six asset cards (Mutual Funds, Stocks, Bank Accounts left; Real Estate, PMS / AIFs, Gold right) feeding a laptop dashboard.
3. Three cards:
   - `01` TRACK, "See your whole *financial picture.*", "Bring mutual funds, stocks, real estate, gold and more together in one family-level view."
   - `02` ANALYSE, "Understand what's *really happening.*", "Go beyond portfolio value. Understand returns, uncover overlapping investments, and identify potential risks and hidden costs."
   - `03` PLAN, "Make your next move *with clarity.*", "Explore different scenarios, track your goals, and understand how today's financial decisions could shape your family's future."
   (the green part is the `<em>`). Each card has a small illustration bottom right that floats gently.

## Layouts

- Desktop and tablet: headline, illustration, then the three cards in one row (cards scale down on tablet; see the prototype's `@container (max-width:900px)` block).
- Phone (below 640px wide): the same headline and illustration (scaled), then the three cards as a swipeable carousel with prev/next arrows and pills. Behaviour must match the current `MobileProductCarousel.tsx` exactly: starts on card 1, auto-advances every 3000 ms (only while visible), tap-and-hold pauses and resumes from the same moment, a manual swipe restarts the 3 s wait, native smooth scroll, arrows move exactly one card (wrapping last to first and first to last). Reuse that component's timing logic (refs + rAF loop) rather than the prototype's setInterval version, and fix card positioning by measuring with `getBoundingClientRect` (not `offsetLeft`, which is relative to the wrong parent in the prototype). The user said: "carousel scroll time should be the same as the current horizontal scroll time for the cards carousel".

## Assets (already created, do not regenerate)

`public/product-storyboard/`: `plate.webp`, `layer-mf|st|ba|re|pm|go|lap.webp`, `card-ill-1|2|3.webp`, `manifest.json` (geometry in source pixels of a 1672x941 mockup: plate rect and each layer's x, y, w, h). The prototype embeds the same images as data URIs; read how it places them.

## Animation (port from the prototype, same look)

Canvas drawn at the plate's size (1070x328 source px, scaled to width, aspect 1070/328). Reuse the prototype's code for: plate drawing with the cream multiply and edge feather, the six cards floating and tilting (the MOT table), the dashed bezier arrows with travelling dots (ARR points), sparks, the rotating donut highlight arc, the chart line dot (CHART polyline), intro stagger, `prefers-reduced-motion` (draw a static settled frame), pause when off screen (IntersectionObserver), DPR handling, resize handling. Pattern to follow: `components/hero/HeroStoryboardVisual.tsx` and `lib/heroStoryboard.ts` (pure geometry in `lib/`, canvas in a component). Put pure helpers (bezier point, easing, layout maths) in `lib/productStoryboard.ts` with a vitest file `lib/productStoryboard.test.ts`.

## Files

- New: `components/product/ProductStoryboardVisual.tsx` (canvas), `components/product/ProductSection.tsx` (headline, visual, cards, phone carousel), `lib/productStoryboard.ts` + test, optional `lib/productCopy.ts` for the copy (keep copy in one place).
- Edit: `components/blueprint/BlueprintHero.tsx` (render the new section in `#product`), `app/globals.css` only if the styles cannot live in the component (Tailwind first), and remove now-unused imports.
- Fonts and colours: Manrope headings via the site's heading font variable, DM Sans body, green `#22C55E`, ink `#111613`, muted `#6B7A70`, section background `#FAF8F5`.

## Constraints and risks

- `ProductBentoScene` and its refs are also used by the Security and About choreography (`SecurityVaultScene`, `sceneTransitions.ts`, dock geometry reads `cardsClusterRef`). Do not delete or rewrite those files. Stop rendering the old product visuals, but keep whatever must stay mounted for other scenes working (for example keep `ProductBentoScene` mounted but hidden with `hidden`/`aria-hidden` only if grep shows other code needs its refs). Check with grep first and report what you kept and why.
- The `#product` id and the navigation to it (navbar, `unifolio-show-product` event, any `href="#product"`) must keep working.
- Nothing else on the page changes: hero, security, about, FAQ, contact, navbar, waitlist.
- Check `content/site.ts`, `lib/schema.ts`, `public/llms.txt` and `public/agents.txt` for the old product wording ("Don't just see your wealth") and report it (do not edit SEO files unless the wording appears as visible copy that must match).
- No new dependencies.

## Verification (no screenshots, no full build)

`npx vitest run`, `npm run lint`, `npx tsc --noEmit`. Do not commit.
