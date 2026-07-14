"use client";

import { Suspense, useEffect, useState } from "react";
import { useActivePantheon } from "@/components/pantheon/PantheonSelector";
import { WeekForecast } from "@/components/daily/WeekForecast";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { Culture } from "@/data/cultures";

function Impl({ explicitCulture }: { explicitCulture: Culture | null }) {
  const ctxCulture = useActivePantheon();
  const culture = explicitCulture ?? ctxCulture;
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  if (!now) {
    return (
      <GlassPanel tone="glass" className="min-h-[200px] p-6">
        <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
          Casting the week ahead
        </div>
      </GlassPanel>
    );
  }
  return <WeekForecast now={now} culture={culture} linkCulture={explicitCulture} />;
}

function Fallback() {
  return (
    <GlassPanel tone="glass" className="min-h-[200px] p-6">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
        Loading
      </div>
    </GlassPanel>
  );
}

export function WeekForecastSection({ culture }: { culture?: Culture }) {
  // The #week anchor lives on this always-rendered wrapper (not inside the
  // client component) so /#week navigations land on the strip even before
  // the week's effects have resolved.
  return (
    <div id="week" className="scroll-mt-24">
      <Suspense fallback={<Fallback />}>
        <Impl explicitCulture={culture ?? null} />
      </Suspense>
    </div>
  );
}
