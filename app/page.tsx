import type { Metadata } from "next";
import { BlueprintNav } from "@/components/blueprint/BlueprintNav";
import { BlueprintHero } from "@/components/blueprint/BlueprintHero";
import { BlueprintAboutMetrics } from "@/components/blueprint/BlueprintAboutMetrics";
import { BlueprintFaq } from "@/components/blueprint/BlueprintFaq";
import { BlueprintContact } from "@/components/blueprint/BlueprintContact";
import { buildSoftwareApplicationSchema, buildFaqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Unifolio | Track & Understand Your Family's Investments",
  description:
    "Track mutual funds, stocks, FDs, loans and cards for your whole family in one app. See what you really own, what it costs you and where you're at risk.",
};

export default function HomePage() {
  const softwareSchema = buildSoftwareApplicationSchema();
  const faqSchema = buildFaqSchema();

  return (
    <main className="relative bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Floating Pill Navigation Bar */}
      <BlueprintNav />

      {/* Section 1, 2 & 3: Hero Landing, Product World & Cinematic Spatial Security Experience with 3D Ring */}
      <BlueprintHero />

      {/* Section 4: About Unifolio + Statistics Metrics Grid */}
      <BlueprintAboutMetrics />

      {/* Section 5: FAQ Accordion */}
      <BlueprintFaq />

      {/* Section 6: Unified Full-Screen Contact & Closing Experience */}
      <BlueprintContact />
    </main>
  );
}
