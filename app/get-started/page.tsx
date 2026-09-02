import type { Metadata } from "next";
import { GetStartedFunnel } from "@/components/sections/GetStartedFunnel";

export const metadata: Metadata = {
  title: "Get Started — Free Onboarding",
  description:
    "Start tracking your mutual funds for free, or book a demo for your advisory practice.",
};

export default function GetStartedPage() {
  return (
    <div className="relative overflow-hidden py-12 sm:py-20">
      {/* Background Grid & Spotlight */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]" />

      <GetStartedFunnel />
    </div>
  );
}
