import type { AspectKind } from "@/data/sampleChart";
import type { LifeDomain } from "@/data/lifeDomains";

/**
 * Hand-written life-domain directives, one per domain per tone, in the blunt
 * diagnostic register of the daily corpus: a directive headline, a sharp read
 * anchored in that domain's territory, and a concrete instruction. The deity
 * placement and aspect lines render alongside as the ancient layer.
 */
export interface DomainReading {
  headline: string;
  body: string;
}

type Tone = "harmony" | "tension" | "union";

function toneOf(kind: AspectKind): Tone {
  if (kind === "trine" || kind === "sextile") return "harmony";
  if (kind === "square" || kind === "opposition") return "tension";
  return "union";
}

const READINGS: Readonly<Record<LifeDomain, Readonly<Record<Tone, DomainReading>>>> = {
  body: {
    harmony: {
      headline: "Use the body while it is willing.",
      body: "The strength you usually have to drag out of yourself is just there today. This is the day for the workout you have been negotiating with, the doctor you keep meaning to call, the grocery run that ends the takeout streak. Do not donate the surplus to your inbox. Spend it on the body that produced it; that is the one investment that pays you back.",
    },
    tension: {
      headline: "Pay the sleep debt tonight.",
      body: "You are running on caffeine and willpower and calling it discipline. The headache, the short fuse, the third coffee: that is your body handing you the invoice for sleep you borrowed. Tonight, pay it. Skip the late episode, put the phone in another room, and be in bed by ten. Nothing on the screen is worth feeling like this again tomorrow.",
    },
    union: {
      headline: "Put the restlessness to work.",
      body: "Everything physical is loud today: the hunger, the itch to move, the urge to push past your limit. That is one force wearing different costumes, and it wants a real job. Give it the hard workout, the long walk, the meal you cook instead of order. Starve it of a target and it becomes snacking, doomscrolling, and a 2 a.m. ceiling stare.",
    },
  },
  love: {
    harmony: {
      headline: "Make the honest ask tonight.",
      body: "The conversation you have been avoiding is cheaper today than it will be all month. The thing you want more of, the thing that has been bothering you, the question about where this is going: say it plainly tonight. The person across from you is more open than you think, and the honesty you have been rationing reads as trust, not complaint.",
    },
    tension: {
      headline: "Stop keeping score.",
      body: "You have been tallying what you give against what you get, and the ledger is poisoning the room. Tonight every small thing your partner does will look like evidence. It is not evidence; it is you, primed. Say the real grievance out loud once, plainly, or drop it. Do not spend the evening prosecuting a case they do not know they are in.",
    },
    union: {
      headline: "Intensity is not significance.",
      body: "Desire is running at full volume today and it feels like meaning. It is not meaning; it is volume. The person you cannot stop thinking about is getting a glow they have not earned. Enjoy the pull, but make no declarations and reopen no closed doors for twenty-four hours. If it is real, it survives a day of waiting.",
    },
  },
  friends: {
    harmony: {
      headline: "Make the overdue call.",
      body: "There is a friendship sitting in your phone that needs one message to come back to life. You have been telling yourself too much time has passed and it would be awkward. It would not be awkward; they have been thinking the same thing about you. Send the text today, no apology paragraph, just hello. Old friends are cheaper to keep than to replace.",
    },
    tension: {
      headline: "Stop funding the one-way friendship.",
      body: "One friend takes more than they give and you have been calling the imbalance loyalty. Notice who texts only when they need something, who never asks how you are, whose plans you dread. Tonight, decline the plan you dread and keep the evening for yourself. You are not abandoning anyone; you are correcting a price you set too low years ago.",
    },
    union: {
      headline: "Choose the room carefully.",
      body: "The pull toward people is strong today, and you are about to take whatever invitation arrives first. Any table feels better than your own kitchen tonight. Be choosier than the loneliness wants you to be. Call the friend who actually restores you, not the crowd that just fills the hours. One good conversation will do what five loud ones cannot.",
    },
  },
  work: {
    harmony: {
      headline: "Ask for the money.",
      body: "Your work and your reputation are aligned today, which is the rare window where asking works. Send the pitch, request the raise, put your name on the project you have been quietly carrying. The case for you is already sitting in the results; you just have to say it out loud. The people with the budget say yes to those who name a number.",
    },
    tension: {
      headline: "Busy is how you hide.",
      body: "You are reorganizing the small tasks to avoid the one that decides your week. The inbox, the formatting, the third revision nobody asked for: that is hiding with extra steps. The hard thing, the conversation with the boss, the number you have to face, gets worse on credit. Do it before lunch, badly if necessary. Done beats perfect today.",
    },
    union: {
      headline: "Aim the ambition at one thing.",
      body: "Ambition has concentrated into one hard pull today, and you will want to bet everything on it at once. The focus is a gift; the all-or-nothing feeling is not. Pick the single project that deserves the intensity and pour the day into it. Sign nothing, quit nothing, send no resignation-flavored emails. This much drive makes rash moves look like decisiveness.",
    },
  },
  family: {
    harmony: {
      headline: "Call home while it is easy.",
      body: "The usual friction at home has gone quiet today, and the people you share blood or a roof with are easier to reach than they have been in weeks. Use the window. Call the parent, thank the sibling, fix the small household thing that breeds the big arguments. Goodwill in a family is bought cheap on days like this and spends for months.",
    },
    tension: {
      headline: "You are not twelve anymore.",
      body: "Around your family you shrink into the role they cast you in decades ago: the responsible one, the difficult one, the kid. Today someone will hand you the old script, and you will feel the lines coming. Do not perform them. Answer as the adult you are everywhere else. You can love your family and still decline the part.",
    },
    union: {
      headline: "Name what you can carry.",
      body: "One family matter is pulling all your attention today: the parent who needs more, the sibling mess, the duty that always lands on you. The pull is real, and so is the pattern: you absorb what the others quietly let you absorb. Show up, but say out loud what you will carry and what you will not. The relatives who let you carry it all will adjust faster than you expect.",
    },
  },
};

/** The hand-written directive for a life domain under a given aspect kind. */
export function getDomainReading(domain: LifeDomain, kind: AspectKind): DomainReading {
  return READINGS[domain][toneOf(kind)];
}
