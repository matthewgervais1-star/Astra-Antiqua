import { computeTransitSpans, type SpanNatalPoint, type TransitSpan } from "@/lib/transitSpans";
import { SLOW_BODIES } from "@/lib/yearForecast";
import type { SavedNatal } from "@/lib/savedNatal";
import type { Culture } from "@/data/cultures";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { DEITY_MATRIX } from "@/data/deities";
import { natalPointLabel, spanTone } from "@/components/transits/spanDisplay";
import { SPAN_TONE_WORDS } from "@/strings/formats";
import { fmt, str } from "@/strings";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

const DAY_MS = 86_400_000;
/** The span walk starts this many days before the instant, so spans already open are found. */
export const SPAN_LOOKBACK_DAYS = 420;
/** And covers this many days in all. */
export const SPAN_WINDOW_DAYS = 1200;

/**
 * Every long-transit span (the slow bodies against Sun, Moon, Ascendant and
 * Midheaven) in the window around `now`. Expensive: the walk samples the
 * outer bodies every 8 days across four natal points.
 */
export function readerSpans(natal: SavedNatal, now: Date): readonly TransitSpan[] {
  const natalPoints: SpanNatalPoint[] = [
    { key: "sun", longitude: natal.chart.sun },
    { key: "moon", longitude: natal.chart.moon },
    { key: "asc", longitude: natal.angles.ascendant },
    { key: "mc", longitude: natal.angles.midheaven },
  ];
  return computeTransitSpans(natalPoints, SLOW_BODIES, new Date(now.getTime() - SPAN_LOOKBACK_DAYS * DAY_MS), SPAN_WINDOW_DAYS);
}

/** The spans open at `now` and those still ahead, each in the window's order. */
export function groupSpans(spans: readonly TransitSpan[], now: Date): { open: TransitSpan[]; ahead: TransitSpan[] } {
  const t = now.getTime();
  return {
    open: spans.filter((s) => s.start.getTime() <= t && t <= s.end.getTime()),
    ahead: spans.filter((s) => s.start.getTime() > t),
  };
}

/** One row's title and data line (transits.row.title, transits.row.data). */
export function spanRowText(culture: Culture, span: TransitSpan, now: Date, zone: string): { title: string; data: string } {
  const ahead = span.passes.filter((p) => p.getTime() > now.getTime()).length;
  const range = fmt("range.months", [span.start, span.end], zone);
  const tone = SPAN_TONE_WORDS[spanTone(span)];
  return {
    title: str("transits.row.title", culture, {
      deity: DEITY_MATRIX[culture][span.transitPlanet].name.toUpperCase(),
      verb: ASPECT_VERBS[culture][span.aspectKind].toUpperCase(),
      natal: natalPointLabel(culture, span.natalKey),
    }),
    data:
      ahead > 0
        ? str("transits.row.data", culture, { range, exact: span.passes.length, ahead, tone })
        : str("transits.row.dataNoAhead", culture, { range, exact: span.passes.length, tone }),
  };
}

/**
 * The long transits index (board Glass-Transits; table section "Transits").
 * Rows run open first, then ahead; `transits.row.*` hold one entry per row in
 * that order, and the open group's rows are the first `open` entries. With no
 * birth the screen prints only its loading line (web shows its cast prompt,
 * which has no catalog slot yet).
 */
export function transitsModelFromSpans(input: ScreenInput, spans: readonly TransitSpan[]): SlotMap {
  const { culture, instant, zone } = input;
  const slots: SlotMap = {};
  if (input.birth) {
    const { open, ahead } = groupSpans(spans, instant);
    const listed = [...open, ...ahead];
    slots["transits.kicker"] = str("transits.kicker", culture);
    slots["transits.title"] = str("transits.title", culture);
    if (listed.length > 0) {
      const first = listed.reduce((m, s) => (s.start < m ? s.start : m), listed[0]!.start);
      const last = listed.reduce((m, s) => (s.end > m ? s.end : m), listed[0]!.end);
      slots["transits.countLine"] = str("transits.countLine", culture, {
        count: fmt("count.word", listed.length),
        range: fmt("range.months", [first, last], zone),
      });
      const years: string[] = [];
      for (let y = Number(fmt("date.year", first, zone)); y <= Number(fmt("date.year", last, zone)); y += 1) {
        years.push(str("transits.axis", culture, { yyyy: y }));
      }
      slots["transits.axis"] = years;
    }
    slots["transits.group.open"] = str("transits.group.open", culture);
    slots["transits.group.ahead"] = str("transits.group.ahead", culture);
    if (listed.length > 0) {
      const rows = listed.map((s) => spanRowText(culture, s, instant, zone));
      slots["transits.row.title"] = rows.map((r) => r.title);
      slots["transits.row.data"] = rows.map((r) => r.data);
      slots["transits.row.link"] = str("transits.row.link", culture);
    }
    if (open.length === 0) slots["transits.empty.open"] = str("transits.empty.open", culture);
    if (ahead.length === 0) slots["transits.empty.ahead"] = str("transits.empty.ahead", culture);
  }
  slots["transits.loading"] = str("transits.loading", culture);
  return slots;
}

/** The long transits index's slots for `input`. */
export function buildTransitsModel(input: ScreenInput): SlotMap {
  return transitsModelFromSpans(input, input.birth ? readerSpans(input.birth, input.instant) : []);
}
