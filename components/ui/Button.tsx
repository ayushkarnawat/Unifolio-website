"use client";

import Link from "next/link";
import React, { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "pill" | "outline" | "ghost" | "dark" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

interface BasePhysicalProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  innerClassName?: string;
  glow?: boolean;
  children: ReactNode;
}

const sizeContainerClasses: Record<ButtonSize, string> = {
  sm: "rounded-full p-[1.25px] text-xs sm:text-[13px]",
  md: "rounded-full p-[1.5px] text-sm",
  lg: "rounded-full p-[1.5px] text-sm sm:text-base",
};

const sizeInnerClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 sm:px-4 py-1.5 sm:py-2 gap-2",
  md: "px-6 py-2.5 sm:py-3 gap-2.5",
  lg: "px-7 sm:px-8 py-3.5 sm:py-4 gap-3",
};

function PhysicalButtonInner({
  children,
  variant = "primary",
  size = "md",
  innerClassName = "",
  glow = true,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  innerClassName?: string;
  glow?: boolean;
}) {
  const isPrimary = variant === "primary" || variant === "accent";
  const isSecondary = variant === "secondary" || variant === "ghost" || variant === "dark" || variant === "outline";
  const isPill = variant === "pill";

  return (
    <>
      {/* 1. Dimensional Outer Track Base Border */}
      <div className="pointer-events-none absolute inset-0 rounded-full border border-black/[0.08] dark:border-white/[0.12] transition-colors duration-300" />

      {/* 2. Delicate Iridescent Light Beams Orbiting the Perimeter (From Reference Video) */}
      <div
        className={`pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] will-change-transform transition-opacity duration-500 ${
          isPrimary
            ? "bg-iridescent-conic animate-iridescent-spin opacity-85 group-hover:opacity-100"
            : isSecondary
            ? "bg-iridescent-subtle animate-iridescent-spin opacity-60 group-hover:opacity-85"
            : "bg-iridescent-subtle animate-iridescent-spin opacity-45 group-hover:opacity-75"
        }`}
      />

      {/* 3. Soft Prismatic Diffusion Glow Layer (Corners catch rainbow chromatic dispersion) */}
      <div
        className={`pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] blur-[2.5px] will-change-transform transition-opacity duration-500 ${
          isPrimary
            ? "bg-iridescent-conic animate-iridescent-spin opacity-50 group-hover:opacity-80"
            : "bg-iridescent-subtle animate-iridescent-spin opacity-35 group-hover:opacity-60"
        }`}
      />

      {/* 4. Clean Minimal Glass Interior (No heavy fills, satin translucent finish) */}
      <div
        className={`relative z-10 w-full h-full rounded-full flex items-center justify-center font-sans select-none transition-all duration-300 overflow-hidden ${
          sizeInnerClasses[size]
        } ${
          isPrimary
            ? "bg-white/80 hover:bg-white/92 dark:bg-[#0B0F0D]/85 dark:hover:bg-[#101612]/92 text-[#111613] dark:text-white backdrop-blur-xl btn-physical-surface-light dark:btn-physical-surface-dark"
            : isSecondary
            ? "bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#111613]/90 dark:text-white/90 backdrop-blur-xl btn-physical-surface-light dark:btn-physical-surface-dark"
            : "bg-white/70 hover:bg-white/85 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] text-[#111613]/85 dark:text-white/85 backdrop-blur-lg"
        } ${innerClassName}`}
      >
        {/* Fine Specular Top Horizon Highlight */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/35 to-transparent" />

        {/* Subtle Ambient Sheen */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.12] dark:from-white/[0.06] to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Content */}
        <span className="relative z-10 inline-flex items-center gap-2 font-medium tracking-wide">
          {children}
        </span>
      </div>
    </>
  );
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">, BasePhysicalProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    className = "",
    innerClassName = "",
    glow = true,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 will-change-transform active:scale-[0.97] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 ${
        sizeContainerClasses[size]
      } ${className}`}
      {...props}
    >
      <PhysicalButtonInner
        variant={variant}
        size={size}
        innerClassName={innerClassName}
        glow={glow}
      >
        {children}
      </PhysicalButtonInner>
    </button>
  );
});

export interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">, BasePhysicalProps {
  href: string;
  external?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  {
    href,
    variant = "primary",
    size = "md",
    external = false,
    className = "",
    innerClassName = "",
    glow = true,
    children,
    ...props
  },
  ref
) {
  const containerClasses = `group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 will-change-transform active:scale-[0.97] hover:-translate-y-0.5 cursor-pointer ${
    sizeContainerClasses[size]
  } ${className}`;

  if (external) {
    return (
      <a ref={ref} href={href} target="_blank" rel="noreferrer" className={containerClasses} {...props}>
        <PhysicalButtonInner
          variant={variant}
          size={size}
          innerClassName={innerClassName}
          glow={glow}
        >
          {children}
        </PhysicalButtonInner>
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={containerClasses} {...props}>
      <PhysicalButtonInner
        variant={variant}
        size={size}
        innerClassName={innerClassName}
        glow={glow}
      >
        {children}
      </PhysicalButtonInner>
    </Link>
  );
});
