import { PLANETS } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign } from "@/data/sampleChart";
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { computeMotion } from "@/lib/motion";
import { buildReading } from "@/lib/reading";
import { cityShort } from "@/components/charts/chartFormat";
import { fmt, str } from "@/strings";
import { lines } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/** A saved birth date ("1990-01-15") as noon UTC, so date.dayMonthYear prints it unshifted. */
export function birthDay(isoDate: string): Date {
  const [y = 1970, m = 1, d = 1] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/**
 * The chart (board Glass-Chart; table section "Chart"). Each `chart.row`
 * entry is one body in PLANETS order: the deity, then the position line
 * (planet, sign, angle, R when retrograde), then the house numeral. With no
 * birth the screen prints its empty state only.
 */
export function buildChartModel(input: ScreenInput): SlotMap {
  const { culture, birth } = input;
  if (!birth) {
    return { "chart.empty": [str("chart.empty.title", culture), str("chart.empty.cta", culture), str("chart.empty.note", culture)] };
  }
  const asc = longitudeToSign(birth.angles.ascendant);
  const { ascendantSignIndex } = computeWholeSignHouses(birth.angles.ascendant);
  return {
    "chart.kicker": str("chart.kicker", culture),
    "chart.title": str("chart.title", culture),
    "chart.subline": str("chart.subline", culture, {
      name: birth.meta.name.toUpperCase(),
      sign: fmt("sign.full", asc.sign),
      angle: fmt("angle.degMin", asc.degree),
    }),
    // The birth's own clock time and date, as the reader entered them.
    "chart.birthLine": str("chart.birthLine", culture, {
      city: cityShort(birth.meta.cityLabel),
      date: fmt("date.dayMonthYear", birthDay(birth.meta.date), "UTC"),
      time: birth.meta.time,
    }),
    "chart.summary": buildReading(culture, birth.chart).summary,
    "chart.section.bodies": str("chart.section.bodies", culture),
    "chart.section.received": str("chart.section.received", culture),
    "chart.row": PLANETS.map((planet) => {
      const { sign, degree } = longitudeToSign(birth.chart[planet]);
      const slots = { planet: fmt("planet.name", planet), sign: fmt("sign.full", sign), angle: fmt("angle.degMin", degree) };
      const retrograde = computeMotion(planet, birth.birth.utcDate) === "retrograde";
      return lines(
        DEITY_MATRIX[culture][planet].name.toUpperCase(),
        str(retrograde ? "chart.row.positionRetrograde" : "chart.row.position", culture, slots),
        str("chart.row.house", culture, { roman: fmt("house.roman", houseOfSign(sign, ascendantSignIndex)) }),
      );
    }),
    "chart.legend": [
      str("chart.legend.conflict", culture),
      str("chart.legend.harmony", culture),
      str("chart.legend.wheel", culture),
      str("chart.legend.received", culture),
      str("chart.legend.method", culture),
    ],
  };
}
