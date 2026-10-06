import type { Culture, Planet } from "@/data/cultures";

/**
 * The Do and Don't items, per culture and body: three to bring forward and
 * three to hold back for each of the ten bodies. Every item is a noun phrase
 * of two to four words that a reader can act on today with no footnote, and
 * that reads as the object of its column verb when the verb is spoken before
 * it (cultureVoice.permissionPair):
 *
 *   Egypt     OFFER / WITHHOLD      things to give, or to keep from giving
 *   Greece    ASK / DO NOT ASK      things to ask, or to ask for
 *   Canaan    BRING / HOLD BACK     things to bring, or to leave at home
 *   Carthage  PAY / DEFER           things to pay, or to put off paying
 *   Rome      PROCEED / REFRAIN     things to do, or to leave undone
 *
 * lib/permissions.ts picks from the bodies of the day's figures, so the lists
 * change with the sky, and the bodies that chose them are the bodies the
 * decree names.
 */
export interface BodyPermissions {
  proceed: readonly [string, string, string];
  refrain: readonly [string, string, string];
}

export const PERMISSIONS_REGISTER: Readonly<Record<Culture, Readonly<Record<Planet, BodyPermissions>>>> = {
  egypt: {
    sun: { proceed: ["Your morning hours", "A day's honest labor", "Help with the harvest"], refrain: ["Empty boasts", "Promises you cannot keep", "Free labor to strangers"] },
    moon: { proceed: ["Bread to a neighbor", "A meal at home", "A bed for travelers"], refrain: ["Sharp words at supper", "Complaints at the table", "Bad news at bedtime"] },
    mercury: { proceed: ["A short letter", "A plain answer", "Directions to a stranger"], refrain: ["Gossip from the market", "A hasty seal", "A half-true report"] },
    venus: { proceed: ["A small gift", "Fresh linen for guests", "Beer to a friend"], refrain: ["Jealous remarks", "Gifts you cannot afford", "Easy flattery"] },
    mars: { proceed: ["Help with heavy lifting", "Strength to a neighbor", "A fair contest"], refrain: ["Hot words", "Your fists", "A blow in anger"] },
    jupiter: { proceed: ["A seat at table", "Temple offerings", "A full measure"], refrain: ["Short weight", "Loans to gamblers", "Favors with strings"] },
    saturn: { proceed: ["What you owe", "Payment on time", "Your share of work"], refrain: ["Excuses for late work", "Hurried work", "Another delay"] },
    uranus: { proceed: ["A new idea", "Help with a move", "A second chance"], refrain: ["Your old complaints", "Stubborn refusals", "The same old answer"] },
    neptune: { proceed: ["A prayer for someone", "Water to the thirsty", "Patience with a dreamer"], refrain: ["A third beer", "Promises made while tired", "Trust to a stranger"] },
    pluto: { proceed: ["Grain from old stores", "Respect to the dead", "Silence about a secret"], refrain: ["Old grievances", "Your family's secrets", "Talk of the dead"] },
  },
  greece: {
    sun: { proceed: ["For a public hearing", "For credit you earned", "For the floor"], refrain: ["For compliments", "Who is watching", "For the best seat"] },
    moon: { proceed: ["For a quiet evening", "How your family is", "For a home-cooked meal"], refrain: ["Why nobody came", "Old family questions", "For an apology tonight"] },
    mercury: { proceed: ["For directions", "For written terms", "For a clear answer"], refrain: ["For gossip", "The same question twice", "For a rumor's source"] },
    venus: { proceed: ["For a dance", "For a second meeting", "For a kiss"], refrain: ["Whether they still care", "For a costly gift", "About their old flames"] },
    mars: { proceed: ["For a training partner", "For a fair match", "For help lifting"], refrain: ["For a fight", "For revenge", "Who started it"] },
    jupiter: { proceed: ["For a favor", "For a feast invitation", "For an elder's advice"], refrain: ["For an extra share", "For special treatment", "For an oath"] },
    saturn: { proceed: ["For more time", "For the full bill", "For an honest deadline"], refrain: ["For a shortcut", "To skip the work", "For an early harvest"] },
    uranus: { proceed: ["A stranger's opinion", "For a new task", "How it could change"], refrain: ["For a guarantee", "For nothing to change", "For the usual answer"] },
    neptune: { proceed: ["What your dream meant", "For a quiet hour", "For a second opinion"], refrain: ["For another cup", "For a sign", "What the omens promise"] },
    pluto: { proceed: ["What you are owed", "About your inheritance", "For the old story"], refrain: ["About the dead's money", "For someone's secrets", "For buried silver"] },
  },
  canaan: {
    sun: { proceed: ["Your best work", "A neighbor's tools back", "Water for the harvesters"], refrain: ["Unfinished work", "Boasts to the gate", "Your temper to work"] },
    moon: { proceed: ["Bread to your kin", "A wedding gift", "Lamp oil home"], refrain: ["Old family quarrels", "Complaints to the table", "Bad news at supper"] },
    mercury: { proceed: ["Your own tools", "A finished piece", "A fair measure"], refrain: ["Shoddy work", "A blunt blade", "Rushed repairs"] },
    venus: { proceed: ["A spoken vow", "Flowers from the vineyard", "A love song"], refrain: ["Talk of old lovers", "Jealous talk", "Haggling over a dowry"] },
    mars: { proceed: ["Your full strength", "A strong back", "Help at the threshing"], refrain: ["Your blade at supper", "Your hot temper", "Talk of feuds"] },
    jupiter: { proceed: ["First fruits", "A full oil jar", "Prayers for rain"], refrain: ["Greed to the table", "The biggest portion", "Boasts of plenty"] },
    saturn: { proceed: ["Questions to the elders", "Respect for custom", "Patience to the council"], refrain: ["Open defiance", "Quick judgments", "Scorn for the elders"] },
    uranus: { proceed: ["Plans for new pasture", "News from the caravan", "A bold proposal"], refrain: ["Last year's plan", "Yesterday's excuses", "The same tired complaint"] },
    neptune: { proceed: ["A plain prayer", "Fish from the sea", "A calm voice"], refrain: ["Night fears", "Strong wine", "Wild rumors"] },
    pluto: { proceed: ["Your grief out loud", "Offerings for the dead", "Stored grain"], refrain: ["Old curses", "Talk of death", "A funeral grudge"] },
  },
  carthage: {
    sun: { proceed: ["Your harbor dues", "Wages on time", "The scribe's fee"], refrain: ["Fees for show", "Gifts to win favor", "Payment before delivery"] },
    moon: { proceed: ["The household bills", "The rent", "The market account"], refrain: ["New furniture", "A bigger house", "Household luxuries"] },
    mercury: { proceed: ["The contract deposit", "The courier", "The clerk's fee"], refrain: ["Payment on a handshake", "Unread contracts", "Advance payments"] },
    venus: { proceed: ["A gift for family", "Dinner for two", "A fair dowry"], refrain: ["Perfume on credit", "Impulse buys", "A flatterer's fee"] },
    mars: { proceed: ["The crew's shares", "Your venture stake", "Repairs to the hull"], refrain: ["Hired muscle", "Wagers on a race", "Damages before a ruling"] },
    jupiter: { proceed: ["Temple tithes", "Your partner's cut", "A fair profit share"], refrain: ["Inflated commissions", "A banquet for show", "Loans to friends"] },
    saturn: { proceed: ["Old debts first", "Your fixed dues", "The tax collector"], refrain: ["New loans", "Optional fees", "Interest you can avoid"] },
    uranus: { proceed: ["A new partner's stake", "The scout's fee", "A trial cargo"], refrain: ["Renewing a stale contract", "Old route fees", "Penalties you can contest"] },
    neptune: { proceed: ["Insurance on the cargo", "The pilot", "The harbor watch"], refrain: ["Storm-season sailings", "Vague invoices", "Wine for the table"] },
    pluto: { proceed: ["Inherited debts", "Funeral costs", "The family's old accounts"], refrain: ["Disputed claims", "Hidden charges", "Contested will payments"] },
  },
  rome: {
    sun: { proceed: ["Speaking in public", "Morning calls", "Taking credit honestly"], refrain: ["Boasting at dinner", "Arriving late", "Bad company"] },
    moon: { proceed: ["Supper at home", "Tending the household shrine", "Early nights"], refrain: ["Domestic rows", "Late revels", "Neglecting home"] },
    mercury: { proceed: ["Brief letters", "Fair bargains", "Reliable couriers"], refrain: ["Signing unread papers", "Long speeches", "Repeating hearsay"] },
    venus: { proceed: ["Garlands for the table", "Dinner parties", "Courting properly"], refrain: ["Public scandal", "Rivalry over a suitor", "Lavish banquets"] },
    mars: { proceed: ["Daily drill", "Physical training", "Sword practice"], refrain: ["Quarrels with officers", "Reckless charges", "Street fights"] },
    jupiter: { proceed: ["Asking a patron's favor", "Attending the games", "Generous hosting"], refrain: ["Buying votes", "Overreaching claims", "Showing off wealth"] },
    saturn: { proceed: ["Saving money", "Paying taxes on time", "Keeping old promises"], refrain: ["Running up debts", "New spending", "Extravagant dinners"] },
    uranus: { proceed: ["Needed reforms", "Trying new tools", "Meeting new people"], refrain: ["Factional feuds", "Rigid orders", "Refusing change"] },
    neptune: { proceed: ["Afternoons at the baths", "A sea voyage", "Rest days"], refrain: ["Too much wine", "Spreading rumors", "Idle festivals"] },
    pluto: { proceed: ["Visiting family tombs", "Settling estates", "Renewing old alliances"], refrain: ["Contesting wills", "Old family feuds", "Secret deals"] },
  },
};
