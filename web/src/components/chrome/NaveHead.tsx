import type { ReactNode } from "react";

export interface NaveHeadProps {
  kicker: string;
  children: ReactNode;
  sub?: ReactNode;
}

/** Centered kicker, 64x1 accent rule, Cinzel headline, optional sub block, closing rule. */
export function NaveHead({ kicker, children, sub }: NaveHeadProps) {
  return (
    <div className="text-center">
      <div className="font-mono text-[11px] tracking-[0.2em] text-dim">{kicker}</div>
      <div className="mx-auto my-6 h-px w-16 bg-[var(--accent)]" />
      <h1 className="mx-auto max-w-[680px] text-balance font-display text-[clamp(40px,5vw,58px)] leading-[1.25] tracking-[0.1em] text-bone">
        {children}
      </h1>
      {sub ? <div className="mt-4">{sub}</div> : null}
      <div className="mx-auto my-6 h-px w-16 bg-[var(--accent)]" />
    </div>
  );
}
