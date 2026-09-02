import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-sans text-sm font-semibold transition-all duration-200 select-none active:scale-[0.98]";

const variantClasses = {
  primary:
    "bg-accent text-white hover:bg-accent-dim shadow-sketch-btn hover:shadow-lg hover:-translate-y-0.5 border border-accent/20",
  ghost:
    "border border-ink/15 bg-white/90 text-ink hover:border-ink/40 hover:bg-paper-subtle hover:-translate-y-0.5 shadow-panel-sm",
  dark:
    "bg-ink text-white hover:bg-ink/90 hover:shadow-panel-md hover:-translate-y-0.5 border border-ink",
  outline:
    "border-1.5 border-accent/40 bg-accent-wash text-ink font-semibold hover:border-accent hover:bg-accent-faint",
  accent:
    "bg-accent text-white hover:bg-accent-dim shadow-sketch-btn hover:-translate-y-0.5",
} as const;

type Variant = keyof typeof variantClasses;

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  external?: boolean;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  external = false,
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
