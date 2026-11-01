"use client";

import { useMemo } from "react";
import Link from "next/link";
import { isReceived } from "@/data/cultures";
import type { TransitSpan } from "@/lib/transitSpans";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { Skeleton } from "@/components/chrome/Skeleton";
import { TransitEmptyState } from "@/components/transits/TransitEmptyState";
import { useSpans } from "@/components/transits/useSpans";
import { groupSpans, transitsModelFromSpans } from "@/lib/screens/transits";
import type { SlotMap } from "@/lib/screens/types";
import { text } from "@/strings";
import { localZone } from "@/strings/formats";
import { cn } from "@/lib/classNames";

/** One span's row: title and data line from the model's row slots, row `i`. */
function SpanRow({ span, slots, i }: { span: TransitSpan; slots: SlotMap; i: number }) {
  return (
    <Link
      href={`/transits/${span.id}`}
      className="flex items-center justify-between gap-6 border-t border-rule py-4 text-left last:border-b hover:bg-bone/5"
    >
      <div className="min-w-0">
        <div
          className={cn(
            "font-display text-display-xs tracking-[0.06em]",
            isReceived(span.transitPlanet) ? "text-accent" : "text-bone",
          )}
        >
          {(slots["transits.row.title"] as string[])[i]}
        </div>
        <div className="mt-1.5 font-mono text-data-xs text-dim">{(slots["transits.row.data"] as string[])[i]}</div>
      </div>
      <span className="whitespace-nowrap font-mono text-data-xs text-accent">{slots["transits.row.link"]}</span>
    </Link>
  );
}

/** A group's rows, which start at row `offset` of the model's row slots; its empty line when it has none. */
function SpanList({
  spans,
  slots,
  offset,
  empty,
}: {
  spans: readonly TransitSpan[];
  slots: SlotMap;
  offset: number;
  empty: string | string[] | undefined;
}) {
  if (spans.length === 0) {
    return <p className="border-t border-rule py-6 text-center font-mono text-data-xs text-dim">{empty}</p>;
  }
  return (
    <div className="flex flex-col">
      {spans.map((span, i) => (
        <SpanRow key={span.id} span={span} slots={slots} i={offset + i} />
      ))}
    </div>
  );
}

export function TransitsIndex() {
  const culture = useActivePantheon();
  const { loading, natal, spans, now } = useSpans();
  const slots = useMemo(
    () => (culture && natal ? transitsModelFromSpans({ culture, instant: now, zone: localZone(), birth: natal }, spans) : null),
    [culture, natal, now, spans],
  );

  if (loading) return <Skeleton label={text("transits.loading")} />;
  if (!culture) return null;
  if (!natal || !slots) return <TransitEmptyState />;

  // The model lists the open spans first, then those ahead.
  const { open, ahead } = groupSpans(spans, now);

  return (
    <>
      <NaveHead
        culture={culture}
        kicker={slots["transits.kicker"]}
        sub={
          slots["transits.countLine"] ? (
            <div className="font-mono text-data-xs tracking-label text-dim">{slots["transits.countLine"]}</div>
          ) : undefined
        }
      >
        {slots["transits.title"]}
      </NaveHead>
      <div className="mt-10 flex flex-col gap-12">
        <section>
          <SectionDivider label={slots["transits.group.open"] as string} />
          <SpanList spans={open} slots={slots} offset={0} empty={slots["transits.empty.open"]} />
        </section>
        <section>
          <SectionDivider label={slots["transits.group.ahead"] as string} />
          <SpanList spans={ahead} slots={slots} offset={open.length} empty={slots["transits.empty.ahead"]} />
        </section>
      </div>
    </>
  );
}
