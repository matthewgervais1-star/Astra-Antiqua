"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
import { resolveBirth, type ResolvedBirth } from "@/lib/birthDateTime";
import { buildReading, type Reading } from "@/lib/reading";
import {
  getChart,
  getPrimaryChart,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import type { Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";

interface ComputedState {
  inputs: BirthFormValues;
  birth: ResolvedBirth;
  chart: Readonly<Record<Planet, Longitude>>;
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

function ReadingPageImpl() {
  const culture = useActivePantheon();
  const searchParams = useSearchParams();
  const chartId = searchParams.get("chartId");

  const [hydrated, setHydrated] = useState<{
    editingChart: SavedChartInputs | null;
    initialValues: BirthFormValues | null;
  }>({ editingChart: null, initialValues: null });
  const [state, setState] = useState<ComputedState | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [computeError, setComputeError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial form values from the URL-specified chart or the primary saved chart.
    const meta = chartId ? getChart(chartId) : getPrimaryChart();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated({
      editingChart: meta,
      initialValues: meta ? inputsFromChart(meta) : null,
    });
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
      setState({ inputs: values, birth, chart });
    } catch (err) {
      setComputeError(err instanceof Error ? err.message : "Could not compute the chart.");
      setState(null);
    } finally {
      setSubmitting(false);
    }
  };

  const reading: Reading | null = useMemo(
    () => (state && culture ? buildReading(culture, state.chart) : null),
    [culture, state],
  );

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          {editingChart ? `Editing: ${editingChart.name}` : "New chart"}
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">
          Compute your reading.
        </GoldText>
        <p className="text-ink-secondary font-body mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          Enter your birth date, time, and place, then choose a pantheon. The seven classical planets are placed for the exact moment of your birth and the reading is translated into the voice of the tradition you select. Save the chart once and the home page personalizes to it on every visit.
        </p>
        <p className="text-ink-tertiary font-body mt-4 max-w-2xl text-sm md:text-base">
          All computation happens in your browser. Your birth data is not sent to a server. Saved charts live in this browser&apos;s localStorage. Manage them on the{" "}
          <Link href="/charts" className="text-gold-leaf underline-offset-4 hover:underline">
            charts page
          </Link>
          .
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="mb-10">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Step one
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
            Choose the voice of your reading.
          </h2>
        </div>
        <PantheonSelector />
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="mb-6">
              <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
                Step two
              </div>
              <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
                Enter your birth data.
              </h2>
              <p className="text-ink-tertiary font-body mt-3 text-sm md:text-base">
                Time and location matter most for the Moon, the Ascendant, and the exact degree the Sun occupies. If you are uncertain, use 12:00 noon.
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

          <div className="md:col-span-7">
            <div className="mb-6">
              <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
                Step three
              </div>
              <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
                Read the wheel.
              </h2>
            </div>
            {state ? (
              <div className="space-y-12">
                <NatalWheel
                  chart={state.chart}
                  caption={`${state.inputs.cityLabel} · ${state.inputs.date} ${state.inputs.time} (${state.birth.timezone})`}
                />
                {culture && reading ? (
                  <ReadingDisplay
                    culture={culture}
                    reading={reading}
                    birth={state.birth}
                    inputs={state.inputs}
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

function ReadingPageFallback() {
  return (
    <SectionContainer size="default" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Loading
      </div>
    </SectionContainer>
  );
}

export default function ReadingPage() {
  return (
    <Suspense fallback={<ReadingPageFallback />}>
      <ReadingPageImpl />
    </Suspense>
  );
}
