"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConsentVisual, TrustHighlights, RestVisual, TransitVisual } from "@/components/hero/TrustHighlights";
import { MoneyWord } from "@/components/security/MoneyWord";
import { SecurityVaultVisual } from "@/components/security/SecurityVaultVisual";
import { SECURITY_HEADLINE, SECURITY_PRINCIPLES, type SecurityPrinciple } from "@/lib/securityCopy";
import {
  SCROLL_IDLE_MS,
  SCROLL_MAX_MS,
  SNAP_RESTORE_MS,
  centeredScrollLeft,
  contentCenter,
  nearestIndex,
  shouldAdvance,
  trustSlideVisual,
  wrapIndex,
} from "@/lib/securityStoryboard";
import { SAMPLE_FIGURE, TRUST_STATES, maskFigure, type TrustState } from "@/lib/trustHighlights";

/**
 * Security section content: headline (with the "money" banknote word), the vault illustration, the four
 * principles and the hero's trust block (Locked at rest / in transit / to you), centred and card-less.
 * Desktop (>= 900px): vault left, headline and the 2 x 2 principles right, trust block below.
 * Tablet (640-900px): headline, vault, principles, trust block.
 * Phone (< 640px): headline, vault, then ONE centred carousel of 7 slides (the four principles, then the
 * three Locked states): auto-advances every 2.5 s while visible, swipe works and restarts the wait,
 * tap-and-hold pauses, no dots or arrows. Static section: no pinning, no scroll hijacking.
 * Approved design: Docs/reference/security-section-prototype.html.
 */

export const SECURITY_HEADING_ID = "security-heading";

const PHONE_QUERY = "(max-width: 639.98px)"; // Tailwind `max-sm`
const TICK_MS = 40;

type Slide = { kind: "principle"; principle: SecurityPrinciple } | { kind: "trust"; state: TrustState };

const SLIDES: Slide[] = [
  ...SECURITY_PRINCIPLES.map((principle) => ({ kind: "principle" as const, principle })),
  ...TRUST_STATES.map((state) => ({ kind: "trust" as const, state })),
];
const SLIDE_COUNT = SLIDES.length;

const REDUCED_VISUAL = { figure: maskFigure(SAMPLE_FIGURE, 1), badgeOn: true, toggleOff: false };

