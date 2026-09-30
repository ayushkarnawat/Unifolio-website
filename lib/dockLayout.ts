/**
 * Pure layout math for the Product "bento" grid and the Hero→Security "dock"
 * composition (safe/vault position, security heading shift, bento stack
 * target). Extracted verbatim from `components/blueprint/BlueprintHero.tsx`'s
 * former `computeBentoLayout`/`computeDockLayout` closures (task 1 of the
 * BlueprintHero file-split plan) — same arithmetic, just relocated so it can
 * be tested and reused without a mounted component.
 *
 * Both exported functions are pure: params in, plain object out. Zero DOM
 * reads, zero refs, zero side effects. Any DOM measurement (cluster rect,
 * offsetTop, offsetWidth/Height) and any side effect (writing ref values,
 * writing `safeContainerRef.current.style`) stays in BlueprintHero.tsx's
 * wrapper functions, which measure the DOM, call these, and apply the
 * results.
 */
import { getCardRestHeight, DESKTOP_REFERENCE_WIDTH } from "./viewport";

export interface BentoGeometryInput {
  vWidth: number;
  vHeight: number;
  /** cardsClusterRef's top-edge viewport Y, measured by the caller via
   * offsetParent.getBoundingClientRect().top + offsetTop (or its own
   * getBoundingClientRect().top as a fallback) — undefined when the
   * cluster isn't mounted/measurable yet, in which case this function
   * uses the same breakpoint-keyed constant the original inline version
   * fell back to. */
  clusterViewportTop?: number;
}

export interface BentoGeometry {
  bentoW: number;
  bentoH: number;
  gapX: number;
  gapY: number;
  tileWidths: number[];
  tileHeights: number[];
  tileLefts: number[];
  tileTops: number[];
}

/**
 * Bounding-box + 5-tile geometry for the Product bento grid.
 *
 * Transcribed verbatim from the original `computeBentoLayout` closure. See
 * `components/blueprint/BlueprintHero.tsx`'s `computeBentoLayout` wrapper for
 * the DOM measurement this is fed from.
 */
