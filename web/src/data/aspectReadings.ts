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

  // Pairs involving the three received bodies: Uranus, Neptune, Pluto.
  "mercury|uranus": {
    harmony: {
      headline: "Trust the sideways idea.",
      body: "The best thought today will not arrive in order. It will cut in from the side, mid-shower, mid-walk, in the wrong meeting. That is the one to keep. Write it down before it evaporates, then test it in daylight. The solution you have been grinding toward on rails is sitting one lane over. Look sideways.",
    },
    tension: {
      headline: "Sudden is not the same as true.",
      body: "Your mind is sparking today, and every flash feels like a revelation. Most are just speed. The reply you want to fire off, the plan you want to tear up at once: hold both for three hours. If the insight is real, it will survive the wait. If it was static, you will be glad you did not send it.",
    },
    union: {
      headline: "Your mind is lightning today.",
      body: "Thought and rupture have fused, so ideas arrive fast, strange, and certain. Some are brilliant. Some only feel brilliant because of the voltage. Capture everything, commit to nothing before evening. Talk the wild one through with a person who is not electrified. The keepers will still be strange tomorrow, just quieter.",
    },
  },
  "sun|uranus": {
    harmony: {
      headline: "Break one small rule.",
      body: "There is room today to step out of a shape you did not choose: the title, the schedule, the role you have played so long it looks like your face. You do not have to blow anything up. Change one fixed thing on purpose, the route, the routine, the answer you always give. The self underneath is more current than the costume. Let it show a little.",
    },
    tension: {
      headline: "Freedom is not demolition.",
      body: "Something in you wants out today, and it is willing to break furniture to prove it. The restlessness is honest; the wrecking plan is not. Before you quit, cut off, or walk, name the one specific constraint that actually chafes. Change that piece and see how much of the cage was real. Most of it will come off without an explosion.",
    },
    union: {
      headline: "You have outgrown the old shape.",
      body: "Identity and rupture have fused, so the life that fit last year is pinching everywhere today. The urge to shed it is real and worth respecting. But molt, do not detonate. Pick the one commitment that is truly finished and end it cleanly, in words, in daylight. Keep the rest until you know what you are becoming.",
    },
  },
  "moon|uranus": {
    harmony: {
      headline: "Change the scenery, keep the life.",
      body: "Your feelings want something new today, and for once you can give it to them cheaply. Take the different road home. Rearrange the room. Call the friend who makes you unpredictable again. The restlessness is not a crisis; it is an appetite. Feed it something small and strange, and the itch to overturn your whole life goes quiet.",
    },
    tension: {
      headline: "The urge to bolt is weather.",
      body: "Everything stable feels like a trap today, and the exit signs are glowing. Do not trust them yet. Your mood is jumping tracks every hour, and the life you want to flee at noon may fit fine by dark. Take the walk, not the leap. If the same door still calls in three days, open it then, calm and packed.",
    },
    union: {
      headline: "Your feelings come as jolts today.",
      body: "Mood and rupture have fused, so emotion arrives sudden and sharp, gone before you can name it. You will crave distance from the people closest to you. The need for room is real; ask for it in plain words instead of vanishing. One honest sentence about needing air spares everyone the slammed door, and spares you the repair.",
    },
  },
  "uranus|venus": {
    harmony: {
      headline: "Make the familiar strange again.",
      body: "What you love has gone invisible through habit, and today you can see it fresh. Take the old relationship somewhere it has never been. Wear the thing you never wear. Say yes to the odd invitation with the person you thought you knew completely. Novelty inside a commitment is renewal. Nothing has to break for this to feel new.",
    },
    tension: {
      headline: "The spark is not a sign.",
      body: "Someone or something new is glittering today, and next to it the standing arrangement looks gray. That contrast is manufactured. The thrill comes from newness itself, not from the new thing being better. Do not trade a built life for a bright surface before the shine has aged a week. Enjoy the flicker, tell no lies, decide nothing today.",
    },
    union: {
      headline: "You want the new because it is new.",
      body: "Desire and rupture have fused, so attraction today points at whatever breaks the pattern: the stranger, the impulse buy, the sudden exit. The wanting is real; its judgment is not. Let yourself be moved without letting yourself be steered. Spend the electricity on refreshing something you already chose. What you wreck in a thrilled hour takes a sober year to rebuild.",
    },
  },
  "mercury|neptune": {
    harmony: {
      headline: "Write the dream down.",
      body: "Your imagination and your words are on speaking terms today, which is rare. The image you could never explain will come out right if you try now. Draft the story, sketch the pitch, tell someone the vision in full. Just keep it away from spreadsheets. Today is for the poetry, not the terms. Do the math on a drier day.",
    },
    tension: {
      headline: "The fog is in the message.",
      body: "Words are slippery today. What you say will be heard otherwise; what you read will mean less than you think. The offer sounds better than it is, and the silence sounds worse. Do not sign, promise, or conclude on today's reading of things. Ask the clarifying question twice, in writing. If the answer stays cloudy, that cloud is the answer.",
    },
    union: {
      headline: "Thought moves like tide today.",
      body: "Mind and sea have fused, so thinking drifts, associates, dissolves its own edges. Useless for contracts, superb for creating. Give the morning to the imaginative work: the draft, the melody, the impossible sketch. Then verify everything factual before you act on it, twice, with sources. Today you can hear things that are not there and miss things that are.",
    },
  },
  "neptune|sun": {
    harmony: {
      headline: "Serve something without vanishing.",
      body: "The edges of yourself soften today in the good way. You can put your ego down and pick up something larger: the cause, the craft, the person who needs an hour. Giving will not feel like loss. Let yourself be a means for once, generous and uncounted. Just keep one appointment with your own life on the books.",
    },
    tension: {
      headline: "Do not become the fantasy.",
      body: "Someone is looking at you and seeing what they need to see, and part of you wants to play the part. It is a slow trade of self for applause. Every scene you perform writes a script you will have to keep. Correct the flattering error today, out loud, while it is cheap. Being seen accurately is colder at first, and the only version that lasts.",
    },
    union: {
      headline: "Your edges are thin today.",
      body: "Self and sea have fused, so it is hard to say where you stop and the room begins. You will absorb the moods around you and mistake them for your own weather. Choose your company like it is medicine, because today it is. Anchor to one concrete task, done start to finish. Drift on purpose or the day drifts you.",
    },
  },
  "moon|neptune": {
    harmony: {
      headline: "Let the soft thing in.",
      body: "Your feelings are tender and permeable today, and for once that is safe. The music will land deeper, the apology will actually reach you, the small kindness will not bounce off. Take in the beautiful thing on purpose. Forgive one small debt without a ceremony. Days this porous are rare; spend it near what you want to be shaped by.",
    },
    tension: {
      headline: "Not every sadness is yours.",
      body: "You are a sponge today, and the room's mood is soaking in unlabeled. Before you sink into the heaviness, check its source. The gloom you have carried since lunch may belong to the person you sat beside. Name what is actually yours, one item, and tend that. Wring the rest out; you were never asked to carry it.",
    },
    union: {
      headline: "Feeling has no edges today.",
      body: "Mood and sea have fused, so emotion comes in like tide: vast, unnamed, from nowhere in particular. Do not demand a reason from every wave. Cut the inputs that stir the water, the feeds, the sad songs, the third coffee. Decide nothing important. Float where the floating is safe, near people who do not need you to explain.",
    },
  },
  "neptune|venus": {
    harmony: {
      headline: "Love what is actually there.",
      body: "The light is flattering today, and everything you care for looks its best. Enjoy it honestly. Make the beautiful thing, set the table too well, tell the person the poetic version of what they are to you. Today the idealizing does no damage, because your feet know the floor. Romance the real; it can hold the weight.",
    },
    tension: {
      headline: "You love the picture.",
      body: "Some of what you feel today is projection: the person as you have painted them, not as they arrive. The disappointment you keep tasting is the gap between the two. Do not punish anyone for failing to be your painting. Look again with plain eyes and ask what is actually in front of you. Whatever survives the plain look is the part worth keeping.",
    },
    union: {
      headline: "The dream and the face are merging.",
      body: "Longing and fog have fused, so whoever you want today wears a halo you supplied. It feels like fate. It is mostly lighting. Enjoy the shimmer, write the poem, but sign nothing and vow nothing while the glow holds. In a week the light goes ordinary. Love that is still standing there in ordinary light is the real kind.",
    },
  },
  "mercury|pluto": {
    harmony: {
      headline: "Ask the real question.",
      body: "Your mind can reach the bottom today. The surface answer will not satisfy you, and it should not. Read the footnotes, pull the thread, ask the one question everyone has been stepping around. You will find the true fact, and it will be usable. Depth is available without wreckage today. Go down while the shaft is lit.",
    },
    tension: {
      headline: "Stop digging the same hole.",
      body: "Your mind has its teeth in something today and will not drop it: the search you keep rerunning, the message you keep rereading, the motive you keep assigning. The loop feels like diligence. It is not; it stopped producing facts hours ago. Write down what you actually know in three lines. Act on that or shelve it, and take your head outside.",
    },
    union: {
      headline: "Every word goes deep today.",
      body: "Speech and pressure have fused, so there is no small talk in you right now. You will see through the polite answer and want to say so. Choose the room for it. The same force that makes you piercing in a negotiation makes you invasive at a dinner. Use the depth where it was invited. Where it was not, let people keep their surfaces.",
    },
  },
  "pluto|sun": {
    harmony: {
      headline: "End what is already over.",
      body: "You have the strength today to close the thing that has been finished for months: the role you have outgrown, the arrangement that only runs on habit. Ending it is not failure; carrying it was the failure. Do it cleanly, in plain words, without a villain. What that dead weight has been costing you comes back as power the moment you set it down.",
    },
    tension: {
      headline: "Loosen the grip.",
      body: "A contest over control is running today, and you are in it even if you have not named it. Someone is leaning on you, or you are gripping something that is trying to change. Ask the only question that matters: do you want this, or do you just refuse to lose it? Fight for the first kind. Open your hand on the second. Half of power is knowing which throne you never wanted.",
    },
    union: {
      headline: "Something in you is being stripped.",
      body: "Identity and pressure have fused, and the day bears down on whatever in you is done. It will feel like loss because it is loss. It is also the making of room. Let the old version go without a eulogy: the persona, the title, the story about yourself that stopped being true. What survives this kind of weather is the part of you that was never a costume.",
    },
  },
  "moon|pluto": {
    harmony: {
      headline: "Say the buried thing.",
      body: "The deep water is calm enough to enter today. The feeling you keep filed under later, the grief, the resentment, the want you have never said aloud, can be brought up now without capsizing you. Tell it to one person who has earned it, or to a page. What you name today stops running your nights. That is the whole trade, and it is a good one.",
    },
    tension: {
      headline: "The old wound is talking.",
      body: "Today's reaction is bigger than today's event, which means it is not about today. Something old got touched: the jealousy, the dread of being left, the need to control the room to feel safe in it. Do not act on it and call that instinct. Feel it, date it, and answer the present on the present's terms. The person in front of you is not the one who caused it.",
    },
    union: {
      headline: "Your feelings have an undertow.",
      body: "Mood and pressure have fused, so emotion pulls downward today: obsessive, total, sure of itself. In this state you will want to manage people so the feeling quiets. Do not. Take the feeling somewhere private, let it be as big as it is, and give it an hour of your full attention. Faced straight, it turns to fuel. Managed sideways, it runs the week.",
    },
  },
  "pluto|venus": {
    harmony: {
      headline: "Go past the polite layer.",
      body: "The bond in front of you can hold more weight than you have been giving it. Today you can say the deeper thing without breaking anything: what you actually want, what you are actually afraid of, what this actually is. Closeness is on offer at a fair price. Take the conversation one honest layer down. The relationship that meets you there is the one you keep.",
    },
    tension: {
      headline: "Love is not leverage.",
      body: "Something in how you are loving today has a grip in it: the test you keep running, the silence used as a lever, the score kept to the decimal. Control feels like safety, and it buys the opposite. Nobody stays where they are held. Name the fear under the grip, to yourself first. Ask for the reassurance in plain words. It is cheaper than the test and it actually works.",
    },
    union: {
      headline: "All or nothing is a mood, not a rule.",
      body: "Desire and pressure have fused, so wanting comes total today: this person, this thing, entirely, now. The pull is magnetic and it flattens every middle option. Remember the middle exists. Point the force at a bond that can bear it, one that wants you at full weight. Aimed at the unwilling or the unready, it does not deepen anything; it just leaves marks.",
    },
  },
  "mars|uranus": {
    harmony: {
      headline: "Break the pattern while it is cheap.",
      body: "Your drive and your itch for freedom are pulling the same direction today. The routine you have been tolerating can be broken now at half the usual cost. Change the method, take the odd route, drop the small obligation nobody will miss. Acting on the impulse is safe today, which is rare. Move before the window shuts.",
    },
    tension: {
      headline: "The urge to quit is not a plan.",
      body: "Something in you wants out today: of the job, the plan, the lane you are in. The restlessness is real, but it wants a detonation, not an exit. Anything you break now breaks messy. Write down what you would leave and why. If it still reads true in three days, leave properly. Today, keep your hands off the switch.",
    },
    union: {
      headline: "Lightning in hand today.",
      body: "Drive and rupture have fused, so you are fast, abrupt, and done waiting. The break you have been planning for months can be made cleanly today, in one stroke. The break you invent at 2pm out of boredom cannot. Move quickly on the decided thing only. And slow down at doorways, on stairs, in traffic. Haste is the tax on this much voltage.",
    },
  },
  "jupiter|uranus": {
    harmony: {
      headline: "Say yes to the strange door.",
      body: "Luck comes in sideways today: the odd invitation, the offer from nowhere, the stranger with the right question. The break you get now will not look like the one you planned for. Take the meeting that seems off-topic. Open the door you did not know was there. The unplanned thing is the point.",
    },
    tension: {
      headline: "Restless is not the same as ready.",
      body: "Everything stable looks like a cage today, and some oversized escape is offering itself: the impulsive bet, the dramatic exit, the reinvention announced before it is planned. The wanting is real. The move, made today, is a coin flip with your own money. Scratch the itch small: change one thing, cheaply, and let the big leap wait for a sober week.",
    },
    union: {
      headline: "The window opens once.",
      body: "Growth and surprise have fused, so the real opportunity today arrives without an appointment and does not wait long. Keep slack in the schedule. Answer the unknown number, read the odd email twice, take the detour. Most days you should be suspicious of things that look too sudden. Today, sudden is how the good thing looks.",
    },
  },
  "saturn|uranus": {
    harmony: {
      headline: "Renovate, do not demolish.",
      body: "The old structure and the new idea can work together today, which is rare. The rule that no longer fits can be rewritten without burning the rulebook. Update the routine, renegotiate the arrangement, modernize one piece of what already works. Keep the foundation, change the fixtures. Change made this way holds.",
    },
    tension: {
      headline: "Bend the frame before it snaps.",
      body: "Duty and freedom are grinding against each other today. The structure that holds your life up feels like the thing pinning you down, and part of you wants to kick it over just to breathe. Do not. Structures rarely need demolition; they need one hinge. Find the single rule causing most of the chafe and change that one. Keep the rest standing until the replacement exists.",
    },
    union: {
      headline: "Old form, new pressure.",
      body: "Limit and rupture have fused, so everything rigid in your life is under stress today. What can flex will hold. What refuses to flex is asking to crack. Go through your commitments and sort them: which are load-bearing, and which are only habit wearing a uniform. Reinforce the first kind. Let one of the second kind go, deliberately, before something breaks it for you.",
    },
  },
  "mars|neptune": {
    harmony: {
      headline: "Work by feel today.",
      body: "Force is not the tool today; touch is. Your drive is running soft and accurate, good for the work that cannot be muscled: the creative draft, the delicate conversation, the problem that needs feel instead of push. Follow the pull rather than the plan for a few hours. What you make in that mode will be better than anything you could force.",
    },
    tension: {
      headline: "You may be rowing in fog.",
      body: "Your effort is leaking today and the target keeps moving. Some of what you are pushing against is not real: a fear dressed as a fact, a promise that was never solid, a plan built on someone else's story. Before you spend more force, verify. Ask the direct question, read the small print, test the ground. And if you are simply tired, be tired. Do not mistake fog for a wall.",
    },
    union: {
      headline: "Chase the dream with your eyes open.",
      body: "Drive and dream have fused, so what you want today is partly real and partly invented, and you cannot fully tell which. Spend the pull on things that are allowed to be imaginary: the artwork, the rehearsal, the long swim. Do not spend it on a person you have half-invented or a deal you have not checked. Tonight, write down what you wanted. Read it in daylight.",
    },
  },
  "jupiter|neptune": {
    harmony: {
      headline: "Imagine it at full size.",
      body: "Hope and imagination are cooperating today, and for once the big soft vision is not a trap. Let yourself picture the whole thing: the life, the work, the version of you it requires. Be generous while you are at it; kindness lands unusually well now. Then take one note the practical you can use tomorrow. A vision with one written step survives the week.",
    },
    tension: {
      headline: "The halo is doing the selling.",
      body: "Something looks luminous today: an opportunity, a person, a cause that promises to redeem the effort of your whole life. The glow is real to you, and it is still not evidence. Anything that cannot survive a boring question does not deserve your money or your devotion. Ask the boring question. If the shine holds, fine. Most halos today are lighting.",
    },
    union: {
      headline: "Believe wide, sign nothing.",
      body: "Faith and dream have fused, so belief arrives oversized today, and it feels like truth rather than mood. Use it where belief belongs: the creative work, the reconciliation, the long unpayable kindness. Keep it away from your wallet and your signature. What convinces you completely today should be reread on an ordinary Tuesday. If it is real, it will still be true then.",
    },
  },
  "neptune|saturn": {
    harmony: {
      headline: "Pour the dream into a mold.",
      body: "The dream and the deadline can cooperate today, which is rare weather. The vague thing you keep meaning to do can take a shape now without losing what made it worth wanting. Give it a container: a date, an hour, a first small deliverable. Ideals do not die from structure; they die from staying vapor. Build one small solid piece of the imagined thing.",
    },
    tension: {
      headline: "The ground is softer than it looks.",
      body: "Something you counted on shows a soft spot today: the plan, the role, the belief that has been holding your weight. The disappointment is loud, and it wants you to call the whole floor rotten. It is not. Probe the actual spot. Sort what failed from what still holds, repair the one plank, and stand on the rest. Doubt is information, not a demolition order.",
    },
    union: {
      headline: "Test the beam before you hang from it.",
      body: "Structure and dream have fused, so today you can see exactly which of your hopes can bear weight and which are decoration. That clarity is uncomfortable and useful. Put a little load on the thing you have been counting on: ask the direct question, run the numbers, request the commitment in writing. What holds, build on. What sags, grieve briefly and stop storing your future in it.",
    },
  },
  "mars|pluto": {
    harmony: {
      headline: "Dig where the root is.",
      body: "You have more force available today than the surface shows, the kind that moves what has been stuck for years. Spend it on the buried thing: the debt, the backlog, the conversation underneath all the other conversations. Shallow tasks will waste it. Pick the one heavy object in your life and put your whole weight under it. Today it moves.",
    },
    tension: {
      headline: "Do not make it a war.",
      body: "Someone is pushing, and everything in you wants to push back twice as hard, to settle not just the point but the person. That appetite is the trap. A contest of wills today has no small version; it escalates until something you value is collateral. State your line once, hold it without theater, and walk. Power that has to be demonstrated is already leaking. Yours can afford silence.",
    },
    union: {
      headline: "Controlled burn only.",
      body: "Drive and depth have fused, so what you want today, you want with your whole spine, and stopping halfway is not on offer. This is ending weather: the habit, the arrangement, the version of the thing that has been dying for a year. Choose the ending on purpose, in daylight, with plain words. Do not let it happen in a flash of fury at 11pm. Same fire, different ruins.",
    },
  },
  "jupiter|pluto": {
    harmony: {
      headline: "Claim the share you earned.",
      body: "Your ambition and your staying power are cooperating today. This is the day to consolidate: call in the favor that is due, ask for the scope you have already been carrying, turn the quiet influence into named authority. You are not grabbing; you are collecting. The claim will hold because the work under it is real. Make it plainly, in the open, once.",
    },
    tension: {
      headline: "More will not fill it.",
      body: "The appetite for more is running hot today: more control, more scale, more proof that you cannot be made small again. Notice that last clause; it is the real motor. Doubling down now buys size, not safety, and the price is usually someone's trust. Before you reach further, name what the hunger is actually for. Feed that instead. It eats less.",
    },
    union: {
      headline: "Go deep, not wide.",
      body: "Growth and depth have fused, so the pull today is toward the one big consuming thing: the project, the cause, the position that would change your standing for good. Taken deliberately, this is the day to commit to it fully. Just keep two guardrails: a person allowed to tell you no, and a line you write down now that you will not cross to win. Obsession does its best work supervised.",
    },
  },
  "pluto|saturn": {
    harmony: {
      headline: "Tear out the rot, keep the frame.",
      body: "You have the stomach today for the repair you have been avoiding: the one that means opening the wall and seeing how far the rot goes. Do it now, while your nerve and your patience are in the same room. Cut out what is dead, all of it, and keep the frame that is still sound. It will be ugly for an afternoon and solid for years.",
    },
    tension: {
      headline: "Stop propping the condemned thing.",
      body: "Something load-bearing in your life is failing, and you have been paying rising costs to postpone admitting it: the role, the arrangement, the plan that stopped working a while ago. Today the pressure gets specific. Stop shoring up the condemned thing. Take your weight off it, on your own schedule, and put it on what still holds. Losses accepted early are the cheap kind.",
    },
    union: {
      headline: "Keep only what can carry weight.",
      body: "Limit and pressure have fused, so today runs an audit you did not schedule. Everything you are committed to gets weighed, and the padding does not count, only what can bear load. Cooperate with it. Cut one obligation that exists out of guilt. Pay one debt, even partially, on purpose. What survives a day like this is the actual structure of your life. Build on that and nothing else.",
    },
  },
  "neptune|uranus": {
    harmony: {
      headline: "The old map is dissolving. Good.",
      body: "This is slow weather, the kind that moves whole generations: certainties handed down for decades dissolving while stranger, freer forms arrive to replace them. Today it touches you personally. Some rule you absorbed young, about what a life must look like, quietly loses its grip. Notice which one. You do not have to rebuild everything by Friday. Just stop obeying the rule that already stopped being true.",
    },
    tension: {
      headline: "Unmoored is not the same as free.",
      body: "The pressure of this era is that everything is up for revision at once: work, belief, belonging, what a future is for. On days like this the vertigo gets personal, and the temptation is to trade the collapsing certainty for a shinier one that somebody is selling. Do not swap one trance for another. Anchor low instead: the body, the schedule, the few people who know you offline. Solid is built, not bought.",
    },
    union: {
      headline: "You live between two maps.",
      body: "Dissolution and rupture have fused, an alignment that marks eras more than afternoons. Your generation is crossing from one map of the world to another, and the crossing is longer than anyone said it would be. Today you feel the gap under your own feet. So travel like a crosser: plans held loosely, daily practices held tight, possessions light, companions chosen well. The far shore is real. The schedule is not.",
    },
  },
  "pluto|uranus": {
    harmony: {
      headline: "The stuck thing is finally movable.",
      body: "This is the alignment of eras that break open: entrenched power cracking, old arrangements losing their grip at last. On the scale of one life, it means the immovable thing has a seam today. The old firm, the family pattern, the ten-year habit: somewhere, one of them gives. Look for the seam and put your effort exactly there. What would not budge for years moves an inch. Take the inch.",
    },
    tension: {
      headline: "History is loud. Hold your ground.",
      body: "Rupture and collapse are grinding at a scale no one person controls, and on days like this you feel it as private dread: the sense that the floor of the world is being renegotiated without you. True, and old news; this pressure shapes decades. Your counter is small and real. Keep your word to the people in reach. Fix one thing you actually govern. Eras are survived house by house.",
    },
    union: {
      headline: "Demolition and foundation, same day.",
      body: "Rupture and regeneration have fused, the signature of generations that tear down what they were handed and must build what comes next. That double duty runs through single days too. Today, do both on purpose. End one thing cleanly: resign the committee, retire the dead ritual, cancel the drifted plan. Start one thing meant to outlast you: the account, the apprenticeship, the tree. Wreckers who never build become the next thing wrecked.",
    },
  },
  "neptune|pluto": {
    harmony: {
      headline: "The deep current is with you.",
      body: "This is the slowest alignment there is, background weather for whole civilizations: old stories composting down while new ones form underneath. No one feels it daily. Today, unusually, you do. Something ancient in your line, family or culture, offers itself to be kept or released. You are the one standing at the gate. Keep what still feeds people. Release what only feeds on them.",
    },
    tension: {
      headline: "The old story is failing. Do not follow it down.",
      body: "The pressure of this alignment is generational: the stories that organized your grandparents' lives are losing their power, and their replacements are not finished. In one life that arrives as a cold question at 3am: what is any of it for. Do not answer with nothing. Answer small. Meaning right now lives in the concrete: the meal cooked, the friend kept, the work done well for its own sake. Tend those until the new story grows in.",
    },
    union: {
      headline: "Endings are feeding something.",
      body: "Dissolution and regeneration have fused at the deepest layer, the alignment under whole ages rather than single years. Its law is simple: nothing ends without feeding what comes next. Today that law wants your cooperation. Grieve one loss properly, all the way through, instead of managing it. Then plant one small thing in the cleared ground: a habit, a promise, a first page. You will not see the harvest soon. Plant anyway.",
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
