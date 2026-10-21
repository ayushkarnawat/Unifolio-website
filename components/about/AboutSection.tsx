"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AboutIllustration } from "@/components/about/AboutIllustration";
import {
  ABOUT_CLOSING,
  ABOUT_CLOSING_FIT,
  ABOUT_HEADLINE,
  ABOUT_LINE,
  ABOUT_LINE_FIT,
} from "@/lib/aboutCopy";
import { fitFontSize } from "@/lib/aboutIllustration";

/**
 * About section content: headline, the line under it, the animated family illustration and the closing
 * statement ("Better clarity. Smarter decisions.") joined to it by a dotted line, with a green underline
 * that draws in once. Static section: no pinning, no scroll choreography.
 * Desktop (>= 900px): headline over the line on the left, illustration on the right, closing statement below.
 * Tablet (640-900px) and phone: everything stacked and centred; on tablet each headline line stays on one line.
 * Sizes use container units (cqw) of the section, as in the approved design:
 * Docs/reference/about-section-prototype.html.
 */

export const ABOUT_HEADING_ID = "about-heading";

/**
 * Keeps a sentence on ONE line: shrinks its font (down to `min`) until it fits the width of its parent row,
 * and only lets it wrap below that. Re-runs on resize and once the web fonts have loaded.
 */
function useFitOneLine(ref: RefObject<HTMLElement>, max: number, min: number) {
  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    let disposed = false;

    const fit = () => {
      if (disposed) return;
      const cs = getComputedStyle(box);
      const avail = box.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      el.style.whiteSpace = "nowrap";
      el.style.fontSize = `${max}px`;
      const { size, nowrap } = fitFontSize(max, min, avail, el.scrollWidth);
      el.style.fontSize = `${size}px`;
      el.style.whiteSpace = nowrap ? "nowrap" : "normal";
    };

    const ro = new ResizeObserver(fit);
    ro.observe(box);
    fit();
    document.fonts?.ready.then(fit, () => {});
    const timer = window.setTimeout(fit, 300);

    return () => {
      disposed = true;
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [ref, max, min]);
}

/** Green hand-drawn curve that is drawn by scrolling: it grows as it moves up through the viewport. */
function DrawnLine({ className }: { className: string }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    const path = pathRef.current;
    if (!el || !path) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the line enters near the bottom of the screen, 1 when it reaches about 58% of the way up
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.37)));
      path.style.strokeDashoffset = String(100 * (1 - p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 190 8"
      preserveAspectRatio="none"
      className={`overflow-visible ${className}`}
    >
      <path
        ref={pathRef}
        d="M2 5 C40 1 110 1 188 4"
        pathLength={100}
        fill="none"
        stroke="#22C55E"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={100}
        style={{ strokeDashoffset: 100 }}
      />
    </svg>
  );
}

export function AboutSection() {
  const lineRef = useRef<HTMLParagraphElement | null>(null);
  const closingLineRef = useRef<HTMLParagraphElement | null>(null);

  useFitOneLine(lineRef, ABOUT_LINE_FIT.max, ABOUT_LINE_FIT.min);
  useFitOneLine(closingLineRef, ABOUT_CLOSING_FIT.max, ABOUT_CLOSING_FIT.min);

  return (
    <div className="mx-auto w-full max-w-[1180px] font-sans">
      <div className="grid grid-cols-1 items-center justify-items-center gap-y-[clamp(14px,2cqw,24px)] text-center min-[900px]:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] min-[900px]:justify-items-stretch min-[900px]:gap-x-[clamp(18px,4cqw,56px)] min-[900px]:text-left">
        <div className="min-[900px]:col-start-1 min-[900px]:row-start-1 min-[900px]:self-end">
          <h2
            id={ABOUT_HEADING_ID}
            className="font-heading font-extrabold leading-[1.08] tracking-[-0.04em] text-[#111613] text-[length:clamp(28px,6.4cqw,44px)] min-[640px]:max-[899.98px]:text-[length:4.8cqw] min-[900px]:text-[length:clamp(26px,3.7cqw,42px)]"
          >
            <span className="block min-[640px]:max-[899.98px]:whitespace-nowrap">{ABOUT_HEADLINE.lead}</span>{" "}
            <span className="block text-[#22C55E] min-[640px]:max-[899.98px]:whitespace-nowrap">
              {ABOUT_HEADLINE.emphasis}
            </span>
          </h2>
          <DrawnLine className="mx-auto mt-2.5 h-2 w-[clamp(110px,18cqw,190px)] min-[900px]:mx-0" />
        </div>

        <p
          ref={lineRef}
          className="text-[20px] font-medium leading-[1.5] text-[#4C5A50] min-[900px]:col-start-1 min-[900px]:row-start-2 min-[900px]:self-start"
        >
          {ABOUT_LINE}
        </p>

        <AboutIllustration className="w-full max-w-[700px] min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:-ml-[2%] min-[900px]:w-[112%] min-[900px]:max-w-none" />

        <div
          className="relative flex w-full flex-col items-center pt-[clamp(18px,3cqw,34px)] text-center min-[900px]:col-span-2 min-[900px]:row-start-3"
        >
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-[clamp(18px,3cqw,34px)] border-l-[1.5px] border-dotted border-[#9AA59D]"
          />
          <h3 className="font-heading text-[length:clamp(22px,2.6cqw_+_4px,34px)] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#111613]">
            {ABOUT_CLOSING.lead} <span className="text-[#22C55E]">{ABOUT_CLOSING.emphasis}</span>
          </h3>
          <p ref={closingLineRef} className="mt-2 text-[19px] font-medium leading-[1.4] text-[#4C5A50]">
            {ABOUT_CLOSING.line}
          </p>
          <DrawnLine className="mt-2.5 h-2 w-[clamp(110px,18cqw,190px)]" />
        </div>
      </div>
    </div>
  );
}