export function computeBentoGeometry(input: BentoGeometryInput): BentoGeometry {
  const { vWidth, vHeight, clusterViewportTop } = input;

  // Fixed navbar height + safe clearances to ensure tiles never touch navbar or bottom edge
  const isShortScreen = vHeight < 750;
  const isVeryShort = vHeight < 650;
  const NAVBAR_HEIGHT = isVeryShort ? 56 : isShortScreen ? 68 : 80;
  const TOP_CLEARANCE = isShortScreen ? 8 : 14;
  const BOTTOM_CLEARANCE = isShortScreen ? 10 : 18;

  const usableTop = NAVBAR_HEIGHT + TOP_CLEARANCE;
  const usableBottom = vHeight - BOTTOM_CLEARANCE;
  const usableHeight = Math.max(340, usableBottom - usableTop);
  const usableCenterY = usableTop + usableHeight / 2;

  // Balanced widescreen bento aspect ratio giving comfortable vertical height to all rows
  const targetAspect = isVeryShort ? 2.15 : isShortScreen ? 1.95 : 1.82;

  // Generously expanded bounding box size so bento fills the page comfortably without overflowing.
  const composedW = Math.min(vWidth, DESKTOP_REFERENCE_WIDTH);
  const maxBentoW = Math.min(composedW * (isShortScreen ? 0.94 : 0.92), 1540);
  const maxBentoH = Math.min(usableHeight * (isShortScreen ? 0.96 : 0.95), 750);

  let bentoW = maxBentoW;
  let bentoH = bentoW / targetAspect;

  if (bentoH > maxBentoH) {
    bentoH = maxBentoH;
    bentoW = bentoH * targetAspect;
  }
  if (bentoW > maxBentoW) {
    bentoW = maxBentoW;
    bentoH = bentoW / targetAspect;
  }

  // Substantially increased spacing between boxes, scaled down on short screens
  const gapX = isShortScreen ? Math.max(12, Math.min(22, Math.round(bentoW * 0.016))) : Math.max(18, Math.min(32, Math.round(bentoW * 0.022)));
  const gapY = isShortScreen ? Math.max(10, Math.min(18, Math.round(bentoH * 0.026))) : Math.max(16, Math.min(26, Math.round(bentoH * 0.036)));

  // Column 1 (Left Tall Card - Card 0):
  // Spans full height of the bento composition (~29.5% width)
  const w0 = Math.round((bentoW - gapX * 2) * 0.295);
  const h0 = bentoH;

  // Remaining width for Columns 2 & 3:
  const remW = bentoW - w0 - gapX;
  const availRowW = remW - gapX;

  // Asymmetric Row Heights:
  // Row 1 (Cards 1 & 2 have minimal concise copy) gets ~43% height (~260px - 285px)
  // Row 2 (Cards 3 & 4 have 4 & 5 detailed scenario clusters) gets ~57% height (~345px - 380px)
  const hRow1 = Math.round((bentoH - gapY) * 0.43);
  const hRow2 = bentoH - gapY - hRow1;

  // Row 1 (Top):
  // Card 1 (Skip the dashboards. Just ask.) is wider (~61%), Card 2 (See everything) is narrower (~39%)
  const w1 = availRowW - Math.round(availRowW * 0.39);
  const h1 = hRow1;
  const w2 = availRowW - w1;
  const h2 = hRow1;

  // Row 2 (Bottom):
  // Card 3 (Know your risk) gets ~49% width, Card 4 (Plan Ahead, 5 items) gets ~51% width
  const w3 = Math.round(availRowW * 0.49);
  const h3 = hRow2;
  const w4 = availRowW - w3;
  const h4 = hRow2;

  const tileWidths = [w0, w1, w2, w3, w4];
  const tileHeights = [h0, h1, h2, h3, h4];

  // Live vertical offset of cardsClusterRef top edge within the viewport when settled.
  // The caller measures this (via offsetTop, which is unaffected by an active GSAP
  // transform, unlike getBoundingClientRect()); when it isn't measurable yet, fall
  // back to the same breakpoint-keyed constant the original inline version used.
  const clusterViewportTopResolved = clusterViewportTop !== undefined
    ? clusterViewportTop
    : (vWidth >= 1024 ? 5 : vWidth >= 768 ? 4.5 : vWidth >= 640 ? 4 : 3.5) * 16 + 8 + 6;

  const clusterViewportLeft = vWidth > 1340 ? (vWidth - 1340) / 2 : 0;

  // Single Bounding Box position in viewport coordinates:
  const bentoViewportLeft = (vWidth - bentoW) / 2;
  const bentoViewportTop = usableCenterY - bentoH / 2;

  // Convert bounding box origin to coordinates relative to cardsClusterRef:
  const bentoClusterLeft = bentoViewportLeft - clusterViewportLeft;
  const bentoClusterTop = bentoViewportTop - clusterViewportTopResolved;

  const rightColLeft = bentoClusterLeft + w0 + gapX;

  // Absolute left coordinates of the 5 tiles relative to cardsClusterRef:
  const tileLefts = [
    bentoClusterLeft,             // Card 0 (Left Tall Tile)
    rightColLeft,                 // Card 1 (Row 1 Left)
    rightColLeft + w1 + gapX,     // Card 2 (Row 1 Right)
    rightColLeft,                 // Card 3 (Row 2 Left)
    rightColLeft + w3 + gapX,     // Card 4 (Row 2 Right)
  ];

  // Absolute top coordinates of the 5 tiles relative to cardsClusterRef:
  const tileTops = [
    bentoClusterTop,               // Card 0
    bentoClusterTop,               // Card 1
    bentoClusterTop,               // Card 2
    bentoClusterTop + hRow1 + gapY, // Card 3 (Row 2 starts after Row 1)
    bentoClusterTop + hRow1 + gapY, // Card 4 (Row 2 starts after Row 1)
  ];

  return {
    bentoW,
    bentoH,
    gapX,
    gapY,
    tileWidths,
    tileHeights,
    tileLefts,
    tileTops,
  };
}

export interface DockGeometryInput {
  /** Live viewport width. NOTE: this is intentionally the RAW/live browser
   * viewport measurement, not the clamped/tiered value from
   * `getComposedViewport()` — see the comment on `computeDockGeometry`
   * below before changing this. */
  vWidth: number;
  /** Live viewport height — same raw/unclamped caveat as vWidth above. */
  vHeight: number;
  clusterCenterX: number;
  clusterCenterY: number;
  clusterW: number;
  clusterH: number;
  bento: BentoGeometry;
}

export interface DockGeometry {
  stackTargetX: number;
  stackTargetY: number;
  stackCardScale: number;
  targetLeftX: number;
  targetRingY: number;
  rightShiftX: number;
  heroShiftX: number;
  securityHeadingY: number;
  targetCardLeft: number;
  targetCardTop: number;
  restingWidth: number;
  hRest: number;
  finalVaultW: number;
}

/**
 * Computes the resting "docked" layout (safe/vault position, security
 * heading shift, bento stack target) from the given viewport + cluster
 * measurements. Transcribed verbatim from the original `computeDockLayout`
 * closure.
 *
 * KNOWN, INTENTIONALLY-DEFERRED ISSUE (see
 * `Docs/2026-09-22-scroll-and-animation-glitch-root-cause-report.md` §1b):
 * `vWidth`/`vHeight` here are the raw, unclamped live browser viewport
 * dimensions, not the tiered/clamped values from `getComposedViewport()`
 * that the rest of the codebase uses for composition math.
 * `viewportCenterX`/`viewportCenterY` below therefore drift with real
 * window size past the 1440-wide reference frame, which the root-cause
 * report flags as a bug and suggests fixing by switching to the clamped
 * values. This task is a pure, behavior-preserving extraction (task 1 of the
 * BlueprintHero file-split plan) — it deliberately reproduces this behavior
 * exactly rather than fixing it, so the fix (if wanted) can be made
 * deliberately, in its own task, with its own visual verification — not
 * silently folded into a "move code, don't change it" step.
 */
