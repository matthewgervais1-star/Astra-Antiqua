import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/classNames";

export type ButtonVariant = "primary" | "ghost" | "votive";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  variant?: ButtonVariant;
  /** Renders a Link to this route instead of a button. */
  href?: string;
  /** Fill the container's width. */
  block?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A mono-caps action button in three weights
 * (docs/design/system/components/specs/Button.prompt.md).
 *
 * Primary is a hairline on the incised rule that turns accent on hover. Ghost
 * has no rule and steps its ink on hover. Votive carries the accent rule and
 * the accent ink, and is for the one instruction on a screen that asks
 * something of the reader: the accent has three jobs, and this is the second
 * of them, so a screen carries at most one votive.
 *
 * The label is set in the data face, caps, at data-s with microcopy tracking,
 * the register the design system gives every label. Hover either steps ink
 * or shows the accent rule, never a new hue and never a transform, and there
 * is no transition, because --transition is none.
 */
const BASE =
  "inline-flex items-center justify-center gap-[var(--space-1)] px-[var(--space-4)] py-[var(--space-2)] text-center font-mono text-data-s uppercase tracking-microcopy disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT: Readonly<Record<ButtonVariant, string>> = {
  primary: "border border-rule text-bone hover:border-rule-active",
  ghost: "border border-transparent text-dim hover:text-bone",
  votive: "border border-rule-active text-accent hover:bg-bone/5",
};

export function Button({
  variant = "primary",
  href,
  block = false,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  const classes = cn(BASE, VARIANT[variant], block && "flex w-full", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  );
}
