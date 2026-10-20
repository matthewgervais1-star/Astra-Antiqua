import type { Culture, Planet } from "@/data/cultures";

/**
 * Each culture's names in its own writing (docs/superpowers/specs/2026-10-20-script-reveal.md).
 *
 * Rule 1 of the spec holds here: every script form is a spelling attested for
 * that god or word, with its source beside it. Nothing is transliterated from
 * English. A name with no citable spelling carries script: null and a note
 * saying why, and the reveal shows no effect for it.
 *
 * Blocks: Egypt, Egyptian Hieroglyphs U+13000-U+1342F. Greece, Greek and
 * Greek Extended, polytonic as the texts print it. Canaan, Ugaritic
 * U+10380-U+1039F, with the tablets' word divider U+1039F between words.
 * Carthage, Phoenician U+10900-U+1091F; the inscriptions run words together,
 * so the separator U+1091F marks a word boundary. Rome, inscriptional
 * capitals A to Z with V for U and I for J.
 *
 * en is the name exactly as DEITY_MATRIX, CULTURE_LABELS or CULTURE_VOICES
 * prints it; fr is the established French scholarly form, equal to en where
 * French and English agree.
 *
 * Abbreviations: Wb. = Erman and Grapow, Wörterbuch der ägyptischen Sprache;
 * LGG = Leitz, Lexikon der ägyptischen Götter und Götterbezeichnungen;
 * LSJ = Liddell, Scott and Jones, Greek-English Lexicon; KTU = Dietrich,
 * Loretz and Sanmartín, Die keilalphabetischen Texte aus Ugarit; DUL =
 * del Olmo Lete and Sanmartín, Dictionary of the Ugaritic Language; KAI =
 * Donner and Röllig, Kanaanäische und aramäische Inschriften; CIS =
 * Corpus Inscriptionum Semiticarum; CIL = Corpus Inscriptionum Latinarum.
 */
export interface ScriptForm {
  /** The attested spelling in the culture's script, or null when none can be cited. */
  script: string | null;
  en: string;
  fr: string;
  source: string;
  /** Required when script is null: why there is no script form. */
  note?: string;
}

