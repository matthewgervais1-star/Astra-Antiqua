import { buildDayModel } from "@/lib/screens/day";
import { buildWeekModel } from "@/lib/screens/week";
import { buildSeasonModel } from "@/lib/screens/season";
import { buildYearModel } from "@/lib/screens/year";
import { buildTransitsModel } from "@/lib/screens/transits";
import { buildChartModel } from "@/lib/screens/chart";
import { buildPlacementModel } from "@/lib/screens/placement";
import { buildTransitModel } from "@/lib/screens/transit";
import type { ScreenInput, ScreenName, SlotMap } from "@/lib/screens/types";

export type { ScreenInput, ScreenName, SlotMap } from "@/lib/screens/types";

/**
 * One pure builder per screen: the printed text of every slot the ruled table
 * lists for that screen, for one culture, instant, zone and birth record.
 * scripts/export-screen-goldens.mjs writes their output to
 * shared/goldens/screens/<screen>.json for the ports' golden tests.
 */
export const SCREEN_BUILDERS: Readonly<Record<ScreenName, (input: ScreenInput) => SlotMap>> = {
  day: buildDayModel,
  week: buildWeekModel,
  season: buildSeasonModel,
  year: buildYearModel,
  transits: buildTransitsModel,
  chart: buildChartModel,
  placement: buildPlacementModel,
  transit: buildTransitModel,
};

export {
  buildDayModel,
  buildWeekModel,
  buildSeasonModel,
  buildYearModel,
  buildTransitsModel,
  buildChartModel,
  buildPlacementModel,
  buildTransitModel,
};
