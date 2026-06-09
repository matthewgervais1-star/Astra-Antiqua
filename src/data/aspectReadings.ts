import type { Planet } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * Hand-written daily directives, one per planet-pair per tone, in the blunt
 * diagnostic register of a good written horoscope: a directive headline, a
 * sharp psychological read, and concrete instructions. Universal (no deity);
 * the pantheon's deity names are layered on at the edges, not in the body.
 *
 * Keyed by a sorted "planetA|planetB" pair and a tone:
 *   harmony  -> trine / sextile (the two forces cooperate)
 *   tension  -> square / opposition (they grind)
 *   union    -> conjunction (they fuse)
 *
 * Same-planet transits (a return) reuse the union entry for that planet's
 * self-pair where present, else the fallback.
 */

export interface AspectReading {
  headline: string;
  body: string;
}

type Tone = "harmony" | "tension" | "union";

function toneOf(kind: AspectKind): Tone {
  if (kind === "trine" || kind === "sextile") return "harmony";
  if (kind === "square" || kind === "opposition") return "tension";
  return "union";
}

const FALLBACK: Readonly<Record<Tone, AspectReading>> = {
  harmony: {
    headline: "Lean into the easy thing.",
    body: "Two parts of you that usually pull against each other are cooperating today. Whatever has felt like uphill work will give back more than you put in. Pick the thing you have been forcing, and stop forcing it; let the day carry some of the weight.",
  },
  tension: {
    headline: "Choose the bargain early.",
    body: "Two forces in you are grinding, and something has to give today. If you choose what gives, on your own terms, it costs little. If you let the day choose, it costs more. Make the call before the pressure makes it for you.",
  },
  union: {
    headline: "Two things become one today.",
    body: "Two drives that normally run on separate tracks have collapsed into a single strong pull, concentrated and hard to ignore. Spend the intensity on purpose. Left unsupervised, it spills onto the nearest available target, usually a person who did not earn it.",
  },
};

