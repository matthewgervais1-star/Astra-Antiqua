import type { Planet } from "@/data/cultures";
import type { ZodiacSign } from "@/data/sampleChart";

/**
 * Short interpretive paragraph for each of the 7 x 12 = 84 planet-in-sign
 * placements. Universal across pantheons (the planet's principle and the
 * sign's register are the same regardless of the cultural mask). The deity
 * name is layered on at render time via the pantheon vocabulary.
 *
 * Voice: dry, declarative, no spiritual-marketing. The gift and the cost
 * are usually named in the same sentence.
 */
export const PLANET_IN_SIGN: Readonly<
  Record<Planet, Readonly<Record<ZodiacSign, string>>>
> = {
  sun: {
    Aries:
      "Identity built for first moves. You reach for what you want before deliberation; the cost is starting things that should have been considered, the gift is acting when others freeze.",
    Taurus:
      "Identity built into the body. What you decide stays decided; what you refuse to move you do not move. The shadow is the thing you held onto past its time.",
    Gemini:
      "Identity that lives in the conversation. You become yourself in the act of explaining; the risk is mistaking the explanation for the thing.",
    Cancer:
      "Identity rooted in what you have made shelter of. Your power comes through care; the cost is forgetting that some doors need to stay closed for you to keep your shape.",
    Leo:
      "Identity that asks to be witnessed. You are warmer when seen; the risk is needing to be seen so consistently that you cannot bear being quiet.",
    Virgo:
      "Identity built around what works. You become yourself by improving the thing; the shadow is mistaking correction for love.",
    Libra:
      "Identity formed in pairing. You know who you are through the other; the cost is forgetting that you also have to choose.",
    Scorpio:
      "Identity that lives in what is hidden. You wake when stakes are real; the cost is making things heavier than they need to be to feel awake.",
    Sagittarius:
      "Identity reaching for the horizon. You become yourself in the direction of travel; the risk is never arriving.",
    Capricorn:
      "Identity built by climbing. You feel real when you have built something; the cost is mistaking the building for the life.",
    Aquarius:
      "Identity defined by what you refuse to belong to. You wake when the group misnames you; the risk is loneliness disguised as principle.",
    Pisces:
      "Identity that dissolves in service or feeling. You become yourself by losing your edges; the cost is forgetting where you are.",
  },
  moon: {
    Aries:
      "Feeling arrives as impact before language. Your gut moves before your reasoning; trust the speed, and apologize for it later.",
    Taurus:
      "The body holds its mood. You change slowly and root deep; the cost is staying past when staying served.",
    Gemini:
      "Feeling moves through words. You process by speaking; the cost is mistaking the explanation for the resolution.",
    Cancer:
      "The body remembers everything. You feel the shape of the room you walked into ten years ago; treat that memory as data, not a verdict.",
    Leo:
      "Feeling is theatrical. You experience the day as scenes; the cost is needing applause to know you mattered.",
    Virgo:
      "Feeling shows up as the to-do list. You handle the body by handling its surroundings; the shadow is using tasks to stay slightly outside the moment.",
    Libra:
      "Feeling moves toward balance. You stabilize through the other's tone; the cost is mood that depends on someone else's mood.",
    Scorpio:
      "Feeling lives at depth. You skip the small surfaces; the cost is suspecting motives that have none.",
    Sagittarius:
      "Feeling moves toward expansion. The body wants the wider room; the cost is restlessness with the room you have.",
    Capricorn:
      "Feeling is contained inside competence. You handle the day by doing the day; the cost is grief that you have not let yourself feel.",
    Aquarius:
      "Feeling is filed and observed. You watch your moods from above; the cost is delay in the body's actual responses.",
    Pisces:
      "Feeling is permeable. You take on the mood of the room; the cost is forgetting which feelings began in you.",
  },
  mercury: {
    Aries:
      "The mind cuts before it deliberates. You think by stating; the cost is the sentence you wish you had revised first.",
    Taurus:
      "The mind moves the way a stone settles in the riverbed. You decide once and stay decided; the cost is the answer you held past its usefulness.",
    Gemini:
      "The mind multiplies. You think in conversation, in branches, in echoes; the cost is never coming to one thing.",
    Cancer:
      "The mind remembers in feeling. You think backward from how things landed; the cost is letting old hurt write your sentences.",
    Leo:
      "Speech is performance. You think to the room; the cost is wanting applause more than agreement.",
    Virgo:
      "The mind discriminates. You think by sorting and refining; the cost is mistaking precision for understanding.",
    Libra:
      "Thought looks for the other side. You hold both arguments; the cost is being unable to say which one is yours.",
    Scorpio:
      "The mind investigates. You think by following what people are hiding, including from themselves; the cost is the question that could have rested.",
    Sagittarius:
      "Thought reaches for the principle. You think in arcs and frames; the cost is the detail you needed to honor.",
    Capricorn:
      "Thought builds. You think by structure; the cost is dismissing what does not yet have shape.",
    Aquarius:
      "Thought systematizes. You think by the diagram of the whole; the cost is the person who does not fit the pattern.",
    Pisces:
      "Thought drifts toward image. You think in mood and metaphor; the cost is the specific fact you bypassed.",
  },
  venus: {
    Aries:
      "Desire is direct. You go for what you want; the cost is mistaking the chase for the love.",
    Taurus:
      "Desire is the body's slow yes. You love what stays; the cost is mistaking comfort for connection.",
    Gemini:
      "Desire follows the conversation. You are drawn by minds that move; the cost is leaving when the talking stops.",
    Cancer:
      "Desire takes the shape of care. You love by feeding; the cost is needing to be needed in return.",
    Leo:
      "Desire is generous and theatrical. You love by making the other beautiful; the cost is the audience you require.",
    Virgo:
      "Desire wants the right thing arranged well. You love by improving; the cost is critique mistaken for affection.",
    Libra:
      "Desire seeks the pair. You complete yourself in another; the cost is choosing the relationship over your own appetite.",
    Scorpio:
      "Desire is total. You love at depth or you do not love at all; the cost is the way intensity reads as weight.",
    Sagittarius:
      "Desire wants the wider story. You love what teaches you; the cost is restlessness with the love that does not.",
    Capricorn:
      "Desire wants the kept thing. You love by building; the cost is mistaking endurance for warmth.",
    Aquarius:
      "Desire wants the chosen connection. You love by election; the cost is keeping the other at the distance that makes choice possible.",
    Pisces:
      "Desire dissolves into the other. You love by losing the line; the cost is the self you forgot to bring.",
  },
  mars: {
    Aries:
      "Effort moves before instruction. You push to find the resistance; the cost is the door you broke that wanted opening.",
    Taurus:
      "Effort is slow and immovable. You push from the body; the cost is the project that demanded more speed than you would give.",
    Gemini:
      "Effort scatters. You push in three directions at once; the cost is the depth you could have built in one.",
    Cancer:
      "Effort moves sideways. You push by protecting; the cost is force used to defend what no longer needs it.",
    Leo:
      "Effort wants to be seen. You push for the moment witnessed; the cost is the work that mattered done in private and unrecorded.",
    Virgo:
      "Effort is precise. You push by refining; the cost is the larger move you delayed in service of the small one.",
    Libra:
      "Effort moves through the other. You push by negotiation; the cost is the force you applied to find your own position.",
    Scorpio:
      "Effort is contained until it releases. You push at depth and at the right moment; the cost is the build-up that becomes its own injury.",
    Sagittarius:
      "Effort moves toward the horizon. You push by aiming further; the cost is the ground you crossed too fast.",
    Capricorn:
      "Effort is sustained. You push by enduring; the cost is the body that ran out before the project did.",
    Aquarius:
      "Effort is principled. You push for the system; the cost is the person inside the system you forgot to look at.",
    Pisces:
      "Effort is indirect. You push by influence and dissolution; the cost is the action you owed in the open.",
  },
  jupiter: {
    Aries:
      "Growth comes through first moves. You expand by starting; the cost is the things you began without finishing.",
    Taurus:
      "Growth is slow and material. You expand by what you accumulate; the cost is mistaking weight for worth.",
    Gemini:
      "Growth is variety. You expand by what you collect; the cost is the depth you do not enter.",
    Cancer:
      "Growth comes through care. You expand by taking in; the cost is the family you outgrew but kept.",
    Leo:
      "Growth is generous performance. You expand by giving warmth; the cost is the warmth that became its own performance.",
    Virgo:
      "Growth is refinement. You expand by what you make better; the cost is mistaking polish for progress.",
    Libra:
      "Growth comes through pairing. You expand through the other; the cost is the self you set aside.",
    Scorpio:
      "Growth is transformative. You expand through what you allow to die; the cost is the loss disguised as choice.",
    Sagittarius:
      "Growth is its own subject. You expand by reaching; the cost is the local thing you flew over.",
    Capricorn:
      "Growth is built. You expand by construction; the cost is the slowness mistaken for caution.",
    Aquarius:
      "Growth is principled. You expand by belonging to the wider idea; the cost is the personal scale you skipped.",
    Pisces:
      "Growth is dissolution. You expand by losing the edge; the cost is the practical thing you let go of for the dream.",
  },
  saturn: {
    Aries:
      "Limit shows up as the wall the first move hits. You learn restraint through over-reach; the gift is the move that finally lands.",
    Taurus:
      "Limit is the slowness that builds. You learn endurance through the body; the gift is what stays.",
    Gemini:
      "Limit shows up as the cost of too many open conversations. You learn focus through having lost it; the gift is the sentence that arrives.",
    Cancer:
      "Limit shows up in the family you cannot fix. You learn boundaries through grief; the gift is the room you finally protected.",
    Leo:
      "Limit shows up as the applause that does not come. You learn confidence that does not need an audience; the gift is the quiet kind of being seen.",
    Virgo:
      "Limit shows up as the system that does not stay perfect. You learn the difference between maintenance and mastery; the gift is the work that holds anyway.",
    Libra:
      "Limit shows up in the relationship that asks you to choose yourself first. You learn that fairness is not always symmetry; the gift is the no that makes the yes real.",
    Scorpio:
      "Limit shows up in what you must let surface. You learn that secrets cost more than disclosure; the gift is the weight removed.",
    Sagittarius:
      "Limit shows up as the horizon that does not arrive. You learn the discipline of arrival; the gift is the local thing you finally let teach you.",
    Capricorn:
      "Limit is your native register. You build by enduring the build; the gift is the structure that outlasts you.",
    Aquarius:
      "Limit shows up as the system that fails its principle. You learn that the rule needs the exception; the gift is the more honest principle.",
    Pisces:
      "Limit shows up as the line you finally have to draw. You learn that compassion needs containment; the gift is the help that actually helps.",
  },
};

export function getPlanetInSign(planet: Planet, sign: ZodiacSign): string {
  return PLANET_IN_SIGN[planet][sign];
}
