import { buildHomeBundle, type HomeBundle } from "@/components/home/buildHomeBundle";
import { fmt, str } from "@/strings";
import { feedbackLines, footerLinks, lines, moonNames, nextQuarterDate } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/**
 * The Day screen's slots (board Glass-Day; table section "Day") from a home
 * bundle already built for the same input. HomeBody builds the bundle once
 * and passes it here, so the page computes the sky once.
 */
export function dayModelFromBundle(bundle: HomeBundle, zone: string): SlotMap {
  const { culture, reading, moon, season, longTransit } = bundle;
  const { phase, quarter } = moonNames(culture, moon);
  const slots: SlotMap = {
    "day.kicker": str("day.kicker", culture, {
      date: bundle.dateLabel,
      institution: str("common.institution", culture),
    }),
    "day.headline": reading.headline,
  };
  if (reading.evidence) slots["day.evidence"] = reading.evidence;
  slots["day.paragraph"] = [...reading.paragraphs];
  slots["day.votive"] = bundle.votive;
  slots["day.sky.label"] = str("day.sky.label", culture);
  slots["day.sky.moon"] = lines(
    str("day.sky.moon.label", culture),
    str("day.sky.moon.line", culture, { phase, percent: fmt("percent", moon.illuminationFraction) }),
  );
  slots["day.sky.nextQuarter"] = lines(
    str("day.sky.nextQuarter", culture, { quarter }),
    str("day.sky.nextQuarter.date", culture, { date: nextQuarterDate(moon, zone) }),
  );
  slots["day.sky.season"] = lines(
    str("day.sky.season.label", culture),
    str("day.sky.season.line", culture, {
      sign: fmt("sign.full", season.sign),
      n: season.dayOfSeason,
      total: season.totalDays,
    }),
  );
  slots["day.sky.bar"] = [
    fmt("date.dayMonth", season.start, "UTC"),
    str("day.sky.bar.toGo", culture, { remaining: Math.max(0, season.totalDays - season.dayOfSeason) }),
    fmt("date.dayMonth", season.end, "UTC"),
  ];

  if (bundle.natal && bundle.pressureGroups) {
    slots["day.chart.label"] = str("day.chart.label", culture);
    slots["day.chart.row.sentence"] = bundle.pressureGroups.map((g) => g.sentence);
    slots["day.chart.row.data"] = bundle.pressureGroups.map((g) => g.data ?? "");
  }

  if ((longTransit.status === "active" || longTransit.status === "upcoming") && longTransit.title1 && longTransit.title2) {
    slots["day.longTransit.label"] = str("day.longTransit.label", culture);
    slots["day.longTransit.meta"] = str("day.longTransit.meta", culture, {
      status: str(longTransit.status === "active" ? "day.longTransit.open" : "day.longTransit.next", culture),
      range: longTransit.rangeLabel ?? "",
    });
    slots["day.longTransit.title"] = lines(longTransit.title1, longTransit.title2);
    if (longTransit.footerLabel) slots["day.longTransit.footer"] = longTransit.footerLabel;
    slots["day.longTransit.link"] = str("day.longTransit.link", culture);
  }

  slots["day.footer"] = footerLinks(["chrome.footer.toWeek", "chrome.footer.toSeason", "chrome.footer.toYear"]);
  slots["day.feedback"] = feedbackLines(str("day.feedback.noun", culture));
  return slots;
}

/** The Day screen's slots for `input`. */
export function buildDayModel(input: ScreenInput): SlotMap {
  return dayModelFromBundle(buildHomeBundle(input.culture, input.instant, input.birth), input.zone);
}
