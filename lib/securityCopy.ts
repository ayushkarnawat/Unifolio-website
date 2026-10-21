/**
 * Copy for the Security section (components/security/SecuritySection.tsx).
 * Approved wording from page 10 (the copy page) of "Unifolio Website Redesign.pdf"
 * ("RBI's" fixes the PDF typo). The trust block wording lives in lib/trustHighlights.ts
 * (shared with the hero).
 */

export const SECURITY_HEADLINE = {
  lead: "We take your data as ",
  emphasis: "seriously",
  middle: " as you take your ",
  /** Animated as a banknote (components/security/MoneyWord.tsx). */
  money: "money",
  tail: ".",
} as const;

export const SECURITY_VISUAL_LABEL =
  "Animated illustration: a vault door protecting mutual funds, stocks, bank accounts, real estate, PMS and gold";

export type SecurityIconId = "eye" | "lock" | "sell" | "india";

export type SecurityPrinciple = {
  id: SecurityIconId;
  title: string;
  body: string;
  icon: { src: string; width: number; height: number };
};

export const SECURITY_PRINCIPLES: SecurityPrinciple[] = [
  {
    id: "eye",
    title: "Read only, always",
    body: "Unifolio can view your connected accounts, never move your money.",
    icon: { src: "/security-storyboard/icon-eye.webp", width: 240, height: 240 },
  },
  {
    id: "lock",
    title: "We never save your passwords",
    body: "Your credentials stay secure. We access your financial data without needing your passwords.",
    icon: { src: "/security-storyboard/icon-lock.webp", width: 240, height: 240 },
  },
  {
    id: "sell",
    title: "We don’t sell your data",
    body: "Your financial data is used to provide your financial insights, not sold for advertising.",
    icon: { src: "/security-storyboard/icon-no-sell.webp", width: 240, height: 240 },
  },
  {
    id: "india",
    title: "Stored in India",
    body: "Your data stays on secure infrastructure based in India, meeting RBI’s data localisation requirements.",
    icon: { src: "/security-storyboard/icon-shield.webp", width: 240, height: 240 },
  },
];
