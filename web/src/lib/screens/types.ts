import type { Culture } from "@/data/cultures";
import type { SavedNatal } from "@/lib/savedNatal";

/**
 * What every screen model reads: the culture, the instant the screen is read
 * at, the zone its local days count in, and the reader's birth record (null
 * with no chart).
 *
 * The zone must be the runtime's own zone: the composition code under the
 * models counts local days with Date's local getters, and the models format
 * their local slots in `zone`. Web passes localZone(); the goldens exporter
 * sets process.env.TZ to the case's zone before it builds the case.
 */
export interface ScreenInput {
  culture: Culture;
  instant: Date;
  zone: string;
  birth: SavedNatal | null;
}

/**
 * A screen's printed text, keyed by the slot keys of the ruled table
 * (docs/design/shared-strings-table-2026-11.md), one key per table row.
 *
 * - A string is one printed line or block. "\n" separates the lines of a
 *   slot the table draws as stacked lines (`MOON` over `WAXING GIBBOUS · 74% LIT`).
 * - A string[] is a list: the screen's rows, sections or links, in printed
 *   order. A row slot (`week.row.line`, `chart.row`) holds one entry per row,
 *   aligned with the screen's other row slots; an entry is "" where that row
 *   prints nothing in the slot.
 * - A slot the screen does not print in this state (a chart slot with no
 *   birth, an empty-group line when the group has rows) is absent. No slot
 *   is ever "".
 */
export type SlotMap = Record<string, string | string[]>;

export type ScreenName = "day" | "week" | "season" | "year" | "transits" | "chart" | "placement" | "transit";
