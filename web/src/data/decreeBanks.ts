import type { Culture, Planet } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The day page's banks: what the decree says to the reader, per culture.
 * Composed by lib/decree.ts into the anatomy docs/superpowers/specs/
 * 2026-09-29-daily-reading-voice.md lays out:
 *
 *   headline      one sentence to the reader, per (kind, headline body)
 *   evidence      the two gods, the glyph, the orb (built, not banked)
 *   (a) meaning   "{domain A} and {domain B} {relation}{exact tail}."
 *   (b) consequence, per (kind, partner body)
 *   (c) image     the institution's picture, per (kind, headline body),
 *                 naming both gods
 *   (d) second figure in one sentence, or the no-second-figure line
 *   (e) instruction, per (kind, headline body), written for that body's
 *                 domain and naming both gods
 *
 * Templates carry two slots: {god} (the headline body's deity) and {partner}
 * (the other body's deity). Plain strings with named slots, so the Android
 * generator carries them across without parsing code.
 *
 * The keys make every sentence after the evidence line change with the
 * figure: two figures that share a headline body differ in the partner, and
 * the image and the instruction name it. The composer adds the rest of the
 * rule, that no sentence repeats within seven days (lib/decree.ts). No
 * sentence repeats across two cultures.
 */

/** The bodies that move fast enough to headline a day. */
export type FastBody = "sun" | "moon" | "mercury" | "venus" | "mars";

/** The Moon always headlines a figure it is in, so it is never the partner. */
export type PartnerBody = Exclude<Planet, "moon">;

export interface DecreeBank {
  /** One sentence to the reader per (kind, headline body). */
  headlines: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /** Plural predicate: "{domain A} and {domain B} {relation}". */
  relations: Readonly<Record<AspectKind, string>>;
  /** Appended to the meaning sentence under half a degree; the day picks one. */
  exactTails: readonly [string, string];
  /** What the figure means for the reader, per (kind, partner body). */
  consequences: Readonly<Record<AspectKind, Readonly<Record<PartnerBody, string>>>>;
  /** The institution's picture, per (kind, headline body). Slots: {god}, {partner}. */
  images: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /** The one order, always last, per (kind, headline body). Slots: {god}, {partner}. */
  instructions: Readonly<Record<AspectKind, Readonly<Record<FastBody, string>>>>;
  /** Opens the second-figure sentence; the day picks one. */
  secondFigure: readonly [string, string];
  /** Stands in for the second figure when the sky offers none. */
  noSecondFigure: string;
  /** Closes the day page. */
  comeBack: string;
}

export const DECREE_BANKS: Readonly<Record<Culture, DecreeBank>> = {
  egypt: {
    headlines: {
      conjunction: {
        sun: "Lay the first brick of the thing you keep talking about.",
        moon: "Say what you feel over bread at your own table.",
        mercury: "Write the letter on fresh papyrus and seal it yourself.",
        venus: "Bring the one you love down to the riverbank and say it plainly.",
        mars: "Aim your anger at one field and clear it.",
      },
      sextile: {
        sun: "Ask a neighbor to take the other end of the sledge.",
        moon: "Share your bread with someone at home tonight.",
        mercury: "Send the short message by the next boat.",
        venus: "Offer the first loaf, and keep the gift small.",
        mars: "Put your strength into the canal in front of you.",
      },
      square: {
        sun: "Finish the one task the overseer will check.",
        moon: "Do not act on the mood you wake up with before the sun is high.",
        mercury: "Read the papyrus twice before you answer it.",
        venus: "Do not haggle with someone you love like a grain seller.",
        mars: "Keep your hand off the harpoon until the water clears.",
      },
      trine: {
        sun: "Start the heavy thing while the light holds.",
        moon: "Rest tonight without counting the grain.",
        mercury: "Say it plainly and the river carries it.",
        venus: "Let someone pour your beer tonight.",
        mars: "Push the barge off the mud while your arms are strong.",
      },
      opposition: {
        sun: "You cannot stand on both banks, so pick one.",
        moon: "What you want and what the household wants are on opposite banks tonight.",
        mercury: "Someone on the far bank reads your words backward.",
        venus: "Love asks you to cross the river this time.",
        mars: "Someone across the river wants a fight, and you can let them wait.",
      },
    },
    relations: {
      conjunction: "ride in one boat",
      sextile: "throw each other a rope",
      square: "haul on opposite ropes",
      trine: "float on the same current",
      opposition: "stand on opposite banks",
    },
    exactTails: [", true as the plumb line", ", and the cord is drawn tight"],
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
        jupiter: "Ask a patron once and the answer is yes.",
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
        sun: "{god} walks through the pylon with {partner}, and the doorkeeper slides back the bolt.",
        moon: "{god} brings {partner} into the temple at night, and the priests light one lamp for both.",
        mercury: "{god} and {partner} share one sheet of papyrus, and the scribe writes both names.",
        venus: "{god} gathers what was scattered with {partner}'s help, and the pieces are bound in one cloth.",
        mars: "{god} and {partner} throw in one motion, and the hippopotamus does not rise again.",
      },
      sextile: {
        sun: "{god} sends the north wind behind {partner}, and even a boat with no sail moves upstream.",
        moon: "{god} lights the path between the fields for {partner}, and the night watchman waves you through.",
        mercury: "{god} lends the scribe a fresh reed at {partner}'s request, and the letter is finished before noon.",
        venus: "{god} sets bread on the offering table and {partner} brings the beer.",
        mars: "{god} hands {partner} the lighter oar, and the barge still makes headway.",
      },
      square: {
        sun: "{god} and {partner} take opposite ropes at the sledge, and the overseer calls a halt.",
        moon: "{god} clouds the water where {partner} wants to cross, and the boatman waits for dawn.",
        mercury: "{god} and {partner} both reach for the ink, and the scribe starts the sheet again.",
        venus: "{god} leans on the balance against {partner}, and Thoth writes down which way it tips.",
        mars: "{god} raises the harpoon at {partner}, and the priests call him back.",
      },
      trine: {
        sun: "{god} and {partner} sit level on the scale, and Anubis leaves the beam alone.",
        moon: "{god} and {partner} fill the cistern by night, and the household wakes to water.",
        mercury: "{god} carries the letter on {partner}'s wind, and it lands before the sender sleeps.",
        venus: "{god} anoints the doorpost with {partner}'s oil, and everyone who passes is welcome.",
        mars: "{god} drives the hippopotamus off the field with {partner} beside him, and the farmers plant again.",
      },
      opposition: {
        sun: "{god} hangs in one pan of the scale and {partner} in the other, and Thoth waits with his reed raised.",
        moon: "{god} looks across the river at {partner}, and the far bank sees every lamp you light.",
        mercury: "{god} reads the letter aloud on one bank and {partner} on the other, and each side hears a different word.",
        venus: "{god} stands at one end of the hall and {partner} at the other, and the bride's family waits between them.",
        mars: "{god} faces {partner} across the water, and the gods wait to see who strikes.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put one task at the head of your day, and name it to {god} and {partner} at sunrise.",
        moon: "Eat with the people you live with tonight, and leave a lamp burning for {god} and {partner}.",
        mercury: "Answer no one else until that letter is sent, and seal it in the names of {god} and {partner}.",
        venus: "Hold nothing back from your beloved tonight, and set a cup aside for {god} and {partner}.",
        mars: "Give your temper to the hardest chore in the house, and give {god} the first stroke and {partner} the last.",
      },
      sextile: {
        sun: "Accept the help that is offered before noon, and thank {god} and {partner} for it.",
        moon: "Mend one small thing in the house, and say the names of {god} and {partner} over it.",
        mercury: "Put the answer you owe into three lines, and let {god} and {partner} carry it.",
        venus: "Ask your beloved what they need this week, and say the names of {god} and {partner} over the bread.",
        mars: "Finish one job with your hands before dark, and let {god} and {partner} count the strokes.",
      },
      square: {
        sun: "Drop the least important task, and tell {god} and {partner} which one you dropped.",
        moon: "Say nothing at home until you have eaten, and leave the first bite for {god} and {partner}.",
        mercury: "Have someone else read your answer before it leaves, and ask {god} and {partner} to check the seal.",
        venus: "Leave the household accounts for another night, and let {god} and {partner} hold the purse.",
        mars: "Walk the length of the canal before you answer an insult, and let {god} and {partner} hold the harpoon.",
      },
      trine: {
        sun: "Lift the heaviest stone of the week first, and call on {god} and {partner} as you lift it.",
        moon: "Go to bed early, and leave a cup of water for {god} and {partner}.",
        mercury: "Speak to the person you have been avoiding, and trust {god} and {partner} to carry the words.",
        venus: "Let your beloved do something for you, and thank {god} and {partner} aloud.",
        mars: "Take on the heavy labor before noon, and raise your arm to {god} and {partner} when it is done.",
      },
      opposition: {
        sun: "Give the evening to home or to work, and tell {god} and {partner} which.",
        moon: "Keep your moods on your own side of the river, and hail {god} and {partner} from there.",
        mercury: "Ask the other side to repeat what they heard, and let {god} and {partner} witness it.",
        venus: "Give up one small thing for your beloved, and lay it before {god} and {partner}.",
        mars: "Wait for the far bank to make the first move, and ask {god} and {partner} to keep the peace.",
      },
    },
    secondFigure: ["Lower on the river,", "On the far bank,"],
    noSecondFigure: "Nothing else on the river comes near it, so this is the one thing you weigh today.",
    comeBack: "Come back at dawn, when the scale is set again.",
  },

  greece: {
    headlines: {
      conjunction: {
        sun: "Sign your name in the agora where everyone can read it.",
        moon: "Ask your household the question you avoid at dinner.",
        mercury: "Say your question to the oracle out loud and write down the answer.",
        venus: "Tell the person you want that you want them.",
        mars: "Choose one fight worth your shield and walk away from the rest.",
      },
      sextile: {
        sun: "Show your work in the agora to someone who can help it.",
        moon: "Open your door to the friend who knocks after supper.",
        mercury: "A short message sent by the next ship opens the road.",
        venus: "Say one kind thing at the table and mean it.",
        mars: "Spend your strength in the gymnasium, where it builds something.",
      },
      square: {
        sun: "The agora will test you, so answer slowly.",
        moon: "Do not ask the oracle what you are not ready to hear.",
        mercury: "Check what the herald said before you repeat it.",
        venus: "Wanting it badly is no reason to ask Aphrodite for it.",
        mars: "Hang up the spear before someone hands you a reason.",
      },
      trine: {
        sun: "Stand up in the assembly and be counted.",
        moon: "Your own hearth gives a better answer than any oracle.",
        mercury: "Ask now, while the road to Delphi is clear.",
        venus: "Drink the wine that is poured for you.",
        mars: "Enter the hard race and expect the laurel.",
      },
      opposition: {
        sun: "The agora has another candidate for your honor.",
        moon: "Your family's needs and yours face each other across the table.",
        mercury: "Two messengers will bring you two different stories.",
        venus: "Choose between the two cups you are offered.",
        mars: "Let the enemy across the plain wait for a fight that does not come.",
      },
    },
    relations: {
      conjunction: "go up the hill together",
      sextile: "clear the road for each other",
      square: "argue at the same gate",
      trine: "keep step with each other",
      opposition: "take opposite sides of the question",
    },
    exactTails: [", to the very degree", ", and the Pythia does not hesitate"],
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
        sun: "{god} stands at the tripod with {partner}, and the Pythia answers them in one breath.",
        moon: "{god} brings {partner} to the night rites, and the priestess pours for two.",
        mercury: "{god} carries {partner}'s message in his own satchel, and both doors open.",
        venus: "{god} ties her girdle around {partner}, and the whole symposium watches.",
        mars: "{god} locks shields with {partner}, and the line holds.",
      },
      sextile: {
        sun: "The shrine is open to {god} and {partner}, and the Pythia answers whoever climbs to her first.",
        moon: "{god} lights {partner}'s road home from the symposium, and nobody stumbles.",
        mercury: "{god} sets a herm for {partner} at the crossroads, and travelers take the right turn.",
        venus: "{god} sends a dove to {partner} in the agora, and two strangers start talking.",
        mars: "{god} drills beside {partner} at dawn, and the shield wall closes faster.",
      },
      square: {
        sun: "{god} fights {partner} for first place in the line, and the Pythia draws lots before she speaks.",
        moon: "{god} hides behind cloud from {partner}, and the night sailors argue over the stars.",
        mercury: "{god} switches {partner}'s tablets, and the assembly hears the wrong decree.",
        venus: "{god} throws the golden apple at {partner}'s feet, and the table goes quiet.",
        mars: "{god} breaks the truce with {partner} at the games, and the judges stop the race.",
      },
      trine: {
        sun: "The Pythia takes {god} and {partner} ahead of the crowd and answers from the tripod.",
        moon: "{god} and {partner} pour light on the harbor, and every ship finds its mooring.",
        mercury: "{god} runs the road to Delphi with {partner}'s blessing, and the answer arrives before noon.",
        venus: "{god} walks through the agora on {partner}'s arm, and the flower sellers give their roses away.",
        mars: "{god} takes the field with {partner} beside him, and the line advances.",
      },
      opposition: {
        sun: "{god} comes up the hill by one road and {partner} by another, and the Pythia gives each a different answer.",
        moon: "{god} stands full across the sky from {partner}, and the tides run high.",
        mercury: "{god} argues one side of the case and {partner} the other, and the jurors cannot decide.",
        venus: "{god} turns her back on {partner} at the feast, and the guests take sides.",
        mars: "{god} meets {partner} across the plain, and both armies wait for the first spear.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put your own name to one public act, and let {god} and {partner} see it done.",
        moon: "Sit down with your household after supper, and pour a drop for {god} and {partner}.",
        mercury: "Run your errands in one trip, and leave a coin at the herm for {god} and {partner}.",
        venus: "Say it to them in person, and burn incense to {god} and {partner}.",
        mars: "Give one contest everything you have, and pledge the effort to {god} and {partner}.",
      },
      sextile: {
        sun: "Ask one person whose work you respect to look at yours, and thank {god} and {partner} at noon.",
        moon: "Invite a friend in for the evening, and leave the lamp lit for {god} and {partner}.",
        mercury: "Ask about your errands in the fewest words, and thank {god} and {partner} at the crossroads.",
        venus: "Pay the person you want one honest compliment, and offer {god} and {partner} a flower.",
        mars: "Run, lift or dig for an hour, and dedicate the sweat to {god} and {partner}.",
      },
      square: {
        sun: "Give your answer in the agora tomorrow, and ask {god} and {partner} for a clear head tonight.",
        moon: "Let the household argument end at the door, and ask {god} and {partner} for a quiet night.",
        mercury: "Repeat nothing you heard secondhand, and keep the names of {god} and {partner} out of any lie.",
        venus: "Wait a day before you ask for what you want, and let {god} and {partner} cool your blood.",
        mars: "Keep your fists at your sides, and let {god} and {partner} find another field.",
      },
      trine: {
        sun: "Speak first when the assembly opens, and pour a little wine for {god} and {partner} at noon.",
        moon: "Keep tonight for your own house, and set out honey for {god} and {partner}.",
        mercury: "Put the question you have been saving into words, and thank {god} and {partner} when the answer comes.",
        venus: "Accept the pleasure in front of you, and spill the first drop for {god} and {partner}.",
        mars: "Go at the hardest task while your arm is fresh, and give {god} and {partner} the first round.",
      },
      opposition: {
        sun: "Let someone else take the credit once, and tell {god} and {partner} you noticed.",
        moon: "Hear what your family needs before you say what you need, and let {god} and {partner} hear both.",
        mercury: "Ask both people to repeat what they said, and let {god} and {partner} judge the difference.",
        venus: "Give up one of the two things you want, and offer it to {god} and {partner}.",
        mars: "Let the other side strike first, and ask {god} and {partner} to stay their hands.",
      },
    },
    secondFigure: ["At a lesser shrine,", "Down in the agora,"],
    noSecondFigure: "No other shrine speaks today, so carry this one answer home.",
    comeBack: "Bring your next question tomorrow, when the tripod is lit again.",
  },

  canaan: {
    headlines: {
      conjunction: {
        sun: "Put your hand to the plow and keep it there until sundown.",
        moon: "Settle one family matter at the table before the lamps go out.",
        mercury: "Forge the thing yourself instead of buying it.",
        venus: "Make the vow you have been holding back.",
        mars: "Aim every arrow you have at one target.",
      },
      sextile: {
        sun: "A neighbor will help with the threshing if you ask.",
        moon: "Send a loaf to the house that needs it.",
        mercury: "Trade your skill for a neighbor's at the gate.",
        venus: "Bring a gift to the door and wait to be asked in.",
        mars: "Your anger can dig a whole cistern today.",
      },
      square: {
        sun: "Someone at the gate wants your work stopped.",
        moon: "Keep the family quarrel inside the tent.",
        mercury: "Check the joint before you set the beam.",
        venus: "Do not swear a vow of love in the middle of a fight.",
        mars: "Stay out of the fight at your neighbor's gate.",
      },
      trine: {
        sun: "The council says yes to you today, so ask.",
        moon: "Your house is in order, and you can sit down in it.",
        mercury: "Your hands know the work, and you can trust them.",
        venus: "Love comes to the door without being called.",
        mars: "Thresh the whole floor before the heat goes out of you.",
      },
      opposition: {
        sun: "Your field and your family both want the whole day.",
        moon: "Your family wants one thing at the table and you want the other.",
        mercury: "Someone at the gate takes your words and argues the other side.",
        venus: "The one you love stands on the far side of the council floor.",
        mars: "Someone is spoiling for a fight, and you owe them nothing.",
      },
    },
    relations: {
      conjunction: "stand before the council as one",
      sextile: "vouch for each other",
      square: "quarrel at the gate",
      trine: "sit at the same table",
      opposition: "call opposing witnesses",
    },
    exactTails: [", and the whole council hears it", ", and the witnesses sign the tablet"],
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
        sun: "{god} goes before the assembly with {partner}, and the council's decree falls on the pair.",
        moon: "{god} pays the bride price to {partner} in full, and both families drink from one cup.",
        mercury: "{god} forges a weapon with {partner} at the bellows, and the blade comes out true.",
        venus: "{god} rides out with {partner}, and the city opens both gates.",
        mars: "{god} and {partner} draw their bows together, and the gate guards step back.",
      },
      sextile: {
        sun: "{god} brings {partner} before the gods, and the cupbearer pours for both.",
        moon: "{god} sends gifts to {partner}'s house ahead of the wedding, and the door stands open.",
        mercury: "{god} lends his tongs to {partner}'s forge, and the work goes faster.",
        venus: "{god} sets a lamp in the window for {partner}, and the guest finds the house.",
        mars: "{god} lowers his bow when {partner} comes to the gate, and the traders come in.",
      },
      square: {
        sun: "{god} rises to accuse {partner}, and the assembly hears nothing else at this sitting.",
        moon: "{god} quarrels with {partner} over the bride price, and the families leave the table.",
        mercury: "{god}'s fire goes out when {partner} opens the door, and the blade cools half made.",
        venus: "{god} draws her sword on {partner} at the feast, and the cups go down.",
        mars: "{god} shoots into {partner}'s crowd at the gate, and the elders call for order.",
      },
      trine: {
        sun: "The assembly waves {god} and {partner} through, and no god asks for a vow.",
        moon: "{god} and {partner} light the threshing floor all night, and the work finishes early.",
        mercury: "{god} builds a palace with {partner}'s cedar, and it stands.",
        venus: "{god} comes down from the hills with {partner} in peace, and the vineyards fill.",
        mars: "{god} unstrings his bow at {partner}'s word, and the city sleeps without fever.",
      },
      opposition: {
        sun: "The gods put down their cups as {god} takes the floor against {partner}.",
        moon: "{god} stands across the sky from {partner}, and the night court sits until dawn.",
        mercury: "{god} argues for windows in the palace and {partner} argues against, and the work stops.",
        venus: "{god} faces {partner} across the beach, and the sailors wait for a sign.",
        mars: "{god} sets his arrow against {partner} at the gate, and the gate stays shut.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put your whole day into one job, and say its name to {god} and {partner} at the gate.",
        moon: "Ask the eldest at your table for a ruling, and pour a drink for {god} and {partner}.",
        mercury: "Finish the piece you started and show it to {god} and {partner} with your mark on it.",
        venus: "Say the vow in front of a witness, and let {god} and {partner} hear it.",
        mars: "Spend your heat on the field before evening, and let {god} and {partner} keep the arrows.",
      },
      sextile: {
        sun: "Lend your hands to a neighbor's work first, in the hearing of {god} and {partner}.",
        moon: "Visit the relative you have not seen since the last feast, and say the names of {god} and {partner} at the door.",
        mercury: "Teach someone younger one thing you know, and let {god} and {partner} witness it.",
        venus: "Speak kindly of the one you love in front of others, and leave a lamp for {god} and {partner}.",
        mars: "Take the hardest job in the field before noon, and offer the sweat to {god} and {partner}.",
      },
      square: {
        sun: "Write down who blocks your work and why, and let {god} and {partner} keep the tablet.",
        moon: "Let your kin speak tonight and answer them tomorrow, and ask {god} and {partner} for quiet.",
        mercury: "Measure the work again before you finish it, and let {god} and {partner} check the line.",
        venus: "Let the argument end before either of you speaks of love, and let {god} and {partner} hold the oath.",
        mars: "Lock your own gate tonight, and leave the quarrel to {god} and {partner}.",
      },
      trine: {
        sun: "Name the thing you want at the gate, and leave a share of the yield for {god} and {partner}.",
        moon: "Spend the evening at home with your kin, and set a cup for {god} and {partner}.",
        mercury: "Start the hard part of the work first, and lay the first piece before {god} and {partner}.",
        venus: "Make room at your table for one more, and thank {god} and {partner} at the threshold.",
        mars: "Carry the heavy sacks yourself, and leave a sheaf for {god} and {partner}.",
      },
      opposition: {
        sun: "Split the day between field and family, and tell {god} and {partner} how you split it.",
        moon: "Let your family speak first, and keep your answer until {god} and {partner} have heard them.",
        mercury: "Ask the one arguing with you to say your words back, and let {god} and {partner} judge.",
        venus: "Cross the floor to the one you love, and let {god} and {partner} see you go.",
        mars: "Refuse the fight you are offered, and hand the arrow to {god} and {partner}.",
      },
    },
    secondFigure: ["Further down the bench,", "At the city gate,"],
    noSecondFigure: "No other matter reaches the floor today, so close this one before you leave.",
    comeBack: "The council sits again tomorrow, and your seat is kept.",
  },

  carthage: {
    headlines: {
      conjunction: {
        sun: "Let the whole harbor know which deal is yours.",
        moon: "Tonight the household money is everyone's business.",
        mercury: "Put the handshake in writing before the ships sail.",
        venus: "Buy the length of purple you keep looking at.",
        mars: "Back one ship with everything you have.",
      },
      sextile: {
        sun: "Your name opens one more door on the quay.",
        moon: "One coin at home now saves ten in the spring.",
        mercury: "The harbor is open to your offer.",
        venus: "A small gift goes further than a large promise.",
        mars: "Partners follow the trader who pays in first.",
      },
      square: {
        sun: "Someone is checking your figures, so make them right.",
        moon: "Do not balance the house ledger in a temper.",
        mercury: "Read the small print before you press your seal into the wax.",
        venus: "Affection bought at the market does not stay bought.",
        mars: "Pay nothing out of the war chest in anger.",
      },
      trine: {
        sun: "The whole quay will take your note this week.",
        moon: "The household runs itself today, so let it.",
        mercury: "The deal you are drafting closes cleanly.",
        venus: "Enjoy the things you have already paid for.",
        mars: "Your nerve pays off today, so press the bargain.",
      },
      opposition: {
        sun: "The quay has a new bidder for your berth.",
        moon: "Home and trade want the same silver.",
        mercury: "The other side reads the contract differently than you do.",
        venus: "What you want costs what you need.",
        mars: "Someone wants you to fund their fight.",
      },
    },
    relations: {
      conjunction: "share one account",
      sextile: "carry each other's cargo",
      square: "fight over the same silver",
      trine: "add up on the first pass",
      opposition: "bid against each other",
    },
    exactTails: [", posted to the hour", ", weighed to the last shekel"],
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
        sun: "The clerk writes {god} and {partner} on one line, and one seal covers both.",
        moon: "{god}'s sign and {partner}'s are cut on one stele, and two families pay for it together.",
        mercury: "{god} guides {partner}'s ship into port on the same tide, and the harbor master logs both.",
        venus: "{god} launches the fleet with {partner} aboard, and every captain knows the plan.",
        mars: "{god} carries {partner}'s cargo with his own to Tyre, and the temple takes its tithe from both.",
      },
      sextile: {
        sun: "{god} stands surety with {partner} until the ships come home.",
        moon: "{god} lights the harbor mouth for {partner}, and the late ship finds the channel.",
        mercury: "{god} points {partner} to a new landing, and the trade begins there.",
        venus: "{god} sends {partner} a fair wind, and the cargo arrives early.",
        mars: "{god} opens his storehouse to {partner}, and both profit.",
      },
      square: {
        sun: "{god} refuses {partner}'s terms, and the Hundred and Four read the roll again line by line.",
        moon: "{god} looks away from {partner}'s altar, and the household accounts do not balance.",
        mercury: "{god} sends {partner}'s ship to the wrong shore, and the cargo sits on the beach.",
        venus: "{god} recalls the fleet that {partner} sent out, and the crews want their pay.",
        mars: "{god} demands the full tithe from {partner} at once, and the warehouse empties.",
      },
      trine: {
        sun: "The clerk adds {god}'s column to {partner}'s, and the sum closes the sheet.",
        moon: "{god} and {partner} bless the household stele, and the family's books close clean.",
        mercury: "{god} guides {partner}'s ships to their berths, and the harbor clears by noon.",
        venus: "{god} brings the fleet home with {partner}'s wind behind it, and the city lights its lamps.",
        mars: "{god} wins the contest at Tyre with {partner} watching, and the tithe comes back doubled.",
      },
      opposition: {
        sun: "The clerk sets {god} against {partner} in the other column, and the balance stays open.",
        moon: "{god} rises full opposite {partner}, and the fishermen stay ashore.",
        mercury: "{god} guides one ship in while {partner} sends another out, and the berth is disputed.",
        venus: "{god} faces {partner} across the harbor, and the merchants wait to see who yields.",
        mars: "{god} meets {partner} on the quay as rival champions, and the city takes sides.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Put your name on one deal and see it through, and seal the page in the names of {god} and {partner}.",
        moon: "Agree on one household budget with everyone at the table, and set aside the share of {god} and {partner} first.",
        mercury: "Draft the contract and sign it before you sleep, with {god} and {partner} as witnesses.",
        venus: "Spend on what you love without keeping score, and pour a cup for {god} and {partner}.",
        mars: "Name one venture as the only call on your war chest, and enter {god} and {partner} as its patrons.",
      },
      sextile: {
        sun: "Ask one trader you trust to speak for you, and name {god} and {partner} as witnesses.",
        moon: "Pay one household debt before the market opens, and light a lamp for {god} and {partner}.",
        mercury: "Put your price in writing before the next sailing, under the marks of {god} and {partner}.",
        venus: "Hand over the gift yourself, and burn incense for {god} and {partner}.",
        mars: "Put some of your own silver into the venture, and enter {god} and {partner} in the books as partners.",
      },
      square: {
        sun: "Go through last month's entries tonight, and hand the tally to the temple clerk in the names of {god} and {partner}.",
        moon: "Leave the household books shut until morning, and keep a lamp lit for {god} and {partner}.",
        mercury: "Ask a second clerk to read the contract, and swear by {god} and {partner} to nothing you have not read.",
        venus: "Keep your purse shut tonight, and promise {god} and {partner} the difference.",
        mars: "Lock the war chest until your blood cools, and let {god} and {partner} hold the key.",
      },
      trine: {
        sun: "Ask for the larger loan, and set aside the share of {god} and {partner}.",
        moon: "Take the evening off from the household books, and thank {god} and {partner} at the meal.",
        mercury: "Sign before the week is out, and file a copy at the temple of {god} and {partner}.",
        venus: "Use the good cups tonight, and pour the first one for {god} and {partner}.",
        mars: "Ask for the better price, and tithe the profit to {god} and {partner}.",
      },
      opposition: {
        sun: "Name your price before the other side names theirs, and let {god} and {partner} set the scale.",
        moon: "Decide whether the silver goes to the house or the ship, and tell {god} and {partner} which.",
        mercury: "Read the contract aloud with the other side, and let {god} and {partner} hear where you differ.",
        venus: "Pick the need over the want this once, and tell {god} and {partner} what it cost.",
        mars: "Keep your war chest closed to other people's quarrels, and let {god} and {partner} guard it.",
      },
    },
    secondFigure: ["Further down the page,", "In the next column,"],
    noSecondFigure: "Nothing else is entered today, so rule off under this line and go home.",
    comeBack: "Come back tomorrow, when the books open at first light.",
  },

  rome: {
    headlines: {
      conjunction: {
        sun: "Take the credit for your work on the rostra.",
        moon: "Keep the lamp lit in the atrium and the door open.",
        mercury: "Put your own seal on the dispatch.",
        venus: "Ask the family for the match you want.",
        mars: "March on one objective and leave the rest in camp.",
      },
      sextile: {
        sun: "Call in the favor a client owes you.",
        moon: "Invite a neighbor to dinner in the triclinium.",
        mercury: "A short note to the right magistrate gets results.",
        venus: "Pay the visit you keep postponing.",
        mars: "Drill today, and the Campus Martius is yours tomorrow.",
      },
      square: {
        sun: "Your rivals in the Senate are watching, so give them nothing.",
        moon: "The household is quarrelsome, and the neighbors are listening.",
        mercury: "Hold the letter until you can read it cold.",
        venus: "Keep courtship out of forum business.",
        mars: "Stay in camp and keep your sword sheathed.",
      },
      trine: {
        sun: "Walk into the forum as if you own it.",
        moon: "Stay home tonight and let the household fuss over you.",
        mercury: "Make your case to the praetor while it reads well.",
        venus: "Say yes to the dinner invitation.",
        mars: "Take the field, because the auspices are on your side.",
      },
      opposition: {
        sun: "A rival in the Senate wants your seat.",
        moon: "Your household and your duties pull against each other tonight.",
        mercury: "Your message and theirs cannot both carry the vote.",
        venus: "One of the two families will be disappointed in you.",
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
    exactTails: [", exact to the augur's line", ", and the augur marks it in his book"],
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
        sun: "{god} and {partner} wait on the sacred chickens, and the keeper announces that they have eaten.",
        moon: "{god} hangs beside {partner} in the evening sky, and the household gods are fed early.",
        mercury: "{god} closes a bargain with {partner} on one market day, and the aediles record it.",
        venus: "{god} joins her house to {partner}'s at the altar, and the pontifex ties the knot.",
        mars: "{god} gathers his legion with {partner}'s under one eagle, and the camp moves at dawn.",
      },
      sextile: {
        sun: "The haruspex finds the liver favorable to {god} and {partner}, and the sign holds until dusk.",
        moon: "{god} lights {partner}'s road out of the city, and the travelers leave early.",
        mercury: "{god} speeds {partner}'s courier along the Via Appia, and the reply comes back in a day.",
        venus: "{god} sends a garland to {partner}'s door, and the family invites you in.",
        mars: "{god} sends a cohort to relieve {partner}'s line, and the soldiers eat a hot meal.",
      },
      square: {
        sun: "An adverse omen stands between {god} and {partner}, and the consul adjourns the Senate.",
        moon: "{god} turns red in eclipse before {partner}, and the household bangs bronze pots to drive off the shadow.",
        mercury: "{god} loses {partner}'s dispatch at the river crossing, and the legate waits for orders.",
        venus: "{god} quarrels with {partner} over the match, and the wedding is postponed.",
        mars: "{god} finds the sacred shields moved by {partner}, and the Salii refuse to dance.",
      },
      trine: {
        sun: "{god} and {partner} rise over a clear sky, and the augur sees birds on the right.",
        moon: "{god} shines on the atrium with {partner}, and the lares get an extra cake.",
        mercury: "{god} carries {partner}'s letters on time, and the forum hears your case first.",
        venus: "{god} smiles on the wedding procession beside {partner}, and the torches stay lit all the way home.",
        mars: "{god} and {partner} give the signal from the right, and the legion advances in good order.",
      },
      opposition: {
        sun: "The tribunes are divided between {god} and {partner}, and the assembly goes home without a vote.",
        moon: "{god} stands full against {partner}, and the night watch doubles at the gates.",
        mercury: "{god} argues one side before the praetor and {partner} the other, and the case is adjourned.",
        venus: "{god} stands with one family and {partner} with the other, and the betrothal stalls.",
        mars: "{god} faces {partner}'s camp across the river, and neither side crosses.",
      },
    },
    instructions: {
      conjunction: {
        sun: "Stand behind one decision in public, and burn incense to {god} and {partner}.",
        moon: "Bring the household together for one meal, and set out a cake for {god} and {partner}.",
        mercury: "Write the dispatch in your own hand, and pour a drop for {god} and {partner}.",
        venus: "Send a go-between to the family, and tie a ribbon at the shrine of {god} and {partner}.",
        mars: "Name one objective to your officers, and vow a shield to {god} and {partner}.",
      },
      sextile: {
        sun: "Visit your patron in the morning, and pour a libation to {god} and {partner}.",
        moon: "Set an extra place at dinner, and leave it for {god} and {partner}.",
        mercury: "Find out which clerk handles your matter, and thank {god} and {partner} at the crossroads.",
        venus: "Send a gift ahead of your visit, and bring a rose for {god} and {partner}.",
        mars: "Spend an hour at drill, and hang your shield where {god} and {partner} can see it.",
      },
      square: {
        sun: "Say less than you know in public, and atone to {god} and {partner} with a small offering.",
        moon: "Settle household quarrels inside the walls, and give a cake to {god} and {partner} at the household shrine.",
        mercury: "Show the letter to a friend before you send it, and leave a lamp burning for {god} and {partner}.",
        venus: "Let the courtship rest a week, and leave a dish of honey for {god} and {partner}.",
        mars: "Post sentries and hold your ground, and atone to {god} and {partner} with a lamb.",
      },
      trine: {
        sun: "Take the front bench at the next meeting, and hang a garland for {god} and {partner} on the way.",
        moon: "Eat with your family, and give the first cup to {god} and {partner}.",
        mercury: "Get your argument into writing, and leave a coin at the shrine of {god} and {partner}.",
        venus: "Go where you are invited, and wear a sprig of myrtle for {god} and {partner}.",
        mars: "Move first, and promise {god} and {partner} a share of the spoils.",
      },
      opposition: {
        sun: "Let your rival speak first in the forum, and say the prayer to {god} and {partner} once.",
        moon: "Tell your household tonight whether duty or home comes first, and burn a lamp for {god} and {partner}.",
        mercury: "Ask for both reports in writing, and let {god} and {partner} weigh them.",
        venus: "Choose one family's favor over the other's, and offer a garland to {god} and {partner}.",
        mars: "Hold your position without attacking, and pray to {god} and {partner} for patience.",
      },
    },
    secondFigure: ["Elsewhere in the sky,", "Across the forum,"],
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
