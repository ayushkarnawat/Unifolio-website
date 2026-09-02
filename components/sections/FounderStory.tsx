"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArcMark } from "@/components/ui/ArcMark";
import type { aboutContent } from "@/content/about";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { ShieldCheck, HeartHandshake, Eye, Sparkles } from "lucide-react";

export function FounderStory({ content }: { content: typeof aboutContent }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const valueIcons = [HeartHandshake, Eye, ShieldCheck];

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      // Manifesto quote scroll-linked opacity illumination
      gsap.from(".manifesto-quote", {
        scrollTrigger: {
          trigger: ".manifesto-card",
          start: "top 75%",
          end: "bottom 60%",
          scrub: 1,
        },
        opacity: 0.35,
        y: 15,
        duration: 1,
      });

      // Staggered principles cards entrance
      gsap.from(".principle-card", {
        scrollTrigger: {
          trigger: ".principles-grid",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative mx-auto max-w-content px-4 py-16 sm:px-8 sm:py-24">
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <SectionLabel>Our Thesis</SectionLabel>
        <h1 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-[#1C241E] sm:text-6xl lg:text-7xl leading-[1.02]">
          {content.heading}
        </h1>
        <p className="mt-6 font-sans text-lg sm:text-xl text-[#525E55] leading-relaxed">
          {content.intro}
        </p>
      </div>

      {/* Manifesto Callout Container */}
      <div className="manifesto-card relative mt-12 overflow-hidden rounded-3xl border border-[#1C241E]/10 bg-[#FFFFFF] p-8 sm:p-12 shadow-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-[#2E7D4E] font-semibold">
          <ArcMark className="h-4 w-4" score={80} animated />
          <span>THE FOUNDING NARRATIVE</span>
        </div>

        <p className="manifesto-quote mt-6 font-serif italic text-lg sm:text-2xl text-[#1C241E] leading-relaxed font-normal">
          &ldquo;Unifolio started when tracking family mutual funds across multiple AMCs by hand
          revealed an uncomfortable truth: getting a straight, truthful answer to &lsquo;are we
          actually doing well?&rsquo; required either an error-prone spreadsheet or an expensive paid
          tool. We built Unifolio to be the standard that should have existed already: free, and
          uncompromisingly honest about the number behind the number.&rdquo;
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-[#1C241E]/10 pt-4 font-mono text-xs text-[#8E9B91]">
          <span>Bangalore, India</span>
          <span>Zero Commission Ingestion</span>
        </div>
      </div>

      {/* 3 Core Values Grid */}
      <div className="mt-16">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#8E9B91] font-semibold">
            Guiding Principles
          </span>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#1C241E]">
            How we make product decisions.
          </h2>
        </div>

        <div className="principles-grid grid grid-cols-1 gap-6 sm:grid-cols-3">
          {content.values.map((value, index) => {
            const Icon = valueIcons[index] || Sparkles;

            return (
              <div
                key={value.title}
                className="principle-card rounded-2xl border border-[#1C241E]/10 bg-[#FFFFFF] p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-[#2E7D4E]/40 transition-colors"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#1C241E]/10 text-[#1C241E]">
                    <Icon className="h-5 w-5 text-[#2E7D4E]" />
                  </div>
                  <h3 className="mt-5 font-serif text-lg font-bold text-[#1C241E]">{value.title}</h3>
                  <p className="mt-2.5 font-sans text-sm text-[#525E55] leading-relaxed">
                    {value.body}
                  </p>
                </div>

                <div className="mt-6 font-mono text-[10px] text-[#8E9B91] uppercase tracking-wider border-t border-[#1C241E]/5 pt-3">
                  Principle 0{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
