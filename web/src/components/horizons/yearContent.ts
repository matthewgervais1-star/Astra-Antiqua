import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import type { AnnualQuarter } from "@/lib/annualReport";
import type { AspectKind } from "@/data/sampleChart";
import type { RetrogradeEvent, YearIngressEvent } from "@/lib/yearForecast";
import type { TransitSpan } from "@/lib/transitSpans";
import { arrowRange, formatDayMonth } from "@/components/horizons/format";
import { fmt, str } from "@/strings";

const DAY_MS = 86_400_000;

export interface YearSegment {
  label: string;
  dateRange: string;
  summary: string;
  status: string;
}

function statusFor(start: Date, end: Date, now: Date): string {
  if (now.getTime() < start.getTime()) return "COMING";
  if (now.getTime() > end.getTime()) return "DONE";
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1);
  const dayN = Math.min(totalDays, Math.max(1, Math.round((now.getTime() - start.getTime()) / DAY_MS) + 1));
  return `DAY ${dayN} / ${totalDays}`;
}

function summaryFor(q: AnnualQuarter): string {
  return q.events || q.narrative;
}

function mergeSummary(a: AnnualQuarter, b: AnnualQuarter): string {
  return [summaryFor(a), summaryFor(b)].filter(Boolean).join(" ");
}

function rangeOf(start: Date, end: Date): string {
  return arrowRange(formatDayMonth(start), formatDayMonth(end));
}

/**
 * Maps the annual report's four rolling 91-day quarters onto the culture's
 * yearStructure variant (docs/design/handoff content-additions.md §Surface
 * names): 4 quarters for Rome, 3 merged seasons for Egypt, 2 merged halves
 * for Canaan/Carthage, 4 festival-named quarters for Greece.
 */
export function buildYearSegments(
  culture: Culture,
  quarters: readonly AnnualQuarter[],
  now: Date,
): readonly YearSegment[] {
  const [q0, q1, q2, q3] = quarters;
  if (!q0 || !q1 || !q2 || !q3) return [];
  const structure = CULTURE_VOICES[culture].yearStructure;

  switch (structure) {
    case "quarters4": {
      const labels = ["VER", "AESTAS", "AUTUMNUS", "HIEMS"];
      return [q0, q1, q2, q3].map((q, i) => ({
        label: labels[i] ?? "",
        dateRange: rangeOf(q.startDate, q.endDate),
        summary: summaryFor(q),
        status: statusFor(q.startDate, q.endDate, now),
      }));
    }
    case "seasons3":
      return [
        {
          label: "AKHET · THE FLOOD",
          dateRange: rangeOf(q0.startDate, q0.endDate),
          summary: summaryFor(q0),
          status: statusFor(q0.startDate, q0.endDate, now),
        },
        {
          label: "PERET · THE SOWING",
          dateRange: rangeOf(q1.startDate, q2.endDate),
          summary: mergeSummary(q1, q2),
          status: statusFor(q1.startDate, q2.endDate, now),
        },
        {
          label: "SHEMU · THE HARVEST",
          dateRange: rangeOf(q3.startDate, q3.endDate),
          summary: summaryFor(q3),
          status: statusFor(q3.startDate, q3.endDate, now),
        },
      ];
    case "halvesRains":
      return [
        {
          label: "THE RAINS · BAAL RETURNED",
          dateRange: rangeOf(q0.startDate, q1.endDate),
          summary: mergeSummary(q0, q1),
          status: statusFor(q0.startDate, q1.endDate, now),
        },
        {
          label: "THE DRY · MOT HOLDS HIM",
          dateRange: rangeOf(q2.startDate, q3.endDate),
          summary: mergeSummary(q2, q3),
          status: statusFor(q2.startDate, q3.endDate, now),
        },
      ];
    case "halvesSea":
      return [
        {
          label: "MARE APERTUM · THE OPEN SEA",
          dateRange: rangeOf(q0.startDate, q1.endDate),
          summary: mergeSummary(q0, q1),
          status: statusFor(q0.startDate, q1.endDate, now),
        },
        {
          label: "MARE CLAUSUM · THE HAULED-UP MONTHS",
          dateRange: rangeOf(q2.startDate, q3.endDate),
          summary: mergeSummary(q2, q3),
          status: statusFor(q2.startDate, q3.endDate, now),
        },
      ];
    case "festivals": {
      const labels = ["LENAIA", "ANTHESTERIA TO THARGELIA", "PANATHENAIA", "THE MYSTERIES"];
      return [q0, q1, q2, q3].map((q, i) => ({
        label: labels[i] ?? "",
        dateRange: rangeOf(q.startDate, q.endDate),
        summary: summaryFor(q),
        status: statusFor(q.startDate, q.endDate, now),
      }));
    }
    default:
      return [];
  }
}

