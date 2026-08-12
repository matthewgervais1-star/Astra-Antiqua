import type { Culture } from "@/data/cultures";

export interface CulturalOrientation {
  cultureLabel: string;
  shortTagline: string;
  paragraphs: readonly [string, string];
}

export const CULTURAL_ORIENTATIONS: Readonly<Record<Culture, CulturalOrientation>> = {
  egypt: {
    cultureLabel: "Egypt",
    shortTagline:
      "The voyage of the solar barque, the weighing of the heart, the ceiling charts of the New Kingdom.",
    paragraphs: [
      "Egyptian cosmology turns on the opposition of Ma'at (cosmic order, balance, truth) and Isfet (chaos, disorder, the unmaking of the world). The ten planetary bodies read here, the seven the priests named and the three the modern age received, do not stand outside this scheme. They are participants in the daily voyage of Ra's solar barque across the sky and through the underworld, and their movements were read as moments in that voyage rather than as a separate technical apparatus.",
      "Of all the ancient astronomical traditions, the Egyptian record is exceptionally well-preserved. Funerary texts, decanal star clocks, and the painted ceilings of New Kingdom tombs (the Senenmut chart, the astronomical ceiling of Seti I) give us a denser corpus than survives from most contemporary cultures. The planetary names used in this app are drawn from these sources, with the caveat that Egyptian planetary nomenclature shifted over the New Kingdom, Late Period, and Greco-Roman strata.",
    ],
  },
  greece: {
    cultureLabel: "Greece",
    shortTagline:
      "The Hellenistic synthesis. Alexandria, the Tetrabiblos, the seven planets formalized, three more received since.",
    paragraphs: [
      "Greek astrology as we recognize it is a Hellenistic product. After the conquests of Alexander, Babylonian celestial knowledge (which already had centuries of detailed planetary observation behind it) met Greek geometric thinking and philosophical method in cities like Alexandria. The result was the tradition codified by Vettius Valens in the Anthology and given its classical form by Claudius Ptolemy in the Tetrabiblos.",
      "The Greek pantheon used in this app is the Hellenistic one: the seven classical planets bear the Olympian names that the syncretism of the period settled on, with Apollo (light) and Helios (the older Titan) often overlapping in solar contexts, and three further received bodies extend that same ten-body table on equal Olympian footing. The Hermetic tradition, attributed to the legendary Hermes Trismegistus, sits alongside the technical literature and supplies much of the symbolic vocabulary that later European astrology inherited.",
    ],
  },
  canaan: {
    cultureLabel: "Canaan",
    shortTagline:
      "Ugarit, the Baal cycle, the divine council at the mountain.",
    paragraphs: [
      "The Canaanite material in this app draws first from the Ugaritic texts discovered at Ras Shamra on the Syrian coast in 1928. These tablets, dated to the fourteenth and thirteenth centuries BCE, contain the Baal cycle, the story of Aqhat, the legend of Kirta, and the ritual and god-list literature that together give us the deepest reservoir of Northwest Semitic religion we possess. Frank Moore Cross's Canaanite Myth and Hebrew Epic remains the standard synthesis.",
      "The Canaanite divine council (the assembly of the gods presided over by El, attended by Baal Hadad as active king, Shapash as messenger, and the other named deities) provides the dramatic frame for the interpretive voice this app uses for the Canaanite pantheon. Ten planetary identifications are seated here: seven reconstructed from Ugaritic theogonic order, iconographic correspondence, and the systematic Greek and Roman syncretisms of the Hellenistic and Imperial periods, and three received bodies given seats at the same council by the modern method this app names plainly wherever it is used.",
    ],
  },
  carthage: {
    cultureLabel: "Carthage",
    shortTagline:
      "Qart-hadasht. Tanit and Baal Hammon. A religion known mostly through its enemies.",
    paragraphs: [
      "Carthage (Punic: Qart-hadasht, the New City) was founded as a Phoenician colony from Tyre, traditionally in the late ninth century BCE. Its religion is a direct inheritance from the Canaanite-Phoenician world, modified by long contact with the indigenous Berber populations of North Africa and by the political requirements of a maritime empire. The two central deities of the Punic period are Tanit, the chief tutelary goddess, and Baal Hammon, the chief male deity.",
      "Almost no Punic literature survives. What we know about Punic religion comes from inscriptions (votive stelae, the dedications from the Tophet), from archaeology, and from accounts written by Greek and Roman authors who were often actively hostile. The result is that any reconstruction of Punic theology requires interpretive humility, and the planetary identifications in this app are flagged on the methodology page where they involve disputed evidence.",
    ],
  },
  rome: {
    cultureLabel: "Rome",
    shortTagline:
      "The Capitoline. The auspices. The names that still order the week.",
    paragraphs: [
      "Rome took the Greek pantheon almost wholesale through the interpretatio romana, identifying its own gods with the Olympians: Iuppiter with Zeus, Venus with Aphrodite, Mars with Ares. But the names that matter for astrology are the Roman ones. Mercury, Venus, Mars, Jupiter, and Saturn are simply these gods, and they reach every modern European language through the Roman calendar, which makes Rome the most direct ancestor of the planetary vocabulary the rest of this app translates away from.",
      "Roman astrology was a high-stakes civic practice rather than a private comfort. Emperors employed astrologers and also feared them; the expulsions of astrologers from the city under Tiberius and others show how seriously the readings of the sky were taken. The seven-day planetary week that still orders the calendar is a Roman inheritance from the Hellenistic synthesis, each day named for one of the seven gods who name the planets; this app enrolls three further bodies beside them, received rather than calendared, and says so wherever they appear.",
    ],
  },
};
