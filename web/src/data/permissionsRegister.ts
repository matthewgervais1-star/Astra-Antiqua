import type { Culture, Planet } from "@/data/cultures";

/**
 * The Do and Don't items, per culture and body: three to bring forward and
 * three to hold back for each of the ten bodies, in the culture's own world.
 * Every item is a noun phrase of two to four words, so a column reads as a
 * list of things ("Fresh bread", "Short letters"), never a mix of things and
 * orders. lib/permissions.ts picks from the bodies of the day's figures, so
 * the lists change with the sky and say why: the bodies that chose them are
 * the bodies in the evidence line.
 */
export interface BodyPermissions {
  proceed: readonly [string, string, string];
  refrain: readonly [string, string, string];
}

export const PERMISSIONS_REGISTER: Readonly<Record<Culture, Readonly<Record<Planet, BodyPermissions>>>> = {
  egypt: {
    sun: { proceed: ["Early starts", "Mud-brick repairs", "Honest labor"], refrain: ["Late starts", "Idle boasting", "Unfinished walls"] },
    moon: { proceed: ["Fresh bread", "Long sleep", "Family suppers"], refrain: ["Night quarrels", "Cold hearths", "Skipped meals"] },
    mercury: { proceed: ["Short letters", "Clean papyrus", "Plain speech"], refrain: ["Market gossip", "Smudged ink", "Long excuses"] },
    venus: { proceed: ["Shared beer", "Fresh linen", "Small gifts"], refrain: ["Jealous looks", "Haggling with lovers", "Cheap perfume"] },
    mars: { proceed: ["Hard labor", "Canal digging", "Fair contests"], refrain: ["Hot words", "Raised fists", "Old grudges"] },
    jupiter: { proceed: ["Open tables", "Temple offerings", "Full measures"], refrain: ["Stingy portions", "Short weights", "Empty promises"] },
    saturn: { proceed: ["Paid debts", "Straight furrows", "Field markers kept"], refrain: ["Easy shortcuts", "Moved boundary stones", "Overdue taxes"] },
    uranus: { proceed: ["New routes", "Changed plans", "Fresh starts"], refrain: ["Old ruts", "Stubborn habits", "Locked gates"] },
    neptune: { proceed: ["River walks", "Quiet prayer", "Remembered dreams"], refrain: ["Too much beer", "Muddy water", "Idle daydreams"] },
    pluto: { proceed: ["Cleared cellars", "Old stores", "Kept secrets"], refrain: ["Buried grudges", "Hoarded grain", "Tomb talk"] },
  },
  greece: {
    sun: { proceed: ["Public speaking", "Morning exercise", "Bright courtyards"], refrain: ["Vain display", "Showing off", "Idle mornings"] },
    moon: { proceed: ["Home cooking", "Night walks", "Lamplit talk"], refrain: ["Sleepless nights", "Family feuds", "Empty larders"] },
    mercury: { proceed: ["Clear questions", "Quick errands", "Fair trades"], refrain: ["Agora rumors", "Double meanings", "Crossed messages"] },
    venus: { proceed: ["Good wine", "Fresh flowers", "Light flirting"], refrain: ["Envious glances", "Golden apples", "Lavish gifts"] },
    mars: { proceed: ["The gymnasium", "Wrestling practice", "Honest rivalry"], refrain: ["Street brawls", "Drawn spears", "Long sulks"] },
    jupiter: { proceed: ["Open hospitality", "Shared feasts", "Big questions"], refrain: ["Proud boasts", "Broken oaths", "Greedy hands"] },
    saturn: { proceed: ["Harvest work", "Old debts paid", "Patient waiting"], refrain: ["Hasty plans", "Unripe fruit", "New debt"] },
    uranus: { proceed: ["New ideas", "Foreign guests", "Clever inventions"], refrain: ["Tired routine", "Fixed opinions", "Old quarrels"] },
    neptune: { proceed: ["Sea air", "Dreams written down", "Libations poured"], refrain: ["Heavy drinking", "Sea fog", "Wishful thinking"] },
    pluto: { proceed: ["Buried silver", "Ancestor rites", "Deep cellars"], refrain: ["Old secrets", "Hoarded coin", "Underworld bargains"] },
  },
  canaan: {
    sun: { proceed: ["Field work", "Daylight bargains", "Honest weights"], refrain: ["Lazy mornings", "Sunburned tempers", "Unfinished rows"] },
    moon: { proceed: ["Kin dinners", "Bride gifts", "New-moon feasts"], refrain: ["Kin quarrels", "Broken betrothals", "Cold suppers"] },
    mercury: { proceed: ["Careful handiwork", "New tools", "Tight joints"], refrain: ["Shoddy work", "Blunt blades", "Rushed jobs"] },
    venus: { proceed: ["Spoken vows", "Vineyard walks", "Love songs"], refrain: ["Broken vows", "Jealous talk", "Bride-price haggling"] },
    mars: { proceed: ["Threshing work", "The hunt", "Honest sweat"], refrain: ["Blood feuds", "Spreading fevers", "Drawn bows"] },
    jupiter: { proceed: ["Rain prayers", "Full granaries", "Feast days"], refrain: ["Hoarded oil", "Wasted water", "Thunderous tempers"] },
    saturn: { proceed: ["Elders' counsel", "Kept customs", "Slow decisions"], refrain: ["Open defiance", "Broken customs", "Snap judgments"] },
    uranus: { proceed: ["New pastures", "Fresh wells", "Bold moves"], refrain: ["Old habits", "Stuck carts", "Worn paths"] },
    neptune: { proceed: ["Plain prayers", "Sea fishing", "Quiet nights"], refrain: ["Night fears", "Rough seas", "Strong wine"] },
    pluto: { proceed: ["Mourning rites", "Sealed grain pits", "Ancestor graves"], refrain: ["Grief kept in", "Old curses", "Bargains with death"] },
  },
  carthage: {
    sun: { proceed: ["Good credit", "Public contracts", "Honest scales"], refrain: ["Bad debts", "Loud boasting", "Unsigned deals"] },
    moon: { proceed: ["Household budgets", "Family meals", "Lamp oil"], refrain: ["Household overspending", "House quarrels", "Empty jars"] },
    mercury: { proceed: ["Written contracts", "Fast ships", "Clear manifests"], refrain: ["Handshake deals", "Fine print", "Smuggled goods"] },
    venus: { proceed: ["Purple cloth", "Fine dinners", "Generous gifts"], refrain: ["Small bribes", "Impulse buys", "Paid flattery"] },
    mars: { proceed: ["Bold ventures", "Hard bargains", "Long voyages"], refrain: ["Price wars", "Reckless bets", "Grudge deals"] },
    jupiter: { proceed: ["Shared profits", "Temple tithes", "Big cargoes"], refrain: ["Greedy margins", "Dodged tariffs", "Overloaded holds"] },
    saturn: { proceed: ["Paid dues", "Balanced books", "Long-term savings"], refrain: ["Missed payments", "Cooked books", "Fresh loans"] },
    uranus: { proceed: ["Untried routes", "Foreign markets", "Fresh partners"], refrain: ["Stale contracts", "Worn sea lanes", "Rigid terms"] },
    neptune: { proceed: ["Calm seas", "Insured cargo", "Night sailing"], refrain: ["Storm sailing", "Vague figures", "Wine at the table"] },
    pluto: { proceed: ["Inheritance claims", "Old ledgers", "Deep storage"], refrain: ["Hidden debts", "Will disputes", "Buried losses"] },
  },
  rome: {
    sun: { proceed: ["Public office", "Morning calls", "Clean togas"], refrain: ["Boasting at dinner", "Late arrivals", "Bad company"] },
    moon: { proceed: ["Atrium suppers", "Household gods", "Early nights"], refrain: ["Domestic rows", "Neglected lares", "Late revels"] },
    mercury: { proceed: ["Brief letters", "Fair deals", "Good couriers"], refrain: ["Forged seals", "Long speeches", "Forum hearsay"] },
    venus: { proceed: ["Rose garlands", "Dinner parties", "Proper courtship"], refrain: ["Public scandal", "Rival suitors", "Lavish banquets"] },
    mars: { proceed: ["Daily drill", "Field campaigns", "Camp discipline"], refrain: ["Mutinous talk", "Reckless charges", "Street fights"] },
    jupiter: { proceed: ["A patron's favor", "Good omens", "Public games"], refrain: ["Bribed votes", "Bad omens", "Overreaching claims"] },
    saturn: { proceed: ["Steady savings", "Tax receipts", "Old laws"], refrain: ["Unpaid debts", "New taxes", "Extravagant dinners"] },
    uranus: { proceed: ["Needed reforms", "New roads", "Fresh faces"], refrain: ["Old factions", "Rigid orders", "Stale customs"] },
    neptune: { proceed: ["Afternoons at the baths", "Sea voyages", "Rest days"], refrain: ["Too much wine", "Wild rumors", "Idle festivals"] },
    pluto: { proceed: ["Family tombs", "Settled estates", "Old alliances"], refrain: ["Contested wills", "Old feuds", "Secret deals"] },
  },
};
