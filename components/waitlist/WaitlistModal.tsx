"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsSuccess(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#111613]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-3xl border border-black/[0.08] bg-paper p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-faint hover:bg-black/[0.05] hover:text-ink transition-colors cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 sm:py-10 flex flex-col items-center justify-center text-center">
            {/* Clean Emerald Tick Indicator */}
            <div className="relative flex items-center justify-center mb-1">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-500/25 shadow-[0_4px_16px_rgba(34,197,94,0.20)]">
                <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-[0_2px_10px_rgba(34,197,94,0.35)]">
                  <Check className="h-6 w-6 sm:h-7 sm:w-7 stroke-[3] text-white" />
                </div>
              </div>
            </div>

            {/* Confirmation statement */}
            <h3 className="mt-6 font-sans text-xl sm:text-[22px] font-bold text-neutral-900 tracking-[-0.025em] text-center leading-snug px-2">
              You&apos;re on the list, we&apos;ll be in touch.
            </h3>
          </div>
        ) : (
          <>
            {/* Heading */}
            <h2 className="font-sans text-[28px] sm:text-[32px] font-extrabold text-neutral-950 text-center tracking-[-0.03em] leading-tight">
              Join the waitlist
            </h2>

            {/* Proportionate Centered Subtext (First Sentence Only) */}
            <p className="mt-2.5 font-sans text-base sm:text-[17px] text-neutral-600 font-normal text-center leading-relaxed max-w-sm mx-auto">
              Be first in line when Unifolio opens up.
            </p>

            {/* Form */}
            <div className="mt-6">
              <WaitlistForm
                onSuccess={() => {
                  setIsSuccess(true);
                  setTimeout(() => {
                    onClose();
                  }, 3200);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