const READINGS: Readonly<Record<string, Readonly<Record<Tone, AspectReading>>>> = {
  // Sun pairs
  "moon|sun": {
    harmony: {
      headline: "Say what you actually want.",
      body: "Today the face you show and the feelings underneath it stop arguing. That alignment is rare; most days your image and your gut want different things. Use it. Make the ask, send the message, tell someone the true version. It will cost you less than it usually does.",
    },
    tension: {
      headline: "Your mood is not the verdict.",
      body: "What you feel today and who you are have come unstuck from each other, and the feeling is loud. Do not mistake a bad hour for a bad life. Name the mood, let it move through you, and refuse to make any permanent decision while it is still talking.",
    },
    union: {
      headline: "You are exactly as you feel today.",
      body: "There is no gap between your mood and your self right now, which makes you honest and a little raw. People will read you instantly, so there is no use pretending. Put yourself where you actually want to be seen, and let the openness do the work.",
    },
  },
  "mercury|sun": {
    harmony: {
      headline: "Speak as yourself.",
      body: "Your voice and your sense of self are lined up today, so what you say will sound like you mean it. Pitch the idea, write the thing, say the piece you have been rehearsing. You will be clear and you will be believed. Use the day for words that matter.",
    },
    tension: {
      headline: "Do not argue your worth.",
      body: "Someone is poking at your competence and you want to defend yourself point by point. Do not. Explaining yourself to a critic just hands them the floor. State your position once, plainly, and let the work answer for you. You do not owe a footnote to everyone with a doubt.",
    },
    union: {
      headline: "You are what you say today.",
      body: "Identity and voice have fused, so your words carry more of you than usual. Good for declaring something, naming a plan, putting your stake in the ground. Just know that throwaway lines also land hard today, so be deliberate. People will take you at your word.",
    },
  },
  "sun|venus": {
    harmony: {
      headline: "Let yourself be liked.",
      body: "Who you are and what is attractive about you are the same thing today. You are easy to be around and people feel it. Go where the warmth is, accept the invitation, ask for the thing you want. Charm is doing the heavy lifting right now, so let it.",
    },
    tension: {
      headline: "Approval is not worth.",
      body: "You are tying how you feel about yourself to whether one particular person likes you, and it is a terrible exchange rate. Their approval is not the measure of your value. Do the thing that makes you respect yourself, not the thing that makes them clap.",
    },
    union: {
      headline: "You want to be wanted today.",
      body: "Identity and desire have fused, so being liked feels like being alive. Lovely in good company and dangerous in bad; you will bend yourself to win the wrong person's attention if you are not watching. Spend the magnetism on people who already see you, not on auditions.",
    },
  },
  "mars|sun": {
    harmony: {
      headline: "Take the lead.",
      body: "Your will and your nerve are pulling together today, so you can move the thing that has been stalled. Start the project, make the bold ask, do the part everyone has been avoiding. The energy is clean and the timing is yours. Move first.",
    },
    tension: {
      headline: "Win the day, not the argument.",
      body: "Your ego is up and spoiling for a contest, and your pride will pick a fight it does not need to win. Being right is cheaper than being effective today. Put the heat into the work, the workout, the real obstacle, not into proving a point to someone who will not remember it.",
    },
    union: {
      headline: "All gas today.",
      body: "Identity and drive are fused, so you are forceful, direct, and a little impatient. Excellent for anything that needs a strong push, risky for anyone in your way. Aim the force at a task instead of a person and you will get more done today than in the last week.",
    },
  },
  "jupiter|sun": {
    harmony: {
      headline: "Say yes to the bigger room.",
      body: "Today the world is inclined to make you larger: more visible, more trusted, more space to grow into. Do not shrink to be polite. Take the opportunity, accept the introduction, let yourself be seen as the person you are becoming. The confidence is warranted.",
    },
    tension: {
      headline: "Do not oversell yourself.",
      body: "You feel bigger than you are today, and the temptation is to promise, exaggerate, take on more than you can carry. Pride is writing checks. Believe in yourself quietly and commit to half of what feels possible. The version you can actually deliver is more impressive than the one you would brag about.",
    },
    union: {
      headline: "Bet on yourself, within reason.",
      body: "Identity and expansion have fused, so you feel capable of more, and you might be. Use it to start something you have been too timid for. Just keep one foot on the ground: the energy that makes you brave also makes you sloppy with limits. Big move, careful numbers.",
    },
  },
  "saturn|sun": {
    harmony: {
      headline: "Build something that lasts.",
      body: "Your sense of self can carry weight today without buckling. This is the day for the disciplined thing: the hard conversation held calmly, the structure put in place, the commitment honored. What you build now is load-bearing. Do the serious work; you have the spine for it.",
    },
    tension: {
      headline: "Stop performing for people who never clap.",
      body: "Something is pressing on who you are, an old sense that you have to earn the right to exist. Here is the truth it hides: you have been auditioning for approval that was never coming. The job that drains you, the person you keep proving yourself to, your time is worth more than their verdict. Cut the dead weight.",
    },
    union: {
      headline: "Get serious about yourself.",
      body: "Identity and limit have fused, so the day feels heavy and accountable, like a bill came due. Do not read it as failure; read it as focus. Pick the one thing that actually matters, drop the three that do not, and put your weight behind it. A day for less, done properly.",
    },
  },

  // Moon pairs
  "mercury|moon": {
    harmony: {
      headline: "Say the feeling out loud.",
      body: "Your head and your heart are using the same language today. The thing you usually cannot put into words will come out clean if you try now. Have the conversation you have been drafting in your head for weeks. You will be understood.",
    },
    tension: {
      headline: "Stop arguing with yourself.",
      body: "Your thoughts and your feelings are talking over each other, and the loser is your judgment. You are not as anxious as the running commentary insists. Get the worry out of your skull and onto paper, or into one trusted person, before it convinces you of something that is not true.",
    },
    union: {
      headline: "What you think today, you feel.",
      body: "Thought and mood are the same thing right now, so every idea arrives soaked in emotion. Great for writing, journaling, telling someone how it actually is. Bad for deciding anything that needs a cool head. Express; do not conclude.",
    },
  },
  "moon|venus": {
    harmony: {
      headline: "Let yourself be comforted.",
      body: "What you want and what you need are pointing the same way today, which almost never happens. Reach for the person, the food, the soft thing. Accepting care is not weakness right now, just good timing. Say yes to the nice thing.",
    },
    tension: {
      headline: "Comfort is not love.",
      body: "You are reaching for something sweet to quiet a feeling, and the two have gotten confused. The snack, the text to the ex, the thing in the cart will soothe for an hour and cost you tomorrow. Sit with the feeling for ten minutes first. It usually wants less than you think.",
    },
    union: {
      headline: "Indulge, on purpose.",
      body: "Your need for comfort and your taste for pleasure have merged into one strong pull. Feed it deliberately and it is a good day. Let it run unsupervised and you will overspend, overeat, overtext. Pick the indulgence; do not let it pick you.",
    },
  },
  "mars|moon": {
    harmony: {
      headline: "Act on the feeling.",
      body: "Your gut and your nerve are working together today, so the thing you have been too tender to do, you can do now. Protect what is yours, set the boundary, make the move. The courage is on loan from your feelings; spend it before the mood passes.",
    },
    tension: {
      headline: "You are not under attack.",
      body: "Everything is landing as a threat today and your first instinct is to swing. The irritation is real but the enemy is mostly imagined. Before you fire off the reply or pick the fight, ask whether you are angry or just raw. Move your body instead. Burn it off; do not aim it.",
    },
    union: {
      headline: "Your feelings have teeth today.",
      body: "Mood and aggression are fused, which makes you reactive and quick to defend. Anything that touches a nerve gets an instant response, usually a bigger one than it deserved. Channel it into effort, not people. Clean hard, train hard, work hard; do not text hard.",
    },
  },
  "jupiter|moon": {
    harmony: {
      headline: "Let the good mood be generous.",
      body: "Your feelings are running warm and large today. This is the day to forgive the small thing, make the kind gesture, say the encouraging word you have been holding. Generosity costs you nothing right now and lands well. Spend the surplus.",
    },
    tension: {
      headline: "Do not promise from the high.",
      body: "Your feelings are inflated and everything seems possible, which is pleasant and unreliable. The plan that feels obvious tonight will look oversized in the morning. Enjoy the lift, but make no commitments and spend no money you will have to explain later.",
    },
    union: {
      headline: "Your heart is bigger than usual.",
      body: "Feeling and faith have merged, so your emotions come oversized: the joy huge, the ache also huge. Aim the bigness at something worthy, a person who needs it or a hope worth having. Just remember the scale is borrowed, and do not sign anything in the mood's name.",
    },
  },
  "moon|saturn": {
    harmony: {
      headline: "Give the feeling a structure.",
      body: "Today your emotions will sit still long enough to be worked with. The hard feeling you have been avoiding can be looked at without drowning you. Make the appointment, have the sober conversation, build the small routine. Discipline is a kindness to your feelings right now, not a punishment.",
    },
    tension: {
      headline: "The loneliness is weather, not truth.",
      body: "Everything feels colder and more solitary today, and your mind will offer evidence that it is permanent. It is not. This is the heaviness passing through, not a report on your life. Do the next small concrete thing, keep one warm contact, and do not trust the conclusion the mood is selling.",
    },
    union: {
      headline: "Feel it all the way through.",
      body: "Feeling and limit have fused, so the mood is heavy, quiet, and serious. This is not a day to be cheered up; it is a day to let the weight be real and learn what it is pointing at. Rest, cut the inputs, tell the truth to one person. It lifts.",
    },
  },

  // Venus and Mars pairs that surface often enough to deserve their own copy
  "saturn|venus": {
    harmony: {
      headline: "Commit to what is real.",
      body: "What you love and what lasts are pointing the same way today. This is the day to make the relationship official, have the grown-up money conversation, choose the durable thing over the exciting one. Love that survives this kind of cold scrutiny is the kind worth keeping.",
    },
    tension: {
      headline: "Take a break from romantic love.",
      body: "What looks like love is starting to feel like a bill. The pattern of giving to people who mostly take has worn you thin, and what you have called devotion is partly a fear of being left. Put romance on hold. Reclaim the worth you keep spending on people who do not match it.",
    },
    union: {
      headline: "Love gets serious or it goes.",
      body: "Affection and limit have fused, so the warm thing suddenly has weight, rules, consequences. Either it is ready to be real and you build it, or it is not and the seriousness will show you that too. No more in-between. Decide what you are actually willing to commit to.",
    },
  },
  "mars|venus": {
    harmony: {
      headline: "Make the move.",
      body: "What you want and the nerve to pursue it are working together today. The flirtation, the ask, the bold creative swing: go. Desire is rarely this clean or this unembarrassed. Do not overthink it into next week; act while the wanting and the courage are in the same room.",
    },
    tension: {
      headline: "Wanting it is not a reason to chase it.",
      body: "Desire is loud today and your usual judgment about who is worth it has gone quiet. The pull is real; the story that you have to act on it is not. Before you pursue, ask whether you want the person or just want to win. Heat is not a compass.",
    },
    union: {
      headline: "Pure want today.",
      body: "Attraction and drive have merged into one undiluted pull: magnetic, impulsive, a little reckless. You will chase what you want without the usual brakes. Aim it at something that wants you back. Spent well it is a great day for romance and bold creative work; spent badly it is a text you will regret.",
    },
  },
  "mars|saturn": {
    harmony: {
      headline: "Grind, productively.",
      body: "Your drive and your discipline are cooperating today, which is rare and worth using. The hard, boring, important task that needs sustained force, this is the day for it. No glamour, real progress. Put your head down on the thing that has been waiting for exactly this kind of patience.",
    },
    tension: {
      headline: "The wall is real. Stop ramming it.",
      body: "You are pushing hard and getting nowhere, and the frustration is starting to run you. Some doors are locked for a reason today. Forcing it only costs you energy you will want tomorrow. Find the one thing that does move, move that, and let the stuck thing be stuck for a day.",
    },
    union: {
      headline: "Disciplined force, or none.",
      body: "Drive and restraint have fused, so your energy comes out controlled, deliberate, and a little grim. Great for the task that needs both power and patience, frustrating if you wanted to feel free. Apply steady pressure to the hard worthwhile thing. Do not pick a fight; you have the stamina to make it ugly.",
    },
  },
};

/**
 * The hand-written directive for an aspect between two planets. Pair-symmetric
 * (transit-to-natal direction does not change which pair it is). Falls back to
 * a tone-based directive for the rarer pairs not yet written.
 */
export function getAspectReading(
  a: Planet,
  b: Planet,
  kind: AspectKind,
): AspectReading {
  const tone = toneOf(kind);
  const key = [a, b].sort().join("|");
  const pair = READINGS[key];
  return pair ? pair[tone] : FALLBACK[tone];
}
