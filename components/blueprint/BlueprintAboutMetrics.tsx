"use client";

/**
 * BlueprintAboutMetrics
 *
 * This component is intentionally minimal.
 *
 * ALL card rendering and semicircle animation logic has been moved into
 * BlueprintHero.tsx, where the SAME 26 ring cards (5 product + 21 companion)
 * that form the Security ring are reused — without creating new elements —
 * to physically split and fan outward into the About section semicircles.
 *
 * This component exists solely as:
 *   1. A scroll target (#about) so that navbar and scroll-detection work.
 *   2. A background surface behind the fixed Hero stage overlay.
 *
 * The About section's editorial text content is rendered inside the fixed
 * Hero stage overlay (aboutTextOverlayRef in BlueprintHero.tsx) and reveals
 * only after the semicircles have fully formed and started rotating.
 */
export function BlueprintAboutMetrics() {
  return (
    <section
      id="about"
      aria-label="About Unifolio"
      className="relative w-full min-h-screen bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500"
    />
  );
}
