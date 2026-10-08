"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

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
      setTimeout(() => onSuccess?.(), 2200);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-paper">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="mt-3 font-sans text-sm text-ink-soft">You&apos;re on the list — we&apos;ll be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="wl-name" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">Full Name</label>
        <input id="wl-name" name="name" required placeholder="e.g. Siddharth Sharma"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors" />
      </div>
      <div>
        <label htmlFor="wl-email" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">Email Address</label>
        <input id="wl-email" name="email" type="email" required placeholder="name@domain.com"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors" />
      </div>
      <div>
        <label htmlFor="wl-phone" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">Phone Number</label>
        <input id="wl-phone" name="phone" type="tel" placeholder="+91 98765 43210"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors" />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#22C55E] hover:bg-[#16A34A] px-6 py-3.5 font-sans text-sm font-bold text-white shadow-[0_4px_16px_rgba(34,197,94,0.35)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
      >
        <span>{status === "loading" ? "Joining…" : "Join the waitlist"}</span>
        <ArrowRight className="h-4 w-4 stroke-[2.5] text-white" />
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
