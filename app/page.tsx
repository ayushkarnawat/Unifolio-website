import type { Metadata } from "next";
import { BlueprintNav } from "@/components/blueprint/BlueprintNav";
import { BlueprintHero } from "@/components/blueprint/BlueprintHero";
import { BlueprintStackingCards } from "@/components/blueprint/BlueprintStackingCards";
import { BlueprintAboutMetrics } from "@/components/blueprint/BlueprintAboutMetrics";
import { BlueprintFaq } from "@/components/blueprint/BlueprintFaq";
import { BlueprintContact } from "@/components/blueprint/BlueprintContact";
import { buildSoftwareApplicationSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Unifolio — Financial Clarity",
  description:
    "An independent portfolio intelligence engine specializing in Mutual Fund Analytics, Fee Dissection, Multi-PAN Wealth, and Direct Migration.",
};

export default function HomePage() {
  const softwareSchema = buildSoftwareApplicationSchema();

  return (
    <main className="relative bg-[#000000]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Floating Pill Navigation Bar */}
      <BlueprintNav />

      {/* Section 1 & 2: Hero Aperture Zoom → Continuous 3D Orbital Cards → Text Reveal → Marquee */}
      <BlueprintHero />

      {/* Section 3: Horizontal Storytelling Capability Suite */}
      <BlueprintStackingCards />

      {/* Section 4: About Unifolio + Statistics Metrics Grid */}
      <BlueprintAboutMetrics />

      {/* Section 5: FAQ Accordion */}
      <BlueprintFaq />

      {/* Section 6: Unified Full-Screen Contact & Closing Experience */}
      <BlueprintContact />
    </main>
  );
}
