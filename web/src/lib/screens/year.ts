import {
  findEclipses,
  findMajorTransits,
  findMoonPhases,
  findRetrogradeStations,
  findSolarReturn,
  findYearIngresses,
  SLOW_BODIES,
} from "@/lib/yearForecast";
import { buildAnnualReport, type AnnualReport } from "@/lib/annualReport";
import { buildSkyOnlyTimeline, yearVotive, yearVotiveTone } from "@/components/horizons/yearContent";
import { ingressSentence } from "@/components/horizons/seasonContent";
import type { SavedNatal } from "@/lib/savedNatal";
import type { Culture } from "@/data/cultures";
import { fmt, str } from "@/strings";
import { footerLinks } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/** The year is read over the 365 days from the instant. */
export const YEAR_DAYS = 365;

/** The Year screen's slots, the row tones web colours, and the annual report web lays out with a chart. */
export interface YearScreen {
  slots: SlotMap;
  rowTones: readonly ("conflict" | "dim")[];
  report: AnnualReport | null;
}

/** The reader's four natal points the year's long transits are read against. */
export function yearNatalPoints(natal: SavedNatal) {
  return [
    { key: "sun", longitude: natal.chart.sun },
    { key: "moon", longitude: natal.chart.moon },
    { key: "asc", longitude: natal.angles.ascendant },
    { key: "mc", longitude: natal.angles.midheaven },
  ];
}

/** The annual report for a birth record, read from `now`. */
export function buildYearReport(culture: Culture, now: Date, natal: SavedNatal): AnnualReport {
  return buildAnnualReport({
    now,
    natalName: natal.meta.name,
    culture,
    majorTransits: findMajorTransits(yearNatalPoints(natal), SLOW_BODIES, now, YEAR_DAYS),
    eclipses: findEclipses(now, YEAR_DAYS),
    retrogrades: findRetrogradeStations(now, YEAR_DAYS),
    solarReturn: findSolarReturn(natal.chart.sun, now),
  });
}

/**
 * The Year screen (board Glass-Year; table section "Year"). The timeline of
 * turnings (stations and slow-body ingresses, dated in `zone`) and its count
 * line print in both states; the count adds the window's moon quarters,
 * which year.countLine names as lunations. With a birth the votive follows
 * the annual report's dominant transit; without one the cast lines print.
 */
export function buildYearScreen(input: ScreenInput): YearScreen {
  const { culture, instant, zone, birth } = input;
  const stations = findRetrogradeStations(instant, YEAR_DAYS);
  const ingresses = findYearIngresses(instant, YEAR_DAYS, SLOW_BODIES);
  const lunations = findMoonPhases(instant, YEAR_DAYS).length;
  const timeline = buildSkyOnlyTimeline(culture, stations, ingresses);
  const report = birth ? buildYearReport(culture, instant, birth) : null;

  const ingressProse = new Map(
    ingresses.map((ing) => [
      `ingress-${ing.planet}-${ing.date.toISOString()}`,
      ingressSentence(culture, ing.planet, ing.toSign),
    ]),
  );

  const slots: SlotMap = {
    "year.kicker": str("year.kicker", culture, {
      date: fmt("date.dayMonthYear", instant, zone),
      institution: str("common.institution", culture),
    }),
    "year.title": str("year.title", culture, { roman: fmt("year.roman", Number(fmt("date.year", instant, zone))) }),
    "year.countLine": str("year.countLine", culture, { n: timeline.length + lunations }),
    "year.monthLabel": timeline.map((row, i) => {
      const month = fmt("date.monthYear", row.date, zone);
      const prev = timeline[i - 1];
      return !prev || fmt("date.monthYear", prev.date, zone) !== month ? str("year.monthLabel", culture, { date: month }) : "";
    }),
    "year.row.head": timeline.map((row) => row.label),
    "year.row.prose": timeline.map((row) => ingressProse.get(row.key) ?? ""),
    "year.today": str("year.today", culture, { date: fmt("date.dayMonth", instant, zone) }),
  };
  if (!birth) slots["year.noChart"] = [str("year.noChart.title", culture), str("year.noChart.link", culture)];
  if (report) slots["year.votive"] = yearVotive(culture, yearVotiveTone(report.yearTheme.dominantTransit?.aspectKind));
  slots["year.footer"] = footerLinks(["chrome.footer.backSeason", "chrome.footer.toForecast"]);

  return { slots, rowTones: timeline.map((r) => r.tone), report };
}

/** The Year screen's slots for `input`. */
export function buildYearModel(input: ScreenInput): SlotMap {
  return buildYearScreen(input).slots;
}
