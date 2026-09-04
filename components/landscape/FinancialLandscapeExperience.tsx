"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { FinancialLandscapeCanvas } from "./FinancialLandscapeCanvas";
import { ArrowRight } from "lucide-react";

export function FinancialLandscapeExperience() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      const container = containerRef.current;
      const stage = stageRef.current;

      // Master ScrollTrigger timeline pinning the stage and driving progress 0 -> 1
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          pin: stage,
          scrub: 1.0,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            setScrollProgress(p);

            // Compute active chapter strictly aligned with the transition intervals
            if (p < 0.125) {
              setActiveChapter(0); // Stage 1 (Opening)
            } else if (p < 0.275) {
              setActiveChapter(1); // Stage 2 (Ask)
            } else if (p < 0.425) {
              setActiveChapter(2); // Stage 3 (See Everything)
            } else if (p < 0.575) {
              setActiveChapter(3); // Stage 4 (Understand What You Own)
            } else if (p < 0.725) {
              setActiveChapter(4); // Stage 5 (Know Your Risk)
            } else if (p < 0.875) {
              setActiveChapter(5); // Stage 6 (Plan Ahead)
            } else {
              setActiveChapter(6); // Closing (Stage 6 Resolution)
            }
          },
        },
      });

      // =========================================================================
      // SYNCHRONIZED TYPOGRAPHY & VISUAL CHOREOGRAPHY
      //
      // Unified schedule matching Three.js canvas transitions exactly:
      // Transition windows:
      // 0 -> 1: 0.10 to 0.15
      // 1 -> 2: 0.25 to 0.30
      // 2 -> 3: 0.40 to 0.45
      // 3 -> 4: 0.55 to 0.60
      // 4 -> 5: 0.70 to 0.75
      // 5 -> 6: 0.85 to 0.90
      // =========================================================================

      const panel0 = document.getElementById("landscape-panel-opening");
      const panel1 = document.getElementById("landscape-panel-chapter1");
      const panel2 = document.getElementById("landscape-panel-chapter2");
      const panel3 = document.getElementById("landscape-panel-chapter3");
      const panel4 = document.getElementById("landscape-panel-chapter4");
      const panel5 = document.getElementById("landscape-panel-chapter5");
      const panel6 = document.getElementById("landscape-panel-closing");

      // Initial hardware-accelerated transform state
      gsap.set([panel1, panel2, panel3, panel4, panel5, panel6], {
        opacity: 0,
        y: 20,
        force3D: true,
        pointerEvents: "none",
      });
      gsap.set(panel0, { opacity: 1, y: 0, force3D: true, pointerEvents: "auto" });

      // -------------------------------------------------------------------------
      // TRANSITION 0 -> 1 (0.10 to 0.15)
      // Panel 0 exits; Panel 1 enters simultaneously with 3D Visual 1
      // -------------------------------------------------------------------------
      masterTl.to(
        panel0,
        {
          opacity: 0,
          y: -18,
          pointerEvents: "none",
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.10
      );
      masterTl.fromTo(
        panel1,
        { opacity: 0, y: 20, pointerEvents: "none" },
        { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.05, ease: "power1.inOut" },
        0.10
      );

      // -------------------------------------------------------------------------
      // TRANSITION 1 -> 2 (0.25 to 0.30)
      // Panel 1 exits; Panel 2 enters simultaneously with 3D Visual 2 (Glides to Left)
      // -------------------------------------------------------------------------
      masterTl.to(
        panel1,
        {
          opacity: 0,
          y: -18,
          pointerEvents: "none",
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.25
      );
      masterTl.fromTo(
        panel2,
        { opacity: 0, y: 20, pointerEvents: "none" },
        { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.05, ease: "power1.inOut" },
        0.25
      );

      // -------------------------------------------------------------------------
      // TRANSITION 2 -> 3 (0.40 to 0.45)
      // Panel 2 exits; Panel 3 enters simultaneously with 3D Visual 3 (Glides to Right)
      // -------------------------------------------------------------------------
      masterTl.to(
        panel2,
        {
          opacity: 0,
          y: -18,
          pointerEvents: "none",
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.40
      );
      masterTl.fromTo(
        panel3,
        { opacity: 0, y: 20, pointerEvents: "none" },
        { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.05, ease: "power1.inOut" },
        0.40
      );

      // -------------------------------------------------------------------------
      // TRANSITION 3 -> 4 (0.55 to 0.60)
      // Panel 3 exits; Panel 4 enters simultaneously with 3D Visual 4 (Glides to Left)
      // -------------------------------------------------------------------------
      masterTl.to(
        panel3,
        {
          opacity: 0,
          y: -18,
          pointerEvents: "none",
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.55
      );
      masterTl.fromTo(
        panel4,
        { opacity: 0, y: 20, pointerEvents: "none" },
        { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.05, ease: "power1.inOut" },
        0.55
      );

      // -------------------------------------------------------------------------
      // TRANSITION 4 -> 5 (0.70 to 0.75)
      // Panel 4 exits; Panel 5 enters simultaneously with 3D Visual 5 (Glides to Right)
      // -------------------------------------------------------------------------
      masterTl.to(
        panel4,
        {
          opacity: 0,
          y: -18,
          pointerEvents: "none",
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.70
      );
      masterTl.fromTo(
        panel5,
        { opacity: 0, y: 20, pointerEvents: "none" },
        { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.05, ease: "power1.inOut" },
        0.70
      );

      // -------------------------------------------------------------------------
      // TRANSITION 5 -> 6 (0.85 to 0.90) - Closing Resolution
      // Panel 5 exits; Panel 6 (Closing text) enters; 3D Visual dissolves away to 0
      // -------------------------------------------------------------------------
      masterTl.to(
        panel5,
        {
          opacity: 0,
          y: -18,
          pointerEvents: "none",
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.85
      );
      masterTl.fromTo(
        panel6,
        { opacity: 0, y: 20, pointerEvents: "none" },
        { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.05, ease: "power1.inOut" },
        0.85
      );

      // Explicit timeline duration anchor: ensures masterTl totalDuration is exactly 1.00!
      // This guarantees that ScrollTrigger scrub progress `p` matches timeline time 1:1.
      masterTl.to({}, { duration: 0.10 }, 0.90);
    },
    { scope: containerRef }
  );

  return (
    <section
      id="product"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] dark:bg-[#000000] select-none transition-colors duration-500"
      style={{ height: "900vh" }}
    >
      {/* Anchor for nav jump */}
      <div id="statement" className="absolute top-0 pointer-events-none" />

      {/* Pinned Fullscreen Interactive Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500"
      >
        {/* Subtle Architectural Reference Lines */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-black/[0.03] dark:via-white/[0.04] to-transparent z-0" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-black/[0.02] dark:via-white/[0.03] to-transparent z-0" />

        {/* 3D CENTRAL PROTAGONIST: Dimensional Financial Landscape Rig */}
        <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none">
          <FinancialLandscapeCanvas
            scrollProgress={scrollProgress}
            activeChapter={activeChapter}
          />
        </div>

        {/* =========================================================================
            STAGE 1: OPENING — THE COMPLETE PICTURE
            Layout: Text Left (col-span-5, max-w-[420px]), Visual Right (+3.3)
           ========================================================================= */}
        <div
          id="landscape-panel-opening"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full"
        >
          {/* Editorial Content: Left Column (Unboxed, Pure Floating Typography) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            <div className="lg:col-span-5 max-w-[420px]">
              <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-[58px] text-[#111613] dark:text-white tracking-[-0.04em] uppercase leading-[0.92]">
                Understand <br />
                <span className="text-[#22C55E]">Your Wealth.</span> <br />
                Not Just See It.
              </h2>
              <p className="mt-6 font-sans text-base sm:text-lg text-[#5A685D] dark:text-[#8E9B91]/90 leading-relaxed font-light">
                Every account, every fund, every rupee, in one place, finally clear.
              </p>
              <div className="mt-8">
                <LinkButton
                  href="#contact"
                  size="md"
                  variant="primary"
                  className="shadow-[0_4px_24px_rgba(34,197,94,0.25)]"
                >
                  <span>Join the waitlist</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </LinkButton>
              </div>
            </div>
            {/* Visual breathes cleanly on the right half with over 200px gap */}
            <div className="hidden lg:block lg:col-span-7" />
          </div>
        </div>

        {/* =========================================================================
            STAGE 2: CHAPTER 1 — ASK: SKIP THE DASHBOARDS. JUST ASK.
            Layout: Text on Left (col-span-5, max-w-[420px]), Visual Right (+3.3)
           ========================================================================= */}
        <div
          id="landscape-panel-chapter1"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full opacity-0"
        >
          {/* Content: Left Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            <div className="lg:col-span-5 max-w-[420px]">
              <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[50px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.94]">
                Skip the <br />
                dashboards. <br />
                <span className="text-[#22C55E]">Just ask.</span>
              </h3>
              <p className="mt-6 font-sans text-base sm:text-lg text-[#5A685D] dark:text-[#8E9B91]/90 leading-relaxed font-light">
                The fastest way to understand your money isn&apos;t a chart, it&apos;s a question. Ask what&apos;s dragging your returns, whether you&apos;re overexposed, or if a decision makes sense, and get an answer based on your portfolio.
              </p>
            </div>
            {/* Visual breathes on the right */}
            <div className="hidden lg:block lg:col-span-7" />
          </div>
        </div>

        {/* =========================================================================
            STAGE 3: CHAPTER 2 — SEE EVERYTHING
            ALTERNATING LAYOUT: Visual on Left (-3.3), Text on Right (col-start-8, max-w-[420px])
           ========================================================================= */}
        <div
          id="landscape-panel-chapter2"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full opacity-0"
        >
          {/* Content: RIGHT Column (Alternating!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            {/* Visual breathes on the left */}
            <div className="hidden lg:block lg:col-span-7" />

            <div className="lg:col-span-5 max-w-[420px]">
              <h3 className="font-sans font-black text-4xl sm:text-5xl lg:text-[58px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.94]">
                See <br />
                <span className="text-[#22C55E]">Everything.</span>
              </h3>
              <p className="mt-5 font-sans text-sm sm:text-base text-[#5A685D] dark:text-[#8E9B91]/90 leading-relaxed font-light">
                From mutual funds and stocks to bank accounts, loans, credit cards, and real estate,
                every asset and liability you and your family hold, aggregated into a number that&apos;s
                actually accurate.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STAGE 4: CHAPTER 3 — UNDERSTAND WHAT YOU OWN
            ALTERNATING LAYOUT: Text on Left (col-span-5, max-w-[440px]), Visual Right (+3.3)
           ========================================================================= */}
        <div
          id="landscape-panel-chapter3"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full opacity-0"
        >
          {/* Content: LEFT Column with Unboxed Clean Typographic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            <div className="lg:col-span-5 max-w-[440px]">
              <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[50px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.94] mb-6">
                Understand <br />
                <span className="text-[#22C55E]">What You Own.</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <h4 className="font-sans font-bold text-sm text-[#111613] dark:text-white">
                    Overlap Check
                  </h4>
                  <p className="mt-1 font-sans text-xs text-[#5A685D] dark:text-[#8E9B91] leading-relaxed font-light">
                    See if a &ldquo;diversified&rdquo; set of funds is secretly one concentrated bet on the same handful of companies.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-sm text-[#111613] dark:text-white">
                    Performance, in Context
                  </h4>
                  <p className="mt-1 font-sans text-xs text-[#5A685D] dark:text-[#8E9B91] leading-relaxed font-light">
                    How your funds, stocks and your portfolio as a whole, are actually doing against what matters, not just a raw return.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-sm text-[#111613] dark:text-white">
                    Hidden Fee Finder
                  </h4>
                  <p className="mt-1 font-sans text-xs text-[#5A685D] dark:text-[#8E9B91] leading-relaxed font-light">
                    What you&apos;re quietly losing to expense ratios, and what a cheaper option looks like.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-sm text-[#111613] dark:text-white">
                    Peer Benchmarking
                  </h4>
                  <p className="mt-1 font-sans text-xs text-[#5A685D] dark:text-[#8E9B91] leading-relaxed font-light">
                    See how your portfolio compares to others with a similar profile, not just a generic market index.
                  </p>
                </div>
              </div>
            </div>
            {/* Visual breathes on the right */}
            <div className="hidden lg:block lg:col-span-7" />
          </div>
        </div>

        {/* =========================================================================
            STAGE 5: CHAPTER 4 — KNOW YOUR RISK
            ALTERNATING LAYOUT: Visual on Left (-3.3), Text on Right (col-start-8, max-w-[420px])
           ========================================================================= */}
        <div
          id="landscape-panel-chapter4"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full opacity-0"
        >
          {/* Content: RIGHT Column (Alternating!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            {/* Visual breathes on the left with clear view of the alert pit */}
            <div className="hidden lg:block lg:col-span-7" />

            <div className="lg:col-span-5 max-w-[420px]">
              <h3 className="font-sans font-black text-4xl sm:text-5xl lg:text-[58px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.94]">
                Know Your <br />
                <span className="text-[#22C55E]">Risk.</span>
              </h3>

              {/* Unboxed Floating Typographic Stack */}
              <div className="mt-8 space-y-4">
                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Family Runway
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    How long your family could cover expenses on liquid assets alone, pooled across everyone.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Real Safety Cushion
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    Built from your real expenses and income stability, not a generic rule of thumb.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Sleeping Money
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    Surplus cash doing nothing for you.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Family Risk Map
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    Where a single income, missing cover, or too many dependents leaves your family exposed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STAGE 6: CHAPTER 5 — PLAN AHEAD
            ALTERNATING LAYOUT: Text on Left (col-span-5, max-w-[420px]), Visual Right (+3.3)
           ========================================================================= */}
        <div
          id="landscape-panel-chapter5"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full opacity-0"
        >
          {/* Content: LEFT Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            <div className="lg:col-span-5 max-w-[440px]">
              <h3 className="font-sans font-black text-4xl sm:text-5xl lg:text-[58px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.94]">
                Plan <br />
                <span className="text-[#22C55E]">Ahead.</span>
              </h3>

              {/* Unboxed Clean Editorial Stack */}
              <div className="mt-8 space-y-3.5">
                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Financial Snapshot
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    A single view of how your finances are trending, so you always know where you stand.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Stress test
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    See how your actual portfolio would hold up against a market crash.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    &ldquo;What if I...&rdquo;
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    Model a job change, a loan, an early exit, before you act.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Goal Readiness Score
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    Retirement, house, education, tracked together, one score.
                  </p>
                </div>

                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#111613] dark:text-white">
                    Succession Readiness
                  </h5>
                  <p className="text-xs text-[#5A685D] dark:text-[#8E9B91] mt-0.5 font-light leading-relaxed">
                    Is your family prepared without you.
                  </p>
                </div>
              </div>
            </div>
            {/* Visual breathes on the right */}
            <div className="hidden lg:block lg:col-span-7" />
          </div>
        </div>

        {/* =========================================================================
            CLOSING: RESOLUTION — YOUR WEALTH ALREADY EXISTS
            CENTERED FRAMED LAYOUT: Visual is Centered, Text framed above with immense breathing space
           ========================================================================= */}
        <div
          id="landscape-panel-closing"
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-center p-8 sm:p-14 lg:p-20 max-w-7xl mx-auto w-full opacity-0"
        >
          {/* Centered Monumental Resolution (Clean Floating Typography) */}
          <div className="text-center max-w-5xl mx-auto my-auto pt-6">
            <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.96]">
              Your wealth <br />
              <span className="text-[#22C55E]">already exists.</span> <br />
              <span className="inline-block sm:whitespace-nowrap">Now you&apos;ll actually understand it.</span>
            </h3>
            <div className="mt-8 sm:mt-10 flex items-center justify-center">
              <LinkButton
                href="#contact"
                size="lg"
                variant="primary"
                className="shadow-[0_4px_30px_rgba(34,197,94,0.25)]"
              >
                <span>Join the waitlist</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
