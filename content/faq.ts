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
      "Unifolio is a wealth intelligence platform that brings your family's investments together in one place. It helps you understand your overall portfolio, uncover meaningful insights and make more informed financial decisions.",
  },
  {
    id: "02",
    question: "What can I actually learn about my investments?",
    answer:
      "Unifolio goes beyond showing you what you own. You can explore portfolio performance, identify overlapping investments, understand concentration and risk, and see how your family's investments fit together.",
  },
  {
    id: "03",
    question: "How is Unifolio different from other investment apps?",
    answer:
      "Most investment platforms focus on individual accounts or investments. Unifolio takes a broader view, helping you bring your family's financial assets together and understand them as a whole. The goal isn't just to show you your numbers, but to help you understand what they mean.",
  },
  {
    id: "04",
    question: "Which investments can I track with Unifolio?",
    answer:
      "Unifolio helps you bring most of your family's assets together in one place, including mutual funds, stocks, PMS, real estate, gold and more. We're continuously working to expand our coverage so you can get a more complete picture of your family's wealth. In future versions, we also plan to introduce debt tracking, including loans and credit cards, to help you understand your family's financial position more holistically.",
  },
  {
    id: "05",
    question: "Can I see my entire family's portfolio in one place?",
    answer:
      "Yes. Unifolio is designed to help you view your family's investments together, rather than managing each person's portfolio in isolation. This gives you a clearer picture of your combined holdings and helps you understand how the different investments fit together.",
  },
  {
    id: "06",
    question: "Is my financial data secure?",
    answer:
      "Protecting your financial information is a priority. Unifolio uses security measures such as encryption to help safeguard data, alongside controls over how financial accounts are connected. We aim to give you greater visibility into your wealth without compromising your privacy. You can find more details in our Security section and Privacy Policy.",
  },
  {
    id: "07",
    question: "How does Unifolio access my financial data?",
    answer:
      "Unifolio uses supported account-connection methods and data-import options to help bring your financial information together. The process and permissions depend on the type of account and integration. You can review the relevant permissions before connecting an account.",
  },
];
