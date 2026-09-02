# Unifolio Marketing Website — Structural & Technical Plan

## Context

The repo is currently empty except `Docs/` (Project Overview, Brand Identity, and a
reference-only creative brief). We've already done the creative-direction exploration
(recommended direction: **"The Instrument"**, built around the gauge-arc mark) as
interactive prototypes — this plan sets that aside for now and locks the **structure**
of the site: sitemap, page-by-page content architecture, routing, folder layout,
content/data model, and the technical foundation everything else will be built on. It
does not fix final visual/motion details — those get layered onto this skeleton once
structure is approved.

Grounding facts (from `Docs/01 Project Overview.pdf` and `Docs/Unifolio Brand Identity.pdf`):
- Product: free mutual-fund tracking/analytics platform for India, positioned against Mprofit.
- Two audiences in one product: retail DIY investors and HNI/advisor-adjacent investors.
- Differentiator to lead with: one CAS import replacing scattered RTA logins/broker
  apps/spreadsheets — not AI, not analytics depth (supporting beats only).
- Brand lock: `#111111` / `#FCFCFC` / `#22C55E` (single accent, no gradients), Manrope
  (headings) + DM Sans (body), gauge-arc mark reusable as a motif.
- `Docs/2026-08-31-marketing-website-design.md` is reference/inspiration only — its
  page-by-page structure is factually grounded (real product flow, real audiences) so
  this plan reuses that *structure*, but not its specific visual execution, which we've
  already diverged from in the creative exploration phase.

Several real inputs referenced by that brief (PRDs, competitor analysis, scorer
methodology, founder bios, real screenshots, confirmed pricing model, real AMC count)
**do not exist in this repo**. This plan treats those as named placeholders to fill
before launch, not blockers to building the structural shell now.

## Tech stack

- **Next.js 14+ (App Router) + TypeScript**, deployed on Vercel.
- **Tailwind CSS**, configured with custom tokens mapped to the brand lock (no default
  Tailwind gray/blue/purple palette left reachable).
- **Framer Motion** for scroll/interaction motion (added once structure is in place).
- **next/font** self-hosting Manrope + DM Sans (+ a mono face for data figures).
- Content lives in typed local data files (see below) — no CMS for v1. Keeps the repo
  self-contained and avoids standing up infrastructure before there's real content to
  manage.
- `next-sitemap` for `sitemap.xml`; a static `public/llms.txt`.

## Repo structure

```
/app
  /(marketing)
    layout.tsx                 — shared header/footer, CTA pair, fonts
    page.tsx                   — Home
    /features/page.tsx
    /pricing/page.tsx
    /about/page.tsx
    /get-started/page.tsx      — the qualifying funnel (Contact Us replacement)
    /contact/page.tsx          — plain fallback form (press/partnerships)
  /api
    /newsletter/route.ts       — newsletter signup handler (stub — wire to real ESP later)
  sitemap.ts                    — next-sitemap or App Router sitemap export
  robots.ts
/components
  /layout      — SiteHeader, SiteFooter, CtaButtonPair (OS-detecting), NewsletterBand
  /sections    — one component per reusable content section (see page breakdown)
  /ui          — small primitives (Button, Tag, SectionLabel, ArcMark, DataFigure)
/content
  home.ts, features.ts, pricing.ts, about.ts, faq.ts   — typed content objects per page
  site.ts                                              — nav links, footer links, brand copy constants
/lib
  device.ts    — OS/platform detection for the mobile-app CTA routing
  schema.ts    — schema.org JSON-LD builders (Organization, SoftwareApplication, FAQPage)
/public
  llms.txt, og/*, favicons
```

Content is separated from components on purpose: every page's copy lives in one typed
file under `/content`, so real copy (founder bios, pricing, AMC counts) can be swapped
in later without touching component code, and placeholder values are grep-able in one
place before launch.

## Sitemap & routing

| Route | Page | Notes |
|---|---|---|
| `/` | Home | primary landing/thesis page |
| `/features` | Features | Import → See → Understand → Track; investor/advisor toggle |
| `/pricing` | Pricing | single-column free-forever + greyed "Pro — coming soon" |
| `/about` | About | founder/fragmentation story |
| `/get-started` | Signup funnel | qualifying step → Start Free (web app) or Book a Demo |
| `/contact` | Contact (fallback) | plain form, press/partnership only |
| (persistent, not a route) | Header CTA pair | "Open web app" (external link to app) / "Download app" (OS-detected store link) |
| (persistent, not a route) | Newsletter band | rendered on Home + footer, not standalone |

