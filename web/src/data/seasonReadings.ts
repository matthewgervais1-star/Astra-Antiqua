import type { ZodiacSign } from "@/data/sampleChart";

/**
 * Hand-written season readings, one per zodiac season (the Sun's month-long
 * transit of a sign), in the blunt diagnostic register of the daily corpus:
 * a directive headline and a body scaled to a thirty-day stretch rather than
 * a single day. Universal; the deity narrator, the visitor's house, and the
 * dated beats layer on around it.
 */
export interface SeasonReading {
  headline: string;
  body: string;
}

export const SEASON_READINGS: Readonly<Record<ZodiacSign, SeasonReading>> = {
  Aries: {
    headline: "Start what the year will finish.",
    body: "The Sun's month in Aries favors the opening move: the application sent, the first training day, the conversation that starts the change. You do not need the whole plan; you need ignition. Pick the one thing you keep postponing for a readier version of yourself and begin it badly this week. Momentum will do the polishing. The trap of the season is starting five things. Light one fire and feed it.",
  },
  Taurus: {
    headline: "Make it solid.",
    body: "After the ignition month comes the building month. Taurus season pays whoever shows up steadily: the savings put aside, the ground actually tended, the routine kept when the mood is gone. Slow is not behind. Spend the month converting one burst of enthusiasm into a system that survives without enthusiasm, and feed the body properly. This month it is the instrument everything else depends on.",
  },
  Gemini: {
    headline: "Talk to everyone.",
    body: "Gemini season scatters attention on purpose. The month rewards circulation: messages answered, introductions made, questions asked, drafts shared before they feel ready. You are not supposed to go deep right now; you are supposed to go wide, and the depth comes later, built from what you gathered. Keep a notebook close. The season's stray sentence often becomes the year's project.",
  },
  Cancer: {
    headline: "Tend the inner rooms.",
    body: "The Sun's month in Cancer turns the tide inward: home, kin, memory, the people who knew you before your titles. Repair something domestic, whether it is the room, the recipe, or the relationship you have left unanswered. Decline the optional obligations without apologizing for it. What you shelter this month will shelter you when the loud half of the year returns.",
  },
  Leo: {
    headline: "Be seen on purpose.",
    body: "Leo season is the year's high noon. Show the work with your name on it: take the stage, the credit, the photograph. Generosity is the register of the month, and praise given freely comes back doubled. The trap is performing instead of shining, and the difference is whether you would still do the thing with no one watching. Spend the month on the things you would.",
  },
  Virgo: {
    headline: "Bring in the harvest.",
    body: "Virgo season is for sorting what the year has grown: keep, fix, discard. Book the checkup, mend the process, finish the ragged edges of whatever you launched in the spring. Precision is a form of devotion here, and one real repair is worth ten critiques. Aim none of the season's sharpened eye at yourself.",
  },
  Libra: {
    headline: "Balance the scales.",
    body: "Libra season weighs everything in pairs: you and the partner, the work and the rest, what you give against what you get. Hold the overdue negotiation while the light favors fairness, and hear the other side all the way out. But balance is not appeasement. An agreement you do not mean is just a slower argument; sign only what you can keep.",
  },
  Scorpio: {
    headline: "Cut to what is true.",
    body: "Scorpio season strips the year back to its load-bearing walls. Something is ending; let it end. The month favors the honest audit: of the money, the entanglements, the story you tell about yourself. Ask the buried question and stay in the room for the answer. What survives this season's pruning is what was real all along.",
  },
  Sagittarius: {
    headline: "Aim past the fence.",
    body: "Sagittarius season pulls the horizon closer: the journey, the course of study, the question of what it is all for. The restlessness is not a malfunction; it is a compass. Follow it far enough to see your life from a distance and notice which parts you built and which you merely accepted. Then aim. The arrow you loose this month sets much of next year's direction.",
  },
  Capricorn: {
    headline: "Climb in the cold.",
    body: "Capricorn season is the year's load-bearing month: the summit is visible and the path up is unglamorous. Choose the one ambition that deserves the winter and give it the disciplined hours while everyone else hibernates. Say no often, and mean it. What you build in the season nobody applauds is what is still standing when the applause returns.",
  },
  Aquarius: {
    headline: "Break the pattern.",
    body: "Aquarius season asks what the routine is actually for. Step far enough outside your habits to see them as choices: the different route, the odd idea taken seriously, the room full of people unlike you. Give one evening a week to the collective thing, the cause, the group, the future you want to exist. The season's best gifts arrive dressed as strange suggestions.",
  },
  Pisces: {
    headline: "Let the water close.",
    body: "Pisces season is the last chamber of the cycle, where the year dissolves into what it meant. Guard the soft hours: sleep, music, the long walk with no destination. Forgive what is finished, including your own part in it, and let the unfinished things become compost instead of debts. What you release now leaves both hands free for the spring.",
  },
};
