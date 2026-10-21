/**
 * Copy and timing for the "Join the waitlist" pop-up.
 *
 * Pure data only, so it can be unit tested and shared by the pop-up
 * components. Wording is the approved copy from the waitlist redesign PDF.
 */

/** How long the success card stays before the pop-up closes itself. */
export const SUCCESS_AUTOCLOSE_MS = 5000;

export type WaitlistItem = {
  id: "early" | "updates" | "insights" | "wealth";
  title: string;
  line: string;
};

/** Left welcome panel (desktop and tablet only). */
export const WAITLIST_PANEL = {
  logoAlt: "Unifolio",
  headlineLead: "Your family’s wealth, ",
  headlineEmphasis: "understood.",
  subtext:
    "A clearer picture of your family’s finances starts here. Be among the first to experience wealth intelligence built for you.",
  visualLabel: "Sketch of portfolio cards",
} as const;

/** The form, in its desktop/tablet ("panel") and phone ("compact") versions. */
export const WAITLIST_FORM = {
  title: "Join the waitlist",
  subtitle: "Be the first to know when Unifolio opens up.",
  compactSubtitle: "Be first in line when Unifolio opens up.",
  submit: "Join the waitlist",
  submitting: "Joining…",
  error: "Something went wrong — please try again.",
  close: "Close",
  privacy: "Your information stays private. No spam.",
  fields: {
    name: { label: "Full name", placeholder: "Full name", compactPlaceholder: "e.g. Siddharth Sharma" },
    email: { label: "Email address", placeholder: "Email address", compactPlaceholder: "name@domain.com" },
    phone: {
      label: "Phone number",
      placeholder: "Phone number (optional)",
      compactPlaceholder: "+91 98765 43210",
    },
  },
} as const;

/** The three benefits under the submit button. */
export const WAITLIST_BENEFITS: readonly WaitlistItem[] = [
  { id: "early", title: "Early access", line: "Be first to try Unifolio" },
  { id: "updates", title: "Product updates", line: "Hear about new features" },
  { id: "insights", title: "Wealth insights", line: "Discover smarter ways to understand your money" },
];

/** The success card that replaces the form after joining. */
export const WAITLIST_SUCCESS = {
  title: "You’re on the list!",
  lead: "Thanks for your interest in Unifolio. We’ll keep you updated as we get closer to launch.",
  nextHeading: "What happens next?",
  backHome: "Back to home",
} as const;

/** The "What happens next?" items (same three in the welcome email). */
export const WAITLIST_NEXT_STEPS: readonly WaitlistItem[] = [
  { id: "early", title: "Early access", line: "We’ll let you know when Unifolio is ready to try." },
  { id: "updates", title: "Product updates", line: "Hear about new features and what’s taking shape." },
  {
    id: "wealth",
    title: "A clearer view of your wealth",
    line: "Stay in the loop as we build smarter ways to understand your family’s finances.",
  },
];
