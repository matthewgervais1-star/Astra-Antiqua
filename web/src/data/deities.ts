import type { Deity, DeityMatrix } from "@/types/deity";
import { CULTURES, PLANETS, type Culture, type Planet } from "@/data/cultures";

export const DEITIES: readonly Deity[] = [
  // Egypt
  {
    planet: "sun",
    culture: "egypt",
    name: "Ra",
    epithet: "The Creator and King",
    note: "Solar deity who traverses the sky in the day barque and the underworld in the night barque.",
  },
  {
    planet: "moon",
    culture: "egypt",
    name: "Khonsu",
    epithet: "The Traveller",
    note: "Lunar god of time, marking, and the measurement of the calendar.",
  },
  {
    planet: "mercury",
    culture: "egypt",
    name: "Sebegu",
    epithet: "Aspect of Set",
    note: "The Egyptian planetary name for Mercury, identified in Greco-Egyptian sources with Set, god of chaos and the red desert.",
    contested: true,
  },
  {
    planet: "venus",
    culture: "egypt",
    name: "Isis",
    epithet: "The One Who Crosses",
    note: "Mother goddess associated with the planet's role as both morning and evening star.",
  },
  {
    planet: "mars",
    culture: "egypt",
    name: "Horus the Red",
    epithet: "God of the Horizon",
    note: "The Egyptian planetary name for Mars, associated with the warrior aspect of Horus.",
  },
  {
    planet: "jupiter",
    culture: "egypt",
    name: "Amun",
    epithet: "He Who Limits the Two Lands",
    note: "Hidden creator god whose later syncretism with Ra made him sovereign of the pantheon.",
  },
  {
    planet: "saturn",
    culture: "egypt",
    name: "Geb",
    epithet: "Father of the Earth",
    note: "Ancient earth god whose archetypal weight stands in for Saturn's principle of foundation and time.",
    contested: true,
  },

  // Greece
  {
    planet: "sun",
    culture: "greece",
    name: "Helios",
    epithet: "Who Sees All Things",
    note: "The sun itself, driving his chariot across the sky and reporting to the gods what he has seen. Apollo absorbed his light in later cult; the planet keeps the older name.",
  },
  {
    planet: "moon",
    culture: "greece",
    name: "Selene",
    epithet: "The Moon Herself",
    note: "Titan of the moon, sister of Helios, who drives the night chariot. Artemis took her rites later; the body keeps the elder name.",
  },
  {
    planet: "mercury",
    culture: "greece",
    name: "Hermes",
    epithet: "The Messenger",
    note: "Patron of travelers, merchants, and boundaries, fleet-footed conductor of souls.",
  },
  {
    planet: "venus",
    culture: "greece",
    name: "Aphrodite",
    epithet: "Goddess of Love",
    note: "Olympian deity of beauty, desire, and procreation, born from sea-foam.",
  },
  {
    planet: "mars",
    culture: "greece",
    name: "Ares",
    epithet: "God of War",
    note: "Brutal, chaotic god of battlefield slaughter, often disdained by his fellow Olympians.",
  },
  {
    planet: "jupiter",
    culture: "greece",
    name: "Zeus",
    epithet: "King of Olympus",
    note: "Sky-father, wielder of thunder, arbiter of cosmic law.",
  },
  {
    planet: "saturn",
    culture: "greece",
    name: "Kronos",
    epithet: "Father of Time",
    note: "Deposed king of the Titans, devourer of his own children, lord of agriculture and limit.",
  },

  // Canaan
  {
    planet: "sun",
    culture: "canaan",
    name: "Shapash",
    epithet: "Luminary of the Deities",
    note: "Sun goddess who serves as messenger of the divine council and guide through the underworld.",
  },
  {
    planet: "moon",
    culture: "canaan",
    name: "Yarikh",
    epithet: "Lord of the Night",
    note: "Moon god whose cult gave Jericho its name, husband of the goddess Nikkal.",
  },
  {
    planet: "mercury",
    culture: "canaan",
    name: "Kothar",
    epithet: "Skilled and Wise",
    note: "Kothar-wa-Khasis in full, the smith-god, architect, and master of incantation in the Ugaritic texts.",
  },
  {
    planet: "venus",
    culture: "canaan",
    name: "Attart",
    epithet: "Queen of Heaven",
    note: "Goddess of love and war, the evening and morning star. The Ugaritic form of the name Carthage carries as Astarte.",
  },
  {
    planet: "mars",
    culture: "canaan",
    name: "Resheph",
    epithet: "Lord of the Arrow",
    note: "Plague god who shoots fiery arrows of disease into the mortal world.",
  },
  {
    planet: "jupiter",
    culture: "canaan",
    name: "Baal Hadad",
    epithet: "Rider of the Clouds",
    note: "Storm god, king of the active pantheon, bringer of life-giving rain.",
  },
  {
    planet: "saturn",
    culture: "canaan",
    name: "El",
    epithet: "Father of Years",
    note: "Ancient creator-patriarch who presides over the divine council from his mountain abode.",
  },

  // Carthage
  {
    planet: "sun",
    culture: "carthage",
    name: "Semes",
    epithet: "The Solar Force",
    note: "Direct descendant of the Canaanite Shapash, the Punic sun.",
  },
  {
    planet: "moon",
    culture: "carthage",
    name: "Tanit",
    epithet: "Dea Caelestis",
    note: "Chief tutelary goddess of Carthage, identified with the lunar crescent that surmounts the solar disc in her iconography.",
    contested: true,
  },
  {
    planet: "mercury",
    culture: "carthage",
    name: "Sakun",
    epithet: "The Guide",
    note: "Punic deity attested in inscriptions, associated with travel and trade in the Phoenician maritime network.",
  },
  {
    planet: "venus",
    culture: "carthage",
    name: "Astarte",
    epithet: "Lady of the Sea",
    note: "Goddess of love and naval power, whose cult in Carthage was frequently merged with that of Tanit.",
  },
  {
    planet: "mars",
    culture: "carthage",
    name: "Melqart",
    epithet: "Protector of Tyre",
    note: "Patron god of the Phoenician mother city, identified with Heracles by Greek travelers.",
  },
  {
    planet: "jupiter",
    culture: "carthage",
    name: "Baal Hammon",
    epithet: "Lord of the Sky",
    note: "Chief male deity of Carthage; the Romans called him Saturnus Africanus, but his sky-sovereign aspect maps to Jupiter.",
  },
  {
    planet: "saturn",
    culture: "carthage",
    name: "Baal Hammon",
    epithet: "The Ancient One",
    note: "The same deity in his role as agricultural time-keeper and demander of cosmic order, equated with Saturn in Roman Africa.",
    contested: true,
  },

  // Rome. The cleanest mapping of the five: the planet names used in every
  // modern European language are simply these gods, inherited through the
  // Roman calendar and the Hellenistic seven-planet system.
  {
    planet: "sun",
    culture: "rome",
    name: "Sol",
    epithet: "The Unconquered",
    note: "Roman sun god whose later cult as Sol Invictus, the Unconquered Sun, became a state religion of the Empire.",
  },
  {
    planet: "moon",
    culture: "rome",
    name: "Luna",
    epithet: "Driver of the Night-Chariot",
    note: "Roman goddess of the moon who drives her two-horse chariot across the night sky opposite Sol.",
  },
  {
    planet: "mercury",
    culture: "rome",
    name: "Mercurius",
    epithet: "Lord of Exchange",
    note: "Roman god of commerce, travel, and messages, conductor of souls and bearer of the caduceus.",
  },
  {
    planet: "venus",
    culture: "rome",
    name: "Venus",
    epithet: "Genetrix, Mother of the Race",
    note: "Roman goddess of love and beauty, claimed as divine ancestress of the Roman people through Aeneas.",
  },
  {
    planet: "mars",
    culture: "rome",
    name: "Mars",
    epithet: "Father of the Legions",
    note: "Roman god of war and father of Romulus, second only to Jupiter and a guardian of the Roman state.",
  },
  {
    planet: "jupiter",
    culture: "rome",
    name: "Iuppiter",
    epithet: "Optimus Maximus, Best and Greatest",
    note: "Sky-father and supreme god of the Roman state, worshipped on the Capitoline Hill as Optimus Maximus.",
  },
  {
    planet: "saturn",
    culture: "rome",
    name: "Saturnus",
    epithet: "King of the Golden Age",
    note: "Ancient god of time, agriculture, and the lost Golden Age, honored at the midwinter festival of the Saturnalia.",
  },

  // The three received bodies: Uranus, Neptune, and Pluto were invisible to
  // the naked eye, so no ancient pantheon ever assigned them a planet. Each
  // culture below receives them into a native deity already carrying the
  // right register (sudden sky, dissolving sea, the swallower of the dead),
  // the way the culture would in fact have to if handed the discovery. Every
  // note begins "Received:" so the reception reads honestly beside the other
  // seven, which were the ancients' own assignments.
  {
    planet: "uranus",
    culture: "egypt",
    name: "Nut",
    epithet: "the vault of stars, whose five stolen days stand outside the year",
    note: "Received: Nut is Egypt's own sky, the star-covered goddess arched over Geb; her children were born on five days outside the year. The scribes named no planet for her, so this seat is modern work: sudden Uranus goes to the vault where the uncounted days live.",
  },
  {
    planet: "neptune",
    culture: "egypt",
    name: "Nun",
    epithet: "the water before the world, still standing beneath every river",
    note: "Received: Nun is the boundless water before creation, the deep the first mound rose from. No scribe ever tallied a planet for him; the moderns give dissolving Neptune to Nun because he is the flood with no far bank, older than the scale itself.",
  },
  {
    planet: "pluto",
    culture: "egypt",
    name: "Osiris",
    epithet: "the murdered king enthroned below, green with returning grain",
    note: "Received: Osiris is Egypt's own lord of the dead, the killed and remade king before whom every heart is weighed. Egypt hung no planet on him; deep Pluto is set in his hall by modern hands, because what goes down with Osiris comes back as grain.",
  },
  {
    planet: "uranus",
    culture: "greece",
    name: "Ouranos",
    epithet: "the first sky, unthroned by his own son's sickle",
    note: "Received: Ouranos is Hesiod's primordial sky, first king of everything, cut down in ambush by his son Kronos. No oracle assigned him a wanderer; the moderns named the new planet for him, and the name fits, for his overthrow came in one unannounced stroke.",
  },
  {
    planet: "neptune",
    culture: "greece",
    name: "Poseidon",
    epithet: "earth-shaker, the sea that sets its own price for every crossing",
    note: "Received: Poseidon is the Olympian sea and the earthquake under the city walls, paid by every sailor before the crossing. No oracle gave him a planet; the moderns named the dissolving one for his Roman name, and the god takes it as a debt long owed.",
  },
  {
    planet: "pluto",
    culture: "greece",
    name: "Plouton",
    epithet: "the host below, called Wealth because none dared say Death",
    note: "Received: Plouton is the careful name Greece gave the lord of the dead, Wealth-giver spoken so as not to say Hades aloud. The moderns kept that caution when they named the far planet; the reception grants him only what he always held, the one house every mortal enters.",
  },
  {
    planet: "uranus",
    culture: "canaan",
    name: "Shamem",
    epithet: "the heavens themselves, sudden as weather off the sea",
    note: "Received: Shamem is the deified Heavens of Ugarit's offering lists, the sky honored as a power in its own right. The council seated no planet; sudden Uranus is given to the heavens by modern hands, because weather off the sea asks no vow before it breaks.",
  },
  {
    planet: "neptune",
    culture: "canaan",
    name: "Yammu",
    epithet: "Prince Sea, the dissolving flood that tests every shore",
    note: "Received: Yammu is Prince Sea and Judge River of the Baal cycle, the water that claimed the kingship until Baal broke him with Kothar's two maces. Ugarit named no planets; dissolving Neptune goes to Yammu by modern assignment, because his whole office is the flood that unmakes boundaries.",
  },
  {
    planet: "pluto",
    culture: "canaan",
    name: "Motu",
    epithet: "Death the swallower, before whom even Baal goes down and returns",
    note: "Received: Motu is Death in the Ugaritic texts, the wide-throated son of El into whose gullet even Baal descends. No planet was ever his; deep Pluto is sent down to Motu as modern work, because the year of the rains runs through his swallowing and Baal's return.",
  },
  {
    planet: "uranus",
    culture: "carthage",
    name: "Baal Shamem",
    epithet: "Lord of the Heavens, first witness named when the city swears",
    note: "Received: Baal Shamem is the Phoenician Lord of the Heavens, sworn at the head of Tyre's treaties and carried west along the sea-lanes. Carthage kept no planet in his name; sudden Uranus is posted to his sky as modern work, because squalls and windfalls both arrive off the ledger.",
  },
  {
    planet: "neptune",
    culture: "carthage",
    name: "Yam",
    epithet: "the sea itself, the partner every voyage out of Carthage signs with",
    note: "Received: Yam is the old Phoenician sea, the power under every hull out of Tyre and its daughter cities. Carthage logged no planet for him; dissolving Neptune is entered to his account as modern work, because the sea takes ships, cargoes, and whole seasons without appeal.",
  },
  {
    planet: "pluto",
    culture: "carthage",
    name: "Mot",
    epithet: "Death the creditor, in whose ledger every living name is entered",
    note: "Received: Mot is Phoenician Death, remembered from Ugarit's tablets to the western colonies as the power that closes every account. Carthage cut no planet into his precinct; deep Pluto is filed under his name as modern work, because his is the one debt no ledger in the city disputes.",
  },
  {
    planet: "uranus",
    culture: "rome",
    name: "Caelus",
    epithet: "father of Saturn, the canopy under which every auspice is taken",
    note: "Received: Caelus is the Roman sky made a god, father of Saturnus in the old genealogies. The augurs took the auspices under him but gave him no planet; sudden Uranus is assigned to Caelus as modern work, because lightning from a clear sky was the one omen no magistrate could schedule.",
  },
  {
    planet: "neptune",
    culture: "rome",
    name: "Neptunus",
    epithet: "lord of all waters, from the field-spring to the open sea",
    note: "Received: Neptunus began as Rome's god of fresh water and took the whole sea when Rome took to fleets. The moderns found the planet in 1846 and named it for him; we keep their ruling and enter it in the record as theirs, not the pontiffs'.",
  },
  {
    planet: "pluto",
    culture: "rome",
    name: "Dis Pater",
    epithet: "the Rich Father below, to whom the last census always reports",
    note: "Received: Dis Pater is Rome's wealthy lord of the dead, his altar at the Tarentum kept buried between the Secular Games. Rome drew no planet for him; deep Pluto is added to his rolls as modern work, ruled fit because his is the one register every Roman name reaches.",
  },
];

function buildMatrix(): DeityMatrix {
  const matrix = Object.create(null) as Record<Culture, Record<Planet, Deity>>;
  for (const culture of CULTURES) {
    matrix[culture] = Object.create(null) as Record<Planet, Deity>;
  }
  for (const deity of DEITIES) {
    matrix[deity.culture][deity.planet] = deity;
  }
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      if (!matrix[culture][planet]) {
        throw new Error(`Missing deity entry for culture=${culture} planet=${planet}`);
      }
    }
  }
  return matrix as DeityMatrix;
}

export const DEITY_MATRIX: DeityMatrix = buildMatrix();

export function getCultureDeities(culture: Culture): readonly Deity[] {
  return PLANETS.map((planet) => DEITY_MATRIX[culture][planet]);
}
