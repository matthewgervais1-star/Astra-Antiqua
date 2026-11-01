"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/chrome/Badge";
import { Button } from "@/components/chrome/Button";
import { CultureGate } from "@/components/chrome/CultureGate";
import { CultureChip } from "@/components/chrome/CultureChip";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { ScriptName } from "@/components/chrome/ScriptName";
import { MethodFooter } from "@/components/chrome/MethodFooter";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { ReceptionNote } from "@/components/chrome/ReceptionNote";
import { Skeleton } from "@/components/chrome/Skeleton";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { readChart } from "@/lib/savedCharts";
import { resolveSavedChart, type SavedNatal } from "@/lib/savedNatal";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { PLANETS, isReceived, type Planet } from "@/data/cultures";
import { str } from "@/strings";
import { localZone } from "@/strings/formats";
import { Fill } from "@/strings/Fill";
import { buildPlacementModel } from "@/lib/screens/placement";

export interface PlacementReadingProps {
  chartId: string;
  body: Planet;
}

export function PlacementReading({ chartId, body }: PlacementReadingProps) {
  return (
    <CultureGate>
      <PlacementReadingInner chartId={chartId} body={body} />
    </CultureGate>
  );
}

function TopBar({ body }: { body: Planet }) {
  const index = PLANETS.indexOf(body);
  return (
    <div className="flex h-[46px] items-center gap-[var(--space-4)] border-b border-rule px-5 font-mono text-data-xs text-dim md:px-14">
      <Link href="/charts" className="hover:text-bone">
        ← YOUR CHART
      </Link>
      <span className="ml-auto">
        PLACEMENT {String(index + 1).padStart(2, "0")} / {PLANETS.length}
      </span>
      <CultureChip />
    </div>
  );
}

function PlacementReadingInner({ chartId, body }: PlacementReadingProps) {
  const culture = useActivePantheon();
  const [hydrated, setHydrated] = useState(false);
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    const meta = readChart();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNatal(meta ? resolveSavedChart(meta) : null);
    setHydrated(true);
  }, [chartId]);

  if (!culture) return null;

  if (!hydrated) {
    return (
      <>
        <TopBar body={body} />
        <main className="mx-auto max-w-[560px] px-5 py-16">
          <Skeleton />
        </main>
        <MethodFooter />
      </>
    );
  }

  if (!natal) {
    return (
      <>
        <TopBar body={body} />
        <main className="mx-auto max-w-[560px] px-5 py-16 text-center">
          <div className="font-mono text-data-xs tracking-microcopy text-dim">NO CHART FOUND</div>
          <h1 className="mt-4 font-display text-display-m tracking-display text-bone">
            THIS CHART IS NOT ON THIS DEVICE
          </h1>
          <p className="mt-4 font-body text-prose-m leading-prose text-prose">
            The chart this placement belongs to could not be found in this browser. It may have
            been removed, or you may be on a different device.
          </p>
          <Button href="/charts" variant="votive" className="mt-8">
            BACK TO YOUR CHARTS
          </Button>
        </main>
        <MethodFooter />
      </>
    );
  }

  const slots = buildPlacementModel({ culture, instant: new Date(), zone: localZone(), birth: natal, body });
  const prose = slots["placement.prose"] as string[];
  // The title's second line, and the house title under the house label (SlotMap stacks lines).
  const titleSecond = String(slots["placement.title"]).split("\n")[1];
  const [houseLabel, houseTitle] = String(slots["placement.section.house"]).split("\n");
  const voice = CULTURE_VOICES[culture];
  const index = PLANETS.indexOf(body);
  const prevPlanet = PLANETS[(index - 1 + PLANETS.length) % PLANETS.length]!;
  const nextPlanet = PLANETS[(index + 1) % PLANETS.length]!;
  const prevDeity = DEITY_MATRIX[culture][prevPlanet];
  const nextDeity = DEITY_MATRIX[culture][nextPlanet];

  return (
    <>
      <TopBar body={body} />
      <main className="mx-auto max-w-[560px] px-5 py-11 text-center md:py-[var(--space-6)]">
        <NaveHead
          kicker={slots["placement.kicker"]}
          sub={
            <div className="inline-flex items-center gap-[var(--space-1)] font-mono text-data-xs leading-data tracking-label text-dim">
              <DeityGlyph body={body} culture={culture} size={16} />
              <span>{slots["placement.epithet"]}</span>
              {isReceived(body) ? <Badge tone="accent">RECEIVED</Badge> : null}
            </div>
          }
        >
          <Fill k="placement.title1" culture={culture} slots={{ deity: <ScriptName culture={culture} planet={body} upper /> }} />
          <br />
          {titleSecond}
        </NaveHead>

        <div className="flex flex-col gap-[var(--space-4)] text-left">
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={slots["placement.section.governs"] as string} />
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">{prose[0]}</p>
          </section>
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={slots["placement.section.sign"] as string} />
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">{prose[1]}</p>
          </section>
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={houseLabel ?? ""} />
            <div className="text-center font-display text-display-xs leading-display text-bone">{houseTitle}</div>
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">{prose[2]}</p>
          </section>
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={slots["placement.section.keep"] as string} />
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">{prose[3]}</p>
          </section>
        </div>

        <div className="mt-[var(--space-5)]">
          <Votive>{slots["placement.votive"]}</Votive>
        </div>

        {isReceived(body) ? (
          <div className="mt-4">
            <ReceptionNote intro={voice.receptionLine} />
          </div>
        ) : null}

        <div className="mt-4">
          <FeedbackRow readingId={`placement-${chartId}-${body}`} noun={str("placement.feedback.noun", culture)} />
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] font-mono text-data-xs tracking-microcopy [&>a]:whitespace-nowrap">
          <Link href={`/charts/${chartId}/${prevPlanet}`} className="text-bone/65 hover:text-bone">
            ← YOUR {prevDeity.name.toUpperCase()}
          </Link>
          <Link href={`/charts/${chartId}/${nextPlanet}`} className="text-accent">
            YOUR {nextDeity.name.toUpperCase()} →
          </Link>
        </div>
      </main>
      <MethodFooter />
    </>
  );
}
