import type { Metadata } from "next";
import { HeroIntroLogo } from "@/components/hero/HeroIntroLogo";
import { BlueprintNav } from "@/components/blueprint/BlueprintNav";
import { BlueprintHero } from "@/components/blueprint/BlueprintHero";
import { FinancialLandscapeExperience } from "@/components/landscape/FinancialLandscapeExperience";
import { SecurityExperience } from "@/components/security/SecurityExperience";
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
    <main className="relative bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Cinematic Initial Brand Logo Intro & Navbar Flight */}
      <HeroIntroLogo />

      {/* Floating Pill Navigation Bar */}
      <BlueprintNav />

      {/* Section 1: Hero Aperture Landing & Expansion */}
      <BlueprintHero />

      {/* Section 2: The 3D Financial Landscape (Product Narrative) */}
      <FinancialLandscapeExperience />

      {/* Section 3: Cinematic Spatial Security Narrative */}
      <SecurityExperience />

      {/* Section 4: About Unifolio + Statistics Metrics Grid */}
      <BlueprintAboutMetrics />

      {/* Section 5: FAQ Accordion */}
      <BlueprintFaq />

      {/* Section 6: Unified Full-Screen Contact & Closing Experience */}
      <BlueprintContact />
    </main>
  );
}
