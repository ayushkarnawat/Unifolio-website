"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { ArcMark } from "@/components/ui/ArcMark";
import { InteractiveFieldCanvas } from "@/components/canvas/InteractiveFieldCanvas";
import { LiveIngestionDemo } from "@/components/product/LiveIngestionDemo";
import type { homeContent } from "@/content/home";
import { ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export function HeroSection({ content }: { content: (typeof homeContent)["hero"] }) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-36">
      {/* Interactive Cursor Distortion Field */}
      <InteractiveFieldCanvas
        gridSize={38}
        distortionRadius={180}
        maxDisplacement={30}
        className="opacity-70"
      />

      <div className="relative mx-auto max-w-wide px-4 sm:px-8">
        {/* Minimal Hero Header & Monumental Statement */}
        <div className="mx-auto max-w-5xl text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-elevated/90 px-4 py-1.5 shadow-panel-sm backdrop-blur-md"
          >
            <ArcMark className="h-4 w-4" score={65} animated />
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink font-semibold">
              {content.eyebrow}
            </span>
          </motion.div>

          {/* Monumental Sculptural Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-extrabold tracking-[-0.04em] text-ink leading-[0.92] text-balance"
          >
            Your whole portfolio. <br />
            <span className="font-light italic text-ink-soft">One reading.</span>
          </motion.h1>

          {/* Calm Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl font-sans text-base sm:text-xl text-ink-soft leading-relaxed"
          >
            {content.subhead}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <LinkButton href={content.primaryCta.href} variant="primary">
              <span>{content.primaryCta.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </LinkButton>
            <LinkButton href={content.secondaryCta.href} variant="ghost">
              <span>{content.secondaryCta.label}</span>
            </LinkButton>
          </motion.div>
        </div>

        {/* Living, Interactive Product Demonstration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 sm:mt-20"
        >
          <LiveIngestionDemo />
        </motion.div>
      </div>
    </section>
  );
}
