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
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — All your investments. Finally, together.`,
    template: `%s — ${siteConfig.name}`,
  },
  description: "Unifolio unifies every part of your financial life so you can see the big picture and make smarter decisions.",
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/" },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/Logo/unifolio-ring-transparent.png",
    shortcut: "/Logo/unifolio-ring-transparent.png",
    apple: "/Logo/unifolio-ring-transparent.png",
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
