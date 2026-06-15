"use client";

import { cn } from "@/lib/classNames";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({
  label = "Print or save as PDF",
  className,
}: PrintButtonProps) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft font-mono print-hide inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors",
        className,
      )}
    >
      {label}
      <span aria-hidden>↓</span>
    </button>
  );
}
