"use client";

import Link from "next/link";
import { isReceived } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { getHouseMeaning } from "@/data/houses";
import { longitudeToSign } from "@/data/sampleChart";
import { TRANSIT_SPINE, type SlowBody } from "@/data/transitSpine";
import { houseReading } from "@/lib/houseReading";
import { findSpanById } from "@/lib/transitSpans";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { NaveHead } from "@/components/chrome/NaveHead";
import { ReceptionNote } from "@/components/chrome/ReceptionNote";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { Skeleton } from "@/components/chrome/Skeleton";
import { Votive } from "@/components/chrome/Votive";
import { TransitEmptyState } from "@/components/transits/TransitEmptyState";
import { TransitSubBar } from "@/components/transits/TransitSubBar";
import { useSpans } from "@/components/transits/useSpans";
import {
  ASPECT_KIND_GLYPH,
  elapsedFraction,
  formatDegMin,
  houseGroupIndex,
  isPointPlanetKey,
  monthYear,
  monthYearProse,
  signPhraseProse,
  natalDegreeSide,
  natalPointLabel,
  ordinalWord,
  passNarrative,
  passStatusLine,
  seasonWord,
  spanTone,
  wholeSignHouse,
} from "@/components/transits/spanDisplay";
import {
  NATAL_POINT_CLOSING,
  TOUCHES_ASC,
  TOUCHES_MC,
  TOUCHES_REGISTER_LINE,
  WHERE_BEGINS_CADENCE,
} from "@/components/transits/spineTemplates";

const FALLBACK_HOUSE_GROUP = { name: "", sub: "" } as const;

/** natalDegreeSide leads a sun or moon point with these words; the glyph goes between them and the deity name. */
const NATAL_PREFIX = "YOUR NATAL ";

export interface TransitDetailProps {
  id: string;
}

