package com.astra.antiqua.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.brand.cultureEmblem
import com.astra.antiqua.ui.brand.emblemName
import com.astra.antiqua.ui.theme.Bone

/**
 * The mark a culture is known by: the wedjat, Athena's owl, the Ugaritic name
 * of El, the sign of Tanit, the aquila.
 *
 * docs/design/culture-marks.md puts these at tier 2, the in-app emblem, and
 * says they belong where a label stands beside them, so the famous mark is
 * read as the right mark. That is why this takes a decorative flag: in a list
 * or on a doorway head the culture's name is already printed next to it, and
 * a screen reader should hear that name once rather than twice.
 *
 * The vector paints black and takes its colour from the tint, so the caller
 * decides whether the mark carries the culture accent or the bone ink. The
 * accent marks the active culture, so a list of five accents only the chosen
 * one; a screen that IS one culture may carry its mark in the accent.
 */
@Composable
fun CultureEmblem(
    culture: AncientCulture,
    modifier: Modifier = Modifier,
    size: Dp = 20.dp,
    tint: Color = Bone,
    decorative: Boolean = true,
) {
    Icon(
        imageVector = cultureEmblem(culture),
        contentDescription = if (decorative) {
            null
        } else {
            "${emblemName(culture)}, the mark of ${culture.label}"
        },
        modifier = modifier.size(size),
        tint = tint,
    )
}
