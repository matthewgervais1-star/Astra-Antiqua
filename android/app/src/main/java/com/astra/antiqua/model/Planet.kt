package com.astra.antiqua.model

import kotlinx.serialization.Serializable

@Serializable
enum class ClassicalPlanet {
    SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN
}

data class PlanetPosition(
    val planet: ClassicalPlanet,
    val degree: Float // 0-360
)
