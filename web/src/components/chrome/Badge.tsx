import type { ReactNode } from "react";
import { cn } from "@/lib/classNames";

export type BadgeTone = "outline" | "accent" | "dim" | "conflict";

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

/**
 * A small mono-caps label chip for status, tier and reception markers
 * (docs/design/system/components/specs/Badge.prompt.md).
 *
 * Outline is the resting chip, on the incised rule in the dim ink. Accent is
 * reserved for what the accent marks: a received body, the primary record,
 * the culture in force. Dim drops the rule for a fact that only needs
 * stating. Conflict is the signal ink, for a warning and nothing else.
 */
const BASE =
  "inline-flex items-center whitespace-nowrap border px-[var(--space-1)] py-[2px] font-mono text-data-xs uppercase leading-none tracking-label";

const TONE: Readonly<Record<BadgeTone, string>> = {
  outline: "border-rule text-dim",
  accent: "border-rule-active text-accent",
  dim: "border-transparent text-faint-ink",
  conflict: "border-conflict text-conflict",
};

export function Badge({ tone = "outline", className, children }: BadgeProps) {
  return <span className={cn(BASE, TONE[tone], className)}>{children}</span>;
}
