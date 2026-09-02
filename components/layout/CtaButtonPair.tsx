"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/content/site";
import { detectMobilePlatform } from "@/lib/device";
import { ArrowRight, Smartphone } from "lucide-react";

export function CtaButtonPair({ className = "" }: { className?: string }) {
  const [mobileHref, setMobileHref] = useState(siteConfig.playStoreUrl);
  const [mobileLabel, setMobileLabel] = useState("Get the app");

  useEffect(() => {
    const platform = detectMobilePlatform(navigator.userAgent);

    if (platform === "ios") {
      setMobileHref(siteConfig.appStoreUrl);
      setMobileLabel("iOS App");
    } else if (platform === "android") {
      setMobileHref(siteConfig.playStoreUrl);
      setMobileLabel("Android App");
    }
  }, []);

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <a
        href={mobileHref}
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-1.5 rounded-full border border-ink/10 bg-white/80 px-3.5 py-1.5 font-sans text-xs font-medium text-ink-soft transition-all hover:border-ink/30 hover:text-ink sm:inline-flex"
      >
        <Smartphone className="h-3.5 w-3.5 text-accent" />
        <span>{mobileLabel}</span>
      </a>

      <a
        href={siteConfig.webAppUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-sans text-xs font-semibold text-white shadow-sketch-btn transition-all hover:bg-accent-dim hover:shadow-md active:scale-95"
      >
        <span>Open App</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
