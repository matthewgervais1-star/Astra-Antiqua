"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { CultureGate } from "@/components/chrome/CultureGate";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { WheelSvg } from "@/components/chrome/WheelSvg";
import { Skeleton } from "@/components/chrome/Skeleton";
import { BirthForm, type BirthFormValues } from "@/components/reading/BirthForm";
import { ReadingDisplay } from "@/components/reading/ReadingDisplay";
import { SaveChartPanel } from "@/components/charts/SaveChartPanel";
import { computeChart } from "@/lib/ephemeris";
import { computeAngularPoints, type AngularPoints } from "@/lib/ascendant";
import { resolveBirth, type ResolvedBirth } from "@/lib/birthDateTime";
import { buildReading, type Reading } from "@/lib/reading";
import { computeAspects, type Longitude } from "@/data/sampleChart";
import { RECEIVED_BODIES, type Culture, type Planet } from "@/data/cultures";
import {
  getChart,
  getPrimaryChart,
  type SavedChartInputs,
} from "@/lib/savedCharts";

const ORACLE_INVOCATION: Readonly<Record<Culture, string>> = {
  egypt: "Consult the Hall of Ma'at",
  greece: "Consult the Pythia at Delphi",
  canaan: "Convene the divine council",
  carthage: "Bring your name before the Council",
  rome: "Open the Sibylline Books",
};

const ORACLE_INTRO: Readonly<Record<Culture, string>> = {
  egypt:
    "The feather will be weighed against your heart. The barque carries the answer across the day, but the question is set the moment you give it your hour.",
  greece:
    "The Pythia speaks once and the question must be exact. Set the date, the hour, the place; the answer will be cast in the names of Olympus.",
  canaan:
    "El's council will be convened around the moment you came into the world. Bring the hour, the day, the city; the seats will be filled and the verdict spoken in the voice of Ugarit.",
  carthage:
    "Your name will be cut into the bronze of the Council for the hour of your birth. Set the date, the time, the place; the fire of Melqart will turn toward the chart that is cast.",
  rome:
    "The Sibylline Books are opened only in extremity, and read by the appointed college. Give the day, the hour, the place; the answer returns in the names that still order the days of your week.",
};

function headlineFrom(culture: Culture | null): string {
  if (!culture) return "CAST YOUR CHART";
  return ORACLE_INVOCATION[culture].toUpperCase();
}

interface ComputedState {
  inputs: BirthFormValues;
  birth: ResolvedBirth;
  chart: Readonly<Record<Planet, Longitude>>;
  angles: AngularPoints;
}

function inputsFromChart(saved: SavedChartInputs): BirthFormValues {
  return {
    date: saved.date,
    time: saved.time,
    cityLabel: saved.cityLabel,
    latitude: saved.latitude,
    longitude: saved.longitude,
  };
}

interface ReadingExperienceImplProps {
  explicitCulture: Culture | null;
}

