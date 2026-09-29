import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The day page's banks: what the decree says to the reader, per culture.
 * Composed by lib/decree.ts into the anatomy docs/superpowers/specs/
 * 2026-09-29-daily-reading-voice.md lays out:
 *
 *   headline      one sentence to the reader, per (kind, fast body)
 *   evidence      the two gods, the glyph, the orb (built, not banked)
 *   (a) meaning   "{domain A} and {domain B} {relation}{exact tail}."
 *   (b) consequence, per kind, naming the partner god
 *   (c) image     the institution's picture, per kind, naming the headline god
 *   (d) second figure in one sentence, or the no-second-figure line
 *   (e) instruction, per kind, naming the headline god and its domain
 *
 * Templates carry three slots: {god} (the headline body's deity), {partner}
 * (the other body's deity) and {domain} (the headline body's domain from
 * data/deityDomains.ts). Plain strings with named slots, so the Android
 * generator carries them across without parsing code.
 *
 * Every sentence after the evidence line takes the figure: a line keyed on the
 * kind alone carries a god's name or a domain, so it never prints unchanged
 * under two different figures. No sentence repeats across two cultures.
 */

/** The bodies that move fast enough to headline a day. */
export type FastBody = "sun" | "moon" | "mercury" | "venus" | "mars";

export interface DecreeBank {
  /** One sentence to the reader per (kind, headline body). */
  headlines: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /** Plural predicate: "{domain A} and {domain B} {relation}". */
  relations: Readonly<Record<AspectKind, string>>;
  /** Appended to the meaning sentence when the orb is under half a degree. */
  exactTail: string;
  /** What it means for the reader. Slot: {partner}. */
  consequences: Readonly<Record<AspectKind, string>>;
  /** The institution's picture. Slot: {god}. */
  images: Readonly<Record<AspectKind, string>>;
  /** The one order, always last. Slots: {god}, {domain}. */
  instructions: Readonly<Record<AspectKind, string>>;
  /** Opens the second-figure sentence: "{secondFigure} {C} {verb} {D}: {meaning}." */
  secondFigure: string;
  /** Stands in for the second figure when the sky offers none. */
  noSecondFigure: string;
  /** Closes the day page. */
  comeBack: string;
}

export const DECREE_BANKS: Readonly<Record<Culture, DecreeBank>> = {
  egypt: {
    headlines: {
      conjunction: {
        sun: "Put your whole name on one piece of work.",
        moon: "Say what you feel at your own table tonight.",
        mercury: "Write the letter today and seal it yourself.",
        venus: "Let the one you love see all of you.",
        mars: "Point your anger at one job and finish it.",
      },
      sextile: {
        sun: "Ask for a hand with the heavy end.",
        moon: "A small kindness at home goes further than you think.",
        mercury: "Send the short message you have been putting off.",
        venus: "Offer the first gift, and keep it small.",
        mars: "Spend your strength on the job in front of you.",
      },
      square: {
        sun: "You cannot finish everything today, so finish the right thing.",
        moon: "Do not trust the mood you wake up with.",
        mercury: "Read the letter twice before you answer it.",
        venus: "Do not bargain with someone you love.",
        mars: "Keep your hand off the harpoon today.",
      },
      trine: {
        sun: "Start the heavy thing while the light holds.",
        moon: "Rest without counting the hours.",
        mercury: "Say it plainly and they will hear it.",
        venus: "Let yourself be looked after today.",
        mars: "Your strength goes where you send it today.",
      },
      opposition: {
        sun: "You cannot stand on both banks, so pick one.",
        moon: "What you want and what the house wants are not the same today.",
        mercury: "Someone reads your words the wrong way round today.",
        venus: "Love asks you to give something up today.",
        mars: "Someone is waiting for you to swing first.",
      },
    },
    relations: {
      conjunction: "ride in one boat",
      sextile: "throw each other a rope",
      square: "haul on opposite ropes",
      trine: "float on the same current",
      opposition: "stand on opposite banks",
    },
    exactTail: ", true as the plumb line",
    consequences: {
      conjunction: "You cannot settle one without the other, because {partner} has tied them together.",
      sextile: "Ask once, and {partner} puts a shoulder to your oar.",
      square: "Nothing moves today without {partner} dragging against it.",
      trine: "What you start today reaches the far bank, and {partner} does not call it back.",
      opposition: "You have to choose a side, and {partner} takes the other one.",
    },
    images: {
      conjunction: "{god} walks through the pylon with company, and the doorkeeper slides back the bolt.",
      sextile: "{god} sends the north wind, and even a boat with no sail moves upstream.",
      square: "{god} leans on the balance, and Thoth writes down which way it tips.",
      trine: "{god} sits level on the scale, and Anubis leaves the beam alone.",
      opposition: "{god} hangs in one pan of the scale, and Thoth waits with his reed raised.",
    },
    instructions: {
      conjunction: "Bring everything about {domain} to {god} at once, and have the scribe write it on one sheet.",
      sextile: "Tend to {domain} before noon, and say {god}'s name over the bread.",
      square: "Put {domain} on the scale twice before you act, and let {god} watch.",
      trine: "Trust {domain} to the current today, and call on {god} as the barge casts off.",
      opposition: "Keep {domain} on your own bank, and hail {god} from there.",
    },
    secondFigure: "Lower on the river,",
    noSecondFigure: "Nothing else on the river comes near it, so this is the one thing you weigh today.",
    comeBack: "Come back at dawn, when the scale is set again.",
  },

  greece: {
    headlines: {
      conjunction: {
        sun: "Put your own name to what you are doing.",
        moon: "Stay home and ask yourself one honest question.",
        mercury: "Ask the question out loud and write down the answer.",
        venus: "Tell the person you want that you want them.",
        mars: "Pick one fight worth your spear and drop the rest.",
      },
      sextile: {
        sun: "Show your work to someone who can help it along.",
        moon: "A friend at your door is worth letting in.",
        mercury: "A short message opens the road today.",
        venus: "Say one kind thing and mean it.",
        mars: "Use your strength on something that will stay built.",
      },
      square: {
        sun: "You will be tested in public today, so answer slowly.",
        moon: "Do not ask a question you are not ready to hear answered.",
        mercury: "Check the message before you pass it on.",
        venus: "Wanting it badly is no reason to ask for it today.",
        mars: "Put the spear down before someone hands you a reason.",
      },
      trine: {
        sun: "Stand up and be counted today.",
        moon: "Your own home gives the best answer you will get today.",
        mercury: "Ask now, because the answer comes back clear.",
        venus: "Take the pleasure in front of you.",
        mars: "Go at the hard task while your arm is fresh.",
      },
      opposition: {
        sun: "Someone across the room wants the credit you want.",
        moon: "Your needs and your family's needs point opposite ways today.",
        mercury: "Two people will tell you two different things today.",
        venus: "Choose between the two things you want.",
        mars: "An enemy waits for you to strike first, so do not.",
      },
    },
    relations: {
      conjunction: "go up the hill together",
      sextile: "clear the road for each other",
      square: "argue at the same gate",
      trine: "keep step with each other",
      opposition: "take opposite sides of the question",
    },
    exactTail: ", to the very degree",
    consequences: {
      conjunction: "Whatever you ask about one, {partner} answers for both.",
      sextile: "One plain question opens the way, and {partner} holds the door.",
      square: "The answer you want is not the answer {partner} gives.",
      trine: "You get a straight answer today, and {partner} gives it without a riddle.",
      opposition: "You will hear two answers, and {partner} speaks the harder one.",
    },
    images: {
      conjunction: "{god} stands at the tripod with a companion, and the Pythia answers them in one breath.",
      sextile: "The shrine is open to {god}, and the Pythia answers whoever climbs to her first.",
      square: "{god} fights for first place in the line, and the Pythia draws lots before she speaks.",
      trine: "The Pythia takes {god} ahead of the crowd and answers from the tripod.",
      opposition: "{god} comes up the hill by a separate road, and the Pythia gives a different answer at each door.",
    },
    instructions: {
      conjunction: "Carry one question about {domain} up the road, and put it to {god} in plain words.",
      sextile: "Ask about {domain} in the fewest words, and thank {god} before you go down.",
      square: "Hear what {god} says about {domain}, then follow it or go home.",
      trine: "Spend your morning on {domain}, and pour a little wine for {god} at noon.",
      opposition: "Ask about {domain} from the other side, and let {god} hear both.",
    },
    secondFigure: "At a lesser shrine,",
    noSecondFigure: "No other shrine speaks today, so carry this one answer home.",
    comeBack: "Bring your next question tomorrow, when the tripod is lit again.",
  },

  canaan: {
    headlines: {
      conjunction: {
        sun: "Put your hand to the plow and your name to the work.",
        moon: "Eat with your family and settle one thing at the table.",
        mercury: "Make the thing with your own hands today.",
        venus: "Make the promise you have been holding back.",
        mars: "Point your heat at one enemy, and only one.",
      },
      sextile: {
        sun: "A neighbor will lend a hand if you name the job.",
        moon: "Send food to the house that needs it.",
        mercury: "Trade a skill for a skill today.",
        venus: "Bring a gift to the door, and wait to be asked in.",
        mars: "Your anger has a use today, so put it to work.",
      },
      square: {
        sun: "Someone at the gate wants your work stopped.",
        moon: "Keep the family quarrel inside the house.",
        mercury: "Measure twice before you cut anything today.",
        venus: "Do not swear love to settle an argument.",
        mars: "Stay out of the fight that is not yours.",
      },
      trine: {
        sun: "The council says yes to you today, so ask.",
        moon: "Your house is in good order, so sit down in it.",
        mercury: "Your hands know the work today, so trust them.",
        venus: "Love comes to the door without being called.",
        mars: "Finish the hard labor while your blood is up.",
      },
      opposition: {
        sun: "Your work and your household both want the whole day.",
        moon: "Your family wants one thing and you want the other.",
        mercury: "Someone takes your words and argues the other side.",
        venus: "The one you love stands on the far side of the floor today.",
        mars: "Someone is spoiling for a fight, and you do not owe them one.",
      },
    },
    relations: {
      conjunction: "stand before the council as one",
      sextile: "vouch for each other",
      square: "quarrel at the gate",
      trine: "sit at the same table",
      opposition: "call opposing witnesses",
    },
    exactTail: ", and the whole council hears it",
    consequences: {
      conjunction: "One ruling covers both, and {partner} stands under it with you.",
      sextile: "A promise made now holds, and {partner} is its witness.",
      square: "Someone objects to you today, and {partner} gives them the floor.",
      trine: "What you ask for passes, and {partner} raises no hand against it.",
      opposition: "Both sides are heard today, and {partner} speaks for the other one.",
    },
    images: {
      conjunction: "{god} goes before the assembly in two names, and El's decree falls on the pair.",
      sextile: "{god} brings a friend before the gods, and El pours for both.",
      square: "{god} rises to accuse, and the assembly hears nothing else at this sitting.",
      trine: "The assembly waves {god} through, and no god asks for a vow.",
      opposition: "The gods put down their cups as {god} takes the floor against a rival.",
    },
    instructions: {
      conjunction: "Bring {domain} to the temple court as one pledge, and let {god} hear it.",
      sextile: "Ask for help with {domain} in {god}'s hearing.",
      square: "Write down every word said about {domain}, and let {god} keep the tablet.",
      trine: "Take {domain} to the threshing floor today, and leave a share for {god}.",
      opposition: "Hold {domain} back at the gate until {god} has sat down.",
    },
    secondFigure: "Further down the bench,",
    noSecondFigure: "No other matter reaches the floor today, so close this one before you leave.",
    comeBack: "The council sits again tomorrow, and your seat is kept.",
  },

  carthage: {
    headlines: {
      conjunction: {
        sun: "Put your own seal on the deal today.",
        moon: "Go over the household sums with the people who share them.",
        mercury: "Draft the contract today and sign it before you sleep.",
        venus: "Spend on what you love without keeping score.",
        mars: "Put all your weight behind one venture.",
      },
      sextile: {
        sun: "A good word from a partner is worth taking today.",
        moon: "Settle the small bill at home before it grows.",
        mercury: "Send the offer while the harbor is open.",
        venus: "Buy the small gift and hand it over yourself.",
        mars: "Back your own venture with coin of your own.",
      },
      square: {
        sun: "Someone is checking your figures, so make them right.",
        moon: "Do not balance the house accounts in a temper.",
        mercury: "Read the small print before you set your seal.",
        venus: "Do not buy affection today.",
        mars: "Pay nothing out in anger.",
      },
      trine: {
        sun: "Your credit is good today, so use it.",
        moon: "The household runs itself today, so let it.",
        mercury: "The deal you are drafting closes cleanly.",
        venus: "Enjoy what you have already paid for.",
        mars: "Your nerve pays off today, so press the bargain.",
      },
      opposition: {
        sun: "Someone across the table wants your share.",
        moon: "Home and trade want the same silver today.",
        mercury: "The other side reads the contract differently than you do.",
        venus: "What you want costs what you need.",
        mars: "Someone wants you to overpay for a fight.",
      },
    },
    relations: {
      conjunction: "share one account",
      sextile: "carry each other's cargo",
      square: "fight over the same silver",
      trine: "add up on the first pass",
      opposition: "bid against each other",
    },
    exactTail: ", posted to the hour",
    consequences: {
      conjunction: "Pay one and you have paid both, and {partner} holds the receipt.",
      sextile: "A small loan made today comes back, and {partner} guarantees it.",
      square: "Someone changes the terms on you today, and {partner} backs them.",
      trine: "Your figures come out right today, and {partner} initials the total.",
      opposition: "Something has to be paid out today, and {partner} decides what.",
    },
    images: {
      conjunction: "The clerk writes {god} and a partner on one line, and one seal covers both.",
      sextile: "{god} stands surety for you until the ships come home.",
      square: "{god} refuses the terms, and the Hundred and Four read the roll again line by line.",
      trine: "The clerk adds {god}'s column once, and the sum closes the sheet.",
      opposition: "The clerk sets {god} against the other column, and the balance stays open.",
    },
    instructions: {
      conjunction: "Enter {domain} under one heading today, and seal the page in {god}'s name.",
      sextile: "Open {domain} to a partner's eye before the next sailing, and name {god} as witness.",
      square: "Count {domain} twice today, and hand the tally to {god}'s clerk.",
      trine: "Draw on {domain} today, and set aside {god}'s share.",
      opposition: "Put {domain} on the table before noon, and let {god} set the price.",
    },
    secondFigure: "Further down the page,",
    noSecondFigure: "Nothing else is entered today, so rule off under this line and go home.",
    comeBack: "Come back tomorrow, when the books open at first light.",
  },

  rome: {
    headlines: {
      conjunction: {
        sun: "Take the credit for your own work in public.",
        moon: "Keep the lamp lit at home and the door open.",
        mercury: "Send the dispatch under your own seal.",
        venus: "Ask for the hand you want.",
        mars: "March on one objective and leave the rest in camp.",
      },
      sextile: {
        sun: "Call in the favor someone owes you.",
        moon: "Invite someone to eat at your table.",
        mercury: "A short note to the right office gets results today.",
        venus: "Pay the visit you have been meaning to pay.",
        mars: "Drill today, and the field is yours tomorrow.",
      },
      square: {
        sun: "Your rivals are watching, so give them nothing to use.",
        moon: "Keep your household quarrels off the street.",
        mercury: "Hold the letter until you can read it cold.",
        venus: "Do not court anyone to win an argument.",
        mars: "Stay in camp today and keep your sword sheathed.",
      },
      trine: {
        sun: "Walk into the forum as if you own it.",
        moon: "Stay home tonight and enjoy it.",
        mercury: "Make your case today, because it reads well.",
        venus: "Say yes to the invitation.",
        mars: "Take the field today, because the ground is yours.",
      },
      opposition: {
        sun: "Someone on the other bench wants your seat.",
        moon: "Home and duty pull you opposite ways tonight.",
        mercury: "Your message and theirs cannot both carry the day.",
        venus: "One of the two houses will be disappointed in you today.",
        mars: "You do not have to force what the ground refuses.",
      },
    },
    relations: {
      conjunction: "march under one standard",
      sextile: "lend each other troops",
      square: "block each other's road",
      trine: "sit on the same side of the Senate",
      opposition: "veto each other",
    },
    exactTail: ", exact to the augur's line",
    consequences: {
      conjunction: "You answer for both today, and {partner} holds you to it.",
      sextile: "One favor asked today is granted, and {partner} remembers who asked.",
      square: "Your business is put off, and {partner} is the reason.",
      trine: "Your motion passes, and {partner} votes for it.",
      opposition: "Nothing passes today, and {partner} is holding it up.",
    },
    images: {
      conjunction: "{god} waits on the sacred chickens, and the keeper announces that they have eaten.",
      sextile: "The haruspex finds the liver favorable to {god}, and the sign holds until dusk.",
      square: "An adverse omen stands in {god}'s path, and the consul adjourns the Senate.",
      trine: "The Vestals feed the hearth in {god}'s name, and the flame burns clear.",
      opposition: "The tribunes are divided over {god}, and the assembly goes home without a vote.",
    },
    instructions: {
      conjunction: "Bring {domain} under one command today, and burn incense to {god}.",
      sextile: "Ask a friend in office for help with {domain}, and pour a libation to {god}.",
      square: "Leave {domain} for tomorrow, and atone to {god} with a small offering.",
      trine: "Push {domain} forward today, and hang a garland for {god} on the way.",
      opposition: "Keep {domain} out of the vote today, and say the prayer to {god} once.",
    },
    secondFigure: "Elsewhere in the sky,",
    noSecondFigure: "The sky sends no second sign, so the rest of your day is yours to spend.",
    comeBack: "The augur takes the auspices again at dawn, so come back tomorrow.",
  },
};

/**
 * One honest quiet-day line per culture. These are the corpus's plain days
 * and they stay plain: no aspect is invented and no reassurance is offered.
 * Each opens on a different shape so the five do not read as one line with
 * the institution swapped. The week and the decree both print it.
 */
export const QUIET_LINE: Readonly<Record<Culture, string>> = {
  egypt: "Nothing on the river runs close enough to weigh. A day of ordinary work, and Ma'at counts it no lower than a feast.",
  greece: "No shrine answers today. The oracle keeps its own counsel, and so should you.",
  canaan: "Not one matter is brought forward today. An ordinary day still stands under El's tent.",
  carthage: "The day's page takes no entry. Nothing falls due, and the books close as they opened.",
  rome: "Nothing is reported that the augurs would call a sign. The citadel was manned at dawn all the same.",
};
