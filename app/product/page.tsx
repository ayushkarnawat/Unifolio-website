import type { Metadata } from "next";
import { BlueprintNav } from "@/components/blueprint/BlueprintNav";
import { ProductExperience } from "@/components/product/ProductExperience";
import { BlueprintContact } from "@/components/blueprint/BlueprintContact";

export const metadata: Metadata = {
  title: "Product — Understand Your Wealth | Unifolio",
  description:
    "Explore the five core dimensions of wealth intelligence: Ask anything, See everything, Understand what you own, Know your risk, and Plan ahead.",
};

export default function ProductPage() {
  return (
    <main className="relative bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500 pt-16">
      {/* Floating Pill Navigation Bar */}
      <BlueprintNav />

      {/* Full Dedicated Product Experience */}
      <ProductExperience />

      {/* Closing Contact & Waitlist */}
      <BlueprintContact />
    </main>
  );
}
