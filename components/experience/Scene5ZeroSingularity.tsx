"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, CheckCircle2, Lock, UploadCloud, Sparkles } from "lucide-react";
import Link from "next/link";

export function Scene5ZeroSingularity({
  progress, // 0.80 to 1.0 (active in Act 5)
}: {
  progress: MotionValue<number>;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Opacity & scale transforms for Scene 5
  const opacity = useTransform(progress, [0.8, 0.86, 1.0], [0, 1, 1]);
  const scale = useTransform(progress, [0.8, 0.88, 1.0], [0.92, 1, 1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 flex flex-col items-center justify-center select-none overflow-hidden px-6"
    >
      {/* Background Deep Pale Mint Aura */}
      <div className="absolute inset-0 bg-radial from-[#8CD49E]/15 via-transparent to-transparent pointer-events-none" />

      {/* Monumental ₹0 Zero-Toll Monolith Background Mark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="font-serif text-[22rem] sm:text-[32rem] font-bold text-[#1C241E]/[0.03] leading-none">
          ₹0
        </span>
      </div>

      {/* Act Header */}
      <div className="text-center mb-8 max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#2E7D4E]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ACT 05 · THE ZERO-TOLL SINGULARITY</span>
        </div>

        <h2 className="mt-4 font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1C241E] leading-[1.02]">
          Free forever. <br />
          <span className="text-[#2E7D4E] italic font-normal">Uncompromisingly honest.</span>
        </h2>

        <p className="mt-4 font-sans text-sm sm:text-base text-[#525E55] leading-relaxed">
          Zero subscriptions. Zero distributor commissions. Zero server-side storage of your financial CAS data. Your wealth in pure clarity.
        </p>
      </div>

      {/* Interactive Direct Ingestion Chamber */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="rounded-[32px] border-[2px] border-[#1C241E] bg-[#FFFFFF] p-8 sm:p-10 shadow-[4px_6px_0px_rgba(28,36,30,0.08)]">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8CD49E]/40 text-[#2E7D4E]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1C241E]">
                You&apos;re on the priority manifest.
              </h3>
              <p className="font-sans text-xs text-[#525E55]">
                We will deliver your encrypted access link shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#1C241E]/10 pb-3 font-mono text-xs text-[#525E55]">
                <span className="font-bold text-[#1C241E]">DIRECT ACCESS GATEWAY</span>
                <span className="rounded-full bg-[#EAF5ED] px-2.5 py-0.5 font-bold text-[#2E7D4E]">
                  100% FREE CORE
                </span>
              </div>

              {/* Email Input Chamber */}
              <div className="space-y-2">
                <label htmlFor="scene5-email" className="font-sans text-xs font-semibold text-[#1C241E] block text-left">
                  Enter your email for immediate early access
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="scene5-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="flex-1 rounded-full border border-[#1C241E]/20 bg-[#FAF8F5] px-5 py-3.5 font-sans text-sm text-[#1C241E] outline-none focus:border-[#2E7D4E] focus:ring-1 focus:ring-[#2E7D4E] transition-all"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8CD49E] px-7 py-3.5 font-sans text-sm font-semibold text-[#1C241E] border border-[#1C241E] shadow-sm hover:bg-[#79C68C] hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Connecting..." : "Get Instant Access"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Or Drag CAS Statement */}
              <div className="pt-2">
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C241E]/25 bg-[#FAF8F5] p-3.5 font-sans text-xs text-[#525E55] hover:border-[#2E7D4E] hover:text-[#1C241E] transition-colors"
                >
                  <UploadCloud className="h-4 w-4 text-[#2E7D4E]" />
                  <span>Or import your CAMS / KFintech CAS statement directly</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 border-t border-[#1C241E]/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-sans text-[#525E55]">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#2E7D4E]" />
                  <span>Client-Side AES-256</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D4E]" />
                  <span>No Broker Toll</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D4E]" />
                  <span>All 44+ AMCs</span>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
