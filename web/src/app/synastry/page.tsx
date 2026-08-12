"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DEITY_MATRIX } from "@/data/deities";
import { isReceived } from "@/data/cultures";
import { orbFor, type AspectKind } from "@/data/sampleChart";
import { getAspectReading } from "@/data/aspectReadings";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { listCharts, type SavedChartInputs } from "@/lib/savedCharts";
import { resolveSavedChart, type SavedNatal } from "@/lib/savedNatal";
import { computeSynastry, topSynastry, type SynastryAspect } from "@/lib/synastry";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { InstrumentShell, type InstrumentSibling } from "@/components/chrome/InstrumentShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { OrbBar } from "@/components/chrome/OrbBar";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { Skeleton } from "@/components/chrome/Skeleton";
import { PartyPicker } from "@/components/synastry/PartyPicker";
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
  const [charts, setCharts] = useState<readonly SavedChartInputs[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  useEffect(() => {
    const list = listCharts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCharts(list);
    setHydrated(true);
    const primary = list.find((c) => c.primary) ?? list[0];
    setIdA((curr) => curr || (primary?.id ?? ""));
    setIdB((curr) => curr || (list.find((c) => c.id !== primary?.id)?.id ?? ""));
  }, []);

  const chartA = charts.find((c) => c.id === idA) ?? null;
  const chartB = charts.find((c) => c.id === idB) ?? null;

  const natalA = useMemo<SavedNatal | null>(() => (chartA ? resolveSavedChart(chartA) : null), [chartA]);
  const natalB = useMemo<SavedNatal | null>(() => (chartB ? resolveSavedChart(chartB) : null), [chartB]);

  const allAspects = useMemo<readonly SynastryAspect[]>(() => {
    if (!natalA || !natalB) return [];
    return computeSynastry(natalA.chart, natalB.chart);
  }, [natalA, natalB]);

  if (!culture) return null;

  const voice = CULTURE_VOICES[culture];
  const ready = Boolean(natalA && natalB);
  const twoCharts = charts.length > 1;

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
          <div className="mb-3 font-mono text-[11px] tracking-[0.16em] text-dim">THE TWO PARTIES</div>
          {charts.length === 0 ? (
            <p className="font-mono text-[11px] leading-[1.6] text-dim">NO CHARTS ARE SAVED YET.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <PartyPicker chart={chartA} charts={charts} excludeId={idB} onSelect={setIdA} />
              {twoCharts ? (
                <PartyPicker chart={chartB} charts={charts} excludeId={idA} onSelect={setIdB} />
              ) : (
                <Link
                  href="/reading"
                  className="border border-rule px-[15px] py-3 text-center font-mono text-[11px] tracking-[0.1em] text-dim hover:text-bone"
                >
                  CAST THE SECOND CHART →
                </Link>
              )}
            </div>
          )}
        </div>
        {ready ? (
          <div>
            <div className="mb-3 font-mono text-[11px] tracking-[0.16em] text-dim">THE WEIGHING</div>
            <div className="flex flex-col gap-2.5 font-mono text-[11.5px] leading-[1.5]">
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
            <div className="mt-[22px] border border-rule px-[15px] py-[13px] font-mono text-[11px] leading-[1.7] text-dim">
              THE COUNT IS NOT THE VERDICT; READ THE BONDS →
            </div>
          </div>
        ) : null}
      </aside>

      <div className="flex flex-col gap-3 px-8 py-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-dim">BONDS IN ORB · STRONGEST FIRST</div>
        {!ready || !natalA || !natalB ? (
          <p className="mt-3 max-w-md font-body text-[15px] italic leading-[1.68] text-prose">
            {charts.length === 0
              ? "No charts are saved yet. Cast the first to begin weighing a pair."
              : charts.length === 1
                ? "One chart is saved. Cast a second to weigh the bonds between two skies."
                : "One of these charts could not be read. Recast it on the charts page."}
          </p>
        ) : (
          <>
            <div className="flex flex-col font-mono text-[11.5px]">
              {topBonds.map((bond, idx) => {
                const deityA = DEITY_MATRIX[culture][bond.planetA];
                const deityB = DEITY_MATRIX[culture][bond.planetB];
                const tone = orbToneFor(bond.kind);
                return (
                  <div
                    key={`${bond.planetA}-${bond.planetB}-${bond.kind}-${idx}`}
                    className="grid grid-cols-[minmax(0,1fr)_90px_54px] items-center gap-3 border-t border-rule-row py-[11px] last:border-b sm:grid-cols-[minmax(0,1fr)_100px_140px_64px]"
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
              <div className="mt-2 font-mono text-[11px] leading-[1.7] text-dim">
                {receivedDeityName.toUpperCase()} IS A RECEIVED BODY; THE PAIR&apos;S SLOWEST BONDS ARE THE
                CONTRACT&apos;S FOUNDATIONS →{" "}
                <Link href="/method" className="text-[var(--accent)]">
                  METHOD
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>

      <aside className="flex flex-col gap-5 border-l border-rule px-[30px] py-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--accent)]">
          READING · {voice.synastryTitle}
        </div>
        {ready && natalA && natalB ? (
          <>
            <h2 className="font-display text-[22px] leading-[1.45] tracking-[0.06em] text-bone">{headline}</h2>
            <div className="h-px w-11 bg-[var(--accent)]" />
            <p className="font-body text-[15px] leading-[1.68] text-prose">{para1}</p>
            <p className="font-body text-[15px] leading-[1.68] text-prose">{para2}</p>
            <Votive>{votiveText}</Votive>
            <FeedbackRow readingId={`synastry-${idA}-${idB}`} noun="READING" />
          </>
        ) : charts.length === 0 ? (
          <>
            <h2 className="font-display text-[20px] leading-[1.4] tracking-[0.06em] text-bone">
              THE {stripLeadingThe(voice.synastryTitle)} NEEDS TWO CHARTS
            </h2>
            <Link
              href="/reading"
              className="mt-1 inline-flex w-fit border border-[var(--accent-strong-border)] px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-[var(--accent)]"
            >
              CAST →
            </Link>
          </>
        ) : charts.length === 1 ? (
          <>
            <h2 className="font-display text-[20px] leading-[1.4] tracking-[0.06em] text-bone">
              ONE PARTY IS SET. CAST THE SECOND.
            </h2>
            <p className="font-body text-[15px] leading-[1.68] text-prose">
              {stripLeadingThe(voice.synastryTitle)} needs two charts in orb of each other before a bond can be
              weighed.
            </p>
            <Link
              href="/reading"
              className="mt-1 inline-flex w-fit border border-[var(--accent-strong-border)] px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-[var(--accent)]"
            >
              CAST THE SECOND CHART →
            </Link>
          </>
        ) : (
          <p className="font-body text-[15px] italic leading-[1.68] text-prose">
            One of these charts could not be read. Recast it on the{" "}
            <Link href="/charts" className="text-[var(--accent)]">
              charts page
            </Link>
            .
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