No other top-level pages for v1 — this matches the product's real scope (no blog,
no docs site yet) and avoids building navigation for content that doesn't exist.

## Page-by-page content structure

**Home** (`/`)
1. Hero — thesis statement + CTA (visual treatment deferred; structurally: headline, subhead, primary CTA, one supporting visual slot)
2. Before/after — the fragmentation narrative as a two-state comparison, not a features grid
3. Trust bar — MFCentral-sourced CAS claim (`[PLACEHOLDER]` AMC count — flagged, not invented)
4. Three-beat teaser — Import / See / Understand, linking to `/features`
5. Free-vs-Mprofit teaser — linking to `/pricing`
6. Newsletter band

**Features** (`/features`)
- Investor/Advisor toggle (client component, reframes emphasis inline — no page duplication)
- Four sections: Import, See, Understand, Track — each: one mechanism claim (specific, not "smart parsing"), one visual slot (real screenshot when available, otherwise a structured mock built from the PRDs once those docs exist in-repo)
- Scoring methodology section — named, explainable differentiator (content pending `Docs/Scorer-Methodology...` — not yet in repo; placeholder block until sourced)

**Pricing** (`/pricing`)
- Headline: "Free. Forever. No card required."
- Sourced comparison vs Mprofit (pending `Docs/Competitor Analysis/` — not yet in repo; placeholder table shape only, no fabricated numbers)
- Greyed "Pro — coming soon" row

**About** (`/about`)
- Founder/fragmentation story — `[PLACEHOLDER]` narrative structure only; real names/years/bios required before launch

**Get started** (`/get-started`)
- Step 1: "Investor" vs "Advisor" qualifier (client-side branch, no page reload)
- Investor → routes to Start Free (external link to web app signup)
- Advisor → routes to Book a Demo (form or scheduling link — TBD once a scheduling tool is chosen)

**Contact** (`/contact`)
- Plain form, explicitly scoped to press/partnership inquiries only (not the primary funnel)

**Global**
- Header: logo (links home from anywhere), nav, CTA pair
- Footer: nav, newsletter band, legal links, social
- FAQ content (for AEO) surfaces as a section on Home and/or About — real questions, not filler

## SEO / AEO / GEO structure

- Per-page `generateMetadata` (title/description/OG/Twitter) in each route file
- JSON-LD via `/lib/schema.ts`: `Organization` (site-wide, in root layout), `SoftwareApplication`
  (Home), `FAQPage` (wherever FAQ content renders)
- `sitemap.xml` + `robots.txt` via App Router route handlers
- `hreflang="en-IN"`, `addressCountry: IN` in Organization schema (India-only GEO layer, per the reference brief's own resolution of the ambiguity)
- Static `/public/llms.txt` with canonical, consistently-worded entity statements about what Unifolio is

## Placeholders to resolve before launch (carried forward, not invented here)

1. Founder/team bios (About)
2. Confirmed pricing model / two-tier table if a paid tier is actually priced
3. Real AMC count + legal sign-off on the MFCentral trust-bar claim
4. Real product screenshots (Features) — PRDs referenced by the brief aren't in this repo yet
5. Scoring methodology write-up and competitor comparison data — same reason

## Build phases

1. **Scaffold** — Next.js + TS + Tailwind init, brand tokens, font loading, base layout with header/footer shell (no content yet)
2. **Structural shell** — all routes stubbed with correct section skeletons, content sourced from `/content/*.ts` placeholders, no motion/visual polish
3. **Home** — full content wired, CTA pair with OS-detection, newsletter band + API stub
4. **Features / Pricing / About / Get started / Contact** — same content-first pass
5. **SEO/AEO/GEO layer** — metadata, schema, sitemap, llms.txt
6. **Visual + motion pass** — apply the approved creative direction on top of the now-stable structure
7. **QA** — responsive pass, keyboard/focus, reduced-motion, Lighthouse/CWV budget check, broken-link check

## Verification

- `npm run build` succeeds with no type errors after each phase
- `npm run dev` manual pass through every route for correct content/CTA routing
- Lighthouse (mobile) on Home for LCP/CLS budget once phase 6 lands
- Validate JSON-LD with Google's Rich Results Test once schema is added
- Grep `/content` for any remaining `[PLACEHOLDER]` markers before considering the site launch-ready
