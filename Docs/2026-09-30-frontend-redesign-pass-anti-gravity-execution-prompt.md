You are implementing a front-end redesign pass on the Unifolio marketing site. Full diagnosis, exact code excerpts, and reasoning for every item live in `Docs/2026-09-30-frontend-redesign-pass-plan.md` — read it first. This prompt is the sequenced execution checklist.

**Ground rules — read before starting:**
- Work through Tasks 1–5 in order. Commit after each one. Do not start a task until the previous one has been manually verified against its own repro/verify steps in the plan doc.
- **Stop after Task 5.** Tasks 6 and 7 in the plan doc are confirmed in direction and fully documented, but are their own separate sessions — do not start them now. Task 6 additionally needs its own dedicated sub-plan written first (file-by-file inventory of what to delete/keep/re-platform in `BlueprintHero.tsx`), per its own notes in the plan doc.
- Do not change GSAP timing, easing, colors, or positions anywhere except where a task explicitly calls for it.
- No automated visual regression tooling — verify every task with `npm run dev` + manual resize/interaction, per each task's own "Verify" step.
- If a task's verify step reveals a problem the plan didn't anticipate (e.g. Task 1's Tile 2 heading crowding the illustration), use your judgment to adjust within that task's stated intent — don't silently skip the task, and don't block on asking permission for small in-scope adjustments.

---

**Task 1 — Standardize bento box font sizes**
File: `components/blueprint/BlueprintHero.tsx`, bento tile JSX (~lines 8222–8519)
Set all 5 tile headings (`<h3>`) to `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)`. Set all body/item text (`<p>`) to `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)`.
Test: resize through 1024/1280/1366/1440/1920px in the bento section — no overflow/wrap, Tile 2's heading doesn't crowd its illustration (adjust that one tile's multiplier down if it does), all 5 tiles now read at consistent weight.

**Task 2 — Increase Security-page vault size**
File: `components/blueprint/BlueprintHero.tsx`, `computeDockLayout()`, the `effectiveVaultW` block (~lines 1620–1631)
Replace the desktop/tablet/mobile clamp constants:
```ts
const effectiveVaultW = isDesktopScreen
  ? Math.round(Math.min(600, Math.max(460, Math.min(liveH * 0.62, liveW * 0.42))))
  : isTabletScreen
  ? Math.round(Math.min(440, Math.max(360, Math.min(liveH * 0.52, liveW * 0.52))))
  : Math.round(Math.min(340, Math.max(260, Math.min(liveH * 0.42, liveW * 0.78))));
```
Do not touch `headingW`, `gap`, or the `compW > maxCompW` shrink-safety-valve logic just below it — that mechanism already keeps the text panel from breaking as the vault grows.
Test: scroll into Security at 1920×1080, 1440×900, 1366×768, 1280×800, 1024×768, 390×844 — vault is visibly bigger/more prominent at every one, text never overlaps or clips.

**Task 3 — Keep the Unifolio logo static while the vault disc rotates**
File: `components/blueprint/SafeVault3D.tsx` (~lines 304–347)
Move the "Clean White Core Hub with Crisp Unifolio Ring Logo" `<div>` out from being a child of `discRef`'s div to being its sibling instead, still inside `closedDoorGroupRef`, with identical `left/top/transform` centering styles. Leave `sketch-vault-disc.png` as the only child of `discRef`.
Test: scroll through all Security ring sub-states forward and backward — dial/disc rotates, logo stays upright and still. Also check vault open/close still looks correct.

**Task 4 — Redesign nav icons in the site's hand-inked style**
File: `components/blueprint/BlueprintNav.tsx`, `NavSketchIcon` (~lines 23–338)
Redesign each of the 5 icon branches to the new silhouettes below, using the component's *existing* hand-inked pen conventions (`inkStroke`/`hatchStroke`/`guideStroke`/`watercolorTint`/`watercolorDeep`/`paperBack` variables, ~1.5–1.8 stroke width, cross-hatch shadow marks, light watercolor wash, green accent dot on hover/active) — do **not** copy a flat/filled icon style:
- `product` → bento/dashboard grid (small rounded-rect tiles in a grid)
- `security` → shield with a small padlock
- `about` → three overlapping circles
- `faq` → circle with a question mark
- `contact` → rounded chat/speech bubble
Keep each icon's existing render size (check each branch's current `className` for its exact `w-[Npx] h-[Npx]` and preserve it).
Test: check nav at desktop and mobile widths, hover/active states swap to green correctly, no icon overflows its clickable area.

**Task 5 — Update About-page copy**
Files: `content/about.ts`, `components/sections/FounderStory.tsx` (~lines 51–59)
In `content/about.ts`, change `heading` to `"In most families, someone ends up in charge of the money."`, add a new `headingAccent: "Not because they trained for it. Because someone has to."`, change `intro` to `"Unifolio brings the whole family's finances into one place, and helps you actually understand them."` Leave `story` and `values` untouched.
In `FounderStory.tsx`, render the new `headingAccent` as a line between the heading and intro:
```tsx
<p className="mt-4 font-serif text-xl sm:text-2xl text-[#1C241E]/70 leading-snug">
  {content.headingAccent}
</p>
```
Test: check `/about` at mobile/tablet/desktop — three-tier heading (heading, accent line, intro) reads clearly with no awkward wrapping.

---

When done with Tasks 1–5, summarize what was changed per task (same format as prior rounds) so the user can do a manual pass, and stop there — do not proceed to Tasks 6/7 from the plan doc without the user explicitly asking to continue.
