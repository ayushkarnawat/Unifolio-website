"use client";

import { useState, type FormEvent } from "react";
import { HandDrawnSparkle, HandDrawnUnderline } from "@/components/illustrations/HandDrawnAnnotations";
import { ArrowRight, CheckCircle2, AlertCircle, Mail } from "lucide-react";

export function NewsletterBand() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative overflow-hidden border-t border-ink/[0.08] bg-mint-50/60 py-16 text-ink">
      <div className="relative mx-auto flex max-w-content flex-col gap-8 px-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-accent-dark font-bold">
            <Mail className="h-3.5 w-3.5 text-accent" />
            <span>THE UNIFOLIO DISPATCH</span>
          </div>

          <h3 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-ink">
            Portfolio insight, not spam.
          </h3>
          <p className="mt-2 font-sans text-sm sm:text-base text-ink-soft leading-relaxed">
            Thoughtful data breakdowns and fee analysis across Indian mutual funds — occasional and honest.
          </p>
        </div>

        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-mint-300 bg-white px-5 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-semibold text-white shadow-sketch-btn hover:bg-accent-dim transition-all disabled:opacity-60"
            >
              <span>{status === "loading" ? "Sending…" : "Subscribe"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {status === "success" && (
            <p className="mt-3 flex items-center gap-1.5 font-sans text-xs text-accent font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Subscribed. Welcome to the dispatch!</span>
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 flex items-center gap-1.5 font-sans text-xs text-red-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Something went wrong — please try again.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
