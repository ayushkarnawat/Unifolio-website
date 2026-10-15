"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARDS_COUNT = 5;

export function MobileProductCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const DURATION_MS = 3000;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef(false);
  const hasStartedRef = useRef(false);
  const isHoldingRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const pausedElapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const scrollToCard = useCallback((index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.children;
    if (cards[index]) {
      const targetCard = cards[index] as HTMLElement;
      const scrollLeft = targetCard.offsetLeft - (el.clientWidth - targetCard.clientWidth) / 2;
      el.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
  }, []);

  // Jump to specific card and reset timer
  const goToCard = useCallback((index: number) => {
    isHoldingRef.current = false;
    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;
    setActiveIndex(index);
    scrollToCard(index);
  }, [scrollToCard]);

  // Handle manual user scrolling / swiping
  const handleScroll = useCallback(() => {
    // Reset timer on manual scroll so user gets full duration on the new card
    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;

    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const containerCenter = scrollLeft + el.clientWidth / 2;

    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < el.children.length; i++) {
      const card = el.children[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    setActiveIndex(closestIdx);
  }, []);

  // Instagram stories-like Tap-and-Hold to Pause / Release to Resume
  const handleHoldStart = useCallback(() => {
    isHoldingRef.current = true;
    pausedElapsedRef.current = Date.now() - startTimeRef.current;
  }, []);

  const handleHoldEnd = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    // Resume elapsed time seamlessly from exact paused moment
    startTimeRef.current = Date.now() - pausedElapsedRef.current;
  }, []);

  // IntersectionObserver: Only start auto-scroll when user reaches the Product section
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

  // Continuous auto-advance loop every 5 seconds (pauses on tap-and-hold, resumes immediately on release)
  useEffect(() => {
    const loop = () => {
      if (isVisibleRef.current && !isHoldingRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= DURATION_MS) {
          startTimeRef.current = Date.now();
          pausedElapsedRef.current = 0;
          setActiveIndex((prev) => {
            const next = (prev + 1) % CARDS_COUNT;
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
    <div
      ref={containerRef}
      className="block lg:hidden w-full mx-auto mt-2 select-none"
      onPointerDown={handleHoldStart}
      onPointerUp={handleHoldEnd}
      onPointerCancel={handleHoldEnd}
      onPointerLeave={handleHoldEnd}
    >
      {/* Horizontal Carousel Track */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        onPointerDown={handleHoldStart}
        onPointerUp={handleHoldEnd}
        onPointerCancel={handleHoldEnd}
        onPointerLeave={handleHoldEnd}
        className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory px-5 py-4 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* CARD 01: Skip the dashboards. Just ask. */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-2.5">
              Skip the dashboards. <span className="text-[#22C55E]">Just ask.</span>
            </h3>
            <p className="font-sans text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium">
              The fastest way to understand your money isn&apos;t a chart, it&apos;s a question. Ask what&apos;s dragging your returns, whether you&apos;re overexposed, or if a decision makes sense, and get an answer based on your portfolio.
            </p>
          </div>
          <div className="mt-2 sm:mt-3 flex justify-center -translate-y-3 sm:-translate-y-4">
            <img
              src="/product-cards/card-2d-1.png"
              alt="Skip the dashboards. Just ask."
              className="max-h-[185px] sm:max-h-[210px] w-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.07)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 02: See Everything */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-2.5">
              <span className="text-[#22C55E]">See</span> Everything
            </h3>
            <p className="font-sans text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium">
              From mutual funds and stocks to bank accounts, loans, credit cards, and real estate, every asset and liability you and your family hold, aggregated into a number that&apos;s actually accurate.
            </p>
          </div>
          <div className="mt-2 sm:mt-3 flex justify-center -translate-y-3 sm:-translate-y-4">
            <img
              src="/product-cards/card-2d-2.png"
              alt="See Everything"
              className="max-h-[180px] sm:max-h-[205px] w-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.07)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 03: Understand what you own */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-3">
              <span className="text-[#22C55E]">Understand</span> what you own
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <img src="/bento-icons/pulse-line.png" alt="Performance, in Context" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Performance, in Context.</strong> Real returns, measured against what matters.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/rupee-coin.png" alt="Hidden Fee Finder" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Hidden Fee Finder.</strong> What expense ratios quietly cost you.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/target.png" alt="Concentration Warning" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Concentration Warning.</strong> Too much in one stock or sector before it hurts.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/people-group.png" alt="Peer Benchmarking" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Peer Benchmarking.</strong> Compare against peers, not generic averages.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-1 sm:mt-2 flex justify-center -translate-y-3.5 sm:-translate-y-4.5">
            <img
              src="/product-cards/card-2d-3.png"
              alt="Understand What You Own"
              className="max-h-[160px] sm:max-h-[185px] w-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.07)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 04: Know Your Risk */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-3">
              <span className="text-[#22C55E]">Know</span> Your Risk
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <img src="/bento-icons/pulse-line.png" alt="Family Runway" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Family Runway.</strong> How long your family&apos;s savings would last.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/shield.png" alt="Real Safety Cushion" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Real Safety Cushion.</strong> Built from real numbers, not rules.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/stacked-coins.png" alt="Sleeping Money" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Sleeping Money.</strong> Surplus cash sitting idle.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/people-group-alt.png" alt="Family Risk Map" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Family Risk Map.</strong> Where your family is financially exposed.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-1 sm:mt-2 flex justify-center -translate-y-3.5 sm:-translate-y-4.5">
            <img
              src="/product-cards/card-2d-4.png"
              alt="Know Your Risk"
              className="max-h-[160px] sm:max-h-[185px] w-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.07)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 05: Plan Ahead */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-3">
              <span className="text-[#22C55E]">Plan</span> Ahead
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <img src="/bento-icons/rising-graph.png" alt="Financial Snapshot" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Financial Snapshot.</strong> Always know where you stand.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/target.png" alt="Stress Test" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Stress Test.</strong> How your portfolio holds against a crash.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/question-bubble.png" alt="What if I..." className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">&quot;What if I...&quot;.</strong> Model a job change, loan, or exit.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <img src="/bento-icons/stacked-sheets.png" alt="Goal Readiness" className="w-[16px] h-[16px] shrink-0 mt-0.5 object-contain" />
                <p className="text-neutral-700 text-xs font-medium leading-snug">
                  <strong className="font-bold text-neutral-950">Goal Readiness.</strong> Retirement, house, education tracked together.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-1 sm:mt-2 flex justify-center -translate-y-3.5 sm:-translate-y-4.5">
            <img
              src="/product-cards/card-2d-5.png"
              alt="Plan Ahead"
              className="max-h-[160px] sm:max-h-[185px] w-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.07)]"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Carousel Navigation Dock: Prev / Next Buttons + Dynamic Indicator Pills */}
      <div className="flex items-center justify-center gap-3 mt-4 px-4">
        <button
          type="button"
          onClick={() => {
            const prev = (activeIndex - 1 + CARDS_COUNT) % CARDS_COUNT;
            goToCard(prev);
          }}
          aria-label="Previous card"
          className="w-8 h-8 rounded-full bg-white/80 border border-black/[0.08] flex items-center justify-center text-neutral-700 shadow-sm hover:bg-white active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 5 Indicator Pills */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-black/[0.06] shadow-sm">
          {Array.from({ length: CARDS_COUNT }).map((_, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToCard(idx)}
                aria-label={`Go to card ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-7 bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.45)]"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const next = (activeIndex + 1) % CARDS_COUNT;
            goToCard(next);
          }}
          aria-label="Next card"
          className="w-8 h-8 rounded-full bg-white/80 border border-black/[0.08] flex items-center justify-center text-neutral-700 shadow-sm hover:bg-white active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
