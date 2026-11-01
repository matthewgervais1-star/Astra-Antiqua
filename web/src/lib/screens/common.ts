import type { Culture } from "@/data/cultures";
import type { MoonPhase } from "@/lib/moonPhase";
import { fmt, moonPhaseKey, str, text, type PlainKey } from "@/strings";

/** The feedback row's four printed parts (chrome.feedback.*), for a screen's noun. */
export function feedbackLines(noun: string): string[] {
  return [
    text("chrome.feedback.lead", { noun }),
    text("chrome.feedback.so"),
    text("chrome.feedback.notSo"),
    text("chrome.feedback.kept"),
  ];
}

/** The footer links, in printed order. */
export function footerLinks(keys: readonly PlainKey[]): string[] {
  return keys.map((k) => text(k));
}

/** The Moon's phase name and the next quarter's name, as the board prints them (common.moon.*). */
export function moonNames(culture: Culture, moon: MoonPhase): { phase: string; quarter: string } {
  return {
    phase: str(moonPhaseKey(moon.name), culture),
    quarter: str(moonPhaseKey(moon.nextQuarter.name), culture),
  };
}

/** The next quarter's date (date.dayMonthYear in the screen's zone). */
export function nextQuarterDate(moon: MoonPhase, zone: string): string {
  return fmt("date.dayMonthYear", moon.nextQuarter.date, zone);
}

/** Joins the stacked lines of one slot (see SlotMap). */
export function lines(...parts: readonly string[]): string {
  return parts.join("\n");
}

/** The reception note's fixed closing and its link (ReceptionNote.tsx prints both after the opening). */
export const RECEPTION_CLOSING = "THE OUTER PLANETS ARE AN EXTENSION MADE IN THE ANCIENT WAY; THE METHOD PAGE STATES IT PLAINLY →";
export const RECEPTION_LINK = "METHOD";

/** The reception note as it prints: the opening in capitals, the closing, the link. */
export function receptionNote(opening: string): string {
  return `${opening.toUpperCase()} ${RECEPTION_CLOSING} ${RECEPTION_LINK}`;
}