function ReadingExperienceImpl({ explicitCulture }: ReadingExperienceImplProps) {
  const ctxCulture = useActivePantheon();
  const culture = explicitCulture ?? ctxCulture;
  const searchParams = useSearchParams();
  const chartId = searchParams.get("chartId");

  const [hydrated, setHydrated] = useState<{
    editingChart: SavedChartInputs | null;
    initialValues: BirthFormValues | null;
  }>({ editingChart: null, initialValues: null });
  const [state, setState] = useState<ComputedState | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load initial form values from the URL-specified chart or the primary saved chart.
    const meta = chartId ? getChart(chartId) : getPrimaryChart();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated({
      editingChart: meta,
      initialValues: meta ? inputsFromChart(meta) : null,
    });
    if (chartId) setState(null);
  }, [chartId]);

  const editingChart = hydrated.editingChart;
  const initialValues = hydrated.initialValues;
  const setEditingChart = (chart: SavedChartInputs | null) =>
    setHydrated((curr) => ({ ...curr, editingChart: chart }));

  const handleSubmit = (values: BirthFormValues) => {
    setSubmitting(true);
    setComputeError(null);
    try {
      const [yearStr, monthStr, dayStr] = values.date.split("-");
      const [hourStr, minuteStr] = values.time.split(":");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);
      const hour = Number(hourStr);
      const minute = Number(minuteStr);
      if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day) ||
        !Number.isFinite(hour) ||
        !Number.isFinite(minute)
      ) {
        throw new Error("Invalid date or time format.");
      }
      const birth = resolveBirth({
        year,
        month,
        day,
        hour,
        minute,
        latitude: values.latitude,
        longitude: values.longitude,
      });
      const chart = computeChart(birth.utcDate);
      const angles = computeAngularPoints(
        birth.utcDate,
        values.latitude,
        values.longitude,
      );
      setState({ inputs: values, birth, chart, angles });
    } catch (err) {
      setComputeError(err instanceof Error ? err.message : "The chart could not be cast.");
      setState(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Opening a specific saved chart (?chartId=...) should draw the reading at
  // once, not leave the user staring at a pre-filled form to press Cast again.
  useEffect(() => {
    if (chartId && initialValues && !state && !submitting) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmit(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId, initialValues]);

  // On a phone the result renders far below the form; scroll to it after a cast
  // so it does not look like nothing happened.
  useEffect(() => {
    if (state && resultRef.current && window.innerWidth < 768) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  const reading: Reading | null = useMemo(
    () => (state && culture ? buildReading(culture, state.chart) : null),
    [culture, state],
  );

  const wheelAspects = useMemo(
    () =>
      state
        ? computeAspects(state.chart).map((a) => ({
            planetA: a.a,
            planetB: a.b,
            kind: a.kind,
          }))
        : [],
    [state],
  );

  return (
    <NaveShell context="CAST · THE NATAL RECORD">
      <NaveHead kicker={editingChart ? `EDITING · ${editingChart.name.toUpperCase()}` : "ENTER YOUR HOUR OF BIRTH"}>
        {headlineFrom(culture)}
      </NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-prose-m leading-prose text-prose">
        {culture
          ? ORACLE_INTRO[culture]
          : "Set the date, the hour, and the place of your birth. The ten bodies will be placed for the exact moment you came into the world; the answer will be rendered in the voice of whichever culture you call on."}
      </p>
      <p className="mx-auto mt-4 max-w-[560px] text-center font-mono text-data-xs uppercase leading-data tracking-data text-dim">
        ALL COMPUTATION RUNS IN YOUR BROWSER · SAVED CHARTS LIVE ON THIS DEVICE →{" "}
        <Link href="/charts" className="text-accent">
          YOUR CHARTS
        </Link>
      </p>

      <div className="mt-14 flex flex-col gap-6">
        <SectionDivider label="YOUR BIRTH" />
        <BirthForm
          onSubmit={handleSubmit}
          submitting={submitting}
          initialValues={initialValues}
        />
        {computeError ? (
          <p className="font-mono text-data-xs uppercase tracking-microcopy text-conflict">
            {computeError}
          </p>
        ) : null}
        {state ? (
          <SaveChartPanel
            values={state.inputs}
            existingId={editingChart?.id}
            initialName={editingChart?.name ?? ""}
            initialRelationship={editingChart?.relationship ?? "self"}
            initialPrimary={editingChart?.primary ?? false}
            onSaved={(saved) => setEditingChart(saved)}
          />
        ) : null}
      </div>

      <div ref={resultRef} className="mt-16 flex flex-col gap-10">
        {state ? (
          <>
            <SectionDivider label="THE WHEEL" />
            <div className="flex justify-center">
              <WheelSvg
                chart={state.chart}
                ascendant={state.angles.ascendant}
                aspects={wheelAspects}
                accentPlanets={[...RECEIVED_BODIES]}
                culture={culture}
              />
            </div>
            {culture && reading ? (
              <ReadingDisplay
                culture={culture}
                reading={reading}
                birth={state.birth}
                inputs={state.inputs}
                ascendant={state.angles.ascendant}
                midheaven={state.angles.midheaven}
                chartId={editingChart?.id ?? null}
              />
            ) : null}
          </>
        ) : (
          <div className="border border-rule px-6 py-10 text-center font-mono text-data-xs uppercase tracking-label text-dim">
            THE WHEEL DRAWS ITSELF ONCE YOU CAST
          </div>
        )}
      </div>
    </NaveShell>
  );
}

function ReadingFallback() {
  return (
    <NaveShell context="CAST · THE NATAL RECORD">
      <Skeleton />
    </NaveShell>
  );
}

interface ReadingExperienceProps {
  /** When set, locks the reading to this culture and skips the culture gate
   *  (used by the legacy per-culture route while it still exists). */
  culture?: Culture;
  /** Whether an unset culture should show the five-doorway gate. Has no
   *  effect when `culture` is provided. */
  showSelector?: boolean;
}

export function ReadingExperience({
  culture,
  showSelector = true,
}: ReadingExperienceProps) {
  const body = (
    <Suspense fallback={<ReadingFallback />}>
      <ReadingExperienceImpl explicitCulture={culture ?? null} />
    </Suspense>
  );
  if (culture || !showSelector) return body;
  return <CultureGate>{body}</CultureGate>;
}
