/**
 * Desktop composition reference frame.
 *
 * The hero/product/security experiences compute absolute pixel sizes and
 * offsets from the live viewport (window.innerWidth/innerHeight). Below this
 * reference size that's fine — it's how the layout adapts down to smaller
 * laptops. Above it, the same raw-viewport math keeps scaling the
 * composition (rings, card grids, shift offsets) well past what looks
 * intentional, so anything wider/taller than the reference is clamped back
 * to it. This mirrors the 1440-wide fallback already used throughout the
 * codebase for SSR (`typeof window !== "undefined" ? window.innerWidth : 1440`),
 * which is the resolution this design was actually built against.
 */
export const DESKTOP_REFERENCE_WIDTH = 1440;
export const DESKTOP_REFERENCE_HEIGHT = 900;

/**
 * Raw viewport width/height, clamped so desktop composition math never scales
 * past the reference frame. Only use this for layout math (sizes, radii,
 * offsets) — NOT for breakpoint checks (isDesktop/isTablet) or for centering
 * something at the viewport's true center.
 */
export function getComposedViewport(fallbackWidth = DESKTOP_REFERENCE_WIDTH, fallbackHeight = DESKTOP_REFERENCE_HEIGHT) {
  const rawW = typeof window !== "undefined" ? window.innerWidth : fallbackWidth;
  const rawH = typeof window !== "undefined" ? window.innerHeight : fallbackHeight;
  return {
    vw: Math.min(rawW, DESKTOP_REFERENCE_WIDTH),
    vh: Math.min(rawH, DESKTOP_REFERENCE_HEIGHT),
  };
}

/**
 * Resting card height used when a product card docks back into the bento
 * grid. Single source of truth for a step table previously duplicated
 * across three call sites in BlueprintHero.tsx.
 */
export function getCardRestHeight(vWidth: number): number {
  return vWidth >= 1536 ? 375 : vWidth >= 1280 ? 360 : vWidth >= 1024 ? 345 : vWidth >= 768 ? 330 : vWidth >= 640 ? 310 : 285;
}
