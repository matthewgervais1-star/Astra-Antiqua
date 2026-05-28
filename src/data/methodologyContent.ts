import type { Culture } from "@/data/cultures";

export interface InterpretiveNote {
  id: string;
  cultures: readonly Culture[];
  title: string;
  body: string;
}

export interface MethodologySection {
  heading: string;
  paragraphs: readonly string[];
}

export interface SourceReference {
  author: string;
  title: string;
  detail: string;
}

export const METHODOLOGY_SECTIONS: readonly MethodologySection[] = [
  {
    heading: "The Seven Classical Planets",
    paragraphs: [
      "Ancient astrology is limited to the seven visible planetary bodies: the Sun, the Moon, Mercury, Venus, Mars, Jupiter, and Saturn. These are the naked-eye wanderers. They are the only objects that a pre-telescopic observer could see moving against the fixed stars across human-scale timeframes, and they form the bedrock of every astrological tradition from Babylon onward.",
      "Modern astrology added Uranus, Neptune, and Pluto after their telescopic discovery. Astra Antiqua does not include them. The intent is to render the sky as it was known to the cultures whose voice the app speaks in, not to retrofit later additions into a historically scoped system.",
    ],
  },
  {
    heading: "Interpretatio Graeca and Beyond",
    paragraphs: [
      "Ancient cultures systematically identified each other's gods. The Greeks called this practice the interpretatio graeca: Egyptian Thoth was identified with Hermes, Canaanite Baal with Zeus, Phoenician Melqart with Heracles, and so on. The Romans inherited and extended this method (interpretatio romana), and the Hellenistic and Imperial periods produced a dense overlay of cross-cultural identifications that show up in inscriptions, magical papyri, and astrological literature.",
      "These identifications were not casual. They were grounded in functional resemblance (sky-god to sky-god, war-god to war-god), iconographic overlap (the cresent, the bull, the trident), and ritual analogy. The five-pantheon translation matrix in this app stands in the same tradition. Each planetary assignment is justified either by direct ancient testimony or by a defensible functional and iconographic argument, and the cases where the evidence is weaker are flagged below.",
    ],
  },
  {
    heading: "Our Translation Matrix",
    paragraphs: [
      "The seven planetary archetypes in this app are derived from the Hellenistic tradition (chiefly Ptolemy's Tetrabiblos and Vettius Valens). The five cultural pantheons are then mapped onto those archetypes using primary sources where available: Ugaritic tablets for Canaan, Hellenistic astrological literature for Greece, Punic inscriptions and Imperial syncretisms for Carthage, Egyptian funerary and astronomical texts (with their later Greco-Egyptian recensions) for Egypt, and the Roman augural tradition with its Sibylline and interpretatio romana literature for Rome.",
      "Some of these mappings are strong and well-attested. Others are reconstructive choices that prioritize legibility for a modern reader over strict philological caution. Those cases are listed in the next section.",
    ],
  },
];

export const INTERPRETIVE_NOTES: readonly InterpretiveNote[] = [
  {
    id: "geb-saturn",
    cultures: ["egypt"],
    title: "Saturn = Geb (Egypt)",
    body: "The Egyptian planetary name for Saturn was 'Horus Bull of the Sky.' We use Geb because his archetypal weight as the ancient earth-father better translates the Saturn principle for modern readers. This is an interpretive choice, not a hard historical identification.",
  },
  {
    id: "tanit-moon",
    cultures: ["carthage"],
    title: "Tanit = Moon (Carthage)",
    body: "Tanit was a composite goddess. Iconography (the crescent over solar disc) and Greek syncretism with Artemis support her lunar identification, and she is conventionally classed as a lunar goddess. She also absorbed many functions of Astarte, the Phoenician Venus, and was identified with Juno Caelestis in Roman Africa. We assign her to the Moon because the iconography is most clear-cut there, and place Astarte at Venus.",
  },
  {
    id: "sebegu-set",
    cultures: ["egypt"],
    title: "Mercury = Sebegu / Set (Egypt)",
    body: "The association of Mercury with Set is attested in later periods. Early Egyptian astronomy named the planet Sebegu without strong identification with a major god. Set's chaotic, swift nature became the predominant association in Greco-Egyptian syncretism.",
  },
  {
    id: "baal-hammon-dual",
    cultures: ["carthage"],
    title: "Baal Hammon at both Jupiter and Saturn (Carthage)",
    body: "Baal Hammon is the chief male deity of Carthage. The Romans equated him with Saturnus in his agricultural and time-keeping role (Saturnus Africanus), but his sky-sovereign aspect maps cleanly to Jupiter as well. Rather than force a single planetary assignment, we let the same deity occupy both seats, with two distinct epithets (Lord of the Sky for Jupiter, the Ancient One for Saturn) marking the functional difference. This dual placement is itself an interpretive choice and is flagged here.",
  },
];

export const SOURCES: readonly SourceReference[] = [
  {
    author: "Frank Moore Cross",
    title: "Canaanite Myth and Hebrew Epic",
    detail: "Harvard University Press, 1973. Standard synthesis of Northwest Semitic religion and the divine council tradition.",
  },
  {
    author: "F. O. Hvidberg-Hansen",
    title: "La déesse TNT: Une étude sur la religion canaanéo-punique",
    detail: "G.E.C. Gad, 1979. Foundational study of Tanit and the Punic religious system.",
  },
  {
    author: "Dennis Pardee",
    title: "Ritual and Cult at Ugarit",
    detail: "Society of Biblical Literature, 2002. Critical translations of the Ugaritic ritual texts.",
  },
  {
    author: "Claudius Ptolemy",
    title: "Tetrabiblos",
    detail: "Second century CE. The classical formalization of Hellenistic astrology and the seven-planet system. Loeb edition (F. E. Robbins, translator) is standard.",
  },
  {
    author: "Vettius Valens",
    title: "Anthology",
    detail: "Second century CE. The most extensive surviving Hellenistic astrological compendium. Mark Riley's English translation is the accessible reference.",
  },
  {
    author: "Otto Neugebauer and Richard Parker",
    title: "Egyptian Astronomical Texts",
    detail: "Brown University Press, three volumes, 1960 to 1969. The standard corpus of Egyptian planetary, decanal, and ceiling-chart material.",
  },
  {
    author: "Roger Beck",
    title: "A Brief History of Ancient Astrology",
    detail: "Blackwell, 2007. Accessible scholarly overview of the Hellenistic synthesis and its sources.",
  },
];