/** One form per deity seat, keyed like DEITY_MATRIX. */
export const DEITY_SCRIPT_FORMS: Readonly<Record<Culture, Readonly<Record<Planet, ScriptForm>>>> = {
  egypt: {
    sun: {
      script: "𓂋𓂝𓇳",
      en: "Ra",
      fr: "Rê",
      source: "Wb. II 401 (rꜥ); Allen, Middle Egyptian, sign list D21, D36, N5; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
    moon: {
      script: "𓐍𓈖𓇓𓅱",
      en: "Khonsu",
      fr: "Khonsou",
      source: "Leitz, LGG, s.v. Ḫnsw; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
    mercury: {
      script: null,
      en: "Sebegu",
      fr: "Sebegou",
      source: "Neugebauer and Parker, Egyptian Astronomical Texts III (1969), planet lists",
      note: "The planet name Sbg(w) is attested in the astronomical ceilings, but no sign sequence for it could be confirmed against Neugebauer and Parker or LGG on 2026-10-20. Left null rather than spelled from the transliteration.",
    },
    venus: {
      script: "𓊨𓏏𓆇𓁐",
      en: "Isis",
      fr: "Isis",
      source: "Leitz, LGG, s.v. Ꜣs.t; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
    mars: {
      script: null,
      en: "Horus the Red",
      fr: "Horus le Rouge",
      source: "Neugebauer and Parker, Egyptian Astronomical Texts III (1969), planet lists",
      note: "Ḥr dšr is the planet name in the ceilings, but the writing of dšr in those texts (with or without the flamingo G27) could not be confirmed against a source on 2026-10-20. Left null; the falcon alone would misname the planet.",
    },
    jupiter: {
      script: "𓇋𓏠𓈖𓁩",
      en: "Amun",
      fr: "Amon",
      source: "Leitz, LGG, s.v. Jmn; Allen, Middle Egyptian, sign list M17, Y5, N35; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
    saturn: {
      script: "𓅬𓃀𓀭",
      en: "Geb",
      fr: "Geb",
      source: "Leitz, LGG, s.v. Gbb; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
    uranus: {
      script: "𓏌𓏏𓇯",
      en: "Nut",
      fr: "Nout",
      source: "Leitz, LGG, s.v. Nw.t; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
    neptune: {
      script: "𓏌𓏌𓏌𓇯𓈗",
      en: "Nun",
      fr: "Noun",
      source: "Faulkner, Concise Dictionary of Middle Egyptian (1962), s.v. Nnw; sign sequence checked against en.wiktionary nnw, 2026-10-20",
      note: "Egyptologists debate the reading (nnw, nww, nwn); the writing with three nw-pots, sky and water is not in doubt.",
    },
    pluto: {
      script: "𓊨𓁹𓀭",
      en: "Osiris",
      fr: "Osiris",
      source: "Leitz, LGG, s.v. Wsjr; Allen, Middle Egyptian, sign list Q1, D4; sign sequence checked against the en.wikipedia infobox, 2026-10-20",
    },
  },
  greece: {
    sun: {
      script: "Ἥλιος",
      en: "Helios",
      fr: "Hélios",
      source: "Homeric Hymn 31 (to Helios); Plato, Cratylus 408e-409a; LSJ s.v. ἥλιος",
    },
    moon: {
      script: "Σελήνη",
      en: "Selene",
      fr: "Séléné",
      source: "Homeric Hymn 32 (to Selene); Plato, Cratylus 409a-b; LSJ s.v. σελήνη",
    },
    mercury: {
      script: "Ἑρμῆς",
      en: "Hermes",
      fr: "Hermès",
      source: "Homeric Hymn 4 (to Hermes); Plato, Cratylus 407e-408b; LSJ s.v. Ἑρμῆς",
    },
    venus: {
      script: "Ἀφροδίτη",
      en: "Aphrodite",
      fr: "Aphrodite",
      source: "Homeric Hymn 5 (to Aphrodite); Hesiod, Theogony 195; LSJ s.v. Ἀφροδίτη",
    },
    mars: {
      script: "Ἄρης",
      en: "Ares",
      fr: "Arès",
      source: "Homeric Hymn 8 (to Ares); Plato, Cratylus 407c-d; LSJ s.v. Ἄρης",
    },
    jupiter: {
      script: "Ζεύς",
      en: "Zeus",
      fr: "Zeus",
      source: "Hesiod, Theogony 886; Plato, Cratylus 395e-396b; LSJ s.v. Ζεύς",
    },
    saturn: {
      script: "Κρόνος",
      en: "Kronos",
      fr: "Cronos",
      source: "Hesiod, Theogony 137; Plato, Cratylus 396b; LSJ s.v. Κρόνος",
    },
    uranus: {
      script: "Οὐρανός",
      en: "Ouranos",
      fr: "Ouranos",
      source: "Hesiod, Theogony 126-127; Plato, Cratylus 396b-c; LSJ s.v. οὐρανός",
    },
    neptune: {
      script: "Ποσειδῶν",
      en: "Poseidon",
      fr: "Poséidon",
      source: "Plato, Cratylus 402d-403a (Attic form; Homer writes Ποσειδάων); LSJ s.v. Ποσειδῶν",
    },
    pluto: {
      script: "Πλούτων",
      en: "Plouton",
      fr: "Ploutôn",
      source: "Plato, Cratylus 403a; Sophocles, Antigone 1200; LSJ s.v. Πλούτων",
    },
  },
  canaan: {
    sun: {
      script: "𐎌𐎔𐎌",
      en: "Shapash",
      fr: "Shapash",
      source: "KTU 1.6 (nrt ilm špš, passim); KTU 1.47 (deity list)",
    },
    moon: {
      script: "𐎊𐎗𐎃",
      en: "Yarikh",
      fr: "Yarikh",
      source: "KTU 1.24 (Nikkal and Yarikh); KTU 1.47 (deity list)",
    },
    mercury: {
      script: "𐎋𐎘𐎗",
      en: "Kothar",
      fr: "Kothar",
      source: "KTU 1.2 IV (kṯr fashions the two maces); KTU 1.47 (deity list)",
    },
    venus: {
      script: "𐎓𐎘𐎚𐎗𐎚",
      en: "Attart",
      fr: "Athtart",
      source: "KTU 1.2 IV 28 (ʿṯtrt rebukes Baal); KTU 1.47 (deity list)",
    },
    mars: {
      script: "𐎗𐎌𐎔",
      en: "Resheph",
      fr: "Resheph",
      source: "KTU 1.14 I 18-19 (ršp takes a share of Kirta's house); KTU 1.47 (deity list)",
    },
    jupiter: {
      script: "𐎁𐎓𐎍𐎟𐎅𐎄",
      en: "Baal Hadad",
      fr: "Baal Hadad",
      source: "KTU 1.1-1.6 (bʿl and hd as names of the one storm god in the Baal cycle); DUL s.v. bʿl (II), hd",
      note: "The texts set bʿl and hd in poetic parallel; the two words written together here are the modern compound name, each word attested.",
    },
    saturn: {
      script: "𐎛𐎍",
      en: "El",
      fr: "El",
      source: "KTU 1.4 IV (ltpn il dpid); KTU 1.47 (deity list)",
    },
    uranus: {
      script: "𐎌𐎎𐎎",
      en: "Shamem",
      fr: "Shamem",
      source: "KTU 1.47 (deity list, arṣ w šmm)",
    },
    neptune: {
      script: "𐎊𐎎",
      en: "Yammu",
      fr: "Yam",
      source: "KTU 1.2 III-IV (zbl ym, ṯpṭ nhr)",
    },
    pluto: {
      script: "𐎎𐎚",
      en: "Motu",
      fr: "Mot",
      source: "KTU 1.5 and 1.6 (bn ilm mt)",
    },
  },
  carthage: {
    sun: {
      script: "𐤔𐤌𐤔",
      en: "Semes",
      fr: "Semes",
      source: "KAI 26 A III 19 (Karatepe, šmš ʿlm); Punic theophoric names in ʿbdšmš, CIS I",
    },
    moon: {
      script: "𐤕𐤍𐤕",
      en: "Tanit",
      fr: "Tanit",
      source: "KAI 78 and KAI 79 (Carthage tophet stelae, lrbt ltnt pn bʿl)",
    },
    mercury: {
      script: "𐤎𐤊𐤍",
      en: "Sakun",
      fr: "Sakun",
      source: "Benz, Personal Names in the Phoenician and Punic Inscriptions (1972), s.v. SKN (Punic grskn and related names)",
      note: "The god is attested at Carthage through theophoric personal names, not through a dedication in his own name.",
    },
    venus: {
      script: "𐤏𐤔𐤕𐤓𐤕",
      en: "Astarte",
      fr: "Astarté",
      source: "KAI 81 (Carthage, lʿštrt wltnt blbnn); KAI 14 (Sidon)",
    },
    mars: {
      script: "𐤌𐤋𐤒𐤓𐤕",
      en: "Melqart",
      fr: "Melqart",
      source: "KAI 47 (Malta cippi, lʾdnn lmlqrt bʿl ṣr)",
    },
    jupiter: {
      script: "𐤁𐤏𐤋𐤟𐤇𐤌𐤍",
      en: "Baal Hammon",
      fr: "Baal Hammon",
      source: "KAI 78 and KAI 79 (Carthage tophet stelae, lʾdn lbʿl ḥmn)",
      note: "The stelae run the two words together; the word separator U+1091F marks the boundary for the reader.",
    },
    saturn: {
      script: "𐤁𐤏𐤋𐤟𐤇𐤌𐤍",
      en: "Baal Hammon",
      fr: "Baal Hammon",
      source: "KAI 78 and KAI 79 (Carthage tophet stelae, lʾdn lbʿl ḥmn)",
      note: "The stelae run the two words together; the word separator U+1091F marks the boundary for the reader.",
    },
    uranus: {
      script: "𐤁𐤏𐤋𐤟𐤔𐤌𐤌",
      en: "Baal Shamem",
      fr: "Baal Shamem",
      source: "KAI 26 A III 18 (Karatepe, bʿl šmm); KAI 4 (Byblos, bʿlšmm)",
      note: "Phoenician, not Punic: no Carthaginian dedication to the god could be cited.",
    },
    neptune: {
      script: null,
      en: "Yam",
      fr: "Yam",
      source: "KTU 1.2 (Ugaritic ym, not Punic)",
      note: "No Phoenician or Punic inscription that names Yam as a god could be cited. The Ugaritic spelling ym belongs to Canaan, not Carthage.",
    },
    pluto: {
      script: null,
      en: "Mot",
      fr: "Mot",
      source: "Philo of Byblos, via Eusebius, Praeparatio evangelica 1.10 (Greek Μώθ)",
      note: "Mot survives for Phoenicia only in Philo of Byblos's Greek; no Phoenician or Punic inscription that names him could be cited.",
    },
  },
  rome: {
    sun: {
      script: "SOL",
      en: "Sol",
      fr: "Sol",
      source: "CIL VI 701 and 702 (Augustus's obelisks, SOLI DONVM DEDIT); Cicero, De natura deorum 2.68",
    },
    moon: {
      script: "LVNA",
      en: "Luna",
      fr: "Luna",
      source: "Cicero, De natura deorum 2.68 (Luna a lucendo); Varro, De lingua Latina 5.68",
    },
    mercury: {
      script: "MERCVRIVS",
      en: "Mercurius",
      fr: "Mercure",
      source: "Cicero, De natura deorum 2.53 (stella Mercurii) and 3.56",
    },
    venus: {
      script: "VENVS",
      en: "Venus",
      fr: "Vénus",
      source: "Cicero, De natura deorum 2.53 (stella Veneris) and 2.69",
    },
    mars: {
      script: "MARS",
      en: "Mars",
      fr: "Mars",
      source: "Cicero, De natura deorum 2.53 (stella Martis) and 2.67",
    },
    jupiter: {
      script: "IVPPITER",
      en: "Iuppiter",
      fr: "Jupiter",
      source: "Cicero, De natura deorum 2.52 (stella Iovis) and 2.64 (Iuppiter, id est iuvans pater)",
    },
    saturn: {
      script: "SATVRNVS",
      en: "Saturnus",
      fr: "Saturne",
      source: "Cicero, De natura deorum 2.52 (stella Saturni) and 2.64",
    },
    uranus: {
      script: "CAELVS",
      en: "Caelus",
      fr: "Caelus",
      source: "Ennius, Annales (Saturnus quem Caelus genuit); Cicero, De natura deorum 2.63 and 3.44",
      note: "Cicero's cases (Caelum, Caeli) do not fix the gender; the masculine nominative rests on the Ennius fragment.",
    },
    neptune: {
      script: "NEPTVNVS",
      en: "Neptunus",
      fr: "Neptune",
      source: "Cicero, De natura deorum 2.66 (Neptunus a nando)",
    },
    pluto: {
      script: "DIS PATER",
      en: "Dis Pater",
      fr: "Dis Pater",
      source: "Cicero, De natura deorum 2.66 (Diti patri dedicata est, qui dives)",
    },
  },
};

/** The culture's own name, resolving to CULTURE_LABELS. */
export const CULTURE_NAME_FORMS: Readonly<Record<Culture, ScriptForm>> = {
  egypt: {
    script: "𓆎𓅓𓏏𓊖",
    en: "Egypt",
    fr: "Égypte",
    source: "Wb. V 126 (Km.t); sign sequence checked against en.wikipedia Names of Egypt, 2026-10-20",
    note: "The script reads Kmt, Kemet, the Black Land.",
  },
  greece: {
    script: "Ἑλλάς",
    en: "Greece",
    fr: "Grèce",
    source: "Herodotus, Histories, passim; LSJ s.v. Ἑλλάς",
    note: "The script reads Hellas.",
  },
  canaan: {
    script: "𐎜𐎂𐎗𐎚",
    en: "Canaan",
    fr: "Canaan",
    source: "KTU 1.6 VI colophon (nqmd mlk ugrt)",
    note: "The script reads ugrt, Ugarit, the city whose tablets carry this culture. The gentilic kn'ny is too rare to set as the culture's name.",
  },
  carthage: {
    script: "𐤒𐤓𐤕𐤇𐤃𐤔𐤕",
    en: "Carthage",
    fr: "Carthage",
    source: "Siculo-Punic tetradrachm legend qrtḥdšt (Jenkins, Punic Sicily, SNR 1974-1978)",
    note: "The script reads qrtḥdšt, Qart-hadasht, the New City.",
  },
  rome: {
    script: "ROMA",
    en: "Rome",
    fr: "Rome",
    source: "Crawford, Roman Republican Coinage 44/5 (denarius, legend ROMA)",
  },
};

/** The institution heading in CULTURE_VOICES, keyed by culture; en is the heading as printed. */
export const INSTITUTION_FORMS: Readonly<Record<Culture, ScriptForm>> = {
  egypt: {
    script: "𓌷𓂝𓏏𓁦",
    en: "THE HALL OF MA’AT",
    fr: "LA SALLE DE MAÂT",
    source: "Wb. II 18 (mꜣꜥ.t); sign sequence checked against the en.wikipedia infobox, 2026-10-20 (Maat)",
    note: "The script reads mꜣꜥt, Maat, with the seated goddess. The hall itself, wsḫt mꜣꜥty of Book of the Dead 125, is not set because its writing could not be confirmed.",
  },
  greece: {
    script: "χρηστήριον",
    en: "THE DAY'S ORACLE",
    fr: "L’ORACLE DU JOUR",
    source: "Herodotus 1.46-47 (Croesus tests the χρηστήρια); LSJ s.v. χρηστήριον",
    note: "The script reads chrēstērion, the oracle.",
  },
  canaan: {
    script: "𐎔𐎃𐎗𐎟𐎎𐎓𐎄",
    en: "THE COUNCIL OF EL",
    fr: "LE CONSEIL D’EL",
    source: "KTU 1.2 I 14, 20, 31 (pḫr mʿd)",
    note: "The script reads pḫr mʿd, the assembled council.",
  },
  carthage: {
    script: null,
    en: "THE DECREE OF THE TOPHET",
    fr: "LE DÉCRET DU TOPHET",
    source: "Jeremiah 7:31 (Hebrew tpt); no Punic attestation",
    note: "Tophet is the Hebrew Bible's word; no Punic inscription names the precinct, so the heading has no native script form.",
  },
  rome: {
    script: "AVSPICIA",
    en: "THE AUSPICES OF THE DAY",
    fr: "LES AUSPICES DU JOUR",
    source: "Res Gestae Divi Augusti 4 (auspicis meis, Monumentum Ancyranum); Cicero, De divinatione 1.3",
    note: "The script reads auspicia, the auspices.",
  },
};