/** Two-line year votive, keyed by the dominant tone of the year's headline transit (year.votive.*). */
export function yearVotive(culture: Culture, tone: "harmony" | "tension" | "quiet"): string {
  return str(`year.votive.${tone}` as const, culture);
}

export function yearVotiveTone(kind: AspectKind | undefined): "harmony" | "tension" | "quiet" {
  if (!kind) return "quiet";
  return kind === "square" || kind === "opposition" ? "tension" : "harmony";
}

/** The honest opening paragraph for a chart-less reading of the year. */
export const SKY_ONLY_OPENING: Readonly<Record<Culture, string>> = {
  egypt: "This is the sky alone, without a chart to carry it. Cast one, and the year gains a thread the flood can follow.",
  greece: "This is the sky alone; no question has been asked of it yet. Cast a chart, and the oracle has something to answer.",
  canaan: "This is the sky alone; no matter has been brought before the council. Cast a chart, and the year has business to sit on.",
  carthage: "This is the sky alone; no cargo is entered against it. Cast a chart, and the ledger has an account to keep.",
  rome: "This is the sky alone, read without a chart to take the auspices for. Cast one, and the year has a subject.",
};

function natalKeyLabel(culture: Culture, key: string): string {
  if (key === "asc") return "YOUR ASCENDANT";
  if (key === "mc") return "YOUR MIDHEAVEN";
  return `YOUR NATAL ${DEITY_MATRIX[culture][key as Planet].name.toUpperCase()}`;
}

export function spanHeadline(culture: Culture, span: TransitSpan): string {
  const deity = DEITY_MATRIX[culture][span.transitPlanet].name.toUpperCase();
  const verb = ASPECT_VERBS[culture][span.aspectKind].toUpperCase();
  return `${deity} ${verb} ${natalKeyLabel(culture, span.natalKey)}`;
}

export interface SkyTimelineRow {
  key: string;
  date: Date;
  label: string;
  tone: "conflict" | "dim";
}

/** The sky-only fallback's timeline: retrograde stations and slow-body
 *  ingresses over the year ahead, with no personal layer. */
export function buildSkyOnlyTimeline(
  culture: Culture,
  stations: readonly RetrogradeEvent[],
  ingresses: readonly YearIngressEvent[],
): readonly SkyTimelineRow[] {
  const rows: SkyTimelineRow[] = [];
  for (const s of stations) {
    rows.push({
      key: `station-${s.planet}-${s.date.toISOString()}`,
      date: s.date,
      label: str(s.kind === "retrograde" ? "year.row.retrograde" : "year.row.direct", culture, {
        date: fmt("date.dayMonth", s.date, "local"),
        planet: fmt("planet.name", s.planet),
      }),
      tone: s.kind === "retrograde" ? "conflict" : "dim",
    });
  }
  for (const ing of ingresses) {
    rows.push({
      key: `ingress-${ing.planet}-${ing.date.toISOString()}`,
      date: ing.date,
      label: str("year.row.ingress", culture, {
        date: fmt("date.dayMonth", ing.date, "local"),
        planet: fmt("planet.name", ing.planet),
        sign: fmt("sign.full", ing.toSign),
      }),
      tone: "dim",
    });
  }
  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}
