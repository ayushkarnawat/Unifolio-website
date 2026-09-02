"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Send } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-paper">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-ink">Inquiry Received</h3>
        <p className="mt-2 font-sans text-sm text-ink-soft">
          Thank you for reaching out. A founding team member will respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Siddharth Sharma"
            className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@domain.com"
            className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
          Inquiry Nature
        </label>
        <select
          id="topic"
          name="topic"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink focus:border-accent focus:bg-paper focus:outline-none transition-colors"
        >
          <option>Advisor / RIA Demo</option>
          <option>Institutional Partnership</option>
          <option>Press & Media</option>
          <option>Other Feedback</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="How can we assist you?"
          className="mt-1.5 w-full rounded-xl border border-ink/10 bg-paper-subtle/50 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-paper transition-all hover:bg-ink/90 disabled:opacity-60"
      >
        <span>{status === "loading" ? "Dispatching…" : "Submit Inquiry"}</span>
        <ArrowRight className="h-3.5 w-3.5" />
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
