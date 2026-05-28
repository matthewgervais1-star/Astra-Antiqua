"use client";

import { useMemo } from "react";
import type { Culture } from "@/data/cultures";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  buildAnnualReport,
  type AnnualReport,
} from "@/lib/annualReport";
import type {
  EclipseEvent,
  NatalTransitPeak,
  RetrogradeEvent,
  SolarReturnEvent,
} from "@/lib/yearForecast";

interface AnnualReportSectionProps {
  now: Date;
  natalName: string;
  culture: Culture | null;
  majorTransits: readonly NatalTransitPeak[];
  eclipses: readonly EclipseEvent[];
  retrogrades: readonly RetrogradeEvent[];
  solarReturn: SolarReturnEvent | null;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function ReportContent({ report }: { report: AnnualReport }) {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.35em]">
          The year for {report.natalName}
        </div>
        <h2 className="font-display text-gold-leaf mt-3 max-w-3xl text-3xl leading-tight md:text-[44px]">
          {report.yearTheme.headline}
        </h2>
        <p className="text-ink-primary font-body mt-5 max-w-3xl text-lg leading-relaxed md:text-xl">
          {report.yearTheme.body}
        </p>
      </header>

      <section>
        <div className="text-ink-tertiary font-mono mb-5 text-[10px] uppercase tracking-[0.3em]">
          Four seasons of the year
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {report.quarters.map((q, idx) => (
            <article
              key={`${q.startDate.toISOString()}-${idx}`}
              className="border-border-hairline bg-bg-deep rounded-2xl border p-5 md:p-6"
            >
              <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                {q.label}
              </div>
              <p className="text-ink-primary font-body mt-4 text-base leading-relaxed md:text-[17px]">
                {q.narrative}
              </p>
              <p className="text-ink-tertiary font-mono mt-3 text-[10px] uppercase tracking-[0.2em]">
                {q.notableEventCount} notable event{q.notableEventCount === 1 ? "" : "s"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {report.hardestStretch ? (
          <article className="border-conflict-red/30 bg-bg-deep rounded-2xl border p-6 md:p-7">
            <div className="text-conflict-red font-mono text-[10px] uppercase tracking-[0.3em]">
              Where the year tightens
            </div>
            <h3 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              {report.hardestStretch.monthLabel}
            </h3>
            <p className="text-ink-primary font-body mt-3 text-base leading-relaxed md:text-[17px]">
              {report.hardestStretch.narrative}
            </p>
          </article>
        ) : (
          <article className="border-border-hairline bg-bg-deep rounded-2xl border p-6 md:p-7">
            <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
              Where the year tightens
            </div>
            <p className="text-ink-secondary font-body mt-3 text-base italic">
              No month dominates the tension count this year. The challenging stretches are distributed; pace yourself rather than bracing for one bad month.
            </p>
          </article>
        )}
        {report.easiestStretch ? (
          <article className="border-gold-soft bg-bg-deep rounded-2xl border p-6 md:p-7">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              Where the year eases
            </div>
            <h3 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              {report.easiestStretch.monthLabel}
            </h3>
            <p className="text-ink-primary font-body mt-3 text-base leading-relaxed md:text-[17px]">
              {report.easiestStretch.narrative}
            </p>
          </article>
        ) : (
          <article className="border-border-hairline bg-bg-deep rounded-2xl border p-6 md:p-7">
            <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
              Where the year eases
            </div>
            <p className="text-ink-secondary font-body mt-3 text-base italic">
              No month dominates the easing count this year either. The easing stretches are distributed; do not wait for one good month to do the work you have wanted to do.
            </p>
          </article>
        )}
      </section>

      <section>
        <div className="text-ink-tertiary font-mono mb-5 text-[10px] uppercase tracking-[0.3em]">
          Standout dates · {report.standouts.length} marked
        </div>
        {report.standouts.length === 0 ? (
          <p className="text-ink-secondary font-body text-base italic">
            No standout dates for this year. The sky lets you make of the time what you will.
          </p>
        ) : (
          <ol className="border-border-hairline relative space-y-5 border-l pl-6">
            {report.standouts.map((s, idx) => (
              <li key={`${s.date.toISOString()}-${idx}`} className="relative">
                <span className="bg-gold-leaf absolute -left-[27px] top-2 h-2 w-2 rounded-full" />
                <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                  {formatDate(s.date)}
                </div>
                <p className="font-display text-ink-primary mt-1 text-lg leading-snug md:text-xl">
                  {s.title}
                </p>
                <p className="text-ink-secondary font-body mt-1 text-sm md:text-base">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export function AnnualReportSection(props: AnnualReportSectionProps) {
  const { now, natalName, culture, majorTransits, eclipses, retrogrades, solarReturn } = props;

  const report = useMemo<AnnualReport | null>(() => {
    if (!culture) return null;
    return buildAnnualReport({
      now,
      natalName,
      culture,
      majorTransits,
      eclipses,
      retrogrades,
      solarReturn,
    });
  }, [now, natalName, culture, majorTransits, eclipses, retrogrades, solarReturn]);

  if (!culture) {
    return (
      <GlassPanel tone="solid" className="border-gold-soft border p-6 md:p-8">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          The year ahead
        </div>
        <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base md:text-lg">
          Select a pantheon to read the year synthesized in its voice. The events themselves are the same; the framing changes per tradition.
        </p>
      </GlassPanel>
    );
  }

  if (!report) return null;

  return (
    <GlassPanel tone="glass" glow className="p-6 md:p-10">
      <ReportContent report={report} />
    </GlassPanel>
  );
}
