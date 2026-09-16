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
 * Fixed desktop composition tiers. Two viewports in the same tier render an
 * identical composition; layout only changes at these deliberate steps
 * instead of scaling continuously with every exact pixel width (which made
 * the hero/product/security experiences look different across laptops with
 * different native resolutions or OS display scaling).
 */
const WIDTH_TIERS = [1024, 1280, 1366, DESKTOP_REFERENCE_WIDTH];
const HEIGHT_TIERS = [768, 800, 864, DESKTOP_REFERENCE_HEIGHT];

function snapDown(value: number, tiers: number[]): number {
  // Below the smallest tier, pass the value through unchanged — that range
  // is tablet/mobile territory (out of scope here), and forcing it up to
  // the smallest desktop tier would corrupt any isDesktop/isTablet-style
  // check or size lookup that shares this value below 1024/768.
  if (value < tiers[0]) return value;
  let result = tiers[0];
  for (const tier of tiers) {
    if (value >= tier) result = tier;
  }
  return result;
}

/**
 * Viewport width/height snapped to the tiers above, so desktop composition
 * math never scales past the reference frame and never varies within a
 * tier. Only use this for layout math (sizes, radii, offsets) — NOT for
 * breakpoint checks (isDesktop/isTablet) or for centering something at the
 * viewport's true center.
 */
export function getComposedViewport(fallbackWidth = DESKTOP_REFERENCE_WIDTH, fallbackHeight = DESKTOP_REFERENCE_HEIGHT) {
  const rawW = typeof window !== "undefined" ? window.innerWidth : fallbackWidth;
  const rawH = typeof window !== "undefined" ? window.innerHeight : fallbackHeight;
  return {
    vw: snapDown(Math.min(rawW, DESKTOP_REFERENCE_WIDTH), WIDTH_TIERS),
    vh: snapDown(Math.min(rawH, DESKTOP_REFERENCE_HEIGHT), HEIGHT_TIERS),
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
