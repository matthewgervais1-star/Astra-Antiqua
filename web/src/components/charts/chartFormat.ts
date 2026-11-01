import { fmt } from "@/strings/formats";

/**
 * The sign tables and the degree format live once, in strings/formats.ts:
 * SIGN_ABBR3 (F8, the placements table's three-letter codes, which Android's
 * ZodiacSignAbbrTest reads from that file), SIGN_PHRASES (the placement
 * headline's "IN THE FISHES"), and angle.degMin (F5).
 */
export { SIGN_ABBR3, SIGN_PHRASES as SIGN_PHRASE } from "@/strings/formats";

/** "13°22′" from a 0-30 degree-in-sign float (F5: degree unpadded, minutes two digits). */
export function formatDegMin(degreeInSign: number): string {
  return fmt("angle.degMin", degreeInSign);
}

/** "Tyre" out of "Tyre, Lebanon"; falls back to the whole label. */
export function cityShort(cityLabel: string): string {
  const first = cityLabel.split(",")[0]?.trim();
  return (first && first.length > 0 ? first : cityLabel).toUpperCase();
}