function PrincipleIcon({ principle, className }: { principle: SecurityPrinciple; className: string }) {
  return (
    <div aria-hidden="true" className={`relative flex-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={principle.icon.src}
        width={principle.icon.width}
        height={principle.icon.height}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`relative block h-full w-full mix-blend-multiply security-icon security-icon-${principle.id}`}
      />
      {principle.id === "sell" && (
        <span className="security-icon-ring pointer-events-none absolute inset-[6%] rounded-full border-[1.5px] border-[#22C55E]" />
      )}
    </div>
  );
}

function TrustSlideText({ state, animate }: { state: TrustState; animate: boolean }) {
  return (
    <>
      {state.subtext.map((part, i) =>
        part.kw ? (
          <span key={i} className="trust-kw" style={animate ? undefined : { animation: "none" }}>
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

export function SecuritySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  // bumps every time a slide becomes active, so its key-word underline replays
  const [activation, setActivation] = useState(0);
  const [visual, setVisual] = useState(() => trustSlideVisual("rest", 0));
  const [reduced, setReduced] = useState(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  const activatedAtRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());
  const heldElapsedRef = useRef(0);
  const isHoldingRef = useRef(false);
  const busyRef = useRef(false);
  const isVisibleRef = useRef(false);
  const isPhoneRef = useRef(false);
  const reducedRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visualFor = useCallback((index: number, elapsedMs: number) => {
    const slide = SLIDES[index];
    if (!slide || slide.kind !== "trust") return trustSlideVisual("transit", 0);
    if (reducedRef.current) return REDUCED_VISUAL;
    return trustSlideVisual(slide.state.visual, elapsedMs);
  }, []);

  // A slide becomes the active one: its visuals (and key-word underline) start over.
  const activate = useCallback(
    (index: number) => {
      activeRef.current = index;
      activatedAtRef.current = Date.now();
      setActiveIndex(index);
      setActivation((n) => n + 1);
      setVisual(visualFor(index, 0));
    },
    [visualFor]
  );

  // Slide centres measured with getBoundingClientRect (same approach as components/product/ProductSection.tsx).
  const nearestSlide = useCallback(() => {
    const el = trackRef.current;
    if (!el) return activeRef.current;
    const tr = el.getBoundingClientRect();
    const centers = Array.from(el.children).map((c) => {
      const r = c.getBoundingClientRect();
      return contentCenter(r.left, r.width, tr.left, el.scrollLeft);
    });
    return nearestIndex(centers, el.scrollLeft + el.clientWidth / 2);
  }, []);

  const endProgrammaticScroll = useCallback(() => {
    busyRef.current = false;
    const n = nearestSlide();
    if (n !== activeRef.current) activate(n);
  }, [activate, nearestSlide]);

  // Move to a slide with native smooth scroll and give it a full wait.
  const goTo = useCallback(
    (target: number) => {
      const el = trackRef.current;
      const index = wrapIndex(target, SLIDE_COUNT);
      startTimeRef.current = Date.now();
      heldElapsedRef.current = 0;
      activate(index);
      if (!el) return;
      const slide = el.children[index] as HTMLElement | undefined;
      if (!slide) return;
      busyRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(endProgrammaticScroll, SCROLL_MAX_MS);
      // snapping is paused so it cannot fight the smooth scroll, then restored
      el.style.scrollSnapType = "none";
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      snapTimerRef.current = setTimeout(() => {
        el.style.scrollSnapType = "";
      }, SNAP_RESTORE_MS);
      const tr = el.getBoundingClientRect();
      const r = slide.getBoundingClientRect();
      el.scrollTo({ left: centeredScrollLeft(r.left, r.width, tr.left, el.clientWidth, el.scrollLeft), behavior: "smooth" });
    },
    [activate, endProgrammaticScroll]
  );

  // Back to slide 1 with a full wait (on arrival and when the phone layout starts).
  const restartFromFirst = useCallback(() => {
    const el = trackRef.current;
    busyRef.current = false;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (el) el.scrollLeft = 0;
    startTimeRef.current = Date.now();
    heldElapsedRef.current = 0;
    activate(0);
  }, [activate]);

  const handleScroll = useCallback(() => {
    if (busyRef.current) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(endProgrammaticScroll, SCROLL_IDLE_MS);
      return;
    }
    // a swipe: follow the slide nearest the centre and restart the wait
    const n = nearestSlide();
    if (n !== activeRef.current) activate(n);
    startTimeRef.current = Date.now();
    heldElapsedRef.current = 0;
  }, [activate, endProgrammaticScroll, nearestSlide]);

  // Tap-and-hold pauses, release resumes from the same moment.
  const handleHoldStart = useCallback(() => {
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;
    heldElapsedRef.current = Date.now() - startTimeRef.current;
  }, []);

  const handleHoldEnd = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    startTimeRef.current = Date.now() - heldElapsedRef.current;
  }, []);

  // The 40 ms tick only runs while the phone carousel is on screen.
  const tick = useCallback(() => {
    if (document.visibilityState === "hidden") return;
    const now = Date.now();
    const elapsed = isHoldingRef.current ? heldElapsedRef.current : now - startTimeRef.current;
    if (
      shouldAdvance({
        phone: isPhoneRef.current,
        visible: isVisibleRef.current,
        reduced: reducedRef.current,
        holding: isHoldingRef.current,
        busy: busyRef.current,
        docHidden: false,
        elapsedMs: elapsed,
      })
    ) {
      goTo(activeRef.current + 1);
      return;
    }
    const next = visualFor(activeRef.current, now - activatedAtRef.current);
    setVisual((prev) =>
      prev.figure === next.figure && prev.badgeOn === next.badgeOn && prev.toggleOff === next.toggleOff ? prev : next
    );
  }, [goTo, visualFor]);

  const syncTicker = useCallback(() => {
    const run = isPhoneRef.current && isVisibleRef.current;
    if (run && tickRef.current === null) tickRef.current = setInterval(tick, TICK_MS);
    if (!run && tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [tick]);

  // Phone layout and reduced-motion preference
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const wasPhone = isPhoneRef.current;
      isPhoneRef.current = phone.matches;
      reducedRef.current = motion.matches;
      setReduced(motion.matches);
      if (phone.matches && !wasPhone) restartFromFirst();
      syncTicker();
    };
    update();
    phone.addEventListener?.("change", update);
    motion.addEventListener?.("change", update);
    return () => {
      phone.removeEventListener?.("change", update);
      motion.removeEventListener?.("change", update);
    };
  }, [restartFromFirst, syncTicker]);

  // Runs only while visible; every arrival starts again on slide 1.
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1]?.isIntersecting ?? false;
        if (visible && !isVisibleRef.current && isPhoneRef.current) restartFromFirst();
        isVisibleRef.current = visible;
        syncTicker();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [restartFromFirst, syncTicker]);

  // Timers
  useEffect(
    () => () => {
      if (tickRef.current !== null) clearInterval(tickRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    },
    []
  );

  return (
    <div className="mx-auto w-full max-w-[1008px] font-sans">
      <div className="grid grid-cols-1 items-start gap-y-[clamp(14px,2vw,22px)] min-[900px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] min-[900px]:grid-rows-[auto_1fr] min-[900px]:gap-x-[clamp(12px,2.4vw,32px)]">
        {/* Headline */}
        <div className="flex flex-col items-center text-center min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:items-start min-[900px]:self-end min-[900px]:pt-[clamp(0px,1.2vw,14px)] min-[900px]:text-left">
          <h2
            id={SECURITY_HEADING_ID}
            className="mt-3 max-w-[11.6em] font-heading text-[length:clamp(27px,4.1vw,46px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#111613] max-sm:px-1"
          >
            {SECURITY_HEADLINE.lead}
            <span className="text-[#22C55E]">{SECURITY_HEADLINE.emphasis}</span>
            {SECURITY_HEADLINE.middle}
            <MoneyWord word={SECURITY_HEADLINE.money} />
            {SECURITY_HEADLINE.tail}
          </h2>
        </div>

        {/* Vault, vertically centred against the right column on desktop */}
        <div className="pointer-events-none w-full max-[899.98px]:mx-auto max-[899.98px]:max-w-[560px] min-[900px]:col-start-1 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:-ml-[36%] min-[900px]:w-[134%] min-[900px]:self-center">
          <SecurityVaultVisual />
        </div>

        {/* Four principles, 2 x 2 with hairline dividers (the phone shows them in the carousel instead) */}
        <ul className="grid grid-cols-2 border-t border-[rgba(17,22,19,0.08)] max-sm:hidden min-[900px]:col-start-2 min-[900px]:row-start-2">
          {SECURITY_PRINCIPLES.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-[clamp(10px,1.4vw,16px)] border-b border-[rgba(17,22,19,0.08)] py-[clamp(14px,1.9vw,22px)] pr-[clamp(8px,1.3vw,16px)] even:border-l even:pl-[clamp(10px,1.8vw,22px)] even:pr-0"
            >
              <PrincipleIcon principle={p} className="h-[clamp(40px,4.6vw,52px)] w-[clamp(40px,4.6vw,52px)]" />
              <div className="min-w-0">
                <h3 className="font-heading text-[length:clamp(14.5px,1.35vw_+_5px,17px)] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#111613]">
                  {p.title}
                </h3>
                <p className="mt-[5px] text-[length:clamp(12.5px,1vw_+_5px,14.5px)] leading-[1.45] text-[#6B7A70]">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Trust block: the hero's, centred, floating on the page (no card) */}
      <div className="mt-[clamp(18px,3vw,34px)] flex justify-center overflow-hidden px-4 pt-[clamp(10px,2vw,20px)] max-sm:mt-2 min-[640px]:pb-8">
        <div className="min-h-[118px] w-full origin-top max-sm:hidden min-[640px]:scale-[1.12]">
          <TrustHighlights align="center" />
        </div>

        {/* Phone: one centred block sliding through the four principles and the three locks */}
        <div
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="How Unifolio protects your data"
          className="hidden w-full max-sm:block"
        >
          <div
            ref={trackRef}
            onScroll={handleScroll}
            onPointerDown={handleHoldStart}
            onPointerUp={handleHoldEnd}
            onPointerCancel={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldEnd}
            className="flex snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {SLIDES.map((slide, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${SLIDE_COUNT}`}
                  className="flex min-h-[150px] flex-[0_0_100%] snap-center flex-col items-center px-1 text-center"
                >
                  {slide.kind === "principle" ? (
                    <>
                      <PrincipleIcon principle={slide.principle} className="-mt-0.5 h-[60px] w-[60px]" />
                      <h3 className="mt-3 font-heading text-[23px] font-extrabold leading-[1.1] tracking-[-0.035em] text-[#111613]">
                        {slide.principle.title}
                      </h3>
                      <p className="mt-[7px] max-w-[30ch] text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-[#3A473E] [text-wrap:balance]">
                        {slide.principle.body}
                      </p>
                    </>
                  ) : (
                    <div
                      key={isActive ? `on-${activation}` : "off"}
                      className="flex flex-col items-center"
                    >
                      <div aria-hidden="true" className="flex h-[44px] -translate-y-2 items-center">
                        <div className="origin-center scale-[1.2]">
                          {slide.state.visual === "rest" && (
                            <RestVisual
                              figure={isActive ? visual.figure : reduced ? REDUCED_VISUAL.figure : SAMPLE_FIGURE}
                              badgeOn={isActive ? visual.badgeOn : reduced}
                            />
                          )}
                          {slide.state.visual === "transit" && <TransitVisual />}
                          {slide.state.visual === "consent" && <ConsentVisual off={isActive && visual.toggleOff} />}
                        </div>
                      </div>
                      <h3 className="mt-3 font-heading text-[23px] font-extrabold leading-[1.1] tracking-[-0.035em] text-[#111613]">
                        {slide.state.heading}
                      </h3>
                      <p className="mt-[7px] max-w-[30ch] text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-[#3A473E] [text-wrap:balance]">
                        <TrustSlideText state={slide.state} animate={isActive} />
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
