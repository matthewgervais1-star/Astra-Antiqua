import { PLANET_LABELS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";

/**
 * The deity name alone inside a culture's reading prose. The parenthetical
 * planet name that used to follow it ("Osiris (Pluto)") is a seam: inside the
 * reading the god is the subject, and the technical referent is already
 * carried by the ephemeris rails and the data tables, which show the glyph
 * and the classical name in every instrument. With no culture selected the
 * classical name is the only name there is.
 */
export function deityWithPlanet(culture: Culture | null, planet: Planet): string {
  if (!culture) return PLANET_LABELS[planet];
  return DEITY_MATRIX[culture][planet].name;
}
