import type { Culture } from "@/data/cultures";

export interface OracleDecree {
  oracleName: string;
  body: string;
  sampleTransit: string;
}

export const ORACLE_DECREES: Readonly<Record<Culture, OracleDecree>> = {
  egypt: {
    oracleName: "The Hall of Ma'at",
    sampleTransit: "Sun square Mars · sample transit",
    body: "The scales tilt today. Horus the Red rises in challenge to Ra's authority. The feather of Ma'at trembles against the heart. What you have built is being weighed. Act with measured force, not haste, and the order holds. Refuse the test, and Isfet enters.",
  },
  greece: {
    oracleName: "The Oracle of Delphi",
    sampleTransit: "Sun square Mars · sample transit",
    body: "Ares strikes against the chariot of Helios. The god who sees everything is questioned today by the god of slaughter. The Pythia sees a forced choice: speak the truth that costs you, or hold the comfort that diminishes you. Both gods are watching. Neither is patient.",
  },
  canaan: {
    oracleName: "The Divine Council",
    sampleTransit: "Sun square Mars · sample transit",
    body: "The council convenes. Resheph stands before Shapash with his bow drawn. The luminary of the deities does not flinch. A judgment is being prepared against your name. Bring evidence of your conduct to the assembly, or let El's silence be your verdict.",
  },
  carthage: {
    oracleName: "The Decree of the Council",
    sampleTransit: "Sun square Mars · sample transit",
    body: "Melqart raises his hand against Semes. The protector of the mother city demands a price for the protection he offers. Bring it before the Council today knowing what you carry. Lay down the comfort you cannot afford to keep. The fire of Melqart that takes it is not punishment. It is the cost of being defended.",
  },
  rome: {
    oracleName: "The Sibylline Books",
    sampleTransit: "Sun square Mars · sample transit",
    body: "Mars Pater raises his spear against Sol Invictus. The father of the legions questions the unconquered sun, and Rome does not ask whether to fight. It asks where the line is drawn and who is left to hold it. Take the auspices before you march. The eagles, once raised, do not turn back.",
  },
};
