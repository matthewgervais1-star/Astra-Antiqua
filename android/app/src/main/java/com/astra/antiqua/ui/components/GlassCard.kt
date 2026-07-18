package com.astra.antiqua.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.astra.antiqua.ui.theme.CardBackground
import com.astra.antiqua.ui.theme.GlassBackground
import com.astra.antiqua.ui.theme.GlassBorder

/**
 * Frosted-glass card. Compose has no backdrop blur (Modifier.blur blurs the
 * card's own CONTENT, which made every card's text illegible on Android 12+),
 * so the glass look comes from the layered translucent fills and hairline
 * border, matching the web's GlassPanel aesthetic.
 */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(CardBackground) // Base dark grounding
            .background(GlassBackground) // Ultra-thin frosted overlay
            .border(0.5.dp, GlassBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        content()
    }
}
