package com.astra.antiqua.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.glyphs.deityGlyph
import com.astra.antiqua.ui.glyphs.glyphDeityName
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.accentFor

/**
 * One deity glyph, drawn beside the body it names.
 *
 * The glyph is the culture's own: Egypt's Mars is not Rome's, and the five
 * hands are what tell them apart at this size (docs/design/deity-glyphs).
 * The vectors paint black and take their colour from the tint, so a received
 * body carries the culture accent and the rest the bone ink from one set.
 *
 * With no culture chosen this draws nothing at all. A glyph belongs to a
 * theology, so there is no neutral one to fall back to, and a wrong glyph
 * beside a body would be worse than none; the caller shows the classical
 * name instead. The web surface can fall back to the Unicode sign there
 * because it has one in hand, and Android has no planet symbol table.
 */
@Composable
fun DeityGlyph(
    body: Planet,
    culture: AncientCulture?,
    modifier: Modifier = Modifier,
    size: Dp = 16.dp,
    tint: Color = if (culture == null) {
        Bone
    } else if (body.isReceived) {
        accentFor(culture)
    } else {
        Bone
    },
) {
    if (culture == null) return
    Icon(
        imageVector = deityGlyph(culture, body),
        contentDescription = glyphDeityName(culture, body),
        modifier = modifier.size(size),
        tint = tint,
    )
}
