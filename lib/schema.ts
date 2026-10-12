import { siteConfig } from "@/content/site";
import { faqContent, type FaqItem } from "@/content/faq";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Unifolio",
    legalName: "Keystone Wealthtech Private Limited",
    url: siteConfig.url,
    logo: `${siteConfig.url}/Logo/unifolio-wordmark-dark.png`,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contactEmail,
      contactType: "customer support",
    },
    sameAs: [
      siteConfig.social.twitter,
      siteConfig.social.linkedin,
      siteConfig.social.instagram,
      siteConfig.social.facebook,
    ],
  };
}

export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    headline: "Track & Understand Your Family's Investments",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android",
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Family Multi-PAN portfolio tracking",
      "CAS Statement upload and automatic parsing",
      "Hidden mutual fund commission and fee analysis",
      "Direct mutual fund migration calculator",
      "Portfolio overlap and stock concentration check",
      "Consolidated asset tracking (Mutual Funds, Stocks, FDs, Loans, Cards)",
    ],
  };
}

export function buildFaqSchema(items: FaqItem[] = faqContent) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
