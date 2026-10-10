"use client";

import { useState, type FormEvent } from "react";
import { Check, AlertCircle } from "lucide-react";

export function WaitlistForm({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const webhookUrl = process.env.NEXT_PUBLIC_WAITLIST_WEBHOOK_URL;

    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(data),
        });
      }
      setStatus("success");
      form.reset();
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center mb-1">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-500/25 shadow-[0_4px_16px_rgba(34,197,94,0.20)]">
            <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-[0_2px_10px_rgba(34,197,94,0.35)]">
              <Check className="h-6 w-6 sm:h-7 sm:w-7 stroke-[3] text-white" />
            </div>
          </div>
        </div>
        <p className="mt-5 font-sans text-xl sm:text-[22px] font-bold text-neutral-900 tracking-[-0.02em] text-center leading-snug">
          You&apos;re on the list, we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="wl-name" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
          Full Name
        </label>
        <input
          id="wl-name"
          name="name"
          required
          placeholder="e.g. Siddharth Sharma"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="wl-email" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
          Email Address
        </label>
        <input
          id="wl-email"
          name="email"
          type="email"
          required
          placeholder="name@domain.com"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="wl-phone" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
          Phone Number
        </label>
        <input
          id="wl-phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full border-[2.5px] border-[#22C55E] bg-white hover:bg-[#22C55E] px-6 py-3.5 sm:py-4 font-sans text-[17px] sm:text-lg font-bold text-[#22C55E] hover:text-white transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center text-center"
      >
        <span>{status === "loading" ? "Joining…" : "Join the waitlist"}</span>
      </button>
      {status === "error" && (
        <p className="flex items-center gap-1 font-mono text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Something went wrong — please try again.</span>
        </p>
      )}
    </form>
  );
}
