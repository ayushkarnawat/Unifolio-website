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
const HEIGHT_TIERS = [600, 680, 768, 800, 864, DESKTOP_REFERENCE_HEIGHT];

function snapDown(value: number, tiers: number[]): number {
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
    rawW,
    rawH,
  };
}

/**
 * Returns a proportional scale multiplier (0.70 to 1.0) for vertical compositions
 * on short screens (e.g. 1366x768, 1080p with 125%/150% scaling, Nest Hub 1024x600).
 */
export function getViewportHeightScale(rawH?: number): number {
  const h = rawH ?? (typeof window !== "undefined" ? window.innerHeight : DESKTOP_REFERENCE_HEIGHT);
  if (h >= 850) return 1.0;
  if (h <= 580) return 0.72;
  return 0.72 + ((h - 580) / (850 - 580)) * 0.28;
}

/**
 * Resting card height used when a product card docks back into the bento
 * grid, adapted for both viewport width and height.
 */
export function getCardRestHeight(vWidth: number, vHeight?: number): number {
  const h = vHeight ?? (typeof window !== "undefined" ? window.innerHeight : 800);
  let baseH = vWidth >= 1536 ? 375 : vWidth >= 1280 ? 360 : vWidth >= 1024 ? 345 : vWidth >= 768 ? 330 : vWidth >= 640 ? 310 : 285;
  if (h < 750) {
    const scale = Math.max(0.72, h / 850);
    baseH = Math.round(baseH * scale);
  }
  return baseH;
}
