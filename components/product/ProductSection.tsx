"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductStoryboardVisual } from "@/components/product/ProductStoryboardVisual";
import { PRODUCT_CARDS, PRODUCT_HEADLINE } from "@/lib/productCopy";
import {
  CAROUSEL_DURATION_MS,
  centeredScrollLeft,
  contentCenter,
  nearestIndex,
  wrapIndex,
} from "@/lib/productStoryboard";

/**
 * Product section content: headline, animated illustration and the three Track / Analyse / Plan cards.
 * Desktop and tablet: the cards sit in one row. Phone (< 640px): the same cards become a swipeable carousel
 * whose timing matches components/blueprint/MobileProductCarousel.tsx (3 s auto-advance while visible,
 * tap-and-hold pause, manual swipe restarts the wait, arrows move exactly one card and wrap).
 * Approved design: Docs/reference/product-section-prototype.html.
 */

export const PRODUCT_HEADING_ID = "product-heading";

const CARDS_COUNT = PRODUCT_CARDS.length;
const PHONE_QUERY = "(max-width: 639.98px)"; // Tailwind `max-sm`
const FLOAT_CLASSES = ["product-ill-float-a", "product-ill-float-b", "product-ill-float-c"];

export function ProductSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef(false);
  const isPhoneRef = useRef(false);
  const reducedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const isHoldingRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const pausedElapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Card centres measured with getBoundingClientRect (offsetLeft is relative to the wrong parent here).
  const cardCenters = useCallback((el: HTMLDivElement) => {
    const tr = el.getBoundingClientRect();
    return Array.from(el.children).map((c) => {
      const r = c.getBoundingClientRect();
      return contentCenter(r.left, r.width, tr.left, el.scrollLeft);
    });
  }, []);

  const scrollToCard = useCallback((index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    const tr = el.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    el.scrollTo({ left: centeredScrollLeft(r.left, r.width, tr.left, el.clientWidth, el.scrollLeft), behavior: "smooth" });
  }, []);

  // Jump to a specific card and reset the timer
  const goToCard = useCallback(
    (index: number) => {
      isHoldingRef.current = false;
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = 0;
      setActiveIndex(index);
      scrollToCard(index);
    },
    [scrollToCard]
  );

  // Manual scrolling / swiping: restart the wait and follow the card nearest the centre
  const handleScroll = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;
    const el = carouselRef.current;
    if (!el) return;
    setActiveIndex(nearestIndex(cardCenters(el), el.scrollLeft + el.clientWidth / 2));
  }, [cardCenters]);

  // Tap-and-hold pauses, release resumes from the same moment
  const handleHoldStart = useCallback(() => {
    isHoldingRef.current = true;
    pausedElapsedRef.current = Date.now() - startTimeRef.current;
  }, []);

  const handleHoldEnd = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    startTimeRef.current = Date.now() - pausedElapsedRef.current;
  }, []);

  // Phone layout and reduced-motion preference
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const wasPhone = isPhoneRef.current;
      isPhoneRef.current = phone.matches;
      reducedRef.current = motion.matches;
      if (phone.matches && !wasPhone) {
        // entering the carousel layout: give the current card a full 3 s
        startTimeRef.current = Date.now();
        pausedElapsedRef.current = 0;
      }
    };
    update();
    phone.addEventListener?.("change", update);
    motion.addEventListener?.("change", update);
    return () => {
      phone.removeEventListener?.("change", update);
      motion.removeEventListener?.("change", update);
    };
  }, []);

  // Only start the auto-advance once the section is reached, starting on card 1
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          isVisibleRef.current = true;
          if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            setActiveIndex(0);
            scrollToCard(0);
            startTimeRef.current = Date.now();
            pausedElapsedRef.current = 0;
          }
        } else {
          isVisibleRef.current = false;
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollToCard]);

  // Auto-advance every 3 s (phone only; paused while held, off screen, or with reduced motion)
  useEffect(() => {
    const loop = () => {
      if (isVisibleRef.current && isPhoneRef.current && !reducedRef.current && !isHoldingRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= CAROUSEL_DURATION_MS) {
          startTimeRef.current = Date.now();
          pausedElapsedRef.current = 0;
          setActiveIndex((prev) => {
            const next = wrapIndex(prev + 1, CARDS_COUNT);
            scrollToCard(next);
            return next;
          });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollToCard]);

  return (
    <div className="w-full flex flex-col items-center font-sans">
      <h2
        id={PRODUCT_HEADING_ID}
        className="font-heading font-extrabold text-[length:clamp(28px,5.2vw,52px)] tracking-[-0.04em] leading-[1.08] text-[#111613] text-center max-w-[20ch] [text-wrap:balance] max-sm:px-4"
      >
        {PRODUCT_HEADLINE.lead}
        <span className="text-[#22C55E]">{PRODUCT_HEADLINE.emphasis}</span>
      </h2>

      <ProductStoryboardVisual className="max-w-[1070px] mx-auto mt-[clamp(14px,2.4vw,28px)] max-sm:mt-3" />

      <div
        ref={containerRef}
        className="w-full max-w-[1180px] mt-[clamp(16px,2.6vw,30px)] max-sm:max-w-none"
        onPointerDown={handleHoldStart}
        onPointerUp={handleHoldEnd}
        onPointerCancel={handleHoldEnd}
        onPointerLeave={handleHoldEnd}
      >
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onPointerDown={handleHoldStart}
          onPointerUp={handleHoldEnd}
          onPointerCancel={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
          className="grid grid-cols-3 gap-[clamp(12px,1.6vw,20px)] max-sm:flex max-sm:gap-[14px] max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-smooth max-sm:px-4 max-sm:pt-1.5 max-sm:pb-2.5 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {PRODUCT_CARDS.map((card, i) => (
            <article
              key={card.num}
              className="relative flex flex-col min-w-0 overflow-hidden bg-white border border-[rgba(17,22,19,0.07)] rounded-[20px] px-[clamp(18px,2.2vw,28px)] pt-[clamp(18px,2.2vw,28px)] pb-[clamp(18px,2.2vw,26px)] min-h-[clamp(210px,24vw,250px)] shadow-[0_1px_0_rgba(17,22,19,0.02),0_24px_40px_-34px_rgba(17,22,19,0.28)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_1px_0_rgba(17,22,19,0.02),0_30px_46px_-30px_rgba(34,197,94,0.4)] sm:max-[900px]:px-4 max-sm:flex-[0_0_84%] max-sm:max-w-[380px] max-sm:snap-center max-sm:min-h-[250px] max-sm:px-[22px] max-sm:pt-[22px] max-sm:pb-[128px]"
            >
              <div className="flex items-center gap-2.5 text-[11.5px] font-bold tracking-[0.14em] uppercase text-[#6B7A70]">
                <span className="w-[30px] h-[30px] rounded-full bg-[#EAF8EF] text-[#15803D] flex items-center justify-center text-[12px] tracking-normal font-extrabold">
                  {card.num}
                </span>
                {card.label}
              </div>
              <h3 className="font-heading font-extrabold text-[length:clamp(20px,1.9vw_+_4px,26px)] tracking-[-0.035em] leading-[1.12] text-[#111613] mt-4 max-w-[80%] sm:max-[900px]:text-[length:clamp(17px,2.3vw,20px)] sm:max-[900px]:max-w-full max-sm:text-[24px] max-sm:max-w-none">
                {card.titleLead}
                <span className="text-[#22C55E]">{card.titleEmphasis}</span>
              </h3>
              <p className="relative z-[1] mt-2.5 text-[length:clamp(13.5px,1.1vw_+_6px,15px)] leading-[1.5] text-[#6B7A70] max-w-[calc(100%_-_clamp(70px,8.4vw,104px))] sm:max-[900px]:text-[13px] sm:max-[900px]:max-w-full sm:max-[900px]:pb-[70px] max-sm:text-[15px] max-sm:max-w-full">
                {card.body}
              </p>
              <div
                aria-hidden="true"
                className={`absolute pointer-events-none will-change-transform right-[clamp(12px,1.6vw,20px)] bottom-[clamp(16px,2vw,24px)] ${
                  i === 2 ? "w-[clamp(74px,9vw,110px)]" : "w-[clamp(66px,8vw,98px)]"
                } sm:max-[900px]:w-[clamp(56px,9vw,70px)] max-sm:right-4 max-sm:bottom-[14px] max-sm:w-[112px] ${FLOAT_CLASSES[i] ?? ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.illustration.src}
                  width={card.illustration.width}
                  height={card.illustration.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block w-full h-auto"
                />
              </div>
            </article>
          ))}
        </div>

        {/* Phone only: prev / next arrows and indicator pills */}
        <div className="hidden max-sm:flex items-center justify-center gap-3 mt-2.5">
          <button
            type="button"
            onClick={() => goToCard(wrapIndex(activeIndex - 1, CARDS_COUNT))}
            aria-label="Previous card"
            className="w-8 h-8 rounded-full bg-white/85 border border-[rgba(17,22,19,0.08)] flex items-center justify-center text-[#3F4C43] shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-[7px] rounded-full bg-white/75 border border-[rgba(17,22,19,0.06)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {PRODUCT_CARDS.map((card, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={card.num}
                  type="button"
                  onClick={() => goToCard(idx)}
                  aria-label={`Go to card ${idx + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive ? "w-7 bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.45)]" : "w-2 bg-[#D4D4D4]"
                  }`}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => goToCard(wrapIndex(activeIndex + 1, CARDS_COUNT))}
            aria-label="Next card"
            className="w-8 h-8 rounded-full bg-white/85 border border-[rgba(17,22,19,0.08)] flex items-center justify-center text-[#3F4C43] shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-95 transition-transform"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
