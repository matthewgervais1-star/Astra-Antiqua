import type { Planet } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";
import { toneOf, type Tone } from "@/lib/tone";

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

  // Mercury pairs
  "mercury|venus": {
    harmony: {
      headline: "Say the kind thing now.",
      body: "Today the kind thing and the true thing are the same sentence, which is rare. Most days you choose between honesty and warmth; right now you get both. Send the compliment you keep meaning to send. Make the apology you have been redrafting; today it comes out right on the first try. Tell someone exactly what they mean to you, in plain words. The phrasing will take care of itself.",
    },
    tension: {
      headline: "Flattery is a stall.",
      body: "You are about to say the pleasant thing instead of the real one, and you know it. The compliment that dodges the criticism, the agreeable reply that buys you a week of peace: each one is a small loan against the relationship. The true sentence you keep softening is shorter than your edits. Say it once, plainly, and let the silence afterward do its work.",
    },
    union: {
      headline: "Your words are charm today.",
      body: "Speech and charm have fused, so everything you say today comes out persuasive, including the things you have not checked. People will believe you because of how you sound, not what you say; that is power and a liability in one mouth. Use it where you mean it: the apology, the toast, the overdue thank-you. Do not use it to win an argument you would lose in writing.",
    },
  },
  "mars|mercury": {
    harmony: {
      headline: "Say the hard thing fast.",
      body: "Your words have force behind them today and your aim is true. The conversation you have been circling for weeks takes four sentences right now. Make the call, send the decisive email, name the problem in the meeting while everyone else clears their throat. Sharp is not the same as cruel, and today you can be one without the other. Speak first and speak short.",
    },
    tension: {
      headline: "Win the point, lose the room.",
      body: "Your tongue is faster than your judgment today, and it is looking for a target. The cutting reply is already loaded; you have been polishing it since breakfast. Landing it will feel excellent for ten seconds and follow you for a month. Write the email and do not send it. If the fight is real, have it tomorrow, slower, in person. Today you are armed, not right.",
    },
    union: {
      headline: "Every word is a weapon today.",
      body: "Speech and force have fused, so there is no such thing as a casual remark right now. Your jokes have edges, your feedback draws blood, and you will not notice until someone flinches. Spend the sharpness where it earns something: the negotiation, the deadline, the decision nobody wants to make. With people you love, slow down and count to three before the clever line. Clever is how you wound by accident.",
    },
  },
  "jupiter|mercury": {
    harmony: {
      headline: "Make the pitch today.",
      body: "Your mind is running larger than usual and your words can keep up. The idea you have been sitting on becomes convincing the moment you say it out loud. Book the meeting, draft the proposal, explain the plan to the one person who can fund it or kill it. You will be understood at full size today. Just write the numbers down before the enthusiasm rounds them up.",
    },
    tension: {
      headline: "Check it before you promise it.",
      body: "The story is growing in the telling, and you are halfway to promising something you have not verified. The deadline you are quoting, the figure you are rounding, the favor you are volunteering: each gets a little bigger each time you open your mouth. Today the gap between what you said and what you checked becomes someone else's problem. Say less. Confirm first. Underpromise once and see how it feels.",
    },
    union: {
      headline: "Talk the idea into existence.",
      body: "Thought and appetite have fused, so every idea arrives already wearing its grown-up version. This is the day to sketch the whole vision: the course, the move, the business, the book. Talk it out with someone smart and let it expand; that is what today is for. But know the difference between the map and the trip. Tonight, write down the one first step small enough to start tomorrow.",
    },
  },
  "mercury|saturn": {
    harmony: {
      headline: "Say less and mean it.",
      body: "Your words have weight today and people can feel it. This is the day for the contract, the careful email, the conversation that needs every sentence to hold. You will not be fast, but you will be exact, and exact is what the moment is asking for. Cut the qualifiers, name the terms, put it in writing. What you commit to today, you will actually keep.",
    },
    tension: {
      headline: "Speak before the doubt wins.",
      body: "You have rewritten the message four times and said nothing. The inner editor is loud today, insisting every sentence is wrong before you finish it, and silence is starting to look like safety. It is not; it is just slower failure. The people waiting on your answer would rather have a plain imperfect sentence now than a polished one next week. Send the short version. Done beats eloquent today.",
    },
    union: {
      headline: "One sentence, load-bearing.",
      body: "Speech and weight have fused, so words come slowly today and land permanently. Whatever you say will be quoted back to you, so treat talking like signing. Good for the hard conversation you have been postponing: the terms, the boundary, the no. Say it once, without decoration, and stop. The urge to fill the silence afterward is where people give everything back. Let the sentence stand.",
    },
  },

  // Jupiter pairs
  "jupiter|venus": {
    harmony: {
      headline: "Enjoy it without the audit.",
      body: "Pleasure and plenty are cooperating today, and for once the good thing is just good. Take the long lunch, buy the flowers, say yes to the invitation you would normally talk yourself out of. Generosity lands well now: the round you pick up, the gift that is slightly too nice. You spend so many days rationing joy; this is not one of them.",
    },
    tension: {
      headline: "The yes has a price tag.",
      body: "Everything looks worth it today: the upgrade, the third drink, the trip you would book before checking the dates. The yes feels generous and alive in the moment; the bill lands on a calmer version of you tomorrow. You are not stingy for pausing. Put the thing in the cart and leave it there until tomorrow. If it is still worth it then, it was real.",
    },
    union: {
      headline: "Appetite has the wheel today.",
      body: "Desire and excess have fused into one warm, expensive pull. Everything pleasurable presents itself in the large size: the dinner becomes a feast, the crush becomes a future, the browsing becomes a haul. Choose one indulgence and make it glorious; that is the day used well. Spread it across everything and you will wake up overfed, overdrawn, and oddly unsatisfied. One big yes. Several small nos.",
    },
  },
  "jupiter|mars": {
    harmony: {
      headline: "Make the bold move now.",
      body: "Nerve and luck are pulling in the same direction today, which is the rarest kind of weather. The ask you have been saving for the right moment: this is the moment. Apply for the thing, raise the price, start the project that scared you in February. You will not get a cleaner runway than this. One bold move, fully committed, beats five brave gestures. Pick it and go.",
    },
    tension: {
      headline: "You are not ten people.",
      body: "Confidence is outrunning capacity today. You are starting fights, projects, and promises faster than any version of you can finish them, and momentum is doing the math your judgment skipped. The bet feels safe because you feel large; that feeling is the whole danger. Finish one thing before you start a second. Drop one commitment publicly. The strongest move available today is subtraction, and nobody will applaud it. Do it anyway.",
    },
    union: {
      headline: "Aim before you accelerate.",
      body: "Drive and appetite have fused into one oversized push. You want to go, and you want to go everywhere, and the only difference between courage and recklessness today is aim. Pick the single target that matters most and pour all of it there: the launch, the race, the hard conversation that opens a door. Scattered, this much force just breaks furniture. Focused, it moves your whole year.",
    },
  },
  "jupiter|saturn": {
    harmony: {
      headline: "Build the dream in brick.",
      body: "Ambition and discipline are cooperating today, which is the combination that actually builds things. The big plan can finally meet the calendar without one of them flinching. Take the vision you keep talking about and give it a budget, a date, and a first deliverable. This is not the day for either dreaming or grinding alone; it is the day to bolt them together. What you structure now will still be standing next year.",
    },
    tension: {
      headline: "Audit the dream today.",
      body: "Half of you wants to leap and half of you wants to wait for the numbers, and today they are openly at war. Neither side is wrong; the trap is letting them take turns running your life, sabotaging each other. Audit the dream like an accountant for one hour: what it costs, what it pays, what you would cut. If it survives the spreadsheet, it deserves the leap. If it does not, you just saved years.",
    },
    union: {
      headline: "Grow slow, on purpose.",
      body: "Expansion and limit have fused, so growth today comes with conditions attached, and the conditions are the gift. The opportunity in front of you is real but it arrives shaped like work: a long timeline, a real cost, a structure you have to maintain. Take it on those terms or not at all. Sign up for the slow version of the big thing. Compounding is boring right up until it is everything.",
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
