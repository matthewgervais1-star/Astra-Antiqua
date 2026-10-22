package com.astra.antiqua.model

enum class AppPhase {
    ENGINE_WARMUP,
    CULTURE_SELECTION,
    ONBOARDING,
    MAIN_DASHBOARD;

    companion object {
        /** The fade MainActivity runs between phases; the picker's names wait it out before they resolve. */
        const val FADE_MILLIS = 400
    }
}