export function TransitDetail({ id }: TransitDetailProps) {
  const culture = useActivePantheon();
  const { loading, natal, spans, now } = useSpans();

  if (loading) {
    return (
      <>
        <div className="h-[46px] border-b border-rule" />
        <main className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
          <Skeleton />
        </main>
      </>
    );
  }

  if (!culture) return null;

  if (!natal) {
    return (
      <main className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
        <TransitEmptyState showAllLink />
      </main>
    );
  }

  const span = findSpanById(spans, id);
  if (!span) {
    return (
      <main className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
        <TransitEmptyState showAllLink />
      </main>
    );
  }

  const voice = CULTURE_VOICES[culture];
  const spine = TRANSIT_SPINE[culture][span.transitPlanet as SlowBody];
  const tone = spanTone(span);
  const transitDeity = DEITY_MATRIX[culture][span.transitPlanet].name;
  const verb = ASPECT_VERBS[culture][span.aspectKind];
  const kindGlyph = ASPECT_KIND_GLYPH[span.aspectKind];
  const natalLabel = natalPointLabel(culture, span.natalKey);
  const pointKey = isPointPlanetKey(span.natalKey) ? span.natalKey : null;

  const { sign: natalSign, degree: natalDegree } = longitudeToSign(span.natalLongitude);
  const natalSide = natalDegreeSide(culture, span, natalSign, natalDegree);
  const natalWords = pointKey ? natalSide.slice(NATAL_PREFIX.length) : natalSide;
  const degreesLine = (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-[var(--space-1)]">
      <DeityGlyph body={span.transitPlanet} culture={culture} size={16} />
      <span>{transitDeity.toUpperCase()}</span>
      <span>{formatDegMin(span.transitDegree)}</span>
      <span>{span.transitSign.toUpperCase()}</span>
      <span>{kindGlyph}</span>
      {pointKey ? (
        <>
          <span>{NATAL_PREFIX.trim()}</span>
          <DeityGlyph body={pointKey} culture={culture} size={16} />
        </>
      ) : null}
      <span>{natalWords}</span>
    </span>
  );

  const season = seasonWord(span.end);
  const releaseYear = span.end.getFullYear();

  const changingClose = pointKey
    ? `It is set against your ${DEITY_MATRIX[culture][pointKey].name}, ${DEITY_MATRIX[culture][pointKey].epithet}.`
    : span.natalKey === "asc"
      ? NATAL_POINT_CLOSING[culture].asc
      : NATAL_POINT_CLOSING[culture].mc;

  const beginsParagraph = `It began in ${monthYearProse(span.start)}, when ${transitDeity} first held the ${ordinalWord(span.transitDegree)} degree of the ${signPhraseProse(span.transitSign)}. ${passNarrative(span, now)} The degree is not released until ${monthYearProse(span.end)}. ${WHERE_BEGINS_CADENCE[culture]}`;

  let touchesParagraph: string;
  if (pointKey) {
    const house = wholeSignHouse(span.natalLongitude, natal.angles.ascendant);
    const meaning = getHouseMeaning(house);
    const group = voice.houseGroups[houseGroupIndex(house)] ?? FALLBACK_HOUSE_GROUP;
    const reading = houseReading(culture, pointKey, house);
    touchesParagraph = `This transit works on the ${meaning.ordinal.toLowerCase()} house, ${meaning.arena}, the seat of ${group.name} in the record: ${group.sub.toLowerCase()}. ${reading} ${TOUCHES_REGISTER_LINE[culture]}`;
  } else {
    touchesParagraph = span.natalKey === "asc" ? TOUCHES_ASC[culture] : TOUCHES_MC[culture];
  }

  const fraction = elapsedFraction(span, now);
  const statusLine = passStatusLine(span, now);
  const receivedBody = isReceived(span.transitPlanet);

  return (
    <>
      <TransitSubBar
        context={`LONG TRANSIT · ${transitDeity.toUpperCase()} ${kindGlyph} NATAL ${natalLabel}`}
        span={`${monthYear(span.start)} → ${monthYear(span.end)}`}
      />
      <main className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
        <div className="mx-auto max-w-[640px]">
          <NaveHead
            kicker={`${voice.institution} · A READING SCOPED TO THE TRANSIT'S WHOLE SPAN`}
            sub={
              <div className="font-mono text-data-xs leading-data tracking-label text-dim">
                {degreesLine}
                <br />
                <span className="text-accent">
                  THROUGH THE {season} OF {releaseYear}
                </span>
              </div>
            }
          >
            {transitDeity.toUpperCase()}
            <br />
            {verb.toUpperCase()} {natalLabel}
          </NaveHead>

          <div className="mx-auto max-w-[560px]">
            <div className="relative h-[3px] bg-rule-row">
              <span
                className="absolute left-0 top-0 h-[3px] bg-accent"
                style={{ width: `${fraction * 100}%` }}
              />
              <span
                className="absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 bg-accent"
                style={{ left: `${fraction * 100}%` }}
              />
            </div>
            <div className="mt-2 text-center font-mono text-data-xs tracking-label text-dim">
              {statusLine}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-6 text-left">
            <div>
              <SectionDivider label="WHAT IS CHANGING" />
              <p className="mt-3 text-pretty font-body text-prose-m leading-prose text-prose">
                {spine.changing} {changingClose}
              </p>
            </div>
            <div>
              <SectionDivider label="WHERE IT BEGINS" />
              <p className="mt-3 text-pretty font-body text-prose-m leading-prose text-prose">{beginsParagraph}</p>
            </div>
            <div>
              <SectionDivider label="WHAT IT TOUCHES" />
              <p className="mt-3 text-pretty font-body text-prose-m leading-prose text-prose">{touchesParagraph}</p>
            </div>
            <div>
              <SectionDivider label="WHAT IT LEAVES BEHIND" />
              <p className="mt-3 text-pretty font-body text-prose-m leading-prose text-prose">{spine.leaves[tone]}</p>
            </div>
          </div>

          <div className="mt-9">
            <Votive>{spine.votive[tone]}</Votive>
          </div>

          <div className="mt-4">
            <FeedbackRow readingId={`transit-${span.id}`} noun="READING" />
          </div>

          {receivedBody ? (
            <div className="mt-8">
              <ReceptionNote intro={`${transitDeity.toUpperCase()} IS A MODERN BODY. ${voice.receptionLine.toUpperCase()}`} />
            </div>
          ) : null}

          <div className="mt-9 flex justify-center gap-8 font-display text-[11.5px] tracking-[0.2em]">
            <Link href="/year" className="text-bone/65 hover:text-bone">
              ← THE YEAR
            </Link>
            <Link href="/forecast" className="text-bone/65 hover:text-bone">
              THE FORECAST
            </Link>
            <Link href="/transits" className="text-accent">
              ALL LONG TRANSITS →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
