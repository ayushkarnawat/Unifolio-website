/**
 * Copy for the Product section (components/product/ProductSection.tsx).
 * Approved wording from page 7 (the copy page) of "Unifolio Website Redesign.pdf".
 * The `emphasis` part of each line is shown in green.
 */

export const PRODUCT_HEADLINE = {
  lead: "From seeing your wealth to ",
  emphasis: "understanding it.",
} as const;

export const PRODUCT_VISUAL_LABEL = "Animated illustration: assets flowing into the Unifolio dashboard";

export type ProductCard = {
  num: "01" | "02" | "03";
  label: string;
  titleLead: string;
  titleEmphasis: string;
  body: string;
  illustration: { src: string; width: number; height: number };
};

export const PRODUCT_CARDS: ProductCard[] = [
  {
    num: "01",
    label: "Track",
    titleLead: "See your whole ",
    titleEmphasis: "financial picture.",
    body: "Bring mutual funds, stocks, real estate, gold and more together in one family-level view.",
    illustration: { src: "/product-storyboard/card-ill-1.webp", width: 105, height: 147 },
  },
  {
    num: "02",
    label: "Analyse",
    titleLead: "Understand what’s ",
    titleEmphasis: "really happening.",
    body: "Go beyond portfolio value. Understand returns, uncover overlapping investments, and identify potential risks and hidden costs.",
    illustration: { src: "/product-storyboard/card-ill-2.webp", width: 101, height: 108 },
  },
  {
    num: "03",
    label: "Plan",
    titleLead: "Make your next move ",
    titleEmphasis: "with clarity.",
    body: "Explore different scenarios, track your goals, and understand how today’s financial decisions could shape your family’s future.",
    illustration: { src: "/product-storyboard/card-ill-3.webp", width: 130, height: 181 },
  },
];
