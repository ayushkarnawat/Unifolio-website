# Security section redesign: plan

Approved prototype: `Docs/reference/security-section-prototype.html` (open in a browser; it is the artifact the user approved, with a Desktop / Tablet / Phone switch). Its `<script>` holds the vault canvas, the "money" banknote animation, the trust block and the phone carousel; its `<style>` holds the layout. Source design: `Unifolio Website Redesign.pdf` pages 9 (design) and 10 (copy).

## What changes

The scroll-driven `#security` section in `components/blueprint/BlueprintHero.tsx` (pinned vault via `SecurityVaultScene.tsx` / `SecurityVaultSlot` / `SafeVault3D`, the scroll states, and the separate phone dock `MobileSecuritySection.tsx`) is replaced by ONE static section. No scroll hijacking, no pinned or sticky behaviour.

### Content (copy page, exact)
1. Headline: `We take your data as <green>seriously</green> as you take your money.` No small label, no line under it. The word "money" keeps the existing animation (see below).
2. Four principles in a 2 x 2 grid, each a small animated icon, a bold title and one line:
   - Read only, always: "Unifolio can view your connected accounts, never move your money."
   - We never save your passwords: "Your credentials stay secure. We access your financial data without needing your passwords."
   - We don't sell your data: "Your financial data is used to provide your financial insights, not sold for advertising."
   - Stored in India: "Your data stays on secure infrastructure based in India, meeting RBI's data localisation requirements." (note "RBI's", the PDF has a typo)
3. The hero's trust block (Locked at rest / Locked in transit / Locked to you), centred, floating on the page with NO card, border or background. Same wording and same timing as the hero. It STAYS in the hero too (the user will replace it there later), so build it as a reusable component and use it in both places; do not delete or alter the hero's behaviour.

### Layout
- Desktop (container >= 900px): two columns. Left: the vault canvas, vertically centred against the right column. Right: headline, then the 2 x 2 principles (hairline dividers between cells, see prototype). Below both: the trust block centred.
- Tablet (640 to 900px): headline, vault (max width about 560px, centred), principles 2 x 2, trust block.
- Phone (below 640px): headline, vault, then ONE centred block that is a horizontal carousel of 7 slides: the four principles first (icon on top, title, text), then the three Locked states. Auto-advances every 2500 ms, every slide the same dwell, no dots/pills/arrows, swipe works, tap-and-hold pauses and resumes from the same moment, a swipe restarts the wait, native smooth scroll, starts on slide 1, runs only while visible. Trust-slide visuals (balance masking to dots then lock badge, transit packets, consent toggle) restart each time their slide becomes active. The DPDP sentence wraps to two lines on phone at the same font size as the other slides; on desktop and tablet it stays on one line. Reuse the timing/measuring approach of `components/product/ProductSection.tsx` (rect-based card centring, rAF or interval loop) and `MobileProductCarousel.tsx`.

## Assets (already created, do not regenerate): `public/security-storyboard/`
`plate.webp` (vault door, hinge, handwriting "Your data stays protected. Always.", with cards/dots/ticks removed), `layer-mf|st|ba|re|pm|go.webp` (six asset cards), `layer-wheel.webp` (elliptical annulus around the logo; geometry cx, cy, rx, ry in `manifest.json`), `icon-eye|lock|no-sell|shield.webp` (240px square, cut from the user's pencil sketches), `manifest.json` (source size 1536 x 1024; plate rect, each layer's x, y, w, h; dot positions). The prototype embeds the same images as data URIs and contains the streak curves (STR), tick marks (TICKS) and motion tables, so port them from there.

## Animation (port from the prototype, same look)
- Vault canvas (aspect 706/652, plate-sized): plate with cream multiply and 40px / 34px edge feather; wheel rotating slowly in the door's perspective (`translate(centre) scale(1, ry/rx) rotate(a) scale(1, rx/ry)`, a about +-0.16 rad, slow); soft green glow pulse behind the logo; six green dashed streaks flowing from the door to each card with travelling dots; six cards floating and tilting; pings on the dots; flickering tick marks; intro stagger; `prefers-reduced-motion` draws one settled frame; pause when off screen or tab hidden; DPR capped at 2; resize handling. Follow `components/product/ProductStoryboardVisual.tsx` and `lib/productStoryboard.ts` (pure helpers in `lib/`, canvas in a component, vitest for the pure maths).
- "money" word: port the prototype's timeline of the existing site animation (letters fold into a banknote, two more bills fan out, flutter, hold, fold back, letters return). It must loop every few seconds while the section is on screen (about 6.4 s cycle, 1.2 s rest), and the original SVG bill (defs `unifolio-money-bill`) is in `SecurityVaultScene.tsx` around line 5280 and in the prototype. Bill size: 1.15em tall.
- Icons (CSS keyframes, reduced-motion off): eye blinks then glances left/right; padlock rattles; no-sell pulses and tilts with a green ring expanding behind it; shield rises and glows green (a gentle pulse, no ring). Sizes: 40 to 52px on desktop (clamp), 60px on the phone slides.

## Files
- New: `components/security/SecuritySection.tsx` (section, headline, principles, phone carousel), `components/security/SecurityVaultVisual.tsx` (canvas), `components/security/MoneyWord.tsx` (headline word animation), `lib/securityStoryboard.ts` + `lib/securityStoryboard.test.ts`, `lib/securityCopy.ts` (all copy in one place), `components/hero/TrustHighlight` extraction: reuse `lib/trustHighlights.ts` and `components/hero/HeroTrustHighlights.tsx`; if a centred, static-card-less variant needs a prop (for example `align="center"`), add it without changing the hero's current look.
- Edit: `components/blueprint/BlueprintHero.tsx` (render `<SecuritySection />` in `#security`, remove the old desktop/mobile security markup), `app/globals.css` only for keyframes that Tailwind cannot express (follow the `product-ill-*` rules already there), unused imports.
- Fonts and colours: Manrope headings via the site's heading variable (`font-heading`), DM Sans body, green #22C55E, ink #111613, muted #6B7A70, section background #FAF8F5.

## Constraints and risks
- `SecurityVaultScene` and the engine files (`sceneTransitions.ts`, `useSceneEngine.ts`) are shared with About/Hero. Do not delete or rewrite them. Stop rendering the old security visuals; keep mounted-but-hidden (`hidden` + `aria-hidden`) whatever other scenes still read via refs, exactly as was done for `ProductBentoScene` (see the product plan, "Constraints and risks"). Grep before hiding, and report what you kept and why. Check that no scroll lock, wheel handler or pinned/sticky state remains active for security (the hero and about transitions must keep working).
- `#security` id, nav link to it, and any `unifolio-show-security` style event must keep working. Use `scroll-mt` for the navbar the same way the Product section does (about `scroll-mt-20 sm:scroll-mt-[88px]`), and keep the top padding modest (the user asked for less space on Product).
- Nothing else changes: hero, product, about, FAQ, contact, navbar, waitlist. `MobileSecuritySection.tsx` has uncommitted user edits: leave the file on disk, just stop rendering it.
- Check `content/site.ts`, `lib/schema.ts`, `public/llms.txt`, `public/agents.txt` for old security wording and report it; do not edit SEO files.
- No new dependencies.

## Verification (no screenshots, no full build)
`npx vitest run`, `npm run lint`, `npx tsc --noEmit`. Do not commit.
