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
    body: "Ares strikes against the throne of Apollo. The god of light is questioned today by the god of slaughter. The Pythia sees a forced choice: speak the truth that costs you, or hold the comfort that diminishes you. Both gods are watching. Neither is patient.",
  },
  canaan: {
    oracleName: "The Divine Council",
    sampleTransit: "Sun square Mars · sample transit",
    body: "The council convenes. Resheph stands before Shapash with his bow drawn. The luminary of the deities does not flinch. A judgment is being prepared against your name. Bring evidence of your conduct to the assembly, or let El's silence be your verdict.",
  },
  carthage: {
    oracleName: "The Decree of the Tophet",
    sampleTransit: "Sun square Mars · sample transit",
    body: "Melqart raises his hand against Semes. The protector of the mother city demands a price for the protection he offers. Walk to the Tophet today knowing what you carry. Lay down the comfort you cannot afford to keep. The fire that takes it is not punishment. It is the cost of being defended.",
  },
};
