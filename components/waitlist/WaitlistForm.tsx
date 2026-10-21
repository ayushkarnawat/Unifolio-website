"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, AlertCircle } from "lucide-react";
import { WAITLIST_FORM, WAITLIST_SUCCESS } from "@/lib/waitlistCopy";
import { isValidEmail } from "@/lib/emailValidation";
import { isValidPhone } from "@/lib/phoneValidation";
import { ArrowIcon, MailIcon, PhoneIcon, UserIcon } from "./WaitlistIcons";
import { WAITLIST_BUTTON_CLASS } from "./waitlistStyles";

/** "panel": desktop and tablet (icon fields). "compact": phone (today's labelled fields). */
export type WaitlistFormVariant = "panel" | "compact";

const FIELDS = [
  { key: "name", id: "wl-name", type: "text", autoComplete: "name", required: true, Icon: UserIcon },
  { key: "email", id: "wl-email", type: "email", autoComplete: "email", required: true, Icon: MailIcon },
  { key: "phone", id: "wl-phone", type: "tel", autoComplete: "tel", required: true, Icon: PhoneIcon },
] as const;

const COMPACT_INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-[#22C55E]/[0.14] transition-colors";

function PanelField({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[13px] border-[1.5px] border-[#111613]/[0.12] bg-white px-3.5 text-[#6B7A70] transition-[border-color,box-shadow] duration-200 focus-within:border-[#22C55E] focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.14)]">
      {icon}
      {children}
    </div>
  );
}

const DEFAULT_WAITLIST_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbx04xf3wztBc96JAeRMSJh7Yr74AP1mjPXuVBIUNwWk6Qk7oZS3wMaZ2cpKCUKi970s/exec";

export function WaitlistForm({
  onSuccess,
  variant = "compact",
}: {
  onSuccess?: () => void;
  variant?: WaitlistFormVariant;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [invalid, setInvalid] = useState<"name" | "email" | "phone" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    // every field is compulsory, and the email and phone must look real
    const bad = !String(data.name ?? "").trim()
      ? "name"
      : !isValidEmail(String(data.email ?? ""))
        ? "email"
        : !isValidPhone(String(data.phone ?? ""))
          ? "phone"
          : null;
    if (bad) {
      setInvalid(bad);
      form.querySelector<HTMLInputElement>(`[name="${bad}"]`)?.focus();
      return;
    }
    setInvalid(null);
    setStatus("loading");
    const webhookUrl = process.env.NEXT_PUBLIC_WAITLIST_WEBHOOK_URL || DEFAULT_WAITLIST_WEBHOOK_URL;

    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ ...data, formType: "waitlist" }),
      });
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
          {WAITLIST_SUCCESS.title}
        </p>
      </div>
    );
  }

  const compact = variant === "compact";

  return (
    <form onSubmit={handleSubmit} noValidate className={compact ? "space-y-4" : "flex flex-col gap-3.5"}>
      {/* Bot Honeypot (hidden from real users) */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        style={{ display: "none" }}
        aria-hidden="true"
      />
      {FIELDS.map(({ key, id, type, autoComplete, required, Icon }) => {
        const copy = WAITLIST_FORM.fields[key];
        if (compact) {
          return (
            <div key={key}>
              <label htmlFor={id} className="block font-mono text-xs uppercase tracking-wider text-ink-faint">
                {copy.label}
              </label>
              <input
                id={id}
                name={key}
                type={type}
                required={required}
                autoComplete={autoComplete}
                placeholder={copy.compactPlaceholder}
                aria-invalid={invalid === key}
                onInput={() => invalid === key && setInvalid(null)}
                className={`${COMPACT_INPUT_CLASS}${invalid === key ? " !border-red-400" : ""}`}
              />
            </div>
          );
        }
        return (
          <PanelField key={key} icon={<Icon className="h-[17px] w-[17px] flex-none" />}>
            <input
              id={id}
              name={key}
              type={type}
              required={required}
              autoComplete={autoComplete}
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              aria-invalid={invalid === key}
              onInput={() => invalid === key && setInvalid(null)}
              className="min-w-0 flex-1 border-0 bg-transparent py-3.5 font-sans text-[14.5px] font-medium text-[#111613] outline-none placeholder:text-[#8A9690] focus:outline-none"
            />
          </PanelField>
        );
      })}
      <button type="submit" disabled={status === "loading"} className={WAITLIST_BUTTON_CLASS}>
        <span>{status === "loading" ? WAITLIST_FORM.submitting : WAITLIST_FORM.submit}</span>
        {!compact && status !== "loading" && <ArrowIcon className="h-[18px] w-[18px]" />}
      </button>
      {invalid && (
        <p role="alert" className="flex items-center gap-1 font-sans text-[13px] text-red-500">
          <AlertCircle className="h-3.5 w-3.5 flex-none" />
          <span>{WAITLIST_FORM.invalid[invalid]}</span>
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="flex items-center gap-1 font-mono text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{WAITLIST_FORM.error}</span>
        </p>
      )}
    </form>
  );
}
