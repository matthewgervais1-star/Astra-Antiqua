import type { Culture, Planet } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";
import type { SlowBody } from "@/data/transitSpine";

/**
 * The figure page's banks: what a reader opens from a day or a long transit,
 * read for one figure. Composed by lib/figureReading.ts into the anatomy of
 * docs/superpowers/specs/2026-09-29-daily-reading-voice.md, section B:
 *
 *   headline        fast bodies reuse DECREE_BANKS.headlines; a long
 *                   transit (a slow body against a natal point) reads
 *                   SLOW_HEADLINES, per (kind, slow body)
 *   move one        the natal placement in the culture's frame (NATAL_FRAME
 *                   over PLANET_IN_SIGN), the angle line for a rising or a
 *                   midheaven (ANGLE_MOVE_ONE), or, with no chart, the
 *                   transiting god in its sign (SKY_MOVE_ONE)
 *   space           the decomposed sentence: two domains joined by
 *                   SHORT_RELATIONS, each part tagged in mono
 *   recurrence      RECURRENCE_FRAME around lib/recurrence.ts's interval
 *   plays out       PLAYS_OUT_TITLE, the god's act, then four MANIFESTATIONS
 *   try this        TRY_THIS, per transiting body, every card sourced
 *   the lesson      LESSONS, per kind
 *
 * Plain strings with named slots, so the Android generator carries them
 * across without parsing code. No sentence repeats across two cultures.
 */

/** One "try this" card: an attested object, text or rite, with where it is attested. */
export interface TryThisCard {
  kind: "consider" | "read" | "keep";
  /** What to look at, read or keep, in one line. */
  title: string;
  /** Where it is attested: a collection number, an edition, a passage. */
  source: string;
}

/** The four house groups' manifestations for one tone, four items each. */
export interface ManifestationsByTone {
  harmony: readonly [string, string, string, string];
  tension: readonly [string, string, string, string];
}

export interface FigureBank {
  /** A long transit's headline, per (kind, slow body): one sentence to the reader. */
  slowHeadlines: Readonly<Record<AspectKind, Readonly<Record<SlowBody, string>>>>;
  /**
   * The middle of the decomposed sentence, joining a subject domain to an
   * object domain. Each opens on a modal (can, must, will, cannot), which does
   * not inflect, so it reads after "your letters" and after "your day's work".
   */
  shortRelations: Readonly<Record<AspectKind, string>>;
  /**
   * Move one for a reader with a chart: the natal placement, then a colon,
   * then one sentence of PLANET_IN_SIGN in the second person. Slots: {deity},
   * {sign}, {clause}.
   */
  natalFrame: string;
  /**
   * Rome alone has a second frame: when the clause opens on "you", the
   * reference's own shape, "As {deity} in the {sign}, you ...". Empty for the
   * other cultures.
   */
  natalFrameYou: string;
  /** Move one with no chart: the transiting god in its sign and the domain it keeps. Slots: {god}, {sign}, {domain}. */
  skyMoveOne: string;
  /** Move one for a long transit to the rising or the midheaven. Slot: {sign}. */
  angleMoveOne: Readonly<Record<"asc" | "mc", string>>;
  /** What the rising and the midheaven govern, for the decomposed sentence and move two. */
  angleDomains: Readonly<Record<"asc" | "mc", string>>;
  /** "This figure ... {interval}." Slot: {interval}, from lib/recurrence.ts. */
  recurrenceFrame: string;
  /** The "how this plays out" section title, uppercase. */
  playsOutTitle: string;
  /**
   * A long transit's act line under that title, per slow body: the god at
   * work in the institution. A day's figure uses the decree's image instead.
   * Slot: {god}, the only god it names; it claims nothing about the sky.
   */
  slowActs: Readonly<Record<SlowBody, string>>;
  /**
   * Four concrete manifestations per (house group, tone). The group is the
   * natal point's whole-sign house group when the reader has a chart, and
   * the partner body's domain group when not (lib/figureReading.ts,
   * DOMAIN_GROUP). One bank serves both: an item names something that
   * happens in that part of a life, whichever way the group was found.
   */
  manifestations: readonly [ManifestationsByTone, ManifestationsByTone, ManifestationsByTone, ManifestationsByTone];
  /** Up to three cards per transiting body: consider, read, keep. Fewer where nothing attested fits. */
  tryThis: Readonly<Record<Planet, readonly TryThisCard[]>>;
  /** The closing reflection per kind: two sentences, no comfort. Slot: {god}, the only god it may name. */
  lessons: Readonly<Record<AspectKind, string>>;
}

