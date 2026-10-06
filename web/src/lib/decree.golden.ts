import type { Culture } from "@/data/cultures";

/**
 * The day page for 2026-09-29 (the sky at 00:00 UTC) in five
 * cultures, pinned by decree.test.ts. Rewritten on purpose when a bank line
 * changes.
 */
export const GOLDEN_2026_09_29: Readonly<Record<Culture, { headline: string; evidence: string; paragraph: string }>> = {
  egypt: {
    headline: "Start the heavy thing while the light holds.",
    evidence: "RA △ NUT · EXACT",
    paragraph:
      "Your day's work and your plans for the new season keep the same pace, and the cord is drawn tight. A sudden change works in your favor. Ra sits level on the scale, and Anubis leaves the beam alone. On the bank across from Ra and Nut, Khonsu tips the scales against Osiris: your moods and what you have buried get in each other's way. Lift the heaviest stone of the week first, and call on Ra as you lift it.",
  },
  greece: {
    headline: "Stand up in the assembly and be counted.",
    evidence: "HELIOS △ OURANOS · EXACT",
    paragraph:
      "Your name in the city and your sudden notions agree without argument, and the Pythia does not hesitate. A sudden notion turns out to be a good one. The Pythia takes Helios ahead of the crowd and answers from the tripod. In the agora below Helios and Ouranos, Selene challenges Plouton: your household and your hidden wealth work against each other. Speak first when the assembly opens, and pour a little wine for Helios at noon.",
  },
  canaan: {
    headline: "The council says yes to you today, so ask.",
    evidence: "SHAPASH △ SHAMEM · EXACT",
    paragraph:
      "Your daily labor and your change of pasture keep pace with each other, and the witnesses sign the tablet. A change you did not plan works out well. The assembly waves Shapash through, and no god asks for a vow. At the gate below Shapash and Shamem, Yarikh draws the bow against Motu: your kin at home and your family's land trip each other up. Name the thing you want at the gate, and leave a share of the yield for Shapash.",
  },
  carthage: {
    headline: "Your name is good for credit anywhere on the quay.",
    evidence: "SEMES △ BAAL SHAMEM · EXACT",
    paragraph:
      "Your credit in the harbor and your new routes pay off together, weighed to the last shekel. A new route pays on its first sailing. The clerk adds Semes's column once, and the sum closes the sheet. In the column after Semes and Baal Shamem, Tanit turns the prow against Mot: your household accounts and the debts you inherited eat into each other. Ask for the larger loan, and set aside Semes's share.",
  },
  rome: {
    headline: "Speak in the forum, because they are ready to listen.",
    evidence: "SOL △ CAELUS · EXACT",
    paragraph:
      "Your good name and your reforms see eye to eye, and the augur marks it in his book. A reform you pushed takes hold. Sol rises over a clear sky, and the augur sees birds on the right. Across the forum from Sol and Caelus, Luna raises the spear against Dis Pater: your household affairs and your inheritance clash. Take the front bench at the next meeting, and hang a garland for Sol on the way.",
  },
};