export function computeDockGeometry(input: DockGeometryInput): DockGeometry {
  const { vWidth, vHeight, clusterCenterX, clusterCenterY, clusterW, clusterH, bento } = input;

  const isDesktop = vWidth >= 1024;
  const isTablet = vWidth >= 768;

  const restingWidth = isDesktop ? 225 : isTablet ? 195 : 175;
  const hRest = getCardRestHeight(vWidth, vHeight);

  // Destination stack point for Phase 1: Card 03 ("See Everything", idx === 2)
  const targetCardLeft = Math.round(bento.tileLefts[2] + (bento.tileWidths[2] - restingWidth) / 2);
  const targetCardTop = Math.round(bento.tileTops[2] + (bento.tileHeights[2] - hRest) / 2);
  const stackTargetX = Math.round(targetCardLeft + restingWidth / 2 - clusterW / 2);
  const stackTargetY = Math.round(targetCardTop + hRest / 2 - clusterH / 2);

  const stackCardScale = isDesktop ? 0.62 : isTablet ? 0.58 : 0.54;

  // Viewport centering offset: positions the safe docked on the left side of the viewport
  const viewportCenterY = vHeight / 2;
  const viewportCenterX = vWidth / 2;

  const isMobileScreen = vWidth < 768;
  const isTabletScreen = vWidth >= 768 && vWidth < 1024;
  const isDesktopScreen = vWidth >= 1024;

  // Visual proportions of vault & heading matching reference composition
  // Responsive clamp:
  // - On large screens (1920+), vault reaches 460-480px for high visual presence
  // - On MacBooks and standard laptops (1366-1440), vault scales smoothly with 44% of viewport height (340-400px)
  // - On tablets (768-1023), vault is 260-320px
  // - On mobile (<768), vault is 200-260px
  const effectiveVaultW = isDesktopScreen
    ? Math.round(Math.min(520, Math.max(380, Math.min(vHeight * 0.54, vWidth * 0.36))))
    : isTabletScreen
    ? Math.round(Math.min(380, Math.max(300, Math.min(vHeight * 0.44, vWidth * 0.44))))
    : Math.round(Math.min(300, Math.max(220, Math.min(vHeight * 0.35, vWidth * 0.70))));

  const headingW = isDesktopScreen
    ? (vWidth >= 1600 ? 540 : vWidth >= 1280 ? 480 : 440)
    : isTabletScreen
    ? Math.min(360, Math.round(vWidth * 0.44))
    : Math.min(vWidth - 40, 340);

  const gap = isDesktopScreen
    ? Math.round(Math.min(84, Math.max(48, (vWidth - effectiveVaultW - headingW) * 0.22)))
    : isTabletScreen
    ? Math.round(Math.max(28, vWidth * 0.035))
    : 20;

  // Symmetric composition with safety margin protection across all viewports:
  // Group total width = vault width + gap + heading width.
  // Vault is on the left, heading is on the right, centered with equal margins.
  const minMargin = isMobileScreen ? 16 : isTabletScreen ? 32 : 48;
  const maxCompW = vWidth - minMargin * 2;
  let finalVaultW = effectiveVaultW;
  let finalHeadingW = headingW;
  let finalGap = gap;
  const compW = finalVaultW + finalGap + finalHeadingW;
  if (compW > maxCompW && !isMobileScreen) {
    const shrinkFactor = maxCompW / compW;
    finalVaultW = Math.round(finalVaultW * shrinkFactor);
    finalHeadingW = Math.round(finalHeadingW * shrinkFactor);
    finalGap = Math.max(20, Math.round(finalGap * shrinkFactor));
  }

  // Symmetrical offsets from screen center:
  // Left margin strictly equals right margin: (vWidth - compW) / 2
  const leftShift = isMobileScreen ? 0 : Math.round((finalHeadingW + finalGap) / 2);
  const rightShiftX = isMobileScreen ? 0 : Math.round((finalVaultW + finalGap) / 2);
  const heroShiftX = rightShiftX;

  const targetRingX = Math.round(viewportCenterX - clusterCenterX);
  const targetLeftX = targetRingX - leftShift;

  // Vertical positioning:
  // On desktop/tablet, both vault and heading vertical centers match at viewportCenterY.
  // On mobile, vault sits above center and heading sits below.
  const mobileVaultYOffset = Math.round(Math.min(vHeight * 0.13, 100));
  const mobileHeadingYOffset = Math.round(Math.min(vHeight * 0.17, 135));

  const targetRingY = Math.round(viewportCenterY - clusterCenterY) + (isMobileScreen ? -mobileVaultYOffset : 0);
  const securityHeadingY = isMobileScreen ? mobileHeadingYOffset : 0;

  return {
    stackTargetX,
    stackTargetY,
    stackCardScale,
    targetLeftX,
    targetRingY,
    rightShiftX,
    heroShiftX,
    securityHeadingY,
    targetCardLeft,
    targetCardTop,
    restingWidth,
    hRest,
    finalVaultW,
  };
}
