"use client";

import Link from "next/link";
import { isReceived, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import type { TransitSpan } from "@/lib/transitSpans";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { Skeleton } from "@/components/chrome/Skeleton";
import { TransitEmptyState } from "@/components/transits/TransitEmptyState";
import { useSpans } from "@/components/transits/useSpans";
import { monthYear, natalPointLabel } from "@/components/transits/spanDisplay";
import { cn } from "@/lib/classNames";

function SpanRow({ span, culture }: { span: TransitSpan; culture: Culture }) {
  const transitDeity = DEITY_MATRIX[culture][span.transitPlanet].name;
  const verb = ASPECT_VERBS[culture][span.aspectKind];
  const natalLabel = natalPointLabel(culture, span.natalKey);
  const received = isReceived(span.transitPlanet);
  const passLabel = span.passes.length === 1 ? "PASS" : "PASSES";

  return (
    <Link
      href={`/transits/${span.id}`}
      className="flex items-center justify-between gap-6 border-t border-rule py-4 text-left last:border-b hover:bg-bone/5"
    >
      <div className="min-w-0">
        <div
          className={cn(
            "font-display text-[15px] tracking-[0.06em]",
            received ? "text-accent" : "text-bone",
          )}
        >
          {transitDeity.toUpperCase()} {verb.toUpperCase()} {natalLabel}
        </div>
        <div className="mt-1.5 font-mono text-data-xs text-dim">
          {monthYear(span.start)} → {monthYear(span.end)} · {span.passes.length} EXACT {passLabel}
        </div>
      </div>
      <span className="whitespace-nowrap font-mono text-data-xs text-accent">READ →</span>
    </Link>
  );
}

function SpanList({ spans, culture, emptyLabel }: { spans: readonly TransitSpan[]; culture: Culture; emptyLabel: string }) {
  if (spans.length === 0) {
    return (
      <p className="border-t border-rule py-6 text-center font-mono text-data-xs text-dim">{emptyLabel}</p>
    );
  }
  return (
    <div className="flex flex-col">
      {spans.map((span) => (
        <SpanRow key={span.id} span={span} culture={culture} />
      ))}
    </div>
  );
}

export function TransitsIndex() {
  const culture = useActivePantheon();
  const { loading, natal, spans, now } = useSpans();

  if (loading) return <Skeleton label="COMPUTING THE SKY…" />;
  if (!culture) return null;
  if (!natal) return <TransitEmptyState />;

  const nowMs = now.getTime();
  const active = spans.filter((s) => s.start.getTime() <= nowMs && nowMs <= s.end.getTime());
  const ahead = spans.filter((s) => s.start.getTime() > nowMs);
  const voice = CULTURE_VOICES[culture];

  return (
    <>
      <NaveHead kicker={`${voice.institution} · THE LONG TRANSITS`}>WHAT DOES NOT PASS IN A DAY</NaveHead>
      <div className="mt-10 flex flex-col gap-12">
        <section>
          <SectionDivider label="ACTIVE NOW" />
          <SpanList spans={active} culture={culture} emptyLabel="NOTHING HOLDS WITHIN ORB TODAY" />
        </section>
        <section>
          <SectionDivider label="AHEAD" />
          <SpanList spans={ahead} culture={culture} emptyLabel="NO FURTHER PASSAGES IN THIS WINDOW" />
        </section>
      </div>
    </>
  );
}
