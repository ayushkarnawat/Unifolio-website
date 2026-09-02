export interface PricingRow {
  feature: string;
  unifolio: string;
  mprofit: string;
}

export const pricingContent = {
  heading: "Free. Forever. No card required.",
  subhead:
    "Unifolio's core tracking and analytics are free for every user. No trial, no card, no feature wall on the numbers that matter.",
  // [PLACEHOLDER] — pull real, sourced rows from Docs/Competitor Analysis/ once it exists in this repo.
  // Every row must be independently verifiable before this ships; nothing fabricated.
  comparisonRows: [
    {
      feature: "CAS import (CAMS + KFintech)",
      unifolio: "Included, free",
      mprofit: "[PLACEHOLDER: verify against competitor analysis]",
    },
    {
      feature: "XIRR & portfolio analytics",
      unifolio: "Included, free",
      mprofit: "[PLACEHOLDER: verify against competitor analysis]",
    },
    {
      feature: "Fee & commission transparency",
      unifolio: "Included, free",
      mprofit: "[PLACEHOLDER: verify against competitor analysis]",
    },
  ] as PricingRow[],
  comingSoon: {
    label: "Pro — coming soon",
    description:
      "Household-level aggregation for advisors, extended history. Not priced yet — replace this block with a real two-tier table if a paid tier is confirmed.",
  },
};
