import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/sections/ContactForm";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Mail, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Institutional & Press Inquiries",
  description:
    "Press and partnership inquiries. Looking to sign up or book a demo? Visit Get Started instead.",
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Subtle Grid Texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-40" />

      <div className="mx-auto max-w-content px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Editorial Header */}
          <div className="lg:col-span-5 space-y-4">
            <SectionLabel>Inquiries</SectionLabel>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-ink leading-tight">
              Get in touch with the Unifolio team.
            </h1>
            <p className="font-sans text-base text-ink-soft leading-relaxed">
              For advisor demonstrations, institutional integrations, press commentary, and general
              partnerships.
            </p>

            <div className="pt-4 rounded-2xl border border-ink/[0.08] bg-paper-elevated p-6 shadow-panel-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
                Looking to begin tracking right away?
              </p>
              <p className="mt-1 font-sans text-sm text-ink font-medium">
                Try the interactive onboarding flow.
              </p>
              <div className="mt-4">
                <Link
                  href="/get-started"
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-accent hover:underline"
                >
                  <span>Go to Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-ink/[0.08] bg-paper-elevated p-8 sm:p-10 shadow-panel-lg">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
