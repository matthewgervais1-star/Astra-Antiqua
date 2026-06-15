"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PantheonSelector,
  useActivePantheon,
} from "@/components/pantheon/PantheonSelector";
import { BirthForm, type BirthFormValues } from "@/components/reading/BirthForm";
import { ReadingDisplay } from "@/components/reading/ReadingDisplay";
import { SaveChartPanel } from "@/components/charts/SaveChartPanel";
import { NatalWheel } from "@/components/wheel/NatalWheel";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { computeChart } from "@/lib/ephemeris";
import { computeAngularPoints, type AngularPoints } from "@/lib/ascendant";
import { resolveBirth, type ResolvedBirth } from "@/lib/birthDateTime";
import { buildReading, type Reading } from "@/lib/reading";
import {
  getChart,
  getPrimaryChart,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import type { Culture, Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";

const ORACLE_INVOCATION: Readonly<Record<Culture, string>> = {
  egypt: "Consult the Hall of Ma'at.",
  greece: "Consult the Pythia at Delphi.",
  canaan: "Convene the divine council.",
  carthage: "Bring your name before the Council.",
  rome: "Open the Sibylline Books.",
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
  showSelector: boolean;
}

function ReadingExperienceImpl({
  explicitCulture,
  showSelector,
}: ReadingExperienceImplProps) {
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

  const birthStep = showSelector ? "Step two" : "Step one";
  const wheelStep = showSelector ? "Step three" : "Step two";

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          {editingChart ? `Editing: ${editingChart.name}` : "New chart"}
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">
          {culture ? ORACLE_INVOCATION[culture] : "Consult the oracle."}
        </GoldText>
        <p className="text-ink-secondary font-body mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          {culture
            ? ORACLE_INTRO[culture]
            : "Set the date, the hour, and the place of your birth. The seven classical planets will be placed for the exact moment you came into the world; the answer will be rendered in the voice of whichever oracle you call on."}
        </p>
        <p className="text-ink-tertiary font-body mt-4 max-w-2xl text-sm md:text-base">
          All computation happens in your browser. Your birth data is not sent to a server. Saved charts live in this browser&apos;s localStorage. Manage them on the{" "}
          <Link href="/charts" className="text-gold-leaf underline-offset-4 hover:underline">
            charts page
          </Link>
          .
        </p>
      </SectionContainer>

      {showSelector ? (
        <SectionContainer size="default" spacing="tight">
          <div className="mb-10">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Step one
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              Choose the voice.
            </h2>
          </div>
          <PantheonSelector />
        </SectionContainer>
      ) : null}

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="mb-6">
              <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
                {birthStep}
              </div>
              <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
                Set the hour of your birth.
              </h2>
              <p className="text-ink-tertiary font-body mt-3 text-sm md:text-base">
                The Moon, the Ascendant, and the exact degree of the Sun depend on the hour and the place. If the hour is unknown, set the form to twelve and the Sun and the outer planets remain accurate.
              </p>
            </div>
            <GlassPanel tone="solid" className="p-6 md:p-8">
              <BirthForm
                onSubmit={handleSubmit}
                submitting={submitting}
                initialValues={initialValues}
              />
              {computeError ? (
                <p className="text-conflict-red font-mono mt-4 text-xs uppercase tracking-[0.2em]">
                  {computeError}
                </p>
              ) : null}
            </GlassPanel>
            {state ? (
              <div className="mt-6">
                <SaveChartPanel
                  values={state.inputs}
                  existingId={editingChart?.id}
                  initialName={editingChart?.name ?? ""}
                  initialRelationship={editingChart?.relationship ?? "self"}
                  initialPrimary={editingChart?.primary ?? false}
                  onSaved={(saved) => setEditingChart(saved)}
                />
              </div>
            ) : null}
          </div>

          <div className="md:col-span-7" ref={resultRef}>
            <div className="mb-6">
              <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
                {wheelStep}
              </div>
              <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
                Read the wheel.
              </h2>
            </div>
            {state ? (
              <div className="space-y-12">
                <NatalWheel
                  chart={state.chart}
                  ascendant={state.angles.ascendant}
                  caption={`${state.inputs.cityLabel} · ${state.inputs.date} ${state.inputs.time} (${state.birth.timezone})`}
                />
                {culture && reading ? (
                  <ReadingDisplay
                    culture={culture}
                    reading={reading}
                    birth={state.birth}
                    inputs={state.inputs}
                    ascendant={state.angles.ascendant}
                    midheaven={state.angles.midheaven}
                  />
                ) : (
                  <GlassPanel tone="solid" className="p-6 md:p-8">
                    <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                      Almost there
                    </div>
                    <p className="font-display text-ink-primary mt-3 text-xl md:text-2xl">
                      Select a pantheon above to render the reading in its voice.
                    </p>
                  </GlassPanel>
                )}
              </div>
            ) : (
              <GlassPanel tone="glass" className="flex min-h-[320px] items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
                    Awaiting your birth data
                  </div>
                  <p className="font-display text-ink-secondary mt-4 max-w-md text-xl md:text-2xl">
                    The wheel will draw itself once you submit the form.
                  </p>
                </div>
              </GlassPanel>
            )}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="border-border-hairline border-t pt-10">
          <p className="text-ink-tertiary font-body text-sm md:text-base">
            For background on how the planetary archetypes map to each pantheon, see{" "}
            <Link href="/methodology" className="text-gold-leaf underline-offset-4 hover:underline">
              the methodology page
            </Link>
            . For the full deity matrix, see{" "}
            <Link href="/translation-matrix" className="text-gold-leaf underline-offset-4 hover:underline">
              the translation matrix
            </Link>
            .
          </p>
        </div>
      </SectionContainer>
    </>
  );
}

function ReadingFallback() {
  return (
    <SectionContainer size="default" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Loading
      </div>
    </SectionContainer>
  );
}

interface ReadingExperienceProps {
  /** When set, locks the reading to this culture and hides the voice selector. */
  culture?: Culture;
  /** Whether to show the "choose the voice" pantheon selector (global page). */
  showSelector?: boolean;
}

export function ReadingExperience({
  culture,
  showSelector = true,
}: ReadingExperienceProps) {
  return (
    <Suspense fallback={<ReadingFallback />}>
      <ReadingExperienceImpl
        explicitCulture={culture ?? null}
        showSelector={showSelector}
      />
    </Suspense>
  );
}
