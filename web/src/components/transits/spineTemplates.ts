import type { Culture } from "@/data/cultures";

/**
 * The authored copy the /transits/[id] spine needs beyond TRANSIT_SPINE
 * (data/transitSpine.ts): the WHERE IT BEGINS closing cadence, the WHAT IS
 * CHANGING sentence appended when the natal point is the Ascendant or
 * Midheaven (no deity to cite), and the WHAT IT TOUCHES content for those
 * same two points (which have no whole-sign house of their own to read).
 * Every bank is five entries, one per culture's institutional register.
 */

/** Closes the "WHERE IT BEGINS" paragraph: a long transit is a term, not a
 *  mood, said in each institution's own vocabulary. The five once shared one
 *  clause shape ("A {noun} this long is not {verb}ed at one {noun}"), which is
 *  a fill, not a voice, so each now opens on a different move. */
export const WHERE_BEGINS_CADENCE: Readonly<Record<Culture, string>> = {
  egypt: "A weighing this long is not settled at one evening's scale. It is a season of evenings.",
  greece: "You will climb to the tripod more than once for this. The god unwinds a question this heavy one piece at a time.",
  canaan: "The council has not risen. It sits, it adjourns, it sits again, and the matter stays on the floor between sittings.",
  carthage: "Reckon this in sailing seasons, not in days. The entry is carried forward, ship after ship, until the balance is paid down.",
  rome: "One flight of birds does not close a prodigy of this size. The augurs keep the book open on it until the state has its answer.",
};

/**
 * Appended to TRANSIT_SPINE[culture][body].changing when the natal point is
 * the Ascendant or Midheaven, naming what is at stake without a deity to cite.
 * One shape per culture, and none of them the "It is set against your X, the
 * Y" appositive that all ten once used. Each is also kept clear of its
 * culture's TOUCHES_ASC / TOUCHES_MC below, since both render on one page.
 */
export const NATAL_POINT_CLOSING: Readonly<Record<Culture, { asc: string; mc: string }>> = {
  egypt: {
    asc: "Your rising sign goes on the pan here. Ma'at makes no allowance for a mask.",
    mc: "Your midheaven carries the weight here. The state wrote you down long before today.",
  },
  greece: {
    asc: "The god is being asked about your rising degree. That is the face you have to show.",
    mc: "The god is being asked about your midheaven. That is the office you are climbing toward.",
  },
  canaan: {
    asc: "Your rising sign is what stands up when your name is called.",
    mc: "Your midheaven is the seat the council has already entered in its record.",
  },
  carthage: {
    asc: "The posting is against your rising sign, the first line anyone reads about you.",
    mc: "The posting is against your midheaven, and half the harbor can read it.",
  },
  rome: {
    asc: "Rome reads this against your rising sign, which is the face and not the man behind it.",
    mc: "Rome reads this against your midheaven, and Rome keeps that reading where anyone can consult it.",
  },
};

/** Closes the WHAT IT TOUCHES paragraph for a sun/moon natal point, after
 *  houseReading()'s single sentence. Three of the five once ran "The
 *  {institution} does not {verb}", and two carried semicolon chains the
 *  cadence spec forbids. */
export const TOUCHES_REGISTER_LINE: Readonly<Record<Culture, string>> = {
  egypt: "The scale does not wait for you to notice which pan is loaded.",
  greece: "You get one answer to this question, and the oracle has no other version of it.",
  canaan: "The record closes when the matter is entered in it, and not before.",
  carthage: "The ledger keeps its own hours, and the harbor's convenience is not one of them.",
  rome: "The auspices are taken whether or not you attend to them.",
};

/** WHAT IT TOUCHES, full paragraph, when the natal point is the Ascendant:
 *  identity and approach, since the Ascendant is a face rather than a house.
 *  All five once opened "This transit works on the face you..." (the phrase
 *  TransitDetail's house branch also uses) and all five closed on "What
 *  {verb}s here {verb}s how every other {noun} is received", which is the
 *  reference engine's own trick. Neither survives here. */
export const TOUCHES_ASC: Readonly<Record<Culture, string>> = {
  egypt: "The face you carry into the hall is what this works on: your carriage, your body, the manner the door-keepers read before you have said a word. It is not a wash of paint laid on for one season. It is the plating itself, taken off and hammered flat again. The scale weighs the face first, every time, and only then calls for testimony.",
  greece: "The god sees you at the gate before he hears you: how you walk up, what you say first, the self a stranger reads before you have spoken. That is the part being remade. The oracle answers the question you carry in your posture as much as the one on your tongue, and every later answer of hers arrives through that face.",
  canaan: "The council reads the messenger before it reads the message. What is being remade here is the messenger: your first word, and the way you stand while you say it. Nothing you bring afterward is heard apart from it. The gate has a long memory for faces.",
  carthage: "Your credit reaches the precinct gate ahead of your cargo: the standing, the name the harbor masters know before they open the manifest. That is the account being re-entered now, line by line. Contracts get signed on that name for years after the ship has sailed.",
  rome: "Rome judges the man at the door before it hears his case. It is that man being re-cut here: your presence at first sight, the impression a stranger takes before your name is given. The presence is weighed first and the case second, in that order, every time.",
};

/** WHAT IT TOUCHES, full paragraph, when the natal point is the Midheaven:
 *  station and reputation, the public office rather than a private house.
 *  The old bank closed all five on "What is {verb}ed here is not the private
 *  {noun} but the public {noun}", one frame with the nouns swapped. */
export const TOUCHES_MC: Readonly<Record<Culture, string>> = {
  egypt: "Your office is at stake here, and an office is a public thing. The title you hold, the name the scribes set beside your deeds where it cannot be scraped off: the hall can see all of that. The hall cannot see the heart, and it is not the heart that goes on the scale.",
  greece: "What the city says about you is on the table: the office, the reputation, the name the herald reads aloud. You will not hear this answer first. The agora hears it, and then you hear it from them.",
  canaan: "The wider assembly holds you to an office, a standing, and a rank the gate remembers when it counts who arrived and in what order. A vow sworn in your own tent binds only you. This one was sworn in front of everybody.",
  carthage: "Your name on the city's rolls is the entry under review: the office, the rank the suffetes keep in the register, the standing the harbor recognizes before your ship is tied up. A private book gets corrected quietly. Nobody corrects this one without the whole quay watching.",
  rome: "The censor's hand is on your name. He writes your office and your rank where the whole order can see them, and the muster hears it read out. Your conscience is your own business. The record belongs to the Forum, and the Forum consults it.",
};
