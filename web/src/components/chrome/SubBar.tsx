import type { ReactNode } from "react";
import { CultureChip } from "@/components/chrome/CultureChip";
import { HorizonControl, type Horizon } from "@/components/chrome/HorizonControl";
import { SyncFlag } from "@/components/chrome/SyncFlag";

export type { Horizon };

export interface SubBarProps {
  context: ReactNode;
  horizon?: Horizon;
  showSync?: boolean;
}

/** 46px context row under the Lintel/instrument bar. Stays a server
 * component: the only interactive pieces (CultureChip, SyncFlag) are their
 * own small client islands. */
export function SubBar({ context, horizon, showSync }: SubBarProps) {
  return (
    <div className="flex h-[46px] items-center gap-[22px] border-b border-rule px-5 font-mono text-[11px] text-dim md:px-14">
      <div className="min-w-0 truncate">{context}</div>
      <div className="ml-auto flex items-center gap-[22px]">
        {horizon ? <HorizonControl active={horizon} /> : null}
        <CultureChip />
        {showSync ? <SyncFlag /> : null}
      </div>
    </div>
  );
}
