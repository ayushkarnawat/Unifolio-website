"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { User, Briefcase } from "lucide-react";

type Audience = "investor" | "advisor";

const AudienceContext = createContext<Audience>("investor");

export function useAudience() {
  return useContext(AudienceContext);
}

export function InvestorAdvisorToggle({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<Audience>("investor");

  return (
    <AudienceContext.Provider value={audience}>
      <div className="my-8 flex items-center justify-start">
        <div className="inline-flex rounded-full border border-ink/[0.08] bg-paper-subtle/80 p-1.5 shadow-panel-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setAudience("investor")}
            aria-pressed={audience === "investor"}
            className={`relative flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs transition-all ${
              audience === "investor"
                ? "text-ink font-bold"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <User className={`h-3.5 w-3.5 ${audience === "investor" ? "text-accent" : "text-ink-faint"}`} />
            <span>For DIY Investors</span>

            {audience === "investor" && (
              <motion.div
                layoutId="audienceTab"
                className="absolute inset-0 rounded-full bg-paper-elevated border border-ink/[0.08] shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setAudience("advisor")}
            aria-pressed={audience === "advisor"}
            className={`relative flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs transition-all ${
              audience === "advisor"
                ? "text-ink font-bold"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Briefcase className={`h-3.5 w-3.5 ${audience === "advisor" ? "text-accent" : "text-ink-faint"}`} />
            <span>For RIAs & Advisors</span>

            {audience === "advisor" && (
              <motion.div
                layoutId="audienceTab"
                className="absolute inset-0 rounded-full bg-paper-elevated border border-ink/[0.08] shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {children}
    </AudienceContext.Provider>
  );
}
