"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { ArcMark } from "@/components/ui/ArcMark";
import { siteConfig } from "@/content/site";
import {
  HandDrawnUnderline,
  HandDrawnBadgeIcon,
  HandDrawnSparkle,
} from "@/components/illustrations/HandDrawnAnnotations";
import { SketchFolderIllustration } from "@/components/illustrations/SketchFolderIllustration";
import { WindingJourneyIllustration } from "@/components/illustrations/WindingJourneyIllustration";
import { ScatteredToOrderedIllustration } from "@/components/illustrations/ScatteredToOrderedIllustration";
import { ArrowRight, ArrowLeft, Check, Key, Smartphone, Mail, User } from "lucide-react";

export function GetStartedFunnel() {
  const [step, setStep] = useState<number>(1);
  const [objective, setObjective] = useState<string>("consolidated");
  const [investingStyle, setInvestingStyle] = useState<string>("own");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  return (
    <section className="relative mx-auto max-w-content px-4 py-12 sm:px-8 sm:py-20">
      {/* Top Stepper Progress Bar (Inspired by Screenshots 2-7) */}
      <div className="mx-auto max-w-sm mb-10">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-accent"
                  : s < step
                  ? "w-4 bg-accent/60"
                  : "w-4 bg-ink/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg">
        <AnimatePresence mode="wait">
          {/* STEP 1: What brings you to Unifolio? (Screenshot 7) */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <WindingJourneyIllustration className="w-48 h-48" />
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                What brings you to Unifolio?
              </h1>
              <p className="mt-2 font-sans text-sm text-ink-soft">
                Pick what matters most to you, and we&apos;ll tailor your dashboard around it.
              </p>

              <div className="mt-8 space-y-3 text-left">
                {[
                  {
                    id: "consolidated",
                    icon: "server" as const,
                    title: "Consolidated portfolio view",
                    desc: "See all my mutual funds across every broker and fund house in one place",
                  },
                  {
                    id: "performance",
                    icon: "lens" as const,
                    title: "Understand true performance",
                    desc: "See your true returns after fees, taxes and plan type",
                  },
                  {
                    id: "family",
                    icon: "umbrella" as const,
                    title: "Family wealth tracking",
                    desc: "Managing investments for family members under one dashboard",
                  },
                  {
                    id: "fees",
                    icon: "scale" as const,
                    title: "Compare distributor fees",
                    desc: "Compare returns and costs across different distributors",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setObjective(opt.id);
                      setStep(2);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      objective === opt.id
                        ? "border-accent bg-mint-50/80 shadow-sm"
                        : "border-ink/[0.08] bg-white hover:border-mint-300 hover:bg-mint-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <HandDrawnBadgeIcon type={opt.icon} className="w-10 h-10 shrink-0" />
                      <div>
                        <p className="font-display text-sm font-bold text-ink">{opt.title}</p>
                        <p className="font-sans text-xs text-ink-soft mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-faint shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: How are you investing right now? (Screenshot 6) */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <ScatteredToOrderedIllustration className="w-48 h-44" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                How are you investing right now?
              </h2>
              <p className="mt-2 font-sans text-sm text-ink-soft">
                Choose what best describes how you invest today
              </p>

              <div className="mt-8 space-y-3 text-left">
                {[
                  {
                    id: "own",
                    icon: "gauge" as const,
                    title: "Mostly on my own",
                    desc: "Direct SIPs, mutual funds, maybe some stocks",
                  },
                  {
                    id: "advisor",
                    icon: "bank" as const,
                    title: "Through an advisor or distributor",
                    desc: "Distributor, bank advisor or family office, alongside my own tracking",
                  },
                  {
                    id: "both",
                    icon: "rings" as const,
                    title: "A mix of both",
                    desc: "A bit of self-directed investing and a bit through an advisor",
                  },
                  {
                    id: "starting",
                    icon: "sprout" as const,
                    title: "Just getting started",
                    desc: "Haven't invested much yet, building my portfolio",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setInvestingStyle(opt.id);
                      setStep(3);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      investingStyle === opt.id
                        ? "border-accent bg-mint-50/80 shadow-sm"
                        : "border-ink/[0.08] bg-white hover:border-mint-300 hover:bg-mint-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <HandDrawnBadgeIcon type={opt.icon} className="w-10 h-10 shrink-0" />
                      <div>
                        <p className="font-display text-sm font-bold text-ink">{opt.title}</p>
                        <p className="font-sans text-xs text-ink-soft mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-faint shrink-0 ml-2" />
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 font-sans text-xs text-ink-faint hover:text-ink transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: What should we call you? (Screenshot 5) */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <SketchFolderIllustration className="w-48 h-48" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                What should we call you?
              </h2>
              <p className="mt-2 font-sans text-sm text-ink-soft max-w-sm mx-auto">
                We&apos;ll use this to personalize your mutual fund summaries, portfolio reports, and tax statements
              </p>

              <div className="mt-8 space-y-4 text-left">
                <div>
                  <label htmlFor="user-name" className="block font-sans text-xs font-semibold text-ink mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    <input
                      id="user-name"
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-mint-400 bg-white font-sans text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-sans text-sm font-semibold text-white shadow-sketch-btn hover:bg-accent-dim transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 font-sans text-xs text-ink-faint hover:text-ink transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Create your account (Screenshot 2) */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <ArcMark className="h-16 w-16" score={65} animated />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Create your account
              </h2>

              <div className="mt-8 space-y-4 text-left">
                <div>
                  <label htmlFor="user-email" className="block font-sans text-xs font-semibold text-ink mb-1.5">
                    Email address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-ink/[0.12] bg-white font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-sans text-sm font-semibold text-white shadow-sketch-btn hover:bg-accent-dim transition-all"
                >
                  <span>Create account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center pt-2">
                  <p className="font-sans text-xs text-ink-soft">
                    Already have an account?{" "}
                    <span className="relative font-bold text-accent cursor-pointer">
                      Log in
                      <HandDrawnUnderline className="w-12 h-2.5 mx-auto" />
                    </span>
                  </p>
                </div>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="h-px w-full bg-ink/[0.08]" />
                  <span className="absolute bg-paper px-3 font-mono text-[10px] uppercase text-ink-faint">
                    OR
                  </span>
                </div>

                <a
                  href={siteConfig.webAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-ink/[0.12] bg-white py-3 font-sans text-sm font-medium text-ink hover:bg-paper-subtle transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.39 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </a>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1 font-sans text-xs text-ink-faint hover:text-ink transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Verify your email (Screenshot 3) */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <HandDrawnBadgeIcon type="envelope" className="w-16 h-16" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Verify your email
              </h2>
              <p className="mt-2 font-sans text-sm text-ink-soft">
                We sent a 6-digit verification code to {email || "you@example.com"}
              </p>

              {/* Dev OTP Helper Pill (Screenshot 3 signature) */}
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-mint-300 bg-mint-50 px-4 py-2.5">
                <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-accent-dark">
                  <Key className="h-3.5 w-3.5 text-accent" />
                  <span>Demo OTP:</span>
                </span>
                <span className="rounded-lg bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-ink shadow-sm">
                  613477
                </span>
              </div>

              <div className="mt-8 space-y-4 text-left">
                <div>
                  <label htmlFor="user-otp" className="block font-sans text-xs font-semibold text-ink mb-1.5 text-center">
                    Verification code
                  </label>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-11 rounded-xl border border-ink/[0.15] bg-white flex items-center justify-center font-mono text-lg font-bold text-ink"
                      >
                        {"613477"[i]}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-sans text-sm font-semibold text-white shadow-sketch-btn hover:bg-accent-dim transition-all mt-6"
                >
                  <span>Verify & Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-between text-xs font-sans text-ink-soft pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="hover:text-ink transition-colors"
                  >
                    ← Change email
                  </button>
                  <button type="button" className="font-semibold text-accent hover:underline">
                    Resend code
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: One more step - Mobile number (Screenshot 4) */}
          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <HandDrawnBadgeIcon type="phone" className="w-16 h-16" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                One more step
              </h2>
              <p className="mt-2 font-sans text-sm text-ink-soft">
                Verify your mobile number to finish creating your account for {email || "you@example.com"}
              </p>

              <div className="mt-8 space-y-4 text-left">
                <div>
                  <label htmlFor="user-phone" className="block font-sans text-xs font-semibold text-ink mb-1.5">
                    Mobile number
                  </label>
                  <div className="flex rounded-2xl border border-mint-400 bg-white overflow-hidden p-1">
                    <span className="px-3 py-2.5 font-mono text-xs text-ink font-semibold border-r border-ink/[0.08] flex items-center">
                      IN +91
                    </span>
                    <input
                      id="user-phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 font-sans text-sm text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <a
                  href={siteConfig.webAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-sans text-sm font-semibold text-white shadow-sketch-btn hover:bg-accent-dim transition-all mt-4"
                >
                  <span>Launch Unifolio Web App</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1 font-sans text-xs text-ink-faint hover:text-ink transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
