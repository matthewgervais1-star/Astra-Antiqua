package com.astra.antiqua.data

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.Deity

object DeityManager {
    fun getDeity(planet: ClassicalPlanet, culture: AncientCulture): Deity {
        return when (culture) {
            AncientCulture.CARTHAGE -> when (planet) {
                ClassicalPlanet.SUN -> Deity("Semes", "The Solar Disk")
                ClassicalPlanet.MOON -> Deity("Tanit", "The Face of Baal")
                ClassicalPlanet.MERCURY -> Deity("Sakun", "The Guardian")
                ClassicalPlanet.VENUS -> Deity("Astarte", "The Queen of Heaven")
                ClassicalPlanet.MARS -> Deity("Melqart", "The King of the City")
                ClassicalPlanet.JUPITER -> Deity("Baal Hammon", "Lord of the Altar")
                ClassicalPlanet.SATURN -> Deity("Baal Hammon", "Master of Time")
            }
            AncientCulture.EGYPT -> when (planet) {
                ClassicalPlanet.SUN -> Deity("Ra", "The manifest spark of creation")
                ClassicalPlanet.MOON -> Deity("Khonsu", "The Lunar Traveler")
                ClassicalPlanet.MERCURY -> Deity("Sebegu", "The Erratic Set-God")
                ClassicalPlanet.VENUS -> Deity("Isis", "Mistress of Life")
                ClassicalPlanet.MARS -> Deity("Horus the Red", "Commander of the Red")
                ClassicalPlanet.JUPITER -> Deity("Amun", "The Hidden King")
                ClassicalPlanet.SATURN -> Deity("Geb", "The Earth God")
            }
            AncientCulture.GREECE -> when (planet) {
                ClassicalPlanet.SUN -> Deity("Helios", "The Radiant King")
                ClassicalPlanet.MOON -> Deity("Selene", "The Lunar Meadow")
                ClassicalPlanet.MERCURY -> Deity("Hermes", "The Messenger")
                ClassicalPlanet.VENUS -> Deity("Aphrodite", "The Rose")
                ClassicalPlanet.MARS -> Deity("Ares", "The Warrior")
                ClassicalPlanet.JUPITER -> Deity("Zeus", "The Thunderer")
                ClassicalPlanet.SATURN -> Deity("Cronus", "The Chronos")
            }
            AncientCulture.CANAAN -> when (planet) {
                ClassicalPlanet.SUN -> Deity("Shapash", "The Divine Torch")
                ClassicalPlanet.MOON -> Deity("Yarikh", "The Crescent Lord")
                ClassicalPlanet.MERCURY -> Deity("Kothar-wa-Khasis", "The Divine Architect")
                ClassicalPlanet.VENUS -> Deity("Astarte", "The Morning Star")
                ClassicalPlanet.MARS -> Deity("Resheph", "The Plague Lord")
                ClassicalPlanet.JUPITER -> Deity("Baal Hadad", "The Prince of Earth")
                ClassicalPlanet.SATURN -> Deity("El", "The Father of Years")
            }
        }
    }

    fun getOracleTitle(culture: AncientCulture): String {
        return when (culture) {
            AncientCulture.EGYPT -> "The Hall of Ma'at"
            AncientCulture.GREECE -> "The Oracle of Delphi"
            AncientCulture.CANAAN -> "The Divine Council"
            AncientCulture.CARTHAGE -> "The Decree of the Tophet"
        }
    }
}