export const FIGURE_BANKS: Readonly<Record<Culture, FigureBank>> = {
  egypt: {
    slowHeadlines: {
      conjunction: {
        jupiter: "Build the granary wider, because this year's flood runs high.",
        saturn: "Dig down to bedrock before you raise one more wall.",
        uranus: "Your old way of doing things goes out with this flood.",
        neptune: "Keep your feet on the dike while the water covers the fields.",
        pluto: "Open the sealed storeroom and look at what you put there.",
      },
      sextile: {
        jupiter: "Ask the temple for the larger plot, and you will get it.",
        saturn: "Lay one course of mudbrick a day and the wall goes up.",
        uranus: "Take the boat that is leaving for the next nome.",
        neptune: "Tell your dreams to the scribe each morning before they fade.",
        pluto: "Clear out one old storeroom and the house breathes again.",
      },
      square: {
        jupiter: "Measure the harvest before you promise any of it away.",
        saturn: "The wall you built on sand has to come down.",
        uranus: "The canal you dug is changing course, and nobody can stop it.",
        neptune: "Check every measure twice while the river runs high and muddy.",
        pluto: "Something you buried long ago is coming up with the silt.",
      },
      trine: {
        jupiter: "Plant the second field, since the river is generous this year.",
        saturn: "Carve your name on the stone while your hand is steady.",
        uranus: "Change the line of your canal, and the land drinks.",
        neptune: "Spend your evenings at the temple and sleep well after.",
        pluto: "Give the old grain to the poor and keep the seed.",
      },
      opposition: {
        jupiter: "Your patron wants a share of the harvest you grew.",
        saturn: "The tax assessor stands on the far bank with his measuring rope.",
        uranus: "A neighbor over the water is moving your boundary stone.",
        neptune: "The field on the other bank looks richer than it is.",
        pluto: "An old claim on your house comes over the river.",
      },
    },
    shortRelations: {
      conjunction: "cannot be parted from",
      sextile: "can lean on",
      square: "must haul against",
      trine: "can ride the current with",
      opposition: "must stare across the water at",
    },
    natalFrame: "Your birth set {deity} in the {sign}: {clause}.",
    natalFrameYou: "",
    skyMoveOne: "{god} is in the {sign}, weighing {domain}.",
    angleMoveOne: {
      asc: "The {sign} stood on the eastern horizon when you were born: it is the face you show at the door.",
      mc: "The {sign} stood overhead when you were born: the nome ranks you by it.",
    },
    angleDomains: {
      asc: "the face you show at the door",
      mc: "your rank in the nome",
    },
    recurrenceFrame: "This figure comes round on the river again {interval}.",
    playsOutTitle: "HOW THIS PLAYS OUT ON THE RIVER",
    slowActs: {
      jupiter: "{god} sends the flood a cubit higher, and the granary scribes call for more jars.",
      saturn: "{god} lies still under the field, and the surveyor walks the old boundary again.",
      uranus: "{god} spreads her body over the roof beams, and the old plaster comes down.",
      neptune: "{god} wells up under the fields, and the boundary stones go under water.",
      pluto: "{god} sits in judgment in the lower hall, and the scribe reads out what you buried.",
    },
    manifestations: [
      {
        harmony: [
          "a ration of emmer measured out in full",
          "the overseer passing your row without a word",
          "a jar of oil left over at the month's end",
          "your tally matching the scribe's at the first count",
        ],
        tension: [
          "a short measure at the granary door",
          "the overseer counting your bricks twice",
          "a debt of grain you forgot you owed",
          "a sledge rope fraying halfway to the site",
        ],
      },
      {
        harmony: [
          "bread and beer shared on the roof at dusk",
          "a mother's name said kindly at the table",
          "the offering table for the ancestors swept and set",
          "a child who sleeps through the night",
        ],
        tension: [
          "an old argument over the family field",
          "the lamp in the ancestor's niche gone out",
          "a brother asking for his share again",
          "a house too small for everyone in it",
        ],
      },
      {
        harmony: [
          "a letter that arrives before you looked for it",
          "the ferryman waving you aboard without the fee",
          "a neighbor who carries your message across",
          "a contract read once and sealed",
        ],
        tension: [
          "a letter answered in the wrong tone",
          "a boat that leaves the bank without you",
          "a witness who remembers the words differently",
          "the same question put to you three times",
        ],
      },
      {
        harmony: [
          "an hour alone with the door shut",
          "a dream you remember clearly at waking",
          "incense that burns down evenly",
          "a vow you keep without anyone watching",
        ],
        tension: [
          "a sleepless hour before the dawn hymn",
          "a secret that sits heavy in the chest",
          "an amulet worn once and then forgotten",
          "a fear you cannot put a name to",
        ],
      },
    ],
    tryThis: {
      sun: [
        { kind: "consider", title: "The obelisk of Thutmose III, a sun monument from Ra's own city.", source: "Raised at Heliopolis about 1450 BCE, now in Central Park, New York." },
        { kind: "read", title: "The hymns to the rising sun in the Papyrus of Ani.", source: "Book of the Dead, spell 15, British Museum EA 10470." },
        { kind: "keep", title: "Greet the sun at dawn with both hands raised.", source: "The adoration pose of the stelophorous statues and the spell 15 vignettes." },
      ],
      moon: [
        { kind: "consider", title: "The temple of Khonsu at Karnak, his own house in Thebes.", source: "Karnak, begun under Ramesses III, finished by the high priests of Amun." },
        { kind: "read", title: "The Bentresh Stela, where Khonsu's image travels abroad to cure a princess.", source: "Louvre C 284." },
        { kind: "keep", title: "Begin the month on the morning the old crescent can no longer be seen.", source: "Richard Parker, The Calendars of Ancient Egypt (1950), on the temple lunar month." },
      ],
      mercury: [
        { kind: "consider", title: "The was-sceptre with the Set-animal's head, the god's own finial.", source: "Gardiner sign S40, and docs/design/deity-glyphs.md on the Seth-specific head." },
        { kind: "read", title: "The Contendings of Horus and Seth, the quarrel argued before the gods.", source: "Papyrus Chester Beatty I, Chester Beatty Library, Dublin." },
        { kind: "keep", title: "Copy one model letter twice, the way the student scribes did.", source: "The Late Egyptian Miscellanies, edited by Alan Gardiner (1937)." },
      ],
      venus: [
        { kind: "consider", title: "The throne sign that spells Isis's name and sits on her head.", source: "Gardiner sign Q1, attested in docs/design/deity-glyphs.md." },
        { kind: "read", title: "The songs Isis and Nephthys sing over Osiris.", source: "Papyrus Bremner-Rhind, British Museum EA 10188." },
        { kind: "keep", title: "Wear a tyet knot, the amulet called the blood of Isis.", source: "Book of the Dead, spell 156, for the tyet of red jasper." },
      ],
      mars: [
        { kind: "consider", title: "The round zodiac of Dendera, where the planets stand among the stars.", source: "Louvre D 38, read in Neugebauer and Parker, Egyptian Astronomical Texts III." },
        { kind: "read", title: "The Triumph of Horus, the harpoon drama on the Edfu temple wall.", source: "Edfu, enclosure wall, translated by Blackman and Fairman (1942 to 1944)." },
        { kind: "keep", title: "Wear a wedjat eye, the commonest charm in Egyptian graves.", source: "Flinders Petrie, Amulets (1914), on the faience wedjat." },
      ],
      jupiter: [
        { kind: "consider", title: "The ram-headed sphinxes that line Amun's avenue at Karnak.", source: "Karnak, the western dromos of the Amun precinct." },
        { kind: "read", title: "The Leiden hymns, a cycle of praises to Amun.", source: "Papyrus Leiden I 350, Rijksmuseum van Oudheden." },
        { kind: "keep", title: "Bring flowers to a family tomb, as Thebans did when Amun crossed the river.", source: "The Beautiful Festival of the Valley, in New Kingdom Theban tomb paintings." },
      ],
      saturn: [
        { kind: "consider", title: "The Greenfield Papyrus, where Geb lies under the arched sky.", source: "British Museum EA 10554." },
        { kind: "read", title: "The Memphite Theology, where Geb judges between Horus and Seth.", source: "The Shabaka Stone, British Museum EA 498." },
        { kind: "keep", title: "Bury a few tools and a brick under the corner before you build.", source: "Foundation deposits under the corners of New Kingdom temples." },
      ],
      uranus: [
        { kind: "consider", title: "The ceiling of the tomb of Ramesses VI, where Nut swallows and bears the sun.", source: "Valley of the Kings, KV9, the Books of the Day and the Night." },
        { kind: "read", title: "The Book of Nut, the course of the stars along her body.", source: "The cenotaph of Seti I at Abydos." },
        { kind: "keep", title: "Keep the five days outside the year apart, as the birthdays of Nut's children.", source: "The epagomenal days of the civil calendar, and Plutarch, On Isis and Osiris 12." },
      ],
      neptune: [
        { kind: "consider", title: "The sacred lake at Karnak, the temple's own piece of the first water.", source: "Karnak, the lake of the Amun precinct." },
        { kind: "read", title: "The Book of the Heavenly Cow, where Ra takes counsel with Nun.", source: "The gilded shrine of Tutankhamun, and the tomb of Seti I (KV17)." },
        { kind: "keep", title: "Wash in cold water before you begin, as the priests did twice a day.", source: "Herodotus, Histories 2.37." },
      ],
      pluto: [
        { kind: "consider", title: "A corn mummy, the grain-filled Osiris buried at the Khoiak festival.", source: "Late Period corn mummies, and the Khoiak rites carved at Dendera." },
        { kind: "read", title: "The great hymn to Osiris on the stela of Amenmose.", source: "Louvre C 286." },
        { kind: "keep", title: "Sow barley in a tray of earth and let it sprout.", source: "The Osiris bed found in the tomb of Tutankhamun." },
      ],
    },
    lessons: {
      conjunction: "Two weights in one pan still read as one weight. {god} does not let you claim you carried only half.",
      sextile: "A small offering laid on time weighs more than a large one laid late. The scribe writes the date beside every gift.",
      square: "The beam does not tilt to spare you. What tips against you today was already in the pan.",
      trine: "An easy passage still goes on the scale. {god} records what you did with it.",
      opposition: "The scale has two pans, and you stand in one of them. The beam settles only when you stop pushing on it.",
    },
  },

  greece: {
    slowHeadlines: {
      conjunction: {
        jupiter: "Stand for office at the next assembly, and the vote is yours.",
        saturn: "Pay what you owe the city before the archon sends for it.",
        uranus: "Throw out the old shield and train with a different one.",
        neptune: "Steer by the stars you can see over the bow.",
        pluto: "Climb into the cellar under the house and count what is left.",
      },
      sextile: {
        jupiter: "Write to the friend in Athens who owes you a favor.",
        saturn: "Train every morning at the palaestra, and the strength stays.",
        uranus: "Listen to the stranger at the symposium with the odd idea.",
        neptune: "Take your question to the dream sanctuary at Epidauros.",
        pluto: "Sell the vineyard your grandfather left you while the price is good.",
      },
      square: {
        jupiter: "Turn down the patron who wants your vote in return.",
        saturn: "Your old debt to the city cannot wait another year.",
        uranus: "Your plans break apart like a ship on the rocks at Malea.",
        neptune: "Doubt the soothsayer who tells you only the pleasant half.",
        pluto: "A buried family quarrel comes back up at the funeral feast.",
      },
      trine: {
        jupiter: "Ask the powerful plainly for the favor you need.",
        saturn: "Lay the foundation of the house you mean to grow old in.",
        uranus: "Sail for the colony when the ships are ready.",
        neptune: "Sleep in the precinct of Asklepios and bring back the dream.",
        pluto: "Dig up the silver in the old jar and put it to work.",
      },
      opposition: {
        jupiter: "A rich neighbor across the agora wants your vineyard.",
        saturn: "The magistrates call you to account for an old contract.",
        uranus: "Your city and your plans pull toward opposite harbors.",
        neptune: "Someone in the agora is telling you a pretty story.",
        pluto: "Your kinsmen take the will to a jury.",
      },
    },
    shortRelations: {
      conjunction: "must climb the hill beside",
      sextile: "can count on",
      square: "will quarrel with",
      trine: "can walk in step with",
      opposition: "will take the opposite side from",
    },
    natalFrame: "{deity} stood in the {sign} when you were born: {clause}.",
    natalFrameYou: "",
    skyMoveOne: "{god} walks through the {sign} and answers for {domain}.",
    angleMoveOne: {
      asc: "The {sign} was coming up over the hills at your birth, and strangers meet that sign in you first.",
      mc: "The {sign} held the top of the sky at your birth, and the city judges you under it.",
    },
    angleDomains: {
      asc: "the first impression you make",
      mc: "your office in the city",
    },
    recurrenceFrame: "The tripod hears this figure again {interval}.",
    playsOutTitle: "HOW THIS PLAYS OUT AT THE TRIPOD",
    slowActs: {
      jupiter: "{god} nods from Olympus, and the assembly gives you the floor.",
      saturn: "{god} counts the sheaves at the threshing floor, and the short ones are set aside.",
      uranus: "{god} spreads the sky wider, and the city walls look small under it.",
      neptune: "{god} stirs the harbor, and the moorings slip one by one.",
      pluto: "{god} opens the storerooms under the earth, and old silver comes up with the plow.",
    },
    manifestations: [
      {
        harmony: [
          "a fair price at the first stall",
          "silver counted out with nothing missing",
          "a buyer who comes back for more",
          "your goods sold before the market closes",
        ],
        tension: [
          "a merchant who weighs with his thumb",
          "the tax farmer at your door before noon",
          "an obol short at the end of the day",
          "goods spoiled on the road to the agora",
        ],
      },
      {
        harmony: [
          "the whole household at one table",
          "the hearth fire caught on the first try",
          "a guest who brings his own wine",
          "an old quarrel left at the threshold",
        ],
        tension: [
          "a sharp word over the loom",
          "the hearth smoking out the room",
          "a relative who stays three days too long",
          "the dowry argued over again",
        ],
      },
      {
        harmony: [
          "a message carried right the first time",
          "a stranger on the road who knows the way",
          "a friend who answers before you finish asking",
          "the right word at the crossroads",
        ],
        tension: [
          "a rumor that reaches the agora before you",
          "a wrong turn at the herm",
          "a friend who repeats what you told him in confidence",
          "a letter delivered to the wrong house",
        ],
      },
      {
        harmony: [
          "a quiet hour before the lamp is lit",
          "an answer that comes to you while walking",
          "a dream worth telling at breakfast",
          "the oracle's words making sense at last",
        ],
        tension: [
          "a question you are afraid to ask aloud",
          "a dream you would rather not have interpreted",
          "a bad omen you keep turning over",
          "the riddle that wakes you at night",
        ],
      },
    ],
    tryThis: {
      sun: [
        { kind: "consider", title: "The Helios metope from Ilion, the god driving his four horses.", source: "Temple of Athena at Troy, now in the Pergamonmuseum, Berlin." },
        { kind: "read", title: "The Homeric Hymn to Helios.", source: "Homeric Hymn 31." },
        { kind: "keep", title: "Stand and greet the sun when it comes up, as Socrates did at Potidaea.", source: "Plato, Symposium 220d." },
      ],
      moon: [
        { kind: "consider", title: "The horse of Selene's chariot from the Parthenon's east pediment.", source: "British Museum, Parthenon sculptures, east pediment figure O." },
        { kind: "read", title: "The Homeric Hymn to Selene.", source: "Homeric Hymn 32." },
        { kind: "keep", title: "Keep the first of the month, the noumenia, with a small offering at home.", source: "Jon Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975)." },
      ],
      mercury: [
        { kind: "consider", title: "A herm, the pillar with Hermes' head that stood at Athenian doors.", source: "The Hermes Propylaios of Alkamenes, Roman copy from Pergamon, Istanbul Archaeology Museums." },
        { kind: "read", title: "The Homeric Hymn to Hermes, the cattle theft and the lyre.", source: "Homeric Hymn 4." },
        { kind: "keep", title: "Add a stone to the heap at the roadside as you pass.", source: "Walter Burkert, Greek Religion (1985), on the herma and the wayside cairn." },
      ],
      venus: [
        { kind: "consider", title: "Praxiteles' Aphrodite of Knidos, in its Roman copy.", source: "The Colonna Venus, Vatican Museums." },
        { kind: "read", title: "Sappho's prayer to Aphrodite.", source: "Sappho, fragment 1." },
        { kind: "keep", title: "Burn frankincense on the altar for her.", source: "Sappho, fragment 2, the altars smoking with frankincense." },
      ],
      mars: [
        { kind: "consider", title: "The Ludovisi Ares, seated, his shield set down beside him.", source: "Palazzo Altemps, Museo Nazionale Romano." },
        { kind: "read", title: "The Homeric Hymn to Ares, which asks him for the strength to stay out of strife.", source: "Homeric Hymn 8." },
        { kind: "keep", title: "Swear the ephebes' oath never to leave the man beside you in the line.", source: "The ephebic oath on the Acharnai stele, fourth century BCE." },
      ],
      jupiter: [
        { kind: "consider", title: "The Otricoli head of Zeus, the father of the gods in marble.", source: "Vatican Museums, Sala Rotonda." },
        { kind: "read", title: "The opening hymn of Works and Days, to the Zeus who raises and humbles.", source: "Hesiod, Works and Days 1 to 10." },
        { kind: "keep", title: "Pour the third cup to Zeus Soter before the drinking ends.", source: "Plato, Philebus 66d, on the third to the Savior." },
      ],
      saturn: [
        { kind: "consider", title: "The omphalos at Delphi, the stone Kronos swallowed for his child.", source: "Delphi Archaeological Museum." },
        { kind: "read", title: "Kronos, his children and the swallowed stone.", source: "Hesiod, Theogony 453 to 506." },
        { kind: "keep", title: "Keep the Kronia, when masters and slaves ate at one table.", source: "Philochorus, quoted in Macrobius, Saturnalia 1.10.22." },
      ],
      uranus: [
        { kind: "consider", title: "The Farnese Atlas, the oldest celestial globe that survives.", source: "Museo Archeologico Nazionale, Naples." },
        { kind: "read", title: "Ouranos, Gaia and the sickle.", source: "Hesiod, Theogony 126 to 210." },
        { kind: "keep", title: "Time your work by a star's first dawn appearance, as Hesiod times the harvest by the Pleiades.", source: "Hesiod, Works and Days 383 to 384." },
      ],
      neptune: [
        { kind: "consider", title: "The Penteskouphia plaques, potters' painted prayers to Poseidon.", source: "Corinth, now in the Antikensammlung, Berlin." },
        { kind: "read", title: "The Homeric Hymn to Poseidon, the tamer of horses and savior of ships.", source: "Homeric Hymn 22." },
        { kind: "keep", title: "Pour wine into the sea before you sail, as the fleet did at Piraeus.", source: "Thucydides, History 6.32." },
      ],
      pluto: [
        { kind: "consider", title: "The Ploutonion at Eleusis, the cave shrine beside the sanctuary gate.", source: "Eleusis, the sanctuary of Demeter and Kore." },
        { kind: "read", title: "The Homeric Hymn to Demeter, where the lord below carries off Persephone.", source: "Homeric Hymn 2." },
        { kind: "keep", title: "Pour milk and honey for your dead.", source: "Homer, Odyssey 10.518 to 520." },
      ],
    },
    lessons: {
      conjunction: "The Pythia answers the question you bring. Bring one, and say it plainly.",
      sextile: "The stone heaps at the crossroads were built one traveler at a time. Add yours and keep walking.",
      square: "An oracle that frightens you is still an oracle. Croesus heard what he wanted and lost a kingdom.",
      trine: "A clear answer is a debt to the god who gave it. Pay it at the altar before you spend it.",
      opposition: "Two heralds can both be honest. The assembly votes, and the losing side still goes home to eat.",
    },
  },

  canaan: {
    slowHeadlines: {
      conjunction: {
        jupiter: "Plant twice the barley, because the rains are coming heavy.",
        saturn: "Sit down among the elders and carry the weight of it.",
        uranus: "Move your flocks to the far pasture before the season turns.",
        neptune: "Keep one hand on the rope while the sea climbs the walls.",
        pluto: "Open the family tomb and set the bones in order.",
      },
      sextile: {
        jupiter: "Lend your oxen to the neighbor, and the harvest comes back doubled.",
        saturn: "Repair one terrace wall each week before the rains.",
        uranus: "Take the trader's offer to carry your oil down to Egypt.",
        neptune: "Say your prayer at the high place each evening.",
        pluto: "Pay what is owed to your father's kin.",
      },
      square: {
        jupiter: "Store water in the cistern now, and never count on the rains.",
        saturn: "The elders will not bend the rule for you, so keep it.",
        uranus: "The caravan road you depend on is closing.",
        neptune: "Draw your own water and trust what you see in the bucket.",
        pluto: "Your family's land is under claim, so gather your witnesses.",
      },
      trine: {
        jupiter: "Fill every jar you own with this harvest.",
        saturn: "Build the stone house your grandsons will live in.",
        uranus: "Move the tent to better water, and the flock thrives.",
        neptune: "Climb to the sanctuary on Mount Zaphon and make your vow.",
        pluto: "Bury the old grievance with the family's dead.",
      },
      opposition: {
        jupiter: "A rich man at the gate demands a cut of your barley.",
        saturn: "The elders sit against you in a matter of the old law.",
        uranus: "Your clan wants to move, and you want to stay.",
        neptune: "Someone at the well promises rain nobody can bring.",
        pluto: "A distant cousin claims your family's field before the council.",
      },
    },
    shortRelations: {
      conjunction: "will go up to the council with",
      sextile: "can lend a hand to",
      square: "will stand in the gate against",
      trine: "can work the same field as",
      opposition: "will bring a claim against",
    },
    natalFrame: "{deity} sat in the {sign} on the day you were named: {clause}.",
    natalFrameYou: "",
    skyMoveOne: "{god} sits in the {sign} and speaks for {domain} before the council.",
    angleMoveOne: {
      asc: "The {sign} came up over the hills on the day you were named, and the gate knows you by it.",
      mc: "The {sign} stood highest on the day you were named, and the elders weigh your work under it.",
    },
    angleDomains: {
      asc: "the way the gate sees you",
      mc: "your seat among the elders",
    },
    recurrenceFrame: "This matter comes before the council again {interval}.",
    playsOutTitle: "HOW THIS PLAYS OUT IN THE COUNCIL",
    slowActs: {
      jupiter: "{god} thunders from the cloud, and the rain falls on your terraces first.",
      saturn: "{god} sits at the head of the council, and every case waits for his word.",
      uranus: "{god} moves the bounds of the sky, and the flock follows the fresh grass.",
      neptune: "{god} rolls against the shore, and the fishermen drag their boats higher.",
      pluto: "{god} opens his throat at the edge of the field, and old losses come back to mind.",
    },
    manifestations: [
      {
        harmony: [
          "a full floor of sheaves before the heat",
          "an ox that pulls without the goad",
          "a jar of oil pressed on the first try",
          "your field's share counted honestly",
        ],
        tension: [
          "a broken plowshare on the stony row",
          "locusts on the neighbor's field and yours",
          "a hired hand who does not come back",
          "the tithe collector at the threshing floor",
        ],
      },
      {
        harmony: [
          "the clan gathered for the first wine",
          "a cousin's wedding where everyone comes",
          "the boundary stone left where your grandfather set it",
          "an elder who takes your side",
        ],
        tension: [
          "a quarrel over the birthright",
          "a widow in the family who needs bread",
          "an inheritance split three ways",
          "a shut tent flap where there was welcome",
        ],
      },
      {
        harmony: [
          "two witnesses who agree on every word",
          "a traveler at the gate with good news",
          "a bargain sealed with a handclasp",
          "your name spoken well among the elders",
        ],
        tension: [
          "a witness who changes his story",
          "a suit brought against you at the gate",
          "a neighbor's oath you cannot trust",
          "gossip carried up from the well",
        ],
      },
      {
        harmony: [
          "a prayer said without stumbling",
          "an evening with the lamp and no visitors",
          "a vow fulfilled on the day you named",
          "sleep that comes without dreams of debt",
        ],
        tension: [
          "a vow made in haste",
          "an evil dream after a feast",
          "a sacrifice the priest turns away",
          "a silence where an answer should be",
        ],
      },
    ],
    tryThis: {
      sun: [
        { kind: "consider", title: "The winged sun disc, drawn without rays, on Syrian seals.", source: "Attested in docs/design/deity-glyphs.md, Canaan, Shapash." },
        { kind: "read", title: "Shapash goes down to the dead and brings Baal back up.", source: "The Baal Cycle, KTU 1.6." },
        { kind: "keep", title: "Put the day's work down at sunset, when the ritual texts free the king.", source: "KTU 1.41 and 1.87, in Dennis Pardee, Ritual and Cult at Ugarit (2002)." },
      ],
      moon: [
        { kind: "consider", title: "The Hazor stele of two raised hands beneath a crescent.", source: "Hazor, the stelae shrine in Area C, Israel Museum." },
        { kind: "read", title: "Nikkal and Yarikh, the moon's wedding and its silver bride price.", source: "KTU 1.24." },
        { kind: "keep", title: "Begin the month's offerings on the day the crescent returns.", source: "The month ritual, KTU 1.41, in Pardee, Ritual and Cult at Ugarit." },
      ],
      mercury: [
        { kind: "consider", title: "The gold bowl of Ugarit with its chariot hunt.", source: "Louvre AO 17208." },
        { kind: "read", title: "Kothar builds Baal's palace and argues for the window.", source: "The Baal Cycle, KTU 1.4." },
        { kind: "keep", title: "Cut your name on the tools you work with.", source: "The inscribed bronze adzes from the high priest's house at Ugarit." },
      ],
      venus: [
        { kind: "consider", title: "A mould-made clay plaque of the naked goddess.", source: "The Late Bronze Age plaques of the southern Levant, in most regional collections." },
        { kind: "read", title: "Attart rebukes Baal over the captive sea.", source: "The Baal Cycle, KTU 1.2, column IV." },
        { kind: "keep", title: "Bake cakes for the Queen of Heaven with the women of the house.", source: "Jeremiah 7:18 and 44:19." },
      ],
      mars: [
        { kind: "consider", title: "The stela of Qadesh, Min and Resheph, the archer god from Canaan honored in Egypt.", source: "British Museum EA 191." },
        { kind: "read", title: "Resheph takes his share of King Kirta's household.", source: "The Kirta epic, KTU 1.14." },
        { kind: "keep", title: "Set aside the archer's share at the month's offerings.", source: "Resheph in the Ugaritic offering lists, in Pardee, Ritual and Cult at Ugarit." },
      ],
      jupiter: [
        { kind: "consider", title: "The Baal au foudre stele, the storm god with club and lightning spear.", source: "Louvre AO 15775, traced in docs/design/system/assets/traced/canaan-baal-stele.png." },
        { kind: "read", title: "Baal's message to Anat: the word of trees and the whisper of stones.", source: "The Baal Cycle, KTU 1.3, column III." },
        { kind: "keep", title: "Wait for the first rain before you sow.", source: "The Kirta epic, KTU 1.16, column III." },
      ],
      saturn: [
        { kind: "consider", title: "The seated god of Ugarit in bronze and gold foil, read as El.", source: "National Museum of Damascus." },
        { kind: "read", title: "The Gracious Gods, El at the shore with his two wives.", source: "KTU 1.23." },
        { kind: "keep", title: "Join a marzeah, the sworn drinking fellowship held in El's own house.", source: "KTU 1.114." },
      ],
      uranus: [
        { kind: "read", title: "The god list that names Earth and Heaven as one seat in the council.", source: "KTU 1.47, the Ugaritic pantheon list." },
        { kind: "keep", title: "Call heaven and earth to witness a promise, as the treaties of the age close.", source: "The treaty witness lists in the archives of Ugarit, published in PRU IV." },
      ],
      neptune: [
        { kind: "consider", title: "The stone anchors that sailors dedicated in Baal's temple at Ugarit.", source: "The temple of Baal on the acropolis of Ugarit." },
        { kind: "read", title: "Kothar's two clubs strike down Prince Sea.", source: "The Baal Cycle, KTU 1.2, column IV." },
      ],
      pluto: [
        { kind: "consider", title: "The family vaults under the houses of Ugarit, where the dead stayed home.", source: "The excavated houses of Ugarit and their corbel-vaulted tombs." },
        { kind: "read", title: "Mot's message: his throat is a pit, and he swallows Baal.", source: "The Baal Cycle, KTU 1.5, column I." },
        { kind: "keep", title: "Name your dead aloud and pour for them.", source: "KTU 1.161, the royal funerary ritual." },
      ],
    },
    lessons: {
      conjunction: "When two matters reach the council together, the elders rule on both. You live with both rulings.",
      sextile: "A favor done at the gate is remembered at the gate. The elders keep no tablet, and they forget nothing.",
      square: "A suit you lose at the gate is still settled. Pay what the elders ruled and walk home through the same gate.",
      trine: "The council says yes once. Ask for what you need, and leave the rest for another sitting.",
      opposition: "Two claims on one field cannot both stand. The council hears both and divides the field, and nobody leaves pleased.",
    },
  },

  carthage: {
    slowHeadlines: {
      conjunction: {
        jupiter: "Put your silver into the largest venture you can find.",
        saturn: "Your fixed dues all fall due this year, so set the silver aside now.",
        uranus: "Sell the old ship and buy into the route west of the Pillars.",
        neptune: "Count your cargo yourself while fog sits on the harbor.",
        pluto: "Open the inherited ledger and read every page of it.",
      },
      sextile: {
        jupiter: "Lend to the captain who has never lost a ship.",
        saturn: "Pay a little on the old loan each month and watch it shrink.",
        uranus: "Buy a share in the first voyage to the tin islands.",
        neptune: "Risk one hull on the long voyage and moor the others.",
        pluto: "Sell the inherited warehouse while buyers are bidding.",
      },
      square: {
        jupiter: "Borrow nothing against profits still at sea.",
        saturn: "The suffetes audit your books this year, line by line.",
        uranus: "Your best route closes without warning, so find a second.",
        neptune: "Trust no cargo list you did not count yourself.",
        pluto: "The debt your family left you comes due with interest.",
      },
      trine: {
        jupiter: "Expand the warehouse, because the profits will fill it.",
        saturn: "Pay off the old loan in full and break the tablet.",
        uranus: "Open the western route, and it pays from the first sailing.",
        neptune: "Send the ship out on the long voyage this season.",
        pluto: "Claim your inheritance and invest it in the harbor.",
      },
      opposition: {
        jupiter: "A rival house bids against you for the same cargo.",
        saturn: "The temple wants its dues and the ship wants its repairs.",
        uranus: "Your partners want the western route, and you would keep the old one.",
        neptune: "A captain sells you a voyage that cannot sail.",
        pluto: "A cousin from Tyre wants half of what your family left you.",
      },
    },
    shortRelations: {
      conjunction: "must sign under one seal with",
      sextile: "can stand surety for",
      square: "will undercut",
      trine: "will tally cleanly with",
      opposition: "will bid against",
    },
    natalFrame: "The roll of your birth enters {deity} under the {sign}: {clause}.",
    natalFrameYou: "",
    skyMoveOne: "{god} trades under the {sign} and keeps the books on {domain}.",
    angleMoveOne: {
      asc: "Your birth roll opens under the {sign} rising, the first line every partner reads.",
      mc: "Your birth roll puts the {sign} at the head of the page, where your standing is entered.",
    },
    angleDomains: {
      asc: "your face on the quay",
      mc: "your standing with the suffetes",
    },
    recurrenceFrame: "This entry falls due again {interval}.",
    playsOutTitle: "HOW THIS PLAYS OUT ON THE LEDGER",
    slowActs: {
      jupiter: "{god} opens the temple treasury, and the loans go out at a low rate.",
      saturn: "{god} calls in the old accounts, and the clerks work by lamplight.",
      uranus: "{god} blows the storm off its usual course, and the captains chart another passage.",
      neptune: "{god} hides the coastline in fog, and every pilot slows.",
      pluto: "{god} opens the family tomb for an audit, and the heirs gather at the door.",
    },
    manifestations: [
      {
        harmony: [
          "a ledger that closes on the first count",
          "wages paid on the day they fall due",
          "silver weighed and found full",
          "a buyer who pays before delivery",
        ],
        tension: [
          "a coin that rings false on the table",
          "a clerk's error in the other party's favor",
          "a cargo valued below its cost",
          "interest added to a loan you thought was settled",
        ],
      },
      {
        harmony: [
          "the household books agreed by everyone",
          "an heir who learns the trade",
          "a dowry paid on time",
          "a courtyard full at the festival meal",
        ],
        tension: [
          "an heir who wants his share early",
          "a steward who loses the keys",
          "a will read aloud and disputed",
          "household silver spent before the month is out",
        ],
      },
      {
        harmony: [
          "a ship that arrives a day early",
          "a letter from Gades with good prices",
          "a captain who keeps his word",
          "a berth free when you need one",
        ],
        tension: [
          "a ship held in port by the wind",
          "a tally that does not match the cargo",
          "a partner's letter that contradicts the last one",
          "news from Tyre that arrives too late",
        ],
      },
      {
        harmony: [
          "a vow paid and a stele set up",
          "an hour of quiet in the precinct",
          "a priest who accepts the offering at once",
          "a promise you keep without witnesses",
        ],
        tension: [
          "a vow you have not yet paid",
          "a sleepless night over a contract",
          "an omen at the altar you cannot read",
          "a secret you have kept too long",
        ],
      },
    ],
    tryThis: {
      sun: [
        { kind: "consider", title: "A tophet stela crowned by the disc and crescent, the commonest emblem in the precinct.", source: "The Carthage tophet stelae, Musée national de Carthage." },
        { kind: "read", title: "Hannibal's oath, sworn by the Sun, the Moon and the Earth among the gods of Carthage.", source: "Polybius, Histories 7.9." },
      ],
      moon: [
        { kind: "consider", title: "The sign of Tanit cut on the stelae of the tophet.", source: "The tophet of Salammbô, Carthage, and docs/design/deity-glyphs.md." },
        { kind: "read", title: "A dedication to the Lady Tanit, face of Baal, and to the Lord Baal Hammon.", source: "KAI 79, Carthage." },
        { kind: "keep", title: "Set up a small stone when a vow is answered, because the god heard your voice.", source: "The tophet formula, in the dedications collected in CIS I." },
      ],
      mercury: [
        { kind: "consider", title: "The steering oar carved on Punic votive stelae.", source: "Attested in docs/design/deity-glyphs.md, Carthage, Sakun." },
        { kind: "read", title: "Hanno's voyage down the African coast, a Carthaginian captain's own record.", source: "The Periplus of Hanno, in its Greek translation." },
        { kind: "keep", title: "Post your prices where everyone can read them, as the temple posted its tariff.", source: "The Marseille Tariff, CIS I 165." },
      ],
      venus: [
        { kind: "consider", title: "The Pyrgi gold tablets, a king's dedication to Astarte in Phoenician and Etruscan.", source: "Museo Nazionale Etrusco di Villa Giulia, Rome." },
        { kind: "read", title: "King Eshmunazar's coffin, which records the house he built for Astarte in Sidon.", source: "Louvre AO 4806, KAI 14." },
        { kind: "keep", title: "Watch the doves of Eryx, whose flight to Africa and return marked her festivals.", source: "Aelian, On the Nature of Animals 4.2." },
      ],
      mars: [
        { kind: "consider", title: "The Maltese cippus to Melqart, lord of Tyre, written in two scripts.", source: "Louvre AO 4818." },
        { kind: "read", title: "The two pillars in Melqart's temple at Tyre, one of gold and one of green stone.", source: "Herodotus, Histories 2.44." },
        { kind: "keep", title: "Send the first fruits to the god's temple every year.", source: "Polybius, Histories 31.12, the Carthaginian ship carrying first fruits to Tyre." },
      ],
      jupiter: [
        { kind: "consider", title: "The enthroned god between sphinxes from the sanctuary of Thinissut.", source: "Bardo National Museum, Tunis." },
        { kind: "read", title: "Hanno's prayer in Punic to the gods of the city.", source: "Plautus, Poenulus 930 to 949." },
        { kind: "keep", title: "Give a lamb in place of what you vowed.", source: "The N'Gaous stelae, Algeria, which record the substitute lamb." },
      ],
      saturn: [
        { kind: "consider", title: "The sickle carved on the stelae of the god's African sanctuaries.", source: "Marcel Le Glay, Saturne africain (1961 to 1966)." },
        { kind: "read", title: "The city in crisis turns back to its oldest god.", source: "Diodorus Siculus, Library 20.14." },
      ],
      uranus: [
        { kind: "read", title: "King Azatiwada's inscription, which names the lord of heaven first among the gods.", source: "The Karatepe bilingual, KAI 26." },
        { kind: "keep", title: "Put the god of heaven in the curse clause of your contract.", source: "The closing curse of the Karatepe inscription, KAI 26." },
      ],
      neptune: [
        { kind: "consider", title: "The round war harbor of Carthage with the admiral's island at its center.", source: "Appian, Punic Wars 96, and the excavated cothon at Salammbô." },
        { kind: "read", title: "The silent trade on the coast beyond the Pillars.", source: "Herodotus, Histories 4.196." },
        { kind: "keep", title: "Carry a small god on the prow, as Phoenician ships did.", source: "Herodotus, Histories 3.37, on the pataikoi." },
      ],
      pluto: [
        { kind: "consider", title: "The engraved bronze razors laid in Carthaginian tombs.", source: "The necropoleis of Carthage, Musée national de Carthage." },
        { kind: "read", title: "The god the Phoenicians call Death.", source: "Philo of Byblos, in Eusebius, Preparation for the Gospel 1.10." },
        { kind: "keep", title: "Leave a lamp in the tomb.", source: "Hélène Bénichou-Safar, Les tombes puniques de Carthage (1982)." },
      ],
    },
    lessons: {
      conjunction: "Two entries on one line are paid together. Read the whole line before you sign.",
      sextile: "A small credit honored today earns a large one offered later. The clerk remembers who paid on time.",
      square: "A loss written down is smaller than a loss hidden. Enter it, and the book closes.",
      trine: "A good year in the ledger pays the tithe first. {god}'s share comes off the top, before yours.",
      opposition: "Every bid has a seller across the table. Name your price, and let them name theirs.",
    },
  },

  rome: {
    slowHeadlines: {
      conjunction: {
        jupiter: "Stand for the magistracy this year, and the tribes elect you.",
        saturn: "Settle with the aerarium before the censor asks.",
        uranus: "Bring forward the law you drafted last winter.",
        neptune: "Avoid the baths and the flatterers who live in them.",
        pluto: "Break the seals on the strongbox and read the will again.",
      },
      sextile: {
        jupiter: "Call on your patron, and he speaks for you in the Curia.",
        saturn: "Pay your creditor one installment at each Kalends.",
        uranus: "Back the reform early, while it still needs sponsors.",
        neptune: "Rest at the villa for a few days and come back sharper.",
        pluto: "Settle the family estate quietly, before anyone sues.",
      },
      square: {
        jupiter: "Count no votes before the tribes have voted.",
        saturn: "Declare your property honestly when the censor assesses it.",
        uranus: "A sudden decree overturns what you planned in the forum.",
        neptune: "Your flatterers will not hold the line when the vote comes.",
        pluto: "An old family lawsuit is called before the praetor.",
      },
      trine: {
        jupiter: "Name the province you favor, and the Senate grants it.",
        saturn: "Build in stone, and the building outlasts your consulship.",
        uranus: "Push your reform through while the assembly is with you.",
        neptune: "Spend a month at Baiae and come home rested.",
        pluto: "Your inheritance comes through, and the estates are yours to run.",
      },
      opposition: {
        jupiter: "A rival patron wants the same client you do.",
        saturn: "The treasury and your own purse meet in court.",
        uranus: "The old families block your reform in the Senate.",
        neptune: "A smooth talker in the forum is asking for your trust.",
        pluto: "Your sister's husband sues for the farm your mother left you.",
      },
    },
    shortRelations: {
      conjunction: "must march under one standard with",
      sextile: "can lend troops to",
      square: "will block the road of",
      trine: "can vote with",
      opposition: "will veto",
    },
    natalFrame: "The augurs found {deity} in the {sign} at your birth: {clause}.",
    natalFrameYou: "As {deity} in the {sign}, {clause}.",
    skyMoveOne: "{god} stands in the {sign}, in charge of {domain}.",
    angleMoveOne: {
      asc: "The {sign} came up at your birth, and it is the face you bring into the forum.",
      mc: "The {sign} stood at the height of heaven at your birth, and your career runs under it.",
    },
    angleDomains: {
      asc: "the face you bring into the forum",
      mc: "your career in office",
    },
    recurrenceFrame: "The augurs record this figure again {interval}.",
    playsOutTitle: "HOW THIS PLAYS OUT IN THE FORUM",
    slowActs: {
      jupiter: "{god} thunders on the left, and the magistrate takes office under good auspices.",
      saturn: "{god} has the wool unbound from his statue's feet, and the city keeps holiday.",
      uranus: "{god} spreads his mantle over the city, and the old laws look narrow under it.",
      neptune: "{god} stirs the sea off Ostia, and the grain fleet waits in harbor.",
      pluto: "{god} opens the mundus, and the dead have the city for the day.",
    },
    manifestations: [
      {
        harmony: [
          "a client who pays his respects at dawn",
          "a motion carried without debate",
          "a contract witnessed and sealed",
          "your name read out with approval",
        ],
        tension: [
          "a petition that comes back unsigned",
          "a debt nobody will name at the table",
          "a rival who takes the front bench first",
          "a magistrate who will not see you today",
        ],
      },
      {
        harmony: [
          "the Lares fed and the hearth kept bright",
          "a dinner where every couch is full",
          "a freedman who serves your house well",
          "an ancestor's mask honored in the atrium",
        ],
        tension: [
          "a quarrel over a dowry",
          "a servant who breaks the good cup",
          "an heir who expects more than his share",
          "the household gods neglected for a week",
        ],
      },
      {
        harmony: [
          "a courier who arrives a day ahead",
          "a friend's letter with good news from the provinces",
          "a road clear all the way to the gate",
          "an introduction that opens a door",
        ],
        tension: [
          "a dispatch lost at a river crossing",
          "the urge to settle it by shouting",
          "a friend who forgets your appointment",
          "a rumor from the baths that reaches the Senate",
        ],
      },
      {
        harmony: [
          "a morning at the shrine with no one else there",
          "an omen from the right side",
          "a dream that answers a question",
          "a vow you renew without being asked",
        ],
        tension: [
          "a door that stays shut until you stop pushing",
          "an augury put off for another day",
          "a vow you made and have not kept",
          "a sleepless night before a decision",
        ],
      },
    ],
    tryThis: {
      sun: [
        { kind: "consider", title: "The Colossus beside the amphitheater, Nero's statue remade as Sol.", source: "Pliny the Elder, Natural History 34.45." },
        { kind: "read", title: "Phaethon takes the chariot of the Sun.", source: "Ovid, Metamorphoses 2.1 to 328." },
        { kind: "keep", title: "Mark 9 August, when the calendar records a sacrifice to Sol Indiges on the Quirinal.", source: "The Fasti of Amiternum." },
      ],
      moon: [
        { kind: "consider", title: "Luna driving her two-horse chariot on Republican denarii.", source: "Michael Crawford, Roman Republican Coinage (1974)." },
        { kind: "read", title: "The Secular Hymn, which asks Luna to hear the girls' chorus.", source: "Horace, Carmen Saeculare 35 to 36." },
        { kind: "keep", title: "Keep the Kalends, when the pontiff watched for the crescent and called the Nones.", source: "Macrobius, Saturnalia 1.15.9 to 10, and Varro, On the Latin Language 6.27." },
      ],
      mercury: [
        { kind: "consider", title: "Mercury with his purse painted over the shop door of Verecundus.", source: "Pompeii, Via dell'Abbondanza, IX.7.5 to 7." },
        { kind: "read", title: "The merchants' prayer at Mercury's spring, asking pardon for the month's lies.", source: "Ovid, Fasti 5.663 to 692." },
        { kind: "keep", title: "Enter every sum received and paid in your own ledger, each day.", source: "Cicero, Pro Roscio Comoedo 2 to 4, on the household account book." },
      ],
      venus: [
        { kind: "consider", title: "The Venus Genetrix, after the statue Caesar set in his forum temple.", source: "Louvre Ma 525, from Fréjus." },
        { kind: "read", title: "The hymn to Venus that opens Lucretius' poem.", source: "Lucretius, On the Nature of Things 1.1 to 43." },
        { kind: "keep", title: "Keep the Veneralia on 1 April, washing the goddess's image and wearing myrtle.", source: "Ovid, Fasti 4.133 to 162." },
      ],
      mars: [
        { kind: "consider", title: "The Mars of Todi, a bronze soldier pouring a libation before battle.", source: "Vatican Museums, Museo Gregoriano Etrusco." },
        { kind: "read", title: "The farmer's prayer to Mars at the purification of the fields.", source: "Cato, On Agriculture 141." },
        { kind: "keep", title: "Mark 1 March, when the Salii took down the shields and danced through the city.", source: "Livy 1.20, and Ovid, Fasti 3.259 to 392." },
      ],
      jupiter: [
        { kind: "consider", title: "The foundation blocks of the Capitoline temple, still standing in the museum.", source: "Musei Capitolini, Palazzo Caffarelli." },
        { kind: "read", title: "Romulus dedicates the first spoils to Iuppiter Feretrius.", source: "Livy 1.10." },
        { kind: "keep", title: "Swear by Iuppiter Lapis with a flint in your hand.", source: "Polybius, Histories 3.25." },
      ],
      saturn: [
        { kind: "consider", title: "The temple of Saturn in the Forum, which held the state treasury.", source: "Forum Romanum, the aerarium Saturni." },
        { kind: "read", title: "Macrobius on the Saturnalia, its origins and its days.", source: "Macrobius, Saturnalia 1.7 to 1.10." },
        { kind: "keep", title: "Keep the Saturnalia from 17 December, with candles and clay figures for gifts.", source: "Macrobius, Saturnalia 1.10 to 1.11, on the cerei and sigillaria." },
      ],
      uranus: [
        { kind: "consider", title: "Caelus spreading his mantle across the top of the Prima Porta breastplate.", source: "Vatican Museums, Braccio Nuovo, traced in docs/design/system/assets/traced/rome-augustus.png." },
        { kind: "read", title: "Cicero's Stoic reads Caelus and Saturn as the sky and time.", source: "Cicero, On the Nature of the Gods 2.63 to 64." },
        { kind: "keep", title: "Take the auspices from one fixed place, the templum the augur marks on the sky.", source: "Varro, On the Latin Language 7.6 to 7.9." },
      ],
      neptune: [
        { kind: "consider", title: "The mosaic of Neptune and Amphitrite in its own Herculaneum house.", source: "Herculaneum, Insula V, the House of Neptune and Amphitrite." },
        { kind: "read", title: "Neptune lifts his head from the waves and calms the storm.", source: "Virgil, Aeneid 1.124 to 156." },
        { kind: "keep", title: "Keep the Neptunalia on 23 July under huts of leafy branches.", source: "Festus, under umbrae." },
      ],
      pluto: [
        { kind: "consider", title: "The buried altar of Dis Pater and Proserpina at the Tarentum, uncovered only for the Secular Games.", source: "Valerius Maximus 2.4.5, and Zosimus 2.1 to 2.3." },
        { kind: "read", title: "The formula that devotes an enemy city to Dis Pater.", source: "Macrobius, Saturnalia 3.9." },
        { kind: "keep", title: "Keep the Parentalia in February with bread, salt and violets at the family tomb.", source: "Ovid, Fasti 2.533 to 542." },
      ],
    },
    lessons: {
      conjunction: "One standard carries two legions' honor and two legions' blame. March under it knowing both.",
      sextile: "A favor asked of a patron is a debt in the patron's book. Pay it before he asks.",
      square: "An adverse omen does not cancel the assembly. It moves the vote to another day, and the business waits.",
      trine: "The birds on the right are a permission. What you do with it is your own vote.",
      opposition: "A veto stops the motion and leaves the house standing. The vote comes again on another day.",
    },
  },
};
