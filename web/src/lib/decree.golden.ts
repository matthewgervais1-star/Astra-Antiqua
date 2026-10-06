import type { Culture } from "@/data/cultures";

/**
 * The day page for 2026-09-29 (00:00 UTC, through the year walk) in five
 * cultures, pinned by decree.test.ts. Rewritten on purpose when a bank line
 * changes.
 */
export const GOLDEN_2026_09_29: Readonly<Record<Culture, { headline: string; evidence: string; paragraph: string }>> = {
  egypt: {
    headline: "Start the heavy thing while the light holds.",
    evidence: "RA △ NUT · 0°19′",
    paragraph:
      "Your day's work and your plans for the new season keep the same pace, and the cord is drawn tight. A sudden change works in your favor. Ra and Nut sit level on the scale, and Anubis leaves the beam alone. On the bank across from Ra and Nut, Khonsu tips the scales against Osiris: your moods and what you have buried pull the sledge two ways. Lift the heaviest stone of the week first, and call on Ra and Nut as you lift it.",
  },
  greece: {
    headline: "Stand up in the assembly and be counted.",
    evidence: "HELIOS △ OURANOS · 0°19′",
    paragraph:
      "Your name in the city and your sudden notions sing the same hymn, and the Pythia does not hesitate. A sudden notion turns out to be a good one. The Pythia takes Helios and Ouranos ahead of the crowd and answers from the tripod. In the agora below Helios and Ouranos, Selene challenges Plouton: your household and your hidden wealth row against each other. Speak first when the assembly opens, and pour a little wine for Helios and Ouranos at noon.",
  },
  canaan: {
    headline: "The council says yes to you today, so ask.",
    evidence: "SHAPASH △ SHAMEM · 0°19′",
    paragraph:
      "Your daily labor and your change of pasture drink from one jar, and the witnesses sign the tablet. A change you did not plan works out well. The assembly waves Shapash and Shamem through, and no god asks for a vow. At the gate below Shapash and Shamem, Yarikh draws the bow against Motu: your kin at home and your grain pits tear at the same fence. Name the thing you want at the gate, and leave a share of the yield for Shapash and Shamem.",
  },
  carthage: {
    headline: "The whole quay will take your note this week.",
    evidence: "SEMES △ BAAL SHAMEM · 0°19′",
    paragraph:
      "Your credit in the harbor and your new routes clear the harbor together, weighed to the last shekel. A new route pays on its first sailing. The clerk adds Semes's column to Baal Shamem's, and the sum closes the sheet. In the column after Semes and Baal Shamem, Tanit turns the prow against Mot: your household accounts and the debts you inherited foul each other's anchors. Ask for the larger loan, and set aside the share of Semes and Baal Shamem.",
  },
  rome: {
    headline: "Walk into the forum as if you own it.",
    evidence: "SOL △ CAELUS · 0°19′",
    paragraph:
      "Your good name and your reforms vote the same way, and the augur marks it in his book. A reform you pushed takes hold. Sol and Caelus rise over a clear sky, and the augur sees birds on the right. Across the forum from Sol and Caelus, Luna raises the spear against Dis Pater: your household affairs and your inheritance quarrel in the Senate. Take the front bench at the next meeting, and hang a garland for Sol and Caelus on the way.",
  },
};
