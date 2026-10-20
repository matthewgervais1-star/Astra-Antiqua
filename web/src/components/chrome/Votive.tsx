import type { ReactNode } from "react";

export interface VotiveProps {
  children: ReactNode;
}

/**
 * The votive instruction: a two-line imperative bordered top and bottom.
 * Pass a string with an embedded newline for the two-line form; white-space
 * pre-line preserves it without needing a <br />.
 */
export function Votive({ children }: VotiveProps) {
  return (
    <div className="mx-auto max-w-[560px] whitespace-pre-line border-y border-rule py-4 text-center font-display text-display-xs leading-[1.6] tracking-[0.14em] text-accent">
      {children}
    </div>
  );
}
