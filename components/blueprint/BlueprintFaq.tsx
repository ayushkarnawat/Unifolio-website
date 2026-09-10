"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { faqContent } from "@/content/faq";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function BlueprintFaq() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const activeIdxRef = useRef<number>(0);

  const containerRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Responsive dimensions helper
  const getDimensions = useCallback(() => {
    if (typeof window === "undefined") {
      return { wActive: 560, wInactive: 270, gap: 20, peekOffset: 120 };
    }
    const width = window.innerWidth;
    if (width < 640) {
      const wActive = Math.min(360, width - 48);
      return { wActive, wInactive: 200, gap: 14, peekOffset: 0 };
    }
    if (width < 1024) {
      return { wActive: 460, wInactive: 240, gap: 16, peekOffset: 60 };
    }
    return { wActive: 560, wInactive: 270, gap: 20, peekOffset: 120 };
  }, []);

  // Fluid transition to target slide
  const goToSlide = useCallback(
    (targetIdx: number, isInitial = false) => {
      if (targetIdx < 0 || targetIdx >= faqContent.length) return;

      activeIdxRef.current = targetIdx;
      setActiveIdx(targetIdx);

      const { wActive, wInactive, gap, peekOffset } = getDimensions();
      const targetTrackX =
        targetIdx === 0 ? 0 : -(targetIdx * (wInactive + gap)) + peekOffset;

      const duration = isInitial ? 0 : prefersReducedMotion() ? 0.01 : 0.65;
      const ease = "power3.out";

      // 1. Animate Track Translation
      if (trackRef.current) {
        gsap.to(trackRef.current, {
          x: targetTrackX,
          duration,
          ease,
          overwrite: "auto",
        });
      }

      // 2. Animate Individual Card Widths
      cardRefs.current.forEach((cardEl, i) => {
        if (!cardEl) return;
        const isActive = i === targetIdx;
        const targetWidth = isActive ? wActive : wInactive;

        gsap.to(cardEl, {
          width: targetWidth,
          duration,
          ease,
          overwrite: "auto",
        });

        // 3. Smoothly fade/reveal answer text
        const answerEl = answerRefs.current[i];
        if (answerEl) {
          if (isActive) {
            gsap.to(answerEl, {
              maxHeight: 160,
              opacity: 1,
              y: 0,
              duration: isInitial ? 0 : 0.5,
              delay: isInitial ? 0 : 0.12,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else {
            gsap.to(answerEl, {
              maxHeight: 0,
              opacity: 0,
              y: 6,
              duration: isInitial ? 0 : 0.3,
              ease: "power2.inOut",
              overwrite: "auto",
            });
          }
        }
      });
    },
    [getDimensions]
  );

  const handlePrev = useCallback(() => {
    if (activeIdxRef.current > 0) {
      goToSlide(activeIdxRef.current - 1);
    }
  }, [goToSlide]);

  const handleNext = useCallback(() => {
    if (activeIdxRef.current < faqContent.length - 1) {
      goToSlide(activeIdxRef.current + 1);
    }
  }, [goToSlide]);

  // Initial layout and resize sync
  useEffect(() => {
    goToSlide(0, true);

    const handleResize = () => {
      goToSlide(activeIdxRef.current, false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [goToSlide]);

  // Touch swipe support on track
  const touchStartX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  // Scroll entrance animation for the whole FAQ section
  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      gsap.from(".faq-header-elem", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 24,
        opacity: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "power2.out",
      });

      gsap.from(".faq-track-elem", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 72%",
        },
        y: 28,
        opacity: 0,
        duration: 1.3,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  const { wActive, wInactive } = getDimensions();

  return (
    <section
      id="faq"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] px-6 sm:px-12 lg:px-20 text-[#111613] select-none min-h-screen h-screen overflow-hidden flex flex-col justify-center items-center"
    >
      {/* Seamless Top Blend from About */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FAF8F5] to-transparent z-10" />

      {/* =========================================================================
          ATMOSPHERIC BACKGROUND VISUALS
         ========================================================================= */}

      {/* Top Right: Glowing Celestial Crescent / Aperture Arc */}
      <div className="pointer-events-none absolute -top-20 -right-24 sm:-top-32 sm:-right-20 w-[500px] sm:w-[700px] lg:w-[850px] h-[500px] sm:h-[700px] lg:h-[850px] overflow-hidden z-0">
        <svg
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <radialGradient
              id="topRightArcGlow"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#22C55E" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <filter id="crescentSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" result="blurWide" />
              <feGaussianBlur stdDeviation="6" result="blurMid" />
              <feMerge>
                <feMergeNode in="blurWide" />
                <feMergeNode in="blurMid" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse
            cx="520"
            cy="280"
            rx="320"
            ry="240"
            fill="url(#topRightArcGlow)"
            className="opacity-70"
          />

          <path
            d="M 220 100 C 450 140, 680 340, 780 620"
            stroke="#22C55E"
            strokeWidth="6"
            strokeOpacity="0.20"
            strokeLinecap="round"
            filter="url(#crescentSoftGlow)"
          />

          <path
            d="M 230 100 C 460 140, 680 340, 780 610"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
            filter="url(#crescentSoftGlow)"
          />

          <path
            d="M 220 100 C 450 140, 680 340, 780 620"
            stroke="#22C55E"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Bottom Left: Concentric Orbital Aperture Lines & Luminous Node Dots */}
      <div className="pointer-events-none absolute -bottom-36 -left-36 sm:-bottom-48 sm:-left-48 w-[500px] sm:w-[650px] lg:w-[750px] h-[500px] sm:h-[650px] lg:h-[750px] overflow-hidden z-0">
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="orbitalCoreGlow" cx="0" cy="600" r="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#22C55E" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="0" cy="600" r="380" fill="url(#orbitalCoreGlow)" />
          <circle cx="0" cy="600" r="140" stroke="#22C55E" strokeWidth="0.75" strokeOpacity="0.15" strokeDasharray="3 6" />
          <circle cx="0" cy="600" r="220" stroke="#22C55E" strokeWidth="0.8" strokeOpacity="0.2" />
          <circle cx="0" cy="600" r="300" stroke="#22C55E" strokeWidth="0.75" strokeOpacity="0.16" />
          <circle cx="0" cy="600" r="380" stroke="#22C55E" strokeWidth="0.6" strokeOpacity="0.1" strokeDasharray="4 8" />

          <circle cx="155" cy="445" r="3" fill="#22C55E" filter="drop-shadow(0 0 6px #22C55E)" />
          <circle cx="155" cy="445" r="1.5" fill="#FFFFFF" />
          <circle cx="270" cy="470" r="3.5" fill="#22C55E" filter="drop-shadow(0 0 8px #22C55E)" />
          <circle cx="270" cy="470" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Main Content Container: Shifted downwards for balanced viewport positioning */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-5 lg:space-y-6 w-full my-auto pt-10 sm:pt-14 lg:pt-16 pb-4 sm:pb-6 flex flex-col justify-center">
        
        {/* =========================================================================
            HEADER SECTION: Headline + Clean Divider (Old buttons removed)
           ========================================================================= */}
        <div className="faq-header-elem pb-3 sm:pb-4 border-b border-black/[0.08]">
          <h2 className="font-sans font-light md:font-normal text-3xl sm:text-4xl lg:text-[46px] text-[#111613] tracking-tight leading-[1.06]">
            Frequently <br />
            Asked Questions
          </h2>
        </div>

        {/* =========================================================================
            FLUID HORIZONTAL ACCORDION SLIDER TRACK (STREAMING-STYLE NAVIGATION)
           ========================================================================= */}
        <div className="relative group/carousel w-full">
          {/* Subtle streaming-style edge gradient fades on hover */}
          {activeIdx > 0 && (
            <div className="pointer-events-none absolute left-0 inset-y-0 w-16 sm:w-24 bg-gradient-to-r from-[#FAF8F5]/90 to-transparent z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 rounded-l-[28px]" />
          )}
          {activeIdx < faqContent.length - 1 && (
            <div className="pointer-events-none absolute right-0 inset-y-0 w-16 sm:w-24 bg-gradient-to-l from-[#FAF8F5]/90 to-transparent z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 rounded-r-[28px]" />
          )}

          {/* Left Navigation Button (Matching Contact Form Popup Button Style) */}
          {activeIdx > 0 && (
            <div className="absolute left-1 sm:-left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 ease-out focus-within:opacity-100">
              <div
                className="relative group/btn inline-flex rounded-full p-[1.5px] overflow-hidden transition-all duration-300 will-change-transform active:scale-90 hover:-translate-y-0.5 cursor-pointer shadow-[0_2px_14px_rgba(0,0,0,0.08),0_0_12px_rgba(34,197,94,0.18)]"
              >
                <div className="pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] bg-iridescent-conic animate-iridescent-spin opacity-80 group-hover/btn:opacity-100 will-change-transform" />
                <div className="pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] bg-iridescent-conic animate-iridescent-spin blur-[2.5px] opacity-50 group-hover/btn:opacity-80 will-change-transform" />
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous question"
                  className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl flex items-center justify-center text-[#111613] transition-all duration-300 btn-physical-surface-light cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8] text-[#111613] -translate-x-0.5 group-hover/btn:-translate-x-1 transition-all duration-200" />
                </button>
              </div>
            </div>
          )}

          {/* Right Navigation Button (Matching Contact Form Popup Button Style) */}
          {activeIdx < faqContent.length - 1 && (
            <div className="absolute right-1 sm:-right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 ease-out focus-within:opacity-100">
              <div
                className="relative group/btn inline-flex rounded-full p-[1.5px] overflow-hidden transition-all duration-300 will-change-transform active:scale-90 hover:-translate-y-0.5 cursor-pointer shadow-[0_2px_14px_rgba(0,0,0,0.08),0_0_12px_rgba(34,197,94,0.18)]"
              >
                <div className="pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] bg-iridescent-conic animate-iridescent-spin opacity-80 group-hover/btn:opacity-100 will-change-transform" />
                <div className="pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] bg-iridescent-conic animate-iridescent-spin blur-[2.5px] opacity-50 group-hover/btn:opacity-80 will-change-transform" />
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next question"
                  className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl flex items-center justify-center text-[#111613] transition-all duration-300 btn-physical-surface-light cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8] text-[#111613] translate-x-0.5 group-hover/btn:translate-x-1 transition-all duration-200" />
                </button>
              </div>
            </div>
          )}

          {/* Carousel Track Viewport */}
          <div
            ref={viewportRef}
            className="faq-track-elem relative w-full overflow-hidden py-4 -my-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={trackRef}
              className="flex items-stretch gap-4 sm:gap-5 w-max will-change-transform pb-2"
              style={{ transform: "translateX(0px)" }}
            >
              {faqContent.map((item, idx) => {
                const isActive = activeIdx === idx;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    onClick={() => goToSlide(idx)}
                    style={{
                      width: isActive ? wActive : wInactive,
                      flexShrink: 0,
                    }}
                    className={`faq-card group relative rounded-[24px] sm:rounded-[28px] border transition-[background-color,border-color,box-shadow] duration-500 ease-out cursor-pointer flex flex-col justify-between overflow-hidden select-none h-[calc(100vh-380px)] min-h-[200px] max-h-[380px] ${
                      isActive
                        ? "bg-white border-[#22C55E]/50 shadow-[0_20px_45px_rgba(0,0,0,0.08),0_0_25px_rgba(34,197,94,0.12)] p-7 sm:p-9 md:p-10"
                        : "bg-black/[0.03] border-black/[0.08] hover:border-black/20 hover:bg-black/[0.05] p-6 sm:p-8"
                    }`}
                  >
                    {/* Active Top Specular Highlight Edge */}
                    {isActive && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/50 to-transparent" />
                    )}

                    {/* Question Title & (if active) Smooth Answer Content */}
                    <div className="my-auto py-2 flex flex-col justify-center space-y-4">
                      <h3
                        className={`font-sans transition-colors duration-300 leading-snug ${
                          isActive
                            ? "text-2xl sm:text-3xl lg:text-[30px] text-[#111613] font-normal tracking-tight"
                            : "text-lg sm:text-xl text-[#5A685D] group-hover:text-[#111613] font-light leading-snug"
                        }`}
                      >
                        {item.question}
                      </h3>

                      {/* Answer Reveal Container */}
                      <div
                        ref={(el) => {
                          answerRefs.current[idx] = el;
                        }}
                        style={{
                          maxHeight: isActive ? 160 : 0,
                          opacity: isActive ? 1 : 0,
                        }}
                        className="overflow-hidden transition-all duration-300"
                      >
                        <div className="pt-4 border-t border-black/[0.08]">
                          <p className="font-sans text-xs sm:text-sm md:text-base text-[#5A685D] leading-relaxed font-normal">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Pagination Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {faqContent.map((item, idx) => (
            <button
              key={`dot-${item.id}`}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                activeIdx === idx
                  ? "w-8 h-1.5 bg-[#22C55E] shadow-[0_0_8px_#22C55E]"
                  : "w-2 h-1.5 bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>

      </div>

      {/* Seamless Bottom Section Blend into Contact */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF8F5] to-transparent z-10" />
    </section>
  );
}
