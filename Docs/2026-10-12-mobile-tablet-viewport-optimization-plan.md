# Comprehensive Plan: Mobile & Tablet Viewport Optimization

**Date:** 2026-10-12  
**Status:** Architecture & Planning Phase (Zero Code Changes — Awaiting Review)  
**Target Viewports:** Mobile Portrait (360px – 430px), Mobile Landscape / Foldables (480px – 640px), Tablet Portrait (768px – 834px), Tablet Landscape (1024px)  
**Strict Scope Rule:** **100% Desktop Preservation.** Zero modifications to desktop markup, desktop GSAP timelines, or desktop layout math (`>= 1024px`). Desktop will remain identical down to the exact pixel.

---

## 1. Executive Summary & Core Objectives

### The Challenge
On desktop (`>= 1024px`), Unifolio delivers a cinematic, highly praised spatial experience. However, the current code renders desktop-oriented widescreen coordinates across all devices:
- A widescreen 1.82 aspect ratio bento grid is calculated on narrow phone screens, squashing 5 product feature cards into an unreadable ~196px vertical band.
- The hero aperture video ring has hardcoded horizontal offsets (`translateX(11vw)` and `left: 62.87%`), colliding into headlines that have negative margin pulling (`-translate-x-6`) and `whitespace-nowrap`.
- The 3D Vault and security sub-states suffer from `whitespace-nowrap` horizontal overflow bugs, rigid pixel anchors, and disappearing vault context during scrolling.
- Tablet viewports (768px – 1024px) are trapped in an "awkward middle": too narrow for desktop side-by-side splits, yet displaying desktop navigation pills that collide with the logo and waitlist button.

Meanwhile, components that already use clean responsive flex/grid layouts—the **FAQ Accordion (`BlueprintFaq`)**, the **About Story (`AboutScene`)**, the **Waitlist Modal (`WaitlistModal`)**, and the **Contact Forms (`BlueprintContact`)**—already render smoothly across devices.

### Objectives
1. **Preserve Desktop Perfectly:** Ensure desktop layout, GSAP timelines, and Three.js coordinates are untouched (`lg:` / `min-width: 1024px`).
2. **Deliver Visual & Product Continuity:** Ensure mobile and tablet look and feel like the **same high-end financial product**—same cream background (`#FAF8F5`), ink typography (`#111613`), emerald accents (`#22C55E`), 3D assets, and frosted glass textures.
3. **Multi-Screen Compatibility:** Flawless rendering from compact 360px Android devices up to 1024px iPad Pro screens, handling iOS Safari dynamic address bars (`dvh`), touch gestures, and responsive text wrapping.
4. **DevTools Inspectability:** Immediate and reliable testing via Chrome/Edge/Safari DevTools (`Ctrl + Shift + I` / `Cmd + Option + I`).

---

## 2. Multi-Screen Device Compatibility Matrix

To guarantee compatibility across all phones and tablets, the design system will adapt cleanly across five distinct viewport classes:

| Class | Viewport Range | Key Devices | Layout Behavior |
|---|---|---|---|
| **Compact Mobile** | 360px – 389px | Galaxy S20–S24, iPhone SE, Pixel 4a | Single-column vertical flow, fluid headings (`clamp(22px, 6.5vw, 26px)`), full-width cards with 16px side padding. |
| **Standard Mobile** | 390px – 411px | iPhone 12/13/14/15/16, Pixel 7/8/9 | Single-column vertical flow, comfortable card heights (~380px–420px), centered hero aperture ring. |
| **Large Mobile / Pro Max** | 412px – 430px | iPhone 14/15/16 Pro Max, Galaxy S24 Ultra | Expanded single-column, enhanced card illustration scaling, optimal touch padding. |
| **Small Tablet / Foldable** | 600px – 767px | iPad Mini, Galaxy Fold (unfolded), Nexus 7 | Adaptive hybrid: 2-column card grid or prominent single cards with rich illustration framing. |
| **Standard Tablet** | 768px – 1023px | iPad 10th Gen, iPad Air, Surface Pro, Galaxy Tab | 2-column balanced layout (40% / 60% split for Security), adjusted navbar pill spacing, comfortable card grid. |
| **Desktop (Untouched)** | **>= 1024px** | **Laptops, Monitors, Ultrawides** | **100% UNTOUCHED existing layout, coordinates, and bento grid.** |

