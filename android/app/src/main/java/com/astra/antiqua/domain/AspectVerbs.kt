package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture

/**
 * The phrase that joins two deity names into a sentence: "Iuppiter {verb}
 * Saturnus". Ported verbatim from web/src/data/aspectVerbs.ts so the same
 * transit reads the same on both surfaces.
 *
 * Each verb has to read as a sentence a person wrote, with any pair of names
 * either side of it. That is why these are authored per culture rather than
 * derived from the aspect's name.
 */
object AspectVerbs {
    fun of(culture: AncientCulture, aspect: AspectType): String = when (culture) {
        AncientCulture.EGYPT -> when (aspect) {
            AspectType.CONJUNCTION -> "joins the barque of"
            AspectType.SEXTILE -> "offers a steady hand to"
            AspectType.SQUARE -> "tips the scales against"
            AspectType.TRINE -> "rows in time with"
            AspectType.OPPOSITION -> "stands across the river from"
        }

        AncientCulture.GREECE -> when (aspect) {
            AspectType.CONJUNCTION -> "stands shoulder to shoulder with"
            AspectType.SEXTILE -> "offers fair counsel to"
            AspectType.SQUARE -> "challenges"
            AspectType.TRINE -> "moves in accord with"
            AspectType.OPPOSITION -> "stands across the agora from"
        }

        AncientCulture.CANAAN -> when (aspect) {
            AspectType.CONJUNCTION -> "shares the council seat with"
            AspectType.SEXTILE -> "exchanges tribute with"
            AspectType.SQUARE -> "draws the bow against"
            AspectType.TRINE -> "speaks favor over"
            AspectType.OPPOSITION -> "convenes the council against"
        }

        AncientCulture.CARTHAGE -> when (aspect) {
            AspectType.CONJUNCTION -> "sails under one banner with"
            AspectType.SEXTILE -> "trades safe passage with"
            AspectType.SQUARE -> "raises a hand against"
            AspectType.TRINE -> "lights the harbor for"
            AspectType.OPPOSITION -> "demands a price of"
        }

        AncientCulture.ROME -> when (aspect) {
            AspectType.CONJUNCTION -> "marches under the same eagle as"
            AspectType.SEXTILE -> "offers a treaty to"
            AspectType.SQUARE -> "raises the spear against"
            AspectType.TRINE -> "clasps the right hand of"
            AspectType.OPPOSITION -> "stands across the forum from"
        }
    }
}

/**
 * A span's tone. Trine and sextile read as ease, square and opposition as
 * tension. A conjunction is ease only for Jupiter, the one slow body whose
 * union is traditionally a gift; a union with Saturn or an outer is a
 * pressure rather than a favour. Mirrors spanTone in
 * web/src/components/transits/spanDisplay.ts.
 */
enum class SpanTone { EASE, TENSION }

fun spanTone(span: TransitSpan): SpanTone = when (span.aspect) {
    AspectType.TRINE, AspectType.SEXTILE -> SpanTone.EASE
    AspectType.SQUARE, AspectType.OPPOSITION -> SpanTone.TENSION
    AspectType.CONJUNCTION ->
        if (span.transitPlanet == com.astra.antiqua.model.ClassicalPlanet.JUPITER) {
            SpanTone.EASE
        } else {
            SpanTone.TENSION
        }
}
