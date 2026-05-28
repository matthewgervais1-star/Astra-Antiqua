import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/classNames";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: "glass" | "solid";
  glow?: boolean;
}

export function GlassPanel({
  children,
  className,
  tone = "glass",
  glow = false,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        tone === "glass" ? "glass-panel" : "bg-bg-deep border-hairline",
        glow && "accent-glow",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
