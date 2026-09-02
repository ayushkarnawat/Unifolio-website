"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { FaqItem } from "@/content/faq";
import { Plus, Minus } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      gsap.from(".faq-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section ref={containerRef} className="relative mx-auto max-w-content px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <SectionLabel>Clarity First</SectionLabel>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1C241E]">
          Frequently asked questions.
        </h2>
        <p className="mt-3 font-sans text-sm text-[#525E55]">
          Everything you need to know about Unifolio&apos;s free-core philosophy and security model.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl divide-y divide-[#1C241E]/10 border-y border-[#1C241E]/10">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={item.question} className="faq-item py-5">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between gap-4 text-left group"
              >
                <span className="font-serif text-base sm:text-lg font-bold text-[#1C241E] transition-colors group-hover:text-[#2E7D4E]">
                  {item.question}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] text-[#525E55] transition-transform duration-200">
                  {isOpen ? <Minus className="h-3.5 w-3.5 text-[#2E7D4E]" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 font-sans text-sm sm:text-base leading-relaxed text-[#525E55] pr-8">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
