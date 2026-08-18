import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * One-sentence institutional ruling for each aspect kind, in each culture's
 * own register: Rome's augury, Egypt's weighing, Greece's oracle, Canaan's
 * council, Carthage's ledger. 5 cultures x 5 aspect kinds = 25 rulings.
 */
export const ASPECT_RULINGS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  rome: {
    conjunction: "The auspice was taken once and it binds two names. Neither can act on it alone.",
    sextile: "The birds are favorable and no one has yet taken the auspice. A sign unclaimed confers no right to act.",
    square: "An objection is entered and the objector has standing. Every step of this goes forward under challenge.",
    trine: "The day stands fastus and the augury attached no condition. What is done under it holds.",
    opposition: "Two magistrates, one office. Each vetoes the other, and the day's business stands adjourned.",
  },
  egypt: {
    conjunction: "Two gods ride in one barque. Where the river carries it, it carries them both.",
    sextile: "A fair wind stands on the river. It moves only the boat that raises a sail.",
    square: "Isfet crossed the threshold of the hall. The pans come level again through labor, and the labor is yours.",
    trine: "Heart and feather agree and no hand touches the scale. Go on with the day; the hall asks you nothing.",
    opposition: "The two pans hang level, and neither falls. The scribe writes no verdict until one side descends.",
  },
  greece: {
    conjunction: "The tripod answers once for two gods. Nothing in the answer belongs to one more than the other.",
    sextile: "The shrine takes questions today. An unasked god has nothing to say to you.",
    square: "The price is named before the answer, and it is not small. Pay it, or ask nothing.",
    trine: "The oracle speaks before the question is finished. The god volunteered the answer.",
    opposition: "Delphi says one thing and Dodona the other. Both answers are true, and acting on one breaks the other.",
  },
  canaan: {
    conjunction: "The docket carries two names under a single heading. Whatever El decrees falls on the pair.",
    sextile: "Nothing reaches the council but by vow. Silence keeps the matter off the list.",
    square: "A witness rises against the matter. Nothing passes at this sitting that is not spoken against first.",
    trine: "No vow was made and the rains came anyway. The wadis are running full.",
    opposition: "Baal holds above and Mot holds below. El hears both and decrees nothing.",
  },
  carthage: {
    conjunction: "One manifest covers two cargoes. Profit or loss, the ledger no longer tells them apart.",
    sextile: "The harbor is open and a berth is held in your name. Nothing loads itself.",
    square: "Short weight turns up in the audit. Trade goes on, and a clerk watches every measure you make.",
    trine: "The sailing season opens and the ledger is clean. Nothing stands against your name in the precinct.",
    opposition: "Two merchants claim one cargo at the quay. The hold stays sealed and the season runs on without it.",
  },
};
