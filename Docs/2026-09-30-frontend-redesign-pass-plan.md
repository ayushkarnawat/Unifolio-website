# Frontend Redesign Pass — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 7 front-end changes the user requested in one sitting, ordered smallest/safest first. The first 5 tasks (Phase 1) are mechanical, low-risk, and independently verifiable — do these now. The last 2 tasks (Phase 2) are the two the user explicitly called "big changes... completely redoing changes" — both are now fully confirmed in direction and planned here, but **do not start them until Phase 1 is merged and confirmed live**, and treat each as its own separate work session (Task 6 in particular needs its own sub-plan written first, per its own notes below, given its size).

**Tech stack:** Next.js 14 / React 18 / GSAP 3, Tailwind. No new dependencies needed for Phase 1. Phase 2 Task 7 (waitlist modal) needs no new dependency either — build it with plain React state + existing Tailwind/Button primitives, no headless-UI/Radix install required unless anti-gravity judges it genuinely saves time.

**Verification method (matches this repo's established pattern — see `Docs/2026-09-22-glitch-fixes-implementation-plan.md`):** no automated visual regression. Every task is verified by `npm run dev` + manual resize through breakpoints. No task changes GSAP timing/easing outside of what Task 6 explicitly calls for.

## Confirmed decisions (both now signed off by the user)

1. **About-page copy** (Task 5): the typed wording is the copy source of truth — confirmed. The attached mockup was styling reference only.
2. **Cross-section transition removal, mental model** (Task 6): confirmed — stop hijacking the scroll wheel; native browser scroll takes over; ambient/in-section animations stay exactly as they are. One nuance surfaced when confirming this (see Task 6 below): the Product section's own "cards resting → full bento grid" scroll animation is an **in-section** animation, not a cross-section handoff, and stays — same category as the vault idling or the Security dial stepping through sub-states.

---

## Phase 1 — Do now (small, mechanical, independently safe)

### Task 1: Standardize bento box heading/body font sizes

**Context:** `Docs/2026-09-22-glitch-fixes-implementation-plan.md` Task 7 already fixed *cross-laptop consistency* (two screens in the same width tier now render identical sizes, via the `--bento-vw-tier` CSS variable — confirmed already implemented in the current code). What's still open is the user's separate complaint: the 5 bento tiles use *different* heading/body sizes from each other by design. That's a values problem, not a mechanism problem — the tiering plumbing from Task 7 stays untouched.

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx` (bento tile JSX, ~lines 8222–8519)

**Current state (5 tiles, all already using `--bento-vw-tier`):**

| Tile | Heading clamp | Body/item clamp |
|---|---|---|
| 1 — Understand what you own | `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)` | `clamp(14.5px, calc(1.2 * var(--bento-vw-tier, 14.4px)), 17.5px)` |
| 2 — Skip the Dashboards | `clamp(18px, calc(1.85 * var(--bento-vw-tier, 14.4px)), 26px)` | `clamp(12.5px, calc(1.0 * var(--bento-vw-tier, 14.4px)), 15px)` |
| 3 — See everything | `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)` | `clamp(13px, calc(1.05 * var(--bento-vw-tier, 14.4px)), 16px)` |
| 4 — Know your risk | `clamp(18px, calc(1.75 * var(--bento-vw-tier, 14.4px)), 25px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |
| 5 — Plan Ahead | `clamp(18px, calc(1.75 * var(--bento-vw-tier, 14.4px)), 25px)` | `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` |

**Target — one heading size, one body size, everywhere:**
- Heading (all 5 `<h3>` tags): `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)` — the size Tiles 1 & 3 already use.
- Body/item text (all `<p>` tags, including the `<strong>` item labels inside tiles 1, 4, 5): `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)` — the size Tiles 4 & 5 already use.

**Why these two specific values, not some new invented size:** picking the *smaller* of the existing body sizes is the safe direction — Tiles 4 & 5 are the most space-constrained layouts (2×2 icon grids with 4 short items each), and this size is already proven not to overflow there. Applying it to Tiles 1/2/3 only ever *shrinks* their body text slightly, which can't introduce new overflow. Picking the *larger* existing heading size for all 5 makes every tile's headline read with equal visual weight (matching the user's "prominent, not lesser" instinct), and headings are short (1–2 lines) so the small increase on Tiles 2/4/5 is low risk — the one to watch is Tile 2, whose heading sits beside an illustration in a horizontal split layout with less vertical slack than the others.

- [ ] **Step 1:** Update all 5 `<h3>` `fontSize` styles (lines ~8228, 8307, 8334, 8350, 8428) to `clamp(20px, calc(2.2 * var(--bento-vw-tier, 14.4px)), 32px)`.
- [ ] **Step 2:** Update all body/item `<p>` `fontSize` styles (lines ~8245, 8261, 8277, 8293, 8314, 8340 down to all the `0.95`-multiplier lines) to `clamp(12.5px, calc(0.95 * var(--bento-vw-tier, 14.4px)), 14px)`.
- [ ] **Step 3: Verify.** `npm run dev`, scroll into the bento section, resize through ~1024/1280/1366/1440/1920px:
  - Tile 2: confirm the now-slightly-bigger heading doesn't crowd or overlap the speech-bubble illustration beside it. If it feels cramped, it's fine to leave Tile 2's heading at its original `1.85` multiplier — that's a judgment call, use your eyes.
  - Tiles 1/3: confirm the now-slightly-smaller body paragraphs still read comfortably (they were already the largest, so this is a safe direction).
  - Confirm no tile's copy overflows its card or wraps awkwardly at any width.
- [ ] **Step 4: Commit.**

---

### Task 2: Increase Security-page vault size

**Files:**
- Modify: `components/blueprint/BlueprintHero.tsx`, `computeDockLayout()` (~lines 1620–1631, the `effectiveVaultW` block)

**Current state:**
```ts
const effectiveVaultW = isDesktopScreen
  ? Math.round(Math.min(520, Math.max(380, Math.min(liveH * 0.54, liveW * 0.36))))
  : isTabletScreen
  ? Math.round(Math.min(380, Math.max(300, Math.min(liveH * 0.44, liveW * 0.44))))
  : Math.round(Math.min(300, Math.max(220, Math.min(liveH * 0.35, liveW * 0.70))));
```

**Why this single formula is the right (and only) place to change:** this same function also computes `headingW` (the text panel's width) and `gap` (the space between vault and text) from the *same* live viewport, and then runs a safety valve a few lines later:
```ts
const compW = finalVaultW + finalGap + finalHeadingW;
if (compW > maxCompW && !isMobileScreen) {
  const shrinkFactor = maxCompW / compW;
  finalVaultW = Math.round(finalVaultW * shrinkFactor);
  finalHeadingW = Math.round(finalHeadingW * shrinkFactor);
  finalGap = Math.max(20, Math.round(finalGap * shrinkFactor));
}
```
This already guarantees vault + gap + text never exceeds the available viewport width — if the vault gets bigger and the total composition would overflow, vault, gap, and text all shrink back down *together, proportionally*, so the text can never end up broken, clipped, or overlapping as a side effect. That's exactly the "bigger vault, text should still look fine" behavior the user asked for, and it already exists — no new ratio needs to be invented or hand-tuned per breakpoint.

**Target — raise the min/max/fraction constants ~20% at every tier:**
```ts
const effectiveVaultW = isDesktopScreen
  ? Math.round(Math.min(600, Math.max(460, Math.min(liveH * 0.62, liveW * 0.42))))
  : isTabletScreen
  ? Math.round(Math.min(440, Math.max(360, Math.min(liveH * 0.52, liveW * 0.52))))
  : Math.round(Math.min(340, Math.max(260, Math.min(liveH * 0.42, liveW * 0.78))));
```
Update the comment block immediately above it (currently describing the old 460–480/340–400/260–320/200–260 ranges) to match the new numbers.

- [ ] **Step 1:** Replace the `effectiveVaultW` block and its comment as above.
- [ ] **Step 2: Verify.** `npm run dev`, scroll into Security at ~1920×1080, 1440×900, 1366×768, 1280×800 (desktop tier), 1024×768/834×1194 (tablet), 390×844/428×926 (mobile):
  - Vault should look visibly larger/more prominent relative to the heading text at every one of these, not just some.
  - Confirm the heading text panel never overlaps or gets clipped by the now-larger vault — this is what the `shrinkFactor` valve should already guarantee, but confirm it live, don't just trust the math.
  - Confirm the vault doesn't visually crowd the viewport edges at the narrowest widths in each tier (1024px, 390px).
- [ ] **Step 3: Commit.**

---

### Task 3: Keep the Unifolio logo static while the vault disc rotates

**Files:**
- Modify: `components/blueprint/SafeVault3D.tsx` (~lines 304–347)

**Root cause:** the "Clean White Core Hub with Crisp Unifolio Ring Logo" `<div>` (the white circular hub containing the ring-logo `<img>`) is currently a DOM child of `discRef` — the exact element GSAP rotates via `gsap.set(discRef.current, { rotate: currentAngle })` as the user scrolls through Security's sub-states. It spins because it's structurally nested inside the spinning layer, not because of any deliberate rotation logic applied to the logo itself.

**Current structure:**
```tsx
<div ref={discRef} className="absolute inset-0 w-full h-full will-change-transform flex items-center justify-center pointer-events-none" style={{ transformOrigin: "50% 50%" }}>
  <img src="/sketch-vault-disc.png" ... />                {/* should keep rotating */}
  <div className="absolute rounded-full ..." style={{ left: "50%", top: "50%", ... }}>  {/* hub — should NOT rotate */}
    <img src="/Logo/unifolio-ring-transparent.png" ... />
  </div>
</div>
```

**Fix — pull the hub (and the logo inside it) out of `discRef`, make it a sibling instead:**
```tsx
<div ref={discRef} className="absolute inset-0 w-full h-full will-change-transform flex items-center justify-center pointer-events-none" style={{ transformOrigin: "50% 50%" }}>
  <img src="/sketch-vault-disc.png" ... />                {/* still rotates */}
</div>
{/* Hub is now a sibling of discRef, not a child — same absolute-center positioning, but no longer inherits the disc's rotation */}
<div className="absolute rounded-full ..." style={{ left: "50%", top: "50%", ... }}>
  <img src="/Logo/unifolio-ring-transparent.png" ... />
</div>
```
Since the hub is centered via `left: 50%; top: 50%; transform: translate(-50%, -50%)` and rotation happens around that same center point, moving it to a sibling position changes nothing visually about where it sits — it just stops inheriting `discRef`'s `rotate` transform. Both `discRef`'s div and the hub div need to remain inside the same parent (`closedDoorGroupRef`) so they stay aligned to the same coordinate space.

- [ ] **Step 1:** Move the hub `<div>` (containing the "Clean White Core Hub" comment and the ring-logo `<img>`) so it closes as a sibling of `discRef`'s div, inside `closedDoorGroupRef`, not inside it.
- [ ] **Step 2: Verify.** `npm run dev`, scroll through all of Security's ring sub-states (forward and backward) — the outer disc/dial should visibly rotate as before, but the white hub + Unifolio logo should stay perfectly still/upright throughout. Also check the vault-open/vault-close animation still looks correct (the hub shouldn't disappear or misalign during the door-open transition).
- [ ] **Step 3: Commit.**

---

### Task 4: Redesign nav icons in the site's existing hand-inked style

**Files:**
- Modify: `components/blueprint/BlueprintNav.tsx`, `NavSketchIcon` (~lines 23–338, all 5 branches: `product`, `security`, `about`, `faq`, default/`contact`)

**Context:** the user shared a reference image showing 5 icons in this exact order — matching the existing `product`/`security`/`about`/`faq`/`contact` nav items 1:1:
1. **Product** → a bento/dashboard grid (small rounded-rect tiles arranged in a grid)
2. **Security** → a shield with a small padlock
3. **About** → three overlapping/interlocking circles (Venn-diagram style)
4. **FAQ** → a circle containing a question mark
5. **Contact** → a rounded chat/speech bubble
Each reference icon has one small solid accent dot near its edge.

**Explicit instruction from the user: do not copy the reference image's flat/filled style.** Redesign each shape above using this component's existing hand-inked drafting-pen conventions — reuse the existing color variables already defined at the top of `NavSketchIcon` (`inkStroke`, `hatchStroke`, `guideStroke`, `watercolorTint`, `watercolorDeep`, `paperBack`), the same stroke widths (~1.5–1.8), rounded line caps/joins, small cross-hatch shadow marks, and light watercolor-wash fills already used in the current `product` icon (visible at lines ~40–100) and the other 4 branches. The green accent dot in the reference maps to this component's existing hover/active green (`#22C55E`) — render it as a small filled circle accent, consistent with how the current icons already use `isHovered || isActive` to swap ink color to green.

- [ ] **Step 1:** Redesign the `product` icon as a hand-inked bento/dashboard grid (e.g. 3–4 small rounded rectangles in a 2×2 or asymmetric grid), replacing the current 3-tier isometric card stack.
- [ ] **Step 2:** Redesign the `security` icon as a hand-inked shield outline with a small padlock shape inside or overlapping it.
- [ ] **Step 3:** Redesign the `about` icon as three hand-inked overlapping circles.
- [ ] **Step 4:** Redesign the `faq` icon as a hand-inked circle containing a question mark.
- [ ] **Step 5:** Redesign the `contact` icon as a hand-inked rounded chat/speech bubble.
- [ ] **Step 6:** Each icon keeps a small solid accent-color dot/circle near one edge, using the existing `inkStroke`/green-on-hover pattern.
- [ ] **Step 7: Verify.** `npm run dev`, check the nav at desktop and mobile widths — icons render crisply at the existing render sizes (`w-[28px] h-[28px] sm:w-[30px] sm:h-[30px]` etc., check each branch for its exact current size and keep it), hover/active states correctly swap to green, and no icon overflows the nav item's clickable area.
- [ ] **Step 8: Commit.**

---

### Task 5: Update About-page copy

**Files:**
- Modify: `content/about.ts`
- Modify: `components/sections/FounderStory.tsx` (header block, ~lines 51–59)

**Current `content/about.ts`:**
```ts
export const aboutContent = {
  heading: "We got tired of choosing between free and honest.",
  intro:
    "Every mutual fund tracker in India makes you pick: a free tool that's shallow, or a proper analytical one locked behind a paid advisory relationship. Unifolio started because that choice shouldn't exist.",
  story: "[PLACEHOLDER: ...]",   // leave untouched, per user
  values: [ ... ],               // leave untouched, per user
};
```

**New copy (see "Assumptions" section at the top of this doc re: the image-vs-typed-text discrepancy):**
```ts
export const aboutContent = {
  heading: "In most families, someone ends up in charge of the money.",
  headingAccent: "Not because they trained for it. Because someone has to.",
  intro:
    "Unifolio brings the whole family's finances into one place, and helps you actually understand them.",
  story: "[PLACEHOLDER: ...]",   // untouched
  values: [ ... ],               // untouched
};
```

**`FounderStory.tsx` header block** — currently renders just `heading` then `intro`:
```tsx
<h1 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-[#1C241E] sm:text-6xl lg:text-7xl leading-[1.02]">
  {content.heading}
</h1>
<p className="mt-6 font-sans text-lg sm:text-xl text-[#525E55] leading-relaxed">
  {content.intro}
</p>
```
Add the new `headingAccent` line between them, styled slightly lighter/smaller than the main heading to match the mockup's two-tier heading treatment (bold statement, then a softer explanatory line, then the intro paragraph):
```tsx
<h1 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-[#1C241E] sm:text-6xl lg:text-7xl leading-[1.02]">
  {content.heading}
</h1>
<p className="mt-4 font-serif text-xl sm:text-2xl text-[#1C241E]/70 leading-snug">
  {content.headingAccent}
</p>
<p className="mt-6 font-sans text-lg sm:text-xl text-[#525E55] leading-relaxed">
  {content.intro}
</p>
```

- [ ] **Step 1:** Update `content/about.ts` as above — `story` and `values` stay byte-for-byte unchanged.
- [ ] **Step 2:** Update `FounderStory.tsx`'s header block to render the new `headingAccent` line.
- [ ] **Step 3: Verify.** `npm run dev`, check `/about` at mobile/tablet/desktop — the two-tier heading reads clearly, no awkward line-wrapping, spacing feels intentional (not cramped) between the 3 stacked text elements.
- [ ] **Step 4: Commit.**

---

## Phase 2 — Planned now, execute later (the two "big, completely redoing" changes)

Do not start either of these until Phase 1 is verified live and the user has explicitly said to proceed.

### Task 6: Remove cross-section transition choreography, keep ambient + in-section animation, fix the mid-scroll-stuck bug

**Confirmed plain-English model:** today, scrolling on this page works like advancing PowerPoint slides — `BlueprintHero.tsx` intercepts every wheel/touch/key event, calls `preventDefault()` on all of them, and manually drives the page through a fixed sequence of states (`hero → product-resting → product → sculpting → ring → about → faq`) using dozens of hand-built GSAP timelines. The bug where scrolling gets stuck mid-animation happens because this state machine can get confused about which "slide" it's currently animating into. The fix: stop intercepting scroll entirely. Let the browser's native scroll just work, the way it does on `/about`, `/contact`, `/pricing`. Sections sit in normal document flow, and the user scrolls past them at their own pace — no forced pauses, no hijacking. What goes away is only the choreographed *hand-off* between sections — e.g. the bento tiles physically flying and converging into the vault, the vault card traveling across the screen into the ring. Those become instant/CSS-only enter-on-view transitions (a simple fade/slide-up as each section scrolls into view), same weight/feel every time, not a forced cinematic sequence.

**Important nuance confirmed by the user:** not everything inside the `hero → product-resting → product → sculpting → ring → about → faq` sequence is a cross-section hand-off. Two of those states — `product-resting` and `product` — are both still *inside* the Product section: the transition between them is the cards arranging themselves from a small resting stack into the full 5-tile bento grid as you scroll (driven by `createRestingToBentoTimeline`, ~`BlueprintHero.tsx:1287`). The user confirmed this stays, same as the vault idling or the Security dial stepping through its sub-states — it's core in-section animation, not a between-sections hand-off, even though it currently happens to be built on the same hijacked wheel-tick mechanism as the parts that *are* going away. The distinction that matters is: does this animation play *while you're looking at one section* (keep, just re-platform it onto native-scroll `ScrollTrigger` scrub — the same mechanism the Security dial already uses successfully), or does it *carry you from one section to a conceptually different one* (remove, replace with a plain scroll + simple fade/slide-in)?

**Why this single change also fixes the mid-scroll-stuck bug for free:** the root-cause report (`Docs/2026-09-22-scroll-and-animation-glitch-root-cause-report.md`) and the deferred note in the existing glitch-fixes plan both identify the stuck-scroll bug as a symptom of the same scroll-hijacking state machine (`navigateToSection`, the `transitionAnimatingRef`/`isHoldingProductRef` busy-flags, and the paired `consolidateRingToStack`/`restoreStackToRing` timelines going out of sync). There is no separate "fix the stuck bug" work — removing the hijacking removes the mechanism that gets stuck.

**Scope of the rewrite (high-level, not step-by-step — this needs its own dedicated planning/spike pass once started, given the size of `BlueprintHero.tsx`):**
- Remove (actual cross-section hand-offs): the global `wheel`/`touchmove`/`keydown` listeners and their `preventDefault()` calls; the `overflow: hidden` scroll-lock on the stage container; `navigateToSection` and the state-machine refs (`stateRef`, `transitionAnimatingRef`, `isHoldingProductRef`, `productCompleteRef`, etc.); the cross-section choreography timelines — `createHeroToProductTimeline` (Hero→Product entrance), `createProductToRingTimeline` (Product bento→vault convergence into Security, the "sculpting" state), `consolidateRingToStack`/`restoreStackToRing` (Security↔About), `exitAboutToFaq` (About→FAQ).
- Keep, but re-platform onto native scroll (in-section animations, including the one nuance above): `createRestingToBentoTimeline` (Product's own cards-resting→full-bento-grid formation — convert from a hijacked-wheel state-machine step into a `ScrollTrigger` scrub tied to a scroll distance within the Product section, the same mechanism already used successfully for the Security dial); vault idle motion; disc rotation stepping through Security's sub-states; bento card hover; FAQ arc reveal; manifesto quote illumination on the About page. Also keep `computeDockLayout`, `computeBentoLayout`, and all the sizing/positioning math — still needed to lay sections out correctly, just not to animate *between* them.
- Add: sections become normal stacked blocks in document flow (similar structurally to how `/about` and `/contact` are already built); a lightweight shared "fade/slide up on scroll into view" treatment per section boundary (a single small `ScrollTrigger`-triggered `gsap.from` per section, or a shared IntersectionObserver-driven CSS class — either is fine, pick whichever is simpler to keep consistent).
- **Given the size of this file (~9,990 lines) and the fact that it's the single biggest architectural change in this plan, this deserves its own detailed sub-plan (file inventory of exactly which functions/refs to delete vs. keep vs. re-platform, written before touching code) rather than a checklist here.** Do this sub-plan once Phase 1 is verified live.

- [ ] **Step 1:** Write a dedicated sub-plan enumerating every function/ref/listener in `BlueprintHero.tsx` to delete vs. keep vs. re-platform onto native-scroll `ScrollTrigger`, based on the inventory above.
- [ ] **Step 2:** Implement, verify no section becomes inaccessible or visually broken at any breakpoint, verify the Product bento-grid formation still plays correctly on native scroll (forward and backward), verify the stuck-mid-scroll repro steps from the root-cause report no longer reproduce (test on the specific devices/browsers where it was previously seen, not just desktop Chrome).
- [ ] **Step 3:** Commit.

---

### Task 7: Replace Login/Sign Up with a single "Join the Waitlist" button + modal

**Files:**
- Modify: `components/blueprint/BlueprintNav.tsx` (~lines 591–643, the Login + Sign Up `<Link>` pair)
- Create: `components/waitlist/WaitlistModal.tsx`
- Create: `components/waitlist/WaitlistForm.tsx`

**Confirmed scope:** both `Login` and `Sign Up` are removed. One button, "Join the Waitlist", replaces them both.

**Step 1 — Nav button.** Replace the `<div>` at lines 591–643 (currently containing both `Login` and `Sign Up` `<Link>`s) with a single button using the existing `Button` component (`components/ui/Button.tsx`, `variant="primary"`, matching the visual weight the Sign Up button currently has — green-tinted glass, iridescent border) that opens the modal:
```tsx
<div className={`flex items-center transition-opacity duration-700 delay-200 ${isLogoDocked ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
  <Button variant="primary" size="sm" onClick={() => setWaitlistOpen(true)}>
    Join the Waitlist
  </Button>
</div>
```
Add `const [waitlistOpen, setWaitlistOpen] = useState(false);` to `BlueprintNav`'s existing `useState` imports, and render `<WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />` once, near the end of the nav's JSX.

**Step 2 — Modal shell (`WaitlistModal.tsx`).** No existing Modal/Dialog component exists in this codebase (confirmed via search) — this is genuinely new UI. Match "the feeling of the current website" using the same visual language already established by `Button.tsx` (glass/blur surfaces, soft shadow, rounded-full or rounded-3xl edges, iridescent accent) and `ContactForm.tsx` (label style: `font-mono text-xs uppercase tracking-wider`, input style: `rounded-xl border border-ink/10 bg-paper-subtle/50`, focus states). Structure:
```tsx
"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#111613]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-3xl border border-black/[0.08] bg-paper/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-faint hover:bg-black/[0.05] hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-serif text-2xl font-bold text-ink">Join the Waitlist</h2>
        <p className="mt-2 font-sans text-sm text-ink-soft">
          Be first in line when Unifolio opens up. No spam, just one email when it's your turn.
        </p>
        <div className="mt-6">
          <WaitlistForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
```
(Class names like `paper`, `ink`, `ink-soft`, `ink-faint` are the existing design-token color classes already used across `ContactForm.tsx`/`about/page.tsx` — reuse them, don't invent new colors.)

**Step 3 — Form (`WaitlistForm.tsx`).** Explicitly confirmed by the user as its **own separate, distinct form component from `ContactForm`** — do not share/reuse the component, even though the backend pattern will eventually be identical. Minimal fields (Name, Email, "I am a..." dropdown), following `ContactForm.tsx`'s exact submit pattern but pointed at a new, separate, not-yet-real env var — same no-op-if-unset behavior as the existing Contact/Newsletter forms:
```tsx
"use client";
import { useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export function WaitlistForm({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const webhookUrl = process.env.NEXT_PUBLIC_WAITLIST_WEBHOOK_URL;

    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(data),
        });
      }
      setStatus("success");
      form.reset();
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-paper">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="mt-3 font-sans text-sm text-ink-soft">You're on the list — we'll be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="wl-name" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">Full Name</label>
        <input id="wl-name" name="name" required placeholder="e.g. Siddharth Sharma"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors" />
      </div>
      <div>
        <label htmlFor="wl-email" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">Email Address</label>
        <input id="wl-email" name="email" type="email" required placeholder="name@domain.com"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors" />
      </div>
      <div>
        <label htmlFor="wl-role" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">I am a...</label>
        <select id="wl-role" name="role"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink focus:border-accent focus:bg-paper focus:outline-none transition-colors">
          <option>Individual Investor</option>
          <option>Family Office / HNI</option>
          <option>Financial Advisor / RIA</option>
          <option>Other</option>
        </select>
      </div>
      <button type="submit" disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-paper transition-all hover:bg-ink/90 disabled:opacity-60">
        <span>{status === "loading" ? "Joining…" : "Join the Waitlist"}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
      {status === "error" && (
        <p className="flex items-center gap-1 font-mono text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Something went wrong — please try again.</span>
        </p>
      )}
    </form>
  );
}
```

**Explicitly deferred (per user, do not build yet):** the real Google Apps Script Web App + Google Sheet backend for `NEXT_PUBLIC_WAITLIST_WEBHOOK_URL`. Since the env var is unset, the form silently no-ops the network call and still shows the success state — same behavior Contact/Newsletter had before their webhooks existed. When the user is ready, this is a new Apps Script deployment + a new Sheet tab, wired into `.env.local`/hosting env vars, matching the existing `NEXT_PUBLIC_CONTACT_WEBHOOK_URL` pattern exactly.

- [ ] **Step 1:** Remove the Login + Sign Up `<Link>` pair from `BlueprintNav.tsx`, add the single `Button`-based trigger + modal state.
- [ ] **Step 2:** Create `WaitlistModal.tsx` and `WaitlistForm.tsx` as above (adjust copy/visual details to taste, this is a starting point not a pixel spec).
- [ ] **Step 3: Verify.** `npm run dev`, open/close the modal via button, backdrop click, and Escape key; submit the form with the env var unset — confirm it shows the success state without erroring; check the modal at mobile width (should not overflow or clip).
- [ ] **Step 4: Commit.**
