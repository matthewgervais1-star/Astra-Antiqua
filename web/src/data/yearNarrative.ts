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

  // The three received bodies: Uranus, Neptune, Pluto. Slower still than
  // Jupiter and Saturn, so their year-themes read as generational weather
  // landing on one personal point rather than a single season's demand.
  "theme:uranus:sun:harmony": {
    headline: "This is the year you get to leave without wreckage.",
    body: "A long current of change runs under your identity this year, and it runs with you. The role that stopped fitting can be set down cleanly. The version of you built to satisfy someone else can be retired without a fight. Openings arrive suddenly: an offer, an exit, a stranger who names what you actually want. The trap is clinging to the familiar because it is familiar. Take the clean break when it shows itself. Change one real structural thing, the work, the place, the arrangement, and let the rest reorganize around it. Freedom is cheap this year. Next year it costs more.",
  },
  "theme:uranus:sun:tension": {
    headline: "This is the year the life you settled for stops cooperating.",
    body: "Something in you demands out this year, and it stops asking politely. The steady job wobbles. The fixed plan breaks. You surprise yourself with what you suddenly cannot tolerate. The disruption is not random; it lands exactly on what you kept out of habit, the role you drifted into, the self built to someone else's spec. The trap is a false choice: torch everything, or grip the old shape until it shatters anyway. Do neither. Find the one arrangement that is actually a cage and open it yourself, deliberately, before the year opens it for you. What you free on purpose you keep. What breaks out on its own takes a wall with it.",
  },
  "theme:uranus:sun:union": {
    headline: "The self you inherited expires this year.",
    body: "This year starts a new cycle in who you are, and it starts with a break. The identity you have carried, assembled from family expectation and old decisions, reaches its end date. What replaces it arrives in flashes: a sudden certainty, an impulse that will not fade, a door you cannot stop looking at. You will feel restless, wired, allergic to your own routines. That is the new self getting born. Do not sedate it with more routine. Give the restlessness one real outlet, the move, the change of work, the true thing said out loud. Choose your own break before an accidental one chooses for you. A reset this deep comes once or twice in a life. Spend it awake.",
  },
  "theme:uranus:moon:harmony": {
    headline: "This is the year your private life gets room to breathe.",
    body: "Your inner life loosens this year, and the loosening helps. The household pattern that pinched, the family role you performed on schedule, the moods you assumed were permanent: all of it turns out to be movable. Change comes easily at home now, so make the changes on purpose. Rearrange the rooms. Renegotiate the visit, the chore, the standing obligation that drains you. Let in a friendship that does not resemble your family. You need more freedom in your private life than you have been admitting. This year the people around you can actually hear that. Say it plainly, once, and watch how little resistance you meet.",
  },
  "theme:uranus:moon:tension": {
    headline: "This is the year your moods stop taking orders.",
    body: "Your inner weather turns sudden this year. Feelings arrive without warning and leave the same way: a flash of fury at the dinner table, a need to get out of the house right now, a coldness toward someone you love that frightens you. Home may lurch too, a move, a family rupture, a routine that collapses. None of it means you are broken. It means a private arrangement got too tight, and the pressure is finding the seams. Make no permanent decisions inside a spike. But read the spikes; they all point at the same door. Name the need underneath, more room, more honesty, less duty, and change the arrangement before it changes itself.",
  },
  "theme:uranus:moon:union": {
    headline: "A new inner life begins, and it begins mid-air.",
    body: "This year resets what you need to feel safe, and the reset is abrupt. The old comforts stop comforting. The home, the routine, the familiar role in the family: one of them breaks open, by your hand or without it. It feels like free fall. It is the start of a private life built on your real needs instead of your assigned ones. Do not rush to rebuild the old arrangement out of fear. Camp in the uncertainty and notice what you actually miss versus what you only thought you needed. Keep one anchor, a person, a habit, a room, and let everything else stay negotiable. What you settle into next fits better than what fell.",
  },
  "theme:uranus:asc:harmony": {
    headline: "This is the year you stop matching the wallpaper.",
    body: "The way you come across breaks open this year, in your favor. People who had you filed under one label lose the file. You can change the look, the manner, the whole first impression, and the room adjusts instead of objecting. This is the season for the visible experiment: the style you privately wanted, the blunter way of speaking, the version of you that stops apologizing at the door. Novelty works for you now; strangers respond to it, and doors open off the back of it. The only mistake is staying camouflaged out of habit. Update the outside to match the inside. You have been someone new for a while. This year you get to look like it.",
  },
  "theme:uranus:asc:tension": {
    headline: "This is the year the familiar version of you malfunctions.",
    body: "The self you present stops behaving this year. You say the unplanned thing in the meeting. You cancel on people you always show up for. You look in the mirror and want to change everything at once. Others call you erratic; really you are shedding a skin in public. The friction comes from holding a fixed image over a self that has already moved. Expect pushback from people invested in the old version, and expect the pushback to tempt you back into costume. Do not go back. Do not swing into shock for its own sake either. Change the presentation in real steps you mean: the appearance, the manner, the plain refusal. Let them be surprised. They adjust.",
  },
  "theme:uranus:asc:union": {
    headline: "You break out of your own package this year.",
    body: "This year starts a new cycle in how you meet the world, and it starts with a jolt. The presentation you have worn for years, the reliable manner, the predictable yes, cracks open, and what steps out is rawer and more direct. It does not go back in the box. People notice fast. Some lean in, some flinch, and both reactions confirm the change is real. Do not manage their comfort by shrinking. This is a rare chance to rebuild the outside from the actual inside. Change the look, the bearing, the way you enter a room, and do it deliberately, in daylight. The new face sets quickly. Make sure it is yours.",
  },
  "theme:uranus:mc:harmony": {
    headline: "This is the year the career detour is the road.",
    body: "Your working life gets flexible this year, and flexibility pays. The field shifts, the org chart shakes, a role appears that did not exist last year, and you are placed to benefit if you move. The lucky break looks like disruption at first: the reorg, the canceled plan, the sudden opening nobody senior wanted. Take the strange opportunity over the safe one. Pitch the unconventional idea; this is the year it lands. If you have been split between the respectable path and the one that actually excites you, this is the cleanest exit you will get for years. Leave the ladder. The thing you would do anyway is hiring.",
  },
  "theme:uranus:mc:tension": {
    headline: "This is the year the ladder moves while you are on it.",
    body: "Your career refuses to hold still this year. The stable role turns unstable, the plan gets rewritten above your head, the field you bet on changes its mind. It feels like sabotage. It is exposure: ambitions kept out of obligation cannot survive shaking, and the shaking has arrived. You will be tempted to quit everything in one dramatic gesture, or to cling to a structure that is visibly coming apart. Split the difference on purpose. Keep your income while you build the exit. Let go of the title you only wanted because someone taught you to want it. The disruption is not wrecking your path. It is showing you the path was never yours.",
  },
  "theme:uranus:mc:union": {
    headline: "Your public life starts over this year, midstream.",
    body: "This year begins a new cycle in what you are known for, and it begins with a hard turn. The career line you have followed, the profession, the employer, the ten-year plan, breaks: a departure, a reinvention, a public change of course you did not fully schedule. It looks reckless from outside. Inside, it has been coming for years. Commit to the turn instead of half-taking it. Announce the new direction plainly, take the hit to your reputation, and let it rebuild around the truth. The people who matter follow the honest version. What you start now runs unconventional and runs long. Better strange and yours than approved and borrowed.",
  },
  "theme:neptune:sun:harmony": {
    headline: "This is the year the edges soften in your favor.",
    body: "Something in you dissolves gently this year: the rigid self-definition, the armor of competence, the need to be one fixed thing. What replaces it is porousness that works for you. Imagination runs high. Compassion runs high. People sense the softening and open up around you; strangers tell you true things. This is the season for the creative work you shelved as impractical: the music, the paint, the pages. It will feed you now. One caution: keep your bank account and your calendar solid while your self gets fluid. Dream on purpose, with a notebook. The visions that arrive this year are usable later, if you write them down.",
  },
  "theme:neptune:sun:tension": {
    headline: "This is the year you stop recognizing yourself.",
    body: "Your sense of who you are blurs this year. Goals that organized your life go vague. Effort feels like rowing in fog. You may drift toward escapes, the extra drink, the endless scroll, the fantasy person, the fantasy job, because solid ground keeps not appearing. Understand what is happening: an identity built partly on illusion is being dissolved, and the fog is the dissolving. Make no major commitments inside it. Trust no person or project that looks like rescue. Keep the body honest, sleep, food, movement, no numbing, and let the false certainties go without replacing them on the spot. When the fog thins, and it will, what is still standing is actually you.",
  },
  "theme:neptune:sun:union": {
    headline: "The outline of you goes underwater this year.",
    body: "This year begins a long dissolve in your identity. The defined self, the titles, the plans, the story you tell about yourself, loses its hard edges, and something wider moves in underneath. You will feel less like a fixed person and more like weather: porous, impressionable, strangely tender. This is not decline. It is the start of a self organized around meaning instead of achievement. But a dissolving self attracts leeches and causes, so choose your influences like food. No gurus. No saviors. Keep one daily discipline, the work, the training, the morning page, as a mast to hold. Let the rest blur. What condenses out of this, over years, is the truest version yet.",
  },
  "theme:neptune:moon:harmony": {
    headline: "This is the year your inner life turns tidal and kind.",
    body: "Your feelings deepen and widen this year, and the deepening is gentle. You sense what people need before they say it. Dreams get vivid and start telling you things worth hearing. Home wants softness now: water, music, low light, fewer sharp voices. This is a strong year for tending and being tended, and a poor one for hard emotional bargaining, so postpone the confrontations that can wait. The caution is absorbing everyone else's weather until you cannot find your own. Check whose sadness you are carrying before you carry it home. Keep one thing firm, your sleep, your door, your Sunday, and let the tide move everything else.",
  },
  "theme:neptune:moon:tension": {
    headline: "This is the year your feelings lie beautifully.",
    body: "Your inner life fogs over this year. Moods arrive from nowhere and refuse to explain themselves. You long for something you cannot name, and the longing attaches to whatever is nearby: a person, a place, a past that was never as good as it looks from here. Home can feel unreal, or leaky, or haunted by what it was supposed to be. The dangers are specific: idealizing someone who is plainly showing you what they are, numbing the ache instead of hearing it, letting the household drift on unspoken things. Say the unspoken thing. Check the fantasy against one sober friend. The longing is real; its current address is usually wrong.",
  },
  "theme:neptune:moon:union": {
    headline: "A tide moves into your private life this year.",
    body: "This year begins a long softening in what you feel and need. The walls you built, the self-sufficiency, the not-needing-anyone act, start to dissolve, and the feelings behind them come through in swells. You cry at odd things. You miss people you decided you were done missing. Home starts wanting to be a sanctuary instead of a station. Let it happen; this is the start of a richer inner life, not a breakdown. But keep your feet. Name what you feel out loud so it cannot run the house from underwater. Choose one person who gets the unedited version. Guard your sleep like money. The heart is being enlarged. It aches while it stretches.",
  },
  "theme:neptune:asc:harmony": {
    headline: "This is the year you become hard to describe and easy to like.",
    body: "Your presence softens this year, and the softening draws people. There is suddenly more suggestion on you, more shimmer; strangers project their best hopes onto your blank spaces and treat you accordingly. Doors open on charm you did not consciously spend. Use it in the right rooms: the audition, the pitch, the first meeting, anywhere a little glamour compounds. The caution is letting the projections write your script. Being adored as a screen is not being known. Correct the flattering misreadings early, especially the romantic ones. Keep the look and the story a little fluid on purpose; this year rewards the unfinished. Just make sure one or two people still see the plain version.",
  },
  "theme:neptune:asc:tension": {
    headline: "This is the year people see a version of you that is not there.",
    body: "The face you present blurs this year. People misread you constantly: they see a rescuer, a fraud, a fantasy, whatever their own fog requires, and no correction quite sticks. You may not help matters, because your own sense of how to appear goes soft too. You leave rooms unsure of what you agreed to. The dangers: playing someone's illusion because being adored feels like being loved, and vagueness in rooms that demand hard edges, contracts, money, first impressions with stakes. Get everything important in writing. Let a blunt friend read the rooms you cannot. Stop performing clarity you do not have; say plainly when you do not know. Honest fog beats fake daylight.",
  },
  "theme:neptune:asc:union": {
    headline: "Your face goes soft at the edges this year.",
    body: "This year begins a long blur in how you appear. The defined image, the sharp presentation, the practiced entrance dissolve, and you start reading as something more diffuse: artist, mystic, open question. People sense a change they cannot name. You may barely recognize photos of yourself, or feel like you are wearing a costume that stopped being yours. Do not panic and rebuild the old front. This dissolve is the start of a presence with less performance in it. Care for the body while it happens, food, sleep, movement; the drift gets physical if you let it. Be honest early with new people about who you actually are. Let the mask soak off. Keep the face.",
  },
  "theme:neptune:mc:harmony": {
    headline: "This is the year your work is allowed to mean something.",
    body: "A current of meaning moves through your career this year, and it moves your way. The imaginative project gets its opening. The compassionate work, the teaching, the art, the healing trades, gains ground and pays better than cynicism promised. Your public image picks up a shine you did not engineer; people want to believe in you, and mostly they are right to. Follow the pull toward work you do not have to explain to your own conscience. Pitch the vision while the audience is soft to visions. Two anchors: keep the invoices exact, and keep one colleague who gives you the unvarnished version. Inspiration is the asset this year. Bookkeeping keeps it.",
  },
  "theme:neptune:mc:tension": {
    headline: "This is the year the career map dissolves in your hands.",
    body: "Your professional direction fogs over this year. The path that looked solid goes vague: the role loses its point, the company loses its story, the ambition you organized a decade around stops meaning anything when you hold it up. You may be tempted by a glorious mirage, the dream gig that is mostly dream, the leader who is mostly performance. Check every shining thing against paper: numbers, references, contracts. Do not torch the day job because it stopped sparkling; fog is not a forwarding address. Let the false ambition drain out quietly and notice what work you still do when nobody assigns it. That remainder is the real career. The fog lifts on it eventually.",
  },
  "theme:neptune:mc:union": {
    headline: "What the work is for starts changing this year.",
    body: "This year begins a slow dissolve at the top of your life: what you are known for, what you are working toward, what the work is for. The concrete ambitions stop holding water, and a vaguer, larger pull moves in, toward service, toward craft, toward something you would do unpaid. Outsiders may read it as losing your edge. It is your calling changing hands, from ego to meaning. Do not force a new five-year plan; you are between maps. Take the small assignments that feel strangely significant. Keep your finances boring and your claims modest while the new direction condenses. In a few years the work will have a name. This year, follow the water.",
  },
  "theme:pluto:sun:harmony": {
    headline: "This is the year your strength stops being theoretical.",
    body: "Power concentrates in you this year, and it concentrates quietly. Obstacles that ate years of effort give way to steady pressure. People sense a new weight in you and make room without being asked. This is the season for the deep renovation: the ambition you buried as too big, the truth about yourself you were saving for later. Bring them up now; you have the strength to hold them. What burns off in the process, old images, small comforts, an easier self, was already dead weight. The caution is subtlety curdling into scheming. Use the influence in the open. Take the real seat, name the real goal, and let the people who preferred the smaller you adjust.",
  },
  "theme:pluto:sun:tension": {
    headline: "This is the year the pressure finds what is false in you.",
    body: "Something presses on your identity from below this year, and it does not negotiate. Control struggles find you: the boss who wants you smaller, the rival, the institution, or your own compulsions wearing a stranger's face. What is actually under pressure is every part of the self built for protection instead of truth. The year strips it. It feels like being ground down; it is closer to being smelted. Do not spend the force on power games you cannot win. Refuse the manipulation, including your own. Let the false thing die on schedule, the image, the title, the armored version of you. What survives this year cannot be taken from you afterward. That is the point.",
  },
  "theme:pluto:sun:union": {
    headline: "You do not upgrade this year. You molt.",
    body: "This year begins the deepest remake of who you are that you will get. Something goes into the ground, a role, a relationship, a self-image that has been you for years, and it does not come back. Grief is appropriate. So is relief; part of you has waited a long time for this. Power comes up from underneath to fill the space, raw at first, and everything shallow starts tasting like ash. Do not cling to the corpse of the old identity, and do not rush to cast a new one. Let the stripping finish. Keep only what stays true under pressure. The person who walks out of this year runs deeper than the one who walked in. Permanently.",
  },
  "theme:pluto:moon:harmony": {
    headline: "This is the year the family basement gets cleaned in daylight.",
    body: "Your inner life gains depth this year without demanding wreckage first. Old sediment, the family pattern, the ancient grievance, the fear you have carried since childhood, comes loose and can finally be moved. Conversations that were impossible for decades turn merely hard. Closeness deepens with anyone willing to go there, and you find out who is. Use the year deliberately. Ask the mother, the brother, the oldest friend the real question. Clear the actual basement and the kept boxes while you are at it; the house and the inner life move together now. What you compost this year, resentment, secrecy, the role of the wounded one, turns into ground you can build on. Dig while the digging is easy.",
  },
  "theme:pluto:moon:tension": {
    headline: "This is the year the buried feelings hold their own hearing.",
    body: "Pressure builds under your private life this year. Feelings you sealed off, rage, grief, an old fear of being left, force their way up, often disguised as someone else's fault. Home and family can turn into a courtroom: control struggles with a parent, a partner, a child, that are really about a much older case. Do not litigate the decoy. Name the actual feeling, out loud, to one person you trust, before it names itself through your behavior. Watch the compulsions that spike when you avoid this: the checking, the jealousy, the midnight accounting. Nothing here wants to destroy you. It wants to be admitted. Feelings this old do not die untended. They run the house from below.",
  },
  "theme:pluto:moon:union": {
    headline: "Your inner life goes down to the studs this year.",
    body: "This year begins a gutting of your emotional life, and gutting is renovation. What you need, who feels like home, what safety even means: all of it goes under pressure and comes out changed. An old bond may end or transform past recognition. A version of home dies, and grieving it is not weakness, it is accuracy. Depth becomes the new normal inside you, and shallow comfort stops working at all. Go with the depth instead of fighting for the old shallows. Say the unsayable thing to the person it belongs to. Bury what is dead with honor, the pattern, the role, the house if it comes to that. What roots afterward feeds you for decades.",
  },
  "theme:pluto:asc:harmony": {
    headline: "This is the year you walk in heavier, in the good way.",
    body: "Your presence gains gravity this year without you forcing it. People take you seriously at the door: the same words land harder, the same look holds longer. Whatever you have survived has started reading as authority instead of damage. Use the new weight deliberately. Have the loaded conversations you used to schedule around. Ask for what was previously unaskable. Retire the harmless persona, the joker, the pleaser, the wallpaper, because it no longer fools anyone and never protected much. The body may want its own overhaul, training, appearance, a stripped-down style; follow it. Intensity attracts intensity now, so mind who you magnetize. You set the temperature in the room this year. You do not match it.",
  },
  "theme:pluto:asc:tension": {
    headline: "This is the year you cannot do harmless anymore.",
    body: "The way you come across turns intense this year whether you consent or not. People react to you strongly: some defer, some bristle, some pick fights you did not start. The mild presentation you relied on stops working; the force underneath shows through the paint. Expect power struggles at the surface of life, the neighbor, the coworker, the stranger with a badge, each one a mirror of the fight inside between the safe image and the real one. Do not answer force with scheming, and do not shrink to reassure anyone. Drop the paint yourself. Present the direct version on purpose, with manners. What is showing through anyway lands better when you are the one showing it.",
  },
  "theme:pluto:asc:union": {
    headline: "The old face burns off this year.",
    body: "This year begins a permanent change in how you meet the world. The presentation you built for safety, the accommodating smile, the manageable size, the edited self, breaks down at the door and cannot be repaired. Something starker comes through: more direct, more felt, harder to dismiss and harder to fake. Old acquaintances say you have changed like it is an accusation. It is a diagnosis, and it is correct. Help it along instead of hiding it. Cut the wardrobe, the habits, the greetings that belong to the discarded version. Let people meet the current one without apology. First impressions run deep for years after this. Make them of the real thing.",
  },
  "theme:pluto:mc:harmony": {
    headline: "This is the year your ambition gets teeth that fit.",
    body: "Real power becomes available in your working life this year, the structural kind: the mandate, the budget line, the room where it is decided. Doors open toward depth, research, crisis work, turnarounds, whatever most people flinch from, because you have stopped flinching. Your influence compounds quietly; people start asking what you think before they decide. Take the promotion with actual authority over the title with none. Kill your weakest project yourself before the year does it for you; pruning is the strategy now. Keep the power clean, no hoarding, no quiet sabotage, because this year sets your reputation for a decade. Aim to be known as formidable and fair. The pair is what lasts.",
  },
  "theme:pluto:mc:tension": {
    headline: "This is the year the career gets an autopsy while still alive.",
    body: "Power struggles find your working life this year. The boss who needs you small, the institution that eats its own, the rival with patience, or your own ambition turned compulsive: some version of the fight arrives, and it is never about the surface issue. What is actually under pressure is every part of the career built on something false, borrowed goals, prestige hunger, a role you secretly despise. The false parts get stripped, by you or for you. Choose by you. Quit the dead ambition before it is amputated. Refuse the tactic that would work but stain you; what you win dirty this year you repay double later. If a public structure falls, salvage the skill and the allies. Leave the rubble.",
  },
  "theme:pluto:mc:union": {
    headline: "What you are known for dies and pays out this year.",
    body: "This year begins the death and probate of your public life. A career, a title, a long ambition reaches its end, and what it was really worth gets counted: the skills, the allies, the hard-earned name, the parts of the estate that transfer. Something in you already knows which it is. The descent is not optional; the way you take it is. Wind down the finished thing deliberately instead of making the year seize it. Then follow the pull toward work with actual power in it, the kind you would defend under pressure. The rebuild takes years and does not care. What you raise on the cleared ground becomes the real legacy. The old name was scaffolding.",
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
  "beat:uranus-peak": {
    headline: "The break happens now. Steer it.",
    body: "The year's sharpest reversal hits its exact point now. Something flips fast: the plan, the arrangement, the thing you were sure of yesterday. Do not spend today gripping the old shape. The break is not the disaster; staying welded to what already snapped is. Take the exit that just appeared. Say the thing that ends the stalemate. Fast is fine. Frozen is not.",
  },
  "beat:neptune-peak": {
    headline: "The fog is thickest today. Drop anchor.",
    body: "The year's deepest blur peaks now. Whatever has felt vague, the person, the plan, the promise, is at its least trustworthy today. Sign nothing. Believe no rescue. If it glitters, get it in writing and read it twice. Use the day for what fog is good for: rest, art, the dream you keep having. Decisions keep. Make them next week, on dry ground.",
  },
  "beat:pluto-peak": {
    headline: "The pressure bottoms out now. Open your hand.",
    body: "The heaviest force of your year reaches its exact point now. Whatever has been dying all year, the role, the bond, the old version of you, finishes dying around this date. Stop administering life support. Bury it properly: say the ending out loud, return what should be returned, close the account. The power you spent holding on comes back the moment you let go.",
  },
  "beat:retrograde-uranus": {
    headline: "The revolution turns inward for a stretch.",
    body: "The urge to break free goes underground for months. Outside, things look stable again; do not call the change canceled. This stretch is for rebellion with a plan: work out which cage is real and which is furniture, save the money, learn the skill the exit requires. Do not blow anything up right now. Draw the map. The next opening is coming, and this time you leave packed.",
  },
  "beat:retrograde-neptune": {
    headline: "The water clears for a while. Look down.",
    body: "The fog pulls back for a few months, and what it covered sits in plain view: the promise that was never going to be kept, the dream that was mostly avoidance, the person you painted over. Do not look away; this clarity is the window. Cancel the illusion while you can see it. Keep the dream that survives sober daylight. That one is real, and it is worth the work.",
  },
  "beat:retrograde-pluto": {
    headline: "The excavation pauses. Sort what came up.",
    body: "The deep pressure eases for a few months, and the digging turns inward. This stretch is for sorting what the year has already unearthed: the motive you finally saw, the pattern you caught in the act, the power you did not know you had. Name them plainly, at least to yourself. Do not restart the buried habit just because the weight lifted. The pressure comes back. It checks your work.",
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
