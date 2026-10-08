"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
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
      <div className="relative w-full max-w-md rounded-3xl border border-black/[0.08] bg-paper/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-faint hover:bg-black/[0.05] hover:text-ink transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-serif text-2xl font-bold text-ink text-center">Join the waitlist</h2>
        <p className="mt-2 font-sans text-sm text-ink-soft text-center">
          Be first in line when Unifolio opens up. No spam, just one email when it&apos;s your turn.
        </p>
        <div className="mt-6">
          <WaitlistForm onSuccess={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
