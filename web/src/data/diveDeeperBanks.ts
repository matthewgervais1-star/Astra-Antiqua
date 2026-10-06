import type { Culture } from "@/data/cultures";

/**
 * The day page's "dive deeper" (docs/superpowers/specs/2026-09-29-daily-
 * reading-voice.md, section A.6): four titled paragraphs, one per house
 * group, in the order cultureVoice.houseGroups fixes (work and substance,
 * home and kin, words and errands, the inner court). lib/diveDeeper.ts
 * composes each paragraph from banks that already exist (the domains, the
 * day's relations, the consequences, and the figure page's manifestations);
 * only what composition cannot produce is authored here.
 *
 * Plain strings with one named slot, so the Android generator carries them
 * across without parsing code. No line repeats across two cultures.
 */
export interface DiveDeeperBank {
  /** Each group's name and its concern in plain words, in the group order. */
  titles: readonly [string, string, string, string];
  /** What a group says when no figure touches it, in the group order. */
  quiet: readonly [string, string, string, string];
  /**
   * The paragraph's last line: one concrete thing the reader will meet,
   * drawn from the figure page's manifestations for the group and the tone.
   * Slot: {thing}, a lowercase noun phrase.
   */
  concrete: string;
}

export const DIVE_DEEPER_BANKS: Readonly<Record<Culture, DiveDeeperBank>> = {
  egypt: {
    titles: [
      "The Granary: your work and your rations",
      "The House of the Ka: your home and your forebears",
      "The Ferry: your letters and your crossings",
      "The Sealed Shrine: what you keep to yourself",
    ],
    quiet: [
      "No figure reaches the granary today. Draw your ration and work the row you were given.",
      "The house of the ka stands apart from the day's figures. Fill the ancestors' lamp and eat at home.",
      "Nothing waits at the ferry landing today. Send what you owe by the usual boat.",
      "The sealed shrine stays shut, and no figure knocks. Say the morning hymn and leave it there.",
    ],
    concrete: "Reckon on {thing}.",
  },
  greece: {
    titles: [
      "The Agora: your silver and your trade",
      "The Oikos: your hearth and your kin",
      "The Herm: your messages and your roads",
      "The Adyton: the questions you ask alone",
    ],
    quiet: [
      "The agora is empty of figures today. Sell at yesterday's price and count the silver once.",
      "No figure crosses the threshold of the oikos today. Bank the hearth and eat with your household.",
      "The herm stands alone at the crossroads today. Send your messages by the road you always take.",
      "The adyton is silent today. Keep your question for a day when the tripod speaks.",
    ],
    concrete: "Take {thing} as Delphi's reply.",
  },
  canaan: {
    titles: [
      "The Threshing Floor: your labor and your yield",
      "The Father's House: your kin and your birthright",
      "The Gate: your word and your witnesses",
      "The Tent of El: your prayers and your vows",
    ],
    quiet: [
      "No matter comes to the threshing floor today. Thresh the sheaves you have and sweep the floor at dusk.",
      "The father's house has no case before the council today. Break bread with your kin and settle nothing.",
      "No one is called to the gate today. Greet the elders and go about your errands.",
      "The tent of El stays closed today. Say the evening prayer and go to sleep.",
    ],
    concrete: "Be ready for {thing}.",
  },
  carthage: {
    titles: [
      "The Counting House: your wages and your weights",
      "The Courtyard: your household and your heirs",
      "The Harbor: your contracts and your ships",
      "The Precinct: the vows you still owe",
    ],
    quiet: [
      "The counting house posts no new entry today. Pay the wages on the list and lock the strongbox.",
      "Nothing is charged to the courtyard today. Check the household book and close it.",
      "No figure touches the harbor today. Let the ships keep their posted sailings.",
      "The precinct asks nothing new of you today. Pay what you vowed, when you vowed it, and no more.",
    ],
    concrete: "Enter it in the daybook: {thing}.",
  },
  rome: {
    titles: [
      "The Forum: your standing and your coin",
      "The Domus: your family and your Lares",
      "The Via: your dispatches and your errands",
      "The Templum: the signs you take in private",
    ],
    quiet: [
      "The forum shows no sign for you today. Receive your clients and keep your appointments.",
      "The domus is left out of the day's auspices. Feed the Lares and keep the household to its routine.",
      "The road is clear today. Send the dispatches you planned.",
      "The templum gives no sign today. Leave the auspices alone and keep your vows.",
    ],
    concrete: "Count {thing} as a sign.",
  },
};
