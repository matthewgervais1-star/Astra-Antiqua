import {
  buildSeasonStandouts,
  getCurrentSeason,
  getSeasonEvents,
  getSeasonHouse,
} from "@/lib/season";
import {
  buildSeasonSkyRows,
  companionInSign,
  composeWhatIsChanging,
  composeWhatItLeavesBehind,
  composeWhatItTouchesNatal,
  composeWhatItTouchesSky,
  composeWhereItBegins,
  seasonHouseHeading,
  seasonVotive,
  seasonVotiveTone,
} from "@/components/horizons/seasonContent";
import { ZODIAC_SIGN_INFO } from "@/data/zodiacSigns";
import { fmt, str } from "@/strings";
import { footerLinks, lines } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/** The sky rows' tone, for the colour web gives each row's date (layout, not a slot). */
export type SeasonRowTone = "conflict" | "harmony" | "dim";

/** The Season screen's slots plus the row tones its web layout colours. */
export interface SeasonScreen {
  slots: SlotMap;
  rowTones: readonly SeasonRowTone[];
  /** The bar under the title: days remaining out of the season's days. */
  bar: { remaining: number; total: number };
}

/**
 * The Season screen (board Glass-Season; table section "Season"). Season
 * counts local calendar days (F2), so its dates read in `zone`. With a birth
 * the house block (THROUGH YOUR CHART, its heading and web's sentence) leads
 * the sections; without one, web's WHAT IT TOUCHES section and the cast line
 * take its place (Q2 ruling).
 */
export function buildSeasonScreen(input: ScreenInput): SeasonScreen {
  const { culture, instant, zone, birth } = input;
  const window = getCurrentSeason(instant);
  const events = getSeasonEvents(window, birth);
  const standouts = buildSeasonStandouts(culture, events, 2);
  const house = birth ? getSeasonHouse(birth, window.sign) : null;
  const blurb = ZODIAC_SIGN_INFO.find((s) => s.sign === window.sign)?.blurb;

  const slots: SlotMap = {
    "season.kicker": str("season.kicker", culture, {
      range: fmt("range.days", [window.start, window.end], zone),
      institution: str("common.institution", culture),
    }),
    "season.title": str("season.title", culture, { signPhrase: fmt("sign.phrase", window.sign) }),
    "season.dayLine": str("season.dayLine", culture, {
      n: window.dayOfSeason,
      total: window.totalDays,
      remaining: Math.max(0, window.totalDays - window.dayOfSeason),
    }),
  };
  if (blurb) slots["season.signProse"] = blurb;
  if (house) {
    slots["season.chart.label"] = str("season.chart.label", culture);
    slots["season.chart.houseHeading"] = seasonHouseHeading(culture, house);
    slots["season.chart.prose"] = composeWhatItTouchesNatal(culture, house);
  }

  const sections: string[] = [
    lines(str("season.section.changing", culture), composeWhatIsChanging(culture, standouts)),
    lines(str("season.section.begins", culture), composeWhereItBegins(culture, window, companionInSign(window, instant))),
  ];
  if (!house) sections.push(lines(str("season.section.touches", culture), composeWhatItTouchesSky(culture, events.ingresses)));
  sections.push(lines(str("season.section.leaves", culture), composeWhatItLeavesBehind(culture, window)));
  slots["season.sections"] = sections;

  slots["season.votive"] = seasonVotive(culture, seasonVotiveTone(standouts));
  slots["season.sky.label"] = str("season.sky.label", culture);
  const rows = buildSeasonSkyRows(culture, window, events);
  slots["season.sky.row"] = rows.map((row) => {
    const head = str("season.sky.row", culture, { date: fmt("date.dayMonthYear", row.date, zone), event: row.label });
    return row.prose ? lines(head, row.prose) : head;
  });
  if (!birth) slots["season.noChart"] = [str("season.noChart.line", culture), str("season.noChart.link", culture)];
  slots["season.footer"] = footerLinks([
    "chrome.footer.toDay",
    "chrome.footer.week",
    "chrome.footer.toYear",
    "chrome.footer.toTransits",
  ]);

  return {
    slots,
    rowTones: rows.map((r) => r.tone),
    bar: { remaining: window.daysRemaining, total: window.totalDays },
  };
}

/** The Season screen's slots for `input`. */
export function buildSeasonModel(input: ScreenInput): SlotMap {
  return buildSeasonScreen(input).slots;
}
