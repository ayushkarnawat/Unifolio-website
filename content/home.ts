export const homeContent = {
  hero: {
    eyebrow: "Mutual fund tracking, built for India",
    headline: "Your whole portfolio. One reading.",
    subhead:
      "Unifolio replaces the RTA logins, broker apps, and the dying spreadsheet with a single CAS import — free, and honest about the number behind the number.",
    primaryCta: { label: "Start free", href: "/get-started" },
    secondaryCta: { label: "See how it works", href: "/features" },
  },
  beforeAfter: {
    label: "The problem",
    before: {
      title: "Today",
      items: [
        "CAS statements scattered across RTAs",
        "Holdings split across three broker apps",
        "A spreadsheet nobody fully trusts",
        "A paid tool gatekeeping the one view that would fix it",
      ],
    },
    after: {
      title: "With Unifolio",
      items: [
        "One CAS upload, parsed automatically",
        "Every holding, in one dashboard",
        "Real XIRR, gains, and fees — not estimates",
        "Free, forever, no card required",
      ],
    },
  },
  trustBar: {
    // [PLACEHOLDER] — needs a marketing/legal check and a real AMC count before launch.
    claim: "Works with your CAS from every AMC — powered by MFCentral.",
    subClaim: "[PLACEHOLDER: real AMC count, e.g. \"44+ AMCs\"] once confirmed.",
  },
  beatsTeaser: {
    label: "How it works",
    heading: "Import. See. Understand.",
    beats: [
      {
        step: "Import",
        description: "One CAS upload parses every AMC statement in it automatically.",
      },
      {
        step: "See",
        description: "Every holding, folio, and transaction in one dashboard.",
      },
      {
        step: "Understand",
        description: "What each fund actually costs you, and how it compares.",
      },
    ],
    cta: { label: "See the full flow", href: "/features" },
  },
  pricingTeaser: {
    heading: "Free. Forever. No card required.",
    body: "Mprofit charges for the depth that should be table stakes. Unifolio doesn't.",
    cta: { label: "Compare plans", href: "/pricing" },
  },
};
