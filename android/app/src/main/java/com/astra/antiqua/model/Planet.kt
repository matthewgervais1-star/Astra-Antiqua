package com.astra.antiqua.model

import kotlinx.serialization.Serializable

/**
 * The ten bodies this almanac reads.
 *
 * Seven are the classical planets every one of the five cultures actually
 * watched. Uranus, Neptune and Pluto are RECEIVED: no ancient culture knew
 * them, so they are admitted the way Rome admitted foreign gods, formally and
 * under native names. [isReceived] exists so every surface that shows one can
 * say so; the method page states the extension plainly, and nothing in this
 * app may present a reception as ancient.
 */
@Serializable
enum class Planet(val isReceived: Boolean = false) {
    SUN,
    MOON,
    MERCURY,
    VENUS,
    MARS,
    JUPITER,
    SATURN,
    URANUS(isReceived = true),
    NEPTUNE(isReceived = true),
    PLUTO(isReceived = true)
}
