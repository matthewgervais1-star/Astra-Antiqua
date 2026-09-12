package com.astra.antiqua.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.ui.brand.monogramVector
import com.astra.antiqua.ui.brand.wordmarkVector
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.LocalAccent

/**
 * The horizontal lockup, drawn rather than typed.
 *
 * [capHeight] is the height the capitals stand, so the mark can be set beside
 * type at a matching size. The cap band is the A's ink, 102.25 of the mark's
 * 132 viewport units: its flat apex puts the top of the stroke at the band's
 * top, and the butt caps on the slanted legs end 2.25 units below the
 * baseline. The Q's tail reaches past the band and is not part of it.
 */
@Composable
fun Wordmark(
    modifier: Modifier = Modifier,
    capHeight: Dp = 14.dp,
    ink: Color = Bone,
) {
    Image(
        imageVector = wordmarkVector(ink),
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = modifier
            .height(capHeight * (132f / 102.25f))
            .semantics { contentDescription = "Astra Antiqua" },
    )
}

/**
 * The monogram: two A's as a ruined temple front, the one mark in this
 * product that is ours rather than drawn from the record.
 *
 * The crossbar is the architrave and takes the active culture's accent, which
 * is what the design system asks of it wherever it is wired into the app; the
 * letters stay bone. [height] is the whole mark, tail included, since nothing
 * is set beside it.
 */
@Composable
fun Monogram(
    modifier: Modifier = Modifier,
    height: Dp = 48.dp,
    ink: Color = Bone,
    architrave: Color = LocalAccent.current,
) {
    Image(
        imageVector = monogramVector(ink, architrave),
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = modifier
            .height(height)
            .semantics { contentDescription = "Astra Antiqua" },
    )
}
