import type { ReactNode, SVGProps } from "react";

/** Line icons for the waitlist pop-up, drawn to match the approved prototype. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const UserIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6" />
  </Icon>
);
export const MailIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M4 7.5l8 6 8-6" />
  </Icon>
);
export const PhoneIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6.5 3.5h3l1.4 4-2 1.3a11 11 0 0 0 5.3 5.3l1.3-2 4 1.4v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
  </Icon>
);
export const BoltIcon = (p: P) => (
  <Icon {...p}>
    <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />
  </Icon>
);
export const BellIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Icon>
);
export const ChartIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    <path d="M5 8l5-4 6 5 5-5" />
  </Icon>
);
export const LockIcon = (p: P) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icon>
);
export const CheckIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </Icon>
);
export const CheckCircleIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.4l2.7 2.7L16 9.6" />
  </Icon>
);
export const ArrowIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
