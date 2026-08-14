import type { ReactNode } from "react";
import { Lintel, type LintelSection } from "@/components/chrome/Lintel";
import { SubBar } from "@/components/chrome/SubBar";
import type { Horizon } from "@/components/chrome/HorizonControl";
import { MethodFooter } from "@/components/chrome/MethodFooter";

export interface NaveShellProps {
  children: ReactNode;
  context: ReactNode;
  horizon?: Horizon;
  active?: LintelSection;
}

/**
 * The nave chassis: Lintel + SubBar + a single centered reading column +
 * MethodFooter. Pages supply their own inner max-w-[560px] prose column;
 * this shell only sets the outer 720px column and the mobile gutters.
 */
export function NaveShell({ children, context, horizon, active }: NaveShellProps) {
  return (
    <>
      <Lintel active={active} />
      <SubBar context={context} horizon={horizon} showSync />
      {/* min-w-0: as a flex item, main defaults to min-width:auto, which lets a
          wide child (the matrix table, a data row) push the page wider than the
          viewport and defeat its own overflow-x wrapper. */}
      <main className="mx-auto w-full min-w-0 max-w-[720px] px-5 py-12 md:py-16">{children}</main>
      <MethodFooter />
    </>
  );
}
