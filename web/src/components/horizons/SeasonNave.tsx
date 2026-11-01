"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NaveShell } from "@/components/chrome/NaveShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { Skeleton } from "@/components/chrome/Skeleton";
import { OrbBar } from "@/components/chrome/OrbBar";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { getCurrentSeason, type SeasonWindow } from "@/lib/season";
import { buildSeasonScreen } from "@/lib/screens/season";
import { fmt, str } from "@/strings";
import { localZone } from "@/strings/formats";
import { cn } from "@/lib/classNames";

function seasonReadingId(window: SeasonWindow): string {
  return `season-${window.sign.toLowerCase()}-${window.start.getFullYear()}`;
}

/** A section slot is its label over its body (SlotMap: "\n" separates stacked lines). */
function Section({ slot }: { slot: string }) {
  const at = slot.indexOf("\n");
  return (
    <div className="flex flex-col gap-2.5">
      <SectionDivider label={slot.slice(0, at)} />
      <p className="font-body text-prose-m leading-prose text-prose">{slot.slice(at + 1)}</p>
    </div>
  );
}

const FOOTER_HREFS = ["/", "/week", "/year", "/transits"] as const;

function SeasonContent({
  window,
  now,
  natal,
}: {
  window: SeasonWindow | null;
  now: Date | null;
  natal: SavedNatal | null;
}) {
  const culture = useActivePantheon();
  const screen = useMemo(
    () => (culture && now ? buildSeasonScreen({ culture, instant: now, zone: localZone(), birth: natal }) : null),
    [culture, now, natal],
  );

  if (!culture || !window || !screen) {
    return <Skeleton />;
  }

  const { slots, rowTones, bar } = screen;
  const sections = slots["season.sections"] as string[];
  const skyRows = slots["season.sky.row"] as string[];
  const noChart = slots["season.noChart"] as string[] | undefined;
  const footer = slots["season.footer"] as string[];

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        culture={culture}
        kicker={slots["season.kicker"]}
        sub={
          <div className="mx-auto flex max-w-[560px] flex-col items-center gap-2">
            <div className="w-full">
              <OrbBar orb={bar.remaining} maxOrb={bar.total} tone="harmony" />
            </div>
            <div className="font-mono text-data-xs tracking-label text-dim">{slots["season.dayLine"]}</div>
          </div>
        }
      >
        {slots["season.title"]}
      </NaveHead>

      {slots["season.signProse"] ? (
        <p className="mx-auto mb-7 max-w-[560px] text-left font-body text-prose-m leading-prose text-prose">
          {slots["season.signProse"]}
        </p>
      ) : null}

      <div className="mx-auto flex max-w-[560px] flex-col gap-7 text-left">
        {slots["season.chart.label"] ? (
          <div className="flex flex-col gap-2.5">
            <SectionDivider label={slots["season.chart.label"] as string} />
            <div className="font-display text-display-xs leading-display text-bone">{slots["season.chart.houseHeading"]}</div>
            <p className="font-body text-prose-m leading-prose text-prose">{slots["season.chart.prose"]}</p>
          </div>
        ) : null}
        {sections.map((section) => (
          <Section key={section} slot={section} />
        ))}
      </div>

      <div className="mt-8">
        <Votive>{slots["season.votive"]}</Votive>
      </div>

      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={seasonReadingId(window)} noun={str("season.feedback.noun", culture)} />
      </div>

      <div className="mx-auto mt-8 max-w-[560px] border border-rule px-[var(--space-4)] py-[var(--space-3)] text-left">
        <div className="mb-3 font-mono text-data-xs tracking-label text-dim">{slots["season.sky.label"]}</div>
        <div className="flex flex-col gap-2 font-mono text-data-xs leading-data text-prose">
          {skyRows.map((row, i) => {
            // season.sky.row is "{date} · {event}", then web's sentence on its own line where
            // the row has one; web colours the date by the row's tone.
            const [head = "", prose] = row.split("\n");
            const at = head.indexOf(" · ");
            const tone = rowTones[i];
            return (
              <div key={`${i}-${row}`}>
                <div>
                  <span className={cn(tone === "conflict" ? "text-conflict" : tone === "harmony" ? "text-accent" : "text-dim")}>
                    {head.slice(0, at)}
                  </span>
                  {head.slice(at)}
                </div>
                {prose ? <p className="mt-1 font-body text-prose-s leading-prose text-prose">{prose}</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      {noChart ? (
        <div className="mx-auto mt-8 max-w-[560px] text-center font-mono text-data-xs tracking-label text-dim">
          {noChart[0]}{" "}
          <Link href="/reading" className="text-accent">
            {noChart[1]}
          </Link>
        </div>
      ) : null}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs tracking-microcopy">
        {footer.map((label, i) => (
          <Link
            key={label}
            href={FOOTER_HREFS[i] ?? "/"}
            className={i === footer.length - 1 ? "text-accent" : "text-bone/65 hover:text-bone"}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * The full `/season` client experience: chassis, the four-section spine, the
 * season's sky box, votive, and feedback. Replaces the old SeasonExperience
 * entirely; nothing here imports from components/season/**.
 */
export function SeasonNave() {
  const [window, setWindowState] = useState<SeasonWindow | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    const today = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(today);
    setWindowState(getCurrentSeason(today));
    setNatal(loadSavedNatal());
  }, []);

  const context = window
    ? `${fmt("sign.full", window.sign)} SEASON · DAY ${window.dayOfSeason} / ${window.totalDays}`
    : "THE SEASON";

  return (
    <NaveShell context={context} horizon="season" active="today">
      <CultureGate>
        <SeasonContent window={window} now={now} natal={natal} />
      </CultureGate>
    </NaveShell>
  );
}