---

## 3. Section-by-Section Architectural Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BLUEPRINT NAV BAR                               │
│ Desktop (>=1024px): Existing Glass Pill in Center (Untouched)          │
│ Tablet (768-1023px): Scaled Glass Pill + Balanced Padding              │
│ Mobile (<768px): Brand Logo + Compact Waitlist CTA + Floating Dock     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                        HERO SECTION                                    │
│ Desktop: Left Headline + Right Widescreen Aperture Video Ring          │
│ Mobile/Tablet: Centered Vertical Hierarchy (Video Ring + Text)         │
│ Zero negative translate pulling, fluid typography, no clipping         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                        PRODUCT WORLD                                   │
│ Desktop: Existing 5-Card Widescreen Bento Grid (Untouched)             │
│ Tablet: 2-Column Balanced Feature Grid (1 Hero Card + 4 Sub-Cards)    │
│ Mobile: Interactive Full-Fidelity Card Showcase (Stack / Carousel)     │
│ Full copy, full illustrations, full tags, zero 196px squishing         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                        SECURITY EXPERIENCE                             │
│ Desktop: Left Sticky 3D Vault + Right 8 Narrative Sub-states          │
│ Tablet: 40/60 Split with Sticky Top-28 Anchor                          │
│ Mobile: Compact Anchored 3D Vault + Natural Text Wrapping              │
│ Zero `whitespace-nowrap` bugs; micro-animations auto-aligned           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                        ABOUT / FAQS / CONTACT                          │
│ Already responsive, beautiful, and approved. Zero structural changes.  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Section 1: Navigation Bar (`BlueprintNav.tsx`)

#### Current Issues
- On mobile (`< 768px`), the navigation pill is hidden (`hidden md:flex`), leaving users with no menu to jump between Product, Security, About, FAQs, and Contact.
- On tablet (`768px – 1023px`), the logo, glass pill, and "Join the Waitlist" button crowd into 768px, pushing against screen edges.

#### Adjustments
1. **Desktop (`>= 1024px`):** Unaltered.
2. **Tablet (`768px – 1023px`):**
   - Reduce container padding from `px-10` to `px-5 sm:px-6`.
   - Scale navigation pill gaps from `gap-6` to `gap-3.5` and reduce icon container size slightly to ensure comfortable margin on 768px iPads.
3. **Mobile (`< 768px`):**
   - Header retains the brand logo on the left and a streamlined "Waitlist" button on the right.
   - Introduce an unobtrusive, beautiful **mobile glass dock** at the bottom of the screen (or an elegant hamburger/quick-jump trigger) displaying the 5 signature sketch icons: Product, Security, About, FAQs, Contact. This gives mobile users the same instant access without crowding the top header.

---

### Section 2: Hero Landing (`HeroScene.tsx` & `HeroApertureVisual.tsx`)

#### Current Issues
- Video ring has hardcoded `transform: scale(1.28) translateX(11vw)` and anchor `left: 62.87%`.
- Text container has `-translate-x-6 sm:-translate-x-10` pulling it off-screen to the left.
- Headings use `<span className="whitespace-nowrap">` on *"See everything you own"* and *"Understand what it means"*, causing clipping on screens under 390px.
- The ring and text collide directly on top of each other.

#### Adjustments
1. **Desktop (`>= 1024px`):** Unaltered.
2. **Mobile (`< 640px`):**
   - **Composition:** Switch to a centered vertical hierarchy.
   - **Aperture Ring:** In mobile view, remove `translateX(11vw)` and center the video ring (`transform: scale(0.9) translateX(0)` with origin center).
   - **Headings:**
     - Remove negative translation (`-translate-x-6`) so text stays within safe viewport margins (`px-5 sm:px-6`).
     - Remove `whitespace-nowrap` to allow natural two-line wrapping with fluid font size: `text-[clamp(24px,7vw,32px)]`.
     - Subhead (*"Track. Understand. Act with confidence."*) centered with comfortable line-height.
   - **Waitlist CTA:** Centered with touch target height of 48px and standard shadow.
