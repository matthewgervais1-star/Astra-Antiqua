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
import {
  buildSeasonStandouts,
  getCurrentSeason,
  getSeasonEvents,
  getSeasonHouse,
  type SeasonEvents,
  type SeasonWindow,
} from "@/lib/season";
import { SIGN_PHRASES } from "@/components/horizons/signPhrase";
import { enDashRange, formatDayMonth } from "@/components/horizons/format";
import {
  SEASON_VOTIVE,
  buildSeasonSkyRows,
  companionInSign,
  composeWhatIsChanging,
  composeWhatItLeavesBehind,
  composeWhatItTouchesNatal,
  composeWhatItTouchesSky,
  composeWhereItBegins,
  seasonStatus,
  seasonVotiveTone,
} from "@/components/horizons/seasonContent";
import { cn } from "@/lib/classNames";

function seasonReadingId(window: SeasonWindow): string {
  return `season-${window.sign.toLowerCase()}-${window.start.getFullYear()}`;
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionDivider label={label} />
      <p className="font-body text-prose-m leading-prose text-prose">{body}</p>
    </div>
  );
}

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
  const events: SeasonEvents | null = useMemo(
    () => (window ? getSeasonEvents(window, natal) : null),
    [window, natal],
  );

  if (!culture || !window || !events || !now) {
    return <Skeleton />;
  }

  const standouts = buildSeasonStandouts(culture, events, 2);
  const status = seasonStatus(window);
  const companion = companionInSign(window, now);
  const house = natal ? getSeasonHouse(natal, window.sign) : null;

  const whatIsChanging = composeWhatIsChanging(culture, standouts);
  const whereItBegins = composeWhereItBegins(culture, window, companion);
  const whatItTouches = house
    ? composeWhatItTouchesNatal(culture, house)
    : composeWhatItTouchesSky(culture, events.ingresses);
  const whatItLeavesBehind = composeWhatItLeavesBehind(culture, window);

  const skyRows = buildSeasonSkyRows(culture, window, events);
  const votiveTone = seasonVotiveTone(standouts);

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        kicker={`THE SEASON · ${enDashRange(formatDayMonth(window.start), formatDayMonth(window.end))}`}
        sub={
          <div className="mx-auto flex max-w-[560px] flex-col items-center gap-2">
            <div className="w-full">
              <OrbBar orb={window.daysRemaining} maxOrb={window.totalDays} tone="harmony" />
            </div>
            <div className="font-mono text-data-xs tracking-label text-dim">
              DAY {window.dayOfSeason} OF {window.totalDays} · {status}
            </div>
          </div>
        }
      >
        THE SEASON OF THE {SIGN_PHRASES[window.sign]}
      </NaveHead>

      <div className="mx-auto flex max-w-[560px] flex-col gap-7 text-left">
        <Section label="WHAT IS CHANGING" body={whatIsChanging} />
        <Section label="WHERE IT BEGINS" body={whereItBegins} />
        <Section label="WHAT IT TOUCHES" body={whatItTouches} />
        <Section label="WHAT IT LEAVES BEHIND" body={whatItLeavesBehind} />
      </div>

      <div className="mt-8">
        <Votive>{SEASON_VOTIVE[culture][votiveTone]}</Votive>
      </div>

      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={seasonReadingId(window)} noun="SEASON" />
      </div>

      <div className="mx-auto mt-8 max-w-[560px] border border-rule px-[var(--space-4)] py-[var(--space-3)] text-left">
        <div className="mb-3 font-mono text-data-xs tracking-label text-dim">THE SEASON&apos;S SKY</div>
        <div className="flex flex-col gap-2 font-mono text-data-xs leading-data text-prose">
          {skyRows.map((row) => (
            <div key={row.key}>
              <span
                className={cn(
                  row.tone === "conflict"
                    ? "text-conflict"
                    : row.tone === "harmony"
                      ? "text-accent"
                      : "text-dim",
                )}
              >
                {formatDayMonth(row.date)}
              </span>{" "}
              {row.label}
            </div>
          ))}
        </div>
      </div>

      {!natal ? (
        <div className="mx-auto mt-8 max-w-[560px] text-center font-mono text-data-xs tracking-label text-dim">
          CAST A CHART TO SEE WHAT THE SEASON TOUCHES IN YOUR OWN HOUSES →{" "}
          <Link href="/reading" className="text-accent">
            READING
          </Link>
        </div>
      ) : null}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs uppercase tracking-microcopy">
        <Link href="/" className="text-bone/65 hover:text-bone">
          ← THE DAY
        </Link>
        <Link href="/week" className="text-bone/65 hover:text-bone">
          THE WEEK
        </Link>
        <Link href="/year" className="text-bone/65 hover:text-bone">
          THE YEAR →
        </Link>
        <Link href="/transits" className="text-accent">
          THE LONG TRANSITS →
        </Link>
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
    ? `${window.sign.toUpperCase()} SEASON · DAY ${window.dayOfSeason} / ${window.totalDays}`
    : "THE SEASON";

  return (
    <NaveShell context={context} horizon="season" active="today">
      <CultureGate>
        <SeasonContent window={window} now={now} natal={natal} />
      </CultureGate>
    </NaveShell>
  );
}
