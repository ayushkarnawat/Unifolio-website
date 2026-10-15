"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARDS_COUNT = 5;

export function MobileProductCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isInteractingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const hasStartedRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleScroll = useCallback(() => {
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

  // Continuous auto-advance loop every 5 seconds (only when visible in viewport, paused on touch/drag)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInteractingRef.current || !isVisibleRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % CARDS_COUNT;
        scrollToCard(next);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [scrollToCard]);

  const pauseAutoAdvance = () => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const resumeAutoAdvanceWithDelay = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 5000);
  };

  return (
    <div
      ref={containerRef}
      className="block lg:hidden w-full mx-auto mt-2 select-none"
      onMouseEnter={pauseAutoAdvance}
      onMouseLeave={resumeAutoAdvanceWithDelay}
      onTouchStart={pauseAutoAdvance}
      onTouchEnd={resumeAutoAdvanceWithDelay}
    >
      {/* Horizontal Carousel Track */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
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
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#22C55E] uppercase">
                01 // ASK
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            </div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-2.5">
              Skip the dashboards. <span className="text-[#22C55E]">Just ask.</span>
            </h3>
            <p className="font-sans text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium">
              The fastest way to understand your money isn&apos;t a chart, it&apos;s a question. Ask what&apos;s dragging your returns, whether you&apos;re overexposed, or if a decision makes sense, and get an answer based on your portfolio.
            </p>
          </div>
          <div className="mt-4 flex justify-center">
            <img
              src="/product-cards/card-2d-1.png"
              alt="Skip the dashboards. Just ask."
              className="max-h-[160px] sm:max-h-[185px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 02: See Everything */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#22C55E] uppercase">
                02 // ALL ASSETS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            </div>
            <h3 className="font-sans font-black text-xl sm:text-2xl tracking-[-0.03em] text-neutral-950 leading-tight mb-2.5">
              <span className="text-[#22C55E]">See</span> Everything
            </h3>
            <p className="font-sans text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium">
              From mutual funds and stocks to bank accounts, loans, credit cards, and real estate, every asset and liability you and your family hold, aggregated into a number that&apos;s actually accurate.
            </p>
          </div>
          <div className="mt-4 flex justify-center">
            <img
              src="/product-cards/card-2d-2.png"
              alt="See Everything"
              className="max-h-[155px] sm:max-h-[175px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 03: Understand what you own */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#22C55E] uppercase">
                03 // INSIGHTS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            </div>
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
          <div className="mt-3 flex justify-center">
            <img
              src="/product-cards/card-2d-3.png"
              alt="Understand What You Own"
              className="max-h-[135px] sm:max-h-[155px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 04: Know Your Risk */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#22C55E] uppercase">
                04 // RISK
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            </div>
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
          <div className="mt-3 flex justify-center">
            <img
              src="/product-cards/card-2d-4.png"
              alt="Know Your Risk"
              className="max-h-[135px] sm:max-h-[155px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              draggable={false}
            />
          </div>
        </div>

        {/* CARD 05: Plan Ahead */}
        <div className="w-[84vw] sm:w-[68vw] md:w-[56vw] max-w-[390px] shrink-0 snap-center rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] min-h-[460px] sm:min-h-[490px]">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#22C55E] uppercase">
                05 // FUTURE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            </div>
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
          <div className="mt-3 flex justify-center">
            <img
              src="/product-cards/card-2d-5.png"
              alt="Plan Ahead"
              className="max-h-[135px] sm:max-h-[155px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
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
            pauseAutoAdvance();
            const prev = (activeIndex - 1 + CARDS_COUNT) % CARDS_COUNT;
            scrollToCard(prev);
            resumeAutoAdvanceWithDelay();
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
                onClick={() => {
                  pauseAutoAdvance();
                  scrollToCard(idx);
                  resumeAutoAdvanceWithDelay();
                }}
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
            pauseAutoAdvance();
            const next = (activeIndex + 1) % CARDS_COUNT;
            scrollToCard(next);
            resumeAutoAdvanceWithDelay();
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
