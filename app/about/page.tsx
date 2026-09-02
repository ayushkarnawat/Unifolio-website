import type { Metadata } from "next";
import { FounderStory } from "@/components/sections/FounderStory";
import { LivingFamilyContourIllustration } from "@/components/illustrations/living/LivingFamilyContourIllustration";
import { LivingSecurityRibbonIllustration } from "@/components/illustrations/living/LivingSecurityRibbonIllustration";
import { aboutContent } from "@/content/about";

export const metadata: Metadata = {
  title: "About — The Founding Story",
  description: "Why Unifolio was built, and who it's for.",
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden py-12 sm:py-20 bg-[#FAF8F5]">
      {/* Background Grid Texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-40" />

      <FounderStory content={aboutContent} />

      {/* Living Family & Security Editorial Artwork */}
      <div className="mx-auto max-w-content px-4 sm:px-8 mt-12 mb-16 space-y-16">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-handwriting text-2xl text-[#2E7D4E]">
            One place for your entire family’s journey
          </span>
          <div className="w-full max-w-2xl mt-4">
            <LivingFamilyContourIllustration />
          </div>
        </div>

        <div className="w-full">
          <LivingSecurityRibbonIllustration />
        </div>
      </div>
    </div>
  );
}
