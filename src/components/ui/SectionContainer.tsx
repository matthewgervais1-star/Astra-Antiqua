import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/classNames";

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  size?: "default" | "narrow" | "wide";
  spacing?: "default" | "tight" | "loose";
}

const SIZE_MAP = {
  narrow: "max-w-3xl",
  default: "max-w-[1280px]",
  wide: "max-w-[1440px]",
} as const;

const SPACING_MAP = {
  tight: "py-16 md:py-20",
  default: "py-24 md:py-32",
  loose: "py-28 md:py-40",
} as const;

export function SectionContainer({
  children,
  className,
  size = "default",
  spacing = "default",
  ...rest
}: SectionContainerProps) {
  return (
    <section
      className={cn("mx-auto w-full px-6 md:px-10", SIZE_MAP[size], SPACING_MAP[spacing], className)}
      {...rest}
    >
      {children}
    </section>
  );
}
