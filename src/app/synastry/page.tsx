"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Culture,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, type AspectKind } from "@/data/sampleChart";
import { ASPECT_REFLECTIONS } from "@/data/interpretations";
import {
  RELATIONSHIP_LABELS,
  listCharts,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import { resolveSavedChart, type SavedNatal } from "@/lib/savedNatal";
import { computeSynastry, topSynastry, type SynastryAspect } from "@/lib/synastry";
import {
  PantheonSelector,
  useActivePantheon,
} from "@/components/pantheon/PantheonSelector";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PrintButton } from "@/components/ui/PrintButton";

const ASPECT_VERBS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "joins the barque of",
    sextile: "extends a steady hand to",
    square: "weighs against the heart of",
    trine: "lifts the gaze of",
    opposition: "faces across the river from",
  },
  greece: {
    conjunction: "stands shoulder to shoulder with",
    sextile: "offers fair counsel to",
    square: "challenges",
    trine: "harmonizes with",
    opposition: "stands across the agora from",
  },
  canaan: {
    conjunction: "shares the throne of the council with",
    sextile: "exchanges tribute with",
    square: "draws the bow against",
    trine: "speaks favor over",
    opposition: "convenes the council against",
  },
  carthage: {
    conjunction: "raises the standard alongside",
    sextile: "trades safe passage with",
    square: "raises the hand against",
    trine: "lights the fire alongside",
    opposition: "demands a price of",
  },
  rome: {
    conjunction: "marches under the same eagle as",
    sextile: "treats for alliance with",
    square: "raises the spear against",
    trine: "clasps the right hand of",
    opposition: "stands across the forum from",
  },
};

interface ChartCardProps {
  natal: SavedNatal;
  culture: Culture | null;
  label: string;
}

function ChartCard({ natal, culture, label }: ChartCardProps) {
  const sunInfo = longitudeToSign(natal.chart.sun);
  const moonInfo = longitudeToSign(natal.chart.moon);
  const ascInfo = longitudeToSign(natal.angles.ascendant);
  const sun = culture ? DEITY_MATRIX[culture].sun : null;
  const moon = culture ? DEITY_MATRIX[culture].moon : null;
  return (
    <GlassPanel tone="solid" className="p-6 md:p-7">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
        {label}
      </div>
      <h3 className="font-display text-gold-leaf mt-2 text-2xl md:text-3xl">
        {natal.meta.name}
      </h3>
      <p className="text-ink-secondary font-mono mt-1 text-[10px] uppercase tracking-[0.2em]">
        {RELATIONSHIP_LABELS[natal.meta.relationship]} · {natal.meta.date} · {natal.meta.cityLabel}
      </p>
      <ul className="text-ink-primary font-body mt-5 space-y-2 text-sm md:text-base">
        <li>
          <strong className="text-gold-leaf">{sun?.name ?? "Sun"}:</strong>{" "}
          {sunInfo.degree.toFixed(0)}° {sunInfo.sign}
        </li>
        <li>
          <strong className="text-gold-leaf">{moon?.name ?? "Moon"}:</strong>{" "}
          {moonInfo.degree.toFixed(0)}° {moonInfo.sign}
        </li>
        <li>
          <strong className="text-gold-leaf">Rising:</strong>{" "}
          {ascInfo.degree.toFixed(0)}° {ascInfo.sign}
        </li>
      </ul>
    </GlassPanel>
  );
}

interface SynastryLineProps {
  aspect: SynastryAspect;
  culture: Culture | null;
  nameA: string;
  nameB: string;
}

