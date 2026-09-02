export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqContent: FaqItem[] = [
  {
    id: "01",
    question: "What is Unifolio?",
    answer:
      "Unifolio is an AI-powered financial clarity platform that consolidates all your investments, analyzes them intelligently, and provides actionable insights so you can make better financial decisions with confidence.",
  },
  {
    id: "02",
    question: "How does Unifolio collect my data?",
    answer:
      "Unifolio seamlessly imports your official CAS (Consolidated Account Statement) files from CAMS and KFintech, or securely connects with your primary brokers and depository participants without requiring sensitive credentials.",
  },
  {
    id: "03",
    question: "Is my financial data secure?",
    answer:
      "We adhere to enterprise-grade security protocols with end-to-end 256-bit encryption. Your financial data is strictly sovereign, read-only, and never sold, monetized, or shared with third parties.",
  },
  {
    id: "04",
    question: "Which financial institutions are supported?",
    answer:
      "Unifolio supports all 44+ SEBI-registered Asset Management Companies (AMCs) across India, alongside all major depositories (CDSL & NSDL) and leading brokers including Zerodha, Groww, Upstox, and ICICI Direct.",
  },
  {
    id: "05",
    question: "How is Unifolio different from other platforms?",
    answer:
      "Unlike generic trackers, Unifolio provides deep fee dissection (unmasking hidden distributor commissions and expense ratio leakage), multi-PAN family aggregation, and seamless direct migration tools without subscription walls.",
  },
  {
    id: "06",
    question: "Can I track multiple portfolios?",
    answer:
      "Yes. Unifolio's Multi-PAN Architecture allows you to consolidate individual, joint, family members', and HUF accounts into a single master ledger while maintaining discrete tax optimization views.",
  },
];
