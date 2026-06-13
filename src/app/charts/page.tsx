"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RELATIONSHIP_LABELS,
  deleteChart,
  listCharts,
  setPrimaryChart,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  mirrorDeleteToServer,
  mirrorPrimaryToServer,
  useAuth,
} from "@/components/auth/AuthProvider";

function formatBirth(chart: SavedChartInputs): string {
  return `${chart.date} · ${chart.time} · ${chart.cityLabel || `${chart.latitude.toFixed(2)}, ${chart.longitude.toFixed(2)}`}`;
}

export default function ChartsPage() {
  const { status, user } = useAuth();
  const [charts, setCharts] = useState<readonly SavedChartInputs[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCharts(listCharts());
    setHydrated(true);
  }, [status]);

  const refresh = () => setCharts(listCharts());

  const handleDelete = async (id: string, name: string) => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(`Delete the chart "${name}"? This cannot be undone.`);
    if (!ok) return;
    deleteChart(id);
    refresh();
    await mirrorDeleteToServer(id, status);
  };

  const handleSetPrimary = async (id: string) => {
    setPrimaryChart(id);
    refresh();
    await mirrorPrimaryToServer(id, status);
  };

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Saved charts
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <GoldText as="h1" className="max-w-3xl text-5xl leading-tight md:text-6xl">
            Your charts.
          </GoldText>
          <Link
            href="/reading"
            className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
          >
            + New chart
          </Link>
        </div>
        <p className="text-ink-secondary font-body mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          {status === "authenticated" && user
            ? `Signed in as ${user.email}. Your charts sync across devices and browsers; every change you make here is mirrored to your account.`
            : "Saved charts live only in this browser. Sign in to keep them on any device you use."}
          {" "}The chart marked primary sets the Big Three and Personal Transits on the home page. Add a partner, a parent, or a friend to compare in the{" "}
          <Link href="/synastry" className="text-gold-leaf underline-offset-4 hover:underline">
            synastry view
          </Link>
          .
        </p>
        {status === "anonymous" ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors"
            >
              Create an account
            </Link>
            <Link
              href="/sign-in"
              className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : null}
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        {!hydrated ? (
          <p className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
            Loading
          </p>
        ) : charts.length === 0 ? (
          <GlassPanel tone="glass" className="p-8 md:p-12">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              No charts yet
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              Cast your first chart to begin.
            </h2>
            <p className="text-ink-secondary font-body mt-3 max-w-xl text-base md:text-lg">
              Your birth date, time, and place become a chart, computed in your browser. Save it and the home page reads each day against it.
            </p>
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              Cast a chart →
            </Link>
          </GlassPanel>
        ) : (
          <ul className="flex flex-col gap-4">
            {charts.map((chart) => (
              <li key={chart.id}>
                <GlassPanel tone="solid" className="p-6 md:p-7">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="font-display text-gold-leaf text-2xl md:text-3xl">
                          {chart.name}
                        </h3>
                        <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                          {RELATIONSHIP_LABELS[chart.relationship]}
                        </span>
                        {chart.primary ? (
                          <span className="bg-gold-leaf/10 border-gold-soft text-gold-leaf font-mono rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.3em]">
                            Primary
                          </span>
                        ) : null}
                      </div>
                      <p className="text-ink-secondary font-mono mt-2 text-[11px] uppercase tracking-[0.2em]">
                        {formatBirth(chart)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/reading?chartId=${chart.id}`}
                        className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft font-mono rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors"
                      >
                        Open
                      </Link>
                      {!chart.primary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(chart.id)}
                          className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft font-mono rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors"
                        >
                          Set primary
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(chart.id, chart.name)}
                        className="border-hairline text-conflict-red hover:border-conflict-red font-mono rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </GlassPanel>
              </li>
            ))}
          </ul>
        )}
      </SectionContainer>
    </>
  );
}
