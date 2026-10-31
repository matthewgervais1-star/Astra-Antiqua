import type { Culture } from "@/data/cultures";
import { ASPECT_GLYPH, orbMeasure, type DayFigure } from "@/lib/decree";
import { ScriptName } from "@/components/chrome/ScriptName";

/**
 * The evidence line, "RA △ NUT · 0°19′", with each god's name as a
 * ScriptName. Reads the same as lib/decree.ts composeEvidence, which stays
 * the plain-text form for the tests and every surface that needs a string.
 */
export function EvidenceLine({ culture, figure }: { culture: Culture; figure: DayFigure }) {
  return (
    <>
      <ScriptName culture={culture} planet={figure.a} upper /> {ASPECT_GLYPH[figure.kind]}{" "}
      <ScriptName culture={culture} planet={figure.b} upper /> · {orbMeasure(figure.orb)}
    </>
  );
}
