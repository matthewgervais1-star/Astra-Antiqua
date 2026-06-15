package com.astra.antiqua.ui.components

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.astra.antiqua.ui.theme.CardBackground
import com.astra.antiqua.ui.theme.GlassBackground
import com.astra.antiqua.ui.theme.GlassBorder

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val blurModifier = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        Modifier.blur(20.dp)
    } else {
        Modifier
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .then(blurModifier)
            .background(CardBackground) // Base dark grounding
            .background(GlassBackground) // Ultra-thin frosted overlay
            .border(0.5.dp, GlassBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        content()
    }
}
