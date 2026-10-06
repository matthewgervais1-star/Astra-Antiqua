import type { Culture, Planet } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The day page's banks: what the decree says to the reader, per culture.
 * Composed by lib/decree.ts into the anatomy docs/superpowers/specs/
 * 2026-09-29-daily-reading-voice.md lays out:
 *
 *   headline      one sentence to the reader, per (kind, headline body)
 *   evidence      the two gods, the glyph, the orb (built, not banked)
 *   (a) meaning   "{domain A} and {domain B} {relation}{tight tail}."
 *   (b) consequence, per (kind, partner body)
 *   (c) image     the institution's picture, per (kind, headline body),
 *                 naming the headline god and no other, and claiming
 *                 nothing about the sky and no other, and claiming
 *                 nothing about the sky
 *   (d) second figure in one sentence, or the no-second-figure line
 *   (e) instruction, per (kind, headline body), written for that body's
 *                 domain; two kinds per culture close on a rite to the god
 *
 * Templates carry {god} (the headline body's deity); only the named
 * second-figure openers also carry {partner} (the other body's deity). Plain
 * strings with named slots, so the Android generator carries them across
 * without parsing code.
 *
 * The meaning and the consequence change with the partner; the headline,
 * the image and the instruction are keyed by the headline body and return
 * whenever that body makes the same kind of figure again. The three-way banks (relations,
 * tight tails, second-figure openers) rotate by the UTC day number, so a
 * figure that holds for days prints a different paragraph each day. The sky
 * picks the figure; the day picks among the words. No sentence repeats across
 * two cultures.
 */

/** The bodies that move fast enough to headline a day. */
export type FastBody = "sun" | "moon" | "mercury" | "venus" | "mars";

/** The Moon always headlines a figure it is in, so it is never the partner. */
export type PartnerBody = Exclude<Planet, "moon">;

export interface DecreeBank {
  /** One sentence to the reader per (kind, headline body). */
  headlines: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /** Plural predicate: "{domain A} and {domain B} {relation}"; the day picks one of three. */
  relations: Readonly<Record<AspectKind, readonly [string, string, string]>>;
  /** Appended to the meaning sentence when the figure is tight (under half a degree); the day picks one of three. */
  tightTails: readonly [string, string, string];
  /** What the figure means for the reader, per (kind, partner body). */
  consequences: Readonly<Record<AspectKind, Readonly<Record<PartnerBody, string>>>>;
  /** The institution's picture, per (kind, headline body). Slot: {god}, the
   *  only god it names; it claims nothing about the sky (decreeBanks.test.ts). */
  images: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /**
   * The one order, always last, per (kind, headline body), written for that
   * body's domain. Two kinds per culture close on a rite naming {god}; the
   * other three end on the act itself.
   */
  instructions: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /** Opens the second-figure sentence, naming the headline figure's gods so
   *  two different headline figures never print the same second sentence;
   *  the day picks one of three. Slots: {god}, {partner}. */
  secondFigure: readonly [string, string, string];
  /** The opener when the second figure shares a body with the headline
   *  figure, so no god is named twice in one sentence. */
  secondFigurePlain: readonly [string, string, string];
  /** Stands in for the second figure when the sky offers none. */
  noSecondFigure: string;
  /** Closes the day page. */
  comeBack: string;
  /** Stands in a week row's headline when the row's figure is the day before's. */
  holds: string;
}

export const DECREE_BANKS: Readonly<Record<Culture, DecreeBank>> = {
  egypt: {
    headlines: {
      conjunction: {
        sun: "Lay the first mudbrick of the thing you keep talking about.",
        moon: "Say what you feel over bread and beer on your own reed mat.",
        mercury: "Write the letter on fresh papyrus and seal it yourself.",
        venus: "Bring the one you love down to the riverbank and tell them.",
        mars: "Aim your anger at one field of reeds and clear it.",
      },
      sextile: {
        sun: "Ask a neighbor to take the other end of the sledge.",
        moon: "Share your emmer bread with someone at home.",
        mercury: "Send the short message by the next boat.",
        venus: "Set the first loaf on the offering table, and keep the gift small.",
        mars: "Put your strength into the canal in front of you.",
      },
      square: {
        sun: "Finish the one task the overseer will check.",
        moon: "Do not act on the mood you wake up with before the sun is high over the Nile.",
        mercury: "Read the papyrus twice before you answer it.",
        venus: "Do not haggle with your beloved like a grain seller at the granary door.",
        mars: "Keep your hand off the harpoon until the water clears.",
      },
      trine: {
        sun: "Start the heavy thing while the light holds.",
        moon: "Let the scribe count the grain tomorrow, and rest tonight.",
        mercury: "Say it plainly and the river carries it.",
        venus: "Sit by the lotus pool and let someone else pour the beer.",
        mars: "Push the barge off the mud while your arms are strong.",
      },
      opposition: {
        sun: "You cannot stand on both banks, so pick one.",
        moon: "What you want and what the household wants are on opposite banks.",
        mercury: "Someone on the far bank reads your words backward.",
        venus: "Love asks you to cross the river this time.",
        mars: "Let whoever is shouting across the river shout until they tire.",
      },
    },
    relations: {
      conjunction: ["ride in one boat", "walk in one procession", "come to the scale together"],
      sextile: ["throw each other a rope", "help each other along", "lighten each other's load"],
      square: ["haul on opposite ropes", "get in each other's way", "pull against each other"],
      trine: ["float on the same current", "keep the same pace", "go easily together"],
      opposition: ["stand on opposite banks", "want opposite things", "face each other across the river"],
    },
    tightTails: [", true as the plumb line", ", and the cord is drawn tight", ", and Thoth writes it to the hair"],
    consequences: {
      conjunction: {
        sun: "Your work and your name go out together, and everyone sees both.",
        mercury: "Whatever you say today is written down and kept.",
        venus: "Love and money arrive in the same boat.",
        mars: "Your anger and your effort pull one oar.",
        jupiter: "A patron's favor lands on you whole.",
        saturn: "A duty you put off arrives in full.",
        uranus: "Your plans change shape overnight.",
        neptune: "What you dreamed last night walks in by day.",
        pluto: "Something buried comes up with the flood.",
      },
      sextile: {
        sun: "A small effort earns a full ration.",
        mercury: "One short letter opens a door.",
        venus: "A kind word buys more than silver.",
        mars: "A little push moves the block.",
        jupiter: "A patron says yes the first time you ask.",
        saturn: "An old duty gets lighter the moment you start it.",
        uranus: "A chance comes from the wrong bank of the river.",
        neptune: "A hunch is worth following as far as the next canal.",
        pluto: "An old store of grain is yours to open.",
      },
      square: {
        sun: "Your work stalls at the first lock.",
        mercury: "Your words come back to you bent.",
        venus: "Love costs more than you set aside for it.",
        mars: "Nothing moves today without someone dragging against it.",
        jupiter: "A promise from above comes up short.",
        saturn: "Every task takes twice the rope.",
        uranus: "The plan you trusted breaks at the dike.",
        neptune: "You cannot see the riverbed today.",
        pluto: "An old grievance rises with the water.",
      },
      trine: {
        sun: "Your work goes downstream without a push.",
        mercury: "Your message reaches the right ear the first time.",
        venus: "What you give in love comes back with interest.",
        mars: "Your effort lands where you aim it.",
        jupiter: "Good fortune runs your way like the flood.",
        saturn: "Your hard work holds like a well-packed dike.",
        uranus: "A sudden change works in your favor.",
        neptune: "Sleep comes easy and the dreams are kind.",
        pluto: "What you kept hidden turns out to be worth keeping.",
      },
      opposition: {
        sun: "Home and work pull from opposite banks.",
        mercury: "Someone reads your words in reverse.",
        venus: "What you love and what you need sit on opposite banks.",
        mars: "Someone across the water wants a fight.",
        jupiter: "A favor offered asks for a favor back.",
        saturn: "Duty and wish face each other across the river.",
        uranus: "You have to choose a side, and the other side will not wait.",
        neptune: "A pleasant story is being told on the far bank.",
        pluto: "Someone across the river holds something of yours.",
      },
    },
    images: {
      conjunction: {
        sun: "{god} walks through the pylon with a guest, and the doorkeeper slides back the bolt.",
        moon: "{god} brings a guest into the temple at night, and the priests light one lamp for both.",
        mercury: "{god} writes two names on one sheet of papyrus, and the scribe seals it.",
        venus: "{god} gathers what was scattered, and the pieces are bound in one cloth.",
        mars: "{god} throws two harpoons in one motion, and the hippopotamus does not rise again.",
      },
      sextile: {
        sun: "{god} sends the north wind, and even a boat with no sail moves upstream.",
        moon: "{god} walks the path between the fields at night, and the watchman waves you through.",
        mercury: "{god} lends the scribe a fresh reed, and the letter is finished before noon.",
        venus: "{god} lays bread at the chapel door, and the neighbors bring the beer.",
        mars: "{god} takes the lighter oar, and the barge still makes headway.",
      },
      square: {
        sun: "{god} takes the weaker rope at the sledge, and the overseer calls a halt.",
        moon: "{god} clouds the water at the crossing, and the boatman waits for dawn.",
        mercury: "{god} spills the ink across the sheet, and the scribe starts again.",
        venus: "{god} leans on the balance, and the scribe of the hall writes down which way it tips.",
        mars: "{god} raises the harpoon, and the priests call him back.",
      },
      trine: {
        sun: "{god} sits level on the scale, and the keeper of the balance leaves the beam alone.",
        moon: "{god} fills the cistern by night, and the household wakes to water.",
        mercury: "{god} carries the letter on a fair wind, and it lands before the sender sleeps.",
        venus: "{god} anoints the doorpost, and everyone who passes is welcome.",
        mars: "{god} drives the hippopotamus off the field, and the farmers plant again.",
      },
      opposition: {
        sun: "{god} hangs in one pan of the scale, and the scribe waits with his reed raised.",
        moon: "{god} crosses to the far bank by night, and whoever stands there counts every lamp you light.",
        mercury: "{god} reads the letter aloud on both banks, and each side hears a different word.",
        venus: "{god} stands at one end of the hall, and the bride's family waits at the other.",
        mars: "{god} faces a rival across the water, and the whole hall waits to see who strikes.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put one task at the head of your day, and name it to {god} at sunrise.",
        moon: "Eat with the people you live with, and leave a lamp burning for {god}.",
        mercury: "Answer no one else until that letter is sent, and seal it in {god}'s name.",
        venus: "Hold nothing back from your beloved, and lay a blue lotus at {god}'s feet.",
        mars: "Give your temper to the hardest chore in the house, and give {god} the first stroke.",
      },
      sextile: {
        sun: "Accept the help that is offered before noon.",
        moon: "Mend one small thing in the house.",
        mercury: "Put the answer you owe into three lines and send it.",
        venus: "Ask your beloved what they need this week.",
        mars: "Finish one job with your hands before dark.",
      },
      square: {
        sun: "Drop the least important task on your list.",
        moon: "Say nothing at home until you have eaten.",
        mercury: "Have someone else read your answer before it leaves.",
        venus: "Leave the household accounts for another night.",
        mars: "Walk the length of the canal before you answer an insult.",
      },
      trine: {
        sun: "Lift the heaviest stone of the week first, and call on {god} as you lift it.",
        moon: "Go to bed early, and leave a dish of figs for {god}.",
        mercury: "Speak to the person you have been avoiding, and trust {god} to carry the words.",
        venus: "Let your beloved do something for you, and thank {god} aloud.",
        mars: "Take on the heavy labor before noon, and raise your arm to {god} when it is done.",
      },
      opposition: {
        sun: "Choose home or work for the evening and keep to it.",
        moon: "Keep your moods on your own side of the river.",
        mercury: "Ask the other side to repeat what they heard.",
        venus: "Give up one small thing for your beloved.",
        mars: "Wait for the far bank to make the first move.",
      },
    },
    secondFigure: ["Downstream of {god} and {partner},", "On the bank across from {god} and {partner},", "Lower on the river than {god} and {partner},"],
    secondFigurePlain: ["Lower on the river,", "On the far bank,", "Downstream,"],
    noSecondFigure: "Nothing else on the river comes near it, so this is the one thing you weigh today.",
    comeBack: "Come back at dawn, when the scale is set again.",
    holds: "The same weight sits on the scale as yesterday.",
  },

  greece: {
    headlines: {
      conjunction: {
        sun: "Sign your name in the agora where everyone can read it.",
        moon: "Ask your household the question you avoid once the krater is mixed.",
        mercury: "Say your question to the oracle out loud and write down the answer.",
        venus: "Throw the apple, and tell the person you want that you want them.",
        mars: "Choose one fight worth your shield and walk away from the rest.",
      },
      sextile: {
        sun: "Show your work in the agora to someone who can help it.",
        moon: "Open your door to the friend who knocks late, and bring out the Chian wine.",
        mercury: "Give the next traveler on the road to Corinth a letter to carry.",
        venus: "Say one kind thing over the mixed wine and mean it.",
        mars: "Spend your strength in the gymnasium, where it builds something.",
      },
      square: {
        sun: "The agora will test you, so answer slowly.",
        moon: "Do not ask the oracle what you are not ready to hear.",
        mercury: "Check what the herald said before you repeat it.",
        venus: "Wanting it badly is no reason to ask Aphrodite for it.",
        mars: "Leave the spear with the hoplite gear before someone hands you a reason.",
      },
      trine: {
        sun: "Stand up on the Pnyx and be counted.",
        moon: "Your own hearth gives a better answer than any oracle.",
        mercury: "Ask now, while the road to Delphi is clear.",
        venus: "Accept the invitation to the symposium.",
        mars: "Enter the hard race and expect the laurel.",
      },
      opposition: {
        sun: "The agora has another candidate for your honor.",
        moon: "Your family's needs and yours face each other across the hearth.",
        mercury: "Two heralds will bring you two different stories from the same battle.",
        venus: "Choose between the two cups poured for you in the andron.",
        mars: "Let the enemy phalanx across the plain wait for a fight that does not come.",
      },
    },
    relations: {
      conjunction: ["go up the hill together", "arrive together", "come as a pair"],
      sextile: ["clear the road for each other", "help each other out", "open doors for each other"],
      square: ["argue at the same gate", "work against each other", "cross each other"],
      trine: ["keep step with each other", "agree without argument", "fit together"],
      opposition: ["take opposite sides of the question", "pull in opposite directions", "give opposite answers"],
    },
    tightTails: [", to the very degree", ", and the Pythia does not hesitate", ", and the tripod answers at once"],
    consequences: {
      conjunction: {
        sun: "Everyone in the agora sees what you do.",
        mercury: "The message and the messenger are the same today.",
        venus: "Desire walks in with its price on it.",
        mars: "Your strength and your temper march in one file.",
        jupiter: "Whatever you ask of the powerful is heard.",
        saturn: "An old account comes due in full.",
        uranus: "The ground shifts under your plans.",
        neptune: "What you hope for and what is true look alike.",
        pluto: "A buried coin turns up, and someone will ask who spends it.",
      },
      sextile: {
        sun: "A good word in the right ear lifts your name.",
        mercury: "One short question earns a clear answer.",
        venus: "A small courtesy opens a door that force would not.",
        mars: "A brief effort settles the matter.",
        jupiter: "One plain question opens the way to someone powerful.",
        saturn: "An old debt eases if you pay a little now.",
        uranus: "A stranger brings you a useful idea.",
        neptune: "A dream points to something real.",
        pluto: "Some hidden silver is yours to find.",
      },
      square: {
        sun: "Your name is tested in public.",
        mercury: "A message goes wrong between the door and the street.",
        venus: "What you want costs more than you thought.",
        mars: "The answer you want is not the answer you get.",
        jupiter: "Someone powerful says no and means it.",
        saturn: "The work is slower than you planned.",
        uranus: "Your plan breaks at the worst moment.",
        neptune: "You see what you hope to see.",
        pluto: "Someone digs up what you buried.",
      },
      trine: {
        sun: "People speak well of you without being asked.",
        mercury: "Your words land where you aim them.",
        venus: "Pleasure costs you nothing today.",
        mars: "You win the contest you enter.",
        jupiter: "You get a straight answer without a riddle.",
        saturn: "Hard work pays at the harvest.",
        uranus: "A sudden notion turns out to be a good one.",
        neptune: "Your wandering mind brings back something useful.",
        pluto: "Old wealth works for you without noise.",
      },
      opposition: {
        sun: "Someone across the agora wants the same honor.",
        mercury: "Two people tell you two different stories.",
        venus: "Two desires pull you in opposite directions.",
        mars: "Someone wants a quarrel in the open.",
        jupiter: "The powerful want a price for their help.",
        saturn: "A deadline comes the other way down your road.",
        uranus: "You will hear two answers, and the harder one is true.",
        neptune: "A rumor stands against the facts.",
        pluto: "Someone else claims what you inherited.",
      },
    },
    images: {
      conjunction: {
        sun: "{god} stands at the tripod with a companion, and the Pythia answers them in one breath.",
        moon: "{god} brings a guest to the night rites, and the priestess pours for two.",
        mercury: "{god} carries two messages in one satchel, and both doors open.",
        venus: "{god} lends her girdle to a bride, and the whole symposium watches.",
        mars: "{god} locks shields with a comrade, and the line holds.",
      },
      sextile: {
        sun: "The shrine is open to {god}, and the Pythia answers whoever climbs to her first.",
        moon: "{god} walks the guests home from the symposium, and nobody stumbles.",
        mercury: "{god} raises a herm at the crossroads, and travelers take the right turn.",
        venus: "{god} sends a dove into the agora, and two strangers start talking.",
        mars: "{god} drills the young men at dawn, and the shield wall closes faster.",
      },
      square: {
        sun: "{god} fights for first place in the line, and the Pythia draws lots before she speaks.",
        moon: "{god} shuts the door of the night shrine, and the sailors outside argue over the course.",
        mercury: "{god} switches the herald's tablets, and the assembly hears the wrong decree.",
        venus: "{god} throws the golden apple onto the table, and three guests stop speaking.",
        mars: "{god} breaks the truce at the games, and the judges stop the race.",
      },
      trine: {
        sun: "The Pythia takes {god} ahead of the crowd and answers from the tripod.",
        moon: "{god} leads the night procession to the harbor, and every ship finds its mooring.",
        mercury: "{god} runs the road to Delphi without stopping, and the answer arrives before noon.",
        venus: "{god} walks through the agora, and the flower sellers give their roses away.",
        mars: "{god} takes the field at the head of the phalanx, and the line advances.",
      },
      opposition: {
        sun: "{god} comes up the hill by a separate road, and the Pythia gives a different answer at each door.",
        moon: "{god} sits on the far hill while the city sleeps, and the two watchfires answer each other.",
        mercury: "{god} argues both sides of the case, and the jurors cannot decide.",
        venus: "{god} turns her back on the host at the feast, and the guests take sides.",
        mars: "{god} meets his rival on the open field, and both armies wait for the first spear.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put your own name to one public act, and let {god} see it done.",
        moon: "Sit down with your household after supper, and burn a pinch of barley for {god}.",
        mercury: "Run your errands in one trip, and leave a coin at the herm for {god}.",
        venus: "Say it to them in person, and burn incense to {god}.",
        mars: "Give one contest everything you have, and pledge the effort to {god}.",
      },
      sextile: {
        sun: "Ask one person whose work you respect to look at yours.",
        moon: "Invite a friend in for the evening.",
        mercury: "Ask about each errand in the fewest words.",
        venus: "Pay the person you want one honest compliment.",
        mars: "Run, lift or dig for an hour.",
      },
      square: {
        sun: "Hold your public answer until tomorrow.",
        moon: "Let the household argument end at the door.",
        mercury: "Repeat nothing you heard secondhand.",
        venus: "Wait a day before you ask for what you want.",
        mars: "Keep your fists at your sides.",
      },
      trine: {
        sun: "Speak first when the assembly opens, and pour a little wine for {god} at noon.",
        moon: "Keep the evening for your own house, and set out honey for {god}.",
        mercury: "Put the question you have been saving into words, and thank {god} when the answer comes.",
        venus: "Accept the pleasure in front of you, and burn a pinch of myrrh for {god}.",
        mars: "Go at the hardest task while your arm is fresh, and give {god} the first round.",
      },
      opposition: {
        sun: "Let someone else take the credit once.",
        moon: "Hear what your family needs before you say what you need.",
        mercury: "Ask both people to repeat what they said.",
        venus: "Give up one of the two things you want.",
        mars: "Let the other side strike first.",
      },
    },
    secondFigure: ["Down the hill from {god} and {partner},", "In the agora below {god} and {partner},", "At a lesser shrine than the one {god} and {partner} share,"],
    secondFigurePlain: ["At a lesser shrine,", "Down in the agora,", "On the road below,"],
    noSecondFigure: "No other shrine speaks today, so carry this one answer home.",
    comeBack: "Bring your next question tomorrow, when the tripod is lit again.",
    holds: "The oracle gives the same answer as yesterday.",
  },

  canaan: {
    headlines: {
      conjunction: {
        sun: "Put your hand to the plow and keep it there until the ram's horn sounds.",
        moon: "Settle one family matter before the flocks are folded.",
        mercury: "Forge the thing yourself instead of buying it off the caravan.",
        venus: "Make the vow you have been holding back, before the whole clan.",
        mars: "Pick one enemy for your bow and forget the rest.",
      },
      sextile: {
        sun: "A neighbor will help with the threshing if you ask.",
        moon: "Send a barley loaf to the family on the next terrace.",
        mercury: "Trade your skill for a neighbor's at the gate.",
        venus: "Bring a gift to the tent flap and wait to be asked in.",
        mars: "Your anger can dig a whole cistern today.",
      },
      square: {
        sun: "Someone at the gate wants your work stopped.",
        moon: "Keep the family quarrel inside the tent.",
        mercury: "Pull the crooked peg from the cedar beam and cut it again.",
        venus: "Do not swear a vow of love at the standing stone in the middle of a fight.",
        mars: "Keep clear of the fight at your neighbor's gate.",
      },
      trine: {
        sun: "The council says yes to you today, so ask.",
        moon: "Sit under your own fig tree and enjoy the evening.",
        mercury: "Your hands know the bronze, so let them work.",
        venus: "Love walks in from the olive grove without being called.",
        mars: "Thresh the whole floor before the heat goes out of you.",
      },
      opposition: {
        sun: "Your field and your tent both want the whole day.",
        moon: "The tent is divided, and your kin expect you to pick a side.",
        mercury: "Someone at the gate takes your words and argues the other side.",
        venus: "Your beloved stands across the council floor from you.",
        mars: "Someone at the well is spoiling for a quarrel, and you owe them nothing.",
      },
    },
    relations: {
      conjunction: ["rise and fall together", "share one tent", "come as one"],
      sextile: ["help each other", "stand by each other", "lend each other a hand"],
      square: ["quarrel with each other", "trip each other up", "block each other at the gate"],
      trine: ["go well together", "keep pace with each other", "agree"],
      opposition: ["make opposite demands", "make claims against each other", "pull the household two ways"],
    },
    tightTails: [", and the whole council hears it", ", and the witnesses sign the tablet", ", and the elders mark the day"],
    consequences: {
      conjunction: {
        sun: "Your work is seen by everyone at the gate.",
        mercury: "Your hands and your words make one thing.",
        venus: "Love and war arrive at the same door.",
        mars: "Your anger and your strength become one weapon.",
        jupiter: "The rain and the harvest come together.",
        saturn: "The elders' ruling falls on you whole.",
        uranus: "The heavens change your plans for you.",
        neptune: "Your fears and your prayers come in one wave.",
        pluto: "Something you lost comes back to the threshing floor.",
      },
      sextile: {
        sun: "A day's honest work earns a fair word.",
        mercury: "A skill you lend comes back as a skill borrowed.",
        venus: "A promise made now holds.",
        mars: "A short burst of effort finishes the job.",
        jupiter: "Rain falls where you planted.",
        saturn: "The elders grant one request.",
        uranus: "A visitor from far off brings an offer.",
        neptune: "A prayer said plainly is heard.",
        pluto: "An old loss eases once you name it.",
      },
      square: {
        sun: "Your work is stopped at the gate.",
        mercury: "Your tools fail you halfway through.",
        venus: "Someone tests your promise.",
        mars: "Someone objects to you in front of the council.",
        jupiter: "The rain comes late or too hard.",
        saturn: "The elders refuse you and hear no appeal.",
        uranus: "Your routine breaks without warning.",
        neptune: "Your fears speak louder than the facts.",
        pluto: "An old loss bites again.",
      },
      trine: {
        sun: "Your work goes through the gate without a question.",
        mercury: "Whatever you build stands.",
        venus: "Love answers when you call.",
        mars: "Your strength finishes the job, and nobody falls sick.",
        jupiter: "What you ask for passes without a hand raised against it.",
        saturn: "The elders approve your plan.",
        uranus: "A change you did not plan works out well.",
        neptune: "Your prayer is answered plainly.",
        pluto: "You stop grieving something old.",
      },
      opposition: {
        sun: "Your daytime work pulls against your nights at home.",
        mercury: "Your words get turned around in the retelling.",
        venus: "What you love and what you owe face each other.",
        mars: "Someone picks a quarrel with you in public.",
        jupiter: "The harvest and the debt arrive together.",
        saturn: "The elders take the other side.",
        uranus: "The sky turns against your plan.",
        neptune: "Both sides are heard, and the other side speaks well.",
        pluto: "Someone claims what you thought was finished.",
      },
    },
    images: {
      conjunction: {
        sun: "{god} goes before the assembly with a companion, and the council's decree falls on the pair.",
        moon: "{god} pays the whole bride price, and both families drink from one cup.",
        mercury: "{god} forges a weapon at the bellows, and the blade comes out true.",
        venus: "{god} rides out with a companion, and the city opens both gates.",
        mars: "{god} draws two arrows at once, and the gate guards step back.",
      },
      sextile: {
        sun: "{god} brings a friend before the gods, and the cupbearer pours for both.",
        moon: "{god} sends gifts ahead of the wedding, and the door stands open.",
        mercury: "{god} lends his tongs to a neighbor's forge, and the work goes faster.",
        venus: "{god} hangs a lamp in the window, and the guest finds the house.",
        mars: "{god} lowers his bow at the gate, and the traders come in.",
      },
      square: {
        sun: "{god} stands up to accuse, and the assembly hears nothing else at this sitting.",
        moon: "{god} quarrels over the bride price, and the families leave the table.",
        mercury: "{god}'s fire goes out under the anvil, and the blade cools half made.",
        venus: "{god} draws her sword at the feast, and the cups go down.",
        mars: "{god} shoots into the crowd at the gate, and the elders call for order.",
      },
      trine: {
        sun: "The assembly waves {god} through, and no god asks for a vow.",
        moon: "{god} sits with the threshers all night, and the work finishes early.",
        mercury: "{god} builds a palace of cedar in seven days, and it stands.",
        venus: "{god} comes down from the hills in peace, and the vineyards fill.",
        mars: "{god} unstrings his bow, and the city sleeps without fever.",
      },
      opposition: {
        sun: "The gods put down their cups as {god} takes the floor against a rival.",
        moon: "{god} calls the night court to order, and it sits until dawn.",
        mercury: "{god} wants windows in the palace and the owner wants none, and the work stops.",
        venus: "{god} faces the sea across the beach, and the sailors wait for a sign.",
        mars: "{god} aims his arrow at the gatekeeper, and the gate stays shut.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put your whole day into one job, and say its name to {god} at the gate.",
        moon: "Ask the eldest at your table for a ruling, and pour a drink for {god}.",
        mercury: "Finish the piece you started, and show it to {god} with your mark on it.",
        venus: "Say the vow in front of a witness, and let {god} hear it.",
        mars: "Spend your heat on the field before evening, and let {god} keep the arrows.",
      },
      sextile: {
        sun: "Lend your hands to a neighbor's work first.",
        moon: "Visit the relative you have not seen since the last feast.",
        mercury: "Teach someone younger one thing you know.",
        venus: "Speak kindly of the one you love in front of others.",
        mars: "Take the hardest job in the field before noon.",
      },
      square: {
        sun: "Write down who blocks your work and why.",
        moon: "Let your kin speak first and answer them tomorrow.",
        mercury: "Measure the work again before you finish it.",
        venus: "Let the argument end before either of you speaks of love.",
        mars: "Lock your own gate and stay inside it.",
      },
      trine: {
        sun: "Name the thing you want at the gate, and leave a share of the yield for {god}.",
        moon: "Spend the evening at home with your kin, and leave a bowl of dates for {god}.",
        mercury: "Start the hard part of the work first, and lay the first piece before {god}.",
        venus: "Make room at your table for one more, and thank {god} at the threshold.",
        mars: "Carry the heavy sacks yourself, and leave a sheaf for {god}.",
      },
      opposition: {
        sun: "Split the day between field and family, and say out loud how you split it.",
        moon: "Hear your family out before you answer.",
        mercury: "Ask the one arguing with you to say your words back.",
        venus: "Cross the floor to the one you love.",
        mars: "Refuse the fight you are offered.",
      },
    },
    secondFigure: ["Further down the bench from {god} and {partner},", "At the gate below {god} and {partner},", "In the fields beyond {god} and {partner},"],
    secondFigurePlain: ["Further down the bench,", "At the city gate,", "Out in the fields,"],
    noSecondFigure: "No other matter reaches the floor today, so close this one before you leave.",
    comeBack: "The council sits again tomorrow, and your seat is kept.",
    holds: "The council is still sitting on yesterday's matter.",
  },

  carthage: {
    headlines: {
      conjunction: {
        sun: "Let the whole harbor know which deal is yours.",
        moon: "The household purse is everyone's business today, to the last shekel.",
        mercury: "Put the handshake in writing before the ships sail.",
        venus: "Buy the length of purple you keep looking at.",
        mars: "Put the whole war chest behind one voyage.",
      },
      sextile: {
        sun: "Your name opens one more door on the quay.",
        moon: "Strike the small debt from the household ledger this week.",
        mercury: "The harbor is open to your offer.",
        venus: "Buy the gift from the Sicilian cargo and deliver it yourself.",
        mars: "Partners follow the trader who pays in first.",
      },
      square: {
        sun: "The suffetes are checking your figures, so make them right.",
        moon: "Do not balance the house ledger in a temper.",
        mercury: "Nothing gets your seal until a second clerk has read it.",
        venus: "Affection you paid for in shekels does not stay bought.",
        mars: "Pay nothing out of the war chest in anger.",
      },
      trine: {
        sun: "Your name is good for credit anywhere on the quay.",
        moon: "The household runs itself today like a well-stowed hold, so let it.",
        mercury: "The deal you are drafting closes cleanly before the ships leave for Gades.",
        venus: "Enjoy what the last ship brought, all of it paid for.",
        mars: "Your nerve pays off today, so press the bargain over the amphorae.",
      },
      opposition: {
        sun: "A rival trader wants your berth at the quay.",
        moon: "Home and the warehouse want the same silver.",
        mercury: "Your partners in Tyre take the contract to mean something else.",
        venus: "Your purse cannot cover both things you want, whatever the moneychanger says.",
        mars: "A mercenary captain wants you to fund his fight.",
      },
    },
    relations: {
      conjunction: ["share one account", "move as one", "go under one seal"],
      sextile: ["carry each other's cargo", "vouch for each other", "back each other"],
      square: ["fight over the same silver", "eat into each other", "undercut each other"],
      trine: ["add up on the first pass", "pay off together", "balance easily"],
      opposition: ["bid against each other", "pull the accounts two ways", "compete for the same coin"],
    },
    tightTails: [", posted to the hour", ", weighed to the last shekel", ", entered without a correction"],
    consequences: {
      conjunction: {
        sun: "Your name and your credit become one entry.",
        mercury: "The deal and the paperwork close together.",
        venus: "Pleasure and money come in one shipment.",
        mars: "Your nerve and your coin go into one venture.",
        jupiter: "Profit arrives in a single cargo.",
        saturn: "Every fixed due falls on the same day.",
        uranus: "A new route opens and closes the old one.",
        neptune: "The sea brings back what you sent out.",
        pluto: "An inherited debt and an inherited asset arrive together.",
      },
      sextile: {
        sun: "A good word in the harbor raises your credit.",
        mercury: "A small contract opens a larger one.",
        venus: "A small gift earns a large favor.",
        mars: "A little more nerve closes the deal.",
        jupiter: "A small loan made today comes back.",
        saturn: "One fixed due can be paid early at a discount.",
        uranus: "A captain offers you a new route.",
        neptune: "The weather holds for one sailing.",
        pluto: "An old debt can be settled for less.",
      },
      square: {
        sun: "Someone questions your credit on the quay.",
        mercury: "A clause in the contract turns against you.",
        venus: "Pleasure costs double.",
        mars: "Someone changes the terms on you.",
        jupiter: "Profit stalls in the warehouse.",
        saturn: "A due you forgot comes to the door.",
        uranus: "A ship changes course without telling you.",
        neptune: "Your figures blur at the edges.",
        pluto: "An old debt grows new interest.",
      },
      trine: {
        sun: "Your credit opens doors on the quay.",
        mercury: "Every contract closes cleanly.",
        venus: "Money spent on pleasure comes back.",
        mars: "Your nerve pays out double.",
        jupiter: "Your figures come out right on the first count.",
        saturn: "Your dues are paid and stay paid.",
        uranus: "A new route pays on its first sailing.",
        neptune: "The sea is kind to your cargo.",
        pluto: "An inheritance comes through clean.",
      },
      opposition: {
        sun: "A rival bids for your standing in the harbor.",
        mercury: "The other side reads the terms another way.",
        venus: "Your wants and your needs bid for the same coin.",
        mars: "A quarrel that is not yours asks for your silver.",
        jupiter: "A profit for you is a loss for a partner.",
        saturn: "Something has to be paid out, and you must choose what.",
        uranus: "A new route competes with your old one.",
        neptune: "A rumor in the harbor bids against the facts.",
        pluto: "An heir across the table disputes the will.",
      },
    },
    images: {
      conjunction: {
        sun: "The clerk writes {god} and a partner on one line, and one seal covers both.",
        moon: "{god}'s sign is cut on a fresh stele, and two families pay for it together.",
        mercury: "{god} guides two ships into port on one tide, and the harbor master logs both.",
        venus: "{god} launches the fleet with every bench manned, and each captain knows the plan.",
        mars: "{god} carries two cargoes to Tyre, and the temple takes its tithe from both.",
      },
      sextile: {
        sun: "{god} stands surety for you until the ships come home.",
        moon: "{god} keeps the harbor watch awake, and the late ship finds the channel.",
        mercury: "{god} points a captain to another landing, and the trade begins there.",
        venus: "{god} sends a fair wind to the merchant fleet, and the cargo arrives early.",
        mars: "{god} opens his storehouse to a partner, and both profit.",
      },
      square: {
        sun: "{god} refuses the terms, and the Hundred and Four read the roll again line by line.",
        moon: "{god} looks away from the household altar, and the accounts do not balance.",
        mercury: "{god} sends the ship to the wrong shore, and the cargo sits on the beach.",
        venus: "{god} recalls the fleet halfway out, and the crews want their pay.",
        mars: "{god} demands the whole tithe at once, and the warehouse empties.",
      },
      trine: {
        sun: "The clerk adds {god}'s column once, and the sum closes the sheet.",
        moon: "{god} blesses the household stele, and the family's books close clean.",
        mercury: "{god} guides every ship to its berth, and the harbor clears by noon.",
        venus: "{god} sends the fleet home laden, and the city lights its lamps.",
        mars: "{god} wins the contest at Tyre, and the tithe comes back doubled.",
      },
      opposition: {
        sun: "The clerk writes {god} against the other column, and the balance stays open.",
        moon: "{god} closes the harbor for the night, and the fishermen stay ashore.",
        mercury: "{god} guides one ship in while another sails out, and the berth is disputed.",
        venus: "{god} faces the other bidder across the harbor, and the merchants wait to see who yields.",
        mars: "{god} meets a rival champion on the quay, and the city takes sides.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put your name on one deal and see it through, and seal the page in {god}'s name.",
        moon: "Agree on one household budget with everyone at the table, and set {god}'s share aside first.",
        mercury: "Draft the contract and sign it before you sleep, with {god} as witness.",
        venus: "Spend on what you love without keeping score, and hang a strip of purple at {god}'s stele.",
        mars: "Name one venture as the only call on your war chest, and enter {god} as its patron.",
      },
      sextile: {
        sun: "Ask one trader you trust to speak for you.",
        moon: "Pay one household debt before the market opens.",
        mercury: "Put your price in writing before the next sailing.",
        venus: "Carry it to their door in your own hands.",
        mars: "Put some of your own silver into the venture.",
      },
      square: {
        sun: "Go through last month's entries line by line.",
        moon: "Leave the household books shut until morning.",
        mercury: "Ask a second clerk to read the contract.",
        venus: "Keep your purse shut until the week's books close.",
        mars: "Lock the war chest until your blood cools.",
      },
      trine: {
        sun: "Ask for the larger loan, and set aside {god}'s share.",
        moon: "Take the evening off from the household books, and thank {god} at the meal.",
        mercury: "Sign before the week is out, and file a copy at {god}'s temple.",
        venus: "Use the good cups at supper, and pour the first one for {god}.",
        mars: "Ask for the better price, and tithe the profit to {god}.",
      },
      opposition: {
        sun: "Name your price before the other side names theirs.",
        moon: "Decide whether the silver goes to the house or the ship.",
        mercury: "Read the contract aloud with the other side.",
        venus: "Pick the need over the want this once.",
        mars: "Keep your war chest closed to other people's quarrels.",
      },
    },
    secondFigure: ["Below the line for {god} and {partner},", "In the column after {god} and {partner},", "On the page facing {god} and {partner},"],
    secondFigurePlain: ["Further down the page,", "In the next column,", "On the facing page,"],
    noSecondFigure: "Nothing else is entered today, so rule off under this line and go home.",
    comeBack: "Come back tomorrow, when the books open at first light.",
    holds: "Yesterday's entry stands, and the clerk carries it forward.",
  },

  rome: {
    headlines: {
      conjunction: {
        sun: "Take the credit for your work on the rostra.",
        moon: "Keep the lamp lit in the atrium and the door open.",
        mercury: "Put your own seal on the dispatch.",
        venus: "Ask the paterfamilias for the match you want.",
        mars: "March on one objective and leave the rest in camp.",
      },
      sextile: {
        sun: "Call in the favor a client owes you.",
        moon: "Fill the triclinium with neighbors for dinner.",
        mercury: "A short note to the right magistrate gets results.",
        venus: "Pay the morning call you keep postponing.",
        mars: "Drill today, and the Campus Martius is yours tomorrow.",
      },
      square: {
        sun: "Your rivals in the Senate are watching, so give them nothing.",
        moon: "The household is quarrelsome, and the whole insula is listening.",
        mercury: "Hold the wax tablet until your temper cools.",
        venus: "Keep courtship out of forum business.",
        mars: "Stay in camp with the gladius sheathed.",
      },
      trine: {
        sun: "Speak in the forum while the crowd is ready to listen.",
        moon: "Stay in the domus tonight and let the household fuss over you.",
        mercury: "Make your case to the praetor while it reads well.",
        venus: "Take your place on the dining couch when you are asked.",
        mars: "Take the field, because the auspices are on your side.",
      },
      opposition: {
        sun: "A rival in the Senate wants your seat.",
        moon: "Your household and your duties in the Curia pull against each other.",
        mercury: "Your dispatch and theirs cannot both carry the tribes' vote.",
        venus: "One of the two houses on the Palatine will be disappointed in you.",
        mars: "You do not have to force what the ground refuses.",
      },
    },
    relations: {
      conjunction: ["march under one standard", "act as one", "go together"],
      sextile: ["lend each other troops", "do each other favors", "support each other"],
      square: ["block each other's road", "clash", "obstruct each other"],
      trine: ["sit on the same side of the Senate", "see eye to eye", "work well together"],
      opposition: ["veto each other", "oppose each other", "pull in different directions"],
    },
    tightTails: [", true to the augur's line", ", and the augur marks it in his book", ", and the pontiff marks it in the calendar"],
    consequences: {
      conjunction: {
        sun: "You answer in public for everything you do.",
        mercury: "Your words and your deals travel together.",
        venus: "Love and alliance become one contract.",
        mars: "Your effort and your anger serve under one command.",
        jupiter: "Good fortune and duty arrive on the same day.",
        saturn: "Your accounts and your obligations meet at once.",
        uranus: "Your plans change in a single stroke.",
        neptune: "Pleasure and confusion come in one cup.",
        pluto: "What you inherit and what you owe come due together.",
      },
      sextile: {
        sun: "One public favor raises your name.",
        mercury: "A short letter gets a fast answer.",
        venus: "A friendly visit opens a useful door.",
        mars: "A short effort wins the skirmish.",
        jupiter: "One favor asked is granted.",
        saturn: "One debt can be settled on good terms.",
        uranus: "A new idea finds a sponsor.",
        neptune: "An afternoon of rest pays for itself.",
        pluto: "A family matter can be settled quietly.",
      },
      square: {
        sun: "Your name meets resistance in public.",
        mercury: "Your dispatch arrives late or garbled.",
        venus: "A courtship meets a family objection.",
        mars: "Your business is put off.",
        jupiter: "The vote you expected does not come.",
        saturn: "The treasury says no.",
        uranus: "A sudden order reverses your plans.",
        neptune: "You cannot tell flattery from counsel.",
        pluto: "An old family claim blocks your way.",
      },
      trine: {
        sun: "Your name carries weight in the forum.",
        mercury: "Your messages arrive on time and are read.",
        venus: "A courtship goes well.",
        mars: "Your campaign takes ground.",
        jupiter: "Your motion passes.",
        saturn: "Your accounts balance at the year's end.",
        uranus: "A reform you pushed takes hold.",
        neptune: "Rest restores you.",
        pluto: "Family money comes to your aid.",
      },
      opposition: {
        sun: "A rival stands against your name.",
        mercury: "Two reports contradict each other.",
        venus: "Two families want different matches for you.",
        mars: "Your opponent will not yield.",
        jupiter: "Your patron wants something in return.",
        saturn: "The treasury and your wishes face each other.",
        uranus: "Your reforms meet a reaction.",
        neptune: "Nothing passes today.",
        pluto: "An heir across the forum contests your claim.",
      },
    },
    images: {
      conjunction: {
        sun: "{god} waits on the sacred chickens, and the keeper announces that they have eaten.",
        moon: "{god} comes to the household shrine with a guest, and both are fed before the family eats.",
        mercury: "{god} closes two bargains on one market day, and the aediles record both.",
        venus: "{god} joins two houses at the altar, and the pontifex ties the knot.",
        mars: "{god} gathers two legions under one eagle, and the camp moves at dawn.",
      },
      sextile: {
        sun: "The haruspex finds the liver favorable to {god}, and the sign holds until dusk.",
        moon: "{god} keeps the gate open after dark, and the travelers leave early.",
        mercury: "{god} speeds the courier along the Via Appia, and the reply comes back in a day.",
        venus: "{god} sends a garland to the right door, and the family invites you in.",
        mars: "{god} sends a cohort to relieve the line, and the soldiers eat a hot meal.",
      },
      square: {
        sun: "An adverse omen stands in {god}'s path, and the consul adjourns the Senate.",
        moon: "{god}'s offering is late at the Aventine shrine, and the household quarrels over whose turn it was.",
        mercury: "{god} loses the dispatch at the river crossing, and the legate waits for orders.",
        venus: "{god} quarrels with the bride's mother over the match, and the wedding is postponed.",
        mars: "{god} finds the sacred shields moved, and the Salii refuse to dance.",
      },
      trine: {
        sun: "The augur names {god} in his prayer, and the birds come from the right.",
        moon: "{god} is honored in the atrium at supper, and the household shrine gets an extra cake.",
        mercury: "{god} carries every letter on time, and the forum hears your case first.",
        venus: "{god} smiles on the wedding procession, and the torches stay lit all the way home.",
        mars: "{god} gives the signal from the right, and the legion advances in good order.",
      },
      opposition: {
        sun: "The tribunes are divided over {god}, and the assembly goes home without a vote.",
        moon: "{god} holds the night and the magistrates hold the day, and the watch doubles at the gates.",
        mercury: "{god} takes the case for both parties before the praetor, and the hearing is adjourned.",
        venus: "{god} stands with one family and the pontifex with the other, and the betrothal stalls.",
        mars: "{god} faces an enemy camp across the river, and neither side crosses.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Stand behind one decision in public, and burn incense to {god}.",
        moon: "Bring the household together for one meal, and set out a cake for {god}.",
        mercury: "Write the dispatch in your own hand, and sprinkle the page with water from {god}'s spring.",
        venus: "Send a go-between to the family, and tie a ribbon at {god}'s shrine.",
        mars: "Name one objective to your officers, and vow a shield to {god}.",
      },
      sextile: {
        sun: "Visit your patron in the morning.",
        moon: "Set an extra place at dinner.",
        mercury: "Find out which clerk handles your matter.",
        venus: "Send a gift ahead of your visit.",
        mars: "Spend an hour at drill.",
      },
      square: {
        sun: "Say less than you know in public.",
        moon: "Settle household quarrels inside the walls.",
        mercury: "Show the letter to a friend before you send it.",
        venus: "Let the courtship rest a week.",
        mars: "Post sentries and hold your ground.",
      },
      trine: {
        sun: "Take the front bench at the next meeting, and hang a garland for {god} on the way.",
        moon: "Eat with your family, and give the first cup to {god}.",
        mercury: "Get your argument into writing, and leave a coin at {god}'s shrine.",
        venus: "Go where you are invited, and wear a sprig of myrtle for {god}.",
        mars: "Move first, and promise {god} a share of the spoils.",
      },
      opposition: {
        sun: "Let your rival speak first in the forum.",
        moon: "Tell your household whether duty or home comes first.",
        mercury: "Ask for both reports in writing.",
        venus: "Choose one family's favor over the other's.",
        mars: "Hold your position without attacking.",
      },
    },
    secondFigure: ["Behind {god} and {partner} in the sky,", "Across the forum from {god} and {partner},", "Below the Capitol, where {god} meets {partner},"],
    secondFigurePlain: ["Elsewhere in the sky,", "Across the forum,", "On the Capitol,"],
    noSecondFigure: "The sky sends no second sign, so the rest of your day is yours to spend.",
    comeBack: "The augur takes the auspices again at dawn, so come back tomorrow.",
    holds: "The auspices stand as they stood.",
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
