import type { ReactNode } from "react";
import { CultureChip } from "@/components/chrome/CultureChip";

export interface TransitSubBarProps {
  context: ReactNode;
  span: ReactNode;
}

/**
 * The /transits/[id] sub-bar. Same 46px/mono/border-b contract as
 * chrome/SubBar, but SubBar's fixed context/horizon/chip slots have no room
 * for the span's own date range, which 3a-long-transit-greece.html sits
 * between the context and the culture chip. Composed directly per the task's
 * guidance rather than widening the shared SubBar's props.
 */
export function TransitSubBar({ context, span }: TransitSubBarProps) {
  return (
    <div className="flex h-[46px] items-center gap-[22px] border-b border-rule px-5 font-mono text-[11px] text-dim md:px-14">
      <div className="min-w-0 truncate">{context}</div>
      <div className="ml-auto flex items-center gap-[22px]">
        <span className="whitespace-nowrap">{span}</span>
        <CultureChip />
      </div>
    </div>
  );
}
