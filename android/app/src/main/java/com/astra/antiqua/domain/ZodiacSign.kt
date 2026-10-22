package com.astra.antiqua.domain

/**
 * [abbr] is the three-letter label every sign column and shorthand prints:
 * web's /charts placements table (`SIGN_ABBR3` in
 * web/src/components/charts/chartFormat.ts), pinned by ZodiacSignAbbrTest.
 */
enum class ZodiacSign(val signName: String, val abbr: String) {
    ARIES("Aries", "ARI"), TAURUS("Taurus", "TAU"), GEMINI("Gemini", "GEM"), CANCER("Cancer", "CNC"),
    LEO("Leo", "LEO"), VIRGO("Virgo", "VIR"), LIBRA("Libra", "LIB"), SCORPIO("Scorpio", "SCO"),
    SAGITTARIUS("Sagittarius", "SAG"), CAPRICORN("Capricorn", "CAP"), AQUARIUS("Aquarius", "AQR"),
    PISCES("Pisces", "PSC"),
}
