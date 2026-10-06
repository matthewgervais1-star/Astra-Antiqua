"use client";

import { useEffect, useState } from "react";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { Skeleton } from "@/components/chrome/Skeleton";
import { buildHomeBundle, type HomeBundle } from "@/components/home/buildHomeBundle";
import { EphemerisRail } from "@/components/home/EphemerisRail";
import { CenterDecree } from "@/components/home/CenterDecree";
import { isoDateUtc } from "@/components/home/format";
import { figureHref } from "@/lib/figureReading";
import { useDatedDay } from "@/components/home/datedDay";
import { AspectsRail } from "@/components/home/AspectsRail";
import { CompactSkyTable } from "@/components/home/CompactSkyTable";
import { TransitTeaser } from "@/components/home/TransitTeaser";
import { PermissionsModule } from "@/components/home/PermissionsModule";
import { DayPressureModule } from "@/components/home/DayPressureModule";
import { DiveDeeper } from "@/components/home/DiveDeeper";

/**
 * The home body: the culture is guaranteed non-null here (CultureGate only
 * renders children once one is chosen). Reads the saved chart (device-local,
 * so this must run client-side) and computes the whole day's bundle in one
 * pass, then renders the instrument-in-nave grid plus, when a chart exists,
 * the day-pressure module. The permissions module and the dive deeper show
 * for every reader, and the come-back line closes the page.
 */
export function HomeBody() {
  const culture = useActivePantheon();
  const [bundle, setBundle] = useState<HomeBundle | null>(null);
  // A figure page links back to its own day as /?date=YYYY-MM-DD: the day
  // page then reads 00:00 UTC on that date, the same instant the figure read.
  const dated = useDatedDay();

  useEffect(() => {
    if (!culture) return;
    const now = dated ?? new Date();
    const natal: SavedNatal | null = loadSavedNatal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBundle(buildHomeBundle(culture, now, natal));
  }, [culture, dated]);

  if (!culture) return null;

  if (!bundle) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-16 md:px-14">
        <Skeleton />
      </div>
    );
  }


  return (
    <>
      <div className="grid grid-cols-1 min-[1100px]:grid-cols-[310px_1fr_330px]">
        <EphemerisRail
          className="hidden border-b border-rule min-[1100px]:block min-[1100px]:border-b-0 min-[1100px]:border-r"
          culture={bundle.culture}
          rows={bundle.ephemerisRows}
          stationsAndIngresses={bundle.stationsAndIngresses}
        />

        <CenterDecree
          institution={bundle.institution}
          weekday={bundle.weekday}
          dateLong={bundle.dateLong}
          reading={bundle.reading}
          votive={bundle.votive}
          dated={dated !== null}
          now={bundle.now}
          figureHref={bundle.reading.figures[0] ? figureHref(isoDateUtc(bundle.now), bundle.reading.figures[0]) : null}
        />

        <CompactSkyTable
          className="px-6 pb-8 min-[1100px]:hidden md:px-14"
          culture={bundle.culture}
          rows={bundle.compactSkyRows}
        />

        <AspectsRail
          className="hidden border-t border-rule min-[1100px]:flex min-[1100px]:border-t-0 min-[1100px]:border-l"
          culture={bundle.culture}
          aspects={bundle.aspectRows}
          longTransit={bundle.longTransit}
        />

        <TransitTeaser className="px-6 pb-10 min-[1100px]:hidden md:px-14" data={bundle.longTransit} />
      </div>

      <PermissionsModule
        culture={bundle.culture}
        permissions={bundle.permissions}
        source={bundle.permissionsSource}
        tone={bundle.dayTone}
      />

      {bundle.natal && bundle.pressureGroups ? <DayPressureModule groups={bundle.pressureGroups} /> : null}

      <DiveDeeper data={bundle.diveDeeper} comeBack={dated ? null : bundle.comeBack} />
    </>
  );
}
