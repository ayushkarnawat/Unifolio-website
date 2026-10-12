import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { siteConfig } from "@/content/site";
import { buildOrganizationSchema } from "@/lib/schema";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { InteractiveFluidBackground } from "@/components/canvas/InteractiveFluidBackground";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Unifolio | Track & Understand Your Family's Investments",
    template: "%s | Unifolio",
  },
  description: siteConfig.description,
  keywords: [
    "family portfolio tracker",
    "mutual fund analytics",
    "track family investments",
    "CAS statement tracker",
    "CAS fee analyzer",
    "direct mutual fund migration",
    "mutual fund overlap checker",
    "hidden commission calculator India",
    "multi-PAN wealth tracker",
    "Pune fintech",
    "Indian mutual funds portfolio",
  ],
  authors: [{ name: "Keystone Wealthtech Pvt. Ltd.", url: siteConfig.url }],
  creator: "Keystone Wealthtech Pvt. Ltd.",
  publisher: "Unifolio",
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Unifolio | Track & Understand Your Family's Investments",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "Unifolio",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Unifolio — Track & Understand Your Family's Investments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unifolio | Track & Understand Your Family's Investments",
    description: siteConfig.description,
    images: ["/og-image.png"],
    creator: "@unifolioin",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = buildOrganizationSchema();

  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`light ${manrope.variable} ${dmSans.variable}`}
    >
      <head>
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Pune" />
        <meta name="geo.position" content="18.5204;73.8567" />
        <meta name="ICBM" content="18.5204, 73.8567" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                localStorage.removeItem('unifolio-theme');
              } catch(e) {}
              if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
              }
              document.documentElement.classList.add('light');
            })()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans bg-[#FAF8F5] text-[#111613] selection:bg-[#22C55E]/40 selection:text-white overflow-x-hidden antialiased">
        <ThemeProvider>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          {/* Subtle Ambient Interactive Fluid Hover Background across the entire site */}
          <InteractiveFluidBackground />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
