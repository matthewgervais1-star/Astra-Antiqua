import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { longitudeToSign } from "@/data/sampleChart";
import type { TransitSpan } from "@/lib/transitSpans";
import { composeSpanFigure } from "@/lib/figureReading";
import { buildTimeline } from "@/lib/recurrence";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import {
  ASPECT_KIND_GLYPH,
  isPointPlanetKey,
  natalPointLabel,
  passStatusLine,
  seasonWord,
} from "@/components/transits/spanDisplay";
import { pickLongTransitSpan } from "@/components/home/buildHomeBundle";
import { readerSpans } from "@/lib/screens/transits";
import { fmt, str } from "@/strings";
import { footerLinks, lines } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/** A transit detail screen reads one span; the goldens read the one the Day's card reads. */
export interface TransitInput extends ScreenInput {
  span?: TransitSpan;
}

/** The natal side of the degrees line: "YOUR NATAL APOLLO" for the Sun or Moon, the point's label otherwise. */
export function natalSideLabel(input: Pick<ScreenInput, "culture">, span: Pick<TransitSpan, "natalKey">): string {
  return isPointPlanetKey(span.natalKey)
    ? `YOUR NATAL ${DEITY_MATRIX[input.culture][span.natalKey].name.toUpperCase()}`
    : natalPointLabel(input.culture, span.natalKey);
}

/**
 * One long transit (board Glass-Transit-detail; table section "Transit
 * detail"). The section and figure labels print in the screen's order; each
 * timeline cap is the tick's label over its year when the tick prints one.
 * With no birth, or no span to read, the model is empty.
 */
export function buildTransitModel(input: TransitInput): SlotMap {
  const { culture, instant, birth } = input;
  if (!birth) return {};
  const span = input.span ?? pickLongTransitSpan(readerSpans(birth, instant), instant)?.span;
  if (!span) return {};

  const deity = DEITY_MATRIX[culture][span.transitPlanet].name.toUpperCase();
  const natal = longitudeToSign(span.natalLongitude);
  const figure = composeSpanFigure(
    culture,
    span,
    { chart: birth.chart, ascendant: birth.angles.ascendant },
    computeGeocentricLongitude(span.transitPlanet, instant),
    instant,
  );
  const timeline = buildTimeline({ start: span.start, end: span.end }, instant, instant);

  return {
    "transit.kicker": str("transit.kicker", culture, { institution: str("common.institution", culture) }),
    "transit.headline": figure.headline,
    "transit.meta.title": str("transit.meta.title", culture, {
      deity,
      verb: ASPECT_VERBS[culture][span.aspectKind].toUpperCase(),
      natal: natalPointLabel(culture, span.natalKey),
    }),
    "transit.meta.degrees": str("transit.meta.degrees", culture, {
      deity,
      angleA: fmt("angle.degMin", span.transitDegree),
      signA: fmt("sign.full", span.transitSign),
      aspectGlyph: ASPECT_KIND_GLYPH[span.aspectKind],
      natal: natalSideLabel(input, span),
      angleB: fmt("angle.degMin", natal.degree),
      signB: fmt("sign.full", natal.sign),
    }),
    "transit.meta.release": str("transit.meta.release", culture, {
      season: seasonWord(span.end),
      year: span.end.getFullYear(),
    }),
    "transit.section.labels": [
      str("transit.section.changing", culture),
      str("transit.section.begins", culture),
      str("transit.section.touches", culture),
      str("transit.section.leaves", culture),
    ],
    "transit.figure.labels": [
      str("transit.figure.space", culture),
      str("transit.figure.whatIsThis", culture),
      str("transit.figure.tryThis", culture),
      str("transit.figure.lesson", culture),
      str("transit.figure.consider", culture),
      str("transit.figure.read", culture),
      str("transit.figure.keep", culture),
      str("transit.figure.you", culture),
    ],
    "transit.playsOut": figure.playsOutTitle,
    "transit.statusLine": passStatusLine(span, instant),
    "transit.timeline.caps": timeline.ticks.map((t) => (t.sub ? lines(t.label, t.sub) : t.label)),
    "transit.footer": footerLinks(["chrome.footer.backYear", "chrome.footer.forecast", "chrome.footer.toTransits"]),
  };
}
