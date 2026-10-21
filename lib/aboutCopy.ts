/**
 * Copy for the About section (components/about/AboutSection.tsx).
 * Approved wording from page 12 (the copy page) of "Unifolio Website Redesign.pdf".
 * The `emphasis` parts are shown in green.
 */

export const ABOUT_HEADLINE = {
  lead: "Your family’s wealth is connected.",
  emphasis: "Your understanding should be, too.",
} as const;

/** Sits under the headline; kept on one line where it can be (see fitFontSize in lib/aboutIllustration.ts). */
export const ABOUT_LINE = "Unifolio brings your family’s finance together, helping you see the bigger picture.";

export const ABOUT_CLOSING = {
  lead: "Better clarity.",
  emphasis: "Smarter decisions.",
  line: "Understand what you own, what’s working, and what comes next.",
} as const;

export const ABOUT_VISUAL_LABEL = "Animated sketch: four family members connected to one shared dashboard";

/** One-line fitting limits in px (max is the design size, min the smallest size before wrapping). */
export const ABOUT_LINE_FIT = { max: 20, min: 14 } as const;
export const ABOUT_CLOSING_FIT = { max: 19, min: 11 } as const;
