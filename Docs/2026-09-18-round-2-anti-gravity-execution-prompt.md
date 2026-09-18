> **SUPERSEDED (Round 3):** Steps 3 and 4 below caused a crash (`clusterEl is not defined` in
> `restoreStackToRing`) and a visual regression, and have already been fixed directly in the code with
> a different approach (`offsetTop`-based measurement instead of `getBoundingClientRect()`). Do not
> re-run steps 3 or 4 from this doc. See `Docs/2026-09-18-round-2-fixes-plan.md`'s superseded notice.

You are implementing Round 2 fixes for the Unifolio marketing site. Full diagnosis and reasoning for each item lives in `Docs/2026-09-18-round-2-fixes-plan.md` — read it first, it has the exact code excerpts and reasoning. This prompt is the sequenced execution checklist.

**Ground rules — read before starting:**
- Items 3 and 4 below share a root cause. Implement both, don't stop after just one.
- Do NOT touch: `CINEMATIC_TIMESCALE`, vault door open/close durations (`collapseDuration`, `safeOpenDuration`, `safeCloseDuration`, `textRevealDuration`), the FAQ heading or arc-line direction/color/path, bento tile content/sizing, product section spacing, the footer, or the trackpad gesture-lock logic. All of these were confirmed correct by the user in manual QA — only the specific items below are in scope.
- After steps 3 and 4, test at 1440×900, 1280×800, 1920×1080, and 390×844 — this was reported as a multi-viewport bug.

---

**Step 1 — Hero video loop jitter**
File: `components/hero/HeroApertureVisual.tsx`
In the `checkTime` crossfade trigger block: don't flip opacity in the same tick as calling `inactive.play()`. Wait for the `play()` promise to resolve (or its catch, as a fallback) before starting the opacity ramp. Change the `setTimeout` delay from `600` to `500` to match the CSS `duration-500` exactly. Bump `CROSSFADE_TRIGGER_BEFORE_END` from `0.6` to `0.8`.
Test: watch 3+ full loop cycles, including with CPU throttling in dev tools, for a seamless loop.

**Step 2 — Navbar sketch icons, bolder**
File: `components/blueprint/BlueprintNav.tsx`, `NavSketchIcon` (all 5 icon branches: product, security, about, faq, default/contact)
- Render size: `w-[23px] h-[23px] sm:w-[25px] sm:h-[25px]` → `w-[26px] h-[26px] sm:w-[28px] sm:h-[28px]`.
- Primary `strokeWidth`: `1.35` → `2`. Any secondary strokes at `1.1`/`1.25` → `~1.6`.
- Remove low-opacity/dashed decorative paths that don't define the icon's core silhouette (e.g. the dashed `strokeDasharray="2 2" opacity="0.55"` line in `product`, the dashed orbit ellipses in `security`/`about`). Keep one bold primary shape + at most one small accent per icon.
- Increase accent dot/fill circle radii (`r="0.75"`, `r="0.8"`, `r="1"`, `r="1.3"`) by ~40%.
Test: compare visual weight against the pre-Round-1 3D PNG icons (check git history if needed); confirm no nav layout overflow at the smallest supported breakpoint.

**Step 3 — Bento box white space / clipping bug**
File: `components/blueprint/BlueprintHero.tsx`, `computeBentoLayout()` (~line 838-921)
Replace the hardcoded `ptRem`/`clusterViewportTop` formula with a live `cardsClusterRef.current.getBoundingClientRect().top` read, keeping the old formula only as a fallback for when the ref isn't mounted yet:
```js
const liveTop = cardsClusterRef.current?.getBoundingClientRect().top;
const clusterViewportTop = liveTop !== undefined
  ? liveTop
  : (vWidth >= 1024 ? 5 : vWidth >= 768 ? 4.5 : vWidth >= 640 ? 4 : 3.5) * 16 + 8 + 6;
```
Apply this at both call sites: the one-time init seed (~line 955-971) and inside `createRestingToBentoTimeline` (~line 1436). At the timeline call site, the measurement must happen before any `gsap.set`/tween in that same timeline moves `cardsClusterRef`.
Test: scroll from resting product-cards into the bento grid at all 4 viewports above — no white space above the grid, all tiles fully visible, grid doesn't collapse on continued scroll.

**Step 4 — Security↔About white space / content below the fold**
File: `components/blueprint/BlueprintHero.tsx` — three locations: `consolidateRingToStack` (~line 4158), the snap/jump variant (~line 4002), `restoreStackToRing` (~line 5355)
In all three, convert `targetEnvelopeY` from a tuned constant into a value derived from the cluster's live current position, matching the pattern already used a few lines below it in `consolidateRingToStack` (`dx1 = curX + (px1 - clusterCenterX)`):
```js
const clusterRectNow = clusterEl.getBoundingClientRect();
const targetEnvelopeY = curY + (targetAbsoluteY - clusterRectNow.top);
// where targetAbsoluteY is the existing vhVal-based clamp formula, unchanged
```
All three locations must be updated together — do not fix only one, forward and reverse will desync.
Test: enter security from product, scroll through all 7 ring states into About and back in reverse, at all 4 viewports — no white-space bar, no content clipped below the fold, in either direction.

**Step 5 — About→FAQ transition flash**
File: `components/blueprint/BlueprintHero.tsx`, `exitAboutToFaq` (~line 3885-3931)
Currently the stage unlock (`stageRef.current.style.position = ""` etc.) happens synchronously in the `onComplete`, but the corrective `smoothScrollTo(faqEl, ...)` is deferred one `requestAnimationFrame` later, producing a visible flash of unpinned/blank content. Remove the `requestAnimationFrame` wrapper and call `smoothScrollTo` in the same synchronous block, immediately after `ScrollTrigger.refresh()`, so there's no frame where the page is unpinned at the stale scroll position.
Test: scroll from About into FAQ repeatedly, including fast/aggressive scrolling — no flash of blank space or wrong section.

**Step 6 — Vault card travel speed (both directions)**
File: `components/blueprint/BlueprintHero.tsx`, `createProductToRingTimeline` (~line 1739-2515)
Change `travelDuration = 1.70` to `travelDuration = 1.15`. Do not change `collapseDuration`, `safeOpenDuration`, `safeCloseDuration`, `textRevealDuration`, or `enterVaultDuration` — those are confirmed correct. `enterVaultStart = cardStart + travelDuration` is a derived formula and will adjust automatically.
This single change covers both directions — `triggerRingToProduct` (~line 6184) calls `.reverse()` on this same timeline rather than building a separate one.
Test: trigger product→security entry and security→product exit several times — card travel should feel snappy while door open/close and text reveal feel unchanged from before this step.

**Step 7 — FAQ arc line boldness**
File: `components/blueprint/BlueprintFaq.tsx`, line ~198
Change `strokeWidth="1.6"` to `strokeWidth="6"` on the arc `<path>`. Do not change the path, color, opacity, or anything else in this SVG.
Test: check the arc at all 3 responsive breakpoints for visual boldness matching the heading weight.

---

When done, summarize what was changed per step (same format as last time) so the user can do another manual pass.
