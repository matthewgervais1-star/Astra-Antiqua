"use client";

import Link from "next/link";
import { isReceived, type Culture } from "@/data/cultures";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import type { TransitSpan } from "@/lib/transitSpans";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { NaveHead } from "@/components/chrome/NaveHead";
import { DEITY_MATRIX } from "@/data/deities";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { Skeleton } from "@/components/chrome/Skeleton";
import { TransitEmptyState } from "@/components/transits/TransitEmptyState";
import { useSpans } from "@/components/transits/useSpans";
import { natalPointLabel, spanTone } from "@/components/transits/spanDisplay";
import { fmt, str, text } from "@/strings";
import { SPAN_TONE_WORDS } from "@/strings/formats";
import { cn } from "@/lib/classNames";

function SpanRow({ span, culture, now }: { span: TransitSpan; culture: Culture; now: Date }) {
  const verb = ASPECT_VERBS[culture][span.aspectKind];
  const natalLabel = natalPointLabel(culture, span.natalKey);
  const received = isReceived(span.transitPlanet);
  const ahead = span.passes.filter((p) => p.getTime() > now.getTime()).length;
  const range = fmt("range.months", [span.start, span.end], "local");
  const tone = SPAN_TONE_WORDS[spanTone(span)];
  const data =
    ahead > 0
      ? str("transits.row.data", culture, { range, exact: span.passes.length, ahead, tone })
      : str("transits.row.dataNoAhead", culture, { range, exact: span.passes.length, tone });

  return (
    <Link
      href={`/transits/${span.id}`}
      className="flex items-center justify-between gap-6 border-t border-rule py-4 text-left last:border-b hover:bg-bone/5"
    >
      <div className="min-w-0">
        <div
          className={cn(
            "font-display text-display-xs tracking-[0.06em]",
            received ? "text-accent" : "text-bone",
          )}
        >
          {str("transits.row.title", culture, {
            deity: DEITY_MATRIX[culture][span.transitPlanet].name.toUpperCase(),
            verb: verb.toUpperCase(),
            natal: natalLabel,
          })}
        </div>
        <div className="mt-1.5 font-mono text-data-xs text-dim">
          {data}
        </div>
      </div>
      <span className="whitespace-nowrap font-mono text-data-xs text-accent">{str("transits.row.link", culture)}</span>
    </Link>
  );
}

function SpanList({
  spans,
  culture,
  emptyLabel,
  now,
}: {
  spans: readonly TransitSpan[];
  culture: Culture;
  emptyLabel: string;
  now: Date;
}) {
  if (spans.length === 0) {
    return (
      <p className="border-t border-rule py-6 text-center font-mono text-data-xs text-dim">{emptyLabel}</p>
    );
  }
  return (
    <div className="flex flex-col">
      {spans.map((span) => (
        <SpanRow key={span.id} span={span} culture={culture} now={now} />
      ))}
    </div>
  );
}

export function TransitsIndex() {
  const culture = useActivePantheon();
  const { loading, natal, spans, now } = useSpans();

  if (loading) return <Skeleton label={text("transits.loading")} />;
  if (!culture) return null;
  if (!natal) return <TransitEmptyState />;

  const nowMs = now.getTime();
  const active = spans.filter((s) => s.start.getTime() <= nowMs && nowMs <= s.end.getTime());
  const ahead = spans.filter((s) => s.start.getTime() > nowMs);
  const listed = [...active, ...ahead];
  const first = listed.reduce<Date | null>((m, s) => (m === null || s.start < m ? s.start : m), null);
  const last = listed.reduce<Date | null>((m, s) => (m === null || s.end > m ? s.end : m), null);

  return (
    <>
      <NaveHead
        culture={culture}
        kicker={str("transits.kicker", culture)}
        sub={
          first && last ? (
            <div className="font-mono text-data-xs tracking-label text-dim">
              {str("transits.countLine", culture, {
                count: fmt("count.word", listed.length),
                range: fmt("range.months", [first, last], "local"),
              })}
            </div>
          ) : undefined
        }
      >
        {str("transits.title", culture)}
      </NaveHead>
      <div className="mt-10 flex flex-col gap-12">
        <section>
          <SectionDivider label={str("transits.group.open", culture)} />
          <SpanList spans={active} culture={culture} now={now} emptyLabel={str("transits.empty.open", culture)} />
        </section>
        <section>
          <SectionDivider label={str("transits.group.ahead", culture)} />
          <SpanList spans={ahead} culture={culture} now={now} emptyLabel={str("transits.empty.ahead", culture)} />
        </section>
      </div>
    </>
  );
}
