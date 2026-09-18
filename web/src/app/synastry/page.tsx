"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DEITY_MATRIX } from "@/data/deities";
import { isReceived } from "@/data/cultures";
import { orbFor, type AspectKind } from "@/data/sampleChart";
import { getAspectReading } from "@/data/aspectReadings";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { readChart, type ComparisonParty, type SavedChartInputs } from "@/lib/savedCharts";
import { resolveSavedChart, type SavedNatal } from "@/lib/savedNatal";
import { computeSynastry, topSynastry, type SynastryAspect } from "@/lib/synastry";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { InstrumentShell, type InstrumentSibling } from "@/components/chrome/InstrumentShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { OrbBar } from "@/components/chrome/OrbBar";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { Skeleton } from "@/components/chrome/Skeleton";
import { ComparisonForm } from "@/components/synastry/ComparisonForm";
import { ASPECT_GLYPHS, BOND_LABELS, orbToneFor } from "@/components/synastry/bondLabels";
import { SYNASTRY_HEADLINES, SYNASTRY_VOTIVES, labelToSentence } from "@/components/synastry/synastryCopy";

const SIBLINGS: readonly InstrumentSibling[] = [
  { label: "CHARTS", href: "/charts" },
  { label: "FORECAST", href: "/forecast" },
];

