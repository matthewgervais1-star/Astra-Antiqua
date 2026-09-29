"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/chrome/Badge";
import { Button } from "@/components/chrome/Button";
import { CultureGate } from "@/components/chrome/CultureGate";
import { DataRow, DataRowHead } from "@/components/chrome/DataRow";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { InstrumentShell, type InstrumentSibling } from "@/components/chrome/InstrumentShell";
import { Skeleton } from "@/components/chrome/Skeleton";
import { WheelSvg } from "@/components/chrome/WheelSvg";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { mirrorDeleteToServer, useAuth } from "@/components/auth/AuthProvider";
import {
  CULTURE_LABELS,
  PLANETS,
  RECEIVED_BODIES,
  isReceived,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { computeAspects, longitudeToSign } from "@/data/sampleChart";
import { clearChart, readChart, type SavedChartInputs } from "@/lib/savedCharts";
import { resolveSavedChart } from "@/lib/savedNatal";
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { computeMotion } from "@/lib/motion";
import { SIGN_ABBR3, cityShort, formatDegMin } from "@/components/charts/chartFormat";

const SIBLINGS: readonly InstrumentSibling[] = [
  { label: "SYNASTRY", href: "/synastry" },
  { label: "FORECAST", href: "/forecast" },
];

export function ChartsInstrument() {
  return (
    <CultureGate>
      <ChartsInstrumentInner />
    </CultureGate>
  );
}

function ChartsInstrumentInner() {
  const culture = useActivePantheon();
  const { status } = useAuth();
  const [chart, setChart] = useState<SavedChartInputs | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setChart(readChart());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    setHydrated(true);
  }, [refresh, status]);

  const handleDelete = async () => {
    clearChart();
    setConfirming(false);
    refresh();
    await mirrorDeleteToServer(status);
  };

  if (!culture) return null;

  if (!hydrated) {
    return (
      <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
        <div className="flex items-center justify-center px-7 py-24 min-[720px]:col-span-3">
          <Skeleton />
        </div>
      </InstrumentShell>
    );
  }

  if (chart === null) {
    return (
      <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-16 text-center min-[720px]:col-span-3">
          <div className="font-mono text-data-xs tracking-microcopy text-dim">SAVED CHARTS</div>
          <div className="mx-auto my-5 h-px w-11 bg-accent" />
          <h1 className="font-display text-display-s leading-display tracking-display text-bone">
            NO CHART IS YET
            <br />
            ENTERED IN THE RECORD
          </h1>
          <p className="mx-auto mt-4 max-w-[360px] font-body text-prose-s leading-prose text-prose">
            A chart is cast once and kept: your sky, fixed at the hour of your birth, read by any
            of the five voices.
          </p>
          <Button href="/reading" variant="votive" className="mt-6">
            CAST THE FIRST CHART
          </Button>
          <div className="mt-4 font-mono text-data-xs uppercase tracking-data text-dim">
            KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC
          </div>
        </div>
      </InstrumentShell>
    );
  }

  const natal = resolveSavedChart(chart);

  if (!natal) {
    return (
      <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
        <div className="mx-auto flex max-w-[480px] flex-col items-center px-5 py-16 text-center min-[720px]:col-span-3">
          <p className="font-mono text-data-xs uppercase tracking-label text-dim">
            THIS CHART COULD NOT BE COMPUTED
          </p>
        </div>
      </InstrumentShell>
    );
  }

  const ascPoint = longitudeToSign(natal.angles.ascendant);
  const { ascendantSignIndex } = computeWholeSignHouses(natal.angles.ascendant);
  const wheelAspects = computeAspects(natal.chart).map((a) => ({
    planetA: a.a,
    planetB: a.b,
    kind: a.kind,
  }));

  return (
    <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
      <aside className="border-rule border-b px-7 py-6 min-[720px]:border-b-0 min-[720px]:border-r">
        <div className="font-mono text-data-xs tracking-label text-dim">
          PLACEMENTS · B. {chart.date} · {cityShort(chart.cityLabel)}
        </div>
        <div className="mt-3 flex flex-col font-mono text-data-xs">
          <DataRowHead />
          {PLANETS.map((planet) => {
            const { sign, degree } = longitudeToSign(natal.chart[planet]);
            const deity = DEITY_MATRIX[culture][planet];
            return (
              <DataRow
                key={planet}
                href={`/charts/${chart.id}/${planet}`}
                received={isReceived(planet)}
                body={
                  <>
                    <DeityGlyph body={planet} culture={culture} size={16} decorative />
                    <span className="truncate">{deity.name.toUpperCase()}</span>
                  </>
                }
                position={formatDegMin(degree)}
                sign={SIGN_ABBR3[sign]}
                house={houseOfSign(sign, ascendantSignIndex)}
                motion={computeMotion(planet, natal.birth.utcDate)}
              />
            );
          })}
        </div>
        <div className="mt-4 font-mono text-data-xs leading-data text-dim">
          ASC {formatDegMin(ascPoint.degree)} {ascPoint.sign.toUpperCase()} · WHOLE-SIGN HOUSES
          <br />
          ASTRONOMY-ENGINE · ORBS DOCUMENTED →{" "}
          <Link href="/method" className="text-accent">
            METHOD
          </Link>
        </div>
      </aside>

      <div className="flex flex-col items-center px-7 py-6">
        <div className="w-full font-mono text-data-xs tracking-label text-dim">
          THE NATAL WHEEL
        </div>
        <div className="mt-3">
          <WheelSvg
            chart={natal.chart}
            culture={culture}
            ascendant={natal.angles.ascendant}
            aspects={wheelAspects}
            accentPlanets={[...RECEIVED_BODIES]}
          />
        </div>
        <div className="mt-4 flex w-full items-center gap-2 font-mono text-data-xs text-dim">
          <span className="h-px w-[18px] bg-conflict" /> CONFLICT
          <span className="ml-[var(--space-2)] h-px w-[18px] bg-bone/40" /> HARMONY
          <span className="ml-auto text-accent">ACCENT GLYPHS: THE THREE RECEIVED</span>
        </div>
      </div>

      <aside className="border-rule flex flex-col border-t px-7 py-6 min-[720px]:border-t-0 min-[720px]:border-l">
        <div className="font-mono text-data-xs tracking-label text-dim">
          YOUR CHART · ON THIS DEVICE
        </div>
        <div className="mt-3 border border-rule-active px-[var(--space-3)] py-[var(--space-2)]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[13px] tracking-[0.08em] text-bone">
              {chart.name.toUpperCase()}
            </span>
            <span className="font-mono text-data-xs text-dim">
              {chart.date.slice(0, 4)} · {cityShort(chart.cityLabel)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 font-mono text-data-xs tracking-data">
            <Badge tone="accent">YOURS</Badge>
            {confirming ? (
              <>
                <button type="button" onClick={handleDelete} className="text-conflict">
                  CONFIRM REMOVE
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-dim hover:text-bone"
                >
                  CANCEL
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-dim hover:text-conflict"
              >
                REMOVE
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 border border-rule px-[var(--space-3)] py-[var(--space-2)] font-mono text-data-xs leading-data text-dim">
          ONE CHART, YOUR OWN. TO WEIGH IT AGAINST SOMEONE ELSE, USE SYNASTRY: THEIR DETAILS ARE
          COMPUTED AND DISCARDED, NEVER KEPT.
        </div>
        <Button href="/reading" variant="votive" block className="mt-[var(--space-2)]">
          RECAST MY CHART
        </Button>

        <div className="mt-6 font-mono text-data-xs tracking-label text-dim">
          THE THREE, AS {CULTURE_LABELS[culture].toUpperCase()} RECEIVES THEM
        </div>
        <div className="mt-3 flex flex-col gap-[var(--space-2)]">
          {RECEIVED_BODIES.map((planet) => {
            const deity = DEITY_MATRIX[culture][planet];
            return (
              <div
                key={planet}
                className="border-l-2 border-rule-active pl-3 font-body text-prose-s leading-prose text-prose"
              >
                <span className="inline-flex items-center gap-[var(--space-1)] align-middle font-display text-[11px] tracking-[0.1em] text-accent">
                  <DeityGlyph body={planet} culture={culture} size={16} decorative />
                  {deity.name.toUpperCase()}
                </span>{" "}
                · {deity.epithet}
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <div className="border border-rule px-[var(--space-3)] py-[var(--space-2)] font-mono text-data-xs leading-data text-dim">
            MODERN BODIES, RECEIVED IN THE ANCIENT MANNER →{" "}
            <Link href="/method" className="text-accent">
              METHOD
            </Link>
          </div>
        </div>
      </aside>
    </InstrumentShell>
  );
}
