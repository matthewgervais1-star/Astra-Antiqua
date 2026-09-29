package com.astra.antiqua.domain

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
        if (span.transitPlanet == com.astra.antiqua.model.Planet.JUPITER) {
            SpanTone.EASE
        } else {
            SpanTone.TENSION
        }
}
