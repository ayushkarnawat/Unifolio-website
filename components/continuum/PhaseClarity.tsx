"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, UploadCloud, Sparkles } from "lucide-react";
import Link from "next/link";

export function PhaseClarity({
  progress, // 0.68 to 1.0 (Phase 3)
}: {
  progress: MotionValue<number>;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Opacity & scale transforms for Phase 3
  const opacity = useTransform(progress, [0.68, 0.76, 1.0], [0, 1, 1]);
  const scale = useTransform(progress, [0.68, 0.78, 1.0], [0.92, 1, 1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 flex flex-col justify-between select-none overflow-hidden p-8 sm:p-16"
    >
      {/* Serene Tranquil Horizon Line Spanning Canvas */}
      <svg
        viewBox="0 0 1200 40"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-8 overflow-visible opacity-30"
        fill="none"
      >
        <line x1="0" y1="20" x2="1200" y2="20" stroke="#2E7D4E" strokeWidth="1.5" />
        <circle cx="600" cy="20" r="4.5" fill="#2E7D4E" />
      </svg>

      {/* Top Monumental Statement in Absolute Calm */}
      <div className="relative z-10 max-w-3xl pt-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#2E7D4E] block mb-3 font-semibold">
          [ 03 · MONUMENTAL CLARITY ]
        </span>

        <h1 className="font-serif text-5xl sm:text-7xl lg:text-[6.2rem] font-normal tracking-tight text-[#1C241E] leading-[0.98]">
          All your investments. <br />
          <span className="italic text-[#2E7D4E] font-normal">One clear horizon.</span>
        </h1>
      </div>

      {/* Central Whisper-Quiet Direct Ingestion Gateway (Pure Equilibrium) */}
      <div className="relative z-10 max-w-xl my-auto py-6">
        {submitted ? (
          <div className="border-t-2 border-[#2E7D4E] pt-6 space-y-3">
            <div className="flex items-center gap-2 text-[#2E7D4E] font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="h-4 w-4" />
              <span>Manifest Confirmed</span>
            </div>
            <p className="font-serif text-2xl sm:text-3xl text-[#1C241E]">
              Your encrypted access key is prepared.
            </p>
            <p className="font-sans text-xs text-[#525E55]">
              Check your inbox for instant private onboarding.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="border-t-2 border-[#1C241E] pt-6 space-y-5">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#525E55]">
              <span className="font-bold text-[#1C241E]">IMMEDIATE ACCESS GATEWAY</span>
              <span className="text-[#2E7D4E] font-bold">100% FREE CORE</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="flex-1 rounded-full border border-[#1C241E]/20 bg-[#FAF8F5] px-6 py-4 font-sans text-sm text-[#1C241E] outline-none focus:border-[#2E7D4E] transition-all"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8CD49E] px-8 py-4 font-sans text-sm font-semibold text-[#1C241E] border border-[#1C241E] shadow-sm hover:bg-[#79C68C] transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Opening..." : "Claim Clarity"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 font-sans text-xs text-[#525E55]">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-1.5 font-medium text-[#2E7D4E] hover:underline"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Or upload CAMS / KFintech CAS statement directly →</span>
              </Link>

              <span className="flex items-center gap-1 text-[#8E9B91]">
                <Lock className="h-3 w-3 text-[#2E7D4E]" />
                <span>Client-Side AES-256</span>
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Architectural Balance Footer Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#8E9B91] pt-6 border-t border-[#1C241E]/10">
        <span>UNIFOLIO · ZERO DISTRIBUTOR TOLL</span>
        <div className="flex items-center gap-6">
          <Link href="/features" className="hover:text-[#1C241E] transition-colors">
            Architecture
          </Link>
          <Link href="/pricing" className="hover:text-[#1C241E] transition-colors">
            Zero-Toll Thesis
          </Link>
          <Link href="/about" className="hover:text-[#1C241E] transition-colors">
            Founding Narrative
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
