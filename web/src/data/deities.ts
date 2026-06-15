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
    name: "Apollo",
    epithet: "God of Light",
    note: "Olympian deity of truth, music, and prophecy, syncretized with the older Titan Helios.",
  },
  {
    planet: "moon",
    culture: "greece",
    name: "Artemis",
    epithet: "The Huntress",
    note: "Virgin goddess of the wild, the hunt, and the lunar cycle.",
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
    name: "Cronus",
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
    name: "Kothar-wa-Khasis",
    epithet: "The Skilled Craftsman",
    note: "Smith-god, architect, and master of magical incantation in the Ugaritic texts.",
  },
  {
    planet: "venus",
    culture: "canaan",
    name: "Astarte",
    epithet: "Queen of Heaven",
    note: "Goddess of love, fertility, and war, the Phoenician evening and morning star.",
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
