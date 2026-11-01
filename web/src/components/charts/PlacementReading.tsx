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
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { getHouseMeaning } from "@/data/houses";
import { longitudeToSign } from "@/data/sampleChart";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { PLANETS, isReceived, type Planet } from "@/data/cultures";
import { SIGN_PHRASE, formatDegMin } from "@/components/charts/chartFormat";
import { GLYPHS } from "@/glyphs";
import { fmt, str } from "@/strings";
import { Fill } from "@/strings/Fill";
import { buildGoverns, buildHowItShows, buildInSign, buildKeepInView } from "@/components/charts/placementCopy";
import { PLACEMENT_VOTIVES } from "@/components/charts/placementVotives";

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

  const longitude = natal.chart[body];
  const { sign, degree } = longitudeToSign(longitude);
  const { ascendantSignIndex } = computeWholeSignHouses(natal.angles.ascendant);
  const house = houseOfSign(sign, ascendantSignIndex);
  const houseMeaning = getHouseMeaning(house);
  const deity = DEITY_MATRIX[culture][body];
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
          kicker={str("placement.kicker", culture, {
            planet: fmt("planet.name", body),
            sign: fmt("sign.full", sign),
            angle: formatDegMin(degree),
            roman: fmt("house.roman", house),
          })}
          sub={
            <div className="inline-flex items-center gap-[var(--space-1)] font-mono text-data-xs leading-data tracking-label text-dim">
              <DeityGlyph body={body} culture={culture} size={16} />
              <span>
                {str("placement.epithet", culture, {
                  epithet: deity.epithet.toUpperCase(),
                  glyphStatus: GLYPHS[culture][body].status.toUpperCase(),
                })}
              </span>
              {isReceived(body) ? <Badge tone="accent">RECEIVED</Badge> : null}
            </div>
          }
        >
          <Fill k="placement.title1" culture={culture} slots={{ deity: <ScriptName culture={culture} planet={body} upper /> }} />
          <br />
          {str("placement.title2", culture, { signPhrase: SIGN_PHRASE[sign] })}
        </NaveHead>

        <div className="flex flex-col gap-[var(--space-4)] text-left">
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={str("placement.section.governs", culture)} />
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">{buildGoverns(culture, body)}</p>
          </section>
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={str("placement.section.sign", culture, { sign: fmt("sign.full", sign) })} />
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">{buildInSign(body, sign)}</p>
          </section>
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider
              label={str("placement.section.house", culture, { ordinal: fmt("ordinal.wordUpper", house) })}
            />
            <div className="text-center font-display text-display-xs leading-display text-bone">{houseMeaning.title}</div>
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">
              {buildHowItShows(culture, body, house)}
            </p>
          </section>
          <section className="flex flex-col gap-[var(--space-2)]">
            <SectionDivider label={str("placement.section.keep", culture)} />
            <p className="text-pretty font-body text-prose-m leading-prose text-prose">
              {buildKeepInView(body, sign)}
            </p>
          </section>
        </div>

        <div className="mt-[var(--space-5)]">
          <Votive>{PLACEMENT_VOTIVES[culture](deity.name)}</Votive>
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
