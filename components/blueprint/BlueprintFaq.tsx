"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { faqContent } from "@/content/faq";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function BlueprintFaq() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToActive = useCallback((idx: number) => {
    setActiveIdx(idx);

    if (!trackRef.current || !cardRefs.current[idx]) return;

    const track = trackRef.current;
    const activeCard = cardRefs.current[idx];

    if (activeCard) {
      const cardLeft = activeCard.offsetLeft;
      const targetScroll = Math.max(0, cardLeft - 20);

      gsap.to(track, {
        scrollLeft: targetScroll,
        duration: 0.85,
        ease: "power3.out",
      });
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIdx > 0) {
      scrollToActive(activeIdx - 1);
    }
  }, [activeIdx, scrollToActive]);

  const handleNext = useCallback(() => {
    if (activeIdx < faqContent.length - 1) {
      scrollToActive(activeIdx + 1);
    }
  }, [activeIdx, scrollToActive]);

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

  useEffect(() => {
    scrollToActive(0);
  }, [scrollToActive]);

  return (
    <section
      id="faq"
      ref={containerRef}
      className="relative w-full bg-[#030604] py-24 sm:py-32 lg:py-36 px-6 sm:px-12 lg:px-20 text-[#FAF8F5] select-none overflow-hidden"
    >
      {/* Seamless Top Blend from About */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#030604] to-transparent z-10" />
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
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#22C55E" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#166534" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#030604" stopOpacity="0" />
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
            stroke="#15803D"
            strokeWidth="8"
            strokeOpacity="0.22"
            strokeLinecap="round"
            filter="url(#crescentSoftGlow)"
          />

          <path
            d="M 230 100 C 460 140, 680 340, 780 610"
            stroke="#22C55E"
            strokeWidth="3"
            strokeOpacity="0.5"
            strokeLinecap="round"
            filter="url(#crescentSoftGlow)"
          />

          <path
            d="M 240 100 C 470 142, 680 340, 780 600"
            stroke="#86EFAC"
            strokeWidth="1.2"
            strokeOpacity="0.8"
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
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#052010" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#030604" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="0" cy="600" r="380" fill="url(#orbitalCoreGlow)" />
          <circle cx="0" cy="600" r="140" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.15" strokeDasharray="3 6" />
          <circle cx="0" cy="600" r="220" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.2" />
          <circle cx="0" cy="600" r="300" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.16" />
          <circle cx="0" cy="600" r="380" stroke="#4ADE80" strokeWidth="0.6" strokeOpacity="0.1" strokeDasharray="4 8" />

          <circle cx="155" cy="445" r="3" fill="#86EFAC" filter="drop-shadow(0 0 6px #4ADE80)" />
          <circle cx="155" cy="445" r="1.5" fill="#FFFFFF" />
          <circle cx="270" cy="470" r="3.5" fill="#86EFAC" filter="drop-shadow(0 0 8px #4ADE80)" />
          <circle cx="270" cy="470" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12 lg:space-y-16">
        
        {/* =========================================================================
            HEADER SECTION (Matching "FAQ Inspiration" Structure & Editorial Pacing)
           ========================================================================= */}
        <div className="faq-header-elem flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-2 border-b border-white/[0.06]">
          
          {/* Left: Eyebrow + Large Editorial Headline */}
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm text-[#4ADE80] uppercase tracking-[0.25em] font-semibold">
                FAQ —
              </span>
            </div>

            <h2 className="font-sans font-light md:font-normal text-4xl sm:text-5xl lg:text-[58px] text-[#FAF8F5] tracking-tight leading-[1.06]">
              Frequently <br />
              Asked Questions
            </h2>
          </div>

          {/* Right: Description & Carousel Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center lg:items-end justify-between lg:justify-end gap-6 sm:gap-10 max-w-md">
            <p className="font-sans text-xs sm:text-sm text-[#8E9B91] leading-relaxed max-w-xs">
              Find answers to common questions about Unifolio&apos;s portfolio intelligence, fee dissection, security protocols, and direct migration.
            </p>

            {/* Circular Navigation Arrow Buttons (Inspired by Video Reference) */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIdx === 0}
                aria-label="Previous question"
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  activeIdx === 0
                    ? "border-white/10 text-white/20 cursor-not-allowed bg-transparent"
                    : "border-white/20 bg-white/[0.04] text-white hover:border-[#4ADE80] hover:text-[#4ADE80] hover:bg-[#102217] active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={activeIdx === faqContent.length - 1}
                aria-label="Next question"
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  activeIdx === faqContent.length - 1
                    ? "border-white/10 text-white/20 cursor-not-allowed bg-transparent"
                    : "border-white/20 bg-white/[0.04] text-white hover:border-[#4ADE80] hover:text-[#4ADE80] hover:bg-[#102217] active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            HORIZONTAL ACCORDION SLIDER TRACK (Inspired by Video Reference)
           ========================================================================= */}
        <div
          ref={trackRef}
          className="faq-track-elem relative w-full overflow-x-auto no-scrollbar py-4 -my-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-stretch gap-4 sm:gap-5 w-max min-w-full pb-2">
            {faqContent.map((item, idx) => {
              const isActive = activeIdx === idx;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  onClick={() => scrollToActive(idx)}
                  className={`group relative rounded-[28px] sm:rounded-[32px] border transition-all duration-500 ease-out cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                    isActive
                      ? "w-[340px] sm:w-[460px] md:w-[540px] lg:w-[580px] bg-gradient-to-br from-[#0c2317] via-[#091a11] to-[#040c07] border-[#4ADE80]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_40px_rgba(74,222,128,0.14),inset_0_1px_1px_rgba(74,222,128,0.3)] p-7 sm:p-9 md:p-10 min-h-[380px] sm:min-h-[420px]"
                      : "w-[220px] sm:w-[260px] md:w-[280px] bg-[#070c09]/85 border-white/[0.08] hover:border-white/25 hover:bg-[#0b140e] p-6 sm:p-8 min-h-[380px] sm:min-h-[420px]"
                  }`}
                >
                  {/* Active Specular Rim Gradient */}
                  {isActive && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#86EFAC]/40 to-transparent" />
                  )}

                  {/* Card Header: Index & Status Indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-xs sm:text-sm font-semibold tracking-widest transition-colors ${
                        isActive ? "text-[#4ADE80]" : "text-[#8E9B91]/70 group-hover:text-[#4ADE80]"
                      }`}
                    >
                      {item.id}
                    </span>

                    {isActive ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#122b1c] border border-[#4ADE80]/40 text-[#4ADE80] font-mono text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80] animate-pulse" />
                        Active
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#4ADE80]/60 transition-colors" />
                    )}
                  </div>

                  {/* Card Body: Question & (if active) Answer text */}
                  <div className="space-y-4 my-auto py-2">
                    <h3
                      className={`font-sans transition-all leading-snug ${
                        isActive
                          ? "text-2xl sm:text-3xl lg:text-[32px] text-white font-light sm:font-normal tracking-tight"
                          : "text-lg sm:text-xl text-[#FAF8F5]/80 group-hover:text-white font-light leading-snug"
                      }`}
                    >
                      {item.question}
                    </h3>

                    {/* Detailed Answer - Rendered with smooth transition when active */}
                    {isActive && (
                      <div className="pt-3 border-t border-white/[0.08] animate-fadeIn">
                        <p className="font-sans text-xs sm:text-sm md:text-base text-[#8E9B91] leading-relaxed font-normal">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Accent Indicator */}
                  <div className="flex items-center justify-between pt-2">
                    {isActive ? (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#4ADE80] tracking-widest uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Insight</span>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-[#8E9B91]/50 group-hover:text-[#4ADE80] transition-colors uppercase tracking-wider">
                        Expand →
                      </span>
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#142e1e] border border-[#4ADE80]/60 text-[#4ADE80]"
                          : "bg-white/[0.04] border border-white/10 text-white/40 group-hover:border-white/30 group-hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{idx + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Pagination Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {faqContent.map((item, idx) => (
            <button
              key={`dot-${item.id}`}
              type="button"
              onClick={() => scrollToActive(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                activeIdx === idx
                  ? "w-8 h-1.5 bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"
                  : "w-2 h-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

      </div>

      {/* Seamless Bottom Section Blend into Contact */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030604] to-transparent z-10" />
    </section>
  );
}
