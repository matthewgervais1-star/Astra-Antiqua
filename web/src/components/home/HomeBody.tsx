"use client";

import { useEffect, useState } from "react";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { Skeleton } from "@/components/chrome/Skeleton";
import { buildHomeBundle, type HomeBundle } from "@/components/home/buildHomeBundle";
import { EphemerisRail } from "@/components/home/EphemerisRail";
import { CenterDecree } from "@/components/home/CenterDecree";
import { isoDateUtc } from "@/components/home/format";
import { figureHref, parseIsoDate } from "@/lib/figureReading";
import { AspectsRail } from "@/components/home/AspectsRail";
import { CompactSkyTable } from "@/components/home/CompactSkyTable";
import { TransitTeaser } from "@/components/home/TransitTeaser";
import { PermissionsModule } from "@/components/home/PermissionsModule";
import { DayPressureModule } from "@/components/home/DayPressureModule";

/**
 * The home body: the culture is guaranteed non-null here (CultureGate only
 * renders children once one is chosen). Reads the saved chart (device-local,
 * so this must run client-side) and computes the whole day's bundle in one
 * pass, then renders the instrument-in-nave grid plus, when a chart exists,
 * the day-pressure module. The permissions module shows for every reader.
 */
export function HomeBody() {
  const culture = useActivePantheon();
  const [bundle, setBundle] = useState<HomeBundle | null>(null);

  useEffect(() => {
    if (!culture) return;
    // A figure page links back to its own day as /?date=YYYY-MM-DD; noon UTC
    // on that date reads the same UTC day the figure did.
    const asked = parseIsoDate(new URLSearchParams(window.location.search).get("date") ?? "");
    const now = asked ? new Date(asked.getTime() + 12 * 3_600_000) : new Date();
    const natal: SavedNatal | null = loadSavedNatal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBundle(buildHomeBundle(culture, now, natal));
  }, [culture]);

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
          comeBack={bundle.comeBack}
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

      <PermissionsModule culture={bundle.culture} permissions={bundle.permissions} tone={bundle.dayTone} />

      {bundle.natal && bundle.pressureGroups ? <DayPressureModule groups={bundle.pressureGroups} /> : null}
    </>
  );
}