3. **Tablet (`640px – 1023px`):**
   - Reposition video anchor from `left: 62.87%` to `left: 54%` and scale down slightly (`scale(1.05)`), allowing the left-hand text column ample space without overlapping the ring aperture.

---

### Section 3: Product World / Bento Showcase (`ProductBentoScene.tsx`)

#### Current Issues
- `computeBentoGeometry` computes a rigid widescreen layout (`bentoH = bentoW / 1.82`).
- On a 390px phone, total grid height is compressed to 196px. Card 0 is 95px wide, and Cards 1–4 are ~84px tall. Bullet points, tags, and illustrations become microscopic or collide into an illegible mess.
- On tablet, 5 cards in 2 rows crush cards with 4–5 bullet points into 160px height.

#### Adjustments
1. **Desktop (`>= 1024px`):**
   - The desktop bento grid and layout math will continue to render inside `<div className="hidden lg:block">` with zero logic changes.
2. **Mobile (`< 640px`):**
   - Render a dedicated mobile card showcase (`block lg:hidden`) where each of the 5 cards gets **full mobile width** (~340px–360px) and proper height (~380px–420px):
     - **Card 01:** *"Skip the dashboards. Just ask."* + Question illustration + natural explanatory paragraph.
     - **Card 02:** *"See Everything"* + Multi-asset illustration + aggregated net worth explanation.
     - **Card 03:** *"Understand What You Own"* + Overlap Check, Hidden Fee Finder, Peer Benchmarking bullet points with emerald check accents.
     - **Card 04:** *"Know Your Risk"* + Family Runway, Real Safety Cushion, Sleeping Money, Family Risk Map.
     - **Card 05:** *"Plan Ahead"* + Financial Snapshot, Stress test, Goal Readiness, Succession Readiness.
   - Display cards either as a clean **vertical narrative stack** with subtle sticky elevation or an **interactive swipeable card deck/carousel** with pagination dots.
3. **Tablet (`640px – 1023px`):**
   - Render a **2-column tablet grid**: Card 01 spans full-width or side-by-side with Card 02, followed by a balanced 2×2 grid for Cards 03, 04, and 05. Card heights set to `min-h-[290px]` so all bullet points breathe naturally.

---

### Section 4: Spatial Security & 3D Vault (`SecurityVaultScene.tsx`)

#### Current Issues
- Headings have hardcoded `whitespace-nowrap`:
  - *"We take your data as seriously"* + *"as you take your money."* → forces horizontal scrolling on 360px–390px screens.
  - *"We never save your passwords"* → overflows on mobile.
- The 3D Vault (`SafeVault3D`) is placed above the text on mobile; once scrolled past, the user reads 8 text sections without seeing the vault.
- Background shield div `-left-[600px] w-[620px]` creates invisible horizontal overflow on iOS Safari.
- Morph animations (trapped eyes, password asterisks, lock morph, India map SVG, money bills) are positioned with fixed pixel offsets that misalign when words wrap.

#### Adjustments
1. **Desktop (`>= 1024px`):** Unaltered.
2. **Mobile (`< 640px`):**
   - **Horizontal Overflow Fix:** Eliminate all `whitespace-nowrap` on multi-word headlines.
     - Headline 1 wraps gracefully: *"We take your data as seriously"* on line 1, *"as you take your money."* on line 2 with fluid font sizing (`clamp(20px, 5.5vw, 26px)`).
     - Headline 2: *"We never save your passwords"* wraps cleanly before *"passwords"*.
   - **3D Vault Staging:**
     - Replace the overflow-inducing `-left-[600px]` shield with a mobile-safe boundary.
     - Size the 3D Vault to `w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]` with its soft ambient shadow.
     - Position the vault either in an elegant sticky top dock that stays present as the user scrolls through the 8 security pillars, or anchor it cleanly at the head of the security experience.
   - **Micro-Animation Auto-Alignment:**
     - Update morph wrappers (the money bills, trapped living eyes, asterisk mask, padlock shackle) to use flex alignment and percentage-based origins so they remain locked to their anchor words regardless of screen width.
