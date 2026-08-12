import type { Culture } from "@/data/cultures";

/**
 * The authored copy the /transits/[id] spine needs beyond TRANSIT_SPINE
 * (data/transitSpine.ts): the WHERE IT BEGINS closing cadence, the WHAT IS
 * CHANGING sentence appended when the natal point is the Ascendant or
 * Midheaven (no deity to cite), and the WHAT IT TOUCHES content for those
 * same two points (which have no whole-sign house of their own to read).
 * Every bank is five entries, one per culture's institutional register.
 */

/** Closes the "WHERE IT BEGINS" paragraph, the shape of the mock's "A
 *  reading this long is not a mood. It is a term." in each institution's
 *  own vocabulary. */
export const WHERE_BEGINS_CADENCE: Readonly<Record<Culture, string>> = {
  egypt: "A weighing this long is not settled at one evening's scale. It is a season of evenings.",
  greece: "A question this long is not answered on one visit to the tripod. It takes the whole cycle of consultations.",
  canaan: "A sitting this long is not closed at one gathering of the council. It runs to the seventh day and beyond.",
  carthage: "An entry this long is not closed in one season's ledger. It carries forward until the account is paid.",
  rome: "A prodigy this long is not read from a single flight of birds. It stands until the augurs close the book on it.",
};

/**
 * Appended to TRANSIT_SPINE[culture][body].changing when the natal point is
 * the Ascendant or Midheaven, naming what is at stake without a deity to cite.
 */
export const NATAL_POINT_CLOSING: Readonly<Record<Culture, { asc: string; mc: string }>> = {
  egypt: {
    asc: "It is set against your rising sign, the mask you first show the scale.",
    mc: "It is set against your midheaven, the office recorded in the register of the state.",
  },
  greece: {
    asc: "It is set against your rising degree, the face you must show.",
    mc: "It is set against your midheaven, the office you are climbing toward.",
  },
  canaan: {
    asc: "It is set against your rising sign, the face you bring before the council.",
    mc: "It is set against your midheaven, the seat the council has entered in its record.",
  },
  carthage: {
    asc: "It is set against your rising sign, the face you present at the gate of the precinct.",
    mc: "It is set against your midheaven, the office entered on the city's rolls.",
  },
  rome: {
    asc: "It is set against your rising sign, the face you present to the augur.",
    mc: "It is set against your midheaven, the office the censor has recorded.",
  },
};

/** Closes the WHAT IT TOUCHES paragraph for a sun/moon natal point, after
 *  houseReading()'s single sentence. */
export const TOUCHES_REGISTER_LINE: Readonly<Record<Culture, string>> = {
  egypt: "The scale does not wait for you to notice which pan is loaded.",
  greece: "The oracle does not repeat herself; this is the only answer you get to this question.",
  canaan: "The council does not adjourn until the matter is entered in the record.",
  carthage: "The ledger keeps its own hours; it does not wait for the harbor to be convenient.",
  rome: "The auspices are taken whether or not you attend to them.",
};

/** WHAT IT TOUCHES, full paragraph, when the natal point is the Ascendant:
 *  identity and approach, since the Ascendant is a face rather than a house. */
export const TOUCHES_ASC: Readonly<Record<Culture, string>> = {
  egypt: "This transit works on the face you carry into the hall: your bearing, your body, the manner the door-keepers read before you have said a word. It is not a mood laid on for a season; it is the mask itself being reworked, plate by plate. What the scale weighs first is always the face, before it hears a single word from you.",
  greece: "This transit works on the face you show at the gate of the shrine: your bearing, your first approach, the self a stranger reads before you have spoken. The oracle answers the question you carry in your posture as much as the one on your tongue. What changes here changes how every other answer of hers is received.",
  canaan: "This transit works on the face you bring before the assembled council: your bearing, your first word, the self that stands to be counted before the matter is even named. The council reads the messenger before it reads the message. What shifts here decides how every other petition of yours is heard.",
  carthage: "This transit works on the face you present at the gate of the precinct: your bearing, your credit before a word of business is spoken, the reputation that arrives ahead of the cargo. The harbor masters read this face before they read the manifest. What is reworked here changes every contract that follows.",
  rome: "This transit works on the face you present to the augur before the auspices are even taken: your bearing, your standing at first sight, the presence a stranger reads before your name is given. Rome judges the man at the door before it hears his case. What is remade here changes how every later petition is received.",
};

/** WHAT IT TOUCHES, full paragraph, when the natal point is the Midheaven:
 *  station and reputation, the public office rather than a private house. */
export const TOUCHES_MC: Readonly<Record<Culture, string>> = {
  egypt: "This transit works on your standing before the wider court: the office you hold, the name entered beside your deeds in the record the scribes will keep. What is weighed here is not the private heart but the public measure, the rank the whole hall can see.",
  greece: "This transit works on your station in the city's eye: the office, the reputation, the name the herald reads aloud. What is tested here is not the private oracle but the public one, the answer the whole agora hears.",
  canaan: "This transit works on your seat in the eyes of the wider assembly: the office, the standing, the name the gate remembers when it counts who arrived and in what rank. What moves here is not the private vow but the public one, sworn before witnesses.",
  carthage: "This transit works on your standing on the city's rolls: the office, the rank entered in the register the suffetes keep, the name the harbor recognizes before your ship has even docked. What is audited here is not the private ledger but the public one.",
  rome: "This transit works on your standing before the state: the office, the rank the censor enters on the rolls, the name read out at the muster. What is reviewed here is not the private conscience but the public record, the one the whole Forum can consult.",
};
