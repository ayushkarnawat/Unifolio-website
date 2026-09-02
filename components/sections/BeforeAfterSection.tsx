"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BeforeAfterMorph } from "@/components/product/BeforeAfterMorph";
import type { homeContent } from "@/content/home";

export function BeforeAfterSection({
  content,
}: {
  content: (typeof homeContent)["beforeAfter"];
}) {
  return (
    <section className="relative mx-auto max-w-wide px-4 py-24 sm:px-8 sm:py-36">
      {/* Editorial Header */}
      <div className="mx-auto max-w-3xl text-center mb-14">
        <SectionLabel>{content.label}</SectionLabel>
        <h2 className="mt-3 font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink">
          Fragmentation is the villain.
        </h2>
        <p className="mt-4 font-sans text-base sm:text-lg text-ink-soft leading-relaxed">
          The average mutual fund investor has holdings split across broker logins, dying spreadsheets, and paid tools gatekeeping the numbers that matter.
        </p>
      </div>

      {/* Interactive Morph Demonstration */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <BeforeAfterMorph />
      </motion.div>
    </section>
  );
}
