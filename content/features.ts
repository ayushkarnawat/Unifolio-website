export interface FeatureBeatContent {
  step: string;
  headline: string;
  claim: string;
  investorNote: string;
  advisorNote: string;
}

export const featuresContent = {
  intro: {
    eyebrow: "Product",
    heading: "Built as the product's real flow — not a features grid.",
    subhead:
      "Every beat below is a real part of using Unifolio, in the order you'd actually hit it.",
  },
  beats: [
    {
      step: "Import",
      headline: "One CAS upload parses every AMC statement automatically",
      claim:
        "Upload the consolidated account statement from CAMS or KFintech once. Unifolio parses holdings, transactions, gains, and XIRR — no manual entry.",
      investorNote: "Works with the same CAS you'd otherwise re-key into a spreadsheet.",
      advisorNote: "Import a household's statements once and aggregate across members.",
    },
    {
      step: "See",
      headline: "Everything you own, in one dashboard",
      claim:
        "Holdings, folios, and transactions across every AMC, in one screen — not four apps and a tab.",
      investorNote: "One place to check before making any decision.",
      advisorNote: "One view per household, not one tab per client per platform.",
    },
    {
      step: "Understand",
      headline: "What each fund is actually costing you",
      claim:
        "Category and benchmark comparisons alongside the fees and commissions most summaries leave out.",
      investorNote: "See the number behind the number — not just the return.",
      advisorNote: "Show clients the cost breakdown you'd otherwise have to compile by hand.",
    },
    {
      step: "Track",
      headline: "The whole picture, kept current",
      claim:
        "The same reading, updated — whether you're checking daily or once a quarter.",
      investorNote: "No re-import required to stay current.",
      advisorNote: "The same trusted view your client sees, on your side too.",
    },
  ] as FeatureBeatContent[],
  scoring: {
    eyebrow: "The Unifolio Score",
    heading: "A proprietary, explainable score — not a black box.",
    // [PLACEHOLDER] — replace with the real methodology once Docs/Scorer-Methodology-Unifolio.md exists in this repo.
    body:
      "[PLACEHOLDER: pending the scoring methodology document — this section should name the specific inputs the score uses and how they're weighted, not just claim it exists.]",
  },
};
