import type { AspectKind } from "@/data/sampleChart";
import { toneOf } from "@/lib/tone";

/**
 * Hand-written year-ahead narrative, in the blunt diagnostic register of the
 * daily corpus (see aspectReadings.ts). Each year-theme is the STORY of a year
 * shaped by one dominant slow transit (Jupiter or Saturn) landing on one natal
 * point (Sun, Moon, Ascendant, Midheaven), in three tones. Beats are dated
 * moments told as a single story beat. Seasons frame a quarter by its weather.
 * Universal text; the pantheon names are layered on as context, not in the body.
 *
 * Authored in a fan-out workflow and passed through an adversarial polish pass.
 */
export interface YearNarrative {
  headline: string;
  body: string;
}

const ENTRIES: Readonly<Record<string, YearNarrative>> = {
  "theme:saturn:sun:harmony": {
    headline: "This is the year you build something that holds.",
    body: "For twelve months you can carry real weight without cracking. The work that bored you, the discipline you kept dodging, the commitment you have circled for years: this is the season to make it solid. The hours pay you back. The pattern to break is waiting for permission. Nobody is coming to hand you the role; take it. Put the unglamorous time into the one thing that matters most, and skip the three side projects you keep half starting. By the time the year peaks you will have proof, not a plan. Build it now, while the ground holds steady under you.",
  },
  "theme:saturn:sun:tension": {
    headline: "This is the year you stop auditioning to exist.",
    body: "Something presses on who you are this year, and it does not let up. An old voice says you have to earn the right to take up space, so you keep proving yourself to people who never really watch. The job that hollows you out, the parent you cannot satisfy, the room where you go quiet and small: the pressure is here to show you the cost. It will feel like failure. It is not. It is the bill for a life spent performing. The peak forces the question you keep avoiding: who is this actually for. Cut the dead weight and stand as you are.",
  },
  "theme:saturn:sun:union": {
    headline: "A new self begins, and it begins heavy.",
    body: "This year resets who you are at the foundation. The old version, the one built on what other people expected, is closing. A more serious self is starting in its place, and the beginning is sober, not triumphant. You will feel older, slower, more accountable, like a bill came due on the last decade. Do not read the heaviness as decline; read it as focus. Pick the one identity that is actually yours and drop the three you inherited or performed. Around the peak the new shape sets. What you commit to now you live inside for years, so choose it on purpose.",
  },
  "theme:saturn:moon:harmony": {
    headline: "This is the year your private life gets real foundations.",
    body: "For twelve months your feelings sit still long enough to be worked with instead of fled from. The hard family conversation you have postponed, the home you keep meaning to make stable, the daily routine that would actually steady you: now they hold. Comfort stops meaning avoidance and starts meaning structure. The trap is thinking maturity here is cold; it is not. Make the appointment. Set the boundary with the relative who drains you. Build the quiet daily thing that keeps you sane. Near the peak you feel the difference: a private life that supports you instead of one you keep patching. Do the sober work on it.",
  },
  "theme:saturn:moon:tension": {
    headline: "This is the year the loneliness has to be faced, not fled.",
    body: "Home and feeling come under weight this year, and it gets cold in there. Your mind hands you evidence that you are alone and always will be, that nobody is coming, that this is permanent. It is not a report on your life. It is the heaviness pressing on exactly the needs you have been ignoring. The trap is numbing it: the late nights, the people who half feed you, the family role you keep performing because leaving it scares you. Do the next small concrete thing. Keep one warm contact. Tell the truth to one person. The peak is the worst of it, and then it lifts.",
  },
  "theme:saturn:moon:union": {
    headline: "A new emotional life begins, stripped to what is true.",
    body: "This year starts a fresh cycle in your inner world, and it starts grave. Old comforts stop working. The home, the family pattern, the way you have soothed yourself for years: all of it gets weighed, and the hollow parts fall away. The beginning is quiet and a little lonely, because you are clearing the ground before you rebuild on it. Do not rush to feel better. Let the weight be real and learn what it points at. Cut the inputs, rest, say the honest thing to one person who has earned it. Around the peak the new foundation sets. Build your safety on what is actually solid this time.",
  },
  "theme:saturn:asc:harmony": {
    headline: "This is the year you grow into a face that fits.",
    body: "A new chapter of becoming opens this year, and it has support under it. The way you carry yourself, the body you live in, the impression you make at the door: all of it can be rebuilt on something durable instead of something performed. This is the season to get serious about your health, your habits, the version of you that walks into a room. The trap is waiting until you feel ready; you become ready by acting. Start the routine. Make the change you have rehearsed for years. Present yourself as who you are becoming. Near the peak people meet a steadier you. Earn that by doing the slow work now.",
  },
  "theme:saturn:asc:tension": {
    headline: "This is the year the mask gets too heavy to wear.",
    body: "The face you put forward comes under real pressure this year. The polished version you maintain, the role you perform at the door, the body you have neglected while keeping up appearances: the weight finds all of it. You will feel exposed, older, less able to fake it. That is the point. The persona has been costing you more than it earns, and the friction is here to make you drop it. The trap is doubling down on the act. Do the opposite. Let the effortful image go, fix what you have ignored, show up as yourself. The peak is uncomfortable. What is left after it is real, and it lasts.",
  },
  "theme:saturn:asc:union": {
    headline: "A new you begins, and you build it brick by brick.",
    body: "This year resets the whole face you put forward and starts a long, deliberate chapter of becoming. The old self presentation closes. A more serious one begins, but it does not arrive finished; you construct it. The start is heavy and a little austere, like standing at the foot of work you cannot skip. Do not mistake the weight for a bad sign. It means this version is meant to hold. Get disciplined about your body, your habits, the impression you make on purpose. Around the peak the new shape sets. Whoever you decide to be now, you wear for years, so decide with care.",
  },
  "theme:saturn:mc:harmony": {
    headline: "This is the year your standing gets built to last.",
    body: "Your career and public name can take real weight this year, and the structure you put under them holds. This is the season for the serious move: the role with responsibility, the credential, the reputation built on delivered work instead of noise. Recognition comes slow and earned, which is the only kind that stays. The trap is impatience, reaching for the flashy win over the durable one. Resist it. Take on the harder mandate, honor the commitments, become known for something solid. Near the peak you get the title, the trust, the standing, and it is anchored. Do the unglamorous work now and it carries you for a decade.",
  },
  "theme:saturn:mc:tension": {
    headline: "This is the year your career gets weighed and the weak parts fall.",
    body: "Your work and reputation come under hard pressure this year. The role you outgrew, the ambition you chased to impress someone, the public image that no longer fits who you are: the weight tests all of it, and the parts built on nothing give way. It will feel like blocked progress, even loss. It is a reckoning, not a verdict. You have been climbing a ladder set against the wrong wall, and the friction is forcing you to see it. The trap is gripping harder to what is already failing. Let it fail. Around the peak the false structure cracks. What you rebuild after, on your own terms, is the work that lasts.",
  },
  "theme:saturn:mc:union": {
    headline: "A new career chapter begins, and it begins with a reckoning.",
    body: "This year starts a fresh cycle in your public life, and the old one has to close first. The role, the ambition, the reputation you have carried: it gets weighed, and whatever was hollow comes down. The beginning is sober and demanding, more foundation than fanfare. Do not read the heaviness as the end of your prospects. It is the start of building something you actually mean. Pick the direction that is genuinely yours and let go of the path you took to please other people. Around the peak the new structure sets. What you commit to now becomes what you are known for, so choose work you can stand behind for years.",
  },
  "theme:jupiter:sun:harmony": {
    headline: "This is the year you stop playing small.",
    body: "More people trust you this year, and more rooms open that used to stay shut. The promotion is reachable, the introduction is there, the role you decided was above you is actually yours for the asking. The luck is real, but it only counts if you reach for it. The trap is waiting to feel ready. You will never feel ready. You will only ever feel asked.\n\nSay yes to the bigger job before you feel qualified. Put your name forward before someone less talented takes the seat. Send the email to the person who can move your career. The opening peaks once across these twelve months, and it rewards the version of you that moved first, not the one who waited to be picked.",
  },
  "theme:jupiter:sun:tension": {
    headline: "Your reach exceeds your grip this year.",
    body: "Opportunity keeps arriving, and so does the urge to grab all of it. This is the year you say yes to too much, promise more than you can build, and confuse motion with a plan. The confidence is not the problem. The overreach is. You will feel ten feet tall right up until the bill lands and you are known for finishing nothing.\n\nPick the two things that actually matter to who you are becoming and let the rest go, even the flattering offers, even the prestigious ones. Commit only to what you can finish. Say no to the third project out loud. The version of you that delivers on two things beats the version that brags about ten and crumbles in front of everyone watching.",
  },
  "theme:jupiter:sun:union": {
    headline: "A new chapter of who you are starts now.",
    body: "This year resets your sense of what you are capable of. The old story, the one where you stay in your lane and keep your head down, cracks open, and a bigger one takes its place. You will feel braver and hungrier than you have in years. That is the new cycle beginning, and it asks you to act like the person you are becoming, not the one you were.\n\nStart the thing you have been too timid for: the business, the application, the public step you keep talking yourself out of. Just keep one foot on the ground. The same nerve that makes you bold makes you careless with money and limits. Make the big move, keep the numbers honest, and promise nothing you cannot deliver once the high wears off.",
  },
  "theme:jupiter:moon:harmony": {
    headline: "Your home and your people get warmer this year.",
    body: "Your private life softens this year. Family is easier to reach, the house feels more like yours, and the closeness that has been scarce starts to come back. The luck is in the foundation, not the fireworks: this is the year to build something steady under your days instead of chasing the next thrill.\n\nUse it. Repair the relationship you let go cold; make the call you keep not making. Have the people over instead of waiting for an invitation. Put down the roots you have postponed: the move, the deeper commitment, the room you finally claim as yours. The opening peaks once across the year. Reach for the closeness, and let yourself actually be cared for instead of insisting you are fine.",
  },
  "theme:jupiter:moon:tension": {
    headline: "Your feelings run too big to trust this year.",
    body: "Everything you feel comes oversized this year: the joy huge, the want huge, the ache huge too. It feels generous and alive, and it will talk you into things. The risk is mistaking a strong feeling for a decision. You will overcommit to people, overspend on comfort, and take on family weight that was never yours to carry, all because it felt right at the time.\n\nLearn to tell a mood from a fact this year. Enjoy the warmth, but make no permanent promise while you are in it. When your heart wants to give the whole house away, sleep on it and check the number in the morning. Feed your need for closeness on purpose, not on the impulse you will be explaining away by next week.",
  },
  "theme:jupiter:moon:union": {
    headline: "A new emotional life begins this year.",
    body: "This year resets how you feel and what you need. A fresh chapter starts in your private life: a home, a family change, or just a different relationship with your own heart. The feelings come on strong and concentrated, like something long shut has finally been let in, and they will not be ignored.\n\nThis is the start of a cycle, so plant what you actually want to grow. Build the home you keep avoiding building. Let the new closeness in instead of guarding the door. Just know the intensity is the beginning talking, not the whole truth, so do not sign your life over to the first warm feeling. Tend it slowly. What you root now you live inside for years, so choose it on purpose.",
  },
  "theme:jupiter:asc:harmony": {
    headline: "The world meets you better this year.",
    body: "People respond to you differently this year. You walk in and the door is already open; the face you put forward gets a warmer read and starts conversations that used to stall. Some of it is luck, and some of it is that you finally look like someone who expects good things. Either way, use it while it lasts, because it does not last.\n\nThis is the year to start the chapter you keep circling: the new look, the move, the introduction you keep not making. Put yourself in front of people. The good first impression is on your side now, and it peaks once. Stop waiting to be chosen and walk into the rooms you actually want to be in, before the easy welcome fades.",
  },
  "theme:jupiter:asc:tension": {
    headline: "You take up too much space this year.",
    body: "You get more visible this year, and it goes to your head. The bigger presence is real, but so is the urge to oversell, overpromise, and let the body go soft while the ego inflates. You will want to coast on the strong first impression and skip the work underneath it. People clock the gap between how you present and what you deliver faster than you think, and they remember it.\n\nGrow into the larger self honestly this year. Tend the body, not just the image: move it, feed it, sleep. Make the new start, the new look, the new chapter, but back every bit of it with substance. A presence that promises and then delivers outlasts one that arrives big, talks a great game, and leaves the room empty.",
  },
  "theme:jupiter:asc:union": {
    headline: "You begin again this year, visibly.",
    body: "This year you start over in the most public way: a new face, a new chapter, a new sense of how you move through a room. The reset is concentrated and impossible to hide. People will see the change before you have finished making it, so there is no point easing in quietly and hoping no one notices.\n\nThis is a cycle beginning on your own front step. Change the thing you have wanted to change: the look, the city, the way you carry yourself when you walk in. Step into the bigger version on purpose. Just keep one foot honest, because the same lift that makes you bold makes you sloppy about limits. Become the new person deliberately, not by accident, and let the world catch up.",
  },
  "theme:jupiter:mc:harmony": {
    headline: "Your name gets bigger this year.",
    body: "Your standing rises this year, and the rise is both earned and backed. The right people notice your work, the promotion or the platform comes within reach, and your reputation grows past the small room you have been stuck in. This is the year the career ceiling you assumed was fixed turns out to have a door in it.\n\nReach for it. Ask for the title instead of hoping someone hands it to you. Pitch the project to the person who can actually fund it. Let yourself be known for what you are good at instead of staying modestly invisible. The opening peaks once across these twelve months. Take the bigger role before you feel qualified, because qualified is what the role makes you, not what you walk in with.",
  },
  "theme:jupiter:mc:tension": {
    headline: "You bite off more career than you can chew this year.",
    body: "Ambition runs hot this year and overreaches. The opportunities are real, but you will say yes to the bigger role, the extra responsibility, and the public commitment, then only later count what each one actually costs. The risk is spreading your name across too much and being known for finishing none of it. Visibility cuts both ways; people watch you fail in public as easily as they watch you win.\n\nChoose the one ambition worth being known for and pour your weight into it. Turn down the flattering distractions, even the prestigious ones, even the ones that stroke your ego in the meeting. A reputation built on one thing done well outlasts a name attached to ten half-built ones that all stalled at once.",
  },
  "theme:jupiter:mc:union": {
    headline: "A new career chapter starts this year.",
    body: "This year resets what you are known for. A fresh cycle begins in your working life: a new role, a new field, a new claim on the work you want your name attached to. It comes on strong and asks you to step up into a bigger version of your professional self, ready or not.\n\nStart what you have been too cautious to start. Launch the thing, take the visible role, plant your flag in the work that actually matters to you instead of the safe work that pays. This is a beginning, so build it to last past the first burst of momentum. Keep your numbers honest and your promises sized to what you can deliver. What you set in motion now is the reputation you live with for the next decade.",
  },

  // Dated beats
  "beat:eclipse-lunar": {
    headline: "What you buried comes up now.",
    body: "A feeling you have kept under the floor gets dragged into the open. The thing you would not say to your partner, the resentment you keep calling patience, it crests now and stops letting you ignore it. This is the ending you have been postponing. Name it out loud, to the right person, and let what is already over actually close.",
  },
  "beat:eclipse-solar": {
    headline: "A new version of you starts here.",
    body: "Who you are begins a new line today. An old self ends, and a chapter you cannot yet name opens in its place. Stop gripping the role that quit fitting years ago: the title you outgrew, the version of you everyone still expects. Let it go and walk into the room cleared out for who you are becoming. This is a beginning, so begin.",
  },
  "beat:solar-return": {
    headline: "Your year starts now. Aim it.",
    body: "The next twelve months take their tone from today. Decide what this year is actually for and say it to yourself in plain words: the move, the relationship, the work that matters. Vague wishes get tested into nothing. Pick one real thing the year is built around, and the year will keep handing you chances to prove you meant it.",
  },
  "beat:saturn-return": {
    headline: "The audit is here. Answer it.",
    body: "Everything you have built gets weighed against who you actually meant to become: the job, the relationship, the city, the life. What is load-bearing stays. What you only kept out of habit, the career you fell into, the partner you stopped choosing, will not survive this, and it should not. Stop calling it stable when you mean stuck. Cut what you kept by default and rebuild on what you chose on purpose.",
  },
  "beat:saturn-peak": {
    headline: "The pressure peaks. Decide first.",
    body: "The heaviest weight of your year hits its exact point now. The pressure you felt building is not going around you; it is the thing demanding a real decision, and you have been stalling. Choose what gives, on your terms: quit the job, end the arrangement, set the limit you keep softening. Decide now, while it still costs you a little. Wait, and the weight decides for you, and that costs more.",
  },
  "beat:jupiter-peak": {
    headline: "The opening is widest now. Go.",
    body: "The biggest opening of your year is at its peak today. The chance you keep eyeing, the job you want, the city you keep researching, the person you keep almost messaging, is as wide open as it gets. Stop waiting for a cleaner moment or for someone to hand you permission. Take it now. The room on the other side is bigger than the one you are standing in.",
  },
  "beat:retrograde-saturn": {
    headline: "Reread what you signed.",
    body: "A structure you live inside goes under review for months: the contract, the role, the arrangement you agreed to without reading closely. This is the stretch to reopen it and fix what is cracked. Renegotiate the terms, redraw the line that stopped working, repair the thing you have been tolerating. Do not launch the new venture yet. This window is for mending what you already have, not building what you do not.",
  },
  "beat:retrograde-jupiter": {
    headline: "The growth is inward this season.",
    body: "Your growth turns inward for a while. The real opportunity is not the outside break you keep scanning for: the promotion, the lucky introduction, the offer that rescues you. It is in what you finally understand and what you are ready to quit doing. Stop refreshing your inbox for rescue. Sharpen what you already know and drop the habit that has been quietly costing you. The expansion this season is quiet, and it is closer than you think.",
  },
  "beat:retrograde-mercury": {
    headline: "Double-check, do not launch.",
    body: "Plans, messages, and machines go sideways for a few weeks. Read the contract twice before you sign. Say the thing you left unsaid to the person who took your last message wrong. Back up the files and confirm the times. This is a window for finishing, fixing, and clearing the backlog, not for launching the product or making the big commitment. Tie off loose ends now; start the new thing when the noise clears.",
  },

  // Special years
  "special:quiet": {
    headline: "A rare open year. It is yours to shape.",
    body: "Nothing heavy is leaning on you this year. No long pressure grinding away, no reckoning forcing your hand. That is a relief, and it also kills your excuse. With nothing pushing you, the direction is yours and only yours. Most years you react to what lands on you; this one you build on purpose. Pick the thing you have been waiting for a clear stretch to begin, the book, the business, the move, the conversation, and begin it. A window this open will not come around again soon.",
  },
  "special:eclipse-held": {
    headline: "A quiet year with sharp hinges.",
    body: "No long pressure runs through this year, so the daily weather stays light. But the eclipses land directly on you, and those are the dates everything turns on. This is not a slow grind; it is a calm stretch broken by a few decisive moments. Watch for them. An ending you keep postponing, a feeling you keep hiding, a chapter that has to close: these arrive on the eclipse dates, fast, not gradually. Keep your hands free for those turns. Let the rest of the year be easy, because it will be.",
  },

  // Season framings
  "season:tense": {
    headline: "A heavy stretch. Pick one thing.",
    body: "This is a demanding, heavy stretch, and the pressure is real. It wants a decision, not a dodge. You already know which thing matters most: the deadline, the strained relationship, the choice you keep circling. Pick that one, drop the rest, and put your full weight behind it. Spread thin here and you lose on all fronts. Commit narrow and you get through.",
  },
  "season:easy": {
    headline: "An open stretch. Move now.",
    body: "This is a supported, opening stretch. The wind is at your back for once, so the things you have been forcing will finally give back more than you put in. Make the ask you have been sitting on. Start the project you keep deferring. Reach for the person or the chance you have been too careful about. Move now, ask now, start now. This kind of ease does not wait around.",
  },
  "season:mixed": {
    headline: "Weight and opening at once.",
    body: "This stretch carries pressure and opportunity together. Something is bearing down while a real chance is also swinging open, and the two will not wait for each other. Do not let the weight talk you out of the opening. Spend the pressure on the hard work it is demanding, and walk through the open door anyway. You can carry the load and take the chance in the same season; that is exactly what this one asks.",
  },
  "season:quiet": {
    headline: "A quiet stretch. Use the room.",
    body: "This is a quiet stretch with little coming at you. No push, no pull, just room. Do not waste it waiting for something to happen. Rest properly, clean up what you have let slide, the inbox, the paperwork, the half-finished thing, and decide plainly what you want next. The lull is short. Use it to get clear and steady before the next demanding stretch arrives.",
  },
};

/** The year-theme story for a dominant slow transit, or null if unwritten. */
export function getYearTheme(
  planet: string,
  natalKey: string,
  kind: AspectKind,
): YearNarrative | null {
  return ENTRIES[`theme:${planet}:${natalKey}:${toneOf(kind)}`] ?? null;
}

/** The story beat for a dated standout (e.g. "saturn-peak", "eclipse-lunar"). */
export function getBeat(beatKey: string): YearNarrative | null {
  return ENTRIES[`beat:${beatKey}`] ?? null;
}

/** The framing for a quarter by its weather: tense | easy | mixed | quiet. */
export function getSeason(weather: "tense" | "easy" | "mixed" | "quiet"): YearNarrative {
  return ENTRIES[`season:${weather}`] ?? ENTRIES["season:quiet"]!;
}

/** A special-year frame: "quiet" (open year) or "eclipse-held". */
export function getSpecialYear(key: "quiet" | "eclipse-held"): YearNarrative {
  return ENTRIES[`special:${key}`] ?? ENTRIES["special:quiet"]!;
}
