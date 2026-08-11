package com.astra.antiqua.domain

/**
 * The twelve houses, universal across pantheons (like the signs, the house
 * framework predates the cultural star-lore). Ported verbatim from web's
 * HOUSE_MEANINGS (web/src/data/houses.ts), the source of truth per
 * docs/shared-content-model.md; do not edit copy here without changing the
 * web side first.
 */
data class HouseMeaning(
    val house: Int,
    val ordinal: String,
    val title: String,
    val domain: String,
    val arena: String
)

object HouseMeanings {
    private val meanings: List<HouseMeaning> = listOf(
        HouseMeaning(
            house = 1,
            ordinal = "First",
            title = "The Mask",
            domain = "The body, the temperament, and the face you turn to the world; the door through which all the rest is met.",
            arena = "your own body and the face you turn to the world"
        ),
        HouseMeaning(
            house = 2,
            ordinal = "Second",
            title = "The Storehouse",
            domain = "What you hold: money, possessions, and the worth you can call your own.",
            arena = "what you earn, hold, and count as yours"
        ),
        HouseMeaning(
            house = 3,
            ordinal = "Third",
            title = "The Near Road",
            domain = "Speech and writing, siblings and neighbors, the short journeys and daily exchanges.",
            arena = "your words, your kin, and the road close to home"
        ),
        HouseMeaning(
            house = 4,
            ordinal = "Fourth",
            title = "The Foundation",
            domain = "Home, ancestry, and the buried root; the ground you were raised on and return to.",
            arena = "your home, your lineage, and the ground beneath you"
        ),
        HouseMeaning(
            house = 5,
            ordinal = "Fifth",
            title = "The Garden",
            domain = "Pleasure and creation, play and romance, children and everything you make for joy.",
            arena = "what you make for joy, the play and the loves you father"
        ),
        HouseMeaning(
            house = 6,
            ordinal = "Sixth",
            title = "The Workshop",
            domain = "Labor and service, illness and health, the daily upkeep of the body and its tasks.",
            arena = "your daily labor and the upkeep of the body"
        ),
        HouseMeaning(
            house = 7,
            ordinal = "Seventh",
            title = "The Other Shore",
            domain = "Partnership and marriage, contracts and alliances, and the open adversary across from you.",
            arena = "the partner, the contract, and the open adversary"
        ),
        HouseMeaning(
            house = 8,
            ordinal = "Eighth",
            title = "The Crossing",
            domain = "Death and inheritance, shared resources, and everything hidden, owed, or transformed.",
            arena = "what is shared, inherited, hidden, and transformed"
        ),
        HouseMeaning(
            house = 9,
            ordinal = "Ninth",
            title = "The Far Road",
            domain = "The long journey and the foreign, philosophy and law, and the things of the divine.",
            arena = "the far journey, the law, and the things of the divine"
        ),
        HouseMeaning(
            house = 10,
            ordinal = "Tenth",
            title = "The Summit",
            domain = "Career and public role, reputation and standing, the work the world can see.",
            arena = "your calling, your standing, and the work the world sees"
        ),
        HouseMeaning(
            house = 11,
            ordinal = "Eleventh",
            title = "The Assembly",
            domain = "Friends and allies, the wider community, and the hopes you set for the future.",
            arena = "your allies, your assembly, and the things you hope for"
        ),
        HouseMeaning(
            house = 12,
            ordinal = "Twelfth",
            title = "The Unseen",
            domain = "Solitude and the subconscious, confinement and loss, the undoing that works in the dark.",
            arena = "the unseen, the retreat, and what works against you out of sight"
        )
    )

    fun get(house: Int): HouseMeaning = meanings.getOrElse(house - 1) { meanings[0] }
}
