"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CultureGate } from "@/components/chrome/CultureGate";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { InstrumentShell, type InstrumentSibling } from "@/components/chrome/InstrumentShell";
import { Skeleton } from "@/components/chrome/Skeleton";
import { WheelSvg } from "@/components/chrome/WheelSvg";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { mirrorDeleteToServer, mirrorPrimaryToServer, useAuth } from "@/components/auth/AuthProvider";
import {
  CULTURE_LABELS,
  PLANETS,
  RECEIVED_BODIES,
  isReceived,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { computeAspects, longitudeToSign } from "@/data/sampleChart";
import {
  deleteChart,
  listCharts,
  setPrimaryChart,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import { resolveSavedChart } from "@/lib/savedNatal";
import { cn } from "@/lib/classNames";
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
  const [charts, setCharts] = useState<readonly SavedChartInputs[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    const list = listCharts();
    setCharts(list);
    setSelectedId((curr) =>
      curr && list.some((c) => c.id === curr)
        ? curr
        : (list.find((c) => c.primary)?.id ?? list[0]?.id ?? null),
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    setHydrated(true);
  }, [refresh, status]);

  const handleDelete = async (id: string) => {
    deleteChart(id);
    setConfirmId(null);
    refresh();
    await mirrorDeleteToServer(id, status);
  };

  const handleSetPrimary = async (id: string) => {
    setPrimaryChart(id);
    refresh();
    await mirrorPrimaryToServer(id, status);
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

  if (charts.length === 0) {
    return (
      <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-16 text-center min-[720px]:col-span-3">
          <div className="font-mono text-[11px] tracking-[0.18em] text-dim">SAVED CHARTS</div>
          <div className="mx-auto my-5 h-px w-11 bg-[var(--accent)]" />
          <h1 className="font-display text-[22px] leading-[1.5] tracking-[0.1em] text-bone">
            NO CHART IS YET
            <br />
            ENTERED IN THE RECORD
          </h1>
          <p className="mx-auto mt-4 max-w-[360px] font-body text-[15px] leading-[1.65] text-prose">
            A chart is cast once and kept: your sky, fixed at the hour of your birth, read by any
            of the five voices.
          </p>
          <Link
            href="/reading"
            className="mt-6 inline-block border border-[var(--accent)] px-[30px] py-[14px] font-display text-[12px] uppercase tracking-[0.2em] text-[var(--accent)]"
          >
            CAST THE FIRST CHART
          </Link>
          <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
            KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC
          </div>
        </div>
      </InstrumentShell>
    );
  }

  const selectedChart = charts.find((c) => c.id === selectedId) ?? charts[0] ?? null;
  const natal = selectedChart ? resolveSavedChart(selectedChart) : null;

  if (!selectedChart || !natal) {
    return (
      <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
        <div className="mx-auto flex max-w-[480px] flex-col items-center px-5 py-16 text-center min-[720px]:col-span-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            THIS CHART COULD NOT BE COMPUTED
          </p>
        </div>
      </InstrumentShell>
    );
  }

  const ascPoint = longitudeToSign(natal.angles.ascendant);
  const wheelAspects = computeAspects(natal.chart).map((a) => ({
    planetA: a.a,
    planetB: a.b,
    kind: a.kind,
  }));

  return (
    <InstrumentShell context="CHARTS · NATAL INSTRUMENT" siblings={SIBLINGS}>
      <aside className="border-rule border-b px-7 py-6 min-[720px]:border-b-0 min-[720px]:border-r">
        <div className="font-mono text-[11px] tracking-[0.16em] text-dim">
          PLACEMENTS · B. {selectedChart.date} · {cityShort(selectedChart.cityLabel)}
        </div>
        <div className="mt-3 flex flex-col font-mono text-[11px]">
          <div className="grid grid-cols-[1fr_78px_46px] gap-2 py-2 text-faint-ink">
            <span>BODY</span>
            <span>LONG</span>
            <span>SIGN</span>
          </div>
          {PLANETS.map((planet) => {
            const { sign, degree } = longitudeToSign(natal.chart[planet]);
            const deity = DEITY_MATRIX[culture][planet];
            const received = isReceived(planet);
            return (
              <Link
                key={planet}
                href={`/charts/${selectedChart.id}/${planet}`}
                className={cn(
                  "grid grid-cols-[1fr_78px_46px] items-center gap-2 border-t border-rule-row py-2 hover:bg-bone/5",
                  received ? "text-[var(--accent)]" : "text-bone",
                )}
              >
                <span className="flex min-w-0 items-center gap-[6px]">
                  <DeityGlyph body={planet} culture={culture} size={16} />
                  <span className="truncate">{deity.name.toUpperCase()}</span>
                </span>
                <span className="text-dim">{formatDegMin(degree)}</span>
                <span className="text-dim">{SIGN_ABBR3[sign]}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 font-mono text-[11px] leading-[1.7] text-dim">
          ASC {formatDegMin(ascPoint.degree)} {ascPoint.sign.toUpperCase()} · WHOLE-SIGN HOUSES
          <br />
          ASTRONOMY-ENGINE · ORBS DOCUMENTED →{" "}
          <Link href="/method" className="text-[var(--accent)]">
            METHOD
          </Link>
        </div>
      </aside>

      <div className="flex flex-col items-center px-7 py-6">
        <div className="w-full font-mono text-[11px] tracking-[0.16em] text-dim">
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
        <div className="mt-4 flex w-full items-center gap-2 font-mono text-[11px] text-dim">
          <span className="h-px w-[18px] bg-conflict" /> CONFLICT
          <span className="ml-[10px] h-px w-[18px] bg-bone/40" /> HARMONY
          <span className="ml-auto text-[var(--accent)]">ACCENT GLYPHS: THE THREE RECEIVED</span>
        </div>
      </div>

      <aside className="border-rule flex flex-col border-t px-7 py-6 min-[720px]:border-t-0 min-[720px]:border-l">
        <div className="font-mono text-[11px] tracking-[0.16em] text-dim">
          SAVED CHARTS · ON THIS DEVICE
        </div>
        <ul className="mt-3 flex flex-col gap-[10px]">
          {charts.map((chart) => (
            <li key={chart.id}>
              <div
                className={cn(
                  "border px-[15px] py-[13px]",
                  chart.id === selectedChart.id ? "border-[var(--accent)]" : "border-rule",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(chart.id)}
                  className="flex w-full items-baseline justify-between gap-3 text-left"
                >
                  <span className="font-display text-[13px] tracking-[0.08em] text-bone">
                    {chart.name.toUpperCase()}
                  </span>
                  <span className="font-mono text-[11px] text-dim">
                    {chart.date.slice(0, 4)} · {cityShort(chart.cityLabel)}
                  </span>
                </button>
                <div className="mt-2 flex flex-wrap gap-4 font-mono text-[11px] tracking-[0.08em]">
                  {chart.primary ? (
                    <span className="text-[var(--accent)]">PRIMARY</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(chart.id)}
                      className="text-dim hover:text-bone"
                    >
                      SET PRIMARY
                    </button>
                  )}
                  {confirmId === chart.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDelete(chart.id)}
                        className="text-conflict"
                      >
                        CONFIRM REMOVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="text-dim hover:text-bone"
                      >
                        CANCEL
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(chart.id)}
                      className="text-dim hover:text-conflict"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/reading"
          className="mt-[10px] border border-[var(--accent)] px-[15px] py-[13px] text-center font-mono text-[11px] tracking-[0.12em] text-[var(--accent)]"
        >
          + CAST A NEW CHART
        </Link>

        <div className="mt-6 font-mono text-[11px] tracking-[0.16em] text-dim">
          THE THREE, AS {CULTURE_LABELS[culture].toUpperCase()} RECEIVES THEM
        </div>
        <div className="mt-3 flex flex-col gap-[10px]">
          {RECEIVED_BODIES.map((planet) => {
            const deity = DEITY_MATRIX[culture][planet];
            return (
              <div
                key={planet}
                className="border-l-2 border-[var(--accent)] pl-3 font-body text-[12.5px] leading-[1.55] text-prose"
              >
                <span className="inline-flex items-center gap-[6px] align-middle font-display text-[11px] tracking-[0.1em] text-[var(--accent)]">
                  <DeityGlyph body={planet} culture={culture} size={16} />
                  {deity.name.toUpperCase()}
                </span>{" "}
                · {deity.epithet}
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <div className="border border-rule px-[15px] py-[13px] font-mono text-[11px] leading-[1.7] text-dim">
            MODERN BODIES, RECEIVED IN THE ANCIENT MANNER →{" "}
            <Link href="/method" className="text-[var(--accent)]">
              METHOD
            </Link>
          </div>
        </div>
      </aside>
    </InstrumentShell>
  );
}
