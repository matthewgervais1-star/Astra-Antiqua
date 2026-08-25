package com.astra.antiqua.domain

/**
 * The composed, culture-masked reading for one placement on the dashboard --
 * the replacement for `OracleContent` / `assets/oracle_decrees.json`'s
 * per-(planet, sign, culture) records.
 *
 * Nothing here is authored per placement. [deityName] and [deityEpithet] come
 * from `model/DeityRegistry` (canonical per culture x planet), [decreeLine]
 * is composed at render time from the deity and the sign via
 * `CulturalLexicon.decreeLine`, [placementText] is the universal paragraph
 * from `shared/content/planet-in-sign.json` (the same one culture-independent
 * text for every pantheon), and [houseMeaning] is the universal house
 * meaning. See `NatalReadingComposer.compose` for how these are assembled.
 *
 * `epitheton` existed on every one of the 420 old decree records and was
 * rendered by no screen. It does not survive as a field here: the epithet
 * now lives only on `Deity` (DeityRegistry), read directly from there by
 * whatever surfaces it in a later phase, rather than carried through every
 * composed reading unused.
 */
data class NatalPlacementReading(
    val deityName: String,
    val deityEpithet: String,
    val decreeLine: String,
    val placementText: String,
    val houseMeaning: HouseMeaning,
    val planetPosition: AccuratePlanetPosition,
)
