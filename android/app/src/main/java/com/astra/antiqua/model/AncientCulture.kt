package com.astra.antiqua.model

enum class AncientCulture {
    EGYPT, GREECE, CANAAN, CARTHAGE, ROME
}

/**
 * The culture's name as it is printed to a reader: "Egypt", not "EGYPT".
 *
 * The enum constant is the storage form and it shouts, which is right for a
 * key and wrong in a sentence. Copy that the design system sets in caps is
 * uppercased at the call site, so the two decisions stay separate: this is
 * the name, and caps is a typographic choice about one line of it. Mirrors
 * CULTURE_LABELS in web/src/data/cultures.ts.
 */
val AncientCulture.label: String
    get() = name.lowercase().replaceFirstChar { it.uppercase() }
