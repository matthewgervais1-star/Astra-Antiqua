package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry

/**
 * Render-time composition of the decree card's content, mirroring how web
 * assembles a reading (`web/src/lib/reading.ts`'s `buildReading`): the
 * universal placement paragraph plus a cultural mask (deity name and epithet
 * from `DeityRegistry`, a per-culture decree framing from
 * `CulturalLexicon.decreeLine`) rather than 420 fully authored records.
 *
 * Pure and side-effect-free: [placementText] is passed in already resolved
 * (by `PlacementContentStore`, which does the actual asset IO) so this stays
 * trivially unit-testable without a `Context`.
 */
object NatalReadingComposer {
    fun compose(
        culture: AncientCulture,
        position: AccuratePlanetPosition,
        placementText: String,
    ): NatalPlacementReading {
        val deity = DeityRegistry.getDeity(culture, position.planet)
        val lexicon = LexiconDictionary.forCulture(culture)
        return NatalPlacementReading(
            deityName = deity.name,
            deityEpithet = deity.epithet,
            decreeLine = lexicon.decreeLine(deity.name, position.zodiacSign.signName),
            placementText = placementText,
            houseMeaning = HouseMeanings.get(position.house),
            planetPosition = position,
        )
    }
}
