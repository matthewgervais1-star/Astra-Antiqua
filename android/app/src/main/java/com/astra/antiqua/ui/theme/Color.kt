package com.astra.antiqua.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * "The Instrument in the Temple" palette, shared with the web surface
 * (docs/design/handoff/tokens.css, web/src/app/globals.css).
 *
 * One flat ground and one muted accent per culture. No gradients, no glass,
 * no glow: the incised 1px rule is the only ornament this identity allows.
 */

// Grounds. Neutral is for the places no culture is presumed.
val GroundNeutral = Color(0xFF171310)
val GroundEgypt = Color(0xFF1A1712)
val GroundGreece = Color(0xFF171A1C)
val GroundCanaan = Color(0xFF1A1813)
val GroundCarthage = Color(0xFF191218)
val GroundRome = Color(0xFF1B1410)

// Accents, one muted metal each.
val AccentEgypt = Color(0xFFB59A55)
val AccentGreece = Color(0xFF7C93A6)
val AccentCanaan = Color(0xFF8A9268)
val AccentCarthage = Color(0xFF94648C)
val AccentRome = Color(0xFFA5544A)

// Inks.
val Bone = Color(0xFFE6DECC)
val Prose = Color(0xFFD9D1BF)
val Dim = Color(0xFF9A917D)
val FaintInk = Color(0xFF6F6B60)

// Signals. Conflict also carries retrograde and destructive actions.
val Harmony = Color(0xFFB59A55)
val Conflict = Color(0xFFB56B71)

// Rules: 1px only, at two weights. Opaque, as the design system gives them:
// Rule is --rule-hairline, RuleRow is --rule-incised (tokens/colors.css).
val Rule = Color(0xFF4A3E28)
val RuleRow = Color(0xFF2A241C)
