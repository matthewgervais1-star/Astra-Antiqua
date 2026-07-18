package com.astra.antiqua.data

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.Deity
import com.astra.antiqua.model.DeityRegistry

object DeityManager {
    fun getDeity(planet: ClassicalPlanet, culture: AncientCulture): Deity {
        return DeityRegistry.getDeity(culture, planet)
    }

    fun getOracleTitle(culture: AncientCulture): String {
        return when (culture) {
            AncientCulture.EGYPT -> "The Hall of Ma'at"
            AncientCulture.GREECE -> "The Oracle of Delphi"
            AncientCulture.CANAAN -> "The Divine Council"
            AncientCulture.CARTHAGE -> "The Decree of the Tophet"
            AncientCulture.ROME -> "The Auspices of the Capitoline"
        }
    }
}
