"use client";

import { useEffect, useState } from "react";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { Skeleton } from "@/components/chrome/Skeleton";
import { buildHomeBundle, type HomeBundle } from "@/components/home/buildHomeBundle";
import { EphemerisRail } from "@/components/home/EphemerisRail";
import { CenterDecree } from "@/components/home/CenterDecree";
import { AspectsRail } from "@/components/home/AspectsRail";
import { CompactSkyTable } from "@/components/home/CompactSkyTable";
import { TransitTeaser } from "@/components/home/TransitTeaser";
import { PermissionsModule } from "@/components/home/PermissionsModule";
import { DayPressureModule } from "@/components/home/DayPressureModule";
import { toneOf } from "@/lib/tone";

/**
 * The home body: the culture is guaranteed non-null here (CultureGate only
 * renders children once one is chosen). Reads the saved chart (device-local,
 * so this must run client-side) and computes the whole day's bundle in one
 * pass, then renders the instrument-in-nave grid plus, when a chart exists,
 * the two below-grid modules.
 */
export function HomeBody() {
  const culture = useActivePantheon();
  const [bundle, setBundle] = useState<HomeBundle | null>(null);

  useEffect(() => {
    if (!culture) return;
    const now = new Date();
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

  const dominantTone = bundle.aspectRows[0] ? toneOf(bundle.aspectRows[0].kind) : "harmony";

  return (
    <>
      <div className="grid grid-cols-1 min-[1100px]:grid-cols-[310px_1fr_330px]">
        <EphemerisRail
          className="hidden border-b border-rule min-[1100px]:block min-[1100px]:border-b-0 min-[1100px]:border-r"
          rows={bundle.ephemerisRows}
          stationsAndIngresses={bundle.stationsAndIngresses}
        />

        <CenterDecree
          institution={bundle.institution}
          weekday={bundle.weekday}
          dateLong={bundle.dateLong}
          reading={bundle.reading}
          votive={bundle.votive}
          now={bundle.now}
        />

        <CompactSkyTable className="px-6 pb-8 min-[1100px]:hidden md:px-14" rows={bundle.compactSkyRows} />

        <AspectsRail
          className="hidden border-t border-rule min-[1100px]:flex min-[1100px]:border-t-0 min-[1100px]:border-l"
          aspects={bundle.aspectRows}
          longTransit={bundle.longTransit}
        />

        <TransitTeaser className="px-6 pb-10 min-[1100px]:hidden md:px-14" data={bundle.longTransit} />
      </div>

      {bundle.natal && bundle.permissions ? (
        <PermissionsModule culture={bundle.culture} permissions={bundle.permissions} tone={dominantTone} />
      ) : null}

      {bundle.natal && bundle.pressureGroups ? <DayPressureModule groups={bundle.pressureGroups} /> : null}
    </>
  );
}
