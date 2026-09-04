import type { Metadata } from "next";
import { BlueprintNav } from "@/components/blueprint/BlueprintNav";
import { FinancialLandscapeExperience } from "@/components/landscape/FinancialLandscapeExperience";
import { BlueprintContact } from "@/components/blueprint/BlueprintContact";

export const metadata: Metadata = {
  title: "Product — The 3D Financial Landscape",
  description:
    "Explore your wealth as an evolving abstract 3D Financial Landscape. Understand every account, fee, overlap, and risk in one unified sculptural perspective.",
};

export default function ProductPage() {
  return (
    <main className="relative bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500">
      {/* Floating Pill Navigation Bar */}
      <BlueprintNav />

      {/* Full Dedicated Product Experience: The 3D Financial Landscape */}
      <FinancialLandscapeExperience />

      {/* Closing Contact & Waitlist */}
      <BlueprintContact />
    </main>
  );
}
