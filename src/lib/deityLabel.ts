import { PLANET_LABELS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";

/**
 * Returns the deity name as the primary label with the classical planet name
 * in parentheses, for places in the UI where readers need both the cultural
 * mask and the technical referent. When no culture is selected, returns the
 * classical planet name alone.
 *
 * Examples:
 *   deityWithPlanet("greece", "mercury") -> "Hermes (Mercury)"
 *   deityWithPlanet("egypt",  "mars")    -> "Horus the Red (Mars)"
 *   deityWithPlanet(null,     "saturn")  -> "Saturn"
 */
export function deityWithPlanet(culture: Culture | null, planet: Planet): string {
  if (!culture) return PLANET_LABELS[planet];
  return `${DEITY_MATRIX[culture][planet].name} (${PLANET_LABELS[planet]})`;
}

/**
 * Returns just the deity name (or planet label when no culture). Used in
 * places where the parenthetical would be visual noise (display headlines,
 * the wheel tooltip, etc.).
 */
export function deityOnly(culture: Culture | null, planet: Planet): string {
  if (!culture) return PLANET_LABELS[planet];
  return DEITY_MATRIX[culture][planet].name;
}