3. **Tablet (`640px – 1023px`):**
   - Maintain the side-by-side composition: 40% width for the sticky 3D Vault (`top-28` to `top-36`) and 60% width for the narrative text stack.

---

## 4. Technical Strategy: Zero-Risk Desktop Isolation

To ensure that desktop view is completely untouched:

1. **CSS Breakpoint Gating:**
   ```tsx
   {/* DESKTOP EXPERIENCE (>= 1024px): 100% UNTOUCHED */}
   <div className="hidden lg:block">
     {/* Existing desktop bento, existing coordinates */}
   </div>

   {/* MOBILE & TABLET EXPERIENCE (< 1024px): RESPONSIVE REDESIGN */}
   <div className="block lg:hidden">
     {/* Mobile/Tablet optimized cards, touch interactions */}
   </div>
   ```

2. **Viewport Gated Logic in Code:**
   Any JavaScript calculations or resize handlers will check:
   ```ts
   const isDesktop = window.innerWidth >= 1024;
   if (isDesktop) {
     // Run exact existing desktop math without modification
     return computeDesktopLayout();
   }
   // Mobile/tablet layout logic
   ```

3. **No Overwrites to Desktop Reference Tokens:**
   - `DESKTOP_REFERENCE_WIDTH = 1440` and `DESKTOP_REFERENCE_HEIGHT = 900` in [`lib/viewport.ts`](file:///c:/Users/Dell/Desktop/Unifolio%20Website/Unifolio-website/lib/viewport.ts) remain fixed.
   - Clamping rules documented in `VIEWPORT_CONSISTENCY_FIXES.md` will continue to guard desktop from 1280px to 2560px+.

---

## 5. DevTools & Device Testing Workflow

### How to Test via Browser DevTools (`Ctrl + Shift + I`):
1. Open the website in your browser (Chrome, Edge, Brave, or Safari).
2. Press `Ctrl + Shift + I` (Windows) or `Cmd + Option + I` (Mac) to open Developer Tools.
3. Press `Ctrl + Shift + M` (or click the **Device Toggle** phone/tablet icon) to switch to responsive design mode.
4. Select target devices from the dropdown:
   - **iPhone 14 / 15 / 16 Pro** (393 × 852)
   - **iPhone SE** (375 × 667)
   - **Samsung Galaxy S20 Ultra** (412 × 915)
   - **iPad Mini / Air** (768 × 1024 or 820 × 1180)
   - **iPad Pro** (1024 × 1366 portrait)
5. **Important Testing Tip:** Whenever you switch from desktop to a phone size in DevTools, press `Ctrl + R` (reload). GSAP ScrollTrigger and WebGL/video engines compute initial aspect ratios on mount; reloading ensures a clean test of the mobile layout.

---

## 6. Phased Implementation Roadmap

When you are ready to proceed with implementation, we will follow these exact sequential phases:

### Phase 1: Navigation Bar & Hero Section
- Adjust `BlueprintNav.tsx` for tablet padding and add the mobile floating navigation dock.
- Center `HeroApertureVisual.tsx` on mobile and remove negative headline margin pulling.
- Remove `whitespace-nowrap` on hero headlines and test fluid text scaling.

### Phase 2: Product World Mobile/Tablet Redesign
- Implement the dedicated mobile/tablet card showcase component in `ProductBentoScene.tsx` (gated with `block lg:hidden`).
- Style all 5 cards with full-fidelity illustrations, typography, bullet points, and tags.
- Verify desktop bento remains 100% identical in `hidden lg:block`.

### Phase 3: Security Experience & 3D Vault Polish
- Remove `whitespace-nowrap` on security headlines in `SecurityVaultScene.tsx`.
- Eliminate the `-left-[600px]` shield overflow bug.
- Scale and anchor the 3D Vault cleanly for portrait screens.
- Auto-center micro-animations (money stack, living eyes, password asterisks, lock morph).

### Phase 4: Multi-Screen QA & Audit
- Test across 360px, 375px, 390px, 412px, 768px, 820px, and 1024px.
- Confirm zero horizontal scrollbars on touch devices.
- Confirm desktop view at 1280px, 1440px, and 1920px is pixel-identical to the current live site.
