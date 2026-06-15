export interface LearnSection {
  n: number;
  title: string;
  href: string;
  blurb: string;
}

/** The Learn hub's ordered sections, used by the shared table-of-contents. */
export const LEARN_SECTIONS: readonly LearnSection[] = [
  {
    n: 1,
    title: "How the sky becomes a chart",
    href: "/learn",
    blurb: "What a natal chart is, and the grammar of reading one.",
  },
  {
    n: 2,
    title: "Zodiac sun signs",
    href: "/learn/signs",
    blurb: "The twelve signs, their dates, and their tempers.",
  },
  {
    n: 3,
    title: "The rising sign",
    href: "/learn/rising",
    blurb: "The Ascendant, and why it turns about every two hours.",
  },
  {
    n: 4,
    title: "The houses",
    href: "/learn/houses",
    blurb: "The twelve fields of life the planets fall into.",
  },
  {
    n: 5,
    title: "House systems",
    href: "/learn/house-systems",
    blurb: "Different ways to cut the sky into twelve, and the one we use.",
  },
  {
    n: 6,
    title: "Aspects",
    href: "/learn/aspects",
    blurb: "The angles between planets, and what they mean.",
  },
  {
    n: 7,
    title: "Transits and orbs",
    href: "/learn/transits",
    blurb: "How today's sky touches your birth chart, and how close counts.",
  },
];
