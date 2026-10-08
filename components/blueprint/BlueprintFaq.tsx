"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqContent } from "@/content/faq";

export function BlueprintFaq() {
  // First item open by default (matching the reference layout)
  const [openId, setOpenId] = useState<string | null>("01");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative w-full bg-[#FAF8F5] px-6 sm:px-10 lg:px-16 xl:px-20 pt-20 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-16 text-[#111613] select-none border-t border-black/[0.06]"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Editorial Header
             ========================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-6 sm:space-y-8">
            <div>
              <h2 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[58px] xl:text-[64px] text-[#111613] tracking-tight leading-[1.06]">
                Questions investors <br className="hidden sm:inline" />
                commonly ask.
              </h2>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Individual Elevated Accordion Cards (Structured like Reference)
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4 w-full">
            {faqContent.map((item) => {
              const isOpen = openId === item.id;

              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white border-[#22C55E]/40 shadow-[0_8px_24px_rgba(34,197,94,0.06)]"
                      : "bg-white border-black/[0.08] hover:border-black/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  }`}
                >
                  {/* Card Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between text-left p-6 sm:p-7 gap-4 cursor-pointer select-none"
                  >
                    <span className="font-sans text-base sm:text-lg lg:text-[19px] font-semibold text-[#111613] tracking-tight leading-snug">
                      {item.question}
                    </span>

                    {/* Circular Action Badge (+ / - in Unifolio green #22C55E) */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "border-[#22C55E] bg-[#22C55E] text-white shadow-sm"
                          : "border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E] group-hover:border-[#22C55E] group-hover:bg-[#22C55E]/10"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Answer Content */}
                  {isOpen && (
                    <div className="px-6 sm:px-7 pb-6 sm:pb-7 -mt-2">
                      <p className="font-sans text-sm sm:text-base text-[#5A685D] leading-relaxed font-normal">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
