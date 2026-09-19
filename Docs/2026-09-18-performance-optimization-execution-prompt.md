# Execution Prompt for Anti-Gravity

Copy everything below this line into anti-gravity.

---

Implement the plan in `Docs/2026-09-18-performance-optimization-plan.md` in this repo, in the exact order listed under "Suggested execution order" at the bottom of that file (item 6 → item 1 → item 2 → item 4a/4b/4c → item 5 → item 3).

Rules:
- This is a pure performance refactor. No visual, layout, timing, or structural changes of any kind — the site must look and feel identical, just run smoother and more consistently across different GPUs (integrated Intel vs. discrete NVIDIA) and between localhost and Vercel.
- Follow each item's "Action" instructions exactly as written in the plan doc — don't improvise a different implementation even if it looks equivalent, since several items note specific risks (e.g. item 2 explicitly says not to touch the 5-card `getBoundingClientRect()` reads, only the two cached-rect ones).
- After finishing each numbered item, run `npx tsc --noEmit` and fix any type errors before moving to the next item.
- After finishing each numbered item, manually scroll through the homepage sequence (hero → product → ring → about → faq) in the browser and confirm nothing visually changed or broke, before starting the next item. If something breaks, fix it before moving on — don't stack multiple unverified changes.
- For item 3 (will-change cleanup), work through the files in the plan's table one at a time. Before touching `HeroProductExperience.tsx` or `SecurityExperience.tsx`, run `grep -rn "HeroProductExperience\|SecurityExperience" app/` yourself to confirm they're still unused — if so, skip them entirely. Also check `components/hero/HeroTransformationPortal.tsx` and `components/blueprint/BlueprintStackingCards.tsx`'s routes before deciding whether to include them. Additionally, grep `app/about/page.tsx`, `app/features/page.tsx`, and `app/pricing/page.tsx`'s components (`FeatureBeat`, `FounderStory`, `EditorialDecompression`, `PricingTable`) for `will-change`/`willChange` usage and apply the same criteria (section 3 of the plan) to any hits found, even though they weren't in the original count table.
- For item 5 (blur reduction), before changing the 5 newly-found `filter: blur()` instances (lines ~7855-8667 in `BlueprintHero.tsx`), read the surrounding ~20 lines of each to confirm whether the blurred element is also being transformed/animated at the same time — prioritize those over any that are static decorative shapes.
- Do not remove `will-change` or reduce blur radius on anything that's actively mid-transition or hovered/focused in a way that would make the reduction visually obvious — when in doubt on a specific element, leave it and note it instead of guessing.
- If any single item causes a regression you can't resolve within that item, stop, leave the rest of that item's changes out, and report back which item and what broke — do not attempt a different fix strategy than what's written in the plan without flagging it first.

When done, report back a short summary of what was changed per item (1 line each) so it can be reviewed against the plan.
