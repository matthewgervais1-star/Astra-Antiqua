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
    <div className="flex h-[46px] items-center gap-4 border-b border-rule px-5 font-mono text-data-xs text-dim md:gap-[var(--space-4)] md:px-14">
      <div className="min-w-0 flex-1 truncate">{context}</div>
      {/* The controls keep their intrinsic width; the context line is what
          gives way. SYNC drops below the instrument breakpoint, as the mobile
          mock does, so the row still fits a 375px viewport. */}
      <div className="flex shrink-0 items-center gap-4 md:gap-[var(--space-4)]">
        {horizon ? <HorizonControl active={horizon} /> : null}
        <CultureChip />
        {showSync ? (
          <span className="hidden min-[720px]:inline">
            <SyncFlag />
          </span>
        ) : null}
      </div>
    </div>
  );
}
