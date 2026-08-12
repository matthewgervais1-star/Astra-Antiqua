import type { Culture } from "@/data/cultures";

/**
 * The "what it leaves behind" bank for the /transits/[id] spine: one entry
 * per culture x slow body (the five bodies whose transits run long enough to
 * be read as spans rather than days). `changing` characterizes the transiting
 * deity taking up residence at the natal point; `leaves` names what the tense
 * or easeful version of the passage leaves behind; `votive` is the two-line
 * imperative closing, tension and ease variants, joined by a literal newline
 * between its two lines.
 */
export interface TransitSpineEntry {
  changing: string;
  leaves: { tension: string; ease: string };
  votive: { tension: string; ease: string };
}

export type SlowBody = "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

export const TRANSIT_SPINE: Readonly<Record<Culture, Readonly<Record<SlowBody, TransitSpineEntry>>>> = {
  egypt: {
    jupiter: {
      changing:
        "Amun has moored his barque against this point. He is the hidden one, king in Thebes, and his gift is increase. Where he sits the river rises, the granary fills, and the field asks for a wider boundary stone. But Amun gives as a king gives; the offering is expected back, exact and on time. What grows under this passage must be measured as it grows, or it will grow past the scale.",
      leaves: {
        tension: "The granary built taller than the harvest that filled it.",
        ease: "The habit of asking small while the river was already rising.",
      },
      votive: {
        tension: "TAKE NO MORE THAN THE SCALE CAN WEIGH;\nRETURN THE FIRST SHARE AS OFFERING",
        ease: "ENLARGE THE GRANARY BEFORE THE FLOOD;\nRECORD EVERY MEASURE THAT COMES IN",
      },
    },
    saturn: {
      changing:
        "Geb has lain down beneath this point. He is the earth under every granary and every tomb; he does not move, and he does not hurry. What you have built here is being tested at the footing. Whatever stands on sand will settle into him slowly, and no offering hurries the settling. Geb keeps what is buried and returns only what was planted.",
      leaves: {
        tension: "The wall that stood on sand and called itself stone.",
        ease: "The fear that the ground would not bear you if you built.",
      },
      votive: {
        tension: "DIG TO BEDROCK BEFORE YOU RAISE THE WALL;\nLET WHAT LEANS FALL NOW",
        ease: "PLANT ONLY WHAT YOU MEAN TO KEEP;\nSET THE CORNERSTONE THIS SEASON",
      },
    },
    uranus: {
      changing:
        "Nut has arched herself over this point. She is the sky that swallows the sun each evening and births it again at dawn; under her, no arrangement is final. What sets will rise, and it will rise changed. The order you took from your elders here is not Ma'at itself, only a copy made by hands. She overturns the copy so the original can be read.",
      leaves: {
        tension: "The order kept only because no one had yet asked why.",
        ease: "The ceiling you had mistaken for the sky.",
      },
      votive: {
        tension: "LET THE OLD SUN SET WITHOUT MOURNING;\nRISE WITH THE ONE SHE BIRTHS",
        ease: "TAKE DOWN THE PAINTED CEILING;\nREAD THE STARS ON HER BODY",
      },
    },
    neptune: {
      changing:
        "Nun has risen around this point. He is the water before the first mound, the flood that has no bank and no season. What was solid here is being softened; the edges you trusted no longer mark where you end. This is not the river, which gives and can be measured. This is the water under everything, which takes no shape and keeps no record.",
      leaves: {
        tension: "The map that showed a shore where there was none.",
        ease: "The dry certainty that nothing lay past the marked fields.",
      },
      votive: {
        tension: "SOUND THE DEPTH BEFORE EACH STEP;\nWRITE NOTHING ON WATER",
        ease: "LET THE FLOOD LAY DOWN NEW SILT;\nMARK THE FIELDS AGAIN WHEN IT FALLS",
      },
    },
    pluto: {
      changing:
        "Osiris has seated himself beneath this point. He was cut into pieces, gathered, and crowned in the west; he knows exactly what survives dismemberment. What this passage touches is taken apart and weighed piece by piece against the feather. The devourer waits for whatever fails. What passes is planted like grain, and it comes back green.",
      leaves: {
        tension: "The piece of you kept only because burying it looked like dying.",
        ease: "The husk the green shoot no longer needed.",
      },
      votive: {
        tension: "WEIGH THE HEART BEFORE THE COURT DOES;\nFEED THE DEVOURER YOURSELF",
        ease: "CUT THE GRAIN AND KEEP THE SEED;\nPLANT IN THE BLACK EARTH AT THE FLOOD'S EDGE",
      },
    },
  },
  greece: {
    jupiter: {
      changing:
        "Zeus has taken the high seat against this point. He is the giver of lots, and he is minded to enlarge yours. But every gift from the king's table is also a test of the guest. The oracle asks what you would do with more: more room, more voice, more claim. Answer carelessly and the gift still arrives, sized to the careless answer.",
      leaves: {
        tension: "The appetite that mistook its own echo for the god's yes.",
        ease: "The habit of asking the oracle only for what you already had.",
      },
      votive: {
        tension: "NAME THE SIZE BEFORE YOU ACCEPT THE GIFT;\nPOUR THE FIRST WINE OUT TO THE GOD",
        ease: "ASK THE LARGER QUESTION THIS TIME;\nSET ANOTHER PLACE AT YOUR TABLE",
      },
    },
    saturn: {
      changing:
        "Kronos has settled against this point, and he does not visit briefly. He carries the sickle, and the sickle has one question: what here is ripe, and what is only tall? The old king swallowed his own children rather than yield the throne; he knows what refusal costs. This passage cuts to the stalk whatever cannot answer for its season. What is truly ripe he leaves standing, and calls it harvest.",
      leaves: {
        tension: "The throne held the way the old king held his, by swallowing.",
        ease: "The unripe claim that asked to be spared the sickle one more year.",
      },
      votive: {
        tension: "YIELD WHAT YOU CANNOT ANSWER FOR;\nSHARPEN THE SICKLE, NOT THE EXCUSE",
        ease: "BIND THE SHEAVES YOU HAVE EARNED;\nKEEP THE HARVEST FEAST PLAINLY",
      },
    },
    uranus: {
      changing:
        "Ouranos has stretched himself against this point. He is the first sky, the father who was severed so the world could begin. The question under him is blunt: what have you been holding down because its birth would change you? The sickle that freed the world was forged by the one buried deepest. Expect the cut to come from inside the house.",
      leaves: {
        tension: "The peace that was only pressure applied evenly.",
        ease: "The shape kept because it was the one your father could recognize.",
      },
      votive: {
        tension: "RELEASE WHAT YOU HAVE BURIED ALIVE;\nSTAND CLEAR WHEN IT RISES",
        ease: "SEVER SKY FROM EARTH IN ONE STROKE;\nLET THE NEW THING NAME ITSELF",
      },
    },
    neptune: {
      changing:
        "Poseidon has set his weight against this point. He rules the element that keeps no road and forgets no slight. Under him, the firm things here learn they were floating all along. The god's question is what you will steer by when the coast goes out of sight. Pour the libation before the crossing, not after; the sea keeps no altar of last resort.",
      leaves: {
        tension: "The chart drawn in a calm you mistook for the sea itself.",
        ease: "The oar kept in hand long after the wind was offered.",
      },
      votive: {
        tension: "LASH DOWN WHAT MUST SURVIVE THE CROSSING;\nPOUR THE WINE INTO THE WAVE",
        ease: "RAISE THE SAIL AND SHIP THE OARS;\nTHANK THE GOD WHILE THE WIND HOLDS",
      },
    },
    pluto: {
      changing:
        "Plouton has taken a seat against this point. He is the unseen host; his wealth is everything the ground holds. Whatever you keep under the floor of your life is being brought up into the light, and the god has one question: what did you bury because it was treasure, and what did you bury because it was true? He does not steal; he asks, and the asking does not stop until the honest answer rises. What answers honestly is yours to keep.",
      leaves: {
        tension: "The version of you that needed to be believed rather than examined.",
        ease: "The question you kept asking after the god had already answered.",
      },
      votive: {
        tension: "PUT THE QUESTION TO WHAT YOU HAVE BURIED;\nKEEP NOTHING THAT CANNOT BEAR THE LIGHT",
        ease: "CARRY THE HIDDEN WEALTH INTO DAYLIGHT;\nSPEND WHAT WAS BURIED ON THE LIVING",
      },
    },
  },
  canaan: {
    jupiter: {
      changing:
        "Baal Hadad has ridden his cloud to this point and pitched camp. He is the rains; where he stands, the dry field remembers what it can bear. The council has entered his seat in the record, and the season it opens is a wet one: increase, herds, roof-beams, wine. But Baal's bounty is a covenant, not luck. What grows under him is witnessed, and the witness expects the vow kept.",
      leaves: {
        tension: "The field that drank the rains and paid no tithe.",
        ease: "The rationing kept from habit in a year of full cisterns.",
      },
      votive: {
        tension: "VOW ONLY WHAT THE DRY YEAR CAN PAY;\nBRING THE FIRSTFRUITS WHILE THE RAIN FALLS",
        ease: "CUT A WINDOW IN THE ROOF FOR THE RAIN;\nPLANT EVERY FIELD YOU HAVE",
      },
    },
    saturn: {
      changing:
        "El has turned his face toward this point, and the council falls quiet. He is the father of years; he sits at the source of the two rivers and rises for no one. Under his regard, everything you have vowed here is read back in full. He does not punish; he lets the record stand, and the record is patient. Sit down in the tent of the old god and hear it out.",
      leaves: {
        tension: "The vow renewed each year so it would never come due.",
        ease: "The doubt that the elders would seat you when your time came.",
      },
      votive: {
        tension: "READ YOUR OWN RECORD BEFORE THE COUNCIL DOES;\nSTRIKE THE VOWS YOU WILL NOT KEEP",
        ease: "TAKE THE SEAT THE YEARS HAVE EARNED YOU;\nSPEAK LAST, AND ONCE",
      },
    },
    uranus: {
      changing:
        "Shamem has opened above this point. He is the heavens themselves, sudden as weather off the sea. The council itself convenes beneath him; no tent, no wall, no vow stands outside his cover. What your fathers fixed here now sits under open sky, and the sky does not honor precedent. When the bolt comes, it will not ask the assembly first.",
      leaves: {
        tension: "The tent pitched so long it was mistaken for a mountain.",
        ease: "The precedent obeyed after everyone who set it was gone.",
      },
      votive: {
        tension: "GO OUT FROM UNDER THE OLD ROOF;\nWATCH THE SKY UNTIL IT MOVES",
        ease: "TAKE THE OPEN SKY AS WITNESS;\nPITCH THE NEW TENT WHERE THE BOLT STRUCK",
      },
    },
    neptune: {
      changing:
        "Yammu has risen against this point. He is Prince Sea, the dissolving flood that tests every shore. He once demanded kingship over the gods, and the council nearly gave it; the sea always asks for everything. What is firm here is being asked to prove it is more than piled sand. Do not answer the sea with vastness of your own; answer with a marked shoreline and a kept vow.",
      leaves: {
        tension: "The shore that was only the sea's patience, and called itself land.",
        ease: "The dread of the deep that kept every net dry.",
      },
      votive: {
        tension: "MARK THE SHORELINE WHILE THE TIDE IS OUT;\nSET A WITNESS STONE ABOVE THE FLOOD",
        ease: "WADE OUT AS FAR AS THE VOW HOLDS;\nBRING BACK WHAT THE SEA GIVES FREELY",
      },
    },
    pluto: {
      changing:
        "Motu has taken his seat beneath this point. He is Death the swallower; even Baal went down into his throat. His season is the dry one, when the fields crack and the council counts who is missing. Something here will go down; that is not a verdict, it is the calendar. Baal went down and returned, and the rains came back with him; hold the funeral, and hold the seat for the return.",
      leaves: {
        tension: "The story in which nothing you loved ever went down.",
        ease: "The mourning kept long after the rains had returned.",
      },
      votive: {
        tension: "GO DOWN WITH WHAT MUST GO DOWN;\nLEAVE THE LAMP LIT FOR THE RETURN",
        ease: "END THE MOURNING AT THE FIRST RAIN;\nSET THE TABLE FOR WHAT RETURNS",
      },
    },
  },
  carthage: {
    jupiter: {
      changing:
        "Baal Hammon has taken this point into his precinct, and he comes in bounty. When the lord of the precinct gives, the harbor fills: cargoes, contracts, favoring winds. But Carthage does not record a gift; it records a loan against a future offering. Every increase under this passage is entered in the ledger with your name beside it. Enjoy the sailing season, and keep the receipts.",
      leaves: {
        tension: "The profit booked before the ship had cleared the harbor.",
        ease: "The cargo refused because the hold had always been small.",
      },
      votive: {
        tension: "ENTER EVERY GIFT IN THE LEDGER AS DEBT;\nPAY THE PRECINCT BEFORE THE PROFIT",
        ease: "CHARTER THE SECOND SHIP WHILE THE SEA IS OPEN;\nSET ASIDE THE OFFERING FIRST",
      },
    },
    saturn: {
      changing:
        "Baal Hammon sits against this point as the elder, and the elder does not give; he audits. The vows of past years are taken down from the precinct wall and read against what was paid. Where the weights were shaved, the difference is due, with the years added. He is not cruel; he is exact. Carthage was built by people who paid him precisely, and it stood.",
      leaves: {
        tension: "The shaved weight that passed inspection for years.",
        ease: "The dread of an audit you had already passed.",
      },
      votive: {
        tension: "WEIGH WITH THE STANDARD, NOT THE HOUSE SET;\nPAY THE OLDEST VOW FIRST",
        ease: "CLOSE THE BOOKS OF THE OLD YEARS;\nCARVE THE STELE THAT SAYS PAID",
      },
    },
    uranus: {
      changing:
        "Baal Shamem has claimed the sky over this point. He is lord of the open heavens, and the open heavens answer to no chart. The route your house has sailed for a generation is under a new wind, and the wind was not negotiated. No contract was sealed against this; the ledger has no column for the sky. When the market reopens, the prices will be his.",
      leaves: {
        tension: "The trade route defended long after the wind had left it.",
        ease: "The old chart kept sacred because the founders drew it.",
      },
      votive: {
        tension: "STRIKE THE SAIL BEFORE THE SQUALL DOES;\nREAD THE NEW WIND WITHOUT COMPLAINT",
        ease: "OPEN A ROUTE NO HOUSE HAS SAILED;\nLOG THE NEW WIND WHILE OTHERS ARGUE",
      },
    },
    neptune: {
      changing:
        "Yam has moved beneath this point. Every fortune in Carthage floats on him, and every captain signs a contract the sea has not signed. What seemed a fixed asset here is revealed as cargo: afloat, movable, and at his mercy. The books will not balance while the swell is running. Value nothing precisely until it is back at the dock.",
      leaves: {
        tension: "The valuation written as if the sea had signed it.",
        ease: "The fortune kept in the warehouse for fear of the crossing.",
      },
      votive: {
        tension: "COUNT NOTHING AS YOURS UNTIL IT DOCKS;\nSEND NO SHIP YOU CANNOT LOSE",
        ease: "TRUST ONE CARGO TO THE OPEN SEA;\nMARK THE DEPTH, NOT THE DISTANCE",
      },
    },
    pluto: {
      changing:
        "Mot has opened a file against this point. He is the swallower; every house in the city carries him as a standing debt, and this passage calls part of it in. Something carried on your books as permanent will be entered again as borrowed. The seizure is lawful, and no appeal sits above it. What he does not take he returns with clear title, worth more than before because it is finally yours.",
      leaves: {
        tension: "The permanence bought from a seller who never owned it.",
        ease: "The guard kept on a vault that death had already passed.",
      },
      votive: {
        tension: "SETTLE WITH THE SWALLOWER IN YOUR OWN INK;\nCHOOSE THE OFFERING BEFORE IT IS CHOSEN",
        ease: "BURN THE PAID NOTES IN THE PRECINCT;\nSAIL HOME LIGHTER THAN YOU CAME",
      },
    },
  },
  rome: {
    jupiter: {
      changing:
        "Iuppiter Optimus Maximus has turned his attention to this point. Where the greatest god attends, the state enlarges: office, territory, standing. But Rome enlarges by law, not by appetite; every province acquired must be governed. The auspices here are favorable and binding at once. Take the larger office knowing the oath that comes with it, for he witnesses all oaths and outlives all terms.",
      leaves: {
        tension: "The province annexed before anyone asked who would govern it.",
        ease: "The candidacy declined every year on grounds of modesty.",
      },
      votive: {
        tension: "ACCEPT NO HONOR WITHOUT READING THE OATH;\nGOVERN WHAT YOU HAVE ANNEXED",
        ease: "STAND FOR THE OFFICE IN THE OPEN FORUM;\nSWEAR ONLY WHAT YOU WILL PERFORM",
      },
    },
    saturn: {
      changing:
        "Saturnus has taken up his station against this point. The treasury of Rome sits inside his temple; the oldest god keeps the reserves and the records both. Under him this passage is a censor's term: the rolls are reviewed, and rank must match substance. What cannot show its property is struck from the list; that is not disgrace, it is the census. Rome stands on the census.",
      leaves: {
        tension: "The rank retained on property long since spent.",
        ease: "The fear of the censor you had no cause to fear.",
      },
      votive: {
        tension: "DECLARE EVERYTHING BEFORE THE CENSOR ASKS;\nHOLD NO RANK YOU CANNOT FUND",
        ease: "FILE THE ACCOUNTS IN GOOD ORDER;\nTAKE THE RANK THE RECORD SUPPORTS",
      },
    },
    uranus: {
      changing:
        "Caelus stands open above this point. He is the sky before the law, father of the god the gods overthrew. What he sends, the augurs must enter as prodigy: lightning from a clear quarter, birds flying against precedent. A prodigy can be expiated; it cannot be repealed. The law of this part of your life is being amended from above, and the amendment does not require your vote.",
      leaves: {
        tension: "The precedent defended as law when it was habit with witnesses.",
        ease: "The permission awaited from magistrates long out of office.",
      },
      votive: {
        tension: "RECORD THE PRODIGY WITHOUT SOFTENING IT;\nEXPIATE, DO NOT EXPLAIN",
        ease: "TAKE THE LIGHTNING ON THE LEFT AS SANCTION;\nAMEND THE LAW YOU LIVE UNDER",
      },
    },
    neptune: {
      changing:
        "Neptunus has advanced against this point. Rome rules by the surveyed line, and he is the god no survey binds. The boundary stones here still stand, but the water is moving beneath them, and title does not argue with a flood. The pontiffs bridge rivers; they do not command them. Build as the city builds at his festival: shelters of green branches, roofed for a season, held loosely.",
      leaves: {
        tension: "The deed defended at law while the river moved the land.",
        ease: "The refusal to cross anything that could not be paved.",
      },
      votive: {
        tension: "MOVE THE ARCHIVE ABOVE THE FLOOD LINE;\nBRIDGE NOTHING IN SPATE",
        ease: "SIT IN THE SHELTER OF BRANCHES;\nLET THE RIVER RESURVEY THE FIELD",
      },
    },
    pluto: {
      changing:
        "Dis Pater has assumed jurisdiction beneath this point. He is the rich father; every mine, vault, and legacy in Rome files at last under his name. His altar stays buried and is opened once in a lifetime of years, and this passage is such an opening. The estate here has come under his review: claims tested, false heirs dismissed, the true title read aloud. What returns to you, you hold as lawful heir, not as owner by assumption.",
      leaves: {
        tension: "The title held by occupation and defended by noise.",
        ease: "The estate left sealed because reading the will felt like a death.",
      },
      votive: {
        tension: "PROVE EVERY CLAIM AS IF BEFORE THE PRAETOR;\nSURRENDER WHAT THE WILL DOES NOT NAME",
        ease: "OPEN THE BURIED ALTAR, ONCE, PROPERLY;\nTAKE UP THE INHERITANCE BY NAME",
      },
    },
  },
};
