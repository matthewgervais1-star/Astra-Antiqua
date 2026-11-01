import { isReceived, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { getHouseMeaning } from "@/data/houses";
import { longitudeToSign } from "@/data/sampleChart";
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { GLYPHS } from "@/glyphs";
import { buildGoverns, buildHowItShows, buildInSign, buildKeepInView } from "@/components/charts/placementCopy";
import { PLACEMENT_VOTIVES } from "@/components/charts/placementVotives";
import { fmt, str } from "@/strings";
import { lines, receptionNote } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/** A placement screen reads one body of the chart; the goldens read the Sun. */
export interface PlacementInput extends ScreenInput {
  body?: Planet;
}

/**
 * One placement (board Glass-Placement; table section "Placement"). The
 * sections print in the Q2 ruling's order, each label with the house title
 * under the house label; `placement.prose` holds one paragraph per section in
 * the same order. A received body adds web's reception line. With no birth
 * there is no placement to read and the model is empty.
 */
export function buildPlacementModel(input: PlacementInput): SlotMap {
  const { culture, birth } = input;
  const body = input.body ?? "sun";
  if (!birth) return {};
  const { sign, degree } = longitudeToSign(birth.chart[body]);
  const { ascendantSignIndex } = computeWholeSignHouses(birth.angles.ascendant);
  const house = houseOfSign(sign, ascendantSignIndex);
  const deity = DEITY_MATRIX[culture][body];

  const slots: SlotMap = {
    "placement.kicker": str("placement.kicker", culture, {
      planet: fmt("planet.name", body),
      sign: fmt("sign.full", sign),
      angle: fmt("angle.degMin", degree),
      roman: fmt("house.roman", house),
    }),
    "placement.title": lines(
      str("placement.title1", culture, { deity: deity.name.toUpperCase() }),
      str("placement.title2", culture, { signPhrase: fmt("sign.phrase", sign) }),
    ),
    "placement.epithet": str("placement.epithet", culture, {
      epithet: deity.epithet.toUpperCase(),
      glyphStatus: GLYPHS[culture][body].status.toUpperCase(),
    }),
    "placement.section.governs": str("placement.section.governs", culture),
    "placement.section.sign": str("placement.section.sign", culture, { sign: fmt("sign.full", sign) }),
    "placement.section.house": lines(
      str("placement.section.house", culture, { ordinal: fmt("ordinal.wordUpper", house) }),
      getHouseMeaning(house).title,
    ),
    "placement.section.keep": str("placement.section.keep", culture),
    "placement.prose": [
      buildGoverns(culture, body),
      buildInSign(body, sign),
      buildHowItShows(culture, body, house),
      buildKeepInView(body, sign),
    ],
  };
  if (isReceived(body)) slots["placement.received"] = receptionNote(CULTURE_VOICES[culture].receptionLine);
  slots["placement.votive"] = PLACEMENT_VOTIVES[culture](deity.name);
  return slots;
}
