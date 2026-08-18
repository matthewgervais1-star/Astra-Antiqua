import type { Planet } from "@/data/cultures";
import type { ZodiacSign } from "@/data/sampleChart";

/**
 * Short interpretive paragraph for each of the 10 x 12 = 120 planet-in-sign
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
      "A self assembled out loud. The version of you that speaks is the one you keep, and the one that stays quiet never gets built. The risk is a self that exists only in company.",
    Cancer:
      "Selfhood shaped like a roof. Your power arrives as care and is spent the same way. Some doors have to stay shut for you to keep your shape, and you are slow to shut them.",
    Leo:
      "Identity that asks to be witnessed. You are warmer when seen; the risk is needing to be seen so consistently that you cannot bear being quiet.",
    Virgo:
      "The self here is a thing under repair. You improve the object and become more yourself in the improving. Correction is your form of attention, and it lands on other people as a verdict.",
    Libra:
      "You are legible to yourself only across a table. The other person's outline is where you find your own. The cost is a decision that goes to whoever spoke first.",
    Scorpio:
      "Identity that lives in what is hidden. Low stakes put you to sleep. The cost is weighting a plain week until it feels like something, purely to stay awake.",
    Sagittarius:
      "Identity reaching for the horizon. Move in a direction and you are somebody. Stop, and the question comes back. The risk is a life spent entirely in the approach.",
    Capricorn:
      "Identity built by climbing. You feel real when you have built something; the cost is mistaking the building for the life.",
    Aquarius:
      "Identity defined by what you refuse to belong to. You wake when the group misnames you; the risk is loneliness disguised as principle.",
    Pisces:
      "Identity that dissolves in service or in feeling. You lose your edges and find yourself in the losing. Then you look up and cannot say whose day you have been living.",
  },
  moon: {
    Aries:
      "Feeling arrives as impact before language. Your gut moves before your reasoning; trust the speed, and apologize for it later.",
    Taurus:
      "The body holds its mood. You change slowly and root deep; the cost is staying past when staying served.",
    Gemini:
      "Feeling moves through words. Nothing has happened to you until you have said it out loud to somebody. The cost is calling the telling a resolution.",
    Cancer:
      "The body remembers everything. You feel the shape of the room you walked into ten years ago; treat that memory as data, not a verdict.",
    Leo:
      "Feeling is theatrical. You live the day in scenes, with entrances and a curtain. A day nobody watched barely registers as having happened.",
    Virgo:
      "The to-do list is where your moods surface. You settle the body by settling its surroundings. The shadow is a task used to stay a half step outside the moment.",
    Libra:
      "You take your weather from the person across from you. Their tone settles the day or unsettles it. The cost is a mood you do not own and cannot set down.",
    Scorpio:
      "Feeling lives at depth. You skip the small surfaces; the cost is suspecting motives that have none.",
    Sagittarius:
      "Feeling moves toward expansion. The body wants the wider room; the cost is restlessness with the room you have.",
    Capricorn:
      "Feeling is contained inside competence. You handle the day by doing the day; the cost is grief that you have not let yourself feel.",
    Aquarius:
      "Your moods arrive already annotated. You watch them from a distance and file them before they land. The cost is a body that answers a day late.",
    Pisces:
      "Feeling is permeable. You take on the mood of the room; the cost is forgetting which feelings began in you.",
  },
  mercury: {
    Aries:
      "The mind cuts. You find out what you think by hearing yourself say it. The cost is the sentence you would have revised.",
    Taurus:
      "The mind moves the way a stone settles into a riverbed. You decide once, and the decision sets. What it costs you is the revision that arrived on time and got no hearing.",
    Gemini:
      "The mind multiplies. You think in conversation, in branches, in echoes; the cost is never coming to one thing.",
    Cancer:
      "The mind remembers in feeling. You think backward from how things landed; the cost is letting old hurt write your sentences.",
    Leo:
      "Speech is performance. You think toward the room, and the room's face edits the sentence. The cost is winning the delivery and losing the argument.",
    Virgo:
      "The mind discriminates. You sort, and then you sort the sorting. Precision arrives long before understanding, and you stop at precision.",
    Libra:
      "Thought looks for the other side. You hold both arguments; the cost is being unable to say which one is yours.",
    Scorpio:
      "The mind investigates. You think by following what people are hiding, including from themselves; the cost is the question that could have rested.",
    Sagittarius:
      "Thought reaches for the principle. You think in arcs and frames; the cost is the detail you needed to honor.",
    Capricorn:
      "Thought wants a load-bearing shape. An idea that cannot carry weight does not hold you. The cost is everything real that has not found its form yet.",
    Aquarius:
      "Thought systematizes. You think by the diagram of the whole; the cost is the person who does not fit the pattern.",
    Pisces:
      "Thought drifts toward image. You think in mood and metaphor; the cost is the specific fact you bypassed.",
  },
  venus: {
    Aries:
      "Wanting and moving are the same act here. You go for it before the wanting has cooled into a plan. The cost is a chase that ends the moment it is won.",
    Taurus:
      "Desire is the body's slow yes. You love what stays, and you price things by how they sit in the hand. The cost is comfort that has quietly replaced the connection.",
    Gemini:
      "Desire follows the conversation. You are drawn by minds that move; the cost is leaving when the talking stops.",
    Cancer:
      "Desire takes the shape of care. You love by feeding; the cost is needing to be needed in return.",
    Leo:
      "Desire is generous and theatrical. You love by making the other beautiful; the cost is the audience you require.",
    Virgo:
      "You love by improving what is in front of you. The right thing, arranged well, is your idea of tenderness. It reaches the other person as a correction.",
    Libra:
      "Desire seeks the pair. You complete yourself in another; the cost is choosing the relationship over your own appetite.",
    Scorpio:
      "Desire is total. You love at depth or you do not love at all; the cost is the way intensity reads as weight.",
    Sagittarius:
      "What teaches you is what you want. A person with nothing left to show you stops registering as beautiful, and you will call the leaving honesty.",
    Capricorn:
      "Desire wants the kept thing. You court in decades and prove yourself by showing up. The cost is a love so well endured that no one has checked whether it is still warm.",
    Aquarius:
      "Desire wants the chosen connection. You love by election; the cost is keeping the other at the distance that makes choice possible.",
    Pisces:
      "Desire dissolves into the other. You love by losing the line; the cost is the self you forgot to bring.",
  },
  mars: {
    Aries:
      "Effort moves before instruction. You push to find the resistance; the cost is the door you broke that wanted opening.",
    Taurus:
      "Effort is slow and immovable. Once you are moving, nothing redirects you, and nothing starts you either. The cost is the project that needed speed you were never going to give it.",
    Gemini:
      "Your force splits. Three fronts open at once and each one gets a third of you. The cost is the one you could have finished.",
    Cancer:
      "Effort moves sideways. You push by protecting; the cost is force used to defend what no longer needs it.",
    Leo:
      "Your fight wants a witness. You are strongest with someone watching. The cost is the work done alone that never gets counted.",
    Virgo:
      "Effort is precise. You push by refining; the cost is the larger move you delayed in service of the small one.",
    Libra:
      "Your force runs through the other person. You fight by negotiating, and you locate your own position by watching what you refuse. The cost is a fight you can only have with someone else in the room.",
    Scorpio:
      "Effort is contained until it releases. You push at depth and at the right moment; the cost is the build-up that becomes its own injury.",
    Sagittarius:
      "Effort aims long. You throw further than the ground you have covered. The cost is the distance crossed too fast to hold.",
    Capricorn:
      "Effort is sustained. You push by enduring; the cost is the body that ran out before the project did.",
    Aquarius:
      "Your fight belongs to a rule rather than a grudge. You go to war over how things ought to work. The cost is a campaign that never once asked who was standing in it.",
    Pisces:
      "Force goes around here. You move things by mood, by suggestion, by being unavailable at the right hour. The cost is the confrontation you owed in daylight.",
  },
  jupiter: {
    Aries:
      "Increase arrives with every first move. You are given more each time you begin. The bill is the pile of things left half done.",
    Taurus:
      "What increases here is what you can hold. The storehouse fills, and a full storehouse starts to look like proof. Weight is not worth. Here they arrive looking the same.",
    Gemini:
      "More arrives as more subjects. You collect languages, contacts, half-read books, and the collection is real wealth. The price is the floor you never went below.",
    Cancer:
      "Increase comes through care. You take people in and the household widens. The cost is the family you outgrew and kept anyway.",
    Leo:
      "Generosity is the engine here. You give warmth away and more of it comes back. The cost is a warmth that has quietly become a habit of being liked.",
    Virgo:
      "Increase is refinement. Every pass over the work makes it better and makes it smaller. The cost is a decade of polish on the thing that needed doubling.",
    Libra:
      "Two people make more here than one. The other person's world opens into yours and doubles what you can reach. The cost is the self you set aside to keep the pairing easy.",
    Scorpio:
      "Increase here runs through loss. What you let die comes back multiplied, which makes killing things feel like a method. The cost is the loss you called a choice.",
    Sagittarius:
      "Nothing here needs an occasion to get bigger. Going further out is the whole method, and it works. The cost is the near thing you flew over to get somewhere farther.",
    Capricorn:
      "Increase is laid brick after brick and it arrives late. The cost is years spent looking cautious to people who were only faster.",
    Aquarius:
      "You are enlarged by the idea you belong to, and the bigger the idea the bigger the return. The cost is a life lived at the scale of the argument instead of the room.",
    Pisces:
      "The increase here has no edges. Faith and mercy and the dream all swell without a container. The cost is the practical thing traded away to keep the dream intact.",
  },
  saturn: {
    Aries:
      "The first move meets a wall, every time, until the moves get fewer and better aimed. What is being taught here is the pause before the strike. The gift is the one that finally lands.",
    Taurus:
      "Limit is the slowness itself. The body sets the pace and the pace is not negotiable. What survives this is the only thing you will still own in twenty years.",
    Gemini:
      "Every open conversation is a debt. You are taught focus by running out of it in public. The gift is the one sentence that finally closes.",
    Cancer:
      "There is a family here you cannot repair, and no competence you acquire will change that. You are taught where you end by being handed what belongs to someone else. The gift is the weight you finally set down.",
    Leo:
      "The applause does not come. It goes on not coming until you work without it. The gift is a room that stays yours when nobody is watching it.",
    Virgo:
      "Limit shows up as the system that does not stay perfect. You learn the difference between maintenance and mastery; the gift is the work that holds anyway.",
    Libra:
      "Limit shows up in the relationship that asks you to choose yourself first. You learn that fairness is not always symmetry; the gift is the no that makes the yes real.",
    Scorpio:
      "What you held back has to come up, on a schedule you did not set. Keeping it costs more than saying it ever would have. The gift is the silence you stop paying for.",
    Sagittarius:
      "The far country keeps its distance. You are taught arrival by being denied it, again, on schedule. The gift is the small place in front of you finally getting a hearing.",
    Capricorn:
      "Limit is your native register. You build by enduring the build; the gift is the structure that outlasts you.",
    Aquarius:
      "Limit arrives as the system that betrays its own rule. You learn that the rule needs its exception, and you learn it from the person the rule crushed. The gift is a principle that survives contact.",
    Pisces:
      "Limit shows up as the line you finally have to draw. You learn that compassion needs containment; the gift is the help that actually helps.",
  },
  uranus: {
    Aries:
      "Rupture is instant. You break from the inherited form before anyone finishes the sentence; the cost is the bridge burned while it still held weight, the gift is the exit nobody else saw.",
    Taurus:
      "Rupture works slowly, then all at once. You hold your form long past comfort, then overturn it whole; the cost is the quake nobody saw building, the gift is ground worth standing on.",
    Gemini:
      "Rupture arrives mid-sentence. You change the subject and the subject changes the room; the cost is the thread cut before it finished, the gift is the question nobody thought to ask.",
    Cancer:
      "Rupture strikes the shelter. You walk out of the inherited home to build one that fits, and the grief goes out the door with you. The walls of the second one are yours.",
    Leo:
      "Rupture is performed in the open. You walk off the script mid-scene, in front of the people who bought tickets for the old show. What you leave with is a self nobody assigned you.",
    Virgo:
      "Rupture enters through the flaw. You find the broken part of the routine and tear out the whole routine to reach it. What you dismantled was still working. What you built instead nobody thought was possible.",
    Libra:
      "Rupture strikes the contract. You break the peace that required your silence; the cost is the partnership that only ran on that silence, the gift is one that survives honesty.",
    Scorpio:
      "Rupture works underground. You bury the pressure until it chooses its moment; the cost is the reversal that takes more than it aimed at, the gift is living with nothing left to guard.",
    Sagittarius:
      "Rupture tears the horizon open. You break from the doctrine you were raised inside; the cost is a map you can no longer use, the gift is seeing with your own eyes.",
    Capricorn:
      "Rupture strikes the structure. You break the ladder you spent years climbing and hand back the rank that came with it. What stands in its place is a building whose rules you wrote.",
    Aquarius:
      "Rupture is the house you already live in. You break inherited forms on principle, and the principle does not ask what the form was holding up. The cost is revolt that outlives its reason, the gift is the future arriving early through you.",
    Pisces:
      "Rupture dissolves the cage instead of breaking it. You slip inherited forms without a fight; the cost is that no one sees you leave, the gift is an exit without wreckage.",
  },
  neptune: {
    Aries:
      "Dissolution takes the fighter. You charge at causes larger than yourself; the cost is battles fought for a dream that never named you, the gift is courage without a self to protect.",
    Taurus:
      "Dissolution seeps into the solid. You make an idol of what the hand closes on, and the held thing blurs anyway. Ground and savings slip like water here. Plain matter turns out to be where the sacred was kept.",
    Gemini:
      "Dissolution enters through language. You speak in tides, and words blur into music; the cost is the fact that drowned in the telling, the gift is saying what plain speech cannot carry.",
    Cancer:
      "Dissolution floods the home. The line between your feelings and the family's disappears; the cost is carrying tides that began in other people, the gift is shelter that turns no one away.",
    Leo:
      "Dissolution takes the stage. You perform an ideal self and begin to believe it; the cost is applause for someone not quite you, the gift is art that outgrows its maker.",
    Virgo:
      "Dissolution undoes the sorting. You give service until the giver goes missing; the cost is work that empties you, the gift is help so exact it passes for love.",
    Libra:
      "Dissolution enters the pairing. You see the partner as they could be, and you go on loving the picture long after the person has walked out of it. That same devotion is what the real one grows into.",
    Scorpio:
      "Dissolution reaches the sealed room. You merge where others keep a floor; the cost is depths that do not give back what sinks, the gift is intimacy that survives the whole truth.",
    Sagittarius:
      "Dissolution takes the doctrine. You believe wider than any single creed, wide enough that the belief stops issuing instructions. Meaning waits in every port and none of them hands you a rule.",
    Capricorn:
      "Dissolution reaches the foundations. The summit keeps receding into fog and you keep climbing toward it. Ambition forgets what it was for. What gets built instead belongs to something larger than the record.",
    Aquarius:
      "Dissolution takes the blueprint. You dream the collective before it exists; the cost is neighbors traded for humanity at large, the gift is a vision wide enough to hold strangers.",
    Pisces:
      "Dissolution is your native water. There were never firm boundaries here to lose. The cost is a longing with no address on it, the gift is compassion that takes the shape of whatever it holds.",
  },
  pluto: {
    Aries:
      "Power arrives as the urge to break through. You are rebuilt by the fights you could not walk away from; the cost is the war you started just to feel alive, the gift is the self that survives its own demolition.",
    Taurus:
      "Power lives in what you hold. What you grip hardest is what gets taken; the cost is learning worth through loss, the gift is the value nothing can repossess.",
    Gemini:
      "Power moves through the word that names the buried thing. You dig with questions until something opens; the cost is the thought you cannot put down, the gift is the sentence that frees what silence kept.",
    Cancer:
      "Power rises from the root. The house you came from gets torn open until its foundations are in plain view. The grief was never yours to choose. What you build after stands on ground you have actually seen.",
    Leo:
      "Power wants the throne. The performed self burns down in public and the one underneath is what people finally see. Pride is taken from you in front of everyone. What is left needs no crown.",
    Virgo:
      "Power works through the small correct thing. You purge by fixing, sorting, cutting away, and the flaw you found first is the one you never stop seeing. The practice remakes you one repaired piece at a time.",
    Libra:
      "Power hides inside the pairing. The other person carries what you buried, and the bond drags it up; the cost is the contract that must break to be seen, the gift is a bond made with both eyes open.",
    Scorpio:
      "Power is at home here and does not pretend otherwise. You go to the bottom of things because the bottom is where you live. The cost is depth demanded of everyone you touch, the gift is a life with no leverage left in it.",
    Sagittarius:
      "Power moves through conviction. The creed gets razed so the truth under it stands on its own footing. The cost is the faith you had to watch burn, the gift is a belief that came through its own trial.",
    Capricorn:
      "Power tests the structure. What you built gets stripped to bedrock; the cost is ambition losing its costume, the gift is the one wall left standing, which was the real one.",
    Aquarius:
      "Power runs through the group and hides in its systems. You see the machinery others call natural; the cost is standing outside what everyone still believes, the gift is the order rebuilt after the false one falls.",
    Pisces:
      "Power strips away what the self was clinging to. The deepest losses here have no edges and no name; the cost is surrender you did not consent to, the gift is what remains when everything removable is gone.",
  },
};