function formatOrb(orb: number): string {
  const totalMinutes = Math.round(orb * 60);
  const deg = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

function stripLeadingThe(title: string): string {
  return title.replace(/^THE\s+/, "");
}

function SynastryInstrument() {
  const culture = useActivePantheon();
  const [chartA, setChartA] = useState<SavedChartInputs | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // The second party lives in component state and nowhere else. It is gone on
  // refresh, which is the whole point: their birth data is a calculation here,
  // not a record.
  const [chartB, setChartB] = useState<ComparisonParty | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartA(readChart());
    setHydrated(true);
  }, []);

  const natalA = useMemo<SavedNatal | null>(() => (chartA ? resolveSavedChart(chartA) : null), [chartA]);
  const natalB = useMemo<SavedNatal | null>(() => (chartB ? resolveSavedChart(chartB) : null), [chartB]);

  const allAspects = useMemo<readonly SynastryAspect[]>(() => {
    if (!natalA || !natalB) return [];
    return computeSynastry(natalA.chart, natalB.chart);
  }, [natalA, natalB]);

  if (!culture) return null;

  const voice = CULTURE_VOICES[culture];
  const ready = Boolean(natalA && natalB);

  const topBonds = topSynastry(allAspects, 8);
  const harmonyCount = allAspects.filter((a) => a.kind === "trine" || a.kind === "sextile").length;
  const conflictCount = allAspects.filter((a) => a.kind === "square" || a.kind === "opposition").length;
  const altarCount = allAspects.filter((a) => a.kind === "conjunction").length;

  const receivedBond = topBonds.find((b) => isReceived(b.planetA) || isReceived(b.planetB));
  const receivedDeityName = receivedBond
    ? DEITY_MATRIX[culture][isReceived(receivedBond.planetA) ? receivedBond.planetA : receivedBond.planetB].name
    : null;

  const topHarmonyOrAltar = topBonds.find((b) => b.kind !== "square" && b.kind !== "opposition") ?? null;
  const topTension = topBonds.find((b) => b.kind === "square" || b.kind === "opposition") ?? null;

  let headline = stripLeadingThe(voice.synastryTitle);
  let para1 = "The two skies pass each other quietly. Nothing in orb yet names a shared altar.";
  let para2 = "No bond in orb pulls tight enough to call a debt. Whatever holds between you is unforced.";
  let votiveKind: AspectKind = "trine";

  if (ready && natalA && natalB) {
    if (topHarmonyOrAltar) {
      headline = SYNASTRY_HEADLINES[culture][topHarmonyOrAltar.kind as "conjunction" | "trine" | "sextile"];
      const dA = DEITY_MATRIX[culture][topHarmonyOrAltar.planetA].name;
      const dB = DEITY_MATRIX[culture][topHarmonyOrAltar.planetB].name;
      const verb = ASPECT_VERBS[culture][topHarmonyOrAltar.kind];
      const body = getAspectReading(
        topHarmonyOrAltar.planetA,
        topHarmonyOrAltar.planetB,
        topHarmonyOrAltar.kind,
      ).body;
      para1 = `${natalA.meta.name}'s ${dA} ${verb} ${natalB.meta.name}'s ${dB}. ${body}`;
      votiveKind = topHarmonyOrAltar.kind;
    }
    if (topTension) {
      const opener = labelToSentence(BOND_LABELS[culture][topTension.kind]);
      const dA = DEITY_MATRIX[culture][topTension.planetA].name;
      const dB = DEITY_MATRIX[culture][topTension.planetB].name;
      const verb = ASPECT_VERBS[culture][topTension.kind];
      const body = getAspectReading(topTension.planetA, topTension.planetB, topTension.kind).body;
      para2 = `${opener} ${natalB.meta.name}'s ${dB} ${verb} ${natalA.meta.name}'s ${dA}. ${body}`;
      votiveKind = topTension.kind;
    }
  }

  const votiveText = SYNASTRY_VOTIVES[culture][votiveKind];

  if (!hydrated) {
    return (
      <InstrumentShell context="SYNASTRY · TWO CHARTS WEIGHED" siblings={SIBLINGS}>
        <div style={{ gridColumn: "1 / -1" }} className="px-8 py-10">
          <Skeleton />
        </div>
      </InstrumentShell>
    );
  }

  return (
    <InstrumentShell context="SYNASTRY · TWO CHARTS WEIGHED" siblings={SIBLINGS}>
      <aside className="flex flex-col gap-6 border-r border-rule px-7 py-6">
        <div>
          <div className="mb-3 font-mono text-data-xs tracking-label text-dim">THE TWO PARTIES</div>
          {chartA === null ? (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-data-xs leading-data text-dim">
                YOUR CHART IS NOT CAST YET.
              </p>
              <Link
                href="/reading"
                className="border border-rule px-[var(--space-3)] py-3 text-center font-mono text-data-xs tracking-data text-dim hover:text-bone"
              >
                CAST YOUR CHART →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="border border-rule px-[var(--space-3)] py-[var(--space-2)]">
                <div className="font-mono text-data-xs tracking-label text-dim">YOU</div>
                <div className="font-mono text-data-s text-bone">{chartA.name}</div>
                <div className="font-mono text-data-xs leading-data text-dim">
                  {chartA.date} · {chartA.cityLabel}
                </div>
              </div>
              <ComparisonForm
                onCompare={setChartB}
                onClear={() => setChartB(null)}
                active={chartB !== null}
              />
            </div>
          )}
        </div>
        {ready ? (
          <div>
            <div className="mb-3 font-mono text-data-xs tracking-label text-dim">THE WEIGHING</div>
            <div className="flex flex-col gap-2.5 font-mono text-data-xs leading-data">
              <div className="flex items-baseline justify-between">
                <span className="text-harmony">HARMONIES</span>
                <span className="font-mono text-xl tabular-nums text-bone">{harmonyCount}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-conflict">CONFLICTS</span>
                <span className="font-mono text-xl tabular-nums text-bone">{conflictCount}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-prose">SHARED ALTARS (☌)</span>
                <span className="font-mono text-xl tabular-nums text-bone">{altarCount}</span>
              </div>
            </div>
            <div className="mt-[var(--space-4)] border border-rule px-[var(--space-3)] py-[var(--space-2)] font-mono text-data-xs leading-data text-dim">
              THE COUNT IS NOT THE VERDICT; READ THE BONDS →
            </div>
          </div>
        ) : null}
      </aside>

      <div className="flex flex-col gap-3 px-8 py-6">
        <div className="font-mono text-data-xs tracking-label text-dim">BONDS IN ORB · STRONGEST FIRST</div>
        {!ready || !natalA || !natalB ? (
          <p className="mt-3 max-w-md font-body text-prose-s italic leading-prose text-prose">
            {chartA === null
              ? "Your chart is not cast yet. Cast it to begin weighing a pair."
              : chartB === null
                ? "Enter the second party's birth details to weigh the bonds between two skies."
                : "One of these charts could not be read. Check the birth details and try again."}
          </p>
        ) : (
          <>
            <div className="flex flex-col font-mono text-data-xs">
              {topBonds.map((bond, idx) => {
                const deityA = DEITY_MATRIX[culture][bond.planetA];
                const deityB = DEITY_MATRIX[culture][bond.planetB];
                const tone = orbToneFor(bond.kind);
                return (
                  <div
                    key={`${bond.planetA}-${bond.planetB}-${bond.kind}-${idx}`}
                    className="grid grid-cols-[minmax(0,1fr)_90px_54px] items-center gap-3 border-t border-rule-row py-[var(--space-2)] last:border-b sm:grid-cols-[minmax(0,1fr)_100px_140px_64px]"
                  >
                    <span className="truncate text-bone">
                      {natalA.meta.name.toUpperCase()}&apos;S {deityA.name.toUpperCase()} {ASPECT_GLYPHS[bond.kind]}{" "}
                      {natalB.meta.name.toUpperCase()}&apos;S {deityB.name.toUpperCase()}
                    </span>
                    <span className="hidden sm:block">
                      <OrbBar orb={bond.orb} maxOrb={orbFor(bond.kind)} tone={tone} />
                    </span>
                    <span className={tone === "harmony" ? "text-harmony" : "text-conflict"}>
                      {BOND_LABELS[culture][bond.kind]}
                    </span>
                    <span className="text-right text-dim sm:text-left">{formatOrb(bond.orb)}</span>
                  </div>
                );
              })}
            </div>
            {receivedDeityName ? (
              <div className="mt-2 font-mono text-data-xs leading-data text-dim">
                {receivedDeityName.toUpperCase()} IS A RECEIVED BODY; THE PAIR&apos;S SLOWEST BONDS ARE THE
                CONTRACT&apos;S FOUNDATIONS →{" "}
                <Link href="/method" className="text-accent">
                  METHOD
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>

      <aside className="flex flex-col gap-5 border-l border-rule px-[var(--space-5)] py-6">
        <div className="font-mono text-data-xs tracking-label text-accent">
          READING · {voice.synastryTitle}
        </div>
        {ready && natalA && natalB ? (
          <>
            <h2 className="font-display text-display-s leading-display tracking-display text-bone">{headline}</h2>
            <div className="h-px w-11 bg-accent" />
            <p className="font-body text-prose-s leading-prose text-prose">{para1}</p>
            <p className="font-body text-prose-s leading-prose text-prose">{para2}</p>
            <Votive>{votiveText}</Votive>
            <FeedbackRow readingId={`synastry-${chartA?.id ?? "none"}`} noun="READING" />
          </>
        ) : chartA === null ? (
          <>
            <h2 className="font-display text-display-s leading-display tracking-display text-bone">
              THE {stripLeadingThe(voice.synastryTitle)} NEEDS YOUR CHART FIRST
            </h2>
            <Link
              href="/reading"
              className="mt-1 inline-flex w-fit border border-[var(--accent-strong-border)] px-5 py-3 font-mono text-data-xs tracking-label text-accent"
            >
              CAST →
            </Link>
          </>
        ) : chartB === null ? (
          <>
            <h2 className="font-display text-display-s leading-display tracking-display text-bone">
              YOUR CHART IS SET. ENTER THE SECOND PARTY.
            </h2>
            <p className="font-body text-prose-s leading-prose text-prose">
              {stripLeadingThe(voice.synastryTitle)} needs two skies in orb of each other before a
              bond can be weighed. Their birth details are used for the weighing and then
              discarded; nothing about them is kept.
            </p>
          </>
        ) : (
          <p className="font-body text-prose-s italic leading-prose text-prose">
            One of these charts could not be read. Check the birth details and try again.
          </p>
        )}
      </aside>
    </InstrumentShell>
  );
}

export default function SynastryPage() {
  return (
    <CultureGate>
      <SynastryInstrument />
    </CultureGate>
  );
}
