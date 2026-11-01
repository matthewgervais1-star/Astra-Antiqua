import type { ScreenName } from "@/lib/screens/types";

/**
 * Each screen's slot keys, one per row of the ruled table
 * (docs/design/shared-strings-table-2026-11.md), in the table's order. The
 * table writes three Transit detail keys with a space (`transit.section
 * labels`); a slot key puts a dot there. Rows whose DEFAULT drops the slot
 * (`transits.group.behind`) have no key. A row slot in GROUPED_ROWS prints
 * one list per group heading, keyed `<slot>.<group>`, in place of the
 * table's one key. screens.test.ts reads the table and fails when this list
 * and the table differ.
 */
export const SCREEN_SLOTS: Readonly<Record<ScreenName, readonly string[]>> = {
  day: [
    "day.kicker",
    "day.headline",
    "day.evidence",
    "day.paragraph",
    "day.votive",
    "day.sky.label",
    "day.sky.moon",
    "day.sky.nextQuarter",
    "day.sky.season",
    "day.sky.bar",
    "day.chart.label",
    "day.chart.row.sentence",
    "day.chart.row.data",
    "day.longTransit.label",
    "day.longTransit.meta",
    "day.longTransit.title",
    "day.longTransit.footer",
    "day.longTransit.link",
    "day.footer",
    "day.feedback",
  ],
  week: [
    "week.kicker",
    "week.title",
    "week.countLine",
    "week.thesis",
    "week.moon",
    "week.row.weekday",
    "week.row.today",
    "week.row.headline",
    "week.row.line",
    "week.row.shorthand.aspect",
    "week.row.shorthand.ingress",
    "week.row.shorthand.quiet",
    "week.note",
    "week.votive",
    "week.footer",
  ],
  season: [
    "season.kicker",
    "season.title",
    "season.dayLine",
    "season.signProse",
    "season.chart.label",
    "season.chart.houseHeading",
    "season.chart.prose",
    "season.sections",
    "season.votive",
    "season.sky.label",
    "season.sky.row",
    "season.noChart",
    "season.footer",
  ],
  year: [
    "year.kicker",
    "year.title",
    "year.countLine",
    "year.monthLabel",
    "year.row.head",
    "year.row.prose",
    "year.today",
    "year.noChart",
    "year.votive",
    "year.footer",
  ],
  transits: [
    "transits.kicker",
    "transits.title",
    "transits.countLine",
    "transits.axis",
    "transits.group.open",
    "transits.group.ahead",
    "transits.row.title.open",
    "transits.row.data.open",
    "transits.row.title.ahead",
    "transits.row.data.ahead",
    "transits.row.link",
    "transits.empty.open",
    "transits.empty.ahead",
    "transits.loading",
  ],
  chart: [
    "chart.kicker",
    "chart.title",
    "chart.subline",
    "chart.birthLine",
    "chart.summary",
    "chart.section.bodies",
    "chart.section.received",
    "chart.row",
    "chart.legend",
    "chart.empty",
  ],
  placement: [
    "placement.kicker",
    "placement.title",
    "placement.epithet",
    "placement.section.governs",
    "placement.section.sign",
    "placement.section.house",
    "placement.section.keep",
    "placement.prose",
    "placement.received",
    "placement.votive",
  ],
  transit: [
    "transit.kicker",
    "transit.headline",
    "transit.meta.title",
    "transit.meta.degrees",
    "transit.meta.release",
    "transit.section.labels",
    "transit.figure.labels",
    "transit.playsOut",
    "transit.statusLine",
    "transit.timeline.caps",
    "transit.footer",
  ],
};

/**
 * Row slots the screen prints under group headings, with the groups in
 * printed order. The model holds one list per group (`transits.row.title.open`,
 * `transits.row.title.ahead`), so the goldens record which heading each row
 * sits under. A group with no rows has no list; its empty line prints instead.
 */
export const GROUPED_ROWS: Readonly<Record<string, readonly string[]>> = {
  "transits.row.title": ["open", "ahead"],
  "transits.row.data": ["open", "ahead"],
};

/** Slots a screen prints only without a birth record (the cast-a-chart lines). */
export const NO_CHART_ONLY: ReadonlySet<string> = new Set(["season.noChart", "year.noChart", "chart.empty"]);

/** Slots a screen prints only with a birth record. Every other slot prints in both states. */
export const CHART_ONLY: ReadonlySet<string> = new Set([
  "day.chart.label",
  "day.chart.row.sentence",
  "day.chart.row.data",
  "day.longTransit.label",
  "day.longTransit.meta",
  "day.longTransit.title",
  "day.longTransit.footer",
  "day.longTransit.link",
  "season.chart.label",
  "season.chart.houseHeading",
  "season.chart.prose",
  "year.votive",
  ...SCREEN_SLOTS.transits.filter((k) => k !== "transits.loading"),
  ...SCREEN_SLOTS.chart.filter((k) => k !== "chart.empty"),
  ...SCREEN_SLOTS.placement,
  ...SCREEN_SLOTS.transit,
]);

/**
 * Slots whose presence follows the sky as well as the birth record, with the
 * condition. The fixed golden cases need not reach them.
 */
export const CONDITIONAL: Readonly<Record<string, string>> = {
  "day.evidence": "absent on a quiet day (no figure in orb)",
  "day.longTransit.label": "absent when no span is open or ahead",
  "day.longTransit.meta": "absent when no span is open or ahead",
  "day.longTransit.title": "absent when no span is open or ahead",
  "day.longTransit.footer": "absent when no span is open or ahead",
  "day.longTransit.link": "absent when no span is open or ahead",
  "transits.row.title.open": "absent when no span is open",
  "transits.row.data.open": "absent when no span is open",
  "transits.row.title.ahead": "absent when no span is ahead",
  "transits.row.data.ahead": "absent when no span is ahead",
  "transits.empty.open": "present only when no span is open",
  "transits.empty.ahead": "present only when no span is ahead",
  "placement.received": "present only for a received body (Uranus, Neptune, Pluto)",
};