function SynastryLine({ aspect, culture, nameA, nameB }: SynastryLineProps) {
  const deityA = culture ? DEITY_MATRIX[culture][aspect.planetA] : null;
  const deityB = culture ? DEITY_MATRIX[culture][aspect.planetB] : null;
  const verb = culture ? ASPECT_VERBS[culture][aspect.kind] : null;
  const reflection = culture ? ASPECT_REFLECTIONS[culture][aspect.kind] : null;
  return (
    <li className="border-border-hairline border-t pt-4">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
        {nameA}&apos;s {PLANET_SYMBOLS[aspect.planetA]} {PLANET_LABELS[aspect.planetA]} {aspect.kind}{" "}
        {nameB}&apos;s {PLANET_SYMBOLS[aspect.planetB]} {PLANET_LABELS[aspect.planetB]} · orb {aspect.orb.toFixed(1)}°
      </div>
      {culture && deityA && deityB && verb ? (
        <>
          <p className="font-display text-gold-leaf mt-2 text-lg leading-snug md:text-xl">
            {nameA}&apos;s {deityA.name} {verb} {nameB}&apos;s {deityB.name}.
          </p>
          {reflection ? (
            <p className="text-ink-primary font-body mt-2 text-sm leading-relaxed md:text-[15px]">
              {reflection}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-ink-secondary font-body mt-2 text-sm italic">
          Select a pantheon to read this in its voice.
        </p>
      )}
    </li>
  );
}

function SynastryPageImpl() {
  const culture = useActivePantheon();
  const [charts, setCharts] = useState<readonly SavedChartInputs[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [idA, setIdA] = useState<string>("");
  const [idB, setIdB] = useState<string>("");

  useEffect(() => {
    const list = listCharts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCharts(list);
    setHydrated(true);
    const primary = list.find((c) => c.primary) ?? list[0];
    if (primary) setIdA(primary.id);
    const other = list.find((c) => c.id !== primary?.id);
    if (other) setIdB(other.id);
  }, []);

  const natalA = useMemo<SavedNatal | null>(() => {
    const meta = charts.find((c) => c.id === idA);
    return meta ? resolveSavedChart(meta) : null;
  }, [charts, idA]);

  const natalB = useMemo<SavedNatal | null>(() => {
    const meta = charts.find((c) => c.id === idB);
    return meta ? resolveSavedChart(meta) : null;
  }, [charts, idB]);

  const aspects = useMemo<readonly SynastryAspect[]>(() => {
    if (!natalA || !natalB) return [];
    return topSynastry(computeSynastry(natalA.chart, natalB.chart), 8);
  }, [natalA, natalB]);

  const harmonyCount = useMemo(
    () => aspects.filter((a) => a.kind === "trine" || a.kind === "sextile").length,
    [aspects],
  );
  const tensionCount = useMemo(
    () => aspects.filter((a) => a.kind === "square" || a.kind === "opposition").length,
    [aspects],
  );
  const conjunctionCount = useMemo(
    () => aspects.filter((a) => a.kind === "conjunction").length,
    [aspects],
  );

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Synastry · two charts
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">
          How two skies meet.
        </GoldText>
        <p className="text-ink-secondary font-body mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          Synastry compares two natal charts and reports the tightest aspects between the two sets of planets. The reading is rendered in the voice of the pantheon you select; each line uses both people&apos;s names, so &quot;Sarah&apos;s Resheph weighs against your Shapash&quot; rather than abstract astrological notation.
        </p>
      </SectionContainer>

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

      <SectionContainer size="default" spacing="tight">
        <div className="mb-10">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Step two
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
            Pick two charts.
          </h2>
          <p className="text-ink-tertiary font-body mt-3 text-sm md:text-base">
            Both must be saved on the{" "}
            <Link href="/charts" className="text-gold-leaf underline-offset-4 hover:underline">
              charts page
            </Link>
            . If you only have one, compute a second via the{" "}
            <Link href="/reading" className="text-gold-leaf underline-offset-4 hover:underline">
              reading page
            </Link>
            .
          </p>
        </div>

        {!hydrated ? (
          <p className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">Loading</p>
        ) : charts.length < 2 ? (
          <GlassPanel tone="glass" className="p-8 md:p-10">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              Need at least two saved charts
            </div>
            <p className="font-display text-ink-primary mt-3 text-xl md:text-2xl">
              You have {charts.length} chart{charts.length === 1 ? "" : "s"} saved.
            </p>
            <p className="text-ink-secondary font-body mt-2 max-w-xl text-base md:text-lg">
              Cast another chart to enable synastry. Add a partner, family member, or friend on the{" "}
              <Link href="/reading" className="text-gold-leaf underline-offset-4 hover:underline">
                reading page
              </Link>
              .
            </p>
          </GlassPanel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <ChartPicker
              label="Chart A (you)"
              charts={charts}
              value={idA}
              onChange={setIdA}
              excludeId={idB}
            />
            <ChartPicker
              label="Chart B (other)"
              charts={charts}
              value={idB}
              onChange={setIdB}
              excludeId={idA}
            />
          </div>
        )}
      </SectionContainer>

      {natalA && natalB ? (
        <>
          <SectionContainer size="default" spacing="tight">
            <div className="grid gap-5 md:grid-cols-2">
              <ChartCard natal={natalA} culture={culture} label="Chart A" />
              <ChartCard natal={natalB} culture={culture} label="Chart B" />
            </div>
          </SectionContainer>

          <SectionContainer size="default" spacing="default">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-ink-primary text-3xl md:text-4xl">
                  How {natalA.meta.name} and {natalB.meta.name} meet
                </h2>
                <p className="text-ink-tertiary font-mono mt-3 text-[11px] uppercase tracking-[0.3em]">
                  {aspects.length} tightest cross-aspects · {harmonyCount} easing · {tensionCount} challenging · {conjunctionCount} doubling
                </p>
              </div>
              <PrintButton label="Save as PDF" />
            </div>
            {aspects.length === 0 ? (
              <GlassPanel tone="solid" className="p-6 md:p-8">
                <p className="text-ink-secondary font-body text-base italic">
                  No tight cross-aspects between these two charts. The two skies pass each other quietly; the relationship is built from ground that the planets do not heavily mark.
                </p>
              </GlassPanel>
            ) : (
              <GlassPanel tone="solid" className="p-6 md:p-8">
                <ul className="flex flex-col gap-5">
                  {aspects.map((aspect, idx) => (
                    <SynastryLine
                      key={`${aspect.planetA}-${aspect.planetB}-${idx}`}
                      aspect={aspect}
                      culture={culture}
                      nameA={natalA.meta.name}
                      nameB={natalB.meta.name}
                    />
                  ))}
                </ul>
              </GlassPanel>
            )}
          </SectionContainer>
        </>
      ) : null}
    </>
  );
}

interface ChartPickerProps {
  label: string;
  charts: readonly SavedChartInputs[];
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
}

function ChartPicker({ label, charts, value, onChange, excludeId }: ChartPickerProps) {
  return (
    <GlassPanel tone="solid" className="p-5 md:p-6">
      <label className="text-ink-tertiary font-mono mb-2 block text-[10px] uppercase tracking-[0.25em]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
      >
        <option value="">Choose a saved chart</option>
        {charts
          .filter((c) => c.id !== excludeId)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({RELATIONSHIP_LABELS[c.relationship]}) · {c.date}
            </option>
          ))}
      </select>
    </GlassPanel>
  );
}

function Fallback() {
  return (
    <SectionContainer size="default" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Loading
      </div>
    </SectionContainer>
  );
}

export default function SynastryPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <SynastryPageImpl />
    </Suspense>
  );
}
