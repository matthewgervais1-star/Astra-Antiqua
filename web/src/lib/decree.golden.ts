import type { Culture } from "@/data/cultures";

/**
 * The day page for 2026-09-29 (00:00 UTC, through the year walk) in five
 * cultures, pinned by decree.test.ts. Rewritten on purpose when a bank line
 * changes.
 */
export const GOLDEN_2026_09_29: Readonly<Record<Culture, { headline: string; evidence: string; paragraph: string }>> = {
  egypt: {
    headline: "Do not act on the mood you wake up with before the sun is high.",
    evidence: "KHONSU □ HORUS THE RED · 4°57′",
    paragraph:
      "Your moods and your temper haul on opposite ropes. Nothing moves today without someone dragging against it. Khonsu clouds the water where Horus the Red wants to cross, and the boatman waits for dawn. On the far bank, Ra rows in time with Nut: your day's work and your plans for the new season float on the same current. Say nothing at home until you have eaten, and leave the first bite for Khonsu and Horus the Red.",
  },
  greece: {
    headline: "Do not ask the oracle what you are not ready to hear.",
    evidence: "SELENE □ ARES · 4°57′",
    paragraph:
      "Your household and your fighting strength argue at the same gate. The answer you want is not the answer you get. Selene hides behind cloud from Ares, and the night sailors argue over the stars. Down in the agora, Helios moves in accord with Ouranos: your name in the city and your sudden notions keep step with each other. Let the household argument end at the door, and ask Selene and Ares for a quiet night.",
  },
  canaan: {
    headline: "Keep the family quarrel inside the tent.",
    evidence: "YARIKH □ RESHEPH · 4°57′",
    paragraph:
      "Your kin at home and your hot blood quarrel at the gate. Someone objects to you in front of the council. Yarikh quarrels with Resheph over the bride price, and the families leave the table. At the city gate, Shapash speaks favor over Shamem: your daily labor and your change of pasture sit at the same table. Let your kin speak tonight and answer them tomorrow, and ask Yarikh and Resheph for quiet.",
  },
  carthage: {
    headline: "Do not balance the house ledger in a temper.",
    evidence: "TANIT □ MELQART · 4°57′",
    paragraph:
      "Your household accounts and your war chest fight over the same silver. Someone changes the terms on you. Tanit looks away from Melqart's altar, and the household accounts do not balance. In the next column, Semes lights the harbor for Baal Shamem: your credit in the harbor and your new routes add up on the first pass. Leave the household books shut until morning, and keep a lamp lit for Tanit and Melqart.",
  },
  rome: {
    headline: "The household is quarrelsome, and the neighbors are listening.",
    evidence: "LUNA □ MARS · 4°57′",
    paragraph:
      "Your household affairs and your campaign block each other's road. Your business is put off. Luna turns red in eclipse before Mars, and the household bangs bronze pots to drive off the shadow. Across the forum, Sol clasps the right hand of Caelus: your good name and your reforms sit on the same side of the Senate. Settle household quarrels inside the walls, and give a cake to Luna and Mars at the household shrine.",
  },
};
